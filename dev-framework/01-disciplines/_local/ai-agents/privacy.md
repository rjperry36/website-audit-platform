---
description: Privacy + data-flow standard for what WEBChecker sends to external AI vendors
last_reviewed: 2026-05-21
review_cadence_days: 90
---

# Privacy & Data Flow

## Scope

Every byte sent to an external AI vendor (OpenAI, future others) and to image-processing vendors (ScreenshotOne) is a data-flow event. This standard applies to any scope that changes what is sent, to whom, or what is stored in response.

## Rules

### 1. Inventory

1.1 The current data flows are:

| Flow | What | Where it goes | Why |
|------|------|---------------|-----|
| Audit visual call | Desktop screenshot URL of a third-party homepage + persona/Cialdini prompt | OpenAI API (`gpt-4o`) | Visual analysis |
| Screenshot capture | Target site URL + viewport settings | ScreenshotOne API | Image generation |
| AI rules | (read only) `ai_rules` rows fetched from Supabase, sent to OpenAI as part of prompt | OpenAI API | Anchor model output to project's rule set |

1.2 This inventory must be kept current. Any scope that adds a new flow updates this table.

### 2. What cannot leave the project

2.1 **No user-supplied PII, no end-user behavioural data, and no Supabase row keyed to a real human identity may be sent to any external AI vendor.** Today there is no such data; this rule pre-empts it.

2.2 No secrets, no API keys, no environment variable values may appear in any prompt template, ever.

2.3 The target-site URL is not PII, but anything *inside* the screenshot (a person's photo, an email address rendered on the page, a phone number) is being sent by virtue of being in the image. If a target site has high-PII surfaces, that risk must be flagged in the scope's Phase 2 plan.

### 3. Crawl targets

3.1 Crawl targets must be either (a) publicly accessible without authentication, (b) explicitly invited as test targets by their owners, or (c) owned by the operator. No crawling behind paywalls or auth gates without recorded permission.

3.2 The list of active crawl targets lives in `audit-config.json`. Adding a target is a config change; large or sensitive targets warrant a scope, not just a config edit.

### 4. Retention

4.1 OpenAI's data retention policy applies to anything sent to its API. Today the project has no data-processing addendum with OpenAI and no zero-retention configuration. Any future shift to high-stakes targets must trigger a re-review.

4.2 ScreenshotOne stores screenshots according to its retention policy. Same review trigger.

## Pre-implementation checklist (Phase 5)

```
[ ] Scope identified every new data flow to external vendors
[ ] Data flow inventory table updated if new
[ ] No PII / no secrets / no auth-gated targets crossing the boundary
[ ] Crawl-target list has explicit permission or public access for every target
[ ] If the vendor's terms or retention policy is load-bearing, that is noted
```
