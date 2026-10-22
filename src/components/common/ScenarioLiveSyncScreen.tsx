import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  ChevronDown,
  ChevronUp,
  MapPin,
  Users,
  Wrench,
  Sparkles,
  Stethoscope,
  Radio,
} from 'lucide-react';
import {
  SimulatorPatient,
  GroupType,
  TimelineSlot,
  CourseDay,
  Team,
  Faculty,
  Technician,
  GroupActivitySlot,
} from '../../types';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { useCourse } from '../../context/CourseContext';
import { isScenarioSlot } from '../../utils/scenarioStatusHelper';
import { detectPreAllertaForGroup } from '../../utils/scenarioRoleHelper';
import { getStationForGroup } from '../../utils/simulationRoleEngine';

export interface ScenarioLiveSyncScreenProps {
  role?: 'faculty' | 'tecnico';
  facultyCustomInfo?: {
    faculty: Faculty;
    assignedTeam?: Team;
    patientId: number;
    patient?: SimulatorPatient;
  };
  technicianCustomInfo?: {
    currentTech: Technician;
    partnerTech?: Technician | null;
  };
  onOpenEvaluationModal?: () => void;
  onOpenChecklistModal?: (patient: SimulatorPatient) => void;
}

export const ScenarioLiveSyncScreen: React.FC<ScenarioLiveSyncScreenProps> = ({
  role = 'faculty',
  facultyCustomInfo,
  technicianCustomInfo,
  onOpenEvaluationModal,
  onOpenChecklistModal,
}) => {
  const {
    language,
    activeDay,
    activeSlotIndex,
    currentSlot: contextCurrentSlot,
    timerSeconds,
    isTimerRunning,
    simulatorPatients,
    teams,
  } = useCourse();

  const isEn = language === 'en';
  const [showDetailedPhases, setShowDetailedPhases] = useState(true);

  // Master slots for current day
  const rawDayMasterSlots = INITIAL_TIMELINE_SLOTS.filter((s) => s.day === activeDay);
  const dayMasterSlots = rawDayMasterSlots.length > 0 ? rawDayMasterSlots : INITIAL_TIMELINE_SLOTS.slice(0, 8);
  const rawMasterCurrentSlot =
    INITIAL_TIMELINE_SLOTS[activeSlotIndex] || rawDayMasterSlots[0] || INITIAL_TIMELINE_SLOTS[0];
  const slotIdxInDay = dayMasterSlots.findIndex((s) => s.id === (contextCurrentSlot?.id || rawMasterCurrentSlot?.id));
  const effectiveCurrentIdx = slotIdxInDay >= 0 ? slotIdxInDay : 0;
  const currentSlot = dayMasterSlots[effectiveCurrentIdx] || dayMasterSlots[0];

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Timer & Sub-Phase Metrics for Current Slot
  const slotDurationMinutes = currentSlot?.durationMinutes || 15;
  const slotTotalSeconds = slotDurationMinutes * 60;
  const slotRemainingSeconds = Math.max(0, timerSeconds);
  const slotElapsedSeconds = Math.max(0, slotTotalSeconds - slotRemainingSeconds);
  const slotElapsedMinutes = slotElapsedSeconds / 60;
  const slotProgressPercent = Math.min(100, Math.max(0, Math.round((slotElapsedSeconds / slotTotalSeconds) * 100)));

  // Determine current training block context (e.g. Blocco 1, 2, 3, 4)
  const slotIdSafe = (currentSlot?.id || '').toLowerCase();
  const slotTitleSafe = (currentSlot?.title || '').toLowerCase();
  const isBlock1 = slotIdSafe.includes('b1');
  const isBlock2 = slotIdSafe.includes('b2');
  const isBlock3 = slotIdSafe.includes('b3');
  const isBlock4 = slotIdSafe.includes('b4');
  const isTacticalBlock = isBlock1 || isBlock2 || isBlock3 || isBlock4;
  const currentBlockNumber = isBlock1 ? 1 : isBlock2 ? 2 : isBlock3 ? 3 : isBlock4 ? 4 : null;

  // Scenario detection
  const isScenarioInProgress = isScenarioSlot(currentSlot);

  // Determine station & patient for the viewer
  const assignedTeamId = facultyCustomInfo?.assignedTeam?.id || 1;
  const patientId = facultyCustomInfo?.patientId || (((assignedTeamId - 1) % 3) + 1);
  const relevantPatient =
    facultyCustomInfo?.patient ||
    simulatorPatients.find((p) => p.id === patientId) ||
    simulatorPatients[0];

  const assignedGroup: GroupType =
    facultyCustomInfo?.assignedTeam?.groupId ||
    (assignedTeamId <= 3 ? 'A' : assignedTeamId <= 6 ? 'B' : assignedTeamId <= 9 ? 'C' : 'D');

  // Group-specific activity for Faculty role
  const groupActivity = currentSlot?.groupActivities?.[assignedGroup];
  const groupActTitle = (groupActivity?.title || '').toLowerCase();
  const groupActSubtitle = (groupActivity?.subtitle || '').toLowerCase();
  const groupActLoc = (groupActivity?.location || '').toLowerCase();
  const groupActText = `${groupActTitle} ${groupActSubtitle} ${groupActLoc}`;

  // Detect if the Faculty's group is currently in a Skill Workshop (WS1 or WS2)
  const isGroupInWorkshop =
    role === 'faculty' &&
    Boolean(
      (groupActText.includes('ws1') ||
        groupActText.includes('ws2') ||
        groupActText.includes('skills workshop') ||
        groupActText.includes('skill workshop')) &&
        !groupActText.includes('pausa') &&
        !groupActText.includes('raduno') &&
        !groupActText.includes('ingresso aula')
    );

  // Detect if the Faculty's group is strictly in its 15-minute Pre-Alert window (T -15 before T0)
  const preAlertDetection = detectPreAllertaForGroup(currentSlot, assignedGroup);
  const isGroupInPreAlert = role === 'faculty' && !isGroupInWorkshop && preAlertDetection.isPreAllerta;

  // Determine dedicated track for the current block (strictly separated: TCCC vs SHOCK_ROOM)
  const groupBlockStation =
    currentBlockNumber !== null ? getStationForGroup(assignedGroup, currentBlockNumber, activeDay) : null;

  const techStationText = `${(technicianCustomInfo?.currentTech?.assignedStations || []).join(' ')} ${technicianCustomInfo?.currentTech?.specialty || ''}`.toLowerCase();
  const isShockRoomContext =
    role === 'faculty'
      ? groupBlockStation === 'SHOCK_ROOM' ||
        groupActText.includes('shock') ||
        groupActText.includes('box sr') ||
        groupActText.includes('debriefing sr') ||
        groupActivity?.activityType === 'scenario_intra'
      : techStationText.includes('shock') || techStationText.includes('box sr') || slotIdSafe.includes('sr');

  const isTcccContext =
    role === 'faculty'
      ? groupBlockStation === 'TCCC' ||
        groupActText.includes('tccc') ||
        groupActText.includes('tattico') ||
        groupActivity?.activityType === 'scenario_extra'
      : !isShockRoomContext && (techStationText.includes('tattic') || techStationText.includes('tccc') || slotIdSafe.includes('tccc'));

  // Detect if the Faculty's group is in a Clinical Scenario Block (TCCC or Shock Room)
  const isGroupInClinicalBlock =
    role === 'faculty'
      ? !isGroupInWorkshop &&
        !isGroupInPreAlert &&
        Boolean(
          (isTacticalBlock && (groupBlockStation === 'TCCC' || groupBlockStation === 'SHOCK_ROOM')) ||
            groupActivity?.activityType === 'scenario_extra' ||
            groupActivity?.activityType === 'scenario_intra'
        )
      : isScenarioInProgress;

  const stationLocation =
    role === 'faculty' && groupActivity?.location
      ? groupActivity.location
      : isShockRoomContext
      ? `Box Shock Room ${((assignedTeamId - 1) % 3) + 1}`
      : isTcccContext
      ? `Ambiente Tattico ${((assignedTeamId - 1) % 3) + 1}`
      : `Postazione Clinica #${patientId}`;

  // Calculate unified time range for continuous Workshop block
  const getUnifiedWorkshopTimeRange = (): string => {
    if (!isGroupInWorkshop) return currentSlot?.timeRange || '';
    const blockPrefixMatch = slotIdSafe.match(/^d[23]-b[1-4]/);
    if (!blockPrefixMatch) return currentSlot?.timeRange || '';
    const prefix = blockPrefixMatch[0];
    const blockSlots = dayMasterSlots.filter((s) => (s.id || '').toLowerCase().startsWith(prefix));
    if (blockSlots.length === 0) return currentSlot?.timeRange || '';
    const firstStart = blockSlots[0].timeRange?.split('-')[0]?.trim() || '';
    const lastEnd = blockSlots[blockSlots.length - 1].timeRange?.split('-')[1]?.trim() || '';
    return firstStart && lastEnd ? `${firstStart} - ${lastEnd}` : currentSlot?.timeRange || '';
  };

  // Phase active/completed flags based on current sub-slot within the 90-min block
  const isSubSlot1 = isTacticalBlock && slotIdSafe.endsWith('-tccc');
  const isSubSlot2 = isTacticalBlock && slotIdSafe.endsWith('-tccc-2');
  const isSubSlotHandover = isTacticalBlock && slotIdSafe.includes('handover');
  const isSubSlotSr = isTacticalBlock && slotIdSafe.endsWith('-sr');
  const isSubSlotDebrief = isTacticalBlock && slotIdSafe.includes('debrief');
  const isSubSlotReset = isTacticalBlock && slotIdSafe.includes('reset');

  // Strictly separated 90-minute phases: ONLY TCCC phases for TCCC track, ONLY Shock Room phases for Shock Room track
  const tcccOnlyPhases = [
    {
      id: 'tccc-01',
      timeWindow: 'Min 00–15',
      durationMinutes: 15,
      phaseTitle: isEn ? 'TCCC Engagement & Stop the Bleed' : 'Scenario TCCC: Ingaggio & Stop the Bleed',
      techFocus: isEn
        ? 'Pulsed arterial hemorrhage activation on TCCC simulator, smoke/audio effects, radio CH3.'
        : 'Attivazione emorragia pulsante simulatore TCCC, effetti fumo/audio, presidio radio CH3.',
      facultyFocus: isEn
        ? '1:1 supervision of assigned TCCC squad: Care Under Fire, proximal Tourniquet within 60s.'
        : 'Supervisione 1:1 squadra TCCC: Care Under Fire, Tourniquet prossimale entro 60s e sicurezza.',
      isHandover: false,
      isReset: false,
      isActive: isSubSlot1,
      isCompleted: isSubSlot2 || isSubSlotHandover || isSubSlotSr || isSubSlotDebrief || isSubSlotReset,
    },
    {
      id: 'tccc-02',
      timeWindow: 'Min 15–30',
      durationMinutes: 15,
      phaseTitle: isEn ? 'TCCC Stabilization, MARCH & Extraction' : 'Scenario TCCC: Stabilizzazione MARCH & Estrazione',
      techFocus: isEn
        ? 'Monitor airway/chest decompression response on TCCC mannequin, prepare tactical stretcher.'
        : 'Risposta parametri manichino TCCC a decompressione/vie aeree, approntamento barella tattica.',
      facultyFocus: isEn
        ? 'MARCH PAWS completion: junctional wound packing, airway management, litter packaging.'
        : 'Completamento MARCH PAWS: wound packing giunzionale, vie aeree, imbarellamento tattico.',
      isHandover: false,
      isReset: false,
      isActive: isSubSlot2,
      isCompleted: isSubSlotHandover || isSubSlotSr || isSubSlotDebrief || isSubSlotReset,
    },
    {
      id: 'tccc-03',
      timeWindow: 'Min 30–35 (ORE :30)',
      durationMinutes: 5,
      phaseTitle: isEn ? 'Mandatory :30 SBAR Handover (TCCC Delivery)' : 'Tassativo Ore :30 Handover SBAR (Consegna TCCC)',
      techFocus: isEn
        ? 'Assist stretcher transit from Tactical Environment to Shock Room Box.'
        : 'Assistenza transito barella da Ambiente Tattico a Box Shock Room.',
      facultyFocus: isEn
        ? 'Evaluate concise 5-min SBAR report delivered by TCCC Team Leader.'
        : 'Valutazione consegna strutturata SBAR (5 min) eseguita dal Team Leader TCCC.',
      isHandover: true,
      isReset: false,
      isActive: isSubSlotHandover,
      isCompleted: isSubSlotSr || isSubSlotDebrief || isSubSlotReset,
    },
    {
      id: 'tccc-04',
      timeWindow: 'Min 35–65',
      durationMinutes: 30,
      phaseTitle: isEn ? 'TCCC Debriefing Part 1 & Evaluation Form' : 'Debriefing TCCC Parte 1 & Scheda Valutazione',
      techFocus: isEn
        ? 'Reset Tactical Environment simulator, replenish hemostatic gauze and tourniquets.'
        : 'Ripristino simulatore Ambiente Tattico, reintegro garze emostatiche e tourniquet.',
      facultyFocus: isEn
        ? 'Tactical analysis with squad and compilation of the TCCC Scenario Evaluation Form.'
        : 'Analisi tattica con la squadra e compilazione della Scheda di Valutazione Scenario TCCC.',
      isHandover: false,
      isReset: false,
      isActive: isSubSlotSr,
      isCompleted: isSubSlotDebrief || isSubSlotReset,
    },
    {
      id: 'tccc-05',
      timeWindow: 'Min 65–80',
      durationMinutes: 15,
      phaseTitle: isEn ? 'TCCC Debriefing Part 2 & Report Closure' : 'Debriefing TCCC Parte 2 & Chiusura Report',
      techFocus: isEn
        ? 'Final check of Tactical Environment consumables for next rotation.'
        : 'Verifica finale consumabili Ambiente Tattico per il blocco successivo.',
      facultyFocus: isEn
        ? 'NTS feedback wrap-up and finalization of TCCC evaluation scorecard.'
        : 'Chiusura feedback NTS e consolidamento scheda di valutazione TCCC.',
      isHandover: false,
      isReset: false,
      isActive: isSubSlotDebrief,
      isCompleted: isSubSlotReset,
    },
    {
      id: 'tccc-06',
      timeWindow: 'Min 80–90',
      durationMinutes: 15,
      phaseTitle: isEn ? 'End of TCCC Block & Squad Transition' : 'Fine Blocco TCCC & Ristoro Squadra',
      techFocus: isEn
        ? 'Tactical station standby for incoming block.'
        : 'Standby postazione tattica per il blocco successivo.',
      facultyFocus: isEn
        ? 'Squad break and transition to next scheduled station.'
        : 'Pausa squadra e transizione verso la postazione del blocco successivo.',
      isHandover: false,
      isReset: true,
      isActive: isSubSlotReset,
      isCompleted: false,
    },
  ];

  const shockRoomOnlyPhases = [
    {
      id: 'sr-01',
      timeWindow: 'Min 00–15',
      durationMinutes: 15,
      phaseTitle: isEn ? 'Shock Room Preliminary Briefing & Bay Check' : 'Briefing Preliminare Shock Room & Check Box',
      techFocus: isEn
        ? 'Verify Shock Room Box monitors, ventilator, ultrasound machine and infusion lines.'
        : 'Verifica monitor Box Shock Room, ventilatore, ecografo e linee infusionali.',
      facultyFocus: isEn
        ? 'Preliminary clinical briefing in Shock Room Box and equipment familiarization.'
        : 'Inquadramento clinico preliminare nel Box Shock Room e verifica presidi.',
      isHandover: false,
      isReset: false,
      isActive: isSubSlot1,
      isCompleted: isSubSlot2 || isSubSlotHandover || isSubSlotSr || isSubSlotDebrief || isSubSlotReset,
    },
    {
      id: 'sr-02',
      timeWindow: 'Min 15–30',
      durationMinutes: 15,
      phaseTitle: isEn ? 'PRE-ALERT SHOCK ROOM (T -15 MIN) & Role Selection' : 'PRE-ALLERTA SHOCK ROOM (T -15 MIN) & Scelta Ruoli',
      techFocus: isEn
        ? 'ACTIVE STANDBY BOX SR (T -15): High-fidelity simulator ready to receive patient at :30.'
        : 'STANDBY ATTIVO BOX SR (T -15): Simulatore ad alta fedeltà pronto per ricezione alle :30.',
      facultyFocus: isEn
        ? 'T -15 Pre-Alert in Shock Room Box: assign/confirm team roles (1 TL + 4 Op) before :30 Handover.'
        : 'Pre-Allerta T -15 nel Box SR: assegna/conferma i ruoli squadra (1 TL + 4 Op) prima dell\'Handover :30.',
      isHandover: false,
      isReset: false,
      isActive: isSubSlot2,
      isCompleted: isSubSlotHandover || isSubSlotSr || isSubSlotDebrief || isSubSlotReset,
    },
    {
      id: 'sr-03',
      timeWindow: 'Min 30–35 (ORE :30)',
      durationMinutes: 5,
      phaseTitle: isEn ? 'Mandatory :30 SBAR Handover (Shock Room Reception)' : 'Tassativo Ore :30 Handover SBAR (Ricezione Shock Room)',
      techFocus: isEn
        ? 'Connect patient to multiparameter wall monitor and activate Shock Room telemetry.'
        : 'Connessione paziente a monitor multiparametrico e attivazione telemetria Box SR.',
      facultyFocus: isEn
        ? 'Evaluate SBAR reception and immediate leadership assumption by Shock Room Team Leader.'
        : 'Valutazione ricezione SBAR e assunzione immediata leadership del Team Leader Shock Room.',
      isHandover: true,
      isReset: false,
      isActive: isSubSlotHandover,
      isCompleted: isSubSlotSr || isSubSlotDebrief || isSubSlotReset,
    },
    {
      id: 'sr-04',
      timeWindow: 'Min 35–65',
      durationMinutes: 30,
      phaseTitle: isEn ? 'High-Fidelity Shock Room Scenario (ABCDE)' : 'Scenario Shock Room Alta Fedeltà (ABCDE)',
      techFocus: isEn
        ? 'Dynamic vital signs control on HALO/SimMan, e-FAST clips, blood gas and MTP delivery.'
        : 'Regia parametri vitali dinamici su HALO/SimMan, clip e-FAST, EGA ed erogazione sacche MTP.',
      facultyFocus: isEn
        ? '1:1 supervision of ABCDE primary survey, e-FAST, chest decompression, MTP and damage control.'
        : 'Supervisione 1:1 ABCDE, eco FAST, decompressione toracica, MTP e decision-making clinico.',
      isHandover: false,
      isReset: false,
      isActive: isSubSlotSr,
      isCompleted: isSubSlotDebrief || isSubSlotReset,
    },
    {
      id: 'sr-05',
      timeWindow: 'Min 65–80',
      durationMinutes: 15,
      phaseTitle: isEn ? 'Shock Room Clinical Debriefing & Evaluation Form' : 'Debriefing Clinico Shock Room & Scheda Valutazione',
      techFocus: isEn
        ? 'PTZ video playback for Faculty and telemetry log export.'
        : 'Playback video PTZ per il Tutor Faculty ed esportazione log telemetrici.',
      facultyFocus: isEn
        ? 'Plus/Delta NTS video review and compilation of the Shock Room Scenario Evaluation Form.'
        : 'Revisione video Plus/Delta NTS e compilazione della Scheda di Valutazione Scenario Shock Room.',
      isHandover: false,
      isReset: false,
      isActive: isSubSlotDebrief,
      isCompleted: isSubSlotReset,
    },
    {
      id: 'sr-06',
      timeWindow: 'Min 80–90',
      durationMinutes: 15,
      phaseTitle: isEn ? '15-Min Box Shock Room Technical Reset' : 'Reset Tecnico Box Shock Room (Turnaround 15 Min)',
      techFocus: isEn
        ? '15-MIN QUICK RESET: Clean Box SR, refill synthetic blood, replace chest skins and airways.'
        : 'RESET RAPIDO 15 MIN: Pulizia Box SR, rabbocco sangue sintetico, sostituzione cute toracica e vie aeree.',
      facultyFocus: isEn
        ? 'Finalize Shock Room evaluation scorecard and release Box for technical reset.'
        : 'Completamento scheda di valutazione Shock Room e rilascio Box ai Tecnici per il reset.',
      isHandover: false,
      isReset: true,
      isActive: isSubSlotReset,
      isCompleted: false,
    },
  ];

  const block90MinutePhases = isShockRoomContext ? shockRoomOnlyPhases : tcccOnlyPhases;

  // In Faculty View, Pre-Alert is already handled by FacultyPreAlertBanner — avoid rendering a second Pre-Alert screen
  if (role === 'faculty' && isGroupInPreAlert) {
    return null;
  }

  // =========================================================================
  // MODALITÀ A: SKILL WORKSHOP (SESSIONE UNICA CONTINUA SENZA FASI OPERATIVE)
  // =========================================================================
  if (isGroupInWorkshop && groupActivity) {
    const isWS1 = groupActText.includes('ws1') || groupActText.includes('airway') || groupActText.includes('vie aeree');
    const unifiedTimeRange = getUnifiedWorkshopTimeRange();

    return (
      <div className="bg-neutral-950 border-2 border-emerald-500/80 rounded-lg p-3.5 sm:p-5 shadow-xl space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-900/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-emerald-500 text-black font-black text-[10px] uppercase rounded">
                  {isEn ? 'CONTINUOUS SKILL WORKSHOP (NO SUB-PHASES)' : 'SKILL WORKSHOP • SESSIONE UNICA CONTINUA'}
                </span>
                <span className="px-2 py-0.5 bg-neutral-900 border border-emerald-700 text-emerald-300 text-[10px] font-bold rounded">
                  🕒 {unifiedTimeRange} (90 min)
                </span>
              </div>
              <h4 className="text-white font-black text-sm sm:text-base mt-1 uppercase">
                {groupActivity.title} — <span className="text-emerald-300 font-bold">{groupActivity.subtitle}</span>
              </h4>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs border-t sm:border-t-0 sm:border-l border-emerald-800/50 pt-2 sm:pt-0 sm:pl-3 shrink-0">
            <span className="text-[10px] text-neutral-400 uppercase block">{isEn ? 'Assigned Classroom:' : 'Aula Addestrativa:'}</span>
            <strong className="text-emerald-300 text-sm">📍 {groupActivity.location}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase font-black block">
              {isEn ? 'Hands-On Practical Stations (Continuous Flow):' : 'Stazioni Pratiche Hands-On (Flusso Continuo):'}
            </span>
            <p className="text-neutral-200 text-[11px] leading-relaxed">
              {isWS1
                ? isEn
                  ? 'Advanced airway management, surgical cricothyroidotomy (CRIC) on task trainers, junctional wound packing and junctional tourniquet application.'
                  : 'Gestione vie aeree avanzate, cricotiroidotomia chirurgica d\'urgenza (CRIC) su task trainer, wound packing giunzionale e posizionamento tourniquet giunzionali.'
                : isEn
                ? 'Advanced clinical e-FAST ultrasound scans (pericardial, hepatorenal, splenorenal, pelvic, pleural windows) and ultrasound-guided vascular/intraosseous access.'
                : 'Scansioni ecografiche cliniche avanzate FAST/e-FAST (finestre pericardica, epatorenale, splenorenale, pelvica, pleurica) e accessi vascolari ecoguidati / intraossei.'}
            </p>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded space-y-1">
            <span className="text-[10px] text-amber-400 uppercase font-black block">
              {isEn ? '1:1 Faculty Coaching Mode:' : 'Modalità Tutoraggio Faculty 1:1:'}
            </span>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              {isEn
                ? 'Direct procedural coaching and immediate corrective feedback on anatomical models throughout the 90-minute block, without rigid 15-minute scenario sub-phases or SBAR handovers.'
                : 'Addestramento procedurale diretto con correzione immediata del gesto tecnico sui simulatori per l\'intera durata del blocco (90 min), senza suddivisione in fasi operative o handover SBAR.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono">
      {/* ========================================================================= */}
      {/* MODALITÀ B: SCENARIO CLINICO IN CORSO (TCCC / HANDOVER / SHOCK ROOM)      */}
      {/* ========================================================================= */}
      {isGroupInClinicalBlock ? (
        <div className="bg-neutral-950 border-2 border-pink-500 rounded-lg p-3.5 sm:p-5 shadow-2xl space-y-3.5 font-sans">
          {/* INTESTAZIONE UNIFICATA SCENARIO CLINICO (Zero duplicazioni con Header superiore) */}
          <div className="bg-pink-950/30 border border-pink-600/60 p-3 rounded-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-600 text-white rounded shrink-0 shadow-md">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-pink-600 text-white font-mono font-black text-[10px] uppercase rounded">
                    {slotIdSafe.includes('handover')
                      ? 'HANDOVER 1:1 SBAR (ORE :30)'
                      : isShockRoomContext
                      ? 'SHOCK ROOM ALTA FEDELTÀ (ABCDE)'
                      : 'SCENARIO TATTICO TCCC'}
                  </span>
                  {groupActivity?.title && (
                    <span className="text-xs font-mono font-bold text-pink-300">
                      • {groupActivity.title}
                    </span>
                  )}
                </div>
                <h4 className="text-white font-bold text-sm sm:text-base font-mono mt-0.5">
                  {relevantPatient ? (
                    <span>
                      <strong className="text-pink-400">{relevantPatient.scenarioCode}</strong>: {relevantPatient.title}
                    </span>
                  ) : (
                    currentSlot.title
                  )}
                </h4>
              </div>
            </div>

            {/* Postazione, Paziente & Controllo Fasi */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-2 lg:pt-0 border-pink-800/50 font-mono text-xs">
              <div className="text-left lg:text-right">
                <div className="text-white font-bold">📍 {stationLocation}</div>
                {relevantPatient && (
                  <div className="text-pink-300 text-[11px]">
                    Pt. #{relevantPatient.id} ({relevantPatient.name})
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowDetailedPhases(!showDetailedPhases)}
                className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-pink-300 hover:text-white border border-pink-700 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors rounded shrink-0"
              >
                <span>{showDetailedPhases ? (isEn ? 'Hide Block Phases' : 'Nascondi Fasi Blocco') : (isEn ? 'Show Block Phases (90m)' : 'Mostra Fasi Blocco (90m)')}</span>
                {showDetailedPhases ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* BARRA DI PROGRESSO COMPATTA DELLO SLOT CORRENTE */}
          <div className="space-y-1 font-mono">
            <div className="flex justify-between items-center text-[10px] text-neutral-400">
              <span>
                {isEn ? 'Current Slot Progress:' : 'Avanzamento Slot Corrente:'}{' '}
                <strong className="text-pink-300">{slotProgressPercent}%</strong> ({Math.floor(slotElapsedMinutes)}/{slotDurationMinutes} min)
              </span>
              {slotIdSafe.includes('handover') && (
                <span className="text-amber-300 font-bold">
                  ⚠️ {isEn ? 'Mandatory 5-Min SBAR Handover (:30–:35)' : 'Tassativo Handover SBAR 5 Min (:30–:35)'}
                </span>
              )}
            </div>
            <div className="h-2 w-full bg-neutral-900 border border-neutral-800 overflow-hidden flex">
              <div
                className={`h-full transition-all duration-300 ${
                  slotRemainingSeconds <= 180
                    ? 'bg-red-500'
                    : slotRemainingSeconds <= 600
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-pink-600 via-pink-500 to-yellow-400'
                }`}
                style={{ width: `${slotProgressPercent}%` }}
              />
            </div>
          </div>

          {/* CRONOPROGRAMMA RIGIDO DEI TEMPI DEL BLOCCO CLINICO (SOLO TCCC & SHOCK ROOM) */}
          {showDetailedPhases && isTacticalBlock && (
            <div className="space-y-2 pt-1 font-mono">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-1 text-[11px] flex-wrap gap-2">
                <span className="text-yellow-400 font-bold uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-yellow-500" />
                  {isEn
                    ? `CLINICAL BLOCK 0${currentBlockNumber} PHASES • ${isShockRoomContext ? 'SHOCK ROOM TRACK' : 'TCCC TRACK'} (90 MIN)`
                    : `SCANSIONE FASI OPERATIVE BLOCCO 0${currentBlockNumber} • ${isShockRoomContext ? 'PERCORSO SHOCK ROOM' : 'PERCORSO TCCC'} (90 MIN)`}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {block90MinutePhases.map((phase, pIdx) => (
                  <div
                    key={phase.id}
                    className={`p-2.5 border transition-all rounded ${
                      phase.isActive
                        ? 'bg-gradient-to-br from-pink-950/60 to-black border-pink-400 ring-1 ring-pink-500/50 shadow-lg'
                        : phase.isCompleted
                        ? 'bg-neutral-950/80 border-emerald-900/50 opacity-75'
                        : 'bg-neutral-950/90 border-neutral-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 pb-1 border-b border-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-neutral-800 text-yellow-400 font-black text-[9px] border border-neutral-700">
                          F{pIdx + 1}
                        </span>
                        <span className="text-[11px] font-bold text-white">{phase.timeWindow}</span>
                      </div>
                      {phase.isActive ? (
                        <span className="px-1.5 py-0.5 bg-pink-600 text-white font-black text-[9px] animate-pulse">
                          {isEn ? 'ACTIVE' : 'IN CORSO'}
                        </span>
                      ) : phase.isCompleted ? (
                        <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> {isEn ? 'DONE' : 'FATTA'}
                        </span>
                      ) : (
                        <span className="text-[9px] text-neutral-500">{isEn ? 'WAIT' : 'ATTESA'}</span>
                      )}
                    </div>

                    <div className="pt-1.5 space-y-1">
                      <div className="text-[11px] font-bold text-yellow-300 leading-snug">
                        {phase.phaseTitle}
                      </div>
                      <p className="text-[10px] text-amber-200/90 leading-snug">
                        {role === 'faculty' ? phase.facultyFocus : phase.techFocus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* MODALITÀ C: FASE GENERALE NON-SCENARIO (BRIEFING, PAUSA, RISTORO, PLENARIA)*/
        /* ========================================================================= */
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-neutral-900 border border-neutral-700 rounded text-amber-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-widest font-black text-amber-400">
                  {isEn ? 'ACTIVE SCHEDULE PHASE' : 'FASE ATTIVA IN CORSO'}
                </span>
                {groupActivity?.location && (
                  <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-amber-300 text-[10px] font-bold rounded">
                    📍 {groupActivity.location}
                  </span>
                )}
              </div>
              <h4 className="text-white font-bold text-sm sm:text-base mt-0.5">
                {groupActivity?.title || currentSlot.title}
              </h4>
              <p className="text-xs text-neutral-400">
                {groupActivity?.subtitle || currentSlot.description}
              </p>
            </div>
          </div>

          <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold rounded shrink-0">
            {slotProgressPercent}% {isEn ? 'completed' : 'completato'}
          </div>
        </div>
      )}
    </div>
  );
};

