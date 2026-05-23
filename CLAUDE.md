# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16.2.6** with App Router — **read `node_modules/next/dist/docs/` before writing any Next.js code** (APIs differ significantly from prior versions)
- React 19.2.4, TypeScript 5 (strict), Tailwind CSS 4
- Path alias: `@/*` → project root

## Key Next.js 16 Patterns

**Server vs Client Components:** All layouts and pages are Server Components by default. Add `'use client'` only when you need state, event handlers, lifecycle hooks, or browser APIs.

**Data fetching:** Fetch in async Server Components directly — `export default async function Page() { const data = await fetch(...) }`. For caching, use the `'use cache'` directive with `cacheLife()` from `next/cache`. Enable with `cacheComponents: true` in `next.config.ts`.

**Data mutation:** Use Server Functions with the `'use server'` directive. Always verify auth inside every Server Function — they are reachable via direct POST requests.

**Instant navigation:** For routes that should navigate instantly, export `unstable_instant` alongside `Suspense` boundaries wrapping uncached data. See `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`.

**Route params:** In Next.js 16, `params` is a `Promise` — always `await params` before accessing its properties.

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

**Navigation:** Use `<Link href="...">` (from `next/link`) for client-side navigation with automatic prefetching. Plain `<a>` tags disable prefetching.

## Project Structure

```
app/          # App Router: layouts, pages, route handlers
public/       # Static assets
```

The project is a minimal starter — no database, auth, or API routes exist yet. Business logic for the lifting diary features is yet to be implemented.
