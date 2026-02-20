import { getDatabase } from '../db.js';
import { createErrorResponse, type ErrorResponse } from '../errors.js';
import type { DeletePromptInput, DeletePromptResult } from '../schemas.js';

type DeletePromptHandlerResult = DeletePromptResult | ErrorResponse;

export function deletePrompt(input: DeletePromptInput): DeletePromptHandlerResult {
  const db = getDatabase();
  
  const checkStmt = db.prepare('SELECT id FROM prompts WHERE id = ?');
  const existing = checkStmt.get(input.id);
  
  if (!existing) {
    return createErrorResponse('NOT_FOUND');
  }
  
  const deleteStmt = db.prepare('DELETE FROM prompts WHERE id = ?');
  deleteStmt.run(input.id);
  
  return {
    deleted: true,
    id: input.id,
  };
}
