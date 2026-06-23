# Scope: harden-visual-analyzer-parsing

| | |
|---|---|
| **Version** | v0 |
| **Status** | Draft — Frame done; not started |
| **Owner** | Russell (Product Owner) / Claude as `engineering-agent` |
| **Disciplines** | engineering (primary), _local/ai-agents, qa |
| **Created** | 2026-06-23 |
| **Last updated** | 2026-06-23 |
| **Related scopes** | `cro-audit-live-persistence.v0` (the pipeline this hardens) |
| **Related decision records** | DR-0003 (gpt-4o for visual analysis) |

---

## 1. Frame

**Problem:**
`lib/audit/visual-analyzer.ts` parses the gpt-4o JSON response and accesses
nested blocks unguarded — e.g. line ~192 reads `result.experience.aboveFold`.
gpt-4o output is non-deterministic: on 2026-06-23 a Lyons Leaf crawl returned a
response with no `experience` block, throwing
`TypeError: Cannot read properties of undefined (reading 'aboveFold')`.

The failure is **silent and damaging**: `auditVisualDesign` throws, the crawler
catches it and continues, and a report with **zero visual/experience/persona/
Cialdini findings still persists to Supabase**. The CRO/Cialdini/persona
dashboard pages then render empty for that crawl with no signal that anything
went wrong. A manual re-run produced a complete report (19 findings), confirming
the cause is response-shape flakiness, not a config error.

**Success criteria:**
1. A malformed/partial gpt-4o response never throws an uncaught error; missing
   blocks degrade gracefully (skip those findings, keep the rest).
2. A crawl that produces an incomplete visual analysis is **not persisted as if
   complete** — either it is rejected/retried, or the report is flagged so the
   read path / dashboard can tell.
3. The failure is observable (logged with the offending shape) rather than silent.

**Constraints:**
- Touches `lib/audit/visual-analyzer.ts` → `_local/ai-agents` discipline applies:
  prompt-design / eval / cost / privacy checklists must pass before Phase 5.
- Must not change the audit-report JSON **shape** (versioned contract) — this is
  parsing robustness, not a schema change.
- One gpt-4o vision call per crawl; any retry policy must respect cost governance.

---

## 2. Plan (CONFIRM before Execute)

Sketch — to be firmed up at Plan:
- Guard each `result.<block>` access (visual / experience / personas / cialdini)
  so a missing block yields no findings instead of a throw.
- Decide the persistence policy when the analysis is partial:
  - **CONFIRM C1:** retry the gpt-4o call N times on partial shape before giving
    up, vs. persist-but-flag, vs. reject-and-skip-persist. Cost vs. completeness.
- Add a shape validation step (lightweight schema check) before mapping findings.
- Log the raw shape on validation failure (no PII — marketing-page screenshots).
- QA: a unit test feeding partial/empty gpt-4o responses through the mapper.

---

## 3. Execute / 4. Verify / 5. Land

_Not started._
