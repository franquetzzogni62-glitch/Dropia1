import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Smartphone,
  Shield,
  Zap,
  Lock,
  Bike,
  Building2,
  Sparkles,
  MessageSquare,
  Check,
  CheckCircle2,
  Save,
  CheckSquare
} from 'lucide-react';
import type { UserProfile } from '../../types';

interface SettingsViewProps {
  userProfile?: UserProfile | null;
  onRefresh?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ userProfile, onRefresh }) => {
  const [storeName, setStoreName] = useState(userProfile?.nomBoutique || userProfile?.nomAgence || userProfile?.nom || '');
  const [sector, setSector] = useState('Logistique & Distribution');
  const [pickupAddress, setPickupAddress] = useState(userProfile?.ville ? `${userProfile.ville}` : '');
  const [pickupNotes, setPickupNotes] = useState('');
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState(userProfile?.telephone || '');
  const [selectedNetwork, setSelectedNetwork] = useState<'wave' | 'orange' | 'mtn' | 'moov'>('wave');
  const [deliveryMode, setDeliveryMode] = useState<'A' | 'B' | 'C'>('C');
  const [divertSurplus, setDivertSurplus] = useState(true);
  const [otpRequired, setOtpRequired] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Title & Top Save Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Paramètres
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configurez votre profil commercial, vos comptes de reversements Mobile Money et vos règles de dispatch.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          {savedSuccess ? 'Règles Sauvegardées !' : 'Sauvegarder les règles'}
        </button>
      </div>

      {/* SECTION 1: Profil de la Boutique & Encaissement */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Store className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm">
                Profil de la Boutique & Encaissement
              </h2>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Reversement COD
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Objectif : Configurer les paramètres commerciaux de la boutique et le compte Mobile Money qui recevra les fonds collectés par les livreurs en Cash-on-Delivery (COD).
            </p>
          </div>
        </div>

        {/* Identité commerciale */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Identité Commerciale de la Marque
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Nom de la boutique / Marque *
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Ce nom apparaît sur les bordereaux de livraison et les messages WhatsApp automatiques aux clients.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Secteur d'activité *
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
              >
                <option value="Mode & Vêtements">Mode & Vêtements</option>
                <option value="Cosmétique & Beauté">Cosmétique & Beauté</option>
                <option value="High-Tech & Électronique">High-Tech & Électronique</option>
                <option value="Restauration/Alimentation">Restauration/Alimentation</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Quick Category Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { id: 'Mode & Vêtements', icon: '👔' },
              { id: 'Cosmétique & Beauté', icon: '✨' },
              { id: 'High-Tech & Électronique', icon: '📱' },
              { id: 'Restauration/Alimentation', icon: '🍲' },
              { id: 'Autre', icon: '📦' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSector(cat.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
                  sector === cat.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Point de Ramassage */}
        <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Point de Ramassage par Défaut (Pickup Address)
            </span>
            <button className="text-emerald-700 font-medium flex items-center gap-1 text-[11px] hover:underline">
              <MapPin className="w-3.5 h-3.5" />
              Sélectionner un Hub Logistique Dropia
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="ex: Marché Sandaga / Plateau, Dakar"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <button
                onClick={() => alert('Vérification des coordonnées GPS via Google Maps.')}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium shrink-0"
              >
                Vérifier sur Maps
              </button>
            </div>

            <input
              type="text"
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder="Point de repère pour les coursiers (Indispensable pour l'Afrique de l'Ouest) : En face de la station..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-700 focus:outline-none focus:border-emerald-600"
            />

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                GPS: 14.7167, -17.4677
              </span>
              <span className="text-slate-500">Hubs rapides :</span>
              {['Marché Dantokpa', 'Haie Vive', 'Marché Sandaga'].map(h => (
                <button
                  key={h}
                  onClick={() => setPickupAddress(`${h}, Dakar`)}
                  className={`px-2 py-0.5 rounded border transition ${
                    pickupAddress.includes(h)
                      ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compte Mobile Money */}
        <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Compte de Réception Mobile Money (Reversements COD)
            </span>
            <span className="text-slate-500 text-[11px]">Paiement direct après livraison</span>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
            <strong>Fonctionnement du Cash-on-Delivery (COD) :</strong> Vos livreurs ou agences partenaires collectent les espèces auprès des clients à la livraison. Les fonds nets sont automatiquement reversés sur ce compte Mobile Money selon votre cycle configuré.
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Numéro de réception Mobile Money (Pour les reversements) *
            </label>
            <input
              type="text"
              value={mobileMoneyPhone}
              onChange={(e) => setMobileMoneyPhone(e.target.value)}
              placeholder="ex: +221 77 000 00 00"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Format international avec indicatif (ex: +221 pour Sénégal, +225 pour Côte d'Ivoire, +237 pour Cameroun)
            </span>
          </div>

          {/* Operator Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {[
              { id: 'wave', label: 'Wave', badge: '1% de frais • Instantané', desc: 'Disponibilité: Sénégal, Côte d\'Ivoire' },
              { id: 'orange', label: 'Orange', badge: 'Reversement sécurisé • USSD & QR', desc: 'Disponibilité: Sénégal, CI, Cameroun, Mali' },
              { id: 'mtn', label: 'MTN MoMo', badge: 'Leader Afrique Centrale & Ouest', desc: 'Disponibilité: Côte d\'Ivoire, Bénin, Cameroun' },
              { id: 'moov', label: 'Moov', badge: 'Encaissement sans frais cachés', desc: 'Disponibilité: Côte d\'Ivoire, Bénin, Togo' }
            ].map(op => (
              <div
                key={op.id}
                onClick={() => setSelectedNetwork(op.id as any)}
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedNetwork === op.id
                    ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <input
                      type="radio"
                      name="momoNetwork"
                      checked={selectedNetwork === op.id}
                      onChange={() => setSelectedNetwork(op.id as any)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{op.label}</span>
                  </div>
                </div>
                <div className="space-y-1 text-[10px]">
                  <span className="text-emerald-700 font-semibold block">{op.badge}</span>
                  <span className="text-slate-500 block">{op.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
            >
              Enregistrer le Profil Commercial
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Compte Propriétaire & Droits RBAC */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-xs">
            Compte Propriétaire & Droits RBAC
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Titulaire du compte</span>
            <span className="font-bold text-slate-900 block mt-0.5">{userProfile?.nom || 'Utilisateur Dropia'}</span>
            <span className="text-slate-500 text-[11px] font-mono">{userProfile?.email || 'Non renseigné'}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Rôle attribué</span>
            <span className="font-bold text-emerald-700 block mt-0.5">
              {userProfile?.role === 'agence' ? '🛡️ Agence 3PL' : userProfile?.role === 'ecommercant' ? '🛍️ E-commerçant' : '👤 Utilisateur'}
            </span>
            <span className="text-slate-500 text-[11px]">Accès complet : Livraisons, Portefeuille, Paramètres</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Hub Opérationnel</span>
            <span className="font-bold text-slate-900 block mt-0.5">{userProfile?.ville || 'Hub Principal'}</span>
            <span className="text-slate-500 text-[11px]">Devise : FCFA (XOF)</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Forfait & Quotas de l'Agence */}
      <div className="rounded-xl bg-[#0a1124] text-white p-5 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm tracking-tight">Forfait & Quotas de l'Agence</h3>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase border border-indigo-500/30">
                PLAN {(userProfile?.plan || 'Starter').toUpperCase()} • ACTIF
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              5 500 FCFA/mois (800 colis/mois, 5 livreurs, Portail e-com)
            </p>
          </div>

          <button
            onClick={() => alert('Ouverture du gestionnaire des forfaits SaaS.')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
          >
            ⚙ Gérer les forfaits & Upgrades
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Limite Colis / Mois</span>
            <span className="text-base font-black text-white font-mono block mt-1">800 Colis</span>
            <span className="text-[10px] text-emerald-400">0 utilisé ce mois-ci</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Flotte de Livreurs</span>
            <span className="text-base font-black text-white font-mono block mt-1">Jusqu'à 5 livreurs</span>
            <span className="text-[10px] text-slate-400">0 coursier actif</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Support Client SLA</span>
            <span className="text-base font-black text-white block mt-1">Prioritaire</span>
            <span className="text-[10px] text-slate-400">Réponse garantie &lt; 2h</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: API REST & Webhooks (Plan Business) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono font-bold text-sm">&lt;/&gt;</span>
            <h3 className="font-bold text-slate-900 text-xs">
              API REST & Webhooks (Intégration CMS E-commerce)
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase">
            PLAN BUSINESS
          </span>
        </div>

        {/* Lock Overlay Content */}
        <div className="p-8 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold uppercase inline-block">
            FONCTIONNALITÉ PLAN BUSINESS
          </span>

          <h4 className="font-bold text-slate-900 text-sm">
            Accès API REST & Webhooks Dédié
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            L'API REST et les Webhooks temps réel sont réservés aux agences du forfait Business (10 200 FCFA/mois). Connectez vos marchands e-commerce pour recevoir leurs commandes en 1 clic.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-700 pt-2">
            <span className="flex items-center gap-1">✓ Colis illimités inclus</span>
            <span className="flex items-center gap-1">✓ Flotte illimitée avec code PIN</span>
            <span className="flex items-center gap-1">✓ Portail e-commerçants & liens d'invitation</span>
            <span className="flex items-center gap-1">✓ Accès API & Webhooks direct</span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => alert('Passage au Plan Business 10 200 FCFA/mois via SasPay Mobile Money.')}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
            >
              ⚡ Passer au Plan Business (10 200 FCFA/mois) →
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 5: Configuration du Mode de Livraison (Stratégie Logistique) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Bike className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-xs">
              Configuration du Mode de Livraison
            </h3>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
              Stratégie Logistique
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Objectif : Définir la stratégie logistique du marchand (Flotte interne, Agences à la demande ou Mode Hybride).
          </p>
        </div>

        {/* Radio Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div
            onClick={() => setDeliveryMode('A')}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              deliveryMode === 'A' ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <input type="radio" checked={deliveryMode === 'A'} onChange={() => setDeliveryMode('A')} />
              <span>Option A : J'ai mes propres livreurs</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Vos commandes sont assignées exclusivement à vos livreurs internes et vous contrôlez directement leur caisse COD.
            </p>
          </div>

          <div
            onClick={() => setDeliveryMode('B')}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              deliveryMode === 'B' ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <input type="radio" checked={deliveryMode === 'B'} onChange={() => setDeliveryMode('B')} />
              <span>Option B : Je n'ai pas de livreur</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Dropia met à votre disposition un réseau d'agences certifiées avec tarifs fixes par zone. Pas de salaire fixe ni de moto à gérer.
            </p>
          </div>

          <div
            onClick={() => setDeliveryMode('C')}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              deliveryMode === 'C' ? 'border-amber-500 bg-amber-50/30' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <input type="radio" checked={deliveryMode === 'C'} onChange={() => setDeliveryMode('C')} />
              <span>Option C : Mode Hybride</span>
              <span className="text-[9px] px-1 bg-emerald-700 text-white rounded">Recommandé</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Mes livreurs en priorité. Si tous mes livreurs sont occupés, Dropia bascule automatiquement le surplus vers les agences partenaires.
            </p>
          </div>
        </div>

        {/* Paramètres de la flotte interne */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Paramètres de la Flotte Interne (Livreurs Prioritaires)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Nom du livreur #1</label>
              <input
                type="text"
                defaultValue="Moussa Ndiaye"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Numéro WhatsApp du livreur #1</label>
              <input
                type="text"
                defaultValue="+221 77 456 12 34"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Plafond d'encours de caisse autorisé par livreur (COD)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {['30 000 FCFA', '50 000 FCFA (Défaut)', '75 000 FCFA', '100 000 FCFA'].map(p => (
                <button
                  key={p}
                  className={`px-3 py-1.5 rounded-lg border font-medium ${
                    p.includes('50 000')
                      ? 'bg-blue-600 text-white border-blue-600 font-bold'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Zones & Tarifs Partenaires */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Zones de livraison couvertes & tarifs fixes partenaires (En cas de débordement)
            </span>
            <span className="text-emerald-700 font-semibold text-[11px]">Zones stratégiques Dakar (4)</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { zone: 'Dakar Plateau', tarif: '1 500 F', agence: 'Dakar Express 3PL' },
              { zone: 'Almadies', tarif: '2 000 F', agence: 'Sahel Coursiers Pro' },
              { zone: 'Pikine', tarif: '1 500 F', agence: 'ColisRapide Sénégal' },
              { zone: 'Guédiawaye', tarif: '2 500 F', agence: 'ColisRapide Sénégal' }
            ].map((z, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{z.zone}</span>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-emerald-700 font-bold font-mono">{z.tarif}</div>
                <span className="text-[10px] text-slate-400 block">{z.agence}</span>
              </div>
            ))}
          </div>

          {/* Règle de bascule */}
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 space-y-1.5">
            <span className="font-bold block">⚙ Règle de bascule automatique du surplus Dropia :</span>
            <p>Dès qu'une nouvelle commande arrive via WhatsApp ou votre boutique :</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li><strong>Étape 1 :</strong> Assignation instantanée à vos livreurs internes disponibles (si leur caisse &lt; 50 000 FCFA).</li>
              <li><strong>Étape 2 (Débordement) :</strong> Si tous vos livreurs internes sont déjà en course ou que le délai dépasse 15 min, Dropia dispatche automatiquement vers l'agence partenaire de la zone.</li>
            </ul>
            <div className="flex items-center gap-2 pt-1 font-semibold text-slate-900">
              <input
                type="checkbox"
                checked={divertSurplus}
                onChange={(e) => setDivertSurplus(e.target.checked)}
                className="text-emerald-600 rounded"
              />
              <span>Activer le basculement automatique du surplus sans intervention manuelle</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
        >
          Valider la Stratégie Logistique
        </button>
      </div>

      {/* SECTION 6: Connexion WhatsApp Business API */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-xs">
              Connexion de l'API WhatsApp Business
            </h3>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
              Connexion Requise
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Objectif : Connecter le numéro WhatsApp de la boutique pour capturer automatiquement les commandes et envoyer les notifications de suivi aux clients.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Connexion automatisée Meta Cloud API
          </div>

          <p className="text-slate-600 leading-relaxed">
            Cliquez sur le bouton ci-dessous pour ouvrir la fenêtre pop-up sécurisée Meta Embedded Signup et connecter votre numéro WhatsApp Business en quelques secondes.
          </p>

          <button
            onClick={() => alert('Ouverture de la fenêtre d\'autorisation Meta / WhatsApp Cloud API.')}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
          >
            <MessageSquare className="w-4 h-4" />
            Se connecter avec Facebook / WhatsApp Business
          </button>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
            <span>✓ Validation Meta WABA automatique</span>
            <span>✓ Webhook Dropia lié en temps réel</span>
            <span>✓ Chiffrement bout-en-bout préservé</span>
          </div>
        </div>

        {/* Anti-Fraude & Preuve de Livraison OTP */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Validation Anti-Fraude & Preuve de Livraison
          </span>
          <div className="flex items-center justify-between">
            <span className="text-slate-800 font-medium">
              Code OTP obligatoire à la remise du colis
            </span>
            <input
              type="checkbox"
              checked={otpRequired}
              onChange={(e) => setOtpRequired(e.target.checked)}
              className="text-emerald-600 rounded"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Le client final reçoit un code à 4 chiffres sur WhatsApp pour confirmer la bonne réception avant encaissement.
          </p>
        </div>
      </div>
    </div>
  );
};
