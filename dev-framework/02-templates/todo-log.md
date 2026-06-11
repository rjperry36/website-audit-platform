# {{PROJECT_NAME}} — Execution Log

> *Last updated: YYYY-MM-DD*
>
> A day-by-day log of what was attempted, what landed, and what blocked. Closed items link to their `scopes/<feature>.vN.md` record.
> Saved as `TODO.md` at project root.
>
> Update at the end of each working session.

---

## YYYY-MM-DD

- [ ] *(your first task — replace this)*
- [/] *(in progress)*
- [x] *(complete — link to the scope)* — see [scope](scopes/feature-name.v1.md)

**Blockers:** *(none / list)*
**Next steps:** *(short list of what's next)*

---

## YYYY-MM-DD

*(repeat structure)*

---

## How to use this file

- Group tasks by date (`## YYYY-MM-DD`).
- Use `[ ]` pending, `[/]` in progress, `[x]` complete.
- Link closed work: `[x] Feature name — see [scope](scopes/feature-name.v1.md)`.
- At the bottom of each day, note blockers and next steps.
- Keep recent days at top; older days fall off the bottom or move to a monthly archive (`archive/TODO-YYYY-MM.md`).
- Don't capture detailed work here — that's the scope file's job. This is a log of activity, not a notebook.

---

## Naming for follow-ups

When a task spawns a new scope or a new decision record, link it inline:

- `[ ] Investigate X` → outcome → `[x] Investigated; opening scope` — see [scope](scopes/x-investigation.md)
- `[ ] Decide on Y` → outcome → `[x] Decided` — see [DR-NNNN](decisions/NNNN-y-decision.md)
