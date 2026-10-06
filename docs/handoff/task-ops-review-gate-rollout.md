# Task Handoff: OPS-1 — Commit review-gate files, CI green (Phase 1)

## Goal
`.github/ai-review-prompt.md` + `.github/scripts/build_review_prompt.py` are tracked on `main`
and the `ai-review` job passes on a test PR with `REVIEW_GATE_ENABLED` unset (warn-only path).

## Input (paths)
- `.github/workflows/ci.yml` (committed, references both files)
- `.github/ai-review-prompt.md` (ON DISK, UNTRACKED — gap G1)
- `.github/scripts/build_review_prompt.py` (ON DISK, UNTRACKED — gap G1)
- `.github/pull_request_template.md` (tracked, no change needed)
- AC: `docs/handoff/acceptance-ai-review.md` Scenarios "Missing prompt files", "Gate disabled still enforces AC"

## Frozen contract (do not renegotiate)
- Verdict JSON `{passed, security_concerns[], logic_errors[], suggestions[], summary}`; fail-closed.
- `REVIEW_GATE_ENABLED` repo variable default `false` (Phase 1). Do NOT set `true` — Phase 2 needs owner approval.
- Diff truncate ceiling 15k (`ponytail` stays).

## Deliverables
1. Branch `feat/review-gate-tracked` from `main` → commit both files → push → `gh pr create` → merge via squash (AGENTS.md workflow; NEVER `git push origin main`).
2. CI run on that PR shows `ai-review` reaching at least "Check gate flag" with `enabled=false` notice (proves G1 fixed).
3. Comment on this Kanban card: PR URL + CI run URL + `REVIEW_GATE_ENABLED` current value (`gh variable list`).

## Done when
- [ ] Fresh-clone equivalent check passes: `git ls-files .github/ai-review-prompt.md .github/scripts/build_review_prompt.py` lists both
- [ ] `bun run build`, `bun test src`, `bunx tsc --noEmit` exit 0 (verification standard)
- [ ] PR merged, branch deleted
- [ ] Phase-2 branch-protection setup documented as a NEW blocked card proposal (do not implement)

## Constraints
- Quota 402/429 on Hermes call → STOP, report, do not fake green.
- Never print/log/commit secrets. No production touch (no Pages deploy change).
- Max 2 fix loops on same failure, then escalate with evidence.
