import React, { useState } from 'react';
import {
  RefreshCw,
  TrendingUp,
  Package,
  Clock,
  Smartphone,
  CheckCircle2,
  Lightbulb,
  CreditCard,
  DollarSign
} from 'lucide-react';
import type { Colis } from '../../types';

interface AnalyticsViewProps {
  colisList: Colis[];
  onRefresh: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  colisList,
  onRefresh
}) => {
  const [period, setPeriod] = useState('Cette semaine');

  const livrees = colisList.filter(c => c.statut === 'livre').length;
  const enCours = colisList.filter(c => c.statut === 'en_cours' || c.statut === 'ramasse').length;
  const caTotal = colisList
    .filter(c => c.statut === 'livre')
    .reduce((sum, c) => sum + (c.montantCOD || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Analytics & Performances
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analysez la croissance de vos ventes, vos délais de livraison et vos canaux de paiement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none"
          >
            <option value="Cette semaine">Cette semaine ▾</option>
            <option value="Aujourd'hui">Aujourd'hui</option>
            <option value="Ce mois">Ce mois</option>
            <option value="Cette année">Cette année</option>
          </select>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CA Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Chiffre d'affaires total
            </span>
            <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {caTotal.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            Synchronisé <span className="text-slate-400 font-normal">avec Firestore</span>
          </span>
        </div>

        {/* Courses complétées */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Courses complétées
            </span>
            <div className="w-6 h-6 rounded bg-orange-50 text-orange-600 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {livrees}
          </div>
          <span className="text-[11px] text-slate-500">
            {colisList.length} au total
          </span>
        </div>

        {/* Délai moyen de livraison */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Délai moyen de livraison
            </span>
            <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            0 min
          </div>
          <span className="text-[11px] text-slate-500">
            Aucune donnée pour le moment
          </span>
        </div>

        {/* Part Mobile Money */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Part Mobile Money
            </span>
            <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            0%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            Wave & Orange Money
          </span>
        </div>
      </div>

      {/* Chart & Payment Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Volume de ventes et livraisons */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">
                Volume de ventes & livraisons
              </h3>
              <p className="text-[11px] text-slate-500">
                Performances réelles enregistrées sur vos commandes
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              {livrees} colis livrés sur {colisList.length}
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-center gap-16 pt-8 pb-4 border-b border-slate-100">
            {/* Livrées Bar */}
            <div className="flex flex-col items-center gap-2 w-32">
              <span className="font-mono font-bold text-xs text-slate-700">{livrees}</span>
              <div
                className="w-full bg-emerald-500 rounded-t-lg transition-all duration-500 shadow"
                style={{ height: `${colisList.length === 0 ? 0 : Math.max(8, (livrees / colisList.length) * 180)}px` }}
              />
              <span className="text-xs font-semibold text-slate-700">Livrées</span>
            </div>

            {/* En cours Bar */}
            <div className="flex flex-col items-center gap-2 w-32">
              <span className="font-mono font-bold text-xs text-slate-700">{enCours}</span>
              <div
                className="w-full bg-amber-500 rounded-t-lg transition-all duration-500 shadow"
                style={{ height: `${colisList.length === 0 ? 0 : Math.max(8, (enCours / colisList.length) * 180)}px` }}
              />
              <span className="text-xs font-semibold text-slate-700">En cours</span>
            </div>
          </div>
        </div>

        {/* Right Col: Canaux de Paiement */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">
                Canaux de Paiement
              </h3>
              <p className="text-[11px] text-slate-500">
                Paiement à la livraison vs instantané
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Wave */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    Wave Sénégal
                  </span>
                  <span className="text-slate-500 font-mono">0% (0 commandes)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-sky-500 h-2 rounded-full w-0" />
                </div>
              </div>

              {/* Cash COD */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    Cash à la livraison (COD)
                  </span>
                  <span className="text-emerald-700 font-mono font-bold">
                    {colisList.length === 0 ? '0% (0 commande)' : `100% (${colisList.length} commandes)`}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`bg-emerald-600 h-2 rounded-full ${colisList.length === 0 ? 'w-0' : 'w-full'}`} />
                </div>
              </div>

              {/* Orange Money */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    Orange Money
                  </span>
                  <span className="text-slate-500 font-mono">0% (0 commandes)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full w-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Conseil Dropia Card */}
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1 text-amber-800">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              Conseil Dropia :
            </span>
            <p className="leading-relaxed">
              Encouragez vos clients à payer via le QR code Wave à la livraison pour supprimer tout risque d'impayé ou de faux billets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
