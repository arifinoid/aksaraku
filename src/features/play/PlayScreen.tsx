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
  type ModuleItem,
  type ModuleKind,
  type Profile,
} from "../../domain";
import { unlockAudio } from "../../game";
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

export function PlayScreen({ profile, settings, onBack }: PlayScreenProps) {
  const { t } = useTranslation();
  const [kind, setKind] = useState<ModuleKind>("letter-upper");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const items = useMemo(() => itemsByKind(kind), [kind]);

  const selected = selectedId ? findGlyphItem(selectedId) : undefined;

  if (selected) {
    const index = items.findIndex((entry) => entry.id === selected.id);
    const next = items[(index + 1) % items.length] ?? items[0]!;
    return (
      <TracingScreen
        key={selected.id}
        item={selected}
        profile={profile}
        settings={settings}
        onBack={() => {
          setSelectedId(null);
          setRefreshKey((value) => value + 1);
        }}
        onNext={() => setSelectedId(next.id)}
      />
    );
  }

  return (
    <Screen title={t("play.title")} onBack={onBack}>
      <div className="play__tabs">
        {GLYPH_CATEGORIES.map((category) => (
          <button
            key={category.kind}
            type="button"
            className={`play__tab${
              category.kind === kind ? " play__tab--active" : ""
            }`}
            onClick={() => setKind(category.kind)}
          >
            {t(categoryLabelKey(category.kind))}
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
              onClick={() => setSelectedId(item.id)}
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
