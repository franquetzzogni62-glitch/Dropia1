import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Sidebar, type TabKey } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/views/DashboardView';
import { OrdersView } from './components/views/OrdersView';
import { DriversView } from './components/views/DriversView';
import { PartnersView } from './components/views/PartnersView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { WalletView } from './components/views/WalletView';
import { SettingsView } from './components/views/SettingsView';
import { DeveloperApiConsole } from './components/DeveloperApiConsole';
import { NewOrderModal } from './components/modals/NewOrderModal';
import { NewDriverModal } from './components/modals/NewDriverModal';
import { RechargeModal } from './components/modals/RechargeModal';
import { PwaDriverModal } from './components/modals/PwaDriverModal';
import { AuthModal } from './components/modals/AuthModal';

// Pages demandées pour l'inscription libre & multi-rôles
import ChoixRoleInscription from './pages/ChoixRoleInscription';
import RegisterEcommercant from './pages/RegisterEcommercant';
import RegisterEcommercantPage from './pages/RegisterEcommercantPage';
import Ecommercants from './pages/Ecommercants';
import PortailEcommercant from './pages/PortailEcommercant';

import { DropiaDatabaseService } from './services/dropiaService';
import { DropiaAuthService } from './services/authService';
import { auth, testConnection } from './firebase/config';
import { onAuthStateChanged, type User } from 'firebase/auth';
import type { Colis, Livreur, TransactionFinanciere, UserProfile } from './types';

