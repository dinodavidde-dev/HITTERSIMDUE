import React from 'react';
import { useCourse } from '../../context/CourseContext';
import { Activity, Lock, Clock, AlertTriangle, Radio } from 'lucide-react';

export const formatGateCountdown = (ms: number, isEn: boolean = false) => {
  if (ms <= 0) return '00:00:00';
  const totalSecs = Math.floor(ms / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (days > 0) {
    return `${days}${isEn ? 'd' : 'g'} ${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

interface PreCoursePublicCountdownProps {
  customMessage?: string;
}

export const PreCoursePublicCountdown: React.FC<PreCoursePublicCountdownProps> = ({
  customMessage,
}) => {
  const { courseStartSchedule, timeRemainingMs, language, activeDay } = useCourse();
  const isEn = language === 'en';

  const isNightGate = courseStartSchedule?.gateMode === 'night' || courseStartSchedule?.scheduledTime === '20:30';
  const isDay3Gate = courseStartSchedule?.gateMode === 'day3';

  return (
    <div className={`border-2 sm:border-3 p-4 sm:p-8 md:p-10 rounded-xl shadow-2xl text-center space-y-4 sm:space-y-6 relative overflow-hidden font-mono ${
      isNightGate ? 'bg-neutral-950 border-red-600' : 'bg-neutral-950 border-amber-500'
    }`}>
      <div className={`absolute inset-0 pointer-events-none ${
        isNightGate
          ? 'bg-gradient-to-b from-red-600/15 via-transparent to-amber-500/10'
          : 'bg-gradient-to-b from-amber-500/10 via-transparent to-red-500/10'
      }`} />

      <div className="relative z-10 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {/* Header Corso in Primo Piano */}
        <div className="space-y-2 sm:space-y-3 pb-2 border-b border-neutral-800">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className={`inline-flex items-center gap-2 px-3 py-1 border rounded-full font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-sm ${
              isNightGate
                ? 'bg-red-950 border-red-500 text-red-300'
                : 'bg-red-950/80 border-red-600/70 text-red-400'
            }`}>
              <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>
                {isNightGate
                  ? (isEn ? 'TACTICAL NIGHT SESSION • MASCAL' : 'SESSIONE NOTTURNA TATTICA • MASCAL')
                  : (isEn ? 'OFFICIAL COURSE • INTUBATI EM' : 'CORSO UFFICIALE • INTUBATI EM')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px] sm:text-xs font-bold rounded flex items-center gap-1.5 shadow-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${isNightGate ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} />
                <span>DAY 0{activeDay}</span>
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 tracking-tight leading-tight uppercase filter drop-shadow">
              {isNightGate ? 'MASCAL NOTTURNO' : 'HITTER'}
            </h1>
            <p className="text-xs sm:text-sm md:text-base font-mono font-bold text-amber-300 tracking-wider uppercase">
              {isNightGate
                ? (isEn ? 'Mass Casualty Incident • Night Operation Phase' : 'Mass Casualty Incident • Operazione Notturna Congiunta')
                : 'High Intensive Training Trauma Emergency Response'}
            </p>
          </div>
        </div>

        {/* Stato Accesso & Titolo Countdown */}
        <div className="space-y-1">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 font-black text-[11px] sm:text-xs uppercase tracking-widest rounded shadow-md ${
            timeRemainingMs <= 0
              ? 'bg-amber-400 text-black animate-pulse'
              : 'bg-red-600 text-white animate-pulse'
          }`}>
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>
              {timeRemainingMs <= 0
                ? (isEn
                  ? 'GATE REACHED (00:00) • AWAITING REGIA AUTHORIZATION'
                  : 'GATE RAGGIUNTO (00:00) • IN ATTESA DI AUTORIZZAZIONE DALLA REGIA')
                : isNightGate
                ? (isEn ? 'GATE STATUS: CLOSED • OPENS AT 20:30' : 'STATO GATE: CHIUSO • APERTURA ORE 20:30')
                : isDay3Gate
                ? (isEn ? 'GATE STATUS: CLOSED • RESUMING AT 08:30' : 'STATO GATE: CHIUSO • RIPRESA ORE 08:30')
                : (isEn ? `GATE STATUS: CLOSED • OPENS AT ${courseStartSchedule?.scheduledTime || '08:30'}` : `STATO GATE: CHIUSO • APERTURA ORE ${courseStartSchedule?.scheduledTime || '08:30'}`)}
            </span>
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight pt-1 flex items-center justify-center gap-2">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
            <span>
              {timeRemainingMs <= 0
                ? (isEn ? 'GATE OPEN • AWAITING CONTROL ROOM AUTHORIZATION' : 'GATE APERTO • IN ATTESA DI AUTORIZZAZIONE DALLA REGIA')
                : isNightGate
                ? (isEn ? 'COUNTDOWN TO GATE OPENING (20:30)' : 'COUNTDOWN APERTURA GATE MASCAL (ORE 20:30)')
                : isDay3Gate
                ? (isEn ? 'DAY 3 OPENING COUNTDOWN (08:30)' : 'COUNTDOWN AVVIO DAY 3 (ORE 08:30)')
                : (isEn ? `GATE OPENING COUNTDOWN (${courseStartSchedule?.scheduledTime || '08:30'})` : `COUNTDOWN APERTURA GATE (ORE ${courseStartSchedule?.scheduledTime || '08:30'})`)}
            </span>
          </h2>
        </div>

        {/* Avviso Ufficiale Regia Orario Apertura */}
        <div className={`p-3.5 sm:p-5 rounded-lg shadow-lg max-w-xl mx-auto border-2 ${
          timeRemainingMs <= 0
            ? 'bg-amber-950/90 border-amber-400'
            : isNightGate
            ? 'bg-red-950/80 border-red-500'
            : 'bg-amber-950/80 border-amber-500'
        }`}>
          <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-300 uppercase tracking-widest block mb-1.5 flex items-center justify-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>
              {timeRemainingMs <= 0
                ? (isEn ? 'OFFICIAL STATUS • GATE OPEN • AWAITING REGIA START' : 'STATO UFFICIALE • GATE APERTO • IN ATTESA DI AUTORIZZAZIONE DALLA REGIA')
                : (isEn ? 'OFFICIAL CONTROL ROOM NOTICE • SCHEDULED OPENING' : 'AVVISO UFFICIALE REGIA • APERTURA PROGRAMMATA')}
            </span>
          </span>
          <p className="text-base sm:text-xl md:text-2xl font-black text-white uppercase tracking-wide leading-snug">
            {timeRemainingMs <= 0
              ? (isEn ? 'GATE REACHED • TIMELINE HELD BY REGIA' : 'GATE RAGGIUNTO • CORSO IN ATTESA SEGNALE REGIA')
              : isNightGate
              ? (isEn ? 'GATE OPENS AT 20:30 • MASCAL AT 21:00' : 'APERTURA GATE ORE 20:30 • AVVIO MASCAL ORE 21:00')
              : isDay3Gate
              ? (isEn ? 'DAY 3 RESUMES AT 08:30' : 'DAY 3 RIPRENDE ALLE ORE 08:30')
              : (isEn
                ? `COURSE STARTS AT ${courseStartSchedule?.scheduledTime || '08:30'}`
                : `IL CORSO AVVIA ALLE ORE ${courseStartSchedule?.scheduledTime || '08:30'}`)}
          </p>
          <p className="text-[11px] sm:text-xs font-mono text-amber-200 mt-1.5">
            {timeRemainingMs <= 0
              ? (isEn
                ? 'Countdown complete. All stations, teams, and faculty must remain on standby. The Control Room is authorizing the official launch.'
                : 'Countdown completato. Tutte le postazioni, squadre e tutor restano in standby attivo. La Regia sta autorizzando l\'avvio ufficiale.')
              : isNightGate
              ? (isEn
                ? 'Staff Convocated by 20:00 • All 60 Learners Joint Participation • Verbal instructions on scene'
                : 'Staff convocato entro le 20:00 • Tutti i 60 discenti partecipano congiuntamente • Istruzioni verbali all\'arrivo')
              : (isEn
                ? `Scheduled date: ${courseStartSchedule?.scheduledDate || 'Day 02'} • Day 0${activeDay} • Access reserved for registered participants`
                : `Data prevista: ${courseStartSchedule?.scheduledDate || 'Day 02'} • Giorno 0${activeDay} • Accesso riservato ai partecipanti registrati`)}
          </p>
        </div>

        {/* Box Countdown Live (visibile mentre il tempo residuo > 0) oppure Banner di Standby Autorizzazione al raggiungimento dello zero */}
        {timeRemainingMs > 0 ? (
          <div className={`py-4 sm:py-6 px-4 sm:px-8 rounded-xl shadow-inner inline-block my-1 sm:my-2 w-full max-w-md mx-auto border-2 ${
            isNightGate
              ? 'bg-neutral-900/95 border-red-500'
              : 'bg-neutral-900/95 border-amber-500/80'
          }`}>
            <span className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-1 flex items-center justify-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 ${isNightGate ? 'text-red-400' : 'text-amber-400'}`} />
              <span>
                {isNightGate
                  ? (isEn ? 'TIME REMAINING UNTIL GATE OPENING (20:30)' : 'TEMPO RIMANENTE APERTURA GATE (ORE 20:30)')
                  : isDay3Gate
                  ? (isEn ? 'TIME REMAINING UNTIL DAY 3 START (08:30)' : 'TEMPO RIMANENTE ALL\'AVVIO DEL DAY 3 (ORE 08:30)')
                  : (isEn ? `COUNTDOWN TO GATE OPENING (${courseStartSchedule?.scheduledTime || '08:30'})` : `COUNTDOWN ALL'APERTURA DEL GATE (ORE ${courseStartSchedule?.scheduledTime || '08:30'})`)}
              </span>
            </span>
            <div className={`text-3xl sm:text-5xl md:text-6xl font-mono font-black animate-pulse tracking-wider break-words ${
              isNightGate ? 'text-red-400' : 'text-amber-400'
            }`}>
              {formatGateCountdown(timeRemainingMs, isEn)}
            </div>
          </div>
        ) : (
          <div className="py-4 sm:py-6 px-4 sm:px-8 bg-amber-950/95 border-2 border-amber-400 rounded-xl shadow-2xl inline-block my-1 sm:my-2 w-full max-w-xl mx-auto animate-pulse">
            <div className="flex flex-col items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-black font-mono text-xs font-black uppercase tracking-widest rounded shadow">
                <Lock className="w-4 h-4 text-black" />
                <span>READY TO AUTHORIZE</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-300 uppercase tracking-wider text-center">
                {isEn ? '⚠️ AWAITING REGIA START AUTHORIZATION' : '⚠️ IN ATTESA DI AUTORIZZAZIONE DALLA REGIA'}
              </div>
              <p className="text-xs sm:text-sm font-mono text-amber-100 max-w-md text-center">
                {isEn
                  ? 'Countdown reached 00:00:00. The Control Room holds the master timeline and is preparing to authorize course launch.'
                  : 'Countdown completato a 00:00:00. La Regia detiene la timeline centrale e sta predisponendo l\'autorizzazione di avvio del corso.'}
              </p>
            </div>
          </div>
        )}

        {/* Direttiva Operativa */}
        <div className="pt-1 sm:pt-2 space-y-2">
          <p className="text-sm sm:text-lg md:text-xl font-black text-amber-300 uppercase tracking-wider italic">
            {customMessage ||
              (isNightGate
                ? (isEn
                  ? '"Present at Central Gate with complete tactical PPE and headlamp. Operational MASCAL instructions will be communicated verbally upon arrival."'
                  : '"Presentarsi al Gate Centrale con tenuta operativa completa e torcia frontale. Le istruzioni operative MASCAL saranno comunicate esclusivamente a voce all\'arrivo."')
                : isDay3Gate
                ? (isEn
                  ? '"Day 2 completed. Rest period active. Day 3 resumes at 08:30 with WS1, WS2 and clinical simulations."'
                  : '"Day 2 concluso. Riposo notturno attivo. Day 3 riprende alle ore 08:30 con WS1, WS2 e simulazioni cliniche."')
                : (isEn
                  ? '"Verify individual equipment, contact Faculty and align Teams. Awaiting official launch by Control Room."'
                  : '"Verifica dotazioni individuali, contatto con Faculty e allineamento Squadre. In attesa del lancio ufficiale da parte della Regia."'))}
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
