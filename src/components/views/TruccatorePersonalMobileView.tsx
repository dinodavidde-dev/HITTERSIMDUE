import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useCourse } from '../../context/CourseContext';
import { CourseDay, MakeupArtist, ProtesiItem, TimelineSlot } from '../../types';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import {
  DEEPHITTER_CONVOCAZIONI_TABLE,
  DeephitterTruccoEntry,
  DEEPHITTER_ACTORS,
} from '../../data/deephitterTruccoData';
import {
  getSimulatedCourseMinutes,
  getActiveDeephitterBlockNumber,
  getDeephitterEntryLiveStatus,
  getDeephitterEntriesForArtist,
  formatMinutesToTime,
  formatMinutesCountdown,
} from '../../utils/deephitterSync';
import { ParticipantQRModal } from '../anagrafica/ParticipantQRModal';
import { TruccatoreScenarioChecklistCard } from './TruccatoreScenarioChecklistCard';
import { CardOperativaCongiunta } from '../common/CardOperativaCongiunta';
import { TimelineSyncNavigator } from '../common/TimelineSyncNavigator';
import {
  Clock,
  CheckCircle2,
  Package,
  Layers,
  QrCode,
  ExternalLink,
  Activity,
  FileSpreadsheet,
  Check,
  Target,
  ArrowDown,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface TruccatorePersonalMobileViewProps {
  artistId?: string;
  onExitStandalone?: () => void;
}

export const TruccatorePersonalMobileView: React.FC<TruccatorePersonalMobileViewProps> = ({
  artistId,
  onExitStandalone,
}) => {
  const {
    makeupArtists,
    actors,
    simulatorPatients,
    protesiCatalog,
    activeDay,
    setActiveDay,
    currentSlot,
    timerSeconds,
    updateActorProgressStatus,
    updateTechChecklist,
    sendCourseMessage,
    language,
  } = useCourse();

  const isEn = language === 'en';
  const [selectedDay, setSelectedDay] = useState<CourseDay>(activeDay === 3 ? 3 : 2);
  const [inspectedSlot, setInspectedSlot] = useState<TimelineSlot | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [radioToast, setRadioToast] = useState<string | null>(null);
  const [mobileLayoutMode, setMobileLayoutMode] = useState<'spotlight' | 'card_congiunta' | 'all_scenarios' | 'table'>('spotlight');

  const liveMasterSlot = currentSlot || INITIAL_TIMELINE_SLOTS[0];
  const effectiveSlot = inspectedSlot || liveMasterSlot;
  const isLiveSync = !inspectedSlot || inspectedSlot.id === liveMasterSlot.id;

  // Active scenario ref for auto-scroll
  const activeScenarioRef = useRef<HTMLDivElement | null>(null);

  // Identify active makeup artist
  const artist: MakeupArtist = useMemo(() => {
    if (artistId) {
      const match = makeupArtists.find(
        (m) =>
          m.id.toLowerCase() === artistId.toLowerCase() ||
          m.badgeCode.toLowerCase() === artistId.toLowerCase()
      );
      if (match) return match;
    }
    return (
      makeupArtists[0] || {
        id: 'truc-1',
        badgeCode: 'TRUCCO-01',
        name: 'Silvia Rossi',
        role: 'Specialista Traumi Maggiori, Amputazioni & Sanguinamento Attivo',
        specialty: 'Monconi balistici da blast/IED, amputazioni traumatiche, flusso arterioso a getto e REBOA',
        nationality: 'Italiana',
        phone: '+39 333 1234567',
        assignedStation: 'Ambiente Tattico 3 / Lab Moulage',
      }
    );
  }, [artistId, makeupArtists]);

  // Real-time simulated course clock
  const currentCourseMinutes = useMemo(() => {
    return getSimulatedCourseMinutes(currentSlot, timerSeconds);
  }, [currentSlot, timerSeconds]);

  // Active block number derived from real-time clock
  const liveActiveBlockNumber = useMemo(() => {
    return getActiveDeephitterBlockNumber(currentCourseMinutes);
  }, [currentCourseMinutes]);

  // All DEEPHITTER entries for this artist on the selected day
  const artistEntriesForDay = useMemo(() => {
    return getDeephitterEntriesForArtist(artist.badgeCode, selectedDay);
  }, [artist.badgeCode, selectedDay]);

  // Active entry for this artist in the current block
  const activeBlockEntry = useMemo(() => {
    return (
      artistEntriesForDay.find((e) => e.blockNumber === liveActiveBlockNumber) ||
      artistEntriesForDay[0]
    );
  }, [artistEntriesForDay, liveActiveBlockNumber]);

  // Smooth auto-scroll function
  const scrollToActiveScenario = () => {
    if (activeScenarioRef.current) {
      activeScenarioRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Auto-scroll when live block or day changes
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToActiveScenario();
    }, 350);
    return () => clearTimeout(timer);
  }, [liveActiveBlockNumber, selectedDay]);

  // Helpers for Protesi
  const getProtesiForPatient = (patientId: number): ProtesiItem[] => {
    return protesiCatalog.filter((item) =>
      item.scenariosUsed?.some((s) => s.patientId === patientId)
    );
  };

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
        updatedBy: `${artist.badgeCode} • ${artist.name}`,
        notifyRegia: true,
      });
    }

    if (pzId && patient) {
      updateTechChecklist(pzId, 'preDone', nextPreDone);
    }

    if (nextPreDone && sendCourseMessage) {
      sendCourseMessage({
        senderId: artist.badgeCode,
        senderName: `${artist.name} (Lab Moulage)`,
        senderRole: 'tecnico',
        type: 'info',
        subject: `TARGET PRONTO SCENA (T-15') VALIDATO • ${entry.scenarioAndPatient}`,
        content: `La truccatrice ${artist.badgeCode} ha completato trucco e kit protesi per ${entry.scenarioAndPatient} (${entry.actorCode} ${entry.actorName}). Pronto al T0 (${entry.t0Time}).`,
      });
    }

    setRadioToast(
      nextPreDone
        ? `✓ ${entry.actorCode} validato PRONTO SCENA (T-15')! Notifica inviata a Regia CH-3.`
        : `Stato di ${entry.actorCode} reimpostato su IN PREPARAZIONE.`
    );
    setTimeout(() => setRadioToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col justify-between selection:bg-pink-600 selection:text-white pb-14">
      {/* Top Mobile Tactical Bar */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-pink-700/60 p-3 sm:p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Identity info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-1 bg-pink-600 text-white font-black text-xs rounded tracking-wider shrink-0 shadow-sm">
              {artist.badgeCode}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-base font-black text-white truncate">
                  {artist.name}
                </h1>
                <span className="text-[10px] bg-neutral-900 border border-neutral-700 px-1.5 py-0.2 rounded text-pink-300 truncate">
                  DEEPHITTER VMK1 REV.3
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 truncate">
                {artist.role}
              </div>
            </div>
          </div>

          {/* Action buttons (QR Pass & Switch to full app) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-pink-600/70 text-pink-300 rounded cursor-pointer transition-colors"
              title="Visualizza QR Pass Personale"
            >
              <QrCode className="w-4 h-4" />
            </button>
            {onExitStandalone && (
              <button
                type="button"
                onClick={onExitStandalone}
                className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[11px] text-neutral-300 rounded cursor-pointer transition-colors flex items-center gap-1"
                title="Accedi alla visuale generale del corso"
              >
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Visuale Completa</span>
              </button>
            )}
          </div>
        </div>

        {/* Tactical Sub-Bar: Day Selector & Live Countdown */}
        <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded border border-neutral-800">
            {([2, 3] as CourseDay[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setSelectedDay(d);
                  setActiveDay(d);
                }}
                className={`px-3 py-1 text-xs font-bold uppercase rounded cursor-pointer transition-all ${
                  selectedDay === d
                    ? 'bg-pink-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                DAY 0{d} ({d === 2 ? 'Scenari 1–12' : 'Scenari 13–24'})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-300">
            <button
              type="button"
              onClick={scrollToActiveScenario}
              className="px-2 py-0.5 bg-emerald-950 border border-emerald-500/80 hover:bg-emerald-900 text-emerald-300 rounded text-[10px] font-bold cursor-pointer flex items-center gap-1 animate-pulse"
              title="Scorri direttamente alla scheda dello scenario attivo"
            >
              <Target className="w-3 h-3" />
              <span>Centra Attivo (B{liveActiveBlockNumber})</span>
            </button>

            <span className="flex items-center gap-1 text-pink-300 font-bold tabular-nums">
              <Clock className="w-3.5 h-3.5" />
              {formatMinutesToTime(currentCourseMinutes)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Mobile Content */}
      <main className="max-w-4xl mx-auto w-full p-3 sm:p-5 space-y-4 flex-1">
        {/* Sincronizzazione automatica con timeline di Regia e navigatore consultazione slot */}
        <TimelineSyncNavigator
          currentSlot={effectiveSlot}
          masterCurrentSlot={liveMasterSlot}
          isLiveSync={isLiveSync}
          onSelectSlot={(slot) => setInspectedSlot(slot)}
          onSyncToLive={() => setInspectedSlot(null)}
          roleLabel={isEn ? `Makeup Artist (${artist.badgeCode})` : `Truccatore (${artist.badgeCode})`}
          stationContext={artist.assignedStation}
        />

        {/* Radio Confirmation Toast */}
        {radioToast && (
          <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold rounded flex items-center justify-between animate-fadeIn shadow-2xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{radioToast}</span>
            </div>
            <span className="text-[10px] bg-black/60 px-2 py-0.5 text-emerald-400 uppercase">
              CH-3 REGIA SYNC
            </span>
          </div>
        )}

        {/* View Mode Selector */}
        <div className="flex items-center justify-between gap-2 bg-neutral-900 p-1.5 rounded-lg border border-neutral-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 pl-1">
            Modalità:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileLayoutMode('spotlight')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                mobileLayoutMode === 'spotlight'
                  ? 'bg-pink-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Attivo in Evidenza
            </button>
            <button
              type="button"
              onClick={() => setMobileLayoutMode('card_congiunta')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                mobileLayoutMode === 'card_congiunta'
                  ? 'bg-fuchsia-600 text-white shadow ring-1 ring-fuchsia-400'
                  : 'text-pink-300 hover:text-white'
              }`}
            >
              <Sliders className="w-3 h-3 text-pink-400" />
              <span>Card Congiunta Trucco/Tech</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileLayoutMode('all_scenarios')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                mobileLayoutMode === 'all_scenarios'
                  ? 'bg-pink-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Tutti i Blocchi ({artistEntriesForDay.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileLayoutMode('table')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                mobileLayoutMode === 'table'
                  ? 'bg-pink-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Tabella Riassuntiva
            </button>
          </div>
        </div>

        {/* =====================================================================
            CARD OPERATIVA CONGIUNTA TRUCCO & TECNICO ASSEGNATO
        ====================================================================== */}
        {mobileLayoutMode === 'card_congiunta' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-fuchsia-400 px-1">
              <span className="flex items-center gap-1.5 uppercase text-[11px]">
                <Sliders className="w-4 h-4 text-fuchsia-400" />
                <span>Card Operativa Congiunta • Sinergia Trucco & Simulatore</span>
              </span>
              <span className="text-[10px] text-neutral-400">
                Spunta condivisa & Feedback Regia CH-3
              </span>
            </div>

            {(() => {
              const targetEntry = activeBlockEntry || artistEntriesForDay[0];
              if (!targetEntry) {
                return (
                  <div className="p-6 bg-neutral-900 border border-neutral-800 text-center text-neutral-400 text-xs">
                    Nessuno scenario assegnato per il Day 0{selectedDay}
                  </div>
                );
              }
              return (
                <CardOperativaCongiunta
                  patientId={targetEntry.patientIds[0]}
                  entry={targetEntry}
                  activeRolePerspective="trucco"
                />
              );
            })()}
          </div>
        )}

        {/* =====================================================================
            1. HERO SPOTLIGHT: SCHEDA SCENARIO ATTIVO IN EVIDENZA IN ALTO
        ====================================================================== */}
        {(mobileLayoutMode === 'spotlight' || mobileLayoutMode === 'all_scenarios') && activeBlockEntry && (
          <div ref={activeScenarioRef} className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 px-1">
              <span className="flex items-center gap-1.5 uppercase text-[11px]">
                <Activity className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Scenario Attivo Sincronizzato con il Corso</span>
              </span>
              <span className="text-[10px] text-neutral-400">
                Auto-scroll live attivo
              </span>
            </div>

            <TruccatoreScenarioChecklistCard
              entry={activeBlockEntry}
              artist={artist}
              isActiveScenario={true}
              currentCourseMinutes={currentCourseMinutes}
              isPronto={Boolean(
                actors.find((a) => a.badgeCode === activeBlockEntry.actorCode)?.progressStatus ===
                  'PRONTO_T0' ||
                  simulatorPatients.find((p) => p.id === activeBlockEntry.patientIds[0])?.techChecklist
                    ?.preDone
              )}
              onValidatePronto={() => handleTogglePronto(activeBlockEntry)}
              protesiList={getProtesiForPatient(activeBlockEntry.patientIds[0])}
              actor={actors.find((a) => a.badgeCode === activeBlockEntry.actorCode)}
            />
          </div>
        )}

        {/* =====================================================================
            2. ALTRI SCENARI DELLA GIORNATA (CON CHECKLIST PROTESI & CONSUMABILI)
        ====================================================================== */}
        {mobileLayoutMode === 'all_scenarios' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-300 px-1 border-t border-neutral-800 pt-3">
              <span className="flex items-center gap-1.5 uppercase text-[11px] text-pink-300">
                <Layers className="w-4 h-4" />
                <span>Tutti gli Scenari Assegnati — Day 0{selectedDay}</span>
              </span>
              <span className="text-[10px] text-neutral-400">
                {artistEntriesForDay.length} blocchi totali
              </span>
            </div>

            {artistEntriesForDay
              .filter((e) => e.id !== activeBlockEntry?.id)
              .map((entry) => {
                const actorObj = actors.find((a) => a.badgeCode === entry.actorCode);
                const pzId = entry.patientIds[0];
                const patient = simulatorPatients.find((p) => p.id === pzId);
                const isPronto =
                  actorObj?.progressStatus === 'PRONTO_T0' || patient?.techChecklist?.preDone;

                return (
                  <TruccatoreScenarioChecklistCard
                    key={entry.id}
                    entry={entry}
                    artist={artist}
                    isActiveScenario={false}
                    currentCourseMinutes={currentCourseMinutes}
                    isPronto={Boolean(isPronto)}
                    onValidatePronto={() => handleTogglePronto(entry)}
                    protesiList={getProtesiForPatient(pzId)}
                    actor={actorObj}
                  />
                );
              })}
          </div>
        )}

        {/* =====================================================================
            3. TABELLA RIASSUNTIVA UFFICIALE DEEPHITTER PER QUESTA TRUCCATRICE
        ====================================================================== */}
        {mobileLayoutMode === 'table' && (
          <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-black text-white uppercase">
                  Piano Operativo Individuale — {artist.badgeCode} (Day 0{selectedDay})
                </h3>
              </div>
              <span className="text-[10px] text-neutral-400">
                {artistEntriesForDay.length} Scenari Assegnati
              </span>
            </div>

            <div className="space-y-3">
              {artistEntriesForDay.map((entry) => {
                const liveStatus = getDeephitterEntryLiveStatus(entry, currentCourseMinutes);
                const actorObj = DEEPHITTER_ACTORS.find((a) => a.badgeCode === entry.actorCode);
                const pzId = entry.patientIds[0];
                const patient = simulatorPatients.find((p) => p.id === pzId);
                const isPronto =
                  actorObj?.progressStatus === 'PRONTO_T0' || patient?.techChecklist?.preDone;

                return (
                  <div
                    key={entry.id}
                    className={`p-3.5 bg-neutral-950 rounded-lg border transition-all ${
                      isPronto
                        ? 'border-emerald-500/80 shadow-md shadow-emerald-500/10'
                        : entry.blockNumber === liveActiveBlockNumber
                        ? 'border-pink-500 ring-1 ring-pink-500/60'
                        : 'border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-neutral-850 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-pink-600 text-white font-black rounded text-[10px]">
                          BLOCCO {entry.blockNumber}
                        </span>
                        <span className="font-black text-white">{entry.scenarioAndPatient}</span>
                        <span className="text-[10px] text-neutral-400">({entry.postazioneLogistica})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-amber-400 tabular-nums">
                          Conv: {entry.convocazioneTime}
                        </span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-[11px] font-bold text-emerald-400 tabular-nums">
                          Pronto: {entry.prontoTime}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 bg-amber-500 text-black font-black text-[10px] rounded">
                            {entry.actorCode}
                          </span>
                          <span className="text-xs font-bold text-white">{entry.actorName}</span>
                          <span
                            className={`px-1 py-0.1 text-[9px] font-black rounded ${
                              actorObj?.physicalStatus === 'AMPUTATO'
                                ? 'bg-red-600 text-white'
                                : actorObj?.amputationDetails.toLowerCase().includes('figurante')
                                ? 'bg-purple-600 text-white'
                                : 'bg-neutral-700 text-neutral-200'
                            }`}
                          >
                            {actorObj?.physicalStatus || 'INTERO'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTogglePronto(entry)}
                          className={`px-2 py-1 text-[10px] font-black uppercase rounded cursor-pointer flex items-center gap-1 ${
                            isPronto
                              ? 'bg-emerald-500 text-black'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{isPronto ? 'PRONTO T-15\'' : 'Valida'}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-300 font-sans leading-snug bg-neutral-900/70 p-2 rounded border border-neutral-800">
                        {entry.lesioniClinicheMoulage}
                      </div>

                      {entry.noteOperativeRicarica && (
                        <div className="text-[10px] text-amber-300/80 font-sans">
                          ⚡ {entry.noteOperativeRicarica}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Floating Bottom Quick Action Button to re-center active scenario */}
      <div className="fixed bottom-3 right-3 z-30">
        <button
          type="button"
          onClick={scrollToActiveScenario}
          className="p-2.5 bg-neutral-950/95 hover:bg-emerald-600 text-emerald-400 hover:text-black border-2 border-emerald-500/80 rounded-full shadow-2xl backdrop-blur-md cursor-pointer flex items-center gap-1.5 transition-all text-xs font-black uppercase"
          title="Centra lo scenario attivo corrente"
        >
          <Target className="w-4 h-4" />
          <span className="hidden sm:inline">Scenario Attivo</span>
        </button>
      </div>

      {/* Participant QR Modal */}
      <ParticipantQRModal
        isOpen={qrModalOpen}
        person={artist}
        category="truccatori"
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
};
