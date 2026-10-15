import React from 'react';
import { useCourse } from '../../context/CourseContext';
import { GraduationCap, Unlock, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export const FreeAccessBanner: React.FC = () => {
  const { freeAccessEnabled, setIsAreaDiscentiModalOpen, language } = useCourse();

  if (!freeAccessEnabled) {
    return null;
  }

  const isEn = language === 'en';

  return (
    <aside
      role="banner"
      aria-label="Avviso Accesso Libero Discenti"
      id="free-access-banner"
      className="w-full bg-gradient-to-r from-cyan-950 via-neutral-900 to-blue-950 border-b-2 border-cyan-500 text-white shadow-xl sticky top-[49px] z-35 animate-fadeIn font-mono"
    >
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Side: Unlocked Badge and Core Message */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-center sm:text-left flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 text-black flex items-center justify-center font-black shadow-md ring-2 ring-cyan-400/50 animate-pulse">
              <Unlock className="w-4 h-4 stroke-[2.8]" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1 self-center sm:self-auto px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-widest flex-shrink-0">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>REGIA BYPASS</span>
            </span>

            <p className="text-xs sm:text-sm font-black tracking-wide text-cyan-100 uppercase truncate">
              {/* Exact required string requested by user */}
              Accesso Libero Attivato: Inserisci Nome e Cognome per proseguire
            </p>
          </div>
        </div>

        {/* Right Side: CTA Button to open Area Discenti Name/Surname search */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-center sm:justify-end">
          <button
            type="button"
            id="free-access-enter-btn"
            onClick={() => setIsAreaDiscentiModalOpen(true)}
            className="w-full sm:w-auto px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-black text-xs uppercase tracking-wider rounded-md shadow-lg border border-cyan-300 transition-all transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 group"
            title="Apri l'Area Discenti per inserire Nome e Cognome"
          >
            <GraduationCap className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
            <span>{isEn ? 'ENTER NAME & SURNAME' : 'INSERISCI NOME E COGNOME'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-black stroke-[3] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default FreeAccessBanner;
