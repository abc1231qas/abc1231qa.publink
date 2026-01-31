# 🚀 Cloudflare Worker 部署指南

## 📌 重要說明

您的專案是 **Cloudflare Worker**（不是 Cloudflare Pages），需要使用 Wrangler CLI 進行部署。

---

## 🔧 部署步驟

### 步驟 1：完成 Cloudflare 認證

#### 方法 A：OAuth 登入（推薦）

```powershell
npx wrangler login
```

這會開啟瀏覽器，請完成授權。

#### 方法 B：使用 API Token

如果 OAuth 登入失敗，可以使用 API Token：

1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. 點擊「Create Token」
3. 選擇「Edit Cloudflare Workers」模板
4. 建立 Token 並複製
5. 設定環境變數：

```powershell
$env:CLOUDFLARE_API_TOKEN="你的API_TOKEN"
```

---

### 步驟 2：建立 KV Namespace

```powershell
# 建立生產環境的 KV Namespace
npx wrangler kv namespace create "SHORT_URLS"
```

執行後會看到類似輸出：

```
🌀 Creating namespace with title "url-shortener-SHORT_URLS"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "SHORT_URLS", id = "abc123def456..." }
```

**請記下這個 ID！**

---

### 步驟 3：更新 wrangler.toml

將步驟 2 得到的 ID 填入 `wrangler.toml`：

```toml
name = "url-shortener"
main = "worker.js"
compatibility_date = "2024-01-01"

kv_namespaces = [
  { binding = "SHORT_URLS", id = "你的KV_NAMESPACE_ID" }  # ← 填入步驟 2 的 ID
]
```

---

### 步驟 4：部署 Worker

```powershell
npx wrangler deploy
```

成功後會看到：

```
✨ Success! Uploaded 1 file (XX.XX KB)
✨ Uploaded worker 'url-shortener'
✨ Published url-shortener (X.XX sec)
   https://url-shortener.你的帳號.workers.dev
```

---

### 步驟 5：設定管理密碼（可選但推薦）

目前密碼是寫死在程式碼中（`ADMIN_PASSWORD = "0 2k6"`），建議改用 Secrets：

```powershell
npx wrangler secret put ADMIN_PASSWORD
```

然後輸入您的新密碼。

接著修改 `worker.js` 第 5 行：

```javascript
// 從環境變數讀取，如果沒有則使用預設值
const ADMIN_PASSWORD = env.ADMIN_PASSWORD || "0 2k6";
```

重新部署：

```powershell
npx wrangler deploy
```

---

## 🎯 部署後測試

### 1. 訪問首頁

```
https://url-shortener.你的帳號.workers.dev/
```

應該會看到東方禪意極簡風格的個人介紹頁。

### 2. 訪問管理後台

```
https://url-shortener.你的帳號.workers.dev/admin
```

輸入密碼後可以管理縮網址。

### 3. 測試縮網址

在管理後台新增一個短網址，例如：
- 短碼：`test`
- 目標：`https://www.google.com`

然後訪問：

```
https://url-shortener.你的帳號.workers.dev/test
```

應該會自動跳轉到 Google。

---

## 🔍 常見問題

### Q1: `wrangler login` 失敗怎麼辦？

**A**: 使用 API Token 方式（見步驟 1 方法 B）

### Q2: 部署後出現 500 錯誤？

**A**: 檢查 KV Namespace 是否正確綁定：

```powershell
npx wrangler kv namespace list
```

### Q3: 如何查看部署日誌？

**A**: 

```powershell
npx wrangler tail
```

### Q4: 如何綁定自訂域名？

**A**: 

1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 選擇您的 Worker
3. 點擊「Triggers」→「Add Custom Domain」
4. 輸入您的域名（需要先將域名加入 Cloudflare）

---

## 📊 監控與管理

### 查看 Worker 狀態

```powershell
npx wrangler deployments list
```

### 查看 KV 資料

```powershell
# 列出所有 keys
npx wrangler kv key list --binding SHORT_URLS

# 讀取特定 key
npx wrangler kv key get "test" --binding SHORT_URLS
```

### 刪除 Worker

```powershell
npx wrangler delete
```

---

## 🎨 自訂設定

### 修改管理路徑

編輯 `worker.js` 第 8 行：

```javascript
const ADMIN_PATH = "my-secret-admin";  // 改成只有你知道的路徑
```

### 修改個人資訊

編輯 `generateIntroHTML()` 函數（第 92-340 行）：

- 標題（第 311 行）
- 副標題（第 312 行）
- 描述（第 318-322 行）
- 連結（第 326-330 行）

---

## 📝 快速命令參考

```powershell
# 登入
npx wrangler login

# 建立 KV
npx wrangler kv namespace create "SHORT_URLS"

# 部署
npx wrangler deploy

# 查看日誌
npx wrangler tail

# 設定密碼
npx wrangler secret put ADMIN_PASSWORD

# 查看部署列表
npx wrangler deployments list
```

---

## ✅ 檢查清單

部署前請確認：

- [ ] 已完成 `wrangler login` 或設定 API Token
- [ ] 已建立 KV Namespace 並記下 ID
- [ ] 已更新 `wrangler.toml` 中的 KV Namespace ID
- [ ] 已測試 `worker.js` 語法無誤
- [ ] （可選）已設定 `ADMIN_PASSWORD` Secret

---

**祝您部署順利！** 🎉

如有問題，請參考 [Cloudflare Workers 官方文檔](https://developers.cloudflare.com/workers/)
