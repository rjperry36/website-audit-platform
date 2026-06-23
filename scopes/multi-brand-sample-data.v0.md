# Scope: multi-brand-sample-data

| | |
|---|---|
| **Version** | v0 |
| **Status** | Execute |
| **Owner** | Russell (Product Owner) / Claude as `engineering-agent` |
| **Disciplines** | data (primary), engineering, _local/ai-agents, ui |
| **Created** | 2026-06-23 |
| **Last updated** | 2026-06-23 |
| **Related scopes** | `ai-agents-as-resources.v0`, `briefing-delivery-mechanics.v0` |

---

## 1. Frame

**Problem:**
All KG data is one client (Aurelune), with only 10 campaigns and 41 people — so
the briefing assistant barely discriminates between briefs, several channels have
no human bench, and there is no cross-client contention. We are adding a **2nd
client brand (Kestrel — performance outdoor apparel)** and scaling to **~80
campaigns / ~100 people**, then wiring the briefing assistant to be brand-aware.

**Success criteria:**
1. A `Kestrel` brand with full satellite (contract, teams, products, personas,
   objectives, KPIs, budgets) added — Aurelune untouched.
2. Bench grown to ~100 people covering **every** channel (B2B, Research, UX,
   Event, POSM, SEO no longer empty/thin), with skills, channel/category
   experience and availability. People are shared across both brands.
3. ~80 campaigns split across both brands, each cascading into executions,
   execution-links, approval-steps, cost-lines, time-tracking, media-spend and
   (recent) agent-usage — all referentially consistent.
4. `npm run validate-kg` passes (no hard errors).
5. The briefing assistant becomes **brand-aware**: a client selector on the
   brief, comparables filtered/weighted to the chosen brand, prompt + category
   match parameterised by brand.

**Constraints:**
- Seeded, reproducible **generator that APPENDS** (existing hand-crafted demo
  briefs keep working). Committed under `scripts/`.
- Referential integrity per `scripts/validate-kg.ts` (unique ids, resolving
  edges, coherent dates, FK resolution, bounded edge props).
- Markets/channels ref_id sets unchanged. No PII. Realistic figures.

---

## 2. Plan

**Phase 1 — data (`scripts/expand-kg-kestrel.ts`):**
- Kestrel brand satellite nodes + brand-structure / contract / budget edges.
- +59 people → 100, weighted to fill channel gaps; HAS_SKILL + EXPERIENCED_IN
  (channel & category) + EMPLOYED_BY/BELONGS_TO/HAS_ROLE edges; availability.
- +70 campaigns → 80 across both brands; per campaign: executions (relay-typed,
  market×channel), execution-links (PART_OF/TARGETS/DELIVERS_IN/LED_BY/
  REQUIRES_APPROVAL), approval-steps (+approvals edges incl APPROVED_BY),
  campaign-structure (ORCHESTRATES/COMMISSIONED_BY/DRAWS_FROM), cost-lines,
  time-tracking, media-spend, and agent-usage for recent digital execs.
- Run + `npm run validate-kg`; fix until clean.

**Phase 2 — briefing brand-awareness:**
- `BriefInput.brand_id`; client selector in the form.
- `buildContext` filters/weights comparables + budget/delivery to the brand;
  category match + prompt client name parameterised by brand.

---

## 3. Execute (done, 2026-06-23)

- `scripts/expand-kg-kestrel.ts` (seeded, append-only) generated: Kestrel brand
  satellite; bench 41→118 covering every channel (B2B 10, Research 7, UX 9,
  Event 8, POSM 16, SEO 11, …); 70 new campaigns → 80 (42 Kestrel / 38
  Aurelune) with full cascade (+~620 executions, +3,869 cost-lines, +6,699
  time, +204 media, +71 agent-usage) and all linking edges.
- Briefing brand-awareness: `BriefInput.brand_id`; `getBrands` loader;
  campaign→brand resolver (COMMISSIONED_BY → brand-team → OWNS); comparables,
  approvals, budget composition and delivery all brand-scoped; category match +
  prompt client name/category parameterised by brand. Client selector + 2
  Kestrel demo briefs in the UI.

## 4. Verify (done, 2026-06-23)

- `npm run validate-kg` PASSED (warnings only — budget over-draw + overload,
  both warn-don't-fail and feed capacity signals).
- `npm run build` exit 0.
- Stream smoke test: Kestrel brief → Kestrel comparables (Flagship Opening,
  Trail Season) + Kestrel team; Aurelune brief → Aurelune comparables (DE
  Rebuild, Always-On D2C) + different team. Brand scoping confirmed distinct.

## 5. Land

Shipped on `main` once committed.
