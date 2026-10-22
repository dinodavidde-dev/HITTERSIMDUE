import React, { useState, useEffect } from 'react';
import { Clock, Check, X, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { db, type ScheduleIntent } from '../../offline/db';
import { logAuditAction } from '../../schedule/auditLogStore';

interface IntentReviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApproveIntent?: (intent: ScheduleIntent) => void;
}

export const IntentReviewPanel: React.FC<IntentReviewPanelProps> = ({
  isOpen,
  onClose,
  onApproveIntent,
}) => {
  const [intents, setIntents] = useState<ScheduleIntent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadIntents = async () => {
    setIsLoading(true);
    const pending = await db.scheduleIntents.where('status').equals('pending').toArray();
    setIntents(pending);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadIntents();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApprove = async (intent: ScheduleIntent) => {
    await db.scheduleIntents.update(intent.id, { status: 'approved' });
    await logAuditAction('intent', `Approvazione intento slot ${intent.slotId}`, 'REGIA-01', {
      reason: `Approvato intento offline: ${intent.reason}`,
      after: { deltaMinutes: intent.deltaMinutes },
    });
    if (onApproveIntent) {
      onApproveIntent(intent);
    }
    await loadIntents();
  };

  const handleReject = async (intent: ScheduleIntent) => {
    await db.scheduleIntents.update(intent.id, { status: 'rejected' });
    await logAuditAction('intent', `Rifiuto intento slot ${intent.slotId}`, 'REGIA-01', {
      reason: `Rifiutato intento offline: ${intent.reason}`,
    });
    await loadIntents();
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString('it-IT')} ore ${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-950 border-2 border-amber-500 max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative text-neutral-100 font-mono space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-black">
                Controllo Intenzioni Registrate Offline
              </span>
              <h3 className="text-lg font-black uppercase text-white tracking-tight">
                APPROVAZIONE MODIFICHE CRONOPROGRAMMA
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

        {/* Info Box */}
        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300 space-y-1 flex-shrink-0">
          <p>
            Durante l&apos;assenza di rete, le variazioni al cronoprogramma non vengono applicate direttamente per prevenire
            disallineamenti critici. Verifica ciascuna proposta prima di applicarla al programma globale.
          </p>
        </div>

        {/* Lista Intenzioni */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="p-8 text-center text-neutral-500 text-xs">Caricamento intenzioni...</div>
          ) : intents.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 text-xs border border-neutral-900 rounded space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-white">Nessuna intenzione di modifica in sospeso.</p>
              <p className="text-neutral-500 text-[11px]">Tutte le modifiche al piano sono state verificate ed allineate.</p>
            </div>
          ) : (
            intents.map((intent) => (
              <div
                key={intent.id}
                className="p-3.5 bg-neutral-900 border border-neutral-800 rounded space-y-2.5 text-xs hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-600 rounded text-[10px] font-black">
                      SLOT ID: {intent.slotId}
                    </span>
                    <span className="font-bold text-orange-400">
                      Delta: {intent.deltaMinutes > 0 ? `+${intent.deltaMinutes}` : intent.deltaMinutes} min
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">{formatTime(intent.createdAt)}</span>
                </div>

                <div className="text-[11px] text-neutral-300">
                  <span className="text-neutral-500">Operatore: </span>
                  <strong className="text-white">{intent.userId}</strong>
                </div>

                <div className="p-2.5 bg-black/50 border border-neutral-850 rounded text-[11px]">
                  <span className="text-neutral-500 block uppercase font-bold text-[9px] mb-0.5">Motivazione inserita:</span>
                  <p className="text-neutral-200 italic">&quot;{intent.reason}&quot;</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-850">
                  <button
                    type="button"
                    onClick={() => handleReject(intent)}
                    className="px-3 py-1 bg-neutral-800 hover:bg-red-950/60 hover:text-red-300 text-neutral-300 rounded text-xs font-bold uppercase transition-colors cursor-pointer border border-neutral-700"
                  >
                    Rifiuta
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(intent)}
                    className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approva ed Applica</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold uppercase text-xs rounded border border-neutral-700 cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
