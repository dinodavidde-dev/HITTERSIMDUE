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
  Sliders,
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
}) => {
  const { language } = useCourse();
  const isEn = language === 'en';

  // Visual layout mode: 'parallel' (affiancata 2 colonne), 'tech_only' (focus mansioni), 'public_only' (focus corso)
  const [layoutMode, setLayoutMode] = useState<'parallel' | 'tech_only' | 'public_only'>('parallel');
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
      timeWindow: 'Min 00–15',
      durationMinutes: 15,
      phaseTitle: 'Ingaggio TCCC / WS Inquadramento / Standby SR',
      description: 'Avvio scenari tattici sotto fuoco, Stop the Bleed nei 3 Ambienti Tattici. Inquadramento WS. Standby attivo Box SR.',
      techFocus: 'Presidio carrelli infusione, erogazione emorragia pulsante simulatori TCCC, test radio CH3.',
      isHandover: false,
      isReset: false,
      isActive: (currentSlot.id.includes('tccc') || currentSlot.id.includes('b1-tccc')) && slotElapsedMinutes < 15,
      isCompleted: !currentSlot.id.includes('tccc') && isTacticalBlock && (currentSlot.id.includes('handover') || currentSlot.id.includes('sr') || currentSlot.id.includes('debrief') || currentSlot.id.includes('reset')),
    },
    {
      id: 'sub-02',
      timeWindow: 'Min 15–30',
      durationMinutes: 15,
      phaseTitle: 'Stabilizzazione TCCC & Estrazione / Standby Attivo SR (T -15)',
      description: 'Wound packing e barellamento in TCCC. STANDBY ATTIVO Box Shock Room (T -15 min da Handover :30).',
      techFocus: 'STANDBY ATTIVO BOX SR: Collaudo ventilatori, monitor ECG multiparametrici, sonde e-FAST pronte per barella.',
      isHandover: false,
      isReset: false,
      isActive: (currentSlot.id.includes('tccc') || currentSlot.id.includes('b1-tccc')) && slotElapsedMinutes >= 15,
      isCompleted: isTacticalBlock && (currentSlot.id.includes('handover') || currentSlot.id.includes('sr') || currentSlot.id.includes('debrief') || currentSlot.id.includes('reset')),
    },
    {
      id: 'sub-03',
      timeWindow: 'Min 30–35 (ORE :30)',
      durationMinutes: 5,
      phaseTitle: 'TASSATIVO ORE :30 HANDOVER 1:1 BARELLATO (SBAR)',
      description: 'Trasferimento fisico barellato da TCCC a Box Shock Room con report SBAR (5 min, :30–:35). Dalle :35 ABCDE SR e Debrief TCCC Pt 1.',
      techFocus: 'CRITICO: Guida barella nei Box Shock Room, connessione monitor portatili a schermi a parete, assistenza linee vascolari.',
      isHandover: true,
      isReset: false,
      isActive: currentSlot.id.includes('handover'),
      isCompleted: isTacticalBlock && (currentSlot.id.includes('sr') || currentSlot.id.includes('debrief') || currentSlot.id.includes('reset')),
    },
    {
      id: 'sub-04',
      timeWindow: 'Min 35–60',
      durationMinutes: 25,
      phaseTitle: 'Shock Room Alta Fedeltà / Debriefing TCCC Pt 1',
      description: 'Gestione emodinamica avanzata ABCDE, eco FAST, drenaggi in Shock Room. Debriefing TCCC con FAC 1-3.',
      techFocus: 'Regia parametri vitali dinamici su simulatori HALO/SimMan, modulazione crisi emodinamica, erogazione referti.',
      isHandover: false,
      isReset: false,
      isActive: currentSlot.id.includes('sr'),
      isCompleted: isTacticalBlock && (currentSlot.id.includes('debrief') || currentSlot.id.includes('reset')),
    },
    {
      id: 'sub-05',
      timeWindow: 'Min 60–75',
      durationMinutes: 15,
      phaseTitle: 'Debriefing Clinico SR Parte 1 (Video NTS) / Ristoro TCCC',
      description: 'Revisione video collegiale con Faculty della gestione clinica e leadership NTS. Pausa idratazione per squadra TCCC.',
      techFocus: 'Playback telecamere PTZ per FAC, salvataggio telemetria, controllo carrelli farmaci e inventario.',
      isHandover: false,
      isReset: false,
      isActive: currentSlot.id.includes('debrief'),
      isCompleted: isTacticalBlock && currentSlot.id.includes('reset'),
    },
    {
      id: 'sub-06',
      timeWindow: 'Min 75–90',
      durationMinutes: 15,
      phaseTitle: 'Debriefing SR Pt 2 & Reset Tecnico Rapido 15 Min Box (Turnaround)',
      description: 'Debriefing conclusivo del blocco e RESET TASSATIVO 15 MINUTI dei 3 Box a cura dei TECH prima del blocco successivo.',
      techFocus: 'RESET RAPIDO 15 MINUTI: Sanificazione cute, rabbocco sangue sintetico, sostituzione trachee e aghi, ricarica batterie.',
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
      timeWindow: 'Fase Iniziale (Min 00–15)',
      title: 'Inizio Slot & Allineamento Staff',
      focus: 'Presidio postazioni, sincronizzazione radio CH3/CH1 e prima verifica hardware.',
      isActive: slotProgressPercent < 33,
      isCompleted: slotProgressPercent >= 33,
    },
    {
      id: 'nt-2',
      timeWindow: 'Fase Centrale (Min 15–30+)',
      title: 'Esecuzione Attività & Monitoraggio',
      focus: 'Assistenza continua, monitoraggio carichi e gestione materiali di consumo.',
      isActive: slotProgressPercent >= 33 && slotProgressPercent < 75,
      isCompleted: slotProgressPercent >= 75,
    },
    {
      id: 'nt-3',
      timeWindow: 'Fase Conclusiva (Ultimi 10 Min)',
      title: 'Pre-Allerta & Chiusura Fase',
      focus: 'Preavviso al gruppo discenti e preparazione logistica per il blocco successivo.',
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
    const isPreAllerta = fullText.includes('pre-allerta') || fullText.includes('pre-alert');
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
    let stationLocation = currentTech.assignedStations?.[0] || 'Postazione Trauma';

    if (techNum === 7 || currentTech.specialty?.toLowerCase().includes('ws1')) {
      stationLocation = 'Aula WS1 (Airway & Bleeding)';
      const match = allActs.find(
        (a) =>
          a.act?.location.includes('WS1') ||
          a.act?.title.includes('WS1') ||
          a.act?.subtitle.includes('WS1')
      );
      if (match) visitingGroup = match.group;
    } else if (techNum === 8 || currentTech.specialty?.toLowerCase().includes('ws2')) {
      stationLocation = 'Aula WS2 (Eco FAST & IO)';
      const match = allActs.find(
        (a) =>
          a.act?.location.includes('WS2') ||
          a.act?.title.includes('WS2') ||
          a.act?.subtitle.includes('WS2')
      );
      if (match) visitingGroup = match.group;
    } else if (techNum === 9 || currentTech.specialty?.toLowerCase().includes('reset')) {
      stationLocation = 'Box Shock Room 1-3 (Reset Rapido)';
      const match = allActs.find(
        (a) => a.act?.location.includes('Shock Room') || a.act?.title.toLowerCase().includes('shock room')
      );
      if (match) visitingGroup = match.group;
    } else if (techNum === 10) {
      stationLocation = 'Ambienti Tattici 1-3 (Logistica)';
      const match = allActs.find(
        (a) => a.act?.location.includes('Tattico') || a.act?.title.toLowerCase().includes('tccc')
      );
      if (match) visitingGroup = match.group;
    } else {
      if (isTccc || isPreAllerta) {
        stationLocation = `Ambiente Tattico ${postazioneNum}`;
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
      techActivityTitle = 'Briefing Tecnico, Verifica Canali Radio CH1/CH3 e Collaudo Pompe';
      techBadge = 'SETUP & COLLAUDO IMPIANTI';
      techBadgeColor = 'bg-cyan-950 text-cyan-300 border-cyan-700';
      techDuties = [
        'Ispezione serbatoi sangue artificiale (2000ml) e controllo tenuta raccordi idraulici',
        'Verifica apparati radio: canale di lavoro CH3 (Tecnici) e canale Master CH1 (Regia)',
        'Controllo dotazione barelle tattiche, lacci emostatici TQ e forbici taglia-abiti',
      ];
    } else if (
      fullText.includes('accoglienza') ||
      fullText.includes('welcome') ||
      fullText.includes('briefing')
    ) {
      techActivityTitle = 'Presidio Postazioni, Verifica Biomodelli e Standby Operativo Regia';
      techBadge = 'PRESIDIO OPERATIVO';
      techBadgeColor = 'bg-neutral-950 text-neutral-300 border-neutral-700';
      techDuties = [
        'Presidio fisso della postazione assegnata e controllo materiali monouso di scorta',
        'Check di conformità dei manichini e delle protesi con la Faculty di riferimento',
        'Standby in ascolto su radio CH3 in attesa del via libera operativo dalla Regia',
      ];
    } else if (isReset) {
      techActivityTitle = 'RESET TECNICO RAPIDO 15 MIN: Sanificazione Manichini & Reintegro Consumabili';
      techBadge = 'RESET RAPIDO (TURNAROUND)';
      techBadgeColor = 'bg-yellow-950 text-yellow-300 border-yellow-600 animate-pulse';
      techDuties = [
        'Lavaggio e spurgo circuiti di sanguinamento, riempimento sacche sangue sintetico',
        'Sostituzione inserti cricotiroidotomia, drenaggio toracico e cute chirurgica incisa',
        'Reintegro garze caolino, teli sterili e invio "LUCE VERDE POSTAZIONE" via radio CH3',
      ];
    } else if (isHandover) {
      techActivityTitle = 'Assistenza Tecnica Handover 1:1: Trasferimento Barellato TCCC ➔ Shock Room';
      techBadge = 'ASSISTENZA TRASPORTO SBAR';
      techBadgeColor = 'bg-amber-950 text-amber-300 border-amber-600';
      techDuties = [
        'Assistenza al trasbordo rapido della barella tattica dal campo al Box Shock Room',
        'Commutazione telemetria portatile sul monitor multiparametrico fisso a parete',
        'Supervisione sicurezza del manichino/attore durante il briefing SBAR (:30-:35)',
      ];
    } else if (isPreAllerta) {
      techActivityTitle = 'Pre-Allerta T-15: Innesco Pompe Sanguinamento e Standby Operativo';
      techBadge = 'PRE-ALLERTA T -15 MIN';
      techBadgeColor = 'bg-pink-950 text-pink-300 border-pink-700 animate-pulse';
      techDuties = [
        'Attivazione telecomando flussi emorragici e prova getto pulsatile a pressione',
        'Posizionamento barelle spinali e controllo scorte lacci emostatici TQ sul campo',
        'Briefing di sicurezza con l\'attore figurante e test parola d\'ordine d\'arresto',
      ];
    } else if (isStandbySR) {
      techActivityTitle = 'Standby Attivo Box Shock Room (T -15): Check Monitor, Ventilatori & Kit REBOA';
      techBadge = 'STANDBY ATTIVO BOX SR';
      techBadgeColor = 'bg-indigo-950 text-indigo-300 border-indigo-700';
      techDuties = [
        'Accensione monitor multiparametrici, test traccia ECG, NIBP e curva capnografica',
        'Verifica kit toracotomia di rianimazione, clamp aortico e introduttore REBOA 7 Fr',
        'Controllo riscaldatore liquidi e disponibilità sacche infusionali artificiali',
      ];
    } else if (isTccc) {
      techActivityTitle = 'Presidio Tecnico Ambiente Tattico: Erogazione Flussi & Assistenza Barellamento';
      techBadge = 'PRESIDIO TATTICO TCCC';
      techBadgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-700';
      techDuties = [
        'Regolazione remota emorragia massiva in funzione dell\'applicazione del tourniquet',
        'Monitoraggio wound packing giunzionale ed estrazione rapida sotto stress audio',
        'Supporto logistico continuo alla squadra discenti e al tutor FAC designato',
      ];
    } else if (isShockRoom) {
      techActivityTitle = 'Presidio Avanzato Box Shock Room: Telemetria, Supporto Toracotomia & REBOA';
      techBadge = 'PRESIDIO SHOCK ROOM ABCDE';
      techBadgeColor = 'bg-indigo-950 text-indigo-300 border-indigo-600';
      techDuties = [
        'Regolazione dinamica parametri vitali (SpO2, FC, PA) secondo copione didattico FAC',
        'Assistenza strumentale alle procedure invasive (drenaggio pleurico, REBOA, crico)',
        'Avvio contestuale della bonifica preliminare dell\'area tattica di provenienza',
      ];
    } else if (isWorkshop) {
      if (techNum === 7 || currentTech.specialty?.toLowerCase().includes('ws1')) {
        techActivityTitle = 'Presidio Skills Lab WS1: Manichini Cricotiroidotomia & Sostituzione Inserti';
        techBadge = 'SKILLS LAB WS1 (AIRWAY)';
        techBadgeColor = 'bg-purple-950 text-purple-300 border-purple-700';
        techDuties = [
          'Sostituzione rapida membrane tracheali e cute sintetica per cricotiroidotomia',
          'Rifornimento tubi endotracheali, lame bisturi, bougie e set wound packing',
          'Ricarica sangue sintetico nel formatore per emorragie giunzionali inguinali',
        ];
      } else if (techNum === 8 || currentTech.specialty?.toLowerCase().includes('ws2')) {
        techActivityTitle = 'Presidio Skills Lab WS2: Calibrazione Ecografi FAST & Simulatori Intraossei';
        techBadge = 'SKILLS LAB WS2 (ECO FAST & IO)';
        techBadgeColor = 'bg-purple-950 text-purple-300 border-purple-700';
        techDuties = [
          'Caricamento quadri ecografici patologici FAST (tamponamento, emotorace, falda peritoneale)',
          'Rifornimento gel ecografico e ripristino phantom vascolari ecoguidati',
          'Sostituzione aghi e test motori dei trapani intraossei (omerale/tibiale)',
        ];
      } else {
        techActivityTitle = 'Supporto Logistico e Gestione Scorte Skills Lab WS1 / WS2';
        techBadge = 'SUPPORTO SKILLS LAB';
        techBadgeColor = 'bg-purple-950 text-purple-300 border-purple-700';
        techDuties = [
          'Distribuzione presidi e reintegro continuo consumabili sui banchi di lavoro',
          'Monitoraggio delle tempistiche di rotazione didattica delle squadre discenti',
          'Pronto intervento tecnico su chiamata radio per anomalie sui simulatori',
        ];
      }
    } else if (isDebrief) {
      techActivityTitle = 'Regia Video Debriefing, Messa in Sicurezza Simulatori & Pulizia Dispositivi';
      techBadge = 'REGIA DEBRIEFING & SICUREZZA';
      techBadgeColor = 'bg-cyan-950 text-cyan-300 border-cyan-700';
      techDuties = [
        'Supporto tecnico alla proiezione filmati e telecamere multi-angolo per la Faculty',
        'Disattivazione temporanea pompe e messa in sicurezza dei circuiti idraulici',
        'Smaltimento appropriato dei dispositivi contaminati e sanificazione superfici',
      ];
    } else if (isPause) {
      techActivityTitle = 'Pausa Ristoro Staff Tecnico, Check Batterie & Rifornimento Magazzino';
      techBadge = 'PAUSA RISTORO & LOGISTICA';
      techBadgeColor = 'bg-neutral-950 text-neutral-400 border-neutral-800';
      techDuties = [
        'Turno di pausa e ristoro per il personale tecnico addetto alla simulazione',
        'Controllo accumulatori elettrici e ricarica stazioni radio/telemetria',
        'Mantenimento presidio canale radio CH3 attivo per comunicazioni urgenti di regia',
      ];
    } else {
      techActivityTitle = `Presidio Operativo Postazione: ${stationLocation}`;
      techBadge = 'PRESIDIO POSTAZIONE';
      techBadgeColor = 'bg-neutral-950 text-neutral-300 border-neutral-700';
      techDuties = [
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

  // Helper: extract course block details for the global stepper
  const COURSE_BLOCKS = [
    {
      id: 'block-1',
      title: 'Blocco 1',
      time: '08:45 - 10:45',
      slotIds: ['d2-prealert-1', 'd2-b1-tccc', 'd2-b1-handover', 'd2-b1-sr', 'd2-b1-debrief-sr', 'd3-prealert-1', 'd3-b1-ws', 'd3-b1-sr'],
      summary: activeDay === 2 ? 'ALPHA: TCCC ➔ SR | CHARLIE: SR | BRAVO: WS1 | DELTA: WS2' : 'BRAVO: TCCC | DELTA: SR | ALPHA: WS2 | CHARLIE: WS1',
    },
    {
      id: 'reset-1',
      title: 'Reset 15\'',
      time: '10:45 - 11:00',
      slotIds: ['d2-b1-reset', 'd3-b1-reset'],
      summary: 'Sanificazione Box SR 1-3, spurgo circuiti sangue & ricarica sacche',
      isReset: true,
    },
    {
      id: 'block-2',
      title: 'Blocco 2',
      time: '11:00 - 13:00',
      slotIds: ['d2-b2-tccc', 'd2-b2-handover', 'd2-b2-sr', 'd3-b2-tccc', 'd3-b2-handover', 'd3-b2-sr'],
      summary: activeDay === 2 ? 'DELTA: TCCC ➔ SR | BRAVO: SR | CHARLIE: WS1 | ALPHA: WS2' : 'CHARLIE: TCCC | ALPHA: SR | BRAVO: WS1 | DELTA: WS2',
    },
    {
      id: 'lunch',
      title: 'Pranzo',
      time: '13:00 - 14:00',
      slotIds: ['d2-lunch', 'd3-lunch'],
      summary: 'Pausa ristoro staff & ricarica telemetrie',
      isPause: true,
    },
    {
      id: 'block-3',
      title: 'Blocco 3',
      time: '14:00 - 16:00',
      slotIds: ['d2-b3-tccc', 'd2-b3-handover', 'd2-b3-sr', 'd3-b3-tccc', 'd3-b3-handover', 'd3-b3-sr'],
      summary: activeDay === 2 ? 'BRAVO: TCCC ➔ SR | DELTA: SR | ALPHA: WS1 | CHARLIE: WS2' : 'ALPHA: TCCC | CHARLIE: SR | DELTA: WS1 | BRAVO: WS2',
    },
    {
      id: 'reset-2',
      title: 'Reset 15\'',
      time: '16:00 - 16:15',
      slotIds: ['d2-b3-reset', 'd3-b3-reset'],
      summary: 'Turnaround rapido 15 min per il Blocco 4 finale',
      isReset: true,
    },
    {
      id: 'block-4',
      title: 'Blocco 4',
      time: '16:15 - 18:15',
      slotIds: ['d2-b4-tccc', 'd2-b4-handover', 'd2-b4-sr', 'd3-b4-tccc', 'd3-b4-handover', 'd3-b4-sr'],
      summary: activeDay === 2 ? 'CHARLIE: TCCC ➔ SR | ALPHA: SR | DELTA: WS1 | BRAVO: WS2' : 'DELTA: TCCC | BRAVO: SR | CHARLIE: WS2 | ALPHA: WS1',
    },
    {
      id: 'plenary',
      title: 'Plenaria',
      time: '18:15 - 19:00',
      slotIds: ['d2-debrief-day', 'd3-debrief-finale', 'd2-chiusura', 'd3-chiusura'],
      summary: 'Debriefing collegiale finale e revisione video',
    },
  ];

  // Helper for group badges colors and icons
  const getGroupBadgeInfo = (group: GroupType, activity: any) => {
    const actTitle = (activity?.title || '').toLowerCase();
    const actLoc = (activity?.location || '').toLowerCase();

    let bg = 'bg-neutral-800 text-neutral-200 border-neutral-700';
    let icon = <Activity className="w-3 h-3 shrink-0" />;
    let typeLabel = 'Clinica';

    if (actTitle.includes('tccc') || actLoc.includes('tattico')) {
      bg = 'bg-emerald-950 text-emerald-300 border-emerald-600';
      icon = <Flame className="w-3 h-3 text-emerald-400 shrink-0" />;
      typeLabel = 'TCCC Estrazione';
    } else if (actTitle.includes('shock') || actLoc.includes('shock') || actTitle.includes('sbar')) {
      bg = 'bg-red-950 text-red-300 border-red-600';
      icon = <HeartPulse className="w-3 h-3 text-red-400 shrink-0" />;
      typeLabel = 'Shock Room ABCDE';
    } else if (actLoc.includes('ws1') || actTitle.includes('ws1') || actTitle.includes('airway')) {
      bg = 'bg-purple-950 text-purple-300 border-purple-600';
      icon = <Stethoscope className="w-3 h-3 text-purple-400 shrink-0" />;
      typeLabel = 'WS1 Airway/Bleed';
    } else if (actLoc.includes('ws2') || actTitle.includes('ws2') || actTitle.includes('fast')) {
      bg = 'bg-cyan-950 text-cyan-300 border-cyan-600';
      icon = <Gauge className="w-3 h-3 text-cyan-400 shrink-0" />;
      typeLabel = 'WS2 Eco FAST/IO';
    } else if (actTitle.includes('briefing') || actTitle.includes('debrief')) {
      bg = 'bg-blue-950 text-blue-300 border-blue-600';
      icon = <Users className="w-3 h-3 text-blue-400 shrink-0" />;
      typeLabel = 'Debrief / Plenaria';
    } else if (actTitle.includes('pausa') || actTitle.includes('ristoro')) {
      bg = 'bg-neutral-900 text-neutral-400 border-neutral-700';
      typeLabel = 'Pausa';
    }

    return { bg, icon, typeLabel };
  };

  const isDayBefore8 = (activeDay === 2 || activeDay === 3) && slotIdxInDay === 0;
  const isMorningCountdown = (activeDay === 2 || activeDay === 3) && slotIdxInDay === 1;
  const isNightToMorningCountdown = activeDay === 2 && masterCurrentSlot?.id === 'd2-chiusura';

  const currentSlotInfo = getSlotTechActivity(currentSlot);
  const currentPatient = currentSlotInfo.relevantPatient;
  const showCountdown = currentSlotInfo.isPreAllerta || currentSlotInfo.isStandbySR || currentSlotInfo.isReset;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. BARRA DI CONTROLLO & CRONOPROGRAMMA MASTER DELLA GIORNATA (STEPPER) */}
      {/* ========================================================================= */}
      <div className="bg-neutral-950 border-2 border-neutral-800 p-3 sm:p-4 rounded-lg shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-orange-600 text-black font-black text-[10px] uppercase tracking-wider rounded">
                DOPPIO FLUSSO SINCRONIZZATO
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                Regia Day 0{activeDay} • {dayMasterSlots.length} Fasi Totali
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-400 shrink-0" />
              {isEn ? 'Public Timeline & Technical Duties' : 'Timeline Pubblica & Mansioni Tecniche'}
            </h2>
            <p className="text-xs text-neutral-300 font-mono">
              {isEn
                ? 'Progression of the 4 Macro-Groups (ALPHA, BRAVO, CHARLIE, DELTA) alongside operational tasks'
                : 'Progressione dei 4 Macro-Gruppi (ALPHA, BRAVO, CHARLIE, DELTA) affiancata ai compiti operativi'}
            </p>
          </div>

          {/* Layout Mode Selector Toggle */}
          <div className="flex items-center bg-neutral-900 border border-neutral-700 p-1 rounded self-stretch sm:self-start md:self-center shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setLayoutMode('parallel')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 rounded whitespace-nowrap ${
                layoutMode === 'parallel'
                  ? 'bg-gradient-to-r from-orange-600 to-pink-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title={isEn ? 'View both timelines side by side in 2 columns' : 'Visualizza entrambe le timeline affiancate in 2 colonne'}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isEn ? 'Side-by-Side (2 Columns)' : 'Affiancata (2 Colonne)'}</span>
              <span className="sm:hidden">{isEn ? '2 Columns' : '2 Colonne'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode('tech_only')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 rounded whitespace-nowrap ${
                layoutMode === 'tech_only'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title={isEn ? 'View technical tasks only with operational focus' : 'Visualizza solo i compiti tecnici con focus operativo'}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isEn ? 'Tasks' : 'Mansioni'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode('public_only')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 rounded whitespace-nowrap ${
                layoutMode === 'public_only'
                  ? 'bg-orange-600 text-black shadow-md font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title={isEn ? 'View extended public course timeline' : 'Visualizza la timeline del corso pubblica estesa'}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isEn ? 'Course' : 'Corso'}</span>
            </button>
          </div>
        </div>

        {/* Quadro Sinottico Cronoprogramma Macro-Blocchi (Scrubber Rapido del Corso) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono flex-wrap gap-1">
            <span className="text-neutral-400 font-bold uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-orange-400" /> {isEn ? 'Macro-Blocks Progression:' : 'Progressione Macro-Blocchi:'}
            </span>
            <span className="text-orange-400 font-bold">
              {isEn ? 'Phase:' : 'Fase:'} {effectiveCurrentIdx + 1}/{dayMasterSlots.length} ({currentSlot?.timeRange})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 font-mono text-[10px]">
            {COURSE_BLOCKS.map((block) => {
              const isBlockActive = block.slotIds.includes(currentSlot?.id);
              return (
                <div
                  key={block.id}
                  className={`p-2 rounded border transition-all ${
                    isBlockActive
                      ? 'bg-orange-950/80 border-orange-500 text-white ring-2 ring-orange-500/80 shadow-lg'
                      : block.isReset
                      ? 'bg-yellow-950/40 border-yellow-800 text-yellow-300'
                      : block.isPause
                      ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase">{block.title}</span>
                    {isBlockActive && (
                      <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping shrink-0" />
                    )}
                  </div>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">{block.time}</span>
                  <p className="text-[9px] truncate text-neutral-300 mt-1" title={block.summary}>
                    {block.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compact Tech Context Bar */}
        <div className="pt-2.5 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-pink-950 text-pink-300 border border-pink-700 font-black text-xs uppercase rounded">
              {currentTech.badgeCode}
            </span>
            <span className="text-white font-bold">{currentTech.name}</span>
            <span className="text-pink-400 text-[11px]">({currentTech.specialty})</span>
            {partnerTech && (
              <span className="text-neutral-400 text-[11px]">• Coppia: {partnerTech.name}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="text-neutral-400 text-[10px] uppercase font-bold">Presidio:</span>
            {currentTech.assignedStations?.map((st, i) => (
              <span key={i} className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-pink-300 rounded font-bold text-[10px]">
                📍 {st}
              </span>
            ))}
            <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded text-[10px]">
              Radio: CH3
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SPECIAL COUNTDOWN MODES (Accoglienza pre 08:30 / Countdown 30 min) */}
      {/* ========================================================================= */}
      {isDayBefore8 && (
        <div className="bg-neutral-900 border-2 border-orange-500/80 p-5 rounded text-center space-y-3 shadow-xl">
          <div className="flex items-center justify-center gap-2 text-orange-400 font-bold uppercase text-xs tracking-widest">
            <Clock className="w-4 h-4" /> ATTESA APERTURA CORSO ORE 08:30 • SINCRONIZZAZIONE GENERALE
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase">
            Briefing Staff Tecnico & Collaudo Linee Radio
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto font-mono">
            Discenti in arrivo. Allineamento canali radio CH3 Tecnico, CH1 Regia, verifica serbatoi sangue artificiale nei 3 Ambienti Tattici e collaudo monitor e ventilatori nei 3 Box Shock Room.
          </p>
          <div className="inline-block bg-neutral-950 px-4 py-2 border border-neutral-800 rounded text-xs font-mono text-orange-400">
            Apertura operativa del corso alle ore 08:30
          </div>
        </div>
      )}

      {isMorningCountdown && (
        <div className="bg-gradient-to-r from-orange-950/80 via-neutral-900 to-pink-950/80 border-2 border-orange-500 p-6 rounded shadow-2xl text-center space-y-4 animate-pulse">
          <div className="flex items-center justify-center gap-2 text-orange-300 font-bold uppercase text-xs tracking-widest">
            <AlertTriangle className="w-4 h-4 text-orange-400 animate-bounce" /> COUNTDOWN 30 MINUTI (08:00 - 08:30) • ALLINEAMENTO TECNICO & SQUADRE
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Presidio Immediato Postazioni & Accoglienza
          </h3>
          <p className="text-xs sm:text-sm text-neutral-200 max-w-xl mx-auto font-mono">
            Le squadre discenti si stanno raggruppando con i rispettivi Faculty. I tecnici devono presidiare la propria postazione e confermare la luce verde via radio CH3.
          </p>
          <div className="text-4xl sm:text-5xl font-mono font-black text-orange-400 tracking-wider">
            {formatCumulativeTimer(timerSeconds)}
          </div>
        </div>
      )}

      {isNightToMorningCountdown && (
        <div className="bg-neutral-900 border-2 border-orange-500/80 p-5 rounded text-center space-y-3 shadow-xl">
          <div className="flex items-center justify-center gap-2 text-orange-400 font-bold uppercase text-xs tracking-widest">
            <Clock className="w-4 h-4" /> SESSIONE DAY 02 COMPLETATA - TRANSIZIONE VERSO DAY 03
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase">
            Turnaround Notturno & Rotazione Speculare Day 03
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto font-mono">
            Tutti i blocchi del Day 02 sono conclusi. Ricarica totale batterie simulatori, reintegro scorte e configurazione speculare dei gruppi per Day 03.
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
            <span className="text-xs font-mono font-black text-pink-400 uppercase tracking-widest">
              🔴 FASE ATTUALE IN CORSO • REGIA MASTER LIVE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-neutral-950 text-pink-300 border border-pink-600 rounded text-xs font-mono font-bold">
              Fase {effectiveCurrentIdx + 1} di {dayMasterSlots.length} ({currentSlot?.timeRange})
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIQUADRO LIVE: CRONOMETRO FASE ATTUALE & TEMPI DELLE FASI INDICATE       */}
        {/* ========================================================================= */}
        <div className="bg-neutral-950 border-2 border-pink-500/80 rounded-lg p-4 sm:p-5 shadow-2xl space-y-4 font-sans">
          {/* RIGA 1: CRONOMETRO DIGITALE FASE CORRENTE CON INDICAZIONE TEMPI */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-pink-950/40 via-neutral-900 to-black p-3.5 border border-pink-500/50">
            {/* Display Digitale Tempo Rimanente e Trascorso */}
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-pink-500/20 border border-pink-500 text-pink-400 shrink-0">
                <Timer className="w-7 h-7 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black text-pink-400 uppercase tracking-widest">
                    CRONOMETRO DIGITALE FASE CORRENTE
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
                    {isTimerRunning ? 'AUTOMAZIONE ATTIVA' : 'IN PAUSA (STANDBY)'}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 flex-wrap">
                  <div
                    className={`text-3xl sm:text-4xl font-mono font-black tracking-wider ${
                      slotRemainingSeconds <= 180
                        ? 'text-red-400 animate-pulse'
                        : slotRemainingSeconds <= 600
                        ? 'text-amber-400'
                        : 'text-pink-400'
                    }`}
                  >
                    {formatTimer(slotRemainingSeconds)}
                  </div>
                  <div className="text-xs font-mono text-neutral-400">
                    <span>TEMPO TRASCORSO: </span>
                    <strong className="text-white">
                      {formatTimer(slotElapsedSeconds)}
                    </strong>{' '}
                    / <span>{slotDurationMinutes}:00 MIN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Avanzamento e Toggle Dettagli */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right font-mono">
                <div className="text-[10px] text-neutral-400 uppercase">Avanzamento Fase</div>
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
                <span>{showDetailedPhases ? 'Comprimi Tempi Fasi' : 'Espandi Tempi Fasi'}</span>
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
              <span>00:00 (Inizio)</span>
              <span>
                {currentSlotInfo.isHandover
                  ? 'CRITICO: Handover 5 Minuti Tassativo'
                  : currentSlotInfo.isReset
                  ? 'CRITICO: Reset 15 Minuti Tassativo'
                  : `Metà fase (${Math.round(slotDurationMinutes / 2)} min)`}
              </span>
              <span>{slotDurationMinutes}:00 (Termine)</span>
            </div>
          </div>

          {/* RIGA 2: CRONOPROGRAMMA RIGIDO DEI TEMPI DELLE FASI INDICATE */}
          {showDetailedPhases && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 text-xs font-mono">
                <span className="text-yellow-400 font-bold uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-yellow-500" />
                  TEMPI DELLE FASI INDICATE • {isTacticalBlock ? `BLOCCO FORMATIVO 0${currentBlockNumber} (90 MINUTI)` : currentSlot.title}
                </span>
                <span className="text-neutral-400 text-[11px]">
                  {isTacticalBlock
                    ? 'Scansione rigida in slot da 15 min (TCCC ➔ Handover :30 ➔ Shock Room ➔ Debrief ➔ Reset)'
                    : 'Punti di controllo e compiti temporali dello slot'}
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
                              IN CORSO ORA
                            </span>
                          ) : phase.isCompleted ? (
                            <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono text-[9px] font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              COMPLETATA
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-[9px]">
                              IN ATTESA
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
                              🔧 Mansione Tecnici:
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
                            LIVE ORA
                          </span>
                        ) : cp.isCompleted ? (
                          <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> FATTO
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-neutral-500">ATTESA</span>
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

        {/* LIVE CARD DUAL-STREAM CONTAINER */}
        <div
          className={`grid gap-4 ${
            layoutMode === 'parallel'
              ? 'grid-cols-1 lg:grid-cols-12'
              : 'grid-cols-1'
          }`}
        >
          {/* ------------------------------------------------------------- */}
          {/* COLONNA A: TIMELINE PUBBLICA SEMPLIFICATA (QUADRO DEL CORSO) */}
          {/* ------------------------------------------------------------- */}
          {(layoutMode === 'parallel' || layoutMode === 'public_only') && (
            <div
              className={`${
                layoutMode === 'parallel' ? 'lg:col-span-6' : 'w-full'
              } bg-neutral-950 border-2 border-orange-500/80 rounded-lg p-5 shadow-2xl space-y-4 relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 bg-orange-600 text-black font-mono font-black text-[10px] px-3 py-1 uppercase rounded-bl tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3" /> QUADRO PUBBLICO CORSO
              </div>

              {/* Titolo e Orario Fase Master */}
              <div className="space-y-1 pr-32">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-orange-950 text-orange-300 border border-orange-700 text-[10px] font-black uppercase rounded">
                    ORARIO: {currentSlot?.timeRange} ({currentSlot?.durationMinutes} MIN)
                  </span>
                  {currentSlotInfo.isHandover && (
                    <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-600 text-[10px] font-black uppercase rounded animate-pulse">
                      🚑 HANDOVER :30
                    </span>
                  )}
                  {currentSlotInfo.isReset && (
                    <span className="px-2 py-0.5 bg-yellow-950 text-yellow-300 border border-yellow-600 text-[10px] font-black uppercase rounded animate-pulse">
                      🔧 RESET 15'
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  {currentSlot?.title || 'Attività Clinica in Corso'}
                </h3>
                <p className="text-xs text-neutral-300 font-mono">
                  {currentSlot?.description || 'Rotazione didattica delle 12 squadre sui 4 macro-ambienti addestrativi'}
                </p>
              </div>

              {/* Distribuzione dei 4 Macro-Gruppi nel corso */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <span className="text-[10px] font-mono text-orange-400 uppercase font-bold tracking-widest block flex items-center justify-between">
                  <span>Posizione & Attività dei 4 Macro-Gruppi (60 Discenti):</span>
                  <span className="text-[9px] text-neutral-500">15 allievi / 3 squadre per gruppo</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                  {(['A', 'B', 'C', 'D'] as GroupType[]).map((grp) => {
                    const act = currentSlot?.groupActivities?.[grp];
                    const badgeInfo = getGroupBadgeInfo(grp, act);
                    const isVisitingTechStation = currentSlotInfo.visitingGroup === grp;

                    const groupLabels: Record<GroupType, string> = {
                      A: 'ALPHA (DISC-01-15)',
                      B: 'BRAVO (DISC-16-30)',
                      C: 'CHARLIE (DISC-31-45)',
                      D: 'DELTA (DISC-46-60)',
                    };

                    return (
                      <div
                        key={grp}
                        className={`p-3 rounded border transition-all ${badgeInfo.bg} ${
                          isVisitingTechStation ? 'ring-2 ring-pink-400 shadow-md' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-current/20">
                          <span className="font-black text-xs uppercase flex items-center gap-1.5">
                            {badgeInfo.icon}
                            Gruppo {groupLabels[grp]}
                          </span>
                          {isVisitingTechStation && (
                            <span className="px-1.5 py-0.5 bg-pink-600 text-white font-black text-[9px] uppercase rounded animate-pulse">
                              In Tua Postazione
                            </span>
                          )}
                        </div>
                        <div className="pt-1.5 space-y-0.5">
                          <p className="font-bold text-white text-xs truncate">
                            {act?.title || 'Attività Formativa'}
                          </p>
                          <p className="text-[11px] text-neutral-300 truncate">
                            {act?.subtitle || badgeInfo.typeLabel}
                          </p>
                          <p className="text-[10px] text-neutral-400 flex items-center gap-1 pt-0.5">
                            <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                            <span className="truncate">{act?.location || 'Sede da definire'}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nota Tattica per il Corso */}
              <div className="bg-neutral-900/90 p-3 rounded border border-neutral-800 text-xs font-mono text-neutral-300 space-y-1">
                <span className="text-[10px] text-orange-300 uppercase font-black tracking-wider block">
                  💡 Allineamento Orario Regia & Scadenze Tassative:
                </span>
                <p className="text-[11px] text-neutral-300">
                  {currentSlotInfo.isHandover
                    ? 'TASSATIVO AL MINUTO :30: Travaso barellato da Ambiente Tattico a Box Shock Room con report SBAR (max 5 min).'
                    : currentSlotInfo.isPreAllerta
                    ? 'T -15 MINUTI: Le squadre Shock Room entrano in standby attivo nei Box; squadre TCCC allestiscono estrazione barellata.'
                    : currentSlotInfo.isReset
                    ? 'FINE BLOCCO (MIN 75-90): Turnaround rapido 15 minuti. Tutti i box devono ricevere LUCE VERDE entro la ripartenza.'
                    : 'Le 4 stazioni lavorano in parallelo continuo per 90 minuti secondo la rotazione clinica speculare.'}
                </p>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* COLONNA B: TIMELINE MANSIONI TECNICHE (FOCUS OPERATIVO TECH) */}
          {/* ------------------------------------------------------------- */}
          {(layoutMode === 'parallel' || layoutMode === 'tech_only') && (
            <div
              className={`${
                layoutMode === 'parallel' ? 'lg:col-span-6' : 'w-full'
              } bg-neutral-950 border-2 border-pink-500 rounded-lg p-5 shadow-2xl space-y-4 relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 bg-pink-600 text-white font-mono font-black text-[10px] px-3 py-1 uppercase rounded-bl tracking-wider flex items-center gap-1">
                <Wrench className="w-3 h-3" /> {currentTech.badgeCode} ({currentTech.name.split(' ')[0]})
              </div>

              {/* Titolo e Mansione Principale del Tecnico */}
              <div className="space-y-1 pr-32">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded border ${currentSlotInfo.techBadgeColor || 'bg-pink-950 text-pink-300 border-pink-700'}`}>
                    {currentSlotInfo.techBadge}
                  </span>
                  <span className="text-xs font-mono text-pink-400 font-bold">
                    📍 {currentSlotInfo.stationLocation}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  {currentSlotInfo.techActivityTitle}
                </h3>
              </div>

              {/* Countdown Banner se in Pre-Allerta, Standby o Reset */}
              {showCountdown && (
                <div className="bg-yellow-950/90 border-2 border-yellow-500 p-3.5 rounded shadow-lg flex items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 animate-bounce" />
                    <div>
                      <span className="text-[10px] font-mono font-bold text-yellow-300 uppercase tracking-widest block">
                        {currentSlotInfo.isPreAllerta
                          ? 'COUNTDOWN PRE-ALLERTA T -15 MIN'
                          : currentSlotInfo.isStandbySR
                          ? 'STANDBY ATTIVO BOX SHOCK ROOM'
                          : 'TURNAROUND RESET TECNICO 15 MIN'}
                      </span>
                      <p className="text-[11px] text-yellow-100">
                        {currentSlotInfo.isReset
                          ? 'Sanificazione manichini e ricarica sangue prima del blocco successivo.'
                          : 'Verifica circuiti idraulici e pompe pulsanti su radio CH3.'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-neutral-950 px-3 py-1.5 border border-yellow-500 rounded text-right shrink-0">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase block">Tempo Rimasto</span>
                    <span className="text-xl font-mono font-black text-yellow-400">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                </div>
              )}

              {/* Postazione, Scenario & Biomodello Assegnato */}
              <div className="bg-neutral-900/90 p-3.5 border border-neutral-800 rounded space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
                  <span className="text-[10px] text-pink-400 uppercase font-black tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Postazione: {currentSlotInfo.stationLocation}
                  </span>
                  {currentSlotInfo.visitingGroup && (
                    <span className="px-2 py-0.5 bg-pink-950 text-pink-300 border border-pink-700 font-black text-[10px] rounded">
                      Discenti attesi: GRUPPO {currentSlotInfo.visitingGroup}
                    </span>
                  )}
                </div>

                {currentPatient ? (
                  <div className="space-y-1">
                    <p className="text-white font-bold text-sm">
                      <span className="text-pink-300">{currentPatient.scenarioCode}</span>: {currentPatient.title}
                    </p>
                    <p className="text-neutral-300 text-[11px]">
                      <strong>Simulatore:</strong> {currentPatient.simulatori || 'Alta Fedeltà'} • <strong>Moulage:</strong> {currentPatient.moulageProtesi || 'Standard'}
                    </p>
                    {currentPatient.lesioni && currentPatient.lesioni.length > 0 && (
                      <p className="text-neutral-400 text-[10px] truncate">
                        <strong>Lesioni:</strong> {currentPatient.lesioni.join('; ')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-neutral-400 text-xs">
                    Supervisione tecnica di sala, riserva presidi consumabili e coordinamento radio CH3.
                  </p>
                )}
              </div>

              {/* Mansioni Operative Dettagliate dello Slot */}
              <div className="space-y-1.5 font-mono text-xs">
                <span className="text-[10px] text-pink-400 uppercase font-black tracking-widest block flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-pink-400" />
                  I Tuoi Compiti Tecnici per questa Fase:
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

              {/* Bottoni di Azione Operativa Rapida */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-pink-500/30 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {currentPatient && (
                    <button
                      type="button"
                      onClick={() => onOpenProtesiModal(currentPatient)}
                      className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 font-bold text-xs uppercase rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <ClipboardList className="w-3.5 h-3.5" /> Risorse
                    </button>
                  )}
                  {currentPatient && (
                    <button
                      type="button"
                      onClick={() => onOpenChecklist(currentPatient)}
                      className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Checklist Scenario
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onSwitchToRegistro}
                    className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold text-xs uppercase rounded cursor-pointer"
                  >
                    Registro Risorse
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onSendRadioMessage(
                      `[DISPACCIO CH3] Postazione ${currentSlotInfo.stationLocation} pronta e presidiata per Fase ${effectiveCurrentIdx + 1} (${currentPatient?.scenarioCode || 'OK'}).`
                    )
                  }
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold text-xs uppercase rounded transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 text-pink-400" /> Trasmetti OK CH3
                </button>
              </div>
            </div>
          )}
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
                Prossime Fasi in Programma ({futureSlots.length} Fasi Rimanenti)
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                La timeline del corso e le tue mansioni tecniche scorrono in parallelo fino a fine giornata
              </p>
            </div>
            <span className="text-[11px] font-mono text-neutral-400 self-start sm:self-center">
              Fasi da completare: {effectiveCurrentIdx + 2} - {dayMasterSlots.length}
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

                  {/* Dual stream split for each future slot */}
                  <div className={`grid gap-3 pt-3 ${layoutMode === 'parallel' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
                    {/* Public Course Side */}
                    {(layoutMode === 'parallel' || layoutMode === 'public_only') && (
                      <div
                        className={`${
                          layoutMode === 'parallel' ? 'lg:col-span-6' : 'w-full'
                        } bg-neutral-950/80 p-3 rounded border border-neutral-800/90 space-y-2 font-mono text-xs`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Quadro Corso (4 Gruppi):
                          </span>
                          {slot.description && (
                            <span className="text-[10px] text-neutral-400 truncate max-w-[200px]">
                              {slot.description}
                            </span>
                          )}
                        </div>

                        {/* 4 Groups Mini Grid */}
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          {(['A', 'B', 'C', 'D'] as GroupType[]).map((grp) => {
                            const act = slot.groupActivities?.[grp];
                            const badge = getGroupBadgeInfo(grp, act);
                            const isHere = slotInfo.visitingGroup === grp;

                            return (
                              <div
                                key={grp}
                                className={`p-1.5 rounded border flex items-center justify-between gap-1 truncate ${badge.bg} ${
                                  isHere ? 'ring-1 ring-pink-400' : ''
                                }`}
                              >
                                <span className="font-bold shrink-0">G.{grp}:</span>
                                <span className="truncate text-white" title={`${act?.title} (${act?.location})`}>
                                  {act?.location || act?.title || 'Clinica'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tech Duties Side */}
                    {(layoutMode === 'parallel' || layoutMode === 'tech_only') && (
                      <div
                        className={`${
                          layoutMode === 'parallel' ? 'lg:col-span-6' : 'w-full'
                        } bg-neutral-950/80 p-3 rounded border border-pink-900/40 space-y-2 font-mono text-xs`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Wrench className="w-3 h-3" /> Mansione Tecnica & Postazione:
                          </span>
                          <span className="text-[11px] text-pink-300 font-bold">
                            📍 {slotInfo.stationLocation}
                          </span>
                        </div>

                        <p className="text-white font-bold text-xs truncate">
                          {slotInfo.techActivityTitle}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-neutral-300 pt-1 border-t border-neutral-800/80">
                          <span className="truncate max-w-[250px] text-neutral-400">
                            {slotPatient ? `Sim: ${slotPatient.simulatori || 'Alta Fedeltà'}` : 'Supporto logistico'}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {slotPatient && (
                              <button
                                type="button"
                                onClick={() => onOpenProtesiModal(slotPatient)}
                                className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[10px] font-bold uppercase rounded cursor-pointer"
                              >
                                Risorse
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
                    )}
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
                Archivio Fasi Concluse Oggi ({pastSlots.length} Fasi)
              </span>
              <span className="text-[11px] text-neutral-500">
                - {showCompletedArchive ? 'Clicca per comprimere' : 'Nascoste di default (clicca per visualizzare)'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-orange-400 text-xs font-bold">
              {showCompletedArchive ? (
                <>Nascondi <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Mostra <ChevronDown className="w-4 h-4" /></>
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
                            Completata
                          </span>
                          <span className="text-neutral-400 text-[10px]">
                            Fase {originalIdx + 1}: {slot.title}
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
            <Activity className="w-4 h-4 text-pink-400" /> Scenari Clinici in Carico a {currentTech.badgeCode} ({assignedPatients.length} Pazienti)
          </h3>
          <span className="text-xs font-mono text-neutral-400">
            Day 0{activeDay} • Postazioni assegnate: {currentTech.assignedStations?.join(', ') || 'TCCC & SR'}
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
                      ⚠️ In Gestione
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pr-24">
                  <span className="px-2 py-0.5 bg-neutral-950 text-pink-300 border border-pink-700 font-black text-xs">
                    {patient.scenarioCode}
                  </span>
                  <span className="text-neutral-400 text-xs font-bold">
                    Paziente #{patient.id}
                  </span>
                </div>

                <h4 className="text-white font-black text-sm uppercase group-hover:text-pink-400 transition-colors truncate">
                  {patient.title || 'Scenario di Trauma'}
                </h4>

                <div className="text-xs text-neutral-300 font-mono space-y-0.5">
                  <p className="truncate">
                    <strong>Simulatore:</strong> {patient.simulatori || 'Alta Fedeltà'}
                  </p>
                  <p className="truncate text-neutral-400">
                    <strong>Moulage:</strong> {patient.moulageProtesi || 'Standard'}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400 text-[11px]">
                    Presidio: <strong>{patient.scenarioCode.includes('TCCC') ? 'Ambiente Tattico' : 'Shock Room'}</strong>
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
                      Risorse
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
