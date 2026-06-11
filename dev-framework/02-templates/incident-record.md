# Incident: INC-{{NNNN}} — {{SHORT_TITLE}}

> Live record of an incident. Saved as `incidents/INC-NNNN-<title>.md`. Updated as the response unfolds.

---

## Header

| | |
|---|---|
| **Status** | Open / Investigating / Mitigated / Resolved / Post-mortem complete |
| **Severity** | SEV-1 / SEV-2 / SEV-3 / SEV-4 |
| **Started** | YYYY-MM-DD HH:MM (timezone) |
| **Acknowledged** | YYYY-MM-DD HH:MM |
| **Resolved** | YYYY-MM-DD HH:MM |
| **Incident Commander** | |
| **Comms Lead** | |
| **Affected systems** | |
| **Affected users (estimate)** | |
| **Customer-facing?** | Yes / No |

---

## 1. Summary

One-paragraph plain-language summary. Updated as understanding improves.

---

## 2. Timeline

Append entries as the incident progresses. Include detection, decisions, mitigations, communications, resolution.

| Time | Event |
|------|-------|
| HH:MM | Detection: <signal> |
| HH:MM | Acknowledged by <name> |
| HH:MM | Declared as SEV-N |
| HH:MM | <containment action> |
| HH:MM | <investigation step> |
| HH:MM | <fix deployed> |
| HH:MM | Verified resolved |

---

## 3. Communications log

| Time | Channel | Audience | Message summary |
|------|---------|----------|-----------------|
| HH:MM | Internal chat | Eng + Stakeholders | "Investigating: customers seeing 500s on checkout" |
| HH:MM | Status page | Customers | "We're aware of an issue with checkout and investigating" |
| HH:MM | Internal | | "Root cause identified: queue worker config" |
| HH:MM | Status page | Customers | "Mitigated; monitoring" |
| HH:MM | Status page | Customers | "Resolved; incident report to follow" |

---

## 4. Actions during incident

What's being tried right now. Avoid the trap of "two people doing the same thing."

| Time | Action | Owner | Status |
|------|--------|-------|--------|
| | | | |

---

## 5. Working hypothesis

The current best understanding of what's happening. Update as evidence shifts.

- ...

---

## 6. Root cause (filled when known)

What actually happened. Precise; not "human error."

- ...

---

## 7. Contributing factors

Conditions that allowed this to occur:

- *(e.g. "Alert threshold was 30 mins too high — missed early warning")*
- *(e.g. "Runbook for this scenario didn't exist")*
- *(e.g. "Recent change to X didn't include a rollback step")*

---

## 8. Resolution

- **What fixed it:** ...
- **Verification:** ...
- **Time to detect (MTTD):** ...
- **Time to mitigate (MTTM):** ...
- **Time to resolve (MTTR):** ...

---

## 9. Follow-up actions (immediate)

Items to action before the post-mortem.

| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| | | | |

---

## 10. Post-mortem

| | |
|---|---|
| **Post-mortem scheduled** | YYYY-MM-DD |
| **Post-mortem record** | *(link to post-mortem.md)* |
| **Post-mortem complete** | YYYY-MM-DD |
