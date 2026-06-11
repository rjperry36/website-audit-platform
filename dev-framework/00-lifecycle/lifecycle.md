---
description: The universal six-phase lifecycle every piece of work follows in this framework
last_reviewed: 2026-05-18
review_cadence_days: 180
---

# The Lifecycle

Every piece of work — a feature, a campaign, a bug fix, a vendor migration, a content drop, a security remediation — passes through these six phases. The phases are universal. What you *do* inside each phase depends on which disciplines the project has enabled and which standards the scope says apply.

The lifecycle is intentionally short. Detailed discipline-specific workflows (engineering 10-step strategies, content editorial cycles, change-management board procedures) are **specialisations** layered on top of these six phases — see §7.

---

## The phases at a glance

```
                                                ┌──────────────────────┐
                                                │  G6 — Landed gate    │
                                                └──────────▲───────────┘
                                                           │
                                                       6. LAND
                                                           ▲
                                                    ┌──────┴──────┐
                                                    │ G5 — Verified │
                                                    └──────▲──────┘
                                                           │
                                                       5. VERIFY
                                                           ▲
                                                    ┌──────┴──────┐
                                                    │  G4 — Built   │
                                                    └──────▲──────┘
                                                           │
                                                       4. EXECUTE  ◀── Goal–Plan–Act engine runs here
                                                           ▲
                                                    ┌──────┴──────┐
                                                    │ G3 — Standards Read │
                                                    └──────▲──────┘
                                                           │
                                                       3. STANDARDS CHECK
                                                           ▲
                                                    ┌──────┴──────┐
                                                    │ G2 — Planned │
                                                    └──────▲──────┘
                                                           │
                                                       2. PLAN
                                                           ▲
                                                    ┌──────┴──────┐
                                                    │ G1 — Framed  │
                                                    └──────▲──────┘
                                                           │
                                                       1. FRAME
                                                           ▲
                                                    [ piece of work starts ]
```

Each gate (G1–G6) is described in `gates.md`.

---

## Phase 1 — Frame

**Goal:** establish a shared understanding of what we're trying to do and why.

**Outcomes:**
- A one-paragraph problem statement
- The success criteria (what does "done" look like, observably?)
- Hard constraints (deadline, budget, technical, regulatory, brand)
- Stakeholders and decision-makers
- A draft list of risks and unknowns

**Output:** the opening sections of a new scope file under `scopes/` (template at `dev-framework/02-templates/scope.md`).

**Common mistakes:**
- Skipping straight to "approach" without writing the problem down
- Stating success in delivery terms ("ship the feature") rather than outcome terms ("users complete X in under N seconds")
- Leaving stakeholders implicit

---

## Phase 2 — Plan

**Goal:** choose an approach and weigh the alternatives, then write the plan in enough detail that someone else could critique it.

**Inside Plan, run the Goal–Plan–Act engine:**

1. **Goal** — state the goal in one sentence; capture every assumption.
2. **Plan** — list every file, function, test, decision, and external dependency that the work will create or change. Reference exact paths and signatures, not hypothetical ones. Reference each decision back to a standard or decision record.
3. (Act happens in Phase 4.)

See `goal-plan-act.md` for the full engine, the `CONFIRM:` stop rule, and the plan-file format.

**Outcomes:**
- The proposed approach
- Alternatives considered and why they were rejected
- The list of disciplines this scope will need to consult in Phase 3
- A rough cost / time / risk estimate
- All `CONFIRM:` questions resolved before this phase exits

**Output:** scope file's "Plan" and "Approach" sections populated. If this involves a cross-cutting decision, also open a decision record under `decisions/` using `dev-framework/02-templates/decision-record.md`.

**Hard rule:** if you cannot state the Goal in one sentence, you are not ready to plan. Go back to Phase 1.

---

## Phase 3 — Standards Check

**Goal:** read the rules that apply to this work *before* doing the work.

For each discipline the scope listed in Phase 2, open the corresponding standards files (`dev-framework/01-disciplines/<discipline>/`) and note:

- Which checklist items will apply during Execute and Verify
- Any deviations you intend to make from the standard (and why) — these go in the scope's "Planned Deviations" section
- Any standards that need updating because of new patterns this scope introduces — these become a follow-up

**Output:** scope file's "Standards Applied" section populated. Any deviations explicitly recorded.

**Why this is a separate phase:** standards read *during* execution are standards skipped. Reading them up front turns rules into design constraints, not afterthoughts retrofitted in Phase 5.

---

## Phase 4 — Execute

**Goal:** do the work.

What "execute" looks like depends entirely on the project and the disciplines:

- **Engineering scope** — write the code; run the type checker after every change; integrate with existing services.
- **UI/UX scope** — produce designs against the design system; mock interaction states; produce handoff artefacts.
- **Content scope** — draft, edit, generate visuals, schedule publishing.
- **InfoSec scope** — produce the threat model; remediate the finding; document evidence.
- **Operations scope** — stage the change; line up approvals; prepare comms; rehearse rollback.

**Inside Execute, the engine is the `Act` step of Goal–Plan–Act:**

1. Work through the plan **sequentially**, one step at a time.
2. Mark each step done as it completes.
3. If reality differs from the plan (file doesn't exist, type is wrong, rule conflicts, a `CONFIRM:` re-emerges) — **stop and report**. Do not improvise. Do not "fix unrelated issues while I'm here." Do not "rename things for consistency" without a plan step.
4. Run the discipline-specific in-flight checks (type checks after every change, lint, etc.) — see each discipline's `_index.md` for the list.

**Output:** the actual deliverable, plus an updated scope file recording the actual steps taken (the plan and the actual rarely match exactly — the delta is interesting).

---

## Phase 5 — Verify

**Goal:** confirm the work meets the standards listed in Phase 3.

The checks come from the disciplines. Examples:

| Discipline | Verification check |
|------------|--------------------|
| `engineering` | Tests pass; type-check clean; no SELECT-* on public endpoints; code review checklist signed |
| `ui` | Design-system compliance audit; responsive at all breakpoints; visual QA against mockup |
| `ux` | WCAG 2.1 AA audit; keyboard-only run-through; loading/error/empty states present |
| `qa` | Test plan executed; all P1/P2 defects resolved; regression pack clean |
| `uat` | UAT script executed by stakeholder; sign-off recorded |
| `infosec` | Security review checklist green; threat model up to date; no secrets in source; dependency audit clean |
| `content` | Brand voice review; SEO checklist; fact-check; legal review where needed |
| `operations` | Change record signed off; rollback plan documented; monitoring/alerts in place |
| `data` | Schema review; data inventory updated; retention set; access reviewed |

**Output:** a green-light checklist embedded in the scope file's "Verification" section. Any deviations or carve-outs explicitly recorded with rationale.

**Hard rule:** verification is not optional, regardless of how confident the team feels. Confidence after no checks is a vibe, not a result.

---

## Phase 6 — Land

**Goal:** ship the work and close the loop so future-you (or future-Claude) can find the trail.

**Activities:**

- Ship the deliverable (deploy / publish / release / hand off).
- Rename the scope to `feature-name.v1.md` (or `.v2` if it superseded a prior version) and mark `Status: Live`.
- Update `TODO.md` with the completion date and a link to the scope.
- If any decisions were made that aren't captured in a scope (cross-cutting or standalone), write a `/decisions/NNNN-*.md` using the decision-record template.
- Note any follow-up work in the scope's "Roadmap / Known Limitations" section.
- For production-affecting changes, append actuals (time taken, anything unexpected) to the change record.

**Output:** a versioned, referenceable record of the work.

---

## When to specialise

Some projects need a more detailed workflow than six phases — e.g. heavily-regulated engineering, content programmes with editorial calendars, ops teams running change advisory boards.

The pattern:

1. Keep this file unchanged as the **universal** frame.
2. Add a specialisation file (`lifecycle-<context>.md`) inside the project — for example `lifecycle-engineering.md` for an engineering team that wants a 10-step engineering workflow inside Phase 2–5, or `lifecycle-cab.md` for an ops team with a Change Advisory Board step inside Phase 5.
3. Reference the specialisation from the project's `CLAUDE.md` (or equivalent orchestrator) so the agent and the team know when to use which.

A specialisation **never replaces** the universal lifecycle; it sits inside one of its phases.

---

## Anti-patterns

The full anti-pattern list is in `anti-patterns.md`. The two cardinal sins:

- **Starting at Phase 4.** Tempting for "small" work. The price is paid in Phase 5 when standards weren't considered up front and have to be retrofitted, or worse, in production.
- **Treating Phase 6 as optional.** Without the record, the next piece of work loses the history. The 15 minutes spent here saves hours later — and protects the project against the bus factor.

---

## How long does each phase take?

A useful rough split for a 5-day piece of work:

```
Frame      ▍   5%
Plan       ████  20%
Standards  █▍   7%
Execute    ████████████  55%
Verify     ██   8%
Land       █▍   5%
```

For routine work the framing/planning percentage shrinks, but never to zero. For high-risk or novel work, Plan can exceed Execute — and that is the right shape.
