// levels.js — dungeon level maps
//
// Level 1 is 60×60 tiles (large exploration dungeon).
// Levels 2-5 remain 20×15 (classic size).
// MAP_WIDTH / MAP_HEIGHT are exported as defaults for levels 2-5.
// Level-specific dimensions are stored on the level object itself.
//
// TILE LEGEND (verified from tileviewer):
//   F=0   normal stone floor
//  FR=12  stone floor + rocks
// FR2=24  stone floor + rocks v2
//  FS=48  sand floor
//   W=14  horizontal wall (─)
//  WV=13  vertical wall, outer RIGHT
// WVL=15  vertical wall, outer LEFT
// WBL=16  corner bottom-left
// WBR=17  corner bottom-right
//   D=45  door closed
//  DO=33  door open
// D2L=46  double door closed left
// D2R=47  double door closed right
//   S=60  stairs down
//   U=61  stairs up
//   C=55  chest
//
// SPECIAL TILES:
//  AL=64   altar (room 1)
//  LV=54   lever (room 3)
//  SP=62   spikes (room 3, hidden until lever)
//  CH=89   quest chest (room 3, symbol 1)
//  SW=40   secret wall (room 5)

import {
  F,
  FR,
  FR2,
  FS,
  W,
  W2,
  WV,
  WVL,
  WBL,
  WBR,
  D,
  DO,
  D2L,
  D2R,
  S,
  U,
  C,
} from "./tiles.js";

// Special tile values
const AL = 64; // altar
const LV = 54; // lever
const SP = 62; // spikes
const CH = 89; // quest chest
const SW = 40; // secret wall (same as W2 visually)

// Default map size (levels 2-5)
export const MAP_WIDTH = 20;
export const MAP_HEIGHT = 15;

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1: The Dungeon  — 60×60 grid
//
// ALL corridor connections are VERTICAL (uksed top/bottom seinas Y-teljel).
//
//   Room 1  "Entrance Hall"   col  4-17, row 32-43  (bottom-left)
//   Room 2  "Central Hall"    col 22-37, row 16-27  (centre)
//   Room 3  "Spike Chamber"   col  4-17, row  4-15  (top-left, south of R2 via corridor)
//   Room 4  "Guardian Hall"   col 42-55, row 32-43  (bottom-right)
//   Room 5  "Secret Vault"    col 42-55, row  4-15  (top-right)
//
// CORRIDORS (all vertical — uksed põhjas/lõunas):
//   R1→R2  : col 10, rows 27-32  (R1 north wall → R2 south wall)
//   R2→R3  : col 10, rows 15-16  (R2 north wall ← wait, R3 is top-left)
//             actually: col 10, rows 15-27  runs from R3 south to R2 north...
//             Correction: R3 col 4-17 top row 4, R2 col 22-37...
//             Use diagonal-ish path: vertical col 10 rows 15-27 + horiz row 16 cols 10-27
//   R2→R4  : col 29, rows 27-32  (R2 south → R4 north)  then horiz row 32 cols 29-42
//   R4→R5  : col 48, rows 15-32  (R5 south → R4 north, vertical)
//
// SPECIAL OBJECTS:
//   Altar    (AL=64) : col 10, row 38  (room 1 centre)
//   NPC              : col 29, row 21  (room 2 centre)
//   Lever    (LV=54) : col  9, row 10  (room 3)
//   Spikes   (SP=62) : col 13, row 10  (room 3)
//   QuestChest(CH=89): col  9, row 13  (room 3)
//   Stairs   (S=60)  : col 29, row 24  (room 2)
//   SecretWall(SW=40): col 42, row  8  (room 5 west wall — secret entry)
// ─────────────────────────────────────────────────────────────────────────────

