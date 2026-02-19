# Feature Specification: MCP Prompt Store

**Feature Branch**: `001-mcp-prompt-store`  
**Created**: 2026-02-18  
**Status**: Draft  
**Input**: User description: "Build MCP Prompt Store, a local-only AI prompt management platform for the MVP. It should store prompts in a SQLite database and be installable as node package. It's aimed at individual developers or small teams who want to organize their AI prompts without complex sharing or web services."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Store and Manage Prompts (Priority: P1)

As a developer, I want to store my AI prompts locally so I can organize and retrieve them when working with MCP-compatible AI assistants.

**Why this priority**: This is the core value proposition - without the ability to store and manage prompts, the system provides no utility. This forms the foundation for all other features.

**Independent Test**: Can be fully tested by adding a prompt via MCP tool, listing prompts to verify it was saved, updating the prompt content, and deleting it. Delivers immediate value as a personal prompt library.

**Acceptance Scenarios**:

1. **Given** the MCP server is running, **When** I invoke the `add_prompt` tool with a title and content, **Then** the prompt is stored in the local SQLite database and a unique prompt ID is returned.
2. **Given** prompts exist in the database, **When** I invoke the `list_prompts` tool, **Then** stored prompts are returned with their IDs, titles, content snippets (first 200 characters), and metadata.
3. **Given** a prompt exists with ID "abc123", **When** I invoke the `update_prompt` tool with new content, **Then** the prompt is updated and the updated_at timestamp is modified.
4. **Given** a prompt exists with ID "abc123", **When** I invoke the `delete_prompt` tool with that ID, **Then** the prompt is permanently removed from the database.
5. **Given** a prompt exists with ID "abc123", **When** I invoke the `get_prompt` tool with that ID, **Then** the full prompt content and all metadata are returned.

---

### User Story 2 - Search Prompts by Keyword (Priority: P2)

As a developer, I want to search my stored prompts by keywords so I can quickly find relevant prompts when I need them.

**Why this priority**: Search functionality significantly improves the utility of a prompt library as it grows. Without search, users must manually browse all prompts which becomes impractical with more than 20-30 prompts.

**Independent Test**: Can be tested by adding multiple prompts with different content, then searching for specific terms and verifying correct results are returned. Delivers value by making the prompt library navigable.

**Acceptance Scenarios**:

1. **Given** prompts exist with titles/content containing "code review", **When** I invoke the `search_prompts` tool with query "review", **Then** all prompts matching "review" in title or content are returned.
2. **Given** no prompts match the search term, **When** I invoke `search_prompts` with query "nonexistent", **Then** an empty result set is returned with no errors.
3. **Given** prompts contain special characters, **When** I search using those characters, **Then** the search handles special characters correctly without errors.

---

### User Story 3 - Categorize Prompts by Tags (Priority: P3)

As a developer, I want to assign tags to my prompts so I can organize them into meaningful categories and filter by those categories.

**Why this priority**: Tags add organizational structure but the system remains functional without them. Users can still store and search prompts, making this an enhancement rather than a core requirement.

**Independent Test**: Can be tested by creating prompts with various tags, then filtering prompts by single and multiple tags. Delivers value by enabling categorical organization of prompts.

**Acceptance Scenarios**:

1. **Given** I am adding a prompt, **When** I include tags ["coding", "review"], **Then** the prompt is stored with those tags associated.
2. **Given** prompts exist with various tags, **When** I invoke `filter_by_tags` with ["coding"], **Then** only prompts tagged with "coding" are returned.
3. **Given** prompts exist with multiple tags, **When** I filter by ["coding", "review"], **Then** prompts tagged with either tag are returned (OR logic).
4. **Given** I add a prompt with an existing tag name (case-insensitive), **When** the tag "Coding" already exists as "coding", **Then** the existing tag is reused rather than creating a duplicate.
5. **Given** tags exist in the database, **When** I invoke `list_tags`, **Then** all tags are returned with their names and the count of associated prompts.

---

### Edge Cases

