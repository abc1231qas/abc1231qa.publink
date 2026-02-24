/**
 * 處理圖片請求
 * @param {URL} url - 請求的 URL
 * @param {Object} env - 環境變數（包含 R2 綁定）
 */
export async function handleImageRequest(url, env) {
    // 檢查是否有 R2 綁定
    if (!env.MY_IMAGES) {
        return new Response('R2 儲存未設定', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }

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

/**
 * 處理圖片上傳
 * @param {Request} request - 請求物件
 * @param {Object} env - 環境變數
 */
export async function handleImageUpload(request, env) {
    // 檢查是否有 R2 綁定
    if (!env.MY_IMAGES) {
        return new Response(JSON.stringify({
            success: false,
            error: 'R2 儲存未設定'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // 驗證密碼
        const formData = await request.formData();
        const password = formData.get('password');

        if (password !== (env.HAYUL_PASSWORD || 'Adm1nAdm2n')) {
            return new Response(JSON.stringify({
                success: false,
                error: '密碼錯誤'
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const file = formData.get('image');
        if (!file) {
            return new Response(JSON.stringify({
                success: false,
                error: '未選擇檔案'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 驗證檔案類型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return new Response(JSON.stringify({
                success: false,
                error: '不支援的圖片格式（僅支援 JPEG, PNG, WebP, GIF）'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 驗證檔案大小（5MB）
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return new Response(JSON.stringify({
                success: false,
                error: '檔案過大（最大 5MB）'
            }), {
                status: 413,
                headers: { 'Content-Type': 'application/json' }
            });
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
            fileName: fileName,
            size: file.size,
            type: file.type
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('上傳錯誤:', error);
        return new Response(JSON.stringify({
            success: false,
            error: '上傳失敗：' + error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * 列出所有圖片
 * @param {Object} env - 環境變數
 */
export async function handleListImages(env) {
    // 檢查是否有 R2 綁定
    if (!env.MY_IMAGES) {
        return new Response(JSON.stringify({
            success: false,
            error: 'R2 儲存未設定'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const list = await env.MY_IMAGES.list();
        const images = list.objects.map(obj => ({
            key: obj.key,
            size: obj.size,
            uploaded: obj.uploaded,
            url: `/images/${obj.key}`
        }));

        return new Response(JSON.stringify({
            success: true,
            count: images.length,
            images: images
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('列表錯誤:', error);
        return new Response(JSON.stringify({
            success: false,
            error: '取得列表失敗：' + error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
