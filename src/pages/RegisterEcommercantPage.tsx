import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Store,
  Building2,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  MapPin,
  Sparkles
} from 'lucide-react';
import { DropiaDatabaseService } from '../services/dropiaService';
import { DropiaAuthService } from '../services/authService';
import type { Agence, UserProfile, Ecommercant } from '../types';

export const RegisterEcommercantPage: React.FC = () => {
  const { agenceId: routeAgenceId } = useParams<{ agenceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // agenceId peut venir soit de /register-ecommercant/:agenceId soit de ?agenceId=...
  const agenceId = routeAgenceId || searchParams.get('agenceId') || '';

  const [agence, setAgence] = useState<Agence | null>(null);
  const [loadingAgence, setLoadingAgence] = useState<boolean>(true);
  const [agenceNotFound, setAgenceNotFound] = useState<boolean>(false);

  // Formulaire d'inscription
  const [nomBoutique, setNomBoutique] = useState('');
  const [contact, setContact] = useState('');
  const [telephone, setTelephone] = useState('+221 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ville, setVille] = useState('Dakar');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Vérification de l'existence de l'agence invitante dans Firestore
  useEffect(() => {
    let isMounted = true;
    if (!agenceId) {
      setLoadingAgence(false);
      setAgenceNotFound(true);
      return;
    }

    setLoadingAgence(true);
    DropiaDatabaseService.getAgenceById(agenceId)
      .then((foundAgence) => {
        if (!isMounted) return;
        if (foundAgence) {
          setAgence(foundAgence);
          setVille(foundAgence.ville || 'Dakar');
          setAgenceNotFound(false);
        } else {
          setAgenceNotFound(true);
        }
        setLoadingAgence(false);
      })
      .catch((err) => {
        console.warn('Error fetching agency:', err);
        if (isMounted) {
          setAgenceNotFound(true);
          setLoadingAgence(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [agenceId]);

  // Connexion Google
  const handleGoogleSignup = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const result = await DropiaAuthService.loginWithGoogle();
      const shopName = nomBoutique.trim() || result.displayName || 'Boutique Dropia';
      const contactPerson = contact.trim() || result.displayName || shopName;
      const userEmail = result.email || email.trim();

      const authResult = await DropiaAuthService.registerUser({
        email: userEmail,
        password: password || 'dropia_google_auth',
        nom: contactPerson,
        nomBoutique: shopName,
        telephone: telephone.trim(),
        ville,
        role: 'ecommercant'
      });

      const uid = authResult.uid;
      const now = new Date().toISOString();

      // Document Ecommercant pré-lié
      const ecomPayload: Omit<Ecommercant, 'id'> = {
        agenceId: agence ? agence.id : agenceId,
        nomBoutique: shopName,
        contact: contactPerson,
        email: userEmail,
        telephone: telephone.trim(),
        ville,
        statut: 'actif',
        commandesTotales: 0,
        actif: true,
        dateCreation: now,
        dateLiaison: now
      };
      await DropiaDatabaseService.creerEcommercant(ecomPayload, uid);

      setSuccessMessage('🎉 Compte E-commerçant créé et lié à votre agence ! Redirection...');
      setTimeout(() => {
        navigate('/portail');
      }, 800);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Erreur lors de la connexion Google.');
    }
  };

  // Soumission Formulaire Standard
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nomBoutique.trim()) {
      setErrorMessage('Veuillez renseigner le nom de votre boutique.');
      return;
    }
    if (!telephone.trim()) {
      setErrorMessage('Veuillez renseigner votre numéro de téléphone.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Veuillez renseigner une adresse email valide.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      // Inscription résiliente Dropia (supporte Firebase Auth + Firestore direct si auth/operation-not-allowed)
      const authResult = await DropiaAuthService.registerUser({
        email: email.trim(),
        password: password,
        nom: contact.trim() || nomBoutique.trim(),
        nomBoutique: nomBoutique.trim(),
        telephone: telephone.trim(),
        ville,
        role: 'ecommercant'
      });

      const uid = authResult.uid;
      const now = new Date().toISOString();

      // Document Ecommercant pré-lié
      const ecomPayload: Omit<Ecommercant, 'id'> = {
        agenceId: agence ? agence.id : agenceId,
        nomBoutique: nomBoutique.trim(),
        contact: contact.trim() || nomBoutique.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        ville,
        statut: 'actif',
        commandesTotales: 0,
        actif: true,
        dateCreation: now,
        dateLiaison: now
      };
      await DropiaDatabaseService.creerEcommercant(ecomPayload, uid);

      setSuccessMessage('🎉 Inscription réussie ! Votre compte est automatiquement lié à votre agence.');
      setTimeout(() => {
        navigate('/portail');
      }, 800);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(`❌ Échec de l'inscription : ${err.message || 'Une erreur est survenue'}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Header */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between py-4">
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-black text-xl text-slate-950 tracking-tight block leading-none">
              Dropia
            </span>
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
              Invitation Agence
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="text-xs font-semibold text-slate-600 hover:text-emerald-700 transition"
        >
          Déjà un compte ? <span className="text-emerald-700 font-bold underline">Connexion</span>
        </button>
      </header>

      {/* Main Form */}
      <main className="max-w-xl mx-auto w-full my-auto py-6">
        {loadingAgence ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-700">Vérification de l'invitation en cours...</p>
          </div>
        ) : agenceNotFound ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Lien d'invitation non reconnu ou expiré
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              L'identifiant d'agence <code>{agenceId}</code> ne correspond à aucune agence enregistrée en base. Vous pouvez vous inscrire librement et choisir votre agence dans la liste.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => navigate('/register-ecommercant')}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs"
              >
                Inscription libre E-commerçant
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xl space-y-6">
            {/* Bannière Agence Invitante (spécification #3 : Affiche le nom de l'agence en haut du formulaire) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/60 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Invitation Partenaire Validée
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-700 text-white font-bold">
                  Compte Pré-lié
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">
                    {agence?.nom}
                  </h3>
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {agence?.ville || 'Dakar'} • {agence?.telephone || 'Partenaire logistique Dropia'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-emerald-900/80 pt-1 border-t border-emerald-200/60 leading-normal">
                En créant votre compte, votre boutique sera directement connectée aux livreurs de <strong>{agence?.nom}</strong> pour la prise en charge de vos colis.
              </p>
            </div>

            {/* Error and Success Notifications */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <p className="leading-relaxed font-bold">{successMessage}</p>
              </div>
            )}

            {/* Bouton Google */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 transition shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuer avec Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] uppercase font-bold text-slate-400">ou avec email</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Formulaire classique */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom de votre boutique *
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Wax & Chic Dakar"
                      value={nomBoutique}
                      onChange={(e) => setNomBoutique(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom du contact
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Alice Ngo"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Téléphone (WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="+221 77..."
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email professionnel *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="contact@boutique.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mot de passe (min 6 caractères) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-700/25 disabled:opacity-50"
              >
                {loading ? (
                  <span>Liaison à l'agence en cours...</span>
                ) : (
                  <>
                    <span>Créer mon compte et rejoindre {agence?.nom}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-xl mx-auto w-full py-4 text-center text-xs text-slate-400">
        Dropia Africa — Invitation certifiée par l'agence de livraison
      </footer>
    </div>
  );
};
export default RegisterEcommercantPage;
