# TODO List

## 待辦事項

### 1. GitHub 改名
- [ ] 將 GitHub repository 名稱從 `abc1231qas.github.io` 改為更有意義的名稱
- [x] 確認改名後的影響（GitHub Pages URL、Cloudflare Workers 設定等）
- [ ] 更新相關文件中的 repository 名稱

### 2. 開設 Public 專案
- [ ] 建立新的 public repository
- [ ] 決定專案名稱和用途
- [ ] 設定 repository 基本資訊（README、License 等）
- [ ] 配置專案結構

### 3. 研究網站如何加圖片 ✅
- [x] 研究在 Cloudflare Worker 中嵌入圖片的方法
  - Base64 編碼
  - 外部圖片連結
  - Cloudflare R2 儲存
- [x] 測試不同圖片載入方式的效能
- [x] 更新 `worker.js` 以支援圖片顯示
- [x] 撰寫圖片使用指南文件

📄 **參考文件**: [IMAGE_GUIDE.md](./IMAGE_GUIDE.md)

### 4. 縮網址頁面風格統一
- [ ] 檢視目前縮網址頁面的設計風格
- [ ] 確保與主頁面（Zen 美學）風格一致
- [ ] 統一色彩配置、字體、動畫效果
- [ ] 測試響應式設計在不同裝置上的表現
- [ ] 更新相關 CSS 和 HTML 代碼

---

**建立日期**: 2026-02-01  
**最後更新**: 2026-02-01
