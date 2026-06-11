# Project Brief — {{PROJECT_NAME}}

> Fill this in once at project start. Update only when something at this level genuinely changes (rename, scope shift, ownership change). This is the project's one-page truth.
>
> Saved as `PROJECT_BRIEF.md` at the project root.

---

## 1. Project at a glance

| Field | Value |
|-------|-------|
| **Project name** | {{PROJECT_NAME}} |
| **Code name (if any)** | |
| **Primary URL / location** | {{PROJECT_DOMAIN_OR_LOCATION}} |
| **Status** | Pre-discovery / Discovery / Active / Maintenance / Sunsetting |
| **Type of work** | Web app / Mobile app / Internal tool / Content programme / Ops change / AI agent / Hybrid |
| **Start date** | YYYY-MM-DD |
| **Target launch / milestone** | YYYY-MM-DD or "ongoing" |

---

## 2. Purpose

**Problem this project solves:**
*One paragraph in user / audience / business terms — not in feature terms.*

**Audience(s):**
*Who is this for? Be specific — segments, roles, organisations.*

**Success criteria:**
*How will we know this worked? Stated as observable outcomes.*

---

## 3. Stakeholders and roles

| Role | Person | Contact | Notes |
|------|--------|---------|-------|
| Product Owner | | | |
| Delivery Lead | | | |
| Engineering Lead | | | |
| Design Lead | | | |
| QA Lead | | | |
| InfoSec | | | |
| Operations | | | |
| Compliance / Legal (if applicable) | | | |
| Primary Stakeholder(s) | | | |

For empty roles, see `dev-framework/00-lifecycle/raci.md §3` for defaults.

---

## 4. Disciplines enabled

The disciplines the project will draw on. Mark each as **on**, **off**, or **light** (used sometimes, not at every scope).

| Discipline | Status | Notes |
|------------|--------|-------|
| engineering | on / off / light | |
| ui | on / off / light | |
| ux | on / off / light | |
| qa | on / off / light | |
| uat | on / off / light | |
| infosec | **on (always)** | |
| content | on / off / light | |
| operations | on / off / light | |
| data | on / off / light | |
| _local | on / off | If yes, document the local additions |

---

## 5. Tech stack (if applicable)

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | | |
| Backend | | |
| Data store(s) | | |
| Hosting / cloud | | |
| Auth | | |
| Build / CI / CD | | |
| Observability | | |
| Other key vendors | | |

Stack-specific decisions also live as decision records under `decisions/`.

---

## 6. Non-negotiables

Project-wide rules that apply regardless of discipline. Keep this list short — anything that could be generalised belongs in a discipline standard.

- *(e.g. "All monetary values stored as integer minor units, never floats")*
- *(e.g. "No PII in repository or logs")*
- *(e.g. "Every public page has JSON-LD structured data")*

---

## 7. Companion documents

The project maintains the following companions at the project root. Each has a stable home in the repo and is updated as the project evolves.

| Companion | Purpose |
|-----------|---------|
| `ARCHITECTURE.md` | High-level architecture overview |
| `STACK.md` | Detailed stack and library choices |
| `CONVENTIONS.md` | Naming, structure, commit format |
| `DESIGN_SYSTEM.md` | Canonical UI rule book |
| `BRAND_BOOK.md` | Voice, banned phrases, samples |
| `SECURITY.md` | Disclosure policy, contacts, dependency policy |
| `DATA_INVENTORY.md` | Data assets, classification, retention |
| `RUNBOOK_INDEX.md` | Live operational runbooks |
| `ON_CALL.md` | On-call rotation, escalation |
| `SLO.md` | Service-level objectives |

Mark each as **active**, **not yet created**, or **n/a** for this project.

---

## 8. Risks and assumptions

**Top risks (max 5):**

| Risk | Impact | Likelihood | Mitigation | Owner |
|------|--------|------------|------------|-------|
| | | | | |

**Assumptions:**

- *(e.g. "Vendor X's API is stable through end of year")*

---

## 9. Out of scope

Things this project explicitly does **not** do. Critical for keeping scope honest.

- *(e.g. "No support for [region] until phase 2")*
- *(e.g. "No real-time collaboration; concurrent edits use last-write-wins")*

---

## 10. Cadence

- **Working cadence:** Sprint length / weekly review / ad-hoc / continuous
- **Release cadence:** Continuous / weekly / fortnightly / monthly / on-demand
- **Review meetings:** Type, frequency, attendees

---

## 11. Framework version

The framework is vendored at `dev-framework/`. Pin the version and re-evaluate updates deliberately.

- **Framework version in use:** 1.0
- **Last updated:** YYYY-MM-DD
- **Open framework discussions:** *(any planned changes)*

---

## 12. Change log of this brief

| Date | Change | Author |
|------|--------|--------|
| YYYY-MM-DD | Initial draft | |
