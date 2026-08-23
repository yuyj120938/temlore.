import { describe, expect, it } from 'vitest';
import { loadDraft, saveDraft, type EditorDraft } from '../../../src/features/editor/draftStorage';

describe('editor draft storage', () => {
  it('round-trips persistent photo data and dimensions', () => {
    localStorage.clear();
    const draft: EditorDraft = { body: 'future', font: 'songti', photos: [{ url: 'data:image/png;base64,AAAA', caption: '', scale: 1.2, width: 240, height: 310 }] };
    saveDraft(draft);
    expect(loadDraft()).toEqual(draft);
  });
});
