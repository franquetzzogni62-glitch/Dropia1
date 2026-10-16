import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DropiaDatabaseService } from '../services/dropiaService';
import { 
  CreditCard, Smartphone, Check, X, Loader, 
  ArrowLeft, Shield, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import type { TransactionFinanciere } from '../types';

const OPERATEURS = [
  { id: 'orange', nom: 'Orange Money', icone: '🟠' },
  { id: 'mtn', nom: 'MTN Mobile Money', icone: '🟡' },
  { id: 'wave', nom: 'Wave', icone: '🔵' },
  { id: 'moov', nom: 'Moov Money', icone: '🔵' },
  { id: 'airtel', nom: 'Airtel Money', icone: '🔴' },
  { id: 'mpesa', nom: 'M-Pesa', icone: '🟢' },
];

export default function PaiementPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();

  const planId = searchParams.get('plan') || 'pro';
  const cycle = searchParams.get('cycle') || 'mensuel';
  const type = searchParams.get('type') || 'abonnement';
  const montant = parseInt(searchParams.get('montant') || '5500', 10);

  const [operateur, setOperateur] = useState('wave');
  const [telephone, setTelephone] = useState(profile?.telephone || '');
  const [loading, setLoading] = useState(false);
  const [etape, setEtape] = useState<'formulaire' | 'attente' | 'succes' | 'erreur'>('formulaire');
  const [erreur, setErreur] = useState('');
  const [reference, setReference] = useState('');

  const handlePayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');

    if (!operateur) {
      setErreur('Veuillez sélectionner un opérateur Mobile Money.');
      return;
    }

    if (!telephone.trim()) {
      setErreur('Veuillez renseigner un numéro de téléphone valide.');
      return;
    }

    setLoading(true);

    try {
      const generatedRef = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setReference(generatedRef);

      // Simulation du délai d'envoi du push USSD sur le téléphone
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEtape('attente');

      // Simulation de la validation du code PIN par l'utilisateur sur son mobile
      setTimeout(async () => {
        try {
          // Enregistrer la transaction
          const tx: Omit<TransactionFinanciere, 'id'> = {
            type: (type === 'recharge' ? 'rechargement' : 'frais_livraison') as any,
            montant,
            devise: 'XOF',
            destinataireType: profile?.role === 'ecommercant' ? 'ecommercant' : 'agence',
            destinataireId: profile?.uid || 'user_anon',
            referencePaiement: generatedRef,
            date: new Date().toISOString(),
            statut: 'complete'
          };
          await DropiaDatabaseService.creerTransaction(tx).catch(() => {});

          // Mettre à jour le solde ou le plan de l'utilisateur
          if (profile) {
            if (type === 'recharge') {
              const newBalance = (profile.soldeWallet || 0) + montant;
              await updateProfile({ soldeWallet: newBalance });
            } else if (type === 'abonnement') {
              const validPlan = (planId === 'business' ? 'business' : planId === 'starter' ? 'starter' : 'pro');
              await updateProfile({
                plan: validPlan,
                planStatut: 'actif'
              });
            }
          }

          setEtape('succes');
        } catch (err: any) {
          setErreur(err.message || 'Erreur lors de la confirmation.');
          setEtape('erreur');
        }
      }, 3000);
    } catch (err: any) {
      setErreur(err.message || 'Erreur lors du paiement');
      setEtape('erreur');
    } finally {
      setLoading(false);
    }
  };

  if (etape === 'attente') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <Loader className="w-12 h-12 text-[#1E40AF] mx-auto mb-4 animate-spin" strokeWidth={1.75} />
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">
            En attente de confirmation
          </h2>
          <p className="text-sm text-[#64748B] mb-4">
            Vérifiez votre téléphone <strong>{telephone}</strong> et confirmez le paiement de{' '}
            <strong className="text-[#0F172A]">{montant.toLocaleString('fr-FR')} FCFA</strong>.
          </p>
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-md p-3 text-xs text-[#92400E] mb-6 text-left">
            Une demande d'autorisation a été envoyée sur votre mobile via <strong>{OPERATEURS.find(o => o.id === operateur)?.nom || 'Mobile Money'}</strong>. Saisissez votre code PIN secret sur votre combiné pour valider.
          </div>
          <p className="text-xs text-[#94A3B8]">
            Référence transaction : <code className="font-mono text-[#0F172A]">{reference}</code>
          </p>
        </div>
      </div>
    );
  }

  if (etape === 'succes') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#A7F3D0]">
            <Check className="w-8 h-8 text-[#059669]" strokeWidth={1.75} />
          </div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">
            Paiement réussi !
          </h2>
          <p className="text-sm text-[#64748B] mb-2">
            Votre {type === 'abonnement' ? 'abonnement' : 'portefeuille'} a été mis à jour avec succès.
          </p>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 text-xs text-[#475569] mb-6 text-left space-y-1">
            <div className="flex justify-between">
              <span>Montant payé :</span>
              <strong className="text-[#0F172A] font-mono">{montant.toLocaleString('fr-FR')} FCFA</strong>
            </div>
            <div className="flex justify-between">
              <span>Opérateur :</span>
              <span className="font-medium text-[#0F172A]">{OPERATEURS.find(o => o.id === operateur)?.nom}</span>
            </div>
            <div className="flex justify-between">
              <span>Référence :</span>
              <code className="font-mono text-[#1E40AF]">{reference}</code>
            </div>
          </div>
          <button
            onClick={() => {
              if (profile?.role === 'ecommercant') {
                navigate('/portail');
              } else {
                navigate('/dashboard');
              }
            }}
            className="w-full bg-[#1E40AF] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] transition shadow-xs"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  if (etape === 'erreur') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FECACA]">
            <X className="w-8 h-8 text-[#DC2626]" strokeWidth={1.75} />
          </div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">
            Échec du paiement
          </h2>
          <p className="text-sm text-[#DC2626] mb-6">
            {erreur || 'Le paiement n\'a pas pu être validé.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setEtape('formulaire')}
              className="flex-1 bg-[#1E40AF] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] transition"
            >
              Réessayer
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 border border-[#E2E8F0] text-[#475569] py-2.5 rounded-lg text-sm font-semibold hover:bg-[#F8FAFC] transition"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Retour
        </button>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 md:p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#DBEAFE]">
              <CreditCard className="w-6 h-6 text-[#1E40AF]" strokeWidth={1.75} />
            </div>
            <h1 className="text-xl font-semibold text-[#0F172A] mb-1">
              Paiement sécurisé
            </h1>
            <p className="text-sm text-[#64748B]">
              {type === 'abonnement' 
                ? `Formule ${planId === 'pro' ? 'Pro' : planId === 'business' ? 'Business Scale' : 'Starter'} — ${cycle === 'annuel' ? 'Annuel' : 'Mensuel'}`
                : 'Rechargement du portefeuille'
              }
            </p>
          </div>

          {/* Montant */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Montant à régler</span>
              <span className="text-2xl font-bold text-[#0F172A] font-mono">
                {montant.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {erreur && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{erreur}</span>
            </div>
          )}

          <form onSubmit={handlePayer} className="space-y-4">
            {/* Opérateur */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Choisissez votre opérateur Mobile Money
              </label>
              <div className="grid grid-cols-2 gap-2">
                {OPERATEURS.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperateur(op.id)}
                    className={`p-3 border rounded-lg text-left transition flex items-center gap-2.5 ${
                      operateur === op.id
                        ? 'border-[#1E40AF] bg-[#EFF6FF] shadow-xs'
                        : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="text-xl">{op.icone}</span>
                    <span className="text-xs font-semibold text-[#0F172A]">{op.nom}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">
                Numéro de téléphone du compte
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" strokeWidth={1.75} />
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+225 07 XX XX XX XX / +221 77 XXX XX XX"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] font-mono focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF]"
                  required
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Un message push USSD s'affichera sur ce numéro pour valider le débit sécurisé.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !operateur || !telephone.trim()}
              className="w-full bg-[#1E40AF] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                  <span>Initialisation du paiement...</span>
                </>
              ) : (
                `Confirmer et Payer ${montant.toLocaleString('fr-FR')} FCFA`
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#64748B] pt-4 border-t border-[#F1F5F9]">
            <Shield className="w-4 h-4 text-[#059669]" strokeWidth={1.75} />
            Paiement 100% sécurisé sans frais cachés
          </div>
        </div>
      </div>
    </div>
  );
}
