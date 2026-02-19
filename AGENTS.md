# prompt-store-mcp Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-19

## Active Technologies

- Node.js v20+ TypeScript
- @modelcontextprotocol/sdk (stdio transport)
- better-sqlite3
- handlebars
- zod

## Project Structure

```text
src/
tests/
```

## Commands

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run linting
pnpm lint

# Type check
pnpm typecheck

# Start MCP server
pnpm start

# Reset database
pnpm start -- --reset
```

## Code Style

TypeScript: Follow standard conventions with strict mode enabled. Use Zod for runtime validation.

## Recent Changes

- 001-mcp-prompt-store: MCP server for local prompt management with SQLite storage

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
