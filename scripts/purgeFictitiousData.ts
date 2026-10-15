import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);
const auth = getAuth(app);

const collectionsToPurge = [
  'orders',
  'colis',
  'agences',
  'ecommercants',
  'livreurs',
  'transactions',
  'api_keys',
  'webhooks',
  'webhook_logs',
  'merchants',
  'agencies',
  'drivers',
  'paiements_abonnements'
];

async function purgeAll() {
  console.log('--- PURGE DE TOUTES LES DONNEES FICTIVES DE LA BASE DE DONNEES ---');
  try {
    const cred = await signInAnonymously(auth);
    console.log('Connecté avec UID anonyme pour nettoyage:', cred.user.uid);
  } catch (authErr: any) {
    console.log('Authentification anonyme non requise ou échouée:', authErr.message);
  }
  let totalDeleted = 0;

  for (const colName of collectionsToPurge) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      console.log(`Collection "${colName}": ${snapshot.size} documents trouvés.`);
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, colName, d.id));
        totalDeleted++;
      }
      if (snapshot.size > 0) {
        console.log(`  -> Tous les documents de "${colName}" ont été supprimés avec succès.`);
      }
    } catch (err: any) {
      console.warn(`Erreur lors du nettoyage de "${colName}":`, err.message);
    }
  }

  console.log(`\n✅ Nettoyage terminé ! Total documents supprimés : ${totalDeleted}`);
  console.log('Base de données réinitialisée à 0 et prête pour la production réelle.');
  process.exit(0);
}

purgeAll().catch((err) => {
  console.error('Erreur purge:', err);
  process.exit(1);
});
