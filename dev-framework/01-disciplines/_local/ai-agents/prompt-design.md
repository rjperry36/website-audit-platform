---
description: Prompt design standard for WEBChecker's AI audit pipeline
last_reviewed: 2026-05-21
review_cadence_days: 90
---

# Prompt Design

## Scope

This standard applies to any prompt that goes to an external model API as part of WEBChecker's audit pipeline. Today that means the prompts assembled in `lib/audit/visual-analyzer.ts` from `personas.json`, `cialdini.json`, and the `ai_rules` Supabase rows.

## Rules

### 1. Versioning

1.1 Every prompt template is committed to the repo as a file under `lib/audit/prompts/`, not assembled inline in TypeScript. Inline assembly is fine for *insertion of dynamic values* (rule rows, persona name, target URL) but the prompt skeleton lives in a file.

1.2 Prompt files use a date-stamped naming convention: `visual-analyzer-2026-05-21.md`. When a prompt is changed, the new version gets a new filename. The old file is kept; the new file is referenced from code.

1.3 Each prompt file has a frontmatter block:

```yaml
---
purpose: What this prompt does, in one sentence
inputs: List of dynamic insertion points (e.g. {{TARGET_URL}}, {{PERSONA}})
expected_output_shape: JSON schema name or short description
last_reviewed: YYYY-MM-DD
---
```

### 2. Structure

2.1 Every prompt has four sections, in order:

- **Role** — who the model is acting as.
- **Task** — what it is doing.
- **Constraints** — what it must / must not do.
- **Output format** — exact JSON shape with examples.

2.2 The output format section gives a concrete example, not just a schema. Models follow examples more reliably than schemas.

### 3. Determinism

3.1 Prompts must be designed for `temperature: 0` or as close to deterministic as the model exposes. Non-determinism in the audit pipeline is a regression risk (today's report disagrees with yesterday's for no real-world reason).

3.2 Order matters. The same inputs in the same order must produce comparable outputs across runs.

### 4. Defensiveness

4.1 The prompt explicitly tells the model what to do if it cannot complete the task (return a structured "insufficient input" response, not silent hallucination).

4.2 The prompt forbids the model from inventing facts about the target site. Findings must be grounded in the screenshot or the rule set, not in the model's general knowledge.

## Pre-implementation checklist (Phase 5)

```
[ ] New prompt has a date-stamped file under lib/audit/prompts/
[ ] Frontmatter is complete
[ ] Old prompt file kept; not overwritten
[ ] Four-section structure present
[ ] Output format includes a concrete example
[ ] Temperature set to 0 (or model's minimum)
[ ] Defensive "what if you can't" branch present
```
