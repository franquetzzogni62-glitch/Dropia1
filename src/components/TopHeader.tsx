import React from 'react';
import {
  HelpCircle,
  LogOut
} from 'lucide-react';
import type { UserProfile } from '../types';

interface TopHeaderProps {
  userProfile: UserProfile | null;
  onOpenGuide: () => void;
  onOpenPwa?: () => void;
  onOpenLanding?: () => void;
  onLogout: () => void;
  onPurgeDatabase?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  userProfile,
  onOpenGuide,
  onLogout
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
        {/* Guide Plateforme & Aide Button */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition font-medium text-[11px] cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Guide & Aide
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 transition font-semibold text-[11px] cursor-pointer"
          title="Se déconnecter"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </header>
  );
};
