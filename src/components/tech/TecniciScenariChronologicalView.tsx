import React from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  ArrowRight,
  Clock,
  HardHat,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ClipboardList,
  Shield,
  HeartPulse,
  MapPin,
} from 'lucide-react';
import { SimulatorPatient } from '../../types';

export interface CourseTimelineBlock {
  blockNumber: number;
  day: number;
  period: 'mattina' | 'pomeriggio';
  title: string;
  timeRangeTotal: string; // Es. "08:30 – 10:00"
  timeTCCC: string;       // Es. "08:30 – 09:00"
  timeHandover: string;   // Es. "09:00" (:30 del blocco)
  timeShockRoom: string;  // Es. "09:05 – 09:35"
  timeReset: string;      // Es. "09:45 – 10:00"
  patientIds: number[];
  groupExtra: 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA';
  groupIntra: 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA';
  partnerHandoverNote: string;
}

export const COURSE_TIMELINE_BLOCKS: CourseTimelineBlock[] = [
  // DAY 2 - BLOCCO 1 (08:30 - 10:00)
  {
    blockNumber: 1,
    day: 2,
    period: 'mattina',
    title: 'Blocco 1 Mattina • TCCC Ingaggio & Shock Room Ingressi',
    timeRangeTotal: '08:30 – 10:00',
    timeTCCC: '08:30 – 09:00 (Min 00–30)',
    timeHandover: '09:00 (Minuto :30)',
    timeShockRoom: '09:05 – 09:35 (Min 35–65)',
    timeReset: '09:45 – 10:00 (Min 75–90)',
    patientIds: [1, 2, 3],
    groupExtra: 'ALPHA',
    groupIntra: 'CHARLIE',
    partnerHandoverNote: 'Handover 1:1 barellato da Gruppo ALPHA (TCCC Extra-Osp) a Gruppo CHARLIE (Shock Room Intra-Osp)',
  },
  // DAY 2 - BLOCCO 2 (10:15 - 11:45)
  {
    blockNumber: 2,
    day: 2,
    period: 'mattina',
    title: 'Blocco 2 Mattina • TCCC Penetrating Trauma & Shock Room FAST/REBOA',
    timeRangeTotal: '10:15 – 11:45',
    timeTCCC: '10:15 – 10:45 (Min 00–30)',
    timeHandover: '10:45 (Minuto :30)',
    timeShockRoom: '10:50 – 11:20 (Min 35–65)',
    timeReset: '11:30 – 11:45 (Min 75–90)',
    patientIds: [4, 5, 6],
    groupExtra: 'DELTA',
    groupIntra: 'BRAVO',
    partnerHandoverNote: 'Handover 1:1 barellato da Gruppo DELTA (TCCC Extra-Osp) a Gruppo BRAVO (Shock Room Intra-Osp)',
  },
  // DAY 2 - BLOCCO 3 (13:30 - 15:00)
  {
    blockNumber: 3,
    day: 2,
    period: 'pomeriggio',
    title: 'Blocco 3 Pomeriggio • TCCC Blast Injury & Shock Room Toracotomia',
    timeRangeTotal: '13:30 – 15:00',
    timeTCCC: '13:30 – 14:00 (Min 00–30)',
    timeHandover: '14:00 (Minuto :30)',
    timeShockRoom: '14:05 – 14:35 (Min 35–65)',
    timeReset: '14:45 – 15:00 (Min 75–90)',
    patientIds: [7, 8, 9],
    groupExtra: 'BRAVO',
    groupIntra: 'DELTA',
    partnerHandoverNote: 'Handover 1:1 barellato da Gruppo BRAVO (TCCC Extra-Osp) a Gruppo DELTA (Shock Room Intra-Osp)',
  },
  // DAY 2 - BLOCCO 4 (15:15 - 16:45)
  {
    blockNumber: 4,
    day: 2,
    period: 'pomeriggio',
    title: 'Blocco 4 Pomeriggio • TCCC Mass Casualty & Shock Room Damage Control',
    timeRangeTotal: '15:15 – 16:45',
    timeTCCC: '15:15 – 15:45 (Min 00–30)',
    timeHandover: '15:45 (Minuto :30)',
    timeShockRoom: '15:50 – 16:20 (Min 35–65)',
    timeReset: '16:30 – 16:45 (Min 75–90)',
    patientIds: [10, 11, 12],
    groupExtra: 'CHARLIE',
    groupIntra: 'ALPHA',
    partnerHandoverNote: 'Handover 1:1 barellato da Gruppo CHARLIE (TCCC Extra-Osp) a Gruppo ALPHA (Shock Room Intra-Osp)',
  },
  // DAY 3 - BLOCCO 1 (08:30 - 10:00)
  {
    blockNumber: 1,
    day: 3,
    period: 'mattina',
    title: 'Blocco 1 Mattina Day 3 • Speculare • Shock Room & TCCC Ad Alto Impatto',
    timeRangeTotal: '08:30 – 10:00',
    timeTCCC: '08:30 – 09:00 (Min 00–30)',
    timeHandover: '09:00 (Minuto :30)',
    timeShockRoom: '09:05 – 09:35 (Min 35–65)',
    timeReset: '09:45 – 10:00 (Min 75–90)',
    patientIds: [13, 14, 15],
    groupExtra: 'BRAVO',
    groupIntra: 'DELTA',
    partnerHandoverNote: 'Handover 1:1 barellato da Gruppo BRAVO (TCCC Extra-Osp) a Gruppo DELTA (Shock Room Intra-Osp)',
  },
  // DAY 3 - BLOCCO 2 (10:15 - 11:45)
  {
    blockNumber: 2,
    day: 3,
    period: 'mattina',
    title: 'Blocco 2 Mattina Day 3 • Speculare • Gestione Avanzata Trauma Toraco-Addominale',
    timeRangeTotal: '10:15 – 11:45',
    timeTCCC: '10:15 – 10:45 (Min 00–30)',
    timeHandover: '10:45 (Minuto :30)',
    timeShockRoom: '10:50 – 11:20 (Min 35–65)',
    timeReset: '11:30 – 11:45 (Min 75–90)',
    patientIds: [16, 17, 18],
    groupExtra: 'CHARLIE',
    groupIntra: 'ALPHA',
    partnerHandoverNote: 'Handover 1:1 barellato da Gruppo CHARLIE (TCCC Extra-Osp) a Gruppo ALPHA (Shock Room Intra-Osp)',
  },
  // DAY 3 - BLOCCO 3 (13:30 - 15:00)
  {
    blockNumber: 3,
    day: 3,
    period: 'pomeriggio',
    title: 'Blocco 3 Pomeriggio Day 3 • Speculare • Amputazioni Traumatiche & Emodinamica',
    timeRangeTotal: '13:30 – 15:00',
    timeTCCC: '13:30 – 14:00 (Min 00–30)',
    timeHandover: '14:00 (Minuto :30)',
    timeShockRoom: '14:05 – 14:35 (Min 35–65)',
    timeReset: '14:45 – 15:00 (Min 75–90)',
    patientIds: [19, 20, 21],
    groupExtra: 'ALPHA',
    groupIntra: 'CHARLIE',
    partnerHandoverNote: 'Handover 1:1 barellato da Gruppo ALPHA (TCCC Extra-Osp) a Gruppo CHARLIE (Shock Room Intra-Osp)',
  },
  // DAY 3 - BLOCCO 4 (15:15 - 16:45)
  {
    blockNumber: 4,
    day: 3,
    period: 'pomeriggio',
    title: 'Blocco 4 Pomeriggio Day 3 • Esercitazione Finale Integrata Full-Scale',
    timeRangeTotal: '15:15 – 16:45',
    timeTCCC: '15:15 – 15:45 (Min 00–30)',
    timeHandover: '15:45 (Minuto :30)',
    timeShockRoom: '15:50 – 16:20 (Min 35–65)',
    timeReset: '16:30 – 16:45 (Min 75–90)',
    patientIds: [22, 23, 24],
    groupExtra: 'DELTA',
    groupIntra: 'BRAVO',
    partnerHandoverNote: 'Handover 1:1 barellato da Gruppo DELTA (TCCC Extra-Osp) a Gruppo BRAVO (Shock Room Intra-Osp)',
  },
];

