import { getDatabase } from '../db.js';
import type { FilterByTagsInput, FilterByTagsResult, PromptListItem } from '../schemas.js';

export function filterByTags(input: FilterByTagsInput): FilterByTagsResult {
  const db = getDatabase();
  const normalizedTags = input.tags.map((t) => t.toLowerCase());
  const placeholders = normalizedTags.map(() => '?').join(', ');
  
  const countStmt = db.prepare(`
    SELECT COUNT(DISTINCT p.id) as count
    FROM prompts p
    JOIN prompt_tags pt ON p.id = pt.prompt_id
    WHERE pt.tag_name IN (${placeholders})
  `);
  const { count: total } = countStmt.get(...normalizedTags) as { count: number };
  
  const stmt = db.prepare(`
    SELECT DISTINCT p.id, p.title, substr(p.content, 1, 200) as snippet, 
           p.created_at, p.updated_at
    FROM prompts p
    JOIN prompt_tags pt ON p.id = pt.prompt_id
    WHERE pt.tag_name IN (${placeholders})
    ORDER BY p.updated_at DESC
    LIMIT ? OFFSET ?
  `);
  
  const rows = stmt.all(
    ...normalizedTags,
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
    matched_tags: normalizedTags,
    limit: input.limit,
    offset: input.offset,
    has_more: input.offset + prompts.length < total,
  };
}
