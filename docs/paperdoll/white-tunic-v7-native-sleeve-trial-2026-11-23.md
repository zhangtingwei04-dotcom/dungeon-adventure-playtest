# 白色初始布衣 V7｜四張原生透明袖片的工作台驗收

日期：2026-11-23
專案：《迷宮盡頭的燈火》

## 狀態
使用者確認了 V7 男女完整長袖穿著圖的**美術方向**（「好」），本次依原本 V3 的肩膀、原生座標與該 V7 概念重新取樣與繪製符合工作台尺寸的四張獨立袖片。**工作台測試版；非 iPhone 正式視覺驗收；未修改 `index.html`。**

## V7 透明袖片
資料：`assets/sleeve_replacement_workbench_v7.js`
- 透明 RGBA PNG atlas 256×160，各切成一張 64×160：`maleV7SleeveLeft`、`maleV7SleeveRight`、`femaleV7SleeveLeft`、`femaleV7SleeveRight`。
- 男性左袖 alpha 邊界 X9–22／Y53–89；右袖 X42–55／Y53–89。
- 女性左袖 X10–22／Y52–88；右袖 X42–54／Y52–88。
- 原 V3 領口與衣身完全保留；肩部取自 V3 像素，延長前臂褶皺與袖口依核准 V7 設計圖和 V3 色票繪製。**不能將生成的完整人物概念圖直接當成 64×160 的原始人物底模。**

## 工作台
檔案：`developer-studio.html`
- 新增 `starter_sleeves_v7` 工作台裝備：側片 `side` 是畫面左袖，`front` 是畫面右袖。
- 男、女、左右袖各有獨立 transform：預設 X(-1／0)、Y-1、Scale 1、Z(43／44)。可用目前工作台 pointer drag 或數值輸入來調整，設定依裝置本機儲存。
- V7 啟用時停用原 V3 左右短袖及 V4/V6 舊試驗；但原 V3 衣身與原始數據、圖片完全保留。當 V7 關閉，原 V3 短袖重現。V6 仍可透過原按鈕單獨測試。
- 重新恢復已確認服裝位置會關閉 V6/V7。
- `starter_cloak` 的手臂像素補畫遮罩現在會讀取 V7 袖片**各自目前的座標與透明度**，避免把皮膚蓋在袖片前面。原披風 PNG 和各裝備圖層沒有改動。
- 本次不修改遊戲正式圖檔、`index.html`、玩家存檔、已確認長褲、背包等裝備。

## 手機試穿
https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/developer-studio.html?tab=library&shirtSleeves=7&v=v7-approval-test

先檢查男女各左右肩膀、手肘、袖口和手掌，以及不穿披風／穿披風的遮擋。如果不滿意，按「恢復原版短袖 V3」即可切回，不要擅自提升為正式遊戲版本。

## 驗證
- 原生四片 PNG 實際 alpha 邊界、真透明與 atlas 尺寸；PNG 各段 CRC 皆正確。
- GitHub main 回讀、工作台 inline JS 語法、獨立座標映射／拖曳連線、V3/V6 回退、穿脫控制、披風皮膚遮罩關聯均通過程式檢查。
- **iPhone 視覺實測尚未完成；手臂／布料自然程度仍須使用者確認。**
