/* V3 rear quarter profile, visible limbs only; no duplicated hidden leg. */
(function(root){root.DungeonMossBeastV3RearProfile={
  "id": "moss-beast-v3-rear-225",
  "canvas": [
    224,
    160
  ],
  "ground": 152,
  "pivot": [
    112,
    108
  ],
  "motion": {
    "ground": 152,
    "farOffset": [
      0,
      6
    ],
    "footBias": {
      "front": 0,
      "run": 0
    },
    "tuckBias": [
      2,
      -2
    ],
    "gaits": {
      "walk": {
        "stride": 6,
        "lift": 4
      },
      "trot": {
        "stride": 8,
        "lift": 6
      },
      "run": {
        "stride": 10,
        "lift": 8
      }
    },
    "jump": {
      "apex": 30,
      "distance": 90
    }
  },
  "legs": [
    {
      "key": "farRear",
      "id": "rear",
      "far": true,
      "phase": 0.25,
      "hip": [
        131,
        116
      ],
      "knee": [
        139,
        132
      ],
      "ankle": [
        135,
        141
      ],
      "foot": [
        135,
        148
      ],
      "polygon": [
        [
          124,
          115
        ],
        [
          131,
          119
        ],
        [
          138,
          128
        ],
        [
          148,
          135
        ],
        [
          151,
          146
        ],
        [
          147,
          150
        ],
        [
          123,
          150
        ],
        [
          123,
          139
        ],
        [
          132,
          135
        ],
        [
          123,
          128
        ]
      ],
      "skin": {
        "topY": 115,
        "joinY": 123,
        "kneeY": 132,
        "ankleY": 141,
        "endY": 151,
        "xLimit": 5,
        "minSpan": 10
      },
      "bend": -1
    },
    {
      "key": "nearFront",
      "id": "front",
      "far": false,
      "phase": 0,
      "hip": [
        77,
        104
      ],
      "knee": [
        80,
        123
      ],
      "ankle": [
        70,
        135
      ],
      "foot": [
        68,
        144
      ],
      "polygon": [
        [
          66,
          93
        ],
        [
          84,
          94
        ],
        [
          90,
          107
        ],
        [
          91,
          120
        ],
        [
          85,
          133
        ],
        [
          81,
          146
        ],
        [
          54,
          146
        ],
        [
          53,
          133
        ],
        [
          65,
          130
        ],
        [
          65,
          116
        ]
      ],
      "skin": {
        "topY": 93,
        "joinY": 108,
        "kneeY": 123,
        "ankleY": 135,
        "endY": 147,
        "xLimit": 5,
        "minSpan": 10
      },
      "bend": -1
    },
    {
      "key": "nearRear",
      "id": "rear",
      "far": false,
      "phase": 0.25,
      "hip": [
        106,
        105
      ],
      "knee": [
        115,
        126
      ],
      "ankle": [
        107,
        143
      ],
      "foot": [
        106,
        152
      ],
      "polygon": [
        [
          94,
          93
        ],
        [
          111,
          92
        ],
        [
          119,
          99
        ],
        [
          124,
          116
        ],
        [
          125,
          129
        ],
        [
          120,
          145
        ],
        [
          117,
          154
        ],
        [
          88,
          154
        ],
        [
          88,
          142
        ],
        [
          99,
          137
        ],
        [
          102,
          129
        ],
        [
          94,
          121
        ],
        [
          91,
          109
        ]
      ],
      "skin": {
        "topY": 92,
        "joinY": 110,
        "kneeY": 126,
        "ankleY": 143,
        "endY": 155,
        "xLimit": 6,
        "minSpan": 12
      },
      "bend": -1
    }
  ],
  "occluded": [
    "farFront"
  ],
  "edgeFixes": [
    {
      "leg": 1,
      "box": [
        64,
        126,
        65,
        130
      ]
    },
    {
      "leg": 1,
      "box": [
        60,
        130,
        63,
        131
      ]
    },
    {
      "leg": 0,
      "box": [
        124,
        131,
        125,
        133
      ]
    },
    {
      "leg": 1,
      "box": [
        84,
        135,
        85,
        137
      ]
    },
    {
      "leg": 2,
      "box": [
        99,
        135,
        100,
        136
      ]
    },
    {
      "leg": 0,
      "box": [
        122,
        137,
        123,
        139
      ]
    },
    {
      "leg": 1,
      "box": [
        82,
        138,
        84,
        142
      ]
    },
    {
      "leg": 2,
      "box": [
        94,
        138,
        96,
        139
      ]
    },
    {
      "leg": 2,
      "box": [
        92,
        139,
        93,
        140
      ]
    },
    {
      "leg": 2,
      "box": [
        120,
        140,
        122,
        144
      ]
    },
    {
      "leg": 2,
      "box": [
        119,
        146,
        120,
        148
      ]
    }
  ]
};})(typeof window==='undefined'?globalThis:window);