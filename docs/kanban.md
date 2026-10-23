# Kanban — Aksaraku Backlog

**Date**: 2026-10-21
**Source**: post-merge audit of PR #19 (avatar rebuild + fonts + motion system)
**Baseline**: `bun test src` → 236 pass / 0 fail · e2e (chromium) → 45/45 pass · `bunx tsc --noEmit` clean

Every item below was **verified by execution**, not by reading. Numbers quoted are
measured, not estimated.

## How to use this board

| Column | Meaning |
|---|---|
| **Ready** | Scoped, reproducible, unblocked. Can be picked up as-is. |
| **Needs decision** | A fix is possible but the correct behaviour needs a product call. |
| **Blocked** | Cannot start until something else lands. |
| **Done** | Shipped and merged. |

**Priority** — `P0` breaks a core promise to the child (rewards must mean the work
was done) or blocks shipping. `P1` affects installability or accessibility.
`P2` hygiene and roadmap items.

**Branch rule** (AGENTS.md §1): every item gets its own branch off `main`, its own
PR, and is squash-merged after review. Never push to `main`.

---

## Ready — P0: the reward economy is wrong

A toddler's core loop is *do the thing → get the star*. Right now the star does
not reliably mean the child did the work. These are the highest-value fixes in
the repo and all of them are small, local changes under `src/domain/`.

### KAN-01 · Star inflation in the choice games

| | |
|---|---|
| **Where** | `src/features/games/useChoiceGame.ts:111-114` |
| **Impact** | One perfect balloon session banks **18 stars**; the child **sees 3**. |
| **Evidence** | `itemAccuracies(session.attempts)` returns one entry *per item*; the loop calls `recordAttempt` once per entry, writing one mastery row each. `src/domain/rewards.ts:75` then sums `starsForAccuracy(entry.score)` per row, so N items bank N× the stars. `ROUNDS = 6` (`src/features/games/BalloonGameScreen.tsx:14`), display at `BalloonGameScreen.tsx:114`. Measured: 18 banked vs 3 shown (6× inflation); **9 of 15 rewards** unlocked by one perfect session vs 2 by a perfect trace. A child can farm trophies without ever tracing. |
| **Fix** | Aggregate the session into **one** `recordAttempt` call using the session's overall accuracy. Decide separately whether `statsFromMastery` should count stars per *session* or per *item* — pick one and make both sides agree. |
| **Tests** | No test file exists for `src/features/games/` at all. Add one asserting a 6-round perfect session banks the same star count the UI shows. |
| **Estimate** | S |

### KAN-02 · The EMA destroys earned credit

| | |
|---|---|
| **Where** | `src/domain/progress.ts:14-16` (`MASTERY_EMA = 0.3`) |
| **Impact** | 3 stars → 1 star after a **single** wrong tap. |
| **Evidence** | Measured from a perfect `1.000`: one bad attempt → `0.700` → 1 star, level `mastered` → `learning` (it *skips* "familiar"; that label only appears at ~0.5 accuracy). Regression is visible in the UI: stars 18 → 16, `itemsMastered` 6 → 5, and the locked-reward counters in `src/features/rewards/CollectionScreen.tsx:35` regress (sticker-rainbow 18/3 → 16/3). Owned rewards are *not* revoked — `profileRewards` has no delete path except profile deletion — but the child watches their progress slide backwards. Cross-game: trace upper-A perfectly, then answer upper-A wrong once in the balloon game → 3 stars and "mastered" are gone. |
| **Fix** | Clamp the EMA so it never lowers an already-earned score: `Math.max(previous.score, ema)`. A monotone fix still passes all four existing tests in `src/domain/progress.test.ts`, so this is a safe change. |
| **Tests** | `src/domain/progress.test.ts:16` pins the EMA *formula* but nothing pins the decay. Add a test asserting a bad attempt never reduces stars or the mastery level. |
| **Estimate** | S |

### KAN-03 · Coloring score exploit

