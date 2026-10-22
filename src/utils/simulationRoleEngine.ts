import { CourseDay, GroupType, TimelineSlot, CourseMessage, TeamEvaluation, SimulatorPatient } from '../types';

export type SubPhaseType =
  | 'INGAGGIO_BRIEFING'
  | 'STABILIZZAZIONE_STANDBY'
  | 'HANDOVER_SBAR'
  | 'ABCDE_DEBRIEF1'
  | 'HIGH_FIDELITY_INTENSIVE'
  | 'DEBRIEF_CLINICO_VIDEO'
  | 'RESET_TURNAROUND'
  | 'SETUP_STANDBY';

export interface ParallelGroupTrackInfo {
  groupId: GroupType;
  groupName: string;
  matricoleRange: string;
  teams: number[];
  currentStation: 'TCCC' | 'SHOCK_ROOM' | 'SKILLS_WS1' | 'SKILLS_WS2' | 'SETUP' | 'PAUSA';
  stationLabel: string;
  location: string;
  activityTitle: string;
  facultyAssigned: string[];
  techAssigned: string[];
  subPhase: SubPhaseType;
  subPhaseLabel: string;
  subPhaseDescription: string;
  isHandoverActive: boolean;
  handoverPartnerGroup?: GroupType;
  handoverPartnerStation?: string;
  progressPercent: number;
}

export interface SimulationRoleState {
  simulatedTimeLabel: string;
  blockNumber: number;
  subPhase: SubPhaseType;
  subPhaseTitle: string;
  isHandoverActive: boolean;
  handoverRemainingSeconds: number;
  tracks: Record<GroupType, ParallelGroupTrackInfo>;
  simulatedMessages: CourseMessage[];
  simulatedEvaluations: TeamEvaluation[];
  simulatedTechAlerts: {
    stationId: string;
    stationName: string;
    status: 'ready' | 'standby' | 'resetting' | 'handover';
    techCode: string;
    actionLabel: string;
    timestamp: string;
  }[];
}

// Macro-Gruppi e Matricole da Regolamento Didattico HITTER 70 (70 discenti, 10x6 + 2x5)
export const GROUP_CONFIGS: Record<GroupType, { name: string; matricole: string; teams: number[] }> = {
  A: { name: 'ALPHA', matricole: 'DISC-01 – DISC-18', teams: [1, 2, 3] },
  B: { name: 'BRAVO', matricole: 'DISC-19 – DISC-36', teams: [4, 5, 6] },
  C: { name: 'CHARLIE', matricole: 'DISC-37 – DISC-54', teams: [7, 8, 9] },
  D: { name: 'DELTA', matricole: 'DISC-55 – DISC-70', teams: [10, 11, 12] },
};

