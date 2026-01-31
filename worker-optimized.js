// ==========================================
// 1. 全域設定與常數
// ==========================================
const ADMIN_PATH = "admin";
const STATS_PREFIX = "stats:"; // 用於儲存點擊統計

// 網址驗證正則表達式
const URL_REGEX = /^https?:\/\/.+/i;

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname.replace(/^\/|\/$/g, "");

        // ==========================================
        // 2. API 路由處理
        // ==========================================

        // API: 管理操作 (新增/刪除/編輯)
        if (url.pathname === "/api/manage" && request.method === "POST") {
            return await handleManageAPI(request, env);
        }

        // API: 獲取列表
        if (url.pathname === "/api/list") {
            return await handleListAPI(env);
        }

        // API: 獲取統計資料
        if (url.pathname === "/api/stats") {
            return await handleStatsAPI(env);
        }

        // ==========================================
        // 3. 頁面路由處理
        // ==========================================

        // 根目錄 -> 個人介紹頁
        if (path === "") {
            return new Response(generateIntroHTML(), {
                headers: { "Content-Type": "text/html;charset=UTF-8" }
            });
        }

        // 管理後台
        if (path === ADMIN_PATH) {
            return new Response(generateAdminHTML(), {
                headers: { "Content-Type": "text/html;charset=UTF-8" }
            });
        }

        // 縮網址轉址 + 統計
        const targetUrl = await env.SHORT_URLS.get(path);
        if (targetUrl) {
            // 記錄點擊統計
            await incrementClickCount(env, path);
            return Response.redirect(targetUrl, 301);
        }

        // 404 頁面
        return new Response(generate404HTML(), {
            status: 404,
            headers: { "Content-Type": "text/html;charset=UTF-8" }
        });
    }
};

// ==========================================
// 4. API 處理函數
// ==========================================

/**
 * 處理管理 API (新增/刪除/編輯)
 */
