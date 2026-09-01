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

export interface GroupCalloutInfo {
  groupId: GroupType;
  groupName: string;
  activityTitle: string;
  location: string;
}

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
  groupCallouts: GroupCalloutInfo[];
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

  // Compute upcoming module and multi-group callouts
  const nextAlert = useMemo<NextModuleAlertInfo | null>(() => {
    if (!isCourseStarted) return null;

    let operatorRoleName = 'Operatore Plenario';
    if (userRole === 'discente') {
      const disc = discenti.find((d) => d.id === selectedDiscenteId) || discenti[0];
      if (disc) operatorRoleName = `Discente: ${disc.name} (${disc.role})`;
    } else if (userRole === 'faculty') {
      const fac = faculty.find((f) => f.id === selectedFacultyId) || faculty[0];
      if (fac) operatorRoleName = `Faculty: ${fac.name} (${fac.title})`;
    } else if (userRole === 'tecnico') {
      const tec = technicians.find((t) => t.id === selectedTechnicianId) || technicians[0];
      if (tec) operatorRoleName = `Tecnico: ${tec.name} (${tec.specialty})`;
    }

    if (timerSeconds <= 900 && timerSeconds > 0) {
      const nextSlot = filteredSlots[activeSlotIndex + 1] || currentSlot;
      const groupTypes: GroupType[] = ['A', 'B', 'C', 'D'];
      const groupNames: Record<GroupType, string> = {
        A: isEn ? 'Group A (Alpha)' : 'Gruppo A (Alfa)',
        B: isEn ? 'Group B (Bravo)' : 'Gruppo Bravo',
        C: isEn ? 'Group C (Charlie)' : 'Gruppo Charlie',
        D: isEn ? 'Group D (Delta)' : 'Gruppo Delta',
      };

      const groupCallouts: GroupCalloutInfo[] = groupTypes.map((gId) => {
        const act = nextSlot?.groupActivities?.[gId] || currentSlot?.groupActivities?.[gId];
        return {
          groupId: gId,
          groupName: groupNames[gId],
          activityTitle: act ? act.title : (isEn ? 'Assembly & Briefing' : 'Raduno e Briefing'),
          location: act ? act.location : 'Postazione Assegnata',
        };
      });

      const roleInst = isEn
        ? '15 min call: All teams please gather with your assigned Faculty tutor at your respective stations.'
        : 'Chiamata 15 min: Tutte le squadre sono invitate al raduno con il proprio Faculty tutor presso le rispettive postazioni.';

      return {
        moduleName: nextSlot ? `Prossima Fase: ${nextSlot.title}` : `Conclusione ${currentSlot.title}`,
        teamName: 'Tutte le Squadre (Gruppi A, B, C, D)',
        teamId: 1,
        groupId: 'A',
        minutesRemaining: Math.floor(timerSeconds / 60),
        secondsRemaining: timerSeconds % 60,
        totalRemainingSeconds: timerSeconds,
        roleDescription: operatorRoleName,
        ongoingPhaseTitle: currentSlot.title,
        upcomingPhaseTitle: nextSlot ? nextSlot.title : currentSlot.title,
        roleInstruction: roleInst,
        groupCallouts,
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
    faculty,
    technicians,
    selectedDiscenteId,
    selectedFacultyId,
    selectedTechnicianId,
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
              <span>{isEn ? '15-Min Gathering Call by Group:' : 'Chiamata al Raduno 15 min per Gruppi:'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
              {nextAlert.groupCallouts.map((gc) => (
                <div key={gc.groupId} className="bg-black/60 border border-amber-500/40 p-2 text-xs">
                  <div className="flex items-center justify-between font-black text-amber-300">
                    <span>{gc.groupName}</span>
                    <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-400" />
                      {gc.location}
                    </span>
                  </div>
                  <div className="text-white font-bold truncate mt-0.5" title={gc.activityTitle}>
                    {gc.activityTitle}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-amber-200 font-bold mt-1">
              {nextAlert.roleInstruction}
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
