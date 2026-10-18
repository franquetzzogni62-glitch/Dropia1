import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Bike,
  Building2,
  TrendingUp,
  Wallet,
  Code,
  Settings,
  HelpCircle,
  Mail,
  Zap,
  ArrowRight,
  Store,
  ShieldCheck
} from 'lucide-react';
import type { UserProfile } from '../types';

export type TabKey =
  | 'dashboard'
  | 'orders'
  | 'drivers'
  | 'ecommercants'
  | 'partners'
  | 'analytics'
  | 'wallet'
  | 'api_webhooks'
  | 'settings';

interface SidebarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  walletBalance: number;
  colisCount?: number;
  livreursCount?: number;
  ecommercantsCount?: number;
  userProfile?: UserProfile | null;
  onOpenRecharge: () => void;
  onOpenLanding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  walletBalance,
  colisCount = 0,
  livreursCount = 0,
  ecommercantsCount = 0,
  userProfile,
  onOpenRecharge,
  onOpenLanding
}) => {
  const navigate = useNavigate();
  const menuItems: Array<{ key: TabKey; label: string; icon: React.ReactNode; badge?: number }> = [
    { key: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'orders', label: 'Commandes', icon: <Package className="w-4 h-4" /> },
    { key: 'drivers', label: 'Flotte de Livreurs', icon: <Bike className="w-4 h-4" /> },
    { key: 'ecommercants', label: 'E-commerçants', icon: <Store className="w-4 h-4" />, badge: ecommercantsCount },
    { key: 'partners', label: 'Agences Partenaires', icon: <Building2 className="w-4 h-4" /> },
    { key: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'wallet', label: 'Portefeuille (FCFA)', icon: <Wallet className="w-4 h-4" /> },
    { key: 'api_webhooks', label: 'API & Webhooks (CMS)', icon: <Code className="w-4 h-4" /> },
    { key: 'settings', label: 'Paramètres', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#0a1124] text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800/80 min-h-screen text-xs select-none">
      {/* Top Logo & Navigation */}
      <div className="p-4 space-y-6">
        {/* Brand */}
        <div
          onClick={onOpenLanding}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Voir la page d'accueil"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/30 group-hover:scale-105 transition">
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">Dropia</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                PROD
              </span>
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-emerald-400 transition">
              ← Accueil & Site
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition font-medium ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate flex-1 text-left">{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Cards */}
      <div className="p-4 space-y-3 border-t border-slate-800/80 bg-[#090f20]">
        {/* Forfaits & Quotas PRO Card */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1 text-[11px]">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Forfaits & Quotas
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px] uppercase border border-emerald-500/30">
              LIVE
            </span>
          </div>
          <div className="space-y-1 text-[10px] text-slate-400">
            <div className="flex justify-between">
              <span>Colis en base</span>
              <strong className="text-white font-mono">{colisCount}</strong>
            </div>
            <div className="flex justify-between">
              <span>Livreurs actifs</span>
              <strong className="text-white font-mono">{livreursCount}</strong>
            </div>
          </div>
        </div>

        {/* Portefeuille Card */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-400 block">Solde du portefeuille</span>
          <div className="text-base font-black text-white font-mono">
            {walletBalance.toLocaleString('fr-FR')} <span className="text-xs text-slate-400 font-normal">FCFA</span>
          </div>
          <p className="text-[9px] text-slate-500">Disponible pour vos livraisons et retraits</p>
          <button
            onClick={() => navigate('/paiement?type=recharge&montant=10000')}
            className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow cursor-pointer"
          >
            Recharger le portefeuille
          </button>
        </div>

        {/* Support Card */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <div>
            <span className="font-semibold text-slate-300 block">Support Client</span>
            <span className="text-slate-500">contact@dropia.com</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab('settings')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium"
            >
              Guide
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
