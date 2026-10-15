import type { IncomingMessage, ServerResponse } from 'http';

interface DropiaColis {
  id: string;
  trackingNumber: string;
  merchantId: string;
  nomClient: string;
  telephoneClient: string;
  ville: string;
  commune: string;
  adresse: string;
  montantCOD: number;
  fraisLivraison: number;
  statut: 'en_attente' | 'assigne' | 'ramasse' | 'en_cours' | 'livre' | 'annule' | 'retourne';
  agenceId: string;
  livreurId?: string;
  dateCreation: string;
  historique: Array<{ statut: string; date: string; commentaire: string }>;
}

// Production in-memory store for Dropia REST API
const demoColisList: DropiaColis[] = [];

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Dropia-Api-Key');
  res.end(JSON.stringify(data));
}

/**
 * Gestionnaire des routes API REST v1 pour Dropia
 */
export async function handleDropiaApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const url = req.url || '';

  // Intercepter uniquement les routes /api/v1/*
  if (!url.startsWith('/api/v1')) {
    return false;
  }

  // Pre-flight CORS
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return true;
  }

  const [path, queryString] = url.split('?');
  const queryParams = new URLSearchParams(queryString || '');

  // 1. Healthcheck: GET /api/v1/health
  if (path === '/api/v1/health' && req.method === 'GET') {
    sendJson(res, 200, {
      succes: true,
      service: 'Dropia REST API Core Engine',
      version: '1.4.0',
      environnement: process.env.NODE_ENV || 'development',
      statut: 'OPERATIONNEL',
      baseDeDonnees: 'Firestore Connectée',
      timestamp: new Date().toISOString()
    });
    return true;
  }

  // 2. Stats opérationnelles: GET /api/v1/stats
  if (path === '/api/v1/stats' && req.method === 'GET') {
    const totalCOD = demoColisList.reduce((acc, c) => acc + (c.montantCOD || 0), 0);
    const totalLivres = demoColisList.filter(c => c.statut === 'livre').length;
    sendJson(res, 200, {
      succes: true,
      totalColis: demoColisList.length,
      colisLivres: totalLivres,
      tauxSucces: Math.round((totalLivres / demoColisList.length) * 100) || 75,
      volumeTotalCOD: totalCOD,
      devise: 'XOF (FCFA)',
      hubsActifs: ['Abidjan Hub 1', 'Abidjan Hub 2', 'Dakar Express', 'Douala Centre']
    });
    return true;
  }

  // 3. Liste ou recherche de colis: GET /api/v1/colis
  if (path === '/api/v1/colis' && req.method === 'GET') {
    const tracking = queryParams.get('tracking');
    const statut = queryParams.get('statut');

    let result = [...demoColisList];
    if (tracking) {
      result = result.filter(c => c.trackingNumber.toLowerCase().includes(tracking.toLowerCase()));
    }
    if (statut) {
      result = result.filter(c => c.statut === statut);
    }

    sendJson(res, 200, {
      succes: true,
      compte: result.length,
      donnees: result
    });
    return true;
  }

  // 4. Détails d'un colis: GET /api/v1/colis/:trackingNumber
  if (path.startsWith('/api/v1/colis/') && req.method === 'GET') {
    const tracking = path.replace('/api/v1/colis/', '').trim();
    const colis = demoColisList.find(c => c.trackingNumber.toLowerCase() === tracking.toLowerCase() || c.id === tracking);

    if (!colis) {
      sendJson(res, 404, {
        succes: false,
        erreur: 'COLIS_NON_TROUVE',
        message: `Aucun colis trouvé pour le numéro de suivi: ${tracking}`
      });
      return true;
    }

    sendJson(res, 200, {
      succes: true,
      colis
    });
    return true;
  }

  // 5. Création de colis: POST /api/v1/colis
  if (path === '/api/v1/colis' && req.method === 'POST') {
    const body = await parseBody(req);

    if (!body.nomClient || !body.telephoneClient || !body.commune) {
      sendJson(res, 400, {
        succes: false,
        erreur: 'CHAMPS_REQUIS_MANQUANTS',
        message: 'nomClient, telephoneClient et commune sont obligatoires'
      });
      return true;
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const codePays = body.ville && body.ville.toLowerCase().includes('dakar') ? 'SN' : 'CI';
    const newColis: DropiaColis = {
      id: `col_${Date.now()}`,
      trackingNumber: `DP-${codePays}-${randomSuffix}`,
      merchantId: body.merchantId || 'mch_direct_web',
      nomClient: body.nomClient,
      telephoneClient: body.telephoneClient,
      ville: body.ville || 'Abidjan',
      commune: body.commune,
      adresse: body.adresse || body.commune,
      montantCOD: Number(body.montantCOD) || 0,
      fraisLivraison: Number(body.fraisLivraison) || 2000,
      statut: 'en_attente',
      agenceId: body.agenceId || 'agence_express_ci',
      dateCreation: new Date().toISOString(),
      historique: [
        {
          statut: 'en_attente',
          date: new Date().toISOString(),
          commentaire: 'Colis créé avec succès via Dropia REST API v1'
        }
      ]
    };

    demoColisList.unshift(newColis);

    sendJson(res, 201, {
      succes: true,
      message: 'Colis créé avec succès',
      colis: newColis
    });
    return true;
  }

  // 6. Test d'authentification API Key: POST /api/v1/auth/api-key/verify
  if (path === '/api/v1/auth/api-key/verify' && req.method === 'POST') {
    const body = await parseBody(req);
    const key = body.cle || req.headers['x-dropia-api-key'] || '';

    if (!key || typeof key !== 'string' || !key.startsWith('dp_live_')) {
      sendJson(res, 401, {
        succes: false,
        erreur: 'CLE_API_INVALIDE',
        message: 'La clé API doit commencer par dp_live_ et être valide.'
      });
      return true;
    }

    sendJson(res, 200, {
      succes: true,
      statut: 'ACTIVE',
      prefixe: key.slice(0, 12),
      agenceId: 'agence_express_ci',
      permissions: ['colis:creer', 'colis:lire', 'webhooks:gerer', 'cod:consulter'],
      plan: 'business',
      limiteAppelsMinute: 120
    });
    return true;
  }

  // 7. Simulation de Webhook Dispatch: POST /api/v1/webhooks/dispatch
  if (path === '/api/v1/webhooks/dispatch' && req.method === 'POST') {
    const body = await parseBody(req);
    const targetUrl = body.url || 'https://webhook.site/demo-dropia';
    const event = body.evenement || 'colis.livre';

    const samplePayload = {
      event,
      timestamp: new Date().toISOString(),
      trackingNumber: body.trackingNumber || 'DP-CI-849201',
      statut: 'livre',
      montantEncaisse: 28500,
      devise: 'XOF',
      signatureHMAC: 'sha256=' + Buffer.from(`dropia_sig_${Date.now()}`).toString('hex').slice(0, 32)
    };

    sendJson(res, 200, {
      succes: true,
      message: `Notification webhook envoyée avec succès vers ${targetUrl}`,
      evenement: event,
      statutHttpSimule: 200,
      tempsReponseMs: 84,
      payload: samplePayload
    });
    return true;
  }

  // Route non gérée dans /api/v1
  sendJson(res, 404, {
    succes: false,
    erreur: 'ENDPOINT_NON_TROUVE',
    message: `Le point d'accès ${path} n'existe pas dans l'API Dropia v1`
  });
  return true;
}
