import React from 'react';
import {
  HelpCircle,
  LogOut,
  Menu
} from 'lucide-react';
import type { UserProfile } from '../types';

interface TopHeaderProps {
  userProfile: UserProfile | null;
  onOpenGuide: () => void;
  onOpenPwa?: () => void;
  onOpenLanding?: () => void;
  onLogout: () => void;
  onPurgeDatabase?: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  userProfile,
  onOpenGuide,
  onLogout,
  onToggleMobileMenu
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
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Hamburger & User Brand ID */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Hamburger button visible on mobile and tablet */}
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer shrink-0"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-bold text-slate-900 text-xs tracking-tight truncate max-w-[130px] sm:max-w-[220px]">
              {displayName}
            </span>
            <span className="hidden sm:inline-flex text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 truncate block">
            {displayCity} • {roleLabel}
          </span>
        </div>
      </div>

      {/* Right: Action Tools & Badges */}
      <div className="flex items-center gap-1.5 sm:gap-3 text-xs shrink-0">
        {/* Guide Plateforme & Aide Button */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition font-medium text-[11px] cursor-pointer"
          title="Guide & Aide"
        >
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Guide & Aide</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 transition font-semibold text-[11px] cursor-pointer"
          title="Se déconnecter"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
};
