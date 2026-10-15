import React from 'react';
import { Package, Shield, Truck, Store, Database, Terminal, CreditCard, RefreshCw } from 'lucide-react';
import type { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSeedDatabase: () => void;
  isSeeding: boolean;
  dbConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  activeTab,
  setActiveTab,
  onSeedDatabase,
  isSeeding,
  dbConnected
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      {/* Top Banner: Status & Quick Info */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            Firestore DB: <code className="text-amber-300/90 font-mono">ai-studio-dropiaarchitectu-9dff64e9</code>
          </span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">
            Réseau: <strong className="text-slate-200">Afrique Francophone (UEMOA / CEMAC)</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Devise: <strong className="text-emerald-400">XOF (FCFA)</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSeedDatabase}
            disabled={isSeeding}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition text-xs font-medium disabled:opacity-50"
            title="Initialiser ou réinitialiser les collections Firestore avec les données démo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            {isSeeding ? 'Initialisation...' : 'Amorcer Firestore'}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl">
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">Dropia</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">
                Logistics OS
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Architecture & Plateforme de Livraison COD
            </p>
          </div>
        </div>

        {/* Role Switcher Pill */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="px-2.5 py-1 text-slate-500 font-semibold hidden md:inline">Rôle actif:</span>
          <button
            onClick={() => setCurrentRole('agence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              currentRole === 'agence' || currentRole === 'agency'
                ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Agence 3PL
          </button>
          <button
            onClick={() => setCurrentRole('ecommercant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              currentRole === 'ecommercant' || currentRole === 'merchant'
                ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Marchand
          </button>
          <button
            onClick={() => {
              setCurrentRole('livreur');
              setActiveTab('driver_pin');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              currentRole === 'livreur' || currentRole === 'driver'
                ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Livreur PIN
          </button>
          <button
            onClick={() => setCurrentRole('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              currentRole === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-2 border-t border-slate-800/80 text-sm scrollbar-none py-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          Opérations & Colis
        </button>

        <button
          onClick={() => setActiveTab('driver_pin')}
          className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'driver_pin'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          Espace Livreur (PIN)
        </button>

        <button
          onClick={() => setActiveTab('saas_billing')}
          className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'saas_billing'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Abonnements & SasPay
        </button>

        <button
          onClick={() => setActiveTab('architecture_schemas')}
          className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'architecture_schemas'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Architecture & Règles Firestore
        </button>

        <button
          onClick={() => setActiveTab('developer_api')}
          className={`flex items-center gap-2 px-3.5 py-2 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'developer_api'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          API REST & Webhooks
        </button>
      </div>
    </header>
  );
};
