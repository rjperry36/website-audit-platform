---
description: UX discipline — process, research, interaction design, accessibility
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# UX Discipline

Read at Phase 1 (Frame), Phase 2 (Plan), and Phase 4 (Execute) for any work that affects how users interact.

| Standard | File | When |
|----------|------|------|
| UX process | [`ux-process.md`](ux-process.md) | Phase 1–2 for any user-facing work |
| User research | [`user-research.md`](user-research.md) | Phase 1 when evidence is needed; Phase 5 for evaluative research |
| Interaction design | [`interaction-design.md`](interaction-design.md) | Phase 4 for any interactive flow |
| Accessibility | [`accessibility.md`](accessibility.md) | Phase 4 (execute) and Phase 5 (audit) for every UI surface |

---

## Companion documents (project-specific)

- **User personas / segments** — `personas.md` at the project root, or in `research/`
- **Journey maps** — for the top user journeys, `journeys/` folder
- **Information architecture** — for content-heavy projects, `ia.md`

These evolve faster than the framework standards and are project-specific by nature.

---

## Verification checklist (Phase 5)

```
[ ] WCAG 2.1 AA accessibility audit complete (see accessibility.md)
[ ] Keyboard-only run-through of the new flow passes
[ ] Loading / error / empty states present and tested
[ ] Edge cases enumerated: long content, missing content, slow connection
[ ] Mobile experience tested on actual device, not just emulator
[ ] User research evidence (if any) attached to the scope
```
