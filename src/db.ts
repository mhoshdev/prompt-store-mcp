import Database from 'better-sqlite3';
import { chmodSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const DB_DIR = join(homedir(), '.prompt-store');
const DB_PATH = join(DB_DIR, 'prompts.db');

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

CREATE INDEX IF NOT EXISTS idx_prompts_updated_at ON prompts(updated_at DESC);

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

CREATE INDEX IF NOT EXISTS idx_prompt_tags_tag_name ON prompt_tags(tag_name);

CREATE TRIGGER IF NOT EXISTS update_prompt_timestamp 
AFTER UPDATE ON prompts
BEGIN
  UPDATE prompts SET updated_at = datetime('now') WHERE id = NEW.id;
END;
`;

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (db) return db;
  
  mkdirSync(DB_DIR, { recursive: true });
  
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA_SQL);
  
  try {
    chmodSync(DB_PATH, 0o600);
  } catch {
    // Permissions may already be set
  }
  
  return db;
}

export function resetDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
  
  if (existsSync(DB_PATH)) {
    unlinkSync(DB_PATH);
  }
  
  const walPath = DB_PATH + '-wal';
  const shmPath = DB_PATH + '-shm';
  
  if (existsSync(walPath)) unlinkSync(walPath);
  if (existsSync(shmPath)) unlinkSync(shmPath);
  
  getDatabase();
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function setDatabase(testDb: Database.Database | null): void {
  if (db && db !== testDb) {
    db.close();
  }
  db = testDb;
}

export { DB_PATH, DB_DIR };
