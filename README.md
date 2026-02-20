# @mhoshdev/prompt-store-mcp

A local-only MCP (Model Context Protocol) server for managing AI prompts with SQLite storage. Designed for individual developers to organize prompts without complex web services.

## ✨ Why Use This?

**Your personal prompt library** - Store, search, and reuse prompts across all your AI tools.

- **Simple & focused** - Just prompts, nothing more. No cloud, no accounts, no complexity.
- **Works everywhere** - Same prompts available in Claude, Cursor, Windsurf, any MCP client.
- **100% local** - All data stays on your machine in SQLite. Your prompts, your control.
- **Fast search** - Find prompts by keyword or filter by tags instantly.
- **Easy setup** - One npx command, no install needed.

## 📦 Installation

No installation needed. Just use npx:

```bash
npx -y @mhoshdev/prompt-store-mcp@latest
```

> **Note:** Requires Node.js 20+.

## ⚙️ MCP Client Configuration

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "prompt-store": {
      "command": "npx",
      "args": ["-y", "@mhoshdev/prompt-store-mcp@latest"]
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
      "args": ["-y", "@mhoshdev/prompt-store-mcp@latest"]
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
      "args": ["-y", "@mhoshdev/prompt-store-mcp@latest"]
    }
  }
}
```

> **For CLI access** (e.g., `--reset`): `npx -y @mhoshdev/prompt-store-mcp@latest --reset`

## CLI Options

```bash
# Start MCP server (default)
npx -y @mhoshdev/prompt-store-mcp@latest

# Reset database (clear all data, keep schema)
npx -y @mhoshdev/prompt-store-mcp@latest --reset
```

## 🛠️ Available Tools

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

## 💡 Example Usage

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

## 💾 Data Storage

- **Location**: `~/.prompt-store/prompts.db`
- **Format**: SQLite database
- **Permissions**: User-only read/write (600)

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck
```

## 🔍 Troubleshooting

### Server won't start

1. Ensure Node.js v20+ is installed: `node --version`
2. Check database directory permissions: `ls -la ~/.prompt-store`
3. View error logs: errors output to stderr

### Database corruption

1. Backup: `cp ~/.prompt-store/prompts.db ~/.prompt-store/prompts.db.backup`
2. Reset: `npx -y @mhoshdev/prompt-store-mcp@latest --reset`
3. Re-add prompts

### MCP client can't connect

1. Verify MCP client configuration path is correct
2. Restart MCP client after configuration changes
3. Ensure `npx -y @mhoshdev/prompt-store-mcp@latest` runs successfully in terminal

## License

MIT
