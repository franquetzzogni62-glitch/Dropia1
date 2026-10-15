import type { IncomingMessage, ServerResponse } from 'http';

interface SaspayTransaction {
  id: string;
  orderId: string;
  montant: number;
  devise: string;
  telephone: string;
  operateur: 'wave' | 'orange' | 'mtn' | 'moov';
  statut: 'PENDING' | 'SUCCESS' | 'FAILED';
  dateCreation: string;
  dateConfirmation?: string;
  description: string;
  referenceSaspay: string;
}

const transactionsSaspayStore: Map<string, SaspayTransaction> = new Map([
  [
    'sas_tx_9012',
    {
      id: 'sas_tx_9012',
      orderId: 'DP-CI-849201',
      montant: 28500,
      devise: 'XOF',
      telephone: '+2250708123456',
      operateur: 'wave',
      statut: 'SUCCESS',
      dateCreation: new Date(Date.now() - 3600000 * 3).toISOString(),
      dateConfirmation: new Date(Date.now() - 3600000 * 2).toISOString(),
      description: 'Paiement COD Colis Wax & Chic',
      referenceSaspay: 'SAS-WAVE-89312891'
    }
  ],
  [
    'sas_tx_9013',
    {
      id: 'sas_tx_9013',
      orderId: 'ABONNEMENT-STARTER-400',
      montant: 15000,
      devise: 'XOF',
      telephone: '+2250544991122',
      operateur: 'orange',
      statut: 'SUCCESS',
      dateCreation: new Date(Date.now() - 3600000 * 24).toISOString(),
      dateConfirmation: new Date(Date.now() - 3600000 * 24 + 120000).toISOString(),
      description: 'Abonnement SaaS Agence Starter',
      referenceSaspay: 'SAS-OM-38291044'
    }
  ]
]);

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-SasPay-Signature');
  res.end(JSON.stringify(data));
}

/**
 * Gestionnaire des routes API SasPay (https://docs.saspay.me/)
 * Sécurise l'exécution côté serveur pour les flux Mobile Money en Afrique de l'Ouest
 */
export async function handleSaspayRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const url = req.url || '';

  // Intercepter uniquement les routes /api/saspay/*
  if (!url.startsWith('/api/saspay')) {
    return false;
  }

  // Pre-flight CORS
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return true;
  }

  const [path] = url.split('?');

  // 1. Healthcheck SasPay
  if (path === '/api/saspay/health' && req.method === 'GET') {
    sendJson(res, 200, {
      success: true,
      service: 'SasPay Gateway Bridge (Dropia)',
      version: '2.1.0',
      status: 'ONLINE',
      supportedOperators: ['wave', 'orange', 'mtn', 'moov'],
      currency: 'XOF',
      configured: true
    });
    return true;
  }

  // 2. Initialisation d'un paiement Mobile Money: POST /api/saspay/create-payment
  if (path === '/api/saspay/create-payment' && req.method === 'POST') {
    const body = await parseBody(req);

    if (!body.montant || !body.telephone || !body.operateur) {
      sendJson(res, 400, {
        success: false,
        error: 'Champs obligatoires manquants: montant, telephone, operateur'
      });
      return true;
    }

    const txId = `sas_tx_${Math.floor(1000 + Math.random() * 9000)}`;
    const refSas = `SAS-${body.operateur.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newTx: SaspayTransaction = {
      id: txId,
      orderId: body.orderId || `ORD-${Date.now()}`,
      montant: Number(body.montant),
      devise: 'XOF',
      telephone: body.telephone,
      operateur: body.operateur,
      statut: 'PENDING',
      dateCreation: new Date().toISOString(),
      description: body.description || 'Paiement Dropia Mobile Money',
      referenceSaspay: refSas
    };

    transactionsSaspayStore.set(txId, newTx);

    // Simulate direct OTP or instant push for demo
    sendJson(res, 201, {
      success: true,
      transactionId: txId,
      reference: refSas,
      montant: newTx.montant,
      devise: 'XOF',
      operateur: newTx.operateur,
      statut: 'PENDING',
      paymentUrl: `https://checkout.saspay.me/pay/${refSas}`,
      instructions: `Un prompt USSD/Push a été envoyé au numéro ${newTx.telephone} sur le réseau ${newTx.operateur.toUpperCase()}.`
    });
    return true;
  }

  // 3. Statut d'une transaction: GET /api/saspay/status/:id
  if (path.startsWith('/api/saspay/status/') && req.method === 'GET') {
    const txId = path.replace('/api/saspay/status/', '').trim();
    const tx = transactionsSaspayStore.get(txId);

    if (!tx) {
      sendJson(res, 404, {
        success: false,
        error: `Transaction non trouvée pour l'ID: ${txId}`
      });
      return true;
    }

    sendJson(res, 200, {
      success: true,
      transaction: tx
    });
    return true;
  }

  // 4. Confirmation ou Webhook SasPay: POST /api/saspay/webhook
  if (path === '/api/saspay/webhook' && req.method === 'POST') {
    const body = await parseBody(req);
    const txId = body.transaction_id || body.id;

    if (txId && transactionsSaspayStore.has(txId)) {
      const existing = transactionsSaspayStore.get(txId)!;
      existing.statut = body.status === 'FAILED' ? 'FAILED' : 'SUCCESS';
      existing.dateConfirmation = new Date().toISOString();
      transactionsSaspayStore.set(txId, existing);
    }

    sendJson(res, 200, {
      success: true,
      message: 'Webhook SasPay traité avec succès',
      receivedAt: new Date().toISOString()
    });
    return true;
  }

  // 5. Liste des transactions: GET /api/saspay/transactions
  if (path === '/api/saspay/transactions' && req.method === 'GET') {
    const list = Array.from(transactionsSaspayStore.values());
    sendJson(res, 200, {
      success: true,
      count: list.length,
      transactions: list
    });
    return true;
  }

  sendJson(res, 404, {
    success: false,
    error: `Route SasPay ${path} non trouvée`
  });
  return true;
}
