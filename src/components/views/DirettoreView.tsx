import React, { useState, useEffect } from 'react';
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
  Monitor,
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
  Calendar,
  CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react';
import { Director, Discente, Faculty, SimulatorPatient, Team, Technician } from '../../types';
import { MasterAnagraficaManager } from '../anagrafica/MasterAnagraficaManager';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { CourseScheduleGateCard } from '../CourseScheduleGateCard';

import { TechSessionChecklist } from '../TechSessionChecklist';
import { RegiaVisualTimelineBoard } from '../regia/RegiaVisualTimelineBoard';
import { AggregatePerformanceMetrics } from '../director/AggregatePerformanceMetrics';
import { DirectorQRLoginGenerator } from '../director/DirectorQRLoginGenerator';
import { SquadRealtimeStatusBoard } from '../director/SquadRealtimeStatusBoard';
import { DebugTranslationsView } from '../director/DebugTranslationsView';
import { ClipboardCheck, Bug } from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';

const CourseScheduleInfoCard: React.FC = () => {
  const { language, courseStartSchedule, isCourseStarted, timeRemainingMs } = useCourse();
  const isEn = language === 'en';

  const totalSeconds = Math.floor(timeRemainingMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="bg-neutral-900 border-2 border-neutral-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0 text-orange-400">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-black uppercase text-orange-400 tracking-wider">
              {isEn ? 'COURSE SCHEDULE & GATE STATUS' : 'ORARIO PROGRAMMATO & STATO GATE'}
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 ${isCourseStarted ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
              {isCourseStarted ? (isEn ? 'UNLOCKED (RUNNING)' : 'SBLOCCATO (IN CORSO)') : (isEn ? 'LOCKED (COUNTDOWN)' : 'BLOCCATO (CONTO ALLA ROVESCIA)')}
            </span>
          </div>
          <div className="text-sm font-black text-white flex items-center gap-2 mt-0.5">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span>{courseStartSchedule.scheduledDate || '—'} ore {courseStartSchedule.scheduledTime || '08:30'}</span>
          </div>
        </div>
      </div>

      <div className="bg-neutral-950 border border-neutral-800 px-4 py-2 flex items-center gap-4 flex-shrink-0">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
            {!isCourseStarted ? (isEn ? 'Countdown to Start:' : 'Tempo all\'Avvio:') : (isEn ? 'Status:' : 'Stato:')}
          </span>
          {!isCourseStarted ? (
            <div className="text-base font-mono font-black text-orange-400">
              {days > 0 && `${days}${isEn ? 'd ' : 'g '}`}{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          ) : (
            <div className="text-sm font-mono font-black text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {isEn ? 'Active & Running' : 'Corso Avviato'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DirettoreViewProps {
  isRegiaView?: boolean;
}

export const DirettoreView: React.FC<DirettoreViewProps> = ({ isRegiaView = false }) => {
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
    regiaStaff,
    selectedRegiaId,
    setSelectedRegiaId,
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
    phaseShiftLogs,
    clearPhaseShiftLogs,
    publicLayoutMode,
    setPublicLayoutMode,
    userRole,
    setUserRole,
  } = useCourse();

  const isEn = language === 'en';

  const [activeSubTab, setActiveSubTab] = useState<
    'timeline' | 'schedule_gate' | 'checklists' | 'squads_status' | 'anagrafica' | 'qr_login' | 'scenari' | 'analytics' | 'debug_translations' | 'debriefing_logs'
  >('timeline');

  // Scenario edit modal state
  const [editingPatient, setEditingPatient] = useState<SimulatorPatient | null>(null);

  // Active Director & Regia Identification
  const currentDirector =
    directors.find((d) => d.id === selectedDirectorId) ||
    directors[0] || {
      id: 'dir-1',
      name: 'Direttore Corso',
      role: 'Direttore Scientifico',
      phone: '+39 000 000000',
      badgeCode: 'DIR-01',
    };

  const currentRegia =
    regiaStaff.find((r) => r.id === selectedRegiaId) ||
    regiaStaff[0] || {
      id: 'regia-1',
      name: 'Operatore Regia',
      title: 'Regia & Mission Control',
      role: 'Coordinatore Centrale',
      phone: '+39 000 000000',
      badgeCode: 'REGIA-01',
      isMaster: true,
    };

  const activeProfile = isRegiaView ? currentRegia : currentDirector;
  const isMasterDirector = isRegiaView || userRole === 'regia' || Boolean((activeProfile as any)?.isMaster);

  useEffect(() => {
    if (!isMasterDirector && (activeSubTab === 'schedule_gate' || activeSubTab === 'debug_translations')) {
      setActiveSubTab('timeline');
    }
  }, [isMasterDirector, activeSubTab]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleDownloadLogsCSV = () => {
    if (phaseShiftLogs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'DateTime', 'AlertType', 'Title', 'Message', 'SenderName', 'RecordedByTechName'];
    const rows = phaseShiftLogs.map(log => [
      log.id,
      `"${log.timestamp}"`,
      `"${log.dateTimeStr}"`,
      `"${log.alertType}"`,
      `"${(log.title || '').replace(/"/g, '""')}"`,
      `"${(log.message || '').replace(/"/g, '""')}"`,
      `"${(log.senderName || '').replace(/"/g, '""')}"`,
      `"${(log.recordedByTechName || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trauma_sim_debriefing_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      {/* Director / Regia Top Header with Live Controls */}
      <div className={`bg-neutral-950 ${isRegiaView ? 'border-2 border-pink-500/80' : 'border-2 border-yellow-500/80'} p-3 sm:p-4 shadow-xl space-y-2.5`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 ${isRegiaView ? 'bg-pink-600 text-white' : 'bg-yellow-500 text-black'} text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs`}>
                <ShieldCheck className="w-3 h-3" />
                {isRegiaView ? (isEn ? 'REGIA & MISSION CONTROL ROOM' : 'CENTRALE REGIA & MISSION CONTROL') : (isEn ? 'COURSE DIRECTION & MISSION CONTROL' : 'DIREZIONE CORSO & REGIA')}
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

            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 flex-wrap truncate">
              <span>{activeProfile.name}</span>
              {Boolean((activeProfile as any).isMaster) && (
                <span className={`px-2 py-0.5 ${isRegiaView ? 'bg-pink-500 text-black' : 'bg-amber-500 text-black'} font-black text-xs uppercase tracking-wider shadow-sm`}>
                  ★ {isRegiaView ? 'MASTER REGIA' : 'MASTER (ACCESSO TOTALE)'}
                </span>
              )}
            </h2>
            <p className={`text-xs ${isRegiaView ? 'text-pink-200/90' : 'text-yellow-200/90'} font-medium flex items-center gap-2 flex-wrap`}>
              <span>{isEn ? 'Role' : 'Ruolo'}: <strong className="text-white">{(activeProfile as any).role || (activeProfile as any).title}</strong></span>
              <span className="text-neutral-600">•</span>
              <span>{isEn ? 'Phone' : 'Tel'}: <span className={`font-mono ${isRegiaView ? 'text-pink-400' : 'text-yellow-400'} font-bold`}>{activeProfile.phone}</span></span>
            </p>
          </div>

          {/* Global Action Triggers & Language Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <LanguageSwitcher variant="badge" />

            {/* PUBLIC VIEW LAYOUT MODE TOGGLE (SINGLE vs MULTI-MONITOR) */}
            <button
              id="director-public-layout-toggle-btn"
              onClick={() => setPublicLayoutMode(publicLayoutMode === 'single' ? 'multi' : 'single')}
              className={`px-3 py-1.5 font-black text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                publicLayoutMode === 'multi'
                  ? 'bg-amber-500 text-black border-amber-400 font-extrabold'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-700'
              }`}
              title={isEn ? 'Switch Public View Broadcast between Single & Multi-Monitor layout' : 'Alterna visuale pubblica tra Monitor Singolo e Multi-Monitor'}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{publicLayoutMode === 'multi' ? (isEn ? 'Multi-Monitor 🖥️🖥️' : 'Multi-Schermo 🖥️🖥️') : (isEn ? 'Single-Monitor 🖥️' : 'Monitor Singolo 🖥️')}</span>
            </button>



            {/* SWITCH TO REGIA VIEW BUTTON */}
            <button
              id="director-switch-to-regia-btn"
              onClick={() => setUserRole('regia')}
              className="flex-1 sm:flex-initial px-3 py-1.5 bg-pink-950 hover:bg-pink-900 text-pink-300 font-black text-xs uppercase tracking-wider border border-pink-600 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              title={isEn ? 'Switch to Regia & Mission Control View' : 'Passa alla Visuale Regia & Mission Control'}
            >
              <Radio className="w-3 h-3 text-pink-400" />
              <span>REGIA</span>
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

          {/* Tab 2: Gate & Orario (Master / Regia Only) */}
          {isMasterDirector && (
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
          )}



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

          {/* Tab 3.5: 12 Squads Status */}
          <button
            id="director-tab-squads-status-btn"
            onClick={() => setActiveSubTab('squads_status')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'squads_status'
                ? 'bg-yellow-500 text-black border-yellow-300 shadow-md font-black'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-yellow-500/50'
            }`}
          >
            <Users className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${activeSubTab === 'squads_status' ? 'text-black' : 'text-blue-400'}`} />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? '12 SQUADS LIVE' : '12 SQUADRE LIVE'}
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



          {/* Tab 7.5: QR Login Links */}
          <button
            id="director-tab-qr-login-btn"
            onClick={() => setActiveSubTab('qr_login')}
            className={`min-h-[48px] p-2.5 sm:py-3 sm:px-3 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-2 sm:gap-1 cursor-pointer border ${
              activeSubTab === 'qr_login'
                ? 'bg-yellow-500 text-black border-yellow-300 shadow-lg font-black'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-yellow-500/50'
            }`}
          >
            <QrCode className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${activeSubTab === 'qr_login' ? 'text-black' : 'text-orange-400'}`} />
            <div className="min-w-0">
              <span className="font-black text-xs uppercase tracking-wider block truncate">
                {isEn ? 'QR LOGIN' : 'QR LOGIN'}
              </span>
              <span className={`text-[10px] hidden sm:block truncate ${activeSubTab === 'qr_login' ? 'text-neutral-900 font-bold' : 'text-neutral-500'}`}>
                {isEn ? 'Direct Role Access' : 'Accesso Rapido Ruoli'}
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
            className={`min-h-[48px] p-2.5 sm:py-3 sm:px-3 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-2 sm:gap-1 cursor-pointer border ${
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

          {/* Tab 10: Debug Translations */}
          {isMasterDirector && (
            <button
              id="director-tab-debug-translations-btn"
              onClick={() => setActiveSubTab('debug_translations')}
              className={`min-h-[48px] p-2.5 sm:py-3 sm:px-3 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-2 sm:gap-1 cursor-pointer border ${
                activeSubTab === 'debug_translations'
                  ? 'bg-yellow-500 text-black border-yellow-300 shadow-lg font-black'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-yellow-500/50'
              }`}
            >
              <Bug className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${activeSubTab === 'debug_translations' ? 'text-black' : 'text-yellow-400'}`} />
              <div className="min-w-0">
                <span className="font-black text-xs uppercase tracking-wider block truncate">
                  {isEn ? 'DEBUG TRANSLATIONS' : 'DEBUG TRADUZIONI'}
                </span>
                <span className={`text-[10px] hidden sm:block truncate ${activeSubTab === 'debug_translations' ? 'text-neutral-900 font-bold' : 'text-neutral-500'}`}>
                  {isEn ? 'Localization Inspector' : 'Ispettore Localizzazione'}
                </span>
              </div>
            </button>
          )}

          {/* Tab 11: Debriefing Logs (Phase Shifts) */}
          <button
            id="director-tab-debriefing-logs-btn"
            onClick={() => setActiveSubTab('debriefing_logs')}
            className={`min-h-[48px] p-2.5 sm:py-3 sm:px-3 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-2 sm:gap-1 cursor-pointer border ${
              activeSubTab === 'debriefing_logs'
                ? 'bg-yellow-500 text-black border-yellow-300 shadow-lg font-black'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-yellow-500/50'
            }`}
          >
            <Clock className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${activeSubTab === 'debriefing_logs' ? 'text-black' : 'text-yellow-400'}`} />
            <div className="min-w-0">
              <span className="font-black text-xs uppercase tracking-wider block truncate">
                {isEn ? 'DEBRIEFING LOGS' : 'LOG DEBRIEFING FASI'}
              </span>
              <span className={`text-[10px] hidden sm:block truncate ${activeSubTab === 'debriefing_logs' ? 'text-neutral-900 font-bold' : 'text-neutral-500'}`}>
                {phaseShiftLogs.length} {isEn ? 'Shift Events' : 'Eventi Registrati'}
              </span>
            </div>
          </button>
        </div>
      </nav>

      {/* SUBTAB 11: DEBRIEFING LOGS */}
      {activeSubTab === 'debriefing_logs' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-neutral-100 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-yellow-400 uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-6 h-6 text-yellow-400" />
                {isEn ? 'Post-Simulation Debriefing Logs (Phase Shifts)' : 'Log Post-Simulazione per Debriefing (Cambio Fasi)'}
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                {isEn
                  ? 'Timestamped event logs recorded automatically by technician view for broadcast alert phase shifts.'
                  : 'Log cronologici di eventi registrati automaticamente dalla vista tecnici per i cambi di fase e broadcast.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1 bg-yellow-500/10 text-yellow-400 font-bold border border-yellow-500/30 rounded-full">
                {phaseShiftLogs.length} {isEn ? 'Events Logged' : 'Eventi Registrati'}
              </span>
              <button
                onClick={handleDownloadLogsCSV}
                disabled={phaseShiftLogs.length === 0}
                className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow"
                title={isEn ? 'Download timestamped event logs as CSV' : 'Scarica log in formato CSV per debriefing'}
              >
                <Download className="w-3.5 h-3.5" />
                {isEn ? 'Download Logs (CSV)' : 'Scarica Log (CSV)'}
              </button>
              {phaseShiftLogs.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm(isEn ? 'Clear all phase shift debriefing logs?' : 'Cancellare tutti i log di debriefing fase?')) {
                      clearPhaseShiftLogs();
                    }
                  }}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isEn ? 'Clear' : 'Svuota'}
                </button>
              )}
            </div>
          </div>

          {phaseShiftLogs.length === 0 ? (
            <div className="text-center py-16 bg-neutral-950/50 rounded-xl border border-neutral-800/80 p-8 space-y-3">
              <div className="w-12 h-12 bg-neutral-800 text-neutral-400 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-300">
                {isEn ? 'No Phase Shift Logs Recorded Yet' : 'Nessun Log di Cambio Fase Registrato'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                {isEn
                  ? 'When broadcast alerts or phase changes are triggered while technicians are active, timestamps and event details will appear here for director debriefing.'
                  : 'Quando vengono inviati avvisi broadcast o cambi di fase con la vista tecnici attiva, i timestamp e i dettagli compariranno qui per il debriefing della direzione.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {phaseShiftLogs.map((log, idx) => (
                <div
                  key={log.id}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 hover:border-yellow-500/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2.5 py-0.5 bg-yellow-500 text-black font-black rounded font-mono">
                        #{phaseShiftLogs.length - idx}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 bg-neutral-800 text-neutral-300 font-bold rounded flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-yellow-400" />
                        {log.timestamp} ({log.dateTimeStr})
                      </span>
                      <span className="text-xs px-2.5 py-0.5 bg-lime-500/10 text-lime-400 border border-lime-500/30 font-bold rounded">
                        {log.alertType.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      {log.title}
                    </h4>
                    <p className="text-xs text-neutral-300 bg-neutral-900/80 p-3 rounded-lg border border-neutral-800">
                      {log.message}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right flex-shrink-0 text-xs text-neutral-400">
                    <div className="flex items-center gap-1">
                      <span className="text-neutral-500">{isEn ? 'Sender:' : 'Mittente:'}</span>
                      <span className="text-white font-bold">{log.senderName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-neutral-500">{isEn ? 'Logged by Tech:' : 'Registrato da Tech:'}</span>
                      <span className="text-yellow-400 font-bold">{log.recordedByTechName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* SUBTAB 0: PROGRAMMAZIONE ORARIO & GATE AVVIO */}
      {isMasterDirector && activeSubTab === 'schedule_gate' && (
        <CourseScheduleGateCard />
      )}

      {/* SUBTAB CHECKLIST: CHECKLIST PRESIDI & SCENARI TECNICI */}
      {activeSubTab === 'checklists' && (
        <TechSessionChecklist />
      )}

      {/* SUBTAB 3.5: 12 SQUADS REALTIME STATUS */}
      {activeSubTab === 'squads_status' && (
        <SquadRealtimeStatusBoard />
      )}

      {/* SUBTAB 1: TIMELINE & MASTER REGIA */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          {!isMasterDirector && <CourseScheduleInfoCard />}
          {/* Visuale Regia in Tempo Reale con Timeline Sincronizzata */}
          <RegiaVisualTimelineBoard
            isMaster={isMasterDirector}
          />
        </div>
      )}



      {/* SUBTAB 4: ANAGRAFICA GENERALE */}
      {activeSubTab === 'anagrafica' && <MasterAnagraficaManager />}

      {/* SUBTAB 5.5: QR LOGIN GENERATOR */}
      {activeSubTab === 'qr_login' && <DirectorQRLoginGenerator />}

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

      {/* SUBTAB 8: DEBUG TRANSLATIONS */}
      {isMasterDirector && activeSubTab === 'debug_translations' && (
        <DebugTranslationsView />
      )}

    </div>
  );
};
