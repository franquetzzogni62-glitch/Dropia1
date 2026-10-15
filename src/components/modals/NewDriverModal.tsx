import React, { useState } from 'react';
import { Bike, X, Smartphone, MapPin, KeyRound, DollarSign, ShieldCheck } from 'lucide-react';
import type { Livreur } from '../../types';

interface NewDriverModalProps {
  onClose: () => void;
  onSubmit: (livreur: Omit<Livreur, 'id' | 'dateCreation'>) => void;
}

export const NewDriverModal: React.FC<NewDriverModalProps> = ({ onClose, onSubmit }) => {
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('+221 ');
  const [pin, setPin] = useState(String(Math.floor(1000 + Math.random() * 9000)));
  const [zone, setZone] = useState('Plateau / Dakar');
  const [vehicule, setVehicule] = useState<'moto' | 'voiture' | 'tricycle'>('moto');
  const [immatriculation, setImmatriculation] = useState('SN-DK-8492');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !telephone.trim()) return;

    onSubmit({
      nom: nom.trim(),
      telephone: telephone.trim(),
      pin: pin.trim() || '1234',
      zone,
      vehicule,
      immatriculation: immatriculation.trim(),
      agenceId: '',
      actif: true,
      colisEnCours: 0,
      tauxReussite: 100,
      soldeCollecteAujourdhui: 0
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs text-slate-800"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Enregistrer un Livreur (Production)
              </h3>
              <span className="text-[10px] text-slate-500">
                Génération de son code PIN sécurisé pour l'application mobile
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Nom complet du coursier :
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Ibrahima Ndiaye"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Numéro Téléphone :
              </label>
              <input
                type="text"
                required
                placeholder="+221 77..."
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Code PIN (4 chiffres) :
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="4 chiffres"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs font-mono font-bold tracking-widest text-center"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Zone habituelle :
              </label>
              <input
                type="text"
                placeholder="Ex: Plateau, Pikine, Cocody"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Plaque / Immatriculation :
              </label>
              <input
                type="text"
                placeholder="Ex: SN-DK-2026"
                value={immatriculation}
                onChange={(e) => setImmatriculation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Le livreur pourra immédiatement se connecter à l'App Livreur (PWA) avec son numéro et ce code PIN.
          </span>
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs"
          >
            Enregistrer le livreur
          </button>
        </div>
      </form>
    </div>
  );
};
