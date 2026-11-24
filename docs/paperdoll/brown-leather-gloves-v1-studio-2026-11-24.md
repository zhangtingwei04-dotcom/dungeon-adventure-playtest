# 《迷宮盡頭的燈火》｜棕色皮革手套 V1 正面試穿

日期：2026-11-24（台灣時間）
狀態：**已安裝開發平台 `developer-studio.html`，尚未安裝正式遊戲**；等待使用者 iPhone 畫面驗收。

## 素材來源與組裝

使用使用者本輪已生成的兩張原創棕色皮革手套像素圖，不再重畫：
- 男性：`像素風棕色皮革手套組.png`，深棕皮革、短翻折袖口、金屬扣，左／右各一隻。
- 女性：`像素風棕色皮革手套配金色扣飾.png`，略短的棕皮金扣樣式，左／右各一隻。

從兩張 793×1983 透明原圖分離左右手套，用最近鄰縮放保留像素風，再把各一對手套固定在原生 64×160 正面畫布中，其餘區域保持透明。不使用背面／側面層，也**不修改**原底模、原始手掌、V13 袖子、V2 披風／長褲、V4 鞋、已核准側包或正式存檔。

| 角色 | 左手像素框 | 右手像素框 | 寬高 |
|---|---|---|---|
| 男性 | X6–16, Y81–97 | X47–57, Y81–97 | 各 11×17 |
| 女性 | X7–16, Y83–97 | X47–56, Y83–97 | 各 10×15 |

產物：
- 素材 JS：`assets/travel_gloves_front_v1.js`；
- `DungeonTravelerGlovesWorkbenchV1.build()` 以 128×160 透明 PNG 圖集拆為男性／女性各一張 64×160；
- `starter_gloves` 原有 ID 保留，`slot='hands'`、`layers=['front']`、男女各自的 `front` 內建圖源及 X/Y/Scale/Z（預設 X0/Y0/Scale1/Z65）已接入工作台；
- 手套可與 V13 長袖、V2 披風和側包共存。工作台 `DungeonArmVisibilityPolicyV1` 自動把 `hands` 類別的目前穿戴素材納入披風及包身的局部透明遮擋；
- 新增「戴上 V1 棕色皮革手套（男女）」、「脫下手套」按鈕，網址加入 `&gloves=1` 可直接預覽。
- 男、女素材互不共用實際 PNG，各自可以拖曳調整圖層位置、縮放與 Z；同一對手套目前同在一張 `front` 圖層中，調整會同時移動該角色的左右手。未增加獨立手指或背面素材。

## 試穿連結

`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/developer-studio.html?tab=library&preset=v13-outer-bag-y10&boots=1&gloves=1&v=gloves-v1-preview-20261124`

**檢驗：** 14／14 項程式、素材引用、男女圖集切分、試穿控制、手部策略參與與 JavaScript 語法檢查通過；PNG 128×160、5 段 CRC 通過，透明畫布生成成功。這不代表已由使用者在 iPhone Safari 視覺驗收。正式 `index.html` 未修改、遊戲存檔未更動。

後續若手套袖口過高、太寬或手掌偏移，先讓使用者在工作台微調再匯出 JSON；確認後才移至正式遊戲。


## 2026-11-24 更新｜手套左右手獨立調整（最新有效狀態）

使用者明確同意以「單一 front PNG 搭配各自的 handOffsets」方式，並指示直接修改開發平台。現在已正式更新 GitHub `main` 的 `developer-studio.html`。

- **素材不變**：仍使用本文件最初生成的男性、女性 V1 正面雙手套各一張 64×160 PNG；與 V4 皮靴相同，Canvas 繪圖時將 x0–31、x32–63 分成兩半，獨立以各半原錨點 (16,80)、(48,80) 做位移與等比縮放。預設每隻 `{x:0,y:0,scale:1}` 時，像素畫面位置完全與未拆分前相同。
- **UI**：選中 `starter_gloves` 的 `front`，顯示「左手套」、「右手套」兩個按鈕，X/Y/Scale／微調箭頭／畫布拖曳／「重設此圖層」均只作用於目前選取的手；可以點角色 Y65–120 的左／右半部直接選手。手套共同維持 Z65 的一個 front 裝備圖層，不建立 side、back 或第二個裝備槽。
- **資料儲存**：新增 `gloveHandOffsets.male.left/right` 與 `gloveHandOffsets.female.left/right` 本機設定、`editingGloveHand` 目前選取記錄。 `dungeon-character-asset-library-v1` JSON 匯出內容於手套正面層新增 `handOffsets:{left:{x,y,scale},right:{x,y,scale}}`，匯入也能恢復；舊 JSON 沒有 `handOffsets` 時可正常繼續以 0/0/1 預設操作。
- **衣袖／披風／側包**：`getVisibleArmGarments()` 現在會以 Canvas 將**最新左右手套 offset 後的像素**合成再送入 `DungeonArmVisibilityPolicyV1`，避免手套移動後披風仍按照原始位置做透明遮擋。原本的 V13 長袖、披風、側包、角色原手掌／頭部和 V4 皮靴及其設定均未更改。
- **重置**：選手套按下單層重置，只重置那隻手套；全體「恢復已確認服裝位置」才重置四隻手套的額外偏移。
- **測試結果**：19／19 項回歸檢查通過，包括直接執行繪圖函式核對初始雙手像素位置、僅左手 X+3/Y-2/Scale0.8 且右手不動、男女互不影響、鞋子渲染不變、左右控制／存檔／JSON／遮擋／JS 語法。屬於程式測試；未代替使用者 iPhone Safari 實際試穿。

直接開啟試穿（原有 `preset` 會帶回 V13 長袖、披風、側包及 V4 皮靴配置；手套再由 `gloves=1` 開啟）：

