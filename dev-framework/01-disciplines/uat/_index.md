---
description: UAT discipline — user / stakeholder / customer acceptance testing
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# UAT Discipline

Read at Phase 2 (Plan) for any scope with a customer, business, or stakeholder acceptance step; Phase 5 (Verify) for execution and sign-off.

UAT is **separate from QA**. QA confirms the work meets its specification; UAT confirms the work meets the user's or stakeholder's actual need. Both can pass and the work can still be wrong (if the spec was wrong, only UAT will catch it).

| Standard | File | When |
|----------|------|------|
| UAT process | [`uat-process.md`](uat-process.md) | Phase 2 (plan UAT) and Phase 5 (execute UAT) |
| Sign-off | [`sign-off.md`](sign-off.md) | Phase 5 (gate G5) and Phase 6 (gate G6) |

---

## Companion documents (project-specific)

- **Acceptance criteria per scope** — these live inside the scope file (Phase 1 / 2)
- **UAT script(s)** — built from `02-templates/uat-script.md`, kept in `uat/` folder during execution

---

## Verification checklist (Phase 5)

```
[ ] UAT script executed by the actual stakeholder (or proxy with explicit delegation)
[ ] Each acceptance criterion explicitly passed or failed
[ ] Any deviation captured as a defect with severity
[ ] Sign-off recorded (signature, date, version)
[ ] Outstanding items have a follow-up plan (separate scope or accepted)
```

---

## When UAT is skipped

For routine, internal-only, low-risk work, UAT may be skipped — but the decision is **recorded**, not implicit. The scope's Verification section says explicitly "UAT not required because…". A scope cannot quietly omit UAT.
