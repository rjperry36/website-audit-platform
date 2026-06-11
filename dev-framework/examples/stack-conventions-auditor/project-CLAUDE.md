# Project Conventions — Next.js + Vercel + Neon

<!--
  EXAMPLE FILE — part of `examples/stack-conventions-auditor/` in the Dev Framework.

  When adopting in a real project: copy to the project root, rename to `CLAUDE.md`,
  update `audit.owner` and any anchors, then ignore this comment block.

  This file is the source of truth for engineering conventions on this project.
  It is read by Claude Code (and other AI assistants) on every session.

  Audit metadata — DO NOT REMOVE. The stack-conventions-auditor uses these anchors.
-->

```yaml
audit:
  last_reviewed: 2026-05-17
  next_version: "15.x"
  react_version: "19.x"
  tailwind_version: "4.x"
  neon_driver_version: "1.x"
  node_version: "20.x"
  review_cadence_days: 30
  owner: PLACEHOLDER@example.com
```

---

## How to use this file

This is the project's engineering constitution. Three rules:

1. **If a convention here is wrong, fix it here first**, then change the code. Don't let drift accumulate.
2. **Anything not covered defers to the framework's current docs** — but flag it so the auditor can pick it up.
3. **The auditor runs monthly via Vercel Cron**. When it opens a PR proposing updates, review and merge or reject. Don't ignore.

---

## 1. Architecture & Rendering

- **React Server Components by default.** Zero bundle cost, server-side data access. The whole tree is RSC unless a leaf needs interactivity.
- **`use client` is a leaf-level decision.** Push the boundary down as far as it goes. A button with `onClick` becomes a Client Component; the page wrapping it does not.
- **Stream slow work with `<Suspense>`.** Wrap any async Server Component whose data takes >200ms in a Suspense boundary with a meaningful fallback. This is the highest-leverage UX pattern in App Router and is not optional.
- **Pass server data down as props.** Don't refetch on the client what the server already fetched.
- **Co-locate features.** `app/(features)/<feature-name>/` holds the route, components, hooks, tests, and types for that feature. No global `components/` graveyard.
- **Route groups for organisation, private folders for non-route code.** Use `(group)` to organise without affecting the URL. Use `_internal` for folders the router should ignore.

## 2. Performance

- **`next/image` always.** Width and height required. Use `priority` on the above-the-fold image. Use `placeholder="blur"` for static imports.
- **`next/font`** for typography. Self-host, no external font CDN.
- **`next/script`** with the right strategy (`afterInteractive`, `lazyOnload`) for third-party scripts.
- **`next/dynamic` with care.** `ssr: false` is **only allowed inside Client Components** in Next 14+. From a Server Component, wrap the dynamic import in a Client Component first or accept SSR.
- **Pick the runtime explicitly per route.** `export const runtime = 'edge'` for lightweight, latency-sensitive routes. `'nodejs'` (default) for anything needing Node APIs or heavy dependencies.
- **Pin `preferredRegion`** to match the Neon database region (typically `iad1` or `lhr1`). Cross-region latency is the silent killer.

## 3. Data Fetching & Caching

**Critical context: Next.js 15 changed defaults.** `fetch()` and GET Route Handlers are **no longer cached by default**. You must opt in.

### Fetch (for external APIs)

- **Static external data**: `fetch(url, { cache: 'force-cache' })`
- **Real-time**: `fetch(url, { cache: 'no-store' })` (this is now the default — be explicit anyway)
- **Periodic refresh (ISR-style)**: `fetch(url, { next: { revalidate: 60 } })`
- **Tag-based**: `fetch(url, { next: { tags: ['posts'] } })` — then invalidate via `revalidateTag('posts')` from a Server Action

### Database queries (Neon)

**`fetch` cache directives do not apply to Neon queries.** Neon uses the Postgres protocol. To cache DB queries:

- **Per-request memoization**: wrap with React's `cache()`
- **Cross-request caching**: wrap with `unstable_cache(fn, keys, { tags, revalidate })`
- **Invalidation**: call `revalidateTag()` or `revalidatePath()` from the Server Action that mutated the data

Example:

```ts
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';

export const getItems = unstable_cache(
  async () => db.select().from(items),
  ['items-list'],
  { tags: ['items'], revalidate: 3600 }
);
```

### Static generation

- `generateStaticParams` for dynamic segments that can be enumerated at build time
- `revalidatePath('/path')` from Server Actions to refresh specific pages on demand

## 4. Code Quality & Styling

- **TypeScript strict mode.** No `any` in committed code. Use `unknown` and narrow.
- **Zod at every boundary.** API request/response shapes, Server Action inputs, environment variables (`zod` + `@t3-oss/env-nextjs`).
- **Tailwind CSS** as the styling default. Use **Tailwind v4** for new projects (CSS-first config via `@theme`).
- **shadcn/ui** for component primitives. Copy components in, don't import a heavy library.
- **Path aliases** (`@/components`, `@/lib`) via `tsconfig.json` — no `../../../`.
- **ESLint + Prettier** with `eslint-config-next` and `prettier-plugin-tailwindcss`.
- **Testing**: Vitest for units, Playwright for E2E. No Jest on new projects.

## 5. Routing, Metadata & Mutations

