import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import {
  Clock,
  Calendar,
  Lock,
  Unlock,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Timer,
  Zap,
  MapPin,
} from 'lucide-react';

export const CourseScheduleGateCard: React.FC = () => {
  const {
    language,
    courseStartSchedule,
    isCourseStarted,
    timeRemainingMs,
    updateCourseStartSchedule,
    setCourseGateEnabled,
    startCourseImmediately,
    resetCourseScheduleToFuture,
  } = useCourse();

  const isEn = language === 'en';

  // Format remaining time
  const totalSeconds = Math.floor(timeRemainingMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const [dateInput, setDateInput] = useState(courseStartSchedule.scheduledDate || '');
  const [timeInput, setTimeInput] = useState(courseStartSchedule.scheduledTime || '08:30');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const handleApplySchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateInput || !timeInput) return;
    updateCourseStartSchedule({
      scheduledDate: dateInput,
      scheduledTime: timeInput,
      isoTimestamp: `${dateInput}T${timeInput}:00`,
      isGateEnabled: true,
    });
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  const handleSetTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    const dStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
    const tStr = '08:30';
    setDateInput(dStr);
    setTimeInput(tStr);
    updateCourseStartSchedule({
      scheduledDate: dStr,
      scheduledTime: tStr,
      isoTimestamp: `${dStr}T${tStr}:00`,
      isGateEnabled: true,
    });
  };

  return (
    <div className="bg-neutral-900 border-4 border-orange-500 p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header with Live Gate Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-orange-500 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {isEn ? 'START SCHEDULE & PARTICIPANT GATE LOCK' : 'PROGRAMMAZIONE AVVIO & BLOCCO GATE DISCENTI'}
            </span>
            {!isCourseStarted ? (
              <span className="px-2 py-0.5 bg-red-950 border border-red-600 text-red-300 text-xs font-mono font-bold animate-pulse flex items-center gap-1">
                <Lock className="w-3 h-3 text-red-400" />
                {isEn ? 'COUNTDOWN ACTIVE (PARTICIPANTS BLOCKED)' : 'CONTO ALLA ROVESCIA ATTIVO (DISCENTI BLOCCATI)'}
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1">
                <Unlock className="w-3 h-3 text-emerald-400" />
                {isEn ? 'COURSE STARTED • FULL ACCESS' : 'CORSO AVVIATO • ACCESSO COMPLETO'}
              </span>
            )}
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">
            {isEn ? 'Course Date, Time & Launch Direction' : 'Data, Ora e Regia di Apertura Corso'}
          </h3>
          <p className="text-xs text-neutral-300 font-medium">
            {isEn
              ? 'Until the course reaches the scheduled start time, participants and the public view see exclusively the countdown timer.'
              : 'Finché il corso non raggiunge l\'orario stabilito, i discenti e la visuale pubblica vedono esclusivamente il conto alla rovescia e nient\'altro.'}
          </p>
        </div>

        {/* Live Remaining Time Box */}
        <div className="bg-neutral-950 border-2 border-neutral-700 p-3 flex flex-col items-center justify-center min-w-[170px] flex-shrink-0">
          <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">
            {!isCourseStarted ? (isEn ? 'OPENS IN:' : 'APERTURA TRA:') : (isEn ? 'STATUS:' : 'STATO:')}
          </span>
          {!isCourseStarted ? (
            <div className="text-lg sm:text-xl font-mono font-black text-orange-400">
              {days > 0 && `${days}${isEn ? 'd ' : 'g '}`}{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          ) : (
            <div className="text-sm font-mono font-black text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {isEn ? 'UNLOCKED' : 'SBLOCCATO'}
            </div>
          )}
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Date & Time Picker Form */}
        <form onSubmit={handleApplySchedule} className="lg:col-span-6 bg-neutral-950 border-2 border-neutral-800 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-mono font-bold text-neutral-300 uppercase flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-400" />
              {isEn ? 'SET EXACT DATE AND TIME' : 'IMPOSTA DATA E ORARIO PRECISO'}
            </span>
            {isSavedRecently && (
              <span className="text-xs font-mono text-emerald-400 font-bold animate-pulse">
                {isEn ? '✓ Schedule Updated!' : '✓ Orario Aggiornato!'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase mb-1">
                {isEn ? 'Start Date' : 'Giorno di Inizio'}
              </label>
              <input
                id="schedule-date-input"
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full bg-neutral-900 border-2 border-neutral-700 focus:border-orange-500 text-white font-mono text-xs px-3 py-2 outline-none font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase mb-1">
                {isEn ? 'Start Time (HH:MM)' : 'Ora di Inizio (HH:MM)'}
              </label>
              <input
                id="schedule-time-input"
                type="time"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="w-full bg-neutral-900 border-2 border-neutral-700 focus:border-orange-500 text-white font-mono text-xs px-3 py-2 outline-none font-bold"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              id="save-schedule-btn"
              type="submit"
              className="flex-1 py-2 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isEn ? 'SAVE SCHEDULE & ACTIVATE GATE' : 'SALVA ORARIO & ATTIVA GATE'}
            </button>

            <button
              id="set-tomorrow-btn"
              type="button"
              onClick={handleSetTomorrow}
              className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-mono uppercase transition-colors"
              title={isEn ? 'Automatically set to tomorrow at 08:30' : 'Imposta automaticamente a domani ore 08:30'}
            >
              {isEn ? 'Tomorrow 08:30' : 'Domani 08:30'}
            </button>
          </div>
        </form>

        {/* Right Column: Instant Testing & Master Bypass Controls */}
        <div className="lg:col-span-6 bg-neutral-950 border-2 border-neutral-800 p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-mono font-bold text-yellow-400 uppercase flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                {isEn ? 'QUICK COMMAND ACTIONS (PRESET & TEST)' : 'AZIONI RAPIDE DI REGIA (PRESET & TEST)'}
              </span>
            </div>

            <p className="text-[11px] font-mono text-neutral-400 leading-relaxed">
              {isEn
                ? 'Use these quick commands to test the countdown screen or immediately unlock the course for the entire classroom:'
                : 'Usa questi comandi rapidi per testare la schermata del conto alla rovescia o sbloccare immediatamente il corso per tutta l\'aula:'}
            </p>
          </div>

          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id="start-now-immediate-btn"
              type="button"
              onClick={startCourseImmediately}
              className="col-span-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs font-mono uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isEn ? 'START COURSE NOW (UNLOCK ALL)' : 'AVVIA CORSO ORA (SBLOCCA SUBITO TUTTI)'}</span>
            </button>

            <button
              id="preset-test-1min-btn"
              type="button"
              onClick={() => resetCourseScheduleToFuture(1)}
              className="py-2 px-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-orange-500 text-neutral-200 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Timer className="w-3.5 h-3.5 text-orange-400" />
              <span>{isEn ? 'Test: Start in 1 min' : 'Test: Inizio tra 1 min'}</span>
            </button>

            <button
              id="preset-test-15min-btn"
              type="button"
              onClick={() => resetCourseScheduleToFuture(15)}
              className="py-2 px-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-orange-500 text-neutral-200 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>{isEn ? 'Start in +15 min' : 'Inizio tra +15 min'}</span>
            </button>

            <button
              id="preset-test-1hour-btn"
              type="button"
              onClick={() => resetCourseScheduleToFuture(60)}
              className="py-2 px-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-orange-500 text-neutral-200 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              <span>{isEn ? 'Start in +1 Hour' : 'Inizio tra +1 Ora'}</span>
            </button>

            <button
              id="toggle-gate-enabled-btn"
              type="button"
              onClick={() => setCourseGateEnabled(!courseStartSchedule.isGateEnabled)}
              className={`py-2 px-2.5 border font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                courseStartSchedule.isGateEnabled
                  ? 'bg-red-950 hover:bg-red-900 border-red-700 text-red-300'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
            >
              {courseStartSchedule.isGateEnabled ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-red-400" />
                  <span>{isEn ? 'Gate: ACTIVE' : 'Gate: ATTIVO'}</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{isEn ? 'Gate: DISABLED' : 'Gate: DISATTIVATO'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
