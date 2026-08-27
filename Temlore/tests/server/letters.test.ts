import { describe, expect, it } from 'vitest';
import { createDatabase } from '../../server/db';
import { createLetter, saveDraft } from '../../server/letters';

describe('letters', () => {
  it('saves a draft with a whole-letter font choice', () => {
    const db = createDatabase();
    db.prepare('INSERT INTO users (phone,password_hash,recovery_hash,created_at) VALUES (?,?,?,?)').run('13800138000','p','r',new Date().toISOString());
    const id = createLetter(db, 1);
    expect(saveDraft(db, id, 1, 'hello', 'kaiti').font).toBe('kaiti');
    db.close();
  });
});
