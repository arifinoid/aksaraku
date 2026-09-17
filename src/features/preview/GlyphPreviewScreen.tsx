import { useTranslation } from "react-i18next";
import { GLYPH_CATEGORIES } from "../../data";
import type { ModuleItem, Vec2 } from "../../domain";
import { Screen } from "../../ui";
import "./preview.css";

const toPolylinePoints = (points: readonly Vec2[]): string =>
  points.map((point) => `${point.x},${point.y}`).join(" ");

const STROKE_COLORS = ["#ff7a45", "#4cc9f0", "#57cc99", "#ffd166", "#ef476f"];

function GlyphSvg({ item }: { readonly item: ModuleItem }) {
  return (
    <svg
      className="preview__svg"
      viewBox="-6 -6 112 112"
      role="img"
      aria-label={item.glyph}
    >
      {item.strokes.map((stroke, index) => (
        <polyline
          key={`line-${index}`}
          points={toPolylinePoints(stroke.points)}
          fill="none"
          stroke={STROKE_COLORS[index % STROKE_COLORS.length]}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {item.strokes.map((stroke, index) => {
        const start = stroke.points[0];
        if (!start) return null;
        return (
          <circle
            key={`dot-${index}`}
            cx={start.x}
            cy={start.y}
            r={3}
            fill="#3d2b1f"
          />
        );
      })}
    </svg>
  );
}

export interface GlyphPreviewScreenProps {
  readonly onBack: () => void;
}

export function GlyphPreviewScreen({ onBack }: GlyphPreviewScreenProps) {
  const { t } = useTranslation();

  return (
    <Screen title={t("preview.title")} onBack={onBack}>
      <p className="panel__hint">{t("preview.hint")}</p>
      {GLYPH_CATEGORIES.map((category) => (
        <section key={category.kind} className="panel">
          <h2 className="panel__title">{t(category.labelKey)}</h2>
          <div className="preview__grid">
            {category.items.map((item) => (
              <figure key={item.id} className="preview__cell">
                <GlyphSvg item={item} />
                <figcaption className="preview__caption">
                  {item.glyph} · {item.phoneme}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </Screen>
  );
}
