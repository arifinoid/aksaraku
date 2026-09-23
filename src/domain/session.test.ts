import { describe, expect, test } from "bun:test";
import {
  elapsedMs,
  formatRemaining,
  isBreakDue,
  isSessionExpired,
  markBreak,
  MINUTE_MS,
  remainingMs,
  restartSession,
  resumeSession,
  STALE_SESSION_MS,
  startSession,
  touchSession,
} from "./session";
import type { ProfileId } from "./types";

const profileId = "p1" as ProfileId;
const T0 = 1_000_000;

describe("play session", () => {
  test("starts with zero elapsed and no break taken", () => {
    const session = startSession(profileId, T0);
    expect(elapsedMs(session, T0)).toBe(0);
    expect(session.lastBreakAt).toBeNull();
    expect(session.lastSeenAt).toBe(T0);
  });

  test("elapsed never goes negative", () => {
    const session = startSession(profileId, T0);
    expect(elapsedMs(session, T0 - 5000)).toBe(0);
  });

  test("remaining counts down and clamps at zero", () => {
    const session = startSession(profileId, T0);
    expect(remainingMs(session, 15, T0)).toBe(15 * MINUTE_MS);
    expect(remainingMs(session, 15, T0 + 5 * MINUTE_MS)).toBe(10 * MINUTE_MS);
    expect(remainingMs(session, 15, T0 + 60 * MINUTE_MS)).toBe(0);
  });

  test("expires exactly at the limit", () => {
    const session = startSession(profileId, T0);
    expect(isSessionExpired(session, 10, T0 + 10 * MINUTE_MS - 1)).toBe(false);
    expect(isSessionExpired(session, 10, T0 + 10 * MINUTE_MS)).toBe(true);
  });

  test("a zero limit is immediately expired", () => {
    const session = startSession(profileId, T0);
    expect(isSessionExpired(session, 0, T0)).toBe(true);
  });

  test("restart clears elapsed time and the break marker", () => {
    const session = markBreak(startSession(profileId, T0), T0 + MINUTE_MS);
    const restarted = restartSession(session, T0 + 20 * MINUTE_MS);
    expect(restarted.startedAt).toBe(T0 + 20 * MINUTE_MS);
    expect(restarted.lastBreakAt).toBeNull();
    expect(elapsedMs(restarted, T0 + 20 * MINUTE_MS)).toBe(0);
  });
});

describe("resumeSession", () => {
  test("keeps elapsed time across a quick reload", () => {
    const session = startSession(profileId, T0);
    const now = T0 + 30_000;
    const resumed = resumeSession(session, now);
    expect(resumed.startedAt).toBe(T0);
    expect(elapsedMs(resumed, now)).toBe(30_000);
    expect(resumed.lastSeenAt).toBe(now);
  });

  test("starts fresh after being left alone", () => {
    const session = startSession(profileId, T0);
    const later = T0 + STALE_SESSION_MS + 1;
    const resumed = resumeSession(session, later);
    expect(resumed.startedAt).toBe(later);
    expect(elapsedMs(resumed, later)).toBe(0);
  });

  test("touch keeps the start time and only moves lastSeenAt", () => {
    const session = startSession(profileId, T0);
    const touched = touchSession(session, T0 + 2 * MINUTE_MS);
    expect(touched.startedAt).toBe(T0);
    expect(touched.lastSeenAt).toBe(T0 + 2 * MINUTE_MS);
  });
});

describe("break reminder", () => {
  test("not due before the reminder window", () => {
    const session = startSession(profileId, T0);
    expect(isBreakDue(session, 5, T0 + 4 * MINUTE_MS)).toBe(false);
  });

  test("due once the window passes", () => {
    const session = startSession(profileId, T0);
    expect(isBreakDue(session, 5, T0 + 5 * MINUTE_MS)).toBe(true);
  });

  test("fires only once per session", () => {
    const session = markBreak(startSession(profileId, T0), T0 + 5 * MINUTE_MS);
    expect(isBreakDue(session, 5, T0 + 30 * MINUTE_MS)).toBe(false);
  });

  test("a disabled reminder never fires", () => {
    const session = startSession(profileId, T0);
    expect(isBreakDue(session, 0, T0 + 60 * MINUTE_MS)).toBe(false);
  });
});

describe("formatRemaining", () => {
  test("formats minutes and zero-padded seconds", () => {
    expect(formatRemaining(0)).toBe("0:00");
    expect(formatRemaining(9_000)).toBe("0:09");
    expect(formatRemaining(65_000)).toBe("1:05");
    expect(formatRemaining(15 * MINUTE_MS)).toBe("15:00");
  });

  test("rounds up partial seconds and clamps negatives", () => {
    expect(formatRemaining(1)).toBe("0:01");
    expect(formatRemaining(-5000)).toBe("0:00");
  });
});