export const getCourseBlockTitle = (block: CourseTimelineBlock, isEn: boolean): string => {
  if (!isEn) return block.title;
  const titlesEn: Record<string, string> = {
    '2-1': 'Block 1 Morning • TCCC Engagement & Shock Room Entries',
    '2-2': 'Block 2 Morning • TCCC Penetrating Trauma & Shock Room FAST/REBOA',
    '2-3': 'Block 3 Afternoon • TCCC Blast Injury & Shock Room Thoracotomy',
    '2-4': 'Block 4 Afternoon • TCCC Mass Casualty & Shock Room Damage Control',
    '3-1': 'Block 1 Morning Day 3 • Specular • High-Impact Shock Room & TCCC',
    '3-2': 'Block 2 Morning Day 3 • Specular • Advanced Thoraco-Abdominal Trauma Management',
    '3-3': 'Block 3 Afternoon Day 3 • Specular • Traumatic Amputations & Hemodynamics',
    '3-4': 'Block 4 Afternoon Day 3 • Full-Scale Integrated Final Exercise',
  };
  return titlesEn[`${block.day}-${block.blockNumber}`] || block.title;
};

interface TecniciScenariChronologicalViewProps {
  filteredPatients: SimulatorPatient[];
  filterDay: string;
  filterStation: string;
  assignedPatientIds: number[];
  techNum: number;
  updateSimulatorPatient: (id: number, updates: Partial<SimulatorPatient>) => void;
  onOpenModal?: (patient: SimulatorPatient) => void;
  onOpenChecklist?: (patient: SimulatorPatient) => void;
}

