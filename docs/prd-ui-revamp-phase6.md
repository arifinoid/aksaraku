# PRD: UI Revamp — Phase 6: Landing (Opsi A)

## 1. Problem Statement
The public landing page (`landing.html` / `src/landing.tsx`) predates the
2026 design tokens. The pen.dev file defines 01 · Onboarding & Bahasa; the
landing page is its public entry point, so it should share the brand
identity: cream canvas, plum ink, Baloo 2, coral CTAs.

## 2. User & Persona
- **Primary user**: a parent landing on the install page.
- **Pain point**: landing uses the old palette and card geometry, so it
  looks unrelated to the app.

## 3. Scope (In Scope) — Phase 6 (Opsi A)
- Restyle landing to the pen.dev tokens (cream, plum, Baloo 2, coral CTA,
  18–20px radii).
- Fix 390px overflow in the nav actions.
- Keep install flow, i18n (id/en/ar), PWA logic unchanged.

## 4. Non-Goals (Out of Scope)
- In-app onboarding screen (Opsi B — not chosen).

## 5. Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Landing matches tokens | same palette as app | screenshot |
| No overflow at 390px | doc width ≤ viewport | overflow check |
| Quality gates | typecheck + tests + build | CI |

## 6. Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Install flow XML/tests break | Low | Med | logic untouched |

## 7. Acceptance Criteria (Given/When/Then)
- **Given** the landing page at 1440×900 and 390×844
- **When** it renders
- **Then** it uses the pen.dev palette and type, and there is no horizontal
  overflow at 390px
- **Given** the branch is checked out
- **When** `bunx tsc --noEmit`, `bun test src` and `bun run build` run
- **Then** all three exit 0

## 8. Dependencies
- Existing install/locale logic.

## 9. Rollout Plan
- Ship Phase 6 behind a normal PR.

## 10. Rollback Plan
- Revert the single squash commit.
EOF
