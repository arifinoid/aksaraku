# Dependency Map: AI Code Review Gate

## Parallel Groups

### Group A (Priority 40 — first, unblocks everything)
- OPS-1: Commit untracked review files, CI green (`devops`)

### Group B (Priority 30 — after Group A merges to main)
- BE-1/BE-2: Prompt-builder + verdict-parse hardening (`backend-dev`) ← needs OPS-1 merged (files tracked)
- QA-1a: Test plan written from PRD/spec R1–R5 (`qa-engineer`) ⟂ parallel with BE (plan needs no code)
- FE-1: Template/comment render check (`frontend-dev`) ⟂ parallel with BE

### Group C (after Group B)
- QA-1b: Dummy-PR verification runs ← needs BE merged (hardened gate is what gets verified)
- Phase 2 enable (branch protection) — NEW card, owner approval required, NOT in this batch

## Critical Path
OPS-1 → BE-1/BE-2 → QA-1b (longest chain, 3 cards)

## Soft deps (easier-after, not blocking)
- QA-1b easier after FE-1 (comment-format expectations known)
- BE-2 easier after OPS-1 CI logs show real reviewer output shape

## External Blockers
- None for Phase 1. Phase 2 needs owner decision (human final per PRD Non-Goals).
- Quota note: `ai-review` Hermes call uses 9Router (`arifinoid-hermes-combo`); if CI hits 402/429, STOP and report — do NOT fake green.

## Notation
`A → B` = B blocked by A. `A ⟂ B` = parallel-safe (different files, contract-frozen).
Contract both sides share (decided, do not renegotiate): verdict JSON
`{passed, security_concerns[], logic_errors[], suggestions[], summary}`; fail-closed;
`REVIEW_GATE_ENABLED` default `false`; 15k diff truncate.
