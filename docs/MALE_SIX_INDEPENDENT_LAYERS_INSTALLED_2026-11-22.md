# 《迷宮盡頭的燈火》男性六零件｜正式遊戲接入紀錄（2026-11-22）

## 本次使用者要求
使用者同意將目前分開生成的男性：光頭、眉毛、眼睛、鼻子、嘴巴、銀白亂髮**直接用於遊戲**。本次不重生圖、不改女性、紙娃娃身體、裝備、存檔及正式表情架構。注意此為**最新一次使用者確認**，先前由不相符頭型產生的男性五層候選已淘汰。

## 實際修改（GitHub main）
- **新增** `assets/male_new_six_layers_20261122.js`：使用原先六張 793×1983 獨立透明 PNG，先去掉極弱透明邊緣並精準縮放到**相同 64×160** 原生畫布；原素材本身不是相同來源座標，不能直接全疊。
- **修改** `index.html`：在 `male_v3_head_dome2_trial.js` 與 `male_approved_v3_adapter.js` 之間載入上述新素材；一般 `?male-head=v3` 和未指定版本時使用新版男性外觀。
- **保留** `assets/male_approved_v3_layers.js`、`assets/male_v3_corrected_layers_v2.js`、短頭頂版與圓頂 V2 原檔。透過 URL 參數可立即對照／回退到以前核准的男頭。
- V3 adapter 仍使用既有表情、HP、裝備與紙娃娃系統；這次只替換**男性的來源頭部五層像素**，非重寫表情引擎。

## 新頭部座標
所有圖層共用 64×160 RGBA PNG，原點固定、脖子及下巴不平移。

| 獨立來源零件 | 原生像素範圍（x, y, 寬, 高） | 載入方式 |
|---|---|---|
| 光頭底圖 | 15,14,34,37 | head_base |
| 眉毛 | 20,30,24,2 | eyebrows |
| 雙眼 | 21,33,22,7 | eyes |
| 鼻點 | 32,42,1,1 | nose（與 head_base 預先合成以相容既有五層渲染） |
| 中性嘴巴 | 30,44,4,1 | mouth |
| 銀白髮片 | 7,1,50,42 | hair_standard |

渲染採 `head_base_game`（頭底圖加鼻點）＋眉毛＋眼睛＋嘴巴＋頭髮，順序保持舊 V3 架構；在 JS 模組 `DungeonMaleNewSixV1` 中仍可獨立讀取鼻點。沒有疊兩次鼻點。

原來源檔仍保存在本次聊天容器 `/mnt/data/` 的中文 PNG（六張），此次產生完整 64×160 PNG、合成與比較圖在 `/mnt/data/male_generated_six_layers_integrated_v1/`，可另下載素材包。原來源文件**尚未全部上傳 GitHub 為獨立 PNG 檔**，目前在 GitHub JS 模組裡是各自獨立 PNG data URI。

## 測試與回退
- **新版正式遊戲**： https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3&v=20261122-6
- **原本批准的男頭圓頂 V2**： https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3-old-dome2&v=20261122-6
- **最舊 V3**： https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v3-original
- **原 V9**： https://zhangtingwei04-dotcom.github.io/dungeon-adventure-playtest/?male-head=v9

已對 GitHub 回讀的新模組所有六份 base64 PNG 驗證 PNG 標頭、64×160 尺寸、所有 PNG chunk CRC 與 IEND；JS 語法與切換參數模擬通過；確定 `index.html` 新腳本載入位於 V3 adapter 前。

**尚未實際完成 iPhone Safari 的遊戲畫面與表情狀態驗收**。若新版頭部或表情不協調，可直接用回退參數對照。若使用者不滿意，應保留已核准舊男頭，不要重繪其餘身體與女性角色。
