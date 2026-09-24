import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Timer,
  Globe,
  Layers,
  MapPin,
  Package,
  Shield,
  Sparkles,
  User,
  Users,
  Wrench,
  Zap,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Radio,
  Eye,
  EyeOff,
  CheckSquare,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Flame,
  Gauge,
} from 'lucide-react';
import {
  SimulatorPatient,
  Technician,
  GroupType,
  TimelineSlot,
  CourseDay,
  Team,
} from '../../types';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { useCourse } from '../../context/CourseContext';
import { translateSlot, translateLocation } from '../../utils/courseTranslation';
import { isScenarioSlot } from '../../utils/scenarioStatusHelper';

interface TecniciTimelineAffiancataProps {
  currentTech: Technician;
  partnerTech: Technician | null;
  activeDay: CourseDay;
  activeSlotIndex: number;
  timerSeconds: number;
  isTimerRunning: boolean;
  simulatorPatients: SimulatorPatient[];
  teams: Team[];
  onOpenChecklist: (patient: SimulatorPatient) => void;
  onOpenProtesiModal: (patient: SimulatorPatient) => void;
  onSendRadioMessage: (message: string) => void;
  onSwitchToRegistro: () => void;
  onOpenQuadroPubblico?: () => void;
}

export const TecniciTimelineAffiancata: React.FC<TecniciTimelineAffiancataProps> = ({
  currentTech,
  partnerTech,
  activeDay,
  activeSlotIndex,
  timerSeconds,
  isTimerRunning,
  simulatorPatients,
  teams,
  onOpenChecklist,
  onOpenProtesiModal,
  onSendRadioMessage,
  onSwitchToRegistro,
  onOpenQuadroPubblico,
}) => {
  const { language } = useCourse();
  const isEn = language === 'en';

  // Visual layout mode: timeline affiancata su 2 colonne (Quadro Corso + Mansioni Tecniche)
  const layoutMode = 'parallel';
  const [showCompletedArchive, setShowCompletedArchive] = useState(false);
  const [selectedInspectSlotId, setSelectedInspectSlotId] = useState<string | null>(null);
  const [showDetailedPhases, setShowDetailedPhases] = useState(true);

  const techNum = parseInt(currentTech.id.replace(/\D/g, '')) || 1;
  const assignedPatientIds =
    activeDay === 2
      ? [((techNum - 1) % 12) + 1, ((techNum - 1 + 3) % 12) + 1]
      : [((techNum - 1) % 12) + 13, ((techNum - 1 + 3) % 12) + 13];

  const assignedPatients = simulatorPatients.filter(
    (p) => p.day === activeDay && (assignedPatientIds.includes(p.id) || p.id % 6 === (techNum % 6))
  );

  // Master timeline data
  const rawDayMasterSlots = INITIAL_TIMELINE_SLOTS.filter((s) => s.day === activeDay);
  const dayMasterSlots = rawDayMasterSlots.map((s) => translateSlot(s, language));
  const rawMasterCurrentSlot =
    INITIAL_TIMELINE_SLOTS[activeSlotIndex] || rawDayMasterSlots[0] || INITIAL_TIMELINE_SLOTS[0];
  const slotIdxInDay = rawDayMasterSlots.findIndex((s) => s.id === rawMasterCurrentSlot?.id);
  const effectiveCurrentIdx = slotIdxInDay >= 0 ? slotIdxInDay : 0;
  const currentSlot = dayMasterSlots[effectiveCurrentIdx] || dayMasterSlots[0];

  const pastSlots = dayMasterSlots
    .slice(0, effectiveCurrentIdx)
    .map((slot, offset) => ({ slot, originalIdx: offset }));
  const futureSlots = dayMasterSlots
    .slice(effectiveCurrentIdx + 1)
    .map((slot, offset) => ({ slot, originalIdx: effectiveCurrentIdx + 1 + offset }));

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

  // Timer & Sub-Phase Metrics for Current Slot
  const slotDurationMinutes = currentSlot?.durationMinutes || 30;
  const slotTotalSeconds = slotDurationMinutes * 60;
  const slotRemainingSeconds = Math.max(0, timerSeconds);
  const slotElapsedSeconds = Math.max(0, slotTotalSeconds - slotRemainingSeconds);
  const slotElapsedMinutes = slotElapsedSeconds / 60;
  const slotProgressPercent = Math.min(100, Math.max(0, Math.round((slotElapsedSeconds / slotTotalSeconds) * 100)));

  // Determine current training block context (e.g. Blocco 1, 2, 3, 4)
  const isBlock1 = currentSlot.id.includes('b1');
  const isBlock2 = currentSlot.id.includes('b2');
  const isBlock3 = currentSlot.id.includes('b3');
  const isBlock4 = currentSlot.id.includes('b4');
  const isTacticalBlock = isBlock1 || isBlock2 || isBlock3 || isBlock4;
  const currentBlockNumber = isBlock1 ? 1 : isBlock2 ? 2 : isBlock3 ? 3 : isBlock4 ? 4 : null;

  // Rigid 15-minute sub-phases as defined in Rule 3 (REGOLE TEMPORALI DEI BLOCCHI FORMATIVI 90 MINUTI)
  const block90MinutePhases = [
    {
      id: 'sub-01',
      timeWindow: isEn ? 'Min 00–15' : 'Min 00–15',
      durationMinutes: 15,
      phaseTitle: isEn ? 'TCCC Engagement / WS Framing / SR Standby' : 'Ingaggio TCCC / WS Inquadramento / Standby SR',
      description: isEn
        ? 'Under-fire tactical scenarios start, Stop the Bleed in 3 Tactical Environments. WS framing. Active standby in SR Boxes.'
        : 'Avvio scenari tattici sotto fuoco, Stop the Bleed nei 3 Ambienti Tattici. Inquadramento WS. Standby attivo Box SR.',
      techFocus: isEn
        ? 'Manning infusion carts, pulsed hemorrhage delivery on TCCC simulators, radio CH3 test.'
        : 'Presidio carrelli infusione, erogazione emorragia pulsante simulatori TCCC, test radio CH3.',
      isHandover: false,
      isReset: false,
      isActive: (currentSlot.id.includes('tccc') || currentSlot.id.includes('b1-tccc')) && slotElapsedMinutes < 15,
      isCompleted: !currentSlot.id.includes('tccc') && isTacticalBlock && (currentSlot.id.includes('handover') || currentSlot.id.includes('sr') || currentSlot.id.includes('debrief') || currentSlot.id.includes('reset')),
    },
    {
      id: 'sub-02',
      timeWindow: isEn ? 'Min 15–30' : 'Min 15–30',
      durationMinutes: 15,
      phaseTitle: isEn ? 'TCCC Stabilization & Extraction / SR Active Standby (T -15)' : 'Stabilizzazione TCCC & Estrazione / Standby Attivo SR (T -15)',
      description: isEn
        ? 'Wound packing and litter packaging in TCCC. ACTIVE STANDBY in Shock Room Boxes (T -15 min from :30 Handover).'
        : 'Wound packing e barellamento in TCCC. STANDBY ATTIVO Box Shock Room (T -15 min da Handover :30).',
      techFocus: isEn
        ? 'ACTIVE STANDBY BOX SR: Ventilator check, multiparameter ECG monitors, e-FAST probes ready for litter.'
        : 'STANDBY ATTIVO BOX SR: Collaudo ventilatori, monitor ECG multiparametrici, sonde e-FAST pronte per barella.',
      isHandover: false,
      isReset: false,
      isActive: (currentSlot.id.includes('tccc') || currentSlot.id.includes('b1-tccc')) && slotElapsedMinutes >= 15,
      isCompleted: isTacticalBlock && (currentSlot.id.includes('handover') || currentSlot.id.includes('sr') || currentSlot.id.includes('debrief') || currentSlot.id.includes('reset')),
    },
    {
      id: 'sub-03',
      timeWindow: isEn ? 'Min 30–35 (AT :30)' : 'Min 30–35 (ORE :30)',
      durationMinutes: 5,
      phaseTitle: isEn ? 'MANDATORY :30 1:1 LITTER HANDOVER (SBAR)' : 'TASSATIVO ORE :30 HANDOVER 1:1 BARELLATO (SBAR)',
      description: isEn
        ? 'Physical litter transfer from TCCC to Shock Room Box with SBAR structured report (5 min, :30–:35). From :35 SR ABCDE and TCCC Debrief Pt 1.'
        : 'Trasferimento fisico barellato da TCCC a Box Shock Room con report SBAR (5 min, :30–:35). Dalle :35 ABCDE SR e Debrief TCCC Pt 1.',
      techFocus: isEn
        ? 'CRITICAL: Guide litter into Shock Room Boxes, connect portable monitors to wall displays, assist vascular lines.'
        : 'CRITICO: Guida barella nei Box Shock Room, connessione monitor portatili a schermi a parete, assistenza linee vascolari.',
      isHandover: true,
      isReset: false,
      isActive: currentSlot.id.includes('handover'),
      isCompleted: isTacticalBlock && (currentSlot.id.includes('sr') || currentSlot.id.includes('debrief') || currentSlot.id.includes('reset')),
    },
    {
      id: 'sub-04',
      timeWindow: isEn ? 'Min 35–60' : 'Min 35–60',
      durationMinutes: 25,
      phaseTitle: isEn ? 'High-Fidelity Shock Room / TCCC Debriefing Pt 1' : 'Shock Room Alta Fedeltà / Debriefing TCCC Pt 1',
      description: isEn
        ? 'Advanced hemodynamic ABCDE management, FAST ultrasound, chest tubes in Shock Room. TCCC debriefing with FAC 1-3.'
        : 'Gestione emodinamica avanzata ABCDE, eco FAST, drenaggi in Shock Room. Debriefing TCCC con FAC 1-3.',
      techFocus: isEn
        ? 'Dynamic vital signs control on HALO/SimMan simulators, hemodynamic crisis modulation, delivering diagnostic reports.'
        : 'Regia parametri vitali dinamici su simulatori HALO/SimMan, modulazione crisi emodinamica, erogazione referti.',
      isHandover: false,
      isReset: false,
      isActive: currentSlot.id.includes('sr'),
      isCompleted: isTacticalBlock && (currentSlot.id.includes('debrief') || currentSlot.id.includes('reset')),
    },
    {
      id: 'sub-05',
      timeWindow: isEn ? 'Min 60–75' : 'Min 60–75',
      durationMinutes: 15,
      phaseTitle: isEn ? 'SR Clinical Debriefing Part 1 (NTS Video) / TCCC Rest' : 'Debriefing Clinico SR Parte 1 (Video NTS) / Ristoro TCCC',
      description: isEn
        ? 'Collegial video review with Faculty of clinical management and NTS leadership. Hydration break for TCCC team.'
        : 'Revisione video collegiale con Faculty della gestione clinica e leadership NTS. Pausa idratazione per squadra TCCC.',
      techFocus: isEn
        ? 'PTZ camera playback for FAC, telemetry export, medication cart and inventory check.'
        : 'Playback telecamere PTZ per FAC, salvataggio telemetria, controllo carrelli farmaci e inventario.',
      isHandover: false,
      isReset: false,
      isActive: currentSlot.id.includes('debrief'),
      isCompleted: isTacticalBlock && currentSlot.id.includes('reset'),
    },
    {
      id: 'sub-06',
      timeWindow: isEn ? 'Min 75–90' : 'Min 75–90',
      durationMinutes: 15,
      phaseTitle: isEn ? 'SR Debriefing Pt 2 & 15-Min Quick Box Tech Reset (Turnaround)' : 'Debriefing SR Pt 2 & Reset Tecnico Rapido 15 Min Box (Turnaround)',
      description: isEn
        ? 'Conclusive block debriefing and MANDATORY 15-MINUTE RESET of the 3 Boxes by TECHs before the next block.'
        : 'Debriefing conclusivo del blocco e RESET TASSATIVO 15 MINUTI dei 3 Box a cura dei TECH prima del blocco successivo.',
      techFocus: isEn
        ? '15-MIN QUICK RESET: Skin disinfection, synthetic blood top-up, airway/needle replacements, battery recharge.'
        : 'RESET RAPIDO 15 MINUTI: Sanificazione cute, rabbocco sangue sintetico, sostituzione trachee e aghi, ricarica batterie.',
      isHandover: false,
      isReset: true,
      isActive: currentSlot.id.includes('reset'),
      isCompleted: false,
    },
  ];

  // Specific non-tactical checkpoints (for setup, welcome, pauses, wrap-up)
  const nonTacticalCheckpoints = [
    {
      id: 'nt-1',
      timeWindow: isEn ? 'Initial Phase (Min 00–15)' : 'Fase Iniziale (Min 00–15)',
      title: isEn ? 'Slot Start & Staff Alignment' : 'Inizio Slot & Allineamento Staff',
      focus: isEn ? 'Station manning, radio CH3/CH1 synchronization and first hardware check.' : 'Presidio postazioni, sincronizzazione radio CH3/CH1 e prima verifica hardware.',
      isActive: slotProgressPercent < 33,
      isCompleted: slotProgressPercent >= 33,
    },
    {
      id: 'nt-2',
      timeWindow: isEn ? 'Central Phase (Min 15–30+)' : 'Fase Centrale (Min 15–30+)',
      title: isEn ? 'Activity Execution & Monitoring' : 'Esecuzione Attività & Monitoraggio',
      focus: isEn ? 'Continuous assistance, load monitoring and consumables management.' : 'Assistenza continua, monitoraggio carichi e gestione materiali di consumo.',
      isActive: slotProgressPercent >= 33 && slotProgressPercent < 75,
      isCompleted: slotProgressPercent >= 75,
    },
    {
      id: 'nt-3',
      timeWindow: isEn ? 'Conclusive Phase (Last 10 Min)' : 'Fase Conclusiva (Ultimi 10 Min)',
      title: isEn ? 'Pre-Alert & Phase Closing' : 'Pre-Allerta & Chiusura Fase',
      focus: isEn ? 'Student group notification and logistical preparation for next block.' : 'Preavviso al gruppo discenti e preparazione logistica per il blocco successivo.',
      isActive: slotProgressPercent >= 75,
      isCompleted: slotRemainingSeconds === 0,
    },
  ];

  // Helper: map slot to technical duties and visiting groups
  const getSlotTechActivity = (slot: TimelineSlot) => {
    const slotTitle = (slot.title || '').toLowerCase();
    const slotDesc = (slot.description || '').toLowerCase();
    const acts = slot.groupActivities || {};
    const allActs = (['A', 'B', 'C', 'D'] as GroupType[])
      .map((g) => ({ group: g, act: acts[g] }))
      .filter((item) => item.act);
    const fullText = `${slotTitle} ${slotDesc} ${allActs
      .map((a) => `${a.act?.title} ${a.act?.subtitle} ${a.act?.location}`)
      .join(' ')}`.toLowerCase();

    const isReset =
      fullText.includes('reset') || fullText.includes('turnaround') || fullText.includes('riordino');
    const isHandover =
      fullText.includes('handover') || fullText.includes('sbar') || fullText.includes('consegna');
    const isShockRoom =
      fullText.includes('shock room') || fullText.includes('abcde') || fullText.includes('box sr');
    const isTccc =
      fullText.includes('tccc') || fullText.includes('stop bleed') || fullText.includes('ambiente tattico');
    const isPreAllerta =
      slot.id.toLowerCase().includes('prealert') ||
      slot.id.toLowerCase().includes('pre-alert') ||
      fullText.includes('pre-allerta') ||
      fullText.includes('pre-alert');
    const isStandbySR = fullText.includes('standby sr') || fullText.includes('standby attivo');
    const isWorkshop =
      fullText.includes('workshop') ||
      fullText.includes('ws1') ||
      fullText.includes('ws2') ||
      fullText.includes('skill');
    const isDebrief = fullText.includes('debriefing') || fullText.includes('revisione');
    const isPause =
      fullText.includes('pausa') || fullText.includes('ristoro') || fullText.includes('pranzo');
    const isSetup = slot.id.includes('setup') || fullText.includes('setup staff');

    const postazioneNum = ((techNum - 1) % 3) + 1; // 1, 2, 3

    // Identify patient for this slot
    const slotPatientIds = allActs.flatMap((a) => a.act?.patientIds || []);
    let relevantPatient: SimulatorPatient | null = null;
    if (slotPatientIds.length > 0) {
      relevantPatient =
        simulatorPatients.find(
          (p) =>
            p.day === slot.day &&
            slotPatientIds.includes(p.id) &&
            ((p.id - 1) % 3) + 1 === postazioneNum
        ) ||
        simulatorPatients.find((p) => p.day === slot.day && slotPatientIds.includes(p.id)) ||
        null;
    }
    if (!relevantPatient) {
      relevantPatient =
        simulatorPatients.find((p) => p.day === slot.day && ((p.id - 1) % 3) + 1 === postazioneNum) ||
        assignedPatients[0] ||
        null;
    }

    // Identify visiting group and station location
    let visitingGroup: GroupType | null = null;
    let stationLocation = currentTech.assignedStations?.[0] || (isEn ? 'Trauma Station' : 'Postazione Trauma');

    if (techNum === 7 || currentTech.specialty?.toLowerCase().includes('ws1')) {
      stationLocation = isEn ? 'Room WS1 (Airway & Bleeding)' : 'Aula WS1 (Airway & Bleeding)';
      const match = allActs.find(
        (a) =>
          a.act?.location.includes('WS1') ||
          a.act?.title.includes('WS1') ||
          a.act?.subtitle.includes('WS1')
      );
      if (match) visitingGroup = match.group;
    } else if (techNum === 8 || currentTech.specialty?.toLowerCase().includes('ws2')) {
      stationLocation = isEn ? 'Room WS2 (FAST Echo & IO)' : 'Aula WS2 (Eco FAST & IO)';
      const match = allActs.find(
        (a) =>
          a.act?.location.includes('WS2') ||
          a.act?.title.includes('WS2') ||
          a.act?.subtitle.includes('WS2')
      );
      if (match) visitingGroup = match.group;
    } else if (techNum === 9 || currentTech.specialty?.toLowerCase().includes('reset')) {
      stationLocation = isEn ? 'Box Shock Room 1-3 (Quick Reset)' : 'Box Shock Room 1-3 (Reset Rapido)';
      const match = allActs.find(
        (a) => a.act?.location.includes('Shock Room') || a.act?.title.toLowerCase().includes('shock room')
      );
      if (match) visitingGroup = match.group;
    } else if (techNum === 10) {
      stationLocation = isEn ? 'Tactical Environments 1-3 (Logistics)' : 'Ambienti Tattici 1-3 (Logistica)';
      const match = allActs.find(
        (a) => a.act?.location.includes('Tattico') || a.act?.title.toLowerCase().includes('tccc')
      );
      if (match) visitingGroup = match.group;
    } else {
      if (isTccc || isPreAllerta) {
        stationLocation = isEn ? `Tactical Environment ${postazioneNum}` : `Ambiente Tattico ${postazioneNum}`;
        const match = allActs.find(
          (a) => a.act?.location.includes('Tattico') || a.act?.title.toLowerCase().includes('tccc')
        );
        if (match) visitingGroup = match.group;
      } else if (isShockRoom || isStandbySR || isHandover || isReset) {
        stationLocation = `Box Shock Room ${postazioneNum}`;
        const match = allActs.find(
          (a) => a.act?.location.includes('Shock Room') || a.act?.title.toLowerCase().includes('shock room')
        );
        if (match) visitingGroup = match.group;
      }
    }

    let techActivityTitle = '';
    let techBadge = '';
    let techBadgeColor = '';
    let techDuties: string[] = [];

    if (isSetup) {
      techActivityTitle = isEn
        ? 'Technical Briefing, Radio Channels CH1/CH3 Check & Pump Testing'
        : 'Briefing Tecnico, Verifica Canali Radio CH1/CH3 e Collaudo Pompe';
      techBadge = isEn ? 'SETUP & SYSTEM TESTING' : 'SETUP & COLLAUDO IMPIANTI';
      techBadgeColor = 'bg-cyan-950 text-cyan-300 border-cyan-700';
      techDuties = isEn
        ? [
            'Artificial blood reservoirs inspection (2000ml) and fluid connector tightness check',
            'Radio devices check: operating channel CH3 (Tech) and Master channel CH1 (Direction)',
            'Tactical litters, TQ tourniquets, and trauma shears gear inventory verification',
          ]
        : [
            'Ispezione serbatoi sangue artificiale (2000ml) e controllo tenuta raccordi idraulici',
            'Verifica apparati radio: canale di lavoro CH3 (Tecnici) e canale Master CH1 (Regia)',
            'Controllo dotazione barelle tattiche, lacci emostatici TQ e forbici taglia-abiti',
          ];
    } else if (
      fullText.includes('accoglienza') ||
      fullText.includes('welcome') ||
      fullText.includes('briefing')
    ) {
      techActivityTitle = isEn
        ? 'Station Manning, Biomodel Check & Control Room Operational Standby'
        : 'Presidio Postazioni, Verifica Biomodelli e Standby Operativo Regia';
      techBadge = isEn ? 'OPERATIONAL PRESENCE' : 'PRESIDIO OPERATIVO';
      techBadgeColor = 'bg-neutral-950 text-neutral-300 border-neutral-700';
      techDuties = isEn
        ? [
            'Fixed manning of assigned station and check of backup consumable items',
            'Manikin and prosthesis compliance check with assigned Faculty',
            'Standby monitoring on radio CH3 awaiting operational green light from Control Room',
          ]
        : [
            'Presidio fisso della postazione assegnata e controllo materiali monouso di scorta',
            'Check di conformità dei manichini e delle protesi con la Faculty di riferimento',
            'Standby in ascolto su radio CH3 in attesa del via libera operativo dalla Regia',
          ];
    } else if (isReset) {
      techActivityTitle = isEn
        ? '15-MIN QUICK TECH RESET: Manikin Disinfection & Consumables Restock'
        : 'RESET TECNICO RAPIDO 15 MIN: Sanificazione Manichini & Reintegro Consumabili';
      techBadge = isEn ? 'QUICK RESET (TURNAROUND)' : 'RESET RAPIDO (TURNAROUND)';
      techBadgeColor = 'bg-yellow-950 text-yellow-300 border-yellow-600 animate-pulse';
      techDuties = isEn
        ? [
            'Flushing and bleeding lines purge, refilling synthetic blood pouches',
            'Replacement of cricothyroidotomy inserts, chest drains, and incised surgical skin',
            'Replenish kaolin gauze, sterile drapes, and transmit "STATION GREEN LIGHT" on radio CH3',
          ]
        : [
            'Lavaggio e spurgo circuiti di sanguinamento, riempimento sacche sangue sintetico',
            'Sostituzione inserti cricotiroidotomia, drenaggio toracico e cute chirurgica incisa',
            'Reintegro garze caolino, teli sterili e invio "LUCE VERDE POSTAZIONE" via radio CH3',
          ];
    } else if (isHandover) {
      techActivityTitle = isEn
        ? '1:1 Handover Tech Support: Litter Transfer TCCC ➔ Shock Room'
        : 'Assistenza Tecnica Handover 1:1: Trasferimento Barellato TCCC ➔ Shock Room';
      techBadge = isEn ? 'SBAR TRANSPORT ASSISTANCE' : 'ASSISTENZA TRASPORTO SBAR';
      techBadgeColor = 'bg-amber-950 text-amber-300 border-amber-600';
      techDuties = isEn
        ? [
            'Support rapid tactical litter transfer from field to Shock Room Box',
            'Switch portable telemetry over to fixed wall multiparameter monitor',
            'Safety supervision of manikin/actor during SBAR briefing (:30-:35)',
          ]
        : [
            'Assistenza al trasbordo rapido della barella tattica dal campo al Box Shock Room',
            'Commutazione telemetria portatile sul monitor multiparametrico fisso a parete',
            'Supervisione sicurezza del manichino/attore durante il briefing SBAR (:30-:35)',
          ];
    } else if (isPreAllerta) {
      techActivityTitle = isEn
        ? 'Pre-Alert T-15: Bleeding Pumps Priming and Operational Standby'
        : 'Pre-Allerta T-15: Innesco Pompe Sanguinamento e Standby Operativo';
      techBadge = isEn ? 'PRE-ALERT T -15 MIN' : 'PRE-ALLERTA T -15 MIN';
      techBadgeColor = 'bg-pink-950 text-pink-300 border-pink-700 animate-pulse';
      techDuties = isEn
        ? [
            'Activate hemorrhage remote control and pressure pulse stream check',
            'Position spinal litters and check tactical TQ tourniquets supply in the field',
            'Safety briefing with the actor/simulant and abort safe-word test',
          ]
        : [
            'Attivazione telecomando flussi emorragici e prova getto pulsatile a pressione',
            'Posizionamento barelle spinali e controllo scorte lacci emostatici TQ sul campo',
            'Briefing di sicurezza con l\'attore figurante e test parola d\'ordine d\'arresto',
          ];
    } else if (isStandbySR) {
      techActivityTitle = isEn
        ? 'Active Standby Shock Room Box (T -15): Check Monitors, Ventilators & REBOA Kit'
        : 'Standby Attivo Box Shock Room (T -15): Check Monitor, Ventilatori & Kit REBOA';
      techBadge = isEn ? 'ACTIVE STANDBY BOX SR' : 'STANDBY ATTIVO BOX SR';
      techBadgeColor = 'bg-indigo-950 text-indigo-300 border-indigo-700';
      techDuties = isEn
        ? [
            'Power on multiparameter monitors, test ECG trace, NIBP and capnography curve',
            'Verify resuscitation thoracotomy kit, aortic clamp and 7 Fr REBOA introducer',
            'Check fluid warmer readiness and artificial infusion bags availability',
          ]
        : [
            'Accensione monitor multiparametrici, test traccia ECG, NIBP e curva capnografica',
            'Verifica kit toracotomia di rianimazione, clamp aortico e introduttore REBOA 7 Fr',
            'Controllo riscaldatore liquidi e disponibilità sacche infusionali artificiali',
          ];
    } else if (isTccc) {
      techActivityTitle = isEn
        ? 'Tactical Environment Tech Presence: Flow Delivery & Litter Assistance'
        : 'Presidio Tecnico Ambiente Tattico: Erogazione Flussi & Assistenza Barellamento';
      techBadge = isEn ? 'TCCC TACTICAL PRESENCE' : 'PRESIDIO TATTICO TCCC';
      techBadgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-700';
      techDuties = isEn
        ? [
            'Remote adjustment of massive bleeding according to tourniquet application',
            'Monitor junctional wound packing and rapid litter extraction under audio stress',
            'Continuous logistical support to student team and assigned FAC tutor',
          ]
        : [
            'Regolazione remota emorragia massiva in funzione dell\'applicazione del tourniquet',
            'Monitoraggio wound packing giunzionale ed estrazione rapida sotto stress audio',
            'Supporto logistico continuo alla squadra discenti e al tutor FAC designato',
          ];
    } else if (isShockRoom) {
      techActivityTitle = isEn
        ? 'Shock Room Box Advanced Presence: Telemetry, Thoracotomy Support & REBOA'
        : 'Presidio Avanzato Box Shock Room: Telemetria, Supporto Toracotomia & REBOA';
      techBadge = isEn ? 'PRESENCE SHOCK ROOM ABCDE' : 'PRESIDIO SHOCK ROOM ABCDE';
      techBadgeColor = 'bg-indigo-950 text-indigo-300 border-indigo-600';
      techDuties = isEn
        ? [
            'Dynamic vital signs tuning (SpO2, HR, BP) following FAC script requirements',
            'Instrument support for invasive procedures (chest tube, REBOA, cricothyroidotomy)',
            'Concurrent start of preliminary clearing of the tactical origin area',
          ]
        : [
            'Regolazione dinamica parametri vitali (SpO2, FC, PA) secondo copione didattico FAC',
            'Assistenza strumentale alle procedure invasive (drenaggio pleurico, REBOA, crico)',
            'Avvio contestuale della bonifica preliminare dell\'area tattica di provenienza',
          ];
    } else if (isWorkshop) {
      if (techNum === 7 || currentTech.specialty?.toLowerCase().includes('ws1')) {
        techActivityTitle = isEn
          ? 'Skills Lab WS1 Presence: Cricothyroidotomy Manikins & Insert Replacement'
          : 'Presidio Skills Lab WS1: Manichini Cricotiroidotomia & Sostituzione Inserti';
        techBadge = isEn ? 'SKILLS LAB WS1 (AIRWAY)' : 'SKILLS LAB WS1 (AIRWAY)';
        techBadgeColor = 'bg-purple-950 text-purple-300 border-purple-700';
        techDuties = isEn
          ? [
              'Rapid replacement of tracheal membranes and synthetic skin for cricothyroidotomy',
              'Restock endotracheal tubes, scalpel blades, bougies, and wound packing sets',
              'Synthetic blood refill in junctional groin hemorrhage trainer',
            ]
          : [
              'Sostituzione rapida membrane tracheali e cute sintetica per cricotiroidotomia',
              'Rifornimento tubi endotracheali, lame bisturi, bougie e set wound packing',
              'Ricarica sangue sintetico nel formatore per emorragie giunzionali inguinali',
            ];
      } else if (techNum === 8 || currentTech.specialty?.toLowerCase().includes('ws2')) {
        techActivityTitle = isEn
          ? 'Skills Lab WS2 Presence: Calibration of FAST Ultrasounds & IO Simulators'
          : 'Presidio Skills Lab WS2: Calibrazione Ecografi FAST & Simulatori Intraossei';
        techBadge = isEn ? 'SKILLS LAB WS2 (FAST ECHO & IO)' : 'SKILLS LAB WS2 (ECO FAST & IO)';
        techBadgeColor = 'bg-purple-950 text-purple-300 border-purple-700';
        techDuties = isEn
          ? [
              'Load pathological FAST ultrasound clips (tamponade, hemothorax, peritoneal fluid)',
              'Refill ultrasound gel and reset ultrasound-guided vascular phantoms',
              'Replace needles and test motors for intraosseous drills (humeral/tibial)',
            ]
          : [
              'Caricamento quadri ecografici patologici FAST (tamponamento, emotorace, falda peritoneale)',
              'Rifornimento gel ecografico e ripristino phantom vascolari ecoguidati',
              'Sostituzione aghi e test motori dei trapani intraossei (omerale/tibiale)',
            ];
      } else {
        techActivityTitle = isEn
          ? 'Logistical Support and Stock Management Skills Lab WS1 / WS2'
          : 'Supporto Logistico e Gestione Scorte Skills Lab WS1 / WS2';
        techBadge = isEn ? 'SKILLS LAB SUPPORT' : 'SUPPORTO SKILLS LAB';
        techBadgeColor = 'bg-purple-950 text-purple-300 border-purple-700';
        techDuties = isEn
          ? [
              'Device distribution and continuous consumable restocking on workbenches',
              'Monitoring rotation timing of student teams',
              'Prompt technical intervention on radio call for simulator issues',
            ]
          : [
              'Distribuzione presidi e reintegro continuo consumabili sui banchi di lavoro',
              'Monitoraggio delle tempistiche di rotazione didattica delle squadre discenti',
              'Pronto intervento tecnico su chiamata radio per anomalie sui simulatori',
            ];
      }
    } else if (isDebrief) {
      techActivityTitle = isEn
        ? 'Debriefing Video Control, Simulator Securing & Device Cleaning'
        : 'Regia Video Debriefing, Messa in Sicurezza Simulatori & Pulizia Dispositivi';
      techBadge = isEn ? 'DEBRIEFING VIDEO & SAFETY' : 'REGIA DEBRIEFING & SICUREZZA';
      techBadgeColor = 'bg-cyan-950 text-cyan-300 border-cyan-700';
      techDuties = isEn
        ? [
            'Technical support for video and multi-angle camera projection for Faculty',
            'Temporary pump shutoff and securing hydraulic lines',
            'Appropriate disposal of contaminated devices and surface sanitization',
          ]
        : [
            'Supporto tecnico alla proiezione filmati e telecamere multi-angolo per la Faculty',
            'Disattivazione temporanea pompe e messa in sicurezza dei circuiti idraulici',
            'Smaltimento appropriato dei dispositivi contaminati e sanificazione superfici',
          ];
    } else if (isPause) {
      techActivityTitle = isEn
        ? 'Technical Staff Rest Break, Battery Check & Warehouse Restocking'
        : 'Pausa Ristoro Staff Tecnico, Check Batterie & Rifornimento Magazzino';
      techBadge = isEn ? 'REST BREAK & LOGISTICS' : 'PAUSA RISTORO & LOGISTICA';
      techBadgeColor = 'bg-neutral-950 text-neutral-400 border-neutral-800';
      techDuties = isEn
        ? [
            'Rest break shift for simulation technical personnel',
            'Check power packs and recharge radio/telemetry units',
            'Maintain active radio CH3 monitoring for urgent messages from Control Room',
          ]
        : [
            'Turno di pausa e ristoro per il personale tecnico addetto alla simulazione',
            'Controllo accumulatori elettrici e ricarica stazioni radio/telemetria',
            'Mantenimento presidio canale radio CH3 attivo per comunicazioni urgenti di regia',
          ];
    } else {
      techActivityTitle = isEn
        ? `Station Operational Presence: ${stationLocation}`
        : `Presidio Operativo Postazione: ${stationLocation}`;
      techBadge = isEn ? 'STATION PRESENCE' : 'PRESIDIO POSTAZIONE';
      techBadgeColor = 'bg-neutral-950 text-neutral-300 border-neutral-700';
      techDuties = isEn
        ? [
            `Continuous technical presence at ${stationLocation}`,
            'Assistance to FAC tutor and assigned student team',
            'Maintain radio contact on CH3 with master control',
          ]
        : [
            `Presidio tecnico continuo presso ${stationLocation}`,
            'Assistenza al tutor FAC e alla squadra discenti assegnata',
            'Mantenimento del contatto radio su CH3 con la regia master',
          ];
    }

    // Check if the current technician is directly assigned/involved in this slot's station
    const isTechDirectlyInvolved =
      currentTech.assignedStations?.some((st) => stationLocation.toLowerCase().includes(st.toLowerCase())) ||
      techDuties.length > 0;

    return {
      isReset,
      isHandover,
      isShockRoom,
      isTccc,
      isPreAllerta,
      isStandbySR,
      isWorkshop,
      isDebrief,
      isPause,
      isSetup,
      relevantPatient,
      visitingGroup,
      stationLocation,
      techActivityTitle,
      techBadge,
      techBadgeColor,
      techDuties,
      isTechDirectlyInvolved,
    };
  };

  // Helper for group badges colors and icons
  const getGroupBadgeInfo = (group: GroupType, activity: any) => {
    const actTitle = (activity?.title || '').toLowerCase();
    const actLoc = (activity?.location || '').toLowerCase();

    let bg = 'bg-neutral-800 text-neutral-200 border-neutral-700';
    let icon = <Activity className="w-3 h-3 shrink-0" />;
    let typeLabel = isEn ? 'Clinical' : 'Clinica';

    if (actTitle.includes('tccc') || actLoc.includes('tattico') || actLoc.includes('tactical')) {
      bg = 'bg-emerald-950 text-emerald-300 border-emerald-600';
      icon = <Flame className="w-3 h-3 text-emerald-400 shrink-0" />;
      typeLabel = isEn ? 'TCCC Extraction' : 'TCCC Estrazione';
    } else if (actTitle.includes('shock') || actLoc.includes('shock') || actTitle.includes('sbar')) {
      bg = 'bg-red-950 text-red-300 border-red-600';
      icon = <HeartPulse className="w-3 h-3 text-red-400 shrink-0" />;
      typeLabel = 'Shock Room ABCDE';
    } else if (actLoc.includes('ws1') || actTitle.includes('ws1') || actTitle.includes('airway')) {
      bg = 'bg-purple-950 text-purple-300 border-purple-600';
      icon = <Stethoscope className="w-3 h-3 text-purple-400 shrink-0" />;
      typeLabel = isEn ? 'WS1 Airway/Bleed' : 'WS1 Airway/Bleed';
    } else if (actLoc.includes('ws2') || actTitle.includes('ws2') || actTitle.includes('fast')) {
      bg = 'bg-cyan-950 text-cyan-300 border-cyan-600';
      icon = <Gauge className="w-3 h-3 text-cyan-400 shrink-0" />;
      typeLabel = isEn ? 'WS2 FAST Echo/IO' : 'WS2 Eco FAST/IO';
    } else if (actTitle.includes('briefing') || actTitle.includes('debrief')) {
      bg = 'bg-blue-950 text-blue-300 border-blue-600';
      icon = <Users className="w-3 h-3 text-blue-400 shrink-0" />;
      typeLabel = isEn ? 'Debrief / Plenary' : 'Debrief / Plenaria';
    } else if (actTitle.includes('pausa') || actTitle.includes('ristoro') || actTitle.includes('break') || actTitle.includes('lunch')) {
      bg = 'bg-neutral-900 text-neutral-400 border-neutral-700';
      typeLabel = isEn ? 'Break' : 'Pausa';
    }

    return { bg, icon, typeLabel };
  };

  const isDayBefore8 = (activeDay === 2 || activeDay === 3) && slotIdxInDay === 0;
  const isMorningCountdown = (activeDay === 2 || activeDay === 3) && slotIdxInDay === 1;
  const isNightToMorningCountdown = activeDay === 2 && currentSlot?.id === 'd2-chiusura';

  const currentSlotInfo = getSlotTechActivity(currentSlot);
  const currentPatient = currentSlotInfo.relevantPatient;
  const isScenarioInProgress = isScenarioSlot(currentSlot);

  const isCurrentSlotPreAlert =
    currentSlotInfo.isPreAllerta ||
    currentSlot.id.toLowerCase().includes('prealert') ||
    currentSlot.id.toLowerCase().includes('pre-alert') ||
    (currentSlot.title || '').toLowerCase().includes('pre-alert') ||
    (currentSlot.title || '').toLowerCase().includes('pre-allerta');

  const nextScenarioSlot =
    dayMasterSlots
      .slice(effectiveCurrentIdx + 1)
      .find((s) => isScenarioSlot(s)) || null;

  const nextScenarioStartTime = nextScenarioSlot?.timeRange
    ? nextScenarioSlot.timeRange.split('-')[0].trim()
    : '';

  const nextScenarioTechInfo = nextScenarioSlot
    ? getSlotTechActivity(nextScenarioSlot)
    : null;

  const targetPatient =
    nextScenarioTechInfo?.relevantPatient ||
    currentPatient ||
    assignedPatients[0] ||
    null;

  const showCountdown = isCurrentSlotPreAlert;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* SPECIAL COUNTDOWN MODES (Accoglienza pre 08:30 / Countdown 30 min) */}
      {/* ========================================================================= */}
      {isDayBefore8 && (
        <div className="bg-neutral-900 border-2 border-orange-500/80 p-5 rounded text-center space-y-3 shadow-xl">
          <div className="flex items-center justify-center gap-2 text-orange-400 font-bold uppercase text-xs tracking-widest">
            <Clock className="w-4 h-4" /> {isEn ? 'AWAITING COURSE OPENING AT 08:30 • GENERAL SYNCHRONIZATION' : 'ATTESA APERTURA CORSO ORE 08:30 • SINCRONIZZAZIONE GENERALE'}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase">
            {isEn ? 'Technical Staff Briefing & Radio Line Testing' : 'Briefing Staff Tecnico & Collaudo Linee Radio'}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto font-mono">
            {isEn
              ? 'Students arriving. Alignment of radio channels CH3 Tech, CH1 Control, artificial blood tanks inspection in the 3 Tactical Environments and testing of monitors and ventilators in the 3 Shock Room Boxes.'
              : 'Discenti in arrivo. Allineamento canali radio CH3 Tecnico, CH1 Regia, verifica serbatoi sangue artificiale nei 3 Ambienti Tattici e collaudo monitor e ventilatori nei 3 Box Shock Room.'}
          </p>
          <div className="inline-block bg-neutral-950 px-4 py-2 border border-neutral-800 rounded text-xs font-mono text-orange-400">
            {isEn ? 'Operational course opening at 08:30' : 'Apertura operativa del corso alle ore 08:30'}
          </div>
        </div>
      )}

      {isMorningCountdown && (
        <div className="bg-gradient-to-r from-orange-950/80 via-neutral-900 to-pink-950/80 border-2 border-orange-500 p-6 rounded shadow-2xl text-center space-y-4 animate-pulse">
          <div className="flex items-center justify-center gap-2 text-orange-300 font-bold uppercase text-xs tracking-widest">
            <AlertTriangle className="w-4 h-4 text-orange-400 animate-bounce" /> {isEn ? '30-MINUTE COUNTDOWN (08:00 - 08:30) • TECHNICAL & TEAM ALIGNMENT' : 'COUNTDOWN 30 MINUTI (08:00 - 08:30) • ALLINEAMENTO TECNICO & SQUADRE'}
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            {isEn ? 'Immediate Station Presence & Reception' : 'Presidio Immediato Postazioni & Accoglienza'}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-200 max-w-xl mx-auto font-mono">
            {isEn
              ? 'Student teams are gathering with their Faculty tutors. Technicians must man their stations and confirm green light on radio CH3.'
              : 'Le squadre discenti si stanno raggruppando con i rispettivi Faculty. I tecnici devono presidiare la propria postazione e confermare la luce verde via radio CH3.'}
          </p>
          <div className="text-4xl sm:text-5xl font-mono font-black text-orange-400 tracking-wider">
            {formatCumulativeTimer(timerSeconds)}
          </div>
        </div>
      )}

      {isNightToMorningCountdown && (
        <div className="bg-neutral-900 border-2 border-orange-500/80 p-5 rounded text-center space-y-3 shadow-xl">
          <div className="flex items-center justify-center gap-2 text-orange-400 font-bold uppercase text-xs tracking-widest">
            <Clock className="w-4 h-4" /> {isEn ? 'DAY 02 SESSION COMPLETED - TRANSITION TO DAY 03' : 'SESSIONE DAY 02 COMPLETATA - TRANSIZIONE VERSO DAY 03'}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase">
            {isEn ? 'Overnight Turnaround & Day 03 Specular Rotation' : 'Turnaround Notturno & Rotazione Speculare Day 03'}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto font-mono">
            {isEn
              ? 'All Day 02 blocks concluded. Full simulator battery recharging, restocking supplies, and specular group configuration for Day 03.'
              : 'Tutti i blocchi del Day 02 sono conclusi. Ricarica totale batterie simulatori, reintegro scorte e configurazione speculare dei gruppi per Day 03.'}
          </p>
          <div className="text-3xl sm:text-4xl font-mono font-black text-orange-400 tracking-wider">
            {formatCumulativeTimer(timerSeconds)}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FASE CORRENTE LIVE: COMPARAZIONE AFFIANCATA IN TEMPO REALE */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-pink-500/50 pb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCurrentSlotPreAlert ? 'bg-amber-400' : 'bg-pink-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isCurrentSlotPreAlert ? 'bg-amber-500' : 'bg-pink-500'}`}></span>
            </span>
            <span className={`text-xs font-mono font-black uppercase tracking-widest ${isCurrentSlotPreAlert ? 'text-amber-400' : 'text-pink-400'}`}>
              {isScenarioInProgress
                ? (isEn ? '🔴 CURRENT SCENARIO IN PROGRESS • MASTER LIVE' : '🔴 SCENARIO CLINICO IN CORSO • REGIA MASTER LIVE')
                : isCurrentSlotPreAlert
                ? (isEn ? '⚠️ OPERATIONAL PRE-ALERT • COUNTDOWN TO SCENARIO START' : '⚠️ PRE-ALLERTA OPERATIVA • COUNTDOWN INIZIO SCENARIO')
                : (isEn ? '⚙️ CURRENT TECHNICAL PHASE • REGIA MASTER' : '⚙️ FASE TECNICA ASSEGNATA • REGIA MASTER')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 bg-neutral-950 rounded text-xs font-mono font-bold border ${isCurrentSlotPreAlert ? 'text-amber-300 border-amber-600' : 'text-pink-300 border-pink-600'}`}>
              {isEn ? 'Phase' : 'Fase'} {effectiveCurrentIdx + 1} {isEn ? 'of' : 'di'} {dayMasterSlots.length} ({currentSlot?.timeRange})
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIQUADRO LIVE: CRONOMETRO FASE CORRENTE (SOLO SCENARIO IN CORSO)         */}
        {/* ========================================================================= */}
        {isScenarioInProgress ? (
          <div className="bg-neutral-950 border-2 border-pink-500 rounded-lg p-4 sm:p-5 shadow-2xl space-y-4 font-sans ring-2 ring-pink-500/20">
            {/* INTESTAZIONE SPECIFICA DI ASSOCIAZIONE ALLO SCENARIO IN CORSO */}
            <div className="bg-pink-950/40 border border-pink-600/70 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-pink-600 text-white rounded shrink-0">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-black text-pink-300 uppercase tracking-widest">
                      {isEn ? 'CLINICAL SCENARIO IN PROGRESS' : 'SCENARIO CLINICO IN CORSO'}
                    </span>
                    <span className="px-2 py-0.5 bg-pink-600 text-white font-mono font-black text-[9px] uppercase rounded">
                      {currentSlotInfo.isHandover
                        ? 'HANDOVER 1:1 SBAR'
                        : currentSlot.id.includes('tccc')
                        ? 'TCCC ADDESTRAMENTO'
                        : 'SHOCK ROOM ALTA FEDELTÀ'}
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-sm sm:text-base font-mono">
                    {currentPatient ? (
                      <span>
                        <strong className="text-pink-400">{currentPatient.scenarioCode}</strong>: {currentPatient.title}
                      </span>
                    ) : (
                      currentSlot.title
                    )}
                  </h4>
                </div>
              </div>

              {/* Associazione Postazione & Paziente Presidiato */}
              <div className="text-left sm:text-right font-mono text-xs border-t sm:border-t-0 sm:border-l border-pink-700/50 pt-2 sm:pt-0 sm:pl-3 shrink-0">
                <div className="text-[10px] text-pink-300/80 uppercase font-bold">
                  {isEn ? 'Station & Simulator Pt:' : 'Postazione & Simulatore:'}
                </div>
                <div className="text-white font-bold">
                  📍 {currentSlotInfo.stationLocation}
                </div>
                {currentPatient && (
                  <div className="text-pink-300 text-[11px]">
                    Pt. #{currentPatient.id} ({currentPatient.name})
                  </div>
                )}
              </div>
            </div>

            {/* RIGA 1: STATO OPERATIVO SCENARIO CORRENTE (Countdown unico visibile nel pannello superiore) */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-pink-950/40 via-neutral-900 to-black p-3.5 border border-pink-500/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-500/20 border border-pink-500 text-pink-400 shrink-0">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-black text-pink-400 uppercase tracking-widest">
                      {isEn ? 'SCENARIO TIMELINE SYNCHRONIZATION' : 'SINCRONIZZAZIONE SCENARIO LIVE'}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-mono font-bold border flex items-center gap-1 ${
                        isTimerRunning
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-amber-950 text-amber-300 border-amber-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isTimerRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                        }`}
                      />
                      {isTimerRunning ? (isEn ? 'AUTOMATION ACTIVE' : 'AUTOMAZIONE ATTIVA') : (isEn ? 'PAUSED (STANDBY)' : 'IN PAUSA (STANDBY)')}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-neutral-300 flex items-center gap-2 flex-wrap">
                    <span>{isEn ? 'Duration: ' : 'Durata scenario: '} <strong className="text-white">{slotDurationMinutes}:00 min</strong></span>
                    <span>•</span>
                    <span className="text-pink-300 text-[11px] font-bold">
                      {isEn ? '⏱️ Live Countdown in Top Panel' : '⏱️ Countdown Live nel Pannello Superiore'}
                    </span>
                  </div>
                </div>
              </div>

            {/* Avanzamento e Toggle Dettagli */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right font-mono">
                <div className="text-[10px] text-neutral-400 uppercase">{isEn ? 'Phase Progress' : 'Avanzamento Fase'}</div>
                <div className="text-lg font-black text-pink-300">
                  {slotProgressPercent}%{' '}
                  <span className="text-xs font-normal text-neutral-400">
                    ({Math.floor(slotElapsedMinutes)}/{slotDurationMinutes} min)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailedPhases(!showDetailedPhases)}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-pink-300 hover:text-white border border-pink-700 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>{showDetailedPhases ? (isEn ? 'Collapse Phase Times' : 'Comprimi Tempi Fasi') : (isEn ? 'Expand Phase Times' : 'Espandi Tempi Fasi')}</span>
                {showDetailedPhases ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* BARRA DI PROGRESSO CONTINUA DINAMICA */}
          <div className="space-y-1">
            <div className="h-2.5 w-full bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden flex">
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
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>00:00 ({isEn ? 'Start' : 'Inizio'})</span>
              <span>
                {currentSlotInfo.isHandover
                  ? (isEn ? 'CRITICAL: Mandatory 5-Minute Handover' : 'CRITICO: Handover 5 Minuti Tassativo')
                  : currentSlotInfo.isReset
                  ? (isEn ? 'CRITICAL: Mandatory 15-Minute Reset' : 'CRITICO: Reset 15 Minuti Tassativo')
                  : (isEn ? `Mid-phase (${Math.round(slotDurationMinutes / 2)} min)` : `Metà fase (${Math.round(slotDurationMinutes / 2)} min)`)}
              </span>
              <span>{slotDurationMinutes}:00 ({isEn ? 'End' : 'Termine'})</span>
            </div>
          </div>

          {/* RIGA 2: CRONOPROGRAMMA RIGIDO DEI TEMPI DELLE FASI INDICATE */}
          {showDetailedPhases && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 text-xs font-mono">
                <span className="text-yellow-400 font-bold uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-yellow-500" />
                  {isEn ? 'INDICATED PHASE TIMINGS • ' : 'TEMPI DELLE FASI INDICATE • '}{isTacticalBlock ? (isEn ? `TRAINING BLOCK 0${currentBlockNumber} (90 MINUTES)` : `BLOCCO FORMATIVO 0${currentBlockNumber} (90 MINUTI)`) : currentSlot.title}
                </span>
                <span className="text-neutral-400 text-[11px]">
                  {isTacticalBlock
                    ? (isEn ? 'Rigid 15-min slot structure (TCCC ➔ Handover :30 ➔ Shock Room ➔ Debrief ➔ Reset)' : 'Scansione rigida in slot da 15 min (TCCC ➔ Handover :30 ➔ Shock Room ➔ Debrief ➔ Reset)')
                    : (isEn ? 'Slot control points and timed tasks' : 'Punti di controllo e compiti temporali dello slot')}
                </span>
              </div>

              {/* GRIGLIA FASI INDICATE */}
              {isTacticalBlock ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {block90MinutePhases.map((phase, pIdx) => {
                    return (
                      <div
                        key={phase.id}
                        className={`p-3 border transition-all ${
                          phase.isActive
                            ? 'bg-gradient-to-br from-pink-950/60 to-black border-pink-400 ring-2 ring-pink-500/50 shadow-lg'
                            : phase.isCompleted
                            ? 'bg-neutral-950/80 border-emerald-900/60 opacity-80'
                            : 'bg-neutral-950/90 border-neutral-800 opacity-60'
                        }`}
                      >
                        {/* Top step badge */}
                        <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-neutral-800">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-neutral-800 text-yellow-400 font-mono font-black text-[10px] border border-neutral-700">
                              SLOT {pIdx + 1}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-white">
                              {phase.timeWindow}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              ({phase.durationMinutes}m)
                            </span>
                          </div>

                          {phase.isActive ? (
                            <span className="px-2 py-0.5 bg-pink-600 text-white font-mono font-black text-[10px] animate-pulse flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              {isEn ? 'RUNNING NOW' : 'IN CORSO ORA'}
                            </span>
                          ) : phase.isCompleted ? (
                            <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono text-[9px] font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {isEn ? 'COMPLETED' : 'COMPLETATA'}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-[9px]">
                              {isEn ? 'PENDING' : 'IN ATTESA'}
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div className="pt-2 space-y-1">
                          <div className="text-xs font-mono font-bold text-yellow-300 leading-snug">
                            {phase.phaseTitle}
                          </div>
                          <p className="text-[11px] text-neutral-300 line-clamp-2">
                            {phase.description}
                          </p>

                          {/* Technical Duty for this phase */}
                          <div className="pt-1.5 mt-1 border-t border-neutral-800/80">
                            <span className="text-[9px] font-mono text-pink-400 uppercase font-black block">
                              {isEn ? '🔧 Technical Duty:' : '🔧 Mansione Tecnici:'}
                            </span>
                            <p className="text-[10px] font-mono text-neutral-300 leading-tight">
                              {phase.techFocus}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {nonTacticalCheckpoints.map((cp) => (
                    <div
                      key={cp.id}
                      className={`p-3 border ${
                        cp.isActive
                          ? 'bg-pink-950/40 border-pink-500 shadow'
                          : cp.isCompleted
                          ? 'bg-neutral-950/80 border-emerald-900/60'
                          : 'bg-neutral-950 border-neutral-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                        <span className="text-[10px] font-mono font-bold text-yellow-400">
                          {cp.timeWindow}
                        </span>
                        {cp.isActive ? (
                          <span className="px-1.5 py-0.5 bg-pink-600 text-white font-mono text-[9px] font-black animate-pulse">
                            {isEn ? 'LIVE NOW' : 'LIVE ORA'}
                          </span>
                        ) : cp.isCompleted ? (
                          <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> {isEn ? 'DONE' : 'FATTO'}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-neutral-500">{isEn ? 'WAIT' : 'ATTESA'}</span>
                        )}
                      </div>
                      <div className="pt-1.5 space-y-1">
                        <div className="text-xs font-mono font-bold text-white">{cp.title}</div>
                        <p className="text-[10px] font-mono text-neutral-300">{cp.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : isCurrentSlotPreAlert ? (
        /* ========================================================================= */
        /* FASE PRE-ALLERTA: COUNTDOWN DIGITALE CON SPECIFICA INIZIO DELLO SCENARIO  */
        /* ========================================================================= */
        <div className="bg-neutral-950 border-2 border-amber-500 rounded-lg p-4 sm:p-5 shadow-2xl space-y-4 font-sans ring-2 ring-amber-500/20">
          {/* INTESTAZIONE SPECIFICA DI PRE-ALLERTA CON NOME & ORARIO DELLO SCENARIO IN ARRIVO */}
          <div className="bg-amber-950/40 border border-amber-600/70 p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-black rounded shrink-0 shadow-md">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-widest">
                    {isEn ? 'OPERATIONAL PRE-ALERT (T -15 MIN)' : 'FASE DI PRE-ALLERTA OPERATIVA (T -15 MIN)'}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-500 text-black font-mono font-black text-[9px] uppercase rounded">
                    {isEn ? 'COUNTDOWN TO SCENARIO START' : 'COUNTDOWN ALL\'INIZIO DELLO SCENARIO'}
                  </span>
                  {nextScenarioStartTime && (
                    <span className="px-2 py-0.5 bg-neutral-900 border border-amber-500 text-amber-300 font-mono font-bold text-[9px] uppercase rounded">
                      {isEn ? `STARTS AT ${nextScenarioStartTime}` : `INIZIO SCENARIO ORE ${nextScenarioStartTime}`}
                    </span>
                  )}
                </div>
                <h4 className="text-white font-bold text-sm sm:text-base font-mono mt-0.5">
                  {nextScenarioSlot ? (
                    <span>
                      {isEn ? 'Target Scenario: ' : 'Scenario in Partenza: '}
                      <strong className="text-amber-400">{nextScenarioSlot.title}</strong>
                    </span>
                  ) : (
                    currentSlot.title
                  )}
                </h4>
              </div>
            </div>

            {/* Associazione Postazione & Paziente Target in Arrivo */}
            <div className="text-left sm:text-right font-mono text-xs border-t sm:border-t-0 sm:border-l border-amber-700/50 pt-2 sm:pt-0 sm:pl-3 shrink-0">
              <div className="text-[10px] text-amber-300/80 uppercase font-bold">
                {isEn ? 'Station & Target Pt:' : 'Postazione & Simulatore Target:'}
              </div>
              <div className="text-white font-bold">
                📍 {currentSlotInfo.stationLocation}
              </div>
              {targetPatient && (
                <div className="text-amber-300 text-[11px]">
                  Pt. #{targetPatient.id} ({targetPatient.scenarioCode} • {targetPatient.name})
                </div>
              )}
            </div>
          </div>

          {/* RIGA 1: STATO OPERATIVO PRE-ALLERTA (Countdown unico visibile nel pannello superiore) */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-black p-3.5 border border-amber-500/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-500 text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-400 animate-bounce" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-mono font-black text-amber-400 uppercase tracking-widest">
                    {isEn ? 'PRE-ALERT TIMELINE STATUS' : 'STATO OPERATIVO PRE-ALLERTA'}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold border flex items-center gap-1 bg-amber-950 text-amber-300 border-amber-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    {isEn ? 'PRE-ALERT TIMING ACTIVE' : 'TIMING PRE-ALLERTA ATTIVO'}
                  </span>
                </div>

                <div className="text-xs font-mono text-neutral-300 flex items-center gap-2 flex-wrap">
                  <span>{isEn ? 'Pre-alert window: ' : 'Finestra pre-allerta: '} <strong className="text-white">{slotDurationMinutes}:00 min</strong></span>
                  <span>•</span>
                  <span className="text-amber-300 text-[11px] font-bold">
                    {isEn ? '⏱️ Live Countdown in Top Panel' : '⏱️ Countdown Live nel Pannello Superiore'}
                  </span>
                </div>
              </div>
            </div>

            {/* Avanzamento e Toggle Specifiche */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right font-mono">
                <div className="text-[10px] text-amber-300/80 uppercase font-bold">{isEn ? 'Pre-Alert Progress' : 'Avanzamento Pre-Allerta'}</div>
                <div className="text-lg font-black text-amber-300">
                  {slotProgressPercent}%{' '}
                  <span className="text-xs font-normal text-neutral-400">
                    ({Math.floor(slotElapsedMinutes)}/{slotDurationMinutes} min)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailedPhases(!showDetailedPhases)}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-300 hover:text-white border border-amber-600 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>{showDetailedPhases ? (isEn ? 'Collapse Specs' : 'Comprimi Dettagli') : (isEn ? 'Expand Specs' : 'Espandi Dettagli')}</span>
                {showDetailedPhases ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* BARRA DI PROGRESSO COUNTDOWN */}
          <div className="space-y-1">
            <div className="h-2.5 w-full bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden flex">
              <div
                className={`h-full transition-all duration-300 ${
                  slotRemainingSeconds <= 180
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400'
                }`}
                style={{ width: `${slotProgressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-neutral-400">
              <span>00:00 ({isEn ? 'Start Pre-Alert' : 'Inizio Pre-Allerta'})</span>
              <span className="text-amber-400 font-bold">
                ⚠️ {isEn ? 'T -7:30 min • Priming & Telemetry Test' : 'T -7:30 min • Innesco Pompe & Test Telemetria'}
              </span>
              <span className="text-amber-300 font-bold">
                🏁 {nextScenarioStartTime ? `${nextScenarioStartTime} ` : ''}({isEn ? 'Scenario Starts' : 'Inizio Scenario'})
              </span>
            </div>
          </div>

          {/* SCHEDA SPECIFICHE AVVIO SCENARIO (DETTAGLI SUL PROSSIMO SCENARIO) */}
          {showDetailedPhases && (
            <div className="pt-2 border-t border-amber-900/50 space-y-2">
              <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                {isEn ? 'UPCOMING SCENARIO SPECIFICATIONS & TECHNICAL READINESS' : 'SPECIFICHE SCENARIO IN ARRIVO & PRONTEZZA TECNICA'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                {/* Card 1: Orario e Titolo Scenario */}
                <div className="bg-neutral-900/90 border border-amber-700/60 p-3 rounded space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {isEn ? 'Start Time & Title:' : 'Orario di Inizio & Titolo:'}
                  </span>
                  <div className="text-sm font-bold text-white">
                    {nextScenarioStartTime ? `Ore ${nextScenarioStartTime}` : currentSlot.timeRange}
                  </div>
                  <p className="text-[11px] text-amber-200 font-bold">
                    {nextScenarioSlot?.title || currentSlot.title}
                  </p>
                  {nextScenarioSlot?.description && (
                    <p className="text-[10px] text-neutral-400 line-clamp-2">
                      {nextScenarioSlot.description}
                    </p>
                  )}
                </div>

                {/* Card 2: Postazione e Discenti in Ingresso */}
                <div className="bg-neutral-900/90 border border-amber-700/60 p-3 rounded space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {isEn ? 'Station & Incoming Team:' : 'Postazione & Squadra in Ingresso:'}
                  </span>
                  <div className="text-xs font-bold text-white">
                    📍 {currentSlotInfo.stationLocation}
                  </div>
                  <p className="text-[11px] text-neutral-300">
                    {nextScenarioTechInfo?.visitingGroup ? (
                      <span>
                        {isEn ? 'Incoming Students: ' : 'Discenti attesi: '}
                        <strong className="text-amber-300">Gruppo {nextScenarioTechInfo.visitingGroup}</strong>
                      </span>
                    ) : currentSlotInfo.visitingGroup ? (
                      <span>Gruppo {currentSlotInfo.visitingGroup}</span>
                    ) : (
                      <span>Tutti i Macro-Gruppi (ALPHA, BRAVO, CHARLIE, DELTA)</span>
                    )}
                  </p>
                  <div className="text-[10px] text-neutral-400">
                    {isEn ? 'Radio CH3 Tech • CH1 Regia Control' : 'Radio CH3 Tecnico • CH1 Regia Master'}
                  </div>
                </div>

                {/* Card 3: Paziente Simulatore & Mansione Pre-Allerta */}
                <div className="bg-neutral-900/90 border border-amber-700/60 p-3 rounded space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" /> {isEn ? 'Simulator Pt & Pre-Alert Duty:' : 'Simulatore & Compiti Pre-Allerta:'}
                  </span>
                  {targetPatient ? (
                    <div className="text-xs font-bold text-pink-300">
                      Pt. #{targetPatient.id} • {targetPatient.scenarioCode}
                      <div className="text-[10px] text-neutral-300 font-normal truncate">
                        {targetPatient.name}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-300">
                      {isEn ? 'Station Setup Ready' : 'Postazione Pronta'}
                    </div>
                  )}
                  <p className="text-[10px] text-amber-300 leading-tight">
                    {isEn
                      ? 'Hydraulic circuit check, bleed pump priming, safety word test.'
                      : 'Innesco pompe sanguinamento, verifica barelle e conferma luce verde.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* FASE NON-SCENARIO: CRONOMETRO ELIMINATO, PANNELLO OPERATIVO MANSIONI TECH */
        /* ========================================================================= */
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded border shrink-0 ${
                currentSlotInfo.isReset
                  ? 'bg-yellow-950/60 border-yellow-600 text-yellow-400'
                  : currentSlotInfo.isDebrief
                  ? 'bg-blue-950/60 border-blue-600 text-blue-400'
                  : 'bg-neutral-900 border-neutral-700 text-pink-400'
              }`}
            >
              {currentSlotInfo.isReset ? (
                <Wrench className="w-6 h-6 animate-pulse" />
              ) : currentSlotInfo.isDebrief ? (
                <Users className="w-6 h-6" />
              ) : (
                <Clock className="w-6 h-6 text-neutral-400" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-0.5 text-[10px] font-black uppercase rounded border ${
                    currentSlotInfo.isReset
                      ? 'bg-yellow-950 text-yellow-300 border-yellow-600'
                      : currentSlotInfo.isDebrief
                      ? 'bg-blue-950 text-blue-300 border-blue-600'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-700'
                  }`}
                >
                  {currentSlotInfo.isReset
                    ? (isEn ? 'TECHNICAL RESET TURNAROUND' : 'RESET TECNICO & SANIFICAZIONE')
                    : currentSlotInfo.isDebrief
                    ? (isEn ? 'CLINICAL DEBRIEFING PHASE' : 'DEBRIEFING CLINICO COLLEGIALE')
                    : (isEn ? 'GENERAL TECHNICAL PHASE' : 'FASE TECNICO-LOGISTICA')}
                </span>
                <span className="text-[11px] text-neutral-400 font-bold">
                  {currentSlot?.timeRange} ({currentSlot?.durationMinutes} min)
                </span>
                <span className="px-2 py-0.5 text-[9px] bg-neutral-900 text-neutral-400 border border-neutral-800 rounded font-bold">
                  {isEn ? '⏹️ Scenario Stopwatch: Paused' : '⏹️ Cronometro Scenario: Disattivato'}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                {currentSlot?.title}
              </h3>

              <p className="text-xs text-neutral-300 max-w-3xl">
                {currentSlotInfo.isReset
                  ? (isEn
                      ? 'Turnaround and station sanitization in progress. Focus on checklist duties, consumables refill, and preparation for next scenario.'
                      : 'Sanificazione postazioni, ripristino cute, sostituzione consumabili e ricarica sangue prima del blocco successivo.')
                  : currentSlotInfo.isDebrief
                  ? (isEn
                      ? 'Faculty clinical debriefing and NTS video analysis. Assist with PTZ playback and vital sign record archiving.'
                      : 'Revisione video NTS e debriefing con Faculty. Assistenza tecnica per playback PTZ e archivio tracciati.')
                  : (isEn
                      ? 'General logistics and reception. The scenario timer will automatically resume at the start of the next clinical simulation.'
                      : 'Presidio postazione e allineamento staff. Il cronometro si attiverà automaticamente all\'avvio dello scenario clinico.')}
              </p>
            </div>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded text-left md:text-right shrink-0 font-mono space-y-1 w-full md:w-auto">
            <span className="text-[10px] text-neutral-400 uppercase block font-bold">
              {isEn ? 'TECHNICAL FOCUS' : 'FOCUS TECNICO'}
            </span>
            <div className="text-xs font-bold text-pink-300">
              📍 {currentSlotInfo.stationLocation}
            </div>
            <div className="text-[11px] text-neutral-400">
              {isEn ? 'Check assigned duties below' : 'Consulta mansioni operative sottostanti'}
            </div>
          </div>
        </div>
      )}

        {/* LIVE TECHNICAL DUTIES CARD */}
        <div className="w-full bg-neutral-950 border-2 border-pink-500 rounded-lg p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-pink-500/30 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded border ${currentSlotInfo.techBadgeColor || 'bg-pink-950 text-pink-300 border-pink-700'}`}>
                {currentSlotInfo.techBadge}
              </span>
              <span className="text-xs font-mono text-pink-400 font-bold">
                📍 {currentSlotInfo.stationLocation}
              </span>
              {currentSlotInfo.visitingGroup && (
                <span className="px-2 py-0.5 bg-pink-950 text-pink-300 border border-pink-700 font-black text-[10px] rounded">
                  {isEn ? 'Expected: GROUP' : 'Discenti attesi: GRUPPO'} {currentSlotInfo.visitingGroup}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onOpenQuadroPubblico && (
                <button
                  type="button"
                  onClick={onOpenQuadroPubblico}
                  className="px-2.5 py-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-black font-black text-[11px] uppercase rounded transition-all cursor-pointer flex items-center gap-1.5 shadow border border-orange-400"
                  title={isEn ? 'Open Public Course Overview Menu' : 'Apri Menu Quadro Pubblico del Corso'}
                >
                  <Globe className="w-3.5 h-3.5 text-black" />
                  <span>{isEn ? 'Public Course' : 'Quadro Pubblico Corso'}</span>
                </button>
              )}
              <span className="bg-pink-600 text-white font-mono font-black text-[10px] px-3 py-1 uppercase rounded tracking-wider flex items-center gap-1">
                <Wrench className="w-3 h-3" /> {currentTech.badgeCode} ({currentTech.name.split(' ')[0]})
              </span>
            </div>
          </div>

          {/* Titolo e Mansione Principale del Tecnico */}
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              {currentSlotInfo.techActivityTitle}
            </h3>
          </div>

          {/* Due Colonne Affiancate: Postazione & Simulatore a Sinistra, Mansioni a Destra */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Postazione, Scenario & Biomodello Assegnato */}
            <div className="bg-neutral-900/90 p-3.5 border border-neutral-800 rounded space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
                <span className="text-[10px] text-pink-400 uppercase font-black tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {isEn ? 'Station:' : 'Postazione:'} {currentSlotInfo.stationLocation}
                </span>
                {currentSlotInfo.visitingGroup && (
                  <span className="px-2 py-0.5 bg-pink-950 text-pink-300 border border-pink-700 font-black text-[10px] rounded">
                    {isEn ? 'Expected students: GROUP' : 'Discenti attesi: GRUPPO'} {currentSlotInfo.visitingGroup}
                  </span>
                )}
              </div>

              {currentPatient ? (
                <div className="space-y-1.5">
                  <p className="text-white font-bold text-sm">
                    <span className="text-pink-300">{currentPatient.scenarioCode}</span>: {currentPatient.title}
                  </p>
                  <p className="text-neutral-300 text-[11px]">
                    <strong>{isEn ? 'Simulator:' : 'Simulatore:'}</strong> {currentPatient.simulatori || (isEn ? 'High Fidelity' : 'Alta Fedeltà')} • <strong>Moulage:</strong> {currentPatient.moulageProtesi || 'Standard'}
                  </p>
                  {currentPatient.lesioni && currentPatient.lesioni.length > 0 && (
                    <p className="text-neutral-400 text-[10px]">
                      <strong>{isEn ? 'Injuries:' : 'Lesioni:'}</strong> {currentPatient.lesioni.join('; ')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-neutral-400 text-xs">
                  {isEn
                    ? 'Technical floor supervision, backup consumables inventory and CH3 radio coordination.'
                    : 'Supervisione tecnica di sala, riserva presidi consumabili e coordinamento radio CH3.'}
                </p>
              )}
            </div>

            {/* Mansioni Operative Dettagliate dello Slot */}
            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-[10px] text-pink-400 uppercase font-black tracking-widest block flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-pink-400" />
                {isEn ? 'Your Technical Tasks for this Phase:' : 'I Tuoi Compiti Tecnici per questa Fase:'}
              </span>
              <ul className="space-y-1.5">
                {currentSlotInfo.techDuties.map((duty, dIdx) => (
                  <li
                    key={dIdx}
                    className="bg-neutral-900/80 p-2 border border-neutral-800 rounded flex items-start gap-2 text-neutral-200 text-xs"
                  >
                    <span className="text-pink-400 font-bold shrink-0">▸</span>
                    <span>{duty}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottoni di Azione Operativa Rapida */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-pink-500/30 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {currentPatient && (
                <button
                  type="button"
                  onClick={() => onOpenProtesiModal(currentPatient)}
                  className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 font-bold text-xs uppercase rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <ClipboardList className="w-3.5 h-3.5" /> {isEn ? 'Resources' : 'Risorse'}
                </button>
              )}
              {currentPatient && (
                <button
                  type="button"
                  onClick={() => onOpenChecklist(currentPatient)}
                  className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> {isEn ? 'Scenario Checklist' : 'Checklist Scenario'}
                </button>
              )}
              <button
                type="button"
                onClick={onSwitchToRegistro}
                className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold text-xs uppercase rounded cursor-pointer"
              >
                {isEn ? 'Resource Registry' : 'Registro Risorse'}
              </button>
              {onOpenQuadroPubblico && (
                <button
                  type="button"
                  onClick={onOpenQuadroPubblico}
                  className="px-2.5 py-1.5 bg-orange-950 hover:bg-orange-900 text-orange-300 border border-orange-700 font-bold text-xs uppercase rounded cursor-pointer flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-orange-400" />
                  <span>{isEn ? 'Public Course' : 'Quadro Pubblico'}</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                onSendRadioMessage(
                  isEn
                    ? `[CH3 STATUS] Station ${currentSlotInfo.stationLocation} ready and manned for Phase ${effectiveCurrentIdx + 1} (${currentPatient?.scenarioCode || 'OK'}).`
                    : `[STATO CH3] Postazione ${currentSlotInfo.stationLocation} pronta e presidiata per Fase ${effectiveCurrentIdx + 1} (${currentPatient?.scenarioCode || 'OK'}).`
                )
              }
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold text-xs uppercase rounded transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-pink-400" /> {isEn ? 'Status OK CH3' : 'Stato OK CH3'}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PROSSIME FASI: TIMELINE PUBBLICA & COMPITI TECNICI AFFIANCATI */}
      {/* ========================================================================= */}
      {futureSlots.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                {isEn ? `Upcoming Scheduled Phases (${futureSlots.length} Phases Remaining)` : `Prossime Fasi in Programma (${futureSlots.length} Fasi Rimanenti)`}
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                {isEn
                  ? 'Course timeline and technical duties run in parallel until the end of the day'
                  : 'La timeline del corso e le tue mansioni tecniche scorrono in parallelo fino a fine giornata'}
              </p>
            </div>
            <span className="text-[11px] font-mono text-neutral-400 self-start sm:self-center">
              {isEn ? 'Phases to complete:' : 'Fasi da completare:'} {effectiveCurrentIdx + 2} - {dayMasterSlots.length}
            </span>
          </div>

          <div className="space-y-3">
            {futureSlots.map(({ slot, originalIdx }) => {
              const slotInfo = getSlotTechActivity(slot);
              const slotPatient = slotInfo.relevantPatient;

              return (
                <div
                  key={slot.id}
                  className={`bg-neutral-900/90 border rounded-lg p-4 transition-all ${
                    slotInfo.isReset
                      ? 'border-yellow-700/80 hover:border-yellow-500'
                      : slotInfo.isHandover
                      ? 'border-red-700/80 hover:border-red-500'
                      : 'border-neutral-800 hover:border-pink-500/50'
                  }`}
                >
                  {/* Top Bar: Orario, Numerazione, Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded font-black flex items-center justify-center text-xs shrink-0 bg-neutral-950 text-orange-400 border border-neutral-800">
                        {originalIdx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap font-mono">
                          <span className="text-neutral-200 font-bold text-xs">
                            🕒 {slot.timeRange}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            ({slot.durationMinutes} min)
                          </span>
                          <span className="text-white font-black text-xs uppercase">
                            • {slot.title}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap font-mono self-end sm:self-center">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded border ${slotInfo.techBadgeColor || 'bg-neutral-950 text-neutral-300 border-neutral-700'}`}>
                        {slotInfo.techBadge}
                      </span>
                      {slotPatient && (
                        <span className="px-2 py-0.5 bg-neutral-950 text-pink-300 border border-neutral-800 text-[11px] font-bold">
                          🎯 {slotPatient.scenarioCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Future slot technical duty card */}
                  <div className="pt-2.5">
                    <div className="bg-neutral-950/80 p-3.5 rounded border border-pink-900/40 space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> {isEn ? 'Technical Duty & Station:' : 'Mansione Tecnica & Postazione:'}
                        </span>
                        <span className="text-[11px] text-pink-300 font-bold">
                          📍 {slotInfo.stationLocation}
                        </span>
                      </div>

                      <p className="text-white font-bold text-xs">
                        {slotInfo.techActivityTitle}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-neutral-300 pt-1 border-t border-neutral-800/80">
                        <span className="truncate max-w-[280px] text-neutral-400">
                          {slotPatient ? `${isEn ? 'Sim:' : 'Sim:'} ${slotPatient.simulatori || (isEn ? 'High Fidelity' : 'Alta Fedeltà')}` : (isEn ? 'Logistical support' : 'Supporto logistico')}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {slotPatient && (
                            <button
                              type="button"
                              onClick={() => onOpenProtesiModal(slotPatient)}
                              className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[10px] font-bold uppercase rounded cursor-pointer"
                            >
                              {isEn ? 'Resources' : 'Risorse'}
                            </button>
                          )}
                          {slotPatient && (
                            <button
                              type="button"
                              onClick={() => onOpenChecklist(slotPatient)}
                              className="px-2.5 py-0.5 bg-pink-950 hover:bg-pink-900 text-pink-300 border border-pink-700 text-[10px] font-bold uppercase rounded cursor-pointer"
                            >
                              Checklist
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FASI CONCLUSE (ACCORDION COMPRIMIBILE) */}
      {/* ========================================================================= */}
      {pastSlots.length > 0 && (
        <div className="pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => setShowCompletedArchive(!showCompletedArchive)}
            className="w-full p-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between text-xs font-mono text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold uppercase tracking-wider text-neutral-300">
                {isEn ? `Today Completed Phases Archive (${pastSlots.length} Phases)` : `Archivio Fasi Concluse Oggi (${pastSlots.length} Fasi)`}
              </span>
              <span className="text-[11px] text-neutral-500">
                - {showCompletedArchive ? (isEn ? 'Click to collapse' : 'Clicca per comprimere') : (isEn ? 'Hidden by default (click to view)' : 'Nascoste di default (clicca per visualizzare)')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-orange-400 text-xs font-bold">
              {showCompletedArchive ? (
                <>{isEn ? 'Hide' : 'Nascondi'} <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>{isEn ? 'Show' : 'Mostra'} <ChevronDown className="w-4 h-4" /></>
              )}
            </div>
          </button>

          {showCompletedArchive && (
            <div className="space-y-2 pt-3">
              {pastSlots.map(({ slot, originalIdx }) => {
                const slotInfo = getSlotTechActivity(slot);
                const slotPatient = slotInfo.relevantPatient;

                return (
                  <div
                    key={slot.id}
                    className="bg-neutral-950/60 border border-neutral-800/80 p-3 rounded-lg text-xs font-mono opacity-80 hover:opacity-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-neutral-900 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-neutral-400 font-bold">
                            🕒 {slot.timeRange}
                          </span>
                          <span className="px-1.5 py-0.2 bg-emerald-950/60 text-emerald-400 border border-emerald-900 text-[10px] font-bold uppercase rounded">
                            {isEn ? 'Completed' : 'Completata'}
                          </span>
                          <span className="text-neutral-400 text-[10px]">
                            {isEn ? 'Phase' : 'Fase'} {originalIdx + 1}: {slot.title}
                          </span>
                        </div>
                        <h5 className="text-neutral-300 font-bold text-xs mt-0.5">
                          {slotInfo.techActivityTitle}
                        </h5>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[11px] text-neutral-400">
                        📍 {slotInfo.stationLocation}
                      </span>
                      {slotPatient && (
                        <button
                          type="button"
                          onClick={() => onOpenChecklist(slotPatient)}
                          className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-pink-400 border border-neutral-700 text-[10px] rounded cursor-pointer"
                        >
                          Checklist
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. RIEPILOGO SCENARI & CHECKLIST IN CARICO A TECH-xx */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-4 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-pink-400 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-pink-400" /> {isEn ? `Clinical Scenarios Assigned to ${currentTech.badgeCode} (${assignedPatients.length} Patients)` : `Scenari Clinici in Carico a ${currentTech.badgeCode} (${assignedPatients.length} Pazienti)`}
          </h3>
          <span className="text-xs font-mono text-neutral-400">
            Day 0{activeDay} • {assignedPatients.length} {isEn ? 'Patients in Charge' : 'Pazienti in Carico'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedPatients.map((patient) => {
            const checklist = patient.techChecklist || { preDone: false, intraDone: false, postDone: false };
            const isCompleted = checklist.preDone && checklist.intraDone && checklist.postDone;

            return (
              <div
                key={patient.id}
                onClick={() => onOpenChecklist(patient)}
                className="bg-neutral-900 border-2 border-neutral-800 hover:border-pink-500 p-4 rounded space-y-2 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  {isCompleted ? (
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 text-[10px] font-bold rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Reset OK
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-yellow-950 text-yellow-300 border border-yellow-600 text-[10px] font-bold rounded animate-pulse">
                      ⚠️ {isEn ? 'In Progress' : 'In Gestione'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pr-24">
                  <span className="px-2 py-0.5 bg-neutral-950 text-pink-300 border border-pink-700 font-black text-xs">
                    {patient.scenarioCode}
                  </span>
                  <span className="text-neutral-400 text-xs font-bold">
                    {isEn ? 'Patient #' : 'Paziente #'}{patient.id}
                  </span>
                </div>

                <h4 className="text-white font-black text-sm uppercase group-hover:text-pink-400 transition-colors truncate">
                  {patient.title || (isEn ? 'Trauma Scenario' : 'Scenario di Trauma')}
                </h4>

                <div className="text-xs text-neutral-300 font-mono space-y-0.5">
                  <p className="truncate">
                    <strong>{isEn ? 'Simulator:' : 'Simulatore:'}</strong> {patient.simulatori || (isEn ? 'High Fidelity' : 'Alta Fedeltà')}
                  </p>
                  <p className="truncate text-neutral-400">
                    <strong>Moulage:</strong> {patient.moulageProtesi || 'Standard'}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400 text-[11px]">
                    {isEn ? 'Station:' : 'Presidio:'} <strong>{patient.scenarioCode.includes('TCCC') ? (isEn ? 'Tactical Environment' : 'Ambiente Tattico') : 'Shock Room'}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProtesiModal(patient);
                      }}
                      className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-[10px] font-bold uppercase rounded cursor-pointer"
                    >
                      {isEn ? 'Resources' : 'Risorse'}
                    </button>
                    <span className="text-pink-400 font-black flex items-center gap-1 text-[11px]">
                      Checklist <ChevronRight className="w-3.5 h-3.5" />
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
};
