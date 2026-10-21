import React, { useState } from 'react';
import { Wallet, X, Smartphone, CheckCircle2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface RechargeModalProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({ onClose, onSuccess }) => {
  const [montant, setMontant] = useState(25000);
  const [operateur, setOperateur] = useState<'wave' | 'orange' | 'mtn' | 'moov'>('wave');
  const [phone, setPhone] = useState('+225 07 ');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setCheckoutUrl('');

    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMsg('Veuillez saisir un numéro de téléphone valide pour Mobile Money.');
      return;
    }

    if (montant < 200) {
      setErrorMsg('Le montant minimum de rechargement est de 200 FCFA.');
      return;
    }

    setIsLoading(true);

    try {
      const returnUrl = `${window.location.origin}/paiement?status=success&type=recharge&montant=${montant}&operator=${operateur}`;

      const res = await fetch('/api/saspay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          montant,
          telephone: phone,
          operateur,
          type: 'recharge',
          description: `Rechargement Portefeuille Dropia (${montant.toLocaleString('fr-FR')} FCFA)`,
          customerEmail: 'portefeuille@dropia.com',
          customerName: 'Utilisateur Dropia',
          returnUrl
        })
      });

      const data = await res.json().catch(() => null);

      if (!data || !data.success) {
        const detail = data?.error?.message || (typeof data?.error === 'string' ? data.error : '') || 'Impossible d\'initialiser le paiement SasPay.';
        throw new Error(detail);
      }

      const targetUrl = data.checkoutUrl || data.paymentUrl || '';
      setCheckoutUrl(targetUrl);
      setTransactionId(data.sessionId || data.paymentId || data.reference || '');
      setIsLoading(false);

      if (targetUrl) {
        setIsRedirecting(true);
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 1200);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Une erreur est survenue lors de la communication avec SasPay.');
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
              <span className="text-[10px] text-slate-500">Paiement réel Mobile Money via SasPay</span>
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

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isRedirecting && checkoutUrl ? (
          <div className="py-6 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-emerald-600 mx-auto animate-spin" />
            <h4 className="font-bold text-slate-900 text-sm">Redirection vers SasPay...</h4>
            <p className="text-slate-500 text-xs">
              Vous allez être redirigé vers la page sécurisée SasPay pour débiter votre compte Mobile Money.
            </p>
            <a
              href={checkoutUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              <span>Accéder maintenant</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Montant à créditer (FCFA)</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[10000, 25000, 50000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setMontant(amt)}
                    className={`py-1.5 rounded-lg border font-mono font-bold transition cursor-pointer ${
                      montant === amt
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
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
                onChange={(e) => setMontant(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Opérateur</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'wave', label: 'Wave' },
                  { id: 'orange', label: 'Orange' },
                  { id: 'mtn', label: 'MTN MoMo' },
                  { id: 'moov', label: 'Moov' }
                ].map(op => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperateur(op.id as any)}
                    className={`p-2 rounded-lg border text-center font-bold text-xs transition cursor-pointer ${
                      operateur === op.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Numéro Mobile Money</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+225 07 00 00 00 00"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connexion à SasPay...</span>
                </>
              ) : (
                <span>Payer {montant.toLocaleString('fr-FR')} FCFA via SasPay</span>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
