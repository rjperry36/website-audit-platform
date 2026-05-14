# Channel Style — D2C (aurelune.com)

Channel ID: `D2C`

## Posture

`aurelune.com` is the home. Every other channel exists to bring people here and then earn them a second visit. The site is calm, evidence-rich, and trusted.

## Information architecture

```
/                       Hero — Skincare in sync
/phases                 The AM/PM thinking
/phases/am              AM products + science
/phases/pm              PM products + science
/phases/always-on       Anytime products
/products               Full range, filterable by phase / skin concern / persona
/products/{slug}        PDP
/science                Editorial science hub
/science/{slug}         Long-form articles + white-paper downloads
/ritual                 Build-your-routine tool
/loyalty                The Phase Programme (loyalty)
/about                  Founder + formulator + lab partners
/journal                Editorial-style brand blog
/find-us                Stockists per market
```

## PDP structure (the heart of D2C)

Above the fold:
1. Single hero shot (product on surface)
2. 5-line scaffold (see `product-copy-framework.md`)
3. Phase badge (AM / PM / Always-on)
4. Price + size + add-to-routine button
5. Loyalty earn-rate visible

Below the fold:
6. What it does (75 words)
7. How we tested it (panel size, weeks, methodology)
8. Who it's for (persona fit)
9. How to use (5 steps)
10. Full INCI list
11. Pairs with (related products)
12. Customer voices (3 reviews max, real names, dated)
13. Read more — link to relevant science article

## CTAs

| Primary CTA | When |
|---|---|
| `Add to routine` | On PDP, replaces "Add to bag" everywhere |
| `Build your routine` | On hero, on phase pages |
| `Download the evidence` | On science articles, gates an email capture |
| `See the test` | On a claim, opens the methodology overlay |

Never use:

- ❌ `Buy now` (transactional, not relational)
- ❌ `Shop the look` (we don't do looks)
- ❌ `Try risk-free!` (we don't run discount-led trials)

## Search and AI surfaces

D2C is also the surface that **AEO** and **GEO** agents read. Every PDP must:

- Have unique meta title and description that mention the phase and the hero ingredient
- Have FAQ schema with 4–6 Q&A pairs based on real CS tickets
- Include a `science_summary` JSON-LD block (custom but valid) for AI extraction
- Cite published research in the PDP body when used

## Localisation

- Currency switches per market based on geo + user preference
- Claims swap per market (US drops EU-specific phrasing; JP swaps to compliant phrasing; CN cross-border only — entirely separate storefront)
- Photography stays consistent globally
- "Find us" surfaces local stockists per market

## Performance benchmarks (used by the budget-insight agent)

| Metric | UK target | US target | DE target | FR target | JP target |
|---|---|---|---|---|---|
| Conversion rate (visitor → order) | 2.4% | 2.8% | 1.9% | 2.1% | 1.6% |
| AOV (local currency) | £140 | $185 | €120 | €135 | ¥18,000 |
| First-order repeat rate (within 90 days) | 38% | 42% | 33% | 35% | 45% |
| Email opt-in rate | 22% | 26% | 18% | 19% | 28% |

(Targets are illustrative for the sample dataset.)
