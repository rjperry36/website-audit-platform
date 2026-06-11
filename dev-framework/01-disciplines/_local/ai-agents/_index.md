---
description: Project-specific discipline for the AI components of WEBChecker — prompt design, eval, cost governance for `gpt-4o` calls in the audit pipeline
last_reviewed: 2026-05-21
review_cadence_days: 90
project_scope: WEBChecker only — promote to framework if a second project needs the same standards
---

# `_local/ai-agents` Discipline (WEBChecker)

WEBChecker's audit pipeline calls `gpt-4o` (see `lib/audit/visual-analyzer.ts`) to assess homepage screenshots against persona and Cialdini-principle prompts. That call is the project's centre of gravity — and it is currently ungoverned: no versioned prompts, no eval set, no cost ceiling, no monitoring.

This discipline carries the standards that apply to **any change touching the AI pipeline** until those standards have proven themselves on a second project, at which point they should be lifted into a framework-level `ai-agents` discipline (see `dev-framework/01-disciplines/_index.md` §Future disciplines).

| Standard | File | When |
|----------|------|------|
| Prompt design | [`prompt-design.md`](prompt-design.md) | Phase 2 (Plan) for any scope that adds or edits an AI prompt |
| Eval harness | [`eval.md`](eval.md) | Phase 4 (Execute) and Phase 5 (Verify) for any AI-touching scope |
| Cost governance | [`cost-governance.md`](cost-governance.md) | Phase 2 (Plan) and Phase 5 (Verify) for any scope that changes API call volume, model, or prompt length |
| Privacy & data flow | [`privacy.md`](privacy.md) | Phase 2 (Plan) and Phase 5 (Verify) for any scope that changes what is sent to the model |

---

## Why this is `_local/` not framework-level

Per `01-disciplines/_index.md`, framework-level disciplines must have proven themselves on at least two projects. WEBChecker is the only project today running this kind of audit-on-AI loop. When a second project repeats the pattern, lift these standards up and promote.

---

## Hard rule

**No scope that touches `lib/audit/visual-analyzer.ts`, `lib/config/personas.json`, `lib/config/cialdini.json`, or the Supabase `ai_rules` table may pass Phase 5 (Verify) without:**

1. A versioned record of the prompt(s) used (committed under `lib/audit/prompts/` with a date-stamped filename).
2. An eval run against the standing eval set (see `eval.md`).
3. An updated cost estimate (see `cost-governance.md`).

This rule is non-negotiable until cost or quality monitoring exists at a level that obviates it.

---

## Verification checklist (Phase 5)

```
[ ] Prompt diff reviewed — every wording change is intentional, not accidental
[ ] Eval run produced; results compared against last run; regressions justified or fixed
[ ] Token usage measured; new per-cron cost estimate within budget
[ ] No new PII surface; data flow re-reviewed if anything changed in what we send
[ ] ADR raised if model, vendor, or pricing tier changed
```
