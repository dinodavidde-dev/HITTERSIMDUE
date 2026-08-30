import React, { useState, useEffect, useMemo } from 'react';
import { useCourse } from '../context/CourseContext';
import {
  Bell,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  Volume2,
  X,
  Radio,
  ArrowRight,
  Flame,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { playBroadcastSound } from '../utils/audio';
import { GroupType, GroupActivitySlot } from '../types';

export interface NextModuleAlertInfo {
  moduleName: string;
  stationName?: string;
  room?: string;
  teamName: string;
  teamId: number;
  groupId: GroupType;
  minutesRemaining: number;
  secondsRemaining: number;
  totalRemainingSeconds: number;
  roleDescription?: string;
  activityTitle?: string;
  location?: string;
  ongoingPhaseTitle?: string;
  ongoingActivityTitle?: string;
  upcomingPhaseTitle?: string;
  roleInstruction?: string;
}

export const ModuleCalloutBanner: React.FC = () => {
  const {
    userRole,
    activeDay,
    currentSlot,
    filteredSlots,
    activeSlotIndex,
    discenti,
    teams,
    selectedDiscenteId,
    selectedFacultyId,
    faculty,
    selectedTechnicianId,
    technicians,
    timerSeconds,
    isCourseStarted,
    language,
  } = useCourse();

  const isEn = language === 'en';
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const [hasPlayedChime, setHasPlayedChime] = useState<string | null>(null);

  // Compute upcoming module and team callout for the logged operator
  const nextAlert = useMemo<NextModuleAlertInfo | null>(() => {
    if (!isCourseStarted) return null;

    // Determine current operator identity & team
    let operatorTeamId: number | null = null;
    let operatorRoleName = 'Operatore';

    if (userRole === 'discente') {
      const disc = discenti.find((d) => d.id === selectedDiscenteId) || discenti[0];
      if (disc) {
        operatorTeamId = disc.teamId;
        operatorRoleName = `Discente: ${disc.name} (${disc.role})`;
      }
    } else if (userRole === 'faculty') {
      const fac = faculty.find((f) => f.id === selectedFacultyId) || faculty[0];
      if (fac) {
        operatorRoleName = `Faculty: ${fac.name} (${fac.title})`;
        operatorTeamId = fac.assignedTeamId || 1;
      }
    } else if (userRole === 'tecnico') {
      const tec = technicians.find((t) => t.id === selectedTechnicianId) || technicians[0];
      if (tec) {
        operatorRoleName = `Tecnico: ${tec.name} (${tec.specialty})`;
        operatorTeamId = 1;
      }
    } else if (userRole === 'ospite' || userRole === 'public') {
      operatorTeamId = 1;
      operatorRoleName = 'Visualizzazione Operativa Plenaria';
    }

    if (!operatorTeamId) return null;

    const team = teams.find((t) => t.id === operatorTeamId) || teams[0];
    if (!team) return null;

    const userGroupId = team.groupId as GroupType;

    if (timerSeconds <= 900 && timerSeconds > 0) {
      const nextSlot = filteredSlots[activeSlotIndex + 1];
      const nextActivity: GroupActivitySlot | undefined = nextSlot?.groupActivities?.[userGroupId];
      const currentActivity: GroupActivitySlot | undefined = currentSlot?.groupActivities?.[userGroupId];

      const moduleTitle = nextActivity ? nextActivity.title : currentActivity ? currentActivity.title : currentSlot.title;
      const location = nextActivity ? nextActivity.location : currentActivity ? currentActivity.location : 'Stazione Assegnata';

      // Role specific instruction
      let roleInst = '';
      if (userRole === 'faculty') {
        roleInst = isEn
          ? 'Faculty: Prepare evaluation rubrics, scoring sheet, and team briefing.'
          : 'Faculty: Preparare griglie di valutazione, checklist e briefing della squadra.';
      } else if (userRole === 'discente') {
        roleInst = isEn
          ? 'Learner/Team: Gather with your assigned team and Faculty Tutor at the station.'
          : 'Discente/Squadra: Riunirsi con il proprio Faculty Tutor alla postazione assegnata.';
      } else if (userRole === 'tecnico') {
        roleInst = isEn
          ? 'Technician: Inspect mannequin status, equipment readiness, and setup.'
          : 'Tecnico: Verificare stato manichini, set-up apparecchiature e postazione.';
      } else {
        roleInst = isEn
          ? 'Plenary: Assemble teams for upcoming rotation block.'
          : 'Plenaria: Riunire le squadre per il prossimo blocco di rotazione.';
      }

      return {
        moduleName: nextSlot ? `Prossima Fase: ${nextSlot.title}` : `Conclusione ${currentSlot.title}`,
        stationName: location,
        room: location,
        teamName: team.name,
        teamId: team.id,
        groupId: team.groupId,
        minutesRemaining: Math.floor(timerSeconds / 60),
        secondsRemaining: timerSeconds % 60,
        totalRemainingSeconds: timerSeconds,
        roleDescription: operatorRoleName,
        activityTitle: moduleTitle,
        location: location,
        ongoingPhaseTitle: currentSlot.title,
        ongoingActivityTitle: currentActivity?.title || (isEn ? 'Ongoing Activity' : 'Attività in Corso'),
        upcomingPhaseTitle: nextSlot ? nextSlot.title : currentSlot.title,
        roleInstruction: roleInst,
      };
    }

    return null;
  }, [
    isCourseStarted,
    userRole,
    currentSlot,
    filteredSlots,
    activeSlotIndex,
    discenti,
    teams,
    selectedDiscenteId,
    selectedFacultyId,
    faculty,
    selectedTechnicianId,
    technicians,
    timerSeconds,
    isEn,
  ]);

  // Audio chime trigger when countdown hits <= 15 min (900s) threshold
  useEffect(() => {
    if (nextAlert && nextAlert.totalRemainingSeconds <= 900 && nextAlert.totalRemainingSeconds >= 895) {
      const alertKey = `slot-${activeSlotIndex}-${nextAlert.minutesRemaining}`;
      if (hasPlayedChime !== alertKey) {
        setHasPlayedChime(alertKey);
        playBroadcastSound('warning');
      }
    }
  }, [nextAlert, activeSlotIndex, hasPlayedChime]);

  if (!nextAlert) return null;

  const currentAlertId = `slot-${activeSlotIndex}-${nextAlert.minutesRemaining}`;
  if (dismissedKey === currentAlertId) return null;

  const isUrgent = nextAlert.minutesRemaining <= 5;

  return (
    <div
      id="module-pre-start-callout-banner"
      className={`w-full transition-all duration-300 border-y-2 px-4 py-3 shadow-2xl relative overflow-hidden z-40 ${
        isUrgent
          ? 'bg-red-950/95 border-red-500 text-red-100'
          : 'bg-amber-950/95 border-amber-500 text-amber-100'
      }`}
    >
      {/* Background Pulse Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent pointer-events-none animate-pulse" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        
        {/* Left Side: Callout Icon & Core Invitation */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2.5 rounded-none border-2 flex items-center justify-center flex-shrink-0 animate-bounce ${
              isUrgent ? 'bg-red-600 border-red-300 text-white' : 'bg-amber-500 border-amber-300 text-black'
            }`}
          >
            <Bell className="w-5 h-5 fill-current" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 tracking-wider border ${
                  isUrgent
                    ? 'bg-red-900 border-red-400 text-white'
                    : 'bg-amber-900 border-amber-400 text-amber-200'
                }`}
              >
                {isEn ? '🔔 PRE-ALERT • ONGOING & UPCOMING PHASE' : '🔔 PRE-ALLERTAMENTO • FASE IN CORSO E IN ARRIVO'}
              </span>
              <span className="text-xs font-mono font-bold text-neutral-300">
                {nextAlert.roleDescription}
              </span>
            </div>

            {/* Ongoing Phase Indicator */}
            <div className="text-xs font-mono text-neutral-300 bg-black/40 px-2 py-1 border border-neutral-800 flex items-center gap-2 flex-wrap">
              <span className="text-orange-400 uppercase font-black">{isEn ? 'Ongoing Phase:' : 'Fase in Corso:'}</span>
              <span className="text-white font-bold">{nextAlert.ongoingPhaseTitle}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-300">{nextAlert.ongoingActivityTitle}</span>
            </div>

            <h4 className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-2 flex-wrap">
              <span>{isEn ? 'Team Assignment:' : 'Assegnazione Squadra:'}</span>
              <span className="text-amber-400 bg-black/60 px-2 py-0.5 border border-amber-500/60 font-mono">
                {nextAlert.teamName} (Gruppo {nextAlert.groupId})
              </span>
            </h4>

            <p className="text-xs text-amber-200 font-bold flex items-center gap-2 flex-wrap">
              <span>{nextAlert.roleInstruction}</span>
              {nextAlert.location && (
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <MapPin className="w-3.5 h-3.5" />
                  {nextAlert.location}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: 15-Min Digital Countdown Timer & Dismiss Button */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="bg-black/90 border-2 border-amber-500 px-4 py-2 flex items-center gap-3 shadow-inner">
            <div className="text-right">
              <div className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                {isEn ? 'TIME TO START' : 'TEMPO ALL\'AVVIO'}
              </div>
              <div className="text-xs font-mono text-neutral-400">
                {isEn ? 'Assembly' : 'Raduno Squadre'}
              </div>
            </div>

            <div className="flex items-center gap-1 font-mono font-black text-xl sm:text-2xl text-amber-400">
              <Clock className="w-5 h-5 text-amber-500 animate-spin" />
              <span>{String(nextAlert.minutesRemaining).padStart(2, '0')}</span>
              <span className="animate-pulse">:</span>
              <span>{String(nextAlert.secondsRemaining).padStart(2, '0')}</span>
            </div>
          </div>

          <button
            id="dismiss-callout-btn"
            type="button"
            onClick={() => setDismissedKey(currentAlertId)}
            className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Nascondi promemoria"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
