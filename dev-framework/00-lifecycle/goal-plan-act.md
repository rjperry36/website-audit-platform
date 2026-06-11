---
description: The Goal–Plan–Act engine that runs inside Phase 2 (Plan) and Phase 4 (Execute)
last_reviewed: 2026-05-18
review_cadence_days: 180
---

# The Goal–Plan–Act Engine

A three-step engine that runs inside Phase 2 and Phase 4 of the lifecycle. Its job is to force structured thinking *before* any file is touched and to keep execution honest — for humans and for AI agents alike.

The engine is the framework's anti-hallucination, anti-scope-creep, anti-cowboy-coding firewall.

---

## Why this engine exists

Without it, contributors:

- Start coding before fully understanding the task
- Hallucinate field names, API shapes, business rules, brand rules
- Waste effort reading documents they don't need (and skip the ones they do)
- Make decisions that contradict earlier decisions made elsewhere
- "Fix unrelated issues while they're in there" — and break things

GPA forces a tight loop: state the goal, write the plan, execute the plan. The Plan step is the firewall: **if the plan is correct, the deliverable will be correct**.

---

## The three steps

### GOAL — *"What are we building and why?"*

**Do:**

1. Read the task brief (provided by whoever is assigning the work — never self-assigned).
2. Read the relevant scope's `Frame` section.
3. Read the relevant discipline `_index.md` files (and *only* the named standards inside — not the whole library).
4. State the goal in one sentence.
5. State every assumption being made.
6. Flag every ambiguity — **do not resolve ambiguity by guessing**.

**Output:** a written Goal statement (3–5 lines max). No code, no design, no copy yet.

**Reviewer (the person delegating the work) approves the Goal before Plan starts.**

---

### PLAN — *"Exactly what will we do, in what order?"*

**Do:**

1. List every file, screen, asset, test, page, or runbook that will be created or modified — exact paths.
2. For code: list every function, component, or schema change with its signature.
3. List every test that will be written or executed.
4. Identify any blocking dependencies ("this requires X to exist first").
5. Identify any decision **not** covered by an existing decision record or scope — flag it for resolution.
6. Reference the exact standard, decision record, or spec section that justifies each non-obvious decision.

**Output:** a written Plan saved as a `Plan` section inside the scope file (or, for large work, as a separate file under `plans/<feature>-<task>.md`).

**Rules:**
- Plan references real paths — not hypothetical ones.
- Plan references decision-record numbers (e.g. `ADR-007`) for every non-obvious decision.
- If a field name, type, business rule, brand rule, or acceptance criterion isn't confirmed in a scope, standard, or decision record — **write `CONFIRM: <question>` and stop.**

**Reviewer approves the Plan before any Act step begins.**

---

### ACT — *"Execute the plan exactly as written."*

**Do:**

