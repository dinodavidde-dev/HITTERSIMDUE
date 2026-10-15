import React, { useState } from 'react';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Bell,
  AlertTriangle,
  Clock,
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { translateSlot, translateLocation } from '../../utils/courseTranslation';
import { isPreAllertaTcccSlot } from '../../utils/scenarioStatusHelper';
import { ResetSimulationSessionModal } from './ResetSimulationSessionModal';

export const RegiaSimulaPanel: React.FC = () => {
  const {
    activeDay,
    setActiveDay,
    activeSlotIndex,
    setActiveSlotIndex,
    currentSlot,
    filteredSlots,
    isTimerRunning,
    timerSeconds,
    toggleTimer,
    resetTimer,
    adjustTimer,
    nextSlot,
    prevSlot,
    timeMultiplier,
    setTimeMultiplier,
    jumpToTimelinePoint,
    isCourseStarted,
    language,
    courseStartSchedule,
    updateCourseStartSchedule,
    resetSimulationSession,
    evaluations,
    simulatorPatients,
  } = useCourse();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const isEn = language === 'en';
  const isPreAllertaTccc = isPreAllertaTcccSlot(currentSlot);

  const evaluationsCount = (evaluations || []).length;
  const activeChecklistsCount = (simulatorPatients || []).filter(
    (p) =>
      p.techChecklist?.preDone ||
      p.techChecklist?.intraDone ||
      p.techChecklist?.postDone ||
      p.readinessStatus === 'critical' ||
      Boolean(p.criticalityNotes)
  ).length;

  const handleConfirmResetSession = () => {
    resetSimulationSession();
    setResetSuccessMessage(
      isEn
        ? 'Simulation session reset successfully! Temporary scores and checklist flags cleared. Core registers preserved.'
        : 'Sessione di simulazione azzerata con successo! Punteggi e checklist ripristinati. Anagrafica e scenari master preservati.'
    );
    setTimeout(() => {
      setResetSuccessMessage(null);
    }, 6000);
  };

  // Safety confirmation for timer toggles when course is live
  const handleToggleTimer = () => {
    if (isCourseStarted && isTimerRunning) {
      const confirmed = window.confirm(
        isEn
          ? 'WARNING: The course is currently ACTIVE. Confirm putting course timer on PAUSE?'
          : 'ATTENZIONE: Il corso è attualmente ATTIVO. Confermi di voler mettere in PAUSA il timer del corso?'
      );
      if (!confirmed) return;
    }
    toggleTimer();
  };

  const handleResetTimer = () => {
    if (isCourseStarted) {
      const confirmed = window.confirm(
        isEn
          ? 'WARNING: The course is currently ACTIVE. Confirm resetting timer to 00:00?'
          : 'ATTENZIONE: Il corso è attualmente ATTIVO. Confermi di voler azzerare il timer della fase?'
      );
      if (!confirmed) return;
    }
    resetTimer();
  };

  const handleRevertPhase = () => {
    if (activeSlotIndex <= 0) return;
    const confirmed = window.confirm(
      isEn
        ? 'Confirm reverting to previous timeline phase?'
        : 'Confermi di voler tornare alla fase precedente della timeline?'
    );
    if (!confirmed) return;
    prevSlot();
  };

  const currentFilteredIndex = filteredSlots.findIndex((s) => s.id === currentSlot?.id);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalSlotSeconds = (currentSlot?.durationMinutes || 30) * 60;
  const remainingSeconds = Math.max(0, totalSlotSeconds - timerSeconds);
  const progressPercent = Math.min(100, Math.max(0, (timerSeconds / totalSlotSeconds) * 100));

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner: SIMULA ENGINE BANNER */}
      <div className="bg-neutral-950 border-2 border-orange-500 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-orange-600 text-black font-black text-xs px-3 py-1 font-mono uppercase tracking-wider">
          {isEn ? 'MISSION CONTROL • SIMULATION ENGINE' : 'CENTRALE REGIA • MOTORE SIMULAZIONE'}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 text-black rounded border border-orange-300 shadow-md">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block">
                {isEn ? 'REGIA SIMULATION & TIMELINE MANAGEMENT' : 'GESTIONE REGIA • MENU SIMULA'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>{isEn ? 'SIMULA: AUTOMATION & DIRECTION TIMELINE' : 'SIMULA: AUTOMAZIONE & CONTROLLO DIREZIONE'}</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isEn
                  ? 'Integrated hub for Course Automation, Speed Multipliers, and Advanced Timeline Direction Control.'
                  : 'Hub integrato per Automazione Corso, Moltiplicatori di Velocità e Controllo Timeline Direzione.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 font-bold rounded">
              DAY 0{activeDay}
            </span>
            <span className={`px-3 py-1.5 text-xs font-black uppercase rounded flex items-center gap-1.5 ${
              isTimerRunning ? 'bg-emerald-600 text-white animate-pulse' : 'bg-neutral-800 text-neutral-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-white' : 'bg-neutral-500'}`} />
              {isTimerRunning ? (isEn ? 'SIMULATION RUNNING' : 'SIMULAZIONE ATTIVA') : (isEn ? 'PAUSED' : 'IN PAUSA')}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: CONTROLLO TIMELINE DIREZIONE */}
      <div className="bg-neutral-900 border-2 border-yellow-500/80 p-5 sm:p-6 shadow-xl space-y-5 rounded">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500 text-black font-black rounded shadow">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">
                {isEn ? 'MASTER DIRECTION INTERFACE' : 'INTERFACCIA MASTER DIREZIONE'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white uppercase">
                {isEn ? 'CONTROLLO TIMELINE DIREZIONE' : 'CONTROLLO TIMELINE DIREZIONE'}
              </h3>
            </div>
          </div>

          <div className="text-right self-start sm:self-auto">
            <span className="text-[10px] text-neutral-400 uppercase block font-bold">
              {isEn ? 'Phase Position:' : 'Posizione Fase:'}
            </span>
            <span className="text-sm font-mono font-black text-yellow-400">
              {activeSlotIndex + 1} / {INITIAL_TIMELINE_SLOTS.length}
            </span>
          </div>
        </div>

        {/* Current Active Phase Synoptic Card */}
        <div className="bg-neutral-950 border border-neutral-800 p-4 rounded space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-yellow-500 text-black font-black text-xs uppercase rounded">
                {isEn ? 'ACTIVE PHASE' : 'FASE ATTIVA'}: #{activeSlotIndex + 1}
              </span>
              <span className="text-white font-black text-sm sm:text-base">
                {currentSlot?.title}
              </span>
              <span className="text-neutral-400 text-xs">
                ({currentSlot?.timeRange})
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-neutral-400">{isEn ? 'Duration:' : 'Durata:'} <strong className="text-yellow-400">{currentSlot?.durationMinutes} min</strong></span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400">{isEn ? 'Remaining:' : 'Rimanente:'} <strong className="text-emerald-400">{formatTimer(remainingSeconds)}</strong></span>
            </div>
          </div>

          {/* Group Synoptic for current phase */}
          {currentSlot?.groupActivities && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {(['A', 'B', 'C', 'D'] as const).map((grp) => {
                const act = currentSlot.groupActivities[grp];
                if (!act) return null;
                const isTccc = act.activityType === 'scenario_extra' || act.title.toLowerCase().includes('tccc');
                const isShock = act.activityType === 'scenario_intra' || act.title.toLowerCase().includes('shock');
                const isWs = act.activityType === 'workshop' || act.title.toLowerCase().includes('workshop') || act.title.toLowerCase().includes('skills');

                return (
                  <div
                    key={grp}
                    className={`p-2.5 border rounded text-xs space-y-1 ${
                      isTccc ? 'bg-amber-950/40 border-amber-600/70 text-amber-200' :
                      isShock ? 'bg-red-950/40 border-red-600/70 text-red-200' :
                      isWs ? 'bg-cyan-950/40 border-cyan-600/70 text-cyan-200' :
                      'bg-neutral-900 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-black">
                      <span>{isEn ? `GROUP ${grp}` : `GRUPPO ${grp}`}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-black/60 rounded uppercase font-mono">
                        {act.activityType}
                      </span>
                    </div>
                    <div className="font-bold text-white truncate text-[11px]">{act.title}</div>
                    <div className="text-[10px] text-neutral-400 truncate">📍 {act.location}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Phase Direction Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Step Backward / Revert / Step Forward */}
          <div className="md:col-span-6 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={prevSlot}
              disabled={activeSlotIndex <= 0}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white disabled:opacity-40 font-bold text-xs uppercase border border-neutral-700 rounded flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              title={isEn ? 'Step backward to previous phase' : 'Torna indietro alla fase precedente'}
            >
              <ChevronLeft className="w-4 h-4 text-yellow-400" />
              <span>{isEn ? 'PREV PHASE' : 'FASE PREC'}</span>
            </button>

            <button
              type="button"
              onClick={handleRevertPhase}
              disabled={activeSlotIndex <= 0}
              className="px-3 py-2 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-600/80 disabled:opacity-40 font-bold text-xs uppercase rounded flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              title={isEn ? 'Revert last milestone / phase with confirmation' : 'Revert ultima fase con conferma'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'REVERT PHASE' : 'REVERT FASI'}</span>
            </button>

            <button
              type="button"
              onClick={nextSlot}
              disabled={activeSlotIndex >= INITIAL_TIMELINE_SLOTS.length - 1}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black disabled:opacity-40 font-black text-xs uppercase border border-yellow-300 rounded flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              title={isEn ? 'Advance to next phase' : 'Avanza alla fase successiva'}
            >
              <span>{isEn ? 'NEXT PHASE' : 'FASE SUCCESSIVA'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Jump Direct Dropdown */}
          <div className="md:col-span-6 flex items-center gap-2">
            <label htmlFor="simula-jump-phase" className="text-xs font-bold text-neutral-400 whitespace-nowrap">
              {isEn ? 'Jump To Phase:' : 'Vai Direttamente a Fase:'}
            </label>
            <select
              id="simula-jump-phase"
              value={currentFilteredIndex >= 0 ? currentFilteredIndex : 0}
              onChange={(e) => {
                const localIdx = Number(e.target.value);
                const targetSlot = filteredSlots[localIdx];
                if (targetSlot) {
                  const globalIdx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.id === targetSlot.id);
                  if (globalIdx !== -1) setActiveSlotIndex(globalIdx);
                }
              }}
              className="w-full bg-neutral-950 border border-neutral-700 text-yellow-300 font-mono text-xs px-2.5 py-2 rounded focus:outline-none focus:border-yellow-400 truncate cursor-pointer font-bold"
            >
              {filteredSlots.map((s, idx) => (
                <option key={s.id} value={idx}>
                  #{idx + 1} ({s.timeRange}): {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: AUTOMAZIONE CORSO & ACCELERATORE TEMPO */}
      <div className="bg-neutral-900 border-2 border-orange-500/80 p-5 sm:p-6 shadow-xl space-y-5 rounded">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 text-black font-black rounded shadow">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                {isEn ? 'TIME ACCELERATOR & STRESS TEST ENGINE' : 'ACCELERATORE TEMPO & MOTORE STRESS TEST'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white uppercase">
                {isEn ? 'AUTOMAZIONE CORSO' : 'AUTOMAZIONE CORSO'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400 uppercase">{isEn ? 'Current Speed:' : 'Velocità Attuale:'}</span>
            <span className="px-2.5 py-1 bg-orange-600 text-black font-black text-xs rounded">
              {timeMultiplier}x
            </span>
          </div>
        </div>

        {/* Live Timer HUD & Controls */}
        <div className="bg-neutral-950 border border-neutral-800 p-4 rounded grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
              {isEn ? 'ACTIVE PHASE TIMER:' : 'TIMER FASE ATTIVA:'}
            </span>
            <div className="flex items-center gap-2.5">
              <span className={`text-3xl sm:text-4xl font-mono font-black ${isPreAllertaTccc ? 'text-amber-400 animate-pulse' : 'text-orange-400'}`}>
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-neutral-500 text-xs font-mono">
                / {currentSlot?.durationMinutes || 30}:00
              </span>
            </div>
            {isPreAllertaTccc && (
              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 mt-1 animate-pulse">
                ⚠️ {isEn ? 'TCCC PRE-ALERT (T -15)' : 'PRE-ALLERTA TCCC ATTIVA (T -15)'}
              </span>
            )}
          </div>

          {/* Quick Play/Pause & Reset */}
          <div className="flex items-center justify-start md:justify-center gap-2">
            <button
              type="button"
              onClick={handleToggleTimer}
              className={`px-4 py-2.5 rounded font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                isTimerRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-black'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isTimerRunning ? (isEn ? 'PAUSE' : 'PAUSA') : (isEn ? 'START' : 'AVVIA')}</span>
            </button>

            <button
              type="button"
              onClick={handleResetTimer}
              className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded font-bold text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
          </div>

          {/* Incremental Adjusters */}
          <div className="flex items-center justify-start md:justify-end gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => adjustTimer(-60)}
              className="px-2.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 rounded text-xs font-bold cursor-pointer"
              title="-1 minuto"
            >
              -1m
            </button>
            <button
              type="button"
              onClick={() => adjustTimer(60)}
              className="px-2.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-orange-300 border border-neutral-700 rounded text-xs font-bold cursor-pointer"
              title="+1 minuto"
            >
              +1m
            </button>
            <button
              type="button"
              onClick={() => adjustTimer(300)}
              className="px-2.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-orange-400 border border-neutral-700 rounded text-xs font-bold cursor-pointer"
              title="+5 minuti"
            >
              +5m
            </button>
          </div>
        </div>

        {/* Speed Multipliers Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
            {isEn ? 'SELECT SIMULATION SPEED MULTIPLIER:' : 'SELEZIONA MOLTIPLICATORE VELOCITÀ SIMULAZIONE:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {[1, 2, 5, 10, 15, 30, 60, 120].map((spd) => {
              const isSelected = timeMultiplier === spd;
              return (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setTimeMultiplier(spd)}
                  className={`p-2.5 text-center rounded border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-950 text-orange-300 font-black shadow-lg ring-1 ring-orange-400'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <div className="font-mono font-black text-sm">{spd}x</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    {spd === 1 ? (isEn ? 'Real' : 'Reale') : `${spd}x`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Critical Milestones Jump */}
        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
            {isEn ? 'QUICK JUMP TO CRITICAL SIMULATION POINTS:' : 'SALTO RAPIDO AI PUNTI CRITICI DELLA SIMULAZIONE:'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => jumpToTimelinePoint('pre_start_15m')}
              className="p-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500 text-left rounded cursor-pointer transition-all space-y-1"
            >
              <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEn ? 'TEST 15 MIN ALERT' : 'TEST AVVISO 15 MIN'}</span>
              </div>
              <p className="text-[10px] text-neutral-400">
                {isEn ? 'Set countdown to 15m to test pre-course banner' : 'Countdown a 15 min per test raduno discenti'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => jumpToTimelinePoint('pre_start_5m')}
              className="p-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-red-500 text-left rounded cursor-pointer transition-all space-y-1"
            >
              <div className="font-bold text-xs text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>{isEn ? 'TEST 5 MIN ALERT' : 'TEST ALLERTA 5 MIN'}</span>
              </div>
              <p className="text-[10px] text-neutral-400">
                {isEn ? 'Set countdown to 5m to test red urgency' : 'Countdown a 5 min per test urgenza rossa'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                // Find Blocco 1 TCCC slot
                const b1Idx = filteredSlots.findIndex((s) => s.title.toLowerCase().includes('blocco 1') || s.title.toLowerCase().includes('tccc'));
                if (b1Idx !== -1) setActiveSlotIndex(b1Idx);
              }}
              className="p-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-cyan-500 text-left rounded cursor-pointer transition-all space-y-1"
            >
              <div className="font-bold text-xs text-cyan-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>BLOCCO 1 (09:00)</span>
              </div>
              <p className="text-[10px] text-neutral-400">
                {isEn ? 'Jump to Block 1 TCCC / WS start' : 'Salto all\'avvio del Blocco 1 (TCCC & WS)'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                // Find Handover slot
                const hoIdx = filteredSlots.findIndex((s) => s.title.toLowerCase().includes('handover'));
                if (hoIdx !== -1) setActiveSlotIndex(hoIdx);
              }}
              className="p-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-500 text-left rounded cursor-pointer transition-all space-y-1"
            >
              <div className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>HANDOVER (:30)</span>
              </div>
              <p className="text-[10px] text-neutral-400">
                {isEn ? 'Jump directly to :30 SBAR Handover' : 'Salto diretto all\'Handover SBAR barellato'}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: SESSION MANAGEMENT & STATE RESET */}
      <div className="bg-neutral-900 border-2 border-red-600/80 p-5 sm:p-6 shadow-xl space-y-5 rounded">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 text-white font-black rounded shadow">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                  {isEn ? 'SIMULATION SESSION STATE & RESET' : 'GESTIONE SESSIONE & AZZERAMENTO STATO'}
                </span>
                <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-500/70 text-[10px] font-bold uppercase rounded">
                  {isEn ? 'MISSION CONTROL' : 'CONTROLLO REGIA'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                {isEn
                  ? 'Purge transient session data (temporary team scores, evaluations, checklists) without touching master configuration data.'
                  : 'Azzera i dati di sessione (punteggi temporanei squadre, valutazioni, checklist) preservando le configurazioni master.'}
              </p>
            </div>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded border border-red-400 flex items-center gap-2 cursor-pointer shadow-lg shadow-red-950/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title={isEn ? 'Reset simulation session with confirmation' : 'Azzera sessione di simulazione con conferma obbligatoria'}
          >
            <RotateCcw className="w-4 h-4 text-white" />
            <span>{isEn ? 'RESET SIMULATION SESSION' : 'RESET SESSIONE DI SIMULAZIONE'}</span>
          </button>
        </div>

        {/* Success Feedback Banner */}
        {resetSuccessMessage && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500 text-emerald-200 rounded text-xs flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{resetSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setResetSuccessMessage(null)}
              className="text-emerald-400 hover:text-white text-xs font-bold uppercase cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Live Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                {isEn ? 'Active Team Scores / Evals' : 'Punteggi Squadre / Schede'}
              </span>
              <span className="text-base font-black text-amber-400 font-mono">
                {evaluationsCount} {isEn ? 'logged' : 'registrate'}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                evaluationsCount > 0
                  ? 'bg-amber-950 text-amber-300 border border-amber-600'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {evaluationsCount > 0 ? (isEn ? 'ACTIVE DATA' : 'DATI PRESENTI') : (isEn ? 'CLEAN' : 'PULITO')}
            </span>
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                {isEn ? 'Simulator Tech Checklists' : 'Checklist Tecniche Manichini'}
              </span>
              <span className="text-base font-black text-cyan-400 font-mono">
                {activeChecklistsCount} {isEn ? 'with flags' : 'con flag attivi'}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                activeChecklistsCount > 0
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-600'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {activeChecklistsCount > 0 ? (isEn ? 'IN PROGRESS' : 'IN CORSO') : (isEn ? 'IDLE' : 'RESET')}
            </span>
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                {isEn ? 'Preserved Master Registers' : 'Registri Master Preservati'}
              </span>
              <span className="text-base font-black text-emerald-400 font-mono">
                60 Discenti • 12 Fac • 12 Tech
              </span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 text-[10px] font-bold uppercase rounded">
              100% SICURO
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Confirmation Modal for Simulation Session Reset */}
      <ResetSimulationSessionModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmResetSession}
      />
    </div>
  );
};
