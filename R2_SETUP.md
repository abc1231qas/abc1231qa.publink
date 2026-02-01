# Cloudflare R2 串接指南

## 📋 前置準備檢查清單

- [x] 已建立 R2 Bucket
- [ ] 知道 Bucket 名稱
- [ ] 已安裝 Wrangler CLI
- [ ] 已登入 Cloudflare 帳號

---

## 🚀 步驟一：更新 `wrangler.toml` 設定檔

### 1. 添加 R2 綁定

在您的 `wrangler.toml` 檔案中添加 R2 bucket 綁定：

```toml
name = "me"
main = "worker.js"
compatibility_date = "2024-01-01"

# KV 命名空間綁定
kv_namespaces = [
  { binding = "SHORT_URLS", id = "aa440a6f6b1c44d6986b94911229f851" }
]

# ⭐ R2 儲存桶綁定（新增這段）
[[r2_buckets]]
binding = "MY_IMAGES"           # 在 Worker 中使用的變數名稱
bucket_name = "YOUR_BUCKET_NAME" # 替換成您的實際 Bucket 名稱
```

### 2. 替換 Bucket 名稱

請將 `YOUR_BUCKET_NAME` 替換成您在 Cloudflare Dashboard 中建立的實際 Bucket 名稱。

**範例：**
```toml
[[r2_buckets]]
binding = "MY_IMAGES"
bucket_name = "my-website-images"  # 您的實際名稱
```

---

## 📤 步驟二：上傳圖片到 R2

### 方法 A：使用 Wrangler CLI（推薦）

```powershell
# 上傳單一檔案
wrangler r2 object put YOUR_BUCKET_NAME/logo.png --file=./logo.png

# 上傳到子資料夾
wrangler r2 object put YOUR_BUCKET_NAME/images/avatar.jpg --file=./avatar.jpg

# 列出所有檔案
wrangler r2 object list YOUR_BUCKET_NAME
```

### 方法 B：使用 Cloudflare Dashboard

1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 點擊左側選單的 **R2**
3. 選擇您的 Bucket
4. 點擊 **Upload** 按鈕
5. 選擇檔案並上傳

### 方法 C：使用 Worker 上傳（進階）

稍後會在 Worker 中實作上傳功能。

---

## 💻 步驟三：更新 `worker.js` 程式碼

### 1. 基礎圖片讀取功能

