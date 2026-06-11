---
description: Operations discipline — runbooks, change management, CI/CD, incident management
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Operations Discipline

Read at Phase 3 for any work that changes how something runs in production — deployments, migrations, vendor changes, configuration updates, runbook authoring, incident response.

| Standard | File | When |
|----------|------|------|
| Runbooks | [`runbooks.md`](runbooks.md) | When documenting any recurring or oncall procedure |
| Change management | [`change-management.md`](change-management.md) | Any production-affecting change |
| CI / CD | [`ci-cd.md`](ci-cd.md) | Phase 3 when shaping or changing the build / deploy pipeline |
| Incident management | [`incident-management.md`](incident-management.md) | Always — referenced when an incident occurs |

---

## Companion documents (project-specific)

- **`OPERATIONS.md`** or **`RUNBOOK_INDEX.md`** at the project root — listing live runbooks and their owners.
- **`ON_CALL.md`** — on-call rotation, escalation tree, paging contacts.
- **`SLO.md`** — Service-Level Objectives (latency, error rate, availability) and the actions taken if they're breached.

---

## Verification checklist (Phase 5)

```
[ ] Change record exists with all sections filled (for any prod change)
[ ] Rollback plan exists and is specific
[ ] Monitoring + alerts in place for any new service / endpoint
[ ] Runbook(s) updated or new ones written for new operational behaviour
[ ] On-call team briefed on what's changing and when
[ ] Post-change validation steps defined
```
