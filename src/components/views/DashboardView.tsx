import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Plus,
  Package,
  TrendingUp,
  CheckCircle2,
  Wallet,
  ArrowRight,
  Info,
  Clock,
  MessageSquare,
  Bike,
  ShieldCheck,
  ChevronRight,
  Zap
} from 'lucide-react';
import type { Colis, Livreur, UserProfile } from '../../types';

interface DashboardViewProps {
  colisList: Colis[];
  livreursList?: Livreur[];
  userProfile?: UserProfile | null;
  walletBalance?: number;
  onOpenNewOrder: () => void;
  onOpenDrivers: () => void;
  onOpenWhatsApp: () => void;
  onOpenSettings: () => void;
  onOpenRecharge: () => void;
  onOpenOrders: () => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  colisList,
  livreursList = [],
  userProfile,
  walletBalance = 0,
  onOpenNewOrder,
  onOpenDrivers,
  onOpenWhatsApp,
  onOpenSettings,
  onOpenRecharge,
  onOpenOrders,
  onRefresh
}) => {
  const navigate = useNavigate();
  const totalCommandes = colisList.length;
  const enRoute = colisList.filter(c => c.statut === 'en_cours' || c.statut === 'ramasse').length;
  const livrees = colisList.filter(c => c.statut === 'livre').length;
  const codCollecte = colisList
    .filter(c => c.statut === 'livre')
    .reduce((acc, c) => acc + (c.montantCOD || 0), 0);
  const tauxReussite = totalCommandes > 0 ? Math.round((livrees / totalCommandes) * 100) : 0;

  const nomEntite =
    userProfile?.nomAgence ||
    userProfile?.nomBoutique ||
    userProfile?.nom ||
    'Mon Espace Dropia';

  const displayCity = userProfile?.ville || 'Hub Principal';
  const displayPlan = (userProfile?.plan || 'Starter').toUpperCase();

  return (
    <div className="space-y-6">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Tableau de Bord & Dispatch
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-[11px] font-semibold">
              ● Hub {displayCity}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] sm:text-[11px] font-semibold">
              Plan {displayPlan}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pilotage opérationnel de <strong>{nomEntite}</strong> • Suivi des livraisons et encaissements en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-2xs cursor-pointer min-h-[40px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <button
            onClick={onOpenNewOrder}
            className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Commande</span>
          </button>
        </div>
      </div>

      {/* Dark Operation Banner */}
      <div className="rounded-2xl bg-[#0a1124] text-white p-4 sm:p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 text-[11px]">
              Réseau Opérationnel
            </span>
            <span className="text-slate-300">
              Mode : <strong className="text-white">Gestion Hybride (Flotte + Partenaires)</strong>
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black tracking-tight">
            {nomEntite} — {displayCity}
          </h2>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-400">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Mobile Money disponible
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Validation OTP active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 md:pt-0">
          <button
            onClick={onOpenSettings}
            className="flex-1 md:flex-none justify-center px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 cursor-pointer min-h-[40px]"
          >
            Paramètres
          </button>
          <button
            onClick={onOpenNewOrder}
            className="flex-1 md:flex-none justify-center flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow cursor-pointer min-h-[40px]"
          >
            <span>Créer commande</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Commandes Enregistrées */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Commandes enregistrées
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalCommandes} <span className="text-xs font-normal text-slate-500">commandes</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {livrees} livrées • {enRoute} en route
            </p>
          </div>
        </div>

        {/* Card 2: COD Espèces Collecté */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              COD espèces collecté
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {codCollecte.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Caisse livraisons : {codCollecte.toLocaleString('fr-FR')} F
            </p>
          </div>
        </div>

        {/* Card 3: Taux de Succès Livraison */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Taux de succès livraison
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {tauxReussite}% <span className="text-xs font-semibold text-emerald-600">En direct</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {livrees} sur {totalCommandes} colis livrés
            </p>
          </div>
        </div>

        {/* Card 4: Portefeuille Disponible */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Portefeuille disponible
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {(walletBalance || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Wave & Orange Money</span>
              <button
                onClick={onOpenRecharge}
                className="text-purple-600 font-bold hover:underline"
              >
                + Recharger
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Courses & Suivi en Temps Réel Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Courses & Suivi en Temps Réel
              </h3>
              <p className="text-xs text-slate-500">
                Livreurs en déplacement, codes OTP et statut de validation en direct
              </p>
            </div>
          </div>

          <button
            onClick={onOpenOrders}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
          >
            Voir toutes les commandes ({colisList.length}) &gt;
          </button>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 border-y border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Commande</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Client & Contact</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Destination</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Montant</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Coursier</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Code OTP</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {colisList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">
                        Aucune livraison en cours
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5">
                        L'espace est 100% vide. Créez une nouvelle commande pour affecter une course à votre flotte.
                      </p>
                    </div>
                    <button
                      onClick={onOpenNewOrder}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Créer une commande
                    </button>
                  </td>
                </tr>
              ) : (
                colisList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {c.trackingNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900">{c.nomClient}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{c.telephoneClient}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{c.commune}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{c.adresse}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 font-mono tabular-nums">
                        {(c.montantCOD || 0).toLocaleString('fr-FR')} FCFA
                      </div>
                      <span className="text-[10px] text-slate-500">Cash (COD)</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{c.nomLivreur || 'Non assigné'}</div>
                      <span className="text-[10px] text-slate-400">Flotte Interne</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {c.codeOTP ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {c.codeOTP}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {c.statut === 'livre' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Livré
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          {c.statut === 'en_attente' ? 'En attente' : 'En route'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 2 Columns: Coursiers & Canal WhatsApp */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Coursiers & Encours Caisse */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4 text-emerald-600" />
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Coursiers & Encours Caisse
                </h4>
                <span className="text-[11px] text-slate-500">
                  {livreursList.length} coursier(s) enregistré(s)
                </span>
              </div>
            </div>

            <button
              onClick={onOpenDrivers}
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              Gérer la flotte →
            </button>
          </div>

          <div className="space-y-2.5">
            {livreursList.length === 0 ? (
              <div className="py-8 text-center space-y-2 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <Bike className="w-6 h-6 mx-auto text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">Aucun coursier dans votre flotte</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Ajoutez vos livreurs avec code PIN pour leur donner accès à l'application mobile coursier.
                </p>
                <button
                  onClick={onOpenDrivers}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter un coursier
                </button>
              </div>
            ) : (
              livreursList.map((cour) => (
                <div
                  key={cour.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                      {(cour.nom || 'L').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{cour.nom}</span>
                      <span className="text-[11px] text-slate-500">{cour.zone || displayCity}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-slate-900 block">
                      {(cour.soldeCollecteAujourdhui || 0).toLocaleString('fr-FR')} F
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {cour.actif ? 'Disponible' : 'Inactif'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Canal WhatsApp Business */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Canal WhatsApp Business
                </h4>
                <span className="text-[11px] text-slate-500">Capture automatique et notifications OTP</span>
              </div>
            </div>

            <button
              onClick={onOpenWhatsApp}
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              Paramètres WhatsApp →
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-800 text-xs">Webhook prêt pour configuration</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                Non configuré
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Connectez votre numéro WhatsApp Business pour convertir automatiquement les messages clients en courses avec calcul du tarif et envoi du code OTP.
            </p>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Notification prise en charge + OTP</span>
              <span className="font-medium text-amber-600">En attente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
