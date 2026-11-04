import { describe, expect, test } from "bun:test";
import { currentStreak, dayKey } from "./streak";

const DAY = 24 * 60 * 60 * 1000;
// A fixed "now" so the test never depends on the clock or the timezone.
const NOW = new Date(2026, 10, 4, 10, 0, 0).getTime();
const daysAgo = (count: number): number => NOW - count * DAY;

describe("currentStreak", () => {
  test("is zero without any activity", () => {
    expect(currentStreak([], NOW)).toBe(0);
  });

  test("counts today", () => {
    expect(currentStreak([NOW], NOW)).toBe(1);
  });

  test("counts consecutive days ending today", () => {
    expect(currentStreak([daysAgo(0), daysAgo(1), daysAgo(2)], NOW)).toBe(3);
  });

  test("keeps yesterday's run alive until the day ends", () => {
    expect(currentStreak([daysAgo(1), daysAgo(2)], NOW)).toBe(2);
  });

  test("resets after a skipped day", () => {
    expect(currentStreak([daysAgo(2), daysAgo(3)], NOW)).toBe(0);
  });

  test("stops at the first gap", () => {
    expect(currentStreak([daysAgo(0), daysAgo(1), daysAgo(3)], NOW)).toBe(2);
  });

  test("counts a day once no matter how many attempts", () => {
    expect(currentStreak([NOW, NOW - 1000, NOW - 2000], NOW)).toBe(1);
  });

  test("compares local calendar days, not 24h windows", () => {
    const lateYesterday = new Date(2026, 10, 3, 23, 50, 0).getTime();
    const earlyToday = new Date(2026, 10, 4, 0, 10, 0).getTime();
    expect(dayKey(lateYesterday)).not.toBe(dayKey(earlyToday));
    expect(currentStreak([lateYesterday, earlyToday], NOW)).toBe(2);
  });
});
