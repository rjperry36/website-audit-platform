# Knowledge Graph Data Strategy

**Status:** Draft v2 — incorporating review feedback
**Branch:** `feature/knowledge-graph-data-strategy`
**Owner:** Russell

---

## 1. Goal

Model the world of a marketing agency orchestrating a global brand launch across markets and channels — as a knowledge graph — and seed it with rich, fictional sample data that can drive platform development and serve as the substrate for **multiple downstream AI agents** acting as Subject Matter Experts and Site Reliability Engineers (capacity planning, budget insight, optimal staffing, briefing assistant, etc.).

The graph captures:

- The **brand identity** (positioning, tone of voice, visual identity, products with costs, consumer personas, audiences and segments, brand assets like logo / product / lifestyle imagery)
- The **brand commercial structure** (global + local market teams, named client stakeholders, annual budgets per market per year)
- The **agency** (departments, roles, people with skills + channel + category experience, daily rates and markups, capacity)
- The **commercial relationship** (contracts, cost lines, media spend, time tracking, budget variance: on / over / under)
- The **work** (campaigns, executions, global asset creation, localisation, local campaigns)
- The **outputs** (assets and their localised variants)
- The **outcomes** (objectives, KPIs)
- The **governance** (approval steps with planned vs actual duration — both internal-agency and client-side, so the data shows on-time, late-internal, late-client patterns)

The KG is authored as JSON + CSV + a small `/brand-book/` folder of markdown + SVG, all under `/data/knowledge-graph/`. It is **parallel** to the existing Supabase schema — KG nodes for shared concepts (Market, Channel) reference existing Supabase IDs rather than redefining them. Existing tables are not modified.

---

## 2. The fictional brand — Aurelune

**Aurelune** — premium science-led skincare.

| Attribute | Value |
|---|---|
| Founded | 2019, London |
| Category | Prestige skincare (CeraVe → La Mer mid-tier) |
| Positioning | "Skincare in sync — formulas designed around your skin's circadian rhythm" |
| Hero ingredients | Encapsulated retinoids (PM line), bakuchiol, niacinamide, plant peptides, oat-derived ceramides |
| Price tier | £40–£120 / SKU |
| Distribution | D2C (`aurelune.com`), Sephora-style premium retail (`B2B2C`), select department stores, prestige spa/salon (`B2B`) |
| Markets in scope | UK (HQ, 2019), US (2021), DE + FR (2022), JP (2023), CN (cross-border, 2024) |
| Why this brand | Beauty is channel-rich (all 12 channels apply), lightly regulated, with a strong global-to-local localisation story (formulas, claims, packaging, copy and tone all shift per market). |

The brand bible — positioning statement, voice principles, do/don't words, visual identity, product copy framework, channel-style addenda, and named consumer personas — lives in `/data/knowledge-graph/brand-book/` as markdown so it's both human-readable and ingestible by agents.

**Agency: Halo & Helix.** Independent integrated agency. London / NYC / Singapore. Won the global Aurelune account in late 2023, fully operational from Q1 2024. ~40 people across 7 departments. Acts as both global lead agency and local-market agency in UK and US; partners with local production houses in DE / FR / JP / CN for in-market execution.

---

## 3. Knowledge graph model

### 3.1 Node types

Every node has: `id` (prefixed slug), `type`, and a `properties` object. See [`schema.json`](../data/knowledge-graph/schema.json) for the machine-readable spec.

