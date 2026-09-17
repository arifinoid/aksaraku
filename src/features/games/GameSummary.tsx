import { useTranslation } from "react-i18next";
import type { StarCount } from "../../domain";
import { Button } from "../../ui";
import "../play/play.css";

export interface GameSummaryProps {
  readonly stars: StarCount;
  readonly correct: number;
  readonly total: number;
  readonly message?: string;
  readonly onRestart: () => void;
  readonly onBack: () => void;
}

export function GameSummary({
  stars,
  correct,
  total,
  message,
  onRestart,
  onBack,
}: GameSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="play__overlay">
      <p className="play__stars">{"⭐".repeat(stars) || "💪"}</p>
      <h2 className="play__overlay-title">{t("games.finished")}</h2>
      <p className="games__prompt-text">
        {message ?? t("games.score", { correct, total })}
      </p>
      <div className="play__overlay-actions">
        <Button label={t("games.playAgain")} icon="🔁" onClick={onRestart} />
        <Button
          label={t("common.back")}
          variant="secondary"
          onClick={onBack}
        />
      </div>
    </div>
  );
}
