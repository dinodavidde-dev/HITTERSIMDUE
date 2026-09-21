import { SimulatorPatient, TeamEvaluation, Faculty } from '../types';
import { INITIAL_TIMELINE_SLOTS } from '../data/initialData';

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
