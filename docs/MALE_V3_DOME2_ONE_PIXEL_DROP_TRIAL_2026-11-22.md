> **2026-11-22 後續驗收更新：新版 V2 已被使用者確認「新版可以」，現已升為正式預設。** 下文保留原試驗時的歷程記錄，原來「只限 `?male-head=v3-dome2`」及「預設仍為 V1」的描述已不再適用。
>
> **最新路由**：正式預設 `?male-head=v3`＝V2；舊版修圓 V1 使用 `?male-head=v3-round1`；未修圓 5px 使用 `?male-head=v3-flat5`；2026-11-21 原版使用 `?male-head=v3-original`。正式遊戲與表情驗收頁目前均載入 `male_v3_head_dome2_trial.js?v=2`。實際 iPhone 畫面以部署後用戶查看為準。
 
# 男性 V3 頭頂圓弧 V2 試驗：最高點下移 1px（2026-11-22）

## 緣由
先前正式 5px 修圓版使用 y18/19/20/21 寬度 `10/16/20/22`。使用者覺得這次修圓不符合期待，表示希望「那個尖頂的 1px 下來 1px」，接著確認目標仍然是**圓頂**並要求「試試」。

## 本次處理：只啟用選擇性試看
- **正式預設仍保持 5px 修圓 V1，不自行替換**。
- 新增 `assets/male_v3_head_dome2_trial.js`，僅 `?male-head=v3-dome2` 載入試驗版；其他所有 URL 不受影響。
- 以獨立 `male_v3_head_base_short5_64x160_NEW.png` 為基礎，不重新生成頭顱。
- 新圓頂方案：最上方非透明像素由 y18 下移到 **y19**；y19/20/21/22 寬度分別 `12/18/22/26`，不是原來的 `10/16/20/22`。
- 所有修改都在原生 64×160 座標的 **y18..20**；從 y21 到 y159 的每個 RGBA 像素都和原先短 5px 底圖一致。眉眼／嘴巴／耳朵／下巴／脖子／頭髮／表情程式和存檔**不更改**。
- 使用者可在裝備欄實際比較，不需替換正式版本。

## 對照連結
- 新的 1px 下移圓頂試驗：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3-dome2&preview=1`
- 目前正式 5px 修圓 V1：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3`
- 舊的尚未修圓 5px：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3-flat5`
- 原始 V3：`https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3-original`

## 可驗證資訊
- 試驗 PNG：64×160 RGBA，1,383 bytes，SHA-256 `e4d25e82a40995797ae6ed3de343d6675ab5f66de19efdfcd42e512d2f313f0b`，CRC32 `51604fe0`。
- 新加的模組放在目前的 `male_v3_head_short5_roundtop_v1.js` 之後、`male_approved_v3_adapter.js` 之前。
- 已核對 main 中相關 JavaScript 語法、載入順序、URL 僅在 `v3-dome2` 啟用。
- 真實 iPhone／Safari 部署後的視覺尚未驗收。若使用者不滿意，新版可直接關閉或忽略，不影響正式預設。
