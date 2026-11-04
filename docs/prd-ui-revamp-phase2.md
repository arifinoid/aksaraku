# PRD: UI Revamp — Phase 2: Ayo Menulis

## 1. Problem Statement
The Ayo Menulis area still uses the pre-revamp `Screen` chrome, a flow of
horizontal tabs and a flat glyph grid, and emoji-only status labels. The pen.dev
file defines a dedicated picker (03 / D2), three tracing variants (04–06 / D3)
and a completion card (17) that the app does not implement.

## 2. User & Persona
- **Primary user**: a child aged 4–7 practising letter/number/shape tracing.
- **Pain point**: the picker has no sense of progress per category, the
  tracing screen gives no hint about the current stroke, and nothing celebrates
  a finished glyph.

## 3. Scope (In Scope) — Phase 2
- New Ayo Menulis picker: back pill + title + streak/stars/avatar meta, pill
  tabs, progress row (mastered/total + unit count), 4× (mobile) / 9×
  (desktop) tinted glyph grid with mastery dot + level label, desktop
  "Rekomendasi untuk {name}" row, touch hint.
- Three tracing variants, each with its own header, canvas card, stroke
  progress, hint and controls:
  - Letters (04 / D3): word card "A untuk Apel", numbered stroke bars,
    mascot tip, "Selesai" + reset.
  - Digits (05): number strip 1–10, "Angka N" title, counter chip,
    lightbulb hint, "Lanjut ke angka N" primary.
  - Shapes (06): shape chooser row, fun-fact card, "Selesai" primary.
- Desktop reflow: canvas on the left, right rail with word/stroke/tip/
  progress/actions cards.
- Completion card (17): confetti, avatar, "Hebat, {name}!", stars, chips,
  "Lanjut ke …" primary, "Ulangi …" and "Warnai …" ghosts.
- All data from existing mastery/rewards context; no storage or domain change.

## 4. Non-Goals (Out of Scope)
- Games hub and the three mini-games (Phase 3).
- Collection, avatar and parent reporting restyle (Phases 4–5).
- New mascot artwork; the 3D character is reused only where already shown.

## 5. Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Picker matches design | 4-col (mobile) / 9-col (desktop) grid, no overflow | screenshot |
| Tracing variants render | 3 distinct headers + controls | screenshot |
| Completion card renders | confetti + stars + next/retry actions | screenshot |
| Quality gates | typecheck + tests + build | CI |

## 6. Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Rewriting `PlayScreen` breaks e2e selectors | High | Low | keep `.play__tabs`, `.play__tab`, `.glyph-card` and `canvas` selectors |
| Tracing canvas sizing feedback loop | Med | Med | explicit host height per variant, no aspect-ratio auto |
| Emoji missing in badge | Low | Low | use the object emoji already shipped in `OBJECTS` |

## 7. Acceptance Criteria (Given/When/Then)
- **Given** a profile exists and the viewport is 1440×900
- **When** the child opens Ayo Menulis
- **Then** the sidebar, the "Ayo Menulis" title, the pill tabs, the progress
  row and the 9-column glyph grid are visible without horizontal scrolling
- **And** the "Rekomendasi untuk {name}" row shows three not-yet-mastered
  glyphs
- **Given** the viewport is 390×844
- **When** Ayo Menulis renders
- **Then** the back pill, tabs, progress row and 4-column grid fit the screen
- **Given** a letter glyph is opened
- **When** the tracing screen renders
- **Then** the word card, the canvas, the stroke bars, the mascot tip and the
  reset/finish controls are visible, and the desktop layout shows the canvas
  beside the right rail
- **Given** a digit or shape glyph is opened
- **When** the tracing screen renders
- **Then** the digit strip / shape chooser and the matching hint are visible
- **Given** the child finishes tracing
- **When** the completion card appears
- **Then** the avatar, title, stars, chips and "Lanjut ke …"/"Ulangi …"
  actions are visible
- **Given** the branch is checked out
- **When** `bunx tsc --noEmit`, `bun test src` and `bun run build` run
- **Then** all three exit 0

## 8. Dependencies
- Existing domain: `GLYPH_CATEGORIES`, `itemsByKind`, `masteryLevel`,
  `scoreSession`, `TracingCanvas`.
- Existing i18n keys in `play.*`.

## 9. Rollout Plan
- Ship Phase 2 behind a normal PR; verify with screenshots at 1440×900 and
  390×844 (picker, letter, digit, shape, completion) and Arabic at 390×844.

## 10. Rollback Plan
- Revert the single squash commit; no storage or schema change is involved.
