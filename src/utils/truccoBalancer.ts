import {
  CourseActor,
  CourseDay,
  MakeupArtist,
  SimulatorPatient,
} from '../types';
import {
  OPERATIONAL_BLOCKS_BY_DAY,
  OperationalBlockMeta,
  getStationIndexForPatientId,
} from '../data/protesiCatalog';

export interface RebalancedTruccoResult {
  updatedActors: CourseActor[];
  updatedPatients: SimulatorPatient[];
}

export interface ArtistWorkloadStat {
  artist: MakeupArtist;
  pairedActors: CourseActor[];
  day2PrimaryCount: number;
  day2JollyCount: number;
  day3PrimaryCount: number;
  day3JollyCount: number;
  totalPrimaryScenarios: number;
  totalJollyBlocks: number;
  loadPercentage: number; // relative to ideal target
}

export interface ArtistTimelineBlockSlot {
  blockMeta: OperationalBlockMeta;
  roleType: 'STATION_PRIMARY' | 'JOLLY_SUPPORT';
  stationIndex?: 1 | 2 | 3;
  patient?: SimulatorPatient;
  assignedActor?: CourseActor;
  jollyCoAssistant?: MakeupArtist;
  // When roleType === 'JOLLY_SUPPORT':
  jollySupportPatient?: SimulatorPatient;
  jollySupportActor?: CourseActor;
  jollySupportPrimaryArtist?: MakeupArtist;
  nextBlockPrePrepPatients: SimulatorPatient[];
}

export const requiresAmputeeActor = (patient: SimulatorPatient): boolean => {
  const text = `${patient.lesioni.join(' ')} ${patient.moulageProtesi} ${
    patient.attoreDettagli || ''
  }`.toLowerCase();
  return text.includes('amputa') || text.includes('moncone');
};

/**
 * Dynamically rebalances the workload across ANY number of Makeup Artists (base 4)
 * and ANY number of Actors (base 8) so that:
 * 1. Actors are paired homogeneously to Makeup Artists (e.g. 8 actors / 4 artists = 2 actors each; Δ <= 1).
 * 2. Across Day 2 and Day 3 (4 blocks of 3 stations per day = 12 scenarios/day):
 *    - Station 1, 2, 3 holders rotate with the Jolly artist(s) so every Makeup Artist
 *      handles an equal number of primary scenarios (Δ <= 1) and zero artist is double-booked in the same block.
 *    - Actors are assigned without same-block conflicts, matching AMPUTATO actors to amputation scenarios first
 *      and distributing scenario counts evenly across all actors (Δ <= 1).
 */
