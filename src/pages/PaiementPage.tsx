import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DropiaDatabaseService } from '../services/dropiaService';
import { AdminService } from '../services/adminService';
import { 
  CreditCard, Smartphone, Check, X, Loader, 
  ArrowLeft, Shield, CheckCircle2, AlertTriangle, ExternalLink,
  Zap, Key, Globe, Lock, Clock, ArrowRight, RefreshCw
} from 'lucide-react';
import type { TransactionFinanciere, PlatformConfig } from '../types';

const OPERATEURS = [
  { id: 'wave', nom: 'Wave Money', icone: '🔵', desc: 'Sénégal & Côte d\'Ivoire' },
  { id: 'orange', nom: 'Orange Money', icone: '🟠', desc: 'CI, Sénégal, Cameroun, Mali' },
  { id: 'mtn', nom: 'MTN Mobile Money', icone: '🟡', desc: 'CI, Cameroun, Bénin' },
  { id: 'moov', nom: 'Moov Money', icone: '🔵', desc: 'CI, Bénin, Togo' },
  { id: 'airtel', nom: 'Airtel Money', icone: '🔴', desc: 'Congo, Gabon, RDC' },
  { id: 'mpesa', nom: 'M-Pesa', icone: '🟢', desc: 'RDC, Kenya' },
];

