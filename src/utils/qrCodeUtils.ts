import QRCode from 'qrcode';
import { Discente, Faculty, Technician, Director, RegiaStaff, Guest, Team } from '../types';

export type ParticipantCategory = 'discente' | 'discenti' | 'faculty' | 'tecnici' | 'direttori' | 'regia' | 'ospiti';

export type AnyParticipant = Discente | Faculty | Technician | Director | RegiaStaff | Guest;

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
  customBaseUrl?: string
): string {
  const base = customBaseUrl || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://trauma-sim.med');
  const badge = (person as any).badgeCode || person.id;
  const hash = computeParticipantDataHash(person, category);

  // Normalize view parameter
  const viewParam = category === 'tecnici' ? 'tecnici' 
    : category === 'direttori' ? 'direttori'
    : category === 'discenti' ? 'discente'
    : category === 'ospiti' ? 'public'
    : category;

  const url = new URL(base);
  url.searchParams.set('view', viewParam);
  url.searchParams.set('id', person.id);
  url.searchParams.set('badge', badge);
  url.searchParams.set('qr', '1');
  url.searchParams.set('h', hash); // Version fingerprint

  return url.toString();
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
  }
): { person: AnyParticipant; category: ParticipantCategory; team?: Team } | null {
  if (!query || !query.trim()) return null;
  const q = query.trim();

  // Check if query is a URL with search params
  let targetId = q;
  let targetBadge = q.toUpperCase();

  try {
    if (q.includes('?') || q.startsWith('http')) {
      const url = new URL(q, 'https://dummy.med');
      const idParam = url.searchParams.get('id');
      const badgeParam = url.searchParams.get('badge');
      if (idParam) targetId = idParam;
      if (badgeParam) targetBadge = badgeParam.toUpperCase();
    }
  } catch (e) {
    // Not a valid URL, keep string as-is
  }

  const idLower = targetId.toLowerCase();
  const badgeUpper = targetBadge.toUpperCase();

  // 1. Search Discenti
  const disc = data.discenti.find(
    (d) =>
      d.id.toLowerCase() === idLower ||
      d.badgeCode?.toUpperCase() === badgeUpper ||
      d.name.toLowerCase() === idLower
  );
  if (disc) {
    const team = data.teams.find((t) => t.id === disc.teamId);
    return { person: disc, category: 'discenti', team };
  }

  // 2. Search Faculty
  const fac = data.faculty.find(
    (f) =>
      f.id.toLowerCase() === idLower ||
      f.badgeCode?.toUpperCase() === badgeUpper ||
      f.name.toLowerCase() === idLower
  );
  if (fac) {
    const team = data.teams.find((t) => t.id === fac.assignedTeamId);
    return { person: fac, category: 'faculty', team };
  }

  // 3. Search Technicians
  const tech = data.technicians.find(
    (t) =>
      t.id.toLowerCase() === idLower ||
      t.badgeCode?.toUpperCase() === badgeUpper ||
      t.name.toLowerCase() === idLower
  );
  if (tech) {
    return { person: tech, category: 'tecnici' };
  }

  // 4. Search Directors
  const dir = data.directors.find(
    (d) =>
      d.id.toLowerCase() === idLower ||
      d.badgeCode?.toUpperCase() === badgeUpper ||
      d.name.toLowerCase() === idLower
  );
  if (dir) {
    return { person: dir, category: 'direttori' };
  }

  // 5. Search Regia Staff
  const reg = data.regiaStaff.find(
    (r) =>
      r.id.toLowerCase() === idLower ||
      r.badgeCode?.toUpperCase() === badgeUpper ||
      r.name.toLowerCase() === idLower
  );
  if (reg) {
    return { person: reg, category: 'regia' };
  }

  // 6. Search Guests
  const guest = data.guests.find(
    (g) =>
      g.id.toLowerCase() === idLower ||
      g.badgeCode?.toUpperCase() === badgeUpper ||
      g.name.toLowerCase() === idLower
  );
  if (guest) {
    return { person: guest, category: 'ospiti' };
  }

  return null;
}
