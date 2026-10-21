import type { ProfileId } from "./types";

export const MINUTE_MS = 60_000;

/**
 * A session counts as idle after this much time without any interaction.
 *
 * Idleness is *not* a licence to reset the screen-time budget: the child
 * could otherwise defeat the limit by reloading the app every few minutes.
 */
export const STALE_SESSION_MS = 5 * MINUTE_MS;

export interface PlaySession {
  readonly profileId: ProfileId;
  /** Start of the current stretch of foreground time. */
  readonly startedAt: number;
  /**
   * Start of the stretch of foreground time that is currently running.
   *
   * `null` while the app is in the background: no screen time accrues then.
   */
  readonly activeSince: number | null;
  /** When the app was last in the foreground. */
  readonly lastSeenAt: number;
  readonly lastBreakAt: number | null;
  /**
   * Screen time already used, in minutes, including earlier sittings.
   *
   * The limit applies to this budget rather than to the wall clock, so a
   * reload — or closing the app for a while — cannot hand the child a fresh
   * allowance.
   */
  readonly spentMinutes: number;
}

export const startSession = (
  profileId: ProfileId,
  now: number,
): PlaySession => ({
  profileId,
  startedAt: now,
  activeSince: now,
  lastSeenAt: now,
  lastBreakAt: null,
  spentMinutes: 0,
});

/**
 * Starts a fresh allowance.
 *
 * This is only reachable through the parental gate, so it is the one place
 * where the screen-time budget may be cleared.
 */
export const restartSession = (
  session: PlaySession,
  now: number,
): PlaySession => startSession(session.profileId, now);

export const touchSession = (session: PlaySession, now: number): PlaySession => ({
  ...session,
  lastSeenAt: now,
  activeSince: session.activeSince ?? now,
});

export const elapsedSince = (startedAt: number, now: number): number =>
  Math.max(0, now - startedAt);

export const limitMs = (sessionLimitMin: number): number =>
  Math.max(0, sessionLimitMin) * MINUTE_MS;

/**
 * Screen time used so far, in milliseconds.
 *
 * The budget is the time already banked plus the stretch that is still
 * running. A reload therefore cannot reset it, and time spent with the app
 * closed never counts.
 */
export const spentMs = (session: PlaySession, now: number): number =>
  session.spentMinutes * MINUTE_MS +
  (session.activeSince === null ? 0 : elapsedSince(session.activeSince, now));

export const remainingMs = (
  session: PlaySession,
  sessionLimitMin: number,
  now: number,
): number => Math.max(0, limitMs(sessionLimitMin) - spentMs(session, now));

export const isSessionExpired = (
  session: PlaySession,
  sessionLimitMin: number,
  now: number,
): boolean => remainingMs(session, sessionLimitMin, now) <= 0;

/**
 * Banks the foreground time used so far and ends the running stretch.
 *
 * Called when the app goes to the background or is closed. The time the app
 * spends closed is not screen time, so the stretch simply stops.
 */
export const bankSession = (session: PlaySession, now: number): PlaySession => {
  if (session.activeSince === null) return session;

  const used = elapsedSince(session.activeSince, now);
  if (used <= 0) return session;

  // A break taken long ago no longer applies: the child was away long
  // enough for it to have passed.
  const awayTooLong = now - session.lastSeenAt > STALE_SESSION_MS;
  const lastBreakAt =
    awayTooLong && session.lastBreakAt !== null ? null : session.lastBreakAt;

  return {
    ...session,
    spentMinutes: session.spentMinutes + used / MINUTE_MS,
    // No stretch is running while the app is in the background.
    activeSince: null,
    lastBreakAt,
  };
};

/**
 * Keeps an in-progress session across a reload.
 *
 * The budget is preserved, so reloading the app never gives the child a
 * fresh screen-time allowance. Only the parent can clear it, through
 * `restartSession`.
 */
export const resumeSession = (session: PlaySession, now: number): PlaySession => {
  // Sessions stored before the budget existed have no `spentMinutes`.
  const banked = session.spentMinutes ?? 0;
  const activeSince = session.activeSince ?? null;

  // If the app was killed rather than hidden, the stretch that was running
  // was never banked. Charge it only up to the moment the app was last seen
  // — the time after that was spent with the app closed.
  const charged =
    activeSince === null
      ? 0
      : elapsedSince(activeSince, Math.min(session.lastSeenAt, now));

  return {
    ...session,
    spentMinutes: banked + charged / MINUTE_MS,
    // A new stretch starts now.
    activeSince: now,
    lastSeenAt: now,
  };
};

/**
 * Whether the child should be reminded to take a break.
 *
 * The reminder counts active screen time, not the wall clock, so time spent
 * with the app closed does not count towards it.
 */
export const isBreakDue = (
  session: PlaySession,
  breakReminderMin: number,
  now: number,
): boolean => {
  if (breakReminderMin <= 0) return false;
  if (session.lastBreakAt !== null) return false;
  return spentMs(session, now) >= limitMs(breakReminderMin);
};

export const markBreak = (session: PlaySession, now: number): PlaySession => ({
  ...session,
  lastBreakAt: now,
});

export const formatRemaining = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};
