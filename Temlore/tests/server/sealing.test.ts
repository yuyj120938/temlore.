import { describe, expect, it, vi } from 'vitest';
import { createDatabase } from '../../server/db';
import { createLetter } from '../../server/letters';
import { readableLetter, sealLetter } from '../../server/sealing';

describe('server-time sealing', () => {
  it('locks a letter until opensAt', () => {
    const db = createDatabase(); db.prepare('INSERT INTO users (phone,password_hash,recovery_hash,created_at) VALUES (?,?,?,?)').run('13800138000','p','r',new Date().toISOString());
    const id = createLetter(db, 1); const sealed = sealLetter(db, id, 1, '10s');
    expect(sealed.status).toBe('sealed'); expect(() => readableLetter(db, id, 1)).toThrow('LETTER_LOCKED'); db.close();
  });
});
