/**
 * Client SasPay officiel (docs.saspay.me)
 * Gestion directe et résiliente des sessions de paiement hébergées SasPay Checkout.
 * Compatible développement local (proxy vite) et hébergement production (Hostinger, Vercel, Firebase).
 */

export const SASPAY_LIVE_KEY =
  (typeof process !== 'undefined' && (process.env?.SASPAY_SECRET_KEY || process.env?.SASPAY_API_KEY)) ||
  'sk_live_oEya7mwHkkL7odLN1tcNSO_PrxwoFNx9pIu0h95RyLI';

export const SASPAY_API_BASE = 'https://api.saspay.me/api/v1';

export interface CreateSaspaySessionParams {
  amount: number;
  currency?: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl: string;
  metadata?: Record<string, any>;
}

export interface SaspaySessionResult {
  success: boolean;
  checkoutUrl: string;
  sessionId: string;
  reference?: string;
  error?: string;
}

export class SaspayClientService {
  /**
   * Création d'une session de paiement sur le portail hébergé officiel SasPay (checkout.saspay.me)
   */
  static async createCheckoutSession(params: CreateSaspaySessionParams): Promise<SaspaySessionResult> {
    const formattedAmount = Number(params.amount).toFixed(2);
    const currency = params.currency || 'XOF';
    const customerName = params.customerName?.trim() || 'Client Dropia';
    const customerEmail = params.customerEmail?.trim() || 'contact@dropia.com';

    // 1. Essai prioritaire via le proxy local /api/saspay/create-payment
    try {
      const proxyRes = await fetch('/api/saspay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          montant: Number(params.amount),
          currency,
          description: params.description,
          customerName,
          customerEmail,
          customerPhone: params.customerPhone || '',
          returnUrl: params.returnUrl,
          mode: 'checkout',
          metadata: params.metadata
        })
      });

      const contentType = proxyRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await proxyRes.json();
        if (json && json.success && json.checkoutUrl) {
          return {
            success: true,
            checkoutUrl: json.checkoutUrl,
            sessionId: json.sessionId || json.reference || '',
            reference: json.reference
          };
        }
      }
    } catch {
      // Le proxy local n'est pas joignable (ex: hébergement statique Hostinger).
      // On bascule automatiquement sur l'API directe SasPay avec CORS activé.
    }

    // 2. Appel direct et officiel à l'API SasPay (POST /api/v1/checkout-sessions/)
    try {
      const directRes = await fetch(`${SASPAY_API_BASE}/checkout-sessions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SASPAY_LIVE_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          amount: formattedAmount,
          currency,
          description: params.description,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: params.customerPhone || '',
          return_url: params.returnUrl,
          metadata: params.metadata || {}
        })
      });

      const directJson = await directRes.json();
      if (directRes.ok && directJson && directJson.data && directJson.data.checkout_url) {
        return {
          success: true,
          checkoutUrl: directJson.data.checkout_url,
          sessionId: directJson.data.id,
          reference: directJson.data.slug
        };
      }

      const errMsg =
        directJson?.error?.message ||
        (typeof directJson?.error === 'string' ? directJson.error : '') ||
        JSON.stringify(directJson?.error || 'Erreur SasPay');
      return {
        success: false,
        checkoutUrl: '',
        sessionId: '',
        error: errMsg
      };
    } catch (err: any) {
      return {
        success: false,
        checkoutUrl: '',
        sessionId: '',
        error: err?.message || 'Erreur réseau lors de la communication avec SasPay.'
      };
    }
  }

  /**
   * Vérification du statut d'une session de paiement SasPay
   */
  static async checkStatus(sessionId: string): Promise<{ success: boolean; status: string; raw?: any }> {
    if (!sessionId) return { success: false, status: 'UNKNOWN' };

    // 1. Essai via le proxy
    try {
      const res = await fetch(`/api/saspay/checkout-status?sessionId=${encodeURIComponent(sessionId)}`);
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (json && json.status) {
          return { success: true, status: json.status, raw: json };
        }
      }
    } catch {
      // Ignorer et passer au direct
    }

    // 2. Essai direct via l'API SasPay
    try {
      const res = await fetch(`${SASPAY_API_BASE}/checkout-sessions/${sessionId}/status/`, {
        headers: {
          'Authorization': `Bearer ${SASPAY_LIVE_KEY}`,
          'Accept': 'application/json'
        }
      });
      const json = await res.json();
      if (json && json.data && json.data.status) {
        return { success: true, status: json.data.status, raw: json.data };
      }
    } catch {
      // Ignorer
    }

    return { success: false, status: 'UNKNOWN' };
  }
}
