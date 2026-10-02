# Sprint 1 — Device Test Plan: Tablet Android/iOS

> Task: `t_f641224b` — Tracing, audio, haptic on real tablet hardware.
> Owner: QA Engineer (code audit + test plan); human tester executes on device.
> Date: 2026-10-02

## Scope

This plan covers the device-facing QA for the Aksaraku PWA. Because the QA
agent runs on a headless Linux VM (no tablet, no touch, no AudioContext,
no navigator.vibrate), the work splits in two:

1. **Code-level audit** (done by QA agent, this document) — verify the
   codebase handles touch targets, pointer events, audio unlock, haptics,
   and accessibility correctly.
2. **On-device execution** (human tester) — run the checklist below on a
   physical Android tablet and (optionally) an iPad.

---

## 1. Automated Verification (done on VM)

| Check | Command | Result |
|-------|---------|--------|
| Unit tests | `bun test` | ✅ 164 pass, 0 fail, 19056 expect calls |
| Typecheck | `bunx tsc --noEmit` | ✅ Clean, no errors |
| Production build | `NODE_ENV=production bun run build` | ✅ 880 modules, SW precache 18 files |
| SW precache list | `dist/sw.js` | ✅ All hashed chunks listed, allSettled fallback |

---

## 2. Code Audit Findings

### 2.1 Touch Targets — PASS (with one note)

| Element | CSS | Min size | Status |
|---------|-----|----------|--------|
| `.btn` (default) | `min-height: var(--touch-min)` | 64px | ✅ |
| `.btn--lg` | `min-height: 80px` | 80px | ✅ |
| `.btn--sm` | `min-height: 48px` | 48px | ⚠️ Below 64px guideline |
| `.play__tab` | `min-height: 56px` | 56px | ⚠️ Below 64px guideline |
| `.glyph-card` | `aspect-ratio: 1/1`, grid `minmax(84px)` | ≥84px | ✅ |
| `.option-card` | `aspect-ratio: 1/1`, grid `minmax(96px)` | ≥96px | ✅ |
| `.balloon` | `aspect-ratio: 3/4`, grid `minmax(110px)` | ≥110px | ✅ |
| `.swatch` | `width/height: 56px` | 56px | ⚠️ Below 64px guideline |

**Note**: `.btn--sm`, `.play__tab`, and `.swatch` are below the 64px target
from AGENTS.md. These are secondary controls (clear/back buttons, category
tabs, color swatches). On a 10-inch tablet they are likely fine for a
3-year-old's finger, but on a 7-inch tablet they may be tight. Recommend
the human tester verify these specifically. Not a launch blocker.

### 2.2 Pointer Events — PASS

- `TracingCanvas` (PixiJS canvas): uses `pointerdown`/`pointermove`/
  `pointerup`/`pointercancel` with `setPointerCapture` and
  `releasePointerCapture`. ✅ Proper multi-touch rejection
  (`activePointer` guard).
- `touch-action: none` on `.tracing-canvas` and `app.canvas.style.touchAction`
  set in JS. ✅ Prevents scroll/zoom interference during tracing.
- `ColoringGameScreen`: SVG `onPointerDown` with `clientX/clientY` →
  `getBoundingClientRect` math. ✅ Correct.
- `PlayScreen`: `pointerdown` listener (once) to unlock audio. ✅
- All interactive buttons use `touch-action: manipulation` (no 300ms
  delay). ✅

### 2.3 Audio — PASS

- `game/audio.ts`: lazily creates `AudioContext` (or `webkitAudioContext`
  fallback). ✅ iOS Safari compatible.
- `unlockAudio()`: resumes suspended context on first `pointerdown`. ✅
  This is the correct pattern for mobile autoplay policy.
- All play functions (`playPop`, `playStrokeComplete`, `playSuccess`,
  `playOffTrack`) check `enabled` flag and null context. ✅ Graceful
  degradation when audio disabled or unavailable.
- `speech.ts`: `speechSynthesis` with `SpeechSynthesisUtterance`, checks
  `supportsSpeech()`. ✅ Degrades to visual label when TTS unavailable.

### 2.4 Haptics — PASS (with platform note)

- `platform/haptics.ts`: `navigator.vibrate` with feature detection and
  `enabled` guard. ✅
- Haptic patterns: `tap: 10ms`, `success: [12,40,12]`, `offTrack: 24ms`.
  ✅ Appropriate for a toddler device.
- **Platform note**: `navigator.vibrate` works on Android Chrome but is
  **not supported on iOS Safari**. The code degrades gracefully (returns
  false, no crash). The human tester should confirm no errors on iPad.
- All haptic call sites read from `flagsRef.current.hapticsEnabled` (ref,
  not stale closure). ✅

### 2.5 Viewport & PWA — PASS

- `index.html`: `viewport-fit=cover`, `initial-scale=1.0`. ✅
- `apple-mobile-web-app-capable: yes`. ✅
- `manifest.webmanifest`: `display: standalone`, `orientation: any`.
  ✅
- `sw.js`: cache-first for assets, network-first for navigation, offline
  fallback to `/`. ✅
- `_headers`: CSP, HSTS, Permissions-Policy. ✅

### 2.6 Accessibility — PASS

