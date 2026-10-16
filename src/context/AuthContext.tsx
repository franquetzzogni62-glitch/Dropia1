import React, { createContext, useContext, useState, useEffect } from 'react';
import { DropiaAuthService } from '../services/authService';
import { DropiaDatabaseService } from '../services/dropiaService';
import { auth } from '../firebase/config';
import { onAuthStateChanged, type User } from 'firebase/auth';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    return DropiaAuthService.getCurrentSession();
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Initialiser la session locale
    const session = DropiaAuthService.getCurrentSession();
    if (session) {
      setProfile(session);
    }

    // 2. Écouter l'événement global dropia_auth_state_changed
    const handleCustomAuth = (e: any) => {
      const p = e.detail as UserProfile | null;
      setProfile(p);
    };
    window.addEventListener('dropia_auth_state_changed', handleCustomAuth);

    // 3. Écouter Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const p = await DropiaDatabaseService.getUserProfile(firebaseUser.uid);
          if (p) {
            setProfile(p);
            DropiaAuthService.saveSession(p);
          } else {
            const fallback: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              nom: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
              nomBoutique: firebaseUser.displayName || 'Boutique Dropia',
              telephone: '',
              ville: 'Dakar',
              role: 'ecommercant',
              plan: 'starter',
              planStatut: 'actif',
              modeProduction: true,
              soldeWallet: 0,
              dateCreation: new Date().toISOString(),
            };
            setProfile(fallback);
            DropiaAuthService.saveSession(fallback);
          }
        } catch {
          // Utiliser profil courant
        }
      } else {
        const s = DropiaAuthService.getCurrentSession();
        if (!s) {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => {
      window.removeEventListener('dropia_auth_state_changed', handleCustomAuth);
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    await DropiaAuthService.logout();
    setProfile(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    DropiaAuthService.saveSession(updated);
    try {
      await DropiaDatabaseService.updateUserProfile(profile.uid, updates);
    } catch {
      // Ignorer si mode hors-ligne
    }
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!profile?.uid) return null;
    try {
      const p = await DropiaDatabaseService.getUserProfile(profile.uid);
      if (p) {
        setProfile(p);
        DropiaAuthService.saveSession(p);
        return p;
      }
    } catch {
      // fallback
    }
    return profile;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
