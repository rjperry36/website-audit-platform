# Definition of Done — {{PROJECT_NAME}}

> Adopted at project start by the whole team. Saved as `DEFINITION_OF_DONE.md` at project root.
>
> This is the project's local interpretation of the framework's gates. It captures what "done" means for **this** project's work. Disciplines disabled on this project can have their lines removed; project-specific items can be added.

---

## A scope is "done" when:

### Gate G5 — Verified

**Engineering (if enabled)**

- [ ] Type check passes with zero errors
- [ ] Linter clean
- [ ] Unit tests pass with no skipped / focused tests
- [ ] Integration tests pass against the appropriate environment
- [ ] No HIGH/CRITICAL dependency vulnerabilities

**UI (if enabled)**

- [ ] Design system audit clean
- [ ] All component states present (default, hover, focus, active, disabled, loading, error)
- [ ] Responsive verified at each project-defined breakpoint
- [ ] Dark mode verified (if supported)

**UX (if enabled)**

- [ ] WCAG 2.1 AA accessibility audit clean
- [ ] Keyboard-only pass complete
- [ ] Loading / error / empty states present and tested
- [ ] Mobile experience tested on actual device

**QA (if enabled)**

- [ ] Test plan executed in full
- [ ] All P1 / P2 defects resolved or explicitly accepted
- [ ] Coverage targets met

**UAT (if enabled)**

- [ ] UAT script executed by the named stakeholder
- [ ] Acceptance criteria all passed or partial with rationale
- [ ] Sign-off recorded (signature, date, version)

**InfoSec (always)**

- [ ] Security baseline checklist green
- [ ] Threat model updated if attack surface changed
- [ ] Secret scan clean; no PII in logs
- [ ] Dependency audit clean of HIGH/CRITICAL

**Content (if enabled)**

- [ ] Brand voice review complete
- [ ] SEO checklist green for public surfaces
- [ ] Fact-check / source-cite where relevant
- [ ] Legal / compliance review where regulated

**Operations (if enabled)**

- [ ] Change record signed off (where production-affecting)
- [ ] Rollback plan documented and tested
- [ ] Monitoring + alerts in place
- [ ] Runbook(s) updated

**Data (if enabled)**

- [ ] Schema review complete; foreign keys / indexes correct
- [ ] Data inventory updated
- [ ] Retention period set and enforced
- [ ] Access list reviewed (least-privilege)

### Gate G6 — Landed

- [ ] Work shipped (deployed / published / released / handed off)
- [ ] Scope file versioned (`.v1.md`) and marked `Status: Live`
- [ ] Decision records written for any cross-cutting decisions
- [ ] `TODO.md` updated with completion date and scope link
- [ ] Follow-up scopes logged in the scope's "Roadmap / Known Limitations"
- [ ] Release communications sent per project's comms plan
- [ ] Production runbook(s) updated if operational behaviour changed

---

## Project-specific additions

Anything specific to this project that isn't already in the framework. Keep this list short.

- *(e.g. "All currency displayed includes the currency code, never just the symbol")*
- *(e.g. "All emails to customers include the unsubscribe footer block")*

---

## How this list evolves

- **Adding an item:** added when a gap caused a regression or missed expectation.
- **Removing an item:** removed when consistently passed without thought (it's now culture, not checklist).
- **Reviewed at every release retro.**

---

## Source

The framework canonical gate list lives in `dev-framework/00-lifecycle/gates.md`. This file is the project's specialisation of it.
