---
description: Brand voice — applying voice consistently, including for AI-generated copy
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Brand Voice

Project-specific voice characteristics live in `BRAND_BOOK.md` at the project root. This standard covers the **discipline of applying voice consistently**.

---

## 1. Where voice lives

Define and maintain in `BRAND_BOOK.md`:

- **Tone scales** — formal ↔ casual, expert ↔ approachable, restrained ↔ energetic, plain ↔ literary
- **Banned phrases** — jargon, marketing clichés, internal-speak the audience doesn't use
- **Signature moves** — sentence rhythm, second-person, specific concrete details, etc.
- **Sample copy** — three or four canonical examples to match
- **Anti-examples** — common drift patterns the brand explicitly rejects

This standard is about *how* to apply those characteristics, not *what* they are.

---

## 2. The discipline

For every piece of content:

1. **Read `BRAND_BOOK.md`** before drafting. Voice drift happens fastest when writers skip this step.
2. **Draft against the tone scales.** Make a deliberate call on each scale ("this piece is 70% expert, 30% approachable").
3. **Self-edit pass for banned phrases.** Find-and-replace check before submitting.
4. **Read aloud.** If it sounds like a corporate press release, it probably is one.

---

## 3. AI-generated copy

LLMs default to generic agency-speak. Specific brand voice requires explicit prompting.

When using AI to draft:

- **Include brand voice rules in the prompt's system message**, not just the user instruction.
- **Include 2–3 sample paragraphs** from your brand book in the prompt — examples are more reliable than instructions.
- **Specify the banned phrases.** "Do not use the phrase 'leverage', 'seamless', 'cutting-edge', 'in today's fast-paced world.'"
- **Run the output through the same self-edit pass** as a human draft. Don't trust the LLM's first pass.
- **Track prompt versions.** If a prompt template lives in the project, version it like code — store in `prompts/` alongside the scope it was used for.

---

## 4. Voice ≠ style

| Voice | Style |
|-------|-------|
| Who you are | How you adapt voice to context |
| Consistent across every piece | Varies by channel |
| Defined in the brand book | Defined in content strategy |

Voice is constant. Style adapts: a tweet is not a landing page; a sales email is not a help-centre article.

---

## 5. Voice for AI agents and chatbots

If the project includes a customer-facing AI (chatbot, generated emails, dynamic page content):

- The system prompt embeds the brand voice rules in full.
- Outputs are tested for voice drift — particularly on edge cases (apologies, refusals, error explanations).
- Periodic spot-audits of real conversation transcripts against the brand book.

The AI's voice is the brand's voice — and the brand owns it.

---

## 6. Plain language and accessibility

Plain language is a voice choice with an accessibility benefit:

- **Sentence length** under 25 words for most contexts.
- **Vocabulary** at or below the reading level your audience actually uses (grade 7 readability is a typical baseline for consumer copy).
- **One idea per paragraph** for scannable copy.
- **Active voice** the default; passive only when the doer is unknown or irrelevant.

This isn't dumbing down; it's clearing barriers. A reader with dyslexia, a non-native speaker, a tired mobile user — all benefit. Sophisticated audiences benefit too.

---

## 7. Brand-voice review (Phase 5)

Brand-voice review is its own Phase 5 check. The reviewer:

- Confirms tone matches the brand book's defined scales for this piece.
- Confirms no banned phrases (find-and-replace check, not eyeballing).
- Confirms signature moves are present.
- Confirms AI-generated copy was specifically reviewed.
- Confirms channel-appropriate style applied.

A reviewer rejects work that fails any of these — not as a personal preference, but as a brand-protection action.

---

## 8. Pre-implementation checklist

```
[ ] BRAND_BOOK.md consulted
[ ] Tone calls made deliberately on the defined scales
[ ] Banned phrases search done (find-and-replace, not eyeballing)
[ ] Signature moves present
[ ] AI prompts (if used) include voice rules + samples
[ ] AI output reviewed against brand book
[ ] Channel-appropriate style applied
[ ] Read aloud — sounds like the brand
[ ] Plain language pass for consumer copy
```
