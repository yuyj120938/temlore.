import { describe, expect, it } from 'vitest';
import { createDatabase } from '../../server/db';
import { authenticate, ensureDemoUser, register, rotateRecovery } from '../../server/auth';

describe('local auth', () => {
  it('registers, authenticates, and rotates a one-time recovery code', () => {
    const db = createDatabase();
    const created = register(db, '13800138000', 'password123');
    expect(authenticate(db, '13800138000', 'password123').id).toBe(created.id);
    const next = rotateRecovery(db, '13800138000', created.recoveryCode);
    expect(next).not.toBe(created.recoveryCode);
    expect(() => rotateRecovery(db, '13800138000', created.recoveryCode)).toThrow('INVALID_RECOVERY');
    db.close();
  });
  it('creates the local demo account with the documented password', () => {
    const db = createDatabase();
    ensureDemoUser(db);
    expect(authenticate(db, '13800138000', 'temlore2026').id).toBeTypeOf('number');
    db.close();
  });
});
