import React, { useState, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import { CourseDay } from '../../types';
import {
  findCriticalInPrepActors,
  formatMinutesToTime,
  formatMinutesCountdown,
  getSimulatedCourseMinutes,
  CriticalActorNotification,
} from '../../utils/deephitterSync';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  Radio,
  Eye,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  XCircle,
  Volume2,
} from 'lucide-react';

interface TruccoPriorityAlertBannerProps {
  selectedDay: CourseDay;
  onOpenArtistTimeline?: (artistBadge: string) => void;
  onOpenActorsRegistry?: () => void;
}

export const TruccoPriorityAlertBanner: React.FC<TruccoPriorityAlertBannerProps> = ({
  selectedDay,
  onOpenArtistTimeline,
  onOpenActorsRegistry,
}) => {
  const {
    currentSlot,
    timerSeconds,
    actors,
    simulatorPatients,
    updateActorProgressStatus,
    updateTechChecklist,
    sendCourseMessage,
    language,
  } = useCourse();

  const isEn = language === 'en';
  const [simulationTestActive, setSimulationTestActive] = useState<boolean>(false);
  const [alertDismissedIds, setAlertDismissedIds] = useState<Record<string, boolean>>({});
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Compute live simulated course minutes
  const currentCourseMinutes = useMemo(() => {
    return getSimulatedCourseMinutes(currentSlot, timerSeconds);
  }, [currentSlot, timerSeconds]);

  // Real-time critical actors: state is IN_PREPARAZIONE and time to T0 < 10 minutes
  const realCriticalActors = useMemo(() => {
    const list = findCriticalInPrepActors(
      selectedDay,
      currentCourseMinutes,
      actors,
      simulatorPatients
    );
    return list.filter((item) => !alertDismissedIds[item.id]);
  }, [selectedDay, currentCourseMinutes, actors, simulatorPatients, alertDismissedIds]);

  // Simulated test alert for immediate demonstration and verification
  const simulatedCriticalActor: CriticalActorNotification | null = useMemo(() => {
    if (!simulationTestActive) return null;
    const firstActor = actors[0] || {
      id: 'act-01',
      badgeCode: 'ACT-01',
      name: 'Marco Ferri',
      physicalStatus: 'AMPUTATO',
    };
    return {
      id: 'test-simulated-alert',
      actorId: firstActor.id,
      actorCode: firstActor.badgeCode || 'ACT-01',
      actorName: firstActor.name || 'Marco Ferri',
      physicalStatus: firstActor.physicalStatus || 'AMPUTATO',
      progressStatus: 'IN_PREPARAZIONE',
      scenarioAndPatient: 'Scenario 6 • Paziente 1',
      patientId: 1,
      blockNumber: 1,
      day: selectedDay,
      t0Time: formatMinutesToTime(currentCourseMinutes + 7),
      t0Minutes: currentCourseMinutes + 7,
      timeToT0Minutes: 7, // Exactly 7 minutes to T0 (< 10 min)
      truccatriceCode: 'TRUCCO-01',
      truccatriceName: 'Silvia Rossi',
      postazioneLogistica: 'Ambiente Tattico 1 (Stop The Bleed)',
      lesioniClinicheMoulage:
        'Amputazione subtotale terzo distale gamba DX con getto arterioso attivo da lacerazione tibiale anteriore.',
      presidioMoulageFx: 'Protesi silicone moncone balistico con linea fluido arterioso sotto pressione',
      isOverdue: false,
      recommendation:
        'ALLERTA TEST: Mancano 7 min all\'avvio T0 dello Scenario 6 e l\'attore ACT-01 è ancora IN PREPARAZIONE. Sollecitare Silvia Rossi.',
    };
  }, [simulationTestActive, actors, selectedDay, currentCourseMinutes]);

  // Combined list of critical actors
  const activeCriticalActors = useMemo(() => {
    const combined = [...realCriticalActors];
    if (simulatedCriticalActor && !combined.some((a) => a.actorCode === simulatedCriticalActor.actorCode)) {
      combined.unshift(simulatedCriticalActor);
    }
    return combined;
  }, [realCriticalActors, simulatedCriticalActor]);

  const hasCritical = activeCriticalActors.length > 0;

  // 1-Click validation: Set status to PRONTO_T0, clear alert, notify Regia
  const handleValidatePronto = (item: CriticalActorNotification) => {
    if (item.actorId) {
      updateActorProgressStatus(item.actorId, 'PRONTO_T0', {
        patientId: item.patientId,
        updatedBy: `${item.truccatriceCode} • ${item.truccatriceName}`,
        notifyRegia: true,
      });
    }

    if (item.patientId) {
      updateTechChecklist(item.patientId, 'preDone', true);
    }

    if (sendCourseMessage) {
      sendCourseMessage({
        senderId: item.truccatriceCode,
        senderName: `${item.truccatriceName} (Team Trucco)`,
        senderRole: 'tecnico',
        type: 'info',
        subject: `✓ PRONTO T0 VALIDATO RAPIDO • ${item.actorCode} (${item.scenarioAndPatient})`,
        content: `Rientrata allerta T0: L'attore ${item.actorCode} (${item.actorName}) è stato validato PRONTO SCENA da ${item.truccatriceCode} per ${item.scenarioAndPatient}. Luce verde per avvio T0.`,
      });
    }

    setAlertDismissedIds((prev) => ({ ...prev, [item.id]: true }));
    if (item.id === 'test-simulated-alert') {
      setSimulationTestActive(false);
    }

    setActionFeedback(
      `✓ Attore ${item.actorCode} (${item.actorName}) validato PRONTO T0 con successo! Allerta chiusa e Regia CH-3 notificata.`
    );
    setTimeout(() => setActionFeedback(null), 4500);
  };

  // Urgent radio call to Regia and Truccatrice
  const handleSendUrgentRadio = (item: CriticalActorNotification) => {
    if (sendCourseMessage) {
      sendCourseMessage({
        senderId: 'COORD-TRUCCO',
        senderName: 'Coordinamento Moulage & Trucco',
        senderRole: 'tecnico',
        type: 'emergency',
        subject: `⚠️ SOLLECITO T0 PRIORITARIO • ${item.actorCode} ANCORA IN PREPARAZIONE (${item.timeToT0Minutes > 0 ? `T -${item.timeToT0Minutes}m` : 'RITARDO'})`,
        content: `URGENZA REGIA CH-3: L'attore ${item.actorCode} (${item.actorName}) assegnato a ${item.truccatriceCode} (${item.truccatriceName}) per ${item.scenarioAndPatient} risulta ancora in stato IN PREPARAZIONE con tempo al T0 inferiore a 10 minuti (T0: ${item.t0Time}). Richiesto sollecito immediato completamento o supporto Jolly.`,
      });
    }

    setActionFeedback(
      `📻 Sollecito Radio prioritario inviato a Regia CH-3 e a ${item.truccatriceCode} per ${item.actorCode}!`
    );
    setTimeout(() => setActionFeedback(null), 4500);
  };

  return (
    <aside
      aria-label="Sistema Notifica Prioritaria Trucco"
      className="font-mono text-white transition-all duration-300"
    >
      {/* ACTION FEEDBACK TOAST */}
      {actionFeedback && (
        <div className="mb-3 p-3 bg-emerald-950 border-2 border-emerald-500 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <span className="text-[10px] uppercase bg-black/60 px-2 py-0.5 text-emerald-300 border border-emerald-700">
            REGIA CH-3 SYNC
          </span>
        </div>
      )}

      {/* EMERGENCY PRIORITY BANNER (ACTIVE WHEN ACTORS IN PREP WITH T0 < 10 MIN) */}
      {hasCritical ? (
        <div className="bg-gradient-to-r from-red-950 via-neutral-950 to-red-950 border-2 border-red-500 ring-2 ring-red-500/50 shadow-2xl shadow-red-600/40 p-4 sm:p-5 space-y-3 relative overflow-hidden animate-fadeIn">
          {/* Background alert glow accent */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Banner Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-red-800/80 pb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center font-black shadow-lg shadow-red-600/50">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-400 rounded-full animate-ping" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-red-600 text-white font-black text-xs uppercase tracking-wider animate-pulse">
                    ALLERTA PRIORITARIA TRUCCO
                  </span>
                  <span className="px-2 py-0.5 bg-black border border-red-500 text-red-200 font-bold text-xs uppercase">
                    TEMPO AL T0 &lt; 10 MINUTI
                  </span>
                  {simulationTestActive && (
                    <span className="px-2 py-0.5 bg-purple-950 border border-purple-500 text-purple-200 font-bold text-[11px] uppercase">
                      MODALITÀ TEST SIMULATA
                    </span>
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-black text-white mt-1 flex items-center gap-2">
                  <span>
                    {isEn
                      ? `CRITICAL ALERT: ${activeCriticalActors.length} Actor(s) In Preparation with T0 &lt; 10 min`
                      : `ALLERTA CRITICA: ${activeCriticalActors.length} Attore/i 'In Preparazione' con T0 &lt; 10 minuti`}
                  </span>
                </h2>
              </div>
            </div>

            {/* Right Controls: Test Simulation Toggle + Collapse */}
            <div className="flex items-center gap-2 self-start md:self-center">
              <button
                type="button"
                onClick={() => setSimulationTestActive((prev) => !prev)}
                className={`px-2.5 py-1 text-xs font-bold border cursor-pointer transition-colors ${
                  simulationTestActive
                    ? 'bg-purple-900 border-purple-400 text-purple-100'
                    : 'bg-black/60 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
                title="Attiva/disattiva simulazione test per verificare il banner e i pulsanti"
              >
                {simulationTestActive ? 'Disattiva Test' : 'Test Simula T-8m'}
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-1.5 bg-black/70 hover:bg-neutral-800 border border-red-700 text-red-200 cursor-pointer"
                title={isExpanded ? 'Riduci pannello' : 'Espandi pannello'}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expanded Critical Actors List */}
          {isExpanded && (
            <div className="space-y-3 pt-1 relative z-10">
              <p className="text-xs text-red-200/90 font-sans leading-relaxed">
                I seguenti attori risultano ancora nello stato{' '}
                <strong className="text-white underline decoration-red-400 font-black">
                  IN PREPARAZIONE
                </strong>{' '}
                mentre l&apos;avvio operativo dello scenario (<strong className="text-white">T0</strong>)
                è previsto tra meno di 10 minuti. Il protocollo richiede l&apos;immediata validazione{' '}
                <strong className="text-emerald-300">PRONTO SCENA</strong> o il sollecito prioritario alla
                Regia CH-3.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {activeCriticalActors.map((actorItem) => {
                  const isOverdue = actorItem.timeToT0Minutes <= 0;

                  return (
                    <div
                      key={actorItem.id}
                      className="bg-neutral-950/95 border-2 border-red-500 ring-1 ring-red-500/70 p-3.5 flex flex-col justify-between gap-3 shadow-xl"
                    >
                      {/* Top Row: Actor, Badges, Countdown */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-red-600 text-white font-black text-sm tracking-wide shadow animate-pulse">
                              {actorItem.actorCode}
                            </span>
                            <div>
                              <div className="text-sm font-black text-white flex items-center gap-1.5">
                                <span>{actorItem.actorName}</span>
                                <span className="px-1.5 py-0.2 bg-red-950 border border-red-600 text-red-300 text-[10px] font-bold uppercase">
                                  {actorItem.physicalStatus}
                                </span>
                              </div>
                              <div className="text-[11px] text-pink-300 mt-0.5">
                                Assegnato a:{' '}
                                <strong className="text-white">
                                  {actorItem.truccatriceCode} ({actorItem.truccatriceName})
                                </strong>
                              </div>
                            </div>
                          </div>

                          {/* Critical Countdown Badge */}
                          <div
                            className={`px-3 py-1.5 border text-right font-black tabular-nums ${
                              isOverdue
                                ? 'bg-red-950 text-red-100 border-red-500 animate-pulse'
                                : 'bg-red-950/80 text-amber-200 border-red-500 shadow-md'
                            }`}
                          >
                            <div className="text-[9px] uppercase tracking-wider text-red-400">
                              {isOverdue ? 'RITARDO CRITICO' : 'CONTO ALLA ROVESCIA T0'}
                            </div>
                            <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1 justify-end">
                              <Clock className="w-3.5 h-3.5 text-red-400 animate-spin" style={{ animationDuration: '6s' }} />
                              <span>
                                {isOverdue
                                  ? `+ ${Math.abs(actorItem.timeToT0Minutes)}m OLTRE T0`
                                  : `T - ${actorItem.timeToT0Minutes} MIN AL T0`}
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-300 font-normal">
                              T0 ore: <strong>{actorItem.t0Time}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Middle Info: Scenario, Postazione, Lesione */}
                        <div className="p-2.5 bg-neutral-900 border border-red-900/60 text-xs space-y-1.5 font-sans">
                          <div className="flex items-center justify-between gap-2 flex-wrap font-mono">
                            <span className="px-2 py-0.5 bg-black border border-neutral-700 text-amber-300 font-bold text-xs">
                              {actorItem.scenarioAndPatient}
                            </span>
                            <span className="text-neutral-300 text-[11px]">
                              Postazione: <strong className="text-white">{actorItem.postazioneLogistica}</strong>
                            </span>
                          </div>

                          <div className="text-[11px] text-neutral-200 leading-snug">
                            <strong className="text-red-400 font-mono">Lesione Moulage:</strong>{' '}
                            {actorItem.lesioniClinicheMoulage}
                          </div>

                          {actorItem.presidioMoulageFx && (
                            <div className="text-[10px] text-pink-300">
                              <strong className="font-mono">Presidio FX:</strong> {actorItem.presidioMoulageFx}
                            </div>
                          )}

                          {/* Red State Pill */}
                          <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-[11px] font-mono">
                            <span className="text-neutral-400">Stato Registrato:</span>
                            <span className="px-2 py-0.5 bg-red-950 text-red-200 border border-red-500 font-black flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                              IN PREPARAZIONE (NON VALIDATO)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800 font-mono">
                        <button
                          type="button"
                          onClick={() => handleValidatePronto(actorItem)}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
                          title="Conferma che l'attore è truccato e pronto, azzera l'allerta e notifica la Regia"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✓ Valida Pronto T0 (1-Click)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendUrgentRadio(actorItem)}
                          className="py-2 px-3 bg-red-900 hover:bg-red-800 text-white font-bold text-xs border border-red-500 cursor-pointer flex items-center gap-1.5 transition-colors"
                          title="Invia alert di sollecito prioritario via radio Regia CH-3"
                        >
                          <Radio className="w-3.5 h-3.5 text-red-300 animate-pulse" />
                          <span>Sollecita CH-3</span>
                        </button>

                        {onOpenArtistTimeline && (
                          <button
                            type="button"
                            onClick={() => onOpenArtistTimeline(actorItem.truccatriceCode)}
                            className="py-2 px-2.5 bg-neutral-900 hover:bg-neutral-800 text-pink-300 border border-pink-700 text-xs cursor-pointer flex items-center gap-1"
                            title={`Apri la timeline operativa di ${actorItem.truccatriceName}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Timeline</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PASSIVE REASSURING STATUS BAR WHEN ALL ACTORS ARE REGULAR */
        <div className="bg-neutral-950 border border-neutral-800 p-2.5 px-3.5 text-xs flex flex-wrap items-center justify-between gap-2 text-neutral-300">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-bold uppercase text-[11px]">
              Sistema Allerte T0 Regolare:
            </span>
            <span className="text-neutral-300 text-xs">
              Nessun attore in stato &apos;In Preparazione&apos; con tempo al T0 &lt; 10 minuti.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400 uppercase font-mono">
              Soglia Notifica: <strong>&lt; 10 min a T0</strong>
            </span>
            <button
              type="button"
              onClick={() => setSimulationTestActive(true)}
              className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 text-[10px] font-bold uppercase cursor-pointer"
              title="Avvia una simulazione di test con T -7m per verificare il banner e i controlli"
            >
              🧪 Simula Test Allerta
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
