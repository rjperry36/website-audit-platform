# Dev_Framework — Implementation Plan for WEBChecker

**Status:** Decisions locked — ready to execute
**Author:** Russell + Claude
**Date:** 2026-05-21
**Decisions confirmed:** see "Decisions locked" section at the end.

---

## TL;DR

The framework you dropped in is solid — well-thought-through, opinionated in the right places, and structurally suited to AI-driven work. The risks are not in the framework itself; they're in **how it lands** on top of a project that already has competing documentation surfaces (`PROJECT_NOTES.md`, `SYSTEM_PROMPT.md`, `docs/`, `.agent/`).

Per your decisions:
- **Operator model:** Russell + Claude, with humans potentially joining later.
- **This session:** Plan and recommend only — no file changes outside this document.
- **Existing artifacts:** Migrate the facts into the framework, archive the originals to `archive/`.
- **Agent personas:** Yes — define per-discipline agent roles on top of the framework.

This plan is in six stages. Each stage has a clear deliverable, a clear "good to ship" check, and a flag for anything that could break running systems.

---

## Honest assessment (so we're aligned before we start)

**What the framework is good at**

- Separation of lifecycle, standards, and records is genuinely the right cut. Each layer changes at a different rate; collapsing them creates the drift it warns against.
- The Goal–Plan–Act engine is the right primitive for AI-driven work. It maps cleanly to how I behave (or should behave) when you ask me to do something non-trivial.
- The `_local/` discipline escape hatch is exactly right — it lets a project carry weird stuff without polluting the shared library.

**What the framework does not give you**

- It is not "a team of agents." There are no agent personas, no role-specific system prompts, no defined handoffs. That's the layer we'll add in Stage 5.
- It is not free. Phases, gates, and templates carry overhead. On a solo project with one active scope at a time, the overhead-to-benefit ratio is real and only justified if work actually flows through it.
- It is not self-aware about WEBChecker's existing artifacts. Dropping it in without consolidating PROJECT_NOTES.md / SYSTEM_PROMPT.md / docs/ / .agent/ creates four overlapping sources of truth — the documentation-theatre anti-pattern §10 warns about.

**Conclusion:** Not a terrible idea. Possibly a very good one. But only if we land it deliberately, not just by copying files into the repo.

---

## Stage 1 — Reconciliation (small fixes before adoption)

**Goal:** Get the framework into a clean, internally consistent state before we put any project content into it.

**Tasks**

1. **Rename `Dev_Framework/` → `dev-framework/`.** Every internal cross-reference in the framework (CLAUDE.md.template, FRAMEWORK.md, README.md, discipline indexes) uses the lowercase-hyphenated path. Leaving the folder name out of sync silently breaks every link.
2. **Pin the framework version.** Set `FRAMEWORK_VERSION: 1.0` in `FRAMEWORK.md` and add a short "Adopted on WEBChecker 2026-05-21" note. This is the anchor for the "vendored library" model in README §Versioning.
3. **Delete the `.DS_Store` files.** They're checked into the framework folder. Trivial, but they shouldn't be there.
4. **Decide on Disciplines for this project (full proposal below).**

**Risk flags**

- None — these are mechanical, reversible.

---

## Stage 2 — Capture project context into the framework

**Goal:** Move the substantive content from existing artifacts into the templates the framework expects, so the framework becomes the single source of truth.

### 2.1 Fill in `project-brief.md`

Source the content from:
- `PROJECT_NOTES.md` §1 (what the project is), §2 (tech stack), §3 (pipeline), §4 (data model) → most of the brief.
- `README.md` → headline description and getting-started bits.
- `SYSTEM_PROMPT.md` → the original spec / intent, which becomes the "history" section.
- `audit-config.json`, `package.json`, `vercel.json`, `next.config.js` → tech stack confirmation.

### 2.2 Seed initial Decision Records

There are several decisions that were made in the past and are not currently traceable. Each becomes an ADR-style record:

- **ADR-001** — Why Supabase for markets/channels/objectives/briefs, but local filesystem for audit reports.
- **ADR-002** — Why ScreenshotOne (replaced Playwright per commit `78ab915`).
- **ADR-003** — Why `gpt-4o` for visual analysis and the chosen prompt shape.
- **ADR-004** — The Keller CBBE pyramid framing for brand health.
- **ADR-005** — Single-homepage-only crawl (`maxPages: 1`, `excludePatterns: ["*"]`) as the current production mode.
- **ADR-006** — HTTP Basic Auth gating via middleware vs. anything heavier.

These are not made up — they're decisions PROJECT_NOTES.md already documents. They just need to be in the framework shape so future work can reference them.

### 2.3 Lift the gaps list into scopes

