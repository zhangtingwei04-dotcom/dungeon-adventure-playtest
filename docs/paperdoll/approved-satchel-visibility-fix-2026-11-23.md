# 已核准旅行側包在裝備欄消失 — 顯示修復（2026-11-23）

## 原因
正式遊戲 `index.html` 保留原有已核准背包來源 `EQUIPMENT_APPROVED_BAG_IMAGE`、物品 ID `enchanted_satchel`、穿戴存檔 `equipmentV1.bag` 與 CSS `.paperdoll-approved-bag`。
但先前為了停用未核准的「舊裝備整套圖鑑」設定 `LEGACY_EQUIPMENT_ART_ENABLED=false`，被錯誤地共用到背包渲染條件。背包因此在資料上仍為已穿戴、圖片也存在，紙娃娃畫面卻沒有產生對應的背包圖層。

## 修正
- 保留 `LEGACY_EQUIPMENT_ART_ENABLED=false`，不要重新打開未核准的長褲、鞋子、上衣等舊裝備美術。
- 將背包輸出條件改成 `!privateScene && show('bag')`，恢復既有 `paperdoll-approved-bag` 元素和 `EQUIPMENT_APPROVED_BAG_IMAGE` 圖片。
- 保留先前核准的背包相對角色位置（原 CSS `translateY(-2px)`）、穿戴／卸下按鈕、正式遊戲存檔格式與 `enchanted_satchel` ID。
- 原有 V3 白色上衣與披風 V2 圖層不變。
- 浴室或更衣場景仍不顯示外穿背包。

## 驗證
- 已做靜態檢查：正式遊戲主腳本 JavaScript 語法通過、已核准背包圖源和 CSS 存在、背包渲染條件可在穿戴時成立、未核准舊裝備仍停用、V3 白布衣和披風資源仍被載入。
- 待使用者在 iPhone 橫式實機確認「穿上背包顯示／脫下消失／搭配白布衣與披風時位置正確」。
- 若只有穿上披風時背包被遮住，需另分析遮擋順序；本次沒有重新生成背包圖片。
