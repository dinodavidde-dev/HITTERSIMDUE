import React from 'react';
import { Radio, Zap, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { TimelineSlot } from '../../types';

interface RegiaLiveSyncBannerProps {
  inspectedSlot?: TimelineSlot | null;
  onRealignToRegia: () => void;
  className?: string;
}

export const RegiaLiveSyncBanner: React.FC<RegiaLiveSyncBannerProps> = ({
  inspectedSlot,
  onRealignToRegia,
  className = '',
}) => {
  const { currentSlot, activeSlotIndex, timerSeconds, isTimerRunning, language, activeDay } = useCourse();
  const isEn = language === 'en';

  if (!inspectedSlot || inspectedSlot.id === currentSlot?.id) {
    return null;
  }

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`bg-amber-950/95 border-2 border-amber-500 rounded-lg p-2.5 sm:p-3 shadow-xl font-mono text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fadeIn ${className}`}
    >
      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
        <div className="p-1.5 bg-amber-500 text-black rounded font-black shrink-0 animate-pulse mt-0.5 sm:mt-0">
          <Radio className="w-4 h-4" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-amber-500 text-black font-black text-[10px] uppercase rounded tracking-wider">
              {isEn ? 'FREE INSPECTION MODE' : 'MODALITÀ CONSULTAZIONE'}
            </span>
            <span className="text-amber-200 text-[11px] font-bold">
              {isEn ? 'Currently viewing:' : 'Stai visualizzando:'}{' '}
              <strong className="text-white underline">{inspectedSlot.title}</strong> ({inspectedSlot.timeRange})
            </span>
          </div>
          <p className="text-[11px] text-amber-300 font-sans leading-tight">
            {isEn
              ? `Live Regia is currently at: Phase #${activeSlotIndex + 1} "${currentSlot?.title}" (${currentSlot?.timeRange})`
              : `La Regia in diretta è su: Fase #${activeSlotIndex + 1} "${currentSlot?.title}" (${currentSlot?.timeRange})`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto flex-wrap">
        <div className="bg-neutral-950 px-2.5 py-1 border border-amber-500/80 rounded flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] text-neutral-400 uppercase hidden sm:inline">
            {isEn ? 'Regia Timer:' : 'Timer Regia:'}
          </span>
          <span className="font-mono font-black text-amber-400 text-sm tabular-nums">
            {formatTimer(timerSeconds)}
          </span>
        </div>

        <button
          type="button"
          onClick={onRealignToRegia}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded border border-amber-300 flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
          title={isEn ? 'Realign immediately with master Regia phase' : 'Riallinea immediatamente con la diretta della Regia'}
        >
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span>{isEn ? 'REALIGN TO REGIA (LIVE)' : 'RIALLINEA ALLA REGIA (LIVE)'}</span>
        </button>
      </div>
    </div>
  );
};
