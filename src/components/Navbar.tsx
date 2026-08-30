import React, { useState, useRef } from 'react';
import { useCourse } from '../context/CourseContext';
import { UserRole } from '../types';
import {
  Activity,
  AlertOctagon,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Globe,
  GraduationCap,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  MessageSquare,
  Moon,
  Package,
  Pause,
  Play,
  QrCode,
  Radio,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
  User,
  UserCheck,
  Wifi,
  WifiOff,
  Wrench,
  Zap,
} from 'lucide-react';
import { BroadcastModal } from './BroadcastModal';
import { QRScannerModal } from './QRScannerModal';
import { SyncStatusModal } from './SyncStatusModal';
import { FacultyAuthModal } from './FacultyAuthModal';
import { CourseMessengerModal } from './messaging/CourseMessengerModal';
import { SimulationEngineModal } from './SimulationEngineModal';
import { EmailAccessModal } from './EmailAccessModal';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const {
    language,
    setLanguage,
    toggleLanguage,
    t,
    userRole,
    setUserRole,
    activeDay,
    setActiveDay,
    currentSlot,
    timerSeconds,
    isTimerRunning,
    toggleTimer,
    resetTimer,
    activeSlotIndex,
    broadcastAlerts,
    syncStatus,
    facultyAuthSession,
    deauthorizeFaculty,
    suspensionInfo,
    courseStartSchedule,
    isCourseStarted,
    timeRemainingMs,
    timeMultiplier,
    isSimulationModalOpen,
    setIsSimulationModalOpen,
  } = useCourse();

  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isFacultyAuthModalOpen, setIsFacultyAuthModalOpen] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [isEmailAccessModalOpen, setIsEmailAccessModalOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  const topScrollRef = useRef<HTMLDivElement>(null);
  const subScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const activeAlertsCount = broadcastAlerts.filter((a) => a.active).length;

  const roleOptions: { role: UserRole; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    {
      role: 'public',
      label: language === 'en' ? 'Shared Screen' : 'Condivisa',
      shortLabel: language === 'en' ? 'Public' : 'Pubblica',
      icon: <Eye className="w-3.5 h-3.5" />,
    },
    {
      role: 'discente',
      label: language === 'en' ? 'Learner' : 'Discente',
      shortLabel: language === 'en' ? 'Learner' : 'Discente',
      icon: <User className="w-3.5 h-3.5" />,
    },
    {
      role: 'tecnico',
      label: language === 'en' ? 'Technician' : 'Tecnico',
      shortLabel: language === 'en' ? 'Tech' : 'Tecnico',
      icon: <Wrench className="w-3.5 h-3.5" />,
    },
    {
      role: 'faculty',
      label: language === 'en' ? 'Faculty Tutor' : 'Faculty Tutor',
      shortLabel: 'Faculty',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
    },
    {
      role: 'direttore',
      label: language === 'en' ? 'Director' : 'Direzione',
      shortLabel: language === 'en' ? 'Director' : 'Direttore',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    {
      role: 'ospite',
      label: language === 'en' ? 'VIP Guest' : 'Ospite / VIP',
      shortLabel: language === 'en' ? 'Guest' : 'Ospite',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
  ];

  const handleRoleSelection = (targetRole: UserRole) => {
    // If selecting public, discente, or ospite allow switch directly
    if (targetRole === 'public' || targetRole === 'discente' || targetRole === 'ospite') {
      setUserRole(targetRole);
      setCurrentTab('main');
      return;
    }

    // If selecting protected faculty/tecnico/direttore:
    if (facultyAuthSession.isAuthorized) {
      setUserRole(targetRole);
      setCurrentTab('main');
    } else {
      setPendingRole(targetRole);
      setIsFacultyAuthModalOpen(true);
    }
  };

  const handleFacultyAuthSuccess = (roleToSet?: UserRole) => {
    const target = roleToSet || pendingRole || 'faculty';
    setUserRole(target);
    setCurrentTab('main');
    setPendingRole(null);
  };

  const currentRoleObj = roleOptions.find((r) => r.role === userRole) || roleOptions[0];

  return (
    <>
      <header className="bg-neutral-950 border-b-2 border-neutral-800 sticky top-0 z-40 text-neutral-100 shadow-xl">
        
        {/* Tier 1: Main Control Header - Horizontally Scrollable without truncation */}
        <div className="relative w-full border-b border-neutral-850">
          
          {/* Scroll container */}
          <div
            ref={topScrollRef}
            className="w-full overflow-x-auto scrollbar-thin scroll-smooth py-1.5 px-2.5 sm:px-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-between gap-2.5 sm:gap-3.5 min-w-max">
              
              {/* BLOCK 1: Logo & Home Trigger (INTUBATI EM style) */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentTab('main')}
                  className="flex items-center gap-2 group cursor-pointer focus:outline-hidden"
                  title={language === 'en' ? 'Go to Main Screen • INTUBATI EM' : 'Torna alla schermata principale • INTUBATI EM'}
                >
                  <div className="w-8 h-8 bg-red-600 text-white flex items-center justify-center font-black rounded shadow-md group-hover:bg-red-500 transition-colors">
                    <Activity className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm sm:text-base tracking-tight text-white uppercase group-hover:text-red-400 transition-colors">
                        INTUBATI EM
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest px-1 py-0.2 bg-red-600 text-white rounded">
                        {language === 'en' ? 'SIMULATION' : 'SIMULAZIONE'}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono tracking-wider hidden sm:inline">
                      GLOBAL HEALTH EDUCATORS
                    </span>
                  </div>
                </button>
              </div>

              {/* BLOCK 1B: Language Switcher IT / EN */}
              <div className="flex items-center flex-shrink-0">
                <LanguageSwitcher variant="badge" />
              </div>

              {/* BLOCK 2: Day Selector (Day 2 vs Day 3) */}
              <div className="flex items-center bg-slate-900 border border-slate-700 p-0.5 rounded shadow-inner flex-shrink-0">
                <button
                  id="day2-tab-btn"
                  onClick={() => setActiveDay(2)}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                    activeDay === 2
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={language === 'en' ? 'Select Day 2 Schedule' : 'Seleziona Programma Giorno 2'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activeDay === 2 ? 'bg-white' : 'bg-slate-600'}`} />
                  <span>{language === 'en' ? 'DAY 2' : 'GIORNO 2'}</span>
                </button>

                <button
                  id="day3-tab-btn"
                  onClick={() => setActiveDay(3)}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                    activeDay === 3
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={language === 'en' ? 'Select Day 3 Schedule' : 'Seleziona Programma Giorno 3'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activeDay === 3 ? 'bg-white' : 'bg-slate-600'}`} />
                  <span>{language === 'en' ? 'DAY 3' : 'GIORNO 3'}</span>
                </button>
              </div>

              {/* BLOCK 2.2: Public View Toggle / Staff Area Button */}
              {userRole !== 'public' ? (
                <button
                  type="button"
                  id="switch-to-public-mode-btn"
                  onClick={() => handleRoleSelection('public')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 font-bold text-[11px] uppercase tracking-wider rounded border border-slate-700 hover:border-cyan-500 transition-all cursor-pointer shadow-xs flex-shrink-0"
                  title={language === 'en' ? 'Switch to Public Shared Screen View' : 'Passa alla Modalità Pubblica / Vista Condivisa'}
                >
                  <Eye className="w-3 h-3" />
                  <span>{language === 'en' ? 'PUBLIC' : 'PUBBLICA'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="public-staff-access-btn"
                  onClick={() => {
                    setPendingRole('direttore');
                    setIsFacultyAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-black text-[11px] uppercase tracking-wider rounded border border-red-400 transition-all cursor-pointer shadow-md flex-shrink-0"
                  title={language === 'en' ? 'Staff & Professionals Area Access' : 'Accesso Area Addetti ai Lavori'}
                >
                  <Lock className="w-3 h-3 text-red-200" />
                  <span>{language === 'en' ? 'STAFF AREA' : 'ADDETTI AI LAVORI'}</span>
                </button>
              )}

              {/* Conditional Controls for Staff / Directors / Tech / Faculty (Hidden for Public & Discente) */}
              {userRole !== 'public' && userRole !== 'discente' && (
                <div className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">

              {/* BLOCK 3: Timer & Live Phase Controller */}
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/90 border border-slate-700 shadow-inner rounded flex-shrink-0">
                <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-300">
                  <Clock className="w-3 h-3 text-red-400 flex-shrink-0" />
                  <span className="text-red-400 font-bold">{language === 'en' ? `D${activeDay}` : `G${activeDay}`}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-300">{language === 'en' ? `S${activeSlotIndex + 1}` : `F${activeSlotIndex + 1}`}</span>
                  {currentSlot?.timeRange && (
                    <span className="text-slate-400 text-[10px] font-mono hidden md:inline">({currentSlot.timeRange})</span>
                  )}
                </div>

                {/* Discreet Digital Countdown */}
                <div
                  className={`flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                    timerSeconds < 120
                      ? 'bg-red-950/80 text-red-300 border-red-700/80 animate-pulse'
                      : timerSeconds < 300
                      ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                      : 'bg-slate-950 text-slate-200 border-slate-800'
                  }`}
                  title={language === 'en' ? 'Time remaining in current phase' : 'Tempo residuo fase corrente'}
                >
                  <span className="text-[9px] text-slate-500 font-normal">T-</span>
                  <span>{formatTime(timerSeconds)}</span>
                </div>

                {/* Timer Controls for Direttore / Tecnico */}
                {(userRole === 'direttore' || userRole === 'tecnico') && (
                  <div className="flex items-center gap-0.5 border-l border-slate-700 pl-1.5">
                    <button
                      onClick={toggleTimer}
                      title={isTimerRunning ? (language === 'en' ? 'Pause Timer' : 'Metti in Pausa Timer') : (language === 'en' ? 'Start Timer' : 'Avvia Timer')}
                      className="p-1 bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 rounded transition-colors cursor-pointer border border-slate-700"
                    >
                      {isTimerRunning ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                    </button>
                    <button
                      onClick={() => resetTimer()}
                      title={language === 'en' ? 'Reset Phase Timer' : 'Ripristina Timer Fase'}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors cursor-pointer border border-slate-700"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* BLOCK 4B: Quick Messenger Button */}
              <button
                id="open-messenger-btn"
                onClick={() => setIsMessengerOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-red-600 hover:text-white text-red-400 font-bold text-[11px] uppercase tracking-wider rounded border border-red-500 transition-all cursor-pointer shadow-xs flex-shrink-0"
                title={language === 'en' ? 'Send alert/message to Faculty & Directors' : 'Invia una segnalazione o richiesta alla Direzione e Faculty'}
              >
                <Send className="w-3 h-3" />
                <span>{language === 'en' ? 'REPORT' : 'SEGNALA'}</span>
              </button>

              {/* BLOCK 6: Real-Time Connectivity & Client Sync Indicator */}
              <button
                id="open-sync-status-btn"
                onClick={() => setIsSyncModalOpen(true)}
                className={`flex items-center gap-1 px-2 py-1 rounded border transition-all cursor-pointer shadow-xs flex-shrink-0 font-mono text-[11px] font-bold ${
                  syncStatus.isOnline
                    ? 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-emerald-600/70 hover:border-emerald-400'
                    : 'bg-red-950 text-red-300 border-red-600 animate-pulse'
                }`}
                title={language === 'en' ? 'Real-time connectivity and node sync status' : 'Stato connettività e sincronizzazione multi-client in tempo reale'}
              >
                <div className="relative flex items-center justify-center">
                  {syncStatus.isOnline ? (
                    <Wifi className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-red-500" />
                  )}
                  {syncStatus.isOnline && (
                    <span className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                  )}
                </div>
                <span className="tracking-tight uppercase">
                  {syncStatus.isOnline ? 'LIVE' : 'OFFLINE'}
                </span>
                <span className={`text-[9px] font-bold px-1 py-0.1 ml-0.5 rounded ${
                  syncStatus.isOnline
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                  {syncStatus.peerCount}
                </span>
              </button>

                </div>
              )}
          </div>
        </div>
      </div>

        {/* Tier 2: Views Navigation Bar - Horizontally Scrollable with Tabs */}
        {!isCourseStarted && (userRole === 'discente' || userRole === 'public') ? (
          <div className="bg-slate-900 border-t border-red-500/80 py-1.5 px-3 sm:px-4 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{language === 'en' ? `OPERATIONAL STANDBY • SCHEDULED START: ${courseStartSchedule.scheduledDate} AT ${courseStartSchedule.scheduledTime}` : `STANDBY OPERATIVO • AVVIO PREVISTO: ${courseStartSchedule.scheduledDate} ORE ${courseStartSchedule.scheduledTime}`}</span>
            </div>
            <div className="text-slate-400 text-[11px] hidden sm:block">
              {language === 'en' ? 'Countdown active • Features will unlock automatically at the scheduled time' : 'Conto alla rovescia attivo • Le funzioni si attiveranno automaticamente all\'orario stabilito'}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/95 border-t border-slate-800 backdrop-blur-xs">
            <div
              ref={subScrollRef}
              className="w-full overflow-x-auto scrollbar-thin scroll-smooth py-1 px-2.5 sm:px-4"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 min-w-max">
                
                {/* Left Side: Navigation Tabs */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                  <button
                    id="subnav-main-btn"
                    onClick={() => setCurrentTab('main')}
                    className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                      currentTab === 'main'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'text-slate-300 hover:text-white bg-slate-950 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {currentRoleObj.icon}
                    <span>{language === 'en' ? `${currentRoleObj.shortLabel.toUpperCase()} DASHBOARD` : `PANNELLO ${currentRoleObj.shortLabel.toUpperCase()}`}</span>
                  </button>

                  {userRole === 'tecnico' && (
                    <>
                      <button
                        id="subnav-catalog-btn"
                        onClick={() => setCurrentTab('catalog')}
                        className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                          currentTab === 'catalog'
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'text-slate-300 hover:text-white bg-slate-950 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <BookOpen className="w-3 h-3 text-red-400" />
                        <span>{language === 'en' ? 'SCENARIO CATALOG (24)' : 'CATALOGO SCENARI (24)'}</span>
                      </button>

                      <button
                        id="subnav-protesi-btn"
                        onClick={() => setCurrentTab('protesi')}
                        className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                          currentTab === 'protesi'
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'text-slate-300 hover:text-white bg-slate-950 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <Package className="w-3 h-3 text-cyan-400" />
                        <span>{language === 'en' ? 'PROSTHETICS & MOULAGE' : 'PROTESI & MOULAGE'}</span>
                      </button>

                      <button
                        id="subnav-night-btn"
                        onClick={() => setCurrentTab('night')}
                        className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                          currentTab === 'night'
                            ? 'bg-red-600 text-white border-red-600 shadow-xs font-black'
                            : 'text-slate-300 hover:text-white bg-slate-950 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <Moon className="w-3 h-3 text-red-400" />
                        <span>{language === 'en' ? 'NIGHT SHIFT (DAY 3)' : 'NOTTURNO (DAY 3)'}</span>
                      </button>
                    </>
                  )}

                  {!isCourseStarted && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-red-950/80 border border-red-600 text-red-300 font-mono text-[10px] font-bold rounded">
                      <Clock className="w-2.5 h-2.5 text-red-400" />
                      <span>{language === 'en' ? 'GATE STANDBY' : 'GATE STANDBY'}</span>
                    </div>
                  )}
                </div>

                {/* Right Side: Active Status & Mode Indicator */}
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto pl-2">

                  <button
                    id="subnav-sync-indicator-btn"
                    onClick={() => setIsSyncModalOpen(true)}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-[9px] font-mono transition-colors cursor-pointer text-slate-300 rounded"
                    title={language === 'en' ? 'Real-time sync details (nodes & ping)' : 'Stato connettività real-time (Clicca per dettagli nodi e ping)'}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${syncStatus.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className={syncStatus.isOnline ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {syncStatus.isOnline ? 'SYNC OK' : 'OFFLINE'}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">{syncStatus.latencyMs !== null ? `${syncStatus.latencyMs}ms` : '<2ms'}</span>
                  </button>

                  <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-950 border border-slate-800 text-[10px] font-mono rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-slate-400 uppercase font-bold">{language === 'en' ? `D${activeDay}` : `G${activeDay}`}</span>
                    <span className="text-slate-600">|</span>
                    <span className={`font-bold uppercase ${facultyAuthSession.isAuthorized ? 'text-emerald-400' : 'text-red-400'}`}>
                      {userRole}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </header>

      {/* Broadcast Creator Modal */}
      <BroadcastModal isOpen={isBroadcastOpen} onClose={() => setIsBroadcastOpen(false)} />

      {/* QR Code Scanner / Access Modal */}
      <QRScannerModal isOpen={isQRScannerOpen} onClose={() => setIsQRScannerOpen(false)} />

      {/* Real-time Connectivity & Sync Status Modal */}
      <SyncStatusModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />

      {/* Secure Faculty Authentication Modal */}
      <FacultyAuthModal
        isOpen={isFacultyAuthModalOpen}
        onClose={() => {
          setIsFacultyAuthModalOpen(false);
          setPendingRole(null);
        }}
        targetRolePending={pendingRole}
        onSuccess={handleFacultyAuthSuccess}
      />

      {/* Course Private Messenger Modal */}
      <CourseMessengerModal
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
      />

      {/* Simulation Engine & Time Acceleration Modal */}
      <SimulationEngineModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
      />

      {/* First Access Email Login / Verification Modal */}
      <EmailAccessModal
        isOpen={isEmailAccessModalOpen}
        onClose={() => setIsEmailAccessModalOpen(false)}
      />
    </>
  );
};
