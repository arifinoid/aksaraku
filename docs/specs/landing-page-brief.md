# Landing Page Design Brief — Aksaraku

> Sprint 1 deliverable for `frontend-dev`. This brief is the single source of truth for the marketing landing page that will sit at `aksaraku.pages.dev`.

---

## 1. Purpose & Goals

**Primary goal**: Convert visiting parents into PWA installs. The landing page is the front door of the product — it must communicate what Aksaraku is, who it's for, and why they should install it, all within one scroll on a tablet or phone.

**Secondary goals**:
- Establish trust (no ads, offline, privacy-safe, COPPA-adjacent sensibility)
- Showcase the playful, warm visual identity already established in-app
- Support i18n: `id` (default), `en`, `ar` (RTL) — same i18next stack as the app
- Achieve Lighthouse PWA/Performance score ≥ 90 on mobile

**Success metrics** (for post-launch tracking, not blocking Sprint 1):
- Install conversion rate (visitors → "Add to Home Screen")
- Bounce rate < 50%
- Lighthouse Performance ≥ 90, Accessibility ≥ 95

---

## 2. Target Audience

| Segment | Primary | Secondary |
|---------|---------|-----------|
| **Who** | Parents of toddlers aged 3–6, in Indonesia | Parents in EN/AR-speaking households |
| **Device** | Android tablet (primary), iPad, large phone | Desktop (secondary) |
| **Concern** | "Is this safe and useful for my child?" | "Will it work offline / without data?" |
| **Language** | Bahasa Indonesia (default) | English, Arabic (RTL) |

The page speaks to **the parent**, not the child. The child interacts with the installed app, not the landing page.

---

## 3. Product Snapshot (for copy reference)

Aksaraku is a PWA (installable, offline-first) education app for toddlers 3+:

| Feature | What it does |
|---------|-------------|
| **Writing/Tracing** | Trace huruf (letters), angka (numbers), and bentuk (shapes) with precise touch feedback via PixiJS canvas. Stroke-by-stroke guidance, audio phonemes, accuracy scoring. |
| **Mini Games** | Matching (big/small, letter/picture), Pop the Balloon, Coloring. Reinforce recognition through play. |
| **Gamification** | Sticker/trophy/character collection. Stars and mastery levels (New → Learning → Familiar → Mastered). Unlock rewards by practicing. |
| **Character Avatar** | Customizable 3D character (color, ears, eyes, accessory) as a companion. |
| **Parent Dashboard** | Progress report (mastered/tried/stars), writing quality, screen-time limits, break reminders, multi-child profiles. Parental gate (math question) before settings. |
| **Languages** | id (Bahasa Indonesia), en (English), ar (Arabic, full RTL). Per-child language setting. |
| **Offline & Safe** | 100% offline after install. No ads. No account required. Data stays on-device (IndexedDB). |

**Tagline**: "Belajar sambil bermain" / "Learn while playing"

---

## 4. Design System (reuse app tokens)

The landing page MUST reuse the in-app design tokens defined in `src/index.css`. Do not invent new colors or fonts.

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--c-bg` | `#fff7e6` | Page background (warm cream) |
| `--c-bg-2` | `#ffeccf` | Gradient accent |
| `--c-surface` | `#ffffff` | Cards, panels |
| `--c-ink` | `#3d2b1f` | Body text (dark brown) |
| `--c-muted` | `#8a7663` | Secondary text |
| `--c-primary` | `#ff7a45` | Primary buttons, highlights (orange) |
| `--c-primary-dark` | `#e85f2b` | Button hover/active |
| `--c-accent` | `#ffd166` | Stars, rewards (yellow) |
| `--c-secondary` | `#4cc9f0` | Links, focus ring (cyan) |
| `--c-success` | `#57cc99` | Positive states |
| `--c-danger` | `#ef476f` | Warnings |

### Typography
- Font: `"Nunito", "Baloo 2", "Segoe UI", system-ui, sans-serif` (playful, rounded)
- Arabic: `"Noto Naskh Arabic", "Noto Sans Arabic", "Segoe UI", Tahoma, system-ui, sans-serif`
- Headings: Baloo 2 (if available), fallback Nunito bold
- Body: Nunito, 16–18px base, 1.6 line-height

