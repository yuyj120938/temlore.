# Temlore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first Temlore web app that supports the confirmed letter-writing, timed sealing, desk-drawer, and opening experience locally for acceptance.

**Architecture:** A Vite + React client owns the mobile UI, animation state machine, editor, and local draft interactions. A small Node/Express service owns account/session operations, hashed credentials, server-time sealing checks, letter state transitions, and local file storage. SQLite stores users, recovery-code hashes, letters, and photo metadata; uploaded images live under a controlled local storage directory.

**Tech Stack:** React, TypeScript, Vite, CSS animations/transitions, Node.js, Express, SQLite, Vitest, Testing Library, Playwright.

---

### Task 1: Scaffold the client and local service

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `server/index.ts`
- Create: `server/db.ts`
- Create: `tests/smoke/app-start.test.ts`

- [ ] **Step 1: Write the startup smoke test**

  Add a test that imports the client entry and asserts the root app component exists, and starts the service with an in-memory SQLite database for a health response.

- [ ] **Step 2: Run the smoke test and verify it fails**

  Run `npm test -- tests/smoke/app-start.test.ts`. Expected: FAIL because the project files and scripts do not yet exist.

- [ ] **Step 3: Create the minimal Vite/Express project**

  Add scripts `dev`, `build`, `test`, `test:e2e`, and `server`. Configure Vite to proxy `/api` to the local service. Render a single `#root` element from `src/main.tsx`; expose `GET /api/health` from `server/index.ts`.

- [ ] **Step 4: Run the smoke test and build**

  Run `npm test -- tests/smoke/app-start.test.ts` and `npm run build`. Expected: PASS and a successful Vite production build.

- [ ] **Step 5: Commit**

  Run `git add package.json vite.config.ts tsconfig.json src server tests && git commit -m "chore: scaffold Temlore web app"`.

### Task 2: Add shared design tokens and mobile shell

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/components/MobileFrame.tsx`
- Create: `src/components/BlueSeal.tsx`
- Create: `src/components/FloatingShapes.tsx`
- Create: `tests/components/blue-seal.test.tsx`

- [ ] **Step 1: Write the failing visual-token test**

  Test that `BlueSeal` renders a circular element with `#B2EEFF`, an inner clock mark using `#98C6FF`, and a compact Logo variant whose diameter is only slightly larger than the adjacent `r` glyph.

- [ ] **Step 2: Implement tokens and primitives**

  Define `--page-bg: #FFFFFF`, `--wax: #B2EEFF`, `--clock: #98C6FF`, `--desk: #E8E1D5`, and deeper desk steps. Make all page canvases white; keep wood/desk color only on the desk object. Add reduced-motion media rules.

- [ ] **Step 3: Run the component test**

  Run `npm test -- tests/components/blue-seal.test.tsx`. Expected: PASS.

- [ ] **Step 4: Commit**

  Run `git add src/styles src/components tests/components && git commit -m "feat: add Temlore visual primitives"`.

### Task 3: Implement startup animation and home screen

**Files:**
- Create: `src/features/intro/IntroAnimation.tsx`
- Create: `src/features/home/HomePage.tsx`
- Create: `src/features/home/home.css`
- Modify: `src/app/App.tsx`
- Create: `tests/features/intro/intro-flow.test.tsx`

- [ ] **Step 1: Write the intro flow test**

  Assert the sequence is floating background shapes → wax drop → circular seal clock → `Teml`/`re` reveal, and that the intro emits a completion event once after roughly three seconds.

- [ ] **Step 2: Implement the animation state machine**

  Use named states rather than chained page changes. Keep the Logo seal compact; use opaque blue seal only for the completed stamp and blue clock details. Respect `prefers-reduced-motion` by shortening to a fade sequence.

- [ ] **Step 3: Implement the confirmed HomePage**

  Render the pure-white canvas, muted floating circles, editorial bilingual content, central envelope, `Start writing`, and top-left account trigger. The same envelope component must be reusable by the opening animation.

- [ ] **Step 4: Verify**

  Run `npm test -- tests/features/intro/intro-flow.test.tsx`, then `npm run build`. Expected: PASS and build success.

- [ ] **Step 5: Commit**

  Run `git add src/app src/features/intro src/features/home tests/features/intro && git commit -m "feat: add Temlore intro and home"`.

### Task 4: Implement account and recovery-code service

**Files:**
- Create: `server/auth.ts`
- Create: `server/auth-routes.ts`
- Create: `src/features/auth/AuthPage.tsx`
- Create: `src/features/auth/auth.css`
- Create: `tests/server/auth.test.ts`
- Create: `tests/features/auth/auth-page.test.tsx`

- [ ] **Step 1: Write failing auth tests**

  Cover registration with phone/password, password hash storage, login success/failure without account enumeration, one-time recovery-code display, recovery-code rotation, and session creation.

- [ ] **Step 2: Implement the SQLite schema and auth routes**

  Store only password and recovery-code hashes. Return a generic login error. Add rate-safe input validation for phone and password fields. Never implement SMS delivery.

- [ ] **Step 3: Implement the confirmed login UI**

  Use the full-screen editorial layout with interleaved translucent fields, pure-white underlying canvas, blue Logo seal, and bottom arch. Unauthenticated `Start writing` routes here; successful login returns to the pending opening action.

- [ ] **Step 4: Run tests**

  Run `npm test -- tests/server/auth.test.ts tests/features/auth/auth-page.test.tsx`. Expected: PASS.

- [ ] **Step 5: Commit**

  Run `git add server/auth.ts server/auth-routes.ts src/features/auth tests/server tests/features/auth && git commit -m "feat: add local account authentication"`.

