---
description: Catalogue of templates — what each is for, when to use it, where it goes in the project
---

# Templates — Index

Templates are the **project-specific layer** of the framework. Framework files describe *how* to work; templates capture *what* a specific project is doing — its objectives, its scopes, its decisions, its records.

Every template is project-agnostic by design: it has placeholders (`{{PLACEHOLDER}}`), prompts, and structure — but no project-specific content. The first thing you do on a new project is fill them in.

---

## How to use a template

1. Copy the template from `02-templates/` to the appropriate place in the project (typically `scopes/`, `decisions/`, `runbooks/`, `incidents/`, etc.).
2. Rename the file from `<template>.md` to the project-specific name.
3. Replace all placeholders.
4. Delete any sections that don't apply (most templates have optional sections marked).

---

## Bootstrap templates (run once at project start)

| Template | Output | When |
|----------|--------|------|
| [`project-brief.md`](project-brief.md) | `PROJECT_BRIEF.md` at project root | First, at project start |
| [`definition-of-done.md`](definition-of-done.md) | `DEFINITION_OF_DONE.md` at project root | First week — captures the team's exit criteria |

---

## Per-scope templates (run for each piece of work)

| Template | Output | When |
|----------|--------|------|
| [`scope.md`](scope.md) | `scopes/<feature>.md` evolving to `scopes/<feature>.v1.md` | Start of every piece of work (Phase 1) |
| [`decision-record.md`](decision-record.md) | `decisions/NNNN-<title>.md` | When a decision spans multiple scopes |
| [`test-plan.md`](test-plan.md) | `scopes/<feature>-test-plan.md` (or inside the scope) | Phase 2 of any non-trivial scope |
| [`uat-script.md`](uat-script.md) | `uat/<feature>-uat.md` | Phase 2 when UAT applies |
| [`security-review.md`](security-review.md) | `scopes/<feature>-security-review.md` (or inside the scope) | Phase 5 for any security-scoped work |
| [`threat-model.md`](threat-model.md) | `threat-models/<feature>-<date>.md` | Phase 2 for any work moving the security boundary |
| [`code-review-checklist.md`](code-review-checklist.md) | Used inline in PRs / scope `Gate Log` | Phase 5 for every merge |

---

## Operations templates (run when production behaviour changes)

| Template | Output | When |
|----------|--------|------|
| [`change-request.md`](change-request.md) | `changes/CHG-NNNN-<title>.md` | Any production-affecting change |
| [`runbook.md`](runbook.md) | `runbooks/<name>.md` | When documenting any recurring procedure |
| [`incident-record.md`](incident-record.md) | `incidents/INC-NNNN-<title>.md` | When an incident is declared |
| [`post-mortem.md`](post-mortem.md) | `incidents/INC-NNNN-postmortem.md` | Within 5 working days of SEV-1 / SEV-2 |

---

## Periodic / continuous templates

| Template | Output | When |
|----------|--------|------|
| [`todo-log.md`](todo-log.md) | `TODO.md` at project root | Day-by-day execution log |
| [`retrospective.md`](retrospective.md) | `retros/<date>-retro.md` | End of release / sprint / phase |
| [`handover.md`](handover.md) | `handovers/<from>-to-<to>-<date>.md` | Person, team, or vendor handover |

---

## Briefing templates (for delegated or agentic work)

`briefs/` carries templates used when work is delegated to a contributor, contractor, or AI agent. Each brief points the recipient at the exact files to read and the exact files to produce.

| Template | Use case |
|----------|----------|
| [`briefs/engineering-brief.md`](briefs/engineering-brief.md) | Build / refactor / fix work |
| [`briefs/design-brief.md`](briefs/design-brief.md) | UI / UX design and prototype work |
| [`briefs/content-brief.md`](briefs/content-brief.md) | Drafting / editing / publishing content |
| [`briefs/qa-brief.md`](briefs/qa-brief.md) | Testing a feature, regression sweep, or UAT facilitation |
| [`briefs/security-brief.md`](briefs/security-brief.md) | Security review, threat modelling, audit preparation |

---

## What templates deliberately omit

Templates **do not** include:

- The actual project name, domain, brand, stakeholders, or tech stack — these live in `PROJECT_BRIEF.md`.
- Project-specific standards — these live in the project's `_local/` discipline overrides.
- Pre-filled examples that bias the contributor toward a specific solution.

If a template starts to acquire project-specific defaults, it's a sign the project needs an addition to `PROJECT_BRIEF.md` or a `_local/` standard — not a custom template.