- **App Router file conventions** are mandatory: `loading.tsx`, `error.tsx`, `not-found.tsx` per route segment that needs them.
- **Metadata via the Metadata API.** `generateMetadata` for dynamic, static `metadata` export for static. Open Graph and Twitter cards on every public route.
- **File-based SEO**: `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `app/icon.tsx`.

### When to use what for backend logic

- **Server Actions** → internal mutations from your own UI (form submissions, optimistic updates, anything triggered by user interaction in this app). This is the default for mutations.
- **Route Handlers** (`app/api/.../route.ts`) → external consumers only: webhooks, OAuth callbacks, file uploads, streaming endpoints, public APIs.
- **Middleware** (`middleware.ts`) → auth gates, redirects, A/B routing, header injection. Runs on edge before requests reach routes.

## 6. Security

Treat this section as non-negotiable. Every Server Action and Route Handler is a public HTTP endpoint.

- **Auth check at the top of every Server Action.** Server Actions are POST endpoints anyone can call. Always:
  ```ts
  'use server';
  export async function deleteThing(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');
    // ... only now do the work
  }
  ```
- **Zod-validate every input** before it touches the database.
- **Environment variables**: secrets in `.env.local` (gitignored). Only `NEXT_PUBLIC_*` is exposed to the browser — treat that prefix as a tripwire.
- **Auth**: Auth.js v5 (NextAuth) or Clerk. Pick one per project and stick with it.
- **Rate limiting**: Upstash Redis + `@upstash/ratelimit` on Server Actions and Route Handlers that touch the DB or external APIs.
- **CSP and security headers** via `next.config.js` `headers()` or middleware. Minimum: `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **SQL injection**: use the Neon serverless driver's template tag (`` sql`SELECT ... WHERE id = ${id}` ``) or an ORM (Drizzle/Prisma). Never concatenate strings into queries.
- **Vercel Firewall**: enable Attack Challenge Mode on production for any project handling auth or payments.

## 7. Stack-Specific: Vercel

- **Environment variables per environment** (Development / Preview / Production). Never share Production secrets to Preview.
- **`vercel.json` `crons`** for scheduled tasks. Protect cron endpoints with `CRON_SECRET` (verify header on every invocation).
- **Vercel Analytics + Speed Insights** enabled on every production project. Two-line install, gives real-user CWV.
- **Preview deployments** are part of the dev loop. Treat them as production-equivalent for QA.
- **`preferredRegion`** set per route to match Neon region.
- **Vercel Image Optimization** is automatic — but monitor transformation count on free/Pro tiers.
- **Bundle size budget**: alert if any route's First Load JS exceeds 200KB.

## 8. Stack-Specific: Neon

### Driver selection

- **HTTP driver (`neon()`)** from `@neondatabase/serverless` — for one-shot queries in Server Components, Server Actions, and edge routes. This is the default.
- **WebSocket driver (`Pool`)** — only when you need transactions or `node-postgres` compatibility (e.g. Drizzle with `drizzle-orm/neon-serverless`, Prisma with the Neon adapter).
- **Known issue**: WebSocket pool in Next.js 15 middleware can time out on edge runtime. If middleware needs the DB, use the HTTP driver there or move the check elsewhere.

### Connection strings

Set both in Vercel environment variables:

- `DATABASE_URL` → **pooled** (PgBouncer) endpoint. Used by the app.
- `DATABASE_URL_UNPOOLED` → direct endpoint. Used only for migrations.

### ORM choice

- **Drizzle ORM** with `drizzle-orm/neon-http` is the current default. Edge-compatible, typed, no client singleton headaches.
- If using Prisma, use the Neon adapter (`@prisma/adapter-neon`) and the connection singleton pattern.

### Neon × Vercel integration

- **Enable the Neon Vercel integration.** Every PR gets its own Neon branch with its own data. Matches Vercel's preview deployment model. Non-negotiable for any project with >1 contributor.
- Pin Neon and Vercel project regions to the same place.

## 9. AI Tooling Conventions (Claude Code)

- **This file is the contract.** Claude Code reads `CLAUDE.md` at session start. Conventions go here, not in scattered comments.
- **Skills before scripts.** If a repeatable workflow exists, build it as a skill, not a one-off script.
- **Neon Agent Skills installed** — fetches up-to-date Neon docs into Claude's context on demand. Install via Neon docs.
- **The `stack-conventions-auditor` skill** runs monthly via Vercel Cron and on-demand. It compares this file against current Next.js / Vercel / Neon docs and opens a PR with proposed updates.

---

## Auditor anchors

The following list is what the auditor checks against current documentation. **Do not remove or reword these anchor lines** — the auditor matches them as fingerprints.

```yaml
anchors:
  - id: caching-defaults
    claim: "Next.js 15 does not cache fetch() or GET Route Handlers by default."
    sources:
      - https://nextjs.org/docs/app/getting-started/caching-and-revalidating
      - https://nextjs.org/docs/app/getting-started/route-handlers
  - id: dynamic-ssr-false
    claim: "next/dynamic with ssr:false is only allowed inside Client Components."
    sources:
      - https://nextjs.org/docs/app/api-reference/functions/dynamic
  - id: neon-driver-http-default
    claim: "Neon HTTP driver is the default for serverless one-shot queries."
    sources:
      - https://neon.com/docs/serverless/serverless-driver
  - id: neon-pooled-default
    claim: "DATABASE_URL should use the pooled PgBouncer endpoint."
    sources:
      - https://neon.com/docs/connect/connection-pooling
  - id: server-actions-auth
    claim: "Server Actions are public POST endpoints and require explicit auth checks."
    sources:
      - https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
  - id: tailwind-major-version
    claim: "Tailwind v4 is the new-project default."
    sources:
      - https://tailwindcss.com/docs
  - id: drizzle-neon-http
    claim: "Drizzle with neon-http is the default ORM."
    sources:
      - https://orm.drizzle.team/docs/connect-neon
```

---

_Last reviewed: 2026-05-17 — auditor will refresh monthly. To audit on-demand, invoke the `stack-conventions-auditor` skill._
