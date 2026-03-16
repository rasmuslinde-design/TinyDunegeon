// Tilemap: tilemap_packed.png
// VERIFIED by user inspection of tileviewer.html
//
// WALKABLE FLOORS:
//   0  = stone floor (normal)
//   12 = stone floor with rocks
//   24 = stone floor with rocks (variant)
//   48–53 = sand-style walkable floor
//
// WALLS (solid, block movement):
//   13 = wall top-to-bottom, outer side on RIGHT
//   14 = wall left-to-right (horizontal)
//   15 = wall top-to-bottom, outer side on LEFT
//   16 = wall corner bottom-left
//   17 = wall corner bottom-right
//   40 = wall left-to-right (horizontal variant)
//
// DOORS:
//   33 = single door OPEN
//   45 = single door CLOSED
//   34 = double door open  — LEFT half
//   35 = double door open  — RIGHT half
//   46 = double door closed — LEFT half
//   47 = double door closed — RIGHT half
//
// CHARACTERS (row × 12 + col):
//   84–88  = player characters
//   96–100 = friendly NPCs
//   108–112 = enemies A
//   120–124 = enemies B

export const TILE_SIZE     = 16;
export const SCALE         = 3;
export const RENDERED_TILE = TILE_SIZE * SCALE;   // 48px
export const SHEET_COLS    = 12;
export const SHEET_ROWS    = 11;

export function tileUV(index) {
  const col = index % SHEET_COLS;
  const row = Math.floor(index / SHEET_COLS);
  return { x: col * TILE_SIZE, y: row * TILE_SIZE };
}

// ── TILE CONSTANTS ────────────────────────────────────────────────────────────

export const TILES = {
  // Walkable floors
  FLOOR_STONE:      0,   // normal stone
  FLOOR_STONE_R1:  12,   // stone + rocks variant A
  FLOOR_STONE_R2:  24,   // stone + rocks variant B
  FLOOR_SAND_A:    48,
  FLOOR_SAND_B:    49,
  FLOOR_SAND_C:    50,
  FLOOR_SAND_D:    51,
  FLOOR_SAND_E:    52,
  FLOOR_SAND_F:    53,

  // Walls — block movement
  WALL_H:          14,   // horizontal wall (left→right)
  WALL_H2:         40,   // horizontal wall variant
  WALL_V_R:        13,   // vertical wall, outer face RIGHT
  WALL_V_L:        15,   // vertical wall, outer face LEFT
  WALL_CORNER_BL:  16,   // corner bottom-left
  WALL_CORNER_BR:  17,   // corner bottom-right

  // Doors
  DOOR_OPEN:       33,   // single door open
  DOOR_CLOSED:     45,   // single door closed
  DOOR2_OPEN_L:    34,   // double door open, left half
  DOOR2_OPEN_R:    35,   // double door open, right half
  DOOR2_CLOSED_L:  46,   // double door closed, left half
  DOOR2_CLOSED_R:  47,   // double door closed, right half

  // Stairs
  STAIRS_DOWN:     60,
  STAIRS_UP:       61,

  // Decorations / interactables
  CHEST:           55,
  TORCH:           51,
  BARREL:          48,
  CRATE:           49,

  // Characters (not rendered as tiles, but useful for reference)
  PLAYER_0:        84,
  PLAYER_1:        85,
  PLAYER_2:        86,
  PLAYER_3:        87,
  PLAYER_4:        88,

  NPC_0:           96,
  NPC_1:           97,
  NPC_2:           98,
  NPC_3:           99,
  NPC_4:          100,

  ENEMY_0:        108,
  ENEMY_1:        109,
  ENEMY_2:        110,
  ENEMY_3:        111,
  ENEMY_4:        112,
  ENEMY_5:        120,
  ENEMY_6:        121,
  ENEMY_7:        122,
  ENEMY_8:        123,
  ENEMY_9:        124,
};

// ── Tiles that block movement ─────────────────────────────────────────────────
export const SOLID_TILE_SET = new Set([
  // Walls
  13, 14, 15, 16, 17, 40,
  // Doors (closed)
  45, 46, 47,
  // Blocking decorations
  TILES.CHEST, TILES.BARREL, TILES.CRATE,
]);

// ── Short aliases for level maps ──────────────────────────────────────────────
export const F  = TILES.FLOOR_STONE;       // 0   normal floor
export const FR = TILES.FLOOR_STONE_R1;    // 12  floor with rocks
export const FR2= TILES.FLOOR_STONE_R2;    // 24  floor with rocks v2
export const FS = TILES.FLOOR_SAND_A;      // 48  sand floor
export const W  = TILES.WALL_H;            // 14  horizontal wall
export const W2 = TILES.WALL_H2;           // 40  horizontal wall v2
export const WV = TILES.WALL_V_R;          // 13  vertical wall (face right)
export const WVL= TILES.WALL_V_L;          // 15  vertical wall (face left)
export const WBL= TILES.WALL_CORNER_BL;    // 16  corner bottom-left
export const WBR= TILES.WALL_CORNER_BR;    // 17  corner bottom-right
export const D  = TILES.DOOR_CLOSED;       // 45
export const DO = TILES.DOOR_OPEN;         // 33
export const D2L= TILES.DOOR2_CLOSED_L;    // 46
export const D2R= TILES.DOOR2_CLOSED_R;    // 47
export const S  = TILES.STAIRS_DOWN;       // 60
export const U  = TILES.STAIRS_UP;         // 61
export const T  = TILES.TORCH;             // 51 (also sand floor tile - only use as deco)
export const C  = TILES.CHEST;             // 55
export const B  = TILES.BARREL;            // 48 (also sand tile - careful)
