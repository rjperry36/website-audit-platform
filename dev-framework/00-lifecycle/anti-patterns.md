---
description: How adoption goes wrong, and how to recover
last_reviewed: 2026-05-18
review_cadence_days: 180
---

# Anti-Patterns

The framework fails in predictable ways. Most failures are not technical — they're cultural. This document names the failures, the symptoms, and the recovery.

---

## 1. Documentation theatre

**Symptom:** scopes, decision records, and verification checklists are filled in, but nobody read them and nothing changed in the work.

**Cause:** the team treats the framework as a compliance ritual rather than a thinking tool.

**Recovery:**
- Require the scope's `Plan` section to be reviewed *out loud* by a second person before Phase 4 starts. Anything that can't be defended is removed.
- Spot-audit verification checklists — pick one item at random in a retro and ask "show me what evidence backs this tick."
- If a section is consistently empty or copy-pasted, delete it from the template. Stop carrying weight that earns nothing.

---

## 2. Starting at Phase 4 (the cowboy build)

**Symptom:** "I just need to ship this quickly" — no Frame, no Plan, no Standards check.

**Cause:** small work feels cheaper to do than to plan.

**Recovery:**
- For genuinely small work (typo, copy tweak, config nudge), GPA collapses to a one-sentence Goal + one-line Plan + one Act step. Total overhead: under a minute. **The phases still happen** — they're just compressed.
- For everything else, refuse to advance past Phase 1 until the scope's Frame is written. The clock starts at the right place.

---

## 3. Skipping Phase 3 (Standards Check)

**Symptom:** Phase 5 verification turns up checklist items the work cannot pass without rework. Schedule slips. Quality drops.

**Cause:** standards feel like Phase 5 work and are read too late.

**Recovery:**
- Make Phase 3 a hard gate. Phase 4 cannot start without G3 passed.
- For agentic projects: the briefing template must include the specific standards files to read; missing them is a brief failure, not an agent failure.
- Audit Phase 5 failures backwards: which Phase 3 standard was missed? Tighten that step.

---

## 4. Silent deviations

**Symptom:** a standard says X, the work does Y, nobody recorded the change.

**Cause:** the contributor judged the deviation reasonable but didn't write it down.

**Recovery:**
- Every deviation must be recorded in the scope's "Planned Deviations" section (in Phase 3) or "Decision Log" (if it surfaced during Phase 4).
- Standards are not laws — deviations are allowed. **Unrecorded deviations are the failure**, not the deviation itself.
- Periodically sweep decision records and scope deviations for patterns. Repeated deviations are a signal the standard needs updating.

---

## 5. Phase 6 amnesia

**Symptom:** work is shipped, but the scope file is never versioned, decisions are not recorded, and follow-up work is forgotten.

**Cause:** the rush to ship doesn't budget time for closing the loop.

**Recovery:**
- Budget Phase 6 as 5–10% of the work's total time and put it on the schedule, not at the end of someone's day.
- For agentic projects: the agent's session is not "done" until the scope is versioned. The orchestrator (e.g. `CLAUDE.md`) enforces this.
- Tie Phase 6 to release management. No release without Phase 6 closed.

---

## 6. Specialisation creep

**Symptom:** the project has invented a 14-step lifecycle. Nobody can remember the order. Phase 3 has split into 3.1, 3.2, 3.3a, 3.3b.

**Cause:** the team mistook the framework's flexibility for an invitation to elaborate.

**Recovery:**
- The universal lifecycle in `lifecycle.md` is the **outer** shape. Specialisations live inside one of its six phases, not alongside them.
- Specialise where there is real value (e.g. a Change Advisory Board step inside Phase 5 for ops-heavy work). Don't specialise to feel busy.
- If a specialisation isn't worth its weight after one project, kill it.

---

## 7. The "single project" trap

**Symptom:** the framework gets bent to fit one project's quirks. Subsequent projects inherit the bend.

**Cause:** lifting a project-specific solution into the framework without checking whether it generalises.

**Recovery:**
- Project-specific patterns live **inside the project**, not in the framework folder.
- Only lift a pattern into the framework after it has solved the same problem on a **second** project.
- The framework is conservative on purpose. Bias against changes; require evidence.

---

## 8. RACI Russian roulette

**Symptom:** when something goes wrong, nobody owns it; when something goes right, three people claim it.

**Cause:** two roles marked Accountable; or A is marked but never agreed; or RACI was written once and never re-read.

**Recovery:**
- Re-check the RACI at G2 and G4. Roles can legitimately shift mid-project (e.g. a new contractor joins, the lead changes); record the change.
- For each phase, there must be exactly one A. If you can't pick one, the phase's outcome isn't well-defined — fix Phase 1.

---

## 9. Brief failure (the agentic version of "starting at Phase 4")

**Symptom:** an AI agent (or contractor) is briefed with "read the requirements" or "make it work" and produces inconsistent output.

**Cause:** the brief skipped the work of pointing to specific scopes, standards, and decision records.

**Recovery:**
- The briefer is responsible for narrowing the read list. The briefer is the failure point when an agent hallucinates.
- Use the brief templates under `02-templates/briefs/`. Reject any brief that doesn't name specific files.

---

## 10. Process for process's sake

**Symptom:** the framework is followed perfectly, the work is correct, and the project is six weeks late because every gate took two days.

**Cause:** ceremony scaled up to match the framework's appearance rather than the work's risk.

**Recovery:**
- Gates **scale with risk**. A trivial change has 10-minute gates. A migration affecting production data has 2-day gates. Same six gates either way.
- Audit gate duration in retros. If a gate is taking longer than the work between gates, you have ceremony rot.
- Lightweight does not mean skipped. Compressed gates still produce a record.

---

## When to consider a deeper change

If three or more of these anti-patterns are showing up across projects at once, the framework's adoption is in trouble. Recovery is not to add more rules — it is to:

1. Pick the smallest project running. Spend a week running it strictly by the framework.
2. Record what hurts.
3. Either fix the framework where it was wrong, or coach the team where they bent it.

The framework is a tool, not a religion. When it fights you, listen — then decide if the friction is the framework's fault or the work's signal that something deeper is wrong.
