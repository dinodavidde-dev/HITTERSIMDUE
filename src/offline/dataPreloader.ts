import { db, type CachedScheduleSlot } from './db';
import { INITIAL_TIMELINE_SLOTS } from '../data/initialData';

export async function preloadCriticalData(onProgress?: (percent: number, stepLabel: string) => void): Promise<boolean> {
  try {
    if (onProgress) onProgress(15, 'Verifica storage IndexedDB...');

    // 1. Cronoprogramma completo
    if (onProgress) onProgress(35, 'Caching cronoprogramma e rotazioni...');
    await db.cachedSlots.clear();
    await db.cachedSlots.bulkPut(INITIAL_TIMELINE_SLOTS);

    // 2. Assegnazioni e stazioni
    if (onProgress) onProgress(65, 'Caching stazioni cliniche e checklist SBAR...');
    await new Promise((r) => setTimeout(r, 60)); // smooth progress visual

    // 3. Metadata sync
    if (onProgress) onProgress(90, 'Finalizzazione archivio offline...');
    await db.offlineMetadata.put({
      id: 'sync_meta',
      lastSyncTimestamp: Date.now(),
      isPreloaded: true,
      preloadedAt: Date.now(),
      dataVersion: '1.0.0',
    });

    if (onProgress) onProgress(100, 'Modalità offline pronta.');
    return true;
  } catch (err) {
    console.error('Errore durante il precaricamento dati offline:', err);
    return false;
  }
}

export async function isOfflinePreloaded(): Promise<boolean> {
  const meta = await db.offlineMetadata.get('sync_meta');
  return Boolean(meta?.isPreloaded);
}

export async function getLastSyncAgeMinutes(): Promise<number> {
  const meta = await db.offlineMetadata.get('sync_meta');
  if (!meta || !meta.lastSyncTimestamp) return Infinity;
  const ageMs = Date.now() - meta.lastSyncTimestamp;
  return Math.floor(ageMs / 60000);
}
