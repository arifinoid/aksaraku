import { ArrowLeft, Info, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GLYPH_CATEGORIES, itemPhoneme } from "../../data";
import { useActiveLocale } from "../../i18n";
import type { ModuleKind } from "../../domain";
import { Icon } from "../../ui";
import "./preview.css";

/** Per-category unit for the section counter, e.g. "26 huruf". */
const COUNT_KEY = {
  "letter-upper": "preview.countLetters",
  "letter-lower": "preview.countLetters",
  digit: "preview.countNumbers",
  shape: "preview.countShapes",
} as const satisfies Record<ModuleKind, string>;

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

  return (
    <div className="preview">
      <header className="preview__top">
        <button type="button" className="preview__back" onClick={onBack}>
          <Icon glyph={ArrowLeft} size={14} />
          <span>{t("common.back")}</span>
        </button>
        <h1 className="preview__title">{t("preview.title")}</h1>
      </header>

      <div className="preview__content">
        <p className="preview__lead">{t("preview.hint")}</p>

        {GLYPH_CATEGORIES.map((category) => (
          <section key={category.kind} className="preview__section">
            <div className="preview__head">
              <h2 className="preview__section-title">
                {t(category.labelKey)}
              </h2>
              <span className="preview__count">
                {t(COUNT_KEY[category.kind], {
                  count: category.items.length,
                })}
              </span>
            </div>

            <ul className="preview__row">
              {category.items.map((item) => (
                <li key={item.id} className="preview__chip">
                  <span aria-hidden="true">{item.glyph}</span>
                  <span className="visually-hidden">
                    {itemPhoneme(item, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="preview__note">
          <Icon glyph={Info} size={14} />
          <span>{t("preview.note")}</span>
        </p>

        <button type="button" className="preview__close" onClick={onBack}>
          <Icon glyph={X} size={15} />
          <span>{t("preview.close")}</span>
        </button>
      </div>
    </div>
  );
}
