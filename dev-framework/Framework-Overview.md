# The Dev Framework — Overview

> A drop-in, project-agnostic process for delivering digital work
> *Coding · UI · UX · QA · UAT · InfoSec · Content · Operations · Data*

**Version:** 1.0
**Status:** Active
**Companion to:** the markdown drop-in in the `dev-framework/` folder

> **Convert to Word:** `pandoc Framework-Overview.md -o Framework-Overview.docx --toc`
> **Convert to PDF:** `pandoc Framework-Overview.md -o Framework-Overview.pdf --toc`

---

## Contents

1. What this framework is
2. The universal lifecycle
3. The disciplines
4. RACI — who does what
5. Templates — the project-specific layer
6. How to adopt this framework
7. The framework at a glance

---

## 1. What this framework is

A single, opinionated, project-agnostic way of delivering digital work to a consistent standard across the disciplines that matter: coding, UI, UX, QA, UAT, security, content, operations, and data.

It is opinionated about *how* work moves through a project (phases, gates, decision records) and opinionated about *what good looks like* within each discipline (checklists, standards, templates). It is deliberately silent about the content of any one project — the bits that vary live in templates you fill in once at the start.

### Why a framework, not a methodology

Without a shared framework, teams drift to the lowest common denominator and lose three things at once:

- **Consistency.** The same problem gets solved three different ways across three projects.
- **Compounding learning.** Each project rediscovers the same gotchas — security misses, accessibility regressions, missed UAT scenarios.
- **Audit readiness.** When work is shipped, it is hard to point to *the* decision, *the* test plan, *the* threat model — because none of them follow a stable shape.

The framework fixes all three with one tool: a small set of stable surfaces (lifecycle, gates, templates) and a modular library of standards behind them. It is methodology-agnostic — it slots into Scrum, Kanban, Waterfall, or no methodology at all.

### Three layers, separated on purpose

| Layer | Purpose | Where it lives in the drop-in |
|-------|---------|-------------------------------|
| **Orchestration** | Tells everyone (humans and agents) what phase the work is in, what to read, and what to produce. | `00-lifecycle/` and optional `CLAUDE.md.template` |
| **Standards** | The actual rules per discipline — what good looks like. | `01-disciplines/` |
| **Records** | What was scoped, decided, tested, signed off, shipped. | `02-templates/` populated into the project as `scopes/`, `decisions/`, `runbooks/`, etc. |

Each layer changes at a different rate. Orchestration is stable. Standards evolve with industry practice. Records change continuously. Keeping them separated means a change at one layer does not ripple through the others.

---

## 2. The universal lifecycle

Every piece of work — a feature, a campaign, a bug fix, a vendor migration, a content drop, a security remediation — passes through six phases. The phases are universal. What you *do* inside each phase depends on which disciplines the project has enabled and which standards the scope says apply.

| Phase | Goal | Output |
|-------|------|--------|
| **1. Frame** | Understand the problem, success criteria, constraints. | Opening of a scope file under `scopes/`. |
| **2. Plan** | Choose an approach; weigh alternatives; list disciplines that apply. | Plan + Approach sections populated; any cross-cutting decision opens a decision record. |
| **3. Standards** | Read the rules that apply before doing the work. | Standards Applied + planned-deviations sections. |
| **4. Execute** | Do the work. One step at a time. Stop on surprise; do not improvise. | The actual deliverable + scope updated to reflect what was built. |
| **5. Verify** | Run the checks each discipline requires. | Green-light checklist in the scope. |
| **6. Land** | Ship; version the scope; record decisions; close the loop. | A versioned, referenceable record of the work. |

The phases are short by design. Detailed engineering 10-step strategies, content editorial cycles, or change-management boards are **specialisations** layered on top of these six phases — not replacements.

### The Goal–Plan–Act engine (runs inside Plan + Execute)

Inside Phase 2 and Phase 4, every contributor — human or agent — uses a tight three-step engine:

| Step | Output | Stop rule |
|------|--------|-----------|
| **Goal** | One-sentence statement of intent plus assumptions. | If you cannot state the goal in one sentence, you are not ready to plan. |
| **Plan** | Exact files, functions, tests, decisions — not hypothetical ones. | Any `CONFIRM:` question is a hard stop. Resolve before Act. |
| **Act** | Sequential execution of the plan, one step at a time. | If reality diverges from the plan, stop and report. Do not improvise. |

