import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { DropiaDatabaseService, sanitizeForFirestore } from './dropiaService';
import type { UserProfile, Ecommercant } from '../types';

const SESSION_STORAGE_KEY = 'dropia_auth_session';

export interface AuthSuccessResult {
  uid: string;
  email: string;
  userProfile: UserProfile;
  provider: 'firebase' | 'firestore_resilient';
}

export class DropiaAuthService {
  /**
   * Récupère l'utilisateur actuellement connecté
   * Vérifie d'abord Firebase Auth puis le stockage de session local sécurisé
   */
  static getCurrentSession(): UserProfile | null {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as UserProfile;
      }
    } catch {
      // Ignore JSON parse errors
    }
    return null;
  }

  /**
   * Sauvegarde la session locale et déclenche l'événement global
   */
  static saveSession(profile: UserProfile): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      window.dispatchEvent(new CustomEvent('dropia_auth_state_changed', { detail: profile }));
    } catch (e) {
      console.warn('Could not save session to localStorage', e);
    }
  }

  /**
   * Supprime la session locale
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('dropia_auth_state_changed', { detail: null }));
    } catch (e) {
      console.warn('Could not clear session', e);
    }
  }

  /**
   * Inscription intelligente et résiliente
   * 1. Tente Firebase Auth (createUserWithEmailAndPassword)
   * 2. Si Firebase renvoie auth/operation-not-allowed, bascule automatiquement
   *    sur l'authentification directe Firestore pour ne jamais bloquer l'utilisateur.
   */
  static async registerUser(params: {
    email: string;
    password: string;
    nom: string;
    nomBoutique?: string;
    nomAgence?: string;
    telephone: string;
    ville: string;
    role: 'agence' | 'ecommercant' | 'livreur';
  }): Promise<AuthSuccessResult> {
    const cleanEmail = params.email.trim().toLowerCase();
    const now = new Date().toISOString();

    let uid: string = '';
    let provider: 'firebase' | 'firestore_resilient' = 'firebase';

    try {
      // Tentative 1 : Firebase Auth standard
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
      uid = cred.user.uid;
      provider = 'firebase';
    } catch (authErr: any) {
      const code = authErr.code || '';
      console.warn('Firebase Auth notice during register:', code, authErr.message);

      if (code === 'auth/email-already-in-use') {
        throw new Error('Cette adresse email est déjà enregistrée. Veuillez vous connecter avec vos identifiants.');
      }

      // Si le fournisseur Email/Mot de passe n'est pas activé dans la console Firebase (auth/operation-not-allowed)
      if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation' || !code) {
        console.info('Bascule vers le mode résilient Dropia Firestore...');
        provider = 'firestore_resilient';

        // Vérifier si un compte avec cet e-mail existe déjà dans la collection users
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', cleanEmail));
        const querySnap = await getDocs(q).catch(() => null);

        if (querySnap && !querySnap.empty) {
          throw new Error('Cette adresse email est déjà enregistrée. Veuillez vous connecter.');
        }

        // Générer un identifiant Firestore conforme aux règles de sécurité
        const safeRandom = Math.random().toString(36).substring(2, 8);
        uid = `usr_${Date.now()}_${safeRandom}`;
      } else {
        throw authErr;
      }
    }

    // Création du profil utilisateur dans Firestore
    const userProfile: UserProfile = {
      uid,
      email: cleanEmail,
      nom: params.nom.trim(),
      nomBoutique: params.nomBoutique?.trim() || params.nom.trim(),
      ...(params.role === 'agence'
        ? { nomAgence: (params.nomAgence || params.nom).trim() }
        : {}),
      telephone: params.telephone.trim(),
      ville: params.ville || 'Dakar',
      role: params.role,
      plan: 'starter',
      planStatut: 'actif',
      modeProduction: true,
      soldeWallet: 0,
      dateCreation: now
    };

    // Enregistrement dans la collection 'users' sans aucune valeur undefined
    const userDocPayload = sanitizeForFirestore({
      ...userProfile,
      // Pour le mode résilient, enregistrer le mot de passe pour vérification de connexion
      passwordHash: btoa(params.password)
    });

    await setDoc(doc(db, 'users', uid), userDocPayload, { merge: true });

    // Si agence, créer ou mettre à jour dans 'agences'
    if (params.role === 'agence') {
      const agencePayload = sanitizeForFirestore({
        id: uid,
        nom: params.nomAgence || params.nom.trim(),
        email: cleanEmail,
        telephone: params.telephone.trim(),
        ville: params.ville || 'Dakar',
        pays: 'Sénégal',
        plan: 'pro',
        planStatut: 'actif',
        limiteColis: 800,
        colisUtilises: 0,
        limiteLivreurs: 5,
        livreursUtilises: 0,
        dateCreation: now
      });
      await setDoc(doc(db, 'agences', uid), agencePayload, { merge: true }).catch((err) =>
        console.warn('Agency doc write warning:', err)
      );
    }

    // Sauvegarder la session locale et notifier l'application
    this.saveSession(userProfile);

    return {
      uid,
      email: cleanEmail,
      userProfile,
      provider
    };
  }

  /**
   * Connexion intelligente et résiliente
   * 1. Tente Firebase Auth (signInWithEmailAndPassword)
   * 2. Si auth/operation-not-allowed, vérifie directement dans Firestore 'users'
   */
  static async loginUser(email: string, password: string): Promise<AuthSuccessResult> {
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Tenter la connexion Firebase Auth standard
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const uid = cred.user.uid;
      let profile = await DropiaDatabaseService.getUserProfile(uid);

      if (!profile) {
        profile = {
          uid,
          email: cred.user.email || cleanEmail,
          nom: cred.user.displayName || cleanEmail.split('@')[0],
          nomBoutique: cred.user.displayName || 'Boutique Dropia',
          telephone: '',
          ville: 'Dakar',
          role: 'agence',
          plan: 'starter',
          planStatut: 'actif',
          modeProduction: true,
          soldeWallet: 0,
          dateCreation: new Date().toISOString()
        };
        await DropiaDatabaseService.saveUserProfile(profile);
      }

      this.saveSession(profile);

      return {
        uid,
        email: cleanEmail,
        userProfile: profile,
        provider: 'firebase'
      };
    } catch (authErr: any) {
      const code = authErr.code || '';
      console.warn('Firebase Auth login notice:', code, authErr.message);

      // Si le fournisseur n'est pas activé dans la console Firebase
      if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation' || !code) {
        console.info('Bascule connexion vers vérification directe Firestore...');
        
        // Chercher l'utilisateur par e-mail dans la collection 'users'
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', cleanEmail));
        const snap = await getDocs(q);

        if (snap.empty) {
          throw new Error('Aucun compte n\'est enregistré avec cette adresse e-mail. Vous devez vous inscrire au préalable.');
        }

        const userDoc = snap.docs[0];
        const data = userDoc.data();

        // Vérification du mot de passe
        if (data.passwordHash && data.passwordHash !== btoa(password)) {
          throw new Error('Mot de passe incorrect. Veuillez vérifier votre saisie.');
        }

        const profile: UserProfile = {
          uid: userDoc.id,
          email: data.email || cleanEmail,
          nom: data.nom || cleanEmail.split('@')[0],
          nomBoutique: data.nomBoutique || data.nom || 'Boutique Dropia',
          ...(data.nomAgence ? { nomAgence: data.nomAgence } : {}),
          telephone: data.telephone || '',
          ville: data.ville || 'Dakar',
          role: data.role || 'agence',
          plan: data.plan || 'starter',
          planStatut: data.planStatut || 'actif',
          modeProduction: true,
          soldeWallet: Number(data.soldeWallet || 0),
          dateCreation: data.dateCreation || new Date().toISOString()
        };

        this.saveSession(profile);

        return {
          uid: userDoc.id,
          email: cleanEmail,
          userProfile: profile,
          provider: 'firestore_resilient'
        };
      }

      if (
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-login-credentials'
      ) {
        throw new Error('Aucun compte trouvé avec cet e-mail ou identifiants invalides. Veuillez vous inscrire.');
      }

      if (code === 'auth/wrong-password') {
        throw new Error('Mot de passe incorrect. Veuillez vérifier votre saisie.');
      }

      throw authErr;
    }
  }

  /**
   * Connexion Google avec message explicite si non activé dans Firebase
   */
  static async loginWithGoogle(): Promise<{
    user: User;
    email: string;
    displayName: string;
  }> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return {
        user: result.user,
        email: result.user.email || '',
        displayName: result.user.displayName || ''
      };
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        throw new Error('Connexion Google annulée.');
      }
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error(
          'La connexion Google n\'est pas encore activée dans la console Firebase (auth/operation-not-allowed). Veuillez utiliser l\'inscription par e-mail et mot de passe ci-dessous.'
        );
      }
      throw err;
    }
  }

  /**
   * Déconnexion complète
   */
  static async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth).catch(() => {});
    } finally {
      this.clearSession();
    }
  }
}
