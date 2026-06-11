# DR-0004 — Keller's CBBE pyramid as the framing for the `/overview` dashboard

| | |
|---|---|
| **Date** | 2026-05-21 (decision originally made early 2026; backfilled on framework adoption) |
| **Status** | Accepted (with known limitation — current implementation is cosmetic) |
| **Participants** | Russell |
| **Affects** | ui, ux, content disciplines; `components/brand/cbbe-pyramid.tsx`; `/overview` page |
| **Supersedes** | — |

---

## Context

The `/overview` dashboard needed an organising idea — something the user opens and immediately understands the shape of. Raw audit scores ("SEO 82, AEO 71, GEO 64…") don't tell a brand story. Keller's CBBE (Customer-Based Brand Equity) pyramid is a well-known brand-strategy model — Salience → Performance → Imagery → Judgements → Feelings → Resonance — that gives the audit data a narrative frame.

---

## Decision

Render the `/overview` page as a CBBE pyramid where each tier shows a brand-relevant score sourced from the latest audit report. The mapping is currently:

- Salience ← SEO score
- Performance ← UX/accessibility score
- Imagery ← AI visual score
- Judgements ← AEO score
- Feelings ← (placeholder)
- Resonance ← (placeholder)

---

## Alternatives considered

- **A flat scorecard** — rejected as too undifferentiated; loses the brand-strategy framing that is the project's differentiator.
- **A radar chart** — considered; rejected because it doesn't communicate hierarchy or causality (the pyramid implies Salience leads to Resonance).
- **A custom framework (e.g. internal brand equity model)** — rejected for now; CBBE is well-known enough that any brand-side stakeholder will read the page without explanation.

---

## Consequences

**Positive:**
- The dashboard tells a story, not just a number.
- Familiar to brand and marketing audiences.
- Pyramid SVG is reusable and accessible.

**Negative / risks:**
- **The score-to-CBBE-tier mapping is a one-line proxy, not a real CBBE assessment.** Salience is far more than SEO; Performance is far more than accessibility. Anyone trained in CBBE will notice.
- The "Strengths" / "Opportunities" copy under the pyramid is currently hard-coded, not derived from the report.
- Two tiers (Feelings, Resonance) have no real data source today.

**Reversibility:**
- Partially reversible. The pyramid SVG can stay; the score mapping logic in `/overview/page.tsx` can be rewritten without touching anything else.

---

## Follow-up

- A future scope (`ux-agent` + `content-agent`) should design a defensible CBBE mapping — at minimum, document the rationale per tier; ideally, source each tier from a composite of audit signals plus possibly user-survey input later.
- Replace the hard-coded Strengths/Opportunities copy with derived insights from the report.