| Type | Purpose | ID example | Count |
|---|---|---|---|
| `Brand` | The client brand | `brand:aurelune` | 1 |
| `BrandTeam` | Global brand team or local market team | `brand-team:aurelune-uk` | 7 (1 global + 6 local) |
| `BrandPerson` | Named client-side stakeholder | `brand-person:sarah-whitman` | 10–15 |
| `Product` | Aurelune SKU with COGS / retail price / margin | `product:retinoid-pm-serum` | 8–15 |
| `BrandAsset` | Logo, product image, lifestyle image, brand asset | `brand-asset:logo-primary` | 30–60 |
| `BrandGuideline` | Brand book document (markdown reference) | `brand-guideline:tone-of-voice` | 6–8 |
| `Persona` | Consumer-facing persona | `persona:performance-pip` | 4–5 |
| `Audience` | Audience definition | `audience:millennial-skin-investors` | 4–5 |
| `Segment` | Segmentation row (demo / psychographic / behavioural) | `segment:high-loyalty-uk` | 10–15 |
| `Market` | Geography. Mirrors `markets.id` in Supabase. | `market:UK` | 6 |
| `Channel` | Marketing channel. Mirrors `channels.id`. | `channel:PAID_MEDIA` | 12 |
| `Budget` | Annual brand-team budget | `budget:aurelune-uk-2025` | 21 (7 teams × 3 years) |
| `Agency` | The agency entity | `agency:halo-helix` | 1 |
| `Department` | Department within agency | `dept:creative` | 7 |
| `Role` | Job title within a department | `role:strategy-director` | ~18 |
| `Skill` | Skill in the agency taxonomy | `skill:paid-search` | 25–35 |
| `Person` | Agency team member (see §3.4 for properties) | `person:maya-chen` | ~40 |
| `Contract` | Agency–brand agreement | `contract:aurelune-master-2024` | 3 (1 master + 2 local addenda) |
| `Campaign` | Coordinated set of executions tied to objectives | `campaign:spring-2025-retinoid-pm` | ~10 |
| `Execution` | Single piece of work delivered | `execution:exec-2025-04-001` | 120–180 |
| `ApprovalStep` | Approval gate on an Execution (internal or client) | `approval:exec-2025-04-001-internal` | ~300 (2 per execution) |
| `Asset` | Global master deliverable from an execution | `asset:asset-2025-018` | 30–50 |
| `AssetVariant` | Localised version of an asset | `asset-variant:asset-2025-018-fr` | 150–250 |
| `Objective` | Business objective. Optionally links to `standard_objectives.id`. | `objective:obj-001` | 20–30 |
| `KPI` | Measurable KPI under an objective | `kpi:kpi-001` | 40–60 |

### 3.2 Edge types

Each edge has: `from`, `to`, `type`, optional `properties`.

| Edge | From → To | Meaning |
|---|---|---|
| `OWNS` | Brand → BrandTeam | Brand has teams |
| `OPERATES_IN` | BrandTeam → Market | Local team owns a market |
| `STAKEHOLDER_OF` | BrandPerson → BrandTeam | Named client person sits on a team |
| `SELLS` | Brand → Product | Brand sells these SKUs |
| `AVAILABLE_IN` | Product → Market | Per-market product availability + local SRP |
| `DEPICTS` | BrandAsset → Product | Imagery showing a product |
| `GOVERNED_BY` | Brand → BrandGuideline | Brand bible reference |
| `TARGETS_AUDIENCE` | Brand → Audience / Campaign → Audience | Audiences in scope |
| `INCLUDES_SEGMENT` | Audience → Segment | Audience composition |
| `EMBODIED_BY` | Brand → Persona | Consumer personas the brand serves |
| `ALLOCATED_TO` | Budget → BrandTeam | Budget per team per year |
| `DRAWS_FROM` | Campaign → Budget | Campaign spends against a budget |
| `GOVERNS` | Contract → Brand | Contract governs the brand work |
| `SIGNED_BY` | Contract → Agency | Agency is the signed party |
| `EMPLOYED_BY` | Person → Agency | Employer |
| `BELONGS_TO` | Person → Department | Org structure |
| `HAS_ROLE` | Person → Role | Job role |
| `HAS_SKILL` | Person → Skill | With `proficiency: 1–5` property on the edge |
| `EXPERIENCED_IN` | Person → Channel / Person → Category | With `years` property on the edge |
| `ORCHESTRATES` | Agency → Campaign | Agency runs the campaign |
| `COMMISSIONED_BY` | Campaign → BrandTeam | Who asked for it |
| `RUNS_IN` | Campaign → Market | Markets in scope |
| `USES_CHANNEL` | Campaign → Channel | Channels in scope |
| `HAS_OBJECTIVE` | Campaign → Objective | Objectives the campaign serves |
| `MEASURED_BY` | Objective → KPI | KPIs under an objective |
| `PART_OF` | Execution → Campaign | Execution rolls up to a campaign |
| `TARGETS` | Execution → Market | Local market the execution serves |
| `DELIVERS_IN` | Execution → Channel | Channel of delivery |
| `PRODUCES` | Execution → Asset | Execution outputs assets |
| `LOCALISES` | AssetVariant → Asset | Variant of the global master |
| `REQUIRES_APPROVAL` | Execution → ApprovalStep | Approval gates |
| `APPROVED_BY` | ApprovalStep → Person / BrandPerson | Who approves |
| `LED_BY` | Execution → Person | Owner / lead |
| `ASSIGNED_TO` | Person → Execution | Staffing assignment with `role`, `planned_hours`, `actual_hours` |

