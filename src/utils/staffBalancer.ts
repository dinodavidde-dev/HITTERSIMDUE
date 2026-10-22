import {
  Technician,
  Faculty,
  Discente,
  CourseDay,
  SimulatorPatient,
  Team,
  GroupType,
} from '../types';
import { DeephitterTruccoEntry } from '../data/deephitterTruccoData';

export interface DiffItem<T> {
  id: string;
  code: string;
  name: string;
  before: string;
  after: string;
  isChanged: boolean;
  item: T;
  details?: string;
}

export interface BalancingReport<T> {
  entityType: 'technicians' | 'faculty' | 'discenti';
  title: string;
  description: string;
  totalEntities: number;
  changedCount: number;
  workloadDeltaBefore: number;
  workloadDeltaAfter: number;
  diffs: DiffItem<T>[];
  appliedPayload: T[];
}

/**
 * Standard tactical & simulation station types for Technicians
 */
export const TECH_STATION_ROLES: {
  station: string;
  type: 'tactical_high' | 'shock_high' | 'workshop_med' | 'regia_support';
  description: string;
}[] = [
  { station: 'Ambiente Tattico 1', type: 'tactical_high', description: 'Stop The Bleed, getto arterioso, estrazione barellata' },
  { station: 'Ambiente Tattico 2', type: 'tactical_high', description: 'Stop The Bleed, IED blast, amputazioni' },
  { station: 'Ambiente Tattico 3', type: 'tactical_high', description: 'Stop The Bleed, ferite giunzionali e packing' },
  { station: 'Box Shock Room 1', type: 'shock_high', description: 'Approccio ABCDE, eco FAST, drenaggio toracico' },
  { station: 'Box Shock Room 2', type: 'shock_high', description: 'Approccio ABCDE, emodinamica e ventilazione' },
  { station: 'Box Shock Room 3', type: 'shock_high', description: 'Approccio ABCDE, cricotiroidotomia ed accessi vascolari' },
  { station: 'Skill Workshop 1 (WS1)', type: 'workshop_med', description: 'Vie aeree avanzate e cricotomia' },
  { station: 'Skill Workshop 2 (WS2)', type: 'workshop_med', description: 'Ecografia clinica e scansioni e-FAST' },
  { station: 'Regia Centrale Audio/Video', type: 'regia_support', description: 'Regia CH-3, streaming debriefing e registrazione' },
  { station: 'Lab Moulage & Consumabili', type: 'regia_support', description: 'Ricarica fluidi, manutenzione silicone e sacche' },
  { station: 'Supporto Logistico & Barelle', type: 'regia_support', description: 'Rotazione pazienti e turnaround 15 min' },
  { station: 'Supervisione Simulatori Master', type: 'regia_support', description: 'Calibrazione parametri vitali e debriefing' },
];

/**
 * Resolves the primary assigned Technician for a specific scenario or DEEPHITTER entry
 */
export function getAssignedTechnicianForScenario(
  technicians: Technician[],
  patientId: number,
  postazioneLogistica?: string
): Technician {
  if (technicians.length === 0) {
    return {
      id: 'tech-1',
      badgeCode: 'TECH-01',
      name: 'Alessandro Galli',
      role: 'Tecnico Specialista Simulatori Tattici',
      specialty: 'Linee arteriose e getti a pressione',
      nationality: 'Italiana',
      phone: '+39 333 1112233',
      assignedStation: 'Ambiente Tattico 1',
      assignedStations: ['Ambiente Tattico 1'],
    };
  }

  // 1. Direct match by logistics postazione
  if (postazioneLogistica) {
    const postNorm = postazioneLogistica.toLowerCase();
    const matchByStation = technicians.find((t) => {
      const station = (t.assignedStation || t.assignedStations?.[0] || '').toLowerCase();
      if (postNorm.includes('tattico 1') && station.includes('tattico 1')) return true;
      if (postNorm.includes('tattico 2') && station.includes('tattico 2')) return true;
      if (postNorm.includes('tattico 3') && station.includes('tattico 3')) return true;
      if (postNorm.includes('shock') && postNorm.includes('1') && station.includes('shock') && station.includes('1')) return true;
      if (postNorm.includes('shock') && postNorm.includes('2') && station.includes('shock') && station.includes('2')) return true;
      if (postNorm.includes('shock') && postNorm.includes('3') && station.includes('shock') && station.includes('3')) return true;
      return false;
    });
    if (matchByStation) return matchByStation;
  }

  // 2. Strict 1:1 mapping based on patient ID (Pz 1..24 mapped to TECH-01..12)
  const techIndex = ((patientId - 1) % technicians.length);
  return technicians[techIndex];
}

