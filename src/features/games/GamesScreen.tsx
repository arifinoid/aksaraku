import { ArrowRight, Flame, Paintbrush, Puzzle, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRewards } from "../../app/RewardsContext";
import { avatarEmoji, GLYPH_ITEMS } from "../../data";
import {
  pickOne,
  type AppSettings,
  type ModuleItem,
  type Profile,
} from "../../domain";
import { currentStreak } from "../home/streak";
import { useActiveLocale } from "../../i18n";
import { Icon } from "../../ui";
import { BalloonGameScreen } from "./BalloonGameScreen";
import { ColoringGameScreen } from "./ColoringGameScreen";
import { MatchingGameScreen } from "./MatchingGameScreen";
import "./games.css";

export interface GamesScreenProps {
  readonly profile: Profile;
  readonly settings: AppSettings;
  readonly onBack: () => void;
}

type GamesView = "hub" | "matching" | "balloon" | "coloring";

interface GameCard {
  readonly key: "matching" | "balloon" | "coloring";
  readonly tone: "coral" | "sky" | "mango";
  readonly icon: string;
  readonly titleKey: string;
  readonly subKey: string;
  readonly view: Exclude<GamesView, "hub">;
}

const GAMES: readonly GameCard[] = [
  {
    key: "matching",
    tone: "coral",
    icon: "🧩",
    titleKey: "games.matching",
    subKey: "games.matchingSub",
    view: "matching",
  },
  {
    key: "balloon",
    tone: "sky",
    icon: "🎈",
    titleKey: "games.balloon",
    subKey: "games.balloonSub",
    view: "balloon",
  },
  {
    key: "coloring",
    tone: "mango",
    icon: "🎨",
    titleKey: "games.coloring",
    subKey: "games.coloringSub",
    view: "coloring",
  },
];

export function GamesScreen({ profile, settings, onBack }: GamesScreenProps) {
  const { t } = useTranslation();
  const locale = useActiveLocale();
  const { stats, mastery } = useRewards();
  const [view, setView] = useState<GamesView>("hub");
  const [coloringItem, setColoringItem] = useState<ModuleItem | null>(null);

  if (view === "matching") {
    return (
      <MatchingGameScreen
        profile={profile}
        settings={settings}
        onBack={() => setView("hub")}
      />
    );
  }
  if (view === "balloon") {
    return (
      <BalloonGameScreen
        profile={profile}
        settings={settings}
        onBack={() => setView("hub")}
      />
    );
  }
  if (view === "coloring" && coloringItem) {
    return (
      <ColoringGameScreen
        item={coloringItem}
        profile={profile}
        settings={settings}
        onBack={() => setView("hub")}
      />
    );
  }

  const startColoring = () => {
    setColoringItem(pickOne(GLYPH_ITEMS, Math.random) ?? GLYPH_ITEMS[0]!);
    setView("coloring");
  };

  const streak = currentStreak(mastery.map((entry) => entry.lastSeenAt));
  const nextRewardProgress = Math.min(
    100,
    Math.round((stats.starsEarned % 3) / 3 * 100),
  );

  return (
    <div className="games">
      <header className="games__top">
        <button type="button" className="games__back" onClick={onBack}>
          <Icon glyph={ArrowRight} size={16} className="games__back-icon" />
          <span>{t("common.back")}</span>
        </button>

        <div className="games__titles">
          <h1 className="games__title">{t("games.title")}</h1>
          <p className="games__sub">{t("games.pick")}</p>
        </div>

        <div className="games__meta">
          <span className="games__pill">
            <Icon glyph={Flame} size={14} className="games__pill-icon" />
            {t("home.streak", { count: streak })}
          </span>
          <span className="games__pill">
            <Icon glyph={Star} size={14} className="games__pill-icon games__pill-icon--star" />
            {stats.starsEarned}
          </span>
          <span className="games__avatar" aria-hidden="true">
            {avatarEmoji(profile.avatarId)}
          </span>
        </div>
      </header>

      <div className="games__hub motion-stagger">
        {GAMES.map((game) => (
          <button
            key={game.key}
            type="button"
            className={`game-card game-card--${game.tone}`}
            onClick={() =>
              game.view === "coloring"
                ? startColoring()
                : setView(game.view)
            }
          >
            <span className="game-card__icon" aria-hidden="true">
              {game.icon}
            </span>
            <span className="game-card__copy">
              <span className="game-card__title">{t(game.titleKey)}</span>
              <span className="game-card__sub">{t(game.subKey)}</span>
            </span>
            <span className="game-card__play">
              {t("games.play")}
              <Icon glyph={ArrowRight} size={14} />
            </span>
          </button>
        ))}
      </div>

      <div className="games__footer">
        <span className="games__footer-icon" aria-hidden="true">
          <Icon glyph={Sparkles} size={15} />
        </span>
        <span className="games__footer-text">{t("games.footer")}</span>
      </div>

      <div className="games__bottom">
        <section className="games__score-card">
          <h2 className="games__score-title">{t("games.progressTitle")}</h2>
          <div className="games__score-stats">
            <span className="games__score-stat">
              <Icon glyph={Star} size={16} className="games__score-stat-icon" />
              {t("games.starsEarned", { count: stats.starsEarned })}
            </span>
            <span className="games__score-stat">
              <Icon glyph={Puzzle} size={16} className="games__score-stat-icon" />
              {t("games.played", { count: stats.totalAttempts })}
            </span>
          </div>
          <p className="games__score-sub">{t("games.progressSub")}</p>
        </section>

        <section className="games__reward-card">
          <div className="games__reward-head">
            <span className="games__reward-icon" aria-hidden="true">
              <Icon glyph={Sparkles} size={18} />
            </span>
            <h2 className="games__reward-title">{t("games.nextReward")}</h2>
          </div>
          <p className="games__reward-sub">{t("games.nextRewardSub")}</p>
          <div
            className="games__reward-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={3}
            aria-valuenow={stats.starsEarned % 3}
          >
            <span
              className="games__reward-fill"
              style={{ width: `${Math.max(4, nextRewardProgress)}%` }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
