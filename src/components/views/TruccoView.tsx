import React, { useState, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  OPERATIONAL_BLOCKS_BY_DAY,
  getStationIndexForPatientId,
  OperationalBlockMeta,
} from '../../data/protesiCatalog';
import {
  CourseActor,
  CourseDay,
  GroupType,
  MakeupArtist,
  ProtesiItem,
  TimelineSlot,
} from '../../types';
import { TimelineSyncNavigator } from '../common/TimelineSyncNavigator';
import {
  Sparkles,
  CheckCircle2,
  Package,
  Radio,
  ArrowRight,
  AlertTriangle,
  FileText,
  Users,
  UserCheck,
  Shirt,
  ShieldAlert,
  Link2,
  Phone,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { translatePatient } from '../../utils/courseTranslation';
import { AnagraficaTruccoPanel } from '../anagrafica/AnagraficaTruccoPanel';
import { MakeupArtistPersonalTimelinePanel } from '../anagrafica/MakeupArtistPersonalTimelinePanel';
import { DeephitterTruccoTimelineView } from './DeephitterTruccoTimelineView';
import { TruccoPriorityAlertBanner } from './TruccoPriorityAlertBanner';
import { checkActorCriticality, getSimulatedCourseMinutes } from '../../utils/deephitterSync';
import {
  ActorProgressStatusControl,
  ACTOR_PROGRESS_META,
  getStatusIcon,
} from '../anagrafica/ActorProgressStatusControl';

const GROUP_NAMES: Record<GroupType, string> = {
  A: 'ALPHA',
  B: 'BRAVO',
  C: 'CHARLIE',
  D: 'DELTA',
};

interface TruccoPrepStep {
  timeOffset: string;
  labelIt: string;
  labelEn: string;
  detailIt: string;
  detailEn: string;
}

const PRE_SCENARIO_STEPS: TruccoPrepStep[] = [
  {
    timeOffset: 'T -45 min ➔ T -30 min',
    labelIt: '01. Briefing Coppia Truccatore-Attore & Applicazione Base Silicone',
    labelEn: '01. Makeup Artist-Actor Pairing & Base Silicone Application',
    detailIt:
      'Accoglienza degli 8 slot attori (Amputati e Interi) in Lab Moulage con il rispettivo Truccatore associato, verifica allergie cutanee e applicazione mastice Pros-Aide.',
    detailEn:
      'Check-in of the 8 actor slots (Amputee and Full-Body) at Moulage Lab with their paired Makeup Artist, skin allergy check and Pros-Aide application.',
  },
  {
    timeOffset: 'T -30 min ➔ T -15 min',
    labelIt: '02. Montaggio Protesi Attive & Caricamento Linee Sangue Pulsante',
    labelEn: '02. Active Prosthetics Mounting & Pulsatile Blood Line Priming',
    detailIt:
      'Innesto monconi su attori amputati o gilet/grembiuli su attori interi, raccordo tubi alle pompe peristaltiche, riempimento serbatoi (1.5L–3L) e test CRIC/REBOA.',
    detailEn:
      'Stump prosthetics fitting on amputee actors or vests on full-body actors, peristaltic pump tubing connection, reservoir filling (1.5L–3L) and CRIC/REBOA test.',
  },
  {
    timeOffset: 'T -15 min ➔ T0 (Pre-Allerta)',
    labelIt: '03. Posizionamento in Ambiente Tattico 1–3 & Luce Verde CH-3',
    labelEn: '03. Deployment in Tactical Env. 1–3 & CH-3 Green Light',
    detailIt:
      'Posizionamento attori e simulatori in Ambiente Tattico 1, 2 e 3 durante la Pre-Allerta TCCC (-15m), presidio truccatore sul campo e invio Luce Verde a Regia.',
    detailEn:
      'Actor and simulator positioning in Tactical Env. 1, 2 and 3 during TCCC Pre-Alert (-15m), field makeup artist standby and Green Light to Control Room.',
  },
];

export const TruccoView: React.FC = () => {
  const {
    activeDay,
    setActiveDay,
    currentSlot,
    timerSeconds,
    simulatorPatients,
    updateTechChecklist,
    protesiCatalog,
    teams,
    faculty,
    technicians,
    actors,
    makeupArtists,
    assignTruccoToPatient,
    rebalanceTruccoWorkload,
    updateActorProgressStatus,
    sendCourseMessage,
    setCurrentTab,
    language,
  } = useCourse();

  const isEn = language === 'en';
  const [activeViewMode, setActiveViewMode] = useState<
    'deephitter' | 'personal_timeline' | 'timeline' | 'attori' | 'truccatori' | 'matrice'
  >('deephitter');
  const [focusedArtistId, setFocusedArtistId] = useState<string | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<CourseDay>(activeDay || 2);
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [radioSentBanner, setRadioSentBanner] = useState<string | null>(null);

  // Stato consultazione slot vs sincronizzazione live Regia
  const [inspectedSlot, setInspectedSlot] = useState<TimelineSlot | null>(null);
  const liveCurrentSlot = currentSlot;
  const effectiveSlot = inspectedSlot || liveCurrentSlot;
  const isLiveSync = inspectedSlot === null || inspectedSlot.id === liveCurrentSlot?.id;

  const dayBlocks = useMemo(() => {
    return OPERATIONAL_BLOCKS_BY_DAY[selectedDay] || OPERATIONAL_BLOCKS_BY_DAY[2];
  }, [selectedDay]);

  const currentCourseMinutes = useMemo(() => {
    return getSimulatedCourseMinutes(currentSlot, timerSeconds);
  }, [currentSlot, timerSeconds]);

  const visibleBlocks = useMemo(() => {
    if (selectedBlockFilter === 'ALL') return dayBlocks;
    return dayBlocks.filter((b) => b.blockNumber === selectedBlockFilter);
  }, [dayBlocks, selectedBlockFilter]);

  const activePrepBlockNumber = useMemo((): 1 | 2 | 3 | 4 => {
    const mins = currentSlot?.startMinutes || 510;
    if (mins < 620) return 1;
    if (mins < 760) return 2;
    if (mins < 930) return 3;
    return 4;
  }, [currentSlot]);

  const amputatiCount = useMemo(
    () => actors.filter((a) => a.physicalStatus === 'AMPUTATO').length,
    [actors]
  );
  const interiCount = useMemo(
    () => actors.filter((a) => a.physicalStatus === 'INTERO').length,
    [actors]
  );

  const getActorById = (actorId?: string): CourseActor => {
    return actors.find((a) => a.id === actorId) || actors[0];
  };

  const getMakeupArtistById = (artistId?: string): MakeupArtist => {
    return makeupArtists.find((m) => m.id === artistId) || makeupArtists[0];
  };

  const getTeamInfo = (teamId: number) => {
    const team = teams.find((t) => t.id === teamId);
    const fac =
      faculty.find((f) => f.assignedTeamId === teamId) ||
      faculty[(teamId - 1) % Math.max(1, faculty.length)];
    const tech = technicians[(teamId - 1) % Math.max(1, technicians.length)];
    return {
      teamName: team?.name || `SQ-${teamId}`,
      facCode: fac?.badgeCode || `FAC-${String(teamId).padStart(2, '0')}`,
      techCode: tech?.badgeCode || `TECH-${String(teamId).padStart(2, '0')}`,
      techName: tech?.name || 'Tecnico',
    };
  };

  const getPatientProtesi = (patientId: number): ProtesiItem[] => {
    return protesiCatalog.filter((item) =>
      item.scenariosUsed?.some((s) => s.patientId === patientId)
    );
  };

  const dayPatients = useMemo(() => {
    return simulatorPatients
      .filter((p) => p.day === selectedDay)
      .map((p) => translatePatient(p, language));
  }, [simulatorPatients, selectedDay, language]);

  const totalDayReady = useMemo(() => {
    return dayPatients.filter((p) => p.techChecklist?.preDone).length;
  }, [dayPatients]);

  const progressSummary = useMemo(() => {
    const counts = {
      STANDBY: 0,
      IN_PREPARAZIONE: 0,
      PRONTO_T0: 0,
      IN_SCENARIO: 0,
      RESET_SMONTAGGIO: 0,
    };
    actors.forEach((a) => {
      const st = a.progressStatus || 'STANDBY';
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [actors]);

  const handleMarkEntireBlockReady = (blockMeta: OperationalBlockMeta) => {
    const blockPts = dayPatients.filter((p) => blockMeta.patientIds.includes(p.id));
    blockPts.forEach((pt) => {
      updateTechChecklist(pt.id, 'preDone', true);
      const act = getActorById(pt.assignedActorId);
      const art = getMakeupArtistById(pt.assignedMakeupArtistId);
      if (act) {
        updateActorProgressStatus(act.id, 'PRONTO_T0', {
          patientId: pt.id,
          updatedBy: art ? `${art.badgeCode} • ${art.name}` : undefined,
          notifyRegia: false,
        });
      }
    });
    const pairsSummary = blockPts
      .map((pt) => {
        const act = getActorById(pt.assignedActorId);
        const art = getMakeupArtistById(pt.assignedMakeupArtistId);
        return `Pz #${pt.id}: ${art?.badgeCode} ➔ ${act?.badgeCode} (${act?.physicalStatus})`;
      })
      .join(' | ');

    if (sendCourseMessage) {
      sendCourseMessage({
        senderId: 'TRUC-01',
        senderName: 'Silvia Rossi (Coord. Trucco & Moulage)',
        senderRole: 'tecnico',
        type: 'info',
        subject: `LUCE VERDE TRUCCO • DAY ${blockMeta.day} BLOCCO ${blockMeta.blockNumber}`,
        content: `Preparazione pre-scenario completata per Pazienti #${blockMeta.patientIds.join(', #')} (${blockMeta.truccoPrepWindow}). Coppie operative: ${pairsSummary}. Pronti al T0 (${blockMeta.tcccWindow.split('-')[0].trim()}).`,
      });
    }
    setRadioSentBanner(
      `Luce Verde Trucco inviata a Regia per Blocco ${blockMeta.blockNumber} (${pairsSummary})`
    );
    setTimeout(() => setRadioSentBanner(null), 4500);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12 font-mono animate-fadeIn">
      {/* Sincronizzazione automatica con timeline di Regia e navigatore consultazione slot */}
      <TimelineSyncNavigator
        currentSlot={effectiveSlot}
        masterCurrentSlot={liveCurrentSlot}
        isLiveSync={isLiveSync}
        onSelectSlot={(slot) => setInspectedSlot(slot)}
        onSyncToLive={() => setInspectedSlot(null)}
        roleLabel={isEn ? 'Moulage & Makeup' : 'Moulage & Trucco'}
        stationContext={
          isEn
            ? 'Lab Moulage & Actors Convocations (T -45 to T -15 prep)'
            : 'Lab Moulage & Convocazione Attori (Allestimento T -45 a T -15)'
        }
      />

      {/* Top Command Banner */}
      <div className="bg-neutral-900 border border-pink-500/80 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap text-xs text-pink-300">
              <span className="font-black text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isEn
                    ? 'VISUALE TRUCCO • MOULAGE TIMELINE & ACTORS ROSTER'
                    : 'VISUALE TRUCCO • TIMELINE PRE-SCENARIO & ANAGRAFICA TRUCCO'}
                </span>
              </span>
              <span>·</span>
              <span>Coord. Lab Moulage: Silvia Rossi (TRUC-01 / TECH-01)</span>
              <span>·</span>
              <span className="tabular-nums text-neutral-300">
                Slot Regia: {currentSlot?.timeRange || '08:30 - 09:00'} (T-{formatTimer(timerSeconds)})
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              {activeViewMode === 'timeline'
                ? isEn
                  ? `Day 0${selectedDay} • Pre-Scenario Makeup Timeline & Actor-Artist Pairing`
                  : `Giorno 0${selectedDay} • Timeline Trucco Pre-Scenario & Coppie Truccatore-Attore`
                : activeViewMode === 'personal_timeline'
                ? isEn
                  ? `Personalized Makeup Artist Timelines • ${makeupArtists.length} Artists × ${actors.length} Actors`
                  : `Timeline Personalizzata per Truccatore • Assetto ${makeupArtists.length} Truccatori × ${actors.length} Attori`
                : activeViewMode === 'attori'
                ? isEn
                  ? 'Anagrafica Attori • 8 Principal Slots (Amputee / Full-Body)'
                  : 'Scheda Anagrafica Attori • 8 Slot Principali (Stato Amputato / Intero)'
                : activeViewMode === 'truccatori'
                ? isEn
                  ? 'Anagrafica Truccatori • SFX & Silicone Moulage Specialists'
                  : 'Scheda Anagrafica Truccatori • Specialisti Moulage & Protesi SFX'
                : isEn
                ? 'Operational Association Matrix • Makeup Artist ↔ Actor per Scenario'
                : 'Matrice Associazioni Truccatore ↔ Attore per Blocco/Scenario'}
            </h1>

            <p className="text-xs text-neutral-400 font-sans max-w-4xl">
              {isEn
                ? 'Dedicated pre-scenario preparation timeline with personalized timelines for each Makeup Artist (4 base artists: Stations 1-3 + 1 Jolly; 8 base actors) and automatic homogeneous workload rebalancing.'
                : 'Pianificazione pre-scenario con Timeline Personalizzata per ogni Truccatore (4 Truccatori di base: Postazioni Tattiche 1–3 + 1 Jolly; 8 Attori di base), Anagrafica Attori e Anagrafica Truccatori separate e ribilanciamento dinamico automatico del carico.'}
            </p>
          </div>

          {/* Right KPI & Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2 self-end xl:self-center">
            <div className="bg-neutral-950 border border-amber-500/50 px-3 py-1.5 text-right">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">
                ASSETTO ({makeupArtists.length} TRUC × {actors.length} ATT)
              </span>
              <span className="text-xs font-black text-white tabular-nums">
                {amputatiCount} Amputati · {interiCount} Interi
              </span>
            </div>

            <div className="bg-neutral-950 border border-emerald-500/50 px-3 py-1.5 text-right">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                STATO AVANZAMENTO ATTORI
              </span>
              <span className="text-xs font-black text-white tabular-nums">
                {progressSummary.IN_PREPARAZIONE} In Prep · {progressSummary.PRONTO_T0} Pronti ·{' '}
                {progressSummary.IN_SCENARIO} In Scen.
              </span>
            </div>

            <div className="bg-neutral-950 border border-pink-500/60 px-3 py-1.5 text-right">
              <span className="text-[10px] text-pink-400 uppercase font-bold block">
                PRONTI T0 GIORNO 0{selectedDay}
              </span>
              <span className="text-xs font-black text-white tabular-nums">
                {totalDayReady} / {dayPatients.length} Pazienti
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCurrentTab('scenari')}
              className="px-3 py-2 bg-neutral-950 hover:bg-neutral-800 text-orange-300 font-bold text-xs border border-orange-600/60 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-orange-400" />
              <span>{isEn ? 'Scenarios Menu' : 'Menu Scenari'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('protesi')}
              className="px-3 py-2 bg-neutral-950 hover:bg-neutral-800 text-cyan-300 font-bold text-xs border border-cyan-600/60 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <Package className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEn ? 'Prosthetics Menu' : 'Menu Protesi'}</span>
            </button>
          </div>
        </div>

        {/* Primary View Mode Switcher: TIMELINE vs TIMELINE TRUCCATORI vs ANAGRAFICA ATTORI vs ANAGRAFICA TRUCCATORI vs MATRICE */}
        <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveViewMode('deephitter')}
              className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider border cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeViewMode === 'deephitter'
                  ? 'bg-pink-600 text-white border-pink-400 shadow-md ring-1 ring-pink-400'
                  : 'bg-neutral-950 text-pink-300 border-pink-500/50 hover:border-pink-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>1. Timeline DEEPHITTER VMK1 REV.3 (Live Sync)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('personal_timeline')}
              className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider border cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeViewMode === 'personal_timeline'
                  ? 'bg-emerald-500 text-black border-emerald-300'
                  : 'bg-neutral-950 text-emerald-300 border-emerald-500/50 hover:border-emerald-400'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                2. Timeline Personale Truccatrici ({makeupArtists.length} TRUCCO × {actors.length} ACT)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('timeline')}
              className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider border cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeViewMode === 'timeline'
                  ? 'bg-cyan-600 text-white border-cyan-400'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-cyan-500/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>3. Griglia Scenari & Procedure</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('attori')}
              className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider border cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeViewMode === 'attori'
                  ? 'bg-amber-500 text-black border-amber-300'
                  : 'bg-neutral-950 text-amber-300 border-amber-500/50 hover:border-amber-400'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>4. Anagrafica Attori ({actors.length} ACT)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('truccatori')}
              className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider border cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeViewMode === 'truccatori'
                  ? 'bg-pink-600 text-white border-pink-400'
                  : 'bg-neutral-950 text-pink-300 border-pink-500/50 hover:border-pink-400'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>5. Anagrafica Truccatrici ({makeupArtists.length} TRUCCO)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('matrice')}
              className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider border cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeViewMode === 'matrice'
                  ? 'bg-cyan-500 text-black border-cyan-300'
                  : 'bg-neutral-950 text-cyan-300 border-cyan-500/50 hover:border-cyan-400'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>6. Matrice Associazioni</span>
            </button>
          </div>

          {activeViewMode === 'timeline' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400 uppercase font-bold">Giornata:</span>
              <div className="flex bg-neutral-950 p-1 border border-neutral-800 gap-1">
                {([2, 3] as CourseDay[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setSelectedDay(d);
                      setActiveDay(d);
                    }}
                    className={`px-3 py-1 text-xs font-black uppercase cursor-pointer transition-colors whitespace-nowrap ${
                      selectedDay === d
                        ? 'bg-pink-600 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    DAY 0{d} ({d === 2 ? 'Pz 1–12' : 'Pz 13–24'})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Radio Confirmation Toast */}
        {radioSentBanner && (
          <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{radioSentBanner}</span>
            </div>
            <span className="text-[10px] uppercase bg-black/60 px-2 py-0.5 text-emerald-400">
              CH-3 REGIA SYNC
            </span>
          </div>
        )}

        {/* 4 Pre-Scenario Prep Windows Stepper (Visible in Timeline mode) */}
        {activeViewMode === 'timeline' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setSelectedBlockFilter('ALL')}
              className={`p-2 text-left border transition-all cursor-pointer ${
                selectedBlockFilter === 'ALL'
                  ? 'bg-pink-600 text-white border-pink-400 font-black'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-pink-600/50'
              }`}
            >
              <span className="text-[9px] uppercase block opacity-80">VISTA COMPLETA</span>
              <span className="text-xs font-black">TUTTI I 4 BLOCCHI</span>
            </button>

            {dayBlocks.map((b) => {
              const bPts = dayPatients.filter((p) => b.patientIds.includes(p.id));
              const bReady = bPts.filter((p) => p.techChecklist?.preDone).length;
              const isSelected = selectedBlockFilter === b.blockNumber;
              const isCurrentPrep = activePrepBlockNumber === b.blockNumber;

              return (
                <button
                  key={b.blockNumber}
                  type="button"
                  onClick={() => setSelectedBlockFilter(b.blockNumber)}
                  className={`p-2 text-left border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-pink-600 text-white border-pink-300 font-black'
                      : isCurrentPrep
                      ? 'bg-pink-950/50 text-pink-200 border-pink-500/80'
                      : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-pink-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] uppercase">
                    <span>PREP BLOCCO {b.blockNumber}</span>
                    <span
                      className={`px-1 font-black tabular-nums ${
                        bReady === 3 ? 'bg-emerald-500 text-black' : 'bg-black/40 text-pink-200'
                      }`}
                    >
                      {bReady}/3
                    </span>
                  </div>
                  <div className="text-xs font-black truncate mt-0.5 tabular-nums">
                    {b.truccoPrepWindow}
                  </div>
                  <div className="text-[9px] opacity-80 truncate tabular-nums">
                    Target T0: {b.tcccWindow.split('-')[0].trim()} (Pz #{b.patientIds.join(',')})
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SISTEMA NOTIFICA PRIORITARIA TRUCCO • ALLERTA T0 < 10 MINUTI */}
      <TruccoPriorityAlertBanner
        selectedDay={selectedDay}
        onOpenArtistTimeline={(badge) => {
          setFocusedArtistId(badge);
          setActiveViewMode('personal_timeline');
        }}
        onOpenActorsRegistry={() => setActiveViewMode('attori')}
      />

      {/* =====================================================================
          SEPARATED VIEWS: DEEPHITTER TIMELINE / PERSONAL TIMELINE / ATTORI / TRUCCATORI / MATRICE
      ====================================================================== */}
      {activeViewMode === 'deephitter' ? (
        <DeephitterTruccoTimelineView
          initialDay={selectedDay}
          onOpenArtistTimeline={(badge) => {
            setFocusedArtistId(badge);
            setActiveViewMode('personal_timeline');
          }}
          onOpenActorsRegistry={() => setActiveViewMode('attori')}
          onOpenArtistsRegistry={() => setActiveViewMode('truccatori')}
        />
      ) : activeViewMode === 'personal_timeline' ? (
        <MakeupArtistPersonalTimelinePanel
          initialArtistId={focusedArtistId}
          onOpenActorsRegistry={() => setActiveViewMode('attori')}
          onOpenArtistsRegistry={() => setActiveViewMode('truccatori')}
        />
      ) : activeViewMode === 'attori' ? (
        <AnagraficaTruccoPanel key="trucco-view-attori" forcedSection="attori" />
      ) : activeViewMode === 'truccatori' ? (
        <AnagraficaTruccoPanel key="trucco-view-truccatori" forcedSection="truccatori" />
      ) : activeViewMode === 'matrice' ? (
        <AnagraficaTruccoPanel key="trucco-view-matrice" forcedSection="matrice" />
      ) : (
        <>
          {/* Quick Roster Strip of the 8 Principal Actor Slots & Paired Makeup Artists + Quick 5-Stage Progress Controls */}
          <div className="bg-neutral-900 border border-neutral-800 p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <Users className="w-4 h-4 text-pink-400" />
                <span className="font-black text-white uppercase">
                  Barra Rapida {actors.length} Slot Attori • Stato Avanzamento & {makeupArtists.length} Truccatori Associati (Rapporto 1:{(actors.length / Math.max(1, makeupArtists.length)).toFixed(1)})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    rebalanceTruccoWorkload();
                    setRadioSentBanner(
                      `Carico ribilanciato in modo omogeneo: ${makeupArtists.length} Truccatori × ${actors.length} Attori`
                    );
                    setTimeout(() => setRadioSentBanner(null), 4000);
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-black border border-emerald-400 text-xs font-black uppercase cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ribilancia Carico</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('personal_timeline')}
                  className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/60 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Timeline Truccatori ({makeupArtists.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('attori')}
                  className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-500/60 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Anagrafica Attori ({actors.length} Slot)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('truccatori')}
                  className="px-2.5 py-1 bg-pink-950 hover:bg-pink-900 text-pink-200 border border-pink-600/60 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Anagrafica Truccatori ({makeupArtists.length})</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[...actors]
                .sort((a, b) => a.slotNumber - b.slotNumber)
                .map((actor) => {
                  const isAmp = actor.physicalStatus === 'AMPUTATO';
                  const pairedArtist = getMakeupArtistById(actor.assignedMakeupArtistId);
                  const criticality = checkActorCriticality(
                    actor.badgeCode,
                    selectedDay,
                    currentCourseMinutes,
                    actor.progressStatus
                  );
                  const isCritical = criticality.isCritical;

                  return (
                    <div
                      key={actor.id}
                      onClick={() => setActiveViewMode('attori')}
                      className={`p-2.5 bg-neutral-950 border cursor-pointer transition-colors space-y-1.5 ${
                        isCritical
                          ? 'border-2 border-red-500 ring-2 ring-red-500 bg-red-950/80 shadow-xl shadow-red-600/40 animate-pulse'
                          : isAmp
                          ? 'border-amber-500/60 hover:border-amber-400'
                          : 'border-neutral-800 hover:border-cyan-500/60'
                      }`}
                    >
                      {/* Critical Alert Badge if in prep and T0 < 10m */}
                      {isCritical && (
                        <div className="p-1 px-1.5 bg-red-950 border border-red-500 text-red-100 text-[10px] font-black flex items-center justify-between animate-pulse">
                          <span>⚠️ ALLERTA T0 &lt; 10m (IN PREP)</span>
                          <span className="tabular-nums font-mono text-white bg-red-600 px-1 py-0.2">
                            {criticality.timeToT0 > 0 ? `T -${criticality.timeToT0}m` : 'SCADUTO'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`font-black tabular-nums ${isCritical ? 'text-red-300' : 'text-white'}`}>
                          SLOT #{actor.slotNumber} · {actor.badgeCode}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 font-black uppercase text-[9px] ${
                            isCritical
                              ? 'bg-red-600 text-white animate-pulse'
                              : isAmp
                              ? 'bg-amber-500 text-black'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                          }`}
                        >
                          {actor.physicalStatus}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">{actor.name}</div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        Taglia {actor.clothingSize} · {pairedArtist?.badgeCode} ({pairedArtist?.name})
                      </div>

                      {/* Compact 5-Stage Progress Status Selector inside the 8-Actor Top Bar */}
                      <ActorProgressStatusControl
                        compact
                        isEn={isEn}
                        status={actor.progressStatus || 'STANDBY'}
                        updatedAt={actor.progressUpdatedAt}
                        updatedBy={actor.progressUpdatedBy}
                        onSelectStatus={(nextStatus) => {
                          updateActorProgressStatus(actor.id, nextStatus, {
                            updatedBy: pairedArtist
                              ? `${pairedArtist.badgeCode} • ${pairedArtist.name}`
                              : undefined,
                          });
                          const meta = ACTOR_PROGRESS_META[nextStatus];
                          setRadioSentBanner(
                            nextStatus === 'PRONTO_T0'
                              ? `🟢 ${actor.badgeCode} (${actor.name}) impostato su PRONTO T0 da ${pairedArtist?.badgeCode}: Checklist sincronizzata e avviso inviato a Regia CH-3!`
                              : `Stato avanzamento di ${actor.badgeCode} (${actor.name}) aggiornato a: ${meta.labelIt}`
                          );
                          setTimeout(() => setRadioSentBanner(null), 4000);
                        }}
                      />
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Standard 3-Step Pre-Scenario Protocol Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRE_SCENARIO_STEPS.map((step, index) => (
              <div
                key={index}
                className="bg-neutral-900 border border-neutral-800 p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] text-pink-300 font-bold tabular-nums">
                  <span>{step.timeOffset}</span>
                  <span className="text-neutral-500">FASE 0{index + 1}/03</span>
                </div>
                <h3 className="text-xs font-black text-white">
                  {isEn ? step.labelEn : step.labelIt}
                </h3>
                <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                  {isEn ? step.detailEn : step.detailIt}
                </p>
              </div>
            ))}
          </div>

          {/* MAIN PRE-SCENARIO PREPARATION TIMELINE BLOCKS (1–4) */}
          <div className="space-y-8">
            {visibleBlocks.map((blockMeta) => {
              const blockPatients = dayPatients.filter((p) =>
                blockMeta.patientIds.includes(p.id)
              );
              const readyInBlock = blockPatients.filter(
                (p) => p.techChecklist?.preDone
              ).length;
              const allBlockReady = readyInBlock === blockPatients.length;
              const t0Time = blockMeta.tcccWindow.split('-')[0].trim();

              return (
                <section
                  key={`trucco-block-${blockMeta.day}-${blockMeta.blockNumber}`}
                  className="bg-neutral-950 border border-pink-600/50 overflow-hidden"
                >
                  {/* Pre-Scenario Window Header */}
                  <div className="bg-neutral-900 border-b border-pink-500/60 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="px-2.5 py-0.5 bg-pink-600 text-white font-black uppercase tabular-nums">
                          FINESTRA PREP PRE-BLOCCO {blockMeta.blockNumber} • {blockMeta.truccoPrepWindow}
                        </span>
                        <span className="px-2.5 py-0.5 bg-amber-500 text-black font-black uppercase tabular-nums">
                          PRE-ALLERTA TCCC (-15m): {blockMeta.preAlertTcccWindow}
                        </span>
                        <span className="px-2.5 py-0.5 bg-orange-600 text-black font-black uppercase tabular-nums">
                          TARGET T0 SCENARIO: ORE {t0Time}
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 flex-wrap pt-1">
                        <span>
                          Allestimento Trucco & Coppie Truccatore-Attore • Pazienti #{blockMeta.patientIds.join(', #')}
                        </span>
                        <span className="text-xs font-normal text-pink-300">
                          (Ingaggio TCCC: Gruppo {GROUP_NAMES[blockMeta.tcccGroup]} ➔ Handover{' '}
                          {blockMeta.handoverTime} ➔ Shock Room: Gruppo {GROUP_NAMES[blockMeta.srGroup]})
                        </span>
                      </h2>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div
                        className={`px-3 py-1.5 border text-xs font-black uppercase flex items-center gap-1.5 tabular-nums ${
                          allBlockReady
                            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                            : 'bg-neutral-950 border-pink-500 text-pink-300'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          Stato Blocco {blockMeta.blockNumber}: {readyInBlock}/3 Pronti
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMarkEntireBlockReady(blockMeta)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <Radio className="w-4 h-4" />
                        <span>Conferma Blocco {blockMeta.blockNumber} Pronto T0 (CH-3)</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Sub-Phase Time Breakdown inside this 45-min Pre-Scenario Window */}
                  <div className="bg-neutral-900/70 border-b border-neutral-800 px-4 py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-pink-300 font-bold">01. Base Trucco & Silicone:</span>
                      <span className="text-neutral-300">Primi 15 min in Lab Moulage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-300 font-bold">02. Protesi & Linee Sangue:</span>
                      <span className="text-neutral-300">Raccordo pompe e REBOA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-300 font-bold tabular-nums">
                        03. Posizionamento ({blockMeta.preAlertTcccWindow}):
                      </span>
                      <span className="text-neutral-300 tabular-nums">
                        Ingresso Amb. Tattico 1–3 per T0 ({t0Time})
                      </span>
                    </div>
                  </div>

                  {/* 3 Parallel Patient Preparation Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
                    {blockPatients.map((patient) => {
                      const stationIdx = getStationIndexForPatientId(patient.id);
                      const tcccTeam = getTeamInfo(patient.teamExtraAssigned);
                      const srTeam = getTeamInfo(patient.teamIntraAssigned);
                      const linkedProtesi = getPatientProtesi(patient.id);
                      const isPreDone = Boolean(patient.techChecklist?.preDone);

                      const assignedActor = getActorById(patient.assignedActorId);
                      const assignedArtist = getMakeupArtistById(patient.assignedMakeupArtistId);
                      const isActorAmputee = assignedActor?.physicalStatus === 'AMPUTATO';

                      const scenarioNeedsAmputee = `${patient.lesioni.join(' ')} ${patient.moulageProtesi}`
                        .toLowerCase()
                        .match(/amputa|moncone/);

                      const isActorDuplicatedInBlock = blockPatients.some(
                        (other) =>
                          other.id !== patient.id &&
                          other.assignedActorId === patient.assignedActorId
                      );

                      const hasAllergyNote =
                        assignedActor?.makeupAllergies &&
                        !assignedActor.makeupAllergies.toLowerCase().includes('nessuna allergia');

                      const currentProgressStatus =
                        patient.actorProgressStatus ||
                        assignedActor?.progressStatus ||
                        (isPreDone ? 'PRONTO_T0' : 'IN_PREPARAZIONE');
                      const currentProgressMeta =
                        ACTOR_PROGRESS_META[currentProgressStatus] ||
                        ACTOR_PROGRESS_META.IN_PREPARAZIONE;

                      const criticality = assignedActor
                        ? checkActorCriticality(
                            assignedActor.badgeCode,
                            selectedDay,
                            currentCourseMinutes,
                            currentProgressStatus,
                            isPreDone
                          )
                        : { isCritical: false, timeToT0: 999 };
                      const isCritical = criticality.isCritical;

                      return (
                        <div
                          key={patient.id}
                          className={`p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-colors border ${
                            isCritical
                              ? 'bg-red-950/40 border-2 border-red-500 ring-2 ring-red-500 shadow-xl shadow-red-600/30'
                              : isPreDone
                              ? 'bg-emerald-950/10 border-neutral-800'
                              : 'bg-neutral-950 border-neutral-800'
                          }`}
                        >
                          {/* Priority Warning Banner if in prep and T0 < 10 min */}
                          {isCritical && (
                            <div className="p-2 bg-red-950 border border-red-500 text-red-100 text-xs font-black flex items-center justify-between animate-pulse">
                              <div className="flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                <span>⚠️ ALLERTA T0 &lt; 10 MIN • IN PREPARAZIONE</span>
                              </div>
                              <span className="tabular-nums font-mono text-white bg-red-600 px-1.5 py-0.2 text-[10px]">
                                {criticality.timeToT0 > 0 ? `T -${criticality.timeToT0}m` : 'SCADUTO'}
                              </span>
                            </div>
                          )}

                          <div className="space-y-3.5">
                            {/* Patient & Station Header */}
                            <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 bg-pink-600 text-white font-black text-xs tabular-nums">
                                  PAZIENTE #{patient.id}
                                </span>
                                <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-orange-300 font-bold text-xs">
                                  Postazione {stationIdx} (Amb. Tattico {stationIdx})
                                </span>
                              </div>

                              <span
                                className={`px-2 py-0.5 text-[10px] font-black uppercase border flex items-center gap-1 tabular-nums ${currentProgressMeta.badgeClass}`}
                              >
                                {getStatusIcon(currentProgressStatus, 'w-3 h-3')}
                                <span>
                                  {isEn
                                    ? currentProgressMeta.shortEn
                                    : currentProgressMeta.shortIt}
                                </span>
                              </span>
                            </div>

                            {/* Scenario & Team Pair Info */}
                            <div className="bg-neutral-900 border border-neutral-800 p-2.5 space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-orange-400 font-black">
                                  {patient.scenarioCode}
                                </span>
                                <span className="text-pink-300 font-bold">
                                  {patient.attoriCount}{' '}
                                  {patient.attoriCount > 1 ? 'Figuranti' : 'Figurante'}
                                </span>
                              </div>
                              <div className="text-white font-bold leading-snug">
                                {patient.lesioni.join(' • ')}
                              </div>
                              <div className="pt-1 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                                <span>
                                  TCCC:{' '}
                                  <strong className="text-orange-300">{tcccTeam.teamName}</strong>
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />
                                <span>
                                  SR: <strong className="text-cyan-300">{srTeam.teamName}</strong>
                                </span>
                                <span>
                                  Tech:{' '}
                                  <strong className="text-pink-300">{tcccTeam.techCode}</strong>
                                </span>
                              </div>
                            </div>

                            {/* =========================================================
                                NEW: ASSOCIAZIONE OPERATIVA TRUCCATORE ↔ ATTORE (8 SLOT)
                            ========================================================== */}
                            <div
                              className={`border p-3 space-y-2.5 text-xs ${
                                isActorAmputee
                                  ? 'bg-amber-950/15 border-amber-500/60'
                                  : 'bg-pink-950/15 border-pink-700/60'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
                                <div className="text-[10px] font-black uppercase text-pink-300 flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-pink-400" />
                                  <span>Associazione Truccatore ↔ Attore (Slot 1–8)</span>
                                </div>

                                <span
                                  className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                                    isActorAmputee
                                      ? 'bg-amber-500 text-black border-amber-300'
                                      : 'bg-cyan-950 text-cyan-200 border-cyan-500'
                                  }`}
                                >
                                  {assignedActor?.badgeCode}: {assignedActor?.physicalStatus}
                                </span>
                              </div>

                              {/* Actor Selector (Slot 1-8) */}
                              <div className="space-y-1">
                                <label className="text-[10px] text-neutral-400 uppercase font-bold flex items-center justify-between">
                                  <span>Attore Assegnato (8 Slot Principali):</span>
                                  {scenarioNeedsAmputee && (
                                    <span className="text-amber-300">
                                      ★ Richiede Moncone / Amputato
                                    </span>
                                  )}
                                </label>
                                <select
                                  value={patient.assignedActorId || assignedActor?.id}
                                  onChange={(e) => {
                                    const nextActor = getActorById(e.target.value);
                                    assignTruccoToPatient(
                                      patient.id,
                                      e.target.value,
                                      nextActor?.assignedMakeupArtistId
                                    );
                                  }}
                                  className="w-full bg-neutral-950 border border-neutral-700 text-white text-xs p-2 font-mono focus:outline-none focus:border-pink-500"
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
                              </div>

                              {/* Actor Anatomical Details, Clothing Size & Allergy Alert */}
                              {assignedActor && (
                                <div className="bg-neutral-950 border border-neutral-800 p-2.5 space-y-1.5 font-sans text-[11px]">
                                  <div className="flex items-center justify-between font-mono text-[11px]">
                                    <span className="text-neutral-300 flex items-center gap-1">
                                      <Shirt className="w-3 h-3 text-pink-400" />
                                      <span>
                                        Taglia Vestiario:{' '}
                                        <strong className="text-white">
                                          {assignedActor.clothingSize}
                                        </strong>
                                      </span>
                                    </span>
                                    <span className="text-neutral-400 tabular-nums flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-neutral-500" />
                                      <span>{assignedActor.phone}</span>
                                    </span>
                                  </div>

                                  <div
                                    className={
                                      isActorAmputee
                                        ? 'text-amber-200 font-semibold leading-snug'
                                        : 'text-neutral-300 leading-snug'
                                    }
                                  >
                                    {assignedActor.amputationDetails}
                                  </div>

                                  <div
                                    className={`pt-1 border-t border-neutral-800 flex items-start gap-1.5 ${
                                      hasAllergyNote ? 'text-red-300 font-semibold' : 'text-neutral-400'
                                    }`}
                                  >
                                    <ShieldAlert
                                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                        hasAllergyNote ? 'text-red-400' : 'text-emerald-400'
                                      }`}
                                    />
                                    <span>
                                      <strong>Allergie Trucco:</strong> {assignedActor.makeupAllergies}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Makeup Artist Selector (Paired or Overridden for this scenario) */}
                              <div className="space-y-1 pt-1">
                                <label className="text-[10px] text-pink-300 uppercase font-bold flex items-center justify-between">
                                  <span>Truccatore Associato all&apos;Attore:</span>
                                  <span className="text-neutral-400 tabular-nums">
                                    {assignedArtist?.badgeCode}
                                  </span>
                                </label>
                                <select
                                  value={patient.assignedMakeupArtistId || assignedArtist?.id}
                                  onChange={(e) => {
                                    assignTruccoToPatient(
                                      patient.id,
                                      patient.assignedActorId || assignedActor.id,
                                      e.target.value
                                    );
                                  }}
                                  className="w-full bg-neutral-950 border border-pink-500/60 text-white text-xs p-2 font-mono focus:outline-none focus:border-pink-400"
                                >
                                  {makeupArtists.map((art) => (
                                    <option key={art.id} value={art.id}>
                                      {art.badgeCode} • {art.name} ({art.role.split('&')[0].trim()})
                                    </option>
                                  ))}
                                </select>
                                {assignedArtist && (
                                  <div className="text-[11px] text-neutral-400 font-sans flex items-center justify-between pt-0.5">
                                    <span className="truncate">{assignedArtist.specialty}</span>
                                    <div className="flex items-center gap-2 shrink-0 ml-2 font-mono text-[10px]">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFocusedArtistId(assignedArtist.id);
                                          setActiveViewMode('personal_timeline');
                                        }}
                                        className="text-emerald-400 hover:underline cursor-pointer font-bold"
                                      >
                                        Timeline {assignedArtist.badgeCode} →
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setActiveViewMode('attori')}
                                        className="text-amber-400 hover:underline cursor-pointer"
                                      >
                                        Attori →
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setActiveViewMode('truccatori')}
                                        className="text-pink-400 hover:underline cursor-pointer"
                                      >
                                        Truccatori →
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                                {/* 5-Stage Interactive Progress Status for this Actor / Scenario */}
                                {assignedActor && (
                                  <ActorProgressStatusControl
                                    status={currentProgressStatus}
                                    updatedAt={
                                      patient.actorProgressUpdatedAt ||
                                      assignedActor.progressUpdatedAt
                                    }
                                    updatedBy={
                                      patient.actorProgressUpdatedBy ||
                                      assignedActor.progressUpdatedBy
                                    }
                                    isEn={isEn}
                                    onSelectStatus={(nextStatus) => {
                                      updateActorProgressStatus(assignedActor.id, nextStatus, {
                                        patientId: patient.id,
                                        updatedBy: assignedArtist
                                          ? `${assignedArtist.badgeCode} • ${assignedArtist.name}`
                                          : undefined,
                                      });
                                      const meta = ACTOR_PROGRESS_META[nextStatus];
                                      setRadioSentBanner(
                                        nextStatus === 'PRONTO_T0'
                                          ? `🟢 Paziente #${patient.id} (${assignedActor.badgeCode} • ${assignedActor.name}) impostato su PRONTO T0: Checklist validata e avviso inviato a Regia CH-3!`
                                          : `Paziente #${patient.id} (${assignedActor.badgeCode}): stato avanzamento aggiornato a ${meta.labelIt}`
                                      );
                                      setTimeout(() => setRadioSentBanner(null), 4000);
                                    }}
                                  />
                                )}

                                {/* Conflict Warning if same actor is used twice in this block */}
                                {isActorDuplicatedInBlock && (
                                  <div className="p-2 bg-red-950/70 border border-red-500 text-red-200 text-[11px] flex items-center gap-1.5 font-sans">
                                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                    <span>
                                      Conflitto Slot: <strong>{assignedActor?.badgeCode}</strong> è
                                      assegnato a più postazioni contemporanee nello stesso blocco!
                                    </span>
                                  </div>
                                )}
                              </div>

                            {/* Actor & Moulage Specifications */}
                            <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-1.5 text-xs">
                              <div className="text-[10px] font-black uppercase text-pink-400 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Specifiche Moulage & Simulatori Scenario:</span>
                              </div>
                              <p className="text-neutral-200 font-sans leading-snug">
                                <strong className="text-pink-300">Trucco/Moulage:</strong>{' '}
                                {patient.moulageProtesi}
                              </p>
                              <p className="text-neutral-300 font-sans text-[11px]">
                                <strong className="text-neutral-400">Briefing Figurante:</strong>{' '}
                                {patient.attoreDettagli}
                              </p>
                              <p className="text-neutral-300 font-sans text-[11px]">
                                <strong className="text-neutral-400">Simulatori:</strong>{' '}
                                {patient.simulatori}
                              </p>
                            </div>

                            {/* Prosthetics from Catalog to Mount */}
                            <div className="bg-neutral-900 border border-cyan-800/50 p-3 space-y-2">
                              <span className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5" />
                                <span>
                                  Protesi dal Catalogo da Montare ({linkedProtesi.length}):
                                </span>
                              </span>

                              <div className="space-y-2">
                                {linkedProtesi.map((prot) => (
                                  <div
                                    key={prot.id}
                                    className="p-2 bg-neutral-950 border border-neutral-800 space-y-1 text-[11px]"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-cyan-300 font-black">{prot.code}</span>
                                      <span className="text-[10px] text-amber-300">
                                        {prot.leadTechnician}
                                      </span>
                                    </div>
                                    <div className="text-white font-bold leading-tight">
                                      {prot.name}
                                    </div>
                                    <div className="text-[10px] text-neutral-400 font-sans">
                                      Consumabili: {prot.consumables.slice(0, 2).join(', ')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Tech Notes */}
                            {patient.techNotes && (
                              <div className="p-2.5 bg-neutral-900 border border-amber-500/40 text-[11px] text-amber-200 font-sans">
                                <strong className="font-mono uppercase text-[10px] text-amber-400 block">
                                  Nota Tecnica Pre-Scenario:
                                </strong>
                                {patient.techNotes}
                              </div>
                            )}
                          </div>

                          {/* Validation Button */}
                          <div className="pt-2 border-t border-neutral-800">
                            <button
                              type="button"
                              onClick={() => {
                                const nextReady = !isPreDone;
                                updateTechChecklist(patient.id, 'preDone', nextReady);
                                if (assignedActor) {
                                  updateActorProgressStatus(
                                    assignedActor.id,
                                    nextReady ? 'PRONTO_T0' : 'IN_PREPARAZIONE',
                                    {
                                      patientId: patient.id,
                                      updatedBy: assignedArtist
                                        ? `${assignedArtist.badgeCode} • ${assignedArtist.name}`
                                        : undefined,
                                    }
                                  );
                                }
                              }}
                              className={`w-full py-2.5 px-3 font-black text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                isPreDone
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-black border-emerald-300'
                                  : 'bg-pink-600 hover:bg-pink-500 text-white border-pink-400'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>
                                {isPreDone
                                  ? `✓ PZ #${patient.id} (${assignedActor?.badgeCode} + ${assignedArtist?.badgeCode}) PRONTO T0`
                                  : `CONFERMA TRUCCO & PROTESI PRONTI (PZ #${patient.id})`}
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
