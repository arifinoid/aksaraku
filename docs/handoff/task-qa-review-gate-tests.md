# Task Handoff: QA-1 — Test plan + dummy-PR verification for review gate

## Goal
R1–R5 proven with tool-output evidence, not claims. Test plan file + verification log on the card.

## Input (paths)
- `docs/prd.md` §5 (metrics), §7 (AC)
- `docs/specs/spec-ai-review.md` §10 (testing strategy), §11 (R1–R5)
- `docs/handoff/acceptance-ai-review.md` (all 10 scenarios — each needs a verdict)
- `.github/workflows/ci.yml`, `.github/pull_request_template.md`

## Frozen contract (do not renegotiate)
- Verdict JSON `{passed, security_concerns[], logic_errors[], suggestions[], summary}`; fail-closed.
- `REVIEW_GATE_ENABLED` default `false`; Phase 2 (blocking) out of scope for verification.

## Deliverables
1. `docs/test-plans/review-gate-test-plan.md` — map each R1–R5 + each acceptance scenario to:
   Given/When/Then, how to trigger (exact `gh` command or PR fixture), expected observable.
2. Verification runs (after OPS-1 + BE merged to main; if not merged yet, do plan now and note
   verification as blocked-on-card):
   - R1: open/borrow PR with no `PRD:` line → capture failing step log.
   - R2–R3: PR body without AC section / without `Then` → capture failing log.
   - Flag-off: `ai-review` skips reviewer with notice, R1–R3 still enforced.
   - If owner grants a throwaway repo/branch: R4 with `REVIEW_GATE_ENABLED=true` (needs approval — ask, do not self-authorize spend/quota burn).
3. Kanban comment: per-scenario PASS/FAIL table with CI run URLs / pasted step output.

## Done when
- [ ] Test-plan file exists and covers all 10 acceptance scenarios
- [ ] Every automated-checkable scenario has attached evidence (CI URL or log excerpt)
- [ ] False-done metric baseline noted (3 prior incidents; this gate must show 0 on verified PRs)

## Constraints
- "Trust me" = rejected: no PASS without pasted output or URL.
- Quota 402/429 → STOP, report, do not fake green.
- No destructive actions; dummy PRs closed after verification, not merged.
- Max 2 fix loops, then escalate with evidence.