// Rotazione Clinica Speculare (Day 1 vs Day 2)
// Day 1 (24 Ottobre 2026):
// ALPHA:   Blocco 1 TCCC        -> Blocco 2 WS2        -> Blocco 3 WS1        -> Blocco 4 Shock Room
// BRAVO:   Blocco 1 WS1         -> Blocco 2 Shock Room -> Blocco 3 TCCC       -> Blocco 4 WS2
// CHARLIE: Blocco 1 Shock Room  -> Blocco 2 WS1        -> Blocco 3 WS2        -> Blocco 4 TCCC
// DELTA:   Blocco 1 WS2         -> Blocco 2 TCCC       -> Blocco 3 Shock Room -> Blocco 4 WS1
// Day 2 (25 Ottobre 2026 - Speculare):
// ALPHA:   Blocco 1 WS2         -> Blocco 2 Shock Room -> Blocco 3 TCCC       -> Blocco 4 WS1
// BRAVO:   Blocco 1 TCCC        -> Blocco 2 WS1        -> Blocco 3 WS2        -> Blocco 4 Shock Room
// CHARLIE: Blocco 1 WS1         -> Blocco 2 TCCC       -> Blocco 3 Shock Room -> Blocco 4 WS2
// DELTA:   Blocco 1 Shock Room  -> Blocco 2 WS2        -> Blocco 3 WS1        -> Blocco 4 TCCC
export function getStationForGroup(group: GroupType, blockNumber: number, day: CourseDay): 'TCCC' | 'SHOCK_ROOM' | 'SKILLS_WS1' | 'SKILLS_WS2' {
  if (day === 1) {
    if (group === 'A') {
      if (blockNumber === 1) return 'TCCC';
      if (blockNumber === 2) return 'SKILLS_WS2';
      if (blockNumber === 3) return 'SKILLS_WS1';
      return 'SHOCK_ROOM';
    }
    if (group === 'B') {
      if (blockNumber === 1) return 'SKILLS_WS1';
      if (blockNumber === 2) return 'SHOCK_ROOM';
      if (blockNumber === 3) return 'TCCC';
      return 'SKILLS_WS2';
    }
    if (group === 'C') {
      if (blockNumber === 1) return 'SHOCK_ROOM';
      if (blockNumber === 2) return 'SKILLS_WS1';
      if (blockNumber === 3) return 'SKILLS_WS2';
      return 'TCCC';
    }
    // group D
    if (blockNumber === 1) return 'SKILLS_WS2';
    if (blockNumber === 2) return 'TCCC';
    if (blockNumber === 3) return 'SHOCK_ROOM';
    return 'SKILLS_WS1';
  } else {
    // Day 2 Speculare (25 Ottobre 2026)
    if (group === 'A') {
      if (blockNumber === 1) return 'SKILLS_WS2';
      if (blockNumber === 2) return 'SHOCK_ROOM';
      if (blockNumber === 3) return 'TCCC';
      return 'SKILLS_WS1';
    }
    if (group === 'B') {
      if (blockNumber === 1) return 'TCCC';
      if (blockNumber === 2) return 'SKILLS_WS1';
      if (blockNumber === 3) return 'SKILLS_WS2';
      return 'SHOCK_ROOM';
    }
    if (group === 'C') {
      if (blockNumber === 1) return 'SKILLS_WS1';
      if (blockNumber === 2) return 'TCCC';
      if (blockNumber === 3) return 'SHOCK_ROOM';
      return 'SKILLS_WS2';
    }
    // group D
    if (blockNumber === 1) return 'SHOCK_ROOM';
    if (blockNumber === 2) return 'SKILLS_WS2';
    if (blockNumber === 3) return 'SKILLS_WS1';
    return 'TCCC';
  }
}

/**
 * Calcola il blocco (1, 2, 3, 4) in base allo slot o ai minuti di inizio.
 */
export function getBlockNumberFromSlot(slot: TimelineSlot): number {
  const slotId = slot.id.toLowerCase();
  if (slotId.includes('b1')) return 1;
  if (slotId.includes('b2')) return 2;
  if (slotId.includes('b3')) return 3;
  if (slotId.includes('b4')) return 4;
  if (slot.startMinutes < 540) return 1; // pre-start / welcome
  if (slot.startMinutes < 635) return 1; // 09:00 - 10:35
  if (slot.startMinutes < 765) return 2; // 11:05 - 12:45
  if (slot.startMinutes < 930) return 3; // 14:00 - 15:30
  return 4; // 15:55 - 17:35
}

/**
 * Calcola la sub-fase da 15 minuti all'interno del blocco clinico da 90 minuti:
 * Min 00–15: Ingaggio TCCC / Inquadramento WS / Briefing e Standby Shock Room
 * Min 15–30: Stabilizzazione ed estrazione / Pratica WS / Standby Attivo Shock Room nei Box (T -15)
 * Min 30–45: ORE :30 HANDOVER 1:1 barellato SBAR (5 min :30-:35) | ABCDE Shock Room / Debriefing TCCC Pt 1
 * Min 45–60: Shock Room ad alta fedeltà / Pratica intensiva WS / Debriefing TCCC Pt 2
 * Min 60–75: Debriefing Clinico Shock Room (video) / Pausa e ristoro TCCC
 * Min 75–90: Debriefing Shock Room Pt 2 & Reset Tecnico rapido dei 3 Box a cura dei TECH (Turnaround 15m)
 */
