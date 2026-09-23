import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import {
  Activity,
  CheckCircle2,
  Clock,
  Package,
  User,
  Wrench,
  ClipboardList,
  Lock,
} from 'lucide-react';
import { TechSessionChecklist } from '../TechSessionChecklist';
import { ProtesiCatalogView } from './ProtesiCatalogView';
import { TechScenariChecklistModal } from '../tech/TechScenariChecklistModal';
import { TecniciRegistroRisorseView } from '../tech/TecniciRegistroRisorseView';
import { TecniciTimelineAffiancata } from '../tech/TecniciTimelineAffiancata';
import { ProtesiAttoriTecniciModal } from '../regia/ProtesiAttoriTecniciModal';
import { DaySelectorToggle } from '../DaySelectorToggle';
import { SimulatorPatient, GroupType } from '../../types';
import { OperatorUnlockModal } from '../common/OperatorUnlockModal';

export const TecniciView: React.FC = () => {
  const {
    technicians,
    selectedTechnicianId,
    setSelectedTechnicianId,
    activeDay,
    activeSlotIndex,
    timerSeconds,
    isTimerRunning,
    simulatorPatients,
    teams,
    sendCourseMessage,
    canSelectOperator,
    language,
  } = useCourse();

  const isEn = language === 'en';

  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'registro' | 'checklists' | 'moulage'>('timeline');
  const [assignmentMode, setAssignmentMode] = useState<'single' | 'pairs'>('single');
  const [selectedPatientForChecklist, setSelectedPatientForChecklist] = useState<SimulatorPatient | null>(null);
  const [selectedProtesiPatient, setSelectedProtesiPatient] = useState<SimulatorPatient | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Current active technician
  const currentTech =
    technicians.find((t) => t.id === selectedTechnicianId) ||
    technicians[0] || {
      id: 'tech-1',
      name: 'Silvia Rossi',
      specialty: 'Moulage & Protesi',
      nationality: 'Italiana',
      badgeCode: 'TECH-01',
      assignedStations: ['Ambiente Tattico 1', 'Box Shock Room 1', 'WS1'],
      phone: '+39 333 1234567',
    };

  const currentTechIdx = technicians.findIndex((t) => t.id === currentTech.id);
  const partnerTech =
    assignmentMode === 'pairs' && technicians.length > 1
      ? technicians[(currentTechIdx + 1) % technicians.length]
      : null;

  const techNum = parseInt(currentTech.id.replace(/\D/g, '')) || 1;
  const assignedPatientIds =
    activeDay === 2
      ? [((techNum - 1) % 12) + 1, ((techNum - 1 + 3) % 12) + 1]
      : [((techNum - 1) % 12) + 13, ((techNum - 1 + 3) % 12) + 13];

  const assignedPatients = simulatorPatients.filter(
    (p) => p.day === activeDay && (assignedPatientIds.includes(p.id) || p.id % 6 === (techNum % 6))
  );

  // Regia timeline synchronization
  const dayMasterSlots = INITIAL_TIMELINE_SLOTS.filter((s) => s.day === activeDay);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 max-w-6xl mx-auto px-2 sm:px-4 font-mono animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-neutral-900 border-2 border-pink-500/60 p-3 sm:p-4 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="px-2.5 sm:px-3 py-1 bg-pink-600 text-white font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 rounded">
            <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {isEn ? 'TECHNICAL VIEW' : 'VISUALE TECNICA'}
          </span>

          <DaySelectorToggle variant="public" />

          <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 font-mono text-[11px] sm:text-xs border border-neutral-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" /> DAY 0{activeDay} • {isEn ? 'PHASE' : 'FASE'} {activeSlotIndex + 1}/{dayMasterSlots.length}
          </span>
          <span className="px-2 py-0.5 bg-neutral-950 text-pink-400 border border-neutral-800 font-mono text-[11px] sm:text-xs flex items-center gap-1.5">
            <Clock className={`w-3 h-3 ${isTimerRunning ? 'text-pink-400 animate-spin' : 'text-neutral-400'}`} /> {isEn ? 'T-Phase:' : 'T-Fase:'} {formatTimer(timerSeconds)}
          </span>
        </div>

        {/* Technician Profile Selector & Assignment Mode - visible ONLY when opened by Regia or Direttore */}
        {canSelectOperator ? (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap bg-pink-950/40 p-1.5 border border-pink-700/50 rounded">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-mono text-pink-300 uppercase font-bold flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {isEn ? 'Technician:' : 'Tecnico:'}
              </span>
              <select
                value={currentTech.id}
                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                className="bg-neutral-950 text-pink-300 font-mono text-xs border border-pink-700/60 px-2 sm:px-3 py-1.5 rounded focus:outline-none focus:border-pink-400 max-w-[160px] sm:max-w-xs uppercase font-bold cursor-pointer"
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.badgeCode} • {t.name} ({t.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-neutral-950 border border-neutral-800 p-0.5">
              <button
                type="button"
                onClick={() => setAssignmentMode('single')}
                className={`px-2 py-1 text-[11px] font-black uppercase transition-all cursor-pointer ${
                  assignmentMode === 'single' ? 'bg-pink-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                👤 {isEn ? 'Single' : 'Singolo'}
              </button>
              <button
                type="button"
                onClick={() => setAssignmentMode('pairs')}
                className={`px-2 py-1 text-[11px] font-black uppercase transition-all cursor-pointer ${
                  assignmentMode === 'pairs' ? 'bg-pink-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                👥 {isEn ? 'Pair' : 'Coppia'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-neutral-950 text-pink-300 font-mono text-xs border border-pink-800/80 rounded flex items-center gap-1.5 shadow-inner">
              <Lock className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-pink-400/80">{isEn ? 'Tech:' : 'Tecnico:'}</span>
              <strong className="text-white text-xs">{currentTech.badgeCode} • {currentTech.name}</strong>
              <span className="text-neutral-400 text-[10px] sm:text-[11px] hidden sm:inline">({currentTech.specialty})</span>
            </span>
            <button
              type="button"
              onClick={() => setShowUnlockModal(true)}
              title={isEn ? 'Unlock Selector (Control / Direction)' : 'Sblocca Selettore (Regia / Direzione)'}
              className="p-1.5 text-neutral-500 hover:text-pink-400 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* SubTab Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-neutral-800 pb-2.5 sm:pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 border whitespace-nowrap shrink-0 ${
            activeSubTab === 'timeline'
              ? 'bg-pink-600 text-white border-pink-500 shadow-lg'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {isEn ? 'Side-by-Side Timeline' : 'Timeline Affiancata'}
        </button>

        <button
          onClick={() => setActiveSubTab('registro')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 border whitespace-nowrap shrink-0 ${
            activeSubTab === 'registro'
              ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg'
              : 'bg-neutral-900 text-cyan-400/90 border-cyan-800/60 hover:text-white hover:border-cyan-500'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" /> {isEn ? `Resource Log (${simulatorPatients.length})` : `Registro Risorse (${simulatorPatients.length})`}
        </button>

        <button
          onClick={() => setActiveSubTab('checklists')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 border whitespace-nowrap shrink-0 ${
            activeSubTab === 'checklists'
              ? 'bg-pink-600 text-white border-pink-500 shadow-lg'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {isEn ? 'Station Checklist' : 'Checklist Postazioni'}
        </button>

        <button
          onClick={() => setActiveSubTab('moulage')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 border whitespace-nowrap shrink-0 ${
            activeSubTab === 'moulage'
              ? 'bg-pink-600 text-white border-pink-500 shadow-lg'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {isEn ? 'Prosthetics Catalog' : 'Catalogo Protesi'}
        </button>
      </div>

      {/* SUBTAB 1: TIMELINE PUBBLICA SEMPLIFICATA AFFIANCATA ALLE MANSIONI DEI TECNICI */}
      {activeSubTab === 'timeline' && (
        <TecniciTimelineAffiancata
          currentTech={currentTech}
          partnerTech={partnerTech}
          activeDay={activeDay}
          activeSlotIndex={activeSlotIndex}
          timerSeconds={timerSeconds}
          isTimerRunning={isTimerRunning}
          simulatorPatients={simulatorPatients}
          teams={teams}
          onOpenChecklist={(patient) => setSelectedPatientForChecklist(patient)}
          onOpenProtesiModal={(patient) => setSelectedProtesiPatient(patient)}
          onSendRadioMessage={(msg) => {
            if (sendCourseMessage) {
              sendCourseMessage({
                senderId: currentTech.badgeCode || 'TECH-01',
                senderName: currentTech.name,
                senderRole: 'tecnico',
                type: 'info',
                subject: isEn ? 'Radio Status CH3 Tech' : 'Stato Radio CH3 Tecnico',
                content: msg,
              });
            }
          }}
          onSwitchToRegistro={() => setActiveSubTab('registro')}
        />
      )}

      {/* SUBTAB 2: REGISTRO RISORSE TECNICHE */}
      {activeSubTab === 'registro' && (
        <TecniciRegistroRisorseView
          currentTech={currentTech}
          onOpenChecklist={(patient) => setSelectedPatientForChecklist(patient)}
          onOpenModal={(patient) => setSelectedProtesiPatient(patient)}
        />
      )}

      {/* SUBTAB 3: CHECKLISTS & COUNTDOWNS */}
      {activeSubTab === 'checklists' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-pink-400 uppercase font-black tracking-widest">
                {isEn ? 'PRE-SESSION SETUP & POST-SESSION RESET CHECKLIST' : 'CHECKLIST ALLESTIMENTO PRE-SESSIONE & RESET POST-SESSIONE'}
              </span>
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-pink-500" />
                {isEn ? 'Station Management, Moulage & 🟢 Green Light Signal' : 'Gestione Postazioni, Moulage & 🟢 Segnale Luce Verde'}
              </h2>
            </div>
            <div className="bg-pink-950/80 border border-pink-600 px-4 py-2 text-right">
              <span className="text-[10px] font-mono text-pink-300 uppercase block font-bold">
                {isEn ? 'CURRENT PHASE USEFUL TIME (T-)' : 'TEMPO UTILE FASE CORRENTE (T-)'}
              </span>
              <span className="text-white font-mono font-black text-base">
                {formatTimer(timerSeconds)}
              </span>
            </div>
          </div>

          <TechSessionChecklist />
        </div>
      )}

      {/* SUBTAB 4: MOULAGE & PROSTHETICS CATALOG */}
      {activeSubTab === 'moulage' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5">
            <span className="text-[10px] font-mono text-pink-400 uppercase font-black tracking-widest">
              {isEn ? 'PROSTHETICS, MOULAGE & TECHNICAL CONSUMABLES CATALOG' : 'CATALOGO PROTESI, MOULAGE & CONSUMABILI TECNICI'}
            </span>
            <h2 className="text-lg font-black text-white uppercase mt-1">
              {isEn ? 'Inventory and Preparation of Wounds, Bleeding and Simulators' : 'Inventario e Allestimento Ferite, Sanguinamenti e Simulatori'}
            </h2>
          </div>
          <ProtesiCatalogView />
        </div>
      )}

      {/* Checklist Modal */}
      <TechScenariChecklistModal
        isOpen={Boolean(selectedPatientForChecklist)}
        onClose={() => setSelectedPatientForChecklist(null)}
        currentTech={currentTech}
        patient={selectedPatientForChecklist}
      />

      {/* Protesi / Risorse Tecniche Modal */}
      {selectedProtesiPatient && (
        <ProtesiAttoriTecniciModal
          isOpen={Boolean(selectedProtesiPatient)}
          onClose={() => setSelectedProtesiPatient(null)}
          groupId={(selectedProtesiPatient.groupExtraAssigned || 'A') as GroupType}
          groupActivity={{
            activityType: 'scenario_extra',
            title: selectedProtesiPatient.title || selectedProtesiPatient.scenarioCode,
            subtitle: selectedProtesiPatient.dinamicaDelleLesioni || '',
            location: isEn
              ? `Station Pt #${selectedProtesiPatient.id} • ${selectedProtesiPatient.scenarioCode.includes('TCCC') ? 'Tactical Environment' : 'Shock Room'}`
              : `Postazione Pz #${selectedProtesiPatient.id} • ${selectedProtesiPatient.scenarioCode.includes('TCCC') ? 'Ambiente Tattico' : 'Shock Room'}`,
            patientIds: [selectedProtesiPatient.id],
          }}
          timeRange={selectedProtesiPatient.period === 'mattina' ? '08:30 - 13:00' : '14:00 - 18:30'}
          patients={simulatorPatients}
          teams={teams}
          technicians={technicians}
          onSendMessageToTech={(tech, msg) => {
            sendCourseMessage({
              senderId: currentTech.id,
              senderName: `${currentTech.name} (${currentTech.badgeCode})`,
              senderRole: 'tecnico',
              type: 'warning',
              subject: isEn
                ? `[TECH] Duty / Resources: ${currentTech.badgeCode} -> ${tech.name}`
                : `[TECNICI] Presidio / Risorse: ${currentTech.badgeCode} -> ${tech.name}`,
              content: msg,
            });
          }}
        />
      )}

      {/* REGIA/DIREZIONE OPERATOR UNLOCK MODAL */}
      <OperatorUnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        roleLabel={isEn ? 'Technician' : 'Tecnico'}
      />
    </div>
  );
};