export const TecniciScenariChronologicalView: React.FC<TecniciScenariChronologicalViewProps> = ({
  filteredPatients,
  filterDay,
  filterStation,
  assignedPatientIds,
  techNum,
  updateSimulatorPatient,
  onOpenModal,
  onOpenChecklist,
}) => {
  const { language } = useCourse();
  const isEn = language === 'en';

  const visibleBlocks = COURSE_TIMELINE_BLOCKS.filter((block) => {
    if (filterDay === '2' && block.day !== 2) return false;
    if (filterDay === '3' && block.day !== 3) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner generale cronologico */}
      <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <span className="text-xs text-neutral-200 font-black uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> {isEn ? 'Clinical Scenarios Registry • Chronological Course Timeline Alignment' : 'Registro Scenari Clinici • Allineamento Cronologico Timeline del Corso'}
          </span>
          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
            {isEn
              ? 'TCCC (Pre-Hospital) and Shock Room (In-Hospital) scenarios are ordered chronologically block by block and aligned with the 1:1 litter SBAR Handover at minute :30.'
              : 'Gli scenari TCCC (Extra-Ospedaliero) e Shock Room (Intra-Ospedaliero) sono ordinati cronologicamente blocco per blocco e allineati l\'uno dopo l\'altro con l\'Handover barellato 1:1 SBAR al minuto :30.'}
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
          <span className="px-2.5 py-1 bg-neutral-950 text-neutral-300 border border-neutral-800 rounded font-bold">
            {isEn ? 'Total Displayed:' : 'Totale Mostrati:'} <strong className="text-cyan-400">{filteredPatients.length}</strong> {isEn ? 'Patients' : 'Pazienti'}
          </span>
          <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded font-bold flex items-center gap-1">
            {isEn ? '🌲 TCCC Field (00–30\')' : '🌲 TCCC sul Campo (00–30\')'}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400 hidden sm:inline" />
          <span className="px-2.5 py-1 bg-indigo-950/80 text-indigo-300 border border-indigo-800 rounded font-bold flex items-center gap-1">
            {isEn ? '🏥 Shock Room (35–65\')' : '🏥 Shock Room (35–65\')'}
          </span>
        </div>
      </div>

      {/* ITERAZIONE CRONOLOGICA SUI BLOCCHI DEL CORSO */}
      {visibleBlocks.map((block) => {
        // Recupera i pazienti appartenenti a questo blocco
        const blockPatients = block.patientIds
          .map((id) => filteredPatients.find((p) => p.id === id))
          .filter((p): p is SimulatorPatient => Boolean(p));

        if (blockPatients.length === 0) return null;

        return (
          <div
            key={`timeline-block-${block.day}-${block.blockNumber}`}
            className="bg-neutral-950 border border-neutral-800/90 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl"
          >
            {/* HEADER CRONOLOGICO DEL BLOCCO */}
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-1 bg-cyan-500 text-black font-black font-mono text-xs rounded uppercase tracking-wider">
                    DAY 0{block.day} • {isEn ? (block.period === 'mattina' ? 'MORNING' : 'AFTERNOON') : block.period.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-1 bg-neutral-800 text-neutral-200 font-black text-xs rounded uppercase tracking-wider">
                    {isEn ? 'BLOCK' : 'BLOCCO'} {block.blockNumber}
                  </span>
                  <span className="text-white font-black text-sm uppercase tracking-wide">
                    {getCourseBlockTitle(block, isEn)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 bg-neutral-950 text-cyan-400 border border-neutral-800 rounded font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {isEn ? 'Time Window:' : 'Finestra Oraria:'} <strong className="text-white">{block.timeRangeTotal}</strong>
                  </span>
                </div>
              </div>

              {/* BARRA SEQUENZIALE DELLA TIMELINE OPERATIVA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                {/* Step 1: TCCC */}
                <div className="bg-emerald-950/40 border border-emerald-800/80 p-2.5 rounded flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-emerald-900 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase">
                      {isEn ? 'TCCC Pre-Hosp Phase' : 'Fase TCCC Extra-Osp'} ({block.timeTCCC})
                    </div>
                    <div className="text-xs text-emerald-200 font-semibold truncate">
                      {isEn ? 'Tactical Env.' : 'Amb. Tattici'} 1-3 • {isEn ? 'Grp' : 'Grp'} {block.groupExtra}
                    </div>
                  </div>
                </div>

                {/* Step 2: Handover SBAR */}
                <div className="bg-amber-950/40 border border-amber-800/80 p-2.5 rounded flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-amber-900 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] text-amber-400 font-bold uppercase">
                      Handover 1:1 SBAR ({isEn ? block.timeHandover.replace('Minuto', 'Minute') : block.timeHandover})
                    </div>
                    <div className="text-xs text-amber-200 font-semibold truncate">
                      {isEn ? 'Mandatory :30 • Handover 5 min' : 'Tassativo :30 • Consegna 5 min'}
                    </div>
                  </div>
                </div>

                {/* Step 3: Shock Room */}
                <div className="bg-indigo-950/40 border border-indigo-800/80 p-2.5 rounded flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-indigo-900 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] text-indigo-400 font-bold uppercase">
                      {isEn ? 'Shock Room Phase' : 'Fase Shock Room'} ({block.timeShockRoom})
                    </div>
                    <div className="text-xs text-indigo-200 font-semibold truncate">
                      Box 1-3 • {isEn ? 'Grp' : 'Grp'} {block.groupIntra}
                    </div>
                  </div>
                </div>

                {/* Step 4: Reset Tecnico */}
                <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-xs shrink-0">
                    4
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] text-neutral-400 font-bold uppercase">
                      {isEn ? 'Technical Reset' : 'Reset Tecnico'} ({block.timeReset})
                    </div>
                    <div className="text-xs text-neutral-300 font-semibold truncate">
                      {isEn ? 'Turnaround 15 min for 3 Boxes' : 'Turnaround 15 min per 3 Box'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rotazione didattica del blocco */}
              <div className="text-[11px] text-neutral-400 font-mono bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800 flex items-center justify-between flex-wrap gap-2">
                <span>
                  <strong className="text-neutral-300 uppercase">{isEn ? 'Group Rotation:' : 'Rotazione Gruppi:'}</strong>{' '}
                  {isEn
                    ? `1:1 Litter Handover from Group ${block.groupExtra} (Pre-Hospital TCCC) to Group ${block.groupIntra} (In-Hospital Shock Room)`
                    : block.partnerHandoverNote}
                </span>
                <span className="text-cyan-400 font-bold">
                  {blockPatients.length} {isEn ? 'active Scenarios in this Block' : 'Scenari attivi in questo Blocco'}
                </span>
              </div>
            </div>

            {/* SCENARI DEL BLOCCO CON TCCC E SHOCK ROOM ALLINEATI L'UNO DOPO L'ALTRO */}
            <div className="space-y-4">
              {blockPatients.map((patient) => {
                const postazioneNum = ((patient.id - 1) % 3) + 1;
                const isAssignedToCurrentTech = assignedPatientIds.includes(patient.id) || patient.id % 6 === (techNum % 6);
                const readiness = patient.readinessStatus || 'ready';

                return (
                  <div
                    key={`patient-aligned-${patient.id}`}
                    className={`bg-neutral-900 border-2 ${
                      isAssignedToCurrentTech
                        ? 'border-cyan-500/90 shadow-cyan-950/30'
                        : 'border-neutral-800'
                    } rounded-xl overflow-hidden shadow-xl space-y-0`}
                  >
                    {/* 1. TESTATA POSTAZIONE & RISORSE ASSEGNATE */}
                    <div className="p-3.5 sm:p-4 bg-neutral-950 border-b border-neutral-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 bg-cyan-600 text-white font-black font-mono text-xs rounded uppercase">
                            {isEn ? 'STATION' : 'POSTAZIONE'} {postazioneNum}
                          </span>
                          <span className="px-2 py-0.5 bg-neutral-800 text-neutral-200 font-black font-mono text-xs rounded">
                            {isEn ? 'PT' : 'PZ'} #{patient.id}
                          </span>
                          <span className="font-black text-white text-sm uppercase">
                            {patient.scenarioCode}
                          </span>
                          {isAssignedToCurrentTech && (
                            <span className="px-2 py-0.5 bg-pink-950 text-pink-300 border border-pink-700 font-black text-[10px] uppercase rounded">
                              {isEn ? `★ Assigned to You (TECH-0${techNum})` : `★ Assegnato a Te (TECH-0${techNum})`}
                            </span>
                          )}
                        </div>

                        {/* Controlli di stato e azioni rapide */}
                        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto font-mono text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus: Record<string, 'ready' | 'preparing' | 'critical'> = {
                                ready: 'preparing',
                                preparing: 'critical',
                                critical: 'ready',
                              };
                              updateSimulatorPatient(patient.id, { readinessStatus: nextStatus[readiness] || 'ready' });
                            }}
                            className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded border transition-all cursor-pointer flex items-center gap-1 ${
                              readiness === 'ready'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-600 hover:bg-emerald-900'
                                : readiness === 'preparing'
                                ? 'bg-yellow-950 text-yellow-300 border-yellow-600 hover:bg-yellow-900'
                                : 'bg-red-950 text-red-300 border-red-600 hover:bg-red-900'
                            }`}
                          >
                            {readiness === 'ready' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                            {readiness === 'preparing' && <Clock className="w-3 h-3 text-yellow-400" />}
                            {readiness === 'critical' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                            <span>{readiness === 'ready' ? (isEn ? 'READY' : 'PRONTO') : readiness === 'critical' ? (isEn ? 'CRITICAL' : 'CRITICO') : (isEn ? 'PREPARING' : 'IN CORSO')}</span>
                          </button>

                          {onOpenChecklist && (
                            <button
                              type="button"
                              onClick={() => onOpenChecklist(patient)}
                              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-[11px] font-bold rounded transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Wrench className="w-3 h-3 text-cyan-400" /> {isEn ? 'Reset Box' : 'Reset Box'}
                            </button>
                          )}

                          {onOpenModal && (
                            <button
                              type="button"
                              onClick={() => onOpenModal(patient)}
                              className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-[11px] font-bold rounded transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <ClipboardList className="w-3 h-3" /> {isEn ? 'File' : 'Scheda'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dettagli Hardware, Protesi e Attori */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
                        <div className="bg-neutral-900 p-2 border border-neutral-800 rounded">
                          <span className="text-[10px] text-cyan-400 uppercase font-bold flex items-center gap-1">
                            <HardHat className="w-3 h-3" /> {isEn ? 'Simulator / Mannequin:' : 'Simulatore / Manichino:'}
                          </span>
                          <p className="text-neutral-300 truncate mt-0.5">
                            {patient.simulatori || (isEn ? 'Advanced high-fidelity trauma mannequin' : 'Manichino traumatologico avanzato ad alta fedeltà')}
                          </p>
                        </div>

                        <div className="bg-neutral-900 p-2 border border-neutral-800 rounded">
                          <span className="text-[10px] text-pink-400 uppercase font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {isEn ? 'Moulage & Prosthetics:' : 'Moulage & Protesi:'}
                          </span>
                          <p className="text-neutral-300 truncate mt-0.5">
                            {patient.moulageProtesi || (isEn ? 'Silicone trauma prosthetic' : 'Protesi traumatologica in silicone')}
                          </p>
                        </div>

                        <div className="bg-neutral-900 p-2 border border-neutral-800 rounded">
                          <span className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                            <Users className="w-3 h-3" /> {isEn ? 'Role Actors:' : 'Attori Ruolo:'}
                          </span>
                          <p className="text-neutral-300 truncate mt-0.5">
                            {patient.attoriCount} {isEn ? (patient.attoriCount > 1 ? 'actors' : 'actor') : (patient.attoriCount > 1 ? 'attori' : 'attore')} ({patient.attoreDettagli || (isEn ? 'Injured role player actor' : 'Attore simulato ferito')})
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2. LE DUE FASI CLINICHE ALLINEATE L'UNA DOPO L'ALTRA (TCCC ➔ HANDOVER ➔ SHOCK ROOM) */}
                    <div className="p-3.5 sm:p-4 space-y-3">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">
                        {/* FASE 1: TCCC (EXTRA-OSPEDALIERO) */}
                        {(filterStation === 'all' || filterStation === 'tccc' || filterStation === 'mine') && (
                          <div className="bg-emerald-950/20 border-2 border-emerald-800/70 p-3.5 rounded-lg flex flex-col justify-between space-y-3">
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="p-1 bg-emerald-900/80 text-emerald-300 border border-emerald-700 rounded">
                                    <Shield className="w-3.5 h-3.5" />
                                  </span>
                                  <span className="font-black text-emerald-300 text-xs uppercase tracking-wider">
                                    {isEn ? '1. TCCC PHASE (PRE-HOSPITAL)' : '1. FASE TCCC (EXTRA-OSPEDALIERO)'}
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {block.timeTCCC}
                                </span>
                              </div>

                              {/* Setting e Squadra TCCC */}
                              <div className="bg-neutral-950/80 p-2 border border-emerald-900/40 rounded flex items-center justify-between text-xs font-mono">
                                <span className="text-neutral-400 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {isEn ? 'Tactical Env.' : 'Ambiente Tattico'} {postazioneNum}:
                                </span>
                                <span className="text-emerald-300 font-black">
                                  {isEn ? 'Team' : 'Squadra'} {patient.teamExtraAssigned || ((patient.id - 1) % 12) + 1} ({isEn ? 'Group' : 'Gruppo'} {patient.groupExtraAssigned || block.groupExtra})
                                </span>
                              </div>

                              {/* Lesioni Extra */}
                              <div className="space-y-1">
                                <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                                  {isEn ? 'Primary Field Injuries (Stop the Bleed):' : 'Lesioni Primarie da Campo (Stop the Bleed):'}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {patient.lesioni.map((lesione, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-neutral-950 text-emerald-200 border border-emerald-900/80 text-[10px] font-mono rounded"
                                    >
                                      • {lesione}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Dinamica se presente */}
                              {patient.dinamicaDelleLesioni && (
                                <div className="bg-neutral-950/80 p-2 border border-emerald-900/40 rounded text-[11px] font-mono text-neutral-300">
                                  <strong className="text-emerald-400 block text-[10px] uppercase">{isEn ? 'Tactical Incident Dynamics:' : 'Dinamica Evento Tattico:'}</strong>
                                  {patient.dinamicaDelleLesioni}
                                </div>
                              )}

                              {/* Procedure TCCC */}
                              <div className="bg-emerald-950/40 p-2.5 border border-emerald-900/80 rounded space-y-1">
                                <span className="text-[10px] text-emerald-400 font-bold uppercase block flex items-center gap-1">
                                  <Activity className="w-3 h-3" /> {isEn ? 'Expected TCCC Procedures:' : 'Procedure TCCC Attese:'}
                                </span>
                                <p className="text-xs text-emerald-200 font-mono leading-relaxed">
                                  {patient.procedureExtra && patient.procedureExtra.length > 0
                                    ? patient.procedureExtra.join(' • ')
                                    : (isEn ? 'Limb TQ application, wound packing with hemostatic gauze, emergency cricothyroidotomy, 14G needle decompression, litter packaging and rapid extraction.' : 'Applicazione Tourniquet TQ arti, Wound Packing con garze emostatiche (caolino/chitosano), Cricotiroidotomia d\'urgenza, decompressione con ago 14G, barellamento ed estrazione rapida.')}
                                </p>
                              </div>
                            </div>

                            {/* Dotazione Consumabili TCCC */}
                            <div className="text-[11px] font-mono text-neutral-400 bg-neutral-950/90 p-2 border border-neutral-800 rounded">
                              <strong className="text-emerald-400 uppercase block text-[10px]">{isEn ? 'Tactical Field Equipment:' : 'Dotazione Campo Tattico:'}</strong>
                              {isEn
                                ? 'TQ tourniquets, packing hemostatic gauze, cricothyroidotomy kit, scoop/fabric litter, 2000ml blood bags, smoke/atmospheric effects.'
                                : 'Lacci TQ, garze emostatiche per zaffaggio, set cricotiroidotomia, barella cucchiaio/telo, sacche sangue 2000ml, fumo/effetti scenici.'}
                            </div>
                          </div>
                        )}

                        {/* FASE 2: SHOCK ROOM (INTRA-OSPEDALIERO) */}
                        {(filterStation === 'all' || filterStation === 'shock' || filterStation === 'mine') && (
                          <div className="bg-indigo-950/20 border-2 border-indigo-800/70 p-3.5 rounded-lg flex flex-col justify-between space-y-3">
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between border-b border-indigo-900/60 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="p-1 bg-indigo-900/80 text-indigo-300 border border-indigo-700 rounded">
                                    <HeartPulse className="w-3.5 h-3.5" />
                                  </span>
                                  <span className="font-black text-indigo-300 text-xs uppercase tracking-wider">
                                    {isEn ? '2. SHOCK ROOM PHASE (IN-HOSPITAL)' : '2. FASE SHOCK ROOM (INTRA-OSPEDALIERO)'}
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {block.timeShockRoom}
                                </span>
                              </div>

                              {/* Setting e Squadra Shock Room */}
                              <div className="bg-neutral-950/80 p-2 border border-indigo-900/40 rounded flex items-center justify-between text-xs font-mono">
                                <span className="text-neutral-400 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Box Shock Room {postazioneNum}:
                                </span>
                                <span className="text-indigo-300 font-black">
                                  {isEn ? 'Team' : 'Squadra'} {patient.teamIntraAssigned || ((patient.id + 2) % 12) + 1} ({isEn ? 'Group' : 'Gruppo'} {patient.groupIntraAssigned || block.groupIntra})
                                </span>
                              </div>

                              {/* Procedure Shock Room */}
                              <div className="bg-indigo-950/40 p-2.5 border border-indigo-900/80 rounded space-y-1">
                                <span className="text-[10px] text-indigo-400 font-bold uppercase block flex items-center gap-1">
                                  <Activity className="w-3 h-3" /> {isEn ? 'In-Hospital Procedures (Shock Room):' : 'Procedure Intra-Ospedaliere (Shock Room):'}
                                </span>
                                <p className="text-xs text-indigo-200 font-mono leading-relaxed">
                                  {patient.procedureIntra && patient.procedureIntra.length > 0
                                    ? patient.procedureIntra.join(' • ')
                                    : (isEn ? 'Systematic ABCDE approach, clinical e-FAST ultrasound, definitive chest tube 28Fr, REBOA placement, resuscitative thoracotomy or damage control laparotomy.' : 'Approccio ABCDE sistematico, ecografia e-FAST clinica, drenaggio toracico definitivo con tubo 28Fr, posizionamento REBOA, toracotomia o laparotomia di rianimazione Damage Control.')}
                                </p>
                              </div>

                              {/* Dotazione Presidio Elettromedicale Box */}
                              <div className="text-[11px] font-mono text-neutral-400 bg-neutral-950/90 p-2 border border-neutral-800 rounded">
                                <strong className="text-indigo-400 uppercase block text-[10px]">{isEn ? 'Electromedical & Box Equipment:' : 'Dotazione Elettromedicale & Box:'}</strong>
                                {isEn
                                  ? 'Multiparameter monitor, mechanical ventilator, ultrasound with convex probe, sterile thoracotomy cart, 7Fr REBOA set, rapid fluid warmer.'
                                  : 'Monitor multiparametrico, ventilatore polmonare, ecografo con sonda convex, carrello toracotomia sterile, set REBOA 7Fr, riscaldatore fluidi.'}
                              </div>
                            </div>

                            {/* Note Reset Box Tecnico (15 min) */}
                            <div className="bg-neutral-950/90 p-2 border border-neutral-800 rounded text-[11px] font-mono text-neutral-300">
                              <strong className="text-amber-400 block text-[10px] uppercase">
                                {isEn ? `Box Reset Notes (${block.timeReset} • 15 min):` : `Note Reset Box (${block.timeReset} • 15 min):`}
                              </strong>
                              {patient.techNotes || (isEn ? 'Surface sanitization, ventilator circuit check, mannequin/biomodel reset, and restocking sterile consumables.' : 'Sanificazione superfici, verifica tenuta circuito ventilatore, reset manichino/biomodello e reintegro consumabili sterili.')}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. SNODO CRONOLOGICO DI CONNESSIONE: HANDOVER 1:1 BARELLATO AL MINUTO :30 */}
                      <div className="bg-neutral-950 border border-neutral-800/90 p-2.5 sm:p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-2 text-amber-300">
                          <span className="p-1 bg-amber-950 border border-amber-800 rounded text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                          </span>
                          <span>
                            <strong className="text-amber-400 font-bold uppercase">{isEn ? '1:1 SBAR Handover Transition' : 'Transizione Handover 1:1 SBAR'} ({block.timeHandover}):</strong> {isEn ? 'Mandatory at minute :30 (duration 5 min).' : 'Tassativo al minuto :30 (durata 5 min).'}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 flex-wrap">
                          <span className="text-emerald-400 font-bold">{isEn ? 'Tactical Env.' : 'Ambiente Tattico'} {postazioneNum}</span>
                          <ArrowRight className="w-3 h-3 text-amber-400" />
                          <span className="text-indigo-400 font-bold">Box Shock Room {postazioneNum}</span>
                          <span className="text-neutral-500">• {isEn ? 'Faculty & Tech Presence' : 'Presidio Faculty & Tecnico'}</span>
                        </div>
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
  );
};
