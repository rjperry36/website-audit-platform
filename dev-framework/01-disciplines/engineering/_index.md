---
description: Engineering discipline — standards for any code project (web, API, CLI, scripts, agents, automations)
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Engineering Discipline

Read this index at Phase 2 (Plan) to identify which engineering standards apply to the scope. Each standards file lists its own pre-implementation checklist.

| Standard | File | When |
|----------|------|------|
| Coding standards | [`coding-standards.md`](coding-standards.md) | Phase 3 (every code scope) |
| API design | [`api-design.md`](api-design.md) | Phase 3 when introducing routes, endpoints, server actions, or external integrations |
| Error handling | [`error-handling.md`](error-handling.md) | Phase 4 for any user-facing surface |
| Performance | [`performance.md`](performance.md) | Phase 4 for data fetching, images, caching, or bundle size decisions |
| Code review | [`code-review.md`](code-review.md) | Phase 5 (before any merge), Phase 6 (post-merge spot check) |

These standards are **framework-agnostic** — they cover principles that apply across any typed language and any backend or frontend framework. Language-specific or framework-specific tightening (strict-mode flags, type-hint requirements, framework conventions) goes in `02-templates/project-brief.md` as project non-negotiables or as a `_local/` engineering standard. See `RECOMMENDED-TOOLS.md` for example languages and frameworks that fit each category.

---

## Companion documents (project-specific)

Most engineering projects also maintain a few root-level companions that the framework deliberately doesn't carry:

- **`ARCHITECTURE.md`** — the high-level architecture overview for this project
- **`STACK.md`** — the chosen languages, frameworks, libraries, vendor services
- **`CONVENTIONS.md`** — project-specific naming, folder structure, commit format
- **`tsconfig` / `pyproject.toml` / equivalent** — the configured strictness settings

These project-specific docs evolve faster than the framework standards. Keep them at the project root, not inside the framework folder.

---

## Verification checklist (Phase 5)

When a scope listing `engineering` reaches Phase 5, this is the rolled-up engineering checklist. Detailed items live inside each standard:

```
[ ] Coding standards followed (see coding-standards.md §9)
[ ] API design: response shapes consistent, validation on every input, rate limits where required
[ ] Error handling: loading/error/empty states present on every UI surface
[ ] Performance: server/client split correct, images optimised, caching deliberate
[ ] Code review completed and approved
[ ] Type-check passes with zero errors
[ ] Test coverage targets met (see qa/test-strategy.md)
```
