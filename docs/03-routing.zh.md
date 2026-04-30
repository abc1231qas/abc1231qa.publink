# 03 — 公開路由

> 這份只列「公開、不需登入」的路由。後台路由不在這裡。

## 路由表

| Method | Path | 用途 | 後端讀取 |
|--------|------|------|---------|
| GET | `/` | 首頁（個人介紹） | — |
| GET | `/about` | 關於 | — |
| GET | `/works` | 作品集 | — |
| GET | `/blog` | Blog 文章列表 | KV（文章索引） |
| GET | `/blog/<collection>/<slug>` | 單篇文章 | KV（索引 + 內文 HTML） |
| GET | `/images/<path>` | Blog 用圖片 | R2 |
| GET | `/llms.txt` | 給 LLM 的網站描述（GEO/AI SEO） | — |
| GET | `/robots.txt` | 爬蟲規則 | — |
| GET | `/sitemap.xml` | sitemap，含所有公開頁 + 所有 Blog 文章 | KV（文章索引） |
| GET | `/<short-code>` | 短網址跳轉，302 到目標 URL | KV（短網址表） |
| any | 其他 | 404 頁 | — |

## 分流順序（重點）

Worker 內處理請求是「**先特殊、再一般**」：

1. 先攔 SEO 三件套（`llms.txt` / `robots.txt` / `sitemap.xml`）
2. 再走有名字的頁面（`/about`、`/works`、`/blog`、`/blog/...`、`/images/...`）
3. 都不是的話 → 當成短碼，去 KV 查；查到就 302，查不到就 404

這個順序保證：**短碼絕對不會蓋過有名字的頁面**。例如 `/about` 永遠是「關於」頁，不會因為 KV 裡剛好有 `about` 這個短碼就被劫走。

## 兩個小設計

- **保留路徑**：`admin`、`api` 這類字眼在後台建立短碼時會被擋掉（不在公開 repo 範圍，但這是路由設計影響到的決策）。
- **404 統一模板**：不存在的短碼、不存在的文章、其他亂打的路徑，全部走同一個 404 模板（見 `src/templates/error.template.js`，未公開）。

## SEO / AI SEO 注意點

- **`/llms.txt`**：給 AI 抓站用的描述檔，內含網站定位、核心連結、技術棧關鍵字。屬於 GEO（Generative Engine Optimization）做法。
- **`sitemap.xml` 動態生成**：Blog 文章是從 KV 索引動態 build 的，新增文章後 sitemap 自動就反映，不用另外維護靜態檔。

## 程式片段

`snippets/public-router.js`（待加，會是從 `src/router.js` 抽出的純公開路由分流，拿掉 admin / API / auth 整段）。
