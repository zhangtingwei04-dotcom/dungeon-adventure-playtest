# 《迷宮盡頭的燈火》｜棕色皮革旅行靴 V1 開發工作台試穿

日期：2026-11-24
專案：`zhangtingwei04-dotcom/dungeon-adventure-playtest`
狀態：**獨立開發預覽，尚非正式核准的裝備素材**。

## 使用者確認的美術方向

參考之前對話中確認的棕色旅行皮革靴：暖棕色革面、深色粗黑邊、折口靴筒、斜向鞋帶／黃銅扣環、前方略圓的鞋頭、硬朗深灰底。只按風格構建新的原生像素試驗，不宣稱原本大型概念圖已直接成為可裝配的 64x160 精靈圖。

## 安裝位置

- 原有 `starter_boots`（分類 `feet`）仍是同一個裝備槽；從原來單片佔位改成 `side`＝畫面左腳、`front`＝畫面右腳兩片，男女各兩片。
- `assets/travel_boots_workbench_v1.js` 提供 `window.DungeonTravelBootsWorkbenchV1.build(sourceImages)`：讀取目前男女原版 **64×160** 身體 PNG 的 alpha，量測下方兩側腳部的位置，生成四張 **64×160、真正透明 PNG data URL**。內容限於鞋子，不修改原始 body、內衣、頭、手臂與長褲圖片。
- 開發者總台 `developer-studio.html` 在 `init()` 將產生的四張 PNG 登錄至裝備素材與圖層；原本 `feet` 裝備 Z 約 60。若腳部偵測不合理則使用保守的座標回退。
- 兩個明確試穿按鈕：`穿上旅行皮靴 V1｜男女`、`脫下皮靴｜男女`。可選擇男女獨立移動各個鞋片 X/Y/scale/Z，不更改上衣、披風、背包或褲管。
- 使用者目前較新的組合預設仍由 `preset=v13-outer-bag-y10` 套用，並可加 `boots=1` 一起穿靴試看。

## 試穿入口

https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/developer-studio.html?preset=v13-outer-bag-y10&tab=library&boots=1

## 品質與限制

已檢查開發者總台與鞋子生成模組的 JavaScript 語法、四個鞋子圖層鍵、按鈕及 URL 開關，並以仿真的 64x160 身體腳部 alpha 資料走過四片 PNG 的產生流程。正式 `index.html` 未修改。

**尚未在 iPhone Safari 看見實際貼合畫面；使用者需視覺驗收左右鞋寬、鞋跟、褲管遮擋及是否需要更細緻的扣環／靴筒。** 這個版本是小尺寸像素重繪試驗，與先前大型美術概念圖不同，不應把它稱為已核准的正式裝備。
