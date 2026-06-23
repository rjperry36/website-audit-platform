# WEBChecker — Agent Instructions

> This file is the orchestrator for any AI assistant working on this project. It is loaded automatically at the start of every session.
>
> The vendored process framework lives in `dev-framework/`. Treat it as a library — pin its version in `dev-framework/FRAMEWORK.md` and pull updates deliberately.
>
> The agent personas defined in `.claude/agents/` (delivery-lead, engineering-agent, infosec-agent, qa-agent) implement the discipline roles called out below.

---

## 0. Mandatory — read before any non-trivial work

Every piece of work follows the six-phase lifecycle in `dev-framework/00-lifecycle/lifecycle.md`:

1. **Frame** — understand the problem and the success criteria
2. **Plan** — choose an approach; write a scope under `scopes/`
3. **Standards check** — read the discipline standards listed below that apply to this work
4. **Execute** — do the work, step by step, using the Goal–Plan–Act engine (`dev-framework/00-lifecycle/goal-plan-act.md`)
5. **Verify** — run the relevant checks
6. **Land** — ship; update the scope; record decisions; close the loop

Inside Plan + Execute, the engine is **Goal → Plan → Act**:

- State the goal in one sentence. Flag every unknown.
- Write the plan: exact files, functions, tests, decisions. Any `CONFIRM:` question is a hard stop.
- Execute the plan one step at a time. If reality diverges, **stop and report** — do not improvise.

Detailed conventions:
- **Scopes:** `dev-framework/02-templates/scope.md` — what a scope file looks like; how it is versioned (`.v0` → `.v1` → `.v2`)
- **Decision records:** `dev-framework/02-templates/decision-record.md` — when and how to capture an ADR
- **Definition of done:** `dev-framework/02-templates/definition-of-done.md`

---

## 1. Disciplines Enabled

This project uses the following discipline modules. Read the corresponding `_index.md` and the standards inside when the lifecycle phase calls for them.

<!-- DISCIPLINES_START -->
- `engineering` — `dev-framework/01-disciplines/engineering/_index.md`
- `ui` — `dev-framework/01-disciplines/ui/_index.md`
- `ux` — `dev-framework/01-disciplines/ux/_index.md`
- `qa` — `dev-framework/01-disciplines/qa/_index.md`
- `infosec` — `dev-framework/01-disciplines/infosec/_index.md` (always on)
- `content` — `dev-framework/01-disciplines/content/_index.md` (light — used when copy or audit wording is in scope)
- `operations` — `dev-framework/01-disciplines/operations/_index.md`
- `data` — `dev-framework/01-disciplines/data/_index.md`
- `_local/ai-agents` — `dev-framework/01-disciplines/_local/ai-agents/_index.md` (always on when `lib/audit/visual-analyzer.ts`, `lib/config/personas.json`, `lib/config/cialdini.json`, or Supabase `ai_rules` is touched)
- `uat` — **deferred**. Enable when external stakeholders join.
<!-- DISCIPLINES_END -->

The full catalogue is in `dev-framework/01-disciplines/_index.md`. Disable a discipline by removing its line above.

---

## 2. Project-Specific Non-Negotiables

Rules that apply across this entire project, regardless of discipline.

<!-- NON_NEGOTIABLES_START -->
- **No secrets in the repo or in logs** — Supabase service role key, OpenAI key, ScreenshotOne key, `CRON_SECRET` are env-only. Grep before committing.
- **Cron endpoints must check `Authorization: Bearer ${CRON_SECRET}`** before doing any external-facing work. Any new cron route is blocked at Phase 2 without this check.
- **The audit JSON shape is a versioned contract.** Any change to `audit-report.json` shape requires an ADR and a migration plan. No silent shape edits.
- **No PII collected, stored, or sent to third parties** without an explicit decision record and an `infosec-agent` review. The project today collects no PII; that is the baseline.
- **All scoring, comparative, or monetary values stored as numbers, not strings.** No `"82.4"`, always `82.4`.
- **`.agent/` is operational, not docs.** It contains a live launchd plist (`com.webchecker.dailyreview.plist`). Do not move, rename, or delete files under `.agent/` without raising a change request through `operations-agent`.
- **AI pipeline changes obey `_local/ai-agents`**. Any scope touching `lib/audit/visual-analyzer.ts`, `lib/config/personas.json`, `lib/config/cialdini.json`, or `ai_rules` rows must satisfy the prompt-design, eval, cost, and privacy checklists before Phase 5 passes.
- **Single source of truth = the framework.** Project facts live in `PROJECT_BRIEF.md` + `decisions/` + `scopes/`. Historical context lives in `archive/`. Do not re-create competing narrative docs at the project root.
<!-- NON_NEGOTIABLES_END -->

