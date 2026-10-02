# Aksaraku Infrastructure Architecture

> Current infra diagram & inventory. Maintained by `@devops`.
> Last updated: Sprint 1, 2026-10-02

---

## Overview

Aksaraku is a PWA (Progressive Web App) for toddler education (tracing, games,
gamification). It is hosted on **Cloudflare Pages** (free tier) and deployed via
GitHub Actions CI/CD from the `main` branch.

```
┌──────────────────────────────────────────────────────┐
│  GitHub (main branch)                                │
│  └─ .github/workflows/ci.yml                         │
│      ├─ build-test job (typecheck + test + build)    │
│      └─ deploy job (wrangler pages deploy)           │
│           ↓ secrets: CLOUDFLARE_API_TOKEN             │
├──────────────────────────────────────────────────────┤
│  Cloudflare Pages (project: aksaraku)                │
│  ├─ Production: aksaraku.pages.dev  (from main)       │
│  └─ Preview:    *.pages.dev         (from branches)   │
│      ├─ _headers   (CSP, HSTS, caching)               │
│      ├─ _redirects  (SPA fallback /* → /index.html)   │
│      └─ dist/       (build output: JS, CSS, SW)       │
├──────────────────────────────────────────────────────┤
│  Client (browser / tablet / phone)                   │
│  ├─ Service Worker (sw.js) — offline cache           │
│  └─ IndexedDB (Dexie) — on-device data               │
└──────────────────────────────────────────────────────┘
```

---

## Inventory

| Resource            | Value / Location                  | Notes                             |
|---------------------|------------------------------------|-----------------------------------|
| Hosting             | Cloudflare Pages                   | Free tier                          |
| Project name        | `aksaraku`                         | In `wrangler.toml` & `deploy.sh`   |
| Production URL      | `https://aksaraku.pages.dev`       | Auto-assigned `*.pages.dev` subdomain |
| Production branch   | `main`                             | Deploys to production subdomain     |
| Preview branches   | any non-`main` branch              | Auto-generated preview URLs         |
| Build output        | `./dist`                           | `pages_build_output_dir` in `wrangler.toml` |
| Runtime             | Bun (build) → static files (serve) | No server-side runtime — pure static |
| CI/CD               | GitHub Actions (`.github/workflows/ci.yml`) | Build → test → deploy on push to main |
| TLS/HTTPS           | Cloudflare automatic                | HSTS enforced via `_headers`        |

---

## Routing Configuration

### Current Strategy: Single-Entry SPA

The app uses a **single HTML entry** (`src/index.html`) with **in-memory routing**
(`src/app/routes.ts`). All navigation is handled client-side via React state —
there are no URL-based routes (no `/play`, `/games` in the address bar).

This means Cloudflare Pages routing is simple:

1. **Static assets** (`*.js`, `*.css`, `icon.svg`, `manifest.webmanifest`, `sw.js`)
   are matched by the Pages asset server and served directly — fast, no config needed.

2. **All other paths** fall back to `index.html` (the app shell), configured via
   `public/_redirects`:
   ```
   /*    /index.html   200
   ```
   The `200` status code (not `301`) ensures the browser URL stays intact and the
   app shell loads for any path.

### Landing Page Integration (pending `@frontend-dev`)

The landing page brief (`docs/specs/landing-page-brief.md`) proposes two route
strategies:

| Option | Landing | App | Pros | Cons |
|--------|---------|-----|------|------|
| A | `/landing` | `/` | App stays at root | Landing not the front door |
| B | `/` | `/app` | Landing is the front door | App needs route change |

**Current config supports both** — the `/* → /index.html 200` catch-all handles any
path. When the landing page is implemented, no `_redirects` change is needed if:

- **Option A**: landing is a lazy-loaded route within the existing app shell, OR a
  separate `landing.html` entry (add `/landing/* /landing.html 200` above the
  catch-all).
- **Option B**: app moves to `/app/*`, landing is the root. Add `/app/* /index.html 200`
  and `/ /landing.html 200` (or serve landing at root via the same index).

**Decision pending from Rohmad** (see open questions in landing brief §13).

### SPA Fallback Rules

