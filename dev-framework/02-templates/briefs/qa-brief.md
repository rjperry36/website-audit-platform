# QA Brief — {{TASK_TITLE}}

> Brief for a QA contributor (human or agentic) running tests on a scope.

---

## 1. Context

| | |
|---|---|
| **Scope** | *(link)* |
| **Phase** | 2 (Plan) — write test plan / 5 (Verify) — execute |
| **Build / version under test** | |
| **Environment** | *(URL, env name, credentials reference)* |

---

## 2. Read before starting

- **Scope:** `scopes/<feature>.md` — read Frame, Plan, Architecture, Verification.
- **Test plan:** `scopes/<feature>-test-plan.md` (or test-plan section inside scope).
- **Standards:**
  - `dev-framework/01-disciplines/qa/test-strategy.md`
  - `dev-framework/01-disciplines/qa/automation.md`
  - `dev-framework/01-disciplines/qa/defect-management.md`
- **Discipline checklists relevant to this scope:**
  - `engineering/_index.md`
  - `ui/_index.md`
  - `ux/accessibility.md`
  - `infosec/security-baseline.md`

---

## 3. Goal (one sentence)

*What will be true at the end of this QA pass that isn't now?*

---

## 4. Scope of testing

- **In scope:** *(what to test)*
- **Out of scope:** *(what NOT to test in this round and why)*

---

## 5. Tasks

| # | Task | Expected outcome |
|---|------|------------------|
| 1 | Execute test plan §3 (acceptance criteria) | All Pass or each Fail captured as a defect |
| 2 | Run automation suite | All green |
| 3 | Manual regression scope: <list> | All green |
| 4 | Accessibility pass (automated scanner + keyboard) | Zero violations |
| 5 | Performance pass (web-vitals tool) | All metrics within targets |
| 6 | Security pass (dep audit, secret scan) | Clean |

---

## 6. Defect recording

For each defect:

- Use `02-templates/incident-record.md` pattern for severity assignment (SEV / P)
- Capture steps to reproduce, expected, actual, evidence
- File under `defects/DEF-NNNN-<title>.md`
- Notify the scope owner

---

## 7. Definition of done

- [ ] Test plan executed in full
- [ ] All P1 defects resolved or merge-blocking
- [ ] All P2 defects resolved or explicitly accepted with rationale
- [ ] Accessibility pass clean
- [ ] Non-functional targets met or accepted
- [ ] Test artefacts retained: results, screenshots, videos, logs
- [ ] Verification section of the scope file updated with results

---

## 8. Reviewer

**Reviewer:** _____________________ (typically the scope's Delivery Lead)
