import React, { useState, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import { SimulatorPatient, CourseDay } from '../../types';
import { DEEPHITTER_ACTORS, DEEPHITTER_MAKEUP_ARTISTS } from '../../data/deephitterTruccoData';
import { getBlockForPatientId } from '../../data/protesiCatalog';
import {
  Users,
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  X,
  Printer,
  ChevronRight,
  UserCheck,
  Stethoscope,
  Maximize2
} from 'lucide-react';

export interface ClinicalProcedureMapping {
  name: string;
  actors: string[];
  totalActors: number;
  category: 'Airway / Cricotomia' | 'Torace & Polmone' | 'Addome & Eviscerato' | 'Pediatrico' | 'Vascolare / Emorragie / REBOA';
  notes?: string;
}

export const DEEPHITTER_12_PROCEDURES: ClinicalProcedureMapping[] = [
  {
    name: "Cricotomia d'urgenza (HAZMAT / Standard)",
    actors: ['JANO', 'MICHELE', 'ELISA F', 'MANUEL', 'ANGELICA'],
    totalActors: 5,
    category: 'Airway / Cricotomia',
    notes: 'Accesso chirurgico su membrana cricotiroidea in ambiente ostile / standard',
  },
  {
    name: 'Decompressione PNX con ago',
    actors: ['MICHELE', 'ELISA F', 'MANUEL'],
    totalActors: 3,
    category: 'Torace & Polmone',
    notes: 'Ago 14G 2° spazio intercostale emiclaveare o 5° spazio antero-ascellare',
  },
  {
    name: 'Gestione eviscerato',
    actors: ['ELISA F'],
    totalActors: 1,
    category: 'Addome & Eviscerato',
    notes: 'Placca enterica idratata, telo sterile e wound packing con garze',
  },
  {
    name: 'Trauma pediatrico (TBI / Gunshot abd)',
    actors: ['MARIO ROSSI'],
    totalActors: 1,
    category: 'Pediatrico',
    notes: 'Broselow, allineamento cervicale, dosaggi volumetrici e supporto respiratorio',
  },
  {
    name: "Amputazione d'arto",
    actors: ['ARON'],
    totalActors: 1,
    category: 'Vascolare / Emorragie / REBOA',
    notes: 'Moncone reale con tourniquet a getto e controllo dell’emorragia giunzionale',
  },
  {
    name: 'Frattura pelvica & ferite d\'arma pediatriche',
    actors: ['MARIO ROSSI'],
    totalActors: 1,
    category: 'Pediatrico',
    notes: 'Cintura pelvica pediatrica, stabilizzazione emodinamica e rimpiazzo liquidi',
  },
  {
    name: 'Collo sanguinante',
    actors: ['ELISA DB', 'ELISA F'],
    totalActors: 2,
    category: 'Vascolare / Emorragie / REBOA',
    notes: 'Zona 2 del collo, compressione digitale, wound packing emostatico e airway',
  },
  {
    name: 'Toracostomia',
    actors: ['JANO'],
    totalActors: 1,
    category: 'Torace & Polmone',
    notes: 'Approccio semplice monotorace con forbici e dito in Shock Room',
  },
  {
    name: 'Toracotomia resuscitativa',
    actors: ['MANUEL', 'JANO', 'ELISA DB', 'MICHELE', 'ELISA F'],
    totalActors: 5,
    category: 'Torace & Polmone',
    notes: 'Clamping ilo polmonare, apertura pericardio e massaggio cardiaco interno',
  },
  {
    name: 'REBOA',
    actors: ['TINA', 'ELISA DB', 'ARON', 'ANGELICA'],
    totalActors: 4,
    category: 'Vascolare / Emorragie / REBOA',
    notes: 'Accesso ecoguidato arteria femorale, palloncino Endo-Occlusivo in Zona 1 o Zona 3',
  },
  {
    name: 'Gestione avanzata pediatrica (PED Management)',
    actors: ['MARIO ROSSI'],
    totalActors: 1,
    category: 'Pediatrico',
    notes: 'Valutazione ABCDE pediatrica in Shock Room con parametri dedicati',
  },
  {
    name: 'Drenaggio toracico',
    actors: ['MANUEL', 'TINA'],
    totalActors: 2,
    category: 'Torace & Polmone',
    notes: 'Tubo toracico 28-32 Fr collegato a valvola unidirezionale / pleurevac',
  },
];

interface RegiaMoulageCoordinationProps {
  isOpen?: boolean;
  onClose?: () => void;
  isInlineTab?: boolean;
}

export const RegiaMoulageCoordinationModal: React.FC<RegiaMoulageCoordinationProps> = ({
  isOpen = true,
  onClose,
  isInlineTab = false,
}) => {
  const { simulatorPatients, language, activeDay } = useCourse();
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'matrix' | 'procedures' | 'actors' | 'makeup'>('matrix');
  const [filterDay, setFilterDay] = useState<'ALL' | CourseDay>(activeDay || 2);
  const [filterScenario, setFilterScenario] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actorFilter, setActorFilter] = useState<string>('ALL');

  // Track simulated actor states
  const [actorStatuses, setActorStatuses] = useState<Record<string, 'STANDBY' | 'TRUCCO' | 'PRONTO_T0' | 'IN_SCENARIO' | 'RESET'>>({
    'ARON': 'PRONTO_T0',
    'MARIO ROSSI': 'PRONTO_T0',
    'MANUEL': 'IN_SCENARIO',
    'ELISA DB': 'STANDBY',
    'JANO': 'IN_SCENARIO',
    'MICHELE': 'IN_SCENARIO',
    'ELISA F': 'IN_SCENARIO',
    'ANGELICA': 'STANDBY',
    'TINA': 'TRUCCO',
  });

  const toggleActorStatus = (actorName: string) => {
    setActorStatuses((prev) => {
      const order: ('STANDBY' | 'TRUCCO' | 'PRONTO_T0' | 'IN_SCENARIO' | 'RESET')[] = [
        'STANDBY',
        'TRUCCO',
        'PRONTO_T0',
        'IN_SCENARIO',
        'RESET',
      ];
      const cur = prev[actorName] || 'STANDBY';
      const nextIdx = (order.indexOf(cur) + 1) % order.length;
      return { ...prev, [actorName]: order[nextIdx] };
    });
  };

  const getStatusBadge = (status: 'STANDBY' | 'TRUCCO' | 'PRONTO_T0' | 'IN_SCENARIO' | 'RESET') => {
    switch (status) {
      case 'STANDBY':
        return <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 border border-neutral-600 text-[10px] font-black uppercase">STANDBY</span>;
      case 'TRUCCO':
        return <span className="px-2 py-0.5 bg-pink-950 text-pink-300 border border-pink-500 text-[10px] font-black uppercase animate-pulse">PREP TRUCCO</span>;
      case 'PRONTO_T0':
        return <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500 text-[10px] font-black uppercase">PRONTO T-15'</span>;
      case 'IN_SCENARIO':
        return <span className="px-2 py-0.5 bg-amber-500 text-black border border-amber-300 text-[10px] font-black uppercase shadow-xs">IN AZIONE</span>;
      case 'RESET':
        return <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500 text-[10px] font-black uppercase">RESET / DOCCIA</span>;
    }
  };

  const filteredPatients = useMemo(() => {
    return simulatorPatients.filter((p) => {
      if (filterDay !== 'ALL' && p.day !== filterDay) return false;
      if (filterScenario !== 'ALL' && p.scenarioId !== filterScenario) return false;
      if (actorFilter !== 'ALL' && p.actorNameExtra !== actorFilter && p.actorNameIntra !== actorFilter && p.actorName !== actorFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = p.scenarioCode.toLowerCase().includes(q);
        const matchScenId = (p.scenarioId || '').toLowerCase().includes(q);
        const matchExtraCall = (p.callsignExtra || '').toLowerCase().includes(q);
        const matchIntraCall = (p.callsignIntra || '').toLowerCase().includes(q);
        const matchExtraProc = (p.procedureExtraName || '').toLowerCase().includes(q);
        const matchIntraProc = (p.procedureIntraName || '').toLowerCase().includes(q);
        const matchActorExtra = (p.actorNameExtra || '').toLowerCase().includes(q);
        const matchActorIntra = (p.actorNameIntra || '').toLowerCase().includes(q);
        const matchFaculty = [...(p.facultyExtraNames || []), ...(p.facultyIntraNames || [])].some((f) => f.toLowerCase().includes(q));
        return (
          matchCode ||
          matchScenId ||
          matchExtraCall ||
          matchIntraCall ||
          matchExtraProc ||
          matchIntraProc ||
          matchActorExtra ||
          matchActorIntra ||
          matchFaculty
        );
      }
      return true;
    });
  }, [simulatorPatients, filterDay, filterScenario, actorFilter, searchQuery]);

  // Group patients by scenario (S1..S8)
  const scenariosGrouped = useMemo(() => {
    const map = new Map<string, SimulatorPatient[]>();
    filteredPatients.forEach((p) => {
      const key = p.scenarioId || `S${Math.ceil(p.id / 3)}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries());
  }, [filteredPatients]);

  if (!isOpen && !isInlineTab) return null;

  const content = (
    <div className="space-y-4 font-mono text-xs text-neutral-200">
      {/* Header bar */}
      <div className="bg-neutral-950 border-2 border-pink-500 p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-pink-600 text-white font-mono font-black text-[10px] uppercase tracking-wider">
              DEEPHITTER-VMK1 REV3 HITTER70
            </span>
            <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px]">
              FONTE DI VERITÀ UFFICIALE
            </span>
            <span className="px-2 py-0.5 bg-amber-950 border border-amber-600 text-amber-300 text-[10px]">
              ⏱️ TIMELINE 90' INVARIATA (HANDOVER T+30')
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-pink-400 shrink-0" />
            <span>Pannello Coordinamento Regia, Scenari & Moulage</span>
          </h2>
          <p className="text-xs text-neutral-400 font-sans max-w-3xl">
            Controllo integrato della matrice Scenari S1–S8 (Day 2 e Day 3), coppie TCCC ➔ Shock Room con Handover al min :30, 
            assegnazione dei 9 attori, 6 truccatrici e matrice delle 12 procedure cliniche certificate.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold border border-neutral-700 flex items-center gap-1.5 cursor-pointer uppercase text-xs"
          >
            <Printer className="w-4 h-4 text-neutral-400" />
            <span>Stampa</span>
          </button>
          {!isInlineTab && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Subtab selection */}
      <div className="bg-neutral-900 border border-neutral-800 p-1.5 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
            activeTab === 'matrix'
              ? 'bg-pink-600 text-white border-pink-400 shadow-md'
              : 'bg-neutral-950 text-neutral-400 hover:text-white border-neutral-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matrice Scenari S1–S8 (TCCC ➔ SR)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('procedures')}
          className={`px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
            activeTab === 'procedures'
              ? 'bg-pink-600 text-white border-pink-400 shadow-md'
              : 'bg-neutral-950 text-neutral-400 hover:text-white border-neutral-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>12 Procedure & Attori Certificati</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('actors')}
          className={`px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
            activeTab === 'actors'
              ? 'bg-pink-600 text-white border-pink-400 shadow-md'
              : 'bg-neutral-950 text-neutral-400 hover:text-white border-neutral-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Stato 9 Attori Figuranti</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('makeup')}
          className={`px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
            activeTab === 'makeup'
              ? 'bg-pink-600 text-white border-pink-400 shadow-md'
              : 'bg-neutral-950 text-neutral-400 hover:text-white border-neutral-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Organico 6 Truccatrici (Moulage)</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div>
          <label className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">Filtro Giorno</label>
          <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 border border-neutral-800">
            {(['ALL', 2, 3] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setFilterDay(d)}
                className={`py-1 text-center font-bold text-[11px] uppercase cursor-pointer ${
                  filterDay === d ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {d === 'ALL' ? 'Tutti' : `Day ${d}`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">Scenario Specifico</label>
          <select
            value={filterScenario}
            onChange={(e) => setFilterScenario(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 text-white px-2 py-1.5 text-xs outline-none"
          >
            <option value="ALL">TUTTI GLI SCENARI (S1 – S8)</option>
            <option value="S1">S1 — Day 2 Blocco 1 (Pz 1–3)</option>
            <option value="S2">S2 — Day 2 Blocco 2 (Pz 4–6)</option>
            <option value="S3">S3 — Day 2 Blocco 3 (Pz 7–9)</option>
            <option value="S4">S4 — Day 2 Blocco 4 (Pz 10–12)</option>
            <option value="S5">S5 — Day 3 Blocco 1 (Pz 13–15)</option>
            <option value="S6">S6 — Day 3 Blocco 2 (Pz 16–18)</option>
            <option value="S7">S7 — Day 3 Blocco 3 (Pz 19–21)</option>
            <option value="S8">S8 — Day 3 Blocco 4 (Pz 22–24)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">Filtra per Attore</label>
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 text-white px-2 py-1.5 text-xs outline-none"
          >
            <option value="ALL">TUTTI GLI ATTORI (9)</option>
            {DEEPHITTER_ACTORS.map((act) => (
              <option key={act.id} value={act.name}>
                {act.name} {act.physicalStatus === 'AMPUTATO' ? '(AMPUTATO)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">Cerca Libera</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca callsign, procedura, faculty..."
              className="w-full bg-neutral-950 border border-neutral-700 pl-8 pr-2 py-1.5 text-xs text-white placeholder-neutral-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tab 1: Matrice Scenari S1–S8 */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {scenariosGrouped.map(([scenId, pts]) => {
            const firstPt = pts[0];
            const isDay2 = firstPt.day === 2;
            return (
              <div
                key={scenId}
                className="bg-neutral-950 border-2 border-neutral-800 shadow-xl overflow-hidden"
              >
                {/* Scenario Header */}
                <div className="bg-neutral-900 border-b border-neutral-700 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-1 bg-pink-600 text-white font-black text-sm uppercase">
                      SCENARIO {scenId}
                    </span>
                    <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-700 text-neutral-300 font-bold text-xs">
                      {isDay2 ? 'DAY 2' : 'DAY 3'} • {getBlockForPatientId(firstPt.id).blockTimeRange}
                    </span>
                    <span className="text-neutral-400 text-xs">
                      Pazienti #{pts.map((p) => p.id).join(', #')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-950 border border-red-700 text-red-300 text-[11px] font-bold">
                      🔄 HANDOVER SBAR T+30' (Min :30–:35)
                    </span>
                  </div>
                </div>

                {/* 3 Parallel Patient Lanes for this Scenario */}
                <div className="divide-y divide-neutral-800">
                  {pts.map((p) => {
                    const blockMeta = getBlockForPatientId(p.id);
                    const extraFacStr = (p.facultyExtraNames || []).join(', ');
                    const intraFacStr = (p.facultyIntraNames || []).join(', ');
                    const postazioneIdx = ((p.id - 1) % 3) + 1;

                    return (
                      <div
                        key={p.id}
                        className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center hover:bg-neutral-900/50 transition-colors"
                      >
                        {/* Col 1-3: Patient info & Station */}
                        <div className="lg:col-span-3 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 bg-orange-500 text-black font-black text-xs">
                              PZ #{p.id}
                            </span>
                            <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-orange-300 font-bold text-[11px]">
                              {p.scenarioCode}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              Postazione {postazioneIdx}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white pt-1">
                            {p.lesioni[0] || 'Trauma Tattico / Shock Room'}
                          </div>
                          {p.makeupArtistName && (
                            <div className="text-[10px] text-pink-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-pink-500" />
                              <span>Moulage: <strong>{p.makeupArtistName}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Col 4-7: FASE TCCC (Extra) */}
                        <div className="lg:col-span-4 bg-orange-950/20 border border-orange-700/60 p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="px-1.5 py-0.5 bg-orange-600 text-black font-black text-[10px] uppercase">
                              FASE TCCC (Ambiente {postazioneIdx})
                            </span>
                            <span className="text-[10px] text-orange-300 font-bold">
                              {blockMeta.tcccWindow}
                            </span>
                          </div>

                          <div className="text-xs font-black text-orange-300">
                            {p.procedureExtraName || p.procedureExtra.join(' / ')}
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-[11px] pt-0.5 border-t border-orange-900/40">
                            <div>
                              <span className="text-[9px] uppercase text-neutral-400 block font-bold">Squadra:</span>
                              <strong className="text-white font-mono">
                                {p.callsignExtra || `SQ-${p.teamExtraAssigned}`}
                              </strong>
                              <span className="text-neutral-400 text-[10px] block">
                                (Sq. {p.teamExtraAssigned} - Grp {p.groupExtraAssigned})
                              </span>
                            </div>

                            <div>
                              <span className="text-[9px] uppercase text-neutral-400 block font-bold">Attore Figurante:</span>
                              <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-700 text-pink-300 font-bold inline-block text-[10px]">
                                🎭 {p.actorNameExtra || p.actorName || 'Figurante'}
                              </span>
                            </div>
                          </div>

                          <div className="text-[10px] text-neutral-300 pt-0.5">
                            <span className="text-neutral-500">Faculty TCCC: </span>
                            <strong className="text-amber-300">{extraFacStr || 'Tutor assegnati'}</strong>
                          </div>
                        </div>

                        {/* Col 8: Handover Icon / Divider */}
                        <div className="lg:col-span-1 flex lg:flex-col items-center justify-center py-1 text-center">
                          <div className="px-2 py-1 bg-red-950 border border-red-600 text-red-300 text-[9px] font-black uppercase text-center rounded">
                            <span>T+30'</span>
                            <span className="block text-[8px] font-normal text-red-200">SBAR</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-neutral-500 my-1 hidden lg:block" />
                        </div>

                        {/* Col 9-12: FASE SHOCK ROOM (Intra) */}
                        <div className="lg:col-span-4 bg-cyan-950/20 border border-cyan-700/60 p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="px-1.5 py-0.5 bg-cyan-500 text-black font-black text-[10px] uppercase">
                              FASE SHOCK ROOM (Box {postazioneIdx})
                            </span>
                            <span className="text-[10px] text-cyan-300 font-bold">
                              {blockMeta.srWindow}
                            </span>
                          </div>

                          <div className="text-xs font-black text-cyan-300">
                            {p.procedureIntraName || p.procedureIntra.join(' / ')}
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-[11px] pt-0.5 border-t border-cyan-900/40">
                            <div>
                              <span className="text-[9px] uppercase text-neutral-400 block font-bold">Squadra:</span>
                              <strong className="text-white font-mono">
                                {p.callsignIntra || `SQ-${p.teamIntraAssigned}`}
                              </strong>
                              <span className="text-neutral-400 text-[10px] block">
                                (Sq. {p.teamIntraAssigned} - Grp {p.groupIntraAssigned})
                              </span>
                            </div>

                            <div>
                              <span className="text-[9px] uppercase text-neutral-400 block font-bold">Attore Figurante:</span>
                              <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-700 text-cyan-300 font-bold inline-block text-[10px]">
                                🎭 {p.actorNameIntra || p.actorName || 'Figurante'}
                              </span>
                            </div>
                          </div>

                          <div className="text-[10px] text-neutral-300 pt-0.5">
                            <span className="text-neutral-500">Faculty SR: </span>
                            <strong className="text-amber-300">{intraFacStr || 'Tutor assegnati'}</strong>
                          </div>
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

      {/* Tab 2: 12 Procedure Cliniche & Attori Certificati (Righe 41-53 CSV) */}
      {activeTab === 'procedures' && (
        <div className="space-y-4">
          <div className="bg-neutral-950 border border-neutral-800 p-4">
            <h3 className="text-sm font-black text-white uppercase flex items-center gap-2 mb-1">
              <Stethoscope className="w-4 h-4 text-pink-400" />
              <span>Matrice delle 12 Procedure Didattiche & Attori Associati (DEEPHITTER-VMK1)</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Corrispondenza esatta estratta dalle righe 41–53 della fonte di verità. Ogni procedura indica i soli attori autorizzati e addestrati al moulage e alla manovra invasiva corrispondente.
            </p>
          </div>

          <div className="overflow-x-auto border border-neutral-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-neutral-300 text-[11px] uppercase border-b border-neutral-800">
                  <th className="p-3">#</th>
                  <th className="p-3">Procedura Clinica Formativa</th>
                  <th className="p-3">Categoria Operativa</th>
                  <th className="p-3">Attori Coinvolti Certificati</th>
                  <th className="p-3 text-center">Totale Attori</th>
                  <th className="p-3">Note Tecniche & Simulazione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {DEEPHITTER_12_PROCEDURES.map((proc, idx) => (
                  <tr key={idx} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-neutral-500 text-xs">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="p-3 font-bold text-white text-xs">
                      {proc.name}
                    </td>
                    <td className="p-3 text-neutral-400 text-[11px]">
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300">
                        {proc.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {proc.actors.map((act) => (
                          <span
                            key={act}
                            className={`px-2 py-0.5 text-[10px] font-black uppercase ${
                              act === 'ARON'
                                ? 'bg-red-950 text-red-200 border border-red-500'
                                : act === 'MARIO ROSSI'
                                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500'
                                : 'bg-neutral-900 text-pink-300 border border-pink-700/60'
                            }`}
                          >
                            {act}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-700 text-white font-mono font-black text-xs">
                        {proc.totalActors}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-neutral-400 font-sans">
                      {proc.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Stato 9 Attori Figuranti */}
      {activeTab === 'actors' && (
        <div className="space-y-4">
          <div className="bg-neutral-950 border border-neutral-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white uppercase flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-pink-400" />
                <span>Roster Ufficiale dei 9 Attori Figuranti & Stato Operativo Live</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Clicca sul pulsante di stato per alternare lo stato dell'attore (Standby ➔ Prep Trucco ➔ Pronto T-15' ➔ In Azione ➔ Reset).
              </p>
            </div>
            <div className="text-xs text-neutral-400">
              Totale Figuranti: <strong className="text-white">{DEEPHITTER_ACTORS.length}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEEPHITTER_ACTORS.map((act) => {
              const currentStatus = actorStatuses[act.name] || 'STANDBY';
              const assignedProcs = DEEPHITTER_12_PROCEDURES.filter((p) => p.actors.includes(act.name));

              return (
                <div
                  key={act.id}
                  className="bg-neutral-950 border border-neutral-800 p-4 space-y-3 shadow-md hover:border-pink-500/60 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-pink-950 border border-pink-700 text-pink-300 font-mono font-bold text-[10px]">
                        {act.badgeCode}
                      </span>
                      <h4 className="text-sm font-black text-white uppercase">
                        {act.name}
                      </h4>
                    </div>
                    {act.physicalStatus === 'AMPUTATO' ? (
                      <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[9px] uppercase tracking-wider animate-pulse">
                        AMPUTATO REALE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-400 text-[9px] uppercase">
                        FIGURANTE
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="text-neutral-300 font-sans leading-relaxed">
                      {act.amputationDetails || act.notes}
                    </div>

                    <div className="pt-1">
                      <span className="text-[9px] uppercase text-neutral-500 font-bold block">
                        Procedure Associate ({assignedProcs.length}):
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {assignedProcs.map((pr, pidx) => (
                          <span
                            key={pidx}
                            className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300 text-[9px]"
                          >
                            {pr.name.split(' (')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live Status Control */}
                  <div className="border-t border-neutral-800 pt-2.5 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold">Stato Regia:</span>
                    <button
                      type="button"
                      onClick={() => toggleActorStatus(act.name)}
                      className="cursor-pointer transition-transform active:scale-95"
                      title="Clicca per avanzare lo stato dell'attore"
                    >
                      {getStatusBadge(currentStatus)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Organico 6 Truccatrici (Moulage) */}
      {activeTab === 'makeup' && (
        <div className="space-y-4">
          <div className="bg-neutral-950 border border-neutral-800 p-4">
            <h3 className="text-sm font-black text-white uppercase flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Organico Ufficiale 6 Truccatrici & Specialiste Moulage Trauma</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Aggiornamento da fonte di verità (Silvia Castellucci, Asia Proietti, Alessandra Amici, Chiara Colace, Alice Armeni, Raffaella Del Bene).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEEPHITTER_MAKEUP_ARTISTS.map((tr) => (
              <div
                key={tr.id}
                className="bg-neutral-950 border border-neutral-800 p-4 space-y-2.5 shadow-md"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-pink-600 text-white font-mono font-bold text-[10px]">
                      {tr.badgeCode}
                    </span>
                    <h4 className="text-sm font-black text-white uppercase">
                      {tr.name}
                    </h4>
                  </div>
                </div>

                <div className="text-xs text-pink-400 font-bold">
                  {tr.role}
                </div>

                <div className="text-[11px] text-neutral-300 font-sans leading-relaxed">
                  {tr.specialty}
                </div>

                <div className="text-[10px] text-neutral-400 pt-1 border-t border-neutral-800">
                  <span className="text-neutral-500 uppercase font-bold block">Presidio / Postazione:</span>
                  <span className="text-white font-mono">{tr.assignedStation || 'Lab Moulage Centrale'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isInlineTab) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-neutral-950 border-2 border-pink-500 w-full max-w-7xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl">
        {content}
      </div>
    </div>
  );
};
