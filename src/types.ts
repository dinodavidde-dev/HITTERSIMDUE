export type UserRole = 'discente' | 'tecnico' | 'faculty' | 'direttore' | 'ospite' | 'regia' | 'master';

export type CourseDay = 1 | 2 | 3;
export type SessionPeriod = 'mattina' | 'pomeriggio' | 'notturno';
export type GroupType = 'A' | 'B' | 'C' | 'D';

export type ScenarioType = 'TCCC' | 'SHOCKROOM' | 'WORKSHOP' | 'OTHER' | 'MASCAL';

export interface ScenarioRoleAssignment {
  discenteId: string;
  role: string;
  scenarioType: ScenarioType;
  slotId?: string;
  assignedByFacultyBadge?: string;
}

export interface Discente {
  id: string;
  name: string;
  role: string;
  teamId: number;
  nationality: string;
  specialty?: string;
  phone?: string;
  email?: string;
  experience?: string;
  organization?: string;
  badgeCode?: string;
  notes?: string;
  professione?: string;
  clothingSize?: string;

  // Ruoli Operativi di Scenario (Pre-Allerta TCCC / Shock Room)
  assignedRole?: string;
  activeScenarioRole?: string;
  activeScenarioType?: ScenarioType;
  activeScenarioSlotId?: string;
  activeScenarioAssignedAt?: string;
  activeScenarioAssignedBy?: string;
}

export type SimulationPhase = 'idle' | 'briefing' | 'active' | 'scenario' | 'handover' | 'debriefing' | 'completed';

export interface Team {
  id: number;
  name: string;
  groupId: GroupType;
  facultyId: string;
  color: string;
  notes?: string;
}

export interface Faculty {
  id: string;
  name: string;
  title: string;
  specialty: string;
  nationality: string;
  assignedTeamId: number;
  assignedStation?: string;
  affiliation?: string;
  phone: string;
  email?: string;
  organization?: string;
  badgeCode?: string;
  notes?: string;
}

export interface Technician {
  id: string;
  name: string;
  assignedStations: string[];
  assignedStation?: string;
  role?: string;
  specialty: string;
  nationality: string;
  phone: string;
  email?: string;
  organization?: string;
  badgeCode?: string;
  notes?: string;
}

export interface Director {
  id: string;
  name: string;
  title: string;
  role?: string;
  nationality: string;
  phone: string;
  email?: string;
  organization?: string;
  badgeCode?: string;
  isMaster?: boolean;
  notes?: string;
}

export interface RegiaStaff {
  id: string;
  name: string;
  title: string;
  role?: string;
  nationality: string;
  phone: string;
  email?: string;
  organization?: string;
  badgeCode?: string;
  isMaster?: boolean;
  notes?: string;
}

export interface Guest {
  id: string;
  name: string;
  title: string; // e.g. "Osservatore NATO MilMed", "Delegato Ministero Salute", "Visiting Professor"
  organization: string; // e.g. "NATO MilMed COE", "Croce Rossa Italiana", "Ministero della Difesa"
  nationality: string;
  assignedDays: CourseDay[];
  phone?: string;
  email?: string;
  badgeCode?: string;
  escortFaculty?: string;
  notes?: string;
}

export type ActorPhysicalStatus = 'AMPUTATO' | 'INTERO';
export type ClothingSize = 'S' | 'M' | 'L' | 'XL';
export type ActorProgressStatus =
  | 'STANDBY'
  | 'IN_PREPARAZIONE'
  | 'PRONTO_T0'
  | 'IN_SCENARIO'
  | 'RESET_SMONTAGGIO';

export interface CourseActor {
  id: string;
  slotNumber: number; // 1 to 8
  badgeCode: string; // e.g. "ATT-01" .. "ATT-08"
  name: string;
  physicalStatus: ActorPhysicalStatus; // 'AMPUTATO' | 'INTERO'
  amputationDetails: string; // e.g. "Amputazione transtibiale DX (moncone reale per protesi arteriosa)" or "Corpo intero - idoneo estrazione tattica e politrauma"
  clothingSize: ClothingSize; // 'S' | 'M' | 'L' | 'XL'
  makeupAllergies: string; // e.g. "Nessuna allergia nota" or "Sensibilità mastice alcolico - usare Pros-Aide ad acqua"
  assignedMakeupArtistId: string; // Default associated makeup artist ID (from Anagrafica Trucco)
  progressStatus?: ActorProgressStatus; // Current 5-stage progress status
  progressUpdatedAt?: string; // e.g. "08:42"
  progressUpdatedBy?: string; // e.g. "TRUC-01 • Silvia Rossi"
  nationality: string;
  phone: string;
  email?: string;
  organization?: string;
  notes?: string;
}

export interface MakeupArtist {
  id: string;
  badgeCode: string; // e.g. "TRUC-01" .. "TRUC-08"
  name: string;
  role: string; // e.g. "Coordinator & Lead Silicone Moulage", "Specialista Effetti Balistici & Amputazioni"
  specialty: string;
  nationality: string;
  phone: string;
  email?: string;
  organization?: string;
  assignedStation?: string;
  notes?: string;
}

