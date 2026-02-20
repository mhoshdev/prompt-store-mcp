import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { listTags } from '../../../src/tools/list-tags.js';
import { addPrompt } from '../../../src/tools/add-prompt.js';
import { deletePrompt } from '../../../src/tools/delete-prompt.js';
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

describe('list_tags', () => {
  beforeEach(() => {
    db = setupTestDb();
    setDatabase(db);
  });

  afterEach(() => {
    setDatabase(null);
    db.close();
  });

  it('should return empty list when no tags exist', () => {
    const result = listTags();

    expect(result.tags).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('should list tags with counts', () => {
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

    const result = listTags();

    expect(result.tags).toHaveLength(2);
    
    const codingTag = result.tags.find((t) => t.name === 'coding');
    expect(codingTag?.prompt_count).toBe(2);
    
    const reviewTag = result.tags.find((t) => t.name === 'review');
    expect(reviewTag?.prompt_count).toBe(1);
  });

  it('should return tags sorted alphabetically', () => {
    addPrompt({
      title: 'Prompt',
      content: 'Content',
      tags: ['zebra', 'alpha', 'middle'],
    });

    const result = listTags();

    expect(result.tags[0].name).toBe('alpha');
    expect(result.tags[1].name).toBe('middle');
    expect(result.tags[2].name).toBe('zebra');
  });

  it('should retain orphaned tags with zero count', () => {
    addPrompt({
      title: 'Prompt',
      content: 'Content',
      tags: ['coding'],
    });
    
    const promptId = db.prepare('SELECT id FROM prompts WHERE title = ?').get('Prompt') as { id: string };
    deletePrompt({ id: promptId.id });

    const result = listTags();
    
    expect(result.tags).toHaveLength(1);
    expect(result.tags[0].prompt_count).toBe(0);
  });
});
