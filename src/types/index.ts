export type UserRole = 'admin' | 'agence' | 'ecommercant' | 'livreur' | 'merchant' | 'agency' | 'driver' | 'super_admin';

export type AdminRole = 'super_admin' | 'admin' | 'support';

export type AdminPermission =
  | 'agences:read'
  | 'agences:write'
  | 'agences:delete'
  | 'paiements:read'
  | 'paiements:write'
  | 'colis:read'
  | 'colis:write'
  | 'livreurs:read'
  | 'livreurs:write'
  | 'ecommercants:read'
  | 'ecommercants:write'
  | 'analytics:read'
  | 'config:write'
  | 'support:write';

export interface AdminUser {
  id: string;
  email: string;
  nom: string;
  role: AdminRole;
  permissions: AdminPermission[];
  actif: boolean;
  dateCreation: string;
  dateDerniereConnexion: string;
}

export interface PlatformConfig {
  id: string;
  nomPlateforme: string;
  tauxCommissionDefaut: number;
  fraisLivraisonDefaut: number;
  saspayClientId?: string;
  saspayApiKey?: string;
  saspayClientSecret?: string;
  saspayMode?: 'test' | 'live';
  canalWhatsAppActif: boolean;
  smsGatewayActif: boolean;
  modeMaintenance: boolean;
  devisePrincipale: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  nom: string;
  nomBoutique?: string;
  nomAgence?: string;
  telephone: string;
  ville: string;
  pays?: string;
  role: 'ecommercant' | 'agence' | 'livreur' | 'admin';
  plan: 'starter' | 'pro' | 'business';
  planStatut: 'actif' | 'essai' | 'inactif';
  modeProduction: boolean;
  soldeWallet: number;
  dateCreation: string;
}

export interface Agence {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  ville: string;
  pays: string;
  plan: 'starter' | 'pro' | 'business';
  planStatut: 'actif' | 'essai' | 'impaye' | 'annule';
  limiteColis: number;
  colisUtilises: number;
  limiteLivreurs: number;
  livreursUtilises: number;
  dateExpiration: string;
  dateCreation: string;
}

export interface Ecommercant {
  id: string;
  agenceId: string;
  nomBoutique: string;
  contact?: string;
  email: string;
  telephone: string;
  ville?: string;
  statut: 'actif' | 'en_attente' | 'refuse';
  commandesTotales: number;
  soldeCODEnAttente?: number;
  actif: boolean;
  dateCreation: any;
  dateLiaison?: any;
}

export interface Livreur {
  id: string;
  agenceId: string;
  nom: string;
  telephone: string;
  pin: string; // 4 digits PIN
  zone: string;
  vehicule: 'moto' | 'voiture' | 'tricycle';
  immatriculation: string;
  actif: boolean;
  colisEnCours: number;
  tauxReussite: number;
  soldeCollecteAujourdhui: number;
  dateCreation: string;
}

export type StatutColis = 'en_attente' | 'assigne' | 'ramasse' | 'en_cours' | 'livre' | 'annule' | 'retourne';

export interface Colis {
  id: string;
  trackingNumber: string;
  agenceId: string;
  merchantId: string;
  nomBoutique?: string;
  livreurId?: string;
  nomLivreur?: string;
  nomClient: string;
  telephoneClient: string;
  ville: string;
  commune: string;
  adresse: string;
  montantCOD: number; // Cash on Delivery en FCFA
  fraisLivraison: number;
  statut: StatutColis;
  codeOTP?: string;
  signatureUrl?: string;
  notes?: string;
  dateCreation: string;
  dateMiseAJour?: string;
  historique?: Array<{
    statut: string;
    date: string;
    commentaire: string;
    auteur?: string;
  }>;
}

export interface TransactionFinanciere {
  id: string;
  type: 'cod_collecte' | 'frais_livraison' | 'reversement_marchand' | 'abonnement_saas';
  montant: number;
  devise: 'XOF';
  destinataireType: 'agence' | 'ecommercant' | 'livreur' | 'plateforme';
  destinataireId: string;
  referenceColis?: string;
  referencePaiement?: string;
  date: string;
  statut: 'complete' | 'en_attente' | 'echoue';
}

export interface ApiKeyItem {
  id: string;
  agenceId: string;
  nom: string;
  prefixe: string;
  cleMasquee: string;
  permissions: string[];
  actif: boolean;
  dateCreation: string;
  nbAppels: number;
}

export interface WebhookConfig {
  id: string;
  agenceId: string;
  url: string;
  evenements: string[];
  secret: string;
  actif: boolean;
  dateCreation: string;
  dernierStatutHttp?: number;
}
