# Implementation Plan: MCP Prompt Store

**Branch**: `001-mcp-prompt-store` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mcp-prompt-store/spec.md`

## Summary

A local-only AI prompt management MCP server that stores prompts in SQLite and exposes CRUD operations via MCP tools. Designed for individual developers to organize prompts without complex web services. Uses stdio transport for MCP client integration.

## Technical Context

**Language/Version**: Node.js v20+ & TypeScript  
**Primary Dependencies**: @modelcontextprotocol/sdk (stdio transport), better-sqlite3, zod  
**Deferred**: handlebars (future: prompt templates)  
**Storage**: SQLite at `~/.prompt-store/prompts.db` (auto-created, file permissions 600)  
**Testing**: Vitest (unit/integration)  
**Target Platform**: Local MCP server via stdio (Node.js runtime)  
**Project Type**: single (npm package: prompt-store-mcp)  
**Performance Goals**: <200ms p95 for CRUD, <500ms for search (up to 10k prompts)  
**Constraints**: <100MB database, single-user local-only, no concurrent access  
**Scale/Scope**: Up to 10,000 prompts, 3 entities (Prompt, Tag, PromptTag)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Code Quality | ✅ PASS | TypeScript with strict mode, Zod for validation, single-responsibility tools |
| II. Testing Standards | ✅ PASS | Vitest with 80%+ coverage target, integration tests for MCP contracts |
| III. UX Consistency | ✅ PASS | Structured JSON error responses, consistent tool naming (snake_case) |
| IV. Performance Requirements | ✅ PASS | SQLite with indexed queries, explicit pagination, <200ms p95 target |
| V. Simplicity | ✅ PASS | Single project, direct SQLite (no ORM), stdio-only transport, minimal dependencies |

**Gate Verdict**: ✅ ALL PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-mcp-prompt-store/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (MCP tool schemas)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── index.ts             # Entry point, MCP server bootstrap
├── cli.ts               # CLI argument parsing (--reset flag)
├── db/
│   ├── index.ts         # Database connection, schema init
│   └── schema.sql       # SQLite schema definitions
├── tools/
│   ├── add-prompt.ts    # add_prompt tool
│   ├── list-prompts.ts  # list_prompts tool
│   ├── get-prompt.ts    # get_prompt tool
│   ├── update-prompt.ts # update_prompt tool
│   ├── delete-prompt.ts # delete_prompt tool
│   ├── search-prompts.ts# search_prompts tool
│   ├── filter-by-tags.ts# filter_by_tags tool
│   ├── list-tags.ts     # list_tags tool
│   └── index.ts         # Tool registration
├── models/
│   ├── prompt.ts        # Prompt type and validation
│   ├── tag.ts           # Tag type and validation
│   └── errors.ts        # Error codes and messages
└── utils/
    ├── validation.ts    # Shared Zod schemas
    └── logger.ts        # stderr-only logging

tests/
├── unit/
│   ├── tools/           # Tool handler unit tests
│   └── models/          # Model validation tests
└── integration/
    ├── mcp-tools.test.ts# Full MCP tool contract tests
    └── db-operations.test.ts # Database operation tests
```

**Structure Decision**: Single project (Option 1) - This is a standalone npm package with no frontend/backend split. All code lives under `src/` with clear separation between MCP tools, database layer, and models.

## Implementation Order

Build sequence based on dependencies and priority:

| Phase | Priority | Files | Spec References |
|-------|----------|-------|-----------------|
| Foundation | - | `src/db/schema.sql`, `src/db/index.ts`, `src/models/*`, `src/utils/*` | FR-008, FR-009, FR-009a |
| P1 CRUD | P1 | `src/tools/add-prompt.ts`, `src/tools/list-prompts.ts`, `src/tools/get-prompt.ts`, `src/tools/update-prompt.ts`, `src/tools/delete-prompt.ts` | User Story 1, FR-001→FR-005 |
| P2 Search | P2 | `src/tools/search-prompts.ts` | User Story 2, FR-003 |
| P3 Tags | P3 | `src/tools/filter-by-tags.ts`, `src/tools/list-tags.ts` | User Story 3, FR-006, FR-007, FR-007a |
| Integration | - | `src/cli.ts`, `src/tools/index.ts`, `src/index.ts` | FR-010, FR-011, FR-013, FR-014 |

**Reference Files**:
- Database schema: [data-model.md](./data-model.md#sqlite-schema)
- Tool contracts: [contracts/mcp-tools.md](./contracts/mcp-tools.md)
- Integration patterns: [research.md](./research.md#integration-patterns)

## Complexity Tracking

> No violations detected - design adheres to simplicity principle with direct SQLite access, single transport, minimal abstraction.
