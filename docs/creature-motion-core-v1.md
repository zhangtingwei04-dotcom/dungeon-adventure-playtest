# 燈火核心：生物動態 V1.0
第一階段：以 V19 苔棘鬃獸 V2 為對照，抽離純運算，不修改原始 V19 頁或正式遊戲。
- creature_rig_math_v1.js：逆向運動學、足點、身體旋轉、參數化連續蒙皮與 Canvas 繪製。
- creature_motion_core_v1.js：四足步態、跳躍、攻擊、受擊、低伏倒地、起身、撤退與附屬動態。create(profile) 可各自設定步幅、週期、地面、遠側偏移、跳躍／攻擊時間、高度與距離、轉向時間。
- moss_beast_v2_profile.js：V2 專屬蒙皮分段與座標設定。新母圖必須重新設定關節、遮罩與比例。
- creature_state_v1.js：合法轉移路徑與序列計時；不含傷害、AI、存檔或姿勢混合。
- creature_shadow_v1.js：沿用既有世界地面陰影。
- creature-motion-core-preview.html：實際消費上述模組，保留原 V19 頁。試驗序列休息→起身→警戒→落地重擊→警戒。
尚未完成：部分振幅仍是 V2 基準；遮罩／素材取樣及方向圖仍在預覽頁；不是通用 3D 骨架。V3 母版、其他骨架型、天氣、AI、戰鬥及正式畫面尚未接入。需要視覺和 iPhone 驗收。