function buildL1() {
  const COLS = 60;
  const ROWS = 60;

  // Seeded deterministic RNG — stable across reloads
  let seed = 7;
  function rng() {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  }
  // 90% plain, 5% FR, 5% FR2
  function floorTile() {
    const r = rng();
    if (r < 0.9) return F;
    if (r < 0.95) return FR;
    return FR2;
  }
  // Walls: always tile 14 — tile 40 (W2) is reserved for secret walls (SW)
  function wallTile() {
    return W;
  }

  // Fill entire map with wall
  const map = Array.from({ length: ROWS }, () => Array(COLS).fill(W));

  function setTile(r, c, tile) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) map[r][c] = tile;
  }

  // Fill rect with varied floor tiles
  function fillFloor(r1, c1, r2, c2) {
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++) setTile(r, c, floorTile());
  }

  // Room: wall border + floor interior
  function room(r1, c1, r2, c2) {
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++) setTile(r, c, wallTile());
    fillFloor(r1 + 1, c1 + 1, r2 - 1, c2 - 1);
  }

  // Punch a vertical 2-wide corridor (cols c, c+1) through rows r1..r2 inclusive
  // This OVERWRITES whatever is there — walls, room borders, everything
  function corridorV(c, r1, r2) {
    const lo = Math.min(r1, r2);
    const hi = Math.max(r1, r2);
    for (let r = lo; r <= hi; r++) {
      setTile(r, c, F);
      setTile(r, c + 1, F);
    }
  }

  // Punch a horizontal 2-wide corridor (rows r, r+1) through cols c1..c2 inclusive
  function corridorH(r, c1, c2) {
    const lo = Math.min(c1, c2);
    const hi = Math.max(c1, c2);
    for (let c = lo; c <= hi; c++) {
      setTile(r, c, F);
      setTile(r + 1, c, F);
    }
  }

  // ── ROOMS ─────────────────────────────────────────────────────────────────
  //   Room 1  "Entrance Hall"  rows 33–42, cols  5–16   (bottom-left)
  //   Room 2  "Central Hall"   rows 17–26, cols 22–37   (centre)
  //   Room 3  "Spike Chamber"  rows  5–14, cols  5–16   (top-left)
  //   Room 4  "Guardian Hall"  rows 33–42, cols 43–54   (bottom-right)
  //   Room 5  "Secret Vault"   rows  5–14, cols 43–54   (top-right)
  room(33, 5, 42, 16); // Room 1
  room(17, 22, 26, 37); // Room 2
  room(5, 5, 14, 16); // Room 3
  room(33, 43, 42, 54); // Room 4
  room(5, 43, 14, 54); // Room 5

  // ── CORRIDOR: R1 north ↔ R2 south ─────────────────────────────────────────
  //   R1 north wall = row 33   (top border of Room 1)
  //   R2 south wall = row 26   (bottom border of Room 2, cols 22-37)
  //   Col 10-11 is OUTSIDE Room 2 (cols 22-37), so we need an L-shape:
  //     1) vertical col 10-11 from row 27 up to row 33 (door in R1 north wall)
  //     2) horizontal row 27-28 from col 10 to col 22 (bridge the gap)
  //     3) breach Room 2 south wall at col 22-23 (col 22 is R2 west border)
  corridorV(10, 27, 32); // col 10-11, rows 27-32 (between the two rooms)
  corridorH(27, 10, 23); // row 27-28, cols 10-23 (horizontal bridge to R2)
  setTile(26, 22, F);
  setTile(26, 23, F); // breach R2 south wall at col 22-23
  setTile(33, 10, D2L); // double-door in R1 north wall (row 33, col 10)
  setTile(33, 11, D2R); //   (opened after altar)

  // ── CORRIDOR: R3 south ↔ R2 north  (L-shape) ──────────────────────────────
  //   R3 south wall = row 14   (bottom border of Room 3)
  //   R2 north wall = row 17   (top border of Room 2)
  //   Path: vertical col 10-11 from row 14 down to row 20,
  //         horizontal row 20-21 from col 10 to col 22,
  //         vertical col 22-23 from row 17 up to row 21.
  corridorV(10, 14, 20); // punch col 10-11, rows 14-20
  corridorH(20, 10, 23); // punch row 20-21, cols 10-23
  corridorV(22, 17, 21); // punch col 22-23, rows 17-21

  // ── CORRIDOR: R2 south ↔ R4 north  (L-shape) ──────────────────────────────
  //   R2 south wall = row 26, R4 north wall = row 33
  //   Path: vertical col 30-31 from row 26 down to row 33,
  //         horizontal row 33-34 from col 31 to col 43.
  //   Then punch R4 west wall entry.
  corridorV(30, 26, 33); // col 30-31, rows 26-33
  corridorH(33, 31, 43); // row 33-34, cols 31-43
  // Ensure R2 south wall open at col 30-31
  setTile(26, 30, F);
  setTile(26, 31, F);
  // Ensure R4 north wall open at col 43 entry
  setTile(33, 43, F);
  setTile(34, 43, F);

  // ── CORRIDOR: R4 north ↔ R5 south  (vertical) ─────────────────────────────
  //   R4 north wall = row 33, R5 south wall = row 14
  //   Corridor col 48-49, punch rows 14-33.
  corridorV(48, 14, 33); // clears rows 14-33 at cols 48-49

  // ── SECRET WALL: Room 5 west entry (col 43, rows 8-9) ──────────────────────
  setTile(8, 43, SW);
  setTile(9, 43, SW);

  // ── SPECIAL OBJECTS ───────────────────────────────────────────────────────
  setTile(39, 10, AL); // Room 1 — Altar (centre)
  setTile(10, 9, LV); // Room 3 — Lever
  setTile(10, 13, SP); // Room 3 — Spikes
  setTile(13, 9, CH); // Room 3 — Quest chest
  setTile(8, 51, FR); // Room 5 — deco
  setTile(9, 51, FR);

  return map;
}

