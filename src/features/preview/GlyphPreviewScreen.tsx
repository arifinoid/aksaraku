import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GLYPH_CATEGORIES, itemPhoneme } from "../../data";
import { useActiveLocale } from "../../i18n";
import type { ModuleItem, Vec2 } from "../../domain";
import { Icon } from "../../ui";
import "./preview.css";

const toPolylinePoints = (points: readonly Vec2[]): string =>
  points.map((point) => `${point.x},${point.y}`).join(" ");

const STROKE_COLORS = ["#ff7a45", "#4cb8e8", "#4cc38a", "#f7ce5b", "#ef476f"];

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
  const locale = useActiveLocale();

  return (
    <div className="preview">
      <header className="preview__top">
        <button type="button" className="preview__back" onClick={onBack}>
          <Icon glyph={ArrowLeft} size={16} />
          <span>{t("common.back")}</span>
        </button>
        <div className="preview__titles">
          <h1 className="preview__title">{t("preview.title")}</h1>
          <p className="preview__sub">{t("preview.hint")}</p>
        </div>
        <div className="preview__meta" />
      </header>
      {GLYPH_CATEGORIES.map((category) => (
        <section key={category.kind} className="preview__section">
          <h2 className="preview__section-title">{t(category.labelKey)}</h2>
          <div className="preview__grid">
            {category.items.map((item) => (
              <figure key={item.id} className="preview__cell">
                <GlyphSvg item={item} />
                <figcaption className="preview__caption">
                  {item.glyph} · {itemPhoneme(item, locale)}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
