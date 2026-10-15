import React, { useState } from 'react';
import { Package, X, Bike, Building2, Sparkles, MapPin, Phone, DollarSign } from 'lucide-react';
import type { Colis, UserProfile } from '../../types';

interface NewOrderModalProps {
  userProfile?: UserProfile | null;
  onClose: () => void;
  onSubmit: (colis: Omit<Colis, 'id'>) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ userProfile, onClose, onSubmit }) => {
  const [nomClient, setNomClient] = useState('');
  const [telephoneClient, setTelephoneClient] = useState('+221 ');
  const [ville, setVille] = useState(userProfile?.ville || 'Dakar');
  const [commune, setCommune] = useState('Plateau');
  const [adresse, setAdresse] = useState('');
  const [montantCOD, setMontantCOD] = useState(25000);
  const [fraisLivraison, setFraisLivraison] = useState(2000);
  const [mode, setMode] = useState<'A' | 'B' | 'C'>('C');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomClient.trim() || !telephoneClient.trim()) return;

    const randomSuffix = String(Math.floor(10000 + Math.random() * 90000));
    const tracking = `DRP-2026-${randomSuffix}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    onSubmit({
      trackingNumber: tracking,
      agenceId: userProfile?.role === 'agence' ? userProfile.uid : 'hub_central',
      merchantId: userProfile?.uid || 'mch_prod',
      nomBoutique: userProfile?.nomBoutique || userProfile?.nom || 'Ma Boutique Dropia',
      nomClient: nomClient.trim(),
      telephoneClient: telephoneClient.trim(),
      ville,
      commune,
      adresse,
      montantCOD: Number(montantCOD),
      fraisLivraison: Number(fraisLivraison),
      statut: 'en_cours',
      codeOTP: otp,
      nomLivreur: mode === 'A' || mode === 'C' ? 'Flotte Interne' : 'Partenaire 3PL',
      dateCreation: new Date().toISOString(),
      historique: [
        {
          statut: 'en_cours',
          date: new Date().toISOString(),
          commentaire: 'Commande enregistrée en Mode Production.'
        }
      ]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Nouvelle Expédition Dropia</h3>
              <span className="text-[10px] text-slate-500">Dispatch automatique immédiat</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Client details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nom du client *</label>
            <input
              type="text"
              required
              placeholder="ex: Fatou Ndiaye"
              value={nomClient}
              onChange={(e) => setNomClient(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Téléphone *</label>
            <input
              type="text"
              required
              placeholder="+221 76 555 44 33"
              value={telephoneClient}
              onChange={(e) => setTelephoneClient(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Ville</label>
            <select
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
            >
              <option value="Dakar">Dakar (Sénégal)</option>
              <option value="Abidjan">Abidjan (RCI)</option>
              <option value="Douala">Douala (Cameroun)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Commune / Quartier *</label>
            <input
              type="text"
              required
              placeholder="ex: Pikine, Dakar Plateau, Almadies"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-semibold mb-1">Point de repère précis</label>
            <input
              type="text"
              placeholder="ex: À côté de la boulangerie jaune"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Montant COD (FCFA)</label>
            <input
              type="number"
              step="500"
              value={montantCOD}
              onChange={(e) => setMontantCOD(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-emerald-700 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Frais de course (FCFA)</label>
            <input
              type="number"
              step="500"
              value={fraisLivraison}
              onChange={(e) => setFraisLivraison(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Mode dispatch */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1.5">Mode d'assignation</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMode('A')}
              className={`p-2 rounded-lg border text-center transition ${
                mode === 'A' ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold' : 'border-slate-200 text-slate-600'
              }`}
            >
              Option A (Interne)
            </button>
            <button
              type="button"
              onClick={() => setMode('B')}
              className={`p-2 rounded-lg border text-center transition ${
                mode === 'B' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200 text-slate-600'
              }`}
            >
              Option B (3PL)
            </button>
            <button
              type="button"
              onClick={() => setMode('C')}
              className={`p-2 rounded-lg border text-center transition ${
                mode === 'C' ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold' : 'border-slate-200 text-slate-600'
              }`}
            >
              Option C (Hybride)
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs"
          >
            Créer et Dispatcher
          </button>
        </div>
      </form>
    </div>
  );
};
