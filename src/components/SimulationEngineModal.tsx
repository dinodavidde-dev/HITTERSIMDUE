import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Clock,
  Gauge,
  Flame,
  Bell,
  AlertTriangle,
  Radio,
  CheckCircle2,
  X,
  Compass,
  Layers,
  Sparkles,
  Users,
  Activity,
  Calendar,
  Eye,
  Sliders,
  TrendingUp,
} from 'lucide-react';
import { INITIAL_TIMELINE_SLOTS } from '../data/initialData';

interface SimulationEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulationEngineModal: React.FC<SimulationEngineModalProps> = ({ isOpen, onClose }) => {
  const {
    activeDay,
    activeSlotIndex,
    currentSlot,
    timerSeconds,
    isTimerRunning,
    toggleTimer,
    resetTimer,
    nextSlot,
    prevSlot,
    timeMultiplier,
    setTimeMultiplier,
    autoAdvancePhases,
    setAutoAdvancePhases,
    jumpToTimelinePoint,
    triggerSimulatedClinicalEvent,
    isCourseStarted,
    startCourseImmediately,
    teams,
    discenti,
    faculty,
    technicians,
  } = useCourse();

  const [activeTab, setActiveTab] = useState<'speed' | 'jumps' | 'events' | 'overview'>('speed');

  if (!isOpen) return null;

  const speedPresets = [
    { multiplier: 1, label: '1x (Normale)', sub: '1s reale = 1s corso', icon: '⏱️', color: 'border-neutral-600 bg-neutral-800 text-neutral-200' },
    { multiplier: 5, label: '5x (Rapido)', sub: '1 min corso = 12s reali', icon: '⏩', color: 'border-blue-500 bg-blue-950/40 text-blue-300' },
    { multiplier: 15, label: '15x (Accelerato)', sub: '1 min corso = 4s reali', icon: '🚀', color: 'border-cyan-500 bg-cyan-950/40 text-cyan-300' },
    { multiplier: 30, label: '30x (Molto Veloce)', sub: '1 min corso = 2s reali', icon: '⚡', color: 'border-amber-500 bg-amber-950/40 text-amber-300' },
    { multiplier: 60, label: '60x (Turbo)', sub: '1s reale = 1 MINUTO CORSO!', icon: '🔥', color: 'border-orange-500 bg-orange-950/40 text-orange-300' },
    { multiplier: 120, label: '120x (Super Turbo)', sub: '1s reale = 2 MINUTI CORSO!', icon: '⚡', color: 'border-red-500 bg-red-950/40 text-red-300' },
    { multiplier: 300, label: '300x (Hyper Speed)', sub: '1s reale = 5 MINUTI CORSO!', icon: '💫', color: 'border-purple-500 bg-purple-950/40 text-purple-300' },
  ];

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalSlotsCount = INITIAL_TIMELINE_SLOTS.length;
  const progressPercent = Math.min(100, Math.round(((activeSlotIndex + 1) / totalSlotsCount) * 100));

