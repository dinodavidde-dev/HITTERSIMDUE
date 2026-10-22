import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Users,
  Send,
  Sparkles,
  Clock,
  Radio,
  ChevronDown,
  ChevronUp,
  Dices,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { Discente, Faculty, ScenarioType } from '../../types';
import { useCourse } from '../../context/CourseContext';
import {
  TCCC_ROLE_PRESETS,
  SHOCKROOM_ROLE_PRESETS,
  shuffleArray,
  generateRandomScenarioRoleAssignments,
} from '../../utils/scenarioRoleHelper';

interface FacultyScenarioRoleAssignerProps {
  currentFaculty: Faculty;
  scenarioType: 'TCCC' | 'SHOCKROOM';
  slotTitle: string;
  slotTimeRange?: string;
  isPreAllerta: boolean;
  assignedDiscenti: Discente[];
  isEmbedded?: boolean;
}

export const FacultyScenarioRoleAssigner: React.FC<FacultyScenarioRoleAssignerProps> = ({
  currentFaculty,
  scenarioType,
  slotTitle,
  slotTimeRange,
  isPreAllerta,
  assignedDiscenti,
  isEmbedded = true,
}) => {
  const { assignScenarioRoles, clearScenarioRolesForTeam, cleanupAssignedRoles, timerSeconds, isTimerRunning, language, t } = useCourse();
  const isEn = language === 'en';

  const presets = scenarioType === 'TCCC' ? TCCC_ROLE_PRESETS : SHOCKROOM_ROLE_PRESETS;

  // Track draft state for each learner
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [customRoles, setCustomRoles] = useState<Record<string, string>>({});
  const [isCustomMode, setIsCustomMode] = useState<Record<string, boolean>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [randomNotice, setRandomNotice] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-random trigger prevention ref to avoid repeated triggers in the same slot
  const autoRandomTriggeredRef = useRef<string | null>(null);

  // Initialize or re-populate when discenti or scenarioType changes
  useEffect(() => {
    const initialSelected: Record<string, string> = {};
    const initialCustom: Record<string, string> = {};
    const initialMode: Record<string, boolean> = {};

    assignedDiscenti.forEach((d, idx) => {
      if (d.activeScenarioRole) {
        if (presets.includes(d.activeScenarioRole)) {
          initialSelected[d.id] = d.activeScenarioRole;
          initialMode[d.id] = false;
        } else {
          initialSelected[d.id] = '__CUSTOM__';
          initialCustom[d.id] = d.activeScenarioRole;
          initialMode[d.id] = true;
        }
      } else {
        // Default recommendation: Team Leader gets role 0, operators get subsequent roles
        const suggested = presets[idx % presets.length];
        initialSelected[d.id] = suggested;
        initialMode[d.id] = false;
      }
    });

    setSelectedRoles(initialSelected);
    setCustomRoles(initialCustom);
    setIsCustomMode(initialMode);
  }, [assignedDiscenti, scenarioType]);

  const alreadyAssignedCount = assignedDiscenti.filter((d) => !!d.activeScenarioRole).length;
  const allAssigned = alreadyAssignedCount === assignedDiscenti.length && assignedDiscenti.length > 0;

  // AUTOMATIC RANDOM ASSIGNMENT AT T-15 EXPIRY:
  // If in Pre-Allerta and timer reaches 0, and roles were not transmitted before, trigger random assignment automatically!
  useEffect(() => {
    if (!isPreAllerta) return;

    const slotKey = `${slotTitle}_${scenarioType}_team_${currentFaculty.assignedTeamId}`;

    // When timer expires in pre-allerta and roles were not completely compiled/sent
    if (timerSeconds <= 0 && alreadyAssignedCount < assignedDiscenti.length && autoRandomTriggeredRef.current !== slotKey) {
      autoRandomTriggeredRef.current = slotKey;
      // Execute auto-random assignment
      const randomAssignments = generateRandomScenarioRoleAssignments(
        assignedDiscenti,
        scenarioType,
        slotTitle,
        'AUTO_RANDOM_FINE_T15'
      );
      assignScenarioRoles(randomAssignments);
      setRandomNotice(
        isEn
          ? '⚡ T-15 EXPIRED: Roles were not transmitted in time and were automatically assigned at RANDOM!'
          : '⚡ T-15 SCADUTO: I ruoli non erano stati inviati in tempo ed sono stati assegnati automaticamente in modalità RANDOM a tutti i 5 discenti!'
      );
      setTimeout(() => {
        setRandomNotice(null);
      }, 8000);
    }
  }, [timerSeconds, isPreAllerta, alreadyAssignedCount, assignedDiscenti, scenarioType, slotTitle, currentFaculty.assignedTeamId, assignScenarioRoles, isEn]);

  const handleRoleSelectChange = (discenteId: string, value: string) => {
    if (value === '__CUSTOM__') {
      setIsCustomMode((prev) => ({ ...prev, [discenteId]: true }));
      setSelectedRoles((prev) => ({ ...prev, [discenteId]: '__CUSTOM__' }));
    } else {
      setIsCustomMode((prev) => ({ ...prev, [discenteId]: false }));
      setSelectedRoles((prev) => ({ ...prev, [discenteId]: value }));
    }
  };

  const handleCustomTextChange = (discenteId: string, text: string) => {
    setCustomRoles((prev) => ({ ...prev, [discenteId]: text }));
  };

  const handleApplyPresetTemplate = () => {
    const updatedSelected: Record<string, string> = {};
    const updatedModes: Record<string, boolean> = {};

    assignedDiscenti.forEach((d, idx) => {
      const presetRole = presets[idx % presets.length];
      updatedSelected[d.id] = presetRole;
      updatedModes[d.id] = false;
    });

    setSelectedRoles(updatedSelected);
    setIsCustomMode(updatedModes);
    setRandomNotice(null);
  };

  /**
   * Shuffles roles in the draft selection so faculty can preview the random distribution before sending
   */
  const handleRandomizeDraft = () => {
    const shuffled = shuffleArray(presets);
    const updatedSelected: Record<string, string> = {};
    const updatedModes: Record<string, boolean> = {};

    assignedDiscenti.forEach((d, idx) => {
      updatedSelected[d.id] = shuffled[idx % shuffled.length];
      updatedModes[d.id] = false;
    });

    setSelectedRoles(updatedSelected);
    setIsCustomMode(updatedModes);
    setRandomNotice(
      isEn
        ? '🎲 Roles shuffled randomly in draft. Click "Confirm & Transmit Roles" to broadcast to learners!'
        : '🎲 Ruoli mescolati in modalità random. Clicca su "Conferma & Trasmetti" per inviarli ai discenti!'
    );
  };

  /**
   * Instantly generates and transmits random roles to learners with 1 click
   */
  const handleInstantRandomAndBroadcast = () => {
    const randomAssignments = generateRandomScenarioRoleAssignments(
      assignedDiscenti,
      scenarioType,
      slotTitle,
      `${currentFaculty.badgeCode || 'FAC'}_RANDOM`
    );

    assignScenarioRoles(randomAssignments);
    setSavedSuccess(true);
    setRandomNotice(
      isEn
        ? '🎲 5 roles randomly distributed and instantly transmitted to learners!'
        : '🎲 5 ruoli assegnati in modalità RANDOM e trasmessi istantaneamente ai discenti!'
    );
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  const handleSaveAndBroadcast = () => {
    const assignments = assignedDiscenti.map((d) => {
      let finalRole = selectedRoles[d.id] || '';
      if (finalRole === '__CUSTOM__' || isCustomMode[d.id]) {
        finalRole = customRoles[d.id]?.trim() || (isEn ? 'Custom Tactical Role' : 'Ruolo Operativo Personalizzato');
      }
      return {
        discenteId: d.id,
        role: finalRole,
        scenarioType: scenarioType as ScenarioType,
        slotId: slotTitle,
        assignedByFacultyBadge: currentFaculty.badgeCode || 'FAC',
      };
    });

    assignScenarioRoles(assignments);
    setSavedSuccess(true);
    setRandomNotice(null);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3500);
  };

  const handleReset = () => {
    if (
      window.confirm(
        isEn
          ? `Reset assigned scenario roles for Team ${currentFaculty.assignedTeamId}?`
          : `Azzerare tutti i ruoli operativi di scenario assegnati alla Squadra ${currentFaculty.assignedTeamId}?`
      )
    ) {
      clearScenarioRolesForTeam(currentFaculty.assignedTeamId);
      // Reset local state to empty
      const emptySelected: Record<string, string> = {};
      const emptyModes: Record<string, boolean> = {};
      assignedDiscenti.forEach((d, idx) => {
        emptySelected[d.id] = presets[idx % presets.length];
        emptyModes[d.id] = false;
      });
      setSelectedRoles(emptySelected);
      setIsCustomMode(emptyModes);
      setCustomRoles({});
      setRandomNotice(null);
    }
  };

  const handleMarkDebriefingAndCleanup = async () => {
    if (
      window.confirm(
        isEn
          ? `Mark simulation phase as DEBRIEFING for Team ${currentFaculty.assignedTeamId} and automatically cleanup assignedRole in Firestore?`
          : `Segnare la fase di simulazione come DEBRIEFING per la Squadra ${currentFaculty.assignedTeamId} e azzerare automaticamente assignedRole in Firestore?`
      )
    ) {
      await cleanupAssignedRoles({ phase: 'debriefing', teamId: currentFaculty.assignedTeamId });
      setRandomNotice(
        isEn
          ? `✓ Simulation phase set to DEBRIEFING. 'assignedRole' field in Firestore successfully reset for Team ${currentFaculty.assignedTeamId}!`
          : `✓ Fase impostata su DEBRIEFING. Campo 'assignedRole' in Firestore azzerato con successo per la Squadra ${currentFaculty.assignedTeamId}!`
      );
      setTimeout(() => setRandomNotice(null), 5000);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isCompiled = assignedDiscenti.length > 0 && assignedDiscenti.every((d) => Boolean(d.activeScenarioRole));

  const isTCCC = scenarioType === 'TCCC';
  const themeBorder = isCompiled
    ? 'border-2 border-emerald-500/80 shadow-emerald-950/60'
    : 'border-4 border-yellow-400 tactical-box-alert-blink shadow-2xl shadow-yellow-500/60 ring-4 ring-yellow-400/50';
  const themeBg = isCompiled
    ? (isTCCC ? 'bg-orange-950/25' : 'bg-cyan-950/25')
    : 'bg-yellow-950/40';
  const themeBadge = isCompiled
    ? (isTCCC ? 'bg-orange-600 text-white' : 'bg-cyan-500 text-black')
    : 'bg-yellow-400 text-black animate-pulse font-black';
  const themeAccentText = isTCCC ? 'text-orange-400' : 'text-cyan-300';

  return (
    <div
      className={`rounded-lg p-3 sm:p-5 shadow-2xl transition-all font-mono ${themeBorder} ${themeBg}`}
    >
      {/* Dynamic Status: Lampeggiante se non compilato, stabile se compilato */}
      {!isCompiled ? (
        <div className="mb-3.5 px-3 py-2 bg-yellow-400 text-black rounded font-black text-xs uppercase tracking-wider flex items-center justify-between gap-2 shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
            <span className="leading-tight">
              ⚠️ {isEn ? 'ATTENTION: ROLE ASSIGNMENT BOX FLASHING UNTIL COMPILED' : 'ATTENZIONE: RIQUADRO ASSEGNAZIONE LAMPEGGIANTE FINCHÉ NON COMPILATO'}
            </span>
          </div>
          <span className="text-[11px] font-mono bg-black text-yellow-300 px-2 py-0.5 rounded font-black shrink-0">
            {alreadyAssignedCount}/{assignedDiscenti.length} {isEn ? 'ASSIGNED' : 'COMPILATI'}
          </span>
        </div>
      ) : (
        <div className="mb-3.5 px-3 py-1.5 bg-emerald-950 border border-emerald-500 text-emerald-300 rounded font-black text-xs uppercase tracking-wider flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              ✓ {isEn ? 'ROLES COMPILED & TRANSMITTED TO TEAM' : 'RUOLI COMPILATI E TRASMESSI ALLA SQUADRA'}
            </span>
          </div>
          <span className="text-[11px] font-mono bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-bold">
            {assignedDiscenti.length}/{assignedDiscenti.length} {isEn ? 'CONFIRMED' : 'CONFERMATI'}
          </span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${themeBadge}`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              {isPreAllerta ? (isEn ? 'PRE-ALERT ROLE ASSIGNMENT (T -15)' : 'ASSEGNAZIONE RUOLI SQUADRA (T -15)') : (isEn ? 'TACTICAL SCENARIO ROLES' : 'RUOLI OPERATIVI SQUADRA')}
            </span>

            <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px] font-bold rounded flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              {isEn ? 'TEAM' : 'SQUADRA'} #{currentFaculty.assignedTeamId} (5 {isEn ? 'Learners' : 'Discenti'})
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 pt-0.5">
            {isEn
              ? 'Assign or confirm the 5 operational positions (1 Team Leader + 4 Operators). Unassigned roles at T-15 expiration are distributed randomly.'
              : 'Assegna o conferma le 5 posizioni operative (1 Team Leader + 4 Operatori). Allo scadere del T-15 i ruoli non compilati vengono assegnati in automatico.'}
          </p>
        </div>

        {/* Controls / Collapse */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {alreadyAssignedCount > 0 ? (
            <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-600 text-emerald-300 text-[10px] sm:text-xs rounded font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {alreadyAssignedCount}/{assignedDiscenti.length} {isEn ? 'TRANSMITTED' : 'INVIATI'}
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-amber-950 border border-amber-600 text-amber-300 text-[10px] sm:text-xs rounded font-bold flex items-center gap-1 animate-pulse">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {isEn ? 'AWAITING TRANSMISSION' : 'IN ATTESA DI INVIO'}
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 rounded transition-colors"
            title={isExpanded ? 'Comprimi' : 'Espandi'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* PRE-ALLERTA T-15 MANDATORY RULE ADVISORY */}
      {isPreAllerta && (
        <div className="mt-3 p-2.5 bg-yellow-950/70 border border-yellow-500/80 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 animate-bounce" />
            <div>
              <strong className="text-yellow-300 uppercase tracking-wide block">
                {isEn ? 'PRE-ALERT T-15 ACTIVE WINDOW' : 'FINESTRA DI PRE-ALLERTA A T-15 ATTIVA'}
              </strong>
              <p className="text-[11px] text-yellow-200/90 leading-tight">
                {isEn
                  ? 'Assign roles in agreement with learners. If not sent prior to phase conclusion, the system enforces automatic RANDOM distribution.'
                  : 'Assegna i ruoli in accordo con i discenti. Se non confermati prima della fine della fase, il sistema assegnerà automaticamente i ruoli in modalità RANDOM.'}
              </p>
            </div>
          </div>

          <div className="bg-neutral-950 px-2.5 py-1 border border-yellow-400/80 rounded flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <span className="text-[10px] text-neutral-400 uppercase">{isEn ? 'T-15 Timer:' : 'Timer T-15:'}</span>
            <strong className="text-yellow-400 text-sm font-black">{formatTimer(timerSeconds)}</strong>
          </div>
        </div>
      )}

      {/* Dynamic Feedback Banner */}
      {randomNotice && (
        <div className="mt-3 p-2.5 bg-cyan-950/90 border border-cyan-400 rounded flex items-center gap-2 text-xs text-cyan-200 font-bold animate-pulse">
          <Dices className="w-4 h-4 text-cyan-300 shrink-0" />
          <span>{randomNotice}</span>
        </div>
      )}

      {isExpanded && (
        <div className="pt-3.5 space-y-3.5">
          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-950/80 p-2 sm:p-2.5 rounded border border-neutral-800 text-xs">
            <span className="text-neutral-400 flex items-center gap-1.5 text-[11px]">
              <Users className="w-3.5 h-3.5 text-neutral-300" />
              <span>{isEn ? 'Assignment Modes:' : 'Modalità Assegnazione:'}</span>
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Standard 5 Roles Preset */}
              <button
                type="button"
                onClick={handleApplyPresetTemplate}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 border border-amber-600/60 rounded text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title={isEn ? 'Standard role layout' : 'Applica modello standard ordinato'}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                {isEn ? 'Standard (1-5)' : 'Modello Standard (1-5)'}
              </button>

              {/* Shuffle Draft (Random Preview) */}
              <button
                type="button"
                onClick={handleRandomizeDraft}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 hover:text-cyan-200 border border-cyan-600/60 rounded text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title={isEn ? 'Shuffle roles randomly in draft' : 'Mescola i ruoli casualmente in bozza'}
              >
                <Dices className="w-3 h-3 text-cyan-400" />
                {isEn ? '🎲 Shuffle Random' : '🎲 Mescola Random'}
              </button>

              {/* Instant Random & Broadcast */}
              <button
                type="button"
                onClick={handleInstantRandomAndBroadcast}
                className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500 rounded text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                title={isEn ? 'Generate and immediately transmit random roles' : 'Genera e invia subito ruoli casuali'}
              >
                <Zap className="w-3 h-3 text-yellow-400" />
                {isEn ? '🎲 Transmit Random Now' : '🎲 Invia Subito Random'}
              </button>

              {/* Reset Roles */}
              {alreadyAssignedCount > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-700/60 rounded text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-red-400" />
                  {isEn ? 'Reset All' : 'Azzera Ruoli'}
                </button>
              )}
            </div>
          </div>

          {/* Learner Rows */}
          <div className="space-y-2.5">
            {assignedDiscenti.map((d, idx) => {
              const isTL = d.role?.toLowerCase().includes('leader') || idx === 0;
              const currentVal = selectedRoles[d.id] || presets[idx % presets.length];
              const isCustom = isCustomMode[d.id] || currentVal === '__CUSTOM__';
              const activeRoleOnRecord = d.activeScenarioRole;

              return (
                <div
                  key={d.id}
                  className={`p-2.5 sm:p-3 rounded border transition-all ${
                    activeRoleOnRecord
                      ? 'bg-neutral-900/95 border-emerald-700/60'
                      : 'bg-neutral-950 border-neutral-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                    {/* Learner Info */}
                    <div className="flex items-center gap-2.5 min-w-[240px]">
                      <span className="px-2 py-0.5 bg-neutral-900 text-amber-300 border border-amber-600/50 rounded text-[11px] font-black">
                        {d.badgeCode || `DISC-0${idx + 1}`}
                      </span>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-white text-xs sm:text-sm font-bold">
                            {d.name}
                          </strong>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              isTL
                                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {isTL ? 'Team Leader' : (isEn ? 'Operator' : 'Operatore')}
                          </span>
                        </div>

                        {activeRoleOnRecord ? (
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{isEn ? 'Transmitted:' : 'Inviato:'} <strong className="text-white">{activeRoleOnRecord}</strong></span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-400/80 flex items-center gap-1 pt-0.5">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{isEn ? 'Not yet transmitted' : 'In attesa di invio'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Role Selector & Custom Text Input */}
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={isCustom ? '__CUSTOM__' : currentVal}
                          onChange={(e) => handleRoleSelectChange(d.id, e.target.value)}
                          className={`w-full bg-neutral-950 text-white font-mono text-xs border rounded px-2.5 py-1.5 focus:outline-none cursor-pointer ${
                            isCustom
                              ? 'border-purple-500 text-purple-300'
                              : 'border-neutral-700 focus:border-amber-400'
                          }`}
                        >
                          <optgroup label={isEn ? 'Standard Scenario Roles' : 'Ruoli Standard Scenario'}>
                            {presets.map((pRole) => (
                              <option key={pRole} value={pRole}>
                                {pRole}
                              </option>
                            ))}
                          </optgroup>
                          <option value="__CUSTOM__">
                            ✍️ {isEn ? 'Custom / Free Text Role...' : 'Altro / Testo Libero...'}
                          </option>
                        </select>
                      </div>

                      {isCustom && (
                        <div className="flex-1 flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder={isEn ? 'Type custom role...' : 'Digita ruolo concordato...'}
                            value={customRoles[d.id] || ''}
                            onChange={(e) => handleCustomTextChange(d.id, e.target.value)}
                            className="w-full bg-neutral-950 text-yellow-300 placeholder-neutral-500 font-mono text-xs border border-purple-500 rounded px-2.5 py-1.5 focus:outline-none focus:border-yellow-400 font-bold"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm & Transmit Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-800">
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                {isEn
                  ? 'Confirming transmits roles instantly to learners. If not submitted, roles will be randomized automatically at T-15 expiration.'
                  : 'La conferma trasmette istantaneamente i ruoli. Se non inviati, a fine T-15 scatterà l’assegnazione automatica RANDOM.'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleMarkDebriefingAndCleanup}
                className="w-full sm:w-auto px-4 py-2.5 rounded font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-purple-950 text-purple-300 border border-purple-700/80 transition-all cursor-pointer shadow"
                title={isEn ? 'Mark simulation phase as debriefing and reset assignedRole in Firestore discenti collection' : 'Segna fase come debriefing e azzera assignedRole nella collection discenti di Firestore'}
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                <span>{isEn ? 'Mark Debriefing (Cleanup Roles)' : 'Passa a Debriefing (Reset Ruoli)'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndBroadcast}
                className={`w-full sm:w-auto px-5 py-2.5 rounded font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  savedSuccess
                    ? 'bg-emerald-500 text-black'
                    : isTCCC
                    ? 'bg-orange-500 hover:bg-orange-400 text-black ring-1 ring-orange-400/80'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black ring-1 ring-cyan-400/80'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    {isEn ? 'ROLES TRANSMITTED TO LEARNERS!' : 'RUOLI TRASMESSI AI DISCENTI!'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {isEn ? 'Confirm & Transmit Roles' : 'Conferma & Trasmetti Ruoli'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
