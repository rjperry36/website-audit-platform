---
description: Cost governance standard for WEBChecker's AI calls
last_reviewed: 2026-05-21
review_cadence_days: 90
---

# Cost Governance

## Scope

Every API call to a paid AI vendor counts. This standard applies to: OpenAI `gpt-4o` calls in `lib/audit/visual-analyzer.ts`, ScreenshotOne API calls (paid per screenshot), and any future paid model added to the pipeline.

## Rules

### 1. Budgets

1.1 Each scope that adds, removes, or modifies a paid AI/API call must include in its Phase 2 (Plan) section:

- **Current cost per cron run** (USD, estimated): based on current pricing × current call volume × current token / page count.
- **Projected cost per cron run after this scope** (USD, estimated): same calculation post-change.
- **Projected monthly cost** (cost per run × runs per month).

1.2 If the projected monthly cost increases by more than **25%** OR exceeds **$25/month** in absolute terms, the scope cannot pass Phase 2 (Plan) gate without an explicit decision record acknowledging and accepting the new spend.

### 2. Per-call telemetry

2.1 Every call to a paid AI vendor must log, at minimum: the model name, the input token count (or input size in pixels for image-only models), the output token count, the wall-clock duration, and the date/time. Logged to whatever observability surface exists (today: console; future: dedicated table or service).

2.2 No paid API call may be made from a code path that does not log this telemetry. This rule supersedes "quick experiment" arguments — quick experiments still need telemetry.

### 3. Ceilings

3.1 The production cron must have a hard ceiling on AI calls per run. Today that ceiling is **one `gpt-4o` call per crawled site per cron run** (a function of ADR-0005: single-homepage crawl). Any change that lifts that ceiling requires an ADR.

3.2 Local development tooling that calls paid APIs (e.g. `npm run test-ai-integration`) must respect the same ceilings. No "infinite loop testing" script may call a paid API.

### 4. Audit

4.1 Once per quarter, the cron's actual spend is reconciled against the projected spend recorded in scopes. Variance > 25% triggers a review.

## Pre-implementation checklist (Phase 5)

```
[ ] Scope's Phase 2 plan included a before/after cost estimate
[ ] Every new paid API call has telemetry logging
[ ] The production cron's hard ceiling on calls/run is honoured
[ ] No new dev tooling calls paid APIs without explicit cost approval in the scope
```

## Notes

- The pricing for `gpt-4o` and ScreenshotOne is current as of model knowledge cutoff (May 2025). Refresh on the first scope after 2026-09-01.
- This standard is intentionally lightweight at this stage. As spend grows, it tightens.
