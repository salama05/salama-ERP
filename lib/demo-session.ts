/**
 * Demo Session Management — v2
 *
 * Source of truth for "is demo active?":  `demo_session` cookie (set by the
 * server-side /api/demo/start route).  The cookie is readable by client JS
 * (non-HttpOnly) so we can check it here without a round-trip.
 *
 * Timer + operation counting stay in localStorage (per-tab, lightweight).
 */

export const DEMO_ORG_ID = "demo_workspace";
export const DEMO_COOKIE = "demo_session";
export const DEMO_COOKIE_VALUE = "active";
export const DEMO_SESSION_KEY = "salama_demo_session";
export const DEMO_PREFS_KEY = "salama_demo_prefs";
export const DEMO_DURATION_MS = 30 * 60 * 1000; // 30 minutes
export const DEMO_MAX_OPERATIONS = 50;

export interface DemoSession {
  startedAt: number;
  expiresAt: number;
  operationsUsed: number;
  sessionId: string;
}

export interface DemoPreferences {
  branches?: number;
  selectedPlan?: string;
  industry?: string;
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

/** Returns true if the `demo_session` cookie is present (client-side). */
export function hasDemoCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${DEMO_COOKIE}=`));
}

/** Removes the `demo_session` cookie by expiring it. */
export function clearDemoCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

// ─── localStorage session ─────────────────────────────────────────────────────

function generateSessionId(): string {
  return `demo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Initialise the localStorage timer/counter for the current demo session.
 * Called automatically by `isDemoActive()` if no localStorage record exists
 * yet but the cookie is present (first page load after /api/demo/start).
 */
export function startDemoSession(): DemoSession {
  const now = Date.now();
  const session: DemoSession = {
    startedAt: now,
    expiresAt: now + DEMO_DURATION_MS,
    operationsUsed: 0,
    sessionId: generateSessionId(),
  };
  try {
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  } catch {
    // SSR / private-mode — safe to ignore
  }
  return session;
}

/** Read localStorage record. Does NOT check the cookie. */
export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const session: DemoSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(DEMO_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * The single authoritative check for whether the user is in demo mode.
 *
 * Returns true if:
 *  - the `demo_session` cookie is present, AND
 *  - the localStorage timer has not expired.
 *
 * If the cookie is present but no localStorage record exists yet
 * (e.g. first render after the server redirect) we auto-initialise it.
 */
export function isDemoActive(): boolean {
  if (!hasDemoCookie()) return false;
  const session = getDemoSession();
  if (session) return true;
  // Cookie present but no localStorage record → first visit, initialise now.
  startDemoSession();
  return true;
}

/** Increment the operations counter. Returns false if the limit is reached. */
export function incrementDemoOperation(): boolean {
  const session = getDemoSession();
  if (!session) return false;
  if (session.operationsUsed >= DEMO_MAX_OPERATIONS) return false;
  const updated: DemoSession = {
    ...session,
    operationsUsed: session.operationsUsed + 1,
  };
  try {
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return true;
}

/** Milliseconds remaining in the session. Returns 0 if expired / no session. */
export function getDemoTimeRemaining(): number {
  const session = getDemoSession();
  if (!session) return 0;
  return Math.max(0, session.expiresAt - Date.now());
}

/** Operations remaining before the limit. */
export function getDemoOperationsRemaining(): number {
  const session = getDemoSession();
  if (!session) return 0;
  return Math.max(0, DEMO_MAX_OPERATIONS - session.operationsUsed);
}

/**
 * End the demo session completely:
 * - Clear the server cookie (by expiring it client-side).
 * - Remove localStorage record.
 */
export function endDemoSession(): void {
  clearDemoCookie();
  try {
    localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // ignore
  }
}

// ─── Preferences ──────────────────────────────────────────────────────────────

export function saveDemoPreferences(prefs: Partial<DemoPreferences>): void {
  try {
    const existing = getDemoPreferences();
    localStorage.setItem(
      DEMO_PREFS_KEY,
      JSON.stringify({ ...existing, ...prefs })
    );
  } catch {
    // ignore
  }
}

export function getDemoPreferences(): DemoPreferences {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DEMO_PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function clearDemoPreferences(): void {
  try {
    localStorage.removeItem(DEMO_PREFS_KEY);
  } catch {
    // ignore
  }
}

/** Format milliseconds as "MM:SS". */
export function formatDemoTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
