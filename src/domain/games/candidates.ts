import type { ModuleItem, ModuleItemId } from "../types";
import type { MatchCandidate } from "./choice";

export const findItem = (
  items: readonly ModuleItem[],
  itemId: ModuleItemId,
): ModuleItem | undefined => items.find((item) => item.id === itemId);

export const caseMatchCandidates = (
  items: readonly ModuleItem[],
): readonly MatchCandidate[] => {
  const lower = new Map<string, ModuleItem>();
  for (const item of items) {
    if (item.kind === "letter-lower") lower.set(item.glyph, item);
  }

  const candidates: MatchCandidate[] = [];
  for (const item of items) {
    if (item.kind !== "letter-upper") continue;
    const partner = lower.get(item.glyph.toLowerCase());
    if (!partner) continue;
    candidates.push({
      itemId: item.id,
      prompt: item.glyph,
      option: partner.glyph,
    });
  }
  return candidates;
};

export const objectMatchCandidates = (
  items: readonly ModuleItem[],
  emojiByItemId: ReadonlyMap<string, string>,
): readonly MatchCandidate[] =>
  items
    .filter((item) => item.kind === "letter-upper")
    .flatMap((item): readonly MatchCandidate[] => {
      const emoji = emojiByItemId.get(item.id);
      return emoji ? [{ itemId: item.id, prompt: emoji, option: item.glyph }] : [];
    });

export const balloonCandidates = (
  items: readonly ModuleItem[],
): readonly MatchCandidate[] =>
  items
    .filter((item) => item.kind === "letter-upper" || item.kind === "digit")
    .map((item): MatchCandidate => ({
      itemId: item.id,
      prompt: item.glyph,
      option: item.glyph,
    }));
