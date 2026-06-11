---
description: WCAG 2.1 AA accessibility — applied during execution, audited at verification
last_reviewed: 2026-05-18
review_cadence_days: 90
anchors:
  - id: wcag-version
    claim: "WCAG 2.1 Level AA is the framework's minimum accessibility target."
    sources:
      - https://www.w3.org/TR/WCAG21/
  - id: wcag-contrast-text
    claim: "Body text contrast minimum is 4.5:1; large text minimum is 3:1."
    sources:
      - https://www.w3.org/TR/WCAG21/#contrast-minimum
  - id: wcag-non-text-contrast
    claim: "Non-text UI components and graphical objects must meet 3:1 contrast."
    sources:
      - https://www.w3.org/TR/WCAG21/#non-text-contrast
  - id: wcag-keyboard
    claim: "All functionality is operable through a keyboard interface."
    sources:
      - https://www.w3.org/TR/WCAG21/#keyboard-accessible
  - id: aria-first-rule
    claim: "Don't use ARIA if a native HTML element does the job."
    sources:
      - https://www.w3.org/TR/using-aria/#rule1
---

# Accessibility

WCAG 2.1 AA is the legal minimum for most commercial digital products and the baseline this framework adopts.

Apply during Phase 4 (Execute), not as a Phase 5 retrofit — retrofits are always slower, more error-prone, and produce worse outcomes.

---

## 1. Semantic HTML

Use the right element. Custom widgets without semantic backing fail screen-reader users.

```
<header>  <nav>  <main>  <article>  <section>  <aside>  <footer>
<h1>…<h6>                   ← never skip levels for styling
<ul>/<ol>/<li>              ← real lists
<button>/<a>                ← actions vs navigation
<form>/<label>/<input>      ← associated by id/for or wrapping
```

Bad:
```
<div class="header">          ← no semantic meaning
<span onClick="…">            ← not keyboard-accessible
```

**One H1 per page.** Heading levels follow document order — never skip levels for visual styling.

---

## 2. Images

- Every meaningful `<img>` has descriptive `alt`.
- Decorative images use `alt=""` (empty, not omitted) with `aria-hidden="true"`.
- SVG icons used decoratively are `aria-hidden`; meaningful ones have a `<title>` or accessible label.

Bad alts: `"image"`, `"company-logo"`, `"hero"`.
Good alts: `"Two people walking through an office lobby"`, `"Jane Doe, head of design"`.

---

## 3. Forms

- Every input has an associated `<label>` via `for`/`id` or wrapping.
- Icon-only inputs use `aria-label`.
- Grouped controls (radios, checkboxes) use `<fieldset>` + `<legend>`.
- Error messages associated with their field via `aria-describedby` and `aria-invalid="true"`.
- Autocomplete attributes set where applicable (`name`, `email`, `tel`, etc.).

---

## 4. Interactive elements

- **Buttons** for actions (no URL change).
- **Links** for navigation (URL changes).
- Icon-only buttons have an accessible name: `aria-label="Close"`.

Never:
```
<div onClick="…">          ← no keyboard, no role
<span onClick="…">         ← same
```

---

## 5. Keyboard navigation

- Every interactive element reachable via Tab.
- Focus order follows visual reading order.
- Focus is **visible** — never `outline: none` without a custom focus indicator.
- Modals trap focus while open; return focus to the trigger on close.
- Skip links provided to bypass repetitive nav.

A full keyboard pass — no mouse, no touch — is a Phase 5 requirement.

---

## 6. ARIA

Augment HTML when native semantics are insufficient. Don't override correct semantics.

```
<nav aria-label="Footer navigation">
<button aria-expanded={isOpen} aria-controls="filter-panel">
<div aria-live="polite">{searchResultCount} results</div>
```

Don't:
```
<button role="button">        ← redundant
<h2 role="heading">           ← redundant
```

The first rule of ARIA: don't use ARIA if a native HTML element does the job.

---

## 7. Colour and contrast

- **Text contrast ≥ 4.5:1** (WCAG AA) for normal text.
- **Large text** (18pt+ bold, 24pt+ regular) **≥ 3:1**.
- **Non-text UI (icons, focus rings, form borders) ≥ 3:1.**
- Never convey meaning through colour alone — pair with an icon or text label.
- Verify dark-mode variants — they can introduce new contrast failures.

Test with an automated accessibility tool, but **also** with the project's actual content (long names, multilingual strings, edge-case colour pairings). See `RECOMMENDED-TOOLS.md` for examples.

---

## 8. Motion

- Respect `prefers-reduced-motion: reduce`.
- Disable or simplify non-essential animation.
- Avoid auto-playing carousels, hero videos, or parallax that scrolls unprompted.

---

## 9. Dynamic content

- Loading states announced via `aria-busy` and (when meaningful) `aria-live`.
- Toast / status messages announceable via `role="status"` (polite) or `role="alert"` (assertive).
- Live region updates kept short and meaningful — chatty live regions become noise.

---

## 10. Forms-level error handling

- Errors appear next to the field, not just at the top.
- The error message is `aria-describedby`-linked to the field.
- `aria-invalid="true"` set on the field while in error.
- On submit failure, focus moves to the first error (or a summary that links to it).

---

## 11. Mobile and touch

- Touch targets ≥ 44×44 px (see `interaction-design.md`).
- Pinch-to-zoom not disabled (`maximum-scale=1` and `user-scalable=no` banned in viewport meta).
- Orientation works in both portrait and landscape.

---

## 12. Tools

- **Automated** — an accessibility scanner running in CI and in dev. Catches ~30% of issues; necessary, not sufficient.
- **Manual keyboard test** — every Phase 5.
- **Screen reader test** — a desktop and a mobile screen reader, at least one before launch.

(See `RECOMMENDED-TOOLS.md` for example scanners and screen readers per platform.)
- **Real users** — accessibility user testing for high-stakes work; nothing else exposes real friction.

---

## 13. Pre-implementation + verification checklist

```
[ ] One <h1>; headings follow hierarchy
[ ] All meaningful images have descriptive alt; decorative images have alt=""
[ ] Every input has an associated <label>
[ ] Icon-only buttons have aria-label
[ ] Buttons for actions; links for navigation
[ ] Modals trap focus and return focus on close
[ ] No `outline: none` without visible alternative
[ ] Focus order matches visual order
[ ] Dynamic content announced via aria-live / aria-busy
[ ] Text contrast ≥ 4.5:1; non-text UI ≥ 3:1
[ ] Whole flow completable by keyboard
[ ] Pinch-zoom not disabled
[ ] Reduced-motion respected
[ ] Errors linked to fields via aria-describedby; aria-invalid set
[ ] Automated accessibility audit zero violations
[ ] Manual keyboard pass complete
[ ] Screen reader sanity check on at least one assistive tech
```
