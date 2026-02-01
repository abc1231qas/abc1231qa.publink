# Cloudflare Worker 圖片顯示完整指南

## 📋 目錄
1. [方法概覽](#方法概覽)
2. [方法一：Base64 編碼](#方法一base64-編碼)
3. [方法二：外部圖片連結](#方法二外部圖片連結)
4. [方法三：Cloudflare R2 儲存](#方法三cloudflare-r2-儲存)
5. [效能比較](#效能比較)
6. [最佳實踐建議](#最佳實踐建議)

---

## 方法概覽

在 Cloudflare Worker 中顯示圖片有三種主要方法：

| 方法 | 優點 | 缺點 | 適用場景 |
|------|------|------|----------|
| **Base64 編碼** | 無需外部請求、部署簡單 | 增加 Worker 體積、不適合大圖 | 小圖示、Logo（< 10KB） |
| **外部連結** | 簡單快速、不佔 Worker 空間 | 依賴外部服務、可能失效 | 快速原型、臨時方案 |
| **Cloudflare R2** | 專業、可擴展、無流量費用 | 需額外設定、有儲存成本 | 生產環境、大量圖片 |

---

## 方法一：Base64 編碼

### 📝 說明
將圖片轉換為 Base64 字串，直接嵌入 HTML 或 Worker 程式碼中。

### ✅ 優點
- 無需外部 HTTP 請求
- 圖片與程式碼一起部署
- 載入速度快（已在 Worker 中）

### ❌ 缺點
- Base64 會增加約 33% 的檔案大小
- Worker 有 1MB 程式碼大小限制
- 不適合大型圖片或多張圖片

### 💻 實作範例

#### 步驟 1：將圖片轉換為 Base64

**使用線上工具：**
- https://www.base64-image.de/
- https://base64.guru/converter/encode/image

**使用 Node.js：**
```javascript
const fs = require('fs');
const imageBuffer = fs.readFileSync('logo.png');
const base64Image = imageBuffer.toString('base64');
console.log(`data:image/png;base64,${base64Image}`);
```

**使用 PowerShell：**
```powershell
$imageBytes = [System.IO.File]::ReadAllBytes("logo.png")
$base64String = [System.Convert]::ToBase64String($imageBytes)
Write-Output "data:image/png;base64,$base64String"
```

#### 步驟 2：在 Worker 中使用

```javascript
// 在 worker.js 中定義 Base64 圖片
const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...";

function generateIntroHTML() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>我的網站</title>
    </head>
    <body>
      <!-- 使用 Base64 圖片 -->
      <img src="${LOGO_BASE64}" alt="Logo" width="100" height="100">
      
      <!-- 或作為背景圖 -->
      <div style="background-image: url('${LOGO_BASE64}'); width: 100px; height: 100px;"></div>
    </body>
    </html>
  `;
}
```

### 📊 建議使用情境
- 網站 Logo（通常 < 5KB）
- 小型圖示（Icon）
- Favicon
- 裝飾性小圖片

---

## 方法二：外部圖片連結

### 📝 說明
使用外部圖片託管服務的 URL，直接在 HTML 中引用。

### ✅ 優點
- 實作最簡單
- 不佔用 Worker 空間
- 可隨時更換圖片（不需重新部署）

### ❌ 缺點
- 依賴第三方服務
- 可能有流量限制
- 連結可能失效
- 額外的 DNS 查詢和 HTTP 請求

### 💻 實作範例

#### 推薦的免費圖片託管服務

1. **Cloudflare Images** (推薦)
   - 官方服務，與 Worker 整合良好
   - 免費額度：100,000 張圖片/月
   - URL 格式：`https://imagedelivery.net/<account_hash>/<image_id>/<variant_name>`

2. **GitHub**
   - 使用 GitHub Issues 或 Repository
   - 穩定可靠
   - URL 格式：`https://raw.githubusercontent.com/username/repo/main/image.png`

3. **Imgur**
   - 老牌圖片託管
   - 免費無限制
   - URL 格式：`https://i.imgur.com/xxxxx.png`

4. **Unsplash / Pexels**
   - 免費高品質圖庫
   - 適合背景圖、裝飾圖

#### 在 Worker 中使用

```javascript
function generateIntroHTML() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>我的網站</title>
    </head>
    <body>
      <!-- 使用外部圖片 -->
      <img src="https://raw.githubusercontent.com/username/repo/main/logo.png" 
           alt="Logo" 
           width="200" 
           height="200">
      
      <!-- 使用 Unsplash 背景圖 -->
      <div style="
        background-image: url('https://images.unsplash.com/photo-xxxxx');
        background-size: cover;
        height: 400px;
      "></div>
    </body>
    </html>
  `;
}
```

### 🔒 CORS 注意事項

某些圖片服務可能有 CORS 限制。如果遇到問題，可以在 Worker 中代理：

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 圖片代理路由
    if (url.pathname.startsWith('/img/')) {
      const imageUrl = 'https://example.com/image.png';
      const response = await fetch(imageUrl);
      
      return new Response(response.body, {
        headers: {
          'Content-Type': response.headers.get('Content-Type'),
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 其他路由...
  }
};
```

---

## 方法三：Cloudflare R2 儲存

### 📝 說明
使用 Cloudflare R2（類似 AWS S3）儲存圖片，透過 Worker 讀取並提供服務。

### ✅ 優點
- **零流量費用**（Cloudflare 最大優勢）
- 專業級儲存方案
- 可儲存大量圖片
- 支援圖片轉換和優化
- 與 Worker 深度整合

### ❌ 缺點
- 需要額外設定 R2 Bucket
- 有儲存成本（但很便宜）
  - 前 10GB/月免費
  - 超過部分：$0.015/GB/月
- 學習曲線較陡

### 💻 實作步驟

#### 步驟 1：建立 R2 Bucket

1. 登入 Cloudflare Dashboard
2. 前往 **R2** 頁面
3. 點擊 **Create bucket**
4. 輸入 Bucket 名稱（例如：`my-images`）
5. 點擊 **Create bucket**

#### 步驟 2：上傳圖片到 R2

**方法 A：使用 Dashboard**
1. 進入你的 Bucket
2. 點擊 **Upload**
3. 選擇圖片檔案
4. 上傳完成

**方法 B：使用 Wrangler CLI**
```bash
# 安裝 Wrangler（如果還沒安裝）
npm install -g wrangler

# 登入
wrangler login

# 上傳圖片
wrangler r2 object put my-images/logo.png --file=./logo.png
```

**方法 C：使用 Worker 上傳**
```javascript
export default {
  async fetch(request, env) {
    if (request.method === 'POST' && request.url.includes('/upload')) {
      const formData = await request.formData();
      const file = formData.get('image');
      
      if (file) {
        await env.MY_BUCKET.put('images/' + file.name, file.stream(), {
          httpMetadata: {
            contentType: file.type
          }
        });
        return new Response('上傳成功');
      }
    }
  }
};
```

#### 步驟 3：綁定 R2 到 Worker

在 `wrangler.toml` 中添加：

```toml
name = "my-worker"
main = "worker.js"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "my-images"
```

#### 步驟 4：在 Worker 中讀取圖片

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 圖片路由：/images/logo.png
    if (url.pathname.startsWith('/images/')) {
      const imageKey = url.pathname.replace('/images/', '');
      
      // 從 R2 讀取圖片
      const object = await env.MY_BUCKET.get(imageKey);
      
      if (object === null) {
        return new Response('圖片不存在', { status: 404 });
      }
      
      // 返回圖片
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('Cache-Control', 'public, max-age=86400');
      
      return new Response(object.body, { headers });
    }
    
    // 首頁使用 R2 圖片
    if (url.pathname === '/') {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>我的網站</title></head>
        <body>
          <img src="/images/logo.png" alt="Logo">
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
  }
};
```

### 🎨 進階：圖片轉換和優化

Cloudflare 提供 Image Resizing 功能，可以動態調整圖片：

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 動態調整圖片大小：/images/logo.png?width=300
    if (url.pathname.startsWith('/images/')) {
      const imageKey = url.pathname.replace('/images/', '');
      const object = await env.MY_BUCKET.get(imageKey);
      
      if (!object) {
        return new Response('圖片不存在', { status: 404 });
      }
      
      // 獲取查詢參數
      const width = url.searchParams.get('width');
      const quality = url.searchParams.get('quality') || '85';
      
      // 如果有調整需求，使用 Image Resizing
      if (width) {
        const resizeUrl = new URL(request.url);
        resizeUrl.pathname = '/cdn-cgi/image/' + 
          `width=${width},quality=${quality},format=auto` + 
          url.pathname;
        
        return fetch(resizeUrl.toString());
      }
      
      // 否則直接返回原圖
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      return new Response(object.body, { headers });
    }
  }
};
```

---

## 效能比較

### 載入速度測試（假設 50KB 圖片）

| 方法 | 首次載入 | 快取後載入 | 額外請求數 | 總體積 |
|------|----------|------------|------------|--------|
| **Base64** | ~50ms | ~50ms | 0 | +66KB (含編碼) |
| **外部連結** | ~200ms | ~20ms | +1 | 50KB |
| **R2** | ~80ms | ~15ms | +1 | 50KB |

### 成本比較（每月 10,000 次訪問，100 張圖片）

| 方法 | 儲存成本 | 流量成本 | 總成本 |
|------|----------|----------|--------|
| **Base64** | $0 | $0 | **$0** |
| **外部連結** | 視服務而定 | 視服務而定 | $0 - $5+ |
| **R2** | ~$0.01 | **$0** | **~$0.01** |

---

## 最佳實踐建議

### 🎯 根據使用場景選擇方法

#### 個人網站 / 作品集
```
✅ 小 Logo → Base64
✅ 背景圖 → 外部連結（Unsplash）
✅ 作品圖片 → R2（如果超過 5 張）
```

#### 縮網址服務（當前專案）
```
✅ 水墨圓圈裝飾 → CSS 繪製（無需圖片）
✅ Favicon → Base64
✅ 未來功能圖片 → R2
```

#### 部落格 / 內容網站
```
✅ 文章配圖 → R2
✅ 圖示 → Base64
✅ 社交媒體預覽圖 → R2
```

### 🚀 效能優化技巧

1. **使用現代圖片格式**
   - WebP（比 JPEG 小 25-35%）
   - AVIF（比 WebP 再小 20%）
   - 提供 fallback 給舊瀏覽器

2. **實作 Lazy Loading**
   ```html
   <img src="image.jpg" loading="lazy" alt="描述">
   ```

3. **設定適當的快取標頭**
   ```javascript
   headers.set('Cache-Control', 'public, max-age=31536000, immutable');
   ```

4. **使用 CDN**
   - R2 自動透過 Cloudflare CDN 分發
   - 外部連結選擇有 CDN 的服務

5. **圖片壓縮**
   - 使用工具：TinyPNG, Squoosh, ImageOptim
   - 目標：在不明顯降低品質下減少 50-70% 體積

### 🔐 安全性考量

1. **驗證圖片類型**
   ```javascript
   const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
   if (!allowedTypes.includes(file.type)) {
     return new Response('不支援的圖片格式', { status: 400 });
   }
   ```

2. **限制檔案大小**
   ```javascript
   const MAX_SIZE = 5 * 1024 * 1024; // 5MB
   if (file.size > MAX_SIZE) {
     return new Response('檔案過大', { status: 413 });
   }
   ```

3. **防止熱連結（Hotlinking）**
   ```javascript
   const referer = request.headers.get('Referer');
   if (referer && !referer.includes('yourdomain.com')) {
     return new Response('禁止外部連結', { status: 403 });
   }
   ```

---

## 📚 延伸閱讀

- [Cloudflare R2 官方文件](https://developers.cloudflare.com/r2/)
- [Cloudflare Images 文件](https://developers.cloudflare.com/images/)
- [Image Optimization 最佳實踐](https://web.dev/fast/#optimize-your-images)
- [WebP 格式指南](https://developers.google.com/speed/webp)

---

## 🎓 實作練習

### 練習 1：為當前專案添加 Favicon
使用 Base64 方法添加一個小型 Favicon。

### 練習 2：建立圖片代理
實作一個 Worker 路由來代理外部圖片並添加快取。

### 練習 3：設定 R2 圖片庫
建立 R2 Bucket，上傳 3 張圖片，並在網頁中顯示。

---

**建立日期**: 2026-02-01  
**最後更新**: 2026-02-01  
**版本**: 1.0
