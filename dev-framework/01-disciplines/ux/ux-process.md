---
description: UX process — how user-facing work moves through the lifecycle
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# UX Process

How user-facing work is shaped, designed, validated, and shipped within the framework's lifecycle.

UX isn't a phase — it's a perspective that runs through every phase, with specific deliverables at each.

---

## 1. UX in each phase

| Phase | UX work | Output |
|-------|---------|--------|
| 1. Frame | Identify the user, the job-to-be-done, the success metric in user terms | Problem statement framed in user outcomes |
| 2. Plan | Sketch the flow, surface the IA, identify edge cases | Wireframes / flow diagram in the scope |
| 3. Standards | Apply visual + accessibility standards; reference relevant patterns | Standards listed in scope |
| 4. Execute | Produce designs, prototypes, or directly implement; test as you go | Designs, prototype, or shipped UI |
| 5. Verify | Accessibility audit; usability run-through; UAT if relevant | Verification checklist green |
| 6. Land | Update IA docs; capture learning; track usage post-launch | IA/journey docs updated; analytics/insight follow-up logged |

---

## 2. Fidelity matches phase

| Fidelity | When | Risk of using earlier than this |
|----------|------|---------------------------------|
| Sketches / lo-fi | Phase 1–2 — exploring ideas | Premature commitment to a layout |
| Wireframes | Phase 2 — structure decisions | Aesthetic debate when structure isn't agreed |
| Hi-fi mockups | Phase 3–4 — visual + content decisions | Polishing pixels on a flow that's wrong |
| Interactive prototype | Phase 4 — flow validation | Over-investing in tools when paper would tell you the same thing |

Match fidelity to the decision being made. High-fidelity prototypes for low-fidelity decisions waste time.

---

## 3. Edge cases and unhappy paths

UX is not just the happy path. Every flow has an enumeration of:

- **Empty state** — no data, no results, first-time user
- **Error state** — operation failed, network down, validation error
- **Loading state** — slow connection, intermediate UI
- **Long content** — extreme inputs, very long names, large numbers
- **Permission denied** — user lacks the right access
- **Concurrent action** — what if someone else changed the data while the user was on this screen
- **Multi-device** — what happens if the user switches device mid-flow
- **Accessibility** — keyboard-only, screen reader, low vision, motor impairment

Enumeration happens at Phase 2. Designs cover them by Phase 4. Verification confirms them at Phase 5.

---

## 4. Content and microcopy

UX copy is a UX deliverable, not a content afterthought. The interaction designer (or copy partner) writes:

- Button labels (verbs, not nouns: "Save changes," not "Submit")
- Empty-state copy (what to do next, in the user's words)
- Error messages (specific, actionable, calm)
- Form field labels and helper text
- Confirmation / success states
- Permissions / denial copy

The `content` discipline carries the wider voice and tone; this standard governs the interaction-level microcopy in cooperation.

---

## 5. Design handoff

When a UI scope leaves UX and enters engineering for implementation:

| Handoff includes | Why |
|------------------|-----|
| Final designs (or annotated link) | Single source of truth |
| Component spec: name, variant, states | Mapping design to code |
| Interaction spec: triggers, transitions, durations | Avoids re-deciding in code |
| Edge-case designs (empty, error, loading) | Eliminates "what does this look like when..." |
| Accessibility annotations: focus order, ARIA, alt text | Avoids retro-fitting a11y |
| Responsive breakpoints + behaviour | Stops layout improvisation |
| Open questions | Records what's intentionally unspecified |

The `02-templates/design-brief.md` (under `templates/briefs/`) carries the structure.

---

## 6. Research touchpoints

| Phase | Research it benefits from |
|-------|--------------------------|
| 1. Frame | Discovery interviews, contextual inquiry, analytics review |
| 2. Plan | Concept testing, comparative reviews, surveys |
| 4. Execute | Usability testing on prototypes |
| 5. Verify | Usability testing on the built thing; A/B-test setup |
| 6. Land | Post-launch metrics, in-product surveys, follow-up interviews |

Detail in `user-research.md`. Research is not a single phase — it's continuous evidence.

---

## 7. Pre-implementation checklist

```
[ ] User and job-to-be-done stated in user terms (not feature terms)
[ ] Edge cases enumerated (empty, error, loading, long, permissions, concurrency)
[ ] Fidelity matches the phase
[ ] Microcopy drafted, not left as Lorem Ipsum
[ ] Accessibility considered in design, not retrofit
[ ] Handoff spec ready before engineering starts
[ ] Research evidence (if any) referenced in the scope
```
