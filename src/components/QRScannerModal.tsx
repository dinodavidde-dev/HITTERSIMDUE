import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import { QrCode, X, Search, CheckCircle, Camera, Smartphone, User, ArrowRight } from 'lucide-react';
import { translateRoleOrSpecialty } from '../i18n/medicalTerms';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const { language, discenti, teams, faculty, setSelectedDiscenteId, setUserRole } = useCourse();
  const isEn = language === 'en';

  const [manualCode, setManualCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectDiscente = (discenteId: string) => {
    setErrorMessage(null);
    setSelectedDiscenteId(discenteId);
    setUserRole('discente');
    const disc = discenti.find((d) => d.id === discenteId);
    setScanSuccess(disc ? `${disc.name} (${disc.badgeCode || disc.id})` : discenteId);

    setTimeout(() => {
      setScanSuccess(null);
      onClose();
    }, 1200);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const query = manualCode.trim().toUpperCase();
    if (!query) return;

    // Find by badgeCode or ID or Name
    const matched = discenti.find(
      (d) =>
        d.badgeCode?.toUpperCase() === query ||
        d.id.toUpperCase() === query ||
        d.name.toUpperCase().includes(query)
    );

    if (matched) {
      handleSelectDiscente(matched.id);
    } else {
      setErrorMessage(
        isEn
          ? `No participant found with badge code "${manualCode}". Please retry.`
          : `Nessun partecipante trovato con codice badge "${manualCode}". Riprova.`
      );
    }
  };

  const filteredDiscenti = discenti.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.badgeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `squadra ${d.teamId}`.includes(searchQuery.toLowerCase()) ||
      `team ${d.teamId}`.includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-950 border-4 border-neutral-100 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 border-neutral-800 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 text-black flex items-center justify-center font-black">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-tight">
                {isEn ? 'ACCESS VIA QR CODE' : 'ACCESSO TRAMITE QR CODE'}
              </h3>
              <p className="text-xs text-neutral-400 font-medium">
                {isEn ? 'Scan or enter participant badge code' : 'Scansione o inserimento codice badge partecipante'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {scanSuccess ? (
            <div className="p-6 bg-emerald-950/60 border-2 border-emerald-500 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="font-black text-lg text-white uppercase">
                {isEn ? 'QR CODE RECOGNIZED!' : 'QR CODE RICONOSCIUTO!'}
              </h4>
              <p className="text-sm font-bold text-emerald-300">{scanSuccess}</p>
              <p className="text-xs text-neutral-400">
                {isEn ? 'Loading custom view...' : 'Caricamento visuale personalizzata in corso...'}
              </p>
            </div>
          ) : (
            <>
              {/* QR Scanner Simulation UI */}
              <div className="relative border-2 border-dashed border-orange-500/80 bg-neutral-900/60 p-5 text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-neutral-800 rounded-full flex items-center justify-center border-2 border-orange-500 animate-pulse">
                  <Smartphone className="w-8 h-8 text-orange-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-sm text-white uppercase">
                    {isEn ? 'POINT CAMERA AT QR BADGE' : 'PUNTA LA FOTOCAMERA SUL BADGE QR'}
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    {isEn
                      ? 'Each participant has a unique badge that instantly opens their dashboard with team, tutor and roster.'
                      : 'Ogni partecipante possiede un badge univoco che apre istantaneamente la propria schermata con squadra, tutor e roster.'}
                  </p>
                </div>
              </div>

              {/* Manual Code Input */}
              <form onSubmit={handleManualSubmit} className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-300">
                  {isEn ? 'ENTER BADGE CODE (e.g. DISC-01, DISC-15):' : 'INSERISCI CODICE BADGE (es. DISC-01, DISC-15):'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Es. DISC-01"
                    className="flex-1 px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-white font-mono text-sm uppercase focus:outline-hidden focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{isEn ? 'OPEN' : 'APRI'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {errorMessage && (
                  <p className="text-xs text-red-400 font-bold bg-red-950/60 border border-red-800 p-2">
                    {errorMessage}
                  </p>
                )}
              </form>

              {/* Direct Selector by list */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                    {isEn ? 'OR SELECT FROM THE 60 PARTICIPANTS LIST:' : 'OPPURE SELEZIONA DALLA LISTA DEI 60 DISCENTI:'}
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isEn ? 'Search participant by name, team, role...' : 'Cerca discente per nome, squadra, ruolo...'}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {filteredDiscenti.slice(0, 15).map((d) => {
                    const team = teams.find((t) => t.id === d.teamId);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleSelectDiscente(d.id)}
                        className="w-full p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-orange-500 text-left flex items-center justify-between gap-2 transition-all cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-black px-1.5 py-0.5 bg-neutral-950 text-orange-400 border border-neutral-700">
                              {d.badgeCode || d.id}
                            </span>
                            <span className="font-bold text-xs text-white uppercase truncate group-hover:text-orange-300">
                              {d.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 truncate">
                            {team?.name} • {translateRoleOrSpecialty(d.role, language)}
                          </p>
                        </div>

                        <span className="text-[10px] font-black text-neutral-500 group-hover:text-orange-400 uppercase flex-shrink-0">
                          {isEn ? 'Enter →' : 'Accedi →'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t-2 border-neutral-800 bg-neutral-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            {isEn ? 'CLOSE' : 'CHIUDI'}
          </button>
        </div>
      </div>
    </div>
  );
};
