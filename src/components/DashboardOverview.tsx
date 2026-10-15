import React, { useState } from 'react';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  Phone,
  MapPin,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import type { Colis, Livreur, StatutColis, UserRole } from '../types';

interface DashboardOverviewProps {
  colisList: Colis[];
  livreursList: Livreur[];
  currentRole: UserRole;
  onUpdateStatut: (id: string, statut: StatutColis, comment: string) => void;
  onCreerColis: (colis: Omit<Colis, 'id'>) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  colisList,
  livreursList,
  currentRole,
  onUpdateStatut,
  onCreerColis
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('tous');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedColis, setSelectedColis] = useState<Colis | null>(null);

  // Formulaire nouveau colis
  const [nouveauColis, setNouveauColis] = useState({
    nomClient: '',
    telephoneClient: '',
    ville: 'Abidjan',
    commune: 'Cocody',
    adresse: '',
    montantCOD: 25000,
    fraisLivraison: 2000,
    nomBoutique: 'Wax & Chic Abidjan',
    merchantId: 'mch_abidjan_01',
    agenceId: 'agence_express_ci',
    notes: ''
  });

  // Calcul des métriques opérationnelles
  const totalColis = colisList.length;
  const colisLivres = colisList.filter(c => c.statut === 'livre').length;
  const colisEnCours = colisList.filter(c => c.statut === 'en_cours' || c.statut === 'ramasse').length;
  const totalCOD = colisList.reduce((acc, c) => acc + (c.montantCOD || 0), 0);
  const codLivre = colisList
    .filter(c => c.statut === 'livre')
    .reduce((acc, c) => acc + (c.montantCOD || 0), 0);
  const tauxReussite = totalColis > 0 ? Math.round((colisLivres / totalColis) * 100) : 0;

  // Filtrage des colis sécurisé avec protection contre les valeurs undefined
  const filteredColis = colisList.filter(c => {
    if (!c) return false;
    const tracking = String(c.trackingNumber || c.id || '').toLowerCase();
    const client = String(c.nomClient || '').toLowerCase();
    const commune = String(c.commune || '').toLowerCase();
    const telephone = String(c.telephoneClient || '');
    const query = (searchTerm || '').toLowerCase();

    const matchesSearch =
      tracking.includes(query) ||
      client.includes(query) ||
      commune.includes(query) ||
      telephone.includes(searchTerm);

    if (selectedFilter === 'tous') return matchesSearch;
    return matchesSearch && c.statut === selectedFilter;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauColis.nomClient || !nouveauColis.telephoneClient || !nouveauColis.commune) {
      return;
    }
    const codePays = nouveauColis.ville.toLowerCase().includes('dakar') ? 'SN' : 'CI';
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const tracking = `DP-${codePays}-${randomSuffix}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    onCreerColis({
      trackingNumber: tracking,
      agenceId: nouveauColis.agenceId,
      merchantId: nouveauColis.merchantId,
      nomBoutique: nouveauColis.nomBoutique,
      nomClient: nouveauColis.nomClient,
      telephoneClient: nouveauColis.telephoneClient,
      ville: nouveauColis.ville,
      commune: nouveauColis.commune,
      adresse: nouveauColis.adresse || nouveauColis.commune,
      montantCOD: Number(nouveauColis.montantCOD),
      fraisLivraison: Number(nouveauColis.fraisLivraison),
      statut: 'en_attente',
      codeOTP: otp,
      notes: nouveauColis.notes,
      dateCreation: new Date().toISOString(),
      historique: [
        {
          statut: 'en_attente',
          date: new Date().toISOString(),
          commentaire: `Colis enregistré par ${nouveauColis.nomBoutique}`
        }
      ]
    });

    setShowCreateModal(false);
    setNouveauColis({
      nomClient: '',
      telephoneClient: '',
      ville: 'Abidjan',
      commune: 'Cocody',
      adresse: '',
      montantCOD: 20000,
      fraisLivraison: 2000,
      nomBoutique: 'Wax & Chic Abidjan',
      merchantId: 'mch_abidjan_01',
      agenceId: 'agence_express_ci',
      notes: ''
    });
  };

  const getStatutBadge = (statut: StatutColis) => {
    switch (statut) {
      case 'livre':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Livré
          </span>
        );
      case 'en_cours':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Truck className="w-3 h-3" /> En cours
          </span>
        );
      case 'ramasse':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Package className="w-3 h-3" /> Ramassé
          </span>
        );
      case 'assigne':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Assigné
          </span>
        );
      case 'annule':
      case 'retourne':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> {statut === 'retourne' ? 'Retourné' : 'Annulé'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Role Context */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Hub Opérationnel Dropia</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
              Espace {currentRole.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Gestion du Cash on Delivery (COD), affectation des livreurs et suivi temps réel des colis à Abidjan et Dakar.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-lg shadow-amber-500/20 text-sm"
        >
          <Plus className="w-4 h-4" />
          Nouveau Colis
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Colis */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Volume Total</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalColis}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
            <span className="text-emerald-400 font-medium">{colisEnCours} en acheminement</span>
          </div>
        </div>

        {/* Taux de Réussite */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Taux de Livraison</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">{tauxReussite}%</div>
          <div className="text-xs text-slate-400 mt-2">
            {colisLivres} colis livrés avec succès (OTP / POD)
          </div>
        </div>

        {/* Montant COD Encaissé */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">COD Encaissé (Livré)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400">
            {codLivre.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">FCFA</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Sur un volume global de {totalCOD.toLocaleString('fr-FR')} FCFA
          </div>
        </div>

        {/* Flotte Livreurs */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Livreurs Actifs</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{livreursList.length}</div>
          <div className="text-xs text-slate-400 mt-2">
            Authentifiés par PIN 4 chiffres sur smartphone
          </div>
        </div>
      </div>

      {/* Parcels Table & Filters */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base">Suivi et Expéditions des Colis</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs">
              {filteredColis.length} affichés
            </span>
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="N° suivi, client, commune..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-52 sm:w-64"
              />
            </div>

            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
              {['tous', 'en_attente', 'ramasse', 'en_cours', 'livre'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition ${
                    selectedFilter === filter
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter === 'tous' ? 'Tous' : filter.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 uppercase font-semibold text-slate-400 text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Numéro de Suivi</th>
                <th className="py-3 px-3">Client & Téléphone</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3">Montant COD (FCFA)</th>
                <th className="py-3 px-3">Livreur</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredColis.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    Aucun colis ne correspond à vos critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredColis.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-amber-400">{c.trackingNumber}</div>
                      <div className="text-[11px] text-slate-500">{c.nomBoutique || 'Boutique Dropia'}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-white">{c.nomClient}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {c.telephoneClient}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-medium">{c.commune}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-xs">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        {c.ville} - {c.adresse}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-emerald-400">
                        {c.montantCOD.toLocaleString('fr-FR')} FCFA
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Frais: {c.fraisLivraison.toLocaleString('fr-FR')} FCFA
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {c.nomLivreur ? (
                        <span className="text-slate-200 font-medium">{c.nomLivreur}</span>
                      ) : (
                        <span className="text-slate-500 italic">Non assigné</span>
                      )}
                    </td>

                    <td className="py-3 px-3">{getStatutBadge(c.statut)}</td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedColis(c)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs font-medium inline-flex items-center gap-1"
                      >
                        Détails
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détails Colis */}
      {selectedColis && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  Détail du Colis {selectedColis.trackingNumber}
                </h3>
                <p className="text-xs text-slate-400">Identifiant Firestore: {selectedColis.id}</p>
              </div>
              <button
                onClick={() => setSelectedColis(null)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase">Client</span>
                <p className="text-sm font-bold text-white">{selectedColis.nomClient}</p>
                <p className="text-slate-400">{selectedColis.telephoneClient}</p>
                <p className="text-slate-400 mt-2">
                  <MapPin className="w-3 h-3 inline mr-1 text-amber-400" />
                  {selectedColis.commune}, {selectedColis.ville}
                </p>
                <p className="text-slate-500 text-[11px]">{selectedColis.adresse}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase">Finances COD</span>
                <p className="text-lg font-black text-emerald-400">
                  {selectedColis.montantCOD.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-slate-400">
                  Frais de livraison: {selectedColis.fraisLivraison.toLocaleString('fr-FR')} FCFA
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Code OTP validation:</span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {selectedColis.codeOTP || '4821'}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Status Fast Actions */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Changer le statut en direct:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                {(['en_attente', 'ramasse', 'en_cours', 'livre', 'retourne'] as StatutColis[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateStatut(
                        selectedColis.id,
                        st,
                        `Statut mis à jour vers ${st} par ${currentRole}`
                      );
                      setSelectedColis({ ...selectedColis, statut: st });
                    }}
                    className={`px-3 py-1.5 rounded-lg border font-medium transition capitalize ${
                      selectedColis.statut === st
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Historique Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Chronologie d'Acheminement
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {(selectedColis.historique || [
                  {
                    statut: selectedColis.statut,
                    date: selectedColis.dateCreation,
                    commentaire: 'Événement enregistré dans le système Dropia'
                  }
                ]).map((hist, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs p-2 rounded bg-slate-950/50 border border-slate-800/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-slate-200">{hist.commentaire}</p>
                      <span className="text-[10px] text-slate-500">
                        {new Date(hist.date).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedColis(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création Nouveau Colis */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleFormSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Créer une Nouvelle Expédition (Colis COD)
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nom du destinataire *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bakary Sanogo"
                  value={nouveauColis.nomClient}
                  onChange={(e) => setNouveauColis({ ...nouveauColis, nomClient: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Numéro de Téléphone *</label>
                <input
                  type="text"
                  required
                  placeholder="+225 07 00 00 00"
                  value={nouveauColis.telephoneClient}
                  onChange={(e) => setNouveauColis({ ...nouveauColis, telephoneClient: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ville</label>
                <select
                  value={nouveauColis.ville}
                  onChange={(e) => setNouveauColis({ ...nouveauColis, ville: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Abidjan">Abidjan (Côte d'Ivoire)</option>
                  <option value="Dakar">Dakar (Sénégal)</option>
                  <option value="Douala">Douala (Cameroun)</option>
                  <option value="Bouaké">Bouaké (Côte d'Ivoire)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Commune / Quartier *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cocody Angré, Yopougon, Plateau"
                  value={nouveauColis.commune}
                  onChange={(e) => setNouveauColis({ ...nouveauColis, commune: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Repère ou adresse précise</label>
                <input
                  type="text"
                  placeholder="Ex: Pharmacie Sainte-Marie, Carrefour Duncan"
                  value={nouveauColis.adresse}
                  onChange={(e) => setNouveauColis({ ...nouveauColis, adresse: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Montant COD (FCFA)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={nouveauColis.montantCOD}
                  onChange={(e) => setNouveauColis({ ...nouveauColis, montantCOD: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Frais de livraison (FCFA)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={nouveauColis.fraisLivraison}
                  onChange={(e) => setNouveauColis({ ...nouveauColis, fraisLivraison: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Enregistrer le Colis
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
