import type { ModuleItem } from "../../domain";
import { curve, ellipse, item, ln, p, poly, s, starPoints } from "./primitives";

export const SHAPES: readonly ModuleItem[] = [
  item("shape-circle", "shape", "●", [
    s(ellipse(p(50, 50), 33, 33, -90, 270, 32), "curve"),
  ], "lingkaran"),
  item("shape-oval", "shape", "⬭", [
    s(ellipse(p(50, 50), 24, 34, -90, 270, 32), "curve"),
  ], "oval"),
  item("shape-square", "shape", "■", [
    ln(p(25, 25), p(75, 25), "ltr"),
    ln(p(75, 25), p(75, 75), "ttb"),
    ln(p(75, 75), p(25, 75), "rtl"),
    ln(p(25, 75), p(25, 25), "btt"),
  ], "persegi"),
  item("shape-rectangle", "shape", "▭", [
    ln(p(18, 32), p(82, 32), "ltr"),
    ln(p(82, 32), p(82, 68), "ttb"),
    ln(p(82, 68), p(18, 68), "rtl"),
    ln(p(18, 68), p(18, 32), "btt"),
  ], "persegi panjang"),
  item("shape-triangle", "shape", "▲", [
    ln(p(50, 18), p(22, 82), "ttb"),
    ln(p(22, 82), p(78, 82), "ltr"),
    ln(p(78, 82), p(50, 18), "btt"),
  ], "segitiga"),
  item("shape-star", "shape", "★", [
    s(starPoints(p(50, 52), 34, 14), "curve"),
  ], "bintang"),
  item("shape-heart", "shape", "♥", [
    s(poly([
      curve(p(50, 30), p(40, 12), p(14, 20), p(22, 46)),
      curve(p(22, 46), p(28, 64), p(50, 78), p(50, 86)),
      curve(p(50, 86), p(50, 78), p(72, 64), p(78, 46)),
      curve(p(78, 46), p(86, 20), p(60, 12), p(50, 30)),
    ]), "curve"),
  ], "hati"),
  item("shape-line", "shape", "―", [
    ln(p(15, 50), p(85, 50), "ltr"),
  ], "garis"),
];