const L1_MAP = buildL1();
export const L1_COLS = 60;
export const L1_ROWS = 60;

export { AL, LV, SP, CH, SW };

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2: (WIP) The Abyssal Halls — 60×60 grid
//
// Built using the same primitives as Level 1 (rooms + punched corridors).
// Room layout is based on the provided sketch (rooms labeled 1–5).
// NOTE: Until exact coordinate calibration is provided for each doorway,
// this uses a reasonable 60×60 placement that matches the sketch's topology.
// ─────────────────────────────────────────────────────────────────────────────

function buildL2() {
  const COLS = 60;
  const ROWS = 60;

  // Seeded deterministic RNG — stable across reloads
  let seed = 19;
  function rng() {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  }
  // Desert theme floor distribution (entire level):
  // 90% 48 (Sand), 5% 49 (Sand variation), 5% 42 (Sand with pebbles)
  // NOTE: These are tile indices from tileviewer.
  const SAND_A = 48;
  const SAND_B = 49;
  const SAND_PEBBLES = 42;
  function floorTile() {
    const r = rng();
    if (r < 0.9) return SAND_A;
    if (r < 0.95) return SAND_B;
    return SAND_PEBBLES;
  }
  function wallTile() {
    return W;
  }

  const map = Array.from({ length: ROWS }, () => Array(COLS).fill(W));

  function setTile(r, c, tile) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) map[r][c] = tile;
  }

  function fillFloor(r1, c1, r2, c2) {
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++) setTile(r, c, floorTile());
  }

  function setFloor(r, c) {
    setTile(r, c, floorTile());
  }

  function room(r1, c1, r2, c2) {
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++) setTile(r, c, wallTile());
    fillFloor(r1 + 1, c1 + 1, r2 - 1, c2 - 1);
  }

  function corridorV(c, r1, r2) {
    const lo = Math.min(r1, r2);
    const hi = Math.max(r1, r2);
    for (let r = lo; r <= hi; r++) {
      setFloor(r, c);
      setFloor(r, c + 1);
    }
  }

  function corridorH(r, c1, c2) {
    const lo = Math.min(c1, c2);
    const hi = Math.max(c1, c2);
    for (let c = lo; c <= hi; c++) {
      setFloor(r, c);
      setFloor(r + 1, c);
    }
  }

  // Door tiles
  // Locked double door closed: D2L/D2R (46/47)
  // Locked double door open (user spec): 22/23
  const D2L_OPEN = 22;
  const D2R_OPEN = 23;

  // Cleanup: ensure doors have floor on BOTH sides (inside room and outside corridor)
  function ensureDoorFloor(r, c) {
    // inside
    setFloor(r + 1, c);
    // outside
    setFloor(r - 1, c);
  }

  // Place a Y-axis (north-wall) double door pair at (r,c) and (r,c+1)
  function placeNorthDoubleDoor(r, c, isOpen = false) {
    setTile(r, c, isOpen ? D2L_OPEN : D2L);
    setTile(r, c + 1, isOpen ? D2R_OPEN : D2R);
    // carve floor on both sides for each tile
    ensureDoorFloor(r, c);
    ensureDoorFloor(r, c + 1);
  }

  // ── ROOMS (placed to match the provided layout image) ────────────────────
  // Coordinates are (row, col). All rooms are rectangles; corridors punch through walls.
  // Room 1: big left chamber
  room(28, 6, 46, 22);
  // Room 2: upper-mid rectangle
  room(8, 26, 20, 36);
  // Room 3: center-lower rectangle
  room(30, 34, 44, 46);
  // Room 4: big right chamber
  room(18, 48, 42, 58);
  // Room 5: top-right square
  room(2, 46, 12, 56);

  // ── CONNECTIONS / CORRIDORS (match image topology) ───────────────────────
  // 1 → 2 : corridor north from Room 1, then east into Room 2 (LOCKED door at R1)
  // Room 1 north wall is row 28. Place door pair near right side of Room 1.
  // Room 1 puzzle exit: single door (on the right half) locked until basins are filled.
  // Requirement: make left half a wall, right half a single door (45 closed / 33 open).
  // Coordinates provided use (row, col).
  setTile(28, 16, W2); // wall (solid)
  setTile(28, 17, 45); // single door CLOSED
  // Ensure floor on both sides of the door
  setFloor(27, 17);
  setFloor(29, 17);
  // go up 6 tiles (rows 27..22)
  corridorV(16, 22, 27);
  // then go east toward Room 2 (Room 2 west edge col 26)
  corridorH(22, 16, 26);

  // 1 → 3 : corridor east from lower part of Room 1 into Room 3
  corridorH(40, 22, 34);
  // breach into Room 3 west wall
  setFloor(40, 34);
  setFloor(41, 34);

  // 2 → 3 : vertical shaft down from Room 2 to Room 3 (like image)
  // Start at Room 2 south wall row 20 around col 36.
  placeNorthDoubleDoor(20, 34, true);
  corridorV(34, 20, 30);

  // 3 → 4 : corridor east into Room 4
  corridorH(34, 46, 48);
  setFloor(34, 48);
  setFloor(35, 48);

  // 4 → 5 : corridor north from Room 4 into Room 5 (two entrances in image)
  // left entrance
  placeNorthDoubleDoor(18, 50, true);
  corridorV(50, 12, 18);
  // right entrance
  placeNorthDoubleDoor(18, 54, true);
  corridorV(54, 12, 18);

  // Final cleanup pass: ensure any door tiles have floor adjacent.
  // (We only placed north-wall doors here, so we check for 46/47/22/23.)
  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = map[r][c];
      if (t === D2L || t === D2R || t === D2L_OPEN || t === D2R_OPEN) {
        setFloor(r - 1, c);
        setFloor(r + 1, c);
      }
    }
  }

  // ── PUZZLE SETUP: "The Desert's Thirst" (Room 1) ─────────────────────────
  // Room 1 bounds: r:28-46, c:6-22
  // North wall objects on row 28.
  const GARGOYLE = 19;
  const GARGOYLE_WATER = 20;
  const WALL_HOLE = 7;
  const WALL_HOLE_WATER = 8;
  const BASIN = 31;
  const BASIN_WATER = 32;
  // Hidden mechanism tile index.
  // IMPORTANT: tile 40 is part of SOLID_TILE_SET (wall), which would block
  // movement if used as an interactable. Use a non-solid, unused-looking tile
  // index instead as the "socket" marker.
  const MECH_HIDDEN = 41;

  // Place two gargoyles and two wall holes along the north wall.
  // (Keeping them spaced and inside the room width.)
  const northWallR = 28;
  const fixtures = [
    { c: 9, t: GARGOYLE },
    { c: 12, t: WALL_HOLE },
    { c: 16, t: GARGOYLE },
    { c: 19, t: WALL_HOLE },
  ];
  for (const f of fixtures) {
    setTile(northWallR, f.c, f.t);
    setTile(northWallR + 1, f.c, BASIN);
    // Ensure basin sits on walkable floor around it
    setFloor(northWallR + 2, f.c);
  }
  // Hidden mechanism tile in the wall (choose a wall tile on the north wall)
  const mechanism = { r: northWallR, c: 14 };
  setTile(mechanism.r, mechanism.c, MECH_HIDDEN);

  // Additional locked double doors for this level's gating
  // - North exit door already placed at (28,16) + (28,17)
  // - Secondary exit at (40,22) + (40,23)
  // Convert to a SINGLE door on the LEFT half (col 22): 45 closed / 33 open.
  // Right half (col 23) becomes floor.
  setTile(40, 22, 45); // single door CLOSED
  setFloor(40, 23); // floor
  // Ensure floor on both sides of the door (north/south)
  setFloor(39, 22);
  setFloor(41, 22);
  // Ensure walls 1 tile above and below the single door
  setTile(39, 22, W2);
  setTile(41, 22, W2);

  // ── North dead-end corridor: mimic chest (r:22-27, c:16) ─────────────────
  // Corridor itself is carved above; place the mimic at its end.
  const MIMIC_CHEST = 92;
  setTile(22, 16, MIMIC_CHEST);

  // ── ROOM 2: Gravestone push puzzle + boss gate ──────────────────────────
  // Room 2 bounds: r:8-20, c:26-36
  // Tile 65 = gravestone (pushable). Tile 60 = marker (goal positions).
  const GRAVESTONE = 65;
  const MARKER = 60;

  // Markers (targets)
  setTile(12, 30, MARKER);
  setTile(12, 32, MARKER);
  setTile(16, 31, MARKER);

  // Three gravestones (start positions)
  setTile(10, 29, GRAVESTONE);
  setTile(10, 33, GRAVESTONE);
  setTile(18, 31, GRAVESTONE);

  // Room 2 right-side exit (locked until ghost boss defeated).
  // Exit is 2 tiles tall: top = door, bottom = wall.
  // Door coordinate chosen at Room 2 east edge (col 36).
  setTile(14, 36, 45); // CLOSED door
  setTile(15, 36, W2); // wall below
  // Ensure there is floor just inside the room.
  setFloor(14, 35);
  setFloor(15, 35);
  // Create corridor to the right (2-high) starting outside the door.
  corridorH(14, 36, 44);
  // But keep the bottom half under the door as a wall.
  setTile(15, 36, W2);

  // Ensure *all* walkable areas are using desert floor distribution.
  // Convert any legacy stone floor tiles (0/12/24) to desert floors while
  // leaving walls/doors/objects intact.
  const LEGACY_FLOORS = new Set([F, FR, FR2]);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (LEGACY_FLOORS.has(map[r][c])) map[r][c] = floorTile();
    }
  }

  return map;
}

