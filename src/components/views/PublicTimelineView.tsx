import React, { useState, useMemo } from 'react';
import {
  Activity,
  Calendar,
  Clock,
  Globe,
  Lock,
  MapPin,
  Users,
  Target,
  Wrench,
  Phone,
  ArrowRight,
  ArrowDown,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Minimize2,
  Maximize2,
  Eye,
  EyeOff,
  Info,
  ShieldAlert,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  Sparkles,
  FileText,
} from 'lucide-react';
import { GroupType } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { DaySelectorToggle } from '../DaySelectorToggle';
import { getGroupPhaseDetails, GroupPhaseEnrichedDetails } from '../../utils/groupPhaseDetails';
import { translateSlot, translateLocation } from '../../utils/courseTranslation';

// Metadata for the 4 macro-groups
const GROUP_META: Record<
  GroupType,
  { name: string; range: string; squads: number[]; defaultTcccLoc: string; defaultSrLoc: string }
> = {
  A: {
    name: 'ALPHA',
    range: 'DISC-01 – DISC-15',
    squads: [1, 2, 3],
    defaultTcccLoc: 'Ambiente Tattico 1',
    defaultSrLoc: 'Box Shock Room 1',
  },
  B: {
    name: 'BRAVO',
    range: 'DISC-16 – DISC-30',
    squads: [4, 5, 6],
    defaultTcccLoc: 'Ambiente Tattico 2',
    defaultSrLoc: 'Box Shock Room 2',
  },
  C: {
    name: 'CHARLIE',
    range: 'DISC-31 – DISC-45',
    squads: [7, 8, 9],
    defaultTcccLoc: 'Ambiente Tattico 3',
    defaultSrLoc: 'Box Shock Room 3',
  },
  D: {
    name: 'DELTA',
    range: 'DISC-46 – DISC-60',
    squads: [10, 11, 12],
    defaultTcccLoc: 'Ambiente Tattico 2',
    defaultSrLoc: 'Box Shock Room 1',
  },
};

const ALL_GROUPS: GroupType[] = ['A', 'B', 'C', 'D'];

interface HandoverInfo {
  isHandover: boolean;
  deliveringGroup: GroupType;
  receivingGroup: GroupType;
  deliveringName: string;
  receivingName: string;
  deliveringRange: string;
  receivingRange: string;
  deliveringSquads: number[];
  receivingSquads: number[];
  deliveringLocation: string;
  receivingLocation: string;
  patientIds: number[];
  deliveringSubtitle: string;
  receivingSubtitle: string;
}

// Helper to determine delivering and receiving groups during handover
const extractHandoverInfo = (slot: any, day: number, isEn: boolean = false): HandoverInfo | null => {
  if (!slot) return null;

  const slotTitle = (slot.title || '').toLowerCase();
  const slotId = (slot.id || '').toLowerCase();
  const slotDesc = (slot.description || '').toLowerCase();

  const acts = slot.groupActivities || {};
  const hasHandover =
    slotTitle.includes('handover') ||
    slotId.includes('handover') ||
    slotDesc.includes('handover') ||
    Object.values(acts).some(
      (a: any) =>
        (a?.title || '').toLowerCase().includes('consegna') ||
        (a?.title || '').toLowerCase().includes('ricezione') ||
        (a?.subtitle || '').toLowerCase().includes('consegna') ||
        (a?.subtitle || '').toLowerCase().includes('ricezione')
    );

  if (!hasHandover) return null;

  let delivering: GroupType | null = null;
  let receiving: GroupType | null = null;
  let patientIds: number[] = [];

  // 1. Check activities for explicit partnerGroup, titles and patientIds
  ALL_GROUPS.forEach((g) => {
    const act = acts[g];
    if (!act) return;
    const aTitle = (act.title || '').toLowerCase();
    const aSub = (act.subtitle || '').toLowerCase();
    const aLoc = (act.location || '').toLowerCase();

    if (
      aTitle.includes('consegna') ||
      aSub.includes('consegna') ||
      act.activityType === 'scenario_extra' ||
      aLoc.includes('➔')
    ) {
      delivering = g;
      if (act.partnerGroup && !receiving) {
        receiving = act.partnerGroup as GroupType;
      }
      if (act.patientIds && act.patientIds.length > 0) {
        patientIds = act.patientIds;
      }
    }

    if (
      aTitle.includes('ricezione') ||
      aSub.includes('ricezione') ||
      act.activityType === 'scenario_intra'
    ) {
      receiving = g;
      if (act.partnerGroup && !delivering) {
        delivering = act.partnerGroup as GroupType;
      }
      if (act.patientIds && act.patientIds.length > 0) {
        patientIds = act.patientIds;
      }
    }
  });

  // 2. Canonical specular rotation rules fallback (Section 4 of course specs)
  if (!delivering || !receiving) {
    if (day === 2) {
      if (slotId.includes('b1')) {
        delivering = 'A';
        receiving = 'C';
        patientIds = [1, 2, 3];
      } else if (slotId.includes('b2')) {
        delivering = 'D';
        receiving = 'B';
        patientIds = [4, 5, 6];
      } else if (slotId.includes('b3')) {
        delivering = 'B';
        receiving = 'D';
        patientIds = [7, 8, 9];
      } else if (slotId.includes('b4')) {
        delivering = 'C';
        receiving = 'A';
        patientIds = [10, 11, 12];
      }
    } else {
      if (slotId.includes('b1')) {
        delivering = 'B';
        receiving = 'D';
        patientIds = [13, 14, 15];
      } else if (slotId.includes('b2')) {
        delivering = 'C';
        receiving = 'A';
        patientIds = [16, 17, 18];
      } else if (slotId.includes('b3')) {
        delivering = 'A';
        receiving = 'C';
        patientIds = [19, 20, 21];
      } else if (slotId.includes('b4')) {
        delivering = 'D';
        receiving = 'B';
        patientIds = [22, 23, 24];
      }
    }
  }

  // Safety fallbacks
  if (!delivering) delivering = 'A';
  if (!receiving) receiving = 'C';
  if (patientIds.length === 0) patientIds = [1, 2, 3];

  const delMeta = GROUP_META[delivering];
  const recMeta = GROUP_META[receiving];

  const delAct = acts[delivering];
  const recAct = acts[receiving];

  return {
    isHandover: true,
    deliveringGroup: delivering,
    receivingGroup: receiving,
    deliveringName: delMeta.name,
    receivingName: recMeta.name,
    deliveringRange: delMeta.range,
    receivingRange: recMeta.range,
    deliveringSquads: delMeta.squads,
    receivingSquads: recMeta.squads,
    deliveringLocation: delAct?.location ? translateLocation(delAct.location, isEn ? 'en' : 'it') : delMeta.defaultTcccLoc,
    receivingLocation: recAct?.location ? translateLocation(recAct.location, isEn ? 'en' : 'it') : delMeta.defaultSrLoc,
    patientIds,
    deliveringSubtitle: delAct?.subtitle || (isEn ? `Casualty stretcher handover to Group ${recMeta.name}` : `Consegna barellata feriti a Gruppo ${recMeta.name}`),
    receivingSubtitle: recAct?.subtitle || (isEn ? `Receiving stretcher from Group ${delMeta.name} and initiating Shock Room` : `Ricezione barellata da Gruppo ${delMeta.name} e avvio Shock Room`),
  };
};

