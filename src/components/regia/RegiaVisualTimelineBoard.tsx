import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useCourse } from '../../context/CourseContext';
import { StationPreSessionChecklist } from '../../types';
import { INITIAL_STATION_CHECKLISTS } from '../../data/initialChecklists';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Award,
  BarChart3,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Timer,
  ExternalLink,
  Eye,
  FastForward,
  Filter,
  Flame,
  Globe,
  GraduationCap,
  HardHat,
  HeartPulse,
  Info,
  Layers,
  LayoutGrid,
  List,
  MapPin,
  Maximize2,
  MessageSquare,
  Minus,
  Package,
  Pause,
  Phone,
  Play,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
  User,
  Users,
  Wrench,
  Zap,
  Sliders,
  Flag,
  Moon,
} from 'lucide-react';
import {
  ActivityType,
  CourseDay,
  GroupActivitySlot,
  GroupType,
  SimulatorPatient,
  Team,
  Faculty,
  Technician,
  TeamEvaluation,
  TimelineSlot,
} from '../../types';
import { getTeamCodeName } from '../../utils/teamUtils';
import { ProtesiAttoriTecniciModal } from './ProtesiAttoriTecniciModal';
import { ScenarioCriticalityModal } from './ScenarioCriticalityModal';
import { EvaluationSummaryModal } from './EvaluationSummaryModal';
import { RegiaRadioCoordinationPanel } from './RegiaRadioCoordinationPanel';
import { INITIAL_TIMELINE_SLOTS, INITIAL_TEAMS, INITIAL_FACULTY } from '../../data/initialData';
import { DaySelectorToggle } from '../DaySelectorToggle';

const GROUP_THEMES: Record<GroupType, { label: string; name: string; border: string; bg: string; text: string; badgeBg: string }> = {
  A: { label: 'ROSSO', name: 'Triage & TCCC', border: '#ef4444', bg: 'bg-red-950/30', text: 'text-red-400', badgeBg: 'bg-red-600' },
  B: { label: 'BLU', name: 'Airway & Shock', border: '#3b82f6', bg: 'bg-blue-950/30', text: 'text-blue-400', badgeBg: 'bg-blue-600' },
  C: { label: 'VERDE', name: 'Torace & Drenaggi', border: '#22c55e', bg: 'bg-green-950/30', text: 'text-green-400', badgeBg: 'bg-green-600' },
  D: { label: 'GIALLO', name: 'Shock Room & REBOA', border: '#eab308', bg: 'bg-yellow-950/30', text: 'text-yellow-400', badgeBg: 'bg-yellow-600' },
};

interface RegiaVisualTimelineBoardProps {
  isMaster?: boolean;
}