const L2_LARGE_MAP = buildL2();
export const L2_COLS = 60;
export const L2_ROWS = 60;

// ── LEVEL 2: The Catacombs ────────────────────────────────────────────────────
const L2_MAP = [
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  [WV, FR, F, F, F, F, FR, F, F, F, F, F, F, FR, F, F, F, F, FR, WVL],
  [WV, F, F, W, W, W, W, W, W, F, F, W, W, W, W, W, W, F, F, WVL],
  [WV, F, WVL, F, F, F, F, F, WV, F, F, WVL, F, F, F, F, F, WV, F, WVL],
  [WV, F, WVL, F, FR, F, F, F, WV, F, F, WVL, F, F, FR, F, F, WV, F, WVL],
  [WV, F, WVL, F, F, C, F, F, WV, F, F, WVL, F, C, F, F, F, WV, F, WVL],
  [WV, F, WBL, W, W, W, W, W, WBR, F, F, WBL, W, W, W, W, W, WBR, F, WVL],
  [WV, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, WVL],
  [WV, F, F, F, D, F, F, F, F, FR2, F, F, F, F, D, F, F, F, F, WVL],
  [WV, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, WVL],
  [WV, FR, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, FR, WVL],
  [WV, F, F, W, W, WBL, W, W, F, U, F, F, W, WBR, W, W, F, F, F, WVL],
  [WV, F, F, F, WVL, F, WV, F, F, F, F, F, WVL, F, WV, F, F, F, F, WVL],
  [WV, F, F, F, WBL, W, WBR, F, F, S, F, F, WBL, W, WBR, F, F, F, FR, WVL],
  [WBL, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, WBR],
];

