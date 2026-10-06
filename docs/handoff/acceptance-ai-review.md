# Acceptance Criteria: AI Code Review Gate

Traceable to PRD `docs/prd.md` §7 and spec `docs/specs/spec-ai-review.md` §11 (R1–R5).

```gherkin
Feature: AI Code Review Gate (Phase 1 warn-only)

  Scenario: Missing prompt files (gap G1)
    Given a fresh `git clone` of the repo at main
    When the `ai-review` CI job reaches "Build review prompt"
    Then `.github/ai-review-prompt.md` and `.github/scripts/build_review_prompt.py` exist
    And the step exits 0

  Scenario: PR without PRD link (R1)
    Given a PR whose body has no `PRD:` line
    When the `ai-review` job runs
    Then the "Validate PRD link exists" step exits 1 with `::error::PRD link missing`

  Scenario: PR without AC section (R2–R3)
    Given a PR body with no `## Acceptance Criteria` or no Given/When/Then keywords
    When the `ai-review` job runs
    Then the "Validate AC format" step exits 1 naming the missing keyword

  Scenario: Reviewer prompt build
    Given a template, an existing PRD path, and a diff file
    When `python3 .github/scripts/build_review_prompt.py <t> <p> <d> <o>` runs
    Then exit 0 and output contains PRD content + diff (truncated at 15k with `[TRUNCATED]`)
    And wrong argv or missing input file exits non-zero with a message on stderr

  Scenario: Verdict parse
    Given reviewer stdout containing the verdict JSON plus log noise
    When the "Parse reviewer verdict" step runs
    Then `passed`, `security_count`, `logic_count`, `summary` outputs are correct
    And invalid JSON exits 1 (fail-closed, never defaults to pass)

  Scenario: Security concern blocks (R4, flag on)
    Given `REVIEW_GATE_ENABLED=true` and verdict has non-empty `security_concerns`
    When the gate finishes
    Then a `REQUEST CHANGES`-equivalent comment posts and the job exits 1

  Scenario: Clean review passes (R4, flag on)
    Given `REVIEW_GATE_ENABLED=true` and empty `security_concerns` + `logic_errors`
    When the gate finishes
    Then an `APPROVED`-equivalent comment posts and the job exits 0

  Scenario: Gate disabled still enforces AC (flag off)
    Given `REVIEW_GATE_ENABLED` unset or `false`
    When the `ai-review` job runs
    Then R1–R3 checks still run and block on failure
    And Hermes reviewer steps are skipped with a logged notice

  Scenario: Review comment renders
    Given a posted review comment with verdict, counts, and `<details>` JSON block
    When viewed on github.com
    Then verdict line, summary, and counts are readable without opening `<details>`

  Scenario: Zero bundle impact
    Given only `.github/` + `docs/` changes on the branch
    When `bun run build` and `bun test src` run
    Then both exit 0 and `dist/` output is byte-identical to main (CI-only change)
```

## AC Quality Check
- [x] One `When` per scenario
- [x] `Then` assertable true/false (exit codes, file existence, rendered output)
- [x] No implementation detail in user-visible outcomes
- [x] Happy path (Clean review) + 8 edge cases
- [x] Each scenario traces to R1–R5 / PRD §7
