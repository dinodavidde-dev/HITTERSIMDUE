import { type TimelineSlot } from '../types';
import { type SlotChangeProposal } from './scheduleValidator';
import { saveScheduleSnapshot, getLastSnapshot, logAuditAction } from './auditLogStore';
import { enqueueOfflineAction } from '../offline/syncQueue';
import { db } from '../offline/db';

export function formatTimeRange(startMinutes: number, durationMinutes: number): string {
  const startH = Math.floor(startMinutes / 60);
  const startM = startMinutes % 60;
  const endMinutes = startMinutes + durationMinutes;
  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;

  return `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')} - ${String(endH).padStart(
    2,
    '0'
  )}:${String(endM).padStart(2, '0')}`;
}

export interface ApplyScheduleChangeResult {
  success: boolean;
  newSlots?: TimelineSlot[];
  updatedSlots: TimelineSlot[];
  snapshotId: string;
  description: string;
  issues?: string[];
}

/**
 * Applica una modifica a uno slot e ricalcola a cascata gli orari successivi del medesimo giorno.
 */
export async function applyScheduleChange(
  proposal: SlotChangeProposal,
  currentSlots: TimelineSlot[],
  user: string = 'REGIA-01',
  contextNote?: string
): Promise<ApplyScheduleChangeResult> {
  const targetIndex = currentSlots.findIndex((s) => s.id === proposal.slotId);
  if (targetIndex === -1) {
    return {
      success: false,
      updatedSlots: currentSlots,
      snapshotId: '',
      description: `Slot non trovato: ${proposal.slotId}`,
      issues: [`Slot non trovato: ${proposal.slotId}`],
    };
  }

  const target = currentSlots[targetIndex];

  // 1. Salva snapshot dello stato precedente per rollback immediato
  const description = `${proposal.deltaMinutes > 0 ? 'Estensione +' : 'Riduzione '}${proposal.deltaMinutes}m per "${
    target.title
  }" (${target.timeRange || target.time})`;

  const snapshotId = await saveScheduleSnapshot(currentSlots, description);

  // 2. Calcola la variazione a cascata
  const newDuration = Math.max(5, target.durationMinutes + proposal.deltaMinutes);

  const updatedSlots = currentSlots.map((s) => {
    if (s.day !== target.day) return s;

    if (s.id === target.id) {
      const formatted = formatTimeRange(s.startMinutes, newDuration);
      return {
        ...s,
        durationMinutes: newDuration,
        time: formatted,
        timeRange: formatted,
      };
    }

    // Se lo slot è successivo cronologicamente nel medesimo giorno, trasla in avanti/indietro
    if (s.startMinutes > target.startMinutes) {
      const newStart = s.startMinutes + proposal.deltaMinutes;
      const formatted = formatTimeRange(newStart, s.durationMinutes);
      return {
        ...s,
        startMinutes: newStart,
        time: formatted,
        timeRange: formatted,
      };
    }

    return s;
  });

  // Salva in cache IndexedDB locale
  try {
    await db.cachedSlots.clear();
    await db.cachedSlots.bulkPut(updatedSlots);
  } catch (err) {
    console.warn('Errore salvataggio cachedSlots IndexedDB:', err);
  }

  // 3. Registra su Audit Log locale
  await logAuditAction(proposal.deltaMinutes >= 0 ? 'extend' : 'reduce', target.title, user, {
    before: { duration: target.durationMinutes, timeRange: target.timeRange },
    after: { duration: newDuration, timeRange: formatTimeRange(target.startMinutes, newDuration) },
    reason: proposal.reason || contextNote || 'Modifica manuale autorizzata dalla Regia',
    synced: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  // 4. Se offline, accoda nella syncQueue
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    await enqueueOfflineAction(
      'intent_schedule_change',
      {
        slotId: proposal.slotId,
        deltaMinutes: proposal.deltaMinutes,
        reason: proposal.reason,
        impactSummary: description,
      },
      user
    );
  }

  return {
    success: true,
    newSlots: updatedSlots,
    updatedSlots,
    snapshotId,
    description,
  };
}

/**
 * Esegue il rollback ripristinando lo stato del cronoprogramma da snapshot.
 */
export async function rollbackLastScheduleChange(
  user: string = 'REGIA-01'
): Promise<TimelineSlot[] | null> {
  const lastSnap = await getLastSnapshot();
  if (!lastSnap || !lastSnap.slots || lastSnap.slots.length === 0) return null;

  const restoredSlots: TimelineSlot[] = lastSnap.slots;

  try {
    await db.cachedSlots.clear();
    await db.cachedSlots.bulkPut(restoredSlots);
  } catch (err) {
    console.warn('Errore ripristino cachedSlots:', err);
  }

  await logAuditAction('rollback', lastSnap.description, user, {
    reason: 'Rollback manuale autorizzato dalla Regia (entro finestra 60s o da audit log)',
    synced: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  return restoredSlots;
}
