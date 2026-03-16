// sprites.js — row/col positions in tilemap_packed.png (12 cols × 11 rows)
// VERIFIED by user: tile index = row*12 + col
//
//  Players  : idx 84–88   → row 7, col 0–4
//  NPCs     : idx 96–100  → row 8, col 0–4
//  Enemies A: idx 108–112 → row 9, col 0–4
//  Enemies B: idx 120–124 → row 10, col 0–4

export const SHEET_COLS = 12;
export const TILE_SIZE  = 16;
export const SCALE      = 3;

// Convert flat tile index → { row, col }
function rc(idx) {
  return { row: Math.floor(idx / SHEET_COLS), col: idx % SHEET_COLS };
}

// ── PLAYER SPRITES ────────────────────────────────────────────────────────────
// Indices 84, 85, 86, 87, 88  (row 7, col 0–4)
export const PLAYER_SPRITES = {
  knight:  rc(84),
  mage:    rc(85),
  rogue:   rc(86),
  ranger:  rc(87),
  paladin: rc(88),
};

// Character selection list (order matters for CharSelectScreen)
export const PLAYER_LIST = [
  { id: 'knight',  label: 'Knight',  description: 'Sturdy warrior, heavy sword',      unlocked: true,  ...rc(84) },
  { id: 'mage',    label: 'Mage',    description: 'Magic staff, fires spells',         unlocked: false, ...rc(85) },
  { id: 'rogue',   label: 'Rogue',   description: 'Fast dagger, high crit',            unlocked: false, ...rc(86) },
  { id: 'ranger',  label: 'Ranger',  description: 'Ranged attacks, swift movement',    unlocked: false, ...rc(87) },
  { id: 'paladin', label: 'Paladin', description: 'Holy power, self-heals',            unlocked: false, ...rc(88) },
];

// ── NPC SPRITES ───────────────────────────────────────────────────────────────
// Indices 96, 97, 98, 99, 100  (row 8, col 0–4)
export const NPC_SPRITES = {
  merchant:   rc(96),
  trainer:    rc(97),
  healer:     rc(98),
  guard:      rc(99),
  blacksmith: rc(100),
};

// ── ENEMY SPRITES + STATS ─────────────────────────────────────────────────────
// Group A: 108–112  (row 9, col 0–4)
// Group B: 120–124  (row 10, col 0–4)
export const ENEMY_SPRITES = {
  // Tier 1 — easy
  slime:    { ...rc(108), label: 'Slime',    hp: 18,  dmg: 3,  xp: 8,   speed: 950,  behavior: 'wander'  },
  bat:      { ...rc(109), label: 'Bat',      hp: 12,  dmg: 4,  xp: 10,  speed: 420,  behavior: 'erratic' },
  spider:   { ...rc(110), label: 'Spider',   hp: 22,  dmg: 5,  xp: 14,  speed: 600,  behavior: 'stalk'   },
  skeleton: { ...rc(111), label: 'Skeleton', hp: 30,  dmg: 7,  xp: 20,  speed: 820,  behavior: 'patrol'  },
  zombie:   { ...rc(112), label: 'Zombie',   hp: 38,  dmg: 8,  xp: 22,  speed: 1100, behavior: 'wander'  },
  // Tier 2 — hard
  orc:      { ...rc(120), label: 'Orc',      hp: 50,  dmg: 12, xp: 35,  speed: 980,  behavior: 'charge'  },
  wizard:   { ...rc(121), label: 'Wizard',   hp: 32,  dmg: 15, xp: 40,  speed: 1100, behavior: 'ranged'  },
  troll:    { ...rc(122), label: 'Troll',    hp: 80,  dmg: 18, xp: 55,  speed: 1300, behavior: 'guard'   },
  demon:    { ...rc(123), label: 'Demon',    hp: 120, dmg: 25, xp: 80,  speed: 950,  behavior: 'boss'    },
  dragon:   { ...rc(124), label: 'Dragon',   hp: 200, dmg: 35, xp: 150, speed: 850,  behavior: 'boss'    },
};

// ── WEAPON TYPES ──────────────────────────────────────────────────────────────
export const WEAPON_TYPES = {
  sword:    { id: 'sword',    name: 'Iron Sword',    type: 'melee',  dmg: 10, range: 1, cooldown: 400  },
  dagger:   { id: 'dagger',   name: 'Steel Dagger',  type: 'melee',  dmg: 6,  range: 1, cooldown: 220  },
  axe:      { id: 'axe',      name: 'Battle Axe',    type: 'melee',  dmg: 14, range: 1, cooldown: 560  },
  staff:    { id: 'staff',    name: 'Magic Staff',   type: 'magic',  dmg: 14, range: 5, cooldown: 500  },
  fireball: { id: 'fireball', name: 'Fireball Gem',  type: 'magic',  dmg: 22, range: 6, cooldown: 700  },
};

// ── SHOP ITEMS ────────────────────────────────────────────────────────────────
export const SHOP_ITEMS = [
  { id: 'sword',         label: 'Iron Sword',    cost: 30,  type: 'weapon', weaponId: 'sword'    },
  { id: 'dagger',        label: 'Steel Dagger',  cost: 20,  type: 'weapon', weaponId: 'dagger'   },
  { id: 'axe',           label: 'Battle Axe',    cost: 45,  type: 'weapon', weaponId: 'axe'      },
  { id: 'staff',         label: 'Magic Staff',   cost: 60,  type: 'weapon', weaponId: 'staff'    },
  { id: 'fireball',      label: 'Fireball Gem',  cost: 90,  type: 'weapon', weaponId: 'fireball' },
  { id: 'hp_pot',        label: 'HP Potion',     cost: 15,  type: 'potion', heal: 30             },
  { id: 'hp_pot2',       label: 'Mega Potion',   cost: 35,  type: 'potion', heal: 70             },
  { id: 'unlock_mage',   label: 'Unlock Mage',   cost: 100, type: 'unlock', charId: 'mage'       },
  { id: 'unlock_rogue',  label: 'Unlock Rogue',  cost: 100, type: 'unlock', charId: 'rogue'      },
  { id: 'unlock_ranger', label: 'Unlock Ranger', cost: 150, type: 'unlock', charId: 'ranger'     },
];
