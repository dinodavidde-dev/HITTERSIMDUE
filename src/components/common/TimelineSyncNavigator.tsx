import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Split,
  Play,
  Pause,
  Lock,
} from 'lucide-react';
import { TimelineSlot, CourseDay } from '../../types';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { useCourse } from '../../context/CourseContext';
import { useCourseAuthorization } from '../../hooks/useCourseAuthorization';
import { translateSlot } from '../../utils/courseTranslation';
import { formatGateCountdown } from './PreCoursePublicCountdown';

export interface TimelineSyncNavigatorProps {
  currentSlot: TimelineSlot; // Slot attualmente visualizzato dalla visuale
  masterCurrentSlot: TimelineSlot; // Slot live della Regia
  isLiveSync: boolean; // true se sincronizzato al live di Regia
  onSelectSlot: (slot: TimelineSlot) => void;
  onSyncToLive: () => void;
  roleLabel: string; // 'Discente' | 'Faculty' | 'Tecnico' | 'Trucco' | 'Direttore' | 'Ospite'
  stationContext?: string; // Postazione o contesto specifico del ruolo (es. 'Gruppo ALPHA • Squadra 1')
  compact?: boolean;
}

export const TimelineSyncNavigator: React.FC<TimelineSyncNavigatorProps> = ({
  currentSlot,
  masterCurrentSlot,
  isLiveSync,
  onSelectSlot,
  onSyncToLive,
  roleLabel,
  stationContext,
  compact = false,
}) => {
  const { language, activeDay, timerSeconds, isTimerRunning, timeRemainingMs, courseStartSchedule } = useCourse();
  const {
    isTimelineInteractionLocked,
    isCourseStarted,
    canAuthorize,
    lockReason,
  } = useCourseAuthorization();
  const isEn = language === 'en';

  const [inspectDay, setInspectDay] = useState<CourseDay>(currentSlot?.day || activeDay || 2);
  const [isOpenSelector, setIsOpenSelector] = useState<boolean>(false);
  const [lastMasterSlotId, setLastMasterSlotId] = useState<string>(masterCurrentSlot?.id || '');
  const [hasRegiaAdvancedWhileInspecting, setHasRegiaAdvancedWhileInspecting] = useState<boolean>(false);

  // Sincronizza il giorno di consultazione se si torna al live
  useEffect(() => {
    if (isLiveSync) {
      setInspectDay(activeDay);
      setHasRegiaAdvancedWhileInspecting(false);
    }
  }, [isLiveSync, activeDay]);

  // Rileva se la Regia avanza mentre l'utente sta consultando un altro slot
  useEffect(() => {
    if (masterCurrentSlot?.id && masterCurrentSlot.id !== lastMasterSlotId) {
      if (!isLiveSync) {
        setHasRegiaAdvancedWhileInspecting(true);
      }
      setLastMasterSlotId(masterCurrentSlot.id);
    }
  }, [masterCurrentSlot?.id, isLiveSync, lastMasterSlotId]);

  const rawDaySlots = INITIAL_TIMELINE_SLOTS.filter((s) => s.day === inspectDay);
  const daySlots = rawDaySlots.map((s) => translateSlot(s, language));

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(Math.max(0, totalSec) / 60);
    const secs = Math.max(0, totalSec) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Trova indice master rispetto a tutti gli slot
  const masterSlotIndex = useMemo(() => {
    const idx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.id === masterCurrentSlot?.id);
    return idx >= 0 ? idx + 1 : 1;
  }, [masterCurrentSlot?.id]);

  // Trova indice slot ispezionato
  const currentSlotIndex = useMemo(() => {
    const idx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.id === currentSlot?.id);
    return idx >= 0 ? idx + 1 : 1;
  }, [currentSlot?.id]);

  // Calcolo delta orario tra slot ispezionato e live di Regia
  const slotDeltaLabel = useMemo(() => {
    if (!currentSlot || !masterCurrentSlot) return '';
    if (currentSlot.id === masterCurrentSlot.id) {
      return isEn ? 'Concurrent with Live Regia' : 'Contemporaneo al Live Regia';
    }
    const diffMinutes = currentSlot.startMinutes - masterCurrentSlot.startMinutes;
    if (diffMinutes > 0) {
      const h = Math.floor(diffMinutes / 60);
      const m = diffMinutes % 60;
      const str = h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
      return isEn ? `+${str} after live` : `+${str} dopo il live`;
    } else {
      const absDiff = Math.abs(diffMinutes);
      const h = Math.floor(absDiff / 60);
      const m = absDiff % 60;
      const str = h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
      return isEn ? `-${str} before live` : `-${str} prima del live`;
    }
  }, [currentSlot, masterCurrentSlot, isEn]);

  return (
    <div className="font-mono text-xs space-y-2.5">
      {/* 1. NOTIFICA DI AVANZAMENTO FASE DA PARTE DELLA REGIA MENTRE IN CONSULTAZIONE */}
      {hasRegiaAdvancedWhileInspecting && !isLiveSync && (
        <div className="bg-amber-950/95 border-2 border-amber-500 p-3 rounded-lg shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5 text-amber-200">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping shrink-0" />
            <div>
              <div className="font-black text-xs uppercase tracking-wide text-amber-300">
                {isEn ? '⚠️ REGIA MASTER TIMELINE ADVANCED!' : '⚠️ LA REGIA È AVANZATA A UNA NUOVA FASE!'}
              </div>
              <div className="text-[11px] text-amber-100 mt-0.5">
                {masterCurrentSlot?.title} ({masterCurrentSlot?.timeRange}) • Day 0{masterCurrentSlot?.day}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setHasRegiaAdvancedWhileInspecting(false);
              onSyncToLive();
            }}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs rounded transition-all cursor-pointer shadow-md flex items-center gap-1.5 self-end sm:self-auto shrink-0"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{isEn ? 'SNAP TO LIVE NOW' : 'RIAGGANCIATI SUBITO AL LIVE'}</span>
          </button>
        </div>
      )}

      {/* 2. LIVE SYNC BADGE / SPLIT PREVIEW CONTAINER */}
      {isLiveSync ? (
        /* MODALITÀ SINCRONIZZATA LIVE COMPLETA (Badge Principale) */
        <div className="p-3 bg-neutral-900/95 border-2 border-emerald-500/80 rounded-lg shadow-lg shadow-emerald-950/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            {/* Badge Stato Live Regia */}
            <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-500 text-emerald-300 font-black text-[11px] uppercase tracking-wider rounded flex items-center gap-2 shadow-xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{isEn ? 'LIVE REGIA SYNC' : 'LIVE REGIA ATTIVO'}</span>
            </span>

            {/* WAITING FOR AUTHORIZATION Badge in top header bar */}
            {(!isCourseStarted || isTimelineInteractionLocked) && (
              <span
                className="px-2.5 py-1 bg-amber-950/90 border border-amber-500 text-amber-300 font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded flex items-center gap-1.5 shadow-sm animate-pulse shrink-0"
                title={lockReason || (isEn ? 'Awaiting Control Room authorization (read-only mode)' : 'In attesa di autorizzazione dalla Regia (modalità sola lettura)')}
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{isEn ? 'WAITING FOR AUTHORIZATION' : 'IN ATTESA DI AUTORIZZAZIONE'}</span>
                {!canAuthorize && (
                  <span className="text-[9px] px-1 py-0.2 bg-amber-900/60 text-amber-200 rounded font-normal hidden sm:inline">
                    {isEn ? 'READ-ONLY' : 'SOLA LETTURA'}
                  </span>
                )}
              </span>
            )}

            {/* Fase Live & Timer */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-black border border-neutral-700 text-yellow-300 text-xs font-bold rounded">
                #{masterSlotIndex} • {masterCurrentSlot?.timeRange}
              </span>
              <strong className="text-white text-xs sm:text-sm font-black truncate max-w-md" title={masterCurrentSlot?.title}>
                {masterCurrentSlot?.title || 'Fase Corso'}
              </strong>
              <span className="text-neutral-400 text-[11px] hidden sm:inline">
                (DAY 0{activeDay})
              </span>
            </div>

            {/* Context Ruolo / Postazione se presente */}
            {stationContext && (
              <span className="px-2 py-0.5 bg-neutral-950 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold rounded truncate max-w-xs">
                📍 {stationContext}
              </span>
            )}
          </div>

          {/* Cronometro Live in Tempo Reale & Tasto Consultazione */}
          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
            <div className="px-3 py-1 bg-black border border-emerald-500/80 rounded flex items-center gap-2 text-emerald-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono font-black tabular-nums tracking-wider">
                T-{formatTimer(timerSeconds)}
              </span>
              {isTimerRunning ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" title="Timer in esecuzione" />
              ) : (
                <span className="px-1 py-0.2 bg-neutral-800 text-[9px] text-neutral-400 rounded uppercase font-bold">
                  {isEn ? 'PAUSED' : 'PAUSA'}
                </span>
              )}
            </div>

            {/* Live Gate Closed Opening Countdown Badge */}
            {!isCourseStarted && (
              <div
                className="px-2.5 py-1 bg-red-950/90 border border-red-500 text-red-200 font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider rounded flex items-center gap-1.5 shadow-sm animate-pulse shrink-0"
                title={isEn ? `Gate Closed • Opening scheduled for ${courseStartSchedule?.scheduledTime || '08:30'}` : `Gate Chiuso • Apertura prevista ore ${courseStartSchedule?.scheduledTime || '08:30'}`}
              >
                <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="text-red-400 font-black">{isEn ? 'GATE CLOSED' : 'GATE CHIUSO'}</span>
                <span className="text-neutral-500 font-bold">|</span>
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-amber-300 font-mono font-black tabular-nums">
                  {formatGateCountdown(timeRemainingMs > 0 ? timeRemainingMs : timerSeconds * 1000, isEn)}
                </span>
              </div>
            )}

            {/* WAITING FOR AUTHORIZATION Badge beside the timer */}
            {(!isCourseStarted || isTimelineInteractionLocked) && (
              <span
                className="px-2.5 py-1 bg-amber-950/90 border border-amber-500/90 text-amber-300 font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider rounded flex items-center gap-1.5 shadow-sm animate-pulse shrink-0"
                title={lockReason || (isEn ? 'Waiting for authorization' : 'In attesa di autorizzazione')}
              >
                <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{isEn ? 'WAITING FOR AUTHORIZATION' : 'IN ATTESA DI AUTORIZZAZIONE'}</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsOpenSelector(!isOpenSelector)}
              className={`px-3 py-1.5 rounded border text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
                isOpenSelector
                  ? 'bg-neutral-800 text-white border-neutral-600'
                  : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isOpenSelector ? (isEn ? 'Hide Timeline' : 'Chiudi Slot') : (isEn ? 'Browse Other Slots' : 'Consulta Altri Slot')}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpenSelector ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      ) : (
        /* MODALITÀ SPLIT PREVIEW: AFFIANCAMENTO LIVE REGIA vs SLOT IN CONSULTAZIONE */
        <div className="space-y-2">
          {/* Barra Intestazione Split Preview */}
          <div className="p-2.5 bg-neutral-950 border-2 border-amber-500/90 rounded-lg shadow-xl flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-amber-300 flex-wrap">
              <Split className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-black text-xs uppercase tracking-wider">
                {isEn ? 'SPLIT PREVIEW • LIVE REGIA vs INSPECTION MODE' : 'MODALITÀ SPLIT PREVIEW • LIVE REGIA vs CONSULTAZIONE'}
              </span>
              <span className="text-[11px] text-neutral-400 hidden sm:inline">
                ({roleLabel})
              </span>
              {/* Gate Closed Countdown in Split Preview header */}
              {!isCourseStarted && (
                <span
                  className="px-2 py-0.5 bg-red-950 border border-red-500 text-red-200 font-mono text-[10px] font-black uppercase tracking-wider rounded flex items-center gap-1 animate-pulse"
                >
                  <Lock className="w-3 h-3 text-red-400 shrink-0" />
                  <span className="text-red-400">{isEn ? 'GATE CLOSED' : 'GATE CHIUSO'}</span>
                  <span className="text-neutral-500">|</span>
                  <span className="text-amber-300 font-bold">
                    {formatGateCountdown(timeRemainingMs > 0 ? timeRemainingMs : timerSeconds * 1000, isEn)}
                  </span>
                </span>
              )}

              {/* WAITING FOR AUTHORIZATION in Split Preview header */}
              {(!isCourseStarted || isTimelineInteractionLocked) && (
                <span
                  className="px-2 py-0.5 bg-amber-950 border border-amber-500 text-amber-300 font-mono text-[10px] font-black uppercase tracking-wider rounded flex items-center gap-1 animate-pulse"
                  title={lockReason || (isEn ? 'Waiting for authorization' : 'In attesa di autorizzazione')}
                >
                  <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{isEn ? 'WAITING FOR AUTHORIZATION' : 'IN ATTESA DI AUTORIZZAZIONE'}</span>
                  {!canAuthorize && (
                    <span className="text-[9px] px-1 py-0.2 bg-amber-900/60 text-amber-200 rounded font-normal hidden sm:inline">
                      {isEn ? 'READ-ONLY' : 'SOLA LETTURA'}
                    </span>
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSyncToLive}
                className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs rounded transition-all cursor-pointer shadow flex items-center gap-1.5"
                title={isEn ? 'Snap back to live Regia timeline' : 'Ritorna immediatamente al Live della Regia'}
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>{isEn ? 'SNAP TO LIVE REGIA' : 'RIAGGANCIATI AL LIVE REGIA'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpenSelector(!isOpenSelector)}
                className={`px-2.5 py-1 rounded border text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ${
                  isOpenSelector
                    ? 'bg-neutral-800 text-white border-neutral-600'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}
              >
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>{isOpenSelector ? (isEn ? 'Close' : 'Chiudi') : (isEn ? 'Pick Slot' : 'Cambia')}</span>
              </button>
            </div>
          </div>

          {/* Griglia a 2 Colonne (Split Preview Side-by-Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* PANNELLO 1: LIVE REGIA IN CORSO (Fonte Autorevole del Tempo) */}
            <div className="p-3 bg-neutral-900/90 border border-emerald-500/70 rounded-lg space-y-2 shadow-md">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-300 font-black text-[10px] uppercase tracking-wider rounded flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{isEn ? '1. LIVE REGIA (ACTIVE NOW)' : '1. LIVE REGIA (IN CORSO ADESSO)'}</span>
                </span>
                <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-mono font-black flex-wrap">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>T-{formatTimer(timerSeconds)}</span>
                  {(!isCourseStarted || isTimelineInteractionLocked) && (
                    <span className="px-1.5 py-0.5 bg-amber-950 border border-amber-500 text-amber-300 font-mono text-[9px] font-bold uppercase rounded flex items-center gap-1 animate-pulse">
                      <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      <span>{isEn ? 'WAITING FOR AUTHORIZATION' : 'IN ATTESA DI AUTORIZZAZIONE'}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                  <span className="px-1.5 py-0.2 bg-black border border-neutral-700 text-yellow-300 rounded text-[10px] font-bold">
                    #{masterSlotIndex} • {masterCurrentSlot?.timeRange}
                  </span>
                  <span>DAY 0{activeDay}</span>
                </div>
                <div className="text-white font-black text-xs sm:text-sm line-clamp-2" title={masterCurrentSlot?.title}>
                  {masterCurrentSlot?.title}
                </div>
                <p className="text-[10px] text-neutral-400 font-sans">
                  {isEn
                    ? 'The central master timeline is running actively. All clinical stations are operating on this slot.'
                    : 'La timeline centrale di Regia procede regolarmente. Tutte le postazioni operano su questa fase.'}
                </p>
              </div>
            </div>

            {/* PANNELLO 2: FASE SELEZIONATA (IN CONSULTAZIONE LOCALE) */}
            <div className="p-3 bg-neutral-900/90 border border-amber-500/80 rounded-lg space-y-2 shadow-md">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <span className="px-2 py-0.5 bg-amber-950 border border-amber-500 text-amber-300 font-black text-[10px] uppercase tracking-wider rounded flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-amber-400" />
                  <span>{isEn ? '2. INSPECTED SLOT (LOCAL VIEW)' : '2. FASE IN CONSULTAZIONE (LOCALE)'}</span>
                </span>
                <span className="px-2 py-0.5 bg-black border border-amber-500/60 text-amber-300 text-[10px] font-bold rounded">
                  {slotDeltaLabel}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                  <span className="px-1.5 py-0.2 bg-black border border-neutral-700 text-yellow-300 rounded text-[10px] font-bold">
                    #{currentSlotIndex} • {currentSlot?.timeRange}
                  </span>
                  <span>DAY 0{currentSlot?.day}</span>
                </div>
                <div className="text-white font-black text-xs sm:text-sm line-clamp-2 text-amber-200" title={currentSlot?.title}>
                  {currentSlot?.title}
                </div>
                <p className="text-[10px] text-neutral-400 font-sans">
                  {isEn
                    ? 'Consulting this slot allows inspecting upcoming/past assignments without affecting live course timing.'
                    : 'Stai ispezionando compiti e rotazioni di questa fase. La consultazione è locale e non modifica i tempi di Regia.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PANNELLO ESPANDIBILE: SELETTORE PER CONSULTARE QUALSIASI SLOT */}
      {isOpenSelector && (
        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between gap-2 flex-wrap border-b border-neutral-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400 font-bold uppercase">
                {isEn ? 'Select Day to inspect:' : 'Seleziona Giorno da consultare:'}
              </span>
              <div className="inline-flex rounded border border-neutral-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setInspectDay(2)}
                  className={`px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-colors ${
                    inspectDay === 2
                      ? 'bg-cyan-600 text-black font-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  DAY 02 {activeDay === 2 && '• LIVE'}
                </button>
                <button
                  type="button"
                  onClick={() => setInspectDay(3)}
                  className={`px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-colors ${
                    inspectDay === 3
                      ? 'bg-cyan-600 text-black font-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  DAY 03 {activeDay === 3 && '• LIVE'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 italic hidden md:inline">
                {isEn
                  ? 'Inspecting other slots does not affect Regia live timing'
                  : 'La consultazione di altri slot è locale e non altera i tempi della Regia'}
              </span>
              {!isLiveSync && (
                <button
                  type="button"
                  onClick={() => {
                    onSyncToLive();
                    setIsOpenSelector(false);
                  }}
                  className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase rounded cursor-pointer"
                >
                  {isEn ? 'Sync to Live' : 'Torna al Live'}
                </button>
              )}
            </div>
          </div>

          {/* Elenco Slot per il giorno selezionato */}
          <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {daySlots.map((slot, idx) => {
              const isSlotLive = slot.id === masterCurrentSlot?.id;
              const isSlotCurrent = slot.id === currentSlot?.id;
              const isNightMascal = slot.id === 'd2-mascal-scenario';

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => {
                    onSelectSlot(slot);
                    setIsOpenSelector(false);
                  }}
                  className={`w-full text-left p-2 rounded border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isSlotCurrent
                      ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-500/50'
                      : isSlotLive
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 hover:bg-emerald-950/60'
                      : isNightMascal
                      ? 'bg-red-950/40 border-red-600/60 text-red-200 hover:bg-red-950/60'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-850 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono text-neutral-400 shrink-0 w-6">
                      #{idx + 1}
                    </span>
                    <span className="px-1.5 py-0.5 bg-neutral-950 border border-neutral-700 text-yellow-300 font-mono text-[10px] rounded shrink-0">
                      {slot.timeRange}
                    </span>
                    <span className="font-bold text-xs truncate">
                      {slot.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSlotLive && (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-black uppercase rounded shadow-xs">
                        LIVE REGIA
                      </span>
                    )}
                    {isNightMascal && (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase rounded shadow-xs">
                        MASCAL
                      </span>
                    )}
                    {isSlotCurrent && !isSlotLive && (
                      <span className="px-2 py-0.5 bg-cyan-600 text-black text-[9px] font-black uppercase rounded shadow-xs">
                        {isEn ? 'INSPECTING' : 'IN CONSULTAZIONE'}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
