# E2E Test Plan: Menu Menulis (Tracing Canvas)

**Target Feature**: `/app/play/{level}/{task}` - Tracing/writing exercise screen  
**Stack**: Bun + React 19 + PixiJS v8 + Dexie (IndexedDB)  
**Devices**: Desktop (Chrome/Firefox/Safari), Mobile (iOS Safari, Android Chrome), Tablet  
**Languages**: Indonesian (id), English (en), Arabic (ar) with RTL support

---

## Test Categories

### 1. Happy Path - Basic Flow

#### 1.1 Session Creation & Name Entry
- [ ] **TC-001**: User opens `/app/` → name entry form displays
- [ ] **TC-002**: Enter child name (5-20 chars) → "Mulai" button enabled
- [ ] **TC-003**: Enter parent name (optional) → both names saved to session storage
- [ ] **TC-004**: Click "Mulai" → redirects to `/app/play`
- [ ] **TC-005**: Session persists across page refresh (name retained)
- [ ] **TC-006**: Second visit skips name entry (existing session)

#### 1.2 Task Selection
- [ ] **TC-010**: `/app/play` displays level categories (upper-a, lower-a, etc.)
- [ ] **TC-011**: Click level → shows task list (apel, bola, etc.)
- [ ] **TC-012**: Click task → redirects to `/app/play/{level}/{task}`

