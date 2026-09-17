import type { ModuleItemId } from "../types";
import { sample, shuffle } from "./random";

export const HINT_AFTER_WRONG = 3;

export interface MatchCandidate {
  readonly itemId: ModuleItemId;
  readonly prompt: string;
  readonly option: string;
}

export interface ChoiceOption {
  readonly id: string;
  readonly itemId: ModuleItemId;
  readonly label: string;
}

export interface ChoiceRound {
  readonly promptItemId: ModuleItemId;
  readonly promptLabel: string;
  readonly options: readonly ChoiceOption[];
  readonly correctOptionId: string;
}

export interface ChoiceAttempt {
  readonly itemId: ModuleItemId;
  readonly correct: boolean;
}

export interface ChoiceSession {
  readonly rounds: readonly ChoiceRound[];
  readonly index: number;
  readonly attempts: readonly ChoiceAttempt[];
  readonly wrongStreak: number;
}

export const createChoiceSession = (
  candidates: readonly MatchCandidate[],
  roundCount: number,
  optionCount: number,
  random: () => number,
): ChoiceSession => {
  const targets = sample(candidates, roundCount, random);
  const rounds = targets.map((target): ChoiceRound => {
    const pool = candidates.filter(
      (candidate) => candidate.itemId !== target.itemId,
    );
    const distractors = sample(pool, Math.max(0, optionCount - 1), random);
    const options = shuffle([target, ...distractors], random).map(
      (candidate): ChoiceOption => ({
        id: candidate.itemId,
        itemId: candidate.itemId,
        label: candidate.option,
      }),
    );
    return {
      promptItemId: target.itemId,
      promptLabel: target.prompt,
      options,
      correctOptionId: target.itemId,
    };
  });

  return { rounds, index: 0, attempts: [], wrongStreak: 0 };
};

export const currentRound = (
  session: ChoiceSession,
): ChoiceRound | undefined => session.rounds[session.index];

export const isComplete = (session: ChoiceSession): boolean =>
  session.index >= session.rounds.length;

export const needsHint = (session: ChoiceSession): boolean =>
  session.wrongStreak >= HINT_AFTER_WRONG;

export const answer = (
  session: ChoiceSession,
  optionId: string,
): ChoiceSession => {
  const round = currentRound(session);
  if (!round) return session;

  const correct = optionId === round.correctOptionId;
  const attempts = [
    ...session.attempts,
    { itemId: round.promptItemId, correct },
  ];

  if (!correct) {
    return { ...session, attempts, wrongStreak: session.wrongStreak + 1 };
  }

  return {
    ...session,
    attempts,
    index: session.index + 1,
    wrongStreak: 0,
  };
};

export const correctCount = (session: ChoiceSession): number =>
  session.attempts.filter((attempt) => attempt.correct).length;

export const accuracy = (session: ChoiceSession): number =>
  session.attempts.length === 0
    ? 0
    : correctCount(session) / session.attempts.length;
