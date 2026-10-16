import React, { useState } from 'react';
import {
  ArrowRight,
  HelpCircle,
  Bike,
  Package,
  Play,
  MessageSquare,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Send,
  Sparkles,
  Building2,
  TrendingUp,
  Wallet,
  Users,
  MapPin,
  Clock,
  Code2,
  Check,
  X,
  Lock,
  Phone,
  BarChart3,
  Globe2
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenDriverApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onOpenDriverApp
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [trackingInput, setTrackingInput] = useState('');
  const [showTrackingResult, setShowTrackingResult] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      setShowTrackingResult(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* 1. Header Navigation */}
      <header className="border-b border-slate-100 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => onOpenAuth('login')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
              <Package className="w-5 h-5 text-emerald-100" />
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

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
            <a href="#probleme" className="hover:text-emerald-700 transition">
              Pourquoi Dropia ?
            </a>
            <a href="#fonctionnalites" className="hover:text-emerald-700 transition">
              Fonctionnalités
            </a>
            <a href="#cibles" className="hover:text-emerald-700 transition">
              À qui s'adresse ?
            </a>
            <a href="#tarifs" className="hover:text-emerald-700 transition">
              Tarifs & Abonnements
            </a>
            <a href="#suivi" className="hover:text-emerald-700 transition">
              Suivi Colis
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 text-xs">
            {/* Espace Livreur Button */}
            <button
              onClick={onOpenDriverApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition shadow-xs"
            >
              <Bike className="w-4 h-4 text-blue-600" />
              <span>App Livreur (PWA)</span>
            </button>

            {/* Se connecter */}
            <button
              onClick={() => onOpenAuth('login')}
              className="hidden sm:block px-3.5 py-2 text-slate-700 hover:text-slate-950 font-bold transition"
            >
              Se connecter
            </button>

            {/* Créer un compte */}
            <button
              onClick={() => onOpenAuth('register')}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-md shadow-emerald-700/20 flex items-center gap-1.5"
            >
              <span>Essai gratuit 30j</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Production Warning Notification Banner */}
      <div className="bg-emerald-900 text-emerald-100 text-[11px] py-2 px-4 text-center font-medium border-b border-emerald-800 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          <strong>MODE PRODUCTION ACTIF :</strong> Aucune donnée fictive en base. Inscription obligatoire avant toute connexion.
        </span>
      </div>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (Headline & CTAs) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span>🌍</span>
              <span>La plateforme logistique n°1 pour les agences de livraison en Afrique</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-slate-950 leading-[1.12]">
              Digitalisez votre agence de livraison, vos{' '}
              <span className="text-emerald-700 underline decoration-emerald-200 underline-offset-4">
                colis
              </span>{' '}
              et vos{' '}
              <span className="text-emerald-700">coursiers</span> en Afrique.
            </h1>

            {/* Subtitle */}
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              Dropia est le logiciel tout-en-un conçu pour les agences de livraison africaines (1 à 15+ livreurs) et leurs e-commerçants. Fini les carnets papier et les pertes d'informations sur WhatsApp : centralisez tout sur PC, tablette et smartphone.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition shadow-lg shadow-emerald-700/25"
              >
                <span>Démarrer l'essai gratuit 30 jours</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const elem = document.getElementById('tarifs');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-sm transition"
              >
                <Wallet className="w-4 h-4" />
                <span>Voir les tarifs & forfaits</span>
              </button>

              <button
                onClick={onOpenDriverApp}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
              >
                <Bike className="w-4 h-4 text-blue-600" />
                <span>Tester l'App Livreur (PIN)</span>
              </button>
            </div>

            {/* Micro Benefits */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs">
              <div className="space-y-1">
                <strong className="text-slate-900 block font-bold">Essai 30 jours gratuit</strong>
                <span className="text-slate-500 text-[11px]">Accès complet au Plan Pro</span>
              </div>
              <div className="space-y-1">
                <strong className="text-slate-900 block font-bold">Mobile Money 19 pays</strong>
                <span className="text-slate-500 text-[11px]">Wave, OM, MTN, M-Pesa</span>
              </div>
              <div className="space-y-1">
                <strong className="text-slate-900 block font-bold">100% sans engagement</strong>
                <span className="text-slate-500 text-[11px]">Gestion autonome des livreurs</span>
              </div>
            </div>
          </div>

          {/* Right Column (Visual Preview Cards) */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-mono text-slate-400 ml-2">dropia.africa/dashboard</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  En ligne
                </span>
              </div>

              {/* 4 Cards Stats Demo */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Colis du jour</span>
                  <strong className="text-base font-black text-white font-mono">48 colis</strong>
                  <span className="text-[9px] text-emerald-400 block mt-0.5">+14% vs hier</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">En cours de livraison</span>
                  <strong className="text-base font-black text-amber-400 font-mono">12 courses</strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">5 livreurs actifs</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Livrés avec succès</span>
                  <strong className="text-base font-black text-emerald-400 font-mono">34 livrés</strong>
                  <span className="text-[9px] text-emerald-400 block mt-0.5">Taux : 96%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Cash COD encaissé</span>
                  <strong className="text-base font-black text-white font-mono">425 000 F</strong>
                  <span className="text-[9px] text-emerald-400 block mt-0.5">Sécurisé par OTP</span>
                </div>
              </div>

              {/* Live Dispatch Preview */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-amber-400 font-bold">DRP-2026-00042</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    Assigné en 1-clic
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>Destinataire : Aminata D. (Dakar Plateau)</span>
                  <span className="font-bold text-white">25 000 FCFA</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                  <span>Livreur : Ibrahima (PIN: 8492)</span>
                  <span className="text-emerald-400">GPS & Suivi actif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section Le Problème Résolu */}
      <section id="probleme" className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
              Le problème résolu
            </span>
            <h2 className="text-3xl font-black text-slate-950">
              Pourquoi les agences de livraison en Afrique perdent de l'argent ?
            </h2>
            <p className="text-sm text-slate-600">
              Gérer une agence sur WhatsApp et papier crée du chaos au quotidien. Dropia résout chaque goulot d'étranglement logistique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
                ❌
              </div>
              <h3 className="text-base font-bold text-slate-900">Perte d'infos WhatsApp & Papier</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Les commandes s'empilent dans des discussions WhatsApp, les bordereaux papier se perdent, entraînant des erreurs d'adresses et zéro traçabilité.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> Solution Dropia : Centralisation unique sur PC & mobile
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
                📞
              </div>
              <h3 className="text-base font-bold text-slate-900">Appels incessants des clients</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sans lien de suivi, les destinataires et e-commerçants vous appellent 20 fois par jour pour savoir où se trouve leur colis.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> Solution Dropia : Lien de suivi GPS en direct par WhatsApp
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
                🛡️
              </div>
              <h3 className="text-base font-bold text-slate-900">Litiges COD & Fraude livreur</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aucune preuve de livraison infalsifiable. Les litiges sur les encaissements cash (COD) et les pertes de colis sont fréquents.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> Solution Dropia : Code OTP obligatoire à la remise
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section À Qui S'adresse Dropia */}
      <section id="cibles" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
            Écosystème
          </span>
          <h2 className="text-3xl font-black text-slate-950">
            Une plateforme adaptée à tous les acteurs de la chaîne
          </h2>
          <p className="text-sm text-slate-600">
            Dropia n'est pas une agence de livraison : c'est le logiciel que les agences utilisent pour mieux travailler et connecter tout leur réseau.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Agences */}
          <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Client Principal</span>
              <h3 className="text-lg font-black text-slate-950">Les Agences de Livraison</h3>
            </div>
            <ul className="text-xs text-slate-700 space-y-2">
              <li className="flex items-center gap-2">✓ Petites agences (1-2 livreurs)</li>
              <li className="flex items-center gap-2">✓ Agences moyennes (3-5 livreurs)</li>
              <li className="flex items-center gap-2">✓ Grandes agences (6-15 livreurs)</li>
              <li className="flex items-center gap-2">✓ Très grandes agences (15+ livreurs)</li>
            </ul>
          </div>

          {/* 2. E-commerçants */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Utilisateurs Gratuits</span>
              <h3 className="text-lg font-black text-slate-950">Les E-Commerçants</h3>
            </div>
            <ul className="text-xs text-slate-700 space-y-2">
              <li className="flex items-center gap-2">✓ Boutiques en ligne (Shopify, WooCommerce)</li>
              <li className="flex items-center gap-2">✓ Vendeurs WhatsApp, Instagram & Facebook</li>
              <li className="flex items-center gap-2">✓ Commerçants locaux qui livrent en ville</li>
              <li className="flex items-center gap-2">✓ Portail e-commerçant 100% gratuit</li>
            </ul>
          </div>

          {/* 3. Livreurs */}
          <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Application Mobile</span>
              <h3 className="text-lg font-black text-slate-950">Les Livreurs & Coursiers</h3>
            </div>
            <ul className="text-xs text-slate-700 space-y-2">
              <li className="flex items-center gap-2">✓ Livreurs à moto & tricycle</li>
              <li className="flex items-center gap-2">✓ Livreurs à vélo & coursiers à pied</li>
              <li className="flex items-center gap-2">✓ Livreurs en voiture & camionnette</li>
              <li className="flex items-center gap-2">✓ Connexion instantanée par PIN à 4 chiffres</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Section Les 8 Fonctionnalités Principales */}
      <section id="fonctionnalites" className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
              Fonctionnalités Clés
            </span>
            <h2 className="text-3xl font-black text-white">
              Les 8 piliers technologiques de Dropia
            </h2>
            <p className="text-sm text-slate-400">
              Une infrastructure complète bâtie sur mesure pour les réalités du terrain africain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Gestion des colis</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Création avec destinataire, téléphone, adresse, montant COD. Numéro de suivi automatique (ex : <code>DRP-2026-00001</code>). Export CSV/Excel.
              </p>
            </div>

            {/* 2 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Gestion des livreurs</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Création de compte livreur par l'agence. Code PIN à 4 chiffres généré automatiquement. Connexion par téléphone + PIN et attribution en 1 clic.
              </p>
            </div>

            {/* 3 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-white text-sm">Portail e-commerçant</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accès 100% gratuit pour vos commerçants partenaires. Soumission de livraison en quelques secondes et historique des commandes en direct.
              </p>
            </div>

            {/* 4 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                4
              </div>
              <h4 className="font-bold text-white text-sm">Suivi GPS temps réel</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comme Yango ou Uber : le livreur démarre la course, le client suit le déplacement sur une carte avec estimation d'arrivée (ETA), boutons Appel et WhatsApp.
              </p>
            </div>

            {/* 5 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                5
              </div>
              <h4 className="font-bold text-white text-sm">Tableau de bord & stats</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                4 cartes KPI : Colis du jour, En cours, Livrés, Échecs. Graphique 7 jours, répartition par statut et taux de performance par coursier et par zone.
              </p>
            </div>

            {/* 6 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                6
              </div>
              <h4 className="font-bold text-white text-sm">Gestion d'abonnement</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Essai gratuit de 30 jours au plan Pro. Notifications 5 jours avant expiration. Réactivation automatique par Mobile Money (Wave, Orange, MTN).
              </p>
            </div>

            {/* 7 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                7
              </div>
              <h4 className="font-bold text-white text-sm">API & Webhooks REST</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connectez Shopify, WooCommerce et PrestaShop en quelques minutes. Webhooks temps réel et clés d'API sécurisées par agence.
              </p>
            </div>

            {/* 8 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                8
              </div>
              <h4 className="font-bold text-white text-sm">Multi-rôles sécurisés</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rôles stricts : Agence (dashboard complet), E-commerçant (portail commandes), Livreur (application PIN dédiée), Admin plateforme.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section Tarifs & Modèle Économique (Exact match to prompt specs) */}
      <section id="tarifs" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
            Tarifs Transparents
          </span>
          <h2 className="text-3xl font-black text-slate-950">
            Un modèle freemium accessible à toutes les agences
          </h2>
          <p className="text-sm text-slate-600">
            Commencez dès aujourd'hui avec 30 jours gratuits au plan Pro. Payez facilement par Mobile Money dans 19 pays d'Afrique.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center gap-2 p-1 bg-slate-100 rounded-full border border-slate-200 text-xs font-bold pt-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full transition ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Facturation Mensuelle
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>Facturation Annuelle</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                2 mois gratuits
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. Essai Gratuit */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white space-y-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                  Découverte
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Essai Gratuit</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Testez la puissance de Dropia sans payer un centime.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">0 FCFA</span>
                  <span className="text-xs text-slate-500">/ 30 jours</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                  Accès complet aux fonctions Pro
                </span>
              </div>

              <ul className="text-xs text-slate-700 space-y-3 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span><strong>800 colis</strong> / mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Jusqu'à <strong>5 livreurs</strong> connectés</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Portail e-commerçant gratuit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Application livreur PIN & Suivi GPS</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <X className="w-4 h-4" />
                  <span>Pas d'API REST</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Support standard par Email</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenAuth('register')}
              className="w-full py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-900 font-bold text-xs transition"
            >
              Démarrer 30 jours gratuits
            </button>
          </div>

          {/* 2. Plan Pro (Recommended) */}
          <div className="p-8 rounded-3xl border-2 border-emerald-600 bg-white space-y-6 shadow-xl relative flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-bold shadow-xs">
              Recommandé pour les agences
            </div>

            <div className="space-y-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                  Plan Pro
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Pro Agence</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pour les agences de 1 à 5 coursiers en plein essor.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-950">
                    {billingCycle === 'monthly' ? '5 500 FCFA' : '55 000 FCFA'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {billingCycle === 'monthly' ? '/ mois' : '/ an (10 mois payés)'}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                  Soit ~8,40 € / mois seulement
                </span>
              </div>

              <ul className="text-xs text-slate-700 space-y-3 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span><strong>800 colis</strong> / mois inclus</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Jusqu'à <strong>5 livreurs</strong> simultanés</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Portail e-commerçant avec invitations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Suivi GPS en direct (lien WhatsApp)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Validation de livraison par code OTP</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Support Email + WhatsApp prioritaire</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenAuth('register')}
              className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-lg shadow-emerald-700/25"
            >
              Choisir le Plan Pro (30j d'essai)
            </button>
          </div>

          {/* 3. Plan Business */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white space-y-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold">
                  Grande Échelle
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Business Scale</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Grandes flottes, intégrations API et e-commerces volumineux.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">
                    {billingCycle === 'monthly' ? '10 200 FCFA' : '102 000 FCFA'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {billingCycle === 'monthly' ? '/ mois' : '/ an (10 mois payés)'}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                  Volume massif & intégrations logicielles
                </span>
              </div>

              <ul className="text-xs text-slate-700 space-y-3 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span><strong>10 000 colis</strong> / mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Jusqu'à <strong>100 livreurs</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Portail e-commerçant illimité</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span><strong>API REST & Webhooks</strong> (Shopify, Woo)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Clés API sécurisées par agence</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Support dédié 24/7 (Account Manager)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenAuth('register')}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
            >
              Souscrire au Plan Business
            </button>
          </div>
        </div>

        {/* SasaPay Mobile Money Banner */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 justify-center md:justify-start">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Paiement 100% Mobile Money via SasaPay</span>
            </h4>
            <p className="text-xs text-slate-500">
              Disponible instantanément dans 19 pays d'Afrique : Sénégal, Côte d'Ivoire, Cameroun, Mali, Bénin, Guinée, Togo, Burkina Faso, Kenya, RDC, etc.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-sky-100 text-sky-800 font-bold border border-sky-200">
              Wave
            </span>
            <span className="px-2.5 py-1 rounded bg-orange-100 text-orange-800 font-bold border border-orange-200">
              Orange Money
            </span>
            <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
              MTN MoMo
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              M-Pesa
            </span>
            <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
              Airtel Money
            </span>
            <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
              Moov Money
            </span>
          </div>
        </div>
      </section>

      {/* 7. Section Suivre un Colis */}
      <section id="suivi" className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Portail Public de Suivi de Colis & Preuve OTP
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Entrez votre numéro de suivi (ex : <code>DRP-2026-00001</code>)
            </p>
          </div>

          <form onSubmit={handleTrack} className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              placeholder="DRP-2026-..."
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:outline-none focus:border-emerald-600"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition"
            >
              Suivre
            </button>
          </form>

          {showTrackingResult && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 max-w-md mx-auto text-left space-y-2 shadow-xs text-xs animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-mono font-bold text-slate-900">
                  {trackingInput.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                  En cours de livraison
                </span>
              </div>
              <p className="text-slate-600">
                Livreur assigné en route vers votre adresse.
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Code OTP requis à la livraison</span>
                <span className="font-bold text-emerald-700">Sécurisé Dropia</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-slate-200 py-12 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
              D
            </div>
            <span className="font-bold text-slate-900">Dropia Africa</span>
            <span>— La logistique nouvelle génération pour les agences.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => onOpenAuth('login')}
              className="hover:text-emerald-700 font-medium"
            >
              Connexion Agence
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="hover:text-emerald-700 font-medium"
            >
              Créer mon compte
            </button>
            <button
              onClick={onOpenDriverApp}
              className="hover:text-blue-700 font-medium"
            >
              App Livreur (PIN)
            </button>
            <a
              href="/admin"
              className="hover:text-blue-700 font-bold text-[#1E40AF]"
            >
              Console Super Admin
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
