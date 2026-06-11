---
description: Test automation — how to write tests that earn their keep
last_reviewed: 2026-05-18
review_cadence_days: 90
---

# Test Automation

Tests are code. They cost what they cost to write, and they cost (more) what they cost to maintain. Good automation pays back the cost many times over; bad automation is a drag.

---

## 1. The four good-test traits

Every automated test earns its keep by being:

1. **Fast** — sub-second for unit, single-digit seconds for integration, low-minute for E2E. Slow tests get skipped.
2. **Deterministic** — same input, same outcome. No flakiness. Time, randomness, network are isolated or mocked.
3. **Focused** — tests one thing. A failed test points at the bug, not at "something somewhere broke."
4. **Readable** — the test as a sentence: *Given X, when Y, then Z.* If the reader can't tell what it's testing, neither can future-you.

A test missing one of these is a candidate to refactor or delete.

---

## 2. Patterns

### Unit tests

Pure functions. No I/O. Direct assertions.

```
describe('priceWithTax', () => {
  it('applies 20% VAT to a net price', () => {
    expect(priceWithTax(10_00, 0.20)).toBe(12_00);
  });

  it('returns the input when tax is zero', () => {
    expect(priceWithTax(10_00, 0)).toBe(10_00);
  });

  it('throws when price is negative', () => {
    expect(() => priceWithTax(-1, 0.2)).toThrow();
  });
});
```

### API / handler tests

Mock auth and persistence; test the handler's logic.

```
it('rejects unauthenticated requests', async () => {
  mockAuth({ user: null });
  const res = await POST(new Request(url, { method: 'POST' }));
  expect(res.status).toBe(401);
});

it('returns 429 after rate limit', async () => {
  for (let i = 0; i < 5; i++) await POST(req);
  const res = await POST(req);
  expect(res.status).toBe(429);
});
```

Test the four cases: valid, invalid input, unauthorised, rate-limited.

### Integration tests

Real DB (an isolated branch / container) + real handlers. Use seed data.

```
beforeEach(async () => seedFixture('empty-state'));

it('creates a record and updates the counter', async () => {
  const r = await createRecord({ id: 'x', qty: 1 });
  expect(r.success).toBe(true);
  expect(await getCounter('x')).toBe(originalCount - 1);
});

it('handles concurrent contention for the last available unit', async () => {
  await createRecord({ id: 'x', qty: 1 });
  const second = await createRecord({ id: 'x', qty: 1 });
  expect(second.success).toBe(false);
});
```

### E2E tests

Real browser, real server, test mode for payments.

```
test('user can complete checkout', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="primary-cta"]');
  // ... full flow
  await expect(page.locator('h1')).toHaveText(/thank you/i);
});
```

Use `data-testid` (or framework equivalent) — selectors based on copy or class names are brittle.

---

## 3. Test file conventions

Tests live **next to the code they test** (preferred) or in a parallel `__tests__/` tree.

```
src/
  lib/
    pricing.ts
    pricing.test.ts          ← right next to it
  app/
    api/
      apply/
        route.ts
        route.test.ts
```

This makes it obvious when a module changes whether tests changed with it.

---

## 4. Mocking

- **Mock at the boundary.** External APIs, time, randomness, file system. Not internal modules.
- **Mocks are written deliberately.** Don't mock something just because it's there.
- **Mocks have expectations too.** Asserting "the right call was made with the right arguments" is part of the test.

Heavy mocking ≠ thorough test. A test that mocks everything is testing the mocks.

---

## 5. Flake management

When a test goes flaky:

1. **Investigate within 24 hours.** Flakes always have a cause — async ordering, leaking state, timezone, random data.
2. **Quarantine if necessary.** Mark it as quarantined (e.g. `.flaky`) so CI doesn't fail on it but reports include it.
3. **Track quarantines.** A monthly review of quarantined tests forces resolution.

Never silently skip / `.only` / `.skip`. Both are code smells the linter should catch.

---

## 6. CI integration

- Tests run on every PR.
- Test results published as artefacts: log, screenshots, videos (for E2E), JUnit XML.
- Coverage reports tracked over time; significant drops require a comment in the PR.
- Failed tests block merge.

---

## 7. Visual regression

For design-heavy projects, add a visual-regression tool. Rules:

- **Generated baselines** committed to the repo.
- **Diffs reviewed**, not just merged.
- **Baselines updated deliberately** — not as a way to suppress noise.

---

## 8. Load / performance testing

- For revenue-critical or high-traffic endpoints, run load tests against pre-production.
- Define SLOs (latency, error rate) before the test, not after.
- Tooling: pick a load-test runner per project; see `RECOMMENDED-TOOLS.md`.

---

## 9. Pre-implementation checklist

```
[ ] Tests for all new API routes (valid / invalid / auth / rate-limit)
[ ] Tests for all new server actions / mutations (success / unauthenticated / error)
[ ] Tests for all new utility functions
[ ] E2E coverage on every critical user path
[ ] `npm test` (or equivalent) passes locally before push
[ ] No .skip / .only / commented-out tests left
[ ] Mocks at boundaries, not on internal modules
[ ] Coverage report not regressed without justification
```
