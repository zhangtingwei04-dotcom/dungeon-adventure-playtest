/* V3 candidate v2: corrected forepaw/rearpaw mask remnants and rear knee bend. */
(function(root){root.DungeonMossBeastV3Profile={
  "id": "moss-beast-v3-candidate",
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
      3,
      -3
    ],
    "gaits": {
      "walk": {
        "stride": 10,
        "lift": 5
      },
      "trot": {
        "stride": 12,
        "lift": 8
      },
      "run": {
        "stride": 16,
        "lift": 12
      }
    },
    "jump": {
      "apex": 38,
      "distance": 112
    }
  },
  "legs": [
    {
      "key": "farFront",
      "id": "front",
      "far": true,
      "phase": 0,
      "hip": [
        80,
        114
      ],
      "knee": [
        80,
        132
      ],
      "ankle": [
        59,
        140
      ],
      "foot": [
        58,
        146
      ],
      "bend": -1,
      "polygon": [
        [
          72,
          117
        ],
        [
          88,
          117
        ],
        [
          83,
          132
        ],
        [
          72,
          149
        ],
        [
          49,
          149
        ],
        [
          48,
          137
        ],
        [
          62,
          130
        ]
      ],
      "skin": {
        "topY": 117,
        "joinY": 124,
        "kneeY": 132,
        "ankleY": 140,
        "endY": 149,
        "xLimit": 6,
        "minSpan": 10
      }
    },
    {
      "key": "farRear",
      "id": "rear",
      "far": true,
      "phase": 0.25,
      "hip": [
        138,
        114
      ],
      "knee": [
        143,
        132
      ],
      "ankle": [
        124,
        140
      ],
      "foot": [
        124,
        146
      ],
      "bend": -1,
      "polygon": [
        [
          128,
          115
        ],
        [
          151,
          117
        ],
        [
          150,
          130
        ],
        [
          140,
          149
        ],
        [
          114,
          149
        ],
        [
          113,
          139
        ],
        [
          127,
          127
        ]
      ],
      "skin": {
        "topY": 115,
        "joinY": 123,
        "kneeY": 132,
        "ankleY": 140,
        "endY": 149,
        "xLimit": 6,
        "minSpan": 10
      }
    },
    {
      "key": "nearFront",
      "id": "front",
      "far": false,
      "phase": 0,
      "hip": [
        98,
        102
      ],
      "knee": [
        102,
        126
      ],
      "ankle": [
        82,
        143
      ],
      "foot": [
        80,
        152
      ],
      "bend": -1,
      "polygon": [
        [
          84,
          96
        ],
        [
          110,
          97
        ],
        [
          110,
          117
        ],
        [
          105,
          132
        ],
        [
          96,
          155
        ],
        [
          65,
          155
        ],
        [
          65,
          141
        ],
        [
          81,
          132
        ],
        [
          86,
          118
        ]
      ],
      "skin": {
        "topY": 96,
        "joinY": 112,
        "kneeY": 126,
        "ankleY": 143,
        "endY": 155,
        "xLimit": 8,
        "minSpan": 12
      }
    },
    {
      "key": "nearRear",
      "id": "rear",
      "far": false,
      "phase": 0.25,
      "hip": [
        151,
        106
      ],
      "knee": [
        169,
        126
      ],
      "ankle": [
        164,
        143
      ],
      "foot": [
        161,
        152
      ],
      "bend": -1,
      "polygon": [
        [
          141,
          96
        ],
        [
          165,
          99
        ],
        [
          173,
          116
        ],
        [
          175,
          135
        ],
        [
          176,
          154
        ],
        [
          145,
          154
        ],
        [
          145,
          140
        ],
        [
          148,
          132
        ],
        [
          148,
          125
        ],
        [
          139,
          118
        ]
      ],
      "skin": {
        "topY": 96,
        "joinY": 112,
        "kneeY": 126,
        "ankleY": 143,
        "endY": 155,
        "xLimit": 8,
        "minSpan": 12
      }
    }
  ]
};})(typeof window==='undefined'?globalThis:window);
