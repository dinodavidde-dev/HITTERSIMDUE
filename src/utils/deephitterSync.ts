import { CourseDay, TimelineSlot, ActorProgressStatus, CourseActor, SimulatorPatient } from '../types';
import {
  DEEPHITTER_CONVOCAZIONI_TABLE,
  DeephitterTruccoEntry,
  DEEPHITTER_MAKEUP_ARTISTS,
  DEEPHITTER_ACTORS,
} from '../data/deephitterTruccoData';

export type DeephitterPhase =
  | 'ATTESA_CONVOCAZIONE'
  | 'CONVOCAZIONE_PREP'
  | 'PRE_ALERT_STANDBY'
  | 'SCENA_TCCC'
  | 'HANDOVER_SHOCK_ROOM'
  | 'RESET_RICARICA'
  | 'COMPLETATO';

export type DeephitterLiveStatusKey =
  | 'attesa'
  | 'in_preparazione'
  | 'pronto'
  | 'ritardo'
  | 'in_scena'
  | 'handover'
  | 'reset'
  | 'completato';

export interface DeephitterLiveStatus {
  phase: DeephitterPhase;
  statusKey: DeephitterLiveStatusKey;
  statusLabel: string;
  badgeClass: string;
  dotColor: string;
  countdownProntoMinutes: number; // positive = missing minutes to T-15', negative = elapsed
  countdownT0Minutes: number; // positive = missing minutes to T0, negative = elapsed
  isUrgent: boolean;
  isOverdue: boolean;
  isCriticalT0InPrep: boolean;
  recommendation: string;
}

export interface DeephitterBlockMeta {
  blockNumber: 1 | 2 | 3 | 4;
  label: string;
  timeRange: string;
  startMinutes: number;
  endMinutes: number;
  convocazioneMinutes: number;
  prontoMinutes: number;
  t0Minutes: number;
}

export const DEEPHITTER_BLOCKS_META: DeephitterBlockMeta[] = [
  {
    blockNumber: 1,
    label: 'Blocco 1 (09:00–10:35)',
    timeRange: '09:00 - 10:35',
    startMinutes: 540, // 09:00
    endMinutes: 635,   // 10:35
    convocazioneMinutes: 480, // 08:00 (T-60')
    prontoMinutes: 525,       // 08:45 (T-15')
    t0Minutes: 540,           // 09:00 (T0)
  },
  {
    blockNumber: 2,
    label: 'Blocco 2 (10:45–12:20)',
    timeRange: '10:45 - 12:20',
    startMinutes: 645, // 10:45
    endMinutes: 740,   // 12:20
    convocazioneMinutes: 585, // 09:45 (T-60')
    prontoMinutes: 630,       // 10:30 (T-15')
    t0Minutes: 645,           // 10:45 (T0)
  },
  {
    blockNumber: 3,
    label: 'Blocco 3 (13:30–15:05)',
    timeRange: '13:30 - 15:05',
    startMinutes: 810, // 13:30
    endMinutes: 905,   // 15:05
    convocazioneMinutes: 750, // 12:30 (T-60')
    prontoMinutes: 795,       // 13:15 (T-15')
    t0Minutes: 810,           // 13:30 (T0)
  },
  {
    blockNumber: 4,
    label: 'Blocco 4 (15:15–16:50)',
    timeRange: '15:15 - 16:50',
    startMinutes: 915, // 15:15
    endMinutes: 1010,  // 16:50
    convocazioneMinutes: 855, // 14:15 (T-60')
    prontoMinutes: 900,       // 15:00 (T-15')
    t0Minutes: 915,           // 15:15 (T0)
  },
];

/**
 * Convert total minutes from 00:00 to HH:MM format
 */
