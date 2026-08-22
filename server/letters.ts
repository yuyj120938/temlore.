import type Database from 'better-sqlite3';

export function createLetter(db: Database.Database, userId: number) {
  const now = new Date().toISOString();
  const result = db.prepare('INSERT INTO letters (user_id,created_at,updated_at) VALUES (?,?,?)').run(userId, now, now);
  return Number(result.lastInsertRowid);
}

export function saveDraft(db: Database.Database, id: number, userId: number, body: string, font: 'songti' | 'kaiti') {
  const now = new Date().toISOString();
  const result = db.prepare("UPDATE letters SET body = ?, font = ?, updated_at = ? WHERE id = ? AND user_id = ? AND status = 'draft'").run(body, font, now, id, userId);
  if (!result.changes) throw new Error('DRAFT_NOT_EDITABLE');
  return { id, body, font, updatedAt: now };
}

export function getLetter(db: Database.Database, id: number, userId: number) {
  return db.prepare('SELECT id,body,font,status,opens_at AS opensAt FROM letters WHERE id = ? AND user_id = ?').get(id, userId);
}
