import React, { useState, useMemo } from 'react';
import {
  Radio,
  Send,
  Check,
  Clock,
  Volume2,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  ShieldAlert,
  Zap,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { TimelineSlot, CourseDay } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { playBroadcastSound } from '../../utils/audio';
import {
  TIMELINE_REGIA_RADIO_SCRIPTS,
  TimelineRegiaRadioScript,
} from '../../data/timelineRegiaRadioScripts';

interface RegiaRadioCoordinationPanelProps {
  currentSlot: TimelineSlot;
  activeDay: CourseDay;
  onJumpToSlot?: (slotId: string) => void;
  onSendRadioAlert?: (msg: string) => void;
  isMaster?: boolean;
}

export const RegiaRadioCoordinationPanel: React.FC<RegiaRadioCoordinationPanelProps> = ({
  currentSlot,
  activeDay,
  onJumpToSlot,
  onSendRadioAlert,
  isMaster = true,
}) => {
  const { sendCourseMessage } = useCourse();

  // State
  const [selectedChannel, setSelectedChannel] = useState<'ALL' | 'CH1' | 'CH2' | 'CH3' | 'CH_ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'current' | 'all_ordered'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [transmittedScripts, setTransmittedScripts] = useState<Record<string, string>>({});
  const [expandedScriptCode, setExpandedScriptCode] = useState<string | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Filter scripts for active day and channel
  const dayScripts = useMemo(() => {
    return TIMELINE_REGIA_RADIO_SCRIPTS.filter((s) => s.day === activeDay);
  }, [activeDay]);

  // Current script matching currentSlot.id, or the first script of current slot
  const currentSlotScripts = useMemo(() => {
    const matching = dayScripts.filter((s) => s.slotId === currentSlot.id);
    if (matching.length > 0) return matching;

    // Fallback: match by title or closest
    return dayScripts.slice(0, 1);
  }, [dayScripts, currentSlot.id]);

  const activeCurrentScript = currentSlotScripts[0] || dayScripts[0];

  // Filtered list for "All Ordered"
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

  // Handle radio transmit
  const handleTransmitScript = (script: TimelineRegiaRadioScript) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Send course message
    if (sendCourseMessage) {
      sendCourseMessage({
        senderId: 'REGIA-MASTER',
        senderName: 'Centrale Regia Master',
        senderRole: 'regia',
        type: script.priority === 'emergency' ? 'emergency' : script.priority === 'warning' ? 'warning' : 'info',
        subject: `[${script.channelLabel}] ${script.checkpoint}: ${script.phaseTitle}`,
        content: script.scriptText,
      });
    }

    if (onSendRadioAlert) {
      onSendRadioAlert(`[${script.channel}] ${script.scriptText}`);
    }

    // Play alert chime
    if (playBroadcastSound) {
      playBroadcastSound(script.priority === 'emergency' ? 'emergency' : 'phase_change');
    }

    // Mark as transmitted
    setTransmittedScripts((prev) => ({
      ...prev,
      [script.code]: timeStr,
    }));
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
      {/* HEADER DELLA SEZIONE SCRIPT RADIO (TIMELINE_REGIA_COORDINAMENTO) */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-black p-3.5 border-b border-yellow-500/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-yellow-500 text-black font-black">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                TIMELINE_REGIA_COORDINAMENTO • SCRIPT RADIO UFFICIALI
              </span>
              <span className="px-2 py-0.2 bg-neutral-800 text-neutral-300 font-mono text-[10px] font-bold border border-neutral-700">
                DAY 0{activeDay} ({dayScripts.length} SCRIPTS)
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400">
              Dispacci e callout radio cronologici ordinati per CH1 (Faculty), CH2 (Shock Room/Clinica), CH3 (Tecnici) e CH ALL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Switch Tab Corrente vs Tutti gli Script in Ordine */}
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
              ★ Script Fase Attiva
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
              Tutti gli Script in Ordine ({dayScripts.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer"
            title={isPanelCollapsed ? 'Espandi riquadro script radio' : 'Comprimi riquadro script radio'}
          >
            {isPanelCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isPanelCollapsed && (
        <div className="p-3 sm:p-4 space-y-4">
          {/* ========================================================================= */}
          {/* TAB 1: SCRIPT FASE ATTIVA IN TEMPO REALE (LIVE CALLOUT) */}
          {/* ========================================================================= */}
          {activeTab === 'current' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono pb-1 border-b border-neutral-800">
                <span className="text-yellow-400 font-bold uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Sincronizzato con la Fase Regia: {currentSlot.title} ({currentSlot.timeRange})
                </span>
                <span className="text-neutral-400">
                  {currentSlotScripts.length} script associati a questo blocco
                </span>
              </div>

              {currentSlotScripts.map((script) => {
                const chBadge = getChannelBadge(script.channel);
                const isTransmitted = Boolean(transmittedScripts[script.code]);

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
                          {script.code} • ORDINE #{script.order}
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

                      {/* Transmitted Badge */}
                      {isTransmitted ? (
                        <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-600 text-emerald-300 font-mono text-xs font-black flex items-center gap-1 animate-pulse">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          TRASMESSO ALLE {transmittedScripts[script.code]}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-neutral-400 font-mono text-[11px] font-bold">
                          IN ATTESA DI TRASMISSIONE
                        </span>
                      )}
                    </div>

                    {/* Content Section: Phase title, Recipient, Verbatim Script Text */}
                    <div className="pt-3 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
                        <span className="text-neutral-400">
                          Destinatario: <strong className="text-white">{script.recipient}</strong>
                        </span>
                        <span className="text-neutral-400">
                          Oggetto / Trigger: <strong className="text-yellow-300">{script.phaseTitle}</strong>
                        </span>
                      </div>

                      {/* Verbatim Radio Script Callout Box */}
                      <div className="p-3.5 bg-black border border-yellow-500/40 rounded-none relative">
                        <div className="text-[10px] font-mono text-yellow-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5" /> TESTO ESATTO DISPACCIO RADIO (ORDINE TIMELINE_REGIA_COORDINAMENTO):
                          </span>
                          <span className="text-[9px] text-neutral-500">CANALE: {script.channel}</span>
                        </div>
                        <p className="text-sm sm:text-base font-mono font-bold text-white leading-relaxed select-all">
                          "{script.scriptText}"
                        </p>
                      </div>

                      {/* Operational Notes & Action Required */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 bg-neutral-900/90 border border-neutral-800 space-y-0.5">
                          <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                            📋 Note Operative & Vincoli Tassativi:
                          </span>
                          <p className="text-neutral-300 text-[11px]">{script.operationalNotes}</p>
                        </div>
                        <div className="p-2.5 bg-neutral-900/90 border border-neutral-800 space-y-0.5">
                          <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                            🎯 Azione Immediata Richiesta:
                          </span>
                          <p className="text-neutral-300 text-[11px]">{script.actionRequired}</p>
                        </div>
                      </div>

                      {/* Transmit Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] font-mono text-neutral-500">
                          Cliccando su "Trasmetti" il messaggio viene diffuso istantaneamente sui terminali audio-video del canale selezionato.
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTransmitScript(script)}
                            className={`px-4 py-2 font-black text-xs uppercase flex items-center gap-2 cursor-pointer transition-all shadow-lg ${
                              script.priority === 'emergency'
                                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                                : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                            }`}
                          >
                            <Send className="w-4 h-4" />
                            <span>
                              {isTransmitted ? `RITRASMETTI SU ${script.channel}` : `TRASMETTI SU ${script.channel}`}
                            </span>
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
          {/* TAB 2: TUTTI GLI SCRIPT IN ORDINE RIGOROSO (FOGLIO COMPLETO) */}
          {/* ========================================================================= */}
          {activeTab === 'all_ordered' && (
            <div className="space-y-3">
              {/* Channel Filter Toolbar & Search */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                {/* Channel Filter Pills */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase mr-1">Filtro Canale:</span>
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
                        ? `Tutti (${dayScripts.length})`
                        : ch === 'CH1'
                        ? 'CH1 • Faculty'
                        : ch === 'CH2'
                        ? 'CH2 • Shock Room'
                        : ch === 'CH3'
                        ? 'CH3 • Tecnici'
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
                    placeholder="Cerca script, orario, keyword..."
                    className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs font-mono pl-8 pr-2 py-1.5 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* Sequential Ordered List Table / Cards */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900">
                {filteredOrderedScripts.map((script) => {
                  const chBadge = getChannelBadge(script.channel);
                  const isTransmitted = Boolean(transmittedScripts[script.code]);
                  const isCurrentSlotScript = script.slotId === currentSlot.id;
                  const isExpanded = expandedScriptCode === script.code;

                  return (
                    <div
                      key={script.code}
                      className={`border transition-all ${
                        isCurrentSlotScript
                          ? 'bg-neutral-900/90 border-yellow-400 ring-1 ring-yellow-400/40'
                          : isTransmitted
                          ? 'bg-neutral-950/90 border-emerald-800/60'
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
                              ★ IN CORSO
                            </span>
                          )}

                          {isTransmitted && (
                            <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-600 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              {transmittedScripts[script.code]}
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
                              title="Sincronizza timeline della Regia a questa fase"
                            >
                              <span>Sincronizza Fase</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {/* Quick Transmit */}
                          <button
                            type="button"
                            onClick={() => handleTransmitScript(script)}
                            className={`px-3 py-1 font-mono font-black text-[11px] uppercase flex items-center gap-1.5 cursor-pointer transition-all ${
                              script.priority === 'emergency'
                                ? 'bg-red-600 hover:bg-red-500 text-white'
                                : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                            }`}
                            title={`Trasmetti subito su ${script.channel}`}
                          >
                            <Send className="w-3 h-3" />
                            <span>{isTransmitted ? 'Ritrasmetti' : 'Trasmetti'}</span>
                          </button>

                          {/* Expand/Collapse details */}
                          <button
                            type="button"
                            onClick={() => setExpandedScriptCode(isExpanded ? null : script.code)}
                            className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer"
                            title={isExpanded ? 'Comprimi testo completo' : 'Espandi testo completo'}
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
                              Destinatario: <strong className="text-white">{script.recipient}</strong> | Fase: <strong className="text-yellow-400">{script.phaseTitle}</strong>
                            </span>
                            <div className="p-3 bg-neutral-950 border border-yellow-500/40 font-mono font-bold text-sm text-white">
                              "{script.scriptText}"
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono pt-1">
                            <div className="p-2 bg-neutral-900 border border-neutral-800">
                              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Note Operative:</span>
                              <p className="text-neutral-300 text-[11px]">{script.operationalNotes}</p>
                            </div>
                            <div className="p-2 bg-neutral-900 border border-neutral-800">
                              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Azione Richiesta:</span>
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
                    Nessun dispaccio radio trovato per i filtri selezionati.
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