export function computeHomogeneousTruccoDistribution(
  actors: CourseActor[],
  makeupArtists: MakeupArtist[],
  patients: SimulatorPatient[]
): RebalancedTruccoResult {
  if (actors.length === 0 || makeupArtists.length === 0) {
    return { updatedActors: actors, updatedPatients: patients };
  }

  const sortedArtists = [...makeupArtists].sort((a, b) =>
    a.badgeCode.localeCompare(b.badgeCode, undefined, { numeric: true })
  );

  // Step 1: Distribute actors homogeneously across makeup artists (Amputees first, then Full-Body)
  const amputeeActors = [...actors]
    .filter((a) => a.physicalStatus === 'AMPUTATO')
    .sort((a, b) => a.slotNumber - b.slotNumber);
  const fullBodyActors = [...actors]
    .filter((a) => a.physicalStatus === 'INTERO')
    .sort((a, b) => a.slotNumber - b.slotNumber);

  const orderedActorsForPairing = [...amputeeActors, ...fullBodyActors];
  const actorArtistMap = new Map<string, string>();

  orderedActorsForPairing.forEach((actor, idx) => {
    const targetArtist = sortedArtists[idx % sortedArtists.length];
    actorArtistMap.set(actor.id, targetArtist.id);
  });

  const updatedActors: CourseActor[] = actors.map((actor) => ({
    ...actor,
    assignedMakeupArtistId:
      actorArtistMap.get(actor.id) || sortedArtists[0].id,
  }));

  // Step 2: Balance the 24 scenarios across Day 2 and Day 3
  const artistTotalPrimaryCount = new Map<string, number>();
  const artistDayPrimaryCount = new Map<string, number>();
  sortedArtists.forEach((art) => {
    artistTotalPrimaryCount.set(art.id, 0);
    artistDayPrimaryCount.set(art.id, 0);
  });

  const actorTotalCount = new Map<string, number>();
  const actorDayCount = new Map<string, number>();
  updatedActors.forEach((act) => {
    actorTotalCount.set(act.id, 0);
    actorDayCount.set(act.id, 0);
  });

  const patientAssignments = new Map<
    number,
    { assignedActorId: string; assignedMakeupArtistId: string }
  >();

  // Preferred fixed station (1, 2, or 3) for the first 3 makeup artists
  const preferredStationByArtistId = new Map<string, 1 | 2 | 3>();
  if (sortedArtists[0]) preferredStationByArtistId.set(sortedArtists[0].id, 1);
  if (sortedArtists[1]) preferredStationByArtistId.set(sortedArtists[1].id, 2);
  if (sortedArtists[2]) preferredStationByArtistId.set(sortedArtists[2].id, 3);

  ([2, 3] as CourseDay[]).forEach((day) => {
    sortedArtists.forEach((art) => artistDayPrimaryCount.set(art.id, 0));
    updatedActors.forEach((act) => actorDayCount.set(act.id, 0));

    const dayBlocks = OPERATIONAL_BLOCKS_BY_DAY[day] || [];

    dayBlocks.forEach((blockMeta, blockIdx) => {
      const blockPatients = blockMeta.patientIds
        .map((pid) => patients.find((p) => p.id === pid))
        .filter((p): p is SimulatorPatient => Boolean(p));

      // 2A. Pick 3 distinct Makeup Artists for the 3 stations in this block
      // Using least-loaded first + deterministic rotation offset so with 4 artists:
      // Block 1 rests TRUC-04 (Jolly), Block 2 rests TRUC-02 (Jolly), Block 3 rests TRUC-01 (Jolly), Block 4 rests TRUC-03 (Jolly)
      const jollyRotationOrder = [3, 1, 0, 2]; // index of artist on Jolly duty when N=4
      const targetJollyIdx =
        sortedArtists.length === 4
          ? jollyRotationOrder[blockIdx % 4]
          : -1;

      const candidateArtists = [...sortedArtists].sort((a, b) => {
        if (sortedArtists.length === 4) {
          const aIsJolly = sortedArtists.indexOf(a) === targetJollyIdx ? 1 : 0;
          const bIsJolly = sortedArtists.indexOf(b) === targetJollyIdx ? 1 : 0;
          if (aIsJolly !== bIsJolly) return aIsJolly - bIsJolly;
        }
        const dayDiff =
          (artistDayPrimaryCount.get(a.id) || 0) -
          (artistDayPrimaryCount.get(b.id) || 0);
        if (dayDiff !== 0) return dayDiff;
        const totDiff =
          (artistTotalPrimaryCount.get(a.id) || 0) -
          (artistTotalPrimaryCount.get(b.id) || 0);
        if (totDiff !== 0) return totDiff;
        return (
          ( sortedArtists.indexOf(a) + blockIdx ) % sortedArtists.length -
          ( sortedArtists.indexOf(b) + blockIdx ) % sortedArtists.length
        );
      });

      const activeBlockArtists: MakeupArtist[] = [];
      for (let i = 0; i < Math.min(3, candidateArtists.length); i++) {
        activeBlockArtists.push(candidateArtists[i]);
      }
      while (activeBlockArtists.length < 3 && sortedArtists.length > 0) {
        activeBlockArtists.push(
          sortedArtists[activeBlockArtists.length % sortedArtists.length]
        );
      }

      // Map the 3 chosen artists to Station 1, Station 2, Station 3 preserving fixed station holders where possible
      const stationArtistMap = new Map<1 | 2 | 3, MakeupArtist>();
      const unassignedArtists: MakeupArtist[] = [];

      activeBlockArtists.forEach((art) => {
        const pref = preferredStationByArtistId.get(art.id);
        if (pref && !stationArtistMap.has(pref)) {
          stationArtistMap.set(pref, art);
        } else {
          unassignedArtists.push(art);
        }
      });

      ([1, 2, 3] as const).forEach((stIdx) => {
        if (!stationArtistMap.has(stIdx)) {
          const nextArt = unassignedArtists.shift() || sortedArtists[0];
          stationArtistMap.set(stIdx, nextArt);
        }
      });

      // 2B. Assign Actors to the 3 patients in this block (amputation scenarios first)
      const usedActorIdsInBlock = new Set<string>();
      const sortedBlockPatients = [...blockPatients].sort((pA, pB) => {
        const ampA = requiresAmputeeActor(pA) ? 0 : 1;
        const ampB = requiresAmputeeActor(pB) ? 0 : 1;
        if (ampA !== ampB) return ampA - ampB;
        return pA.id - pB.id;
      });

      sortedBlockPatients.forEach((pt) => {
        const stIdx = getStationIndexForPatientId(pt.id);
        const stationArtist = stationArtistMap.get(stIdx) || sortedArtists[0];
        const needsAmp = requiresAmputeeActor(pt);

        const pool = updatedActors.filter((act) => {
          if (usedActorIdsInBlock.size < updatedActors.length) {
            if (usedActorIdsInBlock.has(act.id)) return false;
          }
          if (needsAmp) return act.physicalStatus === 'AMPUTATO';
          return act.physicalStatus === 'INTERO';
        });

        const fallbackPool =
          pool.length > 0
            ? pool
            : updatedActors.filter(
                (act) =>
                  usedActorIdsInBlock.size >= updatedActors.length ||
                  !usedActorIdsInBlock.has(act.id)
              );

        const finalCandidates =
          fallbackPool.length > 0 ? fallbackPool : updatedActors;

        finalCandidates.sort((a, b) => {
          const totDiff =
            (actorTotalCount.get(a.id) || 0) - (actorTotalCount.get(b.id) || 0);
          if (totDiff !== 0) return totDiff;
          const dayDiff =
            (actorDayCount.get(a.id) || 0) - (actorDayCount.get(b.id) || 0);
          if (dayDiff !== 0) return dayDiff;
          // Prefer actor paired with this station's makeup artist
          const aPaired = a.assignedMakeupArtistId === stationArtist.id ? 0 : 1;
          const bPaired = b.assignedMakeupArtistId === stationArtist.id ? 0 : 1;
          if (aPaired !== bPaired) return aPaired - bPaired;
          return a.slotNumber - b.slotNumber;
        });

        const chosenActor = finalCandidates[0];
        usedActorIdsInBlock.add(chosenActor.id);

        actorTotalCount.set(
          chosenActor.id,
          (actorTotalCount.get(chosenActor.id) || 0) + 1
        );
        actorDayCount.set(
          chosenActor.id,
          (actorDayCount.get(chosenActor.id) || 0) + 1
        );

        artistTotalPrimaryCount.set(
          stationArtist.id,
          (artistTotalPrimaryCount.get(stationArtist.id) || 0) + 1
        );
        artistDayPrimaryCount.set(
          stationArtist.id,
          (artistDayPrimaryCount.get(stationArtist.id) || 0) + 1
        );

        patientAssignments.set(pt.id, {
          assignedActorId: chosenActor.id,
          assignedMakeupArtistId: stationArtist.id,
        });
      });
    });
  });

  const updatedPatients: SimulatorPatient[] = patients.map((p) => {
    const assignment = patientAssignments.get(p.id);
    if (!assignment) return p;
    return {
      ...p,
      assignedActorId: assignment.assignedActorId,
      assignedMakeupArtistId: assignment.assignedMakeupArtistId,
    };
  });

  return { updatedActors, updatedPatients };
}

