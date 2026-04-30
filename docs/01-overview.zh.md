# 01 — 概述

## 這是什麼

[abc1231qa.cc](https://abc1231qa.cc) 是一個架在 Cloudflare Workers 上的個人網站，包含兩個對外公開的功能：

1. **縮網址跳轉**：輸入 `abc1231qa.cc/<短碼>` 會被導向預先登記好的目標網址。
2. **Blog**：閱讀文章列表與單篇文章，內容來自另一個獨立的寫作流程（見 [04 — Blog pipeline](./04-blog-pipeline.zh.md)）。

> 縮網址的**建立 / 編輯 / 統計**屬於後台功能，不在這個公開 repo 介紹範圍內。

## 設計定位

整站走 **東方禪意極簡（Zen Minimalism）** 風格：

- 配色：米白底（`#F7F7F5`）＋ 墨黑（`#2C2C2C`）＋ 霧金點綴（`#C5A065`）
- 字體：思源宋體（Noto Serif TC），凸顯人文質感
- 視覺核心：水墨圓圈（Enso）符號
- 留白比例約 55%，搭配漸進式淡入動畫

詳見 [05 — Design](./05-design.zh.md)。

## 技術骨幹一句話

**Cloudflare Workers** 處理請求 ＋ **KV** 存縮網址對應 ＋ **R2** 存 Blog 圖片資產 ＋ 內容由外部寫作工具同步進來。

詳見 [02 — Architecture](./02-architecture.zh.md) 與 [06 — Tech choices](./06-tech-choices.zh.md)。

## 為什麼開這個 repo

把實際在跑的個人網站背後的設計考量、架構決策、Blog 內容流程，整理成可閱讀的公開紀錄。  
**不是**讓人 clone 下來部署，是分享做法。
