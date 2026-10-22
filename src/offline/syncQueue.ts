import { db, type SyncQueueItem, type ScheduleIntent, type AuditEntry } from './db';

export interface SyncReconciliationReport {
  syncedCount: number;
  pendingIntentsCount: number;
  conflictCount: number;
  conflicts: {
    queueItemId: string;
    itemType: string;
    localPayload: unknown;
    remotePayload: unknown;
    description: string;
  }[];
}

/**
 * Mock API Client for simulated backend communications.
 * Can be swapped with real HTTP endpoints or Firestore RPCs.
 */
export const apiClient = {
  async syncItem(item: SyncQueueItem): Promise<{ success: boolean; conflict?: boolean; remoteData?: unknown }> {
    // Simula latenza di rete minima
    await new Promise((resolve) => setTimeout(resolve, 80));

    // TODO(backend): Sostituire con chiamata REST o RPC Firebase Firestore reale
    // Nel modello specificato:
    // - note / handover: last-write-wins (success: true)
    // - intent_schedule_change: registered on server as intent, does NOT automatically mutate global plan
    if (item.type === 'intent_schedule_change') {
      return { success: true };
    }

    return { success: true };
  },

  async fetchRemoteScheduleTimestamp(): Promise<number> {
    // TODO(backend): Recuperare timestamp revisione cronoprogramma da server
    return Date.now();
  },
};

/**
 * Accoda un'azione offline in IndexedDB.
 */
export async function enqueueOfflineAction(
  type: SyncQueueItem['type'],
  payload: unknown,
  userId: string = 'REGIA-01'
): Promise<SyncQueueItem> {
  const item: SyncQueueItem = {
    id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    createdAt: Date.now(),
    userId,
    status: 'pending',
  };

  await db.syncQueue.add(item);
  return item;
}

/**
 * Elabora la coda offline al ritorno della connettività.
 */
export async function processSyncQueue(): Promise<SyncReconciliationReport> {
  const report: SyncReconciliationReport = {
    syncedCount: 0,
    pendingIntentsCount: 0,
    conflictCount: 0,
    conflicts: [],
  };

  const pendingItems = await db.syncQueue.where('status').equals('pending').sortBy('createdAt');

  for (const item of pendingItems) {
    try {
      await db.syncQueue.update(item.id, { status: 'syncing' });

      if (item.type === 'intent_schedule_change') {
        // Le modifiche al cronoprogramma NON si applicano automaticamente
        // Vengono registrate come intenzioni da verificare/approvare dalla Regia
        const intentPayload = item.payload as any;
        const intent: ScheduleIntent = {
          id: `intent-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: item.createdAt,
          userId: item.userId,
          slotId: intentPayload?.slotId || '',
          deltaMinutes: intentPayload?.deltaMinutes || 0,
          reason: intentPayload?.reason || 'Modifica cronoprogramma registrata offline',
          status: 'pending',
          impactSummary: intentPayload?.impactSummary || `Delta: ${intentPayload?.deltaMinutes > 0 ? '+' : ''}${intentPayload?.deltaMinutes} min`,
        };

        await db.scheduleIntents.add(intent);
        await db.syncQueue.update(item.id, { status: 'done' });
        report.pendingIntentsCount++;
        report.syncedCount++;
        continue;
      }

      const res = await apiClient.syncItem(item);

      if (res.conflict) {
        await db.syncQueue.update(item.id, {
          status: 'conflict',
          conflictDetails: 'Rilevato conflitto di versione remota',
        });
        report.conflictCount++;
        report.conflicts.push({
          queueItemId: item.id,
          itemType: item.type,
          localPayload: item.payload,
          remotePayload: res.remoteData,
          description: `Discrepanza per elemento ${item.type}`,
        });
      } else {
        await db.syncQueue.update(item.id, { status: 'done' });
        report.syncedCount++;
      }
    } catch (e) {
      console.warn(`Errore sincronizzazione elemento ${item.id}:`, e);
      await db.syncQueue.update(item.id, { status: 'pending' });
    }
  }

  // Aggiorna metadati di sincronizzazione
  await db.offlineMetadata.put({
    id: 'sync_meta',
    lastSyncTimestamp: Date.now(),
    isPreloaded: true,
    preloadedAt: Date.now(),
    dataVersion: '1.0.0',
  });

  return report;
}

/**
 * Risolve un conflitto scegliendo esplicitamente se mantenere la versione locale o remota.
 */
export async function resolveConflict(
  queueItemId: string,
  choice: 'keep_local' | 'keep_remote'
): Promise<void> {
  const item = await db.syncQueue.get(queueItemId);
  if (!item) return;

  if (choice === 'keep_local') {
    // Forzatura sovrascrittura locale
    await apiClient.syncItem({ ...item, status: 'pending' });
    await db.syncQueue.update(queueItemId, { status: 'done' });
  } else {
    // Scarta la modifica locale
    await db.syncQueue.delete(queueItemId);
  }
}
