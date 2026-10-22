import Dexie, { type Table } from 'dexie';
import { type TimelineSlot } from '../types';

export type EventStatus = 'PRE_APERTURA' | 'LIVE' | 'PAUSA';

export interface AuditEntry {
  id: string;
  timestamp: number;
  user: string;
  action: 'pause' | 'resume' | 'extend' | 'reduce' | 'move' | 'rollback' | 'intent';
  target: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  synced: boolean;
}

export interface ScheduleIntent {
  id: string;
  createdAt: number;
  userId: string;
  slotId: string;
  deltaMinutes: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  impactSummary?: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'handover_sbar' | 'note' | 'presence_toggle' | 'intent_schedule_change';
  payload: unknown;
  createdAt: number;
  userId: string;
  status: 'pending' | 'syncing' | 'done' | 'conflict';
  conflictDetails?: string;
}

export interface EventPauseRecord {
  id: string; // 'current_pause'
  isPaused: boolean;
  pausedAt: number;
  reason: string;
  note: string;
  user: string;
  frozenTimerSeconds: number;
}

export interface OfflineMetadataRecord {
  id: string; // 'sync_meta'
  lastSyncTimestamp: number;
  isPreloaded: boolean;
  preloadedAt: number;
  dataVersion: string;
}

export interface CachedScheduleSlot extends TimelineSlot {
  updatedAt?: number;
}

export interface ScheduleSnapshot {
  id: string;
  timestamp: number;
  description: string;
  slots: TimelineSlot[];
}

export class HitterDatabase extends Dexie {
  auditLog!: Table<AuditEntry, string>;
  scheduleIntents!: Table<ScheduleIntent, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  eventPause!: Table<EventPauseRecord, string>;
  offlineMetadata!: Table<OfflineMetadataRecord, string>;
  cachedSlots!: Table<TimelineSlot, string>;
  scheduleSnapshots!: Table<ScheduleSnapshot, string>;

  constructor() {
    super('HitterTraumaSimDB');
    this.version(1).stores({
      auditLog: 'id, timestamp, action, synced, user',
      scheduleIntents: 'id, createdAt, slotId, status, userId',
      syncQueue: 'id, type, createdAt, status, userId',
      eventPause: 'id, isPaused, pausedAt',
      offlineMetadata: 'id, lastSyncTimestamp',
      cachedSlots: 'id, day, startMinutes, durationMinutes',
      scheduleSnapshots: 'id, timestamp',
    });
  }
}

export const db = new HitterDatabase();
