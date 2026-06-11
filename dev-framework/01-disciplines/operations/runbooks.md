---
description: How to write, version, and maintain operational runbooks
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Runbooks

A runbook is a reproducible recipe for performing a procedure under stress. The audience is **"you at 2am, three months from now, paged about something you didn't write."**

---

## 1. When to write one

Write a runbook when **all** of these are true:

- The procedure has been done at least twice **or** is expected to recur.
- Getting it wrong has a non-trivial cost (data loss, outage, customer impact, financial impact).
- Someone other than the original author might need to do it.

Don't write a runbook for one-off tasks. They become stale faster than they help.

---

## 2. Anatomy

```markdown
# Runbook: <Name>

**Version:** 1
**Owner:** <team or person>
**Last verified:** YYYY-MM-DD
**Estimated time:** <minutes>
**Risk level:** Low | Medium | High

## When to use this
One paragraph. The signal that triggers this runbook.

## Pre-requisites
- Access required (which systems, which roles)
- Tools / accounts needed
- Conditions that must be true before starting

## Procedure
1. Step with the **exact command** to run
2. Expected output
3. Decision points clearly marked: "If X, go to step 5. If Y, go to step 8."

## Verification
How you know it worked. Specific things to check.

## Rollback
Step-by-step undo. If rollback isn't possible, say so explicitly.

## Escalation
Who to contact and when. Phone / team chat / on-call rotation.

## Last incident
Date and summary of the last time this runbook was used. Append, don't overwrite.
```

Template: `02-templates/runbook.md`.

---

## 3. The "2am rule"

A runbook fails the test if any of these are true at 2am:

- It refers to "the usual database" without naming which one
- A step says "run the cleanup script" without the exact path and command
- It assumes you remember which environment variables exist
- A decision point isn't explicitly marked
- Tribal knowledge is required to interpret a step

When in doubt, **over-specify**.

---

## 4. Verification cadence

Runbooks rot. Re-run each runbook against a non-production environment:

| Risk level | Cadence |
|------------|---------|
| High | Quarterly |
| Medium | Every six months |
| Low | Annually |

Update `Last verified` after each dry run. If the runbook doesn't work, fix it before noting the verification.

---

## 5. Versioning

When a procedure changes substantively, bump the version. Keep the previous version under `runbooks/archive/<name>.v<N>.md` for reference — particularly important if the old version was used during an incident.

---

## 6. Runbook index

The project's `RUNBOOK_INDEX.md` (or equivalent) lists every active runbook with:

- Name + link
- Owner
- Risk level
- Last verified date
- A one-line "use this when..." description

The index is the operational map.

---

## 7. Pre-implementation checklist

```
[ ] Procedure has been done at least twice
[ ] Audience specified (who runs this, with what access)
[ ] Every step has an exact command or specific click target
[ ] Decision points marked clearly with "If X, …"
[ ] Verification steps included
[ ] Rollback path documented (or "no rollback possible" stated)
[ ] Escalation contact listed
[ ] Last-verified date set
[ ] Runbook added to the project's runbook index
```
