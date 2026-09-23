import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Calendar,
  Clock,
  DoorOpen,
  FileText,
  Globe,
  Lock,
  Pause,
  Play,
  Radio,
  RotateCcw,
  ShieldCheck,
  Unlock,
  Users,
  Zap,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { MasterAnagraficaManager } from '../anagrafica/MasterAnagraficaManager';
import { CourseSuspensionModal } from '../CourseSuspensionModal';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { ScenariMasterListView } from './ScenariMasterListView';
import { RegiaVisualTimelineBoard } from '../regia/RegiaVisualTimelineBoard';
import { PreCourseDirectorBanner } from '../common/PreCourseDirectorBanner';

export const RegiaView: React.FC = () => {
  const {
    language,
    activeDay,
    currentSlot,
    filteredSlots,
    activeSlotIndex,
    isTimerRunning,
    toggleTimer,
    resetTimer,
    timerSeconds,
    regiaStaff,
    selectedRegiaId,
    setSelectedRegiaId,
    suspensionInfo,
    timeMultiplier,
    setTimeMultiplier,
    jumpToTimelinePoint,
    setUserRole,
    setCurrentTab,
    courseStartSchedule,
    updateCourseStartSchedule,
    setCourseGateEnabled,
    startCourseImmediately,
    resetCourseScheduleToFuture,
    timeRemainingMs,
    isCourseStarted,
  } = useCourse();

  const isEn = language === 'en';

  const currentRegia =
    regiaStaff.find((r) => r.id === selectedRegiaId) ||
    regiaStaff[0] || {
      id: 'regia-1',
      name: 'Coordinatore Regia',
      title: 'Regia & Mission Control',
      role: 'Coordinatore Centrale',
      nationality: 'Italiana',
      phone: '+39 000 000000',
      email: 'regia@traumasim.it',
      organization: 'Trauma Center Academy',
      badgeCode: 'REGIA-01',
      isMaster: true,
    };

  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'scenari' | 'suspension' | 'anagrafica'>('timeline');
  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);

  const copyPublicUrl = () => {
    const url = `${window.location.origin}${window.location.pathname}?view=public`;
    navigator.clipboard.writeText(url);
    setCopiedPublicLink(true);
    setTimeout(() => setCopiedPublicLink(false), 3000);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Banner Countdown Inizio Corso (Visibile fino all'avvio del corso da parte della regia) */}
      <PreCourseDirectorBanner variant="regia" />

      {/* Regia Top Header with Anagrafica & Live Controls */}
      <div className="bg-neutral-950 border-2 border-pink-500/80 p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-pink-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isEn ? 'REGIA & MISSION CONTROL ROOM' : 'CENTRALE REGIA & MISSION CONTROL'}
              </span>

              <span className="text-[11px] text-neutral-300 font-mono font-bold px-2.5 py-1 bg-neutral-900 border border-neutral-700">
                DAY 0{activeDay} • {isEn ? 'SLOT' : 'SLOT'} {activeSlotIndex + 1}/{filteredSlots.length}
              </span>
              {suspensionInfo.isSuspended ? (
                <span className="bg-red-600 text-white font-black text-[11px] px-2.5 py-1 animate-pulse flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  {isEn ? 'COURSE SUSPENDED' : 'CORSO SOSPESO'}
                </span>
              ) : (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-black px-2.5 py-1">
                  🟢 {isEn ? 'ACTIVE' : 'ATTIVO'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap pt-1">
              <span className="px-2.5 py-0.5 bg-pink-950 text-pink-300 border border-pink-700/80 text-xs font-mono font-black">
                {currentRegia.badgeCode || 'REGIA-01'}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2 flex-wrap truncate">
                <span>{currentRegia.name}</span>
                {Boolean(currentRegia.isMaster) && (
                  <span className="px-2 py-0.5 bg-pink-500 text-black font-black text-xs uppercase tracking-wider shadow-sm">
                    ★ MASTER REGIA
                  </span>
                )}
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 text-xs font-mono">
              <span className="text-pink-200/90 font-medium">
                {isEn ? 'Role:' : 'Ruolo:'} <strong className="text-white">{currentRegia.role || currentRegia.title}</strong>
              </span>
              {currentRegia.organization && (
                <>
                  <span className="text-neutral-600 hidden sm:inline">•</span>
                  <span className="text-neutral-300">{isEn ? 'Org:' : 'Ente:'} <strong className="text-white">{currentRegia.organization}</strong></span>
                </>
              )}
              {currentRegia.email && (
                <>
                  <span className="text-neutral-600 hidden sm:inline">•</span>
                  <span className="text-neutral-400">Email: <span className="text-pink-300">{currentRegia.email}</span></span>
                </>
              )}
              <span className="text-neutral-600 hidden sm:inline">•</span>
              <span className="text-neutral-300">Tel: <span className="text-pink-400 font-bold">{currentRegia.phone}</span></span>
            </div>

            {regiaStaff.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[11px] font-mono text-pink-400 uppercase font-bold">{isEn ? 'Select Regia Operator:' : 'Seleziona Operatore Regia:'}</span>
                <select
                  value={currentRegia.id}
                  onChange={(e) => setSelectedRegiaId(e.target.value)}
                  className="bg-neutral-950 text-white text-xs font-mono font-bold px-3 py-1 border border-pink-600/60 outline-none cursor-pointer rounded"
                >
                  {regiaStaff.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.badgeCode ? `[${r.badgeCode}] ` : ''}{r.name} ({r.role || r.title})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setUserRole('direttore');
                setCurrentTab('direttori');
              }}
              className="px-3 py-1.5 bg-yellow-950 hover:bg-yellow-900 text-yellow-300 font-black text-xs uppercase tracking-wider border border-yellow-600 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
            >
              <Users className="w-3 h-3 text-yellow-400" />
              <span>{isEn ? 'DIRECTORS' : 'DIRETTORI'}</span>
            </button>

            <button
              onClick={copyPublicUrl}
              className="px-3 py-1.5 bg-orange-950 hover:bg-orange-900 text-orange-300 font-bold text-xs uppercase border border-orange-600 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              {copiedPublicLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Globe className="w-3.5 h-3.5 text-orange-400" />}
              <span>{copiedPublicLink ? (isEn ? 'Link Copied!' : 'Link Copiato!') : (isEn ? 'Public Link' : 'Link Pubblico')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Regia Navigation Menu */}
      <nav aria-label="Menu Regia" className="bg-neutral-950 border border-neutral-800 p-1 sm:p-1.5 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-1.5">
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'timeline'
                ? 'bg-pink-600 text-white border-pink-400 shadow-md font-black'
                : 'bg-neutral-900 text-pink-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-pink-500/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'CONTROL & TIMELINE' : 'REGIA & TIMELINE'}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('scenari')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'scenari'
                ? 'bg-pink-600 text-white border-pink-400 shadow-md font-black'
                : 'bg-neutral-900 text-pink-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-pink-500/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'MASTER SCENARIOS' : 'SCENARI MASTER'}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('suspension')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'suspension'
                ? 'bg-red-600 text-white border-red-400 shadow-md font-black'
                : 'bg-neutral-900 text-red-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-red-500/50'
            }`}
          >
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'START & STOP' : 'START & STOP'}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('anagrafica')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'anagrafica'
                ? 'bg-pink-600 text-white border-pink-400 shadow-md font-black'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-pink-500/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-pink-400" />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'REGIA ROSTER' : 'ANAGRAFICA REGIA'}
              </span>
            </div>
          </button>
        </div>
      </nav>

      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          <RegiaVisualTimelineBoard isMaster={true} />
        </div>
      )}

      {activeSubTab === 'scenari' && (
        <div className="space-y-6">
          <ScenariMasterListView />
        </div>
      )}

      {activeSubTab === 'suspension' && (
        <div className="space-y-6">
          {/* DATA E ORA APERTURA GATE & COUNTDOWN SINCRONIZZATO */}
          <div className="bg-neutral-900 border-2 border-amber-500/80 p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-black border border-amber-300">
                  <DoorOpen className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest font-mono">
                    {isEn ? 'LEARNER ACCESS CONTROL & SYNCED COUNTDOWN' : 'CONTROLLO ACCESSO DISCENTI & COUNTDOWN SINCRONIZZATO'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase flex items-center gap-2">
                    <span>{isEn ? 'GATE OPENING DATE & TIME' : 'DATA E ORA APERTURA GATE'}</span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    {isEn
                      ? 'Set course dates and exact time for learner gate unlocking.'
                      : 'Imposta le date del corso e l\'ora esatta di sblocco/apertura del gate discenti.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 font-mono text-xs font-black uppercase border flex items-center gap-1.5 ${
                    courseStartSchedule.isGateEnabled
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500 animate-pulse'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                  }`}
                >
                  {courseStartSchedule.isGateEnabled ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? 'GATE LOCKED (COUNTDOWN ACTIVE)' : 'GATE BLOCCATO (COUNTDOWN ATTIVO)'}</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isEn ? 'GATE OPEN / COURSE ACTIVE' : 'GATE APERTO / CORSO ATTIVO'}</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Inputs & Quick Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-neutral-950 border border-neutral-800">
              <div>
                <label className="text-[10px] font-mono text-neutral-400 uppercase block font-bold mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? 'COURSE START DATE' : 'DATA INIZIO CORSO'}</span>
                </label>
                <input
                  type="date"
                  value={courseStartSchedule.scheduledDate || ''}
                  onChange={(e) => updateCourseStartSchedule({ scheduledDate: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white font-mono text-sm px-3 py-2 focus:outline-hidden focus:border-amber-400"
                />
                <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                  {isEn ? 'Scheduled course date' : 'Data programmata per il corso'}
                </span>
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-400 uppercase block font-bold mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? 'GATE OPENING TIME' : 'ORA APERTURA GATE'}</span>
                </label>
                <input
                  type="time"
                  value={courseStartSchedule.scheduledTime || '08:30'}
                  onChange={(e) => updateCourseStartSchedule({ scheduledTime: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white font-mono text-sm px-3 py-2 focus:outline-hidden focus:border-amber-400 font-bold"
                />
                <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                  {isEn ? 'Official learner opening time' : 'Orario ufficiale di apertura discenti'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase block font-bold mb-1.5">
                  {isEn ? 'TIME REMAINING TO GATE' : 'TEMPO RIMANENTE AL GATE'}
                </span>
                <div className="bg-neutral-900 border border-neutral-700 px-3 py-2 font-mono font-black text-amber-400 text-lg flex items-center justify-between">
                  <span>
                    {(() => {
                      if (!courseStartSchedule.isGateEnabled) return isEn ? 'GATE OPEN' : 'GATE APERTO';
                      const totalSec = Math.floor(timeRemainingMs / 1000);
                      const d = Math.floor(totalSec / 86400);
                      const h = Math.floor((totalSec % 86400) / 3600);
                      const m = Math.floor((totalSec % 3600) / 60);
                      const s = totalSec % 60;
                      if (d > 0) return `${d}${isEn ? 'd' : 'g'} ${h}h ${m}m ${s}s`;
                      if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
                      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                    })()}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                </div>
                <span className="text-[10px] text-neutral-400 font-mono mt-1 block truncate">
                  Target: {courseStartSchedule.scheduledDate} {isEn ? 'at' : 'ore'} {courseStartSchedule.scheduledTime}
                </span>
              </div>

              <div className="flex flex-col justify-end gap-2">
                <button
                  onClick={() => setCourseGateEnabled(!courseStartSchedule.isGateEnabled)}
                  className={`w-full py-2 px-3 font-mono text-xs font-black uppercase tracking-wider border cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    courseStartSchedule.isGateEnabled
                      ? 'bg-amber-600 hover:bg-amber-500 text-black border-amber-300'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border-amber-500/60'
                  }`}
                >
                  {courseStartSchedule.isGateEnabled ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isEn ? 'DISABLE GATE' : 'DISATTIVA GATE'}</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{isEn ? 'ENABLE GATE LOCK' : 'ATTIVA BLOCCO GATE'}</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={startCourseImmediately}
                    className="py-1.5 px-2 bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-[10px] font-bold uppercase border border-emerald-500 cursor-pointer flex items-center justify-center gap-1"
                    title={isEn ? 'Instantly open gate, unlocking public view' : 'Apre istantaneamente il gate sbloccando la visuale pubblica'}
                  >
                    <DoorOpen className="w-3 h-3" />
                    <span>{isEn ? 'OPEN NOW' : 'APRI ORA'}</span>
                  </button>
                  <button
                    onClick={() => resetCourseScheduleToFuture(30)}
                    className="py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-[10px] font-bold uppercase border border-neutral-600 cursor-pointer flex items-center justify-center gap-1"
                    title={isEn ? 'Set countdown to +30 minutes from now' : 'Imposta il countdown a +30 minuti da adesso'}
                  >
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>+30 MIN</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scorciatoie rapide orari apertura tipici */}
            <div className="p-3 bg-neutral-950 border border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEn ? 'QUICK GATE TIME PRESETS:' : 'PRESET RAPIDI ORARIO GATE:'}</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['08:00', '08:30', '09:00', '13:00', '14:00'].map((presetTime) => (
                  <button
                    key={presetTime}
                    onClick={() => updateCourseStartSchedule({ scheduledTime: presetTime, isGateEnabled: true })}
                    className={`px-2.5 py-1 text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                      courseStartSchedule.scheduledTime === presetTime
                        ? 'bg-amber-500 text-black border-amber-300'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-amber-400'
                    }`}
                  >
                    {isEn ? 'AT ' : 'ORE '}{presetTime}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border-2 border-red-600/80 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest font-mono">
                  {isEn ? 'LOCK & RESUME SYSTEM' : 'SISTEMA DI BLOCCO E RIPARTENZA'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase flex items-center gap-2">
                  <AlertOctagon className="w-6 h-6 text-red-600 animate-pulse" />
                  <span>{isEn ? 'START & STOP CONTROL & GLOBAL EMERGENCY SIGNAL' : 'CONTROLLO START & STOP & SEGNALE EMERGENZA GLOBALE'}</span>
                </h3>
              </div>

              <button
                onClick={() => setIsSuspensionModalOpen(true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider border-2 border-white shadow-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>{isEn ? 'OPEN SUSPENSION MODAL' : 'APRI MODALE SOSPENSIONE'}</span>
              </button>
            </div>

            <div className="p-5 bg-neutral-950 border-2 border-neutral-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black text-neutral-400 uppercase">{isEn ? 'CURRENT COURSE STATUS:' : 'STATO ATTUALE CORSO:'}</span>
                <span className={`text-xs font-black uppercase px-3 py-1 ${suspensionInfo.isSuspended ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-600 text-white'}`}>
                  {suspensionInfo.isSuspended ? (isEn ? '🔴 COURSE SUSPENDED' : '🔴 CORSO SOSPESO') : (isEn ? '🟢 COURSE RUNNING NORMALLY' : '🟢 CORSO IN ESECUZIONE REGOLARE')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border-2 border-orange-500/80 p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500 text-black border border-orange-300">
                  <Zap className="w-5 h-5 fill-current animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-white tracking-wide">
                    {isEn ? 'COURSE AUTOMATION TOOL & TIME ACCELERATOR' : 'STRUMENTO DI AUTOMAZIONE CORSO & ACCELERATORE TEMPO'}
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    {isEn
                      ? 'Stress test engine for timeline simulation, speed multipliers and time jumps'
                      : 'Motore di stress test per simulazione timeline, moltiplicatori velocità e salti temporali'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">
                  {isEn ? 'CURRENT DAY & PHASE' : 'GIORNO & FASE CORRENTE'}
                </span>
                <div className="font-mono font-black text-sm text-orange-400 mt-0.5">
                  {isEn ? 'DAY' : 'GIORNO'} {activeDay} • {isEn ? 'PHASE' : 'FASE'} {activeSlotIndex + 1}/{INITIAL_TIMELINE_SLOTS.length}
                </div>
                <div className="text-xs text-neutral-300 font-mono truncate">{currentSlot?.title}</div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">
                  {isEn ? 'TIMER & STATUS' : 'TIMER & STATO'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-base font-black px-2 py-0.5 bg-black text-white border border-neutral-700">
                    {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${isTimerRunning ? 'bg-emerald-950 text-emerald-300 border-emerald-500 animate-pulse' : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>
                    {isTimerRunning ? 'RUNNING' : (isEn ? 'PAUSED' : 'PAUSA')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <button
                  onClick={toggleTimer}
                  className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-2 cursor-pointer transition-all flex items-center gap-1.5 ${
                    isTimerRunning ? 'bg-amber-600 hover:bg-amber-500 text-black border-amber-400' : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isTimerRunning ? (isEn ? 'PAUSE' : 'PAUSA') : (isEn ? 'START' : 'AVVIA')}</span>
                </button>
                <button
                  onClick={() => resetTimer()}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs uppercase border border-neutral-700 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-neutral-300 tracking-wider">
                {isEn ? 'SELECT SPEED MULTIPLIER' : 'SELEZIONA MOLTIPLICATORE VELOCITÀ'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {[1, 5, 15, 30, 60, 120, 300].map((spd) => {
                  const isSelected = timeMultiplier === spd;
                  return (
                    <button
                      key={spd}
                      onClick={() => setTimeMultiplier(spd)}
                      className={`p-2.5 text-center border-2 transition-all cursor-pointer ${
                        isSelected ? 'border-pink-500 bg-pink-950/80 text-pink-300 font-black shadow-md' : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-850'
                      }`}
                    >
                      <div className="font-mono font-black text-sm">{spd}x</div>
                      <div className="text-[9px] text-neutral-400 font-mono mt-0.5">{spd === 1 ? (isEn ? '1:1 Real' : '1:1 Reale') : `${spd}x`}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-neutral-300 tracking-wider">
                {isEn ? 'QUICK JUMP TO CRITICAL POINTS' : 'SALTO RAPIDO AI PUNTI CRITICI'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => jumpToTimelinePoint('pre_start_15m')}
                  className="p-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-700 text-left cursor-pointer transition-all"
                >
                  <div className="font-mono font-black text-xs text-amber-300 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isEn ? 'TEST 15 MIN ALERT' : 'TEST AVVISO 15 MIN'}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {isEn ? 'Set countdown to 15 min to test assembly banner' : 'Imposta countdown a 15 minuti per testare banner raduno'}
                  </p>
                </button>

                <button
                  onClick={() => jumpToTimelinePoint('pre_start_5m')}
                  className="p-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-700 text-left cursor-pointer transition-all"
                >
                  <div className="font-mono font-black text-xs text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>{isEn ? 'TEST 5 MIN ALERT' : 'TEST ALLERTA 5 MIN'}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {isEn ? 'Set countdown to 5 min to test red urgency' : 'Imposta countdown a 5 minuti per testare urgenza rossa'}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'anagrafica' && <MasterAnagraficaManager initialSection="regia" />}

      <CourseSuspensionModal isOpen={isSuspensionModalOpen} onClose={() => setIsSuspensionModalOpen(false)} />
    </div>
  );
};
