import React, { useState, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  Flame,
  HardHat,
  Heart,
  HeartPulse,
  Layers,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Radio,
  Search,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  User,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { SimulatorPatient, Technician, GroupType } from '../../types';
import { TecniciScenariChronologicalView } from './TecniciScenariChronologicalView';

export interface CourseTimelineBlock {
  blockNumber: 1 | 2 | 3 | 4;
  day: 2 | 3;
  period: 'mattina' | 'pomeriggio';
  title: string;
  subtitle: string;
  timeRangeTotal: string;
  timeTCCC: string;
  timeHandover: string;
  timeShockRoom: string;
  timeReset: string;
  groupExtra: GroupType;
  groupIntra: GroupType;
  partnerHandoverNote: string;
  patientIds: number[];
}

export const COURSE_TIMELINE_BLOCKS: CourseTimelineBlock[] = [
  // DAY 2
  {
    blockNumber: 1,
    day: 2,
    period: 'mattina',
    title: 'BLOCCO 1 • Ingaggio TCCC, Handover SBAR & Shock Room',
    subtitle: 'Fase TCCC (09:00–09:30) ➔ Handover 1:1 barellato (:30–:35) ➔ Shock Room (09:35–10:05)',
    timeRangeTotal: '09:00 - 10:20',
    timeTCCC: '09:00 - 09:30',
    timeHandover: '09:30 - 09:35',
    timeShockRoom: '09:35 - 10:05',
    timeReset: '10:20 - 10:35',
    groupExtra: 'A',
    groupIntra: 'C',
    partnerHandoverNote: 'Gruppo ALPHA (TCCC) ➔ Consegna SBAR a Gruppo CHARLIE (Shock Room)',
    patientIds: [1, 2, 3],
  },
  {
    blockNumber: 2,
    day: 2,
    period: 'mattina',
    title: 'BLOCCO 2 • Emostasi da Scoppio, Handover & Shock Room Avanzata',
    subtitle: 'Fase TCCC (11:05–11:35) ➔ Handover 1:1 barellato (:35–:40) ➔ Shock Room (11:40–12:10)',
    timeRangeTotal: '11:05 - 12:25',
    timeTCCC: '11:05 - 11:35',
    timeHandover: '11:35 - 11:40',
    timeShockRoom: '11:40 - 12:10',
    timeReset: '12:25 - 12:40',
    groupExtra: 'D',
    groupIntra: 'B',
    partnerHandoverNote: 'Gruppo DELTA (TCCC) ➔ Consegna SBAR a Gruppo BRAVO (Shock Room)',
    patientIds: [4, 5, 6],
  },
  {
    blockNumber: 3,
    day: 2,
    period: 'pomeriggio',
    title: 'BLOCCO 3 • Lesioni Complesse, Collo Sanguinante & Damage Control',
    subtitle: 'Fase TCCC (14:30–15:00) ➔ Handover 1:1 barellato (:00–:05) ➔ Shock Room (15:05–15:35)',
    timeRangeTotal: '14:30 - 15:50',
    timeTCCC: '14:30 - 15:00',
    timeHandover: '15:00 - 15:05',
    timeShockRoom: '15:05 - 15:35',
    timeReset: '15:50 - 16:05',
    groupExtra: 'B',
    groupIntra: 'A',
    partnerHandoverNote: 'Gruppo BRAVO (TCCC) ➔ Consegna SBAR a Gruppo ALPHA (Shock Room)',
    patientIds: [7, 8, 9],
  },
  {
    blockNumber: 4,
    day: 2,
    period: 'pomeriggio',
    title: 'BLOCCO 4 • Maxiemergenze, Toracotomia di Rianimazione & Reset Serale',
    subtitle: 'Fase TCCC (16:30–17:00) ➔ Handover 1:1 barellato (:00–:05) ➔ Shock Room (17:05–17:35)',
    timeRangeTotal: '16:30 - 17:50',
    timeTCCC: '16:30 - 17:00',
    timeHandover: '17:00 - 17:05',
    timeShockRoom: '17:05 - 17:35',
    timeReset: '17:50 - 18:05',
    groupExtra: 'C',
    groupIntra: 'D',
    partnerHandoverNote: 'Gruppo CHARLIE (TCCC) ➔ Consegna SBAR a Gruppo DELTA (Shock Room)',
    patientIds: [10, 11, 12],
  },
  // DAY 3
  {
    blockNumber: 1,
    day: 3,
    period: 'mattina',
    title: 'BLOCCO 1 • Balistica Passante, Toracostomia & Resuscitative Thoracotomy',
    subtitle: 'Fase TCCC (09:00–09:30) ➔ Handover 1:1 barellato (:30–:35) ➔ Shock Room (09:35–10:05)',
    timeRangeTotal: '09:00 - 10:20',
    timeTCCC: '09:00 - 09:30',
    timeHandover: '09:30 - 09:35',
    timeShockRoom: '09:35 - 10:05',
    timeReset: '10:20 - 10:35',
    groupExtra: 'A',
    groupIntra: 'B',
    partnerHandoverNote: 'Gruppo ALPHA (TCCC) ➔ Consegna SBAR a Gruppo BRAVO (Shock Room)',
    patientIds: [13, 14, 15],
  },
  {
    blockNumber: 2,
    day: 3,
    period: 'mattina',
    title: 'BLOCCO 2 • Pelvi Sfondata, REBOA Zone 1/3 & Packing Pelvico',
    subtitle: 'Fase TCCC (11:05–11:35) ➔ Handover 1:1 barellato (:35–:40) ➔ Shock Room (11:40–12:10)',
    timeRangeTotal: '11:05 - 12:25',
    timeTCCC: '11:05 - 11:35',
    timeHandover: '11:35 - 11:40',
    timeShockRoom: '11:40 - 12:10',
    timeReset: '12:25 - 12:40',
    groupExtra: 'C',
    groupIntra: 'D',
    partnerHandoverNote: 'Gruppo CHARLIE (TCCC) ➔ Consegna SBAR a Gruppo DELTA (Shock Room)',
    patientIds: [16, 17, 18],
  },
  {
    blockNumber: 3,
    day: 3,
    period: 'pomeriggio',
    title: 'BLOCCO 3 • Ustioni Estese a Corazza, Inalazione Fumi & Crico Chirurgica',
    subtitle: 'Fase TCCC (14:30–15:00) ➔ Handover 1:1 barellato (:00–:05) ➔ Shock Room (15:05–15:35)',
    timeRangeTotal: '14:30 - 15:50',
    timeTCCC: '14:30 - 15:00',
    timeHandover: '15:00 - 15:05',
    timeShockRoom: '15:05 - 15:35',
    timeReset: '15:50 - 16:05',
    groupExtra: 'B',
    groupIntra: 'A',
    partnerHandoverNote: 'Gruppo BRAVO (TCCC) ➔ Consegna SBAR a Gruppo ALPHA (Shock Room)',
    patientIds: [19, 20, 21],
  },
  {
    blockNumber: 4,
    day: 3,
    period: 'pomeriggio',
    title: 'BLOCCO 4 • Maxillo-Facciale, Impalamento Addominale & Chiusura Corso',
    subtitle: 'Fase TCCC (16:30–17:00) ➔ Handover 1:1 barellato (:00–:05) ➔ Shock Room (17:05–17:35)',
    timeRangeTotal: '16:30 - 17:50',
    timeTCCC: '16:30 - 17:00',
    timeHandover: '17:00 - 17:05',
    timeShockRoom: '17:05 - 17:35',
    timeReset: '17:50 - 18:05',
    groupExtra: 'D',
    groupIntra: 'C',
    partnerHandoverNote: 'Gruppo DELTA (TCCC) ➔ Consegna SBAR a Gruppo CHARLIE (Shock Room)',
    patientIds: [22, 23, 24],
  },
];

interface TecniciRegistroRisorseViewProps {
  currentTech: Technician;
  onOpenChecklist?: (patient: SimulatorPatient) => void;
  onOpenModal?: (patient: SimulatorPatient) => void;
}

export const TecniciRegistroRisorseView: React.FC<TecniciRegistroRisorseViewProps> = ({
  currentTech,
  onOpenChecklist,
  onOpenModal,
}) => {
  const {
    simulatorPatients,
    updateSimulatorPatient,
    updateTechChecklist,
    technicians,
    teams,
    activeDay,
    sendCourseMessage,
    language,
  } = useCourse();

  const [activeSection, setActiveSection] = useState<'scenari' | 'protesi' | 'simulatori' | 'attori' | 'tecnici'>('scenari');
  const [filterDay, setFilterDay] = useState<'all' | '2' | '3'>('all');
  const [filterStation, setFilterStation] = useState<'all' | 'mine' | 'tccc' | 'shock'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickPingTechId, setQuickPingTechId] = useState<string | null>(null);
  const [quickPingMsg, setQuickPingMsg] = useState('');
  const [pingSuccess, setPingSuccess] = useState<string | null>(null);

  const techNum = parseInt(currentTech.id.replace(/\D/g, '')) || 1;
  const assignedPatientIds = useMemo(() => {
    return activeDay === 2
      ? [((techNum - 1) % 12) + 1, ((techNum - 1 + 3) % 12) + 1]
      : [((techNum - 1) % 12) + 13, ((techNum - 1 + 3) % 12) + 13];
  }, [activeDay, techNum]);

  // Filtered patients according to selected filters
  const filteredPatients = useMemo(() => {
    return simulatorPatients.filter((p) => {
      // Day filter
      if (filterDay === '2' && p.day !== 2) return false;
      if (filterDay === '3' && p.day !== 3) return false;

      // Station / Ownership filter
      if (filterStation === 'mine') {
        const isAssigned = assignedPatientIds.includes(p.id) || p.id % 6 === (techNum % 6);
        if (!isAssigned) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchCode = (p.scenarioCode || '').toLowerCase().includes(q);
        const matchProtesi = (p.moulageProtesi || '').toLowerCase().includes(q);
        const matchSim = (p.simulatori || '').toLowerCase().includes(q);
        const matchAttore = (p.attoreDettagli || '').toLowerCase().includes(q);
        const matchLesioni = (p.lesioni || []).some((l) => l.toLowerCase().includes(q));
        const matchExtra = (p.procedureExtra || []).some((e) => e.toLowerCase().includes(q));
        const matchIntra = (p.procedureIntra || []).some((i) => i.toLowerCase().includes(q));
        if (!matchTitle && !matchCode && !matchProtesi && !matchSim && !matchAttore && !matchLesioni && !matchExtra && !matchIntra) {
          return false;
        }
      }

      return true;
    });
  }, [simulatorPatients, filterDay, filterStation, searchQuery, assignedPatientIds, techNum]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = simulatorPatients.length;
    const ready = simulatorPatients.filter((p) => p.readinessStatus === 'ready').length;
    const critical = simulatorPatients.filter((p) => p.readinessStatus === 'critical').length;
    const preparing = simulatorPatients.filter((p) => p.readinessStatus === 'preparing' || !p.readinessStatus).length;
    const totalActors = simulatorPatients.reduce((acc, p) => acc + (p.attoriCount || 1), 0);
    return { total, ready, critical, preparing, totalActors };
  }, [simulatorPatients]);

  const handleToggleReadiness = (patient: SimulatorPatient) => {
    const nextStatus =
      patient.readinessStatus === 'ready'
        ? 'critical'
        : patient.readinessStatus === 'critical'
        ? 'preparing'
        : 'ready';
    updateSimulatorPatient(patient.id, { readinessStatus: nextStatus });
  };

  const handleSendPing = (tech: Technician) => {
    if (!quickPingMsg.trim()) return;
    sendCourseMessage({
      senderId: currentTech.id,
      senderName: `${currentTech.name} (${currentTech.badgeCode})`,
      senderRole: 'tecnico',
      type: 'warning',
      subject: `[TECNICI] Presidio / Risorse: ${currentTech.badgeCode} -> ${tech.name}`,
      content: quickPingMsg.trim(),
    });
    setPingSuccess(tech.id);
    setQuickPingMsg('');
    setTimeout(() => {
      setPingSuccess(null);
      setQuickPingTechId(null);
    }, 2000);
  };

  const handleExportResources = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      generatedBy: `${currentTech.name} (${currentTech.badgeCode})`,
      stats,
      patients: filteredPatients.map((p) => ({
        id: p.id,
        day: p.day,
        period: p.period,
        scenarioCode: p.scenarioCode,
        groupExtra: p.groupExtraAssigned,
        groupIntra: p.groupIntraAssigned,
        protesiMoulage: p.moulageProtesi,
        simulatori: p.simulatori,
        attoriCount: p.attoriCount,
        attoreDettagli: p.attoreDettagli,
        readiness: p.readinessStatus || 'ready',
        techNotes: p.techNotes,
      })),
      technicians: technicians.map((t) => ({
        badge: t.badgeCode,
        name: t.name,
        specialty: t.specialty,
        stations: t.assignedStations,
        phone: t.phone,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registro_risorse_tecniche_day${activeDay}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div className="space-y-6 font-mono animate-fadeIn">
      {/* 1. Header del Registro Risorse Tecniche */}
      <div className="bg-neutral-900 border-2 border-cyan-500/70 p-5 rounded shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5 text-cyan-400" /> REGISTRO OPERATIVO RISORSE TECNICHE
              </span>
              <span className="text-neutral-400 text-xs font-bold">
                Presidi • Protesi • Manichini • Attori
              </span>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Wrench className="w-5 h-5 text-cyan-400" />
              Gestione Risorse, Biomodelli & Supporto Tecnico
            </h2>
            <p className="text-xs text-neutral-300 max-w-2xl font-normal">
              Registro centralizzato per il monitoraggio in tempo reale di protesi in silicone ad alta fedeltà,
              simulatori hardware, biomodelli biologici, figuranti/attori simulati e presidio delle postazioni.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportResources}
              className="px-3 py-2 bg-neutral-950 hover:bg-neutral-800 text-cyan-300 border border-cyan-700/80 font-mono text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Esporta Registro Risorse in JSON"
            >
              <Download className="w-3.5 h-3.5" /> Esporta Registro
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          <div className="bg-neutral-950 p-3 border border-neutral-800 rounded">
            <span className="text-[10px] text-neutral-400 font-bold uppercase block">Scenari Totali</span>
            <span className="text-lg font-black text-white">{stats.total}</span>
            <span className="text-[10px] text-neutral-500 block">Day 2 (12) + Day 3 (12)</span>
          </div>
          <div className="bg-neutral-950 p-3 border border-emerald-900/60 rounded">
            <span className="text-[10px] text-emerald-400 font-bold uppercase block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Postazioni Pronte
            </span>
            <span className="text-lg font-black text-emerald-300">{stats.ready}</span>
            <span className="text-[10px] text-emerald-500/80 block">Allestite & Verificate</span>
          </div>
          <div className="bg-neutral-950 p-3 border border-yellow-900/60 rounded">
            <span className="text-[10px] text-yellow-400 font-bold uppercase block flex items-center gap-1">
              <Clock className="w-3 h-3" /> In Allestimento
            </span>
            <span className="text-lg font-black text-yellow-300">{stats.preparing}</span>
            <span className="text-[10px] text-yellow-500/80 block">In Turnaround/Reset</span>
          </div>
          <div className="bg-neutral-950 p-3 border border-red-900/60 rounded">
            <span className="text-[10px] text-red-400 font-bold uppercase block flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Criticità / Reset
            </span>
            <span className="text-lg font-black text-red-400">{stats.critical}</span>
            <span className="text-[10px] text-red-500/80 block">Intervento Richiesto</span>
          </div>
          <div className="bg-neutral-950 p-3 border border-amber-900/60 rounded col-span-2 sm:col-span-1">
            <span className="text-[10px] text-amber-400 font-bold uppercase block flex items-center gap-1">
              <Users className="w-3 h-3" /> Attori & Moulage
            </span>
            <span className="text-lg font-black text-amber-300">{stats.totalActors} Attori</span>
            <span className="text-[10px] text-amber-500/80 block">12 Tecnici Operativi</span>
          </div>
        </div>
      </div>

      {/* 2. Filtri e Sezioni */}
      <div className="space-y-3">
        {/* Main Section Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('scenari')}
            className={`p-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer rounded ${
              activeSection === 'scenari'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-900/20'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>1. Scenari (TCCC vs SR) ({filteredPatients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('protesi')}
            className={`p-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer rounded ${
              activeSection === 'protesi'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-900/20'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>2. Protesi & Moulage ({filteredPatients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('simulatori')}
            className={`p-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer rounded ${
              activeSection === 'simulatori'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-900/20'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>3. Hardware & Sim ({filteredPatients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('attori')}
            className={`p-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer rounded ${
              activeSection === 'attori'
                ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-900/20'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>4. Attori ({filteredPatients.reduce((acc, p) => acc + (p.attoriCount || 1), 0)})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('tecnici')}
            className={`p-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer rounded col-span-2 sm:col-span-1`}
          >
            <Radio className="w-4 h-4" />
            <span>5. Squadra Tecnici ({technicians.length})</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-neutral-900 border border-neutral-800 p-3 rounded flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Day & Station Filters */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <span className="text-[10px] text-neutral-400 uppercase font-bold">Giorno:</span>
            <div className="flex items-center bg-neutral-950 border border-neutral-800 p-0.5 rounded">
              <button
                type="button"
                onClick={() => setFilterDay('all')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  filterDay === 'all' ? 'bg-cyan-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Tutti
              </button>
              <button
                type="button"
                onClick={() => setFilterDay('2')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  filterDay === '2' ? 'bg-cyan-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Day 02
              </button>
              <button
                type="button"
                onClick={() => setFilterDay('3')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  filterDay === '3' ? 'bg-cyan-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Day 03
              </button>
            </div>

            <span className="text-[10px] text-neutral-400 uppercase font-bold ml-2">Suddivisione Ambiente:</span>
            <div className="flex items-center bg-neutral-950 border border-neutral-800 p-0.5 rounded flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setFilterStation('all')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  filterStation === 'all' ? 'bg-cyan-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                🔄 Entrambi (TCCC & SR)
              </button>
              <button
                type="button"
                onClick={() => setFilterStation('mine')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  filterStation === 'mine' ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                ★ Miei Scenari
              </button>
              <button
                type="button"
                onClick={() => setFilterStation('tccc')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  filterStation === 'tccc' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                🌲 Solo TCCC (Extra-Osp)
              </button>
              <button
                type="button"
                onClick={() => setFilterStation('shock')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  filterStation === 'shock' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                🏥 Solo Shock Room (Intra-Osp)
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca per lesione, protesi, attore..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 text-neutral-200 pl-8 pr-7 py-1.5 border border-neutral-800 rounded text-xs focus:outline-none focus:border-cyan-500 placeholder:text-neutral-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Sezione 1: SCENARI CLINICI (ALLINEAMENTO CRONOLOGICO TIMELINE DEL CORSO: TCCC ➔ HANDOVER ➔ SHOCK ROOM) */}
      {activeSection === 'scenari' && (
        <TecniciScenariChronologicalView
          filteredPatients={filteredPatients}
          filterDay={filterDay}
          filterStation={filterStation}
          assignedPatientIds={assignedPatientIds}
          techNum={techNum}
          updateSimulatorPatient={updateSimulatorPatient}
          onOpenModal={onOpenModal}
          onOpenChecklist={onOpenChecklist}
        />
      )}

      {/* 4. Sezione 2: PROTESI & MOULAGE */}
      {activeSection === 'protesi' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-3 flex items-center justify-between rounded">
            <span className="text-xs text-neutral-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Registro Protesi in Silicone & Circuiti di Sanguinamento
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">
              Mostrati: <strong>{filteredPatients.length}</strong> scenari
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatients.map((patient) => {
              const isAssignedToCurrentTech = assignedPatientIds.includes(patient.id) || patient.id % 6 === (techNum % 6);
              const readiness = patient.readinessStatus || 'ready';

              return (
                <div
                  key={patient.id}
                  className={`bg-neutral-900 border-2 ${
                    isAssignedToCurrentTech ? 'border-pink-500/80 shadow-pink-950/20' : 'border-neutral-800'
                  } p-4 rounded space-y-3 shadow-lg relative flex flex-col justify-between`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-cyan-500 text-black font-black font-mono text-xs rounded">
                          PZ #{patient.id}
                        </span>
                        <span className="font-black text-white text-sm uppercase">
                          {patient.scenarioCode}
                        </span>
                        {isAssignedToCurrentTech && (
                          <span className="px-1.5 py-0.2 bg-pink-950 text-pink-300 border border-pink-700 text-[9px] font-bold rounded">
                            TUO SCENARIO
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleReadiness(patient)}
                          className={`px-2 py-0.5 text-[10px] font-black uppercase border rounded transition-all cursor-pointer ${
                            readiness === 'ready'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-600 hover:bg-emerald-900'
                              : readiness === 'critical'
                              ? 'bg-red-950 text-red-300 border-red-600 hover:bg-red-900 animate-pulse'
                              : 'bg-yellow-950 text-yellow-300 border-yellow-600 hover:bg-yellow-900'
                          }`}
                          title="Clicca per cambiare stato di prontezza postazione"
                        >
                          {readiness === 'ready' ? '🟢 PRONTO' : readiness === 'critical' ? '🔴 CRITICO' : '🟡 IN CORSO'}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-neutral-300">
                      <span className="font-bold text-neutral-400">Day {patient.day} • {patient.period.toUpperCase()}</span>
                      <span className="mx-2 text-neutral-600">|</span>
                      <span>Extra: <strong className="text-white">Sq.{patient.teamExtraAssigned} (Grp {patient.groupExtraAssigned})</strong></span>
                      <span className="mx-1 text-neutral-600">•</span>
                      <span>Intra: <strong className="text-white">Sq.{patient.teamIntraAssigned} (Grp {patient.groupIntraAssigned})</strong></span>
                    </div>

                    {/* Protesi Silicone */}
                    <div className="bg-neutral-950 p-3 border border-neutral-800 rounded space-y-1.5">
                      <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Protesi in Silicone & Moulage ad Alta Fedeltà:
                      </span>
                      <p className="text-xs text-neutral-200 font-semibold leading-relaxed">
                        {patient.moulageProtesi || 'Protesi traumatologica standard'}
                      </p>
                    </div>

                    {/* Lesioni e Dinamica */}
                    {patient.lesioni && patient.lesioni.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                          Lesioni Simulate:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {patient.lesioni.map((lesione, lIdx) => (
                            <span
                              key={lIdx}
                              className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-300 rounded"
                            >
                              • {lesione}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Note Tecniche */}
                    {patient.techNotes && (
                      <div className="bg-amber-950/20 border border-amber-600/30 p-2.5 rounded text-[11px] text-amber-200">
                        <strong className="text-amber-400 font-bold uppercase block text-[10px]">Note Tecniche / Reset:</strong>
                        {patient.techNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                    {onOpenChecklist && (
                      <button
                        type="button"
                        onClick={() => onOpenChecklist(patient)}
                        className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-pink-400 border border-pink-700/80 font-bold text-[11px] uppercase rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Checklist Reset
                      </button>
                    )}

                    {onOpenModal && (
                      <button
                        type="button"
                        onClick={() => onOpenModal(patient)}
                        className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 font-bold text-[11px] uppercase rounded transition-colors flex items-center gap-1 cursor-pointer ml-auto"
                      >
                        <ClipboardList className="w-3.5 h-3.5" /> Scheda Completa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Sezione 2: MANICHINI & HARDWARE SIMULATIVO */}
      {activeSection === 'simulatori' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-3 flex items-center justify-between rounded">
            <span className="text-xs text-neutral-300 font-bold flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-cyan-400" /> Registro Simulatori Hardware, Biomodelli & Manichini
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">
              Totale registrati: <strong>{filteredPatients.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="bg-neutral-900 border border-neutral-800 p-4 rounded space-y-3 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-cyan-500 text-black font-black font-mono text-xs rounded">
                        SIMULATORE PZ #{patient.id}
                      </span>
                      <span className="font-black text-white text-sm uppercase">
                        {patient.scenarioCode}
                      </span>
                    </div>
                    <span className="text-neutral-400 text-xs font-bold">
                      Day {patient.day} • {patient.period.toUpperCase()}
                    </span>
                  </div>

                  {/* Simulatori Hardware */}
                  <div className="bg-neutral-950 p-3 border border-neutral-800 rounded space-y-1.5">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                      <HardHat className="w-3.5 h-3.5 text-cyan-400" />
                      Dotazione Hardware & Manichino Assegnato:
                    </span>
                    <p className="text-xs text-neutral-200 font-semibold leading-relaxed">
                      {patient.simulatori || 'Simulatore traumatologico avanzato ad alta fedeltà'}
                    </p>
                  </div>

                  {/* Procedure Tecniche Attese */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                      Procedure con Consumabili / Impianti:
                    </span>
                    <div className="space-y-1 font-mono text-[11px]">
                      {patient.procedureExtra && patient.procedureExtra.length > 0 && (
                        <div className="bg-neutral-950 p-2 border border-neutral-800 rounded text-cyan-300">
                          <strong className="text-neutral-400 block text-[10px] uppercase">Extra-Ospedaliero (TCCC):</strong>
                          {patient.procedureExtra.join(' • ')}
                        </div>
                      )}
                      {patient.procedureIntra && patient.procedureIntra.length > 0 && (
                        <div className="bg-neutral-950 p-2 border border-neutral-800 rounded text-emerald-300">
                          <strong className="text-neutral-400 block text-[10px] uppercase">Intra-Ospedaliero (Shock Room):</strong>
                          {patient.procedureIntra.join(' • ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <span>Stato: <strong className="text-white uppercase">{patient.readinessStatus || 'ready'}</strong></span>
                  {onOpenChecklist && (
                    <button
                      type="button"
                      onClick={() => onOpenChecklist(patient)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Verifica Consumabili <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Sezione 3: ATTORI SIMULATI & FIGURANTI */}
      {activeSection === 'attori' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-3 flex items-center justify-between rounded">
            <span className="text-xs text-neutral-300 font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" /> Registro Attori Professionisti & Ruoli Simulati
            </span>
            <span className="text-[11px] text-amber-400 font-mono">
              Totale attori in turno: <strong>{filteredPatients.reduce((acc, p) => acc + (p.attoriCount || 1), 0)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatients.map((patient) => {
              const actorCount = patient.attoriCount || 1;
              return (
                <div
                  key={patient.id}
                  className="bg-neutral-900 border border-neutral-800 p-4 rounded space-y-3 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500 text-black font-black font-mono text-xs rounded">
                          PAZIENTE #{patient.id}
                        </span>
                        <span className="font-black text-white text-sm uppercase">
                          {patient.scenarioCode}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-700 font-bold text-[10px] rounded">
                        {actorCount} {actorCount > 1 ? 'Attori' : 'Attore'}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-300 font-bold">
                      Day {patient.day} • {patient.period.toUpperCase()} • Postazione Paziente #{patient.id}
                    </div>

                    {/* Acting Instructions & Actor Details */}
                    <div className="bg-neutral-950 p-3 border border-neutral-800 rounded space-y-1.5">
                      <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        Ruolo Simulato & Note per gli Attori:
                      </span>
                      <p className="text-xs text-neutral-200 font-semibold leading-relaxed">
                        {patient.attoreDettagli || 'Attore con moulage ferita ad alta fedeltà. Manifesta agitazione, dolore progressivo e dispnea.'}
                      </p>
                    </div>

                    {/* Dinamica delle Lesioni */}
                    {patient.dinamicaDelleLesioni && (
                      <div className="bg-neutral-950 p-2.5 border border-neutral-800 rounded text-xs text-neutral-300 space-y-1">
                        <strong className="text-[10px] text-neutral-400 uppercase block font-bold">Contesto Clinico / Script:</strong>
                        <p className="italic text-neutral-300">{patient.dinamicaDelleLesioni}</p>
                      </div>
                    )}

                    {/* Safety word reminder */}
                    <div className="bg-red-950/30 border border-red-800/40 p-2 rounded text-[10px] text-red-300 flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Parola di Sicurezza Attore: <strong>"ROSSO ARRESTO"</strong> (Interruzione immediata manovra reale dolorosa)</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">Protesi: <strong className="text-white">{patient.moulageProtesi || 'Standard'}</strong></span>
                    {onOpenModal && (
                      <button
                        type="button"
                        onClick={() => onOpenModal(patient)}
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        Scheda Attori <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Sezione 4: SQUADRA TECNICI & ASSEGNAZIONE POSTAZIONI */}
      {activeSection === 'tecnici' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-3 flex items-center justify-between rounded">
            <span className="text-xs text-neutral-300 font-bold flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-400" /> Presidio Tecnico Postazioni • Squadra TECH-01 – TECH-12
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              <strong>{technicians.length}</strong> Tecnici in Turno
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {technicians.map((tech) => {
              const isCurrent = tech.id === currentTech.id;
              const isPinging = quickPingTechId === tech.id;
              const isSuccess = pingSuccess === tech.id;

              return (
                <div
                  key={tech.id}
                  className={`bg-neutral-900 border-2 ${
                    isCurrent ? 'border-pink-500 bg-pink-950/10 shadow-lg shadow-pink-950/30' : 'border-neutral-800'
                  } p-4 rounded space-y-3 flex flex-col justify-between`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-500 text-black font-black font-mono text-xs rounded">
                          {tech.badgeCode}
                        </span>
                        <span className="font-black text-white text-sm">
                          {tech.name}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-pink-950 text-pink-300 border border-pink-700 text-[10px] font-bold rounded">
                          TUO PROFILO
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-mono space-y-1">
                      <div className="text-neutral-300">
                        <span className="text-neutral-400">Specialità:</span> <strong className="text-cyan-300">{tech.specialty}</strong>
                      </div>
                      <div className="text-neutral-300">
                        <span className="text-neutral-400">Contatto:</span> <strong className="text-white">{tech.phone || 'Radio Ch. 4'}</strong>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                        Postazioni di Presidio Assegnate:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {tech.assignedStations && tech.assignedStations.length > 0 ? (
                          tech.assignedStations.map((st, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 text-[10px] text-cyan-300 font-mono rounded"
                            >
                              📍 {st}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-neutral-500">Postazione Tattica / Shock Room</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Ping / Direct Message */}
                  <div className="pt-3 border-t border-neutral-800 space-y-2">
                    {isPinging ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={`Messaggio per ${tech.name}...`}
                          value={quickPingMsg}
                          onChange={(e) => setQuickPingMsg(e.target.value)}
                          className="w-full bg-neutral-950 text-neutral-200 px-2.5 py-1 border border-cyan-500 rounded text-xs focus:outline-none"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setQuickPingTechId(null)}
                            className="px-2 py-1 bg-neutral-800 text-neutral-300 text-[10px] rounded hover:text-white"
                          >
                            Annulla
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendPing(tech)}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase rounded flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Invia
                          </button>
                        </div>
                      </div>
                    ) : isSuccess ? (
                      <div className="p-1.5 bg-emerald-950 border border-emerald-600 text-emerald-300 text-[11px] text-center font-bold rounded">
                        ✓ Messaggio Inviato!
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setQuickPingTechId(tech.id);
                          setQuickPingMsg('');
                        }}
                        className="w-full py-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] font-bold uppercase rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3 text-cyan-400" /> Invia Richiesta Presidi
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
