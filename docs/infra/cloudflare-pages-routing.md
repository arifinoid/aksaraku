# Cloudflare Pages Routing — Landing (/) + App (/app)

> Status: FIXED 2026-10-03 (task t_bc8cb930). Supersedes the old
> `/* → /index.html` SPA fallback design in `architecture.md`.

## The routing we ship

| URL | Response | Serves |
|-----|----------|--------|
| `/` | 200 (rewrite) | `dist/landing.html` — landing front door |
| `/landing` | 200 | `dist/landing.html` (direct asset hit) |
| `/app` | 308 → `/app/` | platform directory normalization |
| `/app/` | 200 | `dist/app/index.html` — app shell |
| `/app/<anything>` | 200 (rewrite) | `dist/app/index.html` (client-side routes) |
| `/index.html`, `/landing.html` | 308 | pretty-URL normalization (harmless) |

`public/_redirects` (rules execute **after** normalization, "always followed"):

```
/          /landing.html   200
/app/*     /app/index.html     200
```

## Why not `/app /index.html 200`? (root cause of the original bug)

Cloudflare Pages' **pretty-URL normalization runs before `_redirects` rules** and
emits hard 308s whenever the normalized path matches an existing asset:

- `/index.html` → 308 `/` (asset `dist/index.html` exists)
- `/landing.html` → 308 `/landing`
- `/app` → 308 `/` — because `dist/index.html` exists and `/app` normalizes onto it

Those 308s **cannot be shadowed by 200 rewrite rules**. `_redirects` rules are
"always followed" only for requests that survive normalization. Evidence from
the live incident: `/random`, `/app/foo`, `/nonexistent` all returned 200 (SPA
fallback), while exactly `/`, `/app`, `/index.html`, `/landing.html` returned
308 — the asset-path set. The deployed `_redirects` file was correct; the
platform's pre-routing step was shadowing it.

## The fix

1. `dist/app/index.html` — the app shell copied into a real directory, so
   `/app/` is served directly by the asset server (no normalization applies).
   `/app` then reaches it via the platform's own directory redirect (308),
   which is what directory URLs are *supposed* to do.
2. `/app/* → /app/index.html 200` covers deep links.
3. `bun scripts/build-app-dir.ts` (in `package.json` build, before
   `build-sw.ts`) copies `dist/index.html` → `dist/app/index.html` and
   `dist/app.html` on every build. `dist/index.html` itself is kept as the
   built entry (it is what normalization points `/app` at no more — `app/`
   now wins).
4. `scripts/build-sw.ts` skips `app.html` / `app/index.html` in the precache
   list; the SW precaches `/` (landing) and caches the shell on first navigate.

## Debugging playbook (if routing breaks again)

1. Probe the live router with a set of paths and look at which ones 308:

   ```bash
   for p in / /app /app/ /app/foo /index.html /landing.html /random; do
     printf "%-14s " "$p"
     curl -s -o /tmp/b.html -w "code=%{http_code} redir=%{redirect_url} " \
       "https://aksaraku.pages.dev$p"
     grep -o '<title>[^<]*</title>' /tmp/b.html | head -1
   done
   ```

2. If *everything* 404s or headers are missing → deploy/assets problem
   (check CI logs, `dist/_redirects` in the artifact).
3. If only asset-lookalike paths 308 → normalization (this incident); make the
   target a real file/directory rather than fighting it with rewrite rules.
4. `/_redirects` returning HTML means the URL fell through to the SPA fallback —
   that is expected on Pages (`_redirects` is config, not a served asset).
5. Isolation test (no CI needed): `npx wrangler pages deploy dist
   --project-name=aksaraku --branch=main` — CI and manual deploys produce
   identical routing config; there is no divergent deploy path.