#### 1.3 Tracing Canvas - Core Interaction
- [ ] **TC-020**: Canvas loads with letter/image visible
- [ ] **TC-021**: Guide dots render (dark brown #8a7663, visible contrast)
- [ ] **TC-022**: Guide dots positioned correctly along target path
- [ ] **TC-023**: Touch/mouse drag draws stroke on canvas (teal #38bcc3)
- [ ] **TC-024**: Stroke follows pointer smoothly (no lag <100ms)
- [ ] **TC-025**: Multiple strokes accumulate (don't overwrite previous)
- [ ] **TC-026**: Stroke width consistent (~12px)
- [ ] **TC-027**: Release pointer → stroke completes

#### 1.4 Progress & Completion
- [ ] **TC-030**: Complete tracing → success feedback (visual/audio)
- [ ] **TC-031**: Task marked complete in storage (Dexie)
- [ ] **TC-032**: Progress badge updates on task list
- [ ] **TC-033**: Navigate back → completed task shows checkmark

---

### 2. Edge Cases - Canvas Behavior

#### 2.1 Drawing Boundaries
- [ ] **TC-100**: Draw outside canvas bounds → stroke clips at edge
- [ ] **TC-101**: Start stroke inside, drag outside → stroke continues until release
- [ ] **TC-102**: Start stroke outside → no stroke recorded
- [ ] **TC-103**: Rapid strokes (10+ in 5sec) → all recorded without dropped events

#### 2.2 Pointer Input Variations
- [ ] **TC-110**: Mouse click-drag → stroke renders
- [ ] **TC-111**: Touch drag (single finger) → stroke renders
- [ ] **TC-112**: Multi-touch (2+ fingers) → only first touch draws
- [ ] **TC-113**: Stylus/Apple Pencil → stroke renders with pressure (if supported)
- [ ] **TC-114**: Touch palm rejection (if available)

#### 2.3 Stroke Data
- [ ] **TC-120**: Empty stroke (tap without drag) → not saved
- [ ] **TC-121**: Single-point stroke (tap+release <50ms) → saves as dot
- [ ] **TC-122**: Very long stroke (500+ points) → saves completely
- [ ] **TC-123**: Stroke data persists in IndexedDB after completion

#### 2.4 Viewport & Orientation
- [ ] **TC-130**: Portrait mode → canvas fits viewport, maintains aspect ratio
- [ ] **TC-131**: Landscape mode → canvas resizes correctly
- [ ] **TC-132**: Device rotation (portrait ↔ landscape) → canvas resizes, strokes preserved
- [ ] **TC-133**: Viewport zoom (pinch/Ctrl+scroll) → canvas scales, strokes still accurate
- [ ] **TC-134**: Browser window resize (desktop) → canvas resizes, strokes preserved

---

### 3. Error States & Recovery

#### 3.1 Asset Loading Failures
- [ ] **TC-200**: JS bundle 404 → error boundary displays fallback UI
- [ ] **TC-201**: CSS bundle 404 → unstyled content usable
- [ ] **TC-202**: Slow network (3G throttle) → loading indicator, canvas waits until ready
- [ ] **TC-203**: Offline mode → service worker serves cached assets
- [ ] **TC-204**: Asset hash mismatch (stale cache) → force reload shows updated version

#### 3.2 Canvas Initialization Failures
- [ ] **TC-210**: PixiJS init fails (WebGL unavailable) → fallback to Canvas2D or error message
- [ ] **TC-211**: Canvas element not mounted → error logged, retry or graceful degradation
- [ ] **TC-212**: Task data missing (invalid level/task ID) → 404 page or redirect to `/app/play`

#### 3.3 Storage Failures
- [ ] **TC-220**: IndexedDB quota exceeded → alert user, clear old data or continue without save
- [ ] **TC-221**: IndexedDB access denied (incognito mode) → fallback to sessionStorage or warn user
- [ ] **TC-222**: Storage corruption → clear DB, restart session

#### 3.4 Session Edge Cases
- [ ] **TC-230**: No session (direct link to `/app/play/upper-a/apel`) → redirect to name entry
- [ ] **TC-231**: Session expired (24h+ old) → prompt re-entry
- [ ] **TC-232**: Multiple tabs/windows → session syncs across tabs (or isolated)

---

### 4. Localization & RTL

#### 4.1 Language Switching
- [ ] **TC-300**: Default language = Indonesian (id)
- [ ] **TC-301**: Switch to English → UI labels update
- [ ] **TC-302**: Switch to Arabic → UI labels update + RTL layout applied
- [ ] **TC-303**: Canvas rendering unaffected by RTL (LTR drawing preserved)
- [ ] **TC-304**: Language persists across sessions

#### 4.2 RTL Layout (Arabic)
- [ ] **TC-310**: Text alignment right-to-left
- [ ] **TC-311**: Button order reversed (e.g., "Back" on right)
- [ ] **TC-312**: Icon mirroring where appropriate
- [ ] **TC-313**: Canvas positioned correctly in RTL layout

---

### 5. Performance & Accessibility

#### 5.1 Performance
- [ ] **TC-400**: Canvas renders at 60fps during drawing (no frame drops)
- [ ] **TC-401**: Initial load <3s on 4G network
- [ ] **TC-402**: Memory usage <100MB after 10 completed tasks
- [ ] **TC-403**: No memory leaks (heap stable after 20 task cycles)

#### 5.2 Accessibility
- [ ] **TC-410**: Keyboard navigation (Tab, Enter, Escape) functional
- [ ] **TC-411**: Screen reader announces canvas state (VoiceOver/TalkBack)
- [ ] **TC-412**: Focus visible on interactive elements
- [ ] **TC-413**: Color contrast WCAG AA (text, buttons, strokes)
- [ ] **TC-414**: Touch targets ≥44x44px (mobile)

---

### 6. Cross-Browser & Device Matrix

#### Desktop
- [ ] Chrome 120+ (Windows/Mac/Linux)
- [ ] Firefox 121+ (Windows/Mac/Linux)
- [ ] Safari 17+ (Mac)
- [ ] Edge 120+ (Windows)

#### Mobile
- [ ] iOS Safari 17+ (iPhone 12, 14, 15)
- [ ] Android Chrome 120+ (Pixel 6, Samsung S23)
- [ ] Android Firefox 121+ (Pixel 6)

#### Tablet
- [ ] iPad Safari 17+ (iPad Air, iPad Pro)
- [ ] Android Chrome (Samsung Tab S9)

---

## Test Data

### Valid Inputs
- Child names: "Andi", "Budi Santoso", "أحمد" (Arabic), "Test Child 123"
- Parent names: "", "Ibu Siti", "Mr. Smith", null

### Invalid Inputs
- Child name <5 chars: "A", "An", "Test"
- Child name >20 chars: "Very Long Name That Exceeds Twenty Characters"
- Special chars: "<script>", "'; DROP TABLE--", "../../etc/passwd"

### Task Paths
- Valid: `/app/play/upper-a/apel`, `/app/play/lower-b/bola`
- Invalid: `/app/play/invalid/xyz`, `/app/play//`, `/app/play/upper-a/`

---

## Automation Strategy

### Framework Recommendation
- **Playwright** (supports Chromium/Firefox/WebKit, mobile emulation, touch events)
- **Bun test runner** (already in project, fast execution)

### Test Organization
```
tests/e2e/
├── tracing/
│   ├── happy-path.spec.ts          # TC-001 to TC-033
│   ├── canvas-edge-cases.spec.ts   # TC-100 to TC-134
│   ├── error-handling.spec.ts      # TC-200 to TC-232
│   ├── localization.spec.ts        # TC-300 to TC-313
│   ├── performance.spec.ts         # TC-400 to TC-403
│   └── accessibility.spec.ts       # TC-410 to TC-414
└── helpers/
    ├── session.ts                   # Session setup helpers
    ├── canvas.ts                    # Canvas interaction helpers
    └── storage.ts                   # IndexedDB helpers
```

### CI Integration
- Run on PR (smoke tests: TC-001 to TC-033)
- Nightly full suite (all 60+ test cases)
- Visual regression tests (Percy/Chromatic)

---

## Acceptance Criteria

- [ ] All happy path tests (TC-001 to TC-033) pass on Chrome/Safari/Firefox
- [ ] All edge cases (TC-100 to TC-134) pass on 2+ browsers
- [ ] Error states (TC-200 to TC-232) gracefully handled (no blank screens)
- [ ] RTL layout (TC-300 to TC-313) correct for Arabic
- [ ] Performance targets met (TC-400 to TC-403)
- [ ] WCAG AA compliance (TC-410 to TC-414) verified manually

---

## Out of Scope (Future Iterations)
- Offline-first PWA (full offline mode with sync)
- Advanced PixiJS features (filters, animations)
- Multi-user collaboration
- Server-side progress sync

---

**Created**: 2026-10-04  
**Author**: Hermes Agent  
**Status**: Ready for QA Implementation
