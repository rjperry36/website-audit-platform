# Scope: {{SCOPE_NAME}}

> A scope is one `.md` file under `scopes/` capturing a single piece of work from Frame to Land. It is simultaneously a brief, a spec, and a post-launch record. The file evolves through the lifecycle phases.
>
> Versioning: `feature.md` (draft) → `feature.v0.md` (mocked / pre-launch) → `feature.v1.md` (live) → `feature.v2.md` (substantially evolved).
> Old versions are not deleted — they are the audit trail.

---

## Header

| | |
|---|---|
| **Version** | v0 / v1 / v2 |
| **Status** | Draft / In progress / Live / Archived |
| **Owner** | |
| **Disciplines** | *(comma-separated — e.g. engineering, ui, ux, qa, infosec)* |
| **Created** | YYYY-MM-DD |
| **Last updated** | YYYY-MM-DD |
| **Related scopes** | *(list any)* |
| **Related decision records** | *(list any DR-NNNN)* |

---

## 1. Frame

**Problem:**
*One paragraph in user / audience / business terms.*

**Success criteria:**
*Observable outcomes — not "ship the feature."*

**Constraints:**
- Deadlines, budget, regulatory, brand, technical.

**Stakeholders:**
- Named individuals or roles.

**Initial risks and unknowns:**
- ...

---

## 2. Plan

**Approach:**
*The proposed approach. Specific.*

**Alternatives considered:**
- **Alternative 1** — description; why rejected.
- **Alternative 2** — description; why rejected.

**Disciplines this scope will draw on:**
- *(list each + a one-line note on which standards inside it apply)*

**Cost / time / risk estimate:**
*Rough — refined as planning continues.*

**`CONFIRM:` open questions:**
*(STOP here if any of these are unresolved. Resolve before Phase 3.)*

- CONFIRM: ...

---

## 3. Standards Applied

The specific standards files this scope respects.

| Discipline | Standard | How it applies | Planned deviation? |
|------------|----------|----------------|---------------------|
| | | | |

**Deviations from standards (and why):**

- *(e.g. "We're not enforcing rate limits on the internal-only endpoint because access is already privileged — recorded in DR-NNNN")*

---

## 4. Architecture / Approach

The actual design at the level of detail an implementer needs.

- **Engineering:** files affected, data model changes, API contracts, environment variables.
- **UI/UX:** screens / flows; component reuse; new patterns proposed; accessibility considerations.
- **Content:** structure, channels, schedule, voice calls.
- **Ops:** steps, approvals, rollback plan, change window.
- **Data:** schema changes, retention, classification.

---

## 5. Environment / Dependencies

New env vars, vendor accounts, libraries, integrations. What needs to be in place before execution.

- ...

---

## 6. Verification

Filled in during Phase 5. Use the checklists from the discipline standards this scope referenced.

### Discipline checklists

For each discipline this scope draws on, list the checklist result.

- [ ] **engineering** — see `01-disciplines/engineering/_index.md` — pass / fail / partial
- [ ] **ui** — see ...
- [ ] **ux** — see ...
- [ ] **qa** — test plan executed; all P1/P2 resolved
- [ ] **uat** — sign-off recorded (see §10)
- [ ] **infosec** — security baseline checklist green
- [ ] **content** — ...
- [ ] **operations** — change record signed; runbook updated
- [ ] **data** — inventory updated; retention enforced

### Open issues

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| | | P1/P2/P3/P4 | Open / Resolved / Accepted |

---

## 7. Roadmap / Known Limitations

What's deliberately out of scope. What's deferred. Known caveats.

- ...

---

## 8. Decision Log

In-scope decisions made during the work. Cross-cutting decisions go to `decisions/` instead.

- **YYYY-MM-DD** — Decided X because Y. Alternatives considered: Z. (link to relevant standard or evidence)

---

## 9. Gate Log

| Gate | Date | Pass / Fail | Reviewer | Notes |
|------|------|-------------|----------|-------|
| G1 — Framed | | | | |
| G2 — Planned | | | | |
| G3 — Standards Read | | | | |
| G4 — Built | | | | |
| G5 — Verified | | | | |
| G6 — Landed | | | | |

---

## 10. Sign-Off (if UAT applies)

| Role | Signatory | Date | Version signed off | Notes |
|------|-----------|------|--------------------|-------|
| | | | | |

**Acceptance criteria — final status:**

| Criterion | Met? | Notes |
|-----------|------|-------|
| | Yes / No / Partial | |

**Known limitations accepted:**

- ...

**Follow-up scopes committed:**

- ...
