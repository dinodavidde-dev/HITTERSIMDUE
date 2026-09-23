import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  Star,
  Activity,
  HeartPulse,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { Faculty, SimulatorPatient, TeamEvaluation } from '../../types';
import { useCourse } from '../../context/CourseContext';

interface ScenarioEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: SimulatorPatient;
  currentFaculty: Faculty;
  teamId: number;
  onSave: (evaluation: TeamEvaluation) => void;
  existingEvaluation?: TeamEvaluation;
}

export const ScenarioEvaluationModal: React.FC<ScenarioEvaluationModalProps> = ({
  isOpen,
  onClose,
  patient,
  currentFaculty,
  teamId,
  onSave,
  existingEvaluation,
}) => {
  const { language } = useCourse();
  const isEn = language === 'en';

  if (!isOpen) return null;

  const isExtra = patient.teamExtraAssigned === teamId;
  const phase = isExtra ? 'EXTRA' : 'INTRA';
  const proceduresList = isExtra ? patient.procedureExtra : patient.procedureIntra;

  const [scores, setScores] = useState(
    existingEvaluation?.scores || {
      abcdeApproach: 4,
      technicalSkills: 4,
      teamworkLeadership: 4,
      handoverSbar: 4,
      safetyTiming: 4,
    }
  );

  const [selectedProcedures, setSelectedProcedures] = useState<string[]>(
    existingEvaluation?.proceduresCompleted || []
  );
  const [strengths, setStrengths] = useState(existingEvaluation?.strengths || '');
  const [criticalIssues, setCriticalIssues] = useState(existingEvaluation?.criticalIssues || '');
  const [debriefingActionItems, setDebriefingActionItems] = useState(
    existingEvaluation?.debriefingActionItems || ''
  );
  const [successMsg, setSuccessMsg] = useState('');

  const toggleProcedure = (proc: string) => {
    if (selectedProcedures.includes(proc)) {
      setSelectedProcedures(selectedProcedures.filter((p) => p !== proc));
    } else {
      setSelectedProcedures([...selectedProcedures, proc]);
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEval: TeamEvaluation = {
      id: existingEvaluation?.id || `eval-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      teamId,
      facultyId: currentFaculty.id,
      day: patient.day,
      period: patient.period,
      patientId: patient.id,
      scenarioCode: patient.scenarioCode,
      phase: phase as 'EXTRA' | 'INTRA' | 'WORKSHOP',
      scores,
      proceduresCompleted: selectedProcedures,
      strengths,
      criticalIssues,
      debriefingActionItems,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onSave(newEval);
    setSuccessMsg(isEn ? 'Evaluation form saved successfully!' : 'Scheda di valutazione salvata con successo!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-neutral-950 border-3 border-amber-500 max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-neutral-100 font-mono">
        
        {/* Header */}
        <div className="bg-neutral-900 border-b-2 border-amber-500/80 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 text-black font-black flex items-center justify-center rounded shadow">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-600 rounded">
                  {isEn ? `1:1 SCENARIO EVALUATION • TEAM ${teamId}` : `VALUTAZIONE SCENARIO 1:1 • SQUADRA ${teamId}`}
                </span>
                <span className="text-xs px-2 py-0.5 bg-neutral-800 text-cyan-300 border border-neutral-700">
                  {patient.scenarioCode} • {isEn ? 'Patient' : 'Paziente'} #{patient.id}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-1">
                {patient.title || (isEn ? `Clinical Scenario ${patient.id}` : `Scenario Clinico ${patient.id}`)} ({phase})
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-neutral-900 hover:bg-red-600/20 text-neutral-400 hover:text-red-400 border border-neutral-700 hover:border-red-500 rounded flex items-center justify-center transition-all cursor-pointer"
            title={isEn ? 'Close Window' : 'Chiudi Finestra'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveSubmit} className="p-6 overflow-y-auto space-y-6">
          
          {successMsg && (
            <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 p-3 text-xs font-bold text-center rounded animate-bounce">
              {successMsg}
            </div>
          )}

          {/* Scenario Info Card */}
          <div className="bg-neutral-900 p-4 border border-neutral-800 rounded space-y-2 text-xs">
            <span className="text-amber-400 font-bold uppercase tracking-wider block">{isEn ? 'Clinical Details & Lesions:' : 'Dettagli Clinici & Lesioni:'}</span>
            <p className="text-white font-medium">{patient.dinamicaDelleLesioni || patient.briefing || (isEn ? 'No dynamics specified.' : 'Nessuna dinamica specificata.')}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {patient.lesioni.map((l, lIdx) => (
                <span key={lIdx} className="px-2 py-0.5 bg-neutral-950 text-amber-200 border border-neutral-700 rounded text-[11px]">
                  • {l}
                </span>
              ))}
            </div>
          </div>

          {/* Scoring Grid (1-5) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 border-b border-neutral-800 pb-2">
              <Star className="w-4 h-4 text-amber-400" /> {isEn ? 'Operational Evaluation Criteria (Scale 1 - 5)' : 'Criteri di Valutazione Operativa (Scala 1 - 5)'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'abcdeApproach', label: isEn ? '1. Systematic ABCDE Approach' : '1. Approccio Sistematico ABCDE' },
                { key: 'technicalSkills', label: isEn ? '2. Technical & Manual Skills' : '2. Competenza Tecnica & Manuale' },
                { key: 'teamworkLeadership', label: isEn ? '3. Teamwork & Leadership' : '3. Teamwork & Leadership' },
                { key: 'handoverSbar', label: isEn ? '4. Structured SBAR Handover' : '4. Handover SBAR Strutturato' },
                { key: 'safetyTiming', label: isEn ? '5. Safety & Timing' : '5. Sicurezza & Timing' },
              ].map(({ key, label }) => (
                <div key={key} className="bg-neutral-900 p-3 border border-neutral-800 rounded space-y-1.5">
                  <span className="text-neutral-300 font-bold block">{label}</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const currentVal = (scores as any)[key];
                      const isSelected = currentVal === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setScores({ ...scores, [key]: val })}
                          className={`w-9 h-9 rounded font-black text-xs transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-500 text-black border-amber-400 shadow-md scale-105'
                              : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-600'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                    <span className="ml-auto text-amber-400 font-bold">{(scores as any)[key]}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Procedures Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 border-b border-neutral-800 pb-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" /> {isEn ? 'Correctly Executed Procedures' : 'Procedure Eseguite Correttamente'} ({selectedProcedures.length}/{proceduresList.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {proceduresList.map((proc, pIdx) => {
                const isChecked = selectedProcedures.includes(proc);
                return (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => toggleProcedure(proc)}
                    className={`p-3 rounded border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-amber-500 border-amber-400 text-black font-black' : 'border-neutral-600'}`}>
                      {isChecked && '✓'}
                    </div>
                    <span className="leading-snug">{proc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Debriefing Notes */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
                {isEn ? 'Strengths:' : 'Punti di Forza (Strengths):'}
              </label>
              <textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                rows={2}
                placeholder={isEn ? "E.g. Excellent timely hemorrhage control, effective communication within the team..." : "Es. Ottimo controllo emorragico tempestivo, comunicazione efficace all'interno del team..."}
                className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 rounded text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-red-400 uppercase tracking-widest block">
                {isEn ? 'Critical Issues & Areas for Improvement:' : 'Criticità & Aree di Miglioramento (Critical Issues):'}
              </label>
              <textarea
                value={criticalIssues}
                onChange={(e) => setCriticalIssues(e.target.value)}
                rows={2}
                placeholder={isEn ? "E.g. Delay in secondary tourniquet application, incomplete SBAR handover..." : "Es. Ritardo nel posizionamento del tourniquet secondario, handover SBAR incompleto..."}
                className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 rounded text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
                {isEn ? 'Debriefing Action Items:' : 'Action Items per il Debriefing:'}
              </label>
              <input
                type="text"
                value={debriefingActionItems}
                onChange={(e) => setDebriefingActionItems(e.target.value)}
                placeholder={isEn ? "E.g. Review finger thoracostomy sequence and airway management" : "Es. Ripassare sequenza toracostomia a dito e gestione vie aeree"}
                className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 rounded text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Annulla'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer shadow-lg flex items-center gap-2"
            >
              <Award className="w-4 h-4" /> {isEn ? 'Save Evaluation Form' : 'Salva Scheda Valutazione'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
