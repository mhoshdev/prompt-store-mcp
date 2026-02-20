# Tasks: MCP Prompt Store

**Input**: Design documents from `/specs/001-mcp-prompt-store/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/mcp-tools.md, quickstart.md

**Tests**: Included per project standards (Vitest with 80%+ coverage target)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project directory structure per plan.md
- [ ] T002 Initialize Node.js project with package.json for prompt-store-mcp
- [ ] T003 [P] Install dependencies: @modelcontextprotocol/sdk, better-sqlite3, zod
- [ ] T004 [P] Install dev dependencies: typescript, vitest, @types/node, @types/better-sqlite3
- [ ] T005 [P] Configure TypeScript with strict mode in tsconfig.json
- [ ] T006 [P] Configure Vitest in vitest.config.ts
- [ ] T007 [P] Configure linting and formatting tools
- [ ] T008 [P] Add npm scripts: build, start, test, lint, typecheck in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create error codes and messages in src/errors.ts (NOT_FOUND, DUPLICATE_TITLE, INVALID_TITLE, INVALID_TAG, INVALID_INPUT)
- [ ] T010 Create Zod schemas for all entities and inputs in src/schemas.ts (Prompt, Tag, PromptTag, all tool input schemas)
- [ ] T011 Create database connection module with schema initialization in src/db.ts
- [ ] T012 Add database directory creation (~/.prompt-store) and file permissions (600) in src/db.ts
- [ ] T013 Implement CLI flag handling (--reset) in src/index.ts
- [ ] T014 Create MCP server bootstrap and stdio transport connection in src/index.ts
- [ ] T014a [P] Create database indexes in src/db.ts (prompts.updated_at DESC, tags.name, prompt_tags composite index)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Store and Manage Prompts (Priority: P1) 🎯 MVP

**Goal**: Enable CRUD operations for prompts - the core value proposition of a personal prompt library.

**Independent Test**: Can be fully tested by adding a prompt via MCP tool, listing prompts to verify it was saved, updating the prompt content, and deleting it. Delivers immediate value as a personal prompt library.

### Tests for User Story 1

- [ ] T015 [P] [US1] Create unit test for add_prompt tool handler in tests/unit/tools/add-prompt.test.ts
- [ ] T016 [P] [US1] Create unit test for list_prompts tool handler in tests/unit/tools/list-prompts.test.ts
- [ ] T017 [P] [US1] Create unit test for get_prompt tool handler in tests/unit/tools/get-prompt.test.ts
- [ ] T018 [P] [US1] Create unit test for update_prompt tool handler in tests/unit/tools/update-prompt.test.ts
- [ ] T019 [P] [US1] Create unit test for delete_prompt tool handler in tests/unit/tools/delete-prompt.test.ts
- [ ] T020 [P] [US1] Create integration test for CRUD operations in tests/integration/crud-operations.test.ts

### Implementation for User Story 1

- [ ] T021 [P] [US1] Implement add_prompt MCP tool in src/tools/add-prompt.ts
- [ ] T022 [P] [US1] Implement list_prompts MCP tool in src/tools/list-prompts.ts
- [ ] T023 [P] [US1] Implement get_prompt MCP tool in src/tools/get-prompt.ts
- [ ] T024 [P] [US1] Implement update_prompt MCP tool in src/tools/update-prompt.ts
- [ ] T025 [P] [US1] Implement delete_prompt MCP tool in src/tools/delete-prompt.ts
- [ ] T026 [US1] Create tool registration module in src/tools/index.ts (register all US1 tools)
- [ ] T027 [US1] Register US1 tools with MCP server in src/index.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can store, list, retrieve, update, and delete prompts.

---

## Phase 4: User Story 2 - Search Prompts by Keyword (Priority: P2)

**Goal**: Enable keyword search across prompt titles and content, making the prompt library navigable as it grows.

**Independent Test**: Can be tested by adding multiple prompts with different content, then searching for specific terms and verifying correct results are returned. Delivers value by making the prompt library navigable.

### Tests for User Story 2

- [ ] T028 [P] [US2] Create unit test for search_prompts tool handler in tests/unit/tools/search-prompts.test.ts
- [ ] T029 [P] [US2] Create integration test for search operations in tests/integration/search-operations.test.ts

### Implementation for User Story 2

- [ ] T030 [P] [US2] Implement search_prompts MCP tool in src/tools/search-prompts.ts
- [ ] T031 [US2] Register search_prompts tool in src/tools/index.ts
- [ ] T032 [US2] Register US2 tool with MCP server in src/index.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can search their prompt library by keywords.

---

## Phase 5: User Story 3 - Categorize Prompts by Tags (Priority: P3)

**Goal**: Enable tag-based categorization and filtering, adding organizational structure to the prompt library.

**Independent Test**: Can be tested by creating prompts with various tags, then filtering prompts by single and multiple tags. Delivers value by enabling categorical organization of prompts.

### Tests for User Story 3

- [ ] T033 [P] [US3] Create unit test for filter_by_tags tool handler in tests/unit/tools/filter-by-tags.test.ts
- [ ] T034 [P] [US3] Create unit test for list_tags tool handler in tests/unit/tools/list-tags.test.ts
- [ ] T035 [P] [US3] Create integration test for tag operations in tests/integration/tag-operations.test.ts

### Implementation for User Story 3

- [ ] T036 [P] [US3] Implement filter_by_tags MCP tool in src/tools/filter-by-tags.ts
- [ ] T037 [P] [US3] Implement list_tags MCP tool in src/tools/list-tags.ts
- [ ] T038 [US3] Register US3 tools in src/tools/index.ts
- [ ] T039 [US3] Register US3 tools with MCP server in src/index.ts

**Checkpoint**: All user stories should now be independently functional - users can organize prompts with tags and filter by tags.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and quality improvements

- [ ] T040 [P] Run full test suite and verify 80%+ coverage
- [ ] T041 [P] Create comprehensive MCP integration test in tests/integration/mcp-tools.test.ts
- [ ] T042 [P] Add JSDoc comments to all exported functions
- [ ] T043 Verify all error paths return structured JSON error responses
- [ ] T044 Verify stderr logging for errors only
- [ ] T045 [P] Validate package.json metadata (name, version, description, bin entry)
- [ ] T046 Test package installation via npx prompt-store-mcp
- [ ] T047 Run quickstart.md validation scenarios
- [ ] T048 Performance validation: CRUD <200ms p95, search <500ms, tag operations <300ms for 10k prompts
- [ ] T048a Validate 100% data persistence: restart server and verify all prompts/tags intact
- [ ] T049 Final lint and typecheck pass
- [ ] T050 Create README.md with installation instructions, MCP client configuration examples, and usage examples from quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independently testable

### Within Each User Story

- Tests can be written before, alongside, or after implementation
- All tool implementations within a story are parallelizable (different files)
- Tool registration depends on tool implementations being complete
- MCP server registration depends on tool registration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T008)
- All tests for a user story marked [P] can run in parallel
- All tool implementations within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all unit tests for User Story 1 together:
Task: "Create unit test for add_prompt tool handler in tests/unit/tools/add-prompt.test.ts"
Task: "Create unit test for list_prompts tool handler in tests/unit/tools/list-prompts.test.ts"
Task: "Create unit test for get_prompt tool handler in tests/unit/tools/get-prompt.test.ts"
Task: "Create unit test for update_prompt tool handler in tests/unit/tools/update-prompt.test.ts"
Task: "Create unit test for delete_prompt tool handler in tests/unit/tools/delete-prompt.test.ts"

# Launch all tool implementations for User Story 1 together:
Task: "Implement add_prompt MCP tool in src/tools/add-prompt.ts"
Task: "Implement list_prompts MCP tool in src/tools/list-prompts.ts"
Task: "Implement get_prompt MCP tool in src/tools/get-prompt.ts"
Task: "Implement update_prompt MCP tool in src/tools/update-prompt.ts"
Task: "Implement delete_prompt MCP tool in src/tools/delete-prompt.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Database uses SQLite with WAL mode and foreign key constraints
- All MCP tools use Zod schemas for input validation
- Error responses use structured JSON format with error codes
- Logs output to stderr only (stdout reserved for MCP protocol)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
