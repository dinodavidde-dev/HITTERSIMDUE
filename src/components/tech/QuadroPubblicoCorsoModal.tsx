import React, { useState, useMemo } from 'react';
import {
  Globe,
  X,
  Clock,
  MapPin,
  Activity,
  Flame,
  HeartPulse,
  Stethoscope,
  Gauge,
  Users,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Timer,
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { translateSlot } from '../../utils/courseTranslation';
import { GroupType, CourseDay, TimelineSlot } from '../../types';
import { isScenarioSlot } from '../../utils/scenarioStatusHelper';

interface QuadroPubblicoCorsoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuadroPubblicoCorsoModal: React.FC<QuadroPubblicoCorsoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeDay,
    activeSlotIndex,
    timerSeconds,
    isTimerRunning,
    language,
    simulatorPatients,
  } = useCourse();

  const isEn = language === 'en';
  const [selectedDayTab, setSelectedDayTab] = useState<CourseDay>(activeDay);
  const [activeMenuTab, setActiveMenuTab] = useState<'current' | 'specular' | 'full_schedule' | 'timing_rules'>('current');
  const [inspectSlotId, setInspectSlotId] = useState<string | null>(null);

  // Slots for the selected day
  const dayMasterSlots = useMemo(() => {
    const raw = INITIAL_TIMELINE_SLOTS.filter((s) => s.day === selectedDayTab);
    return raw.map((s) => translateSlot(s, language));
  }, [selectedDayTab, language]);

  // Current active slot in activeDay
  const rawActiveDaySlots = useMemo(() => {
    return INITIAL_TIMELINE_SLOTS.filter((s) => s.day === activeDay);
  }, [activeDay]);

  const rawMasterCurrentSlot =
    INITIAL_TIMELINE_SLOTS[activeSlotIndex] || rawActiveDaySlots[0] || INITIAL_TIMELINE_SLOTS[0];
  const slotIdxInDay = rawActiveDaySlots.findIndex((s) => s.id === rawMasterCurrentSlot?.id);
  const effectiveCurrentIdx = slotIdxInDay >= 0 ? slotIdxInDay : 0;

  const currentActiveSlot = useMemo(() => {
    const activeSlots = rawActiveDaySlots.map((s) => translateSlot(s, language));
    return activeSlots[effectiveCurrentIdx] || activeSlots[0];
  }, [rawActiveDaySlots, effectiveCurrentIdx, language]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Group metadata
  const groupLabels: Record<GroupType, { title: string; range: string; squads: string }> = {
    A: { title: 'ALPHA', range: 'DISC-01 – DISC-15', squads: isEn ? 'Squads 1, 2, 3' : 'Squadre 1, 2, 3' },
    B: { title: 'BRAVO', range: 'DISC-16 – DISC-30', squads: isEn ? 'Squads 4, 5, 6' : 'Squadre 4, 5, 6' },
    C: { title: 'CHARLIE', range: 'DISC-31 – DISC-45', squads: isEn ? 'Squads 7, 8, 9' : 'Squadre 7, 8, 9' },
    D: { title: 'DELTA', range: 'DISC-46 – DISC-60', squads: isEn ? 'Squads 10, 11, 12' : 'Squadre 10, 11, 12' },
  };

  // Helper for group badge colors and icons
  const getGroupBadgeInfo = (group: GroupType, activity: any) => {
    const actTitle = (activity?.title || '').toLowerCase();
    const actLoc = (activity?.location || '').toLowerCase();

    let bg = 'bg-neutral-900 text-neutral-200 border-neutral-700';
    let icon = <Activity className="w-3.5 h-3.5 shrink-0" />;
    let typeLabel = isEn ? 'Clinical' : 'Clinica';
    let ringColor = 'border-neutral-700';

    if (actTitle.includes('tccc') || actLoc.includes('tattico') || actLoc.includes('tactical')) {
      bg = 'bg-emerald-950/90 text-emerald-300 border-emerald-600';
      icon = <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      typeLabel = isEn ? 'TCCC Tactical Environment' : 'TCCC Ambiente Tattico';
      ringColor = 'border-emerald-500';
    } else if (actTitle.includes('shock') || actLoc.includes('shock') || actTitle.includes('sbar')) {
      bg = 'bg-red-950/90 text-red-300 border-red-600';
      icon = <HeartPulse className="w-3.5 h-3.5 text-red-400 shrink-0" />;
      typeLabel = isEn ? 'Shock Room (ABCDE)' : 'Box Shock Room (ABCDE)';
      ringColor = 'border-red-500';
    } else if (actLoc.includes('ws1') || actTitle.includes('ws1') || actTitle.includes('airway')) {
      bg = 'bg-purple-950/90 text-purple-300 border-purple-600';
      icon = <Stethoscope className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      typeLabel = isEn ? 'WS1 (Airway & Hemostasis)' : 'WS1 (Vie Aeree & Emostasi)';
      ringColor = 'border-purple-500';
    } else if (actLoc.includes('ws2') || actTitle.includes('ws2') || actTitle.includes('fast')) {
      bg = 'bg-cyan-950/90 text-cyan-300 border-cyan-600';
      icon = <Gauge className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      typeLabel = isEn ? 'WS2 (FAST Echo & IO Access)' : 'WS2 (Eco FAST & Accessi IO)';
      ringColor = 'border-cyan-500';
    } else if (actTitle.includes('briefing') || actTitle.includes('debrief')) {
      bg = 'bg-blue-950/90 text-blue-300 border-blue-600';
      icon = <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      typeLabel = isEn ? 'Debriefing / Plenary' : 'Debriefing / Plenaria';
      ringColor = 'border-blue-500';
    } else if (actTitle.includes('pausa') || actTitle.includes('ristoro') || actTitle.includes('break') || actTitle.includes('lunch')) {
      bg = 'bg-neutral-900 text-neutral-400 border-neutral-700';
      typeLabel = isEn ? 'Rest Break' : 'Pausa Ristoro';
      ringColor = 'border-neutral-700';
    }

    return { bg, icon, typeLabel, ringColor };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn font-mono">
      <div className="bg-neutral-950 border-2 border-orange-500/80 rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* ========================================================================= */}
        {/* HEADER MODALE */}
        {/* ========================================================================= */}
        <div className="bg-neutral-900 border-b-2 border-orange-500/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-600 to-amber-600 text-black rounded-lg shadow-lg shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-orange-600 text-black font-black text-[10px] uppercase tracking-wider rounded">
                  {isEn ? 'PUBLIC COURSE OVERVIEW' : 'QUADRO PUBBLICO DEL CORSO'}
                </span>
                <span className="text-[11px] text-orange-300 font-bold">
                  DAY 0{activeDay} • {isEn ? 'ACTIVE PHASE' : 'FASE ATTIVA'} {effectiveCurrentIdx + 1}/{rawActiveDaySlots.length}
                </span>
                {isTimerRunning && (
                  <span className="px-2 py-0.5 bg-neutral-950 text-pink-400 border border-neutral-800 text-[10px] rounded flex items-center gap-1 font-bold">
                    <Clock className="w-3 h-3 animate-spin" /> {formatTimer(timerSeconds)}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-0.5">
                {isEn ? 'Course Schedule, Macro-Groups & Clinical Rotations' : 'Cronoprogramma Corso, Macro-Gruppi & Rotazioni Cliniche'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-center p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title={isEn ? 'Close Menu (Esc)' : 'Chiudi Menu (Esc)'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SUB-MENU TABS */}
        {/* ========================================================================= */}
        <div className="bg-neutral-900/90 border-b border-neutral-800 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveMenuTab('current')}
              className={`px-3 py-1.5 text-xs font-black uppercase rounded transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeMenuTab === 'current'
                  ? 'bg-orange-600 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white bg-neutral-950/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isEn ? 'Live Active Phase' : 'Fase Attiva Live'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMenuTab('specular')}
              className={`px-3 py-1.5 text-xs font-black uppercase rounded transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeMenuTab === 'specular'
                  ? 'bg-orange-600 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white bg-neutral-950/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isEn ? 'Specular Rotations (Day 2 vs 3)' : 'Rotazioni Speculari (Day 2 vs 3)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMenuTab('full_schedule')}
              className={`px-3 py-1.5 text-xs font-black uppercase rounded transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeMenuTab === 'full_schedule'
                  ? 'bg-orange-600 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white bg-neutral-950/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isEn ? 'Full Day Schedule' : 'Programma Completo Giornata'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMenuTab('timing_rules')}
              className={`px-3 py-1.5 text-xs font-black uppercase rounded transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeMenuTab === 'timing_rules'
                  ? 'bg-orange-600 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white bg-neutral-950/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isEn ? '90-Min Block Timing Rules' : 'Regole Blocchi 90 Min'}</span>
            </button>
          </div>

          {/* Day Toggle Filter */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 border border-neutral-800 rounded shrink-0">
            <button
              type="button"
              onClick={() => setSelectedDayTab(2)}
              className={`px-2.5 py-1 text-[11px] font-black uppercase rounded transition-all cursor-pointer ${
                selectedDayTab === 2 ? 'bg-orange-500 text-black font-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              DAY 02
            </button>
            <button
              type="button"
              onClick={() => setSelectedDayTab(3)}
              className={`px-2.5 py-1 text-[11px] font-black uppercase rounded transition-all cursor-pointer ${
                selectedDayTab === 3 ? 'bg-orange-500 text-black font-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              DAY 03
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BODY MODALE SCROLLABILE */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* ----------------------------------------------------------------------- */}
          {/* TAB 1: FASE ATTIVA LIVE (4 MACRO-GRUPPI)                                */}
          {/* ----------------------------------------------------------------------- */}
          {activeMenuTab === 'current' && (
            <div className="space-y-5">
              {/* Spotlight Fase Attiva */}
              <div className="bg-neutral-900 border-2 border-orange-500/80 p-4 sm:p-5 rounded-lg shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-orange-950 text-orange-300 border border-orange-700 text-[10px] font-black uppercase rounded">
                        {isEn ? 'ACTIVE TIMELINE SLOT' : 'SLOT ATTIVO REGIA'}
                      </span>
                      <span className="text-white font-bold text-xs">
                        🕒 {currentActiveSlot.timeRange} ({currentActiveSlot.durationMinutes} MIN)
                      </span>
                      {isScenarioSlot(currentActiveSlot) && (
                        <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-600 text-[10px] font-bold uppercase rounded animate-pulse">
                          🔴 {isEn ? 'CLINICAL SCENARIO' : 'SCENARIO CLINICO'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                      {currentActiveSlot.title}
                    </h3>
                  </div>

                  <div className="bg-neutral-950 px-3.5 py-2 border border-neutral-800 rounded font-mono text-left sm:text-right shrink-0">
                    <span className="text-[10px] text-neutral-400 uppercase block font-bold">
                      {isEn ? 'T-Phase Timer:' : 'Timer T-Fase:'}
                    </span>
                    <span className="text-xl font-black text-orange-400">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 font-mono mt-3">
                  {currentActiveSlot.description ||
                    (isEn
                      ? 'Simultaneous rotation of the 4 Macro-Groups across tactical stations, hospital shock room, and skill workshops.'
                      : 'Rotazione simultanea dei 4 Macro-Gruppi tra scenari tattici under-fire, ospedale da campo shock room e workshop specialistici.')}
                </p>
              </div>

              {/* I 4 Macro-Gruppi nella Fase Attiva */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-400" />
                    {isEn
                      ? 'Current Station & Activity of the 4 Macro-Groups (60 Students)'
                      : 'Presidio & Attività dei 4 Macro-Gruppi nella Fase Corrente (60 Discenti)'}
                  </h4>
                  <span className="text-[11px] text-neutral-400">
                    {isEn ? '15 students / 3 squads per group' : '15 discenti / 3 squadre per gruppo'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['A', 'B', 'C', 'D'] as GroupType[]).map((grp) => {
                    const act = currentActiveSlot.groupActivities?.[grp];
                    const badgeInfo = getGroupBadgeInfo(grp, act);
                    const info = groupLabels[grp];

                    return (
                      <div
                        key={grp}
                        className={`p-4 rounded-xl border-2 shadow-xl flex flex-col justify-between space-y-3 transition-all ${badgeInfo.bg}`}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-current/20">
                          <div className="flex items-center gap-2">
                            {badgeInfo.icon}
                            <div>
                              <span className="font-black text-sm uppercase text-white tracking-wide">
                                {info.title}
                              </span>
                              <span className="text-[10px] text-neutral-300 block font-mono">
                                {info.range} • {info.squads}
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-black/60 text-white font-mono font-bold text-[10px] uppercase rounded border border-white/20">
                            {badgeInfo.typeLabel}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h5 className="font-bold text-white text-sm">
                            {act?.title || (isEn ? 'Assigned Clinical Rotation' : 'Rotazione Clinica Assegnata')}
                          </h5>
                          {act?.subtitle && (
                            <p className="text-xs text-neutral-300">
                              {act.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-current/20 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-1.5 text-neutral-200">
                            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <strong className="text-white truncate">
                              {act?.location || (isEn ? 'Dedicated Station' : 'Postazione Dedicata')}
                            </strong>
                          </div>
                          {act?.patientIds && act.patientIds.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-neutral-950 text-pink-300 border border-neutral-700 text-[10px] font-bold rounded">
                              Pt #{act.patientIds.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Note Operative e Scadenze Tassative */}
              <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-lg space-y-2 text-xs font-mono">
                <span className="text-[10px] text-orange-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                  {isEn ? 'Key Operational Timing for Field Coordination:' : 'Linee Guida Orarie per il Coordinamento sul Campo:'}
                </span>
                <ul className="space-y-1.5 text-neutral-300 text-[11px]">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">▸ Min :15 - :30:</span>
                    <span>{isEn ? 'Shock Room teams enter active standby in Box 1-3. Technicians test monitors & FAST probes (T -15 min).' : 'Le squadre Shock Room entrano in standby attivo nei Box 1-3. I tecnici testano monitor e sonde FAST (T -15 min).'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">▸ Tassativo Ore :30:</span>
                    <span>{isEn ? 'Mandatory 1:1 physical litter handover from TCCC to Shock Room with SBAR structured report (duration 5 min, :30-:35).' : 'Tassativo HANDOVER 1:1 barellato da TCCC a Shock Room con report strutturato SBAR (durata 5 min, :30-:35).'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">▸ Min :75 - :90:</span>
                    <span>{isEn ? 'Mandatory 15-minute quick turnaround reset of the 3 Boxes by TECHs before the next block.' : 'Reset tecnico rapido 15 minuti dei 3 Box a cura dei TECH (Turnaround per il blocco successivo).'}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 2: ROTAZIONI DIDATTICHE SPECULARI (DAY 2 vs DAY 3)                 */}
          {/* ----------------------------------------------------------------------- */}
          {activeMenuTab === 'specular' && (
            <div className="space-y-5">
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg space-y-2">
                <span className="text-[10px] text-orange-400 uppercase font-black tracking-wider block">
                  {isEn ? 'RULE 4: SPECULAR CLINICAL ROTATION (DAY 2 vs DAY 3)' : 'REGOLA 4: ROTAZIONE SPECULARE DEI GRUPPI (DAY 2 vs DAY 3)'}
                </span>
                <p className="text-xs text-neutral-300">
                  {isEn
                    ? 'To balance cognitive and emotional load, the clinical rotations are mirrored across Day 2 and Day 3. Each group experiences all 4 core environments in inverted sequences.'
                    : 'Per bilanciare il carico cognitivo ed emotivo, le rotazioni cliniche sono speculari tra il Day 2 e il Day 3. Ogni gruppo affronta tutti i 4 macro-ambienti addestrativi con sequenze bilanciate.'}
                </p>
              </div>

              {/* Tabella comparativa dei 4 Macro-Gruppi */}
              <div className="space-y-4">
                {/* GRUPPO ALPHA */}
                <div className="bg-neutral-900 border-2 border-emerald-800/80 p-4 rounded-xl shadow-lg space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div>
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-wide">
                        GRUPPO ALPHA (DISC-01 – DISC-15)
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {isEn ? 'Squads 1, 2, 3 • 1 TL + 4 Operators per squad' : 'Squadre 1, 2, 3 • 1 Team Leader + 4 Operatori per squadra'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-bold rounded border border-emerald-700">
                      ALPHA MATRIX
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-neutral-950 p-3 rounded border border-neutral-800 space-y-1">
                      <span className="text-[10px] text-orange-400 uppercase font-bold block">Day 2 Sequence:</span>
                      <p className="text-white font-bold">
                        Blocco 1 TCCC ➔ Blocco 2 WS2 ➔ Blocco 3 WS1 ➔ Blocco 4 Shock Room
                      </p>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded border border-neutral-800 space-y-1">
                      <span className="text-[10px] text-cyan-400 uppercase font-bold block">Day 3 Sequence (Specular):</span>
                      <p className="text-white font-bold">
                        Blocco 1 WS2 ➔ Blocco 2 Shock Room ➔ Blocco 3 TCCC ➔ Blocco 4 WS1
                      </p>
                    </div>
                  </div>
                </div>

                {/* GRUPPO BRAVO */}
                <div className="bg-neutral-900 border-2 border-red-800/80 p-4 rounded-xl shadow-lg space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div>
                      <span className="text-xs font-black text-red-400 uppercase tracking-wide">
                        GRUPPO BRAVO (DISC-16 – DISC-30)
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {isEn ? 'Squads 4, 5, 6 • 1 TL + 4 Operators per squad' : 'Squadre 4, 5, 6 • 1 Team Leader + 4 Operatori per squadra'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-red-950 text-red-300 text-[10px] font-bold rounded border border-red-700">
                      BRAVO MATRIX
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-neutral-950 p-3 rounded border border-neutral-800 space-y-1">
                      <span className="text-[10px] text-orange-400 uppercase font-bold block">Day 2 Sequence:</span>
                      <p className="text-white font-bold">
                        Blocco 1 WS1 ➔ Blocco 2 Shock Room ➔ Blocco 3 TCCC ➔ Blocco 4 WS2
                      </p>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded border border-neutral-800 space-y-1">
                      <span className="text-[10px] text-cyan-400 uppercase font-bold block">Day 3 Sequence (Specular):</span>
                      <p className="text-white font-bold">
                        Blocco 1 TCCC ➔ Blocco 2 WS1 ➔ Blocco 3 WS2 ➔ Blocco 4 Shock Room
                      </p>
                    </div>
                  </div>
                </div>

                {/* GRUPPO CHARLIE */}
                <div className="bg-neutral-900 border-2 border-purple-800/80 p-4 rounded-xl shadow-lg space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div>
                      <span className="text-xs font-black text-purple-400 uppercase tracking-wide">
                        GRUPPO CHARLIE (DISC-31 – DISC-45)
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {isEn ? 'Squads 7, 8, 9 • 1 TL + 4 Operators per squad' : 'Squadre 7, 8, 9 • 1 Team Leader + 4 Operatori per squadra'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-950 text-purple-300 text-[10px] font-bold rounded border border-purple-700">
                      CHARLIE MATRIX
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-neutral-950 p-3 rounded border border-neutral-800 space-y-1">
                      <span className="text-[10px] text-orange-400 uppercase font-bold block">Day 2 Sequence:</span>
                      <p className="text-white font-bold">
                        Blocco 1 Shock Room ➔ Blocco 2 WS1 ➔ Blocco 3 WS2 ➔ Blocco 4 TCCC
                      </p>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded border border-neutral-800 space-y-1">
                      <span className="text-[10px] text-cyan-400 uppercase font-bold block">Day 3 Sequence (Specular):</span>
                      <p className="text-white font-bold">
                        Blocco 1 WS1 ➔ Blocco 2 TCCC ➔ Blocco 3 Shock Room ➔ Blocco 4 WS2
                      </p>
                    </div>
                  </div>
                </div>

                {/* GRUPPO DELTA */}
                <div className="bg-neutral-900 border-2 border-cyan-800/80 p-4 rounded-xl shadow-lg space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div>
                      <span className="text-xs font-black text-cyan-400 uppercase tracking-wide">
                        GRUPPO DELTA (DISC-46 – DISC-60)
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {isEn ? 'Squads 10, 11, 12 • 1 TL + 4 Operators per squad' : 'Squadre 10, 11, 12 • 1 Team Leader + 4 Operatori per squadra'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 text-[10px] font-bold rounded border border-cyan-700">
                      DELTA MATRIX
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-neutral-950 p-3 rounded border border-neutral-800 space-y-1">
                      <span className="text-[10px] text-orange-400 uppercase font-bold block">Day 2 Sequence:</span>
                      <p className="text-white font-bold">
                        Blocco 1 WS2 ➔ Blocco 2 TCCC ➔ Blocco 3 Shock Room ➔ Blocco 4 WS1
                      </p>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded border border-neutral-800 space-y-1">
                      <span className="text-[10px] text-cyan-400 uppercase font-bold block">Day 3 Sequence (Specular):</span>
                      <p className="text-white font-bold">
                        Blocco 1 Shock Room ➔ Blocco 2 WS2 ➔ Blocco 3 WS1 ➔ Blocco 4 TCCC
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 3: PROGRAMMA COMPLETO DELLA GIORNATA (TUTTI GLI SLOT)              */}
          {/* ----------------------------------------------------------------------- */}
          {activeMenuTab === 'full_schedule' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    {isEn ? `Full Timeline Schedule • DAY 0${selectedDayTab}` : `Cronoprogramma Completo • DAY 0${selectedDayTab}`}
                  </h4>
                  <span className="text-[11px] text-neutral-400">
                    {dayMasterSlots.length} {isEn ? 'official course phases scheduled' : 'fasi didattiche ufficiali in programma'}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {dayMasterSlots.map((slot, idx) => {
                  const isCurrent = selectedDayTab === activeDay && idx === effectiveCurrentIdx;
                  const isPast = selectedDayTab === activeDay && idx < effectiveCurrentIdx;
                  const isFuture = selectedDayTab === activeDay && idx > effectiveCurrentIdx;
                  const isExpanded = inspectSlotId === slot.id;

                  return (
                    <div
                      key={slot.id}
                      className={`p-3.5 rounded-lg border transition-all ${
                        isCurrent
                          ? 'bg-neutral-900 border-2 border-orange-500 shadow-xl'
                          : isPast
                          ? 'bg-neutral-950/60 border-neutral-800/80 opacity-75'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div
                        onClick={() => setInspectSlotId(isExpanded ? null : slot.id)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded text-xs font-black flex items-center justify-center shrink-0 border ${
                              isCurrent
                                ? 'bg-orange-600 text-black border-orange-400'
                                : isPast
                                ? 'bg-neutral-900 text-emerald-400 border-emerald-800'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap font-mono">
                              <span className="text-white font-bold text-xs">
                                🕒 {slot.timeRange} ({slot.durationMinutes} min)
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 bg-orange-600 text-black text-[9px] font-black uppercase rounded animate-pulse">
                                  {isEn ? 'LIVE NOW' : 'IN CORSO'}
                                </span>
                              )}
                              {isPast && (
                                <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 text-[9px] font-bold uppercase rounded border border-emerald-900">
                                  ✓ {isEn ? 'DONE' : 'COMPLETATO'}
                                </span>
                              )}
                            </div>
                            <h5 className="text-neutral-200 font-bold text-xs sm:text-sm uppercase mt-0.5">
                              {slot.title}
                            </h5>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center font-mono text-[11px] text-neutral-400">
                          <span>{isExpanded ? (isEn ? 'Hide Details' : 'Nascondi Dettagli') : (isEn ? 'Show Details' : 'Dettagli')}</span>
                          <span className="text-orange-400 font-bold">{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* Dettagli Espansi dello Slot */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-neutral-800 space-y-3 animate-fadeIn">
                          {slot.description && (
                            <p className="text-xs text-neutral-300 font-mono">
                              {slot.description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono">
                            {(['A', 'B', 'C', 'D'] as GroupType[]).map((grp) => {
                              const act = slot.groupActivities?.[grp];
                              const bInfo = getGroupBadgeInfo(grp, act);

                              return (
                                <div
                                  key={grp}
                                  className={`p-2.5 rounded border ${bInfo.bg}`}
                                >
                                  <div className="flex items-center justify-between pb-1 border-b border-current/20">
                                    <span className="font-bold text-[11px] uppercase">
                                      Gruppo {grp}
                                    </span>
                                    <span className="text-[9px] opacity-80">{bInfo.typeLabel}</span>
                                  </div>
                                  <p className="font-bold text-white text-xs truncate mt-1">
                                    {act?.title || (isEn ? 'Clinical Rotation' : 'Rotazione Clinica')}
                                  </p>
                                  <p className="text-[10px] text-neutral-300 truncate">
                                    📍 {act?.location || 'Sede'}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 4: REGOLE TEMPORALI DEI BLOCCHI (90 MINUTI)                         */}
          {/* ----------------------------------------------------------------------- */}
          {activeMenuTab === 'timing_rules' && (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg space-y-2">
                <span className="text-[10px] text-orange-400 uppercase font-black tracking-wider block">
                  {isEn ? 'RULE 3: TEMPORAL RULES OF 90-MINUTE TRAINING BLOCKS' : 'REGOLA 3: REGOLE TEMPORALI DEI BLOCCHI FORMATIVI (90 MINUTI)'}
                </span>
                <p className="text-xs text-neutral-300">
                  {isEn
                    ? 'Each training day features 4 main 90-minute blocks, subdivided into rigid 15-minute operational slots.'
                    : 'Ogni giornata addestrativa prevede 4 Blocchi principali da 90 minuti suddivisi in slot rigidi da 15 minuti.'}
                </p>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="bg-neutral-900 p-3.5 rounded border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between text-yellow-400 font-bold">
                    <span>Min 00–15</span>
                    <span className="text-[10px] text-neutral-400">15 min</span>
                  </div>
                  <strong className="text-white block text-sm">
                    {isEn ? 'TCCC Engagement / WS Framing / Shock Room Standby' : 'Ingaggio TCCC / Inquadramento WS / Briefing e Standby Shock Room'}
                  </strong>
                  <p className="text-neutral-300 text-[11px]">
                    {isEn
                      ? 'Under fire scenario engagement in 3 Tactical Environments. Skill WS framing. Initial active standby in Shock Room.'
                      : 'Avvio scenari under-fire nei 3 Ambienti Tattici. Inquadramento didattico nei WS. Standby iniziale nei Box Shock Room.'}
                  </p>
                </div>

                <div className="bg-neutral-900 p-3.5 rounded border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between text-yellow-400 font-bold">
                    <span>Min 15–30</span>
                    <span className="text-[10px] text-neutral-400">15 min (T -15)</span>
                  </div>
                  <strong className="text-white block text-sm">
                    {isEn ? 'TCCC Stabilization & Extraction / Active Standby Shock Room (T -15)' : 'Stabilizzazione TCCC ed Estrazione / Pratica WS / Standby Attivo Shock Room nei Box (T -15)'}
                  </strong>
                  <p className="text-neutral-300 text-[11px]">
                    {isEn
                      ? 'Wound packing and litter packaging. Shock Room enters ACTIVE STANDBY in boxes (T -15 min from Handover).'
                      : 'Barellamento e wound packing. Shock Room in STANDBY ATTIVO nei box a T -15 min dall\'Handover barellato.'}
                  </p>
                </div>

                <div className="bg-neutral-900 p-3.5 rounded border-2 border-red-500/80 space-y-1">
                  <div className="flex items-center justify-between text-red-400 font-bold">
                    <span>Min 30–45 (Tassativo Ore :30)</span>
                    <span className="px-1.5 py-0.2 bg-red-950 text-red-300 text-[9px] uppercase rounded">HANDOVER :30</span>
                  </div>
                  <strong className="text-white block text-sm">
                    {isEn ? 'MANDATORY :30 1:1 LITTER HANDOVER (SBAR) & SHOCK ROOM START' : 'TASSATIVO ORE :30 HANDOVER 1:1 BARELLATO (SBAR) & AVVIO SHOCK ROOM'}
                  </strong>
                  <p className="text-neutral-300 text-[11px]">
                    {isEn
                      ? 'Physical litter transfer between TCCC and Shock Room with SBAR report (5 min, :30-:35). From :35 Shock Room ABCDE begins, and TCCC Debrief Part 1 with Faculty.'
                      : 'Handover barellato 1:1 tra TCCC e Shock Room con report SBAR (5 min, :30–:35). Dalle :35 avvio Shock Room (ABCDE) e Debriefing TCCC Parte 1 con FAC.'}
                  </p>
                </div>

                <div className="bg-neutral-900 p-3.5 rounded border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between text-yellow-400 font-bold">
                    <span>Min 45–60</span>
                    <span className="text-[10px] text-neutral-400">15 min</span>
                  </div>
                  <strong className="text-white block text-sm">
                    {isEn ? 'High-Fidelity Shock Room / Intensive WS / TCCC Debriefing Part 2' : 'Shock Room ad Alta Fedeltà / Pratica Intensiva WS / Debriefing TCCC Parte 2 con FAC'}
                  </strong>
                  <p className="text-neutral-300 text-[11px]">
                    {isEn
                      ? 'Full ABCDE resuscitation, FAST ultrasound and hemodynamic stabilization in Shock Room. TCCC debriefing concludes.'
                      : 'Rianimazione avanzata ABCDE, eco FAST ed emodinamica in Shock Room. Completamento debriefing TCCC.'}
                  </p>
                </div>

                <div className="bg-neutral-900 p-3.5 rounded border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between text-yellow-400 font-bold">
                    <span>Min 60–75</span>
                    <span className="text-[10px] text-neutral-400">15 min</span>
                  </div>
                  <strong className="text-white block text-sm">
                    {isEn ? 'Shock Room Clinical Debriefing Part 1 (Video Review) / TCCC Team Rest' : 'Debriefing Clinico Collegiale Shock Room Parte 1 (Revisione Video) / Pausa TCCC'}
                  </strong>
                  <p className="text-neutral-300 text-[11px]">
                    {isEn
                      ? 'Video review and clinical debriefing for Shock Room team with Faculty. Rest break for team that finished TCCC.'
                      : 'Revisione video collegiale con Faculty della gestione Shock Room. Pausa e ristoro per la squadra uscita dal TCCC.'}
                  </p>
                </div>

                <div className="bg-neutral-900 p-3.5 rounded border-2 border-yellow-500/80 space-y-1">
                  <div className="flex items-center justify-between text-yellow-400 font-bold">
                    <span>Min 75–90</span>
                    <span className="px-1.5 py-0.2 bg-yellow-950 text-yellow-300 text-[9px] uppercase rounded">RESET TECNICO 15'</span>
                  </div>
                  <strong className="text-white block text-sm">
                    {isEn ? 'Debriefing Shock Room Part 2 & MANDATORY 15-MIN BOX RESET (Turnaround)' : 'Debriefing Shock Room Parte 2 & RESET TECNICO RAPIDO 15 MIN DEI 3 BOX'}
                  </strong>
                  <p className="text-neutral-300 text-[11px]">
                    {isEn
                      ? 'Conclusive debriefing and rapid turnaround by TECHs: manikins skin reset, blood refill, airway/needle replacements.'
                      : 'Debriefing conclusivo e ripristino tassativo dei 3 Box da parte dei tecnici (Turnaround di 15 min per il blocco successivo).'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FOOTER MODALE */}
        {/* ========================================================================= */}
        <div className="bg-neutral-900 border-t border-neutral-800 p-3.5 sm:p-4 flex items-center justify-between gap-3 shrink-0 font-mono text-xs">
          <div className="text-neutral-400 text-[11px] hidden sm:block">
            {isEn
              ? 'Technical View • Consult public course timetable and macro-group rotation at any time'
              : 'Visuale Tecnici • Consulta il cronoprogramma pubblico e le rotazioni dei macro-gruppi in qualsiasi momento'}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase rounded shadow transition-colors cursor-pointer ml-auto"
          >
            {isEn ? 'Close Menu' : 'Chiudi Menu'}
          </button>
        </div>
      </div>
    </div>
  );
};
