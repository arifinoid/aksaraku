import type { ModuleItemId } from "../types";

export interface ItemAccuracy {
  readonly itemId: ModuleItemId;
  readonly accuracy: number;
  readonly attempts: number;
}

export const itemAccuracies = (
  results: readonly { readonly itemId: ModuleItemId; readonly correct: boolean }[],
): readonly ItemAccuracy[] => {
  const tally = new Map<ModuleItemId, { correct: number; attempts: number }>();

  for (const result of results) {
    const entry = tally.get(result.itemId) ?? { correct: 0, attempts: 0 };
    entry.attempts += 1;
    if (result.correct) entry.correct += 1;
    tally.set(result.itemId, entry);
  }

  return [...tally.entries()].map(([itemId, entry]) => ({
    itemId,
    accuracy: entry.attempts === 0 ? 0 : entry.correct / entry.attempts,
    attempts: entry.attempts,
  }));
};