export function formatMinutesToTime(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = Math.floor(norm % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Format a positive or negative countdown in minutes to a human-readable badge label
 */
export function formatMinutesCountdown(minutesDiff: number): string {
  const abs = Math.abs(minutesDiff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
  if (minutesDiff > 0) {
    return `- ${timeStr}`;
  } else if (minutesDiff === 0) {
    return '0m (ADESSO)';
  } else {
    return `+ ${timeStr} FA`;
  }
}

/**
 * Calculates simulated time in minutes from CourseContext state
 */
export function getSimulatedCourseMinutes(
  currentSlot?: TimelineSlot,
  timerSeconds?: number,
  fallbackDate?: Date
): number {
  if (currentSlot && currentSlot.startMinutes !== undefined) {
    const slotDurationSec = currentSlot.durationMinutes * 60;
    const remainingSec = timerSeconds !== undefined && timerSeconds >= 0 ? timerSeconds : slotDurationSec;
    const elapsedSec = Math.max(0, slotDurationSec - remainingSec);
    const elapsedMinutes = Math.floor(elapsedSec / 60);
    return currentSlot.startMinutes + elapsedMinutes;
  }

  // Fallback to current real time
  const now = fallbackDate || new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Resolves which operational block is currently active, upcoming, or nearest
 */
export function getActiveDeephitterBlockNumber(currentMinutes: number): 1 | 2 | 3 | 4 {
  for (const block of DEEPHITTER_BLOCKS_META) {
    // If current time is within or right before the block (from T-60' up to end)
    if (currentMinutes >= block.convocazioneMinutes && currentMinutes <= block.endMinutes) {
      return block.blockNumber;
    }
  }

  // If before block 1
  if (currentMinutes < DEEPHITTER_BLOCKS_META[0].convocazioneMinutes) {
    return 1;
  }
  // If between block 1 and block 2
  if (currentMinutes <= DEEPHITTER_BLOCKS_META[1].convocazioneMinutes) {
    return 2;
  }
  // If between block 2 and block 3
  if (currentMinutes <= DEEPHITTER_BLOCKS_META[2].convocazioneMinutes) {
    return 3;
  }
  // Otherwise block 4
  return 4;
}

/**
 * Computes real-time live status for a DEEPHITTER entry
 */
export function getDeephitterEntryLiveStatus(
  entry: DeephitterTruccoEntry,
  currentMinutes: number,
  actorProgressOverride?: ActorProgressStatus
): DeephitterLiveStatus {
  const prontoDiff = entry.prontoMinutes - currentMinutes;
  const t0Diff = entry.t0Minutes - currentMinutes;

  // Manual actorProgressOverride takes priority if explicitly set to PRONTO_T0 or RESET_SMONTAGGIO
  if (actorProgressOverride === 'PRONTO_T0') {
    return {
      phase: 'PRE_ALERT_STANDBY',
      statusKey: 'pronto',
      statusLabel: 'PRONTO SCENA (CONFERMATO)',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-500/20',
      dotColor: 'bg-emerald-400',
      countdownProntoMinutes: prontoDiff,
      countdownT0Minutes: t0Diff,
      isUrgent: false,
      isOverdue: false,
      isCriticalT0InPrep: false,
      recommendation: 'Attore pronto e truccato. Standby attivo per trasferimento in postazione.',
    };
  }

  if (actorProgressOverride === 'IN_SCENARIO') {
    return {
      phase: 'SCENA_TCCC',
      statusKey: 'in_scena',
      statusLabel: 'IN SCENARIO ATTIVO',
      badgeClass: 'bg-red-950/80 text-red-300 border-red-500 animate-pulse',
      dotColor: 'bg-red-500',
      countdownProntoMinutes: prontoDiff,
      countdownT0Minutes: t0Diff,
      isUrgent: false,
      isOverdue: false,
      isCriticalT0InPrep: false,
      recommendation: 'Ingaggio clinico in corso con discenti e Faculty.',
    };
  }

  if (actorProgressOverride === 'RESET_SMONTAGGIO') {
    return {
      phase: 'RESET_RICARICA',
      statusKey: 'reset',
      statusLabel: 'RESET / SMONTAGGIO',
      badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-500',
      dotColor: 'bg-purple-400',
      countdownProntoMinutes: prontoDiff,
      countdownT0Minutes: t0Diff,
      isUrgent: false,
      isOverdue: false,
      isCriticalT0InPrep: false,
      recommendation: 'Pulizia silicone, ricarica sacche sangue e turnaround consumabili.',
    };
  }

  // Priority Alert Condition: Actor in state 'IN_PREPARAZIONE' with time to T0 < 10 minutes
  const isInPreparazione =
    actorProgressOverride === 'IN_PREPARAZIONE' ||
    (currentMinutes >= entry.convocazioneMinutes &&
      currentMinutes < entry.t0Minutes + 35);

  const isCriticalT0InPrep = isInPreparazione && t0Diff < 10 && t0Diff >= -45;

  if (isCriticalT0InPrep) {
    return {
      phase: 'CONVOCAZIONE_PREP',
      statusKey: 'ritardo',
      statusLabel: `⚠️ CRITICO: IN PREP • T0 ${formatMinutesCountdown(t0Diff)}`,
      badgeClass:
        'bg-red-950 text-red-100 border-2 border-red-500 ring-2 ring-red-500 shadow-xl shadow-red-500/50 animate-pulse font-black',
      dotColor: 'bg-red-500 animate-ping',
      countdownProntoMinutes: prontoDiff,
      countdownT0Minutes: t0Diff,
      isUrgent: true,
      isOverdue: true,
      isCriticalT0InPrep: true,
      recommendation: `ALLERTA T0 IMMINENTE: Mancano ${
        t0Diff > 0 ? t0Diff : 0
      } min all'avvio T0 di ${entry.scenarioAndPatient} e l'attore ${entry.actorCode} (${entry.actorName}) è ancora in preparazione. Sollecitare immediato completamento o notificare la Regia CH-3.`,
    };
  }

  if (currentMinutes < entry.convocazioneMinutes) {
    return {
      phase: 'ATTESA_CONVOCAZIONE',
      statusKey: 'attesa',
      statusLabel: 'ATTESA CONVOCAZIONE (T-60\')',
      badgeClass: 'bg-neutral-900/90 text-neutral-400 border-neutral-700',
      dotColor: 'bg-neutral-500',
      countdownProntoMinutes: prontoDiff,
      countdownT0Minutes: t0Diff,
      isUrgent: false,
      isOverdue: false,
      isCriticalT0InPrep: false,
      recommendation: `Convocazione prevista alle ${entry.convocazioneTime} (${formatMinutesCountdown(entry.convocazioneMinutes - currentMinutes)}).`,
    };
  }

  if (currentMinutes >= entry.convocazioneMinutes && currentMinutes < entry.prontoMinutes) {
    const isLateWarning = prontoDiff <= 10;
    return {
      phase: 'CONVOCAZIONE_PREP',
      statusKey: isLateWarning ? 'ritardo' : 'in_preparazione',
      statusLabel: isLateWarning ? 'MOULAGE FX • ULTIMI 10 MINUTI' : 'MOULAGE FX IN CORSO',
      badgeClass: isLateWarning
        ? 'bg-amber-950 text-amber-200 border-amber-400 animate-pulse'
        : 'bg-amber-950/80 text-amber-300 border-amber-600',
      dotColor: isLateWarning ? 'bg-amber-400 animate-ping' : 'bg-amber-400',
      countdownProntoMinutes: prontoDiff,
      countdownT0Minutes: t0Diff,
      isUrgent: isLateWarning,
      isOverdue: false,
      isCriticalT0InPrep: false,
      recommendation: `Target Pronto Scena alle ${entry.prontoTime} (${formatMinutesCountdown(prontoDiff)}). Verificare ancoraggio protesi e cariche fluidi.`,
    };
  }

  if (currentMinutes >= entry.prontoMinutes && currentMinutes < entry.t0Minutes) {
    return {
      phase: 'PRE_ALERT_STANDBY',
      statusKey: 'pronto',
      statusLabel: 'TARGET PRONTO RAGGIUNTO (T-15\')',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-500/20',
      dotColor: 'bg-emerald-400',
      countdownProntoMinutes: prontoDiff,
      countdownT0Minutes: t0Diff,
      isUrgent: false,
      isOverdue: false,
      isCriticalT0InPrep: false,
      recommendation: `Attore pronto in postazione. Inizio TCCC previsto alle ${entry.t0Time} (${formatMinutesCountdown(t0Diff)}).`,
    };
  }

  if (currentMinutes >= entry.t0Minutes && currentMinutes < entry.t0Minutes + 35) {
    return {
      phase: 'SCENA_TCCC',
      statusKey: 'in_scena',
      statusLabel: 'FASE TCCC ATTIVA (00–30\')',
      badgeClass: 'bg-red-950/80 text-red-300 border-red-500 animate-pulse',
      dotColor: 'bg-red-500',
      countdownProntoMinutes: prontoDiff,
      countdownT0Minutes: t0Diff,
      isUrgent: false,
      isOverdue: false,
      isCriticalT0InPrep: false,
      recommendation: 'Scena TCCC in corso. Monitorare tenuta Tourniquet e pressione getto.',
    };
  }

  if (currentMinutes >= entry.t0Minutes + 35 && currentMinutes < entry.t0Minutes + 65) {
    return {
      phase: 'HANDOVER_SHOCK_ROOM',
      statusKey: 'handover',
      statusLabel: 'SHOCK ROOM & FAST (35–65\')',
      badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-500',
      dotColor: 'bg-blue-400',
      countdownProntoMinutes: prontoDiff,
      countdownT0Minutes: t0Diff,
      isUrgent: false,
      isOverdue: false,
      isCriticalT0InPrep: false,
      recommendation: 'Paziente trasferito in Box Shock Room. Monitorare lesioni toraciche/addominali.',
    };
  }

  if (currentMinutes >= entry.t0Minutes + 65 && currentMinutes < entry.t0Minutes + 95) {
    return {
      phase: 'RESET_RICARICA',
      statusKey: 'reset',
      statusLabel: 'RESET & DEBRIEFING (65–95\')',
      badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-500',
      dotColor: 'bg-purple-400',
      countdownProntoMinutes: prontoDiff,
      countdownT0Minutes: t0Diff,
      isUrgent: false,
      isOverdue: false,
      isCriticalT0InPrep: false,
      recommendation: 'Debriefing clinico e turnaround 15 minuti: pulizia attore, reset membrane e fluidi.',
    };
  }

  // After block
  return {
    phase: 'COMPLETATO',
    statusKey: 'completato',
    statusLabel: 'BLOCCO CONCLUSO',
    badgeClass: 'bg-neutral-900/80 text-neutral-400 border-neutral-800',
    dotColor: 'bg-neutral-600',
    countdownProntoMinutes: prontoDiff,
    countdownT0Minutes: t0Diff,
    isUrgent: false,
    isOverdue: false,
    isCriticalT0InPrep: false,
    recommendation: 'Attività del blocco completate con successo.',
  };
}

/**
 * Filter entries for a specific Day and Block
 */
export function getDeephitterEntriesForBlock(
  day: CourseDay,
  blockNumber: 1 | 2 | 3 | 4
): DeephitterTruccoEntry[] {
  return DEEPHITTER_CONVOCAZIONI_TABLE.filter(
    (e) => e.day === day && e.blockNumber === blockNumber
  );
}

/**
 * Filter entries assigned to a specific Makeup Artist (TRUCCO-01, TRUCCO-02, TRUCCO-03)
 */
export function getDeephitterEntriesForArtist(
  artistCodeOrId: string,
  day?: CourseDay
): DeephitterTruccoEntry[] {
  const norm = artistCodeOrId.toUpperCase();
  let code = norm;
  if (norm.includes('TRUCCO-01') || norm === 'TRUC-01' || norm === 'TRUC-1') code = 'TRUCCO-01';
  if (norm.includes('TRUCCO-02') || norm === 'TRUC-02' || norm === 'TRUC-2') code = 'TRUCCO-02';
  if (norm.includes('TRUCCO-03') || norm === 'TRUC-03' || norm === 'TRUC-3') code = 'TRUCCO-03';

  return DEEPHITTER_CONVOCAZIONI_TABLE.filter((e) => {
    const matchArtist = e.truccatriceCode === code;
    if (day !== undefined) {
      return matchArtist && e.day === day;
    }
    return matchArtist;
  });
}

/**
 * Get active entry for an artist in the current block
 */
export function getDeephitterActiveEntryForArtist(
  artistCodeOrId: string,
  day: CourseDay,
  currentMinutes: number
): DeephitterTruccoEntry | undefined {
  const activeBlockNum = getActiveDeephitterBlockNumber(currentMinutes);
  const artistEntries = getDeephitterEntriesForArtist(artistCodeOrId, day);
  return artistEntries.find((e) => e.blockNumber === activeBlockNum) || artistEntries[0];
}

/**
 * Search helper for actors in DEEPHITTER dataset
 */
export function getDeephitterActorByCode(actorCode: string) {
  const norm = actorCode.toUpperCase();
  return DEEPHITTER_ACTORS.find((a) => a.badgeCode.toUpperCase() === norm);
}

/**
 * Search helper for makeup artists in DEEPHITTER dataset
 */
export function getDeephitterArtistByCode(artistCode: string) {
  const norm = artistCode.toUpperCase();
  return DEEPHITTER_MAKEUP_ARTISTS.find(
    (m) =>
      m.badgeCode.toUpperCase() === norm ||
      m.badgeCode.replace('TRUCCO-', 'TRUC-') === norm ||
      m.id.toUpperCase() === norm
  );
}

export interface CriticalActorNotification {
  id: string; // entry ID or unique key
  actorId?: string;
  actorCode: string; // e.g. "ACT-01"
  actorName: string; // e.g. "Marco Ferri"
  physicalStatus: string;
  progressStatus: ActorProgressStatus;
  scenarioAndPatient: string;
  patientId: number;
  blockNumber: 1 | 2 | 3 | 4;
  day: CourseDay;
  t0Time: string;
  t0Minutes: number;
  timeToT0Minutes: number; // positive = minutes remaining to T0 (< 10), negative = overdue
  truccatriceCode: string;
  truccatriceName: string;
  postazioneLogistica: string;
  lesioniClinicheMoulage: string;
  presidioMoulageFx?: string;
  noteOperativeRicarica?: string;
  isOverdue: boolean;
  recommendation: string;
}

/**
 * Identifies actors in state 'IN_PREPARAZIONE' whose scenario T0 is less than 10 minutes away
 */
export function findCriticalInPrepActors(
  day: CourseDay,
  currentMinutes: number,
  actors: CourseActor[],
  simulatorPatients?: SimulatorPatient[]
): CriticalActorNotification[] {
  const dayEntries = DEEPHITTER_CONVOCAZIONI_TABLE.filter((e) => e.day === day);
  const criticalList: CriticalActorNotification[] = [];

  for (const entry of dayEntries) {
    const actorInContext = actors.find(
      (a) => a.badgeCode?.toUpperCase() === entry.actorCode.toUpperCase()
    );
    const pzId = entry.patientIds[0];
    const patientInContext = simulatorPatients?.find((p) => p.id === pzId);

    const isExplicitlyPronto =
      actorInContext?.progressStatus === 'PRONTO_T0' || patientInContext?.techChecklist?.preDone === true;
    const isExplicitlyInScenario = actorInContext?.progressStatus === 'IN_SCENARIO';
    const isExplicitlyReset = actorInContext?.progressStatus === 'RESET_SMONTAGGIO';

    // If already pronto, in scenario or reset, not in preparation
    if (isExplicitlyPronto || isExplicitlyInScenario || isExplicitlyReset) {
      continue;
    }

    const t0Diff = entry.t0Minutes - currentMinutes;

    // Check if actor has state 'IN_PREPARAZIONE' or is within active prep window and not ready
    const isInPreparazione =
      actorInContext?.progressStatus === 'IN_PREPARAZIONE' ||
      (!actorInContext?.progressStatus || actorInContext?.progressStatus === 'STANDBY'
        ? currentMinutes >= entry.convocazioneMinutes && currentMinutes < entry.t0Minutes + 35
        : false);

    // CRITICAL CONDITION: state is 'IN_PREPARAZIONE' AND time to T0 < 10 minutes
    if (isInPreparazione && t0Diff < 10 && t0Diff >= -45) {
      const isOverdue = t0Diff <= 0;
      criticalList.push({
        id: entry.id,
        actorId: actorInContext?.id,
        actorCode: entry.actorCode,
        actorName: entry.actorName,
        physicalStatus: actorInContext?.physicalStatus || 'AMPUTATO',
        progressStatus: actorInContext?.progressStatus || 'IN_PREPARAZIONE',
        scenarioAndPatient: entry.scenarioAndPatient,
        patientId: pzId,
        blockNumber: entry.blockNumber,
        day: entry.day,
        t0Time: entry.t0Time,
        t0Minutes: entry.t0Minutes,
        timeToT0Minutes: t0Diff,
        truccatriceCode: entry.truccatriceCode,
        truccatriceName: entry.truccatriceName,
        postazioneLogistica: entry.postazioneLogistica,
        lesioniClinicheMoulage: entry.lesioniClinicheMoulage,
        presidioMoulageFx: entry.presidioMoulageFx,
        noteOperativeRicarica: entry.noteOperativeRicarica,
        isOverdue,
        recommendation: isOverdue
          ? `🚨 RITARDO CRITICO: T0 superato da ${Math.abs(t0Diff)} minuti e l'attore ${entry.actorCode} è ancora IN PREPARAZIONE!`
          : `⚠️ ALLERTA T0 IMMINENTE: Mancano ${t0Diff} minuti al T0 (${entry.t0Time}) di ${entry.scenarioAndPatient} e l'attore ${entry.actorCode} (${entry.actorName}) è ancora IN PREPARAZIONE! Sollecitare immediato completamento della protesi e inviare notifica Regia CH-3.`,
      });
    }
  }

  return criticalList;
}

/**
 * Check if a specific actor is critical (in prep and T0 < 10 min)
 */
export function checkActorCriticality(
  actorCode: string,
  day: CourseDay,
  currentMinutes: number,
  actorProgressStatus?: ActorProgressStatus,
  preDone?: boolean
): { isCritical: boolean; timeToT0: number; entry?: DeephitterTruccoEntry } {
  if (actorProgressStatus === 'PRONTO_T0' || preDone || actorProgressStatus === 'IN_SCENARIO' || actorProgressStatus === 'RESET_SMONTAGGIO') {
    return { isCritical: false, timeToT0: 999 };
  }

  const entries = DEEPHITTER_CONVOCAZIONI_TABLE.filter(
    (e) => e.day === day && e.actorCode.toUpperCase() === actorCode.toUpperCase()
  );

  for (const entry of entries) {
    const t0Diff = entry.t0Minutes - currentMinutes;
    const isInPrep =
      actorProgressStatus === 'IN_PREPARAZIONE' ||
      currentMinutes >= entry.convocazioneMinutes;

    if (isInPrep && t0Diff < 10 && t0Diff >= -45) {
      return { isCritical: true, timeToT0: t0Diff, entry };
    }
  }

  return { isCritical: false, timeToT0: 999 };
}

