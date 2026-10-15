import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Play,
  ShieldAlert,
  X,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';

interface StartStopConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const StartStopConfirmationModal: React.FC<StartStopConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { language, activeDay, activeSlotIndex } = useCourse();

  if (!isOpen) return null;

  const isEn = language === 'en';
  const currentSlot = INITIAL_TIMELINE_SLOTS[activeSlotIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn font-mono"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-neutral-950 border-2 border-red-500 rounded-xl max-w-xl w-full shadow-2xl shadow-red-950/60 overflow-hidden relative">
        {/* Hazard Diagonal Stripe Bar */}
        <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_12px,#7f1d1d_12px,#7f1d1d_24px)] border-b border-red-500/50" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-start justify-between gap-3 bg-neutral-900/90">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-red-950 text-red-300 border border-red-600/80 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded flex items-center gap-1.5 shadow-xs">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>{isEn ? 'LIVE MISSION CONTROL CONFIRMATION' : 'CONFERMA REGIA OPERATIVA'}</span>
              </span>

              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/80 text-[10px] sm:text-[11px] font-bold uppercase rounded flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>{isEn ? 'COURSE CURRENTLY ACTIVE' : 'CORSO ATTUALMENTE ATTIVO'}</span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 pt-1">
              <span>{isEn ? 'ACCESS START & STOP CONTROL MENU?' : 'ACCEDERE AL MENU START & STOP?'}</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
            title={isEn ? 'Cancel' : 'Annulla'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Active Status Telemetry Box */}
          <div className="bg-neutral-900 border border-red-900/70 p-3 rounded-lg flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                {isEn ? 'ACTIVE TIMELINE STATE' : 'STATO TIMELINE IN CORSO'}
              </span>
              <span className="text-white font-bold text-xs sm:text-sm">
                {isEn ? 'Day' : 'Giorno'} 0{activeDay} • {isEn ? 'Phase' : 'Fase'} {activeSlotIndex + 1}
              </span>
              <div className="text-[11px] text-amber-300 truncate max-w-xs">{currentSlot?.title}</div>
            </div>

            <span className="px-2.5 py-1 bg-red-600/20 text-red-300 border border-red-500/60 font-bold uppercase text-[10px] rounded animate-pulse">
              {isEn ? 'INTERVENTION CONTROLS SENSITIVE' : 'COMANDI SENSIBILI'}
            </span>
          </div>

          {/* Warning Message Box */}
          <div className="p-3.5 bg-neutral-900/80 border border-amber-500/40 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px]">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                {isEn
                  ? 'CRITICAL OPERATION WARNING'
                  : 'AVVERTENZA OPERATIVA: ESERCITAZIONE IN SVOLGIMENTO'}
              </span>
            </div>
            <p className="text-neutral-300 font-sans leading-relaxed text-[11px] sm:text-xs">
              {isEn
                ? 'The course is currently underway with all squads, faculty, and clinical stations active. The START & STOP panel contains direct commands that can suspend the entire exercise, trigger general emergency alarms, or modify simulation timelines.'
                : 'Il corso è attualmente attivo e in regolare svolgimento con le squadre, i tutor e le postazioni cliniche impegnate negli scenari. Il pannello START & STOP contiene comandi diretti per la sospensione globale d\'emergenza, il reset del timer e la forzatura dei tempi didattici.'}
            </p>
          </div>

          <div className="text-[11px] text-neutral-400 font-sans">
            {isEn
              ? 'Do you confirm you want to proceed and view the START & STOP management interface?'
              : 'Confermi di voler accedere al menu di gestione START & STOP per operare sui controlli di esecuzione?'}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-900/90 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg font-bold uppercase text-xs transition-colors cursor-pointer"
          >
            {isEn ? 'NO, KEEP CURRENT VIEW' : 'ANNULLA E RIMANI QUI'}
          </button>

          <button
            type="button"
            id="confirm-start-stop-access-btn"
            onClick={onConfirm}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-wider rounded-lg border-2 border-red-400 shadow-xl shadow-red-950/60 transition-all cursor-pointer flex items-center justify-center gap-2 group"
          >
            <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            <span>{isEn ? 'YES, ACCESS START & STOP' : 'CONFERMA E VAI A START & STOP'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartStopConfirmationModal;
