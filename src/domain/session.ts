import type { ProfileId } from "./types";

export const MINUTE_MS = 60_000;

/** A session is abandoned (not merely reloaded) after this much idle time. */
export const STALE_SESSION_MS = 5 * MINUTE_MS;

export interface PlaySession {
  readonly profileId: ProfileId;
  readonly startedAt: number;
  readonly lastSeenAt: number;
  readonly lastBreakAt: number | null;
}

export const startSession = (
  profileId: ProfileId,
  now: number,
): PlaySession => ({
  profileId,
  startedAt: now,
  lastSeenAt: now,
  lastBreakAt: null,
});

export const restartSession = (
  session: PlaySession,
  now: number,
): PlaySession => startSession(session.profileId, now);

/**
 * Keeps an in-progress session across quick reloads, but starts a fresh one
 * when the app was left alone long enough to count as a new sitting.
 */
export const resumeSession = (session: PlaySession, now: number): PlaySession =>
  now - session.lastSeenAt > STALE_SESSION_MS
    ? startSession(session.profileId, now)
    : { ...session, lastSeenAt: now };

export const touchSession = (session: PlaySession, now: number): PlaySession => ({
  ...session,
  lastSeenAt: now,
});

export const elapsedSince = (startedAt: number, now: number): number =>
  Math.max(0, now - startedAt);

export const limitMs = (sessionLimitMin: number): number =>
  Math.max(0, sessionLimitMin) * MINUTE_MS;

export const remainingSince = (
  startedAt: number,
  sessionLimitMin: number,
  now: number,
): number =>
  Math.max(0, limitMs(sessionLimitMin) - elapsedSince(startedAt, now));

export const isExpiredSince = (
  startedAt: number,
  sessionLimitMin: number,
  now: number,
): boolean => remainingSince(startedAt, sessionLimitMin, now) <= 0;

export const isBreakDueSince = (
  startedAt: number,
  breakReminderMin: number,
  lastBreakAt: number | null,
  now: number,
): boolean => {
  if (breakReminderMin <= 0) return false;
  if (lastBreakAt !== null) return false;
  return elapsedSince(startedAt, now) >= limitMs(breakReminderMin);
};

export const elapsedMs = (session: PlaySession, now: number): number =>
  elapsedSince(session.startedAt, now);

export const remainingMs = (
  session: PlaySession,
  sessionLimitMin: number,
  now: number,
): number => remainingSince(session.startedAt, sessionLimitMin, now);

export const isSessionExpired = (
  session: PlaySession,
  sessionLimitMin: number,
  now: number,
): boolean => isExpiredSince(session.startedAt, sessionLimitMin, now);

export const isBreakDue = (
  session: PlaySession,
  breakReminderMin: number,
  now: number,
): boolean =>
  isBreakDueSince(
    session.startedAt,
    breakReminderMin,
    session.lastBreakAt,
    now,
  );

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