Execution carries an `execution_type` property: `global_asset_creation` | `localisation` | `local_campaign` — so the same node type covers all three orchestration modes.

### 3.3 Person node properties (the staffing-optimisation surface)

```jsonc
{
  "id": "person:maya-chen",
  "type": "Person",
  "properties": {
    "name": "Maya Chen",
    "department_id": "dept:strategy",
    "role_id": "role:strategy-director",
    "seniority": "director",                // junior | mid | senior | lead | director
    "office": "London",
    "start_date": "2021-03-15",
    "daily_rate_gbp": 1200,
    "client_markup_pct": 0.85,              // -> billed at £2220/day
    "capacity_hours_per_week": 32,          // 80% of 40h
    "utilisation_target_pct": 0.75
  }
}
```

Skills, channel experience, and category experience are modelled as **edges** carrying properties, not embedded in the node — so the staffing-optimisation agent can query "all Senior+ people with `proficiency>=4` in `skill:paid-search` and `years>=3` in `category:skincare`" naturally.

```jsonc
// edges/agency-structure.json
{ "from": "person:maya-chen", "to": "skill:positioning",     "type": "HAS_SKILL",     "properties": { "proficiency": 5 } }
{ "from": "person:maya-chen", "to": "skill:brand-strategy",  "type": "HAS_SKILL",     "properties": { "proficiency": 5 } }
{ "from": "person:maya-chen", "to": "channel:SOCIAL_MEDIA",  "type": "EXPERIENCED_IN","properties": { "years": 7 } }
{ "from": "person:maya-chen", "to": "category:skincare",     "type": "EXPERIENCED_IN","properties": { "years": 4 } }
```

Categories are a small enum (`beauty`, `skincare`, `wellness`, `food-beverage`, `fashion`, `tech`, …) — represented as nodes in `nodes/categories.json` so they're queryable.

### 3.4 Approval process

Each execution carries **two approval gates** by default:

| Gate | Approver side | Average planned duration | Source of variance |
|---|---|---|---|
| `internal_review` | Agency-side senior (Strategy Director / ECD / Account Director depending on execution_type) | 5 working days | Sometimes overruns to 7–10 days |
| `client_review` | Brand-side stakeholder (`BrandPerson`) | 3 working days | Sometimes overruns to 5–8 days |

Each `ApprovalStep` node carries:

```jsonc
{
  "id": "approval:exec-2025-04-001-internal",
  "type": "ApprovalStep",
  "properties": {
    "gate": "internal_review",
    "planned_duration_days": 5,
    "actual_duration_days": 7,
    "planned_start": "2025-04-14",
    "planned_end": "2025-04-21",
    "actual_start": "2025-04-14",
    "actual_end": "2025-04-23",
    "status": "approved",                   // pending | approved | rejected | bypassed
    "outcome": "approved_with_revisions"
  }
}
```

