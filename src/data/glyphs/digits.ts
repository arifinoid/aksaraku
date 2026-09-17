import type { ModuleItem } from "../../domain";
import { curve, ellipse, item, ln, p, poly, s, seg } from "./primitives";

export const DIGITS: readonly ModuleItem[] = [
  item("digit-0", "digit", "0", [
    s(ellipse(p(50, 50), 26, 35, -90, 270, 32), "curve"),
  ], "nol"),
  item("digit-1", "digit", "1", [
    s(poly([seg(p(38, 28), p(50, 15)), seg(p(50, 15), p(50, 85))]), "ttb"),
    ln(p(33, 85), p(67, 85), "ltr"),
  ], "satu"),
  item("digit-2", "digit", "2", [
    s(poly([
      curve(p(28, 32), p(28, 12), p(72, 12), p(72, 40)),
      seg(p(72, 40), p(28, 85)),
    ]), "ttb"),
    ln(p(28, 85), p(74, 85), "ltr"),
  ], "dua"),
  item("digit-3", "digit", "3", [
    s(poly([
      curve(p(30, 26), p(38, 10), p(72, 14), p(72, 38)),
      curve(p(72, 38), p(72, 54), p(44, 50), p(44, 50)),
      curve(p(44, 50), p(78, 50), p(76, 90), p(30, 72)),
    ]), "curve"),
  ], "tiga"),
  item("digit-4", "digit", "4", [
    s(poly([seg(p(64, 15), p(28, 60)), seg(p(28, 60), p(76, 60))]), "ltr"),
    ln(p(64, 15), p(64, 85), "ttb"),
  ], "empat"),
  item("digit-5", "digit", "5", [
    s(poly([seg(p(68, 15), p(34, 15)), seg(p(34, 15), p(32, 44))]), "ttb"),
    s(poly([
      curve(p(32, 44), p(60, 36), p(76, 52), p(74, 66)),
      curve(p(74, 66), p(72, 88), p(32, 88), p(30, 70)),
    ]), "curve"),
  ], "lima"),
  item("digit-6", "digit", "6", [
    s([
      ...poly([curve(p(70, 18), p(50, 12), p(30, 30), p(30, 66))]),
      ...ellipse(p(50, 66), 20, 19, 180, 540, 28),
    ], "curve"),
  ], "enam"),
  item("digit-7", "digit", "7", [
    ln(p(28, 18), p(72, 18), "ltr"),
    ln(p(72, 18), p(40, 85), "ttb"),
  ], "tujuh"),
  item("digit-8", "digit", "8", [
    s(ellipse(p(50, 32), 18, 17, -90, 270, 24), "curve"),
    s(ellipse(p(50, 68), 22, 19, -90, 270, 24), "curve"),
  ], "delapan"),
  item("digit-9", "digit", "9", [
    s(ellipse(p(50, 34), 20, 19, -90, 270, 28), "curve"),
    s(poly([curve(p(70, 34), p(70, 80), p(46, 92), p(30, 80))]), "ttb"),
  ], "sembilan"),
];
