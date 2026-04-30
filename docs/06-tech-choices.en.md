# 06 — Tech choices

## At a glance

| Layer | Choice | Used for |
|-------|--------|----------|
| Runtime | Cloudflare Workers | Only server-side runtime |
| Key-value store | Cloudflare KV | Short-link map, article index, dead-link report |
| Object store | Cloudflare R2 | Article HTML, blog images |
| Deploy / local dev | Wrangler | CLI, local dev server, KV/R2 operations |
| Templates | Plain JS template literals | No React, no SSR framework |
| Markdown | `marked` + `gray-matter` | Used at sync time — **not** at Worker request time |
| Tests | Vitest + `@cloudflare/vitest-pool-workers` | Unit + Workers-environment integration |
| Content source | External tool (neon-prose) | Local markdown, pushed into KV/R2 by sync |

## Why Cloudflare Workers

- **No servers to run** — the sweet spot for a personal project.
- Global edge execution, low latency.
- KV / R2 / Durable Objects share one ecosystem; binding them is a few lines of config.
- The free tier covers a personal site comfortably.

Rejected alternatives:
- **VPS + Node**: OS, TLS, logging, reboots — too much overhead for a personal project.
- **Vercel / Netlify Functions**: workable, but KV/R2 integration is smoother on CF's own platform.
- **GitHub Pages**: static only — no short-link redirects, no dynamic sitemap.

## Why KV + R2, not "all KV" or "all R2"

- KV: write-rarely / read-often, small values, edge reads needed → short-link map, article index.
- R2: large blobs, edge write consistency doesn't matter, zero egress fees → article HTML, images.

Mixing the two ends up simpler and cheaper than forcing a single store.

## Why no React / SSR framework

- A personal site doesn't need client-side hydration.
- Plain string templates + Workers returning HTML keeps cold start and bundle size minimal.
- The design is largely static text with little interaction — a framework wouldn't earn its keep.

Trade-off: no component model. Acceptable at this repo's scale.

## Why markdown rendering happens at sync time, not in the Worker

- Workers should be fast and small — a markdown parser doesn't belong in the bundle.
- An article is written once and read many times; rendering should sit on the write side.
- Sync can afford to be slow — it runs offline in batches.

See [04 — Blog pipeline](./04-blog-pipeline.en.md).

## Why Vitest + the Workers pool

- `@cloudflare/vitest-pool-workers` runs tests directly inside `workerd` (the Workers runtime).
- Far more realistic than mocking `fetch` / `Request` / `Response`.
- Same runtime as `wrangler dev`, so behavior parity is tight.

## Things deliberately not used

- TypeScript: plain JS is enough — the project doesn't need the extra complexity.
- Any ORM: KV/R2 are key-value / objects — nothing to map.
- CSS frameworks (Tailwind etc.): hand-written CSS gives more control over the zen aesthetic.
- Extra build / bundler tooling: Wrangler's built-in toolchain covers it.

## Risks and limits

- **Total Cloudflare lock-in**: migrating off would be expensive.
- **KV is eventually consistent**: writes don't appear at every edge instantly. Fine for short links and blog content; not suitable for, say, e-commerce inventory.
- **No author-facing admin in the public part**: new posts and edits happen offline + sync. A feature for this project, but a non-starter if multi-author collaboration is needed.