`PROJECT_NOTES.md §5` ("Gaps & Risks") is essentially a backlog. Each item that we want to actually work on becomes a `scopes/<name>.v0.md` file. We don't need to create all of them; we create the ones that are actually next.

**Deliverable for this stage:** A populated `project-brief.md`, a `decisions/` folder with six ADRs, and one or two scope files for the next pieces of work.

**Risk flags**

- `PROJECT_NOTES.md` is ~30k of text. Some of it is operational tribal knowledge that belongs in a runbook, not a brief. We'll need to split deliberately, not dump everything into one file.

---

## Stage 3 — Discipline enablement (the WEBChecker proposal)

For WEBChecker specifically, I recommend the following discipline set:

| Discipline | Enable? | Rationale |
|---|---|---|
| `engineering` | **Yes** | Next.js / TypeScript / Node code; obvious. |
| `ui` | **Yes** | The dashboard, audit views, and Market Planner are all UI surfaces. |
| `ux` | **Yes** | Multiple user flows (audit run, brief creator, admin console). WCAG matters. |
| `qa` | **Yes** | Almost nothing currently has tests. This is one of the biggest gaps. |
| `uat` | **Defer** | No external stakeholder sign-off step today. Enable when stakeholders or clients re-engage. |
| `infosec` | **Always** | Per framework rules. Plus you ship security headers, Basic Auth, cron secrets, and Supabase keys — non-trivial surface area. |
| `content` | **Yes** | Brand voice, audit copy, and the brief-creator wording all qualify. |
| `operations` | **Yes** | Vercel cron, daily-review plist, change management around config — all present. |
| `data` | **Yes** | Mixed storage (Supabase + filesystem) is itself a data-modelling decision that needs governance. |
| `_local/ai-agents` | **Yes** (new) | This project IS an AI-agent product (the audit pipeline calls `gpt-4o`). Prompt design, eval rules, and cost control are project-specific until they prove themselves elsewhere. The framework's own §Future disciplines table calls this out. |

**Deliverable:** Updated `01-disciplines/_index.md` with project-specific enablement notes, plus a new `01-disciplines/_local/ai-agents/` folder with at least an `_index.md` listing what standards live there.

**Risk flags**

- None new. The framework is built for this.

---

## Stage 4 — Wire up `CLAUDE.md` at the project root

**Goal:** Replace `CLAUDE.md.template` with a real, populated `CLAUDE.md` so any AI session (including this one) starts from the framework.

**Tasks**

1. Copy `dev-framework/CLAUDE.md.template` → `CLAUDE.md` at the repo root.
2. Fill the `<!-- DISCIPLINES_START -->` block with the eight disciplines from Stage 3.
3. Fill `<!-- NON_NEGOTIABLES_START -->` with concrete project rules. From what's already in the repo:
   - "No secrets in the repo or logs — Supabase service role key, OpenAI key, ScreenshotOne key are env-only."
   - "Cron endpoints must check `Bearer ${CRON_SECRET}` before running."
   - "Audit JSON shape is frozen at v1 — changes require a migration plan and an ADR."
   - "All monetary, scoring, or comparative numbers stored as numbers, not strings."
   - "No PII collected without an explicit decision record and a privacy review."
4. Fill `<!-- CONTEXT_START -->` with the live values: project name, primary stakeholder (you), URL of the live deployment if any.
5. Fill `<!-- COMPANIONS_START -->` — and after migration, this should be a *short* list, not a dumping ground. Likely entries: `project-brief.md`, `RUNBOOK.md` (new), maybe `KNOWLEDGE_BASE.md` if we extract one.

**Deliverable:** A live `CLAUDE.md` at the repo root that fully replaces `SYSTEM_PROMPT.md`'s orchestrating role.

**Risk flags**

- `SYSTEM_PROMPT.md` may be referenced by `.agent/workflows/` or by other scripts. Need to grep before archiving (Stage 6).

---

## Stage 5 — The agent personas layer

This is the part the framework does *not* give you, and the part you asked for.

### 5.1 Where to put the agent definitions

You're already running Claude Code (the `.claude/` folder is in the repo). Claude Code supports **subagents** declared in `.claude/agents/<name>.md` — each one is a markdown file with frontmatter that defines a system prompt, allowed tools, and an invocation description. This is the right home because:

- It's the native Claude Code mechanism for personas.
- The orchestrator agent can spawn them via the Task tool without any extra plumbing.
- Each agent is one file, easy to version, easy to lift to other projects.

Alternative considered: putting personas inside `dev-framework/agents/`. Rejected because the framework is meant to be tool-agnostic — baking Claude Code subagent format into it pollutes its portability.

### 5.2 The proposed agent roster

