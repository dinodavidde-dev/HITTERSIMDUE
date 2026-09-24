import React from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Clock,
  Flame,
} from 'lucide-react';
import { getIncomingTcccScenarioDetails } from '../../utils/scenarioStatusHelper';

interface TcccPreAlertCountdownBannerProps {
  role?: 'regia' | 'direttore' | 'timeline';
  compact?: boolean;
}

export const TcccPreAlertCountdownBanner: React.FC<TcccPreAlertCountdownBannerProps> = ({
  role = 'direttore',
}) => {
  const {
    currentSlot,
    timerSeconds,
    isTimerRunning,
    activeDay,
    filteredSlots,
    activeSlotIndex,
    language,
  } = useCourse();

  const isEn = language === 'en';
  const details = getIncomingTcccScenarioDetails(currentSlot, filteredSlots);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.max(0, Math.floor(totalSeconds / 60));
    const secs = Math.max(0, totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formattedTime = formatTimer(timerSeconds);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="bg-neutral-950 border border-amber-400/90 rounded px-3 py-1.5 sm:px-4 sm:py-2 font-mono transition-all shadow-md shadow-amber-500/10"
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-1.5 md:gap-3">
        {/* Left / Main Notice & Bilingual specification */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap min-w-0">
          {/* Pulsing Beacon */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>

          {/* Pre-Alert Badge */}
          <span className="px-2 py-0.5 bg-amber-500 text-black font-black text-[10px] sm:text-[11px] uppercase tracking-wider rounded flex items-center gap-1 shrink-0 shadow-xs">
            <Flame className="w-3 h-3 fill-current" />
            <span>{isEn ? 'TCCC PRE-ALERT (T -15)' : 'PRE-ALLERTA TCCC (T -15)'}</span>
          </span>

          {/* Mandatory Bilingual Statement */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[11px] sm:text-xs">
            <span className="text-amber-200 font-bold flex items-center gap-1">
              <span>🇮🇹</span>
              <span>Mancano 15 minuti all&apos;inizio dello scenario</span>
            </span>
            <span className="text-amber-500/50 hidden sm:inline">•</span>
            <span className="text-amber-300/80 font-medium hidden sm:flex items-center gap-1 text-[11px]">
              <span>🇬🇧</span>
              <span>15 min to scenario start</span>
            </span>
          </div>

          {/* Incoming Details Chip */}
          {details && (
            <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-amber-300 bg-amber-950/50 border border-amber-800/60 px-2 py-0.5 rounded truncate max-w-md">
              <span className="text-white font-bold truncate">🎯 {details.nextScenarioTitle}</span>
              <span className="text-amber-400">• {details.tcccGroup}</span>
              <span className="text-neutral-400 font-mono">• CH3</span>
            </div>
          )}
        </div>

        {/* Right / Countdown Timer & Status */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 border-t md:border-t-0 border-neutral-800/80 pt-1 md:pt-0">
          {details && (
            <span className="text-[10px] text-amber-300/90 font-bold xl:hidden truncate max-w-[180px]">
              🎯 {details.tcccGroup.split(' ')[0]} • CH3
            </span>
          )}

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border rounded ${
                isTimerRunning
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-700'
              }`}
            >
              {isTimerRunning ? (isEn ? 'ACTIVE' : 'ATTIVO') : (isEn ? 'PAUSED' : 'PAUSA')}
            </span>

            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-900 border border-amber-400/80 rounded shadow-inner">
              <Clock className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
              <span className="text-sm sm:text-base font-black font-mono text-amber-300 tracking-wider">
                {formattedTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
