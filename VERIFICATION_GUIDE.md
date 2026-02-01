# 🧪 部署驗證指南

## 快速驗證清單

### ✅ 第一步：訪問首頁

**網址**: https://abc1231qa.worker.dev/

**預期結果**:
- 米白色背景（#F7F7F5，宣紙質感）
- **水墨圓圈圖片**（180x180px）- 這是從 R2 載入的 `zen_enso.png`
- 中心有金色光點
- 標題「靜觀」
- 副標題「CONTEMPLATION」
- 三個連結按鈕（Github、Email、Blog）
- 流暢的淡入動畫效果

---

### ✅ 第二步：驗證 R2 圖片

**直接訪問圖片**:
```
https://abc1231qa.worker.dev/images/zen_enso.png
```

**預期結果**:
- 直接顯示水墨圓圈圖片
- 檔案大小約 457 KB
- 圖片格式：PNG

---

### ✅ 第三步：測試圖片列表 API

**網址**:
```
https://abc1231qa.worker.dev/api/images
```

**預期 JSON 回應**:
```json
{
  "success": true,
  "count": 1,
  "images": [
    {
      "name": "zen_enso.png",
      "size": 468697,
      "uploaded": "2026-02-01T07:36:16.000Z",
      "url": "/images/zen_enso.png"
    }
  ]
}
```

---

### ✅ 第四步：檢查瀏覽器開發者工具

1. **開啟開發者工具** (按 F12)
2. **切換到 Network 標籤**
3. **重新載入頁面** (Ctrl+R 或 F5)
4. **尋找 `zen_enso.png` 請求**

**預期結果**:
```
Request URL: https://abc1231qa.worker.dev/images/zen_enso.png
Status: 200 OK
Content-Type: image/png
Cache-Control: public, max-age=86400
Access-Control-Allow-Origin: *
Size: 457.72 KB
```

---

### ✅ 第五步：測試管理後台

**網址**:
```
https://abc1231qa.worker.dev/admin
```

**預期結果**:
- 顯示「🔗 縮網址管理 (Private)」
- 密碼輸入框
- 新增縮網址表單
- 目前縮網址列表

---

### ✅ 第六步：測試縮網址功能

**查看所有縮網址**:
```
https://abc1231qa.worker.dev/api/list
```

**預期結果**:
- JSON 格式的縮網址列表
- 每個項目包含 `key` 和 `value`

---

## 🔍 詳細檢查項目

### 視覺檢查

#### 首頁應該看起來像這樣：

```
┌─────────────────────────────────────┐
│                                     │
│         [水墨圓圈圖片]              │
│            ◯                        │
│                                     │
│           靜觀                      │
│       CONTEMPLATION                 │
│                                     │
│          ─────                      │
│                                     │
│    於喧囂中尋一方淨土               │
│    在代碼裡悟人生哲理               │
│    技術與人文的交匯處               │
│    即是心之所向                     │
│                                     │
│    ┌─────────────┐                 │
│    │   Github    │                 │
│    └─────────────┘                 │
│    ┌─────────────┐                 │
│    │   Email     │                 │
│    └─────────────┘                 │
│    ┌─────────────┐                 │
│    │   Blog      │                 │
│    └─────────────┘                 │
│                                     │
│        © 2026 · ◯                  │
└─────────────────────────────────────┘
```

### 技術檢查

#### 1. 圖片載入確認
- [ ] 水墨圓圈圖片正常顯示（不是破圖）
- [ ] 圖片清晰，沒有模糊
- [ ] 圖片大小適中（180x180px）

#### 2. 效能確認
- [ ] 頁面載入速度快（< 2 秒）
- [ ] 圖片有快取（第二次訪問更快）
- [ ] 沒有 404 錯誤

#### 3. 功能確認
- [ ] 所有連結可點擊
- [ ] 動畫流暢
- [ ] 響應式設計正常（手機、平板、電腦）

---

## 🐛 常見問題排解

### 問題 1: 圖片不顯示（破圖）

**可能原因**:
- R2 綁定未正確設定
- 圖片路徑錯誤
- 圖片未上傳到 R2

**解決方法**:
```powershell
# 檢查 R2 中的圖片
wrangler r2 object list my-images

# 確認 zen_enso.png 存在
# 如果不存在，重新上傳
wrangler r2 object put my-images/zen_enso.png --file=./zen_enso.png
```

### 問題 2: 顯示 "R2 儲存未設定"

**可能原因**:
- `wrangler.toml` 中的 bucket_name 錯誤
- Worker 未重新部署

**解決方法**:
```powershell
# 檢查 wrangler.toml
cat wrangler.toml

# 確認 bucket_name = "my-images"
# 重新部署
wrangler deploy
```

### 問題 3: 圖片顯示 404

**可能原因**:
- 圖片檔名錯誤（區分大小寫）
- 圖片路徑錯誤

**解決方法**:
```powershell
# 列出所有檔案，確認檔名
wrangler r2 object list my-images

# 確認檔名是 zen_enso.png（不是 Zen_Enso.png）
```

### 問題 4: 頁面完全無法載入

**可能原因**:
- Worker 部署失敗
- 網域設定問題

**解決方法**:
```powershell
# 檢查部署狀態
wrangler deployments list

# 重新部署
wrangler deploy
```

---

## 📱 多裝置測試

### 桌面瀏覽器
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari

### 行動裝置
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)

### 響應式測試
1. 開啟開發者工具 (F12)
2. 點擊「Toggle device toolbar」圖示
3. 測試不同螢幕尺寸：
   - 手機 (375px)
   - 平板 (768px)
   - 桌面 (1920px)

---

## ✅ 驗證完成確認

完成以上所有測試後，請確認：

- [ ] ✅ 首頁正常顯示
- [ ] ✅ 水墨圓圈圖片從 R2 載入成功
- [ ] ✅ 圖片列表 API 正常運作
- [ ] ✅ 管理後台可正常訪問
- [ ] ✅ 縮網址功能正常
- [ ] ✅ 沒有 Console 錯誤
- [ ] ✅ 響應式設計正常

---

## 📸 建議截圖位置

如果要記錄驗證結果，建議截圖：

1. **首頁全景** - 顯示完整的 Zen 設計
2. **開發者工具 Network 標籤** - 顯示 zen_enso.png 載入成功
3. **圖片列表 API 回應** - 顯示 JSON 格式正確
4. **直接訪問圖片** - 顯示圖片可單獨存取

---

## 🎉 驗證成功標準

如果您看到：
- ✅ 首頁顯示真實的水墨圓圈圖片（不是 CSS 繪製的簡單圓圈）
- ✅ 圖片清晰且有自然的墨韻效果
- ✅ Network 標籤顯示圖片從 `/images/zen_enso.png` 載入
- ✅ 狀態碼為 200 OK

**恭喜！R2 整合完全成功！** 🎊

---

**建立時間**: 2026-02-01 15:46  
**驗證網址**: https://abc1231qa.worker.dev/
