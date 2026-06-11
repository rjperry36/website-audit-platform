---
description: QA discipline — test strategy, automation, defect management
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# QA Discipline

Read at Phase 2 (Plan) to shape what gets tested, Phase 4 (Execute) for automation development, and Phase 5 (Verify) for execution.

| Standard | File | When |
|----------|------|------|
| Test strategy | [`test-strategy.md`](test-strategy.md) | Phase 2 for any non-trivial scope |
| Test automation | [`automation.md`](automation.md) | Phase 4 when writing or extending automated tests |
| Defect management | [`defect-management.md`](defect-management.md) | Phase 5 for triage; ongoing for backlog |

---

## Companion documents (project-specific)

- **`TEST_PLAN.md`** at the project root for the standing test strategy (regression scope, environments, tools)
- **`TEST_DATA.md`** for test data conventions (fixtures, environments, sensitive-data handling)

The framework standards govern *how* to test; project specifics carry *what* tests this project actually runs.

---

## Verification checklist (Phase 5)

```
[ ] Test plan from the scope is executed in full
[ ] Automation suite passes (unit + integration + E2E as applicable)
[ ] Manual regression scope covered
[ ] All P1/P2 defects resolved or explicitly accepted with rationale
[ ] Coverage targets met (per test-strategy.md)
[ ] Test artefacts retained: results, screenshots, logs, video for E2E
```

---

## QA in the lifecycle (cheat sheet)

| Phase | QA work |
|-------|---------|
| 1. Frame | Surface risks; ask "how will we know this is broken?" |
| 2. Plan | Write the test plan — acceptance criteria, scope, environments, tools |
| 3. Standards | Reference qa standards; record any deviations |
| 4. Execute | Build/extend automation; run smoke during development |
| 5. Verify | Execute full test plan; triage; sign G5 |
| 6. Land | Confirm regression suite updated; capture defects for follow-up |
