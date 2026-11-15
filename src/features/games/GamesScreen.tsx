import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Flame,
  PartyPopper,
  Palette,
  Sparkles,
  Star,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRewards } from "../../app/RewardsContext";
import { useSession } from "../../app/SessionContext";
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
  readonly glyph: typeof ArrowLeftRight;
  readonly titleKey: string;
  readonly subKey: string;
  /** Real content counts, used for the desktop badge chip. */
  readonly badgeCount: number;
  readonly badgeKey: string;
  readonly view: Exclude<GamesView, "hub">;
}

const MATCHING_MODES = 2;
const BALLOON_COUNT = 4;
const COLORING_PAGES = 8;

const GAMES: readonly GameCard[] = [
  {
    key: "matching",
    tone: "coral",
    glyph: ArrowLeftRight,
    titleKey: "games.matching",
    subKey: "games.matchingSub",
    badgeCount: MATCHING_MODES,
    badgeKey: "games.badgeModes",
    view: "matching",
  },
  {
    key: "balloon",
    tone: "sky",
    glyph: PartyPopper,
    titleKey: "games.balloon",
    subKey: "games.balloonSub",
    badgeCount: BALLOON_COUNT,
    badgeKey: "games.badgeBalloons",
    view: "balloon",
  },
  {
    key: "coloring",
    tone: "mango",
    glyph: Palette,
    titleKey: "games.coloring",
    subKey: "games.coloringSub",
    badgeCount: COLORING_PAGES,
    badgeKey: "games.badgePages",
    view: "coloring",
  },
];

export function GamesScreen({ profile, settings, onBack }: GamesScreenProps) {
  const { t } = useTranslation();
  const locale = useActiveLocale();
  const { stats, mastery } = useRewards();
  const { session } = useSession();
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
  // The three-star sticker meter rolls over every 3 stars earned.
  const nextRewardCurrent = stats.starsEarned % 3;
  const nextRewardProgress = Math.min(100, Math.round((nextRewardCurrent / 3) * 100));

  return (
    <div className="games">
      <header className="games__top">
        <button type="button" className="back-pill" onClick={onBack}>
          <Icon glyph={ArrowLeft} size={16} />
          <span>{t("common.back")}</span>
        </button>

        <div className="games__titles">
          <h1 className="games__title">{t("games.title")}</h1>
          <p className="games__sub games__sub--mobile">{t("games.pick")}</p>
          <p className="games__sub games__sub--desktop">
            {t("games.pickDesktop")}
          </p>
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
            <span className="game-card__head">
              <span className="game-card__icon" aria-hidden="true">
                <Icon glyph={game.glyph} size={30} />
              </span>
              <span className="game-card__badge-chip">
                {t(game.badgeKey, { count: game.badgeCount })}
              </span>
            </span>

            <span className="game-card__copy">
              <span className="game-card__title">{t(game.titleKey)}</span>
              <span className="game-card__sub">{t(game.subKey)}</span>
            </span>

            <span className="game-card__cta">
              {t("games.launch")}
              <Icon glyph={ArrowRight} size={15} />
            </span>

            <span className="game-card__go" aria-hidden="true">
              <Icon glyph={ArrowRight} size={20} />
            </span>
          </button>
        ))}
      </div>

      <div className="games__footer">
        <Icon glyph={Sparkles} size={15} className="games__footer-icon" />
        <span>{t("games.footer")}</span>
      </div>

      <div className="games__bottom">
        <section className="games__score-card">
          <h2 className="games__score-title">{t("games.progressTitle")}</h2>
          <div className="games__stat-row">
            <div className="games__stat-tile">
              <span className="games__stat-value games__stat-value--sky">
                {stats.totalAttempts}
              </span>
              <span className="games__stat-label">{t("games.statGames")}</span>
            </div>
            <div className="games__stat-tile">
              <span className="games__stat-value games__stat-value--mango">
                {stats.starsEarned}
              </span>
              <span className="games__stat-label">{t("games.statStarsLabel")}</span>
            </div>
            <div className="games__stat-tile">
              <span className="games__stat-value games__stat-value--grape">
                {session?.spentMinutes ?? 0}
              </span>
              <span className="games__stat-label">{t("games.statMinutes")}</span>
            </div>
          </div>
          <p className="games__score-sub">{t("games.progressSub")}</p>
        </section>

        <section className="games__reward-card">
          <div className="games__reward-head">
            <h2 className="games__reward-title">{t("games.nextReward")}</h2>
            <span className="games__reward-chip">
              {t("home.reward.count", {
                current: nextRewardCurrent,
                target: 3,
              })}
            </span>
          </div>
          <p className="games__reward-sub">{t("games.nextRewardSub")}</p>
          <div
            className="games__reward-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={3}
            aria-valuenow={nextRewardCurrent}
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
