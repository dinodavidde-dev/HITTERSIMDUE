import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Filter,
  User,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { fetchAuditLogs, getLastSnapshot } from '../../schedule/auditLogStore';
import { type AuditEntry } from '../../offline/db';

interface AuditLogPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRollbackFromLog?: (entry: AuditEntry) => void;
}

export const AuditLogPanel: React.FC<AuditLogPanelProps> = ({ isOpen, onClose, onRollbackFromLog }) => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [searchUser, setSearchUser] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadLogs = async () => {
    setIsLoading(true);
    const filter: any = {};
    if (selectedAction !== 'all') {
      filter.action = selectedAction as AuditEntry['action'];
    }
    if (searchUser.trim()) {
      filter.user = searchUser.trim();
    }
    const data = await fetchAuditLogs(filter);
    setLogs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, selectedAction, searchUser]);

  if (!isOpen) return null;

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString('it-IT')} ore ${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  const getActionBadge = (action: AuditEntry['action']) => {
    switch (action) {
      case 'pause':
        return <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-600 rounded">PAUSA</span>;
      case 'resume':
        return <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded">RIPRESA</span>;
      case 'extend':
        return <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-600 rounded">ESTENSIONE</span>;
      case 'reduce':
        return <span className="px-2 py-0.5 bg-yellow-950 text-yellow-300 border border-yellow-600 rounded">RIDUZIONE</span>;
      case 'move':
        return <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-600 rounded">SPOSTAMENTO</span>;
      case 'rollback':
        return <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-600 rounded">ROLLBACK</span>;
      case 'intent':
        return <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-600 rounded">INTENTO OFFLINE</span>;
      default:
        return <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded">{action}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-950 border-2 border-orange-500/80 max-w-4xl w-full p-5 sm:p-6 shadow-2xl relative text-neutral-100 font-mono space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-orange-400 font-black">
                Tracciamento Operativo Rigoroso
              </span>
              <h3 className="text-lg font-black uppercase text-white tracking-tight flex items-center gap-2">
                <span>REGISTRO MODIFICHE & AUDIT LOG</span>
                <span className="text-xs font-normal text-neutral-400">({logs.length} eventi)</span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 text-white px-2.5 py-1.5 rounded focus:outline-hidden focus:border-orange-400 font-mono"
            >
              <option value="all">Tutte le azioni</option>
              <option value="pause">Pausa Evento</option>
              <option value="resume">Ripresa Evento</option>
              <option value="extend">Estensione Slot</option>
              <option value="reduce">Riduzione Slot</option>
              <option value="move">Spostamento Slot</option>
              <option value="rollback">Rollback Eseguiti</option>
              <option value="intent">Intenzioni Offline</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Filtra per operatore (es. REGIA-01, FAC-02)..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 text-white px-2.5 py-1.5 rounded focus:outline-hidden focus:border-orange-400 font-mono placeholder:text-neutral-600"
            />
          </div>
        </div>

        {/* List of audit entries */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {isLoading ? (
            <div className="p-8 text-center text-neutral-500 font-mono text-xs">Caricamento registro modifiche...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 font-mono text-xs border border-neutral-900 rounded">
              Nessuna modifica registrata con i filtri selezionati.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded space-y-2 hover:border-neutral-700 transition-colors text-xs"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="font-bold text-white text-sm">{log.target}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {log.synced ? (
                      <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-600/60 rounded text-[10px] flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SINCRONIZZATO</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-600 rounded text-[10px] flex items-center gap-1 font-black animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>IN CODA</span>
                      </span>
                    )}

                    <span className="text-[11px] text-neutral-400">{formatTimestamp(log.timestamp)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-orange-400" />
                    <span>Autore: <strong className="text-white">{log.user}</strong></span>
                  </span>

                  {log.reason && (
                    <span className="truncate">
                      Motivo: <em className="text-neutral-300">&quot;{log.reason}&quot;</em>
                    </span>
                  )}
                </div>

                {/* Dettagli Before / After se disponibili */}
                {(log.before !== undefined || log.after !== undefined) && (
                  <div className="p-2 bg-black/50 border border-neutral-850 rounded font-mono text-[10px] text-neutral-400 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {log.before !== undefined && (
                      <div>
                        <strong className="text-neutral-500 uppercase block">Stato Precedente:</strong>
                        <pre className="overflow-x-auto text-neutral-300 mt-0.5">{JSON.stringify(log.before, null, 2)}</pre>
                      </div>
                    )}
                    {log.after !== undefined && (
                      <div>
                        <strong className="text-orange-400 uppercase block">Stato Applicato:</strong>
                        <pre className="overflow-x-auto text-orange-200 mt-0.5">{JSON.stringify(log.after, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs flex-shrink-0">
          <span className="text-[11px] text-neutral-500">
            Tutte le voci dell&apos;Audit Log sono memorizzate in locale su IndexedDB con garanzia di persistenza offline.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold uppercase rounded border border-neutral-700 cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
