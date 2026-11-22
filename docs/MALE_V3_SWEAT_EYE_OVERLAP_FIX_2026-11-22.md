# 男性 V3 汗滴不再碰眼線（2026-11-22）

使用者詢問「汗水是不是流到眼睛」。確認 **是**：在上移 2px（男性 V3 起點 sweatY=26）後，男性專屬加長汗滴最後第 4 幀原本在 x38, y30..33；眼睛／眼線原始像素在 (38,33) 存在（來自原 V3 誤標眉毛的上眼線圖層，已合併至 corrected eyes），因此特效畫到右眼線。

## 精準修復
- `assets/expression_motion.js` 只針對 `sweatEyeSafe:true` 調整第 4 幀：原 `dx=1,dy=4,length=4` 改為 `dx=1,dy=3,length=3`（layout 為 `sweatLong:true` 時），最後尾端止於 y31，不會碰 y33 眼線。
- 正式 `index.html` 與 `male-v3-expression-check.html` 的男性 V3 都傳入 `{sweatY:26,sweatLong:true,sweatEyeSafe:true}`；共同控制器 cache 參數升為 `?v=2.20`。
- 前面第 1～3 幀不變；位置順序 y26、y27..29、y28..31、第 4 幀 y29..31 並變淡，維持向下移動、沒有往上回到出發位置；弱／戰敗使用相同路徑，僅播放速度不同。
- 女性、V8/V9 與其他未指定 `sweatEyeSafe` 的使用者繼續舊路徑；不修改頭型、眼睛、頭髮、嘴巴、V2 圓頂與存檔。

## 驗證
回讀 GitHub main 並以實際 `drawFaceSweat` JavaScript 函數模擬六幀繪圖矩形：原第 4 幀覆蓋 (38,33)，新版本所有幀均不覆蓋 (38,33)；弱／戰敗路徑相同，其他版本動作不變；正式頁與 QA 頁均正確載入更新後版本。實際 iPhone 顯示仍需確認。
