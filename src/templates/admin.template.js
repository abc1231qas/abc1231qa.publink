/**
 * 產生登入頁面 (Login Page)
 */
export function generateLoginHTML() {
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
 * 產生管理後台 HTML (Zen 美學風格)
 */
export function generateAdminHTML(ADMIN_PATH) {
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
        max-width: 800px;
        width: 100%;
        opacity: 0;
        animation: fadeIn 0.8s ease-out 0.2s forwards;
      }
      
      /* ==================== 標題區 ==================== */
      .page-title {
        text-align: center;
        margin-bottom: 40px;
      }
      
      h1 {
        font-size: 2.2rem;
        font-weight: 300;
        color: var(--text-deep);
        letter-spacing: 0.2em;
        margin-bottom: 8px;
      }
      
      .subtitle {
        font-size: 0.9rem;
        color: var(--text-mid);
        letter-spacing: 0.3em;
        opacity: 0.6;
        font-weight: 300;
      }
      
      /* ==================== 統計面板 ==================== */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .stat-card {
        background: rgba(255, 255, 255, 0.4);
        border: 1px solid var(--border-subtle);
        padding: 20px;
        text-align: center;
      }
      
      .stat-val {
        display: block;
        font-size: 1.5rem;
        color: var(--gold-muted);
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 0.8rem;
        letter-spacing: 0.1em;
        color: var(--text-light);
      }
      
      /* ==================== 金色分隔線 ==================== */
      .divider {
        width: 60px;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--gold-muted), transparent);
        margin: 30px auto;
      }
      
      /* ==================== 表單與卡片區 ==================== */
      .content-card {
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid var(--border-subtle);
        padding: 30px;
        margin-bottom: 30px;
      }
      
      .card-title {
        font-size: 1.1rem;
        font-weight: 400;
        color: var(--text-deep);
        letter-spacing: 0.1em;
        margin-bottom: 25px;
        text-align: center;
      }
      
      /* ==================== 輸入與按鈕 ==================== */
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
      
      .action-btn {
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
        transition: all 0.4s ease;
        position: relative;
        overflow: hidden;
      }
      
      .action-btn:hover {
        border-color: var(--gold-muted);
        background: var(--gold-light);
      }
      
      /* ==================== 列表區 ==================== */
      .search-box {
        margin-bottom: 20px;
      }
      
      .list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 0;
        border-bottom: 1px solid var(--border-subtle);
      }
      
      .list-item:hover {
        background: var(--gold-light);
        padding-left: 10px;
        padding-right: 10px;
      }
      
      .list-info {
        flex: 1;
        overflow: hidden;
        margin-right: 15px;
      }
      
      .short-code {
        color: var(--text-deep);
        font-weight: 400;
        cursor: pointer;
      }
      
      .short-code:hover {
        color: var(--gold-muted);
        text-decoration: underline;
      }
      
      .target-url {
        font-size: 0.85rem;
        color: var(--text-mid);
        text-decoration: none;
        display: block;
        opacity: 0.7;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .item-stats {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      
      .click-badge {
        font-size: 0.8rem;
        color: var(--gold-muted);
        background: rgba(197, 160, 101, 0.1);
        padding: 2px 10px;
        border-radius: 10px;
      }
      
      .del-btn {
        padding: 6px 16px;
        font-size: 0.8rem;
        border: 1px solid rgba(44, 44, 44, 0.1);
        background: transparent;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .del-btn:hover {
        border-color: var(--gold-muted);
        color: var(--gold-muted);
      }
      
      /* ==================== Toasts ==================== */
      .toast {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: var(--ink-black);
        color: white;
        padding: 12px 30px;
        font-size: 0.9rem;
        letter-spacing: 0.1em;
        transition: transform 0.4s ease;
        z-index: 1000;
      }
      
      .toast.show {
        transform: translateX(-50%) translateY(0);
      }
      
      /* ==================== Responsive ==================== */
      @media (max-width: 640px) {
        .stats-grid { grid-template-columns: 1fr; gap: 10px; }
        .list-item { flex-direction: column; align-items: flex-start; gap: 10px; }
        .item-stats { width: 100%; justify-content: space-between; }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  </head>
  <body>
    <div class="zen-container">
      <div class="page-title">
        <h1>管理後台</h1>
        <div class="subtitle">ADMIN DASHBOARD</div>
      </div>
      
      <!-- 統計面板 -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-val" id="totalUrls">0</span>
          <span class="stat-label">連結總數</span>
        </div>
        <div class="stat-card">
          <span class="stat-val" id="totalClicks">0</span>
          <span class="stat-label">點擊總量</span>
        </div>
        <div class="stat-card">
          <span class="stat-val" id="avgClicks">0</span>
          <span class="stat-label">平均點擊</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <!-- 新增連結 -->
      <div class="content-card">
        <div class="card-title">新增縮網址</div>
        <input type="text" id="newKey" placeholder="短碼 (例如: personal-blog)">
        <input type="text" id="newVal" placeholder="目標網址 (https://...)">
        <button class="action-btn" onclick="manage('add')">建立連結</button>
      </div>
      
      <!-- 連結清單 -->
      <div class="content-card">
        <div class="card-title">連結清單</div>
        <div class="search-box">
          <input type="text" id="searchTerm" placeholder="搜尋短碼或 URL..." onkeyup="filterList()">
        </div>
        <div id="list">
          <div style="text-align: center; padding: 20px; color: var(--text-light);">載入中...</div>
        </div>
      </div>
      
      <div style="display: flex; gap: 15px; justify-content: center;">
        <a href="/" style="color: var(--text-light); text-decoration: none; font-size: 0.9rem;">← 首頁</a>
        <span style="color: var(--border-subtle);">|</span>
        <a href="javascript:handleLogout()" style="color: var(--text-light); text-decoration: none; font-size: 0.9rem;">登出</a>
      </div>
    </div>
    
    <div id="toast" class="toast">已複製</div>

    <script>
      let allItems = [];

      function showToast(msg) {
        const t = document.getElementById('toast');
        t.innerText = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
      }

      function copyText(key) {
        const url = window.location.origin + '/' + key;
        navigator.clipboard.writeText(url).then(() => {
          showToast('連結已複製: ' + key);
        });
      }

      async function refresh() {
        // Load Global Stats
        try {
          const sRes = await fetch('/api/stats');
          const sData = await sRes.json();
          document.getElementById('totalUrls').innerText = sData.totalUrls;
          document.getElementById('totalClicks').innerText = sData.totalClicks;
          document.getElementById('avgClicks').innerText = sData.avgClicksPerUrl;
        } catch(e) {}

        // Load List
        try {
          const lRes = await fetch('/api/list');
          allItems = await lRes.json();
          renderList(allItems);
        } catch(e) {}
      }

      function renderList(items) {
        const container = document.getElementById('list');
        if (items.length === 0) {
          container.innerHTML = '<div style="text-align:center; padding: 20px; opacity:0.5;">目前沒有連結</div>';
          return;
        }
        container.innerHTML = items.map(item => \`
          <div class="list-item" data-key="\${item.key}" data-val="\${item.value}">
            <div class="list-info">
              <span class="short-code" onclick="copyText('\${item.key}')">/\${item.key}</span>
              <a href="\${item.value}" target="_blank" class="target-url">\${item.value}</a>
            </div>
            <div class="item-stats">
              <span class="click-badge">👆 \${item.clicks || 0}</span>
              <button class="del-btn" onclick="manage('delete', '\${item.key}')">刪除</button>
            </div>
          </div>
        \`).join('');
      }

      function filterList() {
        const term = document.getElementById('searchTerm').value.toLowerCase();
        const filtered = allItems.filter(i => i.key.toLowerCase().includes(term) || i.value.toLowerCase().includes(term));
        renderList(filtered);
      }

      async function manage(action, key) {
        const kIn = document.getElementById('newKey');
        const vIn = document.getElementById('newVal');
        const reqKey = action === 'add' ? kIn.value.trim() : key;
        const reqVal = action === 'add' ? vIn.value.trim() : '';

        if(action === 'add' && (!reqKey || !reqVal)) return alert('必填格式不全');
        if(action === 'delete' && !confirm('確定要刪除嗎？')) return;

        try {
          const res = await fetch('/api/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, key: reqKey, value: reqVal })
          });
          const data = await res.json();
          if (res.ok) {
            showToast(data.message);
            if(action === 'add') { kIn.value = ''; vIn.value = ''; }
            refresh();
          } else {
            alert(data.error || '操作失敗');
          }
        } catch(e) { alert('伺服器連線異常'); }
      }

      async function handleLogout() {
        if (!confirm('確定要登出嗎？')) return;
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
      }

      refresh();
    </script>
  </body>
  </html>
  `;
}
