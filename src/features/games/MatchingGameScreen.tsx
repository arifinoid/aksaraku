import { ArrowLeft, ArrowRight, Check, Flame, Star, Volume2 } from "lucide-react";
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
import { useActiveLocale } from "../../i18n";
import { Icon } from "../../ui";
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
  const locale = useActiveLocale();
  const { refresh, mastery } = useRewards();
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

  const streak = 0;

  return (
    <div className="match">
      <header className="match__top">
        <button type="button" className="match__back" onClick={onBack}>
          <Icon glyph={ArrowLeft} size={16} />
          <span>{t("common.back")}</span>
        </button>

        <div className="match__titles">
          <h1 className="match__title">{t("games.matching")}</h1>
          <p className="match__sub">{t("games.matchingSub")}</p>
        </div>

        <div className="match__meta">
          <span className="match__chip">
            {t("play.ratio", {
              current: game.session.index + 1,
              total: ROUNDS,
            })}
          </span>
        </div>
      </header>

      <div className="match__modes">
        <button
          type="button"
          className={`match__mode${mode === "case" ? " is-active" : ""}`}
          onClick={() => setMode("case")}
        >
          {t("games.modeCase")}
        </button>
        <button
          type="button"
          className={`match__mode${mode === "object" ? " is-active" : ""}`}
          onClick={() => setMode("object")}
        >
          {t("games.modeObject")}
        </button>
      </div>

      <div className="match__prompt">
        <span className="match__prompt-label">{game.round?.promptLabel ?? ""}</span>
        <span className="match__prompt-text">
          {mode === "case" ? t("games.casePrompt") : t("games.objectPrompt")}
        </span>
      </div>

      <div className="match__options">
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

      {game.feedback === "correct" ? (
        <div className="match__feedback match__feedback--ok">
          <Icon glyph={Check} size={16} />
          <span>{t("games.correct")}</span>
        </div>
      ) : game.feedback === "wrong" ? (
        <div className="match__feedback match__feedback--bad">
          <span>{t("games.wrong")}</span>
        </div>
      ) : null}

      {game.finished ? (
        <GameSummary
          stars={starsForAccuracy(game.accuracy)}
          correct={game.correct}
          total={game.total}
          onRestart={game.restart}
          onBack={onBack}
        />
      ) : null}
    </div>
  );
}