export function getSubPhaseFromSlotProgress(slot: TimelineSlot, timerSeconds: number): {
  subPhase: SubPhaseType;
  subPhaseLabel: string;
  subPhaseDescription: string;
  isHandoverActive: boolean;
  handoverRemainingSeconds: number;
} {
  const slotId = slot.id.toLowerCase();

  // Se è uno slot speciale esplicito (es. Handover dedicato o Reset)
  if (slotId.includes('handover')) {
    return {
      subPhase: 'HANDOVER_SBAR',
      subPhaseLabel: 'HANDOVER 1:1 BARELLATO (SBAR)',
      subPhaseDescription: 'Tassativo ore :30 con report strutturato SBAR (< 5 min) tra TCCC e Shock Room Box.',
      isHandoverActive: true,
      handoverRemainingSeconds: timerSeconds,
    };
  }

  if (slotId.includes('reset')) {
    return {
      subPhase: 'RESET_TURNAROUND',
      subPhaseLabel: 'RESET TECNICO & TURNAROUND 15m',
      subPhaseDescription: 'Presidio TECH-01–12: ripristino simulatori, reintegro sangue e sanificazione 3 Box.',
      isHandoverActive: false,
      handoverRemainingSeconds: 0,
    };
  }

  if (slotId.includes('debrief')) {
    return {
      subPhase: 'DEBRIEF_CLINICO_VIDEO',
      subPhaseLabel: 'DEBRIEFING CLINICO COLLEGIALE',
      subPhaseDescription: 'Revisione video NTS, analisi collegiale con i Faculty Tutor e Plus/Delta.',
      isHandoverActive: false,
      handoverRemainingSeconds: 0,
    };
  }

  if (slotId.includes('welcome') || slotId.includes('setup')) {
    return {
      subPhase: 'SETUP_STANDBY',
      subPhaseLabel: 'APERTURA GATE & PATTO D\'AULA',
      subPhaseDescription: 'Accoglienza allievi DISC-01 – DISC-70, convocazione squadre e verifica postazioni.',
      isHandoverActive: false,
      handoverRemainingSeconds: 0,
    };
  }

  // Calcolo matematico sui minuti del blocco
  const totalSlotSecs = Math.max(60, slot.durationMinutes * 60);
  const elapsedSecs = Math.max(0, totalSlotSecs - timerSeconds);
  const elapsedMinutesInSlot = elapsedSecs / 60;

  if (elapsedMinutesInSlot < 15) {
    return {
      subPhase: 'INGAGGIO_BRIEFING',
      subPhaseLabel: '00–15 min: INGAGGIO TCCC & BRIEFING SR',
      subPhaseDescription: 'Ingaggio TCCC under fire nei 3 Ambienti Tattici / Briefing e Standby Box Shock Room.',
      isHandoverActive: false,
      handoverRemainingSeconds: 0,
    };
  }

  if (elapsedMinutesInSlot < 30) {
    return {
      subPhase: 'STABILIZZAZIONE_STANDBY',
      subPhaseLabel: '15–30 min: STABILIZZAZIONE TCCC & STANDBY SR (T-15)',
      subPhaseDescription: 'Estrazione barellata TCCC / Standby Attivo nei Box Shock Room a T -15 min dall\'Handover.',
      isHandoverActive: false,
      handoverRemainingSeconds: 0,
    };
  }

  if (elapsedMinutesInSlot < 35) {
    const handoverRem = Math.max(0, Math.floor((35 - elapsedMinutesInSlot) * 60));
    return {
      subPhase: 'HANDOVER_SBAR',
      subPhaseLabel: '30–35 min: ORE :30 HANDOVER 1:1 SBAR',
      subPhaseDescription: 'Consegna barellata tassativa al minuto :30 (5 min) da Ambiente Tattico a Box Shock Room.',
      isHandoverActive: true,
      handoverRemainingSeconds: handoverRem,
    };
  }

  if (elapsedMinutesInSlot < 45) {
    return {
      subPhase: 'ABCDE_DEBRIEF1',
      subPhaseLabel: '35–45 min: ABCDE SHOCK ROOM & DEBRIEF TCCC PT 1',
      subPhaseDescription: 'Gestione avanzata ABCDE nel Box SR e avvio Debriefing TCCC Parte 1 con FAC.',
      isHandoverActive: false,
      handoverRemainingSeconds: 0,
    };
  }

  if (elapsedMinutesInSlot < 60) {
    return {
      subPhase: 'HIGH_FIDELITY_INTENSIVE',
      subPhaseLabel: '45–60 min: SHOCK ROOM ALTA FEDELTÀ & DEBRIEF TCCC PT 2',
      subPhaseDescription: 'Scenario Shock Room ad alta fedeltà e Debriefing TCCC Parte 2.',
      isHandoverActive: false,
      handoverRemainingSeconds: 0,
    };
  }

  if (elapsedMinutesInSlot < 75) {
    return {
      subPhase: 'DEBRIEF_CLINICO_VIDEO',
      subPhaseLabel: '60–75 min: DEBRIEFING CLINICO VIDEO SR',
      subPhaseDescription: 'Revisione video NTS Shock Room / Pausa e ristoro per squadra uscita dal TCCC.',
      isHandoverActive: false,
      handoverRemainingSeconds: 0,
    };
  }

  return {
    subPhase: 'RESET_TURNAROUND',
    subPhaseLabel: '75–90 min: TURNAROUND RESET TECNICO BOX SR',
    subPhaseDescription: 'Reset rapido 15 min a cura dei TECH: sanificazione 3 Box e ricarica simulatori.',
    isHandoverActive: false,
    handoverRemainingSeconds: 0,
  };
}

