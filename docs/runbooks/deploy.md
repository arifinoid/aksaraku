# Deploy Runbook

## Pre-deploy Checklist

1. [ ] `bunx tsc --noEmit` passes
2. [ ] `bun test` passes
3. [ ] `NODE_ENV=production bun run build` succeeds
4. [ ] `dist/index.html` exists
5. [ ] Cloudflare auth available (wrangler login or `CLOUDFLARE_API_TOKEN`)

## Deploy

### From Laptop (Interactive)

```bash
cd /home/ubuntu/aksaraku
npx wrangler login      # if not already logged in
bash deploy.sh
```

### From Remote VM (Headless)

```bash
# Option A: Device OAuth (valid 5 min)
npx wrangler login --device
# → Visit https://dash.cloudflare.com/oauth2/device/verify
# → Enter the displayed code
# → Then: bash deploy.sh

# Option B: API Token
export CLOUDFLARE_API_TOKEN=cf_xxx
bash deploy.sh
```

### CI/CD (Automatic on push to main)

Push to `main` triggers `.github/workflows/ci.yml`. No manual action needed.
Requires `CLOUDFLARE_API_TOKEN` secret in GitHub repo settings.

## Post-deploy Smoke Test

1. Visit https://aksaraku.pages.dev
2. Verify app loads, no console errors
3. Test offline: DevTools → Network → Offline → reload → app should still work
4. Test on tablet device (preferred): tracing accuracy, touch targets, audio
5. Verify Service Worker registered: DevTools → Application → Service Workers

## Rollback

### Via Cloudflare Dashboard

1. Go to Cloudflare Pages → `aksaraku` project
2. Deployments tab
3. Find previous working deployment
4. Click ⋯ → "Rollback to this deployment"
5. Instant — Cloudflare points the alias to the old deployment

### Via Wrangler CLI

```bash
# List recent deployments
npx wrangler pages deployment list --project-name=aksaraku

# Redeploy a previous build (if dist/ is available)
SKIP_BUILD=1 bash deploy.sh
```

## Troubleshooting

### "Not authenticated" error

- Interactive: `npx wrangler login`
- Headless: `export CLOUDFLARE_API_TOKEN=...`
- Remote SSH: `npx wrangler login --device`

### Build fails

- Ensure `NODE_ENV=production` (not `--define`)
- Run `bun install` to sync deps
- Check `bunx tsc --noEmit` for type errors

### Deploy fails — project not found

Create the Pages project first:
```bash
npx wrangler pages project create aksaraku --production-branch=main
```

### Service Worker not registering

- Only registers in production builds (`NODE_ENV=production`)
- Check `dist/sw.js` exists after build
- Verify browser supports SW on the protocol (HTTPS or localhost)

### Old cache after deploy

- `sw.js` uses network-first for navigation, so new deploys appear immediately
- Hard refresh: Ctrl+Shift+R
- Or: DevTools → Application → Service Workers → Unregister → Reload
