import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  CheckCircle2,
  FileText,
  Globe,
  Radio,
  ShieldCheck,
  Users,
  Lock,
} from 'lucide-react';
import { MasterAnagraficaManager } from '../anagrafica/MasterAnagraficaManager';
import { ScenariMasterListView } from './ScenariMasterListView';
import { RegiaVisualTimelineBoard } from '../regia/RegiaVisualTimelineBoard';
import { OperatorUnlockModal } from '../common/OperatorUnlockModal';

export const DirettoriView: React.FC = () => {
  const {
    language,
    activeDay,
    filteredSlots,
    activeSlotIndex,
    directors,
    selectedDirectorId,
    setSelectedDirectorId,
    suspensionInfo,
    setUserRole,
    setCurrentTab,
    canSelectOperator,
  } = useCourse();

  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const isEn = language === 'en';

  const currentDirector =
    directors.find((d) => d.id === selectedDirectorId) ||
    directors[0] || {
      id: 'dir-1',
      name: isEn ? 'Scientific Director' : 'Direttore Scientifico',
      title: isEn ? 'Scientific Director' : 'Direttore Scientifico',
      role: isEn ? 'Scientific Director' : 'Direttore Scientifico',
      nationality: isEn ? 'Italian' : 'Italiana',
      phone: '+39 000 000000',
      email: 'direzione@traumasim.it',
      organization: 'Trauma Center Academy',
      badgeCode: 'DIR-01',
      isMaster: true,
    };

  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'scenari' | 'anagrafica'>('scenari');
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);

  const copyPublicUrl = () => {
    const url = `${window.location.origin}${window.location.pathname}?view=public`;
    navigator.clipboard.writeText(url);
    setCopiedPublicLink(true);
    setTimeout(() => setCopiedPublicLink(false), 3000);
  };

  return (
    <div className="space-y-4 pb-12 px-2 sm:px-4 max-w-7xl mx-auto font-mono">
      {/* Director Top Header with Anagrafica & Controls */}
      <div className="bg-neutral-950 border-2 border-yellow-500/80 p-3 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 min-w-0 w-full md:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-yellow-500 text-black text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs rounded">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isEn ? 'DIRECTORS' : 'DIRETTORI'}
              </span>

              <span className="text-[11px] text-neutral-300 font-mono font-bold px-2.5 py-1 bg-neutral-900 border border-neutral-700">
                DAY 0{activeDay} • {isEn ? 'SLOT' : 'SLOT'} {activeSlotIndex + 1}/{filteredSlots.length}
              </span>
              {suspensionInfo.isSuspended ? (
                <span className="bg-red-600 text-white font-black text-[11px] px-2.5 py-1 animate-pulse flex items-center gap-1">
                  {isEn ? 'SUSPENDED' : 'SOSPESO'}
                </span>
              ) : (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-black px-2.5 py-1">
                  🟢 {isEn ? 'ACTIVE' : 'ATTIVO'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap pt-1">
              <span className="px-2.5 py-0.5 bg-yellow-950 text-yellow-300 border border-yellow-700/80 text-xs font-mono font-black">
                {currentDirector.badgeCode || 'DIR-01'}
              </span>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2 flex-wrap break-words">
                <span>{currentDirector.name}</span>
                {Boolean(currentDirector.isMaster) && (
                  <span className="px-2 py-0.5 bg-amber-500 text-black font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-sm">
                    ★ MASTER
                  </span>
                )}
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 pt-1 text-xs font-mono">
              <span className="text-yellow-200/90 font-medium">
                {isEn ? 'Role:' : 'Ruolo:'} <strong className="text-white">{currentDirector.role || currentDirector.title}</strong>
              </span>
              {currentDirector.organization && (
                <>
                  <span className="text-neutral-600 hidden sm:inline">•</span>
                  <span className="text-neutral-300">{isEn ? 'Organization:' : 'Ente:'} <strong className="text-white">{currentDirector.organization}</strong></span>
                </>
              )}
              {currentDirector.email && (
                <>
                  <span className="text-neutral-600 hidden sm:inline">•</span>
                  <span className="text-neutral-400">Email: <span className="text-yellow-300">{currentDirector.email}</span></span>
                </>
              )}
              <span className="text-neutral-600 hidden sm:inline">•</span>
              <span className="text-neutral-300">{isEn ? 'Phone:' : 'Tel:'} <span className="text-yellow-400 font-bold">{currentDirector.phone}</span></span>
            </div>

            {canSelectOperator && directors.length > 0 ? (
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <span className="text-[11px] font-mono text-yellow-400 uppercase font-bold">{isEn ? 'Director:' : 'Direttore:'}</span>
                <select
                  value={currentDirector.id}
                  onChange={(e) => setSelectedDirectorId(e.target.value)}
                  className="bg-neutral-950 text-white text-xs font-mono font-bold px-2.5 py-1.5 border border-yellow-600/60 outline-none cursor-pointer rounded max-w-full sm:max-w-xs"
                >
                  {directors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.badgeCode ? `[${d.badgeCode}] ` : ''}{d.name} ({d.role || d.title})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <span className="px-2.5 py-1 bg-neutral-950 text-yellow-300 font-mono text-xs border border-yellow-800/80 rounded flex items-center gap-1.5 shadow-inner">
                  <Lock className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-yellow-400/80">{isEn ? 'Director:' : 'Direttore:'}</span>
                  <strong className="text-white text-xs">{currentDirector.badgeCode ? `[${currentDirector.badgeCode}] ` : ''}{currentDirector.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(true)}
                  title={isEn ? 'Unlock Selector (Control / Direction)' : 'Sblocca Selettore (Regia / Direzione)'}
                  className="p-1.5 text-neutral-500 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <button
              onClick={() => {
                setUserRole('regia');
                setCurrentTab('regia');
              }}
              className="flex-1 md:flex-initial min-h-[40px] px-3 py-1.5 bg-pink-950 hover:bg-pink-900 text-pink-300 font-black text-xs uppercase tracking-wider border border-pink-600 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 text-pink-400" />
              <span>{isEn ? 'CONTROL ROOM' : 'REGIA'}</span>
            </button>

            <button
              onClick={copyPublicUrl}
              className="flex-1 md:flex-initial min-h-[40px] px-3 py-1.5 bg-orange-950 hover:bg-orange-900 text-orange-300 font-bold text-xs uppercase border border-orange-600 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              {copiedPublicLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Globe className="w-3.5 h-3.5 text-orange-400" />}
              <span>{copiedPublicLink ? (isEn ? 'Copied!' : 'Copiato!') : (isEn ? 'Public Link' : 'Link Pubblico')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Directors Navigation Menu */}
      <nav aria-label={isEn ? 'Directors Menu' : 'Menu Direttori'} className="bg-neutral-950 border border-neutral-800 p-1 sm:p-1.5 shadow-xl">
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'timeline'
                ? 'bg-yellow-500 text-black border-yellow-300 shadow-md font-black'
                : 'bg-neutral-900 text-yellow-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-yellow-500/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                TIMELINE
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('scenari')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'scenari'
                ? 'bg-yellow-500 text-black border-yellow-300 shadow-md font-black'
                : 'bg-neutral-900 text-yellow-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-yellow-500/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'MASTER SCENARIOS' : 'SCENARI MASTER'}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('anagrafica')}
            className={`min-h-[42px] p-2 text-left sm:text-center transition-all flex items-center sm:flex-col sm:justify-center gap-1.5 sm:gap-0.5 cursor-pointer border ${
              activeSubTab === 'anagrafica'
                ? 'bg-yellow-500 text-black border-yellow-300 shadow-md font-black'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-yellow-500/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-yellow-400" />
            <div className="min-w-0">
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider block truncate">
                {isEn ? 'DIRECTORS DIRECTORY' : 'ANAGRAFICA DIRETTORI'}
              </span>
            </div>
          </button>
        </div>
      </nav>

      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          <RegiaVisualTimelineBoard isMaster={false} />
        </div>
      )}

      {activeSubTab === 'scenari' && (
        <div className="space-y-6">
          <ScenariMasterListView />
        </div>
      )}

      {activeSubTab === 'anagrafica' && <MasterAnagraficaManager initialSection="direttori" />}

      {/* REGIA/DIREZIONE OPERATOR UNLOCK MODAL */}
      <OperatorUnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        roleLabel={isEn ? 'Director' : 'Direttore'}
      />
    </div>
  );
};
