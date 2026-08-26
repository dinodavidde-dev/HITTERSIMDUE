export type UserRole = 'public' | 'discente' | 'tecnico' | 'faculty' | 'direttore' | 'ospite';

export type CourseDay = 2 | 3;
export type SessionPeriod = 'mattina' | 'pomeriggio' | 'notturno';
export type GroupType = 'A' | 'B' | 'C' | 'D';

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
}

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
  procedureExtra: string[];
  procedureIntra: string[];
  moulageProtesi: string; // Lab / Silvia
  simulatori: string; // Manichini / Hardware
  attoriCount: number; // 1 o 2
  attoreDettagli?: string;
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
  | 'night_scenario'
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

export interface BroadcastAlert {
  id: string;
  timestamp: string;
  senderRole: UserRole;
  senderName: string;
  type: AlertType;
  title: string;
  message: string;
  targetGroups: ('ALL' | GroupType)[];
  active: boolean;
  priority: 'normal' | 'high' | 'critical';
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
  phase: 'EXTRA' | 'INTRA' | 'NIGHT' | 'WORKSHOP';
  scores: TeamEvaluationScores;
  proceduresCompleted: string[];
  strengths: string;
  criticalIssues: string;
  debriefingActionItems: string;
  timestamp: string;
}

export interface NightScenarioCase {
  teamId: number;
  teamName: string;
  groupId: GroupType;
  title: string;
  category: string;
  injuries: string[];
  expectedTriageCategory: 'IMMEDIATE' | 'DELAYED' | 'MINOR' | 'EXPECTANT_DEAD';
  procedures: string[];
  location: string;
  triageAssigned?: TriageCategory;
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
  nightScenarioUsed?: boolean;
  requiredProcedures: string[];
  techRequirements: string;
  leadTechnician: string;
  consumables: string[];
}

export type TriageCategory = 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';

export interface ConnectedPeer {
  id: string;
  role: UserRole;
  roleLabel: string;
  lastSeen: number;
  isCurrent?: boolean;
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
