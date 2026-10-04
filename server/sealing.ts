import type { Database } from './db';
import { opensAtFromPreset, serverNow } from './time';

export function sealLetter(db: Database, id: number, userId: number, duration: '10s' | '1d' | '7d' | '30d' | '1y', customOpensAt?: string) {
  const now = serverNow().toISOString();
  const opensAt = customOpensAt ?? opensAtFromPreset(duration, new Date(now));
  const result = db.prepare("UPDATE letters SET status = 'sealed', sealed_at = ?, opens_at = ?, updated_at = ? WHERE id = ? AND user_id = ? AND status = 'draft'").run(now, opensAt, now, id, userId);
  if (!result.changes) throw new Error('LETTER_NOT_SEALABLE');
  return { id, status: 'sealed', opensAt };
}

export function readableLetter(db: Database, id: number, userId: number) {
  const letter = db.prepare('SELECT * FROM letters WHERE id = ? AND user_id = ?').get(id, userId) as { status: string; opens_at: string | null } | undefined;
  if (!letter) throw new Error('NOT_FOUND');
  if (letter.status === 'sealed' && (!letter.opens_at || new Date(letter.opens_at).getTime() > serverNow().getTime())) throw new Error('LETTER_LOCKED');
  return letter;
}
