# 旅行長褲 V2｜新版透明圖片已匯入開發者總工作台

日期：2026-11-23
狀態：**已匯入開發者工作台，未修改正式遊戲 index.html、未動遊戲存檔，尚待 iPhone 實際視覺驗收**。

## 美術版本來源

這一版替換舊 V1 的簡化深棕色像素褲。以近期使用者確認「可以」的新生成**真正透明背景**長褲整件圖為來源：
- 男：a_clean_transparent_background_pixel_art_sprite_im.png
- 女：a_clean_isolated_pixel_art_sprite_on_a_transparent.png

按照現有男女 64×160 底模比例分別貼合，先對齊完整褲子，再把各性別拆成三張 64×160 透明 PNG（畫面左褲管、畫面右褲管、腰部＋皮帶），將六圖合為一張 384×160 透明 PNG 圖集。
此處保留新版來源的布料摺痕與暖棕色細節，但極小的像素尺寸會損失部分高解析細節，仍需使用者驗收。

## 素材與座標

- 圖集：`assets/travel_trousers_workbench_v2.js`
- 男性褲子原生佔用區：X=16..47、Y=85..139；工作台原點 (0,0)，scale 1
- 女性褲子原生佔用區：X=15..47、Y=85..139；工作台原點 (0,0)，scale 1
- 舊工作台內部欄位對應（**全部都是正面衣片**）：
  - `front` = 腰部／皮帶；男 `maleTrousersWaist`、女 `femaleTrousersWaist`
  - `side` = 畫面左褲管；男 `maleTrousersLeft`、女 `femaleTrousersLeft`
  - `back` = 畫面右褲管；男 `maleTrousersRight`、女 `femaleTrousersRight`；**back 只是既有工作台內部欄位名，不是褲子背面**。
- 原始男女底模仍由 `assets/cloak_workbench_bases_v1.js` 提供。
- 白色上衣 V3 保持男女原已定偏移：男 (-1,-1)，女 (0,-1)。
- 披風 V2 及其他物件維持原素材，不受更新影響。

## 工作台實際變更

- `developer-studio.html` 載入上述 V2 原生 PNG，男女各自三片。
- 修正背面預先繪圖規則：新褲子右褲管雖然使用舊 key `back`，仍必須放在身體與內衣**前面**，不能誤渲染到角色身體後面。
- 繪圖順序為：後景裝備 → 正式身體／短褲／背心 → 長褲左右管 → 長褲腰帶 → 白色上衣 → 披風前片 → 手臂恢復 → 表情／頭髮。
- 入口 `?tab=library&trousers=2` 開啟時強制顯示新版長褲，暫時隱藏披風，並將長褲各圖層定位回原生 0,0,1，避免舊本機試穿數據遮蔽新素材。
- 額外提供三個操作按鈕：「試穿新版旅行長褲 V2」「長褲＋披風」「脫下旅行長褲」；仍支援逐層和性別定位。
- 不刪除使用者在 IndexedDB 的舊 PNG；僅在此新版試穿網址下忽略舊長褲上傳圖片覆蓋。

## 驗證與下一步

- 已檢查 JS 語法；PNG 圖集 384×160、PNG 透明度段 `tRNS`、各 PNG 段 CRC 正確。
- 這只是內建試穿素材的靜態和編碼檢查；**尚未在 iPhone 橫式確認褲管、褲腰與白布衣接合效果**。
- 若使用者不滿意尺寸／服裝質感，先在工作台調整完整版型，重生成再拆分。正式遊戲 `starter_trousers` 目前仍不裝新圖。

[開啟新版總工作台試穿](../../developer-studio.html?tab=library&trousers=2&v=20261123-newpants)