### Shape & Space
- Border radius: `12px` (small), `20px` (medium), `28px` (large), `999px` (pill)
- Shadows: `0 4px 0 rgba(61,43,31,0.12)` (soft), `0 8px 24px rgba(61,43,31,0.16)` (pop)
- Spacing scale: `0.5 / 0.75 / 1 / 1.5 / 2rem`

### Logo
- SVG at `public/icon.svg` — rounded orange square with cream "A" mark + yellow star accent. Reuse as-is.

### Motion
- Respect `prefers-reduced-motion` and `[data-motion="reduced"]` (same as app)
- Subtle entrance animations only (fade + translateY, ≤ 400ms)
- No autoplay video, no looping animation that can't be paused

---

## 5. Page Structure (single-page scroll)

```
┌─────────────────────────────────────────────┐
│ NAV BAR (sticky)                             │
│  [logo] Aksaraku    [lang switch] [Install] │
├─────────────────────────────────────────────┤
│ HERO                                         │
│  Tagline + "Learn while playing"            │
│  [Install App] [See how it works]           │
│  (app screenshot / mockup)                   │
├─────────────────────────────────────────────┤
│ FEATURE GRID (3–4 cards)                     │
│  ✍️ Writing  🎮 Games  ⭐ Rewards  👤 Parent │
├─────────────────────────────────────────────┤
│ HOW IT WORKS (3 steps)                       │
│  1. Install  2. Pick a child  3. Start      │
├─────────────────────────────────────────────┤
│ TRUST / WHY AKSARAKU                         │
│  Offline • No ads • No account • Safe       │
├─────────────────────────────────────────────┤
│ LANGUAGES (id / en / ar RTL)                │
├─────────────────────────────────────────────┤
│ CTA FOOTER                                   │
│  [Install App]   links: GitHub, privacy     │
└─────────────────────────────────────────────┘
```

### Section specs

**Nav bar** (sticky, `--c-surface` background with `--shadow-soft`)
- Logo + "Aksaraku" wordmark
- Language switcher (reuse i18next, cycle id/en/ar — or dropdown)
- "Install" button (`--c-primary`, pill shape) — triggers PWA install prompt or scrolls to instructions
- Min touch target 64px on mobile (same as app convention)

**Hero**
- H1: app tagline from i18n (`app.tagline`) — "Belajar sambil bermain" / "Learn while playing"
- Subhead: one-line description (see copy §7 below)
- Primary CTA: "Install App" (PWA install or instructions)
- Secondary CTA: "See how it works" (scrolls to How It Works)
- Visual: mockup of the app (tracing screen) — can be a static screenshot or SVG illustration reusing design tokens. No video (offline ethos + performance).
- Background: radial gradient `circle at 20% 0%, var(--c-bg-2), var(--c-bg) 60%` (matches app body)

**Feature grid** (4 cards, responsive 1×4 → 2×2 → 4×1)
Each card: icon (emoji or SVG), title, 1–2 sentence description. Cards use `--c-surface` bg, `--radius-md`, `--shadow-soft`.
- ✍️ Writing — "Trace huruf, angka, dan bentuk dengan panduan langkah demi langkah."
- 🎮 Games — "Cocokkan, pecahkan balon, dan mewarnai sambil belajar."
- ⭐ Rewards — "Kumpulkan stiker, piala, dan karakter setiap berlatih."
- 👤 Parent Dashboard — "Pantau perkembangan, atur batas waktu, dan kelola profil anak."

**How it works** (3 horizontal steps with connecting line)
1. Install — "Tambahkan ke layar utama"
2. Choose child — "Buat profil untuk si kecil"
3. Start learning — "Pilih huruf, angka, atau permainan"

**Trust section** (row of 4 badges/pills)
- 📴 Offline — "Berfungsi tanpa internet"
- 🚫 No ads — "Tanpa iklan, tanpa gangguan"
- 🔒 Private — "Data tersimpan di perangkat"
- 👨‍👩‍👧 Multi-child — "Profil untuk setiap anak"

**Languages** (3 flags/labels)
- 🇮🇩 Bahasa Indonesia
- 🇬🇧 English
- 🇸🇦 العربية (RTL)

**CTA Footer**
- Big "Install App" button
- Small links: GitHub repo, Privacy notes (if any), "Made with ❤️ by Rohmad's AI Engineering Team"

---

## 6. Copy (i18n strings — DO NOT hardcode)

