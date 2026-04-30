# 06 — 技術選型

## 一張表

| 層 | 選擇 | 用來做什麼 |
|----|------|-----------|
| 執行環境 | Cloudflare Workers | 唯一的 server-side runtime |
| Key-value 儲存 | Cloudflare KV | 短網址表、文章索引、死連結報告 |
| 物件儲存 | Cloudflare R2 | 文章 HTML、Blog 圖片 |
| 部署 / 本機開發 | Wrangler | CLI、本機 dev server、KV/R2 操作 |
| 模板 | 純 JS template literals | 不用 React / 不用 SSR 框架 |
| Markdown | `marked` + `gray-matter` | sync 時用，**不**在 Worker request time 用 |
| 測試 | Vitest + `@cloudflare/vitest-pool-workers` | 單元 + Workers 環境整合測試 |
| 寫作來源 | 外部工具（neon-prose） | 本機 markdown，由 sync 推進 KV/R2 |

## 為什麼選 Cloudflare Workers

- **不用維運伺服器**，個人專案的甜蜜點
- 全球邊緣執行，延遲低
- KV / R2 / Durable Objects 在同一個生態，bind 起來幾行設定就好
- 免費額度對個人網站足夠

放棄的選項：
- **VPS + Node**：要管 OS、TLS、log、reboot；個人專案 overhead 不值得
- **Vercel / Netlify Functions**：可以，但 KV/R2 的整合便利度不如 CF 自家
- **GitHub Pages**：純靜態，做不了短網址跳轉與動態 sitemap

## 為什麼用 KV + R2 而不是「都丟 KV」或「都丟 R2」

- KV：寫少讀多、value 小、需要邊緣讀取 → 短網址表、文章索引
- R2：大物件、不在乎邊緣寫入一致性、零 egress 費 → 文章 HTML、圖片

混用比硬要單一儲存簡單也便宜。

## 為什麼不用 React / SSR 框架

- 一個個人網站不需要客戶端 hydration
- 純字串模板 + Workers 直接回 HTML，cold start 與 bundle 都最小
- 設計風格是「靜態文字為主」，動態互動少，框架的價值打折

代價：沒有 component 化的開發體驗。對這個 repo 規模可以接受。

## 為什麼 markdown 渲染放在 sync、不放在 Worker

- Worker 要快、bundle 要小，不適合塞 markdown parser
- 文章寫一次、讀很多次 — 渲染應該攤在寫入端
- Sync 階段慢一點沒差，那是離線批次

詳見 [04 — Blog pipeline](./04-blog-pipeline.zh.md)。

## 為什麼測試用 Vitest + Workers Pool

- `@cloudflare/vitest-pool-workers` 直接在 `workerd`（Workers 執行環境）裡跑測試
- 比 mock `fetch` / `Request` / `Response` 真實得多
- 與 `wrangler dev` 用同一個 runtime，行為差異最小

## 不用的東西（明列）

- TypeScript：純 JS 即可，個人專案複雜度不需要
- 任何 ORM：KV/R2 是 key-value / object，不需要
- CSS framework（Tailwind 等）：手寫 CSS 配合禪意設計更可控
- Build / bundler 額外工具鏈：Wrangler 自帶就夠

## 風險與限制

- **完全綁 Cloudflare**：要遷出代價高
- **KV 最終一致性**：寫入後不保證所有 edge 立刻看到。對短網址、文章內容可接受；要強一致性的功能（例如電商庫存）就不適合
- **沒有後台給作者**（指公開部分）：作者新增 / 編輯文章靠本機寫作 + sync。對這個專案是 feature 不是 bug，但對需要多人協作的場景就不行