export default function PaiementPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();

  const planId = searchParams.get('plan') || 'pro';
  const cycle = searchParams.get('cycle') || 'mensuel';
  const type = searchParams.get('type') || 'abonnement';
  const montant = parseInt(searchParams.get('montant') || '5500', 10);
  const statusParam = searchParams.get('status');

  const [operateur, setOperateur] = useState('wave');
  const [telephone, setTelephone] = useState(profile?.telephone || '+225 07 ');
  const [loading, setLoading] = useState(false);
  const [etape, setEtape] = useState<'formulaire' | 'attente' | 'succes' | 'erreur'>('formulaire');
  const [erreur, setErreur] = useState('');
  const [reference, setReference] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [modePaiement, setModePaiement] = useState<'redirect' | 'push'>('redirect');
  const [autoRedirect, setAutoRedirect] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig | null>(null);
  const [customApiKey, setCustomApiKey] = useState('');

  // 1. Charger la configuration plateforme SasPay & vérifier un retour de paiement réussi
  useEffect(() => {
    AdminService.getPlatformConfig()
      .then((cfg) => {
        setPlatformConfig(cfg);
        if (cfg.saspayApiKey) {
          setCustomApiKey(cfg.saspayApiKey);
        }
      })
      .catch(() => {});

    // Détection d'un retour automatique depuis SasPay Checkout
    if (statusParam === 'success' || statusParam === 'completed') {
      finaliserPaiementApresSaspay();
    }
  }, [statusParam]);

  // Décompte pour redirection automatique vers SasPay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (etape === 'attente' && modePaiement === 'redirect' && autoRedirect && paymentUrl && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (etape === 'attente' && modePaiement === 'redirect' && autoRedirect && paymentUrl && countdown === 0) {
      window.location.href = paymentUrl;
    }
    return () => clearTimeout(timer);
  }, [etape, modePaiement, autoRedirect, paymentUrl, countdown]);

  // Finalisation automatique après paiement
  const finaliserPaiementApresSaspay = async () => {
    setLoading(true);
    try {
      const genRef = reference || `SAS-RET-${Date.now().toString(36).toUpperCase()}`;
      setReference(genRef);

      const tx: Omit<TransactionFinanciere, 'id'> = {
        type: (type === 'recharge' ? 'rechargement' : 'frais_livraison') as any,
        montant,
        devise: 'XOF',
        destinataireType: profile?.role === 'ecommercant' ? 'ecommercant' : 'agence',
        destinataireId: profile?.uid || 'user_anon',
        referencePaiement: genRef,
        date: new Date().toISOString(),
        statut: 'complete'
      };
      await DropiaDatabaseService.creerTransaction(tx).catch(() => {});

      if (profile) {
        if (type === 'recharge') {
          const newBalance = (profile.soldeWallet || 0) + montant;
          await updateProfile({ soldeWallet: newBalance });
        } else if (type === 'abonnement') {
          const validPlan = planId === 'business' ? 'business' : planId === 'starter' ? 'starter' : 'pro';
          await updateProfile({
            plan: validPlan,
            planStatut: 'actif'
          });
        }
      }

      setEtape('succes');
    } catch (err: any) {
      setErreur(err.message || 'Erreur lors de la validation finale');
      setEtape('erreur');
    } finally {
      setLoading(false);
    }
  };

  // 2. Initier le paiement via l'API SasPay (/api/saspay/create-payment)
  const handlePayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');

    if (!operateur) {
      setErreur('Veuillez sélectionner un opérateur Mobile Money.');
      return;
    }

    if (!telephone.trim() || telephone.trim().length < 8) {
      setErreur('Veuillez renseigner un numéro de téléphone valide.');
      return;
    }

    setLoading(true);

    try {
      const activeKey = customApiKey || platformConfig?.saspayApiKey || '';
      const returnUrl = `${window.location.origin}/paiement?status=success&type=${type}&plan=${planId}&cycle=${cycle}&montant=${montant}&operator=${operateur}`;

      const res = await fetch('/api/saspay/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SasPay-Key': activeKey
        },
        body: JSON.stringify({
          montant,
          telephone,
          operateur,
          type,
          planId,
          cycle,
          description: type === 'abonnement'
            ? `Abonnement Dropia Forfait ${planId.toUpperCase()} (${cycle})`
            : `Rechargement Portefeuille Dropia (${montant.toLocaleString('fr-FR')} FCFA)`,
          customerEmail: profile?.email || 'client@dropia.com',
          customerName: profile?.nom || profile?.nomBoutique || 'Client Dropia',
          apiKey: activeKey,
          returnUrl
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Échec de la connexion à la passerelle SasPay.');
      }

      setReference(data.reference || `SAS-${Date.now()}`);
      setPaymentUrl(data.paymentUrl || `https://checkout.saspay.me/pay/${data.reference}`);
      setTransactionId(data.transactionId || '');
      setIsLiveConnected(!!data.isLiveConnected);
      setInstructions(data.instructions || '');

      setEtape('attente');
      setCountdown(3);

      // Si mode direct redirection activé sans délai, on peut rediriger tout de suite
      if (modePaiement === 'redirect' && autoRedirect && data.paymentUrl) {
        // Le countdown effectuera la redirection, ou l'utilisateur peut cliquer immédiatement
      }
    } catch (err: any) {
      setErreur(err.message || 'Impossible d\'initier le paiement avec SasPay.');
      setEtape('erreur');
    } finally {
      setLoading(false);
    }
  };

  // 3. Sauvegarder la clé API SasPay
  const handleSaveSaspayConfig = async () => {
    try {
      if (platformConfig) {
        const updated = { ...platformConfig, saspayApiKey: customApiKey };
        await AdminService.updatePlatformConfig(updated);
        setPlatformConfig(updated);
      }
      setShowConfigModal(false);
    } catch (err) {
      console.error(err);
      setShowConfigModal(false);
    }
  };

  // Écran d'attente de confirmation / Redirection vers SasPay
  if (etape === 'attente') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 max-w-lg w-full text-center shadow-xl space-y-6">
          <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mx-auto border border-[#DBEAFE] text-[#1E40AF]">
            {modePaiement === 'redirect' ? (
              <ExternalLink className="w-8 h-8 animate-pulse" strokeWidth={1.75} />
            ) : (
              <Loader className="w-8 h-8 animate-spin" strokeWidth={1.75} />
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1E40AF] text-xs font-bold border border-blue-200 mb-2">
              <Shield className="w-3.5 h-3.5" />
              Passerelle Sécurisée SasPay (docs.saspay.me)
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              {modePaiement === 'redirect'
                ? 'Redirection vers SasPay Checkout'
                : 'En attente de votre validation Mobile Money'}
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Montant : <strong className="text-[#0F172A] font-mono text-sm">{montant.toLocaleString('fr-FR')} FCFA</strong> • Opérateur : <strong className="text-[#0F172A]">{OPERATEURS.find(o => o.id === operateur)?.nom}</strong>
            </p>
          </div>

          {/* Bandeau SasPay Live */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-xs text-left space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span>Référence SasPay :</span>
              <code className="font-mono font-bold text-[#1E40AF] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{reference}</code>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Compte Mobile Money :</span>
              <strong className="text-slate-800 font-mono">{telephone}</strong>
            </div>
            {instructions && (
              <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                {instructions}
              </p>
            )}
          </div>

          {/* Action principale : Redirection directe vers SasPay */}
          {modePaiement === 'redirect' && paymentUrl && (
            <div className="space-y-3">
              <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] p-3 rounded-xl text-xs flex items-center justify-between">
                <span>Redirection automatique dans <strong>{countdown}s</strong>...</span>
                <button
                  type="button"
                  onClick={() => setAutoRedirect(false)}
                  className="text-xs underline font-bold cursor-pointer"
                >
                  Suspendre
                </button>
              </div>

              <a
                href={paymentUrl}
                className="w-full py-3.5 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Accéder immédiatement à SasPay Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Si Push Mobile Money direct : option de valider ou basculer sur le lien web */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={finaliserPaiementApresSaspay}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              J'ai validé mon code PIN sur mon téléphone
            </button>

            {paymentUrl && (
              <a
                href={paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ouvrir la page de paiement SasPay dans un nouvel onglet
              </a>
            )}

            <button
              onClick={() => setEtape('formulaire')}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium py-1"
            >
              ← Modifier mes informations
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Écran de succès
  if (etape === 'succes') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 max-w-md w-full text-center shadow-xl space-y-6">
          <div className="w-16 h-16 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto border border-[#A7F3D0]">
            <Check className="w-8 h-8 text-[#059669]" strokeWidth={2} />
          </div>

          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold mb-2">
              Validé par SasPay API
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              Paiement Confirmé !
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Votre {type === 'abonnement' ? 'abonnement à Dropia' : 'portefeuille'} a été mis à jour en temps réel.
            </p>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Montant débité :</span>
              <strong className="text-slate-900 font-mono text-sm">{montant.toLocaleString('fr-FR')} FCFA</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Opérateur :</span>
              <span className="font-semibold text-slate-800">{OPERATEURS.find(o => o.id === operateur)?.nom || operateur}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Référence transaction :</span>
              <code className="font-mono text-[#1E40AF] font-bold">{reference}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Statut :</span>
              <span className="text-emerald-700 font-bold uppercase text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">RÉGLÉ</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (profile?.role === 'ecommercant') {
                navigate('/portail');
              } else {
                navigate('/dashboard');
              }
            }}
            className="w-full bg-[#1E40AF] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition shadow-xs cursor-pointer"
          >
            Accéder à mon espace Dropia
          </button>
        </div>
      </div>
    );
  }

  // Écran d'erreur
  if (etape === 'erreur') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 max-w-md w-full text-center shadow-xl space-y-6">
          <div className="w-16 h-16 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto border border-[#FECACA]">
            <X className="w-8 h-8 text-[#DC2626]" strokeWidth={2} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              Paiement non complété
            </h2>
            <p className="text-xs text-[#DC2626] mt-2 bg-rose-50 p-3 rounded-lg border border-rose-200">
              {erreur || 'La transaction n\'a pas pu être validée par SasPay.'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEtape('formulaire')}
              className="flex-1 bg-[#1E40AF] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition cursor-pointer"
            >
              Réessayer
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Écran de formulaire principal
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            Retour
          </button>

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-2xs cursor-pointer"
            title="Paramétrer les clés API SasPay"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>Clé SasPay API</span>
            {customApiKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Clé API configurée" />
            )}
          </button>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-12 h-12 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#DBEAFE] text-[#1E40AF]">
              <CreditCard className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Paiement Sécurisé Mobile Money
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Passerelle officielle SasPay (<a href="https://docs.saspay.me/" target="_blank" rel="noreferrer" className="text-[#1E40AF] underline">docs.saspay.me</a>) • Débit réel Wave, Orange, MTN, Moov
            </p>
          </div>

          {/* Détail de la transaction */}
          <div className="bg-gradient-to-br from-[#0a1124] to-[#121c3b] rounded-xl p-5 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block">
                {type === 'abonnement' ? 'Forfait Souscrit' : 'Type d\'opération'}
              </span>
              <h3 className="font-bold text-sm text-white mt-0.5">
                {type === 'abonnement'
                  ? `Dropia ${planId === 'pro' ? 'Pro Agence' : planId === 'business' ? 'Business Scale' : 'Starter'} (${cycle === 'annuel' ? 'Annuel' : 'Mensuel'})`
                  : 'Rechargement du portefeuille Dropia'}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Net à payer</span>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {montant.toLocaleString('fr-FR')} <span className="text-xs text-slate-300 font-normal">FCFA</span>
              </div>
            </div>
          </div>

          {erreur && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{erreur}</span>
            </div>
          )}

          <form onSubmit={handlePayer} className="space-y-5">
            {/* 1. Mode de paiement */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-2 uppercase tracking-wider">
                1. Méthode d'exécution du paiement
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setModePaiement('redirect')}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    modePaiement === 'redirect'
                      ? 'border-[#1E40AF] bg-[#EFF6FF] ring-2 ring-[#1E40AF]/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#1E40AF] flex items-center justify-center shrink-0 mt-0.5">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#0F172A] block">
                      Redirection SasPay Checkout
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                      Payer sur la page officielle SasPay (Recommandé)
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setModePaiement('push')}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    modePaiement === 'push'
                      ? 'border-[#1E40AF] bg-[#EFF6FF] ring-2 ring-[#1E40AF]/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#0F172A] block">
                      Push Mobile Money (USSD)
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                      Recevoir la notification PIN directement sur votre mobile
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Opérateur Mobile Money */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-2 uppercase tracking-wider">
                2. Choisissez votre réseau Mobile Money
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {OPERATEURS.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperateur(op.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      operateur === op.id
                        ? 'border-[#1E40AF] bg-[#EFF6FF] ring-2 ring-[#1E40AF]/20'
                        : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{op.icone}</span>
                      <span className="text-xs font-bold text-[#0F172A]">{op.nom}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1">{op.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Numéro de téléphone */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">
                3. Numéro de téléphone Mobile Money
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" strokeWidth={1.75} />
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+225 07 XX XX XX XX / +221 77 XXX XX XX"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] font-mono focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF]"
                  required
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Le compte associé à ce numéro sera débité du montant de {montant.toLocaleString('fr-FR')} FCFA.
              </p>
            </div>

            {/* Bouton de confirmation & redirection */}
            <button
              type="submit"
              disabled={loading || !operateur || !telephone.trim()}
              className="w-full bg-[#1E40AF] hover:bg-[#1D4ED8] disabled:opacity-50 text-white py-3.5 rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                  <span>Connexion à l'API SasPay en cours...</span>
                </>
              ) : modePaiement === 'redirect' ? (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>Rediriger vers SasPay pour payer {montant.toLocaleString('fr-FR')} FCFA</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Envoyer le Push Mobile Money ({montant.toLocaleString('fr-FR')} FCFA)</span>
                </>
              )}
            </button>
          </form>

          {/* Note sur la sécurité */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              Cryptage TLS 256-bit & Validation USSD
            </span>
            <a
              href="https://docs.saspay.me/"
              target="_blank"
              rel="noreferrer"
              className="text-[#1E40AF] hover:underline font-semibold flex items-center gap-1"
            >
              API docs.saspay.me ↗
            </a>
          </div>
        </div>
      </div>

      {/* Modal de configuration Clé SasPay */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Clé API SasPay (docs.saspay.me)</h3>
                  <span className="text-[10px] text-slate-500">Connexion en direct avec votre compte marchand</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Pour que les débits Mobile Money soient <strong>réellement prélevés</strong> sur votre compte Wave, Orange Money ou MTN, saisissez votre clé d'API Secrète obtenue sur <a href="https://dashboard.saspay.me" target="_blank" rel="noreferrer" className="text-[#1E40AF] underline">dashboard.saspay.me</a>.
              </p>

              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Clé API Secrète SasPay (sk_live_... ou sk_test_...) :
                </label>
                <input
                  type="text"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="sk_live_..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:border-[#1E40AF]"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div>Endpoint officiel : <code className="text-[#1E40AF]">https://api.saspay.me/api/v1</code></div>
                <div>Documentation : <a href="https://docs.saspay.me/" target="_blank" rel="noreferrer" className="text-[#1E40AF] underline">https://docs.saspay.me/</a></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveSaspayConfig}
                className="px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-blue-800 text-white font-bold cursor-pointer"
              >
                Enregistrer la clé
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
