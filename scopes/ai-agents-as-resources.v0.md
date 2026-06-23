# Scope: ai-agents-as-resources

| | |
|---|---|
| **Version** | v0 |
| **Status** | Execute |
| **Owner** | Russell (Product Owner) / Claude as `engineering-agent` |
| **Disciplines** | engineering, data, _local/ai-agents, ui |
| **Created** | 2026-06-23 |
| **Last updated** | 2026-06-23 |
| **Related scopes** | `briefing-delivery-mechanics.v0`, `briefing-agent-live-trace.v0` |
| **Related decision records** | DR-0003 |

---

## 1. Frame

**Problem:**
Resource planning is moving to a hybrid bench — human specialists **and** AI agents
(Anthropic, OpenAI, Google, Microsoft Copilot) booked for specific roles. Agents
behave like resources: strong at some disciplines, weak at others, with a cost
(tokens, not days) and a usage history (model, tokens, £). They are also the
natural **mitigation** for human capacity/coverage gaps (always-on). The KG has no
agent data and the briefing assistant can't recommend a human+agent mix.

**Success criteria:**
1. A separate **agent catalogue** in the KG: 8 agents across Anthropic / OpenAI /
   Google / Microsoft, each with a skill profile (same 1–5 taxonomy as humans),
   channel suitability, realistic per-token (or per-seat) pricing, context window.
2. **Historical agent usage** tied to real past executions: model, input/output
   tokens, £ cost, task type — concentrated on digital/content work from ~mid-2025.
3. The briefing assistant **recommends a hybrid team** (humans + agents), shows
   agent token/£ cost, folds an **AI/Agent slice into budget composition**, and
   proposes **agents as mitigation** for thin coverage / unavailable humans.
4. **Risk `mitigation` promoted to a first-class field** (was baked into description).
5. Additive, build green, realistic pricing.

**Constraints:**
- Separate catalogue (chosen) — additive, humans untouched.
- `_local/ai-agents`: additive context + prompt guidance; derived costs deterministic.
- Pricing realistic (GBP per Mtok from current real prices); synthetic but believable
  historical volumes. No PII.

---

## 2. Plan

1. **Data**
   - `data/knowledge-graph/nodes/agents.json` — agent nodes (provider, model_id,
     pricing, context window, inline skills[] + channels[]).
   - `data/knowledge-graph/tables/agent-usage.csv` — generated: usage per execution
     (agent_id, model_id, input/output/total tokens, cost_gbp, task_type, date).
2. **Loader** — `getAgents`, `getAgentUsage` (+ types).
3. **Briefing backend** (`lib/agents/briefing-assistant.ts`)
   - Score candidate agents by skill/channel fit; estimate £/tokens from history.
   - Add `resource_type` (+ agent fields) to team members; CANDIDATE AI AGENTS
     prompt block + hybrid-team / agent-as-mitigation guidance.
   - Budget composition gains an `ai` slice (agent cost across comparable execs).
   - `Risk.mitigation` first-class field; trace step for agent scoring.
4. **UI** — agent team rows (provider/model badge, tokens + £, always-on), AI
   segment in the composition bar, risk mitigation line.

---

## 3. Execute (done, 2026-06-23)

- Data: `nodes/agents.json` (8 agents — Anthropic Opus/Sonnet/Haiku, OpenAI
  GPT-4o/o3, Google Gemini Pro/Flash, Microsoft Copilot) with skills, channel
  fit, realistic GBP per-Mtok (or per-seat) pricing; `tables/agent-usage.csv`
  (121 rows) generated against real executions from mid-2025 adoption.
- Loader: `getAgents`, `getAgentUsage` + types.
- `lib/agents/briefing-assistant.ts`: candidate-agent scoring (channel+skill,
  with historical tokens/cost); CANDIDATE AI AGENTS prompt block + hybrid-team /
  agent-as-mitigation guidance; `resource_type` + agent fields on team members;
  AI slice in budget composition; first-class `Risk.mitigation`; agents trace step.
- `briefing-assistant-client.tsx`: agent team rows (Bot badge, token £, fuchsia),
  AI segment in composition bar, risk mitigation line.

## 4. Verify (done, 2026-06-23)

- `npm run build` exit 0 (cleared stale `.next` after a concurrent build).
- Stream smoke test (DE/FR SEO+ECRM): 8 agents scored; hybrid team returned
  (4 humans + Claude Sonnet 4.6 for first-draft localisation at ~£23 tokens);
  composition AI slice £346 (~0% vs £M labour — honest); risks carry mitigations,
  one proposing AI agents to expedite content.

## 5. Land

Shipped on `main` once committed.
