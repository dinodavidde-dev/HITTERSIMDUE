import React, { useState, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import { CourseDay } from '../../types';
import {
  DEEPHITTER_CONVOCAZIONI_TABLE,
  DeephitterTruccoEntry,
  DEEPHITTER_ACTORS,
} from '../../data/deephitterTruccoData';
import {
  getSimulatedCourseMinutes,
  getActiveDeephitterBlockNumber,
  getDeephitterEntryLiveStatus,
  formatMinutesToTime,
  formatMinutesCountdown,
  DEEPHITTER_BLOCKS_META,
} from '../../utils/deephitterSync';
import { getAssignedTechnicianForScenario } from '../../utils/staffBalancer';
import { CardOperativaCongiunta } from '../common/CardOperativaCongiunta';
import {
  Clock,
  CheckCircle2,
  Search,
  Layers,
  Package,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  FileSpreadsheet,
  Eye,
  AlertTriangle,
  Wrench,
  Sparkles,
  Radio,
  Sliders,
} from 'lucide-react';

interface DeephitterTruccoTimelineViewProps {
  initialDay?: CourseDay;
  onOpenArtistTimeline?: (artistBadge: string) => void;
  onOpenActorsRegistry?: () => void;
  onOpenArtistsRegistry?: () => void;
}

export const DeephitterTruccoTimelineView: React.FC<DeephitterTruccoTimelineViewProps> = ({
  initialDay,
  onOpenArtistTimeline,
  onOpenActorsRegistry,
  onOpenArtistsRegistry,
}) => {
  const {
    activeDay,
    setActiveDay,
    currentSlot,
    timerSeconds,
    actors,
    makeupArtists,
    simulatorPatients,
    technicians,
    updateActorProgressStatus,
    updateTechChecklist,
    sendCourseMessage,
    language,
  } = useCourse();

  const isEn = language === 'en';
  const [selectedDay, setSelectedDay] = useState<CourseDay>(
    initialDay || (activeDay === 3 ? 3 : 2)
  );
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [selectedArtistFilter, setSelectedArtistFilter] = useState<string>('ALL');
  const [selectedActorTypeFilter, setSelectedActorTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedJointCardEntry, setSelectedJointCardEntry] = useState<DeephitterTruccoEntry | null>(null);

  // Compute simulated course minutes based on currentSlot and timer
  const currentCourseMinutes = useMemo(() => {
    return getSimulatedCourseMinutes(currentSlot, timerSeconds);
  }, [currentSlot, timerSeconds]);

  // Active block number derived from real-time clock
  const liveActiveBlockNumber = useMemo(() => {
    return getActiveDeephitterBlockNumber(currentCourseMinutes);
  }, [currentCourseMinutes]);

  // Which block to show in the live card
  const blockForLiveCard = useMemo(() => {
    if (selectedBlockFilter !== 'ALL') return selectedBlockFilter;
    return liveActiveBlockNumber;
  }, [selectedBlockFilter, liveActiveBlockNumber]);

  const blockMeta = useMemo(() => {
    return (
      DEEPHITTER_BLOCKS_META.find((b) => b.blockNumber === blockForLiveCard) ||
      DEEPHITTER_BLOCKS_META[0]
    );
  }, [blockForLiveCard]);

  // Entries for the Live Operative Block Card
  const liveBlockEntries = useMemo(() => {
    return DEEPHITTER_CONVOCAZIONI_TABLE.filter(
      (e) => e.day === selectedDay && e.blockNumber === blockForLiveCard
    );
  }, [selectedDay, blockForLiveCard]);

  // Filtered entries for the Complete Official Table
  const filteredTableEntries = useMemo(() => {
    return DEEPHITTER_CONVOCAZIONI_TABLE.filter((entry) => {
      if (entry.day !== selectedDay) return false;
      if (selectedBlockFilter !== 'ALL' && entry.blockNumber !== selectedBlockFilter) return false;
      if (selectedArtistFilter !== 'ALL' && entry.truccatriceCode !== selectedArtistFilter)
        return false;

      if (selectedActorTypeFilter !== 'ALL') {
        const actor = DEEPHITTER_ACTORS.find((a) => a.badgeCode === entry.actorCode);
        if (selectedActorTypeFilter === 'AMPUTATO' && actor?.physicalStatus !== 'AMPUTATO')
          return false;
        if (
          selectedActorTypeFilter === 'FIGURANTE' &&
          !actor?.amputationDetails.toLowerCase().includes('figurante')
        )
          return false;
        if (
          selectedActorTypeFilter === 'INTERO' &&
          (actor?.physicalStatus !== 'INTERO' ||
            actor?.amputationDetails.toLowerCase().includes('figurante'))
        )
          return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchText =
          entry.actorName.toLowerCase().includes(q) ||
          entry.actorCode.toLowerCase().includes(q) ||
          entry.scenarioAndPatient.toLowerCase().includes(q) ||
          entry.truccatriceName.toLowerCase().includes(q) ||
          entry.postazioneLogistica.toLowerCase().includes(q) ||
          entry.lesioniClinicheMoulage.toLowerCase().includes(q) ||
          (entry.presidioMoulageFx || '').toLowerCase().includes(q);
        if (!matchText) return false;
      }

      return true;
    });
  }, [
    selectedDay,
    selectedBlockFilter,
    selectedArtistFilter,
    selectedActorTypeFilter,
    searchQuery,
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1-Click Validation for Pronto Scena (T-15')
  const handleTogglePronto = (entry: DeephitterTruccoEntry) => {
    const actorInContext = actors.find((a) => a.badgeCode === entry.actorCode);
    const pzId = entry.patientIds[0];
    const patient = simulatorPatients.find((p) => p.id === pzId);

    const isAlreadyPronto =
      actorInContext?.progressStatus === 'PRONTO_T0' || patient?.techChecklist?.preDone;
    const nextStatus = isAlreadyPronto ? 'IN_PREPARAZIONE' : 'PRONTO_T0';
    const nextPreDone = !isAlreadyPronto;

    if (actorInContext) {
      updateActorProgressStatus(actorInContext.id, nextStatus, {
        patientId: pzId,
        updatedBy: `${entry.truccatriceCode} • ${entry.truccatriceName}`,
        notifyRegia: true,
      });
    }

    if (pzId && patient) {
      updateTechChecklist(pzId, 'preDone', nextPreDone);
    }

    if (nextPreDone && sendCourseMessage) {
      sendCourseMessage({
        senderId: entry.truccatriceCode,
        senderName: `${entry.truccatriceName} (Team Trucco)`,
        senderRole: 'tecnico',
        type: 'info',
        subject: `TARGET PRONTO SCENA (T-15') RAGGIUNTO • ${entry.scenarioAndPatient}`,
        content: `Attore ${entry.actorCode} (${entry.actorName}) pronto e truccato da ${entry.truccatriceCode} (${entry.truccatriceName}) per ${entry.scenarioAndPatient} in ${entry.postazioneLogistica}. In attesa di T0 (${entry.t0Time}).`,
      });
    }

    showToast(
      nextPreDone
        ? `✓ ${entry.actorCode} (${entry.actorName}) validato PRONTO SCENA (T-15') per ${entry.scenarioAndPatient}!`
        : `Stato di ${entry.actorCode} reimpostato su IN PREPARAZIONE.`
    );
  };

  return (
    <div className="space-y-6 font-mono text-white">
      {/* 1. HEADER PROTOCOLLO DEEPHITTER VMK1 REV.3 */}
      <div className="bg-neutral-900 border-2 border-pink-600/80 p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-1 bg-pink-600 text-white font-black uppercase tracking-wider shadow">
                DEEPHITTER VMK1 REV.3
              </span>
              <span className="px-2.5 py-1 bg-neutral-950 text-pink-300 border border-pink-500/70 font-bold uppercase">
                TIMELINE OPERATIVA TRUCCO & CONVOCAZIONE ATTORI
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/80 font-bold text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE SYNC REGIA CH-3
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isEn
                ? 'Official Actor Moulage & Call Times Timeline (DEEPHITTER VMK1 REV.3)'
                : 'Timeline Operativa Dedicata Trucco Attori & Convocazioni (DEEPHITTER VMK1 REV.3)'}
            </h1>

            <p className="text-xs text-neutral-300 font-sans max-w-4xl leading-relaxed">
              Programmazione rigida delle convocazioni attori (
              <strong className="text-amber-300">T-60&apos;</strong> prima dello scenario, finestra
              moulage FX <strong className="text-pink-300">30&apos;–45&apos;</strong>, target attore
              pronto in postazione <strong className="text-emerald-300">T-15&apos;</strong> pre-alert
              regia) sincronizzata in tempo reale con le 3 Truccatrici Specialiste (
              <span className="text-white font-bold">TRUCCO-01</span>,{' '}
              <span className="text-white font-bold">TRUCCO-02</span>,{' '}
              <span className="text-white font-bold">TRUCCO-03</span>) e i 12 Attori Ufficiali (
              <span className="text-amber-300 font-bold">ACT-01..12</span>).
            </p>
          </div>

          {/* Real-time Clock & Day Selector */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="px-3.5 py-2 bg-neutral-950 border border-neutral-700 text-xs flex items-center gap-2 shadow">
              <Clock className="w-4 h-4 text-pink-400 animate-spin" style={{ animationDuration: '8s' }} />
              <div>
                <div className="text-[10px] text-neutral-400 uppercase font-bold">
                  Ora Corso / Slot Regia
                </div>
                <div className="text-sm font-black text-white tabular-nums">
                  {formatMinutesToTime(currentCourseMinutes)} •{' '}
                  <span className="text-amber-300">
                    Slot {currentSlot?.timeRange || '09:00 - 09:15'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex bg-neutral-950 p-1 border border-neutral-700 gap-1">
              {([2, 3] as CourseDay[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setSelectedDay(d);
                    setActiveDay(d);
                  }}
                  className={`px-3 py-1.5 text-xs font-black uppercase cursor-pointer transition-colors ${
                    selectedDay === d
                      ? 'bg-pink-600 text-white shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  DAY 0{d} ({d === 2 ? 'Scenari 1–12' : 'Scenari 13–24'})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tactical 4-Block Stepper with Live Indication */}
        <div className="pt-3 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => setSelectedBlockFilter('ALL')}
            className={`p-2.5 text-left border cursor-pointer transition-all ${
              selectedBlockFilter === 'ALL'
                ? 'bg-pink-600 text-white border-pink-400 font-black shadow'
                : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-pink-500/60'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-neutral-400">FILTRO BLOCCHI</div>
            <div className="text-xs font-black mt-0.5">Tutti i 4 Blocchi</div>
            <div className="text-[10px] opacity-75">14 record / giornata</div>
          </button>

          {DEEPHITTER_BLOCKS_META.map((b) => {
            const isLiveActive = liveActiveBlockNumber === b.blockNumber;
            const isSelected = selectedBlockFilter === b.blockNumber;
            return (
              <button
                key={b.blockNumber}
                type="button"
                onClick={() => setSelectedBlockFilter(b.blockNumber)}
                className={`p-2.5 text-left border cursor-pointer transition-all relative ${
                  isSelected
                    ? 'bg-pink-600 text-white border-pink-400 font-black shadow-lg'
                    : isLiveActive
                    ? 'bg-pink-950/60 text-pink-200 border-pink-500 shadow-md ring-1 ring-pink-500'
                    : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-pink-500/50'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] uppercase">
                  <span>BLOCCO {b.blockNumber}</span>
                  {isLiveActive && (
                    <span className="px-1.5 py-0.2 bg-emerald-500 text-black font-black text-[9px] uppercase tracking-wider rounded">
                      ATTIVO
                    </span>
                  )}
                </div>
                <div className="text-xs font-black truncate mt-0.5 tabular-nums">{b.timeRange}</div>
                <div className="text-[10px] opacity-80 truncate tabular-nums">
                  Conv. T-60&apos;: {formatMinutesToTime(b.convocazioneMinutes)} • Pronto:{' '}
                  {formatMinutesToTime(b.prontoMinutes)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Protocol Reference Banner */}
        <div className="bg-black/60 border border-neutral-800 p-2.5 rounded text-xs flex flex-wrap items-center justify-between gap-3 text-neutral-300">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-pink-400 font-bold uppercase text-[11px]">
              Regola 4 Step:
            </span>
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 bg-amber-500 text-black font-black text-[10px]">
                1. T-60&apos;
              </span>
              <span>Convocazione Attore</span>
            </span>
            <span className="text-neutral-600">➔</span>
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 bg-pink-500 text-black font-black text-[10px]">
                2. 30&apos;–45&apos;
              </span>
              <span>Finestra Trucco FX</span>
            </span>
            <span className="text-neutral-600">➔</span>
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 bg-emerald-500 text-black font-black text-[10px]">
                3. T-15&apos;
              </span>
              <span>Target Pronto Scena</span>
            </span>
            <span className="text-neutral-600">➔</span>
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 bg-red-600 text-white font-black text-[10px]">
                4. T0
              </span>
              <span>Ingaggio TCCC</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenActorsRegistry && (
              <button
                type="button"
                onClick={onOpenActorsRegistry}
                className="text-[11px] text-amber-300 hover:text-white underline cursor-pointer"
              >
                Anagrafica 12 Attori ({actors.length})
              </button>
            )}
            <span className="text-neutral-600">•</span>
            {onOpenArtistsRegistry && (
              <button
                type="button"
                onClick={onOpenArtistsRegistry}
                className="text-[11px] text-pink-300 hover:text-white underline cursor-pointer"
              >
                Anagrafica 3 Truccatrici ({makeupArtists.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Toast */}
      {toastMessage && (
        <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] uppercase bg-black/60 px-2 py-0.5 text-emerald-400">
            CH-3 REGIA NOTIFIED
          </span>
        </div>
      )}

      {/* 2. CARD OPERATIVA DEL BLOCCO CORRENTE */}
      <section className="bg-neutral-900 border-2 border-emerald-500/70 p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                CARD OPERATIVA DEL BLOCCO SINCRONIZZATA
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>{blockMeta.label}</span>
                <span className="text-xs font-normal text-neutral-400">
                  (Orario Scena: {blockMeta.timeRange})
                </span>
              </h2>
            </div>
          </div>

          {/* Timing Targets for this Block */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-2.5 py-1 bg-black/80 border border-neutral-700 text-neutral-300 tabular-nums">
              Convocazione T-60&apos;:{' '}
              <strong className="text-amber-400">
                {formatMinutesToTime(blockMeta.convocazioneMinutes)}
              </strong>
            </span>
            <span className="px-2.5 py-1 bg-black/80 border border-neutral-700 text-neutral-300 tabular-nums">
              Pronto T-15&apos;:{' '}
              <strong className="text-emerald-400">
                {formatMinutesToTime(blockMeta.prontoMinutes)}
              </strong>
            </span>
            <span className="px-2.5 py-1 bg-black/80 border border-neutral-700 text-neutral-300 tabular-nums">
              Ingaggio T0:{' '}
              <strong className="text-red-400">
                {formatMinutesToTime(blockMeta.t0Minutes)}
              </strong>
            </span>
          </div>
        </div>

        {/* 3 Columns / Cards for the 3 Truccatrici in this Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {liveBlockEntries.map((entry) => {
            const actorObj =
              actors.find((a) => a.badgeCode === entry.actorCode) ||
              DEEPHITTER_ACTORS.find((a) => a.badgeCode === entry.actorCode);
            const pzId = entry.patientIds[0];
            const patient = simulatorPatients.find((p) => p.id === pzId);
            const liveStatus = getDeephitterEntryLiveStatus(entry, currentCourseMinutes, actorObj?.progressStatus);
            const isPronto =
              actorObj?.progressStatus === 'PRONTO_T0' || patient?.techChecklist?.preDone;
            const isCritical = liveStatus.isCriticalT0InPrep;

            const isAmputato = actorObj?.physicalStatus === 'AMPUTATO';
            const isFigurante = actorObj?.amputationDetails.toLowerCase().includes('figurante');

            return (
              <div
                key={entry.id}
                className={`bg-neutral-950 border flex flex-col justify-between transition-all ${
                  isCritical
                    ? 'border-2 border-red-500 ring-2 ring-red-500/80 bg-red-950/40 shadow-2xl shadow-red-600/40 animate-pulse'
                    : isPronto
                    ? 'border-emerald-500 shadow-md shadow-emerald-500/10'
                    : liveStatus.isUrgent
                    ? 'border-amber-400 shadow-md shadow-amber-400/20'
                    : 'border-neutral-800 hover:border-pink-500/60'
                }`}
              >
                {/* Critical Alert Bar if in prep and T0 < 10m */}
                {isCritical && (
                  <div className="p-2 bg-red-950 border-b border-red-500 text-red-100 text-[11px] font-black flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
                      <span>⚠️ ALLERTA T0 &lt; 10 MIN • IN PREPARAZIONE</span>
                    </div>
                    <span className="tabular-nums font-mono text-white bg-red-600 px-1.5 py-0.2 text-[10px]">
                      {formatMinutesCountdown(liveStatus.countdownT0Minutes)}
                    </span>
                  </div>
                )}

                {/* Card Top: Truccatrice & Scenario */}
                <div className="p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-pink-600 text-white font-black text-xs">
                          {entry.truccatriceCode}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {entry.truccatriceName}
                        </span>
                      </div>
                      <div className="text-[10px] text-pink-300 mt-0.5">
                        {entry.truccatriceCode === 'TRUCCO-01'
                          ? 'Specialista Amputazioni & Sanguinamento'
                          : entry.truccatriceCode === 'TRUCCO-02'
                          ? 'Specialista Vie Aeree, PNX & Cricotomia'
                          : 'Specialista Eviscerazioni & Figuranti'}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-black border border-neutral-700 text-amber-300 text-xs font-black">
                        {entry.scenarioAndPatient}
                      </span>
                      <div className="text-[9px] text-neutral-400 mt-0.5 truncate max-w-[130px]">
                        {entry.postazioneLogistica}
                      </div>
                    </div>
                  </div>

                  {/* TECNICO ASSEGNATO & REGIA SIMULATORE AFFIANCATO */}
                  {(() => {
                    const assignedTech = getAssignedTechnicianForScenario(technicians, pzId, entry.postazioneLogistica);
                    return (
                      <div className="p-2.5 bg-neutral-900/90 border border-pink-700/60 rounded space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="px-1.5 py-0.5 bg-pink-700 text-white font-mono font-black text-[10px] shrink-0">
                              {assignedTech.badgeCode}
                            </span>
                            <span className="font-bold text-white text-xs truncate">{assignedTech.name}</span>
                          </div>
                          <span className="text-[10px] text-pink-300 font-mono shrink-0">CH-3 Radio</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono truncate">
                          {assignedTech.assignedStation || entry.postazioneLogistica} • {assignedTech.specialty}
                        </div>
                        {/* Checklist congiunta trucco e regia simulatore */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-neutral-800 text-[10px]">
                          <div className={`p-1 text-center font-bold border ${isPronto ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500' : 'bg-black/60 text-pink-300 border-neutral-800'}`}>
                            Moulage: {isPronto ? '✓ OK' : 'In allestimento'}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newVal = !patient?.techChecklist?.preDone;
                              updateTechChecklist(pzId, 'preDone', newVal, 'Checklist congiunta card operativa');
                              showToast(`Simulatore Pz #${pzId}: ${newVal ? 'VERIFICATO & PRONTO (Regia CH-3)' : 'DA VERIFICARE'}`);
                            }}
                            className={`p-1 text-center font-bold border cursor-pointer transition-colors ${
                              patient?.techChecklist?.preDone
                                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 hover:bg-cyan-900'
                                : 'bg-black/60 hover:bg-neutral-800 text-cyan-400 border-neutral-800'
                            }`}
                            title="Checklist Regia Simulatore: hardware, getti e parametri"
                          >
                            Simulatore: {patient?.techChecklist?.preDone ? '✓ OK' : 'Verifica'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Actor Badge & Info */}
                  <div className={`p-2.5 bg-neutral-900 border space-y-1.5 ${isCritical ? 'border-red-500/80 bg-red-950/30' : 'border-neutral-800'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 font-black text-xs ${
                          isCritical
                            ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                            : 'bg-amber-500 text-black'
                        }`}>
                          {entry.actorCode}
                        </span>
                        <span className="text-xs font-black text-white">{entry.actorName}</span>
                      </div>
                      <span
                        className={`px-1.5 py-0.2 text-[9px] font-black uppercase ${
                          isAmputato
                            ? 'bg-red-600 text-white'
                            : isFigurante
                            ? 'bg-purple-600 text-white'
                            : 'bg-neutral-700 text-neutral-200'
                        }`}
                      >
                        {isAmputato ? 'AMPUTATO' : isFigurante ? 'FIGURANTE' : 'INTERO'}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-300 font-sans line-clamp-2">
                      {actorObj?.amputationDetails || entry.lesioniClinicheMoulage}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-800">
                      <span>Taglia: <strong className="text-white">{actorObj?.clothingSize || 'M'}</strong></span>
                      <span>Postazione: <strong className="text-neutral-200">{entry.postazioneAllestimento || 'Lab Moulage'}</strong></span>
                    </div>
                  </div>

                  {/* Lesioni Cliniche & Presidio Moulage FX */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-neutral-400 font-bold uppercase flex items-center gap-1">
                      <Layers className="w-3 h-3 text-pink-400" />
                      <span>Presidio Moulage FX & Lesioni Cliniche</span>
                    </div>
                    <div className="p-2 bg-black/60 border border-neutral-800 text-[11px] text-neutral-200 leading-snug font-sans">
                      {entry.lesioniClinicheMoulage}
                    </div>
                    {entry.noteOperativeRicarica && (
                      <div className="text-[10px] text-amber-300/90 font-sans bg-amber-950/30 p-1.5 border border-amber-800/40">
                        ⚡ <strong>Note / Ricarica:</strong> {entry.noteOperativeRicarica}
                      </div>
                    )}
                  </div>

                  {/* Synchronized Real-time Status & Countdowns */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-neutral-400">Finestra Trucco:</span>
                      <span className="font-bold text-neutral-200">{entry.finestraTrucco}</span>
                    </div>

                    <div
                      className={`p-2 border text-xs font-bold flex items-center justify-between ${liveStatus.badgeClass}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${liveStatus.dotColor}`} />
                        <span>{liveStatus.statusLabel}</span>
                      </div>
                      <span className="text-[11px] tabular-nums font-black">
                        {liveStatus.countdownProntoMinutes > 0
                          ? formatMinutesCountdown(liveStatus.countdownProntoMinutes)
                          : formatMinutesCountdown(liveStatus.countdownT0Minutes)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Quick Actions */}
                <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePronto(entry)}
                    className={`flex-1 py-1.5 px-2 text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-1.5 transition-colors ${
                      isPronto
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                        : 'bg-neutral-800 hover:bg-emerald-950 text-neutral-200 hover:text-emerald-300 border border-neutral-700 hover:border-emerald-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isPronto ? '✓ PRONTO (T-15\')' : 'Valida'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedJointCardEntry(entry)}
                    className="py-1.5 px-2 bg-gradient-to-r from-fuchsia-950 to-pink-950 hover:from-fuchsia-900 hover:to-pink-900 text-pink-200 border border-pink-500 rounded text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    title="Apri Card Operativa Congiunta Trucco & Tecnico"
                  >
                    <Sliders className="w-3.5 h-3.5 text-pink-400" />
                    <span className="hidden sm:inline">Card Congiunta</span>
                  </button>

                  {onOpenArtistTimeline && (
                    <button
                      type="button"
                      onClick={() => onOpenArtistTimeline(entry.truccatriceCode)}
                      className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer"
                      title={`Visualizza timeline personale di ${entry.truccatriceName}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. TABELLA UFFICIALE INTEGRALE DEEPHITTER VMK1 REV.3 (28 RECORD) */}
      <section className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-pink-400" />
              <h2 className="text-lg font-black text-white">
                Tabella Ufficiale Completa DEEPHITTER VMK1 REV.3
              </h2>
            </div>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              Tutti i 28 record operativi di convocazione e allestimento trucco con orari tassativi,
              lesioni cliniche e stato di avanzamento live.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-300 flex-wrap">
            <span className="px-2 py-1 bg-black border border-neutral-700">
              Record: <strong className="text-white">{filteredTableEntries.length}</strong>
            </span>
            <span className="px-2 py-1 bg-black border border-neutral-700">
              Amputati: <strong className="text-red-400">4 Slot</strong>
            </span>
            <span className="px-2 py-1 bg-black border border-neutral-700">
              Interi: <strong className="text-neutral-200">5 Slot</strong>
            </span>
            <span className="px-2 py-1 bg-black border border-neutral-700">
              Figuranti: <strong className="text-purple-400">3 Slot</strong>
            </span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca attore, lesione, postazione..."
              className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <select
              value={selectedArtistFilter}
              onChange={(e) => setSelectedArtistFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="ALL">Tutte le 3 Truccatrici</option>
              <option value="TRUCCO-01">TRUCCO-01 • Silvia Rossi (Amputazioni)</option>
              <option value="TRUCCO-02">TRUCCO-02 • Martina Greco (Vie Aeree)</option>
              <option value="TRUCCO-03">TRUCCO-03 • Valeria Sartori (Eviscerazioni)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedActorTypeFilter}
              onChange={(e) => setSelectedActorTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="ALL">Tutte le tipologie attore</option>
              <option value="AMPUTATO">Solo Attori AMPUTATI</option>
              <option value="INTERO">Solo Attori CORPO INTERO</option>
              <option value="FIGURANTE">Solo FIGURANTI Tattici</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedBlockFilter('ALL');
                setSelectedArtistFilter('ALL');
                setSelectedActorTypeFilter('ALL');
                setSearchQuery('');
              }}
              className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resetta Filtri</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto border border-neutral-800">
          <table className="w-full text-left text-xs text-neutral-300 font-mono">
            <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="p-2.5">Blocco</th>
                <th className="p-2.5">Scenario / Pz</th>
                <th className="p-2.5">Postazione</th>
                <th className="p-2.5">Attore Assegnato</th>
                <th className="p-2.5">Truccatrice</th>
                <th className="p-2.5">Tecnico & Regia Simulatore</th>
                <th className="p-2.5 text-center">Convocazione (T-60&apos;)</th>
                <th className="p-2.5 text-center">Finestra Trucco</th>
                <th className="p-2.5 text-center">Pronto (T-15&apos;)</th>
                <th className="p-2.5 text-center">T0</th>
                <th className="p-2.5">Stato Live & Azione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredTableEntries.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-neutral-500">
                    Nessun record corrisponde ai filtri selezionati.
                  </td>
                </tr>
              ) : (
                filteredTableEntries.map((entry) => {
                  const actorObj =
                    actors.find((a) => a.badgeCode === entry.actorCode) ||
                    DEEPHITTER_ACTORS.find((a) => a.badgeCode === entry.actorCode);
                  const liveStatus = getDeephitterEntryLiveStatus(entry, currentCourseMinutes, actorObj?.progressStatus);
                  const isCritical = liveStatus.isCriticalT0InPrep;
                  const isAmputato = actorObj?.physicalStatus === 'AMPUTATO';
                  const isFigurante = actorObj?.amputationDetails.toLowerCase().includes('figurante');
                  const isExpanded = expandedRowId === entry.id;

                  const pzId = entry.patientIds[0];
                  const patient = simulatorPatients.find((p) => p.id === pzId);
                  const isPronto =
                    actorObj?.progressStatus === 'PRONTO_T0' || patient?.techChecklist?.preDone;
                  const assignedTech = getAssignedTechnicianForScenario(technicians, pzId, entry.postazioneLogistica);

                  return (
                    <React.Fragment key={entry.id}>
                      <tr
                        className={`transition-colors ${
                          isCritical
                            ? 'bg-red-950/75 border-l-4 border-l-red-500 ring-1 ring-red-500 text-red-100 font-bold hover:bg-red-900/60'
                            : isExpanded
                            ? 'bg-neutral-950/90'
                            : entry.blockNumber === liveActiveBlockNumber
                            ? 'bg-pink-950/20 hover:bg-neutral-800/60'
                            : 'hover:bg-neutral-800/60'
                        }`}
                      >
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="font-black text-white">B{entry.blockNumber}</span>
                          <span className="text-[10px] text-neutral-500 ml-1">
                            {entry.blockTimeRange.split('-')[0].trim()}
                          </span>
                        </td>

                        <td className="p-2.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-black border border-neutral-700 text-amber-300 font-bold">
                            {entry.scenarioAndPatient}
                          </span>
                        </td>

                        <td className="p-2.5 whitespace-nowrap text-neutral-300 text-[11px]">
                          {entry.postazioneLogistica}
                        </td>

                        <td className="p-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.2 font-black text-[10px] ${
                                isCritical
                                  ? 'bg-red-600 text-white animate-pulse ring-1 ring-red-300'
                                  : 'bg-amber-500 text-black'
                              }`}
                            >
                              {entry.actorCode}
                            </span>
                            <span className={`text-xs ${isCritical ? 'font-black text-white' : 'font-bold text-white'}`}>
                              {entry.actorName}
                            </span>
                            <span
                              className={`px-1 py-0.1 text-[9px] font-black ${
                                isAmputato
                                  ? 'bg-red-600 text-white'
                                  : isFigurante
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-neutral-700 text-neutral-200'
                              }`}
                            >
                              {isAmputato ? 'AMP' : isFigurante ? 'FIG' : 'INT'}
                            </span>
                            {isCritical && (
                              <span className="px-1.5 py-0.2 bg-red-950 border border-red-500 text-red-200 text-[9px] font-black uppercase animate-pulse">
                                ⚠️ T0 &lt; 10m
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 bg-pink-600 text-white font-black text-[10px]">
                              {entry.truccatriceCode}
                            </span>
                            <span className="text-neutral-200 text-xs">
                              {entry.truccatriceName.split(' ')[0]}
                            </span>
                          </div>
                        </td>

                        <td className="p-2.5 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 bg-pink-700 text-white font-mono font-black text-[10px]">
                                {assignedTech.badgeCode}
                              </span>
                              <span className="text-white text-xs font-bold">{assignedTech.name}</span>
                              <span className="text-[9px] text-pink-300 font-mono">(CH-3)</span>
                            </div>
                            {/* Checklist congiunta interattiva */}
                            <div className="flex items-center gap-1 text-[9px]">
                              <span className={`px-1.5 py-0.2 rounded font-bold ${
                                isPronto ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                              }`}>
                                Moulage: {isPronto ? '✓ OK' : 'Prep'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newVal = !patient?.techChecklist?.preDone;
                                  updateTechChecklist(pzId, 'preDone', newVal, 'Checklist congiunta trucco/regia');
                                  showToast(`Simulatore Pz #${pzId}: ${newVal ? 'VERIFICATO & PRONTO (Regia CH-3)' : 'DA VERIFICARE'}`);
                                }}
                                className={`px-1.5 py-0.2 rounded font-bold cursor-pointer transition-colors ${
                                  patient?.techChecklist?.preDone
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 hover:bg-cyan-900'
                                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-700'
                                }`}
                                title="Checklist Regia Simulatore: hardware, getti e parametri"
                              >
                                Simulatore: {patient?.techChecklist?.preDone ? '✓ OK' : 'Verifica'}
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="p-2.5 text-center font-bold text-amber-400 tabular-nums">
                          {entry.convocazioneTime}
                        </td>

                        <td className="p-2.5 text-center text-neutral-300 tabular-nums text-[11px]">
                          {entry.finestraTrucco}
                        </td>

                        <td className="p-2.5 text-center font-bold text-emerald-400 tabular-nums">
                          {entry.prontoTime}
                        </td>

                        <td className="p-2.5 text-center font-black text-red-400 tabular-nums">
                          {entry.t0Time}
                        </td>

                        <td className="p-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTogglePronto(entry)}
                              className={`px-2 py-1 text-[10px] font-black uppercase cursor-pointer flex items-center gap-1 ${
                                isCritical
                                  ? 'bg-red-600 hover:bg-emerald-500 text-white hover:text-black shadow-md animate-pulse'
                                  : isPronto
                                  ? 'bg-emerald-500 text-black'
                                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                              }`}
                              title={isCritical ? "URGENTE: Valida subito Pronto Scena T-15'" : "Valida o reimposta lo stato Pronto Scena T-15'"}
                            >
                              <Check className="w-3 h-3" />
                              <span>{isCritical ? 'Valida T0' : isPronto ? 'PRONTO' : 'Valida'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedRowId(isExpanded ? null : entry.id)
                              }
                              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-[10px] cursor-pointer flex items-center gap-0.5"
                              title="Dettagli lesioni e note operative"
                            >
                              <span>Dettagli</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-neutral-950 border-b border-neutral-800">
                          <td colSpan={11} className="p-3 sm:p-5">
                            <CardOperativaCongiunta
                              patientId={pzId}
                              entry={entry}
                              activeRolePerspective="trucco"
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODALE CARD OPERATIVA CONGIUNTA */}
      {selectedJointCardEntry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl w-full my-auto animate-in fade-in zoom-in-95 duration-200">
            <CardOperativaCongiunta
              patientId={selectedJointCardEntry.patientIds[0]}
              entry={selectedJointCardEntry}
              activeRolePerspective="trucco"
              onClose={() => setSelectedJointCardEntry(null)}
              isModal
            />
          </div>
        </div>
      )}
    </div>
  );
};
