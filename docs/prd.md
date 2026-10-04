# PRD: AI Code Review Automation

## 1. Problem Statement
AI team generates code rapidly but reviews are inconsistent. No standardized gate against PRD + acceptance criteria before merge. Risk of false-done (3 incidents before) and low code quality slipping through.

## 2. User & Persona
- **Primary user**: AI engineers (backend-dev, frontend-dev) generating PRs daily
- **Secondary user**: QA engineer reviewing PRs, Kentung (lead) approving merges
- **Pain point**: Manual PRD/AC check is slow; auto-review would speed flow; need block-on-fail to prevent bad merges

## 3. Scope (In Scope)
- Auto-review pipeline: every new PR triggers security scan + logic error check vs PRD + AC
- PRD link embed requirement in PR template
- Acceptance Criteria (Given/When/Then) validation auto-check
- Merge block if AC not passed OR reviewer flags issues
- ADR for key decisions (review strategy, block conditions)
- Integration with existing CI (already in `.github/workflows/ci.yml`)

## 4. Non-Goals (Out of Scope)
- Full autonomous merge approval (human reviewer always final say)
- Replacing existing CI entirely — only adding gate checks
- Writing production code beyond tiny spikes/reviewer subagent

## 5. Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| PRs with PRD link | 100% | GitHub template check |
| PRs passing auto-review | > 90% | CI status badge |
| False-done incidents | 0 | Tracking log |
| Avg review cycle time | < 24h | From PR open → merge |

## 6. Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Auto-review false negatives | Med | High | Independent reviewer subagent (fail-closed); human override always available |
| AC format drift | High | Medium | Enforce Given/When/Then in template; lint AC section |
| PRD drift from implementation | Med | High | ADR links PRD↔Spec↔PR; any drift triggers re-review |

## 7. Acceptance Criteria (Given/When/Then)
- **Given** a PR is opened with `docs/prd.md` link in description
- **When** the CI pipeline runs `bun run build && bun test`
- **Then** auto-review subagent scans diff for security + logic errors vs AC
- **And** If any `security_concerns` non-empty → merge blocked
- **And** If any `logic_errors` non-empty → merge blocked  
- **And** If AC format invalid → comment warning, block merge
- **And** If all clean → merge approved (human final)

## 8. Dependencies
- Internal: `planner` (PRD), `backend-dev` (API), `frontend-dev` (UI), `qa-engineer` (test)
- External: GitHub Actions, Hermes Agent subagent for reviewer

## 9. Rollout Plan
- Phase 1: Add PR template + ADR-001 (current sprint) — auto-review runs, manual approve
- Phase 2: Block merge if AC fail or security issues — next sprint
- Phase 3: Full auto-merge gating — following sprint after

## 10. Rollback Plan
- Feature flag: `REVIEW_GATE_ENABLED` in `.env`
- Rollback trigger: gate fails critically → set flag=false, merge re-enables
- Rollback steps: 1) Disable flag, 2) Re-merge blocked PRs, 3) Postmortem ADR

## Links
- Spec: `docs/specs/spec-ai-review.md`
- ADR: `docs/adr/adr-001-ai-code-review-gate.md`
- PR template: `.github/pull_request_template.md`