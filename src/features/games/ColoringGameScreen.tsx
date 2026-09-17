import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { useTranslation } from "react-i18next";
import { useRewards } from "../../app/RewardsContext";
import { COLOR_PALETTE, STICKER_SET } from "../../data";
import {
  addSticker,
  clearColoring,
  coloredStrokeCount,
  coloringScore,
  createColoringState,
  paintStroke,
  removeLastSticker,
  starsForAccuracy,
  type AppSettings,
  type ModuleItem,
  type Profile,
} from "../../domain";
import { playPop, playSuccess } from "../../game";
import { newId } from "../../platform/ids";
import { runTask } from "../../platform/task";
import { recordAttempt } from "../../storage";
import { Button, Screen } from "../../ui";
import { GameSummary } from "./GameSummary";
import "./games.css";

const VIEW_SIZE = 112;
const VIEW_OFFSET = -6;

const toPolylinePoints = (points: readonly { x: number; y: number }[]): string =>
  points.map((point) => `${point.x},${point.y}`).join(" ");

export interface ColoringGameScreenProps {
  readonly item: ModuleItem;
  readonly profile: Profile;
  readonly settings: AppSettings;
  readonly onBack: () => void;
}

export function ColoringGameScreen({
  item,
  profile,
  settings,
  onBack,
}: ColoringGameScreenProps) {
  const { t } = useTranslation();
  const { refresh } = useRewards();
  const [state, setState] = useState(() => createColoringState(item.id));
  const [color, setColor] = useState(COLOR_PALETTE[0]!);
  const [sticker, setSticker] = useState<string | null>(null);
  const [summary, setSummary] = useState(false);

  const score = coloringScore(state, item.strokes.length);
  const painted = coloredStrokeCount(state);

  const paint = (strokeIndex: number) => {
    if (sticker) return;
    setState((current) => paintStroke(current, strokeIndex, color));
    playPop(settings.audioEnabled);
  };

  const placeSticker = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!sticker) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x =
      ((event.clientX - rect.left) / rect.width) * VIEW_SIZE + VIEW_OFFSET;
    const y =
      ((event.clientY - rect.top) / rect.height) * VIEW_SIZE + VIEW_OFFSET;
    setState((current) =>
      addSticker(current, { id: newId(), emoji: sticker, x, y }),
    );
    playPop(settings.audioEnabled);
  };

  const finish = () => {
    void (async () => {
      await runTask(recordAttempt(profile.id, item.id, score, Date.now()));
      await refresh();
    })();
    setSummary(true);
    playSuccess(settings.audioEnabled);
  };

  const restart = () => {
    setState(createColoringState(item.id));
    setSticker(null);
    setSummary(false);
  };

  return (
    <Screen title={t("games.coloring")} onBack={onBack}>
      <p className="games__prompt-text">{t("games.colorHint")}</p>

      <div className="coloring__stage">
        <svg
          className="coloring__svg"
          viewBox="-6 -6 112 112"
          role="img"
          aria-label={item.glyph}
          onPointerDown={placeSticker}
        >
          {item.strokes.map((stroke, index) => (
            <polyline
              key={index}
              className="coloring__stroke coloring__stroke-line"
              points={toPolylinePoints(stroke.points)}
              stroke={state.fills[index] ?? "#e7d8c4"}
              strokeWidth={11}
              onPointerDown={() => paint(index)}
            />
          ))}
          {state.stickers.map((entry) => (
            <text
              key={entry.id}
              className="coloring__sticker"
              x={entry.x}
              y={entry.y}
              textAnchor="middle"
            >
              {entry.emoji}
            </text>
          ))}
        </svg>
      </div>

      <div className="coloring__palette">
        {COLOR_PALETTE.map((swatch) => (
          <button
            key={swatch}
            type="button"
            aria-label={swatch}
            className={`swatch${!sticker && swatch === color ? " swatch--active" : ""}`}
            style={{ background: swatch }}
            onClick={() => {
              setColor(swatch);
              setSticker(null);
            }}
          />
        ))}
        {STICKER_SET.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={emoji}
            className={`swatch swatch--sticker${sticker === emoji ? " swatch--active" : ""}`}
            onClick={() => setSticker(sticker === emoji ? null : emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="games__actions">
        <Button
          label={t("games.clear")}
          variant="secondary"
          size="sm"
          icon="🧽"
          onClick={() => setState((current) => clearColoring(current))}
        />
        <Button
          label={t("common.back")}
          variant="ghost"
          size="sm"
          icon="↩️"
          onClick={() => setState((current) => removeLastSticker(current))}
        />
        <Button
          label={t("games.finish")}
          icon="✅"
          disabled={painted === 0}
          onClick={finish}
        />
      </div>

      {summary ? (
        <GameSummary
          stars={starsForAccuracy(score)}
          correct={painted}
          total={item.strokes.length}
          message={t("games.painted", {
            painted,
            total: item.strokes.length,
          })}
          onRestart={restart}
          onBack={onBack}
        />
      ) : null}
    </Screen>
  );
}
