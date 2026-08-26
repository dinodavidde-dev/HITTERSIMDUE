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
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  ClipboardList,
  Clock,
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
import { ModuleDetailModal } from './ModuleDetailModal';
import { getTeamCodeName } from '../../utils/teamUtils';
import { ProtesiAttoriTecniciModal } from './ProtesiAttoriTecniciModal';
import { ScenarioCriticalityModal } from './ScenarioCriticalityModal';
import { EvaluationSummaryModal } from './EvaluationSummaryModal';
import { CourseTimelineLegend, TimelineStatusState } from './CourseTimelineLegend';

const GROUP_THEMES: Record<GroupType, { label: string; name: string; border: string; bg: string; text: string; badgeBg: string }> = {
  A: { label: 'ROSSO', name: 'Triage & TCCC', border: '#ef4444', bg: 'bg-red-950/30', text: 'text-red-400', badgeBg: 'bg-red-600' },
  B: { label: 'BLU', name: 'Airway & Shock', border: '#3b82f6', bg: 'bg-blue-950/30', text: 'text-blue-400', badgeBg: 'bg-blue-600' },
  C: { label: 'VERDE', name: 'Torace & Drenaggi', border: '#22c55e', bg: 'bg-green-950/30', text: 'text-green-400', badgeBg: 'bg-green-600' },
  D: { label: 'GIALLO', name: 'Shock Room & REBOA', border: '#eab308', bg: 'bg-yellow-950/30', text: 'text-yellow-400', badgeBg: 'bg-yellow-600' },
};

interface RegiaVisualTimelineBoardProps {
  onOpenMessenger?: () => void;
  onOpenBroadcast?: () => void;
}

