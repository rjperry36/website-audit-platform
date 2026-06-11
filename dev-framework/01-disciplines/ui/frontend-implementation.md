---
description: Frontend implementation — bridging design into shipped code
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Frontend Implementation

Bridges design intent into shipped code. Read at Phase 4 for any UI implementation.

This standard is framework-agnostic; project-specific implementation choices (the framework, the styling approach, the component library) live in `STACK.md` at the project root. See `RECOMMENDED-TOOLS.md` for example UI stacks.

---

## 1. Use the design system before reaching for utilities

Before writing CSS or markup:

- Read `DESIGN_SYSTEM.md`.
- Use established tokens and component classes/components before piling on raw utility classes or inline styles.
- Browser defaults (checkboxes, radios, selects) are usually banned — use the system's components.

---

## 2. Canonical UX patterns

Most rule books standardise these. Follow whatever your project's `DESIGN_SYSTEM.md` says; typical defaults:

- **Search/filter bars** use a unified pill or compound input, not isolated bordered inputs.
- **Expand/collapse** uses CSS height transitions (Grid template rows, `max-height` carefully, or `<details>`) — not snap-in conditional rendering.
- **Modals** trap focus while open and return focus to the trigger on close.
- **Loading states** use `aria-busy` plus a skeleton or spinner; not just a spinner.
- **Toasts** are time-bounded and announceable via `role="status"` or `role="alert"`.

---

## 3. Polite pushback

If a request would contradict the design system (raw colours, banned utilities, off-system spacing), the implementer reminds the requester of the rule **before** implementing.

- Implement the system way unless an explicit exception is granted **and documented in the scope**.
- "It's just one screen" is not an exception; if it ships, it's part of the system.

---

## 4. Image handling

- Use the framework's image component (or `<picture>` for hand-rolled HTML) — never raw `<img>`.
- Background images via positioned image components with `fill`, not CSS `background-image` (responsive, optimised, alt-text-capable).
- Hero overlays use an opacity wrapper at the system-defined value (e.g. 30%). No `mix-blend-*` unless the design system explicitly permits.

---

## 5. Component composition

- **Small, composable components** over large monolithic ones. A 500-line component is a refactor.
- **Props describe data, not styling.** `<Button variant="primary">`, not `<Button color="blue">`.
- **No business logic in components.** Components render state and call out to handlers. Logic lives in hooks / utilities / server actions.
- **Components are reusable across pages where possible.** Page-specific composition lives at the page level.

---

## 6. Accessibility at implementation

Detailed standards live in `ux/accessibility.md`. Implementation-level:

- Semantic HTML first; ARIA only when semantics can't express it.
- Every interactive element reachable by keyboard.
- Focus visible — never `outline: none` without a visible alternative.
- Icon-only buttons have `aria-label`.
- Modals trap focus.

---

## 7. Forms

- Every input has an associated `<label>` (via `for`/`id` or wrapping).
- Validation messages appear next to the field, not only at the top.
- Submit buttons disabled while in-flight; show progress.
- Error states are accessible: `role="alert"` or `aria-invalid` + `aria-describedby` pointing to the message.
- Autocomplete attributes set (`name`, `email`, `tel`, `address-*`, etc.) — speeds up users and helps password managers.

---

## 8. Pre-implementation checklist

```
[ ] DESIGN_SYSTEM.md consulted
[ ] Using system tokens / components, not raw values
[ ] Canonical UX pattern used (search bar, modal, expand/collapse, etc.)
[ ] No raw <img> tags
[ ] No CSS background-image for hero images
[ ] Components small, composable, no business logic
[ ] Forms have labels, accessible errors, autocomplete attributes
[ ] Focus visible on every interactive element
[ ] Mobile breakpoints verified
[ ] Dark mode (if applicable) verified
[ ] No banned utilities introduced
```