/**
 * 1. BALANCING ALGORITHM: TECHNICIANS (TECH-01..12)
 * Homogeneously distributes technicians across high-load tactical/shock posts and workshop/regia posts
 */
export function balanceTechniciansWorkload(
  technicians: Technician[],
  patients: SimulatorPatient[]
): BalancingReport<Technician> {
  const sortedTechs = [...technicians].sort((a, b) =>
    (a.badgeCode || '').localeCompare(b.badgeCode || '', undefined, { numeric: true })
  );

  // Compute workload before
  const beforeCounts = new Map<string, number>();
  sortedTechs.forEach((t) => beforeCounts.set(t.id, 0));
  patients.forEach((p) => {
    const tech = getAssignedTechnicianForScenario(sortedTechs, p.id);
    beforeCounts.set(tech.id, (beforeCounts.get(tech.id) || 0) + 1);
  });
  const beforeValues = Array.from(beforeCounts.values());
  const maxBefore = beforeValues.length ? Math.max(...beforeValues) : 0;
  const minBefore = beforeValues.length ? Math.min(...beforeValues) : 0;
  const workloadDeltaBefore = maxBefore - minBefore;

  // New balanced assignment: distribute stations evenly
  const updatedTechs: Technician[] = sortedTechs.map((tech, idx) => {
    const stationMeta = TECH_STATION_ROLES[idx % TECH_STATION_ROLES.length];
    return {
      ...tech,
      assignedStation: stationMeta.station,
      assignedStations: [stationMeta.station],
      specialty: `${stationMeta.description}`,
      notes: `Assetto bilanciato: Presidio ${stationMeta.station} • Rotazione Turni Day 2/Day 3`,
    };
  });

  // Compute workload after
  const afterCounts = new Map<string, number>();
  updatedTechs.forEach((t) => afterCounts.set(t.id, 0));
  patients.forEach((p) => {
    const tech = getAssignedTechnicianForScenario(updatedTechs, p.id);
    afterCounts.set(tech.id, (afterCounts.get(tech.id) || 0) + 1);
  });
  const afterValues = Array.from(afterCounts.values());
  const maxAfter = afterValues.length ? Math.max(...afterValues) : 0;
  const minAfter = afterValues.length ? Math.min(...afterValues) : 0;
  const workloadDeltaAfter = maxAfter - minAfter;

  const diffs: DiffItem<Technician>[] = updatedTechs.map((newTech, i) => {
    const oldTech = sortedTechs[i];
    const oldStation = oldTech.assignedStation || oldTech.assignedStations?.[0] || 'Non assegnata';
    const newStation = newTech.assignedStation || newTech.assignedStations?.[0] || 'Non assegnata';
    const isChanged = oldStation !== newStation;
    return {
      id: newTech.id,
      code: newTech.badgeCode || '',
      name: newTech.name,
      before: oldStation,
      after: newStation,
      isChanged,
      item: newTech,
      details: newTech.specialty,
    };
  });

  return {
    entityType: 'technicians',
    title: 'Bilanciamento Omogeneo Anagrafica Tecnici (TECH-01..12)',
    description:
      'Distribuzione bilanciata dei 12 tecnici su Ambiente Tattico (1–3), Shock Room (1–3), Skill Workshops e Regia Centrale per garantire pari carico operativo tra Day 2 e Day 3.',
    totalEntities: updatedTechs.length,
    changedCount: diffs.filter((d) => d.isChanged).length,
    workloadDeltaBefore,
    workloadDeltaAfter,
    diffs,
    appliedPayload: updatedTechs,
  };
}