This is what makes historical data trainable: an agent can learn "executions in `OOH` for `market:JP` historically take 7+ days internal review and 5+ days client review — plan accordingly."

### 3.5 Budget variance

Each `Execution` carries `budget_planned` and `budget_actual` (currency in `Contract`). `~⅓` of historical executions are on budget, `~⅓` are over (+5% to +30%), `~⅓` are under (−5% to −20%). Same distribution applies to the `ApprovalStep` schedule variance.

Each `Campaign` aggregates its executions and also carries planned vs actual at the campaign level.

Each `Budget` (per BrandTeam, per year) carries `allocated_amount` and rolls up `spent_amount` from campaigns drawing against it.

### 3.6 Tabular data (CSV)

High-volume, append-mostly data is kept in CSVs rather than JSON:

| File | Columns | Approx rows |
|---|---|---|
| `tables/cost-lines.csv` | `cost_line_id, execution_id, contract_id, person_id, role_id, line_type, units, unit_cost, markup_pct, currency, billed_date, notes` | 1000–1500 |
| `tables/time-tracking.csv` | `time_entry_id, execution_id, person_id, week_starting, planned_hours, actual_hours, notes` | 4000–6000 (sampled, not exhaustive) |
| `tables/media-spend.csv` | `media_spend_id, execution_id, market_id, channel_id, platform, planned_spend, actual_spend, currency, period_start, period_end` | 60–100 |

`line_type` values: `fee_time` (billable time), `fee_pass_through` (third-party invoice), `production_cost`, `media_spend`, `localisation_cost`, `expense`.

---

## 4. File layout

```
/data/knowledge-graph/
  README.md                       ← How to read/edit the KG + how agents should query it
  schema.json                     ← Machine-readable schema for nodes + edges
  /brand-book/                    ← Brand content (the "creative" half of the dataset)
    positioning.md
    tone-of-voice.md
    visual-identity.md
    product-copy-framework.md
    /personas/
      performance-pip.md
      ritual-rina.md
      science-sven.md
      gentle-gemma.md
    /channel-style/
      social.md
      ooh.md
      ecrm.md
      d2c.md
    /assets/
      logo-primary.svg            ← real SVG
      logo-mark.svg               ← real SVG
      logo-wordmark.svg           ← real SVG
      palette.svg                 ← real SVG colour palette
      imagery-specs.md            ← detailed briefs for product + lifestyle imagery
      .placeholders/.gitkeep      ← real image files generated separately
  /nodes/
    brand.json
    brand-teams.json
    brand-people.json
    products.json
    brand-assets.json
    brand-guidelines.json
    personas.json
    audiences.json
    segments.json
    categories.json
    markets.json
    channels.json
    budgets.json
    agency.json
    departments.json
    roles.json
    skills.json
    people.json
    contracts.json
    campaigns.json
    executions.json
    approval-steps.json
    assets.json
    asset-variants.json
    objectives.json
    kpis.json
  /edges/
    brand-structure.json          ← OWNS, OPERATES_IN, STAKEHOLDER_OF, SELLS, AVAILABLE_IN, DEPICTS, GOVERNED_BY, TARGETS_AUDIENCE, INCLUDES_SEGMENT, EMBODIED_BY
    budget.json                   ← ALLOCATED_TO, DRAWS_FROM
    agency-structure.json         ← EMPLOYED_BY, BELONGS_TO, HAS_ROLE, HAS_SKILL, EXPERIENCED_IN
    contract.json                 ← GOVERNS, SIGNED_BY
    campaign-structure.json       ← ORCHESTRATES, COMMISSIONED_BY, RUNS_IN, USES_CHANNEL, HAS_OBJECTIVE, MEASURED_BY
    execution-links.json          ← PART_OF, TARGETS, DELIVERS_IN, PRODUCES, LOCALISES
    approvals.json                ← REQUIRES_APPROVAL, APPROVED_BY
    staffing.json                 ← LED_BY, ASSIGNED_TO
  /tables/
    cost-lines.csv
    time-tracking.csv
    media-spend.csv

scripts/validate-kg.ts            ← Validator: referential integrity, math consistency, dates, CSV FKs
```