/**
 * Builds the 4-block personalized timeline for a single Makeup Artist on a given day (Day 2 or Day 3),
 * identifying whether the artist is a primary Tactical Station holder (1-3) or in Jolly / Pre-Prep role.
 */
export function buildPersonalizedArtistTimeline(
  artist: MakeupArtist,
  allArtists: MakeupArtist[],
  actors: CourseActor[],
  patients: SimulatorPatient[],
  day: CourseDay
): ArtistTimelineBlockSlot[] {
  const dayBlocks = OPERATIONAL_BLOCKS_BY_DAY[day] || [];

  return dayBlocks.map((blockMeta, idx) => {
    const blockPatients = patients.filter((p) =>
      blockMeta.patientIds.includes(p.id)
    );
    const nextBlockMeta = dayBlocks[idx + 1];
    const nextBlockPrePrepPatients = nextBlockMeta
      ? patients.filter((p) => nextBlockMeta.patientIds.includes(p.id))
      : [];

    // Check if this artist is assigned as primary on one of the 3 patients in this block
    const primaryPatient = blockPatients.find(
      (p) => p.assignedMakeupArtistId === artist.id
    );

    // Find which artists are NOT assigned as primary in this block (Jolly artists for this block)
    const activePrimaryArtistIds = new Set(
      blockPatients.map((p) => p.assignedMakeupArtistId)
    );
    const jollyArtistsInBlock = allArtists.filter(
      (a) => !activePrimaryArtistIds.has(a.id)
    );

    // Find the highest-complexity patient in this block (amputee scenario or multi-actor) for Jolly support
    const complexSupportTarget =
      blockPatients.find((p) => {
        const act = actors.find((a) => a.id === p.assignedActorId);
        return act?.physicalStatus === 'AMPUTATO' || requiresAmputeeActor(p);
      }) || blockPatients[blockPatients.length - 1];

    if (primaryPatient) {
      const stIdx = getStationIndexForPatientId(primaryPatient.id);
      const assignedActor =
        actors.find((a) => a.id === primaryPatient.assignedActorId) || actors[0];
      const isSupportedByJolly =
        complexSupportTarget?.id === primaryPatient.id &&
        jollyArtistsInBlock.length > 0;

      return {
        blockMeta,
        roleType: 'STATION_PRIMARY',
        stationIndex: stIdx,
        patient: primaryPatient,
        assignedActor,
        jollyCoAssistant: isSupportedByJolly ? jollyArtistsInBlock[0] : undefined,
        nextBlockPrePrepPatients,
      };
    }

    // Otherwise, this artist is on JOLLY_SUPPORT & PRE-PREP duty during this block
    const supportActor =
      actors.find((a) => a.id === complexSupportTarget?.assignedActorId) ||
      actors[0];
    const supportPrimaryArtist = allArtists.find(
      (a) => a.id === complexSupportTarget?.assignedMakeupArtistId
    );

    return {
      blockMeta,
      roleType: 'JOLLY_SUPPORT',
      jollySupportPatient: complexSupportTarget,
      jollySupportActor: supportActor,
      jollySupportPrimaryArtist: supportPrimaryArtist,
      nextBlockPrePrepPatients,
    };
  });
}

