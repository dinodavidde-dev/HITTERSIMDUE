import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Droplet,
  Edit3,
  FileText,
  Filter,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Sliders,
  Star,
  Users,
  Wrench,
  Zap
} from 'lucide-react';
import { SimulatorPatient } from '../../types';
import { ScenarioStatusBadge } from '../ScenarioStatusBadge';
import { translatePatient } from '../../utils/courseTranslation';
import { ScenarioEditorModal } from '../scenari/ScenarioEditorModal';

export const ScenariMasterListView: React.FC = () => {
  const { simulatorPatients, resetSimulatorPatients, language, teams, technicians, evaluations } = useCourse();
  const isEn = language === 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<'ALL' | '2' | '3'>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | 'mattina' | 'pomeriggio'>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'TCCC' | 'SHOCK_ROOM'>('ALL');
  const [selectedModalPatient, setSelectedModalPatient] = useState<SimulatorPatient | null>(null);

  // Scenario Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);

  const handleResetAllDefaults = () => {
    const confirmReset = window.confirm(
      isEn
        ? 'Are you sure you want to reset ALL 24 scenarios to official initial default values? Any custom modifications will be overwritten.'
        : 'Sei sicuro di voler ripristinare TUTTI i 24 scenari ai valori predefiniti ufficiali del corso? Tutte le modifiche personalizzate verranno reimpostate.'
    );
    if (confirmReset && resetSimulatorPatients) {
      resetSimulatorPatients();
    }
  };

  // Helper to get execution time based on day & period / slot
  const getExecutionTimeInfo = (patient: SimulatorPatient) => {
    const blockText = isEn ? 'Block' : 'Blocco';
    const preAlertText = isEn ? 'TCCC Pre-alert / SR Standby' : 'Pre-allerta TCCC / Standby SR';
    if (patient.day === 2 && patient.period === 'mattina') {
      return { time: `08:30 - 10:00 (${blockText} 1)`, preAlert: `08:30 (${preAlertText})` };
    }
    if (patient.day === 2 && patient.period === 'pomeriggio') {
      return { time: `10:15 - 11:45 (${blockText} 2)`, preAlert: `10:15 (${preAlertText})` };
    }
    if (patient.day === 3 && patient.period === 'mattina') {
      return { time: `12:00 - 13:30 (${blockText} 3)`, preAlert: `12:00 (${preAlertText})` };
    }
    return { time: `14:15 - 15:45 (${blockText} 4)`, preAlert: `14:15 (${preAlertText})` };
  };

  // Helper to get assigned technician based on team
  const getTechnicianForTeam = (teamId: number) => {
    const techIdx = ((teamId - 1) % technicians.length);
    return technicians[techIdx] || { badgeCode: `TECH-${String(teamId).padStart(2, '0')}`, name: isEn ? `Station Technician ${teamId}` : `Tecnico Postazione ${teamId}` };
  };

  const rawFilteredScenarios = simulatorPatients.filter((p) => {
    const matchSearch =
      p.scenarioCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString().includes(searchQuery.toLowerCase()) ||
      p.lesioni.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.dinamicaDelleLesioni.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.simulatori.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDay = selectedDay === 'ALL' || p.day.toString() === selectedDay;
    const matchPeriod = selectedPeriod === 'ALL' || p.period === selectedPeriod;

    return matchSearch && matchDay && matchPeriod;
  });

  const filteredScenarios = rawFilteredScenarios.map((p) => translatePatient(p, language));

  const exportScenariosListJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(simulatorPatients, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `elenco_scenari_corso_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 font-mono">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-slate-900 to-neutral-900 border-2 border-orange-500/40 p-3 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 bg-orange-600 text-black font-black text-[10px] sm:text-xs uppercase tracking-widest">
                {isEn ? 'MASTER COURSE SCENARIOS' : 'ELENCO GENERALE SCENARI'}
              </span>
              <span className="text-neutral-400 font-mono text-[11px] sm:text-xs">{isEn ? '24 OFFICIAL SCENARIOS • TCCC & SHOCK ROOM' : '24 SCENARI UFFICIALI • TCCC & SHOCK ROOM'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2 sm:gap-3">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 shrink-0" />
              <span>{isEn ? 'Course Scenari Master List' : 'Elenco Scenari del Corso'}</span>
            </h1>
            <p className="text-neutral-300 text-xs sm:text-sm mt-1 max-w-3xl">
              {isEn
                ? 'Comprehensive execution schedule detailing timing, tactical vs clinical phase, scenario names, codes, assigned teams, simulators, responsible technicians, and environmental simulation descriptions.'
                : 'Elenco tassativo degli scenari con orari di esecuzione, fase TCCC o Shock Room, codici, squadre, attori/simulatori, tecnici assegnati e descrizione dell\'ambiente.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingPatientId(null);
                setIsEditorOpen(true);
              }}
              className="min-h-[40px] px-3.5 sm:px-4 py-2 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/30"
              title={isEn ? 'Open Scenario Editor to edit or create scenarios' : 'Apri l\'editor per modificare o creare scenari'}
            >
              <Sliders className="w-4 h-4" />
              <span>{isEn ? 'Scenario Editor' : 'Editor Scenari'}</span>
            </button>

            <button
              onClick={() => {
                setEditingPatientId(null);
                setIsEditorOpen(true);
              }}
              className="min-h-[40px] px-3 sm:px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-orange-400 hover:text-orange-300 font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-neutral-700"
            >
              <Plus className="w-4 h-4" />
              <span>{isEn ? 'New Scenario' : 'Nuovo Scenario'}</span>
            </button>

            <button
              onClick={handleResetAllDefaults}
              className="min-h-[40px] px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-neutral-800"
              title={isEn ? 'Reset all scenarios to factory defaults' : 'Ripristina tutti gli scenari ai valori predefiniti'}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">{isEn ? 'Reset' : 'Ripristina'}</span>
            </button>

            <button
              onClick={exportScenariosListJSON}
              className="min-h-[40px] px-3 sm:px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-neutral-800"
            >
              <Download className="w-4 h-4" />
              <span>{isEn ? 'Export JSON' : 'Esporta JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-neutral-900 border border-neutral-800 p-3 sm:p-4 shadow-lg space-y-2.5 sm:space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={isEn ? 'Search scenario, code...' : 'Cerca scenario, codice, ambiente...'}
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
              <option value="2">{isEn ? 'Day 2 (Scenarios 1-12)' : 'Day 2 (Scenari 1-12)'}</option>
              <option value="3">{isEn ? 'Day 3 (Scenarios 13-24)' : 'Day 3 (Scenari 13-24)'}</option>
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
              <option value="mattina">{isEn ? 'Morning (Blocks 1 & 3)' : 'Mattina (Blocchi 1 & 3)'}</option>
              <option value="pomeriggio">{isEn ? 'Afternoon (Blocks 2 & 4)' : 'Pomeriggio (Blocchi 2 & 4)'}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-neutral-400 font-mono flex-wrap gap-2">
          <span>{isEn ? `Showing ${filteredScenarios.length} scenarios` : `Visualizzati ${filteredScenarios.length} scenari operativi`}</span>
          {searchQuery || selectedDay !== 'ALL' || selectedPeriod !== 'ALL' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDay('ALL');
                setSelectedPeriod('ALL');
              }}
              className="text-orange-400 hover:underline uppercase text-[11px] font-bold cursor-pointer"
            >
              {isEn ? 'Reset Filters' : 'Resetta Filtri'}
            </button>
          ) : null}
        </div>
      </div>

      {/* MOBILE SCENARIOS CARD VIEW (< md) */}
      <div className="block md:hidden space-y-3">
        {filteredScenarios.map((patient) => {
          const execInfo = getExecutionTimeInfo(patient);
          const tech = getTechnicianForTeam(patient.teamExtraAssigned);
          const evalExtra = evaluations.find(e => e.patientId === patient.id && e.teamId === patient.teamExtraAssigned);
          const evalIntra = evaluations.find(e => e.patientId === patient.id && e.teamId === patient.teamIntraAssigned);

          return (
            <div key={patient.id} className="bg-neutral-950 border border-neutral-800 p-3.5 space-y-3 shadow-md rounded">
              <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-orange-600 text-black font-black text-[11px] rounded">
                    #{patient.id}
                  </span>
                  <span className="text-orange-400 font-bold text-xs">{patient.scenarioCode}</span>
                  <ScenarioStatusBadge patient={patient} />
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Day {patient.day}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {patient.lesioni[0]}
                </h3>
                <p className="text-neutral-400 text-xs mt-1 line-clamp-2">
                  {patient.dinamicaDelleLesioni}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-900 p-2.5 border border-neutral-800">
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase block">{isEn ? 'Time & Block:' : 'Orario & Blocco:'}</span>
                  <span className="text-white font-bold text-xs">{execInfo.time}</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase block">{isEn ? 'Assigned Technician:' : 'Tecnico Assegnato:'}</span>
                  <span className="text-amber-300 font-bold text-xs">{tech.badgeCode} • {tech.name}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2 bg-neutral-900 px-2.5 py-1.5 border border-neutral-800">
                  <span className="text-orange-300 font-bold">TCCC: Grp {patient.groupExtraAssigned} ({isEn ? 'Tm.' : 'Sq.'} {patient.teamExtraAssigned})</span>
                  {evalExtra ? (
                    <span className="text-emerald-400 font-bold text-[10px]">
                      ✓ {((evalExtra.scores.abcdeApproach + evalExtra.scores.technicalSkills + evalExtra.scores.teamworkLeadership + evalExtra.scores.handoverSbar + evalExtra.scores.safetyTiming)/5).toFixed(1)}/5
                    </span>
                  ) : (
                    <span className="text-yellow-400 text-[10px]">{isEn ? 'To evaluate' : 'Da valutare'}</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 bg-neutral-900 px-2.5 py-1.5 border border-neutral-800">
                  <span className="text-cyan-300 font-bold">ShockRoom: Grp {patient.groupIntraAssigned} ({isEn ? 'Tm.' : 'Sq.'} {patient.teamIntraAssigned})</span>
                  {evalIntra ? (
                    <span className="text-emerald-400 font-bold text-[10px]">
                      ✓ {((evalIntra.scores.abcdeApproach + evalIntra.scores.technicalSkills + evalIntra.scores.teamworkLeadership + evalIntra.scores.handoverSbar + evalIntra.scores.safetyTiming)/5).toFixed(1)}/5
                    </span>
                  ) : (
                    <span className="text-yellow-400 text-[10px]">{isEn ? 'To evaluate' : 'Da valutare'}</span>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-neutral-400">
                <span className="text-neutral-500">Hardware: </span>{patient.simulatori} • {patient.attoriCount} {isEn ? 'actor(s)' : 'attore/i'}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPatientId(patient.id);
                    setIsEditorOpen(true);
                  }}
                  className="w-full min-h-[40px] py-2 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Edit' : 'Modifica'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModalPatient(patient)}
                  className="w-full min-h-[40px] py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-neutral-700"
                >
                  <FileText className="w-3.5 h-3.5 text-orange-400" />
                  <span>{isEn ? 'Sheet' : 'Scheda'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP SCENARIOS TABLE (>= md) */}
      <div className="hidden md:block bg-neutral-900 border border-neutral-800 shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-neutral-950 text-neutral-400 text-[11px] font-mono uppercase tracking-wider border-b border-neutral-800">
              <th className="p-3">{isEn ? 'Code & Name' : 'Codice & Nome'}</th>
              <th className="p-3">{isEn ? 'Execution Time (Pre-alert / Standby)' : 'Ora Esecuzione (Pre-allerta / Standby)'}</th>
              <th className="p-3">{isEn ? 'Phase (TCCC vs ShockRoom)' : 'Fase (TCCC vs ShockRoom)'}</th>
              <th className="p-3">{isEn ? 'Assigned Teams' : 'Squadre Associate'}</th>
              <th className="p-3">{isEn ? 'Actor / Simulator' : 'Attore / Simulatore'}</th>
              <th className="p-3">{isEn ? 'Assigned Technician' : 'Tecnico Assegnato'}</th>
              <th className="p-3">{isEn ? 'Environment & Scene' : 'Ambiente & Scena'}</th>
              <th className="p-3 text-right">{isEn ? 'Actions' : 'Azioni'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 text-xs">
            {filteredScenarios.map((patient) => {
              const execInfo = getExecutionTimeInfo(patient);
              const tech = getTechnicianForTeam(patient.teamExtraAssigned);
              return (
                <tr key={patient.id} className="hover:bg-neutral-850/50 transition-colors">
                  <td className="p-3 font-mono">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-orange-600 text-black font-black text-[10px]">
                        #{patient.id}
                      </span>
                      <span className="text-orange-400 font-bold">{patient.scenarioCode}</span>
                      <ScenarioStatusBadge patient={patient} />
                    </div>
                    <div className="text-white font-bold text-xs line-clamp-1">
                      {patient.lesioni[0]}
                    </div>
                  </td>
                  <td className="p-3 font-mono">
                    <div className="text-white font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      {execInfo.time}
                    </div>
                    <div className="text-neutral-400 text-[10px] mt-0.5">
                      {execInfo.preAlert}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-0.5 bg-orange-950 text-orange-300 border border-orange-700/60 font-bold text-[10px] uppercase inline-block w-fit">
                        {isEn ? 'TCCC: Tactical Env. 3' : 'TCCC: Amb. Tattico 3'}
                      </span>
                      <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold text-[10px] uppercase inline-block w-fit">
                        ShockRoom: Box 3
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-mono space-y-1.5">
                    {(() => {
                      const evalExtra = evaluations.find(e => e.patientId === patient.id && e.teamId === patient.teamExtraAssigned);
                      const evalIntra = evaluations.find(e => e.patientId === patient.id && e.teamId === patient.teamIntraAssigned);
                      return (
                        <>
                          <div className="flex items-center justify-between gap-2 bg-neutral-950 p-1.5 border border-neutral-800">
                            <div>
                              <span className="text-neutral-400 text-[10px] block">TCCC:</span>
                              <span className="text-orange-400 font-bold">Grp {patient.groupExtraAssigned} ({isEn ? 'Tm.' : 'Sq.'} {patient.teamExtraAssigned})</span>
                            </div>
                            {evalExtra ? (
                              <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold rounded">
                                ✓ {((evalExtra.scores.abcdeApproach + evalExtra.scores.technicalSkills + evalExtra.scores.teamworkLeadership + evalExtra.scores.handoverSbar + evalExtra.scores.safetyTiming)/5).toFixed(1)}/5
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-yellow-950/80 text-yellow-300 border border-yellow-700 text-[10px] font-bold rounded animate-pulse">
                                ⚠️ {isEn ? 'To Evaluate' : 'Da Valutare'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2 bg-neutral-950 p-1.5 border border-neutral-800">
                            <div>
                              <span className="text-neutral-400 text-[10px] block">ShockRoom:</span>
                              <span className="text-cyan-400 font-bold">Grp {patient.groupIntraAssigned} ({isEn ? 'Tm.' : 'Sq.'} {patient.teamIntraAssigned})</span>
                            </div>
                            {evalIntra ? (
                              <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold rounded">
                                ✓ {((evalIntra.scores.abcdeApproach + evalIntra.scores.technicalSkills + evalIntra.scores.teamworkLeadership + evalIntra.scores.handoverSbar + evalIntra.scores.safetyTiming)/5).toFixed(1)}/5
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-yellow-950/80 text-yellow-300 border border-yellow-700 text-[10px] font-bold rounded animate-pulse">
                                ⚠️ {isEn ? 'To Evaluate' : 'Da Valutare'}
                              </span>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </td>
                  <td className="p-3">
                    <div className="text-white font-medium">
                      {patient.simulatori}
                    </div>
                    <div className="text-neutral-400 text-[10px] mt-0.5 font-mono">
                      {patient.attoriCount} {isEn ? 'Actor(s)' : 'Attore/i'} ({patient.attoreDettagli})
                    </div>
                  </td>
                  <td className="p-3 font-mono">
                    <div className="text-amber-400 font-bold text-[11px]">
                      {tech.badgeCode}
                    </div>
                    <div className="text-neutral-300 text-[10px]">
                      {tech.name}
                    </div>
                  </td>
                  <td className="p-3 max-w-xs">
                    <p className="text-neutral-300 text-[11px] leading-relaxed line-clamp-2">
                      {patient.dinamicaDelleLesioni}
                    </p>
                    <p className="text-neutral-500 text-[10px] font-mono mt-0.5 truncate">
                      Moulage: {patient.moulageProtesi}
                    </p>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingPatientId(patient.id);
                          setIsEditorOpen(true);
                        }}
                        className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                        title={isEn ? 'Edit this scenario' : 'Modifica questo scenario'}
                      >
                        <Edit3 className="w-3 h-3" />
                        {isEn ? 'Edit' : 'Modifica'}
                      </button>
                      <button
                        onClick={() => setSelectedModalPatient(patient)}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer inline-flex items-center gap-1 border border-neutral-700"
                      >
                        <FileText className="w-3 h-3 text-orange-400" />
                        {isEn ? 'Details' : 'Dettagli'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Scenario Detail Modal */}
      {selectedModalPatient && (() => {
        const modalPatient = translatePatient(selectedModalPatient, language);
        return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-2 border-orange-500/60 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-6">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="px-2.5 py-1 bg-orange-600 text-black font-black text-xs uppercase">
                  SCENARIO #{modalPatient.id} • {modalPatient.scenarioCode}
                </span>
                <h2 className="text-xl font-black text-white mt-2">
                  {modalPatient.lesioni[0]}
                </h2>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Day {modalPatient.day} • {modalPatient.period.toUpperCase()} • {isEn ? 'Extra Group: ' : 'Gruppo Extra: '}{modalPatient.groupExtraAssigned} | {isEn ? 'Intra Group: ' : 'Gruppo Intra: '}{modalPatient.groupIntraAssigned}
                </p>
              </div>
              <button
                onClick={() => setSelectedModalPatient(null)}
                className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-neutral-300">
              <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                <h4 className="text-orange-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4" /> {isEn ? 'Dynamics & Environment Simulation Description' : 'Dinamica & Descrizione Ambiente da Ricreare'}
                </h4>
                <p className="text-neutral-200 leading-relaxed">{modalPatient.dinamicaDelleLesioni}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                  <h4 className="text-orange-400 font-black text-xs uppercase tracking-wider">
                    {isEn ? 'TCCC Procedures (Tactical Environment)' : 'Procedure TCCC (Ambiente Tattico)'}
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-200 text-xs">
                    {modalPatient.procedureExtra.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                  <h4 className="text-cyan-400 font-black text-xs uppercase tracking-wider">
                    {isEn ? 'Shock Room Procedures (ABCDE)' : 'Procedure Shock Room (ABCDE)'}
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-200 text-xs">
                    {modalPatient.procedureIntra.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                <h4 className="text-red-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                  <Droplet className="w-4 h-4" /> {isEn ? 'Moulage & Prosthetics Details' : 'Dettagli Moulage & Protesi'}
                </h4>
                <p className="text-neutral-200">{modalPatient.moulageProtesi}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-1">
                  <span className="text-neutral-400 font-bold uppercase text-[10px]">{isEn ? 'Simulators & Hardware:' : 'Simulatori & Hardware:'}</span>
                  <p className="text-white font-medium text-xs">{modalPatient.simulatori}</p>
                </div>
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-1">
                  <span className="text-neutral-400 font-bold uppercase text-[10px]">{isEn ? `Actors / Patients (${modalPatient.attoriCount}):` : `Attori / Figuranti (${modalPatient.attoriCount}):`}</span>
                  <p className="text-white font-medium text-xs">{modalPatient.attoreDettagli}</p>
                </div>
              </div>

              {/* Live Evaluation Status & Feedback Section */}
              <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-3">
                <h4 className="text-amber-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> {isEn ? 'Team Evaluation Status (Live Tutor Feedback)' : 'Stato Valutazioni per Squadra (Feedback Live Tutor)'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* TCCC Extra Team */}
                  <div className="bg-neutral-900 p-3 border border-neutral-800 space-y-1.5">
                    <span className="text-orange-400 font-bold block uppercase text-[10px]">
                      {isEn ? `TCCC Team #${modalPatient.teamExtraAssigned} (Group ${modalPatient.groupExtraAssigned})` : `Squadra TCCC #${modalPatient.teamExtraAssigned} (Gruppo ${modalPatient.groupExtraAssigned})`}
                    </span>
                    {evaluations.find(e => e.patientId === modalPatient.id && e.teamId === modalPatient.teamExtraAssigned) ? (() => {
                      const ev = evaluations.find(e => e.patientId === modalPatient.id && e.teamId === modalPatient.teamExtraAssigned)!;
                      const avg = ((ev.scores.abcdeApproach + ev.scores.technicalSkills + ev.scores.teamworkLeadership + ev.scores.handoverSbar + ev.scores.safetyTiming)/5).toFixed(1);
                      return (
                        <div className="space-y-1 font-mono text-[11px]">
                          <div className="text-emerald-400 font-bold">
                            ✓ {isEn ? `Evaluated • Average: ${avg} / 5.0` : `Valutato • Media: ${avg} / 5.0`}
                          </div>
                          <p className="text-neutral-300 italic">{isEn ? 'Strengths:' : 'Punti di forza:'} "{ev.strengths || 'N/D'}"</p>
                          <p className="text-neutral-400 italic">{isEn ? 'Critical issues:' : 'Criticità:'} "{ev.criticalIssues || 'N/D'}"</p>
                          <span className="text-neutral-500 text-[10px] block">{isEn ? 'Submitted:' : 'Inviato il:'} {ev.timestamp}</span>
                        </div>
                      );
                    })() : (
                      <span className="text-yellow-400 font-bold text-[11px] block animate-pulse">
                        ⚠️ {isEn ? 'Pending Tutor evaluation form' : 'In attesa di compilazione valutazione Tutor'}
                      </span>
                    )}
                  </div>

                  {/* Shock Room Intra Team */}
                  <div className="bg-neutral-900 p-3 border border-neutral-800 space-y-1.5">
                    <span className="text-cyan-400 font-bold block uppercase text-[10px]">
                      {isEn ? `Shock Room Team #${modalPatient.teamIntraAssigned} (Group ${modalPatient.groupIntraAssigned})` : `Squadra Shock Room #${modalPatient.teamIntraAssigned} (Gruppo ${modalPatient.groupIntraAssigned})`}
                    </span>
                    {evaluations.find(e => e.patientId === modalPatient.id && e.teamId === modalPatient.teamIntraAssigned) ? (() => {
                      const ev = evaluations.find(e => e.patientId === modalPatient.id && e.teamId === modalPatient.teamIntraAssigned)!;
                      const avg = ((ev.scores.abcdeApproach + ev.scores.technicalSkills + ev.scores.teamworkLeadership + ev.scores.handoverSbar + ev.scores.safetyTiming)/5).toFixed(1);
                      return (
                        <div className="space-y-1 font-mono text-[11px]">
                          <div className="text-emerald-400 font-bold">
                            ✓ {isEn ? `Evaluated • Average: ${avg} / 5.0` : `Valutato • Media: ${avg} / 5.0`}
                          </div>
                          <p className="text-neutral-300 italic">{isEn ? 'Strengths:' : 'Punti di forza:'} "{ev.strengths || 'N/D'}"</p>
                          <p className="text-neutral-400 italic">{isEn ? 'Critical issues:' : 'Criticità:'} "{ev.criticalIssues || 'N/D'}"</p>
                          <span className="text-neutral-500 text-[10px] block">{isEn ? 'Submitted:' : 'Inviato il:'} {ev.timestamp}</span>
                        </div>
                      );
                    })() : (
                      <span className="text-yellow-400 font-bold text-[11px] block animate-pulse">
                        ⚠️ {isEn ? 'Pending Tutor evaluation form' : 'In attesa di compilazione valutazione Tutor'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-1">
                <span className="text-neutral-400 font-bold uppercase text-[10px]">{isEn ? 'Control Room & Tech Notes:' : 'Note Regia & Team Tecnico:'}</span>
                <p className="text-neutral-200 text-xs">{modalPatient.techNotes}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => {
                  const idToEdit = selectedModalPatient.id;
                  setSelectedModalPatient(null);
                  setEditingPatientId(idToEdit);
                  setIsEditorOpen(true);
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-600/30"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEn ? 'Edit This Scenario' : 'Modifica questo Scenario'}</span>
              </button>

              <button
                onClick={() => setSelectedModalPatient(null)}
                className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold uppercase text-xs tracking-wider cursor-pointer border border-neutral-700"
              >
                {isEn ? 'Close Sheet' : 'Chiudi Scheda'}
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
