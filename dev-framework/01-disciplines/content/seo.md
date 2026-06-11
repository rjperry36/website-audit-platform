---
description: SEO standards — metadata, structured data, headings, sitemap discipline
last_reviewed: 2026-05-18
review_cadence_days: 90
anchors:
  - id: schema-org
    claim: "Schema.org vocabulary is the basis for the structured-data types referenced by this standard."
    sources:
      - https://schema.org/
  - id: google-structured-data
    claim: "Google Search supports specific structured-data types and validates them via the Rich Results Test."
    sources:
      - https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
      - https://search.google.com/test/rich-results
  - id: open-graph
    claim: "The Open Graph protocol governs the social-preview meta tags used across major platforms."
    sources:
      - https://ogp.me/
  - id: sitemap-xml
    claim: "The sitemaps.org XML format is the canonical sitemap protocol."
    sources:
      - https://www.sitemaps.org/protocol.html
  - id: hreflang
    claim: "hreflang annotations indicate language and regional variants of a page to search engines."
    sources:
      - https://developers.google.com/search/docs/specialty/international/localized-versions
---

# SEO

Read at Phase 3 for any public-facing page. Framework-agnostic; the implementation specifics live in `STACK.md` or the engineering standards.

---

## 1. Metadata (every public page)

| Field | Rule |
|-------|------|
| `<title>` | ≤ 60 chars; ends with `| <Project Name>` (or equivalent brand suffix) |
| Meta description | 120–160 chars; written for the audience, not the brand |
| Canonical URL | Always set; prevents duplicate-content penalties |
| OpenGraph title / description / image / url | url matches canonical |
| Twitter card type | `summary_large_image` for content pages; `summary` for utility |

---

## 2. Structured data (JSON-LD)

Every public page includes a `<script type="application/ld+json">` block. Schema type per page type:

| Page type | Schema |
|-----------|--------|
| Homepage | `Organization` + `WebSite` (with `SearchAction` if site search exists) |
| Listing | `ItemList` or `CollectionPage` |
| Article / blog post | `Article` (or `NewsArticle` / `BlogPosting`) |
| Product | `Product` + `Offer` |
| Service | `Service` |
| Local business page | `LocalBusiness` |
| Event page | `Event` |
| FAQ block (any page) | `FAQPage` |
| How-to (any page) | `HowTo` |
| Breadcrumb trail | `BreadcrumbList` |

Validate every new schema with Google's Rich Results Test. Aim for 0 warnings.

---

## 3. Heading hierarchy

- **Exactly one H1 per page.** Never zero, never more.
- H1 includes the primary search intent term naturally.
- H1 differs from `<title>` — `<title>` carries brand suffix; H1 stays clean.
- H1 lives in the hero / above-the-fold area, not buried in the body.
- H2s structure the page for skimming and for answer-engine extraction.

---

## 4. URLs

- Lowercase, kebab-case, no stop-words.
- Pattern fits the page type (e.g. `[topic]-[location]` for local pages).
- Once published, never change a URL without a 301 redirect.
- Avoid URL parameters for primary-content pages; reserve them for filters and search.

---

## 5. Long-form content rules

For articles, regional / cluster pages, service pages:

- Use H2 sections for skim-readability and AI answer-engine extraction.
- Use `<ul>` / `<li>` for lists — both humans and answer engines scan them better than paragraphs.
- Aim for 600–1,500 words for landing-style content; longer for evergreen pillars where it adds substance.
- One FAQ block per significant page (drives `FAQPage` schema, surfaces in AI answers).

---

## 6. Internal linking

- **Every page links to and from at least one other.** No orphan pages.
- **Topical clustering:** cluster pages link to their pillar; pillar links back to clusters.
- **Anchor text describes the destination.** "Read our pricing guide," not "click here."

---

## 7. Images and media

- Every meaningful image has descriptive `alt`.
- Decorative images use `alt=""`.
- Above-the-fold images use `priority` (or `loading="eager"`).
- File names are descriptive: `pricing-tiers-comparison.png`, not `IMG_0042.png`.
- Image dimensions specified to avoid layout shift.

---

## 8. Sitemap and indexing

- Every new public route is added to the sitemap before launch.
- Dynamic routes pull from the data source with a `published: true` filter.
- `robots.txt` references the sitemap.
- Pages that shouldn't be indexed (admin, draft, search-results) have `noindex` set.

Sitemap priorities (typical):

| Page | Priority |
|------|----------|
| Homepage | 1.0 |
| Top-level navigation pages | 0.9 |
| Regional / cluster pages | 0.85 |
| Detail pages | 0.7 |
| Content pages | 0.6–0.8 |

---

## 9. Page experience (Core Web Vitals)

SEO and performance overlap. See `engineering/performance.md` for the implementation. The targets:

- **LCP** under 2.5 seconds
- **INP** under 200 ms
- **CLS** under 0.1
- **HTTPS** everywhere
- **No intrusive interstitials** that block content

---

## 10. International / multilingual

- Use `hreflang` for language variants of the same content.
- Use a clear URL strategy: subdirectory (`/fr/`), subdomain (`fr.example.com`), or domain (`example.fr`) — pick one per project.
- Translated meta and structured data, not auto-translated.

---

## 11. AEO (Answer Engine Optimisation)

LLM-based search (Google AI Overview, ChatGPT, Perplexity) values:

- Clear, factual writing with concrete numbers and named entities.
- Question-and-answer structures (FAQ sections, H2-as-question + paragraph-as-answer).
- Cite-able, source-able content with dates and authors.
- Structured data (`FAQPage`, `Article` with `author` and `datePublished`, `HowTo`).
- E-E-A-T signals: experience, expertise, authoritativeness, trust.

---

## 12. Pre-implementation checklist

```
[ ] Metadata set: title, description, canonical, OG, Twitter
[ ] JSON-LD schema present for the correct page type
[ ] One H1 with primary keyword, in the hero
[ ] H2 structure supports skimming and AI extraction
[ ] All images have descriptive alt (or alt="" if decorative)
[ ] URL lowercase, kebab-case, no stop-words
[ ] Sitemap updated
[ ] Internal links to / from the page
[ ] Schema validated in Rich Results Test
[ ] hreflang set if multilingual
[ ] AEO signals present (FAQ, structured data, citations)
```
