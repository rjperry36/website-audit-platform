# Handover — {{FROM}} → {{TO}}

> Used for person handovers (someone leaving), team handovers (project moves between teams), and vendor handovers (engagement closes).
> Saved as `handovers/<from>-to-<to>-<date>.md`.

---

## Header

| | |
|---|---|
| **From** | *(name / team / vendor)* |
| **To** | *(name / team)* |
| **Type** | Person leaving / Person joining / Team handover / Vendor handover |
| **Effective date** | YYYY-MM-DD |
| **Period covered by this handover** | |

---

## 1. State of play (one paragraph)

Where things are right now. The state someone would need to brief themselves on cold.

---

## 2. Active work

Current scopes and their status.

| Scope | Phase | Owner (going forward) | Open items |
|-------|-------|------------------------|------------|
| | 1–6 | | |

---

## 3. Outstanding decisions

Decisions in flight (drafts, proposals not yet accepted).

| Decision | Status | Next step | Owner |
|----------|--------|-----------|-------|
| DR-NNNN | Proposed | Stakeholder review | |

---

## 4. Known issues

Open defects, incident follow-ups, technical debt the new owner needs to know about.

| Item | Severity | Why deferred | Action plan |
|------|----------|--------------|-------------|
| | | | |

---

## 5. Access

What the incoming owner needs to be granted (and what should be revoked from the outgoing).

| System | Granted to | Revoked from | Date |
|--------|------------|--------------|------|

---

## 6. Tribal knowledge

The things that aren't in a doc but should be. Conventions, traps, vendor quirks, relationship context.

- *(e.g. "Vendor X always misses Friday tickets — escalate Wednesday at the latest")*
- *(e.g. "The seemingly-redundant cron at 03:15 exists because it works around vendor Y's overnight maintenance")*
- *(e.g. "Stakeholder Z prefers a direct chat message over email for ad-hoc questions")*

---

## 7. Contacts

| Role | Person | Reachable how |
|------|--------|---------------|
| Product Owner | | |
| Stakeholder | | |
| Vendor contact | | |
| On-call | | |
| Compliance / legal | | |

---

## 8. Recurring commitments

Meetings, reports, recurring tasks the new owner inherits.

| Cadence | Commitment | Notes |
|---------|------------|-------|
| Weekly | | |
| Monthly | | |
| Quarterly | | |

---

## 9. Sign-off

| Role | Signatory | Date |
|------|-----------|------|
| Handing over | | |
| Receiving | | |
| Witness / manager | | |

---

## 10. Follow-up

After the handover:

- [ ] Knowledge transfer sessions scheduled (if needed)
- [ ] Outgoing person available for questions for N days
- [ ] Access removed on agreed date
- [ ] This handover document filed in `handovers/`
