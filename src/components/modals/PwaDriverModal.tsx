import React, { useState } from 'react';
import {
  Smartphone,
  X,
  Bike,
  KeyRound,
  CheckCircle2,
  Phone,
  MapPin,
  DollarSign,
  Navigation,
  MessageCircle,
  AlertCircle,
  LogOut,
  ShieldCheck,
  Send,
  Clock,
  Car
} from 'lucide-react';
import type { Colis, Livreur } from '../../types';

interface PwaDriverModalProps {
  onClose: () => void;
  colisList: Colis[];
  livreursList?: Livreur[];
  onValidateDelivery: (colisId: string, otp: string) => void;
  onAssignToDriver?: (colisId: string, livreurNom: string) => void;
}

export const PwaDriverModal: React.FC<PwaDriverModalProps> = ({
  onClose,
  colisList,
  livreursList = [],
  onValidateDelivery,
  onAssignToDriver
}) => {
  // Mode de connexion chauffeur
  const [isLogged, setIsLogged] = useState(false);
  const [loggedDriver, setLoggedDriver] = useState<Livreur | null>(null);

  // Formulaire de connexion
  const [phoneInput, setPhoneInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // État de livraison active et GPS
  const [selectedColis, setSelectedColis] = useState<Colis | null>(null);
  const [deliveryStarted, setDeliveryStarted] = useState<boolean>(false);
  const [inputOtp, setInputOtp] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpError, setOtpError] = useState('');

  // Traitement de la connexion Livreur (Téléphone + PIN à 4 chiffres)
  const handleDriverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanPhone = phoneInput.replace(/\s+/g, '').replace(/-/g, '');
    const cleanPin = pinInput.trim();

    if (!cleanPhone || !cleanPin) {
      setAuthError('Veuillez saisir votre numéro de téléphone et votre code PIN.');
      return;
    }

    // Recherche dans la flotte réelle enregistrée en base
    const driverFound = livreursList.find((l) => {
      const dbPhone = (l.telephone || '').replace(/\s+/g, '').replace(/-/g, '');
      return (
        (dbPhone.includes(cleanPhone) || cleanPhone.includes(dbPhone)) &&
        String(l.pin).trim() === cleanPin
      );
    });

    if (driverFound) {
      setLoggedDriver(driverFound);
      setIsLogged(true);
      setAuthError(null);
    } else {
      if (livreursList.length === 0) {
        setAuthError(
          '❌ Aucun livreur n\'a encore été enregistré dans le système. Demandez à votre agence de créer votre profil livreur (avec votre numéro et code PIN) depuis le panneau "Livreurs".'
        );
      } else {
        setAuthError(
          '❌ Identifiants invalides. Le numéro de téléphone ou le code PIN à 4 chiffres est incorrect. Vérifiez vos identifiants auprès de votre agence.'
        );
      }
    }
  };

  const handleLogout = () => {
    setIsLogged(false);
    setLoggedDriver(null);
    setSelectedColis(null);
    setDeliveryStarted(false);
    setPhoneInput('');
    setPinInput('');
    setAuthError(null);
  };

  // Colis assignés à ce livreur
  const assignedColis = colisList.filter(
    (c) =>
      loggedDriver &&
      (c.nomLivreur === loggedDriver.nom ||
        c.nomLivreur?.toLowerCase().includes(loggedDriver.nom.toLowerCase()) ||
        c.statut === 'en_cours' ||
        c.statut === 'ramasse')
  );

  // Tous les colis en attente pouvant être pris en charge
  const availableColis = colisList.filter(
    (c) => c.statut === 'en_attente' || !c.nomLivreur
  );

  const handleStartDelivery = (c: Colis) => {
    setSelectedColis(c);
    setDeliveryStarted(true);
    setInputOtp('');
    setOtpError('');
  };

  const handleConfirmOtp = () => {
    if (!selectedColis) return;
    if (!inputOtp.trim()) {
      setOtpError('Veuillez entrer le code OTP à 4 chiffres fourni par le destinataire.');
      return;
    }

    // Si le colis a un code OTP défini, on le valide
    if (selectedColis.codeOTP && selectedColis.codeOTP.trim() !== inputOtp.trim()) {
      setOtpError(`Code OTP incorrect ! Demandez au client ${selectedColis.nomClient} le code reçu par SMS/WhatsApp.`);
      return;
    }

    onValidateDelivery(selectedColis.id, inputOtp.trim());
    setSuccessMsg(`🎉 Colis ${selectedColis.trackingNumber} validé et livré avec succès ! COD encaissé.`);
    setOtpError('');

    setTimeout(() => {
      setSuccessMsg('');
      setDeliveryStarted(false);
      setSelectedColis(null);
      setInputOtp('');
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-slate-300 font-bold flex items-center gap-1 text-xs"
        >
          <X className="w-4 h-4" /> Fermer l'espace livreur
        </button>

        {/* Smartphone mockup */}
        <div className="w-[340px] sm:w-[370px] h-[670px] rounded-[42px] border-8 border-slate-800 bg-[#0b1329] text-white shadow-2xl flex flex-col overflow-hidden relative">
          {/* Top Notch Speaker */}
          <div className="h-6 bg-slate-900 flex items-center justify-center">
            <div className="w-16 h-1 bg-slate-700 rounded-full" />
          </div>

          {/* App Header */}
          <div className="bg-[#0f172a] p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xs shadow-xs">
                🏍️
              </div>
              <div>
                <span className="font-bold text-xs block tracking-tight">Dropia Driver PWA</span>
                <span className="text-[9px] text-emerald-400">
                  {isLogged && loggedDriver
                    ? `${loggedDriver.nom} • ${loggedDriver.zone || 'Dakar'}`
                    : 'Mode Production'}
                </span>
              </div>
            </div>
            {isLogged ? (
              <button
                onClick={handleLogout}
                className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-semibold flex items-center gap-1"
                title="Déconnexion"
              >
                <LogOut className="w-3 h-3" />
                <span>Quitter</span>
              </button>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                Hors ligne
              </span>
            )}
          </div>

          {/* App Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
            {/* Si NON connecté : Formulaire d'authentification Livreur par Téléphone + PIN */}
            {!isLogged ? (
              <div className="h-full flex flex-col justify-center space-y-4 py-4">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl border border-emerald-500/30">
                    <Bike className="w-7 h-7" />
                  </div>
                  <h3 className="font-black text-white text-base">Espace Chauffeur Livreur</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed px-4">
                    Connectez-vous avec votre numéro de téléphone et votre code PIN à 4 chiffres attribué par votre agence.
                  </p>
                </div>

                {authError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Accès refusé</span>
                    </div>
                    <p className="text-[10px] text-rose-200/90 leading-normal">{authError}</p>
                  </div>
                )}

                <form onSubmit={handleDriverLogin} className="space-y-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Numéro de téléphone
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="+221 77 123 45 67"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Code PIN (4 chiffres)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono tracking-widest text-center text-base"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <span>Prendre mon service</span>
                  </button>

                  {livreursList.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 text-center">
                      <span>Livreurs enregistrés dans l'agence : </span>
                      <strong className="text-emerald-400">{livreursList.length} coursier(s)</strong>
                    </div>
                  )}
                </form>
              </div>
            ) : (
              /* Vue Chauffeur Connecté */
              <>
                {successMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold text-[11px] flex items-center justify-center gap-1.5 animate-bounce">
                    <CheckCircle2 className="w-4 h-4" />
                    {successMsg}
                  </div>
                )}

                {/* Chauffeur Header & Caisse Cash */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-[10px]">
                        {loggedDriver?.nom.charAt(0)}
                      </div>
                      <span className="font-bold text-white">{loggedDriver?.nom}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                      PIN: {loggedDriver?.pin}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[10px]">
                    <div>
                      <span className="text-slate-400 block uppercase">Zone d'action</span>
                      <strong className="text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {loggedDriver?.zone || 'Dakar'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase">Caisse COD collectée</span>
                      <strong className="text-emerald-400 font-mono text-xs">
                        {(loggedDriver?.soldeCollecteAujourdhui || 0).toLocaleString('fr-FR')} FCFA
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Si livraison en cours avec Suivi GPS actif */}
                {deliveryStarted && selectedColis ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <Navigation className="w-3.5 h-3.5 animate-spin" />
                        <span>GPS en direct (Yango/Uber style)</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                        ETA : 12 min
                      </span>
                    </div>

                    {/* Carte GPS simulée */}
                    <div className="relative h-28 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />
                      <div className="text-center space-y-1 z-10">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse">
                          <Bike className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] text-slate-300 block font-mono">
                          14.6928° N, 17.4467° W • En mouvement
                        </span>
                      </div>
                    </div>

                    {/* Détails destinataire & Boutons Appel/WhatsApp */}
                    <div className="space-y-1.5 text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{selectedColis.nomClient}</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {selectedColis.montantCOD.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                      <p className="text-slate-400 text-[10px]">
                        📍 {selectedColis.commune || selectedColis.ville} — {selectedColis.adresse || 'Quartier central'}
                      </p>

                      <div className="flex gap-2 pt-2">
                        <a
                          href={`tel:${selectedColis.telephoneClient}`}
                          className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-center flex items-center justify-center gap-1 text-[10px]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Appeler</span>
                        </a>
                        <a
                          href={`https://wa.me/${selectedColis.telephoneClient.replace(/\+/g, '').replace(/\s+/g, '')}?text=Bonjour%20je%20suis%20votre%20livreur%20Dropia,%20je%20suis%20en%20route.`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center flex items-center justify-center gap-1 text-[10px]"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Validation par Code OTP */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase">
                        Saisir le code OTP client (Preuve de livraison) :
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Code OTP client..."
                          value={inputOtp}
                          onChange={(e) => setInputOtp(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={handleConfirmOtp}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Valider
                        </button>
                      </div>
                      {otpError && (
                        <p className="text-rose-400 text-[10px] font-medium">{otpError}</p>
                      )}
                      <button
                        onClick={() => setDeliveryStarted(false)}
                        className="w-full text-center text-slate-400 hover:text-white text-[10px] pt-1"
                      >
                        ← Revenir à la liste des courses
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Liste des courses */
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Mes Courses ({assignedColis.length})</span>
                      <span>Disponibles ({availableColis.length})</span>
                    </div>

                    {colisList.length === 0 ? (
                      <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2 text-slate-400">
                        <Bike className="w-8 h-8 mx-auto text-slate-600" />
                        <p className="font-bold text-white text-xs">Aucune course pour le moment</p>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Les colis créés par l'agence ou les commerçants apparaîtront ici immédiatement en temps réel.
                        </p>
                      </div>
                    ) : (
                      colisList.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-amber-400 text-xs">
                              {c.trackingNumber}
                            </span>
                            <span className="text-emerald-400 font-bold font-mono text-xs">
                              {c.montantCOD.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>

                          <div className="text-[11px] space-y-0.5">
                            <div className="font-bold text-white flex items-center justify-between">
                              <span>{c.nomClient}</span>
                              <span className="text-[9px] text-slate-400">{c.nomBoutique}</span>
                            </div>
                            <p className="text-slate-400 text-[10px]">
                              📍 {c.commune || c.ville}
                            </p>
                          </div>

                          {c.statut === 'livre' ? (
                            <div className="flex items-center justify-between pt-1 text-[10px] text-emerald-400 font-bold">
                              <span>✓ Livré avec succès</span>
                              <span className="font-mono">OTP: {c.codeOTP}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartDelivery(c)}
                              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>Démarrer la livraison (GPS)</span>
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
