import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import {
  Check,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Lock,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { UserRole } from '../types';
import { translateRoleOrSpecialty } from '../i18n/medicalTerms';

interface FacultyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRolePending?: UserRole | null;
  onSuccess?: (role?: UserRole) => void;
}

export const FacultyAuthModal: React.FC<FacultyAuthModalProps> = ({
  isOpen,
  onClose,
  targetRolePending,
  onSuccess,
}) => {
  const { language, faculty, authorizeFaculty, facultyAuthSession, deauthorizeFaculty } = useCourse();
  const isEn = language === 'en';

  const [pin, setPin] = useState<string>('');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(
    faculty[0]?.id || 'fac-1'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setErrorMsg(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
  };

  const handleQuickPin = (presetPin: string) => {
    setPin(presetPin);
    setErrorMsg(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg(isEn ? 'Enter PIN or authorization code.' : 'Inserire il PIN o codice autorizzazione.');
      return;
    }

    const ok = authorizeFaculty(pin.trim(), selectedFacultyId);
    if (ok) {
      setErrorMsg(null);
      const selectedDoc = faculty.find((f) => f.id === selectedFacultyId);
      setSuccessMsg(
        isEn
          ? `Access authorized for ${selectedDoc ? selectedDoc.name : 'Faculty'}`
          : `Accesso autorizzato per ${selectedDoc ? selectedDoc.name : 'Faculty'}`
      );
      
      setTimeout(() => {
        setSuccessMsg(null);
        setPin('');
        if (onSuccess) {
          onSuccess(targetRolePending || 'faculty');
        }
        onClose();
      }, 500);
    } else {
      setErrorMsg(
        isEn
          ? 'Incorrect PIN. Use quick service code: 118, 2026 or badge code.'
          : 'PIN errato. Usa il codice di servizio rapido: 118, 2026 o il badge code.'
      );
    }
  };

  const handleDeauth = () => {
    deauthorizeFaculty();
    onClose();
  };

  const selectedFacultyObj = faculty.find((f) => f.id === selectedFacultyId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
      <div
        className="bg-neutral-950 border-4 border-neutral-700 w-full max-w-md text-neutral-100 shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b-2 border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-orange-500 text-black font-black">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base uppercase tracking-tight text-white flex items-center gap-2">
                {isEn ? 'INSTRUCTOR & PROTECTED ROLES ACCESS' : 'ACCESSO ISTRUTTORE & RUOLI PROTETTI'}
              </h2>
              <p className="text-[11px] text-neutral-400 font-mono">
                {isEn ? 'Activate Faculty Pass to switch instantly between views' : 'Attiva il Faculty Pass per passare istantaneamente tra le viste'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer border border-neutral-700"
            title={isEn ? 'Close' : 'Chiudi'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          
          {facultyAuthSession.isAuthorized ? (
            /* Already Authorized View */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/50 border-2 border-emerald-500 flex items-start gap-3">
                <div className="p-2 bg-emerald-500 text-black font-black flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="font-black text-sm uppercase text-white tracking-wide block">
                    {isEn ? 'FACULTY SESSION ACTIVE & UNLOCKED' : 'SESSIONE FACULTY ATTIVA & SBLOCCATA'}
                  </span>
                  <p className="text-[11px] text-neutral-300">
                    {isEn ? 'Active Instructor: ' : 'Istruttore attivo: '}
                    <span className="font-bold text-emerald-300">{facultyAuthSession.facultyName || (isEn ? 'Faculty Instructor' : 'Istruttore Faculty')}</span>
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {isEn
                      ? 'You can use the quick selector above to switch to Participant, Tech or Faculty without re-authenticating.'
                      : 'Puoi utilizzare il selettore rapido in alto per passare a Discente, Tecnico o Faculty senza autenticarti nuovamente.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => {
                    if (onSuccess && targetRolePending) {
                      onSuccess(targetRolePending);
                    }
                    onClose();
                  }}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase tracking-wider text-xs cursor-pointer shadow-md transition-colors"
                >
                  {isEn ? 'Continue to view' : 'Continua alla vista'}
                </button>
                <button
                  type="button"
                  onClick={handleDeauth}
                  className="px-3 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-red-400 border border-red-500/40 hover:border-red-500 font-bold uppercase tracking-wider text-xs cursor-pointer transition-colors"
                  title={isEn ? 'Lock and end Faculty session' : 'Blocca e termina sessione Faculty'}
                >
                  {isEn ? 'Lock / Exit' : 'Blocca / Esci'}
                </button>
              </div>
            </div>
          ) : (
            /* PIN Keypad Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Faculty Profile Selection */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                  <span>{isEn ? 'Select Instructor / Faculty Profile' : 'Seleziona Profilo Docente / Faculty'}</span>
                  <span className="text-orange-400 font-mono text-[10px]">{isEn ? 'REQUIRED' : 'OBBLIGATORIO'}</span>
                </label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full bg-neutral-900 border-2 border-neutral-700 text-neutral-100 p-2 text-xs font-bold focus:border-orange-500 focus:outline-hidden"
                >
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.title} ({f.badgeCode || 'FAC'})
                    </option>
                  ))}
                </select>
                {selectedFacultyObj && (
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {isEn ? 'Specialty: ' : 'Specialità: '}{translateRoleOrSpecialty(selectedFacultyObj.specialty, language)} • {isEn ? 'Team ' : 'Squadra '}{selectedFacultyObj.assignedTeamId}
                  </p>
                )}
              </div>

              {/* PIN Display Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-300">
                  {isEn ? 'Authorization PIN / Badge Pass' : 'PIN di Autorizzazione / Badge Pass'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={8}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder={isEn ? 'Enter PIN (e.g. 118 or 2026)' : 'Inserisci PIN (es. 118 o 2026)'}
                    className="w-full bg-neutral-900 border-2 border-neutral-700 text-center tracking-[0.4em] text-lg font-mono font-black text-white p-2.5 focus:border-orange-500 focus:outline-hidden placeholder:tracking-normal placeholder:text-xs placeholder:text-neutral-600"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Feedback Alert */}
              {errorMsg && (
                <div className="p-2 bg-red-950/80 border border-red-500 text-red-300 font-bold text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2 bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Numeric Keypad for Touch / Tablet Devices */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeyPress(digit)}
                    className="py-2.5 bg-neutral-900 hover:bg-neutral-800 active:bg-orange-500 active:text-black text-white font-mono text-base font-black border border-neutral-750 transition-colors cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-mono text-xs uppercase font-bold border border-neutral-750 transition-colors cursor-pointer"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyPress('0')}
                  className="py-2.5 bg-neutral-900 hover:bg-neutral-800 active:bg-orange-500 active:text-black text-white font-mono text-base font-black border border-neutral-750 transition-colors cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-mono text-xs uppercase font-bold border border-neutral-750 transition-colors cursor-pointer"
                >
                  ⌫
                </button>
              </div>

              {/* Quick Presets for Demo / Floor Operations */}
              <div className="flex items-center justify-between gap-1.5 pt-1 text-[10px] text-neutral-400 font-mono">
                <span>{isEn ? 'Quick emergency codes:' : 'Codici rapidi di emergenza:'}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickPin('118')}
                    className="px-2 py-0.5 bg-neutral-900 hover:bg-orange-500 hover:text-black text-orange-400 font-bold border border-neutral-700 cursor-pointer"
                  >
                    PIN 118
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPin('2026')}
                    className="px-2 py-0.5 bg-neutral-900 hover:bg-orange-500 hover:text-black text-orange-400 font-bold border border-neutral-700 cursor-pointer"
                  >
                    PIN 2026
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center gap-2 border-t border-neutral-850">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase tracking-wider text-xs cursor-pointer shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isEn ? 'UNLOCK FACULTY PASS' : 'SBLOCCA FACULTY PASS'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold uppercase tracking-wider text-xs border border-neutral-700 transition-colors cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Annulla'}
                </button>
              </div>
            </form>
          )}

          {/* Practical Floor Guidance */}
          <div className="p-2.5 bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
            <span className="font-bold text-neutral-200">{isEn ? 'ℹ️ Operational Feature:' : 'ℹ️ Funzionalità Operativa:'}</span>{' '}
            {isEn
              ? 'Faculty authentication allows instructors to jump with 1 click between Participant view (badge and debriefing), Technician console (parameters and moulage) and Faculty sheet (team evaluation and scores) directly from the navigation bar without logging out.'
              : 'L\'autenticazione Faculty permette ai docenti di saltare in 1 click tra la vista del Discente (badge e debriefing), la console del Tecnico (parametri e moulage) e la scheda Faculty (valutazione squadra e punteggi) direttamente dalla barra di navigazione senza disconnettersi.'}
          </div>

        </div>
      </div>
    </div>
  );
};
