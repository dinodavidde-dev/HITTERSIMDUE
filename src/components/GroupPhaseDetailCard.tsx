import React, { useState } from 'react';
import { GroupPhaseEnrichedDetails } from '../utils/groupPhaseDetails';
import {
  Activity,
  AlertCircle,
  Clock,
  Info,
  Layers,
  Phone,
  Shield,
  Stethoscope,
  Target,
  UserCheck,
  Users,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface GroupPhaseDetailCardProps {
  details: GroupPhaseEnrichedDetails;
  groupId: string;
  defaultExpanded?: boolean;
  compact?: boolean;
}

export const GroupPhaseDetailCard: React.FC<GroupPhaseDetailCardProps> = ({
  details,
  groupId,
  defaultExpanded = false,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const {
    phaseTypeLabel,
    operationalDescription,
    didacticObjectives,
    protocolTimingNote,
    simulatorData,
    technicianData,
  } = details;

  return (
    <div className="bg-neutral-950/95 border border-neutral-800 text-xs font-mono rounded overflow-hidden shadow-md">
      {/* Header Bar with Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 bg-neutral-900/90 hover:bg-neutral-850 flex items-center justify-between gap-2 text-left cursor-pointer transition-colors border-b border-neutral-800"
      >
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="px-2 py-0.5 bg-orange-600/30 text-orange-400 border border-orange-500/50 text-[10px] font-black uppercase tracking-wider">
            DETTAGLI FASE & RISORSE
          </span>
          <span className="text-white font-bold text-[11px] truncate">
            {phaseTypeLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] flex-shrink-0">
          <span className="hidden sm:inline">
            {isExpanded ? 'Comprimi' : 'Mostra simulatori & tecnici'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-orange-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-orange-400" />
          )}
        </div>
      </button>

      {/* Always visible brief preview if compact */}
      {!isExpanded && (
        <div className="p-2.5 space-y-1.5 bg-neutral-950/60">
          <p className="text-[11px] text-neutral-300 line-clamp-2 leading-relaxed">
            {operationalDescription}
          </p>

          <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-850">
            <span className="flex items-center gap-1 text-cyan-300 font-semibold truncate">
              <Layers className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {simulatorData.hasSimulators
                  ? simulatorData.simulatorHardware
                  : 'Sessione standard'}
              </span>
            </span>

            {technicianData.hasTech && (
              <span className="flex items-center gap-1 text-orange-300 font-semibold flex-shrink-0">
                <Wrench className="w-3 h-3" />
                <span>{technicianData.techBadge}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expanded Full Details */}
      {isExpanded && (
        <div className="p-3 space-y-3 bg-neutral-950">
          {/* 1. Descrizione Operativa della Fase */}
          <div className="space-y-1.5 bg-neutral-900/70 p-2.5 border border-neutral-800 rounded">
            <div className="flex items-center gap-1.5 text-orange-400 font-bold uppercase text-[10px] tracking-wider">
              <Info className="w-3.5 h-3.5" />
              <span>Descrizione Operativa Fase in Corso</span>
            </div>
            <p className="text-neutral-200 text-xs leading-relaxed">
              {operationalDescription}
            </p>

            {protocolTimingNote && (
              <div className="flex items-start gap-1.5 p-1.5 bg-yellow-950/40 border border-yellow-700/60 text-yellow-300 text-[10px] rounded mt-1.5">
                <Clock className="w-3 h-3 flex-shrink-0 mt-0.5 text-yellow-400" />
                <span>
                  <strong>Direttiva Timing:</strong> {protocolTimingNote}
                </span>
              </div>
            )}

            {/* Obiettivi Didattici */}
            {didacticObjectives.length > 0 && (
              <div className="pt-2 border-t border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase text-neutral-400 font-bold block">
                  Obiettivi di Postazione (Gruppo {groupId}):
                </span>
                <ul className="space-y-0.5 text-[11px] text-neutral-300 list-disc pl-4">
                  {didacticObjectives.map((obj, oIdx) => (
                    <li key={oIdx}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 2. Dati su Simulatori, Attori & Moulage */}
          <div className="space-y-2 bg-neutral-900/70 p-2.5 border border-neutral-800 rounded">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase text-[10px] tracking-wider">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Simulatori, Protesi & Attori</span>
              </div>
              {simulatorData.patientId && (
                <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-700 text-[9px] font-black uppercase">
                  Paziente #{simulatorData.patientId}
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-[11px]">
              {simulatorData.scenarioCode && (
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase block">Scenario Clinico:</span>
                  <span className="text-white font-bold">{simulatorData.scenarioCode}</span>
                </div>
              )}

              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Hardware Simulatore:</span>
                <span className="text-neutral-200">{simulatorData.simulatorHardware}</span>
              </div>

              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Moulage & Protesi:</span>
                <span className="text-neutral-200">{simulatorData.moulageProtesi}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-850">
                <span className="text-neutral-400 text-[10px] uppercase">Presenza Attori:</span>
                <span className="text-cyan-300 font-bold">
                  {simulatorData.attoriCount > 0
                    ? `Presenti (${simulatorData.attoriCount}) - ${simulatorData.attoreDettagli}`
                    : 'Nessun attore vivente (Manichino ad alta fedeltà)'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Dati sul Tecnico di Postazione (TECH) */}
          {technicianData.hasTech && (
            <div className="space-y-1.5 bg-neutral-900/70 p-2.5 border border-neutral-800 rounded">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                <div className="flex items-center gap-1.5 text-orange-400 font-bold uppercase text-[10px] tracking-wider">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Tecnico di Postazione Assegnato</span>
                </div>
                <span className="px-1.5 py-0.2 bg-orange-950 text-orange-300 border border-orange-700 text-[9px] font-black uppercase">
                  {technicianData.techBadge}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-0.5">
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase block">Nominativo:</span>
                  <span className="text-white font-bold">{technicianData.techName}</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase block">Specialità & Compito:</span>
                  <span className="text-neutral-200 truncate block" title={technicianData.techSpecialty}>
                    {technicianData.techSpecialty}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] border-t border-neutral-850 text-neutral-400">
                <span>Canale Regia / Presidio Audio-Video</span>
                <span className="text-orange-300 font-mono font-bold flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{technicianData.techPhone}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
