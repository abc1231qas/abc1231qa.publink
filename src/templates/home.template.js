import { getCommonStyles } from './common.template.js';

/**
 * 產生首頁 HTML (Intro)
 * @param {string} ADMIN_PATH - 管理後台路徑
 */
export function generateIntroHTML(ADMIN_PATH) {
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
      
      <!-- Hero Banner Image -->
      <section class="banner-section" style="margin-bottom: 80px; text-align: center; opacity: 0; animation: fadeIn 1s ease-out 0.5s forwards;">
        <img src="/images/digital_garden_hero.png" alt="Digital Garden" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);" />
      </section>
      
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
 * 產生 About 頁面
 */
export function generateAboutHTML() {
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
        <div style="margin-top: 40px; text-align: center; opacity: 0; animation: fadeIn 1s ease-out 0.5s forwards;">
          <img src="/images/long_termism_concept.png" alt="長期主義概念圖" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 15px 30px rgba(0,0,0,0.08);" />
        </div>
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
 * 產生作品集頁面
 */
export function generateWorksHTML() {
  return `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>作品集 | abc1231qa</title>
    <meta name="description" content="精選作品展示。NBA 戰績表系統、Telegram Bot 服務化、數位花園個人網站。">
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
export function generateBlogHTML() {
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
        <div style="margin-top: 40px; text-align: center; opacity: 0; animation: fadeIn 1s ease-out 0.5s forwards;">
          <img src="/images/tech_theology_abstract.png" alt="技術與哲學概念" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 15px 30px rgba(0,0,0,0.08);" />
        </div>
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
