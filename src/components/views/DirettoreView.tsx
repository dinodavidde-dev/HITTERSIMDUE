import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Award,
  BarChart3,
  Check,
  ChevronRight,
  Clock,
  Download,
  Edit2,
  FastForward,
  Flame,
  MessageSquare,
  Minus,
  Pause,
  Play,
  Plus,
  Printer,
  QrCode,
  Radio,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { Director, Discente, Faculty, SimulatorPatient, Team, Technician } from '../../types';
import { BroadcastModal } from '../BroadcastModal';
import { MasterAnagraficaManager } from '../anagrafica/MasterAnagraficaManager';
import { PersonnelBadgeRegistry } from '../anagrafica/PersonnelBadgeRegistry';
import { CourseSuspensionModal } from '../CourseSuspensionModal';
import { CourseMessagesPanel } from '../messaging/CourseMessagesPanel';
import { CourseMessengerModal } from '../messaging/CourseMessengerModal';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { CourseScheduleGateCard } from '../CourseScheduleGateCard';
import { TechSessionChecklist } from '../TechSessionChecklist';
import { RegiaVisualTimelineBoard } from '../regia/RegiaVisualTimelineBoard';
import { AggregatePerformanceMetrics } from '../director/AggregatePerformanceMetrics';
import { ClipboardCheck } from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';