This engine is the framework's anti-hallucination, anti-scope-creep firewall. It applies equally to a junior developer, a senior architect, and an AI agent. The `CONFIRM:` stop rule is the single most important rule in the framework — guessing is never acceptable.

### Quality gates

Gates between phases are the moments at which work cannot advance until something is true. They scale with risk — a trivial change has 10-minute gates; a production migration has 2-day gates. The shape stays the same.

| Gate | At end of | Required to pass |
|------|-----------|------------------|
| **G1 — Framed** | Frame | Problem, success criteria, constraints written down. |
| **G2 — Planned** | Plan | Approach chosen; alternatives considered; standards listed; no open `CONFIRM:`. |
| **G3 — Standards Read** | Standards | All listed standards consulted; planned deviations documented. |
| **G4 — Built** | Execute | The deliverable exists and matches the plan; in-flight checks run. |
| **G5 — Verified** | Verify | Every discipline's verification checklist is green or has an explicit, recorded exception. |
| **G6 — Landed** | Land | Shipped; scope versioned; decisions recorded; follow-ups logged. |

---

## 3. The disciplines

Standards are organised into disciplines. A project enables only the ones it needs. InfoSec is always on; the others are toggled.

| Discipline | When to enable | Headline standards |
|------------|---------------|--------------------|
| `engineering` | Any code project — web, API, scripts, agents, automations. | Coding standards · API design · error handling · performance · code review. |
| `ui` | Anything with a visual interface — websites, apps, decks, dashboards. | Design-system discipline · visual standards · frontend implementation. |
| `ux` | Anything affecting how users interact. | UX process · user research · interaction design · accessibility (WCAG 2.1 AA). |
| `qa` | Anything that needs testing (most things). | Test strategy · automation · defect management. |
| `uat` | Anything with a customer / business acceptance step. | UAT process · sign-off. |
| `infosec` | **Always on.** Security is non-negotiable. | Security baseline · secure coding · threat modelling · compliance. |
| `content` | Anything producing copy — landing pages, articles, emails, social. | Brand voice · SEO · content strategy. |
| `operations` | Anything that runs in production — deployments, migrations, incidents. | Runbooks · change management · CI/CD · incident management. |
| `data` | Anything touching data models, pipelines, governed datasets. | Data modelling · data governance. |

### Engineering

Framework-agnostic engineering standards covering the day-to-day practice of writing code that lasts.

- **Coding standards** — types at the boundary, no escape hatches, pure functions where possible, side effects at the edges, banned patterns (dead code, magic numbers, deep nesting, long functions).
- **API design** — one consistent response shape, correct status codes, server-side input validation, rate limiting on every public endpoint, no `SELECT *`, webhooks idempotent and signed.
- **Error handling** — loading / error / empty states on every user-facing surface, server handlers return typed results not throws, generic errors to the client with correlation IDs.
- **Performance** — Core Web Vitals targets, server vs client rendering, deliberate caching with on-demand invalidation, deferred third-party scripts, indexed query columns.
- **Code review** — a structured checklist, severity-1 stoppers (secrets, auth bypass, injection, data-loss paths), feedback rules (lead with what works, separate must-fix from suggestion).

### UI

How visual artefacts are produced against a design system, with rigour about reuse versus invention.

- **Design-system discipline** — three legitimate paths only: use what exists; propose a new pattern (and document it); one-off variant with a recorded exception. No fourth, silent path.
- **Visual standards** — a type scale, semantic colour tokens, spacing scale, full state set per interactive component (default, hover, focus, active, disabled, loading, error), restrained motion.
- **Frontend implementation** — use design-system tokens before raw utilities, canonical patterns for search bars / modals / expand-collapse, no raw `<img>`, polite pushback on system violations.

### UX

UX is a perspective that runs through every phase, with specific deliverables at each.

