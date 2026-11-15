# PRD: VPS production deploy + privacy-friendly analytics

## 1. Context

Aksaraku currently ships only to Cloudflare Pages (`aksaraku.pages.dev`). The
portfolio needs it served from the owner's own infrastructure
(`aksaraku.arifinoid.web.id`) alongside the other VPS projects, and needs
honest usage numbers for the portfolio.

The app is a static, offline-first PWA with no backend: all child profiles,
attempts and rewards live in IndexedDB on the device. Server logs can count
requests but cannot answer "how many children finished a tracing session".
Analytics must therefore be client-side, cookieless and aggregate-only.

## 2. Goals

- Deploy every push to `main` to the VPS using the same atomic release layout
  as `personal-web` (`releases/<sha>` + `current` symlink).
- Keep Cloudflare Pages as a preview/fallback target.
- Serve the app from `https://aksaraku.arifinoid.web.id` with the same security
  headers and caching rules as the Pages deployment.
- Collect cookieless pageviews and a small set of product events in a
  self-hosted GoatCounter instance (`https://stats.arifinoid.web.id`).

## 3. Non-goals

- No accounts, no server-side storage, no cross-device sync.
- No advertising identifiers, fingerprinting or cookies.
- No per-child or per-device reporting: events are aggregate counters only.

## 4. Metrics

| Metric | Source |
| --- | --- |
| Visits / unique visitors / countries / referrers | GoatCounter pageviews |
| Landing → app conversion | `/` vs `/app/` pageviews |
| Tracing engagement | `event/tracing-item-complete` |
| Game engagement | `event/game-complete` (matching, balloon, coloring) |
| Profiles created | `event/profile-created` |
| PWA installs | `event/pwa-install` (`appinstalled`) |

GoatCounter stores no personal data and needs no consent banner.

## 5. Acceptance Criteria

- **Given** a merged commit on `main`, **when** the `deploy-vps` job runs with
  `VPS_DEPLOY_ENABLED=true` and the VPS secrets configured, **then** the build
  is uploaded to `/var/www/aksaraku/releases/<sha>` and `current` points at it.
- **Given** a successful deploy, **when** a browser requests
  `https://aksaraku.arifinoid.web.id/`, **then** the landing page is served with
  the CSP that allows `stats.arifinoid.web.id`.
- **Given** the deploy has not run or the VPS is unreachable, **when** the job
  is disabled or the gate variable is unset, **then** CI on `main` still passes.
- **Given** the analytics script is blocked or offline, **when** the app records
  an event, **then** the app keeps working and no exception is thrown.
- **Given** a parent finishes a tracing item, a game round or creates a profile,
  **then** exactly one corresponding GoatCounter event is sent.
- **Given** a request for `/sw.js`, **then** the response is
  `Cache-Control: public, max-age=0, must-revalidate`; hashed assets are
  immutable for one year.
