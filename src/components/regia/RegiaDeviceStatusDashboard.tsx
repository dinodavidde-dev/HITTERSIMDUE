import React, { useState, useMemo, useEffect } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  Wifi,
  WifiOff,
  Radio,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Clock,
  Smartphone,
  Tablet,
  Laptop,
  QrCode,
  ExternalLink,
  Shield,
  Users,
  Wrench,
  Award,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { ParticipantQRModal } from '../anagrafica/ParticipantQRModal';
import { getParticipantPersonalPageUrl } from '../../utils/qrCodeUtils';
import { Discente, Technician, Faculty, DeviceSyncState } from '../../types';

interface FleetDeviceItem {
  id: string;
  badgeCode: string;
  name: string;
  role: 'discente' | 'tecnico' | 'faculty' | 'regia' | 'direttore';
  categoryLabel: string;
  hierarchicalCode?: string; // e.g. "ALPHA-SQ1-01"
  groupName?: 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA';
  teamId?: number;
  teamName?: string;
  isTeamLeader?: boolean;
  assignedPatientId?: number;
  currentStation: string;
  radioChannel: string;
  status: DeviceSyncState;
  lastSeenMsAgo: number;
  latencyMs: number;
  syncedSlot: number;
  syncedDay: number;
  isDesyncedFromRegia: boolean;
  deviceType: 'Tablet' | 'Mobile' | 'Workstation';
  ipAddress: string;
  batteryPct: number;
  rawPerson?: Discente | Technician | Faculty | any;
}

