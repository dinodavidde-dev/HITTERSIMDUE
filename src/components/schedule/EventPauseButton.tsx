import React, { useState } from 'react';
import { Pause, Play, AlertOctagon, RotateCcw } from 'lucide-react';
import { PauseModal } from './PauseModal';
import { useCourse } from '../../context/CourseContext';
import { useOfflineSync } from '../../offline/useOfflineSync';

export const EventPauseButton: React.FC = () => {
  const { isTimerRunning, toggleTimer, timerSeconds } = useCourse();
  const { eventPauseState, pauseEvent, resumeEvent } = useOfflineSync();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isPaused = Boolean(eventPauseState?.isPaused);

  const handleConfirmPause = (reason: string, notes: string) => {
    // Se il timer era in corsa, mettilo in pausa nel context
    if (isTimerRunning) {
      toggleTimer();
    }
    pauseEvent(reason, notes, 'REGIA-01', timerSeconds);
  };

  const handleResume = () => {
    resumeEvent('REGIA-01');
    // Se il timer era fermo a causa della pausa, riavvialo
    if (!isTimerRunning) {
      toggleTimer();
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isPaused ? (
          <div className="flex items-center gap-1.5 animate-pulse">
            <span className="px-2.5 py-1 bg-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-md border border-amber-300">
              <Pause className="w-3.5 h-3.5 fill-black" />
              <span>PAUSA EVENTO: {eventPauseState?.reason?.toUpperCase()}</span>
            </span>

            <button
              type="button"
              id="event-resume-btn"
              onClick={handleResume}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded border border-emerald-300 shadow-md transition-all cursor-pointer flex items-center gap-1"
              title="Riprendi lo svolgimento regolare dell'evento"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>RIPRENDI</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            id="event-pause-btn"
            onClick={() => setIsModalOpen(true)}
            className="px-2.5 py-1 bg-neutral-900 hover:bg-amber-950/80 text-amber-400 hover:text-amber-300 font-bold text-xs uppercase tracking-wider rounded border border-neutral-700 hover:border-amber-500 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Sospendi globalmente l'evento (Pausa controllata con audit log)"
          >
            <Pause className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PAUSA EVENTO</span>
          </button>
        )}
      </div>

      <PauseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmPause={handleConfirmPause}
      />
    </>
  );
};
