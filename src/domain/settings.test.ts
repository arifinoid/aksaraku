import { describe, expect, test } from "bun:test";
import {
  BREAK_REMINDER_OPTIONS,
  defaultScreenTime,
  MAX_SESSION_LIMIT_MIN,
  MIN_SESSION_LIMIT_MIN,
  SESSION_LIMIT_OPTIONS,
  settingsErrorMessageKey,
  updateBreakReminder,
  updateSessionLimit,
  validateSessionLimit,
} from "./settings";
import type { ProfileId, ScreenTimeSetting } from "./types";

const profileId = "p1" as ProfileId;
const base: ScreenTimeSetting = {
  profileId,
  sessionLimitMin: 15,
  breakReminderMin: 5,
};

describe("defaultScreenTime", () => {
  test("starts at the documented defaults", () => {
    expect(defaultScreenTime(profileId)).toEqual({
      profileId,
      sessionLimitMin: 15,
      breakReminderMin: 5,
    });
  });
});

describe("validateSessionLimit", () => {
  test("accepts the allowed range", () => {
    expect(validateSessionLimit(MIN_SESSION_LIMIT_MIN)._tag).toBe("Right");
    expect(validateSessionLimit(MAX_SESSION_LIMIT_MIN)._tag).toBe("Right");
    expect(validateSessionLimit(20)).toEqual({ _tag: "Right", right: 20 });
  });

  test("rejects out of range and non finite values", () => {
    expect(validateSessionLimit(4)._tag).toBe("Left");
    expect(validateSessionLimit(61)._tag).toBe("Left");
    expect(validateSessionLimit(Number.NaN)._tag).toBe("Left");
  });

  test("rounds fractional minutes", () => {
    expect(validateSessionLimit(12.6)).toEqual({ _tag: "Right", right: 13 });
  });

  test("every preset is valid", () => {
    for (const minutes of SESSION_LIMIT_OPTIONS) {
      expect(validateSessionLimit(minutes)._tag).toBe("Right");
    }
  });
});

describe("updateSessionLimit", () => {
  test("keeps the break reminder untouched", () => {
    const result = updateSessionLimit(base, 30);
    expect(result).toEqual({
      _tag: "Right",
      right: { ...base, sessionLimitMin: 30 },
    });
  });

  test("propagates the error for bad input", () => {
    const result = updateSessionLimit(base, 2);
    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      expect(settingsErrorMessageKey(result.left)).toBe(
        "settings.errors.invalidSessionLimit",
      );
    }
  });
});

describe("updateBreakReminder", () => {
  test("accepts zero as off", () => {
    expect(updateBreakReminder(base, 0)).toEqual({
      _tag: "Right",
      right: { ...base, breakReminderMin: 0 },
    });
  });

  test("keeps the session limit untouched", () => {
    const result = updateBreakReminder(base, 10);
    expect(result._tag).toBe("Right");
    if (result._tag === "Right") {
      expect(result.right.sessionLimitMin).toBe(15);
      expect(result.right.breakReminderMin).toBe(10);
    }
  });

  test("rejects negatives and values above the cap", () => {
    expect(updateBreakReminder(base, -1)._tag).toBe("Left");
    expect(updateBreakReminder(base, 61)._tag).toBe("Left");
  });

  test("every preset is valid", () => {
    for (const minutes of BREAK_REMINDER_OPTIONS) {
      expect(updateBreakReminder(base, minutes)._tag).toBe("Right");
    }
  });
});
