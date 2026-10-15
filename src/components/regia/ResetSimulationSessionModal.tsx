import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Trash2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';

interface ResetSimulationSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetSimulationSessionModal: React.FC<ResetSimulationSessionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const {
    language,
    evaluations,
    simulatorPatients,
    courseMessages,
    timeMultiplier,
    activeDay,
    activeSlotIndex,
  } = useCourse();

  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const isEn = language === 'en';

  const evalsCount = (evaluations || []).length;
  const patientsWithFlags = (simulatorPatients || []).filter(
    (p) =>
      p.techChecklist?.preDone ||
      p.techChecklist?.intraDone ||
      p.techChecklist?.postDone ||
      p.readinessStatus === 'critical' ||
      Boolean(p.criticalityNotes)
  ).length;
  const messagesCount = (courseMessages || []).length;

  const handleExecuteReset = () => {
    if (!hasConfirmedCheckbox) return;
    setIsResetting(true);
    setTimeout(() => {
      onConfirm();
      setIsResetting(false);
      setHasConfirmedCheckbox(false);
      onClose();
    }, 250);
  };

  const handleModalClose = () => {
    setHasConfirmedCheckbox(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn font-mono"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isResetting) handleModalClose();
      }}
    >
      <div className="bg-neutral-950 border-2 border-red-500 rounded-xl max-w-2xl w-full shadow-2xl shadow-red-950/70 overflow-hidden relative">
        {/* Hazard Diagonal Stripe Bar */}
        <div className="h-2.5 w-full bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_12px,#7f1d1d_12px,#7f1d1d_24px)] border-b border-red-500/50" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-start justify-between gap-3 bg-neutral-900/90">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-red-950 text-red-300 border border-red-600/80 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded flex items-center gap-1.5 shadow-xs">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>{isEn ? 'MISSION CONTROL REGIA • SIMULATION STATE' : 'REGIA OPERATIVA • STATO SIMULAZIONE'}</span>
              </span>

              <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-500/70 text-[10px] sm:text-[11px] font-bold uppercase rounded flex items-center gap-1">
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>{isEn ? 'SESSION STATE RESET' : 'AZZERAMENTO SESSIONE'}</span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 pt-1">
              <span>{isEn ? 'RESET SIMULATION SESSION' : 'RESET SESSIONE DI SIMULAZIONE'}</span>
            </h3>
            <p className="text-xs text-neutral-400 font-sans">
              {isEn
                ? 'Clear temporary team evaluation scores and non-essential runtime flags while strictly preserving core master data.'
                : 'Azzera i punteggi temporanei e i flag di sessione preservando tassativamente l\'anagrafica e le configurazioni master.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            disabled={isResetting}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
            title={isEn ? 'Cancel' : 'Annulla'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Active Session Telemetry Snapshot */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-2 flex items-center justify-between">
              <span>{isEn ? 'CURRENT SESSION TELEMETRY FLAGS' : 'TELEMETRIA FLAG SESSIONE IN CORSO'}</span>
              <span className="text-neutral-500 font-mono">Day 0{activeDay} • Slot #{activeSlotIndex + 1}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                <div className="text-lg font-black text-amber-400 font-mono">{evalsCount}</div>
                <div className="text-[10px] text-neutral-400">{isEn ? 'Team Scores' : 'Punteggi Squadre'}</div>
              </div>
              <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                <div className="text-lg font-black text-cyan-400 font-mono">{patientsWithFlags}</div>
                <div className="text-[10px] text-neutral-400">{isEn ? 'Tech Checklists' : 'Checklist Manichini'}</div>
              </div>
              <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                <div className="text-lg font-black text-red-400 font-mono">{messagesCount}</div>
                <div className="text-[10px] text-neutral-400">{isEn ? 'Session Alerts' : 'Allarmi / Messaggi'}</div>
              </div>
              <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                <div className="text-lg font-black text-orange-400 font-mono">{timeMultiplier}x</div>
                <div className="text-[10px] text-neutral-400">{isEn ? 'Time Speed' : 'Velocità Tempo'}</div>
              </div>
            </div>
          </div>

          {/* Dual Panel: PRESERVED vs CLEARED */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Preserved Core Data */}
            <div className="bg-emerald-950/20 border border-emerald-600/50 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[11px] pb-1 border-b border-emerald-800/50">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{isEn ? 'PRESERVED (CORE DATA)' : 'DATI MANTENUTI (CONFIG MASTER)'}</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-neutral-300 font-sans">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong>60 Discenti</strong> (DISC-01 – DISC-60, matricole, ruoli e gruppi ALPHA-DELTA)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong>12 Faculty Tutor</strong> (FAC-01 – FAC-12 e assegnazioni didattiche 1:1)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong>12 Tecnici</strong> (TECH-01 – TECH-12 e postazioni TCCC/Shock Room/WS)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong>12 Squadre</strong>, Direzione, Regia e Ospiti accreditati</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong>24 Scenari Clinici</strong>, Catalogo Protesi, lesioni e dinamiche</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Cronoprogramma</strong> e rotazioni speculari Day 2 / Day 3</span>
                </li>
              </ul>
            </div>

            {/* Cleared Non-Essential Flags */}
            <div className="bg-red-950/25 border border-red-600/60 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase text-[11px] pb-1 border-b border-red-800/50">
                <Trash2 className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{isEn ? 'CLEARED (SESSION FLAGS)' : 'DATI AZZERATI (SESSIONE CORRENTE)'}</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-neutral-300 font-sans">
                <li className="flex items-start gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Punteggi Squadre</strong> e schede di valutazione Faculty (ABCDE, skills, teamwork, SBAR)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Checklist simulatori</strong> (Pre, Intra, Post) e note di criticità tecnica</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Allarmi e messaggi</strong> di broadcast generati durante la simulazione</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Log di avanzamento</strong> timeline e storici di shift fase</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Acceleratore</strong> ripristinato a velocità reale 1x e stop timer</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Timer di fase</strong> reimpostato alla durata nominale della fase attiva</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mandatory Checkbox Confirmation */}
          <div className="p-3.5 bg-neutral-900 border-2 border-red-500/70 rounded-lg space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConfirmedCheckbox}
                onChange={(e) => setHasConfirmedCheckbox(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
              />
              <span className="text-[11px] font-bold text-neutral-200 font-sans leading-relaxed select-none">
                {isEn
                  ? 'I understand that this action will purge temporary simulation session scores, debriefing notes, and checklist flags. Core registers (Discenti, Faculty, Tech, Scenarios) will remain intact.'
                  : 'Dichiaro di aver compreso che questa azione azzererà i punteggi temporanei di squadra, le schede di valutazione e le checklist della sessione. L\'anagrafica discenti, faculty, tecnici e gli scenari rimarranno intatti.'}
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>
              {isEn
                ? 'Mandatory confirmation required to execute reset.'
                : 'Conferma obbligatoria richiesta per procedere.'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isResetting}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-xs uppercase rounded transition-colors cursor-pointer"
            >
              {isEn ? 'Cancel / Keep Data' : 'Annulla / Mantieni'}
            </button>

            <button
              type="button"
              onClick={handleExecuteReset}
              disabled={!hasConfirmedCheckbox || isResetting}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded border border-red-400 flex items-center gap-2 shadow-lg shadow-red-950/60 transition-all cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>
                {isResetting
                  ? (isEn ? 'RESETTING...' : 'AZZERAMENTO...')
                  : (isEn ? 'CONFIRM RESET SIMULATION' : 'CONFERMA RESET SESSIONE')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
