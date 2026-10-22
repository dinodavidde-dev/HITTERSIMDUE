import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  Users,
  Award,
  Wrench,
  ArrowRight,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import {
  validateChange,
  type SlotChangeProposal,
  type MinimalSlotState,
  type ScheduleValidationResult,
} from '../../schedule/scheduleValidator';

interface ChangePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: SlotChangeProposal | null;
  targetSlotName: string;
  currentDuration: number;
  currentStartMinutes: number;
  allSlots: MinimalSlotState[];
  onApplyChange: (proposal: SlotChangeProposal) => void;
}

export const ChangePreviewModal: React.FC<ChangePreviewModalProps> = ({
  isOpen,
  onClose,
  proposal,
  targetSlotName,
  currentDuration,
  currentStartMinutes,
  allSlots,
  onApplyChange,
}) => {
  const [hasVerifiedImpact, setHasVerifiedImpact] = useState<boolean>(false);

  // Calcolo validazione vincoli hard e soft
  const validation: ScheduleValidationResult = useMemo(() => {
    if (!proposal) return { isValid: true, hard: [], soft: [] };
    return validateChange(proposal, allSlots);
  }, [proposal, allSlots]);

  if (!isOpen || !proposal) return null;

  const newDuration = currentDuration + proposal.deltaMinutes;
  const currentEndMinutes = currentStartMinutes + currentDuration;
  const newEndMinutes = currentStartMinutes + newDuration;

  const formatMin = (m: number) => {
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  // Squadre e figure impattate
  const targetSlotObj = allSlots.find((s) => s.id === proposal.slotId);
  const impactedTeams = targetSlotObj?.assignedTeamIds || ['1', '2', '3'];
  const impactedFaculty = targetSlotObj?.assignedFacultyIds || ['FAC-01', 'FAC-02', 'FAC-03'];
  const impactedTechs = targetSlotObj?.assignedTechIds || ['TECH-01', 'TECH-02'];

  const canApply = validation.hard.length === 0 && hasVerifiedImpact;

  const handleApply = () => {
    if (!canApply) return;
    onApplyChange(proposal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-950 border-2 border-orange-500 max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative text-neutral-100 font-mono space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-orange-400 font-black">
                Pannello di Controllo Flessibilità
              </span>
              <h3 className="text-lg font-black uppercase text-white tracking-tight">
                ANTEPRIMA IMPATTO CRONOPROGRAMMA
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delta Orario & Confronto Proposto vs Attuale */}
        <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase block font-bold">Slot Selezionato</span>
            <span className="text-sm font-black text-white truncate block">{targetSlotName}</span>
          </div>

          <div>
            <span className="text-[10px] text-neutral-400 uppercase block font-bold">Durata</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-neutral-400 line-through text-xs">{currentDuration}m</span>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-sm font-black text-orange-400">
                {newDuration}m ({proposal.deltaMinutes > 0 ? `+${proposal.deltaMinutes}` : proposal.deltaMinutes}m)
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-neutral-400 uppercase block font-bold">Orario Proiettato</span>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold text-white">
              <span>{formatMin(currentStartMinutes)}</span>
              <span>➔</span>
              <span className="text-orange-300 font-black">{formatMin(newEndMinutes)}</span>
              <span className="text-neutral-500 text-[10px]">({formatMin(currentEndMinutes)})</span>
            </div>
          </div>
        </div>

        {/* Squadre e Personale Coinvolto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 bg-neutral-900/60 border border-neutral-800 rounded">
            <span className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1">
              <Users className="w-3 h-3" /> Squadre Coinvolte
            </span>
            <span className="text-white font-bold block mt-1">
              {impactedTeams.map((t) => `Squadra ${t}`).join(', ')}
            </span>
          </div>

          <div className="p-2.5 bg-neutral-900/60 border border-neutral-800 rounded">
            <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
              <Award className="w-3 h-3" /> Tutor / Faculty
            </span>
            <span className="text-white font-bold block mt-1">{impactedFaculty.join(', ')}</span>
          </div>

          <div className="p-2.5 bg-neutral-900/60 border border-neutral-800 rounded">
            <span className="text-[10px] text-pink-400 font-bold uppercase flex items-center gap-1">
              <Wrench className="w-3 h-3" /> Tecnici Simulazione
            </span>
            <span className="text-white font-bold block mt-1">{impactedTechs.join(', ')}</span>
          </div>
        </div>

        {/* Conflitti Hard (Bloccanti, Rossi) */}
        {validation.hard.length > 0 && (
          <div className="p-3 bg-red-950/90 border-2 border-red-600 rounded space-y-2 text-xs animate-pulse">
            <div className="flex items-center gap-1.5 text-red-300 font-black uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <span>CONFLITTI HARD RILEVATI ({validation.hard.length}) • MODIFICA BLOCCATA</span>
            </div>
            <div className="space-y-1.5">
              {validation.hard.map((err) => (
                <div key={err.id} className="p-2 bg-black/60 border border-red-800/80 rounded text-[11px] text-red-200">
                  <strong className="block text-red-300 font-black">{err.title}</strong>
                  <p className="mt-0.5 text-neutral-300">{err.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning Soft (Gialli, Forzabili) */}
        {validation.soft.length > 0 && (
          <div className="p-3 bg-amber-950/70 border border-amber-500 rounded space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-black uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>AVVISI SOFT ({validation.soft.length}) • FORZABILI CON VERIFICA</span>
            </div>
            <div className="space-y-1.5">
              {validation.soft.map((warn) => (
                <div key={warn.id} className="p-2 bg-black/50 border border-amber-800/80 rounded text-[11px] text-amber-200">
                  <strong className="block text-amber-300 font-bold">{warn.title}</strong>
                  <p className="mt-0.5 text-neutral-300">{warn.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {validation.hard.length === 0 && validation.soft.length === 0 && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-500/80 rounded flex items-center gap-2 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Nessun conflitto rilevato. La modifica a cascata preserva la linearità del cronoprogramma.</span>
          </div>
        )}

        {/* Checkbox Verifica */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 p-3 bg-neutral-900 border border-neutral-700 rounded cursor-pointer hover:border-neutral-600 transition-colors">
            <input
              type="checkbox"
              checked={hasVerifiedImpact}
              onChange={(e) => setHasVerifiedImpact(e.target.checked)}
              className="mt-0.5 accent-orange-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-neutral-200 font-bold leading-tight">
              Ho verificato l&apos;impatto sul cronoprogramma, sulle postazioni e sui tempi di turnaround didattici.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <span className="text-[10px] text-neutral-500 font-mono">
            {validation.hard.length > 0
              ? 'Risolvi i conflitti hard prima di applicare'
              : !hasVerifiedImpact
              ? 'Spunta la casella di verifica per procedere'
              : 'Pronto per l\'applicazione globale'}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold uppercase rounded border border-neutral-700 cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="button"
              disabled={!canApply}
              onClick={handleApply}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded transition-all flex items-center gap-1.5 ${
                canApply
                  ? 'bg-orange-500 hover:bg-orange-400 text-black shadow-lg cursor-pointer'
                  : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>APPLICA MODIFICA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
