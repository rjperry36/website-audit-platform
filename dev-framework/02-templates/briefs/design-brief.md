# Design Brief — {{TASK_TITLE}}

> Brief for a designer (human or agentic) picking up a UI / UX piece of work.

---

## 1. Context

| | |
|---|---|
| **Scope** | *(link)* |
| **Phase** | 2 (Plan) / 4 (Execute) |
| **Type** | New flow / iteration / fix / handoff prep |
| **Why this now** | |

---

## 2. Read before starting

- **Scope:** `scopes/<feature>.md` — read Frame, Plan.
- **`DESIGN_SYSTEM.md`** at project root — the canonical rule book.
- **Standards:**
  - `dev-framework/01-disciplines/ui/<standard>.md`
  - `dev-framework/01-disciplines/ux/<standard>.md`
- **Decision records (by number):**
  - DR-NNNN
- **Existing artefacts to reference:**
  - *(Figma file, prototype, prior screens — exact link)*
- **User research evidence:**
  - *(link to research artefact if any)*

---

## 3. Goal (one sentence)

---

## 4. Audience and intent

- **Primary user / role:**
- **Job-to-be-done:**
- **Success criterion (observable):**
- **Channel(s) the work appears on:**

---

## 5. What to produce

| Type | Where | Notes |
|------|-------|-------|
| Wireframes | (file location) | |
| Hi-fi mockups | | |
| Interactive prototype | | |
| Design tokens added / extended | | |
| Component spec for new patterns | | |
| Accessibility annotations | | |
| Edge-case designs | empty, error, loading, long-content, permission-denied | |
| Handoff to engineering | structured per `dev-framework/01-disciplines/ux/ux-process.md §5` | |

---

## 6. Patterns and constraints

- **Reuse existing patterns first.** If proposing a new pattern, document it per `ui/design-system-discipline.md §4`.
- **Banned without approval:** *(list the project's banned utilities, hardcoded values, off-system spacing)*
- **Responsive breakpoints:** *(project's breakpoint set)*
- **Dark mode:** *(supported / not supported / matches light)*
- **Motion:** restrained; respect `prefers-reduced-motion`.

---

## 7. Microcopy

- **Button labels:** *(verbs, not nouns)*
- **Empty state copy:**
- **Error messages:**
- **Confirmations:**

If brand voice rules apply: see `dev-framework/01-disciplines/content/brand-voice.md` and `BRAND_BOOK.md`.

---

## 8. Out of scope

- *(e.g. "No animation work on the secondary CTA — that's a follow-up scope")*

---

## 9. Definition of done

- [ ] Designs cover happy path + all edge cases enumerated in `ux/ux-process.md §3`
- [ ] Designs use system tokens / components (no raw values)
- [ ] Component spec includes all states (default, hover, focus, active, disabled, loading, error)
- [ ] Accessibility annotated (focus order, ARIA, alt text)
- [ ] Microcopy drafted, not placeholders
- [ ] Responsive variants present
- [ ] Reviewer assigned

---

## 10. Reviewer

**Reviewer:** _____________________