export const RegiaVisualTimelineBoard: React.FC<RegiaVisualTimelineBoardProps> = ({
  onOpenMessenger,
  onOpenBroadcast,
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
    sendCourseMessage,
    sendBroadcastAlert,
    autoAdvancePhases,
    setAutoAdvancePhases,
    setCourseGateEnabled,
  } = useCourse();

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

  // Active Modals State
  const [selectedModuleDetail, setSelectedModuleDetail] = useState<{
    groupId: GroupType;
    groupActivity: GroupActivitySlot;
    timeRange: string;
    isNext?: boolean;
  } | null>(null);

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
  const [statusLegendFilter, setStatusLegendFilter] = useState<TimelineStatusState | 'ALL'>('ALL');
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
      type === 'scenario_intra' ||
      type === 'night_scenario';

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

    if (activity.activityType === 'night_scenario') {
      return ['Triage Notturno', 'Illuminazione NVG / UV', 'Fasce Emostatiche'];
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
          label: 'WORKSHOP TCCC',
          shortLabel: 'WORKSHOP',
          bg: 'bg-purple-950/90 text-purple-300 border-purple-500/60',
          chip: 'bg-purple-500 text-black',
          icon: <Wrench className="w-3 h-3 text-purple-400" />,
        };
      case 'skills':
        return {
          label: 'SKILLS LAB',
          shortLabel: 'SKILLS LAB',
          bg: 'bg-fuchsia-950/90 text-fuchsia-300 border-fuchsia-500/60',
          chip: 'bg-fuchsia-500 text-black',
          icon: <Layers className="w-3 h-3 text-fuchsia-400" />,
        };
      case 'debriefing':
        return {
          label: 'DEBRIEFING',
          shortLabel: 'DEBRIEFING',
          bg: 'bg-amber-950/90 text-amber-300 border-amber-500/60',
          chip: 'bg-amber-500 text-black',
          icon: <GraduationCap className="w-3 h-3 text-amber-400" />,
        };
      case 'night_scenario':
        return {
          label: 'NOTTURNO',
          shortLabel: 'NOTTURNO',
          bg: 'bg-indigo-950/90 text-indigo-300 border-indigo-500/60',
          chip: 'bg-indigo-500 text-white',
          icon: <Zap className="w-3 h-3 text-indigo-400" />,
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

  // Group evaluation status for a specific group
  const getGroupEvaluationSummary = (grp: GroupType) => {
    const grpTeams = teams.filter((t) => t.groupId === grp);
    const evals = grpTeams.map((tm) => {
      const evaluation = evaluations.find(
        (e) => e.teamId === tm.id && e.day === activeDay
      );
      const assignedFaculty = faculty.find((f) => f.assignedTeamId === tm.id);
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
    <div className="space-y-3 animate-fadeIn">
      {/* 0. PRE-COURSE WINDOW (08:00 - 08:30) & REAL-TIME WORKSTATION GREEN LIGHT STATUS */}
      <div className="bg-neutral-900 border-2 border-emerald-500/80 p-4 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-emerald-500 text-black font-black font-mono text-xs uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                FINESTRA PRE-CORSO (08:00 - 08:30) & LUCE VERDE POSTAZIONI
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-600 text-emerald-300 font-mono text-xs font-bold">
                GATE STAFF: 08:00 • POSTI ASSEGNATI ENTRO 08:30
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
              Gestione Mattina: Apertura Gate Staff alle 08:00 & Controllo Postazioni in Tempo Reale
            </h3>
            <p className="text-xs text-neutral-300">
              Alle 08:00 viene aperto il gate per lo staff con promemoria di raggiungere la propria postazione assegnata. Entro le 08:30 tutti i discenti, istruttori e staff devono aver preso posto.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (setCourseGateEnabled) setCourseGateEnabled(true);
                sendBroadcastAlert({
                  senderRole: 'direttore',
                  senderName: 'Regia Master',
                  type: 'info',
                  title: 'GATE STAFF APERTO (08:00)',
                  message: 'Il gate per lo staff è aperto! Si prega di raggiungere tempestivamente la propria postazione assegnata.',
                  targetGroups: ['ALL'],
                  priority: 'high',
                });
              }}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase font-mono flex items-center gap-1.5 cursor-pointer shadow"
            >
              <CheckCircle2 className="w-4 h-4" />
              Apri Gate Staff (08:00) & Notifica
            </button>
            <button
              type="button"
              onClick={() => {
                sendBroadcastAlert({
                  senderRole: 'direttore',
                  senderName: 'Regia Master',
                  type: 'warning',
                  title: 'PROMEMORIA POSTAZIONE (ENTRO 08:30)',
                  message: 'Mancano 30 minuti all\'inizio del corso. Tutti i discenti e lo staff devono aver preso posto entro le 08:30.',
                  targetGroups: ['ALL'],
                  priority: 'high',
                });
              }}
              className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-black text-xs uppercase font-mono flex items-center gap-1.5 cursor-pointer shadow"
            >
              <AlertTriangle className="w-4 h-4" />
              Invia Promemoria Postazioni (08:30)
            </button>
          </div>
        </div>

        {/* Real-time Workstation Green Light Status Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-neutral-300 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Stato Postazioni & Luce Verde (Monitoraggio Live Regia)
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              {stationChecklists.filter(s => s.readinessScore === 100 || s.isFullyCertified).length} / {stationChecklists.length} Pronte (Luce Verde)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stationChecklists.map((st) => {
              const items = st.items || [];
              const readyCount = items.filter(i => i.status === 'READY').length;
              const isGreen = st.readinessScore === 100 || st.isFullyCertified || (items.length > 0 && readyCount === items.length);
              return (
                <div
                  key={st.stationId}
                  className={`p-3 border-2 transition-all ${
                    isGreen
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 shadow-lg shadow-emerald-950/50'
                      : 'bg-neutral-950 border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-black text-white truncate max-w-[130px]" title={st.stationName}>
                      {st.stationId}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-mono font-black uppercase ${
                      isGreen ? 'bg-emerald-500 text-black' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                    }`}>
                      {isGreen ? '🟢 LUCE VERDE' : '🟡 IN PREP'}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-neutral-300 truncate mb-1.5" title={st.stationName}>
                    {st.stationName.split('(')[0]}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 border-t border-neutral-800 pt-1">
                    <span>Score: {st.readinessScore || Math.round((readyCount / (items.length || 1)) * 100)}%</span>
                    <span>{readyCount}/{items.length} voci</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

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

              {/* Day Switcher */}
              <div className="flex items-center bg-neutral-950 p-0.5 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDay(2);
                    setActiveSlotIndex(0);
                  }}
                  className={`px-2 py-0.5 font-mono text-[10px] font-bold cursor-pointer transition-colors ${
                    activeDay === 2
                      ? 'bg-yellow-500 text-black font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  GIORNO 2
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDay(3);
                    setActiveSlotIndex(0);
                  }}
                  className={`px-2 py-0.5 font-mono text-[10px] font-bold cursor-pointer transition-colors ${
                    activeDay === 3
                      ? 'bg-yellow-500 text-black font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  GIORNO 3
                </button>
              </div>

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
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="bg-neutral-950 border border-yellow-500 px-3 py-1 text-center min-w-[110px]">
              <span className="text-[9px] font-mono text-yellow-500 font-black uppercase block">
                {isTimerRunning ? 'IN CORSO' : 'IN PAUSA'}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-yellow-400 leading-none">
                {formatTimer(timerSeconds)}
              </span>
            </div>

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
          </div>
        </div>

        {/* HORIZONTAL COURSE TIMELINE SCROLLER (INTERACTIVE SCHEDULE STRIP) */}
        <div className="bg-neutral-950 border border-neutral-800 p-2 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <div className="flex items-center gap-1.5 font-black uppercase text-neutral-300">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              <span>TIMELINE SCROLLER GIORNO {activeDay} ({filteredSlots.length} FASI TOTALI)</span>
            </div>
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
          </div>

          <div
            ref={timelineScrollRef}
            className="flex items-stretch gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900 scroll-smooth"
          >
            {filteredSlots.map((slot, sIdx) => {
              const isCurrent = sIdx === activeSlotIndex;
              const isNext = sIdx === activeSlotIndex + 1;
              const isPast = sIdx < activeSlotIndex;

              return (
                <div
                  key={slot.id}
                  onClick={() => setActiveSlotIndex(sIdx)}
                  className={`min-w-[190px] max-w-[220px] p-2 border flex flex-col justify-between cursor-pointer transition-all flex-shrink-0 text-left relative ${
                    isCurrent
                      ? 'bg-neutral-900 border-yellow-400 ring-2 ring-yellow-400/40 shadow-lg'
                      : isNext
                      ? 'bg-neutral-900/90 border-cyan-500/70 hover:border-cyan-400'
                      : isPast
                      ? 'bg-neutral-950/60 border-neutral-800 opacity-70 hover:opacity-100 hover:border-neutral-700'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600'
                  }`}
                  title={`Clicca per passare a ${slot.title} (${slot.timeRange})`}
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
            <button
              type="button"
              onClick={prevSlot}
              disabled={activeSlotIndex === 0}
              className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 font-bold text-[11px] uppercase border border-neutral-800 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>PREC</span>
            </button>

            <span className="text-[11px] font-mono text-neutral-300 font-semibold px-2 py-1 bg-neutral-950 border border-neutral-800">
              Fase {activeSlotIndex + 1}/{filteredSlots.length}
            </span>

            <button
              type="button"
              onClick={nextSlot}
              disabled={activeSlotIndex === filteredSlots.length - 1}
              className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-[11px] uppercase flex items-center gap-1 cursor-pointer"
            >
              <span>SUCC</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
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
          const groupTheme = GROUP_THEMES[grpId];
          const assignedTeams = teams.filter((t) => t.groupId === grpId);
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
              <div className="p-2 sm:p-3 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2 sm:gap-2.5 bg-neutral-900">
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedModuleDetail({
                            groupId: grpId,
                            groupActivity: activeActivity,
                            timeRange: currentSlot.timeRange,
                            isNext: false,
                          })
                        }
                        className="text-xs sm:text-sm font-black text-white hover:text-yellow-400 uppercase text-left truncate cursor-pointer transition-colors flex items-center gap-1 w-full"
                        title="Clicca per aprire le specifiche complete del modulo"
                      >
                        <span className="truncate">{activeActivity.title}</span>
                        <ExternalLink className="w-3 h-3 text-neutral-500 hover:text-yellow-400 flex-shrink-0" />
                      </button>
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
                        onClick={() =>
                          setSelectedModuleDetail({
                            groupId: grpId,
                            groupActivity: nextActivity,
                            timeRange: nextSlotObj.timeRange,
                            isNext: true,
                          })
                        }
                        className="text-[11px] font-bold text-neutral-200 hover:text-yellow-400 truncate cursor-pointer transition-colors"
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

                {/* 4. Accordion Trigger (Menu a Tendina) */}
                <div className="flex items-center self-end xl:self-center flex-shrink-0">
                  {/* MENU A TENDINA (ACCORDION TOGGLE) */}
                  <button
                    type="button"
                    onClick={() => toggleGroupDropdown(grpId)}
                    className={`px-2.5 py-1.5 font-bold text-[11px] font-mono uppercase flex items-center gap-1 cursor-pointer border transition-all ${
                      isExpanded
                        ? 'bg-yellow-500 text-black border-yellow-400'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                    }`}
                    title={isExpanded ? 'Chiudi menu a tendina dettagli' : 'Apri menu a tendina dettagli'}
                  >
                    <span className="text-[10px]">{isExpanded ? 'CHIUDI' : 'DETTAGLI'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* 5. MENU A TENDINA (EXPANDABLE ACCORDION SECTION WITH FULL TIMELINE & DETAILS) */}
              {isExpanded && (
                <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800 space-y-3 animate-fadeIn">
                  {/* Timeline Milestones (T-30m -> T+30m) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase font-black tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-yellow-400" />
                      TIMELINE CRONOLOGICA OPERATIVA (T-30m ➔ T+30m):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px] font-mono text-center">
                      <div className="p-1.5 bg-neutral-900 border border-neutral-800">
                        <span className="block font-black text-cyan-400 text-[11px]">T-30m</span>
                        <span className="text-neutral-300 font-bold block">Setup Presidi</span>
                        <span className="text-[9px] text-neutral-500 block">Check pompe sangue</span>
                      </div>
                      <div className="p-1.5 bg-neutral-900 border border-neutral-800">
                        <span className="block font-black text-amber-400 text-[11px]">T-15m</span>
                        <span className="text-neutral-300 font-bold block">Trucco Attori</span>
                        <span className="text-[9px] text-neutral-500 block">Briefing canovaccio</span>
                      </div>
                      <div className="p-1.5 bg-neutral-900 border border-red-500/70 bg-red-950/30">
                        <span className="block font-black text-red-400 text-[11px]">T0 START</span>
                        <span className="text-white font-bold block">Ingresso Squadra</span>
                        <span className="text-[9px] text-neutral-400 block">Allarme & Triage</span>
                      </div>
                      <div className="p-1.5 bg-neutral-900 border border-neutral-800">
                        <span className="block font-black text-emerald-400 text-[11px]">T+15m</span>
                        <span className="text-neutral-300 font-bold block">Handover SBAR</span>
                        <span className="text-[9px] text-neutral-500 block">Passaggio consegne</span>
                      </div>
                      <div className="p-1.5 bg-neutral-900 border border-neutral-800">
                        <span className="block font-black text-yellow-400 text-[11px]">T+30m</span>
                        <span className="text-neutral-300 font-bold block">Debriefing</span>
                        <span className="text-[9px] text-neutral-500 block">Scoring rubrica ABCDE</span>
                      </div>
                    </div>
                  </div>

                  {/* Full List of Procedures & Clinical Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Left: Expected Procedures & Dynamic */}
                    <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                        <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5" />
                          PROCEDURE ATTESE NEL MODULO
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedModuleDetail({
                              groupId: grpId,
                              groupActivity: activeActivity,
                              timeRange: currentSlot.timeRange,
                              isNext: false,
                            })
                          }
                          className="text-[10px] font-mono text-yellow-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>SCHEDA COMPLETA</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
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

                    {/* Right: Squads Evaluations Status & Tutor Reminders */}
                    <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                        <span className="text-[11px] font-mono text-cyan-400 font-bold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          SQUADRE & DEBRIEFING TUTOR
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {evalSummary.evaluatedCount}/{assignedTeams.length} Completate
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {assignedTeams.map((tm) => {
                          const evalItem = evalSummary.evals.find((e) => e.team.id === tm.id);
                          const isEvaluated = Boolean(evalItem?.evaluation);
                          const tmFaculty = evalItem?.faculty;

                          return (
                            <div
                              key={tm.id}
                              className="p-2 bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: tm.color }}
                                />
                                <div>
                                  <span className="font-black text-xs text-white">
                                    {tm.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-neutral-400 block">
                                    Tutor: {tmFaculty ? tmFaculty.name : 'Non assegnato'}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedEvalModal({
                                    team: tm,
                                    faculty: tmFaculty,
                                    evaluation: evalItem?.evaluation,
                                    scenarioCode: activeActivity.title,
                                  })
                                }
                                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer border ${
                                  isEvaluated
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                    : 'bg-amber-500 text-black border-amber-300 font-black animate-pulse'
                                }`}
                              >
                                {isEvaluated ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Vedi Voto</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Compila / Sollecita</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2.5 INTERACTIVE TIMELINE & MODULE STATUS LEGEND */}
      <CourseTimelineLegend
        activeDay={activeDay}
        currentSlotTitle={currentSlot.title}
        currentSlotTimeRange={currentSlot.timeRange}
        totalPendingEvaluations={totalPendingEvals}
        totalCompletedEvaluations={evaluations.filter((e) => e.day === activeDay).length}
        selectedStatusFilter={statusLegendFilter}
        onSelectStatusFilter={(st) => setStatusLegendFilter(st)}
      />

      {/* 3. MODALS & POPUPS CONTAINER */}

      {/* A. Module Detail Modal (Intra vs Extra specifications, patient clinical cases) */}
      {selectedModuleDetail && (
        <ModuleDetailModal
          isOpen={Boolean(selectedModuleDetail)}
          onClose={() => setSelectedModuleDetail(null)}
          groupId={selectedModuleDetail.groupId}
          groupActivity={selectedModuleDetail.groupActivity}
          timeRange={selectedModuleDetail.timeRange}
          isNext={selectedModuleDetail.isNext}
          patients={simulatorPatients}
          teams={teams}
          facultyList={faculty}
          technicians={technicians}
          onOpenProtesiModal={() =>
            setSelectedProtesiModal({
              groupId: selectedModuleDetail.groupId,
              groupActivity: selectedModuleDetail.groupActivity,
              timeRange: selectedModuleDetail.timeRange,
            })
          }
          onOpenCriticalityModal={(patientId) => setSelectedCriticalityPatientId(patientId)}
        />
      )}

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
            sendBroadcastAlert({
              senderRole: 'direttore',
              senderName: 'Regia Master (Direzione Corso)',
              type: 'warning',
              title: 'AVVISO REGIA • CRITICITÀ POSTAZIONE',
              message: msg,
              targetGroups: ['ALL'],
              priority: 'high',
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
