import { getDatabase } from '../db.js';
import { createErrorResponse, createInvalidTagError, type ErrorResponse } from '../errors.js';
import type { UpdatePromptInput, UpdatePromptResult } from '../schemas.js';
import { TagSchema } from '../schemas.js';

type UpdatePromptHandlerResult = UpdatePromptResult | ErrorResponse;

export function updatePrompt(input: UpdatePromptInput): UpdatePromptHandlerResult {
  const normalizedTags: string[] = [];
  
  for (const tag of input.tags) {
    const normalized = tag.toLowerCase();
    const result = TagSchema.safeParse(normalized);
    if (!result.success) {
      return createInvalidTagError(tag);
    }
    normalizedTags.push(normalized);
  }
  
  const db = getDatabase();
  
  const checkStmt = db.prepare('SELECT id FROM prompts WHERE id = ?');
  const existing = checkStmt.get(input.id);
  
  if (!existing) {
    return createErrorResponse('NOT_FOUND');
  }
  
  try {
    const updateStmt = db.prepare(`
      UPDATE prompts SET title = ?, content = ? WHERE id = ?
    `);
    updateStmt.run(input.title, input.content, input.id);
    
    const deleteTagsStmt = db.prepare('DELETE FROM prompt_tags WHERE prompt_id = ?');
    deleteTagsStmt.run(input.id);
    
    if (normalizedTags.length > 0) {
      const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
      const insertPromptTag = db.prepare(
        'INSERT INTO prompt_tags (prompt_id, tag_name) VALUES (?, ?)'
      );
      
      const insertTags = db.transaction((tags: string[]) => {
        for (const tag of tags) {
          insertTag.run(tag);
          insertPromptTag.run(input.id, tag);
        }
      });
      
      insertTags(normalizedTags);
    }
    
    const getUpdatedStmt = db.prepare('SELECT updated_at FROM prompts WHERE id = ?');
    const updated = getUpdatedStmt.get(input.id) as { updated_at: string };
    
    return {
      id: input.id,
      title: input.title,
      updated_at: updated.updated_at,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return createErrorResponse('DUPLICATE_TITLE');
    }
    throw error;
  }
}
