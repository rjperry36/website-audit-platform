---
description: Defect management — triage, severity, fix discipline, backlog
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Defect Management

A defect is any observed gap between expected and actual behaviour. The framework treats defects as first-class items — they have a defined shape, a priority, an owner, and an outcome.

---

## 1. Defect record (template)

```markdown
# DEF-NNNN — <short title>

**Status:** New | Triaged | In progress | Fixed | Verified | Won't fix
**Severity:** P1 | P2 | P3 | P4
**Reported by:** <name>
**Reported on:** YYYY-MM-DD
**Affects:** <scope, area, version>
**Environment:** <where observed>

## Steps to reproduce
1. ...

## Expected
What should happen.

## Actual
What happens instead.

## Evidence
Screenshots / logs / video / network captures.

## Root cause (filled when triaged)
What in the code / config / data caused this.

## Fix (filled on resolution)
What was changed, with link to scope / commit / PR.

## Verification (filled at G5)
Who verified, how, when.
```

For trivial defects, fields collapse — but the shape is the same so the records aggregate.

---

## 2. Severity

| Severity | Definition | SLA (typical) |
|----------|------------|---------------|
| **P1 — Critical** | Production outage; data loss; security breach; primary user flow blocked | Fix in hours; comms to stakeholders |
| **P2 — Major** | Significant user impact; workaround exists but painful; affects multiple users | Fix in days; release on next deploy |
| **P3 — Minor** | Noticeable but not blocking; affects few users or rare scenarios | Fix in current sprint / next planned window |
| **P4 — Cosmetic** | Visual or copy issue; doesn't affect function | Fix when convenient; batch with similar issues |

Severity is **assigned**, not chosen by the reporter. Triage decides.

---

## 3. Priority vs severity

Severity is about impact when it happens. Priority is about *when we fix it*. They usually align — but:

- A P3 with a P2-priority because it affects an upcoming launch.
- A P2 with a P3-priority because the fix needs a multi-week migration.

If priority and severity diverge by more than one tier, that's worth a comment in the record.

---

## 4. Triage cadence

| Cadence | What happens |
|---------|--------------|
| Daily (or as raised) | P1 triaged within the hour |
| Daily | P2 triaged within the working day |
| Weekly | P3 backlog reviewed; bumped up or aged out |
| Monthly | P4 backlog swept; closed in bulk where superseded |

Triage assigns: severity, owner, target release/sprint, root-cause hypothesis.

---

## 5. Root cause

Every closed P1/P2 has a written root cause. The format:

```markdown
**Root cause:** the immediate technical cause
**Underlying cause:** what allowed this to ship (missing test, gap in standard, time pressure)
**Prevention:** what we will change so this class of defect can't recur
```

If "prevention" is missing, the fix is incomplete. P1 defects often produce updates to:

- A discipline standard (gap in the rules)
- A test (gap in coverage)
- A runbook (gap in response)

---

## 6. The "no rabbit-holes" rule

When fixing a defect:

- **Stay inside the defect.** Don't refactor unrelated code while you're in there.
- **Log discoveries separately.** New defects found during the fix become their own records, not silent expansions.
- **Fix at the right level.** A P3 fixed by a P1-shaped change (massive refactor) is usually fixing the wrong thing.

---

## 7. Won't-fix

"Won't fix" is a legitimate outcome. It's recorded with a reason:

- **By design** — the behaviour is correct; the defect is a misunderstanding (often a docs issue then).
- **Out of scope** — the defect is real but doesn't belong to this product.
- **Can't reproduce** — investigated and unable to recreate; left open to re-raise if it returns.
- **Accepted risk** — known, judged acceptable, recorded.

Never silently close a defect. The record stays; the status changes.

---

## 8. Production incident pipeline

A P1 in production is an incident:

1. **Acknowledge** — first responder picks it up; stakeholders notified per the comms plan.
2. **Contain** — stop the bleed (rollback, feature flag, traffic shift).
3. **Fix** — produce the fix, test it, deploy it.
4. **Communicate** — internal + external update.
5. **Post-mortem** — within 5 working days. Blameless. Includes timeline, root cause, prevention.

The post-mortem produces concrete actions: standard updates, test additions, runbook revisions. Each action has an owner and a deadline.

---

## 9. Backlog hygiene

The defect backlog is a project asset, not a graveyard.

- Defects > 90 days old are aged. Each aged defect is either bumped up in priority, fixed in a batch, or explicitly closed as "accepted technical debt."
- Closed defects are searchable — they're the project's lessons.
- Backlog statistics (open count by severity, average age, fix-to-detection ratio) are reviewed at each release retro.

---

## 10. Pre-implementation checklist (for triage / handling)

```
[ ] Defect record uses the standard shape
[ ] Severity assigned at triage, not by reporter alone
[ ] Owner named at triage
[ ] Steps to reproduce are reliable
[ ] Evidence attached
[ ] Root cause written before closing P1/P2
[ ] Prevention action recorded for P1/P2
[ ] No rabbit-hole — fix scoped to the defect
[ ] Verification step recorded at G5
```