- `:focus-visible` outline defined. ✅
- `@media (prefers-reduced-motion: reduce)` and
  `:root[data-motion="reduced"]` both honored. ✅
- `TracingCanvas`: `role="img"` with `aria-label`. ✅
- `aria-live="polite"` on off-track hint. ✅
- `aria-pressed` on swatches. ✅
- `-webkit-tap-highlight-color: transparent`. ✅

---

## 3. On-Device Test Checklist (Human Tester)

### 3.1 Tracing Accuracy

| # | Test | Pass Criteria |
|---|------|---------------|
| T1 | Trace a letter (e.g. "A") with stylus/finger | Stroke follows finger within 1 frame, no lag |
| T2 | Lift finger mid-stroke, resume | Progress bar stays, new stroke continues |
| T3 | Trace off the guide line | Orange progress does not extend, "off track" hint shows |
| T4 | Complete all strokes of a multi-stroke glyph | Stars awarded, success sound plays |
| T5 | Trace with two fingers simultaneously | Only first finger tracked (multi-touch rejected) |
| T6 | Rotate device mid-trace (portrait↔landscape) | Canvas resizes, drawing not lost |
| T7 | Trace after scrolling page down | Page does not scroll during trace (touch-action:none) |

### 3.2 Audio

| # | Test | Pass Criteria |
|---|------|---------------|
| A1 | First tap on Play screen | Audio context unlocks, subsequent sounds play |
| A2 | Complete a tracing item | Success melody (C-E-G-C arpeggio) plays |
| A3 | Tap "🔊 Listen" button | Phoneme spoken via TTS in current locale |
| A4 | Toggle audio OFF in parent settings | No sounds play at all |
| A5 | Toggle audio ON again | Sounds resume immediately |
| A6 | Switch locale to Arabic (ar) | TTS speaks Arabic, UI shows RTL |
| A7 | Put app in background, resume | Audio resumes without requiring re-unlock |

### 3.3 Haptics

| # | Test | Pass Criteria |
|---|------|---------------|
| H1 | Trace off guide line on Android | Short vibration (24ms) felt |
| H2 | Complete a stroke on Android | Tap vibration (10ms) felt |
| H3 | Complete an item on Android | Success pattern ([12,40,12]) felt |
| H4 | Toggle haptics OFF | No vibrations at all |
| H5 | Toggle haptics ON | Vibrations resume |
| H6 | Test on iPad (iOS Safari) | No vibration (expected — iOS doesn't support navigator.vibrate), no errors/crashes |

### 3.4 Touch Targets

| # | Test | Pass Criteria |
|---|------|---------------|
| D1 | Tap category tabs (Letters/Numbers/Shapes) | Easy to tap, no mis-taps, min 56px |
| D2 | Tap glyph cards in grid | Easy to tap, min 84px |
| D3 | Tap "Clear" / "Back" small buttons | Usable by child finger, 48px (note: below 64px target) |
| D4 | Tap color swatches in coloring game | Usable, 56px (note: below 64px target) |
| D5 | Tap balloon game options | Easy to tap, min 110px |

### 3.5 PWA / Offline

| # | Test | Pass Criteria |
|---|------|---------------|
| P1 | Add to Home Screen on Android | App installs, opens standalone |
| P2 | Add to Home Screen on iPad | App installs, opens standalone |
| P3 | Airplane mode, open app | App shell loads from cache, tracing works |
| P4 | Airplane mode, complete a tracing item | Data saved locally, no sync errors |
| P5 | Go online after offline session | Data syncs when connection restored |

### 3.6 Performance

| # | Test | Pass Criteria |
|---|------|---------------|
| F1 | Open app cold (first load) | Interactive < 3s on tablet |
| F2 | Trace continuously for 30s | No frame drops, 30fps maintained |
| F3 | Switch between 5+ glyphs rapidly | No memory leak, canvas cleans up |
| F4 | Background app, resume after 5 min | State preserved, no reload |

---

## 4. Bugs Found (Code Audit)

No blocking bugs found during code audit. Three low-severity notes:

1. **[P3]** `.btn--sm`, `.play__tab`, `.swatch` below 64px touch target.
   Functional but may be tight for small fingers on 7-inch tablets.
   → Recommend human tester verify on target device.

2. **[P3]** `navigator.vibrate` unsupported on iOS. Code degrades
   gracefully (no crash), but iPad users get no haptic feedback.
   → Acceptable for launch; document as known limitation.

3. **[P3]** `manifest.webmanifest` has only one icon (SVG, `sizes: any`).
   Some Android devices prefer PNG icons for install prompt. SVG with
   `sizes: any` is spec-compliant but may show a generic icon on older
   Android. → Non-blocking; recommend adding 192/512 PNG icons later
   (already noted in performance audit task t_954c3939).

---

## 5. Sign-Off

**Code Audit**: PASS — No blocking issues found.
**On-Device**: PENDING — Human tester must execute Section 3 checklist
on a physical tablet before launch sign-off.

Agent limitation: The QA agent cannot execute on-device tests. This
plan must be run manually on an Android tablet (Chrome) and optionally
an iPad (Safari). Results should be recorded here and the task
re-completed with PASS/FAIL verdict.
