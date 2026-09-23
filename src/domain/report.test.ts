import { describe, expect, test } from "bun:test";
import { buildReport, REPORT_WEAK_LIMIT, type ReportInput } from "./report";
import type { MasteryScore, ModuleItemId, ModuleKind, TraceAttempt } from "./types";

const kindByItemId = new Map<string, ModuleKind>([
  ["u-A", "letter-upper"],
  ["u-B", "letter-upper"],
  ["u-C", "letter-upper"],
  ["d-1", "digit"],
]);

const totalByKind: Record<ModuleKind, number> = {
  "letter-upper": 3,
  "letter-lower": 0,
  digit: 1,
  shape: 0,
};

const mastery = (
  itemId: string,
  score: number,
  attempts: number,
  lastSeenAt = 1,
): MasteryScore => ({
  profileId: "p1" as MasteryScore["profileId"],
  itemId: itemId as ModuleItemId,
  score,
  attempts,
  lastSeenAt,
});

const trace = (accuracy: number, durationMs: number): TraceAttempt => ({
  id: `a-${accuracy}-${durationMs}`,
  profileId: "p1" as TraceAttempt["profileId"],
  itemId: "u-A" as ModuleItemId,
  accuracy,
  deviationAvg: 0,
  durationMs,
  completedAt: 10,
});

const input = (overrides: Partial<ReportInput> = {}): ReportInput => ({
  mastery: [],
  attempts: [],
  kindByItemId,
  totalByKind,
  ...overrides,
});

describe("buildReport", () => {
  test("empty history reports nothing played", () => {
    const report = buildReport(input());
    expect(report.attempted).toBe(0);
    expect(report.mastered).toBe(0);
    expect(report.stars).toBe(0);
    expect(report.totalItems).toBe(4);
    expect(report.lastPlayedAt).toBeNull();
    expect(report.averageAccuracy).toBeNull();
    expect(report.levelCounts).toEqual({
      new: 4,
      learning: 0,
      familiar: 0,
      mastered: 0,
    });
  });

  test("ignores mastery rows with zero attempts", () => {
    const report = buildReport(input({ mastery: [mastery("u-A", 0.4, 0)] }));
    expect(report.attempted).toBe(0);
    expect(report.levelCounts.new).toBe(4);
  });

  test("counts mastered, stars and totals", () => {
    const report = buildReport(
      input({
        mastery: [
          mastery("u-A", 0.98, 3),
          mastery("u-B", 0.9, 2),
          mastery("d-1", 0.7, 1),
        ],
      }),
    );
    expect(report.attempted).toBe(3);
    expect(report.mastered).toBe(2);
    expect(report.totalAttempts).toBe(6);
    expect(report.stars).toBe(3 + 2 + 1);
    expect(report.levelCounts).toEqual({
      new: 1,
      learning: 1,
      familiar: 0,
      mastered: 2,
    });
  });

  test("breaks mastery down per category", () => {
    const report = buildReport(
      input({
        mastery: [mastery("u-A", 0.98, 1), mastery("u-B", 0.3, 1)],
      }),
    );
    const upper = report.byKind.find((row) => row.kind === "letter-upper");
    expect(upper).toEqual({
      kind: "letter-upper",
      total: 3,
      attempted: 2,
      mastered: 1,
    });
  });

  test("weakest lists unmastered items worst first", () => {
    const report = buildReport(
      input({
        mastery: [
          mastery("u-A", 0.98, 1),
          mastery("u-B", 0.55, 4),
          mastery("u-C", 0.2, 1),
          mastery("d-1", 0.8, 2),
        ],
      }),
    );
    expect(report.weakest.map((item) => String(item.itemId))).toEqual([
      "u-C",
      "u-B",
      "d-1",
    ]);
    expect(report.masteredItems.map((item) => String(item.itemId))).toEqual([
      "u-A",
    ]);
  });

  test("caps the weakest list", () => {
    const many = Array.from({ length: REPORT_WEAK_LIMIT + 4 }, (_, index) =>
      mastery(`u-${index}`, 0.1 + index / 100, 1),
    );
    const report = buildReport(input({ mastery: many }));
    expect(report.weakest).toHaveLength(REPORT_WEAK_LIMIT);
  });

  test("summarises tracing attempts", () => {
    const report = buildReport(
      input({ attempts: [trace(1, 1000), trace(0.5, 3000)] }),
    );
    expect(report.traceAttempts).toBe(2);
    expect(report.averageAccuracy).toBe(0.75);
    expect(report.averageDurationMs).toBe(2000);
  });

  test("lastPlayedAt uses the newest mastery timestamp", () => {
    const report = buildReport(
      input({
        mastery: [mastery("u-A", 0.9, 1, 50), mastery("u-B", 0.9, 1, 90)],
      }),
    );
    expect(report.lastPlayedAt).toBe(90);
  });
});
