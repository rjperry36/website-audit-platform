---
description: Change management — request template, approval flow, rollback discipline, change windows
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Change Management

Any change that affects production — deployment, migration, vendor swap, config update — passes through a change record. The discipline scales: a trivial change is a one-paragraph note; a large change is a full record with formal approvals.

---

## 1. Anatomy

Each change is recorded using `02-templates/change-request.md`. Fields:

- **What's changing** — the actual change, stated plainly.
- **Why** — the motivation; what problem this solves.
- **Approach** — step-by-step plan; what runs; who runs it; expected outcomes.
- **Validation** — how we confirm the change worked.
- **Rollback** — exact steps to undo, or an explicit "no rollback" note with mitigation.
- **Communications** — pre, during, post.
- **Approvals** — signatories at the level the risk demands.
- **Change window** — when the change happens, in a stated timezone.
- **Post-change** — actuals, anything unexpected, what was learned.

---

## 2. Risk classification

| Risk | Criteria | Approval |
|------|----------|----------|
| **Low** | Reversible; no user-facing impact; routine | Self-approve; notify team |
| **Medium** | Reversible; some user-facing change; non-routine | Peer review + stakeholder notification |
| **High** | Hard to reverse; significant user-facing change; or production data affected | Peer review + stakeholder approval + agreed change window |

When in doubt, **classify up**. The cost of over-classifying is small; the cost of under-classifying surfaces in production.

---

## 3. The rollback plan

Every change has a rollback plan or an explicit "no rollback" note with mitigation. **"We'll figure it out" is not a rollback plan.**

- DB migrations: have the inverse migration ready before applying.
- Deployments: keep the previous build deployable.
- Vendor changes: keep the previous credentials / endpoints available for the change window.
- Configuration changes: capture the old value before changing.

If rollback genuinely isn't possible (one-way migration, irreversible deletion), the change record states this explicitly and the approval threshold is raised accordingly.

---

## 4. Change windows

- High-risk changes happen during pre-agreed change windows, not whenever convenient.
- Avoid changes immediately before weekends, holidays, or other periods when fewer people are available to respond.
- For customer-facing systems, pick low-traffic hours.
- Always state the change window in the record; if it slips, update the record.
- "Cowboy" deploys outside change windows are themselves a change-management failure.

---

## 5. Pre-change checklist

```
[ ] Change record exists with all sections filled
[ ] Risk classified
[ ] Rollback plan exists and is specific
[ ] Approvals in place per risk level
[ ] Change window confirmed
[ ] Comms plan executed (pre-change)
[ ] Monitoring + alerts in place for the new behaviour
[ ] Validation steps known and tested
[ ] On-call team briefed
```

---

## 6. During-change discipline

- One person executes the change; others observe and verify.
- Use a shared channel for live status — every step logged.
- If validation fails, **rollback first, debug after**. Don't try to "fix forward" in the change window.
- Communicate to stakeholders at agreed checkpoints.

---

## 7. Post-change update

After the change, append to the change record:

- Actual time taken (vs estimate)
- Anything that didn't go to plan
- What was learned (updates to the runbook, the procedure, the approach)

This is what turns each change into compound learning rather than one-off effort.

---

## 8. Change advisory (for projects with formal change boards)

For regulated or large-scale environments, a Change Advisory Board (CAB) approves high-risk changes:

- CAB meets on a fixed cadence (weekly is common).
- Change records are submitted before the CAB date.
- CAB reviews: risk, validation, rollback, comms, timing.
- CAB outcomes: approved, deferred (with rationale), rejected (with rationale).

The framework supports a CAB step as a specialisation of Phase 5 — it doesn't impose one on projects that don't need it.

---

## 9. Emergency changes

Emergencies are real — production is broken; the fix needs to ship now. The discipline doesn't disappear:

1. Make the change.
2. Within 24 hours, retroactively complete the change record.
3. Conduct a post-mortem: why was this an emergency? What in the framework or codebase should change to reduce emergency rate?

Emergency changes are tracked separately. If they become routine, the upstream process is failing.

---

## 10. Pre-implementation checklist

(See §5 — the canonical checklist.)
