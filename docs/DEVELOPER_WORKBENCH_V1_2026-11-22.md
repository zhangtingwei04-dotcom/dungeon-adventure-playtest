# 《迷宮盡頭的燈火》開發者工具台 V1（2026-11-22）

入口：https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/developer-workbench.html

此工具台僅供《迷宮盡頭的燈火》使用，與《鱗片與種子：地下生態物語》及歐姆計劃的素材、版本、存檔互不共用。以 iPhone Safari／橫式操作為設計重點，也支援直式與桌面瀏覽器。

## 素材來源與定版狀況

- 男性原始母版：assets/male_approved_v3_layers.js。
- 男性已核准 V2 圓頂：assets/male_v3_corrected_layers_v2.js、assets/male_v3_head_short5_v1.js、assets/male_v3_head_short5_roundtop_v1.js、assets/male_v3_head_dome2_trial.js（預設），以及 assets/male_approved_v3_adapter.js。
- 男性 HP／表情：assets/expression_motion.js?v=2.20；汗滴使用 sweatY=26、sweatLong=true、sweatEyeSafe=true，不接觸右眼線。
- 女性正式母版／銀白髮：assets/female_parts_v2.js。
- 女性試驗光頭：assets/female_bald_candidate_v1.js（從已接受的參考圖提取，仍未正式安裝）。目前髮片試排基準 x=-2、y=-5，回應最後一次「再往左」要求。
- 以上皆以來源檔直接顯示，不自動重畫或覆蓋已核准素材。

## V1 已提供的功能

1. 角色工坊：男女頭型版本切換、光頭和有髮、真正像素放大、像素格線、中心與眼線輔助線。
2. 女性銀白髮像素對位：↑↓←→ 每次移動 1px；改變的是圖層座標，不會縮放或重新生成髮束。
3. 男性表情：四階段 HP、常用情緒、汗滴幀與圈圈眼，沿用既有表情控制器；完整睡眠與異常狀態仍使用獨立 QA 頁。
4. 前後對照：原有頭像與目前調整頭像，以及 64×160 合成 RGBA 差異像素數（包含五官、髮片、動畫，不代表純輪廓差異）。
5. 匯出：合成透明 PNG、頭部底圖 PNG、髮片 PNG、兩版對照 PNG、設定 JSON、複製 JSON。
6. 本機儲存：獨立設定鍵 dungeon-dev-workbench-v1；只有按「儲存本機設定」才寫入，與遊戲存檔分離。
7. 快速入口：正式遊戲、男女 QA、頭頂高度對照及 GitHub 原始碼。

## 安全與限制

- GitHub Pages 是公開靜態網頁，這不是有身分驗證的私人管理後台。不可在頁面保存 Token、API Key 或任何不願公開的秘密素材。
- 此版本沒有 GitHub Token、直接提交程式、雲端同步或修改遊戲存檔的能力；匯出 PNG／JSON 不是自動安裝。
- 女性眼睛、眉毛和嘴巴仍須獨立拆層，不應套用男性的動畫圖層。
- 工具台不依賴外部 CDN，也不更動正式 index.html 的角色設定。
- 完成來源校驗、36 個 HTML 控制項參照檢查、內嵌 JavaScript 語法檢查及模擬 DOM 煙霧測試（男女切換、1px 左移、分頁、HP、儲存與匯出入口）；尚未在真實 iPhone Safari 做完整視覺驗收。

## 後續可能擴充（尚未實作）

女性表情拆層、全身裝備欄即時角色畫面、真正的單像素塗改與 Undo、差異熱圖、可供 GitHub 開發流程核准後套用的版本清單。必須先保存母版並與現有測試分開。

## 披風貼合專用工作台（2026-11-22 新增）

- 獨立入口：`cloak-fitting-workbench.html`，已加入原開發者工具台頂部「披風貼合」入口。
- 從正式 `index.html` 的目前源碼逐位元組保留男女 `body/tank/shorts` 64×160 PNG，建立僅供工具台使用的 `assets/cloak_workbench_bases_v1.js`，不改動角色母版或既有遊戲存檔。
- 披風素材：`assets/traveler_cloak_trial_v1.js`，男女各有前後兩層。工具台同時顯示男女各自的「未穿／穿上」對照，可開關前層、後層、髮型、肩頸基準線，披風 X/Y 各可調 ±8 px，不縮放底模。提供 256×160 男女對照 PNG 與四張 64×160 圖層拼貼匯出。
- 正式遊戲現在**預設不顯示此尚未核准的披風美術**。若需測試遊戲層疊，可明確使用 `?cloak=trial` 暫時顯示；穿脫邏輯、裝備欄、背包與人物外觀均不受影響。工作台調整不會直接更新遊戲。
- 原本開發者工具台的角色與表情功能照常；披風工作台為獨立頁面，避免破壞既有的頭部預覽。尚待使用者在 iPhone 實機驗收。
