import React, { useState, useEffect } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  AlertTriangle,
  Award,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cloud,
  FileText,
  Flame,
  GraduationCap,
  HeartPulse,
  Info,
  Layers,
  ListChecks,
  MessageSquare,
  Radio,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  TrendingUp,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { CourseDay, SessionPeriod, TeamEvaluation, TeamEvaluationScores } from '../../types';

interface FacultyLiveFeedbackFormProps {
  onSuccess?: () => void;
  initialScenarioIndex?: number;
}

// Rapid behavioral & clinical feedback tags
const RAPID_FEEDBACK_TAGS: { label: string; type: 'strength' | 'gap'; category: string }[] = [
  { label: '🎯 Leadership Chiara & Diretta', type: 'strength', category: 'CRM' },
  { label: '🗣️ Comunicazione Closed-Loop', type: 'strength', category: 'CRM' },
  { label: '⚡ Applicazione TQ Rapida (<30s)', type: 'strength', category: 'Tech' },
  { label: '🫁 Decompressione Torace Immediata', type: 'strength', category: 'Tech' },
  { label: '📋 Algoritmo C-ABCDE Rispettato', type: 'strength', category: 'ABCDE' },
  { label: '🔄 Rivalutazione Dinamica Puntuale', type: 'strength', category: 'ABCDE' },
  { label: '⏱️ Gestione Ottimale dei Tempi', type: 'strength', category: 'Safety' },
  { label: '🤝 Handover SBAR Fluido & Strutturato', type: 'strength', category: 'SBAR' },
  { label: '⚠️ Ritardo Decompressione Toracica', type: 'gap', category: 'Tech' },
  { label: '⚠️ Sovrapposizione Voci nel Team', type: 'gap', category: 'CRM' },
  { label: '⚠️ Mancata Rivalutazione Polsi Distali', type: 'gap', category: 'ABCDE' },
  { label: '⚠️ SBAR Incompleto / Mancano Dati', type: 'gap', category: 'SBAR' },
  { label: '⚠️ Fissaggio Avanzato Vie Aeree Lento', type: 'gap', category: 'Tech' },
  { label: '⚠️ Sottostima Perdita Emorragica', type: 'gap', category: 'Safety' },
];

