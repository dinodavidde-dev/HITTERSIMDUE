import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Crosshair,
  HeartPulse,
  Flame,
  Radio,
  FileText,
  UserCheck,
  Zap,
  Info,
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import {
  TriageCategory,
  CriticalLsiType,
  MascalTeamCasualtyAssessment,
  Faculty,
} from '../../types';
import { MASCAL_CASUALTIES } from '../../data/mascalCasualtiesData';

export interface MascalFacultyTriageDashboardProps {
  currentFaculty: Faculty;
  defaultExpanded?: boolean;
}

const LSI_LABELS: Record<CriticalLsiType, { short: string; label: string; icon: string }> = {
  TOURNIQUET: { short: 'TQ', label: 'Tourniquet Arto', icon: '🩸' },
  WOUND_PACKING: { short: 'WP', label: 'Wound Packing Giunzionale', icon: '🩹' },
  NEEDLE_DECOMPRESSION: { short: 'NED', label: 'Decompressione Ago 14G', icon: '🫁' },
  AIRWAY_MANEUVER: { short: 'AIR', label: 'Pervietà Vie Aeree', icon: '💨' },
  PELVIC_BINDER: { short: 'PB', label: 'Cinghia Pelvica (Sling)', icon: '🦴' },
  HYPOTHERMIA_WRAP: { short: 'HYPO', label: 'Telo Termico / Ipotermia', icon: '🛡️' },
};

const CATEGORY_COLORS: Record<
  TriageCategory,
  { bg: string; text: string; border: string; activeBg: string; activeText: string; label: string; code: string }
> = {
  RED: {
    bg: 'bg-red-950/40 hover:bg-red-900/60',
    text: 'text-red-300',
    border: 'border-red-700/80',
    activeBg: 'bg-red-600 text-white font-black border-red-400 shadow-md shadow-red-900/50',
    activeText: 'text-white',
    label: 'T1 ROSSO',
    code: 'T1',
  },
  YELLOW: {
    bg: 'bg-amber-950/40 hover:bg-amber-900/60',
    text: 'text-amber-300',
    border: 'border-amber-700/80',
    activeBg: 'bg-amber-500 text-black font-black border-amber-300 shadow-md shadow-amber-900/50',
    activeText: 'text-black',
    label: 'T2 GIALLO',
    code: 'T2',
  },
  GREEN: {
    bg: 'bg-emerald-950/40 hover:bg-emerald-900/60',
    text: 'text-emerald-300',
    border: 'border-emerald-700/80',
    activeBg: 'bg-emerald-600 text-white font-black border-emerald-400 shadow-md shadow-emerald-900/50',
    activeText: 'text-white',
    label: 'T3 VERDE',
    code: 'T3',
  },
  BLACK: {
    bg: 'bg-neutral-900 hover:bg-neutral-800',
    text: 'text-neutral-400',
    border: 'border-neutral-700',
    activeBg: 'bg-neutral-800 text-neutral-100 font-black border-neutral-500 shadow-md',
    activeText: 'text-white',
    label: 'T4 NERO',
    code: 'T4',
  },
};