### Task 5: Implement letter data model, drafts, uploads, and editor

**Files:**
- Create: `server/letters.ts`
- Create: `server/letter-routes.ts`
- Create: `server/uploads.ts`
- Create: `src/features/editor/LetterEditor.tsx`
- Create: `src/features/editor/editor.css`
- Create: `src/features/editor/photo-frame.css`
- Create: `tests/server/letters.test.ts`
- Create: `tests/features/editor/editor.test.tsx`

- [ ] **Step 1: Write failing letter/editor tests**

  Cover draft autosave after an idle debounce, whole-letter Songti/Kaiti selection, insertion/removal of optional photos, a maximum of nine compressed photos, and draft restoration after reload.

- [ ] **Step 2: Implement letter and upload routes**

  Store draft body, font choice, status, and photo metadata. Reject a tenth photo. Compress accepted image files before writing them into the local storage directory. Keep photo bytes out of normal letter JSON responses when sealed.

- [ ] **Step 3: Implement the editor**

  Render the independent pure-white paper with visible gaps and translucent toolbar. Insert photos only after explicit user action; render uploaded photos in warm-white Polaroid frames with optional captions. Show `DRAFT SAVED` only after the save response succeeds.

- [ ] **Step 4: Run tests**

  Run `npm test -- tests/server/letters.test.ts tests/features/editor/editor.test.tsx`. Expected: PASS.

- [ ] **Step 5: Commit**

  Run `git add server/letters.ts server/letter-routes.ts server/uploads.ts src/features/editor tests/server tests/features/editor && git commit -m "feat: add letter editor and draft storage"`.

### Task 6: Implement server-time sealing and ring selector

**Files:**
- Create: `server/time.ts`
- Create: `server/sealing.ts`
- Create: `src/features/sealing/TimeRing.tsx`
- Create: `src/features/sealing/sealing.css`
- Create: `tests/server/sealing.test.ts`
- Create: `tests/features/sealing/time-ring.test.tsx`

- [ ] **Step 1: Write failing sealing tests**

  Cover preset durations (10 seconds, 1 day, 7 days, 30 days, 1 year), custom dates, server-time comparison, immutable sealed content, and deletion requiring password plus confirmation.

- [ ] **Step 2: Implement server-time transitions**

  Save `sealedAt` and `opensAt` from service time. Return only status/countdown metadata while sealed. Reject edits, reads, and date changes until the service says the letter is openable.

- [ ] **Step 3: Implement the ring selector**

  Present explicit ring ticks and labels for every preset plus a custom-date route. Require a final warning confirmation before sealing.

- [ ] **Step 4: Run tests**

  Run `npm test -- tests/server/sealing.test.ts tests/features/sealing/time-ring.test.tsx`. Expected: PASS.

- [ ] **Step 5: Commit**

  Run `git add server/time.ts server/sealing.ts src/features/sealing tests/server tests/features/sealing && git commit -m "feat: add server-time sealing"`.

### Task 7: Implement sealing, desk timeline, opening, and reading

**Files:**
- Create: `src/features/sealing/SealingAnimation.tsx`
- Create: `src/features/desk/TimelineDrawer.tsx`
- Create: `src/features/desk/MemoryDesk.tsx`
- Create: `src/features/reading/LetterReader.tsx`
- Create: `src/features/desk/desk.css`
- Create: `tests/e2e/letter-lifecycle.spec.ts`

- [ ] **Step 1: Write the lifecycle test**

  In Playwright, register, log in, create a draft, seal for 10 seconds, assert sealed content is unavailable, wait for server time to pass, select the arrived letter, open the desk drawer, click the opaque blue seal, and assert the letter becomes permanently readable.

- [ ] **Step 2: Implement the sealing animation**

  Animate fold → envelope → closure → blue wax drop → opaque circular blue seal → drawer storage only after the server confirms the sealed record.

- [ ] **Step 3: Implement timeline and desk**

  Display draft, sealing, arrived, and opened states in the left rail. Use a pure-white page canvas and `#E8E1D5` desk object with deeper same-hue drawer layers. The selected arrived letter alone reaches the center drawer.

- [ ] **Step 4: Implement opening and reader**

  Animate drawer extraction, seal press, and paper expansion with surrounding white gaps. On first successful open, transition the server status to `opened`; later reads can skip the ceremony.

- [ ] **Step 5: Run the lifecycle test and build**

  Run `npm run test:e2e` and `npm run build`. Expected: PASS with no console errors.

- [ ] **Step 6: Commit**

  Run `git add src/features/sealing src/features/desk src/features/reading tests/e2e && git commit -m "feat: complete letter lifecycle animations"`.

### Task 8: Final local acceptance and handoff

**Files:**
- Modify: `README.md`
- Create: `tests/e2e/reduced-motion.spec.ts`
- Create: `docs/acceptance/temlore-local-checklist.md`

- [ ] **Step 1: Add reduced-motion coverage**

  Assert that intro, opening, sealing, and reading remain usable when `prefers-reduced-motion: reduce` is enabled.

- [ ] **Step 2: Run the complete verification set**

  Run `npm test`, `npm run test:e2e`, and `npm run build`. Expected: all tests pass and build succeeds.

- [ ] **Step 3: Write the local acceptance checklist**

  Document exact commands, local URL, test account creation, 10-second seal scenario, photo upload scenario, deletion confirmation, and recovery-code scenario.

- [ ] **Step 4: Update README and commit**

  Document `npm install`, `npm run dev`, `npm run server`, and the local acceptance flow. Commit with `git add README.md docs/acceptance tests/e2e/reduced-motion.spec.ts && git commit -m "docs: add Temlore local acceptance guide"`.
