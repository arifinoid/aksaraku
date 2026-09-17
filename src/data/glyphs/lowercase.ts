import type { ModuleItem } from "../../domain";
import { arc, curve, ellipse, item, ln, p, poly, s, seg } from "./primitives";

export const LOWERCASE: readonly ModuleItem[] = [
  item("lower-a", "letter-lower", "a", [
    s(ellipse(p(45, 64), 17, 21, -90, 270, 24), "curve"),
    ln(p(62, 43), p(62, 85), "ttb"),
  ], "a"),
  item("lower-b", "letter-lower", "b", [
    ln(p(30, 15), p(30, 85), "ttb"),
    s(ellipse(p(48, 64), 18, 21, -90, 270, 24), "curve"),
  ], "be"),
  item("lower-c", "letter-lower", "c", [
    s(poly([
      curve(p(66, 52), p(58, 40), p(34, 40), p(30, 64)),
      curve(p(30, 64), p(34, 88), p(58, 88), p(66, 76)),
    ]), "curve"),
  ], "ce"),
  item("lower-d", "letter-lower", "d", [
    s(ellipse(p(48, 64), 18, 21, -90, 270, 24), "curve"),
    ln(p(66, 15), p(66, 85), "ttb"),
  ], "de"),
  item("lower-e", "letter-lower", "e", [
    ln(p(32, 62), p(68, 62), "ltr"),
    s(poly([
      curve(p(68, 58), p(68, 40), p(34, 40), p(30, 62)),
      curve(p(30, 62), p(30, 86), p(60, 86), p(66, 74)),
    ]), "curve"),
  ], "e"),
  item("lower-f", "letter-lower", "f", [
    s(poly([
      curve(p(62, 22), p(56, 12), p(44, 12), p(44, 40)),
      seg(p(44, 40), p(44, 85)),
    ]), "ttb"),
    ln(p(34, 46), p(60, 46), "ltr"),
  ], "ef"),
  item("lower-g", "letter-lower", "g", [
    s(ellipse(p(48, 62), 18, 20, -90, 270, 24), "curve"),
    s(poly([
      seg(p(66, 42), p(66, 88)),
      curve(p(66, 88), p(66, 98), p(44, 98), p(44, 84)),
    ]), "ttb"),
  ], "ge"),
  item("lower-h", "letter-lower", "h", [
    ln(p(30, 15), p(30, 85), "ttb"),
    s(poly([
      curve(p(30, 54), p(34, 40), p(62, 40), p(62, 62)),
      seg(p(62, 62), p(62, 85)),
    ]), "ttb"),
  ], "ha"),
  item("lower-i", "letter-lower", "i", [
    ln(p(48, 42), p(48, 85), "ttb"),
    s(ellipse(p(48, 28), 4, 4, -90, 270, 12), "curve"),
  ], "i"),
  item("lower-j", "letter-lower", "j", [
    s(poly([
      seg(p(54, 42), p(54, 88)),
      curve(p(54, 88), p(54, 98), p(34, 98), p(34, 84)),
    ]), "ttb"),
    s(ellipse(p(54, 28), 4, 4, -90, 270, 12), "curve"),
  ], "je"),
  item("lower-k", "letter-lower", "k", [
    ln(p(30, 15), p(30, 85), "ttb"),
    ln(p(62, 44), p(34, 66), "ttb"),
    ln(p(42, 60), p(64, 85), "ttb"),
  ], "ka"),
  item("lower-l", "letter-lower", "l", [
    ln(p(48, 15), p(48, 85), "ttb"),
  ], "el"),
  item("lower-m", "letter-lower", "m", [
    ln(p(24, 42), p(24, 85), "ttb"),
    s(poly([
      curve(p(24, 54), p(28, 40), p(48, 40), p(48, 56)),
      seg(p(48, 56), p(48, 85)),
    ]), "ttb"),
    s(poly([
      curve(p(48, 54), p(52, 40), p(74, 40), p(74, 56)),
      seg(p(74, 56), p(74, 85)),
    ]), "ttb"),
  ], "em"),
  item("lower-n", "letter-lower", "n", [
    ln(p(30, 42), p(30, 85), "ttb"),
    s(poly([
      curve(p(30, 54), p(34, 40), p(62, 40), p(62, 60)),
      seg(p(62, 60), p(62, 85)),
    ]), "ttb"),
  ], "en"),
  item("lower-o", "letter-lower", "o", [
    s(ellipse(p(48, 64), 18, 21, -90, 270, 24), "curve"),
  ], "o"),
  item("lower-p", "letter-lower", "p", [
    ln(p(30, 42), p(30, 98), "ttb"),
    s(ellipse(p(48, 64), 18, 21, -90, 270, 24), "curve"),
  ], "pe"),
  item("lower-q", "letter-lower", "q", [
    s(ellipse(p(48, 64), 18, 21, -90, 270, 24), "curve"),
    ln(p(66, 42), p(66, 98), "ttb"),
  ], "ki"),
  item("lower-r", "letter-lower", "r", [
    ln(p(34, 42), p(34, 85), "ttb"),
    s(poly([curve(p(34, 56), p(38, 42), p(60, 42), p(64, 50))]), "ltr"),
  ], "er"),
  item("lower-s", "letter-lower", "s", [
    s(poly([
      curve(p(62, 52), p(62, 40), p(34, 40), p(34, 54)),
      curve(p(34, 54), p(34, 66), p(62, 64), p(62, 76)),
      curve(p(62, 76), p(62, 88), p(34, 88), p(34, 76)),
    ]), "curve"),
  ], "es"),
  item("lower-t", "letter-lower", "t", [
    s(poly([
      seg(p(46, 22), p(46, 74)),
      curve(p(46, 74), p(46, 88), p(64, 86), p(66, 78)),
    ]), "ttb"),
    ln(p(34, 44), p(60, 44), "ltr"),
  ], "te"),
  item("lower-u", "letter-lower", "u", [
    s([
      ...poly([seg(p(30, 42), p(30, 70))]),
      ...arc(p(46, 70), 16, 180, 0, 16),
      ...poly([seg(p(62, 70), p(62, 85))]),
    ], "ttb"),
  ], "u"),
  item("lower-v", "letter-lower", "v", [
    ln(p(30, 42), p(48, 85), "ttb"),
    ln(p(48, 85), p(66, 42), "btt"),
  ], "ve"),
  item("lower-w", "letter-lower", "w", [
    s(poly([seg(p(24, 42), p(36, 85)), seg(p(36, 85), p(48, 55))]), "ttb"),
    s(poly([seg(p(48, 55), p(60, 85)), seg(p(60, 85), p(72, 42))]), "btt"),
  ], "we"),
  item("lower-x", "letter-lower", "x", [
    ln(p(30, 42), p(66, 85), "ttb"),
    ln(p(66, 42), p(30, 85), "ttb"),
  ], "eks"),
  item("lower-y", "letter-lower", "y", [
    ln(p(30, 42), p(48, 80), "ttb"),
    s(poly([seg(p(66, 42), p(48, 80)), seg(p(48, 80), p(36, 98))]), "btt"),
  ], "ye"),
  item("lower-z", "letter-lower", "z", [
    ln(p(30, 45), p(66, 45), "ltr"),
    ln(p(66, 45), p(30, 82), "ttb"),
    ln(p(30, 82), p(66, 82), "ltr"),
  ], "zet"),
];
