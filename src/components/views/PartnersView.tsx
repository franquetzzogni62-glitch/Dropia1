import React, { useState } from 'react';
import {
  RefreshCw,
  Plus,
  Building2,
  Store,
  Bike,
  Clock,
  Percent,
  CheckCircle2,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface PartnersViewProps {
  onRefresh: () => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({ onRefresh }) => {
  const [activePartnerTab, setActivePartnerTab] = useState<'3pl' | 'merchants'>('3pl');
  const [selectedHub, setSelectedHub] = useState<'dakar' | 'abidjan' | 'all'>('all');

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Réseau & Partenariats
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez votre réseau de transporteurs tiers 3PL et vos boutiques e-commerçantes affiliées.
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
            onClick={() => alert('Ouverture du formulaire d\'ajout d\'agence 3PL agréée Dropia.')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Ajouter une agence 3PL
          </button>
        </div>
      </div>

      {/* Tabs: Agences 3PL Partenaires vs Portail E-commerçants */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActivePartnerTab('3pl')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activePartnerTab === '3pl'
              ? 'bg-[#0a1124] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Agences 3PL Partenaires (0)
        </button>

        <button
          onClick={() => setActivePartnerTab('merchants')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
            activePartnerTab === 'merchants'
              ? 'bg-[#0a1124] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          Portail E-commerçants
          <span className="text-[10px] px-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Inclus
          </span>
        </button>
      </div>

      {/* Hubs régionaux disponibles */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div>
          <h3 className="font-bold text-slate-900 text-xs">
            Hubs régionaux disponibles
          </h3>
          <p className="text-[11px] text-slate-500">
            Basculez entre les capitales couvertes par le protocole Dropia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Hub Dakar */}
          <div
            onClick={() => setSelectedHub('dakar')}
            className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
              selectedHub === 'dakar'
                ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                checked={selectedHub === 'dakar'}
                onChange={() => setSelectedHub('dakar')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  🇸🇳 Hub Dakar (Sénégal)
                </span>
                <span className="text-[11px] text-slate-500">
                  50+ motos partenaires connectées en temps réel.
                </span>
              </div>
            </div>
            <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>

          {/* Hub Abidjan */}
          <div
            onClick={() => setSelectedHub('abidjan')}
            className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
              selectedHub === 'abidjan'
                ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                checked={selectedHub === 'abidjan'}
                onChange={() => setSelectedHub('abidjan')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  🇨🇮 Hub Abidjan (RCI)
                </span>
                <span className="text-[11px] text-slate-500">
                  Couverture Cocody, Plateau, Marcory & Yopougon.
                </span>
              </div>
            </div>
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Tous les hubs */}
          <div
            onClick={() => setSelectedHub('all')}
            className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
              selectedHub === 'all'
                ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                checked={selectedHub === 'all'}
                onChange={() => setSelectedHub('all')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  Tous les Hubs d'Afrique
                </span>
                <span className="text-[11px] text-slate-500">
                  Vue globale du réseau logistique mutualisé.
                </span>
              </div>
            </div>
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Agences agréées */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Agences agréées
            </span>
            <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">0</div>
          <span className="text-[11px] text-slate-500">Auditées & Vérifiées</span>
        </div>

        {/* Motos mobilisables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Motos mobilisables
            </span>
            <div className="w-6 h-6 rounded bg-orange-50 text-orange-600 flex items-center justify-center">
              <Bike className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">0</div>
          <span className="text-[11px] text-orange-600 font-medium">Capacité d'absorption</span>
        </div>

        {/* Délai moyen d'acheminement */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Délai moyen d'acheminement
            </span>
            <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">0 min</div>
          <span className="text-[11px] text-slate-500 font-medium">Aucune course enregistrée</span>
        </div>

        {/* Commission Dropia */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Commission Dropia
            </span>
            <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">12% - 15%</div>
          <span className="text-[11px] text-slate-500">Sur les courses externalisées</span>
        </div>
      </div>

      {/* Table & Empty state */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs">
            Réseau d'agences 3PL connectées
          </h3>
          <span className="text-xs text-slate-500">0 partenaires</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Agence Partenaire</th>
                <th className="py-2.5 px-3">Hub / Ville</th>
                <th className="py-2.5 px-3">Flotte Active</th>
                <th className="py-2.5 px-3">Grille Tarifaire (Centre / Périphérie)</th>
                <th className="py-2.5 px-3">SLA & Note</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Empty State */}
        <div className="py-14 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">
              Aucune agence partenaire enregistrée
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Aucune agence 3PL trouvée pour ce hub. Cliquez ci-dessous pour connecter une nouvelle flotte partenaire.
            </p>
          </div>
          <button
            onClick={() => alert('Ajout d\'agence partenaire.')}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Ajouter une agence
          </button>
        </div>
      </div>
    </div>
  );
};
