import type { DraftFont, DraftPhoto, EditorDraft } from '../editor/draftStorage';

export type StoredLetter = EditorDraft & { id: string; writtenAt: string; unlockAt: number; arrived: boolean };

export function getActivePhone() {
  try { return (JSON.parse(localStorage.getItem('temlore.session') || '{}') as { phone?: string }).phone || ''; }
  catch { return ''; }
}

function letterKey(phone: string) { return `temlore.letters.${phone}`; }

export function loadLetters(phone: string): StoredLetter[] {
  if (!phone) return [];
  try { return JSON.parse(localStorage.getItem(letterKey(phone)) || '[]') as StoredLetter[]; }
  catch { return []; }
}

export function saveLetter(phone: string, letter: StoredLetter) {
  const letters = loadLetters(phone).filter((item) => item.id !== letter.id);
  localStorage.setItem(letterKey(phone), JSON.stringify([letter, ...letters]));
}

export function markArrived(phone: string, now = Date.now()) {
  const letters = loadLetters(phone).map((letter) => letter.unlockAt <= now ? { ...letter, arrived: true } : letter);
  localStorage.setItem(letterKey(phone), JSON.stringify(letters));
  return letters;
}

export type { DraftFont, DraftPhoto };
