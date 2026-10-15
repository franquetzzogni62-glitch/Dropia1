import React, { useState, useEffect } from 'react';
import {
  Store,
  UserPlus,
  Copy,
  Check,
  Search,
  ExternalLink,
  MessageCircle,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  Phone,
  Mail,
  MapPin,
  Package
} from 'lucide-react';
import { DropiaDatabaseService } from '../services/dropiaService';
import type { Ecommercant, UserProfile } from '../types';

interface EcommercantsProps {
  currentAgencyId?: string;
  userProfile?: UserProfile | null;
}

export const Ecommercants: React.FC<EcommercantsProps> = ({
  currentAgencyId,
  userProfile
}) => {
  // Déterminer l'ID de l'agence courante
  const agencyId = currentAgencyId || userProfile?.uid || 'agence_principale';
  const agencyName = userProfile?.nomAgence || userProfile?.nom || 'Notre Agence Dropia';

  // Onglet courant : "Actifs" ou "En attente"
  const [activeTab, setActiveTab] = useState<'actifs' | 'en_attente'>('actifs');

  // Données des e-commerçants
  const [ecommercants, setEcommercants] = useState<Ecommercant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [copiedLink, setCopiedCopied] = useState<boolean>(false);

  const [selectedMerchant, setSelectedMerchant] = useState<Ecommercant | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);

  // Formulaire d'édition
  const [editForm, setEditForm] = useState<{
    contact: string;
    telephone: string;
    statut: 'actif' | 'en_attente' | 'refuse';
  }>({
    contact: '',
    telephone: '',
    statut: 'actif'
  });

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Souscription temps réel aux e-commerçants de cette agence
  useEffect(() => {
    setLoading(true);
    const unsubscribe = DropiaDatabaseService.subscribeEcommercantsByAgence(
      agencyId,
      (items) => {
        setEcommercants(items || []);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [agencyId]);

  // Filtrage selon l'onglet et la recherche
  const filteredList = ecommercants.filter((m) => {
    const matchesTab =
      activeTab === 'actifs' ? m.statut === 'actif' : m.statut === 'en_attente';

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.nomBoutique.toLowerCase().includes(q) ||
      (m.contact && m.contact.toLowerCase().includes(q)) ||
      m.telephone.includes(q) ||
      m.email.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const countActifs = ecommercants.filter((m) => m.statut === 'actif').length;
  const countEnAttente = ecommercants.filter((m) => m.statut === 'en_attente').length;

  // Lien d'invitation généré pour cette agence
  const inviteUrl = `${window.location.origin}/register-ecommercant/${agencyId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCopied(true);
    showToast('Lien copié dans le presse-papier !');
    setTimeout(() => setCopiedCopied(false), 2500);
  };

  // Actions
  const handleOpenView = (m: Ecommercant) => {
    setSelectedMerchant(m);
    setViewModalOpen(true);
  };

  const handleOpenEdit = (m: Ecommercant) => {
    setSelectedMerchant(m);
    setEditForm({
      contact: m.contact || m.nomBoutique,
      telephone: m.telephone,
      statut: m.statut
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant) return;

    try {
      await DropiaDatabaseService.updateEcommercantStatut(selectedMerchant.id, editForm.statut);
      showToast(`Statut de ${selectedMerchant.nomBoutique} mis à jour avec succès !`);
      setEditModalOpen(false);
    } catch {
      showToast('Erreur lors de la mise à jour.');
    }
  };

  const handleOpenDelete = (m: Ecommercant) => {
    setSelectedMerchant(m);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmRetirer = async () => {
    if (!selectedMerchant) return;
    try {
      await DropiaDatabaseService.retirerEcommercant(selectedMerchant.id);
      showToast(`E-commerçant ${selectedMerchant.nomBoutique} retiré de votre agence.`);
      setDeleteConfirmOpen(false);
    } catch {
      showToast('Erreur lors du retrait.');
    }
  };

  const handleApprove = async (m: Ecommercant) => {
    try {
      await DropiaDatabaseService.updateEcommercantStatut(m.id, 'actif');
      showToast(`Boutique ${m.nomBoutique} approuvée et désormais active !`);
    } catch {
      showToast('Erreur lors de l\'approbation.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500 text-emerald-400 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              E-commerçants Partenaires
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              {ecommercants.length} enregistrés
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez vos boutiques e-commerce clientes, vos invitations et les validations d'accès.
          </p>
        </div>

        {/* Bouton Inviter un e-commerçant */}
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm shadow-emerald-700/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Inviter un e-commerçant</span>
        </button>
      </div>

      {/* Navigation Onglets : Actifs vs En attente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('actifs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'actifs'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Actifs</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'actifs' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {countActifs}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('en_attente')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'en_attente'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>En attente de validation</span>
            {countEnAttente > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'en_attente' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800 font-bold'
                }`}
              >
                {countEnAttente}
              </span>
            )}
          </button>
        </div>

        {/* Barre de Recherche */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher boutique, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 bg-white"
          />
        </div>
      </div>

      {/* Table des E-commerçants */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Boutique & Responsable</th>
                <th className="py-3 px-4">Contact (WhatsApp)</th>
                <th className="py-3 px-4">Ville</th>
                <th className="py-3 px-4">Colis Envoyés</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 animate-pulse">
                    Chargement des e-commerçants partenaires...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {activeTab === 'actifs'
                          ? 'Aucun e-commerçant actif pour le moment'
                          : 'Aucune demande en attente'}
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                        {activeTab === 'actifs'
                          ? 'Partagez votre lien d\'invitation pour que vos e-commerçants se connectent directement à votre agence.'
                          : 'Toutes les demandes de liaison de boutiques sont traitées.'}
                      </p>
                    </div>
                    {activeTab === 'actifs' && (
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Inviter mon premier commerçant</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredList.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200">
                          {m.nomBoutique.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {m.nomBoutique}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {m.contact || 'Gérant de boutique'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <a
                          href={`https://wa.me/${m.telephone.replace(/\+/g, '').replace(/\s+/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{m.telephone}</span>
                        </a>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {m.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {m.ville || 'Dakar'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {m.commandesTotales || 0} colis
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {m.statut === 'actif' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Actif
                        </span>
                      ) : m.statut === 'en_attente' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          En attente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Refusé
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {m.statut === 'en_attente' && (
                          <button
                            onClick={() => handleApprove(m)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                            title="Approuver le commerçant"
                          >
                            <Check className="w-3 h-3" />
                            <span>Valider</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenView(m)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                          title="Voir les détails"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenDelete(m)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-400 transition"
                          title="Retirer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1 : INVITER UN E-COMMERÇANT (Génère lien + partage WhatsApp)        */}
      {/* ========================================================================= */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-xs text-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Inviter un e-commerçant
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    Liaison directe à {agencyName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Transmettez ce lien unique à vos boutiques clientes. En s'inscrivant via ce lien, leur compte sera automatiquement connecté à votre flotte de livraison.
            </p>

            {/* Lien d'invitation avec bouton Copier */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">
                Lien d'inscription directe :
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
            </div>

            {/* Code d'invitation manuel */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Code d'invitation agence :
                </span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  {agencyId}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                À saisir en inscription libre
              </span>
            </div>

            {/* Partage WhatsApp en 1-clic */}
            <a
              href={`https://wa.me/?text=Bonjour%20!%20Rejoignez%20notre%20agence%20de%20livraison%20${encodeURIComponent(
                agencyName
              )}%20sur%20Dropia%20pour%20expédier%20vos%20colis%20en%20temps%20réel%20:%20${encodeURIComponent(
                inviteUrl
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Envoyer l'invitation sur WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2 : VOIR LES DÉTAILS DE L'E-COMMERÇANT                              */}
      {/* ========================================================================= */}
      {viewModalOpen && selectedMerchant && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs text-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedMerchant.nomBoutique}
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    Fiche e-commerçant
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Responsable</span>
                  <strong className="text-slate-900">{selectedMerchant.contact || 'Non renseigné'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Ville</span>
                  <strong className="text-slate-900">{selectedMerchant.ville || 'Dakar'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Téléphone</span>
                  <strong className="text-slate-900 font-mono">{selectedMerchant.telephone}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
                  <strong className="text-slate-900 font-mono truncate block">{selectedMerchant.email}</strong>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Activité totale</span>
                  <strong className="text-sm font-black text-emerald-950 font-mono">
                    {selectedMerchant.commandesTotales || 0} colis confiés
                  </strong>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold capitalize">
                  {selectedMerchant.statut}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <a
                href={`https://wa.me/${selectedMerchant.telephone.replace(/\+/g, '').replace(/\s+/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Contacter WhatsApp</span>
              </a>
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3 : MODIFIER LE STATUT DE L'E-COMMERÇANT                            */}
      {/* ========================================================================= */}
      {editModalOpen && selectedMerchant && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs text-slate-800 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Modifier {selectedMerchant.nomBoutique}
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Statut de la relation commerciale :
              </label>
              <select
                value={editForm.statut}
                onChange={(e) =>
                  setEditForm({ ...editForm, statut: e.target.value as any })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="actif">Actif (autorisé à expédier des colis)</option>
                <option value="en_attente">En attente (sous examen)</option>
                <option value="refuse">Refusé (accès suspendu)</option>
              </select>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4 : RETIRER UN E-COMMERÇANT                                         */}
      {/* ========================================================================= */}
      {deleteConfirmOpen && selectedMerchant && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-rose-200 text-xs text-slate-800 animate-in fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
                ⚠️
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Retirer {selectedMerchant.nomBoutique} ?
              </h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Cette boutique ne pourra plus soumettre de colis à votre agence sans nouvelle invitation ou validation.
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmRetirer}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs"
              >
                Confirmer le retrait
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Ecommercants;
