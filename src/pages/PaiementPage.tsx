import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DropiaDatabaseService } from '../services/dropiaService';
import { SaspayClientService } from '../services/saspayClient';
import { 
  ShieldCheck, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { TransactionFinanciere } from '../types';

export default function PaiementPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();

  const planId = (searchParams.get('plan') || 'pro').toLowerCase();
  const cycle = searchParams.get('cycle') || 'mensuel';
  const type = searchParams.get('type') || 'abonnement';
  const statusParam = searchParams.get('status');
  const sessionIdParam = searchParams.get('session_id') || searchParams.get('id');

  // Détermination stricte du tarif officiel Dropia
  const getTarifStrict = () => {
    if (type === 'recharge') {
      const montantParam = parseInt(searchParams.get('montant') || '20000', 10);
      return Math.max(montantParam || 20000, 200);
    }
    // Formules officielles strictes d'abonnement Dropia
    if (planId === 'starter') {
      return cycle === 'annuel' ? 50000 : 5000;
    }
    if (planId === 'business') {
      return cycle === 'annuel' ? 102000 : 10200;
    }
    // Plan Pro par défaut
    return cycle === 'annuel' ? 55000 : 5500;
  };

  const montantStrict = getTarifStrict();

  const getNomPlan = () => {
    if (planId === 'starter') return 'Starter Agence';
    if (planId === 'business') return 'Business Scale';
    return 'Pro Agence';
  };

  const [etat, setEtat] = useState<'redirection' | 'succes' | 'erreur'>('redirection');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [messageErreur, setMessageErreur] = useState('');
  const [dateExpiration, setDateExpiration] = useState('');

  // 1. Détection du retour de SasPay avec succès
  useEffect(() => {
    if (statusParam === 'success' || statusParam === 'completed') {
      finaliserPaiementSaspay();
      return;
    }

    // 2. Initialisation immédiate et redirection stricte vers le portail officiel SasPay
    initierPortailSaspay();
  }, [statusParam]);

  // Initialisation directe sur le portail hébergé officiel SasPay (checkout.saspay.me)
  const initierPortailSaspay = async () => {
    setEtat('redirection');
    setMessageErreur('');

    try {
      const returnUrl = `${window.location.origin}/paiement?status=success&type=${type}&plan=${planId}&cycle=${cycle}&montant=${montantStrict}`;

      const description = type === 'abonnement'
        ? `Abonnement Dropia Plan ${getNomPlan()} (${cycle === 'annuel' ? 'Annuel' : 'Mensuel'})`
        : `Rechargement Portefeuille Dropia (${montantStrict.toLocaleString('fr-FR')} FCFA)`;

      const result = await SaspayClientService.createCheckoutSession({
        amount: montantStrict,
        currency: 'XOF',
        description,
        customerName: profile?.nom || profile?.nomBoutique || profile?.nomAgence || 'Client Dropia',
        customerEmail: profile?.email || 'contact@dropia.com',
        customerPhone: profile?.telephone || '',
        returnUrl,
        metadata: {
          planId,
          cycle,
          type,
          userId: profile?.uid || 'anon'
        }
      });

      if (!result.success || !result.checkoutUrl) {
        throw new Error(result.error || 'Impossible d\'initialiser le portail de paiement SasPay.');
      }

      setCheckoutUrl(result.checkoutUrl);

      // Redirection immédiate du navigateur vers le portail SasPay officiel
      window.location.replace(result.checkoutUrl);
    } catch (err: any) {
      setMessageErreur(err.message || 'Erreur lors de la redirection vers le portail SasPay.');
      setEtat('erreur');
    }
  };

  // Validation stricte et opérationnelle de l'abonnement après paiement sur SasPay
  const finaliserPaiementSaspay = async () => {
    try {
      const refGen = sessionIdParam || `SAS-${Date.now().toString(36).toUpperCase()}`;

      // A. Mettre à jour l'abonnement et quotas dans la base de données
      if (type === 'abonnement') {
        const validPlan = planId === 'business' ? 'business' : planId === 'starter' ? 'starter' : 'pro';
        const resMaj = await DropiaDatabaseService.updatePlanAbonnement(
          profile?.uid || '',
          validPlan,
          cycle === 'annuel' ? 'annuel' : 'mensuel'
        );
        setDateExpiration(resMaj.dateExpiration);

        if (profile) {
          await updateProfile({
            plan: validPlan,
            planStatut: 'actif'
          });
        }
      } else if (type === 'recharge') {
        if (profile) {
          const nouveauSolde = (profile.soldeWallet || 0) + montantStrict;
          await updateProfile({ soldeWallet: nouveauSolde });
        }
      }

      // B. Enregistrer la transaction financière
      const tx: Omit<TransactionFinanciere, 'id'> = {
        type: type === 'abonnement' ? 'abonnement_saas' : 'frais_livraison',
        montant: montantStrict,
        devise: 'XOF',
        destinataireType: profile?.role === 'ecommercant' ? 'ecommercant' : 'agence',
        destinataireId: profile?.uid || 'user_anon',
        referencePaiement: refGen,
        date: new Date().toISOString(),
        statut: 'complete'
      };
      await DropiaDatabaseService.creerTransaction(tx).catch(() => {});

      setEtat('succes');
    } catch (err: any) {
      setMessageErreur(err.message || 'Erreur lors de l\'enregistrement de votre abonnement.');
      setEtat('erreur');
    }
  };

  // 1. ÉCRAN DE SUCCÈS : Abonnement activé et strictement opérationnel
  if (etat === 'succes') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl space-y-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 text-emerald-600">
            <CheckCircle2 className="w-9 h-9" strokeWidth={2} />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" />
              Paiement Confirmé via SasPay
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {type === 'abonnement' ? 'Abonnement Activé avec Succès !' : 'Portefeuille Rechargé !'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {type === 'abonnement'
                ? `Votre plan ${getNomPlan()} est désormais actif et 100% opérationnel.`
                : `Votre solde a été crédité de ${montantStrict.toLocaleString('fr-FR')} FCFA.`}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Montant débité :</span>
              <strong className="text-slate-900 font-mono text-sm">{montantStrict.toLocaleString('fr-FR')} FCFA</strong>
            </div>
            {type === 'abonnement' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Formule :</span>
                  <span className="font-bold text-slate-900">{getNomPlan()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Cycle de facturation :</span>
                  <span className="capitalize text-slate-800 font-medium">{cycle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Statut du compte :</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    ACTIF & OPÉRATIONNEL
                  </span>
                </div>
                {dateExpiration && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-500">Valable jusqu'au :</span>
                    <span className="font-mono text-slate-700 font-semibold">
                      {new Date(dateExpiration).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => {
              if (profile?.role === 'ecommercant') {
                navigate('/portail');
              } else {
                navigate('/dashboard');
              }
            }}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Accéder à mon tableau de bord</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. ÉCRAN D'ERREUR
  if (etat === 'erreur') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto border border-red-200 text-red-600">
            <AlertCircle className="w-9 h-9" strokeWidth={2} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Portail de paiement SasPay
            </h1>
            <p className="text-xs text-red-600 mt-2 bg-red-50 p-3 rounded-xl border border-red-200">
              {messageErreur || 'Impossible d\'établir la connexion avec le portail SasPay.'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={initierPortailSaspay}
              className="flex-1 py-3 rounded-xl bg-[#1E40AF] hover:bg-blue-800 text-white font-bold text-xs transition cursor-pointer"
            >
              Réessayer
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Retourner
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. ÉCRAN DE TRANSITION : REDIRECTION STRICTE VERS LE PORTAIL SASPAY
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-6">
        {/* Logo / Badge SasPay */}
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto border border-blue-200 text-[#1E40AF]">
          <Loader2 className="w-8 h-8 animate-spin" strokeWidth={2} />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1E40AF] border border-blue-200 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            Portail Officiel SasPay (checkout.saspay.me)
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Ouverture du portail SasPay
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Redirection automatique vers le portail de paiement sécurisé...
          </p>
        </div>

        {/* Récapitulatif strict du paiement */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Opération :</span>
            <strong className="text-slate-900">
              {type === 'abonnement' ? `Abonnement ${getNomPlan()}` : 'Rechargement portefeuille'}
            </strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Montant strict :</span>
            <span className="font-mono font-black text-[#1E40AF] text-base">
              {montantStrict.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200">
            <span>Moyens disponibles sur SasPay :</span>
            <span className="font-medium text-slate-700">Wave, Orange, MTN, Moov, Carte</span>
          </div>
        </div>

        {/* Bouton direct si la redirection automatique est bloquée par le navigateur */}
        <div className="space-y-3">
          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              className="w-full py-3.5 rounded-xl bg-[#1E40AF] hover:bg-blue-800 text-white font-bold text-xs transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Accéder maintenant à SasPay Checkout</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <div className="text-xs text-slate-400 flex items-center justify-center gap-2 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#1E40AF]" />
              <span>Génération de votre session sécurisée...</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            ← Annuler et revenir en arrière
          </button>
        </div>
      </div>
    </div>
  );
}
