import React from 'react';
import { useCourse } from '../context/CourseContext';
import { Zap, Play, Pause, RotateCcw, FastForward, Sliders, X, Gauge } from 'lucide-react';

interface SimulationQuickFloatingBarProps {
  onOpenFullModal: () => void;
}

export const SimulationQuickFloatingBar: React.FC<SimulationQuickFloatingBarProps> = ({ onOpenFullModal }) => {
  const {
    timeMultiplier,
    setTimeMultiplier,
    isTimerRunning,
    toggleTimer,
    timerSeconds,
    activeDay,
    activeSlotIndex,
  } = useCourse();

  // If time is 1x and user hasn't explicitly activated fast mode, we don't need to force show it
  // but if timeMultiplier > 1, we show a vivid status bar
  if (timeMultiplier <= 1) return null;

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      id="simulation-floating-quick-bar"
      className="fixed bottom-4 right-4 z-40 bg-neutral-950/95 border-2 border-orange-500 text-white shadow-2xl p-2.5 sm:px-4 sm:py-3 flex items-center gap-3 backdrop-blur-md animate-bounce-short"
    >
      {/* Pulse indicator */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-orange-500 text-black animate-pulse">
          <Zap className="w-4 h-4 fill-current" />
        </div>
        <div className="hidden sm:block">
          <div className="text-[10px] font-mono font-black text-orange-400 uppercase tracking-widest leading-tight">
            ⚡ ACCELERATORE TEMPO ATTIVO
          </div>
          <div className="text-xs font-mono font-black text-white">
            {timeMultiplier}x • G{activeDay} Fase {activeSlotIndex + 1} ({formatTimer(timerSeconds)})
          </div>
        </div>
      </div>

      {/* Speed Shortcuts */}
      <div className="flex items-center gap-1 border-x border-neutral-700 px-2">
        {[1, 5, 30, 60, 120].map((spd) => (
          <button
            key={spd}
            onClick={() => setTimeMultiplier(spd)}
            className={`px-1.5 py-1 text-[10px] font-mono font-black uppercase cursor-pointer border ${
              timeMultiplier === spd
                ? 'bg-orange-500 text-black border-orange-300 font-black'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border-neutral-700'
            }`}
            title={`Imposta velocità a ${spd}x`}
          >
            {spd}x
          </button>
        ))}
      </div>

      {/* Play / Pause */}
      <button
        onClick={toggleTimer}
        className={`p-1.5 border cursor-pointer ${
          isTimerRunning
            ? 'bg-amber-600 hover:bg-amber-500 text-black border-amber-400'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
        }`}
        title={isTimerRunning ? 'Metti in pausa' : 'Avvia timer'}
      >
        {isTimerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
      </button>

      {/* Open full modal */}
      <button
        onClick={onOpenFullModal}
        className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-orange-400 font-mono text-xs font-black uppercase border border-neutral-700 cursor-pointer flex items-center gap-1"
        title="Apri pannello di controllo simulazione completo"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span className="hidden md:inline">REGIA</span>
      </button>

      {/* Reset to 1x normal */}
      <button
        onClick={() => setTimeMultiplier(1)}
        className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
        title="Torna a velocità normale 1x"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
