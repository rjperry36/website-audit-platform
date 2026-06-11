---
description: The quality gates between phases — what must be true before work advances
last_reviewed: 2026-05-18
review_cadence_days: 180
---

# Quality Gates

A gate is the moment at which work cannot advance until something is observably true. Gates are mandatory but lightweight — most take minutes, not days.

A gate has two outputs: **pass** (advance to the next phase) or **fail** (return to the current phase with specific remediation). "Pass with comment" is not a state — comments are remediation, and they belong in the current phase.

---

## G1 — Framed (exit of Phase 1)

**Required to pass:**

- [ ] One-paragraph problem statement written in the scope file
- [ ] Success criteria stated in **outcome** terms, not delivery terms
- [ ] Hard constraints listed (deadline, budget, technical, regulatory, brand)
- [ ] Stakeholders and decision-makers named
- [ ] Initial risks and unknowns captured

**Approved by:** the work's owner. For high-risk work, also the relevant stakeholder.

---

## G2 — Planned (exit of Phase 2)

**Required to pass:**

- [ ] Goal stated in one sentence
- [ ] Plan written: exact files, functions, tests, decisions, deliverables
- [ ] Alternatives considered and recorded — not just the chosen approach
- [ ] Disciplines this work touches are listed in the scope
- [ ] All `CONFIRM:` questions resolved or escalated to a decision record
- [ ] Rough cost / time / risk estimate captured
- [ ] If any cross-cutting decision was made, a decision record is open

**Approved by:** the work's reviewer (peer, lead, or delegator).

**Failure mode:** the plan references hypothetical paths or unresolved assumptions. Return to Phase 2 to resolve.

---

## G3 — Standards Read (exit of Phase 3)

**Required to pass:**

- [ ] Every standards file listed in the scope's "Standards Applied" section has been read
- [ ] Any planned deviation from a standard is recorded in the scope with a reason
- [ ] If a standard is missing a rule the scope needs, the gap is logged (becomes a follow-up to upstream into the standard later)

**Approved by:** the work's reviewer.

**Failure mode:** a standard was missed and Phase 4 begins. The cost surfaces in Phase 5 (or worse, in production).

---

## G4 — Built (exit of Phase 4)

**Required to pass:**

- [ ] The deliverable exists and matches the Plan
- [ ] Any deviation from the Plan is recorded in the scope with a reason
- [ ] In-flight checks have been run (type-check, lint, visual review, etc. — per discipline `_index.md`)
- [ ] No `CONFIRM:` is open
- [ ] No "I'll come back to this" placeholders left in code or copy unless explicitly logged

**Approved by:** the work's owner (self-attestation) before review.

**Failure mode:** work is "almost done." Return to Phase 4 — there is no half-built state in this framework.

---

## G5 — Verified (exit of Phase 5)

**Required to pass:**

- [ ] Every discipline's verification checklist (in `01-disciplines/<discipline>/_index.md`) is green for the disciplines the scope listed
- [ ] All P1 and P2 defects resolved
- [ ] Any explicit exception is recorded with rationale and (where relevant) a follow-up scope or remediation date
- [ ] Stakeholder sign-off recorded if the work touches UAT or production

**Approved by:** the relevant discipline lead(s). For production-affecting work, the change advisory or equivalent.

**Failure mode:** a checklist item is amber/red and there's no explicit exception. Return to Phase 4 (fix) or Phase 5 (test more).

---

## G6 — Landed (exit of Phase 6)

**Required to pass:**

- [ ] Work is deployed / published / released / handed off
- [ ] Scope file is versioned (`.v1.md` etc.) and marked `Status: Live`
- [ ] All decisions made during the work are captured — either in the scope's `Decision Log` (in-scope) or as standalone decision records (cross-cutting)
- [ ] Follow-up work logged in the scope's "Roadmap / Known Limitations"
- [ ] Production runbook(s) updated if operational behaviour changed
- [ ] Communications sent (release notes, stakeholder update, retro item, etc.) per the project's conventions

**Approved by:** the work's owner.

**Failure mode:** work shipped but the record is incomplete. Return to Phase 6 — landing is not optional.

---

## Gate cadence

For a typical 5-day piece of work:

| Day | Gates triggered |
|-----|-----------------|
| 1 (AM) | G1 |
| 1 (PM) | G2 |
| 2 (AM) | G3 |
| 2 (PM) → 4 | G4 happens incrementally; final G4 at end of day 4 |
| 5 (AM) | G5 |
| 5 (PM) | G6 |

For a one-hour piece of work, all six gates may collapse into a single 10-minute review. The gates exist; their ceremony scales.

---

## Recording gate outcomes

For non-trivial work, the scope file's footer includes:

```markdown
## Gate log
| Gate | Date | Pass/Fail | Reviewer | Notes |
|------|------|-----------|----------|-------|
| G1   |      |           |          |       |
| G2   |      |           |          |       |
| G3   |      |           |          |       |
| G4   |      |           |          |       |
| G5   |      |           |          |       |
| G6   |      |           |          |       |
```

This becomes the audit trail. For trivial work, the gate log can be skipped — but the gate **decisions** still happen.

---

## The "no surprise gate" principle

A gate review should never produce a surprise. If something fails at G5 that would have failed at G3, the framework has failed. The remediation is to strengthen Phase 3, not to add another late gate.

Use gate failures as signals for where the lifecycle itself needs tightening — usually upstream of the failure.
