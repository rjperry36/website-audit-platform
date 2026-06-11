---
description: Eval harness standard for WEBChecker's AI audit pipeline
last_reviewed: 2026-05-21
review_cadence_days: 90
---

# Eval Harness

## Scope

Every change to a prompt, model, or model parameter must be evaluated against a standing set of historical inputs before it can pass Phase 5 (Verify).

## Rules

### 1. The eval set

1.1 The eval set lives at `lib/audit/evals/visual-analyzer/`. It contains:

- A set of historical desktop screenshots (PNG).
- A `cases.json` file listing each screenshot, its known correct or expected findings, and any specific tests (e.g. "this image should produce at least one Cialdini:social_proof finding").

1.2 The eval set is curated by hand. Cases are added when:
- A real audit produced a surprising finding (positive or negative) — that becomes a regression case.
- A bug is reported and fixed — the case that reproduced it becomes a regression case.
- The team disagrees with a finding — both interpretations get captured.

1.3 The eval set must have at least 5 cases at all times. Fewer than 5 → blocking issue raised before any prompt or model change.

### 2. The eval run

2.1 An eval run feeds every case through the current `visual-analyzer.ts` and compares the output to the expected findings. The comparison is recorded in a per-run JSON file under `lib/audit/evals/runs/<YYYY-MM-DD-HHMM>.json` containing: prompt version, model, parameters, per-case pass/fail, token usage per case.

2.2 An eval run is required:
- After any change to a prompt file.
- After any change to the model name or temperature.
- After any change to `personas.json`, `cialdini.json`, or the `ai_rules` Supabase rows.

2.3 The eval run is not a unit test. It can produce non-deterministic results (model API behaviour). The pass criterion is "no unexplained regression compared to the previous run", not "100% pass". Differences must be reviewed by a human and either accepted (with rationale recorded in the run file) or fixed.

### 3. Reporting

3.1 The Phase 5 verification record for any AI-pipeline scope must link to the eval run file produced for that scope.

3.2 If the eval run shows a regression on any historical case, the scope is **blocked at Phase 5** until either the prompt is fixed or the regression is explicitly accepted with rationale.

## Pre-implementation checklist (Phase 5)

```
[ ] Eval set has at least 5 cases
[ ] Eval run produced for this scope
[ ] Token usage recorded
[ ] No unexplained regressions vs. previous run
[ ] Eval run file linked from the scope's Phase 5 record
```

## Pragmatic note

The eval harness does not yet exist in the codebase as of 2026-05-21. The first scope that touches the AI pipeline must build it before it can pass Phase 5. That bootstrap work is itself a scope under `engineering` + `_local/ai-agents`.
