import { useState, useEffect, useCallback } from 'react';
import { db, type EventPauseRecord, type SyncQueueItem, type ScheduleIntent } from './db';
import { processSyncQueue, enqueueOfflineAction, type SyncReconciliationReport } from './syncQueue';
import { preloadCriticalData, isOfflinePreloaded, getLastSyncAgeMinutes } from './dataPreloader';
import { logAuditAction } from '../schedule/auditLogStore';

export type NetworkState = 'online' | 'syncing' | 'offline';

export function useOfflineSync() {
  const [networkState, setNetworkState] = useState<NetworkState>(() =>
    typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline'
  );
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isDataStale, setIsDataStale] = useState<boolean>(false);
  const [staleMinutes, setStaleMinutes] = useState<number>(0);
  const [isPreloadRunning, setIsPreloadRunning] = useState<boolean>(false);
  const [preloadProgress, setPreloadProgress] = useState<number>(100);
  const [preloadStep, setPreloadStep] = useState<string>('');
  const [reconciliationReport, setReconciliationReport] = useState<SyncReconciliationReport | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isIntentPanelOpen, setIsIntentPanelOpen] = useState<boolean>(false);
  const [pendingIntents, setPendingIntents] = useState<ScheduleIntent[]>([]);
  const [eventPauseState, setEventPauseState] = useState<EventPauseRecord | null>(null);

  // Aggiorna conteggio elementi in coda
  const refreshQueueCount = useCallback(async () => {
    try {
      const count = await db.syncQueue.where('status').equals('pending').count();
      setPendingQueueCount(count);

      const intents = await db.scheduleIntents.where('status').equals('pending').toArray();
      setPendingIntents(intents);

      const pause = await db.eventPause.get('current_pause');
      setEventPauseState(pause || null);

      const age = await getLastSyncAgeMinutes();
      setStaleMinutes(age);
      // Se > 30 minuti senza sync, i dati sono considerati obsoleti
      setIsDataStale(age > 30);
    } catch (e) {
      console.warn('Errore refresh IndexedDB status:', e);
    }
  }, []);

  // Esecuzione sync manuale o automatica al ripristino connessione
  const triggerSync = useCallback(async () => {
    if (!navigator.onLine) return;
    setNetworkState('syncing');

    try {
      const report = await processSyncQueue();
      setNetworkState('online');
      setLastSyncTime(new Date());
      await refreshQueueCount();

      if (report.syncedCount > 0 || report.conflictCount > 0 || report.pendingIntentsCount > 0) {
        setReconciliationReport(report);
        setIsSyncModalOpen(true);
      }
    } catch (e) {
      console.error('Errore durante la sincronizzazione differita:', e);
      setNetworkState('online');
    }
  }, [refreshQueueCount]);

  // Listener eventi online / offline
  useEffect(() => {
    const handleOnline = () => {
      setNetworkState('syncing');
      setTimeout(() => {
        triggerSync();
      }, 500);
    };

    const handleOffline = () => {
      setNetworkState('offline');
      refreshQueueCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (navigator.onLine) {
      // Verifica se i dati critici sono precaricati in IndexedDB
      isOfflinePreloaded().then((preloaded) => {
        if (!preloaded) {
          setIsPreloadRunning(true);
          preloadCriticalData((pct, step) => {
            setPreloadProgress(pct);
            setPreloadStep(step);
          }).then(() => {
            setIsPreloadRunning(false);
            setLastSyncTime(new Date());
          });
        }
      });
    }

    refreshQueueCount();
    const interval = setInterval(refreshQueueCount, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [triggerSync, refreshQueueCount]);

  // Gestione Event Pause persistente in IndexedDB
  const pauseEvent = useCallback(
    async (reason: string, note: string = '', user: string = 'REGIA-01', frozenTimerSeconds: number = 0) => {
      const record: EventPauseRecord = {
        id: 'current_pause',
        isPaused: true,
        pausedAt: Date.now(),
        reason,
        note,
        user,
        frozenTimerSeconds,
      };

      await db.eventPause.put(record);
      setEventPauseState(record);

      await logAuditAction('pause', 'Evento Globale', user, {
        reason: `${reason}${note ? ` - ${note}` : ''}`,
        after: { frozenTimerSeconds },
      });

      if (!navigator.onLine) {
        await enqueueOfflineAction('note', { type: 'event_pause', ...record }, user);
      }
      await refreshQueueCount();
    },
    [refreshQueueCount]
  );

  const resumeEvent = useCallback(
    async (user: string = 'REGIA-01') => {
      const prev = await db.eventPause.get('current_pause');
      await db.eventPause.delete('current_pause');
      setEventPauseState(null);

      await logAuditAction('resume', 'Evento Globale', user, {
        before: prev,
        reason: 'Ripresa attività didattiche e timer di postazione',
      });

      if (!navigator.onLine) {
        await enqueueOfflineAction('note', { type: 'event_resume', resumedAt: Date.now() }, user);
      }
      await refreshQueueCount();
    },
    [refreshQueueCount]
  );

  return {
    networkState,
    isOnline: networkState === 'online',
    isSyncing: networkState === 'syncing',
    isOffline: networkState === 'offline',
    pendingQueueCount,
    lastSyncTime,
    isDataStale,
    staleMinutes,
    isPreloadRunning,
    preloadProgress,
    preloadStep,
    reconciliationReport,
    isSyncModalOpen,
    setIsSyncModalOpen,
    isIntentPanelOpen,
    setIsIntentPanelOpen,
    pendingIntents,
    eventPauseState,
    pauseEvent,
    resumeEvent,
    triggerSync,
    refreshQueueCount,
  };
}
