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
    <title>關於我 | Personal Profile</title>
    <style>
      :root { --primary: #2d3436; --accent: #0984e3; --bg: #dfe6e9; }
      body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
      .card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%; transition: transform 0.3s; }
      .card:hover { transform: translateY(-5px); }
      .avatar { width: 120px; height: 120px; background: #b2bec3; border-radius: 50%; margin: 0 auto 20px; object-fit: cover; }
      h1 { margin: 0; color: var(--primary); font-size: 1.8rem; }
      p { color: #636e72; line-height: 1.6; margin-top: 10px; }
      .links { margin-top: 30px; display: flex; flex-direction: column; gap: 10px; }
      .btn { display: block; padding: 12px; background: var(--primary); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; transition: 0.2s; }
      .btn:hover { background: var(--accent); }
      .footer { margin-top: 30px; font-size: 0.8rem; color: #b2bec3; }
      /* 隱藏的入口樣式 */
      .secret-link { color: inherit; text-decoration: none; cursor: default; }
    </style>
  </head>
  <body>
    <div class="card">
      <img src="https://ui-avatars.com/api/?name=Me&background=random&size=256" alt="Avatar" class="avatar">
      
      <h1>Hello, I'm Developer</h1>
      <p>這裡是用來寫自我介紹的地方。全端開發者 / 技術愛好者 / 旅遊達人。<br>目前網站建置中。</p>
      
      <div class="links">
        <a href="#" class="btn">Github</a>
        <a href="#" class="btn">Email Me</a>
        <a href="/blog" class="btn" style="background: white; color: #333; border: 1px solid #ddd;">My Blog</a>
      </div>

      <div class="footer">
        &copy; 2026 Personal Site. <a href="/${ADMIN_PATH}" class="secret-link">π</a>
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
    <div style="font-family:sans-serif; text-align:center; padding:50px;">
      <h1>404 Not Found</h1>
      <p>哎呀，這裡什麼都沒有。</p>
      <a href="/" style="color:#0984e3;">回到首頁</a>
    </div>
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