import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  categoryLabelKey,
  findGlyphItem,
  GLYPH_CATEGORIES,
  itemsByKind,
} from "../../data";
import {
  masteryLevel,
  type AppSettings,
  type MasteryScore,
  type ModuleKind,
  type Profile,
} from "../../domain";
import { unlockAudio } from "../../game";
import { ColoringGameScreen } from "../games/ColoringGameScreen";
import { runTask } from "../../platform/task";
import { listMastery } from "../../storage";
import { Screen } from "../../ui";
import { TracingScreen } from "./TracingScreen";
import "./play.css";

export interface PlayScreenProps {
  readonly profile: Profile;
  readonly settings: AppSettings;
  readonly onBack: () => void;
}

type PlayView =
  | { readonly kind: "picker" }
  | { readonly kind: "trace"; readonly id: string }
  | { readonly kind: "color"; readonly id: string };

export function PlayScreen({ profile, settings, onBack }: PlayScreenProps) {
  const { t } = useTranslation();
  const [category, setCategory] = useState<ModuleKind>("letter-upper");
  const [view, setView] = useState<PlayView>({ kind: "picker" });
  const [mastery, setMastery] = useState<readonly MasteryScore[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    void (async () => {
      const result = await runTask(listMastery(profile.id));
      if (result._tag === "Right") setMastery(result.right);
    })();
  }, [profile.id, refreshKey]);

  const levels = useMemo(() => {
    const map = new Map<string, MasteryScore>();
    for (const entry of mastery) map.set(entry.itemId, entry);
    return map;
  }, [mastery]);

  const items = useMemo(() => itemsByKind(category), [category]);

  const backToPicker = () => {
    setView({ kind: "picker" });
    setRefreshKey((value) => value + 1);
  };

  if (view.kind === "trace") {
    const selected = findGlyphItem(view.id);
    if (selected) {
      const index = items.findIndex((entry) => entry.id === selected.id);
      const next = items[(index + 1) % items.length] ?? items[0]!;
      return (
        <TracingScreen
          key={selected.id}
          item={selected}
          profile={profile}
          settings={settings}
          onBack={backToPicker}
          onNext={() => setView({ kind: "trace", id: next.id })}
          onColor={() => setView({ kind: "color", id: selected.id })}
        />
      );
    }
  }

  if (view.kind === "color") {
    const selected = findGlyphItem(view.id);
    if (selected) {
      return (
        <ColoringGameScreen
          item={selected}
          profile={profile}
          settings={settings}
          onBack={backToPicker}
        />
      );
    }
  }

  return (
    <Screen title={t("play.title")} onBack={onBack}>
      <div className="play__tabs">
        {GLYPH_CATEGORIES.map((entry) => (
          <button
            key={entry.kind}
            type="button"
            className={`play__tab${
              entry.kind === category ? " play__tab--active" : ""
            }`}
            onClick={() => setCategory(entry.kind)}
          >
            {t(categoryLabelKey(entry.kind))}
          </button>
        ))}
      </div>

      <div className="play__grid">
        {items.map((item) => {
          const entry = levels.get(item.id);
          const level = masteryLevel(entry?.score, entry?.attempts ?? 0);
          return (
            <button
              key={item.id}
              type="button"
              className={`glyph-card glyph-card--${level}`}
              onClick={() => setView({ kind: "trace", id: item.id })}
            >
              <span>{item.glyph}</span>
              <span className="glyph-card__level">{t(`mastery.${level}`)}</span>
            </button>
          );
        })}
      </div>
    </Screen>
  );
}