// ── LEVEL 3: Sand Ruins ───────────────────────────────────────────────────────
const L3_MAP = [
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  [
    WV,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    WVL,
  ],
  [WV, FS, FS, W, W, W, W, FS, FS, FS, FS, FS, W, W, W, W, FS, FS, FS, WVL],
  [
    WV,
    FS,
    WVL,
    FS,
    FS,
    FS,
    WV,
    FS,
    FS,
    FS,
    FS,
    FS,
    WVL,
    FS,
    FS,
    WV,
    FS,
    FS,
    FS,
    WVL,
  ],
  [
    WV,
    FS,
    WVL,
    FS,
    C,
    FS,
    WV,
    FS,
    FS,
    FS,
    FS,
    FS,
    WVL,
    FS,
    C,
    WV,
    FS,
    FS,
    FS,
    WVL,
  ],
  [
    WV,
    FS,
    WBL,
    W,
    W,
    W,
    WBR,
    FS,
    FS,
    FS,
    FS,
    FS,
    WBL,
    W,
    W,
    WBR,
    FS,
    FS,
    FS,
    WVL,
  ],
  [
    WV,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FR,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    WVL,
  ],
  [
    WV,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    D2L,
    D2R,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    WVL,
  ],
  [
    WV,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    WVL,
  ],
  [WV, FS, FS, W, W, WBL, W, W, FS, FS, FS, W, WBR, W, W, FS, FS, FS, FS, WVL],
  [
    WV,
    FS,
    WVL,
    FS,
    FS,
    WV,
    FS,
    FS,
    FS,
    FS,
    FS,
    WVL,
    FS,
    FS,
    WV,
    FS,
    FS,
    FS,
    FS,
    WVL,
  ],
  [
    WV,
    FS,
    WVL,
    FS,
    FS,
    WV,
    FS,
    FS,
    FS,
    U,
    FS,
    WVL,
    FS,
    FS,
    WV,
    FS,
    FS,
    FS,
    FS,
    WVL,
  ],
  [
    WV,
    FS,
    WBL,
    W,
    W,
    WBR,
    FS,
    FS,
    FS,
    S,
    FS,
    WBL,
    W,
    W,
    WBR,
    FS,
    FS,
    FS,
    FS,
    WVL,
  ],
  [
    WV,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    FS,
    WVL,
  ],
  [WBL, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, WBR],
];

