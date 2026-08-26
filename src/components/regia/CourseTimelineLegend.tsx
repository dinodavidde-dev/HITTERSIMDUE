import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Building,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Flame,
  GraduationCap,
  HelpCircle,
  Info,
  Layers,
  Moon,
  Radio,
  Sparkles,
  Stethoscope,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { ActivityType, GroupType, Team } from '../../types';

export type TimelineStatusState = 'active' | 'upcoming' | 'pending_feedback' | 'completed';

interface CourseTimelineLegendProps {
  activeDay?: number;
  currentSlotTitle?: string;
  currentSlotTimeRange?: string;
  totalPendingEvaluations?: number;
  totalCompletedEvaluations?: number;
  selectedStatusFilter?: TimelineStatusState | 'ALL';
  onSelectStatusFilter?: (status: TimelineStatusState | 'ALL') => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const CourseTimelineLegend: React.FC<CourseTimelineLegendProps> = ({
  activeDay = 2,
  currentSlotTitle,
  currentSlotTimeRange,
  totalPendingEvaluations = 0,
  totalCompletedEvaluations = 0,
  selectedStatusFilter = 'ALL',
  onSelectStatusFilter,
  className = '',
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'status_states' | 'module_types' | 'workflow'>('status_states');
  const [interactiveSelectedState, setInteractiveSelectedState] = useState<TimelineStatusState | null>('active');

  const handleStateClick = (state: TimelineStatusState) => {
    if (interactiveSelectedState === state) {
      setInteractiveSelectedState(null);
      if (onSelectStatusFilter) onSelectStatusFilter('ALL');
    } else {
      setInteractiveSelectedState(state);
      if (onSelectStatusFilter) onSelectStatusFilter(state);
    }
  };

  const STATUS_DEFINITIONS: {
    id: TimelineStatusState;
    title: string;
    subtitle: string;
    badgeText: string;
    badgeStyle: string;
    containerStyle: string;
    icon: React.ReactNode;
    description: string;
    rules: string[];
    visualIndicator: string;
    actionHint: string;
  }[] = [
    {
      id: 'active',
      title: 'Active (In Corso / Live T0)',
      subtitle: 'Fase Attiva in Tempo Reale',
      badgeText: '★ LIVE T0 • IN CORSO',
      badgeStyle: 'bg-yellow-500 text-black font-black border-yellow-300 animate-pulse',
      containerStyle: 'border-yellow-400 bg-neutral-900/90 ring-1 ring-yellow-400/40',
      icon: <Radio className="w-4 h-4 text-yellow-400 animate-pulse" />,
      description:
        'Lo slot o modulo didattico attualmente in svolgimento secondo il cronoprogramma di regia. Il timer di sessione è sincronizzato con tutte le 12 squadre e postazioni.',
      rules: [
        'Timer master di regia attivo con countdown sonoro e sincronizzazione WebSocket/client.',
        'Squadre impegnate direttamente nei simulatori di Shock Room, TCCC extra-ospedaliero o workshop.',
        'Regia master e tecnici monitorano telecamere a circuito chiuso, parametri fisiologici e presidi.',
      ],
      visualIndicator: 'Bordo giallo evidenziato, badge pulsante ★ LIVE T0, sfondo scuro ad alto contrasto.',
      actionHint: 'Clicca per focalizzare i dettagli dello slot in corso e i 4 gruppi operativi.',
    },
    {
      id: 'upcoming',
      title: 'Upcoming (In Arrivo / T+1 / Programmato)',
      subtitle: 'Prossima Rotazione / Pre-Allerta T-30m',
      badgeText: 'T+1 PROSSIMO / PROGRAMMATO',
      badgeStyle: 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500',
      containerStyle: 'border-cyan-500/70 bg-neutral-900/70 hover:border-cyan-400',
      icon: <Clock className="w-4 h-4 text-cyan-400" />,
      description:
        'Modulo successivo nel programma didattico (T+1). Include la finestra di pre-allerta T-30 minuti per attori, tecnici, truccatori e preparazione dei simulatori di trauma.',
      rules: [
        'Segnale di pre-allerta inviato automaticamente a tecnici e simulatori 30 minuti prima.',
        'Verifica disponibilità sangue artificiale, protesi anatomiche e presidi REBOA/toracotomia.',
        'Preparazione al cambio aula e rotazione logistica per i 4 gruppi (A, B, C, D).',
      ],
      visualIndicator: 'Bordo ciano luminoso, badge T+1 PROSSIMO, indicatore di durata programmata.',
      actionHint: 'Clicca per visualizzare la scheda tecnica anticipata e l\'inventario dei presidi.',
    },
    {
      id: 'pending_feedback',
      title: 'Pending Feedback (In Attesa di Valutazione)',
      subtitle: 'Debriefing e Scoring Non Archiviati',
      badgeText: '⚠️ FEEDBACK PENDING',
      badgeStyle: 'bg-amber-500 text-black font-black border-amber-300 animate-pulse',
      containerStyle: 'border-amber-500/80 bg-amber-950/20 ring-1 ring-amber-500/40',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />,
      description:
        'La squadra ha completato la rotazione dello scenario pratico, ma il tutor responsabile assegnato non ha ancora archiviato la scheda di debriefing e i punteggi della rubrica (1-5).',
      rules: [
        'Ogni tutor è responsabile della valutazione della propria squadra solo ed esclusivamente durante gli scenari pratici.',
        'I moduli teorici, plenari e pause sono esclusi e non generano avvisi di feedback pendente.',
        'La faculty può convalidare singolarmente oppure utilizzare la convalida rapida / bulk debriefing per la propria squadra.',
      ],
      visualIndicator: 'Badge giallo/arancione lampeggiante ⚠️ con conteggio slot pendenti e icona di allerta.',
      actionHint: 'Clicca per aprire la scheda di debriefing rapido o inviare un sollecito al tutor.',
    },
    {
      id: 'completed',
      title: 'Completed (Convalidato / Valutato)',
      subtitle: 'Debriefing Archiviato con Esito Positivo',
      badgeText: '✓ VALUTATA / COMPLETATO',
      badgeStyle: 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-600',
      containerStyle: 'border-emerald-600/70 bg-neutral-950 hover:border-emerald-500',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      description:
        'Valutazione formale salvata con successo. Include i punteggi sui 5 assi (ABCDE, Tecnico, CRM/Leadership, Handover SBAR, Sicurezza/Tempi) e la lista delle manovre validate.',
      rules: [
        'Scheda storicizzata e visibile nella matrice di scoring generale e nel profilo della squadra.',
        'Feedback qualitativo su punti di forza e aree di miglioramento disponibile per i discenti.',
        'Stato convalidato a livello centrale con marcatura oraria e firma del docente valutatore.',
      ],
      visualIndicator: 'Bordo verde smeraldo, icona check ✓ e riassunto punteggio 1-5 registrato.',
      actionHint: 'Clicca per consultare i punteggi dettagliati e le note qualitative di debriefing.',
    },
  ];

  const MODULE_TYPES: {
    type: ActivityType;
    label: string;
    location: string;
    colorBadge: string;
    borderStyle: string;
    bgStyle: string;
    icon: React.ReactNode;
    summary: string;
    keyProcedures: string[];
  }[] = [
    {
      type: 'scenario_extra',
      label: 'SCENARIO EXTRA-OSPEDALIERO (TCCC)',
      location: 'Area Tattica Esterna / Tunnel Triage',
      colorBadge: 'bg-blue-600 text-white font-black',
      borderStyle: 'border-blue-500',
      bgStyle: 'bg-blue-950/30',
      icon: <Flame className="w-4 h-4 text-cyan-400" />,
      summary: 'Soccorso sotto fuoco (CUF), Tactical Field Care, estrazione Sked e gestione delle vie aeree tattiche.',
      keyProcedures: ['Tourniquet CAT/SOFTT', 'Cricotirotomia CRIC', 'Needle Decompression 14G', 'Benda Emostatica QuikClot'],
    },
    {
      type: 'scenario_intra',
      label: 'SCENARIO INTRA-OSPEDALIERO (SHOCK ROOM)',
      location: 'Shock Room 1 & 2 / Trauma Center',
      colorBadge: 'bg-emerald-600 text-white font-black',
      borderStyle: 'border-emerald-500',
      bgStyle: 'bg-emerald-950/30',
      icon: <Building className="w-4 h-4 text-emerald-400" />,
      summary: 'Resuscitation avanzata, Damage Control Surgery, cateterismo endovascolare e stabilizzazione emodinamica.',
      keyProcedures: ['Catetere REBOA Zone 1/3', 'Toracotomia Resuscitativa', 'Drenaggio Pleurico Bulau', 'Pelvic Binder'],
    },
    {
      type: 'workshop',
      label: 'WORKSHOP TCCC MILITARY (MULTI-STATION)',
      location: 'Aule Addestramento & Simulatori Task-Trainer',
      colorBadge: 'bg-purple-600 text-white font-black',
      borderStyle: 'border-purple-500',
      bgStyle: 'bg-purple-950/30',
      icon: <Wrench className="w-4 h-4 text-purple-400" />,
      summary: 'Addestramento intensivo a stazioni parallele con convalida rapida delle competenze pratiche.',
      keyProcedures: ['Trascinamento e Barella Sked', 'Controllo Emorragie Giunzionali', 'Immobilizzazione spinale rapida'],
    },
    {
      type: 'skills',
      label: 'SKILLS LAB PROCEDURALE',
      location: 'Laboratorio Manichini Avanzati',
      colorBadge: 'bg-fuchsia-600 text-white font-black',
      borderStyle: 'border-fuchsia-500',
      bgStyle: 'bg-fuchsia-950/30',
      icon: <Layers className="w-4 h-4 text-fuchsia-400" />,
      summary: 'Perfezionamento gesti tecnici specifici, accessi vascolari e presidi salva-vita.',
      keyProcedures: ['Accesso Intraosseo FAST1 / EZ-IO', 'Videolaringoscopia con Bougie', 'Packing PPP'],
    },
    {
      type: 'debriefing',
      label: 'DEBRIEFING & HANDOVER SBAR',
      location: 'Aula Plenaria / Postazioni Didattiche',
      colorBadge: 'bg-amber-500 text-black font-black',
      borderStyle: 'border-amber-500',
      bgStyle: 'bg-amber-950/30',
      icon: <GraduationCap className="w-4 h-4 text-amber-400" />,
      summary: 'Analisi critica ABCDE, Closed-Loop Communication, leadership di squadra e identificazione non-conformità.',
      keyProcedures: ['Handover SBAR Strutturato', 'Analisi CRM / Non-Technical Skills', 'Action Plan Correttivo'],
    },
    {
      type: 'night_scenario',
      label: 'SCENARIO NOTTURNO (MCI MAXIEMERGENZA)',
      location: 'Setting Notturno con Visori NVG & Luce UV',
      colorBadge: 'bg-indigo-600 text-white font-black',
      borderStyle: 'border-indigo-500',
      bgStyle: 'bg-indigo-950/30',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      summary: 'Gestione del panico e triage massivo in condizioni di buio e visibilità degradata.',
      keyProcedures: ['Triage Tattico Massivo', 'Segnalatori IR/UV', 'Emostasi in Luce Degradata'],
    },
  ];

  return (
    <div
      id="course-timeline-legend-container"
      className={`bg-neutral-950 border-2 border-neutral-800 shadow-2xl transition-all overflow-hidden ${className}`}
    >
      {/* Header Bar with Toggle & Quick Live Summary */}
      <div className="bg-neutral-900/90 p-3 sm:p-4 border-b border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500 text-black font-black flex items-center justify-center border border-yellow-300 shadow-sm flex-shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-mono">
                LEGENDA INTERATTIVA TIMELINE & STATI MODULI CORSO
              </h3>
              <span className="text-[10px] font-mono font-bold bg-neutral-800 text-yellow-300 px-2 py-0.5 border border-neutral-700">
                DAY 0{activeDay}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Guida cromatica interattiva agli stati operativi (Active, Upcoming, Pending Feedback, Completed) e alle tipologie di modulo didattico.
            </p>
          </div>
        </div>

        {/* Live Counters & Expand Button */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end flex-wrap">
          {/* Quick status counters */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span
              onClick={() => handleStateClick('active')}
              className="px-2 py-1 bg-yellow-500/20 border border-yellow-500 text-yellow-300 font-bold cursor-pointer hover:bg-yellow-500/30 flex items-center gap-1 transition-colors"
              title="Slot e modulo attualmente attivo"
            >
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
              <span>LIVE</span>
            </span>

            {totalPendingEvaluations > 0 ? (
              <span
                onClick={() => handleStateClick('pending_feedback')}
                className="px-2 py-1 bg-amber-500/20 border border-amber-500 text-amber-300 font-bold cursor-pointer hover:bg-amber-500/30 flex items-center gap-1 animate-pulse transition-colors"
                title={`${totalPendingEvaluations} debriefing in attesa`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>{totalPendingEvaluations} PENDING</span>
              </span>
            ) : (
              <span
                onClick={() => handleStateClick('completed')}
                className="px-2 py-1 bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold cursor-pointer hover:bg-emerald-900/50 flex items-center gap-1 transition-colors"
                title="Tutti i debriefing completati"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>{totalCompletedEvaluations} VALUTATI</span>
              </span>
            )}
          </div>

          {/* Toggle Expand / Collapse Button */}
          <button
            type="button"
            id="timeline-legend-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 text-xs font-bold font-mono uppercase cursor-pointer flex items-center gap-1 transition-colors"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Riduci Legenda' : 'Espandi Legenda'}
          >
            <span>{isExpanded ? 'Comprimi' : 'Espandi'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Expandable Content */}
      {isExpanded && (
        <div className="p-3 sm:p-5 space-y-4 animate-in fade-in duration-200">
          {/* Section Sub-Tabs */}
          <div className="flex items-center gap-1 border-b border-neutral-800 pb-2.5 flex-wrap">
            <button
              type="button"
              id="timeline-legend-tab-states"
              onClick={() => setActiveTab('status_states')}
              className={`px-3 py-1.5 text-xs font-mono font-black uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'status_states'
                  ? 'bg-yellow-500 text-black border-yellow-300 shadow-md'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>1. STATI OPERATIVI (4 STATI)</span>
            </button>

            <button
              type="button"
              id="timeline-legend-tab-modules"
              onClick={() => setActiveTab('module_types')}
              className={`px-3 py-1.5 text-xs font-mono font-black uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'module_types'
                  ? 'bg-yellow-500 text-black border-yellow-300 shadow-md'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. TIPOLOGIE MODULI & COLORI (6 TIPI)</span>
            </button>

            <button
              type="button"
              id="timeline-legend-tab-workflow"
              onClick={() => setActiveTab('workflow')}
              className={`px-3 py-1.5 text-xs font-mono font-black uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'workflow'
                  ? 'bg-yellow-500 text-black border-yellow-300 shadow-md'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>3. FLUSSO TRANSIZIONE STATI (WORKFLOW)</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: 4 STATUS STATES (ACTIVE, UPCOMING, PENDING FEEDBACK, COMPLETED) */}
          {/* ========================================================================= */}
          {activeTab === 'status_states' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold">
                  Clicca su uno stato per visualizzare i criteri operativi dettagliati:
                </span>
                {interactiveSelectedState && (
                  <button
                    type="button"
                    onClick={() => {
                      setInteractiveSelectedState(null);
                      if (onSelectStatusFilter) onSelectStatusFilter('ALL');
                    }}
                    className="text-[10px] font-mono text-neutral-400 hover:text-white underline cursor-pointer"
                  >
                    Reset selezione
                  </button>
                )}
              </div>

              {/* 4 Interactive State Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {STATUS_DEFINITIONS.map((st) => {
                  const isSelected = interactiveSelectedState === st.id;

                  return (
                    <div
                      key={st.id}
                      id={`timeline-legend-state-card-${st.id}`}
                      onClick={() => handleStateClick(st.id)}
                      className={`p-3.5 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                        isSelected
                          ? `${st.containerStyle} shadow-xl scale-[1.02] z-10`
                          : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 opacity-90 hover:opacity-100'
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider border ${st.badgeStyle}`}
                          >
                            {st.badgeText}
                          </span>
                          <div className="p-1 bg-neutral-950 border border-neutral-800">
                            {st.icon}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                            {st.title}
                          </h4>
                          <p className="text-[10px] font-mono text-neutral-400 font-semibold mt-0.5">
                            {st.subtitle}
                          </p>
                        </div>

                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                          {st.description}
                        </p>
                      </div>

                      {/* Bottom Visual Pattern Pill */}
                      <div className="pt-2 border-t border-neutral-800 space-y-1.5 text-[10px] font-mono">
                        <div className="text-neutral-400 font-semibold flex items-center justify-between">
                          <span>Identificativo Visivo:</span>
                          {isSelected && <span className="text-yellow-400 font-bold">★ SELEZIONATO</span>}
                        </div>
                        <p className="text-neutral-300 text-[10px] leading-tight">
                          {st.visualIndicator}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected State Deep-Dive Panel (Interactive Explanatory Box) */}
              {interactiveSelectedState && (() => {
                const selectedDef = STATUS_DEFINITIONS.find((s) => s.id === interactiveSelectedState);
                if (!selectedDef) return null;

                return (
                  <div
                    id="timeline-legend-selected-detail"
                    className="p-4 bg-neutral-900 border-2 border-neutral-700 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-neutral-950 border border-neutral-700">
                          {selectedDef.icon}
                        </div>
                        <div>
                          <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
                            DETTAGLIO REGOLE OPERATIVE: {selectedDef.title}
                          </span>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {selectedDef.subtitle}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 text-[10px] font-mono uppercase font-black border ${selectedDef.badgeStyle}`}>
                        {selectedDef.badgeText}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-yellow-400 uppercase block">
                          REGOLE & AZIONI DI REGIA / FACULTY:
                        </span>
                        <ul className="space-y-1 text-xs text-neutral-300">
                          {selectedDef.rules.map((rule, rIdx) => (
                            <li key={rIdx} className="flex items-start gap-2">
                              <span className="text-yellow-400 font-bold mt-0.5">•</span>
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase block">
                            GUIDA RAPIDA DI INTERAZIONE:
                          </span>
                          <p className="text-xs text-neutral-300 mt-1">
                            {selectedDef.actionHint}
                          </p>
                        </div>

                        {currentSlotTitle && (
                          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                            <span>Slot Attivo Attuale:</span>
                            <span className="font-bold text-white truncate max-w-[200px]">
                              {currentSlotTitle} ({currentSlotTimeRange})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MODULE TYPES & COLOR CODING */}
          {/* ========================================================================= */}
          {activeTab === 'module_types' && (
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold block">
                Codifica cromatica delle 6 tipologie di modulo didattico del corso:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {MODULE_TYPES.map((mod) => (
                  <div
                    key={mod.type}
                    className={`p-3.5 border-2 ${mod.borderStyle} ${mod.bgStyle} space-y-2.5 shadow-md flex flex-col justify-between`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono ${mod.colorBadge}`}>
                          {mod.label}
                        </span>
                        <div className="p-1 bg-neutral-950 border border-neutral-800">
                          {mod.icon}
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-neutral-400 font-bold flex items-center gap-1">
                        <span>📍 {mod.location}</span>
                      </div>

                      <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                        {mod.summary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80 space-y-1">
                      <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase block">
                        Procedure Chiave Valutate:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {mod.keyProcedures.map((proc, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-1.5 py-0.5 bg-neutral-950/90 border border-neutral-700 text-[9px] font-mono text-neutral-300"
                          >
                            {proc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: WORKFLOW / LIFECYCLE TRANSIZIONE STATI */}
          {/* ========================================================================= */}
          {activeTab === 'workflow' && (
            <div className="p-4 bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-white uppercase font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-400" />
                  <span>CICLO DI VITA DEI MODULI (DAL PROGRAMMATO AL COMPLETATO)</span>
                </h4>
                <p className="text-xs text-neutral-300">
                  Ogni rotazione di squadra attraversa ordinatamente 4 stati operativi consecutivi:
                </p>
              </div>

              {/* Step Sequence Visual Representation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Step 1 */}
                <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 bg-neutral-800 text-cyan-300 font-mono font-black text-[10px]">
                      FASE 1
                    </span>
                    <span className="text-[10px] font-mono font-bold text-cyan-400">T-30m PRE-ALLERTA</span>
                  </div>
                  <h5 className="font-black text-xs text-white uppercase">1. UPCOMING / PROGRAMMATO</h5>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Modulo in calendario. I tecnici ricevono le schede presidi e gli attori/truccatori preparano le lesioni simulate.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3 bg-neutral-950 border border-yellow-500 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 bg-yellow-500 text-black font-mono font-black text-[10px]">
                      FASE 2
                    </span>
                    <span className="text-[10px] font-mono font-black text-yellow-400 animate-pulse">LIVE T0</span>
                  </div>
                  <h5 className="font-black text-xs text-yellow-400 uppercase">2. ACTIVE (IN CORSO)</h5>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Il timer avvia il countdown di sessione. Le squadre operano nei simulatori (Shock Room o Extra) con i docenti tutor.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3 bg-neutral-950 border border-amber-500 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 bg-amber-500 text-black font-mono font-black text-[10px]">
                      FASE 3
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-300">DEBRIEFING</span>
                  </div>
                  <h5 className="font-black text-xs text-amber-300 uppercase">3. PENDING FEEDBACK</h5>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Fine della prova pratica. La squadra attende la chiusura della rubrica. Il tutor compila i voti 1-5 o esegue il Mark All.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-3 bg-neutral-950 border border-emerald-600 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 bg-emerald-700 text-white font-mono font-black text-[10px]">
                      FASE 4
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-300">STORICIZZATO</span>
                  </div>
                  <h5 className="font-black text-xs text-emerald-400 uppercase">4. COMPLETED (CONVALIDATO)</h5>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Punteggi registrati nel database centrale, feedback condiviso con i discenti e progressione alla fase successiva.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
