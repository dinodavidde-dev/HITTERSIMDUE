import React from 'react';
import { useCourse } from '../../context/CourseContext';
import { Activity, Lock, Clock, AlertTriangle, Radio } from 'lucide-react';
import { DaySelectorToggle } from '../DaySelectorToggle';

export const formatGateCountdown = (ms: number, isEn: boolean = false) => {
  if (ms <= 0) return '00:00';
  const totalSecs = Math.floor(ms / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (days > 0) {
    return `${days}${isEn ? 'd' : 'g'} ${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }
  if (hours > 0) {
    return `${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

interface PreCoursePublicCountdownProps {
  customMessage?: string;
  showDaySelector?: boolean;
}

export const PreCoursePublicCountdown: React.FC<PreCoursePublicCountdownProps> = ({
  customMessage,
  showDaySelector = true,
}) => {
  const { courseStartSchedule, timeRemainingMs, language, activeDay } = useCourse();
  const isEn = language === 'en';

  return (
    <div className="bg-neutral-950 border-2 sm:border-3 border-amber-500 p-4 sm:p-8 md:p-10 rounded-xl shadow-2xl text-center space-y-4 sm:space-y-6 relative overflow-hidden font-mono">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-red-500/10 pointer-events-none" />

      <div className="relative z-10 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {/* Header Corso in Primo Piano */}
        <div className="space-y-2 sm:space-y-3 pb-2 border-b border-neutral-800">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-600/70 text-red-400 rounded-full font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-sm">
              <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>{isEn ? 'OFFICIAL COURSE • INTUBATI EM' : 'CORSO UFFICIALE • INTUBATI EM'}</span>
            </div>
            {showDaySelector && (
              <div className="flex items-center gap-2">
                <DaySelectorToggle variant="public" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 tracking-tight leading-tight uppercase filter drop-shadow">
              HITTER
            </h1>
            <p className="text-xs sm:text-sm md:text-base font-mono font-bold text-amber-300 tracking-wider uppercase">
              High Intensive Training Trauma Emergency Response
            </p>
          </div>
        </div>

        {/* Stato Accesso & Titolo Countdown */}
        <div className="space-y-1">
          <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-amber-500 text-black font-black text-[10px] sm:text-xs uppercase tracking-widest rounded shadow-sm">
            {isEn ? 'ACCESS STATUS: PRE-COURSE STANDBY' : 'STATO ACCESSO: PRE-CORSO IN STANDBY'}
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight pt-1">
            {isEn ? 'COURSE START COUNTDOWN' : 'COUNTDOWN AVVIO CORSO'}
          </h2>
        </div>

        {/* Avviso Ufficiale Regia Orario Apertura */}
        <div className="bg-amber-950/80 border-2 border-amber-500 p-3.5 sm:p-5 rounded-lg shadow-lg max-w-xl mx-auto">
          <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-300 uppercase tracking-widest block mb-1.5 flex items-center justify-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>{isEn ? 'OFFICIAL CONTROL ROOM NOTICE • SCHEDULED OPENING' : 'AVVISO UFFICIALE REGIA • APERTURA PROGRAMMATA'}</span>
          </span>
          <p className="text-base sm:text-xl md:text-2xl font-black text-white uppercase tracking-wide leading-snug">
            {isEn
              ? `COURSE STARTS AT ${courseStartSchedule?.scheduledTime || '08:30'}`
              : `IL CORSO AVVIA ALLE ORE ${courseStartSchedule?.scheduledTime || '08:30'}`}
          </p>
          <p className="text-[11px] sm:text-xs font-mono text-amber-200 mt-1.5">
            {isEn
              ? `Scheduled date: ${courseStartSchedule?.scheduledDate || 'Day 02'} • Day 0${activeDay} • Access reserved for registered participants`
              : `Data prevista: ${courseStartSchedule?.scheduledDate || 'Day 02'} • Giorno 0${activeDay} • Accesso riservato ai partecipanti registrati`}
          </p>
        </div>

        {/* Box Grande Countdown Live */}
        <div className="py-4 sm:py-6 px-4 sm:px-8 bg-neutral-900/95 border-2 border-amber-500/80 rounded-xl shadow-inner inline-block my-1 sm:my-2 w-full max-w-md mx-auto">
          <span className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-1 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEn ? 'TIME REMAINING UNTIL COURSE START' : "TEMPO RIMANENTE ALL'AVVIO DEL CORSO"}</span>
          </span>
          <div className="text-3xl sm:text-5xl md:text-6xl font-mono font-black text-amber-400 animate-pulse tracking-wider break-words">
            {formatGateCountdown(timeRemainingMs, isEn)}
          </div>
        </div>

        {/* Direttiva Operativa */}
        <div className="pt-1 sm:pt-2 space-y-2">
          <p className="text-sm sm:text-lg md:text-xl font-black text-amber-300 uppercase tracking-wider italic">
            {customMessage ||
              (isEn
                ? '"Verify individual equipment, contact Faculty and align Teams. Awaiting official launch by Control Room."'
                : '"Verifica dotazioni individuali, contatto con Faculty e allineamento Squadre. In attesa del lancio ufficiale da parte della Regia."')}
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs text-neutral-400 font-mono flex-wrap">
            <span className="inline-flex items-center gap-1 text-orange-400">
              <Radio className="w-3.5 h-3.5" />
              <span>{isEn ? 'Centralized Control Room Sync' : 'Sincronizzazione centralizzata Centrale Regia'}</span>
            </span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-400">
              {isEn ? 'Full operational views unlock automatically upon start' : 'Le visuali operative complete si sbloccheranno automaticamente con l\'avvio'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
