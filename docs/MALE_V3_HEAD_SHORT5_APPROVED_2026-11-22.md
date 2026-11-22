# 男性 V3 頭頂高度：5px 正式基準（2026-11-22）

## 選定版本與防止反覆重畫
使用者在 0/2/3/4/5px 同源對照中，原先選擇 3px 後明確改選 **5px**，並要求直接修改正式遊戲。此紀錄取代先前的 3px 定版紀錄。未經明確要求，不得以修表情、眉毛或其他效果為由更動頭型。

## 目前啟用方式
- 正式 `index.html` 與 `male-v3-expression-check.html`：均於 `male_v3_corrected_layers_v2.js` 後、`male_approved_v3_adapter.js` 前載入 `assets/male_v3_head_short5_v1.js?v=1`。
- 原始版 `assets/male_approved_v3_layers.js` 保留不變。歷史 3px 檔案 `assets/male_v3_head_short3_v1.js` 亦保留但不再載入正式版。
- 新版只覆寫 `DungeonMaleV3CorrectedLayers.head_base`，不動眉毛、眼睛＋睫毛、嘴巴及銀白髮圖層，不修改任何身體、脖子、背包、裝備、女性角色、HP/SP、表情動畫與存檔。

## 像素與回歸驗證
- 來源：2026-11-21 使用者核准的男性 V3 頭底圖。
- 和 `v3-bald-height-preview.html` 的 `compressScalp(base,5)` 相同：原始 y13 頭頂改成 y18，僅壓縮 y13..31。**從 y32 到 y159 每個 RGBA 像素保持完全一致**；眼睛、嘴巴、耳朵、下巴、頸部接點的座標不動。
- PNG：64×160、RGBA、1378 bytes，SHA-256 `79f56d6b165a8838fc40b2add8af00c95b0c5199d8b024fa4027a2bfe04da27c`、CRC32 `018b29bc`。
- 與 3px 版本採相同壓縮公式；原始 3px 從相同來源重新計算的 RGBA 像素已驗證與先前保存輸出完全一致，確認算法無漂移。

## 入口
- 正式採用 5px：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3`
- 原始 0px V3 比對：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3-original`
- 男性表情驗收（同一 5px）：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/male-v3-expression-check.html?v=9`
- 高度比較頁：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/v3-bald-height-preview.html?v=2`

## 注意
程式載入與靜態素材校驗不等同實際 iPhone Safari 畫面驗收；若光頭或有髮仍有外觀問題，先局部檢查，不直接重新生成頭型。
