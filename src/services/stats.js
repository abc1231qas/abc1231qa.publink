/**
 * 點擊統計服務
 */

const STATS_PREFIX = "stats:";

/**
 * 增加點擊計數
 * @param {Object} env - 環境變數
 * @param {string} key - 短碼
 */
export async function incrementClickCount(env, key) {
    try {
        const statsKey = STATS_PREFIX + key;
        const currentCount = await env.SHORT_URLS.get(statsKey) || "0";
        const newCount = parseInt(currentCount) + 1;
        await env.SHORT_URLS.put(statsKey, newCount.toString());
    } catch (err) {
        console.error("Failed to increment click count:", err);
    }
}

/**
 * 獲取全域統計資料
 * @param {Object} env - 環境變數
 */
export async function getGlobalStats(env) {
    try {
        const list = await env.SHORT_URLS.list();
        let totalUrls = 0;
        let totalClicks = 0;

        for (const k of list.keys) {
            if (k.name.startsWith(STATS_PREFIX)) {
                const clicks = await env.SHORT_URLS.get(k.name);
                totalClicks += parseInt(clicks || 0);
            } else {
                totalUrls++;
            }
        }

        return {
            totalUrls,
            totalClicks,
            avgClicksPerUrl: totalUrls > 0 ? (totalClicks / totalUrls).toFixed(2) : 0
        };
    } catch (err) {
        console.error("Failed to get global stats:", err);
        throw err;
    }
}

/**
 * 獲取特定短碼的點擊次數
 * @param {Object} env - 環境變數
 * @param {string} key - 短碼
 */
export async function getClickCount(env, key) {
    const count = await env.SHORT_URLS.get(STATS_PREFIX + key);
    return parseInt(count || "0");
}

/**
 * 刪除特定短碼的統計資料
 * @param {Object} env - 環境變數
 * @param {string} key - 短碼
 */
export async function deleteStats(env, key) {
    await env.SHORT_URLS.delete(STATS_PREFIX + key);
}