| | |
|---|---|
| **Where** | `src/domain/games/coloring.ts:22-29` (`paintStroke`) and `:44-54` (`coloredStrokeCount`, `coloringScore`) |
| **Impact** | 3 stars + "mastered" with **zero real strokes painted**. |
| **Evidence** | `paintStroke` accepts any `strokeIndex`. Four bogus indices (`999`, `-5`, `1.5`, `NaN`) produce `coloredStrokeCount = 4` → `coloringScore(state, 3) = 1.0` → 3 stars, nothing actually coloured, because `coloredStrokeCount` counts *all* keys and `Math.min` caps the ratio at 1. Separately, the sticker bonus (`+0.2`, line 53) makes 3-of-4 painted + 1 sticker = `0.95` = 3 stars and "mastered" — this hits the 3 of 70 catalogue items that have 4 strokes (upper-E, shape-square, shape-rectangle). Repeated indices are *not* an exploit (the map key overwrites). |
| **Fix** | Validate `strokeIndex` in `paintStroke` (reject non-integer and negative) and count only indices `< strokeCount` instead of `Object.keys(state.fills).length`. Cap the sticker bonus below 1.0 so a partial colouring cannot reach 3 stars. |
| **Tests** | `src/domain/games/coloring.test.ts:62` *pins* the uncapped sticker bonus (a 0.95 cap makes it fail — update the assertion, and fix the misleading title "never exceeds one" which actually asserts reaching exactly 1). `coloring.test.ts:70` is misnamed — it claims to ignore out-of-range strokes but is satisfied by the `Math.min` clamp and catches nothing. Replace it with a test that paints only out-of-range indices and asserts the score stays 0. |
| **Estimate** | S |

### KAN-04 · The `attempts` store grows forever

| | |
|---|---|
| **Where** | `src/storage/attempts.ts` (whole file, 31 lines) |
| **Impact** | Unbounded storage growth; the parent report loads everything into memory. |
| **Evidence** | `saveAttempt` (`:6`) has no cap and no pruning — the only delete path anywhere is profile deletion (`src/storage/profiles.ts:48`). `listAttempts` (`:14`) loads the *entire* history. Measured 165 B/row: casual 5/day = 1,825 rows/yr (0.3 MB), typical 20/day = 7,300 rows/yr (1.1 MB), heavy 60/day = 21,900 rows/yr (3.4 MB). `listAttempts` is called on every parent-report mount (`src/features/parent/ParentReport.tsx:70`) and `buildReport` maps the full array twice (`src/domain/report.ts:134-135`) — ~342 KB of temporary arrays per report open at heavy use. `latestAttemptsByItem` (`:22`) has **zero callers** in the whole repo: it is dead code, and despite its name it does not group by item. |
| **Fix** | Prune on write (keep the last N per profile, or drop rows older than a window). Make the report use a bounded or aggregate query. Delete `latestAttemptsByItem` or implement the per-item grouping its name promises. |
| **Tests** | No test file for `src/storage/attempts.ts` — `src/storage/` only has `db.test.ts`. |
| **Estimate** | M |

---

## Ready — P1: installability and touch targets

### KAN-05 · Missing PNG PWA icons

| | |
|---|---|
| **Where** | `public/manifest.webmanifest` |
| **Impact** | The install prompt fails on the target devices — tablets. |
| **Evidence** | The manifest declares only one SVG icon (`"sizes": "any"`). No 192×192 PNG, no 512×512 PNG, no `maskable` purpose, no `apple-touch-icon`. `docs/quality-metrics.md` already rates this P1: modern Chrome accepts SVG icons, but many Android browsers and iOS Safari require raster PNGs — and iOS does not support SVG for home-screen icons at all. |
| **Fix** | Generate 192×192 and 512×512 PNGs from `public/icon.svg`; add `"purpose": "any maskable"` to the 512 icon; add a 180×180 `apple-touch-icon`; reference all of them from the manifest. No rasteriser is installed in this environment (`convert`/`magick`/`inkscape`/`rsvg-convert` all absent) — either add a build step that generates them or commit the binaries. |
| **Estimate** | S |

### KAN-06 · Touch targets below the 64px minimum

| | |
|---|---|
| **Where** | `src/ui/button.css:45`, `src/ui/Screen.tsx:36`, `src/features/avatar/avatar.css:52`, `src/ui/screen.css:133`, `src/features/parent/parent.css:241` |
| **Impact** | The Back button, the delete button, every avatar swatch, and every dashboard switch are smaller than the project minimum. |
| **Evidence** | Measured in the running app with Playwright. `--touch-min` is `64px` (`src/index.css:19`) but `.btn--sm` is `min-height: 56px` — and the shared Back button (`src/ui/Screen.tsx:32-38`, `size="sm"`) is 126×56, the "Orang Tua" button 136×56, "Ganti Anak" 1068×56, and "Hapus" 76×56. All 18 `.avatar__swatch` are 56×56. The three `.switch__input` toggles are 44×44. The locale select in Manage Children is 185×48 (`parent.css:243` overrides `screen.css:153`). The e2e test `TC-414` only checks 44×44 (WCAG), so it passes while the project rule is broken. |
| **Fix** | Raise `.btn--sm` to `var(--touch-min)`; give `.avatar__swatch` a 64px hit area (the visual circle can stay 56px if a padded hit area is added); grow `.switch__input` to 64×64; drop the `min-height: 48px` override in `parent.css`. |
| **Tests** | Tighten `TC-414` to assert 64px so this cannot regress silently. |
| **Estimate** | S |

