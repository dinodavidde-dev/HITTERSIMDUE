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
  const { activeDay, setActiveDay, setActiveSlotIndex } = useCourse();

  if (readOnly) {
    return (
      <div className={`flex items-center bg-neutral-950 px-2.5 py-1 border border-neutral-700 shadow-md rounded-none ${className}`}>
        <span className="text-[11px] font-mono text-yellow-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-yellow-400" />
          <span>GIORNO 0{activeDay} ({activeDay === 2 ? 'Day 2' : 'Day 3'})</span>
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
        <span className="hidden xs:inline">GIORNO:</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleSelectDay(2)}
          className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 font-mono text-xs font-black cursor-pointer transition-colors flex items-center gap-1 rounded-sm ${
            activeDay === 2
              ? activeBg
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
          title="Seleziona Giorno 2 di Corso"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>DAY 02</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelectDay(3)}
          className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 font-mono text-xs font-black cursor-pointer transition-colors flex items-center gap-1 rounded-sm ${
            activeDay === 3
              ? activeBg
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
          title="Seleziona Giorno 3 di Corso"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>DAY 03</span>
        </button>
      </div>
    </div>
  );
};
