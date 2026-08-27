# Temlore Flowing Letter Blocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace floating photos with an ordered text/photo content flow so users can write text, insert a photo at the caret, continue writing beneath it, and reopen the same non-overlapping layout.

**Architecture:** Add a small block-domain module that owns ordered content types, legacy conversion, insertion, deletion, and plain-text derivation. The editor renders autosizing textareas and in-flow photo figures from the same block array that draft storage and finalized letters persist; the reader normalizes old data and renders those blocks in order. Existing localStorage keys, account scoping, sealing flow, and visual shell remain unchanged.

**Tech Stack:** React, TypeScript, CSS, localStorage, Vitest, Testing Library, Playwright; no new dependencies.

---

## File Structure

- Create `src/features/editor/letterBlocks.ts`: block types and pure functions for IDs, legacy normalization, caret insertion, photo deletion, and plain-text derivation.
- Create `tests/features/editor/letter-blocks.test.ts`: focused tests for content order and legacy conversion.
- Modify `src/features/editor/draftStorage.ts`: store normalized `blocks` drafts under the existing phone-scoped keys.
- Modify `src/features/letters/letterStorage.ts`: normalize legacy finalized letters in memory without rewriting localStorage.
- Modify `src/features/editor/LetterEditor.tsx`: render ordered blocks, track the caret, insert/delete photos, autosize text blocks, and retain safe photo controls.
- Modify `src/features/editor/editor.css`: style seamless text blocks and in-flow photos; remove vertical-drag behavior.
- Modify `src/features/reading/LetterReader.tsx`: render the normalized ordered block stream.
- Modify `src/styles/global.css`: adjust reader photo alignment and preserve long-page scrolling.
- Modify editor, storage, reader, application, and end-to-end tests listed below.

### Task 1: Ordered Letter Block Domain

**Files:**
- Create: `src/features/editor/letterBlocks.ts`
- Create: `tests/features/editor/letter-blocks.test.ts`

- [ ] **Step 1: Write failing block-operation tests**

```ts
import { describe, expect, it } from 'vitest';
import { bodyFromBlocks, insertPhotoAtCaret, normalizeDraft, removePhotoBlock, type PhotoBlock } from '../../../src/features/editor/letterBlocks';

const photo: Omit<PhotoBlock, 'id'> = {
  type: 'photo', url: 'data:image/png;base64,AAAA', caption: '',
  scale: 1, width: 188, height: 190, alignX: 0,
};

describe('ordered letter blocks', () => {
  it('splits text at the caret and inserts a photo between both halves', () => {
    const blocks = insertPhotoAtCaret([{ id: 'text-1', type: 'text', text: '前半后半' }], 'text-1', 2, photo);
    expect(blocks.map((block) => block.type)).toEqual(['text', 'photo', 'text']);
    expect(blocks[0]).toMatchObject({ type: 'text', text: '前半' });
    expect(blocks[2]).toMatchObject({ type: 'text', text: '后半' });
  });

  it('merges adjacent text after removing a photo', () => {
    const blocks = removePhotoBlock([
      { id: 'before', type: 'text', text: '上面' },
      { id: 'photo', ...photo },
      { id: 'after', type: 'text', text: '下面' },
    ], 'photo');
    expect(blocks).toEqual([{ id: 'before', type: 'text', text: '上面下面' }]);
  });

  it('converts legacy text and photos to safe flow without vertical offsets', () => {
    const draft = normalizeDraft({ body: '旧正文', font: 'kaiti', photos: [{ url: photo.url, caption: '旧照片', scale: 1, width: 250, height: 300, x: 18, y: -240 }] });
    expect(draft?.blocks.map((block) => block.type)).toEqual(['text', 'photo', 'text']);
    expect(draft?.blocks[1]).toMatchObject({ type: 'photo', alignX: 18 });
    expect(draft?.blocks[1]).not.toHaveProperty('y');
    expect(bodyFromBlocks(draft!.blocks)).toBe('旧正文');
  });
});
```

- [ ] **Step 2: Run the domain test and verify RED**

Run:

```bash
pnpm exec vitest run tests/features/editor/letter-blocks.test.ts
```

