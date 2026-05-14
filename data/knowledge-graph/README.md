# Aurelune × Halo & Helix — Knowledge Graph Sample Data

Sample knowledge-graph dataset for the WEBChecker platform. Models a fictional global beauty brand (**Aurelune**) being run by a fictional independent agency (**Halo & Helix**) across 6 markets and 12 channels, 2024 through H1 2026.

See [`/docs/knowledge-graph.md`](../../docs/knowledge-graph.md) for the design rationale.

## Layout

```
/data/knowledge-graph/
├── README.md                   ← This file
├── schema.json                 ← Machine-readable schema (node types, edge types, required props)
├── /brand-book/                ← The "creative" half — markdown + SVG, ingestible by Brand SME agents
│   ├── positioning.md
│   ├── tone-of-voice.md
│   ├── visual-identity.md
│   ├── product-copy-framework.md
│   ├── /personas/              ← Consumer-facing personas (one .md per persona)
│   ├── /channel-style/         ← Per-channel voice + format addenda
│   └── /assets/                ← SVG logos + palette + imagery briefs
├── /nodes/                     ← One JSON file per node type (arrays of objects)
├── /edges/                     ← Edges grouped by domain
└── /tables/                    ← High-volume tabular data as CSV
```

## Quick agent guide

If you're an agent reading this graph, here's how to navigate:

| You want to… | Read these |
|---|---|
| Understand who the brand is | `brand-book/positioning.md`, `brand-book/tone-of-voice.md`, `nodes/brand.json`, `nodes/personas.json` |
| Find the right person for a brief | `nodes/people.json` + `edges/agency-structure.json` (HAS_SKILL, EXPERIENCED_IN edges carry proficiency + years) |
| See historical budget performance | `nodes/budgets.json`, `nodes/campaigns.json`, `nodes/executions.json` (budget_planned vs budget_actual), `tables/cost-lines.csv` |
| See historical schedule performance | `nodes/executions.json` (planned vs actual dates) + `nodes/approval-steps.json` |
| Understand a market's specifics | `nodes/markets.json` + `edges/brand-structure.json` (look for OPERATES_IN, AVAILABLE_IN, INCLUDES_SEGMENT) + `brand-book/channel-style/` |
| Recreate the dataset | `npm run generate-kg-fixtures` (regenerates the procedural parts deterministically from hand-curated seeds) |

## Hand-curated vs procedurally generated

Some files are hand-authored. Others are produced by `scripts/generate-kg-fixtures.ts` from the hand-authored seeds. Both are checked in — but if you edit a generated file directly, it will be overwritten next time the generator runs.

| Hand-curated | Procedurally generated |
|---|---|
| `schema.json` | `nodes/campaigns.json` |
| `brand-book/*` | `nodes/executions.json` |
| `nodes/brand.json` | `nodes/approval-steps.json` |
| `nodes/brand-teams.json` | `nodes/assets.json` |
| `nodes/brand-people.json` | `nodes/asset-variants.json` |
| `nodes/products.json` | `edges/campaign-structure.json` |
| `nodes/brand-assets.json` | `edges/execution-links.json` |
| `nodes/brand-guidelines.json` | `edges/approvals.json` |
| `nodes/personas.json` | `edges/staffing.json` |
| `nodes/audiences.json` | `tables/cost-lines.csv` |
| `nodes/segments.json` | `tables/time-tracking.csv` |
| `nodes/categories.json` | `tables/media-spend.csv` |
| `nodes/markets.json` | |
| `nodes/channels.json` | |
| `nodes/budgets.json` | |
| `nodes/agency.json` | |
| `nodes/departments.json` | |
| `nodes/roles.json` | |
| `nodes/skills.json` | |
| `nodes/people.json` | |
| `nodes/contracts.json` | |
| `nodes/objectives.json` | |
| `nodes/kpis.json` | |
| `edges/brand-structure.json` | |
| `edges/agency-structure.json` | |
| `edges/budget.json` | |
| `edges/contract.json` | |

## Validation

```bash
npm run validate-kg
```

Checks referential integrity (every edge / CSV FK resolves), date coherence, cost-line math, budget rollups, and capacity overload warnings. See `scripts/validate-kg.ts`.

## Not yet wired in

This dataset is **standalone seed data** for now. The WEBChecker app does not read it yet. A future PR will add Supabase loaders and agent endpoints.
