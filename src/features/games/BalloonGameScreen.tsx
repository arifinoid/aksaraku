import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRewards } from "../../app/RewardsContext";
import { balloonCandidates, starsForAccuracy, type AppSettings, type Profile } from "../../domain";
import { findGlyphItem, GLYPH_ITEMS, itemPhoneme } from "../../data";
import { playOffTrack, playPop, playStrokeComplete } from "../../game";
import { useActiveLocale } from "../../i18n";
import { speakPhoneme, supportsSpeech } from "../../platform/speech";
import { Button, Screen } from "../../ui";
import { GameSummary } from "./GameSummary";
import { useChoiceGame } from "./useChoiceGame";
import "./games.css";

const ROUNDS = 6;
const OPTIONS = 4;

export interface BalloonGameScreenProps {
  readonly profile: Profile;
  readonly settings: AppSettings;
  readonly onBack: () => void;
}

export function BalloonGameScreen({
  profile,
  settings,
  onBack,
}: BalloonGameScreenProps) {
  const { t } = useTranslation();
  const locale = useActiveLocale();
  const { refresh } = useRewards();
  const canSpeak = supportsSpeech();

  const candidates = useMemo(() => balloonCandidates(GLYPH_ITEMS), []);

  const game = useChoiceGame({
    candidates,
    roundCount: ROUNDS,
    optionCount: OPTIONS,
    profileId: profile.id,
    hapticsEnabled: settings.hapticsEnabled,
    onProgress: refresh,
  });

  const promptItemId = game.round?.promptItemId;

  useEffect(() => {
    if (!promptItemId) return;
    const item = findGlyphItem(promptItemId);
    if (item) {
      speakPhoneme(itemPhoneme(item, locale), locale, settings.audioEnabled);
    }
  }, [promptItemId, locale, settings.audioEnabled]);

  useEffect(() => {
    if (game.feedback === "correct") playStrokeComplete(settings.audioEnabled);
    else if (game.feedback === "wrong") playOffTrack(settings.audioEnabled);
  }, [game.feedback, settings.audioEnabled]);

  const repeat = () => {
    if (!promptItemId) return;
    const item = findGlyphItem(promptItemId);
    if (item) {
      playPop(settings.audioEnabled);
      speakPhoneme(itemPhoneme(item, locale), locale, true);
    }
  };

  const balloonClass = (optionId: string, index: number): string => {
    const round = game.round;
    const tone = ` balloon--${index % 4}`;
    if (!round) return tone;
    if (game.feedback === "correct" && optionId === round.correctOptionId) {
      return `${tone} balloon--pop`;
    }
    if (game.feedback === "wrong" && optionId === game.answeredOptionId) {
      return `${tone} balloon--shake`;
    }
    if (game.hint && optionId === round.correctOptionId) {
      return `${tone} balloon--hint`;
    }
    return tone;
  };

  return (
    <Screen title={t("games.balloon")} onBack={onBack}>
      <div className="games__prompt">
        {canSpeak ? (
          <Button label={t("games.repeat")} icon="🔊" onClick={repeat} />
        ) : (
          <span className="games__prompt-label">
            {game.round?.promptLabel ?? ""}
          </span>
        )}
        <span className="games__prompt-text">{t("games.balloon")}</span>
      </div>

      <div className="balloon-grid">
        {game.round?.options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            className={`balloon${balloonClass(option.id, index)}`}
            style={{ animationDelay: `${(index % 4) * 180}ms` }}
            onClick={() => game.choose(option.id)}
          >
            <span className="balloon__label">{option.label}</span>
            <span className="balloon__string" aria-hidden="true" />
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
