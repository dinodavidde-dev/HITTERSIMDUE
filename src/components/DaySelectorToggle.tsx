import React from 'react';
import { useCourse } from '../context/CourseContext';
import { INITIAL_TIMELINE_SLOTS } from '../data/initialData';
import { Calendar, Sun, Moon } from 'lucide-react';

interface DaySelectorToggleProps {
  className?: string;
  variant?: 'regia' | 'public' | 'default';
  readOnly?: boolean;
}

export const DaySelectorToggle: React.FC<DaySelectorToggleProps> = ({
  className = '',
  variant = 'default',
  readOnly = false,
}) => {
  const { activeDay, setActiveDay, setActiveSlotIndex, language } = useCourse();
  const isEn = language === 'en';

  if (readOnly) {
    return (
      <div className={`flex items-center bg-neutral-950 px-2.5 py-1 border border-neutral-700 shadow-md rounded-none ${className}`}>
        <span className="text-[11px] font-mono text-yellow-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-yellow-400" />
          <span>{isEn ? `DAY 0${activeDay}` : `GIORNO 0${activeDay}`} ({activeDay === 2 ? '24 Ottobre' : activeDay === 3 ? '25 Ottobre' : 'Altra Gestione'})</span>
        </span>
      </div>
    );
  }

  const handleSelectDay = (day: 2 | 3) => {
    setActiveDay(day);
    const firstIdx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.day === day);
    if (firstIdx !== -1) {
      setActiveSlotIndex(firstIdx);
    }
  };

  const activeBg =
    variant === 'public'
      ? 'bg-orange-500 text-black font-black'
      : variant === 'regia'
      ? 'bg-pink-500 text-black font-black'
      : 'bg-yellow-500 text-black font-black';

  return (
    <div className={`flex items-center bg-neutral-950 p-1 border border-neutral-700 shadow-md rounded ${className}`}>
      <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 font-bold px-1.5 sm:px-2 flex items-center gap-1 uppercase tracking-wider">
        <Calendar className="w-3.5 h-3.5 text-yellow-400" />
        <span className="hidden xs:inline">{isEn ? 'DAY:' : 'GIORNO:'}</span>
      </span>
      <div className="flex items-center gap-1">
        {/* Day 1: Altra Gestione (Teoria / Modulo Esterno Concluso) */}
        <div
          className="min-h-[38px] px-2 py-1.5 font-mono text-[10px] sm:text-xs font-bold text-neutral-500 bg-neutral-950/80 border border-neutral-800/80 rounded-sm flex items-center gap-1 cursor-help"
          title={isEn ? 'Day 1: Theoretical module managed externally (completed). Clinical simulation runs on Day 2 and Day 3.' : 'Day 1: Modulo teorico gestito esternamente (concluso). La simulazione clinica ad alta fedeltà opera su Day 2 e Day 3.'}
        >
          <span className="opacity-60">DAY 01</span>
          <span className="text-[9px] px-1 py-0.2 bg-neutral-800 text-neutral-400 rounded uppercase font-semibold">
            {isEn ? 'Ext' : 'Teoria'}
          </span>
        </div>

        {/* Day 2: 24 Ottobre */}
        <button
          type="button"
          onClick={() => handleSelectDay(2)}
          className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 font-mono text-xs font-black cursor-pointer transition-colors flex items-center gap-1 rounded-sm ${
            activeDay === 2
              ? activeBg
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
          title={isEn ? 'Select Course Day 2 (24 Oct) • Scenarios 1-12' : 'Seleziona Giorno 2 di Corso (24 Ottobre) • Scenari 1-12'}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>DAY 02 (24 OTT)</span>
        </button>

        {/* Day 3: 25 Ottobre */}
        <button
          type="button"
          onClick={() => handleSelectDay(3)}
          className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 font-mono text-xs font-black cursor-pointer transition-colors flex items-center gap-1 rounded-sm ${
            activeDay === 3
              ? activeBg
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
          title={isEn ? 'Select Course Day 3 (25 Oct) • Scenarios 13-24 & Night MASCAL' : 'Seleziona Giorno 3 di Corso (25 Ottobre) • Scenari 13-24 & Notturno MASCAL'}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>DAY 03 (25 OTT)</span>
        </button>
      </div>
    </div>
  );
};
