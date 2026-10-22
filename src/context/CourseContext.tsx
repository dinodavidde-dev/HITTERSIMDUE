import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  ActorProgressStatus,
  CourseActor,
  CourseDay,
  CourseMessage,
  CourseSuspensionInfo,
  Discente,
  Director,
  RegiaStaff,
  Faculty,
  Guest,
  MakeupArtist,
  SimulatorPatient,
  SyncStatusInfo,
  ConnectedPeer,
  FacultyAuthSession,
  CourseStartSchedule,
  Team,
  TeamEvaluation,
  Technician,
  TimelineSlot,
  TriageCategory,
  CriticalLsiType,
  MascalTeamTriageRecord,
  MascalTeamCasualtyAssessment,
  UserRole,
  PhaseShiftLogEntry,
  DevicePresenceRecord,
  ProtesiItem,
  ScenarioType,
  GroupType,
  SimulationPhase,
} from '../types';
import {
  DEFAULT_PATIENT_TRUCCO_ASSIGNMENTS,
  INITIAL_ACTORS,
  INITIAL_COURSE_MESSAGES,
  INITIAL_DIRECTORS,
  INITIAL_REGIA_STAFF,
  INITIAL_DISCENTI,
  INITIAL_FACULTY,
  INITIAL_GUESTS,
  INITIAL_MAKEUP_ARTISTS,
  INITIAL_SIMULATOR_PATIENTS,
  INITIAL_TEAMS,
  INITIAL_TECHNICIANS,
  INITIAL_TIMELINE_SLOTS,
} from '../data/initialData';
import { computeHomogeneousTruccoDistribution } from '../utils/truccoBalancer';
import { PROTESI_CATALOG } from '../data/protesiCatalog';
import { cleanUndefined } from '../utils/teamUtils';
import { Language, translations } from '../i18n/translations';
import { translateSlot, translatePatient } from '../utils/courseTranslation';
import { playBroadcastSound, playAirRaidSiren, playLongBeep } from '../utils/audio';
import { db as localDb } from '../offline/db';
import { applyScheduleChange, rollbackLastScheduleChange } from '../schedule/scheduleFlexibility';
import { type SlotChangeProposal } from '../schedule/scheduleValidator';
import { getMacroBlockInfo } from '../utils/macroBlockHelper';
import { logAuditAction } from '../schedule/auditLogStore';
import {
  checkAndAutoAssignMissingRoles,
  detectDebriefingOrCompletedForGroup,
  cleanupDiscentiAssignedRolesInFirestore,
  CleanupRolesOptions,
  GROUP_TEAM_IDS,
} from '../utils/scenarioRoleHelper';
import {
  db,
  auth,
  OperationType,
  handleFirestoreError,
  signInWithGoogle as fbSignInWithGoogle,
  logOut as fbLogOut,
  isQuotaExhausted,
  markQuotaExhausted,
  resetQuotaStatus,
} from '../firebase';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  buildSimulatedRoleState,
  SimulationRoleState,
  ParallelGroupTrackInfo,
} from '../utils/simulationRoleEngine';

interface CourseContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations, defaultText?: string) => string;

  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  openedByRole: 'regia' | 'direttore' | 'master' | null;
  setOpenedByRole: (role: 'regia' | 'direttore' | 'master' | null) => void;
  canSelectOperator: boolean;
  unlockOperatorSelection: (pin: string) => boolean;
  activeDay: CourseDay;
  setActiveDay: (day: CourseDay) => void;
  activeSlotIndex: number;
  setActiveSlotIndex: (idx: number) => void;
  currentSlot: TimelineSlot;
  filteredSlots: TimelineSlot[];
  isTimerRunning: boolean;
  timerSeconds: number;
  toggleTimer: () => void;
  resetTimer: (customSeconds?: number) => void;
  adjustTimer: (secondsDelta: number) => void;
  nextSlot: () => void;
  prevSlot: () => void;

  // Suspension Management
  suspensionInfo: CourseSuspensionInfo;
  suspendCourse: (reason: string, suspendedBy?: string) => void;
  resumeCourse: (resumedBy?: string) => void;

  // Real-Time Messages (Visible only to Directors and Faculty)
  courseMessages: CourseMessage[];
  sendCourseMessage: (msg: Omit<CourseMessage, 'id' | 'timestamp' | 'status'>) => void;
  acknowledgeCourseMessage: (id: string, ackBy?: string) => void;
  deleteCourseMessage: (id: string) => void;

  phaseShiftLogs: PhaseShiftLogEntry[];
  recordPhaseShiftLog: (entry: Omit<PhaseShiftLogEntry, 'id' | 'timestamp' | 'dateTimeStr'>) => void;
  clearPhaseShiftLogs: () => void;

  simulatorPatients: SimulatorPatient[];
  updateSimulatorPatient: (patientId: number, updates: Partial<SimulatorPatient>) => void;
  addSimulatorPatient: (newPatient: Omit<SimulatorPatient, 'id'>) => void;
  deleteSimulatorPatient: (patientId: number) => void;
  resetSimulatorPatients: () => void;
  updateTechChecklist: (patientId: number, phase: 'preDone' | 'intraDone' | 'postDone', val: boolean, notes?: string) => void;

  teams: Team[];
  updateTeam: (teamId: number, updates: Partial<Team>) => void;

  discenti: Discente[];
  updateDiscente: (id: string, updates: Partial<Discente>) => void;
  bulkUpdateDiscenti: (updatedList: Discente[]) => Promise<void>;
  addDiscente: (newDiscente: Omit<Discente, 'id'>) => void;
  deleteDiscente: (id: string) => void;
  assignScenarioRoles: (
    assignments: {
      discenteId: string;
      role: string;
      scenarioType: ScenarioType;
      slotId?: string;
      assignedByFacultyBadge?: string;
    }[]
  ) => void;
  clearScenarioRolesForTeam: (teamId: number) => void;
  cleanupAssignedRoles: (
    optionsOrPhase?: CleanupRolesOptions | 'debriefing' | 'completed' | string,
    targetGroup?: GroupType
  ) => Promise<{ success: boolean; count: number }>;
  resetAssignedRolesInFirestore: (
    optionsOrPhase?: CleanupRolesOptions | 'debriefing' | 'completed' | string,
    targetGroup?: GroupType
  ) => Promise<{ success: boolean; count: number }>;
  simulationPhase: SimulationPhase;
  setSimulationPhase: (
    phase: SimulationPhase,
    target?: { group?: GroupType; teamId?: number; all?: boolean }
  ) => Promise<void>;

  faculty: Faculty[];
  updateFaculty: (id: string, updates: Partial<Faculty>) => void;
  bulkUpdateFaculty: (updatedList: Faculty[]) => Promise<void>;
  addFaculty: (newFaculty: Omit<Faculty, 'id'>) => void;
  deleteFaculty: (id: string) => void;

  technicians: Technician[];
  updateTechnician: (id: string, updates: Partial<Technician>) => void;
  bulkUpdateTechnicians: (updatedList: Technician[]) => Promise<void>;
  addTechnician: (newTech: Omit<Technician, 'id'>) => void;
  deleteTechnician: (id: string) => void;

  directors: Director[];
  updateDirector: (id: string, updates: Partial<Director>) => void;
  bulkUpdateDirectors: (updatedList: Director[]) => Promise<void>;
  addDirector: (newDirector: Omit<Director, 'id'>) => void;
  deleteDirector: (id: string) => void;

  regiaStaff: RegiaStaff[];
  updateRegiaStaff: (id: string, updates: Partial<RegiaStaff>) => void;
  bulkUpdateRegiaStaff: (updatedList: RegiaStaff[]) => Promise<void>;
  addRegiaStaff: (newRegia: Omit<RegiaStaff, 'id'>) => void;
  deleteRegiaStaff: (id: string) => void;

  guests: Guest[];
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  bulkUpdateGuests: (updatedList: Guest[]) => Promise<void>;
  addGuest: (newGuest: Omit<Guest, 'id'>) => void;
  deleteGuest: (id: string) => void;

  // Anagrafica Attori (8 Slot Principali ATT-01 - ATT-08) & Anagrafica Truccatori (TRUC-01 - TRUC-08)
  actors: CourseActor[];
  updateActor: (id: string, updates: Partial<CourseActor>) => void;
  addActor: (newActor: Omit<CourseActor, 'id'>) => void;
  deleteActor: (id: string) => void;
  makeupArtists: MakeupArtist[];
  updateMakeupArtist: (id: string, updates: Partial<MakeupArtist>) => void;
  addMakeupArtist: (newArtist: Omit<MakeupArtist, 'id'>) => void;
  deleteMakeupArtist: (id: string) => void;
  linkActorToMakeupArtist: (actorId: string, makeupArtistId: string, propagateToScenarios?: boolean) => void;
  assignTruccoToPatient: (patientId: number, actorId: string, makeupArtistId?: string) => void;
  rebalanceTruccoWorkload: () => void;
  updateActorProgressStatus: (
    actorId: string,
    status: ActorProgressStatus,
    options?: { patientId?: number; updatedBy?: string; notifyRegia?: boolean }
  ) => void;

  evaluations: TeamEvaluation[];
  saveEvaluation: (evalData: Omit<TeamEvaluation, 'id' | 'timestamp'>) => void;
  bulkSaveEvaluations: (evalsData: Omit<TeamEvaluation, 'id' | 'timestamp'>[]) => void;
  getEvaluationForTeamAndSlot: (teamId: number, day: CourseDay, period: string) => TeamEvaluation | undefined;

  activeFacultyTeamId: number;
  setActiveFacultyTeamId: (teamId: number) => void;
  activeTechPatientId: number;
  setActiveTechPatientId: (patientId: number) => void;
  selectedDiscenteId: string;
  setSelectedDiscenteId: (id: string) => void;
  selectedFacultyId: string;
  setSelectedFacultyId: (id: string) => void;
  selectedTechnicianId: string;
  setSelectedTechnicianId: (id: string) => void;
  selectedDirectorId: string;
  setSelectedDirectorId: (id: string) => void;
  selectedRegiaId: string;
  setSelectedRegiaId: (id: string) => void;
  selectedGuestId: string;
  setSelectedGuestId: (id: string) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedCatalogPatientId: number | null;
  setSelectedCatalogPatientId: (id: number | null) => void;

  // Protesi Catalog Management
  protesiCatalog: ProtesiItem[];
  updateProtesiItem: (id: string, updated: Partial<ProtesiItem>) => void;
  addProtesiItem: (newItem: ProtesiItem) => void;
  deleteProtesiItem: (id: string) => void;
  resetProtesiCatalog: () => void;

  // Back Navigation System
  canGoBack: boolean;
  backDestinationLabel: string;
  navigateBack: () => void;
  navigateToView: (tab: string, role?: UserRole, origin?: 'regia' | 'direttore' | 'master') => void;

  facultyAuthSession: FacultyAuthSession;
  authorizeFaculty: (pin: string, facultyId?: string) => boolean;
  deauthorizeFaculty: () => void;

  courseStartSchedule: CourseStartSchedule;
  isCourseStarted: boolean;
  timeRemainingMs: number;
  updateCourseStartSchedule: (schedule: Partial<CourseStartSchedule>) => void;
  setCourseGateEnabled: (enabled: boolean) => void;
  startCourseImmediately: () => void;
  resetCourseScheduleToFuture: (minutesFromNow?: number) => void;
  setGatePaused: (paused: boolean) => void;
  toggleGatePause: () => void;
  setGateMode: (mode: 'start' | 'lunch' | 'night' | 'day3', customTime?: string) => void;

  syncStatus: SyncStatusInfo;
  triggerManualSync: () => void;
  sendPing: () => void;
  devicePresenceMap: Record<string, DevicePresenceRecord>;
  sendGlobalPing: () => void;
  forceDeviceResync: () => void;

  // Firebase Auth & Cloud Integration
  firebaseUser: FirebaseUser | null;
  isFirebaseAuthReady: boolean;
  isFirebaseCloudConnected: boolean;
  isQuotaExhausted: boolean;
  retryCloudConnection: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutFirebase: () => Promise<void>;

  // Full App Simulation Engine (Simulazione Attività Intera App dall'Apertura Gate 08:30)
  isFullAppSimulating: boolean;
  simulatedClockTime: string;
  simulatedRoleState: SimulationRoleState | null;
  startFullAppSimulationFromGate: (initialSpeed?: number) => void;
  stopFullAppSimulation: () => void;

  // Simulation Engine & Time Acceleration
  timeMultiplier: number;
  setTimeMultiplier: (multiplier: number) => void;
  autoAdvancePhases: boolean;
  setAutoAdvancePhases: (autoAdvance: boolean) => void;
  isSimulationModalOpen: boolean;
  setIsSimulationModalOpen: (open: boolean) => void;
  jumpToTimelinePoint: (
    target:
      | 'pre_start_15m'
      | 'pre_start_5m'
      | 'pre_start_30s'
      | 'day1_intro'
      | 'day2_morning'
      | 'day2_afternoon'
      | 'night_scenario'
      | 'day3_exams'
      | 'next_slot'
      | 'prev_slot'
  ) => void;
  triggerSimulatedClinicalEvent: () => void;

  resetAllData: () => void;
  resetSimulationSession: () => void;

  isBeeping: boolean;

  // Free Direct Access System (Accesso Libero per Discenti)
  freeAccessEnabled: boolean;
  setFreeAccessEnabled: (enabled: boolean) => void;
  isAreaDiscentiModalOpen: boolean;
  setIsAreaDiscentiModalOpen: (open: boolean) => void;

  // Fullscreen View Mode for Training Rooms
  isFullscreenMode: boolean;
  setIsFullscreenMode: (val: boolean) => void;
  toggleFullscreenMode: () => void;

  // MASCAL Triage Faculty Tracking
  mascalTriageRecords: Record<number, MascalTeamTriageRecord>;
  saveMascalTeamAssessment: (teamId: number, assessment: MascalTeamCasualtyAssessment) => void;
  resetMascalTeamTriage: (teamId?: number) => void;

  // Schedule Flexibility & Offline Audit
  timelineSlots: TimelineSlot[];
  setTimelineSlots: React.Dispatch<React.SetStateAction<TimelineSlot[]>>;
  applyScheduleModification: (proposal: SlotChangeProposal) => Promise<{ success: boolean; issues?: string[] }>;
  rollbackScheduleModification: () => Promise<boolean>;
  isAuditLogOpen: boolean;
  setIsAuditLogOpen: (open: boolean) => void;
  isIntentReviewOpen: boolean;
  setIsIntentReviewOpen: (open: boolean) => void;
  activeRollbackToast: { visible: boolean; description: string; timestamp: number } | null;
  dismissRollbackToast: () => void;

  // Gate Authorization & Scenario Block Start Confirmation
  isGateExpiredAwaitingAuth: boolean;
  authorizeCourseStart: (byBadge?: string) => Promise<void>;
  isMacroBlockAwaitingAuth: boolean;
  authorizedMacroBlocks: Record<string, boolean>;
  authorizeScenarioBlockStart: (slotId: string, byBadge?: string) => Promise<void>;
  isScenarioBlockConfirmationModalOpen: boolean;
  setIsScenarioBlockConfirmationModalOpen: (open: boolean) => void;

  // Tactical Multi-Layer Map Modal
  isTacticalMapOpen: boolean;
  setIsTacticalMapOpen: (open: boolean) => void;
}

const CourseContext = createContext<CourseContextType | null>(null);

const STORAGE_KEY_PREFIX = 'trauma_sim_course_v1_';

