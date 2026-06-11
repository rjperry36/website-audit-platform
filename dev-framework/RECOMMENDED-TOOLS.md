# Recommended Tools — Optional Appendix

> **This file is optional.** The framework's standards are deliberately tool-agnostic — they prescribe categories of tooling (a schema validator, a secret scanner, a load-testing tool) but not specific products. This appendix lists *examples* of tools that fit each category, with one-line "why" notes.
>
> A project may use any of these, none of these, or its own choices. Drop or replace this file when the project's stack diverges. The framework standards do not depend on this file.

---

## How to use this appendix

When a discipline standard mentions a category — for example "use a schema validator" or "use a distributed rate-limit store" — this appendix points you at common members of that category. The rule lives in the standard; the example lives here.

If your project picks one of these, record the choice in `PROJECT_BRIEF.md` (§5 Tech stack) and, for non-obvious choices, in a decision record under `decisions/`.

---

## Engineering

### Languages and frameworks

| Category | Examples |
|----------|----------|
| Typed languages | TypeScript, Python with type hints, Go, Rust, Java, Kotlin, Swift |
| Backend frameworks | Next.js (App Router), Remix, SvelteKit, Nuxt, FastAPI, Django, Spring, Rails, Express, Hono |
| Frontend frameworks | React, Vue, Svelte, Angular, Solid, plain HTML/CSS |
| Static-site / hybrid | Astro, Eleventy, Hugo, Gatsby |

### Schema validation (where a standard says *"use a schema validator"*)

| Language | Examples |
|----------|----------|
| TypeScript / JavaScript | Zod, Valibot, ArkType, Yup |
| Python | Pydantic, attrs, marshmallow |
| Language-agnostic / wire format | JSON Schema, Protocol Buffers, Avro |

### ORM / data access (where a standard says *"use parameterised queries"*)

| Stack | Examples |
|-------|----------|
| TypeScript | Drizzle, Prisma, Kysely, MikroORM |
| Python | SQLAlchemy, Tortoise, Django ORM |
| Other | Diesel (Rust), GORM (Go), ActiveRecord (Ruby), JPA / Hibernate (Java) |

### Rate-limit / cache store (where a standard says *"use a distributed store"*)

| Use | Examples |
|-----|----------|
| Distributed key/value | Redis, Upstash, Memcached, KeyDB |
| Managed alternatives | Cloudflare KV, Vercel KV, AWS ElastiCache |

### Framework-specific helpers (image / script / error boundaries)

| Framework | Equivalent of |
|-----------|---------------|
| Next.js | `next/image`, `next/script`, `loading.tsx`, `error.tsx`, `notFound()` |
| Remix | `<Image>`, `<Script>`, `ErrorBoundary` |
| SvelteKit | image services, `+error.svelte`, `error(404)` |
| Astro | `<Image>`, `<Script>` directives |

---

## UI

### Design tooling

| Use | Examples |
|-----|----------|
| Design files | Figma, Sketch, Penpot, Adobe XD |
| Prototyping | Figma prototypes, Framer, ProtoPie, Principle |
| Design tokens | Style Dictionary, Tokens Studio, Theo |
| Iconography (single library per project) | Lucide, Heroicons, Phosphor, Material Symbols, Tabler |
| Typography | Self-hosted fonts; Google Fonts; Adobe Fonts (Outfit, Inter, IBM Plex, etc. are common pairings) |
| Component libraries | shadcn/ui, Radix UI, Headless UI, Mantine, Material UI, Chakra |
| Styling | Tailwind CSS, vanilla CSS / CSS modules, Stitches, CSS-in-JS (Emotion, styled-components) |

---

## UX and accessibility

### Research

| Use | Examples |
|-----|----------|
| Interview / usability platforms | Lookback, UserTesting, Maze, Lyssna, dscout |
| Surveys | Typeform, Tally, Google Forms, SurveyMonkey |
| Analytics for behaviour | Plausible, PostHog, Mixpanel, Amplitude, FullStory, Hotjar |
| Diary studies / longitudinal | dscout, Indeemo |

### Accessibility testing

| Layer | Examples |
|-------|----------|
| Automated (browser dev tools) | axe DevTools, Lighthouse, WAVE, Pa11y |
| Automated (CI) | axe-core, Pa11y CI, jest-axe, Playwright accessibility checks |
| Screen readers | VoiceOver (macOS / iOS), NVDA (Windows), JAWS (Windows), TalkBack (Android), Orca (Linux) |
| Colour contrast | Stark, Polypane, contrast-finder, browser dev-tools |

