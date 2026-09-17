import { masteryLevel } from "./progress";
import { starsForAccuracy } from "./tracing/score";
import type {
  Locale,
  MasteryScore,
  ModuleKind,
  RewardId,
  RewardKind,
} from "./types";

export type RewardRequirement =
  | { readonly _tag: "ItemsAttempted"; readonly count: number }
  | { readonly _tag: "ItemsMastered"; readonly count: number }
  | { readonly _tag: "StarsEarned"; readonly count: number }
  | { readonly _tag: "TotalAttempts"; readonly count: number }
  | {
      readonly _tag: "KindMastered";
      readonly kind: ModuleKind;
      readonly count: number;
    };

export interface RewardDefinition {
  readonly id: RewardId;
  readonly kind: RewardKind;
  readonly emoji: string;
  readonly names: Readonly<Record<Locale, string>>;
  readonly requirement: RewardRequirement;
}

export interface ProgressStats {
  readonly itemsAttempted: number;
  readonly itemsMastered: number;
  readonly starsEarned: number;
  readonly totalAttempts: number;
  readonly masteredByKind: Readonly<Record<ModuleKind, number>>;
}

export const emptyStats: ProgressStats = {
  itemsAttempted: 0,
  itemsMastered: 0,
  starsEarned: 0,
  totalAttempts: 0,
  masteredByKind: {
    "letter-upper": 0,
    "letter-lower": 0,
    digit: 0,
    shape: 0,
  },
};

export interface StatsInput {
  readonly mastery: readonly MasteryScore[];
  readonly kindByItemId: ReadonlyMap<string, ModuleKind>;
}

export const statsFromMastery = ({
  mastery,
  kindByItemId,
}: StatsInput): ProgressStats => {
  const masteredByKind: Record<ModuleKind, number> = {
    "letter-upper": 0,
    "letter-lower": 0,
    digit: 0,
    shape: 0,
  };

  let itemsAttempted = 0;
  let itemsMastered = 0;
  let starsEarned = 0;
  let totalAttempts = 0;

  for (const entry of mastery) {
    totalAttempts += entry.attempts;
    if (entry.attempts > 0) itemsAttempted += 1;
    starsEarned += starsForAccuracy(entry.score);

    if (masteryLevel(entry.score, entry.attempts) === "mastered") {
      itemsMastered += 1;
      const kind = kindByItemId.get(entry.itemId);
      if (kind) masteredByKind[kind] += 1;
    }
  }

  return {
    itemsAttempted,
    itemsMastered,
    starsEarned,
    totalAttempts,
    masteredByKind,
  };
};

export const requirementProgress = (
  requirement: RewardRequirement,
  stats: ProgressStats,
): { readonly current: number; readonly target: number } => {
  switch (requirement._tag) {
    case "ItemsAttempted":
      return { current: stats.itemsAttempted, target: requirement.count };
    case "ItemsMastered":
      return { current: stats.itemsMastered, target: requirement.count };
    case "StarsEarned":
      return { current: stats.starsEarned, target: requirement.count };
    case "TotalAttempts":
      return { current: stats.totalAttempts, target: requirement.count };
    case "KindMastered":
      return {
        current: stats.masteredByKind[requirement.kind],
        target: requirement.count,
      };
  }
};

export const meetsRequirement = (
  requirement: RewardRequirement,
  stats: ProgressStats,
): boolean => {
  const { current, target } = requirementProgress(requirement, stats);
  return current >= target;
};

export const newlyUnlocked = (
  definitions: readonly RewardDefinition[],
  alreadyUnlocked: readonly RewardId[],
  stats: ProgressStats,
): readonly RewardDefinition[] => {
  const owned = new Set<RewardId>(alreadyUnlocked);
  return definitions.filter(
    (definition) =>
      !owned.has(definition.id) &&
      meetsRequirement(definition.requirement, stats),
  );
};

export const rewardName = (
  definition: RewardDefinition,
  locale: Locale,
): string => definition.names[locale] ?? definition.names.en;

export const requirementLabelKey = (requirement: RewardRequirement): string => {
  switch (requirement._tag) {
    case "ItemsAttempted":
      return "rewards.requirement.itemsAttempted";
    case "ItemsMastered":
      return "rewards.requirement.itemsMastered";
    case "StarsEarned":
      return "rewards.requirement.starsEarned";
    case "TotalAttempts":
      return "rewards.requirement.totalAttempts";
    case "KindMastered":
      return "rewards.requirement.kindMastered";
  }
};
