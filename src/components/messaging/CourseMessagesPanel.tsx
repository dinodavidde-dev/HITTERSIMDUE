import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Clock,
  Filter,
  Flame,
  GraduationCap,
  Info,
  Lock,
  MessageSquare,
  Radio,
  Send,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  Wrench,
} from 'lucide-react';
import { CourseMessage, UserRole } from '../../types';

interface CourseMessagesPanelProps {
  onOpenBroadcast?: () => void;
  onOpenMessenger?: () => void;
}

export const CourseMessagesPanel: React.FC<CourseMessagesPanelProps> = ({
  onOpenBroadcast,
  onOpenMessenger,
}) => {
  const {
    courseMessages,
    acknowledgeCourseMessage,
    deleteCourseMessage,
    userRole,
    facultyAuthSession,
    directors,
    selectedDirectorId,
  } = useCourse();

  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'pending' | 'acknowledged'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentDirector = directors.find((d) => d.id === selectedDirectorId) || directors[0];
  const currentActorName =
    userRole === 'direttore'
      ? (currentDirector ? currentDirector.name : 'Direzione')
      : (facultyAuthSession.facultyName || 'Faculty Tutor');

  const filteredMessages = courseMessages.filter((msg) => {
    if (roleFilter !== 'ALL' && msg.senderRole !== roleFilter) return false;
    if (statusFilter !== 'ALL' && msg.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSender = msg.senderName.toLowerCase().includes(q);
      const matchSubject = msg.subject.toLowerCase().includes(q);
      const matchContent = msg.content.toLowerCase().includes(q);
      const matchStation = (msg.senderStation || '').toLowerCase().includes(q);
      return matchSender || matchSubject || matchContent || matchStation;
    }
    return true;
  });

  const pendingCount = courseMessages.filter((m) => m.status === 'pending').length;

  const getPriorityBadge = (type: 'info' | 'warning' | 'emergency') => {
    switch (type) {
      case 'emergency':
        return (
          <span className="bg-red-600 text-white font-black text-[10px] uppercase px-2 py-0.5 border border-white flex items-center gap-1 animate-pulse">
            <Flame className="w-3 h-3" />
            <span>URGENTE</span>
          </span>
        );
      case 'warning':
        return (
          <span className="bg-orange-500 text-black font-black text-[10px] uppercase px-2 py-0.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>ALLERTA</span>
          </span>
        );
      case 'info':
      default:
        return (
          <span className="bg-neutral-800 text-neutral-300 font-bold text-[10px] uppercase px-2 py-0.5 flex items-center gap-1 border border-neutral-700">
            <Info className="w-3 h-3 text-cyan-400" />
            <span>INFO</span>
          </span>
        );
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'discente':
        return <User className="w-3.5 h-3.5 text-orange-400" />;
      case 'tecnico':
        return <Wrench className="w-3.5 h-3.5 text-cyan-400" />;
      case 'faculty':
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />;
      case 'direttore':
        return <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div id="course-messages-panel" className="bg-neutral-900 border-2 border-neutral-800 p-4 sm:p-6 shadow-xl space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-orange-500 text-black font-black text-xs uppercase tracking-wider">
              REGIA & FACULTY FEED
            </span>
            {pendingCount > 0 && (
              <span className="bg-red-600 text-white font-mono text-xs font-black px-2 py-0.5 animate-pulse">
                {pendingCount} DA GESTIRE
              </span>
            )}
          </div>
          <h3 className="font-black text-xl sm:text-2xl text-white uppercase tracking-tight mt-1 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-orange-500" />
            <span>SEGNALAZIONI & MESSAGGI DAL CAMPO</span>
          </h3>
          <p className="text-xs text-neutral-400 font-semibold mt-0.5">
            Canale riservato: raccoglie tutte le comunicazioni trasmesse da Discenti, Tecnici e Istruttori in tempo reale.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenMessenger && (
            <button
              id="panel-new-message-btn"
              onClick={onOpenMessenger}
              className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-orange-400 hover:text-orange-300 font-black text-xs uppercase tracking-wider border-2 border-neutral-700 hover:border-orange-500 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>INVIA SEGNALAZIONE</span>
            </button>
          )}

          {onOpenBroadcast && userRole === 'direttore' && (
            <button
              id="panel-open-broadcast-btn"
              onClick={onOpenBroadcast}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider border-2 border-white transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
              title="Invia allerta broadcast generale (Riservato Direzione)"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>BROADCAST ALL</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-950 p-3 border border-neutral-800">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per mittente, postazione, oggetto o testo..."
            className="w-full bg-neutral-900 border border-neutral-700 focus:border-orange-500 px-3 py-1.5 text-xs text-white placeholder-neutral-500 font-medium focus:outline-hidden"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mr-1 hidden lg:inline">
            RUOLO:
          </span>
          {(['ALL', 'discente', 'tecnico', 'faculty', 'ospite'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border flex-shrink-0 ${
                roleFilter === r
                  ? 'bg-neutral-100 text-black border-neutral-100'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {r === 'ALL' ? 'TUTTI' : r}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {(['ALL', 'pending', 'acknowledged'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                statusFilter === s
                  ? 'bg-orange-500 text-black border-orange-500'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {s === 'ALL' ? 'STATO: TUTTI' : s === 'pending' ? 'DA GESTIRE' : 'PRESI IN CARICO'}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center bg-neutral-950 border border-neutral-800 space-y-2">
            <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-sm font-bold text-neutral-400 uppercase">
              Nessun messaggio trovato con i filtri selezionati
            </p>
            <p className="text-xs text-neutral-600">
              Tutte le nuove segnalazioni dal campo compariranno qui automaticamente in tempo reale.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isPending = msg.status === 'pending';
            return (
              <div
                key={msg.id}
                id={`course-msg-${msg.id}`}
                className={`p-4 border-2 transition-all ${
                  isPending
                    ? 'bg-neutral-950 border-orange-500/80 shadow-md'
                    : 'bg-neutral-950/60 border-neutral-800 opacity-90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  {/* Left block */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-neutral-900 border border-neutral-700 flex-shrink-0 mt-0.5">
                      {getRoleIcon(msg.senderRole)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getPriorityBadge(msg.type)}
                        <span className="font-mono text-xs text-neutral-400 font-bold">
                          {msg.timestamp}
                        </span>
                        <span className="font-black text-xs text-white uppercase tracking-wider">
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] font-bold text-orange-400 uppercase px-1.5 py-0.2 bg-neutral-900 border border-neutral-800">
                          {msg.senderRole}
                        </span>
                        {msg.senderTeamId && (
                          <span className="text-[10px] font-bold text-cyan-300 px-1.5 py-0.2 bg-cyan-950 border border-cyan-800">
                            SQUADRA {msg.senderTeamId}
                          </span>
                        )}
                        {msg.senderStation && (
                          <span className="text-[10px] font-mono text-neutral-400">
                            📍 {msg.senderStation}
                          </span>
                        )}
                      </div>

                      <h4 className="font-black text-sm sm:text-base text-white tracking-tight pt-1">
                        {msg.subject}
                      </h4>

                      <p className="text-xs sm:text-sm text-neutral-200 font-medium leading-relaxed bg-neutral-900/80 p-2.5 border border-neutral-800">
                        {msg.content}
                      </p>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-start flex-shrink-0 pt-2 sm:pt-0">
                    {isPending ? (
                      <button
                        onClick={() => acknowledgeCourseMessage(msg.id, currentActorName)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                        title="Prendi in carico la segnalazione"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>PRENDI IN CARICO</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 border border-emerald-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Gestito da: {msg.acknowledgedBy} ({msg.acknowledgedAt})</span>
                      </div>
                    )}

                    <button
                      onClick={() => deleteCourseMessage(msg.id)}
                      className="p-1.5 bg-neutral-900 hover:bg-red-950 text-neutral-500 hover:text-red-400 border border-neutral-800 hover:border-red-800 transition-colors cursor-pointer"
                      title="Rimuovi messaggio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