Expected: FAIL because `src/features/editor/letterBlocks.ts` does not exist.

- [ ] **Step 3: Implement the minimal block domain**

Create `src/features/editor/letterBlocks.ts` with these public types and functions:

```ts
export type DraftFont = 'songti' | 'kaiti';
export type TextBlock = { id: string; type: 'text'; text: string };
export type PhotoBlock = {
  id: string; type: 'photo'; url: string; caption: string; scale: number;
  width: number; height: number; alignX: number;
};
export type LetterBlock = TextBlock | PhotoBlock;
export type EditorDraft = { font: DraftFont; blocks: LetterBlock[] };

type LegacyPhoto = {
  url: string; caption?: string; scale?: number; width?: number; height?: number;
  x?: number; y?: number;
};
type LegacyDraft = { body?: string; font?: DraftFont; photos?: LegacyPhoto[] };

let nextId = 0;
export function blockId(prefix: 'text' | 'photo') {
  nextId += 1;
  return `${prefix}-${Date.now()}-${nextId}`;
}

export function emptyDraft(): EditorDraft {
  return { font: 'songti', blocks: [{ id: blockId('text'), type: 'text', text: '' }] };
}

function safeTextAfter(blocks: LetterBlock[]) {
  return blocks.at(-1)?.type === 'text'
    ? blocks
    : [...blocks, { id: blockId('text'), type: 'text' as const, text: '' }];
}

export function normalizeDraft(value: unknown): EditorDraft | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as EditorDraft & LegacyDraft;
  const font: DraftFont = candidate.font === 'kaiti' ? 'kaiti' : 'songti';
  if (Array.isArray(candidate.blocks)) {
    const blocks = candidate.blocks.filter((block) => block && (block.type === 'text' || block.type === 'photo'));
    return { font, blocks: safeTextAfter(blocks.length ? blocks : emptyDraft().blocks) };
  }
  const blocks: LetterBlock[] = [{ id: blockId('text'), type: 'text', text: candidate.body ?? '' }];
  for (const legacy of candidate.photos ?? []) {
    blocks.push({
      id: blockId('photo'), type: 'photo', url: legacy.url, caption: legacy.caption ?? '',
      scale: legacy.scale ?? 1, width: legacy.width ?? 188, height: legacy.height ?? 190,
      alignX: Math.max(-80, Math.min(80, legacy.x ?? 0)),
    });
  }
  return { font, blocks: safeTextAfter(blocks) };
}

export function insertPhotoAtCaret(blocks: LetterBlock[], textId: string, offset: number, photo: Omit<PhotoBlock, 'id'>) {
  const index = blocks.findIndex((block) => block.id === textId && block.type === 'text');
  const target = blocks[index];
  if (index < 0 || target.type !== 'text') return safeTextAfter([...blocks, { ...photo, id: blockId('photo') }]);
  const caret = Math.max(0, Math.min(target.text.length, offset));
  return [
    ...blocks.slice(0, index),
    { ...target, text: target.text.slice(0, caret) },
    { ...photo, id: blockId('photo') },
    { id: blockId('text'), type: 'text' as const, text: target.text.slice(caret) },
    ...blocks.slice(index + 1),
  ];
}

export function removePhotoBlock(blocks: LetterBlock[], photoId: string) {
  const index = blocks.findIndex((block) => block.id === photoId && block.type === 'photo');
  if (index < 0) return blocks;
  const before = blocks[index - 1]; const after = blocks[index + 1];
  if (before?.type === 'text' && after?.type === 'text') {
    return [...blocks.slice(0, index - 1), { ...before, text: before.text + after.text }, ...blocks.slice(index + 2)];
  }
  return safeTextAfter(blocks.filter((block) => block.id !== photoId));
}

export function bodyFromBlocks(blocks: LetterBlock[]) {
  return blocks.filter((block): block is TextBlock => block.type === 'text').map((block) => block.text).join('');
}
```

- [ ] **Step 4: Run the domain test and verify GREEN**

Run: `pnpm exec vitest run tests/features/editor/letter-blocks.test.ts`

Expected: 3 tests PASS.