| File | Purpose |
|------|---------|
| `public/_redirects` | Catch-all SPA fallback: `/* → /index.html 200` |
| `public/_headers` | Security headers + caching strategy |

---

## Security Headers (`public/_headers`)

| Header | Value | Why |
|--------|-------|-----|
| Content-Security-Policy | `default-src 'self'` + granular directives | Prevent XSS, no external resources |
| X-Frame-Options | `DENY` | Prevent clickjacking |
| X-Content-Type-Options | `nosniff` | Prevent MIME sniffing |
| Referrer-Policy | `strict-origin-when-cross-origin` | Limit referrer leakage |
| Permissions-Policy | Disable camera, GPS, mic, etc. | Minimal permissions for kids' app |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` | Force HTTPS for 1 year + preload |
| X-Robots-Tag | `index, follow` | Allow search engine indexing |

### Caching Strategy

| Resource | Cache-Control | Why |
|----------|----------------|-----|
| `/sw.js` | `public, max-age=0, must-revalidate` | SW updates ship immediately |
| `/manifest.webmanifest` | `public, max-age=3600` | Short cache, may change |
| `*.js`, `*.css` | `public, max-age=31536000, immutable` | Hashed filenames → immutable |

---

## Deployment

### Methods

| Method | When | Command |
|--------|------|---------|
| CI/CD (GitHub Actions) | Push to `main` | Automatic — `.github/workflows/ci.yml` |
| Manual (laptop) | Debug / hotfix | `bash deploy.sh` (requires `wrangler login`) |
| Headless (CI/VM) | Automated | `CLOUDFLARE_API_TOKEN=... bash deploy.sh` |

### CI/CD Pipeline (`.github/workflows/ci.yml`)

**Trigger**: push to `main` or PR against `main`

**Jobs**:
1. **build-test** — checkout → setup Bun → `bun install` → `bunx tsc --noEmit` →
   `bun test` → `NODE_ENV=production bun run build` → upload `dist/` artifact
2. **deploy** — (only on push to main) → checkout → setup Bun → build →
   `wrangler pages deploy dist --project-name=aksaraku` using
   `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets

**Required GitHub Secrets**:
- `CLOUDFLARE_API_TOKEN` — token with Pages:Edit permission
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID

### Deploy Script (`deploy.sh`)

- Checks auth (API token env var OR `wrangler whoami` OAuth)
- Builds with `NODE_ENV=production bun run build`
- Verifies `dist/index.html` exists
- Deploys: `npx wrangler pages deploy dist --project-name=aksaraku`
- `SKIP_BUILD=1 bash deploy.sh` to deploy existing `dist/` without rebuilding

---

## DNS & Domain

| Domain | Status | Notes |
|--------|--------|-------|
| `aksaraku.pages.dev` | Auto-assigned | Live once first deploy succeeds |
| Custom domain (`aksaraku.com`) | Not configured | Open question — see landing brief §13.2 |

To add a custom domain:
1. Cloudflare Dashboard → Pages → aksaraku → Custom domains → Set up
2. Add CNAME record pointing to `aksaraku.pages.dev`
3. Cloudflare provisions TLS automatically

---

## Observability

| Signal | Tool | Status |
|--------|------|--------|
| Deploy logs | GitHub Actions | ✅ Active |
| Build/test status | GitHub Actions checks | ✅ Active |
| Access analytics | Cloudflare Pages dashboard | Available (free tier) |
| Error monitoring | — | Not configured (Sprint 2+) |
| Uptime monitoring | — | Not configured (Sprint 2+) |

---

## Cost

Cloudflare Pages free tier:
- 500 builds/month
- Unlimited requests
- Unlimited bandwidth
- 1 concurrent build

Current usage: well within free tier.

---

## Related Files

| File | Purpose |
|------|---------|
| `wrangler.toml` | Cloudflare Pages project config |
| `deploy.sh` | Manual/headless deploy script |
| `public/_headers` | Security headers + cache rules |
| `public/_redirects` | SPA fallback routing |
| `.github/workflows/ci.yml` | CI/CD pipeline |
| `.env.example` | Required env vars for headless deploy |
| `scripts/build-sw.ts` | Service Worker precache injector |
| `docs/runbooks/deploy-and-rollback.md` | Deploy + rollback runbook |