- What happens when searching with an empty query string? Return all prompts (equivalent to list).
- How does the system handle prompts with very long content (10,000+ characters)? Store and retrieve successfully; content field has no artificial limit.
- What happens when updating a non-existent prompt ID? Return appropriate error indicating prompt not found.
- How are tag names normalized? Tags are stored in lowercase; duplicate tags with different casing are merged.
- What happens if the SQLite database file is corrupted or missing? Create a new database file automatically on startup.
- What happens when listing prompts with a very large database? Default to returning first 10 prompts with total count and "has_more" flag; support explicit pagination with limit/offset.
- What happens to tags with zero associated prompts? Tags are retained in the database for potential reuse; no automatic cleanup is performed.
- What happens to tag associations when a prompt is deleted? PromptTag entries are automatically removed when the prompt is deleted, keeping the junction table clean.
- What happens when adding a prompt with a title that already exists? Return a DUPLICATE_TITLE error; the original prompt is unchanged.
- What happens when using an invalid tag name (e.g., too long, special characters)? Return an INVALID_TAG error with details about the constraint violated.
- What happens when adding or updating a prompt with a title exceeding 200 characters? Return an INVALID_TITLE error indicating the maximum length constraint.
- What happens when the `--reset` CLI flag is used? All rows are deleted from the prompts, tags, and prompt_tags tables while preserving the database file and schema; the operation executes immediately without confirmation prompt (intended for testing scenarios).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to add prompts with a title (maximum 200 characters) and content via the `add_prompt` MCP tool.
- **FR-001a**: System MUST enforce unique prompt titles; attempting to add or update a prompt with a duplicate title must return a DUPLICATE_TITLE error.
- **FR-001b**: System MUST validate title length; attempting to add or update a prompt with a title exceeding 200 characters must return an INVALID_TITLE error.
- **FR-002**: System MUST allow users to list stored prompts via the `list_prompts` MCP tool, returning snippets (first 200 characters of content) with optional pagination (default limit: 10 prompts per page), ordered by most recently updated first (updated_at descending).
- **FR-002a**: System MUST allow users to retrieve full prompt content via the `get_prompt` MCP tool by providing a prompt ID.
- **FR-003**: System MUST allow users to search prompts by keyword matching title or content via the `search_prompts` MCP tool using case-insensitive partial matching, with results ordered by most recently updated first (updated_at descending).
- **FR-004**: System MUST allow users to update existing prompts via the `update_prompt` MCP tool, requiring both title and content to be provided.
- **FR-005**: System MUST allow users to delete prompts via the `delete_prompt` MCP tool.
- **FR-006**: System MUST allow users to assign one or more tags to prompts when adding or updating.
- **FR-006a**: System MUST validate tag names: maximum 50 characters, alphanumeric characters plus dash and underscore only; invalid tags must return an INVALID_TAG error.
- **FR-007**: System MUST allow users to filter prompts by one or more tags via the `filter_by_tags` MCP tool.
- **FR-007a**: System MUST allow users to list all available tags via the `list_tags` MCP tool, returning tag names with their associated prompt counts.
- **FR-008**: System MUST store all data in a local SQLite database at `~/.prompt-store/prompts.db`.
- **FR-009**: System MUST create the database and directory structure automatically if they do not exist.
- **FR-009a**: System MUST set file permissions to 600 (user-only read/write) on the database file to protect potentially sensitive prompt data.
- **FR-010**: System MUST be installable as the npm package `prompt-store-mcp` and runnable via npx; when executed without CLI flags, it MUST start the MCP server in stdio mode by default.
- **FR-011**: System MUST communicate via stdio transport for local MCP client integration.
- **FR-012**: System MUST return structured JSON error responses with error code and message (e.g., `{"error": {"code": "NOT_FOUND", "message": "Prompt not found"}}`) for invalid operations.
- **FR-013**: System MUST log errors to stderr only (stdout reserved for MCP protocol messages).
- **FR-014**: System MUST support a `--reset` CLI flag that clears all rows from the prompts, tags, and prompt_tags tables while preserving the database file and schema; this operation is destructive and intended for testing/reset purposes only, and MUST NOT be exposed as an MCP tool.

### Key Entities

- **Prompt**: Represents a stored AI prompt with a unique identifier (UUID v4 format), a unique title (maximum 200 characters), content, creation timestamp, and last-updated timestamp. Each prompt can have zero or more tags associated with it.

