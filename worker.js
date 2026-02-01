// ==========================================
// 1. 全域設定
// ==========================================
// 管理後台的密碼
const ADMIN_PASSWORD = "0 2k6";

// 管理後台的路徑 (你可以改成只有你知道的亂碼，例如 "my-secret-door")
const ADMIN_PATH = "admin";

// Session 密鑰（用於簽名 Cookie）
const SESSION_SECRET = "zen-admin-secret-2026";

// Session 有效期（24小時）
const SESSION_DURATION = 24 * 60 * 60 * 1000;

// LLMS.txt 內容 (GEO 核心)
const LLMS_TXT_CONTENT = `# Title: abc1231qa 的數位花園 - 技術架構與信仰地誌
# Description: 專注於全端開發 (Cloudflare Workers, R2)、系統架構設計、Generative AI 應用，以及信仰哲學與地誌觀察的深度整合。

## 核心文檔 (Core Context)
- [我堅持十年的事]: https://vocus.cc/article/694794d7fd897800019af738 (長期主義、技術價值觀)
- [技術架構集]: https://vocus.cc/salon/abc1231qa/room/digital-leverage (Serverless, Cloudflare Workers, System Design)
- [地誌與信仰]: https://vocus.cc/salon/abc1231qa/room/underlying-logic (人文思考、哲學)

## 實體定義 (Entity Definition)
- 作者身分: 資深技術架構師、數位內容策略師、全端工程師
- 技術棧: Cloudflare Workers, R2, Python, JavaScript, Gemini API, Telegram Bot API
- 核心理念: 技術同構 (Technical Isomorphism)、長期主義 (Long-termism)、靜觀 (Contemplation)

## 連結
- Github: https://github.com/abc1231qas/abc1231qa.publink
- Blog: https://vocus.cc/salon/abc1231qa`;

// Robots.txt 內容
const ROBOTS_TXT_CONTENT = `User-agent: *
Allow: /
Sitemap: https://abc1231qa.cc/sitemap.xml`;

