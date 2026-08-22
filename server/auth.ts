import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type Database from 'better-sqlite3';

export function hashSecret(secret: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(secret, salt, 32).toString('hex')}`;
}

export function verifySecret(secret: string, stored: string) {
  const [salt, digest] = stored.split(':');
  if (!salt || !digest) return false;
  const actual = scryptSync(secret, salt, 32);
  return timingSafeEqual(actual, Buffer.from(digest, 'hex'));
}

export function register(db: Database.Database, phone: string, password: string) {
  if (!/^1\d{10}$/.test(phone) || password.length < 8) throw new Error('INVALID_INPUT');
  const recoveryCode = `${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`;
  const now = new Date().toISOString();
  const result = db.prepare('INSERT INTO users (phone,password_hash,recovery_hash,created_at) VALUES (?,?,?,?)').run(phone, hashSecret(password), hashSecret(recoveryCode), now);
  return { id: Number(result.lastInsertRowid), recoveryCode };
}

export function authenticate(db: Database.Database, phone: string, password: string) {
  const user = db.prepare('SELECT id,password_hash FROM users WHERE phone = ?').get(phone) as { id: number; password_hash: string } | undefined;
  if (!user || !verifySecret(password, user.password_hash)) throw new Error('INVALID_CREDENTIALS');
  return { id: user.id };
}

export function rotateRecovery(db: Database.Database, phone: string, code: string) {
  const user = db.prepare('SELECT id,recovery_hash FROM users WHERE phone = ?').get(phone) as { id: number; recovery_hash: string } | undefined;
  if (!user || !verifySecret(code, user.recovery_hash)) throw new Error('INVALID_RECOVERY');
  const next = randomBytes(8).toString('hex').toUpperCase();
  db.prepare('UPDATE users SET recovery_hash = ? WHERE id = ?').run(hashSecret(next), user.id);
  return next;
}

export function ensureDemoUser(db: Database.Database) {
  const phone = '13800138000';
  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone) as { id: number } | undefined;
  if (existing) return existing.id;
  return register(db, phone, 'temlore2026').id;
}
