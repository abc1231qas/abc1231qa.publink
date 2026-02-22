# TODO List

## 待辦事項

### 1. GitHub 改名 ✅
- [x] 將 GitHub repository 名稱從 `abc1231qas.github.io` 改為更有意義的名稱 (`abc1231qa.publink`)
- [x] 確認改名後的影響（GitHub Pages URL、Cloudflare Workers 設定等）
- [x] 更新相關文件中的 repository 名稱

### 2. 開設 Public 專案 ✅
- [x] 建立新的 public repository
- [x] 決定專案名稱和用途
- [x] 設定 repository 基本資訊（README、License 等）
- [x] 配置專案結構

**完成日期**: 2026-02-01

### 3. 研究網站如何加圖片 ✅
- [x] 研究在 Cloudflare Worker 中嵌入圖片的方法
  - Base64 編碼
  - 外部圖片連結
  - Cloudflare R2 儲存
- [x] 測試不同圖片載入方式的效能
- [x] 更新 `worker.js` 以支援圖片顯示
- [x] 撰寫圖片使用指南文件

📄 **參考文件**: [IMAGE_GUIDE.md](./IMAGE_GUIDE.md)

### 4. 縮網址頁面風格統一 ✅
- [x] 檢視目前縮網址頁面的設計風格
- [x] 確保與主頁面（Zen 美學）風格一致
- [x] 統一色彩配置、字體、動畫效果
- [x] 測試響應式設計在不同裝置上的表現
- [x] 更新相關 CSS 和 HTML 代碼

**完成日期**: 2026-02-01  
**改進內容**:
- 採用與首頁一致的米白色紙張質感背景
- 使用 Noto Serif TC 字體家族
- 應用墨色和金色的配色方案
- 實現極簡邊框按鈕設計
- 加入淡入動畫效果
- 完全統一視覺風格，管理後台現在與首頁完美融合

### 5. 處理之前產生的網頁插圖 (Digital Garden) ✅
- [x] 定位或重新生成之前為網頁設計的插圖（例如：`digital_garden_hero.png`、`long_termism_concept.png`、`tech_theology_abstract.png`）
- [x] 將這些圖片正式上傳至 Cloudflare R2 儲存桶 (`my-images`)
- [x] 確保 `worker.js` 和頁面模板能夠正確從 R2 讀取並顯示這些圖片
- [x] 測試圖片在實機（手機、電腦）上的顯示效果與效能


---

**建立日期**: 2026-02-01  
**最後更新**: 2026-02-01
