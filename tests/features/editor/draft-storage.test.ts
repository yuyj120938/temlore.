import { beforeEach, describe, expect, it } from 'vitest';
import { loadDraft, saveDraft, type EditorDraft } from '../../../src/features/editor/draftStorage';

describe('editor draft storage', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips ordered blocks', () => {
    const draft: EditorDraft = {
      font: 'songti',
      blocks: [
        { id: 'one', type: 'text', text: '上面' },
        { id: 'photo', type: 'photo', url: 'data:image/png;base64,AAAA', caption: '', scale: 1.2, width: 240, height: 310, alignX: 12 },
        { id: 'two', type: 'text', text: '下面' },
      ],
    };
    saveDraft(draft);
    expect(loadDraft()).toEqual(draft);
  });

  it('normalizes an old draft without rewriting its source key', () => {
    const legacy = JSON.stringify({ body: '旧存稿', font: 'kaiti', photos: [] });
    localStorage.setItem('temlore.draft', legacy);
    expect(loadDraft()?.blocks[0]).toMatchObject({ type: 'text', text: '旧存稿' });
    expect(localStorage.getItem('temlore.draft')).toBe(legacy);
  });
});