- **UX process** — fidelity matches phase, edge-case enumeration (empty / error / loading / long / permissions / concurrency / multi-device / accessibility), microcopy as a UX deliverable, structured design handoff.
- **User research** — generative vs evaluative, sample sizes that fit the claim, recruitment from real users, observe tasks not opinions, write findings into scopes and decision records.
- **Interaction design** — the interaction loop (intent → action → feedback → result), affordances at rest, 44 px touch targets, feedback timing tiers, forms that don't lose data on error, action-oriented microcopy.
- **Accessibility (WCAG 2.1 AA)** — semantic HTML, labels associated, keyboard reachable with visible focus, contrast 4.5:1, reduced-motion respected, screen-reader sanity check before launch.

### QA

Confidence that the critical paths cannot break silently — not 100% line coverage.

- **Test strategy** — focus on user-facing failures, security, data corruption, regulated exposure. The testing pyramid in practice: static + unit + integration + E2E + non-functional (performance, accessibility, security, visual regression).
- **Automation** — fast, deterministic, focused, readable. Tests next to the code, the four-case API pattern (valid / invalid / unauthorised / rate-limited), mocks at boundaries, flake management.
- **Defect management** — a standard defect record shape, severity assigned at triage (not by reporter), root-cause and prevention recorded on every closed P1/P2, "won't fix" as a legitimate outcome with rationale.

### UAT

Customer / stakeholder acceptance — **separate from QA**. QA confirms the work meets its specification; UAT confirms the work meets the actual need. Both can pass and the work can still be wrong if the spec was wrong.

- **UAT process** — run by the real audience (not internal proxies); production-like environment; tasks framed in user terms; observe, don't lead; defects captured live with severity.
- **Sign-off** — formal record per scope. Two-roles rule: one person never signs in two roles. Conditional and phased sign-offs allowed; vague conditions are not.

### InfoSec

Always on. Three layers: a security baseline applied at every phase, a threat model maintained per feature, compliance touchpoints mapped per project.

- **Security baseline** — auth on every protected handler; server-side validation; no secrets in source; access controls on every new table; security headers; rate limits; dependency audit; no PII in logs.
- **Secure coding** — trust boundaries identified, parameterised queries everywhere, sanitisation in and out for AI-generated content, file uploads validated server-side, platform crypto libraries only.
- **Threat modelling** — lightweight STRIDE. Each threat has a likelihood, impact, mitigation, owner. Residual risk recorded with a revisit date. Model is a living document, reviewed each significant change.
- **Compliance** — control-to-framework mapping (SOC 2 / ISO 27001 / GDPR / HIPAA / PCI), evidence collection cadence (continuous / periodic / on-event), data inventory, subject-rights runbooks.

### Content

Producing copy in voice, optimised for both humans and answer engines.

- **Brand voice** — voice characteristics in `BRAND_BOOK.md`; the discipline of applying voice; AI prompts include voice rules + samples + banned phrases; review is a Phase-5 check.
- **SEO** — per-page metadata, JSON-LD per page type, one H1, kebab-case URLs, sitemap discipline, AEO signals (FAQ, structured data, citations, E-E-A-T).
- **Content strategy** — pillar / cluster model, search-intent mapping per piece, editorial cadence, channel adaptation (voice constant, style varies), structured content briefs, AI prompts versioned alongside scopes.

### Operations

How things run in production: deployments, changes, incidents, runbooks.

- **Runbooks** — the 2 am rule (over-specify), verified on a cadence (quarterly / six-monthly / annual), versioned with archived predecessors.
- **Change management** — risk classification (Low / Medium / High) drives approvals; rollback plan mandatory; change windows for high-risk; emergency-change retroactive record within 24 hours.
- **CI / CD** — CI enforces the lifecycle gates in machinery; trunk-based by default with short-lived branches; per-PR preview deploys; additive-first migrations.
- **Incident management** — severity tiers, named incident commander, comms playbook (internal / external / regulatory), blameless post-mortems within 5 days, action items tracked to closure.

### Data

Schema design, governance, and lifecycle for any project handling structured or sensitive data.

- **Data modelling** — design for the read, integrity via constraints, additive migrations, money as integer minor units, time in UTC, snapshot vs derive decisions made consciously.
- **Data governance** — a maintained data inventory (classification / lawful basis / retention / access / owner), least-privilege access, enforced retention (not just declared), production data never copied to lower environments without anonymisation.

---