function getStoredOrDefault<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return defaultVal;
  }
}

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      if (urlLang === 'it' || urlLang === 'en') return urlLang;

      const langMigration = localStorage.getItem('trauma_lang_migrated_en');
      if (!langMigration) {
        localStorage.setItem('trauma_lang_migrated_en', 'true');
        localStorage.setItem(STORAGE_KEY_PREFIX + 'language', JSON.stringify('en'));
        return 'en';
      }

      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'language');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed === 'it' || parsed === 'en') return parsed;
        } catch (e) {}
      }
    }
    return 'en';
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = (params.get('view') || params.get('public') || '').toLowerCase();
      const roleParam = (params.get('role') || '').toLowerCase();

      // If explicitly public or guest
      if (
        viewParam === 'public' ||
        viewParam === 'pubblico' ||
        viewParam === 'true' ||
        viewParam === '1' ||
        viewParam === 'ospite' ||
        roleParam === 'ospite'
      ) {
        return 'ospite';
      }

      if (
        roleParam === 'master' ||
        params.get('master') ||
        params.get('pin') === '251201' ||
        params.get('code') === '251201' ||
        viewParam === 'master'
      ) {
        return 'master';
      }
      if (roleParam === 'discente' || params.get('discente') || params.get('student')) return 'discente';
      if (roleParam === 'faculty' || params.get('faculty') || params.get('tutor')) return 'faculty';
      if (roleParam === 'tecnico' || params.get('tecnico') || params.get('tech')) return 'tecnico';
      if (roleParam === 'direttore' || params.get('direttore')) return 'direttore';
      if (roleParam === 'regia' || params.get('regia')) return 'regia';

      // If stored role exists, use it
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'userRole');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'string') return parsed as UserRole;
        } catch (e) {}
      }

      // Default safe entrance: ospite (Public View)
      return 'ospite';
    }
    return 'ospite';
  });
  const [openedByRole, setOpenedByRoleState] = useState<'regia' | 'direttore' | 'master' | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get('from') || params.get('openedBy') || params.get('source');
      if (fromParam === 'regia' || fromParam === 'direttore' || fromParam === 'master') return fromParam;
      const stored = sessionStorage.getItem('trauma_opened_by');
      if (stored === 'regia' || stored === 'direttore' || stored === 'master') return stored as 'regia' | 'direttore' | 'master';
    }
    return null;
  });

  const setOpenedByRole = useCallback((role: 'regia' | 'direttore' | 'master' | null) => {
    setOpenedByRoleState(role);
    if (typeof window !== 'undefined') {
      if (role) {
        sessionStorage.setItem('trauma_opened_by', role);
      } else {
        sessionStorage.removeItem('trauma_opened_by');
      }
    }
  }, []);

  const unlockOperatorSelection = useCallback(
    (pin: string): boolean => {
      const clean = pin.trim();
      const validPins = ['118', '2026', '112', '9999', '0000', '251201', '9438', '0118'];
      if (
        validPins.includes(clean) ||
        clean.toLowerCase() === 'regia' ||
        clean.toLowerCase() === 'direttore' ||
        clean.toLowerCase() === 'master'
      ) {
        setOpenedByRole('regia');
        return true;
      }
      return false;
    },
    [setOpenedByRole]
  );

  const canSelectOperator =
    userRole === 'regia' ||
    userRole === 'direttore' ||
    userRole === 'master' ||
    openedByRole === 'regia' ||
    openedByRole === 'direttore' ||
    openedByRole === 'master';

  const [activeDay, setActiveDayState] = useState<CourseDay>(() => {
    const stored = getStoredOrDefault('activeDay', 1);
    return stored === 1 || stored === 2 ? stored : 1;
  });
  const [activeSlotIndex, setActiveSlotIndexState] = useState<number>(() => getStoredOrDefault('activeSlotIndex', 0));

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseAuthReady, setIsFirebaseAuthReady] = useState<boolean>(false);
  const [isFirebaseCloudConnected, setIsFirebaseCloudConnected] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsFirebaseAuthReady(true);
      if (user) {
        setIsFirebaseCloudConnected(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      await fbSignInWithGoogle();
      setIsFirebaseCloudConnected(true);
    } catch (err) {
      console.error('Google Sign-In failed:', err);
    }
  }, []);

  const signOutFirebase = useCallback(async () => {
    try {
      await fbLogOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  }, []);

  // Helper to persist course state changes to Firestore
  const syncCourseStateToFirestore = useCallback(
    async (partialState: Record<string, any>) => {
      if (isQuotaExhausted()) return;
      const statePath = 'course_state/current_state';
      try {
        await setDoc(
          doc(db, 'course_state', 'current_state'),
          cleanUndefined({
            ...partialState,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, statePath);
      }
    },
    []
  );

  const retryCloudConnection = useCallback(async () => {
    await resetQuotaStatus();
    setIsFirebaseCloudConnected(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'language', JSON.stringify(lang));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trauma_language_change', { detail: lang }));
      }
    } catch (e) {
      console.warn('Failed to save language', e);
    }
    syncCourseStateToFirestore({ language: lang });
  }, [syncCourseStateToFirestore]);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next: Language = prev === 'en' ? 'it' : 'en';
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'language', JSON.stringify(next));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('trauma_language_change', { detail: next }));
        }
      } catch (e) {
        console.warn('Failed to save language', e);
      }
      syncCourseStateToFirestore({ language: next });
      return next;
    });
  }, [syncCourseStateToFirestore]);

  // Synchronize language across tabs and windows
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY_PREFIX + 'language' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed === 'it' || parsed === 'en') {
            setLanguageState(parsed);
          }
        } catch (e) {}
      }
      if (event.key === STORAGE_KEY_PREFIX + 'activeSlotIndex' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (typeof parsed === 'number' && parsed >= 0) {
            setActiveSlotIndexState(parsed);
          }
        } catch (e) {}
      }
      if (event.key === STORAGE_KEY_PREFIX + 'activeDay' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed === 2 || parsed === 3) {
            setActiveDayState(parsed);
          }
        } catch (e) {}
      }
      if (event.key === STORAGE_KEY_PREFIX + 'mascalTriageRecords' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed && typeof parsed === 'object') {
            setMascalTriageRecordsState(parsed);
          }
        } catch (e) {}
      }
    };

    const handleCustomLang = (event: Event) => {
      const customEvent = event as CustomEvent<Language>;
      if (customEvent.detail === 'it' || customEvent.detail === 'en') {
        setLanguageState(customEvent.detail);
      }
    };

    const handleTimelineChange = (event: Event) => {
      const ce = event as CustomEvent<{ activeSlotIndex?: number; activeDay?: CourseDay; timerSeconds?: number; isTimerRunning?: boolean }>;
      if (ce.detail) {
        if (typeof ce.detail.activeSlotIndex === 'number') setActiveSlotIndexState(ce.detail.activeSlotIndex);
        if (typeof ce.detail.activeDay === 'number') setActiveDayState(ce.detail.activeDay);
        if (typeof ce.detail.timerSeconds === 'number') setTimerSeconds(ce.detail.timerSeconds);
        if (typeof ce.detail.isTimerRunning === 'boolean') setIsTimerRunning(ce.detail.isTimerRunning);
      }
    };

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('trauma_timeline_channel');
        bc.onmessage = (event) => {
          if (event.data) {
            if (typeof event.data.activeSlotIndex === 'number') setActiveSlotIndexState(event.data.activeSlotIndex);
            if (typeof event.data.activeDay === 'number') setActiveDayState(event.data.activeDay);
            if (typeof event.data.timerSeconds === 'number') setTimerSeconds(event.data.timerSeconds);
            if (typeof event.data.isTimerRunning === 'boolean') setIsTimerRunning(event.data.isTimerRunning);
            if (event.data.mascalTriageRecords) setMascalTriageRecordsState(event.data.mascalTriageRecords);
          }
        };
      } catch (e) {}
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener('trauma_language_change', handleCustomLang);
    window.addEventListener('trauma_timeline_change', handleTimelineChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('trauma_language_change', handleCustomLang);
      window.removeEventListener('trauma_timeline_change', handleTimelineChange);
    };
  }, []);

  const t = useCallback((key: keyof typeof translations, defaultText?: string) => {
    const item = translations[key];
    if (!item) return defaultText || key;
    return item[language] || item['en'] || defaultText || key;
  }, [language]);

  // Reactive Timeline Slots with IndexedDB Offline/Flexibility Persistence
  const [timelineSlots, setTimelineSlots] = useState<TimelineSlot[]>(() => INITIAL_TIMELINE_SLOTS);

  // Load cached slots from IndexedDB on startup if available
  useEffect(() => {
    localDb.cachedSlots.toArray().then((saved) => {
      if (saved && saved.length > 0) {
        setTimelineSlots(saved.sort((a, b) => (a.day - b.day) || (a.startMinutes - b.startMinutes)));
      }
    }).catch((err) => {
      console.warn('Failed to load cached slots from IndexedDB:', err);
    });
  }, []);

  const localizedTimelineSlots = useMemo(() => {
    return timelineSlots.map((slot) => translateSlot(slot, language));
  }, [timelineSlots, language]);
  const filteredSlots = useMemo(() => {
    return localizedTimelineSlots.filter((s) => s.day === activeDay);
  }, [localizedTimelineSlots, activeDay]);
  const currentSlot = localizedTimelineSlots[activeSlotIndex] || localizedTimelineSlots[0];

  // Schedule Flexibility & Audit Modals & Quick Rollback State
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);
  const [isIntentReviewOpen, setIsIntentReviewOpen] = useState<boolean>(false);
  const [activeRollbackToast, setActiveRollbackToast] = useState<{ visible: boolean; description: string; timestamp: number } | null>(null);

  const dismissRollbackToast = useCallback(() => {
    setActiveRollbackToast(null);
  }, []);

  const applyScheduleModification = useCallback(async (proposal: SlotChangeProposal): Promise<{ success: boolean; issues?: string[] }> => {
    const userBadge = openedByRole === 'master' ? 'MASTER-01' : 'REGIA-01';
    const result = await applyScheduleChange(proposal, timelineSlots, userBadge, 'Console Direzione / Regia');
    if (result.success && result.newSlots) {
      setTimelineSlots(result.newSlots);
      const actionLabel = proposal.type === 'extend' ? `+${proposal.deltaMinutes}m` : proposal.type === 'reduce' ? `-${proposal.deltaMinutes}m` : `Spostato a ${proposal.newStartTime}`;
      setActiveRollbackToast({
        visible: true,
        description: `Slot ${proposal.slotId}: ${actionLabel}`,
        timestamp: Date.now(),
      });
      return { success: true };
    }
    return { success: false, issues: result.issues };
  }, [timelineSlots, openedByRole]);

  const rollbackScheduleModification = useCallback(async (): Promise<boolean> => {
    const userBadge = openedByRole === 'master' ? 'MASTER-01' : 'REGIA-01';
    const restored = await rollbackLastScheduleChange(userBadge);
    if (restored) {
      setTimelineSlots(restored);
      setActiveRollbackToast(null);
      return true;
    }
    return false;
  }, [openedByRole]);

  const getSlotDurationSeconds = (slot: TimelineSlot) => {
    if (slot.id === 'd2-setup-1' || slot.id === 'd2-setup-2') return 1800; // 30 mins (08:00 - 08:30)
    if (slot.id === 'd2-chiusura' || slot.id === 'd3-setup-1') return 34200; // 9h 30m (23:00 Day 2 to 08:30 Day 3)
    if (slot.id === 'd3-chiusura') return 9000; // 2h 30m (18:00 to 20:30 Day 3)
    if (slot.id === 'd2-mascal-scenario') return 7200; // 120 mins (21:00 - 23:00)
    if (slot.id === 'd2-pausa-cena') return 7200; // 120 mins (18:00 - 20:00)
    return slot.durationMinutes * 60;
  };

  const [timerSeconds, setTimerSeconds] = useState<number>(() => {
    return getSlotDurationSeconds(currentSlot);
  });
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);


  const [phaseShiftLogs, setPhaseShiftLogs] = useState<PhaseShiftLogEntry[]>(() =>
    getStoredOrDefault('phaseShiftLogs', [])
  );

  const [simulatorPatients, setSimulatorPatients] = useState<SimulatorPatient[]>(() => {
    const withDefaultTrucco = INITIAL_SIMULATOR_PATIENTS.map((p) => {
      const def = DEFAULT_PATIENT_TRUCCO_ASSIGNMENTS[p.id];
      const defaultStatus: ActorProgressStatus = p.techChecklist?.preDone
        ? 'PRONTO_T0'
        : p.id === 1 || p.id === 2
        ? 'IN_PREPARAZIONE'
        : 'STANDBY';
      return {
        ...p,
        assignedActorId: p.assignedActorId || def?.assignedActorId || 'actor-1',
        assignedMakeupArtistId: p.assignedMakeupArtistId || def?.assignedMakeupArtistId || 'truc-1',
        actorProgressStatus: p.actorProgressStatus || defaultStatus,
      };
    });
    try {
      const stored = getStoredOrDefault('simulatorPatients', withDefaultTrucco);
      if (!stored || stored.length < 24) {
        localStorage.removeItem(STORAGE_KEY_PREFIX + 'simulatorPatients');
        return withDefaultTrucco;
      }
      // Always synchronize official rotation assignments and ensure default actor/makeup artist
      return withDefaultTrucco.map((canonical) => {
        const found = stored.find((p) => p.id === canonical.id);
        if (!found) return canonical;
        const hasLegacyArtist =
          found.assignedMakeupArtistId &&
          ['truc-5', 'truc-6', 'truc-7', 'truc-8'].includes(found.assignedMakeupArtistId);
        return {
          ...found,
          day: canonical.day,
          period: canonical.period,
          groupExtraAssigned: canonical.groupExtraAssigned,
          groupIntraAssigned: canonical.groupIntraAssigned,
          teamExtraAssigned: canonical.teamExtraAssigned,
          teamIntraAssigned: canonical.teamIntraAssigned,
          assignedActorId: hasLegacyArtist
            ? canonical.assignedActorId
            : found.assignedActorId || canonical.assignedActorId,
          assignedMakeupArtistId: hasLegacyArtist
            ? canonical.assignedMakeupArtistId
            : found.assignedMakeupArtistId || canonical.assignedMakeupArtistId,
          actorProgressStatus:
            found.actorProgressStatus ||
            (found.techChecklist?.preDone ? 'PRONTO_T0' : canonical.actorProgressStatus),
        };
      });
    } catch (e) {
      return withDefaultTrucco;
    }
  });

  const localizedSimulatorPatients = useMemo(() => {
    return simulatorPatients.map((p) => translatePatient(p, language));
  }, [simulatorPatients, language]);

  const [teams, setTeams] = useState<Team[]>(() => {
    if (typeof window !== 'undefined') {
      const rosterRev = localStorage.getItem(STORAGE_KEY_PREFIX + 'roster_rev_9240629a');
      if (!rosterRev) {
        try {
          localStorage.setItem(STORAGE_KEY_PREFIX + 'teams', JSON.stringify(INITIAL_TEAMS));
        } catch (e) {}
        return INITIAL_TEAMS;
      }
    }
    const stored = getStoredOrDefault('teams', INITIAL_TEAMS);
    return INITIAL_TEAMS.map((canonical) => {
      const found = stored.find((t) => t.id === canonical.id);
      if (!found) return canonical;
      return {
        ...found,
        name: canonical.name,
        groupId: canonical.groupId,
        notes: canonical.notes,
      };
    });
  });
  const [discenti, setDiscenti] = useState<Discente[]>(() => {
    if (typeof window !== 'undefined') {
      const rosterRev = localStorage.getItem(STORAGE_KEY_PREFIX + 'roster_rev_9240629a');
      const stored = getStoredOrDefault('discenti', INITIAL_DISCENTI);
      if (!rosterRev || !stored || stored.length !== 68 || stored[0]?.name !== 'Ahern Ellen') {
        try {
          localStorage.setItem(STORAGE_KEY_PREFIX + 'discenti', JSON.stringify(INITIAL_DISCENTI));
          localStorage.setItem(STORAGE_KEY_PREFIX + 'roster_rev_9240629a', 'rev_9240629a');
        } catch (e) {}
        return INITIAL_DISCENTI;
      }
      return stored;
    }
    return INITIAL_DISCENTI;
  });
  const [faculty, setFaculty] = useState<Faculty[]>(() => {
    if (typeof window !== 'undefined') {
      const rosterRev = localStorage.getItem(STORAGE_KEY_PREFIX + 'roster_rev_faculty_23');
      const stored = getStoredOrDefault('faculty', INITIAL_FACULTY);
      if (!rosterRev || !stored || stored.length !== 23 || !stored.some((f) => f.badgeCode === 'FAC-LEAD')) {
        try {
          localStorage.setItem(STORAGE_KEY_PREFIX + 'faculty', JSON.stringify(INITIAL_FACULTY));
          localStorage.setItem(STORAGE_KEY_PREFIX + 'roster_rev_faculty_23', 'rev_23');
        } catch (e) {}
        return INITIAL_FACULTY;
      }
      return stored;
    }
    return INITIAL_FACULTY;
  });
  const [technicians, setTechnicians] = useState<Technician[]>(() => getStoredOrDefault('technicians', INITIAL_TECHNICIANS));
  const [directors, setDirectors] = useState<Director[]>(() => getStoredOrDefault('directors', INITIAL_DIRECTORS));
  const [regiaStaff, setRegiaStaff] = useState<RegiaStaff[]>(() => getStoredOrDefault('regiaStaff', INITIAL_REGIA_STAFF));
  const [guests, setGuests] = useState<Guest[]>(() => getStoredOrDefault('guests', INITIAL_GUESTS));
  const [actors, setActors] = useState<CourseActor[]>(() => {
    const stored = getStoredOrDefault('actors', INITIAL_ACTORS);
    if (
      !stored ||
      stored.length !== 8 ||
      stored.filter((a) => a.physicalStatus === 'AMPUTATO').length !== 1 ||
      stored.some((a) => a.badgeCode?.startsWith('ATT-'))
    ) {
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'actors', JSON.stringify(INITIAL_ACTORS));
      } catch (e) {}
      return INITIAL_ACTORS;
    }
    return stored.map((found) => {
      const canonical = INITIAL_ACTORS.find((a) => a.id === found.id);
      if (!canonical) return found;
      return {
        ...canonical,
        ...found,
        physicalStatus: canonical.physicalStatus,
        progressStatus: found.progressStatus || canonical.progressStatus || 'STANDBY',
        progressUpdatedAt: found.progressUpdatedAt || canonical.progressUpdatedAt,
        progressUpdatedBy: found.progressUpdatedBy || canonical.progressUpdatedBy,
      };
    });
  });
  const [makeupArtists, setMakeupArtists] = useState<MakeupArtist[]>(() => {
    const stored = getStoredOrDefault('makeupArtists', INITIAL_MAKEUP_ARTISTS);
    if (
      !stored ||
      stored.length !== 3 ||
      stored.some((m) => m.badgeCode?.startsWith('TRUC-') || m.id === 'truc-4')
    ) {
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'makeupArtists', JSON.stringify(INITIAL_MAKEUP_ARTISTS));
      } catch (e) {}
      return INITIAL_MAKEUP_ARTISTS;
    }
    return stored;
  });

  const [evaluations, setEvaluations] = useState<TeamEvaluation[]>(() =>
    getStoredOrDefault('evaluations', [])
  );

  const [simulationPhase, setSimulationPhaseState] = useState<SimulationPhase>('idle');

  const [activeFacultyTeamId, setActiveFacultyTeamId] = useState<number>(1);
  const [activeTechPatientId, setActiveTechPatientId] = useState<number>(1);
  const [selectedDiscenteId, setSelectedDiscenteId] = useState<string>(() =>
    getStoredOrDefault('selectedDiscenteId', 'disc-1')
  );
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(() =>
    getStoredOrDefault('selectedFacultyId', 'fac-1')
  );
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>(() =>
    getStoredOrDefault('selectedTechnicianId', 'tech-1')
  );
  const [selectedDirectorId, setSelectedDirectorId] = useState<string>(() =>
    getStoredOrDefault('selectedDirectorId', 'dir-1')
  );
  const [selectedRegiaId, setSelectedRegiaId] = useState<string>(() =>
    getStoredOrDefault('selectedRegiaId', 'regia-1')
  );
  const [selectedGuestId, setSelectedGuestId] = useState<string>(() =>
    getStoredOrDefault('selectedGuestId', 'guest-1')
  );
  const [currentTab, setCurrentTabState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedTab = localStorage.getItem(STORAGE_KEY_PREFIX + 'active_tab');
      const params = new URLSearchParams(window.location.search);
      const viewParam = (params.get('view') || params.get('public') || '').toLowerCase();
      if (
        viewParam === 'public' ||
        viewParam === 'pubblico' ||
        viewParam === 'true' ||
        viewParam === '1' ||
        viewParam === 'ospite'
      ) {
        return 'public';
      }
      if (viewParam) return viewParam;
      const hasSpecificParam =
        params.get('discente') ||
        params.get('faculty') ||
        params.get('tecnico') ||
        params.get('direttore') ||
        params.get('regia') ||
        params.get('ospite') ||
        params.get('badge') ||
        params.get('id') ||
        params.get('role');
      if (hasSpecificParam) {
        return 'public'; // Will be resolved by App.tsx
      }
      if (storedTab) {
        try {
          const parsed = JSON.parse(storedTab);
          if (parsed && typeof parsed === 'string') return parsed;
        } catch (e) {}
      }
    }
    return 'public';
  });

  const setCurrentTab = useCallback((tab: string) => {
    setCurrentTabState(tab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'active_tab', JSON.stringify(tab));
      } catch (e) {}
    }
  }, []);

  const [selectedCatalogPatientId, setSelectedCatalogPatientId] = useState<number | null>(null);

  // MASCAL Triage Records per Team (Synced in Real-Time across Faculty Tutors)
  const [mascalTriageRecords, setMascalTriageRecordsState] = useState<Record<number, MascalTeamTriageRecord>>(() => {
    return getStoredOrDefault<Record<number, MascalTeamTriageRecord>>('mascalTriageRecords', {});
  });

  // Protesi Catalog State (always sync scenariosUsed with official Day 2 / Day 3 rotations)
  const [protesiCatalog, setProtesiCatalogState] = useState<ProtesiItem[]>(() => {
    const stored = getStoredOrDefault<ProtesiItem[]>('protesiCatalog', PROTESI_CATALOG);
    return PROTESI_CATALOG.map((canonical) => {
      const found = stored.find((p) => p.id === canonical.id);
      if (!found) return canonical;
      return {
        ...found,
        scenariosUsed: canonical.scenariosUsed,
      };
    });
  });

  const updateProtesiItem = useCallback((id: string, updated: Partial<ProtesiItem>) => {
    setProtesiCatalogState((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updated } : item));
      if (typeof window !== 'undefined') {
        localStorage.setItem('protesiCatalog', JSON.stringify(next));
      }
      return next;
    });

    if (db) {
      setDoc(doc(db, 'protesi_catalog', id), updated, { merge: true }).catch((err) => {
        console.warn('Failed to update protesi in firestore:', err);
      });
    }
  }, []);

  const addProtesiItem = useCallback((newItem: ProtesiItem) => {
    setProtesiCatalogState((prev) => {
      const next = [newItem, ...prev.filter((i) => i.id !== newItem.id)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('protesiCatalog', JSON.stringify(next));
      }
      return next;
    });

    if (db) {
      setDoc(doc(db, 'protesi_catalog', newItem.id), newItem, { merge: true }).catch((err) => {
        console.warn('Failed to add protesi to firestore:', err);
      });
    }
  }, []);

  const deleteProtesiItem = useCallback((id: string) => {
    setProtesiCatalogState((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('protesiCatalog', JSON.stringify(next));
      }
      return next;
    });

    if (db) {
      deleteDoc(doc(db, 'protesi_catalog', id)).catch((err) => {
        console.warn('Failed to delete protesi from firestore:', err);
      });
    }
  }, []);

  const resetProtesiCatalog = useCallback(() => {
    setProtesiCatalogState(PROTESI_CATALOG);
    if (typeof window !== 'undefined') {
      localStorage.setItem('protesiCatalog', JSON.stringify(PROTESI_CATALOG));
    }
    if (db) {
      const batch = writeBatch(db);
      PROTESI_CATALOG.forEach((item) => {
        batch.set(doc(db, 'protesi_catalog', item.id), item);
      });
      batch.commit().catch(() => {});
    }
  }, []);

  // Back Navigation History Stack
  const [navigationHistory, setNavigationHistory] = useState<{ tab: string; role: UserRole }[]>([]);
  const [lastAdminOrigin, setLastAdminOrigin] = useState<'regia' | 'direttore' | 'master' | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('trauma_opened_by');
      if (stored === 'regia' || stored === 'direttore' || stored === 'master') return stored as 'regia' | 'direttore' | 'master';
    }
    return null;
  });

  // Track admin origin whenever user is in Master, Regia or Direttori
  useEffect(() => {
    if (currentTab === 'master' || userRole === 'master') {
      setLastAdminOrigin('master');
      setOpenedByRole('master');
    } else if (currentTab === 'regia' || userRole === 'regia') {
      setLastAdminOrigin('regia');
      setOpenedByRole('regia');
    } else if (currentTab === 'direttori' || userRole === 'direttore') {
      setLastAdminOrigin('direttore');
      setOpenedByRole('direttore');
    }
  }, [currentTab, userRole, setOpenedByRole]);

  const navigateToView = useCallback(
    (tab: string, role?: UserRole, origin?: 'regia' | 'direttore' | 'master') => {
      const effectiveOrigin =
        origin ||
        (userRole === 'master' || currentTab === 'master'
          ? 'master'
          : userRole === 'regia' || currentTab === 'regia'
          ? 'regia'
          : userRole === 'direttore' || currentTab === 'direttori'
          ? 'direttore'
          : null);
      if (effectiveOrigin) {
        setOpenedByRole(effectiveOrigin);
        setLastAdminOrigin(effectiveOrigin);
      }
      setNavigationHistory((prev) => [...prev, { tab: currentTab, role: userRole }].slice(-20));
      if (role) setUserRole(role);
      setCurrentTab(tab);
    },
    [currentTab, userRole, setOpenedByRole]
  );

  const navigateBack = useCallback(() => {
    setNavigationHistory((prevStack) => {
      if (prevStack.length > 0) {
        const nextStack = [...prevStack];
        const lastEntry = nextStack.pop()!;
        setCurrentTab(lastEntry.tab);
        setUserRole(lastEntry.role);
        return nextStack;
      }

      // Fallback if stack is empty
      const targetOrigin = openedByRole || lastAdminOrigin;
      if (targetOrigin === 'master') {
        setUserRole('master');
        setCurrentTab('master');
      } else if (targetOrigin === 'regia') {
        setUserRole('regia');
        setCurrentTab('regia');
      } else if (targetOrigin === 'direttore') {
        setUserRole('direttore');
        setCurrentTab('direttori');
      } else {
        setCurrentTab('public');
      }
      return [];
    });
  }, [openedByRole, lastAdminOrigin]);

  const canGoBack =
    navigationHistory.length > 0 ||
    ((Boolean(openedByRole) || Boolean(lastAdminOrigin)) &&
      currentTab !== 'master' &&
      currentTab !== 'regia' &&
      currentTab !== 'direttori');

  const backDestinationLabel = useMemo(() => {
    if (navigationHistory.length > 0) {
      const last = navigationHistory[navigationHistory.length - 1];
      if (last.tab === 'master' || last.role === 'master') return 'Master';
      if (last.tab === 'regia' || last.role === 'regia') return 'Regia';
      if (last.tab === 'direttori' || last.role === 'direttore') return language === 'en' ? 'Directors' : 'Direzione';
      if (last.tab === 'public') return language === 'en' ? 'Public Timeline' : 'Timeline Pubblica';
      if (last.tab === 'tecnici') return language === 'en' ? 'Technicians' : 'Tecnici';
      if (last.tab === 'faculty') return 'Faculty';
      if (last.tab === 'discente') return language === 'en' ? 'Learners' : 'Discenti';
      if (last.tab === 'protesi') return language === 'en' ? 'Prosthetics' : 'Protesi';
      if (last.tab === 'trucco' || last.tab === 'moulage') return language === 'en' ? 'Makeup & Moulage' : 'Visuale Trucco';
      if (last.tab === 'scenari') return language === 'en' ? 'Scenarios' : 'Scenari';
      return language === 'en' ? 'Previous Screen' : 'Schermata Precedente';
    }
    const origin = openedByRole || lastAdminOrigin;
    if (origin === 'master') return 'Master';
    if (origin === 'regia') return 'Regia';
    if (origin === 'direttore') return language === 'en' ? 'Directors' : 'Direzione';
    return language === 'en' ? 'Previous Screen' : 'Indietro';
  }, [navigationHistory, openedByRole, lastAdminOrigin, language]);

  // Suspension Management State
  const [suspensionInfo, setSuspensionInfo] = useState<CourseSuspensionInfo>(() =>
    getStoredOrDefault('suspensionInfo', {
      isSuspended: false,
      reason: '',
    })
  );

  // Scheduled Course Start Gate State (Configurable by Director)
  const getDefaultCourseSchedule = (): CourseStartSchedule => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timeStr = '08:30';
    return {
      scheduledDate: dateStr,
      scheduledTime: timeStr,
      isoTimestamp: `${dateStr}T${timeStr}:00`,
      isGateEnabled: true,
      title: 'HITTER • High Intensive Training Trauma Emergency Response • INTUBATI EM',
      location: 'Centro di Simulazione Avanzata e Medicina Tattica',
    };
  };

  const [courseStartSchedule, setCourseStartSchedule] = useState<CourseStartSchedule>(() =>
    getStoredOrDefault('courseStartSchedule', getDefaultCourseSchedule())
  );

  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Real-time second interval ticker for start gate countdown
  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Full App Simulation permanently disabled
  const [isFullAppSimulating] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'isFullAppSimulating');
    } catch (e) {}
  }, []);

  const targetStartTimeMs = new Date(courseStartSchedule.isoTimestamp).getTime() || 0;
  const rawRemainingMs = Math.max(0, targetStartTimeMs - currentTime);
  const timeRemainingMs = courseStartSchedule.isGatePaused 
    ? (courseStartSchedule.pausedRemainingMs ?? rawRemainingMs)
    : rawRemainingMs;

  // Gate Authorization Protocol:
  // When gate countdown is enabled and reaches 00:00, the course does NOT start automatically.
  // It enters isGateExpiredAwaitingAuth until the Regia / Direction explicitly authorizes the start.
  const isGateExpiredAwaitingAuth =
    Boolean(courseStartSchedule.isGateEnabled) &&
    rawRemainingMs === 0 &&
    !courseStartSchedule.isStartAuthorizedByRegia;

  const isCourseStarted =
    !courseStartSchedule.isGateEnabled ||
    Boolean(courseStartSchedule.isStartAuthorizedByRegia) ||
    Boolean(courseStartSchedule.isOfficialStartTriggered);

  const simulatedClockTime = '';

  const [hasPlayed30MinBeep, setHasPlayed30MinBeep] = useState(false);
  const [isBeeping, setIsBeeping] = useState<boolean>(false);

  const triggerLongBeepWithAnimation = useCallback(() => {
    playLongBeep();
    setIsBeeping(true);
    setTimeout(() => {
      setIsBeeping(false);
    }, 3000);
  }, []);

  // Track previous course start state and processed signal timestamps to play the opening sound synchronously across all profiles
  const prevCourseStartedRef = useRef<boolean>(isCourseStarted);
  const lastProcessedStartSignalRef = useRef<number>(0);
  const isFirstMountCourseRef = useRef<boolean>(true);

  // Synchronized Course Opening Sound across ALL connected profiles (Regia, Direzione, Discenti, Faculty, Tecnici, Ospiti)
  useEffect(() => {
    // If an explicit start signal was broadcast via Firestore within the last 45 seconds and hasn't been played locally
    const signalTs = courseStartSchedule.courseStartSignalTimestamp;
    if (signalTs && signalTs > 0 && signalTs !== lastProcessedStartSignalRef.current) {
      const now = Date.now();
      const ageMs = Math.abs(now - signalTs);
      // Play if signal is fresh (within 45 seconds of emission)
      if (ageMs <= 45000) {
        lastProcessedStartSignalRef.current = signalTs;
        triggerLongBeepWithAnimation();
      } else {
        lastProcessedStartSignalRef.current = signalTs;
      }
    }

    // Also trigger if client is connected during countdown finish (transition from false to true in real time)
    if (isFirstMountCourseRef.current) {
      isFirstMountCourseRef.current = false;
      prevCourseStartedRef.current = isCourseStarted;
      return;
    }

    if (!prevCourseStartedRef.current && isCourseStarted) {
      // Natural countdown completion or gate unlock
      triggerLongBeepWithAnimation();
    }
    prevCourseStartedRef.current = isCourseStarted;
  }, [isCourseStarted, courseStartSchedule.courseStartSignalTimestamp, triggerLongBeepWithAnimation]);

  useEffect(() => {
    if (courseStartSchedule.isGateEnabled && timeRemainingMs > 0) {
      const totalSecs = Math.floor(timeRemainingMs / 1000);
      if (totalSecs <= 1800 && totalSecs >= 1785 && !hasPlayed30MinBeep) {
        triggerLongBeepWithAnimation();
        setHasPlayed30MinBeep(true);
      }
      if (totalSecs > 1815) {
        setHasPlayed30MinBeep(false);
      }
    }
  }, [timeRemainingMs, courseStartSchedule.isGateEnabled, hasPlayed30MinBeep, triggerLongBeepWithAnimation]);

  // Course Field Messages (Private to Directors and Faculty)
  const [courseMessages, setCourseMessages] = useState<CourseMessage[]>(() =>
    getStoredOrDefault('courseMessages', INITIAL_COURSE_MESSAGES)
  );

  const simulatedRoleState: SimulationRoleState | null = null;
  const effectiveCourseMessages = courseMessages;
  const effectiveEvaluations = evaluations;

  // Faculty Authorization Session State
  const [facultyAuthSession, setFacultyAuthSession] = useState<FacultyAuthSession>(() => {
    return getStoredOrDefault<FacultyAuthSession>('facultyAuthSession', {
      isAuthorized: false,
      facultyId: null,
      facultyName: null,
      authorizedAt: null,
    });
  });

  // Simulation Engine & Time Acceleration State
  const [timeMultiplier, setTimeMultiplierState] = useState<number>(() => getStoredOrDefault('timeMultiplier', 1));
  const [autoAdvancePhases, setAutoAdvancePhasesState] = useState<boolean>(() => getStoredOrDefault('autoAdvancePhases', true));
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);

  // Free Direct Access State (Accesso Libero per Discenti)
  const [freeAccessEnabled, setFreeAccessEnabledState] = useState<boolean>(() =>
    getStoredOrDefault<boolean>('freeAccessEnabled', false)
  );
  const [isAreaDiscentiModalOpen, setIsAreaDiscentiModalOpen] = useState<boolean>(false);

  // Tactical Multi-Layer Map Modal State
  const [isTacticalMapOpen, setIsTacticalMapOpen] = useState<boolean>(false);

  // Fullscreen View Mode State for Training Rooms
  const [isFullscreenMode, setIsFullscreenModeState] = useState<boolean>(false);

  const setIsFullscreenMode = useCallback((val: boolean) => {
    setIsFullscreenModeState(val);
    if (typeof document !== 'undefined') {
      if (val) {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {
            // Fallback to viewport-expanded mode when browser blocks native fullscreen in iframe
          });
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    }
  }, []);

  const toggleFullscreenMode = useCallback(() => {
    setIsFullscreenMode(!isFullscreenMode);
  }, [isFullscreenMode, setIsFullscreenMode]);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreenModeState(false);
      } else {
        setIsFullscreenModeState(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenMode) {
        setIsFullscreenMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreenMode, setIsFullscreenMode]);

  const setFreeAccessEnabled = useCallback((enabled: boolean) => {
    setFreeAccessEnabledState(enabled);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'freeAccessEnabled', JSON.stringify(enabled));
      } catch (e) {}
    }
    if (db) {
      setDoc(
        doc(db, 'course_state', 'current_state'),
        {
          freeAccessEnabled: enabled,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, 'course_state/current_state');
      });
    }
  }, []);

  // Real-Time Mesh Synchronization State
  const [clientId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('trauma_sim_client_id');
      if (stored) return stored;
      const newId = `NODE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      sessionStorage.setItem('trauma_sim_client_id', newId);
      return newId;
    }
    return `NODE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  });

  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number>(Date.now());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [peersMap, setPeersMap] = useState<Record<string, { role: UserRole; lastSeen: number }>>({});
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [devicePresenceMap, setDevicePresenceMap] = useState<Record<string, DevicePresenceRecord>>({});
  const hasSeededPatientsRef = useRef<boolean>(false);

  // -------------------------------------------------------------
  // FIRESTORE REAL-TIME SYNCHRONIZATION LISTENERS
  // -------------------------------------------------------------
  useEffect(() => {
    if (isQuotaExhausted()) {
      setIsFirebaseCloudConnected(false);
      return;
    }

    const unsubscribers: (() => void)[] = [];

    const handleSnapshotError = (err: unknown, op: OperationType, path: string) => {
      setIsFirebaseCloudConnected(false);
      handleFirestoreError(err, op, path);
      if (isQuotaExhausted()) {
        unsubscribers.forEach((u) => {
          try { u(); } catch (e) {}
        });
        unsubscribers.length = 0;
      }
    };

    // 1. Listen to Course State
    const courseStatePath = 'course_state';
    try {
      const unsubState = onSnapshot(
        doc(db, courseStatePath, 'current_state'),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (typeof data.activeDay === 'number') setActiveDayState(data.activeDay as CourseDay);
            if (typeof data.activeSlotIndex === 'number') setActiveSlotIndexState(data.activeSlotIndex);
            if (typeof data.timerSeconds === 'number') setTimerSeconds(data.timerSeconds);
            if (typeof data.isTimerRunning === 'boolean') setIsTimerRunning(data.isTimerRunning);
            if (typeof data.timeMultiplier === 'number') setTimeMultiplierState(data.timeMultiplier);
            if (typeof data.autoAdvancePhases === 'boolean') setAutoAdvancePhasesState(data.autoAdvancePhases);
            if (data.suspensionInfo) setSuspensionInfo(data.suspensionInfo);
            if (data.courseStartSchedule) setCourseStartSchedule(data.courseStartSchedule);
            if (data.authorizedMacroBlocks) setAuthorizedMacroBlocks(data.authorizedMacroBlocks);
            if (typeof data.freeAccessEnabled === 'boolean') setFreeAccessEnabledState(data.freeAccessEnabled);
            if (typeof data.simulationPhase === 'string') setSimulationPhaseState(data.simulationPhase as SimulationPhase);
            if (data.language === 'it' || data.language === 'en') {
              setLanguageState((prevLang) => {
                if (prevLang !== data.language) {
                  try {
                    localStorage.setItem(STORAGE_KEY_PREFIX + 'language', JSON.stringify(data.language));
                  } catch (e) {}
                  return data.language as Language;
                }
                return prevLang;
              });
            }
            setLastSyncTimestamp(Date.now());
            setIsFirebaseCloudConnected(true);
          } else {
            // Document does not exist yet; initialize it in Firestore if not quota exhausted
            if (!isQuotaExhausted()) {
              const initialCourseState = {
                activeDay: 1,
                activeSlotIndex: 0,
                isTimerRunning: false,
                timerSeconds: 30 * 60,
                timeMultiplier: 1,
                autoAdvancePhases: true,
                suspensionInfo: { isSuspended: false, reason: '' },
                courseStartSchedule: getDefaultCourseSchedule(),
                freeAccessEnabled: false,
                updatedAt: new Date().toISOString(),
              };
              setDoc(doc(db, courseStatePath, 'current_state'), initialCourseState).catch((err) => {
                handleFirestoreError(err, OperationType.CREATE, `${courseStatePath}/current_state`);
              });
            }
          }
        },
        (error) => {
          handleSnapshotError(error, OperationType.GET, `${courseStatePath}/current_state`);
        }
      );
      unsubscribers.push(unsubState);
    } catch (err) {
      console.warn('Failed to listen to course_state:', err);
    }


    // 3. Listen to Course Messages
    const messagesPath = 'course_messages';
    try {
      const unsubMessages = onSnapshot(
        collection(db, messagesPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const msgsList: CourseMessage[] = [];
            snapshot.forEach((d) => msgsList.push(d.data() as CourseMessage));
            msgsList.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
            setCourseMessages(msgsList);
            setLastSyncTimestamp(Date.now());
          }
        },
        (error) => {
          handleSnapshotError(error, OperationType.LIST, messagesPath);
        }
      );
      unsubscribers.push(unsubMessages);
    } catch (err) {
      console.warn('Failed to listen to course_messages:', err);
    }

    // 4. Listen to Team Evaluations
    const evalsPath = 'evaluations';
    try {
      const unsubEvals = onSnapshot(
        collection(db, evalsPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const evalsList: TeamEvaluation[] = [];
            snapshot.forEach((d) => evalsList.push(d.data() as TeamEvaluation));
            setEvaluations(evalsList);
            setLastSyncTimestamp(Date.now());
          } else {
            setEvaluations([]);
          }
        },
        (error) => {
          handleSnapshotError(error, OperationType.LIST, evalsPath);
        }
      );
      unsubscribers.push(unsubEvals);
    } catch (err) {
      console.warn('Failed to listen to evaluations:', err);
    }

    // 5. Listen to Simulator Patients
    const patientsPath = 'simulator_patients';
    try {
      const unsubPatients = onSnapshot(
        collection(db, patientsPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const patientsList: SimulatorPatient[] = [];
            snapshot.forEach((d) => patientsList.push(d.data() as SimulatorPatient));
            patientsList.sort((a, b) => a.id - b.id);
            if (patientsList.length >= 24) {
              setSimulatorPatients(patientsList);
            } else {
              setSimulatorPatients(INITIAL_SIMULATOR_PATIENTS);
              if (!isQuotaExhausted() && !hasSeededPatientsRef.current) {
                hasSeededPatientsRef.current = true;
                INITIAL_SIMULATOR_PATIENTS.forEach((p) => {
                  setDoc(doc(db, patientsPath, p.id.toString()), p).catch(() => {});
                });
              }
            }
            setLastSyncTimestamp(Date.now());
          } else {
            if (!isQuotaExhausted() && !hasSeededPatientsRef.current) {
              hasSeededPatientsRef.current = true;
              INITIAL_SIMULATOR_PATIENTS.forEach((p) => {
                setDoc(doc(db, patientsPath, p.id.toString()), p).catch(() => {});
              });
            }
            setSimulatorPatients(INITIAL_SIMULATOR_PATIENTS);
          }
        },
        (error) => {
          handleSnapshotError(error, OperationType.LIST, patientsPath);
        }
      );
      unsubscribers.push(unsubPatients);
    } catch (err) {
      console.warn('Failed to listen to simulator_patients:', err);
    }

    // 6. Listen to Teams
    const teamsPath = 'teams';
    try {
      const unsubTeams = onSnapshot(
        collection(db, teamsPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Team[] = [];
            snapshot.forEach((d) => {
              const data = d.data();
              const parsedId = Number(data.id ?? d.id);
              list.push({
                ...data,
                id: !isNaN(parsedId) && parsedId > 0 ? parsedId : list.length + 1,
              } as Team);
            });
            list.sort((a, b) => a.id - b.id);
            setTeams(list.length > 0 ? list : INITIAL_TEAMS);
            setLastSyncTimestamp(Date.now());
          }
        },
        (error) => {
          handleSnapshotError(error, OperationType.LIST, teamsPath);
        }
      );
      unsubscribers.push(unsubTeams);
    } catch (err) {
      console.warn('Failed to listen to teams:', err);
    }

    // 7. Listen to Discenti
    const discentiPath = 'discenti';
    try {
      const unsubDiscenti = onSnapshot(
        collection(db, discentiPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Discente[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Partial<Discente>;
              const safeId = String(data.id || d.id || '').trim();
              if (safeId) {
                list.push({
                  ...data,
                  id: safeId,
                  name: data.name || 'Discente',
                  role: data.role || 'Operatore',
                  teamId: Number(data.teamId) || 1,
                  nationality: data.nationality || 'Italiana',
                  badgeCode: data.badgeCode || safeId.toUpperCase(),
                } as Discente);
              }
            });
            if (list.length > 0) {
              setDiscenti(list);
              setLastSyncTimestamp(Date.now());
            }
          }
        },
        (error) => {
          handleSnapshotError(error, OperationType.LIST, discentiPath);
        }
      );
      unsubscribers.push(unsubDiscenti);
    } catch (err) {
      console.warn('Failed to listen to discenti:', err);
    }

    // 8. Listen to Faculty
    const facultyPath = 'faculty';
    try {
      const unsubFaculty = onSnapshot(
        collection(db, facultyPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Faculty[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Partial<Faculty>;
              const safeId = String(data.id || d.id || '').trim();
              if (safeId) {
                list.push({
                  ...data,
                  id: safeId,
                  name: data.name || 'Faculty',
                  title: data.title || 'Docente',
                  specialty: data.specialty || '',
                  nationality: data.nationality || 'Italiana',
                  assignedTeamId: Number(data.assignedTeamId) || 1,
                  phone: data.phone || '',
                  badgeCode: data.badgeCode || safeId.toUpperCase(),
                } as Faculty);
              }
            });
            if (list.length > 0) {
              setFaculty(list);
              setLastSyncTimestamp(Date.now());
            }
          }
        },
        (error) => {
          handleSnapshotError(error, OperationType.LIST, facultyPath);
        }
      );
      unsubscribers.push(unsubFaculty);
    } catch (err) {
      console.warn('Failed to listen to faculty:', err);
    }

    // 9. Listen to Technicians
    const techsPath = 'technicians';
    try {
      const unsubTechs = onSnapshot(
        collection(db, techsPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Technician[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Partial<Technician>;
              const safeId = String(data.id || d.id || '').trim();
              if (safeId) {
                list.push({
                  ...data,
                  id: safeId,
                  name: data.name || 'Tecnico',
                  specialty: data.specialty || '',
                  nationality: data.nationality || 'Italiana',
                  phone: data.phone || '',
                  assignedStations: data.assignedStations || [],
                  badgeCode: data.badgeCode || safeId.toUpperCase(),
                } as Technician);
              }
            });
            if (list.length > 0) {
              setTechnicians(list);
              setLastSyncTimestamp(Date.now());
            }
          }
        },
        (error) => {
          handleSnapshotError(error, OperationType.LIST, techsPath);
        }
      );
      unsubscribers.push(unsubTechs);
    } catch (err) {
      console.warn('Failed to listen to technicians:', err);
    }

    // 10. Listen to Directors
    const directorsPath = 'directors';
    try {
      const unsubDirs = onSnapshot(
        collection(db, directorsPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Director[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Partial<Director>;
              const safeId = String(data.id || d.id || '').trim();
              if (safeId) {
                list.push({
                  ...data,
                  id: safeId,
                  name: data.name || 'Direttore',
                  title: data.title || '',
                  nationality: data.nationality || 'Italiana',
                  badgeCode: data.badgeCode || safeId.toUpperCase(),
                } as Director);
              }
            });
            if (list.length > 0) {
              setDirectors(list);
              setLastSyncTimestamp(Date.now());
            }
          }
        },
        (error) => {
          handleSnapshotError(error, OperationType.LIST, directorsPath);
        }
      );
      unsubscribers.push(unsubDirs);
    } catch (err) {
      console.warn('Failed to listen to directors:', err);
    }

    // 10b. Listen to Regia Staff
    const regiaPath = 'regiaStaff';
    try {
      const unsubRegia = onSnapshot(
        collection(db, regiaPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: RegiaStaff[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Partial<RegiaStaff>;
              const safeId = String(data.id || d.id || '').trim();
              if (safeId) {
                list.push({
                  ...data,
                  id: safeId,
                  name: data.name || 'Staff Regia',
                  role: data.role || '',
                  nationality: data.nationality || 'Italiana',
                  badgeCode: data.badgeCode || safeId.toUpperCase(),
                } as RegiaStaff);
              }
            });
            if (list.length > 0) {
              setRegiaStaff(list);
              setLastSyncTimestamp(Date.now());
            }
          }
        },
        (error) => {
          handleSnapshotError(error, OperationType.LIST, regiaPath);
        }
      );
      unsubscribers.push(unsubRegia);
    } catch (err) {
      console.warn('Failed to listen to regiaStaff:', err);
    }

    // 11. Listen to Guests
    const guestsPath = 'guests';
    try {
      const unsubGuests = onSnapshot(
        collection(db, guestsPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Guest[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Partial<Guest>;
              const safeId = String(data.id || d.id || '').trim();
              if (safeId) {
                list.push({
                  ...data,
                  id: safeId,
                  name: data.name || 'Ospite',
                  title: data.title || 'Osservatore',
                  organization: (data as any).organization || (data as any).affiliation || 'Ente Ospite',
                  nationality: data.nationality || 'Italiana',
                  badgeCode: data.badgeCode || safeId.toUpperCase(),
                } as Guest);
              }
            });
            if (list.length > 0) {
              setGuests(list);
              setLastSyncTimestamp(Date.now());
            }
          }
        },
        (error) => {
          handleSnapshotError(error, OperationType.LIST, guestsPath);
        }
      );
      unsubscribers.push(unsubGuests);
    } catch (err) {
      console.warn('Failed to listen to guests:', err);
    }

    // 12. Listen to Device Presence
    const devicePresencePath = 'device_presence';
    try {
      const unsubPresence = onSnapshot(
        collection(db, devicePresencePath),
        (snapshot) => {
          const map: Record<string, DevicePresenceRecord> = {};
          snapshot.forEach((d) => {
            const data = d.data() as DevicePresenceRecord;
            if (data && (data.badgeCode || data.id)) {
              const key = (data.badgeCode || data.id).toUpperCase();
              map[key] = data;
            }
          });
          setDevicePresenceMap(map);
          setLastSyncTimestamp(Date.now());
        },
        (error) => {
          handleSnapshotError(error, OperationType.LIST, devicePresencePath);
        }
      );
      unsubscribers.push(unsubPresence);
    } catch (err) {
      console.warn('Failed to listen to device_presence:', err);
    }

    // 13. Listen to MASCAL Triage Records
    const mascalTriagePath = 'mascal_triage_records';
    try {
      const unsubMascal = onSnapshot(
        collection(db, mascalTriagePath),
        (snapshot) => {
          if (!snapshot.empty) {
            const map: Record<number, MascalTeamTriageRecord> = {};
            snapshot.forEach((d) => {
              const rec = d.data() as MascalTeamTriageRecord;
              if (rec && typeof rec.teamId === 'number') {
                map[rec.teamId] = rec;
              }
            });
            setMascalTriageRecordsState(map);
            try {
              localStorage.setItem(STORAGE_KEY_PREFIX + 'mascalTriageRecords', JSON.stringify(map));
            } catch (e) {}
            setLastSyncTimestamp(Date.now());
          }
        },
        (error) => {
          handleSnapshotError(error, OperationType.LIST, mascalTriagePath);
        }
      );
      unsubscribers.push(unsubMascal);
    } catch (err) {
      console.warn('Failed to listen to mascal_triage_records:', err);
    }

    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, []);

  // BroadcastChannel Mesh & Storage Fallback
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('trauma_sim_live_mesh');
        channelRef.current = bc;

        bc.onmessage = (event) => {
          const msg = event.data;
          if (!msg || typeof msg !== 'object') return;

          setLastSyncTimestamp(Date.now());

          switch (msg.type) {
            case 'HEARTBEAT': {
              if (msg.from && msg.from !== clientId) {
                setPeersMap((prev) => ({
                  ...prev,
                  [msg.from]: { role: msg.role || 'public', lastSeen: Date.now() },
                }));
                if (msg.payload && (msg.payload.badgeCode || msg.payload.id)) {
                  const key = (msg.payload.badgeCode || msg.payload.id).toUpperCase();
                  setDevicePresenceMap((prev) => ({
                    ...prev,
                    [key]: msg.payload,
                  }));
                }
                bc.postMessage({
                  type: 'HEARTBEAT_ACK',
                  from: clientId,
                  to: msg.from,
                  role: userRole,
                });
              }
              break;
            }
            case 'HEARTBEAT_ACK': {
              if (msg.to === clientId && msg.from) {
                setPeersMap((prev) => ({
                  ...prev,
                  [msg.from]: { role: msg.role || 'public', lastSeen: Date.now() },
                }));
                if (msg.payload && (msg.payload.badgeCode || msg.payload.id)) {
                  const key = (msg.payload.badgeCode || msg.payload.id).toUpperCase();
                  setDevicePresenceMap((prev) => ({
                    ...prev,
                    [key]: msg.payload,
                  }));
                }
              }
              break;
            }
            case 'PING': {
              if (msg.from && msg.from !== clientId) {
                bc.postMessage({
                  type: 'PONG',
                  from: clientId,
                  to: msg.from,
                  sentAt: msg.sentAt,
                });
              }
              break;
            }
            case 'PONG': {
              if (msg.to === clientId && msg.sentAt) {
                const diff = Date.now() - msg.sentAt;
                setLatencyMs(Math.max(1, diff));
              }
              break;
            }
            default:
              break;
          }
        };

        bc.postMessage({
          type: 'HEARTBEAT',
          from: clientId,
          role: userRole,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.warn('BroadcastChannel error', err);
      }
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [clientId, userRole]);

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Continuous real-time device heartbeat publisher to Firestore
  const lastFirestorePresenceWriteRef = useRef<number>(0);
  useEffect(() => {
    let activeDeviceId = '';
    let badgeCode = '';
    let displayName = '';

    if (userRole === 'tecnico') {
      const t = technicians.find((tech) => tech.id === selectedTechnicianId) || technicians[0];
      activeDeviceId = t?.id || 'tech-01';
      badgeCode = t?.badgeCode || 'TECH-01';
      displayName = t?.name || 'Tecnico';
    } else if (userRole === 'discente') {
      const d = discenti.find((disc) => disc.id === selectedDiscenteId) || discenti[0];
      activeDeviceId = d?.id || 'disc-01';
      badgeCode = d?.badgeCode || 'DISC-01';
      displayName = d?.name || 'Discente';
    } else if (userRole === 'faculty') {
      const f = faculty.find((fac) => fac.id === selectedFacultyId) || faculty[0];
      activeDeviceId = f?.id || 'fac-01';
      badgeCode = f?.badgeCode || 'FAC-01';
    } else if (userRole === 'master') {
      const r = regiaStaff.find((reg) => reg.isMaster) || regiaStaff[0];
      activeDeviceId = r?.id || 'master-01';
      badgeCode = 'MASTER-01';
      displayName = r?.name ? `★ ${r.name} (Master)` : '★ Master Control';
    } else if (userRole === 'regia') {
      const r = regiaStaff.find((reg) => reg.id === selectedRegiaId) || regiaStaff[0];
      activeDeviceId = r?.id || 'regia-01';
      badgeCode = r?.badgeCode || 'REGIA-01';
      displayName = r?.name || 'Regia Staff';
    } else if (userRole === 'direttore') {
      const dir = directors.find((d) => d.id === selectedDirectorId) || directors[0];
      activeDeviceId = dir?.id || 'dir-01';
      badgeCode = dir?.badgeCode || 'DIR-01';
      displayName = dir?.name || 'Direttore';
    } else {
      activeDeviceId = `guest-${clientId}`;
      badgeCode = 'PUBLIC';
      displayName = 'Schermo Pubblico';
    }

    const deviceDocId = `device-${badgeCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const sendHeartbeat = () => {
      try {
        const payload: DevicePresenceRecord = {
          id: deviceDocId,
          deviceId: activeDeviceId,
          clientId,
          badgeCode: badgeCode.toUpperCase(),
          name: displayName,
          role: userRole,
          status: 'online',
          lastSeen: Date.now(),
          currentSlotIndex: activeSlotIndex,
          activeDay,
          latencyMs: latencyMs ?? 12,
          deviceInfo: typeof navigator !== 'undefined' ? `${navigator.platform || 'Client'} (${window.innerWidth}x${window.innerHeight})` : 'Client',
        };

        // Broadcast presence locally via BroadcastChannel mesh (zero Firestore quota cost)
        channelRef.current?.postMessage({
          type: 'HEARTBEAT',
          from: clientId,
          role: userRole,
          payload,
        });

        // Write to Firestore presence at throttled 60s intervals only if cloud is active
        const now = Date.now();
        if (isFirebaseCloudConnected && db && now - lastFirestorePresenceWriteRef.current >= 60000) {
          lastFirestorePresenceWriteRef.current = now;
          setDoc(doc(db, 'device_presence', deviceDocId), payload, { merge: true }).catch(() => {});
        }
      } catch (e) {}
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [
    userRole,
    selectedTechnicianId,
    selectedDiscenteId,
    selectedFacultyId,
    selectedDirectorId,
    selectedRegiaId,
    technicians,
    discenti,
    faculty,
    directors,
    regiaStaff,
    activeSlotIndex,
    activeDay,
    latencyMs,
    clientId,
  ]);

  // Sync to localStorage as local offline backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'userRole', JSON.stringify(userRole));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'activeDay', JSON.stringify(activeDay));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'activeSlotIndex', JSON.stringify(activeSlotIndex));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'simulatorPatients', JSON.stringify(simulatorPatients));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'teams', JSON.stringify(teams));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'discenti', JSON.stringify(discenti));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'faculty', JSON.stringify(faculty));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'technicians', JSON.stringify(technicians));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'directors', JSON.stringify(directors));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'guests', JSON.stringify(guests));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'actors', JSON.stringify(actors));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'makeupArtists', JSON.stringify(makeupArtists));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'evaluations', JSON.stringify(evaluations));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'suspensionInfo', JSON.stringify(suspensionInfo));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'courseStartSchedule', JSON.stringify(courseStartSchedule));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'courseMessages', JSON.stringify(courseMessages));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'facultyAuthSession', JSON.stringify(facultyAuthSession));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'phaseShiftLogs', JSON.stringify(phaseShiftLogs));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [
    userRole,
    activeDay,
    activeSlotIndex,
    simulatorPatients,
    teams,
    discenti,
    faculty,
    technicians,
    directors,
    guests,
    actors,
    makeupArtists,
    evaluations,
    suspensionInfo,
    courseStartSchedule,
    courseMessages,
    facultyAuthSession,
    phaseShiftLogs,
  ]);

  // Timer ticker with Time Multiplier Acceleration & Auto-Advance
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (isTimerRunning) {
      const tickIntervalMs = timeMultiplier >= 30 ? 200 : timeMultiplier > 1 ? 500 : 1000;
      const secondsPerTick = (timeMultiplier * tickIntervalMs) / 1000;

      timerRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => {
          const nextVal = prev - secondsPerTick;
          if (nextVal <= 0) {
            playBroadcastSound('phase_change');
            if (autoAdvancePhases) {
              setActiveSlotIndexState((currentSlotIdx) => {
                const nextIdx = currentSlotIdx + 1;
                if (nextIdx < INITIAL_TIMELINE_SLOTS.length) {
                  const nextSlotData = INITIAL_TIMELINE_SLOTS[nextIdx];
                  setActiveDayState(nextSlotData.day);
                  setTimerSeconds(nextSlotData.durationMinutes * 60);
                  syncCourseStateToFirestore({
                    activeSlotIndex: nextIdx,
                    activeDay: nextSlotData.day,
                    timerSeconds: nextSlotData.durationMinutes * 60,
                  });
                  return nextIdx;
                } else {
                  setIsTimerRunning(false);
                  syncCourseStateToFirestore({ isTimerRunning: false });
                  return currentSlotIdx;
                }
              });
              return 0;
            }
            return 0;
          }
          return Math.max(0, Math.round(nextVal));
        });
      }, tickIntervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeMultiplier, autoAdvancePhases, syncCourseStateToFirestore]);

  const broadcastTimelineUpdate = useCallback(
    (detail: { activeSlotIndex?: number; activeDay?: CourseDay; timerSeconds?: number; isTimerRunning?: boolean }) => {
      if (typeof window === 'undefined') return;
      try {
        if (detail.activeSlotIndex !== undefined) {
          localStorage.setItem(STORAGE_KEY_PREFIX + 'activeSlotIndex', JSON.stringify(detail.activeSlotIndex));
        }
        if (detail.activeDay !== undefined) {
          localStorage.setItem(STORAGE_KEY_PREFIX + 'activeDay', JSON.stringify(detail.activeDay));
        }
        window.dispatchEvent(new CustomEvent('trauma_timeline_change', { detail }));
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('trauma_timeline_channel');
          bc.postMessage(detail);
          bc.close();
        }
      } catch (e) {}
    },
    []
  );

  const setActiveDay = useCallback((day: CourseDay) => {
    setActiveDayState(day);
    const firstIdx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.day === day);
    if (firstIdx !== -1) {
      setActiveSlotIndexState(firstIdx);
      const slot = INITIAL_TIMELINE_SLOTS[firstIdx];
      const newSecs = getSlotDurationSeconds(slot);
      setTimerSeconds(newSecs);
      setIsTimerRunning(false);
      broadcastTimelineUpdate({ activeDay: day, activeSlotIndex: firstIdx, timerSeconds: newSecs, isTimerRunning: false });
      syncCourseStateToFirestore({
        activeDay: day,
        activeSlotIndex: firstIdx,
        timerSeconds: newSecs,
        isTimerRunning: false,
      });
    }
  }, [syncCourseStateToFirestore, broadcastTimelineUpdate]);

  const setActiveSlotIndex = useCallback((idx: number) => {
    if (idx >= 0 && idx < INITIAL_TIMELINE_SLOTS.length) {
      setActiveSlotIndexState(idx);
      const slot = INITIAL_TIMELINE_SLOTS[idx];
      setActiveDayState(slot.day);
      const newSecs = getSlotDurationSeconds(slot);
      setTimerSeconds(newSecs);
      setIsTimerRunning(false);
      broadcastTimelineUpdate({ activeSlotIndex: idx, activeDay: slot.day, timerSeconds: newSecs, isTimerRunning: false });
      syncCourseStateToFirestore({
        activeSlotIndex: idx,
        activeDay: slot.day,
        timerSeconds: newSecs,
        isTimerRunning: false,
      });
    }
  }, [syncCourseStateToFirestore, broadcastTimelineUpdate]);

  const nextSlot = useCallback(() => {
    setActiveSlotIndexState((prev) => {
      const next = prev + 1;
      if (next < INITIAL_TIMELINE_SLOTS.length) {
        const slot = INITIAL_TIMELINE_SLOTS[next];
        setActiveDayState(slot.day);
        const newSecs = getSlotDurationSeconds(slot);
        setTimerSeconds(newSecs);
        setIsTimerRunning(false);
        playBroadcastSound('phase_change');
        broadcastTimelineUpdate({ activeSlotIndex: next, activeDay: slot.day, timerSeconds: newSecs, isTimerRunning: false });
        syncCourseStateToFirestore({
          activeSlotIndex: next,
          activeDay: slot.day,
          timerSeconds: newSecs,
          isTimerRunning: false,
        });
        return next;
      }
      return prev;
    });
  }, [syncCourseStateToFirestore, broadcastTimelineUpdate]);

  const prevSlot = useCallback(() => {
    setActiveSlotIndexState((prev) => {
      const next = Math.max(0, prev - 1);
      const slot = INITIAL_TIMELINE_SLOTS[next];
      setActiveDayState(slot.day);
      const newSecs = getSlotDurationSeconds(slot);
      setTimerSeconds(newSecs);
      setIsTimerRunning(false);
      broadcastTimelineUpdate({ activeSlotIndex: next, activeDay: slot.day, timerSeconds: newSecs, isTimerRunning: false });
      syncCourseStateToFirestore({
        activeSlotIndex: next,
        activeDay: slot.day,
        timerSeconds: newSecs,
        isTimerRunning: false,
      });
      return next;
    });
  }, [syncCourseStateToFirestore, broadcastTimelineUpdate]);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning((prev) => {
      const nextVal = !prev;
      syncCourseStateToFirestore({ isTimerRunning: nextVal, timerSeconds });
      return nextVal;
    });
  }, [timerSeconds, syncCourseStateToFirestore]);

  const resetTimer = useCallback((customSeconds?: number) => {
    setIsTimerRunning(false);
    const secs = customSeconds !== undefined ? customSeconds : (currentSlot?.durationMinutes || 30) * 60;
    setTimerSeconds(secs);
    syncCourseStateToFirestore({ isTimerRunning: false, timerSeconds: secs });
  }, [currentSlot, syncCourseStateToFirestore]);

  const adjustTimer = useCallback((secondsDelta: number) => {
    setTimerSeconds((prev) => {
      const nextVal = Math.max(0, prev + secondsDelta);
      syncCourseStateToFirestore({ timerSeconds: nextVal });
      return nextVal;
    });
  }, [syncCourseStateToFirestore]);

  const suspendCourse = useCallback((reason: string, suspendedBy: string = 'Direzione Corso') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newSuspension: CourseSuspensionInfo = {
      isSuspended: true,
      reason: reason || 'Sospensione temporanea attività sul campo per allineamento didattico/logistico',
      suspendedAt: timeStr,
      suspendedBy,
    };

    setSuspensionInfo(newSuspension);
    setIsTimerRunning(false);
    playBroadcastSound('emergency');

    // Persist to Firestore
    syncCourseStateToFirestore({
      suspensionInfo: newSuspension,
      isTimerRunning: false,
    });
  }, [syncCourseStateToFirestore]);

  const resumeCourse = useCallback((resumedBy: string = 'Direzione Corso') => {
    const clearedSuspension: CourseSuspensionInfo = {
      isSuspended: false,
      reason: '',
      suspendedAt: undefined,
      suspendedBy: undefined,
    };

    setSuspensionInfo(clearedSuspension);
    playBroadcastSound('info');

    // Persist to Firestore
    syncCourseStateToFirestore({
      suspensionInfo: clearedSuspension,
    });
  }, [syncCourseStateToFirestore]);

  const sendCourseMessage = useCallback((msgData: Omit<CourseMessage, 'id' | 'timestamp' | 'status'>) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg: CourseMessage = {
      ...msgData,
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeStr,
      status: 'pending',
    };

    setCourseMessages((prev) => [newMsg, ...prev]);

    if (newMsg.type === 'emergency' || newMsg.type === 'warning') {
      playBroadcastSound(newMsg.type);
    }

    setDoc(doc(db, 'course_messages', newMsg.id), newMsg).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `course_messages/${newMsg.id}`);
    });
  }, []);

  const acknowledgeCourseMessage = useCallback((id: string, ackBy: string = 'Direzione / Faculty') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setCourseMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: 'acknowledged',
              acknowledgedBy: ackBy,
              acknowledgedAt: timeStr,
            }
          : m
      )
    );

    updateDoc(doc(db, 'course_messages', id), {
      status: 'acknowledged',
      acknowledgedBy: ackBy,
      acknowledgedAt: timeStr,
    }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `course_messages/${id}`);
    });
  }, []);

  const deleteCourseMessage = useCallback((id: string) => {
    setCourseMessages((prev) => prev.filter((m) => m.id !== id));
    deleteDoc(doc(db, 'course_messages', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `course_messages/${id}`);
    });
  }, []);


  const recordPhaseShiftLog = useCallback((entryData: Omit<PhaseShiftLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newEntry: PhaseShiftLogEntry = {
      ...entryData,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeStr,
      dateTimeStr: now.toLocaleString(),
    };
    setPhaseShiftLogs((prev) => [newEntry, ...prev]);
    setDoc(doc(db, 'phase_shift_logs', newEntry.id), newEntry).catch((err) => {
      // ignore
    });
  }, []);

  const clearPhaseShiftLogs = useCallback(() => {
    setPhaseShiftLogs([]);
  }, []);

  const updateSimulatorPatient = useCallback((patientId: number, updates: Partial<SimulatorPatient>) => {
    setSimulatorPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, ...updates } : p))
    );

    setDoc(doc(db, 'simulator_patients', String(patientId)), updates, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `simulator_patients/${patientId}`);
    });
  }, []);

  const addSimulatorPatient = useCallback((newPatientData: Omit<SimulatorPatient, 'id'>) => {
    setSimulatorPatients((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev.map((p) => p.id)) + 1 : 1;
      const newPatient: SimulatorPatient = {
        ...newPatientData,
        id: nextId,
        techChecklist: newPatientData.techChecklist || {
          preDone: false,
          intraDone: false,
          postDone: false,
        },
      };
      setDoc(doc(db, 'simulator_patients', String(nextId)), newPatient).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `simulator_patients/${nextId}`);
      });
      return [...prev, newPatient];
    });
  }, []);

  const deleteSimulatorPatient = useCallback((patientId: number) => {
    setSimulatorPatients((prev) => prev.filter((p) => p.id !== patientId));
    deleteDoc(doc(db, 'simulator_patients', String(patientId))).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `simulator_patients/${patientId}`);
    });
  }, []);

  const resetSimulatorPatients = useCallback(() => {
    setSimulatorPatients(INITIAL_SIMULATOR_PATIENTS);
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'simulatorPatients');
    } catch (e) {}
    INITIAL_SIMULATOR_PATIENTS.forEach((p) => {
      setDoc(doc(db, 'simulator_patients', String(p.id)), p).catch(() => {});
    });
  }, []);

  const updateTechChecklist = useCallback(
    (patientId: number, phase: 'preDone' | 'intraDone' | 'postDone', val: boolean, notes?: string) => {
      const timeStr = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      let linkedActorId: string | undefined;

      setSimulatorPatients((prev) =>
        prev.map((p) => {
          if (p.id !== patientId) return p;
          linkedActorId = p.assignedActorId;
          const updatedChecklist = {
            ...p.techChecklist,
            [phase]: val,
            verifiedAt: timeStr,
          };
          const nextActorProgress: ActorProgressStatus | undefined =
            phase === 'preDone'
              ? val
                ? 'PRONTO_T0'
                : 'IN_PREPARAZIONE'
              : p.actorProgressStatus;

          const updatedPatient: SimulatorPatient = {
            ...p,
            techChecklist: updatedChecklist,
            actorProgressStatus: nextActorProgress,
            actorProgressUpdatedAt: phase === 'preDone' ? timeStr : p.actorProgressUpdatedAt,
            techNotes: notes !== undefined ? notes : p.techNotes,
          };

          setDoc(doc(db, 'simulator_patients', String(patientId)), updatedPatient, { merge: true }).catch((err) => {
            handleFirestoreError(err, OperationType.UPDATE, `simulator_patients/${patientId}`);
          });

          return updatedPatient;
        })
      );

      if (phase === 'preDone' && linkedActorId) {
        const targetId = linkedActorId;
        setActors((prev) =>
          prev.map((a) =>
            a.id === targetId
              ? {
                  ...a,
                  progressStatus: val ? 'PRONTO_T0' : 'IN_PREPARAZIONE',
                  progressUpdatedAt: timeStr,
                }
              : a
          )
        );
      }
    },
    []
  );

  const saveEvaluation = useCallback((evalData: Omit<TeamEvaluation, 'id' | 'timestamp'> | TeamEvaluation) => {
    const existingId = (evalData as any).id;
    const finalId =
      existingId && String(existingId).trim() !== ''
        ? existingId
        : `eval-t${evalData.teamId}-p${evalData.patientId || 0}-${(evalData.phase || 'extra').toLowerCase()}-${Date.now()}`;
    const timestamp =
      (evalData as any).timestamp ||
      new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

    const newEval: TeamEvaluation = {
      ...evalData,
      id: finalId,
      timestamp,
    };

    setEvaluations((prev) => {
      const existingIdx = prev.findIndex(
        (e) =>
          e.id === finalId ||
          ((evalData as any).id && e.id === (evalData as any).id) ||
          (e.teamId === evalData.teamId &&
            Number(e.patientId) === Number(evalData.patientId) &&
            e.phase === evalData.phase)
      );
      let updated: TeamEvaluation[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = newEval;
      } else {
        updated = [newEval, ...prev];
      }
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'evaluations', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setDoc(doc(db, 'evaluations', newEval.id), newEval, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `evaluations/${newEval.id}`);
    });
  }, []);

  const saveMascalTeamAssessment = useCallback(
    (teamId: number, assessment: MascalTeamCasualtyAssessment) => {
      setMascalTriageRecordsState((prev) => {
        const existing = prev[teamId] || {
          teamId,
          assessments: {},
          totalAssessed: 0,
          totalCorrect: 0,
          accuracyPercent: 0,
          underTriageCount: 0,
          overTriageCount: 0,
          averageSecondsPerCasualty: 0,
          totalLsiCompleted: 0,
          lastUpdated: Date.now(),
        };

        const updatedAssessments = {
          ...existing.assessments,
          [assessment.casualtyId]: assessment,
        };

        const entries = Object.values(updatedAssessments);
        const totalAssessed = entries.filter((a) => Boolean(a.assignedCategory)).length;
        const totalCorrect = entries.filter((a) => a.isCorrect === true).length;
        const underTriageCount = entries.filter((a) => a.isUnderTriage === true).length;
        const overTriageCount = entries.filter((a) => a.isOverTriage === true).length;
        const accuracyPercent = totalAssessed > 0 ? Math.round((totalCorrect / totalAssessed) * 100) : 0;

        const timedEntries = entries.filter(
          (a) => typeof a.secondsToCategorize === 'number' && a.secondsToCategorize > 0
        );
        const averageSecondsPerCasualty =
          timedEntries.length > 0
            ? Math.round(
                timedEntries.reduce((sum, a) => sum + (a.secondsToCategorize || 0), 0) / timedEntries.length
              )
            : 0;

        const totalLsiCompleted = entries.reduce(
          (sum, a) => sum + (a.performedLsi ? a.performedLsi.length : 0),
          0
        );

        const newRecord: MascalTeamTriageRecord = {
          teamId,
          assessments: updatedAssessments,
          totalAssessed,
          totalCorrect,
          accuracyPercent,
          underTriageCount,
          overTriageCount,
          averageSecondsPerCasualty,
          totalLsiCompleted,
          lastUpdated: Date.now(),
        };

        const nextState = {
          ...prev,
          [teamId]: newRecord,
        };

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY_PREFIX + 'mascalTriageRecords', JSON.stringify(nextState));
            const bc = new BroadcastChannel('trauma_timeline_channel');
            bc.postMessage({ mascalTriageRecords: nextState });
            bc.close();
          } catch (e) {}
        }

        if (db) {
          setDoc(doc(db, 'mascal_triage_records', `team_${teamId}`), newRecord, { merge: true }).catch((err) => {
            handleFirestoreError(err, OperationType.UPDATE, `mascal_triage_records/team_${teamId}`);
          });
        }

        return nextState;
      });
    },
    [handleFirestoreError]
  );

  const resetMascalTeamTriage = useCallback((teamId?: number) => {
    setMascalTriageRecordsState((prev) => {
      let nextState: Record<number, MascalTeamTriageRecord>;
      if (typeof teamId === 'number') {
        nextState = { ...prev };
        delete nextState[teamId];
        if (db) {
          deleteDoc(doc(db, 'mascal_triage_records', `team_${teamId}`)).catch(() => {});
        }
      } else {
        nextState = {};
        if (db) {
          for (let i = 1; i <= 12; i++) {
            deleteDoc(doc(db, 'mascal_triage_records', `team_${i}`)).catch(() => {});
          }
        }
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_PREFIX + 'mascalTriageRecords', JSON.stringify(nextState));
          const bc = new BroadcastChannel('trauma_timeline_channel');
          bc.postMessage({ mascalTriageRecords: nextState });
          bc.close();
        } catch (e) {}
      }
      return nextState;
    });
  }, []);


  const bulkSaveEvaluations = useCallback((evalsData: Omit<TeamEvaluation, 'id' | 'timestamp'>[]) => {
    const timestamp = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const newEvals: TeamEvaluation[] = evalsData.map((evalData, idx) => ({
      ...evalData,
      id: `eval-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
    }));

    setEvaluations((prev) => {
      let copy = [...prev];
      for (const item of newEvals) {
        const existingIdx = copy.findIndex(
          (e) => e.teamId === item.teamId && e.day === item.day && e.period === item.period
        );
        if (existingIdx >= 0) {
          copy[existingIdx] = item;
        } else {
          copy = [item, ...copy];
        }
      }
      return copy;
    });

    // Write in batch to Firestore
    try {
      const batch = writeBatch(db);
      newEvals.forEach((ev) => {
        const ref = doc(db, 'evaluations', ev.id);
        batch.set(ref, ev);
      });
      batch.commit().catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'evaluations');
      });
    } catch (err) {
      console.warn('Batch evaluations error:', err);
    }
  }, []);

  const getEvaluationForTeamAndSlot = useCallback(
    (teamId: number, day: CourseDay, period: string) => {
      return evaluations.find((e) => e.teamId === teamId && e.day === day && e.period === period);
    },
    [evaluations]
  );

  const updateTeam = useCallback((teamId: number, updates: Partial<Team>) => {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, ...updates } : t)));
    setDoc(doc(db, 'teams', String(teamId)), updates, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `teams/${teamId}`);
    });
  }, []);

  // Discenti CRUD
  const updateDiscente = useCallback((id: string, updates: Partial<Discente>) => {
    setDiscenti((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    setDoc(doc(db, 'discenti', id), updates, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `discenti/${id}`);
    });
  }, []);

  const addDiscente = useCallback((newDiscente: Omit<Discente, 'id'>) => {
    const id = `disc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullDiscente: Discente = { ...newDiscente, id };
    setDiscenti((prev) => [...prev, fullDiscente]);
    setDoc(doc(db, 'discenti', id), fullDiscente).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `discenti/${id}`);
    });
  }, []);

  const deleteDiscente = useCallback((id: string) => {
    setDiscenti((prev) => prev.filter((d) => d.id !== id));
    deleteDoc(doc(db, 'discenti', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `discenti/${id}`);
    });
  }, []);

  const assignScenarioRoles = useCallback(
    (
      assignments: {
        discenteId: string;
        role: string;
        scenarioType: ScenarioType;
        slotId?: string;
        assignedByFacultyBadge?: string;
      }[]
    ) => {
      const nowIso = new Date().toISOString();
      const assignmentMap = new Map<
        string,
        {
          role: string;
          scenarioType: ScenarioType;
          slotId?: string;
          assignedByFacultyBadge?: string;
        }
      >();

      assignments.forEach((a) => {
        assignmentMap.set(a.discenteId, {
          role: a.role,
          scenarioType: a.scenarioType,
          slotId: a.slotId,
          assignedByFacultyBadge: a.assignedByFacultyBadge,
        });
      });

      setDiscenti((prev) =>
        prev.map((d) => {
          const assign = assignmentMap.get(d.id);
          if (assign) {
            return {
              ...d,
              assignedRole: assign.role,
              activeScenarioRole: assign.role,
              activeScenarioType: assign.scenarioType,
              activeScenarioSlotId: assign.slotId,
              activeScenarioAssignedAt: nowIso,
              activeScenarioAssignedBy: assign.assignedByFacultyBadge,
            };
          }
          return d;
        })
      );

      // Persist to Firestore in batch
      try {
        const batch = writeBatch(db);
        assignments.forEach((a) => {
          const dRef = doc(db, 'discenti', a.discenteId);
          batch.set(
            dRef,
            {
              assignedRole: a.role,
              activeScenarioRole: a.role,
              activeScenarioType: a.scenarioType,
              activeScenarioSlotId: a.slotId || null,
              activeScenarioAssignedAt: nowIso,
              activeScenarioAssignedBy: a.assignedByFacultyBadge || null,
            },
            { merge: true }
          );
        });
        batch.commit().catch((err) => {
          handleFirestoreError(err, OperationType.UPDATE, 'discenti/batch_scenario_roles');
        });
      } catch (err) {
        console.error('Error committing scenario role assignments to Firestore:', err);
      }
    },
    []
  );

  const clearScenarioRolesForTeam = useCallback((teamId: number) => {
    setDiscenti((prev) =>
      prev.map((d) => {
        if (d.teamId === teamId) {
          return {
            ...d,
            assignedRole: undefined,
            activeScenarioRole: undefined,
            activeScenarioType: undefined,
            activeScenarioSlotId: undefined,
            activeScenarioAssignedAt: undefined,
            activeScenarioAssignedBy: undefined,
          };
        }
        return d;
      })
    );

    try {
      getDocs(query(collection(db, 'discenti'), where('teamId', '==', teamId)))
        .then((snapshot) => {
          if (!snapshot.empty) {
            const batch = writeBatch(db);
            snapshot.forEach((dDoc) => {
              batch.set(
                dDoc.ref,
                {
                  assignedRole: null,
                  activeScenarioRole: null,
                  activeScenarioType: null,
                  activeScenarioSlotId: null,
                  activeScenarioAssignedAt: null,
                  activeScenarioAssignedBy: null,
                },
                { merge: true }
              );
            });
            batch.commit().catch((err) => {
              handleFirestoreError(err, OperationType.UPDATE, `discenti/team_${teamId}_roles_clear`);
            });
          }
        })
        .catch((e) => {
          console.warn('Could not query discenti by teamId for clearing roles:', e);
        });
    } catch (err) {
      console.warn('Error clearing scenario roles in Firestore:', err);
    }
  }, []);

  /**
   * Automatically resets the 'assignedRole' field in the Firestore 'discenti' collection
   * once the simulation phase is marked as 'debriefing' or 'completed' to ensure a clean state for the next group.
   */
  const cleanupAssignedRoles = useCallback(
    async (
      optionsOrPhase?: CleanupRolesOptions | 'debriefing' | 'completed' | string,
      targetGroup?: GroupType
    ) => {
      let opts: CleanupRolesOptions = {};
      if (typeof optionsOrPhase === 'string') {
        opts = { phase: optionsOrPhase, group: targetGroup };
      } else if (optionsOrPhase && typeof optionsOrPhase === 'object') {
        opts = optionsOrPhase;
      } else {
        opts = { phase: 'completed' };
      }

      const { phase = 'completed', group, teamId, all } = opts;

      // 1. Immediately reset roles in local state
      setDiscenti((prev) =>
        prev.map((d) => {
          const matchesTeam = teamId !== undefined ? d.teamId === teamId : true;
          const matchesGroup = group && GROUP_TEAM_IDS[group] ? GROUP_TEAM_IDS[group].includes(d.teamId) : true;
          if ((all || (matchesTeam && matchesGroup)) && (d.assignedRole || d.activeScenarioRole)) {
            return {
              ...d,
              assignedRole: undefined,
              activeScenarioRole: undefined,
              activeScenarioType: undefined,
              activeScenarioSlotId: undefined,
              activeScenarioAssignedAt: undefined,
              activeScenarioAssignedBy: undefined,
            };
          }
          return d;
        })
      );

      // 2. Perform Firestore batch reset on 'discenti' collection
      const result = await cleanupDiscentiAssignedRolesInFirestore(db, opts);
      return result;
    },
    []
  );

  const setSimulationPhase = useCallback(
    async (
      phase: SimulationPhase,
      target?: { group?: GroupType; teamId?: number; all?: boolean }
    ) => {
      setSimulationPhaseState(phase);

      if (db) {
        setDoc(
          doc(db, 'course_state', 'current_state'),
          {
            simulationPhase: phase,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      }

      // Automatically reset 'assignedRole' field in Firestore 'discenti' collection
      // once simulation phase is marked as 'debriefing' or 'completed'
      if (phase === 'debriefing' || phase === 'completed') {
        await cleanupAssignedRoles({
          phase,
          group: target?.group,
          teamId: target?.teamId,
          all: target?.all ?? (!target?.group && !target?.teamId),
        });
      }
    },
    [cleanupAssignedRoles]
  );

  // Tracks already cleaned slot phases to prevent duplicate Firestore batch writes
  const cleanedSlotPhasesRef = useRef<Set<string>>(new Set());

  // Automatically monitor timeline slots: when a group enters 'debriefing' or 'completed',
  // automatically trigger the cleanup function on Firestore 'discenti' collection
  useEffect(() => {
    if (!currentSlot) return;

    const groups: GroupType[] = ['A', 'B', 'C', 'D'];
    groups.forEach((grp) => {
      const isDebriefOrCompleted = detectDebriefingOrCompletedForGroup(currentSlot, grp);
      if (isDebriefOrCompleted) {
        const cleanKey = `${currentSlot.id}_${grp}_cleaned`;
        if (!cleanedSlotPhasesRef.current.has(cleanKey)) {
          cleanedSlotPhasesRef.current.add(cleanKey);
          cleanupAssignedRoles({
            phase: 'debriefing',
            group: grp,
          }).catch((err) => {
            console.warn(`[Cleanup] Error auto-resetting assignedRole for group ${grp}:`, err);
          });
        }
      }
    });
  }, [currentSlot, cleanupAssignedRoles]);

  // Ensure practical scenario roles are automatically assigned at RANDOM if not sent during Pre-Allerta T-15
  useEffect(() => {
    if (!currentSlot) return;
    checkAndAutoAssignMissingRoles(discenti, currentSlot, assignScenarioRoles);
  }, [currentSlot, discenti, assignScenarioRoles]);

  // Faculty CRUD
  const updateFaculty = useCallback((id: string, updates: Partial<Faculty>) => {
    setFaculty((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    setDoc(doc(db, 'faculty', id), updates, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `faculty/${id}`);
    });
  }, []);

  const addFaculty = useCallback((newFaculty: Omit<Faculty, 'id'>) => {
    const id = `fac-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullFaculty: Faculty = { ...newFaculty, id };
    setFaculty((prev) => [...prev, fullFaculty]);
    setDoc(doc(db, 'faculty', id), fullFaculty).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `faculty/${id}`);
    });
  }, []);

  const deleteFaculty = useCallback((id: string) => {
    setFaculty((prev) => prev.filter((f) => f.id !== id));
    deleteDoc(doc(db, 'faculty', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `faculty/${id}`);
    });
  }, []);

  // Technician CRUD
  const updateTechnician = useCallback((id: string, updates: Partial<Technician>) => {
    setTechnicians((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    setDoc(doc(db, 'technicians', id), updates, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `technicians/${id}`);
    });
  }, []);

  const addTechnician = useCallback((newTech: Omit<Technician, 'id'>) => {
    const id = `tech-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullTech: Technician = { ...newTech, id };
    setTechnicians((prev) => [...prev, fullTech]);
    setDoc(doc(db, 'technicians', id), fullTech).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `technicians/${id}`);
    });
  }, []);

  const deleteTechnician = useCallback((id: string) => {
    setTechnicians((prev) => prev.filter((t) => t.id !== id));
    deleteDoc(doc(db, 'technicians', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `technicians/${id}`);
    });
  }, []);

  const bulkUpdateTechnicians = useCallback(async (updatedList: Technician[]) => {
    setTechnicians(updatedList);
    try {
      const batch = writeBatch(db);
      updatedList.forEach((t) => {
        const ref = doc(db, 'technicians', t.id);
        batch.set(ref, t, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Batch update technicians error in firestore:', err);
    }
  }, []);

  const bulkUpdateFaculty = useCallback(async (updatedList: Faculty[]) => {
    setFaculty(updatedList);
    try {
      const batch = writeBatch(db);
      updatedList.forEach((f) => {
        const ref = doc(db, 'faculty', f.id);
        batch.set(ref, f, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Batch update faculty error in firestore:', err);
    }
  }, []);

  const bulkUpdateDiscenti = useCallback(async (updatedList: Discente[]) => {
    setDiscenti(updatedList);
    try {
      const batch = writeBatch(db);
      updatedList.forEach((d) => {
        const ref = doc(db, 'discenti', d.id);
        batch.set(ref, d, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Batch update discenti error in firestore:', err);
    }
  }, []);

  // Director CRUD
  const updateDirector = useCallback((id: string, updates: Partial<Director>) => {
    if (updates.isMaster) {
      setDirectors((prev) =>
        prev.map((d) => ({
          ...d,
          isMaster: d.id === id,
        }))
      );
      // Update in firestore for all affected directors
      directors.forEach((d) => {
        const shouldBeMaster = d.id === id;
        if (d.isMaster !== shouldBeMaster) {
          setDoc(doc(db, 'directors', d.id), { isMaster: shouldBeMaster }, { merge: true }).catch((err) => {
            handleFirestoreError(err, OperationType.UPDATE, `directors/${d.id}`);
          });
        }
      });
    } else {
      setDirectors((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
      setDoc(doc(db, 'directors', id), updates, { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `directors/${id}`);
      });
    }
  }, [directors]);

  const addDirector = useCallback((newDirector: Omit<Director, 'id'>) => {
    const id = `dir-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullDirector: Director = { ...newDirector, id };
    setDirectors((prev) => [...prev, fullDirector]);
    setDoc(doc(db, 'directors', id), fullDirector).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `directors/${id}`);
    });
  }, []);

  const deleteDirector = useCallback((id: string) => {
    setDirectors((prev) => prev.filter((d) => d.id !== id));
    deleteDoc(doc(db, 'directors', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `directors/${id}`);
    });
  }, []);

  const bulkUpdateDirectors = useCallback(async (updatedList: Director[]) => {
    setDirectors(updatedList);
    try {
      const batch = writeBatch(db);
      updatedList.forEach((d) => {
        const ref = doc(db, 'directors', d.id);
        batch.set(ref, d, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Batch update directors error in firestore:', err);
    }
  }, []);

  // Regia Staff CRUD
  const updateRegiaStaff = useCallback((id: string, updates: Partial<RegiaStaff>) => {
    if (updates.isMaster) {
      setRegiaStaff((prev) =>
        prev.map((r) => ({
          ...r,
          isMaster: r.id === id,
        }))
      );
      regiaStaff.forEach((r) => {
        const shouldBeMaster = r.id === id;
        if (r.isMaster !== shouldBeMaster) {
          setDoc(doc(db, 'regiaStaff', r.id), { isMaster: shouldBeMaster }, { merge: true }).catch((err) => {
            handleFirestoreError(err, OperationType.UPDATE, `regiaStaff/${r.id}`);
          });
        }
      });
    } else {
      setRegiaStaff((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
      setDoc(doc(db, 'regiaStaff', id), updates, { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `regiaStaff/${id}`);
      });
    }
  }, [regiaStaff]);

  const addRegiaStaff = useCallback((newRegia: Omit<RegiaStaff, 'id'>) => {
    const id = `regia-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullRegia: RegiaStaff = { ...newRegia, id };
    setRegiaStaff((prev) => [...prev, fullRegia]);
    setDoc(doc(db, 'regiaStaff', id), fullRegia).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `regiaStaff/${id}`);
    });
  }, []);

  const deleteRegiaStaff = useCallback((id: string) => {
    setRegiaStaff((prev) => prev.filter((r) => r.id !== id));
    deleteDoc(doc(db, 'regiaStaff', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `regiaStaff/${id}`);
    });
  }, []);

  const bulkUpdateRegiaStaff = useCallback(async (updatedList: RegiaStaff[]) => {
    setRegiaStaff(updatedList);
    try {
      const batch = writeBatch(db);
      updatedList.forEach((r) => {
        const ref = doc(db, 'regiaStaff', r.id);
        batch.set(ref, r, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Batch update regiaStaff error in firestore:', err);
    }
  }, []);

  // Guests CRUD
  const updateGuest = useCallback((id: string, updates: Partial<Guest>) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    setDoc(doc(db, 'guests', id), updates, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `guests/${id}`);
    });
  }, []);

  const addGuest = useCallback((newGuest: Omit<Guest, 'id'>) => {
    const id = `guest-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullGuest: Guest = { ...newGuest, id };
    setGuests((prev) => [...prev, fullGuest]);
    setDoc(doc(db, 'guests', id), fullGuest).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `guests/${id}`);
    });
  }, []);

  const deleteGuest = useCallback((id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    deleteDoc(doc(db, 'guests', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `guests/${id}`);
    });
  }, []);

  const bulkUpdateGuests = useCallback(async (updatedList: Guest[]) => {
    setGuests(updatedList);
    try {
      const batch = writeBatch(db);
      updatedList.forEach((g) => {
        const ref = doc(db, 'guests', g.id);
        batch.set(ref, g, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Batch update guests error in firestore:', err);
    }
  }, []);

  // Helper to apply homogeneous workload distribution across current or updated actors & makeup artists
  const applyDynamicTruccoBalance = useCallback(
    (nextActors: CourseActor[], nextArtists: MakeupArtist[]) => {
      setSimulatorPatients((prevPatients) => {
        const { updatedActors, updatedPatients } = computeHomogeneousTruccoDistribution(
          nextActors,
          nextArtists,
          prevPatients
        );
        setActors(updatedActors);
        return updatedPatients;
      });
    },
    []
  );

  const rebalanceTruccoWorkload = useCallback(() => {
    applyDynamicTruccoBalance(actors, makeupArtists);
  }, [actors, makeupArtists, applyDynamicTruccoBalance]);

  // Actors (8 Slot Principali ATT-01 - ATT-08 + dinamici) CRUD with automatic workload rebalancing
  const updateActor = useCallback((id: string, updates: Partial<CourseActor>) => {
    setActors((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  }, []);

  const addActor = useCallback(
    (newActor: Omit<CourseActor, 'id'>) => {
      const id = `actor-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const fullActor: CourseActor = {
        ...newActor,
        id,
        progressStatus: newActor.progressStatus || 'STANDBY',
      };
      const nextActors = [...actors, fullActor];
      applyDynamicTruccoBalance(nextActors, makeupArtists);
    },
    [actors, makeupArtists, applyDynamicTruccoBalance]
  );

  const deleteActor = useCallback(
    (id: string) => {
      const nextActors = actors.filter((a) => a.id !== id);
      applyDynamicTruccoBalance(nextActors, makeupArtists);
    },
    [actors, makeupArtists, applyDynamicTruccoBalance]
  );

  // Makeup Artists (4 Truccatori Base TRUC-01 - TRUC-04 + dinamici) CRUD with automatic workload rebalancing
  const updateMakeupArtist = useCallback((id: string, updates: Partial<MakeupArtist>) => {
    setMakeupArtists((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }, []);

  const addMakeupArtist = useCallback(
    (newArtist: Omit<MakeupArtist, 'id'>) => {
      const id = `truc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const fullArtist: MakeupArtist = { ...newArtist, id };
      const nextArtists = [...makeupArtists, fullArtist];
      setMakeupArtists(nextArtists);
      applyDynamicTruccoBalance(actors, nextArtists);
    },
    [actors, makeupArtists, applyDynamicTruccoBalance]
  );

  const deleteMakeupArtist = useCallback(
    (id: string) => {
      const nextArtists = makeupArtists.filter((m) => m.id !== id);
      if (nextArtists.length === 0) return;
      setMakeupArtists(nextArtists);
      applyDynamicTruccoBalance(actors, nextArtists);
    },
    [actors, makeupArtists, applyDynamicTruccoBalance]
  );

  // Link an Actor to a Makeup Artist in Anagrafica Trucco (and optionally update patients where that actor is assigned)
  const linkActorToMakeupArtist = useCallback(
    (actorId: string, makeupArtistId: string, propagateToScenarios: boolean = true) => {
      setActors((prev) =>
        prev.map((a) => (a.id === actorId ? { ...a, assignedMakeupArtistId: makeupArtistId } : a))
      );
      if (propagateToScenarios) {
        setSimulatorPatients((prev) =>
          prev.map((p) =>
            p.assignedActorId === actorId ? { ...p, assignedMakeupArtistId: makeupArtistId } : p
          )
        );
      }
    },
    []
  );

  // Assign an Actor and/or Makeup Artist to a specific SimulatorPatient in a Block/Scenario
  const assignTruccoToPatient = useCallback(
    (patientId: number, actorId: string, makeupArtistId?: string) => {
      const targetActor = actors.find((a) => a.id === actorId);
      const resolvedMakeupId =
        makeupArtistId || targetActor?.assignedMakeupArtistId || 'truc-1';

      setSimulatorPatients((prev) =>
        prev.map((p) =>
          p.id === patientId
            ? {
                ...p,
                assignedActorId: actorId,
                assignedMakeupArtistId: resolvedMakeupId,
              }
            : p
        )
      );
    },
    [actors]
  );

  // Update 5-stage progress status for an Actor (and synchronize Patient Pre-Scenario Checklist + Regia Alert on PRONTO_T0)
  const updateActorProgressStatus = useCallback(
    (
      actorId: string,
      status: ActorProgressStatus,
      options?: { patientId?: number; updatedBy?: string; notifyRegia?: boolean }
    ) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      const targetActor = actors.find((a) => a.id === actorId);
      const pairedArtist = makeupArtists.find(
        (m) => m.id === targetActor?.assignedMakeupArtistId
      );
      const authorLabel =
        options?.updatedBy ||
        (pairedArtist
          ? `${pairedArtist.badgeCode} • ${pairedArtist.name}`
          : 'TRUC-01 • Silvia Rossi');

      // 1. Update CourseActor state
      setActors((prev) =>
        prev.map((a) =>
          a.id === actorId
            ? {
                ...a,
                progressStatus: status,
                progressUpdatedAt: timeStr,
                progressUpdatedBy: authorLabel,
              }
            : a
        )
      );

      // 2. Synchronize SimulatorPatient(s) and techChecklist.preDone
      const isReadyState = status === 'PRONTO_T0' || status === 'IN_SCENARIO';
      let affectedPatientIds: number[] = [];

      setSimulatorPatients((prev) =>
        prev.map((p) => {
          const matchesTarget =
            options?.patientId !== undefined
              ? p.id === options.patientId
              : p.assignedActorId === actorId && p.day === activeDay;

          if (!matchesTarget) return p;

          affectedPatientIds.push(p.id);
          const updatedChecklist = {
            ...p.techChecklist,
            preDone:
              status === 'PRONTO_T0' || status === 'IN_SCENARIO'
                ? true
                : status === 'STANDBY' || status === 'IN_PREPARAZIONE'
                ? false
                : p.techChecklist?.preDone || false,
            verifiedAt: timeStr,
          };

          const updatedPatient: SimulatorPatient = {
            ...p,
            actorProgressStatus: status,
            actorProgressUpdatedAt: timeStr,
            actorProgressUpdatedBy: authorLabel,
            readinessStatus: isReadyState
              ? 'ready'
              : status === 'IN_PREPARAZIONE'
              ? 'preparing'
              : p.readinessStatus,
            techChecklist: updatedChecklist,
          };

          setDoc(doc(db, 'simulator_patients', String(p.id)), updatedPatient, {
            merge: true,
          }).catch(() => {});

          return updatedPatient;
        })
      );

      // 3. When status reaches PRONTO_T0, automatically send radio notification to Regia (CH-3)
      if (status === 'PRONTO_T0' && options?.notifyRegia !== false && targetActor) {
        const pzLabel =
          options?.patientId !== undefined
            ? `Paziente #${options.patientId}`
            : affectedPatientIds.length > 0
            ? `Pazienti #${affectedPatientIds.join(', #')}`
            : `Slot ${targetActor.badgeCode}`;

        sendCourseMessage({
          senderId: pairedArtist?.badgeCode || 'TRUC-01',
          senderName: authorLabel,
          senderRole: 'tecnico',
          senderStation: pairedArtist?.assignedStation || 'Lab Moulage CH-3',
          type: 'info',
          subject: `ATTORE PRONTO T0 • ${targetActor.badgeCode} (${targetActor.name}) [${targetActor.physicalStatus}]`,
          content: `Truccatore ${authorLabel} conferma stato PRONTO T0 per ${targetActor.badgeCode} (${targetActor.name} - ${targetActor.physicalStatus}, Taglia ${targetActor.clothingSize}) su ${pzLabel}. Checklist Pre-Scenario sincronizzata e figurante pronto per ingaggio.`,
        });
      }
    },
    [actors, makeupArtists, activeDay, sendCourseMessage]
  );



  const updateCourseStartSchedule = useCallback((updates: Partial<CourseStartSchedule>) => {
    setCourseStartSchedule((prev) => {
      const updated = { ...prev, ...updates };
      if (updates.scheduledDate || updates.scheduledTime) {
        const d = updates.scheduledDate || prev.scheduledDate;
        const t = updates.scheduledTime || prev.scheduledTime;
        updated.isoTimestamp = `${d}T${t}:00`;
      }
      syncCourseStateToFirestore({ courseStartSchedule: updated });
      return updated;
    });
  }, [syncCourseStateToFirestore]);

  const setCourseGateEnabled = useCallback((enabled: boolean) => {
    setCourseStartSchedule((prev) => {
      const wasGateEnabled = prev.isGateEnabled;
      const updated = { ...prev, isGateEnabled: enabled };
      if (wasGateEnabled && !enabled) {
        triggerLongBeepWithAnimation();
      }
      syncCourseStateToFirestore({ courseStartSchedule: updated });
      return updated;
    });
  }, [syncCourseStateToFirestore]);

  const authorizeCourseStart = useCallback(async (byBadge: string = 'REGIA-01') => {
    const now = new Date();
    const nowEpoch = now.getTime();
    const pad = (n: number) => String(n).padStart(2, '0');
    const d = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const t = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const updated: CourseStartSchedule = {
      ...courseStartSchedule,
      scheduledDate: d,
      scheduledTime: t,
      isoTimestamp: now.toISOString(),
      isGateEnabled: false,
      isGatePaused: false,
      pausedRemainingMs: undefined,
      courseStartSignalTimestamp: nowEpoch,
      isOfficialStartTriggered: true,
      isStartAuthorizedByRegia: true,
      authorizedAt: now.toISOString(),
      authorizedBy: byBadge,
    };
    setCourseStartSchedule(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'courseStartSchedule', JSON.stringify(updated));
    } catch (e) {}
    syncCourseStateToFirestore({ courseStartSchedule: updated });

    logAuditAction('resume', 'Apertura Gate & Avvio Corso Autorizzato', byBadge, {
      reason: 'Autorizzazione ufficiale apertura gate e avvio corso trasmessa dalla Regia/Direzione',
      synced: typeof navigator !== 'undefined' ? navigator.onLine : true,
    });

    triggerLongBeepWithAnimation();
  }, [courseStartSchedule, syncCourseStateToFirestore, triggerLongBeepWithAnimation]);

  const startCourseImmediately = useCallback(() => {
    authorizeCourseStart('REGIA-01');
  }, [authorizeCourseStart]);

  const resetCourseScheduleToFuture = useCallback((minutesFromNow: number = 10) => {
    const future = new Date(Date.now() + minutesFromNow * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const d = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}`;
    const t = `${pad(future.getHours())}:${pad(future.getMinutes())}`;
    const updated: CourseStartSchedule = {
      ...courseStartSchedule,
      scheduledDate: d,
      scheduledTime: t,
      isoTimestamp: `${d}T${t}:00`,
      isGateEnabled: true,
      isGatePaused: false,
      pausedRemainingMs: undefined,
      isStartAuthorizedByRegia: false,
      isOfficialStartTriggered: false,
      authorizedAt: undefined,
      authorizedBy: undefined,
    };
    setCourseStartSchedule(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'courseStartSchedule', JSON.stringify(updated));
    } catch (e) {}
    syncCourseStateToFirestore({ courseStartSchedule: updated });
  }, [courseStartSchedule, syncCourseStateToFirestore]);

  // 4 Rotational Macro-Blocks of 90 min (Blocco 1, 2, 3, 4) Start Confirmation State
  const [authorizedMacroBlocks, setAuthorizedMacroBlocks] = useState<Record<string, boolean>>(() =>
    getStoredOrDefault('authorizedMacroBlocks', {})
  );

  const currentMacroBlockInfo = useMemo(() => getMacroBlockInfo(currentSlot), [currentSlot]);

  // Is current slot a macro-block start that hasn't been authorized yet?
  const isMacroBlockAwaitingAuth = useMemo(() => {
    if (!currentMacroBlockInfo.isMacroBlock) return false;
    return !authorizedMacroBlocks[currentSlot.id];
  }, [currentMacroBlockInfo, authorizedMacroBlocks, currentSlot.id]);

  const [isScenarioBlockConfirmationModalOpen, setIsScenarioBlockConfirmationModalOpen] = useState<boolean>(false);

  // When a macro block is awaiting confirmation, lock timer at full slot duration and freeze it
  useEffect(() => {
    if (isMacroBlockAwaitingAuth) {
      if (isTimerRunning) {
        setIsTimerRunning(false);
      }
      const dur = getSlotDurationSeconds(currentSlot);
      setTimerSeconds(dur);
    }
  }, [isMacroBlockAwaitingAuth, currentSlot]);

  const authorizeScenarioBlockStart = useCallback(async (slotId: string, byBadge: string = 'REGIA-01') => {
    const updated = {
      ...authorizedMacroBlocks,
      [slotId]: true,
    };
    setAuthorizedMacroBlocks(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'authorizedMacroBlocks', JSON.stringify(updated));
    } catch (e) {}

    setIsTimerRunning(true);

    syncCourseStateToFirestore({
      authorizedMacroBlocks: updated,
      isTimerRunning: true,
    });

    logAuditAction('resume', `Avvio Blocco Scenario: ${slotId}`, byBadge, {
      reason: `Autorizzazione avvio macro-blocco scenario 90 min (${currentSlot.title}) confermata dalla Regia`,
      synced: typeof navigator !== 'undefined' ? navigator.onLine : true,
    });

    playBroadcastSound('phase_change');
  }, [authorizedMacroBlocks, currentSlot.title, syncCourseStateToFirestore]);

  const setGatePaused = useCallback((paused: boolean) => {
    setCourseStartSchedule((prev) => {
      const now = Date.now();
      const currentTarget = new Date(prev.isoTimestamp).getTime() || now;
      const currentRemaining = prev.isGatePaused ? (prev.pausedRemainingMs || 0) : Math.max(0, currentTarget - now);
      
      let newIso = prev.isoTimestamp;
      if (!paused && prev.isGatePaused) {
        newIso = new Date(now + currentRemaining).toISOString();
      }

      const updated: CourseStartSchedule = {
        ...prev,
        isGatePaused: paused,
        pausedRemainingMs: paused ? currentRemaining : undefined,
        isoTimestamp: newIso,
      };
      syncCourseStateToFirestore({ courseStartSchedule: updated });
      return updated;
    });
  }, [syncCourseStateToFirestore]);

  const toggleGatePause = useCallback(() => {
    setGatePaused(!courseStartSchedule.isGatePaused);
  }, [courseStartSchedule.isGatePaused, setGatePaused]);

  const setGateMode = useCallback((mode: 'start' | 'lunch' | 'night' | 'day3', customTime?: string) => {
    setCourseStartSchedule((prev) => {
      let tTime = customTime;
      let title = prev.title;
      let location = prev.location;
      if (mode === 'lunch') {
        tTime = customTime || '13:00';
        title = 'PAUSA PRANZO • GATE CHIUSO IN STANDBY';
        location = 'Ristorante Centro Simulazione / Mensa (12:00 - 13:00)';
      } else if (mode === 'night') {
        tTime = customTime || '20:30';
        title = 'SCENARIO NOTTURNO MASCAL • APERTURA GATE ORE 20:30';
        location = 'Gate Centrale & Piazzale Operativo (Briefing Verbale sul Posto)';
      } else if (mode === 'day3') {
        tTime = customTime || '08:30';
        title = 'DAY 3 • SKILLS & SCENARI CLINICI • INTUBATI EM';
        location = 'Centro di Simulazione Avanzata e Medicina Tattica';
      } else {
        tTime = customTime || '08:30';
        title = 'HITTER • High Intensive Training Trauma Emergency Response • INTUBATI EM';
        location = 'Centro di Simulazione Avanzata e Medicina Tattica';
      }
      const today = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const dStr = prev.scheduledDate || `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      
      const updated: CourseStartSchedule = {
        ...prev,
        gateMode: mode,
        scheduledTime: tTime,
        isoTimestamp: `${dStr}T${tTime}:00`,
        isGateEnabled: true,
        isGatePaused: false,
        pausedRemainingMs: undefined,
        title,
        location,
      };
      syncCourseStateToFirestore({ courseStartSchedule: updated });
      return updated;
    });
  }, [syncCourseStateToFirestore]);

  const setTimeMultiplier = useCallback((multiplier: number) => {
    setTimeMultiplierState(multiplier);
    syncCourseStateToFirestore({ timeMultiplier: multiplier });
    if (multiplier > 1) {
      setIsTimerRunning(true);
    }
  }, [syncCourseStateToFirestore]);

  const setAutoAdvancePhases = useCallback((autoAdvance: boolean) => {
    setAutoAdvancePhasesState(autoAdvance);
    syncCourseStateToFirestore({ autoAdvancePhases: autoAdvance });
  }, [syncCourseStateToFirestore]);

  const authorizeFaculty = useCallback(
    (pin: string, facultyId?: string): boolean => {
      const cleanPin = pin.trim();
      const validPins = ['118', '2026', '112', '9999'];
      const matchedFaculty =
        faculty.find(
          (f) => f.id === facultyId || f.badgeCode?.toLowerCase() === cleanPin.toLowerCase()
        ) || faculty[0];

      const isValid =
        validPins.includes(cleanPin) ||
        (matchedFaculty && matchedFaculty.badgeCode?.toLowerCase() === cleanPin.toLowerCase()) ||
        cleanPin.toUpperCase().startsWith('FAC');

      if (isValid) {
        const targetDoc = faculty.find((f) => f.id === facultyId) || matchedFaculty || faculty[0];
        const session: FacultyAuthSession = {
          isAuthorized: true,
          facultyId: targetDoc ? targetDoc.id : 'fac-1',
          facultyName: targetDoc ? targetDoc.name : 'Dott. Andrea Galli',
          authorizedAt: Date.now(),
        };
        setFacultyAuthSession(session);
        if (targetDoc && typeof targetDoc.assignedTeamId === 'number') {
          setActiveFacultyTeamId(targetDoc.assignedTeamId);
        }
        return true;
      }
      return false;
    },
    [faculty]
  );

  const deauthorizeFaculty = useCallback(() => {
    const emptySession: FacultyAuthSession = {
      isAuthorized: false,
      facultyId: null,
      facultyName: null,
      authorizedAt: null,
    };
    setFacultyAuthSession(emptySession);
    setUserRole('direttore');
  }, []);

  const jumpToTimelinePoint = useCallback(
    (
      target:
        | 'pre_start_15m'
        | 'pre_start_5m'
        | 'pre_start_30s'
        | 'day1_intro'
        | 'day2_morning'
        | 'day2_afternoon'
        | 'night_scenario'
        | 'day3_exams'
        | 'next_slot'
        | 'prev_slot'
    ) => {
      setCourseStartSchedule((prev) => ({ ...prev, isGateEnabled: false }));

      switch (target) {
        case 'pre_start_15m': {
          setTimerSeconds(900);
          setIsTimerRunning(true);
          playBroadcastSound('warning');
          syncCourseStateToFirestore({ timerSeconds: 900, isTimerRunning: true });
          break;
        }
        case 'pre_start_5m': {
          setTimerSeconds(300);
          setIsTimerRunning(true);
          playBroadcastSound('warning');
          syncCourseStateToFirestore({ timerSeconds: 300, isTimerRunning: true });
          break;
        }
        case 'pre_start_30s': {
          setTimerSeconds(30);
          setIsTimerRunning(true);
          syncCourseStateToFirestore({ timerSeconds: 30, isTimerRunning: true });
          break;
        }
        case 'day1_intro': {
          setActiveDayState(2);
          setActiveSlotIndexState(0);
          const s = INITIAL_TIMELINE_SLOTS[0];
          const secs = s ? s.durationMinutes * 60 : 1800;
          setTimerSeconds(secs);
          setIsTimerRunning(true);
          playBroadcastSound('phase_change');
          broadcastTimelineUpdate({ activeDay: 2, activeSlotIndex: 0, timerSeconds: secs, isTimerRunning: true });
          syncCourseStateToFirestore({ activeDay: 2, activeSlotIndex: 0, timerSeconds: secs, isTimerRunning: true });
          break;
        }
        case 'day2_morning': {
          setActiveDayState(2);
          const idx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.day === 2 && s.period === 'mattina');
          const targetIdx = idx !== -1 ? idx : 0;
          setActiveSlotIndexState(targetIdx);
          const s = INITIAL_TIMELINE_SLOTS[targetIdx];
          const secs = s ? s.durationMinutes * 60 : 1800;
          setTimerSeconds(secs);
          setIsTimerRunning(true);
          triggerLongBeepWithAnimation();
          broadcastTimelineUpdate({ activeDay: 2, activeSlotIndex: targetIdx, timerSeconds: secs, isTimerRunning: true });
          syncCourseStateToFirestore({ activeDay: 2, activeSlotIndex: targetIdx, timerSeconds: secs, isTimerRunning: true });
          break;
        }
        case 'day2_afternoon': {
          setActiveDayState(2);
          const idx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.day === 2 && s.period === 'pomeriggio');
          const targetIdx = idx !== -1 ? idx : 0;
          setActiveSlotIndexState(targetIdx);
          const s = INITIAL_TIMELINE_SLOTS[targetIdx];
          const secs = s ? s.durationMinutes * 60 : 2700;
          setTimerSeconds(secs);
          setIsTimerRunning(true);
          triggerLongBeepWithAnimation();
          broadcastTimelineUpdate({ activeDay: 2, activeSlotIndex: targetIdx, timerSeconds: secs, isTimerRunning: true });
          syncCourseStateToFirestore({ activeDay: 2, activeSlotIndex: targetIdx, timerSeconds: secs, isTimerRunning: true });
          break;
        }
        case 'night_scenario': {
          setActiveDayState(2);
          const idx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.id === 'd2-mascal-scenario');
          const targetIdx = idx !== -1 ? idx : INITIAL_TIMELINE_SLOTS.findIndex((s) => s.id === 'd2-gate-discenti-notturno');
          const resolvedIdx = targetIdx !== -1 ? targetIdx : 0;
          setActiveSlotIndexState(resolvedIdx);
          const s = INITIAL_TIMELINE_SLOTS[resolvedIdx];
          const secs = s ? s.durationMinutes * 60 : 7200;
          setTimerSeconds(secs);
          setIsTimerRunning(true);
          playAirRaidSiren();
          broadcastTimelineUpdate({ activeDay: 2, activeSlotIndex: resolvedIdx, timerSeconds: secs, isTimerRunning: true });
          syncCourseStateToFirestore({ activeDay: 2, activeSlotIndex: resolvedIdx, timerSeconds: secs, isTimerRunning: true });
          break;
        }

        case 'day3_exams': {
          setActiveDayState(3);
          const idx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.day === 3);
          const targetIdx = idx !== -1 ? idx : 0;
          setActiveSlotIndexState(targetIdx);
          const s = INITIAL_TIMELINE_SLOTS[targetIdx];
          const secs = s ? s.durationMinutes * 60 : 2700;
          setTimerSeconds(secs);
          setIsTimerRunning(true);
          playBroadcastSound('phase_change');
          broadcastTimelineUpdate({ activeDay: 3, activeSlotIndex: targetIdx, timerSeconds: secs, isTimerRunning: true });
          syncCourseStateToFirestore({ activeDay: 3, activeSlotIndex: targetIdx, timerSeconds: secs, isTimerRunning: true });
          break;
        }
        case 'next_slot': {
          nextSlot();
          setIsTimerRunning(true);
          break;
        }
        case 'prev_slot': {
          prevSlot();
          setIsTimerRunning(true);
          break;
        }
      }
    },
    [nextSlot, prevSlot, syncCourseStateToFirestore, broadcastTimelineUpdate]
  );

  const startFullAppSimulationFromGate = useCallback((_initialSpeed: number = 1) => {
    // Funzione di simulazione rimossa su richiesta dell'utente
  }, []);

  const stopFullAppSimulation = useCallback(() => {
    // Funzione di simulazione rimossa su richiesta dell'utente
  }, []);

  const triggerSimulatedClinicalEvent = useCallback(() => {
    // Funzione di simulazione rimossa su richiesta dell'utente
  }, []);

  const sendPing = useCallback(() => {
    if (channelRef.current) {
      const now = Date.now();
      channelRef.current.postMessage({
        type: 'PING',
        from: clientId,
        sentAt: now,
      });
      setTimeout(() => {
        setLatencyMs((prev) => (prev === null ? 2 : prev));
      }, 50);
    } else {
      setLatencyMs(1);
    }
  }, [clientId]);

  const sendGlobalPing = useCallback(() => {
    sendPing();
    if (db) {
      const activeBadge =
        userRole === 'tecnico'
          ? technicians.find((t) => t.id === selectedTechnicianId)?.badgeCode || 'TECH-01'
          : userRole === 'discente'
          ? discenti.find((d) => d.id === selectedDiscenteId)?.badgeCode || 'DISC-01'
          : userRole === 'faculty'
          ? faculty.find((f) => f.id === selectedFacultyId)?.badgeCode || 'FAC-01'
          : 'REGIA-01';
      const docId = `device-${activeBadge.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      setDoc(
        doc(db, 'device_presence', docId),
        {
          lastSeen: Date.now(),
          latencyMs: Math.floor(Math.random() * 15) + 5,
          status: 'online',
        },
        { merge: true }
      ).catch(() => {});
    }
  }, [sendPing, userRole, technicians, selectedTechnicianId, discenti, selectedDiscenteId, faculty, selectedFacultyId]);

  const triggerManualSync = useCallback(() => {
    setIsSyncing(true);
    setLastSyncTimestamp(Date.now());
    // Trigger snapshot refresh
    getDocs(collection(db, 'course_messages'))
      .then((snap) => {
        const msgsList: CourseMessage[] = [];
        snap.forEach((d) => msgsList.push(d.data() as CourseMessage));
        if (msgsList.length > 0) setCourseMessages(msgsList);
      })
      .catch((e) => console.warn('Manual sync message error:', e));

    setTimeout(() => {
      setIsSyncing(false);
    }, 400);
  }, [setCourseMessages]);

  const forceDeviceResync = useCallback(() => {
    triggerManualSync();
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'FORCE_RESYNC',
        sentAt: Date.now(),
        from: clientId,
      });
    }
  }, [triggerManualSync, clientId]);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'discente': return 'Discente Badge';
      case 'tecnico': return 'Console Tecnico';
      case 'faculty': return 'Istruttore Faculty';
      case 'master': return 'Master Control';
      case 'direttore': return 'Regia Direttore';
      case 'regia': return 'Staff Regia';
      case 'ospite': return 'Ospite / VIP';
      default: return role;
    }
  };

  const peerEntries: ConnectedPeer[] = Object.keys(peersMap).map((id) => {
    const peer = peersMap[id];
    return {
      id,
      role: peer.role,
      roleLabel: getRoleLabel(peer.role),
      lastSeen: peer.lastSeen,
      isCurrent: false,
    };
  });

  const connectedPeers: ConnectedPeer[] = [
    {
      id: clientId,
      role: userRole,
      roleLabel: getRoleLabel(userRole),
      lastSeen: Date.now(),
      isCurrent: true,
    },
    ...peerEntries,
  ];

  const syncStatus: SyncStatusInfo = {
    isOnline,
    isSyncing,
    lastSyncTimestamp,
    peerCount: connectedPeers.length,
    peers: connectedPeers,
    latencyMs,
    channelName: 'trauma_sim_live_mesh',
  };

  const resetAllData = useCallback(() => {
    localStorage.clear();
    setSimulatorPatients(INITIAL_SIMULATOR_PATIENTS);
    setTeams(INITIAL_TEAMS);
    setDiscenti(INITIAL_DISCENTI);
    setFaculty(INITIAL_FACULTY);
    setTechnicians(INITIAL_TECHNICIANS);
    setDirectors(INITIAL_DIRECTORS);
    setGuests(INITIAL_GUESTS);
    setEvaluations([]);
    setActiveSlotIndexState(0);
    setActiveDayState(2);
    setTimerSeconds(30 * 60);
    setIsTimerRunning(false);
  }, []);

  const resetSimulationSession = useCallback(() => {
    // 1. Clear temporary evaluations / team scores
    setEvaluations([]);
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'evaluations');
    } catch (e) {}

    try {
      getDocs(collection(db, 'evaluations')).then((snapshot) => {
        if (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.forEach((d) => batch.delete(d.ref));
          batch.commit().catch(() => {});
        }
      }).catch(() => {});
    } catch (e) {}

    // 2. Clear temporary session broadcast messages
    setCourseMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'courseMessages');
    } catch (e) {}
    try {
      getDocs(collection(db, 'course_messages')).then((snapshot) => {
        if (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.forEach((d) => batch.delete(d.ref));
          batch.commit().catch(() => {});
        }
      }).catch(() => {});
    } catch (e) {}

    // 3. Clear temporary phase shift logs
    setPhaseShiftLogs([]);
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'phaseShiftLogs');
    } catch (e) {}

    // 4. Reset patient runtime checklist and temporary readiness flags, PRESERVING all core configurations
    setSimulatorPatients((prev) => {
      const updated = prev.map((p) => ({
        ...p,
        readinessStatus: 'ready' as const,
        criticalityNotes: undefined,
        criticalityReportedBy: undefined,
        criticalityTimestamp: undefined,
        techChecklist: {
          preDone: false,
          intraDone: false,
          postDone: false,
          verifiedAt: undefined,
        },
      }));
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'simulatorPatients', JSON.stringify(updated));
      } catch (e) {}
      try {
        const batch = writeBatch(db);
        updated.forEach((p) => {
          batch.set(doc(db, 'simulator_patients', String(p.id)), p, { merge: true });
        });
        batch.commit().catch(() => {});
      } catch (e) {}
      return updated;
    });

    // 5. Reset active scenario roles on all learners
    setDiscenti((prev) =>
      prev.map((d) => ({
        ...d,
        activeScenarioRole: undefined,
        activeScenarioType: undefined,
        activeScenarioSlotId: undefined,
        activeScenarioAssignedAt: undefined,
        activeScenarioAssignedBy: undefined,
      }))
    );

    // 6. Reset simulation acceleration & auto-advance
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_PREFIX + 'isFullAppSimulating');
      } catch (e) {}
    }
    setTimeMultiplier(1);
    setAutoAdvancePhases(false);
    setIsTimerRunning(false);

    // Reset phase timer to default slot duration
    if (currentSlot) {
      const slotSecs = getSlotDurationSeconds(currentSlot);
      setTimerSeconds(slotSecs);
      syncCourseStateToFirestore({
        isFullAppSimulating: false,
        isTimerRunning: false,
        timerSeconds: slotSecs,
        timeMultiplier: 1,
        autoAdvancePhases: false,
      });
    }
  }, [currentSlot, getSlotDurationSeconds, syncCourseStateToFirestore]);

  return (
    <CourseContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        userRole,
        setUserRole,
        openedByRole,
        setOpenedByRole,
        canSelectOperator,
        unlockOperatorSelection,
        activeDay,
        setActiveDay,
        activeSlotIndex,
        setActiveSlotIndex,
        currentSlot,
        filteredSlots,
        isTimerRunning,
        timerSeconds,
        toggleTimer,
        resetTimer,
        adjustTimer,
        nextSlot,
        prevSlot,
        suspensionInfo,
        suspendCourse,
        resumeCourse,
        courseMessages: effectiveCourseMessages,
        sendCourseMessage,
        acknowledgeCourseMessage,
        deleteCourseMessage,
        phaseShiftLogs,
        recordPhaseShiftLog,
        clearPhaseShiftLogs,
        simulatorPatients: localizedSimulatorPatients,
        updateSimulatorPatient,
        addSimulatorPatient,
        deleteSimulatorPatient,
        resetSimulatorPatients,
        updateTechChecklist,
        teams,
        updateTeam,
        discenti,
        updateDiscente,
        bulkUpdateDiscenti,
        addDiscente,
        deleteDiscente,
        assignScenarioRoles,
        clearScenarioRolesForTeam,
        cleanupAssignedRoles,
        resetAssignedRolesInFirestore: cleanupAssignedRoles,
        simulationPhase,
        setSimulationPhase,
        faculty,
        updateFaculty,
        bulkUpdateFaculty,
        addFaculty,
        deleteFaculty,
        technicians,
        updateTechnician,
        bulkUpdateTechnicians,
        addTechnician,
        deleteTechnician,
        directors,
        updateDirector,
        bulkUpdateDirectors,
        addDirector,
        deleteDirector,
        regiaStaff,
        updateRegiaStaff,
        bulkUpdateRegiaStaff,
        addRegiaStaff,
        deleteRegiaStaff,
        guests,
        updateGuest,
        bulkUpdateGuests,
        addGuest,
        deleteGuest,
        actors,
        updateActor,
        addActor,
        deleteActor,
        makeupArtists,
        updateMakeupArtist,
        addMakeupArtist,
        deleteMakeupArtist,
        linkActorToMakeupArtist,
        assignTruccoToPatient,
        rebalanceTruccoWorkload,
        updateActorProgressStatus,
        evaluations: effectiveEvaluations,
        saveEvaluation,
        bulkSaveEvaluations,
        getEvaluationForTeamAndSlot,
        activeFacultyTeamId,
        setActiveFacultyTeamId,
        activeTechPatientId,
        setActiveTechPatientId,
        selectedDiscenteId,
        setSelectedDiscenteId,
        selectedFacultyId,
        setSelectedFacultyId,
        selectedTechnicianId,
        setSelectedTechnicianId,
        selectedDirectorId,
        setSelectedDirectorId,
        selectedRegiaId,
        setSelectedRegiaId,
        selectedGuestId,
        setSelectedGuestId,
        currentTab,
        setCurrentTab,
        selectedCatalogPatientId,
        setSelectedCatalogPatientId,
        protesiCatalog,
        updateProtesiItem,
        addProtesiItem,
        deleteProtesiItem,
        resetProtesiCatalog,
        canGoBack,
        backDestinationLabel,
        navigateBack,
        navigateToView,
        facultyAuthSession,
        authorizeFaculty,
        deauthorizeFaculty,
        courseStartSchedule,
        isCourseStarted,
        timeRemainingMs,
        updateCourseStartSchedule,
        setCourseGateEnabled,
        startCourseImmediately,
        resetCourseScheduleToFuture,
        setGatePaused,
        toggleGatePause,
        setGateMode,
        syncStatus,
        triggerManualSync,
        sendPing,
        devicePresenceMap,
        sendGlobalPing,
        forceDeviceResync,
        firebaseUser,
        isFirebaseAuthReady,
        isFirebaseCloudConnected,
        isQuotaExhausted: isQuotaExhausted(),
        retryCloudConnection,
        signInWithGoogle,
        signOutFirebase,
        isFullAppSimulating,
        simulatedClockTime,
        simulatedRoleState,
        startFullAppSimulationFromGate,
        stopFullAppSimulation,
        timeMultiplier,
        setTimeMultiplier,
        autoAdvancePhases,
        setAutoAdvancePhases,
        isSimulationModalOpen,
        setIsSimulationModalOpen,
        jumpToTimelinePoint,
        triggerSimulatedClinicalEvent,
        resetAllData,
        resetSimulationSession,
        isBeeping,
        freeAccessEnabled,
        setFreeAccessEnabled,
        isAreaDiscentiModalOpen,
        setIsAreaDiscentiModalOpen,
        isFullscreenMode,
        setIsFullscreenMode,
        toggleFullscreenMode,
        mascalTriageRecords,
        saveMascalTeamAssessment,
        resetMascalTeamTriage,
        timelineSlots,
        setTimelineSlots,
        applyScheduleModification,
        rollbackScheduleModification,
        isAuditLogOpen,
        setIsAuditLogOpen,
        isIntentReviewOpen,
        setIsIntentReviewOpen,
        activeRollbackToast,
        dismissRollbackToast,
        isGateExpiredAwaitingAuth,
        authorizeCourseStart,
        isMacroBlockAwaitingAuth,
        authorizedMacroBlocks,
        authorizeScenarioBlockStart,
        isScenarioBlockConfirmationModalOpen,
        setIsScenarioBlockConfirmationModalOpen,
        isTacticalMapOpen,
        setIsTacticalMapOpen,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = (): CourseContextType => {
  const ctx = useContext(CourseContext);
  if (!ctx) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return ctx;
};
