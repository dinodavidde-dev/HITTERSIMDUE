import React, { useState, useMemo } from 'react';
import { Moon, Radio, Zap, Clock, ShieldAlert, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { playBroadcastSound } from '../../utils/audio';

interface RegiaMascalCountdownBadgeProps {
  className?: string;
  variant?: 'topbar' | 'board';
}

export const RegiaMascalCountdownBadge: React.FC<RegiaMascalCountdownBadgeProps> = ({
  className = '',
  variant = 'topbar',
}) => {
  const {
    activeDay,
    setActiveDay,
    activeSlotIndex,
    setActiveSlotIndex,
    currentSlot,
    timerSeconds,
    resetTimer,
    language,
    courseStartSchedule,
    timeRemainingMs,
    isCourseStarted,
  } = useCourse();

  const isEn = language === 'en';
  const [justJumped, setJustJumped] = useState(false);

  // Trova lo slot ufficiale del MASCAL Day 1 (21:00 - 23:00)
  const mascalSlotIndex = useMemo(() => {
    return INITIAL_TIMELINE_SLOTS.findIndex((s) => s.id === 'd2-mascal-scenario');
  }, []);

  const mascalSlot = useMemo(() => {
    return mascalSlotIndex >= 0 ? INITIAL_TIMELINE_SLOTS[mascalSlotIndex] : null;
  }, [mascalSlotIndex]);

  // Calcolo dello stato operativo rispetto a MASCAL
  const isMascalActive = currentSlot?.id === 'd2-mascal-scenario';
  const isMascalPreAlert = currentSlot?.id === 'd2-gate-discenti-notturno'; // 20:30 - 21:00
  const isMascalStaffSetup = currentSlot?.id === 'd2-staff-briefing-notturno'; // 20:00 - 20:30

  // Calcolo delta tempo in minuti dallo slot corrente a MASCAL (21:00 = 1260 minuti)
  const mascalStartMinutes = 1260; // 21:00
  const currentSlotMinutes = currentSlot?.startMinutes ?? 540;

  const isBeforeMascalOnDay1 = activeDay === 1 && currentSlotMinutes < mascalStartMinutes;
  const isAfterMascalOnDay1 = activeDay === 1 && currentSlotMinutes >= 1380; // dopo le 23:00

  const timeRemainingLabel = useMemo(() => {
    // 1. Sincronizzazione con il Gate Apertura: se il corso non è ancora iniziato ed è attivo il countdown gate
    if (courseStartSchedule?.isGateEnabled && !isCourseStarted && timeRemainingMs > 0 && courseStartSchedule.scheduledDate) {
      const targetMascalDate = new Date(`${courseStartSchedule.scheduledDate}T21:00:00`).getTime();
      const diffMs = targetMascalDate - Date.now();
      if (diffMs > 0) {
        const totalSec = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        if (hours > 0) {
          return `T- ${hours}h ${String(mins).padStart(2, '0')}m`;
        }
        return `T- ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }

    if (isMascalActive) {
      const mins = Math.floor(timerSeconds / 60);
      const secs = timerSeconds % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (activeDay === 1 && isBeforeMascalOnDay1) {
      const deltaMin = mascalStartMinutes - currentSlotMinutes;
      const hours = Math.floor(deltaMin / 60);
      const mins = deltaMin % 60;
      if (hours > 0) {
        return `T- ${hours}h ${String(mins).padStart(2, '0')}m`;
      }
      return `T- ${mins}m 00s`;
    }

    if (isAfterMascalOnDay1) {
      return isEn ? 'COMPLETED' : 'CONCLUSA';
    }

    if (activeDay === 2) {
      return isEn ? 'DAY 1 COMPLETED' : 'DAY 1 CONCLUSA';
    }

    return '21:00';
  }, [isMascalActive, timerSeconds, activeDay, isBeforeMascalOnDay1, isAfterMascalOnDay1, currentSlotMinutes, isEn]);

  const handleQuickJump = () => {
    if (mascalSlotIndex === -1) return;

    // Cambia al Day 1 se attualmente in Day 2
    if (activeDay !== 1) {
      setActiveDay(1);
    }

    // Imposta lo slot attivo su MASCAL
    setActiveSlotIndex(mascalSlotIndex);

    // Se non era già attivo, resetta il timer a 120 minuti
    if (!isMascalActive && mascalSlot) {
      resetTimer(mascalSlot.durationMinutes * 60);
    }

    // Suono di conferma operativa
    playBroadcastSound('phase_change');

    setJustJumped(true);
    setTimeout(() => setJustJumped(false), 3000);
  };

  if (variant === 'board') {
    // Variante affiancata al Master Phase Timer all'interno della board
    return (
      <div
        className={`bg-gradient-to-br from-purple-950 via-neutral-900 to-indigo-950 border-2 ${
          isMascalActive
            ? 'border-purple-400 ring-2 ring-purple-500 shadow-xl shadow-purple-950/60 animate-pulse'
            : isMascalPreAlert
            ? 'border-amber-400 ring-1 ring-amber-400'
            : 'border-purple-600/70 hover:border-purple-400'
        } p-2.5 sm:p-3 text-center transition-all flex flex-col justify-between gap-1.5 font-mono ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-purple-300">
            <Moon className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {isEn ? 'DAY 1 MASCAL (21:00)' : 'MASCAL DAY 1 (21:00)'}
            </span>
          </div>

          {isMascalActive && (
            <span className="px-1.5 py-0.2 bg-red-600 text-white font-black text-[9px] uppercase tracking-wider rounded animate-ping">
              LIVE
            </span>
          )}
        </div>

        <div className="space-y-0.5">
          <div className="text-[9px] text-purple-300/80 uppercase font-bold">
            {isMascalActive
              ? isEn
                ? 'Session Time Remaining:'
                : 'Tempo Rimanente Esercitazione:'
              : isMascalPreAlert
              ? isEn
                ? '⚠️ T-15 Pre-Alert Active'
                : '⚠️ Pre-Allerta T-15 Attiva'
              : isEn
              ? 'Countdown to 21:00:'
              : 'Countdown alle 21:00:'}
          </div>
          <div
            className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
              isMascalActive
                ? 'text-purple-200 animate-pulse'
                : isMascalPreAlert
                ? 'text-amber-300'
                : 'text-purple-300'
            }`}
          >
            {timeRemainingLabel}
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickJump}
          className={`w-full py-1.5 px-2 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 border ${
            isMascalActive
              ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-300'
              : justJumped
              ? 'bg-emerald-600 text-white border-emerald-300'
              : 'bg-purple-900/80 hover:bg-purple-800 text-purple-200 border-purple-500 hover:text-white'
          }`}
          title={isEn ? 'Activate Day 2 MASCAL Slot (21:00 - 23:00)' : 'Attiva Slot MASCAL Day 2 (21:00 - 23:00)'}
        >
          {justJumped ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>{isEn ? 'ACTIVATED!' : 'ATTIVATO!'}</span>
            </>
          ) : isMascalActive ? (
            <>
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{isEn ? 'MASCAL IN PROGRESS' : 'MASCAL IN CORSO'}</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span>{isEn ? 'QUICK JUMP MASCAL' : 'QUICK JUMP MASCAL'}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Variante Topbar (Header di RegiaView)
  return (
    <div
      className={`bg-gradient-to-r from-purple-950/90 via-neutral-900/95 to-indigo-950/90 border-2 ${
        isMascalActive
          ? 'border-purple-400 ring-2 ring-purple-500 shadow-lg shadow-purple-950/60 animate-pulse'
          : isMascalPreAlert
          ? 'border-amber-400 ring-1 ring-amber-400'
          : 'border-purple-600/70'
      } px-2.5 py-1 flex items-center gap-2.5 shadow-md font-mono text-xs transition-all ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1 bg-purple-900/80 text-purple-300 border border-purple-500/80 rounded shrink-0">
          <Moon className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
        </div>

        <div className="leading-tight">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider">
              {isEn ? 'MASCAL 21:00-23:00' : 'MASCAL 21:00-23:00'}
            </span>
            {isMascalActive ? (
              <span className="px-1.5 py-0.2 bg-red-600 text-white font-black text-[9px] uppercase tracking-wider rounded animate-ping">
                LIVE
              </span>
            ) : isMascalPreAlert ? (
              <span className="px-1.5 py-0.2 bg-amber-500 text-black font-black text-[9px] uppercase tracking-wider rounded">
                PRE-ALERT
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-black text-purple-200">
            <Clock className="w-3 h-3 text-purple-400" />
            <span className="tabular-nums tracking-wide">{timeRemainingLabel}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        id="regia-mascal-quickjump-btn"
        onClick={handleQuickJump}
        className={`px-2.5 py-1 font-black text-[10px] sm:text-[11px] uppercase tracking-wider border rounded flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 ${
          isMascalActive
            ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-300'
            : justJumped
            ? 'bg-emerald-600 text-white border-emerald-300'
            : 'bg-purple-900/80 hover:bg-purple-800 text-purple-200 border-purple-500 hover:text-white'
        }`}
        title={isEn ? 'Quick Jump & Activate Day 2 MASCAL (21:00 - 23:00)' : 'Quick Jump e Attiva MASCAL Day 2 (21:00 - 23:00)'}
      >
        {justJumped ? (
          <>
            <CheckCircle2 className="w-3 h-3 text-white" />
            <span>{isEn ? 'ACTIVATED' : 'ATTIVATO'}</span>
          </>
        ) : isMascalActive ? (
          <>
            <Radio className="w-3 h-3 text-white animate-pulse" />
            <span>{isEn ? 'ACTIVE' : 'ATTIVO'}</span>
          </>
        ) : (
          <>
            <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
            <span>{isEn ? 'JUMP MASCAL' : 'JUMP MASCAL'}</span>
          </>
        )}
      </button>
    </div>
  );
};