## 4. RACI — who does what

Roles are described in role terms, not job titles. On any given project the same person may wear multiple hats. Exactly one role is Accountable per phase activity — multiple can be Responsible.

### Roles

| Role | Owns |
|------|------|
| **Product Owner (PO)** | *Why* the work exists; priorities; trade-offs between scope, time, and cost. |
| **Delivery Lead (DL)** | *How* the work is run; lifecycle; blockers; gates. |
| **Engineer (ENG)** | The technical build. |
| **Designer (DES)** | UI and visual decisions. |
| **UX Researcher (UXR)** | User understanding; evidence behind design decisions. |
| **QA** | Test strategy and execution. |
| **UAT Lead** | Stakeholder / customer acceptance. |
| **InfoSec** | Security posture, threat modelling, verification. |
| **Operations** | Running services; deployments; incident response. |
| **Data** | Models, quality, governance. |
| **Content** | Copy; brand voice; content strategy. |
| **Stakeholder** | Anyone affected — customer, legal, finance, vendor. |

### Headline matrix

R = Responsible, A = Accountable, C = Consulted, I = Informed. Full matrix per phase is in `00-lifecycle/raci.md`.

| Phase | A — Accountable | R — Typically Responsible | C — Typically Consulted |
|-------|-----------------|---------------------------|--------------------------|
| **1. Frame** | PO (problem); DL (constraints) | DL + leads | Eng, Design, UX, QA, Sec, Ops, Data, Content |
| **2. Plan** | DL | Eng / Design / Content / QA | PO, all leads |
| **3. Standards** | DL | Each discipline contributor | — |
| **4. Execute** | DL | Eng, Design, Content, Data | Sec, Ops, QA |
| **5. Verify** | Per discipline (QA, UAT, Sec, Ops, Data, Content) | Each discipline | All |
| **6. Land** | DL | Eng, Ops, Content | PO, Stakeholder, all |

When a role is empty on a project, defaults apply (see `raci.md §3`). The point is to make the gap visible, not hide it.

---

## 5. Templates — the project-specific layer

Templates in `02-templates/` are the only place project-specific content goes. The framework files describe *how* to work; templates capture *what* a particular project is doing — its objectives, its scopes, its decisions, its records.

Every template is project-agnostic by design: placeholders, prompts, and structure — no project-specific content. The first thing you do on a new project is fill them in.

### Bootstrap templates (once per project)

| Template | Output | When |
|----------|--------|------|
| `project-brief.md` | `PROJECT_BRIEF.md` at project root | First, at project start |
| `definition-of-done.md` | `DEFINITION_OF_DONE.md` at project root | First week — captures the team's exit criteria |

### Per-scope templates (every piece of work)

| Template | Output | When |
|----------|--------|------|
| `scope.md` | `scopes/<feature>.md` → `.v1.md` | Start of every piece of work (Phase 1) |
| `decision-record.md` | `decisions/NNNN-<title>.md` | When a decision spans multiple scopes |
| `test-plan.md` | Inside scope or `scopes/<feature>-test-plan.md` | Phase 2 of any non-trivial scope |
| `uat-script.md` | `uat/<feature>-uat.md` | Phase 2 when UAT applies |
| `security-review.md` | `scopes/<feature>-security-review.md` | Phase 5 for any security-scoped work |
| `threat-model.md` | `threat-models/<feature>-<date>.md` | Phase 2 for any work moving the security boundary |
| `code-review-checklist.md` | PR comment or Gate Log entry | Phase 5 for every merge |

### Operations templates (when production changes)

| Template | Output | When |
|----------|--------|------|
| `change-request.md` | `changes/CHG-NNNN-<title>.md` | Any production-affecting change |
| `runbook.md` | `runbooks/<name>.md` | Documenting any recurring procedure |
| `incident-record.md` | `incidents/INC-NNNN-<title>.md` | When an incident is declared |
| `post-mortem.md` | `incidents/INC-NNNN-postmortem.md` | Within 5 working days of SEV-1 / SEV-2 |

### Periodic / continuous templates

| Template | Output | When |
|----------|--------|------|
| `todo-log.md` | `TODO.md` at project root | Day-by-day execution log |
| `retrospective.md` | `retros/<date>-retro.md` | End of release / sprint / phase |
| `handover.md` | `handovers/<from>-to-<to>-<date>.md` | Person, team, or vendor handover |

