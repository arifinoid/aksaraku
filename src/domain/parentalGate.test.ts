import { describe, expect, test } from "bun:test";
import {
  createGateChallenge,
  isGateAnswerCorrect,
} from "./parentalGate";

describe("createGateChallenge", () => {
  test("keeps operands in toddler-safe range", () => {
    const low = createGateChallenge(() => 0);
    expect(low.a).toBe(2);
    expect(low.b).toBe(1);
    expect(low.answer).toBe(3);

    const high = createGateChallenge(() => 0.999);
    expect(high.a).toBe(9);
    expect(high.b).toBe(8);
    expect(high.answer).toBe(17);
  });
});

describe("isGateAnswerCorrect", () => {
  const challenge = createGateChallenge(() => 0.5);

  test("accepts the correct answer", () => {
    expect(isGateAnswerCorrect(challenge, String(challenge.answer))).toBe(true);
  });

  test("tolerates surrounding whitespace", () => {
    expect(isGateAnswerCorrect(challenge, `  ${challenge.answer}  `)).toBe(true);
  });

  test("rejects wrong or malformed answers", () => {
    expect(isGateAnswerCorrect(challenge, String(challenge.answer + 1))).toBe(false);
    expect(isGateAnswerCorrect(challenge, "abc")).toBe(false);
    expect(isGateAnswerCorrect(challenge, "")).toBe(false);
  });
});