export const DirettoreView: React.FC = () => {
  const {
    language,
    t,
    activeDay,
    setActiveDay,
    currentSlot,
    filteredSlots,
    activeSlotIndex,
    setActiveSlotIndex,
    nextSlot,
    prevSlot,
    isTimerRunning,
    toggleTimer,
    resetTimer,
    adjustTimer,
    timerSeconds,
    teams,
    updateTeam,
    discenti,
    updateDiscente,
    addDiscente,
    deleteDiscente,
    faculty,
    updateFaculty,
    technicians,
    updateTechnician,
    directors,
    updateDirector,
    selectedDirectorId,
    setSelectedDirectorId,
    guests,
    simulatorPatients,
    updateSimulatorPatient,
    evaluations,
    broadcastAlerts,
    courseMessages,
    suspensionInfo,
    resumeCourse,
    resetAllData,
    courseStartSchedule,
    isCourseStarted,
    timeRemainingMs,
    updateCourseStartSchedule,
    setCourseGateEnabled,
    startCourseImmediately,
    resetCourseScheduleToFuture,
    timeMultiplier,
    setIsSimulationModalOpen,
  } = useCourse();

  const isEn = language === 'en';

  const [activeSubTab, setActiveSubTab] = useState<
    'timeline' | 'schedule_gate' | 'checklists' | 'suspension' | 'messages' | 'anagrafica' | 'qr_badges' | 'scenari' | 'analytics'
  >('timeline');

  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);

  // Scenario edit modal state
  const [editingPatient, setEditingPatient] = useState<SimulatorPatient | null>(null);

  // Active Director Identification
  const currentDirector =
    directors.find((d) => d.id === selectedDirectorId) ||
    directors[0] || {
      id: 'dir-1',
      name: 'Direttore Corso',
      role: 'Direttore Scientifico',
      phone: '+39 000 000000',
      badgeCode: 'DIR-01',
    };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    updateSimulatorPatient(editingPatient.id, editingPatient);
    setEditingPatient(null);
  };

  // Calculate team scores averages
  const teamScoresMap = teams.map((team) => {
    const teamEvals = evaluations.filter((e) => e.teamId === team.id);
    if (teamEvals.length === 0) {
      return { team, evalCount: 0, avgTotal: 0, scores: { abcde: 0, tech: 0, crm: 0, sbar: 0, safety: 0 } };
    }
    const sumAbcde = teamEvals.reduce((acc, ev) => acc + ev.scores.abcdeApproach, 0) / teamEvals.length;
    const sumTech = teamEvals.reduce((acc, ev) => acc + ev.scores.technicalSkills, 0) / teamEvals.length;
    const sumCrm = teamEvals.reduce((acc, ev) => acc + ev.scores.teamworkLeadership, 0) / teamEvals.length;
    const sumSbar = teamEvals.reduce((acc, ev) => acc + ev.scores.handoverSbar, 0) / teamEvals.length;
    const sumSafety = teamEvals.reduce((acc, ev) => acc + ev.scores.safetyTiming, 0) / teamEvals.length;
    const avgTotal = (sumAbcde + sumTech + sumCrm + sumSbar + sumSafety) / 5;

    return {
      team,
      evalCount: teamEvals.length,
      avgTotal: Number(avgTotal.toFixed(1)),
      scores: {
        abcde: Number(sumAbcde.toFixed(1)),
        tech: Number(sumTech.toFixed(1)),
        crm: Number(sumCrm.toFixed(1)),
        sbar: Number(sumSbar.toFixed(1)),
        safety: Number(sumSafety.toFixed(1)),
      },
    };
  });

  const handleExportData = () => {
    const dataObj = {
      courseName: 'Corso Avanzato Trauma Sim Day 2 & Day 3',
      exportDate: new Date().toISOString(),
      activeDay,
      teams,
      discenti,
      faculty,
      technicians,
      directors,
      guests,
      evaluations,
      simulatorPatients,
      broadcastAlerts,
      courseMessages,
      suspensionInfo,
    };
    const jsonStr = JSON.stringify(dataObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trauma-sim-export-day${activeDay}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingMessagesCount = courseMessages.filter((m) => m.status === 'pending').length;

  return (
    <div className="space-y-4 pb-12">
      {/* Director Top Header with Live Controls */}
      <div className="bg-neutral-950 border-2 border-yellow-500/80 p-3 sm:p-4 shadow-xl space-y-2.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-yellow-500 text-black text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3 h-3" />
                {isEn ? 'COURSE DIRECTION & MISSION CONTROL' : 'DIREZIONE CORSO & REGIA'}
              </span>
              <span className="text-[11px] text-neutral-300 font-mono font-bold px-2 py-0.5 bg-neutral-900 border border-neutral-700">
                DAY 0{activeDay} • {isEn ? 'SLOT' : 'SLOT'} {activeSlotIndex + 1}/{filteredSlots.length}
              </span>
              {suspensionInfo.isSuspended ? (
                <span className="bg-red-600 text-white font-black text-[11px] px-2 py-0.5 animate-pulse flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3" />
                  {isEn ? 'COURSE SUSPENDED' : 'CORSO SOSPESO'}
                </span>
              ) : (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-black px-2 py-0.5">
                  🟢 {isEn ? 'ACTIVE' : 'ATTIVO'}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight truncate">
              {currentDirector.name}
            </h2>
            <p className="text-xs text-yellow-200/90 font-medium flex items-center gap-2 flex-wrap">
              <span>{isEn ? 'Role' : 'Ruolo'}: <strong className="text-white">{currentDirector.role}</strong></span>
              <span className="text-neutral-600">•</span>
              <span>{isEn ? 'Phone' : 'Tel'}: <span className="font-mono text-yellow-400 font-bold">{currentDirector.phone}</span></span>
            </p>
          </div>

          {/* Global Action Triggers & Language Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <LanguageSwitcher variant="badge" />

            {/* Director Selector */}
            {directors.length > 1 && (
              <div className="flex-1 sm:flex-initial">
                <select
                  id="director-selector-dropdown"
                  value={selectedDirectorId || currentDirector.id}
                  onChange={(e) => setSelectedDirectorId(e.target.value)}
                  className="w-full sm:w-auto bg-neutral-900 border border-yellow-600 text-yellow-200 text-xs font-bold px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
                  aria-label={isEn ? 'Select Director Profile' : 'Seleziona Profilo Direttore'}
                >
                  {directors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SOSPENSIONE / STOP CORSO BUTTON */}
            <button
              id="director-suspension-control-btn"
              onClick={() => setIsSuspensionModalOpen(true)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs ${
                suspensionInfo.isSuspended
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-white animate-bounce'
                  : 'bg-red-600 hover:bg-red-500 text-white border-white'
              }`}
            >
              {suspensionInfo.isSuspended ? (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isEn ? 'RESUME' : 'RIPRENDI'}</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 fill-current" />
                  <span>{isEn ? 'PAUSE COURSE' : 'STOP CORSO'}</span>
                </>
              )}
            </button>

            {/* SIMULATORE & ACCELERATORE TEMPO */}
            <button
              id="director-simulation-modal-btn"
              onClick={() => setIsSimulationModalOpen(true)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs ${
                timeMultiplier > 1
                  ? 'bg-orange-500 hover:bg-orange-400 text-black border-white animate-pulse'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-orange-400 hover:text-orange-300 border-orange-500'
              }`}
              title={isEn ? 'Open simulation and time accelerator console' : 'Apri console simulazione ed accelerazione temporale'}
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>{isEn ? 'SIMULATE' : 'SIMULA'} ({timeMultiplier}x)</span>
            </button>

            {/* BROADCAST BUTTON */}
            <button
              id="director-broadcast-trigger-btn"
              onClick={() => setIsBroadcastOpen(true)}
              className="flex-1 sm:flex-initial px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-yellow-400 font-black text-xs uppercase tracking-wider border border-yellow-500 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
            >
              <Radio className="w-3 h-3" />
              <span>BROADCAST</span>
            </button>

            {/* EXPORT DATA BUTTON */}
            <button
              id="director-export-data-btn"
              onClick={handleExportData}
              className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs uppercase border border-neutral-700 transition-all cursor-pointer flex items-center justify-center gap-1"
              title={isEn ? 'Export all data as JSON' : 'Esporta tutti i dati in JSON'}
            >
              <Download className="w-3 h-3" />
              <span>EXPORT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simplified, Responsive Sub-Menu Grid (Accessible on Mobile, Tablet & Desktop) */}
      <nav aria-label={isEn ? 'Director Menu' : 'Menu Sezioni Direzione'} className="bg-neutral-950 border border-neutral-800 p-1 sm:p-1.5 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-1.5">
          {/* Tab 1: Timeline & Regia */}
          <button
            id="director-tab-timeline-btn"
            onClick={() => setActiveSubTab('timeline')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'timeline'
                ? 'bg-yellow-500 text-black border-yellow-300 shadow-md font-black'
                : 'bg-neutral-900 text-yellow-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-yellow-500/50'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${activeSubTab === 'timeline' ? 'text-black' : 'text-yellow-400'}`} />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'TIMELINE & CONTROL' : 'REGIA & TIMELINE'}
              </span>
            </div>
          </button>

          {/* Tab 2: Gate & Orario */}
          <button
            id="director-tab-gate-btn"
            onClick={() => setActiveSubTab('schedule_gate')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border relative ${
              activeSubTab === 'schedule_gate'
                ? 'bg-orange-500 text-black border-orange-300 shadow-md font-black'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-orange-500/50'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${activeSubTab === 'schedule_gate' ? 'text-black' : 'text-orange-400'}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-1 justify-start sm:justify-center">
                <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider truncate">
                  {isEn ? 'START GATE' : 'GATE AVVIO'}
                </span>
                {!isCourseStarted && (
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping flex-shrink-0" />
                )}
              </div>
            </div>
          </button>

          {/* Tab 3: Checklists */}
          <button
            id="director-tab-checklists-btn"
            onClick={() => setActiveSubTab('checklists')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'checklists'
                ? 'bg-yellow-500 text-black border-yellow-300 shadow-md font-black'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-yellow-500/50'
            }`}
          >
            <ClipboardCheck className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${activeSubTab === 'checklists' ? 'text-black' : 'text-emerald-400'}`} />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'TECH CHECKLISTS' : 'CHECKLIST PRESIDI'}
              </span>
            </div>
          </button>

          {/* Tab 4: Messages */}
          <button
            id="director-tab-messages-btn"
            onClick={() => setActiveSubTab('messages')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border relative ${
              activeSubTab === 'messages'
                ? 'bg-orange-500 text-black border-orange-300 shadow-md font-black'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-orange-500/50'
            }`}
          >
            <MessageSquare className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${activeSubTab === 'messages' ? 'text-black' : 'text-orange-400'}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-1 justify-start sm:justify-center">
                <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider truncate">
                  {isEn ? 'FIELD MESSAGES' : 'MESSAGGI CAMPO'}
                </span>
                {pendingMessagesCount > 0 && (
                  <span className="bg-red-600 text-white text-[9px] font-mono font-black px-1.5 py-0.1 animate-pulse flex-shrink-0">
                    {pendingMessagesCount}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Tab 5: Sospensione */}
          <button
            id="director-tab-suspension-btn"
            onClick={() => setActiveSubTab('suspension')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'suspension'
                ? 'bg-red-600 text-white border-red-400 shadow-md font-black'
                : 'bg-neutral-900 text-red-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-red-500/50'
            }`}
          >
            <AlertOctagon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${activeSubTab === 'suspension' ? 'text-white' : 'text-red-400'}`} />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'PAUSE & SAFETY' : 'STOP & PAUSA'}
              </span>
            </div>
          </button>

          {/* Tab 6: Anagrafica Generale */}
          <button
            id="director-tab-anagrafica-btn"
            onClick={() => setActiveSubTab('anagrafica')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'anagrafica'
                ? 'bg-yellow-500 text-black border-yellow-300 shadow-md font-black'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-yellow-500/50'
            }`}
          >
            <Users className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${activeSubTab === 'anagrafica' ? 'text-black' : 'text-sky-400'}`} />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'DIRECTORY' : 'ANAGRAFICA'}
              </span>
            </div>
          </button>

          {/* Tab 7: Badge QR */}
          <button
            id="director-tab-badges-btn"
            onClick={() => setActiveSubTab('qr_badges')}
            className={`min-h-[48px] p-2.5 sm:py-3 sm:px-3 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-2 sm:gap-1 cursor-pointer border ${
              activeSubTab === 'qr_badges'
                ? 'bg-yellow-500 text-black border-yellow-300 shadow-lg font-black'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-yellow-500/50'
            }`}
          >
            <QrCode className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${activeSubTab === 'qr_badges' ? 'text-black' : 'text-purple-400'}`} />
            <div className="min-w-0">
              <span className="font-black text-xs uppercase tracking-wider block truncate">
                {isEn ? 'QR BADGES' : 'BADGE QR'}
              </span>
              <span className={`text-[10px] hidden sm:block truncate ${activeSubTab === 'qr_badges' ? 'text-neutral-900 font-bold' : 'text-neutral-500'}`}>
                {isEn ? 'Print & Badges' : 'Stampa & Accessi'}
              </span>
            </div>
          </button>

          {/* Tab 8: Scenari & Pazienti */}
          <button
            id="director-tab-scenari-btn"
            onClick={() => setActiveSubTab('scenari')}
            className={`min-h-[48px] p-2.5 sm:py-3 sm:px-3 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-2 sm:gap-1 cursor-pointer border ${
              activeSubTab === 'scenari'
                ? 'bg-yellow-500 text-black border-yellow-300 shadow-lg font-black'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-yellow-500/50'
            }`}
          >
            <Sliders className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${activeSubTab === 'scenari' ? 'text-black' : 'text-pink-400'}`} />
            <div className="min-w-0">
              <span className="font-black text-xs uppercase tracking-wider block truncate">
                {isEn ? 'SCENARIOS & CLINICAL' : 'SCENARI & CLINICA'}
              </span>
              <span className={`text-[10px] hidden sm:block truncate ${activeSubTab === 'scenari' ? 'text-neutral-900 font-bold' : 'text-neutral-500'}`}>
                {isEn ? '12 Patient Cases' : '12 Casi Complessi'}
              </span>
            </div>
          </button>

          {/* Tab 9: Analytics & Scoring */}
          <button
            id="director-tab-analytics-btn"
            onClick={() => setActiveSubTab('analytics')}
            className={`min-h-[48px] col-span-2 sm:col-span-1 lg:col-span-2 p-2.5 sm:py-3 sm:px-3 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-2 sm:gap-1 cursor-pointer border ${
              activeSubTab === 'analytics'
                ? 'bg-yellow-500 text-black border-yellow-300 shadow-lg font-black'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-yellow-500/50'
            }`}
          >
            <BarChart3 className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${activeSubTab === 'analytics' ? 'text-black' : 'text-lime-400'}`} />
            <div className="min-w-0">
              <span className="font-black text-xs uppercase tracking-wider block truncate">
                {isEn ? 'EVALUATIONS & SCORING' : 'VALUTAZIONI & SCORING'}
              </span>
              <span className={`text-[10px] hidden sm:block truncate ${activeSubTab === 'analytics' ? 'text-neutral-900 font-bold' : 'text-neutral-500'}`}>
                {isEn ? 'Scoring Matrix & Performance' : 'Matrice Scoring e Performance'}
              </span>
            </div>
          </button>
        </div>
      </nav>

      {/* SUBTAB 0: PROGRAMMAZIONE ORARIO & GATE AVVIO */}
      {activeSubTab === 'schedule_gate' && (
        <CourseScheduleGateCard />
      )}

      {/* SUBTAB CHECKLIST: CHECKLIST PRESIDI & SCENARI TECNICI */}
      {activeSubTab === 'checklists' && (
        <TechSessionChecklist />
      )}

      {/* SUBTAB 1: TIMELINE & MASTER REGIA */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          {/* Visuale Regia in Tempo Reale con Timeline Sincronizzata */}
          <RegiaVisualTimelineBoard
            onOpenMessenger={() => setIsMessengerOpen(true)}
            onOpenBroadcast={() => setIsBroadcastOpen(true)}
          />
        </div>
      )}

      {/* SUBTAB 2: SOSPENSIONE / STOP CORSO */}
      {activeSubTab === 'suspension' && (
        <div className="bg-neutral-900 border-2 border-neutral-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest font-mono">
                {isEn ? 'COURSE LOCK & RESUME SYSTEM' : 'SISTEMA DI BLOCCO E RIPARTENZA'}
              </span>
              <h3 className="text-2xl font-black text-white uppercase flex items-center gap-2">
                <AlertOctagon className="w-6 h-6 text-red-600" />
                <span>{isEn ? 'MANAGE COURSE SUSPENSION & GLOBAL EMERGENCY SIGNAL' : 'GESTIONE SOSPENSIONE CORSO & SEGNALE A TUTTE LE FIGURE'}</span>
              </h3>
            </div>

            <button
              onClick={() => setIsSuspensionModalOpen(true)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider border-2 border-white shadow-xl transition-all cursor-pointer"
            >
              {isEn ? 'OPEN CONTROL MODAL' : 'APRI MODALE DI CONTROLLO'}
            </button>
          </div>

          {/* Current State Card */}
          <div className="p-5 bg-neutral-950 border-2 border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-neutral-400 uppercase">{isEn ? 'CURRENT COURSE STATUS:' : 'STATO ATTUALE CORSO:'}</span>
              <span
                className={`text-xs font-black uppercase px-3 py-1 ${
                  suspensionInfo.isSuspended
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {suspensionInfo.isSuspended
                  ? (isEn ? '🔴 COURSE SUSPENDED' : '🔴 CORSO SOSPESO')
                  : (isEn ? '🟢 COURSE RUNNING NORMALLY' : '🟢 CORSO IN ESECUZIONE REGOLARE')}
              </span>
            </div>

            {suspensionInfo.isSuspended && (
              <div className="p-3 bg-red-950/70 border border-red-600 text-red-200 text-xs space-y-1">
                <p>
                  <strong>{isEn ? 'Suspension Reason: ' : 'Motivo Sospensione: '}</strong>
                  {suspensionInfo.reason}
                </p>
                <div className="font-mono text-[11px] text-neutral-300">
                  {isEn
                    ? `Suspended at ${suspensionInfo.suspendedAt} by ${suspensionInfo.suspendedBy}`
                    : `Sospeso alle ${suspensionInfo.suspendedAt} da ${suspensionInfo.suspendedBy}`}
                </div>
              </div>
            )}

            <p className="text-xs text-neutral-300 leading-relaxed font-medium">
              {isEn
                ? 'When the course is suspended, an urgent broadcast stop signal with audible alert is instantly dispatched to all participants (Learners, Faculty, Techs, Guests, and Public Displays). When the Director resumes the course, everyone receives a resume signal.'
                : 'Quando il corso viene sospeso, un segnale broadcast urgente di stop con suono viene recapitato istantaneamente a tutti i partecipanti (Discenti, Faculty, Tecnici, Ospiti e Schermo Pubblico). Quando il Direttore fa ripartire il corso, tutte le figure ricevono il segnale di ripartenza.'}
            </p>
          </div>
        </div>
      )}

      {/* SUBTAB 3: MESSAGGI DAL CAMPO */}
      {activeSubTab === 'messages' && (
        <CourseMessagesPanel
          onOpenBroadcast={() => setIsBroadcastOpen(true)}
          onOpenMessenger={() => setIsMessengerOpen(true)}
        />
      )}

      {/* SUBTAB 4: ANAGRAFICA GENERALE */}
      {activeSubTab === 'anagrafica' && <MasterAnagraficaManager />}

      {/* SUBTAB 5: BADGE QR & STAMPA */}
      {activeSubTab === 'qr_badges' && <PersonnelBadgeRegistry />}

      {/* SUBTAB 6: SCENARI & PAZIENTI */}
      {activeSubTab === 'scenari' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border-2 border-neutral-800 p-5 shadow-xl space-y-3">
            <h3 className="font-black text-lg text-white uppercase">
              {isEn ? `SIMULATED PATIENT MANAGEMENT (DAY 0${activeDay})` : `GESTIONE PAZIENTI SIMULATI (DAY 0${activeDay})`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {simulatorPatients
                .filter((p) => p.day === activeDay)
                .map((patient) => (
                  <div key={patient.id} className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-yellow-400 font-bold">
                        {patient.scenarioCode}
                      </span>
                      <button
                        onClick={() => setEditingPatient(patient)}
                        className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-yellow-400 border border-neutral-700 text-xs font-bold cursor-pointer"
                      >
                        {isEn ? 'Edit' : 'Modifica'}
                      </button>
                    </div>
                    <h4 className="font-bold text-sm text-white">{patient.name}</h4>
                    <p className="text-xs text-neutral-400">{patient.briefing}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 7: VALUTAZIONI & REPORT */}
      {activeSubTab === 'analytics' && (
        <AggregatePerformanceMetrics />
      )}

      {/* Modals */}
      <CourseSuspensionModal
        isOpen={isSuspensionModalOpen}
        onClose={() => setIsSuspensionModalOpen(false)}
      />

      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
      />

      <CourseMessengerModal
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
        defaultSubject={isEn ? 'Communication from Course Direction' : 'Comunicazione dalla Direzione'}
        defaultStation={isEn ? 'Mission Control / Direction' : 'Regia / Direzione Corso'}
      />
    </div>
  );
};
