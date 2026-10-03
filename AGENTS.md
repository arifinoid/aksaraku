# AGENTS.md — Aksaraku Workflow Rules (MANDATORY)

**Applies to: ALL agents, ALL models, ALL providers, ALL sessions.**  
No exceptions. If you don't understand → ASK Tung (Rohmad). Do not assume.

---

## 1. GIT WORKFLOW (NON-NEGOTIABLE)

| Step | Action | Required |
|------|--------|----------|
| 1 | `git checkout -b feat/short-desc` | ✅ MUST branch from `main` |
| 2 | Commit changes (`git commit -m "type(scope): msg"`) | ✅ Conventional commits |
| 3 | `git push -u origin feat/short-desc` | ✅ Push branch |
| 4 | Open PR via `gh pr create` | ✅ PR required |
| 5 | Wait for review/approval | ✅ No self-merge without review |
| 6 | `gh pr merge --squash --delete-branch` | ✅ Squash + delete branch |

**FORBIDDEN:** `git push origin main` directly. **Zero tolerance.**  
Previous violation: commit `fdbeadb` (React #310 fix) pushed straight to main — **never again.**

---

## 2. TASK EXECUTION PROTOCOL

**Kantung (coordinator) → routes to correct profile:**
- `planner` → spec/design tasks
- `backend-dev` → API/data/storage
- `frontend-dev` → UI/React/PixiJS
- `qa-engineer` → test/device checklist
- `devops` → infra/CI/deploy

**Each task:** Kanban card → assigned profile → worker spawns in isolated workspace → branch → PR → review → merge.

**Verification:** Every claim must have tool output proof (curl, build log, test result). "Trust me" = rejected.

---

## 3. MODEL/PROVIDER SWITCHING RULES

When model/provider changes (9Router ↔ OpenRouter ↔ llm-kita.com ↔ local):

1. **This AGENTS.md stays active** — rules don't reset
2. **Fallback chain** in `/home/ubuntu/.hermes/config.yaml`:
   ```yaml
   fallback_providers: [9Router, OpenRouter, llm-kita.com]
   ```
3. **Profile configs** in `/home/ubuntu/.hermes/profiles/{role}/config.yaml` — each role has its own `system_prompt` + `llm_config`
4. **If quota exhausted (402/429):** STOP. Report to Tung. Do NOT fake completion.
5. **If unsure about rule interpretation:** ASK Tung. Do not guess.

---

## 4. VERIFICATION STANDARDS

| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Build | `bun run build` | Exit 0, dist/ generated |
| Deploy | `curl -I https://aksaraku.pages.dev/app/` | HTTP 200 |
| Lint | `bunx tsc --noEmit` | No new errors |
| Test | `bun test` | All pass |

**Screenshot/video evidence** required for UI changes.

---

## 5. BUG FIX WORKFLOW

1. Reproduce → identify root cause (code trace)
2. Minimal fix (shortest diff)
3. Build + verify locally
4. Branch → PR → review → merge
5. Deploy → verify live URL

**No drive-by fixes.** Every fix traced to source.

---

## 6. COMMUNICATION STYLE

- Casual Indonesian: `gw` (I), `lu` (you), `Tung` (assistant)
- Terse, caveman style — no fluff
- Technical substance exact
- No invented abbreviations

---

## 7. ESCALATION

**Blocked on quota?** → Report to Tung, wait for top-up.  
**Rule unclear?** → Ask Tung.  
**Agent claims done but no proof?** → Reject, demand verification.

---

**Last updated:** 2026-10-03  
**Authority:** Tung (Rohmad Arifin) — sole decision maker on rule changes.