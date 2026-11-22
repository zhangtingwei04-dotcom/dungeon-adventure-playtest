# 2026-11-22 男性 V3 頭部拆層修復與像素驗證

## 根因
雖然使用者在 2026-11-21 驗收的五張素材 PNG 是真正分開的（`head_base`、`eyebrows`、`eyes`、`mouth`、`hair_standard`），之前的 V3 正式適配器卻將眉毛、眼睛、嘴巴再次合入臉部 PNG，隨後在表情動畫中用局部矩形重新覆蓋；這破壞「真正五層獨立載入」的要求，也讓眉毛/眼睛在切換表情、眨眼時容易不自然。另有舊 CSS 將男性髮型 fallback 單獨平移 7px，和原生其他圖層 9px 不一致，造成載入時髮型位置跳動。

## 本次修復（GitHub main）
- `index.html`：`paperDollLayers()` 專為 `v3-accepted` 返回五張已驗收的原始透明圖，**face 只用 head_base、不含原眉、眼、嘴**。
- `paperDollSprite()`：V3 狀態不再將原眉、眼、嘴強制替換成透明清空圖；保留 V8/V9 既有路由。
- 正式紙娃娃 V3 會實際繪製獨立中性嘴巴 `maleTemplateLayer(...mouth...)`。表情時的嘴部動畫才用小面積覆蓋，無需把原嘴畫進頭部底圖。
- `assets/male_approved_v3_adapter.js`：不再用 `toDataURL()` 把頭底圖、眉毛、眼睛與嘴巴合成；頭底圖只使用 `art.head_base`。表情眉毛直接使用原眉毛 PNG 移動少量像素，**不以 V9 手繪短線代替**。
- 修復眼睛自然視線：舊演算法把瞳孔像素清成透明，露出膚色空洞；現在只改動暗紫色瞳孔內部少量原始高光，不更動原眼框、睫毛與眼白。
- 男性頭髮 fallback 位置統一為 9px（與所有其他原圖層相同），避免載入時 2px 跳位；保留透明的獨立原銀白髮圖片及光頭切換的隱藏方式。
- 不更改原 V3 圖檔、不重新生成頭型或五官；保留女性、V8/V9 對照、既有 HP/睡眠/異常、衣服、脖子、背包與存檔。

## 驗證
- 原 ZIP 的 `head_base_64x160.png`、`eyebrows_64x160.png`、`eyes_64x160.png`、`mouth_64x160.png`、`hair_standard_64x160.png` 都是 64×160 RGBA。
- PIL 將五張原圖依序 alpha-composite：與驗收包內 `head_with_hair_64x160.png` 逐像素一致（`ImageChops.difference().getbbox() is None`）。
- GitHub main 最新 `index.html`、V3 適配器、V3 原始分層與歷史驗收頁均經 JavaScript 語法解析通過；12 項結構性檢查均通過。
- 目前不能聲稱已在 iPhone Safari 真機做視覺驗收，應由使用者在正式裝備欄中切換有髮、光頭、中性、驚訝、戰敗、昏迷以確認。

## 入口
- 正式遊戲：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3&layers=2`
- 原始 V3 互動驗收：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/male-head-v3-approved-archive.html`
- V9 比對：`?male-head=v9`；V8 比對：`?male-head=v8`。
