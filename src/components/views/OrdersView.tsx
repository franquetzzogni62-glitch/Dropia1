import React, { useState } from 'react';
import {
  RefreshCw,
  Plus,
  Filter,
  MoreVertical,
  Check,
  Bike,
  Building2,
  Sparkles,
  TrendingUp,
  Package,
  Truck,
  DollarSign,
  ChevronDown,
  MapPin,
  Clock,
  ShieldCheck
} from 'lucide-react';
import type { Colis } from '../../types';

interface OrdersViewProps {
  colisList: Colis[];
  onOpenNewOrder: () => void;
  onRefresh: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  colisList,
  onOpenNewOrder,
  onRefresh
}) => {
  const [selectedCountry, setSelectedCountry] = useState('Tous les pays');
  const [selectedStatut, setSelectedStatut] = useState('Tous les statuts');
  const [searchTerm, setSearchTerm] = useState('');

  // Métriques opérationnelles réelles calculées dynamiquement
  const totalCommandes = colisList.length;
  const aExpedier = colisList.filter(c => c.statut === 'en_attente').length;
  const enRoute = colisList.filter(c => c.statut === 'en_cours' || c.statut === 'ramasse').length;
  const livrees = colisList.filter(c => c.statut === 'livre').length;
  const codTotal = colisList.reduce((acc, c) => acc + (c.montantCOD || 0), 0);

  // Filtrage sécurisé
  const filteredColis = colisList.filter(c => {
    if (!c) return false;
    const tracking = String(c.trackingNumber || c.id || '').toLowerCase();
    const client = String(c.nomClient || '').toLowerCase();
    const commune = String(c.commune || '').toLowerCase();
    const telephone = String(c.telephoneClient || '');
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      tracking.includes(query) ||
      client.includes(query) ||
      commune.includes(query) ||
      telephone.includes(query);

    const matchesStatut =
      selectedStatut === 'Tous les statuts' || c.statut === selectedStatut;

    return matchesSearch && matchesStatut;
  });

  return (
    <div className="space-y-6">
      {/* Title & Top Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Commandes & Expéditions
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              ● Mode Production (Live)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold">
              {totalCommandes} Colis en base
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Suivez, assignez et pilotez vos livraisons réelles en temps réel.
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
          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Commande
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Commandes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Total Commandes
            </span>
            <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {totalCommandes}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {livrees} livrées avec succès
          </span>
        </div>

        {/* Commandes à expédier */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              En attente / À assigner
            </span>
            <div className="w-6 h-6 rounded bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {aExpedier}
          </div>
          <span className="text-[11px] text-orange-600 font-medium">
            Prêtes pour le dispatch
          </span>
        </div>

        {/* En cours de livraison */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              En cours de livraison
            </span>
            <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {enRoute}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">
            Sur la route avec OTP
          </span>
        </div>

        {/* Cash à encaisser */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Cash à encaisser (COD)
            </span>
            <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {codTotal.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            Total fonds sous contrôle
          </span>
        </div>
      </div>

      {/* Orders List & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-900 text-xs">
              Liste des commandes ({filteredColis.length})
            </h3>
            <input
              type="text"
              placeholder="Rechercher tracking, client, commune..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 w-56 sm:w-72"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none"
            >
              <option value="Tous les statuts">Tous les statuts</option>
              <option value="en_cours">En route</option>
              <option value="ramasse">Ramassé</option>
              <option value="livre">Livré</option>
              <option value="en_attente">En attente</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">N° Tracking</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Destination / Commune</th>
                <th className="py-2.5 px-3">Montant COD</th>
                <th className="py-2.5 px-3">Frais</th>
                <th className="py-2.5 px-3">Livreur Assigné</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3">Code OTP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredColis.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        Aucune commande pour le moment
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                        La base de données est propre. Cliquez sur "Nouvelle Commande" pour créer une première livraison réelle.
                      </p>
                    </div>
                    <button
                      onClick={onOpenNewOrder}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      Créer une commande
                    </button>
                  </td>
                </tr>
              ) : (
                filteredColis.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {c.trackingNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 block">{c.nomClient}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.telephoneClient}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-slate-800 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{c.commune}</span>
                      </div>
                      {c.adresse && (
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{c.adresse}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {(c.montantCOD || 0).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {(c.fraisLivraison || 2000).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 px-3">
                      {c.nomLivreur ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                            {c.nomLivreur.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-800">{c.nomLivreur}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Non assigné</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {c.statut === 'livre' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Livré
                        </span>
                      )}
                      {(c.statut === 'en_cours' || c.statut === 'ramasse') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          En route
                        </span>
                      )}
                      {c.statut === 'en_attente' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {c.codeOTP ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                          {c.codeOTP}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