- [ ] **Step 5: Commit the domain model**

```bash
git add src/features/editor/letterBlocks.ts tests/features/editor/letter-blocks.test.ts
git commit -m "feat: model ordered letter blocks"
```

### Task 2: Normalize Drafts and Finalized Letters

**Files:**
- Modify: `src/features/editor/draftStorage.ts`
- Modify: `src/features/letters/letterStorage.ts`
- Modify: `tests/features/editor/draft-storage.test.ts`
- Modify: `tests/features/letters/letter-storage.test.ts`
- Modify: `tests/features/app/persistent-flow.test.tsx`

- [ ] **Step 1: Replace storage expectations with block and legacy-normalization tests**

In `tests/features/editor/draft-storage.test.ts`, save a block draft and also seed the legacy key:

```ts
it('round-trips ordered blocks', () => {
  const draft: EditorDraft = { font: 'songti', blocks: [
    { id: 'one', type: 'text', text: '上面' },
    { id: 'photo', type: 'photo', url: 'data:image/png;base64,AAAA', caption: '', scale: 1.2, width: 240, height: 310, alignX: 12 },
    { id: 'two', type: 'text', text: '下面' },
  ] };
  saveDraft(draft);
  expect(loadDraft()).toEqual(draft);
});

it('normalizes an old draft without rewriting its source key', () => {
  const legacy = JSON.stringify({ body: '旧存稿', font: 'kaiti', photos: [] });
  localStorage.setItem('temlore.draft', legacy);
  expect(loadDraft()?.blocks[0]).toMatchObject({ type: 'text', text: '旧存稿' });
  expect(localStorage.getItem('temlore.draft')).toBe(legacy);
});
```

In `tests/features/letters/letter-storage.test.ts`, change fixtures to `blocks` and add:

```ts
it('loads a legacy letter as safe ordered blocks without rewriting storage', () => {
  const raw = [{ id: 'old', body: '旧正文', font: 'songti', photos: [{ url: 'old', x: 0, y: -200 }], writtenAt: '2026-08-23T11:00:00.000Z', unlockAt: 2, arrived: true }];
  localStorage.setItem('temlore.letters.13800138000', JSON.stringify(raw));
  expect(loadLetters('13800138000')[0].blocks.map((block) => block.type)).toEqual(['text', 'photo', 'text']);
  expect(localStorage.getItem('temlore.letters.13800138000')).toBe(JSON.stringify(raw));
});
```

Update the arrived fixture in `tests/features/app/persistent-flow.test.tsx` to use `blocks: [{ id: 'text', type: 'text', text: '抵达' }]`.

- [ ] **Step 2: Run storage tests and verify RED**

Run:

```bash
pnpm exec vitest run tests/features/editor/draft-storage.test.ts tests/features/letters/letter-storage.test.ts tests/features/app/persistent-flow.test.tsx
```

Expected: FAIL because storage still returns legacy `body/photos` shapes.

- [ ] **Step 3: Route draft storage through normalization**

Replace the types and read path in `draftStorage.ts`:

```ts
import { normalizeDraft, type DraftFont, type EditorDraft, type LetterBlock, type PhotoBlock } from './letterBlocks';
export type { DraftFont, EditorDraft, LetterBlock, PhotoBlock } from './letterBlocks';

export function loadDraft(): EditorDraft | null {
  try {
    const raw = JSON.parse(localStorage.getItem(key()) || localStorage.getItem('temlore.draft') || 'null');
    return normalizeDraft(raw);
  } catch { return null; }
}

export function saveDraft(draft: EditorDraft) {
  try { localStorage.setItem(key(), JSON.stringify(draft)); }
  catch { /* Large local phone photos may exceed localStorage. */ }
}
```

Keep the existing `activePhone`, `key`, and `clearDraft` behavior unchanged.

- [ ] **Step 4: Normalize finalized letters only at the read boundary**

In `letterStorage.ts`, define metadata separately and normalize each loaded item:

```ts
import { normalizeDraft, type DraftFont, type EditorDraft, type LetterBlock, type PhotoBlock } from '../editor/letterBlocks';

type LetterMeta = { id: string; writtenAt: string; unlockAt: number; arrived: boolean };
export type StoredLetter = EditorDraft & LetterMeta;

export function loadLetters(phone: string): StoredLetter[] {
  if (!phone) return [];
  try {
    const raw = JSON.parse(localStorage.getItem(letterKey(phone)) || '[]') as Array<LetterMeta & object>;
    return raw.flatMap((item) => {
      const draft = normalizeDraft(item);
      return draft ? [{ ...draft, id: item.id, writtenAt: item.writtenAt, unlockAt: item.unlockAt, arrived: item.arrived }] : [];
    });
  } catch { return []; }
}
```

Preserve untouched legacy records when saving a new letter or marking arrivals by operating on raw records rather than the normalized result:

```ts
function loadRawLetters(phone: string): Array<LetterMeta & Record<string, unknown>> {
  if (!phone) return [];
  try { return JSON.parse(localStorage.getItem(letterKey(phone)) || '[]'); }
  catch { return []; }
}

export function saveLetter(phone: string, letter: StoredLetter) {
  const raw = loadRawLetters(phone).filter((item) => item.id !== letter.id);
  localStorage.setItem(letterKey(phone), JSON.stringify([letter, ...raw]));
}

export function markArrived(phone: string, now = Date.now()) {
  if (!phone) return [];
  const raw = loadRawLetters(phone).map((letter) => letter.unlockAt <= now ? { ...letter, arrived: true } : letter);
  localStorage.setItem(letterKey(phone), JSON.stringify(raw));
  return loadLetters(phone);
}
```

Keep phone scoping and exports of the draft types working with `StoredLetter`.

- [ ] **Step 5: Run storage tests and verify GREEN**

Run the same focused command from Step 2.

Expected: all focused storage and persistence tests PASS.

- [ ] **Step 6: Commit storage normalization**

```bash
git add src/features/editor/draftStorage.ts src/features/letters/letterStorage.ts tests/features/editor/draft-storage.test.ts tests/features/letters/letter-storage.test.ts tests/features/app/persistent-flow.test.tsx
git commit -m "feat: persist ordered letter content"
```

### Task 3: Render and Edit Text/Photo Flow

**Files:**
- Modify: `src/features/editor/LetterEditor.tsx`
- Modify: `tests/features/editor/editor.test.tsx`

- [ ] **Step 1: Write failing editor flow tests**

Replace single-body assertions with block interactions. Use a minimal `FileReader` stub and a file selection:

```ts
it('inserts a photo at the caret and continues with text below it', async () => {
  const done = vi.fn();
  vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function () {
    Object.defineProperty(this, 'result', { value: 'data:image/png;base64,AAAA' });
    this.onload?.(new ProgressEvent('load'));
  });
  const view = render(<LetterEditor onDone={done} />); const page = within(view.container);
  const first = page.getByLabelText('文字段落1');
  fireEvent.change(first, { target: { value: '上面下面' } });
  first.setSelectionRange(2, 2); fireEvent.select(first);
  fireEvent.change(page.getByLabelText('上传照片'), { target: { files: [new File(['x'], 'photo.png', { type: 'image/png' })] } });
  expect(page.getAllByRole('textbox').map((field) => field.getAttribute('aria-label'))).toEqual(['文字段落1', '照片1说明', '文字段落2']);
  expect(page.getByLabelText('文字段落1')).toHaveValue('上面');
  expect(page.getByLabelText('文字段落2')).toHaveValue('下面');
  expect(page.getByLabelText('文字段落2')).toHaveFocus();
  fireEvent.change(page.getByLabelText('文字段落2'), { target: { value: '照片下面的新文字' } });
  fireEvent.click(page.getByText('✓'));
  expect(done.mock.calls[0][1].blocks.map((block: { type: string }) => block.type)).toEqual(['text', 'photo', 'text']);
});

it('deletes a photo and reconnects the surrounding text', () => {
  localStorage.setItem('temlore.draft', JSON.stringify({ font: 'songti', blocks: [
    { id: 'a', type: 'text', text: '上面' },
    { id: 'p', type: 'photo', url: 'data:image/png;base64,AAAA', caption: '', scale: 1, width: 188, height: 190, alignX: 0 },
    { id: 'b', type: 'text', text: '下面' },
  ] }));
  const view = render(<LetterEditor onDone={vi.fn()} />); const page = within(view.container);
  fireEvent.click(page.getByRole('button', { name: '删除照片1' }));
  expect(page.queryByAltText('照片1')).not.toBeInTheDocument();
  expect(page.getByLabelText('文字段落1')).toHaveValue('上面下面');
});
```

