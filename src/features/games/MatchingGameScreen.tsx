import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRewards } from "../../app/RewardsContext";
import { GLYPH_ITEMS, objectEmojiByItemId } from "../../data";
import {
  caseMatchCandidates,
  objectMatchCandidates,
  starsForAccuracy,
  type AppSettings,
  type Profile,
} from "../../domain";
import { playOffTrack, playStrokeComplete } from "../../game";
import { Button, Screen } from "../../ui";
import { GameSummary } from "./GameSummary";
import { useChoiceGame } from "./useChoiceGame";
import "./games.css";

type MatchingMode = "case" | "object";

const ROUNDS = 6;
const OPTIONS = 3;

export interface MatchingGameScreenProps {
  readonly profile: Profile;
  readonly settings: AppSettings;
  readonly onBack: () => void;
}

export function MatchingGameScreen({
  profile,
  settings,
  onBack,
}: MatchingGameScreenProps) {
  const { t } = useTranslation();
  const { refresh } = useRewards();
  const [mode, setMode] = useState<MatchingMode>("case");

  const candidates = useMemo(
    () =>
      mode === "case"
        ? caseMatchCandidates(GLYPH_ITEMS)
        : objectMatchCandidates(GLYPH_ITEMS, objectEmojiByItemId(GLYPH_ITEMS)),
    [mode],
  );

  const game = useChoiceGame({
    candidates,
    roundCount: ROUNDS,
    optionCount: OPTIONS,
    profileId: profile.id,
    resetKey: mode,
    hapticsEnabled: settings.hapticsEnabled,
    onProgress: refresh,
  });

  useEffect(() => {
    if (game.feedback === "correct") playStrokeComplete(settings.audioEnabled);
    else if (game.feedback === "wrong") playOffTrack(settings.audioEnabled);
  }, [game.feedback, settings.audioEnabled]);

  const optionClass = (optionId: string): string => {
    const round = game.round;
    if (!round) return "";
    if (game.feedback === "correct" && optionId === round.correctOptionId) {
      return " option-card--correct";
    }
    if (game.feedback === "wrong" && optionId === game.answeredOptionId) {
      return " option-card--wrong";
    }
    if (game.hint && optionId === round.correctOptionId) {
      return " option-card--hint";
    }
    return "";
  };

  return (
    <Screen title={t("games.matching")} onBack={onBack}>
      <div className="games__modes">
        <Button
          label={t("games.modeCase")}
          variant={mode === "case" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setMode("case")}
        />
        <Button
          label={t("games.modeObject")}
          variant={mode === "object" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setMode("object")}
        />
      </div>

      <div className="games__prompt">
        <span className="games__prompt-label">
          {game.round?.promptLabel ?? ""}
        </span>
        <span className="games__prompt-text">
          {mode === "case" ? t("games.casePrompt") : t("games.objectPrompt")}
        </span>
      </div>

      <div className="games__options">
        {game.round?.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`option-card${optionClass(option.id)}`}
            onClick={() => game.choose(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {game.finished ? (
        <GameSummary
          stars={starsForAccuracy(game.accuracy)}
          correct={game.correct}
          total={game.total}
          onRestart={game.restart}
          onBack={onBack}
        />
      ) : null}
    </Screen>
  );
}
