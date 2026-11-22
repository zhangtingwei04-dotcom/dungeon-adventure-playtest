> **歷史版本（已被 V2 取代）**：2026-11-22 使用者確認「新版可以」，已將最高點下移 1px 的圓頂 V2 正式採用為預設 `?male-head=v3`。本文件描述的 V1 只能透過 `?male-head=v3-round1` 作對照，不再是正式基準。正式表情測試也改用 V2。詳細見 `docs/MALE_V3_DOME2_ONE_PIXEL_DROP_TRIAL_2026-11-22.md` 的後續驗收更新。
 
# 男性 V3｜頭頂尖點修圓，不改 5px 已選高度（2026-11-22）

## 問題與使用者決策
使用者提供裝備欄 iPhone 畫面，指出男性光頭在正常縮放下頭頂會像有一個尖點，並同意「只修 y18..y21 頭頂輪廓，不重畫臉、不增加高度」的建議。

## 實際像素確認
- 5px 高度版本原本頭頂出現於 y18；由上到下 y18/19/20/21 非透明寬度是 `6/12/20/22` px，跳幅 `+6/+8/+2`，中央形成尖點感。
- 選用最小侵入調整：只重塑 y18、y19 的頭皮及黑色輪廓，改為 `10/16/20/22` px，跳幅 `+6/+4/+2`，維持中心對稱（x31.5）。
- 僅改原生 64×160 PNG **26 個 RGBA 像素**，差異 bounding box x24..39/y18..19；**y20..159 每個 RGBA 像素與原本 5px 版本完全相同**。
- 頭高不改：y17 仍透明；頭頂第一列仍是 y18。頭部其他部位、眼睛、眼線／睫毛、嘴巴、耳朵、下巴、脖子與表情特效座標不動。
- 銀白髮使用原已核准圖層，不重新生成頭或髮。

## GitHub main 正式接入
- 新增 `assets/male_v3_head_short5_roundtop_v1.js`，只覆寫當前已載入 `DungeonMaleV3HeadShort5.adjustedHead` 的 `head_base`；其餘 `DungeonMaleV3CorrectedLayers` 屬性完全保留。
- `index.html` 和 `male-v3-expression-check.html` 均按以下順序載入：原始 V3、修正眼線／眉毛的分層、5px 頭頂、**roundtop**、表情適配器。正式版和 QA 共用修圓素材。
- **原始 0px V3 與未修圓 5px 素材完全保留，不刪除或覆蓋。**
- 新的修圓 PNG 是 64×160 RGBA、1397 bytes、SHA-256 `6404e916704b94f43f644a9f3711214938d729e576af9856cd82da3581332f56`、CRC32 `c66cce29`。
- 回讀 main 驗證所有 V3 JS 語法正確、PNG 三段 chunk CRC 正確、正式頁與 QA 的 script 載入順序正確、內嵌腳本語法無誤。

## 回復與驗收連結
- 正式修圓：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3&roundtop=1`
- 修圓前 5px：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3-flat5`
- 原始未縮短 0px：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3-original`
- 表情驗收（採用修圓後）：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/male-v3-expression-check.html?v=10`

## 長期回歸約束
1. **5px 頭部高度與本次圓弧輪廓先視為目前正式基準**，之後修眉眼／情緒／流汗／戰敗不得重繪整顆頭。
2. 需更動頭型時，限指定像素、建立獨立實驗素材、保留前一版；只在確認必要且局部修改完成時套用。
3. 修改後需核對正式版與 QA 素材一致；若涉及頭髮遮擋，另外看光頭和有髮兩態。
4. **尚未在使用者 iPhone 實機直接看到部署後畫面**；程式／像素檢查不能視為美術實機驗收。
