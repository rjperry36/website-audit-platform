# Scope: briefing-agent-live-trace

| | |
|---|---|
| **Version** | v0 |
| **Status** | Execute |
| **Owner** | Russell (Product Owner) / Claude as `engineering-agent` |
| **Disciplines** | engineering (primary), ui, ux, _local/ai-agents |
| **Created** | 2026-06-23 |
| **Last updated** | 2026-06-23 |
| **Related scopes** | — |
| **Related decision records** | DR-0003 (gpt-4o usage) |

---

## 1. Frame

**Problem:**
The AI Briefing Assistant (`/briefing/assist`) shows a **static** loading line
("Reading 10 campaigns, 40 people, 1,000+ approvals…") that is hardcoded in the
client. In live demos it reads as canned — it does not prove the agent is reading
real data. We want the right-hand pane to show the agent's actual work as it
happens: what it reads (with real counts), what it infers, token usage, and a
confidence read-out indicating how well-grounded each decision is.

**Success criteria:**
1. The right pane streams real agent activity: per-KG-source read counts + timing,
   analysis/inference steps, and a live token counter — all from real values.
2. Token usage (prompt / completion / total) is captured from the OpenAI call and
   displayed. No fabricated numbers.
3. A confidence read-out is shown: an overall grounding confidence (derived from
   retrieval coverage) + per-section confidence (budget, timeline) + the model's
   per-person match scores. Confidence is honest — derived from real evidence
   counts, not invented.
4. The recommendation output shape stays backward-compatible (additive fields).
5. It is **one agent** represented truthfully as three phases
   (Retrieve → Analyse → Reason), not a faked multi-agent swarm.

**Constraints:**
- `_local/ai-agents` governs `lib/agents/briefing-assistant.ts`. This change is
  observability-only: same prompt, same model, same output fields — it *adds*
  token-usage visibility (improves cost governance) and switches the call to
  streaming (same result, accumulated).
- No PII: KG is synthetic agency data (Aurelune). Token counts are not secrets.

---

## 2. Plan

**Approach:**
1. **Agent (`lib/agents/briefing-assistant.ts`)**
   - Add `AgentEvent` type + optional `onEvent` callback to `adviseOnBrief` and
     `buildContext`.
   - Instrument each of the 9 KG fetches to emit `step` events with real row
     counts + ms as they resolve; emit analysis/inference steps after scoring.
   - Switch the gpt-4o call to `stream: true` + `stream_options.include_usage`;
     emit a live `tokens` event as completion text arrives; capture exact usage.
   - Compute a deterministic `confidence` block from retrieval coverage
     (similar campaigns, approval sample size, candidate-people pool, budget
     spread); add per-section confidence to budget + timeline; add token fields
     to `meta`. All additive to `BriefRecommendation`.
2. **API (`/api/agents/briefing-assistant/stream/route.ts`)** — new SSE route
   returning `text/event-stream`; validates input, runs `adviseOnBrief(body,
   send)`, emits a final `done` event with the recommendation. Existing JSON
   route kept as fallback (same code path, no `onEvent`).
3. **Client (`briefing-assistant-client.tsx`)** — POST to the stream route, read
   `res.body` reader, parse SSE `data:` lines into state; render a 3-phase
   activity timeline + token meter + confidence read-out in the right pane;
   transition to the existing recommendation cards on `done`.

**Decisions:**
- Confidence derived in code (trustworthy) + model match scores surfaced
  (model inference). Prompt unchanged → low `_local/ai-agents` risk.
- Single agent shown as 3 phases — honest representation.

---

## 3. Execute (done, 2026-06-23)

- `lib/agents/briefing-assistant.ts`: `AgentEvent` type + `onEvent` threaded
  through `adviseOnBrief`/`buildContext`; 9 KG reads instrumented with real
  counts+timing; analyse steps (similar campaigns, approvals, people); gpt-4o
  switched to streaming + `include_usage`; live token events; `computeConfidence`
  added; `confidence` + token fields added to `BriefRecommendation` (additive).
- `app/api/agents/briefing-assistant/stream/route.ts`: new SSE route.
- `briefing-assistant-client.tsx`: SSE consumption; `AgentActivityFeed`,
  `ConfidenceCard`, `AgentTrace` components in the right pane.

## 4. Verify (done, 2026-06-23)

- `npm run build` exit 0.
- Local stream smoke test: events arrive in phase order; retrieve shows real
  counts (10 campaigns, 501 executions, 1,002 approvals, 5,936 time-tracking…);
  token counter advances live then snaps to exact usage (`estimated:false`,
  total 7,476); `done` carries recommendation + confidence (overall/label/
  per-section/team_match_avg) + meta tokens.

## 5. Land

Shipped on `main` once committed. Existing JSON route retained as fallback.
