# abc1231qa.cc

> 個人網站 [abc1231qa.cc](https://abc1231qa.cc) 的公開展示版本：呈現公開頁面的設計、架構與做法。
>
> Public showcase of the personal website [abc1231qa.cc](https://abc1231qa.cc) — design, architecture, and methodology behind the public-facing pages.

**Live demo / 實際網站 → https://abc1231qa.cc**

---

## 中文

這個 repo 不是可部署的完整原始碼，而是一份「公開部分」的設計與做法摘要：

- **是什麼**：架在 Cloudflare Workers 上的縮網址服務 + Blog
- **這裡有**：架構說明、公開路由設計、Blog 內容流程、設計風格、技術選型理由、精選程式片段
- **這裡沒有**：後台、登入、統計、Cloudflare 帳號設定、任何 secret

完整的私有實作（含後台、部署設定）放在另一個私有 repo。

### 目錄

- [`docs/`](./docs) — 文件（概述、架構、路由、Blog 流程、設計、技術選型）
- [`snippets/`](./snippets) — 精選程式片段（節錄，非完整原始碼）
- [`images/`](./images) — 架構圖、截圖

### License

MIT — see [LICENSE](./LICENSE).

---

## English

This repo is **not** a deployable codebase. It's a curated write-up of the public-facing parts of the site:

- **What it is**: A URL shortener + blog running on Cloudflare Workers.
- **What's here**: Architecture, public routes, blog content pipeline, design notes, tech choices, selected code snippets.
- **What's not here**: Admin panel, auth, stats, Cloudflare account configuration, any secrets.

The full private implementation (with admin and deployment config) lives in a separate private repository.

### Contents

- [`docs/`](./docs) — Write-ups (overview, architecture, routes, blog pipeline, design, tech choices)
- [`snippets/`](./snippets) — Selected code excerpts (not a runnable codebase)
- [`images/`](./images) — Architecture diagrams and screenshots

### License

MIT — see [LICENSE](./LICENSE).
