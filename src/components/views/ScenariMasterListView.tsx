import React, { useState, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import { SimulatorPatient, CourseDay, GroupType, ProtesiItem } from '../../types';
import {
  OPERATIONAL_BLOCKS_BY_DAY,
  getBlockForPatientId,
  getStationIndexForPatientId,
  OperationalBlockMeta,
} from '../../data/protesiCatalog';
import {
  FileText,
  Clock,
  Users,
  Wrench,
  Activity,
  Filter,
  Search,
  ChevronRight,
  Crosshair,
  HeartPulse,
  Droplet,
  Edit3,
  Plus,
  Star,
  CheckCircle2,
  Sparkles,
  Package,
  ArrowRight,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { ScenarioEditorModal } from '../scenari/ScenarioEditorModal';
import { ScenarioStatusBadge } from '../ScenarioStatusBadge';
import { translatePatient } from '../../utils/courseTranslation';

const GROUP_FULL_NAMES: Record<GroupType, string> = {
  A: 'GRUPPO ALPHA',
  B: 'GRUPPO BRAVO',
  C: 'GRUPPO CHARLIE',
  D: 'GRUPPO DELTA',
};

export const ScenariMasterListView: React.FC = () => {
  const {
    simulatorPatients,
    updateTechChecklist,
    technicians,
    faculty,
    teams,
    discenti,
    evaluations,
    protesiCatalog,
    language,
    activeDay,
    setCurrentTab,
  } = useCourse();
  const isEn = language === 'en';

  const [selectedDay, setSelectedDay] = useState<'ALL' | CourseDay>(activeDay || 2);
  const [selectedBlock, setSelectedBlock] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<'ALL' | GroupType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'blocks' | 'table'>('blocks');
  const [selectedModalPatient, setSelectedModalPatient] = useState<SimulatorPatient | null>(null);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const getTeamInfo = (teamId: number) => {
    const team = teams.find((t) => t.id === teamId);
    const fac = faculty.find((f) => f.assignedTeamId === teamId) || faculty[(teamId - 1) % Math.max(1, faculty.length)];
    const tech = technicians[(teamId - 1) % Math.max(1, technicians.length)];
    const teamDiscenti = discenti.filter((d) => d.teamId === teamId);
    const tl = teamDiscenti[0];
    return {
      teamName: team?.name || `SQ-${teamId}`,
      groupId: team?.groupId || 'A',
      facCode: fac?.badgeCode || `FAC-${String(teamId).padStart(2, '0')}`,
      facName: fac?.name || '',
      techCode: tech?.badgeCode || `TECH-${String(teamId).padStart(2, '0')}`,
      techName: tech?.name || '',
      tlBadge: tl?.badgeCode || `DISC-${String((teamId - 1) * 5 + 1).padStart(2, '0')}`,
      tlName: tl?.name || '',
    };
  };

  const getLinkedProtesi = (patientId: number): ProtesiItem[] => {
    return protesiCatalog.filter((item) =>
      item.scenariosUsed?.some((s) => s.patientId === patientId)
    );
  };

  const filteredScenarios = useMemo(() => {
    return simulatorPatients
      .map((p) => translatePatient(p, language))
      .filter((p) => {
        if (selectedDay !== 'ALL' && p.day !== selectedDay) return false;
        const blockMeta = getBlockForPatientId(p.id);
        if (selectedBlock !== 'ALL' && blockMeta.blockNumber !== selectedBlock) return false;
        if (
          selectedGroup !== 'ALL' &&
          p.groupExtraAssigned !== selectedGroup &&
          p.groupIntraAssigned !== selectedGroup
        ) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchCode = p.scenarioCode.toLowerCase().includes(q);
          const matchId = `paziente ${p.id}`.includes(q) || `#${p.id}`.includes(q);
          const matchLesioni = p.lesioni.some((l) => l.toLowerCase().includes(q));
          const matchProc = [...p.procedureExtra, ...p.procedureIntra].some((pr) =>
            pr.toLowerCase().includes(q)
          );
          const matchSim = p.simulatori.toLowerCase().includes(q);
          const matchMoulage = p.moulageProtesi.toLowerCase().includes(q);
          return matchCode || matchId || matchLesioni || matchProc || matchSim || matchMoulage;
        }
        return true;
      });
  }, [simulatorPatients, selectedDay, selectedBlock, selectedGroup, searchQuery, language]);

  const blocksToRender = useMemo(() => {
    const days: CourseDay[] = selectedDay === 'ALL' ? [2, 3] : [selectedDay];
    const result: { blockMeta: OperationalBlockMeta; patients: SimulatorPatient[] }[] = [];

    days.forEach((d) => {
      const dayBlocks = OPERATIONAL_BLOCKS_BY_DAY[d];
      dayBlocks.forEach((b) => {
        if (selectedBlock !== 'ALL' && b.blockNumber !== selectedBlock) return;
        const pts = filteredScenarios.filter((p) => b.patientIds.includes(p.id));
        if (pts.length > 0) {
          result.push({ blockMeta: b, patients: pts });
        }
      });
    });

    return result;
  }, [filteredScenarios, selectedDay, selectedBlock]);

  const totalTruccoReady = useMemo(() => {
    return filteredScenarios.filter((p) => p.techChecklist?.preDone).length;
  }, [filteredScenarios]);

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Top Header Banner */}
      <div className="bg-neutral-900 border-l-4 border-orange-500 p-4 sm:p-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-orange-500 text-black font-mono font-black text-[10px] uppercase tracking-wider">
              {isEn
                ? 'CLINICAL SCENARIOS BY BLOCKS 1–4 • TCCC ➔ SHOCK ROOM PAIRS'
                : 'MENU SCENARI PER BLOCCHI 1–4 • COPPIE TCCC ➔ SHOCK ROOM'}
            </span>
            <span className="text-xs font-mono text-neutral-400">
              •{' '}
              {isEn
                ? '24 Scenarios • Official Mirror Rotations Day 2 & Day 3'
                : '24 Scenari • Rotazioni Speculari Ufficiali Day 2 & Day 3'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-orange-500 shrink-0" />
            <span>
              {isEn
                ? 'Master Scenarios Register (Blocks 1–4, Prosthetics & Makeup Checklist)'
                : 'Registro Scenari per Blocchi 1–4, Protesi & Checklist Trucco'}
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-4xl font-sans">
            {isEn
              ? 'Each operational block coordinates 3 parallel scenarios: 30 min Tactical Engagement (TCCC) with Pre-Alert at T-15m, mandatory 1:1 SBAR Handover at minute :30, and 30 min Advanced Shock Room (ABCDE) with Active Standby at T-15m.'
              : 'Ogni blocco operativo coordina 3 scenari paralleli: 30 min Ingaggio Tattico (TCCC) con Pre-Allerta a T -15m, Handover 1:1 SBAR tassativo al minuto :30 e 30 min Shock Room Avanzata (ABCDE) con Standby Attivo a T -15m.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end xl:self-center">
          {/* Quick status pill for Trucco Checklist */}
          <div className="bg-neutral-950 border border-pink-700/60 px-3 py-1.5 text-right">
            <span className="text-[9px] text-pink-400 uppercase block font-bold">
              {isEn ? 'MAKEUP & PROSTHETICS READY' : 'TRUCCO & PROTESI PRONTI T0'}
            </span>
            <span className="text-sm font-black text-white">
              {totalTruccoReady} / {filteredScenarios.length}{' '}
              <span className="text-[10px] text-pink-300 font-normal">pazienti</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('trucco')}
            className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase text-xs tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg border border-pink-400"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isEn ? 'OPEN MAKEUP TIMELINE' : 'VISUALE TRUCCO & TIMELINE'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('protesi')}
            className="px-3.5 py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-black uppercase text-xs tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border border-cyan-600"
          >
            <Package className="w-4 h-4 text-cyan-400" />
            <span>{isEn ? 'PROSTHETICS MENU' : 'MENU PROTESI'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingPatientId(null);
              setIsEditorOpen(true);
            }}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEn ? 'EDIT / NEW SCENARIO' : 'MODIFICA / NUOVO'}</span>
          </button>
        </div>
      </div>

      {/* Filters & Block Selector Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 space-y-3 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Day Filter */}
          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
              {isEn ? 'Course Day' : 'Giornata Operativa'}
            </label>
            <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 border border-neutral-800">
              {(['ALL', 2, 3] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDay(d)}
                  className={`py-1.5 text-xs font-black uppercase transition-colors cursor-pointer ${
                    selectedDay === d
                      ? 'bg-orange-600 text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {d === 'ALL' ? (isEn ? 'ALL (24)' : 'TUTTI (24)') : `DAY 0${d}`}
                </button>
              ))}
            </div>
          </div>

          {/* Operational Block 1-4 Filter */}
          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
              {isEn ? 'Operational Block (1–4)' : 'Blocco Operativo (1–4)'}
            </label>
            <div className="grid grid-cols-5 gap-1 bg-neutral-950 p-1 border border-neutral-800">
              {(['ALL', 1, 2, 3, 4] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBlock(b)}
                  className={`py-1.5 text-xs font-black uppercase transition-colors cursor-pointer ${
                    selectedBlock === b
                      ? 'bg-orange-600 text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {b === 'ALL' ? (isEn ? 'ALL' : 'TUTTI') : `B${b}`}
                </button>
              ))}
            </div>
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
              {isEn ? 'Filter by Group (TCCC or SR)' : 'Filtra Gruppo (TCCC o SR)'}
            </label>
            <div className="grid grid-cols-5 gap-1 bg-neutral-950 p-1 border border-neutral-800">
              {(['ALL', 'A', 'B', 'C', 'D'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGroup(g)}
                  className={`py-1.5 text-xs font-black uppercase transition-colors cursor-pointer ${
                    selectedGroup === g
                      ? 'bg-orange-600 text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {g === 'ALL' ? (isEn ? 'ALL' : 'TUTTI') : g}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
              {isEn ? 'Search Scenario / Injury / Prosthesis' : 'Cerca Scenario / Lesione / Protesi'}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'e.g. REBOA, CRIC, Scenario 6...' : 'es. REBOA, CRIC, Scenario 6...'}
                className="w-full bg-neutral-950 border border-neutral-800 pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          {/* View Mode Switcher */}
          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
              {isEn ? 'Layout Mode' : 'Modalità Visualizzazione'}
            </label>
            <div className="grid grid-cols-2 gap-1 bg-neutral-950 p-1 border border-neutral-800">
              <button
                type="button"
                onClick={() => setViewMode('blocks')}
                className={`py-1.5 text-xs font-black uppercase transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  viewMode === 'blocks'
                    ? 'bg-orange-600 text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isEn ? 'Blocks 1–4' : 'Blocchi 1–4'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`py-1.5 text-xs font-black uppercase transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  viewMode === 'table'
                    ? 'bg-orange-600 text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isEn ? 'Compact Table' : 'Tabella'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: OPERATIONAL BLOCKS 1–4 WITH TCCC ➔ SHOCK ROOM PAIRS, PROSTHETICS & MAKEUP CHECKLIST */}
      {viewMode === 'blocks' && (
        <div className="space-y-8">
          {blocksToRender.map(({ blockMeta, patients }) => {
            const readyCount = patients.filter((p) => p.techChecklist?.preDone).length;
            return (
              <div
                key={`day-${blockMeta.day}-block-${blockMeta.blockNumber}`}
                className="bg-neutral-950 border-2 border-neutral-800 shadow-2xl overflow-hidden"
              >
                {/* Block Master Banner */}
                <div className="bg-neutral-900 border-b-2 border-orange-500/70 p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-orange-500 text-black font-black text-xs uppercase">
                          DAY 0{blockMeta.day} • BLOCCO {blockMeta.blockNumber}
                        </span>
                        <span className="px-2.5 py-0.5 bg-neutral-950 border border-neutral-700 text-white font-bold text-xs flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-orange-400" />
                          <span>{blockMeta.blockTimeRange}</span>
                        </span>
                        <span className="px-2.5 py-0.5 bg-pink-950/90 border border-pink-600/70 text-pink-300 font-bold text-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-pink-400" />
                          <span>Prep Trucco: {blockMeta.truccoPrepWindow}</span>
                        </span>
                        <span className="px-2.5 py-0.5 bg-amber-950/90 border border-amber-600/70 text-amber-300 font-bold text-xs">
                          ⚠️ Pre-Allerta TCCC (T-15): {blockMeta.preAlertTcccWindow}
                        </span>
                        <span className="px-2.5 py-0.5 bg-cyan-950/90 border border-cyan-600/70 text-cyan-300 font-bold text-xs">
                          🔄 Handover SBAR: {blockMeta.handoverTime}
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight pt-1 flex items-center gap-2 flex-wrap">
                        <span className="text-orange-400">
                          TCCC: {GROUP_FULL_NAMES[blockMeta.tcccGroup]}
                        </span>
                        <ArrowRight className="w-5 h-5 text-neutral-500" />
                        <span className="text-cyan-400">
                          SHOCK ROOM: {GROUP_FULL_NAMES[blockMeta.srGroup]}
                        </span>
                        <span className="text-xs text-neutral-400 font-normal ml-2">
                          (Pazienti #{blockMeta.patientIds.join(', #')})
                        </span>
                      </h2>
                    </div>

                    {/* Parallel Workshops & Block Readiness Summary */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 text-[11px]">
                        <span className="text-neutral-500 block uppercase text-[9px]">
                          {isEn ? 'PARALLEL WORKSHOPS' : 'WORKSHOP PARALLELI NEL BLOCCO'}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          WS1: Grp {blockMeta.ws1Group}
                        </span>
                        <span className="text-neutral-600 mx-1.5">|</span>
                        <span className="text-purple-400 font-bold">
                          WS2: Grp {blockMeta.ws2Group}
                        </span>
                      </div>

                      <div
                        className={`px-3 py-1.5 border text-xs font-black uppercase flex items-center gap-1.5 ${
                          readyCount === patients.length
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-pink-950/80 border-pink-500 text-pink-200'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          Trucco & Protesi: {readyCount}/{patients.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-timeline bar of the 90-minute block */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 pt-2 border-t border-neutral-800 text-[10px]">
                    <div className="bg-pink-950/40 border border-pink-800/60 p-1.5">
                      <span className="text-pink-400 font-black block">PREP TRUCCO</span>
                      <span className="text-neutral-200">{blockMeta.truccoPrepWindow}</span>
                    </div>
                    <div className="bg-amber-950/40 border border-amber-800/60 p-1.5">
                      <span className="text-amber-400 font-black block">PRE-ALERT TCCC (-15m)</span>
                      <span className="text-neutral-200">{blockMeta.preAlertTcccWindow}</span>
                    </div>
                    <div className="bg-orange-950/40 border border-orange-800/60 p-1.5">
                      <span className="text-orange-400 font-black block">SCENARIO TCCC (30m)</span>
                      <span className="text-neutral-200">{blockMeta.tcccWindow}</span>
                    </div>
                    <div className="bg-cyan-950/40 border border-cyan-800/60 p-1.5">
                      <span className="text-cyan-300 font-black block">STANDBY SR (-15m)</span>
                      <span className="text-neutral-200">{blockMeta.preAlertSrWindow}</span>
                    </div>
                    <div className="bg-red-950/50 border border-red-700/70 p-1.5">
                      <span className="text-red-300 font-black block">HANDOVER SBAR (5m)</span>
                      <span className="text-white font-bold">{blockMeta.handoverTime}</span>
                    </div>
                    <div className="bg-blue-950/40 border border-blue-800/60 p-1.5">
                      <span className="text-blue-300 font-black block">SHOCK ROOM (30m)</span>
                      <span className="text-neutral-200">{blockMeta.srWindow}</span>
                    </div>
                  </div>
                </div>

                {/* 3 Parallel Patient Cards inside the Block */}
                <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
                  {patients.map((patient) => {
                    const stationIdx = getStationIndexForPatientId(patient.id);
                    const tcccTeam = getTeamInfo(patient.teamExtraAssigned);
                    const srTeam = getTeamInfo(patient.teamIntraAssigned);
                    const linkedProtesi = getLinkedProtesi(patient.id);
                    const evalExtra = evaluations.find(
                      (e) => e.patientId === patient.id && e.teamId === patient.teamExtraAssigned
                    );
                    const evalIntra = evaluations.find(
                      (e) => e.patientId === patient.id && e.teamId === patient.teamIntraAssigned
                    );

                    return (
                      <div
                        key={patient.id}
                        className="p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:bg-neutral-900/40 transition-colors"
                      >
                        <div className="space-y-3.5">
                          {/* Top Row: Patient ID, Station & Status */}
                          <div className="flex items-center justify-between gap-2 flex-wrap border-b border-neutral-800 pb-2.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 bg-orange-500 text-black font-black text-xs">
                                PAZIENTE #{patient.id}
                              </span>
                              <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-orange-300 font-bold text-xs">
                                {patient.scenarioCode}
                              </span>
                            </div>
                            <ScenarioStatusBadge patient={patient} />
                          </div>

                          {/* Primary Injury & Mechanism */}
                          <div>
                            <div className="text-[10px] font-bold uppercase text-neutral-400 flex items-center justify-between">
                              <span>
                                Amb. Tattico {stationIdx} ➔ Box Shock Room {stationIdx}
                              </span>
                              <span className="text-pink-400">
                                🎭 {patient.attoriCount} {patient.attoriCount > 1 ? 'Attori' : 'Attore'}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-black text-white mt-0.5 leading-snug">
                              {patient.lesioni[0]}
                            </h3>
                            {patient.lesioni.length > 1 && (
                              <ul className="mt-1 space-y-0.5 text-[11px] text-neutral-300 list-disc pl-4">
                                {patient.lesioni.slice(1).map((les, i) => (
                                  <li key={i}>{les}</li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {/* COPPIA TCCC ➔ SHOCK ROOM BOXES */}
                          <div className="grid grid-cols-1 gap-2.5">
                            {/* 1. TCCC EXTRA BOX */}
                            <div className="bg-orange-950/25 border border-orange-700/60 p-3 space-y-1.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="px-1.5 py-0.5 bg-orange-600 text-black font-black text-[10px] uppercase">
                                  1. TCCC • AMB. TATTICO {stationIdx} ({blockMeta.tcccWindow})
                                </span>
                                {evalExtra ? (
                                  <span className="text-[10px] font-black text-emerald-400">
                                    ✓ Valutato
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-amber-400">
                                    Pre-Alert {blockMeta.preAlertTcccWindow}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs pt-0.5">
                                <strong className="text-orange-300">
                                  Sq. {patient.teamExtraAssigned} ({tcccTeam.teamName})
                                </strong>
                                <span className="text-neutral-300 text-[11px]">
                                  TL: <strong className="text-white">{tcccTeam.tlBadge}</strong>
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-orange-900/50 pt-1">
                                <span>
                                  Tutor: <strong className="text-amber-300">{tcccTeam.facCode}</strong>
                                </span>
                                <span>
                                  Tech: <strong className="text-pink-300">{tcccTeam.techCode}</strong>
                                </span>
                              </div>

                              <div className="pt-1">
                                <span className="text-[9px] uppercase text-orange-400/90 font-bold block">
                                  Procedure TCCC Attese:
                                </span>
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  {patient.procedureExtra.map((proc, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.5 bg-neutral-950 border border-orange-800/70 text-orange-200 text-[10px]"
                                    >
                                      {proc}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* 2. SHOCK ROOM INTRA BOX */}
                            <div className="bg-cyan-950/25 border border-cyan-700/60 p-3 space-y-1.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="px-1.5 py-0.5 bg-cyan-500 text-black font-black text-[10px] uppercase">
                                  2. SHOCK ROOM • BOX {stationIdx} ({blockMeta.srWindow})
                                </span>
                                {evalIntra ? (
                                  <span className="text-[10px] font-black text-emerald-400">
                                    ✓ Valutato
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-cyan-300">
                                    Standby {blockMeta.preAlertSrWindow}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs pt-0.5">
                                <strong className="text-cyan-300">
                                  Sq. {patient.teamIntraAssigned} ({srTeam.teamName})
                                </strong>
                                <span className="text-neutral-300 text-[11px]">
                                  TL: <strong className="text-white">{srTeam.tlBadge}</strong>
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-cyan-900/50 pt-1">
                                <span>
                                  Tutor: <strong className="text-amber-300">{srTeam.facCode}</strong>
                                </span>
                                <span>
                                  Tech: <strong className="text-pink-300">{srTeam.techCode}</strong>
                                </span>
                              </div>

                              <div className="pt-1">
                                <span className="text-[9px] uppercase text-cyan-400/90 font-bold block">
                                  Procedure Shock Room Attese:
                                </span>
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  {patient.procedureIntra.map((proc, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.5 bg-neutral-950 border border-cyan-800/70 text-cyan-200 text-[10px]"
                                    >
                                      {proc}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* PROTESI & MOULAGE SECTION */}
                          <div className="bg-neutral-900 border border-pink-800/50 p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-pink-400 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Protesi & Moulage Trucco</span>
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                Prep: {blockMeta.truccoPrepWindow}
                              </span>
                            </div>

                            <p className="text-xs text-neutral-200 font-sans leading-snug">
                              <strong className="text-pink-300">Moulage:</strong> {patient.moulageProtesi}
                            </p>
                            <p className="text-[11px] text-neutral-400 font-sans">
                              <strong className="text-neutral-300">Hardware/Sim:</strong> {patient.simulatori}
                            </p>

                            {linkedProtesi.length > 0 && (
                              <div className="pt-1 border-t border-neutral-800">
                                <span className="text-[9px] text-cyan-400 uppercase font-bold block mb-1">
                                  Dispositivi dal Catalogo Protesi ({linkedProtesi.length}):
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {linkedProtesi.map((prot) => (
                                    <span
                                      key={prot.id}
                                      className="px-2 py-0.5 bg-neutral-950 border border-cyan-700/60 text-cyan-300 text-[10px] font-bold"
                                      title={prot.name}
                                    >
                                      {prot.code}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Interactive Trucco & Tech Checklist */}
                            <div className="pt-2 border-t border-neutral-800 space-y-1.5">
                              <span className="text-[9px] uppercase font-bold text-neutral-400 block">
                                Checklist Operativa Trucco & Postazione:
                              </span>
                              <div className="grid grid-cols-3 gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateTechChecklist(
                                      patient.id,
                                      'preDone',
                                      !patient.techChecklist?.preDone
                                    )
                                  }
                                  className={`py-1.5 px-1.5 text-[10px] font-black uppercase border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                    patient.techChecklist?.preDone
                                      ? 'bg-emerald-600 text-black border-emerald-400'
                                      : 'bg-neutral-950 text-neutral-400 border-neutral-700 hover:border-pink-500 hover:text-pink-300'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                                  <span>1. Trucco T0</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateTechChecklist(
                                      patient.id,
                                      'intraDone',
                                      !patient.techChecklist?.intraDone
                                    )
                                  }
                                  className={`py-1.5 px-1.5 text-[10px] font-black uppercase border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                    patient.techChecklist?.intraDone
                                      ? 'bg-cyan-500 text-black border-cyan-300'
                                      : 'bg-neutral-950 text-neutral-400 border-neutral-700 hover:border-cyan-500 hover:text-cyan-300'
                                  }`}
                                >
                                  <Droplet className="w-3 h-3 shrink-0" />
                                  <span>2. Linee SR</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateTechChecklist(
                                      patient.id,
                                      'postDone',
                                      !patient.techChecklist?.postDone
                                    )
                                  }
                                  className={`py-1.5 px-1.5 text-[10px] font-black uppercase border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                    patient.techChecklist?.postDone
                                      ? 'bg-amber-500 text-black border-amber-300'
                                      : 'bg-neutral-950 text-neutral-400 border-neutral-700 hover:border-amber-500 hover:text-amber-300'
                                  }`}
                                >
                                  <Wrench className="w-3 h-3 shrink-0" />
                                  <span>3. Reset 15m</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
                          <button
                            type="button"
                            onClick={() => setSelectedModalPatient(patient)}
                            className="py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-neutral-700"
                          >
                            <FileText className="w-3.5 h-3.5 text-orange-400" />
                            <span>{isEn ? 'Full Sheet' : 'Scheda Completa'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingPatientId(patient.id);
                              setIsEditorOpen(true);
                            }}
                            className="py-2 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isEn ? 'Edit Scenario' : 'Modifica'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: COMPACT MASTER TABLE */}
      {viewMode === 'table' && (
        <div className="bg-neutral-900 border border-neutral-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-neutral-950 text-neutral-400 text-[11px] font-mono uppercase tracking-wider border-b border-neutral-800">
                <th className="p-3">Paziente & Scenario</th>
                <th className="p-3">Blocco & Finestre Orarie</th>
                <th className="p-3">Coppia TCCC ➔ Shock Room</th>
                <th className="p-3">Protesi & Moulage Trucco</th>
                <th className="p-3">Checklist Trucco/Reset</th>
                <th className="p-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-xs">
              {filteredScenarios.map((patient) => {
                const blockMeta = getBlockForPatientId(patient.id);
                const stationIdx = getStationIndexForPatientId(patient.id);
                const tcccTeam = getTeamInfo(patient.teamExtraAssigned);
                const srTeam = getTeamInfo(patient.teamIntraAssigned);
                const linkedProtesi = getLinkedProtesi(patient.id);

                return (
                  <tr key={patient.id} className="hover:bg-neutral-850/50 transition-colors">
                    <td className="p-3 font-mono">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-orange-600 text-black font-black text-[10px]">
                          PZ #{patient.id}
                        </span>
                        <span className="text-orange-400 font-bold">{patient.scenarioCode}</span>
                      </div>
                      <div className="text-white font-bold text-xs line-clamp-1">
                        {patient.lesioni[0]}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        Amb. Tattico {stationIdx} ➔ Box SR {stationIdx}
                      </div>
                    </td>

                    <td className="p-3 font-mono">
                      <div className="text-orange-400 font-black">
                        DAY 0{patient.day} • BLOCCO {blockMeta.blockNumber} ({blockMeta.blockTimeRange})
                      </div>
                      <div className="text-pink-300 text-[10px]">
                        Prep Trucco: {blockMeta.truccoPrepWindow} | Handover: {blockMeta.handoverTime}
                      </div>
                    </td>

                    <td className="p-3 font-mono space-y-1">
                      <div className="bg-neutral-950 p-1.5 border border-orange-800/50 text-[11px]">
                        <span className="text-orange-400 font-bold">
                          TCCC: {tcccTeam.teamName} (Sq.{patient.teamExtraAssigned})
                        </span>{' '}
                        • <span className="text-neutral-300">{tcccTeam.facCode}</span> •{' '}
                        <span className="text-pink-300">{tcccTeam.techCode}</span>
                      </div>
                      <div className="bg-neutral-950 p-1.5 border border-cyan-800/50 text-[11px]">
                        <span className="text-cyan-400 font-bold">
                          SR: {srTeam.teamName} (Sq.{patient.teamIntraAssigned})
                        </span>{' '}
                        • <span className="text-neutral-300">{srTeam.facCode}</span> •{' '}
                        <span className="text-pink-300">{srTeam.techCode}</span>
                      </div>
                    </td>

                    <td className="p-3 max-w-xs">
                      <div className="text-neutral-200 text-[11px] line-clamp-2 font-sans">
                        {patient.moulageProtesi}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {linkedProtesi.map((pr) => (
                          <span
                            key={pr.id}
                            className="px-1.5 py-0.2 bg-neutral-950 border border-cyan-700/60 text-cyan-300 text-[9px] font-bold"
                          >
                            {pr.code}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateTechChecklist(patient.id, 'preDone', !patient.techChecklist?.preDone)
                          }
                          className={`px-2 py-1 text-[10px] font-black uppercase border cursor-pointer ${
                            patient.techChecklist?.preDone
                              ? 'bg-emerald-600 text-black border-emerald-400'
                              : 'bg-neutral-950 text-neutral-400 border-neutral-700'
                          }`}
                        >
                          Trucco T0
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateTechChecklist(patient.id, 'postDone', !patient.techChecklist?.postDone)
                          }
                          className={`px-2 py-1 text-[10px] font-black uppercase border cursor-pointer ${
                            patient.techChecklist?.postDone
                              ? 'bg-amber-500 text-black border-amber-300'
                              : 'bg-neutral-950 text-neutral-400 border-neutral-700'
                          }`}
                        >
                          Reset
                        </button>
                      </div>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPatientId(patient.id);
                            setIsEditorOpen(true);
                          }}
                          className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-[10px] tracking-wider cursor-pointer"
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedModalPatient(patient)}
                          className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold uppercase text-[10px] tracking-wider cursor-pointer border border-neutral-700"
                        >
                          Scheda
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Scenario Detail Modal */}
      {selectedModalPatient &&
        (() => {
          const modalPatient = translatePatient(selectedModalPatient, language);
          const blockMeta = getBlockForPatientId(modalPatient.id);
          const stationIdx = getStationIndexForPatientId(modalPatient.id);
          const tcccTeam = getTeamInfo(modalPatient.teamExtraAssigned);
          const srTeam = getTeamInfo(modalPatient.teamIntraAssigned);
          const linkedProtesi = getLinkedProtesi(modalPatient.id);

          return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-neutral-900 border-2 border-orange-500/60 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-5 font-mono">
                <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 bg-orange-600 text-black font-black text-xs uppercase">
                        PAZIENTE #{modalPatient.id} • {modalPatient.scenarioCode}
                      </span>
                      <span className="px-2.5 py-1 bg-neutral-950 border border-neutral-700 text-orange-300 font-bold text-xs">
                        DAY 0{modalPatient.day} • BLOCCO {blockMeta.blockNumber} ({blockMeta.blockTimeRange})
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-white mt-2">{modalPatient.lesioni[0]}</h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Postazione {stationIdx}: Ambiente Tattico {stationIdx} ({tcccTeam.teamName}) ➔ Handover{' '}
                      {blockMeta.handoverTime} ➔ Box Shock Room {stationIdx} ({srTeam.teamName})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedModalPatient(null)}
                    className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold flex items-center justify-center cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs text-neutral-300">
                  {modalPatient.dinamicaDelleLesioni && (
                    <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-1.5">
                      <h4 className="text-orange-400 font-black uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Dinamica & Descrizione Scenario
                      </h4>
                      <p className="text-neutral-200 font-sans leading-relaxed">
                        {modalPatient.dinamicaDelleLesioni}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-neutral-950 p-4 border border-orange-800/60 space-y-2">
                      <h4 className="text-orange-400 font-black uppercase">
                        1. Fase TCCC ({blockMeta.tcccWindow}) • {tcccTeam.teamName}
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        TL: <strong className="text-white">{tcccTeam.tlBadge}</strong> | Tutor:{' '}
                        <strong className="text-amber-300">{tcccTeam.facCode}</strong> | Tech:{' '}
                        <strong className="text-pink-300">{tcccTeam.techCode}</strong>
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-neutral-200">
                        {modalPatient.procedureExtra.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-neutral-950 p-4 border border-cyan-800/60 space-y-2">
                      <h4 className="text-cyan-400 font-black uppercase">
                        2. Fase Shock Room ({blockMeta.srWindow}) • {srTeam.teamName}
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        TL: <strong className="text-white">{srTeam.tlBadge}</strong> | Tutor:{' '}
                        <strong className="text-amber-300">{srTeam.facCode}</strong> | Tech:{' '}
                        <strong className="text-pink-300">{srTeam.techCode}</strong>
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-neutral-200">
                        {modalPatient.procedureIntra.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Protesi & Moulage */}
                  <div className="bg-neutral-950 p-4 border border-pink-700/60 space-y-2">
                    <h4 className="text-pink-400 font-black uppercase flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Protesi, Moulage & Finestra Trucco ({blockMeta.truccoPrepWindow})
                    </h4>
                    <p className="text-neutral-200 font-sans">{modalPatient.moulageProtesi}</p>
                    <p className="text-neutral-400">
                      Simulatori: <strong className="text-white">{modalPatient.simulatori}</strong> • Figuranti:{' '}
                      <strong className="text-white">
                        {modalPatient.attoriCount} ({modalPatient.attoreDettagli})
                      </strong>
                    </p>
                    {linkedProtesi.length > 0 && (
                      <div className="pt-2 border-t border-neutral-800 flex flex-wrap gap-1.5">
                        {linkedProtesi.map((prot) => (
                          <span
                            key={prot.id}
                            className="px-2 py-0.5 bg-neutral-900 border border-cyan-600/60 text-cyan-300 text-[11px] font-bold"
                          >
                            {prot.code} • {prot.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const idToEdit = selectedModalPatient.id;
                      setSelectedModalPatient(null);
                      setEditingPatientId(idToEdit);
                      setIsEditorOpen(true);
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Modifica questo Scenario</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedModalPatient(null)}
                    className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold uppercase text-xs tracking-wider cursor-pointer border border-neutral-700"
                  >
                    Chiudi Scheda
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* SCENARIO MASTER EDITOR MODAL */}
      <ScenarioEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPatientId(null);
        }}
        initialPatientId={editingPatientId}
      />
    </div>
  );
};