1. Work through the plan **sequentially** — one step at a time.
2. Mark each step done as it completes.
3. If reality differs from the plan (file doesn't exist, type is wrong, rule conflicts) — **stop and report**. Do not improvise.
4. Run the discipline-required in-flight checks (type-check, lint, visual check, accessibility check, etc.) after each step.
5. At the end, report:
   - What was done
   - What was skipped (and why)
   - Any new `CONFIRM:` questions raised
   - Any deviations from the plan and the rationale

**Do NOT:**

- Add features not in the plan ("scope creep").
- Rename or refactor things for "consistency" without a plan step.
- Fix unrelated issues discovered during Act — log them instead.
- Make architectural or business decisions without flagging them and pausing.

---

## The `CONFIRM:` stop rule

The single most important rule in the whole framework.

When uncertain about a fact (column name, business rule, brand requirement, acceptance criterion, vendor capability, regulatory constraint, etc.), the contributor writes:

```
CONFIRM: <the specific question>
```

…and **stops**.

`CONFIRM:` is a hard stop, not a hint. It blocks Plan from being approved and blocks Act from starting. Resolution happens by:

1. Reading the relevant scope, standard, or decision record.
2. Asking the project owner directly.
3. If neither resolves it, the assumption is escalated to a decision record.

**Guessing is never acceptable.** A guessed answer that happens to be right is still a guess — the next contributor may guess differently. The framework treats unconfirmed assumptions as zero-confidence and surfaces them.

---

## Anti-hallucination rules

These apply at all times, to all contributors — including AI agents and the most senior person on the team.

| Rule | Prevents |
|------|----------|
| Never assume a DB column name — read the schema file | Wrong field references, runtime errors |
| Never assume a price, rate, or business value — read the source data | Wrong financial outcomes |
| Never assume an API shape — read the route handler or types | Broken integrations |
| Never assume a business rule — reference a decision record or scope | Decisions made twice, differently |
| Never assume a brand rule — reference the brand book | Off-brand output, voice drift |
| If uncertain, write `CONFIRM: <question>` and stop | Silent wrong assumptions |
| Every non-obvious decision references a record by number | Lost rationale |
| Do not read full feature files when a scope summary will do | Context overload, wasted effort |

---

## Memory-efficiency rules (especially for agents)

The goal is for a contributor to start with a brief and spend ≤ 2 minutes reading before writing their Plan.

### Reading priority order

```
1. Task brief                                                       ← always
2. Scope file's Frame + Standards Applied sections                  ← always
3. The named standards inside the relevant disciplines              ← always
4. The schema / source of truth (DB, API spec, brand book)          ← only if directly touched
5. The specific existing file you're modifying                      ← only if modifying it
6. Full feature specs / requirements docs                           ← only if the scope explicitly says so
```

### What contributors should NEVER read upfront

- The full technical-requirements / discovery document set
- The full design system document, when a single section would do
- Standards for disciplines that are not enabled on this scope
- Decision records that aren't in the scope's "Standards Applied" list

### The briefer's responsibility

Whoever assigns the work (a person or Main Claude in an agentic setup) is responsible for writing briefs that include:

- The exact scope file to read
- The exact standards files to read
- The exact decision records that apply (by number)
- The exact existing files to read (if any)
- *Nothing else*

If a brief contains "read the technical requirements," that's a failure — it means the scope or standards are missing a rule that should be there.

---

## The Plan file format

For non-trivial work, the Plan is its own file under `plans/<feature>-<task>.md`. Template:

```markdown
# Plan: <Feature> — <Task>

## Goal
<one sentence>

## Assumptions
- <list any, or "None.">

## Standards Applied
- <discipline>/<standard>.md — <one-line summary of how it applies>
- <discipline>/<standard>.md — ...

## Decision Records Applied
- DR-NNNN — <title> — <how it applies>
- DR-NNNN — ...

## CONFIRMs — Unresolved Questions
<!-- STOP if any exist. Resolve before Act. -->
<!-- Format: CONFIRM: <question>  →  <answer once resolved> -->

## Files to Create
<exact paths>

## Files to Modify
<exact paths + what changes>

## Functions / Components / Schema / Assets
| Name | File | Description |
|------|------|-------------|
|      |      |             |

## Step Order (Act sequence)
1.
2.
3.

## Tests / Checks to Run
<unit tests, integration tests, manual checks, design audits, etc.>

## Definition of Done
- [ ] Type-check passes (if code)
- [ ] Tests pass
- [ ] Discipline verification checklists green (Phase 5)
- [ ] No `CONFIRM:` open
- [ ] Scope file updated
```

For small work, the Plan can live inside the scope file's `## 2. Plan` section instead.

---

## Applying GPA to delegated or agentic work

When work is delegated (to a contributor, a contractor, or an AI agent):

```
Goal phase:  The delegator reads scope + standards → writes the brief
Plan phase:  The delegate writes the Plan        → delegator approves
Act phase:   The delegate executes                → delegator reviews output
```

The delegator never skips Plan review. If a Plan submits with a `CONFIRM:` question, work stops until the question is answered.

---

## What GPA explicitly does NOT do

- **It does not slow down small work.** A typo fix is one Goal sentence, a one-line Plan, and one Act step. Total overhead: under a minute.
- **It does not replace discipline standards.** The standards live in `01-disciplines/`. GPA forces them to be read at the right time.
- **It does not require an AI agent.** It works just as well with humans. The agentic case is one application, not the engine's reason for existing.
