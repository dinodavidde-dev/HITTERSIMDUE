import { SimulatorPatient, TeamEvaluation, Faculty, TimelineSlot, GroupActivitySlot } from '../types';
import { INITIAL_TIMELINE_SLOTS } from '../data/initialData';

/**
 * Determines whether a timeline slot represents an ongoing clinical simulation scenario
 * (e.g. TCCC under fire, Handover SBAR 1:1, Shock Room high-fidelity ABCDE, WS hands-on simulation).
 * Returns false for non-scenario phases assigned to technicians (Reset postazioni,
 * Debriefing clinico, Setup staff, Accoglienza, Pause, Chiusura).
 */
export const isScenarioSlot = (slot: TimelineSlot | null | undefined): boolean => {
  if (!slot) return false;
  const slotId = (slot.id || '').toLowerCase();
  const slotTitle = (slot.title || '').toLowerCase();

  // Explicit non-scenario phases assigned to technicians or course events:
  if (
    slotId.includes('reset') ||
    slotId.includes('debrief') ||
    slotId.includes('setup') ||
    slotId.includes('welcome') ||
    slotId.includes('pausa') ||
    slotId.includes('pranzo') ||
    slotId.includes('chiusura') ||
    slotTitle.includes('reset') ||
    slotTitle.includes('debrief') ||
    slotTitle.includes('setup') ||
    slotTitle.includes('accoglienza') ||
    slotTitle.includes('pausa') ||
    slotTitle.includes('pranzo') ||
    slotTitle.includes('chiusura')
  ) {
    return false;
  }

  // Active scenario identifiers:
  if (slotId.includes('tccc') || slotId.includes('handover') || slotId.includes('sr')) {
    return true;
  }

  if (slotTitle.includes('scenario') || slotTitle.includes('handover')) {
    return true;
  }

  const acts = slot.groupActivities || {};
  return (Object.values(acts) as (GroupActivitySlot | undefined)[]).some(
    (act) =>
      act &&
      (act.activityType === 'scenario_extra' ||
        act.activityType === 'scenario_intra' ||
        Boolean(act.patientIds && act.patientIds.length > 0))
  );
};

export interface ScenarioStatusInfo {
  status: 'DA_FARE' | 'IN_CORSO' | 'DA_VALUTARE' | 'VALUTATO';
  text: string;
  badgeClass: string;
  dotColor: string;
  isFlashing: boolean;
}

export const getScenarioStatusInfo = (
  patient: SimulatorPatient,
  activeDay: number,
  activeSlotIndex: number,
  evaluations: TeamEvaluation[],
  facultyList: Faculty[]
): ScenarioStatusInfo => {
  // Assigned faculty for this patient (extra team or intra team)
  const assignedFaculty = facultyList.filter(
    (f) => f.assignedTeamId === patient.teamExtraAssigned || f.assignedTeamId === patient.teamIntraAssigned
  );

  const patientEvals = evaluations.filter((e) => e.patientId === patient.id);
  const assignedFacultyIds = assignedFaculty.map((f) => f.id);

  const allEvaluated =
    assignedFacultyIds.length > 0
      ? assignedFacultyIds.every((fId) => patientEvals.some((e) => e.facultyId === fId))
      : patientEvals.length > 0;

  // Day comparison
  if (activeDay > patient.day) {
    if (allEvaluated) {
      return {
        status: 'VALUTATO',
        text: 'VALUTATO',
        badgeClass: 'bg-emerald-500 text-black font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded shadow',
        dotColor: 'bg-emerald-400',
        isFlashing: false,
      };
    } else {
      return {
        status: 'DA_VALUTARE',
        text: 'DA VALUTARE',
        badgeClass: 'bg-yellow-400 text-black font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded animate-pulse shadow',
        dotColor: 'bg-yellow-300 animate-ping',
        isFlashing: true,
      };
    }
  }

  if (activeDay < patient.day) {
    return {
      status: 'DA_FARE',
      text: 'DA FARE',
      badgeClass: 'bg-neutral-800 text-neutral-400 border border-neutral-700 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded',
      dotColor: 'bg-neutral-500',
      isFlashing: false,
    };
  }

  // Same day check
  const daySlots = INITIAL_TIMELINE_SLOTS.filter((s) => s.day === patient.day);
  const slotIndex = daySlots.findIndex((slot) => {
    if (!slot.groupActivities) return false;
    return Object.values(slot.groupActivities).some(
      (act: any) => act && act.patientIds && act.patientIds.includes(patient.id)
    );
  });

  if (slotIndex === -1) {
    // Fallback estimate
    if (activeSlotIndex > 5) {
      if (allEvaluated) {
        return {
          status: 'VALUTATO',
          text: 'VALUTATO',
          badgeClass: 'bg-emerald-500 text-black font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded shadow',
          dotColor: 'bg-emerald-400',
          isFlashing: false,
        };
      }
      return {
        status: 'DA_VALUTARE',
        text: 'DA VALUTARE',
        badgeClass: 'bg-yellow-400 text-black font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded animate-pulse shadow',
        dotColor: 'bg-yellow-300 animate-ping',
        isFlashing: true,
      };
    }
    if (activeSlotIndex >= 2) {
      return {
        status: 'IN_CORSO',
        text: 'IN CORSO',
        badgeClass: 'bg-red-600 text-white font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded animate-pulse shadow',
        dotColor: 'bg-red-500 animate-ping',
        isFlashing: true,
      };
    }
    return {
      status: 'DA_FARE',
      text: 'DA FARE',
      badgeClass: 'bg-neutral-800 text-neutral-400 border border-neutral-700 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded',
      dotColor: 'bg-neutral-500',
      isFlashing: false,
    };
  }

  // slotIndex is execution slot
  // Preallerta is slotIndex - 1, Debriefing is slotIndex + 1
  if (activeSlotIndex < slotIndex - 1) {
    return {
      status: 'DA_FARE',
      text: 'DA FARE',
      badgeClass: 'bg-neutral-800 text-neutral-400 border border-neutral-700 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded',
      dotColor: 'bg-neutral-500',
      isFlashing: false,
    };
  } else if (activeSlotIndex >= slotIndex - 1 && activeSlotIndex <= slotIndex + 1) {
    return {
      status: 'IN_CORSO',
      text: 'IN CORSO',
      badgeClass: 'bg-red-600 text-white font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded animate-pulse shadow',
      dotColor: 'bg-red-500 animate-ping',
      isFlashing: true,
    };
  } else {
    // After debriefing
    if (allEvaluated) {
      return {
        status: 'VALUTATO',
        text: 'VALUTATO',
        badgeClass: 'bg-emerald-500 text-black font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded shadow',
        dotColor: 'bg-emerald-400',
        isFlashing: false,
      };
    } else {
      return {
        status: 'DA_VALUTARE',
        text: 'DA VALUTARE',
        badgeClass: 'bg-yellow-400 text-black font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded animate-pulse shadow',
        dotColor: 'bg-yellow-300 animate-ping',
        isFlashing: true,
      };
    }
  }
};

