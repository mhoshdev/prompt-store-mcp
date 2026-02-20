import { getDatabase } from '../db.js';
import type { ListTagsResult, TagWithCount } from '../schemas.js';

export function listTags(): ListTagsResult {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT t.name, COUNT(pt.prompt_id) as prompt_count
    FROM tags t
    LEFT JOIN prompt_tags pt ON t.name = pt.tag_name
    GROUP BY t.name
    ORDER BY t.name ASC
  `);
  
  const rows = stmt.all() as Array<{
    name: string;
    prompt_count: number;
  }>;
  
  const tags: TagWithCount[] = rows.map((row) => ({
    name: row.name,
    prompt_count: row.prompt_count,
  }));
  
  return {
    tags,
    total: tags.length,
  };
}
