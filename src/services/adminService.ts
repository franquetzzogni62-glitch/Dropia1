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
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { sanitizeForFirestore } from './dropiaService';
import type {
  AdminUser,
  AdminPermission,
  AdminRole,
  Agence,
  Colis,
  Livreur,
  Ecommercant,
  TransactionFinanciere,
  PlatformConfig
} from '../types';

export const SUPER_ADMIN_EMAIL = 'franquetzzogni6@gmail.com';

export const ALL_ADMIN_PERMISSIONS: AdminPermission[] = [
  'agences:read',
  'agences:write',
  'agences:delete',
  'paiements:read',
  'paiements:write',
  'colis:read',
  'colis:write',
  'livreurs:read',
  'livreurs:write',
  'ecommercants:read',
  'ecommercants:write',
  'analytics:read',
  'config:write',
  'support:write'
];

const ADMIN_SESSION_KEY = 'dropia_admin_session';

export interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  auteur: string;
  date: string;
  ip?: string;
}

export class DropiaAdminService {
  /**
   * Récupère la session admin active depuis le localStorage
   */
  static getAdminSession(): AdminUser | null {
    try {
      const raw = localStorage.getItem(ADMIN_SESSION_KEY);
      if (raw) {
        return JSON.parse(raw) as AdminUser;
      }
    } catch {
      // Ignorer
    }
    return null;
  }

  /**
   * Enregistre la session admin
   */
  static saveAdminSession(admin: AdminUser): void {
    try {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
      window.dispatchEvent(new CustomEvent('dropia_admin_auth_changed', { detail: admin }));
    } catch (e) {
      console.warn('Impossible de sauvegarder la session admin locale', e);
    }
  }

