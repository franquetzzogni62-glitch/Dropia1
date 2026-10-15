import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Store, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ChoixRoleInscriptionProps {
  onSelectRole?: (role: 'agence' | 'ecommercant') => void;
}

export const ChoixRoleInscription: React.FC<ChoixRoleInscriptionProps> = ({ onSelectRole }) => {
  const navigate = useNavigate();

  const handleChooseAgency = () => {
    if (onSelectRole) {
      onSelectRole('agence');
    } else {
      navigate('/register?role=agence');
    }
  };

  const handleChooseMerchant = () => {
    if (onSelectRole) {
      onSelectRole('ecommercant');
    } else {
      navigate('/register-ecommercant');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4">
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-black text-xl text-slate-950 tracking-tight block leading-none">
              Dropia
            </span>
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
              Logistique Afrique
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="text-xs font-semibold text-slate-600 hover:text-emerald-700 transition"
        >
          Déjà un compte ? <span className="text-emerald-700 font-bold underline">Se connecter</span>
        </button>
      </header>

      {/* Main Choice Card */}
      <main className="max-w-3xl mx-auto w-full my-auto py-8">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rejoignez l'écosystème logistique Dropia</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Créer un compte Dropia
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Sélectionnez votre profil d'activité pour configurer votre espace dédié en quelques instants.
          </p>
        </div>

        {/* 2 Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carte 1 : Agence de livraison */}
          <div
            onClick={handleChooseAgency}
            className="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-emerald-600 transition-all duration-200 shadow-sm hover:shadow-xl cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition duration-200 shadow-sm">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Flotte & Dispatch
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  Agence de livraison
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Vous gérez des coursiers (moto, vélo, voiture), des colis et effectuez des livraisons pour des boutiques e-commerce.
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gestion complète de flotte et codes PIN</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Invitation et liaison d'e-commerçants</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Suivi GPS temps réel et preuve OTP</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="w-full py-3 rounded-xl bg-slate-900 group-hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <span>Continuer comme Agence</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>

          {/* Carte 2 : E-commerçant */}
          <div
            onClick={handleChooseMerchant}
            className="group relative bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-emerald-600 transition-all duration-200 shadow-sm hover:shadow-xl cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition duration-200 shadow-sm">
                <Store className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Portail Gratuit
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  E-commerçant
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Vous vendez en ligne (WhatsApp, Instagram, Shopify, boutique physique) et confiez vos colis à une agence partenaire.
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Inscription libre et choix de votre agence</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Soumission rapide de commandes en 1 clic</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Suivi de vos encaissements cash (COD)</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="w-full py-3 rounded-xl bg-slate-900 group-hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <span>Continuer comme E-commerçant</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full py-4 text-center text-xs text-slate-400">
        Dropia Africa — Plateforme logistique sécurisée en Mode Production
      </footer>
    </div>
  );
};
export default ChoixRoleInscription;
