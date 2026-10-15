import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX,
  Target,
  Users,
  Award,
  Radio,
  Sparkles,
} from 'lucide-react';
import { GroupType, TimelineSlot, Discente } from '../../types';
import { playBroadcastSound, playLongBeep } from '../../utils/audio';

interface FacultySkillStationTimerProps {
  assignedTeamId: number;
  facultyBadgeCode: string;
  facultyName: string;
  facultyGroup: GroupType;
  activeDay: number;
  currentSlot: TimelineSlot;
  timerSeconds: number;
  isTimerRunning: boolean;
  language: 'it' | 'en';
  assignedTeamDiscenti: Discente[];
}

export const FacultySkillStationTimer: React.FC<FacultySkillStationTimerProps> = ({
  assignedTeamId,
  facultyBadgeCode,
  facultyName,
  facultyGroup,
  activeDay,
  currentSlot,
  timerSeconds,
  isTimerRunning,
  language,
  assignedTeamDiscenti,
}) => {
  const isEn = language === 'en';

  // Analyze current activity for this faculty's team/group
  const currentActivity = currentSlot?.groupActivities?.[facultyGroup];
  const actText = `${currentActivity?.title || ''} ${currentActivity?.subtitle || ''} ${currentActivity?.location || ''}`.toLowerCase();
  const actType = currentActivity?.activityType || '';

  const isWS1 = actText.includes('ws1') || actText.includes('vie aeree') || actText.includes('crico') || actText.includes('airway');
  const isWS2 = actText.includes('ws2') || actText.includes('ecografia') || actText.includes('fast') || actText.includes('accessi') || actText.includes('ultrasound');
  const isScenario = actText.includes('shock') || actText.includes('tccc') || actType === 'scenario_extra' || actType === 'scenario_intra';
  const isSkillWorkshop = (actType === 'workshop' || actText.includes('workshop') || actText.includes('skills') || isWS1 || isWS2) && !isScenario;

  const workshopType = isWS1 ? 'WS1' : isWS2 ? 'WS2' : 'SKILL';

  // Pre-configured stations per workshop type
  const ws1Stations = useMemo(() => [
    { id: 'crico', title: isEn ? 'Emergency Cricothyroidotomy' : 'Cricotiroidotomia Chirurgica d\'Urgenza', defaultDuration: 15, tag: 'Airway Surgical' },
    { id: 'video_laryngo', title: isEn ? 'Video-Laryngoscopy & Supraglottic' : 'Videolaringoscopia & Presidi Sovraglottici', defaultDuration: 15, tag: 'Airway Advanced' },
    { id: 'wound_packing', title: isEn ? 'Deep Wound Packing & Hemostatics' : 'Wound Packing Profondo & Agenti Emostatici', defaultDuration: 15, tag: 'Massive Bleeding' },
    { id: 'tourniquet', title: isEn ? 'Junctional Tourniquets (JETT / SAM)' : 'Tourniquet Giunzionali (JETT / SAM)', defaultDuration: 15, tag: 'Junctional Bleeding' },
  ], [isEn]);

  const ws2Stations = useMemo(() => [
    { id: 'efast_thorax', title: isEn ? 'e-FAST Thoracic Scan (Pneumothorax)' : 'Scansione e-FAST Toracica (Pneumotorace)', defaultDuration: 15, tag: 'Ultrasound' },
    { id: 'fast_abdomen', title: isEn ? 'Abdominal FAST (4 Quadrants)' : 'FAST Addominale (4 Quadranti)', defaultDuration: 15, tag: 'Ultrasound' },
    { id: 'subxiphoid', title: isEn ? 'Subxiphoid Cardiac Window & Pericardium' : 'Finestra Sottocostale & Pericardio', defaultDuration: 15, tag: 'Cardiac US' },
    { id: 'vascular_io', title: isEn ? 'US-guided Vascular & Intraosseous (IO)' : 'Accessi Vascolari Ecoguidati & Intraosseo (IO)', defaultDuration: 15, tag: 'Vascular Access' },
  ], [isEn]);

  const genericStations = useMemo(() => [
    { id: 'skill_1', title: isEn ? 'Station 1: Advanced Procedural Skill' : 'Postazione 1: Skill Procedurale Avanzata', defaultDuration: 15, tag: 'Procedural' },
    { id: 'skill_2', title: isEn ? 'Station 2: Hands-on Technical Practice' : 'Postazione 2: Pratica Tecnica Hands-on', defaultDuration: 15, tag: 'Hands-on' },
    { id: 'skill_3', title: isEn ? 'Station 3: Rapid Assessment & Recheck' : 'Postazione 3: Valutazione Rapida & Re-check', defaultDuration: 15, tag: 'Assessment' },
  ], [isEn]);

  const availableStations = isWS1 ? ws1Stations : isWS2 ? ws2Stations : genericStations;

  // Selected station inside workshop
  const [selectedStationId, setSelectedStationId] = useState<string>(availableStations[0]?.id || 'crico');
  const activeStation = availableStations.find((s) => s.id === selectedStationId) || availableStations[0];

  // Specific Station Timer State
  const [stationDurationMins, setStationDurationMins] = useState<number>(15);
  const [stationRemainingSecs, setStationRemainingSecs] = useState<number>(15 * 60);
  const [isStationRunning, setIsStationRunning] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [hasCompletedNotified, setHasCompletedNotified] = useState<boolean>(false);

  // Active Learner assigned to this rotation station
  const [activeLearnerId, setActiveLearnerId] = useState<string>(
    assignedTeamDiscenti[0]?.id || ''
  );

  // Automatically update activeLearnerId when discenti list changes
  useEffect(() => {
    if (assignedTeamDiscenti.length > 0 && !activeLearnerId) {
      setActiveLearnerId(assignedTeamDiscenti[0].id);
    }
  }, [assignedTeamDiscenti, activeLearnerId]);

  // Sync / Reset station timer when duration or station changes
  const handleSelectStation = (stId: string) => {
    setSelectedStationId(stId);
    const target = availableStations.find((s) => s.id === stId);
    const dur = target?.defaultDuration || 15;
    setStationDurationMins(dur);
    setStationRemainingSecs(dur * 60);
    setIsStationRunning(false);
    setHasCompletedNotified(false);
  };

  // Dedicated Station Interval Countdown
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isStationRunning) {
      intervalRef.current = window.setInterval(() => {
        setStationRemainingSecs((prev) => {
          if (prev <= 1) {
            // Station completed
            setIsStationRunning(false);
            if (!isSoundMuted && !hasCompletedNotified) {
              try {
                playLongBeep();
                playBroadcastSound('phase_change');
              } catch {
                // Ignore audio issues
              }
              setHasCompletedNotified(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStationRunning, isSoundMuted, hasCompletedNotified]);

  const handleToggleStationTimer = () => {
    if (stationRemainingSecs === 0) {
      // If expired, reset to full duration before starting
      setStationRemainingSecs(stationDurationMins * 60);
      setHasCompletedNotified(false);
    }
    setIsStationRunning((prev) => !prev);
  };

  const handleResetStationTimer = () => {
    setIsStationRunning(false);
    setStationRemainingSecs(stationDurationMins * 60);
    setHasCompletedNotified(false);
  };

  const handleAdjustStationSeconds = (deltaSec: number) => {
    setStationRemainingSecs((prev) => Math.max(0, prev + deltaSec));
    setHasCompletedNotified(false);
  };

  const handleSetPresetDuration = (mins: number) => {
    setStationDurationMins(mins);
    setStationRemainingSecs(mins * 60);
    setIsStationRunning(false);
    setHasCompletedNotified(false);
  };

  // Format Helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Synchronized Timeline Slot calculations
  const slotTotalSecs = (currentSlot?.durationMinutes || 30) * 60;
  const slotRemainingSecs = Math.max(0, slotTotalSecs - timerSeconds);
  const slotProgressPct = Math.min(100, Math.max(0, (timerSeconds / slotTotalSecs) * 100));

  // Station specific progress
  const stationTotalSecs = stationDurationMins * 60;
  const stationElapsedSecs = Math.max(0, stationTotalSecs - stationRemainingSecs);
  const stationProgressPct = stationTotalSecs > 0 ? Math.min(100, Math.max(0, (stationElapsedSecs / stationTotalSecs) * 100)) : 0;

  const isStationCritical = stationRemainingSecs > 0 && stationRemainingSecs <= 120; // Last 2 mins
  const isStationWarning = stationRemainingSecs > 120 && stationRemainingSecs <= 300; // Last 5 mins
  const isStationFinished = stationRemainingSecs === 0;

  // Active Learner Info
  const activeLearner = assignedTeamDiscenti.find((d) => d.id === activeLearnerId) || assignedTeamDiscenti[0];

  return (
    <div className="bg-neutral-950 border-2 border-cyan-500/80 rounded-xl shadow-2xl p-4 sm:p-5 font-mono space-y-4 relative overflow-hidden">
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-500 to-orange-500" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 bg-cyan-600 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 rounded shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            {isEn ? 'SKILL-STATION TIMER' : 'TIMER SKILL-STATION & WORKSHOP'}
          </span>

          <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-cyan-300 text-xs font-bold rounded flex items-center gap-1">
            <Users className="w-3 h-3 text-cyan-400" />
            {isEn ? `TEAM ${assignedTeamId}` : `SQUADRA ${assignedTeamId}`} (GRP {facultyGroup})
          </span>

          <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 text-[11px] rounded">
            {facultyBadgeCode} • {facultyName}
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Mute Audio Toggle */}
          <button
            type="button"
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            className={`p-1.5 rounded border text-xs cursor-pointer transition-colors ${
              isSoundMuted
                ? 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                : 'bg-cyan-950/80 border-cyan-700/60 text-cyan-300 hover:text-white'
            }`}
            title={isSoundMuted ? (isEn ? 'Unmute alerts' : 'Attiva segnali acustici') : (isEn ? 'Mute alerts' : 'Silenzia segnali')}
          >
            {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Activity State Badge */}
          {isSkillWorkshop ? (
            <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold text-xs rounded flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {workshopType} {isEn ? 'ACTIVE' : 'ATTIVO'}
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-neutral-900 text-amber-300 border border-neutral-800 text-xs rounded flex items-center gap-1">
              <Radio className="w-3 h-3 text-amber-400" />
              {currentActivity?.title || (isEn ? 'STANDBY' : 'IN CORSO')}
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Station Selector & Active Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Station Selector & Trainee in Action (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold block mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {isEn ? 'ACTIVE SKILL-STATION:' : 'POSTAZIONE / SKILL SPECIFICA:'}
              </span>
              <span className="text-[10px] text-neutral-400 font-normal">
                {availableStations.length} {isEn ? 'Skills' : 'Postazioni'}
              </span>
            </label>
            <div className="space-y-1.5">
              {availableStations.map((st) => {
                const isSelected = st.id === selectedStationId;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStation(st.id)}
                    className={`w-full text-left p-2 rounded border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400'
                        : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-xs block truncate">{st.title}</span>
                      <span className="text-[10px] text-cyan-300/80 block">{st.tag}</span>
                    </div>
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-cyan-600 text-black font-black' : 'bg-neutral-950 text-neutral-400'}`}>
                      {st.defaultDuration}m
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Learner at Station Selector */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-2.5 rounded">
            <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block mb-1 flex items-center gap-1">
              <Award className="w-3 h-3 text-orange-400" />
              {isEn ? 'Trainee Active at Station:' : 'Discente in Addestramento / Postazione:'}
            </label>
            <select
              value={activeLearnerId}
              onChange={(e) => setActiveLearnerId(e.target.value)}
              className="w-full bg-neutral-950 text-orange-300 text-xs border border-neutral-700 px-2 py-1.5 rounded focus:outline-none focus:border-cyan-400 font-mono font-bold cursor-pointer"
            >
              {assignedTeamDiscenti.map((d, idx) => (
                <option key={d.id} value={d.id}>
                  {d.badgeCode || `DISC-${idx + 1}`} • {d.name} ({d.role || (idx === 0 ? 'Team Leader' : 'Operatore')})
                </option>
              ))}
            </select>
            {activeLearner && (
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-400">
                <span>{isEn ? 'Assigned Role:' : 'Ruolo Assegnato:'} <strong className="text-white">{activeLearner.role || (isEn ? 'Operator' : 'Operatore')}</strong></span>
                <span className="text-orange-400 font-bold">{activeLearner.badgeCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: High-Visibility Station Countdown HUD (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-lg p-3.5 sm:p-4 flex flex-col justify-between space-y-3">
          {/* Active Station Header */}
          <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2">
            <div>
              <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-black block">
                {activeStation.tag}
              </span>
              <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight truncate">
                {activeStation.title}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase block">{isEn ? 'Target:' : 'Durata:'}</span>
              <span className="text-xs font-bold text-cyan-300">{stationDurationMins} min</span>
            </div>
          </div>

          {/* Central Digital HUD Display */}
          <div className="text-center py-2 sm:py-3 bg-neutral-950 border border-neutral-800/80 rounded relative overflow-hidden">
            {/* Ambient Background Glow based on urgency */}
            {isStationFinished ? (
              <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none" />
            ) : isStationCritical ? (
              <div className="absolute inset-0 bg-red-500/10 animate-ping pointer-events-none" />
            ) : isStationWarning ? (
              <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
            ) : null}

            <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold text-neutral-400 block mb-1">
              {isEn ? 'TIME REMAINING FOR SKILL-STATION' : 'TEMPO RIMANENTE SKILL-STATION'}
            </span>

            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tight ${
                  isStationFinished
                    ? 'text-red-500 animate-pulse'
                    : isStationCritical
                    ? 'text-red-400 animate-pulse'
                    : isStationWarning
                    ? 'text-amber-400'
                    : 'text-cyan-300'
                }`}
              >
                {formatTime(stationRemainingSecs)}
              </span>
            </div>

            {/* Status description pill */}
            <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-bold">
              {isStationFinished ? (
                <span className="px-2 py-0.5 bg-red-600 text-white rounded uppercase flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isEn ? 'STATION TIME EXPIRED - ROTATE TRAINEE' : 'TEMPO SCADUTO - RUOTARE DISCENTE'}
                </span>
              ) : isStationCritical ? (
                <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-600 rounded uppercase flex items-center gap-1 animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  {isEn ? 'FINAL WRAP-UP (< 2 MIN)' : 'CHIUSURA PROCEDURA (< 2 MIN)'}
                </span>
              ) : isStationWarning ? (
                <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-600 rounded uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {isEn ? 'WARNING: 5 MIN REMAINING' : 'AVVISO: 5 MINUTI RIMANENTI'}
                </span>
              ) : isStationRunning ? (
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isEn ? 'COUNTDOWN IN PROGRESS' : 'CONTEGGIO IN CORSO'}
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded uppercase">
                  {isEn ? 'PAUSED / READY' : 'IN PAUSA / PRONTO'}
                </span>
              )}
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-3 px-4">
              <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden border border-neutral-700">
                <div
                  className={`h-full transition-all duration-300 ${
                    isStationFinished
                      ? 'bg-red-500'
                      : isStationCritical
                      ? 'bg-red-500'
                      : isStationWarning
                      ? 'bg-amber-400'
                      : 'bg-cyan-400'
                  }`}
                  style={{ width: `${stationProgressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                <span>00:00</span>
                <span>{stationProgressPct.toFixed(0)}% {isEn ? 'completed' : 'completato'}</span>
                <span>{formatTime(stationTotalSecs)}</span>
              </div>
            </div>
          </div>

          {/* Quick Controls: Play/Pause, Reset, Adjust */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handleToggleStationTimer}
                className={`py-2 px-3 rounded font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow ${
                  isStationRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black font-black'
                }`}
              >
                {isStationRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isStationRunning ? (isEn ? 'PAUSE' : 'PAUSA') : (isEn ? 'START' : 'AVVIA')}</span>
              </button>

              <button
                type="button"
                onClick={handleResetStationTimer}
                className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded font-bold text-xs uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET</span>
              </button>

              <button
                type="button"
                onClick={() => handleAdjustStationSeconds(60)}
                className="py-2 px-2 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-neutral-700 rounded font-bold text-xs uppercase transition-all flex items-center justify-center gap-0.5 cursor-pointer"
                title={isEn ? 'Add 1 minute' : 'Aggiungi 1 minuto'}
              >
                <Plus className="w-3 h-3" />
                <span>+1 MIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleAdjustStationSeconds(-60)}
                className="py-2 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 rounded font-bold text-xs uppercase transition-all flex items-center justify-center gap-0.5 cursor-pointer"
                title={isEn ? 'Subtract 1 minute' : 'Sottrai 1 minuto'}
              >
                <Minus className="w-3 h-3" />
                <span>-1 MIN</span>
              </button>
            </div>

            {/* Preset Buttons for Quick Station Duration Selection */}
            <div className="flex items-center justify-between gap-1.5 flex-wrap pt-1 border-t border-neutral-800">
              <span className="text-[10px] text-neutral-400 uppercase font-bold">
                {isEn ? 'Duration Presets:' : 'Preset Durata:'}
              </span>
              <div className="flex items-center gap-1">
                {[5, 10, 15, 20, 30].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSetPresetDuration(m)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                      stationDurationMins === m
                        ? 'bg-cyan-500 text-black border-cyan-400 font-black'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Course Slot Synoptic (Bottom Sync Banner) */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-neutral-800 border border-neutral-700 rounded text-cyan-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">
                {isEn ? 'COURSE SLOT IN PROGRESS:' : 'SLOT MASTER CORSO IN PROGRESS:'}
              </span>
              <span className="text-cyan-300 font-bold">{currentSlot?.title}</span>
            </div>
            <div className="text-[11px] text-neutral-400">
              {currentSlot?.timeRange} • {isEn ? 'Location:' : 'Ubicazione:'} <strong className="text-neutral-200">{currentActivity?.location || 'Aula Workshop'}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase block">{isEn ? 'Slot Remaining:' : 'Fine Slot Corso:'}</span>
            <span className="font-mono font-black text-sm text-amber-400">
              {formatTime(slotRemainingSecs)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              // Align station remaining with the remaining slot time
              const mins = Math.max(1, Math.ceil(slotRemainingSecs / 60));
              setStationDurationMins(mins);
              setStationRemainingSecs(slotRemainingSecs);
              setIsStationRunning(isTimerRunning);
            }}
            className="px-2.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/80 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            title={isEn ? 'Sync station timer with the remaining time of the master course slot' : 'Aggancia il timer di stazione al tempo residuo dello slot master del corso'}
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{isEn ? 'SYNC WITH SLOT' : 'AGGANCI A SLOT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
