import { getDatabase } from '../db.js';
import { createErrorResponse, type ErrorResponse } from '../errors.js';
import type { GetPromptInput, Prompt } from '../schemas.js';

type GetPromptHandlerResult = Prompt | ErrorResponse;

export function getPrompt(input: GetPromptInput): GetPromptHandlerResult {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT id, title, content, created_at, updated_at
    FROM prompts
    WHERE id = ?
  `);
  
  const row = stmt.get(input.id) as {
    id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
  } | undefined;
  
  if (!row) {
    return createErrorResponse('NOT_FOUND');
  }
  
  return row;
}
