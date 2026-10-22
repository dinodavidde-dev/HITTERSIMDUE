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
  Sparkles,
  Wifi,
  Monitor,
  ExternalLink,
  ChevronDown,
  GraduationCap,
  Wrench,
  Award,
  Scale,
  Crown,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { MasterAnagraficaManager } from '../anagrafica/MasterAnagraficaManager';
import { CourseSuspensionModal } from '../CourseSuspensionModal';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { ScenariMasterListView } from './ScenariMasterListView';
import { TruccoView } from './TruccoView';
import { RegiaVisualTimelineBoard } from '../regia/RegiaVisualTimelineBoard';
import { PreCourseDirectorBanner } from '../common/PreCourseDirectorBanner';
import { TcccPreAlertCountdownBanner } from '../common/TcccPreAlertCountdownBanner';
import { isPreAllertaTcccSlot } from '../../utils/scenarioStatusHelper';
import { RegiaDeviceStatusDashboard } from '../regia/RegiaDeviceStatusDashboard';
import { FreeAccessAuthorizationModal } from '../regia/FreeAccessAuthorizationModal';
import { StartStopConfirmationModal } from '../regia/StartStopConfirmationModal';
import { openVisualeInNewWindow } from '../../utils/qrCodeUtils';
import { RegiaAssetDashboardView } from './RegiaAssetDashboardView';
import { RegiaMascalCountdownBadge } from '../regia/RegiaMascalCountdownBadge';

