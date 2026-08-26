import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Droplet,
  Filter,
  Layers,
  Search,
  Package,
  Sparkles,
  Stethoscope,
  Users,
  Wrench,
} from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';

interface ScenariCatalogViewProps {
  onOpenProtesi?: () => void;
}

export const ScenariCatalogView: React.FC<ScenariCatalogViewProps> = ({ onOpenProtesi }) => {
  const { language, t, simulatorPatients, activeDay, setActiveDay } = useCourse();
  const isEn = language === 'en';

  const [selectedDay, setSelectedDay] = useState<number | 'ALL'>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = simulatorPatients.filter((p) => {
    if (selectedDay !== 'ALL' && p.day !== selectedDay) return false;
    if (selectedPeriod !== 'ALL' && p.period !== selectedPeriod) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchLesioni = p.lesioni.some((l) => l.toLowerCase().includes(term));
      const matchExtra = p.procedureExtra.some((pe) => pe.toLowerCase().includes(term));
      const matchIntra = p.procedureIntra.some((pi) => pi.toLowerCase().includes(term));
      const matchMoulage = p.moulageProtesi.toLowerCase().includes(term);
      const matchSim = p.simulatori.toLowerCase().includes(term);
      const matchCode = p.scenarioCode.toLowerCase().includes(term);
      return matchLesioni || matchExtra || matchIntra || matchMoulage || matchSim || matchCode;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-neutral-950 border-2 border-neutral-700 p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-orange-500 text-black text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <BookOpen className="w-3.5 h-3.5" />
              {isEn ? 'COMPREHENSIVE SCENARIOS & SIMULATORS DATABASE' : 'DATABASE INTEGRALE SCENARI & SIMULATORI'}
            </span>
            <span className="text-[11px] text-neutral-300 font-mono font-bold px-2 py-0.5 bg-neutral-900 border border-neutral-700">
              {isEn ? '24 CLINICAL CASES • 12 TCCC SCENARIOS' : '24 CASI CLINICI • 12 SCENARI TCCC'}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight leading-tight">
            {isEn
              ? 'Detailed Archive: Scenarios, Extra/Intra Procedures & Moulage'
              : 'Archivio Dettagliato Scenari, Procedure Extra/Intra & Moulage'}
          </h2>
          <p className="text-xs text-neutral-300 font-medium leading-relaxed">
            {isEn
              ? 'Specifications from "Scenari simulatori" worksheet, detailing trauma injuries, prehospital/emergency procedures, prosthetics requirements and mannequin hardware.'
              : 'Specifiche tratte dal foglio "Scenari simulatori", con lesioni traumatologiche, procedure extra/intraospedaliere, requisiti protesici di Silvia e hardware manichini.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <LanguageSwitcher variant="badge" />

          {onOpenProtesi && (
            <button
              onClick={onOpenProtesi}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-100 hover:text-black text-white text-xs font-black uppercase tracking-wider border border-neutral-100 transition-all cursor-pointer shadow-md"
            >
              <Package className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEn ? 'PROSTHETICS & MOULAGE' : 'VAI A ELENCO PROTESI'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-neutral-950 border-2 border-neutral-800 p-3 sm:p-3.5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? 'Search procedure (CRIC, REBOA...), injury...' : 'Cerca procedura (CRIC, REBOA...), lesione...'}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 text-xs font-medium text-white focus:outline-hidden focus:border-orange-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Day Filter */}
          <div className="flex items-center bg-neutral-900 p-0.5 border border-neutral-700">
            <button
              onClick={() => setSelectedDay('ALL')}
              className={`px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                selectedDay === 'ALL' ? 'bg-orange-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isEn ? 'ALL DAYS' : 'TUTTI I GIORNI'}
            </button>
            <button
              onClick={() => setSelectedDay(2)}
              className={`px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                selectedDay === 2 ? 'bg-orange-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              DAY 02 (1-12)
            </button>
            <button
              onClick={() => setSelectedDay(3)}
              className={`px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                selectedDay === 3 ? 'bg-orange-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              DAY 03 (13-24)
            </button>
          </div>

          {/* Period Filter */}
          <div className="flex items-center bg-neutral-900 p-1 border-2 border-neutral-700">
            <button
              onClick={() => setSelectedPeriod('ALL')}
              className={`px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                selectedPeriod === 'ALL' ? 'bg-neutral-100 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isEn ? 'ALL' : 'TUTTE'}
            </button>
            <button
              onClick={() => setSelectedPeriod('mattina')}
              className={`px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                selectedPeriod === 'mattina' ? 'bg-neutral-100 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isEn ? 'MORNING' : 'MATTINA'}
            </button>
            <button
              onClick={() => setSelectedPeriod('pomeriggio')}
              className={`px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                selectedPeriod === 'pomeriggio' ? 'bg-neutral-100 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isEn ? 'AFTERNOON' : 'POMERIGGIO'}
            </button>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            id={`catalog-patient-${patient.id}`}
            className="bg-neutral-950 border-4 border-neutral-800 overflow-hidden shadow-2xl flex flex-col justify-between hover:border-neutral-100 transition-all"
          >
            {/* Top Bar */}
            <div className="p-4 bg-neutral-900 border-b-2 border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-orange-500 text-black font-black text-xs uppercase tracking-wider">
                  {isEn ? `PATIENT #${patient.id}` : `PAZIENTE #${patient.id}`}
                </span>
                <span className="text-xs px-2 py-0.5 bg-neutral-950 text-neutral-300 font-mono font-bold border border-neutral-700">
                  {patient.scenarioCode}
                </span>
              </div>
              <span className="text-[11px] font-mono font-black text-neutral-300 uppercase">
                DAY 0{patient.day} • {patient.period === 'mattina' ? (isEn ? 'MORNING' : 'MATTINA') : (isEn ? 'AFTERNOON' : 'POMERIGGIO')}
              </span>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 flex-1">
              {/* Lesions list */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-neutral-400 tracking-[0.2em] block">
                  {isEn ? 'TRAUMA INJURIES:' : 'LESIONI TRAUMATOLOGICHE:'}
                </span>
                <ul className="space-y-1.5">
                  {patient.lesioni.map((les, i) => (
                    <li key={i} className="text-xs text-neutral-200 flex items-start gap-1.5 font-medium">
                      <span className="text-orange-500 font-black">•</span>
                      <span>{les}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Procedures Matrix (Extra vs Intra) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t-2 border-neutral-800">
                <div className="p-3 bg-neutral-900 border-2 border-red-900/60 space-y-1">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-wider block">
                    {isEn ? 'OUT-OF-HOSPITAL PROC:' : 'PROCEDURE EXTRA:'}
                  </span>
                  <div className="space-y-1">
                    {patient.procedureExtra.map((pe, idx) => (
                      <div key={idx} className="text-[11px] text-red-200 font-mono font-bold">
                        {pe}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-neutral-900 border-2 border-orange-900/60 space-y-1">
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider block">
                    {isEn ? 'IN-HOSPITAL ED PROC:' : 'PROCEDURE INTRA ED:'}
                  </span>
                  <div className="space-y-1">
                    {patient.procedureIntra.map((pi, idx) => (
                      <div key={idx} className="text-[11px] text-orange-200 font-mono font-bold">
                        {pi}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Moulage & Simulator */}
              <div className="space-y-2 pt-2 border-t-2 border-neutral-800 text-xs font-medium">
                <div className="flex items-start gap-2">
                  <Droplet className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-400 font-black text-[10px] uppercase block">
                      {isEn ? 'MOULAGE / PROSTHETICS (SILVIA):' : 'MOULAGE / PROTESI (SILVIA):'}
                    </span>{' '}
                    <span className="text-rose-300 font-mono font-bold">{patient.moulageProtesi}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Wrench className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-400 font-black text-[10px] uppercase block">
                      {isEn ? 'HARDWARE SIMULATOR:' : 'SIMULATORE HARDWARE:'}
                    </span>{' '}
                    <span className="text-neutral-200 font-bold">{patient.simulatori}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="px-4 py-3 bg-neutral-900 border-t-2 border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-400" />
                <span className="font-bold">
                  {patient.attoriCount} {isEn ? 'Simulated Actor(s)' : 'Attore/i simulato/i'}
                </span>
              </div>
              <div className="font-mono font-black text-neutral-200">
                {isEn ? `TEAM ${patient.teamExtraAssigned} ➔ TEAM ${patient.teamIntraAssigned}` : `SQ. ${patient.teamExtraAssigned} ➔ SQ. ${patient.teamIntraAssigned}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
