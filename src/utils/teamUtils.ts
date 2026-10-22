import { Team } from '../types';

export const TEAM_CODE_NAMES: Record<number, string> = {
  1: 'ALPHA-1 • EAGLE',
  2: 'ALPHA-2 • RANGER',
  3: 'ALPHA-3 • FALCON',
  4: 'BRAVO-1 • TITAN',
  5: 'BRAVO-2 • VIPER',
  6: 'BRAVO-3 • PHOENIX',
  7: 'CHARLIE-1 • SPARTAN',
  8: 'CHARLIE-2 • RAPTOR',
  9: 'CHARLIE-3 • COBRA',
  10: 'DELTA-1 • SENTINEL',
  11: 'DELTA-2 • WOLF',
  12: 'DELTA-3 • THUNDER',
};

export const SQUAD_CALLSIGNS: Record<number, string> = {
  1: 'EAGLE',
  2: 'RANGER',
  3: 'FALCON',
  4: 'TITAN',
  5: 'VIPER',
  6: 'PHOENIX',
  7: 'SPARTAN',
  8: 'RAPTOR',
  9: 'COBRA',
  10: 'SENTINEL',
  11: 'WOLF',
  12: 'THUNDER',
};

export const SQUAD_CALLSIGN_TO_ID: Record<string, number> = {
  'EAGLE': 1,
  'RANGER': 2,
  'FALCON': 3,
  'TITAN': 4,
  'VIPER': 5,
  'PHOENIX': 6,
  'SPARTAN': 7,
  'RAPTOR': 8,
  'COBRA': 9,
  'SENTINEL': 10,
  'WOLF': 11,
  'THUNDER': 12,
};

/**
 * Returns the formatted tactical squad designation (e.g., 'ALPHA-1 • EAGLE', 'BRAVO-1 • TITAN').
 */
export function getTeamCodeName(teamOrIdOrName: Team | number | string | undefined | null): string {
  if (!teamOrIdOrName && teamOrIdOrName !== 0) return '';

  if (typeof teamOrIdOrName === 'number') {
    return TEAM_CODE_NAMES[teamOrIdOrName] || `SQUADRA ${teamOrIdOrName}`;
  }

  if (typeof teamOrIdOrName === 'string') {
    const raw = teamOrIdOrName.trim().toUpperCase();
    if (SQUAD_CALLSIGN_TO_ID[raw]) {
      return TEAM_CODE_NAMES[SQUAD_CALLSIGN_TO_ID[raw]];
    }
    // Check if it's purely a numeric id string
    const num = parseInt(raw, 10);
    if (!isNaN(num) && TEAM_CODE_NAMES[num] && (/^\d+$/.test(raw) || /^team-?\d+$/i.test(raw))) {
      return TEAM_CODE_NAMES[num];
    }
    // Match team format (ALPHA 1, BRAVO 2, etc.)
    const phoneticMatch = raw.match(/\b(ALPHA|BETA|BRAVO|CHARLIE|DELTA)\s*[-_]?\s*(\d+)\b/i);
    if (phoneticMatch) {
      const g = phoneticMatch[1].toUpperCase();
      const n = parseInt(phoneticMatch[2], 10);
      const calculatedId = g === 'ALPHA' ? n : g === 'BRAVO' || g === 'BETA' ? 3 + n : g === 'CHARLIE' ? 6 + n : 9 + n;
      if (TEAM_CODE_NAMES[calculatedId]) {
        return TEAM_CODE_NAMES[calculatedId];
      }
    }
    // Match "Squadra 2" or "Team 2"
    const squadNumMatch = raw.match(/\b(?:squadra|team|sq\.?)\s*(\d+)\b/i);
    if (squadNumMatch) {
      const sqId = parseInt(squadNumMatch[1], 10);
      if (TEAM_CODE_NAMES[sqId]) {
        return TEAM_CODE_NAMES[sqId];
      }
    }
    // Remove color codes like (#EA580C) and return clean name
    return teamOrIdOrName.replace(/\(#[0-9a-fA-F]{3,8}\)/g, '').trim();
  }

  // Object case: Team
  if (teamOrIdOrName.id && TEAM_CODE_NAMES[teamOrIdOrName.id]) {
    return TEAM_CODE_NAMES[teamOrIdOrName.id];
  }

  if (teamOrIdOrName.name) {
    const rawUpper = teamOrIdOrName.name.trim().toUpperCase();
    if (SQUAD_CALLSIGN_TO_ID[rawUpper]) {
      return TEAM_CODE_NAMES[SQUAD_CALLSIGN_TO_ID[rawUpper]];
    }
    return teamOrIdOrName.name.replace(/\(#[0-9a-fA-F]{3,8}\)/g, '').trim();
  }

  return '';
}

/**
 * Recursively removes any undefined values from objects or arrays so Firestore doesn't throw unsupported field value errors.
 */
export function cleanUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined) as unknown as T;
  }
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, cleanUndefined(v)])
  ) as unknown as T;
}

/**
 * Checks if a participant's anagrafica is fully complete (name, valid email, and category-specific fields).
 */
export function isPersonComplete(person: any, category: 'discente' | 'faculty' | 'tecnico' | 'direttore' | 'ospite'): boolean {
  if (!person || !person.name || typeof person.name !== 'string' || person.name.trim() === '') {
    return false;
  }
  if (!person.email || typeof person.email !== 'string' || person.email.trim() === '') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(person.email.trim())) {
    return false;
  }

  switch (category) {
    case 'discente':
      return Boolean(person.role && person.teamId);
    case 'faculty':
      return Boolean(person.assignedTeamId !== undefined);
    case 'tecnico':
      return Boolean(person.assignedStations && Array.isArray(person.assignedStations) && person.assignedStations.length > 0);
    case 'direttore':
      return Boolean(person.title);
    case 'ospite':
      return Boolean(person.organization && person.assignedDays && Array.isArray(person.assignedDays) && person.assignedDays.length > 0);
    default:
      return true;
  }
}