export const MascalFacultyTriageDashboard: React.FC<MascalFacultyTriageDashboardProps> = ({
  currentFaculty,
  defaultExpanded = true,
}) => {
  const { language, mascalTriageRecords, saveMascalTeamAssessment, resetMascalTeamTriage, teams } =
    useCourse();
  const isEn = language === 'en';

  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [selectedTeamId, setSelectedTeamId] = useState<number>(
    currentFaculty.assignedTeamId || 1
  );
  const [filterCategory, setFilterCategory] = useState<'ALL' | TriageCategory>('ALL');

  const teamRecord = useMemo(() => {
    return mascalTriageRecords[selectedTeamId] || {
      teamId: selectedTeamId,
      assessments: {},
      totalAssessed: 0,
      totalCorrect: 0,
      accuracyPercent: 0,
      underTriageCount: 0,
      overTriageCount: 0,
      averageSecondsPerCasualty: 0,
      totalLsiCompleted: 0,
      lastUpdated: 0,
    };
  }, [mascalTriageRecords, selectedTeamId]);

  const assignedTeamObj = teams.find((t) => t.id === selectedTeamId);

  // Helper to calculate triage error classification
  const classifyTriageDecision = (canonical: TriageCategory, assigned: TriageCategory) => {
    if (canonical === assigned) {
      return { isCorrect: true, isUnderTriage: false, isOverTriage: false };
    }
    const hierarchy: Record<TriageCategory, number> = {
      RED: 3,
      YELLOW: 2,
      GREEN: 1,
      BLACK: 0,
    };
    const cRank = hierarchy[canonical];
    const aRank = hierarchy[assigned];

    if (cRank > aRank) {
      return { isCorrect: false, isUnderTriage: true, isOverTriage: false };
    } else {
      return { isCorrect: false, isUnderTriage: false, isOverTriage: true };
    }
  };

  const handleSelectCategory = (casualtyId: string, assigned: TriageCategory) => {
    const casualty = MASCAL_CASUALTIES.find((c) => c.id === casualtyId);
    if (!casualty) return;

    const existingAssessment = teamRecord.assessments[casualtyId] || {
      casualtyId,
      performedLsi: [],
    };

    const classification = classifyTriageDecision(casualty.canonicalCategory, assigned);

    const updated: MascalTeamCasualtyAssessment = {
      ...existingAssessment,
      casualtyId,
      assignedCategory: assigned,
      isCorrect: classification.isCorrect,
      isUnderTriage: classification.isUnderTriage,
      isOverTriage: classification.isOverTriage,
      assessedByFacultyId: currentFaculty.id,
      assessedAtTimestamp: Date.now(),
      secondsToCategorize: existingAssessment.secondsToCategorize || 45,
    };

    saveMascalTeamAssessment(selectedTeamId, updated);
  };

  const handleToggleLsi = (casualtyId: string, lsi: CriticalLsiType) => {
    const existingAssessment = teamRecord.assessments[casualtyId] || {
      casualtyId,
      performedLsi: [],
    };

    const currentLsiList = existingAssessment.performedLsi || [];
    const isPresent = currentLsiList.includes(lsi);
    const nextLsiList = isPresent
      ? currentLsiList.filter((item) => item !== lsi)
      : [...currentLsiList, lsi];

    const updated: MascalTeamCasualtyAssessment = {
      ...existingAssessment,
      casualtyId,
      performedLsi: nextLsiList,
      assessedByFacultyId: currentFaculty.id,
      assessedAtTimestamp: Date.now(),
    };

    saveMascalTeamAssessment(selectedTeamId, updated);
  };

  const handleAdjustTiming = (casualtyId: string, deltaSeconds: number) => {
    const existingAssessment = teamRecord.assessments[casualtyId] || {
      casualtyId,
      performedLsi: [],
    };
    const currentVal = existingAssessment.secondsToCategorize || 45;
    const nextVal = Math.max(10, Math.min(180, currentVal + deltaSeconds));

    saveMascalTeamAssessment(selectedTeamId, {
      ...existingAssessment,
      secondsToCategorize: nextVal,
      assessedByFacultyId: currentFaculty.id,
      assessedAtTimestamp: Date.now(),
    });
  };

  const filteredCasualties = useMemo(() => {
    if (filterCategory === 'ALL') return MASCAL_CASUALTIES;
    return MASCAL_CASUALTIES.filter((c) => c.canonicalCategory === filterCategory);
  }, [filterCategory]);

  return (
    <div className="bg-neutral-950 border-2 border-red-600/90 rounded-lg shadow-2xl overflow-hidden font-sans transition-all">
      {/* Top Header & Collapsible Bar */}
      <div
        className="p-3.5 sm:p-4 bg-gradient-to-r from-red-950/80 via-neutral-900 to-neutral-950 border-b border-red-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="p-2 bg-red-600 text-white rounded font-black shadow-md flex items-center justify-center">
            <Flame className="w-5 h-5 animate-pulse text-yellow-300" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-red-600 text-white font-mono font-black text-[10px] uppercase tracking-wider rounded">
                MASCAL NIGHT TRACKER
              </span>
              <span className="text-white font-black text-sm sm:text-base uppercase tracking-tight flex items-center gap-1.5">
                <span>{isEn ? 'Faculty Triage Live Evaluation' : 'Valutazione Live Triage MASCAL Faculty'}</span>
                <span className="text-red-400 font-mono font-bold">• Squadra #{selectedTeamId}</span>
              </span>
            </div>

            <p className="text-xs text-neutral-400 mt-0.5 font-mono">
              {isEn
                ? 'Real-time casualty categorization, critical LSI validation, accuracy rate & latency metrics.'
                : 'Tracciamento accuratezza triage, interventi salvavita LSI e latenza decisionale della squadra in tempo reale.'}
            </p>
          </div>
        </div>

        {/* Quick Snapshot KPIs & Expand Button */}
        <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span
              className={`px-2 py-1 rounded font-bold border ${
                teamRecord.accuracyPercent >= 85
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : teamRecord.accuracyPercent >= 70
                  ? 'bg-amber-950 text-amber-300 border-amber-600'
                  : 'bg-red-950 text-red-300 border-red-600'
              }`}
            >
              {teamRecord.accuracyPercent}% {isEn ? 'ACCURACY' : 'CONCORDANZA'}
            </span>

            {teamRecord.underTriageCount > 0 && (
              <span className="px-2 py-1 rounded font-black bg-red-600 text-white animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{teamRecord.underTriageCount} UNDER-TRIAGE</span>
              </span>
            )}

            <span className="px-2 py-1 bg-neutral-900 border border-neutral-700 text-neutral-300 rounded">
              {teamRecord.totalAssessed} / {MASCAL_CASUALTIES.length} {isEn ? 'TAGGED' : 'CLASSIFICATI'}
            </span>
          </div>

          <button
            type="button"
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-700 transition-colors"
            title={isExpanded ? 'Comprimi pannello MASCAL' : 'Espandi pannello MASCAL'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content Section */}
      {isExpanded && (
        <div className="p-3.5 sm:p-5 space-y-4 bg-neutral-950 text-neutral-200">
          {/* Team Selector & Real-Time Sync Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase">
                {isEn ? 'Select Team to Evaluate:' : 'Seleziona Squadra da Valutare:'}
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((tId) => {
                  const rec = mascalTriageRecords[tId];
                  const hasData = rec && rec.totalAssessed > 0;
                  const isAssigned = tId === currentFaculty.assignedTeamId;
                  const isSelected = tId === selectedTeamId;

                  return (
                    <button
                      key={tId}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTeamId(tId);
                      }}
                      className={`px-2 py-1 rounded font-mono text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-400 shadow-md scale-105'
                          : isAssigned
                          ? 'bg-amber-950/80 text-amber-300 border-amber-600 hover:bg-amber-900'
                          : hasData
                          ? 'bg-neutral-800 text-emerald-300 border-emerald-700/60 hover:bg-neutral-700'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                      }`}
                      title={
                        isAssigned
                          ? `Squadra #${tId} (Tua squadra assegnata FAC-${currentFaculty.id})`
                          : `Squadra #${tId}`
                      }
                    >
                      SQ {tId}
                      {hasData && <span className="ml-1 text-[9px] text-emerald-400">●</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] self-end sm:self-auto">
              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-300 rounded flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{isEn ? 'REAL-TIME FACULTY SYNC' : 'SYNC REAL-TIME TUTOR'}</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      isEn
                        ? `Reset MASCAL triage evaluations for Team #${selectedTeamId}?`
                        : `Confermi l'azzeramento delle valutazioni MASCAL per la Squadra #${selectedTeamId}?`
                    )
                  ) {
                    resetMascalTeamTriage(selectedTeamId);
                  }
                }}
                className="px-2 py-0.5 bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-300 rounded border border-neutral-700 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                title="Azzera valutazioni triage di questa squadra"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isEn ? 'Reset Team' : 'Reset Squadra'}</span>
              </button>
            </div>
          </div>

          {/* KPI Dashboard Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {/* 1. Concordance Rate */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded space-y-1">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block">
                {isEn ? 'Triage Concordance' : 'Accuratezza Triage'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-2xl font-black font-mono ${
                    teamRecord.accuracyPercent >= 85
                      ? 'text-emerald-400'
                      : teamRecord.accuracyPercent >= 70
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {teamRecord.accuracyPercent}%
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  ({teamRecord.totalCorrect}/{teamRecord.totalAssessed})
                </span>
              </div>
              <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    teamRecord.accuracyPercent >= 85
                      ? 'bg-emerald-500'
                      : teamRecord.accuracyPercent >= 70
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${teamRecord.accuracyPercent}%` }}
                />
              </div>
            </div>

            {/* 2. Under-Triage (Safety Hazard) */}
            <div
              className={`p-3 rounded space-y-1 border ${
                teamRecord.underTriageCount > 0
                  ? 'bg-red-950/70 border-red-500 text-red-200'
                  : 'bg-neutral-900/90 border-neutral-800 text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase">
                  {isEn ? 'Under-Triage' : 'Under-Triage'}
                </span>
                {teamRecord.underTriageCount > 0 && (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                )}
              </div>
              <div className="text-2xl font-black font-mono text-red-400">
                {teamRecord.underTriageCount}
              </div>
              <span className="text-[10px] text-neutral-400 block truncate">
                {isEn ? 'Critical (T1 downgraded)' : 'Paziente critico sottostimato'}
              </span>
            </div>

            {/* 3. Over-Triage (Resource Waste) */}
            <div
              className={`p-3 rounded space-y-1 border ${
                teamRecord.overTriageCount > 0
                  ? 'bg-amber-950/40 border-amber-600/80 text-amber-200'
                  : 'bg-neutral-900/90 border-neutral-800 text-neutral-300'
              }`}
            >
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block">
                {isEn ? 'Over-Triage' : 'Over-Triage'}
              </span>
              <div className="text-2xl font-black font-mono text-amber-400">
                {teamRecord.overTriageCount}
              </div>
              <span className="text-[10px] text-neutral-400 block truncate">
                {isEn ? 'Resource consumption' : 'Sovraccarico Shock Room'}
              </span>
            </div>

            {/* 4. Assessment Latency */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded space-y-1">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block">
                {isEn ? 'Avg Time / Casualty' : 'Tempo Medio / Ferito'}
              </span>
              <div className="text-2xl font-black font-mono text-cyan-400">
                {teamRecord.averageSecondsPerCasualty > 0
                  ? `${teamRecord.averageSecondsPerCasualty}s`
                  : '--'}
              </div>
              <span className="text-[10px] text-neutral-400 block truncate">
                {isEn ? 'Benchmark: < 60s' : 'Obiettivo START: < 60s'}
              </span>
            </div>

            {/* 5. Completed LSIs */}
            <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block">
                {isEn ? 'Critical LSIs Logged' : 'Interventi LSI Eseguiti'}
              </span>
              <div className="text-2xl font-black font-mono text-yellow-400">
                {teamRecord.totalLsiCompleted}
              </div>
              <span className="text-[10px] text-neutral-400 block truncate">
                {isEn ? 'Tourniquet, Decomp, etc.' : 'Manovre salvavita validate'}
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-neutral-400">{isEn ? 'Filter by Canonical Priority:' : 'Filtra per Categoria:'}</span>
              {(['ALL', 'RED', 'YELLOW', 'GREEN', 'BLACK'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-neutral-200 text-black border-white'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? (isEn ? 'ALL (12)' : 'TUTTI (12)') : cat}
                </button>
              ))}
            </div>

            <div className="text-[11px] font-mono text-neutral-400">
              {assignedTeamObj?.name || `Squadra ${selectedTeamId}`} •{' '}
              <span className="text-neutral-200">
                {MASCAL_CASUALTIES.length} feriti nello scenario notturno plenario
              </span>
            </div>
          </div>

          {/* Interactive Casualties Roster Table / Cards */}
          <div className="space-y-3">
            {filteredCasualties.map((casualty) => {
              const assessment = teamRecord.assessments[casualty.id];
              const assignedCat = assessment?.assignedCategory;
              const hasAssigned = Boolean(assignedCat);
              const isCorrect = assessment?.isCorrect;
              const isUnder = assessment?.isUnderTriage;
              const isOver = assessment?.isOverTriage;
              const performedLsis = assessment?.performedLsi || [];

              return (
                <div
                  key={casualty.id}
                  className={`p-3.5 sm:p-4 rounded-lg border-2 transition-all space-y-3 ${
                    !hasAssigned
                      ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                      : isCorrect
                      ? 'bg-neutral-900/80 border-emerald-500/80 shadow-md shadow-emerald-950/20'
                      : isUnder
                      ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950/40 animate-pulse-subtle'
                      : 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/20'
                  }`}
                >
                  {/* Casualty Head Information */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-700 text-white font-mono font-black text-xs rounded">
                        {casualty.id}
                      </span>
                      <strong className="text-white text-sm font-bold">{casualty.title}</strong>
                      <span className="text-neutral-400 text-xs font-mono">• {casualty.description}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs self-end md:self-auto flex-wrap">
                      <span className="text-neutral-400 text-[11px]">
                        {isEn ? 'Canonical Target:' : 'Target Ufficiale:'}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-black rounded border ${
                          CATEGORY_COLORS[casualty.canonicalCategory].activeBg
                        }`}
                      >
                        {CATEGORY_COLORS[casualty.canonicalCategory].label}
                      </span>

                      {/* Decision Outcome Badge */}
                      {hasAssigned && (
                        <span
                          className={`px-2 py-0.5 text-[11px] font-black rounded flex items-center gap-1 ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isUnder
                              ? 'bg-red-600 text-white animate-bounce'
                              : 'bg-amber-500 text-black'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isEn ? 'CONCORDANT' : 'CONCORDE'}</span>
                            </>
                          ) : isUnder ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{isEn ? 'CRITICAL UNDER-TRIAGE' : 'UNDER-TRIAGE CRITICO'}</span>
                            </>
                          ) : (
                            <>
                              <Info className="w-3.5 h-3.5" />
                              <span>{isEn ? 'OVER-TRIAGE' : 'OVER-TRIAGE'}</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vitals Summary Strip */}
                  <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800/90 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-neutral-300 flex-wrap">
                      <span>🩺 <strong className="text-yellow-400">{casualty.vitalsSummary}</strong></span>
                      <span className="text-neutral-600 hidden sm:inline">|</span>
                      <span>
                        Respiro: <strong className="text-white">{casualty.breathingRate}</strong>
                      </span>
                      <span className="text-neutral-600 hidden sm:inline">|</span>
                      <span>
                        Polso: <strong className={casualty.radialPulse ? 'text-emerald-400' : 'text-red-400'}>
                          {casualty.radialPulse ? 'Presente' : 'Assente / Filiforme'}
                        </strong>
                      </span>
                    </div>

                    <div className="text-neutral-400 text-[11px]">
                      Stato Mentale: <strong className="text-neutral-200">{casualty.mentalState}</strong>
                    </div>
                  </div>

                  {/* Action Row: 4-Color Category Tagging Buttons & Speed Timer */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                    {/* Left: Quick Triage Tag Buttons */}
                    <div className="lg:col-span-6 space-y-1">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                        {isEn ? 'Assigned Team Triage Tag:' : 'Cartellino Assegnato dalla Squadra:'}
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['RED', 'YELLOW', 'GREEN', 'BLACK'] as const).map((cat) => {
                          const config = CATEGORY_COLORS[cat];
                          const isAssignedCat = assignedCat === cat;

                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => handleSelectCategory(casualty.id, cat)}
                              className={`py-2 px-1.5 rounded font-mono text-xs font-black transition-all cursor-pointer border flex flex-col items-center justify-center gap-0.5 ${
                                isAssignedCat ? config.activeBg : `${config.bg} ${config.text} ${config.border}`
                              }`}
                            >
                              <span>{config.code}</span>
                              <span className="text-[10px] uppercase font-bold">{cat}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Middle: Critical Life-Saving Interventions (LSI) */}
                    <div className="lg:col-span-4 space-y-1">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                        {isEn ? 'Validated Critical Interventions (LSI):' : 'Manovre Salvavita (LSI) Validate:'}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {casualty.indicatedLsi.length > 0 ? (
                          casualty.indicatedLsi.map((lsi) => {
                            const isDone = performedLsis.includes(lsi);
                            const meta = LSI_LABELS[lsi];

                            return (
                              <button
                                key={lsi}
                                type="button"
                                onClick={() => handleToggleLsi(casualty.id, lsi)}
                                className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                                  isDone
                                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                                    : 'bg-neutral-900 text-yellow-300 border-yellow-600/70 hover:bg-neutral-800'
                                }`}
                                title={isDone ? `Intervento ${meta.label} Eseguito` : `Clicca per confermare ${meta.label}`}
                              >
                                <span>{meta.icon}</span>
                                <span>{meta.short}</span>
                                {isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </button>
                            );
                          })
                        ) : (
                          <span className="text-xs text-neutral-500 font-mono italic">
                            {isEn ? 'No immediate LSI indicated' : 'Nessun LSI immediato richiesto'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Latency Adjuster */}
                    <div className="lg:col-span-2 space-y-1 text-right">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                        {isEn ? 'Triage Time:' : 'Tempo Decisionale:'}
                      </span>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdjustTiming(casualty.id, -10)}
                          className="px-1.5 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-700 text-xs font-mono font-bold"
                          title="-10 secondi"
                        >
                          -10s
                        </button>
                        <span className="px-2 py-1 bg-neutral-950 border border-neutral-700 text-cyan-400 font-mono text-xs font-bold rounded">
                          {assessment?.secondsToCategorize || 45}s
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustTiming(casualty.id, 10)}
                          className="px-1.5 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-700 text-xs font-mono font-bold"
                          title="+10 secondi"
                        >
                          +10s
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Rationale Footer */}
                  <div className="text-[11px] text-neutral-400 font-sans border-t border-neutral-900 pt-2 flex items-center justify-between gap-2">
                    <span className="italic">{casualty.clinicalRationale}</span>
                    {assessment?.assessedAtTimestamp && (
                      <span className="text-[10px] font-mono text-neutral-500 whitespace-nowrap">
                        Valutato ore {new Date(assessment.assessedAtTimestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
