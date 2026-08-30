import {
  CourseDay,
  Discente,
  Director,
  Faculty,
  GroupType,
  Guest,
  NightScenarioCase,
  SimulatorPatient,
  Team,
  Technician,
  TimelineSlot,
} from '../types';

export const INITIAL_DIRECTORS: Director[] = [
  {
    id: 'dir-1',
    name: 'Dott. Marco Valenti',
    title: 'Direttore del Corso & Anestesista Rianimatore',
    nationality: 'Italiana',
    organization: 'Ospedale Niguarda Trauma Center Milano',
    phone: '+39 340 1122334',
    email: 'm.valenti@traumacourse.org',
    badgeCode: 'DIR-01',
    isMaster: true,
    notes: 'Coordinamento generale, supervisione didattica e debriefing plenari',
  },
  {
    id: 'dir-2',
    name: 'Dott.ssa Elena Moretti',
    title: 'Co-Direttrice del Corso & Chirurgo Trauma Center',
    nationality: 'Italiana',
    organization: 'AOU Careggi Trauma Center Firenze',
    phone: '+39 348 9988776',
    email: 'e.moretti@traumacourse.org',
    badgeCode: 'DIR-02',
    notes: 'Responsabile scenari chirurgici e coordinamento faculty',
  },
];

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'tech-1',
    name: 'Silvia Rossi (Lead Moulage & Protesi)',
    assignedStations: ['Postazione 1', 'Postazione 4', 'Postazione 7', 'Postazione 10', 'Postazione 13', 'Postazione 16', 'Postazione 19', 'Postazione 22'],
    specialty: 'Moulage avanzato, ferite balistiche, protesi cricotirotomia',
    nationality: 'Italiana',
    organization: 'Centro Simulazione Medica Avanzata',
    phone: '+39 333 1234567',
    email: 'silvia.moulage@simcenter.it',
    badgeCode: 'TECH-01',
    notes: 'Responsabile master lab silicone, tessuti molli e moulage sangue pulsante',
  },
  {
    id: 'tech-2',
    name: 'Roberto Bianchi',
    assignedStations: ['Postazione 2', 'Postazione 5', 'Postazione 8', 'Postazione 11', 'Postazione 14', 'Postazione 17', 'Postazione 20', 'Postazione 23'],
    specialty: 'Simulatori torace morbido con tessuti biologici (organi maiale), toracotomia',
    nationality: 'Italiana',
    organization: 'Laboratorio Wet-Lab & Biomodelli',
    phone: '+39 334 2345678',
    email: 'r.bianchi@wetlab.it',
    badgeCode: 'TECH-02',
    notes: 'Preparazione cuori/polmoni suini e clamping ilo polmonare',
  },
  {
    id: 'tech-3',
    name: 'Alessandro Conti',
    assignedStations: ['Postazione 3', 'Postazione 6', 'Postazione 9', 'Postazione 12', 'Postazione 15', 'Postazione 18', 'Postazione 21', 'Postazione 24'],
    specialty: 'Simulatori REBOA endovascolari, controllo emorragie arteriose da moncone',
    nationality: 'Italiana',
    organization: 'Vascular Sim Technologies',
    phone: '+39 335 3456789',
    email: 'a.conti@vasculartraining.it',
    badgeCode: 'TECH-03',
    notes: 'Gestione circuiti idraulici pulsanti ad alta pressione',
  },
  {
    id: 'tech-4',
    name: 'Matteo Ferrari',
    assignedStations: ['Workshop TCCC / Skills Lab 1'],
    specialty: 'Gestione materiali TCCC, barelle di estrazione, manichini da trascinamento',
    nationality: 'Italiana',
    organization: 'Tactical Rescue Sim',
    phone: '+39 336 4567890',
    email: 'm.ferrari@tacticalrescue.it',
    badgeCode: 'TECH-04',
    notes: 'Logistica outdoor, cariche sonore a salve ed estrazione veicolare',
  },
  {
    id: 'tech-5',
    name: 'Giulia Barbieri',
    assignedStations: ['Skills Lab 2 / MacGyver Medicine'],
    specialty: 'Materiali di improvvisazione, steccaggi da campo, presidi ventilatori',
    nationality: 'Italiana',
    organization: 'Wilderness & Austere Medicine Institute',
    phone: '+39 337 5678901',
    email: 'g.barbieri@austere-med.it',
    badgeCode: 'TECH-05',
    notes: 'Kit improvvisazione e materiali non convenzionali',
  },
  {
    id: 'tech-6',
    name: 'Davide Esposito',
    assignedStations: ['Regia Audio/Video & Scenario Notturno'],
    specialty: 'Effetti sonori, fumi scenici, illuminazione tattica notturna, briefing video',
    nationality: 'Italiana',
    organization: 'AudioVideo Sim Live',
    phone: '+39 338 6789012',
    email: 'd.esposito@audiovideosim.it',
    badgeCode: 'TECH-06',
    notes: 'Regia telecamere debriefing e pirotecnica scenica notturna',
  },
];

export const INITIAL_FACULTY: Faculty[] = [
  {
    id: 'fac-1',
    name: 'Dott. Andrea Galli',
    title: 'Faculty Squadra 1',
    specialty: 'Emergenza Territoriale 118 / TCCC Master Instructor',
    nationality: 'Italiana',
    assignedTeamId: 1,
    phone: '+39 347 0000001',
    email: 'a.galli@traumacourse.org',
    organization: 'AAT 118 Milano',
    badgeCode: 'FAC-01',
  },
  {
    id: 'fac-2',
    name: 'Dott.ssa Sara Villa',
    title: 'Faculty Squadra 2',
    specialty: 'Chirurgia Generale d\'Urgenza',
    nationality: 'Italiana',
    assignedTeamId: 2,
    phone: '+39 347 0000002',
    email: 's.villa@traumacourse.org',
    organization: 'Ospedale San Gerardo Monza',
    badgeCode: 'FAC-02',
  },
  {
    id: 'fac-3',
    name: 'Dott. Luca Martini',
    title: 'Faculty Squadra 3',
    specialty: 'Anestesia e Rianimazione Shock Room',
    nationality: 'Italiana',
    assignedTeamId: 3,
    phone: '+39 347 0000003',
    email: 'l.martini@traumacourse.org',
    organization: 'AOU Pisana',
    badgeCode: 'FAC-03',
  },
  {
    id: 'fac-4',
    name: 'Dott.ssa Chiara Colombo',
    title: 'Faculty Squadra 4',
    specialty: 'Medicina d\'Emergenza-Urgenza',
    nationality: 'Italiana',
    assignedTeamId: 4,
    phone: '+39 347 0000004',
    email: 'c.colombo@traumacourse.org',
    organization: 'Ospedale Maggiore Bologna',
    badgeCode: 'FAC-04',
  },
  {
    id: 'fac-5',
    name: 'Dott. Fabio De Luca',
    title: 'Faculty Squadra 5',
    specialty: 'Chirurgia Toracica e Traumatologia',
    nationality: 'Italiana',
    assignedTeamId: 5,
    phone: '+39 347 0000005',
    email: 'f.deluca@traumacourse.org',
    organization: 'Policlinico Umberto I Roma',
    badgeCode: 'FAC-05',
  },
  {
    id: 'fac-6',
    name: 'Dott.ssa Francesca Greco',
    title: 'Faculty Squadra 6',
    specialty: 'Rianimazione Trauma Center',
    nationality: 'Italiana',
    assignedTeamId: 6,
    phone: '+39 347 0000006',
    email: 'f.greco@traumacourse.org',
    organization: 'Ospedale Cardarelli Napoli',
    badgeCode: 'FAC-06',
  },
  {
    id: 'fac-7',
    name: 'Dott. Gabriele Rinaldi',
    title: 'Faculty Squadra 7',
    specialty: 'Elisoccorso HEMS / Soccorso Tattico',
    nationality: 'Italiana',
    assignedTeamId: 7,
    phone: '+39 347 0000007',
    email: 'g.rinaldi@traumacourse.org',
    organization: 'Elisoccorso Sondrio 118',
    badgeCode: 'FAC-07',
  },
  {
    id: 'fac-8',
    name: 'Dott.ssa Valentina Serra',
    title: 'Faculty Squadra 8',
    specialty: 'Medicina d\'Urgenza & Ecografia Point-of-Care FAST',
    nationality: 'Italiana',
    assignedTeamId: 8,
    phone: '+39 347 0000008',
    email: 'v.serra@traumacourse.org',
    organization: 'AOU Sassari',
    badgeCode: 'FAC-08',
  },
  {
    id: 'fac-9',
    name: 'Dott. Tommaso Barone',
    title: 'Faculty Squadra 9',
    specialty: 'Chirurgia Vascolare e Damage Control',
    nationality: 'Italiana',
    assignedTeamId: 9,
    phone: '+39 347 0000009',
    email: 't.barone@traumacourse.org',
    organization: 'Ospedale Bufalini Cesena',
    badgeCode: 'FAC-09',
  },
  {
    id: 'fac-10',
    name: 'Dott.ssa Martina Ricci',
    title: 'Faculty Squadra 10',
    specialty: 'Terapia Intensiva e Gestione Vie Aeree Difficili',
    nationality: 'Italiana',
    assignedTeamId: 10,
    phone: '+39 347 0000010',
    email: 'm.ricci@traumacourse.org',
    organization: 'Spedali Civili Brescia',
    badgeCode: 'FAC-10',
  },
  {
    id: 'fac-11',
    name: 'Dott. Simone Marchetti',
    title: 'Faculty Squadra 11',
    specialty: 'Medicina delle Catastrofi & Maxiemergenze',
    nationality: 'Italiana',
    assignedTeamId: 11,
    phone: '+39 347 0000011',
    email: 's.marchetti@traumacourse.org',
    organization: 'CROSS Pistoia Protezione Civile',
    badgeCode: 'FAC-11',
  },
  {
    id: 'fac-12',
    name: 'Dott.ssa Beatrice Monti',
    title: 'Faculty Squadra 12',
    specialty: 'Traumatologia Ortopedica d\'Urgenza',
    nationality: 'Italiana',
    assignedTeamId: 12,
    phone: '+39 347 0000012',
    email: 'b.monti@traumacourse.org',
    organization: 'Istituto Ortopedico Rizzoli Bologna',
    badgeCode: 'FAC-12',
  },
];

