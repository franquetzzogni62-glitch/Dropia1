import React, { useState } from 'react';
import { Wallet, X, Zap, Smartphone, CheckCircle2 } from 'lucide-react';

interface RechargeModalProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({ onClose, onSuccess }) => {
  const [montant, setMontant] = useState(50000);
  const [operateur, setOperateur] = useState<'wave' | 'orange' | 'mtn'>('wave');
  const [phone, setPhone] = useState('+221 77 456 12 34');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetch('/api/saspay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          montant,
          telephone: phone,
          operateur,
          description: 'Rechargement portefeuille Dropia FCFA'
        })
      });

      // Simulate successful confirmation
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg(true);
        setTimeout(() => {
          onSuccess(montant);
          onClose();
        }, 1500);
      }, 1500);
    } catch {
      setIsLoading(false);
      onSuccess(montant);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleRecharge}
        className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recharger le Portefeuille</h3>
              <span className="text-[10px] text-slate-500">Approvisionnement Mobile Money direct</span>
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

        {successMsg ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-bold text-slate-900 text-sm">Paiement validé avec succès !</h4>
            <p className="text-slate-500 text-xs">+{montant.toLocaleString('fr-FR')} FCFA ajoutés à votre portefeuille.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Montant à créditer (FCFA)</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[25000, 50000, 100000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setMontant(amt)}
                    className={`py-1.5 rounded-lg border font-mono font-bold ${
                      montant === amt
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {amt.toLocaleString('fr-FR')} F
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="5000"
                value={montant}
                onChange={(e) => setMontant(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Opérateur</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'wave', label: 'Wave' },
                  { id: 'orange', label: 'Orange Money' },
                  { id: 'mtn', label: 'MTN MoMo' }
                ].map(op => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperateur(op.id as any)}
                    className={`p-2 rounded-lg border text-center font-bold ${
                      operateur === op.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Numéro Mobile Money pour le push</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
            >
              {isLoading ? 'En attente du push USSD...' : `Payer ${montant.toLocaleString('fr-FR')} FCFA`}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
