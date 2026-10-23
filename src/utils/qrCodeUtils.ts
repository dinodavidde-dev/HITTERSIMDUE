import QRCode from 'qrcode';
import { Discente, Faculty, Technician, Director, RegiaStaff, Guest, Team, MakeupArtist, CourseActor } from '../types';

export type ParticipantCategory =
  | 'discente'
  | 'discenti'
  | 'faculty'
  | 'tecnici'
  | 'direttori'
  | 'regia'
  | 'ospiti'
  | 'truccatori'
  | 'attori';

export type AnyParticipant =
  | Discente
  | Faculty
  | Technician
  | Director
  | RegiaStaff
  | Guest
  | MakeupArtist
  | CourseActor;

/**
 * Computes a deterministic compact hash / fingerprint representing the participant's exact data state.
 * Any change to name, role, email, phone, team, nationality, etc. will produce a new hash,
 * causing the QR code to be regenerated.
 */
export function computeParticipantDataHash(person: AnyParticipant, category?: string): string {
  if (!person) return '00000000';
  
  const rawString = [
    person.id || '',
    person.name || '',
    (person as any).role || (person as any).title || '',
    (person as any).specialty || (person as any).experience || '',
    (person as any).badgeCode || '',
    (person as any).teamId !== undefined ? String((person as any).teamId) : '',
    (person as any).assignedTeamId !== undefined ? String((person as any).assignedTeamId) : '',
    person.nationality || '',
    person.email || '',
    person.phone || '',
    (person as any).organization || '',
    (person as any).notes || '',
    (person as any).updatedAt || '',
    category || '',
  ].join('§');

  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    const char = rawString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return hex;
}

/**
 * Builds the canonical direct URL that opens the participant's personalized view when scanned.
 */
export function getParticipantPersonalPageUrl(
  person: AnyParticipant,
  category: ParticipantCategory,
  customBaseUrl?: string,
  originRole?: 'regia' | 'direttore' | 'master'
): string {
  const base = customBaseUrl || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://trauma-sim.med');
  const badge = (person as any).badgeCode || person.id;
  const hash = computeParticipantDataHash(person, category);

  // Normalize view parameter
  const viewParam = category === 'tecnici' ? 'tecnici' 
    : category === 'direttori' ? 'direttori'
    : category === 'discenti' ? 'discente'
    : category === 'ospiti' ? 'public'
    : category === 'truccatori' ? 'truccatore'
    : category === 'attori' ? 'attore'
    : category;

  const url = new URL(base);
  url.searchParams.set('view', viewParam);
  url.searchParams.set('id', person.id);
  url.searchParams.set('badge', badge);
  if (category === 'discenti' || category === 'discente') {
    url.searchParams.set('discente', badge);
    url.searchParams.set('student', badge);
  } else if (category === 'faculty') {
    url.searchParams.set('faculty', badge);
    url.searchParams.set('tutor', badge);
  } else if (category === 'tecnici') {
    url.searchParams.set('tecnico', badge);
    url.searchParams.set('tech', badge);
  } else if (category === 'direttori') {
    url.searchParams.set('direttore', badge);
  } else if (category === 'regia') {
    url.searchParams.set('regia', badge);
  } else if (category === 'truccatori') {
    url.searchParams.set('truccatore', badge);
  } else if (category === 'attori') {
    url.searchParams.set('attore', badge);
  }
  url.searchParams.set('qr', '1');
  url.searchParams.set('h', hash); // Version fingerprint
  if (originRole) {
    url.searchParams.set('from', originRole);
  }

  return url.toString();
}

/**
 * Builds the canonical URL for any visuale, tagging the origin (e.g. from regia or direttore).
 */
