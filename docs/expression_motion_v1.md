# 共用表情動態系統 v1（主角／NPC）

## 目前已接入

- 原始畫面與 64×160 透明角色分層保留；動態控制器不更改體型、衣服或存檔。
- 主角「裝備」面板使用 `assets/expression_motion.js`，由 HP 決定平時表情，並每約 3.2–6.9 秒自然眨眼（每次約 0.125 秒），眨眼不取代原本情緒。
- 開心（happy）與微笑（smile）的眼睛**保持正常睜開**；只讓嘴巴微笑，不使用閉眼笑素材。
- 表情轉換時嘴巴先切換、眉毛稍後跟上；保留像素網格，不移動或縮放頭部。
- HP：>75% 自然微笑；>50% 中性；>25% 中性加汗；≤25% 疲倦且以**眼內的小圈圈**呈現。異常狀態獨立疊加效果，不改變五官來源。
- 在裝備欄「動態表情與試演」可開關眨眼、預覽表情；預覽不會改 HP 或寫入存檔。
- `male-expression-preview.html` 提供「播放表情試演」及眨眼開關。

## NPC 共用接口

```js
// 一個 NPC 一份獨立狀態，但共用整個控制器程式。
const npcExpression = DungeonExpressionMotion.createActor({
  id: 'npc-merchant-01',
  expression: 'original',
  blink: true
});

// 事件（對話、收到禮物、突然受到驚嚇）決定心情。
// 這裡只是範例，請在真正 NPC 系統中呼叫：
npcExpression.setExpression('smile');

// 使用場景已經存在的更新循環取樣，而非每隻 NPC 開計時器。
const frame = npcExpression.sample();
// frame.parts = { brows: 'original', eyes: 'original', mouth: 'smile' }
// 將三種 part ID 對應到「該 NPC 自己」的 64×160 素材圖層，
// 'original' 使用該 NPC 預設素材；未有該素材的部位保持原狀。
```

## 原則與後續

1. 所有角色共用狀態機與表情定義；各自的眼睛、眉毛、嘴巴素材必須分開提供。**不能把男性主角的五官直接貼到女性或 NPC 身上**。
2. 每名 NPC 可有不同情緒與眨眼時刻，避免所有人同時眨眼。由同一個場景 update loop 驅動可降低手機耗電。
3. 目前女性角色尚沒有相對應的完整表情素材，保留原五官；正式把動畫套到她以前須先製作和驗證素材。
4. 將來對話嘴型、個性化微表情、睡眠與說話動畫應以額外 channel 擴充；異常效果仍要與情緒分層。
5. 本版已做 JavaScript 語法與邏輯測試；iPhone 畫面、層級與實際觀感仍需要裝置端驗收。