/**
 * Computes live workload statistics for every Makeup Artist across Day 2 and Day 3.
 */
export function getArtistWorkloadStats(
  makeupArtists: MakeupArtist[],
  actors: CourseActor[],
  patients: SimulatorPatient[]
): ArtistWorkloadStat[] {
  const idealScenariosPerArtist =
    makeupArtists.length > 0 ? 24 / makeupArtists.length : 6;

  return makeupArtists.map((artist) => {
    const pairedActors = actors.filter(
      (a) => a.assignedMakeupArtistId === artist.id
    );
    const d2Timeline = buildPersonalizedArtistTimeline(
      artist,
      makeupArtists,
      actors,
      patients,
      2
    );
    const d3Timeline = buildPersonalizedArtistTimeline(
      artist,
      makeupArtists,
      actors,
      patients,
      3
    );

    const day2PrimaryCount = d2Timeline.filter(
      (s) => s.roleType === 'STATION_PRIMARY'
    ).length;
    const day2JollyCount = d2Timeline.filter(
      (s) => s.roleType === 'JOLLY_SUPPORT'
    ).length;
    const day3PrimaryCount = d3Timeline.filter(
      (s) => s.roleType === 'STATION_PRIMARY'
    ).length;
    const day3JollyCount = d3Timeline.filter(
      (s) => s.roleType === 'JOLLY_SUPPORT'
    ).length;

    const totalPrimaryScenarios = day2PrimaryCount + day3PrimaryCount;
    const totalJollyBlocks = day2JollyCount + day3JollyCount;
    const loadPercentage = Math.min(
      100,
      Math.round((totalPrimaryScenarios / Math.max(1, idealScenariosPerArtist)) * 100)
    );

    return {
      artist,
      pairedActors,
      day2PrimaryCount,
      day2JollyCount,
      day3PrimaryCount,
      day3JollyCount,
      totalPrimaryScenarios,
      totalJollyBlocks,
      loadPercentage,
    };
  });
}
