/* B: accident-scene composition; original author-approved data remains intact. */
(function(){const base=window.DUNGEON_FOREST_V4_LAYOUT;if(!base?.scenes?.wreck)return;const overrides={
  "v4-wagon0": {
    "x": 30.8,
    "y": 71.0,
    "width": 37,
    "rotation": 4
  },
  "v4-crate_large1": {
    "x": 56.2,
    "y": 83.2,
    "width": 8.2,
    "z": 21,
    "rotation": -9
  },
  "v4-crate_small2": {
    "x": 43.5,
    "y": 72.7,
    "width": 4.2,
    "z": 17,
    "rotation": 13
  },
  "v4-barrel4": {
    "x": 61.7,
    "y": 65.2,
    "width": 8.4,
    "z": 1,
    "rotation": 0,
    "artVariant": "barrel-side"
  },
  "v4-crate_open5": {
    "x": 47.5,
    "y": 74.2,
    "width": 8.4,
    "z": 12,
    "rotation": -9
  },
  "v4-sack6": {
    "x": 51.5,
    "y": 70.9,
    "width": 4.5,
    "z": 13,
    "rotation": 28
  },
  "v4-wheel_flat7": {
    "x": 31.5,
    "y": 88.8,
    "width": 13,
    "z": 24,
    "rotation": 13
  },
  "v4-plank8": {
    "x": 43.3,
    "y": 86.1,
    "width": 7.6,
    "z": 11,
    "rotation": -18
  },
  "v4-plank_lean9": {
    "x": 43.4,
    "y": 73.2,
    "width": 4.3,
    "z": 4,
    "rotation": -13
  },
  "v4-grass_a10": {
    "x": 23.2,
    "y": 70.5,
    "width": 9,
    "z": 8
  },
  "v4-grass_b11": {
    "x": 34,
    "y": 71.5,
    "width": 7,
    "z": 8
  },
  "v4-rabbit16": {
    "x": 84,
    "y": 68,
    "width": 4.2
  },
  "v4-purple_flower13": {
    "x": 85,
    "y": 81,
    "width": 4.2,
    "rotation": -5
  },
  "v4-white_flower14": {
    "x": 25.4,
    "y": 82.2,
    "width": 4.3
  }
};
window.DUNGEON_FOREST_V4_ORIGINAL_LAYOUT=base;
window.DUNGEON_FOREST_V4_ACCIDENT_LAYOUT={...base,layoutVariant:'accident-b',scenes:{...base.scenes,wreck:base.scenes.wreck.map(o=>({...o,...(overrides[o.id]||{})}))}};
if(!/(?:^|[?&])layout=original(?:&|$)/.test(location.search))window.DUNGEON_FOREST_V4_LAYOUT=window.DUNGEON_FOREST_V4_ACCIDENT_LAYOUT;
})();
