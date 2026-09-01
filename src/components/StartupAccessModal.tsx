import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Users, Lock, Unlock, ArrowRight, AlertTriangle, Activity, CheckCircle2, Globe, Crown, UserCheck, Radio } from 'lucide-react';
import { useCourse } from '../context/CourseContext';
import { Director, RegiaStaff } from '../types';

interface StartupAccessModalProps {
  isOpen: boolean;
  onSelectPublic: () => void;
  onSelectDirector: (directorId: string) => void;
  onSelectMaster: () => void;
  onSelectRegia: (regiaId: string) => void;
  directors: Director[];
  regiaStaff: RegiaStaff[];
  initialMode?: 'choice' | 'master_or_regia_select';
}

export const StartupAccessModal: React.FC<StartupAccessModalProps> = ({
  isOpen,
  onSelectPublic,
  onSelectDirector,
  onSelectMaster,
  onSelectRegia,
  directors,
  regiaStaff,
  initialMode = 'choice',
}) => {
  const { language, setLanguage } = useCourse();
  const isEn = language === 'en';

  const [mode, setMode] = useState<'choice' | 'director_auth' | 'director_select' | 'master_or_regia_select'>(initialMode);
  const [code118, setCode118] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleDirectorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanCode = code118.trim();

    if (cleanCode === '118') {
      setSuccessMsg(
        isEn
          ? 'Code 118 verified. Please select the Director profile to execute:'
          : 'Codice 118 verificato. Seleziona il profilo Direttore da eseguire:'
      );
      setTimeout(() => {
        setMode('director_select');
        setSuccessMsg('');
        setCode118('');
      }, 500);
    } else if (cleanCode === '9438') {
      setSuccessMsg(
        isEn
          ? 'Access Code 9438 Verified. Select profile (Master or Regia):'
          : 'Codice Accesso 9438 Verificato. Scegli il profilo (Master o Regia):'
      );
      setTimeout(() => {
        setMode('master_or_regia_select');
        setSuccessMsg('');
        setCode118('');
      }, 500);
    } else {
      setErrorMsg(
        isEn
          ? 'Invalid Access Code. Please enter a valid authorized staff code.'
          : 'Codice non valido. Inserire un codice di accesso staff valido.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border-2 border-orange-500/80 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-neutral-100 max-h-[90vh] flex flex-col">
        
        {/* Header with Language Switcher */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center text-orange-400 font-bold shadow-inner">
              <Activity className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-600 text-white font-mono text-[10px] uppercase font-black tracking-wider">
                  {isEn ? 'SECURE GATEWAY' : 'ACCESSO PROTETTO'}
                </span>
                <span className="text-neutral-400 font-mono text-xs">TRAUMA SIMULATOR</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1">
                {mode === 'director_select'
                  ? (isEn ? 'Select Director Profile' : 'Seleziona Profilo Direttore')
                  : mode === 'master_or_regia_select'
                  ? (isEn ? 'Choose Master or Regia Access' : 'Scegli Accesso Master o Regia')
                  : (isEn ? 'Select Access Area' : 'Seleziona Area di Accesso')}
              </h2>
            </div>
          </div>

          {/* Language Switcher Button */}
          <button
            type="button"
            onClick={() => setLanguage(isEn ? 'it' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-orange-400 border border-neutral-700 hover:border-orange-500 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            title={isEn ? 'Passa a Italiano' : 'Switch to English'}
          >
            <Globe className="w-4 h-4" />
            <span>{isEn ? 'IT' : 'EN'}</span>
          </button>
        </div>

        {mode === 'choice' ? (
          <div className="space-y-4">
            <p className="text-sm text-neutral-300">
              {isEn
                ? 'Welcome to the H.I.T.T.E.R. Portal. Please choose your access area below:'
                : 'Benvenuto nel Portale H.I.T.T.E.R. Seleziona l\'area di accesso desiderata:'}
            </p>

            <div className="grid grid-cols-1 gap-4 pt-2">
              {/* Public Area Button */}
              <button
                type="button"
                onClick={onSelectPublic}
                className="w-full text-left p-4 bg-neutral-950 hover:bg-neutral-800 border-2 border-neutral-700 hover:border-orange-500 transition-all cursor-pointer group flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-neutral-800 border border-neutral-600 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase text-white group-hover:text-orange-400 transition-colors">
                      {isEn ? 'Public / Participant Area' : 'Area Pubblica / Partecipante'}
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      {isEn ? 'View schedule, teams, clinical timelines & shared updates' : 'Visualizza programma, squadre, timeline clinica e aggiornamenti'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Staff / Professionals (Addetti ai Lavori) Area Button */}
              <button
                type="button"
                onClick={() => {
                  setMode('director_auth');
                  setErrorMsg('');
                  setCode118('');
                }}
                className="w-full text-left p-4 bg-neutral-950 hover:bg-neutral-800 border-2 border-neutral-700 hover:border-red-500 transition-all cursor-pointer group flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-red-950/60 border border-red-500 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase text-white group-hover:text-red-400 transition-colors">
                      {isEn ? 'Staff & Professionals Area' : 'Area Addetti ai Lavori'}
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      {isEn ? 'Authorized staff and director login gateway' : 'Accesso riservato a staff e direttori di corso'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        ) : mode === 'director_auth' ? (
          <form onSubmit={handleDirectorSubmit} className="space-y-4">
            <div className="p-3 bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span>
                {isEn
                  ? 'Enter your secure staff access code (e.g. 118 or 9438) to proceed.'
                  : 'Inserisci il codice di accesso sicuro dello staff (es. 118 o 9438) per procedere.'}
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/80 border border-red-500 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-neutral-300 mb-1.5">
                {isEn ? 'Access Code' : 'Codice di Accesso'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  autoFocus
                  required
                  maxLength={10}
                  value={code118}
                  onChange={(e) => setCode118(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-neutral-950 border-2 border-neutral-700 text-base font-mono text-white tracking-widest focus:outline-hidden focus:border-red-500 text-center"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setMode('choice')}
                className="px-4 py-2 text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer"
              >
                {isEn ? '← Back' : '← Indietro'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white border-2 border-red-500 hover:border-red-400 cursor-pointer flex items-center gap-2 shadow-md"
              >
                <span>{isEn ? 'Verify Code' : 'Verifica Codice'}</span>
                <Unlock className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : mode === 'master_or_regia_select' ? (
          <div className="space-y-4 flex-1 overflow-y-auto">
            <div className="p-3 bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                {isEn
                  ? 'Access Code 9438 verified. Select your specific access profile (Master, Director, or Regia):'
                  : 'Codice 9438 verificato. Seleziona il profilo di accesso specifico (Master, Direttore o Regia):'}
              </span>
            </div>

            <div className="space-y-4">
              {/* 1. Master Director */}
              <div>
                <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider mb-2 block">
                  {isEn ? 'Director Master' : 'Direttore Master'}
                </span>
                <button
                  type="button"
                  onClick={onSelectMaster}
                  className="w-full text-left p-3.5 bg-amber-950/30 hover:bg-amber-950/50 border-2 border-amber-500 hover:border-amber-400 transition-all cursor-pointer group flex items-center justify-between shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 text-black flex items-center justify-center font-bold shadow-sm">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black uppercase text-white group-hover:text-amber-300">
                          {isEn ? 'Master Director Control' : 'Controllo Direttore Master'}
                        </h3>
                        <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-black uppercase">
                          FULL
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-mono">
                        {isEn ? 'Full course management & gate control' : 'Gestione completa corso e gate'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </button>
              </div>

              {/* 2. Regia Staff Profiles */}
              <div>
                <span className="text-[11px] uppercase font-bold text-pink-400 tracking-wider mb-2 block">
                  {isEn ? 'Regia & Mission Control Profiles (Anagrafica)' : 'Profili Regia & Mission Control (da Anagrafica)'}
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {regiaStaff.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onSelectRegia(r.id)}
                      className="w-full text-left p-3 bg-pink-950/30 hover:bg-pink-950/60 border border-pink-700/80 hover:border-pink-500 transition-all cursor-pointer group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-pink-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-pink-300">{r.name}</span>
                            {r.isMaster && (
                              <span className="px-1.5 py-0.5 bg-pink-500 text-black text-[8px] font-black uppercase">
                                MASTER REGIA
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-pink-300 font-mono">{r.role} • {r.department}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-pink-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Other Directors */}
              <div>
                <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider mb-2 block">
                  {isEn ? 'Other Course Directors' : 'Altri Direttori di Corso'}
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {directors.filter(d => !d.isMaster).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => onSelectDirector(d.id)}
                      className="w-full text-left p-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-xs">
                          {d.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{d.name}</div>
                          <span className="text-[11px] text-neutral-400 font-mono">{d.role || d.specialty || 'Direttore'}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setMode('director_auth')}
                className="px-4 py-2 text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer"
              >
                {isEn ? '← Back' : '← Indietro'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto">
            <div className="p-3 bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                {isEn
                  ? 'Select the specific Director profile to execute:'
                  : 'Seleziona lo specifico profilo Direttore da eseguire:'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {directors.filter(dir => !dir.isMaster).map((dir) => (
                <button
                  key={dir.id}
                  onClick={() => onSelectDirector(dir.id)}
                  className={`w-full text-left p-3.5 border-2 transition-all cursor-pointer flex items-center justify-between ${
                    dir.isMaster
                      ? 'bg-amber-950/40 border-amber-500 hover:border-amber-400'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded flex items-center justify-center font-bold text-xs ${
                      dir.isMaster ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-300'
                    }`}>
                      {dir.isMaster ? <Crown className="w-5 h-5" /> : dir.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm">{dir.name}</span>
                        {dir.isMaster && (
                          <span className="bg-amber-500 text-black font-black text-[9px] px-1.5 py-0.5 uppercase tracking-wider">
                            MASTER
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 font-mono">{dir.role || dir.specialty || 'Direttore Corso'}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-500" />
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setMode('director_auth')}
                className="px-4 py-2 text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer"
              >
                {isEn ? '← Back' : '← Indietro'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
