import {
  CourseDay,
  Discente,
  Director,
  RegiaStaff,
  Faculty,
  GroupType,
  Guest,
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

export const INITIAL_REGIA_STAFF: RegiaStaff[] = [
  {
    id: 'regia-1',
    name: 'Col. Prof. Franco Neri',
    title: 'Capo Centrale Regia & Master Control',
    role: 'Coordinamento Tecnico-Operativo & Regia',
    nationality: 'Italiana',
    organization: 'Comando Operazioni Speciali & Simulazione',
    phone: '+39 335 9900111',
    email: 'f.neri@regiasim.org',
    badgeCode: 'REGIA-01',
    isMaster: true,
    notes: 'Controllo centrale, supervisione flussi e regia master',
  },
  {
    id: 'regia-2',
    name: 'Ing. Laura Verdi',
    title: 'Tecnico Senior Regia Audio/Video & Sincronizzazione',
    role: 'Regista Live Stream & Network Admin',
    nationality: 'Italiana',
    organization: 'SimCenter Media Lab',
    phone: '+39 338 8877665',
    email: 'l.verdi@regiasim.org',
    badgeCode: 'REGIA-02',
    isMaster: false,
    notes: 'Gestione flussi video multischermo e sincronizzazione temporale',
  },
];

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'tech-1',
    name: 'Silvia Rossi (Lead Moulage & Protesi)',
    assignedStations: ['Postazione 1', 'Box Shock Room 1', 'Ambiente Tattico 1'],
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
    assignedStations: ['Postazione 2', 'Box Shock Room 2', 'Ambiente Tattico 2'],
    specialty: 'Simulatori torace morbido con tessuti biologici, toracotomia',
    nationality: 'Italiana',
    organization: 'Laboratorio Wet-Lab & Biomodelli',
    phone: '+39 334 2345678',
    email: 'r.bianchi@wetlab.it',
    badgeCode: 'TECH-02',
    notes: 'Preparazione organi suini e clamping ilo polmonare',
  },
  {
    id: 'tech-3',
    name: 'Alessandro Conti',
    assignedStations: ['Postazione 3', 'Box Shock Room 3', 'Ambiente Tattico 3'],
    specialty: 'Simulatori REBOA endovascolari, controllo emorragie arteriose',
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
    assignedStations: ['Box Shock Room 1', 'Ambiente Tattico 1'],
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
    assignedStations: ['Box Shock Room 2', 'Ambiente Tattico 2'],
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
    assignedStations: ['Box Shock Room 3', 'Ambiente Tattico 3'],
    specialty: 'Effetti sonori, fumi scenici, illuminazione tattica notturna',
    nationality: 'Italiana',
    organization: 'AudioVideo Sim Live',
    phone: '+39 338 6789012',
    email: 'd.esposito@audiovideosim.it',
    badgeCode: 'TECH-06',
    notes: 'Regia telecamere debriefing e pirotecnica scenica',
  },
  {
    id: 'tech-7',
    name: 'Marco Rinaldi',
    assignedStations: ['Box Shock Room 1', 'Skills Lab WS1'],
    specialty: 'Monitoraggio emodinamico avanzato, telemetria e sinottici vitali',
    nationality: 'Italiana',
    organization: 'SimTelemetry Systems',
    phone: '+39 339 7890123',
    email: 'm.rinaldi@simtelemetry.it',
    badgeCode: 'TECH-07',
    notes: 'Configurazione script emodinamici per shock emorragico',
  },
  {
    id: 'tech-8',
    name: 'Chiara Moretti',
    assignedStations: ['Box Shock Room 2', 'Skills Lab WS2'],
    specialty: 'Ecografia clinica di simulazione e sonde FAST',
    nationality: 'Italiana',
    organization: 'EchoSim Technologies',
    phone: '+39 330 8901234',
    email: 'c.moretti@echosim.it',
    badgeCode: 'TECH-08',
    notes: 'Caricamento clip ecografiche FAST patologiche sui phantom',
  },
  {
    id: 'tech-9',
    name: 'Lorenzo Romano',
    assignedStations: ['Box Shock Room 3', 'Aula Plenaria'],
    specialty: 'Gestione reti di simulazione distribuite e database eventi',
    nationality: 'Italiana',
    organization: 'TraumaNet IT Solutions',
    phone: '+39 331 9012345',
    email: 'l.romano@traumanet.it',
    badgeCode: 'TECH-09',
    notes: 'Supervisione rete LAN e sincronizzazione tablet faculty',
  },
  {
    id: 'tech-10',
    name: 'Francesca De Luca',
    assignedStations: ['Skills Lab WS1', 'Ambiente Tattico 1'],
    specialty: 'Gestione vie aeree difficili, manichini intubazione e cricotiroidotomia',
    nationality: 'Italiana',
    organization: 'Airway Sim Solutions',
    phone: '+39 332 0123456',
    email: 'f.deluca@airwaysim.it',
    badgeCode: 'TECH-10',
    notes: 'Sostituzione inserti tracheali e polmoni artificiali',
  },
  {
    id: 'tech-11',
    name: 'Simone Gallo',
    assignedStations: ['Skills Lab WS2', 'Ambiente Tattico 2'],
    specialty: 'Accessi vascolari ecoguidati, cateterismo venoso centrale e intraosseo',
    nationality: 'Italiana',
    organization: 'Vascular Access Lab',
    phone: '+39 333 1230987',
    email: 's.gallo@vascularlab.it',
    badgeCode: 'TECH-11',
    notes: 'Ricarica vasi artificiali e gel ecografico',
  },
  {
    id: 'tech-12',
    name: 'Martina Rizzo',
    assignedStations: ['Regia Centrale', 'Area Logistica'],
    specialty: 'Logistica generale, controllo inventario presidi e rifornimento sacche sangue',
    nationality: 'Italiana',
    organization: 'SimLogistics Corp',
    phone: '+39 334 2341122',
    email: 'm.rizzo@simlogistics.it',
    badgeCode: 'TECH-12',
    notes: 'Coordinamento turnarounds 15 minuti tra i blocchi formativi',
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
  { id: 1, name: 'ALPHA1', groupId: 'A', facultyId: 'fac-1', color: '#1A73E8', notes: 'Gruppo ALPHA • Squadra ALPHA1 • Amb. Tattico 1 / Box SR 1' },
  { id: 2, name: 'ALPHA2', groupId: 'A', facultyId: 'fac-2', color: '#669DF6', notes: 'Gruppo ALPHA • Squadra ALPHA2 • Amb. Tattico 2 / Box SR 2' },
  { id: 3, name: 'ALPHA3', groupId: 'A', facultyId: 'fac-3', color: '#AECBFA', notes: 'Gruppo ALPHA • Squadra ALPHA3 • Amb. Tattico 3 / Box SR 3' },
  { id: 4, name: 'BETA1', groupId: 'B', facultyId: 'fac-4', color: '#1E8E3E', notes: 'Gruppo BETA • Squadra BETA1 • Amb. Tattico 1 / Box SR 1' },
  { id: 5, name: 'BETA2', groupId: 'B', facultyId: 'fac-5', color: '#5BB974', notes: 'Gruppo BETA • Squadra BETA2 • Amb. Tattico 2 / Box SR 2' },
  { id: 6, name: 'BETA3', groupId: 'B', facultyId: 'fac-6', color: '#A8DAB5', notes: 'Gruppo BETA • Squadra BETA3 • Amb. Tattico 3 / Box SR 3' },
  { id: 7, name: 'CHARLIE1', groupId: 'C', facultyId: 'fac-7', color: '#D97706', notes: 'Gruppo CHARLIE • Squadra CHARLIE1 • Amb. Tattico 1 / Box SR 1' },
  { id: 8, name: 'CHARLIE2', groupId: 'C', facultyId: 'fac-8', color: '#F59E0B', notes: 'Gruppo CHARLIE • Squadra CHARLIE2 • Amb. Tattico 2 / Box SR 2' },
  { id: 9, name: 'CHARLIE3', groupId: 'C', facultyId: 'fac-9', color: '#FBBF24', notes: 'Gruppo CHARLIE • Squadra CHARLIE3 • Amb. Tattico 3 / Box SR 3' },
  { id: 10, name: 'DELTA1', groupId: 'D', facultyId: 'fac-10', color: '#7B1FA2', notes: 'Gruppo DELTA • Squadra DELTA1 • Amb. Tattico 1 / Box SR 1' },
  { id: 11, name: 'DELTA2', groupId: 'D', facultyId: 'fac-11', color: '#AB47BC', notes: 'Gruppo DELTA • Squadra DELTA2 • Amb. Tattico 2 / Box SR 2' },
  { id: 12, name: 'DELTA3', groupId: 'D', facultyId: 'fac-12', color: '#CE93D8', notes: 'Gruppo DELTA • Squadra DELTA3 • Amb. Tattico 3 / Box SR 3' },
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
  const name = `${FIRST_NAMES[idx % FIRST_NAMES.length]} ${LAST_NAMES[idx % LAST_NAMES.length]}`;
  const nationality = NATIONALITIES_POOL[idx % NATIONALITIES_POOL.length];
  const organization = HOSPITALS_POOL[idx % HOSPITALS_POOL.length];
  const emailName = name.toLowerCase().replace(/\s+/g, '.').replace(/[']/g, '');
  
  const roleInTeam = idx % 5;
  const role = roleInTeam === 0 
    ? 'Team Leader / Medico Emergenza' 
    : roleInTeam === 1 
    ? 'Airway Specialist / Anestesista' 
    : roleInTeam === 2 
    ? 'Circulation Specialist / Infermiere' 
    : roleInTeam === 3 
    ? 'Procedural Doctor / Chirurgo' 
    : 'Scribe & Timekeeper / Infermiere Area Critica';

  return {
    id: `disc-${idx + 1}`,
    name,
    role,
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
    dinamicaDelleLesioni: 'Colpito da fuoco ostile in ambiente urbano da cecchino (ferita maxillo-facciale e toraco-ascellare con proiettile ad alta energia).',
    procedureExtra: [
      'Cricotirotomia chirurgica (CRIC)',
      'Decompressiva con ago (ND)'
    ],
    procedureIntra: [
      'Toracostomia con posizionamento drenaggio toracico',
      'Resuscitative Thoracotomy / Resus Thoraco'
    ],
    procedureSpecifiche: [
      'Controllo emorragia ascellare giunzionale con garza emostatica e compressione',
      'Cricotirotomia d\'urgenza per ostruzione da sangue/edema',
      'Toracocentesi decompressiva d\'urgenza'
    ],
    approccioTcccVsShockRoom: 'In TCCC (Ambiente Tattico): Intervento Under Fire / Tactical Field Care, priorità assoluta a emorragia massiva giunzionale e airway chirurgica d\'emergenza prima dell\'estrazione barellata. In Shock Room (ED): Gestione ABCDE avanzata, toracostomia con drenaggio toracico e valutazione per toracotomia di rianimazione (Resus Thoracotomy).',
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
    dinamicaDelleLesioni: 'Esplosione da ordigno a basso potenziale con proiezione di schegge metalliche e trauma diretto da scoppio su arto e torace.',
    procedureExtra: [
      'Drenaggio torace Finger (Toracostomia a dito / Decompressione)',
      'Tourniquet TQ arto superiore + medicazione toracica valvola'
    ],
    procedureIntra: [
      'Resus Thoracotomy',
      'Fissazione e controllo emorragia vascolare avambraccio'
    ],
    procedureSpecifiche: [
      'Applicazione Tourniquet (TQ) alto a monte su arto superiore',
      'Medicazione toracica con valvola (Chest Seal)',
      'Toracostomia a dito (Finger Thoracostomy)'
    ],
    approccioTcccVsShockRoom: 'In TCCC: Controllo immediato dell\'emorragia arteriosa a getto con tourniquet e trattamento del pneumotorace aperto con valvola di flutter. In Shock Room: Stabilizzazione emodinamica, accesso vascolare ecoguidato, trasfusione massiva (MTP) e revisione chirurgica vascolare dell\'avambraccio.',
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
    dinamicaDelleLesioni: 'Calpestamento di mina antiuomo / IED con deflagrazione e distruzione parziale dell\'arto inferiore destro e barotrauma polmonare.',
    procedureExtra: [
      'Drenaggio con ago (Decompressione toracica d\'emergenza)',
      'Amputazione di emergenza / applicazione Tourniquet giunzionale TQ'
    ],
    procedureIntra: [
      'Drenaggio thorax definitivo',
      'Posizionamento catetere REBOA (Zone 1 / Zone 3) per emorragia da amputazione'
    ],
    procedureSpecifiche: [
      'Applicazione di Tourniquet giunzionale e medicazione compressiva per moncone',
      'Decompressione toracica con ago in 2° spazio intercostale',
      'Posizionamento catetere REBOA (Zone 1)'
    ],
    approccioTcccVsShockRoom: 'In TCCC: Controllo del sanguinamento catastrofico da amputazione con TQ d\'emergenza e trattamento del pneumotorace iperteso prima del trasporto. In Shock Room: Inserimento di catetere endovascolare per occlusione aortica (REBOA) per controllo emorragia sottodiaframmatica e stabilizzazione.',
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

// Timeline slots emptied and prepared for new programming
export const INITIAL_TIMELINE_SLOTS: TimelineSlot[] = [
  // ==================== DAY 2 ====================
  {
    id: 'd2-setup-1',
    day: 2,
    period: 'mattina',
    timeRange: '07:30 - 08:00',
    startMinutes: 450,
    durationMinutes: 30,
    title: 'Setup Staff (Fase 1 & 2)',
    description: 'Briefing Staff, check radio (CH1, CH2, CH3) e calibrazione manichini e simulatori.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Briefing Staff & Check Radio', subtitle: 'CH1, CH2, CH3', location: 'Regia & Plenaria' },
      B: { activityType: 'workshop', title: 'Briefing Staff & Check Radio', subtitle: 'CH1, CH2, CH3', location: 'Regia & Plenaria' },
      C: { activityType: 'workshop', title: 'Briefing Staff & Check Radio', subtitle: 'CH1, CH2, CH3', location: 'Regia & Plenaria' },
      D: { activityType: 'workshop', title: 'Briefing Staff & Check Radio', subtitle: 'CH1, CH2, CH3', location: 'Regia & Plenaria' }
    }
  },
  {
    id: 'd2-setup-2',
    day: 2,
    period: 'mattina',
    timeRange: '08:00 - 08:30',
    startMinutes: 480,
    durationMinutes: 30,
    title: 'Setup Staff (Fase 3 & 4)',
    description: 'Allineamento tutor/regia e verifica finale postazioni (GO / NO-GO).',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Verifica Finale Postazioni', subtitle: 'Validazione CH1/CH2', location: 'Ambienti Tattici & SR' },
      B: { activityType: 'workshop', title: 'Verifica Finale Postazioni', subtitle: 'Validazione CH1/CH2', location: 'Ambienti Tattici & SR' },
      C: { activityType: 'workshop', title: 'Verifica Finale Postazioni', subtitle: 'Validazione CH1/CH2', location: 'Ambienti Tattici & SR' },
      D: { activityType: 'workshop', title: 'Verifica Finale Postazioni', subtitle: 'Validazione CH1/CH2', location: 'Ambienti Tattici & SR' }
    }
  },
  {
    id: 'd2-welcome',
    day: 2,
    period: 'mattina',
    timeRange: '08:30 - 08:45',
    startMinutes: 510,
    durationMinutes: 15,
    title: 'Accoglienza Allievi & Patto d\'Aula',
    description: 'Raduno discenti e ricognizione postazioni.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Convocazione Squadre TCCC', subtitle: 'Briefing iniziale', location: 'Aula Plenaria' },
      B: { activityType: 'workshop', title: 'Raduno Aula WS1', subtitle: 'Patto d\'aula', location: 'Aula WS1' },
      C: { activityType: 'workshop', title: 'Convocazione squadre ShockRoomR', subtitle: 'Briefing iniziale', location: 'Box Shock Room' },
      D: { activityType: 'workshop', title: 'Raduno Aula WS2', subtitle: 'Patto d\'aula', location: 'Aula WS2' }
    }
  },
  {
    id: 'd2-prealert-1',
    day: 2,
    period: 'mattina',
    timeRange: '08:45 - 09:00',
    startMinutes: 525,
    durationMinutes: 15,
    title: 'Pre-Alert T-15 Blocco 1',
    description: 'PRE-ALLERTA TCCC e allestimento postazioni a T-15.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'PRE-ALLERTA TCCC', subtitle: 'Ambienti Tattici 1-3', location: 'Ambiente Tattico 1' },
      B: { activityType: 'workshop', title: 'Allestimento WS1', subtitle: 'Preparazione materiale', location: 'Aula WS1' },
      C: { activityType: 'workshop', title: 'Standby SR Box 1-3', subtitle: 'Check presidi', location: 'Box Shock Room 1' },
      D: { activityType: 'workshop', title: 'Allestimento WS2', subtitle: 'Preparazione materiale', location: 'Aula WS2' }
    }
  },
  {
    id: 'd2-b1-tccc',
    day: 2,
    period: 'mattina',
    timeRange: '09:00 - 09:30',
    startMinutes: 540,
    durationMinutes: 30,
    title: 'BLOCCO 1 • Scenario TCCC & WS',
    description: 'Ingaggio TCCC, triage, Stop Bleed (Pz 1-3) / Workshop clinici.',
    groupActivities: {
      A: { activityType: 'scenario_extra', title: 'Scenario TCCC', subtitle: 'Ingaggio / Stop Bleed (Pz 1-3)', location: 'Ambiente Tattico 1', facultyInvolved: ['FAC-01'], patientIds: [1, 2, 3] },
      B: { activityType: 'workshop', title: 'Skills Workshop 1', subtitle: 'Airway & Bleeding', location: 'Aula WS1', facultyInvolved: ['FAC-04'] },
      C: { activityType: 'workshop', title: 'Standby SR (Box 1-3)', subtitle: 'Standby attivo pre-handover', location: 'Box Shock Room 1', facultyInvolved: ['FAC-07'] },
      D: { activityType: 'workshop', title: 'Skills Workshop 2', subtitle: 'Eco FAST & IO', location: 'Aula WS2', facultyInvolved: ['FAC-10'] }
    }
  },
  {
    id: 'd2-b1-handover',
    day: 2,
    period: 'mattina',
    timeRange: '09:30 - 09:35',
    startMinutes: 570,
    durationMinutes: 5,
    title: 'HANDOVER 1:1 (Sovrapposto a Standby SR)',
    description: 'Consegna SBAR barellato (< 5 min) tra TCCC e Shock Room.',
    groupActivities: {
      A: { activityType: 'scenario_extra', title: 'Consegna SBAR', subtitle: '➔ Consegna a CHARLIE', location: 'Ambiente Tattico 1 ➔ Box SR', partnerGroup: 'C' },
      B: { activityType: 'workshop', title: 'WS1 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS1' },
      C: { activityType: 'scenario_intra', title: 'Ricezione SBAR', subtitle: '➔ Ricezione da ALPHA', location: 'Box Shock Room 1', partnerGroup: 'A', patientIds: [1, 2, 3] },
      D: { activityType: 'workshop', title: 'WS2 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS2' }
    }
  },
  {
    id: 'd2-b1-sr',
    day: 2,
    period: 'mattina',
    timeRange: '09:35 - 10:05',
    startMinutes: 575,
    durationMinutes: 30,
    title: 'BLOCCO 1 • Scenario Shock Room & Debrief TCCC',
    description: 'ABCDE avanzato in Shock Room (Pz 1-3) & Debriefing TCCC Parte 1.',
    groupActivities: {
      A: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 1)', subtitle: 'Analisi tattica e triage', location: 'Aula Debriefing 1', facultyInvolved: ['FAC-01'] },
      B: { activityType: 'workshop', title: 'WS1 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS1', facultyInvolved: ['FAC-04'] },
      C: { activityType: 'scenario_intra', title: 'Shock Room ABCDE', subtitle: 'Gestione avanzata Pz 1-3', location: 'Box Shock Room 1', facultyInvolved: ['FAC-07'], patientIds: [1, 2, 3] },
      D: { activityType: 'workshop', title: 'WS2 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS2', facultyInvolved: ['FAC-10'] }
    }
  },
  {
    id: 'd2-b1-debrief-clinico',
    day: 2,
    period: 'mattina',
    timeRange: '10:05 - 10:20',
    startMinutes: 605,
    durationMinutes: 15,
    title: 'Debriefing Clinico SR & TCCC Parte 2',
    description: 'Analisi video NTS, Plus/Delta e chiusura blocco.',
    groupActivities: {
      A: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 2)', subtitle: 'Chiusura report tattico', location: 'Aula Debriefing 1', facultyInvolved: ['FAC-01'] },
      B: { activityType: 'workshop', title: 'WS1 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS1' },
      C: { activityType: 'debriefing', title: 'Debriefing SR Plus/Delta', subtitle: 'Revisione video NTS ≥ 4', location: 'Box Shock Room 1', facultyInvolved: ['FAC-07'] },
      D: { activityType: 'workshop', title: 'WS2 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS2' }
    }
  },
  {
    id: 'd2-b1-reset',
    day: 2,
    period: 'mattina',
    timeRange: '10:20 - 10:35',
    startMinutes: 620,
    durationMinutes: 15,
    title: 'Reset Tecnico Blocco 1',
    description: 'Turnaround 15 min: pulizia Box SR, sanificazione e ripristino presidi.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' },
      B: { activityType: 'workshop', title: 'Riordino WS1', subtitle: 'Ripristino materiale', location: 'Aula WS1' },
      C: { activityType: 'workshop', title: 'RESET Box SR', subtitle: 'TECH-07/08/09 (Pulizia, fluidi, cute)', location: 'Box Shock Room 1' },
      D: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' }
    }
  },
  {
    id: 'd2-pausa-m',
    day: 2,
    period: 'mattina',
    timeRange: '10:35 - 11:05',
    startMinutes: 635,
    durationMinutes: 30,
    title: 'Pausa Caffè + Pre-Alert Blocco 2',
    description: 'Ristoro e transizione alle postazioni.',
    groupActivities: {
      A: { activityType: 'pause', title: 'Pausa Caffè ➔ Ingresso WS2', subtitle: 'Ristoro', location: 'Area Ristoro' },
      B: { activityType: 'pause', title: 'Pausa Caffè ➔ Standby SR', subtitle: 'Check presidi Box 1-3', location: 'Box Shock Room 1' },
      C: { activityType: 'pause', title: 'Pausa Caffè ➔ Ingresso WS1', subtitle: 'Ristoro', location: 'Area Ristoro' },
      D: { activityType: 'pause', title: 'Pausa Caffè ➔ Pre-Alert TCCC', subtitle: 'PRE-ALLERTA TCCC', location: 'Ambiente Tattico' }
    }
  },
  {
    id: 'd2-b2-tccc',
    day: 2,
    period: 'mattina',
    timeRange: '11:05 - 11:35',
    startMinutes: 665,
    durationMinutes: 30,
    title: 'BLOCCO 2 • Scenario TCCC & WS',
    description: 'Emostasi da scoppio, triage (Pz 4-6) / Workshop clinici.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Skills Workshop 2', subtitle: 'Eco FAST & IO', location: 'Aula WS2', facultyInvolved: ['FAC-10'] },
      B: { activityType: 'workshop', title: 'Standby SR (Box 1-3)', subtitle: 'Standby attivo pre-handover', location: 'Box Shock Room 1', facultyInvolved: ['FAC-04'] },
      C: { activityType: 'workshop', title: 'Skills Workshop 1', subtitle: 'Airway & Bleeding', location: 'Aula WS1', facultyInvolved: ['FAC-07'] },
      D: { activityType: 'scenario_extra', title: 'Scenario TCCC', subtitle: 'Ingaggio / Triage (Pz 4-6)', location: 'Ambiente Tattico 2', facultyInvolved: ['FAC-10'], patientIds: [4, 5, 6] }
    }
  },
  {
    id: 'd2-b2-handover',
    day: 2,
    period: 'mattina',
    timeRange: '11:35 - 11:40',
    startMinutes: 695,
    durationMinutes: 5,
    title: 'HANDOVER 1:1 (Sovrapposto a Standby SR)',
    description: 'Consegna SBAR barellato (< 5 min) tra TCCC e Shock Room.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'WS2 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS2' },
      B: { activityType: 'scenario_intra', title: 'Ricezione SBAR', subtitle: '➔ Ricezione da DELTA', location: 'Box Shock Room 1', partnerGroup: 'D', patientIds: [4, 5, 6] },
      C: { activityType: 'workshop', title: 'WS1 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS1' },
      D: { activityType: 'scenario_extra', title: 'Consegna SBAR', subtitle: '➔ Consegna a BRAVO', location: 'Ambiente Tattico 2 ➔ Box SR', partnerGroup: 'B' }
    }
  },
  {
    id: 'd2-b2-sr',
    day: 2,
    period: 'mattina',
    timeRange: '11:40 - 12:10',
    startMinutes: 700,
    durationMinutes: 30,
    title: 'BLOCCO 2 • Scenario Shock Room & Debrief TCCC',
    description: 'Shock emorragico, MTP (Pz 4-6) & Debriefing TCCC Parte 1.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'WS2 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS2' },
      B: { activityType: 'scenario_intra', title: 'Shock Room ABCDE', subtitle: 'Gestione avanzata Pz 4-6', location: 'Box Shock Room 1', facultyInvolved: ['FAC-04'], patientIds: [4, 5, 6] },
      C: { activityType: 'workshop', title: 'WS1 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS1' },
      D: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 1)', subtitle: 'Analisi tattica', location: 'Aula Debriefing 2', facultyInvolved: ['FAC-10'] }
    }
  },
  {
    id: 'd2-b2-debrief-clinico',
    day: 2,
    period: 'mattina',
    timeRange: '12:10 - 12:25',
    startMinutes: 730,
    durationMinutes: 15,
    title: 'Debriefing Clinico SR & TCCC Parte 2',
    description: 'Analisi video NTS, Plus/Delta e chiusura blocco 2.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'WS2 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS2' },
      B: { activityType: 'debriefing', title: 'Debriefing SR Plus/Delta', subtitle: 'Revisione video NTS ≥ 4', location: 'Box Shock Room 1', facultyInvolved: ['FAC-04'] },
      C: { activityType: 'workshop', title: 'WS1 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS1' },
      D: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 2)', subtitle: 'Chiusura report tattico', location: 'Aula Debriefing 2', facultyInvolved: ['FAC-10'] }
    }
  },
  {
    id: 'd2-b2-reset',
    day: 2,
    period: 'mattina',
    timeRange: '12:25 - 12:40',
    startMinutes: 745,
    durationMinutes: 15,
    title: 'Reset Tecnico Blocco 2',
    description: 'Turnaround 15 min: pulizia Box SR e ripristino.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' },
      B: { activityType: 'workshop', title: 'RESET Box SR', subtitle: 'TECH-04/05/06 (Pulizia, fluidi, cute)', location: 'Box Shock Room 1' },
      C: { activityType: 'workshop', title: 'Riordino WS1', subtitle: 'Ripristino materiale', location: 'Aula WS1' },
      D: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' }
    }
  },
  {
    id: 'd2-pranzo',
    day: 2,
    period: 'mattina',
    timeRange: '12:40 - 13:55',
    startMinutes: 760,
    durationMinutes: 75,
    title: 'PAUSA PRANZO PROTETTA',
    description: 'Pausa protetta 75 min. Nessun allertamento.',
    groupActivities: {
      A: { activityType: 'pause', title: 'Pausa Pranzo Protetta', subtitle: 'Ristoro', location: 'Mensa Campus' },
      B: { activityType: 'pause', title: 'Pausa Pranzo Protetta', subtitle: 'Ristoro', location: 'Mensa Campus' },
      C: { activityType: 'pause', title: 'Pausa Pranzo Protetta', subtitle: 'Ristoro', location: 'Mensa Campus' },
      D: { activityType: 'pause', title: 'Pausa Pranzo Protetta', subtitle: 'Ristoro', location: 'Mensa Campus' }
    }
  },
  {
    id: 'd2-prealert-3',
    day: 2,
    period: 'pomeriggio',
    timeRange: '13:55 - 14:10',
    startMinutes: 835,
    durationMinutes: 15,
    title: 'Pre-Alert T-15 Blocco 3',
    description: 'Raduno e PRE-ALLERTA TCCC per Blocco 3.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Raduno Aula WS1', subtitle: 'Briefing pomeridiano', location: 'Aula WS1' },
      B: { activityType: 'workshop', title: 'PRE-ALLERTA TCCC', subtitle: 'Ambienti Tattici', location: 'Ambiente Tattico 2' },
      C: { activityType: 'workshop', title: 'Raduno Aula WS2', subtitle: 'Briefing pomeridiano', location: 'Aula WS2' },
      D: { activityType: 'workshop', title: 'Standby SR Box 1-3', subtitle: 'Check presidi', location: 'Box Shock Room 1' }
    }
  },
  {
    id: 'd2-b3-tccc',
    day: 2,
    period: 'pomeriggio',
    timeRange: '14:10 - 14:40',
    startMinutes: 850,
    durationMinutes: 30,
    title: 'BLOCCO 3 • Scenario TCCC & WS',
    description: 'Ferite penetranti complesse (Pz 7-9) / Workshop clinici.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Skills Workshop 1', subtitle: 'Airway & Bleeding', location: 'Aula WS1', facultyInvolved: ['FAC-01'] },
      B: { activityType: 'scenario_extra', title: 'Scenario TCCC', subtitle: 'Ferite complesse (Pz 7-9)', location: 'Ambiente Tattico 2', facultyInvolved: ['FAC-04'], patientIds: [7, 8, 9] },
      C: { activityType: 'workshop', title: 'Skills Workshop 2', subtitle: 'Eco FAST & IO', location: 'Aula WS2', facultyInvolved: ['FAC-07'] },
      D: { activityType: 'workshop', title: 'Standby SR (Box 1-3)', subtitle: 'Standby attivo pre-handover', location: 'Box Shock Room 1', facultyInvolved: ['FAC-10'] }
    }
  },
  {
    id: 'd2-b3-handover',
    day: 2,
    period: 'pomeriggio',
    timeRange: '14:40 - 14:45',
    startMinutes: 880,
    durationMinutes: 5,
    title: 'HANDOVER 1:1 (Sovrapposto a Standby SR)',
    description: 'Consegna SBAR barellato (< 5 min) tra TCCC e Shock Room.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'WS1 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS1' },
      B: { activityType: 'scenario_extra', title: 'Consegna SBAR', subtitle: '➔ Consegna a DELTA', location: 'Ambiente Tattico 2 ➔ Box SR', partnerGroup: 'D' },
      C: { activityType: 'workshop', title: 'WS2 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS2' },
      D: { activityType: 'scenario_intra', title: 'Ricezione SBAR', subtitle: '➔ Ricezione da BRAVO', location: 'Box Shock Room 1', partnerGroup: 'B', patientIds: [7, 8, 9] }
    }
  },
  {
    id: 'd2-b3-sr',
    day: 2,
    period: 'pomeriggio',
    timeRange: '14:45 - 15:15',
    startMinutes: 885,
    durationMinutes: 30,
    title: 'BLOCCO 3 • Scenario Shock Room & Debrief TCCC',
    description: 'Drenaggio toracico, PNX (Pz 7-9) & Debriefing TCCC Parte 1.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'WS1 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS1' },
      B: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 1)', subtitle: 'Analisi tattica', location: 'Aula Debriefing 2', facultyInvolved: ['FAC-04'] },
      C: { activityType: 'workshop', title: 'WS2 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS2' },
      D: { activityType: 'scenario_intra', title: 'Shock Room ABCDE', subtitle: 'Gestione avanzata Pz 7-9', location: 'Box Shock Room 1', facultyInvolved: ['FAC-10'], patientIds: [7, 8, 9] }
    }
  },
  {
    id: 'd2-b3-debrief-clinico',
    day: 2,
    period: 'pomeriggio',
    timeRange: '15:15 - 15:30',
    startMinutes: 915,
    durationMinutes: 15,
    title: 'Debriefing Clinico SR & TCCC Parte 2',
    description: 'Analisi video NTS, Plus/Delta e chiusura blocco 3.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'WS1 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS1' },
      B: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 2)', subtitle: 'Chiusura report tattico', location: 'Aula Debriefing 2', facultyInvolved: ['FAC-04'] },
      C: { activityType: 'workshop', title: 'WS2 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS2' },
      D: { activityType: 'debriefing', title: 'Debriefing SR Plus/Delta', subtitle: 'Revisione video NTS ≥ 4', location: 'Box Shock Room 1', facultyInvolved: ['FAC-10'] }
    }
  },
  {
    id: 'd2-b3-reset',
    day: 2,
    period: 'pomeriggio',
    timeRange: '15:30 - 15:45',
    startMinutes: 930,
    durationMinutes: 15,
    title: 'Reset Tecnico Blocco 3',
    description: 'Turnaround 15 min: pulizia Box SR e ripristino.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Riordino WS1', subtitle: 'Ripristino materiale', location: 'Aula WS1' },
      B: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' },
      C: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' },
      D: { activityType: 'workshop', title: 'RESET Box SR', subtitle: 'TECH-10/11/12 (Pulizia, fluidi, cute)', location: 'Box Shock Room 1' }
    }
  },
  {
    id: 'd2-pausa-p',
    day: 2,
    period: 'pomeriggio',
    timeRange: '15:45 - 16:10',
    startMinutes: 945,
    durationMinutes: 25,
    title: 'Pausa Pomeridiana + Pre-Alert Blocco 4',
    description: 'Ristoro e transizione (Pre-Alert T-15 alle 15:55).',
    groupActivities: {
      A: { activityType: 'pause', title: 'Pausa ➔ Standby SR Box 1-3', subtitle: 'Check presidi', location: 'Box Shock Room 1' },
      B: { activityType: 'pause', title: 'Pausa ➔ Ingresso WS2', subtitle: 'Ristoro', location: 'Area Ristoro' },
      C: { activityType: 'pause', title: 'Pausa ➔ Pre-Alert TCCC', subtitle: 'PRE-ALLERTA TCCC', location: 'Ambiente Tattico' },
      D: { activityType: 'pause', title: 'Pausa ➔ Ingresso WS1', subtitle: 'Ristoro', location: 'Area Ristoro' }
    }
  },
  {
    id: 'd2-b4-tccc',
    day: 2,
    period: 'pomeriggio',
    timeRange: '16:10 - 16:40',
    startMinutes: 970,
    durationMinutes: 30,
    title: 'BLOCCO 4 • Scenario TCCC & WS',
    description: 'Politrauma maggiore (Pz 10-12) / Workshop clinici.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Standby SR (Box 1-3)', subtitle: 'Standby attivo pre-handover', location: 'Box Shock Room 1', facultyInvolved: ['FAC-01'] },
      B: { activityType: 'workshop', title: 'Skills Workshop 2', subtitle: 'Eco FAST & IO', location: 'Aula WS2', facultyInvolved: ['FAC-04'] },
      C: { activityType: 'scenario_extra', title: 'Scenario TCCC', subtitle: 'Politrauma (Pz 10-12)', location: 'Ambiente Tattico 3', facultyInvolved: ['FAC-07'], patientIds: [10, 11, 12] },
      D: { activityType: 'workshop', title: 'Skills Workshop 1', subtitle: 'Airway & Bleeding', location: 'Aula WS1', facultyInvolved: ['FAC-10'] }
    }
  },
  {
    id: 'd2-b4-handover',
    day: 2,
    period: 'pomeriggio',
    timeRange: '16:40 - 16:45',
    startMinutes: 1000,
    durationMinutes: 5,
    title: 'HANDOVER 1:1 (Sovrapposto a Standby SR)',
    description: 'Consegna SBAR barellato (< 5 min) tra TCCC e Shock Room.',
    groupActivities: {
      A: { activityType: 'scenario_intra', title: 'Ricezione SBAR', subtitle: '➔ Ricezione da CHARLIE', location: 'Box Shock Room 1', partnerGroup: 'C', patientIds: [10, 11, 12] },
      B: { activityType: 'workshop', title: 'WS2 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS2' },
      C: { activityType: 'scenario_extra', title: 'Consegna SBAR', subtitle: '➔ Consegna ad ALPHA', location: 'Ambiente Tattico 3 ➔ Box SR', partnerGroup: 'A' },
      D: { activityType: 'workshop', title: 'WS1 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS1' }
    }
  },
  {
    id: 'd2-b4-sr',
    day: 2,
    period: 'pomeriggio',
    timeRange: '16:45 - 17:15',
    startMinutes: 1005,
    durationMinutes: 30,
    title: 'BLOCCO 4 • Scenario Shock Room & Debrief TCCC',
    description: 'Arresto traumatico, MTP (Pz 10-12) & Debriefing TCCC Parte 1.',
    groupActivities: {
      A: { activityType: 'scenario_intra', title: 'Shock Room ABCDE', subtitle: 'Gestione avanzata Pz 10-12', location: 'Box Shock Room 1', facultyInvolved: ['FAC-01'], patientIds: [10, 11, 12] },
      B: { activityType: 'workshop', title: 'WS2 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS2' },
      C: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 1)', subtitle: 'Analisi tattica', location: 'Aula Debriefing 3', facultyInvolved: ['FAC-07'] },
      D: { activityType: 'workshop', title: 'WS1 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS1' }
    }
  },
  {
    id: 'd2-b4-debrief-clinico',
    day: 2,
    period: 'pomeriggio',
    timeRange: '17:15 - 17:30',
    startMinutes: 1035,
    durationMinutes: 15,
    title: 'Debriefing Clinico SR & TCCC Parte 2',
    description: 'Analisi video NTS, Plus/Delta e chiusura blocco 4.',
    groupActivities: {
      A: { activityType: 'debriefing', title: 'Debriefing SR Plus/Delta', subtitle: 'Revisione video NTS ≥ 4', location: 'Box Shock Room 1', facultyInvolved: ['FAC-01'] },
      B: { activityType: 'workshop', title: 'WS2 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS2' },
      C: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 2)', subtitle: 'Chiusura report tattico', location: 'Aula Debriefing 3', facultyInvolved: ['FAC-07'] },
      D: { activityType: 'workshop', title: 'WS1 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS1' }
    }
  },
  {
    id: 'd2-b4-reset',
    day: 2,
    period: 'pomeriggio',
    timeRange: '17:30 - 17:45',
    startMinutes: 1050,
    durationMinutes: 15,
    title: 'Reset Finale Blocco 4',
    description: 'Turnaround finale: sanificazione e chiusura postazioni.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'RESET Box SR', subtitle: 'TECH-01/02/03 (Sanificazione finale)', location: 'Box Shock Room 1' },
      B: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' },
      C: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' },
      D: { activityType: 'workshop', title: 'Riordino WS1', subtitle: 'Ripristino materiale', location: 'Aula WS1' }
    }
  },
  {
    id: 'd2-chiusura',
    day: 2,
    period: 'pomeriggio',
    timeRange: '17:45 - 18:00',
    startMinutes: 1065,
    durationMinutes: 15,
    title: 'Chiusura Plenaria Day 2',
    description: 'Debriefing collegiale & feedback generale della giornata.',
    groupActivities: {
      A: { activityType: 'debriefing', title: 'Debriefing Collegiale', subtitle: 'Restituzione generale', location: 'Aula Plenaria' },
      B: { activityType: 'debriefing', title: 'Debriefing Collegiale', subtitle: 'Restituzione generale', location: 'Aula Plenaria' },
      C: { activityType: 'debriefing', title: 'Debriefing Collegiale', subtitle: 'Restituzione generale', location: 'Aula Plenaria' },
      D: { activityType: 'debriefing', title: 'Debriefing Collegiale', subtitle: 'Restituzione generale', location: 'Aula Plenaria' }
    }
  },

  // ==================== DAY 3 ====================
  {
    id: 'd3-setup-1',
    day: 3,
    period: 'mattina',
    timeRange: '07:30 - 08:00',
    startMinutes: 450,
    durationMinutes: 30,
    title: 'Setup Staff (Fase 1 & 2)',
    description: 'Briefing Staff, check radio e calibrazione manichini Day 3.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Briefing Staff & Check Radio', subtitle: 'CH1, CH2, CH3', location: 'Regia & Plenaria' },
      B: { activityType: 'workshop', title: 'Briefing Staff & Check Radio', subtitle: 'CH1, CH2, CH3', location: 'Regia & Plenaria' },
      C: { activityType: 'workshop', title: 'Briefing Staff & Check Radio', subtitle: 'CH1, CH2, CH3', location: 'Regia & Plenaria' },
      D: { activityType: 'workshop', title: 'Briefing Staff & Check Radio', subtitle: 'CH1, CH2, CH3', location: 'Regia & Plenaria' }
    }
  },
  {
    id: 'd3-setup-2',
    day: 3,
    period: 'mattina',
    timeRange: '08:00 - 08:30',
    startMinutes: 480,
    durationMinutes: 30,
    title: 'Setup Staff (Fase 3 & 4)',
    description: 'Allineamento tutor/regia e verifica finale postazioni Day 3.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Verifica Finale Postazioni', subtitle: 'Validazione CH1/CH2', location: 'Ambienti Tattici & SR' },
      B: { activityType: 'workshop', title: 'Verifica Finale Postazioni', subtitle: 'Validazione CH1/CH2', location: 'Ambienti Tattici & SR' },
      C: { activityType: 'workshop', title: 'Verifica Finale Postazioni', subtitle: 'Validazione CH1/CH2', location: 'Ambienti Tattici & SR' },
      D: { activityType: 'workshop', title: 'Verifica Finale Postazioni', subtitle: 'Validazione CH1/CH2', location: 'Ambienti Tattici & SR' }
    }
  },
  {
    id: 'd3-welcome',
    day: 3,
    period: 'mattina',
    timeRange: '08:30 - 08:45',
    startMinutes: 510,
    durationMinutes: 15,
    title: 'Accoglienza Allievi & Briefing Day 3',
    description: 'Raduno discenti e ricognizione rotazione speculare.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Raduno Aula WS2', subtitle: 'Briefing Day 3', location: 'Aula WS2' },
      B: { activityType: 'workshop', title: 'Ricognizione Tattica', subtitle: 'Check postazioni', location: 'Ambiente Tattico' },
      C: { activityType: 'workshop', title: 'Raduno Aula WS1', subtitle: 'Briefing Day 3', location: 'Aula WS1' },
      D: { activityType: 'workshop', title: 'Ricognizione SR Box 1-3', subtitle: 'Check presidi', location: 'Box Shock Room' }
    }
  },
  {
    id: 'd3-prealert-1',
    day: 3,
    period: 'mattina',
    timeRange: '08:45 - 09:00',
    startMinutes: 525,
    durationMinutes: 15,
    title: 'Pre-Alert T-15 Blocco 1 (Day 3)',
    description: 'Allestimento e PRE-ALLERTA TCCC per rotazione speculare Day 3.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Allestimento WS2', subtitle: 'Preparazione materiale', location: 'Aula WS2' },
      B: { activityType: 'workshop', title: 'PRE-ALLERTA TCCC', subtitle: 'Ambienti Tattici', location: 'Ambiente Tattico' },
      C: { activityType: 'workshop', title: 'Allestimento WS1', subtitle: 'Preparazione materiale', location: 'Aula WS1' },
      D: { activityType: 'workshop', title: 'Standby SR Box 1-3', subtitle: 'Check presidi', location: 'Box Shock Room 1' }
    }
  },
  {
    id: 'd3-b1-tccc',
    day: 3,
    period: 'mattina',
    timeRange: '09:00 - 09:30',
    startMinutes: 540,
    durationMinutes: 30,
    title: 'BLOCCO 1 • Scenario TCCC & WS (Day 3)',
    description: 'Tamponamento cardiaco, triage (Pz 13-15) / Workshop clinici.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Skills Workshop 2', subtitle: 'Eco FAST & IO', location: 'Aula WS2', facultyInvolved: ['FAC-01'] },
      B: { activityType: 'scenario_extra', title: 'Scenario TCCC', subtitle: 'Ingaggio / Triage (Pz 13-15)', location: 'Ambiente Tattico 1', facultyInvolved: ['FAC-04'], patientIds: [13, 14, 15] },
      C: { activityType: 'workshop', title: 'Skills Workshop 1', subtitle: 'Airway & Bleeding', location: 'Aula WS1', facultyInvolved: ['FAC-07'] },
      D: { activityType: 'workshop', title: 'Standby SR (Box 1-3)', subtitle: 'Standby attivo pre-handover', location: 'Box Shock Room 1', facultyInvolved: ['FAC-10'] }
    }
  },
  {
    id: 'd3-b1-handover',
    day: 3,
    period: 'mattina',
    timeRange: '09:30 - 09:35',
    startMinutes: 570,
    durationMinutes: 5,
    title: 'HANDOVER 1:1 (Sovrapposto a Standby SR)',
    description: 'Consegna SBAR barellato (< 5 min) tra TCCC e Shock Room.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'WS2 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS2' },
      B: { activityType: 'scenario_extra', title: 'Consegna SBAR', subtitle: '➔ Consegna a DELTA', location: 'Ambiente Tattico 1 ➔ Box SR', partnerGroup: 'D' },
      C: { activityType: 'workshop', title: 'WS1 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS1' },
      D: { activityType: 'scenario_intra', title: 'Ricezione SBAR', subtitle: '➔ Ricezione da BRAVO', location: 'Box Shock Room 1', partnerGroup: 'B', patientIds: [13, 14, 15] }
    }
  },
  {
    id: 'd3-b1-sr',
    day: 3,
    period: 'mattina',
    timeRange: '09:35 - 10:05',
    startMinutes: 575,
    durationMinutes: 30,
    title: 'BLOCCO 1 • Scenario Shock Room & Debrief TCCC (Day 3)',
    description: 'REBOA Z3, pelvi (Pz 13-15) & Debriefing TCCC Parte 1.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'WS2 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS2' },
      B: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 1)', subtitle: 'Analisi tattica', location: 'Aula Debriefing 2', facultyInvolved: ['FAC-04'] },
      C: { activityType: 'workshop', title: 'WS1 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS1' },
      D: { activityType: 'scenario_intra', title: 'Shock Room ABCDE', subtitle: 'Gestione avanzata Pz 13-15', location: 'Box Shock Room 1', facultyInvolved: ['FAC-10'], patientIds: [13, 14, 15] }
    }
  },
  {
    id: 'd3-b1-debrief-clinico',
    day: 3,
    period: 'mattina',
    timeRange: '10:05 - 10:20',
    startMinutes: 605,
    durationMinutes: 15,
    title: 'Debriefing Clinico SR & TCCC Parte 2 (Day 3)',
    description: 'Analisi video NTS, Plus/Delta e chiusura blocco 1.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'WS2 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS2' },
      B: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 2)', subtitle: 'Chiusura report tattico', location: 'Aula Debriefing 2', facultyInvolved: ['FAC-04'] },
      C: { activityType: 'workshop', title: 'WS1 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS1' },
      D: { activityType: 'debriefing', title: 'Debriefing SR Plus/Delta', subtitle: 'Revisione video NTS ≥ 4', location: 'Box Shock Room 1', facultyInvolved: ['FAC-10'] }
    }
  },
  {
    id: 'd3-b1-reset',
    day: 3,
    period: 'mattina',
    timeRange: '10:20 - 10:35',
    startMinutes: 620,
    durationMinutes: 15,
    title: 'Reset Tecnico Blocco 1 (Day 3)',
    description: 'Turnaround 15 min: pulizia Box SR e ripristino.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' },
      B: { activityType: 'workshop', title: 'Riordino WS1', subtitle: 'Ripristino materiale', location: 'Aula WS1' },
      C: { activityType: 'workshop', title: 'Riordino WS1', subtitle: 'Ripristino materiale', location: 'Aula WS1' },
      D: { activityType: 'workshop', title: 'RESET Box SR', subtitle: 'TECH-10/11/12 (Pulizia, fluidi, cute)', location: 'Box Shock Room 1' }
    }
  },
  {
    id: 'd3-pausa-m',
    day: 3,
    period: 'mattina',
    timeRange: '10:35 - 11:05',
    startMinutes: 635,
    durationMinutes: 30,
    title: 'Pausa Caffè + Pre-Alert Blocco 2 (Day 3)',
    description: 'Ristoro e transizione.',
    groupActivities: {
      A: { activityType: 'pause', title: 'Pausa Caffè ➔ Standby SR', subtitle: 'Check presidi Box 1-3', location: 'Box Shock Room 1' },
      B: { activityType: 'pause', title: 'Pausa Caffè ➔ Ingresso WS1', subtitle: 'Ristoro', location: 'Area Ristoro' },
      C: { activityType: 'pause', title: 'Pausa Caffè ➔ Pre-Alert TCCC', subtitle: 'PRE-ALLERTA TCCC', location: 'Ambiente Tattico' },
      D: { activityType: 'pause', title: 'Pausa Caffè ➔ Ingresso WS2', subtitle: 'Ristoro', location: 'Area Ristoro' }
    }
  },
  {
    id: 'd3-b2-tccc',
    day: 3,
    period: 'mattina',
    timeRange: '11:05 - 11:35',
    startMinutes: 665,
    durationMinutes: 30,
    title: 'BLOCCO 2 • Scenario TCCC & WS (Day 3)',
    description: 'Pericardiocentesi, triage (Pz 16-18) / Workshop clinici.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Standby SR (Box 1-3)', subtitle: 'Standby attivo pre-handover', location: 'Box Shock Room 1', facultyInvolved: ['FAC-01'] },
      B: { activityType: 'workshop', title: 'Skills Workshop 1', subtitle: 'Airway & Bleeding', location: 'Aula WS1', facultyInvolved: ['FAC-04'] },
      C: { activityType: 'scenario_extra', title: 'Scenario TCCC', subtitle: 'Ingaggio / Triage (Pz 16-18)', location: 'Ambiente Tattico 2', facultyInvolved: ['FAC-07'], patientIds: [16, 17, 18] },
      D: { activityType: 'workshop', title: 'Skills Workshop 2', subtitle: 'Eco FAST & IO', location: 'Aula WS2', facultyInvolved: ['FAC-10'] }
    }
  },
  {
    id: 'd3-b2-handover',
    day: 3,
    period: 'mattina',
    timeRange: '11:35 - 11:40',
    startMinutes: 695,
    durationMinutes: 5,
    title: 'HANDOVER 1:1 (Sovrapposto a Standby SR)',
    description: 'Consegna SBAR barellato (< 5 min) tra TCCC e Shock Room.',
    groupActivities: {
      A: { activityType: 'scenario_intra', title: 'Ricezione SBAR', subtitle: '➔ Ricezione da CHARLIE', location: 'Box Shock Room 1', partnerGroup: 'C', patientIds: [16, 17, 18] },
      B: { activityType: 'workshop', title: 'WS1 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS1' },
      C: { activityType: 'scenario_extra', title: 'Consegna SBAR', subtitle: '➔ Consegna ad ALPHA', location: 'Ambiente Tattico 2 ➔ Box SR', partnerGroup: 'A' },
      D: { activityType: 'workshop', title: 'WS2 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS2' }
    }
  },
  {
    id: 'd3-b2-sr',
    day: 3,
    period: 'mattina',
    timeRange: '11:40 - 12:10',
    startMinutes: 700,
    durationMinutes: 30,
    title: 'BLOCCO 2 • Scenario Shock Room & Debrief TCCC (Day 3)',
    description: 'REBOA Z3, MTP 1:1:1 (Pz 16-18) & Debriefing TCCC Parte 1.',
    groupActivities: {
      A: { activityType: 'scenario_intra', title: 'Shock Room ABCDE', subtitle: 'Gestione avanzata Pz 16-18', location: 'Box Shock Room 1', facultyInvolved: ['FAC-01'], patientIds: [16, 17, 18] },
      B: { activityType: 'workshop', title: 'WS1 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS1' },
      C: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 1)', subtitle: 'Analisi tattica', location: 'Aula Debriefing 3', facultyInvolved: ['FAC-07'] },
      D: { activityType: 'workshop', title: 'WS2 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS2' }
    }
  },
  {
    id: 'd3-b2-debrief-clinico',
    day: 3,
    period: 'mattina',
    timeRange: '12:10 - 12:25',
    startMinutes: 730,
    durationMinutes: 15,
    title: 'Debriefing Clinico SR & TCCC Parte 2 (Day 3)',
    description: 'Analisi video NTS, Plus/Delta e chiusura blocco 2.',
    groupActivities: {
      A: { activityType: 'debriefing', title: 'Debriefing SR Plus/Delta', subtitle: 'Revisione video NTS ≥ 4', location: 'Box Shock Room 1', facultyInvolved: ['FAC-01'] },
      B: { activityType: 'workshop', title: 'WS1 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS1' },
      C: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 2)', subtitle: 'Chiusura report tattico', location: 'Aula Debriefing 3', facultyInvolved: ['FAC-07'] },
      D: { activityType: 'workshop', title: 'WS2 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS2' }
    }
  },
  {
    id: 'd3-b2-reset',
    day: 3,
    period: 'mattina',
    timeRange: '12:25 - 12:40',
    startMinutes: 745,
    durationMinutes: 15,
    title: 'Reset Tecnico Blocco 2 (Day 3)',
    description: 'Turnaround 15 min: pulizia Box SR e ripristino.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'RESET Box SR', subtitle: 'TECH-01/02/03 (Pulizia, fluidi, cute)', location: 'Box Shock Room 1' },
      B: { activityType: 'workshop', title: 'Riordino WS1', subtitle: 'Ripristino materiale', location: 'Aula WS1' },
      C: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' },
      D: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' }
    }
  },
  {
    id: 'd3-pranzo',
    day: 3,
    period: 'mattina',
    timeRange: '12:40 - 13:55',
    startMinutes: 760,
    durationMinutes: 75,
    title: 'PAUSA PRANZO PROTETTA (Day 3)',
    description: 'Pausa protetta 75 min. Nessun allertamento.',
    groupActivities: {
      A: { activityType: 'pause', title: 'Pausa Pranzo Protetta', subtitle: 'Ristoro', location: 'Mensa Campus' },
      B: { activityType: 'pause', title: 'Pausa Pranzo Protetta', subtitle: 'Ristoro', location: 'Mensa Campus' },
      C: { activityType: 'pause', title: 'Pausa Pranzo Protetta', subtitle: 'Ristoro', location: 'Mensa Campus' },
      D: { activityType: 'pause', title: 'Pausa Pranzo Protetta', subtitle: 'Ristoro', location: 'Mensa Campus' }
    }
  },
  {
    id: 'd3-prealert-3',
    day: 3,
    period: 'pomeriggio',
    timeRange: '13:55 - 14:10',
    startMinutes: 835,
    durationMinutes: 15,
    title: 'Pre-Alert T-15 Blocco 3 (Day 3)',
    description: 'Raduno e PRE-ALLERTA TCCC per Blocco 3.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'PRE-ALLERTA TCCC', subtitle: 'Ambienti Tattici', location: 'Ambiente Tattico 1' },
      B: { activityType: 'workshop', title: 'Raduno Aula WS2', subtitle: 'Briefing pomeridiano', location: 'Aula WS2' },
      C: { activityType: 'workshop', title: 'Standby SR Box 1-3', subtitle: 'Check presidi', location: 'Box Shock Room 1' },
      D: { activityType: 'workshop', title: 'Raduno Aula WS1', subtitle: 'Briefing pomeridiano', location: 'Aula WS1' }
    }
  },
  {
    id: 'd3-b3-tccc',
    day: 3,
    period: 'pomeriggio',
    timeRange: '14:10 - 14:40',
    startMinutes: 850,
    durationMinutes: 30,
    title: 'BLOCCO 3 • Scenario TCCC & WS (Day 3)',
    description: 'Escarotomia, Parkland (Pz 19-21) / Workshop clinici.',
    groupActivities: {
      A: { activityType: 'scenario_extra', title: 'Scenario TCCC', subtitle: 'Ingaggio / Triage (Pz 19-21)', location: 'Ambiente Tattico 1', facultyInvolved: ['FAC-01'], patientIds: [19, 20, 21] },
      B: { activityType: 'workshop', title: 'Skills Workshop 2', subtitle: 'Eco FAST & IO', location: 'Aula WS2', facultyInvolved: ['FAC-04'] },
      C: { activityType: 'workshop', title: 'Standby SR (Box 1-3)', subtitle: 'Standby attivo pre-handover', location: 'Box Shock Room 1', facultyInvolved: ['FAC-07'] },
      D: { activityType: 'workshop', title: 'Skills Workshop 1', subtitle: 'Airway & Bleeding', location: 'Aula WS1', facultyInvolved: ['FAC-10'] }
    }
  },
  {
    id: 'd3-b3-handover',
    day: 3,
    period: 'pomeriggio',
    timeRange: '14:40 - 14:45',
    startMinutes: 880,
    durationMinutes: 5,
    title: 'HANDOVER 1:1 (Sovrapposto a Standby SR)',
    description: 'Consegna SBAR barellato (< 5 min) tra TCCC e Shock Room.',
    groupActivities: {
      A: { activityType: 'scenario_extra', title: 'Consegna SBAR', subtitle: '➔ Consegna a CHARLIE', location: 'Ambiente Tattico 1 ➔ Box SR', partnerGroup: 'C' },
      B: { activityType: 'workshop', title: 'WS2 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS2' },
      C: { activityType: 'scenario_intra', title: 'Ricezione SBAR', subtitle: '➔ Ricezione da ALPHA', location: 'Box Shock Room 1', partnerGroup: 'A', patientIds: [19, 20, 21] },
      D: { activityType: 'workshop', title: 'WS1 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS1' }
    }
  },
  {
    id: 'd3-b3-sr',
    day: 3,
    period: 'pomeriggio',
    timeRange: '14:45 - 15:15',
    startMinutes: 885,
    durationMinutes: 30,
    title: 'BLOCCO 3 • Scenario Shock Room & Debrief TCCC (Day 3)',
    description: 'REBOA Z1, ustioni (Pz 19-21) & Debriefing TCCC Parte 1.',
    groupActivities: {
      A: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 1)', subtitle: 'Analisi tattica', location: 'Aula Debriefing 1', facultyInvolved: ['FAC-01'] },
      B: { activityType: 'workshop', title: 'WS2 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS2' },
      C: { activityType: 'scenario_intra', title: 'Shock Room ABCDE', subtitle: 'Gestione avanzata Pz 19-21', location: 'Box Shock Room 1', facultyInvolved: ['FAC-07'], patientIds: [19, 20, 21] },
      D: { activityType: 'workshop', title: 'WS1 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS1' }
    }
  },
  {
    id: 'd3-b3-debrief-clinico',
    day: 3,
    period: 'pomeriggio',
    timeRange: '15:15 - 15:30',
    startMinutes: 915,
    durationMinutes: 15,
    title: 'Debriefing Clinico SR & TCCC Parte 2 (Day 3)',
    description: 'Analisi video NTS, Plus/Delta e chiusura blocco 3.',
    groupActivities: {
      A: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 2)', subtitle: 'Chiusura report tattico', location: 'Aula Debriefing 1', facultyInvolved: ['FAC-01'] },
      B: { activityType: 'workshop', title: 'WS2 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS2' },
      C: { activityType: 'debriefing', title: 'Debriefing SR Plus/Delta', subtitle: 'Revisione video NTS ≥ 4', location: 'Box Shock Room 1', facultyInvolved: ['FAC-07'] },
      D: { activityType: 'workshop', title: 'WS1 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS1' }
    }
  },
  {
    id: 'd3-b3-reset',
    day: 3,
    period: 'pomeriggio',
    timeRange: '15:30 - 15:45',
    startMinutes: 930,
    durationMinutes: 15,
    title: 'Reset Tecnico Blocco 3 (Day 3)',
    description: 'Turnaround 15 min: pulizia Box SR e ripristino.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Riordino WS1', subtitle: 'Ripristino materiale', location: 'Aula WS1' },
      B: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' },
      C: { activityType: 'workshop', title: 'RESET Box SR', subtitle: 'TECH-07/08/09 (Pulizia, fluidi, cute)', location: 'Box Shock Room 1' },
      D: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' }
    }
  },
  {
    id: 'd3-pausa-p',
    day: 3,
    period: 'pomeriggio',
    timeRange: '15:45 - 16:10',
    startMinutes: 945,
    durationMinutes: 25,
    title: 'Pausa Pomeridiana + Pre-Alert Blocco 4 (Day 3)',
    description: 'Ristoro e transizione.',
    groupActivities: {
      A: { activityType: 'pause', title: 'Pausa ➔ Ingresso WS1', subtitle: 'Ristoro', location: 'Area Ristoro' },
      B: { activityType: 'pause', title: 'Pausa ➔ Standby SR Box 1-3', subtitle: 'Check presidi', location: 'Box Shock Room 1' },
      C: { activityType: 'pause', title: 'Pausa ➔ Ingresso WS2', subtitle: 'Ristoro', location: 'Area Ristoro' },
      D: { activityType: 'pause', title: 'Pausa ➔ Pre-Alert TCCC', subtitle: 'PRE-ALLERTA TCCC', location: 'Ambiente Tattico' }
    }
  },
  {
    id: 'd3-b4-tccc',
    day: 3,
    period: 'pomeriggio',
    timeRange: '16:10 - 16:40',
    startMinutes: 970,
    durationMinutes: 30,
    title: 'BLOCCO 4 • Scenario TCCC & WS (Day 3)',
    description: 'Amputazioni bilaterali, triage (Pz 22-24) / Workshop clinici.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Skills Workshop 1', subtitle: 'Airway & Bleeding', location: 'Aula WS1', facultyInvolved: ['FAC-01'] },
      B: { activityType: 'workshop', title: 'Standby SR (Box 1-3)', subtitle: 'Standby attivo pre-handover', location: 'Box Shock Room 1', facultyInvolved: ['FAC-04'] },
      C: { activityType: 'workshop', title: 'Skills Workshop 2', subtitle: 'Eco FAST & IO', location: 'Aula WS2', facultyInvolved: ['FAC-07'] },
      D: { activityType: 'scenario_extra', title: 'Scenario TCCC', subtitle: 'Ingaggio / Triage (Pz 22-24)', location: 'Ambiente Tattico 3', facultyInvolved: ['FAC-10'], patientIds: [22, 23, 24] }
    }
  },
  {
    id: 'd3-b4-handover',
    day: 3,
    period: 'pomeriggio',
    timeRange: '16:40 - 16:45',
    startMinutes: 1000,
    durationMinutes: 5,
    title: 'HANDOVER 1:1 (Sovrapposto a Standby SR)',
    description: 'Consegna SBAR barellato (< 5 min) tra TCCC e Shock Room.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'WS1 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS1' },
      B: { activityType: 'scenario_intra', title: 'Ricezione SBAR', subtitle: '➔ Ricezione da DELTA', location: 'Box Shock Room 1', partnerGroup: 'D', patientIds: [22, 23, 24] },
      C: { activityType: 'workshop', title: 'WS2 (Continua)', subtitle: 'Pratica avanzata', location: 'Aula WS2' },
      D: { activityType: 'scenario_extra', title: 'Consegna SBAR', subtitle: '➔ Consegna a BRAVO', location: 'Ambiente Tattico 3 ➔ Box SR', partnerGroup: 'B' }
    }
  },
  {
    id: 'd3-b4-sr',
    day: 3,
    period: 'pomeriggio',
    timeRange: '16:45 - 17:15',
    startMinutes: 1005,
    durationMinutes: 30,
    title: 'BLOCCO 4 • Scenario Shock Room & Debrief TCCC (Day 3)',
    description: 'Arresto traumatico (Pz 22-24) & Debriefing TCCC Parte 1.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'WS1 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS1' },
      B: { activityType: 'scenario_intra', title: 'Shock Room ABCDE', subtitle: 'Gestione avanzata Pz 22-24', location: 'Box Shock Room 1', facultyInvolved: ['FAC-04'], patientIds: [22, 23, 24] },
      C: { activityType: 'workshop', title: 'WS2 (Feedback)', subtitle: 'Valutazione tecnica', location: 'Aula WS2' },
      D: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 1)', subtitle: 'Analisi tattica', location: 'Aula Debriefing 3', facultyInvolved: ['FAC-10'] }
    }
  },
  {
    id: 'd3-b4-debrief-clinico',
    day: 3,
    period: 'pomeriggio',
    timeRange: '17:15 - 17:30',
    startMinutes: 1035,
    durationMinutes: 15,
    title: 'Debriefing Clinico SR & TCCC Parte 2 (Day 3)',
    description: 'Analisi video NTS, Plus/Delta e chiusura blocco 4.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'WS1 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS1' },
      B: { activityType: 'debriefing', title: 'Debriefing SR Plus/Delta', subtitle: 'Revisione video NTS ≥ 4', location: 'Box Shock Room 1', facultyInvolved: ['FAC-04'] },
      C: { activityType: 'workshop', title: 'WS2 Feedback', subtitle: 'Debriefing workshop', location: 'Aula WS2' },
      D: { activityType: 'debriefing', title: 'Debriefing TCCC (Pt 2)', subtitle: 'Chiusura report tattico', location: 'Aula Debriefing 3', facultyInvolved: ['FAC-10'] }
    }
  },
  {
    id: 'd3-b4-reset',
    day: 3,
    period: 'pomeriggio',
    timeRange: '17:30 - 17:45',
    startMinutes: 1050,
    durationMinutes: 15,
    title: 'Reset Finale Blocco 4 (Day 3)',
    description: 'Turnaround finale: sanificazione e chiusura postazioni.',
    groupActivities: {
      A: { activityType: 'workshop', title: 'Riordino WS1', subtitle: 'Ripristino materiale', location: 'Aula WS1' },
      B: { activityType: 'workshop', title: 'RESET Box SR', subtitle: 'TECH-04/05/06 (Sanificazione finale)', location: 'Box Shock Room 1' },
      C: { activityType: 'workshop', title: 'Riordino WS2', subtitle: 'Ripristino materiale', location: 'Aula WS2' },
      D: { activityType: 'workshop', title: 'Riordino WS1', subtitle: 'Ripristino materiale', location: 'Aula WS1' }
    }
  },
  {
    id: 'd3-chiusura',
    day: 3,
    period: 'pomeriggio',
    timeRange: '17:45 - 18:00',
    startMinutes: 1065,
    durationMinutes: 15,
    title: 'Chiusura Plenaria & Consegna Attestati',
    description: 'Debriefing collegiale finale, restituzione clinica e chiusura corso.',
    groupActivities: {
      A: { activityType: 'debriefing', title: 'Chiusura Corso & Attestati', subtitle: 'Plenaria finale', location: 'Aula Magna' },
      B: { activityType: 'debriefing', title: 'Chiusura Corso & Attestati', subtitle: 'Plenaria finale', location: 'Aula Magna' },
      C: { activityType: 'debriefing', title: 'Chiusura Corso & Attestati', subtitle: 'Plenaria finale', location: 'Aula Magna' },
      D: { activityType: 'debriefing', title: 'Chiusura Corso & Attestati', subtitle: 'Plenaria finale', location: 'Aula Magna' }
    }
  }
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
