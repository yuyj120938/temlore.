# Temlore Interaction Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish four existing Temlore interactions without changing the accepted overall visual design.

**Architecture:** Keep `App` as the local state router and preserve the existing feature components. Add a local draft serializer for editor persistence, render the timeline as an overlay inside Home, calculate monotonic time-ring rotations in the time selector, and revise only the final desk portion of the sealing CSS timeline.

**Tech Stack:** React 19, TypeScript, CSS, localStorage, Vitest + Testing Library, Playwright.

---

### Task 1: Start-page sliding letter timeline

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/features/home/HomePage.tsx`
- Modify: `src/features/home/home.css`
- Modify: `src/features/desk/TimelineDrawer.tsx`
- Modify: `src/features/desk/desk.css`
- Test: `tests/features/home/home-page.test.tsx`

- [ ] **Step 1: Write the failing overlay interaction test**

Render `HomePage` with a saved timestamp, click `查看写信时间`, assert that `写给时间的信` appears inside the same Home screen, and click the formatted timestamp to assert `onOpenLetter` runs. Assert there is no `点击查看` text.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `pnpm test -- tests/features/home/home-page.test.tsx`

Expected: FAIL because Home does not own or render the timeline drawer.

- [ ] **Step 3: Implement the overlay drawer**

Add `timelineOpen`, `writtenAt`, and `onOpenLetter` props to `HomePage`. Keep the Home screen mounted and render the drawer plus dismiss backdrop inside it. Remove the separate `timeline` route from `App`. Style the drawer as an absolute left overlay with `width: 67%`, `background: rgba(255,255,255,.78)`, backdrop blur, rounded right corners, and transform transition from `translateX(-105%)` to `translateX(0)`.

- [ ] **Step 4: Run the focused test**

Run: `pnpm test -- tests/features/home/home-page.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the timeline change**

```bash
git add src/app/App.tsx src/features/home/HomePage.tsx src/features/home/home.css src/features/desk/TimelineDrawer.tsx src/features/desk/desk.css tests/features/home/home-page.test.tsx
git commit -m "feat: slide letter history over start page"
```

### Task 2: Persistent editor draft and resizable photos

**Files:**
- Create: `src/features/editor/draftStorage.ts`
- Modify: `src/features/editor/LetterEditor.tsx`
- Modify: `src/features/editor/editor.css`
- Test: `tests/features/editor/editor.test.tsx`
- Test: `tests/features/editor/draft-storage.test.ts`

- [ ] **Step 1: Write failing draft and toolbar tests**

Test that a stored draft restores `body`, `font`, and photo data, that changing body writes the draft, that the visible toolbar includes font and photo controls, and that `onBack` fires immediately. Test the pure serializer with a data URL photo and `{ width, height, scale }` layout.

- [ ] **Step 2: Run editor tests and verify failure**

Run: `pnpm test -- tests/features/editor/editor.test.tsx tests/features/editor/draft-storage.test.ts`

Expected: FAIL because `draftStorage.ts` and persistent photo layout do not exist.

- [ ] **Step 3: Add minimal draft persistence**

Define `EditorDraft` with `body`, `font`, and `photos`. Convert selected image files to data URLs with `FileReader`; save drafts under `temlore.draft`; restore them when the editor mounts. Keep the toolbar fixed within the 393px phone frame and above the paper.

- [ ] **Step 4: Add photo gestures and handles**

Render four corner handles and use pointer movement to change width and height, clamped to the letter-paper content width and viewport height. Handle two active pointers by measuring their distance and updating proportional `scale`. Preserve all dimensions in the draft.

- [ ] **Step 5: Run editor tests**

