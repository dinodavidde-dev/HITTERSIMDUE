import React, { useState } from 'react';
import {
  AlertTriangle,
  Building,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Contact,
  Flame,
  HardHat,
  Heart,
  Layers,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Radio,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { GroupActivitySlot, GroupType, SimulatorPatient, Technician, Team } from '../../types';

interface ProtesiAttoriTecniciModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: GroupType;
  groupActivity: GroupActivitySlot;
  timeRange: string;
  patients: SimulatorPatient[];
  teams: Team[];
  technicians: Technician[];
  onSendMessageToTech?: (tech: Technician, msg: string) => void;
}

export const ProtesiAttoriTecniciModal: React.FC<ProtesiAttoriTecniciModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupActivity,
  timeRange,
  patients,
  teams,
  technicians,
  onSendMessageToTech,
}) => {
  const [activeTab, setActiveTab] = useState<'protesi' | 'attori' | 'tecnici'>('protesi');
  const [quickPingTech, setQuickPingTech] = useState<string | null>(null);
  const [quickMsg, setQuickMsg] = useState('');
  const [pingSentSuccess, setPingSentSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const assignedTeams = teams.filter((t) => t.groupId === groupId);

  // Relevant patients for this activity
  const relevantPatients = (groupActivity.patientIds || [])
    .map((pId) => patients.find((p) => p.id === pId))
    .filter(Boolean) as SimulatorPatient[];

  // Fallback: If no patients in activity (e.g. workshop), check all patients of day
  const displayedPatients =
    relevantPatients.length > 0
      ? relevantPatients
      : patients.filter((p) => p.groupExtraAssigned === groupId || p.groupIntraAssigned === groupId);

  // Determine associated technicians based on station names or specialties
  const associatedTechnicians = technicians.filter((tech) => {
    // Check if assigned stations match patient IDs or locations
    const matchesStation = tech.assignedStations.some((station) => {
      const stationLower = station.toLowerCase();
      const locationLower = (groupActivity.location || '').toLowerCase();
      if (locationLower.includes(stationLower) || stationLower.includes(locationLower)) return true;
      return relevantPatients.some(
        (p) =>
          stationLower.includes(`postazione ${p.id}`) ||
          stationLower.includes(`postazione ${p.teamExtraAssigned}`) ||
          stationLower.includes(`postazione ${p.teamIntraAssigned}`)
      );
    });

    if (matchesStation) return true;

    // Check by activity type (e.g. wetlab, workshop, night)
    if (groupActivity.activityType === 'workshop' && tech.specialty.toLowerCase().includes('tccc')) return true;
    if (groupActivity.activityType === 'skills' && tech.specialty.toLowerCase().includes('macgyver')) return true;
    if (groupActivity.activityType === 'night_scenario' && tech.specialty.toLowerCase().includes('notturn')) return true;
    
    // Always include Lead Moulage Silvia if it's a scenario with prostheses
    if (relevantPatients.length > 0 && tech.id === 'tech-1') return true;

    return false;
  });

  // Ensure at least lead technician if none filtered
  const finalTechnicians =
    associatedTechnicians.length > 0 ? associatedTechnicians : [technicians[0], technicians[1]].filter(Boolean);

  const handleSendPing = (tech: Technician) => {
    if (!quickMsg.trim()) return;
    if (onSendMessageToTech) {
      onSendMessageToTech(tech, quickMsg.trim());
    }
    setPingSentSuccess(tech.id);
    setQuickMsg('');
    setTimeout(() => {
      setPingSentSuccess(null);
      setQuickPingTech(null);
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-neutral-950 border-3 border-cyan-500 max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-neutral-900 border-b-2 border-cyan-500 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-400 text-black font-black flex-shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase font-mono tracking-widest px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700">
                  REGISTRO RISORSE TECNICHE • GRUPPO {groupId}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 font-bold">{timeRange}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase mt-0.5 truncate">
                Protesi, Attori & Tecnici Associati
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 transition-colors cursor-pointer bg-neutral-900 border border-neutral-800"
            aria-label="Chiudi finestra"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="grid grid-cols-3 bg-neutral-900 border-b border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('protesi')}
            className={`p-3 font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === 'protesi'
                ? 'bg-neutral-950 text-cyan-400 border-cyan-400'
                : 'text-neutral-400 border-transparent hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>1. Protesi & Moulage ({displayedPatients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attori')}
            className={`p-3 font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === 'attori'
                ? 'bg-neutral-950 text-amber-400 border-amber-400'
                : 'text-neutral-400 border-transparent hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              2. Attori Simulati (
              {displayedPatients.reduce((acc, p) => acc + (p.attoriCount || 1), 0)})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tecnici')}
            className={`p-3 font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === 'tecnici'
                ? 'bg-neutral-950 text-emerald-400 border-emerald-400'
                : 'text-neutral-400 border-transparent hover:text-white hover:bg-neutral-850'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>3. Tecnici Assegnati ({finalTechnicians.length})</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: PROTESI & MOULAGE */}
          {activeTab === 'protesi' && (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-black block">
                    MODULO ATTIVO: {groupActivity.title}
                  </span>
                  <span className="text-white font-bold text-xs">{groupActivity.location}</span>
                </div>
                <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold">
                  {displayedPatients.length} Postazioni con Protesi
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {displayedPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="bg-neutral-900 border-2 border-neutral-800 p-4 space-y-3 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-cyan-500 text-black font-black font-mono text-xs">
                          POSTAZIONE #{patient.id}
                        </span>
                        <span className="font-black text-white text-sm uppercase">
                          {patient.scenarioCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-neutral-300">
                          Sq. Extra: <strong className="text-white">Sq.{patient.teamExtraAssigned}</strong> | Sq. Intra: <strong className="text-white">Sq.{patient.teamIntraAssigned}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Dettaglio Protesi Silicone & Circuiti */}
                    <div className="bg-neutral-950 p-3 border border-neutral-800 space-y-2">
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-black flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        PROTESI IN SILICONE & MOULAGE AD ALTA FEDELTÀ (Lab Silvia Rossi):
                      </span>
                      <p className="text-neutral-200 text-xs font-semibold leading-relaxed">
                        {patient.moulageProtesi}
                      </p>
                    </div>

                    {/* Dettaglio Simulatori Hardware & Manichini */}
                    <div className="bg-neutral-950 p-3 border border-neutral-800 space-y-1">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-black flex items-center gap-1.5">
                        <HardHat className="w-3.5 h-3.5 text-cyan-400" />
                        SIMULATORI HARDWARE / BIOMODELLI:
                      </span>
                      <p className="text-neutral-200 text-xs font-medium">
                        {patient.simulatori}
                      </p>
                    </div>

                    {/* Note Tecniche Operative */}
                    {patient.techNotes && (
                      <div className="bg-amber-950/20 border border-amber-500/30 p-2.5 text-[11px] text-amber-200 space-y-1">
                        <span className="font-mono font-bold uppercase text-amber-400 block">
                          NOTE TECNICHE REGIA:
                        </span>
                        <span>{patient.techNotes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ATTORI SIMULATI */}
          {activeTab === 'attori' && (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-black block">
                    ATTORI PROFESSIONISTI & RUOLI SIMULATI
                  </span>
                  <span className="text-white font-bold text-xs">
                    Istruzioni di recitazione e gestione shock/dolore
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono font-bold">
                  {displayedPatients.reduce((acc, p) => acc + (p.attoriCount || 1), 0)} Attori Assegnati
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {displayedPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="bg-neutral-900 border-2 border-neutral-800 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500 text-black font-black font-mono text-xs">
                          PAZIENTE #{patient.id}
                        </span>
                        <span className="font-black text-white text-sm uppercase">
                          {patient.scenarioCode}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 bg-neutral-800 text-amber-300 border border-neutral-700 font-mono text-xs font-bold">
                        {patient.attoriCount || 1} Attore/i Assegnato/i
                      </span>
                    </div>

                    <div className="bg-neutral-950 p-3 border border-neutral-800 space-y-2">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                        CANOVACCIO & PROFILO RECITATIVO DELL'ATTORE:
                      </span>
                      <p className="text-neutral-200 text-xs font-medium leading-relaxed">
                        {patient.attoreDettagli ||
                          'Attore nel ruolo di paziente traumatizzato. Inizia cosciente e agitato; reagisce alle manovre di immobilizzazione; simula progressivo deterioramento neurologico se non decompresso.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-neutral-950 p-2.5 border border-neutral-800">
                        <span className="text-red-400 font-mono font-bold uppercase block">
                          Reazione al Dolore / Emorragie:
                        </span>
                        <span className="text-neutral-300">
                          Urla e agitazione motoria su applicazione Tourniquet; gemiti respiratori su
                          posizionamento cannula e crico.
                        </span>
                      </div>
                      <div className="bg-neutral-950 p-2.5 border border-neutral-800">
                        <span className="text-cyan-400 font-mono font-bold uppercase block">
                          Cues per Handover SBAR:
                        </span>
                        <span className="text-neutral-300">
                          Fornisce anamnesi sintetica (ora dell'evento, allergie) se interrogato prima
                          del collasso.
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TECNICI ASSEGNATI */}
          {activeTab === 'tecnici' && (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-black block">
                    STAFF TECNICO DI POSTAZIONE & CONTATTO DIRETTO
                  </span>
                  <span className="text-white font-bold text-xs">
                    Specialisti Moulage, Biomodelli e Simulatori
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                  {finalTechnicians.length} Tecnici di Presidio
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {finalTechnicians.map((tech) => (
                  <div
                    key={tech.id}
                    className="bg-neutral-900 border-2 border-neutral-800 p-4 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-emerald-500 text-black font-black font-mono text-[10px]">
                            {tech.badgeCode || 'TECH'}
                          </span>
                          <h4 className="font-black text-white text-sm uppercase">{tech.name}</h4>
                        </div>
                        <span className="text-xs text-neutral-400 font-medium block mt-0.5">
                          {tech.organization}
                        </span>
                      </div>

                      <div className="p-2 bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono text-xs">
                        <HardHat className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[11px] text-neutral-300">
                        <strong className="text-neutral-400 font-mono uppercase block text-[10px]">
                          SPECIALIZZAZIONE:
                        </strong>
                        {tech.specialty}
                      </div>

                      <div className="text-[11px] text-neutral-300">
                        <strong className="text-neutral-400 font-mono uppercase block text-[10px]">
                          POSTAZIONI COPERTE:
                        </strong>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {tech.assignedStations.map((st, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.2 bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-cyan-300"
                            >
                              {st}
                            </span>
                          ))}
                        </div>
                      </div>

                      {tech.phone && (
                        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
                          <span className="text-neutral-400 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            {tech.phone}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setQuickPingTech(quickPingTech === tech.id ? null : tech.id)
                            }
                            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-neutral-700 font-black text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>PING REGIA</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inline Quick Ping Form */}
                    {quickPingTech === tech.id && (
                      <div className="mt-3 pt-3 border-t border-neutral-700 bg-neutral-950 p-3 space-y-2">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">
                          Messaggio Radio Diretto a {tech.name}:
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={quickMsg}
                            onChange={(e) => setQuickMsg(e.target.value)}
                            placeholder="Es. Richiesta fornitura sangue extra su postazione 2..."
                            className="flex-1 bg-neutral-900 border border-neutral-700 px-2 py-1 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-cyan-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleSendPing(tech)}
                            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                        {pingSentSuccess === tech.id && (
                          <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                            <Check className="w-3 h-3" /> Messaggio inviato alla radio del tecnico!
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-900 border-t border-neutral-800 p-4 flex items-center justify-between">
          <span className="text-[11px] font-mono text-neutral-400">
            Regia Master • Scheda Tecnica & Logistica
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase cursor-pointer"
          >
            CHIUDI REGISTRO
          </button>
        </div>
      </div>
    </div>
  );
};
