import type { MasteryScore, ModuleItemId, ProfileId } from "./types";

export const MASTERY_EMA = 0.3;

export const updateMastery = (
  previous: MasteryScore | undefined,
  profileId: ProfileId,
  itemId: ModuleItemId,
  accuracy: number,
  now: number,
): MasteryScore => ({
  profileId,
  itemId,
  score: previous
    ? previous.score * (1 - MASTERY_EMA) + accuracy * MASTERY_EMA
    : accuracy,
  attempts: (previous?.attempts ?? 0) + 1,
  lastSeenAt: now,
});

export type MasteryLevel = "new" | "learning" | "familiar" | "mastered";

export const masteryLevel = (
  score: number | undefined,
  attempts: number,
): MasteryLevel => {
  if (score === undefined || attempts === 0) return "new";
  if (score >= 0.9) return "mastered";
  if (score >= 0.75) return "familiar";
  return "learning";
};
