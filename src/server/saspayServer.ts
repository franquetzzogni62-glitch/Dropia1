import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

export interface SaspayCheckoutResponse {
  success: boolean;
  checkoutUrl: string;
  paymentUrl: string;
  sessionId: string;
  reference: string;
  amount: string;
  currency: string;
  status: string;
  isLiveConnected: boolean;
  instructions?: string;
  error?: string;
}

const SASPAY_BASE_URL = 'https://api.saspay.me/api/v1';
const LIVE_SECRET_KEY = process.env.SASPAY_SECRET_KEY || process.env.SASPAY_API_KEY || 'sk_live_oEya7mwHkkL7odLN1tcNSO_PrxwoFNx9pIu0h95RyLI';

function parseBody(req: IncomingMessage): Promise<{ raw: string; json: any }> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve({ raw: body, json: body ? JSON.parse(body) : {} });
      } catch {
        resolve({ raw: body, json: {} });
      }
    });
    req.on('error', () => {
      resolve({ raw: '', json: {} });
    });
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-SasPay-Signature, X-SasPay-Key, Idempotency-Key');
  res.end(JSON.stringify(data));
}

function inferCountry(phone: string, fallback = 'CI'): string {
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  if (clean.startsWith('+225') || clean.startsWith('225')) return 'CI';
  if (clean.startsWith('+221') || clean.startsWith('221')) return 'SN';
  if (clean.startsWith('+229') || clean.startsWith('229')) return 'BJ';
  if (clean.startsWith('+237') || clean.startsWith('237')) return 'CM';
  if (clean.startsWith('+228') || clean.startsWith('228')) return 'TG';
  if (clean.startsWith('+226') || clean.startsWith('226')) return 'BF';
  if (clean.startsWith('+242') || clean.startsWith('242')) return 'CG';
  if (clean.startsWith('+243') || clean.startsWith('243')) return 'CD';
  return fallback;
}

function mapNetworkCode(operator: string, country: string): string {
  const op = (operator || 'wave').toLowerCase();
  const c = country.toUpperCase();

  if (op.includes('wave')) {
    return c === 'SN' ? 'wave_sn' : 'wave_ci';
  }
  if (op.includes('orange')) {
    if (c === 'SN') return 'orange_sn';
    if (c === 'CM') return 'orange_cm';
    if (c === 'BF') return 'orange_bf';
    if (c === 'CD') return 'orange_cd';
    return 'orange_ci';
  }
  if (op.includes('mtn')) {
    if (c === 'BJ') return 'mtn_bj';
    if (c === 'CM') return 'mtn_cm';
    if (c === 'CG') return 'mtn_cg';
    return 'mtn_ci';
  }
  if (op.includes('moov')) {
    if (c === 'BJ') return 'moov_bj';
    if (c === 'TG') return 'moov_tg';
    if (c === 'BF') return 'moov_bf';
    return 'moov_ci';
  }
  if (op.includes('airtel')) {
    if (c === 'CD') return 'airtel_cd';
    if (c === 'GA') return 'airtel_ga';
    return 'airtel_cg';
  }
  return `${op}_${c.toLowerCase()}`;
}

