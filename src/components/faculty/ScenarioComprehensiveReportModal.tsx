import React from 'react';
import {
  X,
  FileText,
  MapPin,
  Clock,
  User,
  Users,
  HeartPulse,
  Target,
  Shield,
  Activity,
  CheckCircle2,
  Stethoscope,
  AlertTriangle,
  Flame,
  Building,
  Wrench,
  GraduationCap
} from 'lucide-react';
import { GroupActivitySlot, GroupType, SimulatorPatient, Team, Faculty, Technician } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { translateLocation } from '../../utils/courseTranslation';

interface ScenarioComprehensiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: GroupType;
  groupActivity: GroupActivitySlot;
  timeRange: string;
  patients: SimulatorPatient[];
  teams: Team[];
  facultyList: Faculty[];
  technicians: Technician[];
}

export const ScenarioComprehensiveReportModal: React.FC<ScenarioComprehensiveReportModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupActivity,
  timeRange,
  patients,
  teams,
  facultyList,
  technicians,
}) => {
  const { language } = useCourse();
  const isEn = language === 'en';

  if (!isOpen) return null;

  const assignedTeams = teams.filter((t) => t.groupId === groupId);
  const partnerTeams = groupActivity.partnerGroup
    ? teams.filter((t) => t.groupId === groupActivity.partnerGroup)
    : [];

  const involvedFaculty = (groupActivity.facultyInvolved || [])
    .map((facId) => facultyList.find((f) => f.id === facId || f.badgeCode?.toLowerCase() === facId.toLowerCase()))
    .filter(Boolean) as Faculty[];

  const displayedFaculty =
    involvedFaculty.length > 0
      ? involvedFaculty
      : (assignedTeams
          .map((t) => facultyList.find((f) => f.assignedTeamId === t.id))
          .filter(Boolean) as Faculty[]);

  const assignedPatients = (groupActivity.patientIds || [])
    .map((pId) => patients.find((p) => p.id === pId))
    .filter(Boolean) as SimulatorPatient[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-neutral-950 border-3 border-amber-500 max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-neutral-100 font-mono">
        
        {/* Header */}
        <div className="bg-neutral-900 border-b-2 border-amber-500/80 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 text-black font-black flex items-center justify-center rounded shadow">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-600 rounded">
                  {isEn ? `COMPREHENSIVE SCENARIO REPORT • GROUP ${groupId}` : `RESOCONTO COMPLETO SCENARIO • GRUPPO ${groupId}`}
                </span>
                <span className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {timeRange}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
                {groupActivity.title || (isEn ? 'Tactical / Clinical Scenario Detail' : 'Dettaglio Scenario Tattico / Clinico')}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-neutral-900 hover:bg-red-600/20 text-neutral-400 hover:text-red-400 border border-neutral-700 hover:border-red-500 rounded flex items-center justify-center transition-all cursor-pointer"
            title={isEn ? "Close Window" : "Chiudi Finestra"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Subtitle & Description */}
          <div className="bg-neutral-900 p-4 border border-neutral-800 rounded space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              {isEn ? 'Operational Summary & Subtitle:' : 'Sintesi Operativa & Sottotitolo:'}
            </span>
            <p className="text-sm font-bold text-white">
              {groupActivity.subtitle || (isEn ? 'No subtitle specified.' : 'Nessun sottotitolo specificato.')}
            </p>
            {groupActivity.description && (
              <p className="text-xs text-neutral-300 leading-relaxed pt-1 border-t border-neutral-800">
                {groupActivity.description}
              </p>
            )}
          </div>

          {/* Location & Teams & Faculty Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location */}
            <div className="bg-neutral-900 p-4 border border-neutral-800 rounded space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                {isEn ? 'Location & Station:' : 'Ubicazione & Postazione:'}
              </span>
              <strong className="text-amber-400 text-sm block flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {groupActivity.location ? translateLocation(groupActivity.location, language) : (isEn ? 'Tactical Env. / Shock Room' : 'Ambiente Tattico / Shock Room')}
              </strong>
              {groupActivity.partnerGroup && (
                <span className="text-xs text-cyan-300 block pt-1">
                  {isEn ? `Handover Partner: Group ${groupActivity.partnerGroup}` : `Partner Handover: Gruppo ${groupActivity.partnerGroup}`}
                </span>
              )}
            </div>

            {/* Assigned Teams */}
            <div className="bg-neutral-900 p-4 border border-neutral-800 rounded space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                {isEn ? 'Involved Teams:' : 'Squadre Coinvolte:'}
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {assignedTeams.length > 0 ? (
                  assignedTeams.map((t) => (
                    <span key={t.id} className="px-2 py-0.5 bg-neutral-950 border border-amber-500/50 text-amber-300 text-xs font-bold rounded">
                      {isEn ? 'Team' : 'Squadra'} {t.name} ({isEn ? 'Team' : 'Sq.'} {t.id})
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-neutral-400">{isEn ? 'Group' : 'Gruppo'} {groupId}</span>
                )}
                {partnerTeams.map((t) => (
                  <span key={t.id} className="px-2 py-0.5 bg-neutral-950 border border-cyan-500/50 text-cyan-300 text-xs font-bold rounded">
                    Partner: {isEn ? 'Team' : 'Sq.'} {t.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Faculty Tutor */}
            <div className="bg-neutral-900 p-4 border border-neutral-800 rounded space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                {isEn ? 'Assigned Faculty Tutor:' : 'Faculty Tutor Assegnato:'}
              </span>
              <div className="space-y-1 pt-0.5">
                {displayedFaculty.length > 0 ? (
                  displayedFaculty.map((f) => (
                    <div key={f.id} className="text-xs">
                      <strong className="text-white">{f.badgeCode} • {f.name}</strong>
                      <span className="text-neutral-400 block text-[11px]">{f.title || f.specialty}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-neutral-400">
                    {isEn ? 'No specific tutor registered' : 'Nessun tutor specifico registrato'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Patients & Simulator Details Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 border-b border-neutral-800 pb-2">
              <HeartPulse className="w-4 h-4 text-amber-400" /> {isEn ? `Assigned Patients & Simulators (${assignedPatients.length})` : `Pazienti & Simulatori Assegnati (${assignedPatients.length})`}
            </h3>

            {assignedPatients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedPatients.map((patient) => (
                  <div key={patient.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded space-y-3 shadow">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <span className="px-2.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700 font-black text-xs rounded">
                        {isEn ? 'PATIENT ID' : 'PAZIENTE ID'} #{patient.id} • {patient.scenarioCode}
                      </span>
                      <span className="text-xs font-bold text-amber-400">{patient.title || patient.name || (isEn ? `Patient ${patient.id}` : `Paziente ${patient.id}`)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-neutral-950 p-2 border border-neutral-800">
                        <span className="text-neutral-400 block text-[10px]">{isEn ? 'Moulage Level:' : 'Livello Moulage:'}</span>
                        <strong className="text-cyan-300">{patient.moulageLevel || (isEn ? 'Advanced' : 'Avanzato')}</strong>
                      </div>
                      <div className="bg-neutral-950 p-2 border border-neutral-800">
                        <span className="text-neutral-400 block text-[10px]">{isEn ? 'Hardware / Simulators:' : 'Hardware / Simulatori:'}</span>
                        <strong className="text-emerald-400">{patient.simulatori || (isEn ? 'High-Fidelity Mannequin' : 'Manichino Alta Fedeltà')}</strong>
                      </div>
                    </div>

                    {patient.lesioni && patient.lesioni.length > 0 && (
                      <div className="text-xs text-neutral-300 bg-neutral-950 p-2 border border-neutral-800">
                        <span className="text-neutral-400 block text-[10px] uppercase font-bold">{isEn ? 'Primary Injuries:' : 'Lesioni Principali:'}</span>
                        <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-200">
                          {patient.lesioni.map((les, lIdx) => (
                            <li key={lIdx}>{les}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {patient.dinamicaDelleLesioni && (
                      <div className="text-xs text-neutral-300 bg-neutral-950 p-2 border border-neutral-800">
                        <span className="text-neutral-400 block text-[10px] uppercase font-bold">{isEn ? 'Injury Dynamics & Briefing:' : 'Dinamica Lesionale & Briefing:'}</span>
                        <p className="mt-0.5">{patient.dinamicaDelleLesioni || patient.briefing}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-neutral-900 p-6 text-center text-neutral-400 text-xs border border-neutral-800">
                {isEn ? 'No simulator patient directly associated with this specific hourly activity.' : 'Nessun paziente simulatore direttamente associato a questa specifica attività oraria.'}
              </div>
            )}
          </div>

          {/* Tactical & Clinical Checklist / Objectives */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 border-b border-neutral-800 pb-2">
              <Target className="w-4 h-4 text-amber-400" /> {isEn ? 'Educational Objectives & Procedural Checklist' : 'Obiettivi Didattici & Checklist Procedurale'}
            </h3>
            <div className="bg-neutral-900 p-4 border border-neutral-800 rounded space-y-2 text-xs text-neutral-300">
              <ul className="list-disc list-inside space-y-1.5 font-mono">
                <li>
                  <strong className="text-white">{isEn ? 'TCCC Hemorrhage Control: ' : 'Controllo Emorragico TCCC: '}</strong>
                  {isEn ? 'Correct application of high-and-tight tourniquet and early wound packing.' : 'Applicazione corretta di tourniquet ad alto blocco e wound packing precoce.'}
                </li>
                <li>
                  <strong className="text-white">{isEn ? 'Systematic ABCDE Approach: ' : 'Approccio Sistematico ABCDE: '}</strong>
                  {isEn ? 'Primary and secondary survey in tactical environment and Shock Room.' : 'Valutazione primaria e secondaria in ambiente tattico e in Shock Room.'}
                </li>
                <li>
                  <strong className="text-white">{isEn ? 'Structured SBAR Handover: ' : 'Handover SBAR Strutturato: '}</strong>
                  {isEn ? 'Standardized handover between TCCC team and Shock Room team at minute :30.' : 'Passaggio di consegne standardizzato tra team TCCC e team Shock Room al minuto :30.'}
                </li>
                <li>
                  <strong className="text-white">{isEn ? 'Debriefing & Safety: ' : 'Debriefing & Safety: '}</strong>
                  {isEn ? 'Joint review of operational issues and intervention times.' : 'Revisione collegiale delle criticità operative e dei tempi di intervento.'}
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-neutral-900 border-t-2 border-neutral-800 p-4 flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-mono">
            {isEn ? 'Tactical Emergencies & Trauma Team Course Official Registry' : 'Registro Ufficiale Corso Emergenze Tattiche & Trauma Team'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer shadow"
          >
            {isEn ? 'Close Report' : 'Chiudi Resoconto'}
          </button>
        </div>

      </div>
    </div>
  );
};
