import React from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { useOfflineSync } from '../../offline/useOfflineSync';

export const OfflineReadOnlyBanner: React.FC = () => {
  const { isDataStale, staleMinutes, triggerSync, isOnline } = useOfflineSync();

  if (!isDataStale) return null;

  return (
    <div className="bg-amber-950/95 border-b-2 border-amber-500 text-amber-200 px-3 sm:px-4 py-2 font-mono text-xs flex items-center justify-between gap-3 shadow-lg z-40 sticky top-0 animate-fadeIn">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
        <div>
          <strong className="text-amber-300 font-black uppercase">
            DATI POTENZIALMENTE OBSOLETI ({staleMinutes} MIN SENZA SYNC)
          </strong>
          <span className="hidden md:inline ml-1 text-[11px] text-amber-200/80">
            • Le funzioni critiche operano in sola lettura per prevenire disallineamenti di piano.
          </span>
        </div>
      </div>

      {isOnline && (
        <button
          onClick={triggerSync}
          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider rounded flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0 shadow-xs"
        >
          <RefreshCw className="w-3 h-3" />
          <span>AGGIORNA ADESSO</span>
        </button>
      )}
    </div>
  );
};
