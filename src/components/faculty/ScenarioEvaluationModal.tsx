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
      id: existingEvaluation?.id || `eval-t${teamId}-p${patient.id}-${phase.toLowerCase()}`,
      teamId,
      facultyId: currentFaculty.id,
      day: patient.day,
      period: patient.period,
      patientId: patient.id,
      scenarioCode: patient.scenarioCode,
      phase: phase as 'EXTRA' | 'INTRA',
      scores,
      proceduresCompleted: selectedProcedures,
      strengths,
      criticalIssues,
      debriefingActionItems,
      timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
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
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-amber-400 font-bold uppercase tracking-wider block">
                {isEn ? 'Clinical Scenario Details & Lesions:' : 'Dettagli Scenario Clinico & Lesioni:'}
              </span>
              <span className="px-2 py-0.5 bg-neutral-950 text-neutral-400 border border-neutral-800 rounded text-[10px]">
                {isEn ? '⚠️ Workshops WS1 & WS2 excluded from scoring' : '⚠️ Workshop didattici (WS1 & WS2) esclusi dalla valutazione'}
              </span>
            </div>
            <p className="text-white font-medium">{patient.dinamicaDelleLesioni || patient.briefing || (isEn ? 'No dynamics specified.' : 'Nessuna dinamica specificata.')}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {patient.lesioni.map((l, lIdx) => (
                <span key={lIdx} className="px-2 py-0.5 bg-neutral-950 text-amber-200 border border-neutral-700 rounded text-[11px]">
                  • {l}
                </span>
              ))}
            </div>
          </div>

          {/* Scoring Grid (1-5) Aligned to Recharts exposed metrics */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" /> {isEn ? 'Operational Assessment Parameters (Scale 1 - 5)' : 'Parametri di Valutazione Operativa (Scala 1 - 5)'}
              </h3>
              {(() => {
                const currentComposite = (
                  (scores.abcdeApproach +
                    scores.technicalSkills +
                    scores.teamworkLeadership +
                    scores.handoverSbar +
                    scores.safetyTiming) /
                  5
                ).toFixed(1);
                const n = Number(currentComposite);
                const tier =
                  n >= 4.4 ? { label: isEn ? 'GOLD / OUTSTANDING' : 'ECCELLENTE / GOLD', cls: 'bg-emerald-950 text-emerald-300 border-emerald-500' }
                  : n >= 3.8 ? { label: isEn ? 'PROFICIENT / SOLID' : 'SOLIDO / AVANZATO', cls: 'bg-blue-950 text-blue-300 border-blue-500' }
                  : n >= 3.2 ? { label: isEn ? 'DEVELOPING' : 'IN SVILUPPO', cls: 'bg-amber-950 text-amber-300 border-amber-500' }
                  : { label: isEn ? 'DEBRIEF FOCUS' : 'FOCUS DEBRIEFING', cls: 'bg-red-950 text-red-300 border-red-500' };
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-mono">{isEn ? 'Rubric Score:' : 'Media Scheda:'}</span>
                    <strong className="text-white text-sm font-black">{currentComposite} / 5.0</strong>
                    <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${tier.cls}`}>{tier.label}</span>
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs">
              {[
                {
                  key: 'abcdeApproach' as const,
                  label: isEn ? '1. Systematic C-ABCDE Approach Protocol' : '1. Approccio Sistematico Algoritmo C-ABCDE',
                  sub: isEn
                    ? 'Catastrophic hemorrhage control, airway securing, breathing, circulation, dynamic re-evaluation'
                    : 'Emostasi prioritaria immediata (Stop the Bleed), pervietà vie aeree, respiro, circolo, rivalutazione dinamica',
                },
                {
                  key: 'technicalSkills' as const,
                  label: isEn ? '2. Technical Skills & Hemorrhage Control' : '2. Competenze Tecniche & Gestione Emostasi',
                  sub: isEn
                    ? 'Tourniquet application <60s, wound packing, junctional tourniquet, needle decompression 14G'
                    : 'Tourniquet efficace <60s, wound packing emostatico, tourniquet giunzionale, decompressione ago 14G',
                },
                {
                  key: 'teamworkLeadership' as const,
                  label: isEn ? '3. Teamwork & Leadership CRM' : '3. Teamwork & Leadership CRM (Crisis Resource Management)',
                  sub: isEn
                    ? 'Clear leader direction, closed-loop communication, role delegation, avoiding cognitive overload'
                    : 'Leadership incisiva, comunicazione closed-loop ad anello chiuso, ruoli chiari, controllo sovraccarico',
                },
                {
                  key: 'handoverSbar' as const,
                  label: isEn ? '4. Structured SBAR Handover (:30 Timing)' : '4. Handover SBAR al Minuto :30 (Consegna 1:1)',
                  sub: isEn
                    ? 'Litter handover TCCC to Shock Room within 5 min (:30-:35): Situation, Background, Assessment, Recommendation'
                    : 'Passaggio barellato 1:1 TCCC/Shock Room entro 5 min (:30-:35): Situation, Background, Assessment, Recommendation',
                },
                {
                  key: 'safetyTiming' as const,
                  label: isEn ? '5. Operational Safety & Strict Timing' : '5. Sicurezza Operativa & Rispetto dei Tempi',
                  sub: isEn
                    ? 'Scene safety, PPE compliance, strict 90-min slot discipline, active standby at T -15 min'
                    : 'Sicurezza setting/DPI, rispetto del cronoprogramma da 90m, standby attivo nei Box a T -15 minuti',
                },
              ].map(({ key, label, sub }) => (
                <div key={key} className="bg-neutral-900 p-3.5 border border-neutral-800 rounded space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-white font-bold block">{label}</span>
                      <span className="text-[11px] text-neutral-400 block">{sub}</span>
                    </div>
                    <span className="text-amber-400 font-mono font-black text-sm shrink-0">{(scores as any)[key]} / 5.0</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const currentVal = (scores as any)[key];
                      const isSelected = currentVal === val;
                      const levelDescs = isEn
                        ? ['1 - Critical Deficit', '2 - Inadequate', '3 - Acceptable', '4 - Proficient', '5 - Gold Standard']
                        : ['1 - Critico / Non Eseguito', '2 - Insufficiente', '3 - Accettabile', '4 - Avanzato / Ottimo', '5 - Eccellente / Gold'];
                      return (
                        <button
                          key={val}
                          type="button"
                          title={levelDescs[val - 1]}
                          onClick={() => setScores({ ...scores, [key]: val })}
                          className={`flex-1 py-2 rounded font-black text-xs transition-all cursor-pointer border text-center ${
                            isSelected
                              ? 'bg-amber-500 text-black border-amber-300 shadow-md scale-102 font-black'
                              : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-600 hover:text-white'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
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
