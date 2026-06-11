---
description: Content strategy — pillar/cluster model, editorial calendar, channel adaptation, AI in production
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Content Strategy

Read at Phase 2 (Plan) whenever planning new content — campaigns, article clusters, social pushes, knowledge bases, sustained programmes.

---

## 1. The pillar / cluster model

Default structure for sustained content programmes:

- **Pillar page** — comprehensive, evergreen, ranks for a high-value head term.
- **Cluster pages** — narrower, support the pillar, link back to it, satisfy long-tail queries.
- **Topical depth** — each cluster page reinforces the pillar's authority on the topic.

A new content programme starts by picking the pillar, then mapping 6–12 cluster topics around it. The map lives in the scope file's Plan section or in a dedicated `pillar-map.md`.

---

## 2. Search intent mapping

For every piece of content, declare the intent:

| Intent | Looks like | Example |
|--------|-----------|---------|
| Informational | "how to…", "what is…" | "What is X?" |
| Transactional | direct purchase / apply | "buy Y online" |
| Navigational | brand-name search | "<brand> contact" |
| Commercial investigation | comparing options | "best Y for Z" |

A scope that mixes intents will perform badly. Choose one per piece.

---

## 3. Editorial cadence

For ongoing content programmes:

- Define a cadence (weekly, fortnightly, monthly) and stick to it. Inconsistent publication signals abandonment.
- Plan **content batches**, not single pieces — 4–6 pieces aligned to a pillar topic per batch.
- Date-prefix time-bound scopes (e.g. `2026-q3-<topic>-content-cluster.md`) to keep historical archives sortable.

---

## 4. Channel adaptation

A single piece often gets adapted for multiple channels. **Voice stays constant; style varies.**

| Channel | Style notes |
|---------|------------|
| Landing page | Long-form; full intent fulfilment; CTA at top + bottom |
| Article | Long-form; FAQ block; internal links to cluster pages |
| Email | Direct; one CTA; subject line tested |
| LinkedIn | Short, narrative-led, one strong hook in the first line |
| Twitter / X | Punchy, threadable; lead with a fact or claim |
| YouTube / video | Open with the conclusion; demonstrate, don't describe |
| Podcast | Conversational; pre-write opening + closing; let middle breathe |

When a scope spans channels, list each adaptation as a sub-section under "Architecture / Approach."

---

## 5. Content briefs

Every content piece has a brief before drafting:

- **Audience** — segment, intent, context of use.
- **Search intent** (if SEO matters) — head term + supporting terms.
- **Word count target** — range, not absolute.
- **Structure outline** — H1, H2s, key sections.
- **Brand voice scale calls** — formal/casual, expert/approachable, etc.
- **Required elements** — examples, data points, quotes, CTAs.
- **Banned elements** — banned phrases from brand book, regulated claims to avoid.
- **Success criteria** — how you'll know this piece worked (search rank, conversion, engagement).

Template: `02-templates/briefs/content-brief.md`.

---

## 6. AI in content production

Most projects now use AI to draft. Rules to keep voice and accuracy:

- **Brief, don't write the prompt.** A good content brief gets a good AI draft; vague prompts get generic output.
- **Include brand voice rules + samples** in the system prompt — not just the user instruction.
- **Edit, don't accept.** AI drafts are a starting point. The human pass is where brand voice, accuracy, and judgment come in.
- **Fact-check everything** — LLMs invent confident-sounding facts.
- **Track prompt versions.** Store prompts in `prompts/` next to the scopes that used them.
- **Disclose** where editorial policy or law requires it.

---

## 7. Fact-checking and citations

For non-trivial content:

- Every factual claim has a source, even if not shown to the reader.
- Citations to primary sources where possible (research papers, official data, named authorities).
- Stats older than 18 months are checked for currency before publication.
- AI-generated facts are checked against the source — LLMs hallucinate citations.

---

## 8. Performance review

Content has a measurement loop:

- Define success metrics at Phase 1 (search position, traffic, conversion, time-on-page, social engagement).
- Capture baseline before launch.
- Review at +30 and +90 days.
- Refresh or retire underperformers — content is an asset, not a museum exhibit.

---

## 9. Pre-implementation checklist

```
[ ] Pillar identified; cluster mapped
[ ] Search intent declared per piece
[ ] Editorial cadence set; batch planned, not single pieces
[ ] Channel adaptations listed
[ ] Content brief written
[ ] AI prompts (if used) versioned alongside the scope
[ ] Fact-check + citation policy applied
[ ] Performance review scheduled at +30 / +90 days
```
