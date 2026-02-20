export type ErrorCode =
  | 'NOT_FOUND'
  | 'DUPLICATE_TITLE'
  | 'INVALID_TITLE'
  | 'INVALID_TAG'
  | 'INVALID_INPUT';

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
  };
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  NOT_FOUND: 'Prompt not found',
  DUPLICATE_TITLE: 'A prompt with this title already exists',
  INVALID_TITLE: 'Title must be 1-200 characters',
  INVALID_TAG: 'Tag contains invalid characters. Use only letters, numbers, dash, and underscore.',
  INVALID_INPUT: 'Invalid input parameters',
};

export function createErrorResponse(code: ErrorCode, customMessage?: string): ErrorResponse {
  return {
    error: {
      code,
      message: customMessage ?? ERROR_MESSAGES[code],
    },
  };
}

export function createInvalidTagError(tag: string): ErrorResponse {
  return createErrorResponse(
    'INVALID_TAG',
    `Tag '${tag}' contains invalid characters. Use only letters, numbers, dash, and underscore.`
  );
}
