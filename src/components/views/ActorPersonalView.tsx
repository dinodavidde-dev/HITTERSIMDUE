import React, { useState, useMemo, useEffect } from 'react';
import { useCourse } from '../../context/CourseContext';
import { CourseActor, CourseDay, ActorProgressStatus, MakeupArtist } from '../../types';
import {
  DEEPHITTER_CONVOCAZIONI_TABLE,
  DeephitterTruccoEntry,
  DEEPHITTER_ACTORS,
  DEEPHITTER_MAKEUP_ARTISTS,
} from '../../data/deephitterTruccoData';
import {
  getSimulatedCourseMinutes,
  getActiveDeephitterBlockNumber,
  getDeephitterEntryLiveStatus,
  formatMinutesToTime,
  formatMinutesCountdown,
} from '../../utils/deephitterSync';
import { RomaSudWeatherTicker } from '../public/RomaSudWeatherTicker';
import { ParticipantQRModal } from '../anagrafica/ParticipantQRModal';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Info,
  MapPin,
  Maximize2,
  Minimize2,
  Phone,
  QrCode,
  Radio,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  User,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';

interface ActorPersonalViewProps {
  actorId?: string | null;
}

export const ActorPersonalView: React.FC<ActorPersonalViewProps> = ({ actorId }) => {
  const {
    actors,
    makeupArtists,
    activeDay,
    setActiveDay,
    currentSlot,
    timerSeconds,
    updateActorProgressStatus,
    language,
    isFullscreenMode,
    toggleFullscreenMode,
  } = useCourse();

  const isEn = language === 'en';
  const [selectedDay, setSelectedDay] = useState<CourseDay>(activeDay === 3 ? 3 : 2);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [statusConfirmToast, setStatusConfirmToast] = useState<string | null>(null);

  // Synchronize initial day
  useEffect(() => {
    if (activeDay === 2 || activeDay === 3) {
      setSelectedDay(activeDay);
    }
  }, [activeDay]);

  // Identify matching actor
  const currentActor: CourseActor = useMemo(() => {
    const list = actors && actors.length > 0 ? actors : DEEPHITTER_ACTORS;
    if (actorId) {
      const q = actorId.toLowerCase().trim();
      const match = list.find(
        (a) =>
          (a?.id || '').toLowerCase() === q ||
          (a?.badgeCode || '').toLowerCase() === q ||
          (a?.badgeCode || '').toLowerCase().replace('-', '') === q.replace('-', '')
      );
      if (match) return match;
    }
    return (
      list[0] || {
        id: 'act-01',
        slotNumber: 1,
        badgeCode: 'ACT-01',
        name: 'Marco Ferri',
        physicalStatus: 'AMPUTATO',
        amputationDetails:
          'Amputazione coscia DX da mina/IED — Moncone coscia con osso scheggiato e getto arterioso pulsante',
        clothingSize: 'L',
        makeupAllergies: 'Nessuna allergia nota',
        assignedMakeupArtistId: 'truc-1',
        nationality: 'Italiana',
        phone: '+39 320 1122331',
      }
    );
  }, [actorId, actors]);

  // Find assigned makeup artist
  const assignedTruccatrice: MakeupArtist | undefined = useMemo(() => {
    const list = makeupArtists && makeupArtists.length > 0 ? makeupArtists : DEEPHITTER_MAKEUP_ARTISTS;
    const byId = list.find((m) => m.id === currentActor.assignedMakeupArtistId);
    if (byId) return byId;

    // Fallback search by slot number
    const fallbackId = `truc-${((currentActor.slotNumber - 1) % 3) + 1}`;
    return list.find((m) => m.id === fallbackId) || list[0];
  }, [currentActor, makeupArtists]);

  // Convocazioni / Schedule entries for this actor on the selected day
  const actorEntries: DeephitterTruccoEntry[] = useMemo(() => {
    const code = currentActor.badgeCode.toUpperCase();
    return DEEPHITTER_CONVOCAZIONI_TABLE.filter((entry) => {
      const entryCode = (entry.actorCode || '').toUpperCase();
      const matchesCode =
        entryCode === code ||
        entryCode.replace('-', '') === code.replace('-', '') ||
        entry.actorName.toLowerCase().includes(currentActor.name.toLowerCase());
      return matchesCode && entry.day === selectedDay;
    });
  }, [currentActor, selectedDay]);

  // Simulated live clock calculations
  const simMinutes = useMemo(() => {
    return getSimulatedCourseMinutes(currentSlot, timerSeconds);
  }, [currentSlot, timerSeconds]);

  const activeBlockNum = useMemo(() => {
    return getActiveDeephitterBlockNumber(simMinutes);
  }, [simMinutes]);

  // Active / Highlighted entry
  const activeEntry: DeephitterTruccoEntry | undefined = useMemo(() => {
    return (
      actorEntries.find((e) => e.blockNumber === activeBlockNum) ||
      actorEntries[0]
    );
  }, [actorEntries, activeBlockNum]);

  // Active entry live status
  const liveStatus = useMemo(() => {
    if (!activeEntry) return null;
    return getDeephitterEntryLiveStatus(activeEntry, simMinutes, currentActor.progressStatus);
  }, [activeEntry, simMinutes, currentActor.progressStatus]);

  // Update progress status handler
  const handleUpdateStatus = async (newStatus: ActorProgressStatus) => {
    try {
      await updateActorProgressStatus(currentActor.id, newStatus, {
        updatedBy: currentActor.name,
        notifyRegia: true,
      });
      const label =
        newStatus === 'PRONTO_T0'
          ? (isEn ? 'CONFIRMED READY AT SCENE GATE' : 'CONFERMATO PRONTO AL GATE SCENARIO')
          : newStatus === 'IN_PREPARAZIONE'
          ? (isEn ? 'IN MAKEUP APPLICATION' : 'IN APPLICAZIONE TRUCCO')
          : newStatus === 'IN_SCENARIO'
          ? (isEn ? 'IN ACTIVE SCENARIO' : 'IN SCENARIO ATTIVO')
          : (isEn ? 'STANDBY STATUS REGISTERED' : 'STATO STANDBY REGISTRATO');

      setStatusConfirmToast(label);
      setTimeout(() => setStatusConfirmToast(null), 4000);
    } catch (e) {
      console.error('Failed to update actor status:', e);
    }
  };

  const progressStatus = currentActor.progressStatus || 'STANDBY';

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* 1. Top Header styled after Public/Guest view */}
      <div className="bg-neutral-950 border-2 border-rose-500/80 p-3 sm:p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-rose-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-700 font-mono text-[10px] font-black uppercase tracking-wider">
                  {isEn ? 'SIMULATED CASUALTY ACTOR' : 'FIGURANTE / PAZIENTE SIMULATO'}
                </span>
                <span className="font-mono text-xs font-bold text-neutral-400">
                  DAY 0{selectedDay} • HITTER EM
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
                {currentActor.name} • <span className="font-mono text-rose-400">{currentActor.badgeCode}</span>
              </h1>
            </div>
          </div>

          {/* Quick Day Switcher & Fullscreen Mode */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setSelectedDay(2)}
                className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer ${
                  selectedDay === 2
                    ? 'bg-rose-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                DAY 02
              </button>
              <button
                type="button"
                onClick={() => setSelectedDay(3)}
                className={`px-3 py-1 font-bold uppercase transition-colors cursor-pointer ${
                  selectedDay === 3
                    ? 'bg-rose-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                DAY 03
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold uppercase flex items-center gap-1 transition-colors"
              title={isEn ? 'Show Badge QR Code' : 'Mostra QR Badge'}
            >
              <QrCode className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">QR PASS</span>
            </button>

            {toggleFullscreenMode && (
              <button
                type="button"
                onClick={toggleFullscreenMode}
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 transition-colors"
                title={isFullscreenMode ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Live Weather & Simulation Sync Ticker */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 text-xs">
          <RomaSudWeatherTicker />
          <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400 bg-neutral-900/90 border border-neutral-800 px-2.5 py-1">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span>{isEn ? 'SIMULATED TIME' : 'ORA SIMULATA'}:</span>
            <strong className="text-white font-black">{formatMinutesToTime(simMinutes)}</strong>
            <span className="text-neutral-600">|</span>
            <span className="text-rose-400 font-bold uppercase">
              {isEn ? 'SLOT LIVE' : 'SLOT ATTIVO'}: {currentSlot?.timeRange || '08:30 - 10:00'}
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Toast */}
      {statusConfirmToast && (
        <div className="bg-emerald-600 text-white font-mono text-xs font-black p-3 shadow-lg flex items-center justify-between animate-fade-in border border-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusConfirmToast}</span>
          </div>
          <span className="text-[10px] opacity-80 uppercase">NOTIFICA INVIATA A REGIA & TRUCCO</span>
        </div>
      )}

      {/* 2. Actor Dossier & Assigned Makeup Specialist */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Physical Status & Medical Alerts (7 cols) */}
        <div className="md:col-span-7 bg-neutral-950 border border-neutral-800 p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              {isEn ? 'ACTOR PROFILE & STATUS' : 'SCHEDA FIGURANTE & STATO FISICO'}
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-black uppercase border ${
                currentActor.physicalStatus === 'AMPUTATO'
                  ? 'bg-rose-950 text-rose-300 border-rose-500'
                  : 'bg-cyan-950 text-cyan-300 border-cyan-500'
              }`}
            >
              {currentActor.physicalStatus === 'AMPUTATO' ? 'PAZIENTE AMPUTATO REALISTICO' : 'CORPO INTERO / POLITRAUMA'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Amputation / Trauma Role */}
            {currentActor.amputationDetails && (
              <div className="p-2.5 bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block font-mono">
                  {isEn ? 'Clinical Anatomy & Specialization' : 'Caratteristica Anatomica & Ruolo di Scena'}
                </span>
                <p className="font-bold text-white leading-relaxed">
                  {currentActor.amputationDetails}
                </p>
              </div>
            )}

            {/* Sizes & Slot */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              {currentActor.clothingSize && (
                <div className="p-2 bg-neutral-900 border border-neutral-850">
                  <span className="text-[10px] text-neutral-400 block uppercase">{isEn ? 'Uniform Size' : 'Taglia Divisa'}:</span>
                  <strong className="text-white text-sm">{currentActor.clothingSize}</strong>
                </div>
              )}
              {currentActor.slotNumber ? (
                <div className="p-2 bg-neutral-900 border border-neutral-850">
                  <span className="text-[10px] text-neutral-400 block uppercase">{isEn ? 'Slot Number' : 'Postazione Slot'}:</span>
                  <strong className="text-rose-400 text-sm">ATT-{String(currentActor.slotNumber).padStart(2, '0')}</strong>
                </div>
              ) : null}
            </div>

            {/* Allergy Banner */}
            {currentActor.makeupAllergies && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase font-mono block text-[10px] text-amber-400">
                    {isEn ? 'MAKEUP & ADHESIVE ALLERGY PROTOCOL' : 'AVVERTENZE ALLERGIE & ADESIVI TRUCCO'}
                  </span>
                  <span>{currentActor.makeupAllergies}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Assigned Makeup Artist Card (5 cols) */}
        <div className="md:col-span-5 bg-neutral-950 border border-neutral-800 p-4 space-y-3 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {isEn ? 'ASSIGNED MAKEUP SPECIALIST' : 'TRUCCATORE DEDICATO'}
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {assignedTruccatrice?.badgeCode || 'TRUCCO-01'}
              </span>
            </div>

            {assignedTruccatrice ? (
              <div className="space-y-2 pt-2">
                <div>
                  <h3 className="font-black text-white text-sm uppercase">
                    {assignedTruccatrice.name}
                  </h3>
                  <p className="text-[11px] text-pink-300 font-sans mt-0.5">
                    {assignedTruccatrice.role}
                  </p>
                </div>

                <div className="p-2 bg-neutral-900 border border-neutral-850 text-xs space-y-1">
                  <div className="text-[10px] text-neutral-400 uppercase font-mono flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-pink-400" />
                    <span>{isEn ? 'Makeup Lab Location' : 'Postazione Lab Trucco'}:</span>
                  </div>
                  <strong className="text-white block font-sans">
                    {assignedTruccatrice.assignedStation || 'Lab Moulage Centrale'}
                  </strong>
                </div>

                {assignedTruccatrice.phone && (
                  <a
                    href={`tel:${assignedTruccatrice.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-emerald-700/60 font-mono text-xs font-bold uppercase transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{assignedTruccatrice.phone}</span>
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 py-4">
                {isEn ? 'No makeup specialist assigned.' : 'Nessun truccatore assegnato.'}
              </p>
            )}
          </div>

          <div className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-850 font-mono">
            {isEn
              ? 'Present yourself at the makeup lab 60 minutes prior to scenario T0.'
              : 'Presentati in postazione trucco T-60 minuti prima di ogni scenario.'}
          </div>
        </div>
      </div>

      {/* 3. Interactive Readiness Confirmation & Live Status Card */}
      <div className="bg-neutral-950 border-2 border-emerald-500/80 p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-850 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 font-mono tracking-widest block">
              {isEn ? 'REAL-TIME SCENARIO READINESS' : 'STATO OPERATIVO IN TEMPO REALE'}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase flex items-center gap-2">
              <span>{isEn ? 'Live Ready Confirmation' : 'Conferma Stato & Ingresso in Scena'}</span>
            </h2>
          </div>

          {/* Current Status Pill */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 font-mono text-xs font-black uppercase border flex items-center gap-1.5 ${
                progressStatus === 'PRONTO_T0'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-400 ring-2 ring-emerald-400/50'
                  : progressStatus === 'IN_PREPARAZIONE'
                  ? 'bg-amber-950 text-amber-300 border-amber-400 animate-pulse'
                  : progressStatus === 'IN_SCENARIO'
                  ? 'bg-rose-950 text-rose-300 border-rose-400'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {progressStatus === 'PRONTO_T0'
                  ? (isEn ? 'READY FOR SCENARIO (PRONTO)' : 'PRONTO AL GATE SCENARIO')
                  : progressStatus === 'IN_PREPARAZIONE'
                  ? (isEn ? 'IN MAKEUP APPLICATION' : 'IN APPLICAZIONE TRUCCO')
                  : progressStatus === 'IN_SCENARIO'
                  ? (isEn ? 'IN ACTIVE SCENE' : 'IN SCENARIO ATTIVO')
                  : (isEn ? 'STANDBY / WAITING' : 'IN STANDBY')}
              </span>
            </span>
          </div>
        </div>

        {/* Big Interactive Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Action 1: In Preparazione */}
          <button
            type="button"
            onClick={() => handleUpdateStatus('IN_PREPARAZIONE')}
            className={`p-3 font-mono text-xs font-black uppercase border transition-all text-left flex flex-col gap-1 cursor-pointer ${
              progressStatus === 'IN_PREPARAZIONE'
                ? 'bg-amber-600 text-black border-amber-300 ring-2 ring-amber-400'
                : 'bg-neutral-900 hover:bg-neutral-850 text-amber-300 border-amber-800/80 hover:border-amber-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>1. {isEn ? 'IN TRUCCO' : 'IN TRUCCO'}</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[10px] opacity-80 font-sans">
              {isEn ? 'Arrived at makeup lab' : 'Arrivato al Lab Moulage'}
            </span>
          </button>

          {/* Action 2: PRONTO AL GATE (Recommended Primary) */}
          <button
            type="button"
            onClick={() => handleUpdateStatus('PRONTO_T0')}
            className={`p-3 font-mono text-xs font-black uppercase border transition-all text-left flex flex-col gap-1 cursor-pointer ${
              progressStatus === 'PRONTO_T0'
                ? 'bg-emerald-600 text-black border-emerald-300 ring-2 ring-emerald-400 shadow-lg'
                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>2. {isEn ? 'PRONTO AL GATE' : 'PRONTO AL GATE (T-15\')'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] opacity-80 font-sans">
              {isEn ? 'Confirm ready at tactical box' : 'Conferma trucco finito & pronto'}
            </span>
          </button>

          {/* Action 3: Fine Scenario / Standby */}
          <button
            type="button"
            onClick={() => handleUpdateStatus('RESET_SMONTAGGIO')}
            className={`p-3 font-mono text-xs font-black uppercase border transition-all text-left flex flex-col gap-1 cursor-pointer ${
              progressStatus === 'RESET_SMONTAGGIO'
                ? 'bg-neutral-700 text-white border-neutral-400'
                : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>3. {isEn ? 'RESET / STRUCCO' : 'RESET / STRUCCO'}</span>
              <RefreshCw className="w-4 h-4" />
            </div>
            <span className="text-[10px] opacity-80 font-sans">
              {isEn ? 'Scenario completed' : 'Scena conclusa / riposo'}
            </span>
          </button>
        </div>

        {currentActor.progressUpdatedAt && (
          <p className="text-[10px] font-mono text-neutral-400 text-right">
            {isEn ? 'Last update' : 'Ultimo aggiornamento'}:{' '}
            <strong className="text-white">{currentActor.progressUpdatedAt}</strong>
            {currentActor.progressUpdatedBy && ` (${currentActor.progressUpdatedBy})`}
          </p>
        )}
      </div>

      {/* 4. Timeline Trucco (Driven by DEEPHITTER_CONVOCAZIONI_TABLE for this actor) */}
      <div className="bg-neutral-950 border border-neutral-800 p-4 sm:p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
              {isEn ? 'Makeup & Scenario Convocazione Timeline' : 'Cronoprogramma Convocazioni & Timeline Trucco'}
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            DAY 0{selectedDay} • {actorEntries.length} {isEn ? 'Scenarios' : 'Scenari'}
          </span>
        </div>

        {actorEntries.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-xs border border-dashed border-neutral-800">
            <Info className="w-6 h-6 mx-auto mb-2 text-neutral-600" />
            {isEn
              ? 'No scheduled scenarios found for this actor on Day 0' + selectedDay
              : 'Nessuna convocazione programmata per questo figurante nel Day 0' + selectedDay}
          </div>
        ) : (
          <div className="space-y-4">
            {actorEntries.map((entry) => {
              const isCurrentBlock = entry.blockNumber === activeBlockNum;
              const status = getDeephitterEntryLiveStatus(entry, simMinutes, currentActor.progressStatus);

              return (
                <div
                  key={entry.id}
                  className={`border transition-all ${
                    isCurrentBlock
                      ? 'bg-neutral-900/90 border-rose-500 shadow-xl ring-1 ring-rose-500/50'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Block Header */}
                  <div className="p-3 bg-neutral-900 border-b border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 text-xs font-mono font-black uppercase border ${
                          isCurrentBlock
                            ? 'bg-rose-600 text-white border-rose-400'
                            : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                        }`}
                      >
                        {entry.blockLabel}
                      </span>
                      <span className="font-bold text-white text-xs sm:text-sm uppercase font-sans">
                        {entry.scenarioAndPatient}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{entry.postazioneLogistica}</span>
                      </span>
                      {isCurrentBlock && (
                        <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-600 text-[10px] font-mono font-bold animate-pulse">
                          IN CORSO ORA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operational Milestones Grid */}
                  <div className="p-3 sm:p-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      {/* 1. Convocazione */}
                      <div className="p-2.5 bg-neutral-900 border border-neutral-850 space-y-0.5">
                        <span className="text-[10px] text-neutral-400 uppercase block font-bold">
                          {isEn ? '1. Convocazione (T-60\')' : '1. Convocazione (T-60\')'}
                        </span>
                        <strong className="text-sm text-amber-300 font-black block">
                          {entry.convocazioneTime}
                        </strong>
                        <span className="text-[10px] text-neutral-400 font-sans block">
                          Lab {entry.truccatriceCode}
                        </span>
                      </div>

                      {/* 2. Finestra Trucco */}
                      <div className="p-2.5 bg-neutral-900 border border-neutral-850 space-y-0.5">
                        <span className="text-[10px] text-neutral-400 uppercase block font-bold">
                          {isEn ? '2. Finestra Trucco' : '2. Finestra Trucco'}
                        </span>
                        <strong className="text-sm text-pink-300 font-black block">
                          {entry.finestraTrucco}
                        </strong>
                        <span className="text-[10px] text-neutral-400 font-sans block">
                          Applicazione moulage
                        </span>
                      </div>

                      {/* 3. Pronto al Box */}
                      <div className="p-2.5 bg-neutral-900 border border-neutral-850 space-y-0.5">
                        <span className="text-[10px] text-neutral-400 uppercase block font-bold">
                          {isEn ? '3. Pronto (T-15\')' : '3. Pronto al Box (T-15\')'}
                        </span>
                        <strong className="text-sm text-emerald-400 font-black block">
                          {entry.prontoTime}
                        </strong>
                        <span className="text-[10px] text-neutral-400 font-sans block">
                          Check pre-allerta
                        </span>
                      </div>

                      {/* 4. T0 Start */}
                      <div className="p-2.5 bg-neutral-900 border border-neutral-850 space-y-0.5">
                        <span className="text-[10px] text-neutral-400 uppercase block font-bold">
                          {isEn ? '4. Inizio Scena (T0)' : '4. Inizio Scena (T0)'}
                        </span>
                        <strong className="text-sm text-rose-400 font-black block">
                          {entry.t0Time}
                        </strong>
                        <span className="text-[10px] text-neutral-400 font-sans block">
                          Ingaggio clinico
                        </span>
                      </div>
                    </div>

                    {/* Clinical Lesion & FX Details */}
                    <div className="p-3 bg-neutral-900/60 border border-neutral-850 space-y-2 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold uppercase text-rose-400 block">
                          {isEn ? 'Assigned Clinical Lesions' : 'Lesioni Cliniche & Effetti Moulage'}:
                        </span>
                        <p className="font-bold text-white font-sans leading-relaxed">
                          {entry.lesioniClinicheMoulage}
                        </p>
                      </div>

                      {entry.presidioMoulageFx && (
                        <div className="space-y-0.5 pt-1 border-t border-neutral-800">
                          <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">
                            {isEn ? 'Special FX Devices' : 'Presidi Speciali FX & Circuiti Sangue'}:
                          </span>
                          <p className="text-neutral-300 font-sans">
                            {entry.presidioMoulageFx}
                          </p>
                        </div>
                      )}

                      {entry.noteOperativeRicarica && (
                        <div className="space-y-0.5 pt-1 border-t border-neutral-800">
                          <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">
                            {isEn ? 'Acting & Reset Instructions' : 'Istruzioni di Recitazione & Reset'}:
                          </span>
                          <p className="text-neutral-400 font-sans italic">
                            {entry.noteOperativeRicarica}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <ParticipantQRModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        person={currentActor}
        category="attori"
      />
    </div>
  );
};
