import React, { useState, useEffect, useCallback } from 'react';
import { useCourse } from '../context/CourseContext';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Delete,
  Lock,
  Radio,
  Shield,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';

interface RegiaKeypadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (role: 'regia' | 'direttore', profileId: string) => void;
}

export const RegiaKeypadModal: React.FC<RegiaKeypadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    language,
    regiaStaff,
    directors,
    selectedRegiaId,
    setSelectedRegiaId,
    selectedDirectorId,
    setSelectedDirectorId,
    setUserRole,
    setCurrentTab,
  } = useCourse();

  const isEn = language === 'en';

  const [step, setStep] = useState<'pin' | 'select_profile'>('pin');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [targetRole, setTargetRole] = useState<'regia' | 'direttore' | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  const CODE_REGIA = '9438';
  const CODE_DIRETTORE = '0118';

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setError(false);
      setIsSuccess(false);
      setStep('pin');
      setTargetRole(null);
      setSelectedProfileId('');
    }
  }, [isOpen]);

  const handleDigit = useCallback(
    (digit: string) => {
      if (isSuccess || step !== 'pin') return;
      setError(false);
      if (pin.length < 4) {
        const nextPin = pin + digit;
        setPin(nextPin);

        if (nextPin.length === 4) {
          if (nextPin === CODE_REGIA) {
            setIsSuccess(true);
            setTargetRole('regia');
            // Default to current selected or first
            const defaultId = selectedRegiaId || regiaStaff[0]?.id || 'regia-1';
            setSelectedProfileId(defaultId);
            setTimeout(() => {
              setStep('select_profile');
              setIsSuccess(false);
            }, 550);
          } else if (nextPin === CODE_DIRETTORE) {
            setIsSuccess(true);
            setTargetRole('direttore');
            // Default to current selected or first
            const defaultId = selectedDirectorId || directors[0]?.id || 'dir-1';
            setSelectedProfileId(defaultId);
            setTimeout(() => {
              setStep('select_profile');
              setIsSuccess(false);
            }, 550);
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
    [pin, isSuccess, step, selectedRegiaId, regiaStaff, selectedDirectorId, directors]
  );

  const handleBackspace = useCallback(() => {
    if (isSuccess || step !== 'pin') return;
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  }, [isSuccess, step]);

  const handleClear = useCallback(() => {
    if (isSuccess || step !== 'pin') return;
    setError(false);
    setPin('');
  }, [isSuccess, step]);

  const handleConfirmProfile = useCallback(
    (profileId?: string) => {
      const activeId = profileId || selectedProfileId;
      if (!targetRole || !activeId) return;

      if (targetRole === 'regia') {
        setSelectedRegiaId(activeId);
        setUserRole('regia');
        setCurrentTab('regia');
      } else if (targetRole === 'direttore') {
        setSelectedDirectorId(activeId);
        setUserRole('direttore');
        setCurrentTab('direttori');
      }

      if (onSuccess) {
        onSuccess(targetRole, activeId);
      }
      onClose();
    },
    [targetRole, selectedProfileId, setSelectedRegiaId, setSelectedDirectorId, setUserRole, setCurrentTab, onSuccess, onClose]
  );

  // Physical keyboard listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === 'pin') {
        if (e.key >= '0' && e.key <= '9') {
          handleDigit(e.key);
        } else if (e.key === 'Backspace') {
          handleBackspace();
        } else if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'Delete' || e.key.toLowerCase() === 'c') {
          handleClear();
        }
      } else if (step === 'select_profile') {
        if (e.key === 'Escape') {
          // Go back to PIN
          setStep('pin');
          setPin('');
          setTargetRole(null);
        } else if (e.key === 'Enter') {
          handleConfirmProfile();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, handleDigit, handleBackspace, handleClear, handleConfirmProfile, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative z-10 w-full ${
          step === 'select_profile' ? 'max-w-lg' : 'max-w-sm'
        } bg-neutral-950 border-2 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isSuccess
            ? targetRole === 'regia'
              ? 'border-pink-500 shadow-pink-500/30'
              : 'border-amber-500 shadow-amber-500/30'
            : error
            ? 'border-red-600 shadow-red-600/30 animate-shake'
            : 'border-neutral-700 shadow-neutral-950'
        }`}
      >
        {/* ==================================================== */}
        {/* STEP 1: PIN ENTRY KEYPAD                             */}
        {/* ==================================================== */}
        {step === 'pin' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-neutral-900 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-black transition-colors ${
                    isSuccess
                      ? targetRole === 'regia'
                        ? 'bg-pink-600 text-white'
                        : 'bg-amber-600 text-black'
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
                    {isEn ? 'RESTRICTED AREA ACCESS' : 'ACCESSO AREA RISERVATA'}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                title={isEn ? 'Close' : 'Chiudi'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PIN Display Area */}
            <div className="p-5 text-center space-y-4">
              <p className="text-xs text-neutral-400 font-mono">
                {isEn
                  ? 'Enter your 4-digit security PIN to unlock the operational profile:'
                  : 'Digita il PIN di sicurezza a 4 cifre per sbloccare il profilo operativo:'}
              </p>

              {/* 4 Digit Boxes */}
              <div className="flex justify-center gap-3 py-1">
                {[0, 1, 2, 3].map((index) => {
                  const digit = pin[index];
                  const isFilled = digit !== undefined;

                  return (
                    <div
                      key={index}
                      className={`w-12 h-14 rounded-lg flex items-center justify-center font-mono font-black text-2xl border-2 transition-all duration-200 ${
                        isSuccess
                          ? targetRole === 'regia'
                            ? 'bg-pink-950/80 border-pink-500 text-pink-300'
                            : 'bg-amber-950/80 border-amber-500 text-amber-300'
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
                  <div
                    className={`flex items-center gap-1.5 font-mono text-xs font-bold uppercase animate-fadeIn ${
                      targetRole === 'regia' ? 'text-pink-400' : 'text-amber-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {targetRole === 'regia'
                        ? isEn
                          ? 'REGIA CODE (9438) ACCEPTED • LOADING PROFILES...'
                          : 'CODICE REGIA (9438) ACCETTATO • CARICAMENTO PROFILI...'
                        : isEn
                        ? 'DIRECTION CODE (0118) ACCEPTED • LOADING PROFILES...'
                        : 'CODICE DIREZIONE (0118) ACCETTATO • CARICAMENTO PROFILI...'}
                    </span>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-1.5 text-red-400 font-mono text-xs font-bold uppercase animate-fadeIn">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{isEn ? 'INCORRECT PIN • ACCESS DENIED' : 'CODICE ERRATO • ACCESSO NEGATO'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-red-400" />
                      <strong className="text-pink-400">9438</strong> = {isEn ? 'Control Room' : 'Regia'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <strong className="text-amber-400">0118</strong> = {isEn ? 'Direction' : 'Direzione'}
                    </span>
                  </div>
                )}
              </div>

              {/* Keypad Grid (3x4) */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigit(digit)}
                    className="h-12 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-white font-mono font-bold text-xl rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    {digit}
                  </button>
                ))}

                {/* Clear Button */}
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-12 bg-neutral-950 hover:bg-neutral-900 active:bg-neutral-800 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider rounded-lg border border-neutral-800 hover:border-amber-600 transition-all cursor-pointer flex items-center justify-center active:scale-95"
                  title={isEn ? 'Clear all' : 'Cancella tutto'}
                >
                  {isEn ? 'CLR' : 'CANC'}
                </button>

                {/* 0 Button */}
                <button
                  type="button"
                  onClick={() => handleDigit('0')}
                  className="h-12 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-white font-mono font-bold text-xl rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  0
                </button>

                {/* Backspace Button */}
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-12 bg-neutral-950 hover:bg-neutral-900 active:bg-neutral-800 text-neutral-300 hover:text-white font-mono font-bold rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer flex items-center justify-center active:scale-95"
                  title={isEn ? 'Delete last digit' : 'Cancella ultima cifra'}
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {/* Footer Notice */}
              <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span>{isEn ? 'KEYBOARD OR TOUCH' : 'TASTIERA O TOUCH'}</span>
                <span className="text-neutral-400 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-pink-400" /> MISSION CONTROL & DIRECTION
                </span>
              </div>
            </div>
          </>
        )}

        {/* ==================================================== */}
        {/* STEP 2: PROFILE SELECTION FROM ANAGRAFICA            */}
        {/* ==================================================== */}
        {step === 'select_profile' && (
          <div className="flex flex-col max-h-[85vh]">
            {/* Header */}
            <div
              className={`flex items-center justify-between px-5 py-4 border-b ${
                targetRole === 'regia'
                  ? 'bg-gradient-to-r from-pink-950/70 via-neutral-900 to-neutral-950 border-pink-900/50'
                  : 'bg-gradient-to-r from-amber-950/70 via-neutral-900 to-neutral-950 border-amber-900/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-black ${
                    targetRole === 'regia'
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                      : 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  }`}
                >
                  {targetRole === 'regia' ? (
                    <Radio className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                        targetRole === 'regia'
                          ? 'bg-pink-950/80 text-pink-300 border-pink-700/60'
                          : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                      }`}
                    >
                      PIN {targetRole === 'regia' ? CODE_REGIA : CODE_DIRETTORE} •{' '}
                      {targetRole === 'regia'
                        ? isEn
                          ? 'CONTROL ROOM'
                          : 'REGIA'
                        : isEn
                        ? 'COURSE DIRECTION'
                        : 'DIREZIONE CORSO'}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 bg-emerald-950/80 text-emerald-400 border border-emerald-800 rounded font-mono uppercase">
                      {isEn ? 'UNLOCKED' : 'SBLOCCATO'}
                    </span>
                  </div>
                  <h2 className="text-sm font-black text-white uppercase tracking-tight">
                    {targetRole === 'regia'
                      ? isEn
                        ? 'SELECT CONTROL ROOM OPERATOR'
                        : 'SELEZIONA PROFILO OPERATORE REGIA'
                      : isEn
                      ? 'SELECT COURSE DIRECTOR PROFILE'
                      : 'SELEZIONA PROFILO DIRETTORE'}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                title={isEn ? 'Close' : 'Chiudi'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction description */}
            <div className="px-5 py-2.5 bg-neutral-900/60 border-b border-neutral-850 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>
                {targetRole === 'regia'
                  ? isEn
                    ? `Registered Regia operators in directory (${regiaStaff.length}):`
                    : `Operatori Regia registrati in anagrafica (${regiaStaff.length}):`
                  : isEn
                  ? `Registered Course Directors in directory (${directors.length}):`
                  : `Direttori del Corso registrati in anagrafica (${directors.length}):`}
              </span>
              <span className="text-[10px] text-neutral-500">
                {isEn ? 'Click card or confirm below' : 'Clicca sul profilo o conferma in basso'}
              </span>
            </div>

            {/* Scrollable Profiles List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 max-h-[50vh] scrollbar-thin">
              {targetRole === 'regia' && (
                <>
                  {regiaStaff.length === 0 ? (
                    <div className="p-6 text-center text-neutral-500 font-mono text-xs border border-neutral-800 rounded-lg">
                      {isEn
                        ? 'No Regia profile found in directory. Accessing as Generic Regia.'
                        : 'Nessun operatore Regia trovato in anagrafica. Accesso come Regia generica.'}
                    </div>
                  ) : (
                    regiaStaff.map((regia) => {
                      const isSelected = selectedProfileId === regia.id;
                      return (
                        <div
                          key={regia.id}
                          onClick={() => setSelectedProfileId(regia.id)}
                          onDoubleClick={() => handleConfirmProfile(regia.id)}
                          className={`relative p-3.5 rounded-lg border-2 transition-all cursor-pointer text-left flex items-start justify-between gap-3 group ${
                            isSelected
                              ? 'bg-pink-950/40 border-pink-500 shadow-md shadow-pink-950/50'
                              : 'bg-neutral-900/80 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-pink-600 text-white'
                                  : 'bg-neutral-800 text-neutral-400 group-hover:text-white'
                              }`}
                            >
                              <Radio className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-sm text-white tracking-tight">
                                  {regia.name}
                                </span>
                                <span className="font-mono text-[11px] font-black bg-pink-950 text-pink-300 border border-pink-700/60 px-1.5 py-0.2 rounded">
                                  {regia.badgeCode || 'REGIA'}
                                </span>
                                {regia.isMaster && (
                                  <span className="font-mono text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded uppercase">
                                    {isEn ? 'MASTER CONTROL' : 'REGIA MASTER'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-300 mt-0.5 truncate font-mono">
                                {regia.title || regia.role || (isEn ? 'Control Room Operator' : 'Operatore di Regia')}
                              </p>
                              {regia.organization && (
                                <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                                  {regia.organization}
                                </p>
                              )}
                              {regia.email && (
                                <p className="text-[10px] font-mono text-neutral-400 mt-0.5 truncate">
                                  {regia.email}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center flex-shrink-0 self-center">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-pink-500 bg-pink-600 text-white'
                                  : 'border-neutral-700 bg-neutral-900 group-hover:border-neutral-500'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {targetRole === 'direttore' && (
                <>
                  {directors.length === 0 ? (
                    <div className="p-6 text-center text-neutral-500 font-mono text-xs border border-neutral-800 rounded-lg">
                      {isEn
                        ? 'No Director profile found in directory. Accessing as Generic Director.'
                        : 'Nessun direttore trovato in anagrafica. Accesso come Direttore generico.'}
                    </div>
                  ) : (
                    directors.map((dir) => {
                      const isSelected = selectedProfileId === dir.id;
                      return (
                        <div
                          key={dir.id}
                          onClick={() => setSelectedProfileId(dir.id)}
                          onDoubleClick={() => handleConfirmProfile(dir.id)}
                          className={`relative p-3.5 rounded-lg border-2 transition-all cursor-pointer text-left flex items-start justify-between gap-3 group ${
                            isSelected
                              ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/50'
                              : 'bg-neutral-900/80 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-amber-500 text-black'
                                  : 'bg-neutral-800 text-neutral-400 group-hover:text-white'
                              }`}
                            >
                              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-sm text-white tracking-tight">
                                  {dir.name}
                                </span>
                                <span className="font-mono text-[11px] font-black bg-amber-950 text-amber-300 border border-amber-700/60 px-1.5 py-0.2 rounded">
                                  {dir.badgeCode || 'DIR'}
                                </span>
                                {dir.isMaster && (
                                  <span className="font-mono text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded uppercase">
                                    {isEn ? 'HEAD DIRECTOR' : 'DIRETTORE TITOLARE'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-300 mt-0.5 truncate font-mono">
                                {dir.title || (isEn ? 'Course Director' : 'Direttore del Corso')}
                              </p>
                              {dir.organization && (
                                <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                                  {dir.organization}
                                </p>
                              )}
                              {dir.email && (
                                <p className="text-[10px] font-mono text-neutral-400 mt-0.5 truncate">
                                  {dir.email}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center flex-shrink-0 self-center">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-amber-500 bg-amber-500 text-black'
                                  : 'border-neutral-700 bg-neutral-900 group-hover:border-neutral-500'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="px-5 py-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('pin');
                  setPin('');
                  setTargetRole(null);
                  setError(false);
                  setIsSuccess(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border border-neutral-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isEn ? 'Back / Change PIN' : 'Indietro / Cambia PIN'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmProfile()}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 ${
                  targetRole === 'regia'
                    ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-pink-600/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30'
                }`}
              >
                <span>
                  {targetRole === 'regia'
                    ? isEn
                      ? 'Confirm & Launch Control Room'
                      : 'Conferma & Accedi alla Regia'
                    : isEn
                    ? 'Confirm & Launch Direction View'
                    : 'Conferma & Accedi alla Direzione'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

