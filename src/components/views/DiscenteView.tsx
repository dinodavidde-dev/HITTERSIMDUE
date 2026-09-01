import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useCourse } from '../../context/CourseContext';
import { motion } from 'motion/react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  Bell,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Flame,
  GraduationCap,
  HeartPulse,
  Info,
  MapPin,
  MessageSquare,
  Moon,
  Phone,
  QrCode,
  Radio,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Smartphone,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { GroupType, ActivityType, Discente, CourseDay, SessionPeriod } from '../../types';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { translateRoleOrSpecialty } from '../../i18n/medicalTerms';
import { CourseTimelineLegend } from '../regia/CourseTimelineLegend';
import { LanguageSwitcher } from '../LanguageSwitcher';

type DiscenteSubTab = 'team' | 'agenda' | 'feedback' | 'broadcast' | 'qrpass';

export const DiscenteView: React.FC = () => {
  const {
    language,
    t,
    activeDay,
    setActiveDay,
    currentSlot,
    filteredSlots,
    activeSlotIndex,
    timerSeconds,
    isTimerRunning,
    teams,
    discenti,
    faculty,
    evaluations,
    broadcastAlerts,
    sendCourseMessage,
    selectedDiscenteId,
    setSelectedDiscenteId,
    updateDiscente,
  } = useCourse();

  const isEn = language === 'en';

  // Active Submenu tab for mobile
  const [activeSubTab, setActiveSubTab] = useState<DiscenteSubTab>('agenda');
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<number | 'ALL'>('ALL');

  // Forced Landscape Warning State for Mobile Discente screens
  const [dismissLandscapeWarning, setDismissLandscapeWarning] = useState(false);
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      setIsPortraitMobile(isMobile && isPortrait);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  
  // Custom message to faculty/director state
  const [sosMessage, setSosMessage] = useState('');
  const [sosType, setSosType] = useState<'info' | 'warning' | 'emergency'>('warning');
  const [sosSentSuccess, setSosSentSuccess] = useState(false);

  // Helper to get breakdown of teams in Extra vs Intra for any scenario slot
  const getScenarioTeamsBreakdown = (slot: typeof currentSlot, group: GroupType) => {
    const activity = slot?.groupActivities?.[group];
    const partnerGroup = activity?.partnerGroup;

    const extraTeams: typeof teams = [];
    const intraTeams: typeof teams = [];

    // Identify which groups are extra and which are intra in this scenario pairing
    const candidateGroups = new Set<GroupType>();
    candidateGroups.add(group);
    if (partnerGroup) candidateGroups.add(partnerGroup);

    candidateGroups.forEach((grp) => {
      const act = slot?.groupActivities?.[grp];
      const grpTeams = teams.filter((t) => t.groupId === grp);
      if (act?.activityType === 'scenario_extra' || act?.activityType === 'night_scenario') {
        extraTeams.push(...grpTeams);
      } else if (act?.activityType === 'scenario_intra') {
        intraTeams.push(...grpTeams);
      } else {
        // Debriefing or unspecified: evaluate based on partner
        if (activity?.activityType === 'scenario_extra') {
          if (grp === group) extraTeams.push(...grpTeams);
          else intraTeams.push(...grpTeams);
        } else {
          if (grp === group) intraTeams.push(...grpTeams);
          else extraTeams.push(...grpTeams);
        }
      }
    });

    return {
      extraTeams,
      intraTeams,
      allTeams: [...extraTeams, ...intraTeams],
    };
  };

  // Currently selected discente
  const currentDiscente = discenti.find((d) => d.id === selectedDiscenteId) || discenti[0] || {
    id: 'disc-1',
    name: isEn ? 'Unassigned Learner' : 'Discente Non Selezionato',
    role: 'Team Leader',
    teamId: 1,
    nationality: 'Italiana',
  };

  // Associated Team & Faculty
  const currentTeam = teams.find((t) => t.id === currentDiscente.teamId) || teams[0];
  const assignedFaculty = faculty.find((f) => f.assignedTeamId === currentTeam.id) || faculty[0];
  const teammates = discenti.filter((d) => d.teamId === currentTeam.id);

  // Browser Notifications support
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const lastNotifiedRef = useRef<{ slotId?: string; seconds?: number }>({});

  const showSafeNotification = (title: string, options?: NotificationOptions) => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      if (typeof window.Notification === 'function') {
        new (window.Notification as any)(title, options);
      }
    } catch (err) {
      console.warn('Browser notifications restricted or illegal constructor in this environment:', err);
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        showSafeNotification(isEn ? 'TraumaSim Direct' : 'TraumaSim Direct', {
          body: isEn ? 'Browser notifications enabled successfully!' : 'Notifiche browser abilitate con successo!',
        });
      }
    } catch (e) {
      console.error('Error requesting notification permission:', e);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }
    if (!currentSlot) return;

    const scenarioBreakdown = getScenarioTeamsBreakdown(currentSlot, currentTeam.groupId as GroupType);
    const isUserTeamExtra = scenarioBreakdown.extraTeams.some((t) => t.id === currentTeam.id);
    const isUserTeamIntra = scenarioBreakdown.intraTeams.some((t) => t.id === currentTeam.id);

    if (timerSeconds === 900 && lastNotifiedRef.current.slotId !== `${currentSlot.id}-900`) {
      lastNotifiedRef.current = { slotId: `${currentSlot.id}-900`, seconds: 900 };
      if (isUserTeamExtra) {
        showSafeNotification(isEn ? '15 Min Warning - TCCC' : 'Avviso 15 Min - TCCC', {
          body: isEn
            ? `Team ${currentTeam.name}: Prepare equipment and personnel for extra-hospital TCCC scenario.`
            : `Squadra ${currentTeam.name}: Preparare attrezzature e personale per lo scenario TCCC extra-ospedaliero.`,
        });
      } else if (isUserTeamIntra) {
        showSafeNotification(isEn ? '15 Min Warning - Shock Room' : 'Avviso 15 Min - Shock Room', {
          body: isEn
            ? `Team ${currentTeam.name}: Proceed immediately to the Shock Room.`
            : `Squadra ${currentTeam.name}: Raggiungere tempestivamente la Shock Room.`,
        });
      }
    }

    if (timerSeconds === 0 && lastNotifiedRef.current.slotId !== `${currentSlot.id}-0`) {
      lastNotifiedRef.current = { slotId: `${currentSlot.id}-0`, seconds: 0 };
      showSafeNotification(isEn ? 'Scenario Starting!' : 'Inizio Scenario in Corso!', {
        body: isEn
          ? `Team ${currentTeam.name}: Your scenario "${currentSlot.title}" is starting now!`
          : `Squadra ${currentTeam.name}: Il vostro scenario "${currentSlot.title}" è iniziato ora!`,
      });
    }
  }, [timerSeconds, currentSlot, currentTeam]);

  // Filter for schedule in agenda tab
  const [agendaDay, setAgendaDay] = useState<CourseDay>(activeDay);
  const [agendaPeriod, setAgendaPeriod] = useState<SessionPeriod | 'ALL'>('ALL');

  // Helper to determine if an activity is a scenario or workshop
  const isScenarioActivity = (type?: ActivityType) => {
    return (
      type === 'scenario_extra' ||
      type === 'scenario_intra' ||
      type === 'debriefing' ||
      type === 'night_scenario'
    );
  };

  const isWorkshopActivity = (type?: ActivityType) => {
    return type === 'workshop' || type === 'skills';
  };

  // Helper for real-time team status badge ('Active', 'On Break', 'Rotating')
  const getTeamStatus = (groupId: GroupType) => {
    const act = currentSlot?.groupActivities?.[groupId];
    if (!act) return { status: 'active', labelEn: 'Active', labelIt: 'Attiva', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' };
    const type = act.activityType;
    if (type === 'pause') {
      return { status: 'break', labelEn: 'On Break', labelIt: 'In Pausa', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' };
    }
    if (type === 'scenario_extra' || type === 'scenario_intra' || type === 'workshop' || type === 'skills' || type === 'night_scenario') {
      return { status: 'active', labelEn: 'Active', labelIt: 'Attiva', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' };
    }
    return { status: 'rotating', labelEn: 'Rotating', labelIt: 'In Rotazione', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' };
  };

  const renderTeamStatusBadge = (groupId: GroupType) => {
    const statusInfo = getTeamStatus(groupId);
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-current" />
        {isEn ? statusInfo.labelEn : statusInfo.labelIt}
      </span>
    );
  };

  // Helper to get participating teams for a workshop slot
  const getWorkshopTeams = (slot: typeof currentSlot, group: GroupType) => {
    const workshopGroups = (['A', 'B', 'C', 'D'] as GroupType[]).filter((g) => {
      const act = slot?.groupActivities?.[g];
      return act && isWorkshopActivity(act.activityType);
    });

    // Fallback if not found
    if (workshopGroups.length === 0) {
      workshopGroups.push(group);
    }

    return teams.filter((t) => workshopGroups.includes(t.groupId));
  };

  // Team Evaluations for this team
  const teamEvaluations = evaluations.filter((e) => e.teamId === currentTeam.id);
  const latestEvaluation = teamEvaluations[teamEvaluations.length - 1];

  // Filtered broadcast alerts for this discente's group or ALL
  const myBroadcastAlerts = broadcastAlerts.filter(
    (a) =>
      a.targetGroups.includes('ALL') ||
      a.targetGroups.includes(currentTeam.groupId as GroupType)
  );

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Format activity badge helper
  const getActivityBadge = (type: ActivityType) => {
    switch (type) {
      case 'scenario_extra':
        return {
          label: 'SCENARIO EXTRA (TCCC)',
          color: 'bg-red-600 text-white font-black',
          icon: <Activity className="w-4 h-4 text-white" />,
        };
      case 'scenario_intra':
        return {
          label: 'DEBRIEFING POST SCENARIO',
          color: 'bg-neutral-100 text-black font-black',
          icon: <Stethoscope className="w-4 h-4 text-black" />,
        };
      case 'workshop':
        return {
          label: 'WORKSHOP TCCC MILITARY',
          color: 'bg-orange-500 text-black font-black',
          icon: <Users className="w-4 h-4 text-black" />,
        };
      case 'skills':
        return {
          label: 'SKILLS & PROCEDURAL LAB',
          color: 'bg-neutral-800 text-neutral-100 border border-neutral-600 font-black',
          icon: <Wrench className="w-4 h-4 text-orange-400" />,
        };
      case 'debriefing':
        return {
          label: 'HANDOVER SBAR & DEBRIEFING',
          color: 'bg-neutral-200 text-black font-black',
          icon: <Info className="w-4 h-4 text-black" />,
        };
      case 'night_scenario':
        return {
          label: 'NIGHT SCENARIO (MCI 21:00)',
          color: 'bg-orange-500 text-black font-black',
          icon: <Moon className="w-4 h-4 text-black" />,
        };
      case 'pause':
      default:
        return {
          label: 'PAUSA / LOGISTICA',
          color: 'bg-neutral-800 text-neutral-300 font-bold',
          icon: <Clock className="w-4 h-4 text-neutral-300" />,
        };
    }
  };

  // Current activity for my group
  const myCurrentActivity = currentSlot?.groupActivities?.[currentTeam.groupId as GroupType];
  const currentBadge = myCurrentActivity ? getActivityBadge(myCurrentActivity.activityType) : null;

  const is15MinBefore = timerSeconds <= 900 && timerSeconds > 0;
  const isExtraScenario = myCurrentActivity?.activityType === 'scenario_extra' || myCurrentActivity?.activityType === 'night_scenario';
  const isIntraScenario = myCurrentActivity?.activityType === 'scenario_intra';

  // Filtered discenti for switcher modal
  const filteredDiscentiForSwitcher = useMemo(() => {
    return discenti.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.organization && d.organization.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchTeam = teamFilter === 'ALL' || d.teamId === teamFilter;
      return matchSearch && matchTeam;
    });
  }, [discenti, searchQuery, teamFilter]);

  // Handle Send SOS / Message to Director & Faculty
  const handleSendSos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sosMessage.trim()) return;

    sendCourseMessage({
      senderId: currentDiscente.id,
      senderRole: 'discente',
      senderName: `${currentDiscente.name} (${currentTeam.name})`,
      senderTeamId: currentTeam.id,
      senderStation: `Squadra ${currentTeam.id} - ${currentTeam.name}`,
      type: sosType,
      subject: `COMUNICAZIONE DA ${currentTeam.name.toUpperCase()}`,
      content: `[Ruolo: ${currentDiscente.role}] ${sosMessage.trim()}`,
    });

    setSosMessage('');
    setSosSentSuccess(true);
    setTimeout(() => setSosSentSuccess(false), 4000);
  };

  // Standard procedural skills catalog for the live roster
  const STANDARD_SKILLS = [
    { name: 'Cricotirotomia Chirurgica d\'Urgenza (CRIC)', category: 'Airway' },
    { name: 'Needle Decompression / Drenaggio Torace con Dito', category: 'Breathing' },
    { name: 'Toracostomia con Posizionamento Drenaggio Definitivo', category: 'Breathing' },
    { name: 'Resuscitative Thoracotomy / Clamping Aortico', category: 'Breathing / Circulation' },
    { name: 'Controllo Emorragie Giunzionali / Tourniquet TQ', category: 'Circulation' },
    { name: 'Posizionamento Catetere REBOA (Zone 1 & Zone 3)', category: 'Circulation' },
    { name: 'Pelvic Binder T-POD per Frattura Bacino Instabile', category: 'Circulation' },
    { name: 'Ecostratificazione Point-of-Care eFAST', category: 'Circulation' },
    { name: 'Handover Strutturato SBAR a Chiusura di Circuito', category: 'Non-Technical' },
  ];

  const getTeamSubPhase = () => {
    const totalSecs = (currentSlot?.durationMinutes || 30) * 60;
    const halfSecs = totalSecs / 2;
    const quarterSecs = totalSecs / 4;

    const scenarioBreakdown = getScenarioTeamsBreakdown(currentSlot, currentTeam.groupId as GroupType);
    const isUserTeamExtra = scenarioBreakdown.extraTeams.some((t) => t.id === currentTeam.id);
    const isUserTeamIntra = scenarioBreakdown.intraTeams.some((t) => t.id === currentTeam.id);
    const activityType = myCurrentActivity?.activityType;

    if (activityType === 'scenario_extra' || activityType === 'night_scenario' || activityType === 'scenario_intra') {
      if (isUserTeamExtra) {
        if (timerSeconds > halfSecs) {
          return {
            subPhaseName: isEn ? 'ACTIVE EXTRA-HOSPITAL SCENARIO (TCCC)' : 'SCENARIO EXTRA-OSPEDALIERO ATTIVO (TCCC)',
            badgeText: isEn ? 'ACTIVE / TCCC RESCUE' : 'ATTIVO / SOCCORSO TCCC',
            badgeClass: 'bg-red-600 text-white',
            adaptedTimer: timerSeconds - halfSecs,
            timerLabel: isEn ? 'Scenario Time' : 'Tempo Scenario',
          };
        } else {
          return {
            subPhaseName: isEn ? 'DEBRIEFING & EVALUATION' : 'DEBRIEFING & VALUTAZIONE',
            badgeText: isEn ? 'DEBRIEFING' : 'IN DEBRIEFING',
            badgeClass: 'bg-neutral-100 text-black',
            adaptedTimer: timerSeconds,
            timerLabel: isEn ? 'Debriefing Time' : 'Tempo Debriefing',
          };
        }
      } else if (isUserTeamIntra) {
        if (timerSeconds > halfSecs) {
          return {
            subPhaseName: isEn ? 'STANDBY / WAITING FOR HANDOVER' : 'IN STANDBY / ATTESA HANDOVER',
            badgeText: isEn ? 'STANDBY' : 'IN STANDBY',
            badgeClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/50',
            adaptedTimer: timerSeconds - halfSecs,
            timerLabel: isEn ? 'Standby Time' : 'Tempo Attesa',
          };
        } else if (timerSeconds > quarterSecs) {
          return {
            subPhaseName: isEn ? 'OPERATIONAL / SHOCK ROOM RESUSCITATION' : 'OPERATIVA / RIANIMAZIONE SHOCK ROOM',
            badgeText: isEn ? 'OPERATIONAL (SHOCK ROOM)' : 'OPERATIVA (SHOCK ROOM)',
            badgeClass: 'bg-blue-600 text-white',
            adaptedTimer: timerSeconds - quarterSecs,
            timerLabel: isEn ? 'Shock Room Time' : 'Tempo Shock Room',
          };
        } else {
          return {
            subPhaseName: isEn ? 'DEBRIEFING & BREAK' : 'DEBRIEFING & PAUSA',
            badgeText: isEn ? 'DEBRIEFING & BREAK' : 'DEBRIEFING & PAUSA',
            badgeClass: 'bg-neutral-100 text-black',
            adaptedTimer: timerSeconds,
            timerLabel: isEn ? 'Rest Time' : 'Tempo Residuo',
          };
        }
      }
    }

    return {
      subPhaseName: myCurrentActivity?.title || (isEn ? 'Current Phase' : 'Fase Corrente'),
      badgeText: isEn ? 'ACTIVE' : 'ATTIVO',
      badgeClass: 'bg-orange-500 text-black',
      adaptedTimer: timerSeconds,
      timerLabel: isEn ? 'Phase Time' : 'Tempo Fase',
    };
  };

  const subPhase = getTeamSubPhase();

  return (
    <div className="space-y-4 pb-16">
      {/* Forced Landscape Mode Constraint Overlay for Mobile Discentes */}
      {isPortraitMobile && !dismissLandscapeWarning && (
        <div className="fixed inset-0 z-[9999] bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-neutral-100">
          <div className="max-w-md w-full bg-neutral-900 border-4 border-orange-500 p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl" />
            
            <div className="w-16 h-16 mx-auto bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center text-orange-400 animate-bounce rounded-xl shadow-lg">
              <Smartphone className="w-8 h-8 animate-pulse" style={{ transform: 'rotate(90deg)' }} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-orange-400 bg-orange-950 px-2 py-1 border border-orange-800">
                {isEn ? 'LANDSCAPE ORIENTATION REQUIRED' : 'ORIENTAMENTO ORIZZONTALE CONSIGLIATO'}
              </span>
              <h2 className="text-xl font-black uppercase text-white tracking-tight">
                {isEn ? 'Rotate Your Device' : 'Ruota il Dispositivo'}
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {isEn
                  ? 'For the best simulation interface experience, live timers, and interactive controls during Discente rotation, please rotate your phone or tablet to landscape (horizontal) mode.'
                  : 'Per garantire un\'esperienza ottimale della simulazione, dei timer live e dei controlli interattivi durante la rotazione dei discenti, si prega di ruotare il dispositivo in modalità orizzontale (landscape).'}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => setDismissLandscapeWarning(true)}
                className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs tracking-wider rounded transition-all cursor-pointer shadow-md"
              >
                {isEn ? 'CONTINUE IN PORTRAIT ANYWAY' : 'CONTINUA IN VERTICALE'}
              </button>
              <p className="text-[10px] text-neutral-500">
                {isEn ? 'You can dismiss this warning at any time.' : 'Puoi chiudere questo avviso in qualsiasi momento.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Morning Pre-Opening States (08:00 - 08:45) */}
      {(() => {
        const isMorningSlot0 = (activeDay === 2 || activeDay === 3) && activeSlotIndex === 0; // 08:00 - 08:30
        const isMorningSlot1Pre0845 = (activeDay === 2 || activeDay === 3) && activeSlotIndex === 1 && timerSeconds > 900; // 08:30 - 08:45

        if (isMorningSlot0) {
          return (
            <div className="bg-neutral-950 border-4 border-emerald-500 p-6 sm:p-8 shadow-2xl text-center space-y-4">
              <span className="px-3 py-1 bg-emerald-500 text-black font-black font-mono text-xs uppercase tracking-wider">
                {isEn ? '08:00 - 08:30 • GATE OPENING FACULTY & TECNICI' : '08:00 - 08:30 • APERTURA GATE FACULTY & TECNICI'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                {isEn ? 'Pre-Course Countdown & Station Preparation' : 'Countdown Pre-Corso & Preparazione Postazioni'}
              </h3>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-neutral-900 border-2 border-emerald-500/60 font-mono text-4xl font-black text-emerald-400 shadow-xl">
                <Clock className="w-10 h-10 animate-pulse text-emerald-400" />
                {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto">
                {isEn
                  ? 'Staff and instructors are preparing simulation stations. Learners arrival scheduled at 08:30.'
                  : 'Lo staff e gli istruttori stanno allestendo le postazioni di simulazione. Arrivo discenti previsto alle ore 08:30.'}
              </p>
            </div>
          );
        }

        if (isMorningSlot1Pre0845) {
          return (
            <div className="bg-neutral-950 border-4 border-amber-500 p-6 sm:p-8 shadow-2xl space-y-5 text-center">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-amber-500 text-black font-black font-mono text-xs uppercase">
                  {isEn ? '08:30 - 08:45 • IMMINENT OPENING' : '08:30 - 08:45 • APERTURA IMMINENTE'}
                </span>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-amber-500/50 font-mono text-base font-bold text-amber-300">
                  <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                  {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="max-w-xl mx-auto bg-amber-950/70 border-2 border-amber-500 p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="w-14 h-14 mx-auto bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 rounded-xl animate-bounce">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  APERTURA CORSO IMMINENTE
                </h2>
                <p className="text-base sm:text-lg font-black text-amber-300 uppercase tracking-wide">
                  Raggiungere il proprio faculty
                </p>
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  {isEn
                    ? 'All participants please proceed to your assigned simulation workstations and meet your assigned Faculty tutor. Personalized discente interface will unlock automatically at 08:45.'
                    : 'Tutti i partecipanti sono invitati a raggiungere le rispettive postazioni di simulazione e incontrare il proprio Faculty tutor. La visuale personalizzata discenti si sbloccherà automaticamente alle ore 08:45.'}
                </p>
              </div>
            </div>
          );
        }

        return null;
      })()}

      {/* 15-Minute Automatic Warning Banner for Teams */}
      {is15MinBefore && isExtraScenario && (
        <div className="bg-amber-950 border-2 border-amber-500 p-4 shadow-2xl flex items-center gap-3 animate-pulse">
          <div className="p-2 bg-amber-500 text-black font-black text-xs uppercase">
            {isEn ? '15 MIN ALERT' : 'AVVISO 15 MIN'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-amber-300 uppercase tracking-tight">
              {isEn ? `TEAM ${currentTeam.name.toUpperCase()} • PREPARE FOR TCCC SCENARIO` : `SQUADRA ${currentTeam.name.toUpperCase()} • PREPARARSI ALLO SCENARIO TCCC`}
            </h4>
            <p className="text-xs text-neutral-200">
              {isEn
                ? 'Automatic announcement: 15 minutes remaining. Prepare equipment and personnel for the extra-hospital TCCC scenario.'
                : 'Annuncio automatico: mancano 15 minuti all\'avvio. Preparare attrezzature e personale per lo scenario TCCC extra-ospedaliero.'}
            </p>
          </div>
        </div>
      )}

      {is15MinBefore && isIntraScenario && (
        <div className="bg-blue-950 border-2 border-blue-500 p-4 shadow-2xl flex items-center gap-3 animate-pulse">
          <div className="p-2 bg-blue-500 text-black font-black text-xs uppercase">
            {isEn ? '15 MIN ALERT' : 'AVVISO 15 MIN'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-blue-300 uppercase tracking-tight">
              {isEn ? `TEAM ${currentTeam.name.toUpperCase()} • PROCEED TO SHOCK ROOM` : `SQUADRA ${currentTeam.name.toUpperCase()} • RAGGIUNGERE LA SHOCK ROOM`}
            </h4>
            <p className="text-xs text-neutral-200">
              {isEn
                ? 'Automatic announcement: 15 minutes remaining. Proceed immediately to the Shock Room for the intra-hospital scenario.'
                : 'Annuncio automatico: mancano 15 minuti all\'avvio. Raggiungere tempestivamente la Shock Room per lo scenario intra-ospedaliero.'}
            </p>
          </div>
        </div>
      )}

      {/* TOP BAR / IDENTITY PROFILE HEADER */}
      <div className="bg-neutral-950 border-2 border-neutral-700 p-3 sm:p-4 shadow-xl relative overflow-hidden">
        {/* Ambient background decoration */}
        <div
          className="absolute -right-12 -top-12 w-36 h-36 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: currentTeam.color || '#f97316' }}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Avatar / Badge */}
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center font-black text-sm sm:text-base border border-neutral-100 flex-shrink-0 text-black shadow-md"
              style={{ backgroundColor: currentTeam.color || '#f97316' }}
            >
              {currentDiscente.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 bg-orange-500 text-black">
                  {isEn ? 'LEARNER' : 'DISCENTE'}
                </span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 bg-neutral-900 border border-neutral-700 text-neutral-300">
                  {currentDiscente.badgeCode || `DISC-${currentDiscente.teamId}`}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400">
                  🌍 {currentDiscente.nationality}
                </span>
              </div>
              <h2 className="font-black text-base sm:text-lg text-white tracking-tight truncate uppercase mt-0.5 leading-tight">
                {currentDiscente.name}
              </h2>
              {/* Prominent Team Display in Header */}
              <div 
                className="mt-1.5 mb-1 inline-flex items-center gap-2 px-3 py-1 border-2 shadow-md rounded-sm"
                style={{ backgroundColor: `${currentTeam.color || '#f97316'}20`, borderColor: currentTeam.color || '#f97316' }}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: currentTeam.color || '#f97316' }} />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  {currentTeam.name}
                </span>
                <span className="px-1.5 py-0.5 bg-black text-orange-400 text-[10px] font-mono border border-orange-500/40">
                  {isEn ? 'TEAM' : 'SQUADRA'} #{currentTeam.id} • {isEn ? 'GRP' : 'GRUPPO'} {currentTeam.groupId}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 flex-wrap">
                <span className="font-bold text-orange-400">{currentDiscente.role}</span>
                {currentDiscente.organization && (
                  <>
                    <span>•</span>
                    <span className="text-neutral-500 truncate max-w-[200px]">
                      {currentDiscente.organization}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Team Pill & Action */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-neutral-800">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border-2 border-orange-500/70 text-xs font-mono shadow-md">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentTeam.color || '#f97316' }} />
              <span className="font-black text-white">{isEn ? 'TEAM' : 'SQUADRA'} #{currentTeam.id}</span>
              <span className="text-orange-400 font-bold text-xs">({isEn ? 'GRP' : 'GR'} {currentTeam.groupId})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Browser Notification Banner */}
      {typeof window !== 'undefined' && 'Notification' in window && notificationPermission !== 'granted' && (
        <div className="bg-neutral-900 border-2 border-orange-500/80 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-orange-400 animate-bounce flex-shrink-0" />
            <div>
              <h4 className="text-xs font-black text-white uppercase">
                {isEn ? 'ENABLE BROWSER NOTIFICATIONS' : 'ATTIVA NOTIFICHE BROWSER'}
              </h4>
              <p className="text-[11px] text-neutral-300">
                {isEn
                  ? 'Receive alerts when your scenario is starting even when the tab is in the background.'
                  : 'Ricevi avvisi di inizio scenario anche quando la scheda è in background.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestNotificationPermission}
            className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-black font-black text-xs uppercase transition-colors cursor-pointer flex-shrink-0"
          >
            {isEn ? 'Enable Notifications' : 'Abilita Notifiche'}
          </button>
        </div>
      )}

      {/* MOBILE-FIRST INTUITIVE & ACCESSIBLE SUBMENU TABS */}
      <div className="sticky top-14 z-30 bg-neutral-950/95 backdrop-blur-md border-y border-neutral-800 py-1 -mx-4 sm:mx-0 px-4 sm:px-0 shadow-md">
        <nav aria-label={isEn ? 'Learner Menu' : 'Menu Discente'} className="grid grid-cols-5 gap-1 sm:gap-1.5">
          <button
            onClick={() => setActiveSubTab('agenda')}
            className={`min-h-[40px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 text-center border transition-all cursor-pointer ${
              activeSubTab === 'agenda'
                ? 'bg-neutral-100 text-black border-neutral-100 font-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800 hover:border-neutral-700 font-bold'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${activeSubTab === 'agenda' ? 'text-black' : 'text-orange-400'}`} />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-tight sm:tracking-wider leading-tight">
              {isEn ? 'SCHEDULE' : 'AGENDA'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('team')}
            className={`min-h-[40px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 text-center border transition-all cursor-pointer ${
              activeSubTab === 'team'
                ? 'bg-neutral-100 text-black border-neutral-100 font-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800 hover:border-neutral-700 font-bold'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${activeSubTab === 'team' ? 'text-black' : 'text-sky-400'}`} />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-tight sm:tracking-wider leading-tight">
              {isEn ? 'TEAM' : 'SQUADRA'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('feedback')}
            className={`min-h-[40px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 text-center border transition-all cursor-pointer ${
              activeSubTab === 'feedback'
                ? 'bg-neutral-100 text-black border-neutral-100 font-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800 hover:border-neutral-700 font-bold'
            }`}
          >
            <Award className={`w-3.5 h-3.5 ${activeSubTab === 'feedback' ? 'text-black' : 'text-emerald-400'}`} />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-tight sm:tracking-wider leading-tight">
              {isEn ? 'FEEDBACK' : 'FEEDBACK'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('broadcast')}
            className={`min-h-[40px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 text-center border transition-all cursor-pointer relative ${
              activeSubTab === 'broadcast'
                ? 'bg-neutral-100 text-black border-neutral-100 font-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800 hover:border-neutral-700 font-bold'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${activeSubTab === 'broadcast' ? 'text-black' : 'text-red-400'}`} />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-tight sm:tracking-wider leading-tight">
              {isEn ? 'ALERTS' : 'AVVISI'}
            </span>
            {myBroadcastAlerts.some((a) => a.active) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('qrpass')}
            className={`min-h-[40px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 text-center border transition-all cursor-pointer ${
              activeSubTab === 'qrpass'
                ? 'bg-orange-500 text-black border-orange-500 font-black shadow-md'
                : 'bg-neutral-900 text-orange-400 hover:text-orange-300 border-neutral-800 hover:border-orange-500 font-bold'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span className="text-[11px] sm:text-xs uppercase tracking-tight sm:tracking-wider leading-tight">
              {isEn ? 'QR PASS' : 'QR PASS'}
            </span>
          </button>
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: AGENDA 2 GIORNI & LIVE NOW */}
      {/* ========================================================================= */}
      {activeSubTab === 'agenda' && (
        <div className="space-y-6">
          {/* LIVE NOW CARD - WHAT MY TEAM SHOULD DO RIGHT NOW */}
          <motion.div
            key={`${activeSlotIndex}-${currentTeam.id}`}
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-neutral-950 border-4 border-orange-500 p-5 sm:p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Rotation Status Update Feedback Banner */}
            <div className="mb-3 px-3 py-1.5 bg-orange-500/20 border border-orange-500 flex items-center justify-between text-xs font-mono text-orange-300">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-spin" />
                {isEn ? 'Rotation Status Updated • Active Assignment Synced' : 'Stato Rotazione Aggiornato • Assegnazione Attiva Sincronizzata'}
              </span>
              <span className="text-[10px] bg-orange-500 text-black px-1.5 py-0.5 font-black uppercase tracking-widest">
                LIVE
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 pb-3 border-b-2 border-neutral-800">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <h3 className="font-black text-sm sm:text-base text-white uppercase tracking-tight">
                  {subPhase.subPhaseName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-neutral-400">
                  {subPhase.timerLabel}
                </span>
                <span
                  className={`font-mono text-sm sm:text-base font-black px-2.5 py-0.5 ${
                    subPhase.adaptedTimer < 180 ? 'bg-red-600 text-white animate-pulse' : 'bg-neutral-900 text-orange-400 border border-neutral-700'
                  }`}
                >
                  {formatTimer(subPhase.adaptedTimer)}
                </span>
              </div>
            </div>

            {myCurrentActivity ? (
              <div className="pt-4 space-y-4">
                {/* SCENARIO VIEW: FASE + EXTRA/INTRA + SQUADRE SPECIFICATE EXTRA VS INTRA */}
                {isScenarioActivity(myCurrentActivity.activityType) && (() => {
                  const scenarioBreakdown = getScenarioTeamsBreakdown(currentSlot, currentTeam.groupId as GroupType);
                  const isUserTeamExtra = scenarioBreakdown.extraTeams.some((t) => t.id === currentTeam.id);

                  return (
                    <div className="bg-neutral-900 border-2 border-neutral-800 p-4 sm:p-5 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                              {isEn ? `OPERATIONAL PHASE #${activeSlotIndex + 1}` : `FASE OPERATIVA #${activeSlotIndex + 1}`}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-neutral-950 border border-neutral-700 text-xs font-bold text-neutral-300">
                              <MapPin className="w-3.5 h-3.5 text-orange-400" />
                              {myCurrentActivity.location}
                            </span>
                          </div>
                          <h4 className="font-black text-lg sm:text-xl text-white uppercase leading-snug">
                            {myCurrentActivity.title}
                          </h4>
                        </div>

                        {/* Explicit Extra vs Intra badge for current team */}
                        <div className="flex-shrink-0">
                          {myCurrentActivity.activityType === 'scenario_extra' ? (
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md">
                              <Activity className="w-4 h-4 text-white" />
                              {isEn ? 'YOUR ROLE: OUT-OF-HOSPITAL' : 'IL TUO RUOLO: EXTRA-OSPEDALIERO'}
                            </span>
                          ) : myCurrentActivity.activityType === 'scenario_intra' ? (
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md">
                              <Stethoscope className="w-4 h-4 text-white" />
                              {isEn ? 'YOUR ROLE: IN-HOSPITAL (SHOCK ROOM)' : 'IL TUO RUOLO: INTRA-OSPEDALIERO'}
                            </span>
                          ) : myCurrentActivity.activityType === 'night_scenario' ? (
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-500 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-md">
                              <Moon className="w-4 h-4 text-black" />
                              {isEn ? 'OUT-OF-HOSPITAL (NIGHT MCI MASS CASUALTY)' : 'EXTRA-OSPEDALIERO (MAXIEMERGENZA MCI NOTTURNA)'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-100 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-md">
                              <Info className="w-4 h-4 text-black" />
                              {isEn ? 'SBAR HANDOVER & DEBRIEFING' : 'HANDOVER SBAR & DEBRIEFING'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Explicit Distinction: SQUADRE IN EXTRA-OSPEDALIERO vs INTRA-OSPEDALIERO */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* EXTRA-OSPEDALIERO SECTION */}
                        <div className={`p-4 border-2 space-y-3 ${isUserTeamExtra ? 'bg-red-950/20 border-red-500/80 ring-1 ring-red-500/40' : 'bg-neutral-950 border-neutral-800'}`}>
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse" />
                              <span className="text-xs font-black uppercase tracking-wider text-red-400">
                                {isEn ? 'SQUADS IN OUT-OF-HOSPITAL' : 'SQUADRE IN EXTRA-OSPEDALIERO'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-red-950 text-red-300 border border-red-800">
                              {isEn ? 'FIELD / EMS RESCUE' : 'TERRITORIO / SOCCORSO'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {scenarioBreakdown.extraTeams.length > 0 ? (
                              scenarioBreakdown.extraTeams.map((team) => {
                                const isMyTeam = team.id === currentTeam.id;
                                return (
                                  <div
                                    key={team.id}
                                    className={`p-2.5 border flex items-center justify-between gap-2 transition-all ${
                                      isMyTeam
                                        ? 'bg-neutral-900 border-red-500 shadow-md ring-1 ring-red-500'
                                        : 'bg-neutral-900/70 border-neutral-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div
                                        className="w-6 h-6 flex items-center justify-center font-black text-xs text-black flex-shrink-0"
                                        style={{ backgroundColor: team.color || '#ef4444' }}
                                      >
                                        {team.id}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1">
                                          <span className="font-black text-xs text-white uppercase truncate">
                                            {team.name}
                                          </span>
                                          {isMyTeam && (
                                            <span className="text-[9px] font-black uppercase px-1 bg-red-500 text-white flex-shrink-0">
                                              {isEn ? 'YOU' : 'TU'}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-neutral-400 font-bold block">
                                          {isEn ? `Group ${team.groupId} • Out-of-Hospital` : `Gruppo ${team.groupId} • Extra-Ospedaliero`}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-xs text-neutral-500 italic col-span-2">
                                {isEn ? 'No squads assigned to extra-hospital phase' : 'Nessuna squadra assegnata alla fase extra'}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* INTRA-OSPEDALIERO SECTION */}
                        <div className={`p-4 border-2 space-y-3 ${!isUserTeamExtra ? 'bg-blue-950/20 border-blue-500/80 ring-1 ring-blue-500/40' : 'bg-neutral-950 border-neutral-800'}`}>
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block animate-pulse" />
                              <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                                {isEn ? 'SQUADS IN IN-HOSPITAL' : 'SQUADRE IN INTRA-OSPEDALIERO'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800">
                              {isEn ? 'SHOCK ROOM / ED' : 'SHOCK ROOM / PRONTO SOCCORSO'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {scenarioBreakdown.intraTeams.length > 0 ? (
                              scenarioBreakdown.intraTeams.map((team) => {
                                const isMyTeam = team.id === currentTeam.id;
                                return (
                                  <div
                                    key={team.id}
                                    className={`p-2.5 border flex items-center justify-between gap-2 transition-all ${
                                      isMyTeam
                                        ? 'bg-neutral-900 border-blue-500 shadow-md ring-1 ring-blue-500'
                                        : 'bg-neutral-900/70 border-neutral-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div
                                        className="w-6 h-6 flex items-center justify-center font-black text-xs text-black flex-shrink-0"
                                        style={{ backgroundColor: team.color || '#3b82f6' }}
                                      >
                                        {team.id}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1">
                                          <span className="font-black text-xs text-white uppercase truncate">
                                            {team.name}
                                          </span>
                                          {isMyTeam && (
                                            <span className="text-[9px] font-black uppercase px-1 bg-blue-500 text-white flex-shrink-0">
                                              {isEn ? 'YOU' : 'TU'}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-neutral-400 font-bold block">
                                          {isEn ? `Group ${team.groupId} • In-Hospital` : `Gruppo ${team.groupId} • Intra-Ospedaliero`}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-xs text-neutral-500 italic col-span-2">
                                {isEn ? 'Pending patient handover / preparation' : 'In attesa di ricezione / preparazione'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* WORKSHOP VIEW: SOLO NOME DEL WORKSHOP E SQUADRE CHE VI PARTECIPANO */}
                {isWorkshopActivity(myCurrentActivity.activityType) && (() => {
                  const workshopTeams = getWorkshopTeams(currentSlot, currentTeam.groupId as GroupType);

                  return (
                    <div className="bg-neutral-900 border-2 border-neutral-800 p-4 sm:p-5 space-y-4">
                      <div className="pb-3 border-b border-neutral-800 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500 text-black text-xs font-black uppercase tracking-wider">
                            <Wrench className="w-3.5 h-3.5 text-black" />
                            WORKSHOP
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-950 border border-neutral-700 text-xs font-bold text-neutral-300">
                            <MapPin className="w-3.5 h-3.5 text-orange-400" />
                            {myCurrentActivity.location}
                          </span>
                        </div>

                        <h4 className="font-black text-lg sm:text-xl text-white uppercase leading-snug">
                          {myCurrentActivity.title}
                        </h4>
                      </div>

                      {/* Squadre Partecipanti al Workshop */}
                      <div className="space-y-3">
                        <span className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                          <Users className="w-4 h-4 text-orange-400" />
                          {isEn ? 'SQUADS ATTENDING THE WORKSHOP:' : 'SQUADRE CHE PARTECIPANO AL WORKSHOP:'}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {workshopTeams.map((team) => {
                            const isMyTeam = team.id === currentTeam.id;
                            return (
                              <div
                                key={team.id}
                                className={`p-3 border-2 flex items-center justify-between gap-2.5 transition-all ${
                                  isMyTeam
                                    ? 'bg-neutral-900 border-orange-500 shadow-md ring-1 ring-orange-500'
                                    : 'bg-neutral-950 border-neutral-800'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className="w-7 h-7 flex items-center justify-center font-black text-xs text-black flex-shrink-0"
                                    style={{ backgroundColor: team.color || '#f97316' }}
                                  >
                                    {team.id}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-black text-xs text-white uppercase truncate">
                                        {team.name}
                                      </span>
                                      {isMyTeam && (
                                        <span className="text-[9px] font-black uppercase px-1 bg-orange-500 text-black flex-shrink-0">
                                          {isEn ? 'YOU' : 'TU'}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-neutral-400 font-bold block">
                                      {isEn ? `Group ${team.groupId}` : `Gruppo ${team.groupId}`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* GENERAL / BREAK SESSION */}
                {!isScenarioActivity(myCurrentActivity.activityType) && !isWorkshopActivity(myCurrentActivity.activityType) && (
                  <div className="bg-neutral-900 border-2 border-neutral-800 p-4 space-y-2">
                    <h4 className="font-black text-base text-white uppercase">{myCurrentActivity.title}</h4>
                    <p className="text-xs text-neutral-300">{myCurrentActivity.subtitle}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-neutral-400 text-xs font-bold">
                {isEn ? 'No activities scheduled for your group in this slot.' : 'Nessuna attività programmata per il tuo gruppo in questo slot.'}
              </div>
            )}
          </motion.div>

          {/* TWO-DAY FULL TIMELINE ACCORDION FOR MY TEAM */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b-2 border-neutral-800">
              <div>
                <h3 className="font-black text-base text-white uppercase tracking-tight">
                  {isEn ? `2-DAY FULL SCHEDULE // SQUAD ${currentTeam.id} TIMELINE` : `PROGRAMMA COMPLETO DEI 2 GIORNI // IL PERCORSO DELLA SQUADRA ${currentTeam.id}`}
                </h3>
                <p className="text-xs text-neutral-400">
                  {isEn ? `All 8 phases for Day 02 & Day 03 customized for Group ${currentTeam.groupId}` : `Tutte le 8 fasi del Day 02 e Day 03 personalizzate per il Gruppo ${currentTeam.groupId}`}
                </p>
              </div>

              {/* Day filter selector */}
              <div className="flex items-center gap-1 bg-neutral-900 p-1 border border-neutral-700 self-stretch sm:self-auto justify-center">
                <button
                  onClick={() => {
                    setAgendaDay(2);
                    setActiveDay(2);
                  }}
                  className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeDay === 2 ? 'bg-orange-500 text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  DAY 02
                </button>
                <button
                  onClick={() => {
                    setAgendaDay(3);
                    setActiveDay(3);
                  }}
                  className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeDay === 3 ? 'bg-orange-500 text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  DAY 03
                </button>
              </div>
            </div>

            {/* List of slots for the selected day */}
            <div className="space-y-3">
              {filteredSlots.map((slot, idx) => {
                const activity = slot.groupActivities?.[currentTeam.groupId as GroupType];
                const isCurrentActiveSlot = activeDay === slot.day && currentSlot.id === slot.id;
                const isScenario = activity && isScenarioActivity(activity.activityType);
                const isWorkshop = activity && isWorkshopActivity(activity.activityType);
                const scenarioBreakdown = isScenario ? getScenarioTeamsBreakdown(slot, currentTeam.groupId as GroupType) : null;
                const workshopTeams = isWorkshop ? getWorkshopTeams(slot, currentTeam.groupId as GroupType) : [];

                return (
                  <div
                    key={slot.id}
                    className={`bg-neutral-950 border-2 transition-all p-4 ${
                      isCurrentActiveSlot
                        ? 'border-orange-500 shadow-xl bg-orange-950/10'
                        : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-neutral-900">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black px-2 py-0.5 bg-neutral-900 text-neutral-300 border border-neutral-700">
                          {slot.timeRange}
                        </span>
                        <span className="text-xs font-bold text-neutral-400 uppercase">
                          {isEn ? `PHASE #${idx + 1} (${slot.durationMinutes} MIN)` : `FASE #${idx + 1} (${slot.durationMinutes} MIN)`}
                        </span>
                        {isCurrentActiveSlot && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-red-600 text-white animate-pulse">
                            {isEn ? 'IN PROGRESS' : 'IN CORSO'}
                          </span>
                        )}
                      </div>

                      {activity && (
                        <div>
                          {activity.activityType === 'scenario_extra' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] uppercase tracking-wider bg-red-600 text-white font-black">
                              <Activity className="w-3.5 h-3.5" />
                              {isEn ? 'OUT-OF-HOSPITAL PHASE' : 'FASE EXTRA-OSPEDALIERA'}
                            </span>
                          )}
                          {activity.activityType === 'scenario_intra' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] uppercase tracking-wider bg-blue-600 text-white font-black">
                              <Stethoscope className="w-3.5 h-3.5" />
                              {isEn ? 'IN-HOSPITAL PHASE' : 'FASE INTRA-OSPEDALIERA'}
                            </span>
                          )}
                          {activity.activityType === 'night_scenario' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] uppercase tracking-wider bg-orange-500 text-black font-black">
                              <Moon className="w-3.5 h-3.5" />
                              {isEn ? 'OUT-OF-HOSPITAL PHASE (MCI)' : 'FASE EXTRA-OSPEDALIERA (MCI)'}
                            </span>
                          )}
                          {activity.activityType === 'debriefing' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] uppercase tracking-wider bg-neutral-800 text-neutral-300 font-bold border border-neutral-700">
                              <Info className="w-3.5 h-3.5 text-neutral-400" />
                              {isEn ? 'HANDOVER & DEBRIEFING' : 'HANDOVER & DEBRIEFING'}
                            </span>
                          )}
                          {isWorkshopActivity(activity.activityType) && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] uppercase tracking-wider bg-orange-500 text-black font-black">
                              <Wrench className="w-3.5 h-3.5" />
                              WORKSHOP
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {activity ? (
                      <div className="pt-2.5 space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                            <span className="font-semibold text-neutral-200">{activity.location}</span>
                          </div>
                          <h4 className="font-black text-sm text-white uppercase">{activity.title}</h4>
                        </div>

                        {/* Specific Breakdown: Extra vs Intra for Scenarios */}
                        {scenarioBreakdown && (
                          <div className="pt-2 border-t border-neutral-900 space-y-2">
                            {scenarioBreakdown.extraTeams.length > 0 && (
                              <div className="flex items-start sm:items-center gap-2 flex-wrap text-xs">
                                <span className="text-[10px] font-black uppercase text-red-400 flex items-center gap-1 bg-red-950/60 px-2 py-0.5 border border-red-900 flex-shrink-0">
                                  <Activity className="w-3 h-3 text-red-400" /> {isEn ? 'Out-of-Hospital:' : 'Extra-Ospedaliero:'}
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {scenarioBreakdown.extraTeams.map((t) => (
                                    <span
                                      key={t.id}
                                      className={`text-[10px] font-bold px-2 py-0.5 border ${
                                        t.id === currentTeam.id
                                          ? 'bg-red-600 text-white border-red-500 font-black ring-1 ring-red-400'
                                          : 'bg-neutral-900 text-neutral-200 border-neutral-700'
                                      }`}
                                    >
                                      {t.name} (Grp {t.groupId})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {scenarioBreakdown.intraTeams.length > 0 && (
                              <div className="flex items-start sm:items-center gap-2 flex-wrap text-xs">
                                <span className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-1 bg-blue-950/60 px-2 py-0.5 border border-blue-900 flex-shrink-0">
                                  <Stethoscope className="w-3 h-3 text-blue-400" /> {isEn ? 'In-Hospital:' : 'Intra-Ospedaliero:'}
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {scenarioBreakdown.intraTeams.map((t) => (
                                    <span
                                      key={t.id}
                                      className={`text-[10px] font-bold px-2 py-0.5 border ${
                                        t.id === currentTeam.id
                                          ? 'bg-blue-600 text-white border-blue-500 font-black ring-1 ring-blue-400'
                                          : 'bg-neutral-900 text-neutral-200 border-neutral-700'
                                      }`}
                                    >
                                      {t.name} (Grp {t.groupId})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Specific Breakdown for Workshops */}
                        {isWorkshop && workshopTeams.length > 0 && (
                          <div className="pt-2 border-t border-neutral-900 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase text-orange-400 flex items-center gap-1 bg-orange-950/60 px-2 py-0.5 border border-orange-900 flex-shrink-0">
                              <Wrench className="w-3 h-3 text-orange-400" /> {isEn ? 'Workshop Squads:' : 'Squadre Workshop:'}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {workshopTeams.map((t) => (
                                <span
                                  key={t.id}
                                  className={`text-[10px] font-bold px-2 py-0.5 border ${
                                    t.id === currentTeam.id
                                      ? 'bg-orange-500 text-black border-orange-500 font-black ring-1 ring-orange-300'
                                      : 'bg-neutral-900 text-neutral-300 border-neutral-700'
                                  }`}
                                >
                                  {t.name} (Grp {t.groupId})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pt-2 text-xs text-neutral-500 italic">
                        {slot.title} - {isEn ? 'General Session' : 'Sessione generale'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Interactive Timeline Legend */}
            <div className="pt-3">
              <CourseTimelineLegend
                activeDay={activeDay}
                currentSlotTitle={currentSlot.title}
                currentSlotTimeRange={currentSlot.timeRange}
                totalPendingEvaluations={evaluations.filter((e) => e.teamId === currentTeam.id).length === 0 ? 1 : 0}
                totalCompletedEvaluations={evaluations.filter((e) => e.teamId === currentTeam.id).length}
                defaultExpanded={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: SQUADRA, COMPAGNI & TUTOR FACULTY */}
      {/* ========================================================================= */}
      {activeSubTab === 'team' && (
        <div className="space-y-6">
          {/* SQUADRA INFO CARD */}
          <div className="bg-neutral-950 border-4 border-neutral-100 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center font-black text-black text-base border-2 border-neutral-100"
                  style={{ backgroundColor: currentTeam.color || '#f97316' }}
                >
                  {currentTeam.id}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-tight">
                      {currentTeam.name}
                    </h3>
                    {renderTeamStatusBadge(currentTeam.groupId)}
                  </div>
                  <p className="text-xs text-neutral-400 font-bold uppercase">
                    {isEn ? `LOGISTICS GROUP ${currentTeam.groupId} • 5 MULTIDISCIPLINARY MEMBERS` : `GRUPPO LOGISTICO ${currentTeam.groupId} • 5 COMPONENTI MULTIDISCIPLINARI`}
                  </p>
                </div>
              </div>
            </div>

            {/* TEAMMATES ROSTER */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400 block">
                {isEn ? 'SQUAD MEMBERS ROSTER (OPERATIONAL ROLES):' : 'ROSTER COMPONENTI DELLA SQUADRA (RUOLI OPERATIVI):'}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teammates.map((mate) => {
                  const isMe = mate.id === currentDiscente.id;
                  return (
                    <div
                      key={mate.id}
                      className={`p-3.5 border-2 transition-all ${
                        isMe
                          ? 'bg-neutral-900 border-orange-500 shadow-md'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-white uppercase truncate">
                              {mate.name}
                            </span>
                            {isMe && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-orange-500 text-black">
                                {isEn ? 'YOU' : 'TU'}
                              </span>
                            )}
                            <span className="text-[10px] text-neutral-400">🌍 {mate.nationality}</span>
                          </div>
                          <p className="text-xs font-bold text-orange-400">{translateRoleOrSpecialty(mate.role, language)}</p>
                          {mate.organization && (
                            <p className="text-[11px] text-neutral-400 truncate">{mate.organization}</p>
                          )}
                        </div>

                        {mate.phone && (
                          <a
                            href={`tel:${mate.phone}`}
                            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 hover:border-orange-500 transition-colors flex-shrink-0 cursor-pointer"
                            title={isEn ? `Call ${mate.name}` : `Chiama ${mate.name}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-orange-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QUICK ROLE EDIT FOR ME */}
            <div className="bg-neutral-900 p-4 border-2 border-neutral-800 space-y-2 mt-4">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-300 block">
                {isEn ? 'UPDATE YOUR OPERATIONAL ROLE IN TEAM:' : 'AGGIORNA IL TUO RUOLO OPERATIVO NEL TEAM:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Team Leader / Coordinatore',
                  'Airway Doctor / Intubazione & Crico',
                  'Circulation & REBOA Specialist',
                  'Procedural Surgeon / Toraco & Laparo',
                  'Scribe & Timekeeper / SBAR Logger',
                  'Critical Care Nurse / Accessi & Farmaci',
                ].map((rolePreset) => (
                  <button
                    key={rolePreset}
                    onClick={() => updateDiscente(currentDiscente.id, { role: rolePreset })}
                    className={`px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                      currentDiscente.role === rolePreset
                        ? 'bg-orange-500 text-black border-orange-500 font-black'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    {translateRoleOrSpecialty(rolePreset, language)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FACULTY TUTOR CARD */}
          <div className="bg-neutral-950 border-4 border-emerald-500 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 text-black flex items-center justify-center font-black border-2 border-neutral-100">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-500 text-black">
                      {isEn ? 'CLINICAL TUTOR' : 'TUTOR CLINICO'}
                    </span>
                    <span className="text-xs font-bold text-neutral-400">
                      🌍 {assignedFaculty.nationality}
                    </span>
                  </div>
                  <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-tight">
                    {assignedFaculty.name}
                  </h3>
                </div>
              </div>

              {assignedFaculty.phone && (
                <a
                  href={`tel:${assignedFaculty.phone}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-neutral-100 text-black font-black text-xs uppercase tracking-wider transition-all border-2 border-emerald-500 cursor-pointer shadow-md"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isEn ? 'CALL TUTOR' : 'CHIAMA TUTOR'}</span>
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-neutral-900 p-3 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-neutral-400 block">
                  {isEn ? 'CLINICAL SPECIALTY:' : 'SPECIALIZZAZIONE CLINICA:'}
                </span>
                <p className="font-bold text-neutral-200">{translateRoleOrSpecialty(assignedFaculty.specialty, language)}</p>
              </div>

              <div className="bg-neutral-900 p-3 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-neutral-400 block">
                  {isEn ? 'HOSPITAL / AFFILIATION:' : 'OSPEDALE / ENTE DI PROVENIENZA:'}
                </span>
                <p className="font-bold text-neutral-200">
                  {assignedFaculty.organization || 'AOU Trauma Center'}
                </p>
              </div>
            </div>

            <div className="bg-neutral-900 p-3 border border-neutral-800 text-xs text-neutral-300 space-y-1">
              <span className="text-[10px] font-black uppercase text-neutral-400 block">
                {isEn ? 'TUTOR BRIEFING NOTES:' : 'NOTE DI BRIEFING DEL TUTOR:'}
              </span>
              <p className="font-medium leading-relaxed">
                {isEn
                  ? 'Technical oversight during complex scenarios, rigorous verification of Closed-Loop communication, and structured debriefing using Plus/Delta model at the end of each phase.'
                  : 'Supervisione tecnica su scenari complessi, verifica rigorosa della comunicazione a circuito chiuso (Closed Loop) e debriefing con modello Plus/Delta al termine di ogni fase.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: FEEDBACK LIVE & SKILL ROSTER */}
      {/* ========================================================================= */}
      {activeSubTab === 'feedback' && (
        <div className="space-y-6">
          {/* LATEST EVALUATION SCORECARD */}
          <div className="bg-neutral-950 border-4 border-neutral-100 p-5 sm:p-6 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-500" />
                  <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-tight">
                    {isEn ? 'REAL-TIME CLINICAL FEEDBACK & EVALUATIONS' : 'FEEDBACK CLINICO & VALUTAZIONI IN TEMPO REALE'}
                  </h3>
                </div>
                <p className="text-xs text-neutral-400">
                  {isEn ? `Evaluations recorded by faculty tutor ${assignedFaculty.name} for ${currentTeam.name}` : `Valutazioni salvate dal docente tutor ${assignedFaculty.name} per la ${currentTeam.name}`}
                </p>
              </div>

              {latestEvaluation && (
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-neutral-300">
                  {isEn ? `Updated: ${latestEvaluation.timestamp} (Phase ${latestEvaluation.phase})` : `Aggiornato: ${latestEvaluation.timestamp} (Fase ${latestEvaluation.phase})`}
                </span>
              )}
            </div>

            {latestEvaluation ? (
              <div className="space-y-5">
                {/* 5 Performance Dimension Bars */}
                <div className="space-y-3">
                  {[
                    { key: 'abcdeApproach', label: isEn ? 'ABCDE Systematic Approach' : 'Approccio Sistematico ABCDE', val: latestEvaluation.scores.abcdeApproach },
                    { key: 'technicalSkills', label: isEn ? 'Technical Skills & Invasive Procedures' : 'Abilità Tecniche & Procedure Invasive', val: latestEvaluation.scores.technicalSkills },
                    { key: 'teamworkLeadership', label: isEn ? 'Teamwork & Operational Leadership' : 'Teamwork & Leadership Operativa', val: latestEvaluation.scores.teamworkLeadership },
                    { key: 'handoverSbar', label: isEn ? 'SBAR Handover & Closed-Loop Communication' : 'Handover SBAR & Comunicazione Closed-Loop', val: latestEvaluation.scores.handoverSbar },
                    { key: 'safetyTiming', label: isEn ? 'Safety, Timing & Decision Making' : 'Sicurezza, Timing & Decision Making', val: latestEvaluation.scores.safetyTiming },
                  ].map((dim) => (
                    <div key={dim.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-neutral-300 uppercase">{dim.label}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-orange-400 font-black">{dim.val}/5</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= dim.val ? 'text-orange-500 fill-orange-500' : 'text-neutral-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-neutral-900 h-2 border border-neutral-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            dim.val >= 4 ? 'bg-emerald-500' : dim.val >= 3 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(dim.val / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Qualitative Feedback Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-neutral-900 p-3.5 border-2 border-emerald-900/50 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black uppercase text-[11px]">
                      <Sparkles className="w-4 h-4" />
                      <span>{isEn ? 'KEY STRENGTHS HIGHLIGHTED:' : 'PUNTI DI FORZA EVIDENZIATI:'}</span>
                    </div>
                    <p className="text-neutral-200 leading-relaxed font-medium">
                      {latestEvaluation.strengths || (isEn ? 'Excellent adherence to TCCC guidelines and coordinated team execution.' : 'Ottima aderenza alle linee guida TCCC ed esecuzione coordinata.')}
                    </p>
                  </div>

                  <div className="bg-neutral-900 p-3.5 border-2 border-orange-900/50 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-orange-400 font-black uppercase text-[11px]">
                      <AlertCircle className="w-4 h-4" />
                      <span>{isEn ? 'CRITICAL POINTS & CORRECTIVE ACTIONS:' : 'CRITICITÀ & AZIONI CORRETTIVE:'}</span>
                    </div>
                    <p className="text-neutral-200 leading-relaxed font-medium">
                      {latestEvaluation.criticalIssues || (isEn ? 'Streamline SBAR handover avoiding verbal delays and ensure direct eye contact.' : 'Velocizzare il passaggio consegne SBAR evitando dispersioni verbali.')}
                    </p>
                  </div>
                </div>

                {latestEvaluation.debriefingActionItems && (
                  <div className="bg-neutral-900 p-3.5 border-2 border-neutral-800 space-y-1.5 text-xs">
                    <span className="text-[11px] font-black uppercase text-neutral-400 block">
                      {isEn ? 'ACTION ITEMS FOR DEBRIEFING:' : 'ACTION ITEMS PER IL DEBRIEFING:'}
                    </span>
                    <p className="text-neutral-200 font-medium leading-relaxed">
                      {latestEvaluation.debriefingActionItems}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-neutral-900 p-6 border border-neutral-800 text-center space-y-2">
                <Info className="w-8 h-8 text-orange-400 mx-auto" />
                <h4 className="font-black text-sm text-white uppercase">{isEn ? 'AWAITING FIRST DEBRIEFING' : 'IN ATTESA DEL PRIMO DEBRIEFING'}</h4>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  {isEn
                    ? `Your faculty tutor ${assignedFaculty.name} will record scores and qualitative feedback after concluding the active simulation phase.`
                    : `Il tuo docente tutor ${assignedFaculty.name} registrerà i punteggi e i feedback al termine della fase pratica in corso.`}
                </p>
              </div>
            )}
          </div>

          {/* PERSONALIZED CLINICAL SKILLS ROSTER */}
          <div className="bg-neutral-950 border-4 border-neutral-100 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-800">
              <div>
                <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-tight">
                  {isEn ? 'SKILLS ROSTER & INVASIVE PROCEDURES' : 'ROSTER COMPETENZE & PROCEDURE INVASIVE'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {isEn ? `Practical log of lifesaving maneuvers completed and validated for ${currentTeam.name}` : `Registro pratico delle manovre salvavita eseguite e validate per la ${currentTeam.name}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STANDARD_SKILLS.map((skill, idx) => {
                const isCompleted = latestEvaluation?.proceduresCompleted?.includes(skill.name);
                return (
                  <div
                    key={idx}
                    className={`p-3 border-2 flex items-start justify-between gap-2 transition-all ${
                      isCompleted
                        ? 'bg-neutral-900 border-emerald-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-black uppercase text-orange-400 block tracking-wider">
                        {skill.category}
                      </span>
                      <p className="font-bold text-xs leading-snug">{skill.name}</p>
                    </div>

                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-500 text-black">
                          <CheckCircle2 className="w-3 h-3" /> {isEn ? 'COMPLETED' : 'ESEGUITA'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-400">
                          {isEn ? 'SCHEDULED' : 'IN PROGRAMMA'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: BROADCAST ALERTS & SOS MESSAGES */}
      {/* ========================================================================= */}
      {activeSubTab === 'broadcast' && (
        <div className="space-y-6">
          {/* SEND MESSAGE / SOS TO FACULTY & DIRECTOR */}
          <div className="bg-neutral-950 border-4 border-red-600 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-neutral-800">
              <Radio className="w-5 h-5 text-red-500" />
              <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-tight">
                {isEn ? `DIRECT CONTROL ROOM COMM // SOS SQUAD ${currentTeam.id}` : `COMUNICAZIONE DIRETTA ALLA REGIA // SOS SQUADRA ${currentTeam.id}`}
              </h3>
            </div>
            <p className="text-xs text-neutral-300">
              {isEn
                ? 'Send an urgent request for supplies, technical assistance, or clinical clarification directly to the Course Direction and Faculty.'
                : 'Invia una richiesta urgente di materiali, supporto tecnico o chiarimento clinico direttamente alla Direzione e alla Faculty.'}
            </p>

            <form onSubmit={handleSendSos} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'REQUEST PRIORITY LEVEL:' : 'LIVELLO PRIORITÀ RICHIESTA:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'info', label: isEn ? 'INFO / LOGISTICS' : 'INFO / LOGISTICA', color: 'border-sky-500 text-sky-400' },
                    { id: 'warning', label: isEn ? 'MEDIUM URGENCY' : 'URGENZA MEDIA', color: 'border-orange-500 text-orange-400' },
                    { id: 'emergency', label: isEn ? 'EMERGENCY / SOS' : 'EMERGENZA / SOS', color: 'border-red-600 text-red-400' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSosType(lvl.id as any)}
                      className={`p-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                        sosType === lvl.id
                          ? 'bg-neutral-100 text-black border-neutral-100 font-black'
                          : `bg-neutral-900 ${lvl.color} border-neutral-800`
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'OPERATIONAL MESSAGE:' : 'MESSAGGIO OPERATIVO:'}
                </label>
                <textarea
                  rows={2}
                  value={sosMessage}
                  onChange={(e) => setSosMessage(e.target.value)}
                  placeholder={isEn ? "E.g. Missing REBOA catheter in Shock Room 2; sterile glove replenishment required..." : "Es. Mancanza catetere REBOA in Shock Room 2; richiesta sostituzione guanti sterili..."}
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-xs font-medium text-white focus:outline-hidden focus:border-orange-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {sosSentSuccess ? (
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {isEn ? 'MESSAGE TRANSMITTED SUCCESSFULLY!' : 'MESSAGGIO INVIATO CON SUCCESSO!'}
                  </span>
                ) : (
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {isEn ? 'Sender:' : 'Mittente:'} {currentDiscente.name} ({translateRoleOrSpecialty(currentDiscente.role, language)})
                  </span>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-neutral-100 hover:text-black text-white text-xs font-black uppercase tracking-wider border-2 border-neutral-100 transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEn ? 'TRANSMIT NOW' : 'TRASMETTI ORA'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* LIST OF BROADCAST MESSAGES FOR ME */}
          <div className="bg-neutral-950 border-4 border-neutral-100 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-800">
              <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-tight">
                {isEn ? `RECEIVED ALERTS HISTORY (${myBroadcastAlerts.length})` : `STORICO AVVISI RICEVUTI (${myBroadcastAlerts.length})`}
              </h3>
              <span className="text-xs font-mono text-neutral-400">{isEn ? `Filter: Group ${currentTeam.groupId} & ALL` : `Filtro: Gruppo ${currentTeam.groupId} & ALL`}</span>
            </div>

            <div className="space-y-3">
              {myBroadcastAlerts.length > 0 ? (
                myBroadcastAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border-2 space-y-2 ${
                      alert.priority === 'critical'
                        ? 'bg-red-950/30 border-red-600 text-white'
                        : alert.priority === 'high'
                        ? 'bg-orange-950/20 border-orange-500 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-neutral-400">{alert.timestamp}</span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 ${
                            alert.priority === 'critical'
                              ? 'bg-red-600 text-white'
                              : alert.priority === 'high'
                              ? 'bg-orange-500 text-black'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {alert.priority}
                        </span>
                        <span className="text-[11px] font-bold text-neutral-400">
                          {isEn ? 'From:' : 'Da:'} {alert.senderName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {isEn ? 'Target:' : 'Dest:'} {alert.targetGroups.join(', ')}
                      </span>
                    </div>

                    <h4 className="font-black text-sm uppercase text-white">{alert.title}</h4>
                    <p className="text-xs text-neutral-300 font-medium leading-relaxed">{alert.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-neutral-400 text-xs font-bold">
                  {isEn ? 'No broadcast alerts received for your group.' : 'Nessun messaggio broadcast ricevuto per il tuo gruppo.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: QR PASS & DIGITAL BADGE */}
      {/* ========================================================================= */}
      {activeSubTab === 'qrpass' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Digital Badge Card */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <QRCodeDisplay
                discente={currentDiscente}
                team={currentTeam}
                faculty={assignedFaculty}
                size={220}
                showCard={true}
              />
            </div>

            {/* Information & Instructions Card */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-neutral-950 border-4 border-neutral-100 p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-neutral-800">
                  <QrCode className="w-5 h-5 text-orange-500" />
                  <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-tight">
                    {isEn ? 'PERSONAL ACCESS INSTRUCTIONS' : 'ISTRUZIONI ACCESSO PERSONALE'}
                  </h3>
                </div>

                <div className="space-y-3 text-xs text-neutral-300">
                  <div className="flex items-start gap-2.5 p-3 bg-neutral-900 border border-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-black font-black flex items-center justify-center flex-shrink-0 text-xs">
                      1
                    </span>
                    <div>
                      <h5 className="font-black text-white uppercase">{isEn ? 'SMARTPHONE SCAN' : 'SCANSIONE CON SMARTPHONE'}</h5>
                      <p className="text-neutral-400 mt-0.5">
                        {isEn
                          ? 'Scan the QR code with your smartphone camera or any QR scanner to open your personal live view without needing credentials.'
                          : "Inquadra il codice QR con l'app fotocamera o qualsiasi lettore QR del tuo smartphone per aprire direttamente la tua visuale senza dover effettuare il login."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-neutral-900 border border-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-black font-black flex items-center justify-center flex-shrink-0 text-xs">
                      2
                    </span>
                    <div>
                      <h5 className="font-black text-white uppercase">{isEn ? 'REAL-TIME SYNCHRONIZATION' : 'SINCRONIZZAZIONE IN TEMPO REALE'}</h5>
                      <p className="text-neutral-400 mt-0.5">
                        {isEn
                          ? `Your screen will automatically receive control room broadcasts, live evaluations from tutor ${assignedFaculty.name}, and room changes for each phase.`
                          : `La tua schermata riceverà automaticamente i broadcast della regia, i punteggi live del tuo tutor ${assignedFaculty.name} e il cambio di stanza per ogni fase.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-neutral-900 border border-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center flex-shrink-0 text-xs">
                      3
                    </span>
                    <div>
                      <h5 className="font-black text-white uppercase">{isEn ? 'SOS & SUPPLIES REQUEST' : 'SOS & RICHIESTA PRESIDI'}</h5>
                      <p className="text-neutral-400 mt-0.5">
                        {isEn
                          ? 'From the "ALERTS" tab you can transmit operational messages and urgent SOS alarms directly to control room and faculty workstations.'
                          : 'Dalla scheda "AVVISI" potrai trasmettere messaggi operativi e allarmi SOS direttamente ai computer della regia e della Faculty.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800">
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block mb-2">
                    {isEn ? 'BADGE CODES FOR YOUR 5 SQUAD MEMBERS:' : 'BADGE CODICI DEI TUOI 5 COMPAGNI DI SQUADRA:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {teammates.map((mate) => (
                      <div
                        key={mate.id}
                        onClick={() => setSelectedDiscenteId(mate.id)}
                        className={`p-2 border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          mate.id === currentDiscente.id
                            ? 'bg-neutral-900 border-orange-500 text-white font-bold'
                            : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <span className="truncate">{mate.name}</span>
                        <span className="font-mono text-[10px] font-black text-orange-400 px-1 bg-neutral-900 border border-neutral-700">
                          {mate.badgeCode || mate.id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SWITCHER MODAL: SELECT FROM 60 DISCENTI */}
      {/* ========================================================================= */}
      {isSwitcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs">
          <div className="bg-neutral-950 border-4 border-neutral-100 p-5 sm:p-6 max-w-2xl w-full text-neutral-100 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-500" />
                <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-tight">
                  {isEn ? 'SELECT YOUR LEARNER PROFILE (60 PARTICIPANTS)' : 'SELEZIONA IL TUO PROFILO DISCENTE (60 PARTECIPANTI)'}
                </h3>
              </div>
              <button
                onClick={() => setIsSwitcherOpen(false)}
                className="text-neutral-400 hover:text-white p-1 text-sm font-black cursor-pointer"
              >
                {isEn ? '✕ CLOSE' : '✕ CHIUDI'}
              </button>
            </div>

            {/* Search and Team Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={isEn ? "Search by name, role, hospital, nationality..." : "Cerca per nome, ruolo, ospedale, nazionalità..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-xs font-bold text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto py-1 text-xs">
                <button
                  onClick={() => setTeamFilter('ALL')}
                  className={`px-2.5 py-1 font-black uppercase text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                    teamFilter === 'ALL'
                      ? 'bg-neutral-100 text-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {isEn ? 'ALL SQUADS' : 'TUTTE LE SQUADRE'}
                </button>
                {teams.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTeamFilter(t.id)}
                    className={`px-2.5 py-1 font-black uppercase text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                      teamFilter === t.id
                        ? 'bg-orange-500 text-black font-black'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {isEn ? `SQ. #${t.id} (${t.groupId})` : `SQ. #${t.id} (${t.groupId})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Discenti List */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {filteredDiscentiForSwitcher.map((d) => {
                const isSelected = d.id === currentDiscente.id;
                const dTeam = teams.find((t) => t.id === d.teamId);
                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      setSelectedDiscenteId(d.id);
                      setIsSwitcherOpen(false);
                    }}
                    className={`p-3 border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-neutral-900 border-orange-500 shadow-md'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-white uppercase">{d.name}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300">
                          {dTeam?.name} (GRP {dTeam?.groupId})
                        </span>
                        <span className="text-[10px] text-neutral-400">🌍 {d.nationality}</span>
                      </div>
                      <p className="text-xs text-orange-400 font-semibold">{translateRoleOrSpecialty(d.role, language)}</p>
                      {d.organization && (
                        <p className="text-[11px] text-neutral-500 truncate">{d.organization}</p>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <span className="px-2.5 py-1 bg-orange-500 text-black text-xs font-black uppercase">
                          {isEn ? 'ACTIVE' : 'ATTIVO'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-700 text-xs font-bold uppercase">
                          {isEn ? 'CHOOSE' : 'SCEGLI'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTEXT-AWARE FLOATING ACTION BUTTON (FAB) FOR SCENARIO BRIEFING */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsBriefModalOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-black font-black uppercase text-xs tracking-wider rounded-full shadow-[0_0_25px_rgba(249,115,22,0.5)] border-2 border-orange-300 transition-all transform hover:scale-105 cursor-pointer animate-bounce"
          title={isEn ? 'View Current Scenario Brief' : 'Visualizza Briefing Scenario Attuale'}
        >
          <span className="w-6 h-6 rounded-full bg-black text-orange-400 flex items-center justify-center flex-shrink-0 shadow">
            <FileText className="w-3.5 h-3.5" />
          </span>
          <div className="text-left hidden sm:block">
            <div className="text-[9px] font-mono font-bold text-black/80">{isEn ? 'QUICK BRIEF' : 'BRIEFING RAPIDO'}</div>
            <div className="text-xs font-black truncate max-w-[140px]">{myCurrentActivity ? myCurrentActivity.title : (currentSlot?.title || 'Scenario')}</div>
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-black rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-black rounded-full" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* CONTEXT-AWARE SCENARIO BRIEF MODAL */}
      {/* ========================================================================= */}
      {isBriefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs">
          <div className="bg-neutral-950 border-4 border-orange-500 p-5 sm:p-7 max-w-xl w-full text-neutral-100 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-orange-500/20 border border-orange-500 text-orange-400">
                  <Activity className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <span className="text-[10px] font-mono text-orange-400 font-black uppercase tracking-wider block">
                    {isEn ? `TEAM ${currentTeam.name} — ACTIVE BRIEFING` : `SQUADRA ${currentTeam.name} — BRIEFING ATTIVO`}
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-tight">
                    {myCurrentActivity ? myCurrentActivity.title : (currentSlot?.title || 'Scenario Brief')}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsBriefModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 text-sm font-black cursor-pointer bg-neutral-900 border border-neutral-800 px-2 py-1"
              >
                {isEn ? '✕ CLOSE' : '✕ CHIUDI'}
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] font-mono text-neutral-400 block">{isEn ? 'TIME SLOT / ORARIO' : 'ORARIO SLOT'}</span>
                  <span className="font-bold font-mono text-white text-sm">{currentSlot?.timeRange || '08:30 - 10:00'}</span>
                </div>
                <div className="p-2.5 bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] font-mono text-neutral-400 block">{isEn ? 'ROOM / STATION / STANZA' : 'POSTAZIONE / STANZA'}</span>
                  <span className="font-bold text-orange-400 text-sm">
                    {myCurrentActivity?.location || (isExtraScenario ? 'Extra TCCC Field' : 'Shock Room Alfa')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-neutral-900/90 border border-orange-500/40 space-y-2">
                <h4 className="font-black text-orange-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-orange-400" />
                  {isEn ? 'Clinical & Tactical Objective' : 'Obiettivo Clinico e Tattico'}
                </h4>
                <p className="text-neutral-200 leading-relaxed">
                  {myCurrentActivity?.subtitle || (isEn
                    ? `Execute trauma resuscitation protocol for ${currentTeam.name} with rigorous Closed-Loop communication and immediate life-saving interventions.`
                    : `Eseguire il protocollo di rianimazione trauma per la ${currentTeam.name} con rigorosa comunicazione a circuito chiuso e interventi salvavita immediati.`)}
                </p>
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold">
                  {isEn ? 'Assigned Mentor / Tutor' : 'Tutor di Riferimento'}
                </span>
                <div className="flex items-center gap-2 text-white font-bold">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>{assignedFaculty.name}</span>
                  <span className="text-xs font-normal text-neutral-400">({assignedFaculty.specialty})</span>
                </div>
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold">
                  {isEn ? 'Your Team Members (5 Operators)' : 'I tuoi compagni di squadra (5 Operatori)'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {teammates.map((mate) => (
                    <span
                      key={mate.id}
                      className={`px-2 py-1 text-[11px] font-bold border ${
                        mate.id === currentDiscente.id
                          ? 'bg-orange-500 text-black border-orange-400 font-black'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800'
                      }`}
                    >
                      {mate.name} ({mate.role})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setIsBriefModalOpen(false)}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs tracking-wider cursor-pointer shadow"
              >
                {isEn ? 'UNDERSTOOD — RETURN TO LIVE VIEW' : 'HO COMPRESO — TORNA ALLA SCHERMATA LIVE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