/**
 * Genera lo stato completo della simulazione multi-ruolo sincronizzato con le 4 timeline.
 */
export function buildSimulatedRoleState(
  slot: TimelineSlot,
  timerSeconds: number,
  activeDay: CourseDay
): SimulationRoleState {
  const blockNumber = getBlockNumberFromSlot(slot);
  const subPhaseInfo = getSubPhaseFromSlotProgress(slot, timerSeconds);

  // Calcola il tempo di orologio simulato esatto
  const totalSlotSecs = Math.max(60, slot.durationMinutes * 60);
  const elapsedSecs = Math.max(0, totalSlotSecs - timerSeconds);
  const simulatedTotalMinutes = slot.startMinutes + Math.floor(elapsedSecs / 60);
  const simulatedSecsRemainder = Math.floor(elapsedSecs % 60);
  const h = Math.floor(simulatedTotalMinutes / 60);
  const m = simulatedTotalMinutes % 60;
  const simulatedTimeLabel = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(simulatedSecsRemainder).padStart(2, '0')}`;

  const groups: GroupType[] = ['A', 'B', 'C', 'D'];
  const tracks: Record<GroupType, ParallelGroupTrackInfo> = {} as any;

  // Calcolo delle 4 tracce parallele
  groups.forEach((g) => {
    const config = GROUP_CONFIGS[g];
    const station = getStationForGroup(g, blockNumber, activeDay);

    let stationLabel = '';
    let location = '';
    let activityTitle = '';
    let facultyAssigned: string[] = [];
    let techAssigned: string[] = [];
    let partnerGroup: GroupType | undefined;
    let partnerStation: string | undefined;

    const isWorkshopStation = station === 'SKILLS_WS1' || station === 'SKILLS_WS2';

    if (station === 'TCCC') {
      stationLabel = 'Ambiente Tattico 1–3 (TCCC)';
      location = 'Settore Alpha / Campi Tattici';
      activityTitle = 'Gestione Ferito Under Fire & Stop the Bleed';
      facultyAssigned = ['FAC-01', 'FAC-02', 'FAC-03'];
      techAssigned = ['TECH-01', 'TECH-02', 'TECH-03'];
      // Il partner per l'Handover barellato è il gruppo assegnato alla Shock Room
      partnerGroup = groups.find((og) => getStationForGroup(og, blockNumber, activeDay) === 'SHOCK_ROOM');
      partnerStation = 'Box Shock Room 1–3';
    } else if (station === 'SHOCK_ROOM') {
      stationLabel = 'Ospedale da Campo (Box SR 1–3)';
      location = 'Box Shock Room 1, 2, 3';
      activityTitle = 'Approccio ABCDE & Supporto Emodinamico';
      facultyAssigned = ['FAC-07', 'FAC-08', 'FAC-09'];
      techAssigned = ['TECH-07', 'TECH-08', 'TECH-09'];
      // Riceve l'Handover dal gruppo in TCCC
      partnerGroup = groups.find((og) => getStationForGroup(og, blockNumber, activeDay) === 'TCCC');
      partnerStation = 'Ambienti Tattici 1–3';
    } else if (station === 'SKILLS_WS1') {
      stationLabel = 'Skill Workshop 1 (WS1)';
      location = 'Aula Addestrativa WS1';
      activityTitle = 'Vie Aeree, Cricotiroidotomia & Tourniquet';
      facultyAssigned = ['FAC-04', 'FAC-05', 'FAC-06'];
      techAssigned = ['TECH-04', 'TECH-05', 'TECH-06'];
    } else {
      stationLabel = 'Skill Workshop 2 (WS2)';
      location = 'Aula Addestrativa WS2';
      activityTitle = 'Ecografia Clinica FAST & Accessi Vascolari IO';
      facultyAssigned = ['FAC-10', 'FAC-11', 'FAC-12'];
      techAssigned = ['TECH-10', 'TECH-11', 'TECH-12'];
    }

    const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSecs / totalSlotSecs) * 100)));

    tracks[g] = {
      groupId: g,
      groupName: config.name,
      matricoleRange: config.matricole,
      teams: config.teams,
      currentStation: station,
      stationLabel,
      location,
      activityTitle,
      facultyAssigned,
      techAssigned,
      subPhase: isWorkshopStation ? 'SETUP_STANDBY' : subPhaseInfo.subPhase,
      subPhaseLabel: isWorkshopStation ? 'SESSIONE CONTINUA A TEMPO UNICO (90m)' : subPhaseInfo.subPhaseLabel,
      subPhaseDescription: isWorkshopStation
        ? 'Addestramento pratico continuativo alle stazioni senza suddivisione in fasi operative.'
        : subPhaseInfo.subPhaseDescription,
      isHandoverActive: isWorkshopStation ? false : subPhaseInfo.isHandoverActive,
      handoverPartnerGroup: partnerGroup,
      handoverPartnerStation: partnerStation,
      progressPercent,
    };
  });

  // Messaggi di Radio / Dispacci Regia e Direzione simulati
  const simulatedMessages: CourseMessage[] = [
    {
      id: `sim-msg-${slot.id}-0`,
      timestamp: simulatedTimeLabel,
      senderId: 'REGIA-CH1',
      senderName: 'Regia Master (CH1)',
      senderRole: 'regia',
      senderStation: 'Regia Centrale',
      type: subPhaseInfo.isHandoverActive ? 'emergency' : 'info',
      subject: subPhaseInfo.isHandoverActive
        ? '🔴 TASSATIVO :30 - AVVIO HANDOVER 1:1 BARELLATO (SBAR)'
        : `Sincronizzazione Blocco ${blockNumber} [${subPhaseInfo.subPhaseLabel}]`,
      content: subPhaseInfo.isHandoverActive
        ? 'Tutte le 3 Squadre in TCCC procedono alla consegna barellata verso i rispettivi Box Shock Room 1, 2 e 3. Report verbale SBAR massimo 5 minuti.'
        : `Rotazione clinica sincrona: Gruppo ALPHA in ${tracks.A.stationLabel}, BRAVO in ${tracks.B.stationLabel}, CHARLIE in ${tracks.C.stationLabel}, DELTA in ${tracks.D.stationLabel}.`,
      status: 'pending',
    },
    {
      id: `sim-msg-${slot.id}-1`,
      timestamp: simulatedTimeLabel,
      senderId: 'DIR-MASTER',
      senderName: 'Direzione Didattica Trauma Team',
      senderRole: 'direttore',
      type: 'info',
      subject: 'Supervisione Didattica e Monitoraggio NTS',
      content: 'Tutor Faculty FAC-01–12 in presidio 1:1. Team Leader (TL) di ciascuna squadra alla guida dell\'inquadramento.',
      status: 'acknowledged',
    },
    {
      id: `sim-msg-${slot.id}-2`,
      timestamp: simulatedTimeLabel,
      senderId: 'TECH-COORD',
      senderName: 'Coordinamento Tecnico Simulatori',
      senderRole: 'tecnico',
      type: 'info',
      subject: 'Stato Manichini & Telemetria Postazioni',
      content: 'Pressione idraulica sangue simulato OK (110/70 mmHg), circuiti ventilatori e protesi attive.',
      status: 'acknowledged',
    },
  ];

  // Valutazioni Faculty simulate realistiche (1:1 Tutor con Squadra)
  const simulatedEvaluations: TeamEvaluation[] = [
    {
      id: `sim-eval-${blockNumber}-t1`,
      teamId: 1,
      facultyId: 'FAC-01',
      day: activeDay,
      period: 'mattina',
      patientId: 1,
      scenarioCode: `Scenario ${blockNumber} (TCCC/SR)`,
      phase: subPhaseInfo.isHandoverActive ? 'HANDOVER' : 'EXTRA',
      scores: {
        abcdeApproach: 4,
        technicalSkills: 5,
        teamworkLeadership: 4,
        handoverSbar: 5,
        safetyTiming: 4,
      },
      proceduresCompleted: ['Tourniquet CAT applicato < 60s', 'Wound Packing emostatico', 'Ago-decompressione 2° spazio intercostale'],
      strengths: 'Ottima comunicazione ad anello chiuso del Team Leader (DISC-01); rapidità di emostasi.',
      criticalIssues: 'Verificare fissaggio barella basket durante il transito verso il Box Shock Room.',
      debriefingActionItems: 'Migliorare la sequenza di chiamata SBAR e la ripartizione del carico barella.',
      timestamp: new Date().toISOString(),
    },
    {
      id: `sim-eval-${blockNumber}-t7`,
      teamId: 7,
      facultyId: 'FAC-07',
      day: activeDay,
      period: 'mattina',
      patientId: 2,
      scenarioCode: `Scenario ${blockNumber} (Shock Room)`,
      phase: 'INTRA',
      scores: {
        abcdeApproach: 5,
        technicalSkills: 4,
        teamworkLeadership: 5,
        handoverSbar: 4,
        safetyTiming: 5,
      },
      proceduresCompleted: ['Ricezione Handover SBAR', 'Ecografia e-FAST a 4 finestre', 'Accesso intraosseo tibiale'],
      strengths: 'Riconoscimento tempestivo versamento pericardico su scansione subxifoidea.',
      criticalIssues: 'Mantenere rigoroso isolamento acustico nel box durante la fase A (Airway).',
      debriefingActionItems: 'Standardizzare il timeout clinico prima della somministrazione emocomponenti.',
      timestamp: new Date().toISOString(),
    },
  ];

  // Avvisi e Check Tecnici simulati
  const simulatedTechAlerts = [
    {
      stationId: 'SR-BOX-1',
      stationName: 'Box Shock Room 1 (Paziente 1)',
      status: (subPhaseInfo.isHandoverActive ? 'handover' : 'ready') as any,
      techCode: 'TECH-07',
      actionLabel: subPhaseInfo.isHandoverActive ? 'Ricezione barella & aggancio monitor' : 'Simulatore SimMan 3G pronto',
      timestamp: simulatedTimeLabel,
    },
    {
      stationId: 'TCCC-AMB-1',
      stationName: 'Ambiente Tattico 1 (Under Fire)',
      status: (subPhaseInfo.isHandoverActive ? 'handover' : 'ready') as any,
      techCode: 'TECH-01',
      actionLabel: subPhaseInfo.isHandoverActive ? 'Barella in transito su corridoio protetto' : 'Effetti pirotecnici e fumo calibrati',
      timestamp: simulatedTimeLabel,
    },
    {
      stationId: 'WS-1-AIRWAY',
      stationName: 'Skill Workshop 1 (Crico & Vie Aeree)',
      status: 'ready' as any,
      techCode: 'TECH-04',
      actionLabel: '15 simulatori testa-collo sanificati e kit pronti',
      timestamp: simulatedTimeLabel,
    },
    {
      stationId: 'WS-2-FAST',
      stationName: 'Skill Workshop 2 (Ecografia FAST)',
      status: 'ready' as any,
      techCode: 'TECH-10',
      actionLabel: '3 ecografi carrellati calibrati con sonde phased array',
      timestamp: simulatedTimeLabel,
    },
  ];

  return {
    simulatedTimeLabel,
    blockNumber,
    subPhase: subPhaseInfo.subPhase,
    subPhaseTitle: subPhaseInfo.subPhaseLabel,
    isHandoverActive: subPhaseInfo.isHandoverActive,
    handoverRemainingSeconds: subPhaseInfo.handoverRemainingSeconds,
    tracks,
    simulatedMessages,
    simulatedEvaluations,
    simulatedTechAlerts,
  };
}