export const INITIAL_GUESTS: Guest[] = [
  {
    id: 'guest-1',
    name: 'Col. Med. Dott. Hans Gruber',
    title: 'Auditor Medico NATO MilMed COE',
    organization: 'NATO Centre of Excellence for Military Medicine (Budapest)',
    nationality: 'Tedesca',
    assignedDays: [2, 3],
    phone: '+49 171 9988771',
    email: 'h.gruber@milmedcoe.nato.int',
    badgeCode: 'VIP-01',
    escortFaculty: 'Dott. Andrea Galli',
    notes: 'Valutazione conformità linee guida TCCC ed evacuazione tattica',
  },
  {
    id: 'guest-2',
    name: 'Dott.ssa Sophie Laurent',
    title: 'Delegato Internazionale Dipartimento Salute',
    organization: 'CICR / International Committee of the Red Cross (Ginevra)',
    nationality: 'Svizzera',
    assignedDays: [2, 3],
    phone: '+41 79 123 4567',
    email: 's.laurent@icrc.org',
    badgeCode: 'VIP-02',
    escortFaculty: 'Dott.ssa Elena Moretti',
    notes: 'Osservazione standard Damage Control Surgery in contesti austeri',
  },
  {
    id: 'guest-3',
    name: 'Prof. Dr. John Sterling',
    title: 'Visiting Professor in Tactical Trauma Surgery',
    organization: 'Royal London Hospital Major Trauma Centre (UK)',
    nationality: 'Britannica',
    assignedDays: [2, 3],
    phone: '+44 7700 900123',
    email: 'j.sterling@qmul.ac.uk',
    badgeCode: 'VIP-03',
    escortFaculty: 'Dott. Marco Valenti',
    notes: 'Guest lecturer per il debriefing serale su toracotomie di rianimazione',
  },
  {
    id: 'guest-4',
    name: 'Gen. B. Med. Dott. Vincenzo Romano',
    title: 'Ispettore Generale Sanità Militare Difesa',
    organization: 'Ispettorato Generale della Sanità Militare (Roma)',
    nationality: 'Italiana',
    assignedDays: [3],
    phone: '+39 06 4691 3344',
    email: 'v.romano@difesa.it',
    badgeCode: 'VIP-04',
    escortFaculty: 'Dott. Marco Valenti',
    notes: 'Presente per la maxiemergenza notturna e plenaria finale giorno 3',
  },
  {
    id: 'guest-5',
    name: 'Dott.ssa Maria Rodriguez',
    title: 'Coordinatrice Nazionale SAMUR-Protezione Civile Madrid',
    organization: 'SAMUR - Protección Civil (Spagna)',
    nationality: 'Spagnola',
    assignedDays: [2, 3],
    phone: '+34 612 345678',
    email: 'mrodriguez@madrid.es',
    badgeCode: 'VIP-05',
    escortFaculty: 'Dott. Simone Marchetti',
    notes: 'Interesse specifico sui protocolli di Handover SBAR e REBOA preospedaliero',
  },
];

export const INITIAL_TEAMS: Team[] = [
  { id: 1, name: 'ALPHA 1', groupId: 'A', facultyId: 'fac-1', color: '#dc2626', notes: 'Team leader specializzando anestesia' },
  { id: 2, name: 'ALPHA 2', groupId: 'A', facultyId: 'fac-2', color: '#ea580c', notes: 'Personale con esperienza 118' },
  { id: 3, name: 'ALPHA 3', groupId: 'A', facultyId: 'fac-3', color: '#d97706', notes: 'Infermieri area critica e chirurgo' },
  { id: 4, name: 'BRAVO 1', groupId: 'B', facultyId: 'fac-4', color: '#2563eb', notes: 'Equipe mista PS / Rianimazione' },
  { id: 5, name: 'BRAVO 2', groupId: 'B', facultyId: 'fac-5', color: '#0284c7', notes: 'Equipe HEMS e PS' },
  { id: 6, name: 'BRAVO 3', groupId: 'B', facultyId: 'fac-6', color: '#0891b2', notes: 'Medici urgenza e infermieri' },
  { id: 7, name: 'CHARLIE 1', groupId: 'C', facultyId: 'fac-7', color: '#16a34a', notes: 'Discenti orientamento preospedaliero' },
  { id: 8, name: 'CHARLIE 2', groupId: 'C', facultyId: 'fac-8', color: '#059669', notes: 'Personale Shock Room' },
  { id: 9, name: 'CHARLIE 3', groupId: 'C', facultyId: 'fac-9', color: '#0d9488', notes: 'Team bilanciato trauma vascolare' },
  { id: 10, name: 'DELTA 1', groupId: 'D', facultyId: 'fac-10', color: '#9333ea', notes: 'Anestesisti e chirurghi' },
  { id: 11, name: 'DELTA 2', groupId: 'D', facultyId: 'fac-11', color: '#c026d3', notes: 'Medici emergenza e infermieri 118' },
  { id: 12, name: 'DELTA 3', groupId: 'D', facultyId: 'fac-12', color: '#db2777', notes: 'Equipe multidisciplinare' },
];

// Generate 60 discenti (5 per team)
const FIRST_NAMES = [
  'Alessandro', 'Lorenzo', 'Mattia', 'Leonardo', 'Francesco', 'Gabriele', 'Davide', 'Riccardo', 'Tommaso', 'Federico',
  'Giulia', 'Sofia', 'Aurora', 'Alice', 'Emma', 'Giorgia', 'Martina', 'Chiara', 'Beatrice', 'Greta',
  'Marco', 'Andrea', 'Luca', 'Matteo', 'Simone', 'Giovanni', 'Filippo', 'Pietro', 'Samuele', 'Christian',
  'Vittoria', 'Ginevra', 'Sara', 'Elena', 'Noemi', 'Alessia', 'Camilla', 'Ludovica', 'Gaia', 'Elisa',
  'Antonio', 'Giuseppe', 'Michele', 'Daniele', 'Stefano', 'Edoardo', 'Nicola', 'Manuel', 'Vincenzo', 'Fabio',
  'Anna', 'Valeria', 'Silvia', 'Ilaria', 'Serena', 'Roberta', 'Claudia', 'Arianna', 'Valentina', 'Marta'
];

const LAST_NAMES = [
  'Rossi', 'Ferrari', 'Russo', 'Bianchi', 'Romano', 'Gallo', 'Costa', 'Fontana', 'Conti', 'Esposito',
  'Ricci', 'Bruno', 'De Luca', 'Moretti', 'Marino', 'Greco', 'Barbieri', 'Lombardi', 'Giordano', 'Cassano',
  'Colombo', 'Mancini', 'Longo', 'Leone', 'Martinelli', 'Marchetti', 'Martini', 'Galli', 'Gatti', 'Mariani',
  'Ferrara', 'Santoro', 'Marini', 'Rizzo', 'Conte', 'Serra', 'Farina', 'De Angelis', 'Caruso', 'Gentile',
  'Ferraro', 'Monti', 'Testa', 'Grassi', 'Pellegrini', 'Palumbo', 'Sanna', 'De Rosa', 'D\'Angelo', 'Parisi',
  'Villa', 'Cattaneo', 'Piras', 'Bellini', 'Sala', 'Bernardi', 'Coppola', 'Riva', 'Poli', 'Donati'
];

const ROLES_POOL = [
  'Team Leader / Medico Emergenza',
  'Airway Specialist / Anestesista',
  'Circulation & Access Specialist / Infermiere',
  'Procedural Doctor / Chirurgo',
  'Scribe & Timekeeper / Infermiere Area Critica'
];

const NATIONALITIES_POOL = [
  'Italiana', 'Italiana', 'Italiana', 'Italiana', 'Italiana',
  'Italiana', 'Italiana', 'Svizzera', 'Italiana', 'Spagnola',
  'Italiana', 'Italiana', 'Italiana', 'Francese', 'Italiana',
  'Italiana', 'Tedesca', 'Italiana', 'Italiana', 'Austriaca',
  'Italiana', 'Italiana', 'Belga', 'Italiana', 'Italiana',
];

const HOSPITALS_POOL = [
  'AOU Maggiore della Carità Novara',
  'ASST Papa Giovanni XXIII Bergamo',
  'Ospedale Civico Palermo - DEA II',
  'AOU San Martino Genova - Trauma Center',
  'Ospedale Mauriziano Torino',
  'AOU Policlinico Modena',
  'Ospedale dell\'Angelo Mestre - AULSS 3',
  'AOU Senese Le Scotte Siena',
  'Ospedale Santa Chiara Trento 118',
  'Ospedale Cannizzaro Catania Trauma Center',
  'HUG Hôpitaux Universitaires de Genève',
  'Hospital Universitario La Paz Madrid',
];

