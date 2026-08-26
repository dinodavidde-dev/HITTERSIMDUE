import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  BroadcastAlert,
  CourseDay,
  CourseMessage,
  CourseSuspensionInfo,
  Discente,
  Director,
  Faculty,
  Guest,
  NightScenarioCase,
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
} from '../types';
import {
  INITIAL_BROADCAST_ALERTS,
  INITIAL_COURSE_MESSAGES,
  INITIAL_DIRECTORS,
  INITIAL_DISCENTI,
  INITIAL_FACULTY,
  INITIAL_GUESTS,
  INITIAL_NIGHT_SCENARIOS,
  INITIAL_SIMULATOR_PATIENTS,
  INITIAL_TEAMS,
  INITIAL_TECHNICIANS,
  INITIAL_TIMELINE_SLOTS,
} from '../data/initialData';
import { playBroadcastSound } from '../utils/audio';
import { cleanUndefined } from '../utils/teamUtils';
import { Language, translations } from '../i18n/translations';
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

  broadcastAlerts: BroadcastAlert[];
  latestAlert: BroadcastAlert | null;
  sendBroadcastAlert: (alert: Omit<BroadcastAlert, 'id' | 'timestamp' | 'active'>) => void;
  dismissAlert: (id: string) => void;

  simulatorPatients: SimulatorPatient[];
  updateSimulatorPatient: (patientId: number, updates: Partial<SimulatorPatient>) => void;
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

  guests: Guest[];
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  addGuest: (newGuest: Omit<Guest, 'id'>) => void;
  deleteGuest: (id: string) => void;

  nightScenarios: NightScenarioCase[];
  updateNightScenarioTriage: (teamId: number, triage: TriageCategory) => void;

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
  selectedGuestId: string;
  setSelectedGuestId: (id: string) => void;

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

  syncStatus: SyncStatusInfo;
  triggerManualSync: () => void;
  sendPing: () => void;

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
  const [userRole, setUserRole] = useState<UserRole>(() => getStoredOrDefault('userRole', 'public'));
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

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'language', JSON.stringify(lang));
    } catch (e) {
      console.warn('Failed to save language', e);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'en' ? 'it' : 'en';
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'language', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save language', e);
      }
      return next;
    });
  }, []);

  const t = useCallback((key: keyof typeof translations, defaultText?: string) => {
    const item = translations[key];
    if (!item) return defaultText || key;
    return item[language] || item['en'] || defaultText || key;
  }, [language]);

  const [timelineSlots] = useState<TimelineSlot[]>(INITIAL_TIMELINE_SLOTS);
  const filteredSlots = timelineSlots.filter((s) => s.day === activeDay);
  const currentSlot = timelineSlots[activeSlotIndex] || timelineSlots[0];

  const [timerSeconds, setTimerSeconds] = useState<number>(() => {
    return (currentSlot?.durationMinutes || 30) * 60;
  });
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const [broadcastAlerts, setBroadcastAlerts] = useState<BroadcastAlert[]>(() =>
    getStoredOrDefault('broadcastAlerts', INITIAL_BROADCAST_ALERTS)
  );
  const [latestAlert, setLatestAlert] = useState<BroadcastAlert | null>(null);

  const [simulatorPatients, setSimulatorPatients] = useState<SimulatorPatient[]>(() =>
    getStoredOrDefault('simulatorPatients', INITIAL_SIMULATOR_PATIENTS)
  );

  const [teams, setTeams] = useState<Team[]>(() => getStoredOrDefault('teams', INITIAL_TEAMS));
  const [discenti, setDiscenti] = useState<Discente[]>(() => getStoredOrDefault('discenti', INITIAL_DISCENTI));
  const [faculty, setFaculty] = useState<Faculty[]>(() => getStoredOrDefault('faculty', INITIAL_FACULTY));
  const [technicians, setTechnicians] = useState<Technician[]>(() => getStoredOrDefault('technicians', INITIAL_TECHNICIANS));
  const [directors, setDirectors] = useState<Director[]>(() => getStoredOrDefault('directors', INITIAL_DIRECTORS));
  const [guests, setGuests] = useState<Guest[]>(() => getStoredOrDefault('guests', INITIAL_GUESTS));
  const [nightScenarios, setNightScenarios] = useState<NightScenarioCase[]>(() =>
    getStoredOrDefault('nightScenarios', INITIAL_NIGHT_SCENARIOS)
  );

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
  const [selectedGuestId, setSelectedGuestId] = useState<string>(() =>
    getStoredOrDefault('selectedGuestId', 'guest-1')
  );

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
      title: 'TRAUMA SIMULATION MASTER COURSE • ADVANCED TRAUMA MANAGEMENT',
      location: 'Centro di Simulazione Avanzata & Trauma Center',
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
  const timeRemainingMs = Math.max(0, targetStartTimeMs - currentTime);
  const isCourseStarted = !courseStartSchedule.isGateEnabled || targetStartTimeMs <= currentTime;

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

    // 2. Listen to Broadcast Alerts
    const alertsPath = 'broadcast_alerts';
    try {
      const unsubAlerts = onSnapshot(
        collection(db, alertsPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const alertsList: BroadcastAlert[] = [];
            snapshot.forEach((d) => alertsList.push(d.data() as BroadcastAlert));
            alertsList.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
            setBroadcastAlerts(alertsList);
            if (alertsList.length > 0 && alertsList[0].active) {
              setLatestAlert(alertsList[0]);
            }
            setLastSyncTimestamp(Date.now());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, alertsPath);
        }
      );
      unsubscribers.push(unsubAlerts);
    } catch (err) {
      console.warn('Failed to listen to broadcast_alerts:', err);
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
            setSimulatorPatients(patientsList);
            setLastSyncTimestamp(Date.now());
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

  // Sync to localStorage as local offline backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'userRole', JSON.stringify(userRole));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'activeDay', JSON.stringify(activeDay));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'activeSlotIndex', JSON.stringify(activeSlotIndex));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'broadcastAlerts', JSON.stringify(broadcastAlerts));
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
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [
    userRole,
    activeDay,
    activeSlotIndex,
    broadcastAlerts,
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
  ]);

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
      const newSecs = slot.durationMinutes * 60;
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
      const newSecs = slot.durationMinutes * 60;
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
        const newSecs = slot.durationMinutes * 60;
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
      const newSecs = slot.durationMinutes * 60;
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

    const alert: BroadcastAlert = {
      id: `alert-susp-${Date.now()}`,
      timestamp: timeStr,
      senderRole: 'direttore',
      senderName: suspendedBy,
      type: 'emergency',
      title: '🔴 CORSO SOSPESO / STOP ATTIVITÀ IN CORSO',
      message: `[DIREZIONE CORSO] Il corso è stato temporaneamente sospeso. Motivo: ${newSuspension.reason}. Rimanere nelle rispettive postazioni in attesa di ulteriori istruzioni operative.`,
      targetGroups: ['ALL'],
      active: true,
      priority: 'critical',
    };

    setBroadcastAlerts((prev) => [alert, ...prev]);
    setLatestAlert(alert);
    playBroadcastSound('emergency');

    // Persist to Firestore
    syncCourseStateToFirestore({
      suspensionInfo: newSuspension,
      isTimerRunning: false,
    });
    setDoc(doc(db, 'broadcast_alerts', alert.id), alert).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `broadcast_alerts/${alert.id}`);
    });
  }, [syncCourseStateToFirestore]);

  const resumeCourse = useCallback((resumedBy: string = 'Direzione Corso') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const clearedSuspension: CourseSuspensionInfo = {
      isSuspended: false,
      reason: '',
      suspendedAt: undefined,
      suspendedBy: undefined,
    };

    setSuspensionInfo(clearedSuspension);

    const alert: BroadcastAlert = {
      id: `alert-resum-${Date.now()}`,
      timestamp: timeStr,
      senderRole: 'direttore',
      senderName: resumedBy,
      type: 'info',
      title: '🟢 CORSO RIPARTITO / ATTIVITÀ RIPRESE',
      message: `[DIREZIONE CORSO] Il corso è ripartito regolarmente. Proseguire con le attività previste dalla fase attiva sul campo.`,
      targetGroups: ['ALL'],
      active: true,
      priority: 'high',
    };

    setBroadcastAlerts((prev) => [alert, ...prev]);
    setLatestAlert(alert);
    playBroadcastSound('info');

    // Persist to Firestore
    syncCourseStateToFirestore({
      suspensionInfo: clearedSuspension,
    });
    setDoc(doc(db, 'broadcast_alerts', alert.id), alert).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `broadcast_alerts/${alert.id}`);
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

  const sendBroadcastAlert = useCallback(
    (alertData: Omit<BroadcastAlert, 'id' | 'timestamp' | 'active'>) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newAlert: BroadcastAlert = {
        ...alertData,
        id: `alert-${Date.now()}`,
        timestamp: timeStr,
        active: true,
      };

      setBroadcastAlerts((prev) => [newAlert, ...prev]);
      setLatestAlert(newAlert);
      playBroadcastSound(newAlert.type);

      setDoc(doc(db, 'broadcast_alerts', newAlert.id), newAlert).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `broadcast_alerts/${newAlert.id}`);
      });
    },
    []
  );

  const dismissAlert = useCallback((id: string) => {
    setBroadcastAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: false } : a))
    );
    setLatestAlert((prev) => (prev?.id === id ? null : prev));

    updateDoc(doc(db, 'broadcast_alerts', id), { active: false }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `broadcast_alerts/${id}`);
    });
  }, []);

  const updateSimulatorPatient = useCallback((patientId: number, updates: Partial<SimulatorPatient>) => {
    setSimulatorPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, ...updates } : p))
    );

    setDoc(doc(db, 'simulator_patients', String(patientId)), updates, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `simulator_patients/${patientId}`);
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

  const saveEvaluation = useCallback((evalData: Omit<TeamEvaluation, 'id' | 'timestamp'>) => {
    const newEval: TeamEvaluation = {
      ...evalData,
      id: `eval-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    };

    setEvaluations((prev) => {
      const existingIdx = prev.findIndex(
        (e) => e.teamId === evalData.teamId && e.day === evalData.day && e.period === evalData.period
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newEval;
        return copy;
      }
      return [newEval, ...prev];
    });

    setDoc(doc(db, 'evaluations', newEval.id), newEval).catch((err) => {
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
    setDirectors((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    setDoc(doc(db, 'directors', id), updates, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `directors/${id}`);
    });
  }, []);

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

  const updateNightScenarioTriage = useCallback((teamId: number, triage: TriageCategory) => {
    setNightScenarios((prev) =>
      prev.map((s) => (s.teamId === teamId ? { ...s, triageAssigned: triage } : s))
    );
    setDoc(doc(db, 'night_scenarios', String(teamId)), { triageAssigned: triage }, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `night_scenarios/${teamId}`);
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
      const updated = { ...prev, isGateEnabled: enabled };
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
    playBroadcastSound('phase_change');
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
    };
    setCourseStartSchedule(updated);
    syncCourseStateToFirestore({ courseStartSchedule: updated });
  }, [courseStartSchedule, syncCourseStateToFirestore]);

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
    setUserRole('public');
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
          playBroadcastSound('phase_change');
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
          playBroadcastSound('phase_change');
          syncCourseStateToFirestore({ activeDay: 2, activeSlotIndex: targetIdx, timerSeconds: secs, isTimerRunning: true });
          break;
        }
        case 'night_scenario': {
          setActiveDayState(3);
          const idx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.day === 3 && s.period === 'notturno');
          const targetIdx = idx !== -1 ? idx : INITIAL_TIMELINE_SLOTS.length - 1;
          setActiveSlotIndexState(targetIdx);
          const s = INITIAL_TIMELINE_SLOTS[targetIdx];
          const secs = s ? s.durationMinutes * 60 : 3600;
          setTimerSeconds(secs);
          setIsTimerRunning(true);
          playBroadcastSound('emergency');
          syncCourseStateToFirestore({ activeDay: 3, activeSlotIndex: targetIdx, timerSeconds: secs, isTimerRunning: true });
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
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newAlert: BroadcastAlert = {
      id: `alert-sim-${Date.now()}`,
      timestamp: timeStr,
      senderRole: 'direttore',
      senderName: 'Simulatore Regia Trauma',
      type: evt.priority === 'critical' ? 'emergency' : 'warning',
      title: evt.title,
      message: evt.msg,
      targetGroups: ['ALL'],
      active: true,
      priority: evt.priority,
    };

    setBroadcastAlerts((prev) => [newAlert, ...prev]);
    setLatestAlert(newAlert);
    playBroadcastSound(evt.priority === 'critical' ? 'emergency' : 'warning');

    setDoc(doc(db, 'broadcast_alerts', newAlert.id), newAlert).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `broadcast_alerts/${newAlert.id}`);
    });
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

  const triggerManualSync = useCallback(() => {
    setIsSyncing(true);
    setLastSyncTimestamp(Date.now());
    // Trigger snapshot refresh
    getDocs(collection(db, 'broadcast_alerts'))
      .then((snap) => {
        const alertsList: BroadcastAlert[] = [];
        snap.forEach((d) => alertsList.push(d.data() as BroadcastAlert));
        if (alertsList.length > 0) setBroadcastAlerts(alertsList);
      })
      .catch((e) => console.warn('Manual sync alert error:', e));

    setTimeout(() => {
      setIsSyncing(false);
    }, 400);
  }, []);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'public': return 'Schermo Condiviso';
      case 'discente': return 'Discente Badge';
      case 'tecnico': return 'Console Tecnico';
      case 'faculty': return 'Istruttore Faculty';
      case 'direttore': return 'Regia Direttore';
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
    setBroadcastAlerts(INITIAL_BROADCAST_ALERTS);
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
        broadcastAlerts,
        latestAlert,
        sendBroadcastAlert,
        dismissAlert,
        simulatorPatients,
        updateSimulatorPatient,
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
        guests,
        updateGuest,
        addGuest,
        deleteGuest,
        nightScenarios,
        updateNightScenarioTriage,
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
        selectedGuestId,
        setSelectedGuestId,
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
        syncStatus,
        triggerManualSync,
        sendPing,
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
