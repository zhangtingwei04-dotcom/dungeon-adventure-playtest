# 共用事件與存檔核心 V1
日期：2026-11-25
程式：assets/engine_events_save_v1.js
接入：index.html，既有 engine_foundation_v1.js。

事件契約：DungeonEventsV1.on(type,id,callback)、emit(type,actor,data)、appendTravel、updateTravel、discovery。訂閱ID不得重複；事件有序號、遊戲分鐘、場景及資料。旅途紀錄120則上限與相同連續紀錄防重複維持；連續探索合併沿用 updateTravel。time.advanced 由時間核心派發，travel.recorded/travel.updated 驅動既有存檔及畫面。發現事件僅首次發出。訂閱錯誤隔離並保留診斷；未接入的任務、成就、NPC及劇情不能宣稱已整合。

存檔契約：DungeonSaveV1.prepare/parse/read/write/exportText。既有 v:1 與本機鍵保留，新增 engineSave.project/schema，舊版無 metadata 由0遷移至1。未來版與其他專案標記拒絕匯入。讀取失敗保護原始資料，只有明確開始新遊戲、重開或成功解析匯入才解除。這不是自動備份或損壞修復。匯入時重新整理裝備、外觀、錢包等既有正規化流程。雲端尚未接入。

驗收：node tests/engine_events_save_v1.test.cjs、node tests/engine_foundation_v1.test.cjs、node tests/character_environment_v1.test.cjs。三套已在 JS 測試環境執行通過；iPhone 實際讀寫、匯出下載與匯入仍待驗收。CI尚未啟用。後續先完成CI與基礎層整合驗收，再建立角色生理核心。
