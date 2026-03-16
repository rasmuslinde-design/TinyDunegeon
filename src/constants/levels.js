// levels.js — 5 dungeon level maps (20 cols × 15 rows)
//
// TILE LEGEND (verified):
//   F=0   normal stone floor
//  FR=12  stone floor + rocks
// FR2=24  stone floor + rocks v2
//  FS=48  sand floor (tile 48)
//   W=14  horizontal wall (─)
//  W2=40  horizontal wall variant
//  WV=13  vertical wall, outer RIGHT (│ face right)
// WVL=15  vertical wall, outer LEFT  (│ face left)
// WBL=16  corner bottom-left
// WBR=17  corner bottom-right
//   D=45  door closed
//  DO=33  door open
// D2L=46  double door closed left
// D2R=47  double door closed right
//   S=60  stairs down
//   U=61  stairs up
//   C=55  chest
//   B=48  barrel (same as FS! use sparingly as decoration via Tilemap logic)

import {
  F, FR, FR2, FS,
  W, W2, WV, WVL, WBL, WBR,
  D, DO, D2L, D2R,
  S, U, C,
} from './tiles.js';

export const MAP_WIDTH  = 20;
export const MAP_HEIGHT = 15;

// ── LEVEL 1: Entrance Hall ────────────────────────────────────────────────────
const L1_MAP = [
  [W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W ],
  [WV, F,  F,  F,  F,  F,  FR, F,  F,  F,  F,  F,  F,  F,  FR, F,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  W,  W,  W,  W,  F,  F,  F,  F,  F,  W,  W,  W,  W,  F,  F,  F,  WVL],
  [WV, F,  F,  WVL,F,  F,  WV, F,  F,  FR, F,  F,  WVL,F,  F,  WV, F,  F,  F,  WVL],
  [WV, F,  F,  WVL,F,  C,  WV, F,  F,  F,  F,  F,  WVL,F,  F,  WV, F,  F,  F,  WVL],
  [WV, F,  F,  WBL,W,  W,  WBR,F,  F,  F,  F,  F,  WBL,W,  W,  WBR,F,  F,  F,  WVL],
  [WV, F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  F,  F,  F,  F,  D2L,D2R,F,  F,  F,  F,  F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  FR, F,  F,  F,  F,  F,  F,  F,  F,  F,  FR, F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  W,  W,  W,  W,  F,  F,  S,  F,  F,  W,  W,  W,  W,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  FR, F,  WVL],
  [WV, F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  WVL],
  [WBL,W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  WBR],
];

// ── LEVEL 2: The Catacombs ────────────────────────────────────────────────────
const L2_MAP = [
  [W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W ],
  [WV, FR, F,  F,  F,  F,  FR, F,  F,  F,  F,  F,  F,  FR, F,  F,  F,  F,  FR, WVL],
  [WV, F,  F,  W,  W,  W,  W,  W,  W,  F,  F,  W,  W,  W,  W,  W,  W,  F,  F,  WVL],
  [WV, F,  WVL,F,  F,  F,  F,  F,  WV, F,  F,  WVL,F,  F,  F,  F,  F,  WV, F,  WVL],
  [WV, F,  WVL,F,  FR, F,  F,  F,  WV, F,  F,  WVL,F,  F,  FR, F,  F,  WV, F,  WVL],
  [WV, F,  WVL,F,  F,  C,  F,  F,  WV, F,  F,  WVL,F,  C,  F,  F,  F,  WV, F,  WVL],
  [WV, F,  WBL,W,  W,  W,  W,  W,  WBR,F,  F,  WBL,W,  W,  W,  W,  W,  WBR,F,  WVL],
  [WV, F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  D,  F,  F,  F,  F,  FR2,F,  F,  F,  F,  D,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  WVL],
  [WV, FR, F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  FR, WVL],
  [WV, F,  F,  W,  W,  WBL,W,  W,  F,  U,  F,  F,  W,  WBR,W,  W,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  WVL,F,  WV, F,  F,  F,  F,  F,  WVL,F,  WV, F,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  WBL,W,  WBR,F,  F,  S,  F,  F,  WBL,W,  WBR,F,  F,  F,  FR, WVL],
  [WBL,W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  WBR],
];

