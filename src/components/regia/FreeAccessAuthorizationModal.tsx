import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  GraduationCap,
  Lock,
  QrCode,
  Radio,
  ShieldAlert,
  Unlock,
  X,
  ExternalLink,
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';

interface FreeAccessAuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FreeAccessAuthorizationModal: React.FC<FreeAccessAuthorizationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { freeAccessEnabled, setFreeAccessEnabled, language } = useCourse();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isEn = language === 'en';
  const directLink = typeof window !== 'undefined' ? `${window.location.origin}?view=public` : '';

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(directLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleConfirmToggle = () => {
    setFreeAccessEnabled(!freeAccessEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn font-mono">
      <div className="bg-neutral-950 border-2 border-cyan-500 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden relative">
        {/* Glow accent */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-start justify-between gap-3 bg-neutral-900/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-500/80 text-cyan-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>{isEn ? 'MISSION CONTROL DIRECTIVE' : 'DIRETTIVA REGIA OPERATIVA'}</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  freeAccessEnabled
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-700'
                }`}
              >
                {freeAccessEnabled
                  ? isEn
                    ? 'STATUS: ACTIVE'
                    : 'STATO: ATTIVO'
                  : isEn
                  ? 'STATUS: DISABLED'
                  : 'STATO: DISATTIVATO'}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 pt-1">
              <Unlock className="w-5 h-5 text-cyan-400" />
              <span>{isEn ? 'AUTHORIZE FREE LEARNER ACCESS' : 'AUTORIZZAZIONE ACCESSO LIBERO DISCENTI'}</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
            title={isEn ? 'Close' : 'Chiudi'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Main Required Explanation of QR Failure */}
          <div className="bg-amber-950/40 border-2 border-amber-500/80 rounded-lg p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
              <span>{isEn ? 'NOTICE BEFORE AUTHORIZATION' : 'INFORMATIVA PRIMA DI AUTORIZZARE'}</span>
            </div>
            <p className="text-xs sm:text-[13px] text-amber-100/90 leading-relaxed font-sans">
              <strong>ATTENZIONE:</strong> Il meccanismo di riconoscimento tramite <strong>QR Code è fallito</strong>{' '}
              oppure i dispositivi dei discenti non riescono a eseguire la scansione del badge.
            </p>
            <p className="text-xs sm:text-[13px] text-amber-200/90 leading-relaxed font-sans">
              Autorizzando questo comando, i discenti potranno accedere al corso <strong>tramite link diretto</strong>{' '}
              e nella <strong>Visuale Pubblica</strong> si attiverà un <strong>QR Code di Emergenza</strong> al di sopra dei dati esposti
              (con la barra di accesso libero) per permettere la scansione istantanea da smartphone.
            </p>
            <div className="bg-neutral-950/80 border border-amber-500/40 rounded p-2.5 text-xs text-neutral-300 font-mono">
              <span className="text-amber-400 font-bold uppercase block mb-1">
                Modalità di Accesso Discente:
              </span>
              Una volta attivo, ai discenti basterà inserire <strong>solo il proprio Nome e Cognome</strong> per
              identificarsi, accedere alla propria scheda operativa e visualizzare la squadra, il tutor Faculty 1:1 e la
              postazione assegnata.
            </div>
          </div>

          {/* Cloud Sync Propagation Note */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-300 flex items-start gap-2.5">
            <Radio className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-cyan-300 block uppercase">
                Sincronizzazione Cloud Istantanea
              </span>
              <p className="font-sans text-[11px] sm:text-xs text-neutral-400">
                La modifica si propaga in tempo reale via Firestore a tutti i tablet, smartphone e schermi pubblici
                connessi alla sessione di simulazione.
              </p>
            </div>
          </div>

          {/* Direct Link Box */}
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 space-y-1.5">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
              Link Diretto per i Discenti:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={directLink}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs text-cyan-300 font-mono select-all truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1"
                title="Copia link negli appunti"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIATO' : 'COPIA'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-xs font-bold uppercase cursor-pointer order-2 sm:order-1"
          >
            {isEn ? 'Cancel / Close' : 'Annulla / Chiudi'}
          </button>

          <button
            type="button"
            id="confirm-free-access-toggle-btn"
            onClick={() => {
              handleConfirmToggle();
              onClose();
            }}
            className={`w-full sm:w-auto px-5 py-2.5 rounded font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer order-1 sm:order-2 ${
              freeAccessEnabled
                ? 'bg-red-600 hover:bg-red-500 text-white border border-red-400'
                : 'bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black border border-cyan-300'
            }`}
          >
            {freeAccessEnabled ? (
              <>
                <Lock className="w-4 h-4" />
                <span>DISATTIVA ACCESSO LIBERO</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 stroke-[2.5]" />
                <span>AUTORIZZA E ATTIVA ACCESSO LIBERO</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
