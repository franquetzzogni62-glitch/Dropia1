import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Mail,
  Lock,
  Phone,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  KeyRound,
  Sparkles,
  MapPin,
  Check
} from 'lucide-react';
import { DropiaDatabaseService } from '../services/dropiaService';
import { DropiaAuthService } from '../services/authService';
import type { Agence, UserProfile, Ecommercant } from '../types';

export const RegisterEcommercant: React.FC = () => {
  const navigate = useNavigate();

  // Étape courante (1 = Infos boutique & compte, 2 = Choix agence)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Formulaire Étape 1
  const [nomBoutique, setNomBoutique] = useState('');
  const [contact, setContact] = useState('');
  const [telephone, setTelephone] = useState('+221 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ville, setVille] = useState('Dakar');

  // Formulaire Étape 2 (Choix de l'agence)
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loadingAgences, setLoadingAgences] = useState<boolean>(true);
  const [selectedAgenceId, setSelectedAgenceId] = useState<string>('');
  const [codeInvitation, setCodeInvitation] = useState<string>('');
  const [searchAgencyQuery, setSearchAgencyQuery] = useState<string>('');
  const [customAgencyMode, setCustomAgencyMode] = useState<boolean>(false);

  // États de soumission
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Chargement des agences disponibles depuis Firestore
  useEffect(() => {
    let isMounted = true;
    DropiaDatabaseService.getAgences()
      .then((items) => {
        if (!isMounted) return;
        setAgences(items);
        if (items.length > 0) {
          setSelectedAgenceId(items[0].id);
        }
        setLoadingAgences(false);
      })
      .catch((err) => {
        console.warn('Error loading agencies:', err);
        if (isMounted) setLoadingAgences(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Validation Étape 1 avant passage à l'étape 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nomBoutique.trim()) {
      setErrorMessage('Veuillez renseigner le nom de votre boutique e-commerce.');
      return;
    }
    if (!telephone.trim() || telephone.length < 8) {
      setErrorMessage('Veuillez renseigner un numéro de téléphone valide.');
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

    setCurrentStep(2);
  };

  // Connexion Google rapide
  const handleGoogleSignup = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const result = await DropiaAuthService.loginWithGoogle();
      if (!nomBoutique.trim()) {
        setNomBoutique(result.displayName || 'Boutique Dropia');
      }
      if (!contact.trim()) {
        setContact(result.displayName || '');
      }
      setEmail(result.email || '');

      // Passer à l'étape 2 pour lier l'agence
      setCurrentStep(2);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(
        err.message || 'Impossible d\'utiliser Google. Vous pouvez créer votre compte directement avec email et mot de passe.'
      );
    }
  };

  // Soumission finale : création compte & liaison agence
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    // Détermination de l'agenceId final
    let finalAgenceId = selectedAgenceId;

    if (customAgencyMode || codeInvitation.trim()) {
      const cleanCode = codeInvitation.trim().replace('#', '');
      // Vérifier si une agence correspond au code ou à l'ID
      const found = agences.find(
        (a) => a.id.toLowerCase() === cleanCode.toLowerCase() || a.nom.toLowerCase().includes(cleanCode.toLowerCase())
      );
      if (found) {
        finalAgenceId = found.id;
      } else if (cleanCode) {
        finalAgenceId = cleanCode;
      }
    }

    if (!finalAgenceId && agences.length === 0 && !codeInvitation.trim()) {
      finalAgenceId = '';
    }

    try {
      // Enregistrement résilient (supporte Firebase Auth + fallback direct Firestore si operation-not-allowed)
      const authResult = await DropiaAuthService.registerUser({
        email: email.trim(),
        password: password || 'dropia_pass_default',
        nom: contact.trim() || nomBoutique.trim(),
        nomBoutique: nomBoutique.trim(),
        telephone: telephone.trim(),
        ville: ville || 'Dakar',
        role: 'ecommercant'
      });

      const uid = authResult.uid;
      const now = new Date().toISOString();

      // Collection Firestore `ecommercants`
      const ecomPayload: Omit<Ecommercant, 'id'> = {
        agenceId: finalAgenceId,
        nomBoutique: nomBoutique.trim(),
        contact: contact.trim() || nomBoutique.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        ville: ville || 'Dakar',
        statut: 'actif',
        commandesTotales: 0,
        actif: true,
        dateCreation: now,
        dateLiaison: now
      };
      await DropiaDatabaseService.creerEcommercant(ecomPayload, uid);

      setSuccessMessage('🎉 Compte E-commerçant créé avec succès ! Redirection vers votre portail...');

      setTimeout(() => {
        navigate('/portail');
      }, 800);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(`❌ Échec de la création : ${err.message || 'Une erreur est survenue'}`);
    }
  };

  // Filtrage des agences pour l'affichage
  const filteredAgences = agences.filter((a) => {
    const q = searchAgencyQuery.toLowerCase();
    return (
      a.nom.toLowerCase().includes(q) ||
      a.ville.toLowerCase().includes(q) ||
      (a.pays && a.pays.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Header Navigation */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
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
              Portail E-commerçant
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

      {/* Main Container */}
      <main className="max-w-2xl mx-auto w-full my-auto py-6">
        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                currentStep === 1
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              1
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Identité Boutique</span>
              <span className="text-[10px] text-slate-500">Nom, contact et accès</span>
            </div>
          </div>

          <div className="h-0.5 w-12 bg-slate-200" />

          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                currentStep === 2
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Agence Partenaire</span>
              <span className="text-[10px] text-slate-500">Choix de livraison ou invitation</span>
            </div>
          </div>
        </div>

        {/* Error and Success Notifications */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <p className="leading-relaxed font-bold">{successMessage}</p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ÉTAPE 1 : IDENTITÉ E-COMMERÇANT & FORMULAIRE DE CRÉATION                  */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xl space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Inscription Libre E-commerçant
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Créez votre boutique sur Dropia
              </h2>
              <p className="text-xs text-slate-500">
                Renseignez vos coordonnées pour accéder gratuitement à votre portail de commande.
              </p>
            </div>

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
              <span>S'inscrire rapidement avec Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] uppercase font-bold text-slate-400">ou par formulaire</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleProceedToStep2} className="space-y-4">
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
                      placeholder="Ex: Mode Africaine / Wax Chic"
                      value={nomBoutique}
                      onChange={(e) => setNomBoutique(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom du responsable / contact
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
                      placeholder="+221 77 000 00 00"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ville principale
                  </label>
                  <input
                    type="text"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    placeholder="Dakar, Abidjan, Douala..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse e-mail professionnelle *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="contact@maboutique.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mot de passe sécurisé * (min 6 caractères)
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
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-700/20"
              >
                <span>Étape 2 : Choisir mon agence de livraison</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ÉTAPE 2 : CHOIX DE L'AGENCE PARTENAIRE OU CODE D'INVITATION               */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Étape 2 sur 2
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Choisissez votre agence de livraison
                </h2>
                <p className="text-xs text-slate-500">
                  Sélectionnez l'agence qui distribuera vos colis ou saisissez son code d'invitation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modifier infos</span>
              </button>
            </div>

            <form onSubmit={handleFinalSubmit} className="space-y-6">
              {/* Option 1 : Choisir dans la liste des agences Firestore */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <span>Agences de livraison disponibles ({agences.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomAgencyMode(!customAgencyMode)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    {customAgencyMode ? 'Choisir dans la liste' : 'J\'ai un code d\'invitation'}
                  </button>
                </div>

                {!customAgencyMode ? (
                  <div className="space-y-3">
                    {/* Recherche agence */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Rechercher par nom d'agence, ville..."
                        value={searchAgencyQuery}
                        onChange={(e) => setSearchAgencyQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                      />
                    </div>

                    {loadingAgences ? (
                      <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                        Chargement des agences partenaires...
                      </div>
                    ) : filteredAgences.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                        <Building2 className="w-6 h-6 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">
                          Aucune agence trouvée pour votre recherche
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Vous pouvez saisir un code d'invitation ci-dessous ou vous lier au hub central Dropia.
                        </p>
                        <button
                          type="button"
                          onClick={() => setCustomAgencyMode(true)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-[11px]"
                        >
                          Saisir un code d'agence
                        </button>
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                        {filteredAgences.map((agence) => {
                          const isSelected = selectedAgenceId === agence.id;
                          return (
                            <div
                              key={agence.id}
                              onClick={() => setSelectedAgenceId(agence.id)}
                              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                    isSelected
                                      ? 'bg-emerald-700 text-white'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {agence.nom.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-900 text-xs">
                                      {agence.nom}
                                    </h4>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                                      {agence.ville || 'Dakar'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {agence.telephone || 'Contact disponible'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {isSelected ? (
                                  <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border border-slate-300" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Option 2 : Saisir un code d'invitation */
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Code d'invitation de l'agence
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Ex: ag_dakar_express ou AG-7749"
                          value={codeInvitation}
                          onChange={(e) => setCodeInvitation(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-emerald-600 text-xs font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Fourni par votre agence de livraison ou copié depuis un lien d'invitation.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Récapitulatif & Bouton de création finale */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-800 block uppercase font-bold">
                      Boutique enregistrée :
                    </span>
                    <strong className="text-sm font-black">{nomBoutique}</strong>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800">
                    Mode Production
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-700/25 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Création du compte en cours...</span>
                  ) : (
                    <>
                      <span>Confirmer et accéder au Portail E-commerçant</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full py-4 text-center text-xs text-slate-400">
        Dropia Africa — Portail e-commerçant gratuit & indépendant
      </footer>
    </div>
  );
};
export default RegisterEcommercant;
