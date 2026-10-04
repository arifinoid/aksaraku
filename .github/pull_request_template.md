# Pull Request Template

**PRD**: (link to `docs/prd.md` or feature PRD — required)

## Summary
(Describe the change in 1-2 sentences)

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactor
- [ ] Docs
- [ ] CI/Infra
- [ ] Test

## Acceptance Criteria
(Each AC must use **Given/When/Then** format — required)

```gherkin
Feature: <Feature name from PRD>

  Scenario: <Happy path name>
    Given <precondition>
    When <action>
    Then <observable result>

  Scenario: <Edge case name>
    Given <precondition>
    When <action>
    Then <observable result>
```

## Verification Evidence
(Attach curl output, test logs, screenshots, build URL — required before review)

| Check | Evidence |
|-------|----------|
| Build |  |
| Unit tests |  |
| E2E tests (if applicable) |  |
| Lint / Typecheck |  |
| Manual verification |  |

## Checklist
- [ ] PRD link present and valid
- [ ] AC section complete with Given/When/Then
- [ ] All CI checks passing locally (`bun run build && bun test`)
- [ ] No hardcoded secrets / credentials
- [ ] No commented-out debug code
- [ ] Conventional commit messages (`type(scope): msg`)

## Reviewer Notes
(Any context for reviewers — known tradeoffs, follow-up TODOs, etc.)