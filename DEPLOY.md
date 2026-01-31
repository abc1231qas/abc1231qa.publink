# 🚀 快速部署指南

## 前置需求

- Node.js (v16 或更新版本)
- Cloudflare 帳號
- npm 或 yarn

## 步驟 1: 安裝 Wrangler CLI

```bash
npm install -g wrangler
```

## 步驟 2: 登入 Cloudflare

```bash
wrangler login
```

這會開啟瀏覽器讓你授權 Wrangler 存取你的 Cloudflare 帳號。

## 步驟 3: 建立 KV 命名空間

```bash
# 建立生產環境的 KV
wrangler kv:namespace create "SHORT_URLS"

# 建立開發環境的 KV（可選）
wrangler kv:namespace create "SHORT_URLS" --preview
```

你會看到類似這樣的輸出：
```
🌀 Creating namespace with title "url-shortener-SHORT_URLS"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "SHORT_URLS", id = "abc123def456..." }
```

## 步驟 4: 更新 wrangler.toml

將步驟 3 得到的 ID 填入 `wrangler.toml` 檔案：

```toml
kv_namespaces = [
  { binding = "SHORT_URLS", id = "abc123def456..." }  # 替換成你的 ID
]
```

## 步驟 5: 設定管理密碼

**方法 1: 使用 Wrangler Secrets（推薦）**

```bash
wrangler secret put ADMIN_PASSWORD
```

然後輸入你的密碼（例如：`MySecurePassword123!`）

**方法 2: 在 Cloudflare Dashboard 設定**

1. 前往 Cloudflare Dashboard
2. 選擇 Workers & Pages
3. 選擇你的 Worker
4. 前往 Settings > Variables
5. 新增環境變數 `ADMIN_PASSWORD`

## 步驟 6: 選擇要使用的版本

**使用優化版（推薦）：**

```bash
# 方法 1: 重新命名檔案
mv worker-optimized.js worker.js

# 方法 2: 修改 wrangler.toml
# 將 main = "worker.js" 改成 main = "worker-optimized.js"
```

**使用原版：**

保持 `worker.js` 不變即可。

## 步驟 7: 本地測試（可選）

```bash
# 啟動本地開發伺服器
wrangler dev

# 或指定特定檔案
wrangler dev worker-optimized.js
```

然後在瀏覽器開啟 `http://localhost:8787`

## 步驟 8: 部署到 Cloudflare

```bash
# 部署
wrangler deploy

# 或部署特定環境
wrangler deploy --env production
```

部署成功後，你會看到：
```
✨ Success! Uploaded 1 file (X.XX sec)
Published url-shortener (X.XX sec)
  https://url-shortener.your-subdomain.workers.dev
```

## 步驟 9: 測試你的服務

1. **訪問首頁**
   ```
   https://url-shortener.your-subdomain.workers.dev/
   ```

2. **訪問管理後台**
   ```
   https://url-shortener.your-subdomain.workers.dev/admin
   ```

3. **新增第一個短網址**
   - 輸入管理密碼
   - 短碼：`github`
   - 網址：`https://github.com/yourusername`
   - 點擊「新增連結」

4. **測試短網址**
   ```
   https://url-shortener.your-subdomain.workers.dev/github
   ```

## 步驟 10: 綁定自訂域名（可選）

1. 在 Cloudflare Dashboard 中：
   - Workers & Pages > 你的 Worker > Triggers
   - 點擊 "Add Custom Domain"
   - 輸入你的域名（例如：`s.example.com`）

2. 或在 `wrangler.toml` 中設定：
   ```toml
   routes = [
     { pattern = "s.example.com/*", zone_name = "example.com" }
   ]
   ```

## 常見問題

### Q: 部署後出現 "Error 1101: Worker threw exception"

**A:** 檢查以下項目：
1. KV 命名空間 ID 是否正確
2. `wrangler.toml` 中的 binding 名稱是否為 `SHORT_URLS`
3. 程式碼中是否有語法錯誤

### Q: 無法登入管理後台

**A:** 確認：
1. 已設定 `ADMIN_PASSWORD` 環境變數或 Secret
2. 輸入的密碼正確
3. 如果沒設定環境變數，預設密碼是 `0 2k6`（有空格）

### Q: 如何查看 Worker 的日誌？

**A:** 使用以下命令：
```bash
wrangler tail
```

### Q: 如何更新已部署的 Worker？

**A:** 修改程式碼後，再次執行：
```bash
wrangler deploy
```

### Q: 如何刪除 KV 中的所有資料？

**A:** 
```bash
# 列出所有 keys
wrangler kv:key list --binding=SHORT_URLS

# 刪除特定 key
wrangler kv:key delete --binding=SHORT_URLS "key-name"
```

## 進階設定

### 設定速率限制

在 Cloudflare Dashboard 中設定 WAF 規則來限制請求頻率。

### 啟用分析

Cloudflare Workers 自動提供基本分析，可在 Dashboard 查看。

### 設定告警

在 Cloudflare Dashboard 中設定告警規則，當錯誤率過高時通知你。

## 更新與維護

### 更新 Worker

```bash
# 拉取最新程式碼
git pull

# 部署更新
wrangler deploy
```

### 備份 KV 資料

```bash
# 匯出所有資料
wrangler kv:key list --binding=SHORT_URLS > kv-backup.json
```

### 還原 KV 資料

```bash
# 需要自行撰寫腳本來批次匯入
```

## 成本估算

Cloudflare Workers 免費方案：
- ✅ 每天 100,000 次請求
- ✅ 10ms CPU 時間/請求
- ✅ 1GB KV 儲存空間
- ✅ 1,000 次 KV 寫入/天
- ✅ 100,000 次 KV 讀取/天

對於個人使用，免費方案通常已足夠！

## 下一步

- 🎨 自訂個人主頁的內容和樣式
- 🔒 修改管理路徑為更安全的字串
- 📊 定期檢查統計資料
- 🌐 綁定自訂域名
- 📱 分享你的短網址服務！

---

**需要幫助？** 查看 [Cloudflare Workers 官方文件](https://developers.cloudflare.com/workers/)
