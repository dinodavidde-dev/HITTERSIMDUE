import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import { ShieldCheck, Lock, Unlock, X, Check, AlertCircle } from 'lucide-react';

interface OperatorUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleLabel?: string;
}

export const OperatorUnlockModal: React.FC<OperatorUnlockModalProps> = ({
  isOpen,
  onClose,
  roleLabel = 'Operatore',
}) => {
  const { language, unlockOperatorSelection, canSelectOperator, setOpenedByRole } = useCourse();
  const isEn = language === 'en';

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = unlockOperatorSelection(pin);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPin('');
        onClose();
      }, 700);
    } else {
      setError(isEn ? 'Invalid PIN. Authorized: 2026 (Direction) or 118 (Regia)' : 'PIN non valido. Autorizzati: 2026 (Direzione) o 118 (Regia)');
    }
  };

  const handleQuickUnlock = (code: string) => {
    setPin(code);
    setError(null);
    const ok = unlockOperatorSelection(code);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPin('');
        onClose();
      }, 700);
    }
  };

  const handleRelock = () => {
    setOpenedByRole(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono animate-fadeIn">
      <div className="bg-neutral-900 border-2 border-yellow-500/80 shadow-2xl max-w-md w-full p-5 space-y-4 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
          <div className="w-9 h-9 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 flex items-center justify-center rounded">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {isEn ? 'Unlock Operator Selection' : 'Sblocco Selettore Operatore'}
            </h3>
            <p className="text-[11px] text-neutral-400">
              {isEn ? `Reserved for Regia & Course Directors (${roleLabel})` : `Riservato a Regia e Direzione del Corso (${roleLabel})`}
            </p>
          </div>
        </div>

        {canSelectOperator ? (
          <div className="space-y-4 py-2">
            <div className="p-3 bg-emerald-950/60 border border-emerald-600/80 rounded flex items-center gap-2.5 text-emerald-300 text-xs">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                {isEn
                  ? 'Operator selector is currently UNLOCKED for this view.'
                  : 'Il selettore operatore è attualmente SBLOCCATO per questa visuale.'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleRelock}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs uppercase rounded border border-neutral-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                <span>{isEn ? 'Re-lock for Student/Operator' : 'Blocca nuovamente per discente'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-black text-xs uppercase rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isEn ? 'Close' : 'Chiudi'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-neutral-300 leading-relaxed">
              {isEn
                ? 'By default, personalized views hide the operator switcher to prevent participants from viewing other profiles. Enter the Regia/Direction authorization PIN to unlock switching on this device.'
                : 'Nelle visuali personalizzate la selezione dell\'operatore è bloccata per evitare cambi profilo da parte dei partecipanti. Inserisci il PIN autorizzato Regia o Direzione per sbloccare la selezione su questo dispositivo.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> {isEn ? 'Authorization PIN:' : 'PIN Autorizzazione:'}
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                placeholder={isEn ? 'e.g. 2026 or 118' : 'es. 2026 o 118'}
                autoFocus
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-yellow-400 text-white font-mono text-center tracking-widest text-lg py-2 px-3 rounded outline-none"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-red-950/60 border border-red-700/80 rounded flex items-center gap-2 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-700/80 rounded flex items-center gap-2 text-emerald-300 text-xs">
                <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{isEn ? 'Access granted! Unlocking...' : 'Accesso autorizzato! Sblocco selettore in corso...'}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-neutral-400 uppercase">{isEn ? 'Quick PINs:' : 'PIN Rapidi:'}</span>
              <button
                type="button"
                onClick={() => handleQuickUnlock('2026')}
                className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-yellow-300 text-[11px] rounded transition-colors cursor-pointer"
              >
                2026 ({isEn ? 'Direction' : 'Direzione'})
              </button>
              <button
                type="button"
                onClick={() => handleQuickUnlock('118')}
                className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-yellow-300 text-[11px] rounded transition-colors cursor-pointer"
              >
                118 ({isEn ? 'Control' : 'Regia'})
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase rounded transition-colors cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Annulla'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-black text-xs uppercase rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{isEn ? 'Unlock' : 'Sblocca Selettore'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
