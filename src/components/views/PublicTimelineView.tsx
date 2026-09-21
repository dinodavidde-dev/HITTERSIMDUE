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
  Info,
  ShieldAlert,
} from 'lucide-react';
import { GroupType } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { DaySelectorToggle } from '../DaySelectorToggle';
import { getGroupPhaseDetails, GroupPhaseEnrichedDetails } from '../../utils/groupPhaseDetails';

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
const extractHandoverInfo = (slot: any, day: number): HandoverInfo | null => {
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
    deliveringLocation: delAct?.location || delMeta.defaultTcccLoc,
    receivingLocation: recAct?.location || recMeta.defaultSrLoc,
    patientIds,
    deliveringSubtitle: delAct?.subtitle || `Consegna barellata feriti a Gruppo ${recMeta.name}`,
    receivingSubtitle: recAct?.subtitle || `Ricezione barellata da Gruppo ${delMeta.name} e avvio Shock Room`,
  };
};

// Component for the animated horizontal scrolling ticker banner inside each group
const GroupScrollingTicker: React.FC<{
  group: GroupType;
  phaseDetails: GroupPhaseEnrichedDetails;
}> = ({ group, phaseDetails }) => {
  const tickerItems: { icon: string; label: string; text: string; highlight?: boolean }[] = [];

  if (phaseDetails.protocolTimingNote) {
    tickerItems.push({
      icon: '⏱️',
      label: 'TIMING CRITICO',
      text: phaseDetails.protocolTimingNote,
      highlight: true,
    });
  }

  if (phaseDetails.phaseTypeLabel) {
    tickerItems.push({
      icon: '⚡',
      label: 'FASE',
      text: phaseDetails.phaseTypeLabel,
    });
  }

  if (phaseDetails.operationalDescription) {
    tickerItems.push({
      icon: '📋',
      label: 'INQUADRAMENTO',
      text: phaseDetails.operationalDescription,
    });
  }

  if (phaseDetails.didacticObjectives && phaseDetails.didacticObjectives.length > 0) {
    tickerItems.push({
      icon: '🎯',
      label: 'OBIETTIVI',
      text: phaseDetails.didacticObjectives.join(' • '),
    });
  }

  if (phaseDetails.simulatorData.scenarioCode) {
    tickerItems.push({
      icon: '🫀',
      label: 'SIMULATORE',
      text: `${phaseDetails.simulatorData.scenarioCode}${
        phaseDetails.simulatorData.simulatorHardware ? ` (${phaseDetails.simulatorData.simulatorHardware})` : ''
      }`,
    });
  }

  if (phaseDetails.technicianData.hasTech) {
    tickerItems.push({
      icon: '🔧',
      label: 'PRESIDIO TECH',
      text: `${phaseDetails.technicianData.techName} [${phaseDetails.technicianData.techBadge}]${
        phaseDetails.technicianData.techPhone ? ` • Tel: ${phaseDetails.technicianData.techPhone}` : ''
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
      title="Banner scorrevole dettagli fase (passa il mouse o tocca per mettere in pausa)"
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-orange-950 text-orange-400 border border-orange-800/80 rounded text-[8px] sm:text-[9px] font-mono font-black uppercase">
          <Radio className="w-2.5 h-2.5 text-orange-500 animate-pulse" />
          <span>INFO FASE</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap flex-1 relative w-full">
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
    setCurrentTab,
    setUserRole,
    courseStartSchedule,
    timeRemainingMs,
    isCourseStarted,
  } = useCourse();

  // Overlay state for Handover alert: by default it is open/expanded overlaying the 4 groups
  const [isOverlayMinimized, setIsOverlayMinimized] = useState<boolean>(false);

  const isCurrentUnlocked = true;

  const dayMasterSlots = INITIAL_TIMELINE_SLOTS.filter((s) => s.day === activeDay);
  const publicSlots = dayMasterSlots.filter((s) => !s.id.includes('setup'));

  const masterCurrentSlot = INITIAL_TIMELINE_SLOTS[activeSlotIndex] || dayMasterSlots[0] || INITIAL_TIMELINE_SLOTS[0];
  const slotIdxInDay = dayMasterSlots.findIndex((s) => s.id === masterCurrentSlot?.id);
  let currentSlot = publicSlots.find((s) => s.id === masterCurrentSlot?.id);
  if (!currentSlot && publicSlots.length > 0) {
    currentSlot = publicSlots[0];
  }
  if (!currentSlot) currentSlot = dayMasterSlots[0] || INITIAL_TIMELINE_SLOTS[0];

  // Handover Info Extraction
  const handoverInfo = useMemo(() => {
    return extractHandoverInfo(currentSlot, activeDay);
  }, [currentSlot, activeDay]);

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
      return `${days}g ${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
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

  return (
    <div className="space-y-3 sm:space-y-4 pb-12 w-full max-w-full 2xl:max-w-[1850px] mx-auto px-1.5 sm:px-3 md:px-4">
      {/* COUNTDOWN / WAITING SCREENS OR ACTIVE ACTIVITIES */}
      {(() => {
        // Se il Gate è abilitato e il corso non è ancora iniziato (countdown attivo)
        const isScheduledGateWaiting = courseStartSchedule?.isGateEnabled && !isCourseStarted && timeRemainingMs > 0;

        if (isScheduledGateWaiting) {
          return (
            <div className="bg-neutral-950 border-3 border-amber-500 p-8 sm:p-14 shadow-2xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-red-500/10 pointer-events-none" />
              <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
                {/* Course Name in First Plane / Primo Piano */}
                <div className="space-y-3 pb-2 border-b border-neutral-800">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-600/70 text-red-400 rounded-full font-mono text-[11px] font-black uppercase tracking-widest shadow-sm">
                    <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span>CORSO UFFICIALE • INTUBATI EM</span>
                  </div>
                  
                  <div className="space-y-1">
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 tracking-tight leading-none uppercase filter drop-shadow">
                      H.I.T.T.E.R.
                    </h1>
                    <p className="text-sm sm:text-lg md:text-xl font-mono font-bold text-amber-300 tracking-wider uppercase">
                      High Intensive Training Trauma Emergency Response
                    </p>
                  </div>
                </div>

                {/* Event Phase: Countdown Apertura Gate */}
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded shadow-sm">
                    STATO ACCESSO: PRE-CORSO
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight pt-1">
                    COUNTDOWN APERTURA GATE
                  </h2>
                </div>

                <div className="bg-amber-950/80 border-2 border-amber-500 p-6 rounded shadow-lg max-w-xl mx-auto animate-pulse">
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest block mb-2 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>AVVISO UFFICIALE REGIA • APERTURA PROGRAMMATA</span>
                  </span>
                  <p className="text-lg sm:text-2xl font-black text-white uppercase tracking-wide">
                    IL GATE DISCENTI APRE ALLE ORE {courseStartSchedule.scheduledTime}
                  </p>
                  <p className="text-xs font-mono text-amber-200 mt-2">
                    Data prevista: {courseStartSchedule.scheduledDate} • Accesso riservato ai team assegnati
                  </p>
                </div>

                <div className="py-6 px-8 bg-neutral-900/95 border-2 border-amber-500/80 rounded shadow-inner inline-block my-2">
                  <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                    TEMPO RIMANENTE ALL'APERTURA DEL GATE
                  </span>
                  <div className="text-4xl sm:text-7xl font-mono font-black text-amber-400 animate-pulse tracking-wider">
                    {formatGateCountdown(timeRemainingMs)}
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <p className="text-xl sm:text-2xl font-black text-amber-300 uppercase tracking-wider italic">
                    "Verifica dotazioni individuali, contatto con Faculty e allineamento Squadre."
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-400 font-mono">
                    Sincronizzazione oraria centralizzata dalla Regia Operativa
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
            <div className="bg-neutral-950 border-3 border-orange-500 p-8 sm:p-14 shadow-2xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-red-500/10 pointer-events-none" />
              <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
                {/* Course Name in First Plane */}
                <div className="space-y-3 pb-2 border-b border-neutral-800">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-600/70 text-red-400 rounded-full font-mono text-[11px] font-black uppercase tracking-widest shadow-sm">
                    <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span>CORSO UFFICIALE • INTUBATI EM</span>
                  </div>
                  
                  <div className="space-y-1">
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 tracking-tight leading-none uppercase filter drop-shadow">
                      H.I.T.T.E.R.
                    </h1>
                    <p className="text-sm sm:text-lg md:text-xl font-mono font-bold text-amber-300 tracking-wider uppercase">
                      High Intensive Training Trauma Emergency Response
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 bg-orange-600 text-black font-black text-xs uppercase tracking-widest rounded shadow-sm">
                    STATO OPERATIVO: PRE-APERTURA
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight pt-1">
                    ATTESA APERTURA CORSO
                  </h2>
                </div>

                <div className="bg-red-950/80 border-2 border-red-600 p-6 rounded shadow-lg max-w-xl mx-auto animate-pulse">
                  <span className="text-xs font-mono font-bold text-red-300 uppercase tracking-widest block mb-2">
                    AVVISO UFFICIALE REGIA • DAY 0{activeDay}
                  </span>
                  <p className="text-lg sm:text-2xl font-black text-white uppercase tracking-wide">
                    IL GATE DISCENTI APRE ALLE {courseStartSchedule?.scheduledTime || '08:30'}
                  </p>
                </div>

                <div className="pt-2 space-y-3">
                  <p className="text-xl sm:text-2xl font-black text-orange-300 uppercase tracking-wider italic">
                    "Preparazione postazioni e briefing faculty in corso. Tenetevi pronti."
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-400 font-mono">
                    Day {activeDay} • Attesa apertura ufficiale ore {courseStartSchedule?.scheduledTime || '08:30'}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        if (isMorningCountdown || isNightToMorningCountdown) {
          return (
            <div className="bg-neutral-950 border-3 border-orange-500 p-8 sm:p-14 shadow-2xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-red-500/10 pointer-events-none" />
              <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
                {/* Course Name in First Plane */}
                <div className="space-y-3 pb-2 border-b border-neutral-800">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-600/70 text-red-400 rounded-full font-mono text-[11px] font-black uppercase tracking-widest shadow-sm">
                    <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span>CORSO UFFICIALE • INTUBATI EM</span>
                  </div>
                  
                  <div className="space-y-1">
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 tracking-tight leading-none uppercase filter drop-shadow">
                      H.I.T.T.E.R.
                    </h1>
                    <p className="text-sm sm:text-lg md:text-xl font-mono font-bold text-amber-300 tracking-wider uppercase">
                      High Intensive Training Trauma Emergency Response
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 bg-orange-600 text-black font-black text-xs uppercase tracking-widest rounded shadow-sm">
                    STATO OPERATIVO: DEPLOYMENT SQUADRE
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight pt-1">
                    {isMorningCountdown ? `COUNTDOWN VERSO APERTURA (${courseStartSchedule?.scheduledTime || '08:30'})` : 'ATTIVITÀ IN ARRIVO'}
                  </h2>
                </div>

                {isMorningCountdown && (
                  <div className="bg-orange-950/80 border-2 border-orange-500 p-5 rounded shadow-lg max-w-xl mx-auto animate-pulse">
                    <span className="text-xs font-mono font-bold text-orange-300 uppercase tracking-widest block mb-1">
                      DISPOSIZIONE UFFICIALE REGIA
                    </span>
                    <p className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                      Ogni squadra è invitata a raggrupparsi ed a raggiungere il proprio Faculty assegnato.
                    </p>
                  </div>
                )}

                <div className="py-6 px-8 bg-neutral-900/95 border-2 border-orange-500/80 rounded shadow-inner inline-block my-2">
                  <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                    {isMorningCountdown ? 'TEMPO RIMANENTE ALL\'AVVIO' : 'COUNTDOWN BLOCCO'}
                  </span>
                  <div className="text-5xl sm:text-7xl font-mono font-black text-orange-400 animate-pulse tracking-wider">
                    {courseStartSchedule?.isGateEnabled && !isCourseStarted && timeRemainingMs > 0
                      ? formatGateCountdown(timeRemainingMs)
                      : formatCumulativeTimer(getCumulativeSeconds(isMorningCountdown, isNightToMorningCountdown))}
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <p className="text-xl sm:text-3xl font-black text-orange-300 uppercase tracking-wider italic">
                    "{isMorningCountdown ? 'Raggruppamento squadre e contatto Faculty in corso' : 'Avvio Blocco'}"
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-400 font-mono">
                    {isMorningCountdown && `Day ${activeDay} • Countdown verso l'apertura delle ore ${courseStartSchedule?.scheduledTime || '08:30'}`}
                    {isNightToMorningCountdown && `Transizione Day 2 ➔ Day 3 (Scadenza ore ${courseStartSchedule?.scheduledTime || '08:30'})`}
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
                    H.I.T.T.E.R. • INTUBATI EM
                  </span>
                  <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">
                    ORARIO FASE: {currentSlot?.timeRange || '08:30 - 08:45'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500 animate-pulse" />
                  {currentSlot?.title || 'ATTIVITÀ IN CORSO DELLE SQUADRE'}
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
                  <span>Fase Master:</span>
                  <span className="font-black text-orange-400 uppercase">DAY 0{activeDay}</span>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* WRAPPER RELATIVO: 4 GRUPPI CONTEMPORANEI + ALLARME HANDOVER SOVRAPPOSTO   */}
            {/* ========================================================================= */}
            <div className="relative min-h-[520px]">
              {/* ------------------------------------------------------------------------- */}
              {/* TUTTI E QUATTRO I GRUPPI CONTEMPORANEAMENTE (GRIGLIA 4 COLONNE ADATTIVA) */}
              {/* ------------------------------------------------------------------------- */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4 transition-all duration-300 ${
                  handoverInfo?.isHandover && !isOverlayMinimized
                    ? 'opacity-35 filter blur-[0.6px] select-none pointer-events-none'
                    : 'opacity-100'
                }`}
              >
                {ALL_GROUPS.map((g) => {
                  const act = currentSlot?.groupActivities?.[g];
                  if (!act) return null;

                  const slotTitle = (currentSlot?.title || '').toLowerCase();
                  const text = `${act.title} ${act.subtitle} ${act.location}`.toLowerCase();
                  let style = {
                    border: 'border-cyan-500/80',
                    bg: 'bg-cyan-950/15',
                    badge: 'bg-cyan-400 text-black font-black',
                    label: 'ATTIVITÀ',
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
                      label: 'STANDBY BOX (T -15)',
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
                      label: 'SKILLS WORKSHOP',
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
                      label: 'SCENARIO CLINICO',
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
                      label: 'PAUSA & RISTORO',
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
                      label: 'DEBRIEFING',
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
                    technicians
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
                            GRUPPO {g}
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
                        <span>Squadre {squadNumbers[0]}-{squadNumbers[2]}</span>
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
                          Squadre & Faculty (1:1):
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
                                <span className="text-orange-400 font-black flex-shrink-0">Sq {sqNum}</span>
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
                      <GroupScrollingTicker group={g} phaseDetails={phaseDetails} />
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
                      : 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto'
                  }`}
                >
                  <div
                    className={`w-full max-w-5xl bg-neutral-950/95 border-2 border-red-500 rounded-xl shadow-2xl shadow-red-950/90 relative overflow-hidden backdrop-blur-md ${
                      isOverlayMinimized ? 'p-2.5 sm:p-3' : 'p-3.5 sm:p-5 md:p-6 space-y-3 sm:space-y-4 max-h-[92vh] overflow-y-auto'
                    }`}
                  >
                    {/* Background tactical red glow */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Bar: Alert Title, Countdown Timer & Minimize/Expand toggle */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 sm:gap-3 border-b border-red-900/80 pb-2.5 sm:pb-3 relative z-10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="px-2.5 sm:px-3 py-1 bg-red-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded flex items-center gap-1.5 shadow animate-pulse">
                            <AlertTriangle className="w-4 h-4 text-white animate-bounce flex-shrink-0" />
                            ALLARME TATTICO CLINICO • FASE DI HANDOVER SBAR IN CORSO
                          </span>
                          <span className="px-2 py-0.5 bg-neutral-950 text-red-300 border border-red-800 text-[10px] sm:text-[11px] font-mono font-black rounded">
                            TASSATIVO ORE :30 • DURATA 5 MINUTI (:30 - :35)
                          </span>
                        </div>
                        {!isOverlayMinimized && (
                          <p className="text-xs text-red-200 font-medium pt-0.5">
                            Passaggio del ferito barellato 1:1 tra Team Leader TCCC ed Équipe Shock Room. Silenzio operativo e report SBAR.
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
                        {/* CRONOMETRO ASSOCIATO ALL'HANDOVER */}
                        <div className="bg-neutral-950 border-2 border-red-500 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 shadow-lg">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-spin flex-shrink-0" />
                          <div className="text-left">
                            <span className="text-[8px] sm:text-[9px] font-mono uppercase text-red-300 font-bold block leading-none">
                              TEMPO RESIDUO HANDOVER
                            </span>
                            <span className="text-lg sm:text-2xl font-mono font-black text-yellow-400 tracking-wider">
                              {formatTimer(timerSeconds)}
                            </span>
                          </div>
                          <div className="pl-2 border-l border-neutral-800 text-right hidden sm:block">
                            <span className="text-[9px] font-mono uppercase text-neutral-400 block font-bold">Slot 5m</span>
                            {timerSeconds <= 60 && timerSeconds > 0 ? (
                              <span className="text-[10px] font-mono font-black text-red-400 uppercase animate-ping block">
                                ULTIMO MINUTO
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">
                                IN CORSO
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Toggle to minimize / expand overlay */}
                        <button
                          type="button"
                          onClick={() => setIsOverlayMinimized(!isOverlayMinimized)}
                          className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-red-700 text-neutral-300 hover:text-white rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title={isOverlayMinimized ? 'Espandi sovrapposizione sui 4 gruppi' : 'Riduci sovrapposizione a barra'}
                        >
                          {isOverlayMinimized ? (
                            <>
                              <Maximize2 className="w-4 h-4 text-red-400" />
                              <span className="text-[10px] font-mono font-bold uppercase hidden sm:inline">Espandi</span>
                            </>
                          ) : (
                            <>
                              <Minimize2 className="w-4 h-4 text-neutral-400" />
                              <span className="text-[10px] font-mono font-bold uppercase hidden sm:inline">Riduci</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Detailed Flow Graphic: Group Delivering ➔ Report SBAR ➔ Group Receiving */}
                    {!isOverlayMinimized && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-center relative z-10 pt-1">
                        {/* 1. GRUPPO CHE CONSEGNA (TCCC) */}
                        <div className="md:col-span-5 bg-neutral-950/95 border-2 border-orange-500 rounded-lg p-3 sm:p-3.5 space-y-1.5 sm:space-y-2 shadow-inner">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                            <span className="px-2 py-0.5 bg-orange-600 text-black font-black text-[9px] sm:text-[10px] uppercase tracking-wider rounded">
                              GRUPPO CHE CONSEGNA (TCCC)
                            </span>
                            <span className="text-orange-400 font-mono text-xs font-bold">
                              {handoverInfo.deliveringRange}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <h4 className="text-white font-black text-base sm:text-xl uppercase tracking-tight">
                                GRUPPO {handoverInfo.deliveringName}
                              </h4>
                              <span className="text-xs text-neutral-400 font-mono">
                                (Squadre {handoverInfo.deliveringSquads.join(', ')})
                              </span>
                            </div>
                            <p className="text-xs text-orange-200/90 font-medium leading-snug mt-0.5">
                              {handoverInfo.deliveringSubtitle}
                            </p>
                          </div>

                          <div className="pt-1.5 border-t border-neutral-850 space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-neutral-300">
                              <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                              <span className="text-neutral-400 text-[10px] uppercase font-mono">Origine:</span>
                              <span className="font-bold text-white truncate">{handoverInfo.deliveringLocation}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-neutral-300">
                              <Users className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                              <span className="text-neutral-400 text-[10px] uppercase font-mono">Pazienti:</span>
                              <span className="font-bold text-orange-300">
                                Pazienti #{handoverInfo.patientIds.join(', #')} (Barellati 1:1)
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
                            REPORT SBAR 1:1
                          </span>
                          <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400 block">
                            Max 5 min (:30–:35)
                          </span>
                        </div>

                        {/* 3. GRUPPO CHE RICEVE (SHOCK ROOM) */}
                        <div className="md:col-span-5 bg-neutral-950/95 border-2 border-cyan-500 rounded-lg p-3 sm:p-3.5 space-y-1.5 sm:space-y-2 shadow-inner">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                            <span className="px-2 py-0.5 bg-cyan-600 text-black font-black text-[9px] sm:text-[10px] uppercase tracking-wider rounded">
                              GRUPPO CHE RICEVE (SHOCK ROOM)
                            </span>
                            <span className="text-cyan-400 font-mono text-xs font-bold">
                              {handoverInfo.receivingRange}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <h4 className="text-white font-black text-base sm:text-xl uppercase tracking-tight">
                                GRUPPO {handoverInfo.receivingName}
                              </h4>
                              <span className="text-xs text-neutral-400 font-mono">
                                (Squadre {handoverInfo.receivingSquads.join(', ')})
                              </span>
                            </div>
                            <p className="text-xs text-cyan-200/90 font-medium leading-snug mt-0.5">
                              {handoverInfo.receivingSubtitle}
                            </p>
                          </div>

                          <div className="pt-1.5 border-t border-neutral-850 space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-neutral-300">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                              <span className="text-neutral-400 text-[10px] uppercase font-mono">Destinazione:</span>
                              <span className="font-bold text-white truncate">{handoverInfo.receivingLocation}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-neutral-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                              <span className="text-neutral-400 text-[10px] uppercase font-mono">Presa in Carico:</span>
                              <span className="font-bold text-cyan-300 truncate">
                                Box Shock Room • ABCDE & FAST
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
    </div>
  );
};
