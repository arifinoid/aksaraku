# Deploy Runbook: Cloudflare Pages Go-Live

## Prerequisites

1. **Cloudflare account** — free tier is sufficient
2. **Bun 1.4+** installed on the machine running the deploy
3. **Auth** — one of:
   - `npx wrangler login` (interactive, opens browser)
   - `npx wrangler login --device` (remote SSH: visit URL + enter code)
   - `CLOUDFLARE_API_TOKEN` env var (headless / CI)

## First Deploy (Go-Live)

### Option A: From laptop (recommended for first deploy)

```bash
cd /home/ubuntu/aksaraku

# 1. Authenticate (opens browser)
npx wrangler login

# 2. Verify auth
npx wrangler whoami

# 3. Deploy
bash deploy.sh
```

The deploy script will:
1. Check auth (OAuth or API token)
2. Build: `NODE_ENV=production bun run build`
3. Create the Pages project `aksaraku` if it doesn't exist (first run only)
4. Deploy `dist/` to `aksaraku.pages.dev`
5. Print the live URL

### Option B: Via GitHub Actions (CI/CD)

1. Push the repo to GitHub
2. Add GitHub Secrets:
   - `CLOUDFLARE_API_TOKEN` — token with Pages:Edit permission
   - `CLOUDFLARE_ACCOUNT_ID` — from Cloudflare dashboard sidebar
3. Push to `main` — the CI pipeline will:
   - Typecheck (`bunx tsc --noEmit`)
   - Test (`bun test`)
   - Build (`NODE_ENV=production bun run build`)
   - Create project (first run only)
   - Deploy to production

**Token creation**: https://dash.cloudflare.com/profile/api-tokens
Use the "Edit Cloudflare Workers" template or a custom token with
`Cloudflare Pages → Edit` permission.

## Post-Deploy Verification

Run these checks after the first deploy:

### 1. Site loads
```bash
curl -sI https://aksaraku.pages.dev | head -5
# Expect: HTTP/2 200
```

### 2. Security headers present
```bash
curl -sI https://aksaraku.pages.dev | grep -iE 'x-frame-options|x-content-type|strict-transport|content-security'
```

### 3. Service Worker registered
```bash
curl -sI https://aksaraku.pages.dev/sw.js
# Expect: HTTP/2 200, content-type: text/javascript
```

### 4. PWA manifest served
```bash
curl -sI https://aksaraku.pages.dev/manifest.webmanifest
# Expect: HTTP/2 200, content-type: application/manifest+json
```

### 5. SPA fallback works
```bash
# Any path should return index.html (200, not 404)
curl -sI https://aksaraku.pages.dev/some/nonexistent/path | head -1
# Expect: HTTP/2 200
```

### 6. Offline functionality
1. Open https://aksaraku.pages.dev on a device
2. Open DevTools → Application → Service Workers (should be activated)
3. Toggle offline in DevTools → reload — app should load from cache

## Rollback

Cloudflare Pages keeps every deployment. To rollback:

### Via dashboard
1. Cloudflare dashboard → Pages → aksaraku → Deployments
2. Find the last known-good deployment
3. Click ⋯ → "Rollback to this deployment"

### Via wrangler
```bash
npx wrangler pages deployment list --project-name=aksaraku
# Find the deployment ID to rollback to, then use the dashboard.
```

## Troubleshooting

### "Not authenticated" error
- OAuth session expired → re-run `npx wrangler login`
- Using API token → verify `CLOUDFLARE_API_TOKEN` is set and valid

### Build fails with "NODE_ENV" warning
- Ensure `NODE_ENV=production` is set as an env var, NOT via `--define`
- The `bun run build` script handles this automatically

### SW not updating after deploy
- The SW uses network-first for navigation, so a hard reload picks up new versions
- SW file itself has `Cache-Control: max-age=0, must-revalidate`
- For stubborn cases: DevTools → Application → Service Workers → Unregister → Reload

### 404 on subpaths
- Verify `public/_redirects` was copied to `dist/_redirects` during build
- Cloudflare Pages applies `_redirects` rules before headers