  return (
    <div
      id="simulation-engine-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="simulation-engine-modal-card"
        className="relative w-full max-w-4xl bg-neutral-900 border-2 border-orange-500 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-neutral-950 border-b-2 border-orange-500 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 text-black border border-orange-300 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wide">
                  SIMULATORE DI REGIA & ACCELERATORE TEMPO
                </h2>
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/50">
                  {timeMultiplier > 1 ? `⚡ ACCELERATO ${timeMultiplier}x` : '⏱️ 1:1 TEMPO REALE'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                Strumento di stress test per verificare timeline, rotazioni, avvisi discenti e scenari clinici
              </p>
            </div>
          </div>

          <button
            id="close-sim-modal-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Simulation Status Dashboard Header */}
        <div className="bg-neutral-950/70 border-b border-neutral-800 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Day & Phase */}
          <div className="bg-neutral-900 border border-neutral-800 p-2.5">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">GIORNO & FASE</span>
            <div className="font-mono font-black text-sm text-orange-400 mt-0.5">
              GIORNO {activeDay} • FASE {activeSlotIndex + 1}/{totalSlotsCount}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono truncate">{currentSlot?.title}</div>
          </div>

          {/* Countdown & Status */}
          <div className="bg-neutral-900 border border-neutral-800 p-2.5">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">COUNTDOWN FASE</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`font-mono text-lg font-black px-2 py-0.2 ${
                  timerSeconds <= 300
                    ? 'bg-red-900/80 text-red-300 border border-red-500'
                    : 'bg-black text-white border border-neutral-700'
                }`}
              >
                {formatTimer(timerSeconds)}
              </span>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 border ${
                  isTimerRunning
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500 animate-pulse'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                {isTimerRunning ? 'RUNNING' : 'PAUSA'}
              </span>
            </div>
          </div>

          {/* Active Speed */}
          <div className="bg-neutral-900 border border-neutral-800 p-2.5">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">VELOCITÀ ATTIVA</span>
            <div className="font-mono font-black text-base text-cyan-400 mt-0.5 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>{timeMultiplier}x</span>
              <span className="text-[10px] font-normal text-neutral-400">
                {timeMultiplier >= 60 ? '⚡ TURBO' : timeMultiplier > 1 ? 'RAPIDO' : '1:1'}
              </span>
            </div>
          </div>

          {/* Auto-Advance Setting */}
          <div className="bg-neutral-900 border border-neutral-800 p-2.5 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">AVANZAMENTO AUTOMATICO</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-mono font-bold text-neutral-300">
                {autoAdvancePhases ? 'ATTIVO (Continuo)' : 'DISATTIVO (Manuale)'}
              </span>
              <button
                id="toggle-auto-advance-btn"
                type="button"
                onClick={() => setAutoAdvancePhases(!autoAdvancePhases)}
                className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 border cursor-pointer transition-colors ${
                  autoAdvancePhases
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                {autoAdvancePhases ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Global Action Bar Controls */}
        <div className="bg-neutral-900 border-b border-neutral-800 px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="sim-toggle-timer-btn"
              onClick={toggleTimer}
              className={`flex items-center gap-1.5 px-4 py-2 font-black text-xs uppercase tracking-wider border-2 cursor-pointer transition-all ${
                isTimerRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-black border-amber-400'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-md'
              }`}
            >
              {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isTimerRunning ? 'PAUSA SIMULAZIONE' : 'AVVIA SIMULAZIONE'}</span>
            </button>

            <button
              id="sim-reset-timer-btn"
              onClick={() => resetTimer()}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs uppercase border border-neutral-700 cursor-pointer"
              title="Reimposta timer fase al valore di default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET FASE</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                id="sim-prev-slot-btn"
                onClick={prevSlot}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer"
                title="Fase Precedente"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                id="sim-next-slot-btn"
                onClick={nextSlot}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer"
                title="Fase Successiva"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Timeline Overall Progress bar */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="text-right">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">AVANZAMENTO TOTALE</span>
              <span className="text-xs font-mono font-black text-orange-400">{progressPercent}% CORSO</span>
            </div>
            <div className="w-24 sm:w-32 bg-neutral-950 h-2.5 border border-neutral-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-neutral-950 px-5 pt-2 flex items-center gap-2 border-b border-neutral-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('speed')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${
              activeTab === 'speed'
                ? 'border-orange-500 text-orange-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ⚡ Moltiplicatore Velocità
          </button>
          <button
            onClick={() => setActiveTab('jumps')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${
              activeTab === 'jumps'
                ? 'border-orange-500 text-orange-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🎯 Salti Temporali & Test Chiave
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${
              activeTab === 'events'
                ? 'border-orange-500 text-orange-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            💥 Iniezione Eventi Clinici
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-orange-500 text-orange-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            📊 Tabellone 60 Discenti & 12 Squadre
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Speed Multipliers */}
          {activeTab === 'speed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-white">
                    SELEZIONA VELOCITÀ DI ACCELERAZIONE TEMPORALE
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Aumenta il fattore di accelerazione per simulare rapidamente il passaggio dei moduli e il cambio fase.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {speedPresets.map((preset) => {
                  const isSelected = timeMultiplier === preset.multiplier;
                  return (
                    <button
                      key={preset.multiplier}
                      id={`speed-preset-${preset.multiplier}x`}
                      onClick={() => setTimeMultiplier(preset.multiplier)}
                      className={`p-3.5 text-left border-2 transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'border-orange-500 bg-orange-950/60 shadow-lg ring-1 ring-orange-500'
                          : 'border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 hover:bg-neutral-800'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-black fill-current" />
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-xl">{preset.icon}</span>
                        <div>
                          <div className="font-mono font-black text-sm text-white">{preset.label}</div>
                          <div className="text-[11px] font-mono text-neutral-400">{preset.sub}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Automation Guide Box */}
              <div className="p-4 bg-black/60 border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-black text-orange-400 uppercase">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>CONSIGLIO PER LA VERIFICA COMPLETA DEL CORSO:</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Imposta la velocità a <strong>60x (Turbo)</strong> o <strong>120x (Super Turbo)</strong> e lascia attivo{' '}
                  <strong>l'Avanzamento Continuo</strong>. Potrai osservare l'intero corso di 3 giorni procedere in pochi minuti,
                  con l'attivazione in sequenza di tutti i banner di raduno, i passaggi consegne SBAR, le rotazioni dei 60 discenti
                  e l'ingresso nella Maxiemergenza Notturna!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Quick Jump Points */}
          {activeTab === 'jumps' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black uppercase text-white">
                  SALTO RAPIDO AI PUNTI CRITICI DELLA SIMULAZIONE
                </h3>
                <p className="text-xs text-neutral-400">
                  Posiziona istantaneamente il corso in momenti specifici per verificare comportamenti, allarmi e schermate.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 15 min callout test */}
                <button
                  id="jump-15m-btn"
                  onClick={() => {
                    jumpToTimelinePoint('pre_start_15m');
                    onClose();
                  }}
                  className="p-3 bg-amber-950/40 hover:bg-amber-900/60 border-2 border-amber-500/80 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-mono font-black text-sm text-amber-300">
                    <Bell className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>TEST AVVISO 15 MINUTI AL MODULO</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Imposta il timer a 15:00 per testare il Banner di Raduno Squadre/Moduli, l'invito operativo e il segnale acustico.
                  </p>
                </button>

