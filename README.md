# 🔗 縮網址服務 - Cloudflare Worker

一個功能完整、設計現代化的縮網址服務，部署在 Cloudflare Workers 上。

## 🎨 最新更新：東方禪意極簡風格 (2026-02-01)

網站已全面改版為**東方禪意極簡 (Zen Minimalism)** 風格，帶來全新的視覺體驗：

### 設計特色
- 🖌️ **墨與金配色**：米白背景 (#F7F7F5) + 墨黑主色 (#2C2C2C) + 霧金點綴 (#C5A065)
- ✍️ **思源宋體**：使用 Noto Serif TC 營造東方人文質感
- ⭕ **水墨圓圈 (Enso)**：禪宗符號作為視覺核心
- 🌫️ **大量留白**：留白比例達 55%，營造呼吸感
- ✨ **漸進式動畫**：元素依序淡入，傳遞靜謐氛圍

### 設計文檔
- 📖 [完整設計指南](./DESIGN_GUIDE.md) - 配色、字體、版面、動畫等詳細規範
- 🔄 [前後對比文檔](./DESIGN_COMPARISON.md) - 改造前後的完整對比分析

### 風格定位
從「現代科技風」轉變為「高端人文知性品牌」，適合追求內在成長、喜愛人文思考的讀者。

---

## ✨ 主要功能

### 原版功能
- ✅ 縮網址建立與管理
- ✅ 密碼保護的管理後台
- ✅ 個人介紹頁面
- ✅ 404 錯誤頁面

### 🆕 優化版新增功能

#### 1. **點擊統計追蹤**
- 自動記錄每個短網址的點擊次數
- 即時統計儀表板顯示：
  - 總連結數
  - 總點擊次數
  - 平均點擊率
- 列表按點擊次數排序

#### 2. **搜尋與過濾**
- 即時搜尋短碼和目標網址
- 快速定位特定連結

#### 3. **增強的安全性**
- 支援環境變數儲存密碼（推薦）
- 網址格式驗證（必須包含 http:// 或 https://）
- 短碼格式驗證（只允許英數字、連字號和底線）
- 防止覆蓋系統保留路徑

#### 4. **現代化 UI 設計**
- 🎨 漸層背景與玻璃擬態效果
- 🌊 流暢的動畫與過渡效果
- 📱 完全響應式設計
- 🎯 更好的視覺層次與可讀性
- 🔔 Toast 通知系統

#### 5. **改進的用戶體驗**
- 一鍵複製短網址
- 更清晰的錯誤訊息
- 載入狀態指示
- 空狀態提示
- 更直觀的操作流程

#### 6. **程式碼優化**
- 模組化的函數結構
- 更好的錯誤處理
- JSON 格式的 API 回應
- 程式碼註解完整

## 📦 部署步驟

### 1. 準備 Cloudflare Workers 環境

```bash
# 安裝 Wrangler CLI
npm install -g wrangler

# 登入 Cloudflare
wrangler login
```

### 2. 設定 KV 命名空間

```bash
# 建立 KV 命名空間
wrangler kv:namespace create "SHORT_URLS"

# 記下返回的 ID，例如：
# id = "abc123def456..."
```

### 3. 建立 wrangler.toml 設定檔

```toml
name = "url-shortener"
main = "worker-optimized.js"
compatibility_date = "2024-01-01"

# KV 綁定
kv_namespaces = [
  { binding = "SHORT_URLS", id = "你的KV命名空間ID" }
]

# 環境變數（可選，建議使用）
[vars]
# ADMIN_PASSWORD = "你的密碼"  # 不建議直接寫在這裡

# 使用 secrets 更安全
# 執行: wrangler secret put ADMIN_PASSWORD
```

### 4. 設定管理密碼（推薦方式）

```bash
# 使用 Wrangler Secrets（最安全）
wrangler secret put ADMIN_PASSWORD
# 然後輸入你的密碼

# 或在 Cloudflare Dashboard 中設定環境變數
```

### 5. 部署

```bash
# 部署到 Cloudflare Workers
wrangler deploy
```

## 🎯 使用方式

### 訪問個人主頁
```
https://你的域名.workers.dev/
```

### 訪問管理後台
```
https://你的域名.workers.dev/admin
```

### 使用短網址
```
https://你的域名.workers.dev/短碼
```

## 🔧 自訂設定

### 修改管理路徑
在 `worker-optimized.js` 中修改：
```javascript
const ADMIN_PATH = "admin";  // 改成你想要的路徑，例如 "my-secret-admin"
```

### 自訂個人資料
修改 `generateIntroHTML()` 函數中的內容：
- 名稱
- 簡介
- 社交連結
- 大頭貼

## 📊 API 端點

### 管理 API
```
POST /api/manage
Content-Type: application/json

{
  "password": "你的密碼",
  "action": "add|delete|edit",
  "key": "短碼",
  "value": "目標網址"
}
```

### 列表 API
```
GET /api/list

回應:
[
  {
    "key": "短碼",
    "value": "目標網址",
    "clicks": 點擊次數,
    "createdAt": "建立時間"
  }
]
```

### 統計 API
```
GET /api/stats

回應:
{
  "totalUrls": 總連結數,
  "totalClicks": 總點擊次數,
  "avgClicksPerUrl": 平均點擊率
}
```

## 🎨 設計特色

### 個人主頁
- 深色漸層背景
- 浮動動畫效果
- 玻璃擬態卡片
- 平滑的懸停效果
- 隱藏的管理入口（點擊頁尾的 ⚙ 圖示）

### 管理後台
- 清晰的統計儀表板
- 即時搜尋功能
- 一鍵複製短網址
- 點擊次數顯示
- Toast 通知系統

### 404 頁面
- 友善的錯誤提示
- 漸層背景設計
- 快速返回首頁

## 🔒 安全建議

1. **使用環境變數儲存密碼**
   ```bash
   wrangler secret put ADMIN_PASSWORD
   ```

2. **修改管理路徑**
   - 將 `ADMIN_PATH` 改成難以猜測的字串

3. **定期更換密碼**
   - 定期更新 `ADMIN_PASSWORD`

4. **監控使用情況**
   - 定期檢查 Cloudflare Workers 的分析數據

## 📝 版本比較

| 功能 | 原版 | 優化版 |
|------|------|--------|
| 基本縮網址 | ✅ | ✅ |
| 管理後台 | ✅ | ✅ |
| 點擊統計 | ❌ | ✅ |
| 搜尋功能 | ❌ | ✅ |
| 現代化 UI | ⚠️ | ✅ |
| 輸入驗證 | ⚠️ | ✅ |
| 錯誤處理 | ⚠️ | ✅ |
| Toast 通知 | ❌ | ✅ |
| 一鍵複製 | ❌ | ✅ |
| 環境變數支援 | ❌ | ✅ |
| 響應式設計 | ⚠️ | ✅ |
| 動畫效果 | ⚠️ | ✅ |

## 🚀 效能優化

- 使用 KV 儲存，全球低延遲
- 最小化的 JavaScript
- 內嵌 CSS，減少請求
- 高效的 DOM 操作
- 快取友善的設計

## 📱 瀏覽器支援

- ✅ Chrome/Edge (最新版)
- ✅ Firefox (最新版)
- ✅ Safari (最新版)
- ✅ 行動裝置瀏覽器

## 🤝 貢獻

歡迎提出問題和改進建議！

## 📄 授權

MIT License

---

**提示**: 如果你想使用優化版，請將 `worker-optimized.js` 重新命名為 `worker.js` 或在 `wrangler.toml` 中指定 `main = "worker-optimized.js"`。
