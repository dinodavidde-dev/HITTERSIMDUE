import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MoreVertical, Plus, Minus, Clock } from 'lucide-react';
import { type SlotChangeProposal, type MinimalSlotState } from '../../schedule/scheduleValidator';
import { type TimelineSlot } from '../../types';
import { ChangePreviewModal } from './ChangePreviewModal';
import { useCourse } from '../../context/CourseContext';

interface SlotActionsMenuProps {
  slot?: TimelineSlot;
  slotId?: string;
  slotTitle?: string;
  isFuture?: boolean;
  onInitiateChange?: (proposal: SlotChangeProposal) => void;
}

export const SlotActionsMenu: React.FC<SlotActionsMenuProps> = ({
  slot,
  slotId: explicitSlotId,
  slotTitle: explicitSlotTitle,
  isFuture: explicitIsFuture,
  onInitiateChange,
}) => {
  const { timelineSlots, applyScheduleModification, activeSlotIndex } = useCourse();

  const activeSlot = slot || timelineSlots.find((s) => s.id === explicitSlotId);
  const targetSlotId = explicitSlotId || activeSlot?.id || '';
  const targetSlotTitle = explicitSlotTitle || activeSlot?.title || 'Fase Corso';

  const [isOpen, setIsOpen] = useState(false);
  const [activeProposal, setActiveProposal] = useState<SlotChangeProposal | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const slotIndex = useMemo(() => {
    return timelineSlots.findIndex((s) => s.id === targetSlotId);
  }, [timelineSlots, targetSlotId]);

  const isFuture = explicitIsFuture !== undefined ? explicitIsFuture : slotIndex > activeSlotIndex;

  // Convert timelineSlots into MinimalSlotState for impact preview
  const minimalSlots: MinimalSlotState[] = useMemo(() => {
    return timelineSlots.map((s) => ({
      id: s.id,
      day: s.day,
      startMinutes: s.startMinutes || 0,
      durationMinutes: s.durationMinutes,
      title: s.title,
    }));
  }, [timelineSlots]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectDelta = (deltaMinutes: number, reason: string, type: 'extend' | 'reduce' | 'move' = 'extend') => {
    setIsOpen(false);
    const proposal: SlotChangeProposal = {
      slotId: targetSlotId,
      deltaMinutes,
      reason,
      requestedBy: 'REGIA-01',
      type,
    };

    if (onInitiateChange) {
      onInitiateChange(proposal);
    } else {
      setActiveProposal(proposal);
    }
  };

  const handleApplyProposal = async (proposal: SlotChangeProposal) => {
    setActiveProposal(null);
    await applyScheduleModification(proposal);
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer border border-transparent hover:border-neutral-700"
          title="Flessibilità Controllata: Estendi, Riduci o Sposta slot"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {isOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-1 w-56 bg-neutral-950 border-2 border-orange-500 rounded shadow-2xl z-50 py-1 font-mono text-xs text-neutral-100 animate-fadeIn"
          >
            <div className="px-3 py-1.5 text-[10px] text-orange-400 font-black uppercase border-b border-neutral-800 flex items-center justify-between">
              <span>Flessibilità Slot</span>
              <span className="text-neutral-500">⋯</span>
            </div>

            {/* Estensioni */}
            <div className="py-1 border-b border-neutral-800">
              <span className="px-3 py-0.5 text-[9px] text-neutral-500 uppercase block font-bold">
                Estendi Durata
              </span>
              <button
                type="button"
                onClick={() => handleSelectDelta(5, 'Prolungamento scenario per manovre salvavita', 'extend')}
                className="w-full text-left px-3 py-1.5 hover:bg-orange-950/60 hover:text-orange-300 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Estendi +5 min</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectDelta(10, 'Richiesta tempo aggiuntivo per debriefing', 'extend')}
                className="w-full text-left px-3 py-1.5 hover:bg-orange-950/60 hover:text-orange-300 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Estendi +10 min</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectDelta(15, 'Estensione per elevata complessità clinica', 'extend')}
                className="w-full text-left px-3 py-1.5 hover:bg-orange-950/60 hover:text-orange-300 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Estendi +15 min</span>
              </button>
            </div>

            {/* Riduzioni */}
            <div className="py-1 border-b border-neutral-800">
              <span className="px-3 py-0.5 text-[9px] text-neutral-500 uppercase block font-bold">
                Riduci Durata
              </span>
              <button
                type="button"
                onClick={() => handleSelectDelta(-5, 'Chiusura anticipata scenario', 'reduce')}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Minus className="w-3.5 h-3.5 text-amber-400" />
                <span>Riduci −5 min</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectDelta(-10, 'Recupero ritardo didattico sul programma', 'reduce')}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Minus className="w-3.5 h-3.5 text-amber-400" />
                <span>Riduci −10 min</span>
              </button>
            </div>

            {/* Sposta a orario (solo slot futuri) */}
            {isFuture && (
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => handleSelectDelta(15, 'Spostamento programmato fase futura', 'move')}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/60 text-cyan-300 hover:text-cyan-200 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sposta in avanti (+15m)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Impact Preview Modal with Hard/Soft Constraint Validation */}
      {activeProposal && activeSlot && (
        <ChangePreviewModal
          isOpen={Boolean(activeProposal)}
          onClose={() => setActiveProposal(null)}
          proposal={activeProposal}
          targetSlotName={targetSlotTitle}
          currentDuration={activeSlot.durationMinutes}
          currentStartMinutes={activeSlot.startMinutes || 0}
          allSlots={minimalSlots}
          onApplyChange={handleApplyProposal}
        />
      )}
    </>
  );
};