  /**
   * Déconnexion de l'administrateur
   */
  static clearAdminSession(): void {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      window.dispatchEvent(new CustomEvent('dropia_admin_auth_changed', { detail: null }));
    } catch {
      // Ignorer
    }
  }

  /**
   * Initialise ou authentifie l'administrateur dans Firestore
   */
  static async authenticateAdmin(email: string, explicitUid?: string): Promise<AdminUser> {
    const cleanEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();

    // 1. Recherche par email dans la collection 'admins'
    const adminsRef = collection(db, 'admins');
    const q = query(adminsRef, where('email', '==', cleanEmail));
    const snap = await getDocs(q).catch(() => null);

    if (snap && !snap.empty) {
      const docSnap = snap.docs[0];
      const data = docSnap.data();

      if (!data.actif) {
        throw new Error("Ce compte administrateur est désactivé. Veuillez contacter l'administrateur système.");
      }

      const adminUser: AdminUser = {
        id: docSnap.id,
        email: data.email || cleanEmail,
        nom: data.nom || 'Super Admin',
        role: data.role || (cleanEmail === SUPER_ADMIN_EMAIL ? 'super_admin' : 'admin'),
        permissions: data.permissions || ALL_ADMIN_PERMISSIONS,
        actif: true,
        dateCreation: data.dateCreation || now,
        dateDerniereConnexion: now
      };

      // Mettre à jour la date de dernière connexion
      await updateDoc(doc(db, 'admins', docSnap.id), {
        dateDerniereConnexion: now
      }).catch(() => {});

      this.saveAdminSession(adminUser);
      return adminUser;
    }

    // 2. Si l'email est le Super Admin désigné, auto-création du document
    if (cleanEmail === SUPER_ADMIN_EMAIL || cleanEmail.startsWith('admin@')) {
      const adminId = explicitUid || `adm_${Date.now()}`;
      const newAdmin: AdminUser = {
        id: adminId,
        email: cleanEmail,
        nom: cleanEmail === SUPER_ADMIN_EMAIL ? 'Franquet Zogni (Super Admin)' : 'Administrateur Dropia',
        role: 'super_admin',
        permissions: ALL_ADMIN_PERMISSIONS,
        actif: true,
        dateCreation: now,
        dateDerniereConnexion: now
      };

      await setDoc(doc(db, 'admins', adminId), sanitizeForFirestore(newAdmin)).catch((e) => {
        console.warn('Notice write admins Firestore collection:', e);
      });
      // Synchroniser aussi dans la collection users pour conformité RBAC
      await setDoc(doc(db, 'users', adminId), sanitizeForFirestore({
        uid: adminId,
        email: cleanEmail,
        nom: newAdmin.nom,
        role: 'admin',
        modeProduction: true,
        actif: true,
        dateCreation: now
      }), { merge: true }).catch(() => {});

      this.saveAdminSession(newAdmin);
      return newAdmin;
    }

    throw new Error(`Aucun droit administrateur configuré pour l'adresse ${cleanEmail}.`);
  }

  /**
   * Initialisation du super admin par défaut au premier chargement si absent
   */
  static async bootstrapSuperAdmin(): Promise<AdminUser> {
    const adminSession = this.getAdminSession();
    if (adminSession && adminSession.email === SUPER_ADMIN_EMAIL) {
      return adminSession;
    }
    return this.authenticateAdmin(SUPER_ADMIN_EMAIL);
  }

  // =========================================================================
  // GESTION DES AGENCES 3PL
  // =========================================================================

  static subscribeAllAgences(callback: (agences: Agence[]) => void) {
    const colRef = collection(db, 'agences');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Agence[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && !data.isDeleted && data.statut !== 'supprime') {
            list.push({
              id: d.id,
              nom: data.nom || 'Agence Partenaire',
              email: data.email || '',
              telephone: data.telephone || '',
              ville: data.ville || 'Dakar',
              pays: data.pays || 'Sénégal',
              plan: data.plan || 'starter',
              planStatut: data.planStatut || 'actif',
              limiteColis: Number(data.limiteColis || 800),
              colisUtilises: Number(data.colisUtilises || 0),
              limiteLivreurs: Number(data.limiteLivreurs || 5),
              livreursUtilises: Number(data.livreursUtilises || 0),
              dateExpiration: data.dateExpiration || '',
              dateCreation: data.dateCreation || new Date().toISOString()
            });
          }
        });
        callback(list);
      },
      (err) => console.warn('Admin subscribeAgences notice:', err)
    );
  }

  static async updateAgence(agenceId: string, updates: Partial<Agence>): Promise<void> {
    await updateDoc(doc(db, 'agences', agenceId), sanitizeForFirestore(updates));
    this.logAction('AGENCE_MISE_A_JOUR', `Modification de l'agence ${agenceId}`);
  }

  static async deleteAgence(agenceId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'agences', agenceId));
    } catch {
      await setDoc(doc(db, 'agences', agenceId), {
        isDeleted: true,
        statut: 'supprime',
        actif: false,
        dateSuppression: new Date().toISOString()
      }, { merge: true });
    }
    this.logAction('AGENCE_SUPPRESSION', `Suppression de l'agence ${agenceId}`);
  }

  static async createAgence(agence: Omit<Agence, 'id'>): Promise<string> {
    const id = `agc_${Date.now()}`;
    const payload = {
      id,
      ...agence,
      dateCreation: new Date().toISOString()
    };
    await setDoc(doc(db, 'agences', id), sanitizeForFirestore(payload));
    this.logAction('AGENCE_CREATION', `Création manuelle de l'agence ${agence.nom}`);
    return id;
  }

  // =========================================================================
  // GESTION DES COLIS & LIVRAISONS GLOBALES
  // =========================================================================

  static subscribeAllColis(callback: (colis: Colis[]) => void) {
    const colRef = collection(db, 'orders');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Colis[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && !data.isDeleted && data.statut !== 'supprime') {
            list.push({
              id: d.id,
              trackingNumber: String(data.trackingNumber || d.id),
              agenceId: data.agenceId || '',
              merchantId: data.merchantId || '',
              nomBoutique: data.nomBoutique || '',
              livreurId: data.livreurId,
              nomLivreur: data.nomLivreur,
              nomClient: data.nomClient || 'Client',
              telephoneClient: data.telephoneClient || '',
              ville: data.ville || 'Dakar',
              commune: data.commune || '',
              adresse: data.adresse || '',
              montantCOD: Number(data.montantCOD || 0),
              fraisLivraison: Number(data.fraisLivraison || 2000),
              statut: data.statut || 'en_attente',
              codeOTP: data.codeOTP,
              dateCreation: data.dateCreation || new Date().toISOString(),
              historique: data.historique || []
            });
          }
        });
        callback(list);
      },
      (err) => console.warn('Admin subscribeColis notice:', err)
    );
  }

  static async updateColisStatut(colisId: string, statut: Colis['statut'], commentaire: string): Promise<void> {
    const docRef = doc(db, 'orders', colisId);
    const snap = await getDoc(docRef);
    const curHistory = snap.exists() ? (snap.data().historique || []) : [];

    const newHistory = [
      ...curHistory,
      {
        statut,
        date: new Date().toISOString(),
        commentaire,
        auteur: 'Super Admin Dropia'
      }
    ];

    await updateDoc(docRef, {
      statut,
      dateMiseAJour: new Date().toISOString(),
      historique: newHistory
    });

    this.logAction('COLIS_STATUT_CHANGE', `Colis ${colisId} passé à l'état ${statut}`);
  }

  static async assignerLivreurColis(colisId: string, livreurId: string, nomLivreur: string): Promise<void> {
    await updateDoc(doc(db, 'orders', colisId), {
      livreurId,
      nomLivreur,
      statut: 'assigne',
      dateMiseAJour: new Date().toISOString()
    });
    this.logAction('COLIS_AFFECTATION', `Colis ${colisId} assigné au livreur ${nomLivreur}`);
  }

  // =========================================================================
  // GESTION DES LIVREURS & FLOTTE
  // =========================================================================

  static subscribeAllLivreurs(callback: (livreurs: Livreur[]) => void) {
    const colRef = collection(db, 'livreurs');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Livreur[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && !data.isDeleted && data.statut !== 'supprime') {
            list.push({
              id: d.id,
              agenceId: data.agenceId || '',
              nom: data.nom || 'Livreur',
              telephone: data.telephone || '',
              pin: data.pin || '0000',
              zone: data.zone || 'Dakar',
              vehicule: data.vehicule || 'moto',
              immatriculation: data.immatriculation || '',
              actif: data.actif !== false,
              colisEnCours: Number(data.colisEnCours || 0),
              tauxReussite: Number(data.tauxReussite || 100),
              soldeCollecteAujourdhui: Number(data.soldeCollecteAujourdhui || 0),
              dateCreation: data.dateCreation || new Date().toISOString()
            });
          }
        });
        callback(list);
      },
      (err) => console.warn('Admin subscribeLivreurs notice:', err)
    );
  }

  static async updateLivreur(livreurId: string, updates: Partial<Livreur>): Promise<void> {
    await updateDoc(doc(db, 'livreurs', livreurId), sanitizeForFirestore(updates));
    this.logAction('LIVREUR_MISE_A_JOUR', `Livreur ${livreurId} mis à jour`);
  }

  static async resetLivreurPin(livreurId: string, nouveauPin: string): Promise<void> {
    await updateDoc(doc(db, 'livreurs', livreurId), {
      pin: nouveauPin.trim()
    });
    this.logAction('LIVREUR_RESET_PIN', `PIN du livreur ${livreurId} réinitialisé`);
  }

  // =========================================================================
  // GESTION DES E-COMMERÇANTS
  // =========================================================================

  static subscribeAllEcommercants(callback: (merchants: Ecommercant[]) => void) {
    const colRef = collection(db, 'ecommercants');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Ecommercant[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && !data.isDeleted && data.statut !== 'supprime') {
            list.push({
              id: d.id,
              agenceId: data.agenceId || '',
              nomBoutique: data.nomBoutique || data.nom || 'Boutique E-commerce',
              contact: data.contact || '',
              email: data.email || '',
              telephone: data.telephone || '',
              ville: data.ville || 'Dakar',
              statut: data.statut || 'actif',
              commandesTotales: Number(data.commandesTotales || 0),
              soldeCODEnAttente: Number(data.soldeCODEnAttente || 0),
              actif: data.actif !== false,
              dateCreation: data.dateCreation || new Date().toISOString()
            });
          }
        });
        callback(list);
      },
      (err) => console.warn('Admin subscribeEcommercants notice:', err)
    );
  }

  static async updateEcommercantStatut(ecomId: string, statut: 'actif' | 'en_attente' | 'refuse'): Promise<void> {
    await updateDoc(doc(db, 'ecommercants', ecomId), {
      statut,
      actif: statut === 'actif'
    });
    this.logAction('ECOM_STATUT_CHANGE', `E-commerçant ${ecomId} passé en ${statut}`);
  }

  // =========================================================================
  // PAIEMENTS & TRANSACTIONS
  // =========================================================================

  static subscribeAllTransactions(callback: (txs: TransactionFinanciere[]) => void) {
    const colRef = collection(db, 'transactions');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: TransactionFinanciere[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && !data.isDeleted) {
            list.push({
              id: d.id,
              type: data.type || 'abonnement_saas',
              montant: Number(data.montant || 0),
              devise: data.devise || 'XOF',
              destinataireType: data.destinataireType || 'plateforme',
              destinataireId: data.destinataireId || '',
              referenceColis: data.referenceColis,
              referencePaiement: data.referencePaiement,
              date: data.date || new Date().toISOString(),
              statut: data.statut || 'complete'
            });
          }
        });
        callback(list);
      },
      (err) => console.warn('Admin subscribeTransactions notice:', err)
    );
  }

  // =========================================================================
  // CONFIGURATION PLATEFORME
  // =========================================================================

  static async getPlatformConfig(): Promise<PlatformConfig> {
    const docRef = doc(db, 'plateforme_config', 'general');
    const snap = await getDoc(docRef).catch(() => null);

    if (snap && snap.exists()) {
      return snap.data() as PlatformConfig;
    }

    const defaultConfig: PlatformConfig = {
      id: 'general',
      nomPlateforme: 'Dropia Logistics Africa',
      tauxCommissionDefaut: 12,
      fraisLivraisonDefaut: 2000,
      saspayClientId: 'sp_live_dropia_main',
      saspayApiKey: '',
      saspayMode: 'live',
      canalWhatsAppActif: true,
      smsGatewayActif: true,
      modeMaintenance: false,
      devisePrincipale: 'XOF'
    };

    await setDoc(docRef, sanitizeForFirestore(defaultConfig)).catch(() => {});
    return defaultConfig;
  }

  static async updatePlatformConfig(config: Partial<PlatformConfig>): Promise<void> {
    const docRef = doc(db, 'plateforme_config', 'general');
    await setDoc(docRef, sanitizeForFirestore(config), { merge: true });
    this.logAction('CONFIG_PLATEFORME_UPDATE', 'Mise à jour des paramètres système Dropia');
  }

  // =========================================================================
  // JOURNAL D'AUDIT
  // =========================================================================

  static async logAction(action: string, details: string): Promise<void> {
    try {
      const session = this.getAdminSession();
      const auteur = session ? session.email : SUPER_ADMIN_EMAIL;
      const logId = `log_${Date.now()}`;

      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        action,
        details,
        auteur,
        date: new Date().toISOString()
      });
    } catch {
      // Ignorer
    }
  }

  static subscribeAuditLogs(callback: (logs: AuditLogItem[]) => void) {
    const colRef = collection(db, 'audit_logs');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: AuditLogItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            action: data.action || '',
            details: data.details || '',
            auteur: data.auteur || SUPER_ADMIN_EMAIL,
            date: data.date || new Date().toISOString()
          });
        });
        // Trier par date décroissante
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(list.slice(0, 50));
      },
      (err) => console.warn('Audit logs notice:', err)
    );
  }
}

export const AdminService = DropiaAdminService;

