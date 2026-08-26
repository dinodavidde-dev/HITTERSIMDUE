import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import { GroupType, ActivityType } from '../../types';
import {
  Activity,
  ArrowRight,
  Clock,
  Info,
  MapPin,
  Moon,
  Stethoscope,
  Users,
  Wrench,
} from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { translateRoleOrSpecialty } from '../../i18n/medicalTerms';
import { getTeamCodeName } from '../../utils/teamUtils';

export const PublicSharedView: React.FC = () => {
  const {
    language,
    t,
    activeDay,
    currentSlot,
    filteredSlots,
    activeSlotIndex,
    timerSeconds,
    isTimerRunning,
    discenti,
    faculty,
  } = useCourse();

  const isEn = language === 'en';
  const [expandedGroup, setExpandedGroup] = useState<GroupType | null>(null);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getActivityBadge = (type: ActivityType) => {
    switch (type) {
      case 'scenario_extra':
        return {
          label: isEn ? 'OUT-OF-HOSPITAL SCENARIO (TCCC)' : 'SCENARIO EXTRAOSPEDALIERO (TCCC)',
          color: 'bg-red-600 text-white font-black',
          icon: <Activity className="w-4 h-4 text-white" />,
          accent: 'border-l-8 border-l-red-600',
        };
      case 'scenario_intra':
        return {
          label: isEn ? 'SHOCK ROOM DEBRIEFING & HANDOVER' : 'DEBRIEFING POST SCENARIO (SHOCK ROOM)',
          color: 'bg-neutral-100 text-black font-black',
          icon: <Stethoscope className="w-4 h-4 text-black" />,
          accent: 'border-l-8 border-l-neutral-100',
        };
      case 'workshop':
        return {
          label: isEn ? 'TCCC MILITARY WORKSHOP' : 'WORKSHOP TCCC MILITARY',
          color: 'bg-orange-500 text-black font-black',
          icon: <Users className="w-4 h-4 text-black" />,
          accent: 'border-l-8 border-l-orange-500',
        };
      case 'skills':
        return {
          label: isEn ? 'SKILLS & PROCEDURAL WORKSHOP' : 'SKILLS & PROCEDURAL WORKSHOP',
          color: 'bg-neutral-800 text-neutral-100 border border-neutral-600 font-black',
          icon: <Wrench className="w-4 h-4 text-orange-400" />,
          accent: 'border-l-8 border-l-orange-400',
        };
      case 'debriefing':
        return {
          label: isEn ? 'SBAR HANDOVER & DEBRIEFING' : 'HANDOVER SBAR & DEBRIEFING',
          color: 'bg-neutral-200 text-black font-black',
          icon: <Info className="w-4 h-4 text-black" />,
          accent: 'border-l-8 border-l-neutral-400',
        };
      case 'night_scenario':
        return {
          label: isEn ? 'NIGHT SCENARIO (TRIAGE MCI 21:00)' : 'NIGHT SCENARIO (TRIAGE MCI 21:00)',
          color: 'bg-orange-500 text-black font-black',
          icon: <Moon className="w-4 h-4 text-black" />,
          accent: 'border-l-8 border-l-orange-500',
        };
      case 'pause':
      default:
        return {
          label: isEn ? 'BREAK & TECH SANITIZATION' : 'PAUSA & SANIFICAZIONE TECNICA',
          color: 'bg-neutral-800 text-neutral-300 font-bold',
          icon: <Clock className="w-4 h-4 text-neutral-300" />,
          accent: 'border-l-8 border-l-neutral-700',
        };
    }
  };

  const groupConfigs: { id: GroupType; name: string; squads: number[]; color: string; badgeColor: string }[] = [
    { id: 'A', name: isEn ? 'GROUP A (Alpha)' : 'GRUPPO A (Alfa)', squads: [1, 2, 3], color: 'border-neutral-100', badgeColor: 'bg-red-600 text-white font-black' },
    { id: 'B', name: isEn ? 'GROUP B (Bravo)' : 'GRUPPO B (Bravo)', squads: [4, 5, 6], color: 'border-neutral-100', badgeColor: 'bg-neutral-100 text-black font-black' },
    { id: 'C', name: isEn ? 'GROUP C (Charlie)' : 'GRUPPO C (Charlie)', squads: [7, 8, 9], color: 'border-neutral-100', badgeColor: 'bg-orange-500 text-black font-black' },
    { id: 'D', name: isEn ? 'GROUP D (Delta)' : 'GRUPPO D (Delta)', squads: [10, 11, 12], color: 'border-neutral-100', badgeColor: 'bg-neutral-800 text-white border border-neutral-600 font-black' },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* Live Stage Hero Banner (Visuale Condivisa Plenaria) - Compact & Discreet */}
      <div className="relative overflow-hidden bg-neutral-950 border-2 border-neutral-700 p-3.5 sm:p-4 shadow-xl text-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-600 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-xs">
                <span className="w-2 h-2 bg-white"></span>
                {isEn ? 'PARTICIPANTS SHARED SCREEN' : 'VISUALE CONDIVISA PARTECIPANTI'}
              </span>
              <span className="px-2 py-0.5 bg-neutral-900 text-neutral-300 border border-neutral-700 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                DAY 0{activeDay} // {isEn ? 'DAYTIME ROTATIONS' : 'CORSO DIURNO'}
              </span>
              <span className="px-2 py-0.5 bg-neutral-900 text-neutral-300 border border-neutral-700 text-[10px] sm:text-[11px] font-mono font-bold">
                {isEn ? '60 LEARNERS • 12 TEAMS' : '60 DISCENTI • 12 SQUADRE'}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase leading-tight">
              {currentSlot?.title}
            </h2>
            <p className="text-neutral-300 text-xs leading-relaxed font-medium">
              {currentSlot?.description}
            </p>
          </div>

          {/* Discreet Live Countdown Timer Box & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <LanguageSwitcher variant="badge" />

            <div className="flex items-center gap-3 bg-neutral-900 p-2.5 sm:p-3 border-2 border-neutral-700 flex-shrink-0">
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                  {isEn ? 'REMAINING TIME' : 'TEMPO RESIDUO'}
                </div>
                <div className="text-xs text-orange-400 font-mono font-bold">
                  {currentSlot?.timeRange} ({currentSlot?.durationMinutes}m)
                </div>
                <div className="text-[9px] font-bold text-neutral-300 uppercase">
                  {isTimerRunning ? (
                    <span className="text-orange-400 font-black">● LIVE</span>
                  ) : (
                    <span className="text-neutral-400">❚❚ {isEn ? 'PAUSED' : 'PAUSA'}</span>
                  )}
                </div>
              </div>

              <div
                className={`px-3 py-1.5 font-mono text-xl sm:text-2xl font-black tracking-tight border ${
                  timerSeconds < 180
                    ? 'bg-red-600 text-white border-white animate-pulse'
                    : 'bg-neutral-950 text-neutral-100 border-neutral-600'
                }`}
              >
                {formatTimer(timerSeconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Rotation dynamics explanation ribbon */}
        <div className="mt-2.5 pt-2 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400 font-mono font-medium">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-black text-orange-400 uppercase tracking-wider">{isEn ? 'DYNAMICS:' : 'DINAMICA:'}</span>
            <span className="text-neutral-200">{isEn ? '3 TEAMS EXTRA ➔ SBAR ➔ 3 TEAMS SHOCK ROOM' : '3 SQ EXTRAOSP. ➔ SBAR ➔ 3 SQ SHOCK ROOM'}</span>
            <span className="hidden md:inline text-neutral-600">|</span>
            <span className="hidden md:inline text-neutral-400">{isEn ? '6 TEAMS AT TCCC WORKSHOP' : '6 SQ AL WORKSHOP TCCC'}</span>
          </div>
          <div className="font-bold text-neutral-300 uppercase tracking-wider">
            {isEn ? 'PHASE:' : 'FASE:'} <span className="text-orange-400">{activeSlotIndex + 1}</span> {isEn ? 'OF' : 'DI'} {filteredSlots.length}
          </div>
        </div>
      </div>

      {/* 4 Groups Live Matrix (Gruppo A, B, C, D) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-[0.25em] px-2 py-0.5 bg-orange-500 text-black">
                {isEn ? 'OPERATIONAL MATRIX' : 'MATRICE OPERATIVA'}
              </span>
              <span className="text-xs font-mono font-bold text-neutral-400">
                {isEn ? 'SLOT:' : 'FASCIA:'} {currentSlot?.timeRange}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter mt-1">
              {isEn ? 'Live Status by Group & Teams' : 'Stato Operativo per Gruppo & Squadre'}
            </h3>
            <p className="text-xs text-neutral-400 font-medium">
              {isEn ? 'Real-time station allocations and tactical rotations' : 'Assegnazione postazioni in tempo reale e rotazioni operative'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {groupConfigs.map((group) => {
            const activity = currentSlot?.groupActivities[group.id];
            if (!activity) return null;

            const badge = getActivityBadge(activity.activityType);
            const isExpanded = expandedGroup === group.id;

            // Get discenti for this group
            const groupDiscenti = discenti.filter((d) => group.squads.includes(d.teamId));
            const groupFaculty = faculty.filter((f) => group.squads.includes(f.assignedTeamId));

            return (
              <div
                key={group.id}
                id={`group-card-${group.id}`}
                className={`border-4 bg-neutral-950 shadow-2xl overflow-hidden transition-all ${badge.accent} border-neutral-800`}
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b-2 border-neutral-800 bg-neutral-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs uppercase tracking-wider ${group.badgeColor}`}>
                      {isEn ? `GROUP ${group.id}` : `GRUPPO ${group.id}`}
                    </span>
                    <div>
                      <h4 className="font-black text-base text-white uppercase tracking-tight">
                        {isEn ? `Teams ${group.squads.join(', ')} (15 Learners)` : `Squadre ${group.squads.join(', ')} (15 Discenti)`}
                      </h4>
                      <span className="text-xs text-orange-400 font-mono font-bold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {activity.location.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[11px] uppercase tracking-wider px-3 py-1 ${badge.color} flex items-center gap-1.5`}>
                    {badge.icon}
                    <span className="hidden sm:inline">{badge.label.split('(')[0]}</span>
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">
                  {/* Current Activity Title */}
                  <div className="space-y-1">
                    <h5 className="font-black text-base sm:text-lg text-neutral-100 uppercase tracking-tight">
                      {activity.title}
                    </h5>
                    <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed">
                      {activity.subtitle}
                    </p>
                  </div>

                  {/* Partner Group / Handover Connection */}
                  {activity.partnerGroup && (
                    <div className="flex items-center gap-3 p-3 bg-neutral-900 border-2 border-neutral-800 text-xs">
                      <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0" />
                      <span className="text-neutral-300 font-medium">
                        {activity.activityType === 'scenario_extra' ? (
                          <>
                            <strong className="text-white uppercase font-black">{isEn ? 'HANDOVER TO:' : 'PASSAGGIO CONSEGNE:'}</strong> {isEn ? `Group ${group.id} will transfer patients to ` : `Il Gruppo ${group.id} consegnerà i pazienti al `}<strong className="text-orange-400 font-black">{isEn ? `Group ${activity.partnerGroup}` : `Gruppo ${activity.partnerGroup}`}</strong> (Shock Room ED).
                          </>
                        ) : activity.activityType === 'scenario_intra' ? (
                          <>
                            <strong className="text-white uppercase font-black">{isEn ? 'PATIENT INTAKE:' : 'PRESA IN CARICO:'}</strong> {isEn ? `Group ${group.id} receives incoming patients from ` : `Il Gruppo ${group.id} riceve i pazienti dal `}<strong className="text-red-400 font-black">{isEn ? `Group ${activity.partnerGroup}` : `Gruppo ${activity.partnerGroup}`}</strong> ({isEn ? 'Out-of-Hospital' : 'Extraospedaliero'}).
                          </>
                        ) : (
                          <>
                            <strong className="text-white uppercase font-black">{isEn ? 'HANDOVER ALIGNMENT:' : 'ALLINEAMENTO HANDOVER:'}</strong> {isEn ? `Connected with Group ${activity.partnerGroup}.` : `Connesso al Gruppo ${activity.partnerGroup}.`}
                          </>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Assigned Faculty Tutors */}
                  <div className="pt-3 border-t-2 border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-neutral-400 font-medium flex-wrap">
                      <Users className="w-4 h-4 text-orange-400 flex-shrink-0" />
                      <span className="font-bold uppercase tracking-wider">FACULTY:</span>
                      <span className="font-bold text-neutral-200">
                        {groupFaculty.map((f) => f.name.split(' ')[1] || f.name).join(', ')}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                      className="min-h-[40px] px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-orange-500 text-neutral-100 hover:text-orange-400 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      {isExpanded
                        ? (isEn ? '[- HIDE TEAMS]' : '[- NASCONDI SQUADRE]')
                        : (isEn ? '[+ VIEW 15 OPERATORS]' : '[+ DETTAGLIO 15 OPERATORI]')}
                    </button>
                  </div>

                  {/* Expandable Squad Details */}
                  {isExpanded && (
                    <div className="p-4 bg-neutral-900 border-2 border-neutral-800 space-y-3 mt-2">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-black text-neutral-400">
                        {isEn ? 'TEAM COMPOSITION & ROLES:' : 'COMPOSIZIONE SQUADRE & RUOLI:'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {group.squads.map((squadId) => {
                          const squadDiscenti = discenti.filter((d) => d.teamId === squadId);
                          const squadFaculty = faculty.find((f) => f.assignedTeamId === squadId);
                          return (
                            <div key={squadId} className="p-3 bg-neutral-950 border border-neutral-800">
                              <div className="flex items-center justify-between mb-2 pb-1 border-b border-neutral-800">
                                <span className="font-black text-xs text-white uppercase">{getTeamCodeName(squadId)}</span>
                                <span className="text-[10px] text-orange-400 font-bold font-mono">TUTOR: {squadFaculty?.name.split(' ')[1]}</span>
                              </div>
                              <ul className="space-y-1">
                                {squadDiscenti.map((d) => (
                                  <li key={d.id} className="text-[11px] text-neutral-300 flex items-center justify-between">
                                    <span className="truncate max-w-[120px] font-medium">{d.name}</span>
                                    <span className="text-[9px] font-mono text-neutral-400 truncate max-w-[70px] uppercase">{translateRoleOrSpecialty(d.role.split('/')[0], language)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