One agent per discipline (mostly), plus an orchestrator. Each agent is briefed to read its discipline's `_index.md` and produce the right brief template from `02-templates/briefs/`.

| Agent | Owns | Reads | Produces |
|---|---|---|---|
| `delivery-lead` | The lifecycle. Picks the next scope, routes to discipline agents, runs the gates. | All of `00-lifecycle/`, `02-templates/scope.md` | Updated scope files, gate sign-offs. |
| `engineering-agent` | Implementation, code review, refactors. | `01-disciplines/engineering/`, the codebase | `briefs/engineering-brief.md`, code, tests. |
| `ui-agent` | Visual standards, design system audit, frontend polish. | `01-disciplines/ui/`, `components/`, `tailwind.config.ts` | `briefs/design-brief.md`, component changes. |
| `ux-agent` | Information architecture, flows, accessibility, microcopy. | `01-disciplines/ux/`, `app/` routes | UX recommendations, accessibility audits. |
| `qa-agent` | Test strategy, automation, defect triage. | `01-disciplines/qa/`, `02-templates/test-plan.md` | `briefs/qa-brief.md`, test plans, test code. |
| `infosec-agent` | Threat modelling, security review, secret hygiene. | `01-disciplines/infosec/`, `middleware.ts`, env config | `briefs/security-brief.md`, threat models, security reviews. |
| `content-agent` | Brand voice, SEO, audit-report copy, brief-creator wording. | `01-disciplines/content/`, audit JSON shape | `briefs/content-brief.md`, copy drafts. |
| `operations-agent` | Runbooks, change requests, cron health, deploys. | `01-disciplines/operations/`, `vercel.json`, the plist | `02-templates/runbook.md`, change requests. |
| `data-agent` | Schema changes, migration plans, audit data governance. | `01-disciplines/data/`, Supabase schema, audit JSON | Migration plans, data-model decisions. |
| `ai-agents` (_local) | Prompt design, model selection, eval rules, cost monitoring for the audit pipeline. | `01-disciplines/_local/ai-agents/`, `lib/audit/*` | Prompt diffs, eval results, cost reports. |
| `uat-agent` | **Deferred — scaffold only.** Re-enable when stakeholders join. | — | — |

### 5.3 How the orchestrator-to-agent handoff works

When you ask Claude to do something non-trivial:

1. **`delivery-lead`** receives the request, identifies which phase of which scope it is, and which disciplines apply.
2. For Phase 2 (Plan) and Phase 3 (Standards), `delivery-lead` calls each applicable discipline agent with the relevant brief template. The agent reads its discipline standards, reads the scope, and returns a populated brief.
3. For Phase 4 (Execute), `engineering-agent` (or whichever is doing the actual building) holds the pen. Other agents are consulted at gates.
4. For Phase 5 (Verify), each discipline agent runs its verification checklist against the deliverable.
5. For Phase 6 (Land), `delivery-lead` collects the records and closes the scope.

The Goal–Plan–Act engine runs *inside each agent* whenever it does substantive work. This is the framework's anti-hallucination guarantee.

### 5.4 What to write first

A minimum viable agent layer is:
- `delivery-lead.md` — the orchestrator.
- `engineering-agent.md` — does the actual work most of the time.
- `infosec-agent.md` — always-on discipline.
- `qa-agent.md` — biggest gap on the project.

The other five agents can wait until the first real scope demands them.

**Deliverable:** A `.claude/agents/` folder with at least those four files, each one a tight system prompt that points to its discipline `_index.md` and to the relevant brief template.

**Risk flags**

- Subagent definitions are not magic — they're only as good as the system prompt. Plan to iterate on them after the first real scope, not before.
- Beware over-engineering. If you find yourself spending more time tuning agent prompts than shipping audits, the agents are getting in your way.

---

## Stage 6 — Archive existing artifacts (carefully)

**Goal:** Make the framework the single source of truth, but never lose the original artifacts.

**Tasks**