### Briefing templates (delegated or agentic work)

| Template | Use case |
|----------|----------|
| `briefs/engineering-brief.md` | Build / refactor / fix work |
| `briefs/design-brief.md` | UI / UX design and prototype work |
| `briefs/content-brief.md` | Drafting / editing / publishing content |
| `briefs/qa-brief.md` | Testing a feature; UAT facilitation |
| `briefs/security-brief.md` | Threat modelling; security review; audit prep |

Each brief template points the recipient at the exact files to read and the exact files to produce. Whoever assigns the work is responsible for naming the precise standards and decision records — vague briefs produce vague outputs.

---

## 6. How to adopt this framework

### Day one

- Copy the `dev-framework/` folder into the project root.
- Fill in `project-brief.md` (one-time, project-level context).
- Mark the disciplines you need in `01-disciplines/_index.md` and in `CLAUDE.md` (if you use an AI assistant).
- Adopt `definition-of-done.md` as the team's exit criteria.
- Start the first scope from `02-templates/scope.md` — begin at Phase 1.

### Daily work

- Every piece of work follows the six-phase lifecycle.
- Inside Phase 2 + Phase 4, run Goal–Plan–Act. Any `CONFIRM:` question is a hard stop.
- Each gate is light but mandatory — the ceremony scales with risk; the gates themselves do not move.
- `TODO.md` records the day; scope files record the work; decision records capture cross-cutting decisions.

### Evolving the framework

The framework improves from real-project experience, not from speculation:

- When a project hits a recurring problem the framework does not cover, solve it locally first — under `01-disciplines/_local/`.
- If the same pattern shows up on a second project, lift it back into the framework, bump the framework version, and note the change in the project briefs that adopt it.
- Avoid lifting one-off solutions. The framework only carries patterns that have proven themselves across more than one project.

### Common anti-patterns to watch for

The full list is in `00-lifecycle/anti-patterns.md`. Three to call out specifically:

- **Documentation theatre.** Templates filled in without thinking are worse than no template. Defend each section out loud at a gate review; delete sections that earn nothing.
- **Starting at Phase 4.** Tempting for small work. The price is paid at Phase 5 — or in production. Phases collapse for small work; they do not disappear.
- **Phase 6 amnesia.** Shipping without versioning the scope, writing the decision records, and updating runbooks loses the trail. Budget Phase 6 explicitly.

---

## 7. The framework at a glance

A single page someone can pin to a wall.

### Layers

| Layer | Folder | Stability |
|-------|--------|-----------|
| Orchestration — lifecycle, GPA engine, gates, RACI, anti-patterns | `00-lifecycle/` | Stable |
| Standards — per-discipline rules and checklists | `01-disciplines/` | Evolves with practice |
| Templates — project-specific files filled in once or per scope | `02-templates/` | Used continuously |

### Lifecycle in one line

**Frame → Plan → Standards → Execute → Verify → Land**

### Engine in one line

**Goal → Plan → Act, with `CONFIRM:` as a hard stop.**

### Disciplines

`engineering` · `ui` · `ux` · `qa` · `uat` · **`infosec` (always on)** · `content` · `operations` · `data` — plus `_local` for project-specific additions.

### Gates

G1 Framed · G2 Planned · G3 Standards Read · G4 Built · G5 Verified · G6 Landed. Scale with risk; never skipped.

### Templates

`project-brief` · `scope` · `decision-record` · `test-plan` · `uat-script` · `security-review` · `threat-model` · `change-request` · `runbook` · `incident-record` · `post-mortem` · `code-review-checklist` · `definition-of-done` · `retrospective` · `handover` · `todo-log` · briefs (`engineering` / `design` / `content` / `qa` / `security`).

### The 30-second mental model

Every piece of work passes through six phases. Inside Plan and Execute, the engine is Goal–Plan–Act with `CONFIRM:` as a hard stop. The standards that apply are decided by which disciplines the project has enabled. The output of every piece of work is a scope file plus any new decision records. Disciplines are swappable modules; the lifecycle, gates, and templates are universal.