// ── LEVEL 3: Sand Ruins ───────────────────────────────────────────────────────
const L3_MAP = [
  [W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W ],
  [WV, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, WVL],
  [WV, FS, FS, W,  W,  W,  W,  FS, FS, FS, FS, FS, W,  W,  W,  W,  FS, FS, FS, WVL],
  [WV, FS, WVL,FS, FS, FS, WV, FS, FS, FS, FS, FS, WVL,FS, FS, WV, FS, FS, FS, WVL],
  [WV, FS, WVL,FS, C,  FS, WV, FS, FS, FS, FS, FS, WVL,FS, C,  WV, FS, FS, FS, WVL],
  [WV, FS, WBL,W,  W,  W,  WBR,FS, FS, FS, FS, FS, WBL,W,  W,  WBR,FS, FS, FS, WVL],
  [WV, FS, FS, FS, FS, FS, FS, FS, FS, FR, FS, FS, FS, FS, FS, FS, FS, FS, FS, WVL],
  [WV, FS, FS, FS, FS, FS, FS, FS, D2L,D2R,FS, FS, FS, FS, FS, FS, FS, FS, FS, WVL],
  [WV, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, WVL],
  [WV, FS, FS, W,  W,  WBL,W,  W,  FS, FS, FS, W,  WBR,W,  W,  FS, FS, FS, FS, WVL],
  [WV, FS, WVL,FS, FS, WV, FS, FS, FS, FS, FS, WVL,FS, FS, WV, FS, FS, FS, FS, WVL],
  [WV, FS, WVL,FS, FS, WV, FS, FS, FS, U,  FS, WVL,FS, FS, WV, FS, FS, FS, FS, WVL],
  [WV, FS, WBL,W,  W,  WBR,FS, FS, FS, S,  FS, WBL,W,  W,  WBR,FS, FS, FS, FS, WVL],
  [WV, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, FS, WVL],
  [WBL,W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  WBR],
];

// ── LEVEL 4: Frozen Keep ──────────────────────────────────────────────────────
const L4_MAP = [
  [W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W ],
  [WV, FR2,F,  F,  F,  F,  FR2,F,  F,  F,  F,  F,  F,  FR2,F,  F,  F,  F,  FR2,WVL],
  [WV, F,  F,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  F,  F,  WVL],
  [WV, F,  WVL,F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  WV, F,  F,  WVL],
  [WV, F,  WVL,F,  FR2,F,  W,  W,  W,  W,  W,  W,  W,  W,  F,  FR2,WV, F,  F,  WVL],
  [WV, F,  WVL,F,  F,  WVL,F,  F,  F,  F,  F,  F,  F,  WV, F,  F,  WV, F,  F,  WVL],
  [WV, F,  WVL,F,  F,  WVL,F,  C,  F,  F,  F,  C,  F,  WV, F,  F,  WV, F,  F,  WVL],
  [WV, F,  WBL,W,  W,  WBL,W,  W,  WBR,F,  F,  WBL,W,  WBR,W,  W,  WBR,F,  F,  WVL],
  [WV, F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  F,  F,  D2L,D2R,F,  U,  F,  F,  F,  F,  F,  F,  F,  F,  F,  WVL],
  [WV, FR2,F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  FR2,WVL],
  [WV, F,  F,  F,  W,  W,  W,  W,  W,  S,  W,  W,  W,  W,  F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  WVL,F,  F,  F,  WV, F,  WVL,F,  F,  F,  WV, F,  F,  F,  F,  WVL],
  [WV, F,  FR2,F,  WBL,W,  W,  W,  WBR,F,  WBL,W,  W,  W,  WBR,F,  FR2,F,  F,  WVL],
  [WBL,W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  WBR],
];

