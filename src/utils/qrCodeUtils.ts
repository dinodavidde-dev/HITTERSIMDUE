import QRCode from 'qrcode';
import { Discente, Faculty, Technician, Director, RegiaStaff, Guest, Team, MakeupArtist, CourseActor } from '../types';
import {
  INITIAL_DISCENTI,
  INITIAL_FACULTY,
  INITIAL_TECHNICIANS,
  INITIAL_DIRECTORS,
  INITIAL_REGIA_STAFF,
  INITIAL_GUESTS,
  INITIAL_MAKEUP_ARTISTS,
  INITIAL_ACTORS,
} from '../data/initialData';

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
 * Generates a deterministic pre-generated authorization token for a participant.
 */
export function generateParticipantAuthToken(person: AnyParticipant, category: ParticipantCategory = 'discente'): string {
  if (!person) return '';
  const hash = computeParticipantDataHash(person, category);
  const badge = (person as any).badgeCode || person.id || 'AUTH';
  return `HITTER-${category.toUpperCase().slice(0, 3)}-${badge.toUpperCase()}-${hash}`;
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
  const token = generateParticipantAuthToken(person, category);

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
  url.searchParams.set('token', token);
  url.searchParams.set('auth_token', token);
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

export interface ParticipantAuthVerificationResult {
  isAuthorized: boolean;
  authStatus: 'authorized' | 'unauthorized';
  participant: AnyParticipant | null;
  category: ParticipantCategory | null;
  token: string | null;
  badgeCode: string | null;
  source: 'url_token' | 'url_hash' | 'url_badge_qr' | 'session_storage' | 'none';
}

/**
 * Verifies if the given URL or search query contains a valid pre-generated authorization token,
 * data hash fingerprint, or QR parameters matching an official course participant.
 * If verified, authorizes the session and prevents any redirect to Google login.
 */
export function verifyParticipantAuthToken(
  urlOrSearch?: string,
  customData?: {
    discenti?: Discente[];
    faculty?: Faculty[];
    technicians?: Technician[];
    directors?: Director[];
    regiaStaff?: RegiaStaff[];
    guests?: Guest[];
    makeupArtists?: MakeupArtist[];
    actors?: CourseActor[];
  }
): ParticipantAuthVerificationResult {
  let searchStr = '';
  const currentHref = typeof window !== 'undefined' ? window.location.href : 'SSR';

  try {
    if (typeof urlOrSearch === 'string' && urlOrSearch.trim().length > 0) {
      if (urlOrSearch.includes('?')) {
        searchStr = urlOrSearch.substring(urlOrSearch.indexOf('?'));
      } else if (urlOrSearch.startsWith('&')) {
        searchStr = `?${urlOrSearch.substring(1)}`;
      } else if (urlOrSearch.includes('=')) {
        searchStr = urlOrSearch.startsWith('?') ? urlOrSearch : `?${urlOrSearch}`;
      } else {
        searchStr = urlOrSearch;
      }
    }

    // Fallback: if searchStr is empty or just '?', inspect window.location
    if ((!searchStr || searchStr === '?') && typeof window !== 'undefined') {
      if (window.location.search && window.location.search.length > 1) {
        searchStr = window.location.search;
      } else if (window.location.hash && window.location.hash.includes('?')) {
        searchStr = window.location.hash.substring(window.location.hash.indexOf('?'));
      } else if (window.location.href && window.location.href.includes('?')) {
        searchStr = window.location.href.substring(window.location.href.indexOf('?'));
      }
    }
  } catch (parseErr) {
    console.error('[QR_AUTH_VERIFY] ⚠️ Errore critico durante la risoluzione della stringa URL/Search:', parseErr);
  }

  // Diagnostic Log 1: Input interception
  console.log('[QR_AUTH_VERIFY] Intercettazione parametri URL:', {
    parametroRicevuto: urlOrSearch,
    stringaQueryRisolta: searchStr,
    urlCompleto: currentHref,
  });

  if (!searchStr || searchStr === '?') {
    console.log('[QR_AUTH_VERIFY] Nessun parametro di autenticazione o token rilevato nell\'URL.');
    return {
      isAuthorized: false,
      authStatus: 'unauthorized',
      participant: null,
      category: null,
      token: null,
      badgeCode: null,
      source: 'none',
    };
  }

  let tokenParam = '';
  let hashParam = '';
  let idParam = '';
  let badgeParam = '';
  let discenteParam = '';
  let facultyParam = '';
  let techParam = '';
  let dirParam = '';
  let regParam = '';
  let trucParam = '';
  let actParam = '';
  let isQrParam = false;
  let candidateKeys: string[] = [];

  try {
    const params = new URLSearchParams(searchStr);
    tokenParam = (params.get('token') || params.get('auth_token') || params.get('authToken') || params.get('t') || params.get('auth') || '').trim();
    hashParam = (params.get('h') || params.get('hash') || '').trim();
    idParam = (params.get('id') || '').trim();
    badgeParam = (params.get('badge') || params.get('matricola') || params.get('code') || '').trim();
    discenteParam = (params.get('discente') || params.get('student') || '').trim();
    facultyParam = (params.get('faculty') || params.get('tutor') || '').trim();
    techParam = (params.get('tecnico') || params.get('tech') || params.get('technician') || '').trim();
    dirParam = (params.get('direttore') || params.get('director') || '').trim();
    regParam = (params.get('regia') || '').trim();
    trucParam = (params.get('truccatore') || '').trim();
    actParam = (params.get('attore') || '').trim();
    isQrParam = params.get('qr') === '1' || params.get('qr') === 'true';

    candidateKeys = [
      idParam,
      badgeParam,
      discenteParam,
      facultyParam,
      techParam,
      dirParam,
      regParam,
      trucParam,
      actParam,
      params.get('ospite') || '',
    ].filter(Boolean);

    console.log('[QR_AUTH_VERIFY] Parametri estratti con successo:', {
      token: tokenParam || '(assente)',
      hash: hashParam || '(assente)',
      badge: badgeParam || '(assente)',
      id: idParam || '(assente)',
      isQr: isQrParam,
      candidateKeys,
    });
  } catch (paramErr) {
    console.error('[QR_AUTH_VERIFY] ⚠️ Errore durante il parsing con URLSearchParams:', paramErr);
  }

  const allDiscenti = customData?.discenti || INITIAL_DISCENTI;
  const allFaculty = customData?.faculty || INITIAL_FACULTY;
  const allTech = customData?.technicians || INITIAL_TECHNICIANS;
  const allDirectors = customData?.directors || INITIAL_DIRECTORS;
  const allRegia = customData?.regiaStaff || INITIAL_REGIA_STAFF;
  const allGuests = customData?.guests || INITIAL_GUESTS;
  const allMakeup = customData?.makeupArtists || INITIAL_MAKEUP_ARTISTS;
  const allActors = customData?.actors || INITIAL_ACTORS;

  const testParticipant = (person: AnyParticipant, cat: ParticipantCategory): ParticipantAuthVerificationResult | null => {
    try {
      const expectedHash = computeParticipantDataHash(person, cat);
      const expectedToken = generateParticipantAuthToken(person, cat);
      const badge = (person as any).badgeCode || person.id || '';

      // 1. Direct Pre-generated Token match (e.g. ?auth_token=HITTER-DIS-DISC-01-XXXX)
      if (tokenParam && (tokenParam === expectedToken || tokenParam.toUpperCase() === expectedHash.toUpperCase() || tokenParam.includes(expectedHash))) {
        console.log(`[QR_AUTH_VERIFY] ✅ TOKEN VALIDO TROVATO (Token Match): ${badge} (${person.name}) - Categoria: ${cat}`);
        return {
          isAuthorized: true,
          authStatus: 'authorized',
          participant: person,
          category: cat,
          token: tokenParam,
          badgeCode: badge,
          source: 'url_token',
        };
      }

      // 2. Data Hash Fingerprint match (present in printed QR codes: &h=...)
      if (hashParam && hashParam.toUpperCase() === expectedHash.toUpperCase()) {
        console.log(`[QR_AUTH_VERIFY] ✅ HASH QRCODE VALIDO (Hash Match): ${badge} (${person.name}) - Categoria: ${cat}`);
        return {
          isAuthorized: true,
          authStatus: 'authorized',
          participant: person,
          category: cat,
          token: hashParam,
          badgeCode: badge,
          source: 'url_hash',
        };
      }

      // 3. ID / Badge match via QR code (supports all physical badges with &qr=1 or personal parameters)
      for (const key of candidateKeys) {
        if (isParticipantMatch(person, key)) {
          console.log(`[QR_AUTH_VERIFY] ✅ BADGE / MATRICOLA VALIDO (Badge Match): ${badge} (${person.name}) - Categoria: ${cat} [qr=${isQrParam}]`);
          return {
            isAuthorized: true,
            authStatus: 'authorized',
            participant: person,
            category: cat,
            token: expectedToken,
            badgeCode: badge,
            source: isQrParam ? 'url_badge_qr' : 'url_token',
          };
        }
      }
    } catch (testErr) {
      console.warn(`[QR_AUTH_VERIFY] Errore durante il test di autorizzazione per partecipante ${person.id}:`, testErr);
    }

    return null;
  };

  // Check all participant registries
  for (const d of allDiscenti) {
    const res = testParticipant(d, 'discenti');
    if (res) return res;
  }
  for (const f of allFaculty) {
    const res = testParticipant(f, 'faculty');
    if (res) return res;
  }
  for (const t of allTech) {
    const res = testParticipant(t, 'tecnici');
    if (res) return res;
  }
  for (const dir of allDirectors) {
    const res = testParticipant(dir, 'direttori');
    if (res) return res;
  }
  for (const r of allRegia) {
    const res = testParticipant(r, 'regia');
    if (res) return res;
  }
  for (const a of allActors) {
    const res = testParticipant(a, 'attori');
    if (res) return res;
  }
  for (const m of allMakeup) {
    const res = testParticipant(m, 'truccatori');
    if (res) return res;
  }
  for (const g of allGuests) {
    const res = testParticipant(g, 'ospiti');
    if (res) return res;
  }

  console.log('[QR_AUTH_VERIFY] ❌ Nessuna corrispondenza valida trovata nei registri partecipanti. authStatus: unauthorized.');
  return {
    isAuthorized: false,
    authStatus: 'unauthorized',
    participant: null,
    category: null,
    token: null,
    badgeCode: null,
    source: 'none',
  };
}

// Aliases for seamless integration
export const checkUrlAuthorizationToken = verifyParticipantAuthToken;
export const verifyUrlParticipantAuthToken = verifyParticipantAuthToken;

/**
 * Immediate Pre-Mount URL Interceptor & Authorization Setter.
 * Synchronously executes upon module evaluation before any React component mounts.
 * Intercepts URL search, hash fragments, or existing local session data to guarantee that
 * authStatus: 'authorized' is established in sessionStorage and localStorage before App renders.
 */
export function ensurePreMountAuthorization(): ParticipantAuthVerificationResult {
  if (typeof window === 'undefined') {
    return {
      isAuthorized: false,
      authStatus: 'unauthorized',
      participant: null,
      category: null,
      token: null,
      badgeCode: null,
      source: 'none',
    };
  }

  try {
    const rawSearch = window.location.search;
    const rawHash = window.location.hash;
    const rawHref = window.location.href;
    const storedStatus = sessionStorage.getItem('trauma_auth_status') || localStorage.getItem('trauma_auth_status');
    const storedBadge = localStorage.getItem('trauma_authorized_badge');

    console.log('[QR_AUTH_PRE_MOUNT] 🔍 Inizio intercettazione pre-mount:', {
      href: rawHref,
      search: rawSearch,
      hash: rawHash,
      storedStatus,
      storedBadge,
    });

    const result = verifyParticipantAuthToken();
    if (result.isAuthorized) {
      console.log(`[QR_AUTH_PRE_MOUNT] ✅ AUTORIZZAZIONE PRE-MOUNT RIUSCITA: ${result.badgeCode} (${result.category}) [Fonte: ${result.source}]`);
      try {
        sessionStorage.setItem('trauma_auth_status', 'authorized');
        localStorage.setItem('trauma_auth_status', 'authorized');
        if (result.badgeCode) {
          localStorage.setItem('trauma_authorized_badge', result.badgeCode);
        }
        if (result.token) {
          sessionStorage.setItem('trauma_auth_token', result.token);
        }
        if (result.participant) {
          sessionStorage.setItem('trauma_authorized_participant', JSON.stringify(result.participant));
          localStorage.setItem('trauma_authorized_participant', JSON.stringify(result.participant));
        }
      } catch (storageErr) {
        console.warn('[QR_AUTH_PRE_MOUNT] Impossibile scrivere su storage:', storageErr);
      }
      (window as any).__TRAUMA_PRE_MOUNT_AUTH__ = result;
      return result;
    } else if (storedStatus === 'authorized') {
      console.log('[QR_AUTH_PRE_MOUNT] ✅ Sessione precedentemente autorizzata rilevata in storage locale.');
      const res: ParticipantAuthVerificationResult = {
        isAuthorized: true,
        authStatus: 'authorized',
        participant: null,
        category: null,
        token: sessionStorage.getItem('trauma_auth_token') || null,
        badgeCode: storedBadge,
        source: 'session_storage',
      };
      (window as any).__TRAUMA_PRE_MOUNT_AUTH__ = res;
      return res;
    } else {
      console.log('[QR_AUTH_PRE_MOUNT] ℹ️ Nessun token o sessione valida rilevata in fase pre-mount.');
    }
  } catch (err) {
    console.error('[QR_AUTH_PRE_MOUNT] ⚠️ Errore critico durante intercettazione pre-mount:', err);
  }

  const unauthorizedResult: ParticipantAuthVerificationResult = {
    isAuthorized: false,
    authStatus: 'unauthorized',
    participant: null,
    category: null,
    token: null,
    badgeCode: null,
    source: 'none',
  };
  if (typeof window !== 'undefined') {
    (window as any).__TRAUMA_PRE_MOUNT_AUTH__ = unauthorizedResult;
  }
  return unauthorizedResult;
}

// Auto-execute immediately at script execution before React mounts
if (typeof window !== 'undefined') {
  ensurePreMountAuthorization();
}


