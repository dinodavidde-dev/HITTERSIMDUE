import React, { useState } from 'react';
import {
  X,
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Camera,
  Users,
  Award,
  Wrench,
  Shield,
  Radio,
  UserCheck,
} from 'lucide-react';
import { useCourse } from '../context/CourseContext';
import { resolveParticipantByQuery, AnyParticipant, ParticipantCategory } from '../utils/qrCodeUtils';
import { ParticipantQRModal } from './anagrafica/ParticipantQRModal';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const {
    language,
    discenti,
    faculty,
    technicians,
    directors,
    regiaStaff,
    guests,
    teams,
    setCurrentTab,
    setSelectedDiscenteId,
    setSelectedFacultyId,
    setSelectedTechnicianId,
    setSelectedDirectorId,
    setSelectedRegiaId,
    setSelectedGuestId,
    setActiveFacultyTeamId,
    setUserRole,
  } = useCourse();

  const isEn = language === 'en';
  const [inputCode, setInputCode] = useState('');
  const [resolvedResult, setResolvedResult] = useState<{
    person: AnyParticipant;
    category: ParticipantCategory;
    team?: any;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    const query = (customQuery || inputCode).trim();
    if (!query) return;

    const result = resolveParticipantByQuery(query, {
      discenti,
      faculty,
      technicians,
      directors,
      regiaStaff,
      guests,
      teams,
    });

    if (result) {
      setResolvedResult(result);
    } else {
      setErrorMsg(
        isEn
          ? `No participant found for "${query}". Try entering a badge code like DISC-01, FAC-01, TECH-01, or full name.`
          : `Nessun partecipante trovato per "${query}". Prova con una matricola es. DISC-01, FAC-01, TECH-01, o nome completo.`
      );
      setResolvedResult(null);
    }
  };

  const handleOpenPersonalPage = () => {
    if (!resolvedResult) return;
    const { person, category, team } = resolvedResult;

    if (category === 'discenti') {
      setSelectedDiscenteId(person.id);
      setCurrentTab('discente');
      setUserRole('discente');
    } else if (category === 'faculty') {
      setSelectedFacultyId(person.id);
      if (team?.id) setActiveFacultyTeamId(team.id);
      setCurrentTab('faculty');
      setUserRole('faculty');
    } else if (category === 'tecnici') {
      setSelectedTechnicianId(person.id);
      setCurrentTab('tecnici');
      setUserRole('tecnico');
    } else if (category === 'direttori') {
      setSelectedDirectorId(person.id);
      setUserRole('direttore');
      setCurrentTab('direttori');
    } else if (category === 'regia') {
      setSelectedRegiaId(person.id);
      setUserRole('regia');
      setCurrentTab('regia');
    } else if (category === 'ospiti') {
      setSelectedGuestId(person.id);
      setUserRole('ospite');
      setCurrentTab('ospite');
    }

    onClose();
  };

  const quickSamples = [
    { label: 'DISC-01 (TL Sq.1)', code: 'DISC-01' },
    { label: 'DISC-16 (TL Sq.4)', code: 'DISC-16' },
    { label: 'FAC-01 (Tutor)', code: 'FAC-01' },
    { label: 'TECH-01 (Moulage)', code: 'TECH-01' },
    { label: 'DIR-01 (Direttore)', code: 'DIR-01' },
    { label: 'REG-01 (Regia)', code: 'REG-01' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-950 border-2 border-orange-500 w-full max-w-xl shadow-2xl overflow-hidden flex flex-col relative">
        {/* Modal Header */}
        <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                {isEn ? 'TACTICAL QR PASS SCANNER & VIEWER' : 'SCANNER QR PASS TATTICO & VERIFICA BADGE'}
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                {isEn
                  ? 'Verify credentials, decode QR links, and load personalized participant dashboard'
                  : 'Verifica credenziali, decodifica link QR e apri la dashboard personalizzata'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Search Input Form */}
          <form onSubmit={(e) => handleSearch(e)} className="space-y-2">
            <label className="block text-xs font-mono font-bold text-neutral-300 uppercase">
              {isEn
                ? 'Scan QR Link, Badge Code, or Participant Name:'
                : 'Scansiona Link QR, Digita Matricola o Nome Partecipante:'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Paste QR URL, or type DISC-01, FAC-01, TECH-01...'
                      : 'Incolla URL QR, oppure digita DISC-01, FAC-01, TECH-01...'
                  }
                  className="w-full bg-neutral-900 border border-neutral-700 text-white font-mono text-sm px-3 py-2.5 outline-none focus:border-orange-500 font-bold"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-5 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors flex-shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>{isEn ? 'VERIFY' : 'VERIFICA'}</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Badges */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">
              {isEn ? 'Quick Test Codes (Click to resolve):' : 'Test Rapido Codici (Clicca per risolvere):'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickSamples.map((sample) => (
                <button
                  key={sample.code}
                  type="button"
                  onClick={() => {
                    setInputCode(sample.code);
                    handleSearch(undefined, sample.code);
                  }}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-orange-500 text-neutral-300 hover:text-white text-[10px] font-mono font-bold rounded transition-colors cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2 rounded">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Resolved Participant Card */}
          {resolvedResult && (
            <div className="p-4 bg-neutral-900 border-2 border-emerald-500 rounded space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-600 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {resolvedResult.category.toUpperCase()} {isEn ? 'IDENTIFIED' : 'IDENTIFICATO'}
                </span>
                <span className="text-sm font-mono text-orange-400 font-black">
                  {(resolvedResult.person as any).badgeCode || resolvedResult.person.id}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-white uppercase">{resolvedResult.person.name}</h4>
                <p className="text-xs text-orange-400 font-mono font-bold">
                  {(resolvedResult.person as any).role ||
                    (resolvedResult.person as any).title ||
                    (resolvedResult.person as any).specialty ||
                    (isEn ? 'Operator' : 'Operatore')}
                </p>
                {resolvedResult.team && (
                  <p className="text-xs text-neutral-300 font-mono">
                    {isEn ? 'Team:' : 'Squadra:'}{' '}
                    <span className="font-bold text-white">
                      {resolvedResult.team.name} ({isEn ? 'Tm.' : 'Sq.'} {resolvedResult.team.id})
                    </span>
                  </p>
                )}
                <p className="text-xs text-neutral-400 font-mono">
                  {isEn ? 'Organization:' : 'Ente:'} {(resolvedResult.person as any).organization || 'Tactical Emergency & Trauma Team'}
                </p>
              </div>

              {/* Action Buttons for Resolved Person */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={handleOpenPersonalPage}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs font-mono uppercase rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isEn ? 'Open Personal Dashboard' : 'Apri Scheda Personale'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs font-mono uppercase rounded border border-neutral-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-orange-400" />
                  <span>{isEn ? 'View Tactical QR Badge' : 'Visualizza QR Badge'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-[11px] font-mono text-neutral-400 text-center">
          {isEn
            ? '💡 Real-time synchronization active: QR codes always reflect latest registry edits.'
            : '💡 Sincronizzazione in tempo reale attiva: i QR riflettono sempre le modifiche anagrafiche più recenti.'}
        </div>
      </div>

      {/* Linked Detailed QR Modal */}
      {isQrModalOpen && resolvedResult && (
        <ParticipantQRModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          person={resolvedResult.person}
          category={resolvedResult.category}
        />
      )}
    </div>
  );
};