export const INITIAL_DISCENTI: Discente[] = Array.from({ length: 60 }).map((_, idx) => {
  const teamIndex = Math.floor(idx / 5); // 0 to 11
  const teamId = teamIndex + 1;
  const roleInTeam = ROLES_POOL[idx % 5];
  const name = `${FIRST_NAMES[idx % FIRST_NAMES.length]} ${LAST_NAMES[idx % LAST_NAMES.length]}`;
  const nationality = NATIONALITIES_POOL[idx % NATIONALITIES_POOL.length];
  const organization = HOSPITALS_POOL[idx % HOSPITALS_POOL.length];
  const emailName = name.toLowerCase().replace(/\s+/g, '.').replace(/[']/g, '');

  return {
    id: `disc-${idx + 1}`,
    name,
    role: roleInTeam,
    teamId,
    nationality,
    phone: `+39 392 ${String(1000000 + idx).padStart(7, '0')}`,
    email: `${emailName}@emergency-trauma.eu`,
    experience: idx % 2 === 0 ? 'Ospedaliero DEA II livello / Shock Room' : 'Preospedaliero 118 HEMS & Automedica',
    organization,
    badgeCode: `DISC-${String(idx + 1).padStart(2, '0')}`,
  };
});

// Full 24 Simulator Patients according to Scenari simulatori - foglio 1
export const INITIAL_SIMULATOR_PATIENTS: SimulatorPatient[] = [
  // --- DAY 2 MATTINA (Pazienti 1-6) ---
  {
    id: 1,
    day: 2,
    period: 'mattina',
    scenarioCode: 'Scenario 6 (TCCC)',
    groupExtraAssigned: 'A',
    groupIntraAssigned: 'B',
    teamExtraAssigned: 1,
    teamIntraAssigned: 4,
    lesioni: [
      'Arma da fuoco maxillo-facciale',
      'Ferita arma da fuoco alla schiena (sanguinante)',
      'Ferita ascellare sinistra con emorragia compressibile/giunzionale',
      'Emotorace sinistro massivo'
    ],
    procedureExtra: [
      'Cricotirotomia chirurgica (CRIC)',
      'Decompressiva con ago (ND)'
    ],
    procedureIntra: [
      'Toracostomia con posizionamento drenaggio toracico',
      'Resuscitative Thoracotomy / Resus Thoraco'
    ],
    moulageProtesi: 'Protesi CRICO sanguina ed espande, ferita arma da fuoco schiena sanguinante con pompa, ferita ascellare sinistra',
    simulatori: 'Simulatore torace morbido + simulatore torace fisso',
    attoriCount: 2,
    attoreDettagli: 'Attore 1 (paziente cosciente agitato iniziale con protesi), Attore 2 (ferito secondario o supporto)',
    techNotes: 'Controllare serbatoio sangue finto e raccordo tubo cricotirotomia prima della partenza',
    readinessStatus: 'ready',
    techChecklist: { preDone: true, intraDone: false, postDone: false, verifiedAt: '08:35' }
  },
  {
    id: 2,
    day: 2,
    period: 'mattina',
    scenarioCode: 'Scenario 1 (TCCC)',
    groupExtraAssigned: 'A',
    groupIntraAssigned: 'B',
    teamExtraAssigned: 2,
    teamIntraAssigned: 5,
    lesioni: [
      'Frattura esposta avambraccio con sanguinamento a getto',
      'Ferita da arma da fuoco al torace con pneumotorace aperto'
    ],
    procedureExtra: [
      'Drenaggio torace Finger (Toracostomia a dito / Decompressione)',
      'Tourniquet TQ arto superiore + medicazione toracica valvola'
    ],
    procedureIntra: [
      'Resus Thoracotomy',
      'Fissazione e controllo emorragia vascolare avambraccio'
    ],
    moulageProtesi: 'Frattura esposta avambraccio con osso sporgente, foro proiettile torace con bolle d\'aria',
    simulatori: 'Torace morbido con organi di maiale per toracotomia di rianimazione',
    attoriCount: 1,
    attoreDettagli: 'Attore con protesi braccio e petto collegato al circuito fluidi',
    techNotes: 'Verificare integrità organi biologici e pervietà linea di clampaggio aortico',
    readinessStatus: 'critical',
    criticalityNotes: 'Pompa sangue pulsante su protesi avambraccio con calo di pressione (40 mmHg invece di 90 mmHg). Tecnico Roberto Bianchi allertato per ricalibrazione circuito idraulico.',
    criticalityReportedBy: 'Roberto Bianchi (TECH-02)',
    criticalityTimestamp: '08:42',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 3,
    day: 2,
    period: 'mattina',
    scenarioCode: 'Scenario 11 (TCCC)',
    groupExtraAssigned: 'A',
    groupIntraAssigned: 'B',
    teamExtraAssigned: 3,
    teamIntraAssigned: 6,
    lesioni: [
      'Pneumotorace iperteso (PNX) destro con shock ostruttivo',
      'Amputazione traumatica gamba destra sub-totale da deflagrazione'
    ],
    procedureExtra: [
      'Drenaggio con ago (Decompressione toracica d\'emergenza)',
      'Amputazione di emergenza / applicazione Tourniquet giunzionale TQ'
    ],
    procedureIntra: [
      'Drenaggio thorax definitivo',
      'Posizionamento catetere REBOA (Zone 1 / Zone 3) per emorragia da amputazione'
    ],
    moulageProtesi: 'Moncone emorragico gamba destra, enfisema sottocutaneo emitorace dx',
    simulatori: 'Torace morbido + simulatore REBOA endovascolare + moncone arto inferiore',
    attoriCount: 1,
    attoreDettagli: 'Attore con gamba piegata e protesi moncone sanguinante',
    techNotes: 'Pressione linea arteriosa femorale per REBOA calibrata a 60 mmHg',
    readinessStatus: 'ready',
    techChecklist: { preDone: true, intraDone: false, postDone: false, verifiedAt: '08:40' }
  },
  {
    id: 4,
    day: 2,
    period: 'mattina',
    scenarioCode: 'Scenario 6 (TCCC) - Replica Postazione 4',
    groupExtraAssigned: 'C',
    groupIntraAssigned: 'D',
    teamExtraAssigned: 7,
    teamIntraAssigned: 10,
    lesioni: [
      'Ferita arma da fuoco maxillo-facciale e ostruzione acuta vie aeree',
      'Emotorace sx'
    ],
    procedureExtra: [
      'Cricotirotomia chirurgica (CRIC)',
      'Decompressione con ago'
    ],
    procedureIntra: [
      'Drenaggio toracico e gestione avanzata vie aeree'
    ],
    moulageProtesi: 'CRICO sanguina e si espande, trucco maxillo-facciale',
    simulatori: 'Torace morbido con laringe per cricotirotomia',
    attoriCount: 1,
    attoreDettagli: 'Attore simulator con maschera trauma facciale',
    techNotes: 'Disponibilità 3 cannule tracheostomiche e bisturi 10/11',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 5,
    day: 2,
    period: 'mattina',
    scenarioCode: 'Scenario 1 (TCCC) - Replica Postazione 5',
    groupExtraAssigned: 'C',
    groupIntraAssigned: 'D',
    teamExtraAssigned: 8,
    teamIntraAssigned: 11,
    lesioni: [
      'Arma da fuoco maxillo',
      'Trauma toracico con emotorace'
    ],
    procedureExtra: [
      'Drenaggio torace finger',
      'Controllo emorragico'
    ],
    procedureIntra: [
      'Resus Thoraco'
    ],
    moulageProtesi: 'Arma da fuoco maxillo sanguinante',
    simulatori: 'Torace fisso con predisposizione toracostomia',
    attoriCount: 1,
    attoreDettagli: 'Attore con sanguinamento cavo orale',
    techNotes: 'Aspiratore chirurgico da campo carico',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 6,
    day: 2,
    period: 'mattina',
    scenarioCode: 'Scenario 11 (TCCC) - Replica Postazione 6',
    groupExtraAssigned: 'C',
    groupIntraAssigned: 'D',
    teamExtraAssigned: 9,
    teamIntraAssigned: 12,
    lesioni: [
      'Frattura esposta avambraccio',
      'PNX iperteso'
    ],
    procedureExtra: [
      'Drenaggio ago',
      'Amputazione emergenza / TQ'
    ],
    procedureIntra: [
      'Drenaggio toracico definitivo',
      'REBOA'
    ],
    moulageProtesi: 'Frattura esposta avambraccio con emorragia pulsante',
    simulatori: 'Torace morbido',
    attoriCount: 1,
    attoreDettagli: 'Attore con moncone e perdita di coscienza simulata',
    techNotes: 'Ricarica sacche sangue 2000 ml per postazione',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },

  // --- DAY 2 POMERIGGIO (Pazienti 7-12) ---
  {
    id: 7,
    day: 2,
    period: 'pomeriggio',
    scenarioCode: 'Scenario 16 (TCCC)',
    groupExtraAssigned: 'B',
    groupIntraAssigned: 'A',
    teamExtraAssigned: 4,
    teamIntraAssigned: 1,
    lesioni: [
      'Ferita arma da fuoco addome con eviscerazione e shock ipovolemico',
      'Frattura esposta con emorragia massiva',
      'Ferita arma da fuoco alla coscia',
      'Pneumotorace (PNX)'
    ],
    procedureExtra: [
      'Decompressione con ago toracica',
      'Medicazione compressiva coscia ed eviscerazione umida'
    ],
    procedureIntra: [
      'Laparotomia Damage Control (Laparotomia d\'urgenza)',
      'Packing addominale peri-epatico e splenectomia di salvataggio'
    ],
    moulageProtesi: 'Protesi Addome con anse intestinali ed emoperitoneo attivo',
    simulatori: 'Torace morbido + simulatore addome con vasi sanguinanti',
    attoriCount: 1,
    attoreDettagli: 'Attore con protesi addome cavo aperto',
    techNotes: 'Preparare kit garze laparotomiche e telini sterili',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 8,
    day: 2,
    period: 'pomeriggio',
    scenarioCode: 'Scenario 00 (Personalizzato - Collo Sanguinante)',
    groupExtraAssigned: 'B',
    groupIntraAssigned: 'A',
    teamExtraAssigned: 5,
    teamIntraAssigned: 2,
    lesioni: [
      'Collo sanguinante con lesione giugulo-carotidea (Emorragia giunzionale)',
      'Pneumotorace sinistro iperteso',
      'Arresto cardio-circolatorio traumatico peri-arresto (ACC)'
    ],
    procedureExtra: [
      'Gestione massive emorragia del collo (Wound packing + pressione digitale mirata)',
      'Toracostomia bilaterale'
    ],
    procedureIntra: [
      'Resus Thoracotomy (Toracotomia di rianimazione con clampaggio aortico e massaggio cardiaco interno)'
    ],
    moulageProtesi: 'Collo sanguinante con zampillo continuo e protesi carotidea',
    simulatori: 'Torace morbido con pericardio e cuore palpabile',
    attoriCount: 1,
    attoreDettagli: 'Attore con cannuccia di flusso carotideo controllato da pompa remota',
    techNotes: 'Attenzione a non occludere la tracheostomia durante il wound packing',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 9,
    day: 2,
    period: 'pomeriggio',
    scenarioCode: 'Scenario 3 (TCCC)',
    groupExtraAssigned: 'B',
    groupIntraAssigned: 'A',
    teamExtraAssigned: 6,
    teamIntraAssigned: 3,
    lesioni: [
      'Amputazione arto superiore sinistro',
      'Ustione torace e collo da fiammata con edema glottico imminente',
      'Trauma Cranico Grave (TBI)',
      'Emotorace'
    ],
    procedureExtra: [
      'Cricotirotomia chirurgica (CRIC)',
      'Toracostomia con drenaggio toracico di emergenza',
      'Tourniquet ascellare/omerale'
    ],
    procedureIntra: [
      'Gestione neuro-rianimatoria TBI + drenaggio toracico definitivo'
    ],
    moulageProtesi: 'Protesi Cricotirotomia, trucco ustioni di II/III grado collo/torace',
    simulatori: 'Torace rigido con manichino avanzato per monitoraggio parametri',
    attoriCount: 2,
    attoreDettagli: 'Attore ferito primario + attore testimone/soccorritore in stato di panico',
    techNotes: 'Calibrare simulatore parametri vitali: SpO2 78%, FC 145, PA 70/40',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 10,
    day: 2,
    period: 'pomeriggio',
    scenarioCode: 'Scenario 16 (TCCC) - Replica Postazione 10',
    groupExtraAssigned: 'D',
    groupIntraAssigned: 'C',
    teamExtraAssigned: 10,
    teamIntraAssigned: 7,
    lesioni: [
      'Ferita arma fuoco addome',
      'Frattura esposta emorragica',
      'Ferita arma fuoco coscia',
      'PNX'
    ],
    procedureExtra: [
      'Decompressione ago',
      'Tourniquet TQ coscia'
    ],
    procedureIntra: [
      'Laparotomia Damage Control'
    ],
    moulageProtesi: 'Protesi Addome con sanguinamento attivo',
    simulatori: 'Torace morbido',
    attoriCount: 1,
    attoreDettagli: 'Attore traumatizzato ipotermico',
    techNotes: 'Liquidi caldi per rianimazione pronti in shock room',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 11,
    day: 2,
    period: 'pomeriggio',
    scenarioCode: 'Scenario 00 (Personalizzato) - Replica Postazione 11',
    groupExtraAssigned: 'D',
    groupIntraAssigned: 'C',
    teamExtraAssigned: 11,
    teamIntraAssigned: 8,
    lesioni: [
      'Collo sanguinante',
      'PNX sx',
      'ACC (Arresto Cardio-Circolatorio traumatico)'
    ],
    procedureExtra: [
      'Gestione Massive collo',
      'Toracostomia'
    ],
    procedureIntra: [
      'Resus Thoracotomy'
    ],
    moulageProtesi: 'Collo sanguinante',
    simulatori: 'Torace morbido',
    attoriCount: 1,
    attoreDettagli: 'Attore con perdita di coscienza progressiva',
    techNotes: 'Defibrillatore con piastre da simulazione pronto',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 12,
    day: 2,
    period: 'pomeriggio',
    scenarioCode: 'Scenario 3 (TCCC) - Replica Postazione 12',
    groupExtraAssigned: 'D',
    groupIntraAssigned: 'C',
    teamExtraAssigned: 12,
    teamIntraAssigned: 9,
    lesioni: [
      'Amputazione sx',
      'Ustione torace - collo',
      'TBI',
      'Emotorace'
    ],
    procedureExtra: [
      'Cricotirotomia',
      'Toracostomia'
    ],
    procedureIntra: [
      'Gestione TBI e drenaggio torace'
    ],
    moulageProtesi: 'Protesi CRIC e ustioni',
    simulatori: 'Torace rigido',
    attoriCount: 2,
    attoreDettagli: '2 Attori',
    techNotes: 'Verifica collare cervicale e tavola spinale',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },

  // --- DAY 3 MATTINA (Pazienti 13-18) ---
  {
    id: 13,
    day: 3,
    period: 'mattina',
    scenarioCode: 'Scenario 18 (TCCC)',
    groupExtraAssigned: 'A',
    groupIntraAssigned: 'B',
    teamExtraAssigned: 1,
    teamIntraAssigned: 4,
    lesioni: [
      'Arma da fuoco torace dx (foro entrata anteriore e uscita posteriore sulla schiena)',
      'Ferita lacero-contusa (FLC) braccio sx con massive bleeding',
      'Frattura esposta tibia-perone',
      'ACC traumatico imminente'
    ],
    procedureExtra: [
      'Toracostomia con dito e valvola toracica',
      'Applicazione laccio emostatico TQ braccio sx'
    ],
    procedureIntra: [
      'Resuscitative Thoracotomy / Resus Thoraco'
    ],
    moulageProtesi: 'Ferita trans-toracica passante, zampillo arterioso brachiale con pompa',
    simulatori: 'Torace morbido con organi maiale per clampaggio aortico',
    attoriCount: 1,
    attoreDettagli: 'Attore in shock profondo e dispnea severa',
    techNotes: 'Controllo pressione pneumatica circuito sangue toracico',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 14,
    day: 3,
    period: 'mattina',
    scenarioCode: 'Scenario 5 (TCCC)',
    groupExtraAssigned: 'A',
    groupIntraAssigned: 'B',
    teamExtraAssigned: 2,
    teamIntraAssigned: 5,
    lesioni: [
      'Frattura emorragica sx',
      'Arma da fuoco addome dx',
      'Arma da fuoco bacino con instabilità emodinamica grave'
    ],
    procedureExtra: [
      'Applicazione Tourniquet TQ',
      'REBOA (Posizionamento palloncino da occlusione aortica pre-ospedaliera)'
    ],
    procedureIntra: [
      'Packing Peritoneale Pelvico (PPP)',
      'Stabilizzazione bacino con clamp a C / fissatore esterno rapido'
    ],
    moulageProtesi: 'Protesi addome con pelvi sfondata sanguinante, simulatore REBOA',
    simulatori: 'Simulatore REBOA + protesi addome pelvico',
    attoriCount: 2,
    attoreDettagli: 'Attore 1 (paziente), Attore 2 (secondo soccorritore o testimone)',
    techNotes: 'Fornire cintura pelvica T-POD e introduttore REBOA 7 Fr',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 15,
    day: 3,
    period: 'mattina',
    scenarioCode: 'Scenario 15 (TCCC)',
    groupExtraAssigned: 'A',
    groupIntraAssigned: 'B',
    teamExtraAssigned: 3,
    teamIntraAssigned: 6,
    lesioni: [
      'Trauma facciale massivo con distruzione del massiccio facciale',
      'Eviscerazione addominale acuta',
      'Frattura esposta emorragica',
      'Frattura bacino complessa'
    ],
    procedureExtra: [
      'Cricotirotomia chirurgica (CRIC)',
      'Tourniquet TQ arti e gestione iniziale dell\'eviscerazione'
    ],
    procedureIntra: [
      'Gonfiaggio e gestione REBOA Zone 3 (Biforcazione iliaca)',
      'Laparotomia e packing di contenimento'
    ],
    moulageProtesi: 'Trauma facciale con protesi CRICO sanguina ed espande, simulatore addome con eviscerazione, sim REBOA',
    simulatori: 'Simulatore addome + simulatore REBOA',
    attoriCount: 1,
    attoreDettagli: 'Attore con trucco teatrale traumatologico complesso',
    techNotes: 'Verificare guarnizioni tenuta pallone REBOA',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 16,
    day: 3,
    period: 'mattina',
    scenarioCode: 'Scenario 18 (TCCC) - Replica Postazione 16',
    groupExtraAssigned: 'C',
    groupIntraAssigned: 'D',
    teamExtraAssigned: 7,
    teamIntraAssigned: 10,
    lesioni: [
      'Arma da fuoco torace dx entrata e uscita schiena',
      'FLC braccio sx - massive bleeding',
      'Frattura tibia perone',
      'ACC'
    ],
    procedureExtra: [
      'Toracostomia',
      'TQ'
    ],
    procedureIntra: [
      'Resus Thoracotomy'
    ],
    moulageProtesi: 'Ferita passante torace + laccio brachiale',
    simulatori: 'Torace morbido',
    attoriCount: 1,
    attoreDettagli: 'Attore con dispnea progressiva',
    techNotes: 'Lame bisturi e costotomo di simulazione presenti nel vassoio',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 17,
    day: 3,
    period: 'mattina',
    scenarioCode: 'Scenario 5 (TCCC) - Replica Postazione 17',
    groupExtraAssigned: 'C',
    groupIntraAssigned: 'D',
    teamExtraAssigned: 8,
    teamIntraAssigned: 11,
    lesioni: [
      'Frattura emorragica sx',
      'Arma fuoco addome ddx',
      'Arma fuoco bacino'
    ],
    procedureExtra: [
      'TQ',
      'REBOA'
    ],
    procedureIntra: [
      'Packing Peritoneale PPP'
    ],
    moulageProtesi: 'Protesi addome + sim REBOA',
    simulatori: 'Simulatore REBOA e protesi pelvica',
    attoriCount: 2,
    attoreDettagli: '2 Attori',
    techNotes: 'Liquido pulsatile femorale verificato',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 18,
    day: 3,
    period: 'mattina',
    scenarioCode: 'Scenario 15 (TCCC) - Replica Postazione 18',
    groupExtraAssigned: 'C',
    groupIntraAssigned: 'D',
    teamExtraAssigned: 9,
    teamIntraAssigned: 12,
    lesioni: [
      'Trauma facciale',
      'Eviscerazione',
      'Frattura esposta emorragica',
      'Frattura bacino'
    ],
    procedureExtra: [
      'Crico',
      'TQ'
    ],
    procedureIntra: [
      'REBOA'
    ],
    moulageProtesi: 'Trauma facciale - protesi CRICO, simulatore addome, sim REBOA',
    simulatori: 'Simulatore addome + sim REBOA',
    attoriCount: 1,
    attoreDettagli: 'Attore con protesi facciale e addominale',
    techNotes: 'Set cricotirotomia d\'urgenza sterile a portata di mano',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },

  // --- DAY 3 POMERIGGIO (Pazienti 19-24) ---
  {
    id: 19,
    day: 3,
    period: 'pomeriggio',
    scenarioCode: 'Scenario 7 (TCCC)',
    groupExtraAssigned: 'B',
    groupIntraAssigned: 'A',
    teamExtraAssigned: 4,
    teamIntraAssigned: 1,
    lesioni: [
      'Ustione di II e III grado viso e collo con inalazione di fumi caldi',
      'Ustione di II e III grado torace a corazza',
      'Pneumotorace (PNX)'
    ],
    procedureExtra: [
      'Cricotirotomia chirurgica (CRIC d\'urgenza per vie aeree chiuse)'
    ],
    procedureIntra: [
      'Toracostomia per emotorace / Escarotomia decompressiva toracica'
    ],
    moulageProtesi: 'Protesi CRIC con trucco ustioni estese carbonizzate viso/collo/torace',
    simulatori: 'Torace rigido con manichino parametri avanzati',
    attoriCount: 2,
    attoreDettagli: 'Attore 1 (ustionato intossicato), Attore 2 (compagno di squadra)',
    techNotes: 'Verificare fumo scenico atossico pronto per simulazione incendio',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 20,
    day: 3,
    period: 'pomeriggio',
    scenarioCode: 'Scenario 13 (TCCC)',
    groupExtraAssigned: 'B',
    groupIntraAssigned: 'A',
    teamExtraAssigned: 5,
    teamIntraAssigned: 2,
    lesioni: [
      'Ustioni avambraccio e torace destro',
      'Ferita lacero-contusa (FLC) cranio con oto-liquorrea',
      'Pneumotorace (PNX) iperteso',
      'Sanguinamento addominale profondo'
    ],
    procedureExtra: [
      'Toracostomia con dito / drenaggio toracico di emergenza',
      'Stabilizzazione colonna e gestione ferita cranica'
    ],
    procedureIntra: [
      'Packing Peritoneale Pelvico (PPP)',
      'Monitoraggio pressione intracranica (PIC) e neuro-rianimazione'
    ],
    moulageProtesi: 'Ustioni avambraccio e torace destro, trucco cranico con sangue ed ematoma a occhiale',
    simulatori: 'Torace rigido + simulatore addome con cavità emoperitoneale',
    attoriCount: 1,
    attoreDettagli: 'Attore incosciente con respiro patologico (Cheyne-Stokes)',
    techNotes: 'Regolare simulatore sonoro per respiro agonico',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 21,
    day: 3,
    period: 'pomeriggio',
    scenarioCode: 'Scenario 8 (TCCC)',
    groupExtraAssigned: 'B',
    groupIntraAssigned: 'A',
    teamExtraAssigned: 6,
    teamIntraAssigned: 3,
    lesioni: [
      'Amputazione traumatica arto inferiore',
      'Lesione da impalamento addomino-pelvico con corpo estraneo in situ'
    ],
    procedureExtra: [
      'Posizionamento REBOA in ambiente preospedaliero tattico',
      'Stabilizzazione del corpo estraneo impalato e TQ su arto'
    ],
    procedureIntra: [
      'Packing Peritoneale (PPP)',
      'Estrazione chirurgica controllata in shock room con supporto REBOA'
    ],
    moulageProtesi: 'Corpo estraneo metallico/legnoso impalato nell\'addome, moncone arto sanguinante',
    simulatori: 'Simulatore REBOA + simulatore addome con corpo estraneo ancorato',
    attoriCount: 1,
    attoreDettagli: 'Attore con supporto lombare e struttura impalamento',
    techNotes: 'Attenzione alla stabilità del supporto impalamento durante il transfer su barella',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 22,
    day: 3,
    period: 'pomeriggio',
    scenarioCode: 'Scenario 7 (TCCC) - Replica Postazione 22',
    groupExtraAssigned: 'D',
    groupIntraAssigned: 'C',
    teamExtraAssigned: 10,
    teamIntraAssigned: 7,
    lesioni: [
      'Ustione II e III viso e collo',
      'Ustione II e III torace',
      'PNX'
    ],
    procedureExtra: [
      'CRIC'
    ],
    procedureIntra: [
      'Toracostomia emotorace'
    ],
    moulageProtesi: 'Protesi cric',
    simulatori: 'Torace rigido',
    attoriCount: 2,
    attoreDettagli: '2 Attori',
    techNotes: 'Dispositivo di aspirazione e kit crico ricontrollati',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 23,
    day: 3,
    period: 'pomeriggio',
    scenarioCode: 'Scenario 13 (TCCC) - Replica Postazione 23',
    groupExtraAssigned: 'D',
    groupIntraAssigned: 'C',
    teamExtraAssigned: 11,
    teamIntraAssigned: 8,
    lesioni: [
      'Ustioni avambraccio',
      'Ustioni torace destro',
      'FLC cranio',
      'PNX',
      'Sanguinamento addominale'
    ],
    procedureExtra: [
      'Toracostomia'
    ],
    procedureIntra: [
      'PPP'
    ],
    moulageProtesi: 'Ustioni ed FLC cranio con sanguinamento',
    simulatori: 'Torace rigido, sim addome',
    attoriCount: 1,
    attoreDettagli: 'Attore con monitoraggio simulato',
    techNotes: 'Garze addominali radio-opache per packing',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
  {
    id: 24,
    day: 3,
    period: 'pomeriggio',
    scenarioCode: 'Scenario 8 (TCCC) - Replica Postazione 24',
    groupExtraAssigned: 'D',
    groupIntraAssigned: 'C',
    teamExtraAssigned: 12,
    teamIntraAssigned: 9,
    lesioni: [
      'Amputazione arto',
      'Lesione impalamento addome',
      'Emorragia massiva del collo'
    ],
    procedureExtra: [
      'REBOA',
      'Gestione Massive collo (Packing & Emostasi diretta)'
    ],
    procedureIntra: [
      'REBOA gestione',
      'Controllo vascolare emorragia collo e PPP'
    ],
    moulageProtesi: 'Collo sanguinante + impalamento + protesi amputazione',
    simulatori: 'Sim REBOA, Sim addome',
    attoriCount: 1,
    attoreDettagli: 'Attore con moncone e collo sanguinante',
    techNotes: 'Fornire medicazioni emostatiche al caolino e chitosano',
    techChecklist: { preDone: false, intraDone: false, postDone: false }
  },
];

// Full Schedule Timetable for Day 2 & Day 3 based on official roadmap
export const INITIAL_TIMELINE_SLOTS: TimelineSlot[] = [
  // ================= DAY 2 MATTINA =================
  {
    id: 'd2-m1',
    day: 2,
    period: 'mattina',
    timeRange: '08:30 - 09:30',
    startMinutes: 510,
    durationMinutes: 60,
    title: 'Day 2 Mattina: Gate Opening & Avvio Scenari',
    description: 'Apertura gate e raduno con gruppi e Faculty. Alpha: TCCC Scenario (09:00-09:30). Bravo: Shock Room Prep (09:15) e Scenario (09:30-10:00). Charlie e Delta: Workshop e Skills (09:00-10:20).',
    groupActivities: {
      A: {
        activityType: 'scenario_extra',
        title: 'Gate Opening -> Start TCCC Scenario',
        subtitle: 'Invito al raduno con gruppo e Faculty (08:30) | Start Scenario Extra (09:00 - 09:30)',
        location: 'Settore Scenari Alfa',
        scenarioRef: 'Scenari 6, 1, 11',
        patientIds: [1, 2, 3],
        partnerGroup: 'B',
        facultyInvolved: ['fac-1', 'fac-2', 'fac-3']
      },
      B: {
        activityType: 'scenario_intra',
        title: 'Gate Opening -> Convening Shock Room Teams',
        subtitle: 'Raduno (08:30) | Shock Room Preparation (09:15) | Start Shock Room (09:30 - 10:00)',
        location: 'Shock Room 1, 2, 3',
        scenarioRef: 'Scenari 6, 1, 11 (Intra)',
        patientIds: [1, 2, 3],
        partnerGroup: 'A',
        facultyInvolved: ['fac-4', 'fac-5', 'fac-6']
      },
      C: {
        activityType: 'workshop',
        title: 'Gate Opening -> Workshop & Skills',
        subtitle: 'Raduno (08:30) | Workshop (09:00 - 09:45) | Break (09:45 - 09:55) | Skills (09:55 - 10:20)',
        location: 'Area Tattica & Skills Lab 1',
        facultyInvolved: ['fac-7', 'fac-8', 'fac-9']
      },
      D: {
        activityType: 'skills',
        title: 'Gate Opening -> Workshop & Skills',
        subtitle: 'Raduno (08:30) | Workshop (09:00 - 09:45) | Break (09:45 - 09:55) | Skills (09:55 - 10:20)',
        location: 'Area Tattica & Skills Lab 2',
        facultyInvolved: ['fac-10', 'fac-11', 'fac-12']
      }
    }
  },
  {
    id: 'd2-m2',
    day: 2,
    period: 'mattina',
    timeRange: '09:30 - 11:00',
    startMinutes: 570,
    durationMinutes: 90,
    title: 'Rotazione Mattina 1: End TCCC, Handover, Debriefing e Break',
    description: 'Alpha: Fine TCCC, Handover e Debriefing (09:30-10:00), Break (10:00-10:30), Workshop (10:30-11:15). Bravo: End Shock Room, Break & Debrief (10:00-10:30), Skill Workshop (10:30-11:15). Charlie & Delta: Avvio TCCC e Shock Room.',
    groupActivities: {
      A: {
        activityType: 'debriefing',
        title: 'End TCCC Scenario -> Handover & Debriefing -> Break',
        subtitle: 'Fine TCCC (09:30) | Handover & Debriefing (09:30-10:00) | Break (10:00-10:30) | Workshop (10:30-11:15)',
        location: 'Aula Debriefing Alfa / Workshop',
        partnerGroup: 'B',
        patientIds: [1, 2, 3],
        facultyInvolved: ['fac-1', 'fac-2', 'fac-3']
      },
      B: {
        activityType: 'debriefing',
        title: 'End Shock Room -> Break & Debrief -> Skill Workshop',
        subtitle: 'Fine Shock Room (10:00) | Break & Debriefing (10:00-10:30) | Skill Workshop (10:30-11:15)',
        location: 'Shock Room 1, 2, 3 / Skills Lab',
        partnerGroup: 'A',
        patientIds: [1, 2, 3],
        facultyInvolved: ['fac-4', 'fac-5', 'fac-6']
      },
      C: {
        activityType: 'scenario_extra',
        title: 'Start TCCC Scenario -> End -> Handover & Debriefing',
        subtitle: 'Start TCCC (10:30) | End TCCC (11:00) | Handover & Debriefing (11:00-11:30)',
        location: 'Settore Scenari Charlie',
        scenarioRef: 'Scenari 6, 1, 11',
        patientIds: [4, 5, 6],
        partnerGroup: 'D',
        facultyInvolved: ['fac-7', 'fac-8', 'fac-9']
      },
      D: {
        activityType: 'scenario_intra',
        title: 'Break -> Convening Shock Room Teams -> End',
        subtitle: 'Break (10:20-10:30) | Shock Room Prep (10:45) | Start Shock Room (11:00) | End (11:30)',
        location: 'Shock Room 4, 5, 6',
        scenarioRef: 'Scenari 6, 1, 11 (Intra)',
        patientIds: [4, 5, 6],
        partnerGroup: 'C',
        facultyInvolved: ['fac-10', 'fac-11', 'fac-12']
      }
    }
  },
  {
    id: 'd2-m3',
    day: 2,
    period: 'mattina',
    timeRange: '11:00 - 12:00',
    startMinutes: 660,
    durationMinutes: 60,
    title: 'Completamento Mattina Day 2: Break & Chiusura Sessione',
    description: 'Completamento dei break finali della mattina (11:15-12:00) in attesa della pausa pranzo.',
    groupActivities: {
      A: { activityType: 'pause', title: 'Break Mattina', subtitle: 'Pausa ristoro e transizione', location: 'Area Relax' },
      B: { activityType: 'pause', title: 'Break Mattina', subtitle: 'Pausa ristoro e transizione', location: 'Area Relax' },
      C: { activityType: 'pause', title: 'Break & Handover', subtitle: 'Handover e debriefing finale mattina', location: 'Aula Debriefing Charlie' },
      D: { activityType: 'pause', title: 'Break & Debriefing', subtitle: 'Break e debriefing finale mattina', location: 'Area Relax' }
    }
  },
  {
    id: 'd2-m4',
    day: 2,
    period: 'mattina',
    timeRange: '12:00 - 13:00',
    startMinutes: 720,
    durationMinutes: 60,
    title: 'Pausa Pranzo Day 2',
    description: 'Pausa pranzo per tutti i partecipanti. Gate chiuso in standby per la fase pomeridiana.',
    groupActivities: {
      A: { activityType: 'pause', title: 'Pausa Pranzo', subtitle: 'Mensa / Area Ristoro', location: 'Ristorante Centro Simulazione' },
      B: { activityType: 'pause', title: 'Pausa Pranzo', subtitle: 'Mensa / Area Ristoro', location: 'Ristorante Centro Simulazione' },
      C: { activityType: 'pause', title: 'Pausa Pranzo', subtitle: 'Mensa / Area Ristoro', location: 'Ristorante Centro Simulazione' },
      D: { activityType: 'pause', title: 'Pausa Pranzo', subtitle: 'Mensa / Area Ristoro', location: 'Ristorante Centro Simulazione' }
    }
  },

  // ================= DAY 2 POMERIGGIO =================
  {
    id: 'd2-p1',
    day: 2,
    period: 'pomeriggio',
    timeRange: '13:00 - 14:15',
    startMinutes: 780,
    durationMinutes: 75,
    title: 'Day 2 Pomeriggio: Gate Opening & Avvio Scenari Pomeridiani',
    description: 'Apertura gate (13:00). Alpha: TCCC Scenario (13:30-14:00), Handover & Debrief (14:00-14:15). Bravo: Shock Room Prep (13:15), Scenario (13:30-14:00), Break & Debrief (14:00-14:15). Charlie & Delta: Workshop e Skills.',
    groupActivities: {
      A: {
        activityType: 'scenario_extra',
        title: 'Gate Opening -> Start TCCC Scenario -> Handover & Debrief',
        subtitle: 'Gate (13:00) | TCCC Scenario (13:30 - 14:00) | Handover & Debrief (14:00 - 14:15)',
        location: 'Settore Scenari Bravo',
        scenarioRef: 'Scenari 16, 00, 3',
        patientIds: [7, 8, 9],
        partnerGroup: 'B',
        facultyInvolved: ['fac-1', 'fac-2', 'fac-3']
      },
      B: {
        activityType: 'scenario_intra',
        title: 'Gate Opening -> Shock Room Prep -> Start -> Break & Debrief',
        subtitle: 'Gate (13:00) | SR Prep (13:15) | SR Scenario (13:30 - 14:00) | Break & Debrief (14:00 - 14:15)',
        location: 'Shock Room 1, 2, 3',
        scenarioRef: 'Scenari 16, 00, 3 (Intra)',
        patientIds: [7, 8, 9],
        partnerGroup: 'A',
        facultyInvolved: ['fac-4', 'fac-5', 'fac-6']
      },
      C: {
        activityType: 'workshop',
        title: 'Gate Opening -> Workshop & Skills',
        subtitle: 'Gate (13:00) | Workshop (13:00 - 13:45) | Break (13:45 - 13:55) | Skills (13:55 - 14:20)',
        location: 'Aula Tattica & Skills Lab',
        facultyInvolved: ['fac-7', 'fac-8', 'fac-9']
      },
      D: {
        activityType: 'skills',
        title: 'Gate Opening -> Skills & Workshop',
        subtitle: 'Gate (13:00) | Skills (13:00 - 13:45) | Break (13:45 - 13:55) | Workshop (13:55 - 14:20)',
        location: 'Skills Lab & Aula Tattica',
        facultyInvolved: ['fac-10', 'fac-11', 'fac-12']
      }
    }
  },
  {
    id: 'd2-p2',
    day: 2,
    period: 'pomeriggio',
    timeRange: '14:15 - 16:00',
    startMinutes: 855,
    durationMinutes: 105,
    title: 'Rotazione Pomeriggio 2: Workshop, Skills & Scenari Delta/Charlie',
    description: 'Alpha & Bravo: Break (14:15-14:30), Skills & Workshop (14:30-16:00). Charlie & Delta: Convening Shock Room (14:45), TCCC Scenario (14:30-15:00), Handover & Debriefing (15:00-15:30), Break.',
    groupActivities: {
      A: {
        activityType: 'skills',
        title: 'Break -> Skills Workshop -> Workshop',
        subtitle: 'Break (14:15-14:30) | Skills Workshop (14:30 - 15:15) | Break (15:15-15:30) | Workshop (15:30 - 16:00)',
        location: 'Skills Lab & Aula',
        facultyInvolved: ['fac-1', 'fac-2', 'fac-3']
      },
      B: {
        activityType: 'workshop',
        title: 'Break -> Workshop -> Skills Workshop',
        subtitle: 'Break (14:15-14:30) | Workshop (14:30 - 15:15) | Break (15:15-15:30) | Skills Workshop (15:30 - 16:00)',
        location: 'Aula & Skills Lab',
        facultyInvolved: ['fac-4', 'fac-5', 'fac-6']
      },
      C: {
        activityType: 'scenario_intra',
        title: 'Convening Shock Room Teams -> Start -> End -> Break',
        subtitle: 'Convening SR (14:45) | Start SR (15:00) | End SR (15:30) | Break (15:30 - 16:00)',
        location: 'Shock Room 4, 5, 6',
        scenarioRef: 'Scenari 16, 00, 3 (Intra)',
        patientIds: [10, 11, 12],
        partnerGroup: 'D',
        facultyInvolved: ['fac-7', 'fac-8', 'fac-9']
      },
      D: {
        activityType: 'scenario_extra',
        title: 'Start TCCC Scenario -> End -> Handover & Debrief -> Break',
        subtitle: 'Start TCCC (14:30) | End (15:00) | Handover & Debrief (15:00 - 15:30) | Break (15:30 - 16:00)',
        location: 'Settore Scenari Delta',
        scenarioRef: 'Scenari 16, 00, 3',
        patientIds: [10, 11, 12],
        partnerGroup: 'C',
        facultyInvolved: ['fac-10', 'fac-11', 'fac-12']
      }
    }
  },

  // ================= DAY 3 MATTINA =================
  {
    id: 'd3-m1',
    day: 3,
    period: 'mattina',
    timeRange: '08:30 - 11:00',
    startMinutes: 510,
    durationMinutes: 150,
    title: 'Day 3 Mattina: Gate Opening & Scenari TCCC / Shock Room',
    description: 'Apertura gate (08:30). Alpha: TCCC Scenario (09:00-09:30), Handover & Debrief, Workshop. Bravo: SR Prep (09:15), SR Scenario (09:30-10:00), Break & Debrief, Skill Workshop. Charlie & Delta rotazioni parallele.',
    groupActivities: {
      A: {
        activityType: 'scenario_extra',
        title: 'Gate Opening -> Start TCCC Scenario -> Handover & Debrief -> Workshop',
        subtitle: 'Gate (08:30) | TCCC (09:00-09:30) | Handover & Debrief (09:30-10:00) | Workshop (10:30-11:15)',
        location: 'Settore Scenari Alfa',
        scenarioRef: 'Scenari 18, 5, 15',
        patientIds: [13, 14, 15],
        partnerGroup: 'B',
        facultyInvolved: ['fac-1', 'fac-2', 'fac-3']
      },
      B: {
        activityType: 'scenario_intra',
        title: 'Gate Opening -> Shock Room Prep -> Start -> Break & Debrief -> Skills',
        subtitle: 'Gate (08:30) | SR Prep (09:15) | SR Scenario (09:30-10:00) | Break & Debrief (10:00-10:30) | Skills (10:30-11:15)',
        location: 'Shock Room 1, 2, 3',
        scenarioRef: 'Scenari 18, 5, 15 (Intra)',
        patientIds: [13, 14, 15],
        partnerGroup: 'A',
        facultyInvolved: ['fac-4', 'fac-5', 'fac-6']
      },
      C: {
        activityType: 'workshop',
        title: 'Gate Opening -> Workshop & Skills -> TCCC Scenario',
        subtitle: 'Gate (08:30) | Workshop (09:00-09:45) | Skills (09:55-10:20) | TCCC (10:30-11:00)',
        location: 'Area Tattica & Skills Lab',
        facultyInvolved: ['fac-7', 'fac-8', 'fac-9']
      },
      D: {
        activityType: 'skills',
        title: 'Gate Opening -> Skills & Workshop -> Shock Room',
        subtitle: 'Gate (08:30) | Skills (09:00-09:45) | Workshop (09:55-10:20) | SR Prep (10:45) | SR (11:00)',
        location: 'Skills Lab & Shock Room',
        facultyInvolved: ['fac-10', 'fac-11', 'fac-12']
      }
    }
  },
  {
    id: 'd3-m2',
    day: 3,
    period: 'mattina',
    timeRange: '11:00 - 13:00',
    startMinutes: 660,
    durationMinutes: 120,
    title: 'Completamento Mattina Day 3: Debriefing, Break & Pranzo',
    description: 'Completamento attività mattutine, handover finali e pausa pranzo (12:00 - 13:00).',
    groupActivities: {
      A: { activityType: 'pause', title: 'Break & Transizione', subtitle: 'Pausa pre-pranzo', location: 'Area Relax' },
      B: { activityType: 'pause', title: 'Break & Transizione', subtitle: 'Pausa pre-pranzo', location: 'Area Relax' },
      C: { activityType: 'debriefing', title: 'Handover & Debriefing', subtitle: 'Debriefing finale mattina', location: 'Aula Debriefing' },
      D: { activityType: 'pause', title: 'Pausa Pranzo', subtitle: 'Mensa / Area Ristoro', location: 'Ristorante Centro Simulazione' }
    }
  },

  // ================= DAY 3 POMERIGGIO =================
  {
    id: 'd3-p1',
    day: 3,
    period: 'pomeriggio',
    timeRange: '13:00 - 16:00',
    startMinutes: 780,
    durationMinutes: 180,
    title: 'Day 3 Pomeriggio: Gate Opening, Scenari & Plenaria Chiusura',
    description: 'Apertura gate pomeridiano (13:00). Alpha & Bravo: Scenari TCCC e Shock Room (Pazienti 19-21) + Workshop & Skills (13:30-16:00). Charlie & Delta: Scenari pomeridiani e sessione plenaria Q&A (15:15-16:00).',
    groupActivities: {
      A: {
        activityType: 'scenario_extra',
        title: 'Gate Opening -> Start TCCC Scenario -> Skills & Workshop',
        subtitle: 'Gate (13:00) | TCCC Scenario (13:30-14:00) | Skills & Workshop Pomeridiani (14:30-16:00)',
        location: 'Settore Scenari Bravo',
        scenarioRef: 'Scenari 7, 13, 8',
        patientIds: [19, 20, 21],
        partnerGroup: 'B',
        facultyInvolved: ['fac-1', 'fac-2', 'fac-3']
      },
      B: {
        activityType: 'scenario_intra',
        title: 'Gate Opening -> Shock Room Prep -> Start -> Workshop & Skills',
        subtitle: 'Gate (13:00) | SR Prep (13:15) | SR Scenario (13:30-14:00) | Workshop & Skills (14:30-16:00)',
        location: 'Shock Room 1, 2, 3',
        scenarioRef: 'Scenari 7, 13, 8 (Intra)',
        patientIds: [19, 20, 21],
        partnerGroup: 'A',
        facultyInvolved: ['fac-4', 'fac-5', 'fac-6']
      },
      C: {
        activityType: 'workshop',
        title: 'Gate Opening -> Workshop -> Shock Room Scenario',
        subtitle: 'Gate (13:00) | Workshop & Skills (13:00-14:30) | SR Scenario (15:00-15:30) | Plenaria (15:15-16:00)',
        location: 'Aula & Shock Room 4, 5, 6',
        scenarioRef: 'Scenari 7, 13, 8 (Intra)',
        patientIds: [22, 23, 24],
        partnerGroup: 'D',
        facultyInvolved: ['fac-7', 'fac-8', 'fac-9']
      },
      D: {
        activityType: 'skills',
        title: 'Gate Opening -> Skills -> TCCC Scenario & Plenaria',
        subtitle: 'Gate (13:00) | Skills & Workshop (13:00-14:30) | TCCC Scenario (14:30-15:00) | Plenaria (15:15-16:00)',
        location: 'Skills Lab & Settore Delta',
        scenarioRef: 'Scenari 7, 13, 8',
        patientIds: [22, 23, 24],
        partnerGroup: 'C',
        facultyInvolved: ['fac-10', 'fac-11', 'fac-12']
      }
    }
  },

  // ================= DAY 3 NOTTURNO =================
  {
    id: 'd3-night',
    day: 3,
    period: 'notturno',
    timeRange: '20:30 - 22:00',
    startMinutes: 1230,
    durationMinutes: 90,
    title: 'NIGHT SCENARIO: Apertura Gate & Maxi-Scenario Notturno',
    description: 'Apertura Gate Night Scenario (20:30). Raduno gruppi e faculty. 21:00 - 22:00: Maxi-Scenario Notturno ad alta intensità, Triage MCI START/SALT, Airway e gestione traumatologica critica in ambiente tattico notturno.',
    groupActivities: {
      A: {
        activityType: 'night_scenario',
        title: 'Night Scenario Gate Opening -> Maxi-Scenario Alfa',
        subtitle: 'Gate Opening (20:30) | Maxi-Scenario Notturno Airway & TBI (21:00 - 22:00)',
        location: 'Area Tattica Notturna - Settore Alfa',
        scenarioRef: 'Night Scenario - Airway & TBI',
        facultyInvolved: ['fac-1', 'fac-2', 'fac-3']
      },
      B: {
        activityType: 'night_scenario',
        title: 'Night Scenario Gate Opening -> Maxi-Scenario Bravo',
        subtitle: 'Gate Opening (20:30) | Maxi-Scenario Notturno Emorragia & REBOA (21:00 - 22:00)',
        location: 'Area Tattica Notturna - Settore Bravo',
        scenarioRef: 'Night Scenario - Haemorrhage & REBOA',
        facultyInvolved: ['fac-4', 'fac-5', 'fac-6']
      },
      C: {
        activityType: 'night_scenario',
        title: 'Night Scenario Gate Opening -> Maxi-Scenario Charlie',
        subtitle: 'Gate Opening (20:30) | Maxi-Scenario Notturno Triage MCI (21:00 - 22:00)',
        location: 'Area Tattica Notturna - Settore Charlie',
        scenarioRef: 'Night Scenario - MCI Triage',
        facultyInvolved: ['fac-7', 'fac-8', 'fac-9']
      },
      D: {
        activityType: 'night_scenario',
        title: 'Night Scenario Gate Opening -> Maxi-Scenario Delta',
        subtitle: 'Gate Opening (20:30) | Maxi-Scenario Notturno Damage Control (21:00 - 22:00)',
        location: 'Area Tattica Notturna - Settore Delta',
        scenarioRef: 'Night Scenario - Damage Control',
        facultyInvolved: ['fac-10', 'fac-11', 'fac-12']
      }
    }
  }
];

// Night scenario cases for all 12 teams
export const INITIAL_NIGHT_SCENARIOS: NightScenarioCase[] = [
  {
    teamId: 1,
    teamName: 'Squadra 1 (Alpha 1)',
    groupId: 'A',
    title: 'AIRWAY - TBI (Trauma Cranico Grave) & CRIC',
    category: 'Vie Aeree & Neurotrauma',
    injuries: [
      'GCS 4 con trisma severo e sangue nel cavo orale',
      'Ematoma subdurale acuto con anisocoria destra',
      'Desaturazione critica (SpO2 65%) refrattaria'
    ],
    expectedTriageCategory: 'IMMEDIATE',
    procedures: ['Cricotirotomia chirurgica d\'urgenza', 'Iperventilazione controllata e mannitolo', 'Aspirazione vie aeree'],
    location: 'Settore Notturno 1 (Ingresso Edificio A)'
  },
  {
    teamId: 2,
    teamName: 'Squadra 2 (Alpha 2)',
    groupId: 'A',
    title: 'AIRWAY - FACIAL INJURY (Lesione Facciale Grave) & CRIC',
    category: 'Vie Aeree & Trauma Facciale',
    injuries: [
      'Frattura complessa Le Fort III con perdita di sostanza del massiccio facciale',
      'Ostruzione meccanica totale via aerea superiore',
      'Sanguinamento massivo faringeo'
    ],
    expectedTriageCategory: 'IMMEDIATE',
    procedures: ['Cricotirotomia chirurgica con cannula cuffiata', 'Tamponamento emostatico antero-posteriore'],
    location: 'Settore Notturno 2 (Piazzale Automezzi)'
  },
  {
    teamId: 3,
    teamName: 'Squadra 3 (Alpha 3)',
    groupId: 'A',
    title: 'AIRWAY - NECK INJURY (Lesione al Collo) & CRIC',
    category: 'Vie Aeree & Trauma Cervicale',
    injuries: [
      'Ferita penetrante zona II del collo con enfisema sottocutaneo massivo',
      'Stridore laringeo ingravescente',
      'Sanguinamento venoso profondo giugulare'
    ],
    expectedTriageCategory: 'IMMEDIATE',
    procedures: ['Cricotirotomia chirurgica sotto lesione tracheale', 'Wound packing cervicale mirato'],
    location: 'Settore Notturno 3 (Galleria Sotterranea)'
  },
  {
    teamId: 4,
    teamName: 'Squadra 4 (Bravo 1)',
    groupId: 'B',
    title: 'TRAUMA PENETRANTE - Toraco-Addominale',
    category: 'Trauma Penetrante & Emotorace',
    injuries: [
      'Ferite multiple da schegge metalliche torace anteriore e fianco',
      'Emotorace massivo con deviazione tracheale',
      'Shock emorragico classe III'
    ],
    expectedTriageCategory: 'IMMEDIATE',
    procedures: ['Toracostomia con dito e drenaggio toracico', 'Valvola di Asherman / medicazione a 3 lati'],
    location: 'Settore Notturno 4 (Bunker Esterno)'
  },
  {
    teamId: 5,
    teamName: 'Squadra 5 (Bravo 2)',
    groupId: 'B',
    title: 'LESIONE DA USTIONE ESTESA (Burn Injury)',
    category: 'Ustioni Termiche & Inalazione',
    injuries: [
      'Ustione di III grado > 45% superficie corporea (TBSA)',
      'Sospetta inalazione di fumi tossici con fuliggine periorale',
      'Ipotermia imminente'
    ],
    expectedTriageCategory: 'DELAYED',
    procedures: ['Calcolo fluidico formula Parkland', 'Copertura con teli termici isotermici', 'Accessi venosi / intraosseo'],
    location: 'Settore Notturno 5 (Deposito Materiali)'
  },
  {
    teamId: 6,
    teamName: 'Squadra 6 (Bravo 3)',
    groupId: 'B',
    title: 'LESIONE DA USTIONE & TRAUMA TORACICO',
    category: 'Ustioni & Esplosione',
    injuries: [
      'Ustione circonferenziale toracica a corazza con ipomobilità respiratoria',
      'Ustioni arti superiori di II grado profondo'
    ],
    expectedTriageCategory: 'DELAYED',
    procedures: ['Escarotomia decompressiva toracica d\'emergenza', 'Sedazione e analgesia multimodale'],
    location: 'Settore Notturno 6 (Locale Caldaie)'
  },
  {
    teamId: 7,
    teamName: 'Squadra 7 (Charlie 1)',
    groupId: 'C',
    title: 'LESIONE DA USTIONE & INTOSSICAZIONE CO/CN',
    category: 'Ustioni & Tossicologia',
    injuries: [
      'Paziente incosciente estratto da ambiente chiuso saturo di fumo',
      'Ustioni di II grado viso e mani',
      'Carbossiemoglobina stimata elevata'
    ],
    expectedTriageCategory: 'IMMEDIATE',
    procedures: ['Ossigenoterapia ad alti flussi 100%', 'Idrossocobalamina (Cyanokit)', 'Intubazione precoce'],
    location: 'Settore Notturno 7 (Ufficio Tecnico)'
  },
  {
    teamId: 8,
    teamName: 'Squadra 8 (Charlie 2)',
    groupId: 'C',
    title: 'IMPALAMENTO ADDOMINALE & SHOCK',
    category: 'Impalamento & Trauma Complesso',
    injuries: [
      'Barra metallica di 1,5 metri conficcata nel quadrante inferiore destro addome',
      'Polso radiale assente, polso carotideo tachicardico filiforme',
      'Impossibilità di posizionamento supino standard'
    ],
    expectedTriageCategory: 'IMMEDIATE',
    procedures: ['Stabilizzazione in situ del corpo estraneo', 'Accorciamento controllato barra', 'Accesso intraosseo'],
    location: 'Settore Notturno 8 (Cantiere Edile)'
  },
  {
    teamId: 9,
    teamName: 'Squadra 9 (Charlie 3)',
    groupId: 'C',
    title: 'AMPUTAZIONE TRAUMATICA SUB-TOTALE',
    category: 'Blast Injury & Amputazione',
    injuries: [
      'Amputazione traumatica braccio sinistro a livello del terzo medio omero',
      'Emorragia arteriosa massiva zampillante',
      'Stato di sopore profondo'
    ],
    expectedTriageCategory: 'IMMEDIATE',
    procedures: ['Applicazione Tourniquet TQ ad alta efficacia prossimale', 'Impaccamento con garze emostatiche', 'TXA'],
    location: 'Settore Notturno 9 (Corridoio Est)'
  },
  {
    teamId: 10,
    teamName: 'Squadra 10 (Delta 1)',
    groupId: 'D',
    title: 'AMPUTAZIONE TRAUMATICA BILATERALE',
    category: 'Blast Injury & Catastrofico',
    injuries: [
      'Doppia amputazione traumatica arti inferiori (sotto il ginocchio)',
      'Sanguinamento combinato massivo',
      'Shock emorragico classe IV'
    ],
    expectedTriageCategory: 'IMMEDIATE',
    procedures: ['Doppio Tourniquet TQ arti inferiori', 'Acido Tranexamico (TXA)', 'Riscaldamento attivo'],
    location: 'Settore Notturno 10 (Piazzale Centrale)'
  },
  {
    teamId: 11,
    teamName: 'Squadra 11 (Delta 2)',
    groupId: 'D',
    title: 'AMPUTAZIONE TRAUMATICA & FRATTURA BACINO',
    category: 'Politrauma & Emorragie Giunzionali',
    injuries: [
      'Amputazione gamba dx con instabilità e disgiunzione sinfisi pubica',
      'Sospetta lesione vasi iliaci interni'
    ],
    expectedTriageCategory: 'IMMEDIATE',
    procedures: ['Cintura pelvica T-POD', 'Tourniquet giunzionale SAM JETT / REBOA preospedaliero'],
    location: 'Settore Notturno 11 (Parcheggio Sotterraneo)'
  },
  {
    teamId: 12,
    teamName: 'Squadra 12 (Delta 3)',
    groupId: 'D',
    title: 'EVISCERAZIONE ADDOMINALE DA ESPLOSIONE',
    category: 'Trauma Addominale & Blast',
    injuries: [
      'Lacerazione addominale con estrusione massiva di stomaco e colon',
      'Contaminazione fecale e detriti da esplosione in situ',
      'Paziente cosciente con dolore lancinante e dispnea riflessa'
    ],
    expectedTriageCategory: 'IMMEDIATE',
    procedures: ['Copertura protettiva con teli sterili umidificati non aderenti', 'Analgesia oppioide EV', 'Antibioticoterapia'],
    location: 'Settore Notturno 12 (Hangar Manutenzione)'
  }
];

export const INITIAL_BROADCAST_ALERTS = [
  {
    id: 'alert-1',
    timestamp: '09:00',
    senderRole: 'direttore' as const,
    senderName: 'Dott. Marco Valenti (Direttore)',
    type: 'info' as const,
    title: 'Inizio Corso Day 2 & Day 3',
    message: 'Benvenuti al corso. Gruppo A in Scenari Extraospedalieri, Gruppo B in ED, Gruppi C e D nei rispettivi Workshop.',
    targetGroups: ['ALL' as const],
    active: true,
    priority: 'normal' as const,
  },
];

export const INITIAL_COURSE_MESSAGES = [
  {
    id: 'msg-1',
    timestamp: '09:15',
    senderId: 'disc-1',
    senderName: 'Dr. Marco Rossi',
    senderRole: 'discente' as const,
    senderTeamId: 1,
    senderStation: 'Postazione 1 (TCCC)',
    type: 'warning' as const,
    subject: 'Richiesta verifica ago decompressivo torace',
    content: 'Squadra 1 richiede riscontro tutor per completamento decompressione con ago 14G su paziente 1.',
    status: 'pending' as const,
  },
  {
    id: 'msg-2',
    timestamp: '09:20',
    senderId: 'tech-1',
    senderName: 'Silvia Rossi',
    senderRole: 'tecnico' as const,
    senderStation: 'Lab Moulage / Postazione 4',
    type: 'info' as const,
    subject: 'Ricarica sangue sintetico completata',
    content: 'Postazioni 1, 4 e 7 rifornite con sacche e circuito pulsante pronto per la rotazione successiva.',
    status: 'acknowledged' as const,
    acknowledgedBy: 'Dott. Marco Valenti',
    acknowledgedAt: '09:22',
  },
];
