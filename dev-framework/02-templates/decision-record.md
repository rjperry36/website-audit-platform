# DR-{{NNNN}} — {{SHORT_TITLE}}

> A decision record (often called an ADR) captures a decision that affects more than one scope. Saved as `decisions/NNNN-<short-title>.md`.
>
> Numbers are never reused. Superseded records keep their number and are marked `Superseded by NNNN`.

---

## Header

| | |
|---|---|
| **Date** | YYYY-MM-DD |
| **Status** | Proposed / Accepted / Superseded by NNNN |
| **Participants** | |
| **Affects** | *(scopes, disciplines, or systems this touches)* |
| **Supersedes** | *(DR-NNNN if this replaces an earlier decision)* |

---

## Context

*What prompted this decision. The forces in play — technical, business, regulatory, stakeholder. Two or three paragraphs maximum.*

---

## Decision

*What was decided. Stated plainly, in one or two sentences if possible.*

---

## Alternatives considered

The most valuable section. Future-you will want to know what was on the table and ruled out.

- **Alternative 1** — brief description; why rejected.
- **Alternative 2** — brief description; why rejected.
- **Alternative 3** — brief description; why rejected.

---

## Consequences

**Positive:**

- What gets better, easier, safer.

**Negative / risks:**

- What gets harder, where the trap doors are, what we're now committed to maintaining.

**Reversibility:**

- One-way / two-way / partially reversible. If one-way, what would replacement require?

---

## Follow-up

Anything that needs to happen as a result of this decision but isn't in scope here. Link to the scopes that will pick it up.

- *(e.g. "Sweep existing landing pages — see scope `<feature>.md`")*
- *(e.g. "Update brand voice module — `dev-framework/01-disciplines/content/brand-voice.md`")*

---

## Status lifecycle

```
Proposed  →  Accepted  →  (later)  Superseded by NNNN
```

- **Proposed:** the decision is in discussion. The record is open.
- **Accepted:** the decision has been made and is in force.
- **Superseded:** a later decision (numbered NNNN) replaces this one. The original record stays in place; the new record cites it.

A decision is **never deleted**, even if reversed. The record of "we decided X, then reversed to Y because Z" is more valuable than either decision alone.
