# PRD: UI Revamp — Phase 4: Koleksi & Karakter

## 1. Problem Statement
Koleksi Hadiah and Karakterku still use the pre-revamp `Screen` chrome and a
flat grid. The pen.dev file defines dedicated screens (11–12 / D5–D6) that
the app does not implement.

## 2. User & Persona
- **Primary user**: a child aged 4–7 checking rewards and customising avatar.
- **Pain point**: rewards are a flat list with no progress summary; avatar
  options are cramped and the preview is small.

## 3. Scope (In Scope) — Phase 4
- Koleksi (11 / D5): back pill, title, summary chip, kind tabs, reward grid
  with locked/unlocked cards, footer note; desktop header with meta pills.
- Karakter (12 / D6): back pill, title, 3D preview card, colour/ears/eyes/
  accessory sections with swatches, footer note; desktop two-column layout.
- All data from existing rewards/avatar logic; no storage or domain change.

## 4. Non-Goals (Out of Scope)
- Parent reporting and landing (Phase 5).

## 5. Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Screens match design | no overflow | screenshot |
| Quality gates | typecheck + tests + build | CI |

## 6. Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 3D avatar bundle size | Low | Low | already lazy-loaded |

## 7. Acceptance Criteria (Given/When/Then)
- **Given** a profile exists and the viewport is 1440×900
- **When** the child opens Koleksi / Karakter
- **Then** the sidebar, title, content and preview are visible without
  horizontal scrolling
- **Given** the viewport is 390×844
- **When** the screens render
- **Then** the back pill and content fit (minor scroll allowed for avatar)
- **Given** the branch is checked out
- **When** `bunx tsc --noEmit`, `bun test src` and `bun run build` run
- **Then** all three exit 0

## 8. Dependencies
- Existing domain: reward definitions, avatar parts.

## 9. Rollout Plan
- Ship Phase 4 behind a normal PR.

## 10. Rollback Plan
- Revert the single squash commit.
