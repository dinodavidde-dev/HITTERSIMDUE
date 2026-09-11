import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import { Team, GroupType } from '../../types';
import { getTeamCodeName } from '../../utils/teamUtils';
import { Activity, CheckCircle2, Clock, Play, MapPin, Navigation, Award, Users } from 'lucide-react';

interface SquadRealtimeStatusBoardProps {
  onSelectTeam?: (teamId: number) => void;
}

export const SquadRealtimeStatusBoard: React.FC<SquadRealtimeStatusBoardProps> = () => {
  const { language, teams, currentSlot, evaluations, filteredSlots, activeSlotIndex } = useCourse();
  const isEn = language === 'en';

  // State to allow simulation status toggle or manual override per team if needed
  const [teamStatuses, setTeamStatuses] = useState<Record<number, 'ready' | 'in_progress' | 'completed'>>({
    1: 'in_progress',
    2: 'in_progress',
    3: 'ready',
    4: 'ready',
    5: 'in_progress',
    6: 'completed',
    7: 'ready',
    8: 'in_progress',
    9: 'ready',
    10: 'completed',
    11: 'ready',
    12: 'in_progress',
  });

  const handleCycleStatus = (teamId: number) => {
    setTeamStatuses((prev) => {
      const current = prev[teamId] || 'ready';
      let next: 'ready' | 'in_progress' | 'completed' = 'ready';
      if (current === 'ready') next = 'in_progress';
      else if (current === 'in_progress') next = 'completed';
      else next = 'ready';
      return { ...prev, [teamId]: next };
    });
  };

  const groupThemes: Record<GroupType, { label: string; bg: string; border: string; text: string; badge: string }> = {
    A: { label: 'ROSSO', bg: 'bg-red-950/20', border: 'border-red-600/40', text: 'text-red-400', badge: 'bg-red-600 text-white' },
    B: { label: 'BLU', bg: 'bg-blue-950/20', border: 'border-blue-600/40', text: 'text-blue-400', badge: 'bg-blue-600 text-white' },
    C: { label: 'VERDE', bg: 'bg-green-950/20', border: 'border-green-600/40', text: 'text-green-400', badge: 'bg-green-600 text-white' },
    D: { label: 'GIALLO', bg: 'bg-yellow-950/20', border: 'border-yellow-600/40', text: 'text-yellow-400', badge: 'bg-yellow-600 text-black' },
  };

  // Calculate overall course progress percentage based on filtered slots
  const totalSlotsCount = filteredSlots.length || 1;
  const progressPercentage = Math.min(100, Math.round(((activeSlotIndex + 1) / totalSlotsCount) * 100));

  return (
    <div className="bg-neutral-950 border-2 border-yellow-500/50 p-5 sm:p-6 shadow-2xl space-y-6 text-neutral-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            {isEn ? 'LIVE 12 SQUADS ROTATION & LOCATION MONITOR' : 'MONITOR LIVE 12 SQUADRE & POSIZIONE ROTAZIONE'}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            {isEn ? 'Real-Time Squad Location & Status Dashboard' : 'Dashboard Posizione & Stato Squadre in Tempo Reale'}
          </h3>
          <p className="text-xs text-neutral-400">
            {isEn
              ? `Current Slot: ${currentSlot.title} • Showing real-time rotation location for all 12 squads.`
              : `Slot Attuale: ${currentSlot.title} • Visualizzazione posizione e rotazione in tempo reale per le 12 squadre.`}
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block">{isEn ? 'Ready' : 'Pronti'}</span>
            <span className="text-sm font-black text-yellow-400">
              {Object.values(teamStatuses).filter((s) => s === 'ready').length}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block">{isEn ? 'In Progress' : 'In Corso'}</span>
            <span className="text-sm font-black text-blue-400 animate-pulse">
              {Object.values(teamStatuses).filter((s) => s === 'in_progress').length}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block">{isEn ? 'Completed' : 'Completati'}</span>
            <span className="text-sm font-black text-emerald-400">
              {Object.values(teamStatuses).filter((s) => s === 'completed').length}
            </span>
          </div>
        </div>
      </div>

      {/* Global Course Progress Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-300 font-bold uppercase flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-yellow-400" />
            {isEn ? 'Course Rotation Progress' : 'Avanzamento Globale Rotazione Corso'}
          </span>
          <span className="text-yellow-400 font-black">
            Slot {activeSlotIndex + 1} / {totalSlotsCount} ({progressPercentage}%)
          </span>
        </div>
        <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
          <div
            className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 12 Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {teams.map((team, index) => {
          const status = teamStatuses[team.id] || 'ready';
          const theme = groupThemes[team.groupId] || groupThemes.A;
          const currentGroupActivity = currentSlot?.groupActivities?.[team.groupId];
          const teamEvals = evaluations.filter((e) => e.teamId === team.id);
          const avgScore =
            teamEvals.length > 0
              ? (
                  teamEvals.reduce((acc, ev) => {
                    const s = ev.scores;
                    return acc + (s.abcdeApproach + s.technicalSkills + s.teamworkLeadership + s.handoverSbar + s.safetyTiming) / 5;
                  }, 0) / teamEvals.length
                ).toFixed(1)
              : '--';

          return (
            <div
              key={`team-${team.id ?? index}-${index}`}
              className={`bg-neutral-900 border-2 ${theme.border} p-4 space-y-3 shadow-lg flex flex-col justify-between transition-all hover:border-yellow-500`}
            >
              {/* Top Row: Group & Team Code */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${theme.badge}`}>
                  GRUPPO {team.groupId} • {theme.label}
                </span>
                <span className="font-mono text-xs font-black text-white px-2 py-0.5 bg-neutral-950 border border-neutral-800">
                  {getTeamCodeName(team)}
                </span>
              </div>

              {/* Team Name & Details */}
              <div className="space-y-1">
                <h4 className="font-black text-sm text-white uppercase tracking-tight line-clamp-1">
                  {team.name}
                </h4>
                <p className="text-[11px] text-neutral-400 font-medium line-clamp-1">
                  {team.notes || (isEn ? 'Advanced Trauma Team' : 'Team Politrauma Avanzato')}
                </p>
              </div>

              {/* Current Location & Activity Box */}
              <div className="bg-neutral-950 p-2.5 border border-neutral-800 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-yellow-400">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-yellow-500" />
                  <span className="truncate">{currentGroupActivity?.location || (isEn ? 'Assigned Station' : 'Postazione Assegnata')}</span>
                </div>
                <p className="text-xs text-neutral-300 font-medium line-clamp-2 pl-5">
                  {currentGroupActivity?.title || (isEn ? 'Active Training Module' : 'Modulo Formativo Attivo')}
                </p>
              </div>

              {/* Status Badge (Clickable to toggle) */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-400 uppercase">
                  {isEn ? 'Status:' : 'Stato:'}
                </span>
                <button
                  onClick={() => handleCycleStatus(team.id)}
                  className={`px-3 py-1 text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 border ${
                    status === 'ready'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/20'
                      : status === 'in_progress'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500 animate-pulse hover:bg-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500 hover:bg-emerald-500/30'
                  }`}
                  title={isEn ? 'Click to cycle status' : 'Clicca per cambiare stato'}
                >
                  {status === 'ready' && <Clock className="w-3.5 h-3.5 text-yellow-400" />}
                  {status === 'in_progress' && <Play className="w-3.5 h-3.5 text-blue-400" />}
                  {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>
                    {status === 'ready'
                      ? isEn
                        ? 'Ready'
                        : 'Pronto'
                      : status === 'in_progress'
                      ? isEn
                        ? 'In Progress'
                        : 'In Corso'
                      : isEn
                      ? 'Completed'
                      : 'Completato'}
                  </span>
                </button>
              </div>

              {/* Performance Indicator footer */}
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1">
                <span>Evals: {teamEvals.length}</span>
                <span className="text-yellow-400 font-bold">Avg: {avgScore} / 10</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