                {/* 5 min urgent callout test */}
                <button
                  id="jump-5m-btn"
                  onClick={() => {
                    jumpToTimelinePoint('pre_start_5m');
                    onClose();
                  }}
                  className="p-3 bg-red-950/40 hover:bg-red-900/60 border-2 border-red-500/80 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-mono font-black text-sm text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                    <span>TEST ALLERTA URGENTE (5 MINUTI)</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Imposta il timer a 05:00 per verificare lo stato di urgenza rosso e l'invito al rapido posizionamento.
                  </p>
                </button>

                {/* 30s phase switch test */}
                <button
                  id="jump-30s-btn"
                  onClick={() => {
                    jumpToTimelinePoint('pre_start_30s');
                    onClose();
                  }}
                  className="p-3 bg-neutral-800 hover:bg-neutral-750 border-2 border-neutral-600 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-mono font-black text-sm text-neutral-200">
                    <Clock className="w-4 h-4 text-neutral-300 group-hover:scale-110 transition-transform" />
                    <span>TEST CAMBIO FASE RAPIDO (30 SECONDI)</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Imposta il timer a 00:30 per verificare la transizione automatica alla fase e rotazione successiva.
                  </p>
                </button>

                {/* Day 1 Intro */}
                <button
                  id="jump-day1-btn"
                  onClick={() => {
                    jumpToTimelinePoint('day1_intro');
                    onClose();
                  }}
                  className="p-3 bg-neutral-800 hover:bg-neutral-750 border-2 border-blue-600/60 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-mono font-black text-sm text-blue-300">
                    <Calendar className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>GIORNO 1: APERTURA & BRIEFING PLENARIO</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Salta alla prima sessione teorica e plenaria con benvenuto della Direzione.
                  </p>
                </button>

