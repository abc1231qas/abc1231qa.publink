# R2 快速開始指南 🚀

## ✅ 已完成的設定

1. ✅ `wrangler.toml` 已添加 R2 綁定配置
2. ✅ `worker.js` 已添加完整的 R2 圖片處理功能
   - 圖片讀取：`/images/xxx.png`
   - 圖片上傳：`/api/upload-image`
   - 圖片列表：`/api/images`

---

## 📝 接下來要做的事

### 步驟 1️⃣：填入您的 R2 Bucket 名稱

開啟 `wrangler.toml`，找到這一行：

```toml
bucket_name = "YOUR_BUCKET_NAME"   # ⚠️ 請替換成您的實際 Bucket 名稱
```

將 `YOUR_BUCKET_NAME` 替換成您在 Cloudflare Dashboard 中建立的 Bucket 名稱。

**範例：**
```toml
bucket_name = "my-website-images"
```

---

### 步驟 2️⃣：上傳測試圖片到 R2

#### 方法 A：使用 Wrangler CLI（推薦）

```powershell
# 確保已安裝 Wrangler
npm install -g wrangler

# 登入 Cloudflare（如果還沒登入）
wrangler login

# 上傳圖片（替換成您的 Bucket 名稱和檔案路徑）
wrangler r2 object put YOUR_BUCKET_NAME/logo.png --file=./logo.png

# 列出所有檔案確認
wrangler r2 object list YOUR_BUCKET_NAME
```

#### 方法 B：使用 Cloudflare Dashboard

1. 前往 https://dash.cloudflare.com/
2. 點擊左側選單的 **R2**
3. 選擇您的 Bucket
4. 點擊 **Upload** 按鈕
5. 選擇圖片檔案並上傳

---

### 步驟 3️⃣：本地測試

```powershell
# 在專案目錄下執行
cd c:\Users\KHUser\abc1231qa.worker.dev

# 啟動本地開發伺服器
wrangler dev
```

開啟瀏覽器測試：
- **圖片存取**：http://localhost:8787/images/logo.png
- **圖片列表**：http://localhost:8787/api/images

---

### 步驟 4️⃣：部署到生產環境

```powershell
# 部署 Worker
wrangler deploy
```

部署後測試線上版本：
- **圖片存取**：https://your-domain.com/images/logo.png
- **圖片列表**：https://your-domain.com/api/images

---

## 🎯 可用的 API 端點

### 1. 讀取圖片
```
GET /images/{filename}
```

**範例：**
```html
<img src="/images/logo.png" alt="Logo">
```

---

### 2. 上傳圖片（需密碼）
```
POST /api/upload-image
Content-Type: multipart/form-data

參數：
- password: 管理密碼
- image: 圖片檔案
```

**範例（使用 JavaScript）：**
```javascript
const formData = new FormData();
formData.append('password', 'YOUR_PASSWORD');
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/upload-image', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.url); // /images/upload_1234567890.png
```

---

### 3. 列出所有圖片
```
GET /api/images
```

**回應範例：**
```json
{
  "success": true,
  "count": 3,
  "images": [
    {
      "name": "logo.png",
      "size": 12345,
      "uploaded": "2026-02-01T07:30:00.000Z",
      "url": "/images/logo.png"
    }
  ]
}
```

---

## 🧪 測試範例

### 使用 PowerShell 測試上傳

```powershell
# 建立測試檔案
$boundary = [System.Guid]::NewGuid().ToString()
$filePath = "C:\path\to\your\image.png"
$password = "0 2k6"  # 您的管理密碼

# 上傳圖片
$response = Invoke-RestMethod -Uri "http://localhost:8787/api/upload-image" `
  -Method Post `
  -InFile $filePath `
  -ContentType "multipart/form-data" `
  -Headers @{
    "password" = $password
  }

Write-Output $response
```

### 使用瀏覽器 Console 測試

```javascript
// 測試圖片列表
fetch('/api/images')
  .then(r => r.json())
  .then(data => console.log(data));

// 測試圖片上傳（需要先選擇檔案）
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.onchange = async (e) => {
  const formData = new FormData();
  formData.append('password', '0 2k6');
  formData.append('image', e.target.files[0]);
  
  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  console.log('上傳結果:', result);
};
input.click();
```

---

## 📂 建議的 R2 檔案結構

```
YOUR_BUCKET_NAME/
├── logos/
│   ├── logo.png
│   ├── logo-dark.png
│   └── favicon.ico
├── backgrounds/
│   ├── hero.jpg
│   └── pattern.png
├── avatars/
│   └── default.png
└── uploads/
    └── upload_1234567890.jpg
```

**上傳到子資料夾：**
```powershell
wrangler r2 object put YOUR_BUCKET_NAME/logos/logo.png --file=./logo.png
```

**存取：**
```html
<img src="/images/logos/logo.png" alt="Logo">
```

---

## 🔧 常見問題

### Q: 圖片顯示 "R2 儲存未設定"
**A:** 檢查 `wrangler.toml` 中的 `bucket_name` 是否正確，並確保已重新部署。

### Q: 圖片顯示 404
**A:** 
1. 確認圖片已上傳到 R2
2. 檢查檔案路徑是否正確（區分大小寫）
3. 使用 `wrangler r2 object list YOUR_BUCKET_NAME` 查看所有檔案

### Q: 本地開發無法存取 R2
**A:** 確保已執行 `wrangler login` 並且有正確的權限。

### Q: 上傳失敗
**A:** 檢查：
- 密碼是否正確
- 檔案格式是否支援（JPEG, PNG, WebP, GIF）
- 檔案大小是否超過 5MB

---

## 📚 相關文件

- [R2_SETUP.md](./R2_SETUP.md) - 詳細設定指南
- [IMAGE_GUIDE.md](./IMAGE_GUIDE.md) - 圖片使用完整指南
- [Cloudflare R2 官方文件](https://developers.cloudflare.com/r2/)

---

## ✨ 下一步建議

1. **上傳您的第一張圖片**
   ```powershell
   wrangler r2 object put YOUR_BUCKET_NAME/test.png --file=./test.png
   ```

2. **在網頁中使用圖片**
   - 修改 `generateIntroHTML()` 函數
   - 添加 `<img src="/images/test.png">`

3. **建立圖片管理介面**（進階）
   - 在管理後台添加上傳功能
   - 顯示所有已上傳的圖片
   - 提供刪除功能

---

**建立日期**: 2026-02-01  
**最後更新**: 2026-02-01

🎉 **恭喜！您的 R2 已經準備就緒！**
