import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Crosshair,
  Stethoscope,
  Wrench,
  Coffee,
  CheckCircle2,
  Activity,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Award,
} from 'lucide-react';
import { Discente, Faculty, GroupType, TimelineSlot } from '../../types';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { useCourse } from '../../context/CourseContext';
import { translateSlot, translateLocation } from '../../utils/courseTranslation';

interface DiscentePersonalTimelineProps {
  discente: Discente;
  assignedFaculty: Faculty;
  currentActiveSlotId?: string;
  activeDay: number;
}

export const DiscentePersonalTimeline: React.FC<DiscentePersonalTimelineProps> = ({
  discente,
  assignedFaculty,
  currentActiveSlotId,
  activeDay: courseActiveDay,
}) => {
  const { language } = useCourse();
  const isEn = language === 'en';
  const [selectedDay, setSelectedDay] = useState<2 | 3>(courseActiveDay === 3 ? 3 : 2);

  const studentGroup: GroupType = discente.teamId <= 3 ? 'A' : discente.teamId <= 6 ? 'B' : discente.teamId <= 9 ? 'C' : 'D';
  const groupLabel = studentGroup === 'A' ? 'ALPHA' : studentGroup === 'B' ? 'BRAVO' : studentGroup === 'C' ? 'CHARLIE' : 'DELTA';
  const stationNum = ((discente.teamId - 1) % 3) + 1;
  const isTeamLeader = discente.id === `disc-${(discente.teamId - 1) * 5 + 1}` || (discente.role?.toLowerCase().includes('leader') ?? false);

  // Specular rotation roadmap summary
  const rotationInfo = {
    A: {
      d2: isEn
        ? 'Block 1: TCCC ➔ Block 2: WS2 ➔ Block 3: WS1 ➔ Block 4: Shock Room'
        : 'Blocco 1: TCCC ➔ Blocco 2: WS2 ➔ Blocco 3: WS1 ➔ Blocco 4: Shock Room',
      d3: isEn
        ? 'Block 1: WS2 ➔ Block 2: Shock Room ➔ Block 3: TCCC ➔ Block 4: WS1'
        : 'Blocco 1: WS2 ➔ Blocco 2: Shock Room ➔ Blocco 3: TCCC ➔ Blocco 4: WS1',
    },
    B: {
      d2: isEn
        ? 'Block 1: WS1 ➔ Block 2: Shock Room ➔ Block 3: TCCC ➔ Block 4: WS2'
        : 'Blocco 1: WS1 ➔ Blocco 2: Shock Room ➔ Blocco 3: TCCC ➔ Blocco 4: WS2',
      d3: isEn
        ? 'Block 1: TCCC ➔ Block 2: WS1 ➔ Block 3: WS2 ➔ Block 4: Shock Room'
        : 'Blocco 1: TCCC ➔ Blocco 2: WS1 ➔ Blocco 3: WS2 ➔ Blocco 4: Shock Room',
    },
    C: {
      d2: isEn
        ? 'Block 1: Shock Room ➔ Block 2: WS1 ➔ Block 3: WS2 ➔ Block 4: TCCC'
        : 'Blocco 1: Shock Room ➔ Blocco 2: WS1 ➔ Blocco 3: WS2 ➔ Blocco 4: TCCC',
      d3: isEn
        ? 'Block 1: WS1 ➔ Block 2: TCCC ➔ Block 3: Shock Room ➔ Block 4: WS2'
        : 'Blocco 1: WS1 ➔ Blocco 2: TCCC ➔ Blocco 3: Shock Room ➔ Blocco 4: WS2',
    },
    D: {
      d2: isEn
        ? 'Block 1: WS2 ➔ Block 2: TCCC ➔ Block 3: Shock Room ➔ Block 4: WS1'
        : 'Blocco 1: WS2 ➔ Blocco 2: TCCC ➔ Blocco 3: Shock Room ➔ Blocco 4: WS1',
      d3: isEn
        ? 'Block 1: Shock Room ➔ Block 2: WS2 ➔ Block 3: WS1 ➔ Block 4: TCCC'
        : 'Blocco 1: Shock Room ➔ Blocco 2: WS2 ➔ Blocco 3: WS1 ➔ Blocco 4: TCCC',
    },
  }[studentGroup];

  // Filter slots for the selected day, excluding staff setup slots
  const rawDaySlots = INITIAL_TIMELINE_SLOTS.filter(
    (s) => s.day === selectedDay && !s.id.includes('setup')
  );
  const daySlots = rawDaySlots.map((s) => translateSlot(s, language));

  return (
    <div className="bg-neutral-900 border-2 border-cyan-500/70 p-3 sm:p-5 rounded shadow-xl space-y-4">
      {/* Top Bar with Day Selector & Group Rotation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
            {isEn ? 'LEARNER PERSONAL TIMELINE • 2 DAYS' : 'TIMELINE PERSONALIZZATA DISCENTE • 2 GIORNATE'}
          </span>
          <h3 className="text-base sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 mt-0.5">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
            <span>{discente.badgeCode} • {discente.name}</span>
          </h3>
        </div>

        {/* Day 2 vs Day 3 Switcher */}
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 border border-neutral-800 rounded self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedDay(2)}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-mono font-black uppercase rounded transition-colors cursor-pointer ${
              selectedDay === 2
                ? 'bg-cyan-600 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {isEn ? 'DAY 2' : 'GIORNO 2'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedDay(3)}
            className={`min-h-[38px] px-3 py-1.5 text-xs font-mono font-black uppercase rounded transition-colors cursor-pointer ${
              selectedDay === 3
                ? 'bg-cyan-600 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {isEn ? 'DAY 3' : 'GIORNO 3'}
          </button>
        </div>
      </div>

      {/* Traiettoria Rotazione Speculare del Gruppo */}
      <div className="bg-neutral-950/90 border border-neutral-800 px-3 py-2.5 rounded flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-neutral-300 flex-wrap">
          <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold rounded text-[11px]">
            {isEn ? `GROUP ${groupLabel} (TEAM ${discente.teamId})` : `GRUPPO ${groupLabel} (SQ ${discente.teamId})`}
          </span>
          <span className="text-neutral-400 text-[11px]">{isEn ? `Day ${selectedDay} Rotation:` : `Rotazione Day ${selectedDay}:`}</span>
        </div>
        <div className="text-cyan-300 font-bold text-[11px] sm:text-xs leading-relaxed break-words">
          {selectedDay === 2 ? rotationInfo.d2 : rotationInfo.d3}
        </div>
      </div>

      {/* Slots List */}
      <div className="space-y-2.5">
        {daySlots.map((slot, index) => {
          const act = slot.groupActivities?.[studentGroup];
          const slotTitle = (slot.title || '').toLowerCase();
          const text = `${act?.title || ''} ${act?.subtitle || ''} ${act?.location || ''}`.toLowerCase();
          const actType = act?.activityType || '';

          const isTCCC =
            text.includes('tccc') ||
            text.includes('tattic') ||
            text.includes('tactical') ||
            actType === 'scenario_extra' ||
            (slotTitle.includes('tccc') && !text.includes('shock') && !text.includes('ws'));

          const isShockRoom =
            text.includes('shock room') ||
            text.includes('box shock') ||
            actType === 'scenario_intra' ||
            (slotTitle.includes('shock room') && !text.includes('tccc') && !text.includes('ws'));

          const isWS1 = text.includes('ws1') || text.includes('vie aeree') || text.includes('crico') || text.includes('airway');
          const isWS2 = text.includes('ws2') || text.includes('ecografia') || text.includes('fast') || text.includes('accessi') || text.includes('ultrasound');
          const isWorkshop = actType === 'workshop' || text.includes('workshop') || isWS1 || isWS2;

          const isPreAllerta = isTCCC && (slotTitle.includes('pre-alert') || text.includes('pre-allerta') || text.includes('preallerta'));
          const isStandbySR = isShockRoom && (text.includes('standby') || slotTitle.includes('standby'));
          const isHandover = slotTitle.includes('handover') || text.includes('handover') || text.includes('sbar');
          const isDebriefing = text.includes('debriefing') || slotTitle.includes('debriefing');
          const isPausa = text.includes('pausa') || text.includes('ristoro') || text.includes('pranzo') || text.includes('break') || text.includes('lunch');

          const isCurrentActive = currentActiveSlotId === slot.id && courseActiveDay === selectedDay;

          let badgeText = isEn ? 'ACTIVITY' : 'ATTIVITÀ';
          let badgeStyle = 'bg-neutral-800 text-neutral-300 border-neutral-700';
          let locationName = act?.location ? translateLocation(act.location, language) : (isEn ? 'Course Venue' : 'Sede del Corso');
          let icon = <Clock className="w-3.5 h-3.5" />;

          if (isTCCC) {
            badgeText = isHandover
              ? (isEn ? 'SBAR HANDOVER (TCCC)' : 'HANDOVER SBAR (TCCC)')
              : isPreAllerta
              ? (isEn ? 'TCCC PRE-ALERT (T -15)' : 'PRE-ALLERTA TCCC (T -15)')
              : isDebriefing
              ? (isEn ? 'TCCC DEBRIEFING' : 'DEBRIEFING TCCC')
              : (isEn ? 'TCCC ENVIRONMENT' : 'AMBIENTE TCCC');
            badgeStyle = 'bg-orange-950 text-orange-300 border-orange-700';
            locationName = isEn ? `Tactical Environment ${stationNum}` : `Ambiente Tattico ${stationNum}`;
            icon = <Crosshair className="w-3.5 h-3.5 text-orange-400" />;
          } else if (isShockRoom) {
            badgeText = isHandover
              ? (isEn ? 'SBAR HANDOVER (SHOCK ROOM)' : 'HANDOVER SBAR (SHOCK ROOM)')
              : isStandbySR
              ? (isEn ? 'SR BOX STANDBY (T -15)' : 'STANDBY BOX SR (T -15)')
              : isDebriefing
              ? (isEn ? 'SHOCK ROOM DEBRIEFING' : 'DEBRIEFING SHOCK ROOM')
              : 'SHOCK ROOM';
            badgeStyle = 'bg-cyan-950 text-cyan-300 border-cyan-700';
            locationName = isEn ? `Shock Room Box ${stationNum}` : `Box Shock Room ${stationNum}`;
            icon = <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />;
          } else if (isWorkshop) {
            badgeText = isWS1 ? 'SKILL WORKSHOP 1 (WS1)' : isWS2 ? 'SKILL WORKSHOP 2 (WS2)' : (isEn ? 'CLINICAL WORKSHOP' : 'WORKSHOP CLINICO');
            badgeStyle = 'bg-emerald-950 text-emerald-300 border-emerald-700';
            locationName = isWS1
              ? (isEn ? 'Skills Lab WS1 Room' : 'Aula Skills Lab WS1')
              : isWS2
              ? (isEn ? 'Skills Lab WS2 Room' : 'Aula Skills Lab WS2')
              : (act?.location ? translateLocation(act.location, language) : (isEn ? 'Workshop Room' : 'Aula Workshop'));
            icon = <Wrench className="w-3.5 h-3.5 text-emerald-400" />;
          } else if (isPausa) {
            badgeText = isEn ? 'BREAK & REFRESHMENT' : 'PAUSA & RISTORO';
            badgeStyle = 'bg-neutral-900 text-neutral-400 border-neutral-800';
            locationName = isEn ? 'Social Area' : 'Area Conviviale';
            icon = <Coffee className="w-3.5 h-3.5 text-cyan-400" />;
          }

          return (
            <div
              key={slot.id}
              className={`p-3 rounded border transition-all ${
                isCurrentActive
                  ? 'bg-neutral-950 border-cyan-400 shadow-md ring-1 ring-cyan-400'
                  : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-white bg-neutral-900 px-2.5 py-1 border border-neutral-800 rounded">
                    {slot.timeRange}
                  </span>
                  <span className={`px-2 py-0.5 text-[11px] font-mono font-bold uppercase border rounded flex items-center gap-1 ${badgeStyle}`}>
                    {icon}
                    {badgeText}
                  </span>
                  {isCurrentActive && (
                    <span className="px-2 py-0.5 bg-cyan-600 text-black font-mono font-black text-[10px] uppercase rounded animate-pulse">
                      ● {isEn ? 'ACTIVE NOW' : 'IN CORSO ORA'}
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-neutral-200 font-semibold">{locationName}</span>
                </div>
              </div>

              {/* Informazioni Ruolo e Faculty (Rapporto 1:1) */}
              <div className="mt-2 pt-2 border-t border-neutral-800/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-neutral-400">
                <div className="flex items-center gap-3">
                  <span>
                    {isEn ? 'Role:' : 'Ruolo:'}{' '}
                    <strong className={isTeamLeader ? 'text-cyan-300 font-bold' : 'text-neutral-200'}>
                      {isTeamLeader ? 'Team Leader (TL)' : (isEn ? 'Operator' : 'Operatore')}
                    </strong>
                  </span>
                  <span>
                    Faculty: <strong className="text-orange-400">{assignedFaculty.badgeCode}</strong> ({assignedFaculty.name})
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  {slot.durationMinutes} min • {isEn ? 'Team' : 'Squadra'} {discente.teamId}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Avvertenza sulla Riservatezza dei Casi Clinici */}
      <div className="bg-neutral-950 border border-neutral-800/80 p-3 rounded flex items-center gap-2.5 text-[11px] font-mono text-neutral-400">
        <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span>
          {isEn
            ? 'Blind simulation protocol: lesion and scenario details are strictly reserved for Faculty to ensure maximum operational realism.'
            : 'Protocollo di simulazione a cieco: i dettagli delle lesioni e degli scenari sono riservati alla Faculty per garantire massimo realismo operativo.'}
        </span>
      </div>
    </div>
  );
};
