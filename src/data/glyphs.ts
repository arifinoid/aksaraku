import type {
  ModuleItem,
  ModuleItemId,
  StrokeDirection,
  StrokePath,
  Vec2,
} from "../domain";
import { arcPoints, ellipsePoints, line, samplePath } from "../domain";

const p = (x: number, y: number): Vec2 => ({ x, y });

export const DEFAULT_TOLERANCE = 6;

const stroke = (
  points: readonly Vec2[],
  guideOrder: number,
  direction: StrokeDirection,
  tolerance = DEFAULT_TOLERANCE,
): StrokePath => ({ points, tolerance, guideOrder, direction });

const lineStroke = (
  from: Vec2,
  to: Vec2,
  guideOrder: number,
  direction: StrokeDirection = "ltr",
): StrokePath => stroke(samplePath([line(from, to)], 12), guideOrder, direction);

const id = (value: string): ModuleItemId => value as ModuleItemId;

export const GLYPH_ITEMS: readonly ModuleItem[] = [
  {
    id: id("letter-l"),
    kind: "letter-upper",
    glyph: "L",
    strokes: [
      lineStroke(p(35, 15), p(35, 85), 0, "ttb"),
      lineStroke(p(35, 85), p(72, 85), 1, "ltr"),
    ],
    phoneme: "el",
    locale: "id",
    labelKey: "",
  },
  {
    id: id("letter-i"),
    kind: "letter-upper",
    glyph: "I",
    strokes: [
      lineStroke(p(35, 20), p(65, 20), 0, "ltr"),
      lineStroke(p(50, 20), p(50, 85), 1, "ttb"),
      lineStroke(p(35, 85), p(65, 85), 2, "ltr"),
    ],
    phoneme: "i",
    locale: "id",
    labelKey: "",
  },
  {
    id: id("letter-t"),
    kind: "letter-upper",
    glyph: "T",
    strokes: [
      lineStroke(p(28, 20), p(72, 20), 0, "ltr"),
      lineStroke(p(50, 20), p(50, 85), 1, "ttb"),
    ],
    phoneme: "te",
    locale: "id",
    labelKey: "",
  },
  {
    id: id("letter-v"),
    kind: "letter-upper",
    glyph: "V",
    strokes: [
      lineStroke(p(28, 15), p(50, 85), 0, "ttb"),
      lineStroke(p(50, 85), p(72, 15), 1, "btt"),
    ],
    phoneme: "ve",
    locale: "id",
    labelKey: "",
  },
  {
    id: id("letter-c"),
    kind: "letter-upper",
    glyph: "C",
    strokes: [stroke(arcPoints(p(52, 50), 32, 55, 305, 28), 0, "curve")],
    phoneme: "ce",
    locale: "id",
    labelKey: "",
  },
  {
    id: id("letter-o"),
    kind: "letter-upper",
    glyph: "O",
    strokes: [stroke(ellipsePoints(p(50, 50), 30, 36, -90, 270, 32), 0, "curve")],
    phoneme: "o",
    locale: "id",
    labelKey: "",
  },
  {
    id: id("letter-a"),
    kind: "letter-upper",
    glyph: "A",
    strokes: [
      lineStroke(p(28, 85), p(50, 15), 0, "ttb"),
      lineStroke(p(50, 15), p(72, 85), 1, "ttb"),
      lineStroke(p(37, 58), p(63, 58), 2, "ltr"),
    ],
    phoneme: "a",
    locale: "id",
    labelKey: "",
  },
  {
    id: id("digit-1"),
    kind: "digit",
    glyph: "1",
    strokes: [
      stroke(
        samplePath([line(p(35, 28), p(50, 15)), line(p(50, 15), p(50, 85))], 12),
        0,
        "ttb",
      ),
      lineStroke(p(32, 85), p(68, 85), 1, "ltr"),
    ],
    phoneme: "satu",
    locale: "id",
    labelKey: "",
  },
  {
    id: id("shape-line"),
    kind: "shape",
    glyph: "―",
    strokes: [lineStroke(p(15, 50), p(85, 50), 0, "ltr")],
    phoneme: "garis",
    locale: "id",
    labelKey: "",
  },
  {
    id: id("shape-circle"),
    kind: "shape",
    glyph: "●",
    strokes: [stroke(ellipsePoints(p(50, 50), 32, 32, -90, 270, 32), 0, "curve")],
    phoneme: "lingkaran",
    locale: "id",
    labelKey: "",
  },
];

export const findGlyphItem = (itemId: string): ModuleItem | undefined =>
  GLYPH_ITEMS.find((item) => item.id === itemId);
