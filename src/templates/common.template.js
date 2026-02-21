/**
 * 共用樣式
 */
export function getCommonStyles() {
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
    
    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
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