/**
 * Determines whether a timeline slot corresponds to a TCCC pre-alert phase
 * (T -15 minutes window before the scenario start).
 */
export const isPreAllertaTcccSlot = (slot: TimelineSlot | null | undefined): boolean => {
  if (!slot) return false;
  const slotId = (slot.id || '').toLowerCase();
  const slotTitle = (slot.title || '').toLowerCase();
  const slotDesc = (slot.description || '').toLowerCase();

  const isPreAlert =
    slotId.includes('prealert') ||
    slotId.includes('pre-alert') ||
    slotTitle.includes('pre-alert') ||
    slotTitle.includes('pre-allerta') ||
    slotTitle.includes('preallerta') ||
    slotDesc.includes('pre-allerta') ||
    slotDesc.includes('preallerta') ||
    slotDesc.includes('pre-alert');

  if (!isPreAlert) {
    // Check group activities directly for PRE-ALLERTA TCCC
    const acts = slot.groupActivities || {};
    return (Object.values(acts) as (GroupActivitySlot | undefined)[]).some((act) => {
      if (!act) return false;
      const actTitle = (act.title || '').toLowerCase();
      const actSub = (act.subtitle || '').toLowerCase();
      return (
        (actTitle.includes('pre-allerta') || actTitle.includes('preallerta') || actTitle.includes('pre-alert')) &&
        (actTitle.includes('tccc') || actSub.includes('tccc'))
      );
    });
  }

  // If it has pre-alert in title/id/desc, check if it refers to TCCC
  if (
    slotId.includes('tccc') ||
    slotTitle.includes('tccc') ||
    slotDesc.includes('tccc') ||
    slotDesc.includes('ambienti tattici') ||
    slotDesc.includes('ambiente tattico')
  ) {
    return true;
  }

  const acts = slot.groupActivities || {};
  return (Object.values(acts) as (GroupActivitySlot | undefined)[]).some((act) => {
    if (!act) return false;
    const actTitle = (act.title || '').toLowerCase();
    const actSub = (act.subtitle || '').toLowerCase();
    const actLoc = (act.location || '').toLowerCase();
    return (
      actTitle.includes('tccc') ||
      actSub.includes('tccc') ||
      actLoc.includes('tattic')
    );
  });
};

/**
 * Returns incoming scenario details for a TCCC pre-alert slot
 */
export const getIncomingTcccScenarioDetails = (
  slot: TimelineSlot | null | undefined,
  allSlots: TimelineSlot[] = INITIAL_TIMELINE_SLOTS
) => {
  if (!slot) return null;
  const idx = allSlots.findIndex((s) => s.id === slot.id);
  // Find next scenario slot after current
  let nextScenario: TimelineSlot | null = null;
  if (idx !== -1) {
    for (let i = idx + 1; i < allSlots.length; i++) {
      const s = allSlots[i];
      if (s.day === slot.day && isScenarioSlot(s)) {
        nextScenario = s;
        break;
      }
    }
  }

  // Target group entering TCCC
  let tcccGroup = 'ALPHA (DISC-01 – DISC-15)';
  let station = 'Ambienti Tattici 1, 2, 3';
  if (slot.groupActivities) {
    for (const [grp, act] of Object.entries(slot.groupActivities)) {
      if (act) {
        const text = `${act.title} ${act.subtitle || ''} ${act.location || ''}`.toLowerCase();
        if (text.includes('tccc') || text.includes('tattic')) {
          tcccGroup =
            grp === 'A'
              ? 'ALPHA (DISC-01 – DISC-15)'
              : grp === 'B'
              ? 'BRAVO (DISC-16 – DISC-30)'
              : grp === 'C'
              ? 'CHARLIE (DISC-31 – DISC-45)'
              : 'DELTA (DISC-46 – DISC-60)';
          if (act.location) station = act.location;
          break;
        }
      }
    }
  }

  return {
    nextScenarioTitle: nextScenario?.title || 'Scenario TCCC Under Fire',
    nextScenarioTime: nextScenario?.timeRange?.split('-')[0]?.trim() || slot.timeRange?.split('-')[1]?.trim() || '09:00',
    tcccGroup,
    station,
  };
};
