---
description: Universal coding standards — applies regardless of language or framework
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Coding Standards

Framework- and language-agnostic. Language-specific tightening (strict-mode flags, type-hint requirements, linter configurations) is recorded in the project brief or a `_local/` standard. See `RECOMMENDED-TOOLS.md` for example language and tooling choices.

---

## 1. Types and contracts

- **Type at the boundary, once.** Define the shape where data enters (API response, DB query, form input) and reuse it downstream. Avoid re-typing the same shape three times in three modules.
- **No type escape hatches** — the language equivalents of `any`, unchecked casts to a specific type, or suppressing the type checker — unless the deviation is recorded and short-lived.
- **Functions declare their inputs and outputs.** Public functions/methods have explicit signatures. Internal helpers can infer, but module boundaries cannot.
- **Null-safety is enforced.** Languages without first-class null-safety must use the project's chosen guard pattern (Option, Result, `if (x == null)` early-return). Pick one and stick to it.

---

## 2. Naming

- Names describe **what something is**, not how it's implemented.
- Avoid abbreviations except for project-domain terms documented in `CONVENTIONS.md` or the brand book.
- Boolean names are predicates: `isReady`, `hasPermission`, `canSubmit`.
- Constants are uppercased only if they're truly project-wide; module-local constants follow the language's idiom.
- Files are named after their primary export.

---

## 3. Module boundaries

- **One responsibility per module.** If a module's name needs "and", it's two modules.
- **Pure functions where possible.** A pure function has no side effects and the same input always yields the same output. Pure functions are trivially testable and trivially safe.
- **Side effects at the edges.** I/O, DB writes, network calls, file writes — these live in well-named functions that the rest of the code calls. The middle of the codebase stays pure.

---

## 4. Comments

- Comments explain **why**, not **what**. The code shows what; the comment explains intent.
- A comment is a sign the code couldn't say it itself. First try to make the code clearer.
- TODO comments include: who, when (date), why, and a tracking link or scope file. `// TODO` with no context is banned.

---

## 5. Imports

- Order imports: standard library, third-party, project — separated by a blank line. Enforced by linter.
- Avoid wildcard imports except where the language idiom requires them.
- Never import an entire library when one function is needed (tree-shaking matters; bundle size matters; reading is easier when imports are precise).

---

## 6. Banned patterns

These are universally banned unless explicitly justified in a decision record:

- **Dead code.** Commented-out blocks. "Will need this later" code. Delete it; Git remembers.
- **Magic numbers / strings.** Extract to a named constant or config value.
- **Deep nesting.** More than three levels of `if`/`for`/`try` is a smell — extract a function or invert the conditions (early return).
- **Long functions.** A function that doesn't fit on one screen is a candidate to split. Hard rule of thumb: 40 lines.
- **Mutating shared state across modules.** Pass values; return new ones; isolate mutation to single owners.
- **Try/catch as control flow.** Use exceptions for *exceptional* cases. Validation belongs in a validator.

---

## 7. Logging

- **No PII in logs.** Use IDs (UUID, opaque tokens), not emails or names.
- **Structured logs.** Key/value pairs, not free-form sentences. Makes searching tractable.
- **Distinguish levels.** `debug` (local only), `info` (significant events), `warn` (recoverable issues), `error` (unrecoverable). Don't `console.log` everywhere.
- **Never log secrets** — API keys, tokens, passwords, full request bodies that may contain them.

---

## 8. Concurrency and ordering

- **Don't assume order** of asynchronous operations unless you've explicitly serialised them. Race conditions hide here.
- **Idempotency for retries.** Any operation that might be retried (webhook handler, queue consumer, cron job) must be safe to run twice.
- **Locks and transactions** are used where the data model says they must be — not as a precaution.

---

## 9. Pre-implementation checklist

```
[ ] Types defined at the boundary; no escape hatches planned
[ ] Functions have explicit signatures
[ ] Module names describe one responsibility each
[ ] Pure functions identified; side effects pushed to the edges
[ ] No magic numbers / strings planned
[ ] No deep nesting / long functions planned
[ ] Logging level for new logs decided; no PII
[ ] Concurrency assumptions documented (if any)
[ ] Linter / formatter rules respected
[ ] Pre-commit hooks pass cleanly
```
