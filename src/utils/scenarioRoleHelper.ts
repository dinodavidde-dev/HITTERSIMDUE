import { Discente, GroupType, ScenarioType, TimelineSlot } from '../types';
import { Firestore, collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';

export const TCCC_ROLE_PRESETS = [
  'Team Leader TCCC & Comunicazioni',
  'Stop The Bleed / Tourniquet & Emostasi',
  'Gestione Vie Aeree & Cricotiroidotomia',
  'Decompressione Toracica & Medicazioni',
  'Barellamento, Evacuazione & Packaging',
];

export const SHOCKROOM_ROLE_PRESETS = [
  'Team Leader Trauma / Primary Survey (ABCDE)',
  'Vie Aeree Avanzate & Intubazione',
  'Circolazione / Accessi Vascolari & Sangue',
  'Ecografia FAST / e-FAST & Decompressione',
  'Scribe / Farmaci & Monitoraggio Parametri',
];

/**
 * Modern Fisher-Yates array shuffle
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a randomized, unique distribution of the 5 scenario roles among 5 team discenti
 */
export function generateRandomScenarioRoleAssignments(
  discenti: Discente[],
  scenarioType: 'TCCC' | 'SHOCKROOM',
  slotId?: string,
  assignedByFacultyBadge = 'AUTO_RANDOM_T15'
) {
  const presets = scenarioType === 'TCCC' ? TCCC_ROLE_PRESETS : SHOCKROOM_ROLE_PRESETS;
  const shuffledRoles = shuffleArray(presets);

  return discenti.map((d, index) => {
    const role = shuffledRoles[index % shuffledRoles.length];
    return {
      discenteId: d.id,
      role,
      scenarioType: scenarioType as ScenarioType,
      slotId: slotId || `Auto-Random ${scenarioType} T-15`,
      assignedByFacultyBadge,
    };
  });
}

/**
 * Checks whether a slot represents a T-15 Pre-Allerta window for a specific group
 */
export function detectPreAllertaForGroup(
  slot: TimelineSlot | null | undefined,
  group: GroupType
): { isPreAllerta: boolean; scenarioType: 'TCCC' | 'SHOCKROOM' | null } {
  if (!slot) return { isPreAllerta: false, scenarioType: null };

  const act = slot.groupActivities?.[group];
  if (!act) return { isPreAllerta: false, scenarioType: null };

  const actTitle = (act.title || '').toLowerCase();
  const actSub = (act.subtitle || '').toLowerCase();
  const actLoc = (act.location || '').toLowerCase();
  const groupText = `${actTitle} ${actSub}`;

  const hasPreAlertMarker =
    groupText.includes('pre-alert') ||
    groupText.includes('pre-allerta') ||
    groupText.includes('preallerta') ||
    groupText.includes('t -15') ||
    groupText.includes('t-15');

  if (!hasPreAlertMarker) {
    return { isPreAllerta: false, scenarioType: null };
  }

  const isTCCC =
    groupText.includes('tccc') ||
    groupText.includes('tattic') ||
    actLoc.includes('tattic') ||
    act.activityType === 'scenario_extra';
  const isShock =
    groupText.includes('shock') ||
    groupText.includes('box sr') ||
    groupText.includes('box 1-3') ||
    actLoc.includes('shock') ||
    act.activityType === 'scenario_intra';

  if (isTCCC) return { isPreAllerta: true, scenarioType: 'TCCC' };
  if (isShock) return { isPreAllerta: true, scenarioType: 'SHOCKROOM' };

  return { isPreAllerta: false, scenarioType: null };
}

/**
 * Checks whether a slot represents an active practical scenario (or handover) for a specific group (excluding debriefing and pre-allerta)
 */
export function detectPracticalScenarioForGroup(
  slot: TimelineSlot | null | undefined,
  group: GroupType
): { isScenario: boolean; scenarioType: 'TCCC' | 'SHOCKROOM' | null } {
  if (!slot) return { isScenario: false, scenarioType: null };

  const act = slot.groupActivities?.[group];
  if (!act) return { isScenario: false, scenarioType: null };

  const actTitle = (act.title || '').toLowerCase();
  const actSub = (act.subtitle || '').toLowerCase();
  const groupText = `${actTitle} ${actSub}`;

  if (act.activityType === 'debriefing' || groupText.includes('debriefing')) {
    return { isScenario: false, scenarioType: null };
  }

  // Pre-Allerta (T-15) and Briefing SR (Min 00-15) are preparation windows before active scenario T0
  const isPreAllertaOrBriefing =
    groupText.includes('pre-alert') ||
    groupText.includes('pre-allerta') ||
    groupText.includes('preallerta') ||
    groupText.includes('t -15') ||
    groupText.includes('t-15') ||
    groupText.includes('briefing shock room') ||
    groupText.includes('trasferimento area') ||
    groupText.includes('reset box');

  if (isPreAllertaOrBriefing) {
    return { isScenario: false, scenarioType: null };
  }

  if (act.activityType === 'scenario_extra') return { isScenario: true, scenarioType: 'TCCC' };
  if (act.activityType === 'scenario_intra') return { isScenario: true, scenarioType: 'SHOCKROOM' };

  const isTCCC = groupText.includes('scenario tccc') || groupText.includes('consegna sbar');
  const isShock = groupText.includes('shock room abcde') || groupText.includes('ricezione sbar');

  if (isTCCC) return { isScenario: true, scenarioType: 'TCCC' };
  if (isShock) return { isScenario: true, scenarioType: 'SHOCKROOM' };

  return { isScenario: false, scenarioType: null };
}

export const GROUP_TEAM_IDS: Record<GroupType, number[]> = {
  A: [1, 2, 3],
  B: [4, 5, 6],
  C: [7, 8, 9],
  D: [10, 11, 12],
};

/**
 * Checks all teams entering a scenario in the given slot.
 * If any team did NOT have roles assigned before (i.e. Faculty didn't transmit in Pre-Allerta T-15),
 * automatically assigns unique randomized roles from the standard presets.
 */
export function checkAndAutoAssignMissingRoles(
  discenti: Discente[],
  slot: TimelineSlot | null | undefined,
  assignRolesFn: (
    assignments: {
      discenteId: string;
      role: string;
      scenarioType: ScenarioType;
      slotId?: string;
      assignedByFacultyBadge?: string;
    }[]
  ) => void
): boolean {
  if (!slot) return false;

  const groups: GroupType[] = ['A', 'B', 'C', 'D'];
  let anyAssigned = false;

  for (const grp of groups) {
    const { isScenario, scenarioType } = detectPracticalScenarioForGroup(slot, grp);
    if (!isScenario || !scenarioType) continue;

    const teamIds = GROUP_TEAM_IDS[grp];
    for (const teamId of teamIds) {
      const teamDiscenti = discenti.filter((d) => d.teamId === teamId);
      if (teamDiscenti.length === 0) continue;

      // Check if roles are already assigned and matching current scenario
      const needsAssignment = teamDiscenti.some(
        (d) => !d.activeScenarioRole || d.activeScenarioType !== scenarioType
      );

      if (needsAssignment) {
        const randomAssignments = generateRandomScenarioRoleAssignments(
          teamDiscenti,
          scenarioType,
          slot.title,
          'AUTO_RANDOM_FINE_T15'
        );
        assignRolesFn(randomAssignments);
        anyAssigned = true;
      }
    }
  }

  return anyAssigned;
}

/**
 * Checks whether a slot represents a debriefing phase for a specific group and returns its scenario type (TCCC or SHOCKROOM)
 */
export function detectDebriefingForGroup(
  slot: TimelineSlot | null | undefined,
  group: GroupType
): { isDebriefing: boolean; scenarioType: 'TCCC' | 'SHOCKROOM' | null } {
  if (!slot) return { isDebriefing: false, scenarioType: null };
  const act = slot.groupActivities?.[group];
  if (!act) return { isDebriefing: false, scenarioType: null };

  const actTitle = (act.title || '').toLowerCase();
  const actSub = (act.subtitle || '').toLowerCase();
  const actLoc = (act.location || '').toLowerCase();
  const actType = (act.activityType || '').toLowerCase();
  const groupText = `${actTitle} ${actSub} ${actType}`;

  const isDebrief =
    actType === 'debriefing' ||
    groupText.includes('debriefing') ||
    groupText.includes('plus/delta') ||
    groupText.includes('revisione video');

  if (!isDebrief) {
    return { isDebriefing: false, scenarioType: null };
  }

  // Distinguish between TCCC debriefing and Shock Room debriefing (exclude plenary closing)
  if (groupText.includes('tccc') || groupText.includes('tattic') || actLoc.includes('debriefing')) {
    return { isDebriefing: true, scenarioType: 'TCCC' };
  }
  if (
    groupText.includes('sr') ||
    groupText.includes('shock') ||
    groupText.includes('plus/delta') ||
    groupText.includes('nts') ||
    actLoc.includes('shock')
  ) {
    return { isDebriefing: true, scenarioType: 'SHOCKROOM' };
  }

  return { isDebriefing: false, scenarioType: null };
}

/**
 * Checks whether a slot represents a debriefing or completion phase for a specific group
 */
export function detectDebriefingOrCompletedForGroup(
  slot: TimelineSlot | null | undefined,
  group: GroupType
): boolean {
  if (!slot) return false;
  const act = slot.groupActivities?.[group];
  if (!act) return false;
  const actTitle = (act.title || '').toLowerCase();
  const actSub = (act.subtitle || '').toLowerCase();
  const actType = (act.activityType || '').toLowerCase();
  const combined = `${actTitle} ${actSub} ${actType}`;

  return (
    actType === 'debriefing' ||
    combined.includes('debriefing') ||
    combined.includes('completato') ||
    combined.includes('completed') ||
    combined.includes('plus/delta') ||
    combined.includes('revisione video') ||
    combined.includes('fine blocco') ||
    combined.includes('reset box')
  );
}

export interface CleanupRolesOptions {
  phase?: 'debriefing' | 'completed' | string;
  group?: GroupType;
  teamId?: number;
  all?: boolean;
}

/**
 * Automatically resets the 'assignedRole' field in the Firestore 'discenti' collection
 * once the simulation phase is marked as 'debriefing' or 'completed' to ensure a clean state for the next group.
 */
export async function cleanupDiscentiAssignedRolesInFirestore(
  db: Firestore,
  options: CleanupRolesOptions = {}
): Promise<{ success: boolean; count: number }> {
  try {
    const { phase = 'completed', group, teamId, all } = options;
    const discentiRef = collection(db, 'discenti');
    const targetDocs: { id: string; ref: any }[] = [];

    if (teamId !== undefined) {
      const q = query(discentiRef, where('teamId', '==', teamId));
      const snap = await getDocs(q);
      snap.forEach((d) => targetDocs.push({ id: d.id, ref: d.ref }));
    } else if (group && GROUP_TEAM_IDS[group] && !all) {
      const teamIds = GROUP_TEAM_IDS[group];
      const snap = await getDocs(discentiRef);
      snap.forEach((d) => {
        const data = d.data();
        if (teamIds.includes(Number(data.teamId))) {
          targetDocs.push({ id: d.id, ref: d.ref });
        }
      });
    } else {
      // All discenti
      const snap = await getDocs(discentiRef);
      snap.forEach((d) => targetDocs.push({ id: d.id, ref: d.ref }));
    }

    if (targetDocs.length === 0) {
      return { success: true, count: 0 };
    }

    // Split into chunks of 400 for Firestore batch limits
    const chunkSize = 400;
    for (let i = 0; i < targetDocs.length; i += chunkSize) {
      const chunk = targetDocs.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((item) => {
        batch.set(
          item.ref,
          {
            assignedRole: null,
            activeScenarioRole: null,
            activeScenarioType: null,
            activeScenarioSlotId: null,
            activeScenarioAssignedAt: null,
            activeScenarioAssignedBy: null,
            simulationPhase: phase,
            lastRoleResetTimestamp: new Date().toISOString(),
          },
          { merge: true }
        );
      });
      await batch.commit();
    }

    return { success: true, count: targetDocs.length };
  } catch (err) {
    console.error('Error during cleanupDiscentiAssignedRolesInFirestore:', err);
    return { success: false, count: 0 };
  }
}

