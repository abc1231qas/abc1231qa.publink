# 修正行動建議書 (Correction Action Proposal)

**日期**: 2026年2月16日
**專案**: abc1231qa.worker.dev
**審查者**: Gemini (Superpower Agent)

## 1. 執行摘要 (Executive Summary)

本文件針對 `abc1231qa.worker.dev` 專案的當前代碼庫進行了深入審查。雖然專案功能豐富（包含縮網址、個人頁面、R2 圖片託管、統計功能），但存在**極高風險的安全性漏洞**以及**架構上的債務**。

為了確保系統的長期穩定性、安全性和可維護性，本建議書提出了一套基於 **Superpower (Obra/Superpowers)** 框架的重構計畫。核心目標是引入測試驅動開發 (TDD)，消除硬編碼機密，並統一分歧的代碼邏輯。

## 2. 風險評估 (Risk Assessment)

### 🚨 極高風險 (Critical)
- **硬編碼機密 (Hardcoded Secrets)**: `worker.js` 第 6 行與第 12 行直接包含管理密碼與 Session Secret。
    - **後果**: 任何有權限存取代碼庫的人員（或若代碼不慎公開）皆可取得管理員權限，隨意竄改或刪除資料。
    - **解決方案**: 立即遷移至 `wrangler secret` 環境變數管理。

### ⚠️ 高風險 (High)
- **缺乏測試 (Lack of Testing)**: 專案目前沒有自動化測試。
    - **後果**: 任何重構或新功能開發都極高機率破壞現有功能（如縮網址轉導、圖片讀取）。無法「證據導向」地證明系統正確性。
    - **解決方案**: 在修改邏輯前，先建立測試防護網 (Test Safety Net)。

### 🟠 中度風險 (Medium)
- **單體架構 (Monolithic Architecture)**: `worker.js` 超過 2600 行，混合了路由、HTML 模板、業務邏輯與資料庫操作。
    - **後果**: 閱讀困難，多人協作易衝突，邏輯複用性低。
    - **解決方案**: 採用模組化架構，分離 `Router`、`Controllers`、`Services` 與 `Views`。
- **代碼分歧 (Code Divergence)**: 存在 `worker.js` 與 `worker-optimized.js` 兩套邏輯。
    - **後果**: 維護成本加倍，功能不同步（例如：統計功能僅在 optimized 版本，Session 驗證僅在原版）。
    - **解決方案**: 合併功能，統一為單一入口。

## 3. 核心原則 (Superpower Philosophy)

本修正計畫將嚴格遵循以下原則：

1.  **測試優先 (Test First)**: 在寫入任何業務邏輯代碼前，先寫測試。
2.  **系統化流程 (Systematic Process)**: 使用 Git 分支/Worktree 隔離開發環境，確保主幹穩定。
3.  **降低複雜度 (Complexity Reduction)**: 透過模組化將大問題拆解為小問題。
4.  **證據導向 (Evidence Based)**: 只有通過測試的代碼才算完成。

## 4. 執行計畫 (Execution Plan)

### 第一階段：安全鎖定與環境建置 (Phase 1: Security & Setup)
*目標：修復最危急的安全漏洞，並建立測試基礎設施。*

1.  **初始化測試環境**:
    - 安裝 `vitest` (Vite 驅動的測試框架，適合 Workers)。
    - 設定 `wrangler.toml` 以支援測試環境變數。
2.  **遷移機密資訊**:
    - 移除代碼中的 `ADMIN_PASSWORD` 和 `SESSION_SECRET`。
    - 修改代碼以從 `env` 讀取這些值。
    - 更新部署文檔，說明如何設定 Secrets。
3.  **建立基準測試 (Baseline Tests)**:
    - 為現有的關鍵路徑（Login, Redirect, R2 Image Fetch）撰寫整合測試。
    - **驗證標準**: 確保現有功能在重構過程中不被破壞。

### 第二階段：架構重構與模組化 (Phase 2: Refactoring)
*目標：將單體檔案拆解為可維護的模組。*

1.  **分離 HTML 模板**:
    - 建立 `src/templates/` 目錄。
    - 將 `generateLoginHTML`, `generateIntroHTML` 等函數移出主邏輯，改為獨立模組導入。
2.  **提取業務邏輯**:
    - 建立 `src/services/auth.js` (處理 Session/Crypto)。
    - 建立 `src/services/url.js` (處理 KV 操作)。
    - 建立 `src/services/storage.js` (處理 R2 操作)。
3.  **路由層分離**:
    - 使用輕量級路由庫 (如 `itty-router` 或原生拆分) 建立 `src/router.js`。
    - 確保 `worker.js` (entry point) 只負責調度，不負責實作。

### 第三階段：功能合併與優化 (Phase 3: Unification)
*目標：整合 `worker-optimized.js` 的優點。*

1.  **整合統計功能**:
    - 將 `worker-optimized.js` 中的點擊統計邏輯 (`STATS_PREFIX`) 移植到新的 `src/services/url.js` 中。
    - 確保統計寫入不影響轉導效能（使用 `waitUntil`）。
2.  **統一驗證機制**:
    - 廢棄 `worker-optimized.js` 中的明文密碼傳輸方式。
    - 全面採用 `worker.js` 的 Cookie Session 機制（更安全、體驗更好）。

## 5. 預期架構預覽 (Target Architecture)

```text
src/
├── index.js          # Entry Point (負責 Env 注入與錯誤處理)
├── router.js         # 路由定義
├── middleware/       # 中介軟體 (Auth, CORS, Logging)
│   └── auth.js
├── controllers/      # 處理 HTTP 請求與回應
│   ├── admin.js
│   ├── redirect.js
│   └── asset.js
├── services/         # 業務邏輯與外部服務交互
│   ├── kv.js
│   └── r2.js
├── templates/        # HTML 視圖
│   ├── admin.html.js
│   └── home.html.js
└── utils/            # 工具函數
    └── crypto.js
tests/                # 測試文件
└── ...
```

## 6. 下一步行動 (Next Steps)

建議立即批准 **第一階段：安全鎖定與環境建置**。

確認後，我將：
1.  建立新的開發分支。
2.  安裝測試依賴。
3.  開始遷移機密資訊並撰寫第一批測試。
