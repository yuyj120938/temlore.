import { describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';
import { createDatabase } from '../../server/db';

describe('Temlore scaffold', () => {
  it('exports the root app and creates the local database schema', () => {
    expect(App).toBeTypeOf('function');
    const db = createDatabase();
    expect(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='letters'").get()).toBeTruthy();
    db.close();
  });
});