export const RegiaVisualTimelineBoard: React.FC<RegiaVisualTimelineBoardProps> = ({
  isMaster = true,
}) => {
  const {
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
    faculty,
    technicians,
    simulatorPatients,
    updateSimulatorPatient,
    evaluations,
    saveEvaluation,
    timeMultiplier,
    setTimeMultiplier,
    jumpToTimelinePoint,
    sendCourseMessage,
    autoAdvancePhases,
    setAutoAdvancePhases,
    setCourseGateEnabled,
    isCourseStarted,
    timeRemainingMs,
    courseStartSchedule,
    updateCourseStartSchedule,
    startCourseImmediately,
    resetCourseScheduleToFuture,
    language,
  } = useCourse();

  const isEn = language === 'en';

  const currentFilteredIndex = useMemo(() => {
    const idx = filteredSlots.findIndex((s) => s.id === currentSlot.id);
    return idx !== -1 ? idx : 0;
  }, [filteredSlots, currentSlot]);

  // Real-time station checklists sync for green light monitoring
  const [stationChecklists, setStationChecklists] = useState<StationPreSessionChecklist[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('trauma_sim_station_checklists');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return INITIAL_STATION_CHECKLISTS;
  });

  useEffect(() => {
    const syncStations = () => {
      try {
        const stored = localStorage.getItem('trauma_sim_station_checklists');
        if (stored) {
          setStationChecklists(JSON.parse(stored));
        }
      } catch (e) {}
    };
    window.addEventListener('storage', syncStations);
    const interval = setInterval(syncStations, 1500);
    return () => {
      window.removeEventListener('storage', syncStations);
      clearInterval(interval);
    };
  }, []);

  // Scroll ref for horizontal timeline strip
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll timeline strip to keep active milestone/slot centered in viewport
  useEffect(() => {
    if (timelineScrollRef.current) {
      const activeElement = timelineScrollRef.current.children[currentFilteredIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentFilteredIndex]);

  // Active Modals State
  const [selectedProtesiModal, setSelectedProtesiModal] = useState<{
    groupId: GroupType;
    groupActivity: GroupActivitySlot;
    timeRange: string;
  } | null>(null);

  const [selectedCriticalityPatientId, setSelectedCriticalityPatientId] = useState<number | null>(
    null
  );

  const [selectedEvalModal, setSelectedEvalModal] = useState<{
    team: Team;
    faculty: Faculty | undefined;
    evaluation: TeamEvaluation | undefined;
    scenarioCode?: string;
  } | null>(null);

  const [filterGroup, setFilterGroup] = useState<GroupType | 'ALL'>('ALL');
  // State for expanded accordions (menu a tendina) per group
  const [expandedGroups, setExpandedGroups] = useState<Record<GroupType, boolean>>({
    A: false,
    B: false,
    C: false,
    D: false,
  });

  // Toggle single group dropdown
  const toggleGroupDropdown = (grp: GroupType) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [grp]: !prev[grp],
    }));
  };

  // Expand / collapse all groups
  const toggleAllGroups = (expand: boolean) => {
    setExpandedGroups({
      A: expand,
      B: expand,
      C: expand,
      D: expand,
    });
  };

  const areAllExpanded = Object.values(expandedGroups).every(Boolean);

  // Helper to scroll timeline
  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      timelineScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Check if an activity qualifies for Protesi & Valutazione inside the active box
  const isEligibleForProtesiAndEval = (activity: GroupActivitySlot | null | undefined): boolean => {
    if (!activity) return false;
    const type = activity.activityType;
    const titleLower = (activity.title || '').toLowerCase();
    const subtitleLower = (activity.subtitle || '').toLowerCase();

    const isPracticalScenario =
      type === 'scenario_extra' ||
      type === 'scenario_intra';

    const isPreparationTeamED =
      titleLower.includes('preparazione team') ||
      titleLower.includes('dipartimento di emergenza') ||
      titleLower.includes('shock room') ||
      titleLower.includes('preparazione ed') ||
      subtitleLower.includes('preparazione');

    return isPracticalScenario || isPreparationTeamED;
  };

  // Format timer MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Find next slot in day schedule (T+1)
  const currentSlotIdxInFiltered = filteredSlots.findIndex((s) => s.id === currentSlot.id);
  const nextSlotObj =
    currentSlotIdxInFiltered !== -1 && currentSlotIdxInFiltered < filteredSlots.length - 1
      ? filteredSlots[currentSlotIdxInFiltered + 1]
      : null;

  // Selected Patient for Criticality Modal
  const currentCriticalityPatient = useMemo(() => {
    if (!selectedCriticalityPatientId) return null;
    return simulatorPatients.find((p) => p.id === selectedCriticalityPatientId) || null;
  }, [selectedCriticalityPatientId, simulatorPatients]);

  // Extract expected procedures for an activity
  const getExpectedProcedures = (
    activity: GroupActivitySlot,
    groupId: GroupType,
    patientsList: SimulatorPatient[]
  ): string[] => {
    if (activity.activityType === 'scenario_extra') {
      const patientIds = activity.patientIds || [];
      const procs = patientIds.flatMap((pId) => {
        const p = patientsList.find((pt) => pt.id === pId);
        return p?.procedureExtra || [];
      });
      return procs.length > 0
        ? Array.from(new Set(procs))
        : ['Cricotirotomia CRIC', 'Tourniquet TQ', 'Needle Decompression ND'];
    }

    if (activity.activityType === 'scenario_intra') {
      const patientIds = activity.patientIds || [];
      const procs = patientIds.flatMap((pId) => {
        const p = patientsList.find((pt) => pt.id === pId);
        return p?.procedureIntra || [];
      });
      return procs.length > 0
        ? Array.from(new Set(procs))
        : ['Toracotomia di Resuscitazione', 'REBOA Zone 1/3', 'Drenaggio Bulau', 'Packing PPP'];
    }

    if (activity.activityType === 'workshop') {
      return [
        'Trascinamento Ferito',
        'Estrazione Sked',
        'Cura sotto fuoco (CUF)',
      ];
    }

    if (activity.activityType === 'skills') {
      return [
        'Vie Aeree & Cricotirotomia',
        'Accessi IO FAST1/EZ-IO',
      ];
    }

    if (activity.activityType === 'debriefing') {
      return ['Handover SBAR', 'Analisi ABCDE', 'Gestione Errori'];
    }



    return ['Briefing Tecnico', 'Coordinamento Squadra'];
  };

  // Helper: Activity Badge styling & label
  const getActivityBadge = (type: ActivityType) => {
    switch (type) {
      case 'scenario_extra':
        return {
          label: 'SCENARIO EXTRA (TCCC)',
          shortLabel: 'EXTRA TCCC',
          bg: 'bg-blue-950/90 text-blue-300 border-blue-500/60',
          chip: 'bg-cyan-500 text-black',
          icon: <Flame className="w-3 h-3 text-cyan-400" />,
        };
      case 'scenario_intra':
        return {
          label: 'SCENARIO INTRA (SHOCK ROOM)',
          shortLabel: 'INTRA ED',
          bg: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60',
          chip: 'bg-emerald-500 text-black',
          icon: <Building className="w-3 h-3 text-emerald-400" />,
        };
      case 'workshop':
        return {
          label: 'SESSIONE PRATICA',
          shortLabel: 'PRATICA',
          bg: 'bg-neutral-800 text-neutral-300 border-neutral-700',
          chip: 'bg-neutral-600 text-white',
          icon: <Wrench className="w-3 h-3 text-neutral-400" />,
        };
      case 'skills':
        return {
          label: 'SKILLS LAB',
          shortLabel: 'SKILLS LAB',
          bg: 'bg-neutral-800 text-neutral-300 border-neutral-700',
          chip: 'bg-neutral-600 text-white',
          icon: <Layers className="w-3 h-3 text-neutral-400" />,
        };
      case 'debriefing':
        return {
          label: 'DEBRIEFING',
          shortLabel: 'DEBRIEFING',
          bg: 'bg-amber-950/90 text-amber-300 border-amber-500/60',
          chip: 'bg-amber-500 text-black',
          icon: <GraduationCap className="w-3 h-3 text-amber-400" />,
        };

      case 'pause':
      default:
        return {
          label: 'PAUSA / RESET',
          shortLabel: 'PAUSA',
          bg: 'bg-neutral-900 text-neutral-400 border-neutral-700',
          chip: 'bg-neutral-700 text-white',
          icon: <Clock className="w-3 h-3 text-neutral-400" />,
        };
    }
  };

  // Check group readiness (criticalities) for a given slot activity
  const getGroupReadinessStatus = (activity: GroupActivitySlot) => {
    const pIds = activity.patientIds || [];
    if (pIds.length === 0) return { hasScenario: false, status: 'none', criticalCount: 0, readyCount: 0 };

    const matchedPatients = pIds
      .map((id) => simulatorPatients.find((p) => p.id === id))
      .filter(Boolean) as SimulatorPatient[];

    const criticalPatients = matchedPatients.filter((p) => p.readinessStatus === 'critical');
    const readyPatients = matchedPatients.filter((p) => p.readinessStatus === 'ready');

    if (criticalPatients.length > 0) {
      return {
        hasScenario: true,
        status: 'critical' as const,
        criticalCount: criticalPatients.length,
        readyCount: readyPatients.length,
        firstCriticalPatientId: criticalPatients[0].id,
      };
    }

    if (readyPatients.length === matchedPatients.length) {
      return {
        hasScenario: true,
        status: 'ready' as const,
        criticalCount: 0,
        readyCount: readyPatients.length,
      };
    }

    return {
      hasScenario: true,
      status: 'preparing' as const,
      criticalCount: 0,
      readyCount: readyPatients.length,
    };
  };

  const getGroupTeams = (grp: GroupType) => {
    const list = teams.filter((t) => {
      if (t.groupId) return t.groupId === grp;
      if (grp === 'A') return t.id >= 1 && t.id <= 3;
      if (grp === 'B') return t.id >= 4 && t.id <= 6;
      if (grp === 'C') return t.id >= 7 && t.id <= 9;
      if (grp === 'D') return t.id >= 10 && t.id <= 12;
      return false;
    });
    if (list.length > 0) return list;
    return INITIAL_TEAMS.filter((t) => t.groupId === grp);
  };

  // Group evaluation status for a specific group
  const getGroupEvaluationSummary = (grp: GroupType) => {
    const grpTeams = getGroupTeams(grp);
    const evals = grpTeams.map((tm) => {
      const evaluation = evaluations.find(
        (e) => e.teamId === tm.id && e.day === activeDay
      );
      const assignedFaculty = faculty.find((f) => f.assignedTeamId === tm.id) || faculty.find((f) => f.id === tm.facultyId) || INITIAL_FACULTY.find((f) => f.assignedTeamId === tm.id);
      return {
        team: tm,
        faculty: assignedFaculty,
        evaluation,
        isEvaluated: Boolean(evaluation),
      };
    });

    const evaluatedCount = evals.filter((e) => e.isEvaluated).length;
    const pendingCount = evals.length - evaluatedCount;

    return {
      evals,
      evaluatedCount,
      pendingCount,
      allEvaluated: evaluatedCount === grpTeams.length,
      hasPending: pendingCount > 0,
    };
  };

  // Global counts for badges
  const totalCriticalities = simulatorPatients.filter(
    (p) => p.day === activeDay && p.readinessStatus === 'critical'
  ).length;

  const totalPendingEvals = teams.filter((tm) => {
    const hasEval = evaluations.some((e) => e.teamId === tm.id && e.day === activeDay);
    return !hasEval;
  }).length;

  const groupsToDisplay: GroupType[] =
    filterGroup === 'ALL' ? ['A', 'B', 'C', 'D'] : [filterGroup];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. MASTER REGIA TOP CONTROLS & COMPACT STATUS BAR */}
      <div className="bg-neutral-900 border-2 border-yellow-500/80 p-3 sm:p-4 shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-neutral-800 pb-2.5">
          {/* Title & Slot Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-yellow-500 text-black font-black font-mono text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                REGIA MASTER • TIMELINE COMPATTA 4 GRUPPI
              </span>

              {/* Day Switcher Component */}
              <DaySelectorToggle variant="regia" />

              {/* Auto Advance toggle */}
              <button
                type="button"
                onClick={() => setAutoAdvancePhases(!autoAdvancePhases)}
                className={`px-2 py-0.5 font-mono text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                  autoAdvancePhases
                    ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                    : 'bg-neutral-950 border-neutral-700 text-neutral-400'
                }`}
                title="Avanzamento automatico delle fasi del corso al termine del timer"
              >
                <Zap className={`w-3 h-3 ${autoAdvancePhases ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
                <span>{autoAdvancePhases ? 'AUTO-AVANZAMENTO ON' : 'AVANZAMENTO MANUALE'}</span>
              </button>

              {timeMultiplier && timeMultiplier > 1 && (
                <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500 text-amber-300 font-mono text-[10px] font-black animate-pulse">
                  ⚡ {timeMultiplier}x
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-0.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                {currentSlot.title}
              </h2>
              <span className="text-xs font-mono text-yellow-400 font-bold bg-neutral-950 px-2 py-0.5 border border-yellow-500/40">
                {currentSlot.timeRange}
              </span>
            </div>
          </div>

          {/* Master Countdown Timer & Controls */}
          <div className={`flex items-center gap-2 self-stretch sm:self-auto ${isMaster ? 'justify-between sm:justify-end' : 'justify-end lg:ml-auto w-full lg:w-auto'}`}>
            <div className="bg-neutral-950 border border-yellow-500/80 px-4 py-1.5 text-center min-w-[130px] shadow-md">
              <span className="text-[10px] font-mono text-yellow-400 font-black uppercase block tracking-wider">
                {isTimerRunning ? 'TIMER FASE (ATTIVO)' : 'TIMER FASE (PAUSA)'}
              </span>
              <span className="text-2xl font-black font-mono text-yellow-300 leading-none">
                {formatTimer(timerSeconds)}
              </span>
            </div>

            {isMaster && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="p-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase cursor-pointer transition-colors shadow"
                  title={isTimerRunning ? 'Pausa Timer' : 'Avvia Timer'}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={() => resetTimer()}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase cursor-pointer border border-neutral-700"
                  title="Reset Timer Slot"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="flex flex-col gap-0.5 text-[9px] font-mono">
                  <button
                    type="button"
                    onClick={() => adjustTimer(-60)}
                    className="px-1 py-0.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 border border-neutral-800 font-bold cursor-pointer"
                    title="-1 minuto"
                  >
                    -1m
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustTimer(60)}
                    className="px-1 py-0.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 border border-neutral-800 font-bold cursor-pointer"
                    title="+1 minuto"
                  >
                    +1m
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DIRECTOR COURSE AUTOMATION & TIMELINE CONTROL PANEL */}
        {isMaster && (
          <div className="bg-neutral-950 border-2 border-yellow-500/60 p-3.5 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-yellow-500 text-black font-black text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 shadow">
                  <Sliders className="w-3 h-3" />
                  {isEn ? 'DIRECTOR COURSE AUTOMATION & TIMELINE CONTROL' : 'AUTOMAZIONE CORSO & CONTROLLO TIMELINE DIREZIONE'}
                </span>
                <span className="text-[10px] font-mono text-neutral-300">
                  {isEn ? 'Master Phase Management' : 'Gestione Avanzata Fasi'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-neutral-400 font-bold">{isEn ? 'Speed:' : 'Velocità:'}</span>
                {[1, 2, 5, 10, 30].map((multiplier) => (
                  <button
                    key={multiplier}
                    type="button"
                    onClick={() => setTimeMultiplier(multiplier)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold border cursor-pointer transition-all ${
                      timeMultiplier === multiplier
                        ? 'bg-yellow-500 text-black border-yellow-300 shadow'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                    }`}
                  >
                    {multiplier}x
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-center">
              {/* 1. Step Backward / Revert / Play-Pause / Step Forward */}
              {isMaster && (
                <div className="flex items-center gap-1.5 justify-center sm:justify-start flex-wrap">
                  <button
                    type="button"
                    onClick={prevSlot}
                    disabled={activeSlotIndex <= 0}
                    className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 disabled:opacity-40 font-bold text-xs uppercase border border-neutral-700 flex items-center gap-1 cursor-pointer"
                    title={isEn ? 'Previous Phase / Slot' : 'Fase Precedente'}
                  >
                    <ChevronLeft className="w-4 h-4 text-yellow-400" />
                    <span>{isEn ? 'Prev' : 'Indietro'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={prevSlot}
                    disabled={activeSlotIndex <= 0}
                    className="px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 disabled:opacity-40 font-bold text-xs uppercase border border-amber-700/60 flex items-center gap-1 cursor-pointer"
                    title={isEn ? 'Revert last course phase / milestone' : 'Annulla ultima fase e torna indietro'}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isEn ? 'Revert Phase' : 'Revert Fasi'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleTimer}
                    className={`px-3 py-1.5 font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer transition-all shadow ${
                      isTimerRunning
                        ? 'bg-amber-500 hover:bg-amber-400 text-black'
                        : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    }`}
                    title={isTimerRunning ? 'Pausa Timer Corso' : 'Avvia Timer Corso'}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>{isEn ? 'Pause' : 'Pausa'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>{isEn ? 'Play' : 'Avvia'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={nextSlot}
                    disabled={activeSlotIndex >= INITIAL_TIMELINE_SLOTS.length - 1}
                    className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 disabled:opacity-40 font-bold text-xs uppercase border border-neutral-700 flex items-center gap-1 cursor-pointer"
                    title={isEn ? 'Next Phase / Slot' : 'Fase Successiva'}
                  >
                    <span>{isEn ? 'Next' : 'Avanti'}</span>
                    <ChevronRight className="w-4 h-4 text-yellow-400" />
                  </button>
                </div>
              )}

              {/* 2. Direct Phase Jump Dropdown */}
              {isMaster ? (
                <div className="flex items-center gap-1.5">
                  <label htmlFor="jump-to-phase-select" className="text-[10px] font-mono text-neutral-400 whitespace-nowrap font-bold">
                    {isEn ? 'Jump Phase:' : 'Vai a Fase:'}
                  </label>
                  <select
                    id="jump-to-phase-select"
                    aria-label={isEn ? 'Jump to phase' : 'Vai a fase'}
                    value={currentFilteredIndex}
                    onChange={(e) => {
                      const localIdx = Number(e.target.value);
                      const targetSlot = filteredSlots[localIdx];
                      if (targetSlot) {
                        const globalIdx = INITIAL_TIMELINE_SLOTS.findIndex(s => s.id === targetSlot.id);
                        if (globalIdx !== -1) setActiveSlotIndex(globalIdx);
                      }
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 font-mono text-xs px-2 py-1.5 focus:outline-none focus:border-yellow-500 truncate"
                  >
                    {filteredSlots.map((s, idx) => (
                      <option key={s.id} value={idx}>
                        Fase {idx + 1} ({s.timeRange}): {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 border border-yellow-500/40 font-mono text-xs">
                  <span className="text-yellow-400 font-bold uppercase">SYNC REGIA ATTIVO:</span>
                  <span className="text-white font-black truncate">{currentSlot.title} ({currentSlot.timeRange})</span>
                </div>
              )}

              {/* 3. Quick Status info */}
              <div className="flex items-center justify-end gap-2 text-xs font-mono text-neutral-300">
                <span className="inline-flex items-center gap-1 text-[11px] text-yellow-400 font-bold">
                  <span className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {isTimerRunning ? (isEn ? 'AUTOMATION ACTIVE' : 'AUTOMAZIONE ATTIVA') : (isEn ? 'PAUSED' : 'IN PAUSA')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* REGIA RADIO COORDINATION PANEL (TIMELINE_REGIA_COORDINAMENTO) */}
        <RegiaRadioCoordinationPanel
          currentSlot={currentSlot}
          activeDay={activeDay}
          onJumpToSlot={(targetSlotId) => {
            const globalIdx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.id === targetSlotId);
            if (globalIdx !== -1) {
              setActiveSlotIndex(globalIdx);
            }
          }}
          isMaster={isMaster}
        />

        {/* HORIZONTAL COURSE TIMELINE SCROLLER (INTERACTIVE SCHEDULE STRIP) */}
        <div className="bg-neutral-950 border border-neutral-800 p-2 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <div className="flex items-center gap-1.5 font-black uppercase text-neutral-300">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              <span>TIMELINE SCROLLER GIORNO {activeDay} ({filteredSlots.length} FASI TOTALI)</span>
            </div>
            {isMaster && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-neutral-500 hidden sm:inline">Scorri per navigare tra gli slot:</span>
                <button
                  type="button"
                  onClick={() => scrollTimeline('left')}
                  className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 cursor-pointer"
                  title="Scorri indietro nella timeline"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTimeline('right')}
                  className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 cursor-pointer"
                  title="Scorri avanti nella timeline"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div
            ref={timelineScrollRef}
            className="flex items-stretch gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900 scroll-smooth"
          >
            {filteredSlots.map((slot, sIdx) => {
              const isCurrent = slot.id === currentSlot.id;
              const isNext = sIdx === currentFilteredIndex + 1;
              const isPast = sIdx < currentFilteredIndex;

              return (
                <div
                  key={slot.id}
                  onClick={isMaster ? () => {
                    const globalIdx = INITIAL_TIMELINE_SLOTS.findIndex(s => s.id === slot.id);
                    if (globalIdx !== -1) setActiveSlotIndex(globalIdx);
                  } : undefined}
                  className={`min-w-[190px] max-w-[220px] p-2 border flex flex-col justify-between ${isMaster ? 'cursor-pointer transition-all' : 'cursor-default'} flex-shrink-0 text-left relative ${
                    isCurrent
                      ? 'bg-neutral-900 border-yellow-400 ring-2 ring-yellow-400/40 shadow-lg'
                      : isNext
                      ? 'bg-neutral-900/90 border-cyan-500/70 ' + (isMaster ? 'hover:border-cyan-400' : '')
                      : isPast
                      ? 'bg-neutral-950/60 border-neutral-800 opacity-70 ' + (isMaster ? 'hover:opacity-100 hover:border-neutral-700' : '')
                      : 'bg-neutral-950 border-neutral-800 ' + (isMaster ? 'hover:border-neutral-600' : '')
                  }`}
                  title={isMaster ? `Clicca per passare a ${slot.title} (${slot.timeRange})` : `${slot.title} (${slot.timeRange})`}
                >
                  {/* Status Banner */}
                  <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                    <span className="px-1 py-0.2 bg-neutral-800 text-neutral-300 font-bold">
                      Fase {sIdx + 1}/{filteredSlots.length}
                    </span>
                    {isCurrent ? (
                      <span className="px-1 py-0.2 bg-yellow-500 text-black font-black font-mono animate-pulse">
                        ★ LIVE T0
                      </span>
                    ) : isNext ? (
                      <span className="px-1 py-0.2 bg-cyan-950 text-cyan-300 font-bold border border-cyan-700 font-mono">
                        T+1 PROSSIMO
                      </span>
                    ) : (
                      <span className="text-neutral-500 font-mono">{slot.durationMinutes}m</span>
                    )}
                  </div>

                  {/* Time Range & Title */}
                  <div className="space-y-0.5 my-1">
                    <span className={`text-[11px] font-mono font-black block ${isCurrent ? 'text-yellow-400' : 'text-neutral-300'}`}>
                      {slot.timeRange}
                    </span>
                    <p className="text-[10px] font-bold text-neutral-200 line-clamp-1">
                      {slot.title}
                    </p>
                  </div>

                  {/* 4 Groups Mini Activity Indicator */}
                  <div className="grid grid-cols-4 gap-0.5 pt-1 border-t border-neutral-800 text-[8px] font-mono text-center">
                    {(['A', 'B', 'C', 'D'] as const).map((grp) => {
                      const act = slot.groupActivities[grp];
                      const badge = getActivityBadge(act.activityType);
                      return (
                        <div
                          key={grp}
                          className={`p-0.5 border truncate ${
                            act.activityType === 'scenario_extra'
                              ? 'bg-blue-950 text-blue-300 border-blue-700'
                              : act.activityType === 'scenario_intra'
                              ? 'bg-red-950 text-red-300 border-red-700'
                              : act.activityType === 'workshop'
                              ? 'bg-amber-950 text-amber-300 border-amber-700'
                              : act.activityType === 'skills'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                          }`}
                          title={`Gruppo ${grp}: ${act.title}`}
                        >
                          <strong>{grp}</strong>:{' '}
                          {act.activityType === 'scenario_extra'
                            ? 'EXT'
                            : act.activityType === 'scenario_intra'
                            ? 'INT'
                            : act.activityType === 'workshop'
                            ? 'WKP'
                            : act.activityType === 'skills'
                            ? 'SKL'
                            : 'PAU'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Toolbar: Prev/Next, Quick Indicators, Accordion Expand/Collapse All & Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Stepper Slot */}
          <div className="flex items-center gap-1.5">
            {isMaster && (
              <button
                type="button"
                onClick={prevSlot}
                disabled={activeSlotIndex <= 0}
                className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 font-bold text-[11px] uppercase border border-neutral-800 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>PREC</span>
              </button>
            )}

            <span className="text-[11px] font-mono text-yellow-400 font-bold px-2.5 py-1 bg-neutral-950 border border-yellow-500/40 flex items-center gap-1.5">
              <span>FASE {currentFilteredIndex + 1} / {filteredSlots.length}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
            </span>

            {isMaster && (
              <button
                type="button"
                onClick={nextSlot}
                disabled={activeSlotIndex >= INITIAL_TIMELINE_SLOTS.length - 1}
                className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-[11px] uppercase flex items-center gap-1 cursor-pointer"
              >
                <span>SUCC</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Global Indicators */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {totalCriticalities > 0 ? (
              <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-mono font-black animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{totalCriticalities} CRITICITÀ POSTAZIONI</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>POSTAZIONI 100% OK</span>
              </span>
            )}

            {totalPendingEvals > 0 ? (
              <span className="px-2 py-0.5 bg-amber-950 border border-amber-600/70 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                <AlertOctagon className="w-3 h-3 text-amber-400" />
                <span>{totalPendingEvals} EVAL PENDING</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>VALUTAZIONI OK</span>
              </span>
            )}
          </div>

          {/* Controls: Expand/Collapse All Dropdowns & Filter Group */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => toggleAllGroups(!areAllExpanded)}
              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-[11px] uppercase flex items-center gap-1 cursor-pointer transition-colors"
              title="Apri o chiudi tutti i menu a tendina con i dettagli delle timeline"
            >
              {areAllExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-yellow-400" />
                  <span>COMPRIMI TUTTI</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-yellow-400" />
                  <span>ESPANDI TUTTI I DETTAGLI</span>
                </>
              )}
            </button>

            {/* Filter buttons */}
            <div className="flex items-center gap-0.5 bg-neutral-950 p-0.5 border border-neutral-800">
              {(['ALL', 'A', 'B', 'C', 'D'] as const).map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setFilterGroup(grp)}
                  className={`px-2 py-0.5 text-[10px] font-mono font-black cursor-pointer transition-colors ${
                    filterGroup === grp
                      ? 'bg-white text-black font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {grp === 'ALL' ? 'TUTTI' : grp}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMPACT 4-GROUPS TIMELINE BOARD (ALL 4 GROUPS SIMULTANEOUSLY VISIBLE ON SCREEN) */}
      <div className="space-y-2">
        {groupsToDisplay.map((grpId) => {
          const groupTheme = GROUP_THEMES[grpId as GroupType] || GROUP_THEMES.A;
          const assignedTeams = getGroupTeams(grpId as GroupType);
          const activeActivity = currentSlot.groupActivities[grpId];
          const nextActivity = nextSlotObj ? nextSlotObj.groupActivities[grpId] : null;

          const activeBadge = getActivityBadge(activeActivity.activityType);
          const nextBadge = nextActivity ? getActivityBadge(nextActivity.activityType) : null;

          const activeReadiness = getGroupReadinessStatus(activeActivity);
          const nextReadiness = nextActivity ? getGroupReadinessStatus(nextActivity) : null;

          const activeExpectedProcs = getExpectedProcedures(
            activeActivity,
            grpId,
            simulatorPatients
          );

          const evalSummary = getGroupEvaluationSummary(grpId);
          const isExpanded = Boolean(expandedGroups[grpId]);

          return (
            <div
              key={grpId}
              className="bg-neutral-900 border-2 border-neutral-800 shadow-md transition-all hover:border-neutral-700"
              style={{ borderLeftColor: groupTheme.border, borderLeftWidth: '5px' }}
            >
              {/* COMPACT MAIN ROW: Adaptive layout across Mobile, Tablet, and Desktop */}
              <div
                onClick={() => toggleGroupDropdown(grpId)}
                className="p-2 sm:p-3 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2 sm:gap-2.5 bg-neutral-900 cursor-pointer hover:bg-neutral-850/80 transition-colors"
                title="Clicca per espandere/comprimere le specifiche del modulo"
              >
                {/* 1. Group Badge & Squads */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto min-w-0 sm:min-w-[180px] flex-shrink-0">
                  <div
                    className="w-7 h-7 font-black text-black flex items-center justify-center text-xs shadow"
                    style={{ backgroundColor: groupTheme.border }}
                  >
                    {grpId}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs sm:text-sm text-white uppercase tracking-tight">
                        GRP {grpId}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {groupTheme.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap mt-0.5">
                      {assignedTeams.map((tm) => {
                        const isEvaluated = evaluations.some(
                          (e) => e.teamId === tm.id && e.day === activeDay
                        );
                        return (
                          <span
                            key={tm.id}
                            className="px-1.5 py-0.2 bg-neutral-950 border text-[10px] font-mono text-neutral-300 flex items-center gap-1"
                            style={{ borderColor: tm.color }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: tm.color }}
                            />
                            <strong>{getTeamCodeName(tm)}</strong>
                            {isEvaluated ? (
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. T0 Current Module (Attivo Ora) with INTERNAL Protesi & Valutazione buttons on Scenari & Prep ED */}
                <div className="flex-1 w-full xl:min-w-[260px] min-w-0 bg-neutral-950/80 border border-neutral-800 p-2 sm:p-2.5 flex flex-col justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.2 bg-red-600 text-white font-mono font-black text-[9px] uppercase tracking-wider">
                        T0 ATTIVO
                      </span>
                      <span
                        className={`px-1.5 py-0.2 border text-[9px] font-bold font-mono uppercase flex items-center gap-1 ${activeBadge.bg}`}
                      >
                        {activeBadge.icon}
                        <span>{activeBadge.shortLabel}</span>
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-0.5 ml-auto">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        {activeActivity.location}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs sm:text-sm font-black text-white uppercase text-left truncate block w-full">
                        <span className="truncate">{activeActivity.title}</span>
                      </span>
                    </div>

                    {activeActivity.subtitle && (
                      <p className="text-[10px] text-neutral-400 font-mono line-clamp-1">
                        {activeActivity.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Bottom inside T0 Box: Expected Procs + Readiness + (PROTESI & VALUTAZIONE on Scenari/Prep ED) */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-neutral-800/80">
                    {/* Expected Procs */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {activeExpectedProcs.slice(0, 2).map((proc, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-1.5 py-0.2 bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 text-[9px] font-bold"
                        >
                          ✓ {proc}
                        </span>
                      ))}
                      {activeExpectedProcs.length > 2 && (
                        <span className="text-[9px] font-mono text-neutral-500">
                          +{activeExpectedProcs.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Actions: Readiness + Protesi + Valutazione */}
                    <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                      {/* Readiness Pill */}
                      {activeReadiness.hasScenario && (
                        <>
                          {activeReadiness.status === 'critical' ? (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCriticalityPatientId(
                                  activeReadiness.firstCriticalPatientId || null
                                )
                              }
                              className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-[9px] uppercase font-mono flex items-center gap-1 animate-pulse border border-amber-300 cursor-pointer shadow"
                              title="Criticità segnalata! Clicca per visualizzare e risolvere"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              <span>CRITICITÀ ⚠️</span>
                            </button>
                          ) : activeReadiness.status === 'ready' ? (
                            <button
                              type="button"
                              onClick={() => {
                                const pId = activeActivity.patientIds?.[0];
                                if (pId) setSelectedCriticalityPatientId(pId);
                              }}
                              className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold text-[9px] uppercase font-mono flex items-center gap-1 cursor-pointer hover:bg-emerald-900"
                            >
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>PRONTO</span>
                            </button>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-400 font-mono text-[9px] uppercase">
                              IN PREP
                            </span>
                          )}
                        </>
                      )}

                      {/* PROTESI & VALUTAZIONE BUTTONS INSIDE T0 BOX (ONLY on practical scenarios & ED prep) */}
                      {isEligibleForProtesiAndEval(activeActivity) && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProtesiModal({
                                groupId: grpId,
                                groupActivity: activeActivity,
                                timeRange: currentSlot.timeRange,
                              })
                            }
                            className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-300 font-bold text-[10px] uppercase font-mono flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                            title="Apri registro protesi, trucco attori e tecnici assegnati"
                          >
                            <Package className="w-3 h-3 text-cyan-400" />
                            <span>PROTESI</span>
                          </button>

                          {assignedTeams.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const firstTeam = assignedTeams[0];
                                const evalItem = evalSummary.evals.find((e) => e.team.id === firstTeam.id);
                                setSelectedEvalModal({
                                  team: firstTeam,
                                  faculty: evalItem?.faculty,
                                  evaluation: evalItem?.evaluation,
                                  scenarioCode: activeActivity.title,
                                });
                              }}
                              className={`px-2 py-0.5 font-bold text-[10px] uppercase font-mono flex items-center gap-1 cursor-pointer border transition-colors ${
                                evalSummary.allEvaluated
                                  ? 'bg-emerald-900 hover:bg-emerald-800 text-white border-emerald-500'
                                  : 'bg-amber-500 hover:bg-amber-400 text-black border-amber-300 font-black animate-pulse'
                              }`}
                              title="Valutazioni e debriefing squadre"
                            >
                              <ClipboardCheck className="w-3 h-3" />
                              <span>{evalSummary.allEvaluated ? 'VALUTAZIONE OK' : 'VALUTAZIONE ⚠️'}</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. T+1 Next Module (Prossimo in Rotazione) - Responsive width */}
                <div className="w-full xl:w-auto xl:min-w-[180px] xl:max-w-[250px] bg-neutral-950/40 border border-neutral-800/80 p-2 flex flex-col justify-center text-xs">
                  {nextActivity && nextSlotObj ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400">
                        <span className="font-bold text-neutral-300">T+1 PROSSIMO</span>
                        <span>{nextSlotObj.timeRange}</span>
                      </div>
                      <div
                        className="text-[11px] font-bold text-neutral-200 truncate"
                        title={nextActivity.title}
                      >
                        {nextActivity.title}
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500">
                        <span className="truncate">{nextActivity.location}</span>
                        {nextActivity.partnerGroup && (
                          <span className="text-cyan-400 font-bold">⇄ Grp {nextActivity.partnerGroup}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono text-neutral-500 text-center py-1">
                      Chiusura Sessione
                    </div>
                  )}
                </div>
              </div>

              {/* 5. MENU A TENDINA (EXPANDABLE ACCORDION SECTION WITH FULL TIMELINE & DETAILS) */}
              {isExpanded && (
                <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800 space-y-3 animate-fadeIn">
                  {/* SHARED TOP BOX: Teams & Tutors (Faculty) */}
                  <div className="w-full text-xs">
                    <div className="bg-neutral-900 p-2.5 border border-neutral-800 space-y-1">
                      <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase block">Squadre & Tutor (Faculty) Associati:</span>
                      {assignedTeams.length > 0 ? (
                        assignedTeams.map(tm => {
                          const evalItem = evalSummary.evals.find(e => e.team.id === tm.id);
                          const facName = evalItem?.faculty?.name || 'Faculty da assegnare';
                          return (
                            <div key={tm.id} className="flex items-center justify-between text-neutral-200 font-mono text-[11px]">
                              <span className="flex items-center gap-1.5 font-bold">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tm.color }} />
                                {tm.name}
                              </span>
                              <span className="text-yellow-400 font-medium">Tutor: {facName}</span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-neutral-500 font-mono text-[11px]">Nessuna squadra assegnata</span>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const isStandby = activeActivity.title.toLowerCase().includes('standby') || activeActivity.subtitle.toLowerCase().includes('standby');
                    const isRealWorkshop = (activeActivity.activityType === 'workshop' || activeActivity.activityType === 'skills') && !isStandby;

                    if (isRealWorkshop) {
                      return (
                        <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-2">
                          <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                            <h4 className="text-white font-black text-sm uppercase tracking-wide">
                              {activeActivity.title}
                            </h4>
                            <div className="text-xs font-mono text-purple-400 bg-purple-950/60 px-2 py-1 border border-purple-800">
                              📍 Postazione: <strong>{activeActivity.location}</strong>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-300 leading-relaxed font-medium pt-1">
                            {activeActivity.subtitle || 'Sessione pratica intensiva di addestramento tecnico sulle manovre salvavita e presidi dedicati, con supervisione costante del tutor di postazione.'}
                          </p>
                        </div>
                      );
                    } else if (activeActivity.activityType === 'scenario_extra' || activeActivity.activityType === 'scenario_intra') {
                      return (
                        <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                            <div>
                              <span className="px-2 py-0.5 bg-blue-950 text-blue-300 font-mono text-[10px] font-black uppercase border border-blue-700">
                                SCENARIO CLINICO / TATTICO
                              </span>
                              <h4 className="text-white font-black text-sm uppercase tracking-wide mt-1">
                                {activeActivity.title}
                              </h4>
                            </div>
                            <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-1 border border-cyan-800">
                              📍 Postazione: <strong>{activeActivity.location}</strong>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
                              <Stethoscope className="w-3.5 h-3.5" />
                              <span>PROCEDURE ATTESE NEL MODULO</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {activeExpectedProcs.map((proc, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="px-2 py-0.5 bg-emerald-950 border border-emerald-700/80 text-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1"
                                >
                                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                                  <span>{proc}</span>
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-neutral-300 pt-1">
                              {activeActivity.subtitle}
                            </p>
                          </div>
                        </div>
                      );
                    } else {
                      const badgeLabel = activeActivity.activityType === 'debriefing' ? 'DEBRIEFING & REVISIONE' : isStandby ? 'STANDBY ATTIVO SHOCK ROOM' : 'FASE DI TRANSIZIONE / ATTESA';
                      const badgeColor = activeActivity.activityType === 'debriefing' ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-cyan-950 text-cyan-300 border-cyan-700';

                      return (
                        <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-2">
                          <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 font-mono text-[10px] font-black uppercase border ${badgeColor}`}>
                                {badgeLabel}
                              </span>
                              <h4 className="text-white font-black text-sm uppercase tracking-wide">
                                {activeActivity.title}
                              </h4>
                            </div>
                            <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-1 border border-cyan-800">
                              📍 Postazione: <strong>{activeActivity.location}</strong>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-300 leading-relaxed font-medium pt-1">
                            {activeActivity.subtitle || 'Fase operativa di coordinamento, transizione o debriefing collegiale guidata dalla faculty.'}
                          </p>
                        </div>
                      );
                    }
                  })()}

                  {/* SIMULATOR PATIENTS, PROSTHETICS & TECHNICIANS RESOURCE BOX */}
                  {(() => {
                    const relevantPatients = (activeActivity.patientIds || [])
                      .map(pId => simulatorPatients.find(p => p.id === pId))
                      .filter(Boolean) as SimulatorPatient[];

                    const associatedTechs = technicians.filter(tech => {
                      const loc = (activeActivity.location || '').toLowerCase();
                      return tech.assignedStations.some(s => loc.includes(s.toLowerCase()) || s.toLowerCase().includes(loc)) ||
                        (relevantPatients.length > 0 && tech.id === 'tech-1') ||
                        (activeActivity.activityType === 'workshop' && tech.specialty.toLowerCase().includes('tccc'));
                    });

                    return (
                      <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>Simulatori, Pazienti & Tecnici di Postazione:</span>
                          </span>
                          <button
                            onClick={() => setSelectedProtesiModal({ groupId: grpId, groupActivity: activeActivity })}
                            className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 font-mono text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <ClipboardList className="w-3 h-3" />
                            <span>Registro Risorse & Protesi</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {/* Patients / Simulatori */}
                          <div className="bg-neutral-950 p-2 border border-neutral-800 space-y-1">
                            <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase block">Pazienti / Manichini / Moulage:</span>
                            {relevantPatients.length > 0 ? (
                              relevantPatients.map(pat => (
                                <div key={pat.id} className="text-neutral-200 font-mono text-[11px] space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-yellow-400 font-bold">Pz #{pat.id}: {pat.scenarioCode || pat.title || 'Scenario Clinico'}</span>
                                    <span className={`px-1.5 py-0.2 text-[9px] font-black uppercase border ${pat.readinessStatus === 'ready' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-red-950 text-red-300 border-red-700'}`}>
                                      {pat.readinessStatus === 'ready' ? 'PRONTO' : 'CRITICO / RESET'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-neutral-400">
                                    💄 Protesi: <strong className="text-neutral-300">{pat.moulageProtesi}</strong> | Attore: <strong className="text-neutral-300">{pat.attoreDettagli || 'Presente'}</strong>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-neutral-500 font-mono text-[11px]">Nessun paziente associato a questo modulo (Sessione Pratica / Transizione)</span>
                            )}
                          </div>

                          {/* Assigned Technicians */}
                          <div className="bg-neutral-950 p-2 border border-neutral-800 space-y-1">
                            <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase block">Tecnico di Postazione (TECH):</span>
                            {associatedTechs.length > 0 ? (
                              associatedTechs.map(tech => (
                                <div key={tech.id} className="flex items-center justify-between text-neutral-200 font-mono text-[11px]">
                                  <span className="font-bold flex items-center gap-1">
                                    <Wrench className="w-3 h-3 text-cyan-400" />
                                    <span>{tech.name} ({tech.specialty})</span>
                                  </span>
                                  <span className="text-cyan-300 font-medium">{tech.phone || 'Regia Audio/Video'}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-neutral-500 font-mono text-[11px]">TECH-01 / TECH-02 (Presidio Standard)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>



      {/* 3. MODALS & POPUPS CONTAINER */}

      {/* B. Protesi, Attori & Tecnici Modal */}
      {selectedProtesiModal && (
        <ProtesiAttoriTecniciModal
          isOpen={Boolean(selectedProtesiModal)}
          onClose={() => setSelectedProtesiModal(null)}
          groupId={selectedProtesiModal.groupId}
          groupActivity={selectedProtesiModal.groupActivity}
          timeRange={selectedProtesiModal.timeRange}
          patients={simulatorPatients}
          teams={teams}
          technicians={technicians}
          onSendMessageToTech={(tech, msg) => {
            sendCourseMessage({
              senderId: 'dir-1',
              senderName: 'Regia Master (Direzione Corso)',
              senderRole: 'direttore',
              type: 'warning',
              subject: `[REGIA -> ${tech.name}] Richiesta Presidi`,
              content: msg,
            });
          }}
        />
      )}

      {/* C. Scenario Criticality Modal (T-30m Readiness & Critical Issues) */}
      {selectedCriticalityPatientId && currentCriticalityPatient && (
        <ScenarioCriticalityModal
          isOpen={Boolean(selectedCriticalityPatientId)}
          onClose={() => setSelectedCriticalityPatientId(null)}
          patient={currentCriticalityPatient}
          technicians={technicians}
          onUpdatePatient={(pId, updates) => updateSimulatorPatient(pId, updates)}
          onSendRadioAlert={(msg) => {
            sendCourseMessage({
              senderId: 'regia-master',
              senderName: 'Regia Master (Direzione Corso)',
              senderRole: 'direttore',
              type: 'warning',
              subject: 'AVVISO REGIA • CRITICITÀ POSTAZIONE',
              content: msg,
            });
          }}
        />
      )}

      {/* D. Evaluation Summary Modal (Debriefing scoring rubric & pending status) */}
      {selectedEvalModal && (
        <EvaluationSummaryModal
          isOpen={Boolean(selectedEvalModal)}
          onClose={() => setSelectedEvalModal(null)}
          team={selectedEvalModal.team}
          faculty={selectedEvalModal.faculty}
          evaluation={selectedEvalModal.evaluation}
          scenarioCode={selectedEvalModal.scenarioCode}
          onSendReminderToFaculty={(fac) => {
            sendCourseMessage({
              senderId: 'dir-1',
              senderName: 'Regia Master (Direzione Corso)',
              senderRole: 'direttore',
              type: 'warning',
              subject: `[SOLLECITO DEBRIEFING] Valutazione ${getTeamCodeName(selectedEvalModal.team)}`,
              content: `Gentile ${fac.name}, il modulo pratico per ${getTeamCodeName(selectedEvalModal.team)} è terminato. Si prega di compilare e inviare la scheda di valutazione e debriefing clinico.`,
            });
          }}
          onOpenDirectEvaluation={(teamId) => {
            saveEvaluation({
              teamId,
              facultyId: selectedEvalModal.faculty?.id || 'fac-1',
              day: activeDay,
              period: currentSlot.period,
              patientId: 1,
              scenarioCode: selectedEvalModal.scenarioCode || 'Scenario Trauma',
              phase: 'EXTRA',
              scores: {
                abcdeApproach: 4,
                technicalSkills: 4,
                teamworkLeadership: 4,
                handoverSbar: 4,
                safetyTiming: 4,
              },
              proceduresCompleted: ['Valutazione Primaria', 'Controllo Emorragie'],
              strengths: 'Buona gestione generale registrata dalla Regia Master.',
              criticalIssues: 'Debriefing clinico in corso.',
              debriefingActionItems: 'Focus su tempistiche manovre invasive.',
            });
          }}
        />
      )}
    </div>
  );
};
