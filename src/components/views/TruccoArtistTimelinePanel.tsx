import React, { useState, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  ActorPhysicalStatus,
  ClothingSize,
  CourseActor,
  CourseDay,
  MakeupArtist,
  ProtesiItem,
} from '../../types';
import {
  buildPersonalizedArtistTimeline,
  getArtistWorkloadStats,
} from '../../utils/truccoBalancer';
import {
  ActorProgressStatusControl,
  ACTOR_PROGRESS_META,
  getStatusIcon,
} from '../anagrafica/ActorProgressStatusControl';
import {
  Sparkles,
  Users,
  UserCheck,
  RefreshCw,
  Plus,
  CheckCircle2,
  ShieldAlert,
  Shirt,
  Package,
  Columns,
  User,
  Wrench,
  ArrowRight,
  Clock,
  X,
} from 'lucide-react';

interface TruccoArtistTimelinePanelProps {
  selectedDay: CourseDay;
  onSelectDay: (day: CourseDay) => void;
}

export const TruccoArtistTimelinePanel: React.FC<TruccoArtistTimelinePanelProps> = ({
  selectedDay,
  onSelectDay,
}) => {
  const {
    actors,
    addActor,
    makeupArtists,
    addMakeupArtist,
    simulatorPatients,
    protesiCatalog,
    assignTruccoToPatient,
    rebalanceTruccoWorkload,
    updateActorProgressStatus,
    language,
  } = useCourse();

  const isEn = language === 'en';

  const [displayMode, setDisplayMode] = useState<'single' | 'comparative'>('single');
  const [selectedArtistId, setSelectedArtistId] = useState<string>(
    makeupArtists[0]?.id || 'truc-1'
  );
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  // Quick Add Modals for testing/operating dynamic rebalancing in real time
  const [showQuickAddArtist, setShowQuickAddArtist] = useState(false);
  const [quickArtistName, setQuickArtistName] = useState('');
  const [quickArtistRole, setQuickArtistRole] = useState(
    'Truccatore Aggiunto in Corso d’Opera (Supporto & Postazioni)'
  );
  const [quickArtistSpecialty, setQuickArtistSpecialty] = useState(
    'Protesi siliconiche, linee ematiche e moulage rapido'
  );

  const [showQuickAddActor, setShowQuickAddActor] = useState(false);
  const [quickActorName, setQuickActorName] = useState('');
  const [quickActorStatus, setQuickActorStatus] = useState<ActorPhysicalStatus>('INTERO');
  const [quickActorSize, setQuickActorSize] = useState<ClothingSize>('M');
  const [quickActorDetails, setQuickActorDetails] = useState(
    'Figurante aggiunto in corso d’opera — idoneo scenari politrauma ed estrazione'
  );

  const showToast = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => setToastBanner(null), 4500);
  };

  const activeArtist: MakeupArtist = useMemo(() => {
    return (
      makeupArtists.find((m) => m.id === selectedArtistId) ||
      makeupArtists[0]
    );
  }, [makeupArtists, selectedArtistId]);

  const workloadStats = useMemo(() => {
    return getArtistWorkloadStats(makeupArtists, actors, simulatorPatients);
  }, [makeupArtists, actors, simulatorPatients]);

  const maxPrimaryCount = useMemo(() => {
    if (workloadStats.length === 0) return 0;
    return Math.max(...workloadStats.map((s) => s.totalPrimaryScenarios));
  }, [workloadStats]);

  const minPrimaryCount = useMemo(() => {
    if (workloadStats.length === 0) return 0;
    return Math.min(...workloadStats.map((s) => s.totalPrimaryScenarios));
  }, [workloadStats]);

  const isHomogeneous = maxPrimaryCount - minPrimaryCount <= 1;

  const selectedArtistTimeline = useMemo(() => {
    if (!activeArtist) return [];
    return buildPersonalizedArtistTimeline(
      activeArtist,
      makeupArtists,
      actors,
      simulatorPatients,
      selectedDay
    );
  }, [activeArtist, makeupArtists, actors, simulatorPatients, selectedDay]);

  const getPatientProtesi = (patientId: number): ProtesiItem[] => {
    return protesiCatalog.filter((item) =>
      item.scenariosUsed?.some((s) => s.patientId === patientId)
    );
  };

  const getActorById = (id?: string): CourseActor | undefined =>
    actors.find((a) => a.id === id);

  const handleQuickAddArtistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickArtistName.trim()) return;
    const nextNum = makeupArtists.length + 1;
    const badgeCode = `TRUC-${String(nextNum).padStart(2, '0')}`;
    addMakeupArtist({
      badgeCode,
      name: quickArtistName.trim(),
      role: quickArtistRole,
      specialty: quickArtistSpecialty,
      nationality: 'Italiana',
      phone: `+39 340 00000${nextNum}`,
      organization: 'Team Moulage Dinamico',
      assignedStation: 'Rotazione Dinamica Postazioni 1–3 & Jolly',
      notes: 'Inserito in corso d’opera con ribilanciamento automatico del carico',
    });
    setQuickArtistName('');
    setShowQuickAddArtist(false);
    showToast(
      `Nuovo truccatore ${badgeCode} (${quickArtistName.trim()}) aggiunto: timeline e carico di lavoro ribilanciati automaticamente su ${nextNum} truccatori!`
    );
  };

  const handleQuickAddActorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickActorName.trim()) return;
    const nextSlot = actors.length + 1;
    const badgeCode = `ATT-${String(nextSlot).padStart(2, '0')}`;
    addActor({
      slotNumber: nextSlot,
      badgeCode,
      name: quickActorName.trim(),
      physicalStatus: quickActorStatus,
      amputationDetails:
        quickActorStatus === 'AMPUTATO'
          ? 'Amputazione traumatica — Idoneo innesto moncone balistico con linea arteriosa'
          : quickActorDetails,
      clothingSize: quickActorSize,
      makeupAllergies: 'Nessuna allergia nota',
      assignedMakeupArtistId: makeupArtists[0]?.id || 'truc-1',
      nationality: 'Italiana',
      phone: `+39 320 00000${nextSlot}`,
      organization: 'Gruppo Figuranti Trauma',
    });
    setQuickActorName('');
    setShowQuickAddActor(false);
    showToast(
      `Nuovo attore ${badgeCode} (${quickActorName.trim()} • ${quickActorStatus}) aggiunto: carico ribilanciato su ${nextSlot} attori e ${makeupArtists.length} truccatori!`
    );
  };

  return (
    <div className="space-y-6 font-mono">
      {/* =====================================================================
          1. DYNAMIC WORKLOAD BALANCING & HOMOGENEITY CONTROL HEADER
      ====================================================================== */}
      <div className="bg-neutral-900 border border-pink-500/70 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2 py-0.5 bg-pink-600 text-white font-black uppercase">
                TIMELINE PERSONALIZZATA TRUCCATORI & CARICO DINAMICO
              </span>
              <span
                className={`px-2 py-0.5 font-black uppercase border ${
                  isHomogeneous
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                    : 'bg-amber-950 text-amber-300 border-amber-500'
                }`}
              >
                {isHomogeneous
                  ? `✓ CARICO OMOGENEO BILANCIATO (Δ = ${maxPrimaryCount - minPrimaryCount})`
                  : `⚠ CARICO PERSONALIZZATO (Δ = ${maxPrimaryCount - minPrimaryCount})`}
              </span>
              <span className="text-neutral-400">
                Organico attivo: <strong className="text-white">{makeupArtists.length} Truccatori</strong> ×{' '}
                <strong className="text-amber-300">{actors.length} Attori</strong> (Rapporto{' '}
                1:{(actors.length / Math.max(1, makeupArtists.length)).toFixed(1)})
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isEn
                ? `Personalized Makeup Artist Timelines • ${makeupArtists.length} Artists (Stations 1–3 + Jolly) & ${actors.length} Actors`
                : `Timeline Personalizzata per Truccatore • ${makeupArtists.length} Truccatori (Postazioni 1–3 + Jolly) & ${actors.length} Attori`}
            </h2>

            <p className="text-xs text-neutral-400 font-sans max-w-4xl">
              Ogni truccatore dispone di una timeline dedicata lungo i 4 blocchi operativi: i 3 titolari presidiano le{' '}
              <strong className="text-white">Postazioni Tattiche 1, 2 e 3</strong> mentre il{' '}
              <strong className="text-cyan-300">Truccatore Jolly</strong> ruota in sostituzione attiva, supporta le amputazioni complesse e pre-allestisce gli attori del blocco successivo. Aggiungendo o rimuovendo truccatori/attori in corso d&apos;opera, la timeline si adatta automaticamente in modo omogeneo.
            </p>
          </div>

          {/* Action Buttons: Rebalance + Add Artist/Actor on the fly */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                rebalanceTruccoWorkload();
                showToast(
                  `Carico di lavoro ribilanciato in modo omogeneo su ${makeupArtists.length} Truccatori e ${actors.length} Attori (24 scenari totali)!`
                );
              }}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ribilancia Carico Omogeneo</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQuickAddArtist(true)}
              className="px-3 py-2 bg-pink-600 hover:bg-pink-500 text-white font-black text-xs uppercase cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Truccatore in Corso d&apos;Opera</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQuickAddActor(true)}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Attore in Corso d&apos;Opera</span>
            </button>
          </div>
        </div>

        {toastBanner && (
          <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastBanner}</span>
          </div>
        )}

        {/* Per-Artist Workload Summary Cards (Clickable to select artist) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-2 border-t border-neutral-800">
          {workloadStats.map((stat, idx) => {
            const isSelected =
              displayMode === 'single' && stat.artist.id === activeArtist?.id;
            const dayPrimary =
              selectedDay === 2 ? stat.day2PrimaryCount : stat.day3PrimaryCount;
            const dayJolly =
              selectedDay === 2 ? stat.day2JollyCount : stat.day3JollyCount;
            const stationBadge =
              idx < 3 ? `TITOLARE POST. ${idx + 1}` : 'JOLLY & ROTAZIONE';

            return (
              <div
                key={stat.artist.id}
                onClick={() => {
                  setSelectedArtistId(stat.artist.id);
                  setDisplayMode('single');
                }}
                className={`p-3 bg-neutral-950 border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'border-pink-400 bg-pink-950/20'
                    : 'border-neutral-800 hover:border-pink-500/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <span className="px-1.5 py-0.5 bg-pink-600 text-white font-black tabular-nums">
                    {stat.artist.badgeCode}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 font-black uppercase border ${
                      idx < 3
                        ? 'bg-neutral-900 text-orange-300 border-orange-500/50'
                        : 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                    }`}
                  >
                    {stationBadge}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-black text-white truncate">
                    {stat.artist.name}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate font-sans">
                    {stat.artist.role}
                  </div>
                </div>

                {/* Paired Actors */}
                <div className="flex items-center gap-1 flex-wrap text-[10px]">
                  <span className="text-neutral-400">Attori base ({stat.pairedActors.length}):</span>
                  {stat.pairedActors.map((act) => (
                    <span
                      key={act.id}
                      className={`px-1.5 py-0.2 font-black ${
                        act.physicalStatus === 'AMPUTATO'
                          ? 'bg-amber-500 text-black'
                          : 'bg-neutral-800 text-cyan-300'
                      }`}
                    >
                      {act.badgeCode} ({act.physicalStatus === 'AMPUTATO' ? 'AMP' : 'INT'})
                    </span>
                  ))}
                </div>

                {/* Workload Metrics */}
                <div className="pt-1.5 border-t border-neutral-800 space-y-1 text-[10px]">
                  <div className="flex items-center justify-between text-neutral-300 tabular-nums">
                    <span>
                      Day 0{selectedDay}: <strong className="text-white">{dayPrimary} Post.</strong> +{' '}
                      <strong className="text-cyan-300">{dayJolly} Jolly</strong>
                    </span>
                    <span className="text-pink-300 font-bold">
                      Tot Corso: {stat.totalPrimaryScenarios} Scen.
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-900 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${stat.loadPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Mode Controls: Singolo Truccatore vs Vista Comparativa Affiancata + Day Switcher */}
        <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDisplayMode('single')}
              className={`px-3.5 py-2 text-xs font-black uppercase border cursor-pointer flex items-center gap-1.5 ${
                displayMode === 'single'
                  ? 'bg-pink-600 text-white border-pink-400'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-pink-500/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Vista Singolo Truccatore ({activeArtist?.badgeCode})</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode('comparative')}
              className={`px-3.5 py-2 text-xs font-black uppercase border cursor-pointer flex items-center gap-1.5 ${
                displayMode === 'comparative'
                  ? 'bg-cyan-500 text-black border-cyan-300'
                  : 'bg-neutral-950 text-cyan-300 border-cyan-500/50 hover:border-cyan-400'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>
                Vista Comparativa Affiancata ({makeupArtists.length} Truccatori)
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400 uppercase font-bold">
              Giornata Operativa:
            </span>
            <div className="flex bg-neutral-950 p-1 border border-neutral-800 gap-1">
              {([2, 3] as CourseDay[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onSelectDay(d)}
                  className={`px-3 py-1 text-xs font-black uppercase cursor-pointer ${
                    selectedDay === d
                      ? 'bg-pink-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  DAY 0{d} ({d === 2 ? 'Blocchi 1–4 • Pz 1–12' : 'Blocchi 1–4 • Pz 13–24'})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MODE A: SINGLE MAKEUP ARTIST PERSONALIZED TIMELINE (BLOCKS 1–4)
      ====================================================================== */}
      {displayMode === 'single' && activeArtist && (
        <div className="space-y-5">
          {/* Selected Artist Selector Strip */}
          <div className="bg-neutral-900 border border-neutral-800 p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-neutral-400 font-bold mr-1">
                Seleziona Truccatore:
              </span>
              {makeupArtists.map((art) => {
                const isCurr = art.id === activeArtist.id;
                return (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => setSelectedArtistId(art.id)}
                    className={`px-3 py-1.5 text-xs font-black uppercase border cursor-pointer transition-colors ${
                      isCurr
                        ? 'bg-pink-600 text-white border-pink-300'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-pink-500/60'
                    }`}
                  >
                    {art.badgeCode} • {art.name}
                  </button>
                );
              })}
            </div>

            {activeArtist.assignedStation && (
              <div className="text-xs text-pink-300 font-bold">
                Postazione Riferimento: <span className="text-white">{activeArtist.assignedStation}</span>
              </div>
            )}
          </div>

          {/* 4-Block Personalized Timeline Cards for Selected Makeup Artist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {selectedArtistTimeline.map((slot) => {
              const { blockMeta, roleType, stationIndex, patient, assignedActor, jollyCoAssistant } =
                slot;
              const t0Time = blockMeta.tcccWindow.split('-')[0].trim();

              if (roleType === 'STATION_PRIMARY' && patient && assignedActor) {
                const isAmputee = assignedActor.physicalStatus === 'AMPUTATO';
                const linkedProtesi = getPatientProtesi(patient.id);
                const hasAllergy =
                  assignedActor.makeupAllergies &&
                  !assignedActor.makeupAllergies.toLowerCase().includes('nessuna allergia');
                const currentStatus =
                  patient.actorProgressStatus ||
                  assignedActor.progressStatus ||
                  (patient.techChecklist?.preDone ? 'PRONTO_T0' : 'IN_PREPARAZIONE');
                const statusMeta =
                  ACTOR_PROGRESS_META[currentStatus] || ACTOR_PROGRESS_META.IN_PREPARAZIONE;

                return (
                  <div
                    key={`artist-${activeArtist.id}-b-${blockMeta.blockNumber}`}
                    className="bg-neutral-950 border border-pink-500/60 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Block Header */}
                      <div className="bg-neutral-900 border-b border-pink-500/50 p-3.5 flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                            <span className="px-2 py-0.5 bg-pink-600 text-white font-black uppercase tabular-nums">
                              BLOCCO {blockMeta.blockNumber} • PREP {blockMeta.truccoPrepWindow}
                            </span>
                            <span className="px-2 py-0.5 bg-orange-600 text-black font-black uppercase tabular-nums">
                              TITOLARE POSTAZIONE TATTICA {stationIndex}
                            </span>
                            <span className="px-2 py-0.5 bg-neutral-800 text-amber-300 font-bold tabular-nums">
                              TARGET T0: {t0Time}
                            </span>
                          </div>
                          <h3 className="text-sm font-black text-white pt-1">
                            Paziente #{patient.id} • {patient.scenarioCode}
                          </h3>
                        </div>

                        <span
                          className={`px-2 py-1 text-[10px] font-black uppercase border flex items-center gap-1 ${statusMeta.badgeClass}`}
                        >
                          {getStatusIcon(currentStatus, 'w-3 h-3')}
                          <span>{statusMeta.shortIt}</span>
                        </span>
                      </div>

                      <div className="p-4 space-y-3.5 text-xs">
                        {/* 3-Step Personalized Prep Micro-Timeline */}
                        <div className="bg-neutral-900 border border-neutral-800 p-2.5 space-y-1.5 text-[11px]">
                          <div className="text-[10px] font-black uppercase text-pink-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Scansione Oraria Pre-Scenario ({blockMeta.truccoPrepWindow}):</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                            <div className="p-1.5 bg-neutral-950 border border-neutral-800">
                              <span className="text-pink-300 font-bold block text-[10px]">
                                1. T-45m ➔ T-30m
                              </span>
                              <span className="text-neutral-300 font-sans text-[11px]">
                                Accoglienza {assignedActor.badgeCode}, check allergie e base silicone
                              </span>
                            </div>
                            <div className="p-1.5 bg-neutral-950 border border-neutral-800">
                              <span className="text-cyan-300 font-bold block text-[10px]">
                                2. T-30m ➔ T-15m
                              </span>
                              <span className="text-neutral-300 font-sans text-[11px]">
                                Montaggio protesi e caricamento linee ematiche
                              </span>
                            </div>
                            <div className="p-1.5 bg-neutral-950 border border-neutral-800">
                              <span className="text-amber-300 font-bold block text-[10px]">
                                3. {blockMeta.preAlertTcccWindow}
                              </span>
                              <span className="text-neutral-300 font-sans text-[11px]">
                                Posizionamento Amb. Tattico {stationIndex} e Luce Verde T0
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actor Details & Quick Reassign */}
                        <div
                          className={`p-3 border space-y-2 ${
                            isAmputee
                              ? 'bg-amber-950/15 border-amber-500/60'
                              : 'bg-neutral-900 border-neutral-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase text-neutral-300 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-amber-400" />
                              <span>Attore Assegnato a {activeArtist.badgeCode}:</span>
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-black uppercase ${
                                isAmputee
                                  ? 'bg-amber-500 text-black'
                                  : 'bg-cyan-950 text-cyan-200 border border-cyan-600'
                              }`}
                            >
                              {assignedActor.badgeCode} • {assignedActor.physicalStatus}
                            </span>
                          </div>

                          <select
                            value={assignedActor.id}
                            onChange={(e) =>
                              assignTruccoToPatient(
                                patient.id,
                                e.target.value,
                                activeArtist.id
                              )
                            }
                            className="w-full bg-neutral-950 border border-neutral-700 text-white text-xs p-2 font-mono"
                          >
                            {[...actors]
                              .sort((a, b) => a.slotNumber - b.slotNumber)
                              .map((act) => (
                                <option key={act.id} value={act.id}>
                                  Slot #{act.slotNumber} ({act.badgeCode}) • {act.name} [
                                  {act.physicalStatus}] — Taglia {act.clothingSize}
                                </option>
                              ))}
                          </select>

                          <div className="text-[11px] font-sans space-y-1 text-neutral-300">
                            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
                              <span className="flex items-center gap-1">
                                <Shirt className="w-3 h-3 text-pink-400" />
                                Taglia Vestiario: <strong className="text-white">{assignedActor.clothingSize}</strong>
                              </span>
                              <span>Tel: {assignedActor.phone}</span>
                            </div>
                            <div className={isAmputee ? 'text-amber-200 font-semibold' : ''}>
                              {assignedActor.amputationDetails}
                            </div>
                            <div
                              className={`flex items-center gap-1 text-[11px] ${
                                hasAllergy ? 'text-red-300 font-semibold' : 'text-neutral-400'
                              }`}
                            >
                              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                              <span>Allergie: {assignedActor.makeupAllergies}</span>
                            </div>
                          </div>

                          {jollyCoAssistant && (
                            <div className="p-2 bg-cyan-950/40 border border-cyan-500/60 text-cyan-200 text-[11px] flex items-center gap-1.5 font-sans">
                              <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>
                                <strong>Supporto Jolly Attivo:</strong> {jollyCoAssistant.badgeCode} (
                                {jollyCoAssistant.name}) co-assiste questo allestimento complesso.
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Clinical Lesions & Prosthetics */}
                        <div className="bg-neutral-900 border border-neutral-800 p-2.5 space-y-1.5 font-sans">
                          <div className="text-white font-bold text-xs">
                            Lesioni: {patient.lesioni.join(' • ')}
                          </div>
                          <div className="text-[11px] text-neutral-300">
                            <strong className="text-pink-300">Moulage:</strong> {patient.moulageProtesi}
                          </div>
                          {linkedProtesi.length > 0 && (
                            <div className="pt-1 border-t border-neutral-800 flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                              <Package className="w-3 h-3 text-cyan-400" />
                              <span className="text-cyan-300 font-bold">Protesi Catalogo:</span>
                              {linkedProtesi.map((pr) => (
                                <span
                                  key={pr.id}
                                  className="px-1.5 py-0.5 bg-neutral-950 border border-cyan-800 text-cyan-200"
                                >
                                  {pr.code} • {pr.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Interactive 5-Stage Progress Status */}
                        <ActorProgressStatusControl
                          status={currentStatus}
                          updatedAt={
                            patient.actorProgressUpdatedAt || assignedActor.progressUpdatedAt
                          }
                          updatedBy={
                            patient.actorProgressUpdatedBy || assignedActor.progressUpdatedBy
                          }
                          isEn={isEn}
                          onSelectStatus={(nextStatus) => {
                            updateActorProgressStatus(assignedActor.id, nextStatus, {
                              patientId: patient.id,
                              updatedBy: `${activeArtist.badgeCode} • ${activeArtist.name}`,
                            });
                            const meta = ACTOR_PROGRESS_META[nextStatus];
                            showToast(
                              nextStatus === 'PRONTO_T0'
                                ? `🟢 ${activeArtist.badgeCode} ha confermato PRONTO T0 per Pz #${patient.id} (${assignedActor.badgeCode}): Checklist e Regia CH-3 sincronizzate!`
                                : `Stato avanzamento di ${assignedActor.badgeCode} (Pz #${patient.id}) aggiornato a: ${meta.labelIt}`
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              // JOLLY SUPPORT & NEXT-BLOCK PRE-PREP CARD
              const {
                jollySupportPatient,
                jollySupportActor,
                jollySupportPrimaryArtist,
                nextBlockPrePrepPatients,
              } = slot;

              return (
                <div
                  key={`artist-${activeArtist.id}-b-${blockMeta.blockNumber}-jolly`}
                  className="bg-neutral-950 border border-cyan-500/60 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="bg-cyan-950/40 border-b border-cyan-500/50 p-3.5 flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                          <span className="px-2 py-0.5 bg-cyan-500 text-black font-black uppercase tabular-nums">
                            BLOCCO {blockMeta.blockNumber} • FINESTRA {blockMeta.truccoPrepWindow}
                          </span>
                          <span className="px-2 py-0.5 bg-neutral-900 border border-cyan-400 text-cyan-300 font-black uppercase">
                            TURNO JOLLY • SUPPORTO & PRE-ALLESTIMENTO
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-white pt-1">
                          Co-Allestimento Amputazione Complessa & Pre-Prep Blocco Successivo
                        </h3>
                      </div>

                      <span className="px-2 py-1 bg-cyan-950 border border-cyan-500 text-cyan-200 text-[10px] font-black uppercase">
                        RUOLO JOLLY ATTIVO
                      </span>
                    </div>

                    <div className="p-4 space-y-3.5 text-xs">
                      {/* Task 1: Co-Assist High Complexity Station in Current Block */}
                      {jollySupportPatient && jollySupportActor && (
                        <div className="bg-neutral-900 border border-amber-500/50 p-3 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase text-amber-300">
                            <span className="flex items-center gap-1">
                              <Wrench className="w-3.5 h-3.5" />
                              <span>
                                1. Fase Pre-Blocco ({blockMeta.truccoPrepWindow}): Co-Allestimento Moncone/Protesi
                              </span>
                            </span>
                            <span>PAZIENTE #{jollySupportPatient.id}</span>
                          </div>
                          <p className="text-neutral-200 font-sans text-xs">
                            Supporta <strong>{jollySupportPrimaryArtist?.badgeCode} ({jollySupportPrimaryArtist?.name})</strong> nell&apos;innesto protesico e raccordo linee arteriose su{' '}
                            <strong className="text-amber-300">
                              {jollySupportActor.badgeCode} ({jollySupportActor.name} • {jollySupportActor.physicalStatus})
                            </strong>{' '}
                            per lo scenario <em>{jollySupportPatient.scenarioCode}</em>.
                          </p>
                        </div>
                      )}

                      {/* Task 2: Turnaround & Pre-Preparation for Next Block */}
                      <div className="bg-neutral-900 border border-cyan-700/50 p-3 space-y-2">
                        <div className="text-[10px] font-black uppercase text-cyan-300 flex items-center gap-1">
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>
                            {nextBlockPrePrepPatients.length > 0
                              ? `2. Turnaround & Pre-Allestimento Blocco ${blockMeta.blockNumber + 1} (Pazienti #${nextBlockPrePrepPatients.map((p) => p.id).join(', #')})`
                              : '2. Fine Giornata: Smontaggio Finale Protesi & Sanitizzazione Lab Moulage'}
                          </span>
                        </div>

                        {nextBlockPrePrepPatients.length > 0 ? (
                          <div className="space-y-1.5">
                            <p className="text-neutral-300 font-sans text-[11px]">
                              Prepara in anticipo in Lab Moulage le basi siliconiche, le sacche di sangue (1.5L–3L) e i consumabili per i 3 figuranti del blocco successivo:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                              {nextBlockPrePrepPatients.map((nPt) => {
                                const nAct = getActorById(nPt.assignedActorId);
                                return (
                                  <div
                                    key={nPt.id}
                                    className="p-2 bg-neutral-950 border border-neutral-800 space-y-0.5 text-[10px]"
                                  >
                                    <div className="font-black text-pink-400">
                                      Pz #{nPt.id} ({nPt.scenarioCode})
                                    </div>
                                    <div className="text-white font-bold truncate">
                                      {nAct?.badgeCode} • {nAct?.name}
                                    </div>
                                    <div className="text-neutral-400">
                                      [{nAct?.physicalStatus}] · Taglia {nAct?.clothingSize}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="text-neutral-300 font-sans text-[11px]">
                            Coordina la rimozione delicata con Isopropyl Myristate su tutti gli 8 slot attori, il lavaggio dei circuiti peristaltici e l&apos;inventario consumabili per la giornata successiva.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODE B: SIDE-BY-SIDE COMPARATIVE TIMELINE MATRIX (ALL MAKEUP ARTISTS)
      ====================================================================== */}
      {displayMode === 'comparative' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-cyan-500/50 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Columns className="w-4 h-4 text-cyan-400" />
              <span className="font-black text-white uppercase">
                Matrice Comparativa Affiancata • Timeline di Tutti i {makeupArtists.length} Truccatori (Giorno 0{selectedDay})
              </span>
            </div>
            <span className="text-neutral-400 font-sans">
              Confronto sinottico Blocchi 1–4: 3 Titolari sulle Postazioni Tattiche 1–3 + Turnazione Jolly Omogenea
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {makeupArtists.map((artist, artIdx) => {
              const timeline = buildPersonalizedArtistTimeline(
                artist,
                makeupArtists,
                actors,
                simulatorPatients,
                selectedDay
              );
              const pairedActors = actors.filter(
                (a) => a.assignedMakeupArtistId === artist.id
              );

              return (
                <div
                  key={artist.id}
                  className="bg-neutral-950 border border-neutral-800 flex flex-col justify-between"
                >
                  <div>
                    {/* Column Header for Makeup Artist */}
                    <div className="bg-neutral-900 border-b border-pink-500/50 p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 bg-pink-600 text-white font-black">
                          {artist.badgeCode}
                        </span>
                        <span className="px-1.5 py-0.5 bg-neutral-950 border border-neutral-700 text-neutral-300 font-bold">
                          {artIdx < 3 ? `Postazione ${artIdx + 1}` : 'Jolly & Rotazione'}
                        </span>
                      </div>
                      <div className="text-sm font-black text-white">{artist.name}</div>
                      <div className="text-[10px] text-neutral-400 truncate font-sans">
                        {artist.role}
                      </div>
                      <div className="pt-1 flex items-center gap-1 flex-wrap text-[10px]">
                        <span className="text-neutral-500">Slot Base:</span>
                        {pairedActors.map((act) => (
                          <span
                            key={act.id}
                            className={`px-1 py-0.2 font-black ${
                              act.physicalStatus === 'AMPUTATO'
                                ? 'bg-amber-500 text-black'
                                : 'bg-neutral-800 text-cyan-300'
                            }`}
                          >
                            {act.badgeCode}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 4 Block Slots Stacked inside the Artist Column */}
                    <div className="divide-y divide-neutral-800">
                      {timeline.map((slot) => {
                        const {
                          blockMeta,
                          roleType,
                          stationIndex,
                          patient,
                          assignedActor,
                          jollySupportPatient,
                          jollySupportActor,
                        } = slot;

                        if (roleType === 'STATION_PRIMARY' && patient && assignedActor) {
                          const isAmp = assignedActor.physicalStatus === 'AMPUTATO';
                          const currentSt =
                            patient.actorProgressStatus ||
                            assignedActor.progressStatus ||
                            (patient.techChecklist?.preDone
                              ? 'PRONTO_T0'
                              : 'IN_PREPARAZIONE');

                          return (
                            <div
                              key={`${artist.id}-col-b-${blockMeta.blockNumber}`}
                              className="p-3 space-y-2 bg-neutral-950"
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-black text-pink-400 tabular-nums">
                                  BLOCCO {blockMeta.blockNumber} ({blockMeta.truccoPrepWindow})
                                </span>
                                <span className="px-1.5 py-0.5 bg-orange-600 text-black font-black">
                                  POST. {stationIndex} • PZ #{patient.id}
                                </span>
                              </div>

                              <div className="text-xs font-bold text-white truncate">
                                {patient.scenarioCode}
                              </div>

                              <div className="p-2 bg-neutral-900 border border-neutral-800 space-y-1 text-[11px]">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white">
                                    {assignedActor.badgeCode} • {assignedActor.name}
                                  </span>
                                  <span
                                    className={`px-1 text-[9px] font-black ${
                                      isAmp
                                        ? 'bg-amber-500 text-black'
                                        : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                                    }`}
                                  >
                                    {assignedActor.physicalStatus}
                                  </span>
                                </div>
                                <div className="text-[10px] text-neutral-400 truncate font-sans">
                                  Taglia {assignedActor.clothingSize} · {patient.lesioni[0]}
                                </div>
                              </div>

                              <ActorProgressStatusControl
                                compact
                                isEn={isEn}
                                status={currentSt}
                                updatedAt={
                                  patient.actorProgressUpdatedAt ||
                                  assignedActor.progressUpdatedAt
                                }
                                onSelectStatus={(nextStatus) => {
                                  updateActorProgressStatus(assignedActor.id, nextStatus, {
                                    patientId: patient.id,
                                    updatedBy: `${artist.badgeCode} • ${artist.name}`,
                                  });
                                }}
                              />
                            </div>
                          );
                        }

                        return (
                          <div
                            key={`${artist.id}-col-b-${blockMeta.blockNumber}-jolly`}
                            className="p-3 space-y-2 bg-cyan-950/15"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-black text-cyan-300 tabular-nums">
                                BLOCCO {blockMeta.blockNumber} ({blockMeta.truccoPrepWindow})
                              </span>
                              <span className="px-1.5 py-0.5 bg-cyan-500 text-black font-black uppercase">
                                TURNO JOLLY
                              </span>
                            </div>

                            <div className="text-xs font-bold text-cyan-200">
                              Co-Allestimento & Pre-Prep
                            </div>

                            <div className="p-2 bg-neutral-900 border border-cyan-800/60 space-y-1 text-[10px] font-sans text-neutral-300">
                              <div>
                                <strong className="text-amber-300">Supporto:</strong> Pz #
                                {jollySupportPatient?.id} ({jollySupportActor?.badgeCode} •{' '}
                                {jollySupportActor?.physicalStatus})
                              </div>
                              <div>
                                <strong className="text-cyan-300">Turnaround:</strong>{' '}
                                {slot.nextBlockPrePrepPatients.length > 0
                                  ? `Pre-allestimento Pz #${slot.nextBlockPrePrepPatients
                                      .map((p) => p.id)
                                      .join(', #')} (Blocco ${blockMeta.blockNumber + 1})`
                                  : 'Smontaggio finale e ripristino Lab'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: QUICK ADD MAKEUP ARTIST IN CORSO D'OPERA
      ====================================================================== */}
      {showQuickAddArtist && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-pink-500 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <h3 className="text-sm font-black text-white uppercase">
                + Aggiungi Truccatore in Corso d&apos;Opera (Ribilanciamento Dinamico)
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickAddArtist(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddArtistSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">
                  Nome e Cognome Truccatore (Codice automatico TRUC-0{makeupArtists.length + 1})
                </label>
                <input
                  type="text"
                  required
                  value={quickArtistName}
                  onChange={(e) => setQuickArtistName(e.target.value)}
                  placeholder="es. Elena Bellini"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Ruolo Operativo</label>
                <input
                  type="text"
                  value={quickArtistRole}
                  onChange={(e) => setQuickArtistRole(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Specializzazione SFX / Moulage</label>
                <input
                  type="text"
                  value={quickArtistSpecialty}
                  onChange={(e) => setQuickArtistSpecialty(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                />
              </div>

              <div className="p-2.5 bg-pink-950/30 border border-pink-500/50 text-[11px] text-pink-200 font-sans">
                All&apos;inserimento, il sistema ricalcolerà automaticamente gli abbinamenti con gli{' '}
                {actors.length} attori e ridistribuirà i 24 scenari in modo omogeneo tra tutti i{' '}
                {makeupArtists.length + 1} truccatori.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddArtist(false)}
                  className="px-3 py-1.5 bg-neutral-900 text-neutral-300 border border-neutral-700 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase cursor-pointer"
                >
                  Aggiungi e Ribilancia Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: QUICK ADD ACTOR IN CORSO D'OPERA
      ====================================================================== */}
      {showQuickAddActor && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <h3 className="text-sm font-black text-white uppercase">
                + Aggiungi Attore in Corso d&apos;Opera (Slot #{actors.length + 1})
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickAddActor(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddActorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">
                  Nome e Cognome Attore (Codice automatico ATT-0{actors.length + 1})
                </label>
                <input
                  type="text"
                  required
                  value={quickActorName}
                  onChange={(e) => setQuickActorName(e.target.value)}
                  placeholder="es. Luca Bernardi"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Stato Fisico</label>
                  <select
                    value={quickActorStatus}
                    onChange={(e) =>
                      setQuickActorStatus(e.target.value as ActorPhysicalStatus)
                    }
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                  >
                    <option value="INTERO">INTERO (Corpo Intero)</option>
                    <option value="AMPUTATO">AMPUTATO (Moncone Reale)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Taglia Vestiario</label>
                  <select
                    value={quickActorSize}
                    onChange={(e) => setQuickActorSize(e.target.value as ClothingSize)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                  >
                    <option value="S">Taglia S</option>
                    <option value="M">Taglia M</option>
                    <option value="L">Taglia L</option>
                    <option value="XL">Taglia XL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">
                  Dettaglio Anatomico / Idoneità Scenica
                </label>
                <input
                  type="text"
                  value={quickActorDetails}
                  onChange={(e) => setQuickActorDetails(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                />
              </div>

              <div className="p-2.5 bg-amber-950/30 border border-amber-500/50 text-[11px] text-amber-200 font-sans">
                All&apos;inserimento, il nuovo attore verrà associato al truccatore meno carico e inserito automaticamente nella rotazione degli scenari.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddActor(false)}
                  className="px-3 py-1.5 bg-neutral-900 text-neutral-300 border border-neutral-700 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase cursor-pointer"
                >
                  Aggiungi e Ribilancia Carico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
