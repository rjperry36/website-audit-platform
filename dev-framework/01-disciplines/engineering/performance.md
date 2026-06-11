---
description: Performance — server/client split, images, caching, bundle size, query patterns
last_reviewed: 2026-05-18
review_cadence_days: 90
anchors:
  - id: core-web-vitals
    claim: "Core Web Vitals 'good' thresholds: LCP < 2.5s, INP < 200ms, CLS < 0.1."
    sources:
      - https://web.dev/articles/vitals
  - id: lcp-threshold
    claim: "Largest Contentful Paint 'good' threshold is 2.5 seconds."
    sources:
      - https://web.dev/articles/lcp
  - id: inp-threshold
    claim: "Interaction to Next Paint 'good' threshold is 200 milliseconds."
    sources:
      - https://web.dev/articles/inp
  - id: cls-threshold
    claim: "Cumulative Layout Shift 'good' threshold is 0.1."
    sources:
      - https://web.dev/articles/cls
---

# Performance

Read at Phase 4 when the work involves images, data fetching, caching, the server/client split, or third-party scripts. Performance choices are easy to miss at implementation time and expensive to fix later.

The framework target: **Core Web Vitals "good" thresholds on every public page** — LCP under 2.5s, INP under 200ms, CLS under 0.1, on a mid-range mobile device on a 4G connection. Internal admin tools have looser targets but should still feel responsive.

---

## 1. Server vs client rendering

For frameworks with a server/client component split:

- **Default to server-rendered.** Data fetching, DB queries, static rendering — zero JS cost to the browser.
- **Mark client only when needed:** state, effects, event listeners, browser APIs, third-party client libraries.
- **Fetch data server-side; pass as props.** Don't fetch inside a client component when a server parent could fetch and pass down.
- **Push the client boundary down.** The `'use client'` (or equivalent) marker goes on the leaves, not the trunk.

---

## 2. Images

Use the framework's image component (or `<picture>` for hand-rolled HTML) with:

| Attribute | Why |
|-----------|-----|
| `alt` | Required; descriptive (see accessibility) |
| `width` / `height` (or `fill`) | Required; prevents layout shift |
| `quality` | 75 default; 60 acceptable for backgrounds |
| `sizes` | Required for responsive images |
| `priority` / `loading="eager"` | One above-the-fold image per page only |

- Source images < 200 KB before optimisation. Compress images > 500 KB before committing.
- For carousels: render only the current and adjacent images. Don't load all of them at once.

---

## 3. Caching and revalidation

Cache aggressively; invalidate explicitly.

| Page type | Typical revalidation window |
|-----------|------------------------------|
| Homepage / marketing | 1 hour |
| Listing pages | 5 minutes |
| Detail pages (slow-changing) | 24 hours |
| Admin pages | 0 (no cache) |

Pair long windows with **on-demand revalidation** in mutation handlers — when something changes, push an invalidation rather than waiting for the window.

**Never `revalidate: 0` on public pages.** Regenerating every request kills performance under load.

---

## 4. Data fetching patterns

```
// Parallel for independent data
const [posts, comments, related] = await Promise.all([
  getPosts(), getComments(), getRelated(),
]);

// Sequential only when later calls depend on earlier ones
const user = await getUser(id);
const posts = await getPostsBy(user.id);
```

- Fetch at the page level. Pass results down as props.
- Avoid N+1 queries — fetch lists in one query, not per-item.
- Paginate everything that grows. Even "this list will only ever have 50 items" — it will have 50,000 eventually.

---

## 5. Bundle size

- Never import an entire library when one function is needed.
- Audit new dependencies. Run a production build; check the per-route bundle output. > 50 KB added requires justification in a decision record.
- Dynamic-import below-the-fold and modal content.

Run a bundle analyser at least once per release cycle. Bundles drift up otherwise.

---

## 6. Third-party scripts

Every third-party script (analytics, chat widget, marketing tag) is a performance liability. Rules:

- Load via the framework's deferred-script mechanism (the equivalent of `defer` / `lazy` script loading).
- Self-host where the vendor allows and the licence permits.
- Audit the **rendered** weight in production — not the script tag size.
- Tie analytics to consent (see content / compliance) — but also tie loading to consent: don't pay the perf cost until the user agreed.

---

## 7. Database / query performance

- **Index every column used in a WHERE, ORDER BY, or JOIN.** Add indexes proactively at schema definition time, not after EXPLAIN shows a table scan.
- **Avoid SELECT *.** Whitelist columns.
- **Avoid query in a loop.** Move the loop into the query (IN, JOIN, batch).
- **Use connection pooling appropriately.** Serverless functions in particular need a pooler or they exhaust DB connections.

---

## 8. Pre-implementation checklist

```
[ ] New components default to server-rendered unless interactivity required
[ ] Client boundary at the leaves, not the trunk
[ ] All images have width/height (or fill), descriptive alt, sizes
[ ] One above-the-fold image marked priority per page; no more
[ ] Source images < 200 KB
[ ] Revalidation windows set per page type
[ ] On-demand invalidation called in mutations that change published content
[ ] Parallel data fetching where data is independent
[ ] No library imported in full when a single function would do
[ ] Bundle-size check before production deploy
[ ] All new query columns indexed
[ ] No queries inside loops
[ ] Third-party scripts deferred and tied to consent if relevant
```
