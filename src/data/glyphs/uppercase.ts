import type { ModuleItem } from "../../domain";
import { arc, curve, ellipse, item, ln, p, poly, s, seg } from "./primitives";

export const UPPERCASE: readonly ModuleItem[] = [
  item("upper-a", "letter-upper", "A", [
    ln(p(30, 85), p(50, 15), "ttb"),
    ln(p(50, 15), p(70, 85), "ttb"),
    ln(p(38, 58), p(62, 58), "ltr"),
  ], "a"),
  item("upper-b", "letter-upper", "B", [
    ln(p(25, 15), p(25, 85), "ttb"),
    s(poly([
      seg(p(25, 15), p(45, 15)),
      curve(p(45, 15), p(63, 15), p(63, 50), p(45, 50)),
      seg(p(45, 50), p(25, 50)),
    ]), "ttb"),
    s(poly([
      seg(p(25, 50), p(48, 50)),
      curve(p(48, 50), p(67, 50), p(67, 85), p(48, 85)),
      seg(p(48, 85), p(25, 85)),
    ]), "ttb"),
  ], "be"),
  item("upper-c", "letter-upper", "C", [
    s(poly([
      curve(p(74, 28), p(66, 10), p(34, 10), p(26, 50)),
      curve(p(26, 50), p(34, 90), p(66, 90), p(74, 72)),
    ]), "curve"),
  ], "ce"),
  item("upper-d", "letter-upper", "D", [
    ln(p(25, 15), p(25, 85), "ttb"),
    s(poly([
      seg(p(25, 15), p(46, 15)),
      curve(p(46, 15), p(75, 20), p(75, 80), p(46, 85)),
      seg(p(46, 85), p(25, 85)),
    ]), "ttb"),
  ], "de"),
  item("upper-e", "letter-upper", "E", [
    ln(p(25, 15), p(25, 85), "ttb"),
    ln(p(25, 15), p(72, 15), "ltr"),
    ln(p(25, 50), p(64, 50), "ltr"),
    ln(p(25, 85), p(72, 85), "ltr"),
  ], "e"),
  item("upper-f", "letter-upper", "F", [
    ln(p(25, 15), p(25, 85), "ttb"),
    ln(p(25, 15), p(72, 15), "ltr"),
    ln(p(25, 50), p(64, 50), "ltr"),
  ], "ef"),
  item("upper-g", "letter-upper", "G", [
    s(poly([
      curve(p(74, 28), p(66, 10), p(34, 10), p(26, 50)),
      curve(p(26, 50), p(34, 88), p(70, 88), p(74, 64)),
    ]), "curve"),
    s(poly([seg(p(74, 64), p(74, 50)), seg(p(74, 50), p(54, 50))]), "ttb"),
  ], "ge"),
  item("upper-h", "letter-upper", "H", [
    ln(p(28, 15), p(28, 85), "ttb"),
    ln(p(72, 15), p(72, 85), "ttb"),
    ln(p(28, 50), p(72, 50), "ltr"),
  ], "ha"),
  item("upper-i", "letter-upper", "I", [
    ln(p(35, 20), p(65, 20), "ltr"),
    ln(p(50, 20), p(50, 85), "ttb"),
    ln(p(35, 85), p(65, 85), "ltr"),
  ], "i"),
  item("upper-j", "letter-upper", "J", [
    ln(p(50, 15), p(74, 15), "ltr"),
    s(poly([
      seg(p(62, 15), p(62, 66)),
      curve(p(62, 66), p(62, 88), p(40, 88), p(40, 64)),
    ]), "ttb"),
  ], "je"),
  item("upper-k", "letter-upper", "K", [
    ln(p(28, 15), p(28, 85), "ttb"),
    ln(p(72, 15), p(30, 50), "ttb"),
    ln(p(42, 42), p(74, 85), "ttb"),
  ], "ka"),
  item("upper-l", "letter-upper", "L", [
    ln(p(28, 15), p(28, 85), "ttb"),
    ln(p(28, 85), p(72, 85), "ltr"),
  ], "el"),
  item("upper-m", "letter-upper", "M", [
    ln(p(25, 85), p(25, 15), "btt"),
    s(poly([seg(p(25, 15), p(50, 52)), seg(p(50, 52), p(75, 15))]), "ttb"),
    ln(p(75, 15), p(75, 85), "ttb"),
  ], "em"),
  item("upper-n", "letter-upper", "N", [
    ln(p(25, 85), p(25, 15), "btt"),
    ln(p(25, 15), p(75, 85), "ttb"),
    ln(p(75, 85), p(75, 15), "btt"),
  ], "en"),
  item("upper-o", "letter-upper", "O", [
    s(ellipse(p(50, 50), 30, 35, -90, 270, 32), "curve"),
  ], "o"),
  item("upper-p", "letter-upper", "P", [
    ln(p(28, 15), p(28, 85), "ttb"),
    s(poly([
      seg(p(28, 15), p(48, 15)),
      curve(p(48, 15), p(73, 15), p(73, 52), p(48, 52)),
      seg(p(48, 52), p(28, 52)),
    ]), "ttb"),
  ], "pe"),
  item("upper-q", "letter-upper", "Q", [
    s(ellipse(p(50, 48), 30, 33, -90, 270, 32), "curve"),
    ln(p(60, 66), p(80, 88), "ttb"),
  ], "ki"),
  item("upper-r", "letter-upper", "R", [
    ln(p(28, 15), p(28, 85), "ttb"),
    s(poly([
      seg(p(28, 15), p(48, 15)),
      curve(p(48, 15), p(73, 15), p(73, 52), p(48, 52)),
      seg(p(48, 52), p(28, 52)),
    ]), "ttb"),
    ln(p(42, 52), p(74, 85), "ttb"),
  ], "er"),
  item("upper-s", "letter-upper", "S", [
    s(poly([
      curve(p(70, 28), p(70, 10), p(30, 10), p(30, 32)),
      curve(p(30, 32), p(30, 50), p(70, 46), p(70, 64)),
      curve(p(70, 64), p(70, 86), p(30, 86), p(30, 68)),
    ]), "curve"),
  ], "es"),
  item("upper-t", "letter-upper", "T", [
    ln(p(28, 20), p(72, 20), "ltr"),
    ln(p(50, 20), p(50, 85), "ttb"),
  ], "te"),
  item("upper-u", "letter-upper", "U", [
    s([
      ...poly([seg(p(25, 15), p(25, 62))]),
      ...arc(p(50, 62), 25, 180, 0, 20),
      ...poly([seg(p(75, 62), p(75, 15))]),
    ], "ttb"),
  ], "u"),
  item("upper-v", "letter-upper", "V", [
    ln(p(28, 15), p(50, 85), "ttb"),
    ln(p(50, 85), p(72, 15), "btt"),
  ], "ve"),
  item("upper-w", "letter-upper", "W", [
    s(poly([seg(p(22, 15), p(37, 85)), seg(p(37, 85), p(50, 45))]), "ttb"),
    s(poly([seg(p(50, 45), p(63, 85)), seg(p(63, 85), p(78, 15))]), "btt"),
  ], "we"),
  item("upper-x", "letter-upper", "X", [
    ln(p(28, 15), p(72, 85), "ttb"),
    ln(p(72, 15), p(28, 85), "ttb"),
  ], "eks"),
  item("upper-y", "letter-upper", "Y", [
    ln(p(28, 15), p(50, 50), "ttb"),
    ln(p(72, 15), p(50, 50), "btt"),
    ln(p(50, 50), p(50, 85), "ttb"),
  ], "ye"),
  item("upper-z", "letter-upper", "Z", [
    ln(p(28, 18), p(72, 18), "ltr"),
    ln(p(72, 18), p(28, 82), "ttb"),
    ln(p(28, 82), p(72, 82), "ltr"),
  ], "zet"),
];