export const MasterView: React.FC = () => {
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
    freeAccessEnabled,
  } = useCourse();

  const isEn = language === 'en';
  const isPreAllertaTccc = isPreAllertaTcccSlot(currentSlot);

  const currentMaster =
    regiaStaff.find((r) => r.isMaster) ||
    regiaStaff.find((r) => r.id === selectedRegiaId) ||
    regiaStaff[0] || {
      id: 'master-1',
      name: 'Direttore & Master Control',
      title: 'Comandante Master Control Room',
      role: 'Super-Admin Didattico & Clinico',
      nationality: 'Italiana',
      phone: '+39 000 000000',
      email: 'master@traumasim.it',
      organization: 'Tactical Emergency Trauma Team',
      badgeCode: 'MASTER-01',
      isMaster: true,
    };

  const [activeSubTab, setActiveSubTab] = useState<
    'timeline' | 'devices' | 'asset' | 'scenari' | 'trucco' | 'suspension' | 'anagrafica'
  >('timeline');
  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);
  const [isFreeAccessModalOpen, setIsFreeAccessModalOpen] = useState(false);
  const [isStartStopConfirmOpen, setIsStartStopConfirmOpen] = useState(false);
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);

  // Navigazione menu START & STOP: se il corso è attivo, chiedi conferma preventiva prima di accedere
  const handleSelectStartStop = () => {
    const isCourseActive = isCourseStarted || isTimerRunning;
    if (isCourseActive && activeSubTab !== 'suspension') {
      setIsStartStopConfirmOpen(true);
    } else {
      setActiveSubTab('suspension');
    }
  };

  const copyPublicUrl = () => {
    const url = `${window.location.origin}${window.location.pathname}?view=public`;
    navigator.clipboard.writeText(url);
    setCopiedPublicLink(true);
    setTimeout(() => setCopiedPublicLink(false), 3000);
  };

  const currentSlotInDayIdx = filteredSlots.findIndex((s) => s.id === currentSlot?.id);
  const effectiveSlotInDay = currentSlotInDayIdx >= 0 ? currentSlotInDayIdx : 0;

  return (
    <div className="space-y-4 pb-12">
      {/* Banner Countdown Inizio Corso */}
      <PreCourseDirectorBanner variant="regia" />

      {/* Supreme Master Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-rose-950 border-2 border-amber-500/80 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            {/* Top Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Crown className="w-3.5 h-3.5 fill-black stroke-black" />
                {isEn ? 'SUPREME MASTER CONTROL ROOM' : 'CENTRALE SUPREMA MASTER CONTROL'}
              </span>

              <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-600 text-[10px] sm:text-[11px] font-mono font-bold flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-amber-400" />
                <span>PIN: 251201</span>
              </span>

              <span className="text-[11px] text-neutral-300 font-mono font-bold px-2.5 py-1 bg-neutral-900 border border-neutral-700">
                DAY 0{activeDay} • {isEn ? 'SLOT' : 'SLOT'} {effectiveSlotInDay + 1}/{filteredSlots.length}
              </span>

              {isPreAllertaTccc && (
                <span className="bg-amber-500 text-black font-black text-[11px] px-2.5 py-1 animate-pulse flex items-center gap-1 shadow-md">
                  ⚠️ {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')} •{' '}
                  {isEn ? 'TCCC PRE-ALERT (T -15)' : 'PRE-ALLERTA TCCC (T -15)'}
                </span>
              )}

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

              <span className="bg-amber-950/90 text-amber-300 border border-amber-500/80 text-[11px] font-mono font-black px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>{isEn ? 'MASTER ANCHORED (LIVE)' : 'VISUALE MASTER ANCORATA'}</span>
              </span>

              {/* MASCAL 21:00-23:00 Countdown & Quick Jump Badge */}
              <RegiaMascalCountdownBadge variant="topbar" />
            </div>

            {/* Title & Operator */}
            <div className="flex items-center gap-3 flex-wrap pt-1">
              <span className="px-2.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-700/80 text-xs font-mono font-black">
                {currentMaster.badgeCode || 'MASTER-01'}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2 flex-wrap truncate">
                <span>{currentMaster.name}</span>
                <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-current" />
                  ★ SUPER-ADMIN MASTER
                </span>
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 text-xs font-mono">
              <span className="text-amber-200/90 font-medium">
                {isEn ? 'Role:' : 'Ruolo:'} <strong className="text-white">{currentMaster.role || currentMaster.title}</strong>
              </span>
              {currentMaster.organization && (
                <>
                  <span className="text-neutral-600 hidden sm:inline">•</span>
                  <span className="text-neutral-300">
                    {isEn ? 'Org:' : 'Ente:'} <strong className="text-white">{currentMaster.organization}</strong>
                  </span>
                </>
              )}
              {currentMaster.email && (
                <>
                  <span className="text-neutral-600 hidden sm:inline">•</span>
                  <span className="text-neutral-400">
                    Email: <span className="text-amber-300">{currentMaster.email}</span>
                  </span>
                </>
              )}
              <span className="text-neutral-600 hidden sm:inline">•</span>
              <span className="text-neutral-300">
                Tel: <span className="text-amber-400 font-bold">{currentMaster.phone}</span>
              </span>
            </div>

            {/* Fast Mode Switcher for Master User */}
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {isEn ? 'Direct Role Switcher:' : 'Switch Rapido Visuali:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setUserRole('regia');
                  setCurrentTab('regia');
                }}
                className="px-2.5 py-0.5 bg-pink-950 hover:bg-pink-900 text-pink-300 border border-pink-600 font-mono text-[11px] font-bold rounded cursor-pointer transition-colors"
                title={isEn ? 'Switch to Standard Regia View' : 'Passa alla visuale Regia Standard'}
              >
                ➔ {isEn ? 'Regia View' : 'Visuale Regia'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserRole('direttore');
                  setCurrentTab('direttori');
                }}
                className="px-2.5 py-0.5 bg-yellow-950 hover:bg-yellow-900 text-yellow-300 border border-yellow-600 font-mono text-[11px] font-bold rounded cursor-pointer transition-colors"
                title={isEn ? 'Switch to Direction View' : 'Passa alla visuale Direzione'}
              >
                ➔ {isEn ? 'Directors View' : 'Visuale Direzione'}
              </button>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 font-mono text-[11px] font-black rounded">
                ★ {isEn ? 'MASTER ACTIVE' : 'MASTER ATTIVO'}
              </span>
            </div>
          </div>

          {/* Quick External Actions Bar (INCLUDES DIRECTORS FOR MASTER!) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Visuale Discente */}
            <button
              id="master-open-discente-btn"
              onClick={() => openVisualeInNewWindow('discente', 'master')}
              className="px-2.5 sm:px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-black text-xs uppercase tracking-wider border border-cyan-500 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              title={isEn ? 'Open Learner View in new window' : 'Apri Visuale Discente in una nuova finestra'}
            >
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEn ? 'LEARNER VIEW' : 'VISUALE DISCENTI'}</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </button>

            {/* Dashboard Regia Asset */}
            <button
              id="master-open-asset-btn"
              onClick={() => setActiveSubTab('asset')}
              className={`px-2.5 sm:px-3 py-1.5 font-black text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                activeSubTab === 'asset'
                  ? 'bg-emerald-600 text-black border-emerald-300 ring-2 ring-emerald-400'
                  : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-600'
              }`}
              title={isEn ? 'Open Regia Asset & Workload Dashboard' : 'Apri Dashboard Regia Asset & Carichi'}
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEn ? 'REGIA ASSET' : 'REGIA ASSET'}</span>
            </button>

            {/* Visuale Tecnici */}
            <button
              id="master-open-tecnici-btn"
              onClick={() => openVisualeInNewWindow('tecnici', 'master')}
              className="px-2.5 sm:px-3 py-1.5 bg-pink-950 hover:bg-pink-900 text-pink-300 font-black text-xs uppercase tracking-wider border border-pink-500 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              title={isEn ? 'Open Technician View in new window' : 'Apri Visuale Tecnici in una nuova finestra'}
            >
              <Wrench className="w-3.5 h-3.5 text-pink-400" />
              <span>{isEn ? 'TECH VIEW' : 'VISUALE TECNICI'}</span>
              <ExternalLink className="w-3 h-3 text-pink-400" />
            </button>

            {/* Visuale Trucco */}
            <button
              id="master-open-trucco-btn"
              onClick={() => openVisualeInNewWindow('trucco', 'master')}
              className="px-2.5 sm:px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-pink-200 font-black text-xs uppercase tracking-wider border border-pink-400 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              title={isEn ? 'Open Makeup & Moulage Timeline in new window' : 'Apri Visuale Trucco & Timeline in una nuova finestra'}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>{isEn ? 'MAKEUP VIEW' : 'VISUALE TRUCCO'}</span>
              <ExternalLink className="w-3 h-3 text-pink-400" />
            </button>

            {/* Visuale Faculty */}
            <button
              id="master-open-faculty-btn"
              onClick={() => openVisualeInNewWindow('faculty', 'master')}
              className="px-2.5 sm:px-3 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 font-black text-xs uppercase tracking-wider border border-amber-500 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              title={isEn ? 'Open Faculty View in new window' : 'Apri Visuale Faculty in una nuova finestra'}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'FACULTY VIEW' : 'VISUALE FACULTY'}</span>
              <ExternalLink className="w-3 h-3 text-amber-400" />
            </button>

            {/* Visuale Direttori (RE-ENABLED AND PRESERVED FOR MASTER!) */}
            <button
              id="master-open-direttori-btn"
              onClick={() => openVisualeInNewWindow('direttori', 'master')}
              className="px-2.5 sm:px-3 py-1.5 bg-yellow-950 hover:bg-yellow-900 text-yellow-300 font-black text-xs uppercase tracking-wider border border-yellow-500 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md ring-1 ring-yellow-400/40"
              title={isEn ? 'Master Privilege: Open Directors View in new window' : 'Privilegio Master: Apri visuale Direttori in nuova finestra'}
            >
              <Users className="w-3.5 h-3.5 text-yellow-400" />
              <span>{isEn ? 'DIRECTORS' : 'DIRETTORI'}</span>
              <ExternalLink className="w-3 h-3 text-yellow-400" />
            </button>

            {/* Visuale Pubblica */}
            <button
              id="master-open-public-btn"
              onClick={() => openVisualeInNewWindow('public', 'master')}
              className="px-2.5 sm:px-3 py-1.5 bg-orange-950 hover:bg-orange-900 text-orange-300 font-bold text-xs uppercase border border-orange-500 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              title={isEn ? 'Open Public Live View in new window' : 'Apri Visuale Pubblica in una nuova finestra'}
            >
              <Monitor className="w-3.5 h-3.5 text-orange-400" />
              <span>{isEn ? 'PUBLIC LIVE' : 'VISUALE PUBBLICA'}</span>
              <ExternalLink className="w-3 h-3 text-orange-400" />
            </button>

            {/* Copia Link */}
            <button
              onClick={copyPublicUrl}
              className="px-2.5 sm:px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs uppercase border border-neutral-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              title={isEn ? 'Copy Public Link to Clipboard' : 'Copia Link Pubblico negli appunti'}
            >
              {copiedPublicLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Globe className="w-3.5 h-3.5 text-neutral-400" />}
              <span>{copiedPublicLink ? (isEn ? 'Copied!' : 'Copiato!') : (isEn ? 'Copy Link' : 'Copia Link')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TCCC Pre-Alert Flashing Countdown Banner */}
      {isPreAllertaTccc && <TcccPreAlertCountdownBanner role="regia" />}

      {/* Master Navigation Menu (All 8 Core Sections of Regia) */}
      <nav aria-label="Menu Master" className="bg-neutral-950 border border-neutral-800 p-1 sm:p-1.5 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-1 sm:gap-1.5">
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'timeline'
                ? 'bg-amber-600 text-black border-amber-300 shadow-md font-black ring-1 ring-amber-400'
                : 'bg-neutral-900 text-amber-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-amber-500/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'CONTROL & TIMELINE' : 'MASTER TIMELINE'}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('devices')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'devices'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md font-black'
                : 'bg-neutral-900 text-cyan-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-cyan-500/50'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'DEVICES & SYNC' : 'STATO DISPOSITIVI & SYNC'}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('asset')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'asset'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-black border-emerald-400 shadow-md font-black'
                : 'bg-neutral-900 text-emerald-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-emerald-500/50'
            }`}
          >
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-emerald-400" />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'ASSET CONTROL' : 'REGIA ASSET'}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('scenari')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'scenari'
                ? 'bg-amber-600 text-black border-amber-300 shadow-md font-black'
                : 'bg-neutral-900 text-amber-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-amber-500/50'
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
            onClick={() => setActiveSubTab('trucco')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'trucco'
                ? 'bg-rose-600 text-white border-rose-400 shadow-md font-black'
                : 'bg-neutral-900 text-pink-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-pink-500/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-pink-400" />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'MAKEUP TIMELINE' : 'VISUALE TRUCCO'}
              </span>
            </div>
          </button>

          <button
            onClick={handleSelectStartStop}
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
                ? 'bg-amber-600 text-black border-amber-300 shadow-md font-black'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-amber-500/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-amber-400" />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'GLOBAL ROSTER' : 'ANAGRAFICA GLOBALE'}
              </span>
            </div>
          </button>

          {/* Comando Regia: Accesso Libero */}
          <button
            type="button"
            id="master-accesso-libero-btn"
            onClick={() => setIsFreeAccessModalOpen(true)}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              freeAccessEnabled
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-emerald-300 shadow-md ring-2 ring-emerald-400 font-black'
                : 'bg-neutral-900 text-cyan-400 border-cyan-800/80 hover:text-white hover:bg-neutral-850 hover:border-cyan-500'
            }`}
            title={
              freeAccessEnabled
                ? (isEn ? 'Free Access Active: Trainees can login with Name & Surname' : 'Accesso Libero ATTIVO: Discenti possono accedere con Nome e Cognome')
                : (isEn ? 'Control Room: Authorize Free Direct Access for Trainees' : 'Comando Master: Autorizza Accesso Libero Diretto per Discenti')
            }
          >
            {freeAccessEnabled ? (
              <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-emerald-200" />
            ) : (
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-cyan-400" />
            )}
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {freeAccessEnabled ? (isEn ? 'ACCESSO LIBERO: ON' : 'ACCESSO LIBERO: ON') : (isEn ? 'ACCESSO LIBERO' : 'ACCESSO LIBERO')}
              </span>
            </div>
          </button>
        </div>
      </nav>

      {/* Subtab Contents */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          <RegiaVisualTimelineBoard isMaster={true} />
        </div>
      )}

      {activeSubTab === 'devices' && (
        <div className="space-y-6">
          <RegiaDeviceStatusDashboard />
        </div>
      )}

      {activeSubTab === 'scenari' && (
        <div className="space-y-6">
          <ScenariMasterListView />
        </div>
      )}

      {activeSubTab === 'trucco' && (
        <div className="space-y-6">
          <TruccoView />
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

            {/* Presets rapidi */}
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

          {/* START & STOP Controllo Sospensione */}
          <div className="bg-neutral-900 border-2 border-red-600/80 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest font-mono">
                  {isEn ? 'MASTER LOCK & RESUME SYSTEM' : 'SISTEMA DI BLOCCO E RIPARTENZA MASTER'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase flex items-center gap-2">
                  <AlertOctagon className="w-6 h-6 text-red-600 animate-pulse" />
                  <span>
                    {isEn
                      ? 'START & STOP CONTROL & GLOBAL EMERGENCY SIGNAL'
                      : 'CONTROLLO START & STOP & SEGNALE EMERGENZA GLOBALE'}
                  </span>
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
                <span className="text-xs font-black text-neutral-400 uppercase">
                  {isEn ? 'CURRENT COURSE STATUS:' : 'STATO ATTUALE CORSO:'}
                </span>
                <span
                  className={`text-xs font-black uppercase px-3 py-1 ${
                    suspensionInfo.isSuspended ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {suspensionInfo.isSuspended
                    ? (isEn ? '🔴 COURSE SUSPENDED' : '🔴 CORSO SOSPESO')
                    : (isEn ? '🟢 COURSE RUNNING NORMALLY' : '🟢 CORSO IN ESECUZIONE REGOLARE')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'asset' && (
        <div className="space-y-6">
          <RegiaAssetDashboardView />
        </div>
      )}

      {activeSubTab === 'anagrafica' && <MasterAnagraficaManager initialSection="regia" />}

      {/* Modals */}
      <CourseSuspensionModal isOpen={isSuspensionModalOpen} onClose={() => setIsSuspensionModalOpen(false)} />
      <FreeAccessAuthorizationModal isOpen={isFreeAccessModalOpen} onClose={() => setIsFreeAccessModalOpen(false)} />
      <StartStopConfirmationModal
        isOpen={isStartStopConfirmOpen}
        onClose={() => setIsStartStopConfirmOpen(false)}
        onConfirm={() => {
          setActiveSubTab('suspension');
          setIsStartStopConfirmOpen(false);
        }}
      />
    </div>
  );
};
