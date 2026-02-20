import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { setDatabase } from '../../src/db.js';
import { addPrompt } from '../../src/tools/add-prompt.js';
import { searchPrompts } from '../../src/tools/search-prompts.js';
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

describe('Search Operations', () => {
  beforeEach(() => {
    db = setupTestDb();
    setDatabase(db);
  });

  afterEach(() => {
    setDatabase(null);
    db.close();
  });

  it('should search across title and content', () => {
    addPrompt({
      title: 'Python Guide',
      content: 'Learn Python basics',
      tags: [],
    });

    addPrompt({
      title: 'JavaScript Tips',
      content: 'Advanced JavaScript patterns',
      tags: [],
    });

    const pythonResults = searchPrompts({ query: 'python', limit: 10, offset: 0 });
    expect(pythonResults.total).toBe(1);

    const jsResults = searchPrompts({ query: 'javascript', limit: 10, offset: 0 });
    expect(jsResults.total).toBe(1);
  });

  it('should handle partial matches', () => {
    addPrompt({
      title: 'Code Review Checklist',
      content: 'Checklist for reviewing code',
      tags: [],
    });

    const results = searchPrompts({ query: 'review', limit: 10, offset: 0 });
    expect(results.total).toBe(1);
  });
});
