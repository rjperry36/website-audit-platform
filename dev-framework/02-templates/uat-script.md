# UAT Script — {{SCOPE_NAME}}

> The structured script run with the actual audience to confirm acceptance. Saved as `uat/<feature>-uat.md`.

---

## Header

| | |
|---|---|
| **Scope** | *(link to the scope)* |
| **UAT Facilitator** | |
| **UAT Participants** | *(names / roles)* |
| **Date(s) of UAT session(s)** | |
| **Build / version under test** | |
| **Environment** | *(URL, credentials info — store credentials elsewhere)* |

---

## 1. Purpose

UAT confirms the work meets the actual need, not just the specification. The audience drives the session; the facilitator observes.

---

## 2. Acceptance criteria

From the scope's Frame section.

| # | Criterion | Pass / Fail / Partial | Notes |
|---|-----------|------------------------|-------|
| 1 | | | |
| 2 | | | |

---

## 3. Pre-session setup

Facilitator confirms before the session begins:

- [ ] Environment is up and production-like
- [ ] Test accounts are provisioned and credentials shared securely with participants
- [ ] Seed data realistic to the participant's context
- [ ] Recording set up (with consent)
- [ ] Note-taker assigned
- [ ] Session length stated (≤ 90 minutes per participant)
- [ ] Defects above P3 are resolved
- [ ] Participant briefed on session format ("we're observing, not testing you")

---

## 4. Tasks

Tasks reflect real-world usage, not edge-case engineering tests. Use the participant's own language. Don't pre-narrate the steps.

### Task 1 — {{TASK_TITLE}}

**You are about to:** *(one-sentence framing of the task in the user's terms)*

**The participant should:** *(what they need to do — without prescribing how)*

**Expected outcome:** *(what success looks like)*

**Observation notes (filled live):**

- ...

**Result:** Pass / Fail / Partial

---

### Task 2 — {{TASK_TITLE}}

*(repeat structure)*

---

### Task 3 — {{TASK_TITLE}}

*(repeat structure)*

---

## 5. Open feedback

After tasks, ask the participant:

- "What did you expect that didn't happen?"
- "What confused you or felt unclear?"
- "What did you want to do that you couldn't?"
- "How does this compare to what you do today?"

Capture verbatim where possible.

---

## 6. Defects raised

| DEF-ID | Title | Severity | Owner |
|--------|-------|----------|-------|
| | | | |

---

## 7. Outcome

- [ ] **Accept** — work is signed off as-is.
- [ ] **Accept with conditions** — sign-off conditional on the named follow-ups below.
- [ ] **Reject** — work needs further iteration before re-test.

### Conditions (if conditional accept)

| Condition | Owner | Date |
|-----------|-------|------|
| | | |

### Reason for rejection (if rejected)

- ...

---

## 8. Sign-off

| Role | Signatory | Date | Version signed off |
|------|-----------|------|--------------------|
| Product Owner | | | |
| Stakeholder | | | |
| (if applicable) Compliance | | | |

---

## 9. Post-session

- [ ] Defects logged with severity (see `01-disciplines/qa/defect-management.md`)
- [ ] Sign-off section in the scope file updated
- [ ] Follow-up scopes opened for any conditions
- [ ] Session recording archived per retention policy
