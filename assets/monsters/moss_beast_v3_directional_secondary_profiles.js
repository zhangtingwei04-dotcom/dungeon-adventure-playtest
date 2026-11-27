/* V3.19 directional secondary motion: front tail occluded, back visible tip. */
(function(root){root.DungeonMossBeastV3SecondaryProfiles={
  "front": {
    "maneMax": 2,
    "tailMax": 0,
    "maneDX": 0,
    "mane": {
      "x": [
        54,
        89,
        135,
        170
      ],
      "rigidY": 60,
      "fixedY": 85
    }
  },
  "quarter": {
    "maneMax": 2,
    "tailMax": 3,
    "mane": {
      "x": [
        65,
        98,
        140,
        173
      ],
      "rigidY": 53,
      "fixedY": 86
    },
    "tail": {
      "rootX": 152,
      "tipX": 179,
      "y": [
        82,
        108,
        129,
        146
      ]
    }
  },
  "rear": {
    "maneMax": 2,
    "tailMax": 3,
    "mane": {
      "x": [
        58,
        91,
        131,
        168
      ],
      "rigidY": 51,
      "fixedY": 86
    },
    "tail": {
      "rootX": 145,
      "tipX": 178,
      "y": [
        80,
        108,
        135,
        151
      ]
    }
  },
  "back": {
    "maneMax": 2,
    "tailMax": 3,
    "maneDX": 0,
    "tailDX": 1,
    "tailDY": 0.25,
    "mane": {
      "x": [
        55,
        87,
        137,
        169
      ],
      "rigidY": 57,
      "fixedY": 96
    },
    "tail": {
      "x": [
        98,
        106,
        118,
        126
      ],
      "y": [
        109,
        135,
        148,
        160
      ]
    }
  }
};})(typeof window==='undefined'?globalThis:window);