// ── LEVEL 4: Frozen Keep ──────────────────────────────────────────────────────
const L4_MAP = [
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  [WV, FR2, F, F, F, F, FR2, F, F, F, F, F, F, FR2, F, F, F, F, FR2, WVL],
  [WV, F, F, W, W, W, W, W, W, W, W, W, W, W, W, W, W, F, F, WVL],
  [WV, F, WVL, F, F, F, F, F, F, F, F, F, F, F, F, F, WV, F, F, WVL],
  [WV, F, WVL, F, FR2, F, W, W, W, W, W, W, W, W, F, FR2, WV, F, F, WVL],
  [WV, F, WVL, F, F, WVL, F, F, F, F, F, F, F, WV, F, F, WV, F, F, WVL],
  [WV, F, WVL, F, F, WVL, F, C, F, F, F, C, F, WV, F, F, WV, F, F, WVL],
  [WV, F, WBL, W, W, WBL, W, W, WBR, F, F, WBL, W, WBR, W, W, WBR, F, F, WVL],
  [WV, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, WVL],
  [WV, F, F, F, F, F, D2L, D2R, F, U, F, F, F, F, F, F, F, F, F, WVL],
  [WV, FR2, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, FR2, WVL],
  [WV, F, F, F, W, W, W, W, W, S, W, W, W, W, F, F, F, F, F, WVL],
  [WV, F, F, F, WVL, F, F, F, WV, F, WVL, F, F, F, WV, F, F, F, F, WVL],
  [WV, F, FR2, F, WBL, W, W, W, WBR, F, WBL, W, W, W, WBR, F, FR2, F, F, WVL],
  [WBL, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, WBR],
];

