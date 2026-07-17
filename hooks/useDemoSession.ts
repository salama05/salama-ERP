"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  startDemoSession,
  getDemoSession,
  endDemoSession,
  getDemoTimeRemaining,
  getDemoOperationsRemaining,
  formatDemoTime,
  isDemoActive,
  incrementDemoOperation,
  type DemoSession,
} from "@/lib/demo-session";

export interface UseDemoSessionReturn {
  isDemoMode: boolean;
  session: DemoSession | null;
  timeLeftFormatted: string;
  timeLeftMs: number;
  operationsLeft: number;
  isNearExpiry: boolean;
  isExpired: boolean;
  beginDemo: () => DemoSession;
  exitDemo: () => void;
  useOperation: () => boolean;
}

/**
 * Hook to manage demo session state.
 *
 * Source of truth:  `demo_session` cookie (set by /api/demo/start).
 * Timer/operations: localStorage (lightweight per-tab tracking).
 *
 * Safe for SSR — returns isDemoMode=false on the server.
 */
export function useDemoSession(): UseDemoSessionReturn {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [operationsLeft, setOperationsLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    // isDemoActive() checks cookie first, then localStorage timer.
    if (!isDemoActive()) {
      const hadSession = session !== null;
      setSession(null);
      setTimeLeftMs(0);
      setOperationsLeft(0);
      if (hadSession) setIsExpired(true);
      return;
    }

    const current = getDemoSession();
    if (current) {
      setSession(current);
      const remaining = getDemoTimeRemaining();
      setTimeLeftMs(remaining);
      setOperationsLeft(getDemoOperationsRemaining());
      if (remaining === 0) {
        setIsExpired(true);
        setSession(null);
      } else {
        setIsExpired(false);
      }
    }
  }, [session]);

  // Initialize on mount
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll every second when demo is active
  useEffect(() => {
    if (session) {
      intervalRef.current = setInterval(refresh, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session, refresh]);

  const beginDemo = useCallback((): DemoSession => {
    const newSession = startDemoSession();
    setSession(newSession);
    setTimeLeftMs(getDemoTimeRemaining());
    setOperationsLeft(getDemoOperationsRemaining());
    setIsExpired(false);
    return newSession;
  }, []);

  const exitDemo = useCallback(() => {
    endDemoSession(); // clears cookie + localStorage
    setSession(null);
    setTimeLeftMs(0);
    setOperationsLeft(0);
    setIsExpired(false);
    // Server-side redirect clears the cookie definitively
    window.location.href = "/api/demo/end";
  }, []);

  const useOperation = useCallback((): boolean => {
    const ok = incrementDemoOperation();
    if (ok) setOperationsLeft(getDemoOperationsRemaining());
    return ok;
  }, []);

  const isDemoMode = session !== null && !isExpired;
  const isNearExpiry = timeLeftMs > 0 && timeLeftMs < 5 * 60 * 1000;

  return {
    isDemoMode,
    session,
    timeLeftFormatted: formatDemoTime(timeLeftMs),
    timeLeftMs,
    operationsLeft,
    isNearExpiry,
    isExpired,
    beginDemo,
    exitDemo,
    useOperation,
  };
}
