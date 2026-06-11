---
description: Interaction design — flows, states, transitions, feedback
last_reviewed: 2026-05-18
review_cadence_days: 90
anchors:
  - id: wcag-target-size
    claim: "Touch target size minimum is 44×44 CSS pixels (WCAG 2.5.5)."
    sources:
      - https://www.w3.org/TR/WCAG21/#target-size
  - id: feedback-timing
    claim: "Response feedback within 100 ms feels instant; 1 s loses immediacy; 10 s loses focus."
    sources:
      - https://www.nngroup.com/articles/response-times-3-important-limits/
---

# Interaction Design

Read at Phase 4 (Execute) for any interactive flow. The visual layer is `ui/visual-standards.md`; this standard governs *how* interactions feel and respond.

---

## 1. The interaction loop

Every interaction follows a loop:

```
Intent  →  Action  →  Feedback  →  Result  →  (next intent)
```

A failure at any point is a friction point. The standards below address each:

| Step | Principle |
|------|-----------|
| Intent | Affordances visible; primary action obvious |
| Action | Targets large enough; reachable by mouse, touch, and keyboard |
| Feedback | Response within 100 ms; loading > 1 s shows progress |
| Result | Outcome visible; next step obvious |

---

## 2. Affordances

- **Buttons look like buttons.** Pills, raised, bordered — pick one per project and stick with it.
- **Links look like links.** Underlined (or otherwise clearly distinguished from body text).
- **Disabled controls look disabled.** Reduced opacity isn't enough on its own — add the disabled cursor and `aria-disabled`.
- **Active route / current page is visually emphasised** in navigation.

Don't rely on hover to signal interactivity. Touch users can't hover; the affordance must be visible at rest.

---

## 3. Hit targets

- **44×44 px minimum** for any touch target (WCAG 2.5.5 AAA target, but treat as AA-equivalent for hands-on apps).
- **Spacing between targets ≥ 8 px** to prevent accidental taps.
- **No hover-only controls.** Touch devices can't hover.

---

## 4. Feedback timing

| Time | Required feedback |
|------|-------------------|
| < 100 ms | None — feels instant |
| 100 ms – 1 s | Visual change (button pressed state, cursor change) |
| 1 s – 10 s | Progress indicator — spinner, skeleton, percentage |
| > 10 s | Specific progress (steps, ETA), allow cancel or background |

Silent waits are a bug. Optimistic UI (assume success; reconcile if it fails) hides latency where it's safe to do so.

---

## 5. Forms

- **Group related fields.** Use `<fieldset>` and `<legend>` for grouped controls.
- **Required fields marked explicitly.** Don't make users guess.
- **Validate at the right moment.** On blur for individual fields; on submit for the form as a whole. Live validation is fine for password strength and similar.
- **Don't clear the form on error.** Users should never have to re-enter data because the server said no.
- **Server errors come back to the form**, attached to the relevant fields if possible.

---

## 6. Navigation and information architecture

- **Three clicks is a myth, but depth is a real cost.** Flatten where possible; group where logical.
- **Breadcrumbs for deep hierarchies.** Make the path back visible.
- **Search where the catalogue is large enough to need it.** Use the system pattern (see `ui/`).
- **Don't trap the user.** Every screen has a clear way back; modals have a clear close.

---

## 7. Empty, loading, error states

Already in `engineering/error-handling.md` and `ux-process.md` — repeated here because they're interaction concerns:

- **Empty state** — explains why empty + offers a next step.
- **Loading state** — skeleton (preferred) or spinner; never blank.
- **Error state** — what failed, in plain language; how to retry; how to escalate if retry fails.

---

## 8. Microcopy

- **Buttons say what they do.** "Save changes" not "Submit". "Delete report" not "OK".
- **Confirmations confirm what's about to happen.** "Delete this report? This cannot be undone." with a clear destructive button colour and a "Cancel" that's also a clear target.
- **Error messages are specific.** "Your email address is required" beats "There was an error."
- **Success messages confirm the next thing.** "Saved. Continue to next step." beats "Success."

---

## 9. Animation and motion

- Motion guides attention, conveys state change, hides loading.
- Default to short (150–300 ms) and ease-out.
- Respect `prefers-reduced-motion` — disable or simplify non-essential animation.
- Don't animate critical UI on first paint — users miss it.

---

## 10. Pre-implementation checklist

```
[ ] Primary action visually dominant in every screen
[ ] Affordances visible at rest; no hover-only controls
[ ] Touch targets ≥ 44 px with adequate spacing
[ ] Feedback timing matches duration tiers (< 100 ms / 1 s / 10 s)
[ ] Forms: grouped, required marked, validated at right moment, no data loss on error
[ ] Empty / loading / error states defined for every flow
[ ] Microcopy specific and action-oriented
[ ] Motion restrained; reduced-motion respected
[ ] User cannot get stuck — every screen has a way back / out
```
