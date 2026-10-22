import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, disableNetwork, enableNetwork, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Silence internal Firestore SDK retry and backoff log noise (prevents unhandled quota warning spam)
try {
  setLogLevel('silent');
} catch (e) {}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let isNetworkDisabled = false;
let isQuotaExhaustedFlag = false;

// Check if quota was previously flagged in this session or localStorage
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('firestore_quota_exhausted') === 'true') {
      isQuotaExhaustedFlag = true;
      isNetworkDisabled = true;
      disableNetwork(db).catch(() => {});
    }
  } catch (e) {}
}

export function isQuotaExhausted(): boolean {
  return isQuotaExhaustedFlag;
}

export function markQuotaExhausted(): void {
  isQuotaExhaustedFlag = true;
  isNetworkDisabled = true;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('firestore_quota_exhausted', 'true');
    }
  } catch (e) {}
  disableNetwork(db).catch(() => {});
}

export async function resetQuotaStatus(): Promise<void> {
  isQuotaExhaustedFlag = false;
  isNetworkDisabled = false;
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('firestore_quota_exhausted');
    }
  } catch (e) {}
  try {
    await enableNetwork(db);
  } catch (e) {}
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const rawMsg = error instanceof Error ? error.message : String(error);
  const errorCode = (error && typeof error === 'object' && 'code' in error) ? String((error as any).code) : '';

  const isQuotaOrResourceExhausted =
    errorCode === 'resource-exhausted' ||
    errorCode.includes('resource-exhausted') ||
    rawMsg.toLowerCase().includes('quota') ||
    rawMsg.toLowerCase().includes('resource-exhausted');

  if (isQuotaOrResourceExhausted) {
    markQuotaExhausted();
    return;
  }

  const isPermissionError =
    rawMsg.toLowerCase().includes('permission') ||
    rawMsg.toLowerCase().includes('insufficient') ||
    errorCode === 'permission-denied';

  const errInfo: FirestoreErrorInfo = {
    error: rawMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (isPermissionError) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    // Other errors (network offline, etc.)
    console.warn(`[Firestore ${operationType} on ${path || 'unknown'}] Handled notice: ${rawMsg}`);
  }
}

export async function testConnection(): Promise<boolean> {
  if (isQuotaExhausted() || isNetworkDisabled) {
    return false;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : String(error);
    const errorCode = (error && typeof error === 'object' && 'code' in error) ? String((error as any).code) : '';
    if (errorCode === 'resource-exhausted' || rawMsg.toLowerCase().includes('quota') || rawMsg.toLowerCase().includes('resource-exhausted')) {
      markQuotaExhausted();
    } else if (rawMsg.includes('the client is offline')) {
      // client offline
    }
    return false;
  }
}

export async function signInWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

