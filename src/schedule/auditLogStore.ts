import { db, type AuditEntry, type ScheduleSnapshot } from '../offline/db';
import { type TimelineSlot } from '../types';

export async function logAuditAction(
  action: AuditEntry['action'],
  target: string,
  user: string = 'REGIA-01',
  options: {
    before?: unknown;
    after?: unknown;
    reason?: string;
    synced?: boolean;
  } = {}
): Promise<AuditEntry> {
  const entry: AuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    user,
    action,
    target,
    before: options.before,
    after: options.after,
    reason: options.reason || '',
    synced: options.synced ?? navigator.onLine,
  };

  await db.auditLog.add(entry);
  return entry;
}

export async function fetchAuditLogs(filter?: {
  action?: AuditEntry['action'];
  user?: string;
}): Promise<AuditEntry[]> {
  let collection = db.auditLog.toCollection();

  if (filter?.action) {
    collection = db.auditLog.where('action').equals(filter.action);
  }

  const logs = await collection.reverse().sortBy('timestamp');

  if (filter?.user) {
    const u = filter.user.toLowerCase();
    return logs.filter((l) => l.user.toLowerCase().includes(u));
  }

  return logs;
}

/**
 * Salva uno snapshot dello stato del cronoprogramma prima di applicare una modifica.
 */
export async function saveScheduleSnapshot(
  slots: TimelineSlot[],
  description: string
): Promise<string> {
  const id = `snap-${Date.now()}`;
  const snapshot: ScheduleSnapshot = {
    id,
    timestamp: Date.now(),
    description,
    slots,
  };

  await db.scheduleSnapshots.add(snapshot);

  // Mantieni al massimo gli ultimi 15 snapshot per evitare accumulo
  const allSnapshots = await db.scheduleSnapshots.orderBy('timestamp').toArray();
  if (allSnapshots.length > 15) {
    const toDelete = allSnapshots.slice(0, allSnapshots.length - 15);
    await Promise.all(toDelete.map((s) => db.scheduleSnapshots.delete(s.id)));
  }

  return id;
}

/**
 * Recupera l'ultimo snapshot valido salvato.
 */
export async function getLastSnapshot(): Promise<ScheduleSnapshot | null> {
  const latest = await db.scheduleSnapshots.orderBy('timestamp').last();
  return latest || null;
}
