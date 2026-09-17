import { answer, currentRound, type ChoiceSession } from "./choice";

export interface PendingChoice {
  readonly displayed: ChoiceSession;
  readonly committed: ChoiceSession;
  readonly optionId: string;
  readonly correct: boolean;
}

export const beginChoice = (
  session: ChoiceSession,
  optionId: string,
): PendingChoice | undefined => {
  const round = currentRound(session);
  if (!round) return undefined;

  return {
    displayed: session,
    committed: answer(session, optionId),
    optionId,
    correct: optionId === round.correctOptionId,
  };
};
