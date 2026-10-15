import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Building2,
  Bike,
  Store,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { DropiaDatabaseService } from '../../services/dropiaService';
import { DropiaAuthService } from '../../services/authService';
import type { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: 'ecommercant' | 'agence' | 'livreur';
  onAuthSuccess: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'agence',
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('+221 ');
  const [ville, setVille] = useState('Dakar');
  const [role, setRole] = useState<'ecommercant' | 'agence' | 'livreur'>(initialRole);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        // Connexion résiliente Dropia
        const res = await DropiaAuthService.loginUser(email.trim(), password);
        setSuccessMessage('Connexion réussie ! Chargement de votre espace...');
        setTimeout(() => {
          onAuthSuccess(res.userProfile);
          onClose();
        }, 500);
      } else {
        // Inscription d'un nouvel utilisateur réel
        if (!nom.trim()) {
          setErrorMessage('Veuillez renseigner votre nom complet ou le nom de votre boutique / agence.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
          setLoading(false);
          return;
        }

        const res = await DropiaAuthService.registerUser({
          email: email.trim(),
          password,
          nom: nom.trim(),
          nomBoutique: nom.trim(),
          ...(role === 'agence' ? { nomAgence: nom.trim() } : {}),
          telephone: telephone.trim(),
          ville,
          role
        });

        setSuccessMessage('🎉 Inscription réussie en Mode Production ! Redirection vers votre tableau de bord...');
        setTimeout(() => {
          onAuthSuccess(res.userProfile);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur est survenue lors du traitement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs text-slate-800 space-y-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dropia SaaS • Mode Production</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {mode === 'login' ? 'Connexion Sécurisée' : 'Créer un Compte Opérationnel'}
          </h2>
          <p className="text-[11px] text-slate-500">
            {mode === 'login'
              ? 'Seuls les utilisateurs préalablement inscrits ont accès à la plateforme.'
              : 'Rejoignez le réseau logistique et e-commerce en Afrique francophone.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition text-xs ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition text-xs ${
              mode === 'register'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            S'inscrire (Nouveau compte)
          </button>
        </div>

        {/* Alert Notifications */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            {mode === 'login' && errorMessage.includes('Compte introuvable') && (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className="w-full mt-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>Créer mon compte maintenant →</span>
              </button>
            )}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              {/* Type de compte / Rôle */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Type d'activité :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('ecommercant')}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      role === 'ecommercant'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px]">E-commerçant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('agence')}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      role === 'agence'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px]">Agence 3PL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('livreur')}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      role === 'livreur'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Bike className="w-4 h-4 text-amber-600" />
                    <span className="text-[10px]">Livreur Pro</span>
                  </button>
                </div>
              </div>

              {/* Nom / Entreprise */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nom complet / Nom de la boutique :
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Teranga Store ou Franquetz Zogni"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>

              {/* Téléphone & Ville */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Téléphone :
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="+221 77..."
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ville principale :
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <select
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs bg-white"
                    >
                      <option value="Dakar">🇸🇳 Dakar</option>
                      <option value="Abidjan">🇨🇮 Abidjan</option>
                      <option value="Douala">🇨🇲 Douala</option>
                      <option value="Yaoundé">🇨🇲 Yaoundé</option>
                      <option value="Bamako">🇲🇱 Bamako</option>
                      <option value="Cotonou">🇧🇯 Cotonou</option>
                      <option value="Lomé">🇹🇬 Lomé</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Adresse e-mail :
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="votre.email@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Mot de passe {mode === 'register' && '(min. 6 caractères)'} :
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-700/20"
          >
            {loading ? (
              <span>Traitement en cours...</span>
            ) : mode === 'login' ? (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Créer mon compte en Production</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-500">
          {mode === 'login' ? (
            <p>
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className="text-emerald-700 font-bold hover:underline"
              >
                Inscrivez-vous ici gratuitement
              </button>
            </p>
          ) : (
            <p>
              Vous possédez déjà un compte ?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className="text-emerald-700 font-bold hover:underline"
              >
                Connectez-vous ici
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
