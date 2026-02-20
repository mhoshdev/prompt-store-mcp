import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { setDatabase } from '../../src/db.js';
import { addPrompt } from '../../src/tools/add-prompt.js';
import { filterByTags } from '../../src/tools/filter-by-tags.js';
import { listTags } from '../../src/tools/list-tags.js';
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

describe('Tag Operations', () => {
  beforeEach(() => {
    db = setupTestDb();
    setDatabase(db);
  });

  afterEach(() => {
    setDatabase(null);
    db.close();
  });

  it('should filter prompts by tags using OR logic', () => {
    addPrompt({
      title: 'Prompt A',
      content: 'Content A',
      tags: ['coding'],
    });

    addPrompt({
      title: 'Prompt B',
      content: 'Content B',
      tags: ['writing'],
    });

    addPrompt({
      title: 'Prompt C',
      content: 'Content C',
      tags: ['design'],
    });

    const results = filterByTags({ tags: ['coding', 'writing'], limit: 10, offset: 0 });
    expect(results.total).toBe(2);
  });

  it('should list all tags with correct counts', () => {
    addPrompt({
      title: 'Multi-tag',
      content: 'Content',
      tags: ['alpha', 'beta', 'gamma'],
    });

    addPrompt({
      title: 'Single-tag',
      content: 'Content',
      tags: ['alpha'],
    });

    const tags = listTags();
    
    const alphaTag = tags.tags.find((t) => t.name === 'alpha');
    expect(alphaTag?.prompt_count).toBe(2);

    const betaTag = tags.tags.find((t) => t.name === 'beta');
    expect(betaTag?.prompt_count).toBe(1);
  });

  it('should handle tag normalization', () => {
    addPrompt({
      title: 'Test',
      content: 'Content',
      tags: ['MyTag', 'ANOTHER-TAG'],
    });

    const tags = listTags();
    const tagNames = tags.tags.map((t) => t.name);
    
    expect(tagNames).toContain('mytag');
    expect(tagNames).toContain('another-tag');
  });
});
