# 🖼️ Enso 背景圖使用指南

本專案包含一張精心生成的**水墨圓圈 (Enso)** 背景圖，可用於多種場景。

---

## 📁 檔案位置

- **檔案名稱**：`zen_enso.png`
- **位置**：專案根目錄
- **尺寸**：16:9 比例，適合網頁背景使用

---

## 🎨 設計特色

這張圖片完美呼應了網站的禪意風格：

- ✨ **水墨筆觸**：手繪感的墨黑圓圈
- 🌟 **金繕細節**：金色裂紋點綴 (Kintsugi)
- 📄 **宣紙質感**：米白背景模擬傳統紙張
- 🌫️ **大量留白**：符合極簡美學
- 🎭 **柔和光影**：營造靜謐氛圍

---

## 💡 使用方式

### 方式 1：作為網頁背景 (推薦)

由於 Cloudflare Workers 不直接支援靜態檔案，建議將圖片上傳到圖床或 CDN：

#### 選項 A：使用 Cloudflare Images
```bash
# 上傳到 Cloudflare Images
wrangler r2 object put zen-enso/zen_enso.png --file zen_enso.png
```

然後在 CSS 中使用：
```css
body {
  background: var(--bg-rice);
  background-image: url('https://你的CDN網址/zen_enso.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  opacity: 0.3; /* 調整透明度 */
}
```

#### 選項 B：使用 Base64 編碼 (小圖片適用)
```bash
# 將圖片轉換為 Base64
powershell -Command "[Convert]::ToBase64String([IO.File]::ReadAllBytes('zen_enso.png'))" > zen_enso_base64.txt
```

然後在 CSS 中使用：
```css
body {
  background-image: url('data:image/png;base64,你的Base64字串');
}
```

### 方式 2：作為 Hero Section 背景

在首頁的主要區塊使用：

```css
.zen-container::before {
  content: '';
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background-image: url('你的圖片網址');
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.1;
  z-index: -1;
}
```

### 方式 3：作為 OG 圖片 (社交分享)

在 HTML `<head>` 中加入：

```html
<meta property="og:image" content="https://你的CDN網址/zen_enso.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://你的CDN網址/zen_enso.png">
```

### 方式 4：作為 Favicon 基礎

將圖片縮小並轉換為 favicon：

```bash
# 使用線上工具或 ImageMagick
convert zen_enso.png -resize 32x32 favicon.ico
```

---

## 🎨 進階應用

### 1. 動態背景效果

```css
.zen-container {
  position: relative;
}

.zen-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('你的圖片網址');
  background-size: 80%;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.05;
  animation: slowRotate 60s linear infinite;
  z-index: -1;
}

@keyframes slowRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 2. 滑鼠視差效果

```javascript
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  document.querySelector('.zen-container::before').style.transform = 
    `translate(${x}px, ${y}px)`;
});
```

### 3. 多層次背景

```css
body {
  background: var(--bg-rice);
  background-image: 
    url('zen_enso.png'),
    radial-gradient(circle at 20% 50%, rgba(197, 160, 101, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(44, 44, 44, 0.02) 0%, transparent 50%);
  background-size: 
    50% auto,
    100% 100%,
    100% 100%;
  background-position: 
    center top,
    0 0,
    0 0;
  background-repeat: no-repeat;
}
```

---

## 🚀 推薦的圖床服務

由於 Cloudflare Workers 的限制，建議使用以下服務託管圖片：

### 免費選項
1. **Cloudflare Images** (推薦)
   - 整合性最佳
   - 全球 CDN
   - 每月免費額度

2. **Imgur**
   - 完全免費
   - 簡單易用
   - 直連網址

3. **GitHub Pages**
   - 放在同一個 repo
   - 使用 `raw.githubusercontent.com` 連結

### 付費選項
1. **Cloudflare R2**
   - 與 Workers 完美整合
   - 低成本儲存

2. **AWS S3 + CloudFront**
   - 企業級方案
   - 高度可靠

---

## 📐 圖片規格

- **格式**：PNG (支援透明度)
- **比例**：16:9
- **建議尺寸**：1920x1080 或 1600x900
- **檔案大小**：約 200-500KB
- **色彩模式**：RGB

---

## 🎨 自訂建議

如果您想要調整圖片：

### 調整透明度
使用圖片編輯軟體（如 Photoshop、GIMP）調整整體透明度

### 改變色調
- 將金色改為銀色：調整色相 (Hue)
- 加深墨色：調整對比度
- 柔化效果：加入高斯模糊

### 重新生成
使用原始 Prompt 在 Midjourney 重新生成：
```
Minimalist Zen presentation background, distinct ink wash brush stroke style 
blended with divine golden kintsugi details. A vast negative space composition 
on high-quality texture rice paper (Washi). Visual elements: a subtle antique 
gold circle or arc, minimal elegant layout. Lighting is soft, diffused, and 
ethereal. Color palette: Off-white background (#F7F7F5), charcoal black ink 
(#2C2C2C), and muted metallic gold (#C5A065). High-end editorial design 
aesthetics, spiritual and intellectual atmosphere, 8k resolution, serene mood 
--ar 16:9 --style raw --v 6.0
```

---

## 📝 注意事項

1. **效能考量**：大圖片會影響載入速度，建議壓縮後使用
2. **快取設定**：設定適當的 Cache-Control headers
3. **響應式**：考慮為行動裝置提供較小的版本
4. **版權**：此圖片由 AI 生成，可自由使用

---

## 🔗 相關資源

- [Cloudflare Images 文檔](https://developers.cloudflare.com/images/)
- [Cloudflare R2 文檔](https://developers.cloudflare.com/r2/)
- [圖片優化最佳實踐](https://web.dev/fast/#optimize-your-images)

---

**建立日期**：2026-02-01  
**圖片生成工具**：Midjourney v6  
**設計風格**：東方禪意極簡
