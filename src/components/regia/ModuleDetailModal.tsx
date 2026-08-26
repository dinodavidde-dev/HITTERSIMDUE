import React from 'react';
import {
  Activity,
  AlertTriangle,
  Building,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Flame,
  Globe,
  GraduationCap,
  HeartPulse,
  Info,
  MapPin,
  MessageSquare,
  Shield,
  Stethoscope,
  Target,
  User,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { GroupActivitySlot, GroupType, SimulatorPatient, Team, Faculty, Technician } from '../../types';

interface ModuleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: GroupType;
  groupActivity: GroupActivitySlot;
  timeRange: string;
  isNext?: boolean;
  patients: SimulatorPatient[];
  teams: Team[];
  facultyList: Faculty[];
  technicians: Technician[];
  onOpenProtesiModal?: () => void;
  onOpenCriticalityModal?: (patientId: number) => void;
}

export const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupActivity,
  timeRange,
  isNext = false,
  patients,
  teams,
  facultyList,
  technicians,
  onOpenProtesiModal,
  onOpenCriticalityModal,
}) => {
  if (!isOpen) return null;

  const assignedTeams = teams.filter((t) => t.groupId === groupId);
  const partnerTeams = groupActivity.partnerGroup
    ? teams.filter((t) => t.groupId === groupActivity.partnerGroup)
    : [];

  const involvedFaculty = (groupActivity.facultyInvolved || [])
    .map((facId) => facultyList.find((f) => f.id === facId))
    .filter(Boolean) as Faculty[];

  // If no faculty explicitly in slot, fallback to teams' assigned faculty
  const displayedFaculty =
    involvedFaculty.length > 0
      ? involvedFaculty
      : (assignedTeams
          .map((t) => facultyList.find((f) => f.assignedTeamId === t.id))
          .filter(Boolean) as Faculty[]);

  const isScenario =
    groupActivity.activityType === 'scenario_extra' ||
    groupActivity.activityType === 'scenario_intra' ||
    groupActivity.activityType === 'night_scenario';

  const isScenarioExtra = groupActivity.activityType === 'scenario_extra';
  const isScenarioIntra = groupActivity.activityType === 'scenario_intra';
  const isWorkshop =
    groupActivity.activityType === 'workshop' || groupActivity.activityType === 'skills';
  const isDebriefing = groupActivity.activityType === 'debriefing';

  // Specific patient details if scenario
  const assignedPatients = (groupActivity.patientIds || [])
    .map((pId) => patients.find((p) => p.id === pId))
    .filter(Boolean) as SimulatorPatient[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-neutral-950 border-3 border-neutral-700 max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b-2 flex items-center justify-between ${
            isScenarioExtra
              ? 'bg-blue-950/80 border-blue-500'
              : isScenarioIntra
              ? 'bg-emerald-950/80 border-emerald-500'
              : isWorkshop
              ? 'bg-purple-950/80 border-purple-500'
              : isDebriefing
              ? 'bg-amber-950/80 border-amber-500'
              : 'bg-neutral-900 border-neutral-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 border font-black text-black flex-shrink-0 ${
                isScenarioExtra
                  ? 'bg-cyan-400 border-cyan-300'
                  : isScenarioIntra
                  ? 'bg-emerald-400 border-emerald-300'
                  : isWorkshop
                  ? 'bg-purple-400 border-purple-300'
                  : 'bg-amber-400 border-amber-300'
              }`}
            >
              {isScenarioExtra ? (
                <Flame className="w-6 h-6 text-black" />
              ) : isScenarioIntra ? (
                <Building className="w-6 h-6 text-black" />
              ) : isWorkshop ? (
                <Wrench className="w-6 h-6 text-black" />
              ) : (
                <GraduationCap className="w-6 h-6 text-black" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase font-mono tracking-widest px-2 py-0.5 bg-black/60 border border-white/20 text-white">
                  GRUPPO {groupId} • {timeRange} {isNext ? '(PROSSIMO T+1)' : '(ATTIVO T0)'}
                </span>
                <span
                  className={`text-[10px] font-black uppercase font-mono px-2 py-0.5 border ${
                    isScenarioExtra
                      ? 'bg-blue-600 text-white border-blue-400'
                      : isScenarioIntra
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : isWorkshop
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-amber-600 text-black border-amber-400'
                  }`}
                >
                  {isScenarioExtra
                    ? 'SCENARIO EXTRA-OSPEDALIERO (TCCC / PRE-HOSPITAL)'
                    : isScenarioIntra
                    ? 'SCENARIO INTRA-OSPEDALIERO (ED / SHOCK ROOM)'
                    : isWorkshop
                    ? 'WORKSHOP PRATICO & SKILLS LAB'
                    : isDebriefing
                    ? 'DEBRIEFING CLINICO'
                    : 'ATTIVITÀ DIDATTICA'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white uppercase mt-1">
                {groupActivity.title}
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" /> LOCATION / POSTAZIONE
              </span>
              <div className="text-white font-black text-sm">{groupActivity.location}</div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1">
                <Users className="w-3 h-3 text-cyan-400" /> SQUADRE ASSEGNATE
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {assignedTeams.map((tm) => (
                  <span
                    key={tm.id}
                    className="px-2 py-0.5 bg-neutral-800 border text-white font-mono font-bold text-xs"
                    style={{ borderColor: tm.color }}
                  >
                    Sq.{tm.id} ({tm.name})
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-emerald-400" /> FACULTY / TUTOR
              </span>
              <div className="text-white font-bold text-xs">
                {displayedFaculty.map((f) => f.name).join(', ') || 'Faculty di postazione'}
              </div>
            </div>
          </div>

          {/* Subtitle & Focus */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-4 space-y-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-black tracking-wider block">
              OBIETTIVI DIDATTICI & SINTESI ATTIVITÀ
            </span>
            <p className="text-sm text-neutral-200 font-medium leading-relaxed">
              {groupActivity.subtitle}
            </p>
            {groupActivity.partnerGroup && (
              <div className="pt-2 border-t border-neutral-800 text-[11px] text-cyan-300 flex items-center gap-1.5 font-mono">
                <ChevronRight className="w-4 h-4 text-cyan-400" />
                Interazione & Handover SBAR con <strong>GRUPPO {groupActivity.partnerGroup}</strong> (
                {partnerTeams.map((t) => `Sq.${t.id}`).join(', ')})
              </div>
            )}
          </div>

          {/* If Scenario: Specific Patient & Clinical Case Details */}
          {isScenario && assignedPatients.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-white font-mono flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-cyan-400" />
                  PAZIENTI SIMULATORI & CASI CLINICI ASSEGNATI ({assignedPatients.length})
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {isScenarioExtra ? 'Fase Extra-Ospedaliera' : 'Fase Intra-Ospedaliera Shock Room'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {assignedPatients.map((p) => {
                  const procs = isScenarioExtra ? p.procedureExtra : p.procedureIntra;
                  const isCritical = p.readinessStatus === 'critical';
                  const isReady = p.readinessStatus === 'ready';

                  return (
                    <div
                      key={p.id}
                      className={`p-4 border-2 space-y-3 ${
                        isCritical
                          ? 'bg-amber-950/30 border-amber-500'
                          : 'bg-neutral-900 border-neutral-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono font-black text-xs">
                            PAZIENTE #{p.id}
                          </span>
                          <span className="font-black text-white text-sm uppercase">
                            {p.scenarioCode}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCritical ? (
                            <button
                              type="button"
                              onClick={() => onOpenCriticalityModal?.(p.id)}
                              className="px-2.5 py-1 bg-amber-500 text-black font-black text-[10px] uppercase flex items-center gap-1 animate-pulse cursor-pointer border border-amber-300"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              <span>CRITICITÀ SEGNALATA ⚠️</span>
                            </button>
                          ) : isReady ? (
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold text-[10px] uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>SCENARIO PRONTO</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 font-mono text-[10px] uppercase">
                              IN ALLESTIMENTO
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Lesioni */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                          LESIONI & DINAMICA DEL TRAUMA:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {p.lesioni.map((les, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-red-950/70 border border-red-800 text-red-200 text-xs font-semibold"
                            >
                              • {les}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Procedure Attese */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-black">
                          PROCEDURE ATTESE ({isScenarioExtra ? 'EXTRA-OSPEDALIERE' : 'INTRA-OSPEDALIERE ED'}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {procs.map((proc, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs font-black flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              {proc}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Presidi & Protesi Snapshot */}
                      <div className="bg-neutral-950 p-2.5 border border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-neutral-400 font-mono font-bold block">
                            PROTESI / MOULAGE:
                          </span>
                          <span className="text-neutral-200">{p.moulageProtesi}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 font-mono font-bold block">
                            SIMULATORE / ATTORI:
                          </span>
                          <span className="text-neutral-200">
                            {p.simulatori} • {p.attoriCount} Attore/i ({p.attoreDettagli || 'Paziente'})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* If Workshop: Specific Skills & Topics */}
          {isWorkshop && (
            <div className="bg-neutral-900 border border-neutral-800 p-4 space-y-3">
              <span className="text-xs font-black uppercase text-purple-400 font-mono flex items-center gap-1.5">
                <Wrench className="w-4 h-4" />
                CONTENUTI DIDATTICI DEL WORKSHOP / SKILLS LAB
              </span>
              <ul className="space-y-2 text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>Addestramento Tecnico Guidato:</strong> Esercitazioni su modelli ad alta
                    fedeltà e biomodelli con feedback continuo del Faculty.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>Rotazione Stazioni:</strong> Ogni discente esegue personalmente le manovre
                    fino al raggiungimento della piena padronanza procedurale.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>MacGyver & Improvvisazione:</strong> Gestione di scenari austeri con
                    risorse limitate e presidi non convenzionali.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="bg-neutral-900 border-t border-neutral-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenProtesiModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProtesiModal();
                }}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardList className="w-4 h-4 text-cyan-400" />
                <span>VEDI PROTESI, ATTORI & TECNICI</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase cursor-pointer"
          >
            CHIUDI SPECIFICHE
          </button>
        </div>
      </div>
    </div>
  );
};
