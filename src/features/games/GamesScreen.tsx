import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GLYPH_ITEMS } from "../../data";
import {
  pickOne,
  type AppSettings,
  type ModuleItem,
  type Profile,
} from "../../domain";
import { Screen, Tile } from "../../ui";
import { BalloonGameScreen } from "./BalloonGameScreen";
import { ColoringGameScreen } from "./ColoringGameScreen";
import { MatchingGameScreen } from "./MatchingGameScreen";
import "./games.css";

type GamesView = "hub" | "matching" | "balloon" | "coloring";

export interface GamesScreenProps {
  readonly profile: Profile;
  readonly settings: AppSettings;
  readonly onBack: () => void;
}

export function GamesScreen({ profile, settings, onBack }: GamesScreenProps) {
  const { t } = useTranslation();
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

  return (
    <Screen title={t("games.title")} onBack={onBack}>
      <div className="games__hub">
        <Tile
          label={t("games.matching")}
          icon="🧩"
          tone="primary"
          onClick={() => setView("matching")}
        />
        <Tile
          label={t("games.balloon")}
          icon="🎈"
          tone="secondary"
          onClick={() => setView("balloon")}
        />
        <Tile
          label={t("games.coloring")}
          icon="🎨"
          tone="accent"
          onClick={startColoring}
        />
      </div>
    </Screen>
  );
}