// ── LEVEL 5: Demon Throne (boss) ──────────────────────────────────────────────
const L5_MAP = [
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  [WV, FR, FR2, F, F, F, F, F, F, F, F, F, F, F, F, F, FR2, FR, F, WVL],
  [WV, F, F, F, W, W, W, W, W, W, W, W, W, W, F, F, F, F, F, WVL],
  [WV, F, F, WVL, F, FR, F, F, F, F, F, F, FR, F, WV, F, F, F, F, WVL],
  [WV, F, F, WVL, F, F, F, C, F, F, C, F, F, F, WV, F, F, F, F, WVL],
  [WV, F, F, WBL, W, W, W, W, W, W, W, W, W, W, WBR, F, F, F, F, WVL],
  [WV, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, WVL],
  [WV, F, F, F, W, W, WBL, W, W, W, W, WBR, W, W, F, F, F, F, F, WVL],
  [WV, F, F, F, WVL, F, WV, F, FR2, F, FR2, WVL, F, WV, F, F, F, F, F, WVL],
  [WV, U, F, F, WVL, F, WV, F, F, F, F, WVL, F, WV, F, F, F, F, F, WVL],
  [WV, F, F, F, WBL, W, WBR, F, F, F, F, WBL, W, WBR, F, F, F, F, F, WVL],
  [WV, F, F, F, F, F, F, F, FR, F, FR, F, F, F, F, F, F, F, F, WVL],
  [WV, F, F, W, W, W, W, W, W, W, W, W, W, W, W, W, F, F, F, WVL],
  [WV, F, F, WVL, F, F, F, F, F, F, F, F, F, F, F, WV, F, F, F, WVL],
  [WBL, W, W, WBL, W, W, W, W, W, W, W, W, W, W, W, WBR, W, W, W, WBR],
];

