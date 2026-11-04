# PRD: UI Revamp — Phase 3: Permainan

## 1. Problem Statement
The Permainan area still uses the pre-revamp `Screen` chrome and a flat tile
grid. The pen.dev file defines a dedicated hub (07 / D4), Cocokkan (08),
Pecahkan Balon (09), Mewarnai (10) and the shared completion card (17) that
the app does not implement.

## 2. User & Persona
- **Primary user**: a child aged 4–7 playing the three mini-games.
- **Pain point**: the hub has no visual hierarchy, the matching prompt and
  options are unstyled, and balloon/colouring give no progress feedback.

## 3. Scope (In Scope) — Phase 3
- New games hub (07 / D4): back pill + title + streak/stars/avatar meta,
  three coloured game cards (coral Cocokkan, sky Pecahkan Balon, mango
  Mewarnai) with icon, title, subtitle and "Mulai bermain" pill; desktop
  three-column row plus a progress card and a next-reward card; footer note.
- Cocokkan (08): mode pills, prompt card with big glyph, 3 option cards,
  correct/wrong feedback, "Soal x dari 5" chip.
- Pecahkan Balon (09): prompt with repeat button, 2×2 balloon grid with
  per-balloon colour, score row.
- Mewarnai (10): instruction, colouring canvas, 8-colour palette, sticker
  swatches, clear/undo/finish actions, painted counter.
- Shared GameSummary restyled to the new palette.
- All data from existing choice-game logic; no storage or domain change.

## 4. Non-Goals (Out of Scope)
- Collection, avatar and parent reporting (Phases 4–5).
- New game mechanics.

## 5. Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Hub matches design | 3 coloured cards, no overflow | screenshot |
| Games render | each game header + controls visible | screenshot |
| Quality gates | typecheck + tests + build | CI |

## 6. Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Rewriting `GamesScreen` breaks e2e selectors | Med | Low | keep `.games__hub`, `.option-card`, `.balloon`, `.coloring__svg`, `canvas` |
| Balloon animation jank on low-end | Low | Low | keep existing keyframes |

## 7. Acceptance Criteria (Given/When/Then)
- **Given** a profile exists and the viewport is 1440×900
- **When** the child opens Permainan
- **Then** the sidebar, the title, the three game cards and the progress /
  next-reward cards are visible without horizontal scrolling
- **Given** the viewport is 390×844
- **When** Permainan renders
- **Then** the back pill, the three stacked game cards and the footer note fit
  the screen
- **Given** a game is opened
- **When** it renders
- **Then** its header, prompt, options and controls are visible and the back
  pill returns to the hub
- **Given** the branch is checked out
- **When** `bunx tsc --noEmit`, `bun test src` and `bun run build` run
- **Then** all three exit 0

## 8. Dependencies
- Existing domain: `useChoiceGame`, `balloonCandidates`, `coloringScore`.
- Existing i18n keys in `games.*`.

## 9. Rollout Plan
- Ship Phase 3 behind a normal PR; verify with screenshots at 1440×900 and
  390×844.

## 10. Rollback Plan
- Revert the single squash commit; no storage or schema change is involved.
