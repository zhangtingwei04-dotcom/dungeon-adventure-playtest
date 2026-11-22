# 男性 V3 害羞表情與女性試裝版對齊（2026-11-22）

## 使用者確認事項
使用者要求「男生的害羞能和女生一樣的」，並同意按女性害羞的神韻修整。以女性現有試裝表情 assets/female_trial_expression_v1.js 的 `shy` 作為精確座標／色彩來源，**不是把女性整張臉或眼睛貼到男性臉上**。

## 程式更新
只修改 assets/male_approved_v3_adapter.js 的男性 V3 害羞分支：
- 左右對稱腮紅：女性原始 RGBA (225,141,144,170)，男性 canvas 以等效 `rgba(225,141,144,0.667)` 繪製；x23..24 和 x39..40，y42。相較舊版 x20..21/x43..44,y40，更柔和且接近女性目前版本。
- 害羞小嘴：和女性試裝相同，x31..32, y45，顏色 `#bd7964`。男性的其他嘴型不修改。
- 只在害羞時，把眼部疊圖裁切高度由 15px 擴到 16px 以涵蓋 y42 腮紅。其餘表情沿用既有 30×15 範圍，降低回歸風險。
- 男性原始五張 PNG、已核准圓頂 V2、男性眼睛、頭髮、服裝、裝備與玩家存檔完全不變。

## 版本與驗證
- 原控制器由 `assets/male_approved_v3_adapter.js?v=7` 更新為 `?v=8`，同步於正式 index.html、male-v3-expression-check.html、developer-workbench.html，避免 iPhone Safari 沿用快取。
- 已回讀 GitHub main 檢查動作與參數，JavaScript 語法解析通過。
- 模擬原適配器完整載入及 `renderEyes`、`renderMouth` 的 canvas 呼叫，確認實際畫出 x23,y42、x39,y42 的各 2×1 腮紅和 x31,y45 的 2×1 小嘴。
- 實際 iPhone 橫式裝備欄的神韻與遮擋尚需使用者目視確認。