在您的 `worker.js` 中添加圖片路由處理：

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/|\/$/g, "");

    // ==========================================
    // 🖼️ 圖片路由處理（新增）
    // ==========================================
    
    // 處理圖片請求：/images/xxx.png
    if (url.pathname.startsWith('/images/')) {
      return handleImageRequest(url, env);
    }

    // ... 其他現有路由 ...
    
    // 根目錄
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

    // 縮網址轉址
    const targetUrl = await env.SHORT_URLS.get(path);
    if (targetUrl) {
      return Response.redirect(targetUrl, 301);
    }

    // 404
    return new Response(generate404HTML(), {
      status: 404,
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
};

// ==========================================
// 🖼️ 圖片處理函數（新增）
// ==========================================

/**
 * 處理圖片請求
 * @param {URL} url - 請求的 URL
 * @param {Object} env - 環境變數（包含 R2 綁定）
 */
async function handleImageRequest(url, env) {
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
```

### 2. 在 HTML 中使用圖片

更新您的 `generateIntroHTML()` 函數來使用 R2 圖片：

```javascript
function generateIntroHTML() {
  return `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>靜 · 觀 | Contemplation</title>
    <!-- ... 其他 head 內容 ... -->
  </head>
  <body>
    <div class="zen-container">
      
      <!-- 使用 R2 圖片作為 Logo -->
      <img src="/images/logo.png" alt="Logo" style="width: 180px; height: 180px; margin: 0 auto 80px;">
      
      <!-- 或作為背景圖 -->
      <div style="
        background-image: url('/images/background.jpg');
        background-size: cover;
        background-position: center;
      ">
        <!-- 內容 -->
      </div>
      
      <!-- 原有的水墨圓圈（保留） -->
      <div class="enso"></div>
      
      <h1>靜觀</h1>
      <!-- ... 其他內容 ... -->
    </div>
  </body>
  </html>
  `;
}
```

---

## 🧪 步驟四：測試設定

### 1. 本地測試

```powershell
# 在專案目錄下執行
cd c:\Users\KHUser\abc1231qa.worker.dev

# 啟動本地開發伺服器
wrangler dev
```

### 2. 測試圖片存取

開啟瀏覽器，訪問：
- `http://localhost:8787/images/logo.png`
- 應該會看到您上傳的圖片

### 3. 檢查錯誤

如果出現錯誤，檢查：
- ✅ `wrangler.toml` 中的 bucket_name 是否正確
- ✅ 圖片檔案是否已上傳到 R2
- ✅ 圖片路徑是否正確（區分大小寫）

---

## 🚀 步驟五：部署到生產環境

### 1. 部署 Worker

```powershell
# 部署到 Cloudflare
wrangler deploy
```

### 2. 測試線上版本

訪問您的網域：
- `https://your-domain.com/images/logo.png`

---

## 🎨 進階功能

### 功能 1：動態調整圖片大小

```javascript
async function handleImageRequest(url, env) {
  const imagePath = url.pathname.replace('/images/', '');
  
  // 取得查詢參數
  const width = url.searchParams.get('width');
  const quality = url.searchParams.get('quality') || '85';
  
  const object = await env.MY_IMAGES.get(imagePath);
  if (!object) {
    return new Response('圖片不存在', { status: 404 });
  }
  
  // 如果有調整需求，使用 Cloudflare Image Resizing
  if (width) {
    const resizeOptions = [
      `width=${width}`,
      `quality=${quality}`,
      'format=auto'  // 自動選擇最佳格式（WebP/AVIF）
    ].join(',');
    
    const imageUrl = new URL(url);
    imageUrl.pathname = `/cdn-cgi/image/${resizeOptions}${url.pathname}`;
    
    return fetch(imageUrl.toString());
  }
  
  // 否則返回原圖
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=86400');
  
  return new Response(object.body, { headers });
}
```

使用方式：
```html
<!-- 原圖 -->
<img src="/images/photo.jpg" alt="原圖">

<!-- 調整為 300px 寬 -->
<img src="/images/photo.jpg?width=300" alt="縮圖">

<!-- 調整大小和品質 -->
<img src="/images/photo.jpg?width=500&quality=70" alt="優化圖">
```

### 功能 2：圖片上傳 API

```javascript
// 在 worker.js 中添加上傳路由
if (url.pathname === "/api/upload" && request.method === "POST") {
  return handleImageUpload(request, env);
}

async function handleImageUpload(request, env) {
  try {
    // 驗證密碼
    const formData = await request.formData();
    const password = formData.get('password');
    
    if (password !== ADMIN_PASSWORD) {
      return new Response('密碼錯誤', { status: 403 });
    }
    
    const file = formData.get('image');
    if (!file) {
      return new Response('未選擇檔案', { status: 400 });
    }
    
    // 驗證檔案類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return new Response('不支援的圖片格式', { status: 400 });
    }
    
    // 驗證檔案大小（5MB）
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return new Response('檔案過大（最大 5MB）', { status: 413 });
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
      fileName: fileName
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('上傳錯誤:', error);
    return new Response('上傳失敗', { status: 500 });
  }
}
```

### 功能 3：列出所有圖片

```javascript
// 列出所有圖片的 API
if (url.pathname === "/api/images" && request.method === "GET") {
  return handleListImages(env);
}

async function handleListImages(env) {
  try {
    const list = await env.MY_IMAGES.list();
    
    const images = list.objects.map(obj => ({
      name: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
      url: `/images/${obj.key}`
    }));
    
    return new Response(JSON.stringify(images), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('列表錯誤:', error);
    return new Response('取得列表失敗', { status: 500 });
  }
}
```

---

## 📊 檔案結構建議

建議在 R2 中使用以下資料夾結構：

```
YOUR_BUCKET_NAME/
├── logos/
│   ├── logo.png
│   └── favicon.ico
├── backgrounds/
│   ├── hero.jpg
│   └── pattern.png
├── avatars/
│   └── default.png
└── uploads/
    └── upload_1234567890.jpg
```

上傳時指定完整路徑：
```powershell
wrangler r2 object put YOUR_BUCKET_NAME/logos/logo.png --file=./logo.png
```

存取時：
```html
<img src="/images/logos/logo.png" alt="Logo">
```

---

## 🔧 常見問題排解

### Q1: 圖片顯示 404
**檢查：**
- R2 中的檔案路徑是否正確
- `wrangler.toml` 中的 bucket_name 是否正確
- Worker 是否已重新部署

### Q2: 圖片載入很慢
**解決：**
- 確認已設定 `Cache-Control` 標頭
- 使用 Cloudflare Image Resizing 壓縮圖片
- 考慮使用 WebP 格式

### Q3: CORS 錯誤
**解決：**
在 `handleImageRequest` 中添加：
```javascript
headers.set('Access-Control-Allow-Origin', '*');
```

### Q4: 本地開發無法存取 R2
**解決：**
確保已執行 `wrangler login` 並且有正確的權限。

---

## 📝 下一步

- [ ] 更新 `wrangler.toml` 添加 R2 綁定
- [ ] 上傳測試圖片到 R2
- [ ] 更新 `worker.js` 添加圖片處理功能
- [ ] 本地測試
- [ ] 部署到生產環境
- [ ] 在網頁中使用圖片

---

**建立日期**: 2026-02-01  
**最後更新**: 2026-02-01
