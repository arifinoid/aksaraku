import { describe, expect, test } from "bun:test";
import {
  bankSession,
  formatRemaining,
  isBreakDue,
  isSessionExpired,
  markBreak,
  MINUTE_MS,
  remainingMs,
  restartSession,
  resumeSession,
  spentMs,
  startSession,
  touchSession,
} from "./session";
import type { ProfileId } from "./types";

const profileId = "p1" as ProfileId;
const T0 = 1_000_000;

describe("play session", () => {
  test("starts with zero elapsed and no break taken", () => {
    const session = startSession(profileId, T0);
    expect(spentMs(session, T0)).toBe(0);
    expect(session.lastBreakAt).toBeNull();
    expect(session.lastSeenAt).toBe(T0);
  });

  test("elapsed never goes negative", () => {
    const session = startSession(profileId, T0);
    expect(spentMs(session, T0 - 5000)).toBe(0);
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

  test("restart clears elapsed time, the budget and the break marker", () => {
    const session = markBreak(startSession(profileId, T0), T0 + MINUTE_MS);
    const restarted = restartSession(session, T0 + 20 * MINUTE_MS);
    expect(restarted.startedAt).toBe(T0 + 20 * MINUTE_MS);
    expect(restarted.lastBreakAt).toBeNull();
    expect(restarted.spentMinutes).toBe(0);
    expect(spentMs(restarted, T0 + 20 * MINUTE_MS)).toBe(0);
  });
});

describe("resumeSession", () => {
  test("keeps elapsed time across a quick reload", () => {
    // The child plays for thirty seconds; the heartbeat records that the app
    // was still in use right up to the reload.
    const session = touchSession(startSession(profileId, T0), T0 + 30_000);
    const now = T0 + 30_000;
    const resumed = resumeSession(session, now);
    expect(spentMs(resumed, now)).toBe(30_000);
    expect(resumed.lastSeenAt).toBe(now);
  });

  test("never hands out a fresh allowance, however long the app was left", () => {
    // The child plays for six minutes, closes the app, and opens it again
    // six minutes later. The budget must keep counting the play time and
    // must not reset just because the app was closed in between.
    let session = startSession(profileId, T0);
    let now = T0;

    for (let i = 0; i < 12; i += 1) {
      now += 6 * MINUTE_MS;
      session = bankSession(session, now); // the app is closed
      session = resumeSession(session, now); // the app is opened again
    }

    expect(spentMs(session, now)).toBeCloseTo(72 * MINUTE_MS, -3);
    expect(isSessionExpired(session, 30, now)).toBe(true);
  });

  test("keeps the budget across a reload", () => {
    const banked = bankSession(startSession(profileId, T0), T0 + 10 * MINUTE_MS);
    const resumed = resumeSession(banked, T0 + 10 * MINUTE_MS);

    expect(resumed.spentMinutes).toBeCloseTo(10, 5);
    expect(remainingMs(resumed, 30, T0 + 10 * MINUTE_MS)).toBe(
      20 * MINUTE_MS,
    );
  });

  test("time spent with the app closed is not charged", () => {
    // The child played for ten minutes, then left the app closed for a day.
    const banked = bankSession(startSession(profileId, T0), T0 + 10 * MINUTE_MS);
    const resumed = resumeSession(banked, T0 + 24 * 60 * MINUTE_MS);

    expect(resumed.spentMinutes).toBeCloseTo(10, 5);
    expect(remainingMs(resumed, 30, T0 + 24 * 60 * MINUTE_MS)).toBe(
      20 * MINUTE_MS,
    );
  });

  test("backfills the budget for sessions stored before it existed", () => {
    const legacy = {
      profileId,
      startedAt: T0,
      lastSeenAt: T0,
      lastBreakAt: null,
    } as unknown as Parameters<typeof resumeSession>[0];

    const resumed = resumeSession(legacy, T0 + MINUTE_MS);

    expect(resumed.spentMinutes).toBe(0);
  });

  test("touch keeps the start time and only moves lastSeenAt", () => {
    const session = startSession(profileId, T0);
    const touched = touchSession(session, T0 + 2 * MINUTE_MS);
    expect(touched.startedAt).toBe(T0);
    expect(touched.lastSeenAt).toBe(T0 + 2 * MINUTE_MS);
  });
});

describe("bankSession", () => {
  test("carries the used time over and ends the running stretch", () => {
    const banked = bankSession(startSession(profileId, T0), T0 + 5 * MINUTE_MS);

    expect(banked.spentMinutes).toBeCloseTo(5, 5);
    expect(banked.activeSince).toBeNull();
    expect(spentMs(banked, T0 + 5 * MINUTE_MS)).toBeCloseTo(
      5 * MINUTE_MS,
      -3,
    );
  });

  test("no screen time accrues while the app is in the background", () => {
    const banked = bankSession(startSession(profileId, T0), T0 + 5 * MINUTE_MS);

    // An hour later the app is still closed.
    expect(spentMs(banked, T0 + 65 * MINUTE_MS)).toBeCloseTo(
      5 * MINUTE_MS,
      -3,
    );
  });

  test("a session with no time used is left alone", () => {
    const banked = bankSession(startSession(profileId, T0), T0);
    expect(banked.spentMinutes).toBe(0);
    expect(banked.startedAt).toBe(T0);
  });

  test("a break taken long ago no longer applies", () => {
    const broke = markBreak(startSession(profileId, T0), T0 + MINUTE_MS);
    // The child came back two hours later.
    const banked = bankSession(broke, T0 + 2 * 60 * MINUTE_MS);

    expect(banked.lastBreakAt).toBeNull();
  });

  test("a recent break still applies", () => {
    const broke = markBreak(startSession(profileId, T0), T0 + MINUTE_MS);
    const banked = bankSession(broke, T0 + 2 * MINUTE_MS);

    expect(banked.lastBreakAt).toBe(T0 + MINUTE_MS);
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

  test("counts active screen time, not wall clock time", () => {
    // The child played for two minutes, then the app sat closed for an hour.
    const banked = bankSession(startSession(profileId, T0), T0 + 2 * MINUTE_MS);
    const later = T0 + 2 * MINUTE_MS + 60 * MINUTE_MS;

    expect(isBreakDue(banked, 5, later)).toBe(false);
    expect(isBreakDue(banked, 1, later)).toBe(true);
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