export const FacultyLiveFeedbackForm: React.FC<FacultyLiveFeedbackFormProps> = ({
  onSuccess,
  initialScenarioIndex = 0,
}) => {
  const {
    language,
    teams,
    faculty,
    discenti,
    simulatorPatients,
    activeDay,
    evaluations,
    saveEvaluation,
    selectedFacultyId,
    facultyAuthSession,
    syncStatus,
  } = useCourse();

  const isEn = language === 'en';

  // Identify current faculty member
  const currentFaculty =
    faculty.find((f) => f.id === selectedFacultyId) ||
    faculty.find((f) => f.name.toLowerCase().includes(facultyAuthSession.facultyName?.toLowerCase() || '')) ||
    faculty[0];

  // Assigned squad
  const myAssignedTeam = teams.find((t) => t.id === currentFaculty.assignedTeamId) || teams[0];
  const [selectedTeamId, setSelectedTeamId] = useState<number>(myAssignedTeam.id);

  const team = teams.find((t) => t.id === selectedTeamId) || myAssignedTeam;
  const teamDiscenti = discenti.filter((d) => d.teamId === team.id);

  // Form mode: Detailed Rubric vs Rapid Debrief Snippet
  const [formMode, setFormMode] = useState<'detailed' | 'rapid'>('detailed');

  // Scenario Selection (Day 2 Morning, Day 2 Afternoon, Day 3 Night MCI)
  const [scenarioSlot, setScenarioSlot] = useState<{ day: CourseDay; period: SessionPeriod; phase: 'EXTRA' | 'INTRA' | 'NIGHT'; title: string; scenarioCode: string; patientId: number }>({
    day: (activeDay === 3 ? 3 : 2) as CourseDay,
    period: 'mattina',
    phase: 'EXTRA',
    title: 'Scenario Day 2 Mattina • TCCC Extra-Ospedaliero',
    scenarioCode: 'Scenario Extra TCCC D2M',
    patientId: 201,
  });

  // Competency Rubric Scores (1 to 5)
  const [scores, setScores] = useState<TeamEvaluationScores>({
    abcdeApproach: 4,
    technicalSkills: 4,
    teamworkLeadership: 4,
    handoverSbar: 4,
    safetyTiming: 4,
  });

  // Selected quick tags
  const [selectedTags, setSelectedTags] = useState<string[]>(['🎯 Leadership Chiara & Diretta', '⚡ Applicazione TQ Rapida (<30s)']);

  // Procedures Completed
  const [proceduresCompleted, setProceduresCompleted] = useState<string[]>([
    'Applicazione Tourniquet TQ',
    'Decompressione Toracica con Ago ND',
    'Controllo Vie Aeree C-ABCDE',
  ]);

  // Qualitative Feedback Notes
  const [strengths, setStrengths] = useState<string>('Eccellente coesione di squadra, chiara attribuzione dei ruoli e rispetto rigoroso della priorità di emostasi.');
  const [criticalIssues, setCriticalIssues] = useState<string>('Migliorare la precisione dell\'handover SBAR per la trasmissione al team di Shock Room.');
  const [debriefingActionItems, setDebriefingActionItems] = useState<string>('Focalizzare il debriefing sul timing di rivalutazione post-manovra e protocollo massivo.');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTimestamp, setSubmittedTimestamp] = useState<string | null>(null);
  const [lastSyncId, setLastSyncId] = useState<string | null>(null);

  // Load existing evaluation if present for the selected squad & slot
  useEffect(() => {
    const existing = evaluations.find(
      (e) => e.teamId === selectedTeamId && e.day === scenarioSlot.day && (e.period === scenarioSlot.period || e.phase === scenarioSlot.phase)
    );

    if (existing) {
      setScores(existing.scores || { abcdeApproach: 4, technicalSkills: 4, teamworkLeadership: 4, handoverSbar: 4, safetyTiming: 4 });
      setProceduresCompleted(existing.proceduresCompleted || []);
      setStrengths(existing.strengths || '');
      setCriticalIssues(existing.criticalIssues || '');
      setDebriefingActionItems(existing.debriefingActionItems || '');
      setSubmittedTimestamp(existing.timestamp);
      setLastSyncId(existing.id);
    }
  }, [selectedTeamId, scenarioSlot.day, scenarioSlot.period, scenarioSlot.phase, evaluations]);

  // Standard Available Procedures List
  const availableProceduresList = [
    'Applicazione Tourniquet TQ',
    'Decompressione Toracica con Ago ND',
    'Cricotirotomia d\'Urgenza (CRIC)',
    'Drenaggio Toracico a Tubo (Bulau)',
    'Resuscitative Thoracotomy (Toracotomia)',
    'REBOA (Occlusione Aortica Endovascolare)',
    'Immobilizzazione Bacino con Fascia Pelvica',
    'Controllo Vie Aeree & Intubazione Video-guidata',
    'Accesso Intraosseo IO / Vascolare',
    'Handover SBAR Standardizzato',
    'Triage Tattico START / SALT',
    'Bendaggio Compressivo Emostatico con Garze Pro-coagulanti',
  ];

  const handleScorePreset = (level: number) => {
    setScores({
      abcdeApproach: level,
      technicalSkills: level,
      teamworkLeadership: level,
      handoverSbar: level,
      safetyTiming: level,
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

    // Auto append to strengths or critical issues based on tag type
    const tagObj = RAPID_FEEDBACK_TAGS.find((t) => t.label === tag);
    if (tagObj) {
      if (tagObj.type === 'strength' && !strengths.includes(tagObj.label)) {
        setStrengths((prev) => (prev ? `${prev}; ${tagObj.label}` : tagObj.label));
      } else if (tagObj.type === 'gap' && !criticalIssues.includes(tagObj.label)) {
        setCriticalIssues((prev) => (prev ? `${prev}; ${tagObj.label}` : tagObj.label));
      }
    }
  };

  const toggleProcedure = (proc: string) => {
    setProceduresCompleted((prev) =>
      prev.includes(proc) ? prev.filter((p) => p !== proc) : [...prev, proc]
    );
  };

  const handleSelectAllProcedures = () => {
    setProceduresCompleted([...availableProceduresList]);
  };

  const handleClearProcedures = () => {
    setProceduresCompleted([]);
  };

  // Submit Feedback in Real Time to Firebase Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const evalPayload: Omit<TeamEvaluation, 'id' | 'timestamp'> = {
        teamId: selectedTeamId,
        facultyId: currentFaculty.id,
        day: scenarioSlot.day,
        period: scenarioSlot.period,
        patientId: scenarioSlot.patientId,
        scenarioCode: scenarioSlot.scenarioCode,
        phase: scenarioSlot.phase,
        scores,
        proceduresCompleted,
        strengths: strengths.trim(),
        criticalIssues: criticalIssues.trim(),
        debriefingActionItems: debriefingActionItems.trim(),
      };

      // Save to CourseContext (which synchronously updates local state and writes to Firebase Firestore)
      saveEvaluation(evalPayload);

      const timeNow = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSubmittedTimestamp(timeNow);
      setLastSyncId(`eval-${selectedTeamId}-${scenarioSlot.day}-${scenarioSlot.period}`);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error submitting real-time feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageScore = Number(
    (
      (scores.abcdeApproach +
        scores.technicalSkills +
        scores.teamworkLeadership +
        scores.handoverSbar +
        scores.safetyTiming) /
      5
    ).toFixed(1)
  );

  return (
    <div className="bg-neutral-900 border-2 border-neutral-700 shadow-2xl overflow-hidden">
      {/* Header with Cloud Sync Status Indicator */}
      <div className="bg-neutral-950 px-4 sm:px-5 py-3.5 border-b-2 border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 text-white font-black flex items-center justify-center border border-emerald-400 shadow-md flex-shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-sm sm:text-base text-white uppercase tracking-tight flex items-center gap-2">
                <span>{isEn ? 'REAL-TIME FACULTY FEEDBACK FORM' : 'INVIO FEEDBACK & SCORING IN TEMPO REALE'}</span>
              </h3>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-emerald-500 text-black uppercase tracking-wider">
                FIRESTORE LIVE SYNC
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              {isEn
                ? 'Submissions instantly sync to the Course Director Aggregate Performance Dashboard.'
                : 'I dati inviati vengono salvati istantaneamente su Firebase e sincronizzati sulla dashboard aggregata del Direttore.'}
            </p>
          </div>
        </div>

        {/* Live Cloud Status */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 flex items-center gap-2">
            <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-emerald-300 font-bold">
              {syncStatus.isOnline ? 'Cloud Connesso' : 'Locale'}
            </span>
          </div>
          {submittedTimestamp && (
            <div className="px-2.5 py-1 bg-emerald-950 border border-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-200">
                Sync {submittedTimestamp}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mode Switcher & Team / Scenario Strip */}
      <div className="p-4 bg-neutral-950/60 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Squad Selection */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black uppercase text-neutral-400 font-mono">
            {isEn ? 'TEAM TO EVALUATE:' : 'SQUADRA DA VALUTARE:'}
          </span>
          <select
            id="faculty-feedback-team-selector"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(Number(e.target.value))}
            className="bg-neutral-900 border border-emerald-600 text-white font-bold text-xs px-3 py-1.5 focus:outline-hidden cursor-pointer shadow-xs"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                Squadra {t.id} ({t.name}) - Gruppo {t.groupId} {t.id === myAssignedTeam.id ? '★ (Mia Assegnata)' : ''}
              </option>
            ))}
          </select>

          <div
            className="w-5 h-5 rounded-full border border-white/40 flex-shrink-0"
            style={{ backgroundColor: team.color }}
            title={`Colore Squadra: ${team.color}`}
          />
        </div>

        {/* Scenario Selection */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black uppercase text-neutral-400 font-mono">
            {isEn ? 'SCENARIO PROVE:' : 'PROVA SCENARIO:'}
          </span>
          <select
            id="faculty-feedback-scenario-selector"
            value={`${scenarioSlot.day}-${scenarioSlot.period}`}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '2-mattina') {
                setScenarioSlot({
                  day: 2,
                  period: 'mattina',
                  phase: 'EXTRA',
                  title: 'Day 2 Mattina • TCCC Extra-Ospedaliero',
                  scenarioCode: 'Scenario Extra TCCC D2M',
                  patientId: 201,
                });
              } else if (val === '2-pomeriggio') {
                setScenarioSlot({
                  day: 2,
                  period: 'pomeriggio',
                  phase: 'INTRA',
                  title: 'Day 2 Pomeriggio • Shock Room DEA',
                  scenarioCode: 'Scenario Intra DEA D2P',
                  patientId: 202,
                });
              } else if (val === '3-notturno') {
                setScenarioSlot({
                  day: 3,
                  period: 'notturno',
                  phase: 'NIGHT',
                  title: 'Day 3 Notturno • Maxiemergenza MCI Triage',
                  scenarioCode: 'Scenario Notturno MCI',
                  patientId: 999,
                });
              }
            }}
            className="bg-neutral-900 border border-neutral-700 text-neutral-200 font-bold text-xs px-3 py-1.5 focus:outline-hidden cursor-pointer"
          >
            <option value="2-mattina">Giorno 2 Mattina (Extra TCCC)</option>
            <option value="2-pomeriggio">Giorno 2 Pomeriggio (Intra Shock Room)</option>
            <option value="3-notturno">Giorno 3 Notturno (Maxiemergenza MCI)</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 border border-neutral-800 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setFormMode('detailed')}
            className={`px-3 py-1 text-xs font-black uppercase transition-all cursor-pointer ${
              formMode === 'detailed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {isEn ? 'Detailed Rubric' : 'Scheda Completa'}
          </button>
          <button
            type="button"
            onClick={() => setFormMode('rapid')}
            className={`px-3 py-1 text-xs font-black uppercase transition-all cursor-pointer ${
              formMode === 'rapid'
                ? 'bg-orange-500 text-black shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {isEn ? 'Rapid Snippet' : 'Debrief Rapido'}
          </button>
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        {/* Quick Macro Score Fillers */}
        <div className="bg-neutral-950 p-3.5 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black uppercase text-neutral-300 font-mono">
              {isEn ? 'QUICK SCORE PRESET:' : 'MACRO-PUNTEGGIO RAPIDO (TUTTE LE 5 DIMENSIONI):'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleScorePreset(5)}
              className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 text-xs font-mono font-bold uppercase cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>5/5 Eccellente</span>
            </button>
            <button
              type="button"
              onClick={() => handleScorePreset(4)}
              className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 border border-blue-600 text-blue-300 text-xs font-mono font-bold uppercase cursor-pointer flex items-center gap-1 transition-colors"
            >
              <span>4/5 Competente</span>
            </button>
            <button
              type="button"
              onClick={() => handleScorePreset(3)}
              className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-600 text-amber-300 text-xs font-mono font-bold uppercase cursor-pointer flex items-center gap-1 transition-colors"
            >
              <span>3/5 Da Perfezionare</span>
            </button>
            <button
              type="button"
              onClick={() => handleScorePreset(2)}
              className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border border-red-600 text-red-300 text-xs font-mono font-bold uppercase cursor-pointer flex items-center gap-1 transition-colors"
            >
              <span>2/5 Criticità</span>
            </button>
          </div>
        </div>

        {/* 5 Core Competency Rubric Scoring */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? 'CORE CLINICAL & CRM COMPETENCY RUBRICS' : 'VALUTAZIONE DIMENSIONI CLINICHE E CRM (SCALA 1-5)'}</span>
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-400">{isEn ? 'Average:' : 'Media:'}</span>
              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono font-black text-xs">
                {averageScore} / 5.0
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* 1. ABCDE */}
            <div className="bg-neutral-950 p-3 border border-neutral-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase font-mono">1. C-ABCDE</span>
                  <HeartPulse className="w-3.5 h-3.5 text-red-400" />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  Aderenza alla sequenza algoritmica C-ABCDE e priorità emorragiche.
                </p>
              </div>
              <div className="flex items-center justify-between gap-1 pt-2 border-t border-neutral-850">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setScores((s) => ({ ...s, abcdeApproach: val }))}
                    className={`flex-1 py-1.5 font-mono text-xs font-black transition-all cursor-pointer border ${
                      scores.abcdeApproach === val
                        ? 'bg-emerald-600 text-white border-white ring-2 ring-emerald-400'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Technical Skills */}
            <div className="bg-neutral-950 p-3 border border-neutral-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase font-mono">2. Tecniche</span>
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  Esecuzione corretta di CRIC, TQ, drenaggio torace, REBOA e accessi.
                </p>
              </div>
              <div className="flex items-center justify-between gap-1 pt-2 border-t border-neutral-850">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setScores((s) => ({ ...s, technicalSkills: val }))}
                    className={`flex-1 py-1.5 font-mono text-xs font-black transition-all cursor-pointer border ${
                      scores.technicalSkills === val
                        ? 'bg-emerald-600 text-white border-white ring-2 ring-emerald-400'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Teamwork & CRM */}
            <div className="bg-neutral-950 p-3 border border-neutral-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase font-mono">3. CRM & Team</span>
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  Leadership chiara, comunicazione closed-loop e gestione stress.
                </p>
              </div>
              <div className="flex items-center justify-between gap-1 pt-2 border-t border-neutral-850">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setScores((s) => ({ ...s, teamworkLeadership: val }))}
                    className={`flex-1 py-1.5 font-mono text-xs font-black transition-all cursor-pointer border ${
                      scores.teamworkLeadership === val
                        ? 'bg-emerald-600 text-white border-white ring-2 ring-emerald-400'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Handover SBAR */}
            <div className="bg-neutral-950 p-3 border border-neutral-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase font-mono">4. SBAR</span>
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  Passaggio di consegne sintetico, strutturato e senza perdite di dati.
                </p>
              </div>
              <div className="flex items-center justify-between gap-1 pt-2 border-t border-neutral-850">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setScores((s) => ({ ...s, handoverSbar: val }))}
                    className={`flex-1 py-1.5 font-mono text-xs font-black transition-all cursor-pointer border ${
                      scores.handoverSbar === val
                        ? 'bg-emerald-600 text-white border-white ring-2 ring-emerald-400'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Safety & Timing */}
            <div className="bg-neutral-950 p-3 border border-neutral-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase font-mono">5. Sicurezza</span>
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  Decision-making tempestivo, sicurezza scena e prevenzione ipotermia.
                </p>
              </div>
              <div className="flex items-center justify-between gap-1 pt-2 border-t border-neutral-850">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setScores((s) => ({ ...s, safetyTiming: val }))}
                    className={`flex-1 py-1.5 font-mono text-xs font-black transition-all cursor-pointer border ${
                      scores.safetyTiming === val
                        ? 'bg-emerald-600 text-white border-white ring-2 ring-emerald-400'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rapid Clinical / Behavioral Feedback Tags */}
        <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
            <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'ONE-TAP RAPID FEEDBACK TAGS (CLINICAL & BEHAVIORAL):' : 'TAG RAPIDI DI OSSERVAZIONE CLINICA E COMPORTAMENTALE:'}</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {selectedTags.length} Selezionati
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {RAPID_FEEDBACK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.label);
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => toggleTag(tag.label)}
                  className={`px-2.5 py-1 text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                    isSelected
                      ? tag.type === 'strength'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                        : 'bg-red-950 border-red-500 text-red-200'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200'
                  }`}
                >
                  <span>{tag.label}</span>
                  {isSelected && <Check className="w-3 h-3 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Mode: Procedure Checklist & Debrief Notes */}
        {formMode === 'detailed' && (
          <>
            {/* Checklist of Executed Procedures */}
            <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-850 pb-2">
                <span className="text-xs font-black uppercase text-orange-400 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-orange-400" />
                  <span>{isEn ? 'PROCEDURES PERFORMED CORRECTLY:' : 'CHECKLIST PROCEDURE ESEGUITE CORRETTAMENTE:'}</span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    ({proceduresCompleted.length}/{availableProceduresList.length})
                  </span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllProcedures}
                    className="text-[11px] font-mono font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    ✓ Seleziona Tutte
                  </button>
                  <span className="text-neutral-600">|</span>
                  <button
                    type="button"
                    onClick={handleClearProcedures}
                    className="text-[11px] font-mono font-bold text-neutral-400 hover:underline cursor-pointer"
                  >
                    Deseleziona
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {availableProceduresList.map((proc) => {
                  const isDone = proceduresCompleted.includes(proc);
                  return (
                    <button
                      key={proc}
                      type="button"
                      onClick={() => toggleProcedure(proc)}
                      className={`p-2 text-xs font-bold text-left border transition-all cursor-pointer flex items-center gap-2 ${
                        isDone
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-850 hover:text-white'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0 ${
                          isDone ? 'bg-emerald-600 border-white text-white' : 'border-neutral-700'
                        }`}
                      >
                        {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate">{proc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Qualitative Notes / Debriefing Takeaways */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-black text-emerald-400 uppercase mb-1">
                  {isEn ? 'STRENGTHS OBSERVED:' : 'PUNTI DI FORZA OSSERVATI:'}
                </label>
                <textarea
                  rows={3}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Es. Emostasi rapida, leadership serena..."
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-emerald-500 p-2.5 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-amber-400 uppercase mb-1">
                  {isEn ? 'CRITICAL GAPS / AREAS TO IMPROVE:' : 'CRITICITÀ / GAP DA MIGLIORARE:'}
                </label>
                <textarea
                  rows={3}
                  value={criticalIssues}
                  onChange={(e) => setCriticalIssues(e.target.value)}
                  placeholder="Es. Mancata rivalutazione polsi dopo TQ..."
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-emerald-500 p-2.5 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-cyan-400 uppercase mb-1">
                  {isEn ? 'DEBRIEFING RECOMMENDATIONS:' : 'RACCOMANDAZIONI DEBRIEFING:'}
                </label>
                <textarea
                  rows={3}
                  value={debriefingActionItems}
                  onChange={(e) => setDebriefingActionItems(e.target.value)}
                  placeholder="Es. Rivedere algoritmo C-ABCDE per Shock Room..."
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-emerald-500 p-2.5 text-xs text-white focus:outline-hidden"
                />
              </div>
            </div>
          </>
        )}

        {/* Rapid Mode: Single Combined Debrief Box */}
        {formMode === 'rapid' && (
          <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
            <label className="block text-xs font-black text-orange-400 uppercase">
              {isEn ? 'RAPID DEBRIEFING NOTE / LIVE CLINICAL TAKEAWAY:' : 'NOTA DI DEBRIEFING RAPIDA / FEEDBACK CLINICO ISTANTANEO:'}
            </label>
            <textarea
              rows={3}
              value={strengths ? `${strengths} | Focus: ${criticalIssues}` : debriefingActionItems}
              onChange={(e) => {
                setStrengths(e.target.value);
                setDebriefingActionItems(e.target.value);
              }}
              placeholder="Inserisci la nota sintetica per il debriefing plenario e la sincronizzazione col Direttore..."
              className="w-full bg-neutral-900 border border-neutral-700 focus:border-orange-500 p-3 text-xs text-white focus:outline-hidden"
            />
          </div>
        )}

        {/* Submit & Real-Time Sync Action Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-800">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <User className="w-4 h-4 text-emerald-400" />
            <span>
              Valutatore: <strong>{currentFaculty.name}</strong> • Squadra: <strong>Sq. {team.id} ({team.name})</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              id="faculty-submit-live-feedback-btn"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest border-2 border-white shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {isSubmitting
                  ? (isEn ? 'SYNCING WITH FIRESTORE...' : 'SINCRONIZZAZIONE FIRESTORE...')
                  : (isEn ? `SUBMIT REAL-TIME FEEDBACK (SQ. ${team.id})` : `INVIA FEEDBACK IN TEMPO REALE (SQ. ${team.id})`)}
              </span>
            </button>
          </div>
        </div>

        {/* Live Feedback Result Box */}
        {submittedTimestamp && (
          <div className="p-3.5 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-black text-white uppercase">
                  FEEDBACK REGISTRATO & SINCRONIZZATO CON SUCCESSO!
                </div>
                <div className="text-[11px] text-emerald-300">
                  La scheda di valutazione per la <strong>Squadra {team.id} ({scenarioSlot.title})</strong> è ora visibile in tempo reale nella dashboard aggregata del Direttore di Corso.
                </div>
              </div>
            </div>
            <div className="font-mono text-[10px] text-neutral-400 text-right flex-shrink-0">
              ID: {lastSyncId || 'live-sync'}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