async function handleManageAPI(request, env) {
    try {
        const data = await request.json();

        // 驗證密碼 (從環境變數讀取)
        const ADMIN_PASSWORD = env.ADMIN_PASSWORD || "0 2k6";
        if (data.password !== ADMIN_PASSWORD) {
            return new Response(JSON.stringify({ error: "密碼錯誤" }), {
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 新增縮網址
        if (data.action === "add") {
            // 驗證輸入
            if (!data.key || !data.value) {
                return new Response(JSON.stringify({ error: "短碼與網址不能為空" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            // 驗證短碼格式 (只允許英數字和連字號)
            if (!/^[a-zA-Z0-9-_]+$/.test(data.key)) {
                return new Response(JSON.stringify({ error: "短碼只能包含英數字、連字號和底線" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            // 防止覆蓋系統路徑
            if (data.key === ADMIN_PATH || data.key === "api") {
                return new Response(JSON.stringify({ error: "此短碼為系統保留" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            // 驗證網址格式
            if (!URL_REGEX.test(data.value)) {
                return new Response(JSON.stringify({ error: "請輸入有效的網址 (需包含 http:// 或 https://)" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            await env.SHORT_URLS.put(data.key, data.value);
            return new Response(JSON.stringify({ success: true, message: "成功新增" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 刪除縮網址
        if (data.action === "delete") {
            await env.SHORT_URLS.delete(data.key);
            // 同時刪除統計資料
            await env.SHORT_URLS.delete(STATS_PREFIX + data.key);
            return new Response(JSON.stringify({ success: true, message: "成功刪除" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 編輯縮網址
        if (data.action === "edit") {
            if (!data.key || !data.value) {
                return new Response(JSON.stringify({ error: "短碼與網址不能為空" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            if (!URL_REGEX.test(data.value)) {
                return new Response(JSON.stringify({ error: "請輸入有效的網址" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            await env.SHORT_URLS.put(data.key, data.value);
            return new Response(JSON.stringify({ success: true, message: "成功更新" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ error: "未知的操作" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "資料格式錯誤: " + err.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }
}

/**
 * 處理列表 API
 */
async function handleListAPI(env) {
    try {
        const list = await env.SHORT_URLS.list();
        const items = [];

        for (const k of list.keys) {
            // 跳過統計資料
            if (k.name.startsWith(STATS_PREFIX)) continue;

            const value = await env.SHORT_URLS.get(k.name);
            const clicks = await env.SHORT_URLS.get(STATS_PREFIX + k.name) || "0";

            items.push({
                key: k.name,
                value: value,
                clicks: parseInt(clicks),
                createdAt: k.metadata?.createdAt || null
            });
        }

        // 按點擊次數排序
        items.sort((a, b) => b.clicks - a.clicks);

        return new Response(JSON.stringify(items), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

/**
 * 處理統計 API
 */
async function handleStatsAPI(env) {
    try {
        const list = await env.SHORT_URLS.list();
        let totalUrls = 0;
        let totalClicks = 0;

        for (const k of list.keys) {
            if (k.name.startsWith(STATS_PREFIX)) {
                const clicks = await env.SHORT_URLS.get(k.name);
                totalClicks += parseInt(clicks || 0);
            } else {
                totalUrls++;
            }
        }

        return new Response(JSON.stringify({
            totalUrls,
            totalClicks,
            avgClicksPerUrl: totalUrls > 0 ? (totalClicks / totalUrls).toFixed(2) : 0
        }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

/**
 * 增加點擊計數
 */
async function incrementClickCount(env, key) {
    try {
        const statsKey = STATS_PREFIX + key;
        const currentCount = await env.SHORT_URLS.get(statsKey) || "0";
        const newCount = parseInt(currentCount) + 1;
        await env.SHORT_URLS.put(statsKey, newCount.toString());
    } catch (err) {
        console.error("Failed to increment click count:", err);
    }
}

// ==========================================
// 5. HTML 生成函數
// ==========================================

/**
 * 個人介紹頁面 - 現代化設計
 */
function generateIntroHTML() {
    return `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>個人主頁 | Personal Profile</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      :root {
        --primary: #6366f1;
        --primary-dark: #4f46e5;
        --secondary: #8b5cf6;
        --bg-gradient-start: #0f172a;
        --bg-gradient-end: #1e293b;
        --card-bg: rgba(255, 255, 255, 0.05);
        --text-primary: #f1f5f9;
        --text-secondary: #94a3b8;
        --border: rgba(255, 255, 255, 0.1);
      }

      body {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        position: relative;
        overflow: hidden;
      }

      /* 背景動畫效果 */
      body::before {
        content: '';
        position: absolute;
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
        opacity: 0.15;
        top: -250px;
        right: -250px;
        animation: float 20s infinite ease-in-out;
      }

      body::after {
        content: '';
        position: absolute;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, var(--secondary) 0%, transparent 70%);
        opacity: 0.15;
        bottom: -200px;
        left: -200px;
        animation: float 15s infinite ease-in-out reverse;
      }

      @keyframes float {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        33% { transform: translate(30px, -30px) rotate(120deg); }
        66% { transform: translate(-20px, 20px) rotate(240deg); }
      }

      .card {
        background: var(--card-bg);
        backdrop-filter: blur(20px);
        padding: 50px 40px;
        border-radius: 24px;
        border: 1px solid var(--border);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        text-align: center;
        max-width: 450px;
        width: 100%;
        position: relative;
        z-index: 1;
        animation: slideUp 0.6s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .avatar {
        width: 140px;
        height: 140px;
        border-radius: 50%;
        margin: 0 auto 24px;
        border: 4px solid var(--primary);
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        transition: transform 0.3s ease;
      }

      .avatar:hover {
        transform: scale(1.05) rotate(5deg);
      }

      h1 {
        color: var(--text-primary);
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 12px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .subtitle {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 32px;
        font-size: 1rem;
      }

      .links {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 32px;
      }

      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 24px;
        background: linear-gradient(135deg, var(--primary), var(--primary-dark));
        color: white;
        text-decoration: none;
        border-radius: 12px;
        font-weight: 600;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
      }

      .btn:hover::before {
        left: 100%;
      }

      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
      }

      .btn-secondary {
        background: var(--card-bg);
        border: 1px solid var(--border);
      }

      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      }

      .footer {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid var(--border);
        font-size: 0.85rem;
        color: var(--text-secondary);
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

      @media (max-width: 480px) {
        .card { padding: 40px 24px; }
        h1 { font-size: 1.75rem; }
      }
    </style>
  </head>
  <body>
    <div class="card">
      <img src="https://ui-avatars.com/api/?name=Developer&background=6366f1&color=fff&size=280&bold=true" alt="Avatar" class="avatar">
      
      <h1>👋 Hello, I'm Developer</h1>
      <p class="subtitle">
        全端開發者 / 技術愛好者 / 創新實踐者<br>
        熱衷於打造優雅的數位體驗
      </p>
      
      <div class="links">
        <a href="https://github.com" class="btn" target="_blank">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </a>
        <a href="mailto:your@email.com" class="btn">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          Email Me
        </a>
        <a href="/blog" class="btn btn-secondary">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
          My Blog
        </a>
      </div>

      <div class="footer">
        © 2026 Personal Site · <a href="/${ADMIN_PATH}" class="secret-link" title="Admin">⚙</a>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * 404 頁面
 */
function generate404HTML() {
    return `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - 頁面不存在</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Inter', sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }
      .container {
        text-align: center;
        color: white;
      }
      .error-code {
        font-size: 8rem;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 20px;
        text-shadow: 0 10px 30px rgba(0,0,0,0.3);
      }
      h1 {
        font-size: 2rem;
        margin-bottom: 16px;
      }
      p {
        font-size: 1.1rem;
        opacity: 0.9;
        margin-bottom: 32px;
      }
      .btn {
        display: inline-block;
        padding: 14px 32px;
        background: white;
        color: #667eea;
        text-decoration: none;
        border-radius: 12px;
        font-weight: 600;
        transition: transform 0.3s, box-shadow 0.3s;
      }
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="error-code">404</div>
      <h1>哎呀！頁面不存在</h1>
      <p>您訪問的頁面可能已被移除或不存在</p>
      <a href="/" class="btn">返回首頁</a>
    </div>
  </body>
  </html>
  `;
}

/**
 * 管理後台 - 增強版
 */
function generateAdminHTML() {
    return `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>縮網址管理後台</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      :root {
        --primary: #6366f1;
        --primary-hover: #4f46e5;
        --danger: #ef4444;
        --danger-hover: #dc2626;
        --success: #10b981;
        --bg: #f8fafc;
        --card-bg: white;
        --border: #e2e8f0;
        --text-primary: #1e293b;
        --text-secondary: #64748b;
        --shadow: 0 1px 3px rgba(0,0,0,0.1);
        --shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background: var(--bg);
        padding: 20px;
        color: var(--text-primary);
      }

      .container {
        max-width: 900px;
        margin: 0 auto;
      }

      .header {
        background: linear-gradient(135deg, var(--primary), #8b5cf6);
        color: white;
        padding: 32px;
        border-radius: 16px;
        margin-bottom: 24px;
        box-shadow: var(--shadow-lg);
      }

      .header h1 {
        font-size: 1.875rem;
        margin-bottom: 8px;
      }

      .header p {
        opacity: 0.9;
        font-size: 0.95rem;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        background: var(--card-bg);
        padding: 20px;
        border-radius: 12px;
        box-shadow: var(--shadow);
        border: 1px solid var(--border);
      }

      .stat-label {
        color: var(--text-secondary);
        font-size: 0.875rem;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary);
      }

      .card {
        background: var(--card-bg);
        padding: 28px;
        border-radius: 16px;
        box-shadow: var(--shadow);
        margin-bottom: 24px;
        border: 1px solid var(--border);
      }

      .card h3 {
        margin-bottom: 20px;
        color: var(--text-primary);
        font-size: 1.25rem;
      }

      .input-group {
        margin-bottom: 16px;
      }

      label {
        display: block;
        margin-bottom: 6px;
        color: var(--text-secondary);
        font-size: 0.875rem;
        font-weight: 500;
      }

      input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 0.95rem;
        transition: all 0.2s;
        font-family: inherit;
      }

      input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.95rem;
        font-family: inherit;
      }

      .btn-primary {
        background: var(--primary);
        color: white;
        width: 100%;
      }

      .btn-primary:hover:not(:disabled) {
        background: var(--primary-hover);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      }

      .btn-danger {
        background: var(--danger);
        color: white;
        padding: 8px 16px;
        font-size: 0.875rem;
      }

      .btn-danger:hover:not(:disabled) {
        background: var(--danger-hover);
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .search-box {
        margin-bottom: 20px;
      }

      .search-box input {
        padding-left: 40px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%2364748b' viewBox='0 0 24 24'%3E%3Cpath d='M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: 12px center;
      }

      .list-container {
        max-height: 600px;
        overflow-y: auto;
      }

      .list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid var(--border);
        transition: background 0.2s;
        gap: 16px;
      }

      .list-item:last-child {
        border-bottom: none;
      }

      .list-item:hover {
        background: #f8fafc;
      }

      .list-info {
        flex: 1;
        min-width: 0;
      }

      .list-key {
        font-weight: 600;
        color: var(--primary);
        margin-bottom: 4px;
        font-size: 0.95rem;
      }

      .list-url {
        color: var(--text-secondary);
        font-size: 0.875rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .list-url a {
        color: inherit;
        text-decoration: none;
      }

      .list-url a:hover {
        color: var(--primary);
        text-decoration: underline;
      }

      .list-stats {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-secondary);
        font-size: 0.875rem;
        white-space: nowrap;
      }

      .click-count {
        background: #f1f5f9;
        padding: 4px 12px;
        border-radius: 12px;
        font-weight: 600;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-secondary);
      }

      .empty-state svg {
        width: 80px;
        height: 80px;
        margin-bottom: 16px;
        opacity: 0.3;
      }

      .back-link {
        display: inline-block;
        margin-top: 20px;
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.95rem;
        transition: color 0.2s;
      }

      .back-link:hover {
        color: var(--primary);
      }

      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-bg);
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        border-left: 4px solid var(--success);
        display: none;
        animation: slideIn 0.3s ease-out;
        z-index: 1000;
      }

      .toast.error {
        border-left-color: var(--danger);
      }

      .toast.show {
        display: block;
      }

      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 640px) {
        .list-item {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .list-stats {
          width: 100%;
          justify-content: space-between;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🔗 縮網址管理後台</h1>
        <p>管理您的所有短網址連結與統計資料</p>
      </div>

      <div class="stats" id="stats">
        <div class="stat-card">
          <div class="stat-label">總連結數</div>
          <div class="stat-value" id="totalUrls">-</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">總點擊次數</div>
          <div class="stat-value" id="totalClicks">-</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">平均點擊率</div>
          <div class="stat-value" id="avgClicks">-</div>
        </div>
      </div>

      <div class="card">
        <h3>🔐 身份驗證</h3>
        <div class="input-group">
          <label for="pw">管理密碼</label>
          <input type="password" id="pw" placeholder="請輸入管理密碼">
        </div>
      </div>

      <div class="card">
        <h3>➕ 新增縮網址</h3>
        <div class="input-group">
          <label for="newKey">短碼 *</label>
          <input type="text" id="newKey" placeholder="例如: github (只能包含英數字、連字號和底線)">
        </div>
        <div class="input-group">
          <label for="newVal">目標網址 *</label>
          <input type="url" id="newVal" placeholder="https://example.com">
        </div>
        <button class="btn btn-primary" onclick="manage('add')">新增連結</button>
      </div>

      <div class="card">
        <h3>📋 連結列表</h3>
        <div class="search-box">
          <input type="text" id="searchInput" placeholder="搜尋短碼或網址..." onkeyup="filterList()">
        </div>
        <div id="list" class="list-container">
          <div class="empty-state">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <p>載入中...</p>
          </div>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="/" class="back-link">← 返回首頁</a>
      </div>
    </div>

    <div id="toast" class="toast"></div>

    <script>
      let allItems = [];

      // 顯示提示訊息
      function showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast show' + (isError ? ' error' : '');
        setTimeout(() => toast.className = 'toast', 3000);
      }

      // 載入統計資料
      async function loadStats() {
        try {
          const res = await fetch('/api/stats');
          const data = await res.json();
          document.getElementById('totalUrls').textContent = data.totalUrls;
          document.getElementById('totalClicks').textContent = data.totalClicks;
          document.getElementById('avgClicks').textContent = data.avgClicksPerUrl;
        } catch (e) {
          console.error('Failed to load stats:', e);
        }
      }

      // 生成列表項目 HTML
      function createItemHTML(item) {
        const shortUrl = window.location.origin + '/' + item.key;
        return \`
          <div class="list-item" id="item-\${item.key}" data-key="\${item.key}" data-value="\${item.value}">
            <div class="list-info">
              <div class="list-key">
                <span onclick="copyToClipboard('\${shortUrl}')" style="cursor: pointer;" title="點擊複製">
                  /\${item.key}
                </span>
              </div>
              <div class="list-url">
                <a href="\${item.value}" target="_blank">\${item.value}</a>
              </div>
            </div>
            <div class="list-stats">
              <span class="click-count" title="點擊次數">👆 \${item.clicks || 0}</span>
              <button class="btn btn-danger" onclick="manage('delete', '\${item.key}')">刪除</button>
            </div>
          </div>
        \`;
      }

      // 複製到剪貼簿
      function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('已複製到剪貼簿: ' + text);
        }).catch(() => {
          showToast('複製失敗', true);
        });
      }

      // 載入列表
      async function loadList() {
        const listDiv = document.getElementById('list');
        try {
          const res = await fetch('/api/list');
          const data = await res.json();
          allItems = data;

          if (data.length === 0) {
            listDiv.innerHTML = \`
              <div class="empty-state">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                <p>目前沒有任何縮網址<br>使用上方表單新增第一個連結吧！</p>
              </div>
            \`;
            return;
          }

          listDiv.innerHTML = data.map(item => createItemHTML(item)).join('');
          loadStats();
        } catch (e) {
          listDiv.innerHTML = '<div class="empty-state" style="color: var(--danger);">載入失敗，請檢查網路連線</div>';
        }
      }

      // 搜尋過濾
      function filterList() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const items = document.querySelectorAll('.list-item');
        
        items.forEach(item => {
          const key = item.dataset.key.toLowerCase();
          const value = item.dataset.value.toLowerCase();
          const match = key.includes(searchTerm) || value.includes(searchTerm);
          item.style.display = match ? 'flex' : 'none';
        });
      }

      // 管理操作
      async function manage(action, key) {
        const password = document.getElementById('pw').value;
        const keyInput = document.getElementById('newKey');
        const valInput = document.getElementById('newVal');

        const reqKey = action === 'add' ? keyInput.value.trim() : key;
        const reqVal = action === 'add' ? valInput.value.trim() : '';

        if (!password) {
          showToast('請輸入管理密碼', true);
          return;
        }

        if (action === 'add' && (!reqKey || !reqVal)) {
          showToast('短碼與網址都不能為空', true);
          return;
        }

        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '處理中...';
        btn.disabled = true;

        try {
          const res = await fetch('/api/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, password, key: reqKey, value: reqVal })
          });

          const result = await res.json();

          if (res.ok) {
            showToast(result.message);
            
            if (action === 'add') {
              keyInput.value = '';
              valInput.value = '';
            }
            
            // 重新載入列表
            await loadList();
          } else {
            showToast(result.error || '操作失敗', true);
          }
        } catch (err) {
          showToast('連線發生錯誤: ' + err.message, true);
        } finally {
          btn.textContent = originalText;
          btn.disabled = false;
        }
      }

      // 初始化
      loadList();
      loadStats();
    </script>
  </body>
  </html>
  `;
}
