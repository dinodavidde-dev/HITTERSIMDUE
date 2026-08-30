import React, { useState, useEffect, useMemo } from 'react';
import { useCourse } from '../context/CourseContext';
import { Clock, Activity, Hospital, Tent } from 'lucide-react';
import { playLongBeep } from '../utils/audio';

export const RotationCountdownBanner: React.FC = () => {
  const {
    currentSlot,
    timerSeconds,
    isTimerRunning,
    language,
    isCourseStarted,
  } = useCourse();

  const [hasPlayed5MinBeep, setHasPlayed5MinBeep] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  const isEn = language === 'en';

  // Check if current slot is an Intra vs Extra hospital rotation block
  const isRotationBlock = useMemo(() => {
    if (!currentSlot || !currentSlot.groupActivities) return false;
    const acts = Object.values(currentSlot.groupActivities);
    const hasExtra = acts.some((a) => a?.activityType === 'scenario_extra');
    const hasIntra = acts.some((a) => a?.activityType === 'scenario_intra');
    return hasExtra || hasIntra;
  }, [currentSlot]);

  // Format timer MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Check for 5 min before (300 seconds) sound alert
  useEffect(() => {
    if (!isCourseStarted || !isRotationBlock) return;

    if (isTimerRunning && timerSeconds <= 300 && timerSeconds >= 290 && !hasPlayed5MinBeep) {
      playLongBeep();
      setHasPlayed5MinBeep(true);
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 5000);
      return () => clearTimeout(timer);
    }

    if (timerSeconds > 315) {
      setHasPlayed5MinBeep(false);
    }
  }, [isCourseStarted, isRotationBlock, isTimerRunning, timerSeconds, hasPlayed5MinBeep]);

  if (!isCourseStarted || !isRotationBlock) return null;

  const totalDuration = (currentSlot?.durationMinutes || 30) * 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalDuration - timerSeconds) / totalDuration) * 100));
  const isUrgent = timerSeconds <= 300;

  return (
    <div
      id="rotation-countdown-banner"
      className={`w-full border-y-2 px-4 py-3 shadow-2xl transition-all duration-300 relative overflow-hidden z-30 ${
        isUrgent
          ? 'bg-amber-950/95 border-amber-500 text-amber-100'
          : 'bg-neutral-900/95 border-orange-500/60 text-neutral-100'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Side: Title & Badge */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center font-black ${isPulsing ? 'animate-ping scale-110 bg-amber-500 text-black' : 'bg-orange-500 text-black'}`}>
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-500 text-black font-mono text-[10px] font-black uppercase px-1.5 py-0.5">
                {isEn ? 'ROTATION BLOCK' : 'BLOCCO ROTAZIONE'}
              </span>
              <span className="text-xs font-mono font-bold text-neutral-400">
                {currentSlot.timeRange}
              </span>
            </div>
            <h4 className="font-black text-sm sm:text-base uppercase tracking-tight flex items-center gap-2 mt-0.5">
              <Tent className="w-4 h-4 text-orange-400" />
              <span>{isEn ? 'Extra-Hospital (TCCC)' : 'Extra-Ospedaliero (TCCC)'}</span>
              <span className="text-neutral-500 font-normal">vs</span>
              <Hospital className="w-4 h-4 text-blue-400" />
              <span>{isEn ? 'Intra-Hospital (Shock Room)' : 'Intra-Ospedaliero (Shock Room)'}</span>
            </h4>
          </div>
        </div>

        {/* Center: Real-Time Countdown Clock */}
        <div className="flex items-center gap-4 bg-neutral-950/90 border border-neutral-800 px-4 py-2 shadow-inner">
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${isUrgent ? 'text-amber-400 animate-spin' : 'text-orange-400 animate-pulse'}`} />
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase">
              {isEn ? 'Rotation Time:' : 'Tempo Rotazione:'}
            </span>
          </div>
          <span className={`font-mono text-xl sm:text-2xl font-black tracking-wider ${isUrgent ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
            {formatTimer(timerSeconds)}
          </span>
          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 font-bold ${isTimerRunning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-amber-500/20 text-amber-400 border border-amber-500/50'}`}>
            {isTimerRunning ? (isEn ? 'RUNNING' : 'ATTIVO') : (isEn ? 'PAUSED' : 'IN PAUSA')}
          </span>
        </div>

        {/* Right Side: Progress indicator */}
        <div className="w-full sm:w-48 flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-mono text-neutral-400 uppercase font-bold">
            <span>{isEn ? 'Progress' : 'Progresso'}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-950 border border-neutral-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${isUrgent ? 'bg-amber-500' : 'bg-orange-500'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