// Component for the animated horizontal scrolling ticker banner inside each group
const GroupScrollingTicker: React.FC<{
  group: GroupType;
  phaseDetails: GroupPhaseEnrichedDetails;
  onOpenDetails?: () => void;
  isEn?: boolean;
}> = ({ group, phaseDetails, onOpenDetails, isEn = false }) => {
  const tickerItems: { icon: string; label: string; text: string; highlight?: boolean }[] = [];

  if (phaseDetails.protocolTimingNote) {
    tickerItems.push({
      icon: '⏱️',
      label: isEn ? 'CRITICAL TIMING' : 'TIMING CRITICO',
      text: phaseDetails.protocolTimingNote,
      highlight: true,
    });
  }

  if (phaseDetails.phaseTypeLabel) {
    tickerItems.push({
      icon: '⚡',
      label: isEn ? 'PHASE' : 'FASE',
      text: phaseDetails.phaseTypeLabel,
    });
  }

  if (phaseDetails.operationalDescription) {
    tickerItems.push({
      icon: '📋',
      label: isEn ? 'OVERVIEW' : 'INQUADRAMENTO',
      text: phaseDetails.operationalDescription,
    });
  }

  if (phaseDetails.didacticObjectives && phaseDetails.didacticObjectives.length > 0) {
    tickerItems.push({
      icon: '🎯',
      label: isEn ? 'OBJECTIVES' : 'OBIETTIVI',
      text: phaseDetails.didacticObjectives.join(' • '),
    });
  }

  if (phaseDetails.simulatorData.scenarioCode) {
    tickerItems.push({
      icon: '🫀',
      label: isEn ? 'SIMULATOR' : 'SIMULATORE',
      text: `${phaseDetails.simulatorData.scenarioCode}${
        phaseDetails.simulatorData.simulatorHardware ? ` (${phaseDetails.simulatorData.simulatorHardware})` : ''
      }`,
    });
  }

  if (phaseDetails.technicianData.hasTech) {
    tickerItems.push({
      icon: '🔧',
      label: isEn ? 'TECH POST' : 'PRESIDIO TECH',
      text: `${phaseDetails.technicianData.techName} [${phaseDetails.technicianData.techBadge}]${
        phaseDetails.technicianData.techPhone ? ` • ${isEn ? 'Phone:' : 'Tel:'} ${phaseDetails.technicianData.techPhone}` : ''
      }`,
    });
  }

  const [isPaused, setIsPaused] = useState(false);

  // Render content block (duplicated twice for seamless infinite marquee loop)
  const renderContent = () => (
    <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap pr-4 sm:pr-6">
      {tickerItems.map((item, idx) => (
        <span key={idx} className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono">
          <span className="text-xs">{item.icon}</span>
          <span
            className={`font-black uppercase tracking-wider px-1 py-0.2 rounded text-[8px] sm:text-[9px] ${
              item.highlight
                ? 'bg-yellow-400 text-black animate-pulse font-extrabold'
                : 'bg-neutral-800 text-orange-400'
            }`}
          >
            {item.label}
          </span>
          <span className={`${item.highlight ? 'text-yellow-200 font-bold' : 'text-neutral-300'}`}>
            {item.text}
          </span>
          <span className="text-neutral-700 font-bold ml-1 sm:ml-2">///</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="bg-neutral-950/95 border border-neutral-800 rounded px-2 sm:px-2.5 py-1.5 overflow-hidden relative group/ticker shadow-inner w-full max-w-full"
      title={isEn ? 'Scrolling phase details banner (tap to open details sheet)' : 'Banner scorrevole dettagli fase (tocca per aprire la scheda dettagli)'}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onOpenDetails}
          className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-orange-950 hover:bg-orange-900 active:bg-orange-800 text-orange-300 border border-orange-700/80 rounded text-[9px] sm:text-[10px] font-mono font-black uppercase transition-colors cursor-pointer min-h-[30px]"
          title={isEn ? 'Open operational and training details sheet' : 'Apri scheda dettagli operativi e didattici'}
        >
          <Radio className="w-2.5 h-2.5 text-orange-500 animate-pulse" />
          <span>{isEn ? 'PHASE INFO' : 'INFO FASE'}</span>
          <Info className="w-2.5 h-2.5 text-orange-400" />
        </button>

        <div
          onClick={onOpenDetails}
          className="overflow-hidden whitespace-nowrap flex-1 relative w-full cursor-pointer"
        >
          {/* Dual marquee block for continuous seamless scroll */}
          <div
            className="animate-marquee inline-flex"
            style={{ animationPlayState: isPaused ? 'paused' : undefined }}
          >
            {renderContent()}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PublicTimelineView: React.FC = () => {
  const {
    activeDay,
    activeSlotIndex,
    timerSeconds,
    isTimerRunning,
    syncStatus,
    faculty,
    simulatorPatients,
    technicians,
    discenti,
    setCurrentTab,
    setUserRole,
    courseStartSchedule,
    timeRemainingMs,
    isCourseStarted,
    language,
  } = useCourse();

  const isEn = language === 'en';

  // Overlay state for Handover alert: by default it is open/expanded overlaying the 4 groups
  const [isOverlayMinimized, setIsOverlayMinimized] = useState<boolean>(false);
  // Transparency HUD state: allows adjusting overlay transparency to reveal underlying public view
  const [isGhostMode, setIsGhostMode] = useState<boolean>(false);

  // Mobile Group Filter: 'ALL' or a specific group 'A' | 'B' | 'C' | 'D'
  const [selectedMobileGroup, setSelectedMobileGroup] = useState<'ALL' | GroupType>('ALL');

  // Discente Quick-Finder state
  const [isFinderOpen, setIsFinderOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Detailed group operational modal
  const [detailedGroupModal, setDetailedGroupModal] = useState<GroupType | null>(null);

  const isCurrentUnlocked = true;

  const rawDayMasterSlots = INITIAL_TIMELINE_SLOTS.filter((s) => s.day === activeDay);
  const dayMasterSlots = useMemo(() => rawDayMasterSlots.map((s) => translateSlot(s, language)), [rawDayMasterSlots, language]);
  const publicSlots = useMemo(() => dayMasterSlots.filter((s) => !s.id.includes('setup')), [dayMasterSlots]);

  const rawMasterCurrentSlot = INITIAL_TIMELINE_SLOTS[activeSlotIndex] || rawDayMasterSlots[0] || INITIAL_TIMELINE_SLOTS[0];
  const slotIdxInDay = rawDayMasterSlots.findIndex((s) => s.id === rawMasterCurrentSlot?.id);
  const masterCurrentSlot = useMemo(() => translateSlot(rawMasterCurrentSlot, language), [rawMasterCurrentSlot, language]);
  let currentSlot = publicSlots.find((s) => s.id === masterCurrentSlot?.id);
  if (!currentSlot && publicSlots.length > 0) {
    currentSlot = publicSlots[0];
  }
  if (!currentSlot) currentSlot = dayMasterSlots[0] || translateSlot(INITIAL_TIMELINE_SLOTS[0], language);

  // Handover Info Extraction
  const handoverInfo = useMemo(() => {
    return extractHandoverInfo(currentSlot, activeDay, isEn);
  }, [currentSlot, activeDay, isEn]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatCumulativeTimer = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${hours}h ${mins.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatGateCountdown = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (days > 0) {
      return `${days}${isEn ? 'd' : 'g'} ${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCumulativeSeconds = (isMorning: boolean, isNightToMorning: boolean) => {
    if (courseStartSchedule?.isGateEnabled && !isCourseStarted && timeRemainingMs > 0) {
      return Math.floor(timeRemainingMs / 1000);
    }
    return timerSeconds;
  };

  // Group Badge Colors
  const groupBadgeColors: Record<GroupType, { bg: string; text: string; border: string }> = {
    A: { bg: 'bg-cyan-500', text: 'text-black', border: 'border-cyan-400' },
    B: { bg: 'bg-amber-500', text: 'text-black', border: 'border-amber-400' },
    C: { bg: 'bg-emerald-500', text: 'text-black', border: 'border-emerald-400' },
    D: { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-400' },
  };

  // Discente Search Resolution
  const searchedDiscenti = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return (discenti || []).filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        (d.badgeCode || '').toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        (d.specialty || '').toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery, discenti]);

  const getDiscenteGroup = (teamId: number): GroupType => {
    if (teamId <= 3) return 'A';
    if (teamId <= 6) return 'B';
    if (teamId <= 9) return 'C';
    return 'D';
  };

  return (
    <div className="space-y-3 sm:space-y-4 pb-12 w-full max-w-full 2xl:max-w-[1850px] mx-auto px-1.5 sm:px-3 md:px-4">
      {/* COUNTDOWN / WAITING SCREENS OR ACTIVE ACTIVITIES */}
      {(() => {
        // Se il Gate è abilitato e il corso non è ancora iniziato (countdown attivo)
        const isScheduledGateWaiting = courseStartSchedule?.isGateEnabled && !isCourseStarted && timeRemainingMs > 0;

        if (isScheduledGateWaiting) {
          return (
            <div className="bg-neutral-950 border-2 sm:border-3 border-amber-500 p-4 sm:p-8 md:p-14 rounded-xl shadow-2xl text-center space-y-4 sm:space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-red-500/10 pointer-events-none" />
              <div className="relative z-10 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
                {/* Course Name in First Plane / Primo Piano */}
                <div className="space-y-2 sm:space-y-3 pb-2 border-b border-neutral-800">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-600/70 text-red-400 rounded-full font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-sm">
                      <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      <span>{isEn ? 'OFFICIAL COURSE • INTUBATI EM' : 'CORSO UFFICIALE • INTUBATI EM'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DaySelectorToggle variant="public" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 tracking-tight leading-tight uppercase filter drop-shadow">
                      HITTER
                    </h1>
                    <p className="text-xs sm:text-base md:text-xl font-mono font-bold text-amber-300 tracking-wider uppercase">
                      High Intensive Training Trauma Emergency Response
                    </p>
                  </div>
                </div>

                {/* Event Phase: Countdown Apertura Gate */}
                <div className="space-y-1">
                  <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-amber-500 text-black font-black text-[10px] sm:text-xs uppercase tracking-widest rounded shadow-sm">
                    {isEn ? 'ACCESS STATUS: PRE-COURSE' : 'STATO ACCESSO: PRE-CORSO'}
                  </span>
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight pt-1">
                    {isEn ? 'GATE OPENING COUNTDOWN' : 'COUNTDOWN APERTURA GATE'}
                  </h2>
                </div>

                <div className="bg-amber-950/80 border-2 border-amber-500 p-4 sm:p-6 rounded-lg shadow-lg max-w-xl mx-auto animate-pulse">
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-300 uppercase tracking-widest block mb-1.5 flex items-center justify-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>{isEn ? 'OFFICIAL CONTROL ROOM NOTICE • SCHEDULED OPENING' : 'AVVISO UFFICIALE REGIA • APERTURA PROGRAMMATA'}</span>
                  </span>
                  <p className="text-base sm:text-2xl font-black text-white uppercase tracking-wide leading-snug">
                    {isEn ? `LEARNER GATE OPENS AT ${courseStartSchedule.scheduledTime}` : `IL GATE DISCENTI APRE ALLE ORE ${courseStartSchedule.scheduledTime}`}
                  </p>
                  <p className="text-[11px] sm:text-xs font-mono text-amber-200 mt-1.5">
                    {isEn ? `Scheduled date: ${courseStartSchedule.scheduledDate} • Access reserved for assigned teams` : `Data prevista: ${courseStartSchedule.scheduledDate} • Accesso riservato ai team assegnati`}
                  </p>
                </div>

                <div className="py-4 sm:py-6 px-4 sm:px-8 bg-neutral-900/95 border-2 border-amber-500/80 rounded-xl shadow-inner inline-block my-1 sm:my-2 w-full max-w-md mx-auto">
                  <span className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                    {isEn ? 'TIME REMAINING UNTIL GATE OPENING' : "TEMPO RIMANENTE ALL'APERTURA DEL GATE"}
                  </span>
                  <div className="text-3xl sm:text-5xl md:text-6xl font-mono font-black text-amber-400 animate-pulse tracking-wider break-words">
                    {formatGateCountdown(timeRemainingMs)}
                  </div>
                </div>

                <div className="pt-1 sm:pt-2 space-y-2">
                  <p className="text-base sm:text-xl md:text-2xl font-black text-amber-300 uppercase tracking-wider italic">
                    {isEn ? '"Verify individual equipment, contact Faculty and align Teams."' : '"Verifica dotazioni individuali, contatto con Faculty e allineamento Squadre."'}
                  </p>
                  <p className="text-[11px] sm:text-xs text-neutral-400 font-mono">
                    {isEn ? 'Centralized time synchronization from Control Room' : 'Sincronizzazione oraria centralizzata dalla Regia Operativa'}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        const isDayBefore8 = (activeDay === 2 || activeDay === 3) && slotIdxInDay === 0;
        const isMorningCountdown = (activeDay === 2 || activeDay === 3) && slotIdxInDay === 1;
        const isNightToMorningCountdown = activeDay === 2 && currentSlot?.id === 'd2-chiusura';

        // Prima della fase 2 (slot 0), mostra solo il messaggio di attesa senza countdown
        if (isDayBefore8) {
          return (
            <div className="bg-neutral-950 border-2 sm:border-3 border-orange-500 p-4 sm:p-8 md:p-14 rounded-xl shadow-2xl text-center space-y-4 sm:space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-red-500/10 pointer-events-none" />
              <div className="relative z-10 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
                {/* Course Name in First Plane */}
                <div className="space-y-2 sm:space-y-3 pb-2 border-b border-neutral-800">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-600/70 text-red-400 rounded-full font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-sm">
                      <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      <span>{isEn ? 'OFFICIAL COURSE • INTUBATI EM' : 'CORSO UFFICIALE • INTUBATI EM'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DaySelectorToggle variant="public" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 tracking-tight leading-tight uppercase filter drop-shadow">
                      HITTER
                    </h1>
                    <p className="text-xs sm:text-base md:text-xl font-mono font-bold text-amber-300 tracking-wider uppercase">
                      High Intensive Training Trauma Emergency Response
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-orange-600 text-black font-black text-[10px] sm:text-xs uppercase tracking-widest rounded shadow-sm">
                    {isEn ? 'OPERATIONAL STATUS: PRE-OPENING' : 'STATO OPERATIVO: PRE-APERTURA'}
                  </span>
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight pt-1">
                    {isEn ? 'AWAITING COURSE OPENING' : 'ATTESA APERTURA CORSO'}
                  </h2>
                </div>

                <div className="bg-red-950/80 border-2 border-red-600 p-4 sm:p-6 rounded-lg shadow-lg max-w-xl mx-auto animate-pulse">
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-red-300 uppercase tracking-widest block mb-1.5">
                    {isEn ? `OFFICIAL CONTROL ROOM NOTICE • DAY 0${activeDay}` : `AVVISO UFFICIALE REGIA • DAY 0${activeDay}`}
                  </span>
                  <p className="text-base sm:text-2xl font-black text-white uppercase tracking-wide leading-snug">
                    {isEn ? `LEARNER GATE OPENS AT ${courseStartSchedule?.scheduledTime || '08:30'}` : `IL GATE DISCENTI APRE ALLE ${courseStartSchedule?.scheduledTime || '08:30'}`}
                  </p>
                </div>

                <div className="pt-1 sm:pt-2 space-y-2">
                  <p className="text-base sm:text-xl md:text-2xl font-black text-orange-300 uppercase tracking-wider italic">
                    {isEn ? '"Station setup and faculty briefing in progress. Stand by."' : '"Preparazione postazioni e briefing faculty in corso. Tenetevi pronti."'}
                  </p>
                  <p className="text-[11px] sm:text-xs text-neutral-400 font-mono">
                    {isEn ? `Day ${activeDay} • Awaiting official opening at ${courseStartSchedule?.scheduledTime || '08:30'}` : `Day ${activeDay} • Attesa apertura ufficiale ore ${courseStartSchedule?.scheduledTime || '08:30'}`}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        if (isMorningCountdown || isNightToMorningCountdown) {
          return (
            <div className="bg-neutral-950 border-2 sm:border-3 border-orange-500 p-4 sm:p-8 md:p-14 rounded-xl shadow-2xl text-center space-y-4 sm:space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-red-500/10 pointer-events-none" />
              <div className="relative z-10 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
                {/* Course Name in First Plane */}
                <div className="space-y-2 sm:space-y-3 pb-2 border-b border-neutral-800">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-600/70 text-red-400 rounded-full font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-sm">
                      <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      <span>{isEn ? 'OFFICIAL COURSE • INTUBATI EM' : 'CORSO UFFICIALE • INTUBATI EM'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DaySelectorToggle variant="public" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 tracking-tight leading-tight uppercase filter drop-shadow">
                      HITTER
                    </h1>
                    <p className="text-xs sm:text-base md:text-xl font-mono font-bold text-amber-300 tracking-wider uppercase">
                      High Intensive Training Trauma Emergency Response
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-orange-600 text-black font-black text-[10px] sm:text-xs uppercase tracking-widest rounded shadow-sm">
                    {isEn ? 'OPERATIONAL STATUS: TEAM DEPLOYMENT' : 'STATO OPERATIVO: DEPLOYMENT SQUADRE'}
                  </span>
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight pt-1">
                    {isMorningCountdown ? (isEn ? `COUNTDOWN TO OPENING (${courseStartSchedule?.scheduledTime || '08:30'})` : `COUNTDOWN VERSO APERTURA (${courseStartSchedule?.scheduledTime || '08:30'})`) : (isEn ? 'UPCOMING ACTIVITY' : 'ATTIVITÀ IN ARRIVO')}
                  </h2>
                </div>

                {isMorningCountdown && (
                  <div className="bg-orange-950/80 border-2 border-orange-500 p-4 sm:p-5 rounded-lg shadow-lg max-w-xl mx-auto animate-pulse">
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-orange-300 uppercase tracking-widest block mb-1">
                      {isEn ? 'OFFICIAL CONTROL ROOM DIRECTIVE' : 'DISPOSIZIONE UFFICIALE REGIA'}
                    </span>
                    <p className="text-xs sm:text-base font-black text-white uppercase tracking-wide leading-snug">
                      {isEn ? 'Each team is requested to assemble and reach their assigned Faculty.' : 'Ogni squadra è invitata a raggrupparsi ed a raggiungere il proprio Faculty assegnato.'}
                    </p>
                  </div>
                )}

                <div className="py-4 sm:py-6 px-4 sm:px-8 bg-neutral-900/95 border-2 border-orange-500/80 rounded-xl shadow-inner inline-block my-1 sm:my-2 w-full max-w-md mx-auto">
                  <span className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                    {isMorningCountdown ? (isEn ? 'TIME REMAINING UNTIL START' : "TEMPO RIMANENTE ALL'AVVIO") : (isEn ? 'BLOCK COUNTDOWN' : 'COUNTDOWN BLOCCO')}
                  </span>
                  <div className="text-3xl sm:text-5xl md:text-6xl font-mono font-black text-orange-400 animate-pulse tracking-wider break-words">
                    {courseStartSchedule?.isGateEnabled && !isCourseStarted && timeRemainingMs > 0
                      ? formatGateCountdown(timeRemainingMs)
                      : formatCumulativeTimer(getCumulativeSeconds(isMorningCountdown, isNightToMorningCountdown))}
                  </div>
                </div>

                <div className="pt-1 sm:pt-2 space-y-2">
                  <p className="text-base sm:text-xl md:text-2xl font-black text-orange-300 uppercase tracking-wider italic">
                    "{isMorningCountdown ? (isEn ? 'Team assembly and Faculty contact in progress' : 'Raggruppamento squadre e contatto Faculty in corso') : (isEn ? 'Block Start' : 'Avvio Blocco')}"
                  </p>
                  <p className="text-[11px] sm:text-xs text-neutral-400 font-mono">
                    {isMorningCountdown && (isEn ? `Day ${activeDay} • Countdown to opening at ${courseStartSchedule?.scheduledTime || '08:30'}` : `Day ${activeDay} • Countdown verso l'apertura delle ore ${courseStartSchedule?.scheduledTime || '08:30'}`)}
                    {isNightToMorningCountdown && (isEn ? `Transition Day 2 ➔ Day 3 (Deadline ${courseStartSchedule?.scheduledTime || '08:30'})` : `Transizione Day 2 ➔ Day 3 (Scadenza ore ${courseStartSchedule?.scheduledTime || '08:30'})`)}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="bg-neutral-900 border-2 border-orange-500/80 p-3.5 sm:p-5 shadow-2xl space-y-4">
            {/* Slot Time & Title Header */}
            <div className="border-b border-neutral-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-red-950 border border-red-600/70 text-red-300 font-mono text-[10px] font-black uppercase tracking-wider rounded">
                    HITTER • INTUBATI EM
                  </span>
                  <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">
                    {isEn ? 'PHASE TIME:' : 'ORARIO FASE:'} {currentSlot?.timeRange || '08:30 - 08:45'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500 animate-pulse" />
                  {currentSlot?.title || (isEn ? 'TEAMS ONGOING ACTIVITIES' : 'ATTIVITÀ IN CORSO DELLE SQUADRE')}
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <DaySelectorToggle variant="public" />
                {handoverInfo?.isHandover && (
                  <span className="px-3 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded flex items-center gap-1.5 animate-pulse shadow">
                    <AlertTriangle className="w-3.5 h-3.5" /> HANDOVER LIVE (:30-:35)
                  </span>
                )}
                <div className="px-3 py-1 bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 flex items-center gap-2">
                  <span>{isEn ? 'Master Phase:' : 'Fase Master:'}</span>
                  <span className="font-black text-orange-400 uppercase">DAY 0{activeDay}</span>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* TOOLBAR DI NAVIGAZIONE E RICERCA OTTIMIZZATA PER SMARTPHONE               */}
            {/* ========================================================================= */}
            <div className="bg-neutral-950/90 border border-neutral-800 p-2 sm:p-2.5 rounded-lg shadow-md space-y-2">
              {/* Group Quick Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 mr-0.5">
                    <Layers className="w-3.5 h-3.5 text-orange-400" />
                    <span className="hidden xs:inline">{isEn ? 'GROUPS:' : 'GRUPPI:'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedMobileGroup('ALL')}
                    className={`min-h-[38px] px-2.5 sm:px-3 py-1 font-mono text-xs font-black uppercase tracking-wider rounded transition-all cursor-pointer flex-shrink-0 flex items-center gap-1 ${
                      selectedMobileGroup === 'ALL'
                        ? 'bg-orange-500 text-black shadow-md'
                        : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isEn ? 'ALL (4)' : 'TUTTI (4)'}</span>
                  </button>

                  {ALL_GROUPS.map((grp) => {
                    const isAct = selectedMobileGroup === grp;
                    const meta = GROUP_META[grp];
                    const badge = groupBadgeColors[grp];
                    return (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => setSelectedMobileGroup(grp)}
                        className={`min-h-[38px] px-2.5 sm:px-3 py-1 font-mono text-xs font-black uppercase tracking-wider rounded transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                          isAct
                            ? `${badge.bg} ${badge.text} shadow-md ring-2 ring-orange-500`
                            : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
                        }`}
                      >
                        <span>{grp} • {meta.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Toggle for Discente Finder */}
                <button
                  type="button"
                  onClick={() => setIsFinderOpen(!isFinderOpen)}
                  className={`min-h-[38px] px-3 py-1.5 text-xs font-mono font-bold rounded border transition-colors flex items-center gap-1.5 justify-center cursor-pointer flex-shrink-0 self-stretch sm:self-auto ${
                    isFinderOpen
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                      : 'bg-neutral-900 text-neutral-300 hover:text-white border-neutral-800'
                  }`}
                  title={isEn ? 'Search by student ID or name' : 'Cerca per matricola studente o nome'}
                >
                  <Search className="w-3.5 h-3.5 text-orange-400" />
                  <span>{isEn ? 'FIND YOUR ID (DISC)' : 'TROVA TUA MATRICOLA (DISC)'}</span>
                  {isFinderOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Collapsible Quick-Finder Panel */}
              {isFinderOpen && (
                <div className="bg-neutral-900/95 border border-orange-500/50 p-2.5 sm:p-3 rounded-lg space-y-2 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isEn ? 'Type student ID or surname (e.g. DISC-12 or 12 or Rossi)...' : 'Digita matricola o cognome (es. DISC-12 o 12 o Rossi)...'}
                        className="w-full min-h-[38px] bg-neutral-950 border border-neutral-700 rounded pl-8 pr-8 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono text-neutral-400 flex-shrink-0">
                      <span>{isEn ? 'Quick:' : 'Rapidi:'}</span>
                      {(['DISC-01', 'DISC-16', 'DISC-31', 'DISC-46'] as const).map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setSearchQuery(code)}
                          className="px-2 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 rounded cursor-pointer min-h-[30px]"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Discente search results */}
                  {searchQuery.trim() && (
                    <div className="space-y-1.5 pt-1">
                      {searchedDiscenti.length === 0 ? (
                        <p className="text-xs text-neutral-400 italic">{isEn ? `No student found with "${searchQuery}"` : `Nessun discente trovato con "${searchQuery}"`}</p>
                      ) : (
                        searchedDiscenti.map((disc) => {
                          const discGrp = getDiscenteGroup(disc.teamId);
                          const discAct = currentSlot?.groupActivities?.[discGrp];
                          const facMatch = faculty.find((f) => f.assignedTeamId === disc.teamId) || faculty[disc.teamId - 1];
                          const isLeader = disc.role?.toLowerCase().includes('leader') || disc.id.endsWith('01') || disc.id.endsWith('06') || disc.id.endsWith('11');

                          return (
                            <div
                              key={disc.id}
                              className="bg-neutral-950 border border-neutral-700 p-2 sm:p-2.5 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-1.5 py-0.5 bg-orange-600 text-black font-mono font-black text-[10px] rounded">
                                    {disc.id}
                                  </span>
                                  <span className="font-bold text-white">{disc.name}</span>
                                  <span className="text-[10px] font-mono text-neutral-300">
                                    • {isEn ? 'Team' : 'Sq'} {disc.teamId} ({isLeader ? 'Team Leader' : (isEn ? 'Operator' : 'Operatore')})
                                  </span>
                                  <span className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-orange-400 text-[10px] font-mono font-bold rounded">
                                    {isEn ? 'GROUP' : 'GRUPPO'} {discGrp} ({GROUP_META[discGrp].name})
                                  </span>
                                </div>
                                <div className="text-[11px] text-neutral-400 flex items-center gap-2 flex-wrap pt-0.5">
                                  <span>Tutor: <strong className="text-neutral-200">{facMatch?.badgeCode || `FAC-${disc.teamId}`} ({facMatch?.name || 'Faculty'})</strong></span>
                                  <span>• {isEn ? 'Current Station:' : 'Postazione ora:'} <strong className="text-orange-300">{discAct?.location || (isEn ? 'Station' : 'Stazione')}</strong></span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMobileGroup(discGrp);
                                  setIsFinderOpen(false);
                                }}
                                className="min-h-[34px] px-3 py-1 bg-orange-500 hover:bg-orange-400 text-black font-mono font-black rounded text-xs flex items-center justify-center gap-1 cursor-pointer self-start sm:self-auto flex-shrink-0"
                              >
                                <span>{isEn ? `GO TO GROUP ${discGrp}` : `VAI AL GRUPPO ${discGrp}`}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Single Group Isolation Banner */}
            {selectedMobileGroup !== 'ALL' && (
              <div className="bg-neutral-950/90 border border-neutral-700 px-3 py-2 rounded-lg flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-neutral-300 font-mono">
                    {isEn ? 'Isolated view:' : 'Visualizzazione isolata:'} <strong className="text-white">{isEn ? 'GROUP' : 'GRUPPO'} {selectedMobileGroup} ({GROUP_META[selectedMobileGroup].name})</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMobileGroup('ALL')}
                  className="text-orange-400 hover:text-orange-300 font-mono font-bold uppercase underline text-[11px] cursor-pointer min-h-[32px] flex items-center"
                >
                  {isEn ? 'Show all 4 groups' : 'Mostra tutti e 4 i gruppi'}
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* WRAPPER RELATIVO: 4 GRUPPI CONTEMPORANEI + ALLARME HANDOVER SOVRAPPOSTO   */}
            {/* ========================================================================= */}
            <div className="relative min-h-[520px]">
              {/* ------------------------------------------------------------------------- */}
              {/* TUTTI E QUATTRO I GRUPPI (GRIGLIA 4 COLONNE DESKTOP / 1 COLONNA MOBILE) */}
              {/* ------------------------------------------------------------------------- */}
              <div
                className={`grid gap-2.5 sm:gap-3.5 lg:gap-4 transition-all duration-300 ${
                  selectedMobileGroup === 'ALL'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
                    : 'grid-cols-1 max-w-2xl mx-auto'
                } ${
                  handoverInfo?.isHandover && !isOverlayMinimized
                    ? isGhostMode
                      ? 'opacity-95'
                      : 'opacity-85'
                    : 'opacity-100'
                }`}
              >
                {(selectedMobileGroup === 'ALL' ? ALL_GROUPS : [selectedMobileGroup]).map((g) => {
                  const act = currentSlot?.groupActivities?.[g];
                  if (!act) return null;

                  const slotTitle = (currentSlot?.title || '').toLowerCase();
                  const text = `${act.title} ${act.subtitle} ${act.location}`.toLowerCase();
                  let style = {
                    border: 'border-cyan-500/80',
                    bg: 'bg-cyan-950/15',
                    badge: 'bg-cyan-400 text-black font-black',
                    label: isEn ? 'ACTIVITY' : 'ATTIVITÀ',
                    isBlinking: false,
                  };

                  // Standby SR & Preallerta TCCC
                  if (
                    text.includes('preallerta') ||
                    text.includes('pre-allerta') ||
                    text.includes('pre allerta') ||
                    text.includes('standby') ||
                    text.includes('pre-alert') ||
                    text.includes('t -15') ||
                    text.includes('vestizione')
                  ) {
                    style = {
                      border: 'border-yellow-400 animate-pulse',
                      bg: 'bg-yellow-950/20',
                      badge: 'bg-yellow-400 text-black font-black animate-pulse',
                      label: isEn ? 'STANDBY BAY (T -15)' : 'STANDBY BOX (T -15)',
                      isBlinking: true,
                    };
                  }
                  // Workshops -> Green
                  else if (
                    act.activityType === 'workshop' ||
                    text.includes('workshop') ||
                    text.includes('ws1') ||
                    text.includes('ws2') ||
                    text.includes('ecografia') ||
                    text.includes('vie aeree') ||
                    text.includes('cricotiroidotomia')
                  ) {
                    style = {
                      border: 'border-emerald-500/80',
                      bg: 'bg-emerald-950/15',
                      badge: 'bg-emerald-500 text-black font-black',
                      label: isEn ? 'SKILL WORKSHOP' : 'SKILLS WORKSHOP',
                      isBlinking: false,
                    };
                  }
                  // Scenario TCCC, Handover & Shock Room ABCDE -> Red
                  else if (
                    slotTitle.includes('handover') ||
                    text.includes('handover') ||
                    text.includes('consegna sbar') ||
                    text.includes('ricezione sbar') ||
                    act.activityType === 'scenario_extra' ||
                    text.includes('scenario tccc') ||
                    text.includes('abcde') ||
                    text.includes('shock room') ||
                    text.includes('tccc') ||
                    text.includes('gestione')
                  ) {
                    style = {
                      border: 'border-red-500 animate-pulse',
                      bg: 'bg-red-950/25',
                      badge: 'bg-red-600 text-white font-black animate-pulse',
                      label: isEn ? 'CLINICAL SCENARIO' : 'SCENARIO CLINICO',
                      isBlinking: true,
                    };
                  }
                  // Pauses -> Cyan
                  else if (
                    text.includes('pausa') ||
                    text.includes('ristoro') ||
                    text.includes('pranzo') ||
                    text.includes('riposo')
                  ) {
                    style = {
                      border: 'border-cyan-400 animate-pulse',
                      bg: 'bg-cyan-950/20',
                      badge: 'bg-cyan-400 text-black font-black animate-pulse',
                      label: isEn ? 'BREAK & REFRESHMENT' : 'PAUSA & RISTORO',
                      isBlinking: true,
                    };
                  }
                  // Debriefing -> Purple
                  else if (
                    text.includes('debriefing') ||
                    text.includes('handover') ||
                    text.includes('revisione')
                  ) {
                    style = {
                      border: 'border-purple-500/80',
                      bg: 'bg-purple-950/20',
                      badge: 'bg-purple-600 text-white font-black',
                      label: isEn ? 'DEBRIEFING' : 'DEBRIEFING',
                      isBlinking: false,
                    };
                  }

                  const squadNumbers =
                    g === 'A' ? [1, 2, 3] : g === 'B' ? [4, 5, 6] : g === 'C' ? [7, 8, 9] : [10, 11, 12];

                  const phaseDetails = getGroupPhaseDetails(
                    g,
                    act,
                    currentSlot,
                    activeDay,
                    simulatorPatients,
                    technicians,
                    language
                  );

                  const isActivelyDelivering = handoverInfo?.isHandover && handoverInfo.deliveringGroup === g;
                  const isActivelyReceiving = handoverInfo?.isHandover && handoverInfo.receivingGroup === g;

                  return (
                    <div
                      key={g}
                      className={`bg-neutral-950 border-2 p-3 sm:p-3.5 lg:p-4 flex flex-col justify-between space-y-3 sm:space-y-3.5 rounded-lg shadow-xl transition-all duration-200 ${style.border} ${style.bg}`}
                    >
                      {/* Top Header Group Identifier */}
                      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2 flex-wrap gap-1.5">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span
                            className={`px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded ${groupBadgeColors[g].bg} ${groupBadgeColors[g].text}`}
                          >
                            {isEn ? 'GROUP' : 'GRUPPO'} {g}
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-neutral-300">
                            {GROUP_META[g].name}
                          </span>
                        </div>

                        <span
                          className={`px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-wider rounded border border-neutral-700 ${
                            style.isBlinking ? 'text-white bg-red-950/80' : 'text-neutral-300 bg-neutral-900'
                          }`}
                        >
                          {style.label}
                        </span>
                      </div>

                      {/* Matricole range and Squads */}
                      <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-neutral-400 bg-neutral-900/60 px-2 py-1 rounded border border-neutral-850">
                        <span className="text-orange-400 font-bold">{GROUP_META[g].range}</span>
                        <span>{isEn ? 'Teams' : 'Squadre'} {squadNumbers[0]}-{squadNumbers[2]}</span>
                      </div>

                      {/* Core Activity Title & Subtitle */}
                      <div className="space-y-1 sm:space-y-1.5">
                        <h3 className="text-white font-black text-sm sm:text-base md:text-lg tracking-tight leading-snug line-clamp-2">
                          {act.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-neutral-300 font-medium leading-relaxed line-clamp-2">
                          {act.subtitle}
                        </p>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[10px] sm:text-[11px] text-orange-400 font-bold max-w-full">
                          <MapPin className="w-3 h-3 text-orange-500 flex-shrink-0" />
                          <span className="truncate">{act.location}</span>
                        </div>
                      </div>

                      {/* Squadre & Faculty 1:1 Compact Rows */}
                      <div className="space-y-1 bg-neutral-900/80 p-2 rounded border border-neutral-850 text-[9px] sm:text-[10px] font-mono">
                        <span className="text-[8px] sm:text-[9px] text-neutral-400 uppercase tracking-widest block font-bold mb-0.5">
                          {isEn ? 'Teams & Faculty (1:1):' : 'Squadre & Faculty (1:1):'}
                        </span>
                        <div className="space-y-1">
                          {squadNumbers.map((sqNum) => {
                            const facMatch =
                              faculty.find((f) => f.assignedTeamId === sqNum) || faculty[sqNum - 1];
                            const facName = facMatch ? facMatch.name : `Faculty Sq ${sqNum}`;
                            const facCode = facMatch?.badgeCode || `FAC-${sqNum < 10 ? '0' + sqNum : sqNum}`;
                            return (
                              <div
                                key={sqNum}
                                className="flex items-center justify-between gap-1 text-[9px] sm:text-[10px] border-b border-neutral-850/60 last:border-b-0 pb-0.5"
                              >
                                <span className="text-orange-400 font-black flex-shrink-0">{isEn ? 'Team' : 'Sq'} {sqNum}</span>
                                <span className="text-white truncate font-medium max-w-[100px] sm:max-w-[130px] md:max-w-[150px]" title={facName}>
                                  {facName}
                                </span>
                                <span className="text-neutral-400 text-[8px] sm:text-[9px] font-bold flex-shrink-0">{facCode}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* BANNER SCORREVOLE ALL'INTERNO DI OGNI GRUPPO (TUTTI I DETTAGLI CONDENSATI) */}
                      <GroupScrollingTicker
                        group={g}
                        phaseDetails={phaseDetails}
                        onOpenDetails={() => setDetailedGroupModal(g)}
                        isEn={isEn}
                      />

                      {/* Pulsante rapido dedicato per aprire la scheda dettagli operativi completa */}
                      <button
                        type="button"
                        onClick={() => setDetailedGroupModal(g)}
                        className="w-full min-h-[38px] py-1.5 px-2.5 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 border border-neutral-700 hover:border-orange-500/70 text-neutral-200 hover:text-white rounded text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title={isEn ? 'View full didactic and logistical sheet' : 'Visualizza scheda didattica e logistica completa'}
                      >
                        <FileText className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                        <span className="truncate">{isEn ? `OPERATIONAL SHEET ${g}` : `SCHEDA OPERATIVA ${g}`}</span>
                        <Info className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* ------------------------------------------------------------------------- */}
              {/* ALLARME DI HANDOVER SOVRAPPOSTO VISIVAMENTE AI 4 GRUPPI                    */}
              {/* ------------------------------------------------------------------------- */}
              {handoverInfo && handoverInfo.isHandover && (
                <div
                  className={`transition-all duration-300 ${
                    isOverlayMinimized
                      ? 'sticky top-14 sm:top-16 z-30 mb-3'
                      : `fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 ${
                          isGhostMode ? 'bg-black/15 backdrop-blur-none' : 'bg-black/30 backdrop-blur-[1px]'
                        } overflow-y-auto`
                  }`}
                  onClick={(e) => {
                    // Clicking on the translucent backdrop outside the card minimizes the overlay
                    if (e.target === e.currentTarget && !isOverlayMinimized) {
                      setIsOverlayMinimized(true);
                    }
                  }}
                >
                  <div
                    className={`w-full max-w-5xl transition-all duration-300 ${
                      isGhostMode
                        ? 'bg-neutral-950/50 border-2 border-red-500/80 shadow-xl shadow-red-950/40 backdrop-blur-[2px]'
                        : 'bg-neutral-950/80 border-2 border-red-500/90 shadow-2xl shadow-red-950/60 backdrop-blur-md'
                    } rounded-xl relative overflow-hidden ${
                      isOverlayMinimized
                        ? 'p-2.5 sm:p-3 bg-neutral-950/95'
                        : 'p-3.5 sm:p-5 md:p-6 space-y-3 sm:space-y-4 max-h-[92vh] overflow-y-auto'
                    }`}
                  >
                    {/* Background tactical red glow */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Bar: Alert Title, Countdown Timer & Minimize/Expand toggle */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 sm:gap-3 border-b border-red-900/80 pb-2.5 sm:pb-3 relative z-10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="px-2.5 sm:px-3 py-1 bg-red-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded flex items-center gap-1.5 shadow animate-pulse">
                            <AlertTriangle className="w-4 h-4 text-white animate-bounce flex-shrink-0" />
                            {isEn ? 'TACTICAL CLINICAL ALERT • SBAR HANDOVER PHASE IN PROGRESS' : 'ALLARME TATTICO CLINICO • FASE DI HANDOVER SBAR IN CORSO'}
                          </span>
                          <span className="px-2 py-0.5 bg-neutral-950 text-red-300 border border-red-800 text-[10px] sm:text-[11px] font-mono font-black rounded">
                            {isEn ? 'MANDATORY AT :30 • DURATION 5 MINUTES (:30 - :35)' : 'TASSATIVO ORE :30 • DURATA 5 MINUTI (:30 - :35)'}
                          </span>
                        </div>
                        {!isOverlayMinimized && (
                          <p className="text-xs text-red-200 font-medium pt-0.5">
                            {isEn ? '1:1 litter patient transfer between TCCC Team Leader and Shock Room Team. Operational silence and SBAR report.' : 'Passaggio del ferito barellato 1:1 tra Team Leader TCCC ed Équipe Shock Room. Silenzio operativo e report SBAR.'}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
                        {/* CRONOMETRO ASSOCIATO ALL'HANDOVER */}
                        <div className="bg-neutral-950/80 border-2 border-red-500 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 shadow-lg">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-spin flex-shrink-0" />
                          <div className="text-left">
                            <span className="text-[8px] sm:text-[9px] font-mono uppercase text-red-300 font-bold block leading-none">
                              {isEn ? 'HANDOVER TIME REMAINING' : 'TEMPO RESIDUO HANDOVER'}
                            </span>
                            <span className="text-lg sm:text-2xl font-mono font-black text-yellow-400 tracking-wider">
                              {formatTimer(timerSeconds)}
                            </span>
                          </div>
                          <div className="pl-2 border-l border-neutral-800 text-right hidden sm:block">
                            <span className="text-[9px] font-mono uppercase text-neutral-400 block font-bold">{isEn ? '5m Slot' : 'Slot 5m'}</span>
                            {timerSeconds <= 60 && timerSeconds > 0 ? (
                              <span className="text-[10px] font-mono font-black text-red-400 uppercase animate-ping block">
                                {isEn ? 'LAST MINUTE' : 'ULTIMO MINUTO'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">
                                {isEn ? 'IN PROGRESS' : 'IN CORSO'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ghost Mode (Transparency HUD toggle) */}
                        {!isOverlayMinimized && (
                          <button
                            type="button"
                            onClick={() => setIsGhostMode(!isGhostMode)}
                            className={`p-2 border rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isGhostMode
                                ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                                : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                            }`}
                            title={
                              isGhostMode
                                ? isEn
                                  ? 'Standard translucent mode'
                                  : 'Modalità semi-trasparente standard'
                                : isEn
                                  ? 'Ultra-transparent ghost HUD (reveals underlying public view)'
                                  : 'Modalità Ghost trasparente (massima trasparenza per visuale pubblica sottostante)'
                            }
                          >
                            {isGhostMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
                            <span className="text-[10px] font-mono font-bold uppercase hidden sm:inline">
                              {isGhostMode ? (isEn ? 'Ghost HUD' : 'Trasparente') : (isEn ? 'Ghost HUD' : 'Trasparenza')}
                            </span>
                          </button>
                        )}

                        {/* Toggle to minimize / expand overlay */}
                        <button
                          type="button"
                          onClick={() => setIsOverlayMinimized(!isOverlayMinimized)}
                          className="p-2 bg-neutral-900/80 hover:bg-neutral-800 border border-red-700 text-neutral-300 hover:text-white rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title={isOverlayMinimized ? (isEn ? 'Expand overlay across 4 groups' : 'Espandi sovrapposizione sui 4 gruppi') : (isEn ? 'Minimize overlay to bar' : 'Riduci sovrapposizione a barra')}
                        >
                          {isOverlayMinimized ? (
                            <>
                              <Maximize2 className="w-4 h-4 text-red-400" />
                              <span className="text-[10px] font-mono font-bold uppercase hidden sm:inline">{isEn ? 'Expand' : 'Espandi'}</span>
                            </>
                          ) : (
                            <>
                              <Minimize2 className="w-4 h-4 text-neutral-400" />
                              <span className="text-[10px] font-mono font-bold uppercase hidden sm:inline">{isEn ? 'Minimize' : 'Riduci'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Detailed Flow Graphic: Group Delivering ➔ Report SBAR ➔ Group Receiving */}
                    {!isOverlayMinimized && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-center relative z-10 pt-1">
                        {/* 1. GRUPPO CHE CONSEGNA (TCCC) */}
                        <div
                          className={`md:col-span-5 ${
                            isGhostMode ? 'bg-neutral-950/50 border-orange-500/70' : 'bg-neutral-950/75 border-orange-500/90'
                          } border-2 rounded-lg p-3 sm:p-3.5 space-y-1.5 sm:space-y-2 shadow-lg backdrop-blur-sm`}
                        >
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                            <span className="px-2 py-0.5 bg-orange-600 text-black font-black text-[9px] sm:text-[10px] uppercase tracking-wider rounded">
                              {isEn ? 'DELIVERING GROUP (TCCC)' : 'GRUPPO CHE CONSEGNA (TCCC)'}
                            </span>
                            <span className="text-orange-400 font-mono text-xs font-bold">
                              {handoverInfo.deliveringRange}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <h4 className="text-white font-black text-base sm:text-xl uppercase tracking-tight">
                                {isEn ? `GROUP ${handoverInfo.deliveringName}` : `GRUPPO ${handoverInfo.deliveringName}`}
                              </h4>
                              <span className="text-xs text-neutral-400 font-mono">
                                ({isEn ? 'Teams' : 'Squadre'} {handoverInfo.deliveringSquads.join(', ')})
                              </span>
                            </div>
                            <p className="text-xs text-orange-200/90 font-medium leading-snug mt-0.5">
                              {handoverInfo.deliveringSubtitle}
                            </p>
                          </div>

                          <div className="pt-1.5 border-t border-neutral-850 space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-neutral-300">
                              <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                              <span className="text-neutral-400 text-[10px] uppercase font-mono">{isEn ? 'Origin:' : 'Origine:'}</span>
                              <span className="font-bold text-white truncate">{handoverInfo.deliveringLocation}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-neutral-300">
                              <Users className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                              <span className="text-neutral-400 text-[10px] uppercase font-mono">{isEn ? 'Patients:' : 'Pazienti:'}</span>
                              <span className="font-bold text-orange-300">
                                {isEn ? `Patients #${handoverInfo.patientIds.join(', #')} (1:1 Stretcher)` : `Pazienti #${handoverInfo.patientIds.join(', #')} (Barellati 1:1)`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 2. FRECCIA DI TRASFERIMENTO SBAR INTERMEDIA */}
                        <div className="md:col-span-2 flex flex-col items-center justify-center p-1 sm:p-2 text-center space-y-1 sm:space-y-1.5">
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center text-red-400 shadow-lg animate-pulse">
                            <ArrowDown className="w-5 h-5 md:hidden" />
                            <ArrowRight className="w-6 h-6 hidden md:block" />
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase text-yellow-300 tracking-wider block">
                            {isEn ? '1:1 SBAR REPORT' : 'REPORT SBAR 1:1'}
                          </span>
                          <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400 block">
                            Max 5 min (:30–:35)
                          </span>
                        </div>

                        {/* 3. GRUPPO CHE RICEVE (SHOCK ROOM) */}
                        <div
                          className={`md:col-span-5 ${
                            isGhostMode ? 'bg-neutral-950/50 border-cyan-500/70' : 'bg-neutral-950/75 border-cyan-500/90'
                          } border-2 rounded-lg p-3 sm:p-3.5 space-y-1.5 sm:space-y-2 shadow-lg backdrop-blur-sm`}
                        >
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                            <span className="px-2 py-0.5 bg-cyan-600 text-black font-black text-[9px] sm:text-[10px] uppercase tracking-wider rounded">
                              {isEn ? 'RECEIVING GROUP (SHOCK ROOM)' : 'GRUPPO CHE RICEVE (SHOCK ROOM)'}
                            </span>
                            <span className="text-cyan-400 font-mono text-xs font-bold">
                              {handoverInfo.receivingRange}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <h4 className="text-white font-black text-base sm:text-xl uppercase tracking-tight">
                                {isEn ? `GROUP ${handoverInfo.receivingName}` : `GRUPPO ${handoverInfo.receivingName}`}
                              </h4>
                              <span className="text-xs text-neutral-400 font-mono">
                                ({isEn ? 'Teams' : 'Squadre'} {handoverInfo.receivingSquads.join(', ')})
                              </span>
                            </div>
                            <p className="text-xs text-cyan-200/90 font-medium leading-snug mt-0.5">
                              {handoverInfo.receivingSubtitle}
                            </p>
                          </div>

                          <div className="pt-1.5 border-t border-neutral-850 space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-neutral-300">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                              <span className="text-neutral-400 text-[10px] uppercase font-mono">{isEn ? 'Destination:' : 'Destinazione:'}</span>
                              <span className="font-bold text-white truncate">{handoverInfo.receivingLocation}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-neutral-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                              <span className="text-neutral-400 text-[10px] uppercase font-mono">{isEn ? 'Takeover:' : 'Presa in Carico:'}</span>
                              <span className="font-bold text-cyan-300 truncate">
                                {isEn ? 'Shock Room Box • ABCDE & FAST' : 'Box Shock Room • ABCDE & FAST'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODALE SCHEDA OPERATIVA DETTAGLIATA (OTTIMIZZATA PER SMARTPHONE & DESKTOP) */}
      {/* ========================================================================= */}
      {detailedGroupModal && (() => {
        const g = detailedGroupModal;
        const meta = GROUP_META[g];
        const act = currentSlot?.groupActivities?.[g];
        const phaseDetails = getGroupPhaseDetails(
          g,
          act,
          currentSlot,
          activeDay,
          simulatorPatients,
          technicians,
          language
        );
        const groupDiscenti = (discenti || []).filter((d) => getDiscenteGroup(d.teamId) === g);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-3xl bg-neutral-950 border-2 border-orange-500 rounded-xl shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto relative text-white">
              {/* Top Header */}
              <div className="flex items-start justify-between border-b border-neutral-800 pb-3 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 font-mono text-xs font-black rounded ${groupBadgeColors[g].bg} ${groupBadgeColors[g].text}`}>
                      {isEn ? 'GROUP' : 'GRUPPO'} {g}
                    </span>
                    <span className="text-white font-black text-base sm:text-lg uppercase tracking-wide">
                      {meta.name} ({meta.range})
                    </span>
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono text-[11px] rounded">
                      Day 0{activeDay} • {currentSlot?.timeRange || 'Slot'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-orange-400 uppercase tracking-tight">
                    {act?.title || (isEn ? 'Operational Phase' : 'Fase Operativa')}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                    {act?.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailedGroupModal(null)}
                  className="min-w-[44px] min-h-[44px] p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
                  aria-label={isEn ? 'Close details sheet' : 'Chiudi scheda dettagli'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Location & Logistical Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-neutral-900/90 p-2.5 rounded border border-neutral-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block">{isEn ? 'Assigned Station' : 'Postazione Assegnata'}</span>
                    <strong className="text-white">{act?.location || (isEn ? 'Operational Station' : 'Stazione Operativa')}</strong>
                  </div>
                </div>

                <div className="bg-neutral-900/90 p-2.5 rounded border border-neutral-800 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block">{isEn ? 'Technical & Control Supervision' : 'Presidio Tecnico & Regia'}</span>
                    <strong className="text-white">{phaseDetails.technicianData.techName || (isEn ? 'Central Control' : 'Presidio Centrale')}</strong>
                    <span className="text-neutral-400 text-[10px] block">Tel: {phaseDetails.technicianData.techPhone || (isEn ? 'Radio Channel 1' : 'Canale Radio 1')}</span>
                  </div>
                </div>
              </div>

              {/* Inquadramento Operativo */}
              <div className="bg-neutral-900/70 p-3 rounded-lg border border-neutral-800 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-orange-400 font-mono font-bold uppercase text-[11px]">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Clinical-Operational Framework' : 'Inquadramento Clinico-Operativo'}</span>
                </div>
                <p className="text-neutral-200 leading-relaxed">
                  {phaseDetails.operationalDescription}
                </p>
                {phaseDetails.protocolTimingNote && (
                  <p className="text-amber-300/90 font-mono text-[11px] pt-1">
                    ⏱ {phaseDetails.protocolTimingNote}
                  </p>
                )}
              </div>

              {/* Obiettivi Didattici */}
              <div className="bg-neutral-900/70 p-3 rounded-lg border border-neutral-800 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold uppercase text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Key Training Objectives' : 'Obiettivi Addestrativi Chiave'}</span>
                </div>
                <ul className="space-y-1 text-neutral-300 list-disc list-inside">
                  {phaseDetails.didacticObjectives.map((obj, idx) => (
                    <li key={idx} className="leading-snug">{obj}</li>
                  ))}
                </ul>
              </div>

              {/* Articolazione Squadre & Faculty 1:1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                  <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-orange-400" />
                    {isEn ? `Teams (${meta.squads.join(', ')}) • 1:1 Tutor Ratio` : `Squadre (${meta.squads.join(', ')}) • Rapporto Tutor 1:1`}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">{isEn ? '15 Learners (5 per team)' : '15 Discenti (5 per squadra)'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {meta.squads.map((sqNum) => {
                    const facMatch = faculty.find((f) => f.assignedTeamId === sqNum) || faculty[sqNum - 1];
                    const squadMembers = groupDiscenti.filter((d) => d.teamId === sqNum);
                    const teamLeader = squadMembers.find(
                      (d) => d.role?.toLowerCase().includes('leader') || d.id.endsWith('01') || d.id.endsWith('06') || d.id.endsWith('11')
                    ) || squadMembers[0];
                    const operators = squadMembers.filter((d) => d.id !== teamLeader?.id);

                    return (
                      <div
                        key={sqNum}
                        className="bg-neutral-900/90 border border-neutral-800 p-2.5 rounded-lg space-y-1.5 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                          <span className="font-black text-orange-400">{isEn ? `TEAM ${sqNum}` : `SQUADRA ${sqNum}`}</span>
                          <span className="text-[10px] text-neutral-400">{isEn ? `Patient #${sqNum % 3 === 0 ? 3 : sqNum % 3}` : `Paziente #${sqNum % 3 === 0 ? 3 : sqNum % 3}`}</span>
                        </div>

                        <div>
                          <span className="text-[9px] text-neutral-400 uppercase block">{isEn ? 'Assigned Faculty:' : 'Faculty Assegnato:'}</span>
                          <span className="font-bold text-white text-[11px] block truncate">
                            {facMatch?.badgeCode || `FAC-${sqNum < 10 ? '0' + sqNum : sqNum}`} • {facMatch?.name || 'Faculty Tutor'}
                          </span>
                        </div>

                        <div className="pt-1 border-t border-neutral-850 space-y-0.5 text-[10px]">
                          <div>
                            <span className="text-amber-400 font-bold">TL: </span>
                            <span className="text-white">{teamLeader ? `${teamLeader.id} (${teamLeader.name})` : (isEn ? 'Assigning...' : 'In assegnazione')}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 font-bold">Op: </span>
                            <span className="text-neutral-300">
                              {operators.length > 0 ? operators.map((o) => o.id).join(', ') : (isEn ? 'Operators' : 'Operatori')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cronoprogramma 90 Minuti */}
              <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-[11px] font-mono space-y-1">
                <span className="text-[10px] text-orange-400 uppercase font-bold block">
                  {isEn ? 'Training Block Time Rule (90 Minutes)' : 'Regola Temporale Blocco Formativo (90 Minuti)'}
                </span>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-1.5 text-neutral-400 text-[10px] pt-1">
                  <div className="bg-neutral-900/80 p-1.5 rounded">
                    <strong className="text-neutral-200 block">:00 - :15</strong> {isEn ? 'Engagement / Standby' : 'Ingaggio / Standby'}
                  </div>
                  <div className="bg-neutral-900/80 p-1.5 rounded">
                    <strong className="text-neutral-200 block">:15 - :30</strong> {isEn ? 'Stabilization / Practice' : 'Stabilizzazione / Pratica'}
                  </div>
                  <div className="bg-neutral-900/80 p-1.5 rounded border border-red-800/60">
                    <strong className="text-red-400 block">:30 - :35</strong> {isEn ? '1:1 SBAR Handover' : 'Handover SBAR 1:1'}
                  </div>
                  <div className="bg-neutral-900/80 p-1.5 rounded">
                    <strong className="text-neutral-200 block">:35 - :60</strong> {isEn ? 'ABCDE Approach / Workshop' : 'Approccio ABCDE / Workshop'}
                  </div>
                  <div className="bg-neutral-900/80 p-1.5 rounded">
                    <strong className="text-neutral-200 block">:60 - :75</strong> {isEn ? 'Debriefing Part 1' : 'Debriefing Parte 1'}
                  </div>
                  <div className="bg-neutral-900/80 p-1.5 rounded border border-neutral-700">
                    <strong className="text-neutral-200 block">:75 - :90</strong> {isEn ? 'Debriefing & Tech Reset' : 'Debriefing & Reset Tech'}
                  </div>
                </div>
              </div>

              {/* Close Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setDetailedGroupModal(null)}
                  className="w-full min-h-[44px] py-2 px-4 bg-orange-500 hover:bg-orange-400 text-black font-mono font-black rounded-lg uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                  <span>{isEn ? 'CLOSE OPERATIONAL SHEET' : 'CHIUDI SCHEDA OPERATIVA'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
