---
description: API and server-handler design — response shapes, validation, auth, rate limiting
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# API Design

Read at Phase 3 whenever new HTTP routes, server handlers, RPC endpoints, or external integrations are introduced. Consistent API shape prevents a whole class of bugs and onboarding pain.

---

## 1. Choosing the right pattern

| Use case | Pattern |
|----------|---------|
| Form submission from a client UI | Server action / RPC-style mutation |
| Admin CRUD | Server action |
| Triggered by an external system (webhook, cron) | HTTP route |
| Polled by client JS (autocomplete, search) | HTTP route |
| File uploads from client | HTTP route (mutation patterns often have body-size limits) |
| Long-running work | Queue + worker; expose a status endpoint |

Default to whichever pattern has built-in CSRF protection in your framework and co-locates with the feature.

---

## 2. Standard response shape

Pick one shape; apply it everywhere. No exceptions.

```
type ApiResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```

Server-side handlers return the same shape without the HTTP wrapper.

This shape gives the client a single field to check (`success`), prevents accidental leaking of internal error structures, and is identical across HTTP and RPC-style calls.

---

## 3. HTTP status codes

| Situation | Status |
|-----------|--------|
| Success | 200 |
| Resource created | 201 |
| No content | 204 |
| Bad input / validation | 400 |
| Unauthenticated | 401 |
| Forbidden | 403 |
| Not found | 404 |
| Conflict (e.g. duplicate, version mismatch) | 409 |
| Rate limit exceeded | 429 |
| Server error | 500 |
| Upstream error | 502 / 503 |

---

## 4. Input validation

Server-side, always. Client validation is UX; trust comes from the server.

Every endpoint:

1. Parse the body safely (try/catch on JSON parse).
2. Validate types and shapes.
3. Validate required fields.
4. Validate lengths.
5. Validate formats (regex / spec-driven).
6. Trim and normalise before persisting.

Use a schema validator wherever validation grows past trivial — it removes 80% of the boilerplate and types the validated output for free. (See `RECOMMENDED-TOOLS.md` for example validators per language.)

---

## 5. Rate limiting

Every publicly accessible endpoint (no auth required) must have rate limiting.

- Low-traffic / single-instance: in-memory counter is fine.
- Production / multi-instance / serverless: use a distributed key/value store. In-memory counters are useless on serverless because every cold start resets them. (See `RECOMMENDED-TOOLS.md` for examples.)
- Identify the caller by the strongest signal available — prefer CDN-provided IP headers over `x-forwarded-for`. Never trust either alone; combine with user-agent or session where available.

---

## 6. Return only what's needed

- Never `SELECT *` on a public endpoint.
- Whitelist fields explicitly. This saves bandwidth and prevents accidental leakage of internal fields.
- Paginate any list endpoint with an upper bound. "Just return everything" scales until it doesn't.

---

## 7. Webhooks and cron endpoints

- Validate a shared secret. The check must be **unconditional** — missing env var also rejects.
- Be idempotent. Webhooks retry; your handler runs twice — fine, second time is a no-op.
- Verify signatures where the provider supports them — most payment, messaging, and developer-platform vendors do.
- Webhook handlers acknowledge fast; do work asynchronously.

---

## 8. Error responses

1. Never return a raw exception message to the client. May contain stack traces, table names, or internal paths.
2. Always log the full error server-side with structured data before returning a generic message.
3. Distinguish 4xx (caller error) from 5xx (server error). Validation failure is 400, not 500.
4. Include a correlation ID in the response and the log — makes support faster.

---

## 9. Versioning

- Public APIs are versioned in the URL (`/v1/...`) or via a header. Pick one; document it.
- Breaking changes go in a new version. Old versions are deprecated on a stated timeline.
- Internal APIs can evolve freely — but consumers (mobile apps, partners) cannot be broken silently.

---

## 10. Pre-implementation checklist

```
[ ] Pattern chosen (HTTP route vs server action) and documented if non-obvious
[ ] All responses use { success, data/error } shape
[ ] Correct HTTP status code per response path
[ ] Inputs: required + type + length + format check
[ ] Rate limiting on every unauthenticated endpoint
[ ] Distributed store used if multi-instance / serverless
[ ] Only required columns selected — no SELECT *
[ ] Pagination on every list endpoint
[ ] Webhook / cron routes use shared secret + signature; idempotent; fast ack
[ ] Error responses generic; full error logged with correlation ID
[ ] Tests planned for: valid input, invalid input, unauthenticated, rate-limited
```
