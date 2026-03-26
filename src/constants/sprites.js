// sprites.js — row/col positions in tilemap_packed.png (12 cols × 11 rows)
// VERIFIED by user: tile index = row*12 + col
//
//  Players  : idx 84–88   → row 7, col 0–4
//  NPCs     : idx 96–100  → row 8, col 0–4
//  Enemies A: idx 108–112 → row 9, col 0–4
//  Enemies B: idx 120–124 → row 10, col 0–4

export const SHEET_COLS = 12;
export const TILE_SIZE = 16;
export const SCALE = 3;

// Convert flat tile index → { row, col }
function rc(idx) {
  return { row: Math.floor(idx / SHEET_COLS), col: idx % SHEET_COLS };
}

// ── PLAYER SPRITES ────────────────────────────────────────────────────────────
// Indices 84, 85, 86, 87, 88  (row 7, col 0–4)
// Visual order on spritesheet: 84=idx0, 85=idx1, 86=idx2, 87=idx3, 88=idx4
// Character mapping:
//   idx 84 → Mage     (was knight)
//   idx 85 → Rogue    (was mage)
//   idx 86 → Blacksmith (was rogue)
//   idx 87 → Paladin  (was ranger)
//   idx 88 → Warrior  (was paladin)
export const PLAYER_SPRITES = {
  mage: rc(84),
  rogue: rc(85),
  blacksmith: rc(86),
  paladin: rc(87),
  warrior: rc(88),
};

// Character selection list (order matters for CharSelectScreen)
export const PLAYER_LIST = [
  {
    id: "mage",
    label: "Mage",
    description: "Ranged magic attacks",
    unlocked: true,
    ...rc(84),
  },
  {
    id: "rogue",
    label: "Rogue",
    description: "Lightning-fast melee strikes",
    unlocked: true,
    ...rc(85),
  },
  {
    id: "blacksmith",
    label: "Blacksmith",
    description: "Balanced melee, extra tough",
    unlocked: true,
    ...rc(86),
  },
  {
    id: "paladin",
    label: "Paladin",
    description: "Switch melee/ranged [X]",
    unlocked: true,
    ...rc(87),
  },
  {
    id: "warrior",
    label: "Warrior",
    description: "Slow but devastating hits",
    unlocked: true,
    ...rc(88),
  },
];

// ── NPC SPRITES ───────────────────────────────────────────────────────────────
// Indices 96, 97, 98, 99, 100  (row 8, col 0–4)
export const NPC_SPRITES = {
  merchant: rc(96),
  trainer: rc(97),
  healer: rc(98),
  guard: rc(99),
  blacksmith: rc(100),
};

// ── ENEMY SPRITES + STATS ─────────────────────────────────────────────────────
// Group A: 108–112  (row 9, col 0–4)
// Group B: 120–124  (row 10, col 0–4)
export const ENEMY_SPRITES = {
  // Tier 1 — easy (nõrgemad, et spell-attack töötaks)
  slime: {
    ...rc(108),
    label: "Slime",
    hp: 22,
    dmg: 2,
    xp: 8,
    speed: 650,
    behavior: "wander",
  },
  bat: {
    ...rc(109),
    label: "Bat",
    hp: 16,
    dmg: 3,
    xp: 10,
    speed: 300,
    behavior: "erratic",
  },
  spider: {
    ...rc(110),
    label: "Spider",
    hp: 28,
    dmg: 4,
    xp: 14,
    speed: 450,
    behavior: "stalk",
  },
  // Tile index 111 is a "dark mage" visual in this project — make it ranged.
  // Keeping the key as "skeleton" to avoid touching existing level data.
  skeleton: {
    ...rc(111),
    label: "Dark Mage",
    hp: 32,
    dmg: 7,
    xp: 24,
    speed: 520,
    behavior: "ranged",
  },
  zombie: {
    ...rc(112),
    label: "Zombie",
    hp: 45,
    dmg: 6,
    xp: 22,
    speed: 700,
    behavior: "wander",
  },
  // Tier 2 — medium
  orc: {
    ...rc(120),
    label: "Orc",
    hp: 60,
    dmg: 9,
    xp: 35,
    speed: 650,
    behavior: "charge",
  },
  wizard: {
    ...rc(121),
    label: "Wizard",
    hp: 40,
    dmg: 11,
    xp: 40,
    speed: 700,
    behavior: "ranged",
  },
  // Level 2 Room 2 boss: uses tile 121 visual but custom hybrid behavior.
  ghost_boss: {
    ...rc(121),
    label: "Ghost",
    hp: 120,
    dmg: 11,
    xp: 90,
    speed: 600,
    behavior: "hybrid_boss",
  },
  troll: {
    ...rc(122),
    label: "Troll",
    hp: 95,
    dmg: 14,
    xp: 55,
    speed: 820,
    behavior: "guard",
  },
  demon: {
    ...rc(123),
    label: "Demon",
    hp: 160,
    dmg: 20,
    xp: 80,
    speed: 680,
    behavior: "boss",
  },
  dragon: {
    ...rc(124),
    label: "Dragon",
    hp: 260,
    dmg: 28,
    xp: 150,
    speed: 620,
    behavior: "boss",
  },
};