Keep tests for font switching, immediate Back, autosave, album cancellation, and a fresh draft.

- [ ] **Step 2: Run the editor test and verify RED**

Run: `pnpm exec vitest run tests/features/editor/editor.test.tsx`

Expected: FAIL because the current editor has one `信件正文` textarea and floating photos.

- [ ] **Step 3: Convert editor state to ordered blocks**

In `LetterEditor.tsx`:

```ts
const stored = useRef(loadDraft() ?? emptyDraft());
const [font, setFont] = useState<DraftFont>(stored.current.font);
const [blocks, setBlocks] = useState<LetterBlock[]>(stored.current.blocks);
const caret = useRef<{ id: string; offset: number } | null>(null);
const textareas = useRef(new Map<string, HTMLTextAreaElement>());
const pendingFocus = useRef<string | null>(null);

useEffect(() => {
  setSaved(false); saveDraft({ font, blocks }); window.clearTimeout(saveTimer.current);
  saveTimer.current = window.setTimeout(() => setSaved(true), 500);
  return () => window.clearTimeout(saveTimer.current);
}, [font, blocks]);

function updateText(id: string, text: string) {
  setBlocks((items) => items.map((block) => block.id === id && block.type === 'text' ? { ...block, text } : block));
}

function rememberCaret(id: string, element: HTMLTextAreaElement) {
  caret.current = { id, offset: element.selectionStart ?? element.value.length };
}
```

Render each text block as an autosizing textarea with `aria-label={`文字段落${textIndex + 1}`}`. Its `onFocus`, `onSelect`, and `onClick` call `rememberCaret`; its `onChange` calls `updateText`. Clicking unused paper space focuses the last text block.

- [ ] **Step 4: Insert the selected photo at the remembered caret**

Change the file handler to build a photo block and call the pure insertion helper:

```ts
function onFile(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];
  if (!file || blocks.filter((block) => block.type === 'photo').length >= 9) return;
  const reader = new FileReader();
  reader.onload = () => {
    const fallback = [...blocks].reverse().find((block): block is TextBlock => block.type === 'text')!;
    const target = caret.current ?? { id: fallback.id, offset: fallback.text.length };
    const next = insertPhotoAtCaret(blocks, target.id, target.offset, {
      type: 'photo', url: String(reader.result), caption: '', scale: 1,
      width: 188, height: 190, alignX: 0,
    });
    const targetIndex = next.findIndex((block) => block.type === 'photo' && block.url === String(reader.result));
    const nextText = next.slice(targetIndex + 1).find((block): block is TextBlock => block.type === 'text');
    pendingFocus.current = nextText?.id ?? null;
    setBlocks(next);
  };
  reader.readAsDataURL(file); event.target.value = '';
}
```

After the block render, use a layout effect to autosize every textarea and focus `pendingFocus.current`, placing its caret at offset zero.

- [ ] **Step 5: Render photo blocks and delete controls**

For each photo block, render an in-flow figure keyed by block ID. Add:

```tsx
<button type="button" className="photo-delete" aria-label={`删除照片${photoIndex + 1}`} onClick={() => setBlocks((items) => removePhotoBlock(items, block.id))}>×</button>
```

Update caption and photo properties by block ID. On Done, call:

```ts
const draft = { font, blocks };
onDone(bodyFromBlocks(blocks), draft);
```

- [ ] **Step 6: Run editor tests and verify GREEN**

Run: `pnpm exec vitest run tests/features/editor/editor.test.tsx`

Expected: editor flow, font, draft, Back, and delete tests PASS.

- [ ] **Step 7: Commit ordered editing**

