import React, { useState, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Award,
  BarChart3,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cloud,
  Download,
  Eye,
  FileText,
  Filter,
  Flame,
  GraduationCap,
  HeartPulse,
  Info,
  Layers,
  ListChecks,
  MessageSquare,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { GroupType, Team, TeamEvaluation } from '../../types';

export const AggregatePerformanceMetrics: React.FC = () => {
  const {
    language,
    teams,
    faculty,
    discenti,
    evaluations,
    syncStatus,
    triggerManualSync,
    activeDay,
  } = useCourse();

  const isEn = language === 'en';

  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'ALL' | GroupType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamDetail, setSelectedTeamDetail] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Calculate comprehensive metrics for each team
  const teamMetrics = useMemo(() => {
    return teams.map((team) => {
      const teamEvals = evaluations.filter((e) => e.teamId === team.id);
      const evalCount = teamEvals.length;
      const tutor = faculty.find((f) => f.assignedTeamId === team.id) || faculty.find((f) => f.id === team.facultyId);
      const teamDiscentiCount = discenti.filter((d) => d.teamId === team.id).length;

      if (evalCount === 0) {
        return {
          team,
          tutor,
          teamDiscentiCount,
          evalCount: 0,
          avgComposite: 0,
          scores: {
            abcde: 0,
            tech: 0,
            crm: 0,
            sbar: 0,
            safety: 0,
          },
          procedureRate: 0,
          strengthsCount: 0,
          criticalCount: 0,
          evaluations: [],
          statusBadge: isEn ? 'Pending Evaluation' : 'In attesa di valutazione',
          statusColor: 'bg-neutral-800 text-neutral-400 border-neutral-700',
        };
      }

      const sumAbcde = teamEvals.reduce((acc, ev) => acc + (ev.scores?.abcdeApproach || 0), 0) / evalCount;
      const sumTech = teamEvals.reduce((acc, ev) => acc + (ev.scores?.technicalSkills || 0), 0) / evalCount;
      const sumCrm = teamEvals.reduce((acc, ev) => acc + (ev.scores?.teamworkLeadership || 0), 0) / evalCount;
      const sumSbar = teamEvals.reduce((acc, ev) => acc + (ev.scores?.handoverSbar || 0), 0) / evalCount;
      const sumSafety = teamEvals.reduce((acc, ev) => acc + (ev.scores?.safetyTiming || 0), 0) / evalCount;

      const avgComposite = Number(((sumAbcde + sumTech + sumCrm + sumSbar + sumSafety) / 5).toFixed(1));

      // Calculate procedure completion rate
      const totalProceduresLogged = teamEvals.reduce((acc, ev) => acc + (ev.proceduresCompleted?.length || 0), 0);
      const avgProceduresPerScenario = Math.round(totalProceduresLogged / evalCount);
      const procedureRate = Math.min(100, Math.round((avgProceduresPerScenario / 10) * 100));

      let statusBadge = isEn ? 'Standard' : 'Adeguato';
      let statusColor = 'bg-blue-950 text-blue-300 border-blue-600';

      if (avgComposite >= 4.5) {
        statusBadge = isEn ? 'Outstanding / Gold' : 'Eccellente / Gold';
        statusColor = 'bg-emerald-950 text-emerald-300 border-emerald-500';
      } else if (avgComposite >= 3.8) {
        statusBadge = isEn ? 'Proficient' : 'Solido / Avanzato';
        statusColor = 'bg-emerald-950/60 text-emerald-400 border-emerald-700';
      } else if (avgComposite >= 3.0) {
        statusBadge = isEn ? 'Developing' : 'In Sviluppo';
        statusColor = 'bg-amber-950 text-amber-300 border-amber-600';
      } else {
        statusBadge = isEn ? 'Requires Attention' : 'Attenzione / Debrief';
        statusColor = 'bg-red-950 text-red-300 border-red-600';
      }

      return {
        team,
        tutor,
        teamDiscentiCount,
        evalCount,
        avgComposite,
        scores: {
          abcde: Number(sumAbcde.toFixed(1)),
          tech: Number(sumTech.toFixed(1)),
          crm: Number(sumCrm.toFixed(1)),
          sbar: Number(sumSbar.toFixed(1)),
          safety: Number(sumSafety.toFixed(1)),
        },
        procedureRate,
        strengthsCount: teamEvals.filter((e) => e.strengths && e.strengths.trim().length > 0).length,
        criticalCount: teamEvals.filter((e) => e.criticalIssues && e.criticalIssues.trim().length > 0).length,
        evaluations: teamEvals,
        statusBadge,
        statusColor,
      };
    });
  }, [teams, faculty, discenti, evaluations, isEn]);

  // Overall Global Course Aggregate Statistics
  const globalStats = useMemo(() => {
    const evaluatedTeams = teamMetrics.filter((m) => m.evalCount > 0);
    const totalEvalsCount = evaluations.length;
    const totalPossibleEvals = 12 * 3; // 12 teams x 3 scenarios
    const completionPct = Math.round((totalEvalsCount / totalPossibleEvals) * 100);

    if (evaluatedTeams.length === 0) {
      return {
        avgGlobalScore: 0,
        totalEvalsCount,
        completionPct: 0,
        topDimension: 'N/D',
        lowestDimension: 'N/D',
        dimensionAverages: { abcde: 0, tech: 0, crm: 0, sbar: 0, safety: 0 },
      };
    }

    const avgGlobalScore = Number(
      (
        evaluatedTeams.reduce((acc, t) => acc + t.avgComposite, 0) / evaluatedTeams.length
      ).toFixed(1)
    );

    const dimAbcde = Number((evaluatedTeams.reduce((acc, t) => acc + t.scores.abcde, 0) / evaluatedTeams.length).toFixed(1));
    const dimTech = Number((evaluatedTeams.reduce((acc, t) => acc + t.scores.tech, 0) / evaluatedTeams.length).toFixed(1));
    const dimCrm = Number((evaluatedTeams.reduce((acc, t) => acc + t.scores.crm, 0) / evaluatedTeams.length).toFixed(1));
    const dimSbar = Number((evaluatedTeams.reduce((acc, t) => acc + t.scores.sbar, 0) / evaluatedTeams.length).toFixed(1));
    const dimSafety = Number((evaluatedTeams.reduce((acc, t) => acc + t.scores.safety, 0) / evaluatedTeams.length).toFixed(1));

    const dimensions = [
      { name: 'C-ABCDE Approach', score: dimAbcde },
      { name: 'Technical Procedures', score: dimTech },
      { name: 'Teamwork & CRM', score: dimCrm },
      { name: 'SBAR Handover', score: dimSbar },
      { name: 'Safety & Timing', score: dimSafety },
    ];

    dimensions.sort((a, b) => b.score - a.score);

    return {
      avgGlobalScore,
      totalEvalsCount,
      completionPct,
      topDimension: dimensions[0].name,
      lowestDimension: dimensions[dimensions.length - 1].name,
      dimensionAverages: {
        abcde: dimAbcde,
        tech: dimTech,
        crm: dimCrm,
        sbar: dimSbar,
        safety: dimSafety,
      },
    };
  }, [teamMetrics, evaluations.length]);

  // Filtered teams list
  const filteredTeams = useMemo(() => {
    return teamMetrics.filter((m) => {
      const matchesGroup = selectedGroupFilter === 'ALL' || m.team.groupId === selectedGroupFilter;
      const matchesQuery =
        searchQuery.trim() === '' ||
        m.team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(m.team.id).includes(searchQuery) ||
        (m.tutor?.name && m.tutor.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesGroup && matchesQuery;
    });
  }, [teamMetrics, selectedGroupFilter, searchQuery]);

  // Export to CSV Function
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const headers = [
        'Team ID',
        'Team Name',
        'Group',
        'Tutor',
        'Evaluations Count',
        'Composite Average',
        'ABCDE Score',
        'Tech Score',
        'CRM Score',
        'SBAR Score',
        'Safety Score',
        'Procedure Success Rate %',
      ];

      const rows = teamMetrics.map((m) => [
        m.team.id,
        `"${m.team.name}"`,
        m.team.groupId,
        `"${m.tutor?.name || 'N/D'}"`,
        m.evalCount,
        m.avgComposite,
        m.scores.abcde,
        m.scores.tech,
        m.scores.crm,
        m.scores.sbar,
        m.scores.safety,
        `${m.procedureRate}%`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `trauma_course_aggregate_metrics_day${activeDay}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Executive Overview */}
      <div className="bg-neutral-900 border-2 border-neutral-800 p-5 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest font-mono bg-amber-950/80 border border-amber-800/80 px-2 py-0.5">
                {isEn ? 'COURSE DIRECTION SCIENTIFIC DASHBOARD' : 'DASHBOARD SCIENTIFICA DIREZIONE CORSO'}
              </span>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-emerald-500 text-black uppercase tracking-wider">
                FIRESTORE LIVE SYNC
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase flex items-center gap-2 tracking-tight">
              <BarChart3 className="w-6 h-6 text-orange-400" />
              <span>{isEn ? 'AGGREGATE TEAM PERFORMANCE METRICS' : 'MATRICE SCORING & PERFORMANCE AGGREGATA SQUADRE'}</span>
            </h2>
            <p className="text-xs text-neutral-300 max-w-3xl">
              {isEn
                ? 'Real-time synchronization of scenario evaluations, clinical scoring rubrics, procedure completion rates, and faculty debriefing observations from all 12 teams.'
                : 'Monitoraggio centralizzato in tempo reale di tutte le valutazioni dei tutor di campo, medie composite per dimensione clinica, tassi di esecuzione delle procedure e note per il debriefing plenario.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={triggerManualSync}
              className="px-3 py-2 bg-neutral-950 hover:bg-neutral-800 text-emerald-400 border border-neutral-700 text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Aggiorna dati da Firestore"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isEn ? 'SYNC FIRESTORE' : 'SYNC CLOUD'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 text-xs font-mono font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isEn ? 'EXPORT CSV' : 'ESPORTA CSV'}</span>
            </button>
          </div>
        </div>

        {/* Global Executive Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Global Average */}
          <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-mono uppercase font-bold">Punteggio Medio Globale</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-black font-mono text-white">
                {globalStats.avgGlobalScore > 0 ? `${globalStats.avgGlobalScore}` : '--'}
              </p>
              <span className="text-xs font-mono text-neutral-500">/ 5.0</span>
            </div>
            <p className="text-[10px] text-emerald-400 font-mono">
              Su 12 squadre e 5 dimensioni
            </p>
          </div>

          {/* Evaluations Registered */}
          <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-mono uppercase font-bold">Valutazioni Registrate</span>
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-black font-mono text-white">
                {globalStats.totalEvalsCount}
              </p>
              <span className="text-xs font-mono text-neutral-500">/ 36 totali</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-cyan-400 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, globalStats.completionPct)}%` }}
              />
            </div>
          </div>

          {/* Strongest Dimension */}
          <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-mono uppercase font-bold">Dimensione Più Forte</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm sm:text-base font-black text-emerald-300 truncate">
              {globalStats.topDimension}
            </p>
            <p className="text-[10px] font-mono text-neutral-400">
              Media: {globalStats.dimensionAverages.abcde} / 5.0
            </p>
          </div>

          {/* Focus Area */}
          <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-mono uppercase font-bold">Area Focus Debriefing</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-sm sm:text-base font-black text-amber-300 truncate">
              {globalStats.lowestDimension}
            </p>
            <p className="text-[10px] font-mono text-neutral-400">
              Raccomandata enfasi in plenaria
            </p>
          </div>
        </div>

        {/* Global Competency Breakdown Bars */}
        <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-neutral-300 font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-400" />
              <span>{isEn ? 'COURSE-WIDE COMPETENCY BENCHMARKS (SCALE 1.0 - 5.0)' : 'BENCHMARK MEDI PER DIMENSIONE CLINICA DEL CORSO (1.0 - 5.0)'}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {/* ABCDE */}
            <div className="space-y-1 bg-neutral-900/60 p-2.5 border border-neutral-850">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-neutral-300 font-bold">1. C-ABCDE</span>
                <span className="text-white font-black">{globalStats.dimensionAverages.abcde}</span>
              </div>
              <div className="w-full bg-neutral-800 h-2">
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${(globalStats.dimensionAverages.abcde / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Tech */}
            <div className="space-y-1 bg-neutral-900/60 p-2.5 border border-neutral-850">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-neutral-300 font-bold">2. Abilità Tecniche</span>
                <span className="text-white font-black">{globalStats.dimensionAverages.tech}</span>
              </div>
              <div className="w-full bg-neutral-800 h-2">
                <div
                  className="bg-cyan-500 h-full"
                  style={{ width: `${(globalStats.dimensionAverages.tech / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* CRM */}
            <div className="space-y-1 bg-neutral-900/60 p-2.5 border border-neutral-850">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-neutral-300 font-bold">3. Teamwork & CRM</span>
                <span className="text-white font-black">{globalStats.dimensionAverages.crm}</span>
              </div>
              <div className="w-full bg-neutral-800 h-2">
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${(globalStats.dimensionAverages.crm / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* SBAR */}
            <div className="space-y-1 bg-neutral-900/60 p-2.5 border border-neutral-850">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-neutral-300 font-bold">4. Handover SBAR</span>
                <span className="text-white font-black">{globalStats.dimensionAverages.sbar}</span>
              </div>
              <div className="w-full bg-neutral-800 h-2">
                <div
                  className="bg-purple-500 h-full"
                  style={{ width: `${(globalStats.dimensionAverages.sbar / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Safety */}
            <div className="space-y-1 bg-neutral-900/60 p-2.5 border border-neutral-850">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-neutral-300 font-bold">5. Sicurezza & Tempi</span>
                <span className="text-white font-black">{globalStats.dimensionAverages.safety}</span>
              </div>
              <div className="w-full bg-neutral-800 h-2">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${(globalStats.dimensionAverages.safety / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Group Filter & Search Controls */}
      <div className="bg-neutral-900 border-2 border-neutral-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        {/* Group Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black uppercase text-neutral-400 font-mono mr-1">
            {isEn ? 'FILTER GROUP:' : 'FILTRA GRUPPO:'}
          </span>
          {(['ALL', 'A', 'B', 'C', 'D'] as const).map((grp) => (
            <button
              key={grp}
              type="button"
              onClick={() => setSelectedGroupFilter(grp)}
              className={`px-3 py-1.5 text-xs font-mono font-black uppercase transition-all cursor-pointer border ${
                selectedGroupFilter === grp
                  ? 'bg-orange-500 text-black border-white shadow-xs'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-600'
              }`}
            >
              {grp === 'ALL' ? (isEn ? 'ALL 12 SQUADS' : 'TUTTE LE 12 SQUADRE') : `GRUPPO ${grp}`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search team or tutor...' : 'Cerca squadra o tutor...'}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-orange-500 pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Grid of Team Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeams.map((m) => {
          const isSelected = selectedTeamDetail === m.team.id;

          return (
            <div
              key={m.team.id}
              className={`bg-neutral-900 border-2 transition-all p-4 flex flex-col justify-between gap-3 shadow-xl ${
                isSelected
                  ? 'border-orange-500 ring-2 ring-orange-400/50'
                  : 'border-neutral-800 hover:border-neutral-600'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-10 h-10 flex items-center justify-center font-black font-mono text-white text-xs border shadow-sm flex-shrink-0"
                      style={{ backgroundColor: m.team.color }}
                    >
                      Sq.{m.team.id}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-black text-sm text-white uppercase truncate">
                          {m.team.name}
                        </h4>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-neutral-950 text-neutral-300 border border-neutral-700 uppercase">
                          GRP {m.team.groupId}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate">
                        Tutor: <span className="text-emerald-400 font-semibold">{m.tutor?.name || 'Tutor non assegnato'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Composite Score Pill */}
                  <div className="text-right flex-shrink-0">
                    <div className="px-2.5 py-1 bg-neutral-950 border border-neutral-700 text-right">
                      <span className="text-[9px] font-mono uppercase text-neutral-400 block">Scoring Medio</span>
                      <span className="text-base font-black font-mono text-amber-400">
                        {m.avgComposite > 0 ? `${m.avgComposite}` : '--'} <span className="text-[10px] text-neutral-500">/ 5</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Evaluations Progress */}
                <div className="flex items-center justify-between gap-2 pt-2.5 text-xs">
                  <span className={`text-[10px] font-bold px-2 py-0.5 border uppercase ${m.statusColor}`}>
                    {m.statusBadge}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {m.evalCount}/3 {isEn ? 'Scenarios Logged' : 'Scenari Registrati'}
                  </span>
                </div>

                {/* 5-Dimension Mini Progress Bars */}
                <div className="space-y-1.5 pt-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>1. C-ABCDE</span>
                    <span className="font-bold text-white">{m.scores.abcde > 0 ? m.scores.abcde : '--'}</span>
                  </div>
                  <div className="w-full bg-neutral-950 h-1.5 overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: `${(m.scores.abcde / 5) * 100}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>2. Tecniche & Procedure</span>
                    <span className="font-bold text-white">{m.scores.tech > 0 ? m.scores.tech : '--'}</span>
                  </div>
                  <div className="w-full bg-neutral-950 h-1.5 overflow-hidden">
                    <div className="bg-cyan-500 h-full" style={{ width: `${(m.scores.tech / 5) * 100}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>3. Leadership & CRM</span>
                    <span className="font-bold text-white">{m.scores.crm > 0 ? m.scores.crm : '--'}</span>
                  </div>
                  <div className="w-full bg-neutral-950 h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${(m.scores.crm / 5) * 100}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>4. Handover SBAR</span>
                    <span className="font-bold text-white">{m.scores.sbar > 0 ? m.scores.sbar : '--'}</span>
                  </div>
                  <div className="w-full bg-neutral-950 h-1.5 overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: `${(m.scores.sbar / 5) * 100}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>5. Sicurezza & Tempi</span>
                    <span className="font-bold text-white">{m.scores.safety > 0 ? m.scores.safety : '--'}</span>
                  </div>
                  <div className="w-full bg-neutral-950 h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(m.scores.safety / 5) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Card Footer: Detail Expand Trigger */}
              <div className="pt-2 border-t border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => setSelectedTeamDetail(isSelected ? null : m.team.id)}
                  className="w-full py-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-mono font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-orange-400" />
                  <span>{isSelected ? (isEn ? 'Hide Clinical Notes' : 'Nascondi Dettaglio Note') : (isEn ? 'View Tutor Clinical Notes' : 'Vedi Note Tutor & Debriefing')}</span>
                </button>
              </div>

              {/* Expandable Clinical Notes & Debriefing Stream */}
              {isSelected && (
                <div className="bg-neutral-950 p-3 border border-orange-500/50 space-y-2.5 mt-1 text-xs animate-in fade-in">
                  <div className="font-black text-orange-400 uppercase font-mono text-[11px] flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>OSSERVAZIONI FACULTY PER LA SQUADRA {m.team.id}:</span>
                  </div>

                  {m.evaluations.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {m.evaluations.map((ev, idx) => (
                        <div key={ev.id || idx} className="bg-neutral-900 p-2.5 border border-neutral-800 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                            <span className="text-amber-400 font-bold uppercase">
                              {ev.scenarioCode || `Scenario Day ${ev.day} (${ev.period})`}
                            </span>
                            <span>{ev.timestamp}</span>
                          </div>

                          {ev.strengths && (
                            <p className="text-emerald-300 text-[11px] leading-tight">
                              <strong>Punti di Forza:</strong> {ev.strengths}
                            </p>
                          )}

                          {ev.criticalIssues && (
                            <p className="text-amber-300 text-[11px] leading-tight">
                              <strong>Criticità:</strong> {ev.criticalIssues}
                            </p>
                          )}

                          {ev.debriefingActionItems && (
                            <p className="text-cyan-300 text-[11px] leading-tight">
                              <strong>Focus Debriefing:</strong> {ev.debriefingActionItems}
                            </p>
                          )}

                          {ev.proceduresCompleted && ev.proceduresCompleted.length > 0 && (
                            <div className="pt-1 text-[10px] text-neutral-400 font-mono">
                              Procedure ({ev.proceduresCompleted.length}): {ev.proceduresCompleted.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500 italic text-[11px] py-1">
                      Nessuna osservazione scritta registrata finora.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
