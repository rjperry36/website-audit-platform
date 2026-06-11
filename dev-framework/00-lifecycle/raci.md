---
description: RACI by lifecycle phase, by role — who is Responsible, Accountable, Consulted, Informed
last_reviewed: 2026-05-18
review_cadence_days: 180
---

# RACI

Roles are described in role terms, not job titles. On any given project the same person may wear multiple hats. The framework does not assume team size — a one-person team plays every role; a large team distributes them.

For each phase, **exactly one** role is Accountable (owns the outcome and is the single throat-to-choke). Multiple roles can be Responsible (do the work). Consulted are those whose input is mandatory; Informed are those who need to know but don't gate.

---

## Roles

| Role | Description |
|------|-------------|
| **Product Owner (PO)** | Owns *why* the work exists; sets priorities; resolves trade-offs between scope, time, and cost. |
| **Delivery Lead (DL)** | Owns *how* the work is run; manages the lifecycle; resolves blockers; enforces gates. |
| **Engineer (ENG)** | Builds the technical solution. May be split into Lead Engineer + Engineer for larger teams. |
| **Designer (DES)** | Owns UI and visual decisions. Often paired with UX Researcher (UXR). |
| **UX Researcher (UXR)** | Owns user understanding; runs research; produces evidence for design decisions. |
| **QA (QA)** | Owns test strategy and execution; runs automation; manages defects. |
| **UAT Lead (UAT)** | Owns stakeholder/customer acceptance — usually a business or operations representative. |
| **InfoSec (SEC)** | Owns security posture, threat modelling, and security verification. |
| **Operations (OPS)** | Owns running services, deployments, incident response, runbooks. |
| **Data (DATA)** | Owns data models, data quality, data governance. |
| **Content (CTNT)** | Owns copy, brand voice, content strategy. |
| **Stakeholder (STAKE)** | Anyone affected by the work — internal, customer, vendor, legal, finance. |

---

## RACI by phase

Legend: **R** = Responsible (does the work), **A** = Accountable (owns the outcome), **C** = Consulted, **I** = Informed.

### Phase 1 — Frame

| Activity | PO | DL | ENG | DES | UXR | QA | UAT | SEC | OPS | DATA | CTNT | STAKE |
|----------|----|----|-----|-----|-----|----|-----|-----|-----|------|------|-------|
| Problem statement | **A** | R | C | C | C | I | C | C | I | C | C | C |
| Success criteria | **A** | R | C | C | C | C | C | C | I | C | C | C |
| Constraints + risks | C | **A** | R | R | R | R | R | R | R | R | R | C |
| Stakeholder map | R | **A** | I | I | I | I | I | I | I | I | I | C |

### Phase 2 — Plan

| Activity | PO | DL | ENG | DES | UXR | QA | UAT | SEC | OPS | DATA | CTNT | STAKE |
|----------|----|----|-----|-----|-----|----|-----|-----|-----|------|------|-------|
| Choose approach | C | **A** | R | R | C | C | C | C | C | C | C | I |
| Write the Plan | I | C | R | R | C | R | C | C | C | C | R | I |
| List disciplines that apply | I | **A** | R | R | C | R | R | R | R | R | R | I |
| Resolve `CONFIRM:` | R | **A** | R | R | R | R | R | R | R | R | R | C |
| Open decision records | C | **A** | R | R | C | C | C | R | C | C | C | I |

### Phase 3 — Standards Check

| Activity | PO | DL | ENG | DES | UXR | QA | UAT | SEC | OPS | DATA | CTNT | STAKE |
|----------|----|----|-----|-----|-----|----|-----|-----|-----|------|------|-------|
| Read applicable standards | I | C | R | R | R | R | R | R | R | R | R | – |
| Record planned deviations | C | **A** | R | R | R | R | R | R | R | R | R | I |

### Phase 4 — Execute

| Activity | PO | DL | ENG | DES | UXR | QA | UAT | SEC | OPS | DATA | CTNT | STAKE |
|----------|----|----|-----|-----|-----|----|-----|-----|-----|------|------|-------|
| Build / create | I | **A** | R | R | C | C | – | C | C | R | R | I |
| In-flight checks | – | C | R | R | C | R | – | C | C | R | R | – |
| Stop on surprise + report | I | **A** | R | R | R | R | – | R | R | R | R | I |

### Phase 5 — Verify

| Activity | PO | DL | ENG | DES | UXR | QA | UAT | SEC | OPS | DATA | CTNT | STAKE |
|----------|----|----|-----|-----|-----|----|-----|-----|-----|------|------|-------|
| Functional + non-functional QA | C | C | C | C | C | **A**/R | C | C | C | C | C | I |
| Accessibility audit | I | I | C | C | **A**/R | R | I | I | I | I | I | I |
| Visual / design QA | I | I | C | **A**/R | C | R | I | I | I | I | I | I |
| Security verification | I | C | C | I | I | C | I | **A**/R | C | C | I | I |
| UAT execution + sign-off | C | C | I | I | I | C | **A**/R | C | C | I | C | R |
| Content / brand review | C | C | I | C | I | C | C | I | I | I | **A**/R | I |
| Ops readiness (runbook, monitoring) | I | C | C | I | I | C | I | C | **A**/R | C | I | I |
| Data review | I | C | C | I | I | C | I | C | C | **A**/R | I | I |

### Phase 6 — Land

| Activity | PO | DL | ENG | DES | UXR | QA | UAT | SEC | OPS | DATA | CTNT | STAKE |
|----------|----|----|-----|-----|-----|----|-----|-----|-----|------|------|-------|
| Release / publish / hand off | C | **A** | R | R | I | C | C | C | R | C | R | I |
| Version the scope | I | **A** | R | R | I | I | I | I | I | I | R | – |
| Write decision records | C | C | R | R | C | C | C | R | C | C | C | I |
| Update runbooks | I | C | C | I | I | I | I | C | **A**/R | C | I | I |
| Communications | R | **A** | I | I | I | I | I | I | I | I | R | C |

---

## When a role is empty on a project

For smaller teams, several roles collapse into one person. The framework does not change — the RACI rows still exist; one person holds multiple letters.

| Empty role | Defaults to |
|------------|-------------|
| No PO | DL plays PO until a PO is named (and the lack-of-PO is logged as a risk in the project brief) |
| No QA | ENG is QA for unit/integration; an external reviewer is QA for acceptance |
| No UAT Lead | PO or STAKE plays UAT |
| No InfoSec | ENG + DL play InfoSec **and** a sign-off from a named external InfoSec reviewer is mandatory for production-affecting work |
| No Operations | ENG plays Operations and the on-call rotation goes to ENG by default |
| No Data | ENG plays Data |
| No Content | DES + PO play Content |

The point of naming these defaults is to make the gap visible — not to hide it.

---

## Anti-patterns

- **Two Accountables.** "We're both accountable" means neither is. Pick one.
- **No Consulted.** A discipline lead should *always* be at least Consulted for their domain in Phase 5, even if another role is Responsible.
- **Stakeholder as Accountable.** Stakeholders are Consulted or Informed. Accountability sits with the delivery team.
- **RACI written once, never re-read.** Re-check at each gate. Roles shift across phases.