export const LEVELS = [
  {
    name: "The Dungeon",
    bgColor: "#0d0d18",
    floorTile: 0,
    map: L1_MAP,
    cols: 60,
    rows: 60,
    playerStart: { x: 10, y: 41 }, // Room 1 (rows 33-42), near south end
    interactables: [
      { x: 10, y: 39, type: "altar", id: "room1_altar" },
      { x: 9, y: 10, type: "lever", id: "room3_lever" },
      { x: 9, y: 13, type: "quest_chest", id: "room3_chest", symbol: 1 },
      { x: 43, y: 8, type: "secret_wall", id: "room5_secret" },
    ],
    enemies: [
      { type: "orc", x: 48, y: 36, symbol: 2 },
      { type: "troll", x: 51, y: 39, symbol: 2 },
    ],
    npcs: [
      { type: "guard", x: 29, y: 21, id: "knight_spirit", dialog: "quest" },
      { type: "healer", x: 29, y: 24, id: "room2_hint", dialog: "hint" },
    ],
    secretWalls: [
      { x: 43, y: 8 },
      { x: 43, y: 9 },
    ],
    spikes: [{ x: 13, y: 10 }],
    // Double door in R1 north wall — opened by altar sacrifice
    // Left tile (D2L=46) at col 10, right tile (D2R=47) at col 11, both at row 33
    altarDoor: [
      { x: 10, y: 33 },
      { x: 11, y: 33 },
    ],
    // Enemy that spawns right after altar sacrifice (room 1, near altar)
    altarEnemy: { type: "skeleton", x: 12, y: 39 },
  },
  {
    name: "The Abyssal Halls",
    bgColor: "#070812",
    floorTile: 0,
    map: L2_LARGE_MAP,
    cols: 60,
    rows: 60,
    // Spawn inside Room 1 on a free floor tile (no objects in L2 yet)
    // Room 1 rect is room(28, 6, 46, 22) so an interior floor like (row 37, col 14) is safe.
    playerStart: { x: 14, y: 37 },
    interactables: [],
    enemies: [
      // Room 1 combat: 3 enemies; one drops the Golden Crank quest item
      { type: "skeleton", x: 18, y: 36, drops: "golden_crank" },
      { type: "orc", x: 12, y: 40 },
      { type: "slime", x: 19, y: 42 },
    ],
    npcs: [],
  },
  {
    name: "Sand Ruins",
    bgColor: "#1a1005",
    floorTile: 48,
    map: L3_MAP,
    playerStart: { x: 9, y: 6 },
    interactables: [],
    enemies: [
      { type: "orc", x: 4, y: 3 },
      { type: "spider", x: 15, y: 3 },
      { type: "zombie", x: 4, y: 10 },
      { type: "skeleton", x: 15, y: 10 },
      { type: "bat", x: 9, y: 5 },
      { type: "slime", x: 6, y: 7 },
      { type: "orc", x: 13, y: 7 },
    ],
    npcs: [
      { type: "merchant", x: 1, y: 12 },
      { type: "guard", x: 18, y: 3 },
    ],
  },
  {
    name: "Frozen Keep",
    bgColor: "#06101a",
    floorTile: 0,
    map: L4_MAP,
    playerStart: { x: 9, y: 9 },
    interactables: [],
    enemies: [
      { type: "troll", x: 5, y: 5 },
      { type: "wizard", x: 14, y: 5 },
      { type: "orc", x: 3, y: 12 },
      { type: "skeleton", x: 15, y: 12 },
      { type: "zombie", x: 9, y: 3 },
      { type: "bat", x: 6, y: 9 },
      { type: "spider", x: 13, y: 9 },
    ],
    npcs: [
      { type: "healer", x: 18, y: 2 },
      { type: "trainer", x: 18, y: 12 },
    ],
  },
  {
    name: "Demon Throne",
    bgColor: "#0f0018",
    floorTile: 0,
    map: L5_MAP,
    playerStart: { x: 3, y: 13 },
    interactables: [],
    enemies: [
      { type: "demon", x: 9, y: 9 },
      { type: "dragon", x: 9, y: 3 },
      { type: "troll", x: 4, y: 8 },
      { type: "troll", x: 14, y: 8 },
      { type: "wizard", x: 6, y: 11 },
      { type: "wizard", x: 12, y: 11 },
      { type: "orc", x: 3, y: 11 },
      { type: "orc", x: 15, y: 11 },
    ],
    npcs: [{ type: "merchant", x: 18, y: 13 }],
  },
];
