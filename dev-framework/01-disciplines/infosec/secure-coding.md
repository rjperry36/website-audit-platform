---
description: Secure coding — patterns and anti-patterns that apply across all code
last_reviewed: 2026-05-18
review_cadence_days: 30
anchors:
  - id: owasp-top-10
    claim: "The OWASP Top 10 categories (injection, broken access control, etc.) collapse to: untrusted data crossed a boundary without the right escape function."
    sources:
      - https://owasp.org/Top10/
  - id: owasp-cheat-sheets
    claim: "OWASP Cheat Sheets are the framework's authoritative source for per-category secure-coding patterns."
    sources:
      - https://cheatsheetseries.owasp.org/
  - id: password-kdf
    claim: "Hash passwords with a slow, salted KDF (argon2id, bcrypt, or scrypt). Never general-purpose hashes for passwords."
    sources:
      - https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
---

# Secure Coding

Day-to-day secure coding practice. Applied at Phase 4 (in-flight) and verified at code review (Phase 5).

This standard sits inside InfoSec — it duplicates and reinforces items from `engineering/coding-standards.md` and `engineering/api-design.md`. Duplication is deliberate: security can't rely on developers remembering to read the security standard if they only read the engineering one.

---

## 1. Trust boundaries

Every codebase has trust boundaries — the points where untrusted data meets trusted code.

| Boundary | Untrusted side | Trusted side | Required action at boundary |
|----------|----------------|--------------|-----------------------------|
| Public API | HTTP request | Handler | Validate, authenticate, authorise |
| User input | Browser | Server | Validate, sanitise |
| External API call | Third party | Project code | Validate response shape; treat as suspect |
| Database | Persisted data | Code | Use parameterised queries; assume any stored data could be tampered |
| File upload | User-supplied bytes | Storage | Validate type, size, content |
| AI output | LLM | Project code | Sanitise on the way in and on the way out |

Cross every boundary with explicit validation. Implicit trust at any boundary is a vulnerability waiting to happen.

---

## 2. Authentication & authorisation patterns

```
// Every handler that mutates protected data starts with:
async function handler(req) {
  const user = await requireUser(req);          // throws/returns 401 if not authed
  await requirePermission(user, "do-thing");    // returns 403 if not authorised
  // ... actual work
}

// Never:
//   - check auth in the UI only
//   - check auth in the route but skip the action it calls
//   - copy a "demo mode" handler to production
```

- **Authentication** confirms *who* the caller is.
- **Authorisation** confirms *what* they're allowed to do.
- Failing either is a security event, not a UX inconvenience.

### Server-callable mutations look like UI bindings — they're not

Many modern frameworks expose server-side mutations as ergonomic function calls from the UI (server actions, server functions, RPC-style mutations, GraphQL mutations with built-in auth context). The ergonomic surface hides a hard fact:

**Every such function is a public HTTP endpoint.** Anyone with the right URL and request shape can call it directly — bypassing the UI entirely. Therefore:

- **Every server-callable mutation gets an explicit auth check at the top of the function**, regardless of how the UI invokes it.
- **Permission checks happen on the server**, not in the UI that calls them.
- **Treat each mutation as if a `curl` example for it is published on the public internet** — because functionally, it is.

This is the most common modern-framework security mistake. Code review flags absence of this check as a Severity-1 stopper.

---

## 3. Input handling

Three rules:

1. **Validate at the boundary.** Type, shape, length, format. Use a schema validator.
2. **Sanitise before persistence.** Trim, normalise, strip unsafe content. Strict default; relax explicitly.
3. **Escape at the consumer.** SQL: parameterise. HTML: escape. JSON: serialise. Each context has its own escape function.

The famous OWASP list (SQLi, XSS, command injection, path traversal, SSRF) all collapse to: untrusted data crossed a boundary without the right escape function.

---

## 4. Secrets

```
// Never:
const apiKey = "sk_live_abc123def456";

// Never:
process.env.NEXT_PUBLIC_API_KEY  // public-prefixed = sent to client

// Yes:
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error("API_KEY not configured");
```

- Secrets live in environment configuration; never source.
- Secret-scanning in pre-commit and CI.
- Public-prefixed env variables contain only genuinely public values.
- Rotate secrets on a known schedule (`SECURITY.md`).

---

## 5. SQL

Always use parameterised queries (or an ORM with parameter binding). Never string-concat user input into SQL.

```
// Yes
db.query("SELECT id FROM users WHERE email = ?", [email]);

// No
db.query(`SELECT id FROM users WHERE email = '${email}'`);
```

Stored procedures, prepared statements, and well-designed ORMs handle this for you. The only place raw SQL touches user input is in scripts authored by senior engineers with explicit awareness — and even there, parameter binding is preferred.

---

## 6. XSS and HTML rendering

- Modern framework templating auto-escapes by default. Don't disable that.
- Framework escape hatches (the equivalent of `dangerouslySetInnerHTML`, `v-html`, etc.) — only with sanitised content via a vetted HTML sanitiser. The reviewer treats every occurrence as a potential vulnerability.
- AI-generated content is **always** sanitised on the way in (before persisting) **and** on the way out (before rendering).

---

## 7. URLs and redirects

- **Open redirects** are a vulnerability. Never `redirect(req.query.target)` without validating the target.
- **URL allow-listing** beats deny-listing.
- **Server-side request forgery (SSRF)** — if your server fetches a URL the user supplied, validate the host against an allow-list; refuse private IP ranges.

---

## 8. File uploads

- Type check on the server: magic-byte sniffing, not the `Content-Type` header.
- Size limit enforced before the bytes hit storage.
- Stored with non-guessable names; never trust the user-supplied filename for storage path.
- Served with safe content types (e.g. images served as the actual image type, not `text/html`).
- If processing the upload (e.g. PDF parsing, image transforms), use sandboxed libraries; budget for the existence of malicious files.

---

## 9. Cryptography

- Use the platform's cryptographic library; do not implement primitives.
- Hash passwords with a slow, salted KDF (key-derivation function). Never general-purpose hashes like MD5 or SHA-1 for passwords.
- Random values for tokens/secrets via a cryptographically secure RNG — never the language's default `random` function.

(See `RECOMMENDED-TOOLS.md` for example KDFs and CSPRNGs per language.)
- Signing keys rotated on a known schedule; old keys honoured for a transition window then revoked.

---

## 10. Errors

- Never leak internals to the client. Stack traces, table names, paths, env variable names — all forbidden in client-facing errors.
- Log fully server-side with a correlation ID; return the correlation ID to the client so support can join the two.
- Distinguish operational errors (expected) from programmer errors (unexpected) — both go to monitoring; only one goes to the user.

---

## 11. Dependency management

- Audit new dependencies for typo-squats and unmaintained packages.
- Track CVEs via automated tooling; patch HIGH/CRITICAL within agreed SLAs.
- Pin versions; commit the lockfile.
- Prefer well-maintained, widely-used libraries over clever niche ones for security-sensitive functions.

---

## 12. Pre-implementation checklist

```
[ ] Trust boundaries identified for the work; validation at each
[ ] Auth + authorisation at the top of every protected handler
[ ] Inputs validated, sanitised, escaped per their context
[ ] No secrets in source; secret scan green
[ ] Parameterised queries everywhere
[ ] No unsanitised raw HTML rendering
[ ] No open redirects; no SSRF surface
[ ] File uploads validated server-side
[ ] Crypto via platform libraries; passwords via KDF
[ ] Errors generic to client; full detail logged
[ ] Dependencies audited; no HIGH/CRITICAL open
```
