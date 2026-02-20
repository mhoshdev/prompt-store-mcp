#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getDatabase, resetDatabase, closeDatabase } from './db.js';
import { 
  addPrompt, 
  listPrompts, 
  getPrompt, 
  updatePrompt, 
  deletePrompt, 
  searchPrompts, 
  filterByTags, 
  listTags 
} from './tools/index.js';
import { 
  TitleSchema,
  ContentSchema,
  TagSchema,
  PaginationLimitSchema,
  PaginationOffsetSchema,
} from './schemas.js';

const server = new McpServer({
  name: 'prompt-store-mcp',
  version: '1.0.0',
});

server.tool(
  'add_prompt',
  {
    title: TitleSchema.describe('Unique title for the prompt'),
    content: ContentSchema.describe('Full prompt content'),
    tags: z.array(TagSchema).optional().default([]).describe('Optional array of tag names'),
  },
  async (input) => {
    const result = addPrompt(input);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  }
);

server.tool(
  'list_prompts',
  {
    limit: PaginationLimitSchema.describe('Maximum number of prompts to return'),
    offset: PaginationOffsetSchema.describe('Number of prompts to skip'),
  },
  async (input) => {
    const result = listPrompts(input);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  }
);

server.tool(
  'get_prompt',
  {
    id: z.string().describe('Prompt UUID'),
  },
  async (input) => {
    const result = getPrompt(input);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  }
);

server.tool(
  'update_prompt',
  {
    id: z.string().describe('Prompt UUID to update'),
    title: TitleSchema.describe('New title for the prompt'),
    content: ContentSchema.describe('New prompt content'),
    tags: z.array(TagSchema).optional().default([]).describe('New array of tag names'),
  },
  async (input) => {
    const result = updatePrompt(input);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  }
);

server.tool(
  'delete_prompt',
  {
    id: z.string().describe('Prompt UUID to delete'),
  },
  async (input) => {
    const result = deletePrompt(input);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  }
);

server.tool(
  'search_prompts',
  {
    query: z.string().describe('Search term (case-insensitive partial match)'),
    limit: PaginationLimitSchema.describe('Maximum number of prompts to return'),
    offset: PaginationOffsetSchema.describe('Number of prompts to skip'),
  },
  async (input) => {
    const result = searchPrompts(input);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  }
);

server.tool(
  'filter_by_tags',
  {
    tags: z.array(z.string().min(1)).min(1).describe('Array of tag names to filter by'),
    limit: PaginationLimitSchema.describe('Maximum number of prompts to return'),
    offset: PaginationOffsetSchema.describe('Number of prompts to skip'),
  },
  async (input) => {
    const result = filterByTags(input);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  }
);

server.tool(
  'list_tags',
  {},
  async () => {
    const result = listTags();
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  }
);

async function main() {
  console.error('prompt-store-mcp v1.0.1');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--reset')) {
    console.error('Resetting database...');
    resetDatabase();
    console.error('Database reset complete.');
  }
  
  getDatabase();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
