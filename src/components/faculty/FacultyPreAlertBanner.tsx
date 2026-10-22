import React from 'react';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Flame,
  Zap,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Faculty, SimulatorPatient, Team, Discente } from '../../types';

export interface FacultyPreAlertBannerProps {
  currentFaculty: Faculty;
  assignedTeam?: Team;
  assignedTeamDiscenti: Discente[];
  targetPatient?: SimulatorPatient | null;
  targetScenarioTitle: string;
  targetScenarioTime: string;
  targetStation: string;
  scenarioType: 'TCCC' | 'SHOCKROOM';
  timerSeconds: number;
  isTimerRunning: boolean;
  onOpenRoleAssigner?: () => void;
  isEn?: boolean;
}

export const FacultyPreAlertBanner: React.FC<FacultyPreAlertBannerProps> = ({
  currentFaculty,
  assignedTeamDiscenti,
  targetPatient,
  targetScenarioTitle,
  targetScenarioTime,
  targetStation,
  scenarioType,
  timerSeconds,
  isTimerRunning,
  onOpenRoleAssigner,
  isEn = false,
}) => {
  const formatTimer = (secs: number) => {
    const mins = Math.floor(Math.max(0, secs) / 60);
    const s = Math.max(0, secs) % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalPreAlertSec = 900; // 15 minuti nominali (15 * 60 = 900s)
  const remainingSec = Math.max(0, timerSeconds);
  const elapsedSec = Math.max(0, totalPreAlertSec - remainingSec);
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSec / totalPreAlertSec) * 100)));

  const teamNum = currentFaculty.assignedTeamId || 1;
  const stationIdx = ((teamNum - 1) % 3) + 1;
  const assignedCount = assignedTeamDiscenti.filter((d) => Boolean(d.activeScenarioRole)).length;
  const allRolesAssigned = assignedTeamDiscenti.length > 0 && assignedCount === assignedTeamDiscenti.length;

  return (
    <div
      className={`bg-gradient-to-r from-red-950/90 via-neutral-900 to-black border-2 rounded-xl p-3.5 sm:p-5 shadow-2xl space-y-3.5 font-mono text-white relative overflow-hidden transition-all duration-300 ${
        allRolesAssigned
          ? 'border-emerald-500 shadow-emerald-950/40'
          : 'border-red-500 ring-2 ring-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.4)]'
      }`}
    >
      {/* RIGA SUPERIORE: BADGE ALLERTA + SCENARIO IN PARTENZA + COUNTDOWN */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-red-500/30 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg shadow-lg shrink-0 ${
              allRolesAssigned
                ? 'bg-emerald-500 text-black'
                : 'bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]'
            }`}
          >
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 font-black text-[10px] sm:text-xs uppercase tracking-wider rounded flex items-center gap-1.5 ${
                  allRolesAssigned
                    ? 'bg-emerald-500 text-black'
                    : 'bg-red-600 text-white animate-pulse'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                {scenarioType === 'SHOCKROOM'
                  ? isEn
                    ? 'PRE-ALERT SHOCK ROOM • T -15 MIN'
                    : 'PRE-ALLERTA SHOCK ROOM • T -15 MIN'
                  : isEn
                  ? 'PRE-ALERT TCCC • T -15 MIN'
                  : 'PRE-ALLERTA TCCC • T -15 MIN'}
              </span>
              <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-[10px] sm:text-[11px] uppercase rounded">
                🔓 {isEn ? 'ROLE SELECTION WINDOW OPEN' : 'FINESTRA SCELTA RUOLI APERTA'}
              </span>
              {targetScenarioTime && (
                <span className="px-2 py-0.5 bg-black border border-amber-400 text-amber-300 font-black text-[10px] sm:text-[11px] rounded">
                  🏁 {isEn ? `T0 AT ${targetScenarioTime}` : `T0 ORE ${targetScenarioTime}`}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-black text-white mt-1 uppercase tracking-tight">
              {targetScenarioTitle}
            </h3>
          </div>
        </div>

        {/* CRONOMETRO DIGITALE SINCRONIZZATO */}
        <div className="flex items-center gap-2.5 bg-neutral-950 px-3 py-2 border border-amber-500/80 rounded-lg self-stretch md:self-auto justify-between md:justify-end shrink-0">
          <span className="text-[10px] uppercase font-bold text-amber-300/90">
            {isEn ? 'T0 in:' : 'T0 tra:'}
          </span>
          <div className="flex items-center gap-1.5">
            <Clock className={`w-5 h-5 ${isTimerRunning ? 'text-amber-400 animate-spin' : 'text-neutral-500'}`} />
            <span className="text-xl sm:text-2xl font-mono font-black text-amber-300 tracking-wider">
              {formatTimer(remainingSec)}
            </span>
          </div>
        </div>
      </div>

      {/* RIGA INFORMATIVA ESSENZIALE: POSTAZIONE, PAZIENTE TARGET & DIRETTIVA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="bg-black/50 border border-neutral-800 px-3 py-2 rounded flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-neutral-400 uppercase block">{isEn ? 'Target Station' : 'Postazione Target'}</span>
            <strong className="text-white truncate block">
              {targetStation || (scenarioType === 'SHOCKROOM' ? `Box Shock Room ${stationIdx}` : `Ambiente Tattico ${stationIdx}`)}
            </strong>
          </div>
        </div>

        <div className="bg-black/50 border border-neutral-800 px-3 py-2 rounded flex items-center gap-2">
          <Flame className="w-4 h-4 text-pink-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-neutral-400 uppercase block">{isEn ? 'Target Patient' : 'Paziente Target'}</span>
            <strong className="text-pink-300 truncate block">
              {targetPatient ? `Pt. #${targetPatient.id} (${targetPatient.scenarioCode} • ${targetPatient.name})` : `Paziente #${stationIdx}`}
            </strong>
          </div>
        </div>

        <div className="bg-amber-950/30 border border-amber-500/50 px-3 py-2 rounded flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-amber-300 uppercase font-bold block">{isEn ? 'Operational Directive' : 'Direttiva Operativa'}</span>
            <span className="text-neutral-200 text-[11px] leading-tight block">
              {scenarioType === 'SHOCKROOM'
                ? isEn
                  ? 'Active Standby in SR Box (T -15m before :30 Handover): assign team roles.'
                  : 'Standby Attivo nel Box SR (T -15m da Handover :30): assegna i ruoli squadra.'
                : isEn
                ? 'T -15m before TCCC start: verify PPE and assign team roles.'
                : 'T -15m da avvio TCCC: verifica DPI e assegna i ruoli squadra.'}
            </span>
          </div>
        </div>
      </div>

      {/* PULSANTE RAPIDO PER APRIRE LA FINESTRA MODALE SCELTA RUOLI SQUADRA */}
      <div className="bg-black/70 border-2 border-amber-500/80 p-3 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded shrink-0 ${allRolesAssigned ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/60' : 'bg-amber-500/20 text-amber-300 border border-amber-500/60'}`}>
            {allRolesAssigned ? <CheckCircle2 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase text-white">
                {isEn ? `Team #${teamNum} Role Assignment (1 TL + 4 Op)` : `Scelta Ruoli Squadra #${teamNum} (1 TL + 4 Operatori)`}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                allRolesAssigned
                  ? 'bg-emerald-500 text-black'
                  : 'bg-amber-500/30 text-amber-300 border border-amber-400'
              }`}>
                {allRolesAssigned
                  ? isEn ? '5/5 ROLES ASSIGNED' : '5/5 RUOLI ASSEGNATI'
                  : isEn ? `${assignedCount}/5 ASSIGNED` : `${assignedCount}/5 ASSEGNATI`}
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 mt-0.5">
              {isEn
                ? 'Open the Role Selection menu to assign or rotate Team Leader and Operator tasks before T0.'
                : 'Apri il menu Scelta Ruoli per assegnare o ruotare Team Leader e mansioni operative prima del T0.'}
            </p>
          </div>
        </div>

        {onOpenRoleAssigner && (
          <button
            type="button"
            onClick={onOpenRoleAssigner}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-lg border border-amber-200 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Users className="w-4 h-4 text-black shrink-0" />
            <span>
              {allRolesAssigned
                ? isEn ? 'Edit Team Roles (Modal)' : 'Modifica Ruoli Squadra'
                : isEn ? 'Open Role Selection Menu' : 'Apri Menu Scelta Ruoli'}
            </span>
          </button>
        )}
      </div>

      {/* BARRA DI PROGRESSO COUNTDOWN */}
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-neutral-900 border border-neutral-800 rounded overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              remainingSec <= 180
                ? 'bg-red-500 animate-pulse'
                : 'bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

