import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  User,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { Discente, GroupType } from '../../types';

interface AreaDiscentiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GROUP_META: Record<GroupType, { name: string; range: string; squads: string }> = {
  A: { name: 'ALPHA', range: 'DISC-01 – DISC-18', squads: 'Squadre 1, 2, 3' },
  B: { name: 'BRAVO', range: 'DISC-19 – DISC-36', squads: 'Squadre 4, 5, 6' },
  C: { name: 'CHARLIE', range: 'DISC-37 – DISC-54', squads: 'Squadre 7, 8, 9' },
  D: { name: 'DELTA', range: 'DISC-55 – DISC-70', squads: 'Squadre 10, 11, 12' },
};

export const AreaDiscentiModal: React.FC<AreaDiscentiModalProps> = ({ isOpen, onClose }) => {
  const {
    discenti,
    faculty,
    language,
    setSelectedDiscenteId,
    setUserRole,
    setCurrentTab,
    navigateToView,
  } = useCourse();

  const isEn = language === 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscente, setSelectedDiscente] = useState<Discente | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'ALL' | GroupType>('ALL');

  // Helper to determine group from teamId
  const getDiscenteGroup = (teamId: number): GroupType => {
    if (teamId <= 3) return 'A';
    if (teamId <= 6) return 'B';
    if (teamId <= 9) return 'C';
    return 'D';
  };

  // Helper to check if Team Leader
  const isTeamLeader = (disc: Discente) => {
    return (
      disc.role?.toLowerCase().includes('leader') ||
      disc.id === `disc-${(disc.teamId - 1) * 5 + 1}` ||
      disc.badgeCode?.endsWith('01') ||
      disc.badgeCode?.endsWith('06') ||
      disc.badgeCode?.endsWith('11') ||
      disc.badgeCode?.endsWith('16') ||
      disc.badgeCode?.endsWith('21') ||
      disc.badgeCode?.endsWith('26') ||
      disc.badgeCode?.endsWith('31') ||
      disc.badgeCode?.endsWith('36') ||
      disc.badgeCode?.endsWith('41') ||
      disc.badgeCode?.endsWith('46') ||
      disc.badgeCode?.endsWith('51') ||
      disc.badgeCode?.endsWith('56')
    );
  };

  // Filtered list based on search and optional group filter
  const filteredDiscenti = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return discenti.filter((d) => {
      const grp = getDiscenteGroup(d.teamId);
      if (selectedGroupFilter !== 'ALL' && grp !== selectedGroupFilter) {
        return false;
      }
      if (!q) return true;

      const nameMatch = (d?.name || '').toLowerCase().includes(q);
      const codeMatch = (d?.badgeCode || '').toLowerCase().includes(q);
      const idMatch = (d?.id || '').toLowerCase().includes(q);
      const numMatch = q.replace(/[^0-9]/g, '');
      const teamMatch = numMatch ? String(d?.teamId || '') === numMatch : false;

      return nameMatch || codeMatch || idMatch || teamMatch;
    });
  }, [discenti, searchQuery, selectedGroupFilter]);

  if (!isOpen) return null;

  const handleSelectAndEnter = (disc: Discente) => {
    setSelectedDiscenteId(disc.id);
    setUserRole('discente');
    if (navigateToView) {
      navigateToView('discente', 'discente');
    } else {
      setCurrentTab('discente');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn font-mono">
      <div className="bg-neutral-950 border-2 border-cyan-500 rounded-xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 pointer-events-none" />

        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-start justify-between gap-3 bg-neutral-900/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-cyan-950 border border-cyan-500 text-cyan-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isEn ? 'LEARNER ACCESS PROTOCOL' : 'PROTOCOLLO ACCESSO DISCENTI'}</span>
              </span>
              <span className="text-neutral-400 text-xs font-mono">
                {isEn ? '70 Official Trainees (DISC-01 – DISC-70)' : '70 Allievi Ufficiali (DISC-01 – DISC-70)'}
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 pt-0.5">
              <GraduationCap className="w-6 h-6 text-cyan-400" />
              <span>{isEn ? 'LEARNER RESERVED AREA' : 'AREA RISERVATA DISCENTI'}</span>
            </h2>

            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
              {isEn
                ? 'Enter your Name and Surname to locate your trainee profile, assigned Squad, 1:1 Faculty Tutor, and personal schedule.'
                : 'Inserisci il tuo Nome e Cognome per individuare la tua matricola, la Squadra assegnata, il Tutor Faculty 1:1 e il cronoprogramma personalizzato.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer shrink-0"
            title={isEn ? 'Close' : 'Chiudi'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Campo di Ricerca Nome e Cognome */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                {isEn ? 'Enter Name and Surname / Trainee ID:' : 'Inserisci Nome e Cognome o Matricola:'}
              </span>
              <span className="text-[10px] text-neutral-400 font-normal">
                {isEn ? 'e.g. Marco Rossi or DISC-01' : 'es. Marco Rossi oppure DISC-01'}
              </span>
            </label>

            <div className="relative">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedDiscente(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (selectedDiscente) {
                      handleSelectAndEnter(selectedDiscente);
                    } else if (filteredDiscenti.length > 0) {
                      handleSelectAndEnter(filteredDiscenti[0]);
                    }
                  }
                }}
                placeholder={isEn ? 'Type Name and Surname (e.g. Mario Rossi)...' : 'Digita Nome e Cognome (es. Mario Rossi)...'}
                className="w-full bg-neutral-950 border-2 border-cyan-500/70 rounded-lg pl-9 pr-9 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 font-mono shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDiscente(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Macro-Group Filter Pills */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>{isEn ? 'Filter by Macro-Group:' : 'Filtro rapido per Macro-Gruppo:'}</span>
              <span className="text-[10px] text-neutral-500">{filteredDiscenti.length} {isEn ? 'students' : 'allievi'}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setSelectedGroupFilter('ALL')}
                className={`px-2.5 py-1 rounded border text-center font-bold uppercase transition-colors cursor-pointer ${
                  selectedGroupFilter === 'ALL'
                    ? 'bg-cyan-600 text-black border-cyan-400'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {isEn ? 'ALL (60)' : 'TUTTI (60)'}
              </button>
              {(['A', 'B', 'C', 'D'] as const).map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroupFilter(grp)}
                  className={`px-2 py-1 rounded border text-center font-bold uppercase transition-colors cursor-pointer ${
                    selectedGroupFilter === grp
                      ? 'bg-cyan-600 text-black border-cyan-400'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {grp} • {GROUP_META[grp].name}
                </button>
              ))}
            </div>
          </div>

          {/* Rapid Dropdown Selector for Complete Roster */}
          <div className="bg-neutral-900/80 border border-neutral-800 p-2.5 rounded-lg space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
              <span>{isEn ? 'Or select directly from the 60 Trainees list:' : 'Oppure seleziona direttamente dall\'elenco dei 60 Discenti:'}</span>
            </label>
            <select
              value={selectedDiscente?.id || ''}
              onChange={(e) => {
                const found = discenti.find((d) => d.id === e.target.value);
                if (found) {
                  setSelectedDiscente(found);
                  setSearchQuery(found.name);
                }
              }}
              className="w-full bg-neutral-950 border border-neutral-700 text-cyan-300 text-xs font-mono rounded px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="">{isEn ? '-- Select your Name and Surname --' : '-- Seleziona il tuo Nome e Cognome --'}</option>
              {(['A', 'B', 'C', 'D'] as const).map((grp) => {
                const groupStudents = discenti.filter((d) => getDiscenteGroup(d.teamId) === grp);
                return (
                  <optgroup key={grp} label={`GRUPPO ${grp} • ${GROUP_META[grp].name} (${GROUP_META[grp].range})`}>
                    {groupStudents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.badgeCode} • {d.name} (Sq. {d.teamId} - {isTeamLeader(d) ? 'Team Leader' : 'Operatore'})
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* Risultati della Ricerca Rapida */}
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
              {isEn ? 'Search Results / Click your card:' : 'Risultati Corrispondenti / Clicca sulla tua scheda:'}
            </span>

            {filteredDiscenti.length === 0 ? (
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded text-center space-y-1 text-xs">
                <p className="text-amber-400 font-bold">
                  {isEn ? `No learner found matching "${searchQuery}"` : `Nessun discente trovato per "${searchQuery}"`}
                </p>
                <p className="text-neutral-400 text-[11px]">
                  {isEn
                    ? 'Verify spelling, or choose your profile from the dropdown list above.'
                    : 'Verifica l\'ortografia oppure seleziona il tuo nominativo dal menu a tendina sopra.'}
                </p>
              </div>
            ) : (
              filteredDiscenti.slice(0, 8).map((disc) => {
                const grp = getDiscenteGroup(disc.teamId);
                const facMatch = faculty.find((f) => f.assignedTeamId === disc.teamId) || faculty[disc.teamId - 1];
                const isTl = isTeamLeader(disc);
                const isSelected = selectedDiscente?.id === disc.id;

                return (
                  <div
                    key={disc.id}
                    onClick={() => {
                      setSelectedDiscente(disc);
                      setSearchQuery(disc.name);
                    }}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-md ring-1 ring-cyan-400'
                        : 'bg-neutral-950 border-neutral-800 hover:border-cyan-600/70 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-cyan-600 text-black font-black text-xs rounded font-mono">
                          {disc.badgeCode || disc.id.toUpperCase()}
                        </span>
                        <strong className="text-white text-sm">{disc.name}</strong>
                        <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded border ${
                          isTl
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-700'
                        }`}>
                          {isTl ? 'Team Leader (TL)' : (isEn ? 'Operator' : 'Operatore')}
                        </span>
                      </div>

                      <div className="text-[11px] text-neutral-400 flex items-center gap-2 flex-wrap">
                        <span className="text-cyan-300 font-bold">{isEn ? `Group ${grp}` : `Gruppo ${grp}`} ({GROUP_META[grp].name})</span>
                        <span>•</span>
                        <span>{isEn ? `Team ${disc.teamId}` : `Squadra ${disc.teamId}`}</span>
                        <span>•</span>
                        <span>Tutor: <strong className="text-orange-400">{facMatch?.badgeCode || 'FAC'} ({facMatch?.name || 'Tutor'})</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAndEnter(disc);
                      }}
                      className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-black text-xs uppercase rounded flex items-center justify-center gap-1 cursor-pointer shrink-0 transition-colors shadow-sm"
                    >
                      <span>{isEn ? 'ENTER NOW' : 'ACCEDI ORA'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}

            {filteredDiscenti.length > 8 && (
              <p className="text-[10px] text-neutral-500 text-center italic pt-1">
                {isEn ? `...and ${filteredDiscenti.length - 8} more. Type specific surname to refine.` : `...e altri ${filteredDiscenti.length - 8} discenti. Digita il cognome per affinare la ricerca.`}
              </p>
            )}
          </div>

          {/* Dettaglio del Discente Selezionato */}
          {selectedDiscente && (
            <div className="p-3.5 sm:p-4 bg-cyan-950/40 border-2 border-cyan-400 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between gap-2 border-b border-cyan-800/60 pb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-white text-xs sm:text-sm uppercase">
                    {isEn ? 'PROFILE CONFIRMED • READY FOR ACCESS' : 'PROFILO CONFERMATO • PRONTO PER L\'ACCESSO'}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-cyan-500 text-black font-mono font-black text-xs rounded">
                  {selectedDiscente.badgeCode}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 uppercase block font-semibold">{isEn ? 'Learner Name' : 'Nome e Cognome'}</span>
                  <strong className="text-white text-xs sm:text-sm truncate block">{selectedDiscente.name}</strong>
                </div>
                <div className="bg-neutral-950 p-2 rounded border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 uppercase block font-semibold">{isEn ? 'Macro-Group' : 'Macro-Gruppo'}</span>
                  <strong className="text-cyan-300 text-xs sm:text-sm">
                    {getDiscenteGroup(selectedDiscente.teamId)} ({GROUP_META[getDiscenteGroup(selectedDiscente.teamId)].name})
                  </strong>
                </div>
                <div className="bg-neutral-950 p-2 rounded border border-neutral-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-neutral-400 uppercase block font-semibold">{isEn ? 'Squad & Role' : 'Squadra & Ruolo'}</span>
                  <strong className="text-white text-xs sm:text-sm">
                    Sq. {selectedDiscente.teamId} ({isTeamLeader(selectedDiscente) ? 'Team Leader' : 'Operatore'})
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectAndEnter(selectedDiscente)}
                className="w-full min-h-[46px] px-4 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 hover:from-cyan-400 hover:to-blue-400 text-black font-mono font-black text-sm uppercase tracking-wider rounded-lg shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-[1.01]"
              >
                <span>
                  {isEn
                    ? `ENTER RESERVED AREA • ${selectedDiscente.name.toUpperCase()}`
                    : `ACCEDI ALLA PROPRIA AREA RISERVATA • ${selectedDiscente.name.toUpperCase()}`}
                </span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-3 sm:p-4 border-t border-neutral-800 bg-neutral-900/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {isEn
                ? 'Direct access to individual anagrafica, QR Pass, and customized schedule.'
                : 'Accesso diretto all\'anagrafica individuale, Pass QR e cronoprogramma dedicato.'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white underline cursor-pointer self-end sm:self-auto"
          >
            {isEn ? 'Cancel' : 'Annulla'}
          </button>
        </div>
      </div>
    </div>
  );
};
