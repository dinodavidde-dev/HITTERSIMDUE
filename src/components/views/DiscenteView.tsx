import React, { useState } from 'react';
import {
  Activity,
  Clock,
  Globe,
  MapPin,
  Users,
  GraduationCap,
  ShieldCheck,
  Compass,
  CheckCircle2,
  User,
  Award,
  AlertTriangle,
  QrCode,
  Lock,
  Crosshair,
  Stethoscope,
  Wrench,
  Coffee,
  Calendar,
} from 'lucide-react';
import { GroupType, Discente } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { DaySelectorToggle } from '../DaySelectorToggle';
import { ParticipantQRModal } from '../anagrafica/ParticipantQRModal';
import { OperatorUnlockModal } from '../common/OperatorUnlockModal';
import { DiscentePersonalTimeline } from './DiscentePersonalTimeline';

export const DiscenteView: React.FC = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showCourseTimeline, setShowCourseTimeline] = useState(false);

  // Check if opened from QR code (URL contains qr=1, badge, id, or from=qr)
  const [isFromQR] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return (
      params.get('qr') === '1' ||
      params.get('from') === 'qr' ||
      params.get('source') === 'qr' ||
      Boolean(params.get('badge') && params.get('id')) ||
      Boolean(params.get('badge') && params.get('h')) ||
      (params.get('view') === 'discente' && Boolean(params.get('id') || params.get('badge')))
    );
  });

  const {
    activeDay,
    activeSlotIndex,
    timerSeconds,
    isTimerRunning,
    syncStatus,
    faculty,
    discenti,
    selectedDiscenteId,
    setSelectedDiscenteId,
    simulatorPatients,
    teams,
    technicians,
    canSelectOperator,
  } = useCourse();

  const currentDiscente = discenti.find((d) => d.id === selectedDiscenteId) || discenti[0] || {
    id: 'disc-1',
    name: 'Mario Rossi',
    role: 'Medico di Emergenza',
    teamId: 1,
    nationality: 'Italiana',
    badgeCode: 'DISC-01',
  };

  const studentGroup: GroupType = currentDiscente.teamId <= 3 ? 'A' : currentDiscente.teamId <= 6 ? 'B' : currentDiscente.teamId <= 9 ? 'C' : 'D';
  const groupLabel = studentGroup === 'A' ? 'ALPHA' : studentGroup === 'B' ? 'BRAVO' : studentGroup === 'C' ? 'CHARLIE' : 'DELTA';
  const assignedFaculty = faculty.find((f) => f.assignedTeamId === currentDiscente.teamId) || faculty[0];
  const isTeamLeader = currentDiscente.id === `disc-${(currentDiscente.teamId - 1) * 5 + 1}` || (currentDiscente.role?.toLowerCase().includes('leader') ?? false);

  const dayMasterSlots = INITIAL_TIMELINE_SLOTS.filter((s) => s.day === activeDay);
  const publicSlots = dayMasterSlots.filter((s) => !s.id.includes('setup'));

  const masterCurrentSlot = INITIAL_TIMELINE_SLOTS[activeSlotIndex] || dayMasterSlots[0] || INITIAL_TIMELINE_SLOTS[0];
  const slotIdxInDay = dayMasterSlots.findIndex((s) => s.id === masterCurrentSlot?.id);
  let currentSlot = publicSlots.find((s) => s.id === masterCurrentSlot?.id);
  if (!currentSlot && publicSlots.length > 0) {
    currentSlot = publicSlots[0];
  }
  if (!currentSlot) currentSlot = dayMasterSlots[0] || INITIAL_TIMELINE_SLOTS[0];

  const studentCurrentActivity = currentSlot?.groupActivities?.[studentGroup];

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatCumulativeTimer = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${hours}h ${mins.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCumulativeSeconds = (isMorning: boolean, isNightToMorning: boolean) => {
    return timerSeconds;
  };

  return (
    <div className="space-y-4 pb-12 max-w-5xl mx-auto px-4">
      {/* Header Banner - Nascosto quando aperta da QR Code */}
      {!isFromQR && (
        <div className="bg-neutral-900 border-2 border-cyan-500/60 p-3 sm:p-4 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-3 rounded">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 bg-cyan-600 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 rounded">
              <GraduationCap className="w-4 h-4" /> VISUALE DISCENTE PERSONALIZZATA
            </span>

            <DaySelectorToggle variant="public" />

            <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 font-mono text-xs border border-neutral-800 flex items-center gap-1.5 rounded">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> DAY 0{activeDay} • FASE {activeSlotIndex + 1}/{dayMasterSlots.length}
            </span>
            <span className="px-2 py-0.5 bg-neutral-950 text-cyan-400 border border-neutral-800 font-mono text-xs flex items-center gap-1.5 rounded">
              <Clock className={`w-3 h-3 ${isTimerRunning ? 'text-cyan-400 animate-spin' : 'text-neutral-400'}`} /> T-Fase: {formatTimer(timerSeconds)}
            </span>
          </div>

          {/* Discente Selector - visible ONLY when opened by Regia or Direttore */}
          {canSelectOperator ? (
            <div className="flex items-center gap-2 flex-wrap bg-cyan-950/40 p-1.5 border border-cyan-700/50 rounded">
              <span className="text-xs font-mono text-cyan-300 uppercase font-bold flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Seleziona Discente:
              </span>
              <select
                value={selectedDiscenteId}
                onChange={(e) => setSelectedDiscenteId(e.target.value)}
                className="bg-neutral-950 text-cyan-300 font-mono text-xs border border-cyan-700/60 px-3 py-1.5 rounded focus:outline-none focus:border-cyan-400 max-w-xs cursor-pointer font-bold"
              >
                {discenti.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.badgeCode || 'DISC'} • {d.name} (Sq. {d.teamId})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-neutral-950 text-cyan-300 font-mono text-xs border border-cyan-800/80 rounded flex items-center gap-1.5 shadow-inner">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] uppercase tracking-wider text-cyan-400/80">Discente Assegnato:</span>
                <strong className="text-white">{currentDiscente.badgeCode || 'DISC'} • {currentDiscente.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowUnlockModal(true)}
                title="Sblocca Selettore (Regia / Direzione)"
                className="p-1 text-neutral-500 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* INTESTAZIONE PERSONALIZZATA MINIMIZZATA: NOME E COGNOME, INFO FACULTY, GRUPPO E SQUADRA */}
      <div className="bg-neutral-950 border-2 border-cyan-500/80 p-3.5 sm:p-4 rounded shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Nome, Cognome, Matricola e Ruolo */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-cyan-600 text-black font-mono font-black text-xs rounded">
                {currentDiscente.badgeCode || 'DISC-01'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                {currentDiscente.name}
              </h1>
              <span className={`px-2 py-0.5 font-mono text-[11px] font-bold rounded border ${
                isTeamLeader
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-700'
              }`}>
                {isTeamLeader ? 'Team Leader (TL)' : 'Operatore'}
              </span>
            </div>
            <p className="text-neutral-400 text-xs font-mono">
              {currentDiscente.role || 'Professione Sanitaria / Emergenza'} • {currentDiscente.nationality || 'Italiana'}
            </p>
          </div>

          {/* Info Integrate nel riquadro: Faculty, Gruppo, Squadra & Azioni */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Gruppo */}
            <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded flex items-center gap-1.5 text-xs font-mono">
              <span className="text-neutral-400">Gruppo:</span>
              <strong className="text-cyan-400">GRUPPO {groupLabel}</strong>
            </div>

            {/* Squadra */}
            <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded flex items-center gap-1.5 text-xs font-mono">
              <span className="text-neutral-400">Squadra:</span>
              <strong className="text-white">Squadra {currentDiscente.teamId}</strong>
            </div>

            {/* Faculty Tutor */}
            <div className="px-2.5 py-1 bg-neutral-900 border border-orange-500/40 rounded flex items-center gap-1.5 text-xs font-mono" title={assignedFaculty?.name}>
              <span className="text-neutral-400">Faculty (1:1):</span>
              <strong className="text-orange-400">{assignedFaculty?.badgeCode || 'FAC'} • {assignedFaculty?.name || 'Tutor Assegnato'}</strong>
            </div>

            {/* Opzione Timeline Personale & QR Pass */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowCourseTimeline(!showCourseTimeline)}
                className={`px-3 py-1.5 text-xs font-mono font-black uppercase flex items-center gap-1.5 rounded transition-colors cursor-pointer border ${
                  showCourseTimeline
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow'
                    : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border-cyan-700/70'
                }`}
                title="Mostra la timeline operativa personalizzata per le due giornate del corso"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{showCourseTimeline ? 'Chiudi Timeline' : 'La Mia Timeline (2 Giornate)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQRModal(true)}
                className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-mono font-bold uppercase flex items-center gap-1.5 rounded transition-colors cursor-pointer"
                title="Visualizza QR Code Pass"
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Pass</span>
              </button>
            </div>
          </div>
        </div>

        {/* Informazioni sintetiche di stato temporale quando aperta da QR Code */}
        {isFromQR && (
          <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>DAY 0{activeDay} • FASE {activeSlotIndex + 1}/{dayMasterSlots.length}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-cyan-400">T-Fase: {formatTimer(timerSeconds)}</span>
            </div>
            <div className="text-neutral-400">
              Visuale Personale Operativa
            </div>
          </div>
        )}
      </div>

      {/* SEZIONE TIMELINE PERSONALIZZATA DELL'INTERO CORSO (DAY 2 & DAY 3) */}
      {showCourseTimeline && (
        <DiscentePersonalTimeline
          discente={currentDiscente}
          assignedFaculty={assignedFaculty}
          currentActiveSlotId={currentSlot?.id}
          activeDay={activeDay}
        />
      )}

      {/* HIGHLIGHTED 4 SQUAD COUNTDOWN & ACTIVE ACTIVITIES OR SPECIAL COUNTDOWN MODES */}
      {(() => {
        const isDayBefore8 = (activeDay === 2 || activeDay === 3) && slotIdxInDay === 0;
        const isMorningCountdown = (activeDay === 2 || activeDay === 3) && slotIdxInDay === 1;
        const isNightToMorningCountdown = (activeDay === 2 && currentSlot?.id === 'd2-chiusura');

        if (isDayBefore8) {
          return (
            <div className="bg-neutral-950 border-2 border-cyan-500 p-5 sm:p-8 shadow-xl text-center space-y-4 relative overflow-hidden rounded">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />
              <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 bg-cyan-600 text-black font-black text-xs uppercase tracking-widest rounded shadow-sm">
                    H.I.T.T.E.R. High Intensive Training Trauma Emergency Response • INTUBATI EM • SQUADRA {currentDiscente.teamId}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight pt-1">
                    ATTESA APERTURA CORSO DISCENTI
                  </h1>
                </div>

                <div className="bg-cyan-950/80 border border-cyan-600/80 p-4 rounded shadow-md max-w-lg mx-auto animate-pulse">
                  <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest block mb-1">
                    AVVISO UFFICIALE REGIA • DAY 0{activeDay}
                  </span>
                  <p className="text-base sm:text-xl font-black text-white uppercase tracking-wide">
                    IL GATE DISCENTI APRE ALLE 08:30
                  </p>
                </div>

                <div className="pt-1 space-y-2">
                  <p className="text-base sm:text-lg font-bold text-cyan-300 uppercase tracking-wider italic">
                    "Verificate i DPI personali e preparatevi per il briefing iniziale."
                  </p>
                  <p className="text-xs text-neutral-400 font-mono">
                    Day {activeDay} • Attesa apertura ufficiale ore 08:30
                  </p>
                </div>
              </div>
            </div>
          );
        }

        if (isMorningCountdown || isNightToMorningCountdown) {
          return (
            <div className="bg-neutral-950 border-2 border-cyan-500 p-5 sm:p-7 shadow-xl text-center space-y-4 relative overflow-hidden rounded">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />
              <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 bg-cyan-600 text-black font-black text-xs uppercase tracking-widest rounded shadow-sm">
                    H.I.T.T.E.R. High Intensive Training Trauma Emergency Response • INTUBATI EM • SQUADRA {currentDiscente.teamId}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight pt-1">
                    {isMorningCountdown ? 'COUNTDOWN 30 MINUTI (08:00 - 08:30)' : 'ATTIVITÀ IN ARRIVO'}
                  </h1>
                </div>

                {isMorningCountdown && (
                  <div className="bg-cyan-950/80 border border-cyan-500/70 p-3.5 rounded shadow-md max-w-lg mx-auto animate-pulse">
                    <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest block mb-0.5">
                      DISPOSIZIONE UFFICIALE REGIA
                    </span>
                    <p className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                      La Squadra {currentDiscente.teamId} è invitata a raggiungere il Faculty {assignedFaculty?.name} ({assignedFaculty?.badgeCode || 'FAC'}).
                    </p>
                  </div>
                )}

                <div className="py-4 px-6 bg-neutral-900/95 border-2 border-cyan-500/80 rounded shadow-inner inline-block my-1">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block mb-0.5">
                    {isMorningCountdown ? 'TEMPO RIMANENTE 30 MINUTI' : 'COUNTDOWN BLOCCO'}
                  </span>
                  <div className="text-4xl sm:text-5xl font-mono font-black text-cyan-400 animate-pulse tracking-wider">
                    {formatCumulativeTimer(getCumulativeSeconds(isMorningCountdown, isNightToMorningCountdown))}
                  </div>
                </div>

                <div className="pt-1 space-y-1.5">
                  <p className="text-base sm:text-xl font-black text-cyan-300 uppercase tracking-wider italic">
                    "{isMorningCountdown ? 'Contatto Faculty e posizionamento postazione in corso' : 'Avvio Blocco'}"
                  </p>
                  <p className="text-xs text-neutral-400 font-mono">
                    {isMorningCountdown && `Day ${activeDay} • Countdown 30 minuti verso l'apertura delle 08:30`}
                    {isNightToMorningCountdown && 'Transizione Day 2 ➔ Day 3 (Scadenza 08:30)'}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        const act = studentCurrentActivity;
        if (!act) return null;

        // Squad station number within the group (Squadra 1 -> 1, Squadra 2 -> 2, Squadra 3 -> 3)
        const stationNum = ((currentDiscente.teamId - 1) % 3) + 1;
        const slotTitle = (currentSlot?.title || '').toLowerCase();
        const text = `${act.title} ${act.subtitle} ${act.location}`.toLowerCase();
        const actType = act.activityType || '';

        // Determine environment classification
        const isTCCC =
          text.includes('tccc') ||
          text.includes('tattic') ||
          actType === 'scenario_extra' ||
          (slotTitle.includes('tccc') && !text.includes('shock') && !text.includes('ws'));

        const isShockRoom =
          text.includes('shock room') ||
          text.includes('box shock') ||
          actType === 'scenario_intra' ||
          (slotTitle.includes('shock room') && !text.includes('tccc') && !text.includes('ws'));

        const isWS1 = text.includes('ws1') || text.includes('vie aeree') || text.includes('crico') || text.includes('airway');
        const isWS2 = text.includes('ws2') || text.includes('ecografia') || text.includes('fast') || text.includes('accessi');
        const isWorkshop = actType === 'workshop' || text.includes('workshop') || isWS1 || isWS2;

        const isPreAllertaTCCC = isTCCC && (
          slotTitle.includes('pre-alert') ||
          slotTitle.includes('pre-allerta') ||
          text.includes('pre-allerta') ||
          text.includes('preallerta')
        );

        const isStandbySR = isShockRoom && (
          text.includes('standby') ||
          text.includes('pre-handover') ||
          slotTitle.includes('standby')
        );

        const isHandover = slotTitle.includes('handover') || text.includes('handover') || text.includes('sbar');
        const showCountdown = isPreAllertaTCCC || isStandbySR;

        // Configuration strictly specifying AMBIENTE TCCC vs SHOCK ROOM and eliminating any scenario details
        let envConfig: {
          environmentType: 'TCCC' | 'SHOCK_ROOM' | 'WORKSHOP' | 'PAUSA' | 'BRIEFING';
          environmentBadge: string;
          phaseLabel: string;
          title: string;
          subtitle: string;
          location: string;
          border: string;
          bg: string;
          badge: string;
          glow: string;
          isBlinking: boolean;
        };

        if (isTCCC) {
          if (isHandover) {
            envConfig = {
              environmentType: 'TCCC',
              environmentBadge: 'AMBIENTE TCCC',
              phaseLabel: 'FASE HANDOVER SBAR 1:1',
              title: 'AMBIENTE TCCC',
              subtitle: 'Consegna barellata con report SBAR 1:1 verso Ospedale da Campo (Shock Room).',
              location: `Ambiente Tattico ${stationNum}`,
              border: 'border-orange-500 animate-pulse border-3',
              bg: 'bg-orange-950/40',
              badge: 'bg-orange-600 text-white font-black animate-pulse',
              glow: 'shadow-orange-950/80 shadow-2xl',
              isBlinking: true,
            };
          } else if (isPreAllertaTCCC) {
            envConfig = {
              environmentType: 'TCCC',
              environmentBadge: 'AMBIENTE TCCC',
              phaseLabel: 'PRE-ALLERTA TCCC (T -15)',
              title: 'AMBIENTE TCCC',
              subtitle: 'Finestra T-15: vestizione DPI tattici, ricognizione e preparazione equipaggiamento.',
              location: `Ambiente Tattico ${stationNum}`,
              border: 'border-yellow-400 animate-pulse border-3',
              bg: 'bg-yellow-950/35',
              badge: 'bg-yellow-400 text-black font-black animate-pulse',
              glow: 'shadow-yellow-950/60 shadow-xl',
              isBlinking: true,
            };
          } else if (text.includes('debriefing')) {
            envConfig = {
              environmentType: 'TCCC',
              environmentBadge: 'AMBIENTE TCCC',
              phaseLabel: 'DEBRIEFING OPERATIVO TCCC',
              title: 'AMBIENTE TCCC',
              subtitle: 'Revisione operativa e debriefing con il Tutor Faculty assegnato.',
              location: `Ambiente Tattico ${stationNum}`,
              border: 'border-purple-500 border-2',
              bg: 'bg-purple-950/35',
              badge: 'bg-purple-600 text-white font-black',
              glow: 'shadow-purple-950/60 shadow-xl',
              isBlinking: false,
            };
          } else {
            envConfig = {
              environmentType: 'TCCC',
              environmentBadge: 'AMBIENTE TCCC',
              phaseLabel: 'ADDESTRAMENTO ATTIVO',
              title: 'AMBIENTE TCCC',
              subtitle: 'Gestione del ferito in ambiente tattico sotto la direzione del Tutor Faculty.',
              location: `Ambiente Tattico ${stationNum}`,
              border: 'border-orange-500 border-3',
              bg: 'bg-orange-950/30',
              badge: 'bg-orange-600 text-white font-black',
              glow: 'shadow-orange-950/80 shadow-2xl',
              isBlinking: false,
            };
          }
        } else if (isShockRoom) {
          if (isHandover) {
            envConfig = {
              environmentType: 'SHOCK_ROOM',
              environmentBadge: 'SHOCK ROOM',
              phaseLabel: 'FASE HANDOVER SBAR 1:1',
              title: 'SHOCK ROOM',
              subtitle: 'Ricezione e presa in carico del ferito barellato con report SBAR 1:1 da TCCC.',
              location: `Box Shock Room ${stationNum}`,
              border: 'border-cyan-400 animate-pulse border-3',
              bg: 'bg-cyan-950/40',
              badge: 'bg-cyan-400 text-black font-black animate-pulse',
              glow: 'shadow-cyan-950/80 shadow-2xl',
              isBlinking: true,
            };
          } else if (isStandbySR) {
            envConfig = {
              environmentType: 'SHOCK_ROOM',
              environmentBadge: 'SHOCK ROOM',
              phaseLabel: 'STANDBY ATTIVO BOX (T -15)',
              title: 'SHOCK ROOM',
              subtitle: 'Finestra T-15: presidio Box, controllo presidi e standby attivo pre-handover.',
              location: `Box Shock Room ${stationNum}`,
              border: 'border-yellow-400 animate-pulse border-3',
              bg: 'bg-yellow-950/35',
              badge: 'bg-yellow-400 text-black font-black animate-pulse',
              glow: 'shadow-yellow-950/60 shadow-xl',
              isBlinking: true,
            };
          } else if (text.includes('debriefing')) {
            envConfig = {
              environmentType: 'SHOCK_ROOM',
              environmentBadge: 'SHOCK ROOM',
              phaseLabel: 'DEBRIEFING CLINICO SHOCK ROOM',
              title: 'SHOCK ROOM',
              subtitle: 'Revisione collegiale e debriefing clinico con il Tutor Faculty assegnato.',
              location: `Box Shock Room ${stationNum}`,
              border: 'border-purple-500 border-2',
              bg: 'bg-purple-950/35',
              badge: 'bg-purple-600 text-white font-black',
              glow: 'shadow-purple-950/60 shadow-xl',
              isBlinking: false,
            };
          } else {
            envConfig = {
              environmentType: 'SHOCK_ROOM',
              environmentBadge: 'SHOCK ROOM',
              phaseLabel: 'ADDESTRAMENTO ATTIVO',
              title: 'SHOCK ROOM',
              subtitle: 'Approccio clinico-rianimatorio avanzato in Ospedale da Campo con il Tutor Faculty.',
              location: `Box Shock Room ${stationNum}`,
              border: 'border-cyan-400 border-3',
              bg: 'bg-cyan-950/35',
              badge: 'bg-cyan-400 text-black font-black',
              glow: 'shadow-cyan-950/80 shadow-2xl',
              isBlinking: false,
            };
          }
        } else if (isWorkshop) {
          const wsName = isWS1 ? 'SKILL WORKSHOP 1 (WS1)' : isWS2 ? 'SKILL WORKSHOP 2 (WS2)' : 'SKILLS WORKSHOP';
          const wsLoc = isWS1 ? 'Aula Skills Lab WS1' : isWS2 ? 'Aula Skills Lab WS2' : (act.location || 'Aula Workshop');
          envConfig = {
            environmentType: 'WORKSHOP',
            environmentBadge: wsName,
            phaseLabel: 'WORKSHOP PROCEDURALE',
            title: wsName,
            subtitle: 'Addestramento procedurale e manovre pratiche di abilità clinica con il Tutor Faculty.',
            location: wsLoc,
            border: 'border-emerald-400 border-3',
            bg: 'bg-emerald-950/30',
            badge: 'bg-emerald-500 text-black font-black',
            glow: 'shadow-emerald-950/50 shadow-lg',
            isBlinking: false,
          };
        } else if (text.includes('pausa') || text.includes('ristoro') || text.includes('pranzo') || text.includes('riposo')) {
          envConfig = {
            environmentType: 'PAUSA',
            environmentBadge: 'PAUSA & RISTORO',
            phaseLabel: 'PAUSA TECNICA',
            title: 'PAUSA & RISTORO',
            subtitle: 'Ristoro e recupero operativo tra i blocchi addestrativi.',
            location: 'Area Ristoro / Conviviale',
            border: 'border-cyan-400 border-2',
            bg: 'bg-cyan-950/30',
            badge: 'bg-cyan-400 text-black font-black',
            glow: 'shadow-cyan-950/50 shadow-lg',
            isBlinking: false,
          };
        } else {
          envConfig = {
            environmentType: 'BRIEFING',
            environmentBadge: 'SESSIONE D\'AULA',
            phaseLabel: 'INQUADRAMENTO / PLENARIA',
            title: act.title || 'SESSIONE D\'AULA',
            subtitle: act.subtitle || 'Allineamento e direttive d\'aula con la Faculty.',
            location: act.location || 'Aula Plenaria',
            border: 'border-neutral-700 border-2',
            bg: 'bg-neutral-900/50',
            badge: 'bg-neutral-800 text-neutral-200 font-bold',
            glow: 'shadow-lg',
            isBlinking: false,
          };
        }

        const squadNumbers = studentGroup === 'A' ? [1, 2, 3] : studentGroup === 'B' ? [4, 5, 6] : studentGroup === 'C' ? [7, 8, 9] : [10, 11, 12];
        const displaySlotTitle = (currentSlot?.title || 'FASE CORRENTE').replace(/Scenario\s*/gi, 'Attività ').trim();

        return (
          <div className="bg-neutral-900 border-2 border-cyan-500/80 p-4 sm:p-5 shadow-xl space-y-4 rounded">
            <div className="border-b border-neutral-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div>
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-0.5">
                  ORARIO FASE: {currentSlot?.timeRange || '08:30 - 08:45'} • DAY 0{activeDay}
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse" />
                  {displaySlotTitle}
                </h2>
              </div>
              <div className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-xs font-mono text-cyan-300 flex items-center gap-2 rounded">
                <span>Fase {activeSlotIndex + 1}/{dayMasterSlots.length}</span>
              </div>
            </div>

            {/* Single Focused Card for Student Team - Zero Scenario Details, Strict Environment Specification */}
            <div className={`border-2 p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all duration-300 ${envConfig.border} ${envConfig.bg} ${envConfig.glow} rounded`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded ${envConfig.badge}`}>
                    GRUPPO {studentGroup} • SQUADRA {currentDiscente.teamId}
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-300">
                    {studentGroup === 'A' ? 'DISC 01-15' : studentGroup === 'B' ? 'DISC 16-30' : studentGroup === 'C' ? 'DISC 31-45' : 'DISC 46-60'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-[11px] font-mono font-black uppercase tracking-widest border border-neutral-700 rounded ${envConfig.isBlinking ? 'text-white bg-red-950 animate-pulse' : 'text-neutral-200 bg-neutral-950'}`}>
                    {envConfig.phaseLabel}
                  </span>
                </div>
              </div>

              {/* Countdown widget for Pre-Allerta TCCC or Standby SR */}
              {showCountdown && (
                <div className="bg-yellow-950/80 border border-yellow-500 p-3 rounded shadow-md flex items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 animate-bounce" />
                    <div>
                      <span className="text-[11px] font-mono font-bold text-yellow-300 uppercase tracking-widest block">
                        {isPreAllertaTCCC ? 'COUNTDOWN PRE-ALLERTA TCCC' : 'COUNTDOWN STANDBY SHOCK ROOM'}
                      </span>
                      <p className="text-xs text-yellow-200 font-medium">
                        {isPreAllertaTCCC ? 'Preparazione e vestizione DPI TCCC in corso.' : 'Controllo presidi e standby attivo pre-handover Box Shock Room.'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-neutral-950 px-3 py-1.5 border border-yellow-500 rounded text-right">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase block">Tempo Mancante</span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-yellow-400 tracking-wider">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                </div>
              )}

              {/* ENVIRONMENT DISPLAY: SPECIFICHE SOLO AMBIENTE TCCC O SHOCK ROOM */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {envConfig.environmentType === 'TCCC' && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded shadow-sm">
                      <Crosshair className="w-3.5 h-3.5 animate-pulse" />
                      <span>AMBIENTE TCCC ASSEGNATO</span>
                    </div>
                  )}
                  {envConfig.environmentType === 'SHOCK_ROOM' && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-400 text-black font-black text-xs uppercase tracking-widest rounded shadow-sm">
                      <Stethoscope className="w-3.5 h-3.5 animate-pulse" />
                      <span>SHOCK ROOM ASSEGNATA</span>
                    </div>
                  )}
                  {envConfig.environmentType === 'WORKSHOP' && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded shadow-sm">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>POSTAZIONE WORKSHOP</span>
                    </div>
                  )}
                  {envConfig.environmentType === 'PAUSA' && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-500 text-black font-black text-xs uppercase tracking-widest rounded shadow-sm">
                      <Coffee className="w-3.5 h-3.5" />
                      <span>PAUSA OPERATIVA</span>
                    </div>
                  )}
                </div>

                <h3 className="text-white font-black text-2xl sm:text-3xl tracking-tight leading-none uppercase">
                  {envConfig.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-200 font-medium leading-relaxed">
                  {envConfig.subtitle}
                </p>
              </div>

              {/* Postazione e Faculty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="bg-neutral-950/90 p-3 sm:p-3.5 border border-neutral-800 space-y-2 text-xs rounded">
                  <div className="flex items-center gap-2 text-neutral-100 font-bold border-b border-neutral-800 pb-1.5">
                    <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Postazione Assegnata: <strong className="text-cyan-300 font-mono text-xs sm:text-sm">{envConfig.location}</strong></span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Faculty Tutor Assegnato (Rapporto 1:1):</span>
                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 font-mono text-xs rounded">
                      <span className="text-orange-400 font-black">{assignedFaculty?.name || 'Faculty Tutor'}</span>
                      <span className="text-neutral-300">{assignedFaculty?.badgeCode || 'FAC'} ({assignedFaculty?.title || 'Tutor'})</span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-950/90 p-3 sm:p-3.5 border border-neutral-800 space-y-1.5 text-xs rounded">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Tutte le Squadre del tuo Gruppo ({studentGroup}):</span>
                  <div className="space-y-1 pt-0.5">
                    {squadNumbers.map((sqNum) => {
                      const isStudentSquad = currentDiscente.teamId === sqNum;
                      const facMatch = faculty.find(f => f.assignedTeamId === sqNum) || faculty[sqNum - 1];
                      const facName = facMatch ? facMatch.name : `Faculty Sq ${sqNum}`;
                      return (
                        <div
                          key={sqNum}
                          className={`flex items-center justify-between px-2 py-1 border text-xs font-mono rounded ${
                            isStudentSquad
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                          }`}
                        >
                          <span>Squadra {sqNum} {isStudentSquad && '⭐ (La tua Sq)'}</span>
                          <span className="truncate max-w-[140px]">{facName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Protocollo Simulazione Cieca - Riservatezza Scenari Clinici */}
              <div className="bg-neutral-950/90 border border-neutral-800/80 p-2.5 sm:p-3 rounded flex items-start gap-2.5 text-xs font-mono text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-white font-bold block uppercase text-[10px] sm:text-[11px] tracking-wider">
                    PROTOCOLLO ADDESTRATIVO A CIECO
                  </span>
                  <p className="text-neutral-400 text-[10px] sm:text-[11px] leading-relaxed">
                    I dettagli clinici del caso e le condizioni del paziente simulato sono riservati alla Faculty didattica per preservare l'alta fedeltà e il realismo dell'ingaggio operativo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}


      {/* PERSONAL QR CODE PASS MODAL */}
      {showQRModal && currentDiscente && (
        <ParticipantQRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          person={currentDiscente}
          category="discenti"
        />
      )}

      {/* REGIA/DIREZIONE OPERATOR UNLOCK MODAL */}
      <OperatorUnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        roleLabel="Discente"
      />
    </div>
  );
};
