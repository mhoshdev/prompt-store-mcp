import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { deletePrompt } from '../../../src/tools/delete-prompt.js';
import { addPrompt } from '../../../src/tools/add-prompt.js';
import { setDatabase } from '../../../src/db.js';
import type { Database as DatabaseType } from 'better-sqlite3';

let db: DatabaseType;

const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT UNIQUE NOT NULL CHECK(length(title) > 0 AND length(title) <= 200),
  content TEXT NOT NULL CHECK(length(content) > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
  name TEXT PRIMARY KEY NOT NULL CHECK(
    length(name) > 0 AND 
    length(name) <= 50 AND 
    name GLOB '[a-z0-9_-]*'
  )
);

CREATE TABLE IF NOT EXISTS prompt_tags (
  prompt_id TEXT NOT NULL,
  tag_name TEXT NOT NULL,
  PRIMARY KEY (prompt_id, tag_name),
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_name) REFERENCES tags(name) ON DELETE CASCADE
);
`;

function setupTestDb(): DatabaseType {
  const testDb = new Database(':memory:');
  testDb.pragma('journal_mode = WAL');
  testDb.pragma('foreign_keys = ON');
  testDb.exec(SCHEMA_SQL);
  return testDb;
}

describe('delete_prompt', () => {
  beforeEach(() => {
    db = setupTestDb();
    setDatabase(db);
  });

  afterEach(() => {
    setDatabase(null);
    db.close();
  });

  it('should delete a prompt', () => {
    const added = addPrompt({
      title: 'To Delete',
      content: 'Content',
      tags: [],
    }) as { id: string };

    const result = deletePrompt({ id: added.id });

    expect(result).toHaveProperty('deleted', true);
    expect(result).toHaveProperty('id', added.id);
    expect(result).not.toHaveProperty('error');

    const row = db.prepare('SELECT * FROM prompts WHERE id = ?').get(added.id);
    expect(row).toBeUndefined();
  });

  it('should cascade delete tag associations', () => {
    const added = addPrompt({
      title: 'Tagged',
      content: 'Content',
      tags: ['tag1', 'tag2'],
    }) as { id: string };

    deletePrompt({ id: added.id });

    const tags = db.prepare('SELECT * FROM prompt_tags WHERE prompt_id = ?').all(added.id);
    expect(tags).toHaveLength(0);
  });

  it('should return error for non-existent prompt', () => {
    const result = deletePrompt({ id: 'non-existent-uuid' });

    expect(result).toHaveProperty('error');
    expect((result as any).error.code).toBe('NOT_FOUND');
  });
});
