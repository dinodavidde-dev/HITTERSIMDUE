import React, { useState } from 'react';
import { BalancingReport } from '../../utils/staffBalancer';
import {
  Scale,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  ArrowRight,
  Filter,
  Check,
  RefreshCw,
} from 'lucide-react';

interface StaffBalancingModalProps<T> {
  report: BalancingReport<T> | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: T[]) => void;
}

export const StaffBalancingModal = <T,>({
  report,
  isOpen,
  onClose,
  onConfirm,
}: StaffBalancingModalProps<T>) => {
  const [filterChangedOnly, setFilterChangedOnly] = useState(true);

  if (!isOpen || !report) return null;

  const visibleDiffs = filterChangedOnly
    ? report.diffs.filter((d) => d.isChanged)
    : report.diffs;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn font-mono text-white"
    >
      <div className="bg-neutral-950 border-2 border-emerald-500 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-neutral-900 border-b border-neutral-800 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2 py-0.5 bg-emerald-600 text-black font-black uppercase tracking-wider">
                MOTORE DI BILANCIAMENTO
              </span>
              <span className="px-2 py-0.5 bg-neutral-950 border border-emerald-500/80 text-emerald-300 font-bold uppercase">
                ANTEPRIMA REPORT OPERATIVO
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{report.title}</span>
            </h2>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed max-w-3xl">
              {report.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics Banner */}
        <div className="p-3 sm:p-4 bg-black/60 border-b border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">
              Totale Entità
            </span>
            <span className="text-base font-black text-white tabular-nums">
              {report.totalEntities}
            </span>
          </div>

          <div className="p-2 bg-neutral-900 border border-amber-500/50 text-center">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">
              Riassegnazioni
            </span>
            <span className="text-base font-black text-amber-300 tabular-nums">
              {report.changedCount} / {report.totalEntities}
            </span>
          </div>

          <div className="p-2 bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">
              Delta Carico Iniziale
            </span>
            <span className="text-base font-black text-red-400 tabular-nums">
              Δ {report.workloadDeltaBefore}
            </span>
          </div>

          <div className="p-2 bg-neutral-900 border border-emerald-500/50 text-center">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">
              Delta Carico Ottimizzato
            </span>
            <span className="text-base font-black text-emerald-300 tabular-nums">
              Δ {report.workloadDeltaAfter} (Bilanciato)
            </span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="px-4 py-2.5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-xs">Visualizza:</span>
            <button
              type="button"
              onClick={() => setFilterChangedOnly(!filterChangedOnly)}
              className={`px-2.5 py-1 text-xs font-bold border cursor-pointer flex items-center gap-1.5 transition-colors ${
                filterChangedOnly
                  ? 'bg-amber-950 text-amber-200 border-amber-500'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-700'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>
                {filterChangedOnly
                  ? `Solo Modifiche (${report.changedCount})`
                  : `Tutti i Record (${report.totalEntities})`}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-400 font-sans">
            Verificare l&apos;impatto prima di propagare i dati alla Regia CH-3.
          </div>
        </div>

        {/* Diff Table List */}
        <div className="overflow-y-auto max-h-[46vh] p-4 space-y-2">
          {visibleDiffs.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white">Assetto già perfettamente bilanciato</div>
              <div className="text-xs text-neutral-500">
                Non ci sono discrepanze o sovraccarichi rilevati nelle assegnazioni correnti.
              </div>
            </div>
          ) : (
            visibleDiffs.map((diff) => (
              <div
                key={diff.id}
                className={`p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  diff.isChanged
                    ? 'bg-neutral-900/90 border-amber-500/70'
                    : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-700 text-amber-400 font-black text-xs">
                      {diff.code}
                    </span>
                    <span className="font-bold text-white text-xs truncate">{diff.name}</span>
                    {diff.isChanged ? (
                      <span className="px-1.5 py-0.2 bg-amber-500 text-black font-black text-[9px] uppercase">
                        NUOVA ASSEGNAZIONE
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 bg-neutral-800 text-neutral-400 font-bold text-[9px] uppercase">
                        INVARIATO
                      </span>
                    )}
                  </div>
                  {diff.details && (
                    <div className="text-[11px] text-neutral-400 font-sans truncate">
                      {diff.details}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs shrink-0 self-end sm:self-center font-mono">
                  <div className="px-2.5 py-1 bg-black/80 border border-neutral-800 text-neutral-400 text-right">
                    <div className="text-[9px] uppercase text-neutral-500">Prima</div>
                    <div className="font-bold truncate max-w-[170px]">{diff.before}</div>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />

                  <div className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-left">
                    <div className="text-[9px] uppercase text-emerald-400">Proposto</div>
                    <div className="font-black truncate max-w-[190px]">{diff.after}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs border border-neutral-700 cursor-pointer"
          >
            Annulla e Mantieni Assetto Corrente
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm(report.appliedPayload);
              onClose();
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Conferma e Applica (Notifica Regia CH-3)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
