# 角色環境共用核心 V1

唯一運算來源：`assets/character_environment_v1.js`（DungeonCharacterEnvironmentV1）。
天氣模組只提供自然天氣及遊戲時間，exposure() 委派至角色核心；UI 只讀 snapshot() 與 rows()。

## 更新契約
- 新裝備：按物品 ID 在 gear 登記保暖、防水、防風、透氣、乾燥係數；不要依 UI 名稱或圖片判斷。
- 新天氣：由 weather.at() 傳入氣溫、風力、雨量、類型；若新增特殊降水類型，檢查 step() 的降水規則。
- 新角色/NPC：使用獨立角色物件與各自 equipmentV1 / weatherExposure；不得共用玩家存檔。核心 API 已接受角色物件，NPC 尚未接入。
- 新介面或動態：讀 snapshot() 的 thermal、wetLabel、effects，不另外計算門檻。
- 換裝前先結算舊裝備時段；換裝後同步 protection。進出室內使用上一次暴露位置結算。
- 預覽天氣、風力、光線不得改變正式暴露值；只使用自然天氣與遊戲分鐘。重複呼叫 advance() 不得重複計時。
- 保留舊存檔 wetness / comfort。過長離線區間沿用既有 48 遊戲小時結算上限。
- HP、SP、真正體溫、逐件衣服含水量、外觀特效仍未啟用；不可宣稱已連動。

## 回歸驗收
執行 `node tests/character_environment_v1.test.cjs`。
另以 iPhone 驗證角色欄、裝備欄、玩家狀態、換裝、室內休息及天氣預覽。
