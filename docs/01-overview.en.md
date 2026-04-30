# 01 — Overview

## What this is

[abc1231qa.cc](https://abc1231qa.cc) is a personal website running on Cloudflare Workers, with two public-facing features:

1. **Short-link redirects**: `abc1231qa.cc/<code>` resolves to a pre-registered destination URL.
2. **Blog**: An article index and individual article pages. Content comes from a separate writing pipeline (see [04 — Blog pipeline](./04-blog-pipeline.en.md)).

> Creating, editing, and tracking short links happen in a private admin area. That's outside the scope of this public repo.

## Design direction

The site follows an **Eastern Zen minimalism** aesthetic:

- Palette: warm off-white (`#F7F7F5`), ink black (`#2C2C2C`), muted gold (`#C5A065`).
- Typography: Noto Serif TC, leaning into a literary feel.
- Visual anchor: the ensō (zen circle).
- ~55% whitespace, paired with progressive fade-in animations.

See [05 — Design](./05-design.en.md).

## Stack in one line

**Cloudflare Workers** for request handling, **KV** for short-link mappings, **R2** for blog image assets, with content synced in from an external writing tool.

See [02 — Architecture](./02-architecture.en.md) and [06 — Tech choices](./06-tech-choices.en.md).

## Why this repo exists

It's a curated record of the design choices, architecture, and content pipeline behind the live site. **Not** a template to clone and deploy — a write-up of the approach.