```bash
git add src/features/editor/LetterEditor.tsx tests/features/editor/editor.test.tsx
git commit -m "feat: edit flowing letter content"
```

### Task 4: Keep Photo Adjustment Inside Its Own Row

**Files:**
- Modify: `src/features/editor/LetterEditor.tsx`
- Modify: `src/features/editor/editor.css`
- Modify: `tests/features/editor/editor.test.tsx`

- [ ] **Step 1: Add failing safe-photo-control assertions**

Seed a block draft and assert that the photo exposes horizontal movement, resize handles, and no vertical coordinate:

```ts
it('keeps photo resizing and horizontal movement inside the content flow', () => {
  seedBlockDraft({ alignX: 24, width: 180, height: 190, scale: 1.2 });
  const view = render(<LetterEditor onDone={vi.fn()} />); const page = within(view.container);
  expect(page.getByTestId('flow-photo')).toHaveStyle({ transform: 'translateX(24px) rotate(-2deg)' });
  expect(page.getByLabelText('水平移动照片1')).toHaveAttribute('data-axis', 'x');
  expect(page.getByRole('button', { name: '调整照片1se' })).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('temlore.draft.guest') || '{}')).not.toHaveProperty('blocks.1.y');
});
```

- [ ] **Step 2: Run the focused editor test and verify RED**

Run: `pnpm exec vitest run tests/features/editor/editor.test.tsx`

Expected: FAIL until photo gestures use `alignX` only.

- [ ] **Step 3: Replace free two-axis dragging with bounded horizontal dragging**

Use a drag ref containing only `startX`, `alignX`, `minX`, and `maxX`. On pointer move update:

```ts
updatePhoto(active.id, {
  alignX: Math.max(active.minX, Math.min(active.maxX, active.alignX + event.clientX - active.startX)),
});
```

Keep the existing four-corner width/height resize and two-pointer internal image scale. Render the figure transform as:

```tsx
style={{ width: block.width, height: block.height, transform: `translateX(${block.alignX}px) rotate(-2deg)` }}
```

Mark the gesture surface `aria-label={`水平移动照片${photoIndex + 1}`}` and `data-axis="x"`.

- [ ] **Step 4: Make text and photos occupy normal document flow**

Update `editor.css` with these rules and remove CSS that assumes vertical translation:

```css
.letter-block-text{display:block;width:100%;min-height:31px;padding:0;resize:none;overflow:hidden;border:0;outline:0;background:transparent;color:#39372f;font-size:16px;line-height:1.9;white-space:pre-wrap}
.letter-flow-photo{position:relative;max-width:100%;margin:20px auto;padding:10px 10px 16px;background:#fffdf7;box-shadow:0 9px 18px rgba(68,53,32,.14)}
.photo-delete{position:absolute;z-index:3;right:-9px;top:-9px;width:25px;height:25px;border:1px solid rgba(152,198,255,.55);border-radius:50%;background:rgba(255,255,255,.92);color:#7894ac}
```

Keep the paper white and the fixed toolbar unchanged. Do not add ruled lines or block borders.

- [ ] **Step 5: Run editor tests and verify GREEN**

Run: `pnpm exec vitest run tests/features/editor/editor.test.tsx`

Expected: all editor tests PASS.

- [ ] **Step 6: Commit safe photo controls**

```bash
git add src/features/editor/LetterEditor.tsx src/features/editor/editor.css tests/features/editor/editor.test.tsx
git commit -m "fix: keep photos inside letter flow"
```

### Task 5: Render Opened Letters in the Same Order

**Files:**
- Modify: `src/features/reading/LetterReader.tsx`
- Modify: `src/styles/global.css`
- Create: `tests/features/reading/letter-reader.test.tsx`

- [ ] **Step 1: Write failing ordered-reader tests**

