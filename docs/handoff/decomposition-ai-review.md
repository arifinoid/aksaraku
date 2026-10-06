# Decomposition: AI Code Review Gate

Source: `docs/prd.md` (AI Code Review Automation), `docs/specs/spec-ai-review.md`,
`docs/adr/adr-001-ai-code-review-gate.md`. Repo state at split time: `main` @ `9397cb4`,
CI has `build-test` + `ai-review` + `deploy` jobs; `.github/ai-review-prompt.md` and
`.github/scripts/build_review_prompt.py` exist on disk but UNTRACKED (fresh CI checkout
fails at "Build review prompt" — gap G1).

## Epic 1: Gate is committed and green (Phase 1 warn-only)
Owner: devops. Estimate: 1 session (S).
Tasks:
- [ ] OPS-1: Commit untracked review files via branch→PR→merge, verify CI green — `devops` — S — AC: acceptance-ai-review.md Scenario "Missing prompt files"

## Epic 2: Gate logic hardened (fail-closed, no fragile parsing)
Owner: backend-dev. Estimate: 1 session (S, 2 sub-tasks in one card).
Tasks:
- [ ] BE-1: Harden `build_review_prompt.py` (argv validation, missing-file errors, unit test) — `backend-dev` — S — AC: R4 + Scenario "Reviewer prompt build"
- [ ] BE-2: Harden verdict-parse step in `ci.yml` (drop `grep -A 100 '^{' | head -20`, parse robustly) — `backend-dev` — S — AC: R4 + Scenario "Verdict parse"

## Epic 3: Gate proven with evidence (tests + dummy PR)
Owner: qa-engineer. Estimate: 1 session (S).
Tasks:
- [ ] QA-1: Test plan for R1–R5 + dummy-PR verification with tool-output evidence — `qa-engineer` — S — AC: all Scenarios in acceptance-ai-review.md

## Epic 4: Review UX renders correctly, zero bundle impact
Owner: frontend-dev. Estimate: 0.5 session (XS).
Tasks:
- [ ] FE-1: Verify PR template + review-comment markdown render; confirm `bun run build` output unchanged — `frontend-dev` — XS — AC: Scenario "Review comment renders"

## Out of scope (per PRD Non-Goals)
- Phase 2 blocking (branch protection requiring `ai-review`) — needs owner approval, separate card.
- Phase 3 auto-merge. Autonomous merge approval (never).
- New review microservice (ADR rejected). Local pre-commit hook (ADR rejected).

## Traceability
Every task maps to spec section 11 rules R1–R5 and PRD section 7 AC. Contract frozen for all
cards: verdict JSON `{passed, security_concerns[], logic_errors[], suggestions[], summary}`;
fail-closed (any parse/build failure → `exit 1`); flag `REVIEW_GATE_ENABLED` repo variable,
default `false`; diff truncate ceiling 15k chars (`ponytail` in script).
