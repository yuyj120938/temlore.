import { normalizeDraft, type EditorDraft } from '../editor/letterBlocks';

type LetterMeta = { id: string; writtenAt: string; unlockAt: number; arrived: boolean };
type RawLetter = LetterMeta & Record<string, unknown>;
export type StoredLetter = EditorDraft & LetterMeta;

export function getActivePhone() {
  try { return (JSON.parse(localStorage.getItem('temlore.session') || '{}') as { email?: string; phone?: string }).email || ''; }
  catch { return ''; }
}

function letterKey(phone: string) { return `temlore.letters.${phone}`; }

function loadRawLetters(phone: string): RawLetter[] {
  if (!phone) return [];
  try { return JSON.parse(localStorage.getItem(letterKey(phone)) || '[]') as RawLetter[]; }
  catch { return []; }
}

export function loadLetters(phone: string): StoredLetter[] {
  return loadRawLetters(phone).flatMap((item) => {
    const draft = normalizeDraft(item);
    return draft ? [{ ...draft, id: item.id, writtenAt: item.writtenAt, unlockAt: item.unlockAt, arrived: item.arrived }] : [];
  });
}

export function saveLetter(phone: string, letter: StoredLetter) {
  const letters = loadRawLetters(phone).filter((item) => item.id !== letter.id);
  localStorage.setItem(letterKey(phone), JSON.stringify([letter, ...letters]));
}

export function markArrived(phone: string, now = Date.now()) {
  if (!phone) return [];
  const letters = loadRawLetters(phone).map((letter) => letter.unlockAt <= now ? { ...letter, arrived: true } : letter);
  localStorage.setItem(letterKey(phone), JSON.stringify(letters));
  return loadLetters(phone);
}

export type { DraftFont, LetterBlock, PhotoBlock, TextBlock } from '../editor/letterBlocks';