### KAN-07 · e2e tests never run in CI

| | |
|---|---|
| **Where** | `.github/workflows/ci.yml` |
| **Impact** | 45 tests that have never executed in CI guard nothing. |
| **Evidence** | The `build-test` job runs `bunx tsc --noEmit`, `bun run build` and `bun test src`. There is no Playwright step and no browser install. The suite passes locally (45/45 on chromium) but has never been run automatically — which is how the reward bugs in KAN-01…04 survived. |
| **Fix** | Add a `playwright install --with-deps chromium` step and a `bunx playwright test` step. The upstream `playwright.config.ts` declares three projects (chromium, firefox, webkit) and a `webServer` on port 3000 — decide whether CI runs all three or chromium only, and make `playwright.config.ts` match. |
| **Note** | In *this* environment the Playwright browser needs a patched ELF interpreter (see KAN-09) — CI on `ubuntu-latest` will not, but a local developer on nix/WSL will. |
| **Estimate** | M |

### KAN-08 · Deploy is not gated on the AI review gate

| | |
|---|---|
| **Where** | `.github/workflows/ci.yml` (`deploy` job) |
| **Impact** | A failed AI review does not block production. |
| **Evidence** | The `deploy` job declares `needs: build-test` only. The `ai-review` job is a sibling, so a "REQUEST CHANGES" verdict does not stop the deploy. The `REVIEW_GATE_ENABLED` repo variable can be off entirely, in which case only the PRD-path and Given/When/Then AC format checks run. |
| **Fix** | Add `ai-review` to the deploy job's `needs` and gate the deploy on the review verdict. Decide deliberately whether the gate is advisory or blocking, then make the workflow say so. |
| **Estimate** | S |

---

## Needs decision

### KAN-09 · A local Playwright browser that can actually launch

| | |
|---|---|
| **Problem** | The Playwright browser will not start here at all: `libglib-2.0.so.0: cannot open shared object file`. The system glibc is 2.40, but the nix-store libraries Chromium needs require ≥ 2.43. |
| **What works** | Copy the browser binary and repoint its ELF interpreter with `patchelf`: `--set-interpreter <nix glibc 2.44>/lib/ld-linux-x86-64.so.2` plus `--set-rpath <nix lib path>`. The copy must live **inside the browser's own directory** — Chromium locates `icudtl.dat` and the `.pak` files next to the executable via `/proc/self/exe`, so a copy run from `/tmp` fails with "Invalid file descriptor to ICU data received". |
| **Gotchas worth recording** | `channel: 'chromium'` in a Playwright config **overrides** `launchOptions.executablePath` — it silently launches the full browser instead of the headless shell. Chromium's `--no-sandbox` is added by Playwright itself; passing it by hand is unnecessary. |
| **Decision needed** | This is a developer-machine workaround, not a repo change. Options: (a) document it in `docs/runbooks/` and leave CI alone, (b) add a `scripts/patch-browser.ts` helper, (c) use `bunx playwright install-deps` and a non-nix system. The user prefers declarative nix installs over runtime-downloading CLIs. |
| **Estimate** | S (if option a or b) |

### KAN-10 · Star counting: per item or per session?

| | |
|---|---|
| **Problem** | KAN-01 fixes *where* the inflation happens, but the product question underneath is whether a star means "this item was learned" or "this session was completed". Today the two disagree: the UI shows one star count per session, the storage counts one per item. |
| **Options** | (a) Keep stars per *item* and make the UI show the per-item total — a session over 6 items would then show 18 stars, which is a lot for a toddler screen. (b) Keep stars per *session* — one number, always matches what the child saw. (c) Keep both: per-item stars for mastery, per-session stars for celebration. |
| **Recommendation** | (c), with the celebration number always the one shown at the end of a session. It preserves the meaning of "mastered this letter" without making the reward counter inflate. |
| **Decision needed** | Which reading of "star" the product wants. Affects KAN-01's implementation. |
| **Estimate** | S |

