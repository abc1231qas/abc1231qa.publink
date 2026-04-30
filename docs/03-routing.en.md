# 03 — Public routes

> Only public, unauthenticated routes are listed here. Admin routes are out of scope.

## Route table

| Method | Path | Purpose | Backend read |
|--------|------|---------|--------------|
| GET | `/` | Home (intro) | — |
| GET | `/about` | About page | — |
| GET | `/works` | Works / portfolio | — |
| GET | `/blog` | Blog index | KV (article index) |
| GET | `/blog/<collection>/<slug>` | Individual article | KV (index + rendered HTML) |
| GET | `/images/<path>` | Blog image asset | R2 |
| GET | `/llms.txt` | Site description for LLMs (GEO / AI SEO) | — |
| GET | `/robots.txt` | Crawler rules | — |
| GET | `/sitemap.xml` | Sitemap covering public pages + every blog article | KV (article index) |
| GET | `/<short-code>` | Short-link redirect — 302 to target URL | KV (short-link map) |
| any | anything else | 404 page | — |

## Dispatch order matters

The Worker resolves requests **specific first, generic last**:

1. SEO trio (`llms.txt` / `robots.txt` / `sitemap.xml`).
2. Named pages (`/about`, `/works`, `/blog`, `/blog/...`, `/images/...`).
3. Otherwise, treat the path as a short code: look it up in KV. Hit → 302. Miss → 404.

This ordering guarantees that **short codes can never shadow named pages**. `/about` is always the about page, even if a row called `about` happens to exist in the link KV.

## Two small details

- **Reserved path names**: words like `admin`, `api` are blocked when creating short codes in the admin UI. Admin is out of scope here, but the routing design forces this decision.
- **Unified 404 template**: missing short codes, missing articles, and any other unknown path all render the same 404 (template lives in the private repo).

## SEO / AI SEO notes

- **`/llms.txt`**: a description file aimed at AI crawlers — site positioning, key links, tech-stack keywords. A GEO (Generative Engine Optimization) practice.
- **Dynamic `sitemap.xml`**: built on the fly from the KV article index. Publishing a new post is enough; no static sitemap to maintain.

## Code snippet

`snippets/public-router.js` (to be added) — extracted from `src/router.js` with admin / API / auth blocks removed.