---

## 5. Scale (Rich dataset)

| Concept | Count |
|---|---|
| Brand | 1 |
| BrandTeams | 7 (global + 6 markets) |
| BrandPeople | 10–15 |
| Products | 8–15 |
| BrandAssets | 30–60 |
| BrandGuidelines | 6–8 (one per markdown doc) |
| Personas | 4–5 |
| Audiences | 4–5 |
| Segments | 10–15 |
| Categories | 8–10 |
| Markets | 6 |
| Channels | 12 |
| Budgets | 21 (7 teams × 3 years) |
| Agency | 1 |
| Departments | 7 |
| Roles | ~18 |
| Skills | 25–35 |
| People | ~40 |
| Contracts | 3 |
| Years covered | 2024 – H1 2026 |
| Campaigns | ~10 |
| Executions | 120–180 |
| ApprovalSteps | ~300 (2 per execution) |
| Assets (global masters) | 30–50 |
| AssetVariants (localised) | 150–250 |
| Objectives | 20–30 |
| KPIs | 40–60 |
| Cost lines (CSV) | 1000–1500 |
| Time entries (CSV) | 4000–6000 (sampled) |
| Media spend rows (CSV) | 60–100 |

Department headcount target:

| Department | Headcount |
|---|---|
| Client Services | 5 |
| Strategy | 4 |
| Project Planning | 5 |
| New Business | 2 |
| Accounts (Finance) | 3 |
| Creative | 11 |
| Channel Experts | 10 |
| **Total** | **40** |

---

## 6. ID conventions

| Type | Prefix | Format |
|---|---|---|
| Brand | `brand:` | `brand:aurelune` |
| BrandTeam | `brand-team:` | `brand-team:aurelune-uk` |
| BrandPerson | `brand-person:` | `brand-person:sarah-whitman` |
| Product | `product:` | `product:retinoid-pm-serum` |
| BrandAsset | `brand-asset:` | `brand-asset:logo-primary` |
| BrandGuideline | `brand-guideline:` | `brand-guideline:tone-of-voice` |
| Persona | `persona:` | `persona:performance-pip` |
| Audience | `audience:` | `audience:millennial-skin-investors` |
| Segment | `segment:` | `segment:high-loyalty-uk` |
| Category | `category:` | `category:skincare` |
| Market | `market:` | `market:UK` (matches Supabase) |
| Channel | `channel:` | `channel:PAID_MEDIA` (matches Supabase) |
| Budget | `budget:` | `budget:aurelune-uk-2025` |
| Agency | `agency:` | `agency:halo-helix` |
| Department | `dept:` | `dept:creative` |
| Role | `role:` | `role:strategy-director` |
| Skill | `skill:` | `skill:paid-search` |
| Person | `person:` | `person:maya-chen` |
| Contract | `contract:` | `contract:aurelune-master-2024` |
| Campaign | `campaign:` | `campaign:spring-2025-retinoid-pm` |
| Execution | `execution:` | `execution:exec-2025-04-001` (year-sequential) |
| ApprovalStep | `approval:` | `approval:exec-2025-04-001-internal` |
| Asset | `asset:` | `asset:asset-2025-018` |
| AssetVariant | `asset-variant:` | `asset-variant:asset-2025-018-fr` |
| Objective | `objective:` | `objective:obj-001` |
| KPI | `kpi:` | `kpi:kpi-001` |

CSV row IDs use `cl-`, `te-`, `ms-` prefixes.

---

## 7. Validation rules

`scripts/validate-kg.ts` will enforce:

