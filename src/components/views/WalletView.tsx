import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Plus,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Calendar,
  CheckCircle2,
  Globe,
  Clock,
  ArrowUpCircle
} from 'lucide-react';
import type { TransactionFinanciere } from '../../types';
import { RetraitModal } from '../modals/RetraitModal';

interface WalletViewProps {
  walletBalance: number;
  transactionsList?: TransactionFinanciere[];
  onOpenRecharge: () => void;
  onRefresh: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  walletBalance,
  transactionsList = [],
  onOpenRecharge,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [showRetraitModal, setShowRetraitModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Portefeuille & Finances (FCFA)
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-[11px] font-bold">
              ● Mode Production SasPay
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos dépôts Mobile Money, retraits par virement direct et reversements COD.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-2xs cursor-pointer min-h-[40px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Actualiser</span>
          </button>
          <button
            onClick={() => setShowRetraitModal(true)}
            className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs cursor-pointer min-h-[40px]"
          >
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
            <span>Retrait</span>
          </button>
          <button
            onClick={() => navigate('/paiement?montant=20000&type=recharge')}
            className="w-full sm:w-auto justify-center flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Recharger via Mobile Money</span>
          </button>
        </div>
      </div>

      {/* Main Balance Banner */}
      <div className="bg-gradient-to-br from-[#0a1124] to-[#131d3b] text-white p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block font-medium">
              Solde disponible en compte
            </span>
            <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight mt-1 text-emerald-400 tabular-nums">
              {walletBalance.toLocaleString('fr-FR')}{' '}
              <span className="text-lg sm:text-xl font-normal text-slate-300">FCFA</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
              Fonds immédiatement disponibles pour couvrir vos frais de livraison ou être retirés vers votre Mobile Money.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setShowRetraitModal(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px]"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
              Retirer vers Mobile Money
            </button>
            <button
              onClick={() => navigate('/paiement?montant=20000&type=recharge')}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px]"
            >
              <Plus className="w-4 h-4" />
              + Approvisionner mon solde
            </button>
          </div>
        </div>
      </div>

      {/* Retrait Modal */}
      {showRetraitModal && (
        <RetraitModal
          maxBalance={walletBalance}
          onClose={() => setShowRetraitModal(false)}
          onSuccess={() => {
            onRefresh();
          }}
        />
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs">
            Historique des transactions ({transactionsList.length})
          </h3>
          <span className="text-xs text-slate-500">Mouvements en temps réel</span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 border-y border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Référence</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Type</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Détail</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Statut</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactionsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        Aucune transaction pour le moment
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                        Vos approvisionnements Mobile Money (Wave, Orange Money, MTN) et versements COD s'afficheront ici automatiquement.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/paiement?montant=20000&type=recharge')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Effectuer un premier rechargement
                    </button>
                  </td>
                </tr>
              ) : (
                transactionsList.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {t.id}
                    </td>
                    <td className="py-3 px-3 font-medium capitalize text-slate-800">
                      {t.type.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {t.referencePaiement || t.referenceColis || 'Paiement Mobile Money'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {new Date(t.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Complété
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                      +{t.montant.toLocaleString('fr-FR')} FCFA
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
