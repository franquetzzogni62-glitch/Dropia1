import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  DollarSign,
  Package,
  Bike,
  Store,
  TrendingUp,
  Settings,
  RefreshCw,
  LogOut,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Key,
  Smartphone,
  Copy,
  Check,
  Globe,
  Activity,
  FileText,
  Lock,
  ChevronRight,
  Filter,
  Send,
  Users
} from 'lucide-react';

import {
  DropiaAdminService,
  SUPER_ADMIN_EMAIL,
  ALL_ADMIN_PERMISSIONS,
  type AuditLogItem
} from '../services/adminService';
import type {
  AdminUser,
  Agence,
  Colis,
  Livreur,
  Ecommercant,
  TransactionFinanciere,
  PlatformConfig
} from '../types';

type AdminTab =
  | 'overview'
  | 'agences'
  | 'paiements'
  | 'colis'
  | 'livreurs'
  | 'ecommercants'
  | 'analytics'
  | 'config'
  | 'audit';

export default function AdminPortal() {
  const navigate = useNavigate();

  // État de l'administrateur
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() =>
    DropiaAdminService.getAdminSession()
  );
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [authEmail, setAuthEmail] = useState(SUPER_ADMIN_EMAIL);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Données globales
  const [agences, setAgences] = useState<Agence[]>([]);
  const [colis, setColis] = useState<Colis[]>([]);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [ecommercants, setEcommercants] = useState<Ecommercant[]>([]);
  const [transactions, setTransactions] = useState<TransactionFinanciere[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtres de recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Édition
  const [selectedAgence, setSelectedAgence] = useState<Agence | null>(null);
  const [isAgenceModalOpen, setIsAgenceModalOpen] = useState(false);
  const [isNewAgenceModalOpen, setIsNewAgenceModalOpen] = useState(false);
  const [selectedColis, setSelectedColis] = useState<Colis | null>(null);
  const [selectedLivreur, setSelectedLivreur] = useState<Livreur | null>(null);
  const [newPin, setNewPin] = useState('');

  // Formulaire nouvelle agence
  const [newAgenceForm, setNewAgenceForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    ville: 'Dakar',
    pays: 'Sénégal',
    plan: 'pro' as 'starter' | 'pro' | 'business',
    planStatut: 'actif' as 'actif' | 'essai',
    limiteColis: 1500,
    limiteLivreurs: 10
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synchronisation des souscriptions en direct dès que l'admin est connecté
  useEffect(() => {
    if (!adminUser) return;

    // Charger la configuration système
    DropiaAdminService.getPlatformConfig().then(setPlatformConfig);

    // Souscription temps réel aux Agences
    const unsubAgences = DropiaAdminService.subscribeAllAgences(setAgences);

    // Souscription temps réel aux Colis
    const unsubColis = DropiaAdminService.subscribeAllColis(setColis);

    // Souscription temps réel aux Livreurs
    const unsubLivreurs = DropiaAdminService.subscribeAllLivreurs(setLivreurs);

    // Souscription temps réel aux E-commerçants
    const unsubEcom = DropiaAdminService.subscribeAllEcommercants(setEcommercants);

    // Souscription temps réel aux Transactions
    const unsubTx = DropiaAdminService.subscribeAllTransactions(setTransactions);

    // Souscription temps réel aux Logs d'audit
    const unsubAudit = DropiaAdminService.subscribeAuditLogs(setAuditLogs);

    return () => {
      unsubAgences();
      unsubColis();
      unsubLivreurs();
      unsubEcom();
      unsubTx();
      unsubAudit();
    };
  }, [adminUser]);

  // Connexion de l'administrateur
  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const user = await DropiaAdminService.authenticateAdmin(authEmail);
      setAdminUser(user);
      showToast(`Bienvenue dans la console Super Admin, ${user.nom} !`);
    } catch (err: any) {
      setAuthError(err.message || 'Identifiants invalides');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAdminLogout = () => {
    DropiaAdminService.clearAdminSession();
    setAdminUser(null);
    showToast('Session administrateur fermée.');
  };

  // KPIs calculés
  const totalGMV = colis.filter((c) => c.statut === 'livre').reduce((acc, c) => acc + (c.montantCOD || 0), 0);
  const totalFrais = colis.filter((c) => c.statut === 'livre').reduce((acc, c) => acc + (c.fraisLivraison || 2000), 0);
  const totalCashSacoches = livreurs.reduce((acc, l) => acc + (l.soldeCollecteAujourdhui || 0), 0);
  const tauxSuccesGlobal = colis.length > 0 ? Math.round((colis.filter((c) => c.statut === 'livre').length / colis.length) * 100) : 0;

  // Actions CRUD Agences
  const handleSaveAgence = async () => {
    if (!selectedAgence) return;
    try {
      await DropiaAdminService.updateAgence(selectedAgence.id, selectedAgence);
      setIsAgenceModalOpen(false);
      showToast(`Agence ${selectedAgence.nom} mise à jour avec succès.`);
    } catch {
      showToast("Erreur lors de la mise à jour de l'agence.");
    }
  };

  const handleCreateAgence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DropiaAdminService.createAgence({
        ...newAgenceForm,
        colisUtilises: 0,
        livreursUtilises: 0,
        dateExpiration: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        dateCreation: new Date().toISOString()
      });
      setIsNewAgenceModalOpen(false);
      setNewAgenceForm({
        nom: '',
        email: '',
        telephone: '',
        ville: 'Dakar',
        pays: 'Sénégal',
        plan: 'pro',
        planStatut: 'actif',
        limiteColis: 1500,
        limiteLivreurs: 10
      });
      showToast('Nouvelle agence créée avec succès.');
    } catch {
      showToast("Erreur lors de la création de l'agence.");
    }
  };

  const handleDeleteAgence = async (id: string, nom: string) => {
    if (window.confirm(`Confirmer la suppression définitive de l'agence ${nom} ?`)) {
      await DropiaAdminService.deleteAgence(id);
      showToast(`Agence ${nom} supprimée.`);
    }
  };

  // Actions Colis
  const handleForceColisStatus = async (colisId: string, nouveauStatut: Colis['statut']) => {
    await DropiaAdminService.updateColisStatut(colisId, nouveauStatut, 'Statut forcé par la console Super Admin');
    showToast(`Colis mis à jour : ${nouveauStatut}`);
  };

  // Actions Livreurs
  const handleResetPin = async (livreurId: string) => {
    if (!newPin || newPin.length !== 4) {
      alert('Veuillez saisir un code PIN à 4 chiffres.');
      return;
    }
    await DropiaAdminService.resetLivreurPin(livreurId, newPin);
    setSelectedLivreur(null);
    setNewPin('');
    showToast('Code PIN du coursier mis à jour.');
  };

  // Actions E-commerçants
  const handleToggleEcommercant = async (id: string, statutActuel: string) => {
    const nouveauStatut = statutActuel === 'actif' ? 'en_attente' : 'actif';
    await DropiaAdminService.updateEcommercantStatut(id, nouveauStatut);
    showToast(`Statut commerçant : ${nouveauStatut}`);
  };

  // Configuration Plateforme
  const handleSavePlatformConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformConfig) return;
    await DropiaAdminService.updatePlatformConfig(platformConfig);
    showToast('Paramètres de la plateforme Dropia enregistrés.');
  };

  // =========================================================================
  // ÉCRAN DE CONNEXION ADMIN (Si non authentifié)
  // =========================================================================
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#0d162a] flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E40AF] text-white shadow-lg shadow-blue-900/30 mb-2">
              <ShieldCheck className="w-8 h-8" strokeWidth={1.75} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1E40AF] border border-blue-200 text-xs font-bold tracking-wide uppercase">
              Portail d'Administration Dropia
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Console Super Admin
            </h1>
            <p className="text-xs text-slate-500">
              Espace réservé exclusivement à l'administration centrale et au contrôle général de la plateforme.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" strokeWidth={1.75} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Email Administrateur
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="franquetzzogni6@gmail.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Mot de Passe Sécurisé
              </label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100 font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Session sécurisée avec RBAC complet et audit des transactions.
              </span>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 rounded-xl bg-[#1E40AF] hover:bg-blue-800 text-white font-bold transition shadow-md shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" strokeWidth={1.75} />
              {isAuthenticating ? 'Connexion en cours...' : 'Connexion Super Admin'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center flex flex-col gap-2">
            <button
              onClick={() => {
                setAuthEmail(SUPER_ADMIN_EMAIL);
                handleAdminLogin();
              }}
              className="text-xs text-[#1E40AF] font-bold hover:underline"
            >
              ⚡ Connexion Directe Super Admin ({SUPER_ADMIN_EMAIL})
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              ← Retour au site Dropia
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // INTERFACE PRINCIPALE DE L'ADMINISTRATEUR
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-blue-500 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Super Admin */}
      <header className="sticky top-0 z-40 bg-[#1E40AF] text-white border-b border-blue-950/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-sm">
              <ShieldCheck className="w-5 h-5 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-white">
                  Dropia Admin
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-100 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Contrôle général de la plateforme • Afrique de l'Ouest & Centrale
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex flex-col text-right">
              <span className="font-bold text-white">{adminUser.nom}</span>
              <span className="text-[11px] text-blue-200">{adminUser.email}</span>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition font-medium flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              Vue Agence
            </button>

            <button
              onClick={handleAdminLogout}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-[#172554] border-t border-blue-900/50 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 h-12 text-xs font-bold">
            {[
              { id: 'overview', label: "Vue d'ensemble", icon: Activity },
              { id: 'agences', label: `Agences (${agences.length})`, icon: Building2 },
              { id: 'paiements', label: `Paiements (${transactions.length})`, icon: DollarSign },
              { id: 'colis', label: `Colis (${colis.length})`, icon: Package },
              { id: 'livreurs', label: `Livreurs (${livreurs.length})`, icon: Bike },
              { id: 'ecommercants', label: `E-commerçants (${ecommercants.length})`, icon: Store },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'config', label: 'Configuration', icon: Settings },
              { id: 'audit', label: 'Journal d\'Audit', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`px-3.5 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition ${
                    isActive
                      ? 'bg-[#1E40AF] text-white shadow-xs'
                      : 'text-blue-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ================================================================= */}
        {/* TAB 1 : VUE D'ENSEMBLE */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Tableau de Bord Général
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Surveillance en direct des agences 3PL partenaires, des flux de liquidité et des livraisons.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNewAgenceModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-blue-800 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.75} />
                  Inscrire une Agence
                </button>
              </div>
            </div>

            {/* 4 Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Volume d'affaires (COD)
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {totalGMV.toLocaleString('fr-FR')}{' '}
                  <span className="text-xs font-normal text-slate-500">FCFA</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold block">
                  Cash on Delivery collecté
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Agences 3PL Actives
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {agences.length}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  {agences.filter((a) => a.plan === 'business').length} Plan Business • {agences.filter((a) => a.plan === 'pro').length} Pro
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Courses Traitées
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Package className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {colis.length}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Taux de succès global : <strong>{tauxSuccesGlobal}%</strong>
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Flotte de Livreurs
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Bike className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {livreurs.length}
                </div>
                <span className="text-[11px] text-purple-600 font-semibold block">
                  Sacoches : {totalCashSacoches.toLocaleString('fr-FR')} F
                </span>
              </div>
            </div>

            {/* Deux colonnes : Dernières Agences & Activité Récente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dernières agences inscrites */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1E40AF]" strokeWidth={1.75} />
                    Agences Partenaires Récentes
                  </h3>
                  <button
                    onClick={() => setActiveTab('agences')}
                    className="text-xs text-[#1E40AF] font-bold hover:underline"
                  >
                    Voir toutes ({agences.length}) →
                  </button>
                </div>

                {agences.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 space-y-2 border border-dashed border-slate-200 rounded-lg">
                    <Building2 className="w-6 h-6 mx-auto text-slate-300" strokeWidth={1.75} />
                    <p className="text-xs font-semibold">Aucune agence pour le moment</p>
                    <p className="text-[11px]">Cliquez sur "Inscrire une Agence" pour créer la première.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {agences.slice(0, 5).map((a) => (
                      <div key={a.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">{a.nom}</span>
                          <span className="text-[11px] text-slate-500">
                            {a.ville}, {a.pays} • {a.telephone}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1E40AF] border border-blue-200 font-bold uppercase text-[10px]">
                            {a.plan}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {a.colisUtilises}/{a.limiteColis} colis
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Journal d'audit et actions administrateur */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1E40AF]" strokeWidth={1.75} />
                    Journal d'Audit Système
                  </h3>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-xs text-[#1E40AF] font-bold hover:underline"
                  >
                    Voir l'historique complet →
                  </button>
                </div>

                {auditLogs.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 space-y-2 border border-dashed border-slate-200 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" strokeWidth={1.75} />
                    <p className="text-xs font-semibold">Système 100% opérationnel</p>
                    <p className="text-[11px]">Toutes les actions administratives seront consignées ici.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                        <div>
                          <span className="font-mono font-bold text-slate-900 block text-[11px]">
                            {log.action}
                          </span>
                          <span className="text-slate-600 text-[11px]">{log.details}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(log.date).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2 : GESTION DES AGENCES 3PL */}
        {/* ================================================================= */}
        {activeTab === 'agences' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Gestion des Agences 3PL Partenaires
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pilotez les abonnements, les quotas de colis et de coursiers de chaque hub logistique.
                </p>
              </div>

              <button
                onClick={() => setIsNewAgenceModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-blue-800 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" strokeWidth={1.75} />
                Nouvelle Agence
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" strokeWidth={1.75} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher par nom, ville, email..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#1E40AF]"
                  />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {agences.length} agence(s) enregistrée(s)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Agence</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Hub / Pays</th>
                      <th className="py-3 px-4">Formule / Plan</th>
                      <th className="py-3 px-4">Quotas (Colis / Livreurs)</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {agences.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          Aucune agence inscrite. Cliquez sur "Nouvelle Agence" pour en ajouter une.
                        </td>
                      </tr>
                    ) : (
                      agences
                        .filter(
                          (a) =>
                            a.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            a.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            a.email.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((ag) => (
                          <tr key={ag.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">{ag.nom}</span>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {ag.id}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div>{ag.email}</div>
                              <div className="text-slate-400 font-mono text-[11px]">{ag.telephone}</div>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {ag.ville}, {ag.pays}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1E40AF] border border-blue-200 font-bold uppercase text-[10px]">
                                {ag.plan}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px]">
                              <div>Colis : {ag.colisUtilises} / {ag.limiteColis}</div>
                              <div className="text-slate-400">Livreurs : {ag.livreursUtilises} / {ag.limiteLivreurs}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ag.planStatut === 'actif'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {ag.planStatut}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedAgence(ag);
                                    setIsAgenceModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                                  title="Modifier"
                                >
                                  <Edit3 className="w-3.5 h-3.5" strokeWidth={1.75} />
                                </button>
                                <button
                                  onClick={() => handleDeleteAgence(ag.id, ag.nom)}
                                  className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3 : PAIEMENTS & MOBILE MONEY */}
        {/* ================================================================= */}
        {activeTab === 'paiements' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Paiements & Flux Financiers Mobile Money
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Suivi des abonnements par Mobile Money (Wave, Orange Money, MTN) et décaissements des agences.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Réf Transaction</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Destinataire</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          Aucune transaction enregistrée pour le moment.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {tx.id}
                          </td>
                          <td className="py-3 px-4 capitalize font-medium text-slate-800">
                            {tx.type.replace('_', ' ')}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {tx.destinataireType} ({tx.destinataireId})
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(tx.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" strokeWidth={1.75} />
                              {tx.statut}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                            +{tx.montant.toLocaleString('fr-FR')} FCFA
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4 : COLIS & LIVRAISONS GLOBALES */}
        {/* ================================================================= */}
        {activeTab === 'colis' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Supervision Globale des Colis
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Suivi national et inter-agences de l'ensemble des colis en circulation sur la plateforme Dropia.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">N° Tracking</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Montant COD</th>
                      <th className="py-3 px-4">Livreur Assigné</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4">Code OTP</th>
                      <th className="py-3 px-4 text-right">Action Forcée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {colis.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          Aucun colis en base pour le moment.
                        </td>
                      </tr>
                    ) : (
                      colis.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {c.trackingNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">{c.nomClient}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{c.telephoneClient}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800">{c.commune}</span>
                            <span className="text-[10px] text-slate-400 block">{c.ville}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {(c.montantCOD || 0).toLocaleString('fr-FR')} FCFA
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {c.nomLivreur || <span className="text-slate-400 italic">Non assigné</span>}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.statut === 'livre'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : c.statut === 'en_cours'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {c.statut}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            {c.codeOTP ? (
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                                {c.codeOTP}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {c.statut !== 'livre' && (
                                <button
                                  onClick={() => handleForceColisStatus(c.id, 'livre')}
                                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition shadow-2xs"
                                >
                                  Forcer Livré
                                </button>
                              )}
                              {c.statut !== 'annule' && (
                                <button
                                  onClick={() => handleForceColisStatus(c.id, 'annule')}
                                  className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] transition"
                                >
                                  Annuler
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5 : LIVREURS & FLOTTES */}
        {/* ================================================================= */}
        {activeTab === 'livreurs' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Supervision des Livreurs & Sacoches COD
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Visualisez l'état des coursiers de toutes les agences, gérez les codes PIN et auditez les fonds en main.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Livreur</th>
                      <th className="py-3 px-4">Téléphone</th>
                      <th className="py-3 px-4">Code PIN</th>
                      <th className="py-3 px-4">Zone d'intervention</th>
                      <th className="py-3 px-4">Véhicule</th>
                      <th className="py-3 px-4">Sacoche Espèces (COD)</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {livreurs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          Aucun coursier enregistré dans la flotte pour le moment.
                        </td>
                      </tr>
                    ) : (
                      livreurs.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {l.nom}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {l.telephone}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#1E40AF]">
                            <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                              {l.pin}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-800">
                            {l.zone}
                          </td>
                          <td className="py-3 px-4 capitalize text-slate-600">
                            {l.vehicule}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {(l.soldeCollecteAujourdhui || 0).toLocaleString('fr-FR')} FCFA
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                l.actif
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {l.actif ? 'Actif' : 'Bloqué'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedLivreur(l);
                                setNewPin(l.pin);
                              }}
                              className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-[11px] transition"
                            >
                              Changer PIN
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6 : E-COMMERÇANTS */}
        {/* ================================================================= */}
        {activeTab === 'ecommercants' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Commerçants & Boutiques E-commerce
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Modérez et approuvez les boutiques affiliées aux agences 3PL du réseau Dropia.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Boutique</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Ville</th>
                      <th className="py-3 px-4">Agence Assignée</th>
                      <th className="py-3 px-4">Commandes</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ecommercants.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          Aucun commerçant enregistré.
                        </td>
                      </tr>
                    ) : (
                      ecommercants.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {m.nomBoutique}
                          </td>
                          <td className="py-3 px-4">
                            <div>{m.email}</div>
                            <div className="text-slate-400 font-mono text-[11px]">{m.telephone}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {m.ville || 'Dakar'}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                            {m.agenceId || <span className="text-slate-400 italic">Non liée</span>}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {m.commandesTotales || 0}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                m.statut === 'actif'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {m.statut}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleToggleEcommercant(m.id, m.statut)}
                              className={`px-3 py-1 rounded font-bold text-[11px] transition ${
                                m.statut === 'actif'
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs'
                              }`}
                            >
                              {m.statut === 'actif' ? 'Suspendre' : 'Valider'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7 : ANALYTICS GLOBALES */}
        {/* ================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Performances & Analytics Globales
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Métriques agrégées du réseau Dropia sur toute l'Afrique.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Revenu Frais de Livraison
                </span>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {totalFrais.toLocaleString('fr-FR')} FCFA
                </div>
                <span className="text-xs text-slate-500">Marge brute générée par les courses</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Part Mobile Money
                </span>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  92.4%
                </div>
                <span className="text-xs text-emerald-600 font-semibold">Wave & Orange Money prioritaires</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  SLA Moyen de Livraison
                </span>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  42 min
                </div>
                <span className="text-xs text-slate-500">Temps entre dispatch et validation OTP</span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 8 : CONFIGURATION & SÉCURITÉ */}
        {/* ================================================================= */}
        {activeTab === 'config' && platformConfig && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Paramètres Système & Sécurité
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configuration des passerelles de paiement, webhooks et permissions de l'administrateur ({SUPER_ADMIN_EMAIL}).
              </p>
            </div>

            <form onSubmit={handleSavePlatformConfig} className="space-y-4 max-w-2xl text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nom de la Plateforme
                  </label>
                  <input
                    type="text"
                    value={platformConfig.nomPlateforme}
                    onChange={(e) =>
                      setPlatformConfig({ ...platformConfig, nomPlateforme: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Devise Principale
                  </label>
                  <input
                    type="text"
                    value={platformConfig.devisePrincipale}
                    onChange={(e) =>
                      setPlatformConfig({ ...platformConfig, devisePrincipale: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Taux de Commission Plateforme (%)
                  </label>
                  <input
                    type="number"
                    value={platformConfig.tauxCommissionDefaut}
                    onChange={(e) =>
                      setPlatformConfig({
                        ...platformConfig,
                        tauxCommissionDefaut: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Frais de Livraison par Défaut (FCFA)
                  </label>
                  <input
                    type="number"
                    value={platformConfig.fraisLivraisonDefaut}
                    onChange={(e) =>
                      setPlatformConfig({
                        ...platformConfig,
                        fraisLivraisonDefaut: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">Passerelle de Paiement Mobile Money (SasPay)</h4>
                  <a
                    href="https://docs.saspay.me/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#1E40AF] hover:underline font-semibold flex items-center gap-1"
                  >
                    Documentation API SasPay ↗
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Identifiant Passerelle (Client ID)
                    </label>
                    <input
                      type="text"
                      value={platformConfig.saspayClientId || ''}
                      onChange={(e) =>
                        setPlatformConfig({ ...platformConfig, saspayClientId: e.target.value })
                      }
                      placeholder="sp_live_..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF] font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Clé Secrète API SasPay (Secret Key)
                    </label>
                    <input
                      type="password"
                      value={platformConfig.saspayApiKey || ''}
                      onChange={(e) =>
                        setPlatformConfig({ ...platformConfig, saspayApiKey: e.target.value })
                      }
                      placeholder="sk_live_... ou sk_test_..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF] font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Mode Passerelle
                    </label>
                    <select
                      value={platformConfig.saspayMode || 'live'}
                      onChange={(e) =>
                        setPlatformConfig({
                          ...platformConfig,
                          saspayMode: e.target.value as 'test' | 'live'
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF] text-xs"
                    >
                      <option value="live">Mode Production (Live Mobile Money)</option>
                      <option value="test">Mode Bac à sable (Test)</option>
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Renseignez votre clé d'API SasPay pour déduire les débits réels Mobile Money (Wave, Orange, MTN, Moov) et activer les redirections vers le paiement sécurisé SasPay (<a href="https://docs.saspay.me/" target="_blank" rel="noreferrer" className="text-[#1E40AF] underline">docs.saspay.me</a>).
                </p>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platformConfig.canalWhatsAppActif}
                      onChange={(e) =>
                        setPlatformConfig({
                          ...platformConfig,
                          canalWhatsAppActif: e.target.checked
                        })
                      }
                      className="rounded text-[#1E40AF] focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700">Passerelle WhatsApp OTP Active</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platformConfig.smsGatewayActif}
                      onChange={(e) =>
                        setPlatformConfig({
                          ...platformConfig,
                          smsGatewayActif: e.target.checked
                        })
                      }
                      className="rounded text-[#1E40AF] focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700">Passerelle SMS Active</span>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-blue-800 text-white font-bold transition shadow-xs"
                >
                  Enregistrer les Paramètres
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 9 : JOURNAL D'AUDIT */}
        {/* ================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Journal d'Audit Système
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Traçabilité rigoureuse de toutes les modifications, suppressions et actions des administrateurs.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Détails</th>
                      <th className="py-3 px-4">Auteur</th>
                      <th className="py-3 px-4 text-right">Date & Heure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-500">
                          Aucun événement consigné pour le moment.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-[#1E40AF]">
                            {log.action}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {log.details}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {log.auteur}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-400 font-mono">
                            {new Date(log.date).toLocaleString('fr-FR')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =================================================================== */}
      {/* MODAL : MODIFIER UNE AGENCE */}
      {/* =================================================================== */}
      {isAgenceModalOpen && selectedAgence && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Modifier l'Agence : {selectedAgence.nom}
              </h3>
              <button
                onClick={() => setIsAgenceModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nom de l'agence</label>
                <input
                  type="text"
                  value={selectedAgence.nom}
                  onChange={(e) => setSelectedAgence({ ...selectedAgence, nom: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Formule d'Abonnement</label>
                  <select
                    value={selectedAgence.plan}
                    onChange={(e) =>
                      setSelectedAgence({
                        ...selectedAgence,
                        plan: e.target.value as 'starter' | 'pro' | 'business'
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  >
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Statut Plan</label>
                  <select
                    value={selectedAgence.planStatut}
                    onChange={(e) =>
                      setSelectedAgence({
                        ...selectedAgence,
                        planStatut: e.target.value as 'actif' | 'essai' | 'impaye' | 'annule'
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  >
                    <option value="actif">Actif</option>
                    <option value="essai">Essai</option>
                    <option value="impaye">Impayé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Limite Colis</label>
                  <input
                    type="number"
                    value={selectedAgence.limiteColis}
                    onChange={(e) =>
                      setSelectedAgence({
                        ...selectedAgence,
                        limiteColis: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Limite Coursiers</label>
                  <input
                    type="number"
                    value={selectedAgence.limiteLivreurs}
                    onChange={(e) =>
                      setSelectedAgence({
                        ...selectedAgence,
                        limiteLivreurs: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAgenceModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveAgence}
                className="px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-blue-800 text-white font-bold"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL : INSCRIRE NOUVELLE AGENCE */}
      {/* =================================================================== */}
      {isNewAgenceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAgence}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Inscrire une Nouvelle Agence 3PL
              </h3>
              <button
                type="button"
                onClick={() => setIsNewAgenceModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nom de l'agence *</label>
                <input
                  type="text"
                  required
                  value={newAgenceForm.nom}
                  onChange={(e) => setNewAgenceForm({ ...newAgenceForm, nom: e.target.value })}
                  placeholder="ex: Dakar Express Logistique"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Agence *</label>
                  <input
                    type="email"
                    required
                    value={newAgenceForm.email}
                    onChange={(e) => setNewAgenceForm({ ...newAgenceForm, email: e.target.value })}
                    placeholder="contact@agence.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={newAgenceForm.telephone}
                    onChange={(e) =>
                      setNewAgenceForm({ ...newAgenceForm, telephone: e.target.value })
                    }
                    placeholder="+221 77 123 45 67"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ville / Hub</label>
                  <input
                    type="text"
                    value={newAgenceForm.ville}
                    onChange={(e) => setNewAgenceForm({ ...newAgenceForm, ville: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pays</label>
                  <input
                    type="text"
                    value={newAgenceForm.pays}
                    onChange={(e) => setNewAgenceForm({ ...newAgenceForm, pays: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Formule d'Abonnement</label>
                  <select
                    value={newAgenceForm.plan}
                    onChange={(e) =>
                      setNewAgenceForm({
                        ...newAgenceForm,
                        plan: e.target.value as 'starter' | 'pro' | 'business'
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  >
                    <option value="starter">Starter (800 colis, 5 livreurs)</option>
                    <option value="pro">Pro (2 500 colis, 15 livreurs)</option>
                    <option value="business">Business (Illimité)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Statut Initial</label>
                  <select
                    value={newAgenceForm.planStatut}
                    onChange={(e) =>
                      setNewAgenceForm({
                        ...newAgenceForm,
                        planStatut: e.target.value as 'actif' | 'essai'
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
                  >
                    <option value="actif">Actif (Payé)</option>
                    <option value="essai">Essai gratuit (14 jours)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewAgenceModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-blue-800 text-white font-bold"
              >
                Créer l'Agence
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL : MODIFIER PIN LIVREUR */}
      {/* =================================================================== */}
      {selectedLivreur && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">
              Réinitialiser le Code PIN : {selectedLivreur.nom}
            </h3>
            <p className="text-slate-500 text-[11px]">
              Définissez un nouveau code PIN à 4 chiffres permettant au livreur de se connecter à l'application mobile.
            </p>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Nouveau Code PIN</label>
              <input
                type="text"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="ex: 1234"
                className="w-full px-3 py-2 text-center text-lg font-mono tracking-widest rounded-lg border border-slate-300 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedLivreur(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold"
              >
                Annuler
              </button>
              <button
                onClick={() => handleResetPin(selectedLivreur.id)}
                className="px-4 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-blue-800 text-white font-bold"
              >
                Valider le PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
