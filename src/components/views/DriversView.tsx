import React, { useState } from 'react';
import {
  RefreshCw,
  Plus,
  Bike,
  Building2,
  Users,
  Smartphone,
  Eye,
  EyeOff,
  Copy,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import type { Livreur } from '../../types';

interface DriversViewProps {
  livreursList: Livreur[];
  onOpenNewDriver: () => void;
  onOpenPwa: () => void;
  onRefresh: () => void;
}

export const DriversView: React.FC<DriversViewProps> = ({
  livreursList,
  onOpenNewDriver,
  onOpenPwa,
  onRefresh
}) => {
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePin = (id: string) => {
    setShowPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyPin = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Métriques réelles
  const totalLivreurs = livreursList.length;
  const caisseTotale = livreursList.reduce((acc, l) => acc + (l.soldeCollecteAujourdhui || 0), 0);
  const totalCourses = livreursList.reduce((acc, l) => acc + (l.colisEnCours || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Flotte de Livreurs
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              ● Mode Production
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold">
              {totalLivreurs} Coursier(s) actif(s)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les accès PIN à l'application mobile, les zones et la sacoche espèces (COD) de vos livreurs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>
          <button
            onClick={onOpenPwa}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 font-bold transition shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            Tester App Livreur PWA
          </button>
          <button
            onClick={onOpenNewDriver}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nouveau Livreur
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Livreurs en service */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Livreurs enregistrés
            </span>
            <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bike className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {totalLivreurs}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            Flotte opérationnelle
          </span>
        </div>

        {/* Cash total en sacoches */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Cash total en sacoches
            </span>
            <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {caisseTotale.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Fonds COD collectés
          </span>
        </div>

        {/* Courses en cours */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Courses en cours
            </span>
            <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {totalCourses}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">
            En distribution
          </span>
        </div>

        {/* Sécurité OTP */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Validation Anti-Fraude
            </span>
            <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            100%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            OTP systématique actif
          </span>
        </div>
      </div>

      {/* Liste des coursiers Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs">
            Coursiers de la flotte ({livreursList.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Livreur</th>
                <th className="py-2.5 px-3">Véhicule</th>
                <th className="py-2.5 px-3">Zone de livraison</th>
                <th className="py-2.5 px-3">Code PIN (PWA)</th>
                <th className="py-2.5 px-3">Caisse Cash (COD)</th>
                <th className="py-2.5 px-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {livreursList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Bike className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        Aucun livreur enregistré
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                        La base de données est prête. Cliquez sur "Nouveau Livreur" pour ajouter vos premiers coursiers avec leurs codes PIN.
                      </p>
                    </div>
                    <button
                      onClick={onOpenNewDriver}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un coursier
                    </button>
                  </td>
                </tr>
              ) : (
                livreursList.map((liv) => (
                  <tr key={liv.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                          {liv.nom.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{liv.nom}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{liv.telephone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 uppercase">{liv.immatriculation || 'SN-DK'}</div>
                      <span className="text-[10px] text-slate-500 capitalize">({liv.vehicule || 'moto'})</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {liv.zone || 'Dakar'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono text-slate-800">
                        <span className="font-bold">
                          {showPins[liv.id] ? liv.pin : '••••'}
                        </span>
                        <button
                          onClick={() => togglePin(liv.id)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="Afficher le PIN"
                        >
                          {showPins[liv.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyPin(liv.pin, liv.id)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="Copier le PIN"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {copiedId === liv.id && (
                          <span className="text-[9px] text-emerald-600 font-bold">Copié !</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {(liv.soldeCollecteAujourdhui || 0).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Disponible
                      </span>
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
