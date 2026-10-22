import React, { useMemo, useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import { ActorPhysicalStatus, ClothingSize, CourseDay, MakeupArtist } from '../../types';
import {
  buildPersonalizedArtistTimeline,
  getArtistWorkloadStats,
} from '../../utils/truccoBalancer';
import {
  ActorProgressStatusControl,
  ACTOR_PROGRESS_META,
} from './ActorProgressStatusControl';
import {
  Palette,
  Users,
  Clock,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Plus,
  Columns,
  UserCheck,
  ShieldAlert,
  Shirt,
  Phone,
  Layers,
  Wrench,
  QrCode,
} from 'lucide-react';
import { ParticipantQRModal } from './ParticipantQRModal';

interface MakeupArtistPersonalTimelinePanelProps {
  initialArtistId?: string;
  onOpenActorsRegistry?: () => void;
  onOpenArtistsRegistry?: () => void;
}

const buildStepSchedule = (prepWindow: string, tcccWindow: string, isAmputee: boolean) => {
  const [prepStart] = prepWindow.split('-').map((s) => s.trim());
  const [t0Time] = tcccWindow.split('-').map((s) => s.trim());
  return [
    {
      offsetLabel: 'T-45 ➔ T-30',
      timeRange: `${prepStart} (+15m)`,
      phaseTitle: '1. Preparazione Cute & Base Silicone',
      description: isAmputee
        ? 'Fissaggio fascia contenitiva arto nativo e primer medicale per calza protesica.'
        : 'Detersione cute, applicazione bordi in silicone medicale e sfumatura cromatica.',
    },
    {
      offsetLabel: 'T-30 ➔ T-15',
      timeRange: 'Fase Circuito SFX',
      phaseTitle: isAmputee
        ? '2. Innesto Moncone & Tubi Arteriosi'
        : '2. Caricamento Linee Ematiche & Serbatoi',
      description: isAmputee
        ? 'Innesto moncone balistico, raccordo pompa peristaltica/manuale e test pressione.'
        : 'Connessione tubi occultati, riempimento sacca sangue teatrale e prova valvola.',
    },
    {
      offsetLabel: 'T-15 ➔ T-05',
      timeRange: 'Finestra Pre-Allerta',
      phaseTitle: '3. Vestizione Tattica & Posizionamento',
      description:
        'Vestizione mimetica pre-tagliata, occultamento serbatoi e trasferimento in Postazione Tattica.',
    },
    {
      offsetLabel: 'T-05 ➔ T0',
      timeRange: `Pronto entro ${t0Time}`,
      phaseTitle: '4. Check Finale & Luce Verde T0',
      description:
        'Briefing clinico-comportamentale al figurante, validazione Checklist Pre-Scenario e stato PRONTO T0.',
    },
  ];
};

export const MakeupArtistPersonalTimelinePanel: React.FC<
  MakeupArtistPersonalTimelinePanelProps
> = ({ initialArtistId, onOpenActorsRegistry, onOpenArtistsRegistry }) => {
  const {
    actors,
    makeupArtists,
    simulatorPatients,
    activeDay,
    setActiveDay,
    rebalanceTruccoWorkload,
    addMakeupArtist,
    addActor,
    assignTruccoToPatient,
    updateActorProgressStatus,
    updateTechChecklist,
  } = useCourse();

  const currentDay: CourseDay = activeDay === 3 ? 3 : 2;
  const [displayMode, setDisplayMode] = useState<'single' | 'comparative'>('single');
  const [selectedArtistId, setSelectedArtistId] = useState<string>(
    initialArtistId || makeupArtists[0]?.id || 'truc-1'
  );
  const [qrModalArtist, setQrModalArtist] = useState<MakeupArtist | null>(null);
  const [rebalanceFeedback, setRebalanceFeedback] = useState<string | null>(null);
  const [showQuickAddArtist, setShowQuickAddArtist] = useState(false);
  const [showQuickAddActor, setShowQuickAddActor] = useState(false);

  // Quick-add Makeup Artist state
  const [newArtistName, setNewArtistName] = useState('');
  const [newArtistRole, setNewArtistRole] = useState(
    'Truccatore Jolly & Supporto Moulage'
  );
  const [newArtistSpecialty, setNewArtistSpecialty] = useState(
    'Moulage rapido, linee ematiche e supporto postazioni tattiche'
  );

  // Quick-add Actor state
  const [newActorName, setNewActorName] = useState('');
  const [newActorStatus, setNewActorStatus] = useState<ActorPhysicalStatus>('INTERO');
  const [newActorDetail, setNewActorDetail] = useState(
    'Figurante intero per trauma balistico'
  );
  const [newActorSize, setNewActorSize] = useState<ClothingSize>('L');

  const activeArtist = useMemo(() => {
    return (
      makeupArtists.find((m) => m.id === selectedArtistId) || makeupArtists[0] || null
    );
  }, [makeupArtists, selectedArtistId]);

  const workloadStats = useMemo(() => {
    return getArtistWorkloadStats(makeupArtists, actors, simulatorPatients);
  }, [makeupArtists, actors, simulatorPatients]);

  const workloadVarianceMeta = useMemo(() => {
    if (workloadStats.length === 0) {
      return { maxDiffActors: 0, maxDiffScenarios: 0, isBalanced: true };
    }
    const actorCounts = workloadStats.map((s) => s.pairedActors.length);
    const scenarioCounts = workloadStats.map((s) => s.totalPrimaryScenarios);
    const maxDiffActors = Math.max(...actorCounts) - Math.min(...actorCounts);
    const maxDiffScenarios = Math.max(...scenarioCounts) - Math.min(...scenarioCounts);
    return {
      maxDiffActors,
      maxDiffScenarios,
      isBalanced: maxDiffActors <= 1 && maxDiffScenarios <= 2,
    };
  }, [workloadStats]);

  // Personalized timelines for all active makeup artists on currentDay
  const timelinesByArtistId = useMemo(() => {
    const map: Record<string, ReturnType<typeof buildPersonalizedArtistTimeline>> = {};
    makeupArtists.forEach((artist) => {
      map[artist.id] = buildPersonalizedArtistTimeline(
        artist,
        makeupArtists,
        actors,
        simulatorPatients,
        currentDay
      );
    });
    return map;
  }, [makeupArtists, actors, simulatorPatients, currentDay]);

  const handleManualRebalance = () => {
    rebalanceTruccoWorkload();
    const ratio = (actors.length / Math.max(1, makeupArtists.length)).toFixed(1);
    setRebalanceFeedback(
      `Carico ribilanciato in modo omogeneo: ${makeupArtists.length} Truccatori ↔ ${actors.length} Attori (rapporto medio 1:${ratio})`
    );
    setTimeout(() => setRebalanceFeedback(null), 5000);
  };

  const handleQuickAddArtist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtistName.trim()) return;
    const nextNum = makeupArtists.length + 1;
    const badgeCode = `TRUC-${String(nextNum).padStart(2, '0')}`;
    addMakeupArtist({
      badgeCode,
      name: newArtistName.trim(),
      role: newArtistRole.trim() || 'Truccatore Operativo & Supporto Moulage',
      specialty: newArtistSpecialty.trim() || 'Moulage clinico e linee ematiche',
      nationality: 'Italiana',
      phone: `+39 340 80010${String(nextNum).padStart(2, '0')}`,
      notes: 'Aggiunto in corso d’opera con ribilanciamento automatico della timeline',
    });
    setNewArtistName('');
    setShowQuickAddArtist(false);
    setRebalanceFeedback(
      `Aggiunto ${badgeCode} (${newArtistName.trim()}): timeline e carico attori/scenari ridistribuiti automaticamente!`
    );
    setTimeout(() => setRebalanceFeedback(null), 5500);
  };

  const handleQuickAddActor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActorName.trim()) return;
    const nextSlot = actors.length + 1;
    const badgeCode = `ATT-${String(nextSlot).padStart(2, '0')}`;
    addActor({
      badgeCode,
      slotNumber: nextSlot,
      name: newActorName.trim(),
      physicalStatus: newActorStatus,
      amputationDetails:
        newActorDetail.trim() ||
        (newActorStatus === 'AMPUTATO'
          ? 'Amputazione traumatica con moncone protesico'
          : 'Figurante intero per scenari TCCC / Shock Room'),
      clothingSize: newActorSize,
      makeupAllergies: 'Nessuna allergia nota',
      assignedMakeupArtistId: makeupArtists[0]?.id || 'truc-1',
      nationality: 'Italiana',
      phone: `+39 320 90010${String(nextSlot).padStart(2, '0')}`,
      notes: 'Slot attore aggiunto in corso d’opera con ribilanciamento automatico',
      progressStatus: 'STANDBY',
    });
    setNewActorName('');
    setShowQuickAddActor(false);
    setRebalanceFeedback(
      `Aggiunto ${badgeCode} (${newActorName.trim()} • ${newActorStatus}): abbinamento truccatori e timeline aggiornati in automatico!`
    );
    setTimeout(() => setRebalanceFeedback(null), 5500);
  };

  const amputeeCount = actors.filter((a) => a.physicalStatus === 'AMPUTATO').length;
  const fullBodyCount = actors.filter((a) => a.physicalStatus === 'INTERO').length;

  return (
    <div className="space-y-5 font-mono">
      {/* Top Dynamic Workload & Rebalancing Control Header */}
      <div className="bg-neutral-900 border border-neutral-800 p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 bg-pink-950/60 border border-pink-700/50 flex items-center justify-center text-pink-400">
                <Palette className="w-4 h-4" />
              </div>
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                Timeline Personalizzata Truccatori & Bilanciamento Carico Dinamico
              </h2>
              <span className="px-2.5 py-0.5 bg-pink-950/60 border border-pink-700/50 text-pink-300 font-mono text-[11px] font-bold">
                ASSETTO {makeupArtists.length} TRUCCATORI × {actors.length} ATTORI
              </span>
              <span
                className={`px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase flex items-center gap-1 border ${
                  workloadVarianceMeta.isBalanced
                    ? 'bg-emerald-950/50 border-emerald-700/50 text-emerald-300'
                    : 'bg-amber-950/50 border-amber-700/50 text-amber-300'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {workloadVarianceMeta.isBalanced
                  ? 'CARICO OMOGENEO BILANCIATO (Δ ≤ 1)'
                  : 'RIBILANCIAMENTO CONSIGLIATO'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-sans">
              Architettura operativa: <strong>Postazioni Tattiche 1–3</strong> con Truccatore Titolare +{' '}
              <strong>Truccatore Jolly (TRUC-04+)</strong> a supporto dei monconi amputati e rotazione omogenea (rapporto medio{' '}
              <span className="text-white font-mono font-bold">
                1:{(actors.length / Math.max(1, makeupArtists.length)).toFixed(1)}
              </span>{' '}
              attori per truccatore). L&apos;aggiunta o rimozione di truccatori/attori ricalcola istantaneamente le timeline.
            </p>
          </div>

          {/* Day Selector + Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-neutral-950 p-1 border border-neutral-800">
              <button
                type="button"
                onClick={() => setActiveDay(2)}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  currentDay === 2
                    ? 'bg-pink-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                DAY 02 (Pz 1–12)
              </button>
              <button
                type="button"
                onClick={() => setActiveDay(3)}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  currentDay === 3
                    ? 'bg-pink-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                DAY 03 (Pz 13–24)
              </button>
            </div>

            <button
              type="button"
              onClick={handleManualRebalance}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Ricalcola immediatamente la distribuzione omogenea di attori e scenari su tutti i truccatori attivi"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Ribilancia Carico
            </button>

            <button
              type="button"
              onClick={() => {
                setShowQuickAddArtist((prev) => !prev);
                setShowQuickAddActor(false);
              }}
              className="px-3 py-2 bg-pink-950/60 hover:bg-pink-900/70 border border-pink-700/50 text-pink-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + Truccatore
            </button>

            <button
              type="button"
              onClick={() => {
                setShowQuickAddActor((prev) => !prev);
                setShowQuickAddArtist(false);
              }}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + Attore
            </button>
          </div>
        </div>

        {/* Live Feedback Banner after automatic or manual rebalancing */}
        {rebalanceFeedback && (
          <div className="mt-3 px-4 py-2.5 bg-emerald-950/60 border border-emerald-600/60 text-emerald-200 text-xs font-mono flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              {rebalanceFeedback}
            </span>
            <button
              type="button"
              onClick={() => setRebalanceFeedback(null)}
              className="text-[10px] underline text-emerald-300 hover:text-white ml-4 cursor-pointer"
            >
              Chiudi
            </button>
          </div>
        )}

        {/* Inline Quick-Add Makeup Artist Form (In Corso d'Opera) */}
        {showQuickAddArtist && (
          <form
            onSubmit={handleQuickAddArtist}
            className="mt-4 p-4 bg-neutral-950 border border-pink-800/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-pink-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Inserimento Rapido Truccatore in Corso d&apos;Opera (Ribilanciamento Automatico Timeline)
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                Nuovo Codice:{' '}
                <strong className="text-white">
                  TRUC-{String(makeupArtists.length + 1).padStart(2, '0')}
                </strong>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Nome e Cognome Truccatore..."
                value={newArtistName}
                onChange={(e) => setNewArtistName(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <input
                type="text"
                placeholder="Ruolo (es. Truccatore Jolly / Postazione)..."
                value={newArtistRole}
                onChange={(e) => setNewArtistRole(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <input
                type="text"
                placeholder="Specialità moulage..."
                value={newArtistSpecialty}
                onChange={(e) => setNewArtistSpecialty(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuickAddArtist(false)}
                className="px-3 py-1.5 bg-neutral-800 text-neutral-300 text-xs font-mono cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-mono font-bold uppercase cursor-pointer"
              >
                Aggiungi e Ribilancia Timeline
              </button>
            </div>
          </form>
        )}

        {/* Inline Quick-Add Actor Form (In Corso d'Opera) */}
        {showQuickAddActor && (
          <form
            onSubmit={handleQuickAddActor}
            className="mt-4 p-4 bg-neutral-950 border border-neutral-700 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-pink-400" />
                Inserimento Rapido Attore in Corso d&apos;Opera (Ribilanciamento Automatico Carico)
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                Nuovo Slot:{' '}
                <strong className="text-white">
                  ATT-{String(actors.length + 1).padStart(2, '0')}
                </strong>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                required
                placeholder="Nome e Cognome Attore..."
                value={newActorName}
                onChange={(e) => setNewActorName(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <select
                value={newActorStatus}
                onChange={(e) => setNewActorStatus(e.target.value as ActorPhysicalStatus)}
                className="bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
              >
                <option value="INTERO">STATO FISICO: INTERO</option>
                <option value="AMPUTATO">STATO FISICO: AMPUTATO</option>
              </select>
              <input
                type="text"
                placeholder="Dettaglio anatomico / moncone..."
                value={newActorDetail}
                onChange={(e) => setNewActorDetail(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <select
                value={newActorSize}
                onChange={(e) => setNewActorSize(e.target.value as ClothingSize)}
                className="bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
              >
                <option value="S">TAGLIA VESTIARIO: S</option>
                <option value="M">TAGLIA VESTIARIO: M</option>
                <option value="L">TAGLIA VESTIARIO: L</option>
                <option value="XL">TAGLIA VESTIARIO: XL</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuickAddActor(false)}
                className="px-3 py-1.5 bg-neutral-800 text-neutral-300 text-xs font-mono cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-mono font-black uppercase cursor-pointer"
              >
                Aggiungi Attore e Ribilancia
              </button>
            </div>
          </form>
        )}

        {/* Workload Summary Strip for each Makeup Artist */}
        <div className="mt-4 pt-4 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {workloadStats.map((stat, idx) => {
            const { artist, pairedActors } = stat;
            const isSelected = displayMode === 'single' && activeArtist?.id === artist.id;
            const roleLabel =
              idx < 3
                ? `Titolare Postazione Tattica ${idx + 1}`
                : idx === 3
                ? 'Truccatore Jolly & Rotazione'
                : `Truccatore Jolly #${idx - 2}`;

            return (
              <div
                key={artist.id}
                onClick={() => {
                  setSelectedArtistId(artist.id);
                  setDisplayMode('single');
                }}
                className={`p-3.5 border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-pink-950/30 border-pink-500 shadow-lg shadow-pink-950/30'
                    : 'bg-neutral-950/90 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-pink-950/80 border border-pink-700/50 text-pink-300 font-mono text-[11px] font-bold">
                      {artist.badgeCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                        idx < 3
                          ? 'bg-blue-950/60 border border-blue-700/40 text-blue-300'
                          : 'bg-amber-950/60 border border-amber-700/40 text-amber-300'
                      }`}
                    >
                      {roleLabel}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white truncate">{artist.name}</div>
                  <div className="text-[11px] text-neutral-400 font-sans truncate">
                    {artist.specialty}
                  </div>
                </div>

                {/* Paired Actors Badges */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>ATTORI BASE ({pairedActors.length})</span>
                    <span className="text-emerald-400 font-bold">
                      {stat.totalPrimaryScenarios} Scenari ({stat.day2PrimaryCount} D2 +{' '}
                      {stat.day3PrimaryCount} D3)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {pairedActors.map((act) => (
                      <span
                        key={act.id}
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold border flex items-center gap-1 ${
                          act.physicalStatus === 'AMPUTATO'
                            ? 'bg-red-950/60 border-red-700/50 text-red-200'
                            : 'bg-emerald-950/50 border-emerald-700/40 text-emerald-200'
                        }`}
                      >
                        {act.badgeCode} • {act.name.split(' ')[0]} (
                        {act.physicalStatus === 'AMPUTATO' ? 'AMP' : 'INT'})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Display Mode Switcher Bar: Selettore Singolo Truccatore vs Vista Comparativa Affiancata */}
        <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setDisplayMode('single')}
              className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
                displayMode === 'single'
                  ? 'bg-pink-600 border-pink-400 text-white shadow'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Selettore Singolo Truccatore (Timeline Dettagliata)
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('comparative')}
              className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
                displayMode === 'comparative'
                  ? 'bg-pink-600 border-pink-400 text-white shadow'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Vista Comparativa Affiancata ({makeupArtists.length} Truccatori × 4 Blocchi)
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
            <span>
              Attori Totali: <strong className="text-white">{actors.length}</strong> (
              <span className="text-red-400 font-bold">{amputeeCount} AMPUTATI</span> •{' '}
              <span className="text-emerald-400 font-bold">{fullBodyCount} INTERI</span>)
            </span>
            {onOpenActorsRegistry && (
              <button
                type="button"
                onClick={onOpenActorsRegistry}
                className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Anagrafica Attori →
              </button>
            )}
            {onOpenArtistsRegistry && (
              <button
                type="button"
                onClick={onOpenArtistsRegistry}
                className="text-pink-400 hover:text-pink-300 underline cursor-pointer"
              >
                Anagrafica Truccatori →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODE 1: SELETTORE SINGOLO TRUCCATORE (TIMELINE PERSONALIZZATA DETTAGLIATA) */}
      {displayMode === 'single' && activeArtist && (
        <div className="space-y-4">
          {/* Selector Tabs for Individual Makeup Artist */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {makeupArtists.map((artist, idx) => {
              const isSelected = artist.id === activeArtist.id;
              const stat = workloadStats.find((s) => s.artist.id === artist.id);
              return (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => setSelectedArtistId(artist.id)}
                  className={`px-4 py-2.5 font-mono text-xs font-bold uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-pink-600 border-pink-400 text-white shadow-lg shadow-pink-950/40'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <span className="px-1.5 py-0.5 bg-black/30 text-[10px]">
                    {artist.badgeCode}
                  </span>
                  <span>{artist.name}</span>
                  <span
                    className={`px-1.5 py-0.5 text-[9px] ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {idx < 3 ? `Post. ${idx + 1}` : 'Jolly'} •{' '}
                    {stat?.pairedActors.length || 0} Att. /{' '}
                    {stat?.totalPrimaryScenarios || 0} Scen.
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Makeup Artist Profile & Paired Actors Readiness Strip */}
          {(() => {
            const artistIdx = makeupArtists.findIndex((m) => m.id === activeArtist.id);
            const pairedActors = actors.filter(
              (a) => a.assignedMakeupArtistId === activeArtist.id
            );
            const artistBlocks = timelinesByArtistId[activeArtist.id] || [];
            const activeDayScenarioCount = artistBlocks.filter(
              (b) => b.roleType === 'STATION_PRIMARY'
            ).length;
            const coAssistBlocksCount = artistBlocks.filter(
              (b) => b.roleType === 'JOLLY_SUPPORT'
            ).length;

            return (
              <div className="space-y-4">
                {/* Artist Profile & Paired Actors Card */}
                <div className="bg-neutral-900 border border-pink-800/40 p-4 shadow-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2.5 py-1 bg-pink-600 text-white font-mono text-xs font-bold">
                          {activeArtist.badgeCode}
                        </span>
                        <h3 className="text-lg font-bold text-white">{activeArtist.name}</h3>
                        <span className="px-2.5 py-0.5 bg-neutral-800 border border-neutral-700 text-pink-300 font-mono text-xs font-bold">
                          {activeArtist.role}
                        </span>
                        {activeArtist.phone && (
                          <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-neutral-500" />
                            {activeArtist.phone}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setQrModalArtist(activeArtist)}
                          className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 border border-pink-600/70 text-pink-300 font-mono text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                          title="Visualizza e Stampa QR Pass"
                        >
                          <QrCode className="w-3 h-3 text-pink-400" />
                          <span>QR Pass</span>
                        </button>
                      </div>
                      <p className="text-xs text-neutral-300 font-sans">
                        <strong>Specialità Tecnica:</strong> {activeArtist.specialty}{' '}
                        {activeArtist.notes ? `— ${activeArtist.notes}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="px-3 py-2 bg-neutral-950 border border-neutral-800 text-center">
                        <div className="text-[10px] font-mono uppercase text-neutral-500">
                          Postazione Presidiata
                        </div>
                        <div className="text-xs font-mono font-bold text-pink-300">
                          {artistIdx >= 0 && artistIdx < 3
                            ? `Postazione Tattica ${artistIdx + 1}`
                            : 'Jolly Mobile (Postazioni 1–3)'}
                        </div>
                      </div>
                      <div className="px-3 py-2 bg-neutral-950 border border-neutral-800 text-center">
                        <div className="text-[10px] font-mono uppercase text-neutral-500">
                          Attori in Carico Base
                        </div>
                        <div className="text-xs font-mono font-bold text-white">
                          {pairedActors.length} Figuranti (
                          {pairedActors.map((a) => a.badgeCode).join(', ') || 'Nessuno'})
                        </div>
                      </div>
                      <div className="px-3 py-2 bg-neutral-950 border border-neutral-800 text-center">
                        <div className="text-[10px] font-mono uppercase text-neutral-500">
                          Carico DAY 0{currentDay}
                        </div>
                        <div className="text-xs font-mono font-bold text-emerald-400">
                          {activeDayScenarioCount} Scenari Titolare
                          {coAssistBlocksCount > 0
                            ? ` + ${coAssistBlocksCount} Turni Jolly`
                            : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paired Actors Quick Readiness Controls */}
                  <div className="mt-3 pt-1">
                    <div className="text-[11px] font-mono font-bold uppercase text-neutral-400 mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-pink-400" />
                      Figuranti Assegnati in Anagrafica a {activeArtist.badgeCode} (Controllo Rapido Stato Avanzamento)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pairedActors.map((actor) => (
                        <div
                          key={actor.id}
                          className="p-3 bg-neutral-950 border border-neutral-800 flex flex-col justify-between gap-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 bg-neutral-800 text-white font-mono text-xs font-bold">
                                  {actor.badgeCode}
                                </span>
                                <span className="text-sm font-bold text-white">
                                  {actor.name}
                                </span>
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                                    actor.physicalStatus === 'AMPUTATO'
                                      ? 'bg-red-950/70 border-red-700/60 text-red-300'
                                      : 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300'
                                  }`}
                                >
                                  {actor.physicalStatus}
                                </span>
                              </div>
                              <div className="text-xs text-neutral-300 font-sans mt-1">
                                {actor.amputationDetails}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-[11px] text-neutral-400 font-mono flex-wrap">
                                {actor.clothingSize && (
                                  <span className="flex items-center gap-1">
                                    <Shirt className="w-3 h-3 text-neutral-500" />
                                    Taglia {actor.clothingSize}
                                  </span>
                                )}
                                {actor.makeupAllergies && (
                                  <span className="flex items-center gap-1 text-amber-300">
                                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                                    {actor.makeupAllergies}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <ActorProgressStatusControl
                            status={actor.progressStatus || 'STANDBY'}
                            updatedAt={actor.progressUpdatedAt}
                            updatedBy={actor.progressUpdatedBy}
                            onSelectStatus={(nextStatus) =>
                              updateActorProgressStatus(actor.id, nextStatus, {
                                updatedBy: `${activeArtist.badgeCode} • ${activeArtist.name}`,
                              })
                            }
                            compact={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4-BLOCK PERSONALIZED TIMELINE FOR SELECTED MAKEUP ARTIST */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {artistBlocks.map((entry) => {
                    const isPrimary = entry.roleType === 'STATION_PRIMARY';
                    const patient = entry.patient;
                    const actor = entry.assignedActor;
                    const t0Time = entry.blockMeta.tcccWindow.split('-')[0].trim();

                    return (
                      <div
                        key={entry.blockMeta.blockNumber}
                        className={`border p-4 flex flex-col justify-between gap-4 transition-all ${
                          isPrimary
                            ? 'bg-neutral-900 border-neutral-800 shadow-lg'
                            : 'bg-neutral-900/90 border-amber-800/50 shadow-lg'
                        }`}
                      >
                        {/* Block Header */}
                        <div>
                          <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-neutral-800">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-pink-950/80 border border-pink-700/60 text-pink-300 font-mono text-xs font-bold uppercase">
                                BLOCCO {entry.blockMeta.blockNumber}
                              </span>
                              <div>
                                <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-pink-400" />
                                  Prep Moulage: {entry.blockMeta.truccoPrepWindow}
                                </div>
                                <div className="text-[11px] font-mono text-neutral-400">
                                  Blocco Clinico: {entry.blockMeta.blockTimeRange} (T0 Ingaggio:{' '}
                                  <strong className="text-emerald-400">{t0Time}</strong>)
                                </div>
                              </div>
                            </div>

                            {/* Role Badge in this block */}
                            <span
                              className={`px-2.5 py-1 font-mono text-[10px] font-bold uppercase border ${
                                isPrimary
                                  ? 'bg-blue-950/60 border-blue-700/50 text-blue-300'
                                  : 'bg-amber-950/60 border-amber-700/60 text-amber-300'
                              }`}
                            >
                              {isPrimary
                                ? `TITOLARE POSTAZIONE TATTICA ${entry.stationIndex}`
                                : 'SUPPORTO JOLLY & MONCONI COMPLESSI'}
                            </span>
                          </div>

                          {/* CASE A: Direct Primary Scenario in this Block */}
                          {isPrimary && patient && (
                            <div className="mt-3 p-3.5 bg-neutral-950 border border-neutral-800 space-y-3">
                              {(() => {
                                const currentProgress =
                                  patient.actorProgressStatus ||
                                  actor?.progressStatus ||
                                  'STANDBY';
                                const progressMeta = ACTOR_PROGRESS_META[currentProgress];
                                const steps = buildStepSchedule(
                                  entry.blockMeta.truccoPrepWindow,
                                  entry.blockMeta.tcccWindow,
                                  actor?.physicalStatus === 'AMPUTATO'
                                );

                                return (
                                  <>
                                    {/* Scenario & Station Header */}
                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="px-2 py-0.5 bg-blue-950/70 border border-blue-700/50 text-blue-300 font-mono text-[11px] font-bold">
                                            POSTAZIONE TATTICA {entry.stationIndex}
                                          </span>
                                          <span className="px-2 py-0.5 bg-neutral-800 text-white font-mono text-xs font-bold">
                                            Paziente #{patient.id} ({patient.scenarioCode})
                                          </span>
                                          <span className="text-sm font-bold text-white">
                                            {patient.title || patient.lesioni[0] || patient.scenarioCode}
                                          </span>
                                        </div>
                                        <div className="text-xs text-neutral-400 font-sans mt-1">
                                          Lesioni:{' '}
                                          <strong className="text-neutral-200">
                                            {patient.lesioni.join(' • ')}
                                          </strong>
                                        </div>
                                      </div>

                                      <span
                                        className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase border ${progressMeta.badgeClass}`}
                                      >
                                        {progressMeta.step}/5 • {progressMeta.shortIt}
                                      </span>
                                    </div>

                                    {/* Paired Actor Info Box + Selector */}
                                    <div className="p-2.5 bg-neutral-900 border border-neutral-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="space-y-0.5">
                                        <div className="text-[10px] font-mono uppercase text-neutral-400">
                                          Figurante Assegnato allo Scenario
                                        </div>
                                        {actor ? (
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-mono font-bold text-white">
                                              {actor.badgeCode} — {actor.name}
                                            </span>
                                            <span
                                              className={`px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                                                actor.physicalStatus === 'AMPUTATO'
                                                  ? 'bg-red-950/80 border border-red-700/60 text-red-300'
                                                  : 'bg-emerald-950/70 border border-emerald-700/50 text-emerald-300'
                                              }`}
                                            >
                                              {actor.physicalStatus}
                                            </span>
                                            <span className="text-[11px] text-neutral-400 font-sans">
                                              ({actor.amputationDetails})
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-xs text-amber-400 font-mono">
                                            Nessun attore associato
                                          </span>
                                        )}
                                      </div>

                                      {/* Quick Override Selector for Actor in this Scenario */}
                                      <div className="flex items-center gap-1.5">
                                        <select
                                          value={patient.assignedActorId || actor?.id || ''}
                                          onChange={(e) =>
                                            assignTruccoToPatient(
                                              patient.id,
                                              e.target.value,
                                              activeArtist.id
                                            )
                                          }
                                          className="bg-neutral-950 border border-neutral-700 px-2 py-1 text-[11px] font-mono text-white focus:outline-none focus:border-pink-500"
                                          title="Cambia figurante per questo scenario"
                                        >
                                          {actors.map((act) => (
                                            <option key={act.id} value={act.id}>
                                              {act.badgeCode} • {act.name} ({act.physicalStatus})
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>

                                    {/* Co-Assist Jolly Notice when Actor is AMPUTATO or supported by Jolly */}
                                    {entry.jollyCoAssistant && (
                                      <div className="px-3 py-2 bg-amber-950/40 border border-amber-700/50 text-amber-200 text-[11px] font-mono flex items-center gap-2">
                                        <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                        <span>
                                          <strong>Supporto Jolly Attivo:</strong>{' '}
                                          {entry.jollyCoAssistant.badgeCode} (
                                          {entry.jollyCoAssistant.name}) co-assiste per innesto
                                          moncone e circuito pompa sangue.
                                        </span>
                                      </div>
                                    )}

                                    {/* 4-Step Cronoprogramma Operativo Pre-Scenario (T-45 -> T0) */}
                                    <div className="space-y-1.5">
                                      <div className="text-[10px] font-mono font-bold uppercase text-pink-300 flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5" />
                                        Cronoprogramma Operativo Individuale (T-45 min ➔ T0{' '}
                                        {t0Time})
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                        {steps.map((step, sIdx) => (
                                          <div
                                            key={sIdx}
                                            className="p-2 bg-neutral-900/90 border border-neutral-800/80 flex flex-col gap-0.5"
                                          >
                                            <div className="flex items-center justify-between text-[10px] font-mono">
                                              <span className="text-pink-400 font-bold">
                                                {step.offsetLabel}
                                              </span>
                                              <span className="text-white font-bold">
                                                {step.timeRange}
                                              </span>
                                            </div>
                                            <div className="text-[11px] font-bold text-neutral-200">
                                              {step.phaseTitle}
                                            </div>
                                            <div className="text-[10px] text-neutral-400 font-sans leading-snug">
                                              {step.description}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Interactive 5-Stage Progress Control + Pre-Scenario Check */}
                                    {actor && (
                                      <div className="pt-2 border-t border-neutral-800 space-y-2">
                                        <ActorProgressStatusControl
                                          status={currentProgress}
                                          updatedAt={
                                            patient.actorProgressUpdatedAt ||
                                            actor.progressUpdatedAt
                                          }
                                          updatedBy={
                                            patient.actorProgressUpdatedBy ||
                                            actor.progressUpdatedBy
                                          }
                                          onSelectStatus={(nextStatus) =>
                                            updateActorProgressStatus(actor.id, nextStatus, {
                                              patientId: patient.id,
                                              updatedBy: `${activeArtist.badgeCode} • ${activeArtist.name}`,
                                            })
                                          }
                                          compact={false}
                                        />
                                        <div className="flex items-center justify-between pt-1">
                                          <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[60%]">
                                            Moulage: <strong className="text-neutral-200">{patient.moulageProtesi}</strong>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateTechChecklist(
                                                patient.id,
                                                'preDone',
                                                !patient.techChecklist?.preDone
                                              )
                                            }
                                            className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 border cursor-pointer transition-all ${
                                              patient.techChecklist?.preDone
                                                ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300'
                                                : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-pink-500'
                                            }`}
                                          >
                                            <CheckCircle2 className="w-3 h-3" />
                                            {patient.techChecklist?.preDone
                                              ? 'Checklist Pre-Scenario OK'
                                              : 'Valida Checklist Pre-Scenario'}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}

                          {/* CASE B: Co-Assist Jolly Block */}
                          {!isPrimary && entry.jollySupportPatient && (
                            <div className="mt-3 p-3.5 bg-amber-950/20 border border-amber-800/50 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
                                  <Wrench className="w-4 h-4 text-amber-400" />
                                  Turno di Co-Assistenza Jolly & Pre-Allestimento Blocco Successivo
                                </span>
                                <span className="text-[10px] font-mono text-amber-200">
                                  Finestra: {entry.blockMeta.truccoPrepWindow}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-300 font-sans">
                                In questo blocco <strong>{activeArtist.badgeCode}</strong> opera in modalità <strong>Jolly Mobile</strong> per garantire rotazione omogenea del carico (6 scenari titolare ciascuno) e co-assiste la postazione ad alta complessità:
                              </p>

                              <div className="p-3 bg-neutral-950 border border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-700/60 text-amber-300 font-mono text-[10px] font-bold">
                                      CO-ASSISTENZA PAZIENTE #{entry.jollySupportPatient.id}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-white">
                                      {entry.jollySupportPatient.title ||
                                        entry.jollySupportPatient.lesioni[0] ||
                                        entry.jollySupportPatient.scenarioCode}
                                    </span>
                                    {entry.jollySupportActor && (
                                      <span className="px-2 py-0.5 bg-red-950/70 border border-red-700/60 text-red-200 font-mono text-[10px] font-bold">
                                        {entry.jollySupportActor.badgeCode} (
                                        {entry.jollySupportActor.name} •{' '}
                                        {entry.jollySupportActor.physicalStatus})
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-neutral-400 font-sans">
                                    Titolare Postazione:{' '}
                                    <strong className="text-pink-300">
                                      {entry.jollySupportPrimaryArtist
                                        ? `${entry.jollySupportPrimaryArtist.badgeCode} (${entry.jollySupportPrimaryArtist.name})`
                                        : 'Non assegnato'}
                                    </strong>{' '}
                                    • Compito Jolly: Innesto moncone protesico, tenuta valvole e rifornimento serbatoio
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    assignTruccoToPatient(
                                      entry.jollySupportPatient!.id,
                                      entry.jollySupportPatient!.assignedActorId ||
                                        entry.jollySupportActor?.id ||
                                        'actor-1',
                                      activeArtist.id
                                    )
                                  }
                                  className="px-2.5 py-1.5 bg-neutral-800 hover:bg-pink-600 text-neutral-200 hover:text-white font-mono text-[10px] font-bold uppercase shrink-0 transition-all cursor-pointer"
                                  title="Assegna questo scenario direttamente a questo truccatore come titolare"
                                >
                                  Prendi in Carico Diretto
                                </button>
                              </div>

                              {entry.nextBlockPrePrepPatients.length > 0 && (
                                <div className="p-2.5 bg-neutral-950/80 border border-neutral-800 text-[11px] font-mono text-neutral-300">
                                  <span className="text-pink-400 font-bold uppercase block mb-0.5">
                                    Pre-Preparazione Lab Moulage Blocco {entry.blockMeta.blockNumber + 1}:
                                  </span>
                                  Pre-caricamento sacche sangue e protesi per Pazienti{' '}
                                  {entry.nextBlockPrePrepPatients
                                    .map((p) => `#${p.id} (${p.scenarioCode})`)
                                    .join(', ')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Footer Quick Reassign in Block */}
                        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                          <span>
                            Scenari Blocco {entry.blockMeta.blockNumber}:{' '}
                            {entry.blockMeta.patientIds.map((id) => `#${id}`).join(', ')}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            Handover SBAR: {entry.blockMeta.handoverTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* MODE 2: VISTA COMPARATIVA AFFIANCATA (TUTTI I TRUCCATORI × 4 BLOCCHI) */}
      {displayMode === 'comparative' && (
        <div className="bg-neutral-900 border border-neutral-800 p-4 shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Columns className="w-4 h-4 text-pink-400" />
                Matrice Timeline Comparativa Affiancata — DAY 0{currentDay} (
                {currentDay === 2 ? 'Pazienti #1–#12' : 'Pazienti #13–#24'})
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Confronto simultaneo del carico operativo dei{' '}
                <strong>{makeupArtists.length} Truccatori</strong> lungo i 4 blocchi addestrativi con modifica rapida di truccatore o attore.
              </p>
            </div>
          </div>

          <div
            className="grid gap-3 min-w-[920px]"
            style={{
              gridTemplateColumns: `repeat(${Math.max(1, makeupArtists.length)}, minmax(240px, 1fr))`,
            }}
          >
            {makeupArtists.map((artist, idx) => {
              const artistBlocks = timelinesByArtistId[artist.id] || [];
              const stat = workloadStats.find((s) => s.artist.id === artist.id);
              const pairedActors = stat?.pairedActors || [];

              return (
                <div
                  key={artist.id}
                  className="bg-neutral-950 border border-neutral-800 p-3 flex flex-col gap-3"
                >
                  {/* Column Header for Makeup Artist */}
                  <div className="p-3 bg-neutral-900 border border-pink-800/40 space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-2 py-0.5 bg-pink-600 text-white font-mono text-xs font-bold">
                        {artist.badgeCode}
                      </span>
                      <span className="px-2 py-0.5 bg-neutral-800 text-pink-300 font-mono text-[10px] font-bold uppercase">
                        {idx < 3 ? `Postazione ${idx + 1}` : 'Truccatore Jolly'}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white truncate">{artist.name}</div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-neutral-800">
                      <span>{pairedActors.length} Attori Base</span>
                      <span className="text-emerald-400 font-bold">
                        {stat?.totalPrimaryScenarios || 0} Scenari Tot.
                      </span>
                    </div>
                  </div>

                  {/* 4 Blocks Stacked in Column */}
                  <div className="space-y-2.5">
                    {artistBlocks.map((entry) => {
                      const isPrimary = entry.roleType === 'STATION_PRIMARY';
                      const patient = entry.patient;
                      const actor = entry.assignedActor;
                      const t0Time = entry.blockMeta.tcccWindow.split('-')[0].trim();

                      return (
                        <div
                          key={entry.blockMeta.blockNumber}
                          className={`p-3 border space-y-2 ${
                            isPrimary
                              ? 'bg-neutral-900 border-neutral-800'
                              : 'bg-amber-950/15 border-amber-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="font-bold text-pink-300 uppercase">
                              Blocco {entry.blockMeta.blockNumber} ({entry.blockMeta.truccoPrepWindow})
                            </span>
                            <span className="text-neutral-400">T0 {t0Time}</span>
                          </div>

                          {isPrimary && patient ? (
                            <div className="p-2.5 bg-neutral-950 border border-neutral-800 space-y-2">
                              <div className="flex items-center justify-between gap-1">
                                <span className="px-1.5 py-0.5 bg-blue-950/70 text-blue-300 font-mono text-[10px] font-bold">
                                  Post. {entry.stationIndex} • Pz #{patient.id}
                                </span>
                                {actor && (
                                  <span
                                    className={`px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${
                                      actor.physicalStatus === 'AMPUTATO'
                                        ? 'bg-red-950/80 text-red-300 border border-red-700/50'
                                        : 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/40'
                                    }`}
                                  >
                                    {actor.badgeCode} (
                                    {actor.physicalStatus === 'AMPUTATO' ? 'AMP' : 'INT'})
                                  </span>
                                )}
                              </div>

                              <div className="text-xs font-bold text-white line-clamp-1">
                                {patient.title || patient.lesioni[0] || patient.scenarioCode}
                              </div>

                              {actor && (
                                <div className="text-[11px] text-neutral-300 font-mono truncate">
                                  Figurante: <strong>{actor.name}</strong>
                                </div>
                              )}

                              {/* Quick Reassign Makeup Artist for this Scenario */}
                              <div className="pt-1">
                                <select
                                  value={patient.assignedMakeupArtistId || artist.id}
                                  onChange={(e) =>
                                    assignTruccoToPatient(
                                      patient.id,
                                      patient.assignedActorId || actor?.id || 'actor-1',
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-neutral-900 border border-neutral-800 px-2 py-1 text-[10px] font-mono text-neutral-200 focus:outline-none focus:border-pink-500"
                                >
                                  {makeupArtists.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      Truccatore: {m.badgeCode} • {m.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {actor && (
                                <ActorProgressStatusControl
                                  status={
                                    patient.actorProgressStatus ||
                                    actor.progressStatus ||
                                    'STANDBY'
                                  }
                                  updatedAt={
                                    patient.actorProgressUpdatedAt || actor.progressUpdatedAt
                                  }
                                  updatedBy={
                                    patient.actorProgressUpdatedBy || actor.progressUpdatedBy
                                  }
                                  onSelectStatus={(nextStatus) =>
                                    updateActorProgressStatus(actor.id, nextStatus, {
                                      patientId: patient.id,
                                      updatedBy: `${artist.badgeCode} • ${artist.name}`,
                                    })
                                  }
                                  compact={true}
                                />
                              )}
                            </div>
                          ) : (
                            <div className="p-2.5 bg-neutral-950/80 border border-amber-800/30 space-y-1.5">
                              <div className="text-[10px] font-mono font-bold text-amber-300 uppercase flex items-center gap-1">
                                <Wrench className="w-3 h-3" />
                                Turno Supporto Jolly
                              </div>
                              {entry.jollySupportPatient && (
                                <div className="text-[11px] text-neutral-300 font-sans leading-snug">
                                  Co-assiste <strong>Paz. #{entry.jollySupportPatient.id}</strong> (
                                  {entry.jollySupportActor?.badgeCode} •{' '}
                                  {entry.jollySupportActor?.physicalStatus}) con{' '}
                                  <span className="text-pink-300 font-mono">
                                    {entry.jollySupportPrimaryArtist?.badgeCode}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QR Code Pass Modal for Makeup Artist */}
      {qrModalArtist && (
        <ParticipantQRModal
          isOpen={Boolean(qrModalArtist)}
          onClose={() => setQrModalArtist(null)}
          person={qrModalArtist}
          category="truccatori"
        />
      )}
    </div>
  );
};
