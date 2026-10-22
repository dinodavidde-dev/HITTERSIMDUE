import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';
import { useOfflineSync } from '../../offline/useOfflineSync';

export const OfflinePreloadProgress: React.FC = () => {
  const { isPreloadRunning, preloadProgress, preloadStep } = useOfflineSync();

  if (!isPreloadRunning) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-neutral-950 border-2 border-orange-500 rounded-lg p-3.5 shadow-2xl font-mono text-neutral-100 max-w-sm w-full animate-slideUp">
      <div className="flex items-center gap-2 mb-1.5">
        <Database className="w-4 h-4 text-orange-400 animate-pulse" />
        <span className="text-xs font-black uppercase tracking-wider text-orange-400">
          Preparazione Modalità Offline
        </span>
      </div>

      <p className="text-[11px] text-neutral-300 truncate mb-2">{preloadStep || 'Download archivio critico IndexedDB...'}</p>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-300 ease-out"
          style={{ width: `${preloadProgress}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-1.5 text-[10px] text-neutral-500">
        <span>Archiviazione locale in corso</span>
        <span className="font-bold text-orange-400">{preloadProgress}%</span>
      </div>
    </div>
  );
};
