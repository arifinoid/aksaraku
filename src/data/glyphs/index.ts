import type { ModuleItem, ModuleKind } from "../../domain";
import { DIGITS } from "./digits";
import { LOWERCASE } from "./lowercase";
import { SHAPES } from "./shapes";
import { UPPERCASE } from "./uppercase";

export * from "./primitives";

export interface GlyphCategory {
  readonly kind: ModuleKind;
  readonly labelKey: string;
  readonly items: readonly ModuleItem[];
}

export const GLYPH_CATEGORIES: readonly GlyphCategory[] = [
  { kind: "letter-upper", labelKey: "categories.upper", items: UPPERCASE },
  { kind: "letter-lower", labelKey: "categories.lower", items: LOWERCASE },
  { kind: "digit", labelKey: "categories.digits", items: DIGITS },
  { kind: "shape", labelKey: "categories.shapes", items: SHAPES },
];

export const GLYPH_ITEMS: readonly ModuleItem[] = GLYPH_CATEGORIES.flatMap(
  (category) => category.items,
);

export const findGlyphItem = (itemId: string): ModuleItem | undefined =>
  GLYPH_ITEMS.find((item) => item.id === itemId);

export const itemsByKind = (kind: ModuleKind): readonly ModuleItem[] =>
  GLYPH_CATEGORIES.find((category) => category.kind === kind)?.items ?? [];

export const categoryLabelKey = (kind: ModuleKind): string =>
  GLYPH_CATEGORIES.find((category) => category.kind === kind)?.labelKey ?? "";
