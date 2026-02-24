import { generateSessionToken, verifySession } from './services/auth.js';
import { handleImageRequest, handleImageUpload, handleListImages } from './services/image.js';
import { incrementClickCount, getGlobalStats, getClickCount, deleteStats } from './services/stats.js';
import { generateIntroHTML, generateAboutHTML, generateWorksHTML, generateBlogHTML } from './templates/home.template.js';
import { generateLoginHTML, generateAdminHTML } from './templates/admin.template.js';
import { generate404HTML } from './templates/error.template.js';

// Constants
const ADMIN_PATH = "admin";
const SESSION_DURATION = 24 * 60 * 60 * 1000;
const URL_REGEX = /^https?:\/\/.+/i;

const LLMS_TXT_CONTENT = `# Title: abc1231qa 的數位花園 - 技術架構與信仰地誌
# Description: 專注於全端開發 (Cloudflare Workers, R2)、系統架構設計、Generative AI 應用，以及信仰哲學與地誌觀察的深度整合。

## 核心文檔 (Core Context)
- [我堅持十年的事]: https://vocus.cc/article/694794d7fd897800019af738 (長期主義、技術價值觀)
- [技術架構集]: https://vocus.cc/salon/abc1231qa/room/digital-leverage (Serverless, Cloudflare Workers, System Design)
- [地誌與信仰]: https://vocus.cc/salon/abc1231qa/room/underlying-logic (人文思考、哲學)

## 實體定義 (Entity Definition)
- 作者身分: 資深技術架構師、數位內容策略師、全端工程師
- 技術棧: Cloudflare Workers, R2, Python, JavaScript, Gemini API, Telegram Bot API
- 核心理念: 技術同構 (Technical Isomorphism)、長期主義 (Long-termism)、靜觀 (Contemplation)

## 連結
- Github: https://github.com/abc1231qas/abc1231qa.publink
- Blog: https://vocus.cc/salon/abc1231qa`;

const ROBOTS_TXT_CONTENT = `User-agent: *
Allow: /
Sitemap: https://abc1231qa.cc/sitemap.xml`;

const SITEMAP_XML_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://abc1231qa.cc/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://abc1231qa.cc/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://abc1231qa.cc/works</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://abc1231qa.cc/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

/**
 * Main Router
 */
export async function handleRequest(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/|\/$/g, "");

    // 1. SEO & GEO Routes
    if (url.pathname === "/llms.txt") {
        return new Response(LLMS_TXT_CONTENT, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    if (url.pathname === "/robots.txt") {
        return new Response(ROBOTS_TXT_CONTENT, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    if (url.pathname === "/sitemap.xml") {
        return new Response(SITEMAP_XML_CONTENT, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
    }

    // 2. Auth API
    if (url.pathname === "/api/login" && request.method === "POST") {
        try {
            const data = await request.json();
            if (data.password === (env.HAYUL_PASSWORD || 'Adm1nAdm2n')) {
                const token = await generateSessionToken(env);
                const expires = new Date(Date.now() + SESSION_DURATION);
                return new Response(JSON.stringify({ success: true }), {
                    headers: {
                        "Content-Type": "application/json",
                        "Set-Cookie": `admin_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires.toUTCString()}`
                    }
                });
            }
            return new Response(JSON.stringify({ success: false, error: "密碼錯誤" }), { status: 401, headers: { "Content-Type": "application/json" } });
        } catch (err) {
            return new Response(JSON.stringify({ success: false, error: "請求錯誤" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
    }

    if (url.pathname === "/api/logout" && request.method === "POST") {
        return new Response(JSON.stringify({ success: true }), {
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": "admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
            }
        });
    }

    // 3. Protected API
    if (url.pathname === "/api/manage" && request.method === "POST") {
        if (!await verifySession(request, env)) return new Response(JSON.stringify({ error: "未授權" }), { status: 401, headers: { "Content-Type": "application/json" } });
        try {
            const data = await request.json();
            if (data.action === "add") {
                if (data.key === ADMIN_PATH || data.key === "api") return new Response(JSON.stringify({ error: "此短碼為系統保留" }), { status: 400, headers: { "Content-Type": "application/json" } });
                if (!URL_REGEX.test(data.value)) return new Response(JSON.stringify({ error: "無效的網址格式" }), { status: 400, headers: { "Content-Type": "application/json" } });
                await env.SHORT_URLS.put(data.key, data.value);
                return new Response(JSON.stringify({ success: true, message: "成功新增" }), { headers: { "Content-Type": "application/json" } });
            } else if (data.action === "delete") {
                await env.SHORT_URLS.delete(data.key);
                await deleteStats(env, data.key);
                return new Response(JSON.stringify({ success: true, message: "成功刪除" }), { headers: { "Content-Type": "application/json" } });
            }
        } catch (err) {
            return new Response(JSON.stringify({ error: "資料格式錯誤" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
    }

    if (url.pathname === "/api/list") {
        if (!await verifySession(request, env)) return new Response(JSON.stringify({ error: "未授權" }), { status: 401, headers: { "Content-Type": "application/json" } });
        const list = await env.SHORT_URLS.list();
        const items = await Promise.all(list.keys
            .filter(k => !k.name.startsWith("stats:"))
            .map(async (k) => ({
                key: k.name,
                value: await env.SHORT_URLS.get(k.name),
                clicks: await getClickCount(env, k.name)
            })));
        return new Response(JSON.stringify(items), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/stats") {
        if (!await verifySession(request, env)) return new Response(JSON.stringify({ error: "未授權" }), { status: 401, headers: { "Content-Type": "application/json" } });
        const stats = await getGlobalStats(env);
        return new Response(JSON.stringify(stats), { headers: { "Content-Type": "application/json" } });
    }

    // 4. Image Services
    if (url.pathname.startsWith('/images/')) return handleImageRequest(url, env);
    if (url.pathname === "/api/upload-image" && request.method === "POST") return handleImageUpload(request, env);
    if (url.pathname === "/api/images" && request.method === "GET") return handleListImages(env);

    // 5. Page Routing
    if (path === "") return new Response(generateIntroHTML(ADMIN_PATH), { headers: { "Content-Type": "text/html;charset=UTF-8" } });

    if (path === ADMIN_PATH) {
        if (await verifySession(request, env)) {
            return new Response(generateAdminHTML(ADMIN_PATH), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
        }
        return new Response(generateLoginHTML(), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    if (path === "about") return new Response(generateAboutHTML(), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    if (path === "works") return new Response(generateWorksHTML(), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    if (path === "blog") return new Response(generateBlogHTML(), { headers: { "Content-Type": "text/html;charset=UTF-8" } });

    // 6. Redirects
    const targetUrl = await env.SHORT_URLS.get(path);
    if (targetUrl) {
        await incrementClickCount(env, path);
        return Response.redirect(targetUrl, 301);
    }

    // 7. 404
    return new Response(generate404HTML(), { status: 404, headers: { "Content-Type": "text/html;charset=UTF-8" } });
}
