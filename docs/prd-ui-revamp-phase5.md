# PRD: UI Revamp — Phase 5: Orang Tua & Pratinjau

## 1. Problem Statement
The parent area, progress report and glyph preview still use the pre-revamp
`Screen` chrome. The pen.dev file defines dedicated screens (13–15, 23–24 /
D7–D9) that the app does not implement.

## 2. User & Persona
- **Primary user**: a parent managing the app and reviewing progress.
- **Pain point**: the parent area is a long unstyled form; the report and
  preview are not framed by the desktop shell.

## 3. Scope (In Scope) — Phase 5
- Parent area (13–14 / D7–D9): back pill, title, subtitle, panels for
  progress, screen time, settings, children, preview; lucide icons.
- Glyph preview (23): back pill, title, per-category grids.
- All data from existing logic; no storage or domain change.

## 4. Non-Goals (Out of Scope)
- Landing page (Phase 6, optional).

## 5. Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Screens match design | no overflow | screenshot |
| Quality gates | typecheck + tests + build | CI |

## 6. Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Parent gate UX change | Low | Low | gate logic untouched |

## 7. Acceptance Criteria (Given/When/Then)
- **Given** a profile exists and the viewport is 1440×900
- **When** the parent area or preview renders
- **Then** the sidebar and content are visible without horizontal scrolling
- **Given** the branch is checked out
- **When** `bunx tsc --noEmit`, `bun test src` and `bun run build` run
- **Then** all three exit 0

## 8. Dependencies
- Existing parent/report/preview logic.

## 9. Rollout Plan
- Ship Phase 5 behind a normal PR.

## 10. Rollback Plan
- Revert the single squash commit.
EOF
