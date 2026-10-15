import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Unlock,
  Copy,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  Radio,
} from 'lucide-react';

interface EmergencyAccessQRCardProps {
  directUrl: string;
  onOpenAreaDiscenti: () => void;
  language?: 'it' | 'en';
}

export const EmergencyAccessQRCard: React.FC<EmergencyAccessQRCardProps> = ({
  directUrl,
  onOpenAreaDiscenti,
  language = 'it',
}) => {
  const isEn = language === 'en';
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isExpandedModal, setIsExpandedModal] = useState<boolean>(false);
  const [isGhostMode, setIsGhostMode] = useState<boolean>(false);

  // Generate QR Code data URL dynamically
  useEffect(() => {
    if (!directUrl) return;
    QRCode.toDataURL(directUrl, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating emergency QR code:', err));
  }, [directUrl]);

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(directUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  // Reusable QR Code Visual Box
  const renderQrVisual = (sizeClass: string = 'w-36 h-36 sm:w-44 sm:h-44') => (
    <div className="relative group flex-shrink-0 flex flex-col items-center">
      <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-2xl ring-4 ring-cyan-500/60 transition-transform group-hover:scale-[1.02]">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR Code di Emergenza per Accesso Libero Discenti"
            className={`${sizeClass} object-contain rounded-md`}
          />
        ) : (
          <div className={`${sizeClass} flex items-center justify-center bg-neutral-100 rounded text-neutral-500 text-xs font-mono`}>
            {isEn ? 'Generating QR...' : 'Generazione QR...'}
          </div>
        )}
      </div>
      <span className="mt-1.5 px-2 py-0.5 bg-neutral-950 text-cyan-300 border border-cyan-700/60 text-[9px] sm:text-[10px] font-mono font-bold uppercase rounded tracking-wider shadow">
        SCAN ME • 100% HI-RES
      </span>
    </div>
  );

  return (
    <>
      {/* ----------------------------------------------------------------- */}
      {/* 1. DOCKED COMPONENT: LOCATED DIRECTLY ABOVE EXPOSED TIMELINE DATA */}
      {/* ----------------------------------------------------------------- */}
      <section
        id="emergency-access-qr-section"
        aria-label="QR Code di Emergenza per Accesso Libero"
        className={`w-full transition-all duration-300 font-mono ${
          isGhostMode
            ? 'bg-neutral-950/50 border-2 border-cyan-500/60 backdrop-blur-[2px]'
            : 'bg-gradient-to-br from-neutral-950 via-cyan-950/40 to-neutral-950 border-2 border-cyan-400 shadow-2xl shadow-cyan-950/40'
        } rounded-xl overflow-hidden relative mb-3 sm:mb-4`}
      >
        {/* Industrial Tactical Hazard Bar */}
        <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#06b6d4,#06b6d4_12px,#083344_12px,#083344_24px)] border-b border-cyan-500/40" />

        {/* Tactical neon ambient glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Control Bar: Emergency Title, Live Status & Handover-style HUD Toggles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 sm:p-4 border-b border-cyan-900/60 relative z-10 bg-neutral-950/70">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-cyan-500 text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded flex items-center gap-1.5 shadow-md animate-pulse">
              <QrCode className="w-4 h-4 stroke-[2.8]" />
              <span>{isEn ? 'EMERGENCY QR CODE • DIRECT ACCESS' : 'QR CODE DI EMERGENZA • ACCESSO LIBERO'}</span>
            </span>

            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/80 text-[10px] sm:text-[11px] font-mono font-bold uppercase rounded flex items-center gap-1 shadow-sm">
              <span className="text-cyan-400 font-black">PARAM:</span>
              <span className="text-white bg-black/60 px-1 py-0.2 rounded font-bold">?accesso=libero</span>
            </span>

            <span className="px-2 py-0.5 bg-neutral-900 text-emerald-300 border border-emerald-700 text-[10px] sm:text-[11px] font-bold uppercase rounded flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>{isEn ? 'REGIA OVERRIDE ACTIVE' : 'BYPASS REGIA ATTIVO'}</span>
            </span>
          </div>

          {/* Right Action & HUD Controls (Handover style) */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {/* Ghost Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsGhostMode(!isGhostMode)}
              className={`p-1.5 sm:px-2 sm:py-1 border rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                isGhostMode
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                  : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
              }`}
              title={isGhostMode ? (isEn ? 'Disable ghost transparency' : 'Disattiva trasparenza') : (isEn ? 'Enable ghost HUD' : 'Attiva trasparenza')}
            >
              {isGhostMode ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5 text-neutral-400" />}
              <span className="text-[10px] uppercase hidden md:inline">{isGhostMode ? 'Ghost' : 'Solido'}</span>
            </button>

            {/* Fullscreen / Projector Modal Expander */}
            <button
              type="button"
              onClick={() => setIsExpandedModal(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-neutral-900/90 hover:bg-neutral-850 border border-cyan-600/70 text-cyan-200 hover:text-white rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isEn ? 'Projector / Fullscreen Modal QR' : 'Visualizza QR ingrandito per videoproiettore/aula'}
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] uppercase font-bold hidden sm:inline">
                {isEn ? 'Fullscreen' : 'Ingrandisci'}
              </span>
            </button>

            {/* Minimize / Expand Bar Toggle */}
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 sm:px-2 sm:py-1 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title={isMinimized ? (isEn ? 'Expand emergency QR box' : 'Espandi scheda QR di emergenza') : (isEn ? 'Minimize to header' : 'Riduci a barra')}
            >
              {isMinimized ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-neutral-300" />
                  <span className="text-[10px] uppercase hidden sm:inline">{isEn ? 'Open' : 'Espandi'}</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-neutral-300" />
                  <span className="text-[10px] uppercase hidden sm:inline">{isEn ? 'Hide' : 'Riduci'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Minimized Quick Reminder Ribbon */}
        {isMinimized && (
          <div className="p-2.5 px-3 sm:px-4 bg-cyan-950/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-cyan-200 truncate">
              <Unlock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span className="font-bold">
                {isEn
                  ? 'Free Access Active: Trainees can scan QR or click button below to enter Name & Surname'
                  : 'Accesso Libero Attivo: I discenti possono inquadrare il QR o cliccare per inserire Nome e Cognome'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={onOpenAreaDiscenti}
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider rounded cursor-pointer flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-black" />
                <span>{isEn ? 'ENTER NAME & SURNAME' : 'INSERISCI NOME E COGNOME'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(false)}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-cyan-700 text-cyan-300 text-xs rounded cursor-pointer"
              >
                {isEn ? 'Show QR' : 'Mostra QR'}
              </button>
            </div>
          </div>
        )}

        {/* Detailed Emergency Content Body */}
        {!isMinimized && (
          <div className="p-3.5 sm:p-5 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
            {/* Column A: Scannable QR Code */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center justify-center">
              {renderQrVisual('w-36 h-36 sm:w-44 sm:h-44')}
            </div>

            {/* Column B: Tactical Explanation & Student Instructions */}
            <div className="md:col-span-8 lg:col-span-9 space-y-3 text-left">
              {/* Alert Reason */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    {isEn
                      ? 'BADGE QR SCANNING BYPASS INITIATED BY CONTROL ROOM'
                      : 'FALLIMENTO SCANSIONE QR BADGE • BYPASS ATTIVATO DALLA REGIA'}
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-white uppercase tracking-tight leading-snug">
                  {isEn
                    ? 'Scan with your smartphone to enter directly via link'
                    : "Inquadra con la fotocamera dello smartphone per accedere direttamente all'app"}
                </h3>
                <p className="text-xs sm:text-sm text-cyan-100/90 font-sans leading-relaxed">
                  {isEn
                    ? 'Due to temporary QR badge reading issues, learners can access their operational clinical board immediately through this direct link. Simply type your Name and Surname to identify your assigned team, tutor, and station.'
                    : 'A seguito di difficoltà di lettura dei QR badge individuali, i discenti possono accedere alla propria scheda operativa tramite questo link diretto. Basterà inserire Nome e Cognome per visualizzare squadra, tutor 1:1 e postazione.'}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  id="emergency-qr-enter-btn"
                  onClick={onOpenAreaDiscenti}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-xl border border-cyan-300 transition-transform transform hover:scale-[1.02] cursor-pointer flex items-center gap-2 group"
                >
                  <GraduationCap className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
                  <span>{isEn ? 'ENTER NAME & SURNAME NOW' : 'INSERISCI NOME E COGNOME ADESSO'}</span>
                  <ArrowRight className="w-4 h-4 text-black stroke-[3] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 border border-cyan-500/70 text-cyan-200 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Copia link diretto negli appunti"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                  <span>{copied ? (isEn ? 'LINK COPIED!' : 'LINK COPIATO!') : (isEn ? 'COPY DIRECT LINK' : 'COPIA LINK DIRETTO')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpandedModal(true)}
                  className="px-3 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{isEn ? 'ENLARGE QR' : 'INGRANDISCI QR'}</span>
                </button>
              </div>

              {/* Direct Link Monospace Preview */}
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-md p-2 flex items-center gap-2 text-[11px] text-neutral-400">
                <span className="text-cyan-400 font-bold uppercase text-[10px] flex-shrink-0">
                  {isEn ? 'Direct URL:' : 'Link Diretto:'}
                </span>
                <span className="font-mono text-cyan-200/90 truncate select-all">{directUrl}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* 2. EXPANDED FULLSCREEN MODAL / PROJECTOR HUD (HANDOVER STYLE)     */}
      {/* ----------------------------------------------------------------- */}
      {isExpandedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto font-mono animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsExpandedModal(false);
          }}
        >
          <div className="w-full max-w-3xl bg-neutral-950 border-3 border-cyan-400 rounded-2xl p-4 sm:p-8 shadow-2xl shadow-cyan-950/80 relative overflow-hidden space-y-5 text-center">
            {/* Tactical background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cyan-900/80 pb-3 relative z-10">
              <div className="flex items-center gap-2 text-left">
                <span className="px-3 py-1 bg-cyan-500 text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 stroke-[3]" />
                  <span>{isEn ? 'PROJECTOR MODE • EMERGENCY QR CODE' : 'MODALITÀ SCHERMO • QR CODE DI EMERGENZA'}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsExpandedModal(false)}
                className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
                title={isEn ? 'Close Fullscreen' : 'Chiudi Schermo Intero'}
              >
                <Minimize2 className="w-5 h-5 text-neutral-300" />
              </button>
            </div>

            {/* Giant Central Scannable QR Code */}
            <div className="py-2 flex flex-col items-center justify-center relative z-10 space-y-3">
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl ring-8 ring-cyan-500/60 inline-block">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="QR Code di Emergenza Ingrandito"
                    className="w-56 h-56 sm:w-80 sm:h-80 object-contain rounded-lg"
                  />
                )}
              </div>
              <p className="text-xs sm:text-base font-black text-cyan-300 uppercase tracking-wider">
                {isEn
                  ? 'Point smartphone camera to open the application directly'
                  : "Punta la fotocamera per aprire l'applicazione tramite link diretto"}
              </p>
            </div>

            {/* Instructions & Quick Access */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 sm:p-4 text-xs text-neutral-300 space-y-2 relative z-10 max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold uppercase text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEn ? 'Free Access Active: Identification with Name & Surname' : 'Accesso Libero Attivo: Identificazione con Nome e Cognome'}</span>
              </div>
              <p className="text-neutral-400 text-[11px] sm:text-xs">
                {isEn
                  ? 'Once inside, select "Enter Name & Surname" to instantly access your clinical role (TL or Operator) and assigned station.'
                  : 'Una volta aperta l\'applicazione, inserisci il tuo Nome e Cognome per essere collegato immediatamente al tuo ruolo clinico (TL o Operatore) e alla postazione assegnata.'}
              </p>
            </div>

            {/* Modal Bottom Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsExpandedModal(false);
                  onOpenAreaDiscenti();
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-black" />
                <span>{isEn ? 'ENTER NAME & SURNAME NOW' : 'INSERISCI NOME E COGNOME ADESSO'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg text-xs font-bold uppercase cursor-pointer flex items-center justify-center gap-2"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (isEn ? 'COPIED!' : 'COPIATO!') : (isEn ? 'COPY LINK' : 'COPIA LINK')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyAccessQRCard;