```ts
import { render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LetterReader } from '../../../src/features/reading/LetterReader';

it('renders text and photos in stored block order without vertical transforms', () => {
  const letter = { id: 'one', font: 'kaiti' as const, blocks: [
    { id: 'a', type: 'text' as const, text: '照片上面' },
    { id: 'p', type: 'photo' as const, url: 'data:image/png;base64,AAAA', caption: '此刻', scale: 1.2, width: 220, height: 260, alignX: 18 },
    { id: 'b', type: 'text' as const, text: '照片下面' },
  ], writtenAt: '2026-08-23T11:00:00.000Z', unlockAt: 1, arrived: true };
  const view = render(<LetterReader letter={letter} onClose={vi.fn()} />); const page = within(view.container);
  const flow = page.getByTestId('reader-flow');
  expect([...flow.children].map((node) => node.textContent)).toEqual(['照片上面', '此刻', '照片下面']);
  expect(page.getByTestId('reader-photo')).toHaveStyle({ transform: 'translateX(18px) rotate(-2deg)' });
  expect(page.getByTestId('reader-photo').getAttribute('style')).not.toContain('translateY');
});
```

- [ ] **Step 2: Run the reader test and verify RED**

Run: `pnpm exec vitest run tests/features/reading/letter-reader.test.tsx`

Expected: FAIL because `LetterReader` still reads `body` and `photos` separately.

- [ ] **Step 3: Render `letter.blocks` in order**

Replace separate body/photo loops with:

```tsx
<div className="reader-flow" data-testid="reader-flow">
  {letter.blocks.map((block, index) => block.type === 'text'
    ? <div className="reader-text" key={block.id}>{block.text}</div>
    : <figure className="reader-photo" data-testid="reader-photo" key={block.id} style={{ width: block.width, height: block.height, transform: `translateX(${block.alignX}px) rotate(-2deg)` }}>
        <div><img src={block.url} alt={`信件照片${index + 1}`} style={{ transform: `scale(${block.scale})` }} /></div>
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>)}
</div>
```

Retain the heading, date, seal, Back button, and font class.

- [ ] **Step 4: Preserve whitespace and long scrolling**

Update the reader rules in `global.css`:

```css
.reader-screen{overflow-y:auto}
.reader-text{white-space:pre-wrap;font:16px/1.9 SimSun,Songti SC,serif}
.reader-screen article.kaiti .reader-text{font-family:KaiTi,STKaiti,serif}
.reader-photo{position:relative;max-width:100%;margin:24px auto;padding:10px 10px 16px;background:#fffdf7;box-shadow:0 9px 18px rgba(68,53,32,.14)}
```

- [ ] **Step 5: Run reader and storage compatibility tests**

Run:

```bash
pnpm exec vitest run tests/features/reading/letter-reader.test.tsx tests/features/letters/letter-storage.test.ts
```

Expected: all tests PASS, including legacy conversion.

- [ ] **Step 6: Commit reader parity**

```bash
git add src/features/reading/LetterReader.tsx src/styles/global.css tests/features/reading/letter-reader.test.tsx
git commit -m "feat: read letters in content order"
```

### Task 6: Integrate Sealing and Verify the Complete Mobile Flow

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `tests/features/editor/editor.test.tsx`
- Modify: `tests/features/app/persistent-flow.test.tsx`
- Modify: `tests/e2e/letter-lifecycle.spec.ts`

- [ ] **Step 1: Add a failing application lifecycle assertion**

Extend the persistent-flow test to create an ordered draft, complete the editor, choose 10 seconds, and assert that the stored letter snapshot contains `blocks` but no top-level `body` or `photos`:

```ts
expect(JSON.parse(localStorage.getItem('temlore.letters.13800138000') || '[]')[0]).toMatchObject({
  blocks: [expect.objectContaining({ type: 'text' })],
});
expect(JSON.parse(localStorage.getItem('temlore.letters.13800138000') || '[]')[0]).not.toHaveProperty('body');
```

- [ ] **Step 2: Run the application test and verify RED**

Run: `pnpm exec vitest run tests/features/app/persistent-flow.test.tsx`

Expected: FAIL if `App` still expects or stores the legacy draft shape.

- [ ] **Step 3: Keep App integration block-native**

Update the editor completion callback to receive the draft directly while preserving the existing screen transitions:

```tsx
<LetterEditor
  onBack={() => { setInstantHome(true); setEditor(false); }}
  onDone={(draft) => { setPendingDraft(draft); setEditor(false); setSealing(true); }}
/>
```

