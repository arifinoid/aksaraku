export interface GateChallenge {
  readonly a: number;
  readonly b: number;
  readonly answer: number;
}

export const createGateChallenge = (
  random: () => number,
): GateChallenge => {
  const a = 2 + Math.floor(random() * 8);
  const b = 1 + Math.floor(random() * 8);
  return { a, b, answer: a + b };
};

export const isGateAnswerCorrect = (
  challenge: GateChallenge,
  value: string,
): boolean => {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) && parsed === challenge.answer;
};
