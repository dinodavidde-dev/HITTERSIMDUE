import React, { useState, useEffect } from 'react';
import { RotateCcw, X, CheckCircle2, Clock } from 'lucide-react';

interface QuickRollbackToastProps {
  description: string;
  onRollback: () => void;
  onDismiss: () => void;
}

export const QuickRollbackToast: React.FC<QuickRollbackToastProps> = ({
  description,
  onRollback,
  onDismiss,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss]);

  const progressPercent = (secondsRemaining / 60) * 100;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-neutral-950 border-2 border-orange-500 rounded-lg shadow-2xl p-4 font-mono text-neutral-100 animate-slideUp">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
              Cronoprogramma Aggiornato
            </span>
            <p className="text-xs text-white font-bold mt-0.5 line-clamp-2">{description}</p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress countdown bar */}
      <div className="mt-3 w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-orange-500 h-full transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-850">
        <span className="text-[11px] text-neutral-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-neutral-500" />
          <span>Rollback disponibile per <strong>{secondsRemaining}s</strong></span>
        </span>

        <button
          onClick={onRollback}
          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded border border-red-300 shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ANNULLA MODIFICA</span>
        </button>
      </div>
    </div>
  );
};
