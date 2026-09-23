import { useCallback, useEffect, useRef, useState } from "react";
import {
  accuracy,
  beginChoice,
  correctCount,
  createChoiceSession,
  currentRound,
  isComplete,
  itemAccuracies,
  needsHint,
  type ChoiceSession,
  type MatchCandidate,
  type ProfileId,
} from "../../domain";
import { runTask } from "../../platform/task";
import { HAPTIC, vibrate } from "../../platform/haptics";
import { recordAttempt } from "../../storage";

export const ADVANCE_DELAY_MS = 900;
export const FEEDBACK_MS = 700;

export type ChoiceFeedback = "none" | "correct" | "wrong";

export interface UseChoiceGameOptions {
  readonly candidates: readonly MatchCandidate[];
  readonly roundCount: number;
  readonly optionCount: number;
  readonly profileId: ProfileId;
  readonly resetKey?: string | number;
  readonly hapticsEnabled?: boolean;
  readonly onProgress?: () => void | Promise<void>;
}

export interface ChoiceGame {
  readonly session: ChoiceSession;
  readonly round: ReturnType<typeof currentRound>;
  readonly feedback: ChoiceFeedback;
  readonly answeredOptionId: string | null;
  readonly finished: boolean;
  readonly hint: boolean;
  readonly correct: number;
  readonly total: number;
  readonly accuracy: number;
  readonly choose: (optionId: string) => void;
  readonly restart: () => void;
}

export function useChoiceGame({
  candidates,
  roundCount,
  optionCount,
  profileId,
  resetKey,
  hapticsEnabled = false,
  onProgress,
}: UseChoiceGameOptions): ChoiceGame {
  const [session, setSession] = useState<ChoiceSession>(() =>
    createChoiceSession(candidates, roundCount, optionCount, Math.random),
  );
  const [feedback, setFeedback] = useState<ChoiceFeedback>("none");
  const [answeredOptionId, setAnsweredOptionId] = useState<string | null>(null);

  const sessionRef = useRef(session);
  const savedRef = useRef(false);
  const lockedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const resetRef = useRef(resetKey);
  const hapticsRef = useRef(hapticsEnabled);

  useEffect(() => {
    hapticsRef.current = hapticsEnabled;
  }, [hapticsEnabled]);

  const round = currentRound(session);
  const finished = isComplete(session);

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const startSession = useCallback(() => {
    const next = createChoiceSession(
      candidates,
      roundCount,
      optionCount,
      Math.random,
    );
    clearTimer();
    lockedRef.current = false;
    savedRef.current = false;
    sessionRef.current = next;
    setSession(next);
    setFeedback("none");
    setAnsweredOptionId(null);
  }, [candidates, clearTimer, optionCount, roundCount]);

  useEffect(() => {
    if (resetRef.current === resetKey) return;
    resetRef.current = resetKey;
    startSession();
  }, [resetKey, startSession]);

  useEffect(() => clearTimer, [clearTimer]);

  useEffect(() => {
    if (!finished || savedRef.current || session.attempts.length === 0) return;
    savedRef.current = true;
    const now = Date.now();
    const entries = itemAccuracies(session.attempts);
    void (async () => {
      for (const entry of entries) {
        await runTask(recordAttempt(profileId, entry.itemId, entry.accuracy, now));
      }
      await onProgress?.();
    })();
  }, [finished, onProgress, profileId, session.attempts]);

  const choose = useCallback((optionId: string) => {
    if (lockedRef.current) return;
    const pending = beginChoice(sessionRef.current, optionId);
    if (!pending) return;

    sessionRef.current = pending.committed;
    lockedRef.current = true;
    setFeedback(pending.correct ? "correct" : "wrong");
    setAnsweredOptionId(pending.optionId);
    vibrate(
      pending.correct ? HAPTIC.tap : HAPTIC.offTrack,
      hapticsRef.current,
    );

    if (pending.correct) {
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setSession(pending.committed);
        setFeedback("none");
        setAnsweredOptionId(null);
        lockedRef.current = false;
      }, ADVANCE_DELAY_MS);
      return;
    }

    setSession(pending.committed);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setFeedback("none");
      setAnsweredOptionId(null);
      lockedRef.current = false;
    }, FEEDBACK_MS);
  }, []);

  return {
    session,
    round,
    feedback,
    answeredOptionId,
    finished,
    hint: needsHint(session),
    correct: correctCount(session),
    total: session.rounds.length,
    accuracy: accuracy(session),
    choose,
    restart: startSession,
  };
}
