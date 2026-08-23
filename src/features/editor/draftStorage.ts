export type DraftFont = 'songti' | 'kaiti';
export type DraftPhoto = { url: string; caption: string; scale: number; width: number; height: number };
export type EditorDraft = { body: string; font: DraftFont; photos: DraftPhoto[] };

const key = 'temlore.draft';

export function loadDraft(): EditorDraft | null {
  try { return JSON.parse(localStorage.getItem(key) || 'null') as EditorDraft | null; }
  catch { return null; }
}

export function saveDraft(draft: EditorDraft) {
  try { localStorage.setItem(key, JSON.stringify(draft)); }
  catch { /* A very large phone photo can exceed localStorage; keep the live draft usable. */ }
}
