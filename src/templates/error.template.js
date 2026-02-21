/**
 * 產生 404 頁面
 */
export function generate404HTML() {
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
