import React, { useState, useEffect, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Award,
  CheckCheck,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  Flame,
  GraduationCap,
  HeartPulse,
  Info,
  Layers,
  ListChecks,
  MapPin,
  Menu,
  MessageSquare,
  PlusCircle,
  QrCode,
  Radio,
  RotateCcw,
  Save,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { CourseDay, CourseMessage, GroupType, SessionPeriod, TeamEvaluation, TeamEvaluationScores } from '../../types';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { CourseMessagesPanel } from '../messaging/CourseMessagesPanel';
import { CourseMessengerModal } from '../messaging/CourseMessengerModal';
import { BroadcastModal } from '../BroadcastModal';
import { FacultyLiveFeedbackForm } from '../faculty/FacultyLiveFeedbackForm';
import { LanguageSwitcher } from '../LanguageSwitcher';

type FacultySubTab = 'field' | 'my_roster' | 'evaluation' | 'messages';

const GROUP_THEMES: Record<
  GroupType,
  {
    name: string;
    badge: string;
    bg: string;
    border: string;
    text: string;
    dot: string;
    chip: string;
    borderAccent: string;
  }
> = {
  A: {
    name: 'Gruppo A (Alpha)',
    badge: 'bg-red-600 text-white font-black',
    bg: 'bg-red-950/70',
    border: 'border-red-600',
    text: 'text-red-300',
    dot: 'bg-red-500',
    chip: 'bg-red-900/60 text-red-300 border-red-700',
    borderAccent: 'border-l-red-500',
  },
  B: {
    name: 'Gruppo B (Bravo)',
    badge: 'bg-blue-600 text-white font-black',
    bg: 'bg-blue-950/70',
    border: 'border-blue-600',
    text: 'text-blue-300',
    dot: 'bg-blue-500',
    chip: 'bg-blue-900/60 text-blue-300 border-blue-700',
    borderAccent: 'border-l-blue-500',
  },
  C: {
    name: 'Gruppo C (Charlie)',
    badge: 'bg-emerald-600 text-white font-black',
    bg: 'bg-emerald-950/70',
    border: 'border-emerald-600',
    text: 'text-emerald-300',
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    borderAccent: 'border-l-emerald-500',
  },
  D: {
    name: 'Gruppo D (Delta)',
    badge: 'bg-purple-600 text-white font-black',
    bg: 'bg-purple-950/70',
    border: 'border-purple-600',
    text: 'text-purple-300',
    dot: 'bg-purple-500',
    chip: 'bg-purple-900/60 text-purple-300 border-purple-700',
    borderAccent: 'border-l-purple-500',
  },
};

export const FacultyView: React.FC = () => {
  const {
    language,
    t,
    activeDay,
    teams,
    discenti,
    faculty,
    simulatorPatients,
    currentSlot,
    filteredSlots,
    timerSeconds,
    isTimerRunning,
    evaluations,
    saveEvaluation,
    bulkSaveEvaluations,
    activeFacultyTeamId,
    setActiveFacultyTeamId,
    selectedFacultyId,
    setSelectedFacultyId,
    facultyAuthSession,
    userRole,
    courseMessages,
    suspensionInfo,
  } = useCourse();

  const isEn = language === 'en';

  const [activeSubTab, setActiveSubTab] = useState<FacultySubTab>('field');
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [isLiveFeedbackModalOpen, setIsLiveFeedbackModalOpen] = useState(false);
  const [evalSubMode, setEvalSubMode] = useState<'live_form' | 'detailed_board'>('live_form');
  const [bulkNotification, setBulkNotification] = useState<{ title: string; count: number } | null>(null);

  // Active Faculty Member Identification
  const currentFaculty =
    faculty.find((f) => f.id === selectedFacultyId) ||
    faculty.find((f) => f.name.toLowerCase().includes(facultyAuthSession.facultyName?.toLowerCase() || '')) ||
    faculty[0];

  // Assigned team for current tutor (the ONLY team this faculty evaluates)
  const myAssignedTeam = teams.find((t) => t.id === currentFaculty.assignedTeamId) || teams[0];
  const selectedTeam = myAssignedTeam;
  const assignedFaculty = currentFaculty;
  const teamDiscenti = discenti.filter((d) => d.teamId === myAssignedTeam.id);

  // Helper to check if an activity is a practical simulation scenario (EXCLUDES workshops & lectures)
  const isPracticalScenarioActivity = (activityType: string | undefined): boolean => {
    if (!activityType) return false;
    return ['scenario_extra', 'scenario_intra', 'night_scenario'].includes(activityType);
  };

  // Find relevant patient for this team in current session/day
  const relevantPatient =
    simulatorPatients.find(
      (p) =>
        p.day === activeDay &&
        (p.teamExtraAssigned === myAssignedTeam.id || p.teamIntraAssigned === myAssignedTeam.id)
    ) || simulatorPatients[0];

  const isExtraPhase = relevantPatient.teamExtraAssigned === myAssignedTeam.id;

  // Practical activity for selected team in current slot
  const currentTeamActivity = currentSlot.groupActivities?.[myAssignedTeam.groupId as GroupType];
  const isCurrentSlotPracticalScenario = isPracticalScenarioActivity(currentTeamActivity?.activityType);

  // Define the exact 3 Practical Simulation Scenarios this squad tackles across the 2-day course
  interface CourseScenarioTarget {
    id: string;
    scenarioIndex: number;
    day: CourseDay;
    period: SessionPeriod;
    phase: 'EXTRA' | 'INTRA' | 'NIGHT';
    scenarioCode: string;
    title: string;
    phaseLabel: string;
    timing: string;
    location: string;
    description: string;
    lesioni: string[];
    procedures: string[];
    moulageProtesi: string;
    simulatori: string;
    patientId: number;
    isEvaluated: boolean;
  }

  const myTeamScenarios: CourseScenarioTarget[] = useMemo(() => {
    // 1. Scenario Day 2 Mattina
    const d2MorningPatient = simulatorPatients.find(
      (p) =>
        p.day === 2 &&
        p.period === 'mattina' &&
        (p.teamExtraAssigned === myAssignedTeam.id || p.teamIntraAssigned === myAssignedTeam.id)
    );
    const isD2MorningExtra = d2MorningPatient
      ? d2MorningPatient.teamExtraAssigned === myAssignedTeam.id
      : myAssignedTeam.id % 2 === 1;

    const sc1Procedures = d2MorningPatient
      ? isD2MorningExtra
        ? d2MorningPatient.procedureExtra.length > 0
          ? d2MorningPatient.procedureExtra
          : ['Cricotirotomia CRIC', 'Tourniquet TQ', 'Toracostomia con Decompressione']
        : d2MorningPatient.procedureIntra.length > 0
        ? d2MorningPatient.procedureIntra
        : ['Resuscitative Thoracotomy', 'REBOA Zone 1/3', 'Drenaggio Toracico Bulau']
      : isD2MorningExtra
      ? ['Cricotirotomia CRIC', 'Tourniquet TQ', 'Toracostomia con Decompressione']
      : ['Resuscitative Thoracotomy', 'REBOA Zone 1/3', 'Drenaggio Toracico Bulau'];

    const isSc1Evaluated = evaluations.some(
      (e) =>
        e.teamId === myAssignedTeam.id &&
        e.day === 2 &&
        e.period === 'mattina'
    );

    const sc1: CourseScenarioTarget = {
      id: `scenario-d2-morning-team-${myAssignedTeam.id}`,
      scenarioIndex: 0,
      day: 2 as CourseDay,
      period: 'mattina',
      phase: isD2MorningExtra ? 'EXTRA' : 'INTRA',
      scenarioCode: d2MorningPatient?.scenarioCode || (isD2MorningExtra ? 'Scenario Extra TCCC D2M' : 'Scenario Intra DEA D2M'),
      title: isD2MorningExtra
        ? `Giorno 2 Mattina • Extra-Ospedaliero TCCC (${d2MorningPatient?.scenarioCode || 'Postazione Trauma'})`
        : `Giorno 2 Mattina • Intra-Ospedaliero Shock Room (${d2MorningPatient?.scenarioCode || 'Shock Room DEA'})`,
      phaseLabel: isD2MorningExtra ? 'EXTRA-OSPEDALIERO • TCCC TATTICO' : 'INTRA-OSPEDALIERO • SHOCK ROOM DEA',
      timing: 'Giorno 2 • Mattina (11:00)',
      location: isD2MorningExtra ? 'Postazione TCCC Extra' : 'Shock Room DEA',
      description: d2MorningPatient
        ? `Caso Clinico Paziente ${d2MorningPatient.id}: ${d2MorningPatient.lesioni.join(', ')}`
        : isD2MorningExtra
        ? 'Gestione del paziente traumatizzato grave sul terreno con estrazione rapida e controllo vie aeree.'
        : 'Rianimazione avanzata in Shock Room e Damage Control Resuscitation.',
      lesioni: d2MorningPatient?.lesioni || ['Trauma penetrante toracico', 'Shock emorragico grave', 'Pneumotorace iperteso'],
      procedures: sc1Procedures,
      moulageProtesi: d2MorningPatient?.moulageProtesi || 'Ferite penetranti complesse con simulazione emorragica attiva',
      simulatori: d2MorningPatient?.simulatori || 'Simulatore ad alta fedeltà con monitoraggio multiparametrico',
      patientId: d2MorningPatient?.id || (200 + myAssignedTeam.id),
      isEvaluated: isSc1Evaluated,
    };

    // 2. Scenario Day 2 Pomeriggio
    const d2AfternoonPatient = simulatorPatients.find(
      (p) =>
        p.day === 2 &&
        p.period === 'pomeriggio' &&
        (p.teamExtraAssigned === myAssignedTeam.id || p.teamIntraAssigned === myAssignedTeam.id)
    );
    const isD2AfternoonExtra = d2AfternoonPatient
      ? d2AfternoonPatient.teamExtraAssigned === myAssignedTeam.id
      : myAssignedTeam.id % 2 === 0;

    const sc2Procedures = d2AfternoonPatient
      ? isD2AfternoonExtra
        ? d2AfternoonPatient.procedureExtra.length > 0
          ? d2AfternoonPatient.procedureExtra
          : ['Cricotirotomia CRIC', 'Tourniquet TQ', 'Toracostomia con Decompressione']
        : d2AfternoonPatient.procedureIntra.length > 0
        ? d2AfternoonPatient.procedureIntra
        : ['Resuscitative Thoracotomy', 'REBOA Zone 1/3', 'Drenaggio Toracico Bulau']
      : isD2AfternoonExtra
      ? ['Cricotirotomia CRIC', 'Tourniquet TQ', 'Toracostomia con Decompressione']
      : ['Resuscitative Thoracotomy', 'REBOA Zone 1/3', 'Drenaggio Toracico Bulau'];

    const isSc2Evaluated = evaluations.some(
      (e) =>
        e.teamId === myAssignedTeam.id &&
        e.day === 2 &&
        e.period === 'pomeriggio'
    );

    const sc2: CourseScenarioTarget = {
      id: `scenario-d2-afternoon-team-${myAssignedTeam.id}`,
      scenarioIndex: 1,
      day: 2 as CourseDay,
      period: 'pomeriggio',
      phase: isD2AfternoonExtra ? 'EXTRA' : 'INTRA',
      scenarioCode: d2AfternoonPatient?.scenarioCode || (isD2AfternoonExtra ? 'Scenario Extra TCCC D2P' : 'Scenario Intra DEA D2P'),
      title: isD2AfternoonExtra
        ? `Giorno 2 Pomeriggio • Extra-Ospedaliero TCCC (${d2AfternoonPatient?.scenarioCode || 'Postazione Trauma'})`
        : `Giorno 2 Pomeriggio • Intra-Ospedaliero Shock Room (${d2AfternoonPatient?.scenarioCode || 'Shock Room DEA'})`,
      phaseLabel: isD2AfternoonExtra ? 'EXTRA-OSPEDALIERO • TCCC TATTICO' : 'INTRA-OSPEDALIERO • SHOCK ROOM DEA',
      timing: 'Giorno 2 • Pomeriggio (16:30)',
      location: isD2AfternoonExtra ? 'Postazione TCCC Extra' : 'Shock Room DEA',
      description: d2AfternoonPatient
        ? `Caso Clinico Paziente ${d2AfternoonPatient.id}: ${d2AfternoonPatient.lesioni.join(', ')}`
        : isD2AfternoonExtra
        ? 'Gestione del paziente traumatizzato grave sul terreno con estrazione rapida e controllo vie aeree.'
        : 'Rianimazione avanzata in Shock Room e Damage Control Resuscitation.',
      lesioni: d2AfternoonPatient?.lesioni || ['Trauma addominale penetrante', 'Frattura di bacino instabile', 'Shock refrattario'],
      procedures: sc2Procedures,
      moulageProtesi: d2AfternoonPatient?.moulageProtesi || 'Grave trauma addomino-pelvico con emoperitoneo',
      simulatori: d2AfternoonPatient?.simulatori || 'Simulatore ad alta fedeltà con monitoraggio multiparametrico',
      patientId: d2AfternoonPatient?.id || (300 + myAssignedTeam.id),
      isEvaluated: isSc2Evaluated,
    };

    // 3. Scenario Day 3 Notturno MCI (Triage Maxiemergenza 21:00)
    const isSc3Evaluated = evaluations.some(
      (e) =>
        e.teamId === myAssignedTeam.id &&
        (e.day === 3 && e.period === 'notturno' || e.phase === 'NIGHT' || e.scenarioCode === 'Scenario Notturno MCI')
    );

    const sc3: CourseScenarioTarget = {
      id: `scenario-d3-night-team-${myAssignedTeam.id}`,
      scenarioIndex: 2,
      day: 3 as CourseDay,
      period: 'notturno',
      phase: 'NIGHT',
      scenarioCode: 'Scenario Notturno MCI',
      title: 'Giorno 3 • Scenario Notturno Maxiemergenza (MCI)',
      phaseLabel: 'NOTTURNO MCI • TRIAGE & MAXIEMERGENZA',
      timing: 'Giorno 3 • Notturno (21:00)',
      location: 'Area Tattica Maxiemergenza Notturna',
      description:
        'Gestione incidente con feriti multipli in condizioni di visibilità ridotta, triage START/SALT, controllo emorragie massive e catena di comando.',
      lesioni: [
        'Ferite penetranti multiple da schegge ed esplosione',
        'Shock emorragico acuto con ipotermia secondaria',
        'Sindrome da schiacciamento e lesioni da detriti',
      ],
      procedures: [
        'Triage Tattico START',
        'Applicazione Tourniquet TQ multipli',
        'Bendaggio Compressivo Emostatico',
        'Decompressione Toracica con Ago ND',
        'Handover SBAR Maxiemergenza',
      ],
      moulageProtesi: 'Moulage emorragie zampillanti, fumo artificiale, protesi amputazioni',
      simulatori: 'Manichino trauma avanzato corpo intero + task trainers',
      patientId: 990 + myAssignedTeam.id,
      isEvaluated: isSc3Evaluated,
    };

    return [sc1, sc2, sc3];
  }, [myAssignedTeam.id, simulatorPatients, evaluations]);

  // Selected scenario in the 3-scenario board
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const activeScenario = myTeamScenarios[selectedScenarioIndex] || myTeamScenarios[0];

  // Helper to get existing evaluation for any scenario
  const getScenarioEvaluation = (sc: CourseScenarioTarget) => {
    return evaluations.find(
      (e) =>
        e.teamId === myAssignedTeam.id &&
        e.day === sc.day &&
        (e.period === sc.period || e.scenarioCode === sc.scenarioCode || e.phase === sc.phase)
    );
  };

  const existingEval = getScenarioEvaluation(activeScenario);

  // Form states for evaluation
  const [scores, setScores] = useState<TeamEvaluationScores>({
    abcdeApproach: existingEval?.scores.abcdeApproach || 4,
    technicalSkills: existingEval?.scores.technicalSkills || 4,
    teamworkLeadership: existingEval?.scores.teamworkLeadership || 4,
    handoverSbar: existingEval?.scores.handoverSbar || 4,
    safetyTiming: existingEval?.scores.safetyTiming || 4,
  });

  const [proceduresCompleted, setProceduresCompleted] = useState<string[]>(
    existingEval?.proceduresCompleted || []
  );
  const [strengths, setStrengths] = useState(existingEval?.strengths || '');
  const [criticalIssues, setCriticalIssues] = useState(existingEval?.criticalIssues || '');
  const [debriefingActionItems, setDebriefingActionItems] = useState(
    existingEval?.debriefingActionItems || ''
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Synchronize form when selected scenario changes or evaluations update
  useEffect(() => {
    const currentExistingEval = getScenarioEvaluation(activeScenario);
    if (currentExistingEval) {
      setScores(currentExistingEval.scores);
      setProceduresCompleted(currentExistingEval.proceduresCompleted || []);
      setStrengths(currentExistingEval.strengths || '');
      setCriticalIssues(currentExistingEval.criticalIssues || '');
      setDebriefingActionItems(currentExistingEval.debriefingActionItems || '');
    } else {
      setScores({
        abcdeApproach: 4,
        technicalSkills: 4,
        teamworkLeadership: 4,
        handoverSbar: 4,
        safetyTiming: 4,
      });
      setProceduresCompleted([]);
      setStrengths('');
      setCriticalIssues('');
      setDebriefingActionItems('');
    }
  }, [selectedScenarioIndex, myAssignedTeam.id, activeScenario, evaluations]);

  // Overall scenario evaluation statistics for this faculty's team
  const evaluatedScenariosCount = myTeamScenarios.filter((sc) => !!getScenarioEvaluation(sc)).length;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const allAvailableProcedures = activeScenario.procedures;

  const toggleProcedure = (proc: string) => {
    setProceduresCompleted((prev) =>
      prev.includes(proc) ? prev.filter((p) => p !== proc) : [...prev, proc]
    );
  };

  const handleScoreChange = (dimension: keyof TeamEvaluationScores, val: number) => {
    setScores((prev) => ({ ...prev, [dimension]: val }));
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFaculty) return;

    saveEvaluation({
      teamId: myAssignedTeam.id,
      facultyId: currentFaculty.id,
      day: activeScenario.day,
      period: activeScenario.period,
      patientId: activeScenario.patientId,
      scenarioCode: activeScenario.scenarioCode,
      phase: activeScenario.phase,
      scores,
      proceduresCompleted,
      strengths,
      criticalIssues,
      debriefingActionItems,
    });

    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3500);
  };

  // Quick presets for scores & procedures
  const handleQuickFillScores = (val: number) => {
    setScores({
      abcdeApproach: val,
      technicalSkills: val,
      teamworkLeadership: val,
      handoverSbar: val,
      safetyTiming: val,
    });
  };

  const handleQuickFillAndSubmitCurrentForm = (scoreVal: number = 5) => {
    if (!currentFaculty) return;
    const targetScores: TeamEvaluationScores = {
      abcdeApproach: scoreVal,
      technicalSkills: scoreVal,
      teamworkLeadership: scoreVal,
      handoverSbar: scoreVal,
      safetyTiming: scoreVal,
    };
    const defaultStrengths =
      'Esecuzione procedurale rapida e precisa. Team leader assertivo e ottima comunicazione Closed-Loop nel team.';
    const defaultCriticalIssues = 'Nessuna non-conformità critica riscontrata durante la simulazione.';
    const defaultActionItems = 'Competenze clinico-assistenziali convalidate positivamente nel debriefing.';

    setScores(targetScores);
    setProceduresCompleted(allAvailableProcedures);
    setStrengths(defaultStrengths);
    setCriticalIssues(defaultCriticalIssues);
    setDebriefingActionItems(defaultActionItems);

    saveEvaluation({
      teamId: myAssignedTeam.id,
      facultyId: currentFaculty.id,
      day: activeScenario.day,
      period: activeScenario.period,
      patientId: activeScenario.patientId,
      scenarioCode: activeScenario.scenarioCode,
      phase: activeScenario.phase,
      scores: targetScores,
      proceduresCompleted: allAvailableProcedures,
      strengths: defaultStrengths,
      criticalIssues: defaultCriticalIssues,
      debriefingActionItems: defaultActionItems,
    });

    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3500);
  };

  const handleSelectAllProcedures = () => {
    setProceduresCompleted(allAvailableProcedures);
  };

  const handleDeselectAllProcedures = () => {
    setProceduresCompleted([]);
  };

  // Team historical evaluations
  const teamHistoryEvals = evaluations.filter((e) => e.teamId === selectedTeam.id);

  // Unhandled messages count (for badge)
  const pendingMessagesCount = courseMessages.filter((m) => m.status === 'pending').length;

  const rubricDimensions: {
    key: keyof TeamEvaluationScores;
    title: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'abcdeApproach',
      title: 'Approccio Sistematico <C>ABCDE',
      description:
        'Valutazione primaria sequenziale, rapido riconoscimento delle minacce per la vita, controllo emorragie critiche prioritarie.',
      icon: <HeartPulse className="w-4 h-4 text-red-400" />,
    },
    {
      key: 'technicalSkills',
      title: 'Competenze Tecniche & Esecuzione Procedure',
      description:
        'Corretta esecuzione di cricotirotomia, toracostomia a dito, posizionamento TQ, REBOA, drenaggi ed emostasi.',
      icon: <Stethoscope className="w-4 h-4 text-blue-400" />,
    },
    {
      key: 'teamworkLeadership',
      title: 'Teamwork, Leadership & CRM',
      description:
        'Ruolo del team leader chiaro, comunicazione Closed-Loop, assertività costruttiva, gestione del sovraccarico cognitivo.',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: 'handoverSbar',
      title: 'Passaggio di Consegne & Struttura SBAR',
      description:
        'Trasferimento tempestivo, sintetico e strutturato (Situation, Background, Assessment, Recommendation) Extra -> Intra.',
      icon: <CheckCircle2 className="w-4 h-4 text-purple-400" />,
    },
    {
      key: 'safetyTiming',
      title: 'Sicurezza Operativa & Gestione Tempo',
      description:
        'Rispetto delle norme di sicurezza (DPI, autoprotezione), rispetto del timing di scenario e priorità di trasporto.',
      icon: <Clock className="w-4 h-4 text-amber-400" />,
    },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* Faculty View Header with Personal Profile */}
      <div className="bg-neutral-950 border-2 border-emerald-600/80 p-3 sm:p-4 shadow-xl space-y-2.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <GraduationCap className="w-3 h-3" />
                {isEn ? 'FACULTY & TUTOR HUB' : 'PORTALE FACULTY'}
              </span>
              <span className="text-[11px] text-neutral-300 font-mono font-bold px-2 py-0.5 bg-neutral-900 border border-neutral-700">
                DAY 0{activeDay} • {currentSlot.period.toUpperCase()}
              </span>
              {suspensionInfo.isSuspended && (
                <span className="bg-red-600 text-white font-black text-[11px] px-2 py-0.5 animate-pulse flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3" />
                  {isEn ? 'COURSE SUSPENDED' : 'CORSO SOSPESO'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight truncate leading-tight">
                {currentFaculty.name}
              </h2>
              <div className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5 flex-wrap">
                <span>{currentFaculty.specialty}</span>
                <span className="text-neutral-500">•</span>
                <span className="bg-emerald-950 text-emerald-200 px-2 py-0.5 border border-emerald-700 text-[11px] font-mono font-bold flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: myAssignedTeam.color }}
                  />
                  {isEn ? `Team ${myAssignedTeam.id} Tutor` : `Tutor Squadra ${myAssignedTeam.id}`}: {myAssignedTeam.name}
                </span>

                {/* Status indicator: 3 Scenarios progress */}
                {evaluatedScenariosCount === myTeamScenarios.length ? (
                  <span
                    id="faculty-feedback-completed-badge"
                    className="bg-emerald-900/90 text-emerald-200 px-2 py-0.5 font-black text-[10px] sm:text-[11px] uppercase flex items-center gap-1 border border-emerald-500 shadow-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>{isEn ? '3/3 SCENARIOS VALIDATED' : '3/3 SCENARI CONVALIDATI'}</span>
                  </span>
                ) : (
                  <span
                    id="faculty-feedback-pending-badge"
                    onClick={() => setActiveSubTab('evaluation')}
                    className="bg-amber-500 text-black px-2 py-0.5 font-black text-[10px] sm:text-[11px] uppercase flex items-center gap-1 shadow-xs border border-amber-300 cursor-pointer"
                    title={isEn ? 'Click to open scenario evaluation sheet' : 'Clicca per aprire la scheda di valutazione degli scenari pratici'}
                  >
                    <Clock className="w-3 h-3 text-black flex-shrink-0" />
                    <span>{isEn ? `${evaluatedScenariosCount}/3 SCENARIOS EVALUATED` : `${evaluatedScenariosCount}/3 SCENARI VALUTATI`}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions, Language Switcher & Faculty Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <LanguageSwitcher variant="badge" />

            {/* Mobile / Tablet Collapsible Menu Trigger */}
            <button
              id="faculty-mobile-drawer-toggle-btn"
              onClick={() => setIsSideDrawerOpen(true)}
              className="lg:hidden px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-emerald-300 hover:text-white border border-emerald-500 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs min-h-[36px]"
              aria-label={isEn ? 'Open Faculty Quick Nav' : 'Apri Menu Navigazione Rapida Faculty'}
            >
              <Menu className="w-3.5 h-3.5 text-emerald-400" />
              <span>MENU</span>
            </button>

            {faculty.length > 1 && (
              <div className="flex-1 sm:flex-initial hidden sm:block">
                <select
                  id="faculty-selector-dropdown"
                  value={selectedFacultyId || currentFaculty.id}
                  onChange={(e) => {
                    setSelectedFacultyId(e.target.value);
                    const fac = faculty.find((f) => f.id === e.target.value);
                    if (fac && fac.assignedTeamId) {
                      setActiveFacultyTeamId(fac.assignedTeamId);
                    }
                  }}
                  className="w-full sm:w-auto bg-neutral-900 border border-emerald-700 text-emerald-200 text-xs font-bold px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
                  aria-label={isEn ? 'Select Faculty Profile' : 'Seleziona Profilo Faculty'}
                >
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      Tutor: {f.name} ({isEn ? `Team ${f.assignedTeamId}` : `Sq. ${f.assignedTeamId}`})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              id="faculty-live-feedback-trigger-btn"
              onClick={() => setIsLiveFeedbackModalOpen(true)}
              className="flex-1 sm:flex-initial min-h-[36px] px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider border border-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              title="Invia feedback rapido in tempo reale con sincronizzazione immediata su Firebase"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{isEn ? 'LIVE FEEDBACK' : 'FEEDBACK LIVE'}</span>
            </button>

            <button
              id="faculty-send-message-btn"
              onClick={() => setIsMessengerOpen(true)}
              className="flex-1 sm:flex-initial min-h-[36px] px-2.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider border border-black transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
            >
              <Send className="w-3 h-3" />
              <span className="hidden xs:inline sm:inline">{isEn ? 'REPORT / ALERT' : 'SEGNALAZIONE'}</span>
              <span className="xs:hidden sm:hidden">{isEn ? 'COMMAND' : 'REGIA'}</span>
            </button>

            {userRole === 'direttore' && (
              <button
                id="faculty-broadcast-btn"
                onClick={() => setIsBroadcastOpen(true)}
                className="flex-1 sm:flex-initial min-h-[36px] px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider border border-white transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                title={isEn ? 'Send broadcast alert' : 'Invia allerta broadcast generale (Riservato Direzione)'}
              >
                <Radio className="w-3 h-3 animate-pulse" />
                <span>BROADCAST</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TUTOR & ASSIGNED SQUAD IDENTITY STRIP */}
      <div className="bg-neutral-950 border-2 border-neutral-800 p-3 sm:p-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Assigned Squad + Tutor Badge */}
          <div className="flex items-start sm:items-center gap-3">
            <div
              className="w-12 h-12 flex items-center justify-center font-black font-mono text-white text-base sm:text-lg border-2 shadow-lg flex-shrink-0"
              style={{ backgroundColor: myAssignedTeam.color, borderColor: 'rgba(255,255,255,0.4)' }}
            >
              Sq.{myAssignedTeam.id}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-sm sm:text-base text-white tracking-wider">
                  {isEn ? `TEAM ${myAssignedTeam.id}` : `SQUADRA ${myAssignedTeam.id}`}: {myAssignedTeam.name.toUpperCase()}
                </span>
                <span className={`text-[10px] px-2 py-0.5 font-mono font-bold uppercase ${GROUP_THEMES[myAssignedTeam.groupId as GroupType]?.badge || 'bg-neutral-800 text-white'}`}>
                  {isEn ? `GROUP ${myAssignedTeam.groupId}` : `GRUPPO ${myAssignedTeam.groupId}`}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold uppercase">
                  🔒 {isEn ? 'ASSIGNED SQUAD' : 'SQUADRA ASSEGNATA'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-300 flex-wrap">
                <span className="text-emerald-400 font-bold">Tutor: {currentFaculty.name}</span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400">{currentFaculty.specialty}</span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400">{teamDiscenti.length} {isEn ? 'Learners' : 'Discenti'}</span>
              </div>
            </div>
          </div>

          {/* Right: 3-Scenario Evaluation Progress */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 text-right">
              <div className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
                {isEn ? 'VALIDATED PRACTICAL SCENARIOS' : 'SCENARI PRATICI CONVALIDATI'}
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm font-black font-mono text-emerald-400">
                  {evaluatedScenariosCount} / 3 {isEn ? 'SCENARIOS' : 'SCENARI'}
                </span>
                {evaluatedScenariosCount === 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                )}
              </div>
            </div>

            {activeSubTab !== 'evaluation' && (
              <button
                type="button"
                id="faculty-go-to-eval-btn"
                onClick={() => setActiveSubTab('evaluation')}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider border border-white cursor-pointer transition-all flex items-center gap-1 shadow-md"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{isEn ? 'EVALUATE SCENARIOS' : 'VALUTA SCENARI'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Simplified, Fully Responsive Multi-Device Sub-Menu (2x2 Grid on Mobile, 4-Col Strip on Tablet/Desktop) */}
      <nav aria-label={isEn ? 'Faculty Menu' : 'Menu Sezioni Faculty'} className="bg-neutral-950 border-2 border-neutral-800 p-1.5 sm:p-2 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {/* Tab 1: Campo Operativo */}
          <button
            id="faculty-tab-field-btn"
            onClick={() => setActiveSubTab('field')}
            className={`min-h-[48px] p-2.5 sm:py-3 sm:px-4 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-2 sm:gap-1 cursor-pointer border ${
              activeSubTab === 'field'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-neutral-700'
            }`}
          >
            <Activity className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${activeSubTab === 'field' ? 'text-white' : 'text-emerald-400'}`} />
            <div className="min-w-0">
              <span className="font-black text-xs uppercase tracking-wider block truncate">
                {isEn ? 'OPERATIONS / MODULE' : 'CAMPO / MODULO'}
              </span>
              <span className={`text-[10px] hidden sm:block truncate ${activeSubTab === 'field' ? 'text-emerald-100' : 'text-neutral-500'}`}>
                {isEn ? 'Live Phase & Timer' : 'Fase & Timer Attivo'}
              </span>
            </div>
          </button>

          {/* Tab 2: Roster & Squadra */}
          <button
            id="faculty-tab-roster-btn"
            onClick={() => setActiveSubTab('my_roster')}
            className={`min-h-[48px] p-2.5 sm:py-3 sm:px-4 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-2 sm:gap-1 cursor-pointer border ${
              activeSubTab === 'my_roster'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-neutral-700'
            }`}
          >
            <Users className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${activeSubTab === 'my_roster' ? 'text-white' : 'text-cyan-400'}`} />
            <div className="min-w-0">
              <span className="font-black text-xs uppercase tracking-wider block truncate">
                {isEn ? 'TEAM & ROSTER' : 'SQUADRA & ROSTER'}
              </span>
              <span className={`text-[10px] hidden sm:block truncate ${activeSubTab === 'my_roster' ? 'text-emerald-100' : 'text-neutral-500'}`}>
                {teamDiscenti.length} {isEn ? 'Learners & Badges' : 'Discenti & Badges'}
              </span>
            </div>
          </button>

          {/* Tab 3: Valutazione Scenari (3 prove pratiche) */}
          <button
            id="faculty-tab-eval-btn"
            onClick={() => setActiveSubTab('evaluation')}
            className={`min-h-[48px] p-2.5 sm:py-3 sm:px-4 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-2 sm:gap-1 cursor-pointer border relative ${
              activeSubTab === 'evaluation'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-neutral-700'
            }`}
          >
            <div className="relative flex-shrink-0">
              <Award className={`w-4 h-4 sm:w-5 sm:h-5 ${activeSubTab === 'evaluation' ? 'text-white' : 'text-amber-400'}`} />
            </div>
            <div className="min-w-0 flex-1 sm:flex-initial">
              <div className="flex items-center justify-between sm:justify-center gap-1">
                <span className="font-black text-xs uppercase tracking-wider block truncate">
                  {isEn ? 'SCENARIO EVALUATIONS' : 'VALUTAZIONE SCENARI'}
                </span>
                <span className="bg-neutral-800 text-emerald-300 text-[9px] font-mono font-black px-1.5 py-0.2 border border-neutral-700 rounded-xs uppercase tracking-tighter">
                  {evaluatedScenariosCount}/3 OK
                </span>
              </div>
              <span className={`text-[10px] hidden sm:block truncate ${activeSubTab === 'evaluation' ? 'text-emerald-100' : 'text-neutral-500'}`}>
                {isEn ? `3 Practical Tests Team ${myAssignedTeam.id}` : `3 Prove Pratiche Sq. ${myAssignedTeam.id}`}
              </span>
            </div>
          </button>

          {/* Tab 4: Messaggi dal Campo */}
          <button
            id="faculty-tab-messages-btn"
            onClick={() => setActiveSubTab('messages')}
            className={`min-h-[48px] p-2.5 sm:py-3 sm:px-4 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-2 sm:gap-1 cursor-pointer border relative ${
              activeSubTab === 'messages'
                ? 'bg-orange-500 text-black border-orange-300 shadow-lg'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-neutral-700'
            }`}
          >
            <div className="relative flex-shrink-0">
              <MessageSquare className={`w-4 h-4 sm:w-5 sm:h-5 ${activeSubTab === 'messages' ? 'text-black' : 'text-orange-400'}`} />
              {pendingMessagesCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-mono font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {pendingMessagesCount}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 sm:flex-initial">
              <div className="flex items-center justify-between sm:justify-center gap-1">
                <span className="font-black text-xs uppercase tracking-wider block truncate">
                  {isEn ? 'MESSAGES' : 'MESSAGGI'}
                </span>
                {pendingMessagesCount > 0 && activeSubTab !== 'messages' && (
                  <span className="sm:hidden bg-red-600 text-white text-[9px] font-mono font-black px-1.5 py-0.2">
                    {pendingMessagesCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] hidden sm:block truncate ${activeSubTab === 'messages' ? 'text-neutral-900 font-bold' : 'text-neutral-500'}`}>
                {isEn ? 'Command & Station Channel' : 'Canale Regia / Postazioni'}
              </span>
            </div>
          </button>
        </div>
      </nav>

      {/* SUBTAB 1: FIELD OPERATIONS (MODULO ATTIVO) */}
      {activeSubTab === 'field' && (
        <div className="space-y-6">
          {/* Active Phase & Timer Card */}
          <div className="bg-neutral-900 border-2 border-neutral-800 p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest font-mono">
                    MODULO ATTIVO IN TEMPO REALE SUL CAMPO
                  </span>
                  <span className="bg-neutral-800 text-neutral-300 font-mono text-xs px-2 py-0.5">
                    {currentSlot.time}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  {currentSlot.title}
                </h3>
                <p className="text-xs text-neutral-300 font-semibold">
                  {currentSlot.description}
                </p>
              </div>

              <div className="bg-neutral-950 border-2 border-emerald-500 px-5 py-3 text-center flex-shrink-0">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block font-mono">
                  COUNTDOWN FASE
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                  {formatTimer(timerSeconds)}
                </span>
                <div className="text-[10px] font-bold text-neutral-400 mt-0.5">
                  {isTimerRunning ? '🟢 IN ESECUZIONE' : '⏸️ IN PAUSA'}
                </div>
              </div>
            </div>

            {/* Scenario Details for Assigned Team */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="bg-neutral-950 p-4 border-2 border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-400 uppercase tracking-wider">
                    SCENARIO PAZIENTE ASSEGNATO
                  </span>
                  <span className="font-mono text-xs text-white font-bold bg-neutral-900 px-2 py-0.5 border border-neutral-700">
                    COD: {relevantPatient.scenarioCode}
                  </span>
                </div>
                <h4 className="text-base font-black text-white">{relevantPatient.name}</h4>
                <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                  {relevantPatient.briefing}
                </p>

                <div className="pt-2 border-t border-neutral-800 text-xs font-mono flex items-center justify-between text-neutral-400">
                  <span>Ruolo Squadra: <strong className="text-white">{isExtraPhase ? 'EXTRA (TCCC)' : 'INTRA (Shock Room)'}</strong></span>
                  <span>Moulage: <strong className="text-cyan-300">{relevantPatient.moulageLevel}</strong></span>
                </div>
              </div>

              <div className="bg-neutral-950 p-4 border-2 border-neutral-800 space-y-2">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-wider block">
                  CHECKLIST MANOVRE ATTESE SUL CAMPO
                </span>
                <div className="space-y-1 text-xs">
                  {(isExtraPhase ? relevantPatient.procedureExtra : relevantPatient.procedureIntra).map((proc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-neutral-300 font-medium">
                      <div className="w-1.5 h-1.5 bg-emerald-400 flex-shrink-0" />
                      <span>{proc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: IL MIO ROSTER & SQUADRA */}
      {activeSubTab === 'my_roster' && (
        <div className="space-y-6">
          {/* My Profile & Badge Pass */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-neutral-900 border-2 border-emerald-600 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono">
                  PROFILO DOCENTE FACULTY
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 uppercase">
                  ATTIVO
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white uppercase">{currentFaculty.name}</h3>
                <p className="text-xs text-neutral-300 font-semibold">{currentFaculty.specialty}</p>
                <p className="text-xs text-neutral-400 font-mono">Affiliazione: {currentFaculty.affiliation}</p>
                <p className="text-xs text-neutral-400 font-mono">Contatto: {currentFaculty.email || 'faculty@trauma-sim.med'}</p>
              </div>

              <div className="flex justify-center pt-2 pb-2">
                <QRCodeDisplay
                  value={`https://trauma-sim.med/faculty?id=${currentFaculty.id}&badge=${currentFaculty.badgeCode || 'FAC-01'}`}
                  size={140}
                />
              </div>

              <div className="bg-neutral-950 p-2.5 border border-neutral-800 text-[11px] font-mono text-center text-neutral-300">
                BADGE DOCENTE: <strong>{currentFaculty.badgeCode || 'FAC-01'}</strong>
              </div>
            </div>

            {/* Assigned Squad Discenti List */}
            <div className="lg:col-span-2 bg-neutral-900 border-2 border-neutral-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest font-mono">
                    SQUADRA TUTORATA
                  </span>
                  <h3 className="text-lg font-black text-white uppercase">
                    {selectedTeam.name} ({selectedTeam.color}) • {teamDiscenti.length} Discenti
                  </h3>
                </div>
                <div className="bg-neutral-950 px-3 py-1 border border-neutral-800 text-xs font-mono text-cyan-300 font-bold">
                  GRUPPO {selectedTeam.groupId}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamDiscenti.map((disc) => (
                  <div
                    key={disc.id}
                    className="bg-neutral-950 p-3 border border-neutral-800 flex items-start justify-between gap-3 hover:border-emerald-500/60 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                        <h4 className="text-xs font-black text-white uppercase truncate">{disc.name}</h4>
                      </div>
                      <p className="text-[11px] text-neutral-400">{disc.specialty || disc.role}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">Badge: {disc.badgeCode || 'DISC-01'}</p>
                    </div>

                    <div className="flex-shrink-0">
                      <QRCodeDisplay
                        value={`https://trauma-sim.med/discente?id=${disc.id}&badge=${disc.badgeCode || 'DISC-01'}`}
                        size={48}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: EVALUATION & SCORING */}
      {activeSubTab === 'evaluation' && (
        <div className="space-y-4">
          {/* Sub-mode switcher */}
          <div className="bg-neutral-950 border-2 border-neutral-800 p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                id="faculty-eval-mode-live-btn"
                onClick={() => setEvalSubMode('live_form')}
                className={`px-4 py-2 text-xs font-mono font-black uppercase transition-all cursor-pointer border flex items-center gap-2 ${
                  evalSubMode === 'live_form'
                    ? 'bg-emerald-600 text-white border-white shadow-md'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>{isEn ? 'REAL-TIME FEEDBACK FORM (FIRESTORE LIVE)' : 'MODULO FEEDBACK TEMPO REALE (FIRESTORE LIVE)'}</span>
              </button>

              <button
                type="button"
                id="faculty-eval-mode-detailed-btn"
                onClick={() => setEvalSubMode('detailed_board')}
                className={`px-4 py-2 text-xs font-mono font-black uppercase transition-all cursor-pointer border flex items-center gap-2 ${
                  evalSubMode === 'detailed_board'
                    ? 'bg-emerald-600 text-white border-white shadow-md'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{isEn ? '3-SCENARIO DETAILED RUBRIC' : 'SCHEDA 3 SCENARI TUTOR'}</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-neutral-400 px-2 py-1">
              Squadra: <strong className="text-emerald-400">Sq. {myAssignedTeam.id}</strong> ({myAssignedTeam.name})
            </div>
          </div>

          {evalSubMode === 'live_form' ? (
            <FacultyLiveFeedbackForm />
          ) : (
            <form onSubmit={handleSubmitEvaluation} className="space-y-6">
              {saveSuccessMsg && (
                <div className="p-4 bg-emerald-950 border-2 border-emerald-500 text-emerald-200 flex items-center gap-3 text-xs font-bold animate-in fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Valutazione dello scenario pratico salvata e sincronizzata con successo!</span>
                </div>
              )}

          {/* TUTOR EXCLUSIVE EVALUATION OF ASSIGNED SQUAD SCENARIOS */}
          <div className="bg-neutral-950 border-2 border-emerald-600 p-4 sm:p-5 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 text-white font-black flex items-center justify-center border border-emerald-400 flex-shrink-0 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-white uppercase font-mono tracking-wider">
                      VALUTAZIONE ESCLUSIVA SCENARI PRATICI SQUADRA {myAssignedTeam.id}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500 text-[10px] font-mono font-bold uppercase">
                      TUTOR ASSEGNATO
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    Ogni tutor è responsabile della valutazione della propria squadra <strong>({myAssignedTeam.name})</strong> solo ed esclusivamente per i <strong>3 scenari pratici di simulazione</strong> dei due giorni. Le valutazioni per i workshop teorici/skills sono disattivate.
                  </p>
                </div>
              </div>

              {/* Assigned Tutor & Team Identity Badge */}
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 px-3 py-2 flex-shrink-0">
                <User className="w-4 h-4 text-emerald-400" />
                <div className="text-right">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase block font-bold">
                    TUTOR: {currentFaculty.name}
                  </span>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-xs font-black text-white">
                      Sq. {myAssignedTeam.id} ({myAssignedTeam.name})
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: myAssignedTeam.color }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3 SCENARIO CARDS SELECTOR */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-300">
                <span className="text-[11px] uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  SELEZIONA SCENARIO DA VALUTARE (3 PROVE PRATICHE):
                </span>
                <span className="text-neutral-400">
                  {evaluatedScenariosCount} di {myTeamScenarios.length} Scenari Convalidati
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {myTeamScenarios.map((scen, idx) => {
                  const isSelected = selectedScenarioIndex === idx;
                  const isDone = scen.isEvaluated;

                  return (
                    <button
                      key={scen.id}
                      type="button"
                      onClick={() => setSelectedScenarioIndex(idx)}
                      className={`p-3.5 text-left border-2 transition-all cursor-pointer relative flex flex-col justify-between gap-2 shadow-md ${
                        isSelected
                          ? 'bg-neutral-900 border-white ring-2 ring-emerald-400'
                          : isDone
                          ? 'bg-neutral-950 border-emerald-800/80 hover:border-emerald-600'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[10px] font-mono font-black uppercase text-amber-400 bg-amber-950/70 border border-amber-800/80 px-1.5 py-0.5">
                            {scen.timing}
                          </span>
                          {isDone ? (
                            <span className="bg-emerald-950 text-emerald-300 border border-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              VALUTATO
                            </span>
                          ) : (
                            <span className="bg-amber-500 text-black px-2 py-0.5 text-[9px] font-black uppercase flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3 text-black" />
                              DA VALUTARE
                            </span>
                          )}
                        </div>

                        <div className="font-black text-xs sm:text-sm text-white uppercase tracking-tight line-clamp-2">
                          {scen.title}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                        <span className="truncate max-w-[120px]">{scen.location}</span>
                        <span className="text-emerald-400 font-bold">Pz #{scen.patientId}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ACTIVE SCENARIO EVALUATION FORM */}
          <div className="bg-neutral-900 border-2 border-neutral-800 p-5 sm:p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-500" />
                    <span>SCHEDA SCENARIO: {activeScenario.title}</span>
                  </h3>
                  <span className="bg-emerald-950 text-emerald-200 border border-emerald-700 px-2 py-0.5 text-xs font-mono font-bold">
                    Sq. {myAssignedTeam.id}
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  {activeScenario.timing} • Paziente #{activeScenario.patientId} • Scala 1 (Critico) a 5 (Eccellente)
                </span>
              </div>

              {/* Fast Preset Controls in Header */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Punteggio Rapido:</span>
                <button
                  type="button"
                  id="faculty-score-preset-5-btn"
                  onClick={() => handleQuickFillScores(5)}
                  className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600 text-[11px] font-mono font-black uppercase cursor-pointer flex items-center gap-1 transition-colors"
                  title="Imposta tutti i 5 criteri di valutazione a 5 (Eccellente)"
                >
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Tutti 5</span>
                </button>
                <button
                  type="button"
                  id="faculty-score-preset-4-btn"
                  onClick={() => handleQuickFillScores(4)}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 text-[11px] font-mono font-black uppercase cursor-pointer flex items-center gap-1 transition-colors"
                  title="Imposta tutti i 5 criteri di valutazione a 4 (Adeguato/Competente)"
                >
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Tutti 4</span>
                </button>

                <button
                  type="button"
                  id="faculty-form-quick-complete-btn"
                  onClick={() => handleQuickFillAndSubmitCurrentForm(5)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider border border-white shadow-md cursor-pointer flex items-center gap-1 transition-all"
                  title="Compila all'istante con 5/5, spunta tutte le procedure e salva subito la valutazione per questo scenario"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>COMPLETA RAPIDO (5/5)</span>
                </button>
              </div>
            </div>

            {/* Dimensions Scoring */}
            <div className="space-y-4">
              {rubricDimensions.map((dim) => (
                <div
                  key={dim.key}
                  className="bg-neutral-950 p-4 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1 md:max-w-xl">
                    <div className="flex items-center gap-2">
                      {dim.icon}
                      <h4 className="text-sm font-black text-white uppercase">{dim.title}</h4>
                    </div>
                    <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                      {dim.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-end md:self-center flex-shrink-0 pt-1 sm:pt-0">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleScoreChange(dim.key, val)}
                        className={`w-10 h-10 sm:w-11 sm:h-11 font-black text-sm transition-all cursor-pointer border ${
                          scores[dim.key] === val
                            ? 'bg-emerald-600 text-white border-white shadow-md scale-105 ring-2 ring-emerald-400'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white hover:border-neutral-500'
                        }`}
                        aria-label={`Punteggio ${val} per ${dim.title}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Checklist of Procedures with Select All / Deselect All */}
            <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
                <h4 className="text-xs font-black text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-orange-400" />
                  <span>PROCEDURE EFFETTUATE CORRETTAMENTE DALLA SQUADRA ({proceduresCompleted.length}/{allAvailableProcedures.length})</span>
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="faculty-select-all-procedures-btn"
                    onClick={handleSelectAllProcedures}
                    className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    ✓ Seleziona Tutte
                  </button>
                  <span className="text-neutral-600">|</span>
                  <button
                    type="button"
                    id="faculty-deselect-all-procedures-btn"
                    onClick={handleDeselectAllProcedures}
                    className="text-[10px] font-mono font-bold text-neutral-400 hover:text-white underline cursor-pointer"
                  >
                    Deseleziona
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {allAvailableProcedures.map((proc, idx) => {
                  const isDone = proceduresCompleted.includes(proc);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleProcedure(proc)}
                      className={`p-2.5 text-xs text-left font-bold border transition-colors flex items-center gap-2 cursor-pointer ${
                        isDone
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-850'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 border flex items-center justify-center ${
                          isDone ? 'bg-emerald-600 border-white text-white' : 'border-neutral-700'
                        }`}
                      >
                        {isDone && <CheckCircle className="w-3 h-3" />}
                      </div>
                      <span className="truncate">{proc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Debriefing Notes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-emerald-400 uppercase mb-1">
                  PUNTI DI FORZA (STRENGTHS):
                </label>
                <textarea
                  rows={3}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Ottima comunicazione, leadership chiara, tempestività TQ..."
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-emerald-500 p-2.5 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-amber-400 uppercase mb-1">
                  CRITICITÀ & GAPS TECNICI:
                </label>
                <textarea
                  rows={3}
                  value={criticalIssues}
                  onChange={(e) => setCriticalIssues(e.target.value)}
                  placeholder="Ritardo nel passaggio SBAR, mancata rivalutazione polsi..."
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-emerald-500 p-2.5 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-cyan-400 uppercase mb-1">
                  ACTION ITEMS PER IL DEBRIEFING:
                </label>
                <textarea
                  rows={3}
                  value={debriefingActionItems}
                  onChange={(e) => setDebriefingActionItems(e.target.value)}
                  placeholder="Rivedere algoritmo C-ABCDE con focus su ventilazione e REBOA..."
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-emerald-500 p-2.5 text-xs text-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Save Buttons Row with Quick Complete */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="faculty-footer-mark-completed-btn"
                  onClick={() => handleQuickFillAndSubmitCurrentForm(5)}
                  className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 hover:text-emerald-300 font-black text-xs uppercase tracking-wider border border-emerald-600/70 transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <span>MARK COMPLETED (5/5 RAPIDO)</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="submit"
                  id="faculty-submit-eval-form-btn"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest border-2 border-white shadow-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>SALVA VALUTAZIONE SCENARIO ({activeScenario.title})</span>
                </button>
              </div>
            </div>
          </div>
        </form>
          )}
        </div>
      )}

      {/* SUBTAB 4: MESSAGGI DAL CAMPO (RISERVATO REGIA & FACULTY) */}
      {activeSubTab === 'messages' && (
        <CourseMessagesPanel
          onOpenBroadcast={userRole === 'direttore' ? () => setIsBroadcastOpen(true) : undefined}
          onOpenMessenger={() => setIsMessengerOpen(true)}
        />
      )}

      {/* Real-time Live Feedback Modal Overlay */}
      {isLiveFeedbackModalOpen && (
        <div
          id="faculty-live-feedback-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in"
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-2 border-emerald-500 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between p-3 bg-neutral-950 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="font-mono font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                  INVIO FEEDBACK & SCORING CLINICO REAL-TIME
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLiveFeedbackModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 cursor-pointer transition-colors"
                aria-label="Chiudi finestra feedback"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 sm:p-4">
              <FacultyLiveFeedbackForm
                onSuccess={() => {
                  setTimeout(() => {
                    setIsLiveFeedbackModalOpen(false);
                  }, 1500);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Messenger Modal */}
      <CourseMessengerModal
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
        defaultStation={assignedFaculty.assignedStation || `Tutor Sq. ${myAssignedTeam.id}`}
        defaultSubject="Nota Faculty per Regia"
      />

      {/* Broadcast Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        activeDay={activeDay}
        currentSlot={currentSlot}
      />

      {/* Floating Notification Toast */}
      {bulkNotification && (
        <div
          id="faculty-bulk-toast"
          className="fixed bottom-6 right-6 z-50 bg-emerald-950 border-2 border-emerald-400 text-emerald-100 p-4 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200 max-w-md"
        >
          <div className="w-8 h-8 bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold border border-white">
            <CheckCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black uppercase text-white">
              {bulkNotification.title}
            </div>
            <div className="text-[11px] text-emerald-200">
              {bulkNotification.count} {bulkNotification.count === 1 ? 'scheda scenario archiviata' : 'schede scenario archiviate'} con successo.
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Responsive Side Drawer for Mobile & Tablet */}
      {isSideDrawerOpen && (
        <div
          id="faculty-side-drawer-container"
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Pannello Navigazione Rapida Faculty"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsSideDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-neutral-950 border-l-4 border-emerald-500 h-full flex flex-col shadow-2xl z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 bg-neutral-900 border-b-2 border-neutral-800 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600/20 border border-emerald-500/50 text-emerald-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">PORTALE FACULTY</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                      TUTOR SQ. {myAssignedTeam.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-mono font-semibold truncate">
                    {currentFaculty.name} ({currentFaculty.specialty})
                  </p>
                </div>
              </div>
              <button
                id="faculty-drawer-close-btn"
                onClick={() => setIsSideDrawerOpen(false)}
                className="p-2 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 cursor-pointer transition-colors"
                aria-label="Chiudi menu navigazione"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-5 flex-1">
              {/* Assigned Squad Focus Card */}
              <div
                id="faculty-drawer-active-focus-card"
                className="p-3.5 bg-neutral-900/90 border-2 border-emerald-500 border-l-4 space-y-2.5 shadow-lg"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    SQUADRA ASSEGNATA:
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    TUTOR TITOLARE
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: myAssignedTeam.color }}
                      />
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">
                        Squadra {myAssignedTeam.id}: {myAssignedTeam.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      Gruppo {myAssignedTeam.groupId} • {teamDiscenti.length} Discenti assegnati
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-950 p-2 border border-neutral-800 text-[11px] flex items-center justify-between">
                  <span className="text-neutral-400 font-bold uppercase">Scenari Convalidati:</span>
                  <span className="font-mono font-black text-emerald-400">
                    {evaluatedScenariosCount} / {myTeamScenarios.length}
                  </span>
                </div>
              </div>

              {/* Primary Navigation SubTabs */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block px-1">
                  SEZIONI DI LAVORO
                </span>

                <button
                  id="faculty-drawer-tab-field"
                  onClick={() => {
                    setActiveSubTab('field');
                    setIsSideDrawerOpen(false);
                  }}
                  className={`w-full p-3 flex items-center justify-between border cursor-pointer transition-all text-left ${
                    activeSubTab === 'field'
                      ? 'bg-emerald-600 text-white border-emerald-400 font-black shadow-md'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Activity className={`w-5 h-5 flex-shrink-0 ${activeSubTab === 'field' ? 'text-white' : 'text-emerald-400'}`} />
                    <div>
                      <span className="text-xs uppercase tracking-wider block font-black">CAMPO / MODULO OPERATIVO</span>
                      <span className={`text-[10px] block ${activeSubTab === 'field' ? 'text-emerald-100' : 'text-neutral-500'}`}>
                        Fase attiva, scenario e cronometro
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                </button>

                <button
                  id="faculty-drawer-tab-roster"
                  onClick={() => {
                    setActiveSubTab('my_roster');
                    setIsSideDrawerOpen(false);
                  }}
                  className={`w-full p-3 flex items-center justify-between border cursor-pointer transition-all text-left ${
                    activeSubTab === 'my_roster'
                      ? 'bg-emerald-600 text-white border-emerald-400 font-black shadow-md'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className={`w-5 h-5 flex-shrink-0 ${activeSubTab === 'my_roster' ? 'text-white' : 'text-cyan-400'}`} />
                    <div>
                      <span className="text-xs uppercase tracking-wider block font-black">SQUADRA & ROSTER DISCENTI</span>
                      <span className={`text-[10px] block ${activeSubTab === 'my_roster' ? 'text-emerald-100' : 'text-neutral-500'}`}>
                        Squadra {myAssignedTeam.name} ({teamDiscenti.length} discenti)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                </button>

                <button
                  id="faculty-drawer-tab-evaluation"
                  onClick={() => {
                    setActiveSubTab('evaluation');
                    setIsSideDrawerOpen(false);
                  }}
                  className={`w-full p-3 flex items-center justify-between border cursor-pointer transition-all text-left ${
                    activeSubTab === 'evaluation'
                      ? 'bg-emerald-600 text-white border-emerald-400 font-black shadow-md'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award className={`w-5 h-5 flex-shrink-0 ${activeSubTab === 'evaluation' ? 'text-white' : 'text-amber-400'}`} />
                    <div>
                      <span className="text-xs uppercase tracking-wider block font-black">VALUTAZIONE SCENARI PRATICI</span>
                      <span className={`text-[10px] block ${activeSubTab === 'evaluation' ? 'text-emerald-100' : 'text-neutral-500'}`}>
                        3 Scenari per la Squadra {myAssignedTeam.id}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                </button>

                <button
                  id="faculty-drawer-tab-messages"
                  onClick={() => {
                    setActiveSubTab('messages');
                    setIsSideDrawerOpen(false);
                  }}
                  className={`w-full p-3 flex items-center justify-between border cursor-pointer transition-all text-left relative ${
                    activeSubTab === 'messages'
                      ? 'bg-orange-500 text-black border-orange-300 font-black shadow-md'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className={`w-5 h-5 flex-shrink-0 ${activeSubTab === 'messages' ? 'text-black' : 'text-orange-400'}`} />
                    <div>
                      <span className="text-xs uppercase tracking-wider block font-black">MESSAGGI & COMUNICAZIONI</span>
                      <span className={`text-[10px] block ${activeSubTab === 'messages' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                        Canale diretto Regia e notifiche
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingMessagesCount > 0 && (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        {pendingMessagesCount}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  </div>
                </button>
              </div>

              {/* 3 Practical Scenarios Fast List for Assigned Team */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block px-1">
                  SCENARI PRATICI SQUADRA {myAssignedTeam.id}
                </span>

                <div className="space-y-1.5">
                  {myTeamScenarios.map((scen, idx) => (
                    <button
                      key={scen.id}
                      onClick={() => {
                        setSelectedScenarioIndex(idx);
                        setActiveSubTab('evaluation');
                        setIsSideDrawerOpen(false);
                      }}
                      className={`w-full p-2.5 text-left border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        selectedScenarioIndex === idx && activeSubTab === 'evaluation'
                          ? 'bg-neutral-900 border-white ring-1 ring-emerald-400'
                          : 'bg-neutral-900/80 border-neutral-800 hover:bg-neutral-850 hover:text-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-amber-400 font-bold uppercase truncate">
                          {scen.timing}
                        </div>
                        <div className="text-xs font-black text-white uppercase truncate">
                          {scen.title}
                        </div>
                      </div>
                      {scen.isEvaluated ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Faculty Profile Switcher */}
              {faculty.length > 1 && (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                      PROFILO TUTOR FACULTY
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {faculty.length} Tutor Registrati
                    </span>
                  </div>
                  <select
                    value={selectedFacultyId || currentFaculty.id}
                    onChange={(e) => {
                      setSelectedFacultyId(e.target.value);
                      const fac = faculty.find((f) => f.id === e.target.value);
                      if (fac && fac.assignedTeamId) {
                        setActiveFacultyTeamId(fac.assignedTeamId);
                      }
                    }}
                    className="w-full bg-neutral-900 border-2 border-emerald-700 text-emerald-200 text-xs font-bold px-3 py-2.5 focus:outline-hidden cursor-pointer"
                  >
                    {faculty.map((f) => {
                      const fTeam = teams.find((t) => t.id === f.assignedTeamId);
                      return (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.specialty}) • Sq. {f.assignedTeamId} {fTeam ? `[Grp ${fTeam.groupId}]` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Quick Action Triggers */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block px-1">
                  AZIONI RAPIDE DIRETTE
                </span>
                <div className={userRole === 'direttore' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}>
                  <button
                    onClick={() => {
                      setIsMessengerOpen(true);
                      setIsSideDrawerOpen(false);
                    }}
                    className="p-3 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-black cursor-pointer shadow-md transition-colors w-full"
                  >
                    <Send className="w-4 h-4" />
                    <span>INVIA SEGNALAZIONE ALLA REGIA</span>
                  </button>
                  {userRole === 'direttore' && (
                    <button
                      onClick={() => {
                        setIsBroadcastOpen(true);
                        setIsSideDrawerOpen(false);
                      }}
                      className="p-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white cursor-pointer shadow-md transition-colors w-full"
                      title="Invia allerta broadcast generale (Riservato Direzione)"
                    >
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span>BROADCAST ALL</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
