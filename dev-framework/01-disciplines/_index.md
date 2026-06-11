---
description: Catalogue of disciplines and when to enable each on a project
last_reviewed: 2026-05-18
review_cadence_days: 180
---

# Disciplines — Index

Standards in this framework are organised into **disciplines**. Each project enables only the disciplines it needs.

Disciplines are enabled in the project's `CLAUDE.md` (or equivalent orchestrator) under the **Disciplines Enabled** block. To enable a discipline after init, add a line to that block and start reading the discipline's `_index.md` at Phase 3 of any relevant scope.

---

## Available disciplines

| Discipline | When to enable | Always on? |
|------------|---------------|-----------|
| [`engineering`](engineering/_index.md) | Any code project — web, API, scripts, agents, automations, data pipelines | If code is involved |
| [`ui`](ui/_index.md) | Any work that produces a visual interface — websites, apps, decks, dashboards | If a UI is involved |
| [`ux`](ux/_index.md) | Any work that affects how users interact — including content flows, not just apps | If users are involved |
| [`qa`](qa/_index.md) | Anything that needs testing — which is almost everything | Yes (effectively) |
| [`uat`](uat/_index.md) | Anything with a customer, business, or stakeholder acceptance step | If acceptance is required |
| [`infosec`](infosec/_index.md) | Always. Security is non-negotiable. | **Always on** |
| [`content`](content/_index.md) | Anything producing copy — landing pages, articles, emails, social, AI-generated content | If copy is produced |
| [`operations`](operations/_index.md) | Anything that runs in production — deployments, migrations, vendor changes, incidents | If anything is operated |
| [`data`](data/_index.md) | Anything touching data models, pipelines, analytics, or governed datasets | If data structure is touched |

---

## How disciplines combine

A typical web product project enables: `engineering`, `ui`, `ux`, `qa`, `uat`, `infosec`, `operations`, `data` (and sometimes `content`).

A content-strategy engagement enables: `content`, `ux` (for IA + accessibility), `qa` (light, for fact-checking), `infosec` (light, for any data captured).

A back-office ops change request enables: `operations`, `infosec`, `qa`, `uat`, `data`.

A pure AI-agent build enables: `engineering`, `infosec`, `qa`, `data`, plus a project-specific `_local/` discipline carrying the prompt-design + eval rules until those are upstreamed.

---

## Anatomy of a discipline folder

Every discipline folder follows the same shape so it's predictable to navigate.

```
<discipline>/
├── _index.md             ← when to read each standard, in which phase
└── <standard-name>.md    ← one standard per topic, with its own checklist
```

Each standards file has:

1. **YAML frontmatter** — `description:` summarising what the standard is for.
2. **Context paragraphs** — when this standard applies; what good looks like.
3. **Numbered sections of rules** — actual prescriptions.
4. **Pre-implementation checklist** — the items the verifier ticks at Phase 5.

---

## Adding a project-specific discipline

If your project has standards that don't fit any discipline and aren't general enough to lift into the framework:

1. Create `<project-root>/dev-framework/01-disciplines/_local/` and add your standards there.
2. Add `_local — _local/_index.md (project-specific)` to the project's `CLAUDE.md` Disciplines Enabled block.
3. If the standards turn out to apply across other projects, propose lifting them into the framework — bump the framework version, update affected projects deliberately.

The `_local/` prefix makes it obvious this isn't part of the shared library.

---

## Future disciplines

These are intentionally not in v1. Add them as `_local/` overrides until they prove themselves on a second project, then promote:

| Discipline | When it might land |
|------------|--------------------|
| `ai-agents` | When two or more projects need shared prompt-design, eval, red-team, and cost-control rules |
| `legal` | When two or more projects regularly produce legal, regulated, or contractual copy |
| `analytics` | When two or more projects need shared instrumentation, tagging, and measurement standards |
| `support` | When two or more projects share customer support, knowledge-base, or runbook templates |

---

## Discipline-to-phase quick reference

| Phase | Disciplines typically read |
|-------|---------------------------|
| 1. Frame | `ux` (research / users), `content` (audience, intent) |
| 2. Plan | All enabled — each contributes constraints to the Plan |
| 3. Standards | All enabled that the scope listed |
| 4. Execute | All enabled — in-flight checks per discipline |
| 5. Verify | All enabled — discipline-specific checklists |
| 6. Land | `operations` (runbook, release), `content` (release notes), `infosec` (post-deploy audit), `data` (inventory update) |
