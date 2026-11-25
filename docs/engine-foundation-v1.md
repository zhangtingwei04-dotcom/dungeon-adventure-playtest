# 共用引擎基礎 V1
日期：2026-11-25
核心檔案：assets/engine_foundation_v1.js
依據：docs/shared-game-engine-roadmap.md 第一階段。

## 模組註冊中心
DungeonEngineV1.register({id,version,requires,available})；重複 ID 拒絕，status() 會檢查模組是否存在及依賴是否就緒。onTime(id,callback) 每模組只可登記一次，按依賴順序派發。故障會留下診斷並隔離其他模組，並非整筆交易回滾。遊戲設定 → 共用核心診斷可查看已註冊模組、時間接入及最近錯誤。僅登記目前主要模組，尚未涵蓋全部美術及工具腳本。

## 時間契約
DungeonGameTimeV1.normalize / parts / format / advance / nextMorning。存檔繼續使用 worldMinutes，沒有新平行時鐘。所有正式時間推進經由 advanceGameTime 或 advanceToNextMorning；禁止直接修改 s.worldMinutes。時間事件包含 from、to、minutes、reason、fromScene、toScene、daysCrossed、before、after；0 分鐘不派發，拒絕負數與小數。預覽不推進正式時間。
探索與互動、步行或馬車旅行、20 分鐘短休、隔日 08:00 已遷移。角色環境依出發地點結算，抵達後原存檔流程同步新環境；甲蟲照護跨日更新。現有存檔與渲染仍保留防重複結算的相容路徑。天氣與地表歷史仍由既有 weather.at 依時間推導；不新增飢餓或 SP 消耗。

## 驗收
node tests/engine_foundation_v1.test.cjs
node tests/character_environment_v1.test.cjs
另需在 iPhone 實測探索、休息、旅行、跨日、預覽、匯入舊存檔及診斷面板。事件中心、存檔遷移中心與自動 CI 尚未完成。
