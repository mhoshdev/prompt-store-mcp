import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { filterByTags } from '../../../src/tools/filter-by-tags.js';
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

describe('filter_by_tags', () => {
  beforeEach(() => {
    db = setupTestDb();
    setDatabase(db);
  });

  afterEach(() => {
    setDatabase(null);
    db.close();
  });

  it('should filter by single tag', () => {
    addPrompt({
      title: 'Prompt 1',
      content: 'Content',
      tags: ['coding'],
    });
    addPrompt({
      title: 'Prompt 2',
      content: 'Content',
      tags: ['writing'],
    });

    const result = filterByTags({ tags: ['coding'], limit: 10, offset: 0 });

    expect(result.prompts).toHaveLength(1);
    expect(result.prompts[0].title).toBe('Prompt 1');
  });

  it('should use OR logic for multiple tags', () => {
    addPrompt({
      title: 'Prompt 1',
      content: 'Content',
      tags: ['coding'],
    });
    addPrompt({
      title: 'Prompt 2',
      content: 'Content',
      tags: ['writing'],
    });
    addPrompt({
      title: 'Prompt 3',
      content: 'Content',
      tags: ['review'],
    });

    const result = filterByTags({ tags: ['coding', 'writing'], limit: 10, offset: 0 });

    expect(result.prompts).toHaveLength(2);
  });

  it('should not duplicate prompts with multiple matching tags', () => {
    addPrompt({
      title: 'Multi-tag',
      content: 'Content',
      tags: ['coding', 'review'],
    });

    const result = filterByTags({ tags: ['coding', 'review'], limit: 10, offset: 0 });

    expect(result.prompts).toHaveLength(1);
  });

  it('should normalize tags to lowercase', () => {
    addPrompt({
      title: 'Tagged',
      content: 'Content',
      tags: ['coding'],
    });

    const result = filterByTags({ tags: ['CODING'], limit: 10, offset: 0 });

    expect(result.prompts).toHaveLength(1);
    expect(result.matched_tags).toContain('coding');
  });

  it('should support pagination', () => {
    for (let i = 1; i <= 15; i++) {
      addPrompt({
        title: `Prompt ${i}`,
        content: 'Content',
        tags: ['coding'],
      });
    }

    const page1 = filterByTags({ tags: ['coding'], limit: 10, offset: 0 });
    expect(page1.prompts).toHaveLength(10);
    expect(page1.has_more).toBe(true);

    const page2 = filterByTags({ tags: ['coding'], limit: 10, offset: 10 });
    expect(page2.prompts).toHaveLength(5);
  });
});
