import React, { useState, useEffect } from 'react';
import {
  Award,
  Clock,
  User,
  Activity,
  Lock,
  Users,
  CheckCircle2,
  X,
  FileText,
  Bell,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { GroupType, Faculty, TimelineSlot } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { DaySelectorToggle } from '../DaySelectorToggle';
import { FacultyScenariValutazioniModal } from '../faculty/FacultyScenariValutazioniModal';
import { ScenarioEvaluationModal } from '../faculty/ScenarioEvaluationModal';
import { FacultyScenarioRoleAssigner } from '../faculty/FacultyScenarioRoleAssigner';
import { OperatorUnlockModal } from '../common/OperatorUnlockModal';
import { PreCoursePublicCountdown } from '../common/PreCoursePublicCountdown';
import { translateSlot, translateLocation } from '../../utils/courseTranslation';
import { ScenarioLiveSyncScreen } from '../common/ScenarioLiveSyncScreen';
import { FacultyPreAlertBanner } from '../faculty/FacultyPreAlertBanner';
import { StaffBalancingModal } from '../common/StaffBalancingModal';
import { balanceFacultyWorkload, BalancingReport } from '../../utils/staffBalancer';
import {
  detectPreAllertaForGroup,
  detectDebriefingForGroup,
  detectPracticalScenarioForGroup,
} from '../../utils/scenarioRoleHelper';
import { TimelineSyncNavigator } from '../common/TimelineSyncNavigator';
import { MascalFacultyTriageDashboard } from '../faculty/MascalFacultyTriageDashboard';

export const FacultyView: React.FC = () => {
  const {
    activeDay,
    activeSlotIndex,
    currentSlot,
    timerSeconds,
    isTimerRunning,
    faculty,
    discenti,
    selectedFacultyId,
    setSelectedFacultyId,
    teams,
    simulatorPatients,
    evaluations,
    saveEvaluation,
    bulkUpdateFaculty,
    sendCourseMessage,
    canSelectOperator,
    language,
    isCourseStarted,
    courseStartSchedule,
    timeRemainingMs,
  } = useCourse();

  const isEn = language === 'en';
  const isPreCourse = !isCourseStarted || (courseStartSchedule?.isGateEnabled && timeRemainingMs > 0);

  // Modal & Panel state
  const [showScenariValutazioniModal, setShowScenariValutazioniModal] = useState(false);
  const [showDirectEvalModal, setShowDirectEvalModal] = useState(false);
  const [showRoleSelectionModal, setShowRoleSelectionModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showManualSquadraBox, setShowManualSquadraBox] = useState(false);
  const [facultyBalancingReport, setFacultyBalancingReport] = useState<BalancingReport<Faculty> | null>(null);
  const [isBalancingModalOpen, setIsBalancingModalOpen] = useState(false);

  // Stato notifiche visuali automatiche T-15 min (Flash bordo rosso + Banner discreto)
  const [isPreAlertFlashMuted, setIsPreAlertFlashMuted] = useState(false);
  const [isPreAlertBannerDismissed, setIsPreAlertBannerDismissed] = useState(false);

  const rawFaculty = faculty.find((f) => f.id === selectedFacultyId) || faculty[0];
  const currentFaculty = rawFaculty
    ? {
        ...rawFaculty,
        badgeCode: rawFaculty.badgeCode || (rawFaculty.id ? rawFaculty.id.toUpperCase() : 'FAC-01'),
      }
    : {
        id: 'fac-1',
        name: 'Dr. Marco Rossi',
        title: 'Medico di Anestesia e Rianimazione',
        specialty: 'Trauma Team Leader',
        nationality: 'Italiana',
        assignedTeamId: 1,
        organization: 'Ospedale Policlinico Universitario',
        badgeCode: 'FAC-01',
        phone: '+39 333 1234567',
        assignedStations: ['TCCC 1', 'Shock Room 1'],
      };

  const assignedTeam = teams.find((t) => t.id === currentFaculty.assignedTeamId);
  const facultyGroup: GroupType = assignedTeam
    ? assignedTeam.groupId
    : currentFaculty.assignedTeamId <= 3
    ? 'A'
    : currentFaculty.assignedTeamId <= 6
    ? 'B'
    : currentFaculty.assignedTeamId <= 9
    ? 'C'
    : 'D';
  const assignedTeamDiscenti = discenti.filter((d) => d.teamId === currentFaculty.assignedTeamId);

  // Stato consultazione slot vs sincronizzazione live Regia
  const [inspectedSlot, setInspectedSlot] = useState<TimelineSlot | null>(null);

  const rawDayMasterSlots = INITIAL_TIMELINE_SLOTS.filter((s) => s.day === activeDay);
  const dayMasterSlots = rawDayMasterSlots.map((s) => translateSlot(s, language));

  const rawMasterCurrentSlot =
    INITIAL_TIMELINE_SLOTS[activeSlotIndex] || rawDayMasterSlots[0] || INITIAL_TIMELINE_SLOTS[0];
  const liveCurrentSlot = currentSlot || rawMasterCurrentSlot;
  const effectiveSlot = inspectedSlot || liveCurrentSlot;
  const isLiveSync = inspectedSlot === null || inspectedSlot.id === liveCurrentSlot?.id;

  const slotIdxInDay = dayMasterSlots.findIndex(
    (s) => s.id === (effectiveSlot?.id || liveCurrentSlot?.id)
  );
  const effectiveSlotIdx = slotIdxInDay >= 0 ? slotIdxInDay : 0;

  // Personalized Individual Faculty Timeline based on facultyInvolved or assigned group
  const rawPersonalizedTimeline = dayMasterSlots
    .map((slot) => {
      let matchedActivity: any = null;
      let matchedGroup: GroupType | null = null;
      const facBadgeUpper = (currentFaculty.badgeCode || '').toUpperCase();
      const facIdLower = (currentFaculty.id || '').toLowerCase();

      if (slot.groupActivities) {
        for (const [gKey, gAct] of Object.entries(slot.groupActivities)) {
          const act: any = gAct;
          const involvesFaculty =
            act.facultyInvolved &&
            act.facultyInvolved.some(
              (f: string) =>
                (facBadgeUpper && f.toUpperCase() === facBadgeUpper) ||
                (facIdLower && f.toLowerCase() === facIdLower)
            );
          if (involvesFaculty || gKey === facultyGroup) {
            matchedActivity = act;
            matchedGroup = gKey as GroupType;
            if (involvesFaculty) break;
          }
        }
      }
      return {
        slot,
        activity: matchedActivity,
        group: matchedGroup || facultyGroup,
      };
    })
    .filter((item) => item.activity !== null);

  // Helper to check if an activity is a continuous Skill Workshop (WS1 or WS2)
  const isContinuousWorkshopItem = (act: any, slotId?: string) => {
    if (!act) return false;
    const txt = `${act.title || ''} ${act.subtitle || ''} ${act.location || ''}`.toLowerCase();
    const sId = (slotId || '').toLowerCase();
    const isBlockOrPreAlert = /d[23]-(b[1-4]|prealert)/.test(sId);
    return (
      isBlockOrPreAlert &&
      (txt.includes('ws1') ||
        txt.includes('ws2') ||
        txt.includes('skills workshop') ||
        txt.includes('skill workshop')) &&
      !txt.includes('pausa') &&
      !txt.includes('raduno') &&
      !txt.includes('tccc') &&
      !txt.includes('shock') &&
      !txt.includes('standby')
    );
  };

  // Merge consecutive Workshop sub-slots into a single continuous Workshop block (no operational sub-phases)
  const personalizedTimeline: Array<{
    slot: typeof dayMasterSlots[0];
    activity: any;
    group: GroupType;
    mergedSlotIds: string[];
    isMergedWorkshop: boolean;
  }> = [];

  for (const item of rawPersonalizedTimeline) {
    const isWS = isContinuousWorkshopItem(item.activity, item.slot.id);
    const prev = personalizedTimeline[personalizedTimeline.length - 1];

    if (
      isWS &&
      prev &&
      prev.isMergedWorkshop &&
      prev.activity.title === item.activity.title &&
      prev.activity.location === item.activity.location
    ) {
      const startPart = prev.slot.timeRange.split('-')[0]?.trim() || prev.slot.timeRange;
      const endPart = item.slot.timeRange.split('-')[1]?.trim() || item.slot.timeRange;
      prev.slot = {
        ...prev.slot,
        timeRange: `${startPart} - ${endPart}`,
        durationMinutes: (prev.slot.durationMinutes || 0) + (item.slot.durationMinutes || 0),
        title: isEn
          ? `${item.activity.title} • Continuous Session (No Sub-Phases)`
          : `${item.activity.title} • Sessione Continua (Senza Fasi Operative)`,
      };
      prev.mergedSlotIds.push(item.slot.id);
    } else {
      personalizedTimeline.push({
        slot: isWS
          ? {
              ...item.slot,
              title: isEn
                ? `${item.activity.title} • Continuous Session (No Sub-Phases)`
                : `${item.activity.title} • Sessione Continua (Senza Fasi Operative)`,
            }
          : item.slot,
        activity: item.activity,
        group: item.group,
        mergedSlotIds: [item.slot.id],
        isMergedWorkshop: isWS,
      });
    }
  }

  const filteredTimeline = personalizedTimeline.filter((item) => {
    return item.mergedSlotIds.some((id) => {
      const sIdx = dayMasterSlots.findIndex((s) => s.id === id);
      return sIdx >= effectiveSlotIdx;
    });
  });

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentActiveItem = personalizedTimeline.find((item) =>
    item.mergedSlotIds.includes(effectiveSlot?.id || '')
  );
  const currentActivity = currentActiveItem?.activity;
  const currentActTitle = (currentActivity?.title || '').toLowerCase();
  const currentActSubtitle = (currentActivity?.subtitle || '').toLowerCase();
  const currentActLoc = (currentActivity?.location || '').toLowerCase();
  const actText = `${currentActTitle} ${currentActSubtitle} ${currentActLoc}`;

  const isWorkshopActivity = Boolean(
    currentActiveItem?.isMergedWorkshop ||
      ((currentActivity?.activityType === 'workshop' ||
        actText.includes('ws1') ||
        actText.includes('ws2') ||
        actText.includes('workshop')) &&
        !actText.includes('tccc') &&
        !actText.includes('shock') &&
        !actText.includes('standby') &&
        !actText.includes('pre-allerta') &&
        !actText.includes('preallerta'))
  );

  const isPauseOrResetActivity =
    !isWorkshopActivity &&
    (actText.includes('pausa') ||
      actText.includes('ristoro') ||
      actText.includes('pranzo') ||
      actText.includes('riposo') ||
      actText.includes('break') ||
      actText.includes('lunch') ||
      actText.includes('reset') ||
      actText.includes('turnaround'));

  const isSetupOrPlenary =
    actText.includes('setup') ||
    actText.includes("patto d'aula") ||
    actText.includes('accoglienza') ||
    actText.includes('plenaria') ||
    actText.includes('raduno') ||
    actText.includes('ricognizione');

  const isTCCC =
    !isWorkshopActivity &&
    !isPauseOrResetActivity &&
    !isSetupOrPlenary &&
    (actText.includes('tccc') ||
      actText.includes('tattic') ||
      actText.includes('tactical') ||
      actText.includes('under fire') ||
      currentActivity?.activityType === 'scenario_extra');

  const isShockRoom =
    !isWorkshopActivity &&
    !isPauseOrResetActivity &&
    !isSetupOrPlenary &&
    (actText.includes('shock') ||
      actText.includes('ospedale da campo') ||
      actText.includes('box sr') ||
      currentActivity?.activityType === 'scenario_intra');

  const rawCurrentIdx = rawPersonalizedTimeline.findIndex((item) => item.slot.id === currentSlot?.id);
  const nextTimelineItem = rawCurrentIdx >= 0 ? rawPersonalizedTimeline[rawCurrentIdx + 1] : undefined;

  // Strict per-group Pre-Allerta detection (15 min before TCCC T0, or Min 15-30 before Shock Room :30 Handover/T0)
  const groupPreAlertInfo = detectPreAllertaForGroup(currentSlot, facultyGroup);
  const groupDebriefInfo = detectDebriefingForGroup(currentSlot, facultyGroup);
  const currentPracticalScenarioInfo = detectPracticalScenarioForGroup(currentSlot, facultyGroup);
  const nextPracticalScenarioInfo = detectPracticalScenarioForGroup(
    nextTimelineItem?.slot,
    facultyGroup
  );

  // Trigger automatico anche quando mancano <= 15 min (900s) allo slot T0 di avvio scenario TCCC o Shock Room
  const isCountdown15MinToT0 =
    !isWorkshopActivity &&
    !currentPracticalScenarioInfo.isScenario &&
    !groupDebriefInfo.isDebriefing &&
    nextPracticalScenarioInfo.isScenario &&
    timerSeconds > 0 &&
    timerSeconds <= 900;

  const activeScenarioType: 'TCCC' | 'SHOCKROOM' =
    groupPreAlertInfo.scenarioType ||
    (isCountdown15MinToT0 ? nextPracticalScenarioInfo.scenarioType : null) ||
    groupDebriefInfo.scenarioType ||
    (isShockRoom ? 'SHOCKROOM' : 'TCCC');

  // Rilevamento integrato fase di Pre-Allerta T-15 min (esclusi i Workshop)
  const isEffectivePreAllerta =
    !isWorkshopActivity &&
    Boolean(
      groupPreAlertInfo.isPreAllerta ||
        isCountdown15MinToT0
    );

  // Riattiva automaticamente le notifiche visuali (flash bordo rosso + banner discreto) all'apertura di una nuova finestra T-15
  useEffect(() => {
    if (isEffectivePreAllerta) {
      setIsPreAlertFlashMuted(false);
      setIsPreAlertBannerDismissed(false);
    }
  }, [isEffectivePreAllerta, currentSlot?.id, selectedFacultyId, activeScenarioType]);

  // Rilevamento sessione notturna MASCAL (Day 1 ore 21:00 - 23:00)
  const isMascalSession = Boolean(
    effectiveSlot?.id === 'd2-mascal-scenario' ||
    effectiveSlot?.id === 'd2-gate-discenti-notturno' ||
    effectiveSlot?.period === 'notturno' ||
    (effectiveSlot?.timeRange || '').includes('21:00')
  );

  // Rilevamento integrato fase di Debriefing (esclusi i Workshop)
  const isEffectiveDebriefing =
    !isWorkshopActivity &&
    Boolean(groupDebriefInfo.isDebriefing);

  const isPracticalScenarioPhase =
    !isWorkshopActivity &&
    (isTCCC || isShockRoom) &&
    !isEffectiveDebriefing &&
    !isEffectivePreAllerta &&
    !actText.includes('briefing shock room');
  const isEffectiveScenarioRunning = isPracticalScenarioPhase;

  // Valutazione clinica associata alla squadra e paziente del tutor (1:1) nel blocco/giorno attivo
  const currentTeamPatientId = ((currentFaculty.assignedTeamId - 1) % 3) + 1;
  const currentSlotPeriod = currentSlot?.period || 'mattina';
  const targetPatient =
    simulatorPatients.find(
      (p) =>
        p.day === activeDay &&
        p.period === currentSlotPeriod &&
        (p.teamExtraAssigned === currentFaculty.assignedTeamId ||
          p.teamIntraAssigned === currentFaculty.assignedTeamId)
    ) ||
    simulatorPatients.find(
      (p) =>
        p.day === activeDay &&
        (p.teamExtraAssigned === currentFaculty.assignedTeamId ||
          p.teamIntraAssigned === currentFaculty.assignedTeamId)
    ) ||
    simulatorPatients.find((p) => p.id === currentTeamPatientId) ||
    null;

  // Determining upcoming scenario details for pre-alert banner
  const targetScenarioTitle =
    activeScenarioType === 'SHOCKROOM'
      ? isEn
        ? 'Shock Room High-Fidelity Scenario (ABCDE Approach)'
        : 'Scenario Shock Room Alta Fedeltà (Approccio ABCDE & Emodinamica)'
      : isEn
      ? 'TCCC Under Fire Scenario (Stop the Bleed & Litter Extraction)'
      : 'Scenario TCCC Under Fire (Stop the Bleed & Estrazione Barellata)';

  const targetStation =
    activeScenarioType === 'SHOCKROOM'
      ? `Box Shock Room ${currentTeamPatientId}`
      : `Ambiente Tattico ${currentTeamPatientId}`;

  const targetScenarioTime =
    currentSlot?.timeRange?.split('-')[1]?.trim() ||
    nextTimelineItem?.slot?.timeRange?.split('-')[0]?.trim() ||
    '09:00';

  const assignedRolesCount = assignedTeamDiscenti.filter((d) => Boolean(d.activeScenarioRole)).length;
  const isTeamRolesCompiled =
    assignedTeamDiscenti.length > 0 && assignedRolesCount === assignedTeamDiscenti.length;

  // Flash bordo rosso attivo quando siamo nei 15 minuti prima del T0 e i ruoli non sono ancora tutti confermati (e non silenziato)
  const isRedBorderFlashActive =
    isEffectivePreAllerta && !isTeamRolesCompiled && !isPreAlertFlashMuted;

  const currentEvaluation = evaluations.find(
    (ev) =>
      ev.teamId === currentFaculty.assignedTeamId &&
      (targetPatient ? ev.patientId === targetPatient.id : ev.day === activeDay || !ev.day)
  );
  const evaluationAvgScore = currentEvaluation
    ? (
        (currentEvaluation.scores.abcdeApproach +
          currentEvaluation.scores.technicalSkills +
          currentEvaluation.scores.teamworkLeadership +
          currentEvaluation.scores.handoverSbar +
          currentEvaluation.scores.safetyTiming) /
        5
      ).toFixed(1)
    : null;

  // Helper per etichetta singola evento nella timeline Faculty (senza titoli cumulativi multi-gruppo)
  const getSingleEventCategoryLabel = (activity: any, isMergedWorkshop: boolean) => {
    if (isMergedWorkshop) {
      return isEn ? 'CONTINUOUS WORKSHOP (90 MIN)' : 'WORKSHOP CONTINUO (90 MIN)';
    }
    const t = `${activity?.title || ''} ${activity?.subtitle || ''}`.toLowerCase();
    const aType = activity?.activityType || '';
    if (t.includes('pre-allerta shock') || t.includes('standby attivo')) {
      return isEn ? 'PRE-ALERT SHOCK ROOM (T -15M)' : 'PRE-ALLERTA SHOCK ROOM (T -15M)';
    }
    if (t.includes('pre-allerta tccc') || t.includes('pre-alert tccc')) {
      return isEn ? 'PRE-ALERT TCCC (T -15M)' : 'PRE-ALLERTA TCCC (T -15M)';
    }
    if (t.includes('handover')) {
      return isEn ? 'HANDOVER SBAR 1:1 (:30)' : 'HANDOVER SBAR 1:1 (:30)';
    }
    if (t.includes('debriefing') && t.includes('tccc')) {
      return isEn ? 'DEBRIEFING TCCC' : 'DEBRIEFING TCCC';
    }
    if (t.includes('debriefing') && t.includes('shock')) {
      return isEn ? 'DEBRIEFING SHOCK ROOM' : 'DEBRIEFING SHOCK ROOM';
    }
    if (t.includes('briefing shock room')) {
      return isEn ? 'BRIEFING SHOCK ROOM' : 'BRIEFING SHOCK ROOM';
    }
    if (aType === 'scenario_extra' || t.includes('scenario tccc')) {
      return isEn ? 'TCCC SCENARIO' : 'SCENARIO TCCC';
    }
    if (aType === 'scenario_intra' || t.includes('shock room')) {
      return isEn ? 'SHOCK ROOM SCENARIO' : 'SCENARIO SHOCK ROOM';
    }
    if (t.includes('pausa') || t.includes('pranzo') || t.includes('ristoro')) {
      return isEn ? 'BREAK & RECOVERY' : 'PAUSA & RISTORO';
    }
    return isEn ? 'TRAINING SESSION' : 'SESSIONE FORMATIVA';
  };

  // Pre-Course Standby: Only show personal Anagrafica & Public Countdown until course is started by Regia
  if (isPreCourse) {
    return (
      <div className="space-y-4 sm:space-y-6 pb-12 max-w-5xl mx-auto px-2 sm:px-4 font-mono">
        {/* Header Banner - Faculty View & Selector */}
        <div className="bg-neutral-900 border-2 border-amber-500/60 p-3 sm:p-4 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="px-2.5 sm:px-3 py-1 bg-amber-600 text-black font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 rounded">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {isEn ? 'FACULTY VIEW' : 'VISUALE FACULTY'}
            </span>

            <span className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[11px] sm:text-xs font-bold rounded flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span>DAY 0{activeDay}</span>
            </span>

            <span className="px-2.5 py-1 bg-neutral-950 text-amber-400 font-mono text-[11px] sm:text-xs border border-amber-800/80 flex items-center gap-1.5 rounded">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" /> {isEn ? 'PRE-COURSE STANDBY' : 'STANDBY PRE-CORSO'}
            </span>
          </div>

          {/* Faculty Selector */}
          {canSelectOperator ? (
            <div className="flex items-center gap-2 flex-wrap bg-amber-950/40 p-1.5 border border-amber-700/50 rounded">
              <span className="text-xs font-mono text-amber-300 uppercase font-bold flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Faculty:
              </span>
              <select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                className="bg-neutral-950 text-amber-300 font-mono text-xs border border-amber-700/60 px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-400 max-w-full sm:max-w-xs cursor-pointer font-bold"
              >
                {faculty.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.badgeCode || 'FAC'} • {f.name} ({isEn ? 'Team' : 'Sq.'} {f.assignedTeamId})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-neutral-950 text-amber-300 font-mono text-xs border border-amber-800/80 rounded flex items-center gap-1.5 shadow-inner">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-400/80">Tutor:</span>
                <strong className="text-white text-xs">{currentFaculty.badgeCode || 'FAC'} • {currentFaculty.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowUnlockModal(true)}
                title={isEn ? 'Unlock Selector (Control / Direction)' : 'Sblocca Selettore (Regia / Direzione)'}
                className="p-1.5 text-neutral-500 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* PERSONALIZED FACULTY ANAGRAFICA CARD */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-neutral-950 border-2 border-amber-500/80 p-3.5 sm:p-5 rounded-xl shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-amber-600 text-black font-mono font-black text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-bl">
              {currentFaculty.badgeCode || 'FAC-01'}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-widest">
                <User className="w-4 h-4" /> {isEn ? 'Faculty / Tutor Profile' : 'Profilo Faculty / Tutor'}
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight break-words">
                  {currentFaculty.name}
                </h2>
                {currentFaculty.title && (
                  <p className="text-amber-300 font-medium text-xs sm:text-sm pt-0.5 break-words">
                    {currentFaculty.title}
                  </p>
                )}
                {currentFaculty.specialty && (
                  <p className="text-neutral-400 text-xs pt-0.5 break-words">
                    {currentFaculty.specialty}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-neutral-300">
              {currentFaculty.assignedTeamId > 0 && (
                <div>
                  <span className="block text-[10px] text-neutral-400 uppercase">{isEn ? 'Assigned 1:1 Team:' : 'Squadra 1:1 Assegnata:'}</span>
                  <strong className="text-amber-300 block">
                    {isEn ? `Group ${facultyGroup} • Team #${currentFaculty.assignedTeamId}` : `Gruppo ${facultyGroup} • Squadra #${currentFaculty.assignedTeamId}`}
                  </strong>
                </div>
              )}
              {(currentFaculty.organization || (currentFaculty as any).affiliation) && (
                <div className="truncate">
                  <span className="block text-[10px] text-neutral-400 uppercase">{isEn ? 'Affiliation:' : 'Affiliazione:'}</span>
                  <strong className="text-white truncate block" title={currentFaculty.organization || (currentFaculty as any).affiliation}>
                    {currentFaculty.organization || (currentFaculty as any).affiliation}
                  </strong>
                </div>
              )}
              {currentFaculty.phone && (
                <div>
                  <span className="block text-[10px] text-neutral-400 uppercase">{isEn ? 'Phone / Radio:' : 'Telefono / Radio:'}</span>
                  <strong className="text-amber-300 block">{currentFaculty.phone}</strong>
                </div>
              )}
              {(currentFaculty as any).email && (
                <div className="truncate">
                  <span className="block text-[10px] text-neutral-400 uppercase">Email:</span>
                  <strong className="text-amber-200 truncate block">{(currentFaculty as any).email}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COUNTDOWN PUBBLICO UFFICIALE */}
        <PreCoursePublicCountdown />

        {/* Unlock Modal */}
        <OperatorUnlockModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          roleLabel="Faculty"
        />
      </div>
    );
  }

  return (
    <div
      className={`space-y-4 pb-12 max-w-5xl mx-auto px-2 sm:px-4 font-mono relative transition-all duration-300 ${
        isRedBorderFlashActive
          ? 'ring-2 ring-red-500/90 rounded-xl p-2 sm:p-3 shadow-[0_0_32px_rgba(239,68,68,0.45)] bg-red-950/10'
          : ''
      }`}
    >
      {/* FLASH BORDO ROSSO SUPERIORE E PERIMETRALE AUTOMATICO A T-15 MIN DAL T0 */}
      {isRedBorderFlashActive && (
        <>
          <div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 animate-pulse z-50 pointer-events-none shadow-[0_0_16px_rgba(239,68,68,0.9)]" />
          <div className="fixed inset-0 border-2 sm:border-4 border-red-500/60 pointer-events-none z-40 animate-pulse" />
        </>
      )}

      {/* BANNER DISCRETO AUTOMATICO T-15 MIN: NOTIFICA APERTURA FINESTRA SCELTA RUOLI */}
      {isEffectivePreAllerta && !isPreAlertBannerDismissed && (
        <div
          className={`sticky top-2 z-30 rounded-lg px-3 py-2.5 shadow-2xl border-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 backdrop-blur-md transition-all duration-300 ${
            isTeamRolesCompiled
              ? 'bg-emerald-950/95 border-emerald-500 text-emerald-100 shadow-emerald-950/60'
              : 'bg-red-950/95 border-red-500 text-white shadow-[0_0_24px_rgba(239,68,68,0.5)]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-1.5 rounded-md shrink-0 flex items-center justify-center relative ${
                isTeamRolesCompiled ? 'bg-emerald-500 text-black' : 'bg-red-600 text-white'
              }`}
            >
              {!isTeamRolesCompiled && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
              )}
              <Bell className={`w-4 h-4 ${!isTeamRolesCompiled ? 'animate-bounce' : ''}`} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    isTeamRolesCompiled
                      ? 'bg-emerald-400 text-black'
                      : 'bg-red-500 text-white animate-pulse'
                  }`}
                >
                  {isEn ? 'T -15 MIN TO T0 ALERT' : 'NOTIFICA T -15 MIN AL T0'}
                </span>
                <span className="text-xs font-black uppercase tracking-tight text-white truncate">
                  {activeScenarioType === 'SHOCKROOM'
                    ? isEn
                      ? 'Shock Room Role Selection Window Open'
                      : 'Finestra Scelta Ruoli Aperta • Shock Room'
                    : isEn
                    ? 'TCCC Role Selection Window Open'
                    : 'Finestra Scelta Ruoli Aperta • Scenario TCCC'}
                </span>
                <span className="px-1.5 py-0.5 bg-black/70 border border-amber-400/80 text-amber-300 rounded text-[10px] font-bold">
                  🏁 T0 {targetScenarioTime} (-{formatTimer(timerSeconds)})
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isTeamRolesCompiled
                      ? 'bg-emerald-900 border border-emerald-400 text-emerald-200'
                      : 'bg-red-900/80 border border-red-400 text-red-200'
                  }`}
                >
                  {isTeamRolesCompiled
                    ? isEn
                      ? '5/5 Roles Confirmed'
                      : '5/5 Ruoli Confermati'
                    : isEn
                    ? `${assignedRolesCount}/5 Roles Assigned`
                    : `${assignedRolesCount}/5 Ruoli Assegnati`}
                </span>
              </div>
              <p className="text-[11px] text-neutral-200 truncate mt-0.5">
                {isTeamRolesCompiled
                  ? isEn
                    ? `Team #${currentFaculty.assignedTeamId} roles are ready for ${targetStation}.`
                    : `I 5 ruoli operativi della Squadra #${currentFaculty.assignedTeamId} sono pronti per ${targetStation}.`
                  : isEn
                  ? `15 minutes before T0 (${targetStation}): assign Team Leader and 4 Operator roles for Team #${currentFaculty.assignedTeamId}.`
                  : `A 15 minuti dal T0 (${targetStation}): assegna Team Leader e 4 Operatori per la Squadra #${currentFaculty.assignedTeamId}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setShowRoleSelectionModal(true)}
              className={`px-3 py-1.5 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow ${
                isTeamRolesCompiled
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-black'
                  : 'bg-amber-400 hover:bg-amber-300 text-black ring-2 ring-white/50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-black" />
              <span>
                {isTeamRolesCompiled
                  ? isEn
                    ? 'Review Roles'
                    : 'Verifica Ruoli'
                  : isEn
                  ? 'Choose Roles Now'
                  : 'Scegli Ruoli Ora'}
              </span>
            </button>

            {!isTeamRolesCompiled && (
              <button
                type="button"
                onClick={() => setIsPreAlertFlashMuted((prev) => !prev)}
                className="px-2 py-1.5 bg-black/60 hover:bg-black/80 text-neutral-200 border border-neutral-600 rounded text-[10px] font-bold cursor-pointer transition-colors"
                title={
                  isEn
                    ? 'Toggle red border flash'
                    : 'Attiva/Silenzia il flash bordo rosso'
                }
              >
                {isPreAlertFlashMuted
                  ? isEn
                    ? '🔔 Flash Off'
                    : '🔔 Flash Off'
                  : isEn
                  ? '🔕 Mute Flash'
                  : '🔕 Silenzia Flash'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsPreAlertBannerDismissed(true)}
              className="p-1.5 bg-black/50 hover:bg-black/80 text-neutral-300 hover:text-white rounded cursor-pointer transition-colors"
              title={isEn ? 'Dismiss notification banner' : 'Chiudi banner notifica'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Sincronizzazione automatica con timeline di Regia e navigatore consultazione slot */}
      <TimelineSyncNavigator
        currentSlot={effectiveSlot}
        masterCurrentSlot={liveCurrentSlot}
        isLiveSync={isLiveSync}
        onSelectSlot={(slot) => setInspectedSlot(slot)}
        onSyncToLive={() => setInspectedSlot(null)}
        roleLabel={isEn ? `Faculty Tutor (${currentFaculty.badgeCode})` : `Tutor Didattico (${currentFaculty.badgeCode})`}
        stationContext={
          isEn
            ? `Team ${currentFaculty.assignedTeamId} (Group ${facultyGroup}) • 1:1 Clinical Supervision`
            : `Squadra ${currentFaculty.assignedTeamId} (Gruppo ${facultyGroup}) • Tutor 1:1`
        }
      />

      {/* ========================================================================= */}
      {/* BARRA COMANDI OPERATIVA: BILANCIAMENTO DIDATTICO ANAGRAFICA FACULTY      */}
      {/* ========================================================================= */}
      <div className="bg-neutral-950 border-2 border-emerald-500/80 p-3.5 sm:p-4 rounded-xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-2 py-0.5 bg-emerald-600 text-black font-black uppercase tracking-wider rounded">
              MOTORE DI BILANCIAMENTO
            </span>
            <span className="text-emerald-300 font-bold">
              Anagrafica Faculty ({faculty.length} Tutor Clinici • FAC-01..12)
            </span>
            <span className="px-2 py-0.2 bg-black border border-emerald-500/40 text-neutral-300 text-[10px] rounded">
              Rapporto 1:1 Squadre & Parità Cognitiva
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 font-sans max-w-3xl leading-relaxed">
            Distribuzione omogenea per carico didattico e postazioni tattiche (TCCC under fire, Box Shock Room, Skill Workshops) con mantenimento rigoroso del rapporto 1:1 tra le 12 Faculty e le 12 Squadre per garantire continuità didattica e debriefing SBAR coerente.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const report = balanceFacultyWorkload(faculty, teams, simulatorPatients);
            setFacultyBalancingReport(report);
            setIsBalancingModalOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider rounded cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all shrink-0 border border-emerald-400"
        >
          <Scale className="w-4 h-4 text-black shrink-0" />
          <span>⚖️ Ribilancia Carico Didattico 1:1</span>
        </button>
      </div>

      {/* 1. HEADER PRINCIPALE UNIFICATO (Giorno, Fase, Timer, Selettore Tutor & Azioni Rapide) */}
      <div
        className={`bg-neutral-900 border-2 p-3 sm:p-4 shadow-lg space-y-3 transition-all duration-300 ${
          isRedBorderFlashActive
            ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
            : 'border-amber-500/60'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-amber-600 text-black font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 rounded">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {isEn ? 'FACULTY VIEW' : 'VISUALE FACULTY'}
            </span>

            <DaySelectorToggle variant="public" />

            <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 text-[11px] sm:text-xs border border-neutral-800 flex items-center gap-1.5 rounded">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              {currentActiveItem?.isMergedWorkshop
                ? `${isEn ? 'WORKSHOP' : 'WORKSHOP'} (${currentActiveItem.slot.timeRange})`
                : `${isEn ? 'PHASE' : 'FASE'} ${effectiveSlotIdx + 1}/${dayMasterSlots.length} (${currentSlot?.timeRange || ''})`}
            </span>

            <span className="px-2 py-0.5 bg-neutral-950 text-amber-400 border border-neutral-800 text-[11px] sm:text-xs flex items-center gap-1.5 rounded font-bold">
              <Clock className={`w-3 h-3 ${isTimerRunning ? 'text-amber-400 animate-spin' : 'text-neutral-400'}`} />
              {formatTimer(timerSeconds)}
            </span>

            {isEffectivePreAllerta && (
              <button
                type="button"
                onClick={() => {
                  setIsPreAlertBannerDismissed(false);
                  setShowRoleSelectionModal(true);
                }}
                className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-black uppercase flex items-center gap-1.5 cursor-pointer border ${
                  isTeamRolesCompiled
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-red-600 border-red-400 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>
                  {isEn
                    ? `T -15M ROLE WINDOW (${assignedRolesCount}/5)`
                    : `FINESTRA RUOLI T -15M (${assignedRolesCount}/5)`}
                </span>
              </button>
            )}
          </div>

          {/* Faculty Selector */}
          {canSelectOperator ? (
            <div className="flex items-center gap-2 flex-wrap bg-amber-950/40 p-1.5 border border-amber-700/50 rounded">
              <span className="text-xs text-amber-300 uppercase font-bold flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Faculty:
              </span>
              <select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                className="bg-neutral-950 text-amber-300 text-xs border border-amber-700/60 px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-400 max-w-full sm:max-w-xs cursor-pointer font-bold"
              >
                {faculty.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.badgeCode || 'FAC'} • {f.name} ({isEn ? 'Team' : 'Sq.'} {f.assignedTeamId})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-neutral-950 text-amber-300 text-xs border border-amber-800/80 rounded flex items-center gap-1.5 shadow-inner">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <strong className="text-white text-xs">{currentFaculty.badgeCode || 'FAC'} • {currentFaculty.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowUnlockModal(true)}
                title={isEn ? 'Unlock Selector (Control / Direction)' : 'Sblocca Selettore (Regia / Direzione)'}
                className="p-1.5 text-neutral-500 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* BARRA COMPATTA QUALIFICA, RELAZIONE 1:1 & STRUMENTI TUTOR */}
        <div className="pt-2.5 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap text-neutral-300">
            <span className="px-2 py-0.5 bg-orange-950/60 border border-orange-600/60 text-orange-300 font-bold rounded text-[11px]">
              {isEn ? `GROUP ${facultyGroup} • TEAM #${currentFaculty.assignedTeamId}` : `GRUPPO ${facultyGroup} • SQUADRA #${currentFaculty.assignedTeamId}`}
            </span>
            <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 text-pink-300 font-bold rounded text-[11px]">
              {targetPatient
                ? isEn
                  ? `Patient #${targetPatient.id} (${targetPatient.scenarioCode})`
                  : `Paziente #${targetPatient.id} (${targetPatient.scenarioCode})`
                : isEn
                ? `Station #${currentTeamPatientId}`
                : `Postazione #${currentTeamPatientId}`}
            </span>
            {(currentFaculty.title || currentFaculty.organization) && (
              <span className="text-neutral-400 text-[11px] truncate">
                {[currentFaculty.title, currentFaculty.organization].filter(Boolean).join(' • ')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Pulsante rapido Scelta Ruoli Squadra (in Pre-Allerta o Scenario) o Anagrafica Squadra */}
            {isEffectivePreAllerta || isEffectiveScenarioRunning ? (
              <button
                type="button"
                onClick={() => setShowRoleSelectionModal(true)}
                className={`px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  isEffectivePreAllerta && !isTeamRolesCompiled
                    ? 'bg-red-600 hover:bg-red-500 text-white border border-red-300 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                    : 'bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-500/80'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>
                  {isEn ? 'Role Selection Menu (Modal)' : 'Menu Scelta Ruoli (Modale)'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowManualSquadraBox((prev) => !prev)}
                className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-amber-300 border border-neutral-700 rounded text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {showManualSquadraBox
                    ? isEn
                      ? 'Hide Squad (5)'
                      : 'Nascondi Squadra (5)'
                    : isEn
                    ? 'View Squad (5)'
                    : 'Anagrafica Squadra (5)'}
                </span>
              </button>
            )}

            {/* Pulsante Scenari & Valutazioni */}
            <button
              type="button"
              onClick={() => {
                if (isEffectiveDebriefing && targetPatient) {
                  setShowDirectEvalModal(true);
                } else {
                  setShowScenariValutazioniModal(true);
                }
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] uppercase tracking-wider rounded shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-black" />
              <span>
                📋{' '}
                {isEffectiveDebriefing
                  ? isEn
                    ? 'Evaluation Scorecard'
                    : 'Scheda di Valutazione'
                  : isEn
                  ? 'Scenarios & Evaluations'
                  : 'Scenari & Valutazioni'}
              </span>
              {evaluationAvgScore && (
                <span className="px-1.5 py-0.2 bg-black text-amber-300 rounded text-[10px]">
                  {evaluationAvgScore}⭐
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. BANNER PRE-ALLERTA T-15 (Visibile in Pre-Allerta TCCC o Pre-Allerta Shock Room, con pulsante rapido per la finestra modale Scelta Ruoli) */}
      {isEffectivePreAllerta && (
        <FacultyPreAlertBanner
          currentFaculty={currentFaculty}
          assignedTeam={assignedTeam}
          assignedTeamDiscenti={assignedTeamDiscenti}
          targetPatient={targetPatient}
          targetScenarioTitle={targetScenarioTitle}
          targetScenarioTime={targetScenarioTime}
          targetStation={targetStation}
          scenarioType={activeScenarioType}
          timerSeconds={timerSeconds}
          isTimerRunning={isTimerRunning}
          onOpenRoleAssigner={() => setShowRoleSelectionModal(true)}
          isEn={isEn}
        />
      )}

      {/* 3. QUADRO FASE ATTIVA (Scenario TCCC / Scenario Shock Room / Workshop separati) */}
      <ScenarioLiveSyncScreen
        role="faculty"
        facultyCustomInfo={{
          faculty: currentFaculty,
          assignedTeam: assignedTeam,
          patientId: targetPatient?.id || currentTeamPatientId,
          patient: targetPatient || undefined,
        }}
        onOpenEvaluationModal={() => {
          if (targetPatient) {
            setShowDirectEvalModal(true);
          } else {
            setShowScenariValutazioniModal(true);
          }
        }}
      />

      {/* 3.B. MASCAL NIGHT TRIAGE PERFORMANCE SUB-PANEL (Dashboard Triage Notturno a Squadre con Sync Real-Time) */}
      <MascalFacultyTriageDashboard
        currentFaculty={currentFaculty}
        defaultExpanded={isMascalSession}
      />

      {/* 4. CONTESTO OPERATIVO DI FASE (Debriefing con pulsante rapido Scheda di Valutazione Modale, oppure riepilogo ruoli in Scenario) */}
      {isEffectiveDebriefing ? (
        /* FASE DEBRIEFING (TCCC O SHOCK ROOM): PULSANTE RAPIDO PER FINESTRA MODALE SCHEDA DI VALUTAZIONE */
        <div className="bg-neutral-950 border-2 border-amber-500/80 p-3.5 sm:p-5 rounded-lg shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-bold">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>
                {activeScenarioType === 'SHOCKROOM'
                  ? isEn
                    ? 'Shock Room Debriefing & Evaluation Scorecard'
                    : 'Debriefing Shock Room & Scheda di Valutazione'
                  : isEn
                  ? 'TCCC Debriefing & Evaluation Scorecard'
                  : 'Debriefing TCCC & Scheda di Valutazione'}
              </span>
            </div>

            {currentEvaluation ? (
              <span className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-bold rounded flex items-center gap-1.5 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {isEn ? 'Evaluation Recorded' : 'Valutazione Registrata'} ({evaluationAvgScore}/5 ⭐)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-amber-950 border border-amber-500 text-amber-300 text-xs font-bold rounded flex items-center gap-1.5 animate-pulse self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {isEn ? 'Scorecard Pending Compilation' : 'Scheda Valutazione da Compilare'}
              </span>
            )}
          </div>

          {currentEvaluation ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-neutral-900 p-2 rounded border border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">ABCDE:</span>
                <strong className="text-white">{currentEvaluation.scores.abcdeApproach}/5</strong>
              </div>
              <div className="bg-neutral-900 p-2 rounded border border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">Skills:</span>
                <strong className="text-white">{currentEvaluation.scores.technicalSkills}/5</strong>
              </div>
              <div className="bg-neutral-900 p-2 rounded border border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">Teamwork/NTS:</span>
                <strong className="text-white">{currentEvaluation.scores.teamworkLeadership}/5</strong>
              </div>
              <div className="bg-neutral-900 p-2 rounded border border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">SBAR :30:</span>
                <strong className="text-white">{currentEvaluation.scores.handoverSbar}/5</strong>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-300">
              {activeScenarioType === 'SHOCKROOM'
                ? isEn
                  ? 'Conduct structured Shock Room video debriefing with your 5 learners and open the dedicated Evaluation Scorecard modal.'
                  : 'Conduci il debriefing collegiale Shock Room (revisione video) con i 5 discenti e apri la finestra modale della Scheda di Valutazione.'
                : isEn
                ? 'Conduct structured TCCC debriefing with your 5 learners and open the dedicated Evaluation Scorecard modal.'
                : 'Conduci il debriefing strutturato TCCC Plus/Delta con i 5 discenti della squadra e apri la finestra modale della Scheda di Valutazione.'}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (targetPatient) {
                  setShowDirectEvalModal(true);
                } else {
                  setShowScenariValutazioniModal(true);
                }
              }}
              className={`flex-1 min-h-[42px] py-2.5 px-4 rounded font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border shadow-md ${
                !currentEvaluation
                  ? 'bg-amber-400 hover:bg-amber-300 text-black border-amber-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>
                {currentEvaluation
                  ? isEn
                    ? `Open Evaluation Scorecard Modal (${activeScenarioType})`
                    : `Apri Scheda di Valutazione (${activeScenarioType === 'SHOCKROOM' ? 'Shock Room' : 'TCCC'})`
                  : isEn
                  ? `Compile Evaluation Scorecard Now (${activeScenarioType})`
                  : `Compila Scheda di Valutazione (${activeScenarioType === 'SHOCKROOM' ? 'Shock Room' : 'TCCC'})`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowScenariValutazioniModal(true)}
              className="min-h-[42px] py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-neutral-700 rounded font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>{isEn ? 'All Team Scenarios' : 'Riepilogo Scenari Squadra'}</span>
            </button>
          </div>
        </div>
      ) : isEffectiveScenarioRunning ? (
        /* FASE SCENARIO IN CORSO: STRISCIA COMPATTA DI RIEPILOGO SQUADRA IN AZIONE CON PULSANTE MODALE RUOLI */
        <div className="bg-neutral-950 border border-emerald-500/70 p-3 rounded-lg flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isTeamRolesCompiled
                ? isEn
                  ? `Active Roles Confirmed • Team #${currentFaculty.assignedTeamId}`
                  : `Ruoli Operativi in Azione • Squadra #${currentFaculty.assignedTeamId}`
                : isEn
                ? `Team #${currentFaculty.assignedTeamId} Operational Roles`
                : `Ruoli Operativi Squadra #${currentFaculty.assignedTeamId}`}
            </span>
            <button
              type="button"
              onClick={() => setShowRoleSelectionModal(true)}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 rounded text-[11px] text-amber-300 font-bold cursor-pointer flex items-center gap-1"
            >
              <Users className="w-3 h-3" />
              <span>{isEn ? 'Open Role Selection Modal' : 'Apri Modale Scelta Ruoli'}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1.5">
            {assignedTeamDiscenti.map((d, idx) => (
              <div
                key={d.id}
                className="bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded text-[11px] flex flex-col justify-between"
              >
                <span className="text-white font-bold truncate">
                  {d.badgeCode || `DISC-0${idx + 1}`} • {d.name}
                </span>
                <span className="text-orange-300 text-[10px] font-semibold truncate pt-0.5">
                  ⚡ {d.activeScenarioRole || (idx === 0 ? 'Team Leader' : 'Operatore')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : showManualSquadraBox ? (
        /* ANAGRAFICA SQUADRA SU RICHIESTA (Fuori dallo scenario, es. durante Workshop o Pausa) */
        <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-lg space-y-2">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-bold text-orange-400 uppercase flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {isEn
                ? `Assigned Team #${currentFaculty.assignedTeamId} Roster (Group ${facultyGroup})`
                : `Anagrafica Discenti Squadra #${currentFaculty.assignedTeamId} (Gruppo ${facultyGroup})`}
            </span>
            <button
              type="button"
              onClick={() => setShowManualSquadraBox(false)}
              className="text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              ✕ {isEn ? 'Close' : 'Chiudi'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {assignedTeamDiscenti.map((d, idx) => (
              <div
                key={d.id}
                className="bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded text-[11px]"
              >
                <div className="text-white font-bold truncate">
                  {d.badgeCode || `DISC-0${idx + 1}`} • {d.name}
                </div>
                {d.role && (
                  <div className="text-neutral-400 text-[10px]">
                    {d.role}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* 5. TIMELINE INDIVIDUALE FACULTY (Mostra solo l'evento specifico del singolo Tutor: TCCC, Shock Room o Workshop) */}
      <div className="bg-neutral-900 border-2 border-amber-500/80 p-3 sm:p-5 shadow-2xl space-y-3.5">
        <div className="border-b border-neutral-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400 shrink-0" />
            {isEn
              ? `Remaining Schedule • Day 0${activeDay} (Group ${facultyGroup})`
              : `Cronoprogramma Rimanente • Giorno 0${activeDay} (Gruppo ${facultyGroup})`}
          </h3>
          <span className="px-2.5 py-0.5 bg-amber-950 border border-amber-600 text-xs text-amber-300 self-start sm:self-auto rounded">
            {filteredTimeline.length} {isEn ? 'Activities' : 'Attività Individuali'}
          </span>
        </div>

        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
          {filteredTimeline.map(({ slot, activity, mergedSlotIds, isMergedWorkshop }) => {
            const isCurrentItem = mergedSlotIds.includes(currentSlot?.id || '');
            const actType = activity.activityType || '';
            const actTitleLower = (activity.title || '').toLowerCase();
            const isPreAlertItem =
              !isMergedWorkshop &&
              (actTitleLower.includes('pre-allerta') ||
                actTitleLower.includes('pre-alert') ||
                actTitleLower.includes('standby attivo'));
            const isScenario =
              !isMergedWorkshop &&
              !isPreAlertItem &&
              (actType.includes('scenario') ||
                actTitleLower.includes('tccc') ||
                actTitleLower.includes('shock room'));
            const isWorkshop =
              isMergedWorkshop ||
              actType.includes('workshop') ||
              actTitleLower.includes('workshop') ||
              actTitleLower.includes('skills');
            const isDebrief =
              !isMergedWorkshop &&
              (actType.includes('debriefing') || actTitleLower.includes('debriefing'));

            const showSubtitle =
              activity.subtitle &&
              activity.subtitle.toLowerCase().trim() !== (activity.title || '').toLowerCase().trim();

            const singleCategoryLabel = getSingleEventCategoryLabel(activity, isMergedWorkshop);

            return (
              <div
                key={slot.id}
                className={`p-3 border rounded text-xs transition-all ${
                  isCurrentItem
                    ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400/60 shadow-lg'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-amber-300 font-bold">
                      🕒 {slot.timeRange}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isMergedWorkshop
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                          : isPreAlertItem
                          ? 'bg-amber-950 text-amber-300 border border-amber-500'
                          : isScenario
                          ? 'bg-pink-950 text-pink-300 border border-pink-600'
                          : isWorkshop
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-600'
                          : isDebrief
                          ? 'bg-purple-950 text-purple-300 border border-purple-600'
                          : 'bg-neutral-900 text-neutral-300 border border-neutral-700'
                      }`}
                    >
                      {singleCategoryLabel}
                    </span>
                    {isCurrentItem && (
                      <span className="bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase">
                        ⚡ {isEn ? 'ACTIVE NOW' : 'IN CORSO'}
                      </span>
                    )}
                  </div>

                  {activity.location && (
                    <span className="text-amber-400 font-bold text-xs flex items-center gap-1 shrink-0">
                      📍 {translateLocation(activity.location, language)}
                    </span>
                  )}
                </div>

                <div className="pt-2 mt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <strong className="text-white text-sm">{activity.title}</strong>
                    {showSubtitle && (
                      <span className="text-neutral-300 text-xs"> — {activity.subtitle}</span>
                    )}
                  </div>

                  {(isScenario || isPreAlertItem || isDebrief) && (
                    <span className="text-pink-300 text-[11px] font-bold shrink-0">
                      {isEn ? `Station / Pt. #${currentTeamPatientId}` : `Postazione / Paz. #${currentTeamPatientId}`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FINESTRA MODALE DEDICATA: MENU SCELTA RUOLI SQUADRA (TCCC / SHOCK ROOM) */}
      {showRoleSelectionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          onClick={() => setShowRoleSelectionModal(false)}
        >
          <div
            className="bg-neutral-950 border-2 border-amber-500 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-neutral-900 border-b border-amber-500/40 px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-black rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                    {activeScenarioType === 'SHOCKROOM'
                      ? isEn
                        ? 'SHOCK ROOM PRE-ALERT / ROLE ASSIGNMENT'
                        : 'PRE-ALLERTA & RUOLI SHOCK ROOM'
                      : isEn
                      ? 'TCCC PRE-ALERT / ROLE ASSIGNMENT'
                      : 'PRE-ALLERTA & RUOLI TCCC'}
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white uppercase">
                    {isEn
                      ? `Role Selection Menu • Team #${currentFaculty.assignedTeamId} (Group ${facultyGroup})`
                      : `Menu Scelta Ruoli • Squadra #${currentFaculty.assignedTeamId} (Gruppo ${facultyGroup})`}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleSelectionModal(false)}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg cursor-pointer transition-colors"
                title={isEn ? 'Close Modal' : 'Chiudi Finestra'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 sm:p-5 overflow-y-auto space-y-4">
              <FacultyScenarioRoleAssigner
                currentFaculty={currentFaculty}
                scenarioType={activeScenarioType}
                slotTitle={currentActivity?.title || targetScenarioTitle}
                slotTimeRange={currentSlot?.timeRange}
                isPreAllerta={isEffectivePreAllerta}
                assignedDiscenti={assignedTeamDiscenti}
              />
            </div>

            <div className="bg-neutral-900 border-t border-neutral-800 px-4 py-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowRoleSelectionModal(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-lg cursor-pointer transition-colors"
              >
                {isEn ? 'Confirm & Close' : 'Conferma e Chiudi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINESTRA MODALE DEDICATA: SCHEDA DI VALUTAZIONE SCENARIO (TCCC / SHOCK ROOM) */}
      {showDirectEvalModal && targetPatient && (
        <ScenarioEvaluationModal
          isOpen={showDirectEvalModal}
          onClose={() => setShowDirectEvalModal(false)}
          patient={targetPatient}
          currentFaculty={currentFaculty}
          teamId={currentFaculty.assignedTeamId}
          onSave={(newEval) => {
            saveEvaluation(newEval);
          }}
          existingEvaluation={currentEvaluation}
        />
      )}

      {/* Faculty Scenari & Valutazioni Modal (Lista Completa) */}
      <FacultyScenariValutazioniModal
        isOpen={showScenariValutazioniModal}
        onClose={() => setShowScenariValutazioniModal(false)}
        currentFaculty={currentFaculty}
        simulatorPatients={simulatorPatients}
        evaluations={evaluations}
      />

      {/* REGIA/DIREZIONE OPERATOR UNLOCK MODAL */}
      <OperatorUnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        roleLabel="Faculty / Tutor"
      />

      {/* MODALE REPORT ANTEPRIMA BILANCIAMENTO FACULTY */}
      <StaffBalancingModal<Faculty>
        isOpen={isBalancingModalOpen}
        report={facultyBalancingReport}
        onClose={() => setIsBalancingModalOpen(false)}
        onConfirm={async (updatedFaculty) => {
          await bulkUpdateFaculty(updatedFaculty);
          if (sendCourseMessage) {
            sendCourseMessage({
              senderId: 'REGIA-CH3',
              senderName: 'Coordinamento Didattico Regia',
              senderRole: 'direttore',
              type: 'info',
              subject: 'ALLINEAMENTO 1:1 FACULTY APPLICATO',
              content: `Il rapporto 1:1 e il carico didattico per i 12 Tutor Faculty è stato bilanciato omogeneamente sulle 12 squadre e scenari TCCC/Shock Room.`,
            });
          }
        }}
      />
    </div>
  );
};


