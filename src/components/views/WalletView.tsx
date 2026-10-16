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
  Clock
} from 'lucide-react';
import type { TransactionFinanciere } from '../../types';

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
  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Portefeuille & Finances (FCFA)
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              ● Mode Production
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos rechargements Mobile Money et vos reversements de Cash on Delivery (COD).
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
            onClick={() => navigate('/paiement?montant=20000&type=recharge')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Recharger via Mobile Money
          </button>
        </div>
      </div>

      {/* Main Balance Banner */}
      <div className="bg-gradient-to-br from-[#0a1124] to-[#131d3b] text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block font-medium">
              Solde disponible en compte
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight mt-1 text-emerald-400">
              {walletBalance.toLocaleString('fr-FR')}{' '}
              <span className="text-xl font-normal text-slate-300">FCFA</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Fonds immédiatement disponibles pour couvrir vos frais de livraison et décharges livreurs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/paiement?montant=20000&type=recharge')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              + Approvisionner mon solde
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs">
            Historique des transactions ({transactionsList.length})
          </h3>
          <span className="text-xs text-slate-500">Mouvements en temps réel</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Référence</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Détail</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3 text-right">Montant</th>
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
