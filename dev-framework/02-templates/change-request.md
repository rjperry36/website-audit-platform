# Change Request — CHG-{{NNNN}} — {{TITLE}}

> Records a production-affecting change. Saved as `changes/CHG-NNNN-<title>.md`.

---

## Header

| | |
|---|---|
| **Requested by** | |
| **Date requested** | YYYY-MM-DD |
| **Change window** | YYYY-MM-DD HH:MM <timezone> |
| **Risk** | Low / Medium / High |
| **Affects** | *(systems, services, users)* |
| **Related scope(s)** | *(link)* |
| **Related runbook(s)** | *(link)* |

---

## 1. What's changing

*The actual change, stated plainly.*

---

## 2. Why

*The motivation. What problem this solves; what opportunity it unlocks.*

---

## 3. Approach

Step-by-step plan. For each step: what runs, who runs it, expected outcome.

| Step | What | Who | Expected outcome |
|------|------|-----|------------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## 4. Validation

How we confirm the change worked. Specific checks.

- *(e.g. "Curl /health returns 200")*
- *(e.g. "Login flow completes end-to-end as user X")*
- *(e.g. "Dashboard shows new metric within 5 minutes")*

---

## 5. Rollback

Exact steps to undo. If rollback isn't possible, explain why and document the mitigation.

| Step | What | Who | Verification |
|------|------|-----|--------------|
| 1 | | | |

**Rollback time estimate:** ~ N minutes.

---

## 6. Communications

| Phase | Who | When | What |
|-------|-----|------|------|
| Pre-change | | | |
| During change | | | |
| Post-change (success) | | | |
| Post-change (rollback) | | | |

---

## 7. Approvals

| Role | Signatory | Date | Notes |
|------|-----------|------|-------|
| Technical reviewer | | | |
| Stakeholder sign-off (medium+) | | | |
| Change window confirmed | | | |
| (high risk) Change Advisory | | | |

---

## 8. Pre-change checklist

```
[ ] Change record exists with all sections filled
[ ] Risk classified
[ ] Rollback plan exists and is specific
[ ] Approvals in place per risk level
[ ] Change window confirmed
[ ] Comms plan executed (pre-change)
[ ] Monitoring + alerts in place for the new behaviour
[ ] Validation steps tested in a non-prod environment first
[ ] On-call team briefed
```

---

## 9. Post-change update

*(Filled in after the change.)*

- **Actual change window:** ...
- **Time taken:** ...
- **Outcome:** Successful / Rolled back / Mixed
- **Anything that didn't go to plan:** ...
- **Lessons learned (updates needed to runbook, procedure, future changes):** ...

| Validation step | Result |
|-----------------|--------|
| | Pass / Fail |