All user-facing text MUST go through i18next, using the existing locale dictionaries in `src/i18n/locales/`. Add a new `landing` namespace to each locale file (`id.ts`, `en.ts`, `ar.ts`) and the `Dict` type in `types.ts`.

### Proposed i18n keys (add to each locale)

```
landing: {
  nav: {
    install: "Pasang Aplikasi",      // id
    // en: "Install App"
    // ar: "تثبيت التطبيق"
  },
  hero: {
    tagline: "Belajar sambil bermain",  // reuse app.tagline
    subtitle: "Aplikasi edukasi interaktif untuk balita 3+. Menulis, bermain, dan belajar — tanpa internet, tanpa iklan.",
    ctaInstall: "Pasang Sekarang",
    ctaHow: "Lihat cara kerjanya",
  },
  features: {
    title: "Apa yang ada di Aksaraku?",
    writing: { title: "Menulis", desc: "Trace huruf, angka, dan bentuk dengan panduan langkah demi langkah." },
    games: { title: "Permainan", desc: "Cocokkan, pecahkan balon, dan mewarnai sambil belajar." },
    rewards: { title: "Hadiah", desc: "Kumpulkan stiker, piala, dan karakter setiap berlatih." },
    parent: { title: "Dashboard Orang Tua", desc: "Pantau perkembangan, atur batas waktu, dan kelola profil anak." },
  },
  how: {
    title: "Cara Memulai",
    step1: { title: "Pasang", desc: "Tambahkan ke layar utama" },
    step2: { title: "Pilih Anak", desc: "Buat profil untuk si kecil" },
    step3: { title: "Mulai Belajar", desc: "Pilih huruf, angka, atau permainan" },
  },
  trust: {
    title: "Mengapa Aksaraku?",
    offline: "Berfungsi tanpa internet",
    noAds: "Tanpa iklan, tanpa gangguan",
    private: "Data tersimpan di perangkat",
    multiChild: "Profil untuk setiap anak",
  },
  languages: {
    title: "Tiga Bahasa",
    id: "Bahasa Indonesia",
    en: "English",
    ar: "العربية (RTL)",
  },
  footer: {
    cta: "Mulai Sekarang",
    madeBy: "Dibuat dengan ❤️ oleh Tim AI Engineering Rohmad",
  },
}
```

**Copywriting rules**:
- Tone: warm, parent-to-parent, simple words (this is for parents of toddlers, not developers)
- No jargon, no "PWA", no "IndexedDB", no "Service Worker" in user-facing copy
- Keep subtitles under 15 words
- Use the app's existing voice from the i18n files as reference

---

## 7. Technical Implementation

### Route
- Option A (preferred): separate `/landing` route that serves a lightweight landing page, with the app still at `/`.
- Option B: the landing page IS the root `/`, and the app loads after "Install" / "Open App" click.
- **Decision needed from frontend-dev** — recommend Option A for clean separation. The landing page should be lightweight (no PixiJS, no Three.js, no Dexie). It should load fast (< 3s on 3G).

### Tech constraints (from CLAUDE.md)
- Runtime: Bun (HTML imports, `Bun.serve`)
- No Vite, no Express, no new dependencies
- Build: `NODE_ENV=production bun run build`
- The landing page should be a **separate HTML entry** or a lazy-loaded route that does NOT pull in PixiJS/Three/Dexie bundles. This keeps the landing page bundle tiny and fast.
- CSS: reuse `src/index.css` tokens. Landing-specific CSS in a new `src/features/landing/landing.css`.
- i18n: reuse the existing i18next instance. Add the `landing` namespace to all three locale files.

### PWA Install
- Listen for `beforeinstallprompt` event, store it, and trigger on "Install" button click.
- If the prompt isn't available (iOS Safari, desktop Firefox), show instructions modal ("Tap Share → Add to Home Screen").
- Do NOT show a fake install button — degrade gracefully with instructions.

### Performance budget
- Landing page JS bundle: < 50 KB gzipped (no PixiJS, no Three, no Dexie)
- Landing page CSS: < 10 KB gzipped
- First Contentful Paint: < 2s on 3G
- No render-blocking scripts; use `defer` or module scripts

