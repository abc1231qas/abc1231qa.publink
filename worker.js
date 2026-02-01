// ==========================================
// 1. 全域設定
// ==========================================
// 管理後台的密碼
const ADMIN_PASSWORD = "0 2k6";

// 管理後台的路徑 (你可以改成只有你知道的亂碼，例如 "my-secret-door")
const ADMIN_PATH = "admin";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // 去除路徑前後的斜線，避免 /admin/ 與 /admin 判定不同
    const path = url.pathname.replace(/^\/|\/$/g, "");

    // ==========================================
    // 2. API 邏輯區 (保持不變，僅路徑微調)
    // ==========================================

    // 處理 API: 新增/刪除 (需驗證密碼)
    if (url.pathname === "/api/manage" && request.method === "POST") {
      try {
        const data = await request.json();
        if (data.password !== ADMIN_PASSWORD) return new Response("密碼錯誤", { status: 403 });

        if (data.action === "add") {
          // 防呆：避免覆蓋掉管理路徑
          if (data.key === ADMIN_PATH || data.key === "api") return new Response("此短碼為系統保留", { status: 400 });

          await env.SHORT_URLS.put(data.key, data.value);
          return new Response("成功新增");
        } else if (data.action === "delete") {
          await env.SHORT_URLS.delete(data.key);
          return new Response("成功刪除");
        }
      } catch (err) {
        return new Response("資料格式錯誤", { status: 400 });
      }
    }

    // 處理 API: 讀取列表 (公開或私有看需求，目前保持公開但前端不顯示入口)
    if (url.pathname === "/api/list") {
      const list = await env.SHORT_URLS.list();
      const items = await Promise.all(list.keys.map(async (k) => ({
        key: k.name,
        value: await env.SHORT_URLS.get(k.name)
      })));
      return new Response(JSON.stringify(items), { headers: { "Content-Type": "application/json" } });
    }

    // ==========================================
    // 2.5 R2 圖片 API 區
    // ==========================================

    // 處理圖片請求：/images/xxx.png
    if (url.pathname.startsWith('/images/')) {
      return handleImageRequest(url, env);
    }

    // 處理圖片上傳 API（需驗證密碼）
    if (url.pathname === "/api/upload-image" && request.method === "POST") {
      return handleImageUpload(request, env);
    }

    // 處理圖片列表 API
    if (url.pathname === "/api/images" && request.method === "GET") {
      return handleListImages(env);
    }

    // ==========================================
    // 3. 頁面路由區 (Router)
    // ==========================================

    // 情境 A: 根目錄 -> 顯示個人介紹頁 (Public)
    if (path === "") {
      return new Response(generateIntroHTML(), {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // 情境 B: 管理路徑 -> 顯示後台 (Private)
    if (path === ADMIN_PATH) {
      return new Response(generateAdminHTML(), {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // 情境 C: 縮網址轉址 logic
    // 先從 KV 找
    const targetUrl = await env.SHORT_URLS.get(path);
    if (targetUrl) {
      return Response.redirect(targetUrl, 301);
    }

    // 情境 D: 真的找不到 -> 404 頁面 (或導回首頁)
    return new Response(generate404HTML(), {
      status: 404,
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
};

// ==========================================
// 4. HTML 生成區 (View Layer)
// ==========================================

/**
 * 產生個人介紹頁面 (Homepage)
 * 風格：極簡、大頭貼、社交連結
 */
function generateIntroHTML() {
  return `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>靜 · 觀 | Contemplation</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
      /* ==================== 配色系統 ==================== */
      :root {
        --bg-rice: #F7F7F5;
        --ink-black: #2C2C2C;
        --text-deep: #333333;
        --text-mid: #595959;
        --gold-muted: #C5A065;
        --gold-light: rgba(197, 160, 101, 0.15);
      }
      
      /* ==================== 基礎排版 ==================== */
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        font-family: 'Noto Serif TC', 'PMingLiU', serif;
        background: var(--bg-rice);
        /* 加入紙張紋理效果 */
        background-image: 
          radial-gradient(circle at 20% 50%, rgba(197, 160, 101, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(44, 44, 44, 0.02) 0%, transparent 50%);
        color: var(--text-mid);
        line-height: 1.8;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
      }
      
      /* ==================== 主容器 - 居中對稱 ==================== */
      .zen-container {
        max-width: 680px;
        width: 100%;
        text-align: center;
        position: relative;
      }
      
      /* ==================== 水墨圓圈裝飾 (Enso) - 使用 R2 圖片 ==================== */
      .enso {
        width: 180px;
        height: 180px;
        margin: 0 auto 80px;
        position: relative;
        opacity: 0;
        animation: fadeIn 1.2s ease-out 0.3s forwards;
        /* 使用 R2 儲存的真實水墨圓圈圖片 */
        background-image: url('/images/zen_enso.png');
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      }
      
      /* 移除原本的 CSS 繪製圓圈，改用真實圖片 */
      /* .enso::before 已不需要 */
      
      /* 保留中心金色光點作為點綴 */
      .enso::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: var(--gold-muted);
        border-radius: 50%;
        box-shadow: 
          0 0 20px var(--gold-muted),
          0 0 40px rgba(197, 160, 101, 0.3);
      }
      
      /* ==================== 標題區 ==================== */
      h1 {
        font-size: 2.8rem;
        font-weight: 300;
        color: var(--text-deep);
        letter-spacing: 0.15em;
        margin-bottom: 30px;
        opacity: 0;
        animation: fadeIn 1s ease-out 0.6s forwards;
      }
      
      .subtitle {
        font-size: 1rem;
        color: var(--text-mid);
        letter-spacing: 0.3em;
        margin-bottom: 60px;
        opacity: 0.7;
        font-weight: 300;
        opacity: 0;
        animation: fadeIn 1s ease-out 0.9s forwards;
      }
      
      /* ==================== 金色分隔線 ==================== */
      .divider {
        width: 60px;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--gold-muted), transparent);
        margin: 50px auto;
        opacity: 0;
        animation: fadeIn 1s ease-out 1.2s forwards;
      }
      
      /* ==================== 內文區 ==================== */
      .description {
        max-width: 480px;
        margin: 0 auto 70px;
        font-size: 1.05rem;
        line-height: 2;
        color: var(--text-mid);
        opacity: 0;
        animation: fadeIn 1s ease-out 1.5s forwards;
      }
      
      /* ==================== 連結區 - 極簡按鈕 ==================== */
      .links {
        display: flex;
        flex-direction: column;
        gap: 18px;
        max-width: 360px;
        margin: 0 auto;
        opacity: 0;
        animation: fadeIn 1s ease-out 1.8s forwards;
      }
      
      .zen-link {
        display: block;
        padding: 16px 32px;
        color: var(--text-deep);
        text-decoration: none;
        border: 1px solid rgba(44, 44, 44, 0.2);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        letter-spacing: 0.1em;
        font-size: 0.95rem;
        position: relative;
        overflow: hidden;
      }
      
      .zen-link::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: var(--gold-light);
        transition: left 0.5s ease;
        z-index: -1;
      }
      
      .zen-link:hover::before {
        left: 0;
      }
      
      .zen-link:hover {
        border-color: var(--gold-muted);
        color: var(--ink-black);
        transform: translateY(-2px);
      }
      
      /* ==================== 頁尾 ==================== */
      .footer {
        margin-top: 100px;
        font-size: 0.85rem;
        color: rgba(89, 89, 89, 0.5);
        letter-spacing: 0.05em;
        opacity: 0;
        animation: fadeIn 1s ease-out 2.1s forwards;
      }
      
      .secret-link {
        color: inherit;
        text-decoration: none;
        opacity: 0.3;
        transition: opacity 0.3s;
      }
      
      .secret-link:hover {
        opacity: 1;
      }
      
      /* ==================== 動畫 ==================== */
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* ==================== 響應式 ==================== */
      @media (max-width: 640px) {
        h1 { font-size: 2rem; }
        .enso { width: 140px; height: 140px; margin-bottom: 60px; }
        .description { font-size: 1rem; }
      }
    </style>
  </head>
  <body>
    <div class="zen-container">
      <!-- 水墨圓圈 -->
      <div class="enso"></div>
      
      <!-- 標題 -->
      <h1>靜觀</h1>
      <div class="subtitle">CONTEMPLATION</div>
      
      <!-- 金色分隔線 -->
      <div class="divider"></div>
      
      <!-- 描述 -->
      <div class="description">
        於喧囂中尋一方淨土<br>
        在代碼裡悟人生哲理<br>
        技術與人文的交匯處<br>
        即是心之所向
      </div>
      
      <!-- 連結 -->
      <div class="links">
        <a href="#" class="zen-link">Github</a>
        <a href="#" class="zen-link">Email</a>
        <a href="/blog" class="zen-link">Blog</a>
      </div>
      
      <!-- 頁尾 -->
      <div class="footer">
        © 2026 · <a href="/${ADMIN_PATH}" class="secret-link">◯</a>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * 產生 404 頁面
 */
function generate404HTML() {
  return `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>迷途 | Lost</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@300;400&display=swap" rel="stylesheet">
    <style>
      :root {
        --bg-rice: #F7F7F5;
        --ink-black: #2C2C2C;
        --text-deep: #333333;
        --text-mid: #595959;
        --gold-muted: #C5A065;
      }
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        font-family: 'Noto Serif TC', 'PMingLiU', serif;
        background: var(--bg-rice);
        color: var(--text-mid);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .container {
        text-align: center;
        max-width: 500px;
      }
      
      .number {
        font-size: 8rem;
        font-weight: 300;
        color: var(--ink-black);
        opacity: 0.15;
        letter-spacing: 0.2em;
        margin-bottom: 40px;
        animation: fadeIn 0.8s ease-out;
      }
      
      h1 {
        font-size: 2rem;
        font-weight: 300;
        color: var(--text-deep);
        letter-spacing: 0.2em;
        margin-bottom: 20px;
        animation: fadeIn 1s ease-out 0.2s backwards;
      }
      
      p {
        font-size: 1.1rem;
        line-height: 2;
        color: var(--text-mid);
        margin-bottom: 50px;
        animation: fadeIn 1s ease-out 0.4s backwards;
      }
      
      .link {
        display: inline-block;
        padding: 14px 40px;
        color: var(--text-deep);
        text-decoration: none;
        border: 1px solid rgba(44, 44, 44, 0.2);
        letter-spacing: 0.1em;
        transition: all 0.4s ease;
        animation: fadeIn 1s ease-out 0.6s backwards;
      }
      
      .link:hover {
        border-color: var(--gold-muted);
        color: var(--gold-muted);
        transform: translateY(-2px);
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="number">404</div>
      <h1>迷途</h1>
      <p>
        此處無路可循<br>
        不如返回原點
      </p>
      <a href="/" class="link">返回首頁</a>
    </div>
  </body>
  </html>
  `;
}

/**
 * 產生管理後台 HTML (Zen 美學風格)
 */
function generateAdminHTML() {
  return `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理後台 | Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
      /* ==================== 配色系統 (與首頁一致) ==================== */
      :root {
        --bg-rice: #F7F7F5;
        --ink-black: #2C2C2C;
        --text-deep: #333333;
        --text-mid: #595959;
        --gold-muted: #C5A065;
        --gold-light: rgba(197, 160, 101, 0.15);
        --border-subtle: rgba(44, 44, 44, 0.15);
      }
      
      /* ==================== 基礎排版 ==================== */
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        font-family: 'Noto Serif TC', 'PMingLiU', serif;
        background: var(--bg-rice);
        background-image: 
          radial-gradient(circle at 20% 50%, rgba(197, 160, 101, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(44, 44, 44, 0.02) 0%, transparent 50%);
        color: var(--text-mid);
        line-height: 1.8;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
      }
      
      /* ==================== 主容器 ==================== */
      .zen-container {
        max-width: 680px;
        width: 100%;
        opacity: 0;
        animation: fadeIn 0.8s ease-out 0.2s forwards;
      }
      
      /* ==================== 標題區 ==================== */
      .page-title {
        text-align: center;
        margin-bottom: 50px;
      }
      
      h1 {
        font-size: 2.2rem;
        font-weight: 300;
        color: var(--text-deep);
        letter-spacing: 0.2em;
        margin-bottom: 12px;
      }
      
      .subtitle {
        font-size: 0.9rem;
        color: var(--text-mid);
        letter-spacing: 0.3em;
        opacity: 0.6;
        font-weight: 300;
      }
      
      /* ==================== 金色分隔線 ==================== */
      .divider {
        width: 60px;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--gold-muted), transparent);
        margin: 40px auto;
      }
      
      /* ==================== 表單區 ==================== */
      .form-section {
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid var(--border-subtle);
        padding: 30px;
        margin-bottom: 30px;
      }
      
      .section-title {
        font-size: 1.1rem;
        font-weight: 400;
        color: var(--text-deep);
        letter-spacing: 0.1em;
        margin-bottom: 25px;
        text-align: center;
      }
      
      /* ==================== 輸入框 ==================== */
      input {
        width: 100%;
        padding: 14px 18px;
        margin: 10px 0;
        border: 1px solid var(--border-subtle);
        background: rgba(255, 255, 255, 0.8);
        color: var(--text-deep);
        font-family: 'Noto Serif TC', serif;
        font-size: 0.95rem;
        transition: all 0.3s ease;
        letter-spacing: 0.05em;
      }
      
      input:focus {
        outline: none;
        border-color: var(--gold-muted);
        background: white;
      }
      
      input::placeholder {
        color: var(--text-mid);
        opacity: 0.5;
      }
      
      /* ==================== 按鈕 ==================== */
      button {
        width: 100%;
        padding: 14px 32px;
        margin-top: 15px;
        background: transparent;
        color: var(--text-deep);
        border: 1px solid var(--border-subtle);
        font-family: 'Noto Serif TC', serif;
        font-size: 0.95rem;
        letter-spacing: 0.1em;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }
      
      button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: var(--gold-light);
        transition: left 0.5s ease;
        z-index: -1;
      }
      
      button:hover::before {
        left: 0;
      }
      
      button:hover {
        border-color: var(--gold-muted);
        color: var(--ink-black);
        transform: translateY(-2px);
      }
      
      button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }
      
      button:disabled:hover::before {
        left: -100%;
      }
      
      /* ==================== 列表區 ==================== */
      .list-container {
        margin-top: 20px;
      }
      
      .list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 0;
        border-bottom: 1px solid var(--border-subtle);
        transition: background 0.3s ease;
      }
      
      .list-item:last-child {
        border-bottom: none;
      }
      
      .list-item:hover {
        background: var(--gold-light);
        padding-left: 10px;
        padding-right: 10px;
      }
      
      .list-info {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 15px;
      }
      
      .short-code {
        color: var(--text-deep);
        font-weight: 400;
        letter-spacing: 0.05em;
      }
      
      .arrow {
        color: var(--gold-muted);
        margin: 0 8px;
        opacity: 0.6;
      }
      
      .target-url {
        color: var(--text-mid);
        text-decoration: none;
        transition: color 0.3s ease;
      }
      
      .target-url:hover {
        color: var(--gold-muted);
      }
      
      /* ==================== 刪除按鈕 ==================== */
      .del-btn {
        width: auto;
        padding: 8px 20px;
        margin: 0;
        font-size: 0.85rem;
        border-color: rgba(197, 160, 101, 0.3);
        color: var(--text-mid);
      }
      
      .del-btn:hover {
        border-color: var(--gold-muted);
        background: transparent;
        color: var(--text-deep);
      }
      
      /* ==================== 空狀態 ==================== */
      .empty-state {
        padding: 40px 20px;
        text-align: center;
        color: var(--text-mid);
        opacity: 0.6;
        font-size: 0.95rem;
        letter-spacing: 0.1em;
      }
      
      /* ==================== 返回連結 ==================== */
      .back-home {
        display: block;
        text-align: center;
        margin-top: 50px;
        color: var(--text-mid);
        text-decoration: none;
        font-size: 0.9rem;
        letter-spacing: 0.1em;
        opacity: 0.5;
        transition: opacity 0.3s ease;
      }
      
      .back-home:hover {
        opacity: 1;
        color: var(--gold-muted);
      }
      
      /* ==================== 動畫 ==================== */
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* ==================== 響應式 ==================== */
      @media (max-width: 640px) {
        h1 { font-size: 1.8rem; }
        .form-section { padding: 20px; }
        .list-item { flex-direction: column; align-items: flex-start; gap: 10px; }
        .del-btn { width: 100%; }
      }
    </style>
  </head>
  <body>
    <div class="zen-container">
      <!-- 標題 -->
      <div class="page-title">
        <h1>管理後台</h1>
        <div class="subtitle">ADMIN PANEL</div>
      </div>
      
      <div class="divider"></div>
      
      <!-- 密碼輸入 -->
      <div class="form-section">
        <input type="password" id="pw" placeholder="請輸入管理密碼">
      </div>
      
      <!-- 新增區 -->
      <div class="form-section">
        <div class="section-title">新增縮網址</div>
        <input type="text" id="newKey" placeholder="短碼 (例如: blog)">
        <input type="text" id="newVal" placeholder="目標網址 (https://...)">
        <button onclick="manage('add')">新增連結</button>
      </div>
      
      <!-- 列表區 -->
      <div class="form-section">
        <div class="section-title">目前清單</div>
        <div id="list" class="list-container">
          <div class="empty-state">載入中...</div>
        </div>
      </div>
      
      <a href="/" class="back-home">← 返回首頁</a>
    </div>

    <script>
      function createItemHTML(key, value) {
        return \`
          <div class="list-item" id="item-\${key}">
            <div class="list-info">
              <span class="short-code">/\${key}</span>
              <span class="arrow">→</span>
              <a href="\${value}" target="_blank" class="target-url">\${value}</a>
            </div>
            <button class="del-btn" onclick="manage('delete', '\${key}')">刪除</button>
          </div>
        \`;
      }

      async function loadList() {
        const listDiv = document.getElementById('list');
        try {
          const res = await fetch('/api/list');
          const data = await res.json();
          if (data.length === 0) {
            listDiv.innerHTML = '<div class="empty-state">目前沒有任何縮網址</div>';
            return;
          }
          listDiv.innerHTML = data.map(item => createItemHTML(item.key, item.value)).join('');
        } catch (e) {
          listDiv.innerHTML = '<div class="empty-state" style="color: var(--gold-muted);">載入失敗，請檢查網路</div>';
        }
      }

      async function manage(action, key) {
        const password = document.getElementById('pw').value;
        const keyInput = document.getElementById('newKey');
        const valInput = document.getElementById('newVal');
        
        const reqKey = action === 'add' ? keyInput.value.trim() : key;
        const reqVal = action === 'add' ? valInput.value.trim() : '';

        if(!password) { alert('請輸入管理密碼'); return; }
        if(action === 'add' && (!reqKey || !reqVal)) { alert('短碼與網址都不能為空'); return; }

        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = '處理中...';
        btn.disabled = true;

        try {
          const res = await fetch('/api/manage', { 
            method: 'POST', 
            body: JSON.stringify({ action, password, key: reqKey, value: reqVal }) 
          });

          if (res.ok) {
            if (action === 'add') {
              const newItemHTML = createItemHTML(reqKey, reqVal);
              const listDiv = document.getElementById('list');
              if(listDiv.innerText.includes('目前沒有')) listDiv.innerHTML = '';
              listDiv.innerHTML = newItemHTML + listDiv.innerHTML;
              keyInput.value = '';
              valInput.value = '';
            } else {
              const itemToRemove = document.getElementById('item-' + key);
              if(itemToRemove) itemToRemove.remove();
              
              // 檢查是否清空
              const remainingItems = document.querySelectorAll('.list-item');
              if(remainingItems.length === 0) {
                document.getElementById('list').innerHTML = '<div class="empty-state">目前沒有任何縮網址</div>';
              }
            }
          } else {
            alert(await res.text());
          }
        } catch (err) {
          alert('連線發生錯誤');
        } finally {
          btn.innerText = originalText;
          btn.disabled = false;
        }
      }

      loadList();
    </script>
  </body>
  </html>`;
}

// ==========================================
// 5. R2 圖片處理函數
// ==========================================

/**
 * 處理圖片請求
 * @param {URL} url - 請求的 URL
 * @param {Object} env - 環境變數（包含 R2 綁定）
 */
async function handleImageRequest(url, env) {
  // 檢查是否有 R2 綁定
  if (!env.MY_IMAGES) {
    return new Response('R2 儲存未設定', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  // 取得圖片路徑：/images/logo.png -> logo.png
  const imagePath = url.pathname.replace('/images/', '');

  try {
    // 從 R2 讀取圖片
    const object = await env.MY_IMAGES.get(imagePath);

    // 如果圖片不存在
    if (object === null) {
      return new Response('圖片不存在', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    // 建立回應標頭
    const headers = new Headers();

    // 設定 Content-Type（從 R2 metadata 取得）
    object.writeHttpMetadata(headers);

    // 設定快取（1 天）
    headers.set('Cache-Control', 'public, max-age=86400');

    // 允許跨域（如果需要）
    headers.set('Access-Control-Allow-Origin', '*');

    // 返回圖片
    return new Response(object.body, { headers });

  } catch (error) {
    console.error('讀取圖片錯誤:', error);
    return new Response('讀取圖片時發生錯誤', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

/**
 * 處理圖片上傳
 * @param {Request} request - 請求物件
 * @param {Object} env - 環境變數
 */
async function handleImageUpload(request, env) {
  // 檢查是否有 R2 綁定
  if (!env.MY_IMAGES) {
    return new Response(JSON.stringify({
      success: false,
      error: 'R2 儲存未設定'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 驗證密碼
    const formData = await request.formData();
    const password = formData.get('password');

    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({
        success: false,
        error: '密碼錯誤'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const file = formData.get('image');
    if (!file) {
      return new Response(JSON.stringify({
        success: false,
        error: '未選擇檔案'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 驗證檔案類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({
        success: false,
        error: '不支援的圖片格式（僅支援 JPEG, PNG, WebP, GIF）'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 驗證檔案大小（5MB）
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({
        success: false,
        error: '檔案過大（最大 5MB）'
      }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 生成檔案名稱（使用時間戳避免衝突）
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `upload_${timestamp}.${extension}`;

    // 上傳到 R2
    await env.MY_IMAGES.put(fileName, file.stream(), {
      httpMetadata: {
        contentType: file.type
      }
    });

    // 返回圖片 URL
    return new Response(JSON.stringify({
      success: true,
      url: `/images/${fileName}`,
      fileName: fileName,
      size: file.size,
      type: file.type
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('上傳錯誤:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '上傳失敗：' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 列出所有圖片
 * @param {Object} env - 環境變數
 */
async function handleListImages(env) {
  // 檢查是否有 R2 綁定
  if (!env.MY_IMAGES) {
    return new Response(JSON.stringify({
      success: false,
      error: 'R2 儲存未設定'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const list = await env.MY_IMAGES.list();

    const images = list.objects.map(obj => ({
      name: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
      url: `/images/${obj.key}`
    }));

    return new Response(JSON.stringify({
      success: true,
      count: images.length,
      images: images
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('列表錯誤:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '取得列表失敗：' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}