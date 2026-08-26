import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  GraduationCap,
  HeartHandshake,
  MessageSquare,
  Radio,
  Send,
  ShieldCheck,
  Star,
  Stethoscope,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Faculty, Team, TeamEvaluation } from '../../types';
import { getTeamCodeName } from '../../utils/teamUtils';

interface EvaluationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  faculty: Faculty | undefined;
  evaluation: TeamEvaluation | undefined;
  scenarioCode?: string;
  onSendReminderToFaculty?: (faculty: Faculty) => void;
  onOpenDirectEvaluation?: (teamId: number) => void;
}

export const EvaluationSummaryModal: React.FC<EvaluationSummaryModalProps> = ({
  isOpen,
  onClose,
  team,
  faculty,
  evaluation,
  scenarioCode,
  onSendReminderToFaculty,
  onOpenDirectEvaluation,
}) => {
  const [reminderSent, setReminderSent] = useState(false);

  if (!isOpen) return null;

  const isEvaluated = Boolean(evaluation);

  const handleSendReminder = () => {
    if (faculty && onSendReminderToFaculty) {
      onSendReminderToFaculty(faculty);
    }
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 3000);
  };

  // Compute average score
  const avgScore = evaluation?.scores
    ? (
        (evaluation.scores.abcdeApproach +
          evaluation.scores.technicalSkills +
          evaluation.scores.teamworkLeadership +
          evaluation.scores.handoverSbar +
          evaluation.scores.safetyTiming) /
        5
      ).toFixed(1)
    : '0.0';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-neutral-950 border-3 border-emerald-500 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b-2 flex items-center justify-between ${
            isEvaluated
              ? 'bg-emerald-950/80 border-emerald-500'
              : 'bg-amber-950/80 border-amber-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 font-black text-black flex-shrink-0 ${
                isEvaluated ? 'bg-emerald-400' : 'bg-amber-500 animate-pulse'
              }`}
            >
              {isEvaluated ? <Award className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase font-mono tracking-widest px-2 py-0.5 bg-black/60 border border-white/20 text-white">
                  DEBRIEFING & VALUTAZIONE CLINICA • {getTeamCodeName(team)}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase mt-0.5">
                {isEvaluated
                  ? '✅ Valutazione Registrata dal Tutor'
                  : '⚠️ Valutazione In Attesa (Feedback Pending)'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 transition-colors cursor-pointer bg-neutral-900 border border-neutral-800"
            aria-label="Chiudi finestra"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Squad & Tutor Header Bar */}
          <div className="bg-neutral-900 border border-neutral-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 rounded-full border-2 border-white flex-shrink-0"
                style={{ backgroundColor: team.color }}
              />
              <div>
                <span className="text-sm font-black text-white uppercase">{getTeamCodeName(team)}</span>
                <span className="text-[11px] text-neutral-400 font-mono block">
                  Gruppo {team.groupId} • {scenarioCode || 'Scenario Operativo'}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                FACULTY / TUTOR ASSEGNATO:
              </span>
              <span className="text-white font-bold text-xs">
                {faculty ? faculty.name : 'Faculty di postazione'}
              </span>
              {faculty?.organization && (
                <span className="text-[10px] text-neutral-400 block">{faculty.organization}</span>
              )}
            </div>
          </div>

          {/* EVALUATION SUBMITTED VIEW */}
          {isEvaluated && evaluation && (
            <div className="space-y-4">
              {/* Score Average Banner */}
              <div className="bg-gradient-to-r from-emerald-950 to-neutral-900 border-2 border-emerald-600 p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-black tracking-widest block">
                    PUNTEGGIO MEDIO GLOBALE:
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black font-mono text-emerald-400">
                      {avgScore} / 5.0
                    </span>
                    <span className="text-xs text-neutral-300 font-semibold">
                      Performance Debriefing
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-neutral-400">
                  <span>Registrata il {new Date(evaluation.timestamp).toLocaleDateString('it-IT')}</span>
                  <span className="block text-emerald-400 font-bold">
                    ore {new Date(evaluation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Rubric Breakdown Grid */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase text-neutral-300 font-mono flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  DETTAGLIO RUBRICA DI VALUTAZIONE (SCALA 1 - 5):
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: 'Approccio ABCDE', val: evaluation.scores.abcdeApproach },
                    { label: 'Abilità Tecniche', val: evaluation.scores.technicalSkills },
                    { label: 'Teamwork & Leadership', val: evaluation.scores.teamworkLeadership },
                    { label: 'Handover SBAR', val: evaluation.scores.handoverSbar },
                    { label: 'Safety & Timing', val: evaluation.scores.safetyTiming },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-900 border border-neutral-800 p-2.5 flex flex-col justify-between gap-1"
                    >
                      <span className="text-[10px] font-mono text-neutral-400 truncate">
                        {item.label}
                      </span>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, sIdx) => (
                            <Star
                              key={sIdx}
                              className={`w-3 h-3 ${
                                sIdx < item.val
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-neutral-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-mono font-black text-white">{item.val}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Procedure Completate */}
              {evaluation.proceduresCompleted && evaluation.proceduresCompleted.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-black block">
                    PROCEDURE CLINICO-CHIRURGICHE COMPLETATE CORRETTAMENTE:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.proceduresCompleted.map((proc, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs font-bold flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        {proc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Punti di Forza e Criticità */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PUNTI DI FORZA EMERSI:
                  </span>
                  <p className="text-neutral-200 text-xs leading-relaxed">
                    {evaluation.strengths || 'Ottima aderenza alle linee guida e leadership condivisa.'}
                  </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-1.5">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-black flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> CRITICITÀ & MARGINI DI MIGLIORAMENTO:
                  </span>
                  <p className="text-neutral-200 text-xs leading-relaxed">
                    {evaluation.criticalIssues ||
                      'Migliorare la fluidità dell\'handover SBAR e la gestione temporale delle manovre.'}
                  </p>
                </div>
              </div>

              {/* Action Items Debriefing */}
              {evaluation.debriefingActionItems && (
                <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-black block">
                    TAKE-AWAY & ACTION ITEMS PER IL DEBRIEFING:
                  </span>
                  <p className="text-neutral-200 text-xs font-medium">
                    {evaluation.debriefingActionItems}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* EVALUATION PENDING VIEW */}
          {!isEvaluated && (
            <div className="space-y-4">
              <div className="bg-amber-950/40 border-2 border-amber-500 p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-black mx-auto flex items-center justify-center font-black animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-amber-300 uppercase">
                    FEEDBACK POST-MODULO NON ANCORA INVIATO
                  </h4>
                  <p className="text-neutral-300 text-xs max-w-md mx-auto leading-relaxed">
                    Il modulo pratico è terminato, ma il Faculty Tutor assegnato (
                    <strong className="text-white">{faculty ? faculty.name : 'Tutor di squadra'}</strong>
                    ) non ha ancora inviato la scheda di valutazione e scoring per la squadra.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleSendReminder}
                    className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Radio className="w-4 h-4" />
                    <span>SOLLECITA TUTOR VIA RADIO / APP</span>
                  </button>

                  {onOpenDirectEvaluation && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenDirectEvaluation(team.id);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase border border-neutral-600 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 text-cyan-400" />
                      <span>COMPILA DA REGIA MASTER</span>
                    </button>
                  )}
                </div>

                {reminderSent && (
                  <div className="pt-2 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Sollecito di debriefing inviato con successo al
                    dispositivo del Faculty!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-900 border-t border-neutral-800 p-4 flex items-center justify-between">
          <span className="text-[11px] font-mono text-neutral-400">
            Debriefing & Scoring Matrix • Sistema Trauma Course
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase cursor-pointer"
          >
            CHIUDI
          </button>
        </div>
      </div>
    </div>
  );
};
