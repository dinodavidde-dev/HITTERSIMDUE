import React, { useState } from 'react';
import { User, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { resolveParticipantByQuery } from '../../utils/qrCodeUtils';

export const QuickParticipantBar: React.FC = () => {
  const {
    discenti,
    faculty,
    technicians,
    directors,
    regiaStaff,
    guests,
    teams,
    makeupArtists,
    actors,
    setCurrentTab,
    setUserRole,
    setSelectedDiscenteId,
    setSelectedFacultyId,
    setSelectedTechnicianId,
    setSelectedDirectorId,
    setSelectedRegiaId,
    setSelectedGuestId,
    setActiveFacultyTeamId,
    language,
  } = useCourse();

  const isEn = language === 'en';
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim();
    if (!clean) return;

    // Expand pure numbers to DISC-xx
    let query = clean;
    if (/^\d{1,2}$/.test(clean)) {
      query = `DISC-${clean.padStart(2, '0')}`;
    }

    const resolved = resolveParticipantByQuery(query, {
      discenti,
      faculty,
      technicians,
      directors,
      regiaStaff,
      guests,
      teams,
      makeupArtists,
      actors,
    });

    if (resolved) {
      setError(false);
      const { person, category, team } = resolved;
      if (category === 'discenti') {
        setSelectedDiscenteId(person.id);
        setCurrentTab('discente');
        setUserRole('discente');
      } else if (category === 'faculty') {
        setSelectedFacultyId(person.id);
        if (team?.id || (person as any).assignedTeamId) {
          setActiveFacultyTeamId(team?.id || (person as any).assignedTeamId);
        }
        setCurrentTab('faculty');
        setUserRole('faculty');
      } else if (category === 'tecnici') {
        setSelectedTechnicianId(person.id);
        setCurrentTab('tecnici');
        setUserRole('tecnico');
      } else if (category === 'direttori') {
        setSelectedDirectorId(person.id);
        setCurrentTab('direttori');
        setUserRole('direttore');
      } else if (category === 'regia') {
        setSelectedRegiaId(person.id);
        setCurrentTab('regia');
        setUserRole('regia');
      } else if (category === 'ospiti') {
        setSelectedGuestId(person.id);
        setCurrentTab('public');
        setUserRole('ospite');
      }
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-700/80 rounded-xl p-3 sm:p-4 my-2 shadow-lg backdrop-blur-sm font-mono max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <span className="text-[11px] sm:text-xs font-bold text-neutral-300 uppercase flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isEn ? 'DIRECT ACCESS BY BADGE CODE' : 'ACCESSO DIRETTO PARTECIPANTI // INSERISCI MATRICOLA'}</span>
        </span>
        <span className="text-[10px] text-neutral-500">
          {isEn ? 'E.g. DISC-01, FAC-01, TECH-01 or just 05' : 'Es. DISC-05, FAC-01, TECH-01 o solo 05'}
        </span>
      </div>

      <form onSubmit={handleJump} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            placeholder={isEn ? 'Type badge (e.g. DISC-05 or 05)...' : 'Digita matricola (es. DISC-05 o solo 05)...'}
            className={`w-full bg-neutral-950 border text-xs sm:text-sm font-mono font-bold px-3 py-2 rounded-lg text-white uppercase placeholder:text-neutral-600 focus:outline-none transition-colors ${
              error ? 'border-red-500 focus:border-red-400' : 'border-neutral-700 focus:border-cyan-400'
            }`}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
        >
          <span>{isEn ? 'OPEN' : 'APRI SCHEDA'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {error && (
        <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{isEn ? 'Participant code not found. Check your badge (e.g. DISC-01 – DISC-60).' : 'Matricola non trovata. Controlla il badge (es. DISC-01 – DISC-60, FAC-01 – FAC-12).'}</span>
        </p>
      )}
    </div>
  );
};
