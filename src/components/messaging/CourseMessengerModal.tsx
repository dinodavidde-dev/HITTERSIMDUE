import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import { AlertTriangle, CheckCircle, Flame, Info, Lock, MessageSquare, Send, ShieldAlert, X } from 'lucide-react';
import { UserRole } from '../../types';
import { getTeamCodeName } from '../../utils/teamUtils';

interface CourseMessengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultStation?: string;
}

export const CourseMessengerModal: React.FC<CourseMessengerModalProps> = ({
  isOpen,
  onClose,
  defaultSubject = '',
  defaultStation = '',
}) => {
  const {
    language,
    userRole,
    sendCourseMessage,
    selectedDiscenteId,
    discenti,
    selectedFacultyId,
    faculty,
    selectedTechnicianId,
    technicians,
    selectedDirectorId,
    directors,
    selectedGuestId,
    guests,
    teams,
  } = useCourse();

  const isEn = language === 'en';

  // Determine current active person details based on userRole
  let currentSenderName = isEn ? 'Course User' : 'Utente Corso';
  let currentSenderId = 'user-generic';
  let currentTeamId: number | undefined = undefined;
  let currentStation = defaultStation;

  if (userRole === 'discente') {
    const disc = discenti.find((d) => d.id === selectedDiscenteId) || discenti[0];
    if (disc) {
      currentSenderName = disc.name;
      currentSenderId = disc.id;
      currentTeamId = disc.teamId;
      currentStation = currentStation || getTeamCodeName(disc.teamId);
    }
  } else if (userRole === 'faculty') {
    const fac = faculty.find((f) => f.id === selectedFacultyId) || faculty[0];
    if (fac) {
      currentSenderName = fac.name;
      currentSenderId = fac.id;
      currentTeamId = fac.assignedTeamId;
      currentStation = currentStation || (fac.assignedStation || `Tutor ${getTeamCodeName(fac.assignedTeamId)}`);
    }
  } else if (userRole === 'tecnico') {
    const tech = technicians.find((t) => t.id === selectedTechnicianId) || technicians[0];
    if (tech) {
      currentSenderName = tech.name;
      currentSenderId = tech.id;
      currentStation = currentStation || (tech.assignedStations?.[0] || (isEn ? 'Tech Lab' : 'Lab Tecnico'));
    }
  } else if (userRole === 'direttore') {
    const dir = directors.find((d) => d.id === selectedDirectorId) || directors[0];
    if (dir) {
      currentSenderName = dir.name;
      currentSenderId = dir.id;
      currentStation = currentStation || (isEn ? 'Command / Direction' : 'Regia / Direzione');
    }
  } else if (userRole === 'ospite') {
    const guest = guests.find((g) => g.id === selectedGuestId) || guests[0];
    if (guest) {
      currentSenderName = guest.name;
      currentSenderId = guest.id;
      currentStation = currentStation || (guest.organization || (isEn ? 'Guest Delegation' : 'Delegazione Ospiti'));
    }
  }

  const [subject, setSubject] = useState<string>(defaultSubject);
  const [content, setContent] = useState<string>('');
  const [station, setStation] = useState<string>(currentStation);
  const [priorityType, setPriorityType] = useState<'info' | 'warning' | 'emergency'>('info');
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    sendCourseMessage({
      senderId: currentSenderId,
      senderName: currentSenderName,
      senderRole: userRole,
      senderTeamId: currentTeamId,
      senderStation: station.trim() || undefined,
      type: priorityType,
      subject: subject.trim() || (isEn ? 'Field communication' : 'Segnalazione dal campo'),
      content: content.trim(),
    });

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setContent('');
      setSubject('');
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="course-messenger-modal"
        className="bg-neutral-900 border-4 border-orange-500 w-full max-w-lg text-neutral-100 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="close-messenger-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer border border-neutral-700"
          title={isEn ? 'Close panel' : 'Chiudi pannello'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-orange-500/40 pb-4 mb-4">
          <div className="p-2.5 bg-orange-500 text-black border-2 border-black flex-shrink-0">
            <MessageSquare className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-black text-orange-400 uppercase tracking-widest">
              {isEn ? 'FIELD COMMUNICATION CHANNEL' : 'CANALE DI COMUNICAZIONE CAMPO'}
            </span>
            <h3 className="font-black text-lg sm:text-xl text-white uppercase tracking-tight">
              {isEn ? 'SEND SIGNAL / MESSAGE' : 'INVIA SEGNALAZIONE / MESSAGGIO'}
            </h3>
          </div>
        </div>

        {/* Privacy Note Banner */}
        <div className="p-3 bg-neutral-950 border border-neutral-800 flex items-start gap-2.5 mb-4 text-xs">
          <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-neutral-300">
            <span className="font-bold text-emerald-400 uppercase tracking-wider block">
              {isEn ? 'COMMAND & FACULTY CONFIDENTIAL CHANNEL' : 'CANALE RISERVATO REGIA & FACULTY'}
            </span>
            {isEn
              ? 'Messages sent will be delivered in real-time and displayed exclusively to Course Directors and Faculty for operational coordination.'
              : 'I messaggi inviati saranno recapitati in tempo reale e visualizzati esclusivamente dai Direttori del Corso e dalla Faculty per garantire il coordinamento operativo.'}
          </div>
        </div>

        {sentSuccess ? (
          <div className="p-8 text-center bg-emerald-950/70 border-2 border-emerald-500 space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-black text-white uppercase tracking-tight">
              {isEn ? 'MESSAGE SENT SUCCESSFULLY' : 'MESSAGGIO TRASMESSO CON SUCCESSO'}
            </h4>
            <p className="text-xs font-semibold text-emerald-200">
              {isEn ? 'Course Direction and Faculty received the notification in real-time.' : 'La Direzione e la Faculty hanno ricevuto la segnalazione in tempo reale.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Sender summary */}
            <div className="flex items-center justify-between bg-neutral-950 p-2.5 border border-neutral-800 text-xs font-mono">
              <div>
                <span className="text-neutral-500 uppercase">{isEn ? 'Sender: ' : 'Mittente: '}</span>
                <span className="text-white font-bold">{currentSenderName}</span>
                <span className="text-orange-400 ml-1.5 uppercase font-bold">({userRole})</span>
              </div>
              {currentTeamId && (
                <div className="bg-neutral-800 px-2 py-0.5 text-neutral-200 font-bold">
                  {isEn ? `TEAM ${currentTeamId}` : `SQUADRA ${currentTeamId}`}
                </div>
              )}
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-black text-neutral-300 uppercase tracking-wider mb-1.5">
                {isEn ? 'Message Priority:' : 'Priorità Segnalazione:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriorityType('info')}
                  className={`p-2 border text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    priorityType === 'info'
                      ? 'bg-neutral-100 text-black border-neutral-100 shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>INFO</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPriorityType('warning')}
                  className={`p-2 border text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    priorityType === 'warning'
                      ? 'bg-orange-500 text-black border-orange-500 shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isEn ? 'WARNING' : 'ALLERTA'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPriorityType('emergency')}
                  className={`p-2 border text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    priorityType === 'emergency'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm animate-pulse'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{isEn ? 'URGENT' : 'URGENTE'}</span>
                </button>
              </div>
            </div>

            {/* Location / Station */}
            <div>
              <label className="block text-xs font-black text-neutral-300 uppercase tracking-wider mb-1">
                {isEn ? 'Station / Field Area:' : 'Postazione / Settore Campo:'}
              </label>
              <input
                type="text"
                value={station}
                onChange={(e) => setStation(e.target.value)}
                placeholder={isEn ? 'e.g. Station 3 (Wet-Lab Chest), Triage Area, ED...' : 'Es. Postazione 3 (Torace Wet-Lab), Area Triage, ED...'}
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-orange-500 px-3 py-1.5 text-xs text-white font-medium focus:outline-hidden"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-black text-neutral-300 uppercase tracking-wider mb-1">
                {isEn ? 'Short Subject:' : 'Oggetto Breve:'}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isEn ? 'e.g. Refill simulated blood, Scenario clarification request...' : 'Es. Ricarica sangue simulato, Richiesta chiarimento scenario...'}
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-orange-500 px-3 py-1.5 text-xs text-white font-medium focus:outline-hidden"
              />
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-xs font-black text-neutral-300 uppercase tracking-wider mb-1">
                {isEn ? 'Message Body:' : 'Testo del Messaggio:'}
              </label>
              <textarea
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isEn ? 'Write message, support request or field feedback for direction and faculty...' : 'Scrivi qui la segnalazione, richiesta di supporto o riscontro operativo per la direzione e la faculty...'}
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-orange-500 p-2.5 text-xs text-white font-medium focus:outline-hidden resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Annulla'}
              </button>
              <button
                id="submit-send-course-msg-btn"
                type="submit"
                className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider border-2 border-black flex items-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isEn ? 'SEND TO COMMAND & FACULTY' : 'INVIA A REGIA E FACULTY'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
