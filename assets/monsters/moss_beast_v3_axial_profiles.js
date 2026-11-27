/* V3 independent axial profiles; two visible limbs each. */
(function(root){root.DungeonMossBeastV3AxialProfiles={
  "front": {
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
        0
      ],
      "footBias": {
        "front": 0,
        "run": 0
      },
      "tuckBias": [
        0,
        0
      ],
      "gaits": {
        "walk": {
          "stride": 5,
          "lift": 4
        },
        "trot": {
          "stride": 7,
          "lift": 6
        },
        "run": {
          "stride": 9,
          "lift": 8
        }
      },
      "jump": {
        "apex": 30,
        "distance": 0
      },
      "attacks": {
        "pounce": {
          "distance": 0
        }
      }
    },
    "id": "moss-beast-v3-front-000",
    "occluded": [
      "rear-left",
      "rear-right"
    ],
    "legs": [
      {
        "hip": [
          83,
          111
        ],
        "knee": [
          77,
          128
        ],
        "ankle": [
          84,
          143
        ],
        "foot": [
          84,
          152
        ],
        "polygon": [
          [
            71,
            108
          ],
          [
            94,
            111
          ],
          [
            99,
            123
          ],
          [
            101,
            140
          ],
          [
            99,
            155
          ],
          [
            66,
            155
          ],
          [
            66,
            140
          ],
          [
            69,
            127
          ]
        ],
        "skin": {
          "topY": 108,
          "joinY": 118,
          "kneeY": 128,
          "ankleY": 143,
          "endY": 156,
          "xLimit": 4,
          "minSpan": 10
        },
        "key": "left",
        "id": "front",
        "far": false,
        "phase": 0,
        "bend": 1
      },
      {
        "hip": [
          141,
          111
        ],
        "knee": [
          147,
          128
        ],
        "ankle": [
          140,
          143
        ],
        "foot": [
          140,
          152
        ],
        "polygon": [
          [
            153,
            108
          ],
          [
            130,
            111
          ],
          [
            125,
            123
          ],
          [
            123,
            140
          ],
          [
            125,
            155
          ],
          [
            158,
            155
          ],
          [
            158,
            140
          ],
          [
            155,
            127
          ]
        ],
        "skin": {
          "topY": 108,
          "joinY": 118,
          "kneeY": 128,
          "ankleY": 143,
          "endY": 156,
          "xLimit": 4,
          "minSpan": 10
        },
        "key": "right",
        "id": "front",
        "far": true,
        "phase": 0,
        "bend": -1
      }
    ]
  },
  "back": {
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
        0
      ],
      "footBias": {
        "front": 0,
        "run": 0
      },
      "tuckBias": [
        0,
        0
      ],
      "gaits": {
        "walk": {
          "stride": 5,
          "lift": 4
        },
        "trot": {
          "stride": 7,
          "lift": 6
        },
        "run": {
          "stride": 9,
          "lift": 8
        }
      },
      "jump": {
        "apex": 30,
        "distance": 0
      },
      "attacks": {
        "pounce": {
          "distance": 0
        }
      }
    },
    "id": "moss-beast-v3-back-180",
    "occluded": [
      "front-left",
      "front-right"
    ],
    "legs": [
      {
        "hip": [
          81,
          110
        ],
        "knee": [
          76,
          128
        ],
        "ankle": [
          81,
          143
        ],
        "foot": [
          81,
          152
        ],
        "polygon": [
          [
            69,
            108
          ],
          [
            88,
            113
          ],
          [
            94,
            125
          ],
          [
            96,
            139
          ],
          [
            98,
            154
          ],
          [
            64,
            154
          ],
          [
            64,
            140
          ],
          [
            67,
            126
          ]
        ],
        "skin": {
          "topY": 108,
          "joinY": 118,
          "kneeY": 128,
          "ankleY": 143,
          "endY": 155,
          "xLimit": 4,
          "minSpan": 10
        },
        "key": "left",
        "id": "rear",
        "far": false,
        "phase": 0.25,
        "bend": 1
      },
      {
        "hip": [
          143,
          110
        ],
        "knee": [
          148,
          128
        ],
        "ankle": [
          143,
          143
        ],
        "foot": [
          143,
          152
        ],
        "polygon": [
          [
            155,
            108
          ],
          [
            136,
            113
          ],
          [
            130,
            125
          ],
          [
            128,
            139
          ],
          [
            126,
            154
          ],
          [
            160,
            154
          ],
          [
            160,
            140
          ],
          [
            157,
            126
          ]
        ],
        "skin": {
          "topY": 108,
          "joinY": 118,
          "kneeY": 128,
          "ankleY": 143,
          "endY": 155,
          "xLimit": 4,
          "minSpan": 10
        },
        "key": "right",
        "id": "rear",
        "far": true,
        "phase": 0.25,
        "bend": -1
      }
    ]
  }
};})(typeof window==='undefined'?globalThis:window);