import React from 'react';
import {
  HelpCircle,
  Sparkles,
  Bell,
  Smartphone,
  ExternalLink,
  LogOut,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import type { UserProfile } from '../types';

interface TopHeaderProps {
  userProfile: UserProfile | null;
  onOpenGuide: () => void;
  onOpenPwa: () => void;
  onOpenLanding: () => void;
  onLogout: () => void;
  onPurgeDatabase: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  userProfile,
  onOpenGuide,
  onOpenPwa,
  onOpenLanding,
  onLogout,
  onPurgeDatabase
}) => {
  const displayName = userProfile?.nomBoutique || userProfile?.nom || 'Dropia Utilisateur';
  const displayCity = userProfile?.ville || 'Dakar';
  const roleLabel =
    userProfile?.role === 'agence'
      ? 'Agence 3PL'
      : userProfile?.role === 'livreur'
      ? 'Livreur Pro'
      : 'E-commerçant';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'DR';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* User Brand ID */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shadow-xs">
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-xs tracking-tight">
              {displayName}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Mode Production
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {displayCity} • {roleLabel}
          </span>
        </div>
      </div>

      {/* Action Tools & Badges */}
      <div className="flex items-center gap-3 text-xs">
        {/* Toggle to Landing Page */}
        <button
          onClick={onOpenLanding}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition font-medium text-[11px]"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          Site Public
        </button>

        {/* Console Admin Dropia */}
        <a
          href="/admin"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-300 bg-blue-50/80 hover:bg-blue-100 text-[#1E40AF] transition font-bold text-[11px]"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#1E40AF]" strokeWidth={1.75} />
          <span>Console Admin</span>
        </a>

        {/* PWA Livreur Mobile Link */}
        <button
          onClick={onOpenPwa}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 transition font-medium text-[11px]"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span>App Livreur (PWA)</span>
        </button>

        {/* Purge Fictitious Data Button */}
        <button
          onClick={onPurgeDatabase}
          title="Nettoyer les données fictives de la base"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 transition font-medium text-[11px]"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span>Purger données test</span>
        </button>

        {/* Guide Plateforme & Aide Button */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition font-medium text-[11px]"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Guide & Aide
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 transition font-semibold text-[11px]"
          title="Se déconnecter"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </header>
  );
};
