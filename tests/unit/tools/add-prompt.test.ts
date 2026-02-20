import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
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

describe('add_prompt', () => {
  beforeEach(() => {
    db = setupTestDb();
    setDatabase(db);
  });

  afterEach(() => {
    setDatabase(null);
    db.close();
  });

  it('should add a prompt without tags', () => {
    const result = addPrompt({
      title: 'Test Prompt',
      content: 'This is test content',
      tags: [],
    });

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('title', 'Test Prompt');
    expect(result).toHaveProperty('created_at');
    expect(result).not.toHaveProperty('error');
  });

  it('should add a prompt with tags', () => {
    const result = addPrompt({
      title: 'Tagged Prompt',
      content: 'Content with tags',
      tags: ['coding', 'review'],
    });

    expect(result).toHaveProperty('id');
    expect(result).not.toHaveProperty('error');

    const tags = db.prepare('SELECT * FROM prompt_tags WHERE prompt_id = ?').all((result as any).id);
    expect(tags).toHaveLength(2);
  });

  it('should normalize tags to lowercase', () => {
    const result = addPrompt({
      title: 'Mixed Case Tags',
      content: 'Content',
      tags: ['Coding', 'REVIEW'],
    });

    const tags = db.prepare('SELECT tag_name FROM prompt_tags WHERE prompt_id = ?').all((result as any).id) as Array<{ tag_name: string }>;
    const tagNames = tags.map((t) => t.tag_name);
    expect(tagNames).toContain('coding');
    expect(tagNames).toContain('review');
  });

  it('should return error for duplicate title', () => {
    addPrompt({
      title: 'Unique Title',
      content: 'Content',
      tags: [],
    });

    const result = addPrompt({
      title: 'Unique Title',
      content: 'Different content',
      tags: [],
    });

    expect(result).toHaveProperty('error');
    expect((result as any).error.code).toBe('DUPLICATE_TITLE');
  });

  it('should return error for invalid tag format', () => {
    const result = addPrompt({
      title: 'Invalid Tag',
      content: 'Content',
      tags: ['invalid tag!'],
    });

    expect(result).toHaveProperty('error');
    expect((result as any).error.code).toBe('INVALID_TAG');
  });
});
