# 《迷宮盡頭的燈火》｜舊長袖與舊頭部試驗清理（2026-11-24）

## 目標與保護範圍
依使用者要求，減少不再使用的長袖版本與過時頭部試驗，**保留目前遊戲使用的頭部、V13 長袖、V3 白衣、披風、背包及其配置**。只修改《迷宮盡頭的燈火》儲存庫，未涉及《鱗片與種子》。

本次清理前代碼可由 Git 歷史取得。清理前主要版本參照：`5f5964c7f037fe7bccc252a5865edd6f92d0ebce`（當時包含完整舊素材）。

## 已完成：開發者總台精簡
- `developer-studio.html` 從可選裝備清單移除 8 個舊上衣素材 ID：`starter_long_sleeves_v4`、`starter_sleeves_v6`、`starter_sleeves_v7`、`starter_long_tunic_whole_v9`、`starter_tunic_layered_v10`、`starter_tunic_layered_v10_sleeves`、`starter_tunic_layered_v12`、`starter_tunic_layered_v12_sleeves`。
- 移除六支舊長袖工作台 JS 的預載、舊版按鈕與對應過時切換處理，保留 V13 的外罩／自然垂放／紮入式切換。
- 載入舊工作台本機設定或匯入歷史 JSON 時，排除上述舊素材；儲存工作台設定時清除其舊版 `shown/transforms/layerShown/wearModes` 鍵，但**不會刪除使用者自行匯入的 IndexedDB PNG**。
- 保留 `applyLatestUserV13JsonPreset` 配置（男女 V13 外罩，背包前片 `Y=-10`）與 `drawSatchelBehindHands`（包身在披風外、原手掌後），原始角色和裝備圖未重畫。

## 已實際從 main 刪除的檔案
### 無依賴的過時長袖來源（5）
- `assets/long_sleeves_workbench_v4.js`
- `assets/sleeve_replacement_workbench_v6.js`
- `assets/whole_long_tunic_trial_v9.js`
- `assets/long_tunic_layered_v10.js`
- `assets/long_tunic_front_sleeves_v12.js`

### 未被現有 HTML 頁面載入的男性頭部試驗（3）
- `assets/male_shared_female_face_v5.js`
- `assets/male_merged_head_v6.js`
- `assets/male_v3_head_short3_v1.js`

上述源檔在 Git 歷史仍能回復；刪除只是現行 `main` 的工作樹清理，**不代表 Git 歷史物件立即釋放空間**。

## 暫時保留、不可誤刪
- `assets/natural_long_tunic_v13.js`：現役開發長袖正面與袖片。
- `assets/white_shirt_workbench_v3.js`：V13 的正面衣身是由原 V3 的像素來源取出，仍有直接依賴。
- `assets/sleeve_replacement_workbench_v7.js`：已從開發者總台清單移除，但 **arm-fit-diagnostic / arm-horizontal-scan / arm-manual-measure** 尚引用此檔；因此暫不刪，以免手臂測量頁失效。
- `assets/female_parts_v2.js`、`assets/male_v3_head_dome2_trial.js`、`assets/male_approved_v3_layers.js` 等：正式遊戲或現有預覽頁有實際引用，不能視為死檔。
- `assets/male_head_master_v1.js`：僅舊版頭部專用預覽會載入，該預覽仍由歷史開發工具連結；暫保留以避免斷連。
- 正式遊戲 `index.html`、玩家存檔與目前有效的表情／頭部系統未改動。

## 驗證
- 已透過 GitHub `main` 的完整檔案樹確認 8 個目標檔案消失、V13 與現役頭部仍存在。
- `developer-studio.html` 和正式遊戲 `index.html` 的所有 `assets/*.js` 指令碼引用均可在目前檔案樹找到（**0 個缺檔引用**）。
- 兩頁的內嵌 JavaScript 語法檢查均通過。
- 已確認開發者總台現有 V13、披風、長褲、背包和手掌前後遮擋程式仍在。
- **尚未使用 iPhone Safari 做實際畫面與操作回歸驗收。**

## 需要注意
舊版研究文件中的歷史路徑可能仍指向清理前的檔案；請透過清理前 Git commit 查閱。若未來還要移除其餘舊頭部預覽，先把所有正式遊戲與開發診斷工具依賴遷走再刪，避免破壞目前頭型和表情系統。
