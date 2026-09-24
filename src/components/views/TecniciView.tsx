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
  Globe,
  Radio,
  RotateCcw,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { TechSessionChecklist } from '../TechSessionChecklist';
import { ProtesiCatalogView } from './ProtesiCatalogView';
import { TechScenariChecklistModal } from '../tech/TechScenariChecklistModal';
import { TecniciRegistroRisorseView } from '../tech/TecniciRegistroRisorseView';
import { TecniciTimelineAffiancata } from '../tech/TecniciTimelineAffiancata';
import { QuadroPubblicoCorsoModal } from '../tech/QuadroPubblicoCorsoModal';
import { ProtesiAttoriTecniciModal } from '../regia/ProtesiAttoriTecniciModal';
import { DaySelectorToggle } from '../DaySelectorToggle';
import { SimulatorPatient, GroupType } from '../../types';
import { OperatorUnlockModal } from '../common/OperatorUnlockModal';
import { PreCoursePublicCountdown } from '../common/PreCoursePublicCountdown';
import { isScenarioSlot } from '../../utils/scenarioStatusHelper';

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
    isCourseStarted,
    courseStartSchedule,
    timeRemainingMs,
  } = useCourse();

  const isEn = language === 'en';
  const isPreCourse = !isCourseStarted || (courseStartSchedule?.isGateEnabled && timeRemainingMs > 0);

  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'registro' | 'checklists' | 'moulage'>('timeline');
  const [assignmentMode, setAssignmentMode] = useState<'single' | 'pairs'>('single');
  const [selectedPatientForChecklist, setSelectedPatientForChecklist] = useState<SimulatorPatient | null>(null);
  const [selectedProtesiPatient, setSelectedProtesiPatient] = useState<SimulatorPatient | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showQuadroPubblicoModal, setShowQuadroPubblicoModal] = useState(false);

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
  const currentSlot = dayMasterSlots[activeSlotIndex] || INITIAL_TIMELINE_SLOTS[activeSlotIndex] || dayMasterSlots[0];
  const isScenarioInProgress = isScenarioSlot(currentSlot);

  const slotTitleLower = (currentSlot.title || '').toLowerCase();
  const slotDescLower = (currentSlot.description || '').toLowerCase();
  const slotIdLower = currentSlot.id.toLowerCase();

  // 1. Riordino tra uno scenario e l'altro (Turnaround / Reset 15 min)
  const isResetBetweenScenarios =
    slotIdLower.includes('reset') ||
    slotIdLower.includes('turnaround') ||
    slotTitleLower.includes('reset') ||
    slotTitleLower.includes('riordino') ||
    slotTitleLower.includes('turnaround') ||
    slotDescLower.includes('reset') ||
    slotDescLower.includes('riordino') ||
    slotDescLower.includes('turnaround');

  // 2. Standby a 15 minuti dall'inizio dello scenario assegnato (Pre-Allerta T-15 / Standby Attivo SR)
  const isStandby15Min =
    !isResetBetweenScenarios && (
      slotIdLower.includes('prealert') ||
      slotIdLower.includes('pre-alert') ||
      slotTitleLower.includes('pre-alert') ||
      slotTitleLower.includes('pre-allerta') ||
      slotTitleLower.includes('preallerta') ||
      slotDescLower.includes('pre-allerta') ||
      slotDescLower.includes('pre-alert') ||
      slotTitleLower.includes('standby') ||
      slotDescLower.includes('standby') ||
      slotDescLower.includes('t -15') ||
      slotDescLower.includes('t-15')
    );

  // 3. Operativa quando lo scenario si sta svolgendo
  const isScenarioActive = !isResetBetweenScenarios && !isStandby15Min && isScenarioInProgress;

  const isCurrentSlotPreAlert = isStandby15Min;

  const nextScenarioSlot = dayMasterSlots
    .slice(activeSlotIndex + 1)
    .find((s) => isScenarioSlot(s)) || null;

  const nextScenarioStartTime = nextScenarioSlot?.timeRange
    ? nextScenarioSlot.timeRange.split('-')[0].trim()
    : null;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Pre-Course Standby: Only show personal Anagrafica & Public Countdown until course is started by Regia
  if (isPreCourse) {
    return (
      <div className="space-y-4 sm:space-y-6 pb-12 max-w-6xl mx-auto px-2 sm:px-4 font-mono animate-fadeIn">
        {/* Header Banner */}
        <div className="bg-neutral-900 border-2 border-pink-500/60 p-3 sm:p-4 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="px-2.5 sm:px-3 py-1 bg-pink-600 text-white font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 rounded">
              <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {isEn ? 'TECHNICAL VIEW' : 'VISUALE TECNICA'}
            </span>

            <DaySelectorToggle variant="public" />

            <span className="px-2.5 py-1 bg-neutral-950 text-amber-400 font-mono text-[11px] sm:text-xs border border-amber-800/80 flex items-center gap-1.5 rounded">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" /> {isEn ? 'PRE-COURSE STANDBY' : 'STANDBY PRE-CORSO'}
            </span>

            {/* Tasto nell'intestazione: Quadro Pubblico del Corso */}
            <button
              type="button"
              onClick={() => setShowQuadroPubblicoModal(true)}
              className="px-2.5 sm:px-3 py-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-black font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 rounded shadow cursor-pointer transition-all border border-orange-400"
              title={isEn ? 'Open Public Course Overview Menu' : 'Apri Menu Quadro Pubblico del Corso'}
            >
              <Globe className="w-3.5 h-3.5 text-black" />
              <span>{isEn ? 'Public Course' : 'Quadro Pubblico Corso'}</span>
            </button>
          </div>

          {/* Technician Profile Selector */}
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

        {/* PERSONALIZED TECHNICIAN ANAGRAFICA CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Profilo e Specialità */}
          <div className="bg-neutral-950 border-2 border-pink-500/80 p-3.5 sm:p-5 rounded-xl shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-pink-600 text-white font-mono font-black text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-bl">
              {currentTech.badgeCode || 'TECH-01'}
            </div>
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2 text-pink-400 text-xs font-mono uppercase tracking-widest">
                <User className="w-4 h-4" /> {isEn ? 'Technician Profile' : 'Profilo Tecnico Operativo'}
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight break-words">
                  {currentTech.name}
                </h2>
                <p className="text-pink-300 font-bold text-xs sm:text-sm pt-0.5 break-words">
                  {currentTech.specialty}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-neutral-800">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-300">
                <div>
                  <span className="block text-[10px] text-neutral-400 uppercase">{isEn ? 'Nationality:' : 'Nazionalità:'}</span>
                  <strong className="text-white truncate block">{currentTech.nationality || (isEn ? 'Italian' : 'Italiana')}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-neutral-400 uppercase">{isEn ? 'Phone / Radio:' : 'Telefono / Radio:'}</span>
                  <strong className="text-white truncate block">{currentTech.phone || 'CH-3 TECH'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Simulatori Pazienti Presidiati */}
          <div className="bg-neutral-950 border-2 border-neutral-800 p-3.5 sm:p-5 rounded-xl shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2 text-neutral-300 text-xs font-mono uppercase tracking-widest">
                <Wrench className="w-4 h-4 text-pink-400" /> {isEn ? 'Dedicated Patient Simulators' : 'Simulatori Pazienti Presidiati'}
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block mb-1">
                    {isEn ? 'Dedicated Patient Simulators for Active Day:' : 'Simulatori Pazienti Assegnati per la Giornata:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedPatients.map((p) => (
                      <span key={p.id} className="px-2 py-0.5 bg-neutral-900 border border-pink-700/50 text-white rounded text-[11px]">
                        Paz. {p.id} ({p.name})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {partnerTech && (
              <div className="pt-2 mt-2 border-t border-neutral-800 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                <span>{isEn ? 'Pair Partner:' : 'Partner di Coppia:'}</span>
                <strong className="text-white">{partnerTech.badgeCode} • {partnerTech.name}</strong>
              </div>
            )}
          </div>
        </div>

        {/* COUNTDOWN PUBBLICO UFFICIALE */}
        <PreCoursePublicCountdown />

        {/* Quadro Pubblico del Corso Modal */}
        <QuadroPubblicoCorsoModal
          isOpen={showQuadroPubblicoModal}
          onClose={() => setShowQuadroPubblicoModal(false)}
        />

        {/* Unlock Modal */}
        <OperatorUnlockModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          roleLabel="Tecnico"
        />
      </div>
    );
  }

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
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" /> DAY 0{activeDay} • {isEn ? 'PHASE' : 'FASE'} {activeSlotIndex + 1}/{dayMasterSlots.length} ({currentSlot.timeRange})
          </span>

          {/* Tasto nell'intestazione: Quadro Pubblico del Corso */}
          <button
            type="button"
            onClick={() => setShowQuadroPubblicoModal(true)}
            className="px-2.5 sm:px-3 py-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-black font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 rounded shadow cursor-pointer transition-all border border-orange-400"
            title={isEn ? 'Open Public Course Overview Menu' : 'Apri Menu Quadro Pubblico del Corso'}
          >
            <Globe className="w-3.5 h-3.5 text-black" />
            <span>{isEn ? 'Public Course' : 'Quadro Pubblico Corso'}</span>
          </button>
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

      {/* ========================================================================= */}
      {/* ANAGRAFICA DEL TECNICO IN CIMA ALLA PAGINA & SEGNALE OPERATIVO FASE      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Card Sinistra (lg:col-span-7): Anagrafica del Tecnico Assegnato */}
        <div className="lg:col-span-7 bg-neutral-950 border-2 border-pink-500/80 p-3.5 sm:p-4 rounded-xl shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 bg-pink-600 text-white font-mono font-black text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-bl shadow">
            {currentTech.badgeCode || 'TECH-01'}
          </div>

          <div className="space-y-2.5">
            {/* Intestazione Anagrafica */}
            <div className="flex items-center gap-2 text-pink-400 text-xs font-mono uppercase tracking-widest">
              <User className="w-4 h-4 text-pink-400" />
              <span>{isEn ? 'OPERATIONAL TECHNICIAN REGISTRY' : 'ANAGRAFICA TECNICO OPERATIVO'}</span>
            </div>

            {/* Nome e Specialità */}
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight break-words">
                {currentTech.name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <span className="text-pink-300 font-bold text-xs sm:text-sm">
                  {currentTech.specialty}
                </span>
                <span className="text-neutral-500 text-xs">•</span>
                <span className="text-neutral-300 text-xs font-mono flex items-center gap-1">
                  <Radio className="w-3 h-3 text-pink-400" />
                  <strong className="text-pink-300">CH-3 TECNICI</strong>
                  <span className="text-[10px] text-neutral-400">({isEn ? 'Active listening' : 'In ascolto'})</span>
                </span>
              </div>
            </div>

            {/* Simulatori Pazienti Presidiati */}
            <div className="pt-2 border-t border-neutral-800 text-xs font-mono space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                🎯 {isEn ? 'Dedicated Patient Simulators:' : 'Simulatori Pazienti Presidiati:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {assignedPatients.map((p) => (
                  <span
                    key={p.id}
                    className="px-2 py-0.5 bg-neutral-900 border border-pink-700/60 text-white rounded text-[11px] font-bold"
                  >
                    Paz. {p.id} <span className="text-pink-300 font-normal">({p.scenarioCode || p.name})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Partner di Coppia se attivo */}
            {partnerTech && (
              <div className="pt-2 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                <span>{isEn ? 'Pair Partner:' : 'Partner di Coppia:'}</span>
                <strong className="text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
                  👥 {partnerTech.badgeCode} • {partnerTech.name}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Card Destra (lg:col-span-5): SEGNALE OPERATIVO FASE IN CORSO */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          {isScenarioActive ? (
            /* ================================================================= */
            /* 1. SEGNALE FASE OPERATIVA (SCENARIO IN SVOLGIMENTO)               */
            /* ================================================================= */
            <div className="h-full bg-emerald-950/80 border-2 border-emerald-500 p-3.5 sm:p-4 rounded-xl shadow-xl shadow-emerald-950/30 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="space-y-2">
                {/* Badge Stato + Beacon Pulsante Verde */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-500 text-black font-mono font-black text-[10px] sm:text-[11px] uppercase tracking-wider rounded shadow">
                      {isEn ? '🟢 OPERATIONAL PHASE' : '🟢 FASE OPERATIVA'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                    {isEn ? 'SCENARIO IN PROGRESS' : 'SCENARIO IN CORSO'}
                  </span>
                </div>

                {/* Titolo e Dettaglio Operativo */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{currentSlot.title}</span>
                  </h3>
                  <p className="text-[11px] text-emerald-100/90 font-mono mt-1 leading-relaxed">
                    {isEn
                      ? 'The clinical scenario is actively unfolding in the simulation station. Bleed pumps delivery, dynamic telemetry modulation and invasive procedures support active.'
                      : 'Lo scenario clinico si sta svolgendo sul campo. Erogazione flussi emorragici, modulazione parametri vitali su telemetria e supporto operativo in corso.'}
                  </p>
                </div>
              </div>

              {/* Box Cronometro Operativo */}
              <div className="pt-2 border-t border-emerald-500/40 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold">
                  {isEn ? 'Scenario Phase Timer:' : 'Timer Scenario Attivo:'}
                </span>
                <div className="px-3 py-1 bg-neutral-950 border border-emerald-500 rounded flex items-center gap-1.5 shadow-inner">
                  <Clock className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-emerald-400 animate-spin' : 'text-neutral-400'}`} />
                  <span className="text-base sm:text-lg font-mono font-black text-emerald-300">
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
              </div>
            </div>
          ) : isStandby15Min ? (
            /* ================================================================= */
            /* 2. SEGNALE STANDBY A 15 MIN DALL'INIZIO DELLO SCENARIO ASSEGNATO  */
            /* ================================================================= */
            <div className="h-full bg-amber-950/85 border-2 border-amber-500 p-3.5 sm:p-4 rounded-xl shadow-xl shadow-amber-950/30 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="space-y-2">
                {/* Badge Stato + Beacon Pulsante Ambra */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-500 text-black font-mono font-black text-[10px] sm:text-[11px] uppercase tracking-wider rounded shadow">
                      {isEn ? '🟡 ACTIVE STANDBY (T -15 MIN)' : '🟡 STANDBY ATTIVO (T -15 MIN)'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700">
                    {isEn ? '15 MIN TO SCENARIO' : '15 MIN DALL\'INIZIO'}
                  </span>
                </div>

                {/* Titolo e Dettaglio Standby */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                    <span>{isEn ? 'STANDBY 15 MIN BEFORE SCENARIO' : 'STANDBY A 15 MIN DALL\'INIZIO SCENARIO'}</span>
                  </h3>
                  <p className="text-[11px] text-amber-100/90 font-mono mt-1 leading-relaxed">
                    {isEn
                      ? 'Standby window 15 minutes before the start of the assigned scenario. Bleeding pumps priming, hydraulic lines test, telemetry check and radio CH3 verification.'
                      : 'Finestra di standby a 15 minuti dall\'inizio dello scenario assegnato. Innesco pompe sanguinamento, check circuiti idraulici, telemetria e apparati radio CH3.'}
                  </p>
                  {nextScenarioStartTime && (
                    <div className="mt-1.5 text-[11px] font-mono font-bold text-amber-300 bg-neutral-950/80 px-2.5 py-1 rounded border border-amber-700/60 inline-flex items-center gap-1.5">
                      <span>🎯 {nextScenarioSlot?.title || (isEn ? 'Upcoming Scenario' : 'Scenario in arrivo')}</span>
                      <span>•</span>
                      <span className="text-white">{isEn ? `Starts at ${nextScenarioStartTime}` : `Inizio ore ${nextScenarioStartTime}`}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Box Cronometro Standby */}
              <div className="pt-2 border-t border-amber-500/40 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase text-amber-300 font-bold">
                  {isEn ? 'Standby Countdown:' : 'Countdown Standby:'}
                </span>
                <div className="px-3 py-1 bg-neutral-950 border border-amber-500 rounded flex items-center gap-1.5 shadow-inner">
                  <Clock className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-amber-400 animate-spin' : 'text-neutral-400'}`} />
                  <span className="text-base sm:text-lg font-mono font-black text-amber-300">
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
              </div>
            </div>
          ) : isResetBetweenScenarios ? (
            /* ================================================================= */
            /* 3. SEGNALE RIORDINO TRA UNO SCENARIO E L'ALTRO (RESET RAPIDO)     */
            /* ================================================================= */
            <div className="h-full bg-yellow-950/85 border-2 border-yellow-500 p-3.5 sm:p-4 rounded-xl shadow-xl shadow-yellow-950/30 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="space-y-2">
                {/* Badge Stato + Icona Rotante Gialla */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-yellow-400 animate-spin" />
                    <span className="px-2.5 py-0.5 bg-yellow-500 text-black font-mono font-black text-[10px] sm:text-[11px] uppercase tracking-wider rounded shadow">
                      {isEn ? '🔄 RESET & TURNAROUND' : '🔄 RIORDINO & RESET RAPIDO'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-yellow-300 bg-yellow-900/60 px-2 py-0.5 rounded border border-yellow-700">
                    {isEn ? 'BETWEEN SCENARIOS' : 'TRA SCENARI'}
                  </span>
                </div>

                {/* Titolo e Dettaglio Riordino */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                    <span>{isEn ? 'RECOVERY & RESET BETWEEN SCENARIOS' : 'RIORDINO TRA UNO SCENARIO E L\'ALTRO'}</span>
                  </h3>
                  <p className="text-[11px] text-yellow-100/90 font-mono mt-1 leading-relaxed">
                    {isEn
                      ? '15-minute quick turnaround: manikin disinfection, flushing lines and refilling synthetic blood pouches, inserts replacement, restocking consumables and sending green light on CH3.'
                      : 'Turnaround di 15 min tra gli scenari: sanificazione manichini, spurgo sacche sangue sintetico, sostituzione inserti cricotiroidotomia e cute, reintegro consumabili e invio "LUCE VERDE" via radio CH3.'}
                  </p>
                </div>
              </div>

              {/* Box Cronometro Riordino */}
              <div className="pt-2 border-t border-yellow-500/40 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase text-yellow-300 font-bold">
                  {isEn ? 'Turnaround Reset Timer:' : 'Timer Riordino / Turnaround:'}
                </span>
                <div className="px-3 py-1 bg-neutral-950 border border-yellow-500 rounded flex items-center gap-1.5 shadow-inner">
                  <Clock className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-yellow-400 animate-spin' : 'text-neutral-400'}`} />
                  <span className="text-base sm:text-lg font-mono font-black text-yellow-300">
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ================================================================= */
            /* 4. ALTRA FASE DI CORSO (PAUSA / BRIEFING / SETUP STAFF)           */
            /* ================================================================= */
            <div className="h-full bg-neutral-900/90 border-2 border-neutral-700 p-3.5 sm:p-4 rounded-xl shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-neutral-800 text-neutral-200 font-mono font-black text-[10px] sm:text-[11px] uppercase tracking-wider rounded border border-neutral-600">
                    {isEn ? '⚙️ COURSE TECHNICAL PHASE' : '⚙️ FASE TECNICA DI CORSO'}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {currentSlot.timeRange}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                    {currentSlot.title}
                  </h3>
                  <p className="text-[11px] text-neutral-300 font-mono mt-1">
                    {currentSlot.description || (isEn ? 'Logistics supervision and CH3 standby.' : 'Presidio logistico e ascolto attivo su canale radio CH3.')}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
                  {isEn ? 'Phase Timer:' : 'Timer Fase:'}
                </span>
                <div className="px-3 py-1 bg-neutral-950 border border-neutral-700 rounded flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-base sm:text-lg font-mono font-black text-neutral-300">
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
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
          onOpenQuadroPubblico={() => setShowQuadroPubblicoModal(true)}
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
            {isScenarioInProgress ? (
              <div className="bg-emerald-950/80 border border-emerald-600 px-3.5 py-1.5 text-right font-mono">
                <span className="text-[10px] text-emerald-300 uppercase block font-bold">
                  {isEn ? 'SCENARIO IN PROGRESS' : 'SCENARIO IN CORSO'}
                </span>
                <span className="text-xs text-white font-bold uppercase flex items-center gap-1 justify-end">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  {isEn ? 'Timer in top panel' : 'Timer nel pannello superiore'}
                </span>
              </div>
            ) : isCurrentSlotPreAlert ? (
              <div className="bg-amber-950/90 border border-amber-500 px-3.5 py-1.5 text-right font-mono">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-[10px] text-amber-300 uppercase block font-bold">
                    {isEn ? 'STANDBY T-15 ACTIVE' : 'STANDBY T-15 ATTIVO'}
                  </span>
                </div>
                <span className="text-xs text-amber-200 font-bold uppercase block">
                  {nextScenarioStartTime ? `${isEn ? 'Starts at' : 'Inizio ore'} ${nextScenarioStartTime}` : (isEn ? 'Countdown in top panel' : 'Countdown nel pannello')}
                </span>
              </div>
            ) : (
              <div className="bg-neutral-950 border border-neutral-800 px-3.5 py-1.5 text-right font-mono">
                <span className="text-[10px] text-neutral-400 uppercase block font-bold">
                  {isEn ? 'PHASE STATUS' : 'STATO FASE'}
                </span>
                <span className="text-xs text-pink-400 font-bold uppercase">
                  {isEn ? 'Technical Duties / No Active Scenario' : 'Mansione Tecnica / Nessun Scenario Attivo'}
                </span>
              </div>
            )}
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

      {/* Quadro Pubblico del Corso Modal */}
      <QuadroPubblicoCorsoModal
        isOpen={showQuadroPubblicoModal}
        onClose={() => setShowQuadroPubblicoModal(false)}
      />

      {/* REGIA/DIREZIONE OPERATOR UNLOCK MODAL */}
      <OperatorUnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        roleLabel={isEn ? 'Technician' : 'Tecnico'}
      />
    </div>
  );
};
