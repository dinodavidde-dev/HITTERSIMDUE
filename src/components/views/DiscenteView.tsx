import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  Radio,
  Scale,
  EyeOff,
  Flame,
} from 'lucide-react';
import { GroupType, Discente, TimelineSlot } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { DaySelectorToggle } from '../DaySelectorToggle';
import { ParticipantQRModal } from '../anagrafica/ParticipantQRModal';
import { OperatorUnlockModal } from '../common/OperatorUnlockModal';
import { PreCoursePublicCountdown } from '../common/PreCoursePublicCountdown';
import { DiscentePersonalTimeline } from './DiscentePersonalTimeline';
import { translateSlot, translateLocation } from '../../utils/courseTranslation';
import { StaffBalancingModal } from '../common/StaffBalancingModal';
import { balanceDiscentiWorkload, BalancingReport } from '../../utils/staffBalancer';
import { MascalTriageGuideCard } from '../discente/MascalTriageGuideCard';
import { TimelineSyncNavigator } from '../common/TimelineSyncNavigator';
import { useCourseAuthorization } from '../../hooks/useCourseAuthorization';
import { isParticipantMatch } from '../../utils/qrCodeUtils';

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
    currentSlot: masterCurrentSlot,
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
    bulkUpdateDiscenti,
    sendCourseMessage,
    canSelectOperator,
    language,
    isCourseStarted,
    courseStartSchedule,
    timeRemainingMs,
  } = useCourse();

  const { isTimelineInteractionLocked, isMacroBlockAwaitingAuth, isGateExpiredAwaitingAuth } = useCourseAuthorization();

  const isEn = language === 'en';
  const isPreCourse = !isCourseStarted || (courseStartSchedule?.isGateEnabled && timeRemainingMs > 0) || isGateExpiredAwaitingAuth;

  const [discentiBalancingReport, setDiscentiBalancingReport] = useState<BalancingReport<Discente> | null>(null);
  const [isBalancingModalOpen, setIsBalancingModalOpen] = useState(false);

  const currentDiscente =
    discenti.find((d) => isParticipantMatch(d, selectedDiscenteId)) ||
    discenti.find((d) => d.id === selectedDiscenteId) ||
    discenti[0] || {
      id: 'disc-1',
      name: 'Mario Rossi',
      role: 'Medico di Emergenza',
      teamId: 1,
      nationality: 'Italiana',
      badgeCode: 'DISC-01',
    };

  useEffect(() => {
    if (currentDiscente && currentDiscente.id !== selectedDiscenteId && isParticipantMatch(currentDiscente, selectedDiscenteId)) {
      setSelectedDiscenteId(currentDiscente.id);
    }
  }, [currentDiscente, selectedDiscenteId, setSelectedDiscenteId]);

  const studentGroup: GroupType = currentDiscente.teamId <= 3 ? 'A' : currentDiscente.teamId <= 6 ? 'B' : currentDiscente.teamId <= 9 ? 'C' : 'D';
  const groupLabel = studentGroup === 'A' ? 'ALPHA' : studentGroup === 'B' ? 'BRAVO' : studentGroup === 'C' ? 'CHARLIE' : 'DELTA';
  const assignedFaculty = faculty.find((f) => f && f.assignedTeamId === currentDiscente.teamId) || faculty[0];
  const isTeamLeader = (currentDiscente?.id || '') === `disc-${((currentDiscente?.teamId || 1) - 1) * 5 + 1}` || ((currentDiscente?.role || '').toLowerCase().includes('leader'));

  // Stato consultazione slot vs sincronizzazione live Regia
  const [inspectedSlot, setInspectedSlot] = useState<TimelineSlot | null>(null);

  const rawDayMasterSlots = INITIAL_TIMELINE_SLOTS.filter((s) => s.day === activeDay);
  const dayMasterSlots = rawDayMasterSlots.map((s) => translateSlot(s, language));
  const publicSlots = dayMasterSlots.filter((s) => !s.id.includes('setup'));

  const rawMasterCurrentSlot = INITIAL_TIMELINE_SLOTS[activeSlotIndex] || rawDayMasterSlots[0] || INITIAL_TIMELINE_SLOTS[0];
  const slotIdxInDay = dayMasterSlots.findIndex((s) => s.id === (masterCurrentSlot?.id || rawMasterCurrentSlot?.id));
  const effectiveSlotIdx = slotIdxInDay >= 0 ? slotIdxInDay : 0;
  const currentSlotInDay = dayMasterSlots[effectiveSlotIdx] || dayMasterSlots[0] || INITIAL_TIMELINE_SLOTS[0];

  let liveCurrentSlot = publicSlots.find((s) => s.id === currentSlotInDay?.id);
  if (!liveCurrentSlot && publicSlots.length > 0) {
    liveCurrentSlot = publicSlots[0];
  }
  if (!liveCurrentSlot) liveCurrentSlot = currentSlotInDay;

  const currentSlot = inspectedSlot || liveCurrentSlot;
  const isLiveSync = inspectedSlot === null || inspectedSlot.id === liveCurrentSlot?.id;

  const studentCurrentActivity = currentSlot?.groupActivities?.[studentGroup];

  const currentActTitleStr = (studentCurrentActivity?.title || '').toLowerCase();
  const currentActSubStr = (studentCurrentActivity?.subtitle || '').toLowerCase();
  const currentActLocStr = (studentCurrentActivity?.location || '').toLowerCase();
  const currentActTypeStr = (studentCurrentActivity?.activityType || '').toLowerCase();
  const actText = `${currentActTitleStr} ${currentActSubStr} ${currentActLocStr}`.toLowerCase();

  const isWorkshopActivity =
    actText.includes('workshop') ||
    actText.includes('ws1') ||
    actText.includes('ws2') ||
    actText.includes('skill station') ||
    currentActTypeStr === 'workshop';

  const isPauseOrResetActivity =
    actText.includes('pausa') ||
    actText.includes('pranzo') ||
    actText.includes('reset') ||
    actText.includes('riordino') ||
    actText.includes('turnaround') ||
    currentActTypeStr === 'pause';

  const isSetupOrPlenary =
    actText.includes('setup') ||
    actText.includes('patto d\'aula') ||
    actText.includes('accoglienza') ||
    actText.includes('plenaria');

  const isCurrentTCCC = !isWorkshopActivity && !isPauseOrResetActivity && !isSetupOrPlenary && (
    actText.includes('tccc') ||
    actText.includes('tattic') ||
    actText.includes('tactical') ||
    actText.includes('under fire') ||
    currentActTypeStr === 'scenario_extra'
  );

  const isCurrentShockRoom = !isWorkshopActivity && !isPauseOrResetActivity && !isSetupOrPlenary && (
    actText.includes('shock') ||
    actText.includes('ospedale da campo') ||
    currentActTypeStr === 'scenario_intra'
  );

  const isPreAllerta = (isCurrentTCCC || isCurrentShockRoom) && (
    actText.includes('pre-alert') ||
    actText.includes('pre-allerta') ||
    actText.includes('preallerta') ||
    actText.includes('standby') ||
    actText.includes('t -15') ||
    actText.includes('t-15')
  );

  const isDebriefingPhase = (isCurrentTCCC || isCurrentShockRoom) && (
    actText.includes('debriefing') ||
    currentActTypeStr.includes('debriefing')
  );

  // Scenario active phase: Pre-Allerta (T-15) -> Practical Scenario / Handover -> Debriefing (Pt 1 & Pt 2)
  // Ends strictly at Reset Tecnico, Turnaround, Pause, Workshop, or subsequent block
  const isScenarioActivePhase = !isPreCourse && (isCurrentTCCC || isCurrentShockRoom) && !isPauseOrResetActivity && !isWorkshopActivity && !isSetupOrPlenary;

  // Current scenario type (TCCC vs SHOCKROOM)
  const currentScenarioType: 'TCCC' | 'SHOCKROOM' | null = isCurrentTCCC ? 'TCCC' : isCurrentShockRoom ? 'SHOCKROOM' : null;

  // Ruolo operativo assegnato dal Faculty (activeScenarioRole o assignedRole)
  const currentAssignedRole = currentDiscente.activeScenarioRole || currentDiscente.assignedRole;

  // Has the Faculty actually assigned the role for THIS scenario?
  // Crucial requirement: must be during TCCC or Shock Room scenario phase AND assigned by Faculty
  const hasFacultyAssigned = Boolean(
    currentAssignedRole &&
    currentScenarioType &&
    (currentDiscente.activeScenarioType === currentScenarioType || currentDiscente.activeScenarioAssignedBy)
  );

  // Crucial requirement: Show role ONLY AFTER assignment by Faculty, and KEEP IT VISIBLE UNTIL THE END OF THE DEBRIEFING
  // Keep local memory for the active scenario so that when Firestore cleans up during debriefing/completion,
  // the discente STILL sees the assigned role through the debriefing phase until reset/turnaround/workshop!
  const [cachedDebriefRole, setCachedDebriefRole] = useState<{ role: string; type?: string } | null>(null);

  useEffect(() => {
    if (hasFacultyAssigned && currentAssignedRole) {
      setCachedDebriefRole({
        role: currentAssignedRole,
        type: currentDiscente.activeScenarioType || currentScenarioType || undefined,
      });
    } else if (!isScenarioActivePhase || isPauseOrResetActivity || isWorkshopActivity) {
      setCachedDebriefRole(null);
    }
  }, [hasFacultyAssigned, currentAssignedRole, isScenarioActivePhase, isPauseOrResetActivity, isWorkshopActivity, currentDiscente.activeScenarioType, currentScenarioType]);

  const activeRoleName = (hasFacultyAssigned ? currentAssignedRole : undefined) || (isDebriefingPhase && cachedDebriefRole ? cachedDebriefRole.role : undefined);

  // Crucial requirement: Show role ONLY starting from Pre-Allerta of TCCC or Shock Room, and ONLY AFTER assignment by Faculty
  const isScenarioRoleActive = Boolean(
    activeRoleName &&
    isScenarioActivePhase &&
    (hasFacultyAssigned || (isDebriefingPhase && cachedDebriefRole))
  );

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

  // Pre-Course Standby: Only show personal Anagrafica & Public Countdown until course is started by Regia
  if (isPreCourse) {
    return (
      <div className="space-y-4 pb-12 max-w-5xl mx-auto px-2 sm:px-4 font-mono">
        {/* Header Banner - Nascosto quando aperta da QR Code */}
        {!isFromQR && (
          <div className="bg-neutral-900 border-2 border-cyan-500/60 p-3 sm:p-4 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="px-2.5 sm:px-3 py-1 bg-cyan-600 text-black font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 rounded">
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {isEn ? 'LEARNER VIEW' : 'VISUALE DISCENTE'}
              </span>
              <span className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[11px] sm:text-xs font-bold rounded flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>DAY 0{activeDay}</span>
              </span>
              <span className="px-2 py-0.5 bg-neutral-950 text-amber-400 font-mono text-[11px] sm:text-xs border border-amber-800/80 flex items-center gap-1.5 rounded">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" /> {isEn ? 'PRE-COURSE STANDBY' : 'STANDBY PRE-CORSO'}
              </span>
              {(!isCourseStarted || isTimelineInteractionLocked) && (
                <span className="px-2.5 py-0.5 bg-amber-950/80 border border-amber-500/80 text-amber-300 font-mono text-[10px] sm:text-xs font-bold uppercase rounded flex items-center gap-1.5 shadow-sm animate-pulse">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{isEn ? 'WAITING FOR AUTHORIZATION' : 'IN ATTESA DI AUTORIZZAZIONE'}</span>
                </span>
              )}
            </div>

            {/* Discente Selector */}
            {canSelectOperator ? (
              <div className="flex items-center gap-2 flex-wrap bg-cyan-950/40 p-1.5 border border-cyan-700/50 rounded">
                <span className="text-xs font-mono text-cyan-300 uppercase font-bold flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {isEn ? 'Select:' : 'Seleziona:'}
                </span>
                <select
                  value={selectedDiscenteId}
                  onChange={(e) => setSelectedDiscenteId(e.target.value)}
                  className="bg-neutral-950 text-cyan-300 font-mono text-xs border border-cyan-700/60 px-2.5 py-1.5 rounded focus:outline-none focus:border-cyan-400 max-w-full sm:max-w-xs cursor-pointer font-bold"
                >
                  {discenti.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.badgeCode || 'DISC'} • {d.name} ({isEn ? 'Team' : 'Sq.'} {d.teamId})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-neutral-950 text-cyan-300 font-mono text-xs border border-cyan-800/80 rounded flex items-center gap-1.5 shadow-inner">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-cyan-400/80">{isEn ? 'Learner:' : 'Discente:'}</span>
                  <strong className="text-white text-xs">{currentDiscente.badgeCode || 'DISC'} • {currentDiscente.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(true)}
                  title={isEn ? 'Unlock Selector (Control / Direction)' : 'Sblocca Selettore (Regia / Direzione)'}
                  className="p-1.5 text-neutral-500 hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* BARRA COMANDI OPERATIVA: BILANCIAMENTO ANAGRAFICA DISCENTI               */}
        {/* ========================================================================= */}
        <div className="bg-neutral-950 border-2 border-emerald-500/80 p-3.5 sm:p-4 rounded-xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2 py-0.5 bg-emerald-600 text-black font-black uppercase tracking-wider rounded">
                MOTORE DI BILANCIAMENTO
              </span>
              <span className="text-emerald-300 font-bold">
                Anagrafica Discenti ({discenti.length} Allievi • DISC-01..60)
              </span>
              <span className="px-2 py-0.2 bg-black border border-emerald-500/40 text-neutral-300 text-[10px] rounded">
                4 Macro-Gruppi & 12 Squadre (1 TL + 4 Op)
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans max-w-3xl leading-relaxed">
              Distribuzione omogenea per carico orario, bilanciamento dei 4 Macro-Gruppi (ALPHA, BRAVO, CHARLIE, DELTA da 15 allievi) e delle 12 Squadre da 5 allievi con alternanza del ruolo di Team Leader tra Day 2 e Day 3.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const report = balanceDiscentiWorkload(discenti);
              setDiscentiBalancingReport(report);
              setIsBalancingModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider rounded cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all shrink-0 border border-emerald-400"
          >
            <Scale className="w-4 h-4 text-black shrink-0" />
            <span>⚖️ Ribilancia Macro-Gruppi & TL</span>
          </button>
        </div>

        {/* ANAGRAFICA COMPLETA DEL DISCENTE */}
        <div className="bg-neutral-950 border-2 border-cyan-500/80 p-3.5 sm:p-5 rounded-xl shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Nome, Cognome, Matricola e Ruolo */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-cyan-500 text-black font-mono font-black text-xs sm:text-sm rounded shadow-xs">
                  {currentDiscente.badgeCode || 'DISC-01'}
                </span>
                <h1 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {currentDiscente.name}
                </h1>
                <span className="px-2.5 py-1 font-mono text-[11px] font-bold rounded border bg-neutral-900 text-neutral-400 border-neutral-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? 'Role: Assigned in Pre-Alert by Faculty' : 'Ruolo: Assegnato in Pre-Allerta dal Faculty'}</span>
                </span>
              </div>
              <div className="pt-2 mt-2 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">{isEn ? 'Nationality:' : 'Nazionalità:'}</span>
                  <strong className={currentDiscente.nationality ? 'text-white' : 'text-neutral-500 italic'}>
                    {currentDiscente.nationality || (isEn ? 'Not specified' : 'Non specificata')}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">{isEn ? 'Organization:' : 'Ente / Struttura:'}</span>
                  <strong className={`truncate block ${currentDiscente.organization ? 'text-white' : 'text-neutral-500 italic'}`} title={currentDiscente.organization || undefined}>
                    {currentDiscente.organization || (isEn ? 'To be filled' : 'Da compilare')}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">{isEn ? 'Phone / Radio:' : 'Telefono / Radio:'}</span>
                  <strong className={currentDiscente.phone ? 'text-cyan-300' : 'text-neutral-500 italic'}>
                    {currentDiscente.phone || (isEn ? 'To be filled' : 'Da compilare')}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Email:</span>
                  <strong className={`truncate block ${currentDiscente.email ? 'text-cyan-200' : 'text-neutral-500 italic'}`} title={currentDiscente.email || undefined}>
                    {currentDiscente.email || (isEn ? 'To be filled' : 'Da compilare')}
                  </strong>
                </div>
              </div>
            </div>

            {/* Info Integrate: Gruppo, Squadra, Faculty Tutor & Pass QR */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded flex items-center gap-2 text-xs font-mono">
                <span className="text-neutral-400 text-[11px]">{isEn ? 'Group:' : 'Gruppo:'}</span>
                <strong className="text-cyan-400 font-bold">{isEn ? `GROUP ${groupLabel}` : `GRUPPO ${groupLabel}`}</strong>
              </div>

              <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded flex items-center gap-2 text-xs font-mono">
                <span className="text-neutral-400 text-[11px]">{isEn ? 'Team:' : 'Squadra:'}</span>
                <strong className="text-white">{isEn ? `Team ${currentDiscente.teamId}` : `Squadra ${currentDiscente.teamId}`}</strong>
              </div>

              <div className="px-3 py-1.5 bg-neutral-900 border border-orange-500/50 rounded flex items-center gap-2 text-xs font-mono" title={assignedFaculty?.name}>
                <span className="text-neutral-400 text-[11px]">Faculty:</span>
                <strong className="text-orange-400">{assignedFaculty?.badgeCode || 'FAC'} • {assignedFaculty?.name || 'Tutor'}</strong>
              </div>

              <button
                type="button"
                onClick={() => setShowCourseTimeline(!showCourseTimeline)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs border ${
                  showCourseTimeline
                    ? 'bg-cyan-500 text-black border-cyan-400 font-black'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border-neutral-700'
                }`}
                title={isEn ? 'View My Timeline' : 'Visualizza La Mia Timeline'}
              >
                <Calendar className="w-4 h-4" />
                <span>{showCourseTimeline ? (isEn ? 'Close Timeline' : 'Chiudi Timeline') : (isEn ? 'My Timeline' : 'La Mia Timeline')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQRModal(true)}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 text-xs font-mono font-bold uppercase flex items-center gap-1.5 rounded transition-colors cursor-pointer shadow-xs"
                title={isEn ? 'View QR Code Pass' : 'Visualizza QR Code Pass'}
              >
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span>{isEn ? 'QR Pass' : 'Pass QR'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* COUNTDOWN PUBBLICO UFFICIALE */}
        <PreCoursePublicCountdown />

        {/* TIMELINE PERSONALE DEL DISCENTE (OPZIONALE IN CONSULTAZIONE STANDBY) */}
        {showCourseTimeline && (
          <div className="space-y-3 pt-2">
            <DiscentePersonalTimeline
              discente={currentDiscente}
              assignedFaculty={assignedFaculty}
              currentActiveSlotId={currentSlot?.id}
              activeDay={activeDay}
              onSelectSlot={(slotId) => {
                const found = INITIAL_TIMELINE_SLOTS.find((s) => s.id === slotId);
                if (found) setInspectedSlot(translateSlot(found, language));
              }}
              inspectedSlotId={inspectedSlot?.id}
            />
          </div>
        )}

        {/* Modals */}
        {showQRModal && currentDiscente && (
          <ParticipantQRModal
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            person={currentDiscente}
            category="discenti"
          />
        )}
        <OperatorUnlockModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          roleLabel={isEn ? 'Learner' : 'Discente'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 max-w-5xl mx-auto px-2 sm:px-4">
      {/* Header Banner - Nascosto quando aperta da QR Code */}
      {!isFromQR && (
        <div className="bg-neutral-900 border-2 border-cyan-500/60 p-3 sm:p-4 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="px-2.5 sm:px-3 py-1 bg-cyan-600 text-black font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 rounded">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {isEn ? 'LEARNER VIEW' : 'VISUALE DISCENTE'}
            </span>

            <span className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[11px] sm:text-xs font-bold rounded flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>DAY 0{activeDay}</span>
            </span>
            <span className="px-2 py-0.5 bg-neutral-950 text-cyan-400 border border-neutral-800 font-mono text-[11px] sm:text-xs flex items-center gap-1.5 rounded">
              <Clock className={`w-3 h-3 ${isTimerRunning ? 'text-cyan-400 animate-spin' : 'text-neutral-400'}`} /> {isEn ? 'T-Phase:' : 'T-Fase:'} {formatTimer(timerSeconds)}
            </span>
            {isTimelineInteractionLocked && (
              <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-500/80 text-amber-300 font-mono text-[10px] sm:text-xs font-bold rounded flex items-center gap-1.5 shadow-sm">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{isEn ? 'STANDBY: AWAITING REGIA' : 'STANDBY: IN ATTESA REGIA'}</span>
              </span>
            )}
          </div>

          {/* Discente Selector - visible ONLY when opened by Regia or Direttore */}
          {canSelectOperator ? (
            <div className="flex items-center gap-2 flex-wrap bg-cyan-950/40 p-1.5 border border-cyan-700/50 rounded">
              <span className="text-xs font-mono text-cyan-300 uppercase font-bold flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {isEn ? 'Select:' : 'Seleziona:'}
              </span>
              <select
                value={selectedDiscenteId}
                onChange={(e) => setSelectedDiscenteId(e.target.value)}
                className="bg-neutral-950 text-cyan-300 font-mono text-xs border border-cyan-700/60 px-2.5 py-1.5 rounded focus:outline-none focus:border-cyan-400 max-w-full sm:max-w-xs cursor-pointer font-bold"
              >
                {discenti.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.badgeCode || 'DISC'} • {d.name} ({isEn ? 'Team' : 'Sq.'} {d.teamId})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-neutral-950 text-cyan-300 font-mono text-xs border border-cyan-800/80 rounded flex items-center gap-1.5 shadow-inner">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-cyan-400/80">{isEn ? 'Learner:' : 'Discente:'}</span>
                <strong className="text-white text-xs">{currentDiscente.badgeCode || 'DISC'} • {currentDiscente.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowUnlockModal(true)}
                title={isEn ? 'Unlock Selector (Control / Direction)' : 'Sblocca Selettore (Regia / Direzione)'}
                className="p-1.5 text-neutral-500 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {isMacroBlockAwaitingAuth && (
        <div className="p-3 bg-red-950/90 border-2 border-red-500 text-red-200 rounded-lg flex items-center justify-between gap-3 font-mono text-xs shadow-md">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span className="font-bold uppercase">
              {isEn ? 'SCENARIO MACRO-BLOCK IN STANDBY: Awaiting Control Room confirmation to begin rotation.' : 'BLOCCO SCENARIO IN STANDBY: In attesa di autorizzazione di avvio dalla Regia.'}
            </span>
          </div>
          <span className="px-2 py-0.5 bg-red-900 text-white text-[10px] uppercase font-black rounded shrink-0">
            {isEn ? 'READ-ONLY STANDBY' : 'STANDBY SOLA LETTURA'}
          </span>
        </div>
      )}

      {/* INTESTAZIONE PERSONALIZZATA MINIMIZZATA: NOME E COGNOME, INFO FACULTY, GRUPPO E SQUADRA */}
      <div className="bg-neutral-950 border-2 border-cyan-500/80 p-3 sm:p-4 rounded shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Nome, Cognome, Matricola e Ruolo */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-cyan-600 text-black font-mono font-black text-xs rounded">
                {currentDiscente.badgeCode || 'DISC-01'}
              </span>
              <h1 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
                {currentDiscente.name}
              </h1>
              {(!isCourseStarted || isTimelineInteractionLocked) && (
                <span className="px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] font-black uppercase rounded border bg-amber-950/90 text-amber-300 border-amber-500 flex items-center gap-1.5 shadow-sm animate-pulse">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{isEn ? 'WAITING FOR AUTHORIZATION' : 'IN ATTESA DI AUTORIZZAZIONE'}</span>
                  <span className="text-[9px] px-1 py-0.2 bg-amber-900/60 text-amber-200 rounded font-normal">
                    {isEn ? 'READ-ONLY' : 'SOLA LETTURA'}
                  </span>
                </span>
              )}
              {isScenarioRoleActive ? (
                <span className="px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] font-black rounded border bg-cyan-950 text-cyan-300 border-cyan-500 flex items-center gap-1 shadow-sm animate-pulse-slow">
                  <span className="text-yellow-400">⚡</span>
                  <span>{activeRoleName}</span>
                </span>
              ) : isScenarioActivePhase ? (
                <span className="px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-bold rounded border bg-amber-950/80 text-amber-300 border-amber-600 flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{isEn ? 'Role: Pending Faculty assignment' : 'Ruolo: In attesa del Faculty'}</span>
                </span>
              ) : isWorkshopActivity ? (
                <span className="px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-bold rounded border bg-neutral-900 text-cyan-400 border-neutral-800 flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-cyan-400" />
                  <span>{studentCurrentActivity?.title || 'Workshop'}</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-bold rounded border bg-neutral-900 text-neutral-400 border-neutral-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span>{studentCurrentActivity?.title || (isEn ? 'Break / Standby' : 'Pausa / Standby')}</span>
                </span>
              )}
            </div>
            <div className="pt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-neutral-400">
              <span>
                <span className="text-neutral-500">{isEn ? 'Naz: ' : 'Naz: '}</span>
                <span className={currentDiscente.nationality ? 'text-neutral-200' : 'text-neutral-500 italic'}>
                  {currentDiscente.nationality || (isEn ? 'Not specified' : 'Non specificata')}
                </span>
              </span>
              <span className="text-neutral-700">•</span>
              <span>
                <span className="text-neutral-500">{isEn ? 'Ente: ' : 'Ente: '}</span>
                <span className={currentDiscente.organization ? 'text-neutral-200' : 'text-neutral-500 italic'}>
                  {currentDiscente.organization || (isEn ? 'To be filled' : 'Da compilare')}
                </span>
              </span>
              <span className="text-neutral-700">•</span>
              <span>
                <span className="text-neutral-500">Tel: </span>
                <span className={currentDiscente.phone ? 'text-cyan-300' : 'text-neutral-500 italic'}>
                  {currentDiscente.phone || (isEn ? 'To be filled' : 'Da compilare')}
                </span>
              </span>
              <span className="text-neutral-700">•</span>
              <span>
                <span className="text-neutral-500">Email: </span>
                <span className={currentDiscente.email ? 'text-cyan-200' : 'text-neutral-500 italic'}>
                  {currentDiscente.email || (isEn ? 'To be filled' : 'Da compilare')}
                </span>
              </span>
            </div>
          </div>

          {/* Info Integrate nel riquadro: Faculty, Gruppo, Squadra & Azioni */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Gruppo */}
            <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded flex items-center gap-1.5 text-xs font-mono">
              <span className="text-neutral-400 text-[11px]">{isEn ? 'Group:' : 'Gruppo:'}</span>
              <strong className="text-cyan-400 font-bold">{isEn ? `GROUP ${groupLabel}` : `GRUPPO ${groupLabel}`}</strong>
            </div>

            {/* Squadra */}
            <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded flex items-center gap-1.5 text-xs font-mono">
              <span className="text-neutral-400 text-[11px]">{isEn ? 'Team:' : 'Squadra:'}</span>
              <strong className="text-white">{isEn ? `Team ${currentDiscente.teamId}` : `Squadra ${currentDiscente.teamId}`}</strong>
            </div>

            {/* Faculty Tutor */}
            <div className="px-2.5 py-1 bg-neutral-900 border border-orange-500/40 rounded flex items-center gap-1.5 text-xs font-mono" title={assignedFaculty?.name}>
              <span className="text-neutral-400 text-[11px]">Faculty:</span>
              <strong className="text-orange-400">{assignedFaculty?.badgeCode || 'FAC'} • {assignedFaculty?.name || 'Tutor'}</strong>
            </div>

            {/* Opzione Timeline Personale & QR Pass */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto mt-1 sm:mt-0">
              <button
                type="button"
                onClick={() => setShowCourseTimeline(!showCourseTimeline)}
                className={`flex-1 sm:flex-initial min-h-[40px] px-3 py-1.5 text-xs font-mono font-black uppercase flex items-center justify-center gap-1.5 rounded transition-colors cursor-pointer border ${
                  showCourseTimeline
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow'
                    : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border-cyan-700/70'
                }`}
                title={isEn ? 'Show personalized operational timeline for both course days' : 'Mostra la timeline operativa personalizzata per le due giornate del corso'}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{showCourseTimeline ? (isEn ? 'Close' : 'Chiudi') : (isEn ? 'My Timeline' : 'La Mia Timeline')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQRModal(true)}
                className="min-h-[40px] px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-mono font-bold uppercase flex items-center gap-1.5 rounded transition-colors cursor-pointer"
                title={isEn ? 'View QR Code Pass' : 'Visualizza QR Code Pass'}
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isEn ? 'QR Pass' : 'Pass QR'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Informazioni sintetiche di stato temporale quando aperta da QR Code */}
        {isFromQR && (
          <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>DAY 0{activeDay} • {isEn ? 'PHASE' : 'FASE'} {effectiveSlotIdx + 1}/{dayMasterSlots.length}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-cyan-400">{isEn ? 'T-Phase:' : 'T-Fase:'} {formatTimer(timerSeconds)}</span>
            </div>
            <div className="text-neutral-400">
              {isEn ? 'Personal Operational View' : 'Visuale Personale Operativa'}
            </div>
          </div>
        )}
      </div>

      {/* Sincronizzazione automatica con timeline di Regia e navigatore consultazione slot */}
      <TimelineSyncNavigator
        currentSlot={currentSlot}
        masterCurrentSlot={liveCurrentSlot}
        isLiveSync={isLiveSync}
        onSelectSlot={(slot) => setInspectedSlot(slot)}
        onSyncToLive={() => setInspectedSlot(null)}
        roleLabel={isEn ? `Learner (${currentDiscente.badgeCode})` : `Discente (${currentDiscente.badgeCode})`}
        stationContext={
          isScenarioRoleActive && activeRoleName
            ? (isEn
                ? `Group ${groupLabel} • Team ${currentDiscente.teamId} (${activeRoleName})`
                : `Gruppo ${groupLabel} • Squadra ${currentDiscente.teamId} (${activeRoleName})`)
            : (isEn
                ? `Group ${groupLabel} • Team ${currentDiscente.teamId}`
                : `Gruppo ${groupLabel} • Squadra ${currentDiscente.teamId}`)
        }
      />

      {/* BANNER TATTICO RUOLO OPERATIVO SCENARIO IN EVIDENZA (VISIBILE FINO ALLA FINE DEL DEBRIEFING) */}
      {isScenarioRoleActive && (
        <div
          className={`border-2 p-3.5 sm:p-4 rounded shadow-2xl transition-all font-mono relative overflow-hidden ${
            isCurrentTCCC
              ? 'bg-orange-950/70 border-orange-500 shadow-orange-950/80 ring-2 ring-orange-500/60'
              : 'bg-cyan-950/70 border-cyan-400 shadow-cyan-950/80 ring-2 ring-cyan-400/60'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                    isDebriefingPhase
                      ? 'bg-purple-600 text-white'
                      : isCurrentTCCC
                      ? 'bg-orange-600 text-white animate-pulse'
                      : 'bg-cyan-400 text-black animate-pulse'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {isDebriefingPhase
                    ? (isEn ? 'SCENARIO DEBRIEFING • ROLE ACTIVE' : 'DEBRIEFING SCENARIO • RUOLO ATTIVO')
                    : (isEn ? 'TACTICAL SCENARIO ROLE ASSIGNED' : 'RUOLO OPERATIVO SCENARIO ASSEGNATO')}
                </span>

                <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-700 text-neutral-300 text-[10px] font-bold rounded flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  {isCurrentTCCC ? 'AMBIENTE TATTICO (TCCC)' : 'OSPEDALE DA CAMPO (SHOCK ROOM)'}
                </span>

                <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-400 text-[10px] rounded">
                  Faculty: {assignedFaculty?.badgeCode || 'FAC'} ({assignedFaculty?.name})
                </span>

                {currentDiscente.activeScenarioAssignedBy?.includes('RANDOM') && (
                  <span className="px-2 py-0.5 bg-purple-950 border border-purple-500 text-purple-200 text-[10px] font-bold rounded flex items-center gap-1">
                    🎲 {isEn ? 'RANDOM ASSIGNMENT (T-15)' : 'ASSEGNAZIONE RANDOM (FINE T-15)'}
                  </span>
                )}
              </div>

              <div className="pt-0.5 flex items-baseline gap-2 flex-wrap">
                <span className="text-xs text-neutral-400 uppercase font-semibold">
                  {isEn ? 'Your Operational Role:' : 'Il Tuo Ruolo nello Scenario:'}
                </span>
                <h2
                  className={`text-lg sm:text-2xl font-black uppercase tracking-tight ${
                    isCurrentTCCC ? 'text-orange-300' : 'text-cyan-300'
                  }`}
                >
                  ⚡ {activeRoleName}
                </h2>
              </div>

              <p className="text-[11px] text-neutral-300">
                {isDebriefingPhase
                  ? (isEn
                      ? 'Debriefing phase: role kept active for video review and clinical/tactical debriefing until session end.'
                      : 'Fase di Debriefing: ruolo mantenuto visibile per la revisione video NTS e il debriefing clinico con il Faculty fino al termine della sessione.')
                  : (isEn
                      ? 'Role active for practical phase and visible continuously until the end of debriefing.'
                      : 'Ruolo operativo assegnato dal Faculty. Attivo e visibile per l’intera durata dello scenario e del debriefing.')}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="px-3 py-1.5 bg-neutral-950/90 border border-neutral-800 rounded text-right font-mono">
                <span className="text-[9px] text-neutral-500 uppercase block font-bold">
                  {isEn ? 'Status' : 'Stato'}
                </span>
                <span className={`text-xs font-black flex items-center gap-1 ${isDebriefingPhase ? 'text-purple-400' : 'text-emerald-400'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isDebriefingPhase ? 'text-purple-400' : 'text-emerald-400'}`} />
                  {isDebriefingPhase ? (isEn ? 'IN DEBRIEFING' : 'IN DEBRIEFING') : (isEn ? 'ENGAGED' : 'OPERATIVO')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BANNER ATTESA ASSEGNAZIONE RUOLO SE IN FASE SCENARIO E NON ANCORA TRASMESSO */}
      {isScenarioActivePhase && !activeRoleName && (
        <div className="border-2 border-amber-500/80 bg-amber-950/40 p-3.5 sm:p-4 rounded shadow-xl transition-all font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 bg-amber-500 text-black shadow-sm animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  {isEn ? 'ROLE ASSIGNMENT PENDING' : 'ASSEGNAZIONE RUOLO IN CORSO'}
                </span>
                <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-700 text-neutral-300 text-[10px] font-bold rounded flex items-center gap-1">
                  <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                  {isCurrentTCCC ? 'AMBIENTE TATTICO (TCCC)' : 'OSPEDALE DA CAMPO (SHOCK ROOM)'}
                </span>
                <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-400 text-[10px] rounded">
                  Faculty: {assignedFaculty?.badgeCode || 'FAC'} ({assignedFaculty?.name})
                </span>
              </div>
              <div className="pt-0.5 flex items-baseline gap-2 flex-wrap">
                <span className="text-xs text-amber-400 uppercase font-semibold">
                  {isEn ? 'Awaiting Faculty Directive:' : 'In attesa del Faculty Tutor:'}
                </span>
                <h2 className="text-base sm:text-xl font-black text-amber-200 uppercase tracking-tight">
                  ⏳ {isEn ? 'Role not yet transmitted by Faculty' : 'Ruoli in corso di definizione dal Faculty'}
                </h2>
              </div>
              <p className="text-[11px] text-neutral-300">
                {isEn
                  ? `Faculty ${assignedFaculty?.name} is conferring on the 5 squad roles. Your specific role will appear here automatically upon transmission (or random assignment at end of T-15).`
                  : `Il Faculty ${assignedFaculty?.name} sta definendo i 5 ruoli operativi della squadra. Il tuo ruolo comparirà qui in tempo reale appena trasmesso dal Faculty (o tramite assegnazione random allo scadere del T-15).`}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="px-3 py-1.5 bg-neutral-950/90 border border-amber-800/80 rounded text-right font-mono">
                <span className="text-[9px] text-neutral-500 uppercase block font-bold">
                  {isEn ? 'Status' : 'Stato'}
                </span>
                <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  {isEn ? 'PENDING' : 'IN ATTESA'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEZIONE TIMELINE PERSONALIZZATA DELL'INTERO CORSO (DAY 2 & DAY 3) */}
      {showCourseTimeline && (
        <DiscentePersonalTimeline
          discente={currentDiscente}
          assignedFaculty={assignedFaculty}
          currentActiveSlotId={currentSlot?.id}
          activeDay={activeDay}
          onSelectSlot={(slotId) => {
            const found = INITIAL_TIMELINE_SLOTS.find((s) => s.id === slotId);
            if (found) setInspectedSlot(translateSlot(found, language));
          }}
          inspectedSlotId={inspectedSlot?.id}
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
                    {isEn ? `HITTER High Intensive Training Trauma Emergency Response • INTUBATI EM • TEAM ${currentDiscente.teamId}` : `H.I.T.T.E.R. High Intensive Training Trauma Emergency Response • INTUBATI EM • SQUADRA ${currentDiscente.teamId}`}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight pt-1">
                    {isEn ? 'AWAITING LEARNER COURSE OPENING' : 'ATTESA APERTURA CORSO DISCENTI'}
                  </h1>
                </div>

                <div className="bg-cyan-950/80 border border-cyan-600/80 p-4 rounded shadow-md max-w-lg mx-auto animate-pulse">
                  <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest block mb-1">
                    {isEn ? `OFFICIAL CONTROL ADVISORY • DAY 0${activeDay}` : `AVVISO UFFICIALE REGIA • DAY 0${activeDay}`}
                  </span>
                  <p className="text-base sm:text-xl font-black text-white uppercase tracking-wide">
                    {isEn ? 'LEARNER GATE OPENS AT 08:30' : 'IL GATE DISCENTI APRE ALLE 08:30'}
                  </p>
                </div>

                <div className="pt-1 space-y-2">
                  <p className="text-base sm:text-lg font-bold text-cyan-300 uppercase tracking-wider italic">
                    {isEn ? '"Check personal PPE and prepare for the initial briefing."' : '"Verificate i DPI personali e preparatevi per il briefing iniziale."'}
                  </p>
                  <p className="text-xs text-neutral-400 font-mono">
                    {isEn ? `Day ${activeDay} • Official opening awaited at 08:30` : `Day ${activeDay} • Attesa apertura ufficiale ore 08:30`}
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
                    {isEn ? `H.I.T.T.E.R. High Intensive Training Trauma Emergency Response • INTUBATI EM • TEAM ${currentDiscente.teamId}` : `H.I.T.T.E.R. High Intensive Training Trauma Emergency Response • INTUBATI EM • SQUADRA ${currentDiscente.teamId}`}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight pt-1">
                    {isMorningCountdown ? (isEn ? '30-MINUTE COUNTDOWN (08:00 - 08:30)' : 'COUNTDOWN 30 MINUTI (08:00 - 08:30)') : (isEn ? 'UPCOMING ACTIVITIES' : 'ATTIVITÀ IN ARRIVO')}
                  </h1>
                </div>

                {isMorningCountdown && (
                  <div className="bg-cyan-950/80 border border-cyan-500/70 p-3.5 rounded shadow-md max-w-lg mx-auto animate-pulse">
                    <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest block mb-0.5">
                      {isEn ? 'OFFICIAL CONTROL DIRECTIVE' : 'DISPOSIZIONE UFFICIALE REGIA'}
                    </span>
                    <p className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                      {isEn
                        ? `Team ${currentDiscente.teamId} is requested to join Faculty ${assignedFaculty?.name} (${assignedFaculty?.badgeCode || 'FAC'}).`
                        : `La Squadra ${currentDiscente.teamId} è invitata a raggiungere il Faculty ${assignedFaculty?.name} (${assignedFaculty?.badgeCode || 'FAC'}).`}
                    </p>
                  </div>
                )}

                <div className="py-4 px-6 bg-neutral-900/95 border-2 border-cyan-500/80 rounded shadow-inner inline-block my-1">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block mb-0.5">
                    {isMorningCountdown ? (isEn ? 'REMAINING TIME 30 MINUTES' : 'TEMPO RIMANENTE 30 MINUTI') : (isEn ? 'BLOCK COUNTDOWN' : 'COUNTDOWN BLOCCO')}
                  </span>
                  <div className="text-4xl sm:text-5xl font-mono font-black text-cyan-400 animate-pulse tracking-wider">
                    {formatCumulativeTimer(getCumulativeSeconds(isMorningCountdown, isNightToMorningCountdown))}
                  </div>
                </div>

                <div className="pt-1 space-y-1.5">
                  <p className="text-base sm:text-xl font-black text-cyan-300 uppercase tracking-wider italic">
                    "{isMorningCountdown ? (isEn ? 'Faculty contact and station setup in progress' : 'Contatto Faculty e posizionamento postazione in corso') : (isEn ? 'Block Start' : 'Avvio Blocco')}"
                  </p>
                  <p className="text-xs text-neutral-400 font-mono">
                    {isMorningCountdown && (isEn ? `Day ${activeDay} • 30-minute countdown to 08:30 opening` : `Day ${activeDay} • Countdown 30 minuti verso l'apertura delle 08:30`)}
                    {isNightToMorningCountdown && (isEn ? 'Transition Day 2 ➔ Day 3 (Deadline 08:30)' : 'Transizione Day 2 ➔ Day 3 (Scadenza 08:30)')}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        const act = studentCurrentActivity;
        if (!act) return null;

        // Verifica fasi speciali notturne del Day 2
        const isMascalActive = currentSlot?.id === 'd3-mascal-scenario' || currentSlot?.id === 'd2-mascal-scenario' || ((currentSlot?.id === 'd3-gate-discenti-notturno' || currentSlot?.id === 'd2-gate-discenti-notturno') && activeDay === 2);
        const isNightClassifiedPreGate = activeDay === 2 && (currentSlot?.id === 'd3-staff-briefing-notturno' || currentSlot?.id === 'd2-staff-briefing-notturno' || currentSlot?.id === 'd3-pausa-cena' || currentSlot?.id === 'd2-pausa-cena');
        const isNightChiusuraDay2 = activeDay === 2 && (currentSlot?.id === 'd3-chiusura' || (currentSlot?.period === 'notturno' && currentSlot?.id.includes('chiusura')));

        if (isNightClassifiedPreGate) {
          return (
            <div className="bg-neutral-900 border-2 border-red-600 p-4 sm:p-6 shadow-2xl space-y-4 rounded-xl font-mono">
              {/* Header Classificato */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-900/60 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 bg-red-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest rounded flex items-center gap-1.5 animate-pulse">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{isEn ? 'SECURITY CLEARANCE: CLASSIFIED' : 'LIVELLO DI SICUREZZA: CLASSIFICATO'}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-neutral-950 border border-red-500/60 text-red-300 font-mono text-[10px] sm:text-xs font-bold rounded">
                      DAY 02 • 20:00 - 23:00
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <EyeOff className="w-6 h-6 text-red-500 shrink-0 animate-pulse" />
                    <span>{isEn ? 'CLASSIFIED NIGHT SCENARIO' : 'SCENARIO NOTTURNO CLASSIFICATO'}</span>
                  </h2>
                </div>
                <div className="px-3 py-1 bg-red-950/80 border border-red-500 text-xs font-mono text-red-300 rounded self-start sm:self-auto font-bold">
                  {isEn ? 'STATUS: DETAILS REDACTED' : 'STATO: DETTAGLI OSCURATI'}
                </div>
              </div>

              {/* Box Oscurato con barre diagonali tattiche */}
              <div className="relative p-5 sm:p-7 rounded-lg border-2 border-red-500/70 bg-neutral-950 overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#000,#000_15px,#7f1d1d25_15px,#7f1d1d25_30px)] pointer-events-none" />
                <div className="relative z-10 space-y-4 max-w-3xl mx-auto text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-950 border-2 border-red-500 text-red-400 mx-auto shadow-lg">
                    <Lock className="w-6 h-6 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest block">
                      [ TOP SECRET • PROTOCOLLO RISERVATO REGIA ]
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-wide">
                      {isEn ? 'TACTICAL BLACKOUT & SCENARIO REDACTION' : 'OSCURAMENTO TATTICO SCENARIO NOTTURNO'}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
                    {isEn
                      ? 'All prosthetics, dynamic actors, simulated pathologies and tactical procedures are withheld by Master Control. Clinical and operational conditions will be decided on-demand in real-time. No prior scheduling is required or disclosed.'
                      : 'Tutte le protesi necessarie, gli attori, le patologie simulate e le procedure tattiche sono rigorosamente nascoste e verranno decise al momento dalla Centrale Regia. Nessuna programmazione statica è richiesta né divulgata prima dell\'ingaggio.'}
                  </p>

                  {/* Quadri Avvisi Convocazione Staff e Gate Discenti */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2 font-mono text-xs">
                    <div className="p-3 bg-neutral-900/90 border border-red-500/50 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{isEn ? 'STAFF CONVOCATION NOTICE' : 'AVVISO CONVOCAZIONE STAFF'}</span>
                      </span>
                      <p className="text-white font-black text-xs sm:text-sm">
                        {isEn ? 'ALL STAFF CONVOCATED BY 20:00' : 'TUTTO LO STAFF CONVOCATO ENTRO LE 20:00'}
                      </p>
                      <p className="text-[11px] text-neutral-400 font-sans">
                        {isEn
                          ? 'Technicians, Actors, Makeup Artists and Faculty must be on station for classified briefing and dynamic night staging.'
                          : 'Tecnici, Attori, Truccatori e Faculty convocati entro le ore 20:00 per briefing segreto di allestimento.'}
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-900/90 border border-cyan-500/50 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isEn ? 'LEARNERS GATE OPENING' : 'APERTURA GATE DISCENTI'}</span>
                      </span>
                      <p className="text-white font-black text-xs sm:text-sm">
                        {isEn ? 'GATE OPENS AT 20:30 • BRIEFING ON SCENE' : 'APERTURA GATE ORE 20:30 • BRIEFING VERBALE'}
                      </p>
                      <p className="text-[11px] text-neutral-400 font-sans">
                        {isEn
                          ? 'Gate opens at 20:30. Operational orders will be communicated strictly by voice upon arrival on scene.'
                          : 'Il gate discenti aprirà alle 20:30: le istruzioni operative saranno comunicate verbalmente all\'arrivo sul posto.'}
                      </p>
                    </div>
                  </div>

                  {/* Countdown Box verso le 20:30 */}
                  <div className="p-3 bg-neutral-900 border border-red-500/70 rounded-lg inline-block w-full max-w-md">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest block mb-0.5">
                      {isEn ? 'TIME REMAINING TO GATE OPENING (20:30):' : 'TEMPO RIMANENTE ALL\'APERTURA DEL GATE (ORE 20:30):'}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-red-400 tracking-wider">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 italic">
                    {isEn
                      ? 'Equip tactical boots, full PPE and headlamp before approaching the Central Gate.'
                      : 'Indossare calzature tattiche, DPI completi e torcia frontale prima di presentarsi al Gate Centrale.'}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        if (isMascalActive) {
          return (
            <div className="bg-neutral-900 border-2 border-red-600 p-4 sm:p-5 shadow-2xl space-y-4 rounded-xl font-mono">
              {/* Header MASCAL Attivo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-900/60 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 bg-red-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest rounded flex items-center gap-1.5 animate-pulse">
                      <Flame className="w-3.5 h-3.5 text-yellow-300" />
                      <span>{isEn ? 'ACTIVE MASCAL OPERATION' : 'OPERAZIONE MASCAL ATTIVA'}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-neutral-950 border border-red-500/60 text-red-300 font-mono text-[10px] sm:text-xs font-bold rounded">
                      21:00 - 23:00 • DAY 02
                    </span>
                    <span className="px-2 py-0.5 bg-red-950 text-red-200 border border-red-800 text-[10px] sm:text-xs font-bold rounded">
                      {isEn ? 'ALL 60 LEARNERS JOINT PHASE' : 'TUTTI I 60 DISCENTI CONGIUNTI (ALPHA, BRAVO, CHARLIE, DELTA)'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Crosshair className="w-6 h-6 text-red-500 shrink-0 animate-pulse" />
                    <span>{isEn ? 'NIGHT MASCAL SCENARIO' : 'SCENARIO NOTTURNO MASCAL'}</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-neutral-950 border border-red-500 text-right rounded">
                    <span className="text-[9px] text-neutral-400 uppercase block">{isEn ? 'SESSION TIME' : 'TEMPO SESSIONE'}</span>
                    <span className="text-lg font-black text-red-400 tracking-wider">{formatTimer(timerSeconds)}</span>
                  </div>
                </div>
              </div>

              {/* Informative briefing box */}
              <div className="p-3 bg-red-950/40 border border-red-600/60 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>{isEn ? 'FIELD RADIO DIRECTIVE • CH-1 CONTROL ROOM' : 'DIRETTIVA RADIO CAMPO • CH-1 REGIA'}</span>
                  </span>
                  <p className="text-xs text-neutral-200 font-sans">
                    {isEn
                      ? 'Mass casualty triage, immediate bleeding control and team stabilization. Follow verbal instructions from on-scene Faculty and Master Control.'
                      : 'Maxiafflusso di feriti con triage rapido, controllo emorragie e stabilizzazione di squadra. Seguire le istruzioni verbali impartite sul campo dalla Regia e dai Tutor Faculty.'}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-red-600 text-white font-mono font-black text-xs uppercase tracking-wider rounded shrink-0 self-start sm:self-auto shadow-sm">
                  {isEn ? 'NO STATIC PATIENT SCHEDULE' : 'GESTIONE FERITI ON-DEMAND'}
                </span>
              </div>

              {/* Schede di Triage MASCAL con Guida Decisionale a Step integrate direttamente */}
              <MascalTriageGuideCard />
            </div>
          );
        }

        if (isNightChiusuraDay2) {
          return (
            <div className="bg-neutral-900 border-2 border-amber-500 p-4 sm:p-6 shadow-2xl space-y-4 rounded-xl font-mono text-center">
              <div className="space-y-2">
                <span className="px-3 py-1 bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded inline-block">
                  {isEn ? 'DAY 2 COMPLETED • NIGHT REST' : 'DAY 2 CONCLUSO • RIPOSO NOTTURNO'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {isEn ? 'MASCAL COMPLETED • RESUMING AT 08:30 (DAY 3)' : 'SCENARIO MASCAL CONCLUSO • RIPRESA ORE 08:30 (DAY 3)'}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 font-sans max-w-xl mx-auto">
                  {isEn
                    ? 'Day 2 operations concluded at 23:00. The public countdown has resumed for Day 3 start at 08:30.'
                    : 'Le operazioni del Day 2 si sono concluse alle ore 23:00. Il countdown pubblico ha ripreso il conteggio per l\'apertura del Day 3 alle ore 08:30.'}
                </p>
              </div>

              <div className="p-4 bg-neutral-950 border border-amber-500/80 rounded-lg inline-block w-full max-w-md my-2">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest block mb-1">
                  {isEn ? 'TIME REMAINING UNTIL DAY 3 (08:30):' : 'TEMPO RIMANENTE ALL\'AVVIO DEL DAY 3 (08:30):'}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-wider">
                  {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>
          );
        }

        // Squad station number within the group (Squadra 1 -> 1, Squadra 2 -> 2, Squadra 3 -> 3)
        const stationNum = ((currentDiscente.teamId - 1) % 3) + 1;
        const text = `${act.title} ${act.subtitle} ${act.location}`.toLowerCase();
        const actType = act.activityType || '';

        // Determine environment classification strictly from the learner's own activity
        const isWS1 = text.includes('ws1') || text.includes('vie aeree') || text.includes('crico') || text.includes('airway');
        const isWS2 = text.includes('ws2') || text.includes('ecografia') || text.includes('fast') || text.includes('accessi') || text.includes('ultrasound');
        const isWorkshop = (actType === 'workshop' || text.includes('workshop') || isWS1 || isWS2) && !text.includes('tccc') && !text.includes('shock');

        const isTCCC =
          !isWorkshop &&
          (text.includes('tccc') ||
            text.includes('tattic') ||
            text.includes('tactical') ||
            actType === 'scenario_extra');

        const isShockRoom =
          !isWorkshop &&
          (text.includes('shock room') ||
            text.includes('box shock') ||
            text.includes('box sr') ||
            actType === 'scenario_intra');

        // Compute contiguous workshop block (start and end times) for unified single time display
        let wsStartTime = '';
        let wsEndTime = '';
        let wsDuration = 0;

        if (isWorkshop && currentSlot) {
          const currentSlotIndex = dayMasterSlots.findIndex((s) => s.id === currentSlot.id);
          if (currentSlotIndex !== -1) {
            let startIdx = currentSlotIndex;
            while (startIdx > 0) {
              const prevSlot = dayMasterSlots[startIdx - 1];
              const prevAct = prevSlot.groupActivities?.[studentGroup];
              const prevText = `${prevAct?.title || ''} ${prevAct?.subtitle || ''} ${prevAct?.location || ''}`.toLowerCase();
              const prevIsWs =
                (prevAct?.activityType === 'workshop' || prevText.includes('workshop') || prevText.includes('ws1') || prevText.includes('ws2')) &&
                !prevText.includes('shock') &&
                !prevText.includes('tccc') &&
                !prevText.includes('tattic');
              if (prevIsWs) {
                startIdx--;
              } else {
                break;
              }
            }

            let endIdx = currentSlotIndex;
            while (endIdx < dayMasterSlots.length - 1) {
              const nextSlot = dayMasterSlots[endIdx + 1];
              const nextAct = nextSlot.groupActivities?.[studentGroup];
              const nextText = `${nextAct?.title || ''} ${nextAct?.subtitle || ''} ${nextAct?.location || ''}`.toLowerCase();
              const nextIsWs =
                (nextAct?.activityType === 'workshop' || nextText.includes('workshop') || nextText.includes('ws1') || nextText.includes('ws2')) &&
                !nextText.includes('shock') &&
                !nextText.includes('tccc') &&
                !nextText.includes('tattic');
              if (nextIsWs) {
                endIdx++;
              } else {
                break;
              }
            }

            const firstSlot = dayMasterSlots[startIdx];
            const lastSlot = dayMasterSlots[endIdx];
            wsStartTime = (firstSlot?.timeRange || '').split('-')[0]?.trim() || '';
            wsEndTime = (lastSlot?.timeRange || '').split('-')[1]?.trim() || '';
            for (let k = startIdx; k <= endIdx; k++) {
              wsDuration += dayMasterSlots[k]?.durationMinutes || 0;
            }
          }
        }

        const isPreAllertaTCCC =
          isTCCC &&
          (text.includes('pre-alert') ||
            text.includes('pre-allerta') ||
            text.includes('preallerta') ||
            text.includes('t -15') ||
            text.includes('t-15'));

        const isStandbySR =
          isShockRoom &&
          (text.includes('pre-allerta') ||
            text.includes('pre-alert') ||
            text.includes('standby attivo') ||
            text.includes('pre-handover') ||
            text.includes('t -15') ||
            text.includes('t-15'));

        const isBriefingSR =
          isShockRoom && !isStandbySR && text.includes('briefing shock room');

        const isHandover = text.includes('handover') || text.includes('sbar');
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
              environmentBadge: isEn ? 'TCCC ENVIRONMENT' : 'AMBIENTE TCCC',
              phaseLabel: isEn ? 'SBAR HANDOVER 1:1 PHASE' : 'FASE HANDOVER SBAR 1:1',
              title: isEn ? 'TCCC ENVIRONMENT' : 'AMBIENTE TCCC',
              subtitle: isEn ? 'Stretcher handover with 1:1 SBAR report to Field Hospital (Shock Room).' : 'Consegna barellata con report SBAR 1:1 verso Ospedale da Campo (Shock Room).',
              location: isEn ? `Tactical Environment ${stationNum}` : `Ambiente Tattico ${stationNum}`,
              border: 'border-orange-500 animate-pulse border-3',
              bg: 'bg-orange-950/40',
              badge: 'bg-orange-600 text-white font-black animate-pulse',
              glow: 'shadow-orange-950/80 shadow-2xl',
              isBlinking: true,
            };
          } else if (isPreAllertaTCCC) {
            envConfig = {
              environmentType: 'TCCC',
              environmentBadge: isEn ? 'TCCC ENVIRONMENT' : 'AMBIENTE TCCC',
              phaseLabel: isEn ? 'TCCC PRE-ALERT (T -15)' : 'PRE-ALLERTA TCCC (T -15)',
              title: isEn ? 'TCCC ENVIRONMENT' : 'AMBIENTE TCCC',
              subtitle: isEn ? 'T-15 window: donning tactical PPE, reconnaissance and equipment preparation.' : 'Finestra T-15: vestizione DPI tattici, ricognizione e preparazione equipaggiamento.',
              location: isEn ? `Tactical Environment ${stationNum}` : `Ambiente Tattico ${stationNum}`,
              border: 'border-yellow-400 animate-pulse border-3',
              bg: 'bg-yellow-950/35',
              badge: 'bg-yellow-400 text-black font-black animate-pulse',
              glow: 'shadow-yellow-950/60 shadow-xl',
              isBlinking: true,
            };
          } else if (text.includes('debriefing')) {
            envConfig = {
              environmentType: 'TCCC',
              environmentBadge: isEn ? 'TCCC ENVIRONMENT' : 'AMBIENTE TCCC',
              phaseLabel: isEn ? 'TCCC OPERATIONAL DEBRIEFING' : 'DEBRIEFING OPERATIVO TCCC',
              title: isEn ? 'TCCC ENVIRONMENT' : 'AMBIENTE TCCC',
              subtitle: isEn ? 'Operational review and debriefing with the assigned Faculty Tutor.' : 'Revisione operativa e debriefing con il Tutor Faculty assegnato.',
              location: isEn ? `Tactical Environment ${stationNum}` : `Ambiente Tattico ${stationNum}`,
              border: 'border-purple-500 border-2',
              bg: 'bg-purple-950/35',
              badge: 'bg-purple-600 text-white font-black',
              glow: 'shadow-purple-950/60 shadow-xl',
              isBlinking: false,
            };
          } else {
            envConfig = {
              environmentType: 'TCCC',
              environmentBadge: isEn ? 'TCCC ENVIRONMENT' : 'AMBIENTE TCCC',
              phaseLabel: isEn ? 'ACTIVE TRAINING' : 'ADDESTRAMENTO ATTIVO',
              title: isEn ? 'TCCC ENVIRONMENT' : 'AMBIENTE TCCC',
              subtitle: isEn ? 'Casualty management in tactical environment directed by the Faculty Tutor.' : 'Gestione del ferito in ambiente tattico sotto la direzione del Tutor Faculty.',
              location: isEn ? `Tactical Environment ${stationNum}` : `Ambiente Tattico ${stationNum}`,
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
              phaseLabel: isEn ? 'SBAR HANDOVER 1:1 PHASE' : 'FASE HANDOVER SBAR 1:1',
              title: 'SHOCK ROOM',
              subtitle: isEn ? 'Receiving and taking charge of stretcher casualty with 1:1 SBAR report from TCCC.' : 'Ricezione e presa in carico del ferito barellato con report SBAR 1:1 da TCCC.',
              location: isEn ? `Shock Room Box ${stationNum}` : `Box Shock Room ${stationNum}`,
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
              phaseLabel: isEn ? 'PRE-ALERT SHOCK ROOM (T -15)' : 'PRE-ALLERTA SHOCK ROOM (T -15)',
              title: 'SHOCK ROOM',
              subtitle: isEn ? 'T-15 window (Min 15-30 before :30 Handover): Box staffing, equipment check, and active standby.' : 'Finestra T-15 (Min 15-30 prima di Handover :30): presidio Box, controllo presidi e standby attivo.',
              location: isEn ? `Shock Room Box ${stationNum}` : `Box Shock Room ${stationNum}`,
              border: 'border-yellow-400 animate-pulse border-3',
              bg: 'bg-yellow-950/35',
              badge: 'bg-yellow-400 text-black font-black animate-pulse',
              glow: 'shadow-yellow-950/60 shadow-xl',
              isBlinking: true,
            };
          } else if (isBriefingSR) {
            envConfig = {
              environmentType: 'SHOCK_ROOM',
              environmentBadge: 'SHOCK ROOM',
              phaseLabel: isEn ? 'SHOCK ROOM BRIEFING (MIN 00-15)' : 'BRIEFING SHOCK ROOM (MIN 00-15)',
              title: 'SHOCK ROOM',
              subtitle: isEn ? 'Preliminary Box briefing and equipment verification prior to T-15 Pre-Alert window.' : 'Briefing preliminare nel Box e verifica dotazioni in vista della Pre-Allerta T-15.',
              location: isEn ? `Shock Room Box ${stationNum}` : `Box Shock Room ${stationNum}`,
              border: 'border-cyan-500 border-2',
              bg: 'bg-cyan-950/30',
              badge: 'bg-cyan-500 text-black font-black',
              glow: 'shadow-cyan-950/60 shadow-xl',
              isBlinking: false,
            };
          } else if (text.includes('debriefing')) {
            envConfig = {
              environmentType: 'SHOCK_ROOM',
              environmentBadge: 'SHOCK ROOM',
              phaseLabel: isEn ? 'SHOCK ROOM CLINICAL DEBRIEFING' : 'DEBRIEFING CLINICO SHOCK ROOM',
              title: 'SHOCK ROOM',
              subtitle: isEn ? 'Collegial review and clinical debriefing with assigned Faculty Tutor.' : 'Revisione collegiale e debriefing clinico con il Tutor Faculty assegnato.',
              location: isEn ? `Shock Room Box ${stationNum}` : `Box Shock Room ${stationNum}`,
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
              phaseLabel: isEn ? 'ACTIVE TRAINING' : 'ADDESTRAMENTO ATTIVO',
              title: 'SHOCK ROOM',
              subtitle: isEn ? 'Advanced clinical resuscitation in Field Hospital with Faculty Tutor.' : 'Approccio clinico-rianimatorio avanzato in Ospedale da Campo con il Tutor Faculty.',
              location: isEn ? `Shock Room Box ${stationNum}` : `Box Shock Room ${stationNum}`,
              border: 'border-cyan-400 border-3',
              bg: 'bg-cyan-950/35',
              badge: 'bg-cyan-400 text-black font-black',
              glow: 'shadow-cyan-950/80 shadow-2xl',
              isBlinking: false,
            };
          }
        } else if (isWorkshop) {
          const wsName = isWS1 ? 'SKILL WORKSHOP 1 (WS1)' : isWS2 ? 'SKILL WORKSHOP 2 (WS2)' : (isEn ? 'SKILLS WORKSHOP' : 'SKILLS WORKSHOP');
          const wsLoc = isWS1
            ? (isEn ? 'Skills Lab WS1 Room' : 'Aula Skills Lab WS1')
            : isWS2
            ? (isEn ? 'Skills Lab WS2 Room' : 'Aula Skills Lab WS2')
            : (act.location ? translateLocation(act.location, language) : (isEn ? 'Workshop Room' : 'Aula Workshop'));
          envConfig = {
            environmentType: 'WORKSHOP',
            environmentBadge: wsName,
            phaseLabel: isEn ? 'PROCEDURAL WORKSHOP' : 'WORKSHOP PROCEDURALE',
            title: wsName,
            subtitle: isEn ? 'Procedural training and hands-on clinical skill maneuvers with Faculty Tutor.' : 'Addestramento procedurale e manovre pratiche di abilità clinica con il Tutor Faculty.',
            location: wsLoc,
            border: 'border-emerald-400 border-3',
            bg: 'bg-emerald-950/30',
            badge: 'bg-emerald-500 text-black font-black',
            glow: 'shadow-emerald-950/50 shadow-lg',
            isBlinking: false,
          };
        } else if (text.includes('pausa') || text.includes('ristoro') || text.includes('pranzo') || text.includes('riposo') || text.includes('break') || text.includes('lunch')) {
          envConfig = {
            environmentType: 'PAUSA',
            environmentBadge: isEn ? 'BREAK & REFRESHMENT' : 'PAUSA & RISTORO',
            phaseLabel: isEn ? 'TECHNICAL BREAK' : 'PAUSA TECNICA',
            title: isEn ? 'BREAK & REFRESHMENT' : 'PAUSA & RISTORO',
            subtitle: isEn ? 'Refreshment and operational recovery between training blocks.' : 'Ristoro e recupero operativo tra i blocchi addestrativi.',
            location: isEn ? 'Refreshment / Social Area' : 'Area Ristoro / Conviviale',
            border: 'border-cyan-400 border-2',
            bg: 'bg-cyan-950/30',
            badge: 'bg-cyan-400 text-black font-black',
            glow: 'shadow-cyan-950/50 shadow-lg',
            isBlinking: false,
          };
        } else {
          envConfig = {
            environmentType: 'BRIEFING',
            environmentBadge: isEn ? 'CLASSROOM SESSION' : 'SESSIONE D\'AULA',
            phaseLabel: isEn ? 'FRAMEWORK / PLENARIA' : 'INQUADRAMENTO / PLENARIA',
            title: act.title || (isEn ? 'CLASSROOM SESSION' : 'SESSIONE D\'AULA'),
            subtitle: act.subtitle || (isEn ? 'Alignment and classroom directives with Faculty.' : 'Allineamento e direttive d\'aula con la Faculty.'),
            location: act.location ? translateLocation(act.location, language) : (isEn ? 'Plenary Hall' : 'Aula Plenaria'),
            border: 'border-neutral-700 border-2',
            bg: 'bg-neutral-900/50',
            badge: 'bg-neutral-800 text-neutral-200 font-bold',
            glow: 'shadow-lg',
            isBlinking: false,
          };
        }

        const squadNumbers = studentGroup === 'A' ? [1, 2, 3] : studentGroup === 'B' ? [4, 5, 6] : studentGroup === 'C' ? [7, 8, 9] : [10, 11, 12];
        const singleLearnerEventTitle = act.title
          ? `${envConfig.title} • ${act.title}`
          : envConfig.title;

        return (
          <div className="bg-neutral-900 border-2 border-cyan-500/80 p-4 sm:p-5 shadow-xl space-y-4 rounded">
            <div className="border-b border-neutral-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div>
                {isWorkshop ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-emerald-500 text-black font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider rounded shadow-sm">
                        {isEn ? 'UNIFIED WORKSHOP TIMELINE' : 'TIMELINE WORKSHOP A TEMPO UNICO ACCORPATO'}
                      </span>
                      <span className="px-2 py-0.5 bg-neutral-950 border border-emerald-500/60 text-emerald-300 font-mono text-[11px] sm:text-xs font-bold rounded">
                        {isEn ? 'START:' : 'INIZIO:'} <strong className="text-white">{wsStartTime}</strong> • {isEn ? 'END:' : 'FINE:'} <strong className="text-white">{wsEndTime}</strong> ({wsDuration} min)
                      </span>
                      <span className="text-neutral-400 font-mono text-[11px]">DAY 0{activeDay}</span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
                      <span>{envConfig.title} • {wsStartTime} - {wsEndTime}</span>
                    </h2>
                  </div>
                ) : (
                  <div>
                    <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-0.5">
                      {isEn ? 'PHASE TIME:' : 'ORARIO FASE:'} {currentSlot?.timeRange || '08:30 - 08:45'} • DAY 0{activeDay}
                    </span>
                    <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse" />
                      {singleLearnerEventTitle}
                    </h2>
                  </div>
                )}
              </div>
              <div className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-xs font-mono text-cyan-300 flex items-center gap-2 rounded">
                {isWorkshop ? (
                  <span className="text-emerald-400 font-bold">
                    {isEn ? `Continuous Block (${wsDuration} min)` : `Blocco Continuo (${wsDuration} min)`}
                  </span>
                ) : (
                  <span>{isEn ? `Phase ${effectiveSlotIdx + 1}/${dayMasterSlots.length}` : `Fase ${effectiveSlotIdx + 1}/${dayMasterSlots.length}`}</span>
                )}
              </div>
            </div>

            {/* Single Focused Card for Student Team - Zero Scenario Details, Strict Environment Specification */}
            <div className={`border-2 p-3 sm:p-5 flex flex-col justify-between space-y-4 transition-all duration-300 ${envConfig.border} ${envConfig.bg} ${envConfig.glow} rounded`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded ${envConfig.badge}`}>
                    {isEn ? `GROUP ${studentGroup} • TEAM ${currentDiscente.teamId}` : `GRUPPO ${studentGroup} • SQUADRA ${currentDiscente.teamId}`}
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-300">
                    {studentGroup === 'A' ? 'DISC 01-15' : studentGroup === 'B' ? 'DISC 16-30' : studentGroup === 'C' ? 'DISC 31-45' : 'DISC 46-60'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-widest border border-neutral-700 rounded ${envConfig.isBlinking ? 'text-white bg-red-950 animate-pulse' : 'text-neutral-200 bg-neutral-950'}`}>
                    {envConfig.phaseLabel}
                  </span>
                </div>
              </div>

              {/* Box Orario Inizio e Fine Workshop Accorpato (Tempo Unico) */}
              {isWorkshop && (
                <div className="p-3 bg-neutral-950/90 border border-emerald-500/50 rounded-lg space-y-2 font-mono">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 font-bold uppercase">
                        {isEn ? 'UNIFIED WORKSHOP SCHEDULE (NO 15-MIN SEGMENTS)' : 'ORARIO WORKSHOP ACCORPATO A TEMPO UNICO'}
                      </span>
                    </div>
                    <span className="text-neutral-400 text-[11px]">
                      {isEn ? 'Start & End Times Defined' : 'Orario di Inizio e Fine Definiti'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 uppercase block font-semibold">{isEn ? 'Start Time' : 'Orario Inizio'}</span>
                      <strong className="text-white text-sm sm:text-base">{wsStartTime}</strong>
                    </div>
                    <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 uppercase block font-semibold">{isEn ? 'End Time' : 'Orario Fine'}</span>
                      <strong className="text-white text-sm sm:text-base">{wsEndTime}</strong>
                    </div>
                    <div className="bg-neutral-900 p-2 rounded border border-neutral-800 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-neutral-400 uppercase block font-semibold">{isEn ? 'Total Duration' : 'Durata Totale'}</span>
                      <strong className="text-emerald-400 text-sm sm:text-base">{wsDuration} min ({isEn ? 'Single Block' : 'Tempo Unico'})</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-300 italic pt-0.5">
                    {isEn
                      ? 'The workshop is structured as a single continuous hands-on session. 15-minute segments are merged for optimal focus.'
                      : 'Il workshop si svolge come sessione pratica continua. I micro-segmenti da 15 minuti sono accorpati in un tempo unico.'}
                  </p>
                </div>
              )}

              {/* Countdown widget for Pre-Allerta TCCC or Standby SR */}
              {showCountdown && (
                <div className="bg-yellow-950/80 border border-yellow-500/80 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 animate-bounce" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold text-yellow-300 uppercase tracking-wider block">
                        {isPreAllertaTCCC ? (isEn ? 'TCCC PRE-ALERT (T -15)' : 'PRE-ALLERTA TCCC (T -15)') : (isEn ? 'SHOCK ROOM STANDBY' : 'STANDBY SHOCK ROOM')}
                      </span>
                      <p className="text-[11px] text-yellow-200/90 truncate font-mono">
                        {isPreAllertaTCCC
                          ? (isEn ? 'TCCC PPE preparation and donning in progress.' : 'Preparazione e vestizione DPI TCCC in corso.')
                          : (isEn ? 'Equipment check and active standby prior to Shock Room handover.' : 'Controllo presidi e standby attivo pre-handover Shock Room.')}
                      </p>
                    </div>
                  </div>
                  <div className="bg-neutral-950 px-2.5 py-1 border border-yellow-500/80 rounded text-right self-end sm:self-auto flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase hidden sm:inline">{isEn ? 'Remaining:' : 'Mancante:'}</span>
                    <span className="text-base sm:text-lg font-mono font-black text-yellow-400 tracking-wider">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                </div>
              )}

              {/* Tactical Scenario Role Box inside slot card */}
              {isScenarioRoleActive && (
                <div
                  className={`p-3 sm:p-4 rounded border-2 space-y-2 font-mono transition-all ${
                    isTCCC
                      ? 'bg-orange-950/90 border-orange-500 shadow-xl shadow-orange-950/60 ring-1 ring-orange-400/50'
                      : 'bg-cyan-950/90 border-cyan-400 shadow-xl shadow-cyan-950/60 ring-1 ring-cyan-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap border-b border-neutral-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 shadow-sm ${
                          isDebriefingPhase
                            ? 'bg-purple-600 text-white'
                            : isTCCC
                            ? 'bg-orange-600 text-white'
                            : 'bg-cyan-400 text-black'
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {isDebriefingPhase
                          ? (isEn ? 'DEBRIEFING • YOUR ROLE' : 'DEBRIEFING • IL TUO RUOLO')
                          : (isEn ? 'YOUR ASSIGNED SCENARIO ROLE' : 'IL TUO RUOLO OPERATIVO ASSEGNATO')}
                      </span>
                      <span className="text-white text-xs font-bold">
                        {currentDiscente.badgeCode || 'DISC'} • {currentDiscente.name}
                      </span>
                    </div>

                    {currentDiscente.activeScenarioAssignedBy?.includes('RANDOM') ? (
                      <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                        🎲 {isEn ? 'Assigned automatically at Random (T-15 expiry)' : 'Assegnato in modalità Random (fine Pre-Allerta T-15)'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {isEn ? 'Verified by Faculty Tutor' : 'Assegnato e Validato da Faculty'}
                      </span>
                    )}
                  </div>

                  <div className="pt-0.5">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-semibold mb-0.5">
                      {isEn ? 'Operational Assignment:' : 'Incarico Operativo:'}
                    </span>
                    <div className="text-base sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <span className={isTCCC ? 'text-orange-400' : 'text-cyan-300'}>
                        ⚡ {activeRoleName}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-200 pt-1 leading-snug">
                      {isDebriefingPhase
                        ? (isEn
                            ? `Debriefing in progress with Faculty ${assignedFaculty?.name}. Role visible for review and restitution.`
                            : `Debriefing in corso con il Tutor Faculty ${assignedFaculty?.name}. Ruolo visibile per l'analisi e la restituzione didattica.`)
                        : (isEn
                            ? `Operate strictly under your assigned clinical/tactical role in coordination with Faculty ${assignedFaculty?.name}.`
                            : `Opera attivamente secondo il tuo ruolo tattico-clinico designato in coordinamento con il Tutor Faculty ${assignedFaculty?.name}.`)}
                    </p>
                  </div>
                </div>
              )}

              {/* Slot card state when scenario phase is active but role is pending Faculty assignment */}
              {isScenarioActivePhase && !activeRoleName && (
                <div className="p-3 sm:p-4 rounded border-2 border-amber-500/70 bg-amber-950/40 space-y-2 font-mono shadow-md animate-pulse">
                  <div className="flex items-center justify-between gap-2 flex-wrap border-b border-amber-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 bg-amber-500 text-black shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-black" />
                        {isEn ? 'ROLE ASSIGNMENT PENDING' : 'ASSEGNAZIONE RUOLO IN CORSO'}
                      </span>
                      <span className="text-white text-xs font-bold">
                        {currentDiscente.badgeCode || 'DISC'} • {currentDiscente.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                      Faculty: {assignedFaculty?.badgeCode || 'FAC'} ({assignedFaculty?.name})
                    </span>
                  </div>

                  <div className="pt-0.5">
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest block font-semibold mb-0.5">
                      {isEn ? 'Directive from Faculty Tutor:' : 'Direttiva Tutor Faculty:'}
                    </span>
                    <p className="text-xs sm:text-sm text-neutral-200 leading-snug font-semibold">
                      {isEn
                        ? `Awaiting tactical role assignment from Faculty ${assignedFaculty?.name}. The role will appear here automatically upon confirmation.`
                        : `In attesa di assegnazione del ruolo da parte del Faculty ${assignedFaculty?.name}. Il tuo ruolo operativo comparirà qui in tempo reale appena confermato dal Faculty.`}
                    </p>
                  </div>
                </div>
              )}

              {/* ENVIRONMENT DISPLAY: SPECIFICHE SOLO AMBIENTE TCCC O SHOCK ROOM */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {envConfig.environmentType === 'TCCC' && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded shadow-sm">
                      <Crosshair className="w-3.5 h-3.5 animate-pulse" />
                      <span>{isEn ? 'ASSIGNED TCCC ENVIRONMENT' : 'AMBIENTE TCCC ASSEGNATO'}</span>
                    </div>
                  )}
                  {envConfig.environmentType === 'SHOCK_ROOM' && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-400 text-black font-black text-xs uppercase tracking-widest rounded shadow-sm">
                      <Stethoscope className="w-3.5 h-3.5 animate-pulse" />
                      <span>{isEn ? 'ASSIGNED SHOCK ROOM' : 'SHOCK ROOM ASSEGNATA'}</span>
                    </div>
                  )}
                  {envConfig.environmentType === 'WORKSHOP' && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded shadow-sm">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{isEn ? 'WORKSHOP STATION' : 'POSTAZIONE WORKSHOP'}</span>
                    </div>
                  )}
                  {envConfig.environmentType === 'PAUSA' && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-500 text-black font-black text-xs uppercase tracking-widest rounded shadow-sm">
                      <Coffee className="w-3.5 h-3.5" />
                      <span>{isEn ? 'OPERATIONAL BREAK' : 'PAUSA OPERATIVA'}</span>
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
                    <span>{isEn ? 'Assigned Station:' : 'Postazione Assegnata:'} <strong className="text-cyan-300 font-mono text-xs sm:text-sm">{envConfig.location}</strong></span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">{isEn ? 'Assigned Faculty Tutor (1:1 Ratio):' : 'Faculty Tutor Assegnato (Rapporto 1:1):'}</span>
                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 font-mono text-xs rounded">
                      <span className="text-orange-400 font-black">{assignedFaculty?.name || 'Faculty Tutor'}</span>
                      <span className="text-neutral-300">{assignedFaculty?.badgeCode || 'FAC'} ({assignedFaculty?.title || 'Tutor'})</span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-950/90 p-3 sm:p-3.5 border border-neutral-800 space-y-1.5 text-xs rounded">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">{isEn ? `All Teams in Your Group (${studentGroup}):` : `Tutte le Squadre del tuo Gruppo (${studentGroup}):`}</span>
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
                          <span>{isEn ? `Team ${sqNum}` : `Squadra ${sqNum}`} {isStudentSquad && (isEn ? '⭐ (Your Team)' : '⭐ (La tua Sq)')}</span>
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
                    {isEn ? 'BLIND TRAINING PROTOCOL' : 'PROTOCOLLO ADDESTRATIVO A CIECO'}
                  </span>
                  <p className="text-neutral-400 text-[10px] sm:text-[11px] leading-relaxed">
                    {isEn
                      ? 'Clinical details of the case and conditions of the simulated patient are reserved for teaching Faculty to preserve high fidelity and operational realism.'
                      : 'I dettagli clinici del caso e le condizioni del paziente simulato sono riservati alla Faculty didattica per preservare l\'alta fedeltà e il realismo dell\'ingaggio operativo.'}
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
        roleLabel={isEn ? 'Learner' : 'Discente'}
      />

      {/* MODALE REPORT ANTEPRIMA BILANCIAMENTO DISCENTI */}
      <StaffBalancingModal<Discente>
        isOpen={isBalancingModalOpen}
        report={discentiBalancingReport}
        onClose={() => setIsBalancingModalOpen(false)}
        onConfirm={async (updatedDiscenti) => {
          await bulkUpdateDiscenti(updatedDiscenti);
          if (sendCourseMessage) {
            sendCourseMessage({
              senderId: 'REGIA-CH3',
              senderName: 'Coordinamento Didattico Regia',
              senderRole: 'direttore',
              type: 'info',
              subject: 'RIASSETTO SQUADRE E LEADERSHIP DISCENTI APPLICATO',
              content: `L'articolazione delle 12 Squadre nei 4 Macro-Gruppi (ALPHA..DELTA) e le assegnazioni Team Leader sono state bilanciate omogeneamente.`,
            });
          }
        }}
      />
    </div>
  );
};
