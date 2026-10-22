import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle2, Layers, Clock, X } from 'lucide-react';
import { useOfflineSync, type NetworkState } from '../../offline/useOfflineSync';

interface NetworkStatusBadgeProps {
  onOpenIntentReview?: () => void;
}

export const NetworkStatusBadge: React.FC<NetworkStatusBadgeProps> = ({ onOpenIntentReview }) => {
  const {
    networkState,
    isOnline,
    isSyncing,
    isOffline,
    pendingQueueCount,
    lastSyncTime,
    isDataStale,
    staleMinutes,
    triggerSync,
    isIntentPanelOpen,
    setIsIntentPanelOpen,
    pendingIntents,
  } = useOfflineSync();

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const formatLastSync = (d: Date | null) => {
    if (!d) return '--:--';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Badge Stato Rete */}
        <button
          type="button"
          onClick={() => setIsDetailsOpen(true)}
          className={`px-2 sm:px-2.5 py-1 rounded font-mono text-[11px] font-black uppercase tracking-wider border flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
            isOnline
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600 hover:border-emerald-400'
              : isSyncing
              ? 'bg-amber-950/90 text-amber-300 border-amber-500 animate-pulse'
              : 'bg-red-950/95 text-red-200 border-red-500 animate-pulse'
          }`}
          title="Stato connettività e sincronizzazione differita"
        >
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ONLINE</span>
              <span className="text-emerald-400/80 font-normal hidden md:inline">• {formatLastSync(lastSyncTime)}</span>
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
              <span>SYNC…</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
              <span>OFFLINE</span>
              {pendingQueueCount > 0 && (
                <span className="px-1.5 py-0.2 bg-red-600 text-white rounded font-mono text-[10px] font-black">
                  {pendingQueueCount} in coda
                </span>
              )}
            </>
          )}
        </button>

        {/* Intenzioni da verificare (visibile se ci sono intenzioni registrate offline) */}
        {pendingIntents.length > 0 && (
          <button
            type="button"
            onClick={() => setIsIntentPanelOpen(true)}
            className="px-2 py-1 bg-amber-500 text-black font-mono text-[10px] font-black uppercase tracking-wider rounded shadow-md border border-amber-300 flex items-center gap-1 cursor-pointer animate-bounce"
            title="Intenzioni di modifica registrate offline in attesa di approvazione della Regia"
          >
            <Clock className="w-3 h-3" />
            <span>{pendingIntents.length} INTENTI</span>
          </button>
        )}
      </div>

      {/* Pannello Dettagli Stato Rete & Coda */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-950 border-2 border-neutral-700 max-w-md w-full p-5 rounded-lg shadow-2xl relative text-neutral-100 font-mono space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-black uppercase text-white">STATO RETE & SINCRONIZZAZIONE</h3>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-between">
                <span className="text-neutral-400 uppercase font-bold">Stato Connessione:</span>
                <span
                  className={`font-black uppercase px-2.5 py-0.5 rounded ${
                    isOnline
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      : isSyncing
                      ? 'bg-amber-950 text-amber-300 border border-amber-600'
                      : 'bg-red-950 text-red-300 border border-red-600'
                  }`}
                >
                  {networkState.toUpperCase()}
                </span>
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Ultima Sincronizzazione:</span>
                  <strong className="text-white">
                    {lastSyncTime ? lastSyncTime.toLocaleTimeString('it-IT') : 'Al caricamento iniziale'}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Azioni in coda differita:</span>
                  <span className="font-black text-orange-400">{pendingQueueCount} elementi</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Intenzioni modifica piano:</span>
                  <span className="font-black text-amber-400">{pendingIntents.length} in sospeso</span>
                </div>
              </div>

              {/* Guida funzioni offline-first vs online-only */}
              <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded space-y-2 text-[11px]">
                <strong className="text-orange-400 block uppercase font-bold">Architettura Operativa:</strong>
                <p className="text-neutral-300">
                  • <strong>Offline-First:</strong> consultazione cronoprogramma, handover SBAR, note e toggle presenze
                  sono sempre attivi e salvati localmente su IndexedDB.
                </p>
                <p className="text-neutral-300">
                  • <strong>Online-Only:</strong> le modifiche al piano globale effettuate offline vengono registrate
                  come <em>intenzioni</em> e richiedono conferma della Regia al ripristino della connettività.
                </p>
              </div>

              {isDataStale && (
                <div className="p-2.5 bg-amber-950/80 border border-amber-500 rounded text-amber-200 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Dati locali non sincronizzati da oltre 30 minuti ({staleMinutes}m). Modalità sola lettura attiva.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              {isOnline && (
                <button
                  type="button"
                  onClick={() => {
                    triggerSync();
                    setIsDetailsOpen(false);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase rounded transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>FORZA SYNC ADESSO</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase rounded cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
