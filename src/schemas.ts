import { z } from 'zod';

export const TagSchema = z
  .string()
  .min(1, 'Tag must be at least 1 character')
  .max(50, 'Tag must be at most 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Tag must contain only letters, numbers, dash, and underscore');

export const TitleSchema = z
  .string()
  .min(1, 'Title must be at least 1 character')
  .max(200, 'Title must be at most 200 characters');

export const ContentSchema = z.string().min(1, 'Content must not be empty');

export const PromptIdSchema = z.string().uuid('Invalid prompt ID format');

export const PaginationLimitSchema = z.number().int().min(1).max(100).default(10);
export const PaginationOffsetSchema = z.number().int().min(0).default(0);

export const AddPromptSchema = z.object({
  title: TitleSchema.describe('Unique title for the prompt'),
  content: ContentSchema.describe('Full prompt content'),
  tags: z.array(TagSchema).optional().default([]).describe('Optional array of tag names'),
});

export const ListPromptsSchema = z.object({
  limit: PaginationLimitSchema.describe('Maximum number of prompts to return'),
  offset: PaginationOffsetSchema.describe('Number of prompts to skip'),
});

export const GetPromptSchema = z.object({
  id: z.string().describe('Prompt UUID'),
});

export const UpdatePromptSchema = z.object({
  id: z.string().describe('Prompt UUID to update'),
  title: TitleSchema.describe('New title for the prompt'),
  content: ContentSchema.describe('New prompt content'),
  tags: z.array(TagSchema).optional().default([]).describe('New array of tag names'),
});

export const DeletePromptSchema = z.object({
  id: z.string().describe('Prompt UUID to delete'),
});

export const SearchPromptsSchema = z.object({
  query: z.string().describe('Search term (case-insensitive partial match)'),
  limit: PaginationLimitSchema.describe('Maximum number of prompts to return'),
  offset: PaginationOffsetSchema.describe('Number of prompts to skip'),
});

export const FilterByTagsSchema = z.object({
  tags: z.array(z.string().min(1)).min(1).describe('Array of tag names to filter by'),
  limit: PaginationLimitSchema.describe('Maximum number of prompts to return'),
  offset: PaginationOffsetSchema.describe('Number of prompts to skip'),
});

export const ListTagsSchema = z.object({});

export type AddPromptInput = z.infer<typeof AddPromptSchema>;
export type ListPromptsInput = z.infer<typeof ListPromptsSchema>;
export type GetPromptInput = z.infer<typeof GetPromptSchema>;
export type UpdatePromptInput = z.infer<typeof UpdatePromptSchema>;
export type DeletePromptInput = z.infer<typeof DeletePromptSchema>;
export type SearchPromptsInput = z.infer<typeof SearchPromptsSchema>;
export type FilterByTagsInput = z.infer<typeof FilterByTagsSchema>;
export type ListTagsInput = z.infer<typeof ListTagsSchema>;

export interface Prompt {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PromptListItem {
  id: string;
  title: string;
  snippet: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TagWithCount {
  name: string;
  prompt_count: number;
}

export interface AddPromptResult {
  id: string;
  title: string;
  created_at: string;
}

export interface UpdatePromptResult {
  id: string;
  title: string;
  updated_at: string;
}

export interface DeletePromptResult {
  deleted: boolean;
  id: string;
}

export interface ListPromptsResult {
  prompts: PromptListItem[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface SearchPromptsResult {
  prompts: PromptListItem[];
  total: number;
  query: string;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface FilterByTagsResult {
  prompts: PromptListItem[];
  total: number;
  matched_tags: string[];
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ListTagsResult {
  tags: TagWithCount[];
  total: number;
}
