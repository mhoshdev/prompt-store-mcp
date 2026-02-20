import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { updatePrompt } from '../../../src/tools/update-prompt.js';
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

CREATE TRIGGER IF NOT EXISTS update_prompt_timestamp 
AFTER UPDATE ON prompts
BEGIN
  UPDATE prompts SET updated_at = datetime('now') WHERE id = NEW.id;
END;
`;

function setupTestDb(): DatabaseType {
  const testDb = new Database(':memory:');
  testDb.pragma('journal_mode = WAL');
  testDb.pragma('foreign_keys = ON');
  testDb.exec(SCHEMA_SQL);
  return testDb;
}

describe('update_prompt', () => {
  beforeEach(() => {
    db = setupTestDb();
    setDatabase(db);
  });

  afterEach(() => {
    setDatabase(null);
    db.close();
  });

  it('should update prompt title and content', () => {
    const added = addPrompt({
      title: 'Original Title',
      content: 'Original content',
      tags: [],
    }) as { id: string };

    const result = updatePrompt({
      id: added.id,
      title: 'Updated Title',
      content: 'Updated content',
      tags: [],
    });

    expect(result).toHaveProperty('id', added.id);
    expect(result).toHaveProperty('title', 'Updated Title');
    expect(result).not.toHaveProperty('error');
  });

  it('should replace tags', () => {
    const added = addPrompt({
      title: 'Test',
      content: 'Content',
      tags: ['old-tag'],
    }) as { id: string };

    updatePrompt({
      id: added.id,
      title: 'Test',
      content: 'Content',
      tags: ['new-tag'],
    });

    const tags = db.prepare('SELECT tag_name FROM prompt_tags WHERE prompt_id = ?').all(added.id) as Array<{ tag_name: string }>;
    expect(tags).toHaveLength(1);
    expect(tags[0].tag_name).toBe('new-tag');
  });

  it('should return error for non-existent prompt', () => {
    const result = updatePrompt({
      id: 'non-existent-uuid',
      title: 'Title',
      content: 'Content',
      tags: [],
    });

    expect(result).toHaveProperty('error');
    expect((result as any).error.code).toBe('NOT_FOUND');
  });

  it('should return error for duplicate title', () => {
    addPrompt({
      title: 'Prompt 1',
      content: 'Content',
      tags: [],
    });

    const prompt2 = addPrompt({
      title: 'Prompt 2',
      content: 'Content',
      tags: [],
    }) as { id: string };

    const result = updatePrompt({
      id: prompt2.id,
      title: 'Prompt 1',
      content: 'Content',
      tags: [],
    });

    expect(result).toHaveProperty('error');
    expect((result as any).error.code).toBe('DUPLICATE_TITLE');
  });

  it('should return error for invalid tag', () => {
    const added = addPrompt({
      title: 'Test',
      content: 'Content',
      tags: [],
    }) as { id: string };

    const result = updatePrompt({
      id: added.id,
      title: 'Test',
      content: 'Content',
      tags: ['invalid tag!'],
    });

    expect(result).toHaveProperty('error');
    expect((result as any).error.code).toBe('INVALID_TAG');
  });
});
