---
description: UI discipline — visual standards, design system discipline, frontend implementation
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# UI Discipline

Read at Phase 3 for any work that produces a visual artefact: web pages, app screens, dashboards, slide decks, brand collateral, emails.

| Standard | File | When |
|----------|------|------|
| Design system discipline | [`design-system-discipline.md`](design-system-discipline.md) | Phase 3 every UI scope |
| Visual standards | [`visual-standards.md`](visual-standards.md) | Phase 4 when producing screens |
| Frontend implementation | [`frontend-implementation.md`](frontend-implementation.md) | Phase 4 when implementing in code |

---

## Companion documents (project-specific)

A `DESIGN_SYSTEM.md` at the project root is the **canonical rule book** for *this* project — typography scale, palette, spacing tokens, component patterns, banned utilities. The framework standards govern *how* to use and extend it; the design system carries the specific rules.

If the project has multiple brands or themes, maintain one `DESIGN_SYSTEM.md` per theme and a brand-mapping doc explaining when each is used.

---

## Verification checklist (Phase 5)

```
[ ] Design system audit: tokens used, no hardcoded colours/sizes
[ ] All component variants documented (default, hover, focus, active, disabled, loading)
[ ] Responsive verified at each project-defined breakpoint
[ ] Dark mode verified (if applicable)
[ ] Visual QA against the agreed mockup or prototype
[ ] No banned utilities introduced
```
