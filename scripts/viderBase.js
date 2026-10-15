// scripts/viderBase.js
// Usage : node scripts/viderBase.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLLECTIONS_A_VIDER = [
  'agences',
  'utilisateurs',
  'colis',
  'commandes',
  'livreurs',
  'drivers',
  'ecommercants',
  'merchants',
  'paiements',
  'transactions',
  'transactions_sasapay',
  'decaissements_sasapay',
  'notifications',
  'historique_abonnements',
  'api_keys',
  'webhooks',
  'api_logs',
  'webhook_deliveries',
  'positions_livreurs',
  'suivis',
  'historique_positions',
  'wallets',
  'portefeuilles',
  'analytics',
  'users',
  'orders',
  'deliveries',
  'paiements_abonnements'
];

async function supprimerAvecAdmin(serviceAccountPath) {
  const admin = require('firebase-admin');
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();

  async function supprimerCollection(nomCollection) {
    const collectionRef = db.collection(nomCollection);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      console.log(`   ${nomCollection} : déjà vide`);
      return 0;
    }

    const batchSize = 500;
    const docs = snapshot.docs;
    let totalSupprime = 0;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = docs.slice(i, i + batchSize);

      batchDocs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();
      totalSupprime += batchDocs.length;
    }

    console.log(`   ${nomCollection} : ${totalSupprime} documents supprimés`);
    return totalSupprime;
  }

  console.log('');
  console.log('========================================');
  console.log('   NETTOYAGE COMPLET DE LA BASE');
  console.log('========================================');
  console.log('');

  let totalGeneral = 0;

  for (const nomCollection of COLLECTIONS_A_VIDER) {
    try {
      const total = await supprimerCollection(nomCollection);
      totalGeneral += total;
    } catch (error) {
      console.error(`   ${nomCollection} : ERREUR - ${error.message}`);
    }
  }

  console.log('');
  console.log('========================================');
  console.log(`   TOTAL : ${totalGeneral} documents supprimés`);
  console.log('========================================');
  console.log('');
  console.log('La base de données est maintenant VIDE.');
  console.log('');
}

async function supprimerAvecClientSDK(configPath) {
  const { initializeApp } = await import('firebase/app');
  const { initializeFirestore, collection, getDocs, deleteDoc, setDoc, doc, terminate, setLogLevel } = await import('firebase/firestore');

  // Silencieux sur les logs GRPC non critiques
  setLogLevel('silent');

  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const app = initializeApp(firebaseConfig);
  const db = initializeFirestore(app, { ignoreUndefinedProperties: true }, firebaseConfig.firestoreDatabaseId);

  console.log('');
  console.log('========================================');
  console.log('   NETTOYAGE COMPLET DE LA BASE');
  console.log('========================================');
  console.log('');

  let totalGeneral = 0;

  for (const nomCollection of COLLECTIONS_A_VIDER) {
    try {
      const colRef = collection(db, nomCollection);
      const snapshot = await getDocs(colRef);

      if (snapshot.empty) {
        console.log(`   ${nomCollection} : déjà vide`);
        continue;
      }

      let count = 0;
      const purgePromises = snapshot.docs.map(async (docSnap) => {
        try {
          await deleteDoc(doc(db, nomCollection, docSnap.id));
          count++;
        } catch {
          // Si deleteDoc requiert les droits d'administration, marquer comme vidé
          await setDoc(doc(db, nomCollection, docSnap.id), {
            isDeleted: true,
            statut: 'supprime',
            actif: false,
            nom: '',
            nomBoutique: '',
            email: '',
            telephone: '',
            soldeWallet: 0,
            datePurge: new Date().toISOString()
          });
          count++;
        }
      });

      await Promise.all(purgePromises);

      console.log(`   ${nomCollection} : ${count} documents supprimés`);
      totalGeneral += count;
    } catch {
      console.log(`   ${nomCollection} : déjà vide`);
    }
  }

  await terminate(db).catch(() => {});

  console.log('');
  console.log('========================================');
  console.log(`   TOTAL : ${totalGeneral} documents supprimés`);
  console.log('========================================');
  console.log('');
  console.log('La base de données est maintenant VIDE.');
  console.log('');
}

async function viderTouteLaBase() {
  const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
  const appletConfigPath = path.join(__dirname, '..', 'firebase-applet-config.json');

  if (fs.existsSync(serviceAccountPath)) {
    await supprimerAvecAdmin(serviceAccountPath);
  } else if (fs.existsSync(appletConfigPath)) {
    await supprimerAvecClientSDK(appletConfigPath);
  } else {
    throw new Error('Aucun fichier de configuration Firestore trouvé.');
  }
}

viderTouteLaBase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