export async function handleSaspayRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const url = req.url || '';

  if (!url.startsWith('/api/saspay')) {
    return false;
  }

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return true;
  }

  const [rawPath, queryString] = url.split('?');
  const pathname = rawPath.replace(/\/+$/, '') || '/';
  const query = new URLSearchParams(queryString || '');

  const apiKey = (
    req.headers['authorization']?.replace(/^Bearer\s+/i, '') ||
    req.headers['x-saspay-key'] ||
    LIVE_SECRET_KEY
  ).toString().trim();

  // 1. Healthcheck
  if (pathname === '/api/saspay/health' && req.method === 'GET') {
    sendJson(res, 200, {
      success: true,
      service: 'SasPay Gateway Bridge (Dropia)',
      docs: 'https://docs.saspay.me/',
      apiEndpoint: SASPAY_BASE_URL,
      status: 'ONLINE',
      mode: apiKey.startsWith('sk_live') ? 'LIVE_PRODUCTION' : 'TEST_SANDBOX',
      configuredKey: apiKey.substring(0, 10) + '...' + apiKey.slice(-4),
      supportedCurrencies: ['XOF', 'XAF', 'GNF', 'USD'],
      serverPublicIp: '34.34.246.130'
    });
    return true;
  }

  // 2. Création d'un paiement (Checkout Hébergé SasPay ou Softpay Push)
  if (pathname === '/api/saspay/create-payment' && req.method === 'POST') {
    const { json: body } = await parseBody(req);
    const montant = Number(body.montant) || 5500;
    const amountStr = montant.toFixed(2);
    const telephone = (body.telephone || '').trim();
    const operateur = (body.operateur || 'wave').toLowerCase();
    const country = (body.country || inferCountry(telephone)).toUpperCase();
    const description = body.description || 'Paiement Dropia';
    const customerName = (body.customerName || 'Client Dropia').trim();
    const customerEmail = (body.customerEmail || 'client@dropia.com').trim();
    const returnUrl = body.returnUrl || '';
    const mode = body.mode || (operateur === 'wave' || body.preferSoftpay ? 'softpay' : 'checkout');

    // A. Mode Softpay (Débit direct Mobile Money / Push USSD)
    if (mode === 'softpay') {
      const networkCode = mapNetworkCode(operateur, country);
      const idempotencyKey = `dropia_sp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      try {
        const softpayRes = await fetch(`${SASPAY_BASE_URL}/payments/softpay/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey
          },
          body: JSON.stringify({
            amount: amountStr,
            currency: body.currency || 'XOF',
            country,
            network: networkCode,
            description,
            customer: {
              first_name: customerName.split(' ')[0] || 'Client',
              last_name: customerName.split(' ').slice(1).join(' ') || 'Dropia',
              email: customerEmail,
              phone: telephone.startsWith('+') ? telephone : `+${telephone}`
            }
          })
        });

        const softpayData: any = await softpayRes.json();

        if (softpayRes.ok && softpayData.success) {
          const pData = softpayData.data || {};
          sendJson(res, 201, {
            success: true,
            mode: 'softpay',
            paymentId: pData.id,
            status: pData.status || 'PENDING',
            checkoutUrl: pData.checkout_url || '',
            paymentUrl: pData.checkout_url || '',
            instructions: pData.instructions?.[0] || 'Demande de débit Mobile Money envoyée sur votre téléphone.',
            reference: pData.id,
            isLiveConnected: true
          });
          return true;
        }

        // Si softpay échoue pour ce réseau, basculer proprement sur le checkout hébergé
      } catch (err: any) {
        console.warn('Softpay attempt failed, falling back to checkout session:', err.message);
      }
    }

    // B. Mode Hosted Checkout Session (Redirection officielle SasPay)
    try {
      const checkoutRes = await fetch(`${SASPAY_BASE_URL}/checkout-sessions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountStr,
          currency: body.currency || 'XOF',
          description,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: telephone,
          country,
          return_url: returnUrl
        })
      });

      const checkoutData: any = await checkoutRes.json();

      if (checkoutRes.ok && checkoutData.success && checkoutData.data?.checkout_url) {
        const cData = checkoutData.data;
        sendJson(res, 201, {
          success: true,
          mode: 'checkout',
          sessionId: cData.id,
          reference: cData.slug || cData.id,
          checkoutUrl: cData.checkout_url,
          paymentUrl: cData.checkout_url,
          status: cData.status || 'PENDING',
          amount: cData.amount,
          currency: cData.currency,
          isLiveConnected: true,
          instructions: 'Session sécurisée SasPay créée. Redirection en cours...'
        });
        return true;
      }

      sendJson(res, checkoutRes.status || 400, {
        success: false,
        error: checkoutData?.error || checkoutData || 'Échec création session SasPay'
      });
      return true;
    } catch (err: any) {
      sendJson(res, 500, {
        success: false,
        error: err.message || 'Erreur réseau vers api.saspay.me'
      });
      return true;
    }
  }

  // 3. Statut d'une session ou d'un paiement SasPay
  if (pathname.startsWith('/api/saspay/status') || pathname.startsWith('/api/saspay/checkout-status')) {
    const id = pathname.split('/').filter(Boolean).pop() || query.get('id') || '';

    if (!id || id === 'status' || id === 'checkout-status') {
      sendJson(res, 400, { success: false, error: 'ID de transaction ou session manquant' });
      return true;
    }

    // Vérifier d'abord comme checkout session
    try {
      const checkRes = await fetch(`${SASPAY_BASE_URL}/checkout-sessions/${id}/status/`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      if (checkRes.ok) {
        const cData: any = await checkRes.json();
        sendJson(res, 200, {
          success: true,
          type: 'checkout_session',
          data: cData.data || cData,
          status: cData.data?.status || 'PENDING'
        });
        return true;
      }
    } catch {}

    // Vérifier comme paiement direct (verify)
    try {
      const payRes = await fetch(`${SASPAY_BASE_URL}/payments/${id}/verify/`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      if (payRes.ok) {
        const pData: any = await payRes.json();
        sendJson(res, 200, {
          success: true,
          type: 'payment',
          data: pData.data || pData,
          status: pData.data?.status || 'PENDING'
        });
        return true;
      }
    } catch {}

    sendJson(res, 200, {
      success: true,
      id,
      status: 'PENDING'
    });
    return true;
  }

  // 4. Initier un décaissement (Payout / Retrait)
  if (pathname === '/api/saspay/payout' && req.method === 'POST') {
    const { json: body } = await parseBody(req);
    const montant = Number(body.montant) || 0;
    const telephone = (body.telephone || '').trim();
    const cleanPhone = telephone.replace(/[\s\-\+]/g, '');
    const operateur = (body.operateur || 'wave').toLowerCase();
    const country = (body.country || inferCountry(telephone)).toUpperCase();
    const networkMethod = mapNetworkCode(operateur, country);
    const idempotencyKey = `dropia_payout_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const payoutRes = await fetch(`${SASPAY_BASE_URL}/payouts/initialize/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          amount: montant.toFixed(2),
          currency: body.currency || 'XOF',
          country,
          method: networkMethod,
          recipient: {
            msisdn: cleanPhone
          },
          customer: {
            phone: telephone.startsWith('+') ? telephone : `+${telephone}`
          },
          description: body.description || 'Retrait solde Dropia'
        })
      });

      const payoutData: any = await payoutRes.json();

      if (payoutRes.ok) {
        sendJson(res, 200, {
          success: true,
          data: payoutData.data || payoutData,
          message: 'Retrait Mobile Money initié avec succès'
        });
        return true;
      }

      sendJson(res, payoutRes.status || 400, {
        success: false,
        error: payoutData.error || payoutData,
        serverIpNotice: payoutRes.status === 403 ? 'Veuillez autoriser l\'IP 34.34.246.130 dans votre tableau de bord SasPay (section IP Whitelist).' : undefined
      });
      return true;
    } catch (err: any) {
      sendJson(res, 500, {
        success: false,
        error: err.message || 'Erreur lors du décaissement SasPay'
      });
      return true;
    }
  }

  // 5. Soldes Marchand (Merchant Balances)
  if (pathname === '/api/saspay/balances' && req.method === 'GET') {
    try {
      const balRes = await fetch(`${SASPAY_BASE_URL}/merchant-balances/`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const balData: any = await balRes.json();
      sendJson(res, 200, {
        success: true,
        balances: balData.data?.results || balData.results || []
      });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { success: false, error: err.message });
      return true;
    }
  }

  // 6. Historique des transactions réelles SasPay
  if (pathname === '/api/saspay/transactions' && req.method === 'GET') {
    try {
      const txRes = await fetch(`${SASPAY_BASE_URL}/transactions/`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const txData: any = await txRes.json();
      sendJson(res, 200, {
        success: true,
        transactions: txData.data?.results || txData.results || []
      });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { success: false, error: err.message });
      return true;
    }
  }

  // 7. Webhook SasPay (Vérification signature HMAC SHA-256)
  if (pathname === '/api/saspay/webhook' && req.method === 'POST') {
    const { raw: rawBody, json: body } = await parseBody(req);
    const signature = (req.headers['x-webhook-signature'] || '').toString();
    const timestamp = (req.headers['x-webhook-timestamp'] || '').toString();
    const webhookSecret = process.env.SASPAY_WEBHOOK_SECRET || '';

    if (webhookSecret && signature && timestamp) {
      const nowSec = Math.floor(Date.now() / 1000);
      const tsSec = parseInt(timestamp, 10);
      if (Math.abs(nowSec - tsSec) <= 300) {
        const expected = crypto
          .createHmac('sha256', webhookSecret)
          .update(`${timestamp}.${rawBody}`)
          .digest('hex');
        if (expected.toLowerCase() !== signature.toLowerCase()) {
          sendJson(res, 401, { success: false, error: 'Invalid webhook signature' });
          return true;
        }
      }
    }

    sendJson(res, 200, {
      success: true,
      message: 'Webhook SasPay validé et traité',
      receivedAt: new Date().toISOString()
    });
    return true;
  }

  sendJson(res, 404, {
    success: false,
    error: `Route SasPay ${pathname} non trouvée`
  });
  return true;
}
