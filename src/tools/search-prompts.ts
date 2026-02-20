import { getDatabase } from '../db.js';
import type { SearchPromptsInput, SearchPromptsResult, PromptListItem } from '../schemas.js';

export function searchPrompts(input: SearchPromptsInput): SearchPromptsResult {
  const db = getDatabase();
  const searchPattern = `%${input.query}%`;
  
  const countStmt = db.prepare(`
    SELECT COUNT(*) as count FROM prompts
    WHERE title LIKE ? OR content LIKE ?
  `);
  const { count: total } = countStmt.get(searchPattern, searchPattern) as { count: number };
  
  const stmt = db.prepare(`
    SELECT id, title, substr(content, 1, 200) as snippet, created_at, updated_at
    FROM prompts
    WHERE title LIKE ? OR content LIKE ?
    ORDER BY updated_at DESC
    LIMIT ? OFFSET ?
  `);
  
  const rows = stmt.all(
    searchPattern,
    searchPattern,
    input.limit,
    input.offset
  ) as Array<{
    id: string;
    title: string;
    snippet: string;
    created_at: string;
    updated_at: string;
  }>;
  
  const tagsStmt = db.prepare(
    'SELECT tag_name FROM prompt_tags WHERE prompt_id = ? ORDER BY tag_name'
  );
  
  const prompts: PromptListItem[] = rows.map((row) => {
    const tagRows = tagsStmt.all(row.id) as Array<{ tag_name: string }>;
    return {
      id: row.id,
      title: row.title,
      snippet: row.snippet,
      tags: tagRows.map((t) => t.tag_name),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });
  
  return {
    prompts,
    total,
    query: input.query,
    limit: input.limit,
    offset: input.offset,
    has_more: input.offset + prompts.length < total,
  };
}