### Accessibility
- WCAG 2.1 AA minimum (target the same a11y standards as the app)
- Color contrast: the `--c-ink` (#3d2b1f) on `--c-bg` (#fff7e6) ratio is ~9.5:1 ✓
- All interactive elements: 64px min touch target, `:focus-visible` ring (reuse `--c-secondary` outline)
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- `aria-label` on icon-only buttons (language switcher, install)
- Skip-to-content link
- `lang` and `dir` attributes on `<html>` set dynamically per locale (RTL for `ar`)

### SEO / Meta
- `<title>`: "Aksaraku — Belajar sambil bermain"
- `<meta name="description">`: reuse hero subtitle
- Open Graph tags: `og:title`, `og:description`, `og:image` (use `icon.svg` or a dedicated OG image)
- `<link rel="canonical" href="https://aksaraku.pages.dev/">`
- JSON-LD: `WebApplication` schema with `applicationCategory: "Education"`

### Deployment
- Served from same Cloudflare Pages domain (`aksaraku.pages.dev`)
- If Option A: landing at `/landing`, app at `/`. Or landing at `/` and app at `/app`.
- @devops: ensure Cloudflare Pages routing handles both paths.

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, stacked sections, hamburger nav |
| Tablet | 640–1024px | 2-column feature grid, full nav |
| Desktop | > 1024px | 4-column feature grid, centered max-width 1100px |

The landing page is mobile-first (parents will visit from their phone/tablet).

---

## 9. Assets Needed

| Asset | Source | Status |
|-------|--------|--------|
| Logo SVG | `public/icon.svg` | ✅ exists, reuse |
| App screenshot/mockup | New — static SVG or screenshot of tracing screen | ❌ needs creation (frontend-dev) |
| Feature icons | Emoji (✍️🎮⭐👤) or inline SVG | ✅ use emoji for simplicity |
| OG image | 1200×630px PNG or SVG | ❌ needs creation |
| Favicon | `public/icon.svg` | ✅ exists |

---

## 10. Acceptance Criteria

- [ ] Landing page renders at `/` (or `/landing`) with all 7 sections
- [ ] All text uses i18next — no hardcoded strings (test by switching to `en` and `ar`)
- [ ] RTL layout works correctly for `ar` (mirrored layout, `dir="rtl"`)
- [ ] "Install" button triggers `beforeinstallprompt` or shows platform-appropriate instructions
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, PWA = installable
- [ ] Landing page bundle excludes PixiJS, Three.js, Dexie (verify in build output)
- [ ] Touch targets ≥ 64px on all interactive elements
- [ ] `prefers-reduced-motion` respected (no autoplay animation)
- [ ] OG meta tags present and valid
- [ ] `bunx tsc --noEmit` passes
- [ ] Works offline after first load (Service Worker caches landing assets)

---

## 11. Out of Scope (Sprint 1)

- Analytics / tracking (Sprint 2)
- A/B testing of headlines (Sprint 2+)
- Blog or content marketing pages
- Testimonials / social proof (no users yet)
- App store screenshots (PWA only, no native stores)
- Dedicated privacy policy page (link to a simple markdown → HTML if needed)

---

## 12. Handoff

| Deliverable | Owner | Destination |
|-------------|-------|-------------|
| This design brief | planner (✅ done) | `docs/specs/landing-page-brief.md` |
| Landing page implementation | `@frontend-dev` | `src/features/landing/` + route |
| i18n strings (id/en/ar) | `@frontend-dev` | `src/i18n/locales/{id,en,ar}.ts` |
| Deploy & routing | `@devops` | Cloudflare Pages |
| QA: a11y + Lighthouse audit | `@qa-engineer` | Test report |

**Follow-up tasks** to be created by planner after this brief is reviewed:
1. `@frontend-dev` — Implement landing page per this brief
2. `@devops` — Configure Cloudflare Pages routing for landing + app paths

---

## 13. Open Questions (for Rohmad)

1. **Root path strategy**: Should the landing page be at `/` (and app at `/app`), or landing at `/landing` (and app at `/`)? Recommend: landing at `/`, app at `/app` — the landing page is the front door.
2. **Custom domain**: Do we want `aksaraku.com` (or `.id`) in addition to `aksaraku.pages.dev`? This affects canonical URL and OG tags.
3. **GitHub link**: Should the footer link to a public repo, or keep it private for now?

These do not block implementation — frontend-dev can proceed with Option A (separate route) and Rohmad can adjust later.
