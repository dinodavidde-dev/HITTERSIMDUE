import React, { useState, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Technician,
  Faculty,
  Discente,
  Team,
  GroupType,
} from '../../types';
import {
  BalancingReport,
  GlobalAssetBalancingReport,
  balanceTechniciansWorkload,
  balanceFacultyWorkload,
  balanceDiscentiWorkload,
  balanceGlobalAssetWorkload,
  TECH_STATION_ROLES,
} from '../../utils/staffBalancer';
import { StaffBalancingModal } from '../common/StaffBalancingModal';
import {
  Scale,
  Users,
  Wrench,
  GraduationCap,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  Filter,
  Search,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Layers,
  HeartPulse,
  Flame,
  FlameKindling,
  UserCheck,
  X,
  Wifi,
  Zap,
  Activity,
} from 'lucide-react';

export const RegiaAssetDashboardView: React.FC = () => {
  const {
    technicians,
    bulkUpdateTechnicians,
    faculty,
    bulkUpdateFaculty,
    discenti,
    bulkUpdateDiscenti,
    simulatorPatients,
    teams,
    activeDay,
    sendCourseMessage,
    simulatedClockTime,
    devicePresenceMap,
    sendGlobalPing,
    forceDeviceResync,
    syncStatus,
  } = useCourse();

  // Search and filter states for the 3 synoptic panels
  const [facultySearch, setFacultySearch] = useState('');
  const [techSearch, setTechSearch] = useState('');
  const [discentiSearch, setDiscentiSearch] = useState('');
  const [discentiGroupFilter, setDiscentiGroupFilter] = useState<GroupType | 'ALL'>('ALL');

  // Single category modal states
  const [techBalancingReport, setTechBalancingReport] = useState<BalancingReport<Technician> | null>(null);
  const [facultyBalancingReport, setFacultyBalancingReport] = useState<BalancingReport<Faculty> | null>(null);
  const [discentiBalancingReport, setDiscentiBalancingReport] = useState<BalancingReport<Discente> | null>(null);

  // Global balancing modal state
  const [globalReport, setGlobalReport] = useState<GlobalAssetBalancingReport | null>(null);
  const [isApplyingGlobal, setIsApplyingGlobal] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Trigger Toast helper
  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  // Real-time device synchronization action & state
  const [isNetworkSyncing, setIsNetworkSyncing] = useState(false);

  const handleNetworkResync = () => {
    setIsNetworkSyncing(true);
    sendGlobalPing();
    forceDeviceResync();
    setTimeout(() => {
      setIsNetworkSyncing(false);
      showToast('Ping globale inviato e sincronizzazione mesh dispositivi forzata con successo.');
    }, 600);
  };

  const onlineDevicesCount = useMemo(() => {
    const list = Object.values(devicePresenceMap || {});
    return list.filter((d) => d.status === 'online' || Date.now() - d.lastSeen < 120000).length;
  }, [devicePresenceMap]);

  const getDeviceStatus = (badgeCode?: string) => {
    if (!badgeCode) return null;
    const key = badgeCode.toUpperCase();
    const presence = devicePresenceMap?.[key];
    if (!presence) return null;
    const isRecent = Date.now() - presence.lastSeen < 90000;
    return {
      isOnline: presence.status === 'online' && isRecent,
      latencyMs: presence.latencyMs || 12,
      deviceInfo: presence.deviceInfo,
      lastSeen: presence.lastSeen,
    };
  };

  // =========================================================================
  // 1. COMPUTED LOAD METRICS FOR FACULTY (12 TUTOR)
  // =========================================================================
  const facultyMetrics = useMemo(() => {
    const total = faculty?.length || 0;
    let assignedCount = 0;
    const groupCoverage = { A: 0, B: 0, C: 0, D: 0 };

    (faculty || []).forEach((fac) => {
      if (!fac) return;
      if (fac.assignedTeamId) {
        assignedCount++;
        const g: GroupType =
          fac.assignedTeamId <= 3 ? 'A' : fac.assignedTeamId <= 6 ? 'B' : fac.assignedTeamId <= 9 ? 'C' : 'D';
        groupCoverage[g] = (groupCoverage[g] || 0) + 1;
      }
    });

    const isFully1to1 = assignedCount === 12;
    const ratioLabel = `${assignedCount}/12 Squadre (${Math.round((assignedCount / 12) * 100)}%)`;

    return {
      total,
      assignedCount,
      isFully1to1,
      ratioLabel,
      groupCoverage,
    };
  }, [faculty]);

  // =========================================================================
  // 2. COMPUTED LOAD METRICS FOR TECHNICIANS (12 OPERATORI)
  // =========================================================================
  const techMetrics = useMemo(() => {
    const total = technicians?.length || 0;
    let highStressCount = 0; // TCCC 1-3, Shock Room 1-3
    let supportCount = 0; // WS1, WS2, Regia AV, Moulage, etc.

    (technicians || []).forEach((t) => {
      if (!t) return;
      const st = (t.assignedStation || t.assignedStations?.[0] || '').toLowerCase();
      if (st.includes('tattico') || st.includes('shock')) {
        highStressCount++;
      } else {
        supportCount++;
      }
    });

    const isBalancedRatio = highStressCount === 6 && supportCount === 6;

    return {
      total,
      highStressCount,
      supportCount,
      isBalancedRatio,
    };
  }, [technicians]);

  // =========================================================================
  // 3. COMPUTED LOAD METRICS FOR DISCENTI (70 ALLIEVI • HITTER-70)
  // =========================================================================
  const discentiMetrics = useMemo(() => {
    const total = discenti?.length || 0;
    const groupCounts: Record<GroupType, number> = { A: 0, B: 0, C: 0, D: 0 };
    let teamLeaderCount = 0;

    (discenti || []).forEach((d) => {
      if (!d) return;
      const g: GroupType =
        d.teamId <= 3 ? 'A' : d.teamId <= 6 ? 'B' : d.teamId <= 9 ? 'C' : 'D';
      groupCounts[g] = (groupCounts[g] || 0) + 1;

      if ((d.role || '').toLowerCase().includes('leader')) {
        teamLeaderCount++;
      }
    });

    const isPerfectDistribution =
      groupCounts.A === 18 &&
      groupCounts.B === 18 &&
      groupCounts.C === 18 &&
      groupCounts.D === 16 &&
      total === 70 &&
      teamLeaderCount === 12;

    return {
      total,
      groupCounts,
      teamLeaderCount,
      isPerfectDistribution,
    };
  }, [discenti]);

  // Filtered lists for the 3 synoptic panels
  const filteredFaculty = useMemo(() => {
    const q = (facultySearch || '').toLowerCase().trim();
    if (!faculty || !Array.isArray(faculty)) return [];
    return faculty.filter((f) => {
      if (!f) return false;
      const badge = (f.badgeCode || '').toLowerCase();
      const name = (f.name || '').toLowerCase();
      const spec = (f.specialty || '').toLowerCase();
      const teamStr = f.assignedTeamId ? `squadra ${f.assignedTeamId}`.toLowerCase() : '';
      return (
        badge.includes(q) ||
        name.includes(q) ||
        spec.includes(q) ||
        teamStr.includes(q)
      );
    });
  }, [faculty, facultySearch]);

  const filteredTechs = useMemo(() => {
    const q = (techSearch || '').toLowerCase().trim();
    if (!technicians || !Array.isArray(technicians)) return [];
    return technicians.filter((t) => {
      if (!t) return false;
      const badge = (t.badgeCode || '').toLowerCase();
      const name = (t.name || '').toLowerCase();
      const spec = (t.specialty || '').toLowerCase();
      const station = (t.assignedStation || t.assignedStations?.[0] || '').toLowerCase();
      return (
        badge.includes(q) ||
        name.includes(q) ||
        spec.includes(q) ||
        station.includes(q)
      );
    });
  }, [technicians, techSearch]);

  const filteredDiscenti = useMemo(() => {
    const q = (discentiSearch || '').toLowerCase().trim();
    if (!discenti || !Array.isArray(discenti)) return [];
    return discenti.filter((d) => {
      if (!d) return false;
      const g: GroupType =
        d.teamId <= 3 ? 'A' : d.teamId <= 6 ? 'B' : d.teamId <= 9 ? 'C' : 'D';
      if (discentiGroupFilter !== 'ALL' && g !== discentiGroupFilter) {
        return false;
      }
      const badge = (d.badgeCode || '').toLowerCase();
      const name = (d.name || '').toLowerCase();
      const role = (d.role || '').toLowerCase();
      const sq = `sq-${d.teamId}`.toLowerCase();
      const team = `squadra ${d.teamId}`.toLowerCase();
      return (
        badge.includes(q) ||
        name.includes(q) ||
        role.includes(q) ||
        sq.includes(q) ||
        team.includes(q)
      );
    });
  }, [discenti, discentiSearch, discentiGroupFilter]);

  // =========================================================================
  // ACTIONS: TRIGGER SINGLE BALANCING
  // =========================================================================
  const handleOpenTechBalancing = () => {
    const report = balanceTechniciansWorkload(technicians, simulatorPatients);
    setTechBalancingReport(report);
  };

  const handleOpenFacultyBalancing = () => {
    const report = balanceFacultyWorkload(faculty, teams, simulatorPatients);
    setFacultyBalancingReport(report);
  };

  const handleOpenDiscentiBalancing = () => {
    const report = balanceDiscentiWorkload(discenti);
    setDiscentiBalancingReport(report);
  };

  // =========================================================================
  // ACTIONS: TRIGGER GLOBAL BALANCING
  // =========================================================================
  const handleOpenGlobalBalancing = () => {
    const rep = balanceGlobalAssetWorkload(
      technicians,
      simulatorPatients,
      faculty,
      teams,
      discenti
    );
    setGlobalReport(rep);
  };

  const handleConfirmGlobalBalancing = async () => {
    if (!globalReport) return;
    setIsApplyingGlobal(true);
    try {
      // 1. Bulk updates
      await Promise.all([
        bulkUpdateTechnicians(globalReport.techniciansReport.appliedPayload),
        bulkUpdateFaculty(globalReport.facultyReport.appliedPayload),
        bulkUpdateDiscenti(globalReport.discentiReport.appliedPayload),
      ]);

      // 2. Transmit Radio message on CH-3
      if (sendCourseMessage) {
        sendCourseMessage({
          senderId: 'REGIA-CH3',
          senderName: 'Coordinamento Regia Asset',
          senderRole: 'direttore',
          type: 'info',
          subject: 'RIBILANCIAMENTO GLOBALE ASSET COMPLETATO',
          content: `Ribilanciamento asset eseguito su 84 operatori (12 Faculty, 12 Tecnici, 60 Discenti). Riassegnazioni totali applicate: ${globalReport.totalChanged}. Squadre, postazioni e simulatori allineati.`,
        });
      }

      showToast(`Ribilanciamento globale applicato con successo (${globalReport.totalChanged} variazioni salvate).`);
      setGlobalReport(null);
    } catch (err) {
      console.error('Errore durante il ribilanciamento globale:', err);
      showToast('Errore durante il salvataggio del ribilanciamento globale.');
    } finally {
      setIsApplyingGlobal(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast feedback notification */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-950 border-2 border-emerald-400 text-emerald-100 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-mono font-bold">{toastNotification}</span>
          <button
            type="button"
            onClick={() => setToastNotification(null)}
            className="text-emerald-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & GLOBAL COMMAND BAR                                        */}
      {/* ========================================================================= */}
      <div className="bg-neutral-950 border-2 border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-2xl space-y-4 font-mono">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-0.5 bg-red-600 text-white font-black uppercase tracking-wider rounded">
                REGIA ASSET COMMAND
              </span>
              <span className="px-2.5 py-0.5 bg-black border border-neutral-700 text-pink-300 font-bold uppercase rounded flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span>CH-3 COMANDO & ASSET</span>
              </span>
              <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300 text-[11px] rounded">
                Day 0{activeDay} • Ore {simulatedClockTime || '08:00'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>Controllo di Carico Asset & Motore di Ribilanciamento</span>
            </h1>
            <p className="text-xs text-neutral-400 font-sans max-w-4xl leading-relaxed">
              Supervisione sinottica centralizzata del carico operativo per i <strong>12 Tutor Faculty (FAC-01..12)</strong>, 
              i <strong>12 Tecnici di simulazione (TECH-01..12)</strong> e i <strong>70 Allievi discenti (DISC-01..70)</strong>. 
              Monitoraggio real-time stato dispositivi connessi, latenze di rete e sincronizzazione anagrafica mesh.
            </p>
          </div>

          {/* Master Global Trigger & Network Sync */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleNetworkResync}
              disabled={isNetworkSyncing}
              className="py-3 px-3.5 bg-neutral-900 hover:bg-neutral-800 border-2 border-cyan-500/80 text-cyan-200 font-mono font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              title="Invia ping globale e forza sincronizzazione di tutti i nodi tablet / smartphone connessi"
            >
              <Wifi className={`w-4 h-4 text-cyan-400 ${isNetworkSyncing ? 'animate-spin' : ''}`} />
              <span>{isNetworkSyncing ? 'Sincronizzazione...' : `Sync Nodi (${onlineDevicesCount || syncStatus.peerCount} Attivi)`}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenGlobalBalancing}
              className="py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-black animate-spin" style={{ animationDuration: '9s' }} />
              <span>🚀 Ribilanciamento Globale Asset (94 Risorse)</span>
            </button>
          </div>
        </div>

        {/* Global Summary KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2 border-t border-neutral-800 text-xs">
          <div className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl">
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">
              Totale Risorse Gestite
            </span>
            <div className="text-lg font-black text-white flex items-baseline gap-1 mt-0.5">
              <span>94</span>
              <span className="text-[10px] text-neutral-500 font-normal">Asset Operativi</span>
            </div>
            <span className="text-[10px] text-neutral-400">12 FAC + 12 TECH + 70 DISC</span>
          </div>

          <div className="p-3 bg-neutral-900/90 border border-blue-500/40 rounded-xl">
            <span className="text-[10px] text-blue-400 uppercase font-bold block">
              Rapporto Didattico FAC
            </span>
            <div className="text-lg font-black text-blue-300 flex items-baseline gap-1 mt-0.5">
              <span>{facultyMetrics.ratioLabel}</span>
            </div>
            <span className="text-[10px] text-neutral-400">
              {facultyMetrics.isFully1to1 ? '✓ Rapporto 1:1 ottimale' : '⚠️ Sbilanciamento rilevato'}
            </span>
          </div>

          <div className="p-3 bg-neutral-900/90 border border-pink-500/40 rounded-xl">
            <span className="text-[10px] text-pink-400 uppercase font-bold block">
              Carico Tecnici Tattico/Supporto
            </span>
            <div className="text-lg font-black text-pink-300 flex items-baseline gap-1 mt-0.5">
              <span>{techMetrics.highStressCount} Tattiche / {techMetrics.supportCount} Supp.</span>
            </div>
            <span className="text-[10px] text-neutral-400">
              {techMetrics.isBalancedRatio ? '✓ Ripartizione 50/50 ottimale' : '⚠️ Sbilanciamento postazioni'}
            </span>
          </div>

          <div className="p-3 bg-neutral-900/90 border border-cyan-500/40 rounded-xl">
            <span className="text-[10px] text-cyan-400 uppercase font-bold block">
              Squadre Discenti (10x6 + 2x5)
            </span>
            <div className="text-lg font-black text-cyan-300 flex items-baseline gap-1 mt-0.5">
              <span>{discentiMetrics.teamLeaderCount}/12 TL</span>
              <span className="text-[10px] text-neutral-400 font-normal">in 70 Allievi</span>
            </div>
            <span className="text-[10px] text-neutral-400">
              {discentiMetrics.isPerfectDistribution ? '✓ Squadre 100% equilibrate' : '⚠️ Riorganizzare ruoli'}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3 bg-neutral-900/90 border border-emerald-500/40 rounded-xl">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">
              Stato Nodi & Connettività
            </span>
            <div className="text-lg font-black text-emerald-300 flex items-baseline gap-1 mt-0.5">
              <span>{onlineDevicesCount || syncStatus.peerCount} Online</span>
              <span className="text-[10px] text-neutral-500 font-normal">/ {syncStatus.latencyMs || 12}ms</span>
            </div>
            <span className="text-[10px] text-neutral-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mesh Live Attivo</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TRE PANNELLI SINOTTICI AFFIANCATI (3-COLUMN LAYOUT)                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4.5 font-mono">
        {/* =======================================================================
            COLONNA 1: FACULTY DIDATTICA (12 TUTOR • FAC-01..12)
        ======================================================================== */}
        <div className="bg-neutral-950 border-2 border-blue-500/60 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl">
          <div className="p-4 bg-neutral-900/90 border-b border-blue-500/40 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-950 border border-blue-500 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Faculty Didattica</span>
                    <span className="px-1.5 py-0.2 bg-blue-950 text-blue-300 border border-blue-700 text-[10px] rounded">
                      12 Tutor
                    </span>
                  </h2>
                  <span className="text-[10px] text-blue-300/80">Rapporto 1:1 con 12 Squadre</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenFacultyBalancing}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase cursor-pointer flex items-center gap-1 transition-colors shadow-xs"
                title="Ribilancia assegnazioni Faculty"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Ribilancia</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-neutral-950 border border-neutral-800 rounded">
                <span className="text-[9px] text-neutral-400 uppercase block">Copertura Gruppi</span>
                <span className="font-bold text-blue-300">
                  A:{facultyMetrics.groupCoverage.A} • B:{facultyMetrics.groupCoverage.B} • C:{facultyMetrics.groupCoverage.C} • D:{facultyMetrics.groupCoverage.D}
                </span>
              </div>
              <div className="p-2 bg-neutral-950 border border-neutral-800 rounded">
                <span className="text-[9px] text-neutral-400 uppercase block">Stato Ratio</span>
                <span className={`font-bold ${facultyMetrics.isFully1to1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {facultyMetrics.isFully1to1 ? '✓ 1:1 Uniforme' : '⚠️ Da bilanciare'}
                </span>
              </div>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                placeholder="Cerca per codice FAC, nome, specialty..."
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Faculty List */}
          <div className="p-3 overflow-y-auto max-h-[550px] space-y-2">
            {filteredFaculty.map((fac) => {
              const assignedTeam = teams.find((t) => t.id === fac.assignedTeamId);
              const groupName: GroupType = fac.assignedTeamId
                ? fac.assignedTeamId <= 3
                  ? 'A'
                  : fac.assignedTeamId <= 6
                  ? 'B'
                  : fac.assignedTeamId <= 9
                  ? 'C'
                  : 'D'
                : 'A';

              return (
                <div
                  key={fac.id}
                  className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-blue-500/60 rounded-xl space-y-1.5 transition-all text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-2 py-0.5 bg-blue-950 border border-blue-600 text-blue-300 font-bold rounded text-[11px] shrink-0">
                        {fac.badgeCode || 'FAC'}
                      </span>
                      <span className="font-bold text-white truncate" title={fac.name || 'Docente'}>
                        {fac.name || 'Docente Faculty'}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-700 text-blue-300 rounded text-[10px] shrink-0 font-bold">
                      {fac.assignedTeamId ? `SQ-${fac.assignedTeamId} (Gr. ${groupName})` : 'Non Assegnato'}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 font-sans truncate" title={fac.specialty}>
                    {fac.specialty}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80 text-[10px] text-neutral-500">
                    <span>{fac.title || 'Faculty Tutor'}</span>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const dev = getDeviceStatus(fac.badgeCode);
                        if (!dev) {
                          return (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-neutral-500 bg-neutral-950 px-1.5 py-0.2 rounded border border-neutral-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                              <span>OFFLINE</span>
                            </span>
                          );
                        }
                        return dev.isOnline ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>LIVE {dev.latencyMs}ms</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-400 bg-neutral-950 px-1.5 py-0.2 rounded border border-neutral-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>STANDBY</span>
                          </span>
                        );
                      })()}
                      <span className="text-emerald-400">1:1 ✓</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-neutral-900/60 border-t border-neutral-800 text-center text-[11px] text-neutral-400">
            {filteredFaculty.length} di 12 Tutor Faculty
          </div>
        </div>

        {/* =======================================================================
            COLONNA 2: TEAM TECNICO & SIMULATORI (12 TECNICI • TECH-01..12)
        ======================================================================== */}
        <div className="bg-neutral-950 border-2 border-pink-500/60 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl">
          <div className="p-4 bg-neutral-900/90 border-b border-pink-500/40 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-pink-950 border border-pink-500 rounded-lg">
                  <Wrench className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Team Tecnico</span>
                    <span className="px-1.5 py-0.2 bg-pink-950 text-pink-300 border border-pink-700 text-[10px] rounded">
                      12 Tecnici
                    </span>
                  </h2>
                  <span className="text-[10px] text-pink-300/80">Simulatori, Tattico & Turnaround</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenTechBalancing}
                className="px-2.5 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold uppercase cursor-pointer flex items-center gap-1 transition-colors shadow-xs"
                title="Ribilancia turni Tecnici"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Ribilancia</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-neutral-950 border border-neutral-800 rounded">
                <span className="text-[9px] text-neutral-400 uppercase block">Postazioni Tattiche</span>
                <span className="font-bold text-pink-300">
                  {techMetrics.highStressCount} High-Stress (TCCC/SR)
                </span>
              </div>
              <div className="p-2 bg-neutral-950 border border-neutral-800 rounded">
                <span className="text-[9px] text-neutral-400 uppercase block">Supporto & Regia</span>
                <span className="font-bold text-neutral-300">
                  {techMetrics.supportCount} WS / Regia AV
                </span>
              </div>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={techSearch}
                onChange={(e) => setTechSearch(e.target.value)}
                placeholder="Cerca per TECH, postazione, specialità..."
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Tech List */}
          <div className="p-3 overflow-y-auto max-h-[550px] space-y-2">
            {filteredTechs.map((tech) => {
              const station = tech.assignedStation || tech.assignedStations?.[0] || 'Non assegnata';
              const isTactical = station.toLowerCase().includes('tattico') || station.toLowerCase().includes('shock');

              return (
                <div
                  key={tech.id}
                  className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-pink-500/60 rounded-xl space-y-1.5 transition-all text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-2 py-0.5 bg-pink-950 border border-pink-600 text-pink-300 font-bold rounded text-[11px] shrink-0">
                        {tech.badgeCode || 'TECH'}
                      </span>
                      <span className="font-bold text-white truncate" title={tech.name || 'Tecnico'}>
                        {tech.name || 'Tecnico Operatore'}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] shrink-0 font-bold border ${
                      isTactical
                        ? 'bg-red-950 text-red-300 border-red-700'
                        : 'bg-neutral-950 text-pink-300 border-neutral-700'
                    }`}>
                      {isTactical ? '🔥 Tattico' : '🛠️ Supporto'}
                    </span>
                  </div>

                  <p className="text-[11px] text-pink-200/90 font-medium truncate" title={station}>
                    📍 {station}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80 text-[10px] text-neutral-500">
                    <span className="truncate max-w-[150px]" title={tech.specialty}>{tech.specialty}</span>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const dev = getDeviceStatus(tech.badgeCode);
                        if (!dev) {
                          return (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-neutral-500 bg-neutral-950 px-1.5 py-0.2 rounded border border-neutral-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                              <span>OFFLINE</span>
                            </span>
                          );
                        }
                        return dev.isOnline ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>LIVE {dev.latencyMs}ms</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-400 bg-neutral-950 px-1.5 py-0.2 rounded border border-neutral-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>STANDBY</span>
                          </span>
                        );
                      })()}
                      <span className="text-pink-400 font-bold">CH-3 Radio</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-neutral-900/60 border-t border-neutral-800 text-center text-[11px] text-neutral-400">
            {filteredTechs.length} di 12 Tecnici di Simulazione
          </div>
        </div>

        {/* =======================================================================
            COLONNA 3: DISCENTI & SQUADRE (70 ALLIEVI • DISC-01..70)
        ======================================================================== */}
        <div className="bg-neutral-950 border-2 border-cyan-500/60 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl">
          <div className="p-4 bg-neutral-900/90 border-b border-cyan-500/40 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-950 border border-cyan-500 rounded-lg">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Discenti & Squadre</span>
                    <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] rounded">
                      70 Allievi
                    </span>
                  </h2>
                  <span className="text-[10px] text-cyan-300/80">10 Sq x 6 + 2 Sq x 5 (12 TL + 58 Op)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenDiscentiBalancing}
                className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black rounded-lg text-xs font-bold uppercase cursor-pointer flex items-center gap-1 transition-colors shadow-xs"
                title="Ribilancia discenti e squadre"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Ribilancia</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-neutral-950 border border-neutral-800 rounded">
                <span className="text-[9px] text-neutral-400 uppercase block">Macro-Gruppi (18/18/18/16)</span>
                <span className="font-bold text-cyan-300">
                  A:{discentiMetrics.groupCounts.A} • B:{discentiMetrics.groupCounts.B} • C:{discentiMetrics.groupCounts.C} • D:{discentiMetrics.groupCounts.D}
                </span>
              </div>
              <div className="p-2 bg-neutral-950 border border-neutral-800 rounded">
                <span className="text-[9px] text-neutral-400 uppercase block">Leadership Squadre</span>
                <span className="font-bold text-emerald-400">
                  {discentiMetrics.teamLeaderCount} / 12 Team Leader
                </span>
              </div>
            </div>

            {/* Filter Search and Group Selector */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={discentiSearch}
                  onChange={(e) => setDiscentiSearch(e.target.value)}
                  placeholder="Cerca per DISC-xx, nome o ruolo..."
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-black p-1 rounded border border-neutral-800 text-[10px]">
                {(['ALL', 'A', 'B', 'C', 'D'] as const).map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setDiscentiGroupFilter(grp)}
                    className={`flex-1 py-1 rounded font-bold cursor-pointer transition-colors ${
                      discentiGroupFilter === grp
                        ? 'bg-cyan-600 text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {grp === 'ALL' ? 'Tutti' : `Gr. ${grp}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Discenti List */}
          <div className="p-3 overflow-y-auto max-h-[500px] space-y-2">
            {filteredDiscenti.map((disc) => {
              const isLeader = disc.role?.toLowerCase().includes('leader');
              const groupName: GroupType =
                disc.teamId <= 3 ? 'A' : disc.teamId <= 6 ? 'B' : disc.teamId <= 9 ? 'C' : 'D';

              return (
                <div
                  key={disc.id}
                  className={`p-2.5 border rounded-xl space-y-1.5 transition-all text-xs ${
                    isLeader
                      ? 'bg-cyan-950/40 border-cyan-500/70'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-700 text-cyan-300 font-bold rounded text-[11px] shrink-0 font-mono">
                        {disc.badgeCode || 'DISC'}
                      </span>
                      <span className="font-bold text-white truncate" title={disc.name || 'Allievo'}>
                        {disc.name || 'Allievo Discente'}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] shrink-0 font-bold border ${
                      isLeader
                        ? 'bg-cyan-600 text-black border-cyan-400 font-black'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-800'
                    }`}>
                      {isLeader ? '👑 Team Leader' : 'Operatore'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="text-cyan-200">
                      Squadra {disc.teamId} • Gruppo {groupName}
                    </span>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const dev = getDeviceStatus(disc.badgeCode);
                        if (!dev) {
                          return (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-neutral-500 bg-neutral-950 px-1.5 py-0.2 rounded border border-neutral-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                              <span>OFFLINE</span>
                            </span>
                          );
                        }
                        return dev.isOnline ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>LIVE {dev.latencyMs}ms</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-400 bg-neutral-950 px-1.5 py-0.2 rounded border border-neutral-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>STANDBY</span>
                          </span>
                        );
                      })()}
                      <span className="text-neutral-500 font-sans truncate max-w-[90px]">
                        {disc.organization || disc.professione || 'Discente'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-neutral-900/60 border-t border-neutral-800 text-center text-[11px] text-neutral-400">
            {filteredDiscenti.length} di 70 Discenti
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALI ANTEPRIMA SINGOLA CATEGORIA (FACULTY, TECNICI, DISCENTI)        */}
      {/* ========================================================================= */}
      <StaffBalancingModal<Technician>
        isOpen={Boolean(techBalancingReport)}
        report={techBalancingReport}
        onClose={() => setTechBalancingReport(null)}
        onConfirm={async (updatedTechs) => {
          await bulkUpdateTechnicians(updatedTechs);
          if (sendCourseMessage) {
            sendCourseMessage({
              senderId: 'REGIA-CH3',
              senderName: 'Coordinamento Regia Asset',
              senderRole: 'direttore',
              type: 'info',
              subject: 'BILANCIAMENTO TECNICI APPLICATO',
              content: `Riassegnazione omogenea applicata a ${updatedTechs.length} tecnici su postazioni tattiche e simulatori.`,
            });
          }
          showToast('Turni e postazioni Tecnici ribilanciati con successo.');
          setTechBalancingReport(null);
        }}
      />

      <StaffBalancingModal<Faculty>
        isOpen={Boolean(facultyBalancingReport)}
        report={facultyBalancingReport}
        onClose={() => setFacultyBalancingReport(null)}
        onConfirm={async (updatedFaculty) => {
          await bulkUpdateFaculty(updatedFaculty);
          if (sendCourseMessage) {
            sendCourseMessage({
              senderId: 'REGIA-CH3',
              senderName: 'Coordinamento Regia Asset',
              senderRole: 'direttore',
              type: 'info',
              subject: 'BILANCIAMENTO FACULTY 1:1 APPLICATO',
              content: `Allineamento 1:1 completato per i 12 tutor Faculty con le rispettive squadre didattiche.`,
            });
          }
          showToast('Assegnazioni didattiche Faculty 1:1 salvate.');
          setFacultyBalancingReport(null);
        }}
      />

      <StaffBalancingModal<Discente>
        isOpen={Boolean(discentiBalancingReport)}
        report={discentiBalancingReport}
        onClose={() => setDiscentiBalancingReport(null)}
        onConfirm={async (updatedDiscenti) => {
          await bulkUpdateDiscenti(updatedDiscenti);
          if (sendCourseMessage) {
            sendCourseMessage({
              senderId: 'REGIA-CH3',
              senderName: 'Coordinamento Regia Asset',
              senderRole: 'direttore',
              type: 'info',
              subject: 'BILANCIAMENTO SQUADRE DISCENTI APPLICATO',
              content: `Assetto 60 discenti riorganizzato: 12 squadre da 5 membri (1 Team Leader + 4 Operatori) su 4 macro-gruppi.`,
            });
          }
          showToast('Squadre e ruoli discenti riorganizzati con successo.');
          setDiscentiBalancingReport(null);
        }}
      />

      {/* ========================================================================= */}
      {/* 4. MODALE ANTEPRIMA GLOBALE ASSET (84 OPERATORI CONGIUNTI)                */}
      {/* ========================================================================= */}
      {globalReport && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn font-mono text-white"
        >
          <div className="bg-neutral-950 border-2 border-emerald-500 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col justify-between overflow-hidden rounded-2xl">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-neutral-900 border-b border-neutral-800 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="px-2 py-0.5 bg-emerald-600 text-black font-black uppercase tracking-wider rounded">
                    MOTORE GLOBALE REGIA ASSET
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-950 border border-emerald-500/80 text-emerald-300 font-bold uppercase rounded">
                    ANTEPRIMA CUMULATIVA CONGIUNTA
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Ribilanciamento Congiunto di Tutti gli 84 Asset del Corso</span>
                </h2>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed max-w-3xl">
                  Revisione analitica delle modifiche aggregate prima del salvataggio su database e della trasmissione radio via CH-3.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setGlobalReport(null)}
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tri-Category Breakdown KPI */}
            <div className="p-4 bg-black/80 border-b border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-neutral-900 border border-blue-500/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-bold uppercase text-[10px]">1. Faculty Didattica</span>
                  <span className="px-1.5 py-0.2 bg-blue-950 text-blue-300 text-[10px] rounded">12 Tutor</span>
                </div>
                <div className="text-base font-black text-white mt-1">
                  {globalReport.facultyReport.changedCount} Riassegnazioni
                </div>
                <span className="text-[10px] text-neutral-400">Rapporto 1:1 Tutor ↔ Squadra</span>
              </div>

              <div className="p-3 bg-neutral-900 border border-pink-500/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-pink-400 font-bold uppercase text-[10px]">2. Team Tecnico</span>
                  <span className="px-1.5 py-0.2 bg-pink-950 text-pink-300 text-[10px] rounded">12 Tecnici</span>
                </div>
                <div className="text-base font-black text-white mt-1">
                  {globalReport.techniciansReport.changedCount} Riassegnazioni
                </div>
                <span className="text-[10px] text-neutral-400">50% Tattico / 50% Supporto & AV</span>
              </div>

              <div className="p-3 bg-neutral-900 border border-cyan-500/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold uppercase text-[10px]">3. Discenti Allievi</span>
                  <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 text-[10px] rounded">60 Discenti</span>
                </div>
                <div className="text-base font-black text-white mt-1">
                  {globalReport.discentiReport.changedCount} Riassegnazioni
                </div>
                <span className="text-[10px] text-neutral-400">12 Squadre x 5 (1 TL + 4 Op)</span>
              </div>
            </div>

            {/* Aggregated Diff Preview Tabs/List */}
            <div className="overflow-y-auto max-h-[46vh] p-4 space-y-4">
              {/* Category 1 Diffs */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>Variazioni Faculty ({globalReport.facultyReport.changedCount})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {globalReport.facultyReport.diffs.filter((d) => d.isChanged).map((diff) => (
                    <div key={diff.id} className="p-2.5 bg-neutral-900 border border-blue-900/60 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-300">{diff.code} • {diff.name}</span>
                        <span className="text-[10px] text-emerald-400">Nuova Assegnazione</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                        <span className="line-through text-neutral-500">{diff.before}</span>
                        <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="font-bold text-white">{diff.after}</span>
                      </div>
                    </div>
                  ))}
                  {globalReport.facultyReport.changedCount === 0 && (
                    <div className="col-span-2 text-xs text-neutral-500 italic p-2 bg-neutral-900 rounded">
                      Nessuna variazione necessaria: anagrafica Faculty già bilanciata.
                    </div>
                  )}
                </div>
              </div>

              {/* Category 2 Diffs */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-300 uppercase">
                  <Wrench className="w-4 h-4 text-pink-400" />
                  <span>Variazioni Tecnici ({globalReport.techniciansReport.changedCount})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {globalReport.techniciansReport.diffs.filter((d) => d.isChanged).map((diff) => (
                    <div key={diff.id} className="p-2.5 bg-neutral-900 border border-pink-900/60 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-pink-300">{diff.code} • {diff.name}</span>
                        <span className="text-[10px] text-emerald-400">Turno Ottimizzato</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                        <span className="line-through text-neutral-500">{diff.before}</span>
                        <ArrowRight className="w-3 h-3 text-pink-400 shrink-0" />
                        <span className="font-bold text-white">{diff.after}</span>
                      </div>
                    </div>
                  ))}
                  {globalReport.techniciansReport.changedCount === 0 && (
                    <div className="col-span-2 text-xs text-neutral-500 italic p-2 bg-neutral-900 rounded">
                      Nessuna variazione necessaria: anagrafica Tecnici già bilanciata.
                    </div>
                  )}
                </div>
              </div>

              {/* Category 3 Diffs */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Variazioni Discenti & Leadership ({globalReport.discentiReport.changedCount})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {globalReport.discentiReport.diffs.filter((d) => d.isChanged).map((diff) => (
                    <div key={diff.id} className="p-2.5 bg-neutral-900 border border-cyan-900/60 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-300">{diff.code} • {diff.name}</span>
                        <span className="text-[10px] text-emerald-400">Riassegnazione Ruolo</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                        <span className="line-through text-neutral-500">{diff.before}</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="font-bold text-white">{diff.after}</span>
                      </div>
                    </div>
                  ))}
                  {globalReport.discentiReport.changedCount === 0 && (
                    <div className="col-span-2 text-xs text-neutral-500 italic p-2 bg-neutral-900 rounded">
                      Nessuna variazione necessaria: anagrafica Discenti già bilanciata.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Salvataggio batch & notifica automatica su canale radio CH-3.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setGlobalReport(null)}
                  disabled={isApplyingGlobal}
                  className="flex-1 sm:flex-none px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold uppercase rounded-lg text-xs cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleConfirmGlobalBalancing}
                  disabled={isApplyingGlobal}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase rounded-lg text-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isApplyingGlobal ? 'Applicazione in corso...' : 'Conferma & Salva Asset'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