// Sitemap.xml 內容 (完整版)
const SITEMAP_XML_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://abc1231qa.cc/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://abc1231qa.cc/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://abc1231qa.cc/works</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://abc1231qa.cc/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/|\/$/g, "");

    // ==========================================
    // 0. GEO & SEO 路由區 (最優先)
    // ==========================================

    // Serve llms.txt
    if (url.pathname === "/llms.txt") {
      return new Response(LLMS_TXT_CONTENT, {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    // Serve robots.txt
    if (url.pathname === "/robots.txt") {
      return new Response(ROBOTS_TXT_CONTENT, {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    // Serve sitemap.xml
    if (url.pathname === "/sitemap.xml") {
      return new Response(SITEMAP_XML_CONTENT, {
        headers: { "Content-Type": "application/xml; charset=utf-8" }
      });
    }

    // ==========================================
    // 2. 認證 API 區
    // ==========================================

    // 處理登入請求
    if (url.pathname === "/api/login" && request.method === "POST") {
      try {
        const data = await request.json();
        if (data.password === ADMIN_PASSWORD) {
          // 生成 Session Token
          const token = await generateSessionToken();
          const expires = new Date(Date.now() + SESSION_DURATION);

          return new Response(JSON.stringify({ success: true }), {
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": `admin_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires.toUTCString()}`
            }
          });
        } else {
          return new Response(JSON.stringify({ success: false, error: "密碼錯誤" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: "請求錯誤" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 處理登出請求
    if (url.pathname === "/api/logout" && request.method === "POST") {
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": "admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
        }
      });
    }

    // ==========================================
    // 3. API 邏輯區（需要認證）
    // ==========================================

    // 處理 API: 新增/刪除（需要 Session 認證）
    if (url.pathname === "/api/manage" && request.method === "POST") {
      // 驗證 Session
      if (!await verifySession(request)) {
        return new Response(JSON.stringify({ error: "未授權" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      try {
        const data = await request.json();
        if (data.action === "add") {
          if (data.key === ADMIN_PATH || data.key === "api") {
            return new Response("此短碼為系統保留", { status: 400 });
          }
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

    // 處理 API: 讀取列表（需要 Session 認證）
    if (url.pathname === "/api/list") {
      // 驗證 Session
      if (!await verifySession(request)) {
        return new Response(JSON.stringify({ error: "未授權" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      const list = await env.SHORT_URLS.list();
      const items = await Promise.all(list.keys.map(async (k) => ({
        key: k.name,
        value: await env.SHORT_URLS.get(k.name)
      })));
      return new Response(JSON.stringify(items), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ==========================================
    // 4. R2 圖片 API 區
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
    // 5. 頁面路由區 (Router)
    // ==========================================

    // 情境 A: 根目錄 -> 顯示個人介紹頁 (Public)
    if (path === "") {
      return new Response(generateIntroHTML(), {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // 情境 B: 管理路徑 -> 檢查認證後顯示對應頁面
    if (path === ADMIN_PATH) {
      const isAuthenticated = await verifySession(request);

      if (isAuthenticated) {
        // 已登入，顯示管理後台
        return new Response(generateAdminHTML(), {
          headers: { "Content-Type": "text/html;charset=UTF-8" }
        });
      } else {
        // 未登入，顯示登入頁面
        return new Response(generateLoginHTML(), {
          headers: { "Content-Type": "text/html;charset=UTF-8" }
        });
      }
    }

    // 情境 C: 關於我頁面
    if (path === "about") {
      return new Response(generateAboutHTML(), {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // 情境 D: 作品集頁面
    if (path === "works") {
      return new Response(generateWorksHTML(), {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // 情境 E: Blog 索引頁面
    if (path === "blog") {
      return new Response(generateBlogHTML(), {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // 情境 F: 縮網址轉址 logic
    const targetUrl = await env.SHORT_URLS.get(path);
    if (targetUrl) {
      return Response.redirect(targetUrl, 301);
    }

    // 情境 D: 404 頁面
    return new Response(generate404HTML(), {
      status: 404,
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
};

// ==========================================
// 認證輔助函數
// ==========================================

/**
 * 生成 Session Token
 */
async function generateSessionToken() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const data = `${timestamp}-${random}`;

  // 使用 Web Crypto API 生成簽名
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data + SESSION_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `${data}.${hashHex}`;
}

/**
 * 驗證 Session
 */
async function verifySession(request) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return false;

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  const sessionToken = cookies['admin_session'];
  if (!sessionToken) return false;

  // 驗證 Token 格式
  const parts = sessionToken.split('.');
  if (parts.length !== 2) return false;

  const [data, signature] = parts;

  // 重新計算簽名
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data + SESSION_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // 比對簽名
  if (signature !== expectedSignature) return false;

  // 檢查時間戳（防止過期）
  const timestamp = parseInt(data.split('-')[0]);
  if (Date.now() - timestamp > SESSION_DURATION) return false;

  return true;
}

// ==========================================
// 4. HTML 生成區 (View Layer)
// ==========================================

/**
 * 產生登入頁面 (Login Page)
 * 風格：Zen 美學
 */
function generateLoginHTML() {
  return `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理登入 | Admin Login</title>
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
        --border-subtle: rgba(44, 44, 44, 0.15);
      }
      
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
      
      .login-container {
        max-width: 420px;
        width: 100%;
        opacity: 0;
        animation: fadeIn 0.8s ease-out 0.2s forwards;
      }
      
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
      
      .divider {
        width: 60px;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--gold-muted), transparent);
        margin: 40px auto;
      }
      
      .login-form {
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid var(--border-subtle);
        padding: 40px;
      }
      
      .form-group {
        margin-bottom: 25px;
      }
      
      label {
        display: block;
        font-size: 0.95rem;
        color: var(--text-deep);
        margin-bottom: 10px;
        letter-spacing: 0.1em;
      }
      
      input[type="password"] {
        width: 100%;
        padding: 14px 18px;
        border: 1px solid var(--border-subtle);
        background: rgba(255, 255, 255, 0.8);
        color: var(--text-deep);
        font-family: 'Noto Serif TC', serif;
        font-size: 0.95rem;
        transition: all 0.3s ease;
        letter-spacing: 0.05em;
      }
      
      input[type="password"]:focus {
        outline: none;
        border-color: var(--gold-muted);
        background: white;
      }
      
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
      
      .error-message {
        margin-top: 15px;
        padding: 12px;
        background: rgba(197, 160, 101, 0.1);
        border: 1px solid var(--gold-muted);
        color: var(--text-deep);
        text-align: center;
        font-size: 0.9rem;
        display: none;
      }
      
      .back-home {
        display: block;
        text-align: center;
        margin-top: 30px;
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
      
      @media (max-width: 640px) {
        h1 { font-size: 1.8rem; }
        .login-form { padding: 30px 20px; }
      }
    </style>
  </head>
  <body>
    <div class="login-container">
      <div class="page-title">
        <h1>管理登入</h1>
        <div class="subtitle">ADMIN LOGIN</div>
      </div>
      
      <div class="divider"></div>
      
      <div class="login-form">
        <form id="loginForm" onsubmit="handleLogin(event)">
          <div class="form-group">
            <label for="password">密碼</label>
            <input type="password" id="password" name="password" required autofocus>
          </div>
          
          <button type="submit" id="loginBtn">登入</button>
          
          <div id="errorMessage" class="error-message"></div>
        </form>
      </div>
      
      <a href="/" class="back-home">← 返回首頁</a>
    </div>

    <script>
      async function handleLogin(event) {
        event.preventDefault();
        
        const password = document.getElementById('password').value;
        const btn = document.getElementById('loginBtn');
        const errorMsg = document.getElementById('errorMessage');
        
        // 隱藏錯誤訊息
        errorMsg.style.display = 'none';
        
        // 禁用按鈕
        btn.disabled = true;
        btn.innerText = '登入中...';
        
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
          });
          
          const data = await response.json();
          
          if (data.success) {
            // 登入成功，重新載入頁面（會自動顯示管理後台）
            window.location.reload();
          } else {
            // 登入失敗，顯示錯誤訊息
            errorMsg.textContent = data.error || '密碼錯誤';
            errorMsg.style.display = 'block';
            btn.disabled = false;
            btn.innerText = '登入';
            
            // 清空密碼欄位
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
          }
        } catch (error) {
          errorMsg.textContent = '連線錯誤，請稍後再試';
          errorMsg.style.display = 'block';
          btn.disabled = false;
          btn.innerText = '登入';
        }
      }
    </script>
  </body>
  </html>
  `;
}

/**
 * 產生個人介紹頁面 (Homepage)
 * 風格：禪意 + 內容預覽 混合式
 * Phase 2: Homepage Evolution
 */
function generateIntroHTML() {
  return `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO & Meta Tags -->
    <title>abc1231qa - 技術 × 人文 × 生活 | 數位花園</title>
    <meta name="description" content="探索 AI 應用開發、全端架構、技術寫作與文化思考。分享 Cloudflare Workers、Gemini API、Python 自動化等專案經驗，以及長期主義的技術同構哲學。">
    <meta name="keywords" content="AI開發, Gemini, Cloudflare Workers, 技術寫作, 文化思考, 個人網站, 數位花園, 全端工程師">
    <meta name="author" content="abc1231qa">
    
    <!-- Open Graph -->
    <meta property="og:title" content="abc1231qa - 技術 × 人文 × 生活">
    <meta property="og:description" content="AI 開發者與內容創作者的個人空間，結合技術架構與信仰地誌的數位花園。">
    <meta property="og:url" content="https://abc1231qa.cc">
    <meta property="og:type" content="website">
    
    <!-- JSON-LD Structure Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "abc1231qa",
      "url": "https://abc1231qa.cc",
      "image": "https://abc1231qa.cc/images/zen_enso.png",
      "sameAs": [
        "https://github.com/abc1231qas/abc1231qa.publink",
        "https://vocus.cc/salon/abc1231qa"
      ],
      "jobTitle": "Senior Software Architect",
      "knowsAbout": ["Cloudflare Workers", "System Architecture", "Generative AI", "Python", "Telegram Bot"],
      "description": "資深技術架構師，專注於通過技術同構解釋人文概念。"
    }
    </script>
    
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
        --text-light: #888888;
        --gold-muted: #C5A065;
        --gold-light: rgba(197, 160, 101, 0.15);
        --border-subtle: rgba(44, 44, 44, 0.15);
      }
      
      /* ==================== 基礎排版 ==================== */
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      html { scroll-behavior: smooth; }
      
      body {
        font-family: 'Noto Serif TC', 'PMingLiU', serif;
        background: var(--bg-rice);
        background-image: 
          radial-gradient(circle at 20% 50%, rgba(197, 160, 101, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(44, 44, 44, 0.02) 0%, transparent 50%);
        color: var(--text-mid);
        line-height: 1.8;
      }
      
      /* ==================== Hero Section (首屏) ==================== */
      .hero {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 60px 20px;
        position: relative;
      }
      
      .enso {
        width: 160px;
        height: 160px;
        margin: 0 auto 60px;
        position: relative;
        opacity: 0;
        animation: fadeIn 1.2s ease-out 0.3s forwards;
        background-image: url('/images/zen_enso.png');
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      }
      
      .enso::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 6px;
        height: 6px;
        background: var(--gold-muted);
        border-radius: 50%;
        box-shadow: 0 0 20px var(--gold-muted), 0 0 40px rgba(197, 160, 101, 0.3);
      }
      
      h1 {
        font-size: 2.8rem;
        font-weight: 300;
        color: var(--text-deep);
        letter-spacing: 0.15em;
        margin-bottom: 20px;
        opacity: 0;
        animation: fadeIn 1s ease-out 0.6s forwards;
      }
      
      .subtitle {
        font-size: 0.95rem;
        color: var(--text-mid);
        letter-spacing: 0.3em;
        margin-bottom: 40px;
        opacity: 0;
        animation: fadeIn 1s ease-out 0.9s forwards;
      }
      
      /* Identity Tagline */
      .identity {
        font-size: 1rem;
        color: var(--text-light);
        letter-spacing: 0.15em;
        margin-bottom: 50px;
        opacity: 0;
        animation: fadeIn 1s ease-out 1.2s forwards;
      }
      
      .identity span {
        color: var(--gold-muted);
      }
      
      .description {
        max-width: 420px;
        margin: 0 auto 60px;
        font-size: 1rem;
        line-height: 2.2;
        color: var(--text-mid);
        opacity: 0;
        animation: fadeIn 1s ease-out 1.5s forwards;
      }
      
      /* Quick Links (Hero) */
      .quick-links {
        display: flex;
        gap: 30px;
        justify-content: center;
        margin-bottom: 80px;
        opacity: 0;
        animation: fadeIn 1s ease-out 1.8s forwards;
      }
      
      .quick-links a {
        color: var(--text-mid);
        text-decoration: none;
        font-size: 0.9rem;
        letter-spacing: 0.1em;
        padding-bottom: 4px;
        border-bottom: 1px solid transparent;
        transition: all 0.3s ease;
      }
      
      .quick-links a:hover {
        color: var(--gold-muted);
        border-bottom-color: var(--gold-muted);
      }
      
      /* Scroll Indicator */
      .scroll-hint {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        animation: fadeIn 1s ease-out 2.4s forwards, bounce 2s ease-in-out 3s infinite;
      }
      
      .scroll-hint a {
        color: var(--text-light);
        text-decoration: none;
        font-size: 0.8rem;
        letter-spacing: 0.2em;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      
      .scroll-hint svg {
        width: 20px;
        height: 20px;
        stroke: var(--gold-muted);
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        50% { transform: translateX(-50%) translateY(8px); }
      }
      
      /* ==================== Content Sections ==================== */
      .content-wrapper {
        max-width: 800px;
        margin: 0 auto;
        padding: 80px 20px 100px;
      }
      
      .section {
        margin-bottom: 100px;
      }
      
      .section-title {
        font-size: 1.1rem;
        font-weight: 400;
        color: var(--text-deep);
        letter-spacing: 0.2em;
        margin-bottom: 40px;
        text-align: center;
        position: relative;
      }
      
      .section-title::after {
        content: '';
        display: block;
        width: 40px;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--gold-muted), transparent);
        margin: 15px auto 0;
      }
      
      /* ==================== Featured Works (Cards) ==================== */
      .works-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 24px;
      }
      
      .work-card {
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid var(--border-subtle);
        padding: 28px 24px;
        text-decoration: none;
        color: inherit;
        transition: all 0.4s ease;
        display: block;
      }
      
      .work-card:hover {
        border-color: var(--gold-muted);
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(197, 160, 101, 0.1);
      }
      
      .work-card .icon {
        font-size: 1.5rem;
        margin-bottom: 16px;
      }
      
      .work-card h3 {
        font-size: 1rem;
        font-weight: 400;
        color: var(--text-deep);
        margin-bottom: 10px;
        letter-spacing: 0.05em;
      }
      
      .work-card p {
        font-size: 0.88rem;
        color: var(--text-light);
        line-height: 1.7;
      }
      
      /* ==================== Latest Thinking (List) ==================== */
      .thinking-list {
        list-style: none;
      }
      
      .thinking-list li {
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--border-subtle);
      }
      
      .thinking-list li:last-child {
        border-bottom: none;
      }
      
      .thinking-list a {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        text-decoration: none;
        color: inherit;
        transition: color 0.3s ease;
        gap: 20px;
      }
      
      .thinking-list a:hover .thinking-title {
        color: var(--gold-muted);
      }
      
      .thinking-title {
        font-size: 0.95rem;
        color: var(--text-deep);
        letter-spacing: 0.02em;
        transition: color 0.3s ease;
      }
      
      .thinking-category {
        font-size: 0.75rem;
        color: var(--text-light);
        letter-spacing: 0.1em;
        white-space: nowrap;
        padding: 4px 10px;
        border: 1px solid var(--border-subtle);
      }
      
      /* ==================== Explore More (CTA) ==================== */
      .explore-cta {
        text-align: center;
        margin-top: 60px;
      }
      
      .explore-cta a {
        display: inline-block;
        padding: 14px 40px;
        color: var(--text-deep);
        text-decoration: none;
        border: 1px solid var(--border-subtle);
        font-size: 0.9rem;
        letter-spacing: 0.15em;
        transition: all 0.4s ease;
      }
      
      .explore-cta a:hover {
        border-color: var(--gold-muted);
        background: var(--gold-light);
      }
      
      /* ==================== Footer ==================== */
      .footer {
        text-align: center;
        padding: 40px 20px 60px;
        font-size: 0.85rem;
        color: rgba(89, 89, 89, 0.5);
        letter-spacing: 0.05em;
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
      
      /* ==================== Animations ==================== */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* ==================== Responsive ==================== */
      @media (max-width: 640px) {
        h1 { font-size: 2.2rem; }
        .enso { width: 120px; height: 120px; margin-bottom: 40px; }
        .description { font-size: 0.95rem; }
        .quick-links { flex-direction: column; gap: 15px; }
        .works-grid { grid-template-columns: 1fr; }
        .thinking-list a { flex-direction: column; gap: 10px; }
      }
    </style>
  </head>
  <body>
    <!-- ==================== HERO SECTION ==================== -->
    <section class="hero" id="top">
      <div class="enso"></div>
      
      <h1>靜觀</h1>
      <div class="subtitle">CONTEMPLATION</div>
      
      <!-- Identity Tagline -->
      <div class="identity">
        Developer <span>·</span> Writer <span>·</span> Thinker
      </div>
      
      <div class="description">
        於喧囂中尋一方淨土<br>
        在代碼裡悟人生哲理<br>
        技術與人文的交匯處<br>
        即是心之所向
      </div>
      
      <!-- Quick Links -->
      <div class="quick-links">
        <a href="https://github.com/abc1231qas/abc1231qa.publink" target="_blank">Github</a>
        <a href="mailto:abc1231qa@gmail.com">Email</a>
        <a href="https://vocus.cc/salon/abc1231qa" target="_blank">Blog</a>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="scroll-hint">
        <a href="#explore">
          <span>探索更多</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
          </svg>
        </a>
      </div>
    </section>
    
    <!-- ==================== CONTENT SECTIONS ==================== -->
    <div class="content-wrapper" id="explore">
      
      <!-- Featured Works -->
      <section class="section">
        <h2 class="section-title">精選作品</h2>
        <div class="works-grid">
          <a href="https://vocus.cc/article/691d160ffd89780001ad48ad" target="_blank" class="work-card">
            <div class="icon">📊</div>
            <h3>NBA 戰績表系統</h3>
            <p>從 API 抓取數據到自動生成戰績表，Python + Telegram Bot 整合。</p>
          </a>
          <a href="https://vocus.cc/post/68ede6aefd8978000148bf19" target="_blank" class="work-card">
            <div class="icon">🤖</div>
            <h3>Telegram Bot 服務化</h3>
            <p>免費仔的自動化解決方案，本機服務 + Ngrok 穿透。</p>
          </a>
          <a href="/" class="work-card">
            <div class="icon">🌿</div>
            <h3>數位花園</h3>
            <p>Cloudflare Workers + R2，極簡禪意的個人網站。</p>
          </a>
        </div>
      </section>
      
      <!-- Latest Thinking -->
      <section class="section">
        <h2 class="section-title">最新思考</h2>
        <ul class="thinking-list">
          <li>
            <a href="https://vocus.cc/article/694794d7fd897800019af738" target="_blank">
              <span class="thinking-title">我堅持十年的事</span>
              <span class="thinking-category">隨機存取</span>
            </a>
          </li>
          <li>
            <a href="https://vocus.cc/article/68a72c83fd89780001b793d8" target="_blank">
              <span class="thinking-title">如何建立 Gemini 自訂腳色：Gem</span>
              <span class="thinking-category">數位槓桿</span>
            </a>
          </li>
          <li>
            <a href="https://vocus.cc/article/6934d2c8fd897800019c4924" target="_blank">
              <span class="thinking-title">AI 搜尋時代的內容策略恆久之道</span>
              <span class="thinking-category">底層邏輯</span>
            </a>
          </li>
          <li>
            <a href="https://vocus.cc/article/692a71f2fd89780001ebb182" target="_blank">
              <span class="thinking-title">雙重歸屬：在兩種信仰中尋找靈性滋養</span>
              <span class="thinking-category">底層邏輯</span>
            </a>
          </li>
        </ul>
        
        <div class="explore-cta">
          <a href="https://vocus.cc/salon/abc1231qa" target="_blank">前往電光文辭 →</a>
        </div>
      </section>
      
    </div>
    
    <!-- ==================== FOOTER ==================== -->
    <footer class="footer">
      © 2026 · <a href="/${ADMIN_PATH}" class="secret-link">◯</a>
    </footer>
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
      
      <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
        <a href="/" class="back-home" style="margin: 0;">← 返回首頁</a>
        <button onclick="handleLogout()" class="del-btn" style="width: auto; padding: 8px 20px; margin: 0;">登出</button>
      </div>
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
        const keyInput = document.getElementById('newKey');
        const valInput = document.getElementById('newVal');
        
        const reqKey = action === 'add' ? keyInput.value.trim() : key;
        const reqVal = action === 'add' ? valInput.value.trim() : '';

        if(action === 'add' && (!reqKey || !reqVal)) { alert('短碼與網址都不能為空'); return; }

        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = '處理中...';
        btn.disabled = true;

        try {
          const res = await fetch('/api/manage', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, key: reqKey, value: reqVal }) 
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
            const errorData = await res.json();
            if (res.status === 401) {
              // Session 過期，重新導向到登入頁面
              alert('登入已過期，請重新登入');
              window.location.reload();
            } else {
              alert(errorData.error || '操作失敗');
            }
          }
        } catch (err) {
          alert('連線發生錯誤');
        } finally {
          btn.innerText = originalText;
          btn.disabled = false;
        }
      }

      async function handleLogout() {
        if (!confirm('確定要登出嗎？')) return;
        
        try {
          await fetch('/api/logout', { method: 'POST' });
          window.location.href = '/';
        } catch (err) {
          alert('登出失敗');
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

// ==========================================
// 新增頁面 HTML 生成函數
// ==========================================

/**
 * 產生 About 頁面
 */
function generateAboutHTML() {
  return `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>關於我 | abc1231qa</title>
    <meta name="description" content="技術架構師、內容創作者、長期主義實踐者。探索程式碼與詩句之間的平衡。">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@300;400;500&display=swap" rel="stylesheet">
    ${getCommonStyles()}
  </head>
  <body>
    <nav class="nav">
      <a href="/" class="nav-logo">靜觀</a>
      <div class="nav-links">
        <a href="/about" class="active">關於</a>
        <a href="/works">作品</a>
        <a href="/blog">文章</a>
      </div>
    </nav>
    
    <main class="page-content">
      <header class="page-header">
        <h1>關於我</h1>
        <p class="page-subtitle">ABOUT</p>
      </header>
      
      <section class="about-section">
        <h2>我是誰</h2>
        <p>
          一個在技術與人文之間游走的實踐者。<br>
          白天寫程式，晚上寫文章，週末練跳躍。
        </p>
        <p>
          相信<strong>技術是工具，人文是目的</strong>。<br>
          在代碼與詩句之間，尋找生命的平衡點。
        </p>
      </section>
      
      <div class="divider"></div>
      
      <section class="about-section">
        <h2>我在做什麼</h2>
        <div class="skill-grid">
          <div class="skill-item">
            <span class="skill-icon">🤖</span>
            <h3>AI 應用開發</h3>
            <p>Gemini API、NotebookLM、Telegram Bot 整合與自動化</p>
          </div>
          <div class="skill-item">
            <span class="skill-icon">📊</span>
            <h3>數據系統</h3>
            <p>NBA 戰績表、API 整合、Python 自動化腳本</p>
          </div>
          <div class="skill-item">
            <span class="skill-icon">✍️</span>
            <h3>內容創作</h3>
            <p>技術教學、文化思考、旅行記錄</p>
          </div>
          <div class="skill-item">
            <span class="skill-icon">🏃</span>
            <h3>身體實踐</h3>
            <p>跳躍訓練、中醫養生、純素飲食</p>
          </div>
        </div>
      </section>
      
      <div class="divider"></div>
      
      <section class="about-section">
        <h2>技術棧</h2>
        <div class="tech-tags">
          <span class="tag">Cloudflare Workers</span>
          <span class="tag">R2</span>
          <span class="tag">Python</span>
          <span class="tag">JavaScript</span>
          <span class="tag">Gemini API</span>
          <span class="tag">Telegram Bot</span>
          <span class="tag">NBA Stats API</span>
        </div>
      </section>
      
      <div class="divider"></div>
      
      <section class="about-section">
        <h2>核心理念</h2>
        <blockquote>
          「技術同構」— 用技術結構解釋人文概念，用人文視角審視技術決策。
        </blockquote>
        <blockquote>
          「長期主義」— 選擇無聊但穩定的技術，將精力留給更有價值的創作。
        </blockquote>
      </section>
      
      <div class="cta-section">
        <a href="https://vocus.cc/salon/abc1231qa" target="_blank" class="cta-button">閱讀我的文章 →</a>
      </div>
    </main>
    
    <footer class="footer">
      <a href="/">← 返回首頁</a>
    </footer>
  </body>
  </html>
  `;
}

/**
 * 產生 Works 頁面
 */
function generateWorksHTML() {
  return `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>作品集 | abc1231qa</title>
    <meta name="description" content="技術專案與寫作成果展示。包含 NBA 戰績系統、Telegram Bot、Cloudflare Workers 等專案。">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@300;400;500&display=swap" rel="stylesheet">
    ${getCommonStyles()}
  </head>
  <body>
    <nav class="nav">
      <a href="/" class="nav-logo">靜觀</a>
      <div class="nav-links">
        <a href="/about">關於</a>
        <a href="/works" class="active">作品</a>
        <a href="/blog">文章</a>
      </div>
    </nav>
    
    <main class="page-content">
      <header class="page-header">
        <h1>作品集</h1>
        <p class="page-subtitle">WORKS</p>
      </header>
      
      <section class="works-section">
        <h2>技術專案</h2>
        <div class="works-list">
          <article class="work-item">
            <div class="work-icon">📊</div>
            <div class="work-content">
              <h3>NBA 戰績表系統</h3>
              <p>從 NBA API 抓取即時數據，透過 Python 處理後生成視覺化戰績表，最終透過 Telegram Bot 自動發送。完整的數據流水線實作。</p>
              <div class="work-tags">
                <span>Python</span>
                <span>NBA API</span>
                <span>Telegram Bot</span>
              </div>
              <a href="https://vocus.cc/article/691d160ffd89780001ad48ad" target="_blank" class="work-link">查看文章 →</a>
            </div>
          </article>
          
          <article class="work-item">
            <div class="work-icon">🤖</div>
            <div class="work-content">
              <h3>Telegram Bot 本機服務化</h3>
              <p>免費仔的自動化解決方案。透過 Ngrok 穿透實現本機 Bot 服務，配合 NSSM 做成 Windows Service，開機自動啟動。</p>
              <div class="work-tags">
                <span>Telegram</span>
                <span>Ngrok</span>
                <span>Windows Service</span>
              </div>
              <a href="https://vocus.cc/post/68ede6aefd8978000148bf19" target="_blank" class="work-link">查看文章 →</a>
            </div>
          </article>
          
          <article class="work-item">
            <div class="work-icon">🌿</div>
            <div class="work-content">
              <h3>abc1231qa.cc 數位花園</h3>
              <p>你正在看的這個網站。使用 Cloudflare Workers + R2 打造，零依賴、極簡維護。體現「少即是多」的系統設計哲學。</p>
              <div class="work-tags">
                <span>Cloudflare Workers</span>
                <span>R2</span>
                <span>Serverless</span>
              </div>
              <a href="https://github.com/abc1231qas/abc1231qa.publink" target="_blank" class="work-link">查看 Github →</a>
            </div>
          </article>
        </div>
      </section>
      
      <div class="divider"></div>
      
      <section class="works-section">
        <h2>精選寫作</h2>
        <div class="writing-categories">
          <div class="writing-category">
            <h3>📡 數位槓桿</h3>
            <ul>
              <li><a href="https://vocus.cc/article/68a72c83fd89780001b793d8" target="_blank">如何建立 Gemini 自訂腳色：Gem</a></li>
              <li><a href="https://vocus.cc/article/6780cd1cfd897800017f7eca" target="_blank">4 招解鎖 NotebookLM 簡報的隱藏潛能</a></li>
              <li><a href="https://vocus.cc/article/679ba70afd89780001a6d3af" target="_blank">如何寫提示詞的提示詞</a></li>
            </ul>
          </div>
          <div class="writing-category">
            <h3>🧠 底層邏輯</h3>
            <ul>
              <li><a href="https://vocus.cc/article/694794d7fd897800019af738" target="_blank">我堅持十年的事</a></li>
              <li><a href="https://vocus.cc/article/6934d2c8fd897800019c4924" target="_blank">AI 搜尋時代的內容策略恆久之道</a></li>
              <li><a href="https://vocus.cc/article/692a71f2fd89780001ebb182" target="_blank">雙重歸屬：在兩種信仰中尋找靈性滋養</a></li>
            </ul>
          </div>
        </div>
      </section>
    </main>
    
    <footer class="footer">
      <a href="/">← 返回首頁</a>
    </footer>
  </body>
  </html>
  `;
}

/**
 * 產生 Blog 頁面
 */
function generateBlogHTML() {
  return `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>文章索引 | abc1231qa</title>
    <meta name="description" content="電光文辭 neon prose - 文章分類索引。數位槓桿、底層邏輯、肉身重構、隨機存取。">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@300;400;500&display=swap" rel="stylesheet">
    ${getCommonStyles()}
  </head>
  <body>
    <nav class="nav">
      <a href="/" class="nav-logo">靜觀</a>
      <div class="nav-links">
        <a href="/about">關於</a>
        <a href="/works">作品</a>
        <a href="/blog" class="active">文章</a>
      </div>
    </nav>
    
    <main class="page-content">
      <header class="page-header">
        <h1>文章索引</h1>
        <p class="page-subtitle">BLOG</p>
        <p class="blog-intro">我的文章發布在 <a href="https://vocus.cc/salon/abc1231qa" target="_blank">電光文辭 neon prose</a>，以下是分類導覽。</p>
      </header>
      
      <section class="blog-categories">
        <article class="category-card">
          <div class="category-header">
            <span class="category-icon">📡</span>
            <h2>數位槓桿</h2>
          </div>
          <p class="category-desc">AI 工具、技術教學、生產力提升</p>
          <ul class="article-list">
            <li><a href="https://vocus.cc/article/68a72c83fd89780001b793d8" target="_blank">如何建立 Gemini 自訂腳色：Gem</a></li>
            <li><a href="https://vocus.cc/article/6780cd1cfd897800017f7eca" target="_blank">4 招解鎖 NotebookLM 簡報的隱藏潛能</a></li>
            <li><a href="https://vocus.cc/article/679ba70afd89780001a6d3af" target="_blank">如何寫提示詞的提示詞</a></li>
            <li><a href="https://vocus.cc/article/691d160ffd89780001ad48ad" target="_blank">NBA 戰績表系統</a></li>
            <li><a href="https://vocus.cc/post/68ede6aefd8978000148bf19" target="_blank">Telegram Bot 服務化</a></li>
          </ul>
          <a href="https://vocus.cc/salon/abc1231qa/room/digital-leverage" target="_blank" class="category-link">查看全部 →</a>
        </article>
        
        <article class="category-card">
          <div class="category-header">
            <span class="category-icon">🧠</span>
            <h2>底層邏輯</h2>
          </div>
          <p class="category-desc">思想、文化、信仰、認同</p>
          <ul class="article-list">
            <li><a href="https://vocus.cc/article/694794d7fd897800019af738" target="_blank">我堅持十年的事</a></li>
            <li><a href="https://vocus.cc/article/6934d2c8fd897800019c4924" target="_blank">AI 搜尋時代的內容策略恆久之道</a></li>
            <li><a href="https://vocus.cc/article/692a71f2fd89780001ebb182" target="_blank">雙重歸屬：在兩種信仰中尋找靈性滋養</a></li>
            <li><a href="https://vocus.cc/article/6784e6b2fd8978000181d424" target="_blank">不是終國人</a></li>
          </ul>
          <a href="https://vocus.cc/salon/abc1231qa/room/underlying-logic" target="_blank" class="category-link">查看全部 →</a>
        </article>
        
        <article class="category-card">
          <div class="category-header">
            <span class="category-icon">💪</span>
            <h2>肉身重構</h2>
          </div>
          <p class="category-desc">健康、運動、飲食</p>
          <ul class="article-list">
            <li><a href="https://vocus.cc/article/6793de07fd8978000193c2e9" target="_blank">跳躍訓練心得</a></li>
            <li><a href="https://vocus.cc/article/678d65c3fd897800010e4e90" target="_blank">從咖啡成癮到腎精飽滿</a></li>
          </ul>
          <a href="https://vocus.cc/salon/abc1231qa/room/body-reconstruction" target="_blank" class="category-link">查看全部 →</a>
        </article>
        
        <article class="category-card">
          <div class="category-header">
            <span class="category-icon">🎲</span>
            <h2>隨機存取</h2>
          </div>
          <p class="category-desc">旅行、生活、遊戲</p>
          <ul class="article-list">
            <li><a href="https://vocus.cc/article/67a5c30cfd89780001d8b50b" target="_blank">冬日長野．輕井澤</a></li>
            <li><a href="https://vocus.cc/article/6797d85afd897800019d2e61" target="_blank">超過十年藍軍路：Ingress 生活</a></li>
          </ul>
          <a href="https://vocus.cc/salon/abc1231qa/room/random-access" target="_blank" class="category-link">查看全部 →</a>
        </article>
      </section>
      
      <div class="cta-section">
        <a href="https://vocus.cc/salon/abc1231qa" target="_blank" class="cta-button">前往電光文辭 →</a>
      </div>
    </main>
    
    <footer class="footer">
      <a href="/">← 返回首頁</a>
    </footer>
  </body>
  </html>
  `;
}

/**
 * 共用樣式
 */
function getCommonStyles() {
  return `
  <style>
    :root {
      --bg-rice: #F7F7F5;
      --ink-black: #2C2C2C;
      --text-deep: #333333;
      --text-mid: #595959;
      --text-light: #888888;
      --gold-muted: #C5A065;
      --gold-light: rgba(197, 160, 101, 0.15);
      --border-subtle: rgba(44, 44, 44, 0.15);
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Noto Serif TC', 'PMingLiU', serif;
      background: var(--bg-rice);
      color: var(--text-mid);
      line-height: 1.8;
      min-height: 100vh;
    }
    
    /* Navigation */
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 40px;
      border-bottom: 1px solid var(--border-subtle);
    }
    
    .nav-logo {
      font-size: 1.2rem;
      color: var(--text-deep);
      text-decoration: none;
      letter-spacing: 0.1em;
    }
    
    .nav-links {
      display: flex;
      gap: 30px;
    }
    
    .nav-links a {
      color: var(--text-mid);
      text-decoration: none;
      font-size: 0.9rem;
      letter-spacing: 0.05em;
      padding-bottom: 4px;
      border-bottom: 1px solid transparent;
      transition: all 0.3s ease;
    }
    
    .nav-links a:hover,
    .nav-links a.active {
      color: var(--gold-muted);
      border-bottom-color: var(--gold-muted);
    }
    
    /* Page Content */
    .page-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 60px 20px 80px;
    }
    
    .page-header {
      text-align: center;
      margin-bottom: 60px;
    }
    
    .page-header h1 {
      font-size: 2.2rem;
      font-weight: 300;
      color: var(--text-deep);
      letter-spacing: 0.15em;
      margin-bottom: 15px;
    }
    
    .page-subtitle {
      font-size: 0.9rem;
      color: var(--text-light);
      letter-spacing: 0.3em;
    }
    
    .blog-intro {
      margin-top: 30px;
      font-size: 0.95rem;
      color: var(--text-mid);
    }
    
    .blog-intro a {
      color: var(--gold-muted);
    }
    
    /* Divider */
    .divider {
      width: 60px;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--gold-muted), transparent);
      margin: 50px auto;
    }
    
    /* About Sections */
    .about-section {
      margin-bottom: 40px;
    }
    
    .about-section h2 {
      font-size: 1.1rem;
      font-weight: 400;
      color: var(--text-deep);
      letter-spacing: 0.1em;
      margin-bottom: 20px;
    }
    
    .about-section p {
      margin-bottom: 15px;
    }
    
    .about-section strong {
      color: var(--gold-muted);
    }
    
    /* Skill Grid */
    .skill-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    
    .skill-item {
      background: rgba(255, 255, 255, 0.5);
      border: 1px solid var(--border-subtle);
      padding: 24px;
    }
    
    .skill-icon {
      font-size: 1.5rem;
      display: block;
      margin-bottom: 12px;
    }
    
    .skill-item h3 {
      font-size: 0.95rem;
      font-weight: 400;
      color: var(--text-deep);
      margin-bottom: 8px;
    }
    
    .skill-item p {
      font-size: 0.85rem;
      color: var(--text-light);
      margin: 0;
    }
    
    /* Tech Tags */
    .tech-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .tag {
      padding: 6px 14px;
      font-size: 0.85rem;
      color: var(--text-mid);
      border: 1px solid var(--border-subtle);
      letter-spacing: 0.02em;
    }
    
    /* Blockquote */
    blockquote {
      padding: 20px 24px;
      margin-bottom: 20px;
      background: rgba(255, 255, 255, 0.5);
      border-left: 3px solid var(--gold-muted);
      font-style: italic;
      color: var(--text-deep);
    }
    
    /* CTA */
    .cta-section {
      text-align: center;
      margin-top: 60px;
    }
    
    .cta-button {
      display: inline-block;
      padding: 14px 40px;
      color: var(--text-deep);
      text-decoration: none;
      border: 1px solid var(--border-subtle);
      font-size: 0.9rem;
      letter-spacing: 0.1em;
      transition: all 0.4s ease;
    }
    
    .cta-button:hover {
      border-color: var(--gold-muted);
      background: var(--gold-light);
    }
    
    /* Works Section */
    .works-section {
      margin-bottom: 40px;
    }
    
    .works-section h2 {
      font-size: 1.1rem;
      font-weight: 400;
      color: var(--text-deep);
      letter-spacing: 0.1em;
      margin-bottom: 30px;
    }
    
    .works-list {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    
    .work-item {
      display: flex;
      gap: 24px;
      padding: 24px;
      background: rgba(255, 255, 255, 0.5);
      border: 1px solid var(--border-subtle);
      transition: all 0.3s ease;
    }
    
    .work-item:hover {
      border-color: var(--gold-muted);
    }
    
    .work-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }
    
    .work-content h3 {
      font-size: 1rem;
      font-weight: 400;
      color: var(--text-deep);
      margin-bottom: 10px;
    }
    
    .work-content p {
      font-size: 0.9rem;
      color: var(--text-mid);
      margin-bottom: 15px;
    }
    
    .work-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 15px;
    }
    
    .work-tags span {
      padding: 4px 10px;
      font-size: 0.75rem;
      color: var(--text-light);
      border: 1px solid var(--border-subtle);
    }
    
    .work-link {
      color: var(--gold-muted);
      text-decoration: none;
      font-size: 0.85rem;
    }
    
    .work-link:hover {
      text-decoration: underline;
    }
    
    /* Writing Categories */
    .writing-categories {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    
    .writing-category h3 {
      font-size: 0.95rem;
      font-weight: 400;
      color: var(--text-deep);
      margin-bottom: 15px;
    }
    
    .writing-category ul {
      list-style: none;
    }
    
    .writing-category li {
      margin-bottom: 10px;
    }
    
    .writing-category a {
      color: var(--text-mid);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }
    
    .writing-category a:hover {
      color: var(--gold-muted);
    }
    
    /* Blog Categories */
    .blog-categories {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    
    .category-card {
      background: rgba(255, 255, 255, 0.5);
      border: 1px solid var(--border-subtle);
      padding: 28px;
      transition: all 0.3s ease;
    }
    
    .category-card:hover {
      border-color: var(--gold-muted);
    }
    
    .category-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .category-icon {
      font-size: 1.3rem;
    }
    
    .category-header h2 {
      font-size: 1rem;
      font-weight: 400;
      color: var(--text-deep);
    }
    
    .category-desc {
      font-size: 0.85rem;
      color: var(--text-light);
      margin-bottom: 20px;
    }
    
    .article-list {
      list-style: none;
      margin-bottom: 20px;
    }
    
    .article-list li {
      margin-bottom: 10px;
      padding-left: 14px;
      position: relative;
    }
    
    .article-list li::before {
      content: '·';
      position: absolute;
      left: 0;
      color: var(--gold-muted);
    }
    
    .article-list a {
      color: var(--text-mid);
      text-decoration: none;
      font-size: 0.88rem;
      transition: color 0.3s ease;
    }
    
    .article-list a:hover {
      color: var(--gold-muted);
    }
    
    .category-link {
      color: var(--gold-muted);
      text-decoration: none;
      font-size: 0.85rem;
    }
    
    .category-link:hover {
      text-decoration: underline;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding: 40px 20px 60px;
      border-top: 1px solid var(--border-subtle);
    }
    
    .footer a {
      color: var(--text-light);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }
    
    .footer a:hover {
      color: var(--gold-muted);
    }
    
    /* Responsive */
    @media (max-width: 640px) {
      .nav {
        padding: 15px 20px;
      }
      
      .nav-links {
        gap: 20px;
      }
      
      .skill-grid,
      .writing-categories,
      .blog-categories {
        grid-template-columns: 1fr;
      }
      
      .work-item {
        flex-direction: column;
      }
      
      .work-icon {
        font-size: 1.5rem;
      }
    }
  </style>
  `;
}