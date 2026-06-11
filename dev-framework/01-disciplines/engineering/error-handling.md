---
description: Error handling — three failure states (loading / error / empty), error responses, user feedback
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Error Handling

Read at Phase 4. Every user-facing surface handles three states: **loading**, **error**, **empty**. A blank screen or unhandled rejection is never acceptable.

---

## 1. The three states

For every page or component that fetches or mutates data:

- **Loading** — a skeleton, spinner, or `aria-busy` indicator with non-empty placeholder space.
- **Error** — a visible message in the UI's voice + a way to retry. Don't dump the exception text.
- **Empty** — explicit copy explaining there's no data and what the user can do next.

Frameworks with route-level loading and error boundaries — use them. Every new route segment ships with both. (See `RECOMMENDED-TOOLS.md` for framework-specific equivalents.)

---

## 2. Server-side handler returns

Server handlers return a typed result. They don't throw to the client.

```
// Good
function approve(id): Result {
  try {
    requireAuth();
    // ...
    return { success: true };
  } catch (e) {
    logError("approve failed", { id, error: e });
    return { success: false, error: "Failed to approve. Please try again." };
  }
}
```

Client code:

```
const r = await approve(id);
if (!r.success) showError(r.error);
```

Never `throw` something that ends up at the client. Throws hit the UI as unhandled rejections — generic, panic-inducing, and untranslatable.

---

## 3. HTTP routes

Follow the API design module's standard envelope.

- Return generic messages to the client.
- Log the full error server-side, structured.
- Use correct status codes.
- Always include `success: false` so client code checks one field.

---

## 4. Client-side error UX

```
// Disable on submit
<button disabled={isPending} aria-busy={isPending}>
  {isPending ? "Submitting…" : "Submit"}
</button>

// Surface errors next to the cause
{fieldError && <p role="alert">{fieldError}</p>}

// Top-level errors are global; field errors are local
```

Rules:

- Disable submit buttons while in-flight — prevents double-submission.
- Use `role="alert"` (or framework equivalent) so screen readers announce errors immediately.
- Show errors **next to the field** that caused them, not only at the top of the form.

---

## 5. Empty states

Every list, table, search, or filter result handles empty with helpful copy:

```
{items.length === 0 && (
  <EmptyState
    title="No results"
    body="Try broadening your search or starting a new one."
    action={<Link href="/new">Start over</Link>}
  />
)}
```

Silent empty (rendering nothing) is a bug.

---

## 6. Not-found cases

When a dynamic route can't find its resource, return the framework's canonical not-found response. Never render a blank page or generic 500.

---

## 7. Recoverable vs unrecoverable

- **Recoverable** — show the error and a retry. User keeps their context.
- **Unrecoverable** — show a full-page error with support contact and a "go home" link. Log loudly.

Most errors are recoverable. If the only option is "support contact," you've under-handled.

---

## 8. Error catalogue (project-level)

For larger projects, maintain a `docs/error-catalogue.md` mapping internal error codes to user-facing messages. Avoids drift ("Error 412" appearing as three different sentences across the UI).

---

## 9. Pre-implementation checklist

```
[ ] Each new route segment has loading and error boundaries
[ ] Server handlers return { success, error? } — never throw to client
[ ] HTTP routes use standard envelope with correct status codes
[ ] Error messages to client are generic; full error logged server-side
[ ] Submit buttons disabled while in-flight
[ ] Errors announced via role="alert" (or framework equivalent)
[ ] All lists have an empty-state with helpful copy
[ ] Dynamic routes use the framework's notFound() for missing resources
[ ] Recoverable vs unrecoverable distinction explicit
```
