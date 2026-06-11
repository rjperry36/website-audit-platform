# DR-0003 — OpenAI `gpt-4o` for visual analysis of the desktop screenshot

| | |
|---|---|
| **Date** | 2026-05-21 (decision originally made early 2026; backfilled on framework adoption) |
| **Status** | Accepted |
| **Participants** | Russell |
| **Affects** | engineering, `_local/ai-agents` discipline; `lib/audit/visual-analyzer.ts`; cost profile of the cron |
| **Supersedes** | — |

---

## Context

The audit pipeline needed an AI-driven assessment of the homepage's visual design — alignment with the brand's stated persona, presence of Cialdini-style persuasion principles, accessibility / hierarchy concerns visible only in the rendered page. This requires a vision-capable model with reliable JSON output and reasonable latency for a daily cron.

---

## Decision

Use **OpenAI `gpt-4o`** via the official `openai` Node SDK. Prompts are constructed from `lib/config/personas.json` + `lib/config/cialdini.json` and the rule set in Supabase `ai_rules`. The model is sent the desktop screenshot URL and asked to return findings as JSON.

---

## Alternatives considered

- **Claude Sonnet (vision)** — strong alternative; not chosen at the time because the team was already using the OpenAI SDK for other prototypes and switching cost was non-zero. Worth reconsidering once an eval harness exists.
- **Gemini multi-modal** — not seriously evaluated.
- **Self-hosted open-vision models (LLaVA, etc.)** — rejected on operational cost and quality for the persona/Cialdini task.
- **No AI visual analysis; rule-based only** — rejected because much of the value is in the model's ability to *describe what the page looks and feels like*, which rule-based audits can't do.

---

## Consequences

**Positive:**
- High-quality multimodal output with a stable API.
- Easy integration via the `openai` SDK.

**Negative / risks:**
- **No cost monitoring** today — every cron call burns tokens with no ceiling. A spike in target page complexity or a prompt edit can multiply spend silently.
- **No eval harness** — there is no way to know if a prompt change improved or degraded findings short of human review.
- **Prompt is not versioned independently of code** — prompt drift over commits is invisible.
- Vendor lock-in to OpenAI's API shape and pricing.
- Sending a screenshot URL of a third-party site to OpenAI has privacy/IP implications worth a deliberate look before scaling beyond crawl targets that explicitly invite analysis.

**Reversibility:**
- Two-way. The `VisualAnalyzer` interface is small; swapping to Claude/Gemini would touch `lib/audit/visual-analyzer.ts` and the prompt-construction logic.

---

## Follow-up

- The first scope that touches `lib/audit/visual-analyzer.ts` **must** add: a versioned prompt artifact, a small eval set, and a cost ceiling per cron run. This is the founding standard of the `_local/ai-agents` discipline.
- A future ADR should compare `gpt-4o` vs Claude Sonnet on the actual persona/Cialdini task once the eval set exists.