// ── LEVEL 5: Demon Throne (boss) ──────────────────────────────────────────────
const L5_MAP = [
  [W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W ],
  [WV, FR, FR2,F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  FR2,FR, F,  WVL],
  [WV, F,  F,  F,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  WVL,F,  FR, F,  F,  F,  F,  F,  F,  FR, F,  WV, F,  F,  F,  F,  WVL],
  [WV, F,  F,  WVL,F,  F,  F,  C,  F,  F,  C,  F,  F,  F,  WV, F,  F,  F,  F,  WVL],
  [WV, F,  F,  WBL,W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  WBR,F,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  W,  W,  WBL,W,  W,  W,  W,  WBR,W,  W,  F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  WVL,F,  WV, F,  FR2,F,  FR2,WVL,F,  WV, F,  F,  F,  F,  F,  WVL],
  [WV, U,  F,  F,  WVL,F,  WV, F,  F,  F,  F,  WVL,F,  WV, F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  WBL,W,  WBR,F,  F,  F,  F,  WBL,W,  WBR,F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  F,  F,  F,  F,  F,  FR, F,  FR, F,  F,  F,  F,  F,  F,  F,  F,  WVL],
  [WV, F,  F,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  F,  F,  F,  WVL],
  [WV, F,  F,  WVL,F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  F,  WV, F,  F,  F,  WVL],
  [WBL,W,  W,  WBL,W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  W,  WBR,W,  W,  W,  WBR],
];

export const LEVELS = [
  {
    name: 'Entrance Hall',
    bgColor: '#0d0d18',
    map: L1_MAP,
    playerStart: { x: 9, y: 7 },
    enemies: [
      { type: 'slime',    x: 4,  y: 3  },
      { type: 'bat',      x: 15, y: 3  },
      { type: 'slime',    x: 4,  y: 11 },
      { type: 'skeleton', x: 15, y: 11 },
      { type: 'bat',      x: 10, y: 5  },
    ],
    npcs: [
      { type: 'merchant', x: 17, y: 2  },
      { type: 'healer',   x: 17, y: 12 },
    ],
  },
  {
    name: 'The Catacombs',
    bgColor: '#0a0a12',
    map: L2_MAP,
    playerStart: { x: 9, y: 7 },
    enemies: [
      { type: 'zombie',   x: 4,  y: 4  },
      { type: 'spider',   x: 15, y: 4  },
      { type: 'zombie',   x: 3,  y: 12 },
      { type: 'skeleton', x: 14, y: 12 },
      { type: 'bat',      x: 9,  y: 10 },
      { type: 'slime',    x: 6,  y: 7  },
    ],
    npcs: [
      { type: 'trainer',    x: 16, y: 3  },
      { type: 'blacksmith', x: 16, y: 12 },
    ],
  },
  {
    name: 'Sand Ruins',
    bgColor: '#1a1005',
    map: L3_MAP,
    playerStart: { x: 9, y: 6 },
    enemies: [
      { type: 'orc',      x: 4,  y: 3  },
      { type: 'spider',   x: 15, y: 3  },
      { type: 'zombie',   x: 4,  y: 10 },
      { type: 'skeleton', x: 15, y: 10 },
      { type: 'bat',      x: 9,  y: 5  },
      { type: 'slime',    x: 6,  y: 7  },
      { type: 'orc',      x: 13, y: 7  },
    ],
    npcs: [
      { type: 'merchant', x: 1,  y: 12 },
      { type: 'guard',    x: 18, y: 3  },
    ],
  },
  {
    name: 'Frozen Keep',
    bgColor: '#06101a',
    map: L4_MAP,
    playerStart: { x: 9, y: 9 },
    enemies: [
      { type: 'troll',    x: 5,  y: 5  },
      { type: 'wizard',   x: 14, y: 5  },
      { type: 'orc',      x: 3,  y: 12 },
      { type: 'skeleton', x: 15, y: 12 },
      { type: 'zombie',   x: 9,  y: 3  },
      { type: 'bat',      x: 6,  y: 9  },
      { type: 'spider',   x: 13, y: 9  },
    ],
    npcs: [
      { type: 'healer',   x: 18, y: 2  },
      { type: 'trainer',  x: 18, y: 12 },
    ],
  },
  {
    name: 'Demon Throne',
    bgColor: '#0f0018',
    map: L5_MAP,
    playerStart: { x: 3, y: 13 },
    enemies: [
      { type: 'demon',    x: 9,  y: 9  },
      { type: 'dragon',   x: 9,  y: 3  },
      { type: 'troll',    x: 4,  y: 8  },
      { type: 'troll',    x: 14, y: 8  },
      { type: 'wizard',   x: 6,  y: 11 },
      { type: 'wizard',   x: 12, y: 11 },
      { type: 'orc',      x: 3,  y: 11 },
      { type: 'orc',      x: 15, y: 11 },
    ],
    npcs: [
      { type: 'merchant', x: 18, y: 13 },
    ],
  },
];
