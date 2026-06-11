---
description: How to use and extend the project's design system without breaking it
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Design System Discipline

Most projects with UI work maintain a `DESIGN_SYSTEM.md` at the project root carrying the actual rule book (canonical class strings or token references, hero patterns, banned utilities, colour palette, typography scale). This standard is about **how to work with** that rule book.

---

## 1. The first rule

Before producing any UI artefact:

1. Read `DESIGN_SYSTEM.md` end-to-end the first time you touch it. Re-read its checklist (most rule books have one) before every UI task afterwards.
2. **Use established tokens and components** before piling on raw values or utility classes.
3. If a pattern doesn't yet exist in the system, **propose** it — don't quietly invent a one-off.

---

## 2. Three legitimate paths

When you need to produce a UI surface, you have three legitimate choices — and only three:

| Path | When |
|------|------|
| **Use what's there** | Default. The pattern exists. Use it canonically. |
| **Propose a new pattern** | The system genuinely doesn't cover this case and it will recur. Open a scope to extend the design system; document the case; add the pattern to `DESIGN_SYSTEM.md` once accepted. |
| **One-off variant with a documented exception** | Truly one-time work that will not recur (a single campaign landing page; an internal experiment). Inline-comment the exception and link to the scope explaining why. |

What's **not** legitimate: improvising a fourth path silently.

---

## 3. Banned without explicit approval

These are usually banned in any mature design system. Replace with your project's specifics in `DESIGN_SYSTEM.md`:

- Hard-coded colour values that aren't in the palette
- One-off type sizes that aren't in the scale
- New form-control styles that bypass the system's input components
- New animation curves / durations that don't match the system's motion tokens
- Inline styles (where the project uses utility classes or CSS-in-JS)
- New spacing values that aren't on the spacing scale

---

## 4. Documenting a new pattern

When you add a new pattern to the system:

```markdown
### NN.N Pattern Name
**Use for:** when this pattern applies
**Canonical implementation:** copy-pasteable code
**Rules:**
- non-negotiable 1
- non-negotiable 2
**Variants:** acceptable variants
**Anti-patterns:** what people get wrong
**Accessibility notes:** any pattern-specific a11y requirements
```

A new pattern is not "in the system" until it appears in `DESIGN_SYSTEM.md`. Until then it's a candidate.

---

## 5. Reviewing UI work

A reviewer of UI work checks:

- Did the contributor read `DESIGN_SYSTEM.md`?
- Are tokens used, not raw values?
- Are component patterns reused, not re-invented?
- Are deviations recorded and justified?

A UI review that doesn't reference the design system is not a UI review.

---

## 6. Pre-implementation checklist

```
[ ] Read DESIGN_SYSTEM.md (full, or the relevant chapter)
[ ] Pattern I need already exists — using it canonically
[ ] If pattern doesn't exist, I'm proposing an extension, not improvising
[ ] No banned utilities or hard-coded values introduced
[ ] Mobile + dark-mode (if applicable) variants considered
[ ] Reviewer agreed with the choice of "use / propose / exception"
```