Run: `pnpm test -- tests/features/editor/editor.test.tsx tests/features/editor/draft-storage.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit editor persistence**

```bash
git add src/features/editor/draftStorage.ts src/features/editor/LetterEditor.tsx src/features/editor/editor.css tests/features/editor/editor.test.tsx tests/features/editor/draft-storage.test.ts
git commit -m "feat: preserve drafts and resize letter photos"
```

### Task 3: Smooth clockwise time ring and styled custom date

**Files:**
- Modify: `src/features/sealing/TimeRing.tsx`
- Modify: `src/features/sealing/sealing.css`
- Test: `tests/features/sealing/time-ring.test.tsx`

- [ ] **Step 1: Write the failing preset and rotation test**

Assert the visible options are `10 秒`, `一周`, `六个月`, and `一年`; click them in sequence and assert the pointer's numeric rotation increases. Select a custom date and confirm that `onConfirm` receives the selected duration and date.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `pnpm test -- tests/features/sealing/time-ring.test.tsx`

Expected: FAIL because old presets remain and rotation is derived from a fixed index.

- [ ] **Step 3: Implement monotonic clockwise rotation**

Replace presets with `10s`, `7d`, `6mo`, and `1y`. Store cumulative turns in state; when selecting any option, calculate the next equivalent angle greater than the current angle. Apply `transition: transform .72s cubic-bezier(.22,.8,.2,1)` to the pointer.

- [ ] **Step 4: Polish the native date control**

Wrap the `datetime-local` input in a purple rounded border using the existing light-purple background token and apply the existing blue selection/focus color. Keep the native picker for mobile reliability and avoid adding a date-library dependency.

- [ ] **Step 5: Run the focused test**

Run: `pnpm test -- tests/features/sealing/time-ring.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit time ring changes**

```bash
git add src/features/sealing/TimeRing.tsx src/features/sealing/sealing.css tests/features/sealing/time-ring.test.tsx
git commit -m "feat: polish future-time selection"
```

### Task 4: Drawer-first storage animation and final verification

**Files:**
- Modify: `src/features/sealing/SealingAnimation.tsx`
- Modify: `src/features/sealing/sealing-animation.css`
- Modify: `tests/e2e/letter-lifecycle.spec.ts`

- [ ] **Step 1: Write the failing animation surface test**

Add semantic classes/states for the desk, drawer, and envelope and assert they render in the sealing view. The Playwright flow should enter a saved session, complete a short letter and time selection, and reach the Start page after sealing.

- [ ] **Step 2: Run tests and verify the missing animation behavior**

Run: `pnpm test -- --run && pnpm exec playwright test tests/e2e/letter-lifecycle.spec.ts`

Expected: component tests pass and the updated lifecycle assertion fails until the new sequence is wired.

- [ ] **Step 3: Match the desk and reorder the animation**

Use the existing `--desk`, `--desk-mid`, and `--desk-deep` colors. Animate the drawer outward first, move the sealed envelope down and back into the open drawer second, then return the drawer to its closed transform. Preserve the prior paper-fold, envelope-close, and blue-seal timings.

- [ ] **Step 4: Run all automated verification**

Run:

```bash
pnpm test -- --run
pnpm build
pnpm exec playwright test
```

Expected: all Vitest files pass, TypeScript/Vite production build succeeds, and all Playwright tests pass.

- [ ] **Step 5: Perform phone visual QA**

Use a 393 × 852 Playwright viewport at `http://127.0.0.1:4173/`. Verify the Home overlay does not exceed two-thirds width, editor toolbar is visible, photo handles stay within the white paper, time pointer rotates clockwise, custom date focus uses purple/blue, and the drawer opens before the envelope enters. Capture screenshots outside the repository.

- [ ] **Step 6: Commit the animation and QA test**

```bash
git add src/features/sealing/SealingAnimation.tsx src/features/sealing/sealing-animation.css tests/e2e/letter-lifecycle.spec.ts
git commit -m "feat: store sealed letters in opening drawer"
```

### Task 5: Phone-scoped letters and final letter snapshots

**Files:**
- Create: `src/features/letters/letterStorage.ts`
- Modify: `src/app/App.tsx`
- Modify: `src/features/auth/AuthPage.tsx`
- Modify: `src/features/editor/draftStorage.ts`
- Modify: `src/features/editor/LetterEditor.tsx`
- Modify: `src/features/reading/LetterReader.tsx`
- Test: `tests/features/letters/letter-storage.test.ts`

- [ ] Write a failing test proving two phone numbers have independent empty/history states and that a finalized letter round-trips body, font, photos, dimensions, and positions.
- [ ] Run `pnpm exec vitest run tests/features/letters/letter-storage.test.ts` and confirm the storage module is missing.
- [ ] Add phone-keyed draft and letter storage, derive the active phone from `temlore.session`, save the complete editor snapshot on finish, and clear only that phone's draft after the sealing animation completes.
- [ ] Render finalized photos and font in `LetterReader`, then rerun the focused test and existing app tests.
- [ ] Commit with `git commit -m "feat: scope complete letters by phone"`.

### Task 6: Long-paper scrolling and photo positioning

**Files:**
- Modify: `src/features/editor/draftStorage.ts`
- Modify: `src/features/editor/LetterEditor.tsx`
- Modify: `src/features/editor/editor.css`
- Test: `tests/features/editor/editor.test.tsx`

