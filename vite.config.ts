import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

/**
 * Plugin serveur pour les routes API REST v1 & Webhooks Dropia (dev server uniquement).
 * Autonome et sans import de ./src pour garantir un bundling sans erreur de vite.config.ts.
 */
/**
 * Plugin serveur pour les routes API REST v1 & Webhooks Dropia.
 */
function dropiaRestApiPlugin(): Plugin {
  const handler = (req: any, res: any, next: any) => {
    const url = req.url || '';
    if (!url.startsWith('/api/v1')) {
      return next();
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const [pathname] = url.split('?');

    if (pathname === '/api/v1/auth/api-key/verify') {
      res.statusCode = 200;
      res.end(JSON.stringify({
        valide: true,
        agence: 'Dropia Dakar Hub',
        cle: 'dp_live_8f3a981240184bba',
        permissions: ['colis:write', 'colis:read', 'webhooks:listen'],
        timestamp: new Date().toISOString()
      }));
      return;
    }

    if (pathname === '/api/v1/webhooks/dispatch') {
      res.statusCode = 200;
      res.end(JSON.stringify({
        succes: true,
        evenement: 'colis.livre',
        livreur: 'Moussa Diop',
        statut: 'DELIVERED',
        recuParWebhook: true
      }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({
      succes: true,
      message: 'Dropia REST API v1 Online',
      route: pathname
    }));
  };

  return {
    name: 'dropia-rest-api-server',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    }
  };
}

/**
 * Plugin serveur pour les routes API SasPay.
 */
function saspayApiPlugin(): Plugin {
  const transactionsStore = new Map<string, any>();
  const SASPAY_BASE = 'https://api.saspay.me/api/v1';
  const LIVE_KEY = process.env.SASPAY_SECRET_KEY || process.env.SASPAY_API_KEY || 'sk_live_oEya7mwHkkL7odLN1tcNSO_PrxwoFNx9pIu0h95RyLI';

  const parseJsonBody = (req: any): Promise<any> => {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
      req.on('error', () => resolve({}));
    });
  };

  const inferCountry = (phone: string, fallback = 'CI'): string => {
    const clean = (phone || '').replace(/[\s\-\(\)]/g, '');
    if (clean.startsWith('+225') || clean.startsWith('225')) return 'CI';
    if (clean.startsWith('+221') || clean.startsWith('221')) return 'SN';
    if (clean.startsWith('+229') || clean.startsWith('229')) return 'BJ';
    if (clean.startsWith('+237') || clean.startsWith('237')) return 'CM';
    if (clean.startsWith('+228') || clean.startsWith('228')) return 'TG';
    if (clean.startsWith('+226') || clean.startsWith('226')) return 'BF';
    if (clean.startsWith('+242') || clean.startsWith('242')) return 'CG';
    if (clean.startsWith('+243') || clean.startsWith('243')) return 'CD';
    return fallback;
  };

  const mapNetworkCode = (operator: string, country: string): string => {
    const op = (operator || 'wave').toLowerCase();
    const c = country.toUpperCase();
    if (op.includes('wave')) return c === 'SN' ? 'wave_sn' : 'wave_ci';
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
  };

  const handler = async (req: any, res: any, next: any) => {
    const url = req.url || '';
    if (!url.startsWith('/api/saspay')) {
      return next();
    }

    try {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-SasPay-Key, Idempotency-Key');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      const [rawPath, queryString] = url.split('?');
      const pathname = rawPath.replace(/\/+$/, '') || '/';
      const searchParams = new URLSearchParams(queryString || '');

      const apiKey = (
        req.headers['authorization']?.replace(/^Bearer\s+/i, '') ||
        req.headers['x-saspay-key'] ||
        LIVE_KEY
      ).toString().trim();

      // 1. Healthcheck
      if (pathname === '/api/saspay/health') {
        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          service: 'SasPay Gateway Bridge (Dropia)',
          docs: 'https://docs.saspay.me/',
          apiEndpoint: SASPAY_BASE,
          status: 'ONLINE',
          mode: apiKey.startsWith('sk_live') ? 'LIVE_PRODUCTION' : 'TEST_SANDBOX',
          serverPublicIp: '34.34.246.130'
        }));
        return;
      }

      // 2. Encaissement : Création session de paiement (Checkout SasPay hébergé ou Softpay push)
      if (pathname === '/api/saspay/create-payment') {
        const body = await parseJsonBody(req);
        const montant = Number(body.montant) || 5500;
        const amountStr = montant.toFixed(2);
        const telephone = (body.telephone || '').trim();
        const operateur = (body.operateur || 'wave').toLowerCase();
        const country = (body.country || inferCountry(telephone)).toUpperCase();
        const description = body.description || 'Paiement Dropia';
        const customerName = (body.customerName || 'Client Dropia').trim();
        const customerEmail = (body.customerEmail || 'client@dropia.com').trim();
        const returnUrl = body.returnUrl || '';
        const mode = body.mode || (body.preferSoftpay && operateur === 'wave' ? 'softpay' : 'checkout');

        // Flux A: Softpay (Push direct si demandé)
        if (mode === 'softpay') {
          try {
            const network = mapNetworkCode(operateur, country);
            const softRes = await fetch(`${SASPAY_BASE}/payments/softpay/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Idempotency-Key': `sp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
              },
              body: JSON.stringify({
                amount: amountStr,
                currency: body.currency || 'XOF',
                country,
                network,
                description,
                customer: {
                  first_name: customerName.split(' ')[0] || 'Client',
                  last_name: customerName.split(' ').slice(1).join(' ') || 'Dropia',
                  email: customerEmail,
                  phone: telephone.startsWith('+') ? telephone : `+${telephone}`
                }
              })
            });

            const softData: any = await softRes.json();
            if (softRes.ok && softData.success) {
              const sData = softData.data || {};
              res.statusCode = 201;
              res.end(JSON.stringify({
                success: true,
                mode: 'softpay',
                paymentId: sData.id,
                reference: sData.id,
                checkoutUrl: sData.checkout_url || '',
                paymentUrl: sData.checkout_url || '',
                status: sData.status || 'PENDING',
                isLiveConnected: true,
                instructions: sData.instructions?.[0] || 'Demande de débit Mobile Money envoyée sur votre téléphone.'
              }));
              return;
            }
          } catch (err: any) {
            console.warn('Softpay error, falling back to checkout session:', err.message);
          }
        }

        // Flux B: Checkout hébergé officiel SasPay (supporte Wave, Orange, MTN, Moov, Carte)
        try {
          const checkoutRes = await fetch(`${SASPAY_BASE}/checkout-sessions/`, {
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
            const record = {
              id: cData.id,
              reference: cData.slug || cData.id,
              montant,
              devise: cData.currency || 'XOF',
              telephone,
              operateur,
              statut: cData.status || 'PENDING',
              paymentUrl: cData.checkout_url,
              isLiveConnected: true,
              dateCreation: new Date().toISOString()
            };
            transactionsStore.set(cData.id, record);

            res.statusCode = 201;
            res.end(JSON.stringify({
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
              instructions: 'Redirection vers la passerelle sécurisée SasPay...'
            }));
            return;
          }

          res.statusCode = checkoutRes.status || 400;
          res.end(JSON.stringify({
            success: false,
            error: checkoutData.error || checkoutData || 'Échec d\'initialisation SasPay'
          }));
          return;
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({
            success: false,
            error: err.message || 'Erreur réseau vers SasPay'
          }));
          return;
        }
      }

      // 3. Statut d'un paiement ou d'une session
      if (pathname.startsWith('/api/saspay/status') || pathname.startsWith('/api/saspay/checkout-status')) {
        const id = pathname.split('/').filter(Boolean).pop() || searchParams.get('id') || '';

        if (!id || id === 'status' || id === 'checkout-status') {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: 'ID manquant' }));
          return;
        }

        // Interroger SasPay checkout-sessions
        try {
          const checkRes = await fetch(`${SASPAY_BASE}/checkout-sessions/${id}/status/`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          if (checkRes.ok) {
            const cData: any = await checkRes.json();
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              type: 'checkout_session',
              status: cData.data?.status || 'PENDING',
              data: cData.data || cData
            }));
            return;
          }
        } catch {}

        // Interroger SasPay payments verify
        try {
          const payRes = await fetch(`${SASPAY_BASE}/payments/${id}/verify/`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          if (payRes.ok) {
            const pData: any = await payRes.json();
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              type: 'payment',
              status: pData.data?.status || 'PENDING',
              data: pData.data || pData
            }));
            return;
          }
        } catch {}

        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          status: 'PENDING',
          id
        }));
        return;
      }

      // 4. Décaissement (Payouts / Retrait vers Mobile Money)
      if (pathname === '/api/saspay/payout') {
        const body = await parseJsonBody(req);
        const montant = Number(body.montant) || 0;
        const telephone = (body.telephone || '').trim();
        const cleanPhone = telephone.replace(/[\s\-\+]/g, '');
        const operateur = (body.operateur || 'wave').toLowerCase();
        const country = (body.country || inferCountry(telephone)).toUpperCase();
        const network = mapNetworkCode(operateur, country);

        try {
          const payoutRes = await fetch(`${SASPAY_BASE}/payouts/initialize/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'Idempotency-Key': `payout_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
            },
            body: JSON.stringify({
              amount: montant.toFixed(2),
              currency: body.currency || 'XOF',
              country,
              method: network,
              recipient: { msisdn: cleanPhone },
              customer: { phone: telephone.startsWith('+') ? telephone : `+${telephone}` },
              description: body.description || 'Retrait solde Dropia'
            })
          });

          const payoutData: any = await payoutRes.json();
          if (payoutRes.ok) {
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              data: payoutData.data || payoutData,
              message: 'Retrait Mobile Money initié avec succès'
            }));
            return;
          }

          res.statusCode = payoutRes.status || 400;
          res.end(JSON.stringify({
            success: false,
            error: payoutData.error || payoutData,
            serverIpNotice: payoutRes.status === 403
              ? 'Veuillez autoriser l\'IP 34.34.246.130 dans votre tableau de bord SasPay (IP Whitelist).'
              : undefined
          }));
          return;
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
          return;
        }
      }

      // 5. Soldes Marchand en direct
      if (pathname === '/api/saspay/balances') {
        try {
          const balRes = await fetch(`${SASPAY_BASE}/merchant-balances/`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          const balData: any = await balRes.json();
          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            balances: balData.data?.results || balData.results || []
          }));
          return;
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
          return;
        }
      }

      // 6. Liste des transactions réelles SasPay
      if (pathname === '/api/saspay/transactions') {
        try {
          const txRes = await fetch(`${SASPAY_BASE}/transactions/`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          const txData: any = await txRes.json();
          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            transactions: txData.data?.results || txData.results || []
          }));
          return;
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
          return;
        }
      }

      // 7. Webhook SasPay
      if (pathname === '/api/saspay/webhook') {
        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          message: 'Webhook SasPay traité avec succès'
        }));
        return;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, route: pathname }));
    } catch (err: any) {
      res.statusCode = 500;
      res.end(JSON.stringify({
        success: false,
        error: err.message || 'Erreur interne API SasPay'
      }));
    }
  };

  return {
    name: 'saspay-api-server',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), saspayApiPlugin(), dropiaRestApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
