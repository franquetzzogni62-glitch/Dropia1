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
  const [transactionsList, setTransactionsList] = useState<any[]>([]);

  const plans = [
    {
      id: 'starter' as const,
      name: 'Starter Agence',
      price: 5000,
      period: 'mois',
      description: 'Idéal pour petite flotte locale et début d\'activité',
      limiteColis: 800,
      limiteLivreurs: 5,
      features: [
        'Jusqu\'à 800 colis / mois',
        'Jusqu\'à 5 livreurs avec code PIN',
        'Gestion Cash on Delivery (COD)',
        'Preuve de livraison par code OTP',
        'Support standard'
      ]
    },
    {
      id: 'pro' as const,
      name: 'Pro Agence (Recommandé)',
      price: 5500,
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
        'Suivi GPS livreurs en temps réel',
        'Support prioritaire 7j/7'
      ]
    },
    {
      id: 'business' as const,
      name: 'Business Scale',
      price: 10200,
      period: 'mois',
      description: 'Grandes flottes logistiques et connectivité e-commerce',
      limiteColis: 10000,
      limiteLivreurs: 100,
      features: [
        'Jusqu\'à 10 000 colis / mois',
        'Jusqu\'à 100 livreurs avec code PIN',
        'Clés API REST v1 & Webhooks',
        'Intégration WooCommerce & Shopify',
        'Portail e-commerçants illimité',
        'Support dédié 24/7'
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

      {/* Notice Portail Officiel SasPay */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Portail Officiel de Paiement SasPay</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                100% Mobile Money Direct
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              En cliquant sur un plan, vous êtes directement redirigé vers le portail officiel SasPay (<a href="https://docs.saspay.me/" target="_blank" rel="noreferrer" className="text-blue-400 underline">docs.saspay.me</a>) pour régler en toute sécurité.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/paiement?plan=pro&cycle=mensuel&montant=5500&type=abonnement')}
          className="px-4 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-blue-700 text-white font-bold text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
        >
          <span>Payer le Plan Pro (5 500 F) sur SasPay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Transactions History */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">

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
