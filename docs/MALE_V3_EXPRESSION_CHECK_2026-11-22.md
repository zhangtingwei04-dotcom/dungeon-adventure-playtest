# 男性 V3 正式表情系統接續驗收｜2026-11-22

## 範圍
使用者在修復男性 V3 頭髮、眼線、眉毛及完整光頭後要求接續「表情系統」。本次只修男性 V3 的表情連接、原有睡眠狀態嘴型路由及新增一頁獨立驗收，不修改原有頭型/髮型/頭底圖、衣物/裝備、女性角色、V8/V9 比較模式與玩家存檔。

## 真實控制器原狀
`assets/expression_motion.js` 原有四個 HP 狀態：
- healthy: 開心微笑、自然眨眼；
- normal: 中性自然眨眼；
- weak: 虛弱、慢眨眼＋右額細汗；
- critical: 戰敗、原紫色圈圈眼＋右額細汗。
八種異常狀態：poison、fever、injury、dizzy、unconscious、sleep_deprived、hunger、dehydration。
睡眠包含 sleeping、nightmare_mild、nightmare_severe、nightmare_waking、dream_good、dream_smile、dream_waking，加上 drowsy、awake。活力 SP 不畫額外特效。

## 新發現與修正
1. **男性 V3 驚訝／生氣眼睛漏接**：`index.html` 原本只把 `brows` 傳給 V3 眼睛適配器，沒有傳 `frame.parts.eyes`。而 V3 有髮時眉毛需隱藏以免瀏海縫隙露出三個像素，結果「驚訝／生氣」眼睛在視覺上幾乎沒有分別。現在正式版明確傳入 `eyeExpression`。
2. **V3 眼睛表情細節**：`assets/male_approved_v3_adapter.js` 增加對 surprised、angry、shy 的小像素修飾，使用原生 64×160 眼睛層內的位置，不重新生成或替換已驗收瞳孔、眼框或睫毛；閉眼與眨眼邏輯不變。
3. **輕微／嚴重惡夢嘴型被覆蓋**：`paintPaperDollFemaleMouth` 舊有一條程式強制 `nightmare_mild` 與 `nightmare_severe` 一律 frown，覆蓋 `applySleepFacePriority()` 中原本的不同表情（輕微＝害羞/抿嘴、嚴重＝生氣/皺眉）。移除這條強制覆蓋，恢復控制器優先順序。此修正遵守共用睡眠表情控制器；女性也會依原控制器顯示不同嘴型，不更動女性素材。
4. 更新 `index.html` 引用 `male_approved_v3_adapter.js?v=5`，避免 iPhone 舊快取沿用上一版。

## 真實驗收頁
`male-v3-expression-check.html`：
- 同步展示 HP 四階段＋表情四種（驚訝、生氣、害羞、閉眼）；
- 以選單預覽睡眠、美夢/惡夢，以及 8 種異常；
- 每一種有髮及光頭並列，調用**正式遊戲的表情 JS 模組與 V3 五圖層素材**；
- 戰敗原紫色眼圈，昏迷閉眼＋頭頂右上單一旋轉黑色圈圈；
- 不讀／不寫 save、localStorage 或玩家 HP，只有 UI 預覽，方便手機驗收。

## 驗證
- GitHub main 的 `index.html`、V3 adapter、expression motion JS、QA HTML JS 語法均通過；
- 對原控制器作實際函式採樣：HP 四段 mouth / sweat / purple spiral 均符合設計；7 個睡眠情境的眼睛／眉／嘴型均有有效輸出；unconscious 讓眼睛表情停止、回復原中性嘴，取消 blink；共有 8 個異常種類；
- 12 項靜態連接/保留條件都通過；
- **不等同 iPhone Safari 真機視覺驗收**。下一步應以 QA 頁檢查有髮/光頭每種表情是否自然、是否有重影與遮擋；再針對視覺缺陷微調，不先大幅重畫頭部。
