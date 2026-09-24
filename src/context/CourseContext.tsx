import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  CourseDay,
  CourseMessage,
  CourseSuspensionInfo,
  Discente,
  Director,
  RegiaStaff,
  Faculty,
  Guest,
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
  UserRole,
  PhaseShiftLogEntry,
  DevicePresenceRecord,
} from '../types';
import {
  INITIAL_COURSE_MESSAGES,
  INITIAL_DIRECTORS,
  INITIAL_REGIA_STAFF,
  INITIAL_DISCENTI,
  INITIAL_FACULTY,
  INITIAL_GUESTS,
  INITIAL_SIMULATOR_PATIENTS,
  INITIAL_TEAMS,
  INITIAL_TECHNICIANS,
  INITIAL_TIMELINE_SLOTS,
} from '../data/initialData';
import { playBroadcastSound, playAirRaidSiren, playLongBeep } from '../utils/audio';
import { cleanUndefined } from '../utils/teamUtils';
import { Language, translations } from '../i18n/translations';
import { translateSlot, translatePatient } from '../utils/courseTranslation';
import {
  db,
  auth,
  OperationType,
  handleFirestoreError,
  signInWithGoogle as fbSignInWithGoogle,
  logOut as fbLogOut,
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
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface CourseContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations, defaultText?: string) => string;

  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  openedByRole: 'regia' | 'direttore' | null;
  setOpenedByRole: (role: 'regia' | 'direttore' | null) => void;
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
  addDiscente: (newDiscente: Omit<Discente, 'id'>) => void;
  deleteDiscente: (id: string) => void;

  faculty: Faculty[];
  updateFaculty: (id: string, updates: Partial<Faculty>) => void;
  addFaculty: (newFaculty: Omit<Faculty, 'id'>) => void;
  deleteFaculty: (id: string) => void;

  technicians: Technician[];
  updateTechnician: (id: string, updates: Partial<Technician>) => void;
  addTechnician: (newTech: Omit<Technician, 'id'>) => void;
  deleteTechnician: (id: string) => void;

  directors: Director[];
  updateDirector: (id: string, updates: Partial<Director>) => void;
  addDirector: (newDirector: Omit<Director, 'id'>) => void;
  deleteDirector: (id: string) => void;

  regiaStaff: RegiaStaff[];
  updateRegiaStaff: (id: string, updates: Partial<RegiaStaff>) => void;
  addRegiaStaff: (newRegia: Omit<RegiaStaff, 'id'>) => void;
  deleteRegiaStaff: (id: string) => void;

  guests: Guest[];
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  addGuest: (newGuest: Omit<Guest, 'id'>) => void;
  deleteGuest: (id: string) => void;

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
  setGateMode: (mode: 'start' | 'lunch', customTime?: string) => void;

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
  signInWithGoogle: () => Promise<void>;
  signOutFirebase: () => Promise<void>;

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

  isBeeping: boolean;
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
  const [language, setLanguageState] = useState<Language>(() => getStoredOrDefault<Language>('language', 'en'));
  const [userRole, setUserRole] = useState<UserRole>('regia');
  const [openedByRole, setOpenedByRoleState] = useState<'regia' | 'direttore' | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get('from') || params.get('openedBy') || params.get('source');
      if (fromParam === 'regia' || fromParam === 'direttore') return fromParam;
      const stored = sessionStorage.getItem('trauma_opened_by');
      if (stored === 'regia' || stored === 'direttore') return stored as 'regia' | 'direttore';
    }
    return null;
  });

  const setOpenedByRole = useCallback((role: 'regia' | 'direttore' | null) => {
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
      const validPins = ['118', '2026', '112', '9999', '0000'];
      if (validPins.includes(clean) || clean.toLowerCase() === 'regia' || clean.toLowerCase() === 'direttore') {
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
    openedByRole === 'regia' ||
    openedByRole === 'direttore';

  const [activeDay, setActiveDayState] = useState<CourseDay>(() => getStoredOrDefault('activeDay', 2));
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
    };

    const handleCustomLang = (event: Event) => {
      const customEvent = event as CustomEvent<Language>;
      if (customEvent.detail === 'it' || customEvent.detail === 'en') {
        setLanguageState(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('trauma_language_change', handleCustomLang);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('trauma_language_change', handleCustomLang);
    };
  }, []);

  const t = useCallback((key: keyof typeof translations, defaultText?: string) => {
    const item = translations[key];
    if (!item) return defaultText || key;
    return item[language] || item['en'] || defaultText || key;
  }, [language]);

  const localizedTimelineSlots = useMemo(() => {
    return INITIAL_TIMELINE_SLOTS.map((slot) => translateSlot(slot, language));
  }, [language]);
  const filteredSlots = useMemo(() => {
    return localizedTimelineSlots.filter((s) => s.day === activeDay);
  }, [localizedTimelineSlots, activeDay]);
  const currentSlot = localizedTimelineSlots[activeSlotIndex] || localizedTimelineSlots[0];

  const getSlotDurationSeconds = (slot: TimelineSlot) => {
    if (slot.id === 'd2-setup-1' || slot.id === 'd2-setup-2') return 1800; // 30 mins (08:00 - 08:30)
    if (slot.id === 'd2-chiusura' || slot.id === 'd3-setup-1') return 52200; // 14h 30m (18:00 Day 2 to 08:30 Day 3)
    if (slot.id === 'd3-chiusura') return 9000; // 2h 30m (18:00 to 20:30 Day 3)
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
    try {
      const stored = getStoredOrDefault('simulatorPatients', INITIAL_SIMULATOR_PATIENTS);
      if (!stored || stored.length < 24) {
        localStorage.removeItem(STORAGE_KEY_PREFIX + 'simulatorPatients');
        return INITIAL_SIMULATOR_PATIENTS;
      }
      return stored;
    } catch (e) {
      return INITIAL_SIMULATOR_PATIENTS;
    }
  });

  const localizedSimulatorPatients = useMemo(() => {
    return simulatorPatients.map((p) => translatePatient(p, language));
  }, [simulatorPatients, language]);

  const [teams, setTeams] = useState<Team[]>(() => getStoredOrDefault('teams', INITIAL_TEAMS));
  const [discenti, setDiscenti] = useState<Discente[]>(() => {
    // Recreate entire discenti registry from scratch using INITIAL_DISCENTI
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'discenti');
    } catch (e) {
      // ignore
    }
    return INITIAL_DISCENTI;
  });
  const [faculty, setFaculty] = useState<Faculty[]>(() => getStoredOrDefault('faculty', INITIAL_FACULTY));
  const [technicians, setTechnicians] = useState<Technician[]>(() => getStoredOrDefault('technicians', INITIAL_TECHNICIANS));
  const [directors, setDirectors] = useState<Director[]>(() => getStoredOrDefault('directors', INITIAL_DIRECTORS));
  const [regiaStaff, setRegiaStaff] = useState<RegiaStaff[]>(() => getStoredOrDefault('regiaStaff', INITIAL_REGIA_STAFF));
  const [guests, setGuests] = useState<Guest[]>(() => getStoredOrDefault('guests', INITIAL_GUESTS));

  const [evaluations, setEvaluations] = useState<TeamEvaluation[]>(() =>
    getStoredOrDefault('evaluations', [])
  );

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
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') || params.get('public');
      if (viewParam === 'public' || viewParam === 'true') return 'public';
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
    }
    return 'public';
  });
  const [selectedCatalogPatientId, setSelectedCatalogPatientId] = useState<number | null>(null);

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

  const targetStartTimeMs = new Date(courseStartSchedule.isoTimestamp).getTime() || 0;
  const rawRemainingMs = Math.max(0, targetStartTimeMs - currentTime);
  const timeRemainingMs = courseStartSchedule.isGatePaused 
    ? (courseStartSchedule.pausedRemainingMs ?? rawRemainingMs)
    : rawRemainingMs;
  const isCourseStarted = !courseStartSchedule.isGateEnabled || targetStartTimeMs <= currentTime;

  const [hasPlayed30MinBeep, setHasPlayed30MinBeep] = useState(false);
  const [isBeeping, setIsBeeping] = useState<boolean>(false);

  const triggerLongBeepWithAnimation = useCallback(() => {
    playLongBeep();
    setIsBeeping(true);
    setTimeout(() => {
      setIsBeeping(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (courseStartSchedule.isGateEnabled && timeRemainingMs > 0) {
      const totalSecs = Math.floor(timeRemainingMs / 1000);
      if (totalSecs <= 1800 && totalSecs >= 1785 && !hasPlayed30MinBeep) {
        if (userRole !== 'tecnico' && userRole !== 'direttore') {
          triggerLongBeepWithAnimation();
        }
        setHasPlayed30MinBeep(true);
      }
      if (totalSecs > 1815) {
        setHasPlayed30MinBeep(false);
      }
    }
  }, [timeRemainingMs, courseStartSchedule.isGateEnabled, hasPlayed30MinBeep, triggerLongBeepWithAnimation, userRole]);

  // Course Field Messages (Private to Directors and Faculty)
  const [courseMessages, setCourseMessages] = useState<CourseMessage[]>(() =>
    getStoredOrDefault('courseMessages', INITIAL_COURSE_MESSAGES)
  );

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

  // -------------------------------------------------------------
  // FIRESTORE REAL-TIME SYNCHRONIZATION LISTENERS
  // -------------------------------------------------------------
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

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
            // Document does not exist yet; initialize it in Firestore
            const initialCourseState = {
              activeDay: 2,
              activeSlotIndex: 0,
              isTimerRunning: false,
              timerSeconds: 30 * 60,
              timeMultiplier: 1,
              autoAdvancePhases: true,
              suspensionInfo: { isSuspended: false, reason: '' },
              courseStartSchedule: getDefaultCourseSchedule(),
              updatedAt: new Date().toISOString(),
            };
            setDoc(doc(db, courseStatePath, 'current_state'), initialCourseState).catch((err) => {
              handleFirestoreError(err, OperationType.CREATE, `${courseStatePath}/current_state`);
            });
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, `${courseStatePath}/current_state`);
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
          handleFirestoreError(error, OperationType.LIST, messagesPath);
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
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, evalsPath);
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
              INITIAL_SIMULATOR_PATIENTS.forEach((p) => {
                setDoc(doc(db, patientsPath, p.id.toString()), p).catch(() => {});
              });
            }
            setLastSyncTimestamp(Date.now());
          } else {
            INITIAL_SIMULATOR_PATIENTS.forEach((p) => {
              setDoc(doc(db, patientsPath, p.id.toString()), p).catch(() => {});
            });
            setSimulatorPatients(INITIAL_SIMULATOR_PATIENTS);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, patientsPath);
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
          handleFirestoreError(error, OperationType.LIST, teamsPath);
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
            snapshot.forEach((d) => list.push(d.data() as Discente));
            setDiscenti(list);
            setLastSyncTimestamp(Date.now());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, discentiPath);
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
            snapshot.forEach((d) => list.push(d.data() as Faculty));
            setFaculty(list);
            setLastSyncTimestamp(Date.now());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, facultyPath);
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
            snapshot.forEach((d) => list.push(d.data() as Technician));
            setTechnicians(list);
            setLastSyncTimestamp(Date.now());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, techsPath);
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
            snapshot.forEach((d) => list.push(d.data() as Director));
            setDirectors(list);
            setLastSyncTimestamp(Date.now());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, directorsPath);
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
            snapshot.forEach((d) => list.push(d.data() as RegiaStaff));
            setRegiaStaff(list);
            setLastSyncTimestamp(Date.now());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, regiaPath);
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
            snapshot.forEach((d) => list.push(d.data() as Guest));
            setGuests(list);
            setLastSyncTimestamp(Date.now());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, guestsPath);
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
          console.warn('Device presence listener error:', error);
        }
      );
      unsubscribers.push(unsubPresence);
    } catch (err) {
      console.warn('Failed to listen to device_presence:', err);
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
      displayName = f?.name || 'Faculty';
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

        setDoc(doc(db, 'device_presence', deviceDocId), payload, { merge: true }).catch(() => {});
      } catch (e) {}
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 10000);

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

  const setActiveDay = useCallback((day: CourseDay) => {
    setActiveDayState(day);
    const firstIdx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.day === day);
    if (firstIdx !== -1) {
      setActiveSlotIndexState(firstIdx);
      const slot = INITIAL_TIMELINE_SLOTS[firstIdx];
      const newSecs = getSlotDurationSeconds(slot);
      setTimerSeconds(newSecs);
      setIsTimerRunning(false);
      syncCourseStateToFirestore({
        activeDay: day,
        activeSlotIndex: firstIdx,
        timerSeconds: newSecs,
        isTimerRunning: false,
      });
    }
  }, [syncCourseStateToFirestore]);

  const setActiveSlotIndex = useCallback((idx: number) => {
    if (idx >= 0 && idx < INITIAL_TIMELINE_SLOTS.length) {
      setActiveSlotIndexState(idx);
      const slot = INITIAL_TIMELINE_SLOTS[idx];
      setActiveDayState(slot.day);
      const newSecs = getSlotDurationSeconds(slot);
      setTimerSeconds(newSecs);
      setIsTimerRunning(false);
      syncCourseStateToFirestore({
        activeSlotIndex: idx,
        activeDay: slot.day,
        timerSeconds: newSecs,
        isTimerRunning: false,
      });
    }
  }, [syncCourseStateToFirestore]);

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
  }, [syncCourseStateToFirestore]);

  const prevSlot = useCallback(() => {
    setActiveSlotIndexState((prev) => {
      const next = Math.max(0, prev - 1);
      const slot = INITIAL_TIMELINE_SLOTS[next];
      setActiveDayState(slot.day);
      const newSecs = getSlotDurationSeconds(slot);
      setTimerSeconds(newSecs);
      setIsTimerRunning(false);
      syncCourseStateToFirestore({
        activeSlotIndex: next,
        activeDay: slot.day,
        timerSeconds: newSecs,
        isTimerRunning: false,
      });
      return next;
    });
  }, [syncCourseStateToFirestore]);

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
      setSimulatorPatients((prev) =>
        prev.map((p) => {
          if (p.id !== patientId) return p;
          const updatedChecklist = {
            ...p.techChecklist,
            [phase]: val,
            verifiedAt: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
          };
          const updatedPatient = {
            ...p,
            techChecklist: updatedChecklist,
            techNotes: notes !== undefined ? notes : p.techNotes,
          };

          setDoc(doc(db, 'simulator_patients', String(patientId)), updatedPatient, { merge: true }).catch((err) => {
            handleFirestoreError(err, OperationType.UPDATE, `simulator_patients/${patientId}`);
          });

          return updatedPatient;
        })
      );
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

  const startCourseImmediately = useCallback(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const d = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const t = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const updated: CourseStartSchedule = {
      ...courseStartSchedule,
      scheduledDate: d,
      scheduledTime: t,
      isoTimestamp: now.toISOString(),
      isGateEnabled: false,
    };
    setCourseStartSchedule(updated);
    syncCourseStateToFirestore({ courseStartSchedule: updated });
    triggerLongBeepWithAnimation();
  }, [courseStartSchedule, syncCourseStateToFirestore]);

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
    };
    setCourseStartSchedule(updated);
    syncCourseStateToFirestore({ courseStartSchedule: updated });
  }, [courseStartSchedule, syncCourseStateToFirestore]);

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

  const setGateMode = useCallback((mode: 'start' | 'lunch', customTime?: string) => {
    setCourseStartSchedule((prev) => {
      let tTime = customTime;
      let title = prev.title;
      let location = prev.location;
      if (mode === 'lunch') {
        tTime = customTime || '13:00';
        title = 'PAUSA PRANZO • GATE CHIUSO IN STANDBY';
        location = 'Ristorante Centro Simulazione / Mensa (12:00 - 13:00)';
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
          syncCourseStateToFirestore({ activeDay: 2, activeSlotIndex: targetIdx, timerSeconds: secs, isTimerRunning: true });
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
    [nextSlot, prevSlot, syncCourseStateToFirestore]
  );

  const triggerSimulatedClinicalEvent = useCallback(() => {
    const randomEvents = [
      {
        title: '⚡ ARRESTO CARDIACO TRAUMATICO IN SHOCK ROOM',
        msg: 'Paziente 2 in Shock Room 2 presenta ritmo FV/TV senza polso improvviso! Richiesta defibrillazione immediata e massaggio cardiaco!',
        priority: 'critical' as const,
      },
      {
        title: '🩸 EMORRAGIA MASSIVA & DISLOCAZIONE TOURNIQUET',
        msg: 'Postazione Extra 1: Il tourniquet si è allentato durante il trasporto barella. Sanguinamento a getto massivo su arto inferiore Paziente 1!',
        priority: 'critical' as const,
      },
      {
        title: '🫁 PNEUMOTORACE IPERTESO ACUTO IN VOLO/TRASPORTO',
        msg: 'Paziente 3: Caduta saturazione a 72%, deviazione tracheale e assenza murmure emitorace dx. Necessaria toracostomia con ago/dito immediata!',
        priority: 'high' as const,
      },
      {
        title: '🔬 ECO FAST POSITIVA & RICHIESTA REBOA ZONE 1',
        msg: 'Shock Room 3: E-FAST positiva in spazio epato-renale (Morrison) con collasso pressorio 60/30. Indicazione posizionamento catetere REBOA!',
        priority: 'high' as const,
      },
      {
        title: '💥 EMERGENZA VIE AEREE: EDEMA MASSIVO CRICO',
        msg: 'Postazione 4: Impossibile intubare, impossibile ventilare. Attivato protocollo CICO (Cannot Intubate Cannot Oxygenate) per cricotirotomia!',
        priority: 'critical' as const,
      },
    ];

    const evt = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    sendCourseMessage({
      senderId: 'sim-regia',
      senderName: 'Simulatore Regia Trauma',
      senderRole: 'direttore',
      recipientTarget: 'ALL',
      subject: evt.title,
      message: evt.msg,
      priority: evt.priority === 'critical' ? 'urgent' : 'normal',
      category: 'clinical_alert',
    });
    playBroadcastSound(evt.priority === 'critical' ? 'emergency' : 'warning');
  }, [sendCourseMessage]);

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
        courseMessages,
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
        addDiscente,
        deleteDiscente,
        faculty,
        updateFaculty,
        addFaculty,
        deleteFaculty,
        technicians,
        updateTechnician,
        addTechnician,
        deleteTechnician,
        directors,
        updateDirector,
        addDirector,
        deleteDirector,
        regiaStaff,
        updateRegiaStaff,
        addRegiaStaff,
        deleteRegiaStaff,
        guests,
        updateGuest,
        addGuest,
        deleteGuest,
        evaluations,
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
        signInWithGoogle,
        signOutFirebase,
        timeMultiplier,
        setTimeMultiplier,
        autoAdvancePhases,
        setAutoAdvancePhases,
        isSimulationModalOpen,
        setIsSimulationModalOpen,
        jumpToTimelinePoint,
        triggerSimulatedClinicalEvent,
        resetAllData,
        isBeeping,
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
