import React, { useState } from 'react';
import { AlertOctagon, Pause, X, AlertTriangle, ShieldAlert, Check } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPause: (reason: string, notes: string) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ isOpen, onClose, onConfirmPause }) => {
  const [reason, setReason] = useState<string>('Sicurezza');
  const [notes, setNotes] = useState<string>('');
  const [confirmedChecked, setConfirmedChecked] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason === 'Altro' && !notes.trim()) {
      setErrorMsg('La nota è obbligatoria quando la motivazione è "Altro".');
      return;
    }
    if (!confirmedChecked) {
      setErrorMsg('È richiesta la conferma esplicita per sospendere le attività.');
      return;
    }

    onConfirmPause(reason, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-950 border-2 border-amber-500 max-w-lg w-full p-5 sm:p-6 shadow-2xl relative text-neutral-100 font-mono space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded">
              <Pause className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-black">
                Comando Globale di Sicurezza
              </span>
              <h3 className="text-lg font-black uppercase text-white tracking-tight flex items-center gap-1.5">
                <span>PAUSA EVENTO GLOBALE</span>
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

        {/* Informazioni d'impatto */}
        <div className="p-3 bg-amber-950/40 border border-amber-600/60 text-xs text-amber-200/90 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Effetti Immediati:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Congela istantaneamente il <strong>Master Timer</strong> e tutti i timer delle stazioni (TCCC, Shock Room,
            WS). Lo stato viene memorizzato in IndexedDB e tracciato nell&apos;Audit Log locale.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
              Motivazione Sospensione *
            </label>
            <select
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrorMsg('');
              }}
              className="w-full bg-neutral-900 border border-neutral-700 text-white px-3 py-2 rounded focus:outline-hidden focus:border-amber-400 font-mono"
            >
              <option value="Sicurezza">Sicurezza (Incolumità allievi / discenti)</option>
              <option value="Guasto tecnico">Guasto tecnico (Simulatori / Manichini / Audio-Video)</option>
              <option value="Emergenza reale">Emergenza reale (Intervento sanitario sul campo)</option>
              <option value="Altro">Altro (Specificare nelle note)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
              Note e Dettagli Operativi {reason === 'Altro' && <span className="text-red-400 font-black">* (Obbligatorio)</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setErrorMsg('');
              }}
              rows={3}
              placeholder="Inserisci dettagli su postazioni impattate o azioni correttive in corso..."
              className="w-full bg-neutral-900 border border-neutral-700 text-white p-2.5 rounded focus:outline-hidden focus:border-amber-400 font-mono text-xs placeholder:text-neutral-600"
            />
          </div>

          {/* Checkbox Conferma */}
          <label className="flex items-start gap-2.5 p-2.5 bg-neutral-900 border border-neutral-800 rounded cursor-pointer hover:border-neutral-700 transition-colors">
            <input
              type="checkbox"
              checked={confirmedChecked}
              onChange={(e) => {
                setConfirmedChecked(e.target.checked);
                setErrorMsg('');
              }}
              className="mt-0.5 accent-amber-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-[11px] text-neutral-300 leading-tight">
              Confermo di voler sospendere il cronoprogramma generale e congelare l&apos;avanzamento orario per tutte le squadre.
            </span>
          </label>

          {errorMsg && (
            <div className="p-2 bg-red-950/80 border border-red-500 text-red-200 text-[11px] flex items-center gap-1.5 font-bold animate-fadeIn">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold uppercase rounded border border-neutral-700 transition-colors cursor-pointer"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5 fill-black" />
            <span>METTI IN PAUSA EVENTO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
