import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRewards } from "../../app/RewardsContext";
import { isLocale, rewardName } from "../../domain";
import { playSuccess } from "../../game";
import { HAPTIC, vibrate } from "../../platform/haptics";
import { Button } from "../../ui";
import "../play/play.css";
import "./rewards.css";

export interface RewardCelebrationProps {
  readonly audioEnabled: boolean;
  readonly hapticsEnabled: boolean;
  readonly reduceMotion?: boolean;
}

/**
 * The pieces of paper that fall over the celebration.
 *
 * They are positioned with a deterministic pseudo-random spread so the
 * shower looks scattered but does not reshuffle on every render.
 */
const CONFETTI = ["🎉", "⭐", "🎊", "✨", "🎈", "🏆"] as const;

const CONFETTI_COUNT = 18;

const confettiPieces = (): readonly {
  readonly glyph: string;
  readonly left: number;
  readonly delay: number;
  readonly duration: number;
}[] =>
  Array.from({ length: CONFETTI_COUNT }, (_, index) => {
    // A simple hash of the index: stable across renders, but scattered.
    const noise = (index * 2654435761) % 1000;
    return {
      glyph: CONFETTI[index % CONFETTI.length]!,
      left: (noise / 1000) * 100,
      delay: (index % 6) * 90,
      duration: 1400 + (index % 5) * 160,
    };
  });

export function RewardCelebration({
  audioEnabled,
  hapticsEnabled,
  reduceMotion = false,
}: RewardCelebrationProps) {
  const { t, i18n } = useTranslation();
  const { celebration, dismissCelebration } = useRewards();
  const locale = isLocale(i18n.language) ? i18n.language : "id";
  const pieces = useMemo(confettiPieces, []);

  if (celebration.length === 0) return null;

  return (
    <div className="play__overlay rewards__celebrate">
      {reduceMotion ? null : (
        <div className="rewards__confetti" aria-hidden="true">
          {pieces.map((piece, index) => (
            <span
              key={index}
              className="motion-confetti"
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}ms`,
                animationDuration: `${piece.duration}ms`,
              }}
            >
              {piece.glyph}
            </span>
          ))}
        </div>
      )}

      <p className="rewards__burst motion-pop" aria-hidden="true">
        🎉
      </p>
      <h2 className="play__overlay-title">{t("rewards.unlocked")}</h2>
      <div className="rewards__celebration">
        {celebration.map((definition, index) => (
          <figure
            key={definition.id}
            className="reward-card reward-card--unlocked motion-pop"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <span className="motion-ring" aria-hidden="true" />
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
          vibrate(HAPTIC.success, hapticsEnabled);
          dismissCelebration();
        }}
      />
    </div>
  );
}
