import { useTranslation } from "react-i18next";
import { useRewards } from "../../app/RewardsContext";
import { isLocale, rewardName } from "../../domain";
import { playSuccess } from "../../game";
import { Button } from "../../ui";
import "../play/play.css";
import "./rewards.css";

export interface RewardCelebrationProps {
  readonly audioEnabled: boolean;
}

export function RewardCelebration({ audioEnabled }: RewardCelebrationProps) {
  const { t, i18n } = useTranslation();
  const { celebration, dismissCelebration } = useRewards();
  const locale = isLocale(i18n.language) ? i18n.language : "id";

  if (celebration.length === 0) return null;

  return (
    <div className="play__overlay">
      <p className="play__stars">🎉</p>
      <h2 className="play__overlay-title">{t("rewards.unlocked")}</h2>
      <div className="rewards__celebration">
        {celebration.map((definition) => (
          <figure key={definition.id} className="reward-card reward-card--unlocked">
            <span className="reward-card__emoji" aria-hidden="true">
              {definition.emoji}
            </span>
            <figcaption className="reward-card__name">
              {rewardName(definition, locale)}
            </figcaption>
          </figure>
        ))}
      </div>
      <Button
        label={t("rewards.yeay")}
        icon="🎁"
        onClick={() => {
          playSuccess(audioEnabled);
          dismissCelebration();
        }}
      />
    </div>
  );
}
