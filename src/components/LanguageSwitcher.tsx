import React from 'react';
import { useCourse } from '../context/CourseContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'badge' | 'header' | 'button' | 'dashboard';
  className?: string;
  showLabel?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'compact',
  className = '',
  showLabel = true,
}) => {
  const { language, setLanguage, toggleLanguage } = useCourse();

  if (variant === 'dashboard') {
    return (
      <div
        className={`inline-flex items-center gap-1 bg-neutral-950/95 border-2 border-orange-500/80 rounded-lg p-1 shadow-lg ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <div className="flex items-center gap-1.5 px-2 py-0.5 text-neutral-400 font-mono text-[11px] font-bold">
          <Globe className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          {showLabel && <span className="hidden sm:inline uppercase tracking-wider text-[10px] text-neutral-300">LINGUA:</span>}
        </div>
        <div className="flex items-center bg-neutral-900 rounded p-0.5 border border-neutral-800">
          <button
            type="button"
            id="dashboard-lang-it"
            onClick={() => setLanguage('it')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-black transition-all cursor-pointer ${
              language === 'it'
                ? 'bg-red-600 text-white shadow-md ring-1 ring-red-400'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Passa alla lingua Italiana (IT)"
            aria-pressed={language === 'it'}
          >
            <span className="text-sm leading-none">🇮🇹</span>
            <span>IT</span>
          </button>
          <button
            type="button"
            id="dashboard-lang-en"
            onClick={() => setLanguage('en')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-black transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-red-600 text-white shadow-md ring-1 ring-red-400'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Switch to English (EN)"
            aria-pressed={language === 'en'}
          >
            <span className="text-sm leading-none">🇬🇧</span>
            <span>EN</span>
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center rounded-lg bg-neutral-950/90 border border-neutral-700/80 p-0.5 shadow-sm ${className}`}
        role="group"
        aria-label="Language selector"
      >
        <button
          type="button"
          id="badge-lang-it"
          onClick={() => setLanguage('it')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
            language === 'it'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-neutral-800/60'
          }`}
          title="Italiano"
          aria-pressed={language === 'it'}
        >
          <span className="text-sm leading-none">🇮🇹</span>
          <span className="font-mono">IT</span>
        </button>
        <button
          type="button"
          id="badge-lang-en"
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-neutral-800/60'
          }`}
          title="English"
          aria-pressed={language === 'en'}
        >
          <span className="text-sm leading-none">🇬🇧</span>
          <span className="font-mono">EN</span>
        </button>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-2 bg-slate-900/95 border border-slate-700/90 rounded-lg px-3 py-1.5 shadow-md ${className}`}>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline uppercase tracking-wider font-semibold">LANG:</span>
        </div>
        <div className="flex items-center bg-slate-950 rounded p-0.5 border border-slate-800">
          <button
            type="button"
            onClick={() => setLanguage('it')}
            className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              language === 'it'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇮🇹</span>
            <span>IT</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇬🇧</span>
            <span>EN</span>
          </button>
        </div>
      </div>
    );
  }

  // Default compact button
  return (
    <button
      type="button"
      id="compact-lang-toggle"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-xs font-bold text-neutral-200 transition-all shadow-sm active:scale-95 cursor-pointer ${className}`}
      title={language === 'en' ? 'Passa alla lingua Italiana (IT)' : 'Switch to English (EN)'}
    >
      <Globe className="w-3.5 h-3.5 text-orange-400" />
      <span className="flex items-center gap-1">
        {language === 'en' ? (
          <>
            <span>🇬🇧</span>
            <span className="text-white font-mono">EN</span>
            <span className="text-neutral-500 font-normal">/ IT</span>
          </>
        ) : (
          <>
            <span>🇮🇹</span>
            <span className="text-white font-mono">IT</span>
            <span className="text-neutral-500 font-normal">/ EN</span>
          </>
        )}
      </span>
    </button>
  );
};
