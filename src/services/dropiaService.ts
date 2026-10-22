import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import type {
  Agence,
  Ecommercant,
  Livreur,
  Colis,
  TransactionFinanciere,
  ApiKeyItem,
  WebhookConfig,
  UserProfile
} from '../types';

/**
 * Nettoie récursivement un objet pour Firestore en supprimant toute propriété ayant la valeur `undefined`.
 * Empêche l'erreur critique Firestore: "Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        cleaned[key] = sanitizeForFirestore(val);
      } else {
        cleaned[key] = val;
      }
    }
  }
  return cleaned;
}

export class DropiaDatabaseService {
  /**
   * Normalise un document Firestore en objet Colis complet et typé
   */
  static normalizeColis(docId: string, data: any): Colis {
    const rawStatut = data.statut || data.status;
    let statut: Colis['statut'] = 'en_attente';
    if (rawStatut === 'delivered' || rawStatut === 'livre') statut = 'livre';
    else if (rawStatut === 'in_transit' || rawStatut === 'en_cours') statut = 'en_cours';
    else if (rawStatut === 'picked_up' || rawStatut === 'ramasse') statut = 'ramasse';
    else if (rawStatut === 'assigned' || rawStatut === 'assigne') statut = 'assigne';
    else if (rawStatut === 'cancelled' || rawStatut === 'annule') statut = 'annule';
    else if (rawStatut === 'returned' || rawStatut === 'retourne') statut = 'retourne';

    return {
      id: docId,
      trackingNumber: String(data.trackingNumber || data.tracking || docId),
      agenceId: String(data.agenceId || data.assignedAgencyId || ''),
      merchantId: String(data.merchantId || ''),
      nomBoutique: String(data.nomBoutique || ''),
      livreurId: String(data.livreurId || data.assignedDriverId || ''),
      nomLivreur: String(data.nomLivreur || ''),
      nomClient: String(data.nomClient || data.customerName || 'Client'),
      telephoneClient: String(data.telephoneClient || data.customerPhone || ''),
      ville: String(data.ville || 'Dakar'),
      commune: String(data.commune || data.deliveryAddress || 'Dakar'),
      adresse: String(data.adresse || data.deliveryAddress || ''),
      montantCOD: Number(data.montantCOD ?? data.amountCOD ?? 0) || 0,
      fraisLivraison: Number(data.fraisLivraison ?? data.deliveryFee ?? 2000) || 2000,
      statut,
      codeOTP: String(data.codeOTP || data.deliveryOtp || '0000'),
      signatureUrl: data.signatureUrl || data.podSignatureUrl || '',
      notes: String(data.notes || ''),
      dateCreation: String(data.dateCreation || data.createdAt || new Date().toISOString()),
      historique: Array.isArray(data.historique) ? data.historique : []
    };
  }

  /**
   * Abonnement temps réel aux commandes (orders) réelles
   */
  static subscribeColis(callback: (colis: Colis[]) => void, onError?: (err: any) => void) {
    const q = query(collection(db, 'orders'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Colis[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && !data.isDeleted && data.statut !== 'supprime') {
            items.push(DropiaDatabaseService.normalizeColis(docSnap.id, data));
          }
        });
        callback(items);
      },
      (error) => {
        console.warn('Subscription orders notice:', error);
        onError?.(error);
      }
    );
  }

  /**
   * Abonnement temps réel aux livreurs réels de la flotte
   */
  static subscribeLivreurs(callback: (livreurs: Livreur[]) => void, onError?: (err: any) => void) {
    const q = query(collection(db, 'livreurs'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Livreur[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && !data.isDeleted && data.statut !== 'supprime' && data.actif !== false) {
            items.push({
              id: docSnap.id,
              agenceId: data.agenceId || '',
              nom: data.nom || data.name || 'Livreur',
              telephone: data.telephone || data.phone || '',
              pin: data.pin || '0000',
              zone: data.zone || data.currentZone || 'Dakar',
              vehicule: data.vehicule || data.vehicleType || 'moto',
              immatriculation: data.immatriculation || data.vehiclePlate || 'SN-DK',
              actif: true,
              colisEnCours: Number(data.colisEnCours || data.todayDeliveries || 0),
              tauxReussite: Number(data.tauxReussite || 100),
              soldeCollecteAujourdhui: Number(data.soldeCollecteAujourdhui || data.cashInHand || 0),
              dateCreation: data.dateCreation || new Date().toISOString()
            });
          }
        });
        callback(items);
      },
      (error) => {
        console.warn('Subscription livreurs notice:', error);
        onError?.(error);
      }
    );
  }

  /**
   * Abonnement temps réel aux transactions financières
   */
  static subscribeTransactions(callback: (transactions: TransactionFinanciere[]) => void, onError?: (err: any) => void) {
    const q = query(collection(db, 'transactions'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: TransactionFinanciere[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && !data.isDeleted) {
            items.push({
              id: docSnap.id,
              type: data.type || 'rechargement',
              montant: Number(data.montant || 0),
              devise: data.devise || 'XOF',
              destinataireType: data.destinataireType || 'ecommercant',
              destinataireId: data.destinataireId || '',
              referenceColis: data.referenceColis || '',
              referencePaiement: data.referencePaiement || '',
              date: data.date || new Date().toISOString(),
              statut: data.statut || 'complete'
            });
          }
        });
        callback(items);
      },
      (error) => {
        console.warn('Subscription transactions notice:', error);
        onError?.(error);
      }
    );
  }

  /**
   * Crée un nouveau colis dans Firestore
   */
  static async creerColis(nouveauColis: Omit<Colis, 'id'>): Promise<string> {
    try {
      const id = `col_${Date.now()}`;
      const payload: Colis = {
        id,
        ...nouveauColis,
        dateCreation: new Date().toISOString()
      };
      await setDoc(doc(db, 'orders', id), payload);
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
      throw err;
    }
  }

  /**
   * Met à jour le statut d'un colis avec validation OTP ou preuve de livraison
   */
  static async updateColisStatut(
    colisId: string,
    nouveauStatut: Colis['statut'],
    commentaire: string,
    extra?: Partial<Colis>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'orders', colisId);
      const updatePayload: any = {
        statut: nouveauStatut,
        dateMiseAJour: new Date().toISOString(),
        ...extra
      };
      await updateDoc(docRef, updatePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${colisId}`);
    }
  }

  /**
   * Enregistre un livreur avec son code PIN à 4 chiffres
   */
  static async creerLivreur(livreur: Omit<Livreur, 'id' | 'dateCreation'>): Promise<string> {
    try {
      const id = `liv_${Date.now()}`;
      const payload = {
        id,
        ...livreur,
        isDeleted: false,
        statut: 'actif',
        dateCreation: new Date().toISOString()
      };
      await setDoc(doc(db, 'livreurs', id), payload);
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'livreurs');
      throw err;
    }
  }

  /**
   * Enregistre une transaction (rechargement portefeuille, reversement COD)
   */
  static async creerTransaction(tx: Omit<TransactionFinanciere, 'id'>): Promise<string> {
    try {
      const id = `tx_${Date.now()}`;
      const payload = {
        id,
        ...tx,
        date: new Date().toISOString()
      };
      await setDoc(doc(db, 'transactions', id), payload);
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'transactions');
      throw err;
    }
  }

  /**
   * Récupère le profil d'un utilisateur par son uid
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.warn('Error fetching user profile:', err);
      return null;
    }
  }

  /**
   * Sauvegarde ou met à jour le profil utilisateur
   */
  static async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      const sanitized = sanitizeForFirestore(profile);
      await setDoc(doc(db, 'users', profile.uid), sanitized, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`);
      throw err;
    }
  }

  /**
   * Met à jour partiellement le profil utilisateur
   */
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const sanitized = sanitizeForFirestore(updates);
      await setDoc(doc(db, 'users', uid), sanitized, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      throw err;
    }
  }

  /**
   * Récupère la liste de toutes les agences disponibles (pour sélection e-commerçant)
   */
  static async getAgences(): Promise<Agence[]> {
    try {
      const items: Agence[] = [];
      const snap = await getDocs(collection(db, 'agences'));
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        if (d && !d.isDeleted && d.statut !== 'supprime') {
          items.push({
            id: docSnap.id,
            nom: d.nom || d.name || 'Agence Express',
            email: d.email || '',
            telephone: d.telephone || d.phone || '',
            ville: d.ville || d.city || 'Dakar',
            pays: d.pays || 'Sénégal',
            plan: d.plan || 'pro',
            planStatut: d.planStatut || 'actif',
            limiteColis: Number(d.limiteColis || 800),
            colisUtilises: Number(d.colisUtilises || 0),
            limiteLivreurs: Number(d.limiteLivreurs || 5),
            livreursUtilises: Number(d.livreursUtilises || 0),
            dateExpiration: d.dateExpiration || '',
            dateCreation: d.dateCreation || new Date().toISOString()
          });
        }
      });

      // Si la collection agences est vide, regarder aussi les utilisateurs avec role === 'agence'
      if (items.length === 0) {
        const usersSnap = await getDocs(collection(db, 'users'));
        usersSnap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && (d.role === 'agence' || d.role === 'agency')) {
            items.push({
              id: docSnap.id,
              nom: d.nomAgence || d.nom || 'Agence de livraison',
              email: d.email || '',
              telephone: d.telephone || '',
              ville: d.ville || 'Dakar',
              pays: d.pays || 'Sénégal',
              plan: d.plan || 'pro',
              planStatut: d.planStatut || 'actif',
              limiteColis: 800,
              colisUtilises: 0,
              limiteLivreurs: 5,
              livreursUtilises: 0,
              dateExpiration: '',
              dateCreation: d.dateCreation || new Date().toISOString()
            });
          }
        });
      }

      return items;
    } catch (err) {
      console.warn('Error fetching agences:', err);
      return [];
    }
  }

  /**
   * Récupère une agence par son identifiant
   */
  static async getAgenceById(agenceId: string): Promise<Agence | null> {
    try {
      // 1. Chercher dans 'agences'
      const agenceSnap = await getDoc(doc(db, 'agences', agenceId));
      if (agenceSnap.exists()) {
        const d = agenceSnap.data();
        return {
          id: agenceSnap.id,
          nom: d.nom || d.name || 'Agence Partenaire',
          email: d.email || '',
          telephone: d.telephone || d.phone || '',
          ville: d.ville || 'Dakar',
          pays: d.pays || 'Sénégal',
          plan: d.plan || 'pro',
          planStatut: d.planStatut || 'actif',
          limiteColis: Number(d.limiteColis || 800),
          colisUtilises: Number(d.colisUtilises || 0),
          limiteLivreurs: Number(d.limiteLivreurs || 5),
          livreursUtilises: Number(d.livreursUtilises || 0),
          dateExpiration: d.dateExpiration || '',
          dateCreation: d.dateCreation || new Date().toISOString()
        };
      }

      // 2. Chercher dans 'users'
      const userSnap = await getDoc(doc(db, 'users', agenceId));
      if (userSnap.exists()) {
        const d = userSnap.data();
        return {
          id: userSnap.id,
          nom: d.nomAgence || d.nom || 'Agence Partenaire',
          email: d.email || '',
          telephone: d.telephone || '',
          ville: d.ville || 'Dakar',
          pays: d.pays || 'Sénégal',
          plan: d.plan || 'pro',
          planStatut: d.planStatut || 'actif',
          limiteColis: 800,
          colisUtilises: 0,
          limiteLivreurs: 5,
          livreursUtilises: 0,
          dateExpiration: '',
          dateCreation: d.dateCreation || new Date().toISOString()
        };
      }

      return null;
    } catch (err) {
      console.warn('Error getting agence by id:', err);
      return null;
    }
  }

  /**
   * Enregistre un e-commerçant dans la collection 'ecommercants'
   */
  static async creerEcommercant(data: Omit<Ecommercant, 'id'>, uid?: string): Promise<string> {
    try {
      const id = uid || `ecom_${Date.now()}`;
      const payload: Ecommercant = {
        id,
        agenceId: data.agenceId,
        nomBoutique: data.nomBoutique,
        contact: data.contact || data.nomBoutique,
        email: data.email,
        telephone: data.telephone,
        ville: data.ville || 'Dakar',
        statut: data.statut || 'actif',
        commandesTotales: data.commandesTotales || 0,
        soldeCODEnAttente: data.soldeCODEnAttente || 0,
        actif: data.actif ?? true,
        dateCreation: data.dateCreation || new Date().toISOString(),
        dateLiaison: data.dateLiaison || new Date().toISOString()
      };

      const sanitized = sanitizeForFirestore(payload);
      await setDoc(doc(db, 'ecommercants', id), sanitized, { merge: true });
      return id;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `ecommercants/${uid || 'new'}`);
      throw err;
    }
  }

  /**
   * Récupère un e-commerçant par son identifiant
   */
  static async getEcommercantById(ecomId: string): Promise<Ecommercant | null> {
    try {
      const snap = await getDoc(doc(db, 'ecommercants', ecomId));
      if (snap.exists()) {
        const d = snap.data();
        return {
          id: snap.id,
          agenceId: d.agenceId || '',
          nomBoutique: d.nomBoutique || '',
          contact: d.contact || d.nomBoutique || '',
          email: d.email || '',
          telephone: d.telephone || '',
          ville: d.ville || 'Dakar',
          statut: d.statut || 'actif',
          commandesTotales: Number(d.commandesTotales || 0),
          soldeCODEnAttente: Number(d.soldeCODEnAttente || 0),
          actif: d.actif !== false,
          dateCreation: d.dateCreation || new Date().toISOString(),
          dateLiaison: d.dateLiaison || new Date().toISOString()
        };
      }
      return null;
    } catch (err) {
      console.warn('Error fetching ecommercant:', err);
      return null;
    }
  }

  /**
   * Met à jour l'agence liée à un e-commerçant (changement d'agence)
   */
  static async updateEcommercantAgence(ecomId: string, nouvelleAgenceId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'ecommercants', ecomId), {
        agenceId: nouvelleAgenceId,
        dateLiaison: new Date().toISOString(),
        statut: 'en_attente' // L'agence peut valider ou confirmer
      });

      // Mettre aussi à jour le profil user
      await updateDoc(doc(db, 'users', ecomId), {
        agenceId: nouvelleAgenceId
      }).catch(() => {});
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `ecommercants/${ecomId}`);
      throw err;
    }
  }

  /**
   * Met à jour le statut d'un e-commerçant (actif, en_attente, refuse)
   */
  static async updateEcommercantStatut(
    ecomId: string,
    statut: 'actif' | 'en_attente' | 'refuse'
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'ecommercants', ecomId), {
        statut,
        dateMiseAJour: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `ecommercants/${ecomId}`);
      throw err;
    }
  }

  /**
   * Retire / désactive un e-commerçant
   */
  static async retirerEcommercant(ecomId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'ecommercants', ecomId), {
        statut: 'refuse',
        actif: false,
        dateRetrait: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `ecommercants/${ecomId}`);
      throw err;
    }
  }

  /**
   * Souscription en temps réel aux e-commerçants liés à une agence
   */
  static subscribeEcommercantsByAgence(
    agenceId: string,
    callback: (items: Ecommercant[]) => void,
    onError?: (err: any) => void
  ) {
    const q = collection(db, 'ecommercants');
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Ecommercant[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && !d.isDeleted && d.statut !== 'supprime') {
            // Filtrer par agenceId (ou si agenceId correspond)
            if (!agenceId || d.agenceId === agenceId || !d.agenceId) {
              items.push({
                id: docSnap.id,
                agenceId: d.agenceId || '',
                nomBoutique: d.nomBoutique || 'Boutique',
                contact: d.contact || d.nomBoutique || '',
                email: d.email || '',
                telephone: d.telephone || '',
                ville: d.ville || 'Dakar',
                statut: d.statut || 'actif',
                commandesTotales: Number(d.commandesTotales || 0),
                soldeCODEnAttente: Number(d.soldeCODEnAttente || 0),
                actif: d.actif !== false,
                dateCreation: d.dateCreation || new Date().toISOString(),
                dateLiaison: d.dateLiaison || new Date().toISOString()
              });
            }
          }
        });
        callback(items);
      },
      (error) => {
        console.warn('Subscription ecommercants notice:', error);
        onError?.(error);
      }
    );
  }

  /**
   * Souscription générale aux e-commerçants
   */
  static subscribeEcommercants(
    callback: (items: Ecommercant[]) => void,
    onError?: (err: any) => void
  ) {
    const q = collection(db, 'ecommercants');
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Ecommercant[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && !d.isDeleted && d.statut !== 'supprime') {
            items.push({
              id: docSnap.id,
              agenceId: d.agenceId || '',
              nomBoutique: d.nomBoutique || 'Boutique',
              contact: d.contact || d.nomBoutique || '',
              email: d.email || '',
              telephone: d.telephone || '',
              ville: d.ville || 'Dakar',
              statut: d.statut || 'actif',
              commandesTotales: Number(d.commandesTotales || 0),
              soldeCODEnAttente: Number(d.soldeCODEnAttente || 0),
              actif: d.actif !== false,
              dateCreation: d.dateCreation || new Date().toISOString(),
              dateLiaison: d.dateLiaison || new Date().toISOString()
            });
          }
        });
        callback(items);
      },
      (error) => {
        console.warn('Subscription ecommercants notice:', error);
        onError?.(error);
      }
    );
  }

  /**
   * Purge toutes les données fictives des collections Firestore
   */
  static async purgeFictitiousData(): Promise<{ success: boolean; message: string }> {
    try {
      const collectionsToClean = ['orders', 'colis', 'livreurs', 'transactions', 'api_keys', 'webhooks'];
      for (const colName of collectionsToClean) {
        const colRef = collection(db, colName);
        const snap = await getDocs(colRef);
        for (const d of snap.docs) {
          try {
            await deleteDoc(doc(db, colName, d.id));
          } catch {
            await updateDoc(doc(db, colName, d.id), {
              isDeleted: true,
              statut: 'supprime',
              actif: false
            });
          }
        }
      }
      return {
        success: true,
        message: 'Toutes les données fictives ont été purgées avec succès de la base de données.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Erreur lors de la purge'
      };
    }
  }

  /**
   * Met à jour strictement le plan d'abonnement d'une agence ou d'un utilisateur
   */
  static async updatePlanAbonnement(
    targetId: string,
    plan: 'starter' | 'pro' | 'business',
    cycle: 'mensuel' | 'annuel' = 'mensuel'
  ): Promise<{ dateExpiration: string; limiteColis: number; limiteLivreurs: number }> {
    const jours = cycle === 'annuel' ? 365 : 30;
    const dateExpiration = new Date(Date.now() + jours * 24 * 3600 * 1000).toISOString();
    const limiteColis = plan === 'business' ? 10000 : plan === 'pro' ? 2500 : 800;
    const limiteLivreurs = plan === 'business' ? 100 : plan === 'pro' ? 20 : 5;

    const payload = {
      plan,
      planStatut: 'actif' as const,
      planExpireLe: dateExpiration,
      dateExpiration,
      limiteColis,
      limiteLivreurs
    };

    if (targetId) {
      // Mettre à jour dans 'users'
      await updateDoc(doc(db, 'users', targetId), payload).catch(() => {});
      // Mettre à jour dans 'agences'
      await updateDoc(doc(db, 'agences', targetId), payload).catch(() => {});
    }

    return { dateExpiration, limiteColis, limiteLivreurs };
  }
}