- **Tag**: Represents a category label that can be applied to prompts. Tags have unique names (case-insensitive, stored in lowercase, maximum 50 characters, alphanumeric plus dash and underscore only) which serve as the primary key. Tags can be associated with multiple prompts and persist even when no prompts are associated with them (orphaned tags are retained).

- **PromptTag**: Represents the many-to-many relationship between prompts and tags, enabling flexible categorization where prompts can have multiple tags and tags can be applied to multiple prompts. When a prompt is deleted, its associated PromptTag entries are automatically removed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete all CRUD operations (add, list, update, delete) on prompts within 2 seconds per operation when the database contains up to 10,000 prompts.

- **SC-002**: Search operations return results in under 500 milliseconds for databases containing up to 10,000 prompts.

- **SC-003**: The `prompt-store-mcp` npm package installs successfully and the MCP server starts within 5 seconds on a standard development machine.

- **SC-004**: 100% of prompt data persists correctly between server restarts - no data loss occurs during normal operation.

- **SC-005**: Users can filter prompts by tags and receive correct results, with tag operations completing in under 300 milliseconds.

- **SC-006**: The system handles database files up to 100MB without performance degradation in search or list operations.

## Clarifications

### Session 2026-02-18

- Q: What format should prompt IDs use? → A: UUID v4
- Q: Default pagination behavior for list_prompts? → A: Return first 10 prompts with total count and "has_more" flag
- Q: Should list_prompts return full content or snippets? → A: Snippets (first 200 chars) by default; use get_prompt for full content
- Q: What level of logging should the MCP server provide? → A: Errors only to stderr
- Q: What format should error responses use? → A: Structured JSON with error code and message

### Session 2026-02-19

- Q: What file permissions should be set on the SQLite database file? → A: User-only read/write (600)
- Q: What should happen to tags with zero prompt associations? → A: Keep orphaned tags for potential reuse
- Q: Should tags have a separate ID or use name as primary key? → A: Lowercase tag name as primary key
- Q: Should there be a tool to list all available tags? → A: Yes, add `list_tags` tool
- Q: What type of matching should search_prompts use? → A: Case-insensitive partial match
- Q: When a prompt is deleted, what should happen to its tag associations in the PromptTag junction table? → A: Remove associations automatically (cascade delete)
- Q: Can multiple prompts have the same title? → A: No, titles must be unique
- Q: What should be the default ordering for list_prompts and search_prompts results? → A: Most recent first (sorted by updated_at descending)
- Q: What constraints should apply to tag names? → A: Maximum 50 characters, alphanumeric plus dash and underscore only
- Q: Should update_prompt allow partial updates (only title OR only content) or require both fields? → A: Require both title and content
- Q: Should the system include a "reset all" or bulk delete functionality to clear all data in the database? → A: Yes, via CLI flag only (e.g., `--reset`) for testing purposes; NOT exposed as MCP tool for safety
- Q: What should happen when the package is run without any CLI flags? → A: Start the MCP server in stdio mode (default behavior)
- Q: What should be the npm package name for this project? → A: prompt-store-mcp
- Q: What should the `--reset` CLI flag do to the database? → A: Clear all rows from tables (DELETE FROM) while preserving the database file and schema
- Q: Should there be a maximum length constraint on prompt titles? → A: Yes, maximum 200 characters
- Q: Should the system include a "reset all" or bulk delete functionality to clear all data in the database? → A: Yes, via CLI flag only (e.g., `--reset`) for testing purposes; NOT exposed as MCP tool for safety

## Assumptions

- Users have Node.js version 18 or higher installed on their machine.
- Users are familiar with MCP client configuration (e.g., Claude Desktop, Cursor, Windsurf).
- Single-user local usage - no concurrent access from multiple processes is expected.
- The SQLite database will remain under 100MB for typical usage patterns (approximately 50,000 average-length prompts).
- Users will configure their MCP client to launch this server via the appropriate configuration file.

## Out of Scope

The following are explicitly excluded from the MVP:

- User authentication and authorization
- Multi-user support or collaboration features
- Cloud synchronization or backup
- Prompt sharing between users
- Prompt versioning or history tracking
- Prompt templates with variable interpolation
- Rich text formatting in prompt content
- Import/export functionality
- Web-based user interface (interaction is via MCP tools only)
- Prompt execution within this server (prompts are retrieved but executed by MCP-connected services)