export const RegiaDeviceStatusDashboard: React.FC = () => {
  const {
    language,
    activeDay,
    activeSlotIndex,
    currentSlot,
    technicians,
    discenti,
    faculty,
    teams,
    devicePresenceMap,
    sendGlobalPing,
    forceDeviceResync,
    syncStatus,
    setSelectedDiscenteId,
    setSelectedTechnicianId,
    setSelectedFacultyId,
    setCurrentTab,
    setUserRole,
  } = useCourse();

  const isEn = language === 'en';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'discenti' | 'tecnici' | 'faculty' | 'ISSUES'>('ALL');
  const [groupFilter, setGroupFilter] = useState<'ALL' | 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isFleetSimulationActive, setIsFleetSimulationActive] = useState(true);
  const [selectedDeviceForModal, setSelectedDeviceForModal] = useState<FleetDeviceItem | null>(null);
  const [qrModalPerson, setQrModalPerson] = useState<{ person: any; category: any } | null>(null);
  const [lastPingTimestamp, setLastPingTimestamp] = useState<number>(Date.now());
  const [isPinging, setIsPinging] = useState(false);
  const [isResyncing, setIsResyncing] = useState(false);
  const [simSeed, setSimSeed] = useState(0);

  // Periodic tick for real-time timer calculations and simulation fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setSimSeed((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Station mapping helper based on active slot and macro-group rotation
  const getDiscenteCurrentStation = (group: 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA', teamNumInGroup: number): string => {
    // Current slot block (0-3: Blocco 1, 4-7: Blocco 2, 8-11: Blocco 3, 12-15: Blocco 4)
    const blockIndex = Math.min(3, Math.floor(activeSlotIndex / 4));

    if (activeDay === 2) {
      if (group === 'ALPHA') {
        if (blockIndex === 0) return `Ambiente Tattico ${teamNumInGroup}`;
        if (blockIndex === 1) return 'WS2 (Eco FAST & IO)';
        if (blockIndex === 2) return 'WS1 (Vie Aeree & Stop The Bleed)';
        return `Box Shock Room ${teamNumInGroup}`;
      }
      if (group === 'BRAVO') {
        if (blockIndex === 0) return 'WS1 (Vie Aeree & Stop The Bleed)';
        if (blockIndex === 1) return `Box Shock Room ${teamNumInGroup}`;
        if (blockIndex === 2) return `Ambiente Tattico ${teamNumInGroup}`;
        return 'WS2 (Eco FAST & IO)';
      }
      if (group === 'CHARLIE') {
        if (blockIndex === 0) return `Box Shock Room ${teamNumInGroup}`;
        if (blockIndex === 1) return 'WS1 (Vie Aeree & Stop The Bleed)';
        if (blockIndex === 2) return 'WS2 (Eco FAST & IO)';
        return `Ambiente Tattico ${teamNumInGroup}`;
      }
      if (group === 'DELTA') {
        if (blockIndex === 0) return 'WS2 (Eco FAST & IO)';
        if (blockIndex === 1) return `Ambiente Tattico ${teamNumInGroup}`;
        if (blockIndex === 2) return `Box Shock Room ${teamNumInGroup}`;
        return 'WS1 (Vie Aeree & Stop The Bleed)';
      }
    } else {
      // Day 3 Specular rotation
      if (group === 'ALPHA') {
        if (blockIndex === 0) return 'WS2 (Eco FAST & IO)';
        if (blockIndex === 1) return `Box Shock Room ${teamNumInGroup}`;
        if (blockIndex === 2) return `Ambiente Tattico ${teamNumInGroup}`;
        return 'WS1 (Vie Aeree & Stop The Bleed)';
      }
      if (group === 'BRAVO') {
        if (blockIndex === 0) return `Ambiente Tattico ${teamNumInGroup}`;
        if (blockIndex === 1) return 'WS1 (Vie Aeree & Stop The Bleed)';
        if (blockIndex === 2) return 'WS2 (Eco FAST & IO)';
        return `Box Shock Room ${teamNumInGroup}`;
      }
      if (group === 'CHARLIE') {
        if (blockIndex === 0) return 'WS1 (Vie Aeree & Stop The Bleed)';
        if (blockIndex === 1) return `Ambiente Tattico ${teamNumInGroup}`;
        if (blockIndex === 2) return `Box Shock Room ${teamNumInGroup}`;
        return 'WS2 (Eco FAST & IO)';
      }
      if (group === 'DELTA') {
        if (blockIndex === 0) return `Box Shock Room ${teamNumInGroup}`;
        if (blockIndex === 1) return 'WS2 (Eco FAST & IO)';
        if (blockIndex === 2) return 'WS1 (Vie Aeree & Stop The Bleed)';
        return `Ambiente Tattico ${teamNumInGroup}`;
      }
    }
    return `Postazione ${teamNumInGroup}`;
  };

  const getTechCurrentStation = (techIdx: number): string => {
    const techNum = techIdx + 1;
    if (techNum === 1) return 'Ambiente Tattico 1 (TCCC 1)';
    if (techNum === 2) return 'Ambiente Tattico 2 (TCCC 2)';
    if (techNum === 3) return 'Ambiente Tattico 3 (TCCC 3)';
    if (techNum === 4) return 'Box Shock Room 1 (SR 1)';
    if (techNum === 5) return 'Box Shock Room 2 (SR 2)';
    if (techNum === 6) return 'Box Shock Room 3 (SR 3)';
    if (techNum === 7) return 'Skill Workshop 1 (WS1 Vie Aeree)';
    if (techNum === 8) return 'Skill Workshop 2 (WS2 Eco FAST)';
    if (techNum === 9) return 'Moulage & Protesi Lab';
    if (techNum === 10) return 'Logistica Flussi & Sangue Sintetico';
    if (techNum === 11) return 'Supervisione Simulatori Biologici';
    return 'Centrale Regia Audio/Video';
  };

  // Compile full fleet list of all devices (60 Discenti + 12 Tecnici + 12 Faculty)
  const allFleetDevices: FleetDeviceItem[] = useMemo(() => {
    const now = Date.now();
    const items: FleetDeviceItem[] = [];

    // 1. DISCENTI (60 Matricole: DISC-01 to DISC-60)
    for (let i = 1; i <= 60; i++) {
      const matricola = `DISC-${i.toString().padStart(2, '0')}`;
      const d = discenti.find(
        (disc) => (disc.badgeCode || '').toUpperCase() === matricola || disc.id === `disc-${i}`
      ) || {
        id: `disc-${i}`,
        name: `Allievo ${matricola}`,
        role: i % 5 === 1 ? 'Team Leader' : 'Operatore Trauma',
        teamId: Math.ceil(i / 5),
        nationality: 'Italiana',
        badgeCode: matricola,
      };

      // Determine macro-group
      let group: 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA' = 'ALPHA';
      if (i > 45) group = 'DELTA';
      else if (i > 30) group = 'CHARLIE';
      else if (i > 15) group = 'BRAVO';

      const teamNumInGroup = ((Math.ceil(i / 5) - 1) % 3) + 1; // 1, 2, or 3
      const numInSquad = ((i - 1) % 5) + 1; // 1 to 5
      const isTL = numInSquad === 1;
      const hierarchicalCode = `${group}-SQ${teamNumInGroup}-0${numInSquad}`;
      const teamId = Math.ceil(i / 5);
      const teamName = `Squadra ${teamId}`;
      const patientId = teamNumInGroup;
      const currentStation = getDiscenteCurrentStation(group, teamNumInGroup);

      // Check real presence from Firestore
      const presenceKey = matricola.toUpperCase();
      const realPresence = devicePresenceMap[presenceKey];

      // Simulated realistic values if simulated mode active and no real client
      const hash = (i * 37 + simSeed * 3) % 100;
      let status: DeviceSyncState = 'online';
      let latencyMs = 8 + (i % 7) * 4;
      let lastSeenMsAgo = (i % 5) * 1200 + 400;
      let syncedSlot = activeSlotIndex;
      let syncedDay: number = activeDay;
      let isDesyncedFromRegia = false;

      if (realPresence) {
        lastSeenMsAgo = Math.max(0, now - (realPresence.lastSeen || now));
        latencyMs = realPresence.latencyMs || 15;
        syncedSlot = realPresence.currentSlotIndex ?? activeSlotIndex;
        syncedDay = (realPresence.activeDay as number) ?? activeDay;
        isDesyncedFromRegia = syncedSlot !== activeSlotIndex || syncedDay !== activeDay;

        if (lastSeenMsAgo > 60000 || isDesyncedFromRegia) {
          status = 'offline';
        } else if (lastSeenMsAgo > 25000 || latencyMs > 120) {
          status = 'lag';
        } else {
          status = 'online';
        }
      } else if (isFleetSimulationActive) {
        // Realistic simulation distribution for drill testing:
        // 95% online, 1-2 with minor latency lag, 1 with desync
        if (i === 14) {
          status = 'lag';
          latencyMs = 185;
          lastSeenMsAgo = 28000;
        } else if (i === 42 && activeSlotIndex > 0) {
          status = 'lag';
          syncedSlot = activeSlotIndex - 1; // Lagged 1 slot behind
          isDesyncedFromRegia = true;
          lastSeenMsAgo = 12000;
        } else if (i === 59 && simSeed % 10 > 7) {
          status = 'offline';
          lastSeenMsAgo = 85000;
          isDesyncedFromRegia = true;
        } else {
          status = 'online';
          latencyMs = 10 + (hash % 16);
          lastSeenMsAgo = 1000 + (hash % 8000);
        }
      } else {
        status = 'offline';
        lastSeenMsAgo = 999999;
        isDesyncedFromRegia = true;
      }

      items.push({
        id: d.id,
        badgeCode: matricola,
        name: d.name,
        role: 'discente',
        categoryLabel: isTL ? (isEn ? 'Team Leader' : 'Team Leader') : (isEn ? 'Operator' : 'Operatore'),
        hierarchicalCode,
        groupName: group,
        teamId,
        teamName,
        isTeamLeader: isTL,
        assignedPatientId: patientId,
        currentStation,
        radioChannel: `CH-1 TCCC / CH-2 SR`,
        status,
        lastSeenMsAgo,
        latencyMs,
        syncedSlot,
        syncedDay,
        isDesyncedFromRegia,
        deviceType: i % 3 === 0 ? 'Tablet' : 'Mobile',
        ipAddress: `10.240.${Math.ceil(i / 15)}.${100 + i}`,
        batteryPct: Math.max(22, 98 - ((i * 3 + simSeed) % 45)),
        rawPerson: d,
      });
    }

    // 2. TECNICI (12 Matricole: TECH-01 to TECH-12)
    for (let t = 1; t <= 12; t++) {
      const badgeCode = `TECH-${t.toString().padStart(2, '0')}`;
      const tech = technicians.find(
        (tec) => (tec.badgeCode || '').toUpperCase() === badgeCode || tec.id === `tech-${t}`
      ) || {
        id: `tech-${t}`,
        name: `Tecnico ${badgeCode}`,
        specialty: 'Moulage & Manichini Avanzati',
        nationality: 'Italiana',
        phone: '+39 333 000000',
        badgeCode,
        assignedStations: [getTechCurrentStation(t - 1)],
      };

      const presenceKey = badgeCode.toUpperCase();
      const realPresence = devicePresenceMap[presenceKey];

      let status: DeviceSyncState = 'online';
      let latencyMs = 6 + (t % 4) * 3;
      let lastSeenMsAgo = (t % 3) * 1100 + 300;
      let syncedSlot = activeSlotIndex;
      let syncedDay: number = activeDay;
      let isDesyncedFromRegia = false;

      if (realPresence) {
        lastSeenMsAgo = Math.max(0, now - (realPresence.lastSeen || now));
        latencyMs = realPresence.latencyMs || 10;
        syncedSlot = realPresence.currentSlotIndex ?? activeSlotIndex;
        syncedDay = (realPresence.activeDay as number) ?? activeDay;
        isDesyncedFromRegia = syncedSlot !== activeSlotIndex || syncedDay !== activeDay;

        if (lastSeenMsAgo > 60000 || isDesyncedFromRegia) {
          status = 'offline';
        } else if (lastSeenMsAgo > 25000) {
          status = 'lag';
        } else {
          status = 'online';
        }
      } else if (isFleetSimulationActive) {
        status = 'online';
        latencyMs = 8 + (t % 6) * 2;
        lastSeenMsAgo = 500 + t * 400;
      } else {
        status = 'offline';
        lastSeenMsAgo = 999999;
        isDesyncedFromRegia = true;
      }

      items.push({
        id: tech.id,
        badgeCode,
        name: tech.name,
        role: 'tecnico',
        categoryLabel: tech.specialty || (isEn ? 'Technical Specialist' : 'Specialista Tecnico'),
        currentStation: getTechCurrentStation(t - 1),
        radioChannel: 'CH-3 TECNICI',
        status,
        lastSeenMsAgo,
        latencyMs,
        syncedSlot,
        syncedDay,
        isDesyncedFromRegia,
        deviceType: t <= 3 ? 'Workstation' : 'Tablet',
        ipAddress: `10.240.0.${50 + t}`,
        batteryPct: Math.max(45, 100 - (t * 2 + simSeed) % 30),
        rawPerson: tech,
      });
    }

    // 3. FACULTY (12 Matricole: FAC-01 to FAC-12)
    for (let f = 1; f <= 12; f++) {
      const badgeCode = `FAC-${f.toString().padStart(2, '0')}`;
      const fac = faculty.find(
        (inst) => (inst.badgeCode || '').toUpperCase() === badgeCode || inst.id === `fac-${f}`
      ) || {
        id: `fac-${f}`,
        name: `Tutor ${badgeCode}`,
        title: 'Faculty Squadra',
        specialty: 'Trauma & Critical Care',
        nationality: 'Italiana',
        phone: '+39 340 000000',
        badgeCode,
        assignedTeamId: f,
      };

      const presenceKey = badgeCode.toUpperCase();
      const realPresence = devicePresenceMap[presenceKey];

      let status: DeviceSyncState = 'online';
      let latencyMs = 9 + (f % 5) * 3;
      let lastSeenMsAgo = 800 + f * 500;
      let syncedSlot = activeSlotIndex;
      let syncedDay: number = activeDay;
      let isDesyncedFromRegia = false;

      if (realPresence) {
        lastSeenMsAgo = Math.max(0, now - (realPresence.lastSeen || now));
        latencyMs = realPresence.latencyMs || 12;
        syncedSlot = realPresence.currentSlotIndex ?? activeSlotIndex;
        syncedDay = (realPresence.activeDay as number) ?? activeDay;
        isDesyncedFromRegia = syncedSlot !== activeSlotIndex || syncedDay !== activeDay;

        if (lastSeenMsAgo > 60000 || isDesyncedFromRegia) {
          status = 'offline';
        } else if (lastSeenMsAgo > 25000) {
          status = 'lag';
        } else {
          status = 'online';
        }
      } else if (isFleetSimulationActive) {
        status = 'online';
        latencyMs = 7 + (f % 4) * 3;
        lastSeenMsAgo = 600 + f * 350;
      } else {
        status = 'offline';
        lastSeenMsAgo = 999999;
        isDesyncedFromRegia = true;
      }

      items.push({
        id: fac.id,
        badgeCode,
        name: fac.name,
        role: 'faculty',
        categoryLabel: isEn ? `Tutor Team ${f}` : `Tutor Squadra ${f}`,
        teamId: f,
        teamName: `Squadra ${f}`,
        currentStation: `Supervisione Sq. ${f} (1:1)`,
        radioChannel: 'CH-4 FACULTY',
        status,
        lastSeenMsAgo,
        latencyMs,
        syncedSlot,
        syncedDay,
        isDesyncedFromRegia,
        deviceType: 'Tablet',
        ipAddress: `10.240.20.${10 + f}`,
        batteryPct: Math.max(30, 95 - (f * 3 + simSeed) % 40),
        rawPerson: fac,
      });
    }

    return items;
  }, [
    discenti,
    technicians,
    faculty,
    devicePresenceMap,
    activeDay,
    activeSlotIndex,
    isFleetSimulationActive,
    simSeed,
    isEn,
  ]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = allFleetDevices.length;
    const online = allFleetDevices.filter((d) => d.status === 'online').length;
    const lag = allFleetDevices.filter((d) => d.status === 'lag').length;
    const offline = allFleetDevices.filter((d) => d.status === 'offline').length;
    const desynced = allFleetDevices.filter((d) => d.isDesyncedFromRegia).length;

    const discentiCount = allFleetDevices.filter((d) => d.role === 'discente').length;
    const discentiOnline = allFleetDevices.filter((d) => d.role === 'discente' && d.status === 'online').length;

    const techCount = allFleetDevices.filter((d) => d.role === 'tecnico').length;
    const techOnline = allFleetDevices.filter((d) => d.role === 'tecnico' && d.status === 'online').length;

    const facultyCount = allFleetDevices.filter((d) => d.role === 'faculty').length;
    const facultyOnline = allFleetDevices.filter((d) => d.role === 'faculty' && d.status === 'online').length;

    const avgLatency = Math.round(
      allFleetDevices
        .filter((d) => d.status !== 'offline')
        .reduce((sum, d) => sum + d.latencyMs, 0) / Math.max(1, online + lag)
    );

    const syncRate = Math.round(((total - desynced) / Math.max(1, total)) * 100);

    return {
      total,
      online,
      lag,
      offline,
      desynced,
      discentiCount,
      discentiOnline,
      techCount,
      techOnline,
      facultyCount,
      facultyOnline,
      avgLatency,
      syncRate,
    };
  }, [allFleetDevices]);

  // Filtered List
  const filteredDevices = useMemo(() => {
    return allFleetDevices.filter((d) => {
      // Role filter
      if (roleFilter === 'discenti' && d.role !== 'discente') return false;
      if (roleFilter === 'tecnici' && d.role !== 'tecnico') return false;
      if (roleFilter === 'faculty' && d.role !== 'faculty') return false;
      if (roleFilter === 'ISSUES' && d.status === 'online' && !d.isDesyncedFromRegia) return false;

      // Group filter
      if (groupFilter !== 'ALL' && d.groupName !== groupFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesBadge = d.badgeCode.toLowerCase().includes(q);
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesHCode = d.hierarchicalCode?.toLowerCase().includes(q);
        const matchesStation = d.currentStation.toLowerCase().includes(q);
        const matchesTeam = d.teamName?.toLowerCase().includes(q);
        const matchesRole = d.categoryLabel.toLowerCase().includes(q);

        if (!matchesBadge && !matchesName && !matchesHCode && !matchesStation && !matchesTeam && !matchesRole) {
          return false;
        }
      }

      return true;
    });
  }, [allFleetDevices, roleFilter, groupFilter, searchQuery]);

  // Actions
  const handleTriggerGlobalPing = () => {
    setIsPinging(true);
    sendGlobalPing();
    setLastPingTimestamp(Date.now());
    setTimeout(() => {
      setIsPinging(false);
    }, 800);
  };

  const handleForceResyncAll = () => {
    setIsResyncing(true);
    forceDeviceResync();
    setTimeout(() => {
      setIsResyncing(false);
    }, 1000);
  };

  const handleOpenDeviceConsole = (d: FleetDeviceItem) => {
    if (d.role === 'tecnico') {
      setSelectedTechnicianId(d.id);
      setUserRole('tecnico');
      setCurrentTab('tecnici');
    } else if (d.role === 'discente') {
      setSelectedDiscenteId(d.id);
      setUserRole('discente');
      setCurrentTab('discente');
    } else if (d.role === 'faculty') {
      setSelectedFacultyId(d.id);
      setUserRole('faculty');
      setCurrentTab('faculty');
    }
  };

  const handleOpenQrPass = (d: FleetDeviceItem) => {
    setQrModalPerson({
      person: d.rawPerson || { id: d.id, name: d.name, badgeCode: d.badgeCode, role: d.categoryLabel },
      category: d.role === 'discente' ? 'discenti' : d.role === 'tecnico' ? 'tecnici' : 'faculty',
    });
  };

  const formatLastSeen = (ms: number): string => {
    if (ms >= 900000) return isEn ? 'Never connected' : 'Mai connesso';
    const secs = Math.floor(ms / 1000);
    if (secs < 5) return isEn ? 'Just now (live)' : 'Adesso (live)';
    if (secs < 60) return `${secs}s ${isEn ? 'ago' : 'fa'}`;
    const mins = Math.floor(secs / 60);
    return `${mins}m ${secs % 60}s ${isEn ? 'ago' : 'fa'}`;
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Banner: Fleet Telemetry Mission Control Header */}
      <div className="bg-neutral-950 border-2 border-cyan-500/80 p-4 sm:p-5 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-cyan-600 text-black font-black text-xs uppercase tracking-wider rounded flex items-center gap-1.5 shadow">
                <Radio className="w-3.5 h-3.5 fill-current" />
                {isEn ? 'FLEET TELEMETRY & SYNC MESH' : 'TELEMETRIA FLOTTA & MESH SINCRONIZZAZIONE'}
              </span>
              <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono text-xs">
                {isEn ? 'MONITORED NODES:' : 'NODI MONITORATI:'} <strong>{metrics.total}</strong> ({isEn ? '60 Learners + 12 Tech + 12 Faculty' : '60 Discenti + 12 Tecnici + 12 Faculty'})
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono text-xs flex items-center gap-1 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {metrics.online}/{metrics.total} {isEn ? 'ONLINE' : 'CONNESSI'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-cyan-400" />
              <span>{isEn ? 'Real-Time Device Synchronization Dashboard' : 'Dashboard Stato Connessione Dispositivi in Tempo Reale'}</span>
            </h2>

            <p className="text-xs text-neutral-400 font-mono max-w-3xl">
              {isEn
                ? 'Mission-critical fleet tracking of all 60 discenti tablets/smartphones and 12 technician consoles. Continuous heartbeat validation, latency monitoring and strict course phase lock.'
                : 'Monitoraggio costante dello stato di connessione di ogni dispositivo tecnico e discente. Verifica heartbeat, latenza di rete, allineamento orario e sincronizzazione istantanea con la Regia.'}
            </p>
          </div>

          {/* Global Actions: Ping, Resync, Sim Toggle */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            <button
              onClick={handleTriggerGlobalPing}
              disabled={isPinging}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition-all shadow cursor-pointer disabled:opacity-50"
              title={isEn ? 'Ping entire mesh fleet' : 'Esegui ping su tutta la flotta'}
            >
              <Zap className={`w-4 h-4 ${isPinging ? 'animate-bounce' : ''}`} />
              <span>{isPinging ? (isEn ? 'Pinging...' : 'Ping in corso...') : (isEn ? 'Global Ping' : 'Ping Globale')}</span>
            </button>

            <button
              onClick={handleForceResyncAll}
              disabled={isResyncing}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border border-cyan-600 font-black text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition-all shadow cursor-pointer disabled:opacity-50"
              title={isEn ? 'Force all devices to align with Regia phase' : 'Forza tutti i dispositivi ad allinearsi alla fase Regia'}
            >
              <RefreshCw className={`w-4 h-4 ${isResyncing ? 'animate-spin' : ''}`} />
              <span>{isResyncing ? (isEn ? 'Resyncing...' : 'Risincronizzazione...') : (isEn ? 'Force Resync' : 'Forza Risinc')}</span>
            </button>

            {/* Simulated Fleet Mode Toggle */}
            <button
              onClick={() => setIsFleetSimulationActive((prev) => !prev)}
              className={`px-3 py-2 font-mono text-xs font-black uppercase rounded border transition-all cursor-pointer flex items-center gap-1.5 ${
                isFleetSimulationActive
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
              }`}
              title={isEn ? 'Toggle simulated fleet telemetry for full course verification' : 'Attiva/Disattiva simulazione flotta completa per verifica operativa'}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFleetSimulationActive ? (isEn ? 'Sim Fleet: ON (84)' : 'Sim Flotta: ON (84)') : (isEn ? 'Sim Fleet: OFF' : 'Sim Flotta: OFF')}</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-4 mt-4 border-t border-neutral-800 font-mono">
          {/* Online Discenti */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-2.5 rounded-lg">
            <span className="text-[10px] text-neutral-400 uppercase block font-bold">
              {isEn ? 'Learners Connected' : 'Discenti Connessi'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-cyan-400 font-mono">
                {metrics.discentiOnline}
              </span>
              <span className="text-xs text-neutral-500">/ {metrics.discentiCount}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
              ● {Math.round((metrics.discentiOnline / Math.max(1, metrics.discentiCount)) * 100)}% {isEn ? 'active' : 'attivi'}
            </span>
          </div>

          {/* Online Tecnici */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-2.5 rounded-lg">
            <span className="text-[10px] text-neutral-400 uppercase block font-bold">
              {isEn ? 'Technicians Connected' : 'Tecnici Connessi'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-pink-400 font-mono">
                {metrics.techOnline}
              </span>
              <span className="text-xs text-neutral-500">/ {metrics.techCount}</span>
            </div>
            <span className="text-[10px] text-pink-300 font-bold block mt-0.5">
              📻 CH-3 {isEn ? 'Active' : 'Presidiato'}
            </span>
          </div>

          {/* Online Faculty */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-2.5 rounded-lg">
            <span className="text-[10px] text-neutral-400 uppercase block font-bold">
              {isEn ? 'Faculty Tutors' : 'Faculty Tutor'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-amber-400 font-mono">
                {metrics.facultyOnline}
              </span>
              <span className="text-xs text-neutral-500">/ {metrics.facultyCount}</span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold block mt-0.5">
              1:1 {isEn ? 'Ratio Locked' : 'Presidio 1:1'}
            </span>
          </div>

          {/* Fleet Sync Compliance */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-2.5 rounded-lg">
            <span className="text-[10px] text-neutral-400 uppercase block font-bold">
              {isEn ? 'Phase Lock Sync' : 'Lock Fase Regia'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-xl font-black font-mono ${metrics.syncRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {metrics.syncRate}%
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">
              {metrics.desynced === 0 ? (isEn ? 'All in lockstep' : 'Tutti allineati') : `${metrics.desynced} ${isEn ? 'divergent' : 'da riallineare'}`}
            </span>
          </div>

          {/* Average Latency */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-2.5 rounded-lg">
            <span className="text-[10px] text-neutral-400 uppercase block font-bold">
              {isEn ? 'Mesh Latency' : 'Latenza Mesh Media'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white font-mono">
                {metrics.avgLatency}
              </span>
              <span className="text-xs text-neutral-400">ms</span>
            </div>
            <span className="text-[10px] text-cyan-300 block mt-0.5">
              ⚡ {isEn ? 'Ultra-low jitter' : 'Stabilità elevata'}
            </span>
          </div>

          {/* Issues / Anomalies */}
          <div className={`p-2.5 rounded-lg border ${metrics.offline + metrics.lag > 0 ? 'bg-amber-950/40 border-amber-600/80' : 'bg-neutral-900/90 border-neutral-800'}`}>
            <span className="text-[10px] text-neutral-400 uppercase block font-bold">
              {isEn ? 'Lag / Warnings' : 'Anomalie / Warning'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-xl font-black font-mono ${metrics.offline + metrics.lag > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {metrics.offline + metrics.lag}
              </span>
              <span className="text-xs text-neutral-500">/ {metrics.total}</span>
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">
              {metrics.offline > 0 ? `${metrics.offline} offline` : (isEn ? 'Zero network dropout' : 'Nessun dropout')}
            </span>
          </div>
        </div>
      </div>

      {/* Control & Filter Toolbar */}
      <div className="bg-neutral-900 border border-neutral-800 p-3 sm:p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Role Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setRoleFilter('ALL');
              setGroupFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded font-mono font-black text-xs uppercase tracking-wider transition-colors cursor-pointer border ${
              roleFilter === 'ALL'
                ? 'bg-cyan-500 text-black border-cyan-400 shadow'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            {isEn ? 'All Fleet' : 'Tutta la Flotta'} ({metrics.total})
          </button>

          <button
            onClick={() => setRoleFilter('discenti')}
            className={`px-3 py-1.5 rounded font-mono font-black text-xs uppercase tracking-wider transition-colors cursor-pointer border ${
              roleFilter === 'discenti'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow'
                : 'bg-neutral-950 text-cyan-400/80 border-neutral-800 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 inline mr-1" />
            {isEn ? 'Discenti' : 'Discenti'} (60)
          </button>

          <button
            onClick={() => setRoleFilter('tecnici')}
            className={`px-3 py-1.5 rounded font-mono font-black text-xs uppercase tracking-wider transition-colors cursor-pointer border ${
              roleFilter === 'tecnici'
                ? 'bg-pink-600 text-white border-pink-400 shadow'
                : 'bg-neutral-950 text-pink-400/80 border-neutral-800 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 inline mr-1" />
            {isEn ? 'Technicians' : 'Tecnici'} (12)
          </button>

          <button
            onClick={() => setRoleFilter('faculty')}
            className={`px-3 py-1.5 rounded font-mono font-black text-xs uppercase tracking-wider transition-colors cursor-pointer border ${
              roleFilter === 'faculty'
                ? 'bg-amber-600 text-black border-amber-400 shadow'
                : 'bg-neutral-950 text-amber-400/80 border-neutral-800 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 inline mr-1" />
            {isEn ? 'Faculty' : 'Faculty'} (12)
          </button>

          <button
            onClick={() => setRoleFilter('ISSUES')}
            className={`px-3 py-1.5 rounded font-mono font-black text-xs uppercase tracking-wider transition-colors cursor-pointer border ${
              roleFilter === 'ISSUES'
                ? 'bg-red-600 text-white border-red-400 shadow animate-pulse'
                : 'bg-neutral-950 text-red-400 border-neutral-800 hover:bg-red-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
            {isEn ? 'Issues Only' : 'Solo Anomalie'} ({metrics.offline + metrics.lag})
          </button>
        </div>

        {/* Right: Search & Macro-group Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Macro-Group selector if in Discenti mode or ALL */}
          {(roleFilter === 'ALL' || roleFilter === 'discenti') && (
            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded p-0.5">
              {(['ALL', 'ALPHA', 'BRAVO', 'CHARLIE', 'DELTA'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGroupFilter(g)}
                  className={`px-2 py-1 text-[10px] font-mono font-black uppercase rounded transition-colors cursor-pointer ${
                    groupFilter === g
                      ? 'bg-cyan-500 text-black font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {g === 'ALL' ? (isEn ? 'All Grp' : 'Tutti') : g}
                </button>
              ))}
            </div>
          )}

          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Search matricola, name, station...' : 'Cerca DISC-xx, TECH-xx, postazione...'}
              className="w-full bg-neutral-950 text-white text-xs font-mono pl-8 pr-3 py-1.5 rounded border border-neutral-800 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Device Fleet Grid Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
          <span>
            {isEn ? 'DISPLAYING' : 'VISUALIZZAZIONE:'} <strong className="text-white">{filteredDevices.length}</strong> {isEn ? 'DEVICES' : 'DISPOSITIVI'}
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Online
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Standby/Lag
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Offline
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredDevices.map((device) => {
            const isOnline = device.status === 'online';
            const isLag = device.status === 'lag';
            const isOffline = device.status === 'offline';

            const roleBorderColor =
              device.role === 'tecnico'
                ? 'border-pink-500/60 hover:border-pink-400'
                : device.role === 'faculty'
                ? 'border-amber-500/60 hover:border-amber-400'
                : 'border-cyan-500/60 hover:border-cyan-400';

            const statusBadgeBg = isOnline
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
              : isLag
              ? 'bg-amber-950 text-amber-300 border-amber-600'
              : 'bg-red-950 text-red-300 border-red-700';

            return (
              <div
                key={device.badgeCode}
                className={`bg-neutral-950 border-2 ${roleBorderColor} p-3 sm:p-3.5 rounded-xl shadow-lg flex flex-col justify-between space-y-2.5 transition-all relative overflow-hidden`}
              >
                {/* Top Bar: Badge Code, Hierarchical Code & Status Beacon */}
                <div className="flex items-center justify-between gap-1.5 border-b border-neutral-800/80 pb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`px-2 py-0.5 font-mono font-black text-xs rounded uppercase tracking-wider ${
                        device.role === 'tecnico'
                          ? 'bg-pink-600 text-white'
                          : device.role === 'faculty'
                          ? 'bg-amber-500 text-black'
                          : device.isTeamLeader
                          ? 'bg-cyan-500 text-black'
                          : 'bg-neutral-800 text-cyan-300 border border-cyan-800/80'
                      }`}
                    >
                      {device.badgeCode}
                    </span>

                    {device.hierarchicalCode && (
                      <span className="text-[10px] font-mono text-neutral-400 font-bold truncate">
                        {device.hierarchicalCode}
                      </span>
                    )}
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="relative flex h-2.5 w-2.5">
                      {isOnline && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                          isOnline ? 'bg-emerald-500' : isLag ? 'bg-amber-400 animate-pulse' : 'bg-red-500'
                        }`}
                      />
                    </span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono font-black uppercase rounded border ${statusBadgeBg}`}>
                      {device.status}
                    </span>
                  </div>
                </div>

                {/* Body: Participant Name, Operational Role & Assigned Duty */}
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight truncate" title={device.name}>
                    {device.name}
                  </h4>

                  <div className="text-[11px] font-mono flex items-center justify-between text-neutral-400">
                    <span className="text-cyan-300 font-bold truncate">
                      {device.categoryLabel}
                    </span>
                    {device.teamName && (
                      <span className="text-[10px] bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 text-neutral-300">
                        {device.teamName}
                      </span>
                    )}
                  </div>

                  {/* Station Location */}
                  <div className="pt-1 text-[11px] font-mono">
                    <div className="text-neutral-400 text-[10px] uppercase font-bold">{isEn ? 'Station Location:' : 'Postazione Attiva:'}</div>
                    <div className="text-neutral-200 font-bold truncate flex items-center gap-1">
                      <span>📍</span>
                      <span className="truncate">{device.currentStation}</span>
                    </div>
                  </div>
                </div>

                {/* Telemetry Details Footer */}
                <div className="pt-2 border-t border-neutral-800/80 text-[10px] font-mono space-y-1">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>{isEn ? 'Last Seen:' : 'Ultimo Heartbeat:'}</span>
                    <span className={isOffline ? 'text-red-400 font-bold' : 'text-neutral-200'}>
                      {formatLastSeen(device.lastSeenMsAgo)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-400">
                    <span>{isEn ? 'Latency & Battery:' : 'Latenza & Batteria:'}</span>
                    <span className="flex items-center gap-2">
                      <strong className={device.latencyMs > 100 ? 'text-amber-400' : 'text-emerald-400'}>
                        {device.latencyMs}ms
                      </strong>
                      <span className="text-neutral-500">•</span>
                      <span className={device.batteryPct < 25 ? 'text-red-400 font-bold' : 'text-neutral-300'}>
                        🔋 {device.batteryPct}%
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-400">
                    <span>{isEn ? 'Course Lock:' : 'Lock Slot Regia:'}</span>
                    <span
                      className={`font-black ${
                        device.isDesyncedFromRegia
                          ? 'text-red-400 bg-red-950 px-1 rounded border border-red-800'
                          : 'text-emerald-400'
                      }`}
                    >
                      {device.isDesyncedFromRegia
                        ? (isEn ? '⚠️ DESYNC' : '⚠️ DESINCRONIZZATO')
                        : `DAY 0${device.syncedDay} • SLOT ${device.syncedSlot + 1}`}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedDeviceForModal(device)}
                    className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded border border-neutral-800 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title={isEn ? 'Inspect Telemetry' : 'Ispeziona Telemetria'}
                  >
                    <Info className="w-3 h-3 text-cyan-400" />
                    <span>{isEn ? 'Info' : 'Dati'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenQrPass(device)}
                    className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded border border-neutral-800 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title={isEn ? 'Show QR Code Pass' : 'Mostra QR Code'}
                  >
                    <QrCode className="w-3 h-3 text-amber-400" />
                    <span>QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenDeviceConsole(device)}
                    className="p-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 rounded border border-cyan-800/80 text-[10px] font-mono font-black flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title={isEn ? 'Open device perspective' : 'Apri console dispositivo'}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{isEn ? 'Open' : 'Apri'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Telemetry Inspection Modal */}
      {selectedDeviceForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-neutral-950 border-2 border-cyan-500 w-full max-w-lg shadow-2xl rounded-xl overflow-hidden flex flex-col font-mono">
            {/* Modal Header */}
            <div className="bg-cyan-950/80 border-b border-cyan-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-cyan-500 text-black font-black text-xs rounded uppercase">
                  {selectedDeviceForModal.badgeCode}
                </span>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    {selectedDeviceForModal.name}
                  </h3>
                  <span className="text-[10px] text-cyan-300">
                    {selectedDeviceForModal.categoryLabel} • {selectedDeviceForModal.hierarchicalCode || selectedDeviceForModal.role}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedDeviceForModal(null)}
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded border border-neutral-700 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-3.5 text-xs text-neutral-300 overflow-y-auto max-h-[70vh]">
              <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg space-y-2">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-1.5">
                  <span className="text-neutral-400 uppercase font-bold">{isEn ? 'Sync Status:' : 'Stato Sincronizzazione:'}</span>
                  <span
                    className={`font-black uppercase px-2 py-0.5 rounded text-[11px] ${
                      selectedDeviceForModal.status === 'online'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : selectedDeviceForModal.status === 'lag'
                        ? 'bg-amber-950 text-amber-300 border border-amber-600'
                        : 'bg-red-950 text-red-300 border border-red-700'
                    }`}
                  >
                    ● {selectedDeviceForModal.status}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">{isEn ? 'Assigned Duty Station:' : 'Postazione Assegnata:'}</span>
                  <span className="text-white font-bold">{selectedDeviceForModal.currentStation}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">{isEn ? 'Radio Channel:' : 'Canale Radio:'}</span>
                  <span className="text-cyan-400 font-bold">{selectedDeviceForModal.radioChannel}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">{isEn ? 'Network IP Address:' : 'Indirizzo IP Mesh:'}</span>
                  <span className="font-mono text-neutral-200">{selectedDeviceForModal.ipAddress}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">{isEn ? 'Roundtrip Latency:' : 'Latenza di Rete (RTT):'}</span>
                  <span className="text-emerald-400 font-bold">{selectedDeviceForModal.latencyMs} ms</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">{isEn ? 'Battery Level:' : 'Stato Batteria:'}</span>
                  <span className="text-white font-bold">🔋 {selectedDeviceForModal.batteryPct}%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">{isEn ? 'Course Lock Slot:' : 'Slot Sincronizzato:'}</span>
                  <span className={selectedDeviceForModal.isDesyncedFromRegia ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    Day {selectedDeviceForModal.syncedDay} • Slot {selectedDeviceForModal.syncedSlot + 1}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">{isEn ? 'Last Heartbeat Packet:' : 'Ultimo Pacchetto Heartbeat:'}</span>
                  <span className="text-white font-mono">{formatLastSeen(selectedDeviceForModal.lastSeenMsAgo)}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded text-[11px] text-cyan-200 leading-relaxed">
                💡 {isEn
                  ? 'If this device drops offline or loses phase lock, scan the QR code to re-authenticate or use "Force Resync" to send an instant reload signal across the WebSocket mesh.'
                  : 'Se questo dispositivo perde la connessione o si desincronizza, inquadra il codice QR sul tablet o usa "Forza Risinc" per inviare il segnale di allineamento istantaneo.'}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  handleOpenQrPass(selectedDeviceForModal);
                  setSelectedDeviceForModal(null);
                }}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEn ? 'Show QR Pass' : 'Mostra QR Pass'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleOpenDeviceConsole(selectedDeviceForModal);
                  setSelectedDeviceForModal(null);
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isEn ? 'Open Console' : 'Apri Console'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable QR Pass Modal */}
      {qrModalPerson && (
        <ParticipantQRModal
          isOpen={Boolean(qrModalPerson)}
          onClose={() => setQrModalPerson(null)}
          person={qrModalPerson.person}
          category={qrModalPerson.category}
        />
      )}
    </div>
  );
};