// ── WEAPON TYPES ──────────────────────────────────────────────────────────────
export const WEAPON_TYPES = {
  // Mage — ranged magic staff (primary weapon)
  staff: {
    id: "staff",
    name: "Magic Staff",
    type: "magic",
    dmg: 14,
    range: 6,
    cooldown: 500,
    color: "#60a5fa",
    speed: 5,
  },
  // Rogue — fast dagger
  dagger: {
    id: "dagger",
    name: "Sharp Dagger",
    type: "melee",
    dmg: 7,
    range: 1,
    cooldown: 180,
  },
  // Warrior — slow heavy axe
  axe: {
    id: "axe",
    name: "War Axe",
    type: "melee",
    dmg: 18,
    range: 1,
    cooldown: 650,
  },
  // Blacksmith — balanced hammer
  hammer: {
    id: "hammer",
    name: "Iron Hammer",
    type: "melee",
    dmg: 12,
    range: 1,
    cooldown: 400,
  },
  // Paladin — melee sword (default mode)
  sword: {
    id: "sword",
    name: "Holy Sword",
    type: "melee",
    dmg: 11,
    range: 1,
    cooldown: 380,
  },
  // Paladin — ranged holy bolt (alt mode, bigger cooldown than mage)
  holybolt: {
    id: "holybolt",
    name: "Holy Bolt",
    type: "magic",
    dmg: 16,
    range: 7,
    cooldown: 800,
    color: "#fde68a",
    speed: 5,
  },
  // Spell (Z key) — available to all characters
  spell: {
    id: "spell",
    name: "Magic Bolt",
    type: "magic",
    dmg: 18,
    range: 8,
    cooldown: 1500,
    color: "#a78bfa",
    speed: 7,
  },
  fireball: {
    id: "fireball",
    name: "Fireball Gem",
    type: "magic",
    dmg: 22,
    range: 6,
    cooldown: 700,
    color: "#f97316",
    speed: 5,
  },
};

// ── CHARACTER CONFIGS ─────────────────────────────────────────────────────────
// Maps charId to starting weapon + stat modifiers
export const CHAR_CONFIGS = {
  mage: { weapon: "staff", hp: 80, atk: 8 },
  rogue: { weapon: "dagger", hp: 90, atk: 10 },
  warrior: { weapon: "axe", hp: 110, atk: 14 },
  blacksmith: { weapon: "hammer", hp: 130, atk: 11 },
  paladin: { weapon: "sword", hp: 100, atk: 10 },
};

// ── SHOP ITEMS ────────────────────────────────────────────────────────────────
export const SHOP_ITEMS = [
  { id: "hp_pot", label: "HP Potion", cost: 15, type: "potion", heal: 30 },
  { id: "hp_pot2", label: "Mega Potion", cost: 35, type: "potion", heal: 70 },
];
