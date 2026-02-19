# Quickstart: MCP Prompt Store

**Date**: 2026-02-19  
**Feature**: 001-mcp-prompt-store

## Installation

```bash
# Run directly with npx (recommended)
npx prompt-store-mcp

# Or install globally
pnpm add -g prompt-store-mcp
prompt-store-mcp
```

## MCP Client Configuration

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "prompt-store": {
      "command": "npx",
      "args": ["prompt-store-mcp"]
    }
  }
}
```

### Cursor IDE

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "prompt-store": {
      "command": "npx",
      "args": ["prompt-store-mcp"]
    }
  }
}
```

### Windsurf

Add to your Windsurf MCP configuration:

```json
{
  "mcpServers": {
    "prompt-store": {
      "command": "npx",
      "args": ["prompt-store-mcp"]
    }
  }
}
```

## CLI Options

```bash
# Start MCP server (default)
npx prompt-store-mcp

# Reset database (clear all data, keep schema)
npx prompt-store-mcp --reset
```

## Available Tools

| Tool | Description |
|------|-------------|
| `add_prompt` | Store a new prompt with optional tags |
| `list_prompts` | List prompts with pagination |
| `get_prompt` | Retrieve full prompt by ID |
| `update_prompt` | Update prompt title, content, and tags |
| `delete_prompt` | Permanently remove a prompt |
| `search_prompts` | Search by keyword in title/content |
| `filter_by_tags` | Filter prompts by tags (OR logic) |
| `list_tags` | List all tags with prompt counts |

## Example Usage

### Store a Prompt

```
Use add_prompt with:
- title: "Code Review Assistant"
- content: "You are a senior code reviewer. Analyze code for bugs, security issues, and suggest improvements."
- tags: ["coding", "review"]
```

### Search Prompts

```
Use search_prompts with:
- query: "review"
```

### Filter by Tags

```
Use filter_by_tags with:
- tags: ["coding", "review"]
```

## Data Storage

- **Location**: `~/.prompt-store/prompts.db`
- **Format**: SQLite database
- **Permissions**: User-only read/write (600)

## Troubleshooting

### Server won't start

1. Ensure Node.js v20+ is installed: `node --version`
2. Check database directory permissions: `ls -la ~/.prompt-store`
3. View error logs: errors output to stderr

### Database corruption

1. Backup: `cp ~/.prompt-store/prompts.db ~/.prompt-store/prompts.db.backup`
2. Reset: `npx prompt-store-mcp --reset`
3. Re-add prompts

### MCP client can't connect

1. Verify MCP client configuration path is correct
2. Restart MCP client after configuration changes
3. Ensure `npx prompt-store-mcp` runs successfully in terminal
