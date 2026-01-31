# 🚀 快速開始指南

本指南將幫助您快速部署和自訂這個東方禪意極簡風格的縮網址服務。

---

## 📋 前置需求

- Node.js (v16 或更高版本)
- Cloudflare 帳號
- 基本的命令列操作知識

---

## ⚡ 5 分鐘快速部署

### 步驟 1：安裝 Wrangler CLI
```bash
npm install -g wrangler
```

### 步驟 2：登入 Cloudflare
```bash
wrangler login
```

### 步驟 3：建立 KV 命名空間
```bash
wrangler kv:namespace create "SHORT_URLS"
```
**記下返回的 ID**，例如：`abc123def456...`

### 步驟 4：更新 wrangler.toml
編輯 `wrangler.toml`，將 KV ID 填入：
```toml
kv_namespaces = [
  { binding = "SHORT_URLS", id = "你剛才記下的ID" }
]
```

### 步驟 5：設定管理密碼
```bash
wrangler secret put ADMIN_PASSWORD
# 輸入你想要的密碼
```

### 步驟 6：部署！
```bash
wrangler deploy
```

🎉 **完成！** 你的網站現在已經上線了！

---

## 🎨 自訂設計

### 修改標題和內容

編輯 `worker.js` 中的 `generateIntroHTML()` 函數：

```javascript
// 修改標題
<h1>靜觀</h1>  // 改成你想要的標題

// 修改副標題
<div class="subtitle">CONTEMPLATION</div>

// 修改描述文字
<div class="description">
  於喧囂中尋一方淨土<br>
  在代碼裡悟人生哲理<br>
  技術與人文的交匯處<br>
  即是心之所向
</div>
```

### 修改配色

在 CSS 的 `:root` 區塊中調整：

```css
:root {
  --bg-rice: #F7F7F5;      /* 背景色 */
  --ink-black: #2C2C2C;    /* 主色 */
  --text-deep: #333333;    /* 標題文字 */
  --text-mid: #595959;     /* 內文文字 */
  --gold-muted: #C5A065;   /* 強調色 */
}
```

### 修改連結

```javascript
<div class="links">
  <a href="https://github.com/你的帳號" class="zen-link">Github</a>
  <a href="mailto:你的信箱" class="zen-link">Email</a>
  <a href="/blog" class="zen-link">Blog</a>
</div>
```

### 隱藏或修改水墨圓圈

如果不想要 Enso 圓圈，可以註解掉：

```html
<!-- <div class="enso"></div> -->
```

或修改其樣式：

```css
.enso {
  width: 200px;        /* 調整大小 */
  height: 200px;
  /* 其他樣式... */
}
```

---

## 🔧 進階設定

### 修改管理後台路徑

為了安全，建議修改管理路徑：

```javascript
const ADMIN_PATH = "my-secret-admin-2026";  // 改成難以猜測的路徑
```

### 使用自訂網域

在 Cloudflare Dashboard 中：
1. 進入 Workers & Pages
2. 選擇你的 Worker
3. 點擊「Triggers」
4. 新增「Custom Domain」
5. 輸入你的網域（例如：`abc1231qa.cc` 或 `me.abc1231qa.workers.dev`）

### 啟用分析功能

在 `wrangler.toml` 中加入：

```toml
[observability]
enabled = true
```

---

## 📚 文檔導覽

| 文檔 | 說明 |
|------|------|
| [README.md](./README.md) | 專案總覽和功能介紹 |
| [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) | 完整的設計規範 |
| [DESIGN_COMPARISON.md](./DESIGN_COMPARISON.md) | 改版前後對比 |
| [CHANGELOG.md](./CHANGELOG.md) | 版本變更記錄 |
| [DEPLOY.md](./DEPLOY.md) | 詳細部署指南 |

---

## 🎯 常見使用場景

### 場景 1：個人品牌網站
- 修改標題為你的名字
- 更新描述為你的個人簡介
- 加入你的社交媒體連結
- 範例網址：`https://abc1231qa.cc` 或 `https://me.abc1231qa.workers.dev`

### 場景 2：專案展示頁
- 標題改為專案名稱
- 描述改為專案理念
- 連結改為專案相關資源

### 場景 3：純縮網址服務
- 將首頁改為簡單的說明頁
- 隱藏個人資訊
- 專注於縮網址功能

---

## 🐛 疑難排解

### 問題：部署後顯示 404
**解決**：檢查 `wrangler.toml` 中的 `main` 欄位是否正確指向 `worker.js`

### 問題：管理後台密碼錯誤
**解決**：重新設定密碼
```bash
wrangler secret put ADMIN_PASSWORD
```

### 問題：KV 儲存無法使用
**解決**：確認 `wrangler.toml` 中的 KV ID 正確

### 問題：字體無法載入
**解決**：檢查網路連線，Google Fonts 需要外部連線

---

## 💡 最佳實踐

### 安全性
- ✅ 使用 `wrangler secret` 儲存密碼
- ✅ 修改管理路徑為難以猜測的字串
- ✅ 定期更換密碼
- ✅ 監控 Workers 使用量

### 效能
- ✅ 使用 Cloudflare 的全球 CDN
- ✅ 啟用 KV 快取
- ✅ 最小化 JavaScript 和 CSS

### 維護
- ✅ 定期備份 KV 資料
- ✅ 監控錯誤日誌
- ✅ 更新 Wrangler CLI

---

## 🎨 設計哲學

這個設計遵循以下原則：

1. **少即是多**：移除不必要的元素
2. **留白為王**：給內容呼吸的空間
3. **細節致勝**：精緻的動畫和過渡
4. **人文關懷**：溫暖而非冰冷的科技感

---

## 📞 需要幫助？

- 📖 閱讀 [完整文檔](./README.md)
- 🎨 查看 [設計指南](./DESIGN_GUIDE.md)
- 🔄 參考 [變更日誌](./CHANGELOG.md)

---

**祝你使用愉快！** 🎉

如果你喜歡這個設計，歡迎分享給更多人。
