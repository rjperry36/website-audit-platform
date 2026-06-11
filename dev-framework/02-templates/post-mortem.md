# Post-Mortem: INC-{{NNNN}}

> Blameless review of a SEV-1 or SEV-2 incident. Conducted within 5 working days of resolution.

---

## Header

| | |
|---|---|
| **Date of incident** | YYYY-MM-DD |
| **Date of post-mortem** | YYYY-MM-DD |
| **Attendees** | |
| **Severity** | SEV-N |
| **Duration** | N minutes |
| **User impact** | *(quantified where possible — number of users, requests, revenue)* |
| **Customer-facing?** | Yes / No |
| **Linked incident record** | *(INC-NNNN)* |

---

## 1. Summary

One-paragraph plain-language summary. Suitable for sharing with stakeholders.

---

## 2. Timeline

Copy from the incident record. Add any extra detail from logs / chats that wasn't captured live.

| Time | Event |
|------|-------|
| | |

---

## 3. Root cause

The actual cause. Precise. Avoid "human error" — humans operate in systems; describe the system condition.

- **Immediate cause:** What triggered the failure.
- **Underlying cause:** What allowed this to ship / persist.

---

## 4. Contributing factors

Conditions that combined to cause or worsen the incident. Examples:

- Monitoring gap (signal that would have surfaced this earlier)
- Tooling gap (rollback would have been faster if X existed)
- Knowledge gap (the on-call didn't know about Y)
- Documentation gap (the runbook for this case didn't exist or was stale)
- Time pressure (a deadline made the team skip a step)
- Process gap (the standard or gate didn't catch it)

---

## 5. What went well

What worked in the response. Be specific; these are patterns to keep.

- ...

---

## 6. What went poorly

What didn't work. Specific. Not personal — systemic.

- ...

---

## 7. Where we got lucky

Things that could have been worse but weren't, by chance. Important to capture — luck isn't a strategy.

- ...

---

## 8. Lessons

What this incident teaches that should change in standards, runbooks, training, or tooling.

- ...

---

## 9. Action items

Concrete, owned, dated. Each closes a gap that contributed to the incident.

| # | Action | Owner | Due | Priority |
|---|--------|-------|-----|----------|
| 1 | | | | P1 / P2 / P3 |
| 2 | | | | |
| 3 | | | | |

**Where these live:** linked to the project backlog. Reviewed at each release retro until closed.

---

## 10. Communications

- **Internal:** Has the team been told what happened and what changes? Yes / No.
- **External:** Was a public statement issued? Link.
- **Regulatory:** Was a breach notification required? If so, status.

---

## 11. Sign-off

| Role | Signatory | Date |
|------|-----------|------|
| Incident Commander | | |
| Engineering Lead | | |
| (if applicable) InfoSec | | |
| (if applicable) Product Owner | | |
