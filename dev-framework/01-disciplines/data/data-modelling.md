---
description: Data modelling — schema design, migrations, integrity, performance
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Data Modelling

Read at Phase 2 when designing schemas or transformations.

---

## 1. Design for the read, not just the write

Before any schema decision, ask:

- **What queries will this table serve?** Index for the access pattern, not the entity.
- **What writes does it support?** Throughput, concurrency, atomicity.
- **What lifecycle does the row have?** Created, updated, archived, deleted — each has implications.

A schema designed only for "shape" without queries in mind will need a rewrite the first time it sees real traffic.

---

## 2. Integrity

- **Foreign keys define relationships.** Don't fake them with application logic.
- **Constraints over comments.** A `CHECK` constraint is the documentation that enforces itself.
- **Defaults are deliberate.** A default value is a decision; null-vs-default-vs-required is part of the model.
- **`created_at` and `updated_at` on every table** — even when "you'll never need them." You will.

---

## 3. Migrations

- **Additive where possible** — add columns/tables, never drop in a single step.
- **If a column must be removed**: first deploy with the column unused; remove in a second deploy.
- **New non-null columns always have a `DEFAULT`** value (otherwise migration fails on existing rows).
- **Never rename in one step** — add new column, backfill, switch readers, switch writers, remove old.
- **Migrations are reversible where possible.** If irreversible, the change record (`02-templates/change-request.md`) must call it out.

---

## 4. Indexing

- Index every column used in a `WHERE`, `ORDER BY`, or `JOIN`.
- Composite indexes match query patterns (column order matters).
- Don't over-index — every index slows writes.
- Run `EXPLAIN` (or platform equivalent) on key queries; address sequential scans on large tables.

---

## 5. Money, time, identifiers

Three areas that cause the most production pain — fix them at schema time:

- **Money** — integers (smallest currency unit, e.g. pence/cents). Never floats. Currency code stored alongside the amount.
- **Time** — UTC in the database; convert at the edges. ISO-8601 strings if not native datetime. Timezone of the user stored explicitly if user-facing display matters.
- **Identifiers** — UUIDs for public-facing IDs (don't expose autoincrement counts). Autoincrement for internal-only joining if there's a good reason.

---

## 6. Snapshots vs derivations

Decide explicitly: is this value a **fact** (store it) or a **calculation** (derive it)?

- Store: line totals on an invoice at the time it was issued (so a tax-rate change tomorrow doesn't retroactively alter past invoices).
- Derive: current account balance (sum of transactions).
- The line is judgement — but make it consciously.

When in doubt, snapshot. Storage is cheap; corrupted history is expensive.

---

## 7. Soft vs hard delete

- **Hard delete** removes the row. Use when retention demands it (GDPR erasure) or the row genuinely shouldn't exist.
- **Soft delete** marks the row as deleted but keeps it. Use when audit history matters or recovery is needed.
- Pick one per table; document it.

---

## 8. Naming

- **Singular table names** or **plural** — pick one project-wide and stick with it.
- **snake_case** in most SQL flavours; the language's idiomatic case in application code — let the ORM bridge them.
- **Foreign keys** name the relationship: `user_id`, not `id_user`.
- **Boolean columns** are positive predicates: `is_active`, not `not_deleted`.

---

## 9. Performance — pragmatic patterns

- **Paginate everything** that can grow.
- **Avoid SELECT \*** in production code; whitelist columns.
- **N+1 is a smell** — fetch in one query, not per row.
- **Use connection pools** appropriately for the runtime (serverless functions in particular).
- **Slow query logs on** in non-trivial production environments.

---

## 10. Pre-implementation checklist

```
[ ] Queries identified before schema designed
[ ] Foreign keys + constraints in place
[ ] created_at / updated_at on every new table
[ ] Migration reversible (or noted as one-way)
[ ] Indexes match query patterns
[ ] Money / time / identifiers handled per the patterns above
[ ] Snapshot vs derived decided per field
[ ] Soft vs hard delete decided per table
[ ] Naming follows the project convention
[ ] Slow-query log in place for production
```
