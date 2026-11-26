# 燈火核心系統｜調查與物件卡片 V1.0.0

## 共用模組
- assets/investigation_cards_v1.js，登錄 ui.investigation-cards。
- create() 接收 DOM 查詢、共用對話、行動、刷新及通知回呼；不直接更改背包或生成規則。
- investigationCardData(node)：從場景物件的識別與狀態建立卡片資料。
- appendInvestigationCards(parent,items,append)：共用卡片渲染、操作定位、圖片備援。
- rememberDepartedAnimal(actor,o,info,reason) 與 departedAnimalCards(actor,live)：離場紀錄、回場去重、場景隔離。

## 圖片及介面
優先使用實際場景圖片，樹枝裁除透明邊緣，現有 canvas 素材可直接複製，無獨立素材使用場景局部或全景預覽。保持原小格 34 × 28 px。圖像或卡片樣式不改變遊戲行為。

## 場景接入規則
11 個現有地點經 renderSceneActionView 呼叫共用模組。馬車分類及各地點事件入口保留於 index.html 的場景配置，不在模組重複。新場景的可調查物件應以唯一 objectId、物件名稱、圖片或 canvas、狀態與既有互動回呼接入；主要行動及事件仍在右下。

## 驗證
7 項資料及離場邏輯測試，主頁三段 JavaScript 語法檢查；手機及各場景畫面待驗收。離場紀錄目前仍以破損馬車中因靠近而離場的生物為主，未擴張新玩法。
