# PRD: UI Revamp — Foundation & Beranda

## 1. Problem Statement
The shipped UI is a single-column, phone-shaped layout that leaves a 1440px
desktop window mostly empty, uses a different palette from the 2026 brand
tokens, and relies on emoji instead of the lucide line icons used in the
design. The pen.dev file (`aksaraku.pen`) defines 24 phone screens and 9
desktop screens; nothing in the app implements that frame yet.

## 2. User & Persona
- **Primary user**: a child aged 4–7 opening the app on a phone or a shared
  family desktop.
- **Secondary user**: a parent who opens the reporting screens.
- **Pain point**: on desktop the child sees four cropped cards and a large
  empty canvas; navigation between learning areas and parent reporting is
  not visible at all.

## 3. Scope (In Scope) — Phase 0 + 1
- Design tokens from the pen.dev file: cream canvas, plum ink, one hue per
  learning area, mango/grape/sky/leaf soft pairs.
- `Icon` wrapper and lucide-react for line icons.
- `AppShell`: 236px desktop sidebar (brand, BELAJAR nav, ORANG TUA nav,
  offline status, child card, switch-child link), hidden below 900px.
- Routes given a typed `RouteName`; the sidebar deep-links to the parent
  report behind the existing gate.
- Rebuilt Beranda: desktop hero ("Lanjutkan belajar", progress, CTA, 3D
  character), streak/stars pills, four tinted menu tiles, progress card,
  next-reward card; phone layout with greeting, stats, 2×2 grid, reward
  teaser and switch-child row.
- Real data everywhere: mastery, stars, per-kind totals, streak from mastery
  timestamps, next reward requirement.
- RTL Arabic layout, powered by logical CSS properties.
- Existing screens keep working inside the new frame (padding/max-width).

## 4. Non-Goals (Out of Scope)
- Screens 03–24 and D2–D9 are not restyled yet (Phases 2–5).
- No change to the parental gate, storage, or domain logic.
- No new mascot artwork; the 3D character is reused.

## 5. Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Desktop layout uses the full frame | sidebar + 1132px content at 1440 | screenshot |
| Palette matches design tokens | 100% of new CSS uses variables | grep for hex in `home.css` |
| Home data is real | no hard-coded counts | review |
| RTL has no mirrored-layout bugs | grid, sidebar, arrows mirror | Arabic screenshot |
| Quality gates | typecheck + 244 tests + build | CI |

## 6. Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Emoji-to-lucide swap breaks e2e selectors | High | Low | selectors updated to `.home__grid` / `button.home-tile` |
| 3D hero costs a WebGL context on low-end phones | Med | Med | hero is desktop-only, scene is lazy, flat emoji on small chips |
| Bright coral hero fails WCAG AA for small white text | Med | Med | kept design colours; hints and labels darkened to pass 4.5:1, hero contrast tracked for Phase 5 |

## 7. Acceptance Criteria (Given/When/Then)
- **Given** a profile exists and the viewport is 1440×900
- **When** the child opens Beranda
- **Then** the 236px sidebar and the hero, four tiles and two progress cards are visible and none of them overlap or overflow
- **And** the streak, stars, mastered counts and next-reward progress come from the stored mastery rows
- **Given** the viewport is 390×844
- **When** Beranda renders
- **Then** the sidebar is absent and the greeting, stats row, 2×2 tile grid, reward teaser and switch-child row fit without horizontal scrolling
- **Given** the profile locale is Arabic
- **When** Beranda renders
- **Then** `dir="rtl"`, the sidebar sits on the right, the grid reads right-to-left and directional arrows are mirrored
- **Given** the branch is checked out
- **When** `bunx tsc --noEmit`, `bun test src` and `bun run build` run
- **Then** all three exit 0

## 8. Dependencies
- `lucide-react` (new dependency, tree-shaken icons).
- Existing domain data: `GLYPH_ITEMS`, `masteryLevel`, `requirementProgress`.

## 9. Rollout Plan
- Ship Phase 0 + 1 behind a normal PR; verify with screenshots at 1440×900,
  1024×900, 768×900, 390×844, 360×800 and Arabic at both widths.
- Phases 2–5 follow as separate PRs on top of this foundation.

## 10. Rollback Plan
- Revert the single squash commit; no storage or schema change is involved,
  so user data is unaffected.
