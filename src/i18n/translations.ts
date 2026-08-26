export type Language = 'en' | 'it';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    it: string;
  };
}

export const translations = {
  // Brand & Header
  appTitle: {
    en: 'INTUBATI EM • TRAUMA SIMULATION DIRECTOR',
    it: 'INTUBATI EM • DIRETTORE SIMULAZIONE TRAUMA',
  },
  appSubtitle: {
    en: 'Advanced Trauma Management Day 02 & Day 03 • Global Health Educators',
    it: 'Gestione Avanzata del Trauma Giorno 02 & Giorno 03 • Global Health Educators',
  },
  brandName: {
    en: 'INTUBATI EM',
    it: 'INTUBATI EM',
  },
  brandTagline: {
    en: 'Global Health Educators • Advanced Trauma & Emergency Training',
    it: 'Global Health Educators • Formazione Avanzata Trauma & Emergenza',
  },
  accreditedCenter: {
    en: 'Accredited Center • Royal College of Surgeons Standards',
    it: 'Centro Accreditato • Standard Royal College of Surgeons',
  },
  basesLocation: {
    en: 'Rome (IT) 🇮🇹 & Florida (US) 🇺🇸',
    it: 'Roma (IT) 🇮🇹 & Florida (US) 🇺🇸',
  },

  // Language Switcher
  langToggleLabel: {
    en: 'Language: English (EN)',
    it: 'Lingua: Italiano (IT)',
  },
  switchLanguage: {
    en: 'Switch to Italian',
    it: "Passa all'Inglese",
  },

  // Roles
  rolePublic: {
    en: 'Shared Screen',
    it: 'Condivisa',
  },
  roleDiscente: {
    en: 'Learner',
    it: 'Discente',
  },
  roleTecnico: {
    en: 'Technician',
    it: 'Tecnico',
  },
  roleFaculty: {
    en: 'Faculty Tutor',
    it: 'Faculty Tutor',
  },
  roleDirettore: {
    en: 'Director',
    it: 'Direttore',
  },
  roleOspite: {
    en: 'VIP Guest',
    it: 'Ospite / VIP',
  },

  // Navigation & Tabs
  day2: {
    en: 'Day 2',
    it: 'Giorno 2',
  },
  day3: {
    en: 'Day 3',
    it: 'Giorno 3',
  },
  liveTimeline: {
    en: 'Live Timeline',
    it: 'Timeline Live',
  },
  patientChecklist: {
    en: 'Patient Checklist',
    it: 'Checklist Pazienti',
  },
  scenarioCatalog: {
    en: 'Scenarios Catalog',
    it: 'Catalogo Scenari',
  },
  prosthesisCatalog: {
    en: 'Prostheses & Moulage',
    it: 'Protesi & Moulage',
  },
  nightMci: {
    en: 'Night MCI Scenario',
    it: 'Scenario Notturno MCI',
  },
  anagraficaRegistry: {
    en: 'Master Directory & Teams',
    it: 'Anagrafica & Squadre',
  },
  evaluations: {
    en: 'Evaluations',
    it: 'Valutazioni',
  },
  broadcast: {
    en: 'Broadcast Alert',
    it: 'Avviso Broadcast',
  },
  messaging: {
    en: 'Faculty Comms',
    it: 'Comunicazioni Faculty',
  },
  scanBadge: {
    en: 'Scan Badge',
    it: 'Scansiona Badge',
  },
  simTimeEngine: {
    en: 'Time Engine',
    it: 'Motore Orario',
  },
  syncStatus: {
    en: 'Sync Status',
    it: 'Stato Sync',
  },

  // Status & Timers
  live: {
    en: 'LIVE',
    it: 'LIVE',
  },
  active: {
    en: 'ACTIVE',
    it: 'ATTIVO',
  },
  paused: {
    en: 'PAUSED',
    it: 'IN PAUSA',
  },
  suspended: {
    en: 'SUSPENDED',
    it: 'SOSPESO',
  },
  countdown: {
    en: 'Countdown to Start',
    it: 'Conto alla Rovescia Inizio',
  },
  timeRemaining: {
    en: 'Time Remaining',
    it: 'Tempo Rimanente',
  },
  slotProgress: {
    en: 'Slot Progress',
    it: 'Avanzamento Slot',
  },
  nextSlot: {
    en: 'Next Slot',
    it: 'Prossimo Slot',
  },
  prevSlot: {
    en: 'Previous Slot',
    it: 'Slot Precedente',
  },
  startTimer: {
    en: 'Start Timer',
    it: 'Avvia Timer',
  },
  pauseTimer: {
    en: 'Pause Timer',
    it: 'Pausa Timer',
  },
  resetTimer: {
    en: 'Reset Timer',
    it: 'Azzera Timer',
  },

  // Discente View
  learnerPortal: {
    en: 'Learner Simulation Portal',
    it: 'Portale Simulazione Discente',
  },
  myTeam: {
    en: 'My Squad',
    it: 'La Mia Squadra',
  },
  myAssignedGroup: {
    en: 'Assigned Group',
    it: 'Gruppo Assegnato',
  },
  myTutor: {
    en: 'Faculty Tutor',
    it: 'Tutor Faculty',
  },
  currentActivity: {
    en: 'Current Activity',
    it: 'Attività Corrente',
  },
  nextActivity: {
    en: 'Next Activity',
    it: 'Prossima Attività',
  },
  myColleagues: {
    en: 'Squad Colleagues',
    it: 'Colleghi di Squadra',
  },
  clinicalFocus: {
    en: 'Clinical Focus & Goals',
    it: 'Focus Clinico & Obiettivi',
  },
  assignedStation: {
    en: 'Assigned Station',
    it: 'Postazione Assegnata',
  },
  myEvaluationsSummary: {
    en: 'Practical Scenarios Evaluation Overview',
    it: 'Riepilogo Valutazioni Scenari Pratici',
  },
  selectDiscente: {
    en: 'Select Learner Profile',
    it: 'Seleziona Profilo Discente',
  },
  summaryAndStations: {
    en: 'SUMMARY & STATIONS',
    it: 'SCHEDA RIEPILOGO & POSTAZIONI',
  },
  yourSquad: {
    en: 'YOUR SQUAD (5 LEARNERS)',
    it: 'LA TUA SQUADRA (5 DISCENTI)',
  },
  threeScenariosEvals: {
    en: '3 PRACTICAL SCENARIOS EVALUATIONS',
    it: 'VALUTAZIONI 3 SCENARI PRATICI',
  },
  alertsAndSos: {
    en: 'ALERTS & DIRECT SOS',
    it: 'AVVISI & SOS REGIA',
  },
  qrPassBadge: {
    en: 'QR PASS & DIGITAL BADGE',
    it: 'QR PASS & BADGE DIGITALE',
  },
  emergencySosButton: {
    en: 'EMERGENCY / SOS',
    it: 'EMERGENZA / SOS',
  },
  sendSosToControl: {
    en: 'SEND SOS REQUEST TO DIRECTORS & FACULTY',
    it: 'INVIA RICHIESTA SOS ALLA REGIA E FACULTY',
  },
  sendNow: {
    en: 'TRANSMIT NOW',
    it: 'TRASMETTI ORA',
  },
  receivedAlertsHistory: {
    en: 'RECEIVED ALERTS HISTORY',
    it: 'STORICO AVVISI RICEVUTI',
  },
  noBroadcasts: {
    en: 'No broadcast messages received for your squad.',
    it: 'Nessun messaggio broadcast ricevuto per il tuo gruppo.',
  },

  // Faculty View
  facultyPortal: {
    en: 'Faculty Simulation & Evaluation Console',
    it: 'Console Faculty & Valutazione Simulazione',
  },
  fieldEvaluation: {
    en: 'FIELD EVALUATION',
    it: 'VALUTAZIONE SUL CAMPO',
  },
  mySquadRoster: {
    en: 'MY SQUAD ROSTER',
    it: 'ROSTER MIA SQUADRA',
  },
  threePracticalScenarios: {
    en: '3 PRACTICAL SCENARIOS',
    it: '3 SCENARI PRATICI',
  },
  commsAndSos: {
    en: 'MESSAGES & SOS',
    it: 'MESSAGGI & SOS REGIA',
  },
  assignedTeamNotice: {
    en: 'You are evaluating your assigned squad across the 3 practical simulation scenarios.',
    it: 'Stai valutando la tua squadra assegnata nei 3 scenari pratici di simulazione.',
  },
  scenarioEvaluationRubric: {
    en: 'SCENARIO EVALUATION RUBRIC',
    it: 'SCHEDA DI VALUTAZIONE SCENARIO',
  },
  clinicalCrmDimensions: {
    en: 'CLINICAL & NON-TECHNICAL CRM DIMENSIONS',
    it: 'DIMENSIONI CLINICHE E NON TECNICHE (CRM / TEAMWORK)',
  },
  dimAbcde: {
    en: 'Systematic ABCDE Approach',
    it: 'Approccio Sistematico ABCDE',
  },
  dimTech: {
    en: 'Technical Skills & Invasive Procedures',
    it: 'Abilità Tecniche & Procedure Invasive',
  },
  dimCrm: {
    en: 'Teamwork & Operational Leadership',
    it: 'Teamwork & Leadership Operativa',
  },
  dimSbar: {
    en: 'SBAR Handover & Closed-Loop Communication',
    it: 'Handover SBAR & Comunicazione Closed-Loop',
  },
  dimSafety: {
    en: 'Safety, Timing & Clinical Decision Making',
    it: 'Sicurezza, Timing & Decision Making',
  },
  debriefingFeedbackNotes: {
    en: 'DEBRIEFING NOTES & FACULTY FEEDBACK',
    it: 'NOTE DI DEBRIEFING & FEEDBACK FACULTY',
  },
  totalSquadScore: {
    en: 'TOTAL SQUAD SCORE:',
    it: 'PUNTEGGIO TOTALE SQUADRA:',
  },
  saveEvaluation: {
    en: 'SAVE EVALUATION',
    it: 'SALVA VALUTAZIONE',
  },
  allScores5: {
    en: 'ALL 5s (OPTIMAL)',
    it: 'TUTTI 5 (OTTIMALE)',
  },
  quickPreset: {
    en: 'QUICK PRESET',
    it: 'PRESET RAPIDO',
  },
  evalAll3Scenarios: {
    en: 'SCORE ALL 3 SCENARIOS (QUICK PRESET)',
    it: 'VALUTA TUTTI I 3 SCENARI (PRESET RAPIDO)',
  },
  evaluationCompleted: {
    en: 'Evaluation Recorded',
    it: 'Valutazione Registrata',
  },
  evaluationPending: {
    en: 'Pending Evaluation',
    it: 'In Attesa di Valutazione',
  },

  // Technician View
  technicianPortal: {
    en: 'Technical Support & Simulator Ops Hub',
    it: 'Portate Regia Tecnica & Moulage',
  },
  checklistStatusSignals: {
    en: 'CHECKLIST & STATUS SIGNALS',
    it: 'CHECKLIST & SEGNALI REGIA',
  },
  scheduleT30m: {
    en: 'SCHEDULE & T-30m ADVANCE',
    it: 'ORARIO & ANTICIPO T-30m',
  },
  techStaff6: {
    en: 'TECH STAFF (6 TECHNICIANS)',
    it: 'STAFF TECNICO (6 TECNICI)',
  },
  reportToDirector: {
    en: 'REPORT TO DIRECTOR',
    it: 'SEGNALA ALLA REGIA',
  },
  t30mGateRule: {
    en: 'OPERATIONAL RULE: 30-MINUTE ADVANCE SETUP',
    it: 'REGOLA OPERATIVA: ALLESTIMENTO CON 30 MINUTI DI ANTICIPO',
  },
  t30mGateDescription: {
    en: 'Each station must be pre-set and verified 30 minutes before scenario kickoff for faculty briefing and Green Light 🟢 or Yellow Light ⚠️ dispatch.',
    it: "Ogni postazione deve essere allestita e verificata 30 minuti prima dell'inizio dello scenario per consentire il briefing istruttori e l'invio della Luce Verde 🟢 o Luce Gialla ⚠️.",
  },
  greenLight: {
    en: 'GREEN LIGHT',
    it: 'LUCE VERDE',
  },
  yellowLight: {
    en: 'YELLOW LIGHT',
    it: 'LUCE GIALLA',
  },
  preparing: {
    en: 'PREPARING',
    it: 'IN PREPARAZIONE',
  },
  reportCriticality: {
    en: 'REPORT CRITICALITY',
    it: 'SEGNALA CRITICITÀ',
  },

  // Director View
  directorPortal: {
    en: 'Command & Directorate Overview',
    it: 'Centro di Comando & Direzione Corso',
  },
  timelineAndControl: {
    en: 'TIMELINE & CONTROL',
    it: 'REGIA & TIMELINE',
  },
  gateAndSchedule: {
    en: 'GATE & SCHEDULE',
    it: 'GATE & ORARIO',
  },
  controlChecklists: {
    en: 'CONTROL CHECKLISTS',
    it: 'CHECKLIST REGIA',
  },
  courseSuspensionTab: {
    en: 'COURSE SUSPENSION',
    it: 'SOSPENSIONE CORSO',
  },
  messagesAndSos: {
    en: 'MESSAGES & SOS',
    it: 'MESSAGGI & SOS',
  },
  registryAndTeams: {
    en: 'REGISTRY & TEAMS',
    it: 'ANAGRAFICA & SQUADRE',
  },
  qrBadgeRegistryTab: {
    en: 'QR BADGE REGISTRY',
    it: 'REGISTRO QR BADGE',
  },
  scenariosAndPatients: {
    en: 'SCENARIOS & PATIENTS',
    it: 'SCENARI & PAZIENTI',
  },
  analyticsAndScores: {
    en: 'ANALYTICS & SCORES',
    it: 'ANALYTICS & PUNTEGGI',
  },
  pauseCourse: {
    en: 'PAUSE COURSE',
    it: 'STOP CORSO',
  },
  resumeCourseAction: {
    en: 'RESUME COURSE',
    it: 'RIPRENDI CORSO',
  },
  simulate: {
    en: 'SIMULATE',
    it: 'SIMULA',
  },
  exportData: {
    en: 'EXPORT DATA',
    it: 'ESPORTA DATI',
  },

  // VIP Guest View
  guestPortal: {
    en: 'VIP Guest & Observer Information Hub',
    it: 'Hub Informativo Ospiti VIP & Osservatori',
  },
  activeFieldRotation: {
    en: 'ACTIVE FIELD / ROTATION',
    it: 'MODULO ATTIVO / CAMPO',
  },
  myBadgePass: {
    en: 'MY BADGE PASS',
    it: 'IL MIO BADGE PASS',
  },
  tourSimStructure: {
    en: 'TOUR & SIM STRUCTURE',
    it: 'PERCORSO VISITA & SCENARI',
  },

  // Public Shared View
  publicViewTitle: {
    en: 'Main Hall Simulation Dashboard',
    it: 'Dashboard Aula Principale Simulazione',
  },
  operationalMatrix: {
    en: 'OPERATIONAL MATRIX',
    it: 'MATRICE OPERATIVA',
  },
  liveStatusByGroup: {
    en: 'Live Status by Group & Teams',
    it: 'Stato Operativo per Gruppo & Squadre',
  },

  // Common UI
  save: {
    en: 'Save',
    it: 'Salva',
  },
  cancel: {
    en: 'Cancel',
    it: 'Annulla',
  },
  edit: {
    en: 'Edit',
    it: 'Modifica',
  },
  delete: {
    en: 'Delete',
    it: 'Elimina',
  },
  close: {
    en: 'Close',
    it: 'Chiudi',
  },
  search: {
    en: 'Search...',
    it: 'Cerca...',
  },
  filter: {
    en: 'Filter',
    it: 'Filtra',
  },
  all: {
    en: 'All',
    it: 'Tutti',
  },
  stats: {
    en: 'Statistics',
    it: 'Statistiche',
  },
  learnersCount: {
    en: '60 Learners',
    it: '60 Discenti',
  },
  teamsCount: {
    en: '12 Teams',
    it: '12 Squadre',
  },
  groupsCount: {
    en: '4 Groups (A, B, C, D)',
    it: '4 Gruppi (A, B, C, D)',
  },
  facultyCount: {
    en: '12 Faculty Tutors',
    it: '12 Tutor Faculty',
  },
  stationsCount: {
    en: '12 Operating Stations',
    it: '12 Postazioni Operative',
  },
  qrScannerInstruction: {
    en: 'Scan any badge QR code or enter code to jump directly to profile',
    it: 'Inquadra il QR code di un badge o inserisci il codice per aprire il profilo',
  },
};

export function getTranslation(key: keyof typeof translations | string, lang: Language): string {
  const item = (translations as any)[key];
  if (!item) return key;
  return item[lang] || item['en'] || key;
}