---

## QA

### Test runners

| Layer | Examples |
|-------|----------|
| Unit / integration (JS / TS) | Vitest, Jest, Node `node:test`, Bun test |
| Unit / integration (Python) | pytest, unittest |
| Unit / integration (Go) | `go test`, testify |
| API testing | supertest (JS), requests + pytest (Python), Hurl, RestAssured |
| E2E (browser) | Playwright, Cypress, WebdriverIO, Puppeteer |
| Mobile E2E | Detox, Maestro, Appium, XCUITest, Espresso |
| Mocking / network stubs | MSW (Mock Service Worker), nock, WireMock, VCR |
| Visual regression | Percy, Chromatic, Playwright snapshots, BackstopJS, Lost Pixel |
| Load / performance | k6, Artillery, JMeter, Locust, Gatling |
| Contract testing | Pact, Spring Cloud Contract |

---

## InfoSec

### Code-level security

| Use | Examples |
|-----|----------|
| HTML sanitisation | DOMPurify, sanitize-html, bleach (Python) |
| Secret scanning (pre-commit) | gitleaks, truffleHog, detect-secrets |
| Pre-commit framework | Husky, lefthook, pre-commit (Python) |
| Static analysis (SAST) | Semgrep, CodeQL, SonarQube, Snyk Code |
| Dependency audit | `npm audit`, `pnpm audit`, `pip-audit`, `cargo audit`, Snyk, Dependabot, Renovate |
| Dynamic analysis (DAST) | OWASP ZAP, Burp Suite, Nuclei |
| Container scanning | Trivy, Grype, Snyk Container |
| Password hashing (KDFs) | argon2, bcrypt, scrypt, PBKDF2 |
| Random / crypto primitives | `crypto.randomBytes` (Node), `secrets` module (Python), `crypto/rand` (Go), platform CSPRNGs |

### Auth and identity

| Use | Examples |
|-----|----------|
| Identity provider | Auth0, Clerk, Supabase Auth, Firebase Auth, AWS Cognito, Okta, WorkOS, self-hosted Keycloak |
| Protocols | OAuth 2.1, OpenID Connect, SAML 2.0, WebAuthn, Passkeys |
| JWT libraries | jose (JS / Python / Go), framework-built-in |

### Compliance frameworks (standards, not tools)

| Framework | Scope |
|-----------|-------|
| SOC 2 | Trust services — security, availability, processing integrity, confidentiality, privacy |
| ISO 27001 | Information security management system |
| GDPR / UK GDPR | EU/UK personal data |
| HIPAA | US health data |
| PCI DSS | Payment card data |
| CCPA | California consumer privacy |

---

## Content

### Authoring / readability

| Use | Examples |
|-----|----------|
| Readability scoring | Hemingway Editor, Grammarly, ProWritingAid; Flesch-Kincaid + similar grade scores in any text tool |
| Editorial workflow | Google Docs, Notion, Frontmatter CMS, Sanity, Contentful, Storyblok |
| SEO research | Ahrefs, Semrush, Moz, Sistrix, Google Search Console |
| Schema validation | Google Rich Results Test, Schema.org Validator |
| AI drafting (with brand-voice prompts) | Claude, ChatGPT, Gemini — see `content/brand-voice.md §3` |

---

## Operations

### CI / CD

| Use | Examples |
|-----|----------|
| CI runners | GitHub Actions, GitLab CI, CircleCI, Buildkite, Jenkins |
| Build / deploy targets | Vercel, Netlify, Cloudflare Pages, Fly.io, Render, Railway, AWS, GCP, Azure |
| Container orchestration | Kubernetes, ECS, Cloud Run, Nomad |
| Feature flags | LaunchDarkly, Statsig, GrowthBook, Unleash, ConfigCat |
| Migration tooling | per ORM (Drizzle Kit, Prisma Migrate, Alembic, Flyway, Liquibase) |

### Branching / commits

| Pattern | Where it fits |
|---------|---------------|
| Trunk-based development | Default. Short-lived branches; main always deployable |
| GitHub Flow | Light variant of trunk-based — feature branches + PRs to main |
| GitFlow | Heavier — only when release-train cadence demands long-lived release branches |
| Conventional Commits | Recommended commit-message convention — gives machine-parsable history and auto-changelog tools (`commitlint`, `release-please`, `semantic-release`) |

