# 男性 V3 開心表情 B 版（左右對稱）｜2026-11-22

## 已確認美術決策
使用者從「開心表情 A/B/C/D」預覽中選擇 **B：含蓄嘴角**，要求「另一邊也要對稱」；批准直接改入男性 V3 正式遊戲，且維持頭型、眼睛、眉毛與銀白髮。

## 正式實作
- 修改 `assets/male_approved_v3_adapter.js` 之 `renderMouth()`：`pose==='smile'||pose==='happy'`。
- 在原生 64×160 素材上，只處理嘴巴局部：
  - 左嘴角：x30, y43，淡暖唇色 `#e5aa84`
  - 右嘴角：x33, y43，**同高度、同色值、同尺寸** `#e5aa84`
  - 中央唇線：x31–32, y44，`#b27765`
  - 以 x31.5 為中心完全鏡像對稱，保持閉嘴、自然、含蓄笑意；不再使用舊版的水平 4px 粗線、單邊上揚。
- `index.html` 的 HP 75% 以上表情狀態依舊送出 `smile`，加入 B 版文字說明；引用 V3 adapter 版本 `?v=6`。
- `male-v3-expression-check.html` 同步使用 V3 adapter v6，可對照有髮／光頭、健康／中性／虛弱／戰敗及其他表情。美夢用到 `smile` 時也沿用自然含蓄微笑。
- 未動原始 5 張 64×160 PNG 素材、膚色、眼線、眉毛、髮片、女性角色、V8/V9 及存檔。

## 驗證
- 四個 GitHub main 檔案 JS 語法解析 PASS。
- 精確核對左右嘴角原生位置 x30/y43、x33/y43，顏色相同；中心水平兩點 x31–32/y44；原本粗 4px 開心嘴已移除。
- 仍需 iPhone Safari/Webview 實機畫面驗收（程式語法和靜態畫素對照並不能取代手機視覺確認）。

## 預覽
- `https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/male-v3-expression-check.html?v=6`
- `https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3&smile=6`