### KAN-11 · `bun test` vs `bun test src`

| | |
|---|---|
| **Problem** | Bare `bun test` **fails**: 236 pass, 6 fail, 6 errors. It globs `tests/e2e/*.spec.ts`, and Playwright's `test.describe()` throws "Playwright Test did not expect test.describe() to be called here" outside its own runner. `package.json` correctly uses `bun test src`, but `AGENTS.md:61` documents the bare form in its verification table, and `docs/runbooks/deploy.md` lists `bun test` as a pre-deploy check. |
| **Options** | (a) Change `AGENTS.md` and the runbook to `bun test src`. (b) Add a `bunfig.toml` test root that excludes `tests/e2e`, so bare `bun test` is safe everywhere. |
| **Recommendation** | (b) — it makes the documented command correct rather than rewriting the docs around a footgun. |
| **Estimate** | S |

---

## Blocked

None. Every item above can start today.

---

## P2 — hygiene and roadmap

| ID | Item | Where | Notes |
|---|---|---|---|
| KAN-12 | Unpinned `npx wrangler` in CI | `.github/workflows/ci.yml` | Downloads a moving target at deploy time. Pin the version, or add it to devDependencies. |
| KAN-13 | 10 unused i18n keys | `src/i18n/locales/{id,en,ar}.ts` | `app.tagline`, `common.on`, `common.off`, `common.soon`, `nav.home`, `play.pick`, `games.balloonPrompt`, `games.correct`, `games.wrong`, `games.stickers`. **Do not** delete `mastery.*`, `rewards.kind.*` or `avatar.slot.*` — they are built dynamically via `t(\`mastery.${level}\`)` and look unused. Locale parity is otherwise perfect: id/en/ar each have exactly 185 identical keys. |
| KAN-14 | No offline phoneme audio | `src/platform/speech.ts` | Still `speechSynthesis`, so phonemes depend on the OS voice and fail offline — a direct conflict with the offline-first promise. Needs recorded audio assets per locale. |
| KAN-15 | No Arabic glyph content | `src/data/glyphs/` | The app teaches Latin A–Z, digits and shapes; Arabic exists only in UI strings and object names. Adding 28 glyphs means authoring stroke geometry and RTL stroke direction, which could not be visually verified in this environment. |
| KAN-16 | No real-device / 60fps verification | `docs/test-plans/device-testing-tablet.md` | Never run on physical hardware — no device in the development environment. The plan exists; it has never been executed. |
| KAN-17 | No test coverage for `src/features/games/` or `src/storage/attempts.ts` | — | This is the *reason* KAN-01…04 survived. Add coverage alongside each fix, not after. |

---

## Done

| ID | Item | Notes |
|---|---|---|
| — | 3D avatar face rebuilt on the head surface | PR #19. The mouth was offset twice — the `TubeGeometry` curve was built from world-space points *and* the mesh was positioned at the centre, throwing the mouth off the face. Fixed, and pinned by a guard test that fails if the bug is reintroduced. |
| — | Self-hosted fonts + motion system | PR #19. `public/fonts/`, `src/ui/motion.css`, `--motion-*` tokens. |
| — | Offline app shell, enforceable screen-time limit, reachable 3 stars | PR #18. |
| — | Pixi `unsafe-eval` polyfill for strict CSP | PR #17. |

---

## Suggested order

1. **KAN-01 → KAN-02 → KAN-03** together, in one PR. All three are in `src/domain/`, all three are small, and they share a theme: *the star must mean the child did the work*. Shipping them together makes the reward economy coherent in one release.
2. **KAN-17** alongside them — the missing test files are why the bugs survived.
3. **KAN-05 + KAN-06** in one PR (installability and touch targets; both are UI, both need screenshot evidence per AGENTS.md).
4. **KAN-07 + KAN-08 + KAN-12** in one PR (CI hardening: run the tests, gate the deploy, pin the deploy tool).
5. **KAN-04** on its own — it is a data-lifecycle change and benefits from being separate.
6. **KAN-11** as a small standalone chore.
7. KAN-10's decision is needed *before* KAN-01 is finalised. KAN-09, KAN-13…16 whenever there is room.

---

## Verification commands

```sh
bunx tsc --noEmit        # typecheck
bun test src             # unit tests — 236 pass
bun run build            # production build
bunx playwright test     # e2e — see KAN-07 for the browser situation
```

Screenshot or video evidence is required for any UI change (AGENTS.md §3).
