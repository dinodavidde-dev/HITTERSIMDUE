import React, { useState, useMemo } from 'react';
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
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  Sparkles,
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
  onSelectSlot?: (slotId: string) => void;
  inspectedSlotId?: string | null;
}

interface MergedTimelineEntry {
  id: string;
  isWorkshop: boolean;
  wsType?: 'WS1' | 'WS2' | 'WS';
  timeRange: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  title: string;
  subtitle: string;
  locationName: string;
  badgeText: string;
  badgeStyle: string;
  iconType: 'tccc' | 'shock' | 'workshop' | 'pause' | 'clock';
  isCurrentActive: boolean;
  slots: TimelineSlot[];
  isPreAllerta?: boolean;
  isStandbySR?: boolean;
  isHandover?: boolean;
  isDebriefing?: boolean;
}

export const DiscentePersonalTimeline: React.FC<DiscentePersonalTimelineProps> = ({
  discente,
  assignedFaculty,
  currentActiveSlotId,
  activeDay: courseActiveDay,
  onSelectSlot,
  inspectedSlotId,
}) => {
  const { language } = useCourse();
  const isEn = language === 'en';
  const [selectedDay, setSelectedDay] = useState<2 | 3>(courseActiveDay === 3 ? 3 : 2);
  const [expandedWorkshops, setExpandedWorkshops] = useState<Record<string, boolean>>({});

  // Ensure personalized timeline day automatically stays parallel to master course day
  React.useEffect(() => {
    setSelectedDay(courseActiveDay === 3 ? 3 : 2);
  }, [courseActiveDay]);

  const studentGroup: GroupType = discente.teamId <= 3 ? 'A' : discente.teamId <= 6 ? 'B' : discente.teamId <= 9 ? 'C' : 'D';
  const groupLabel = studentGroup === 'A' ? 'ALPHA' : studentGroup === 'B' ? 'BRAVO' : studentGroup === 'C' ? 'CHARLIE' : 'DELTA';
  const stationNum = (((discente?.teamId || 1) - 1) % 3) + 1;
  const isTeamLeader = (discente?.id || '') === `disc-${((discente?.teamId || 1) - 1) * 5 + 1}` || ((discente?.role || '').toLowerCase().includes('leader'));

  const toggleExpand = (id: string) => {
    setExpandedWorkshops((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
  const daySlots = useMemo(() => rawDaySlots.map((s) => translateSlot(s, language)), [rawDaySlots, language]);

  // Merge consecutive workshop slots into a unified single time item with start & end times defined
  const mergedEntries = useMemo<MergedTimelineEntry[]>(() => {
    const isSlotWorkshop = (slot: TimelineSlot): { isWs: boolean; wsType: 'WS1' | 'WS2' | 'WS' } => {
      const act = slot.groupActivities?.[studentGroup];
      const slotTitle = (slot.title || '').toLowerCase();
      const text = `${act?.title || ''} ${act?.subtitle || ''} ${act?.location || ''}`.toLowerCase();
      const actType = act?.activityType || '';

      const isWS1 = text.includes('ws1') || text.includes('vie aeree') || text.includes('crico') || text.includes('airway');
      const isWS2 = text.includes('ws2') || text.includes('ecografia') || text.includes('fast') || text.includes('accessi') || text.includes('ultrasound');
      const isScenario =
        text.includes('shock') ||
        text.includes('tccc') ||
        text.includes('tattic') ||
        actType === 'scenario_extra' ||
        actType === 'scenario_intra';

      const isWs = (actType === 'workshop' || text.includes('workshop') || isWS1 || isWS2) && !isScenario;
      const wsType = isWS1 ? 'WS1' : isWS2 ? 'WS2' : 'WS';
      return { isWs, wsType };
    };

    const entries: MergedTimelineEntry[] = [];
    let i = 0;

    while (i < daySlots.length) {
      const current = daySlots[i];
      const wsInfo = isSlotWorkshop(current);

      if (wsInfo.isWs) {
        // Collect all consecutive slots belonging to the same workshop block
        const workshopGroupSlots: TimelineSlot[] = [current];
        let j = i + 1;
        while (j < daySlots.length) {
          const nextSlot = daySlots[j];
          const nextWsInfo = isSlotWorkshop(nextSlot);
          if (nextWsInfo.isWs && (nextWsInfo.wsType === wsInfo.wsType || wsInfo.wsType === 'WS')) {
            workshopGroupSlots.push(nextSlot);
            j++;
          } else {
            break;
          }
        }

        const firstRange = workshopGroupSlots[0].timeRange || '08:30 - 08:45';
        const lastRange = workshopGroupSlots[workshopGroupSlots.length - 1].timeRange || '10:00 - 10:15';
        const startTime = firstRange.split('-')[0].trim();
        const endTime = lastRange.split('-')[1]?.trim() || lastRange.split('-')[0].trim();
        const totalDuration = workshopGroupSlots.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

        const isCurrentActive = workshopGroupSlots.some(
          (s) => s.id === currentActiveSlotId && courseActiveDay === selectedDay
        );

        const isWS1 = wsInfo.wsType === 'WS1';
        const isWS2 = wsInfo.wsType === 'WS2';

        const wsTitle = isWS1
          ? isEn
            ? 'SKILL WORKSHOP 1 (WS1) • ADVANCED AIRWAY & JUNCTIONAL BLEEDING'
            : 'SKILL WORKSHOP 1 (WS1) • VIE AEREE AVANZATE & EMORRAGIE GIUNZIONALI'
          : isWS2
          ? isEn
            ? 'SKILL WORKSHOP 2 (WS2) • CLINICAL ULTRASOUND (e-FAST) & VASCULAR ACCESS'
            : 'SKILL WORKSHOP 2 (WS2) • ECOGRAFIA CLINICA (e-FAST) & ACCESSI VASCOLARI'
          : isEn
          ? 'CLINICAL PROCEDURAL WORKSHOP'
          : 'SKILL WORKSHOP CLINICO';

        const wsSubtitle = isWS1
          ? isEn
            ? 'Cricothyroidotomy, video-laryngoscopy, extraglottic airway, wound packing, and junctional tourniquets.'
            : 'Cricotiroidotomia chirurgica d\'urgenza, videolaringoscopia, presidi sovraglottici, wound packing e tourniquet giunzionali.'
          : isWS2
          ? isEn
            ? 'Focused scans (e-FAST thorax, abdomen, cardiac window), ultrasound-guided peripheral venous access and intraosseous (IO).'
            : 'Scansioni ecografiche mirate (e-FAST torace, addome, pericardio), accessi venosi ecoguidati e accessi intraossei (IO).'
          : isEn
          ? 'Intensive procedural skills training session.'
          : 'Sessione di addestramento procedurale intensivo.';

        const wsLocation = isWS1
          ? isEn ? 'Skills Lab WS1 Room' : 'Aula Skills Lab WS1'
          : isWS2
          ? isEn ? 'Skills Lab WS2 Room' : 'Aula Skills Lab WS2'
          : isEn ? 'Workshop Room' : 'Aula Workshop';

        entries.push({
          id: `merged-ws-${workshopGroupSlots[0].id}`,
          isWorkshop: true,
          wsType: wsInfo.wsType,
          timeRange: `${startTime} - ${endTime}`,
          startTime,
          endTime,
          durationMinutes: totalDuration,
          title: wsTitle,
          subtitle: wsSubtitle,
          locationName: wsLocation,
          badgeText: isWS1
            ? 'SKILL WORKSHOP 1 (WS1)'
            : isWS2
            ? 'SKILL WORKSHOP 2 (WS2)'
            : (isEn ? 'CLINICAL WORKSHOP' : 'WORKSHOP CLINICO'),
          badgeStyle: 'bg-emerald-950 text-emerald-300 border-emerald-600',
          iconType: 'workshop',
          isCurrentActive,
          slots: workshopGroupSlots,
        });

        i = j;
      } else {
        // Non-workshop slot (TCCC, Shock Room, Pausa, Briefing) - strictly use the learner's own activity
        const act = current.groupActivities?.[studentGroup];
        const text = `${act?.title || ''} ${act?.subtitle || ''} ${act?.location || ''}`.toLowerCase();
        const actType = act?.activityType || '';

        const isTCCC =
          text.includes('tccc') ||
          text.includes('tattic') ||
          text.includes('tactical') ||
          actType === 'scenario_extra';

        const isShockRoom =
          text.includes('shock room') ||
          text.includes('box shock') ||
          text.includes('box sr') ||
          actType === 'scenario_intra';

        const isPreAllerta =
          isTCCC &&
          (text.includes('pre-alert') ||
            text.includes('pre-allerta') ||
            text.includes('preallerta') ||
            text.includes('t -15') ||
            text.includes('t-15'));
        const isStandbySR =
          isShockRoom &&
          (text.includes('pre-allerta') ||
            text.includes('pre-alert') ||
            text.includes('standby attivo') ||
            text.includes('t -15') ||
            text.includes('t-15'));
        const isBriefingSR =
          isShockRoom && !isStandbySR && text.includes('briefing shock room');
        const isHandover = text.includes('handover') || text.includes('sbar');
        const isDebriefing = text.includes('debriefing');
        const isPausa = text.includes('pausa') || text.includes('ristoro') || text.includes('pranzo') || text.includes('break') || text.includes('lunch');

        const isCurrentActive = currentActiveSlotId === current.id && courseActiveDay === selectedDay;

        const timeParts = (current.timeRange || '').split('-');
        const startTime = timeParts[0]?.trim() || '';
        const endTime = timeParts[1]?.trim() || '';

        let badgeText = isEn ? 'ACTIVITY' : 'ATTIVITÀ';
        let badgeStyle = 'bg-neutral-800 text-neutral-300 border-neutral-700';
        let locationName = act?.location ? translateLocation(act.location, language) : (isEn ? 'Course Venue' : 'Sede del Corso');
        let iconType: 'tccc' | 'shock' | 'workshop' | 'pause' | 'clock' = 'clock';

        const isMascal = text.includes('mascal') || current.id === 'd2-mascal-scenario';
        const isNightGate = current.id === 'd2-gate-discenti-notturno';
        const isNightStaff = current.id === 'd2-staff-briefing-notturno';

        if (isMascal) {
          badgeText = isEn ? 'MASCAL NIGHT SCENARIO (21:00)' : 'SCENARIO NOTTURNO MASCAL (21:00)';
          badgeStyle = 'bg-red-950 text-red-300 border-red-600 animate-pulse font-black';
          locationName = isEn ? 'Tactical Ground & Field Hospital' : 'Area Tattica Esterna & Ospedale da Campo';
          iconType = 'tccc';
        } else if (isNightGate) {
          badgeText = isEn ? 'MASCAL GATE OPENING (20:30)' : 'APERTURA GATE MASCAL (20:30)';
          badgeStyle = 'bg-red-950 text-red-200 border-red-500';
          locationName = isEn ? 'Central Gate' : 'Gate Centrale & Piazzale';
          iconType = 'clock';
        } else if (isNightStaff) {
          badgeText = isEn ? 'STAFF CONVOCATION (20:00)' : 'CONVOCAZIONE STAFF (20:00)';
          badgeStyle = 'bg-amber-950 text-amber-300 border-amber-600';
          locationName = isEn ? 'Control Room (Gate Closed)' : 'Centrale Regia (Gate Chiuso)';
          iconType = 'clock';
        } else if (isTCCC) {
          badgeText = isHandover
            ? (isEn ? 'SBAR HANDOVER (TCCC)' : 'HANDOVER SBAR (TCCC)')
            : isPreAllerta
            ? (isEn ? 'TCCC PRE-ALERT (T -15)' : 'PRE-ALLERTA TCCC (T -15)')
            : isDebriefing
            ? (isEn ? 'TCCC DEBRIEFING' : 'DEBRIEFING TCCC')
            : (isEn ? 'TCCC ENVIRONMENT' : 'AMBIENTE TCCC');
          badgeStyle = 'bg-orange-950 text-orange-300 border-orange-700';
          locationName = isEn ? `Tactical Environment ${stationNum}` : `Ambiente Tattico ${stationNum}`;
          iconType = 'tccc';
        } else if (isShockRoom) {
          badgeText = isHandover
            ? (isEn ? 'SBAR HANDOVER (SHOCK ROOM)' : 'HANDOVER SBAR (SHOCK ROOM)')
            : isStandbySR
            ? (isEn ? 'PRE-ALERT SHOCK ROOM (T -15)' : 'PRE-ALLERTA SHOCK ROOM (T -15)')
            : isBriefingSR
            ? (isEn ? 'SHOCK ROOM BRIEFING' : 'BRIEFING SHOCK ROOM')
            : isDebriefing
            ? (isEn ? 'SHOCK ROOM DEBRIEFING' : 'DEBRIEFING SHOCK ROOM')
            : 'SHOCK ROOM';
          badgeStyle = 'bg-cyan-950 text-cyan-300 border-cyan-700';
          locationName = isEn ? `Shock Room Box ${stationNum}` : `Box Shock Room ${stationNum}`;
          iconType = 'shock';
        } else if (isPausa) {
          badgeText = isEn ? 'BREAK & REFRESHMENT' : 'PAUSA & RISTORO';
          badgeStyle = 'bg-neutral-900 text-neutral-400 border-neutral-800';
          locationName = isEn ? 'Social Area' : 'Area Conviviale';
          iconType = 'pause';
        }

        entries.push({
          id: current.id,
          isWorkshop: false,
          timeRange: current.timeRange,
          startTime,
          endTime,
          durationMinutes: current.durationMinutes,
          title: act?.title || current.title,
          subtitle: act?.subtitle || '',
          locationName,
          badgeText,
          badgeStyle,
          iconType,
          isCurrentActive,
          slots: [current],
          isPreAllerta,
          isStandbySR,
          isHandover,
          isDebriefing,
        });

        i++;
      }
    }

    return entries;
  }, [daySlots, studentGroup, currentActiveSlotId, courseActiveDay, selectedDay, language, isEn, stationNum]);

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

      {/* Simplified Timeline Notice */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-600/40 rounded text-xs font-mono text-emerald-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isEn
              ? 'Workshops are merged into unified time blocks with defined start and end times.'
              : 'I workshop sono accorpati in blocchi a tempo unico con orario di inizio e fine definito.'}
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 border border-emerald-700/60 rounded hidden sm:inline">
          {isEn ? 'SIMPLIFIED TIMELINE' : 'TIMELINE SEMPLIFICATA'}
        </span>
      </div>

      {/* Slots List (Unified Workshops + Scenarios) */}
      <div className="space-y-3">
        {mergedEntries.map((entry) => {
          if (entry.isWorkshop) {
            const isExpanded = !!expandedWorkshops[entry.id];

            return (
              <div
                key={entry.id}
                className={`p-3.5 sm:p-4 rounded-lg border-2 transition-all ${
                  entry.isCurrentActive
                    ? 'bg-neutral-950 border-emerald-400 shadow-xl ring-2 ring-emerald-400/80'
                    : 'bg-emerald-950/20 border-emerald-600/60 hover:border-emerald-500'
                }`}
              >
                {/* Top Row: Time, Unified Badge, Active Indicator, Location */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Unified Time Badge */}
                    <div className="flex items-center gap-1.5 bg-emerald-950 px-2.5 py-1 border border-emerald-500/80 rounded">
                      <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-mono text-xs sm:text-sm font-black text-white">
                        {entry.timeRange}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 bg-emerald-500 text-black font-mono font-black text-[11px] sm:text-xs uppercase tracking-wider rounded flex items-center gap-1 shadow-sm">
                      <Wrench className="w-3.5 h-3.5" />
                      {entry.badgeText}
                    </span>

                    <span className="px-2 py-0.5 bg-neutral-950 text-emerald-300 font-mono text-[10px] sm:text-[11px] font-bold border border-emerald-800 rounded">
                      {isEn ? 'UNIFIED TIME (90 MIN)' : 'TEMPO UNICO (90 MIN)'}
                    </span>

                    {entry.isCurrentActive && (
                      <span className="px-2.5 py-0.5 bg-emerald-400 text-black font-mono font-black text-[10px] uppercase rounded animate-pulse shadow-sm">
                        ● {isEn ? 'WORKSHOP ACTIVE NOW' : 'WORKSHOP IN CORSO ORA'}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-mono text-neutral-300 flex items-center gap-1.5 bg-neutral-950/80 px-2.5 py-1 border border-neutral-800 rounded self-start sm:self-auto">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-white">{entry.locationName}</span>
                  </div>
                </div>

                {/* Explicit Start and End Times Grid */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 bg-neutral-950/90 border border-emerald-500/40 rounded font-mono text-xs">
                  <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 uppercase block font-semibold">
                      {isEn ? 'START TIME' : 'ORARIO INIZIO'}
                    </span>
                    <strong className="text-white text-sm sm:text-base font-black">
                      {entry.startTime}
                    </strong>
                  </div>
                  <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 uppercase block font-semibold">
                      {isEn ? 'END TIME' : 'ORARIO FINE'}
                    </span>
                    <strong className="text-white text-sm sm:text-base font-black">
                      {entry.endTime}
                    </strong>
                  </div>
                  <div className="bg-neutral-900/80 p-2 rounded border border-neutral-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-neutral-400 uppercase block font-semibold">
                      {isEn ? 'TOTAL TIME' : 'DURATA COMPLESSIVA'}
                    </span>
                    <strong className="text-emerald-400 text-sm sm:text-base font-black">
                      {entry.durationMinutes} min ({isEn ? 'Single Block' : 'Tempo Unico'})
                    </strong>
                  </div>
                </div>

                {/* Description & Clinical Content */}
                <div className="mt-2.5 space-y-1">
                  <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                    {entry.title}
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    {entry.subtitle}
                  </p>
                </div>

                {/* Faculty & Squad Info */}
                <div className="mt-3 pt-2.5 border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-neutral-400">
                  <div className="flex items-center gap-3">
                    <span>
                      {isEn ? 'Activity:' : 'Attività:'}{' '}
                      <strong className="text-emerald-400 font-bold">
                        {entry.wsType || 'Skill Station Workshop'}
                      </strong>
                    </span>
                    <span>
                      Faculty: <strong className="text-orange-400">{assignedFaculty.badgeCode}</strong> ({assignedFaculty.name})
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    {isEn ? 'Continuous Session • No Operational Sub-Phases' : 'Sessione Continua • Senza Fasi Operative'}
                  </span>
                </div>
              </div>
            );
          }

          // Non-Workshop Entry (TCCC, Shock Room, Pausa, Briefing)
          let icon = <Clock className="w-3.5 h-3.5" />;
          if (entry.iconType === 'tccc') {
            icon = <Crosshair className="w-3.5 h-3.5 text-orange-400" />;
          } else if (entry.iconType === 'shock') {
            icon = <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />;
          } else if (entry.iconType === 'pause') {
            icon = <Coffee className="w-3.5 h-3.5 text-cyan-400" />;
          }

          return (
            <div
              key={entry.id}
              className={`p-3 rounded border transition-all ${
                entry.isCurrentActive
                  ? 'bg-neutral-950 border-cyan-400 shadow-md ring-1 ring-cyan-400'
                  : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-white bg-neutral-900 px-2.5 py-1 border border-neutral-800 rounded">
                    {entry.timeRange}
                  </span>
                  <span className={`px-2 py-0.5 text-[11px] font-mono font-bold uppercase border rounded flex items-center gap-1 ${entry.badgeStyle}`}>
                    {icon}
                    {entry.badgeText}
                  </span>
                  {entry.isCurrentActive && (
                    <span className="px-2 py-0.5 bg-cyan-600 text-black font-mono font-black text-[10px] uppercase rounded animate-pulse">
                      ● {isEn ? 'ACTIVE NOW' : 'IN CORSO ORA'}
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-neutral-200 font-semibold">{entry.locationName}</span>
                </div>
              </div>

              {/* Informazioni Ruolo e Faculty (Rapporto 1:1) */}
              <div className="mt-2 pt-2 border-t border-neutral-800/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-neutral-400">
                <div className="flex items-center gap-3">
                  {(entry.iconType === 'tccc' || entry.iconType === 'shock') && (
                    <span>
                      {isEn ? 'Role:' : 'Ruolo:'}{' '}
                      <strong className={entry.isCurrentActive && discente.activeScenarioRole ? 'text-cyan-300 font-bold' : 'text-neutral-400'}>
                        {entry.isCurrentActive && discente.activeScenarioRole
                          ? `⚡ ${discente.activeScenarioRole}`
                          : (isEn ? 'Assigned in Pre-Alert by Faculty' : 'Assegnato in Pre-Allerta dal Faculty')}
                      </strong>
                    </span>
                  )}
                  <span>
                    Faculty: <strong className="text-orange-400">{assignedFaculty.badgeCode}</strong> ({assignedFaculty.name})
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  {entry.durationMinutes} min • {isEn ? 'Team' : 'Squadra'} {discente.teamId}
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