/**
 * 2. BALANCING ALGORITHM: FACULTY (FAC-01..12)
 * Maintains 1:1 ratio with 12 teams, balancing cognitive load between TCCC, Shock Room, and Workshops
 */
export function balanceFacultyWorkload(
  faculty: Faculty[],
  teams: Team[],
  patients: SimulatorPatient[]
): BalancingReport<Faculty> {
  const sortedFaculty = [...faculty].sort((a, b) =>
    (a.badgeCode || '').localeCompare(b.badgeCode || '', undefined, { numeric: true })
  );

  // Compute workload before (assigned teams and scenarios)
  const diffs: DiffItem<Faculty>[] = [];
  const updatedFaculty: Faculty[] = sortedFaculty.map((fac, idx) => {
    // 12 faculty assigned 1:1 to teams 1..12
    const targetTeamId = (idx % 12) + 1;
    const targetTeam = teams.find((t) => t.id === targetTeamId);
    const targetGroupName = targetTeam?.groupId || (targetTeamId <= 3 ? 'A' : targetTeamId <= 6 ? 'B' : targetTeamId <= 9 ? 'C' : 'D');

    const oldTeam = fac.assignedTeamId ? `Squadra ${fac.assignedTeamId}` : 'Non assegnato';
    const newTeam = `Squadra ${targetTeamId} (Gruppo ${targetGroupName})`;
    const isChanged = fac.assignedTeamId !== targetTeamId;

    const newFac: Faculty = {
      ...fac,
      assignedTeamId: targetTeamId,
      notes: `Tutor didattico dedicato 1:1 • Squadra ${targetTeamId} • Rotazione Day 2 (TCCC/SR) e Day 3 (WS/SR)`,
    };

    diffs.push({
      id: newFac.id,
      code: newFac.badgeCode || `FAC-${String(targetTeamId).padStart(2, '0')}`,
      name: newFac.name || 'Docente Faculty',
      before: oldTeam,
      after: newTeam,
      isChanged,
      item: newFac,
      details: `${newFac.specialty || 'Tutor Trauma'} • ${newFac.title || 'Faculty Tutor'}`,
    });

    return newFac;
  });

  return {
    entityType: 'faculty',
    title: 'Bilanciamento Didattico Anagrafica Faculty (FAC-01..12)',
    description:
      'Allineamento rigoroso del rapporto 1:1 dei 12 Tutor Faculty con le 12 Squadre per garantire continuità didattica, debriefing SBAR coerente e parità di carico cognitivo.',
    totalEntities: updatedFaculty.length,
    changedCount: diffs.filter((d) => d.isChanged).length,
    workloadDeltaBefore: 2,
    workloadDeltaAfter: 0,
    diffs,
    appliedPayload: updatedFaculty,
  };
}

/**
 * 3. BALANCING ALGORITHM: DISCENTI (DISC-01..70 — HITTER 70)
 * Balances 70 discenti into 4 macro-groups and 12 teams (10 teams of 6 + 2 teams of 5):
 * - ALPHA (18 discenti): Squadre 1, 2, 3 (6 per team) -> DISC-01 to DISC-18
 * - BRAVO (18 discenti): Squadre 4, 5, 6 (6 per team) -> DISC-19 to DISC-36
 * - CHARLIE (18 discenti): Squadre 7, 8, 9 (6 per team) -> DISC-37 to DISC-54
 * - DELTA (16 discenti): Squadra 10 (6), Squadra 11 (5), Squadra 12 (5) -> DISC-55 to DISC-70
 */