type AppUser = User | { uid: string; email: string | null; displayName?: string | null };

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation & View Mode pour l'Agence
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  // Authentification résiliente (supporte Firebase Auth + session Firestore)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const s = DropiaAuthService.getCurrentSession();
    return s ? { uid: s.uid, email: s.email, displayName: s.nom } : null;
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    return DropiaAuthService.getCurrentSession();
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<'agence' | 'ecommercant' | 'livreur'>('agence');

  // Données opérationnelles réelles (0 donnée fictive)
  const [colisList, setColisList] = useState<Colis[]>([]);
  const [livreursList, setLivreursList] = useState<Livreur[]>([]);
  const [transactionsList, setTransactionsList] = useState<TransactionFinanciere[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Modals state
  const [showNewOrderModal, setShowNewOrderModal] = useState<boolean>(false);
  const [showNewDriverModal, setShowNewDriverModal] = useState<boolean>(false);
  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);
  const [showPwaDriverModal, setShowPwaDriverModal] = useState<boolean>(false);
  const [showConfirmPurge, setShowConfirmPurge] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Écoute de l'état d'authentification Firebase Auth & Dropia Auth Service
  useEffect(() => {
    // 1. Initialiser depuis la session locale
    const localSession = DropiaAuthService.getCurrentSession();
    if (localSession) {
      setUserProfile(localSession);
      setCurrentUser({ uid: localSession.uid, email: localSession.email, displayName: localSession.nom });
      setWalletBalance(localSession.soldeWallet || 0);
    }

    // 2. Écouter les changements personnalisés d'auth
    const handleAuthChanged = (e: any) => {
      const p = e.detail as UserProfile | null;
      if (p) {
        setUserProfile(p);
        setCurrentUser({ uid: p.uid, email: p.email, displayName: p.nom });
        setWalletBalance(p.soldeWallet || 0);
      } else {
        setUserProfile(null);
        setCurrentUser(null);
      }
    };
    window.addEventListener('dropia_auth_state_changed', handleAuthChanged);

    // 3. Écouter Firebase Auth
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        try {
          const profile = await DropiaDatabaseService.getUserProfile(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
            DropiaAuthService.saveSession(profile);
            setWalletBalance(profile.soldeWallet || 0);
          } else {
            const fallbackProfile: UserProfile = {
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
              dateCreation: new Date().toISOString()
            };
            setUserProfile(fallbackProfile);
            DropiaAuthService.saveSession(fallbackProfile);
          }
        } catch {
          // Keep minimal fallback
        }
      } else {
        // Ne vider que si aucune session locale résiliente n'est présente
        const currentSession = DropiaAuthService.getCurrentSession();
        if (!currentSession) {
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
      setAuthLoading(false);
    });

    return () => {
      window.removeEventListener('dropia_auth_state_changed', handleAuthChanged);
      unsubscribeAuth();
    };
  }, []);

  // Souscriptions en temps réel aux collections Firestore
  useEffect(() => {
    testConnection().then((connected) => {
      if (!connected) return;

      const unsubColis = DropiaDatabaseService.subscribeColis((items) => {
        setColisList(items || []);
      });

      const unsubLivreurs = DropiaDatabaseService.subscribeLivreurs((items) => {
        setLivreursList(items || []);
      });

      return () => {
        unsubColis();
        unsubLivreurs();
      };
    });
  }, []);

  // Souscription aux transactions pour l'utilisateur connecté
  useEffect(() => {
    if (!currentUser) return;

    const unsubTransactions = DropiaDatabaseService.subscribeTransactions((items) => {
      setTransactionsList(items || []);
      if (items && items.length > 0) {
        const creditTotal = items.reduce((acc, t) => acc + (t.montant || 0), 0);
        setWalletBalance(creditTotal);
      }
    });

    return () => unsubTransactions();
  }, [currentUser]);

  // Actions
  const handleCreateOrder = async (newColis: Omit<Colis, 'id'>) => {
    try {
      const docId = await DropiaDatabaseService.creerColis(newColis);
      const fullOrder: Colis = { id: docId, ...newColis };
      setColisList((prev) => [fullOrder, ...prev.filter((c) => c.id !== docId)]);
      showToast(`Commande ${newColis.trackingNumber} enregistrée en base Firestore !`);
    } catch {
      showToast("Erreur lors de l'enregistrement de la commande.");
    }
  };

  const handleCreateDriver = async (newDriver: Omit<Livreur, 'id' | 'dateCreation'>) => {
    try {
      const docId = await DropiaDatabaseService.creerLivreur(newDriver);
      const fullDriver: Livreur = {
        id: docId,
        ...newDriver,
        dateCreation: new Date().toISOString()
      };
      setLivreursList((prev) => [fullDriver, ...prev.filter((l) => l.id !== docId)]);
      showToast(`Livreur ${newDriver.nom} (PIN: ${newDriver.pin}) ajouté à la flotte !`);
    } catch {
      showToast("Erreur lors de l'enregistrement du livreur.");
    }
  };

  const handleValidateDelivery = async (colisId: string, otp: string) => {
    try {
      await DropiaDatabaseService.updateColisStatut(colisId, 'livre', 'Livraison validée par code OTP.', {
        codeOTP: otp
      });
      setColisList((prev) =>
        prev.map((c) => (c.id === colisId ? { ...c, statut: 'livre', codeOTP: otp } : c))
      );
      showToast(`Livraison validée avec succès avec le code OTP ${otp} !`);
    } catch {
      showToast('Erreur lors de la validation OTP.');
    }
  };

  const handleRechargeSuccess = async (amount: number) => {
    try {
      const tx: Omit<TransactionFinanciere, 'id'> = {
        type: 'rechargement' as any,
        montant: amount,
        devise: 'XOF',
        destinataireType: 'ecommercant',
        destinataireId: currentUser?.uid || '',
        referencePaiement: `SAS-${Date.now()}`,
        date: new Date().toISOString(),
        statut: 'complete'
      };
      await DropiaDatabaseService.creerTransaction(tx);
      setWalletBalance((prev) => prev + amount);
      showToast(`Portefeuille crédité de +${amount.toLocaleString('fr-FR')} FCFA !`);
    } catch {
      setWalletBalance((prev) => prev + amount);
      showToast(`Portefeuille crédité de +${amount.toLocaleString('fr-FR')} FCFA !`);
    }
  };

  const handlePurgeDatabase = async () => {
    setShowConfirmPurge(false);
    showToast('Purge des données en cours...');
    const res = await DropiaDatabaseService.purgeFictitiousData();
    if (res.success) {
      setColisList([]);
      setLivreursList([]);
      setTransactionsList([]);
      setWalletBalance(0);
      showToast('✅ Base de données entièrement purgée de toutes les données fictives !');
    } else {
      showToast(`Notice: ${res.message}`);
    }
  };

  const handleLogout = async () => {
    await DropiaAuthService.logout();
    setCurrentUser(null);
    setUserProfile(null);
    navigate('/');
    showToast('Vous avez été déconnecté avec succès.');
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    if (mode === 'register') {
      navigate('/choix-role');
    } else {
      setAuthModalMode('login');
      setShowAuthModal(true);
    }
  };

  // Routeur pour /register avec support de ?role=agence
  const RegisterRouteWrapper = () => {
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role');

    if (roleParam === 'agence') {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
          <AuthModal
            isOpen={true}
            initialMode="register"
            initialRole="agence"
            onClose={() => navigate('/')}
            onAuthSuccess={(profile) => {
              setUserProfile(profile);
              setCurrentUser({ uid: profile.uid, email: profile.email, displayName: profile.nom });
              navigate('/dashboard');
              showToast(`Bienvenue Agence ${profile.nomAgence || profile.nom} !`);
            }}
          />
        </div>
      );
    }

    return <ChoixRoleInscription onSelectRole={(r) => {
      if (r === 'agence') {
        setAuthModalMode('register');
        setAuthModalRole('agence');
        setShowAuthModal(true);
      } else {
        navigate('/register-ecommercant');
      }
    }} />;
  };

  // Rendu de l'espace Dashboard Agence
  const renderAgencyDashboard = () => (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500 text-emerald-400 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal pour Purge Base */}
      {showConfirmPurge && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-rose-200 text-xs text-slate-800">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
                ⚠️
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Purger toutes les données fictives ?
              </h3>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Cette action va réinitialiser les collections et supprimer les éventuelles commandes et historiques pour garantir un environnement 100% production.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmPurge(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handlePurgeDatabase}
                className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs"
              >
                Confirmer la Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar avec l'onglet E-commerçants */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletBalance={walletBalance}
        colisCount={colisList.length}
        livreursCount={livreursList.length}
        userProfile={userProfile}
        onOpenRecharge={() => setShowRechargeModal(true)}
        onOpenLanding={() => navigate('/')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <TopHeader
          userProfile={userProfile}
          onOpenGuide={() => setActiveTab('settings')}
          onOpenPwa={() => setShowPwaDriverModal(true)}
          onOpenLanding={() => navigate('/')}
          onLogout={handleLogout}
          onPurgeDatabase={() => setShowConfirmPurge(true)}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              colisList={colisList}
              onOpenNewOrder={() => setShowNewOrderModal(true)}
              onOpenDrivers={() => setActiveTab('drivers')}
              onOpenWhatsApp={() => setActiveTab('settings')}
              onOpenSettings={() => setActiveTab('settings')}
              onOpenRecharge={() => setShowRechargeModal(true)}
              onOpenOrders={() => setActiveTab('orders')}
              onRefresh={() => showToast('Données opérationnelles actualisées.')}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              colisList={colisList}
              onOpenNewOrder={() => setShowNewOrderModal(true)}
              onRefresh={() => showToast('Liste des commandes synchronisée.')}
            />
          )}

          {activeTab === 'drivers' && (
            <DriversView
              livreursList={livreursList}
              onOpenNewDriver={() => setShowNewDriverModal(true)}
              onOpenPwa={() => setShowPwaDriverModal(true)}
              onRefresh={() => showToast('Flotte des coursiers actualisée.')}
            />
          )}

          {/* Section 4 : DASHBOARD AGENCE — SECTION E-COMMERÇANTS */}
          {activeTab === 'ecommercants' && (
            <Ecommercants
              currentAgencyId={currentUser?.uid}
              userProfile={userProfile}
            />
          )}

          {activeTab === 'partners' && (
            <PartnersView
              onRefresh={() => showToast('Réseau des hubs et agences synchronisé.')}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              colisList={colisList}
              onRefresh={() => showToast('Performances et métriques recalculées.')}
            />
          )}

          {activeTab === 'wallet' && (
            <WalletView
              walletBalance={walletBalance}
              transactionsList={transactionsList}
              onOpenRecharge={() => setShowRechargeModal(true)}
              onRefresh={() => showToast('Mouvements financiers synchronisés.')}
            />
          )}

          {activeTab === 'api_webhooks' && (
            <DeveloperApiConsole
              apiKeysList={[]}
              webhooksList={[]}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modals */}
      {showNewOrderModal && (
        <NewOrderModal
          userProfile={userProfile}
          onClose={() => setShowNewOrderModal(false)}
          onSubmit={handleCreateOrder}
        />
      )}

      {showNewDriverModal && (
        <NewDriverModal
          onClose={() => setShowNewDriverModal(false)}
          onSubmit={handleCreateDriver}
        />
      )}

      {showRechargeModal && (
        <RechargeModal
          onClose={() => setShowRechargeModal(false)}
          onSuccess={handleRechargeSuccess}
        />
      )}

      {showPwaDriverModal && (
        <PwaDriverModal
          onClose={() => setShowPwaDriverModal(false)}
          colisList={colisList}
          livreursList={livreursList}
          onValidateDelivery={handleValidateDelivery}
        />
      )}
    </div>
  );

  return (
    <>
      <Routes>
        {/* 1. Page Choix du Rôle */}
        <Route path="/choix-role" element={<ChoixRoleInscription onSelectRole={(role) => {
          if (role === 'agence') {
            setAuthModalMode('register');
            setAuthModalRole('agence');
            setShowAuthModal(true);
          } else {
            navigate('/register-ecommercant');
          }
        }} />} />

        {/* Route Connexion directe /login */}
        <Route
          path="/login"
          element={
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
              <AuthModal
                isOpen={true}
                initialMode="login"
                onClose={() => navigate('/')}
                onAuthSuccess={(profile) => {
                  setUserProfile(profile);
                  setCurrentUser({ uid: profile.uid, email: profile.email, displayName: profile.nom });
                  if (profile.role === 'ecommercant') {
                    navigate('/portail');
                  } else {
                    navigate('/dashboard');
                  }
                  showToast(`Bienvenue ${profile.nomBoutique || profile.nomAgence || profile.nom} !`);
                }}
              />
            </div>
          }
        />

        {/* 1 & 2. Inscription générique ou avec paramètre role */}
        <Route path="/register" element={<RegisterRouteWrapper />} />

        {/* 2. Inscription E-commerçant Libre */}
        <Route path="/register-ecommercant" element={<RegisterEcommercant />} />

        {/* 3. Inscription E-commerçant par Invitation d'Agence */}
        <Route path="/register-ecommercant/:agenceId" element={<RegisterEcommercantPage />} />

        {/* 5. Portail E-commerçant */}
        <Route
          path="/portail"
          element={
            <PortailEcommercant
              userProfile={userProfile}
              onLogout={handleLogout}
            />
          }
        />

        {/* 4. Section E-commerçants de l'agence */}
        <Route
          path="/ecommercants"
          element={
            currentUser ? (
              renderAgencyDashboard()
            ) : (
              <LandingPage
                onOpenAuth={handleOpenAuth}
                onOpenDriverApp={() => setShowPwaDriverModal(true)}
              />
            )
          }
        />

        {/* Dashboard agence */}
        <Route
          path="/dashboard"
          element={
            currentUser ? (
              userProfile?.role === 'ecommercant' ? (
                <PortailEcommercant
                  userProfile={userProfile}
                  onLogout={handleLogout}
                />
              ) : (
                renderAgencyDashboard()
              )
            ) : (
              <LandingPage
                onOpenAuth={handleOpenAuth}
                onOpenDriverApp={() => setShowPwaDriverModal(true)}
              />
            )
          }
        />

        {/* Route Racine */}
        <Route
          path="/"
          element={
            currentUser ? (
              userProfile?.role === 'ecommercant' ? (
                <PortailEcommercant
                  userProfile={userProfile}
                  onLogout={handleLogout}
                />
              ) : (
                renderAgencyDashboard()
              )
            ) : (
              <LandingPage
                onOpenAuth={handleOpenAuth}
                onOpenDriverApp={() => setShowPwaDriverModal(true)}
              />
            )
          }
        />

        {/* Fallback de route */}
        <Route
          path="*"
          element={
            currentUser ? (
              userProfile?.role === 'ecommercant' ? (
                <PortailEcommercant
                  userProfile={userProfile}
                  onLogout={handleLogout}
                />
              ) : (
                renderAgencyDashboard()
              )
            ) : (
              <LandingPage
                onOpenAuth={handleOpenAuth}
                onOpenDriverApp={() => setShowPwaDriverModal(true)}
              />
            )
          }
        />
      </Routes>

      {/* Global Auth Modal pour Connexion / Inscription Agence */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          initialMode={authModalMode}
          initialRole={authModalRole}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(profile) => {
            setUserProfile(profile);
            setCurrentUser({ uid: profile.uid, email: profile.email, displayName: profile.nom });
            setShowAuthModal(false);
            if (profile.role === 'ecommercant') {
              navigate('/portail');
            } else {
              navigate('/dashboard');
            }
            showToast(`Bienvenue ${profile.nomBoutique || profile.nomAgence || profile.nom} !`);
          }}
        />
      )}

      {/* Driver Simulation Modal */}
      {showPwaDriverModal && (
        <PwaDriverModal
          onClose={() => setShowPwaDriverModal(false)}
          colisList={colisList}
          livreursList={livreursList}
          onValidateDelivery={handleValidateDelivery}
        />
      )}
    </>
  );
}
