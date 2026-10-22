import React, { useState, useEffect, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  SimulatorPatient,
  CourseDay,
  Technician,
  MakeupArtist,
  CourseActor,
} from '../../types';
import {
  DEEPHITTER_CONVOCAZIONI_TABLE,
  DeephitterTruccoEntry,
  DEEPHITTER_ACTORS,
} from '../../data/deephitterTruccoData';
import { getAssignedTechnicianForScenario } from '../../utils/staffBalancer';
import {
  getDeephitterEntryLiveStatus,
  formatMinutesCountdown,
  formatMinutesToTime,
  getSimulatedCourseMinutes,
} from '../../utils/deephitterSync';
import {
  ACTOR_MOULAGE_CHECKLISTS,
  ScenarioChecklistItem,
} from '../views/TruccatoreScenarioChecklistCard';
import {
  Sparkles,
  Wrench,
  CheckCircle2,
  Radio,
  Activity,
  Check,
  RotateCcw,
  Send,
  Droplets,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Gauge,
  Video,
  X,
  Volume2,
  CheckSquare,
} from 'lucide-react';

export interface TechSimulatorStep {
  id: string;
  label: string;
  category: 'hardware' | 'fluidi' | 'telemetria' | 'regia';
  mandatory: boolean;
}

// Tailored realistic technical simulator actions for each scenario
export const SCENARIO_TECH_CHECKLISTS: Record<
  number,
  {
    simulatorModel: string;
    targetPressure: string;
    bloodVolume: string;
    specialTechSteps: TechSimulatorStep[];
  }
> = {
  1: {
    simulatorModel: 'TraumaFX Tactical Arm + Torso Morbido Cricotiroidotomia',
    targetPressure: '220 mmHg (Pulsatile Line)',
    bloodVolume: '1500 ml Sangue Arterioso',
    specialTechSteps: [
      { id: 't1', label: 'Caricamento pompa arteriosa peristaltica (1.5L sangue fluido)', category: 'fluidi', mandatory: true },
      { id: 't2', label: 'Montaggio membrana cricotiroidea nuova e verifica piastra laringea', category: 'hardware', mandatory: true },
      { id: 't3', label: 'Allineamento telecamera PTZ Cam-1 su vie aeree & microfono collarino', category: 'regia', mandatory: true },
      { id: 't4', label: 'Setup telemetria emodinamica (FC 138, PA 75/40, SpO2 86%) su monitor CH-3', category: 'telemetria', mandatory: true },
    ],
  },
  2: {
    simulatorModel: 'Gaumard HAL S5301 Tactical Full-Body',
    targetPressure: '240 mmHg (Pulsatile Line)',
    bloodVolume: '2000 ml Sangue Alta Viscosità',
    specialTechSteps: [
      { id: 't1', label: 'Accensione compressore pneumatico interno e verifica carica batterie >85%', category: 'hardware', mandatory: true },
      { id: 't2', label: 'Spurgo aria linea vascolare femorale ed ematoma pelvico', category: 'fluidi', mandatory: true },
      { id: 't3', label: 'Test valvola PNX iperteso destro con sibilo acustico al needle decompression', category: 'hardware', mandatory: true },
      { id: 't4', label: 'Attivazione streaming audio/video verso regia e audio ambientale', category: 'regia', mandatory: true },
    ],
  },
  3: {
    simulatorModel: 'SimMan 3G Bleeding trauma kit & Toracostomia bilaterale',
    targetPressure: '210 mmHg',
    bloodVolume: '1800 ml Sangue Artificiale',
    specialTechSteps: [
      { id: 't1', label: 'Ricarica serbatoio emotorace (800ml) per drenaggio pleurico finger', category: 'fluidi', mandatory: true },
      { id: 't2', label: 'Posizionamento modulo cricotiroideo a strappo rapido per rescue airway', category: 'hardware', mandatory: true },
      { id: 't3', label: 'Calibrazione cuffia NIBP e linea arteriosa cruenta su monitor paziente', category: 'telemetria', mandatory: true },
      { id: 't4', label: 'Conferma radiocuffia CH-3 operatore e sincronizzazione countdown T0', category: 'regia', mandatory: true },
    ],
  },
  6: {
    simulatorModel: 'Tactical Trauma Manikin IED Blast & REBOA Zone 1/3',
    targetPressure: '260 mmHg (Arterial Jet)',
    bloodVolume: '2500 ml Sangue Arterioso Denso',
    specialTechSteps: [
      { id: 't1', label: 'Pressione pompa getto arterioso calibrata a 260 mmHg (arresto a TQ >280mmHg)', category: 'fluidi', mandatory: true },
      { id: 't2', label: 'Inserimento catetere guida e verifica gonfiaggio palloncino REBOA', category: 'hardware', mandatory: true },
      { id: 't3', label: 'Setup sensori per estrazione barellata basket e ancoraggio linee', category: 'hardware', mandatory: true },
      { id: 't4', label: 'Connessione streaming regia CH-3 e trigger sonoro deflagrazione IED', category: 'regia', mandatory: true },
    ],
  },
};

