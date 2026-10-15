import React, { useState } from 'react';
import {
  Smartphone,
  KeyRound,
  Truck,
  CheckCircle,
  Phone,
  MapPin,
  DollarSign,
  AlertTriangle,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Send
} from 'lucide-react';
import type { Colis, Livreur, StatutColis } from '../types';

interface DriverPinAppProps {
  livreursList: Livreur[];
  colisList: Colis[];
  onUpdateStatut: (id: string, statut: StatutColis, comment: string, extra?: Partial<Colis>) => void;
}

export const DriverPinApp: React.FC<DriverPinAppProps> = ({
  livreursList,
  colisList,
  onUpdateStatut
}) => {
  // Mode connexion livreur
  const [activeDriver, setActiveDriver] = useState<Livreur | null>(livreursList[0] || null);
  const [inputPhone, setInputPhone] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dialogue de validation OTP pour livraison
  const [otpColisId, setOtpColisId] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [validationSuccess, setValidationSuccess] = useState('');

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const driver = livreursList.find(
      l => (String(l.telephone || '').replace(/\s+/g, '') === inputPhone.replace(/\s+/g, '') ||
            String(l.nom || '').toLowerCase().includes(inputPhone.toLowerCase())) &&
            l.pin === inputPin
    );

    if (driver) {
      setActiveDriver(driver);
      setInputPhone('');
      setInputPin('');
    } else {
      setLoginError('Numéro ou code PIN incorrect. Essayez PIN: 1234 pour Momo ou 4321 pour Yao.');
    }
  };

  // Colis assignés au livreur actif
  const driverColis = activeDriver
    ? colisList.filter(c => c.livreurId === activeDriver.id || (!c.livreurId && c.statut === 'ramasse'))
    : [];

  const handleValidateDelivery = (colis: Colis) => {
    if (!enteredOtp) {
      setOtpError('Veuillez saisir le code OTP à 4 chiffres fourni par le client.');
      return;
    }

    if (colis.codeOTP && enteredOtp !== colis.codeOTP) {
      setOtpError(`Code OTP incorrect ! (Pour le test, le code attendu est ${colis.codeOTP})`);
      return;
    }

    onUpdateStatut(
      colis.id,
      'livre',
      `Livraison effectuée par ${activeDriver?.nom}. OTP client ${enteredOtp} vérifié. Encaissé: ${colis.montantCOD} FCFA`,
      {
        livreurId: activeDriver?.id,
        nomLivreur: activeDriver?.nom
      }
    );

    setValidationSuccess(`Colis ${colis.trackingNumber} validé avec succès ! ${colis.montantCOD.toLocaleString('fr-FR')} FCFA ajoutés à votre caisse.`);
    setOtpColisId(null);
    setEnteredOtp('');
    setOtpError('');
    setTimeout(() => setValidationSuccess(''), 4000);
  };

  const totalCaisseJour = driverColis
    .filter(c => c.statut === 'livre')
    .reduce((acc, c) => acc + (c.montantCOD || 0), 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Driver Header */}
      {!activeDriver ? (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <Smartphone className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">Espace Livreur Dropia</h2>
            <p className="text-xs text-slate-400 mt-1">
              Connexion sécurisée par Téléphone + Code PIN à 4 chiffres (sans mot de passe complexe).
            </p>
          </div>

          {/* Quick Select Preset */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Comptes de test disponibles :</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {livreursList.map(l => (
                <button
                  key={l.id}
                  onClick={() => setActiveDriver(l)}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-left transition"
                >
                  <p className="text-xs font-bold text-white">{l.nom}</p>
                  <p className="text-[10px] text-amber-400 font-mono">PIN: {l.pin} | {l.zone}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handlePinLogin} className="space-y-4 text-left max-w-sm mx-auto">
            {loginError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Numéro de Téléphone</label>
              <input
                type="text"
                placeholder="+225 07 11 22 33 44"
                value={inputPhone}
                onChange={e => setInputPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Code PIN (4 chiffres)</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={inputPin}
                  onChange={e => setInputPin(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm tracking-widest font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20"
            >
              Ouvrir ma Tournée
            </button>
          </form>
        </div>
      ) : (
        /* Authenticated Driver View */
        <div className="space-y-5">
          {/* Driver Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base">
                🛵
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{activeDriver.nom}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-emerald-400 font-medium">Actif sur le terrain</span>
                  <span>•</span>
                  <span>Zone: {activeDriver.zone}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Caisse Encaissée</span>
                <span className="font-black text-emerald-400 text-sm">
                  {totalCaisseJour.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <button
                onClick={() => setActiveDriver(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title="Changer de livreur / Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {validationSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shadow-lg">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {validationSuccess}
            </div>
          )}

          {/* List of active delivery parcels */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                Feuille de Route du Jour ({driverColis.length} colis)
              </h4>
              <span className="text-xs text-slate-500">Validation immédiate par OTP</span>
            </div>

            {driverColis.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                Aucun colis n'est actuellement affecté à votre tournée.
              </div>
            ) : (
              driverColis.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border transition ${
                    c.statut === 'livre'
                      ? 'bg-emerald-950/20 border-emerald-900/40 opacity-75'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {c.trackingNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          c.statut === 'livre'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : c.statut === 'en_cours'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {c.statut.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="font-bold text-white text-sm mt-1">{c.nomClient}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-400">
                        {c.montantCOD.toLocaleString('fr-FR')} FCFA
                      </div>
                      <span className="text-[10px] text-slate-500">Montant Cash à Encaisser</span>
                    </div>
                  </div>

                  {/* Destination & Contacts */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-start gap-1.5 text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-white">{c.commune}</span>
                        <p className="text-[11px] text-slate-400">{c.adresse}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-mono">{c.telephoneClient}</span>
                      </div>
                      <a
                        href={`tel:${c.telephoneClient}`}
                        className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-[11px] font-semibold"
                      >
                        Appeler
                      </a>
                    </div>
                  </div>

                  {c.notes && (
                    <div className="mt-2 text-[11px] text-amber-300/80 bg-amber-500/5 p-2 rounded border border-amber-500/20">
                      Note client: {c.notes}
                    </div>
                  )}

                  {/* Actions according to status */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    {c.statut === 'ramasse' && (
                      <button
                        onClick={() =>
                          onUpdateStatut(
                            c.id,
                            'en_cours',
                            `Pris en charge par ${activeDriver.nom}. Départ livraison.`
                          )
                        }
                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Démarrer la course vers le client
                      </button>
                    )}

                    {c.statut === 'en_cours' && (
                      <div className="w-full space-y-2">
                        {otpColisId === c.id ? (
                          <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                                <KeyRound className="w-3.5 h-3.5" />
                                Code OTP Client (4 chiffres)
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Code test: <strong className="text-slate-300">{c.codeOTP || '4821'}</strong>
                              </span>
                            </div>

                            {otpError && (
                              <p className="text-[11px] text-rose-400">{otpError}</p>
                            )}

                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="Code 4 chiffres"
                                value={enteredOtp}
                                onChange={e => setEnteredOtp(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-center font-mono tracking-widest text-sm focus:outline-none focus:border-amber-500"
                              />
                              <button
                                onClick={() => handleValidateDelivery(c)}
                                className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                              >
                                Confirmer la Livraison
                              </button>
                              <button
                                onClick={() => {
                                  setOtpColisId(null);
                                  setOtpError('');
                                }}
                                className="px-2 py-1.5 rounded bg-slate-800 text-slate-400 text-xs"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setOtpColisId(c.id);
                                setEnteredOtp('');
                                setOtpError('');
                              }}
                              className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              Valider Livraison (Code OTP)
                            </button>
                            <button
                              onClick={() =>
                                onUpdateStatut(
                                  c.id,
                                  'retourne',
                                  `Client injoignable ou absent par ${activeDriver.nom}`
                                )
                              }
                              className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold"
                            >
                              Client Absent
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {c.statut === 'livre' && (
                      <div className="w-full flex items-center justify-between text-xs text-emerald-400 font-semibold py-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Livraison effectuée avec succès
                        </span>
                        <span className="text-slate-400 font-normal">
                          {c.montantCOD.toLocaleString('fr-FR')} FCFA perçus
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