                {/* Day 2 Morning Scenarios */}
                <button
                  id="jump-day2m-btn"
                  onClick={() => {
                    jumpToTimelinePoint('day2_morning');
                    onClose();
                  }}
                  className="p-3 bg-neutral-800 hover:bg-neutral-750 border-2 border-orange-600/60 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-mono font-black text-sm text-orange-300">
                    <Activity className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                    <span>GIORNO 2 MATTINA: SCENARI 1, 6, 11 (PAZIENTI 1-6)</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Fase Extra Gruppo A, Shock Room Gruppo B, Workshop TCCC Militare Gruppi C e D.
                  </p>
                </button>

                {/* Day 2 Afternoon Scenarios */}
                <button
                  id="jump-day2p-btn"
                  onClick={() => {
                    jumpToTimelinePoint('day2_afternoon');
                    onClose();
                  }}
                  className="p-3 bg-neutral-800 hover:bg-neutral-750 border-2 border-amber-600/60 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-mono font-black text-sm text-amber-300">
                    <Flame className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>GIORNO 2 POMERIGGIO: SCENARI 7, 8, 12, 13 (PAZIENTI 7-12)</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Fase ad alta complessità chirurgica: REBOA, Toracotomie rianimative e Packing pelvico.
                  </p>
                </button>

                {/* Night Scenario */}
                <button
                  id="jump-night-btn"
                  onClick={() => {
                    jumpToTimelinePoint('night_scenario');
                    onClose();
                  }}
                  className="p-3 bg-purple-950/40 hover:bg-purple-900/60 border-2 border-purple-500/80 text-left transition-all cursor-pointer group sm:col-span-2"
                >
                  <div className="flex items-center gap-2 font-mono font-black text-sm text-purple-300">
                    <Compass className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>🌙 GIORNO 3 NOTTE (21:00): MAXIEMERGENZA NOTTURNA MASS CASUALTY</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Scenario notturno con simulazione di esplosione/blast, Triage START, 12 squadre operative simultaneamente in ambiente austero.
                  </p>
                </button>

                {/* Day 3 Final Exams */}
                <button
                  id="jump-day3-btn"
                  onClick={() => {
                    jumpToTimelinePoint('day3_exams');
                    onClose();
                  }}
                  className="p-3 bg-neutral-800 hover:bg-neutral-750 border-2 border-emerald-600/60 text-left transition-all cursor-pointer group sm:col-span-2"
                >
                  <div className="flex items-center gap-2 font-mono font-black text-sm text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>GIORNO 3: ESAMI PRATICI & DEBRIEFING PLENARIO FINALE</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Sessione di certificazione e consegna attestati per tutti i 60 discenti.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Clinical Injections */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black uppercase text-white">
                  INIETTORE EVENTI CLINICI & STRESS TEST LOGISTICO
                </h3>
                <p className="text-xs text-neutral-400">
                  Simula deterioramenti clinici improvvisi e allarmi radio per verificare la risposta dei discenti e della Faculty.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  id="trigger-clinical-event-btn"
                  onClick={() => {
                    triggerSimulatedClinicalEvent();
                  }}
                  className="p-4 bg-red-950/40 hover:bg-red-900/60 border-2 border-red-500 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-mono font-black text-sm text-red-300">
                    <Flame className="w-5 h-5 text-red-400 group-hover:animate-bounce" />
                    <span>INIETTA DETERIORAMENTO CLINICO A SORPRESA</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Genera un'emergenza acuta (Arresto cardiaco shockabile, pneumotorace iperteso, dislocazione tourniquet, emorragia massiva).
                  </p>
                </button>