- [ ] Write failing tests for restored `x`/`y` photo coordinates and pointer-drag position updates.
- [ ] Run the focused editor tests and confirm failure on the missing position fields/behavior.
- [ ] Add a photo drag mode on the photo body while preserving two-pointer pinch; clamp `x` and `y` to the white paper's content area and persist them.
- [ ] Let the paper grow with content and the editor screen scroll vertically while keeping the toolbar fixed.
- [ ] Run editor tests and commit with `git commit -m "feat: move photos across long letters"`.

### Task 7: Temlore calendar popover

**Files:**
- Create: `src/features/sealing/CalendarPopover.tsx`
- Modify: `src/features/sealing/TimeRing.tsx`
- Modify: `src/features/sealing/sealing.css`
- Test: `tests/features/sealing/calendar-popover.test.tsx`
- Test: `tests/features/sealing/time-ring.test.tsx`

- [ ] Write failing tests for opening the custom calendar, month navigation, blue selected day, hour/minute inputs, cancel, and confirm.
- [ ] Run the focused sealing tests and confirm failure because the native datetime input remains.
- [ ] Implement a dependency-free Gregorian calendar grid with Monday-first headings, adjacent-month blanks, purple rounded panel, blue selected day, month controls, and native-like numeric hour/minute controls.
- [ ] Connect its confirmed ISO-like local value to `TimeRing` and remove the native `datetime-local` input.
- [ ] Run sealing tests and commit with `git commit -m "feat: add Temlore calendar picker"`.

### Task 8: Immediate Start return and mobile regression QA

**Files:**
- Modify: `src/components/MobileFrame.tsx`
- Modify: `src/features/sealing/SealingAnimation.tsx`
- Modify: `src/features/sealing/sealing-animation.css`
- Modify: `src/app/App.tsx`
- Test: `tests/features/app/persistent-flow.test.tsx`
- Test: `tests/e2e/letter-lifecycle.spec.ts`

- [ ] Write failing assertions that Home hides its mock `9:41` status and sealing completion returns directly after drawer closure with no closing message.
- [ ] Implement a Home-only status-time hide option and remove the sealing end message/delay.
- [ ] Run `pnpm test -- --run`, `pnpm build`, and `pnpm exec playwright test`.
- [ ] Perform 393 × 852 visual QA for empty new-phone history, custom calendar, long editor scroll, moved/finalized photo restoration, and immediate Start return. Save screenshots outside the repo.
- [ ] Commit with `git commit -m "feat: finalize mobile letter lifecycle"`.

### Task 9: Year-first date-only calendar

**Files:**
- Modify: `src/features/sealing/CalendarPopover.tsx`
- Modify: `src/features/sealing/calendar.css`
- Modify: `src/features/sealing/TimeRing.tsx`
- Test: `tests/features/sealing/calendar-popover.test.tsx`
- Test: `tests/features/sealing/time-ring.test.tsx`

- [ ] Write a failing test asserting the dialog initially shows a vertically scrollable year list, does not show month days, and has no hour/minute inputs.
- [ ] Write a failing test asserting selecting and confirming a year reveals the month/day grid, and confirming a day returns `YYYY-MM-DDT00:00`.
- [ ] Run `pnpm exec vitest run tests/features/sealing/calendar-popover.test.tsx tests/features/sealing/time-ring.test.tsx` and confirm failure on the existing one-step date/time calendar.
- [ ] Implement a two-phase `year` → `date` state, render years from current year through current year + 100 in a snapping vertical list, and center the selected year with blue styling.
- [ ] Remove hour/minute state and controls; make date confirmation always emit local midnight.
- [ ] Rerun focused tests and commit with `git commit -m "feat: select calendar year before date"`.

### Task 10: Preserve arrived-envelope motion after instant return

**Files:**
- Modify: `src/features/home/home.css`
- Test: `tests/features/home/home-page.test.tsx`

- [ ] Write a failing rendered-style regression test or CSS assertion proving `instant arrived` keeps `envelopePulse` while other Home entry animations remain disabled.
- [ ] Run the focused Home test and verify failure because `.home-screen.instant .home-envelope` currently disables every envelope animation.
- [ ] Change the instant selector to disable envelope animation only when it is not arrived, and add an explicit arrived override that runs the horizontal sway without `homeReveal`.
- [ ] Run all Vitest tests, the production build, Playwright tests, and a 393 × 852 visual check.
- [ ] Commit with `git commit -m "fix: keep arrived envelope gently moving"`.
