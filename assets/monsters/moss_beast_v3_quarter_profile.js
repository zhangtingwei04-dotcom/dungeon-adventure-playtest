/* V3 315-degree candidate, 3 visible limbs; far rear is occluded. */
(function(root){root.DungeonMossBeastV3QuarterProfile={
  "id": "moss-beast-v3-quarter-315",
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
      "key": "farFront",
      "id": "front",
      "far": true,
      "phase": 0,
      "hip": [
        78,
        116
      ],
      "knee": [
        76,
        130
      ],
      "ankle": [
        66,
        138
      ],
      "foot": [
        64,
        146
      ],
      "polygon": [
        [
          64,
          119
        ],
        [
          88,
          118
        ],
        [
          91,
          126
        ],
        [
          84,
          137
        ],
        [
          79,
          148
        ],
        [
          48,
          148
        ],
        [
          48,
          136
        ],
        [
          59,
          130
        ]
      ],
      "skin": {
        "topY": 118,
        "joinY": 124,
        "kneeY": 130,
        "ankleY": 138,
        "endY": 149,
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
        119,
        103
      ],
      "knee": [
        122,
        126
      ],
      "ankle": [
        114,
        143
      ],
      "foot": [
        113,
        152
      ],
      "polygon": [
        [
          105,
          100
        ],
        [
          131,
          100
        ],
        [
          136,
          110
        ],
        [
          134,
          128
        ],
        [
          130,
          154
        ],
        [
          96,
          154
        ],
        [
          96,
          140
        ],
        [
          104,
          132
        ],
        [
          109,
          117
        ]
      ],
      "skin": {
        "topY": 100,
        "joinY": 112,
        "kneeY": 126,
        "ankleY": 143,
        "endY": 155,
        "xLimit": 6,
        "minSpan": 12
      },
      "bend": -1
    },
    {
      "key": "nearRear",
      "id": "rear",
      "far": false,
      "phase": 0.25,
      "hip": [
        151,
        99
      ],
      "knee": [
        158,
        120
      ],
      "ankle": [
        160,
        133
      ],
      "foot": [
        160,
        140
      ],
      "polygon": [
        [
          141,
          100
        ],
        [
          165,
          100
        ],
        [
          171,
          110
        ],
        [
          170,
          119
        ],
        [
          175,
          128
        ],
        [
          175,
          143
        ],
        [
          145,
          143
        ],
        [
          144,
          130
        ],
        [
          150,
          119
        ],
        [
          143,
          110
        ]
      ],
      "skin": {
        "topY": 100,
        "joinY": 110,
        "kneeY": 120,
        "ankleY": 133,
        "endY": 144,
        "xLimit": 5,
        "minSpan": 10
      },
      "bend": -1
    }
  ],
  "occluded": [
    "farRear"
  ]
};})(typeof window==='undefined'?globalThis:window);