export interface SimulatorPatient {
  id: number; // 1 to 24
  day: CourseDay;
  period: 'mattina' | 'pomeriggio';
  scenarioCode: string; // e.g. "Scenario 6 (TCCC)", "Scenario 1 (TCCC)"
  name?: string;
  title?: string;
  briefing?: string;
  moulageLevel?: string;
  groupExtraAssigned: GroupType;
  groupIntraAssigned: GroupType;
  teamExtraAssigned: number;
  teamIntraAssigned: number;
  lesioni: string[];
  dinamicaDelleLesioni?: string;
  procedureExtra: string[];
  procedureIntra: string[];
  procedureSpecifiche?: string[];
  approccioTcccVsShockRoom?: string;
  moulageProtesi: string; // Lab / Silvia
  simulatori: string; // Manichini / Hardware
  attoriCount: number; // 1 o 2
  attoreDettagli?: string;
  assignedActorId?: string; // e.g. 'actor-1' (ATT-01 .. ATT-08)
  assignedMakeupArtistId?: string; // e.g. 'truc-1' (TRUC-01 .. TRUC-08)
  actorProgressStatus?: ActorProgressStatus; // 5-stage progress status for this scenario
  actorProgressUpdatedAt?: string;
  actorProgressUpdatedBy?: string;
  techNotes?: string;
  readinessStatus?: 'ready' | 'critical' | 'preparing';
  criticalityNotes?: string;
  criticalityReportedBy?: string;
  criticalityTimestamp?: string;
  techChecklist: {
    preDone: boolean;
    intraDone: boolean;
    postDone: boolean;
    verifiedAt?: string;
  };
}

export type ActivityType = 
  | 'scenario_extra'
  | 'scenario_intra'
  | 'workshop'
  | 'skills'
  | 'debriefing'
  | 'pause'
  | 'plenary';

export interface GroupActivitySlot {
  activityType: ActivityType;
  title: string;
  subtitle: string;
  location: string;
  scenarioRef?: string;
  patientIds?: number[];
  partnerGroup?: GroupType; // Group to handover to/from
  facultyInvolved?: string[];
}

export interface TimelineSlot {
  id: string;
  day: CourseDay;
  period: SessionPeriod;
  timeRange: string;
  time?: string;
  startMinutes: number; // minutes from 00:00 for calculation
  durationMinutes: number;
  title: string;
  description: string;
  groupActivities: Record<GroupType, GroupActivitySlot>;
}

export type AlertType = 'info' | 'warning' | 'emergency' | 'phase_change' | 'pause';

export interface CourseSuspensionInfo {
  isSuspended: boolean;
  reason: string;
  suspendedAt?: string;
  suspendedBy?: string;
}

export interface CourseStartSchedule {
  scheduledDate: string; // e.g. "2026-08-25"
  scheduledTime: string; // e.g. "08:30"
  isoTimestamp: string;  // e.g. "2026-08-25T08:30:00"
  isGateEnabled: boolean; // whether countdown lock is active
  title: string;
  location: string;
  isGatePaused?: boolean;
  pausedRemainingMs?: number;
  gateMode?: 'start' | 'lunch' | 'night' | 'day3';
  lunchTime?: string;
  courseStartSignalTimestamp?: number; // Epoch ms timestamp broadcast when the course is officially started
  isOfficialStartTriggered?: boolean;
  isStartAuthorizedByRegia?: boolean;
  authorizedAt?: string;
  authorizedBy?: string;
}

export interface ScenarioBlockAuthorizationState {
  authorizedBlocks: Record<string, boolean>;
  pendingBlockSlotId?: string;
}

export interface CourseMessage {
  id: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderTeamId?: number;
  senderStation?: string;
  type: 'info' | 'warning' | 'emergency';
  subject: string;
  content: string;
  status: 'pending' | 'acknowledged';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}


export interface TeamEvaluationScores {
  abcdeApproach: number;       // 1 - 5
  technicalSkills: number;     // 1 - 5
  teamworkLeadership: number;  // 1 - 5
  handoverSbar: number;        // 1 - 5
  safetyTiming: number;        // 1 - 5
}

export interface TeamEvaluation {
  id: string;
  teamId: number;
  facultyId: string;
  day: CourseDay;
  period: SessionPeriod;
  patientId: number;
  scenarioCode: string;
  phase: 'EXTRA' | 'INTRA' | 'HANDOVER' | 'WORKSHOP';
  scores: TeamEvaluationScores;
  proceduresCompleted: string[];
  strengths: string;
  criticalIssues: string;
  debriefingActionItems: string;
  timestamp: string;
}



