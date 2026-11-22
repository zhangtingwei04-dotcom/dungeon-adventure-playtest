# 《迷宮盡頭的燈火》女性新版頭部＋表情｜遊戲內試裝（2026-11-22）

使用者明確要求不要只在開發者工具台預覽，而是**在正式遊戲的裝備欄裡測試**。本次在 main 的 index.html 建立可回退的遊戲內女性試裝流程，沒有直接取代已核准母版。

## 入口與操作
- 遊戲：https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?female-head=trial
- 進遊戲後切到右側「裝備」，在「標準體型」選「女性」。緊接著可見「女性頭部試裝」選鈕。
- URL 帶 female-head=trial 時，載入後預設啟用女性試裝；一般遊戲 URL 預設保留原本正式女性頭。
- 「女性頭部試裝」可以在同一個裝備欄開關新／舊女性頭部；切換不會呼叫 save()。
- 既有「四種 HP 固定動態與試演」可操作表情選擇、自然眨眼與嘴巴說話；另有睡眠／活力及八種異常視覺測試。這些都是試演，不代表 HP 和存檔會被改寫。
- 新版女性頭使用 assets/female_bald_candidate_v1.js 中的 64×160 正面測試 PNG；髮片仍取自原本 assets/female_parts_v2.js 的 DUNGEON_FEMALE_HAIR_V2，**只平移 x=-2、y=-5，不縮放不重畫髮束**。
- 已為新臉新增獨立 canvas，再由 assets/female_trial_expression_v1.js 按目前所選女性 PNG 做局部表情繪製。女性試裝中**跳過舊女性眼／嘴 atlas**，避免兩套五官互相蓋住。
- 中性表情不增加任何新像素；其他表情局部修改現有眼睛和嘴巴，男性 V3 原版及其額頭圓頂完全不變。
- 新女性試裝的 HP 汗滴向右側額頭（x42、y26）顯示，最後幀保持與眼睛分離；戰敗圈圈眼對齊新眼睛；昏迷沿用閉眼＋頭部右上單一旋轉圖示（不把兩個圈圈蓋進眼睛）。

## 技術與保護
- index.html 新增 female-head=trial URL 開關及只存在 JS 記憶體中的 paperDollFemaleTrialPreview 變數；未增加存檔欄位，不修改雲端資料，也不會在點「試裝」時呼叫 save()。
- 新版 female trial 的 facial canvas 在現有頭部之上、髮片之下；其餘穿著、脖子、裝備、男性內容原樣。
- 原版女性仍使用原 female_parts_v2.js，以及之前的女性眼嘴動畫；新的表情模組**僅**在試裝時被呼叫。
- 用戶已確認的女性髮片偏移、先前核准的男性 V2 圓頂、眼睛安全汗滴與表情系統不被重寫。
- 膚色與瞳色自訂需留意：試裝女性表情層直接取樣新頭原始色彩，不保證所有染色組合在表情切換時完美相容；美術尚待 iPhone 實機驗收。
- 已以 GitHub main 回讀和內嵌 JS 語法解析檢查；用現有 64×160 source + x=-2/y=-5 原頭髮做透明合成視覺比對。真正的 GitHub Pages / iPhone 橫式測試仍由使用者驗收。

## 回復
點擊裝備欄「女性頭部試裝」可回到正式女性舊頭；不使用帶 female-head=trial 的 URL 則正常進入舊版。GitHub 版本控制保留原始 female_parts_v2.js、male_approved_v3_layers.js、male_v3_head_dome2_trial.js、舊表情模組，沒有修改原圖。