### Observability

| Layer | Examples |
|-------|----------|
| Logs | Datadog, New Relic, Grafana Loki, Logtail, BetterStack, AWS CloudWatch |
| Metrics / APM | Datadog, New Relic, Grafana, Prometheus, Honeycomb, Sentry Performance |
| Errors | Sentry, Bugsnag, Rollbar, Honeybadger |
| Uptime / status | BetterStack, Pingdom, UptimeRobot, statuspage.io |
| Distributed tracing | OpenTelemetry, Jaeger, Honeycomb, Tempo |

### Incident response and on-call

| Use | Examples |
|-----|----------|
| Paging / on-call | PagerDuty, OpsGenie, incident.io, Rootly, Grafana OnCall |
| Incident comms channel | Slack, Microsoft Teams, Discord, Mattermost |
| Status page | statuspage.io, Instatus, BetterStack Status |
| Post-mortem templates | incident.io, internal templates from `02-templates/post-mortem.md` |

---

## Data

### Schema / migrations

| Stack | Examples |
|-------|----------|
| TypeScript ORMs | Drizzle, Prisma, Kysely |
| Python | SQLAlchemy + Alembic, Django ORM, Tortoise |
| SQL-first migration tools | Flyway, Liquibase, sqitch, Atlas |
| Modelling / transformation | dbt, SQLMesh, Dataform |

### Storage

| Use | Examples |
|-----|----------|
| Relational | Postgres, MySQL, SQL Server, SQLite |
| Managed Postgres | Neon, Supabase, Crunchy Bridge, AWS RDS, Cloud SQL |
| Document / NoSQL | MongoDB, DynamoDB, Firestore |
| Object storage | AWS S3, Cloudflare R2, GCS, Vercel Blob, Azure Blob |
| Cache / KV | Redis, Upstash, Cloudflare KV, Vercel KV |
| Search | Elasticsearch, OpenSearch, Meilisearch, Typesense, Algolia |
| Analytics warehouse | BigQuery, Snowflake, Redshift, ClickHouse, DuckDB |

### Governance

| Use | Examples |
|-----|----------|
| Data catalog | DataHub, Amundsen, Atlan, Collibra |
| Quality / observability | Monte Carlo, Soda, Great Expectations, dbt tests |
| Lineage | dbt Cloud, OpenLineage, Marquez |
| Privacy / consent | OneTrust, Cookiebot, Osano, custom + consent-mode integrations |

---

## AI assistants (for agentic projects)

| Use | Examples |
|-----|----------|
| Chat-based coding assistant | Claude, ChatGPT, Cursor, GitHub Copilot Chat, Aider, Cline, Continue |
| Agent framework | Claude Agent SDK, LangChain, LlamaIndex, AutoGen, Vercel AI SDK |
| Embeddings / vector store | pgvector, Pinecone, Weaviate, Qdrant, Chroma, Turbopuffer |
| Evaluation | Braintrust, Langfuse, Weights & Biases, custom golden-set harnesses |

### Standards-refresh auditors (see `00-lifecycle/standards-refresh.md`)

| Use | Pattern |
|-----|---------|
| Interactive on-demand audit | A Claude Code skill that parses a standard's `anchors:` block and diffs against current sources. See `examples/stack-conventions-auditor/stack-conventions-auditor.SKILL.md` for a worked example. |
| Scheduled automated audit | A cron route (Vercel Cron, GitHub Actions, etc.) invoking the same audit logic and opening a PR with findings. See `examples/stack-conventions-auditor/route.ts` and `vercel.json` for a worked example. |
| Manual cadence review | A calendar reminder against the standard's owner. Works for small projects without automation. |

---

## What to do with this file

1. **On a new project:** read this once to see the menu. Pick a stack. Record the choices in `PROJECT_BRIEF.md` §5. Open a decision record for any non-obvious choice.
2. **On an existing project:** edit this file to reflect *your* actual tools — strike out what you don't use, add what's project-specific.
3. **If you don't want a recommended-tools file at all:** delete this file. The framework still works — the standards do not reference it.

The framework prescribes the *category* and the *standard*; the specific tool is a project decision.
