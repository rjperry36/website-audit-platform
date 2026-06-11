---
description: Incident management — detect, acknowledge, contain, fix, communicate, learn
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Incident Management

An incident is any unplanned event that causes (or threatens) significant user impact. P1 defects in production are incidents (see `qa/defect-management.md`); so are outages, security breaches, data exposures, and material SLO breaches.

The framework's incident-management discipline runs in parallel to the lifecycle — incidents are interrupts, not phases.

---

## 1. The flow

```
1. DETECT       Monitoring fires, or a user/colleague reports
2. ACKNOWLEDGE  First responder picks it up; declares an incident
3. CONTAIN      Stop the bleed (rollback, feature flag, traffic shift)
4. INVESTIGATE  Find the cause; gather evidence
5. FIX          Apply the fix; verify
6. COMMUNICATE  Internal + external updates at agreed checkpoints
7. RESOLVE      Confirm resolution; close the incident
8. LEARN        Post-mortem within 5 working days
```

---

## 2. Severity

| Severity | Definition | Response |
|----------|------------|----------|
| **SEV-1** | Production down for many users; data loss; security breach; legal/regulatory exposure | All-hands; immediate response; stakeholder comms hourly |
| **SEV-2** | Major degradation; significant subset of users affected; workaround painful | Immediate response; comms every 2–4 hours |
| **SEV-3** | Limited impact; affects few users or non-critical paths | Same-day response; comms daily |
| **SEV-4** | Cosmetic / minor; little or no user impact | Roll into normal defect backlog |

Severity is assigned by the incident commander, not the reporter.

---

## 3. Roles during incident

- **Incident Commander (IC)** — decides; coordinates; owns the response. Not necessarily the most senior person — the one with the best view of the situation.
- **Comms Lead** — drafts internal + external messages; relays from IC to stakeholders.
- **Subject-matter experts (SMEs)** — pulled in as needed.
- **Scribe** — keeps the timeline. Often combined with Comms Lead.

For small teams, one person plays multiple roles — but the IC role is always explicit.

---

## 4. The incident channel / record

Every incident has a dedicated team-chat channel and a record. The channel captures the live conversation; the record is the canonical artefact.

```markdown
# Incident: INC-NNNN — <short title>

**Status:** Open | Resolved | Post-mortem complete
**Severity:** SEV-1 | SEV-2 | SEV-3 | SEV-4
**Started:** <timestamp>
**Acknowledged:** <timestamp>
**Resolved:** <timestamp>
**Incident Commander:** <name>
**Affected systems:** <systems>
**Affected users:** <estimate>

## Timeline
- HH:MM — Detection event
- HH:MM — Acknowledged by <name>
- HH:MM — Contained by <action>
- HH:MM — Root cause identified
- HH:MM — Fix deployed
- HH:MM — Verified resolved

## Communications log
- HH:MM — <channel> — <message summary>

## Root cause
What happened. Be precise; avoid generic blame.

## Contributing factors
Conditions that allowed this to happen — gaps in monitoring, missing runbook, time pressure, etc.

## Actions
Each with an owner and a date:
- [ ] Fix the test gap that allowed this — owner — date
- [ ] Update the standard / runbook — owner — date
- [ ] Add monitoring for the missing signal — owner — date
- [ ] ...
```

---

## 5. Communications

- **Internal:** at agreed cadence per severity. Include status, current action, next checkpoint.
- **External:** for customer-affecting incidents — status page, email to affected customers, social as appropriate. Honesty: "we know what's wrong" or "we're investigating." Don't over-promise.
- **Regulatory:** for data breaches, follow the project's compliance procedure (`infosec/compliance.md`). Notification deadlines are short (72 hours for GDPR breaches).
- **Post-resolution:** confirm to all audiences that the incident is closed and what was done.

---

## 6. Post-mortems

Every SEV-1 and SEV-2 has a post-mortem within 5 working days. Format:

```markdown
# Post-Mortem: INC-NNNN

**Date of incident:** YYYY-MM-DD
**Date of post-mortem:** YYYY-MM-DD
**Attendees:** <names>
**Severity:** SEV-N
**Duration:** <minutes>
**User impact:** <quantified where possible>

## Summary
One-paragraph summary in plain language.

## Timeline
Detailed timeline — copy from the incident record + any added detail.

## Root cause
The actual cause. Not "human error" — the conditions that enabled the human action.

## What went well
What worked in the response. Tools, procedures, decisions.

## What went poorly
What didn't work. Detection gaps, communication failures, missed escalations.

## Action items
Concrete, owned, dated. Each one closes a gap that contributed to the incident.

## Lessons
What this incident teaches that should change in standards, runbooks, or training.
```

**Blameless.** The post-mortem investigates the *system*, not the individual. "Why did Jane think this was safe to deploy?" is a system question, not a Jane question.

---

## 7. Action follow-through

Post-mortem actions are not optional. They go into the project's backlog with owners and dates. Each release retro reviews open post-mortem actions.

An incident whose actions are never delivered is an incident waiting to happen again.

---

## 8. Practice

Incident response decays without practice. For high-risk projects:

- **Game days** quarterly — simulate an incident; run the response; capture gaps.
- **Runbook dry-runs** per `operations/runbooks.md` §4.
- **On-call rotation review** at least annually.

---

## 9. Pre-implementation checklist (project-level)

```
[ ] Severity definitions agreed and shared
[ ] Incident commander role defined; who can declare an incident
[ ] Incident channel template / process documented
[ ] Comms templates ready (internal, external, regulatory)
[ ] On-call rotation in place (or named responders)
[ ] Escalation tree documented
[ ] Post-mortem template adopted
[ ] Action-item follow-through process defined
[ ] Game-day cadence decided (for high-risk projects)
```
