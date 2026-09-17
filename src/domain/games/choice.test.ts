import { describe, expect, test } from "bun:test";
import type { ModuleItemId } from "../types";
import {
  accuracy,
  answer,
  correctCount,
  createChoiceSession,
  currentRound,
  isComplete,
  needsHint,
  type MatchCandidate,
} from "./choice";
import { caseMatchCandidates, objectMatchCandidates } from "./candidates";
import { GLYPH_ITEMS } from "../../data/glyphs";

const candidate = (
  id: string,
  prompt: string,
  option: string,
): MatchCandidate => ({ itemId: id as ModuleItemId, prompt, option });

const id = (value: string): ModuleItemId => value as ModuleItemId;

const CANDIDATES: readonly MatchCandidate[] = [
  candidate("a", "A", "a"),
  candidate("b", "B", "b"),
  candidate("c", "C", "c"),
  candidate("d", "D", "d"),
  candidate("e", "E", "e"),
];

const random = () => 0.5;

describe("createChoiceSession", () => {
  test("builds the requested amount of rounds", () => {
    const session = createChoiceSession(CANDIDATES, 3, 4, random);
    expect(session.rounds).toHaveLength(3);
    expect(session.index).toBe(0);
    expect(session.attempts).toHaveLength(0);
  });

  test("gives every round unique options including the answer", () => {
    const session = createChoiceSession(CANDIDATES, 4, 3, random);
    for (const round of session.rounds) {
      expect(round.options).toHaveLength(3);
      const ids = round.options.map((option) => option.id);
      expect(new Set(ids).size).toBe(3);
      expect(ids).toContain(round.correctOptionId);
    }
  });

  test("renders the correct option label from the candidate", () => {
    const session = createChoiceSession(CANDIDATES, 5, 5, random);
    for (const round of session.rounds) {
      const correct = round.options.find(
        (option) => option.id === round.correctOptionId,
      );
      const source = CANDIDATES.find(
        (entry) => entry.itemId === round.correctOptionId,
      );
      expect(correct?.label).toBe(source?.option);
    }
  });

  test("clamps options when the pool is small", () => {
    const session = createChoiceSession(CANDIDATES.slice(0, 2), 2, 6, random);
    for (const round of session.rounds) {
      expect(round.options).toHaveLength(2);
    }
  });
});

describe("answer", () => {
  test("records a correct answer and advances", () => {
    const session = createChoiceSession(CANDIDATES, 2, 3, random);
    const round = currentRound(session)!;
    const next = answer(session, round.correctOptionId);

    expect(next.index).toBe(1);
    expect(next.attempts[0]?.correct).toBe(true);
    expect(next.wrongStreak).toBe(0);
    expect(correctCount(next)).toBe(1);
    expect(accuracy(next)).toBe(1);
  });

  test("keeps the round open after a wrong answer", () => {
    const session = createChoiceSession(CANDIDATES, 2, 3, random);
    const round = currentRound(session)!;
    const wrongOption = round.options.find(
      (option) => option.id !== round.correctOptionId,
    )!;
    const next = answer(session, wrongOption.id);

    expect(next.index).toBe(0);
    expect(next.attempts[0]?.correct).toBe(false);
    expect(next.wrongStreak).toBe(1);
    expect(accuracy(next)).toBe(0);
  });

  test("offers a hint after three wrong tries", () => {
    let session = createChoiceSession(CANDIDATES, 1, 3, random);
    const round = currentRound(session)!;
    const wrongOption = round.options.find(
      (option) => option.id !== round.correctOptionId,
    )!;
    for (let i = 0; i < 3; i += 1) {
      expect(needsHint(session)).toBe(false);
      session = answer(session, wrongOption.id);
    }
    expect(needsHint(session)).toBe(true);
  });

  test("resets the wrong streak after a correct answer", () => {
    let session = createChoiceSession(CANDIDATES, 2, 3, random);
    const wrongOption = currentRound(session)!.options.find(
      (option) => option.id !== currentRound(session)!.correctOptionId,
    )!;
    session = answer(session, wrongOption.id);
    session = answer(session, currentRound(session)!.correctOptionId);
    expect(session.wrongStreak).toBe(0);
    expect(session.index).toBe(1);
  });

  test("ignores answers once the session is complete", () => {
    let session = createChoiceSession(CANDIDATES, 1, 3, random);
    session = answer(session, currentRound(session)!.correctOptionId);
    expect(isComplete(session)).toBe(true);
    expect(answer(session, "a")).toBe(session);
  });
});

describe("candidate builders", () => {
  test("pairs every uppercase letter with its lowercase partner", () => {
    const candidates = caseMatchCandidates(GLYPH_ITEMS);
    expect(candidates).toHaveLength(26);
    expect(candidates[0]?.itemId).toBe(id("upper-a"));
    expect(candidates[0]?.prompt).toBe("A");
    expect(candidates[0]?.option).toBe("a");
  });

  test("builds object candidates only for letters with an emoji", () => {
    const emojiByItemId = new Map([["upper-a", "🍎"]]);
    const candidates = objectMatchCandidates(GLYPH_ITEMS, emojiByItemId);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.itemId).toBe(id("upper-a"));
    expect(candidates[0]?.prompt).toBe("🍎");
    expect(candidates[0]?.option).toBe("A");
  });
});
