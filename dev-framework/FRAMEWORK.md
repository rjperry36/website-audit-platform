# The Dev Framework — Overview

**FRAMEWORK_VERSION:** 1.0
**Status:** Active
**Last updated:** 2026-05-21
**Adopted on:** WEBChecker, 2026-05-21 (folder renamed Dev_Framework → dev-framework on adoption)

A single, opinionated, project-agnostic way to deliver digital work to a consistent standard across coding, UI, UX, QA, UAT, security, content and operations.

---

## 1. Why this exists

Without a shared framework, teams converge to the lowest common denominator and lose three things at once:

1. **Consistency.** The same problem gets solved three different ways across three projects. Onboarding gets harder. Hand-offs leak.
2. **Compounding learning.** Each project re-discovers the same gotchas — security misses, accessibility regressions, missed UAT scenarios, late-stage scope creep.
3. **Audit readiness.** When work is shipped, it's hard to point to *the* decision, *the* test plan, *the* threat model — because none of them follow a stable shape.

The framework fixes all three with one tool: a small set of stable surfaces (lifecycle, gates, templates) and a modular library of standards behind them.

---

## 2. Three layers, separated on purpose

| Layer | Purpose | Where it lives |
|-------|---------|----------------|
| **Orchestration** | Tells everyone (humans + agents) what phase the work is in, what to read, what to produce | `00-lifecycle/` + optional `CLAUDE.md` |
| **Standards** | The actual rules per discipline — what "good" looks like | `01-disciplines/` |
| **Records** | What was scoped, decided, tested, signed off, shipped | `02-templates/` populated into the project as `scopes/`, `decisions/`, `runbooks/`, etc. |

Each layer changes at a different rate. Orchestration is stable. Standards evolve with industry practice. Records change continuously. Keeping them separated means a change at one layer doesn't ripple.

---

## 3. The universal lifecycle

Every piece of work — a feature, a campaign, a vendor change, a security fix, a content drop — moves through six phases.

```
1. FRAME      What's the problem? What's success? What are the constraints?
2. PLAN       What's the approach? What are the alternatives? What standards apply?
3. STANDARDS  Read the discipline standards that apply. Note any planned deviations.
4. EXECUTE    Do the work. One step at a time. Stop on surprise; do not improvise.
5. VERIFY     Run the checks the standards require. Green-light or fix.
6. LAND       Ship. Record decisions. Close the loop. Version the scope.
```

The phases are short by design. Anything more elaborate is a **specialisation** layered on top — see `00-lifecycle/lifecycle.md §7`.

---

## 4. The Goal–Plan–Act engine

Inside Plan → Execute, every contributor (human or agent) uses a tight three-step engine:

| Step | Output | Stop rule |
|------|--------|-----------|
| **Goal** | One-sentence statement of intent + assumptions | If you cannot state the goal in one sentence, you are not ready to plan |
| **Plan** | Files, functions, tests, decisions — exact, not hypothetical | Any `CONFIRM:` question is a hard stop. Resolve before Act. |
| **Act** | Sequential execution of the plan, one step at a time | If reality diverges from the plan (file missing, type wrong, rule conflicts), **stop and report**. Do not improvise. |

This engine is the anti-hallucination, anti-scope-creep firewall. It applies equally to a junior developer, a senior architect, and an AI agent.

---

## 5. Disciplines (the modules)

Standards are organised into disciplines. A project enables only the disciplines it needs.

| Discipline | When to enable | Headline standards |
|------------|---------------|--------------------|
| `engineering` | Any code project | Coding standards, API design, error handling, performance, code review |
| `ui` | Any work with a visual interface | Design system discipline, visual standards, frontend implementation |
| `ux` | Any work with users | UX process, user research, interaction design, accessibility (WCAG 2.1 AA) |
| `qa` | Anything that needs testing (most things) | Test strategy, automation, defect management |
| `uat` | Anything with a customer or stakeholder acceptance step | UAT process, sign-off, acceptance criteria |
| `infosec` | Always — security is non-optional | Security baseline, secure coding, threat modelling, compliance touchpoints |
| `content` | Anything that produces copy or marketing | Brand voice, SEO, content strategy |
| `operations` | Anything that runs in production | Runbooks, change management, CI/CD, incident management |
| `data` | Anything that touches data models or pipelines | Data modelling, data governance |

Each discipline folder has an `_index.md` listing its standards and **when** each one applies (Phase 2 / Phase 3 / Phase 5 etc.). The lifecycle drives which standards get read.

---

## 6. Quality gates

The gates between phases are the moments at which work cannot advance until something is true. They are summarised in `00-lifecycle/gates.md`:

| Gate | At end of | Required to pass |
|------|-----------|------------------|
| **G1 — Framed** | Frame | Problem, success criteria, constraints written down |
| **G2 — Planned** | Plan | Approach chosen; alternatives considered; standards listed; no open `CONFIRM:` |
| **G3 — Standards Read** | Standards | All listed standards consulted; planned deviations documented |
| **G4 — Built** | Execute | The deliverable exists and matches the plan |
| **G5 — Verified** | Verify | Every standard's verification checklist is green or has an explicit, recorded exception |
| **G6 — Landed** | Land | Shipped; scope versioned; decision records written; follow-ups logged |

Gates are mandatory but lightweight. They take minutes, not days.

---

## 7. RACI

`00-lifecycle/raci.md` defines who is **Responsible**, **Accountable**, **Consulted**, and **Informed** at each phase, by role (delivery lead, engineer, designer, QA, InfoSec, product owner, etc.). Roles are project-agnostic — they map to whoever is wearing that hat in your team.

---

## 8. Templates — the project-specific layer

Templates in `02-templates/` are the only place project-specific content goes. The headline templates:

- **`project-brief.md`** — the one-pager describing what *this* project is. Filled in once at the start.
- **`scope.md`** — one per piece of work. Brief, spec, and post-launch record in a single evolving file.
- **`decision-record.md`** — for any decision that spans multiple scopes (ADR-style).
- **`test-plan.md`** — for any non-trivial QA effort.
- **`uat-script.md`** — for any customer/stakeholder acceptance test.
- **`security-review.md`** + **`threat-model.md`** — for any InfoSec-scoped change.
- **`change-request.md`** + **`runbook.md`** — for any production change.
- **`code-review-checklist.md`** + **`definition-of-done.md`** — used at the gates.
- **`retrospective.md`** + **`handover.md`** — for the close of a phase, release, or person handover.

Every template has a "How to fill this in" header and ends with a "What good looks like" example reference.

---

## 9. How the framework evolves

The framework improves from real-project experience, not from speculation. Two mechanisms drive evolution:

### 9.1 Project-up additions (new patterns)

1. A project hits a recurring problem the framework doesn't cover.
2. Solve it locally first — in a project-specific addition under a local discipline override.
3. If the same pattern shows up on a second project, lift it back into the framework: edit the relevant standard or template, bump the framework version, note the change in the project's project brief.

Avoid lifting one-off solutions. The framework only carries patterns that have proven themselves across more than one project.

### 9.2 Source-down refreshes (the standards-refresh lifecycle)

Alongside the work lifecycle, every standard runs a **freshness lifecycle**: source → claim → anchor → periodic diff → human gate → updated standard.

See `00-lifecycle/standards-refresh.md` for the full pattern. The short version:

- Each standard's frontmatter declares `last_reviewed:`, `review_cadence_days:`, and an optional `anchors:` block tying load-bearing claims to external authoritative sources.
- On the declared cadence (or after a known major release of an underlying technology), an auditor — a person, a script, or an AI skill — diffs the standard against its sources and classifies findings as OK / MINOR / MAJOR / NEW / BROKEN.
- A human reviews the proposed changes. Updated standards become the new source of truth.
- A worked example for one stack (Next.js + Vercel + Neon) is in `examples/stack-conventions-auditor/`.

The two mechanisms are complementary. Project-up additions extend coverage; source-down refreshes prevent drift in what's already covered.

---

## 10. Anti-patterns

The framework fails when teams:

- **Treat it as documentation theatre.** Filling templates without making decisions is worse than no template.
- **Skip Phase 3 (Standards Check).** Standards read during Execute are standards skipped. Read up front; turn them into design constraints.
- **Skip Phase 6 (Land).** Without the closing record, the next piece of work loses the decision history. Fifteen minutes here saves hours later.
- **Override silently.** Every deviation from a standard is fine — *if it is recorded*. Silent deviations are the start of drift.
- **Refuse to specialise.** When a project legitimately needs a different cadence (e.g. content ops at weekly publishing, vs. engineering at sprint cadence), specialise the phase inside the project — don't fight the framework.

The full list is in `00-lifecycle/anti-patterns.md`.

---

## 11. Where to go next

| If you want to… | Read |
|-----------------|------|
| Understand the lifecycle deeply | `00-lifecycle/lifecycle.md` |
| Run a discipline (e.g. QA, InfoSec) | `01-disciplines/<discipline>/_index.md` |
| Start a new project | `02-templates/project-brief.md` |
| Write a scope | `02-templates/scope.md` |
| Capture a decision | `02-templates/decision-record.md` |
| Wire up an AI assistant | `CLAUDE.md.template` |