                <button
                  id="trigger-plenary-chime-btn"
                  onClick={() => {
                    triggerSimulatedClinicalEvent();
                  }}
                  className="p-4 bg-amber-950/40 hover:bg-amber-900/60 border-2 border-amber-500 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-mono font-black text-sm text-amber-300">
                    <Radio className="w-5 h-5 text-amber-400 group-hover:scale-110" />
                    <span>ALLARME COMUNICAZIONE RADIO GENERALE</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Invia un broadcast a tutte le squadre per verificare la notifica sui monitor e sui dispositivi dei partecipanti.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: 60 Discenti & 12 Teams Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black uppercase text-white">
                  TABELLONE STRUTTURALE 60 DISCENTI & 12 SQUADRE
                </h3>
                <p className="text-xs text-neutral-400">
                  Riepilogo delle 4 rotazioni in corso su tutte le postazioni del centro di simulazione.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Gruppo A */}
                <div className="bg-black/60 border-2 border-red-500/80 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-red-400">GRUPPO A</span>
                    <span className="text-[10px] font-mono bg-red-950 px-1.5 py-0.5 text-red-300 border border-red-500/40">
                      15 Discenti
                    </span>
                  </div>
                  <div className="text-xs text-neutral-200 font-medium">
                    Squadre 1, 2, 3 (Alpha 1, 2, 3)
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 border-t border-neutral-800 pt-1">
                    Attività Attuale: {currentSlot?.groupActivities?.A?.title || 'Fase Assegnata'}
                  </div>
                </div>

                {/* Gruppo B */}
                <div className="bg-black/60 border-2 border-blue-500/80 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-blue-400">GRUPPO B</span>
                    <span className="text-[10px] font-mono bg-blue-950 px-1.5 py-0.5 text-blue-300 border border-blue-500/40">
                      15 Discenti
                    </span>
                  </div>
                  <div className="text-xs text-neutral-200 font-medium">
                    Squadre 4, 5, 6 (Bravo 1, 2, 3)
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 border-t border-neutral-800 pt-1">
                    Attività Attuale: {currentSlot?.groupActivities?.B?.title || 'Fase Assegnata'}
                  </div>
                </div>

                {/* Gruppo C */}
                <div className="bg-black/60 border-2 border-green-500/80 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-green-400">GRUPPO C</span>
                    <span className="text-[10px] font-mono bg-green-950 px-1.5 py-0.5 text-green-300 border border-green-500/40">
                      15 Discenti
                    </span>
                  </div>
                  <div className="text-xs text-neutral-200 font-medium">
                    Squadre 7, 8, 9 (Charlie 1, 2, 3)
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 border-t border-neutral-800 pt-1">
                    Attività Attuale: {currentSlot?.groupActivities?.C?.title || 'Fase Assegnata'}
                  </div>
                </div>

                {/* Gruppo D */}
                <div className="bg-black/60 border-2 border-purple-500/80 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-purple-400">GRUPPO D</span>
                    <span className="text-[10px] font-mono bg-purple-950 px-1.5 py-0.5 text-purple-300 border border-purple-500/40">
                      15 Discenti
                    </span>
                  </div>
                  <div className="text-xs text-neutral-200 font-medium">
                    Squadre 10, 11, 12 (Delta 1, 2, 3)
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 border-t border-neutral-800 pt-1">
                    Attività Attuale: {currentSlot?.groupActivities?.D?.title || 'Fase Assegnata'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-950 border-t border-neutral-800 px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
            <Gauge className="w-4 h-4 text-orange-400" />
            <span>Stato: {timeMultiplier > 1 ? `Accelerazione Attiva (${timeMultiplier}x)` : 'Velocità 1:1'}</span>
          </div>

          <button
            id="close-sim-footer-btn"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase border border-neutral-600 transition-colors cursor-pointer"
          >
            Chiudi Pannello
          </button>
        </div>
      </div>
    </div>
  );
};