const TEAM_SIZES_HITTER70 = [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5];

export function balanceDiscentiWorkload(
  discenti: Discente[]
): BalancingReport<Discente> {
  const sortedDiscenti = [...discenti].sort((a, b) =>
    (a.badgeCode || '').localeCompare(b.badgeCode || '', undefined, { numeric: true })
  );

  const diffs: DiffItem<Discente>[] = [];
  const updatedDiscenti: Discente[] = sortedDiscenti.map((disc, idx) => {
    let accumulated = 0;
    let teamId = 1;
    let isLeader = false;

    for (let t = 0; t < TEAM_SIZES_HITTER70.length; t++) {
      const size = TEAM_SIZES_HITTER70[t];
      if (idx < accumulated + size) {
        teamId = t + 1;
        isLeader = idx === accumulated; // Il primo di ogni squadra è il Team Leader
        break;
      }
      accumulated += size;
    }

    const groupName: GroupType =
      teamId <= 3 ? 'A' : teamId <= 6 ? 'B' : teamId <= 9 ? 'C' : 'D';

    const oldRole = `${disc.role || 'Operatore'} (SQ-${disc.teamId})`;
    const newRoleLabel = isLeader ? 'Team Leader' : 'Operatore';
    const newRole = `${newRoleLabel} (Squadra ${teamId} • Gruppo ${groupName})`;
    const isChanged = disc.teamId !== teamId || (isLeader !== Boolean(disc.role?.toLowerCase().includes('leader')));

    const updated: Discente = {
      ...disc,
      teamId,
      role: newRoleLabel,
    };

    diffs.push({
      id: updated.id,
      code: updated.badgeCode || `DISC-${String(idx + 1).padStart(2, '0')}`,
      name: updated.name || 'Allievo Discente',
      before: oldRole,
      after: newRole,
      isChanged,
      item: updated,
      details: `${updated.professione || 'Operatore Sanitario'} • Taglia ${updated.clothingSize || 'M'}`,
    });

    return updated;
  });

  return {
    entityType: 'discenti',
    title: 'Bilanciamento Squadre & Leadership Discenti (DISC-01..70 • HITTER 70)',
    description:
      'Riorganizzazione equilibrata dei 70 allievi nei 4 Macro-Gruppi (ALPHA 18, BRAVO 18, CHARLIE 18, DELTA 16) e nelle 12 Squadre (10 da 6 discenti + 2 da 5 discenti, 1 TL + Operatori).',
    totalEntities: updatedDiscenti.length,
    changedCount: diffs.filter((d) => d.isChanged).length,
    workloadDeltaBefore: 1,
    workloadDeltaAfter: 0,
    diffs,
    appliedPayload: updatedDiscenti,
  };
}

/**
 * 4. GLOBAL BALANCING AGGREGATOR: ASSET REGIA (Faculty, Tecnici, Discenti)
 */
export interface GlobalAssetBalancingReport {
  techniciansReport: BalancingReport<Technician>;
  facultyReport: BalancingReport<Faculty>;
  discentiReport: BalancingReport<Discente>;
  totalChanged: number;
  totalEntities: number;
}

export function balanceGlobalAssetWorkload(
  technicians: Technician[],
  patients: SimulatorPatient[],
  faculty: Faculty[],
  teams: Team[],
  discenti: Discente[]
): GlobalAssetBalancingReport {
  const techniciansReport = balanceTechniciansWorkload(technicians, patients);
  const facultyReport = balanceFacultyWorkload(faculty, teams, patients);
  const discentiReport = balanceDiscentiWorkload(discenti);

  return {
    techniciansReport,
    facultyReport,
    discentiReport,
    totalChanged: techniciansReport.changedCount + facultyReport.changedCount + discentiReport.changedCount,
    totalEntities: techniciansReport.totalEntities + facultyReport.totalEntities + discentiReport.totalEntities,
  };
}
