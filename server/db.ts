import Database from 'better-sqlite3';

export function createDatabase(filename = ':memory:') {
  const db = new Database(filename);
  // Render's free web service has no persistent disk. Keep the default database
  // entirely in memory and avoid WAL files in the service filesystem.
  db.pragma(filename === ':memory:' ? 'journal_mode = MEMORY' : 'journal_mode = WAL');
  db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, phone TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, recovery_hash TEXT NOT NULL, created_at TEXT NOT NULL);`);
  db.exec(`CREATE TABLE IF NOT EXISTS letters (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, body TEXT NOT NULL DEFAULT '', font TEXT NOT NULL DEFAULT 'songti', status TEXT NOT NULL DEFAULT 'draft', sealed_at TEXT, opens_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id));`);
  return db;
}
