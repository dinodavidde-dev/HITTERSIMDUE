import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import { AlertOctagon, AlertTriangle, CheckCircle, Info, Pause, Play, ShieldAlert, X } from 'lucide-react';

interface CourseSuspensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_REASONS = [
  'Allineamento didattico generale e debriefing straordinario',
  'Pausa tecnica per rifornimento moulage e taratura simulatori',
  'Verifica postazioni e reset materiale didattico',
  'Pausa ristoro non programmata / Cooldown operativo',
  'Emergenza logistica o cambio rotazione urgente',
];

export const CourseSuspensionModal: React.FC<CourseSuspensionModalProps> = ({ isOpen, onClose }) => {
  const { language, suspensionInfo, suspendCourse, resumeCourse, userRole, facultyAuthSession, directors, selectedDirectorId } = useCourse();
  const isEn = language === 'en';

  const quickReasons = isEn
    ? [
        'General didactic alignment and extraordinary debriefing',
        'Technical pause for moulage refill and simulator calibration',
        'Station check and teaching equipment reset',
        'Unscheduled refreshment break / Operational cooldown',
        'Logistical emergency or urgent rotation change',
      ]
    : [
        'Allineamento didattico generale e debriefing straordinario',
        'Pausa tecnica per rifornimento moulage e taratura simulatori',
        'Verifica postazioni e reset materiale didattico',
        'Pausa ristoro non programmata / Cooldown operativo',
        'Emergenza logistica o cambio rotazione urgente',
      ];

  const currentDirector = directors.find((d) => d.id === selectedDirectorId) || directors[0];
  const senderName = currentDirector ? currentDirector.name : (facultyAuthSession.facultyName || (isEn ? 'Course Direction' : 'Direzione Corso'));

  const [selectedReason, setSelectedReason] = useState<string>(quickReasons[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isResumingConfirm, setIsResumingConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSuspend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    const finalReason = customReason.trim() || selectedReason;
    suspendCourse(finalReason, senderName);
    setIsConfirmed(false);
    onClose();
  };

  const handleResume = () => {
    resumeCourse(senderName);
    setIsResumingConfirm(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="course-suspension-modal"
        className="bg-neutral-900 border-4 border-red-600 w-full max-w-xl text-neutral-100 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        <button
          id="close-suspension-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer border border-neutral-700"
          title={isEn ? 'Close panel' : 'Chiudi pannello'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-red-600/60 pb-4 mb-5">
          <div className="p-3 bg-red-600 text-black border-2 border-black flex-shrink-0">
            <AlertOctagon className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-black text-red-500 uppercase tracking-widest">
              {isEn ? 'COMMAND CONTROL' : 'CONTROLLO DI REGIA'}
            </span>
            <h3 className="font-black text-xl text-white uppercase tracking-tight">
              {suspensionInfo.isSuspended
                ? isEn
                  ? 'COURSE SUSPENSION STATUS'
                  : 'STATO SOSPENSIONE CORSO'
                : isEn
                ? 'COURSE PAUSE / SUSPENSION'
                : 'INTERRUZIONE / SOSPENSIONE CORSO'}
            </h3>
          </div>
        </div>

        {/* Current State */}
        {suspensionInfo.isSuspended ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-950/70 border-2 border-red-600 text-red-200 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-black text-sm uppercase">
                <AlertTriangle className="w-5 h-5" />
                <span>{isEn ? 'THE COURSE IS CURRENTLY SUSPENDED' : 'IL CORSO È ATTUALMENTE SOSPESO'}</span>
              </div>
              <p className="text-sm font-semibold text-white">
                <strong className="text-neutral-400">{isEn ? 'Reason: ' : 'Motivo: '}</strong>
                {suspensionInfo.reason}
              </p>
              <div className="text-xs font-mono text-neutral-300 flex items-center gap-3 pt-1">
                <span>{isEn ? 'Suspended at: ' : 'Sospeso alle: '}{suspensionInfo.suspendedAt || 'N/D'}</span>
                <span>•</span>
                <span>{isEn ? 'By: ' : 'Da: '}{suspensionInfo.suspendedBy || (isEn ? 'Direction' : 'Direzione')}</span>
              </div>
            </div>

            <div className="p-4 bg-neutral-950 border border-neutral-800 space-y-3">
              <p className="text-xs text-neutral-300 font-semibold leading-relaxed">
                {isEn
                  ? 'All connected terminals (Participants, Technicians, Faculty, Public Displays) are displaying the suspension alert and the timer is paused. Click the button below to send the resume signal to all roles.'
                  : 'Tutti i terminali collegati (Discenti, Tecnici, Faculty, Schermo Pubblico) stanno visualizzando l\'allerta di sospensione e il timer è fermo. Clicca sul pulsante sottostante per inviare a tutte le figure il segnale di ripartenza del corso.'}
              </p>

              {!isResumingConfirm ? (
                <button
                  id="modal-trigger-resume-btn"
                  type="button"
                  onClick={() => setIsResumingConfirm(true)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest border-2 border-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{isEn ? 'RESUME COURSE AND BROADCAST SIGNAL' : 'RIPRENDI CORSO E INVIA SEGNALE A TUTTI'}</span>
                </button>
              ) : (
                <div className="p-3 bg-neutral-900 border-2 border-emerald-500 space-y-2">
                  <p className="text-xs font-black text-emerald-400 uppercase text-center">
                    {isEn ? 'Confirm restarting the course now?' : 'Confermi di voler far ripartire il corso ora?'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      id="modal-confirm-resume-btn"
                      type="button"
                      onClick={handleResume}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                    >
                      {isEn ? 'Yes, Resume Course' : 'Sì, Ripartenza Corso'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsResumingConfirm(false)}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer"
                    >
                      {isEn ? 'Cancel' : 'Annulla'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSuspend} className="space-y-4">
            <div className="p-3 bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
              <strong className="text-orange-400 uppercase font-black block mb-1">
                {isEn ? 'WARNING: HIGH IMPACT ACTION' : 'ATTENZIONE: AZIONE AD ALTO IMPATTO'}
              </strong>
              {isEn
                ? 'Activating suspension will immediately halt the countdown on all clients, send a maximum-priority alert broadcast with sound to all course participants and staff, and put teams on standby.'
                : 'L\'attivazione della sospensione bloccherà immediatamente il countdown su tutti i client, invierà un broadcast di allerta di massima priorità con suono a tutte le figure del corso e metterà le squadre in attesa di ulteriori istruzioni.'}
            </div>

            {/* Quick Reason Selection */}
            <div>
              <label className="block text-xs font-black text-neutral-300 uppercase tracking-wider mb-1.5">
                {isEn ? 'Select Quick Reason:' : 'Seleziona Motivo Rapido:'}
              </label>
              <div className="space-y-1.5">
                {quickReasons.map((reason, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-2.5 p-2.5 border text-xs cursor-pointer transition-colors ${
                      selectedReason === reason && !customReason
                        ? 'bg-red-950/60 border-red-500 text-white font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="suspensionReason"
                      checked={selectedReason === reason && !customReason}
                      onChange={() => {
                        setSelectedReason(reason);
                        setCustomReason('');
                      }}
                      className="accent-red-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Reason */}
            <div>
              <label className="block text-xs font-black text-neutral-300 uppercase tracking-wider mb-1.5">
                {isEn ? 'Or specify custom reason:' : 'Oppure specifica un motivo personalizzato:'}
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder={isEn ? 'e.g. Awaiting air rescue helicopter arrival for joint scenario...' : 'Es. Attesa arrivo elisoccorso per scenario interforze...'}
                className="w-full bg-neutral-950 border-2 border-neutral-700 focus:border-red-500 px-3 py-2 text-sm text-white font-medium focus:outline-hidden"
              />
            </div>

            {/* Mandatory Confirmation Checkbox */}
            <div className="p-3 bg-red-950/40 border border-red-600/70">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  id="confirm-suspension-checkbox"
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="mt-0.5 accent-red-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-black text-red-200">
                  {isEn
                    ? 'I CONFIRM THE SUSPENSION REQUEST AND THE STOP SIGNAL TO ALL COURSE ROLES'
                    : 'CONFERMO LA RICHIESTA DI SOSPENSIONE E IL SEGNALE DI STOP A TUTTE LE FIGURE DEL CORSO'}
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase tracking-wider cursor-pointer border border-neutral-700"
              >
                {isEn ? 'Cancel' : 'Annulla'}
              </button>
              <button
                id="submit-suspend-course-btn"
                type="submit"
                disabled={!isConfirmed}
                className={`px-5 py-2.5 font-black text-xs uppercase tracking-widest border-2 transition-all flex items-center gap-2 cursor-pointer ${
                  isConfirmed
                    ? 'bg-red-600 hover:bg-red-500 text-white border-white shadow-xl animate-pulse'
                    : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed'
                }`}
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>{isEn ? 'PAUSE COURSE NOW' : 'INTERROMPI CORSO ORA'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
