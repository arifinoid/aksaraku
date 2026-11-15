import {
  ArrowLeft,
  Circle,
  Heart,
  Info,
  Minus,
  RectangleHorizontal,
  Square,
  Star,
  Triangle,
  X,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { GLYPH_CATEGORIES, itemPhoneme } from "../../data";
import { useActiveLocale } from "../../i18n";
import type { ModuleItem, ModuleKind } from "../../domain";
import { Icon } from "../../ui";
import "./preview.css";

/** Per-category unit for the section counter, e.g. "26 huruf". */
const COUNT_KEY = {
  "letter-upper": "preview.countLetters",
  "letter-lower": "preview.countLetters",
  digit: "preview.countNumbers",
  shape: "preview.countShapes",
} as const satisfies Record<ModuleKind, string>;

/** Shapes render as small stroke icons in their brand colour, not glyphs. */
const SHAPE_ICONS: Readonly<Record<string, LucideIcon>> = {
  "shape-circle": Circle,
  "shape-oval": Circle,
  "shape-square": Square,
  "shape-rectangle": RectangleHorizontal,
  "shape-triangle": Triangle,
  "shape-star": Star,
  "shape-heart": Heart,
  "shape-line": Minus,
};

/** The design shows the first eight chips of each category. */
const CHIP_LIMIT = 8;

export interface GlyphPreviewScreenProps {
  readonly onBack: () => void;
}

/**
 * Pen.dev "23 · Pratinjau Konten": one card per category, a counter and a row
 * of glyph chips. Read-only, so the screen offers a single way out.
 */
export function GlyphPreviewScreen({ onBack }: GlyphPreviewScreenProps) {
  const { t } = useTranslation();
  const locale = useActiveLocale();

  const chip = (item: ModuleItem) => {
    const Shape = SHAPE_ICONS[item.id];
    return (
      <li
        key={item.id}
        className={`preview__chip${Shape ? ` preview__chip--${item.id.replace("shape-", "")}` : ""}`}
      >
        {Shape ? (
          <Icon glyph={Shape} size={14} />
        ) : (
          <span aria-hidden="true">{item.glyph}</span>
        )}
        <span className="visually-hidden">{itemPhoneme(item, locale)}</span>
      </li>
    );
  };

  return (
    <div className="preview">
      <header className="preview__top">
        <button type="button" className="back-pill" onClick={onBack}>
          <Icon glyph={ArrowLeft} size={16} />
          <span>{t("common.back")}</span>
        </button>
        <h1 className="preview__title">{t("preview.title")}</h1>
      </header>

      <div className="preview__content">
        <p className="preview__lead">{t("preview.hint")}</p>

        {GLYPH_CATEGORIES.map((category) => (
          <section key={category.kind} className="preview-card">
            <div className="preview-card__head">
              <h2 className="preview-card__title">
                {t(category.labelKey)}
              </h2>
              <span className="preview-card__count">
                {t(COUNT_KEY[category.kind], {
                  count: category.items.length,
                })}
              </span>
            </div>

            <ul className="preview-card__row">
              {category.items.slice(0, CHIP_LIMIT).map(chip)}
            </ul>
          </section>
        ))}

        <p className="preview-note">
          <Icon glyph={Info} size={14} />
          <span>{t("preview.note")}</span>
        </p>

        <button type="button" className="preview-close" onClick={onBack}>
          <Icon glyph={X} size={15} />
          <span>{t("preview.close")}</span>
        </button>
      </div>
    </div>
  );
}
