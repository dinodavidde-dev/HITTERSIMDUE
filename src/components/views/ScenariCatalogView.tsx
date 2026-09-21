import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  Droplet,
  FileText,
  Filter,
  Layers,
  MapPin,
  Package,
  Search,
  Shield,
  Sliders,
  Sparkles,
  Users,
  Wrench,
  Zap
} from 'lucide-react';
import { SimulatorPatient } from '../../types';
import { ScenarioStatusBadge } from '../ScenarioStatusBadge';

export const ScenariCatalogView: React.FC<{ onOpenProtesi?: () => void }> = ({ onOpenProtesi }) => {
  const { simulatorPatients, updateSimulatorPatient, language, selectedCatalogPatientId } = useCourse();
  const isEn = language === 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<'ALL' | '2' | '3'>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | 'mattina' | 'pomeriggio'>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [modalPatient, setModalPatient] = useState<SimulatorPatient | null>(null);

  // Clear selectedCatalogPatientId effect if needed, but ensure all 24 are always shown in grid
  const filteredPatients = simulatorPatients.filter((p) => {
    const matchSearch =
      p.scenarioCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString().includes(searchQuery.toLowerCase()) ||
      p.lesioni.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.moulageProtesi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.simulatori.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDay = selectedDay === 'ALL' || p.day.toString() === selectedDay;
    const matchPeriod = selectedPeriod === 'ALL' || p.period === selectedPeriod;
    const matchGroup =
      selectedGroup === 'ALL' ||
      p.groupExtraAssigned === selectedGroup ||
      p.groupIntraAssigned === selectedGroup;

    return matchSearch && matchDay && matchPeriod && matchGroup;
  });

  const exportCatalogJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(simulatorPatients, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `catalogo_scenari_trauma_24_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-slate-900 to-neutral-900 border-2 border-orange-500/40 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-orange-600 text-black font-black text-xs uppercase tracking-widest">
                {isEn ? 'MASTER CATALOG' : 'CATALOGO UFFICIALE'}
              </span>
              <span className="text-neutral-400 font-mono text-xs">24 SCENARI • 4 MACRO-GRUPPI • TCCC & SHOCK ROOM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-orange-500" />
              {isEn ? 'Trauma Simulation Scenario Catalog' : 'Catalogo Scenari e Pazienti Simulatori (24)'}
            </h1>
            <p className="text-neutral-300 text-sm mt-1 max-w-3xl">
              {isEn
                ? 'Complete catalog of 24 clinical-tactical scenarios with detailed lesions, surgical/medical procedures, moulage/prosthetics, simulator equipment, and technical checklists.'
                : 'Catalogo tassativo di tutti i 24 scenari clinico-tattici con lesioni, procedure chirurgiche TCCC e Shock Room, protesi moulage, simulatori e checklist di prontezza tecnica.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenProtesi && (
              <button
                onClick={onOpenProtesi}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-orange-400" />
                {isEn ? 'View Moulage Catalog' : 'Catalogo Protesi & Moulage'}
              </button>
            )}
            <button
              onClick={exportCatalogJSON}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/20"
            >
              <Download className="w-4 h-4" />
              {isEn ? 'Export Scenarios JSON' : 'Esporta Scenari JSON'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={isEn ? 'Search scenario, code, lesion...' : 'Cerca scenario, codice, lesione...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 pl-9 pr-3 py-2 text-xs uppercase placeholder:text-neutral-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Day Filter */}
          <div>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as any)}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 px-3 py-2 text-xs uppercase font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">{isEn ? 'All Days' : 'Tutti i Giorni (Day 2 & 3)'}</option>
              <option value="2">Day 2 (Scenari 1-12)</option>
              <option value="3">Day 3 (Scenari 13-24)</option>
            </select>
          </div>

          {/* Period Filter */}
          <div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 px-3 py-2 text-xs uppercase font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">{isEn ? 'All Periods' : 'Tutti i Periodi (Mattina/Pomeriggio)'}</option>
              <option value="mattina">{isEn ? 'Morning (M1 & M2)' : 'Mattina (Blocchi 1 & 2)'}</option>
              <option value="pomeriggio">{isEn ? 'Afternoon (P1 & P2)' : 'Pomeriggio (Blocchi 3 & 4)'}</option>
            </select>
          </div>

          {/* Group Filter */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 px-3 py-2 text-xs uppercase font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">{isEn ? 'All Groups' : 'Tutti i Gruppi (Alpha-Delta)'}</option>
              <option value="A">Gruppo ALPHA (DISC 01-15)</option>
              <option value="B">Gruppo BRAVO (DISC 16-30)</option>
              <option value="C">Gruppo CHARLIE (DISC 31-45)</option>
              <option value="D">Gruppo DELTA (DISC 46-60)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-neutral-400 font-mono">
          <span>{isEn ? `Showing ${filteredPatients.length} of 24 scenarios` : `Visualizzati ${filteredPatients.length} su 24 scenari`}</span>
          {searchQuery || selectedDay !== 'ALL' || selectedPeriod !== 'ALL' || selectedGroup !== 'ALL' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDay('ALL');
                setSelectedPeriod('ALL');
                setSelectedGroup('ALL');
              }}
              className="text-orange-400 hover:underline uppercase text-[11px] font-bold cursor-pointer"
            >
              {isEn ? 'Reset Filters' : 'Resetta Filtri'}
            </button>
          ) : null}
        </div>
      </div>

      {/* Scenarios Grid / List - Uniform cards for all 24 scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => {
          return (
            <div
              key={patient.id}
              className="bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 transition-all flex flex-col shadow-lg"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-neutral-800 bg-neutral-950/60 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-neutral-800 text-orange-400 font-black text-xs font-mono">
                      SCENARIO #{patient.id}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-200 font-bold text-[11px]">
                      Day {patient.day} • {patient.period.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 bg-orange-950/80 text-orange-300 font-bold text-[11px] border border-orange-800">
                      {patient.scenarioCode}
                    </span>
                    <ScenarioStatusBadge patient={patient} />
                  </div>
                  <h3 className="text-white font-bold text-sm tracking-wide">
                    {patient.lesioni[0] || 'Politrauma Tattico / Shock Room'}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 text-xs">
                {/* Assignments */}
                <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-2.5 border border-neutral-800 font-mono text-[11px]">
                  <div>
                    <span className="text-neutral-500 block">TCCC (Extra):</span>
                    <span className="text-white font-bold">
                      Gruppo {patient.groupExtraAssigned} (Sq. {patient.teamExtraAssigned})
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Shock Room (Intra):</span>
                    <span className="text-white font-bold">
                      Gruppo {patient.groupIntraAssigned} (Sq. {patient.teamIntraAssigned})
                    </span>
                  </div>
                </div>

                {/* Lesioni key list */}
                <div>
                  <span className="text-neutral-400 font-bold uppercase tracking-wider block mb-1 text-[10px]">
                    {isEn ? 'Lesions & Pathology:' : 'Lesioni & Patologie:'}
                  </span>
                  <ul className="space-y-1 pl-3 list-disc text-neutral-300">
                    {patient.lesioni.map((les, idx) => (
                      <li key={idx}>{les}</li>
                    ))}
                  </ul>
                </div>

                {/* Procedures Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="bg-neutral-950/80 p-2 border border-neutral-800">
                    <span className="text-orange-400 font-bold block mb-0.5 text-[10px] uppercase">
                      {isEn ? 'TCCC Procedures:' : 'Procedure TCCC:'}
                    </span>
                    <ul className="text-neutral-300 space-y-0.5 pl-2 list-disc">
                      {patient.procedureExtra.map((pr, idx) => (
                        <li key={idx} className="truncate">{pr}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-neutral-950/80 p-2 border border-neutral-800">
                    <span className="text-cyan-400 font-bold block mb-0.5 text-[10px] uppercase">
                      {isEn ? 'Shock Room Procedures:' : 'Procedure Shock Room:'}
                    </span>
                    <ul className="text-neutral-300 space-y-0.5 pl-2 list-disc">
                      {patient.procedureIntra.map((pr, idx) => (
                        <li key={idx} className="truncate">{pr}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Moulage & Prosthetics */}
                <div className="bg-neutral-950 p-2.5 border border-neutral-800 flex items-start gap-2">
                  <Droplet className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-400 font-bold uppercase text-[10px] block">
                      {isEn ? 'Moulage & Prosthesis:' : 'Moulage & Protesi:'}
                    </span>
                    <p className="text-neutral-200 mt-0.5 leading-relaxed">{patient.moulageProtesi}</p>
                  </div>
                </div>

                {/* Simulator Equipment */}
                <div className="flex items-center gap-2 text-neutral-300 bg-neutral-950 p-2 border border-neutral-800 font-mono text-[11px]">
                  <Wrench className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                  <span className="truncate"><strong>Simulatore:</strong> {patient.simulatori}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between">
                <button
                  onClick={() => setModalPatient(patient)}
                  className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold uppercase text-[11px] tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-orange-400" />
                  {isEn ? 'Full Scenario Sheet' : 'Scheda Dettagliata Scenario'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Modal */}
      {modalPatient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-2 border-orange-500/60 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-6">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="px-2.5 py-1 bg-orange-600 text-black font-black text-xs uppercase">
                  SCENARIO SIMULATORE #{modalPatient.id} • {modalPatient.scenarioCode}
                </span>
                <h2 className="text-xl font-black text-white mt-2">
                  {modalPatient.lesioni[0]}
                </h2>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Day {modalPatient.day} • Periodo: {modalPatient.period.toUpperCase()} • Gruppo Extra: {modalPatient.groupExtraAssigned} | Gruppo Intra: {modalPatient.groupIntraAssigned}
                </p>
              </div>
              <button
                onClick={() => setModalPatient(null)}
                className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-neutral-300">
              {/* Lesioni */}
              <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                <h4 className="text-orange-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Quadro Lesionale Completo
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-neutral-200">
                  {modalPatient.lesioni.map((les, idx) => (
                    <li key={idx}>{les}</li>
                  ))}
                </ul>
              </div>

              {/* Procedure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                  <h4 className="text-orange-400 font-black text-xs uppercase tracking-wider">
                    Procedure TCCC (Ambiente Tattico)
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-200 text-xs">
                    {modalPatient.procedureExtra.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                  <h4 className="text-cyan-400 font-black text-xs uppercase tracking-wider">
                    Procedure Shock Room (ABCDE)
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-200 text-xs">
                    {modalPatient.procedureIntra.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Moulage & Protesi */}
              <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                <h4 className="text-red-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                  <Droplet className="w-4 h-4" /> Dettagli Moulage & Protesi
                </h4>
                <p className="text-neutral-200">{modalPatient.moulageProtesi}</p>
              </div>

              {/* Attori & Simulatori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-1">
                  <span className="text-neutral-400 font-bold uppercase text-[10px]">Simulatori & Hardware:</span>
                  <p className="text-white font-medium text-xs">{modalPatient.simulatori}</p>
                </div>
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-1">
                  <span className="text-neutral-400 font-bold uppercase text-[10px]">Attori / Figuranti ({modalPatient.attoriCount}):</span>
                  <p className="text-white font-medium text-xs">{modalPatient.attoreDettagli}</p>
                </div>
              </div>

              {/* Note Tecniche */}
              <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-1">
                <span className="text-neutral-400 font-bold uppercase text-[10px]">Note Regia & Team Tecnico:</span>
                <p className="text-neutral-200 text-xs">{modalPatient.techNotes}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setModalPatient(null)}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs tracking-wider cursor-pointer"
              >
                Chiudi Scheda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
