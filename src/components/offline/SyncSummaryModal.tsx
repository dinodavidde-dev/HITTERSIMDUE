import React, { useState } from 'react';
import { CheckCircle2, AlertOctagon, RefreshCw, X, ShieldCheck, ArrowRight, Layers } from 'lucide-react';
import { type SyncReconciliationReport, resolveConflict } from '../../offline/syncQueue';

interface SyncSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SyncReconciliationReport | null;
  onOpenIntents?: () => void;
}

export const SyncSummaryModal: React.FC<SyncSummaryModalProps> = ({
  isOpen,
  onClose,
  report,
  onOpenIntents,
}) => {
  const [resolvedConflicts, setResolvedConflicts] = useState<Record<string, 'local' | 'remote'>>({});

  if (!isOpen || !report) return null;

  const handleResolve = async (queueItemId: string, choice: 'keep_local' | 'keep_remote') => {
    await resolveConflict(queueItemId, choice);
    setResolvedConflicts((prev) => ({
      ...prev,
      [queueItemId]: choice === 'keep_local' ? 'local' : 'remote',
    }));
  };

  const pendingConflictCount =
    report.conflicts.length - Object.keys(resolvedConflicts).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-950 border-2 border-emerald-500 max-w-xl w-full p-5 sm:p-6 shadow-2xl relative text-neutral-100 font-mono space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-black">
                Riconciliazione Connessione Ristabilita
              </span>
              <h3 className="text-lg font-black uppercase text-white tracking-tight">
                RIEPILOGO SINCRONIZZAZIONE DIFFERITA
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Counter Badges */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
            <span className="text-2xl font-black text-emerald-400 block">{report.syncedCount}</span>
            <span className="text-[10px] text-neutral-400 uppercase font-bold mt-0.5 block">
              Azioni Sincronizzate
            </span>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
            <span className="text-2xl font-black text-amber-400 block">{report.pendingIntentsCount}</span>
            <span className="text-[10px] text-neutral-400 uppercase font-bold mt-0.5 block">
              Intenzioni in Attesa
            </span>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
            <span className={`text-2xl font-black block ${report.conflictCount > 0 ? 'text-red-400' : 'text-neutral-500'}`}>
              {report.conflictCount}
            </span>
            <span className="text-[10px] text-neutral-400 uppercase font-bold mt-0.5 block">
              Conflitti Rilevati
            </span>
          </div>
        </div>

        {/* Lista Conflitti se presenti */}
        {report.conflicts.length > 0 && (
          <div className="space-y-3 pt-2">
            <span className="text-xs font-black uppercase text-red-400 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4" />
              <span>Risoluzione Conflitti ({pendingConflictCount} in sospeso)</span>
            </span>

            {report.conflicts.map((conf) => {
              const status = resolvedConflicts[conf.queueItemId];
              return (
                <div key={conf.queueItemId} className="p-3.5 bg-neutral-900 border border-neutral-800 rounded space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-white font-bold">{conf.itemType.toUpperCase()}</strong>
                    {status && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded">
                        Risolto ({status === 'local' ? 'Mantieni Locale' : 'Mantieni Remoto'})
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-400">{conf.description}</p>

                  <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                    <div className="p-2 bg-black/60 border border-neutral-800 rounded">
                      <span className="text-orange-400 block uppercase font-bold mb-0.5">Versione Locale (Offline):</span>
                      <pre className="overflow-x-auto text-neutral-300">{JSON.stringify(conf.localPayload, null, 2)}</pre>
                    </div>
                    <div className="p-2 bg-black/60 border border-neutral-800 rounded">
                      <span className="text-cyan-400 block uppercase font-bold mb-0.5">Versione Remota (Server):</span>
                      <pre className="overflow-x-auto text-neutral-300">{JSON.stringify(conf.remotePayload || { status: 'remote_state' }, null, 2)}</pre>
                    </div>
                  </div>

                  {!status && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleResolve(conf.queueItemId, 'keep_remote')}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[11px] font-bold uppercase transition-colors"
                      >
                        Mantieni Remoto
                      </button>
                      <button
                        onClick={() => handleResolve(conf.queueItemId, 'keep_local')}
                        className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-[11px] font-black uppercase shadow-xs transition-colors"
                      >
                        Mantieni Locale
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Note e passaggio alle intenzioni */}
        {report.pendingIntentsCount > 0 && (
          <div className="p-3 bg-amber-950/60 border border-amber-500/80 rounded text-xs space-y-2">
            <p className="text-amber-200 text-[11px]">
              Sono state rilevate <strong>{report.pendingIntentsCount} intenzioni di modifica al cronoprogramma</strong> registrate
              durante il periodo offline. Come da protocollo, non sono state applicate automaticamente.
            </p>
            {onOpenIntents && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenIntents();
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>APRI PANNELLO INTENZIONI REGIA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
          <button
            type="button"
            disabled={pendingConflictCount > 0}
            onClick={onClose}
            className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded transition-all ${
              pendingConflictCount === 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-60'
            }`}
          >
            {pendingConflictCount === 0 ? 'ALLINEAMENTO COMPLETATO' : 'RISOLVI I CONFLITTI PRIMA DI CONTINUARE'}
          </button>
        </div>
      </div>
    </div>
  );
};