1. **No duplicate node IDs.**
2. **Every edge's `from` and `to` reference an existing node.**
3. **Every `Market.ref_id` and `Channel.ref_id` matches a Supabase seed.**
4. **Every CSV foreign key (`execution_id`, `person_id`, `contract_id`, `market_id`, `channel_id`) resolves.**
5. **Execution dates coherent** (`planned_start ≤ planned_end`, `actual_end ≥ actual_start`).
6. **ApprovalStep dates** sit inside the parent execution's planned/actual window.
7. **Cost-line math** internally consistent (`billed = units × unit_cost × (1 + markup_pct)` within rounding).
8. **Budget rollup** — sum of campaign `spent_amount` drawing from a Budget ≤ Budget `allocated_amount` (warn only — overruns are allowed and meaningful).
9. **Time entries** — sum of `actual_hours` per person per week ≤ `capacity_hours_per_week` × 1.25 (warn on overload).
10. **Skill / channel / category edge proficiency and years** values are within bounds (1–5 / 0–20).

Runs as `npm run validate-kg`. CI gate later.

---

## 8. What this design deliberately does **not** do (yet)

- **No app integration.** Platform doesn't read the KG yet. This branch adds data + design + validator only. Loaders / UI / agent endpoints come later.
- **No Supabase migration.** Existing tables untouched. A future PR can add `kg_nodes` / `kg_edges` tables (or per-type tables) and seed them from these files.
- **No graph DB.** File-based. Swap to Neo4j / Postgres-as-graph later without rewriting the source of truth.
- **No real product / lifestyle imagery.** I'll author SVG logos + colour palette + detailed image briefs in `/brand-book/assets/imagery-specs.md`. Actual product / lifestyle imagery is a separate image-gen step (Midjourney / FLUX / etc.) that drops files into `/brand-book/assets/.placeholders/` per the specs. The KG nodes reference the eventual file paths.

---

## 9. Agent-readiness (the "why" for the new fields)

Each of the additions above maps to a concrete future agent capability:

| Agent / capability | KG fields it relies on |
|---|---|
| **Capacity planning** ("can the team take on this brief in Q3?") | `Person.capacity_hours_per_week`, `time-tracking.csv` actual vs planned, executions in flight |
| **Optimal staffing** ("who's the right team for a PAID_MEDIA × skincare brief?") | `Person.seniority`, `HAS_SKILL.proficiency`, `EXPERIENCED_IN.years` on Channel + Category, availability from time-tracking |
| **Budget insight** ("are we trending over or under on FY25?") | `Budget`, `Execution.budget_planned/actual`, `cost-lines.csv`, `Campaign.spent_amount` |
| **Briefing assistant** ("based on history, what should the budget and timeline be for this brief?") | Historical campaigns + executions with variance, approval-step durations, comparable channel × market patterns |
| **Brand SME** ("does this copy match our tone?") | `/brand-book/` markdown, `BrandGuideline` nodes, persona definitions |
| **Localisation copilot** ("how does this asset need to change for JP?") | `AssetVariant` history, market-specific style addenda, segment composition per market |

This is the rationale for going beyond the minimum graph — the dataset is shaped to feed those future agents.

---

## 10. Open questions

After this v2, only a few small things to confirm before I start authoring files:

1. **Currency.** Master contract in GBP, with local-currency line items per market (USD, EUR, JPY, CNY)? Or convert everything to GBP at fixed rates for simplicity?
2. **Sensitive data realism.** Do you want realistic-feeling people names mixed across cultures (Maya Chen, Linus Schmidt, Aisha Bello…), or keep it bland? I'll go culturally varied if not told otherwise.
3. **Image generation now or later?** Confirm I should ship SVG logos + colour palette + image briefs, and leave actual product/lifestyle photography for a follow-up. Or do you want me to generate placeholder PNGs (low-fidelity) inline?

If those are quick yeses I'll start scaffolding immediately after.
