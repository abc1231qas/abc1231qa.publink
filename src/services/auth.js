/**
 * 生成 Session Token
 */
export async function generateSessionToken(env) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const data = `${timestamp}-${random}`;

    // 使用 Web Crypto API 生成簽名
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data + env.SESSION_SECRET);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return `${data}.${hashHex}`;
}

/**
 * 驗證 Session
 */
export async function verifySession(request, env) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return false;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});

    const sessionToken = cookies['admin_session'];
    if (!sessionToken) return false;

    // 驗證 Token 格式
    const parts = sessionToken.split('.');
    if (parts.length !== 2) return false;

    const [data, signature] = parts;

    // 重新計算簽名
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data + env.SESSION_SECRET);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 比對簽名
    if (signature !== expectedSignature) return false;

    // 檢查時間戳（防止過期）
    const timestamp = parseInt(data.split('-')[0]);
    const SESSION_DURATION = 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > SESSION_DURATION) return false;

    return true;
}
