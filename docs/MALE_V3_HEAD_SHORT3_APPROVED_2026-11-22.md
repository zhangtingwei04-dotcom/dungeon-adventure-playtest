# 男性 V3 頭頂高度定版｜縮短 3px（2026-11-22）

## 使用者選擇與問題
使用者明確從 `v3-bald-height-preview.html` 的 0/2/3/4/5px 高度對照中選擇 **3px**。本次解決「光頭頭頂過高」的比例問題；不得再以修改表情為由重繪整顆頭。

## 定版資產與套用範圍
- 維持 `assets/male_approved_v3_layers.js` 的原始 2026-11-21 五層素材**完全不修改**。
- 新增 `assets/male_v3_head_short3_v1.js`，在已修正的 `DungeonMaleV3CorrectedLayers` 物件上**僅替換 `head_base` 圖層**；不改 `eyebrows`、`eyes`、`mouth`、`hair_standard`。
- 產生方式精確沿用比對頁 `compressScalp(base,3)`：原本頭頂始於 y13；新的頂部始於 y16。只改 y13..31；y32..159 原 RGBA 像素逐點完全不變。資料仍是原生 **64×160 RGBA 透明 PNG**。
- 新圖像 PNG 大小 1410 bytes，SHA-256 `bf596f04d8f4bf0e84ee81ba7ebfb213b309db888f09765e9d12b3ead6608965`、全檔 CRC32 `cf00a926`；GitHub 來源中的 1880 字元 base64 解碼後 CRC 完全相符，IHDR/IDAT/IEND chunk CRC 全通過。
- 正式 `index.html` 與獨立 `male-v3-expression-check.html` 均在 corrected layers 之後、V3 adapter 之前載入短頭素材，確保正式顯示、光頭、銀白髮與表情 QA 共用同一版。
- 不改女性、身體、脖子、背包、衣服、存檔結構、HP/SP、眨眼與睡眠／異常等表情控制器。

## 回復與對照
- **正式採用（預設）**：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3`
- **原本未縮短 V3**：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3-original`
- **正式表情對照**：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/male-v3-expression-check.html?v=8`
- **原始高度 0/2/3/4/5px 試驗基準**：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/v3-bald-height-preview.html`

## 回歸約束
1. 3px 版本視為目前**已選擇的幾何基準**。未經明確要求，不得自動增減頭頂高度。
2. 修表情／眉眼／嘴巴／流汗／動態時，禁止更換或整體縮放 `head_base`。
3. 任何修正都要同時比較光頭與銀白髮、比對 y32..159 是否與原始 V3 完全一致，並使用相同的正式／QA 素材。
4. 要回復只需 `?male-head=v3-original`，不應刪除或覆蓋核准素材。
5. 目前完成 GitHub main 回讀、PNG 長度與 CRC、腳本載入順序及 JS 語法檢查；**iPhone Safari 實際畫面尚須人工確認**，本紀錄不等同真機美術驗收。
