import { normalizeDraft, type EditorDraft } from './letterBlocks';

export type { DraftFont, EditorDraft, LetterBlock, PhotoBlock, TextBlock } from './letterBlocks';
export type DraftPhoto = { url: string; caption: string; scale: number; width: number; height: number; x: number; y: number };

function activePhone() {
  try { return (JSON.parse(localStorage.getItem('temlore.session') || '{}') as { phone?: string }).phone || 'guest'; }
  catch { return 'guest'; }
}

function key() { return `temlore.draft.${activePhone()}`; }

export function loadDraft(): EditorDraft | null {
  try {
    const raw = JSON.parse(localStorage.getItem(key()) || localStorage.getItem('temlore.draft') || 'null');
    return normalizeDraft(raw);
  } catch { return null; }
}

export function saveDraft(draft: EditorDraft) {
  try { localStorage.setItem(key(), JSON.stringify(draft)); }
  catch { /* A very large phone photo can exceed localStorage; keep the live draft usable. */ }
}

export function clearDraft() {
  localStorage.removeItem(key());
  localStorage.removeItem('temlore.draft');
}