export function buildVisualeUrl(
  view: string,
  originRole?: 'regia' | 'direttore' | 'master',
  extraParams?: Record<string, string>
): string {
  const base = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://trauma-sim.med';
  const url = new URL(base);
  url.searchParams.set('view', view);
  if (originRole) {
    url.searchParams.set('from', originRole);
  }
  if (extraParams) {
    Object.entries(extraParams).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

/**
 * Opens any visuale in a new browser window/tab tagged with the origin role.
 */
export function openVisualeInNewWindow(
  view: string,
  originRole?: 'regia' | 'direttore' | 'master',
  extraParams?: Record<string, string>
): Window | null {
  if (typeof window !== 'undefined') {
    const url = buildVisualeUrl(view, originRole, extraParams);
    return window.open(url, '_blank', 'noopener,noreferrer');
  }
  return null;
}

/**
 * Builds a structured vCard format for medical / tactical badge pass.
 */
export function getParticipantVCardPayload(person: AnyParticipant, category: ParticipantCategory, teamName?: string): string {
  const badge = (person as any).badgeCode || 'PASS';
  const role = (person as any).role || (person as any).title || 'Operatore';
  const org = (person as any).organization || 'Tactical Emergency Trauma Team';
  const hash = computeParticipantDataHash(person, category);

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${person.name}`,
    `N:${person.name};;;;`,
    `ORG:${org}`,
    `TITLE:${badge} - ${role}${teamName ? ` (${teamName})` : ''}`,
    person.email ? `EMAIL;TYPE=WORK:${person.email}` : '',
    person.phone ? `TEL;TYPE=CELL:${person.phone}` : '',
    `NOTE:TRAUMA SIMULATION COURSE • HASH:${hash} • CAT:${category.toUpperCase()}`,
    'END:VCARD'
  ].filter(Boolean).join('\n');
}

/**
 * Generates a Data URL for the QR code based on the chosen format.
 */
export async function generateParticipantQRCodeDataUrl(
  person: AnyParticipant,
  category: ParticipantCategory,
  format: 'url' | 'vcard' | 'json' = 'url',
  teamName?: string,
  options?: { size?: number; darkColor?: string; lightColor?: string }
): Promise<{ dataUrl: string; payload: string; hash: string }> {
  const hash = computeParticipantDataHash(person, category);
  let payload = '';

  if (format === 'url') {
    payload = getParticipantPersonalPageUrl(person, category);
  } else if (format === 'vcard') {
    payload = getParticipantVCardPayload(person, category, teamName);
  } else {
    // Compact JSON payload
    payload = JSON.stringify({
      id: person.id,
      b: (person as any).badgeCode,
      n: person.name,
      r: (person as any).role || (person as any).title,
      t: (person as any).teamId || (person as any).assignedTeamId,
      c: category,
      h: hash,
      u: getParticipantPersonalPageUrl(person, category),
    });
  }

  const dataUrl = await QRCode.toDataURL(payload, {
    width: (options?.size || 240) * 2,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: options?.darkColor || '#000000',
      light: options?.lightColor || '#ffffff',
    },
  });

  return { dataUrl, payload, hash };
}

/**
 * Normalizes participant codes, badges, or IDs by removing hyphens, spaces, and leading zeros.
 * Example: 'DISC-01', 'disc-1', 'disc01' -> 'disc1'
 */
export function normalizeParticipantCode(code?: string): string {
  if (!code) return '';
  const clean = code.trim().toLowerCase().replace(/[\s\-_]/g, '');
  return clean.replace(/^([a-z]+)0+(\d+)$/, '$1$2');
}

/**
 * Checks if a participant matches a given query string (by badgeCode, id, or name).
 * Works seamlessly whether query contains leading zeros, dashes, or full names.
 */
export function isParticipantMatch(person: AnyParticipant, query?: string): boolean {
  if (!person || !query) return false;
  const qClean = query.trim().toLowerCase();
  if (!qClean) return false;

  const qNorm = normalizeParticipantCode(query);
  const idNorm = normalizeParticipantCode(person.id);
  const badgeNorm = normalizeParticipantCode((person as any).badgeCode);

  if (qNorm && (qNorm === idNorm || qNorm === badgeNorm)) return true;
  if ((person.id || '').toLowerCase() === qClean) return true;
  if (((person as any).badgeCode || '').toLowerCase() === qClean) return true;
  if ((person.name || '').toLowerCase() === qClean) return true;
  if ((person.name || '').toLowerCase().includes(qClean)) return true;

  return false;
}

/**
 * Searches and resolves a participant by badge code, ID, or scanned URL.
 */
export function resolveParticipantByQuery(
  query: string,
  data: {
    discenti: Discente[];
    faculty: Faculty[];
    technicians: Technician[];
    directors: Director[];
    regiaStaff: RegiaStaff[];
    guests: Guest[];
    teams: Team[];
    makeupArtists?: MakeupArtist[];
    actors?: CourseActor[];
  }
): { person: AnyParticipant; category: ParticipantCategory; team?: Team } | null {
  if (!query || !query.trim()) return null;
  const q = query.trim();

  // Check if query is a URL with search params
  const candidates: string[] = [q];

  try {
    if (q.includes('?') || q.startsWith('http')) {
      const url = new URL(q, 'https://dummy.med');
      const params = url.searchParams;
      ['id', 'badge', 'discente', 'student', 'faculty', 'tutor', 'tecnico', 'tech', 'direttore', 'regia', 'truccatore', 'attore'].forEach((key) => {
        const val = params.get(key);
        if (val) candidates.push(val);
      });
    }
  } catch (e) {
    // Not a valid URL, keep candidates as-is
  }

  for (const candidate of candidates) {
    // 1. Search Discenti
    const disc = data.discenti.find((d) => isParticipantMatch(d, candidate));
    if (disc) {
      const team = data.teams.find((t) => t.id === disc.teamId);
      return { person: disc, category: 'discenti', team };
    }

    // 2. Search Faculty
    const fac = data.faculty.find((f) => isParticipantMatch(f, candidate));
    if (fac) {
      const team = data.teams.find((t) => t.id === fac.assignedTeamId);
      return { person: fac, category: 'faculty', team };
    }

    // 3. Search Technicians
    const tech = data.technicians.find((t) => isParticipantMatch(t, candidate));
    if (tech) {
      return { person: tech, category: 'tecnici' };
    }

    // 4. Search Directors
    const dir = data.directors.find((d) => isParticipantMatch(d, candidate));
    if (dir) {
      return { person: dir, category: 'direttori' };
    }

    // 5. Search Regia Staff
    const reg = data.regiaStaff.find((r) => isParticipantMatch(r, candidate));
    if (reg) {
      return { person: reg, category: 'regia' };
    }

    // 6. Search Actors
    if (data.actors) {
      const actor = data.actors.find((a) => isParticipantMatch(a, candidate));
      if (actor) {
        return { person: actor, category: 'attori' };
      }
    }

    // 7. Search Makeup Artists
    if (data.makeupArtists) {
      const truc = data.makeupArtists.find((m) => isParticipantMatch(m, candidate));
      if (truc) {
        return { person: truc, category: 'truccatori' };
      }
    }

    // 8. Search Guests
    const guest = data.guests.find((g) => isParticipantMatch(g, candidate));
    if (guest) {
      return { person: guest, category: 'ospiti' };
    }
  }

  return null;
}
