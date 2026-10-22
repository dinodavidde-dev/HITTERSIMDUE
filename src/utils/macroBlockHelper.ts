import { GroupType, TimelineSlot } from '../types';

export const MACRO_BLOCK_START_IDS = [
  // Day 1 / Day 2 Course
  'd2-b1-tccc',
  'd2-b2-tccc',
  'd2-b3-tccc',
  'd2-b4-tccc',
  // Day 2 / Day 3 Course
  'd3-b1-tccc',
  'd3-b2-tccc',
  'd3-b3-tccc',
  'd3-b4-tccc',
];

export interface MacroBlockInfo {
  isMacroBlock: boolean;
  blockNumber: 1 | 2 | 3 | 4 | null;
  blockTitle: string;
  slotId: string;
}

/**
 * Checks if a slot marks the beginning of one of the 4 rotational 90-minute macro-blocks.
 */
export function getMacroBlockInfo(slotOrId: TimelineSlot | { id: string; title?: string } | string): MacroBlockInfo {
  const slotId = typeof slotOrId === 'string' ? slotOrId : slotOrId.id;
  const title = typeof slotOrId === 'string' ? '' : slotOrId.title || '';

  // Check by specific canonical ID
  if (slotId === 'd2-b1-tccc' || slotId === 'd3-b1-tccc' || title.includes('BLOCCO 1 • Avvio') || title.includes('BLOCK 1 • Start')) {
    return { isMacroBlock: true, blockNumber: 1, blockTitle: 'BLOCCO 1 (Rotazione Clinica 90 min)', slotId };
  }
  if (slotId === 'd2-b2-tccc' || slotId === 'd3-b2-tccc' || title.includes('BLOCCO 2 • Avvio') || title.includes('BLOCK 2 • Start')) {
    return { isMacroBlock: true, blockNumber: 2, blockTitle: 'BLOCCO 2 (Rotazione Clinica 90 min)', slotId };
  }
  if (slotId === 'd2-b3-tccc' || slotId === 'd3-b3-tccc' || title.includes('BLOCCO 3 • Avvio') || title.includes('BLOCK 3 • Start')) {
    return { isMacroBlock: true, blockNumber: 3, blockTitle: 'BLOCCO 3 (Rotazione Clinica 90 min)', slotId };
  }
  if (slotId === 'd2-b4-tccc' || slotId === 'd3-b4-tccc' || title.includes('BLOCCO 4 • Avvio') || title.includes('BLOCK 4 • Start')) {
    return { isMacroBlock: true, blockNumber: 4, blockTitle: 'BLOCCO 4 (Rotazione Clinica 90 min)', slotId };
  }

  return { isMacroBlock: false, blockNumber: null, blockTitle: '', slotId };
}

export interface GroupStationSummary {
  group: GroupType;
  activityTitle: string;
  activitySubtitle: string;
  location: string;
  facultyInvolved?: string[];
  patientIds?: number[];
}

/**
 * Extracts clean station allocations for each of the 4 groups for the given macro-block slot.
 */
export function getMacroBlockStationAllocations(slot: TimelineSlot): GroupStationSummary[] {
  const groups: GroupType[] = ['A', 'B', 'C', 'D'];
  return groups.map((grp) => {
    const act = slot.groupActivities?.[grp];
    return {
      group: grp,
      activityTitle: act?.title || 'Standby Postazione',
      activitySubtitle: act?.subtitle || 'In attesa di assegnazione',
      location: act?.location || 'Area Addestrativa',
      facultyInvolved: act && 'facultyInvolved' in act ? act.facultyInvolved : undefined,
      patientIds: act && 'patientIds' in act ? act.patientIds : undefined,
    };
  });
}
