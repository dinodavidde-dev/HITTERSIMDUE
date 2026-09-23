import React, { useState, useMemo } from 'react';
import {
  Radio,
  Clock,
  Volume2,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Copy,
  Check,
  Headphones,
  FileText,
} from 'lucide-react';
import { TimelineSlot, CourseDay } from '../../types';
import { useCourse } from '../../context/CourseContext';
import {
  TIMELINE_REGIA_RADIO_SCRIPTS,
  TimelineRegiaRadioScript,
} from '../../data/timelineRegiaRadioScripts';

interface RegiaRadioCoordinationPanelProps {
  currentSlot: TimelineSlot;
  activeDay: CourseDay;
  onJumpToSlot?: (slotId: string) => void;
  /** @deprecated Dispatch transmission removed - keeping prop for backward compatibility */
  onSendRadioAlert?: (msg: string) => void;
  isMaster?: boolean;
}

export const RegiaRadioCoordinationPanel: React.FC<RegiaRadioCoordinationPanelProps> = ({
  currentSlot,
  activeDay,
  onJumpToSlot,
}) => {
  const { language } = useCourse();
  const isEn = language === 'en';

  // State
  const [selectedChannel, setSelectedChannel] = useState<'ALL' | 'CH1' | 'CH2' | 'CH3' | 'CH_ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'current' | 'all_ordered'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedScriptCode, setExpandedScriptCode] = useState<string | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter scripts for active day
  const dayScripts = useMemo(() => {
    return TIMELINE_REGIA_RADIO_SCRIPTS.filter((s) => s.day === activeDay);
  }, [activeDay]);

  // Current scripts matching currentSlot.id, or the first script of current slot
  const currentSlotScripts = useMemo(() => {
    const matching = dayScripts.filter((s) => s.slotId === currentSlot.id);
    if (matching.length > 0) return matching;

    // Fallback: match by title or closest
    return dayScripts.slice(0, 1);
  }, [dayScripts, currentSlot.id]);

  // Filtered list for "All Ordered Suggestions"
  const filteredOrderedScripts = useMemo(() => {
    return dayScripts.filter((s) => {
      const matchChannel = selectedChannel === 'ALL' || s.channel === selectedChannel;
      const matchSearch =
        !searchQuery ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phaseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.scriptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.checkpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.recipient.toLowerCase().includes(searchQuery.toLowerCase());
      return matchChannel && matchSearch;
    });
  }, [dayScripts, selectedChannel, searchQuery]);

  // Handle copy suggested radio callout text to clipboard
  const handleCopyScript = (script: TimelineRegiaRadioScript) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(script.scriptText);
      setCopiedCode(script.code);
      setTimeout(() => {
        setCopiedCode((prev) => (prev === script.code ? null : prev));
      }, 2000);
    }
  };

  const getChannelBadge = (ch: TimelineRegiaRadioScript['channel']) => {
    switch (ch) {
      case 'CH1':
        return {
          bg: 'bg-blue-950 text-blue-300 border-blue-600',
          dot: 'bg-blue-400',
          label: 'CH1 • FACULTY',
        };
      case 'CH2':
        return {
          bg: 'bg-red-950 text-red-300 border-red-600',
          dot: 'bg-red-400',
          label: 'CH2 • SHOCK ROOM',
        };
      case 'CH3':
        return {
          bg: 'bg-purple-950 text-purple-300 border-purple-600',
          dot: 'bg-purple-400',
          label: 'CH3 • TECNICI',
        };
      case 'CH_ALL':
      default:
        return {
          bg: 'bg-amber-950 text-amber-300 border-amber-500',
          dot: 'bg-amber-400',
          label: 'CH ALL • BROADCAST',
        };
    }
  };

  return (
    <div className="bg-neutral-950 border-2 border-yellow-500/90 rounded-none shadow-2xl overflow-hidden font-sans">
      {/* HEADER DELLA GUIDA AI SUGGERIMENTI RADIO FASE PER FASE */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-black p-3.5 border-b border-yellow-500/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-yellow-500 text-black font-black">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                {isEn ? 'PHASE-BY-PHASE RADIO SUGGESTIONS • CALLOUT GUIDE' : 'SUGGERIMENTI RADIO FASE PER FASE • GUIDA CALLOUT'}
              </span>
              <span className="px-2 py-0.2 bg-neutral-800 text-neutral-300 font-mono text-[10px] font-bold border border-neutral-700">
                DAY 0{activeDay} ({dayScripts.length} {isEn ? 'SUGGESTIONS' : 'SUGGERIMENTI'})
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400">
              {isEn
                ? 'Operational radio callout suggestions and speaking prompts phase by phase (CH1 Faculty, CH2 Shock Room, CH3 Technicians, CH ALL)'
                : 'Suggerimenti operativi e formulazioni verbali fase per fase per comunicazioni radio (CH1 Faculty, CH2 Shock Room, CH3 Tecnici, CH ALL)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Switch Tab Suggerimenti Fase Attiva vs Tutti i Suggerimenti */}
          <div className="flex items-center bg-neutral-900 p-0.5 border border-neutral-700">
            <button
              type="button"
              onClick={() => setActiveTab('current')}
              className={`px-3 py-1 text-xs font-mono font-black uppercase cursor-pointer transition-colors ${
                activeTab === 'current'
                  ? 'bg-yellow-500 text-black shadow'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              ★ {isEn ? 'Active Phase Radio Suggestions' : 'Suggerimenti Radio Fase Attiva'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all_ordered')}
              className={`px-3 py-1 text-xs font-mono font-black uppercase cursor-pointer transition-colors ${
                activeTab === 'all_ordered'
                  ? 'bg-yellow-500 text-black shadow'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              {isEn ? `All Phase Suggestions (${dayScripts.length})` : `Tutti i Suggerimenti per Fase (${dayScripts.length})`}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer"
            title={isPanelCollapsed ? (isEn ? 'Expand panel' : 'Espandi riquadro') : (isEn ? 'Collapse panel' : 'Comprimi riquadro')}
          >
            {isPanelCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isPanelCollapsed && (
        <div className="p-3 sm:p-4 space-y-4">
          {/* ========================================================================= */}
          {/* TAB 1: SUGGERIMENTI RADIO DELLA FASE ATTIVA (IN TEMPO REALE) */}
          {/* ========================================================================= */}
          {activeTab === 'current' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono pb-1 border-b border-neutral-800">
                <span className="text-yellow-400 font-bold uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  {isEn ? 'Synchronized with Active Phase:' : 'Sincronizzato con la Fase Attiva:'} {currentSlot.title} ({currentSlot.timeRange})
                </span>
                <span className="text-neutral-400">
                  {currentSlotScripts.length} {isEn ? 'radio suggestions for this block' : 'suggerimenti radio per questo blocco'}
                </span>
              </div>

              {currentSlotScripts.map((script) => {
                const chBadge = getChannelBadge(script.channel);
                const isCopied = copiedCode === script.code;

                return (
                  <div
                    key={script.code}
                    className={`p-4 border-2 transition-all relative ${
                      script.priority === 'emergency'
                        ? 'bg-neutral-950 border-red-500/80 shadow-red-950/40'
                        : script.priority === 'warning'
                        ? 'bg-neutral-950 border-amber-500/80'
                        : 'bg-neutral-950 border-yellow-500/60'
                    }`}
                  >
                    {/* Top Bar of Active Script Card */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-yellow-500 text-black font-black font-mono text-xs">
                          {script.code} • {isEn ? 'PHASE SUGGESTION' : 'SUGGERIMENTO FASE'} #{script.order}
                        </span>
                        <span className={`px-2 py-0.5 border text-xs font-mono font-black flex items-center gap-1.5 ${chBadge.bg}`}>
                          <span className={`w-2 h-2 rounded-full ${chBadge.dot}`} />
                          {script.channelLabel}
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-yellow-400" />
                          {script.checkpoint}
                        </span>
                      </div>

                      {/* Channel Indicator Badge */}
                      <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono text-xs font-bold flex items-center gap-1.5">
                        <Headphones className="w-3.5 h-3.5 text-yellow-400" />
                        {isEn ? 'RADIO CHANNEL:' : 'CANALE RADIO:'} <strong className="text-yellow-300">{script.channel}</strong>
                      </span>
                    </div>

                    {/* Content Section: Phase title, Recipient, Verbatim Script Text */}
                    <div className="pt-3 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
                        <span className="text-neutral-400">
                          {isEn ? 'Suggested Recipient:' : 'Destinatario Suggerito:'} <strong className="text-white">{script.recipient}</strong>
                        </span>
                        <span className="text-neutral-400">
                          {isEn ? 'Phase / Trigger:' : 'Fase / Trigger:'} <strong className="text-yellow-300">{script.phaseTitle}</strong>
                        </span>
                      </div>

                      {/* Verbatim Radio Script Callout Box */}
                      <div className="p-3.5 bg-black border border-yellow-500/40 rounded-none relative">
                        <div className="text-[10px] font-mono text-yellow-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
                            {isEn ? 'SUGGESTED RADIO CALLOUT TEXT (TO BE SPOKEN ON RADIO):' : 'TESTO SUGGERITO PER LA CHIAMATA RADIO (DA PRONUNCIARE AL MICROFONO):'}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-mono">{isEn ? 'CHANNEL:' : 'CANALE:'} {script.channel}</span>
                        </div>
                        <p className="text-sm sm:text-base font-mono font-bold text-white leading-relaxed select-all">
                          "{script.scriptText}"
                        </p>
                      </div>

                      {/* Operational Notes & Action Required */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 bg-neutral-900/90 border border-neutral-800 space-y-0.5">
                          <span className="text-[10px] text-neutral-400 uppercase font-bold block flex items-center gap-1">
                            <FileText className="w-3 h-3 text-yellow-400" />
                            {isEn ? 'Operational Notes & Mandatory Constraints:' : 'Note Operative & Vincoli Tassativi:'}
                          </span>
                          <p className="text-neutral-300 text-[11px]">{script.operationalNotes}</p>
                        </div>
                        <div className="p-2.5 bg-neutral-900/90 border border-neutral-800 space-y-0.5">
                          <span className="text-[10px] text-neutral-400 uppercase font-bold block flex items-center gap-1">
                            <Clock className="w-3 h-3 text-yellow-400" />
                            {isEn ? 'Immediate Action Required:' : 'Azione Immediata Richiesta:'}
                          </span>
                          <p className="text-neutral-300 text-[11px]">{script.actionRequired}</p>
                        </div>
                      </div>

                      {/* Quick Copy Action */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] font-mono text-neutral-500">
                          {isEn ? 'Use this suggested wording as an operational script for radio communications.' : 'Utilizza questa formulazione come traccia verbale per le comunicazioni radio di fase.'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyScript(script)}
                            className={`px-3.5 py-1.5 font-mono font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition-all border ${
                              isCopied
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200 hover:text-white'
                            }`}
                            title={isEn ? 'Copy callout text to clipboard' : 'Copia testo negli appunti'}
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                            <span>{isCopied ? (isEn ? 'Copied' : 'Copiato') : (isEn ? 'Copy Prompt' : 'Copia Testo')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TUTTI I SUGGERIMENTI RADIO ORDINATI PER FASE */}
          {/* ========================================================================= */}
          {activeTab === 'all_ordered' && (
            <div className="space-y-3">
              {/* Channel Filter Toolbar & Search */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                {/* Channel Filter Pills */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase mr-1">{isEn ? 'Channel Filter:' : 'Filtro Canale:'}</span>
                  {(['ALL', 'CH1', 'CH2', 'CH3', 'CH_ALL'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setSelectedChannel(ch)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold border cursor-pointer transition-colors ${
                        selectedChannel === ch
                          ? 'bg-yellow-500 text-black border-yellow-300 font-black'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                      }`}
                    >
                      {ch === 'ALL'
                        ? (isEn ? `All (${dayScripts.length})` : `Tutti (${dayScripts.length})`)
                        : ch === 'CH1'
                        ? 'CH1 • Faculty'
                        : ch === 'CH2'
                        ? 'CH2 • Shock Room'
                        : ch === 'CH3'
                        ? (isEn ? 'CH3 • Technicians' : 'CH3 • Tecnici')
                        : 'CH ALL • Broadcast'}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isEn ? 'Search prompt, time, keyword...' : 'Cerca suggerimento, orario, keyword...'}
                    className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs font-mono pl-8 pr-2 py-1.5 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* Sequential Ordered List Table / Cards */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900">
                {filteredOrderedScripts.map((script) => {
                  const chBadge = getChannelBadge(script.channel);
                  const isCurrentSlotScript = script.slotId === currentSlot.id;
                  const isExpanded = expandedScriptCode === script.code;
                  const isCopied = copiedCode === script.code;

                  return (
                    <div
                      key={script.code}
                      className={`border transition-all ${
                        isCurrentSlotScript
                          ? 'bg-neutral-900/90 border-yellow-400 ring-1 ring-yellow-400/40'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {/* Accordion Row Header */}
                      <div className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-neutral-800 text-yellow-400 font-black font-mono text-xs border border-neutral-700">
                            #{script.order} • {script.code}
                          </span>

                          <span className={`px-2 py-0.5 border text-[11px] font-mono font-black flex items-center gap-1 ${chBadge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${chBadge.dot}`} />
                            {script.channel}
                          </span>

                          <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            {script.checkpoint}
                          </span>

                          {isCurrentSlotScript && (
                            <span className="px-1.5 py-0.5 bg-yellow-500 text-black font-mono font-black text-[10px] animate-pulse">
                              {isEn ? '★ ACTIVE PHASE' : '★ FASE ATTIVA'}
                            </span>
                          )}
                        </div>

                        {/* Right Action Controls */}
                        <div className="flex items-center gap-2 justify-end">
                          {/* Jump to phase button */}
                          {onJumpToSlot && (
                            <button
                              type="button"
                              onClick={() => onJumpToSlot(script.slotId)}
                              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-yellow-400 text-[10px] font-mono font-bold border border-neutral-700 flex items-center gap-1 cursor-pointer transition-colors"
                              title={isEn ? 'Synchronize Control timeline to this phase' : 'Sincronizza timeline della Regia a questa fase'}
                            >
                              <span>{isEn ? 'Sync Phase' : 'Sincronizza Fase'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {/* Quick Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyScript(script)}
                            className={`px-2.5 py-1 font-mono text-[11px] border flex items-center gap-1 cursor-pointer transition-colors ${
                              isCopied
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                            }`}
                            title={isEn ? 'Copy suggested prompt' : 'Copia suggerimento'}
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-neutral-400" />}
                            <span>{isCopied ? (isEn ? 'Copied' : 'Copiato') : (isEn ? 'Copy' : 'Copia')}</span>
                          </button>

                          {/* Expand/Collapse details */}
                          <button
                            type="button"
                            onClick={() => setExpandedScriptCode(isExpanded ? null : script.code)}
                            className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer"
                            title={isExpanded ? (isEn ? 'Collapse full details' : 'Comprimi dettagli') : (isEn ? 'Expand full details' : 'Espandi dettagli')}
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Script Preview line (always visible) */}
                      <div className="px-3 pb-2.5">
                        <p className="text-xs font-mono text-neutral-300 line-clamp-1 italic">
                          "{script.scriptText}"
                        </p>
                      </div>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <div className="p-3.5 bg-black border-t border-neutral-800 space-y-3">
                          <div className="text-xs font-mono space-y-1">
                            <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                              {isEn ? 'Suggested Recipient:' : 'Destinatario Suggerito:'} <strong className="text-white">{script.recipient}</strong> | {isEn ? 'Phase / Trigger:' : 'Fase / Trigger:'} <strong className="text-yellow-400">{script.phaseTitle}</strong>
                            </span>
                            <div className="p-3 bg-neutral-950 border border-yellow-500/40 font-mono font-bold text-sm text-white">
                              "{script.scriptText}"
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono pt-1">
                            <div className="p-2 bg-neutral-900 border border-neutral-800">
                              <span className="text-[10px] text-neutral-400 uppercase font-bold block">{isEn ? 'Operational Notes & Constraints:' : 'Note Operative & Vincoli:'}</span>
                              <p className="text-neutral-300 text-[11px]">{script.operationalNotes}</p>
                            </div>
                            <div className="p-2 bg-neutral-900 border border-neutral-800">
                              <span className="text-[10px] text-neutral-400 uppercase font-bold block">{isEn ? 'Immediate Action Required:' : 'Azione Immediata Richiesta:'}</span>
                              <p className="text-neutral-300 text-[11px]">{script.actionRequired}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredOrderedScripts.length === 0 && (
                  <div className="p-8 text-center text-neutral-500 font-mono text-xs border border-neutral-800">
                    {isEn ? 'No radio suggestions found matching selected filters.' : 'Nessun suggerimento radio trovato per i filtri selezionati.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
