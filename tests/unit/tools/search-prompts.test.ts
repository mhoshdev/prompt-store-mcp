import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { searchPrompts } from '../../../src/tools/search-prompts.js';
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

describe('search_prompts', () => {
  beforeEach(() => {
    db = setupTestDb();
    setDatabase(db);
  });

  afterEach(() => {
    setDatabase(null);
    db.close();
  });

  it('should search in title', () => {
    addPrompt({
      title: 'Code Review Guide',
      content: 'Content here',
      tags: [],
    });
    addPrompt({
      title: 'Writing Tips',
      content: 'Other content',
      tags: [],
    });

    const result = searchPrompts({ query: 'review', limit: 10, offset: 0 });

    expect(result.prompts).toHaveLength(1);
    expect(result.prompts[0].title).toBe('Code Review Guide');
  });

  it('should search in content', () => {
    addPrompt({
      title: 'Guide 1',
      content: 'This is about coding standards',
      tags: [],
    });
    addPrompt({
      title: 'Guide 2',
      content: 'Writing documentation',
      tags: [],
    });

    const result = searchPrompts({ query: 'coding', limit: 10, offset: 0 });

    expect(result.prompts).toHaveLength(1);
    expect(result.prompts[0].title).toBe('Guide 1');
  });

  it('should be case-insensitive', () => {
    addPrompt({
      title: 'REVIEW Guide',
      content: 'Content',
      tags: [],
    });

    const result = searchPrompts({ query: 'review', limit: 10, offset: 0 });

    expect(result.prompts).toHaveLength(1);
  });

  it('should support pagination', () => {
    for (let i = 1; i <= 15; i++) {
      addPrompt({
        title: `Review ${i}`,
        content: 'Content',
        tags: [],
      });
    }

    const page1 = searchPrompts({ query: 'review', limit: 10, offset: 0 });
    expect(page1.prompts).toHaveLength(10);
    expect(page1.has_more).toBe(true);

    const page2 = searchPrompts({ query: 'review', limit: 10, offset: 10 });
    expect(page2.prompts).toHaveLength(5);
    expect(page2.has_more).toBe(false);
  });

  it('should return empty for no matches', () => {
    addPrompt({
      title: 'Test',
      content: 'Content',
      tags: [],
    });

    const result = searchPrompts({ query: 'nonexistent', limit: 10, offset: 0 });

    expect(result.prompts).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