// Fallback generic realistic technical checklist
const DEFAULT_TECH_CHECKLIST = {
  simulatorModel: 'Simulatore Avanzato Trauma & Circuito Fluidodinamico',
  targetPressure: '220 mmHg',
  bloodVolume: '1500 ml Sangue Tattico',
  specialTechSteps: [
    { id: 't1', label: 'Verifica alimentazione manichino / carica accumulatori >80%', category: 'hardware' as const, mandatory: true },
    { id: 't2', label: 'Caricamento linee idrauliche e ricarica sangue sintetico pulsante', category: 'fluidi' as const, mandatory: true },
    { id: 't3', label: 'Verifica repere anatomici (accessi vascolari, cricotiroide, torace PNX)', category: 'hardware' as const, mandatory: true },
    { id: 't4', label: 'Test telemetria monitor multiparametrico & connettività radio Regia CH-3', category: 'telemetria' as const, mandatory: true },
  ],
};

export interface CardOperativaCongiuntaProps {
  patientId: number;
  entry?: DeephitterTruccoEntry;
  activeRolePerspective?: 'trucco' | 'tecnico' | 'regia';
  onClose?: () => void;
  isModal?: boolean;
}

export const CardOperativaCongiunta: React.FC<CardOperativaCongiuntaProps> = ({
  patientId,
  entry: propEntry,
  activeRolePerspective = 'trucco',
  onClose,
  isModal = false,
}) => {
  const {
    simulatorPatients,
    makeupArtists,
    technicians,
    actors,
    activeDay,
    currentSlot,
    timerSeconds,
    updateTechChecklist,
    updateActorProgressStatus,
    sendCourseMessage,
    language,
  } = useCourse();

  const isEn = language === 'en';

  // Find patient
  const patient = useMemo(() => {
    return simulatorPatients.find((p) => p.id === patientId) || simulatorPatients[0];
  }, [simulatorPatients, patientId]);

  // Find Deephitter entry
  const entry = useMemo(() => {
    if (propEntry) return propEntry;
    return (
      DEEPHITTER_CONVOCAZIONI_TABLE.find(
        (e) => e.day === (patient?.day || activeDay) && e.patientIds.includes(patientId)
      ) ||
      DEEPHITTER_CONVOCAZIONI_TABLE.find((e) => e.patientIds.includes(patientId)) ||
      DEEPHITTER_CONVOCAZIONI_TABLE[0]
    );
  }, [propEntry, patient, activeDay, patientId]);

  // Paired actors, makeup artists, technicians
  const assignedActor = useMemo(() => {
    return (
      actors.find(
        (a) =>
          a.badgeCode?.toUpperCase() === entry.actorCode?.toUpperCase() ||
          a.id === patient?.assignedActorId
      ) || actors[0]
    );
  }, [actors, entry, patient]);

  const assignedMakeupArtist = useMemo(() => {
    return (
      makeupArtists.find(
        (m) =>
          m.badgeCode?.toUpperCase() === entry.truccatriceCode?.toUpperCase() ||
          m.id === patient?.assignedMakeupArtistId
      ) || makeupArtists[0]
    );
  }, [makeupArtists, entry, patient]);

  const assignedTech = useMemo(() => {
    return getAssignedTechnicianForScenario(
      technicians,
      patientId,
      entry.postazioneLogistica
    );
  }, [technicians, patientId, entry]);

  // Real-time simulated course clock
  const currentCourseMinutes = useMemo(() => {
    return getSimulatedCourseMinutes(currentSlot, timerSeconds);
  }, [currentSlot, timerSeconds]);

  // Live status
  const liveStatus = useMemo(() => {
    const effectiveProgress = patient?.techChecklist?.preDone ? 'PRONTO_T0' : assignedActor?.progressStatus;
    return getDeephitterEntryLiveStatus(
      entry,
      currentCourseMinutes,
      effectiveProgress
    );
  }, [entry, currentCourseMinutes, assignedActor?.progressStatus, patient?.techChecklist?.preDone]);

  // Moulage data
  const moulageData = useMemo(() => {
    const key = assignedActor?.badgeCode || entry.actorCode || 'ACT-01';
    return (
      ACTOR_MOULAGE_CHECKLISTS[key] ||
      ACTOR_MOULAGE_CHECKLISTS['ACT-01'] || {
        protesiTitle: 'Kit Moulage Balistico Avanzato',
        protesiSteps: [
          { id: 'p1', label: 'Allestimento base siliconica ed osso sintetico', type: 'protesi', mandatory: true },
          { id: 'p2', label: 'Connessione linea arteriosa pulsante a 220 mmHg', type: 'protesi', mandatory: true },
        ],
        consumables: [
          { id: 'c1', label: 'Sangue sintetico arterioso', type: 'consumabile', quantity: '1000 ml', mandatory: true },
          { id: 'c2', label: 'Mastice adesivo Pros-Aide', type: 'consumabile', quantity: '30 ml', mandatory: true },
        ],
        safetyCues: 'Verificare comfort attore e assenza costrizioni circolatorie a monte.',
      }
    );
  }, [assignedActor, entry]);

  // Tech data
  const techData = useMemo(() => {
    return SCENARIO_TECH_CHECKLISTS[patientId] || DEFAULT_TECH_CHECKLIST;
  }, [patientId]);

  // Persistence keys
  const truccoStorageKey = `trucco_checklist_${patientId}_${entry.blockNumber}`;
  const techStorageKey = `tech_sim_checklist_${patientId}_${entry.blockNumber}`;

  // Local checklist states
  const [truccoCheckedMap, setTruccoCheckedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(truccoStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    const init: Record<string, boolean> = {};
    moulageData.protesiSteps.forEach((s) => (init[s.id] = false));
    moulageData.consumables.forEach((c) => (init[c.id] = false));
    return init;
  });

  const [techCheckedMap, setTechCheckedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(techStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    const init: Record<string, boolean> = {};
    techData.specialTechSteps.forEach((s) => (init[s.id] = false));
    return init;
  });

  const [lastRadioFeedback, setLastRadioFeedback] = useState<string | null>(null);
  const [radioToastOpen, setRadioToastOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(truccoStorageKey, JSON.stringify(truccoCheckedMap));
    } catch {
      // ignore
    }
  }, [truccoCheckedMap, truccoStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(techStorageKey, JSON.stringify(techCheckedMap));
    } catch {
      // ignore
    }
  }, [techCheckedMap, techStorageKey]);

  // Checklist counts
  const truccoTotalItems = moulageData.protesiSteps.length + moulageData.consumables.length;
  const truccoCheckedCount = Object.values(truccoCheckedMap).filter(Boolean).length;
  const isTruccoComplete = truccoCheckedCount >= truccoTotalItems && truccoTotalItems > 0;

  const techTotalItems = techData.specialTechSteps.length;
  const techCheckedCount = Object.values(techCheckedMap).filter(Boolean).length;
  const isTechComplete = techCheckedCount >= techTotalItems && techTotalItems > 0;

  // Global readiness state
  const isPreDone = Boolean(patient?.techChecklist?.preDone);
  const isJointReady = isPreDone || (isTruccoComplete && isTechComplete);

  // Handle toggles
  const toggleTruccoItem = (id: string) => {
    setTruccoCheckedMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      return next;
    });
  };

  const toggleTechItem = (id: string) => {
    setTechCheckedMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      return next;
    });
  };

  // Broadcast instant feedback to Regia CH-3
  const handleBroadcastRadioFeedback = (customMessage?: string) => {
    const timestamp = new Date().toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const statusTruccoText = isTruccoComplete
      ? 'TRUCCO COMPLETATO ✓'
      : `Trucco ${truccoCheckedCount}/${truccoTotalItems}`;
    const statusTechText = isTechComplete
      ? 'HARDWARE SIMULATORE OK ✓'
      : `Tecnico ${techCheckedCount}/${techTotalItems}`;

    const content =
      customMessage ||
      `[CARD CONGIUNTA] Postazione ${entry.postazioneLogistica} • ${entry.scenarioAndPatient}: Truccatrice ${assignedMakeupArtist.badgeCode} (${statusTruccoText}) e Tecnico ${assignedTech.badgeCode} (${statusTechText}) • Canale CH-3 verificato. Target T-15' pronto!`;

    if (sendCourseMessage) {
      sendCourseMessage({
        senderId:
          activeRolePerspective === 'trucco'
            ? assignedMakeupArtist.badgeCode
            : assignedTech.badgeCode,
        senderName:
          activeRolePerspective === 'trucco'
            ? assignedMakeupArtist.name
            : assignedTech.name,
        senderRole: 'tecnico',
        type: isJointReady ? 'warning' : 'info',
        subject: `[CH-3 REPORT CONGIUNTO] ${entry.scenarioAndPatient} • ${entry.postazioneLogistica}`,
        content,
      });
    }

    setLastRadioFeedback(`Trasmesso a Regia CH-3 alle ore ${timestamp}`);
    setRadioToastOpen(true);
    setTimeout(() => setRadioToastOpen(false), 4500);
  };

  // 1-Click Joint Ready validation
  const handleValidateJointReady = () => {
    // 1. Mark patient preDone
    updateTechChecklist(patientId, 'preDone', true);

    // 2. Mark actor PRONTO_T0
    if (assignedActor) {
      updateActorProgressStatus(assignedActor.id, 'PRONTO_T0', {
        patientId,
        updatedBy: `${assignedMakeupArtist.badgeCode} & ${assignedTech.badgeCode}`,
        notifyRegia: true,
      });
    }

    // 3. Mark all checklist items as checked
    const newTrucco: Record<string, boolean> = {};
    moulageData.protesiSteps.forEach((s) => (newTrucco[s.id] = true));
    moulageData.consumables.forEach((c) => (newTrucco[c.id] = true));
    setTruccoCheckedMap(newTrucco);

    const newTech: Record<string, boolean> = {};
    techData.specialTechSteps.forEach((s) => (newTech[s.id] = true));
    setTechCheckedMap(newTech);

    // 4. Send high-priority instant radio broadcast
    handleBroadcastRadioFeedback(
      `🟢 [LUCE VERDE CONGIUNTA T-15'] RAGGIUNTA! ${entry.scenarioAndPatient} (${entry.postazioneLogistica}): Trucco FX e Regia Tecnico Simulatore convalidati al 100%! Barella pronta all'ingaggio.`
    );
  };

  const handleResetChecklist = () => {
    updateTechChecklist(patientId, 'preDone', false);
    if (assignedActor && assignedActor.progressStatus === 'PRONTO_T0') {
      updateActorProgressStatus(assignedActor.id, 'IN_PREPARAZIONE', {
        patientId,
        updatedBy: `${assignedMakeupArtist.badgeCode} & ${assignedTech.badgeCode}`,
        notifyRegia: false,
      });
    }

    const initTrucco: Record<string, boolean> = {};
    moulageData.protesiSteps.forEach((s) => (initTrucco[s.id] = false));
    moulageData.consumables.forEach((c) => (initTrucco[c.id] = false));
    setTruccoCheckedMap(initTrucco);

    const initTech: Record<string, boolean> = {};
    techData.specialTechSteps.forEach((s) => (initTech[s.id] = false));
    setTechCheckedMap(initTech);

    handleBroadcastRadioFeedback(
      `🔄 [RESET ATTIVITÀ] ${entry.scenarioAndPatient}: Checklist ripristinata in stato PREPARAZIONE attiva.`
    );
  };

  return (
    <div
      className={`bg-neutral-950 border-2 ${
        isJointReady
          ? 'border-emerald-500 shadow-emerald-950/40'
          : 'border-fuchsia-500/80 shadow-fuchsia-950/30'
      } rounded-2xl shadow-2xl overflow-hidden font-sans transition-all`}
    >
      {/* Toast Notifica Radio Regia */}
      {radioToastOpen && lastRadioFeedback && (
        <div className="bg-emerald-500 text-black px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>{lastRadioFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setRadioToastOpen(false)}
            className="p-1 hover:bg-black/20 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP HEADER: TITOLO SCENARIO, AFFIANCAMENTO E STATO CONGIUNTO */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 p-4 border-b border-neutral-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Badge & Scenario */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-black font-mono text-xs uppercase tracking-wider rounded flex items-center gap-1.5 shadow">
              <Layers className="w-3.5 h-3.5" />
              <span>CARD OPERATIVA CONGIUNTA</span>
            </span>

            <span className="px-2.5 py-1 bg-pink-950 text-pink-300 border border-pink-700/60 font-mono font-bold text-xs rounded">
              BLOCCO {entry.blockNumber} • DAY 0{patient.day}
            </span>

            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>{entry.scenarioAndPatient}</span>
              <span className="text-xs text-neutral-400 font-normal">
                ({entry.postazioneLogistica})
              </span>
            </h3>
          </div>

          {/* Azioni rapide top */}
          <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
            <span
              className={`px-3 py-1 text-xs font-black font-mono uppercase tracking-wider rounded border flex items-center gap-1.5 shadow-md ${
                isJointReady
                  ? 'bg-emerald-500 text-black border-emerald-400 animate-pulse'
                  : 'bg-neutral-900 text-amber-300 border-amber-500/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isJointReady
                  ? '🟢 PRONTO CONGIUNTO (T-15\') OK'
                  : `🟡 IN PREPARAZIONE (${truccoCheckedCount + techCheckedCount}/${truccoTotalItems + techTotalItems})`}
              </span>
            </span>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded cursor-pointer transition-colors"
                title="Chiudi Card"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Protocol Timing Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
          <div className="p-2 bg-black/60 rounded border border-neutral-800 text-center">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">1. Convocazione</span>
            <span className="font-bold text-white text-xs tabular-nums">{entry.convocazioneTime}</span>
          </div>
          <div className="p-2 bg-black/60 rounded border border-neutral-800 text-center">
            <span className="text-[10px] text-fuchsia-400 uppercase font-bold block">2. Finestra Trucco/Tech</span>
            <span className="font-bold text-neutral-200 text-xs tabular-nums">{entry.finestraTrucco}</span>
          </div>
          <div className="p-2 bg-black/60 rounded border border-neutral-800 text-center">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">3. Pronto Scena (T-15')</span>
            <span className="font-bold text-emerald-400 text-xs tabular-nums">{entry.prontoTime}</span>
          </div>
          <div className="p-2 bg-black/60 rounded border border-neutral-800 text-center">
            <span className="text-[10px] text-red-400 uppercase font-bold block">4. T0 Ingaggio Scena</span>
            <span className="font-bold text-red-400 text-xs tabular-nums">{entry.t0Time}</span>
          </div>
        </div>

        {/* BARRA SINERGICA DEI DUE OPERATORI AFFIANCATI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {/* Operatore 1: Truccatrice */}
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
              activeRolePerspective === 'trucco'
                ? 'bg-fuchsia-950/50 border-fuchsia-500 shadow-lg ring-1 ring-fuchsia-400/50'
                : 'bg-black/50 border-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 bg-fuchsia-600 text-white font-mono font-black text-xs rounded shrink-0">
                {assignedMakeupArtist.badgeCode}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                  <span className="truncate">{assignedMakeupArtist.name}</span>
                </div>
                <div className="text-[10px] text-fuchsia-300 font-mono truncate">
                  {assignedMakeupArtist.role}
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded border shrink-0 ${
                isTruccoComplete
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-neutral-900 text-fuchsia-300 border-fuchsia-700'
              }`}
            >
              {isTruccoComplete ? '✓ Trucco OK' : `${truccoCheckedCount}/${truccoTotalItems}`}
            </span>
          </div>

          {/* Operatore 2: Tecnico di Regia */}
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
              activeRolePerspective === 'tecnico'
                ? 'bg-cyan-950/50 border-cyan-500 shadow-lg ring-1 ring-cyan-400/50'
                : 'bg-black/50 border-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 bg-cyan-600 text-white font-mono font-black text-xs rounded shrink-0">
                {assignedTech.badgeCode}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{assignedTech.name}</span>
                </div>
                <div className="text-[10px] text-cyan-300 font-mono truncate flex items-center gap-1">
                  <Radio className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>CH-3 • {assignedTech.specialty}</span>
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded border shrink-0 ${
                isTechComplete
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-neutral-900 text-cyan-300 border-cyan-700'
              }`}
            >
              {isTechComplete ? '✓ Hardware OK' : `${techCheckedCount}/${techTotalItems}`}
            </span>
          </div>
        </div>
      </div>

      {/* CORPO PRINCIPALE: VISUALIZZAZIONE SIMULTANEA DELLE DUE CHECKLIST */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* COLONNA 1: ATTIVITÀ DI TRUCCO & MOULAGE (TRUCCATRICE) */}
        <div className="bg-neutral-900/80 border border-fuchsia-500/40 rounded-xl p-3.5 sm:p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-fuchsia-500/30 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              <h4 className="text-xs sm:text-sm font-black text-fuchsia-300 uppercase tracking-wider font-mono">
                ATTIVITÀ TRUCCO & MOULAGE
              </h4>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              Attore: <strong className="text-white">{assignedActor.badgeCode}</strong> ({assignedActor.physicalStatus || 'INTERO'})
            </span>
          </div>

          {/* Dettagli Lesioni Cliniche */}
          <div className="p-2.5 bg-black/60 rounded-lg border border-neutral-800 space-y-1">
            <span className="text-[10px] text-fuchsia-400 uppercase font-mono font-bold block">
              🎯 Target Lesione / Protesi Scenica:
            </span>
            <p className="text-xs text-white font-sans font-medium">
              {moulageData.protesiTitle}
            </p>
            <p className="text-[11px] text-neutral-400 font-sans">
              {entry.lesioniClinicheMoulage}
            </p>
          </div>

          {/* Step Protesici Spuntabili */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 font-bold uppercase">
              <span>Passaggi Protesici & Fissaggio</span>
              <span>Spunta Condivisa</span>
            </div>

            <div className="space-y-1.5">
              {moulageData.protesiSteps.map((step) => {
                const isChecked = Boolean(truccoCheckedMap[step.id]);
                return (
                  <label
                    key={step.id}
                    onClick={() => toggleTruccoItem(step.id)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200'
                        : 'bg-neutral-950 border-neutral-800 hover:border-fuchsia-500/60 text-neutral-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-neutral-600 bg-neutral-900'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 text-xs font-sans leading-snug">
                      <span className={isChecked ? 'line-through text-neutral-400' : 'text-neutral-200'}>
                        {step.label}
                      </span>
                      {step.mandatory && (
                        <span className="text-[10px] text-pink-400 font-mono ml-1.5 font-bold uppercase">
                          [Tassativo]
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Consumabili e Ricarica Fluidi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 font-bold uppercase">
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-red-400" />
                <span>Consumabili & Sangue</span>
              </span>
              <span className="text-[10px] text-amber-300 font-mono">{entry.presidioMoulageFx}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {moulageData.consumables.map((item) => {
                const isChecked = Boolean(truccoCheckedMap[item.id]);
                return (
                  <label
                    key={item.id}
                    onClick={() => toggleTruccoItem(item.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200'
                        : 'bg-neutral-950 border-neutral-800 hover:border-fuchsia-500/50 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-400 text-black'
                            : 'border-neutral-600 bg-neutral-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-xs font-sans truncate ${
                          isChecked ? 'line-through text-neutral-400' : 'text-neutral-200'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {item.quantity && (
                      <span className="px-1.5 py-0.5 bg-black border border-neutral-700 text-amber-300 font-mono text-[9px] font-bold shrink-0 ml-1.5">
                        {item.quantity}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Presidio Sicurezza Attore */}
          <div className="p-2 bg-neutral-950 rounded border border-neutral-800 text-[11px] text-neutral-400 font-sans flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200">Sicurezza Attore:</strong>{' '}
              {moulageData.safetyCues}
            </div>
          </div>
        </div>

        {/* COLONNA 2: AZIONI TECNICHE SUL SIMULATORE & REGIA (TECNICO) */}
        <div className="bg-neutral-900/80 border border-cyan-500/40 rounded-xl p-3.5 sm:p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2.5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs sm:text-sm font-black text-cyan-300 uppercase tracking-wider font-mono">
                AZIONI TECNICHE SUL SIMULATORE
              </h4>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              Presidio: <strong className="text-white">{assignedTech.badgeCode}</strong> (Canale CH-3)
            </span>
          </div>

          {/* Dettagli Hardware & Linea Pressione */}
          <div className="p-2.5 bg-black/60 rounded-lg border border-neutral-800 space-y-1 font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-cyan-400 font-bold uppercase">⚙️ Manichino & Modello:</span>
              <span className="text-white font-bold">{techData.simulatorModel}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
              <span>Pressione Arteriosa Target: <strong className="text-amber-300">{techData.targetPressure}</strong></span>
              <span>Carica Serbatoio: <strong className="text-red-400">{techData.bloodVolume}</strong></span>
            </div>
          </div>

          {/* Step Tecnici Spuntabili */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 font-bold uppercase">
              <span>Calibrazione Hardware, Fluidi & Telemetria</span>
              <span>Spunta Condivisa</span>
            </div>

            <div className="space-y-1.5">
              {techData.specialTechSteps.map((step) => {
                const isChecked = Boolean(techCheckedMap[step.id]);
                return (
                  <label
                    key={step.id}
                    onClick={() => toggleTechItem(step.id)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200'
                        : 'bg-neutral-950 border-neutral-800 hover:border-cyan-500/60 text-neutral-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-neutral-600 bg-neutral-900'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 text-xs font-sans leading-snug">
                      <span className={isChecked ? 'line-through text-neutral-400' : 'text-neutral-200'}>
                        {step.label}
                      </span>
                      {step.mandatory && (
                        <span className="text-[10px] text-cyan-400 font-mono ml-1.5 font-bold uppercase">
                          [Mandatorio]
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Dettagli Regia e Audio/Video */}
          <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>Regia PTZ & Streaming:</span>
              </span>
              <span className="px-2 py-0.5 bg-black border border-cyan-700/60 text-cyan-300 text-[10px] font-bold rounded">
                LIVE HD ON AIR
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Canale Audio Tattico:</span>
              </span>
              <strong className="text-white">CH-3 TECNICI (In Ascolto)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER AZIONI: CONVALIDA CONGIUNTA & FEEDBACK ISTANTANEO ALLA REGIA */}
      <div className="p-4 bg-neutral-900 border-t border-neutral-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black font-mono uppercase text-white">
                Sincronizzazione Live Trucco ↔ Tecnico ↔ Regia
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[11px] text-neutral-400 font-sans">
              Le spunte sono condivise simultaneamente in tempo reale tra Truccatore, Tecnico di Postazione e Regia Centrale.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Pulsante Trasmetti Feedback Istantaneo a Regia */}
            <button
              type="button"
              onClick={() => handleBroadcastRadioFeedback()}
              className="px-3.5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-amber-300 border border-amber-500/60 font-mono font-black text-xs uppercase tracking-wider rounded-lg cursor-pointer flex items-center gap-2 shadow transition-all active:scale-95"
            >
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Invia Feedback Radio Regia CH-3</span>
            </button>

            {/* Pulsante Reset */}
            {isJointReady && (
              <button
                type="button"
                onClick={handleResetChecklist}
                className="p-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 rounded-lg cursor-pointer transition-colors"
                title="Ripristina checklist congiunta"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Pulsante Principale di Convalida Scena Congiunta */}
        <div>
          <button
            type="button"
            onClick={handleValidateJointReady}
            className={`w-full py-3.5 px-4 font-black font-mono text-xs sm:text-sm uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-[0.99] ${
              isJointReady
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-black shadow-emerald-500/25 ring-2 ring-emerald-400'
                : 'bg-gradient-to-r from-pink-600 via-fuchsia-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white shadow-fuchsia-600/30'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {isJointReady
                ? '✓ CONVALIDA CONGIUNTA ESEGUITA • LUCE VERDE NOTIFICATA ALLA REGIA CH-3'
                : `CONFERMA TARGET CONGIUNTO PRONTO SCENA (T-15\') [${truccoCheckedCount + techCheckedCount}/${truccoTotalItems + techTotalItems}]`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
