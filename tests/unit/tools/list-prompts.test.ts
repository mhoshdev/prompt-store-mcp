import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { listPrompts } from '../../../src/tools/list-prompts.js';
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

describe('list_prompts', () => {
  beforeEach(() => {
    db = setupTestDb();
    setDatabase(db);
  });

  afterEach(() => {
    setDatabase(null);
    db.close();
  });

  it('should return empty list when no prompts exist', () => {
    const result = listPrompts({ limit: 10, offset: 0 });

    expect(result.prompts).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.has_more).toBe(false);
  });

  it('should list prompts with pagination', () => {
    for (let i = 1; i <= 15; i++) {
      addPrompt({
        title: `Prompt ${i}`,
        content: `Content ${i}`,
        tags: [],
      });
    }

    const page1 = listPrompts({ limit: 10, offset: 0 });
    expect(page1.prompts).toHaveLength(10);
    expect(page1.total).toBe(15);
    expect(page1.has_more).toBe(true);

    const page2 = listPrompts({ limit: 10, offset: 10 });
    expect(page2.prompts).toHaveLength(5);
    expect(page2.has_more).toBe(false);
  });

  it('should include tags in prompt list', () => {
    addPrompt({
      title: 'Tagged Prompt',
      content: 'Content',
      tags: ['coding', 'review'],
    });

    const result = listPrompts({ limit: 10, offset: 0 });
    expect(result.prompts[0].tags).toContain('coding');
    expect(result.prompts[0].tags).toContain('review');
  });

  it('should return snippet (truncated content)', () => {
    addPrompt({
      title: 'Long Content',
      content: 'A'.repeat(300),
      tags: [],
    });

    const result = listPrompts({ limit: 10, offset: 0 });
    expect(result.prompts[0].snippet.length).toBeLessThanOrEqual(200);
  });
});
