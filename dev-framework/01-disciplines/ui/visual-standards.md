---
description: Visual standards — typography, layout, colour, components, states
last_reviewed: 2026-05-18
review_cadence_days: 90
anchors:
  - id: wcag-contrast-text
    claim: "Body text contrast minimum is 4.5:1; large text minimum is 3:1 (WCAG 2.1 AA)."
    sources:
      - https://www.w3.org/TR/WCAG21/#contrast-minimum
  - id: prefers-reduced-motion
    claim: "Non-essential motion must respect the prefers-reduced-motion media query."
    sources:
      - https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
---

# Visual Standards

Framework-agnostic visual standards. Project-specific values (the actual scale, palette, breakpoints) live in `DESIGN_SYSTEM.md` at the project root.

---

## 1. Type

- **A scale, not a free-for-all.** Headings, body, small, caption — defined sizes with defined line-heights. Anything else needs a decision record.
- **One H1 per page.** Don't skip heading levels for visual styling.
- **Line length 50–80 characters** for body copy. Wider is harder to read; narrower fragments.
- **Line-height ≥ 1.4** for body; ≥ 1.2 for headings. Less is uncomfortable.
- **Use the system's heading font(s).** No ad-hoc fonts.

---

## 2. Colour

- **Tokens, not values.** Every colour reference goes through a semantic token (`color.primary`, `color.surface`, `--brand-accent`). Never hardcoded hex.
- **Meaning, not decoration.** Colours communicate state — primary action, danger, success. Use them consistently across the project.
- **Don't carry meaning in colour alone.** Pair with an icon or text label so the meaning survives colour-blind users and grayscale printing.
- **Contrast: ≥ 4.5:1** for normal text, ≥ 3:1 for large text and meaningful UI components (WCAG AA). See `ux/accessibility.md`.
- **Dark mode** (if supported) is its own pass — colours that look fine in light mode often fail contrast in dark mode.

---

## 3. Layout

- **Grid + spacing scale.** A 4 or 8 px base; everything snaps to multiples.
- **Container max-widths defined.** Content has a comfortable reading width; full-bleed only for media.
- **Section rhythm.** Alternate backgrounds, breathing space, deliberate visual hierarchy.
- **Responsive at every breakpoint.** Designs work at mobile first, then progressively enhance. Never the reverse.

---

## 4. Components — the full state set

Every interactive component ships with **all** its states:

| State | When |
|-------|------|
| Default | At rest |
| Hover | Pointer over (desktop) |
| Focus | Keyboard focus or programmatic |
| Active / Pressed | Mid-interaction |
| Disabled | Not currently allowed |
| Loading | Action in flight |
| Error | Input invalid or operation failed |
| Selected / Active route | Component is the current target |

Missing states are bugs. Reviewers check for them.

---

## 5. Iconography

- **One icon library per project.** Mixing breaks visual coherence.
- **Consistent size scale.** 16 / 20 / 24 px or whatever the system specifies — not arbitrary.
- **Icons have meaning or are decorative.** Meaningful icons have accessible labels; decorative icons have `aria-hidden="true"`.
- **No "decoration" icons in critical paths.** The user shouldn't have to interpret an unlabeled icon to complete a primary task.

---

## 6. Motion

- **Restrained.** Motion guides attention; it doesn't entertain.
- **150–300 ms** for most state transitions. Anything longer feels slow; anything shorter is missed.
- **Respect `prefers-reduced-motion`.** Disable or simplify non-essential motion for users who request it.
- **No bouncing, springing, or parallax** on functional UI unless the brand explicitly requires it and accessibility has been considered.

---

## 7. Imagery

- **All meaningful images have descriptive alt text.** Decorative images have `alt=""`.
- **Use the framework's image component, not raw `<img>`.** See `engineering/performance.md`.
- **Aspect ratios consistent within a context.** A grid of cards uses one ratio. Don't mix.
- **No text in images** for body copy — use real text. Images are screen-reader-invisible.

---

## 8. Hero / above-the-fold pattern

Most projects standardise the hero. Typical canonical pattern:

- Single H1, primary keyword present, distinct from the `<title>` tag
- Sub-headline supporting the H1
- Single primary CTA, visually dominant
- One above-the-fold image, marked priority/eager-loaded
- Trust signals (logos, ratings, social proof) below the CTA, not above

Exact implementation in `DESIGN_SYSTEM.md`.

---

## 9. Pre-implementation checklist

```
[ ] Typography scale used; no ad-hoc sizes
[ ] One H1; headings follow hierarchy
[ ] Colour via tokens; no hardcoded values
[ ] Contrast ≥ WCAG AA (verified, not assumed)
[ ] Layout on the spacing scale; container max-widths respected
[ ] Every interactive component has all states (incl. focus, loading, disabled, error)
[ ] One icon library; consistent size scale
[ ] Motion restrained; respects reduced-motion
[ ] All images use framework image component; alt text correct
[ ] Hero follows the project's canonical pattern
[ ] Responsive verified at each breakpoint
```
