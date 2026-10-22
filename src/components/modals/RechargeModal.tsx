import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, X, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

interface RechargeModalProps {
  onClose: () => void;
  onSuccess?: (amount: number) => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [montant, setMontant] = useState(20000);

  const handlePayerSurSaspay = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    navigate(`/paiement?montant=${montant}&type=recharge`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handlePayerSurSaspay}
        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recharger le Portefeuille Dropia</h3>
              <span className="text-[10px] text-slate-500">Portail officiel de paiement SasPay</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Montant du rechargement (FCFA)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[10000, 20000, 50000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setMontant(amt)}
                  className={`py-2 rounded-xl border font-mono font-bold transition cursor-pointer ${
                    montant === amt
                      ? 'border-[#1E40AF] bg-blue-50 text-[#1E40AF] shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {amt.toLocaleString('fr-FR')} F
                </button>
              ))}
            </div>
            <input
              type="number"
              step="1000"
              min="200"
              value={montant}
              onChange={(e) => setMontant(Math.max(200, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-600 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
              <Lock className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span>Règlement direct sur le portail SasPay</span>
            </div>
            <p>
              Le choix du réseau Mobile Money (Wave, Orange, MTN, Moov) ainsi que la saisie du numéro s'effectuent directement sur le portail officiel SasPay.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#1E40AF] hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Payer {montant.toLocaleString('fr-FR')} FCFA sur SasPay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
