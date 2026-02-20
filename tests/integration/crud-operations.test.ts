import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { setDatabase } from '../../src/db.js';
import { addPrompt } from '../../src/tools/add-prompt.js';
import { listPrompts } from '../../src/tools/list-prompts.js';
import { getPrompt } from '../../src/tools/get-prompt.js';
import { updatePrompt } from '../../src/tools/update-prompt.js';
import { deletePrompt } from '../../src/tools/delete-prompt.js';
import { searchPrompts } from '../../src/tools/search-prompts.js';
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

describe('CRUD Operations Integration', () => {
  beforeEach(() => {
    db = setupTestDb();
    setDatabase(db);
  });

  afterEach(() => {
    setDatabase(null);
    db.close();
  });

  it('should perform full CRUD lifecycle', () => {
    const added = addPrompt({
      title: 'Integration Test',
      content: 'Test content',
      tags: ['test', 'integration'],
    }) as { id: string; title: string; created_at: string };

    expect(added.id).toBeDefined();

    const retrieved = getPrompt({ id: added.id });
    expect((retrieved as any).content).toBe('Test content');

    const updated = updatePrompt({
      id: added.id,
      title: 'Updated Title',
      content: 'Updated content',
      tags: ['updated'],
    }) as { id: string; title: string };

    expect(updated.title).toBe('Updated Title');

    const deleted = deletePrompt({ id: added.id });
    expect((deleted as any).deleted).toBe(true);

    const notFound = getPrompt({ id: added.id });
    expect((notFound as any).error.code).toBe('NOT_FOUND');
  });

  it('should handle search and filter together', () => {
    addPrompt({
      title: 'Code Review',
      content: 'Review code for bugs',
      tags: ['coding', 'review'],
    });

    addPrompt({
      title: 'Writing Guide',
      content: 'How to write well',
      tags: ['writing'],
    });

    const searchResults = searchPrompts({ query: 'code', limit: 10, offset: 0 });
    expect(searchResults.total).toBe(1);

    const filterResults = filterByTags({ tags: ['coding'], limit: 10, offset: 0 });
    expect(filterResults.total).toBe(1);
  });

  it('should list tags with correct counts', () => {
    addPrompt({
      title: 'Prompt 1',
      content: 'Content',
      tags: ['coding', 'review'],
    });

    addPrompt({
      title: 'Prompt 2',
      content: 'Content',
      tags: ['coding'],
    });

    const tags = listTags();
    expect(tags.total).toBe(2);

    const codingTag = tags.tags.find((t) => t.name === 'coding');
    expect(codingTag?.prompt_count).toBe(2);
  });

  it('should handle pagination correctly', () => {
    for (let i = 1; i <= 25; i++) {
      addPrompt({
        title: `Prompt ${i}`,
        content: `Content ${i}`,
        tags: [],
      });
    }

    const page1 = listPrompts({ limit: 10, offset: 0 });
    expect(page1.prompts).toHaveLength(10);
    expect(page1.has_more).toBe(true);

    const page2 = listPrompts({ limit: 10, offset: 10 });
    expect(page2.prompts).toHaveLength(10);

    const page3 = listPrompts({ limit: 10, offset: 20 });
    expect(page3.prompts).toHaveLength(5);
    expect(page3.has_more).toBe(false);
  });
});
