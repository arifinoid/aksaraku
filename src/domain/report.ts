import { masteryLevel, type MasteryLevel } from "./progress";
import { starsForAccuracy, type StarCount } from "./tracing/score";
import type {
  MasteryScore,
  ModuleItemId,
  ModuleKind,
  TraceAttempt,
} from "./types";

export interface ItemReport {
  readonly itemId: ModuleItemId;
  readonly kind: ModuleKind | undefined;
  readonly score: number;
  readonly attempts: number;
  readonly level: MasteryLevel;
  readonly stars: StarCount;
  readonly lastSeenAt: number;
}

export interface KindReport {
  readonly kind: ModuleKind;
  readonly attempted: number;
  readonly mastered: number;
  readonly total: number;
}

export interface ProgressReport {
  readonly totalItems: number;
  readonly attempted: number;
  readonly mastered: number;
  readonly stars: number;
  readonly totalAttempts: number;
  readonly byKind: readonly KindReport[];
  readonly levelCounts: Readonly<Record<MasteryLevel, number>>;
  readonly weakest: readonly ItemReport[];
  readonly masteredItems: readonly ItemReport[];
  readonly lastPlayedAt: number | null;
  readonly traceAttempts: number;
  readonly averageAccuracy: number | null;
  readonly averageDurationMs: number | null;
}

export const REPORT_WEAK_LIMIT = 8;

export interface ReportInput {
  readonly mastery: readonly MasteryScore[];
  readonly attempts: readonly TraceAttempt[];
  readonly kindByItemId: ReadonlyMap<string, ModuleKind>;
  readonly totalByKind: Readonly<Record<ModuleKind, number>>;
}

const toItemReport = (
  entry: MasteryScore,
  kind: ModuleKind | undefined,
): ItemReport => ({
  itemId: entry.itemId,
  kind,
  score: entry.score,
  attempts: entry.attempts,
  level: masteryLevel(entry.score, entry.attempts),
  stars: starsForAccuracy(entry.score),
  lastSeenAt: entry.lastSeenAt,
});

const mean = (values: readonly number[]): number | null =>
  values.length === 0
    ? null
    : values.reduce((total, value) => total + value, 0) / values.length;

export const buildReport = ({
  mastery,
  attempts,
  kindByItemId,
  totalByKind,
}: ReportInput): ProgressReport => {
  const seen = mastery
    .filter((entry) => entry.attempts > 0)
    .map((entry) => toItemReport(entry, kindByItemId.get(entry.itemId)));

  const byKind = (Object.keys(totalByKind) as ModuleKind[]).map(
    (kind): KindReport => ({
      kind,
      total: totalByKind[kind],
      attempted: seen.filter((item) => item.kind === kind).length,
      mastered: seen.filter(
        (item) => item.kind === kind && item.level === "mastered",
      ).length,
    }),
  );

  const weakest = seen
    .filter((item) => item.level !== "mastered")
    .sort((a, b) => a.score - b.score || b.attempts - a.attempts)
    .slice(0, REPORT_WEAK_LIMIT);

  const masteredItems = seen
    .filter((item) => item.level === "mastered")
    .sort((a, b) => b.lastSeenAt - a.lastSeenAt);

  const lastPlayedAt =
    seen.length === 0
      ? null
      : seen.reduce((latest, item) => Math.max(latest, item.lastSeenAt), 0);

  const totalItems = Object.values(totalByKind).reduce(
    (total, value) => total + value,
    0,
  );

  const levelCounts: Record<MasteryLevel, number> = {
    new: Math.max(0, totalItems - seen.length),
    learning: 0,
    familiar: 0,
    mastered: masteredItems.length,
  };
  for (const item of seen) {
    if (item.level === "learning" || item.level === "familiar") {
      levelCounts[item.level] += 1;
    }
  }

  return {
    totalItems,
    attempted: seen.length,
    mastered: masteredItems.length,
    stars: seen.reduce((total, item) => total + item.stars, 0),
    totalAttempts: mastery.reduce((total, entry) => total + entry.attempts, 0),
    byKind,
    levelCounts,
    weakest,
    masteredItems,
    lastPlayedAt,
    traceAttempts: attempts.length,
    averageAccuracy: mean(attempts.map((attempt) => attempt.accuracy)),
    averageDurationMs: mean(attempts.map((attempt) => attempt.durationMs)),
  };
};
