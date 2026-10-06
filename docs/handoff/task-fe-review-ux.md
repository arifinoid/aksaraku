# Task Handoff: FE-1 — Review UX renders, zero bundle impact (XS)

## Goal
Human-facing surfaces of the gate read correctly and the change ships zero bytes to `dist/`.

## Input (paths)
- `.github/pull_request_template.md` (checklist + Gherkin block render)
- `.github/workflows/ci.yml` "Post review comment" step (verdict markdown shape)
- AC: `docs/handoff/acceptance-ai-review.md` Scenarios "Review comment renders", "Zero bundle impact"

## Frozen contract (do not renegotiate)
- Verdict JSON `{passed, security_concerns[], logic_errors[], suggestions[], summary}`; fail-closed.

## Deliverables
1. Render check: confirm PR template checklist/Gherkin fence and a sample review comment
   (verdict + summary + counts + `<details>` JSON block) read correctly on github.com —
   use the OPS-1 PR's real comment if present, else paste the step's markdown into a scratch
   gist/issue preview and screenshot.
2. No-impact proof: `bun run build` exit 0 and `dist/` identical to main for `.github/`+`docs/`-only
   diff (`git status --short dist/` clean / checksum compare); `bunx tsc --noEmit` exit 0.
3. If the comment markdown is hard to scan (verdict below the fold), propose the minimal template
   tweak as a follow-up suggestion on the card — do NOT bundle unrelated workflow edits.
4. Small fix only if needed, via branch → PR → merge (AGENTS.md). No `push origin main`.

## Done when
- [ ] Screenshot or URL proving readable verdict comment attached to card
- [ ] Build/typecheck output pasted; `dist/` unchanged confirmed
- [ ] Card notes either "no change needed" or one concrete follow-up tweak

## Constraints
- Read-only unless a one-line markdown fix is justified; no workflow-logic edits (that's BE/OPS).
- Max 2 fix loops, then escalate with evidence.
