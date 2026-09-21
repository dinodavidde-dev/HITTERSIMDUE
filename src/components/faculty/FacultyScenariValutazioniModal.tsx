import React, { useState } from 'react';
import {
  X,
  FileText,
  Shield,
  HeartPulse,
  CheckCircle2,
  Clock,
  Award,
  Star,
  Activity,
  MapPin,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { Faculty, SimulatorPatient, TeamEvaluation, GroupType } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { ScenarioEvaluationModal } from './ScenarioEvaluationModal';
import { ScenarioStatusBadge } from '../ScenarioStatusBadge';
import { getScenarioStatusInfo } from '../../utils/scenarioStatusHelper';

interface FacultyScenariValutazioniModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFaculty: Faculty;
  simulatorPatients: SimulatorPatient[];
  evaluations: TeamEvaluation[];
}

export const FacultyScenariValutazioniModal: React.FC<FacultyScenariValutazioniModalProps> = ({
  isOpen,
  onClose,
  currentFaculty,
  simulatorPatients,
  evaluations,
}) => {
  const { saveEvaluation, activeDay, activeSlotIndex, teams, faculty } = useCourse();
  const [selectedPatientForEval, setSelectedPatientForEval] = useState<SimulatorPatient | null>(null);

  if (!isOpen) return null;

  const teamId = currentFaculty.assignedTeamId;
  const assignedTeam = teams.find((t) => t.id === teamId);
  const facultyGroup: GroupType = assignedTeam ? assignedTeam.groupId : (teamId <= 3 ? 'A' : teamId <= 6 ? 'B' : teamId <= 9 ? 'C' : 'D');

  // Filter simulator patients assigned to this faculty's team (either Extra/TCCC or Intra/Shock Room)
  const teamPatients = simulatorPatients.filter(
    (p) => p.teamExtraAssigned === teamId || p.teamIntraAssigned === teamId
  );

  const teamEvaluations = evaluations.filter((ev) => ev.facultyId === currentFaculty.id || ev.teamId === teamId);

  // Helper to determine if a scenario has been executed according to master timeline
  const checkIfExecuted = (patient: SimulatorPatient) => {
    // If course day is past the patient day, it's executed
    if (activeDay > patient.day) return true;
    if (activeDay < patient.day) return false;

    // If same day, find the index of the slot in INITIAL_TIMELINE_SLOTS where this patient is involved for facultyGroup
    const daySlots = INITIAL_TIMELINE_SLOTS.filter((s) => s.day === patient.day);
    const slotIndex = daySlots.findIndex((slot) => {
      if (!slot.groupActivities) return false;
      const act: any = slot.groupActivities[facultyGroup];
      return act && act.patientIds && act.patientIds.includes(patient.id);
    });

    if (slotIndex === -1) {
      // Fallback based on patient id distribution (Day 2: 1-6 matt, 7-12 pom; Day 3: 13-18 matt, 19-24 pom)
      const isMattina = patient.id % 6 <= 3 && patient.id % 6 !== 0;
      const currentIsMattina = activeSlotIndex < 4;
      return !isMattina || !currentIsMattina;
    }

    return activeSlotIndex > slotIndex;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-neutral-950 border-3 border-amber-500 max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-neutral-100 font-mono">
        
        {/* Header */}
        <div className="bg-neutral-900 border-b-2 border-amber-500/80 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 text-black font-black flex items-center justify-center rounded shadow">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-600 rounded">
                  PORTALE SCENARI & VALUTAZIONI • SQUADRA {teamId}
                </span>
                <span className="text-xs px-2 py-0.5 bg-neutral-800 text-amber-400 border border-neutral-700">
                  Tutor: {currentFaculty.badgeCode} • {currentFaculty.name}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
                Elenco Scenari Assegnati & Stato Esecuzione
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-neutral-900 hover:bg-red-600/20 text-neutral-400 hover:text-red-400 border border-neutral-700 hover:border-red-500 rounded flex items-center justify-center transition-all cursor-pointer"
            title="Chiudi Finestra"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="bg-neutral-900 p-4 border border-neutral-800 rounded flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs text-amber-400 font-bold uppercase block">Istruzioni operative:</span>
              <p className="text-xs text-neutral-300">
                Gli scenari completati secondo la timeline master richiedono la compilazione della scheda. Clicca su uno scenario per compilare o aggiornare la valutazione.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-950 border border-amber-600 text-xs font-bold text-amber-300">
              {teamEvaluations.length} Valutazioni Registrate
            </span>
          </div>

          {/* Scenari List */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 border-b border-neutral-800 pb-2">
              <Activity className="w-4 h-4 text-amber-400" /> Scenari Assegnati alla Squadra {teamId} ({teamPatients.length})
            </h3>

            {teamPatients.length > 0 ? (
              <div className="space-y-4">
                {teamPatients.map((patient) => {
                  const isExtra = patient.teamExtraAssigned === teamId;
                  const phaseLabel = isExtra ? 'TCCC (Ambiente Tattico)' : 'Shock Room (ED)';
                  const locationLabel = isExtra ? `Ambiente Tattico ${patient.id % 3 === 1 ? '1' : patient.id % 3 === 2 ? '2' : '3'}` : 'Box Shock Room';
                  
                  const isExecuted = checkIfExecuted(patient);
                  const existingEval = evaluations.find(
                    (e) => e.teamId === teamId && e.patientId === patient.id
                  );
                  const isEvaluated = Boolean(existingEval);

                  // Determine card styling based on state
                  const statusInfo = getScenarioStatusInfo(patient, activeDay, activeSlotIndex, evaluations, faculty);
                  let cardStyle = "bg-neutral-900 border-2 border-neutral-800 hover:border-amber-500";
                  if (statusInfo.status === 'IN_CORSO') {
                    cardStyle = "bg-red-950/40 border-2 border-red-600 animate-pulse shadow-xl shadow-red-600/20";
                  } else if (statusInfo.status === 'DA_VALUTARE') {
                    cardStyle = "bg-yellow-950/40 border-2 border-yellow-400 animate-pulse shadow-xl shadow-yellow-500/20";
                  } else if (statusInfo.status === 'VALUTATO') {
                    cardStyle = "bg-emerald-950/30 border-2 border-emerald-500";
                  }

                  return (
                    <div
                      key={patient.id}
                      onClick={() => {
                        if (statusInfo.status === 'DA_FARE' || statusInfo.status === 'IN_CORSO') {
                          alert("La scheda di valutazione associata a questo scenario è accessibile solo dal momento in cui lo scenario è terminato.");
                          return;
                        }
                        setSelectedPatientForEval(patient);
                      }}
                      className={`${cardStyle} p-5 rounded space-y-3 transition-all ${
                        statusInfo.status === 'DA_FARE' || statusInfo.status === 'IN_CORSO'
                          ? 'opacity-60 cursor-not-allowed'
                          : 'cursor-pointer hover:border-amber-500'
                      } group relative overflow-hidden`}
                    >
                      {/* Status Indicator Badge */}
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <ScenarioStatusBadge patient={patient} />
                        {(statusInfo.status === 'DA_FARE' || statusInfo.status === 'IN_CORSO') && (
                          <span className="px-2 py-1 bg-neutral-950 text-neutral-400 border border-neutral-800 text-[10px] font-bold rounded">
                            🔒 Accessibile a fine scenario
                          </span>
                        )}
                        {statusInfo.status === 'DA_VALUTARE' && (
                          <span className="px-2.5 py-1 bg-yellow-500 text-black font-black text-[10px] uppercase tracking-widest rounded flex items-center gap-1.5 animate-bounce shadow-lg">
                            <AlertTriangle className="w-3.5 h-3.5" /> ⚠️ Richiesta Valutazione
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3 pr-36">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 bg-neutral-950 text-amber-300 border border-amber-700 font-black text-xs rounded">
                            DAY 0{patient.day} • {patient.period.toUpperCase()}
                          </span>
                          <span className="px-2.5 py-0.5 bg-neutral-950 text-cyan-300 border border-cyan-700 font-bold text-xs rounded">
                            {patient.scenarioCode}
                          </span>
                          <span className="px-2.5 py-0.5 bg-neutral-950 text-neutral-300 border border-neutral-700 text-xs font-bold">
                            Paziente ID #{patient.id}
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-neutral-950 text-amber-400 border border-amber-500/50 text-xs font-bold">
                          {phaseLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="bg-neutral-950/80 p-3 border border-neutral-800 space-y-1">
                          <span className="text-neutral-400 text-[10px] uppercase block">Titolo & Postazione:</span>
                          <strong className="text-white block text-sm group-hover:text-amber-300 transition-colors">{patient.title || `Scenario Clinico ${patient.id}`}</strong>
                          <span className="text-amber-400 block flex items-center gap-1 pt-0.5">
                            <MapPin className="w-3.5 h-3.5" /> {locationLabel}
                          </span>
                        </div>

                        <div className="bg-neutral-950/80 p-3 border border-neutral-800 space-y-1">
                          <span className="text-neutral-400 text-[10px] uppercase block">Lesioni Principali:</span>
                          <ul className="list-disc list-inside text-amber-200 space-y-0.5">
                            {patient.lesioni.slice(0, 3).map((l, lIdx) => (
                              <li key={lIdx} className="truncate" title={l}>{l}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-neutral-950/80 p-3 border border-neutral-800 space-y-1">
                          <span className="text-neutral-400 text-[10px] uppercase block">Procedure Richieste:</span>
                          <ul className="list-disc list-inside text-cyan-200 space-y-0.5">
                            {(isExtra ? patient.procedureExtra : patient.procedureIntra).map((p, pIdx) => (
                              <li key={pIdx} className="truncate" title={p}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {patient.dinamicaDelleLesioni && (
                        <div className="bg-neutral-950/80 p-3 border border-neutral-800 text-xs text-neutral-300">
                          <span className="text-neutral-400 text-[10px] uppercase block font-bold">Dinamica & Briefing Clinico:</span>
                          <p className="mt-0.5">{patient.dinamicaDelleLesioni}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-neutral-900 p-8 text-center text-neutral-400 text-xs border border-neutral-800">
                Nessun scenario assegnato a questa squadra.
              </div>
            )}
          </div>

          {/* Storico Valutazioni Assegnate */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" /> Storico Valutazioni Inviate dal Tutor ({teamEvaluations.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {teamEvaluations.length > 0 ? (
                teamEvaluations.map((ev) => (
                  <div key={ev.id} className="bg-neutral-900 border border-neutral-800 p-3 rounded flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-amber-300 font-bold">Day {ev.day} • Squadra {ev.teamId} • Scenario {ev.scenarioCode}</span>
                      <span className="text-neutral-400 block text-[11px]">{ev.timestamp}</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-amber-400 font-black">
                        Score: {((ev.scores.abcdeApproach + ev.scores.technicalSkills + ev.scores.teamworkLeadership + ev.scores.handoverSbar + ev.scores.safetyTiming) / 5).toFixed(1)} / 5.0
                      </strong>
                      <span className="text-emerald-400 block text-[11px]">{ev.phase}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500 font-mono">Nessuna scheda di valutazione registrata per questa squadra.</p>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-neutral-900 border-t-2 border-neutral-800 p-4 flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-mono">
            Assegnazioni Ufficiali Corso Emergenze Tattiche & Trauma Team
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer shadow"
          >
            Chiudi Finestra
          </button>
        </div>

      </div>

      {/* Scenario Evaluation Modal popup when clicking a scenario */}
      {selectedPatientForEval && (
        <ScenarioEvaluationModal
          isOpen={Boolean(selectedPatientForEval)}
          onClose={() => setSelectedPatientForEval(null)}
          patient={selectedPatientForEval}
          currentFaculty={currentFaculty}
          teamId={teamId}
          onSave={(evalData) => {
            saveEvaluation(evalData);
          }}
          existingEvaluation={evaluations.find(
            (e) => e.teamId === teamId && e.patientId === selectedPatientForEval.id
          )}
        />
      )}
    </div>
  );
};
