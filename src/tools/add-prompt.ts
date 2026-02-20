import { randomUUID } from 'crypto';
import { getDatabase } from '../db.js';
import { createErrorResponse, createInvalidTagError, type ErrorResponse } from '../errors.js';
import type { AddPromptInput, AddPromptResult } from '../schemas.js';
import { TagSchema } from '../schemas.js';

type AddPromptHandlerResult = AddPromptResult | ErrorResponse;

export function addPrompt(input: AddPromptInput): AddPromptHandlerResult {
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
  const id = randomUUID();
  const now = new Date().toISOString();
  
  try {
    const insertPrompt = db.prepare(`
      INSERT INTO prompts (id, title, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertPrompt.run(id, input.title, input.content, now, now);
    
    if (normalizedTags.length > 0) {
      const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
      const insertPromptTag = db.prepare(
        'INSERT INTO prompt_tags (prompt_id, tag_name) VALUES (?, ?)'
      );
      
      const insertTags = db.transaction((tags: string[]) => {
        for (const tag of tags) {
          insertTag.run(tag);
          insertPromptTag.run(id, tag);
        }
      });
      
      insertTags(normalizedTags);
    }
    
    return {
      id,
      title: input.title,
      created_at: now,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return createErrorResponse('DUPLICATE_TITLE');
    }
    throw error;
  }
}
