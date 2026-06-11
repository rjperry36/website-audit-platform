# Engineering Brief — {{TASK_TITLE}}

> Brief for an engineer (human or agentic) picking up a piece of build / fix / refactor work.
> Whoever assigns the work is responsible for naming the *exact* files to read — vague briefs produce vague outputs.

---

## 1. Context

| | |
|---|---|
| **Scope** | *(link to the scope file)* |
| **Phase being worked** | 4 (Execute) / other |
| **Slice of the scope** | *(if the scope is split into slices, name this slice)* |
| **Type** | feat / fix / refactor / chore |
| **Why this now** | *(one sentence)* |

---

## 2. Read before starting (and only these)

The minimum context — no more. If anything else is needed, it's a brief failure (or the scope/standards are missing something).

- **Scope:** `scopes/<feature>.md` — read the Frame, Plan, Standards Applied sections.
- **Standards to apply:**
  - `dev-framework/01-disciplines/engineering/<standard>.md`
  - `dev-framework/01-disciplines/<other-discipline>/<standard>.md`
- **Decision records (by number):**
  - DR-NNNN — *(brief one-liner of how it applies)*
- **Existing files to be modified:**
  - `<exact-path>` — read this; you'll modify it.
- **Source-of-truth files for facts:**
  - `<schema-file>` — for any column or type reference.
  - `<api-spec>` — for any contract reference.

**Do not** read full feature specs, the entire technical-requirements doc, or unrelated discipline files. If a standard is missing a rule you need, write `CONFIRM:` and stop.

---

## 3. Goal (one sentence)

*What will exist after this task that doesn't exist now?*

---

## 4. What to produce

| Type | Exact path(s) | Notes |
|------|---------------|-------|
| New file | | |
| Modified file | | |
| New test | | |
| New scope addition | | |

---

## 5. What to leave for another task

Explicit scope boundary. The brief defines the edges so they're not silently expanded.

- *(e.g. "Do not change the migration file — that's a separate task")*
- *(e.g. "Do not refactor the surrounding component — that's tech debt, not this scope")*

---

## 6. Non-negotiables for this task

- *(e.g. "All monetary values as integer minor units (see DR-NNNN)")*
- *(e.g. "Server-only — no client-side calls to the new API")*
- *(e.g. "Type-check after every file change — `tsc --noEmit`")*

---

## 7. Definition of done

- [ ] Goal achieved (file(s) produced, tests passing)
- [ ] Plan written and approved before Act
- [ ] All `CONFIRM:` resolved before Act
- [ ] Coding standards followed (`engineering/coding-standards.md`)
- [ ] Tests for new behaviour
- [ ] Type check passes
- [ ] No `.skip` / `.only` / placeholders left
- [ ] Scope file updated with what was actually built
- [ ] Reviewer assigned

---

## 8. Reviewer

Named at brief-creation time. Reviewer reads the diff against the scope and the standards.

**Reviewer:** _____________________
