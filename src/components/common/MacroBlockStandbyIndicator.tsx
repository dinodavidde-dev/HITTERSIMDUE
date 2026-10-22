import React from 'react';
import { useCourse } from '../../context/CourseContext';
import { Radio, Clock, ShieldAlert, MapPin, Users } from 'lucide-react';
import { getMacroBlockInfo } from '../../utils/macroBlockHelper';

interface MacroBlockStandbyIndicatorProps {
  className?: string;
}

export const MacroBlockStandbyIndicator: React.FC<MacroBlockStandbyIndicatorProps> = ({ className = '' }) => {
  const { currentSlot, isMacroBlockAwaitingAuth, language, userRole } = useCourse();
  const isEn = language === 'en';

  const blockInfo = getMacroBlockInfo(currentSlot);

  if (!isMacroBlockAwaitingAuth || !blockInfo.isMacroBlock) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-r from-orange-950/90 via-neutral-950 to-amber-950/90 border-2 border-orange-500 rounded-xl p-3 sm:p-4 shadow-xl text-neutral-100 font-mono space-y-2 animate-fadeIn ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-orange-500/30 pb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
          </span>
          <span className="px-2 py-0.5 bg-orange-500 text-black font-black text-[10px] uppercase tracking-wider rounded">
            {isEn ? `BLOCK ${blockInfo.blockNumber} • ACTIVE STANDBY` : `BLOCCO ${blockInfo.blockNumber} • STANDBY ATTIVO`}
          </span>
          <span className="text-orange-400 font-bold text-xs uppercase">
            {isEn ? 'AWAITING REGIA AUTHORIZATION' : 'IN ATTESA DI AUTORIZZAZIONE DALLA REGIA'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-orange-300 font-bold">{currentSlot.timeRange}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-0.5">
        <div className="space-y-0.5 max-w-2xl">
          <h4 className="font-bold text-white uppercase text-[12px] sm:text-xs">
            {currentSlot.title}
          </h4>
          <p className="text-[11px] text-neutral-300 font-sans leading-relaxed">
            {isEn
              ? 'Positions, clinical roles, and patients are assigned. The session timer and tactical scenarios will commence immediately upon receiving the authorization signal from the Control Room.'
              : 'Postazioni, ruoli clinici e pazienti sono assegnati. I timer di sessione e gli scenari tattici partiranno all\'invio del segnale di autorizzazione da parte della Regia.'}
          </p>
        </div>

        <div className="px-3 py-1.5 bg-neutral-900 border border-orange-500/40 rounded text-center flex-shrink-0 self-stretch sm:self-auto flex items-center justify-center gap-2">
          <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase text-amber-300">
            {isEn ? 'STANDBY T0' : 'STANDBY ATTIVO T0'}
          </span>
        </div>
      </div>
    </div>
  );
};
