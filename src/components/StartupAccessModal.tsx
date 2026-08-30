import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Users, Lock, Unlock, ArrowRight, AlertTriangle, Activity, CheckCircle2, Globe, Crown, UserCheck } from 'lucide-react';
import { useCourse } from '../context/CourseContext';
import { Director } from '../types';

interface StartupAccessModalProps {
  isOpen: boolean;
  onSelectPublic: () => void;
  onSelectDirector: (directorId: string) => void;
  onSelectMaster: () => void;
  directors: Director[];
}

export const StartupAccessModal: React.FC<StartupAccessModalProps> = ({
  isOpen,
  onSelectPublic,
  onSelectDirector,
  onSelectMaster,
  directors,
}) => {
  const { language, setLanguage } = useCourse();
  const isEn = language === 'en';

  const [mode, setMode] = useState<'choice' | 'director_auth' | 'director_select'>('choice');
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
          ? 'Master Access Granted (Code 9438). Opening Master View...'
          : 'Accesso Master Consentito (Codice 9438). Apertura Visuale Master...'
      );
      setTimeout(() => {
        onSelectMaster();
      }, 800);
    } else {
      setErrorMsg(
        isEn
          ? 'Invalid Code. Please enter 118 (Director selection) or 9438 (Master access).'
          : 'Codice non valido. Inserire 118 (selezione direttore) o 9438 (accesso master).'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border-2 border-orange-500/80 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-neutral-100 max-h-[90vh] flex flex-col">
        
        {/* Header Header with Language Switcher */}
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
                      {isEn ? 'Use code 118 (Director selection) or 9438 (Master view)' : 'Usa codice 118 (Scelta direttori) o 9438 (Visuale Master)'}
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
                  ? 'Enter code 118 for Director selection or 9438 for Master direct login.'
                  : 'Inserisci il codice 118 per scegliere il Direttore o 9438 per accesso diretto Master.'}
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
                {isEn ? 'Access Code (118 or 9438)' : 'Codice di Accesso '}
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
              {directors.map((dir) => (
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
