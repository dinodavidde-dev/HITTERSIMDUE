import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Delete,
  Lock,
  Radio,
  ShieldAlert,
  X,
} from 'lucide-react';

interface RegiaKeypadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegiaKeypadModal: React.FC<RegiaKeypadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const SECRET_CODE = '9438';

  const handleDigit = useCallback(
    (digit: string) => {
      if (isSuccess) return;
      setError(false);
      if (pin.length < 4) {
        const nextPin = pin + digit;
        setPin(nextPin);

        if (nextPin.length === 4) {
          if (nextPin === SECRET_CODE) {
            setIsSuccess(true);
            setTimeout(() => {
              onSuccess();
              onClose();
              setPin('');
              setIsSuccess(false);
            }, 600);
          } else {
            setError(true);
            setTimeout(() => {
              setPin('');
              setError(false);
            }, 800);
          }
        }
      }
    },
    [pin, isSuccess, onSuccess, onClose]
  );

  const handleBackspace = useCallback(() => {
    if (isSuccess) return;
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  }, [isSuccess]);

  const handleClear = useCallback(() => {
    if (isSuccess) return;
    setError(false);
    setPin('');
  }, [isSuccess]);

  // Physical keyboard listener
  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setError(false);
      setIsSuccess(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Delete' || e.key.toLowerCase() === 'c') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleBackspace, handleClear, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative z-10 w-full max-w-sm bg-neutral-950 border-2 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isSuccess
            ? 'border-emerald-500 shadow-emerald-500/30'
            : error
            ? 'border-red-600 shadow-red-600/30 animate-shake'
            : 'border-neutral-700 shadow-neutral-950'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-neutral-900 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-black transition-colors ${
                isSuccess
                  ? 'bg-emerald-600 text-white'
                  : error
                  ? 'bg-red-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              <Activity className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-black text-red-500 uppercase tracking-widest">
                  INTUBATI EM
                </span>
                <span className="text-[9px] px-1 py-0.2 bg-neutral-800 text-neutral-300 rounded font-mono uppercase">
                  SECURITY PIN
                </span>
              </div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight">
                ACCESSO REGIA OPERATIVA
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Display Area */}
        <div className="p-5 text-center space-y-4">
          <p className="text-xs text-neutral-400 font-mono">
            Inserisci il codice PIN di sicurezza a 4 cifre per accedere alla visuale Regia.
          </p>

          {/* 4 Digit Boxes */}
          <div className="flex justify-center gap-3 py-2">
            {[0, 1, 2, 3].map((index) => {
              const digit = pin[index];
              const isFilled = digit !== undefined;

              return (
                <div
                  key={index}
                  className={`w-12 h-14 rounded-lg flex items-center justify-center font-mono font-black text-2xl border-2 transition-all duration-200 ${
                    isSuccess
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : error
                      ? 'bg-red-950/80 border-red-600 text-red-300'
                      : isFilled
                      ? 'bg-neutral-900 border-red-500 text-white shadow-md'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-600'
                  }`}
                >
                  {isFilled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {/* Status Message */}
          <div className="h-6 flex items-center justify-center">
            {isSuccess ? (
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold uppercase animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>CODICE CORRETTO • AVVIO REGIA IN CORSO...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-1.5 text-red-400 font-mono text-xs font-bold uppercase animate-fadeIn">
                <AlertTriangle className="w-4 h-4" />
                <span>CODICE ERRATO • ACCESSO NEGATO</span>
              </div>
            ) : (
              <span className="text-[11px] font-mono text-neutral-500 uppercase flex items-center gap-1">
                <Lock className="w-3 h-3" /> TASTIERINO PROTETTO
              </span>
            )}
          </div>

          {/* Keypad Grid (3x4) */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-12 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-white font-mono font-bold text-xl rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {digit}
              </button>
            ))}

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              className="h-12 bg-neutral-950 hover:bg-neutral-900 active:bg-neutral-800 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider rounded-lg border border-neutral-800 hover:border-amber-600 transition-all cursor-pointer flex items-center justify-center active:scale-95"
              title="Cancella tutto"
            >
              CANC
            </button>

            {/* 0 Button */}
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-12 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-white font-mono font-bold text-xl rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              0
            </button>

            {/* Backspace Button */}
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 bg-neutral-950 hover:bg-neutral-900 active:bg-neutral-800 text-neutral-300 hover:text-white font-mono font-bold rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer flex items-center justify-center active:scale-95"
              title="Cancella ultima cifra"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px] font-mono text-neutral-500">
            <span>TASTIERA O TOUCH</span>
            <span className="text-neutral-400 flex items-center gap-1">
              <Radio className="w-3 h-3 text-pink-400" /> MISSION CONTROL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
