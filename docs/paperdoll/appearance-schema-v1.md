# 紙娃娃角色自訂架構 V1（2026-11-21）

## 正式範圍

- 玩家在右側 **裝備** 頁面可切換 `男性／女性`，兩者都固定為 **標準型**；切換立即更換同座標七個透明圖層，且保存於既有遊戲存檔 `appearanceV1`。
- 男性沿用既有正式七層；女性由使用者確認的「馬甲線」女性設計示意擷取，保留中性、沒有性器官細節的基礎身體。兩者均使用 `64×160` RGBA PNG。
- 既有七個主圖層：`body`、`face`、`brows`、`eyes`、`hair`、`tank`、`shorts`。服裝與身體分離，不把短褲或背心畫進裸體身體圖層。
- 外觀已可設定：原有髮色、膚色預設五種（原圖/淺/暖/小麥/深）、瞳色四種（原圖紫色/藍/綠/琥珀）。顏色透過獨立 Canvas 對皮膚/瞳孔像素上色，不更改原始 PNG，也不重設玩家其他存檔。
- 性別按鈕在 `renderPaperDollGenderControls()`，其餘選項在裝備欄內可收合的 `renderPaperDollAppearanceControls()`。
- 另外有不影響正式存檔的獨立驗收頁 `paperdoll-customize-preview.html`，可切換兩種性別、穿著、顏色、透明背景與 PNG 匯出。

## 存檔格式

沿用現有 `appearanceV1`，不改遊戲存檔 key 或 `v:1`。

```json
{
  "appearanceV1": {
    "templateId": "human_male_base_v2_shirtless",
    "gender": "male",
    "bodyType": "standard",
    "hairColor": "#c8cbd0",
    "skinTone": "original",
    "eyeColor": "purple",
    "parts": {
      "hairStyle": "original",
      "faceShape": "original",
      "eyeShape": "original",
      "browShape": "original",
      "mouthShape": "original",
      "expression": "original",
      "ears": "original",
      "bodyHair": "none",
      "scar": "none",
      "tattoo": "none",
      "earAccessory": "none",
      "neckAccessory": "none",
      "tail": "none",
      "wings": "none",
      "horns": "none"
    }
  }
}
```

舊存檔沒有 `gender` 時預設 `male`，不會刪除背包、冒險事件、裝備、隊伍或角色狀態。切換性別只更動外觀欄位，非重新開局。

## 日後擴充 PNG 素材

共 15 個插槽：髮型、臉型、眼型、眉型、嘴型、表情、耳型、體毛、疤痕、紋身、耳飾、頸飾、尾巴、翅膀、角。插槽宣告在 `PAPERDOLL_FUTURE_SLOTS`。

未提供素材的選項**停用**，避免看得到選項卻沒有可用圖。新增 PNG 時：

1. 將該圖層裁成 `RGBA 64×160`、真正透明背景、角色像素與既有模板同一原點；檢查白邊、黑邊、疊合、脫下後是否還原。
2. 在 `PAPERDOLL_VARIANT_ASSETS` 的 `male`／`female` 對應插槽登記 PNG data URI。不要替換基礎圖層來模擬配件。
3. `hairStyle`、`faceShape`、`eyeShape`、`browShape` 替代對應的主圖層；`mouthShape`、`expression`、`scar`、`tattoo`、`earAccessory`、`neckAccessory`、`horns`、`ears`、`bodyHair` 為正面覆蓋；`tail`、`wings` 為身體背後覆蓋。
4. 檢查性別切換、髮色／膚色／瞳色、衣服穿脫、側包、隱私遮擋及存檔讀寫，完成外觀驗收後才標示可用。

## 目前限制

- 性別選擇已在 **遊戲裝備欄** 實作，新遊戲開場角色建立流程尚未加入此步驟。
- 除現有七層與顏色調整之外，15 個擴充插槽目前是可註冊／可存檔的架構，沒有新增對應的美術素材；不得聲稱所有造型已可自由切換。
- 女性素材來自圖像展示稿的分離擷取，和原稿像素不可能完全逐點相同，需要 iPhone Safari 的正式遊戲畫面外觀驗收。
- 原旅行套裝圖集、原側包圖片與中性身體疊加可能需要往後逐張對位，**沒有在本次擅自替換**。
