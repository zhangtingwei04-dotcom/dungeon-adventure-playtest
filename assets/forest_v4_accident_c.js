/* Accident C: refine B without changing original source assets or object IDs. */
(function(){
 const b=window.DUNGEON_FOREST_V4_ACCIDENT_LAYOUT;
 if(!b?.scenes?.wreck)return;
 const overrides={
  "v4-wagon0": {
    "x": 30.8,
    "y": 72.2,
    "width": 37,
    "rotation": 2
  },
  "v4-plank_lean9": {
    "x": 42.6,
    "y": 74.4,
    "width": 3.8,
    "z": 4,
    "rotation": -8
  },
  "v4-wheel_flat7": {
    "x": 34.6,
    "y": 86.8,
    "width": 11.3,
    "rotation": 8
  },
  "v4-crate_large1": {
    "x": 48.8,
    "y": 79.4,
    "width": 7.2,
    "rotation": -5
  },
  "v4-crate_small2": {
    "x": 44.6,
    "y": 73.8,
    "width": 3.8,
    "rotation": 8
  },
  "v4-crate_open5": {
    "x": 46.4,
    "y": 75.2,
    "width": 7.6,
    "rotation": -6
  },
  "v4-sack6": {
    "x": 49.5,
    "y": 72.8,
    "width": 3.9,
    "z": 13,
    "rotation": 12
  },
  "v4-plank8": {
    "x": 41.8,
    "y": 84.9,
    "width": 6.8,
    "rotation": -12
  },
  "v4-rabbit16": {
    "x": 84.8,
    "y": 68.2,
    "width": 3.8
  },
  "v4-purple_flower13": {
    "x": 84.6,
    "y": 81.2,
    "width": 3.8,
    "rotation": -3
  },
  "v4-barrel4": {
    "visible": false
  }
};
 const c={...b,layoutVariant:'accident-b',revision:'accident-c',scenes:{...b.scenes,wreck:b.scenes.wreck.map(o=>({...o,...(overrides[o.id]||{})}))}};
 window.DUNGEON_FOREST_V4_ACCIDENT_C_LAYOUT=c;
 if(!/(?:^|[?&])layout=(?:original|b)(?:&|$)/.test(location.search))window.DUNGEON_FOREST_V4_LAYOUT=c;
})();