1. Create `archive/` at the project root.
2. Move (don't copy):
   - `PROJECT_NOTES.md` → `archive/PROJECT_NOTES-2026-05-14.md`
   - `SYSTEM_PROMPT.md` → `archive/SYSTEM_PROMPT-original.md`
   - `docs/component-checklist.md`, `design-system.md`, `seo-audit-criteria.md`, `knowledge-graph.md` → `archive/docs-original/`
   - **The current `README.md`** → `archive/README-original.md`
3. Write a **new, short** `README.md` that does three things: (a) one-paragraph product description, (b) `npm` quickstart, (c) "All process lives in `dev-framework/` and `CLAUDE.md`." Nothing else.
4. **Do NOT archive `.agent/` yet** — see risk flag below.

**Hard risk flag — `.agent/` contains running code**

`.agent/` is not just docs. It contains:
- `com.webchecker.dailyreview.plist` — a launchd job that runs daily.
- `scripts/`, `workflows/`, `skills/` — likely referenced by that plist or by package.json scripts.

Before anything in `.agent/` moves, we must:
1. Grep the codebase for `.agent/` references.
2. Read the plist to understand what it runs.
3. Decide per-file: keep where it is (operational), migrate to a framework template (process), or archive (obsolete).

**Proposed treatment**: leave `.agent/` operational for now. After the first scope runs through the new framework, do a dedicated cleanup pass on `.agent/` as its own scope.

**Deliverable:** Clean repo root with `README.md`, `CLAUDE.md`, `package.json`, the framework folder, the code folders, and `archive/`. Old artifacts preserved but out of the way.

---

## Stage 7 — Prove it works on one real scope

**Goal:** Don't trust the framework until you've shipped something through it. Pick one item from `PROJECT_NOTES.md §5` (Gaps & Risks) and run it through Phases 1–6 end-to-end.

**Candidates, ranked by value-to-effort**

1. **Add a basic Jest/Vitest test harness and one test for the audit pipeline.** Forces `engineering` + `qa` + `operations` (CI). Small, high-value, exposes whether the framework helps or gets in the way.
2. **Document the audit JSON schema and freeze v1 with a migration plan for changes.** Forces `engineering` + `data` + `infosec`. Pure documentation work, low risk.
3. **Threat-model the cron endpoint.** Forces `infosec` + `operations`. Probably reveals something.

**Recommendation:** Start with #1. Smallest piece of real work that exercises the most of the framework.

**Deliverable:** One closed scope, one or two ADRs, an updated `TODO.md`, and an honest retrospective on whether the framework helped or hindered. **This retrospective is the gate that decides whether we keep going.**

---

## Sequencing and effort estimate

| Stage | Effort | Blocker for next stage? |
|---|---|---|
| 1. Reconciliation | 15 min | Yes |
| 2. Capture context | 2–3 hours | Yes |
| 3. Discipline enablement | 30 min | No (can run in parallel with 4) |
| 4. Wire up CLAUDE.md | 30 min | Yes |
| 5. Agent personas (MVP, 4 agents) | 1–2 hours | No (can defer until after first scope) |
| 6. Archive originals | 30 min, plus careful `.agent/` audit | No |
| 7. First scope end-to-end | depends on the scope chosen | Final go/no-go decision |

Total without Stage 7: about half a day of focused work.

---

## Decisions locked — 2026-05-21

These decisions are signed off and frozen for the execution pass. Any change requires a new decision record.

| # | Question | Decision |
|---|---|---|
| 1 | Operator model | Russell + Claude. Humans may join later — design for that but don't optimise for it yet. |
| 2 | Session mode | Plan + recommend (this document). Execution begins on explicit go-ahead. |
| 3 | Existing artifacts | Migrate facts into the framework, archive originals to `archive/`. |
| 4 | Agent persona shape | One agent per discipline. Phased rollout — not all agents on day one. |
| 5 | MVP agent roster (Stage 5) | `delivery-lead` + `engineering-agent` + `infosec-agent` + `qa-agent`. Four files. Other discipline agents added when a scope demands them. |
| 6 | Order of operations | Build agents first, then run the first scope. Stage 5 before Stage 7. |
| 7 | `_local/ai-agents` discipline | **Enabled on day one.** The audit pipeline's `gpt-4o` calls are the project's centre of gravity and deserve formal prompt / eval / cost governance from the start. (No `ai-agents` *agent* yet — discipline is read by whichever agent's working in that area until volume justifies its own persona.) |
| 8 | First scope (Stage 7) | **Add a test harness (Vitest) + one audit-pipeline test.** Forces `engineering` + `qa` + `operations` through the gates. Closes the biggest existing gap. |

### What this means for the execution sequence

```
Stage 1  Reconciliation (rename, version-pin, .DS_Store cleanup)
Stage 2  Capture project context into project-brief.md + 6 ADRs
Stage 3  Enable disciplines (8 + _local/ai-agents)
Stage 4  Wire up CLAUDE.md at the repo root
Stage 5  Build MVP agents — delivery-lead, engineering, infosec, qa
Stage 6  Archive originals (.agent/ stays put — separate audit)
Stage 7  Run the first scope: Vitest + one audit-pipeline test
         → retrospective gate: does the framework help or hinder?
```

Total expected effort to land Stages 1–6: roughly half a day of focused work. Stage 7's effort depends on test-target choice.

### Next step

Awaiting explicit go-ahead to begin Stage 1. Until then, no files outside this plan change.