export interface ProtesiItem {
  id: string;
  code: string;
  name: string;
  district: 'VIE_AEREE' | 'TORACE_CUORE' | 'ADDOME_PELVI' | 'ARTI_AMPUTAZIONI' | 'COLLO_VASCOLARE' | 'MAXILLO_FACCIALE' | 'USTIONI_BLAST';
  description: string;
  activeFeatures: string[]; // e.g. "Pompa arteriosa pulsante", "Espansione ematoma", "Pneumotorace sibilante", "Tessuto biologico maiale"
  scenariosUsed: {
    patientId: number;
    scenarioCode: string;
    day: CourseDay;
    period: SessionPeriod;
    teamExtra: number;
    teamIntra: number;
  }[];
  requiredProcedures: string[];
  techRequirements: string;
  leadTechnician: string;
  consumables: string[];
}

export type TriageCategory = 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';

export type CriticalLsiType =
  | 'TOURNIQUET'
  | 'WOUND_PACKING'
  | 'NEEDLE_DECOMPRESSION'
  | 'AIRWAY_MANEUVER'
  | 'PELVIC_BINDER'
  | 'HYPOTHERMIA_WRAP';

export interface MascalCasualty {
  id: string; // 'CAS-01' .. 'CAS-12'
  codeNumber: number; // 1 to 12
  title: string;
  description: string;
  vitalsSummary: string;
  breathingRate: string;
  radialPulse: boolean;
  mentalState: string;
  canonicalCategory: TriageCategory;
  indicatedLsi: CriticalLsiType[];
  clinicalRationale: string;
}

export interface MascalTeamCasualtyAssessment {
  casualtyId: string;
  assignedCategory?: TriageCategory;
  isCorrect?: boolean;
  isUnderTriage?: boolean;
  isOverTriage?: boolean;
  performedLsi: CriticalLsiType[];
  secondsToCategorize?: number;
  assessedByFacultyId?: string;
  assessedAtTimestamp?: number;
  notes?: string;
}

export interface MascalTeamTriageRecord {
  teamId: number;
  assessments: Record<string, MascalTeamCasualtyAssessment>;
  totalAssessed: number;
  totalCorrect: number;
  accuracyPercent: number;
  underTriageCount: number;
  overTriageCount: number;
  averageSecondsPerCasualty: number;
  totalLsiCompleted: number;
  lastUpdated: number;
}

export interface ConnectedPeer {
  id: string;
  role: UserRole;
  roleLabel: string;
  lastSeen: number;
  isCurrent?: boolean;
}

export type DeviceSyncState = 'online' | 'standby' | 'lag' | 'offline';

export interface DevicePresenceRecord {
  id: string;
  deviceId: string;
  clientId: string;
  badgeCode: string;
  name: string;
  role: UserRole;
  status: DeviceSyncState;
  lastSeen: number;
  currentSlotIndex: number;
  activeDay: CourseDay;
  latencyMs: number;
  deviceInfo?: string;
  // UI enrichment
  assignedStation?: string;
  assignedTeamId?: number;
  assignedPatientId?: number;
  groupId?: GroupType;
  isTeamLeader?: boolean;
  specialty?: string;
  radioChannel?: string;
  isCurrentDevice?: boolean;
}

export interface SyncStatusInfo {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTimestamp: number;
  peerCount: number;
  peers: ConnectedPeer[];
  latencyMs: number | null;
  channelName: string;
}

export interface FacultyAuthSession {
  isAuthorized: boolean;
  facultyId: string | null;
  facultyName: string | null;
  authorizedAt: number | null;
}

export type ChecklistItemStatus = 'READY' | 'PENDING' | 'CRITICAL_MISSING';

export type EquipmentCategory =
  | 'VIE_AEREE'
  | 'TORACE_BIOPACK'
  | 'VASCOLARE_EMOSTASI'
  | 'ADDOME_PELVI'
  | 'HARDWARE_CIRCUITI'
  | 'MOULAGE_ATTORI'
  | 'DPI_SICUREZZA';

export interface TechEquipmentChecklistItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  description: string;
  requiredQuantity: string;
  status: ChecklistItemStatus;
  notes?: string;
  isMandatoryForGoLive: boolean;
  consumableType?: string;
}

export interface StationPreSessionChecklist {
  stationId: string; // e.g. "POSTAZIONE_1", "POSTAZIONE_2", "SHOCK_ROOM_1", "NIGHT_MCI"
  stationName: string;
  patientId?: number;
  scenarioRef: string;
  sessionPeriod: 'mattina' | 'pomeriggio' | 'notturno';
  day: CourseDay;
  assignedTechId: string;
  assignedTechName: string;
  isFullyCertified: boolean;
  certifiedBy?: string;
  certifiedAt?: string;
  readinessScore: number; // 0 - 100
  items: TechEquipmentChecklistItem[];
  stationNotes?: string;
  simulatedMannequinBatteryPct?: number;
  simulatedBloodReservoirMl?: number;
  signalStatus?: 'NONE' | 'GREEN_LIGHT' | 'YELLOW_WARNING';
  signalSentAt?: string;
  signalNotes?: string;
}

export interface PhaseShiftLogEntry {
  id: string;
  timestamp: string;
  dateTimeStr: string;
  alertId: string;
  title: string;
  message: string;
  senderName: string;
  alertType: string;
  recordedByTechName: string;
}
