import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  AlertOctagon,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  HelpCircle,
  Info,
  MapPin,
  Moon,
  Radio,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
} from 'lucide-react';
import { TriageCategory } from '../../types';
import { BroadcastModal } from '../BroadcastModal';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { translateRoleOrSpecialty } from '../../i18n/medicalTerms';

export const NightScenarioView: React.FC = () => {
  const {
    language,
    t,
    userRole,
    nightScenarios,
    updateNightScenarioTriage,
    teams,
    discenti,
    faculty,
  } = useCourse();

  const isEn = language === 'en';
  const [selectedTeamId, setSelectedTeamId] = useState<number>(1);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  const selectedScenario = nightScenarios.find((s) => s.teamId === selectedTeamId) || nightScenarios[0];
  const assignedTeam = teams.find((t) => t.id === selectedScenario.teamId);
  const teamDiscenti = discenti.filter((d) => d.teamId === selectedScenario.teamId);
  const assignedFaculty = faculty.find((f) => f.assignedTeamId === selectedScenario.teamId);

  const triageOptions: { code: TriageCategory; label: string; bg: string; text: string; border: string }[] = [
    { code: 'RED', label: isEn ? 'RED (Immediate)' : 'ROSSO (Immediato)', bg: 'bg-red-600', text: 'text-white', border: 'border-red-500' },
    { code: 'YELLOW', label: isEn ? 'YELLOW (Delayed)' : 'GIALLO (Differibile)', bg: 'bg-amber-500', text: 'text-slate-900', border: 'border-amber-400' },
    { code: 'GREEN', label: isEn ? 'GREEN (Minor)' : 'VERDE (Minore)', bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-500' },
    { code: 'BLACK', label: isEn ? 'BLACK (Expectant / Deceased)' : 'NERO (Deceduto / Expectant)', bg: 'bg-slate-950', text: 'text-slate-200', border: 'border-slate-700' },
  ];

  const handleTriageSelect = (triage: TriageCategory) => {
    updateNightScenarioTriage(selectedScenario.teamId, triage);
  };

  const completedTriageCount = nightScenarios.filter((s) => s.triageAssigned !== undefined).length;

  return (
    <div className="space-y-4 pb-12">
      {/* Night Scenario Tactical Hero Banner */}
      <div className="relative overflow-hidden bg-neutral-950 border-2 border-neutral-700 p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-black font-black text-[11px] uppercase tracking-wider shadow-sm">
                <Moon className="w-3.5 h-3.5" />
                {isEn ? 'NIGHT SCENARIO • 21:00 DAY 03' : 'SCENARIO NOTTURNO • 21:00 DAY 03'}
              </span>
              <span className="px-2 py-0.5 bg-neutral-900 text-neutral-300 border border-neutral-700 font-mono font-bold text-[10px] sm:text-[11px] uppercase">
                {isEn ? 'MCI FIELD EXERCISE' : 'ESERCITAZIONE CAMPALE MCI'}
              </span>
              <span className="px-2 py-0.5 bg-neutral-900 text-neutral-300 border border-neutral-700 font-mono font-bold text-[10px] sm:text-[11px] uppercase">
                {isEn ? '12 CONCURRENT TEAMS' : '12 SQUADRE IN CONTEMPORANEA'}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight leading-tight">
              {isEn
                ? 'Mass Casualty Night Simulation & START / SALT Advanced Triage'
                : 'Simulazione Notturna di Maxiemergenza & Triage Avanzato START / SALT'}
            </h2>
            <p className="text-neutral-300 text-xs leading-relaxed font-medium">
              {isEn
                ? '12 teams (60 operators) concurrently under low-light tactical conditions, simulated blast injuries, traumatic amputations, airway compromise, and treatment prioritization.'
                : '12 squadre (60 operatori) in contemporanea con scarsa illuminazione, esplosioni simulate, amputazioni traumatiche, ostruzioni e prioritizzazione trattamento.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <LanguageSwitcher variant="badge" />

            {userRole === 'direttore' && (
              <button
                onClick={() => setIsBroadcastOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-neutral-100 hover:text-black text-white font-black text-xs uppercase tracking-wider border border-neutral-100 transition-all cursor-pointer shadow-md"
                title={isEn ? 'Send general broadcast alert' : 'Invia allerta broadcast generale (Riservato Direzione)'}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isEn ? 'BROADCAST ALERT' : 'ALLERTA BROADCAST'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mt-3 pt-2.5 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px]">{isEn ? 'STATION TRIAGE STATUS:' : 'STATO TRIAGE POSTAZIONI:'}</span>
            <strong className="text-orange-500 font-mono font-black text-xs">
              {completedTriageCount} {isEn ? 'OF 12 REPORTED' : 'DI 12 REFERTATE'}
            </strong>
          </div>
          <div className="font-mono font-bold text-neutral-300 text-[10px] uppercase">
            {isEn ? 'PROTOCOL: TCCC NIGHT OPS + SBAR RADIO REPORT' : 'PROTOCOLLO: TCCC NIGHT OPS + SBAR RADIO REPORT'}
          </div>
        </div>
      </div>

      {/* 12 Night Stations Quick Grid */}
      <div className="bg-neutral-950 border-2 border-neutral-800 p-3 sm:p-4 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            {isEn ? '12 CONCURRENT NIGHT STATIONS' : '12 POSTAZIONI NOTTURNE IN CONTEMPORANEA'}
          </h3>
          <span className="text-xs font-mono font-bold text-neutral-400">
            {isEn ? 'ACTIVE TEAM:' : 'SQUADRA ATTIVA:'} <strong className="text-white uppercase">{selectedScenario.teamName}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 pt-2">
          {nightScenarios.map((scen) => {
            const isSelected = scen.teamId === selectedScenario.teamId;
            const currentTriage = triageOptions.find((t) => t.code === scen.triageAssigned);

            return (
              <button
                key={scen.teamId}
                onClick={() => setSelectedTeamId(scen.teamId)}
                className={`p-3 border-2 text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-100 text-black border-neutral-100 shadow-xl'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-600 text-white'
                }`}
              >
                <div className={`text-xs font-black uppercase ${isSelected ? 'text-black' : 'text-white'}`}>
                  {isEn ? `TEAM ${scen.teamId}` : `SQ. ${scen.teamId}`}
                </div>
                <div className={`text-[10px] font-mono font-bold ${isSelected ? 'text-neutral-700' : 'text-neutral-400'}`}>
                  GRP {scen.groupId}
                </div>
                {currentTriage ? (
                  <div
                    className={`text-[9px] font-black uppercase mt-1.5 px-1 py-0.5 border ${currentTriage.bg} ${currentTriage.text}`}
                  >
                    {currentTriage.code}
                  </div>
                ) : (
                  <div className="text-[9px] text-neutral-500 italic mt-1.5 font-mono">
                    {isEn ? 'PENDING' : 'ATTESA'}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Night Station Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Team & Location (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-neutral-950 border-4 border-neutral-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-800">
              <div>
                <span className="text-[10px] font-mono font-black text-orange-400 uppercase tracking-wider">
                  {isEn ? 'OPERATIONAL SECTOR' : 'SETTORE OPERATIVO'}
                </span>
                <h3 className="font-black text-base text-white uppercase">{selectedScenario.title}</h3>
              </div>
              <span className="px-3 py-1 bg-orange-500 text-black text-xs font-black font-mono uppercase">
                {isEn ? `TEAM ${selectedScenario.teamId}` : `SQ. ${selectedScenario.teamId}`}
              </span>
            </div>

            <div className="text-xs space-y-2.5 font-medium">
              <div className="flex items-center gap-2 text-neutral-300">
                <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{isEn ? 'LOCATION:' : 'UBICAZIONE:'} <strong className="text-white uppercase font-black">{selectedScenario.location}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Users className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span>FACULTY TUTOR: <strong className="text-white uppercase font-bold">{assignedFaculty?.name}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{isEn ? 'CATEGORY:' : 'CATEGORIA:'} <strong className="text-white uppercase font-bold">{selectedScenario.category}</strong></span>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-neutral-800">
              <span className="text-[11px] uppercase tracking-[0.2em] font-black text-neutral-400 block mb-2">
                {isEn ? `5 LEARNERS (TEAM ${selectedScenario.teamId}):` : `5 DISCENTI (SQUADRA ${selectedScenario.teamId}):`}
              </span>
              <ul className="space-y-1.5 font-medium">
                {teamDiscenti.map((d) => (
                  <li key={d.id} className="text-xs text-neutral-200 flex items-center justify-between p-1.5 bg-neutral-900 border border-neutral-800">
                    <span className="font-bold uppercase">{d.name}</span>
                    <span className="text-[10px] font-mono text-neutral-400">{translateRoleOrSpecialty(d.role.split('/')[0], language)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Presentation, Protesi & Interactive Triage (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-neutral-950 border-4 border-neutral-800 p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b-2 border-neutral-800">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {isEn ? 'CLINICAL PICTURE & INJURIES' : 'QUADRO CLINICO & LESIONI'} • {selectedScenario.teamName}
                </h3>
                <p className="text-xs text-neutral-400 font-medium mt-0.5">
                  {isEn ? 'Night stress assessment under restricted tactical illumination' : 'Valutazione sotto stress notturno con illuminazione tattica ridotta'}
                </p>
              </div>

              {selectedScenario.triageAssigned && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-neutral-400">TRIAGE:</span>
                  <span
                    className={`px-3 py-1 text-xs font-black uppercase border-2 ${
                      triageOptions.find((t) => t.code === selectedScenario.triageAssigned)?.bg
                    } ${
                      triageOptions.find((t) => t.code === selectedScenario.triageAssigned)?.text
                    } ${
                      triageOptions.find((t) => t.code === selectedScenario.triageAssigned)?.border
                    }`}
                  >
                    {selectedScenario.triageAssigned}
                  </span>
                </div>
              )}
            </div>

            {/* Lesioni Card */}
            <div className="p-4 bg-neutral-900 border-2 border-red-900/60 space-y-2">
              <span className="text-xs font-black text-red-400 uppercase tracking-[0.2em] block">
                {isEn ? 'CASUALTY PRESENTED INJURIES:' : 'LESIONI PRESENTATE DAL FERITO:'}
              </span>
              <ul className="space-y-1.5">
                {selectedScenario.injuries.map((les, idx) => (
                  <li key={idx} className="text-xs text-neutral-200 flex items-start gap-2 font-medium">
                    <span className="w-2 h-2 bg-red-500 mt-1 flex-shrink-0"></span>
                    <span className="font-bold">{les}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Procedures Expected */}
            <div className="p-4 bg-neutral-900 border-2 border-neutral-700 space-y-2">
              <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em] block">
                {isEn ? 'REQUIRED NIGHT TCCC PROCEDURES:' : 'PROCEDURE TCCC NOTTURNE RICHIESTE:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedScenario.procedures.map((proc, i) => (
                  <div key={i} className="p-2.5 bg-neutral-950 border border-neutral-800 text-xs font-mono font-bold text-neutral-200">
                    ✓ {proc}
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Triage Code Assignment */}
            <div className="pt-4 border-t-2 border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-orange-500" />
                  {isEn ? 'ASSIGN TRIAGE PRIORITY CODE (START / SALT):' : 'ASSEGNA CODICE DI PRIORITÀ TRIAGE (START / SALT):'}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {triageOptions.map((opt) => {
                  const isAssigned = selectedScenario.triageAssigned === opt.code;
                  return (
                    <button
                      key={opt.code}
                      onClick={() => handleTriageSelect(opt.code)}
                      className={`p-3.5 border-2 text-center transition-all cursor-pointer ${
                        isAssigned
                          ? `${opt.bg} ${opt.text} font-black shadow-xl ring-2 ring-neutral-100 border-neutral-100 scale-[1.02]`
                          : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-500'
                      }`}
                    >
                      <div className="text-xs font-black uppercase tracking-wider">{opt.label.split(' ')[0]}</div>
                      <div className="text-[10px] font-mono opacity-90 mt-0.5">{opt.label.split('(')[1]?.replace(')', '')}</div>
                      {isAssigned && (
                        <div className="text-[10px] font-black uppercase mt-1">✓ {isEn ? 'ASSIGNED' : 'ASSEGNATO'}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BroadcastModal isOpen={isBroadcastOpen} onClose={() => setIsBroadcastOpen(false)} />
    </div>
  );
};
