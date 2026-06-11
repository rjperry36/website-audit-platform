---
description: Data discipline — data modelling, data governance, data quality
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Data Discipline

Read at Phase 2 for any scope touching data models, pipelines, analytics, or governed datasets.

| Standard | File | When |
|----------|------|------|
| Data modelling | [`data-modelling.md`](data-modelling.md) | Phase 2 when designing schemas or transformations |
| Data governance | [`data-governance.md`](data-governance.md) | Phase 2 for any new dataset; Phase 5 for compliance verification |

---

## Companion documents (project-specific)

- **`SCHEMA.md`** or your ORM / modelling tool's schema files — the canonical schema definition. (See `RECOMMENDED-TOOLS.md` for example ORMs and modelling tools.)
- **`DATA_INVENTORY.md`** — what data the project holds, where, who can read it, how long it's kept
- **`DATA_DICTIONARY.md`** — field-level definitions for non-obvious columns

---

## Verification checklist (Phase 5)

```
[ ] Schema changes reviewed; foreign keys + indexes correct
[ ] Migrations reversible (or "no rollback" explicitly noted)
[ ] Data inventory updated for any new personal or regulated data
[ ] Access list reviewed; least-privilege applied
[ ] Retention period set and enforced
[ ] PII handling reviewed (logging, exports, backups)
```
