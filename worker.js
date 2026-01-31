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
      
      /* ==================== 水墨圓圈裝飾 (Enso) ==================== */
      .enso {
        width: 180px;
        height: 180px;
        margin: 0 auto 80px;
        position: relative;
        opacity: 0;
        animation: fadeIn 1.2s ease-out 0.3s forwards;
      }
      
      .enso::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 3px solid var(--ink-black);
        border-radius: 50%;
        opacity: 0.85;
        transform: rotate(-15deg);
        border-top-color: transparent;
        border-right-color: transparent;
      }
      
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
        box-shadow: 0 0 20px var(--gold-muted);
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
 * 產生管理後台 HTML (原本的 generateHTML 改名而來)
 */
function generateAdminHTML() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>系統後台</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f4f7f6; padding: 20px; }
      .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      h2 { text-align: center; color: #333; }
      input { padding: 12px; margin: 8px 0; width: 100%; box-sizing: border-box; border: 1px solid #ddd; border-radius: 6px; }
      button { padding: 12px; background: #0070f3; color: white; border: none; cursor: pointer; width: 100%; border-radius: 6px; font-weight: bold; transition: 0.2s; }
      button:hover { background: #0051a2; }
      button:disabled { background: #ccc; cursor: not-allowed; }
      .list-container { margin-top: 20px; }
      .list-item { display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #eee; align-items: center; background: #fff; }
      .list-item:last-child { border-bottom: none; }
      .list-info { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%; }
      .del-btn { background: #ff4d4f; width: auto; padding: 6px 12px; font-size: 14px; margin-left: 10px; }
      .del-btn:hover { background: #d9363e; }
      a { color: #0070f3; text-decoration: none; }
      a:hover { text-decoration: underline; }
      .back-home { display:block; text-align:center; margin-top:20px; color:#999; font-size:0.9rem; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>🔗 縮網址管理 (Private)</h2>
      <input type="password" id="pw" placeholder="請輸入管理密碼">
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <h4 style="margin-top:0;">新增縮網址</h4>
        <input type="text" id="newKey" placeholder="短碼 (例如: fb)">
        <input type="text" id="newVal" placeholder="目標網址 (https://...)">
        <button onclick="manage('add')">➕ 新增連結</button>
      </div>

      <h4 style="margin-bottom: 10px;">目前清單</h4>
      <div id="list" class="list-container">載入中...</div>
      
      <a href="/" class="back-home">← 回到個人首頁</a>
    </div>

    <script>
      function createItemHTML(key, value) {
        return \`
          <div class="list-item" id="item-\${key}">
            <div class="list-info">
              <b style="color:#333;">/\${key}</b> 
              <span style="color:#999; margin: 0 5px;">→</span> 
              <a href="\${value}" target="_blank">\${value}</a>
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
            listDiv.innerHTML = '<div style="padding:15px; text-align:center; color:#888;">目前沒有任何縮網址</div>';
            return;
          }
          listDiv.innerHTML = data.map(item => createItemHTML(item.key, item.value)).join('');
        } catch (e) {
          listDiv.innerHTML = '<div style="color:red; text-align:center;">載入失敗，請檢查網路</div>';
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