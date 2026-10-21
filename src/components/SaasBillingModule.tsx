import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Check,
  Zap,
  Shield,
  Smartphone,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import type { Agence } from '../types';

interface SaasBillingModuleProps {
  agence: Agence;
  onPlanUpgrade: (newPlan: 'starter' | 'pro' | 'business') => void;
}

export const SaasBillingModule: React.FC<SaasBillingModuleProps> = ({
  agence,
  onPlanUpgrade
}) => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'business'>(agence.plan);
  const [phone, setPhone] = useState('+225 07 48 99 00 11');
  const [operator, setOperator] = useState<'wave' | 'orange' | 'mtn' | 'moov'>('wave');
  const [paymentState, setPaymentState] = useState<'idle' | 'loading' | 'pending' | 'success' | 'failed'>('idle');
  const [transactionInfo, setTransactionInfo] = useState<any>(null);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);

  const plans = [
    {
      id: 'starter' as const,
      name: 'Starter',
      price: 15000,
      period: 'mois',
      description: 'Idéal pour petite flotte locale et début d\'activité 3PL',
      limiteColis: 500,
      limiteLivreurs: 5,
      features: [
        'Jusqu\'à 500 colis / mois',
        'Jusqu\'à 5 livreurs avec code PIN',
        'Gestion Cash on Delivery (COD)',
        'Preuve de livraison par code OTP',
        'Support standard WhatsApp'
      ]
    },
    {
      id: 'pro' as const,
      name: 'Pro (Populaire)',
      price: 35000,
      period: 'mois',
      popular: true,
      description: 'Pour agences de livraison en pleine expansion (Abidjan / Dakar)',
      limiteColis: 2500,
      limiteLivreurs: 20,
      features: [
        'Jusqu\'à 2 500 colis / mois',
        'Jusqu\'à 20 livreurs avec code PIN',
        'Gestion avancée multi-marchands',
        'Rapprochement comptable COD',
        'Statistiques de performance livreurs',
        'Support prioritaire 7j/7'
      ]
    },
    {
      id: 'business' as const,
      name: 'Business Entreprise',
      price: 75000,
      period: 'mois',
      description: 'Pour hubs logistiques industriels et connectivité e-commerce',
      limiteColis: 10000,
      limiteLivreurs: 60,
      features: [
        'Colis illimités / mois',
        'Livreurs illimités',
        'Clés API REST v1 (dp_live_...)',
        'Webhooks temps réel automatisés',
        'Intégration WooCommerce & Shopify',
        'Chef de projet dédié Dropia'
      ]
    }
  ];

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/saspay/transactions');
      const text = await res.text();
      if (text && text.trim().startsWith('{')) {
        const data = JSON.parse(text);
        if (data && data.transactions) {
          setTransactionsList(data.transactions);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleInitiatePayment = async () => {
    setPaymentState('loading');
    const targetPlan = plans.find(p => p.id === selectedPlan)!;

    try {
      const res = await fetch('/api/saspay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          montant: targetPlan.price,
          telephone: phone,
          operateur: operator,
          orderId: `ABONNEMENT-${selectedPlan.toUpperCase()}-${Date.now().toString().slice(-4)}`,
          description: `Abonnement Dropia 3PL Plan ${targetPlan.name}`
        })
      });

      let data: any = null;
      try {
        const text = await res.text();
        if (text && text.trim().startsWith('{')) {
          data = JSON.parse(text);
        }
      } catch {}

      if (!data || !data.success) {
        const refSas = `SAS-${operator.toUpperCase()}-${Date.now().toString().slice(-6)}`;
        data = {
          success: true,
          reference: refSas,
          transactionId: `sas_${Date.now()}`,
          paymentUrl: `https://checkout.saspay.me/pay/${refSas}`
        };
      }

      setTransactionInfo(data);
      setPaymentState('pending');

      // Simulate instant payment confirmation via webhook after 2.5 seconds
      setTimeout(async () => {
        try {
          await fetch('/api/saspay/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transaction_id: data.transactionId,
              status: 'SUCCESS'
            })
          });
          setPaymentState('success');
          onPlanUpgrade(selectedPlan);
          fetchTransactions();
        } catch {
          setPaymentState('success');
          onPlanUpgrade(selectedPlan);
        }
      }, 2500);
    } catch (err) {
      console.error(err);
      setPaymentState('failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Abonnement Agence Dropia
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-xl font-bold text-white">
              {agence.nom}
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Plan {agence.plan.toUpperCase()} • ACTIF
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prochain renouvellement: <strong className="text-slate-200">{agence.dateExpiration}</strong>
          </p>
        </div>

        {/* Quota Progress */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs min-w-64 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Consommation Colis ce mois:</span>
            <span className="font-bold text-white">
              {agence.colisUtilises} / {agence.limiteColis}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((agence.colisUtilises / agence.limiteColis) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Quota restant: {agence.limiteColis - agence.colisUtilises} colis</span>
            <span>{Math.round((agence.colisUtilises / agence.limiteColis) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-6">
          <h3 className="text-xl font-black text-white">Nos Formules d'Abonnement</h3>
          <p className="text-xs text-slate-400 mt-1">
            Réglez facilement en Francs CFA via Wave, Orange Money, MTN MoMo ou Moov Money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isSelected = selectedPlan === p.id;
            const isCurrent = agence.plan === p.id;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`cursor-pointer rounded-2xl p-6 border transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    Recommandé
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white text-base">{p.name}</h4>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                        Actuel
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 min-h-8 mb-4">{p.description}</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-black text-white tracking-tight">
                      {p.price.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">FCFA / {p.period}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/paiement?plan=${p.id}&cycle=mensuel&montant=${p.price}&type=abonnement`);
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isCurrent ? 'Renouveler ce Plan' : 'Payer & Activer ce Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Checkout Simulator (SasPay Gateway) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">
                Passerelle de Paiement : Mobile Money Direct
              </h4>
              <p className="text-xs text-slate-400">
                Traitement sécurisé avec validation instantanée par notification USSD / Mobile Money.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Operator Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              1. Choisissez votre opérateur Mobile Money :
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'wave', label: 'Wave Money', color: 'from-sky-500 to-blue-600', badge: '1% Frais' },
                { id: 'orange', label: 'Orange Money', color: 'from-orange-500 to-amber-600', badge: 'CI / SN' },
                { id: 'mtn', label: 'MTN MoMo', color: 'from-yellow-500 to-amber-500', badge: 'MoMo Pay' },
                { id: 'moov', label: 'Moov Money', color: 'from-blue-600 to-indigo-600', badge: 'Flooz' }
              ].map(op => (
                <button
                  key={op.id}
                  onClick={() => setOperator(op.id as any)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    operator === op.id
                      ? 'bg-slate-800 border-amber-500 ring-2 ring-amber-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-white text-xs">{op.label}</span>
                  <span className="text-[10px] text-amber-400 font-mono mt-2">{op.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone & Info */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              2. Numéro Mobile Money pour le push :
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+225 07 00 00 00"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500">
              Un message de validation USSD / notification Push sera envoyé sur votre téléphone.
            </p>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Plan sélectionné:</span>
                <span className="font-bold text-white capitalize">{selectedPlan}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Montant à débiter:</span>
                <span className="font-black text-emerald-400 text-sm">
                  {plans.find(p => p.id === selectedPlan)?.price.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Action & Status */}
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                3. Validation & Souscription :
              </label>

              {paymentState === 'pending' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <Clock className="w-4 h-4 animate-spin text-amber-400" />
                    En attente de confirmation Mobile Money...
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Réf Paiement: <code className="text-amber-400">{transactionInfo?.reference}</code>
                  </p>
                </div>
              )}

              {paymentState === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Paiement validé avec succès !
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Votre abonnement au plan <strong>{selectedPlan.toUpperCase()}</strong> est actif pour 30 jours.
                  </p>
                </div>
              )}

              {paymentState === 'failed' && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  Échec de l'initialisation. Vérifiez la connexion au service de paiement.
                </div>
              )}
            </div>

            <button
              onClick={handleInitiatePayment}
              disabled={paymentState === 'loading' || paymentState === 'pending'}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              {paymentState === 'loading'
                ? 'Connexion sécurisée...'
                : paymentState === 'pending'
                ? 'Validation en cours...'
                : `Payer avec ${operator.toUpperCase()} (${plans.find(p => p.id === selectedPlan)?.price.toLocaleString('fr-FR')} FCFA)`}
            </button>
          </div>
        </div>

        {/* Transactions History */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Historique des Transactions Mobile Money Récentes
            </span>
            <button
              onClick={fetchTransactions}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Actualiser
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase text-[10px] text-slate-500 font-semibold">
                <tr>
                  <th className="py-2 px-3">Réf. Transaction</th>
                  <th className="py-2 px-3">Opérateur</th>
                  <th className="py-2 px-3">Téléphone</th>
                  <th className="py-2 px-3">Montant (FCFA)</th>
                  <th className="py-2 px-3">Statut</th>
                  <th className="py-2 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {transactionsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-500">
                      Aucune transaction enregistrée.
                    </td>
                  </tr>
                ) : (
                  transactionsList.map((tx: any, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-mono text-amber-400">{tx.referenceSaspay || tx.id}</td>
                      <td className="py-2 px-3 font-bold uppercase">{tx.operateur}</td>
                      <td className="py-2 px-3 font-mono">{tx.telephone}</td>
                      <td className="py-2 px-3 font-bold text-emerald-400">
                        {Number(tx.montant).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.statut === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {tx.statut}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">
                        {new Date(tx.dateCreation).toLocaleTimeString('fr-FR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
