<!--
## Sync Impact Report
- Version change: N/A → 1.0.0 (initial creation)
- Modified principles: None (new constitution)
- Added sections: All 5 principles, Quality Gates, Development Workflow, Governance
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ not updated (user preference: templates remain generic)
  - .specify/templates/spec-template.md ✅ aligned
  - .specify/templates/tasks-template.md ✅ aligned
- Follow-up TODOs: None
-->

# Prompt Store MCP Constitution

## Core Principles

### I. Code Quality

Code MUST be maintainable, readable, and follow consistent style conventions.

- All code MUST pass linting and type checking before merge
- Functions and modules MUST have single, clear responsibilities
- Code MUST be self-documenting; comments reserved for "why" not "what"
- DRY principle enforced: duplication beyond 3 instances requires abstraction
- All code MUST be reviewed by at least one other developer

**Rationale**: Maintainable code reduces technical debt and accelerates future development.

### II. Testing Standards

All features MUST have comprehensive test coverage before deployment.

- Unit test coverage MUST NOT fall below 80% for new code
- Integration tests MUST validate all external interfaces and contracts
- Test-first development (TDD) REQUIRED for critical paths
- All tests MUST pass before any merge to main branch
- Performance tests REQUIRED for features with latency requirements

**Rationale**: Comprehensive testing prevents regressions and ensures reliable software.

### III. User Experience Consistency

All user-facing interfaces MUST provide consistent, predictable experiences.

- Error messages MUST be actionable and user-friendly
- All APIs MUST return consistent response structures
- Breaking changes MUST be versioned with migration paths
- Accessibility standards (WCAG 2.1 AA) MUST be met for all UI components
- Documentation MUST be updated alongside feature changes

**Rationale**: Consistent UX builds trust and reduces user friction.

### IV. Performance Requirements

System performance MUST meet defined thresholds under expected load.

- API endpoints MUST respond within 200ms for 95th percentile
- Memory usage MUST NOT exceed defined limits per service
- Database queries MUST be optimized (indexed, N+1 eliminated)
- Resource leaks MUST be detected and prevented in CI
- Performance regressions MUST block deployment

**Rationale**: Performance is a feature; users expect responsive systems.

### V. Simplicity

Solutions MUST be as simple as possible, but no simpler.

- YAGNI enforced: implement only what is currently needed
- Abstractions MUST justify their complexity with clear benefits
- Configuration over code for behavioral changes
- Delete dead code immediately; no deprecated code accumulation
- Prefer proven solutions over novel ones unless justified

**Rationale**: Simpler systems are easier to understand, maintain, and debug.

## Quality Gates

All changes MUST pass these gates before merge:

| Gate | Tool | Threshold |
|------|------|-----------|
| Linting | Configured linter | Zero errors |
| Type Check | Type checker | Zero errors |
| Unit Tests | Test runner | 80%+ coverage, all pass |
| Integration Tests | Test runner | All pass |
| Security Scan | SAST tool | Zero critical/high findings |

## Development Workflow

### Branch Strategy

- `main`: Production-ready code, protected branch
- `feature/*`: Feature development branches
- `fix/*`: Bug fix branches

### Pull Request Process

1. Create branch from `main`
2. Implement changes with tests
3. All quality gates MUST pass
4. At least one approval required
5. Squash merge to `main`

### Deployment

- All deployments MUST be automated via CI/CD
- Rollback plan MUST exist for all deployments
- Production changes MUST be logged and auditable

## Governance

### Amendment Procedure

1. Proposed changes MUST be documented with rationale
2. Changes MUST be reviewed by project maintainers
3. Breaking changes require migration plan
4. Version MUST be incremented per semantic versioning

### Versioning Policy

- **MAJOR**: Principle removal or incompatible governance changes
- **MINOR**: New principles or materially expanded guidance
- **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance Review

- All PRs MUST verify compliance with constitution principles
- Complexity beyond standard patterns MUST be justified in code review
- Constitution supersedes all other development practices

**Version**: 1.0.0 | **Ratified**: 2026-02-18 | **Last Amended**: 2026-02-18
