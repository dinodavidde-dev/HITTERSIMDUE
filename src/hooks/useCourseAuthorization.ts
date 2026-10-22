/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCourse } from '../context/CourseContext';

export interface CourseAuthorizationState {
  /** True when gate countdown has reached zero and requires Regia authorization */
  isGateExpiredAwaitingAuth: boolean;
  /** True when a 90-minute scenario macro-block requires start confirmation */
  isMacroBlockAwaitingAuth: boolean;
  /** True if the timeline interaction (timer start/pause, next/prev slot) is locked */
  isTimelineInteractionLocked: boolean;
  /** True if the active user or window has authorization privileges (Regia, Direttore, Master) */
  canAuthorize: boolean;
  /** Descriptive status of authorization */
  authorizationStatus: 'nominal' | 'gate_awaiting_auth' | 'macro_block_awaiting_auth';
  /** Human-readable explanation of why timeline interactions are locked */
  lockReason: string | null;
  /** Modal open state for Course Start Gate */
  isStartModalOpen: boolean;
  /** Setter for Course Start Gate modal open state */
  setIsStartModalOpen: (open: boolean) => void;
  /** Trigger Regia course start authorization */
  authorizeCourseStart: (byBadge?: string) => Promise<void>;
  /** Trigger Regia scenario block start authorization */
  authorizeScenarioBlockStart: (slotId: string, byBadge?: string) => Promise<void>;
  /** Course start status */
  isCourseStarted: boolean;
  /** Current slot timer seconds */
  timerSeconds: number;
}

/**
 * Custom hook that monitors `timerSeconds`, `isCourseStarted`, and gate countdown.
 * Automatically triggers the CourseStartGateAuthorizationModal state when the gate countdown reaches 00:00:00
 * and signals locked timeline interactions until Regia confirms authorization.
 */
export function useCourseAuthorization(): CourseAuthorizationState {
  const {
    userRole,
    openedByRole,
    isCourseStarted,
    timerSeconds,
    timeRemainingMs,
    courseStartSchedule,
    isGateExpiredAwaitingAuth,
    isMacroBlockAwaitingAuth,
    authorizeCourseStart: contextAuthorizeCourseStart,
    authorizeScenarioBlockStart: contextAuthorizeScenarioBlockStart,
    language,
  } = useCourse();

  const isEn = language === 'en';

  const canAuthorize = useMemo(() => {
    return (
      userRole === 'regia' ||
      userRole === 'direttore' ||
      userRole === 'master' ||
      openedByRole === 'regia' ||
      openedByRole === 'direttore' ||
      openedByRole === 'master'
    );
  }, [userRole, openedByRole]);

  // Modal open state for CourseStartGateAuthorizationModal
  const [isStartModalOpen, setIsStartModalOpen] = useState<boolean>(false);

  // Automatically trigger CourseStartGateAuthorizationModal when gate countdown hits zero (for authorizers)
  useEffect(() => {
    if (isGateExpiredAwaitingAuth && canAuthorize) {
      setIsStartModalOpen(true);
    } else if (!isGateExpiredAwaitingAuth) {
      setIsStartModalOpen(false);
    }
  }, [isGateExpiredAwaitingAuth, canAuthorize]);

  // Determine if timeline interactions must be locked (timer controls, phase advancement)
  const isTimelineInteractionLocked = useMemo(() => {
    // 0. If course has not started at all, interactions are locked
    if (!isCourseStarted) return true;
    // 1. Gate countdown reached zero and not yet authorized
    if (isGateExpiredAwaitingAuth) return true;
    // 2. Pre-course mode with gate enabled
    if (courseStartSchedule?.isGateEnabled && !isCourseStarted) return true;
    // 3. Macro block awaiting Regia confirmation
    if (isMacroBlockAwaitingAuth) return true;
    return false;
  }, [isCourseStarted, isGateExpiredAwaitingAuth, courseStartSchedule?.isGateEnabled, isMacroBlockAwaitingAuth]);

  const authorizationStatus = useMemo<'nominal' | 'gate_awaiting_auth' | 'macro_block_awaiting_auth'>(() => {
    if (!isCourseStarted || isGateExpiredAwaitingAuth || (courseStartSchedule?.isGateEnabled && !isCourseStarted)) {
      return 'gate_awaiting_auth';
    }
    if (isMacroBlockAwaitingAuth) {
      return 'macro_block_awaiting_auth';
    }
    return 'nominal';
  }, [isCourseStarted, isGateExpiredAwaitingAuth, courseStartSchedule?.isGateEnabled, isMacroBlockAwaitingAuth]);

  const lockReason = useMemo<string | null>(() => {
    if (isGateExpiredAwaitingAuth) {
      return isEn
        ? 'Timeline locked: Awaiting Regia official launch authorization (Gate 00:00:00 reached)'
        : 'Interazioni bloccate: In attesa di autorizzazione ufficiale avvio corso dalla Regia (Gate 00:00:00)';
    }
    if (!isCourseStarted) {
      return isEn
        ? 'Timeline locked: Course not started — awaiting Control Room authorization'
        : 'Interazioni bloccate: Corso non avviato — in attesa di autorizzazione dalla Regia';
    }
    if (isMacroBlockAwaitingAuth) {
      return isEn
        ? 'Timeline locked: Scenario rotational block start requires Regia confirmation'
        : 'Interazioni bloccate: Avvio blocco scenario rotazionale in attesa di conferma Regia';
    }
    return null;
  }, [isGateExpiredAwaitingAuth, isCourseStarted, isMacroBlockAwaitingAuth, isEn]);

  const authorizeCourseStart = useCallback(
    async (byBadge?: string) => {
      const defaultBadge = userRole === 'master' ? 'MASTER-01' : userRole === 'direttore' ? 'DIR-01' : 'REGIA-01';
      await contextAuthorizeCourseStart(byBadge || defaultBadge);
      setIsStartModalOpen(false);
    },
    [contextAuthorizeCourseStart, userRole]
  );

  const authorizeScenarioBlockStart = useCallback(
    async (slotId: string, byBadge?: string) => {
      const defaultBadge = userRole === 'master' ? 'MASTER-01' : userRole === 'direttore' ? 'DIR-01' : 'REGIA-01';
      await contextAuthorizeScenarioBlockStart(slotId, byBadge || defaultBadge);
    },
    [contextAuthorizeScenarioBlockStart, userRole]
  );

  return {
    isGateExpiredAwaitingAuth,
    isMacroBlockAwaitingAuth,
    isTimelineInteractionLocked,
    canAuthorize,
    authorizationStatus,
    lockReason,
    isStartModalOpen,
    setIsStartModalOpen,
    authorizeCourseStart,
    authorizeScenarioBlockStart,
    isCourseStarted,
    timerSeconds,
  };
}
