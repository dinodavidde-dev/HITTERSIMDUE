import React from 'react';
import { useCourse } from '../context/CourseContext';
import { Globe, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'badge' | 'header' | 'button';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { language, setLanguage } = useCourse();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'it' : 'en');
  };

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center rounded-lg bg-slate-900/90 border border-slate-700/80 p-0.5 shadow-sm ${className}`}>
        <button
          onClick={() => setLanguage('it')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
            language === 'it'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Italiano"
        >
          <span className="text-sm leading-none">🇮🇹</span>
          <span>IT</span>
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
            language === 'en'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="English"
        >
          <span className="text-sm leading-none">🇬🇧</span>
          <span>EN</span>
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
            onClick={() => setLanguage('it')}
            className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 transition-all ${
              language === 'it'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇮🇹</span>
            <span>IT</span>
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 transition-all ${
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
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs font-bold text-slate-200 transition-all shadow-sm active:scale-95 ${className}`}
      title={language === 'en' ? 'Passa alla lingua Italiana (IT)' : 'Switch to English (EN)'}
    >
      <Globe className="w-3.5 h-3.5 text-cyan-400" />
      <span className="flex items-center gap-1">
        {language === 'en' ? (
          <>
            <span>🇬🇧</span>
            <span className="text-white font-mono">EN</span>
            <span className="text-slate-500 font-normal">/ IT</span>
          </>
        ) : (
          <>
            <span>🇮🇹</span>
            <span className="text-white font-mono">IT</span>
            <span className="text-slate-500 font-normal">/ EN</span>
          </>
        )}
      </span>
    </button>
  );
};