---

## 3. Project Context

<!-- CONTEXT_START -->
- **Project:** WEBChecker
- **Domain / URL:** Local dev + Vercel deployment (URL not yet pinned in repo)
- **Primary stakeholder:** Russell Perry (rjperry36@gmail.com) — solo operator today
- **Type of work:** Hybrid — AI-driven web-audit pipeline + brand-intelligence dashboard + planning suite
- **Active crawl target:** `https://lyonsleaf.co.uk/` (`audit-config.json` → `site-lyonsleaf`), single homepage, weekly cron
- **Project brief:** `PROJECT_BRIEF.md`
- **Framework version:** 1.0 (adopted 2026-05-21)
<!-- CONTEXT_END -->

---

## 4. Companion Documents

Project-specific reference docs that complement the discipline modules.

<!-- COMPANIONS_START -->
- `PROJECT_BRIEF.md` — the one-page project truth
- `decisions/` — ADR-style decision records (`0001-…` through `0006-…` seeded on adoption)
- `scopes/` — one scope file per piece of work in progress
- `archive/` — original `PROJECT_NOTES.md`, `SYSTEM_PROMPT.md`, original `README.md`, original `docs/*` (historical reference only)
- `.agent/` — **operational, not docs.** Contains a live launchd job. Do not edit without a change request.
- `audit-config.json` — the source of truth for the active crawl-target list
<!-- COMPANIONS_END -->

---

## 5. Agent personas

This project has Claude Code subagent personas mapped to the disciplines above:

| Agent | File | Owns |
|---|---|---|
| `delivery-lead` | `.claude/agents/delivery-lead.md` | The lifecycle. Routes work to discipline agents, runs gates. |
| `engineering-agent` | `.claude/agents/engineering-agent.md` | Code, code review, refactors. Reads `01-disciplines/engineering/`. |
| `infosec-agent` | `.claude/agents/infosec-agent.md` | Threat models, security reviews, secret hygiene. Always on. |
| `qa-agent` | `.claude/agents/qa-agent.md` | Test strategy, automation, defect triage. |

Other discipline agents (`ui-agent`, `ux-agent`, `content-agent`, `operations-agent`, `data-agent`, `ai-agents-agent`) are not yet built. They are added on first demand — the discipline standards stand alone and any of the four MVP agents reads them as needed.

---

## 6. Anti-Hallucination Rules (apply at all times)

| Rule | Prevents |
|------|----------|
| Never assume a DB column name — read `scripts/schema.sql` and migration files | Wrong field references, runtime errors |
| Never assume an API shape — read the route handler in `app/api/**/route.ts` or the types in `lib/types.ts` | Broken integrations |
| Never assume a business rule — reference a decision record (`decisions/NNNN-*.md`) or a scope file | Decisions made twice, differently |
| If uncertain, write `CONFIRM: <question>` and stop | Silent wrong assumptions |
| Every non-obvious decision references a decision record number | Lost rationale |
| Do not read entire large files when a scope summary or grep will do | Context overload, token waste |
| **Never edit `.agent/` directly.** Raise a change request first. | Breaking the daily launchd job |
| **Never make `audit-report.json` shape changes silently.** Raise an ADR. | Dashboard / contract drift |

---

## 7. Daily Log

`TODO.md` (see `dev-framework/02-templates/todo-log.md`) is the day-by-day execution log. Update it at the end of each working session with completed items, blockers, and next steps. Closed work links to its `scopes/<feature>.vN.md` file.

---

*This file references the Dev Framework at `dev-framework/`. Treat the framework as a vendored library — pin its version in `dev-framework/FRAMEWORK.md` and pull updates deliberately.*
