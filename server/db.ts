type UserRow = { id: number; phone: string; password_hash: string; recovery_hash: string; created_at: string };
type LetterRow = { id: number; user_id: number; body: string; font: string; status: string; sealed_at: string | null; opens_at: string | null; created_at: string; updated_at: string };
type RunResult = { changes: number; lastInsertRowid: number };
type Statement = { get(...params: unknown[]): unknown; run(...params: unknown[]): RunResult };

export type Database = { prepare(sql: string): Statement; close(): void };

class MemoryDatabase implements Database {
  private nextUserId = 1;
  private nextLetterId = 1;
  private readonly users = new Map<number, UserRow>();
  private readonly letters = new Map<number, LetterRow>();

  prepare(sql: string): Statement {
    const normalized = sql.replace(/\s+/g, ' ').trim();
    return { get: (...params) => this.get(normalized, params), run: (...params) => this.run(normalized, params) };
  }

  close() {
    this.users.clear();
    this.letters.clear();
  }

  private get(sql: string, params: unknown[]) {
    if (sql.includes("sqlite_master") && sql.includes("name='letters'")) return { name: 'letters' };
    if (sql.startsWith('SELECT id,password_hash FROM users WHERE phone')) {
      const user = [...this.users.values()].find((row) => row.phone === params[0]);
      return user ? { id: user.id, password_hash: user.password_hash } : undefined;
    }
    if (sql.startsWith('SELECT id,recovery_hash FROM users WHERE phone')) {
      const user = [...this.users.values()].find((row) => row.phone === params[0]);
      return user ? { id: user.id, recovery_hash: user.recovery_hash } : undefined;
    }
    if (sql.startsWith('SELECT id FROM users WHERE phone')) {
      const user = [...this.users.values()].find((row) => row.phone === params[0]);
      return user ? { id: user.id } : undefined;
    }
    if (sql.startsWith('SELECT id,body,font,status,opens_at AS opensAt FROM letters')) {
      const letter = this.findLetter(params[0], params[1]);
      return letter ? { id: letter.id, body: letter.body, font: letter.font, status: letter.status, opensAt: letter.opens_at } : undefined;
    }
    if (sql.startsWith('SELECT * FROM letters')) return this.findLetter(params[0], params[1]);
    throw new Error(`Unsupported query: ${sql}`);
  }

  private run(sql: string, params: unknown[]): RunResult {
    if (sql.startsWith('INSERT INTO users')) {
      const [phone, passwordHash, recoveryHash, createdAt] = params as [string, string, string, string];
      if ([...this.users.values()].some((user) => user.phone === phone)) throw new Error('UNIQUE constraint failed: users.phone');
      const id = this.nextUserId++;
      this.users.set(id, { id, phone, password_hash: passwordHash, recovery_hash: recoveryHash, created_at: createdAt });
      return { changes: 1, lastInsertRowid: id };
    }
    if (sql.startsWith('UPDATE users SET recovery_hash')) {
      const [recoveryHash, id] = params as [string, number];
      const user = this.users.get(Number(id));
      if (!user) return { changes: 0, lastInsertRowid: 0 };
      user.recovery_hash = recoveryHash;
      return { changes: 1, lastInsertRowid: 0 };
    }
    if (sql.startsWith('INSERT INTO letters')) {
      const [userId, createdAt, updatedAt] = params as [number, string, string];
      const id = this.nextLetterId++;
      this.letters.set(id, { id, user_id: Number(userId), body: '', font: 'songti', status: 'draft', sealed_at: null, opens_at: null, created_at: createdAt, updated_at: updatedAt });
      return { changes: 1, lastInsertRowid: id };
    }
    if (sql.startsWith('UPDATE letters SET body')) {
      const [body, font, updatedAt, id, userId] = params as [string, string, string, number, number];
      const letter = this.findLetter(id, userId);
      if (!letter || letter.status !== 'draft') return { changes: 0, lastInsertRowid: 0 };
      letter.body = body;
      letter.font = font;
      letter.updated_at = updatedAt;
      return { changes: 1, lastInsertRowid: 0 };
    }
    if (sql.startsWith("UPDATE letters SET status = 'sealed'")) {
      const [sealedAt, opensAt, updatedAt, id, userId] = params as [string, string, string, number, number];
      const letter = this.findLetter(id, userId);
      if (!letter || letter.status !== 'draft') return { changes: 0, lastInsertRowid: 0 };
      letter.status = 'sealed';
      letter.sealed_at = sealedAt;
      letter.opens_at = opensAt;
      letter.updated_at = updatedAt;
      return { changes: 1, lastInsertRowid: 0 };
    }
    throw new Error(`Unsupported statement: ${sql}`);
  }

  private findLetter(id: unknown, userId: unknown) {
    const letter = this.letters.get(Number(id));
    return letter && letter.user_id === Number(userId) ? letter : undefined;
  }
}

export function createDatabase(_filename = ':memory:'): Database {
  return new MemoryDatabase();
}
