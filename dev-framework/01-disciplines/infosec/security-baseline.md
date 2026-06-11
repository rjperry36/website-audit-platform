---
description: Security baseline — pre-build, pre-commit, and pre-deploy checklist
last_reviewed: 2026-05-18
review_cadence_days: 30
anchors:
  - id: owasp-top-10
    claim: "Coverage of the OWASP Top 10 is the framework's minimum web-app security baseline."
    sources:
      - https://owasp.org/Top10/
  - id: owasp-asvs
    claim: "OWASP ASVS Level 1 is the framework's minimum verification standard for any web application."
    sources:
      - https://owasp.org/www-project-application-security-verification-standard/
  - id: http-security-headers
    claim: "X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, HSTS, and a tuned CSP are required for production web apps."
    sources:
      - https://owasp.org/www-project-secure-headers/
      - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  - id: csp-baseline
    claim: "Content-Security-Policy should avoid unsafe-eval and minimise unsafe-inline."
    sources:
      - https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
---

# Security Baseline

A mandatory baseline applied at three points: Phase 3 (Standards check, before building), Phase 4 (in-flight, every change), and Phase 5 (pre-deploy, before merge).

Framework-agnostic. Project-specific specifics (database row-level-security policies, signing-key rotation, WAF rules) live in the project's `SECURITY.md`.

---

## 1. Authentication and authorisation

- [ ] **Privileged routes are protected by middleware or equivalent.** No protected page is reachable by URL alone.
- [ ] **Every server-side handler that mutates data checks auth at the top.** Handlers are callable directly — UI gating is not enough.
- [ ] **The correct credential is used for the correct scope.**
  - Service-role / admin keys → server-only, admin operations
  - Anonymous / public keys → public reads only
  - Never expose a service-role / admin key to the client (no `NEXT_PUBLIC_`, `VITE_`, etc.)
- [ ] **Privilege escalation paths reviewed.** Can a normal user become an admin via any flow? If yes, that flow is the highest-risk surface in the project.

---

## 2. Input validation and injection prevention

- [ ] **All user inputs validated server-side** before any DB write or external call — type, length, format. Client validation is UX, not trust.
- [ ] **No raw string interpolation into queries.** Use parameterised statements or an ORM.
- [ ] **No raw HTML rendering of untrusted content.** Framework escape hatches (the equivalent of `dangerouslySetInnerHTML`, `v-html`, etc.) only with sanitised content via a vetted sanitiser.
- [ ] **File uploads validate type and size server-side.** Don't trust the `Content-Type` header — check magic bytes for sensitive use cases.
- [ ] **User-supplied data escaped before embedding in HTML email templates.** Use an `escapeHtml()` helper for every dynamic value.
- [ ] **Search queries from public endpoints bounded.** Minimum length, maximum length, allowed character set. Otherwise they're a DoS vector.

---

## 3. API and route security

- [ ] **Cron and webhook endpoints validate a shared secret.** The check is unconditional — missing env var also rejects.
- [ ] **Public unauthenticated endpoints have rate limiting.** In-memory works for low traffic; use a distributed key/value store for production-grade.
- [ ] **Rate-limit identifiers are not spoofable.** Prefer infrastructure-provided IP headers (`cf-connecting-ip`, etc.) over `x-forwarded-for`; never trust either alone.
- [ ] **APIs return only the fields they need.** No `SELECT *` on a public endpoint.
- [ ] **Error messages never expose internals.** Log full error server-side; return a generic message to the client.
- [ ] **OAuth flows include a CSRF `state` parameter.** Generated server-side, validated on callback.
- [ ] **SameSite cookies + Secure flag** for any session cookie.

---

## 4. Secrets and environment variables

- [ ] **No secrets hardcoded in source.** API keys, tokens, passwords, signing keys live in `.env.local` and the deployment platform's env config only.
- [ ] **Public-prefixed env vars contain genuinely public values.** Never `NEXT_PUBLIC_SECRET_KEY` or equivalent.
- [ ] **Pre-commit secret scanning enabled.** Use a secret-scanner inside a pre-commit framework. (See `RECOMMENDED-TOOLS.md`.)
- [ ] **Rotation schedule** for long-lived secrets, with the schedule recorded.
- [ ] **No PII or secrets logged.** Use opaque IDs in logs.

---

## 5. Data exposure

- [ ] **Database access controls in place for every new table.** Row-level security, service-account scoping, or server-only access patterns — whichever your stack supports.
- [ ] **No "Enable all access for local dev" policies in production.** These grant anonymous full CRUD and are critical vulnerabilities.
- [ ] **Sensitive data isn't returned unnecessarily.** PII, internal IDs, audit fields — admin-context only.
- [ ] **File storage visibility correct.** Public for assets that need it; private by default for everything else.
- [ ] **Backups encrypted at rest** with limited access.

---

## 6. HTTP security headers (web projects)

All required:

| Header | Required value |
|--------|---------------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` (extend per project) |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `Content-Security-Policy` | Tuned to actual sources; no `unsafe-eval`; minimise `unsafe-inline` |

---

## 7. XSS, CSRF, and content security

- [ ] **AI-generated HTML sanitised on the way IN and on the way OUT.** Defends against prompt-injection-as-stored-XSS.
- [ ] **External URLs validated** before use in `href` or storage.
- [ ] **`target="_blank"` links include `rel="noopener noreferrer"`.**
- [ ] **CSRF tokens** (or framework equivalent) on every state-changing form.

---

## 8. Dependency management

- [ ] **Automated dependency audit** (`npm audit`, `pip-audit`, `cargo audit`, etc.) clean of HIGH or CRITICAL findings before production deploys.
- [ ] **Dependencies kept current** — security-relevant packages (auth, ORM, framework, crypto) on the latest minor at minimum.
- [ ] **Lockfile committed** for reproducible builds.
- [ ] **Supply chain checks** — new dependencies reviewed for typo-squatting and maintainer reputation before adding.

---

## 9. Logging and monitoring

- [ ] **Structured logs** with correlation IDs.
- [ ] **No PII or secrets in logs.**
- [ ] **Auth events logged** (login, logout, permission change, failure).
- [ ] **Anomaly alerts** for spikes in 4xx/5xx, rate-limit hits, auth failures.
- [ ] **Log retention** set per project — long enough for forensics, short enough to limit exposure.

---

## 10. Pre-deploy checklist (Phase 5 / G5)

```
[ ] All new server-side handlers have an auth check at the top
[ ] All new public endpoints either validate auth or are explicitly public
[ ] No dangerouslySetInnerHTML / v-html / equivalent without sanitisation
[ ] No new secrets in source; secret scan clean
[ ] No PII in migrations / fixtures / logs
[ ] File uploads validated server-side (type + size)
[ ] New DB tables have access controls — no "enable all" dev policies
[ ] No SELECT * on public endpoints
[ ] No PII in logs
[ ] Cron/webhook routes check the shared secret
[ ] External links use rel="noopener noreferrer"
[ ] User input escaped before HTML email embedding
[ ] Error messages generic to client; full detail logged server-side
[ ] Security headers set in framework config
[ ] Dependency audit clean of HIGH/CRITICAL
[ ] Threat model updated if attack surface changed
```

---

## 11. Outstanding issues register

Each project maintains a security register (in `SECURITY.md` or `compliance-mapping.md`) of known issues and resolution status:

```markdown
| Severity | File/Area | Issue | Status |
|----------|-----------|-------|--------|
| HIGH     | <file>    | <issue> | Open / Resolved YYYY-MM-DD / Accepted with rationale |
```

The register is reviewed at every release. Open HIGH/CRITICAL items block production deploys.
