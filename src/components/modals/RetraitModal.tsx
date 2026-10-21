import React, { useState } from 'react';
import { ArrowUpRight, X, Smartphone, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Info } from 'lucide-react';

interface RetraitModalProps {
  onClose: () => void;
  maxBalance: number;
  onSuccess: (amount: number) => void;
}

export const RetraitModal: React.FC<RetraitModalProps> = ({ onClose, maxBalance, onSuccess }) => {
  const [montant, setMontant] = useState(10000);
  const [operateur, setOperateur] = useState<'wave' | 'orange' | 'mtn' | 'moov'>('wave');
  const [phone, setPhone] = useState('+225 07 ');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [serverIpNotice, setServerIpNotice] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  const handleRetrait = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setServerIpNotice('');

    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMsg('Veuillez saisir un numéro de téléphone Mobile Money valide.');
      return;
    }

    if (montant <= 0) {
      setErrorMsg('Veuillez saisir un montant positif.');
      return;
    }

    if (montant > maxBalance && maxBalance > 0) {
      setErrorMsg(`Le montant demandé dépasse votre solde disponible (${maxBalance.toLocaleString('fr-FR')} FCFA).`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/saspay/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          montant,
          telephone: phone,
          operateur,
          description: `Retrait Mobile Money Dropia vers ${phone}`
        })
      });

      const data = await res.json().catch(() => null);

      if (!data || !data.success) {
        if (data?.serverIpNotice) {
          setServerIpNotice(data.serverIpNotice);
        }
        const errDetail = data?.error?.message || (typeof data?.error === 'string' ? data.error : '') || 'Échec lors de l\'initialisation du retrait.';
        throw new Error(errDetail);
      }

      setSuccessData(data.data || {});
      onSuccess(montant);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la communication avec le service de décaissement SasPay.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleRetrait}
        className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Demande de Décaissement / Retrait</h3>
              <span className="text-[10px] text-slate-500">Envoi de fonds direct vers Mobile Money (SasPay Payouts)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {serverIpNotice && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Configuration Requise sur SasPay</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {serverIpNotice}
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successData ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-bold text-slate-900 text-sm">Décaissement initié avec succès !</h4>
            <p className="text-slate-600 text-xs">
              Un versement de <strong>{montant.toLocaleString('fr-FR')} FCFA</strong> a été envoyé vers le compte {phone} ({operateur.toUpperCase()}).
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-semibold">Montant à retirer (FCFA)</label>
                <span className="text-[11px] text-slate-500">
                  Solde : {maxBalance.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <input
                type="number"
                step="1000"
                min="500"
                value={montant}
                onChange={(e) => setMontant(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Opérateur Bénéficiaire</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'wave', label: 'Wave' },
                  { id: 'orange', label: 'Orange' },
                  { id: 'mtn', label: 'MTN' },
                  { id: 'moov', label: 'Moov' }
                ].map(op => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperateur(op.id as any)}
                    className={`p-2 rounded-lg border text-center font-bold text-xs transition cursor-pointer ${
                      operateur === op.id
                        ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Numéro Mobile Money du Bénéficiaire</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+225 07 00 00 00 00"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Opération sécurisée via l'API Payouts SasPay (authentification serveur sk_live).</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-[#1E40AF] hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Traitement du décaissement...</span>
                </>
              ) : (
                <span>Confirmer le retrait de {montant.toLocaleString('fr-FR')} FCFA</span>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
