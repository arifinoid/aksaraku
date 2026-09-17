import { describe, expect, test } from "bun:test";
import type { ModuleItemId } from "../types";
import {
  createChoiceSession,
  currentRound,
  type MatchCandidate,
} from "./choice";
import { beginChoice } from "./answering";

const candidate = (
  id: string,
  prompt: string,
  option: string,
): MatchCandidate => ({ itemId: id as ModuleItemId, prompt, option });

const CANDIDATES: readonly MatchCandidate[] = [
  candidate("a", "A", "a"),
  candidate("b", "B", "b"),
  candidate("c", "C", "c"),
];

const random = () => 0.5;

const session = () => createChoiceSession(CANDIDATES, 2, 3, random);

describe("beginChoice", () => {
  test("keeps the answered round on display while feedback plays", () => {
    const current = session();
    const round = currentRound(current)!;
    const pending = beginChoice(current, round.correctOptionId)!;

    expect(pending.displayed).toBe(current);
    expect(pending.displayed.index).toBe(0);
    expect(currentRound(pending.displayed)?.correctOptionId).toBe(
      round.correctOptionId,
    );
  });

  test("commits the round advance only through the committed session", () => {
    const current = session();
    const round = currentRound(current)!;
    const pending = beginChoice(current, round.correctOptionId)!;

    expect(pending.correct).toBe(true);
    expect(pending.optionId).toBe(round.correctOptionId);
    expect(pending.committed.index).toBe(1);
    expect(pending.committed.attempts).toHaveLength(1);
  });

  test("does not advance the committed session on a wrong answer", () => {
    const current = session();
    const round = currentRound(current)!;
    const wrongOption = round.options.find(
      (option) => option.id !== round.correctOptionId,
    )!;
    const pending = beginChoice(current, wrongOption.id)!;

    expect(pending.correct).toBe(false);
    expect(pending.committed.index).toBe(0);
    expect(pending.committed.wrongStreak).toBe(1);
    expect(currentRound(pending.committed)?.correctOptionId).toBe(
      round.correctOptionId,
    );
  });

  test("returns undefined when there is no active round", () => {
    const finished = { ...session(), index: 99 };
    expect(beginChoice(finished, "a")).toBeUndefined();
  });
});
