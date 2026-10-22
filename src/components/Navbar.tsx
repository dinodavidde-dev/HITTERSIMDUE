import React, { useState, useRef } from 'react';
import { useCourse } from '../context/CourseContext';
import { UserRole } from '../types';
import {
  Activity,
  AlertOctagon,
  ArrowLeft,
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
  Maximize2,
  Menu,
  MessageSquare,
  Minimize2,
  Monitor,
  Package,
  Pause,
  Play,
  QrCode,
  Radio,
  RotateCcw,
  Scale,
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
  X,
  Zap,
  FileText,
  Compass,
  Map as MapIcon,
} from 'lucide-react';
import { SyncStatusModal } from './SyncStatusModal';
import { RegiaKeypadModal } from './RegiaKeypadModal';
import { EmailAccessModal } from './EmailAccessModal';
import { AreaDiscentiModal } from './common/AreaDiscentiModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import { openVisualeInNewWindow } from '../utils/qrCodeUtils';
import { EventPauseButton } from './schedule/EventPauseButton';
import { NetworkStatusBadge } from './offline/NetworkStatusBadge';

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
    canGoBack,
    backDestinationLabel,
    navigateBack,
    navigateToView,
    openedByRole,
    freeAccessEnabled,
    isAreaDiscentiModalOpen,
    setIsAreaDiscentiModalOpen,
    isFullscreenMode,
    toggleFullscreenMode,
    setIsAuditLogOpen,
    setIsIntentReviewOpen,
    isTacticalMapOpen,
    setIsTacticalMapOpen,
  } = useCourse();

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isEmailAccessModalOpen, setIsEmailAccessModalOpen] = useState(false);
  const [isKeypadModalOpen, setIsKeypadModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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
    if (targetRole === 'regia' || targetRole === 'direttore' || targetRole === 'master') {
      setIsKeypadModalOpen(true);
      return;
    }
    setUserRole(targetRole);
    if (targetRole === 'ospite') {
      setCurrentTab('public');
    } else {
      setCurrentTab('main');
    }
  };

  const currentRoleObj = roleOptions.find((r) => r.role === userRole) || roleOptions[0];

  // Specific views where the view selector navigation bar must be hidden
  const isMasterView = currentTab === 'master' || (currentTab === 'main' && userRole === 'master');
  const isDirectorView = currentTab === 'direttori' || (currentTab === 'main' && userRole === 'direttore');
  const isRegiaView = currentTab === 'regia' || (currentTab === 'main' && userRole === 'regia');
  const isPublicView = currentTab === 'public' || currentTab === 'ospite' || userRole === 'ospite';
  const isDiscenteView = currentTab === 'discente' || (currentTab === 'main' && userRole === 'discente');
  const isTecniciView = currentTab === 'tecnici' || (currentTab === 'main' && userRole === 'tecnico');
  const isOspitiView = currentTab === 'ospite' || (currentTab === 'main' && userRole === 'ospite');

  const hideViewSelectorBar = isMasterView || isDirectorView || isRegiaView || isPublicView || isDiscenteView || isTecniciView || isOspitiView;

  const isRegiaOrDirectorScreen =
    userRole === 'master' || userRole === 'regia' || userRole === 'direttore' || currentTab === 'master' || currentTab === 'regia' || currentTab === 'direttori';
  const currentAdminOrigin: 'regia' | 'direttore' | 'master' =
    userRole === 'master' || currentTab === 'master'
      ? 'master'
      : userRole === 'regia' || currentTab === 'regia'
      ? 'regia'
      : 'direttore';

  const handleVisualeClick = (tab: string, role?: UserRole) => {
    if (isRegiaOrDirectorScreen) {
      // Quando si seleziona una visuale dalle schermate regia e direttori apri in una nuova finestra
      openVisualeInNewWindow(tab, currentAdminOrigin);
    } else {
      navigateToView(tab, role);
    }
  };

  return (
    <>
      {!isFullscreenMode && (
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
              
              {/* Back Button (dai la possibilita di tornare indietro) */}
              {canGoBack && (
                <button
                  type="button"
                  id="navbar-back-btn"
                  onClick={navigateBack}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded border border-amber-300 shadow-md transition-all cursor-pointer group flex-shrink-0 animate-pulse-slow"
                  title={language === 'en' ? `Back to ${backDestinationLabel}` : `Torna indietro a: ${backDestinationLabel}`}
                >
                  <ArrowLeft className="w-4 h-4 stroke-[3] group-hover:-translate-x-0.5 transition-transform" />
                  <span>{language === 'en' ? `BACK: ${backDestinationLabel.toUpperCase()}` : `INDIETRO: ${backDestinationLabel.toUpperCase()}`}</span>
                </button>
              )}

              {/* BLOCK 1: Logo, Home Trigger & Mobile Drawer Trigger */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Mobile Drawer Trigger (visible on small/medium screens) */}
                <button
                  type="button"
                  id="navbar-mobile-drawer-btn"
                  onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
                  className="flex lg:hidden items-center justify-center w-8 h-8 rounded bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white transition-all cursor-pointer shadow-xs"
                  aria-label={isMobileDrawerOpen ? (language === 'en' ? 'Close menu' : 'Chiudi menu') : (language === 'en' ? 'Open role & views menu' : 'Apri menu viste e ruoli')}
                  title={language === 'en' ? 'Role & Views Menu' : 'Menu Viste & Ruoli'}
                >
                  {isMobileDrawerOpen ? (
                    <X className="w-4 h-4 text-amber-400 stroke-[2.5]" />
                  ) : (
                    <Menu className="w-4 h-4 text-neutral-300 stroke-[2.5]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('public')}
                  className="flex items-center gap-2 group cursor-pointer focus:outline-hidden"
                  title="HITTER. • High Intensive Training Trauma Emergency Response • INTUBATI EM"
                >
                  <div className="w-8 h-8 bg-red-600 text-white flex items-center justify-center font-black rounded shadow-md group-hover:bg-red-500 transition-colors">
                    <Activity className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm sm:text-base tracking-tight text-white uppercase group-hover:text-red-400 transition-colors">
                        HITTER
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

              {/* Pulsante Area Discenti nella barra di navigazione: visibile SOLO attraverso comando Accesso Libero dalla Regia */}
              {freeAccessEnabled && (
                <div className="flex items-center gap-2 flex-shrink-0 animate-fadeIn">
                  <button
                    type="button"
                    id="navbar-area-discenti-btn"
                    onClick={() => setIsAreaDiscentiModalOpen(true)}
                    className="min-h-[30px] px-2.5 sm:px-3 py-1 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-mono font-black text-xs uppercase tracking-wider rounded flex items-center gap-1.5 shadow-md border border-cyan-300 cursor-pointer transition-all transform hover:scale-[1.02] animate-pulse-slow"
                    title={language === 'en' ? 'Learner Area: enter Name & Surname' : 'Area Discenti: inserisci Nome e Cognome'}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span>{language === 'en' ? 'LEARNER AREA' : 'AREA DISCENTI'}</span>
                  </button>
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
              <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
                {/* Quick Navigation Buttons in Main Navbar: Mappa, Scenari, Protesi, Visuale Trucco, Regia Asset */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    id="navbar-top-map-btn"
                    onClick={() => setIsTacticalMapOpen(true)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded border font-mono text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                      isTacticalMapOpen
                        ? 'bg-emerald-500 text-black border-emerald-300 ring-2 ring-emerald-400'
                        : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border-emerald-500/70 hover:border-emerald-400 animate-pulse-slow'
                    }`}
                    title={
                      language === 'en'
                        ? 'Open Tactical Combat Map & Compound Multi-Layer Blueprint'
                        : 'Apri Mappa Tattica Operativa e Comprensorio Addestrativo Multi-Livello'
                    }
                  >
                    <Compass className="w-3.5 h-3.5 stroke-[2.5] text-emerald-400" />
                    <span>{language === 'en' ? 'MAP' : 'MAPPA'}</span>
                  </button>

                  <button
                    type="button"
                    id="navbar-top-scenari-btn"
                    onClick={() => navigateToView('scenari')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded border font-mono text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                      currentTab === 'scenari' || currentTab === 'catalog'
                        ? 'bg-orange-500 text-black border-orange-300 shadow-md'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-orange-300 border-orange-600/60 hover:border-orange-400'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{language === 'en' ? 'SCENARIOS' : 'SCENARI'}</span>
                  </button>

                  <button
                    type="button"
                    id="navbar-top-protesi-btn"
                    onClick={() => navigateToView('protesi')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded border font-mono text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                      currentTab === 'protesi'
                        ? 'bg-cyan-500 text-black border-cyan-300 shadow-md'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border-cyan-600/60 hover:border-cyan-400'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{language === 'en' ? 'PROSTHETICS' : 'PROTESI'}</span>
                  </button>

                  <button
                    type="button"
                    id="navbar-top-trucco-btn"
                    onClick={() => navigateToView('trucco')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded border font-mono text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                      currentTab === 'trucco' || currentTab === 'moulage'
                        ? 'bg-pink-600 text-white border-pink-300 shadow-md'
                        : 'bg-pink-950/80 hover:bg-pink-900 text-pink-300 border-pink-600/70 hover:border-pink-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.5] text-pink-400" />
                    <span>{language === 'en' ? 'MAKEUP VIEW' : 'VISUALE TRUCCO'}</span>
                  </button>

                  <button
                    type="button"
                    id="navbar-top-regia-asset-btn"
                    onClick={() => navigateToView('regia_asset')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded border font-mono text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                      currentTab === 'regia_asset' || currentTab === 'asset'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black border-emerald-300 shadow-md ring-1 ring-emerald-300'
                        : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-600/70 hover:border-emerald-400'
                    }`}
                    title={language === 'en' ? 'Control Room Asset Workload Dashboard' : 'Dashboard Regia Asset & Controllo Carichi'}
                  >
                    <Scale className="w-3.5 h-3.5 stroke-[2.5] text-emerald-400" />
                    <span>{language === 'en' ? 'REGIA ASSET' : 'REGIA ASSET'}</span>
                  </button>
                </div>

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

              {/* Transversal Flexibility: Event Pause Button (⏸ / ▶) */}
              <EventPauseButton />

              {/* Transversal Offline Mode Status Badge */}
              <NetworkStatusBadge onOpenIntentReview={() => setIsIntentReviewOpen(true)} />

                {/* Transversal Audit Log Button */}
                <button
                  type="button"
                  id="navbar-audit-log-btn"
                  onClick={() => setIsAuditLogOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 border border-amber-600/60 hover:border-amber-400 font-mono text-[11px] font-bold uppercase rounded transition-all cursor-pointer shadow-xs flex-shrink-0"
                  title={language === 'en' ? 'Open Schedule Change Audit Log' : 'Registro Modifiche e Audit Log Cronoprogramma'}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
                  <span className="hidden sm:inline">AUDIT</span>
                </button>

              {/* BLOCK 5.4: Fullscreen Mode Toggle Button for Training Rooms */}
              <button
                type="button"
                id="navbar-fullscreen-toggle-btn"
                onClick={toggleFullscreenMode}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs flex-shrink-0 ${
                  isFullscreenMode
                    ? 'bg-orange-500 text-black border-orange-300 shadow-md'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-amber-400 border-amber-500/60 hover:border-amber-400'
                }`}
                title={
                  language === 'en'
                    ? 'Toggle Fullscreen Training Room Mode (Hide navigation bar & footer)'
                    : 'Attiva Modalità Schermo Intero Aula (Nascondi barra e footer ed espandi a tutto schermo)'
                }
              >
                {isFullscreenMode ? (
                  <Minimize2 className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>{language === 'en' ? 'FULLSCREEN' : 'SCHERMO INTERO'}</span>
              </button>

              {/* BLOCK 5.5: Language Selector */}
              <LanguageSwitcher variant="badge" />

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

              {/* BLOCK 7: Top Right Reserved Area Header Button (PIN Keypad Trigger) */}
              <button
                type="button"
                id="header-right-intubati-em-btn"
                onClick={() => setIsKeypadModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/90 hover:bg-red-900 text-white font-black text-xs uppercase tracking-wider rounded border border-red-600 hover:border-red-400 transition-all cursor-pointer shadow-md group flex-shrink-0"
                title={language === 'en' ? 'Protected Area Access • PIN 9438 (Control Room) / 0118 (Direction) / 251201 (Master)' : 'Accesso Area Riservata • PIN 9438 (Regia) / 0118 (Direzione) / 251201 (Master)'}
              >
                <div className="w-5 h-5 bg-red-600 text-white flex items-center justify-center font-black rounded group-hover:bg-red-500 transition-colors shadow-xs">
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs sm:text-sm text-white tracking-tight group-hover:text-red-300 transition-colors">
                    {language === 'en' ? 'RESTRICTED AREA' : 'AREA RISERVATA'}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest px-1 py-0.2 bg-red-600 text-white rounded">
                    INTUBATI EM
                  </span>
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
                  {/* Back Button in Subnav */}
                  {canGoBack && (
                    <button
                      type="button"
                      id="subnav-back-btn"
                      onClick={navigateBack}
                      className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border border-amber-300 shadow-xs flex-shrink-0 mr-1"
                      title={language === 'en' ? `Back to ${backDestinationLabel}` : `Torna indietro a: ${backDestinationLabel}`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{language === 'en' ? 'BACK' : 'TORNA INDIETRO'}</span>
                    </button>
                  )}

                  <button
                    id="subnav-main-btn"
                    onClick={() => navigateToView('main')}
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

                      {/* Learner button: always accessible for staff to inspect trainee view */}
                      <button
                        id="subnav-discente-btn"
                        onClick={() => handleVisualeClick('discente', 'discente')}
                        title={isRegiaOrDirectorScreen ? (language === 'en' ? 'Open Learner View in new window' : 'Apri Visuale Discente in una nuova finestra') : undefined}
                        className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                          currentTab === 'discente'
                            ? 'text-white bg-cyan-600 border-cyan-500 shadow-xs'
                            : 'text-cyan-300 hover:text-white bg-neutral-900 border-cyan-600/40 hover:border-cyan-500'
                        }`}
                      >
                        <GraduationCap className="w-3 h-3 text-cyan-400" />
                        <span>{language === 'en' ? 'STUDENT VIEW' : 'VISUALE DISCENTE'}</span>
                        {isRegiaOrDirectorScreen && <ExternalLink className="w-2.5 h-2.5 text-cyan-400" />}
                      </button>

                      <button
                        id="subnav-faculty-btn"
                        onClick={() => handleVisualeClick('faculty', 'faculty')}
                        title={isRegiaOrDirectorScreen ? (language === 'en' ? 'Open Faculty View in new window' : 'Apri Visuale Faculty in una nuova finestra') : undefined}
                        className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                          currentTab === 'faculty'
                            ? 'text-white bg-amber-600 border-amber-500 shadow-xs'
                            : 'text-amber-300 hover:text-white bg-neutral-900 border-amber-600/40 hover:border-amber-500'
                        }`}
                      >
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>{language === 'en' ? 'FACULTY VIEW' : 'VISUALE FACULTY'}</span>
                        {isRegiaOrDirectorScreen && <ExternalLink className="w-2.5 h-2.5 text-amber-400" />}
                      </button>

                      <button
                        id="subnav-tecnici-btn"
                        onClick={() => handleVisualeClick('tecnici', 'tecnico')}
                        title={isRegiaOrDirectorScreen ? (language === 'en' ? 'Open Tech View in new window' : 'Apri Visuale Tecnici in una nuova finestra') : undefined}
                        className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                          currentTab === 'tecnici'
                            ? 'text-white bg-pink-600 border-pink-500 shadow-xs'
                            : 'text-pink-300 hover:text-white bg-neutral-900 border-pink-600/40 hover:border-pink-500'
                        }`}
                      >
                        <Wrench className="w-3 h-3 text-pink-400" />
                        <span>{language === 'en' ? 'TECH VIEW' : 'VISUALE TECNICI'}</span>
                        {isRegiaOrDirectorScreen && <ExternalLink className="w-2.5 h-2.5 text-pink-400" />}
                      </button>

                      {userRole !== 'direttore' && currentTab !== 'direttori' && (
                        <>
                          <button
                            id="subnav-regia-btn"
                            onClick={() => handleVisualeClick('regia', 'regia')}
                            title={isRegiaOrDirectorScreen ? (language === 'en' ? 'Open Regia View in new window' : 'Apri Visuale Regia in una nuova finestra') : undefined}
                            className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                              currentTab === 'regia'
                                ? 'text-white bg-pink-600 border-pink-500 shadow-xs'
                                : 'text-pink-300 hover:text-white bg-neutral-900 border-pink-600/40 hover:border-pink-500'
                            }`}
                          >
                            <Radio className="w-3 h-3 text-pink-400" />
                            <span>{language === 'en' ? 'REGIA VIEW' : 'VISUALE REGIA'}</span>
                            {isRegiaOrDirectorScreen && <ExternalLink className="w-2.5 h-2.5 text-pink-400" />}
                          </button>

                          <button
                            id="subnav-direttori-btn"
                            onClick={() => handleVisualeClick('direttori', 'direttore')}
                            title={isRegiaOrDirectorScreen ? (language === 'en' ? 'Open Directors View in new window' : 'Apri Visuale Direttori in una nuova finestra') : undefined}
                            className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                              currentTab === 'direttori'
                                ? 'text-white bg-yellow-600 border-yellow-500 shadow-xs'
                                : 'text-yellow-300 hover:text-white bg-neutral-900 border-yellow-600/40 hover:border-yellow-500'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3 text-yellow-400" />
                            <span>{language === 'en' ? 'DIRECTORS VIEW' : 'VISUALE DIRETTORI'}</span>
                            {isRegiaOrDirectorScreen && <ExternalLink className="w-2.5 h-2.5 text-yellow-400" />}
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {/* Scenari and Protesi available for all roles */}
                  <button
                    id="subnav-scenari-btn"
                    onClick={() => navigateToView('scenari')}
                    className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                      currentTab === 'scenari' || currentTab === 'catalog'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'text-slate-300 hover:text-white bg-slate-950 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <BookOpen className="w-3 h-3 text-orange-400" />
                    <span>{language === 'en' ? 'SCENARIOS (24)' : 'SCENARI (24)'}</span>
                  </button>

                  <button
                    id="subnav-protesi-btn"
                    onClick={() => navigateToView('protesi')}
                    className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                      currentTab === 'protesi'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'text-slate-300 hover:text-white bg-slate-950 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <Package className="w-3 h-3 text-cyan-400" />
                    <span>{language === 'en' ? 'PROSTHETICS' : 'PROTESI'}</span>
                  </button>

                  <button
                    id="subnav-trucco-btn"
                    onClick={() => navigateToView('trucco')}
                    className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                      currentTab === 'trucco' || currentTab === 'moulage'
                        ? 'bg-pink-600 text-white border-pink-500 shadow-xs'
                        : 'text-pink-300 hover:text-white bg-neutral-900 border-pink-600/50 hover:border-pink-400'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    <span>{language === 'en' ? 'MAKEUP TIMELINE' : 'VISUALE TRUCCO'}</span>
                  </button>

                  <button
                    id="subnav-regia-asset-btn"
                    onClick={() => navigateToView('regia_asset')}
                    className={`flex items-center gap-1 px-2.5 py-0.5 font-bold uppercase text-[11px] tracking-wider rounded transition-all cursor-pointer border flex-shrink-0 ${
                      currentTab === 'regia_asset' || currentTab === 'asset'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-black font-black border-emerald-400 shadow-xs'
                        : 'text-emerald-300 hover:text-white bg-neutral-900 border-emerald-600/50 hover:border-emerald-400'
                    }`}
                  >
                    <Scale className="w-3 h-3 text-emerald-400" />
                    <span>{language === 'en' ? 'REGIA ASSET' : 'REGIA ASSET'}</span>
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
        {/* Mobile Collapsible Drawer Menu (Smooth overlay + slide-in panel) */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 top-[49px] z-50 flex lg:hidden animate-fadeIn">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Content */}
            <div className="relative w-full max-w-xs sm:max-w-sm bg-neutral-950 border-r-2 border-neutral-800 h-full overflow-y-auto shadow-2xl flex flex-col justify-between p-4 z-10 text-neutral-100 font-mono">
              <div className="space-y-4">
                {/* Header Drawer Info */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center font-black text-white text-xs">
                      H
                    </div>
                    <div>
                      <div className="text-xs font-black text-white uppercase tracking-wider">TRAUMA SIM DIRECTOR</div>
                      <div className="text-[10px] text-neutral-400">
                        {language === 'en' ? 'Mobile Navigation Hub' : 'Hub Navigazione Mobile'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Current Active Status Card */}
                <div className="p-2.5 bg-neutral-900/90 rounded border border-neutral-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-neutral-400">{language === 'en' ? 'Active View' : 'Visuale Attiva'}:</span>
                    <span className="px-1.5 py-0.5 bg-neutral-800 text-amber-400 font-bold rounded uppercase text-[10px]">
                      {currentTab}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-neutral-400">{language === 'en' ? 'Current Role' : 'Ruolo Profilo'}:</span>
                    <span className="px-1.5 py-0.5 bg-neutral-800 text-emerald-400 font-bold rounded uppercase text-[10px]">
                      {userRole}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-neutral-400">{language === 'en' ? 'Course Phase' : 'Fase Corso'}:</span>
                    <span className="text-slate-300 font-mono text-[10px]">
                      {language === 'en' ? `Day ${activeDay} • Slot ${activeSlotIndex + 1}` : `Giorno ${activeDay} • Fase ${activeSlotIndex + 1}`}
                    </span>
                  </div>
                </div>

                {/* Section 1: Main Views Navigation */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">
                    {language === 'en' ? 'Role-Based Views' : 'Visuali di Ruolo'}
                  </div>

                  {/* Public View */}
                  <button
                    type="button"
                    onClick={() => {
                      navigateToView('public', 'ospite');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs font-bold transition-all border ${
                      currentTab === 'public'
                        ? 'bg-neutral-800 text-white border-neutral-600'
                        : 'bg-neutral-900/60 hover:bg-neutral-900 text-neutral-300 border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'en' ? 'PUBLIC TIMELINE' : 'SCHERMO PUBBLICO'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  {/* Discente View (When Free Access enabled or open to discenti) */}
                  {(freeAccessEnabled || userRole === 'discente' || isRegiaOrDirectorScreen) && (
                    <button
                      type="button"
                      onClick={() => {
                        handleVisualeClick('discente', 'discente');
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs font-bold transition-all border ${
                        currentTab === 'discente'
                          ? 'bg-cyan-950 text-cyan-200 border-cyan-600'
                          : 'bg-neutral-900/60 hover:bg-neutral-900 text-cyan-300 border-cyan-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-cyan-400" />
                        <span>{language === 'en' ? 'LEARNER VIEW' : 'VISUALE DISCENTE'}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-500" />
                    </button>
                  )}

                  {/* Faculty View */}
                  <button
                    type="button"
                    onClick={() => {
                      handleVisualeClick('faculty', 'faculty');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs font-bold transition-all border ${
                      currentTab === 'faculty'
                        ? 'bg-amber-950 text-amber-200 border-amber-600'
                        : 'bg-neutral-900/60 hover:bg-neutral-900 text-amber-300 border-amber-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>{language === 'en' ? 'FACULTY & TUTORS' : 'VISUALE TUTOR & FACULTY'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                  </button>

                  {/* Tech View */}
                  <button
                    type="button"
                    onClick={() => {
                      handleVisualeClick('tecnici', 'tecnico');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs font-bold transition-all border ${
                      currentTab === 'tecnici'
                        ? 'bg-pink-950 text-pink-200 border-pink-600'
                        : 'bg-neutral-900/60 hover:bg-neutral-900 text-pink-300 border-pink-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-pink-400" />
                      <span>{language === 'en' ? 'TECH TEAM VIEW' : 'VISUALE TEAM TECNICO'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-pink-500" />
                  </button>

                  {/* Regia View */}
                  <button
                    type="button"
                    onClick={() => {
                      if (userRole === 'regia' || currentTab === 'regia') {
                        navigateToView('regia', 'regia');
                      } else {
                        handleRoleSelection('regia');
                      }
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs font-bold transition-all border ${
                      currentTab === 'regia'
                        ? 'bg-pink-900 text-white border-pink-500'
                        : 'bg-neutral-900/60 hover:bg-neutral-900 text-pink-300 border-pink-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-pink-400" />
                      <span>{language === 'en' ? 'CONTROL ROOM (REGIA)' : 'CENTRALE REGIA'}</span>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-pink-400" />
                  </button>

                  {/* Direttori View */}
                  <button
                    type="button"
                    onClick={() => {
                      if (userRole === 'direttore' || currentTab === 'direttori') {
                        navigateToView('direttori', 'direttore');
                      } else {
                        handleRoleSelection('direttore');
                      }
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs font-bold transition-all border ${
                      currentTab === 'direttori'
                        ? 'bg-yellow-950 text-yellow-200 border-yellow-600'
                        : 'bg-neutral-900/60 hover:bg-neutral-900 text-yellow-300 border-yellow-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-yellow-400" />
                      <span>{language === 'en' ? 'SCIENTIFIC DIRECTION' : 'DIREZIONE SCIENTIFICA'}</span>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-yellow-400" />
                  </button>

                  {/* Regia Asset View */}
                  <button
                    type="button"
                    id="mobile-drawer-regia-asset-btn"
                    onClick={() => {
                      navigateToView('regia_asset');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs font-bold transition-all border ${
                      currentTab === 'regia_asset' || currentTab === 'asset'
                        ? 'bg-emerald-950 text-emerald-200 border-emerald-600'
                        : 'bg-neutral-900/60 hover:bg-neutral-900 text-emerald-300 border-emerald-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'en' ? 'REGIA ASSET CONTROL' : 'REGIA ASSET & CARICHI'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  </button>
                </div>

                {/* Section 2: Clinical Scenarios & Prosthetics & Tactical Map */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">
                    {language === 'en' ? 'Tactical Map & Catalogues' : 'Mappa Tattica & Didattica'}
                  </div>

                  {/* Tactical Map Drawer Item */}
                  <button
                    type="button"
                    id="mobile-drawer-map-btn"
                    onClick={() => {
                      setIsTacticalMapOpen(true);
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs font-bold transition-all border bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-700/70"
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'en' ? 'TACTICAL COMBAT MAP' : 'MAPPA TATTICA OPERATIVA'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigateToView('scenari');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs font-bold transition-all border ${
                      currentTab === 'scenari' || currentTab === 'catalog'
                        ? 'bg-orange-950 text-orange-200 border-orange-600'
                        : 'bg-neutral-900/60 hover:bg-neutral-900 text-orange-300 border-orange-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-orange-400" />
                      <span>{language === 'en' ? '24 TRAUMA SCENARIOS' : '24 SCENARI CLINICI'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigateToView('protesi');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs font-bold transition-all border ${
                      currentTab === 'protesi'
                        ? 'bg-cyan-950 text-cyan-200 border-cyan-600'
                        : 'bg-neutral-900/60 hover:bg-neutral-900 text-cyan-300 border-cyan-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-cyan-400" />
                      <span>{language === 'en' ? 'PROSTHETICS & MOULAGE' : 'MENU PROTESI (BLOCCHI 1–4)'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigateToView('trucco');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs font-bold transition-all border ${
                      currentTab === 'trucco' || currentTab === 'moulage'
                        ? 'bg-pink-950 text-pink-200 border-pink-600'
                        : 'bg-neutral-900/60 hover:bg-neutral-900 text-pink-300 border-pink-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <span>{language === 'en' ? 'MAKEUP & TIMELINE VIEW' : 'VISUALE TRUCCO & TIMELINE'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  </button>
                </div>

                {/* Section 3: Quick Utilities */}
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">
                    {language === 'en' ? 'Utilities & Access' : 'Strumenti & Accesso'}
                  </div>

                  {freeAccessEnabled && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAreaDiscentiModalOpen(true);
                        setIsMobileDrawerOpen(false);
                      }}
                      className="w-full py-2 px-3 bg-gradient-to-r from-cyan-600 to-emerald-600 text-black font-black text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-black stroke-[2.5]" />
                      <span>AREA DISCENTI (NOME/COGNOME)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsKeypadModalOpen(true);
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full py-2 px-3 bg-red-950 hover:bg-red-900 text-red-200 border border-red-700 font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-red-400" />
                    <span>{language === 'en' ? 'PIN KEYPAD ACCESS' : 'ACCESSO PIN RISERVATO'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSyncModalOpen(true);
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full py-1.5 px-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-700 text-xs rounded flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'en' ? 'Network & Sync Status' : 'Stato Sincronizzazione'}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {syncStatus.isOnline ? 'LIVE' : 'OFFLINE'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toggleFullscreenMode();
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full py-2 px-3 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/70 font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'en' ? 'TRAINING ROOM FULLSCREEN' : 'SCHERMO INTERO AULA'}</span>
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-neutral-800 text-[10px] text-neutral-500 text-center space-y-1">
                <div>HITTER INTUBATI EM • ADVANCED TRAUMA</div>
                <div className="text-[9px] text-neutral-600 font-mono">Real-Time Mobile Synchronized Console</div>
              </div>
            </div>
          </div>
        )}
        </header>
      )}

      {/* Real-time Connectivity & Sync Status Modal */}
      <SyncStatusModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />

      {/* First Access Email Login / Verification Modal */}
      <EmailAccessModal
        isOpen={isEmailAccessModalOpen}
        onClose={() => setIsEmailAccessModalOpen(false)}
      />

      {/* Protected Reserved Area Access Keypad Modal (PIN: 9438 = Regia, 0118 = Direzione) */}
      <RegiaKeypadModal
        isOpen={isKeypadModalOpen}
        onClose={() => setIsKeypadModalOpen(false)}
      />

      {/* Accesso Riservato Discenti Modal (Nome e Cognome) */}
      <AreaDiscentiModal
        isOpen={isAreaDiscentiModalOpen}
        onClose={() => setIsAreaDiscentiModalOpen(false)}
      />
    </>
  );
};
