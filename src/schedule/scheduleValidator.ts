export interface ValidationIssue {
  id: string;
  type: 'hard' | 'soft';
  code: string;
  title: string;
  description: string;
  affectedEntities: string[];
  stationId?: string;
  slotId?: string;
  teamId?: string | number;
}

export interface ScheduleValidationResult {
  isValid: boolean; // true if no hard issues
  hard: ValidationIssue[];
  soft: ValidationIssue[];
}

export interface SlotChangeProposal {
  slotId: string;
  deltaMinutes: number; // e.g. +5, +10, +15, -5, -10
  newStartMinutes?: number;
  reason?: string;
  requestedBy?: string;
  type?: 'extend' | 'reduce' | 'move';
  newStartTime?: string;
}

export interface MinimalSlotState {
  id: string;
  day: number;
  startMinutes: number;
  durationMinutes: number;
  title: string;
  phase?: string;
  stationId?: string;
  assignedFacultyIds?: string[];
  assignedTechIds?: string[];
  assignedTeamIds?: (string | number)[];
  capacity?: number;
}

/**
 * Validates a schedule modification proposal against hard and soft tactical constraints.
 */
export function validateChange(
  change: SlotChangeProposal,
  allSlots: MinimalSlotState[]
): ScheduleValidationResult {
  const hard: ValidationIssue[] = [];
  const soft: ValidationIssue[] = [];

  const targetSlot = allSlots.find((s) => s.id === change.slotId);
  if (!targetSlot) {
    hard.push({
      id: 'err-target-not-found',
      type: 'hard',
      code: 'SLOT_NOT_FOUND',
      title: 'Slot non trovato',
      description: `Lo slot con id ${change.slotId} non è stato reperito nel cronoprogramma.`,
      affectedEntities: [change.slotId],
    });
    return { isValid: false, hard, soft };
  }

  // Nuova durata proposta
  const proposedDuration = targetSlot.durationMinutes + change.deltaMinutes;
  if (proposedDuration < 10) {
    hard.push({
      id: 'err-duration-too-short',
      type: 'hard',
      code: 'MINIMUM_DURATION_VIOLATION',
      title: 'Durata minima clinica non rispettata (< 10 min)',
      description: `La durata proposta (${proposedDuration}m) è insufficiente per eseguire lo scenario clinico o il debriefing in sicurezza.`,
      affectedEntities: [targetSlot.title],
      slotId: targetSlot.id,
    });
  }

  // Calcola la timeline proiettata applicando la modifica a cascata per gli slot dello stesso giorno
  const projectedSlots = allSlots.map((s) => {
    if (s.day !== targetSlot.day) return { ...s };

    if (s.id === targetSlot.id) {
      return {
        ...s,
        durationMinutes: proposedDuration,
      };
    }

    // Se lo slot è cronologicamente successivo a quello modificato, sposta in avanti o indietro il suo orario di inizio
    if (s.startMinutes > targetSlot.startMinutes) {
      return {
        ...s,
        startMinutes: s.startMinutes + change.deltaMinutes,
      };
    }

    return { ...s };
  });

  // 1. HARD CONSTRAINT: Verifica sovrapposizioni stazione / ambiente (Ambiente TCCC, Box Shock Room, Workshop)
  const slotsOnSameDay = projectedSlots.filter((s) => s.day === targetSlot.day);
  
  for (let i = 0; i < slotsOnSameDay.length; i++) {
    for (let j = i + 1; j < slotsOnSameDay.length; j++) {
      const a = slotsOnSameDay[i];
      const b = slotsOnSameDay[j];

      // Se condividono la stessa stazione specifica (e non sono lo stesso slot)
      if (a.stationId && b.stationId && a.stationId === b.stationId) {
        const aEnd = a.startMinutes + a.durationMinutes;
        const bEnd = b.startMinutes + b.durationMinutes;

        // Sovrapposizione temporale
        const isOverlap = Math.max(a.startMinutes, b.startMinutes) < Math.min(aEnd, bEnd);
        if (isOverlap) {
          hard.push({
            id: `err-station-overlap-${a.stationId}-${a.id}-${b.id}`,
            type: 'hard',
            code: 'STATION_DOUBLE_BOOKING',
            title: `Sovrapposizione postazione: ${a.stationId.toUpperCase()}`,
            description: `I blocchi "${a.title}" e "${b.title}" tentano di occupare contemporaneamente la stazione ${a.stationId}.`,
            affectedEntities: [a.title, b.title, a.stationId],
            stationId: a.stationId,
          });
        }
      }

      // 2. HARD CONSTRAINT: Tutor o Tecnico in due posti contemporaneamente
      const sharedFaculty = (a.assignedFacultyIds || []).filter((fId) =>
        (b.assignedFacultyIds || []).includes(fId)
      );
      if (sharedFaculty.length > 0) {
        const aEnd = a.startMinutes + a.durationMinutes;
        const bEnd = b.startMinutes + b.durationMinutes;
        const isOverlap = Math.max(a.startMinutes, b.startMinutes) < Math.min(aEnd, bEnd);
        if (isOverlap) {
          hard.push({
            id: `err-faculty-overlap-${sharedFaculty.join('-')}-${a.id}-${b.id}`,
            type: 'hard',
            code: 'FACULTY_DOUBLE_ASSIGNMENT',
            title: `Tutor impegnato contemporaneamente su due postazioni`,
            description: `I tutor [${sharedFaculty.join(', ')}] risultano assegnati sia a "${a.title}" che a "${b.title}" nella medesima fascia oraria.`,
            affectedEntities: sharedFaculty,
          });
        }
      }

      // 3. HARD CONSTRAINT: Squadre in due posti contemporaneamente
      const sharedTeams = (a.assignedTeamIds || []).filter((tId) =>
        (b.assignedTeamIds || []).includes(tId)
      );
      if (sharedTeams.length > 0) {
        const aEnd = a.startMinutes + a.durationMinutes;
        const bEnd = b.startMinutes + b.durationMinutes;
        const isOverlap = Math.max(a.startMinutes, b.startMinutes) < Math.min(aEnd, bEnd);
        if (isOverlap) {
          hard.push({
            id: `err-team-overlap-${sharedTeams.join('-')}-${a.id}-${b.id}`,
            type: 'hard',
            code: 'TEAM_DOUBLE_ASSIGNMENT',
            title: `Squadra impegnata su due scenari contemporaneamente`,
            description: `La squadra ${sharedTeams.join(', ')} ha una collisione tra "${a.title}" e "${b.title}".`,
            affectedEntities: sharedTeams.map((t) => `Squadra ${t}`),
          });
        }
      }
    }
  }

  // 4. SOFT CONSTRAINTS (Warning Forzabili)
  // A. Pausa tutor < 5 minuti tra due blocchi intensivi ad alta fedeltà
  for (let i = 0; i < slotsOnSameDay.length - 1; i++) {
    const cur = slotsOnSameDay[i];
    const next = slotsOnSameDay[i + 1];
    const curEnd = cur.startMinutes + cur.durationMinutes;
    const gap = next.startMinutes - curEnd;

    // Se c'è transizione continua con gap < 5 min per scenari complessi
    if (gap >= 0 && gap < 5 && cur.assignedFacultyIds && next.assignedFacultyIds) {
      const commonFac = cur.assignedFacultyIds.filter((f) => next.assignedFacultyIds?.includes(f));
      if (commonFac.length > 0) {
        soft.push({
          id: `warn-short-rest-${cur.id}-${next.id}`,
          type: 'soft',
          code: 'SHORT_REST_INTERVAL',
          title: 'Intervallo di riposo/turnaround tutor < 5 min',
          description: `I tutor [${commonFac.join(', ')}] hanno meno di 5 minuti di recupero prima dell'ingaggio successivo "${next.title}".`,
          affectedEntities: commonFac,
        });
      }
    }

    // B. Buchi ingiustificati > 15 minuti tra slot didattici attivi
    if (gap > 15 && cur.phase !== 'Pausa' && next.phase !== 'Pausa') {
      soft.push({
        id: `warn-large-gap-${cur.id}-${next.id}`,
        type: 'soft',
        code: 'SCHEDULE_DEAD_TIME',
        title: `Tempo morto / buco orario elevato (${gap} min)`,
        description: `Rilevato un vuoto operativo di ${gap} minuti tra "${cur.title}" e "${next.title}".`,
        affectedEntities: [cur.title, next.title],
      });
    }
  }

  // C. Disallineamento globale giorno (orario di chiusura posticipato oltre le 23:30)
  const lastSlot = [...slotsOnSameDay].sort(
    (a, b) => b.startMinutes + b.durationMinutes - (a.startMinutes + a.durationMinutes)
  )[0];
  if (lastSlot) {
    const dayEndMinutes = lastSlot.startMinutes + lastSlot.durationMinutes;
    if (dayEndMinutes > 1410) { // 23:30
      soft.push({
        id: 'warn-late-closure',
        type: 'soft',
        code: 'LATE_COMPLETION_WARNING',
        title: 'Chiusura attività posticipata oltre le 23:30',
        description: `La modifica comporta la fine delle attività didattiche alle ore ${Math.floor(
          dayEndMinutes / 60
        )}:${String(dayEndMinutes % 60).padStart(2, '0')}.`,
        affectedEntities: ['Chiusura Giornata'],
      });
    }
  }

  return {
    isValid: hard.length === 0,
    hard,
    soft,
  };
}
