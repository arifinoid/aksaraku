import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { findGlyphItem, GLYPH_ITEMS } from "../../data";
import {
  masteryLevel,
  type AppSettings,
  type MasteryScore,
  type ModuleItem,
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

const nextItem = (currentId: string): ModuleItem => {
  const index = GLYPH_ITEMS.findIndex((item) => item.id === currentId);
  const nextIndex = index < 0 ? 0 : (index + 1) % GLYPH_ITEMS.length;
  return GLYPH_ITEMS[nextIndex]!;
};

export function PlayScreen({ profile, settings, onBack }: PlayScreenProps) {
  const { t } = useTranslation();
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

  const selected = selectedId ? findGlyphItem(selectedId) : undefined;

  if (selected) {
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
        onNext={() => setSelectedId(nextItem(selected.id).id)}
      />
    );
  }

  return (
    <Screen title={t("play.title")} onBack={onBack}>
      <p className="play__hint">{t("play.pick")}</p>
      <div className="play__grid">
        {GLYPH_ITEMS.map((item) => {
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
