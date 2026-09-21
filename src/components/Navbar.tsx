import React, { useState, useRef } from 'react';
import { useCourse } from '../context/CourseContext';
import { UserRole } from '../types';
import {
  Activity,
  AlertOctagon,
  Award,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  ExternalLink,
  Globe,
  GraduationCap,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  MessageSquare,
  Monitor,
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
  Users,
  Wifi,
  WifiOff,
  Wrench,
  Zap,
} from 'lucide-react';
import { SyncStatusModal } from './SyncStatusModal';
import { RegiaKeypadModal } from './RegiaKeypadModal';

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
    syncStatus,
    suspensionInfo,
    timeMultiplier,
    isSimulationModalOpen,
    setIsSimulationModalOpen,
  } = useCourse();

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isEmailAccessModalOpen, setIsEmailAccessModalOpen] = useState(false);
  const [isKeypadModalOpen, setIsKeypadModalOpen] = useState(false);

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

  const isCurrentUnlocked = true;

  const roleOptions: { role: UserRole; label: string; shortLabel: string; icon: React.ReactNode }[] = [
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
    setUserRole(targetRole);
    setCurrentTab('main');
  };

  const currentRoleObj = roleOptions.find((r) => r.role === userRole) || roleOptions[0];

  // Specific views where the view selector navigation bar must be hidden
  const isDirectorView = currentTab === 'direttori' || (currentTab === 'main' && userRole === 'direttore');
  const isPublicView = currentTab === 'public';
  const isDiscenteView = currentTab === 'discente' || (currentTab === 'main' && userRole === 'discente');
  const isTecniciView = currentTab === 'tecnici' || (currentTab === 'main' && userRole === 'tecnico');
  const isOspitiView = currentTab === 'ospite' || (currentTab === 'main' && userRole === 'ospite');

  const hideViewSelectorBar = isDirectorView || isPublicView || isDiscenteView || isTecniciView || isOspitiView;

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
              
              {/* BLOCK 1: Logo & Home Trigger (H.I.T.T.E.R. • INTUBATI EM) */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentTab('public')}
                  className="flex items-center gap-2 group cursor-pointer focus:outline-hidden"
                  title="H.I.T.T.E.R. • High Intensive Training Trauma Emergency Response • INTUBATI EM"
                >
                  <div className="w-8 h-8 bg-red-600 text-white flex items-center justify-center font-black rounded shadow-md group-hover:bg-red-500 transition-colors">
                    <Activity className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm sm:text-base tracking-tight text-white uppercase group-hover:text-red-400 transition-colors">
                        H.I.T.T.E.R.
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest px-1 py-0.2 bg-red-600 text-white rounded">
                        INTUBATI EM
                      </span>
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-slate-400 font-mono tracking-wider hidden sm:inline truncate max-w-[200px] lg:max-w-none">
                      High Intensive Training Trauma Emergency Response
                    </span>
                  </div>
                </button>
              </div>

              {/* BLOCK 1B: Language Switcher IT / EN */}
              <div className="flex items-center flex-shrink-0">
                <LanguageSwitcher variant="badge" />
              </div>

              {/* Visuale Pubblica Indicator */}
              {isPublicView && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2.5 py-1 bg-orange-600 text-black font-black text-xs uppercase tracking-wider rounded flex items-center gap-1.5 shadow-sm">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'PUBLIC VIEW' : 'VISUALE PUBBLICA'}</span>
                  </span>
                </div>
              )}

              {/* Role & View Switcher Dropdown (Hidden in Direttori, Public, Discente, Tecnici, Ospiti) */}
              {!hideViewSelectorBar && (
                <div className="relative group flex-shrink-0">
                  <button
                    type="button"
                    id="navbar-role-switcher-btn"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-600 hover:bg-yellow-500 text-black font-black text-xs uppercase tracking-wider rounded border border-yellow-400 transition-all cursor-pointer shadow-md"
                    title={language === 'en' ? 'Switch Role / View instantly' : 'Cambia Vista / Ruolo istantaneamente'}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? `VIEW: ${userRole.toUpperCase()}` : `VISTA: ${userRole.toUpperCase()}`}</span>
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-neutral-950 border border-neutral-700 shadow-2xl rounded py-1 hidden group-hover:block z-50">
                    <div className="px-3 py-1.5 text-[10px] font-mono text-neutral-400 border-b border-neutral-800 uppercase">
                      {language === 'en' ? 'Switch View & Role' : 'Cambia Vista & Ruolo'}
                    </div>
                    {roleOptions.map((opt) => (
                      <button
                        key={opt.role}
                        onClick={() => handleRoleSelection(opt.role)}
                        className={`w-full text-left px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-2 hover:bg-neutral-800 transition-colors cursor-pointer ${
                          userRole === opt.role ? 'bg-yellow-500/20 text-yellow-400' : 'text-neutral-200'
                        }`}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => handleRoleSelection('regia')}
                      className={`w-full text-left px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-2 hover:bg-neutral-800 transition-colors cursor-pointer border-t border-neutral-800 ${
                        userRole === 'regia' ? 'bg-pink-500/20 text-pink-400' : 'text-pink-300'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5 text-pink-400" />
                      <span>REGIA & CONTROL</span>
                    </button>
                  </div>
                </div>
              )}



              {/* BLOCK 2.2: Direttore & Regia Quick Switch Buttons */}
              {!hideViewSelectorBar && (
                <div className="flex items-center gap-1.5 flex-shrink-0">




                  {userRole !== 'regia' && (
                    <button
                      type="button"
                      id="switch-to-regia-mode-btn"
                      onClick={() => handleRoleSelection('regia')}
                      className="flex items-center gap-1 px-2.5 py-1 bg-pink-950/80 hover:bg-pink-900 text-pink-300 font-bold text-[11px] uppercase tracking-wider rounded border border-pink-700 hover:border-pink-500 transition-all cursor-pointer shadow-xs flex-shrink-0"
                      title={language === 'en' ? 'Switch to Regia & Mission Control View' : 'Passa alla Visuale Regia & Mission Control'}
                    >
                      <Radio className="w-3 h-3 text-pink-400" />
                      <span>REGIA</span>
                    </button>
                  )}
                </div>
              )}

              {/* Conditional Controls for Staff / Directors */}
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

                {/* Timer Controls for Direttore */}
                {userRole === 'direttore' && (
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

              {/* BLOCK 7: Top Right INTUBATI EM Header Button (PIN Keypad Trigger) */}
              <button
                type="button"
                id="header-right-intubati-em-btn"
                onClick={() => setIsKeypadModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/90 hover:bg-red-900 text-white font-black text-xs uppercase tracking-wider rounded border border-red-600 hover:border-red-400 transition-all cursor-pointer shadow-md group flex-shrink-0"
                title="Accesso Regia protetto da PIN • INTUBATI EM"
              >
                <div className="w-5 h-5 bg-red-600 text-white flex items-center justify-center font-black rounded group-hover:bg-red-500 transition-colors shadow-xs">
                  <Activity className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-black text-xs sm:text-sm text-white tracking-tight group-hover:text-red-300 transition-colors">
                    INTUBATI EM
                  </span>
                  <Lock className="w-3.5 h-3.5 text-red-400 group-hover:text-white transition-colors" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Tier 2: Views Navigation Bar - Horizontally Scrollable with Tabs (Hidden in Direttori, Public, Discente, Tecnici, Ospiti) */}
        {!hideViewSelectorBar && (
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

                  {/* Public, Discente, Faculty quick buttons for staff */}
                  {['tecnico', 'regia', 'direttore', 'ospite'].includes(userRole) && (
                    <>
                      <button
                        id="subnav-public-btn"
                        onClick={() => {
                          setCurrentTab('public');
                        }}
                        className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                          currentTab === 'public'
                            ? 'text-white bg-orange-600 border-orange-500 shadow-xs'
                            : 'text-orange-300 hover:text-white bg-neutral-900 border-orange-600/40 hover:border-orange-500'
                        }`}
                      >
                        <Globe className="w-3 h-3 text-orange-400" />
                        <span>{language === 'en' ? 'PUBLIC LIVE VIEW' : 'VISUALE PUBBLICA LIVE'}</span>
                      </button>

                      <button
                        id="subnav-discente-btn"
                        onClick={() => {
                          const fromParam = ['regia', 'direttore'].includes(userRole) ? `&from=${userRole}` : '';
                          window.open(`${window.location.origin}${window.location.pathname}?view=discente${fromParam}`, '_blank');
                        }}
                        className="flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 text-cyan-300 hover:text-white bg-neutral-900 border-cyan-600/40 hover:border-cyan-500"
                      >
                        <GraduationCap className="w-3 h-3 text-cyan-400" />
                        <span>{language === 'en' ? 'STUDENT VIEW' : 'VISUALE DISCENTE'}</span>
                      </button>

                      <button
                        id="subnav-faculty-btn"
                        onClick={() => {
                          const fromParam = ['regia', 'direttore'].includes(userRole) ? `&from=${userRole}` : '';
                          window.open(`${window.location.origin}${window.location.pathname}?view=faculty${fromParam}`, '_blank');
                        }}
                        className="flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 text-amber-300 hover:text-white bg-neutral-900 border-amber-600/40 hover:border-amber-500"
                      >
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>{language === 'en' ? 'FACULTY VIEW' : 'VISUALE FACULTY'}</span>
                      </button>

                      <button
                        id="subnav-tecnici-btn"
                        onClick={() => {
                          const fromParam = ['regia', 'direttore'].includes(userRole) ? `&from=${userRole}` : '';
                          window.open(`${window.location.origin}${window.location.pathname}?view=tecnici${fromParam}`, '_blank');
                        }}
                        className="flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 text-pink-300 hover:text-white bg-neutral-900 border-pink-600/40 hover:border-pink-500"
                      >
                        <Wrench className="w-3 h-3 text-pink-400" />
                        <span>{language === 'en' ? 'TECH VIEW' : 'VISUALE TECNICI'}</span>
                      </button>

                      {userRole !== 'direttore' && currentTab !== 'direttori' && (
                        <>
                          <button
                            id="subnav-regia-btn"
                            onClick={() => {
                              window.open(`${window.location.origin}${window.location.pathname}?view=regia`, '_blank');
                            }}
                            className="flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 text-pink-300 hover:text-white bg-neutral-900 border-pink-600/40 hover:border-pink-500"
                          >
                            <Radio className="w-3 h-3 text-pink-400" />
                            <span>{language === 'en' ? 'REGIA VIEW' : 'VISUALE REGIA'}</span>
                          </button>

                          <button
                            id="subnav-direttori-btn"
                            onClick={() => {
                              const fromParam = ['regia', 'direttore'].includes(userRole) ? `&from=${userRole}` : '';
                              window.open(`${window.location.origin}${window.location.pathname}?view=direttori${fromParam}`, '_blank');
                            }}
                            className="flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 text-yellow-300 hover:text-white bg-neutral-900 border-yellow-600/40 hover:border-yellow-500"
                          >
                            <ShieldCheck className="w-3 h-3 text-yellow-400" />
                            <span>{language === 'en' ? 'DIRECTORS VIEW' : 'VISUALE DIRETTORI'}</span>
                          </button>
                        </>
                      )}

                      <button
                        id="subnav-ospiti-btn"
                        onClick={() => {
                          const fromParam = ['regia', 'direttore'].includes(userRole) ? `&from=${userRole}` : '';
                          window.open(`${window.location.origin}${window.location.pathname}?view=ospite${fromParam}`, '_blank');
                        }}
                        className="flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 text-emerald-300 hover:text-white bg-neutral-900 border-emerald-600/40 hover:border-emerald-500"
                      >
                        <UserCheck className="w-3 h-3 text-emerald-400" />
                        <span>{language === 'en' ? 'GUEST VIEW' : 'VISUALE OSPITI'}</span>
                      </button>
                    </>
                  )}

                  {/* Scenari and Protesi available for all roles */}
                  <button
                    id="subnav-scenari-btn"
                    onClick={() => setCurrentTab('scenari')}
                    className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                      currentTab === 'scenari' || currentTab === 'catalog'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'text-slate-300 hover:text-white bg-slate-950 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <BookOpen className="w-3 h-3 text-orange-400" />
                    <span>{language === 'en' ? 'SCENARI (24)' : 'SCENARI (24)'}</span>
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
                    <span>{language === 'en' ? 'PROTESI' : 'PROTESI'}</span>
                  </button>

                  {!isCurrentUnlocked && (
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
                    <span className="font-bold uppercase text-emerald-400">
                      {userRole}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </header>

      {/* Real-time Connectivity & Sync Status Modal */}
      <SyncStatusModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />


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

      {/* Protected Regia Access Keypad Modal (PIN: 9438) */}
      <RegiaKeypadModal
        isOpen={isKeypadModalOpen}
        onClose={() => setIsKeypadModalOpen(false)}
        onSuccess={() => {
          setCurrentTab('regia');
          setUserRole('regia');
        }}
      />
    </>
  );
};
