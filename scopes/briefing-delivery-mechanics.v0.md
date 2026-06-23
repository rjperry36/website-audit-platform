# Scope: briefing-delivery-mechanics

| | |
|---|---|
| **Version** | v0 |
| **Status** | Execute |
| **Owner** | Russell (Product Owner) / Claude as `engineering-agent` |
| **Disciplines** | engineering (primary), data, _local/ai-agents, ui |
| **Created** | 2026-06-23 |
| **Last updated** | 2026-06-23 |
| **Related scopes** | `briefing-agent-live-trace.v0` (the agent this extends) |
| **Related decision records** | DR-0003 (gpt-4o usage) |

---

## 1. Frame

**Problem:**
The Briefing Assistant grounds budget and team well, but its **timeline** is the
weakest leg: it leans only on approval-gate durations, not on how long delivery
actually takes. The KG holds the answer — every execution has planned vs actual
start/end (real lead time + slippage), time-tracking gives effort (person-days),
executions decompose into a repeatable relay (global_asset_creation →
localisation → local_campaign), and channel experience reveals whether the bench
can even cover the brief's channels. None of this is used yet.

**Success criteria:**
1. The agent computes, from real data: per-channel **delivery lead time**
   (median calendar days), **slip** vs plan, **on-time %**, and **person-days**.
2. It reconstructs the **delivery relay** — the execution-type stage sequence with
   median duration and the dominant department per stage.
3. It computes **channel coverage** for the brief — specialists on the bench vs
   specialists actually available in the window — and flags thin/no coverage.
4. Timeline reasoning is grounded in (1); a delivery-risk / coverage-risk signal
   is available to the model. All additive to the contract; build stays green.

**Constraints:**
- `_local/ai-agents` governs the agent file — additive context + prompt guidance,
  no model/output-field removal. Derived stats are deterministic (trustworthy).
- No new vendors; pure KG computation. Synthetic data, no PII.

---

## 2. Plan

**Approach (all in `lib/agents/briefing-assistant.ts` `buildContext`):**
1. **deliveryStats** — filter executions to the brief's channels; per channel:
   median calendar days (actual_end−actual_start), avg slip (actual−planned),
   on-time %, median person-days (time-tracking actual_hours / 8), sample size.
   Plus an overall expected lead-time band.
2. **deliveryRelay** — group executions by execution_type; median duration per
   stage + dominant department (from cost lines by dept within the stage).
3. **channelCoverage** — per brief channel: specialists on the bench
   (channel_experience ≥ 2y) and how many are ≥50% available in the window;
   status ok / thin / none.
4. Emit analyse-phase trace steps for each; add a `delivery` block to
   `BriefRecommendation` (derived, like budget composition); extend the prompt
   with DELIVERY DYNAMICS + CHANNEL COVERAGE blocks and guidance to ground the
   timeline and raise coverage/delivery risks; add a delivery sample to
   confidence signals.
5. **UI** — a Delivery card (lead time, slip, on-time, person-days, relay) and a
   channel-coverage read-out; timeline card references expected vs recommended.

---

## 3. Execute (done, 2026-06-23)

- `lib/agents/briefing-assistant.ts`: `Delivery` type + `delivery` field on
  `BriefRecommendation`; `buildContext` now computes per-channel lead time /
  slip / on-time / person-days, the execution-type relay (median days +
  dominant department per stage), and channel coverage (bench vs available);
  3 analyse-phase trace steps; DELIVERY DYNAMICS + CHANNEL COVERAGE prompt
  blocks; timeline confidence now blends approval + delivery sample evidence.
- `briefing-assistant-client.tsx`: `DeliveryCard` (expected weeks, relay chain,
  per-channel lead times, coverage chips).

## 4. Verify (done, 2026-06-23)

- `npm run build` exit 0.
- Stream smoke test (JP POSM/OOH/SEO): 122 executions measured; relay
  asset 27d → localisation 18d → local 23d with lead departments; coverage
  POSM 2/4, OOH 6/14, SEO 3/3.
- Thin-coverage stress (B2B/UX/Social): flagged B2B none (0/0), UX thin (1/1);
  the model raised a "Capacity and Coverage Risk" from the data.

## 5. Land

Shipped on `main` once committed.
