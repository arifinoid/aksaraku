# Runbook — Deploy & Rollback (Cloudflare Pages)

> Scenario: deploying Aksaraku to production, and rolling back a bad deploy.
> Owner: `@devops`

---

## Deploy

### Method 1 — CI/CD (preferred)

Push to `main` triggers automatic deploy:

```bash
git push origin main
```

The GitHub Actions pipeline (`.github/workflows/ci.yml`) runs:
1. Typecheck (`bunx tsc --noEmit`)
2. Tests (`bun test`)
3. Build (`NODE_ENV=production bun run build`)
4. Deploy (`wrangler pages deploy dist --project-name=aksaraku`)

**Prerequisite (one-time)**: GitHub repo secrets
- `CLOUDFLARE_API_TOKEN` — from https://dash.cloudflare.com/profile/api-tokens
  (template "Edit Cloudflare Workers" or custom with Pages:Edit)
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare dashboard sidebar

Monitor: **GitHub → Actions → CI** workflow run. Green check = deployed.

### Method 2 — Manual from laptop

```bash
npx wrangler login        # one-time, opens browser
bash deploy.sh
```

### Method 3 — Headless (VM/CI without browser)

```bash
export CLOUDFLARE_API_TOKEN=cf_...
bash deploy.sh
```

Or deploy an existing build without rebuilding:

```bash
SKIP_BUILD=1 CLOUDFLARE_API_TOKEN=cf_... bash deploy.sh
```

### Verify a deploy

1. `https://aksaraku.pages.dev` loads the app shell (no 404)
2. Refresh on any path (e.g. `/foo`) — still serves the app (SPA fallback)
3. DevTools → Application → Service Workers: `sw.js` registered & activated
4. DevTools → Network → response headers include CSP, HSTS (from `_headers`)
5. `curl -sI https://aksaraku.pages.dev/sw.js | grep -i cache-control`
   → `max-age=0, must-revalidate`

---

## Rollback

### Option A — Cloudflare Dashboard (fastest, ~30s)

1. Cloudflare Dashboard → **Workers & Pages** → `aksaraku`
2. Open the **Deployments** tab
3. Find the last-known-good deployment (check timestamp against the bad change)
4. **⋯ menu → Rollback to this deployment**

This is instant and atomic — no rebuild needed.

### Option B — Re-deploy an older git revision

```bash
git log --oneline -10                 # find the last good commit
git checkout <good-sha>
NODE_ENV=production bun run build
CLOUDFLARE_API_TOKEN=cf_... bash deploy.sh
git checkout main                     # return to head
```

Then fix forward on `main` (revert commit + push).

### Option C — Revert commit (if the bad change is in git)

```bash
git revert <bad-sha>
git push origin main                  # CI redeploys automatically
```

### After any rollback

- [ ] Confirm `aksaraku.pages.dev` serves the old version (hard refresh / incognito)
- [ ] Confirm Service Worker picks up the old precache (DevTools → Application →
      Service Workers → Unregister, then reload, if stale content persists)
- [ ] Post-mortem: note root cause in the task / retro doc

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Deploy fails: "not authenticated" | No `CLOUDFLARE_API_TOKEN`, no OAuth session | `npx wrangler login --device` (VM) or export token |
| Deploy fails: 10027 / project not found | Project name mismatch, or Pages project doesn't exist yet | `npx wrangler pages project create aksaraku --production-branch=main` |
| 404 on `aksaraku.pages.dev` | First deploy never ran, or wrong branch | Run `bash deploy.sh` once; confirm production branch is `main` |
| Page loads but blank screen | JS error in app code | Check browser console; likely app bug — ping `@frontend-dev` |
| Stale content after deploy | Service Worker serving old precache | Bump `CACHE` version in `scripts/build-sw.ts`, redeploy |
| 404 on client-side navigation | `_redirects` missing from dist | Confirm `dist/_redirects` exists after build (build copies `public/` → `dist/`) |
| Security headers missing | `_headers` missing from dist | Same check as above |
| CI deploy fails with auth error | GitHub secrets missing/expired | Update `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` in repo settings |

---

## Escalation

- Infra/deploy issues → `@devops` (this runbook's owner)
- App bugs → `@frontend-dev` / `@backend-dev`
- Test failures blocking deploy → `@qa-engineer`