Change `LetterEditor`'s prop to `onDone: (draft: EditorDraft) => void` and call `onDone({ font, blocks })`. When sealing, continue spreading `pendingDraft` into `StoredLetter`; do not add `body` or `photos`.

Update editor completion assertions from the temporary two-argument API used in Task 3:

```ts
fireEvent.click(page.getByText('✓'));
expect(done).toHaveBeenCalledWith(expect.objectContaining({
  font: 'kaiti',
  blocks: expect.arrayContaining([expect.objectContaining({ type: 'text' })]),
}));
```

- [ ] **Step 4: Add a Playwright flowing-letter scenario**

Extend `tests/e2e/letter-lifecycle.spec.ts` with a 393 × 852 test that:

```ts
test.use({ viewport: { width: 393, height: 852 } });

test('writes text around a photo and opens it in the same order', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('temlore.session', JSON.stringify({ phone: '13800138000' }));
  });
  await page.goto('/');
  await page.getByText('Start writing').waitFor({ timeout: 6000 });
  await page.getByText('Start writing').click();
  const first = page.getByLabel('文字段落1');
  await first.fill('照片上面照片下面');
  await first.evaluate((node: HTMLTextAreaElement) => {
    node.setSelectionRange(4, 4);
    node.dispatchEvent(new Event('select', { bubbles: true }));
  });
  await page.getByLabel('上传照片').setInputFiles({ name: 'memory.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgo=', 'base64') });
  await page.getByLabel('文字段落2').fill('照片下面');
  await page.locator('.editor-done').click();
  await page.getByRole('button', { name: '10 秒' }).click();
  await page.getByText('确认封存时间').click();
  await page.getByText('Start writing').waitFor({ timeout: 8000 });
  await page.getByText('A letter has arrived.').waitFor({ timeout: 15000 });
  await page.getByRole('button', { name: '打开抽屉' }).click();
  await page.getByRole('button', { name: '打开中央抽屉' }).click();
  await expect(page.getByTestId('reader-flow')).toBeVisible();
  await expect(page.getByText('照片上面')).toBeVisible();
  await expect(page.getByAltText('信件照片2')).toBeVisible();
  await expect(page.getByText('照片下面')).toBeVisible();
});
```

Adjust the photo alt-index implementation or locator so it is stable by photo order (`信件照片1` preferred).

- [ ] **Step 5: Run all automated verification**

Run:

```bash
pnpm test -- --run
pnpm build
pnpm exec playwright test
```

Expected: all unit/component tests PASS, TypeScript and Vite production build exit 0, and all Playwright tests PASS.

- [ ] **Step 6: Perform rendered mobile QA**

At `http://127.0.0.1:4173/` with viewport 393 × 852, verify:

1. Start writing opens one seamless pure-white text area with no ruled lines or visible block borders.
2. Inserting at a middle caret produces text, photo, text in that order.
3. Focus moves below the photo.
4. Resize, internal zoom, horizontal move, and `×` delete work without vertical overlap.
5. Back/return restores the same block order.
6. Sealing clears the draft; a new Start writing opens a fresh letter.
7. After arrival, the opened letter matches editor order and scrolls through long content.
8. Browser console contains no relevant errors or warnings.

Save QA screenshots outside the repository, for example `/tmp/temlore-flow-editor.png` and `/tmp/temlore-flow-reader.png`.

- [ ] **Step 7: Commit integration and end-to-end coverage**

```bash
git add src/app/App.tsx tests/features/editor/editor.test.tsx tests/features/app/persistent-flow.test.tsx tests/e2e/letter-lifecycle.spec.ts
git commit -m "test: verify flowing letter lifecycle"
```

## Final Verification Gate

- [ ] Run `git diff --check` and confirm no whitespace errors.
- [ ] Run `git status --short` and confirm only pre-existing unrelated user changes remain unstaged.
- [ ] Re-run `pnpm test -- --run`, `pnpm build`, and `pnpm exec playwright test` immediately before claiming completion.
- [ ] Compare the final implementation against every acceptance criterion in `docs/superpowers/specs/2026-08-23-temlore-flowing-letter-blocks-design.md`.
