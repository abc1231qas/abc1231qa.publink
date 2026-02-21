/**
 * abc1231qa.cc - 數位花園 Entry Point
 * 
 * 此檔案現在僅作為進入點，核心邏輯已移至 src/ 目錄進行模組化管理。
 * Phase 2 Architectural Refactoring Completed.
 */

import { handleRequest } from './src/router.js';

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env);
    } catch (e) {
      console.error('Fatal Worker Error:', e);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};