import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Building2,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Plus,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  LogOut,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  AlertCircle,
  X,
  Search,
  KeyRound,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { DropiaDatabaseService } from '../services/dropiaService';
import { DropiaAuthService } from '../services/authService';
import { NewOrderModal } from '../components/modals/NewOrderModal';
import type { Ecommercant, Agence, Colis, UserProfile } from '../types';

interface PortailEcommercantProps {
  userProfile?: UserProfile | null;
  onLogout?: () => void;
}

export const PortailEcommercant: React.FC<PortailEcommercantProps> = ({
  userProfile: propUserProfile,
  onLogout
}) => {
  const navigate = useNavigate();

  // Profil et boutique
  const initialSession = DropiaAuthService.getCurrentSession();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(
    propUserProfile || initialSession || null
  );
  const [ecommercantData, setEcommercantData] = useState<Ecommercant | null>(null);
  const [currentAgency, setCurrentAgency] = useState<Agence | null>(null);

  // Liste des colis de cette boutique
  const [colisList, setColisList] = useState<Colis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showNewOrderModal, setShowNewOrderModal] = useState<boolean>(false);
  const [showChangeAgencyModal, setShowChangeAgencyModal] = useState<boolean>(false);
  const [showInviteAgencyModal, setShowInviteAgencyModal] = useState<boolean>(false);

  // Liste des agences pour le changement
  const [allAgences, setAllAgences] = useState<Agence[]>([]);
  const [selectedNewAgencyId, setSelectedNewAgencyId] = useState<string>('');
  const [manualAgencyCode, setManualAgencyCode] = useState<string>('');
  const [searchAgencyQuery, setSearchAgencyQuery] = useState<string>('');
  const [isChangingAgency, setIsChangingAgency] = useState<boolean>(false);

  // Copie de lien
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Chargement initial du profil et des données de la boutique
  useEffect(() => {
    const session = DropiaAuthService.getCurrentSession();
    const uid = auth.currentUser?.uid || propUserProfile?.uid || session?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Récupérer le profil user si non fourni
    if (!currentUserProfile) {
      DropiaDatabaseService.getUserProfile(uid).then((prof) => {
        if (isMounted && prof) {
          setCurrentUserProfile(prof);
          DropiaAuthService.saveSession(prof);
        }
      });
    }

    // 2. Récupérer les données e-commerçant
    DropiaDatabaseService.getEcommercantById(uid).then(async (ecom) => {
      if (!isMounted) return;
      if (ecom) {
        setEcommercantData(ecom);
        if (ecom.agenceId) {
          const ag = await DropiaDatabaseService.getAgenceById(ecom.agenceId);
          if (isMounted && ag) setCurrentAgency(ag);
        }
      } else if (currentUserProfile) {
        // Créer un document ecommercant par défaut pour ce profil s'il n'existe pas encore
        const fallbackEcom: Omit<Ecommercant, 'id'> = {
          agenceId: '',
          nomBoutique: currentUserProfile.nomBoutique || currentUserProfile.nom,
          contact: currentUserProfile.nom,
          email: currentUserProfile.email,
          telephone: currentUserProfile.telephone,
          ville: currentUserProfile.ville || 'Dakar',
          statut: 'actif',
          commandesTotales: 0,
          actif: true,
          dateCreation: new Date().toISOString(),
          dateLiaison: new Date().toISOString()
        };
        DropiaDatabaseService.creerEcommercant(fallbackEcom, uid).then(() => {
          if (isMounted) setEcommercantData({ id: uid, ...fallbackEcom });
        }).catch(() => {});
      }
      setLoading(false);
    });

    // 3. Souscription aux colis
    const unsubscribeColis = DropiaDatabaseService.subscribeColis((allColis) => {
      if (!isMounted) return;
      // Filtrer les colis appartenant à cette boutique
      const myColis = allColis.filter(
        (c) =>
          c.merchantId === uid ||
          (c.nomBoutique &&
            currentUserProfile?.nomBoutique &&
            c.nomBoutique.toLowerCase() === currentUserProfile.nomBoutique.toLowerCase())
      );
      setColisList(myColis);
    });

    // 4. Charger la liste des agences disponibles
    DropiaDatabaseService.getAgences().then((agList) => {
      if (isMounted) setAllAgences(agList);
    });

    return () => {
      isMounted = false;
      unsubscribeColis();
    };
  }, [propUserProfile]);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await DropiaAuthService.logout();
      navigate('/');
    }
  };

  // Action : Changer d'agence
  const handleConfirmChangeAgency = async () => {
    const ecomId = auth.currentUser?.uid || propUserProfile?.uid;
    if (!ecomId) return;

    let targetAgencyId = selectedNewAgencyId;
    if (manualAgencyCode.trim()) {
      targetAgencyId = manualAgencyCode.trim();
    }

    if (!targetAgencyId) {
      showToast('Veuillez sélectionner une agence ou saisir un identifiant.');
      return;
    }

    setIsChangingAgency(true);
    try {
      await DropiaDatabaseService.updateEcommercantAgence(ecomId, targetAgencyId);
      const newAg = await DropiaDatabaseService.getAgenceById(targetAgencyId);
      setCurrentAgency(
        newAg || {
          id: targetAgencyId,
          nom: 'Nouvelle Agence Partenaire',
          email: '',
          telephone: '',
          ville: 'Dakar',
          pays: 'Sénégal',
          plan: 'pro',
          planStatut: 'actif',
          limiteColis: 800,
          colisUtilises: 0,
          limiteLivreurs: 5,
          livreursUtilises: 0,
          dateExpiration: '',
          dateCreation: new Date().toISOString()
        }
      );

      if (ecommercantData) {
        setEcommercantData({
          ...ecommercantData,
          agenceId: targetAgencyId,
          statut: 'en_attente'
        });
      }

      showToast('Agence mise à jour avec succès !');
      setShowChangeAgencyModal(false);
      setIsChangingAgency(false);
    } catch {
      setIsChangingAgency(false);
      showToast('Erreur lors du changement d\'agence.');
    }
  };

  // Action : Créer une commande
  const handleCreateOrder = async (newColis: Omit<Colis, 'id'>) => {
    try {
      const docId = await DropiaDatabaseService.creerColis({
        ...newColis,
        agenceId: currentAgency?.id || ecommercantData?.agenceId || 'hub_central',
        merchantId: auth.currentUser?.uid || 'ecom_user',
        nomBoutique:
          ecommercantData?.nomBoutique || currentUserProfile?.nomBoutique || 'Ma Boutique'
      });
      showToast(`Colis ${newColis.trackingNumber} expédié à l'agence !`);
    } catch {
      showToast('Erreur lors de l\'enregistrement du colis.');
    }
  };

  // Statistiques calculées
  const totalColis = colisList.length;
  const colisEnCours = colisList.filter(
    (c) => c.statut === 'en_cours' || c.statut === 'ramasse' || c.statut === 'assigne'
  ).length;
  const colisLivres = colisList.filter((c) => c.statut === 'livre').length;
  const totalCodLivre = colisList
    .filter((c) => c.statut === 'livre')
    .reduce((acc, c) => acc + (c.montantCOD || 0), 0);

  const inviteAgencyUrl = `${window.location.origin}/register?role=agence`;

  const handleCopyAgencyInvite = () => {
    navigator.clipboard.writeText(inviteAgencyUrl);
    setCopiedInvite(true);
    showToast('Lien d\'invitation agence copié !');
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500 text-emerald-400 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Portail E-commerçant */}
      <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-xs shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight truncate max-w-[130px] sm:max-w-[240px] md:max-w-none">
                {ecommercantData?.nomBoutique || currentUserProfile?.nomBoutique || 'Portail E-commerçant'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold shrink-0">
                E-commerçant
              </span>
            </div>
            <span className="text-[11px] text-slate-500 truncate block">
              {ecommercantData?.contact || currentUserProfile?.nom} • {ecommercantData?.ville || 'Dakar'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => navigate('/')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition text-[11px]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Site public</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 transition font-semibold text-[11px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Contenu Principal */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ========================================================================= */}
        {/* SECTION 5 : "MON AGENCE" (Spécification détaillée #5)                    */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Partenaire Logistique
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  Mon agence de livraison
                </h2>
              </div>
            </div>

            {/* Boutons d'action pour l'agence */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Bouton "Changer d'agence" */}
              <button
                onClick={() => setShowChangeAgencyModal(true)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Changer d'agence</span>
              </button>

              {/* Bouton "Inviter une autre agence" */}
              <button
                onClick={() => setShowInviteAgencyModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm shadow-emerald-700/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inviter une autre agence</span>
              </button>
            </div>
          </div>

          {/* Fiche d'informations de l'agence */}
          {currentAgency ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Nom de l'agence
                </span>
                <strong className="text-sm font-black text-slate-900 block">
                  {currentAgency.nom}
                </strong>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Agence certifiée Dropia
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Téléphone & Dispatch
                </span>
                <a
                  href={`tel:${currentAgency.telephone}`}
                  className="text-xs font-mono font-bold text-slate-800 hover:text-emerald-700 block"
                >
                  {currentAgency.telephone || '+221 77 000 00 00'}
                </a>
                {currentAgency.telephone && (
                  <a
                    href={`https://wa.me/${currentAgency.telephone.replace(/\+/g, '').replace(/\s+/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp Agence</span>
                  </a>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Zone de couverture
                </span>
                <strong className="text-xs text-slate-800 block">
                  {currentAgency.ville || 'Dakar'} ({currentAgency.pays || 'Sénégal'})
                </strong>
                <span className="text-[11px] text-slate-500">
                  Distribution urbaine & banlieue
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Statut de liaison
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Connecté
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  ID: {currentAgency.id}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-sm">Aucune agence assignée</h4>
                <p className="text-xs text-amber-800">
                  Sélectionnez une agence partenaire disponible pour pouvoir expédier vos colis et planifier des ramassages.
                </p>
              </div>
              <button
                onClick={() => setShowChangeAgencyModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0"
              >
                Choisir une agence maintenant
              </button>
            </div>
          )}
        </section>

        {/* 4 Cartes KPI E-commerçant */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Colis Confiés
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalColis}
            </div>
            <span className="text-[11px] text-slate-500">Toutes expéditions</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              En cours de livraison
            </span>
            <div className="text-2xl font-black text-amber-500 font-mono">
              {colisEnCours}
            </div>
            <span className="text-[11px] text-amber-600 font-semibold">Avec les livreurs</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Livrés avec succès
            </span>
            <div className="text-2xl font-black text-emerald-600 font-mono">
              {colisLivres}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">Validation OTP</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total COD Encaissé
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalCodLivre.toLocaleString('fr-FR')} F
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">Cash collecté</span>
          </div>
        </section>

        {/* Section Commandes & Bouton Créer */}
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Mes Commandes & Expéditions ({colisList.length})
              </h3>
              <p className="text-xs text-slate-500">
                Suivez en direct l'avancement de vos livraisons et les codes OTP.
              </p>
            </div>

            <button
              onClick={() => setShowNewOrderModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm shadow-emerald-700/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nouvelle expédition</span>
            </button>
          </div>

          {/* Table des Colis */}
          <div className="overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-50 border-y border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap">N° Suivi</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Client</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Destination</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Montant COD</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Statut</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Livreur Assigné</th>
                  <th className="py-2.5 px-3 whitespace-nowrap font-mono">Code OTP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {colisList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          Aucune commande pour le moment
                        </p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                          Cliquez sur "+ Nouvelle expédition" pour créer votre premier colis et l'envoyer à votre agence de livraison.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowNewOrderModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer min-h-[40px]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Créer un colis</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  colisList.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-emerald-700">
                        {c.trackingNumber}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{c.nomClient}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {c.telephoneClient}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {c.commune || c.ville}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-slate-900">
                        {c.montantCOD.toLocaleString('fr-FR')} F
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {c.statut === 'livre' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Livré
                          </span>
                        ) : c.statut === 'en_cours' || c.statut === 'ramasse' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            En route
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {c.nomLivreur || 'Agence en cours d\'assignation'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px]">
                          {c.codeOTP || '----'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* MODAL : CHANGER D'AGENCE DE LIVRAISON                                     */}
      {/* ========================================================================= */}
      {showChangeAgencyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs text-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Changer d'agence partenaire
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    Sélectionnez une nouvelle agence Dropia
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowChangeAgencyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Recherche */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou ville..."
                  value={searchAgencyQuery}
                  onChange={(e) => setSearchAgencyQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>

              {/* Liste des agences */}
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {allAgences
                  .filter((a) => {
                    const q = searchAgencyQuery.toLowerCase();
                    return a.nom.toLowerCase().includes(q) || a.ville.toLowerCase().includes(q);
                  })
                  .map((ag) => {
                    const isSelected = selectedNewAgencyId === ag.id;
                    return (
                      <div
                        key={ag.id}
                        onClick={() => setSelectedNewAgencyId(ag.id)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>{ag.nom}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                              {ag.ville}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {ag.telephone || 'Contact disponible'}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Ou saisir un code manuel */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Ou saisir un code d'invitation agence :
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Ex: ag_dakar_centre"
                    value={manualAgencyCode}
                    onChange={(e) => setManualAgencyCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowChangeAgencyModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isChangingAgency}
                onClick={handleConfirmChangeAgency}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs disabled:opacity-50"
              >
                {isChangingAgency ? 'Liaison en cours...' : 'Confirmer le changement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL : INVITER UNE AUTRE AGENCE                                          */}
      {/* ========================================================================= */}
      {showInviteAgencyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs text-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Inviter une agence de livraison
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    Proposer à votre livreur habituel de digitaliser ses courses
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowInviteAgencyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Votre agence de livraison habituelle n'est pas encore sur Dropia ? Envoyez-lui un lien pour qu'elle crée son compte agence gratuitement avec 30 jours d'essai Pro.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">
                Lien d'inscription Agence :
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteAgencyUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 select-all"
                />
                <button
                  onClick={handleCopyAgencyInvite}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  {copiedInvite ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedInvite ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
            </div>

            <a
              href={`https://wa.me/?text=Bonjour%20!%20Je%20souhaite%20vous%20confier%20mes%20colis%20e-commerce%20sur%20Dropia%20pour%20avoir%20le%20suivi%20GPS%20et%20la%20validation%20OTP.%20Créez%20votre%20agence%20gratuitement%20ici%20:%20${encodeURIComponent(
                inviteAgencyUrl
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Partager sur WhatsApp à mon agence</span>
            </a>
          </div>
        </div>
      )}

      {/* Modal Nouvelle Expédition */}
      {showNewOrderModal && (
        <NewOrderModal
          userProfile={currentUserProfile}
          onClose={() => setShowNewOrderModal(false)}
          onSubmit={handleCreateOrder}
        />
      )}
    </div>
  );
};
export default PortailEcommercant;