`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/developer-studio.html?tab=library&preset=v13-outer-bag-y10&boots=1&gloves=1&v=gloves-independent-hands-20261124`

**正式遊戲 `index.html` 並未因本次改動安裝手套**；試穿驗收通過後才可正式放入。


## 2026-11-24｜使用者最新 JSON：男女左右手套定案試穿座標

使用者貼上最新 `dungeon-character-asset-library-v1`（64×160、`independent-dev-preview`），相對上一版的主要新內容為**男、女左右手套已分別微調**。精確設定如下：

| 角色 | 手套 | x | y | scale |
|---|---|---:|---:|---:|
| 男性 | 左手 | -1 | +1 | 1 |
| 男性 | 右手 | +1 | +1 | 1 |
| 女性 | 左手 | -2 | -1 | 1 |
| 女性 | 右手 | +1 | -1 | 1 |

`starter_gloves` 保留一張 64×160 真透明正面雙手套圖／性別、單一 `front` 層。男女前層 `x=0,y=0,scale=1,z=65,visible=true`，左右各自儲存於 `layers.front.handOffsets`。對應內建 key 分別是 `maleTravelerGlovesFront`／`femaleTravelerGlovesFront`，**不新增 side/back 圖層**。

已同步到 `developer-studio.html` 的 `applyLatestUserV13JsonPreset()`；點「套用最新 JSON｜完整穿搭＋獨立左右手套」，或用 `?preset=v13-outer-bag-y10&gloves=1` 的試穿連結，即可重現上述座標。預設選取手套的左手，右手仍可獨立編輯；手套左右位置不因另一隻操作而重置。

其他輸出的已確認設定保留：男性 V4 皮靴左右 `(+1,+11,0.8)`／`(-1,+11,0.8)`、女性皮靴 `(+1,+4,0.9)`／`(-2,+4,0.9)`；V13 長袖（外罩式）、V2 長褲、披風前片 Y=-6、附魔側包前片 Y=-10 與原有頭部不變。

測試：以真正的預設函式執行男女四隻手套、四隻皮靴、顯示狀態、Z65、V13 長袖／披風／背包及資料匯入匯出狀態，**20／20 項通過**。此為程式與配置測試，不能代替 iPhone Safari 的實際視覺確認。

**正式遊戲 `index.html` 仍然沒有安裝手套素材**，本次使用者僅提供更新後的開發平台 JSON，沒有要求將手套晉升至正式遊戲。


## 2026-11-24｜正式安裝 V1 棕色手套（本文件最新狀態）

使用者審核完獨立左右手套位置後明確指示「加到遊戲中」，現已將 `assets/travel_gloves_front_v1.js` 加載到正式 `index.html`（GitHub `main`）。

正式遊戲現在已經**不再是「未安裝」狀態**；上文的舊「僅在開發平台試穿」敘述均為歷史紀錄。

| 性別 | 左手套 handOffsets | 右手套 handOffsets | 共用層 |
|---|---|---|---|
| 男性 | x=-1, y=+1, scale=1 | x=+1, y=+1, scale=1 | front z65 |
| 女性 | x=-2, y=-1, scale=1 | x=+1, y=-1, scale=1 | front z65 |

- **素材與視覺：** 男女各一張 **64×160 真透明正面雙手套 PNG**，不更動原本生成圖、不增加背面或側面圖層。每張前層 PNG 在渲染時分別遮取左半／右半，對其原始 X16/X48、Y80 錨點施加使用者確認的 X/Y/Scale；共用一個 `starter_gloves` 手部裝備槽。正式圖層類別 `paperdoll-gloves-front`。
- **裝備／存檔：** 沿用 `STARTER_OUTFIT_V2.hands=starter_gloves` 與 `equipmentV1.hands`、`owned`。新遊戲初始裝備、舊存檔已有手套的穿脫／保存狀態不變。穿戴才顯示，脫下立即隱藏；洗浴／更衣場景不顯示。在遊戲網址加 `?gloves=off` 可暫時隱藏手套圖片除錯，不會更改裝備或存檔。
- **遮擋：** 遵循正式 `DungeonArmVisibilityPolicyV1` 與 `DungeonLiveArmVisibilityV1`。先用原版男女素材在記憶體中組合成 64×160、含四組獨立手套偏移的透明遮罩，再交給既有披風前片／側包下包身的遮擋處理。手套與 V13 袖口／披風／背包前後關係正確整合；不更動已核准的舊 PNG，且手套脫下後不會再把手套送入遮擋覆蓋集合。
- **其他已核准素材：** V13 長袖、V2 旅行長褲、V4 旅行靴（男左+1/+11/.8、男右-1/+11/.8、女左+1/+4/.9、女右-2/+4/.9）、V2 披風／側包定位、頭部表情、原底模及現有存檔 schema 保留。
- **工作台：** `developer-studio.html` 仍可左右手分開拖曳、縮放、匯出 `handOffsets`。工作台後續新調整不會自動改正式遊戲，需另行確認。

### 驗證範圍

已完成 **17／17** 正式檔案、圖像 CRC、存檔與層次靜態檢查、**14／14** 真正正式 `equipmentGuideHTML()` 的男女／穿脫／浴室及素材缺失行為測試、**10／10** 64×160 動態手套遮罩與當前裝備圖層驗證，總計 **41／41 通過**。正式版全部 35 個外部 JS 路徑存在、沒有引用缺檔，主遊戲及新素材語法檢查通過。

此結果代表代碼與功能流程檢查，**尚未等同於在 iPhone Safari 完成實際視覺驗收**。如發現手套顏色、遮擋或位置不合適，請以手機畫面回報，先在開發平台分別微調再同步。

正式版：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?v=approved-gloves-v1-20261124`
