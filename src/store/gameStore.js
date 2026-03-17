import { create } from "zustand";
import { LEVELS } from "../constants/levels.js";
import {
  WEAPON_TYPES,
  ENEMY_SPRITES,
  CHAR_CONFIGS,
} from "../constants/sprites.js";
import { SOLID_TILE_SET } from "../constants/tiles.js";

// Tiles that are walkable even though they look like doors (open door halves)
const OPEN_DOOR_TILES = new Set([33, 34, 35]); // DO, D2OL, D2OR

function getEnemyBase(type) {
  return ENEMY_SPRITES[type] ?? { hp: 20, dmg: 5, xp: 10, speed: 1000 };
}

const XP_PER_LEVEL = (lvl) => lvl * 50;

const initialPlayer = {
  x: 9,
  y: 7, // grid position
  px: 9,
  py: 7, // pixel-lerp position (same as grid * RENDERED_TILE)
  hp: 80,
  maxHp: 80,
  xp: 0,
  xpNext: 50,
  level: 1,
  gold: 0,
  atk: 8,
  charId: "mage",
  weapon: WEAPON_TYPES.staff,
  inventory: [],
  facing: "down", // up | down | left | right
  moving: false,
  attacking: false,
  attackAnim: 0, // ms remaining
  spellTime: 0, // timestamp of last spell cast (for cooldown)
  spellCooldown: 2000, // ms — 2 seconds
  paladinMode: "melee", // paladin only: "melee" or "ranged"
};

export const useGameStore = create((set, get) => ({
  // ─── Screens ───────────────────────────────────────────────────────────────
  screen: "title", // title | charselect | game | gameover | win
  setScreen: (s) => set({ screen: s }),

  // ─── Level ─────────────────────────────────────────────────────────────────
  currentLevelIndex: 0,
  levelData: LEVELS[0],

  // ─── Player ────────────────────────────────────────────────────────────────
  player: { ...initialPlayer },

  setPlayer: (partial) => set((s) => ({ player: { ...s.player, ...partial } })),

  movePlayer: (dx, dy) => {
    const { player, levelData, enemies, quest } = get();
    const nx = player.x + dx;
    const ny = player.y + dy;
    const maxCols = levelData?.cols ?? 20;
    const maxRows = levelData?.rows ?? 15;
    if (nx < 0 || ny < 0 || nx >= maxCols || ny >= maxRows) return;

    const tile = levelData.map[ny]?.[nx] ?? 14;
    // Open door halves and quest secret wall are passable
    if (OPEN_DOOR_TILES.has(tile)) {
      // always passable
    } else if (SOLID_TILE_SET.has(tile)) {
      // Secret wall (tile 40) is passable ONLY at the exact secret wall coords
      if (tile === 40 && quest.secretWallFound) {
        const secretCoords = levelData.secretWalls ?? [];
        const isSecretPos = secretCoords.some((s) => s.x === nx && s.y === ny);
        if (!isSecretPos) return; // not a secret wall location — blocked
      } else {
        return; // blocked
      }
    }

    // Occupied by enemy?
    const blocked = enemies.some((e) => e.alive && e.x === nx && e.y === ny);
    if (blocked) return;

    const facing =
      dx === 1 ? "right" : dx === -1 ? "left" : dy === 1 ? "down" : "up";
    set((s) => ({
      player: { ...s.player, x: nx, y: ny, facing, moving: true },
    }));
    setTimeout(
      () => set((s) => ({ player: { ...s.player, moving: false } })),
      150,
    );
  },

  // ─── Enemies ───────────────────────────────────────────────────────────────
  enemies: [],

  initLevel: (index) => {
    const lvl = LEVELS[index];
    const es = lvl.enemies.map((e, i) => ({
      ...e,
      id: `e${index}_${i}`,
      alive: true,
      hp: getEnemyBase(e.type).hp,
      maxHp: getEnemyBase(e.type).hp,
      facing: "down",
      aiTimer: 0,
      path: [],
    }));
    set({
      currentLevelIndex: index,
      levelData: lvl,
      enemies: es,
      npcs: lvl.npcs.map((n, i) => ({ ...n, id: `n${index}_${i}` })),
      projectiles: [],
      particles: [],
      player: {
        ...get().player,
        x: lvl.playerStart.x,
        y: lvl.playerStart.y,
        facing: "down",
      },
    });
  },

  updateEnemy: (id, partial) =>
    set((s) => ({
      enemies: s.enemies.map((e) => (e.id === id ? { ...e, ...partial } : e)),
    })),

  damageEnemy: (id, amount) =>
    set((s) => ({
      enemies: s.enemies.map((e) =>
        e.id === id ? { ...e, hp: e.hp - amount } : e,
      ),
    })),

  addXp: (amount) => {
    set((s) => ({
      player: {
        ...s.player,
        xp: s.player.xp + amount,
        gold: s.player.gold + Math.floor(amount / 2),
      },
    }));
    const p = get().player;
    if (p.xp >= p.xpNext) get().levelUp();
  },

  setAttackTime: (t) =>
    set((s) => ({
      player: { ...s.player, attackTime: t, attacking: true, attackAnim: 200 },
    })),

  killEnemy: (id) => {
    set((s) => ({
      enemies: s.enemies.map((e) => (e.id === id ? { ...e, alive: false } : e)),
    }));
  },

  levelUp: () =>
    set((s) => {
      const newLvl = s.player.level + 1;
      return {
        player: {
          ...s.player,
          level: newLvl,
          atk: s.player.atk + 5,
          maxHp: s.player.maxHp + 20,
          hp: Math.min(s.player.hp + 20, s.player.maxHp + 20),
          xp: s.player.xp - s.player.xpNext,
          xpNext: XP_PER_LEVEL(newLvl),
        },
        particles: [
          ...s.particles,
          {
            id: Date.now(),
            type: "levelup",
            x: s.player.x,
            y: s.player.y,
            life: 1500,
          },
        ],
      };
    }),

  damagePlayer: (amount) => {
    set((s) => {
      const hp = s.player.hp - amount;
      if (hp <= 0) {
        return { player: { ...s.player, hp: 0 }, screen: "gameover" };
      }
      return { player: { ...s.player, hp } };
    });
  },

  healPlayer: (amount) =>
    set((s) => ({
      player: {
        ...s.player,
        hp: Math.min(s.player.hp + amount, s.player.maxHp),
      },
    })),

  // ─── NPCs ──────────────────────────────────────────────────────────────────
  npcs: [],
  activeNpc: null,
  setActiveNpc: (npc) => set({ activeNpc: npc }),

  buyItem: (item) => {
    const { player } = get();
    if (player.gold < item.cost) return false;
    set((s) => {
      let updates = { gold: s.player.gold - item.cost };
      if (item.type === "weapon") {
        updates.weapon = WEAPON_TYPES[item.weaponId];
      } else if (item.type === "potion") {
        updates.inventory = [
          ...s.player.inventory,
          { ...item, id: Date.now() },
        ];
      } else if (item.type === "unlock") {
        // unlock character handled in charselect
        updates.inventory = [
          ...s.player.inventory,
          { ...item, id: Date.now() },
        ];
      }
      return { player: { ...s.player, ...updates } };
    });
    return true;
  },

  usePotion: () => {
    const { player } = get();
    const idx = player.inventory.findIndex((i) => i.type === "potion");
    if (idx === -1) return;
    const item = player.inventory[idx];
    set((s) => ({
      player: {
        ...s.player,
        hp: Math.min(s.player.hp + item.heal, s.player.maxHp),
        inventory: s.player.inventory.filter((_, i) => i !== idx),
      },
    }));
  },

  // ─── Projectiles ───────────────────────────────────────────────────────────
  projectiles: [],

  spawnProjectile: (proj) =>
    set((s) => ({
      projectiles: [
        ...s.projectiles,
        { ...proj, id: Date.now() + Math.random() },
      ],
    })),

  updateProjectile: (id, partial) =>
    set((s) => ({
      projectiles: s.projectiles.map((p) =>
        p.id === id ? { ...p, ...partial } : p,
      ),
    })),

  removeProjectile: (id) =>
    set((s) => ({ projectiles: s.projectiles.filter((p) => p.id !== id) })),

  // ─── Particles ─────────────────────────────────────────────────────────────
  particles: [],

  spawnParticle: (p) =>
    set((s) => ({
      particles: [...s.particles, { ...p, id: Date.now() + Math.random() }],
    })),

  removeParticle: (id) =>
    set((s) => ({ particles: s.particles.filter((p) => p.id !== id) })),

  // ─── Quest / Level-1 state ─────────────────────────────────────────────────
  quest: {
    symbolPieces: 0, // 0–3 collected
    altarUsed: false, // room1 altar activated
    room2DoorOpen: false, // door between room1↔room2
    leverPulled: false, // room3 lever state
    spikesVisible: false, // room3 spikes visible after lever
    secretWallFound: false, // room5 secret passage found
    knightSpiritTalked: false, // room2 NPC talked to
  },
  setQuest: (partial) => set((s) => ({ quest: { ...s.quest, ...partial } })),

  useAltar: () => {
    const { player, quest } = get();
    if (quest.altarUsed) return "already";
    if (player.hp <= 10) return "notenough";
    set((s) => ({
      player: { ...s.player, hp: s.player.hp - 10 },
      quest: { ...s.quest, altarUsed: true, room2DoorOpen: true },
    }));
    // Open the double door tiles and spawn the guardian enemy
    get().openAltarDoor();
    get().spawnAltarEnemy();
    return "ok";
  },

  // Replace double-door tiles (46, 47) → open door floors (34, 35)
  openAltarDoor: () => {
    const { levelData } = get();
    const doors = levelData?.altarDoor;
    if (!doors || !Array.isArray(doors)) return;
    // doors = [{x:10,y:32}, {x:11,y:32}]
    const openTiles = [34, 35]; // D2OL, D2OR
    const newMap = levelData.map.map((row, r) =>
      row.map((cell, c) => {
        const idx = doors.findIndex((d) => d.x === c && d.y === r);
        if (idx !== -1) return openTiles[idx] ?? 34;
        return cell;
      }),
    );
    set((s) => ({ levelData: { ...s.levelData, map: newMap } }));
  },

  // Spawn the altar guardian enemy near the altar
  spawnAltarEnemy: () => {
    const { levelData, enemies, currentLevelIndex } = get();
    const spec = levelData?.altarEnemy;
    if (!spec) return;
    const base = getEnemyBase(spec.type);
    const newEnemy = {
      ...spec,
      id: `altar_guardian_${Date.now()}`,
      alive: true,
      hp: base.hp,
      maxHp: base.hp,
      facing: "left",
      aiTimer: 0,
      path: [],
    };
    set((s) => ({ enemies: [...s.enemies, newEnemy] }));
  },

  pullLever: () => {
    set((s) => ({
      quest: { ...s.quest, leverPulled: true, spikesVisible: true },
    }));
  },

  collectSymbol: (n) => {
    set((s) => ({
      quest: {
        ...s.quest,
        symbolPieces: Math.min(3, s.quest.symbolPieces + 1),
      },
      player: {
        ...s.player,
        inventory: [
          ...s.player.inventory,
          {
            id: `symbol_${n}_${Date.now()}`,
            type: "symbol",
            name: `Symbol ${n}`,
            n,
          },
        ],
      },
    }));
  },

  collectInvisPotion: () => {
    set((s) => ({
      player: {
        ...s.player,
        inventory: [
          ...s.player.inventory,
          {
            id: `invis_${Date.now()}`,
            type: "invis_potion",
            name: "Invisibility Potion",
            heal: 0,
          },
        ],
      },
    }));
  },

  // ─── Combat settings ───────────────────────────────────────────────────────
  autoAim: true,
  toggleAutoAim: () => set((s) => ({ autoAim: !s.autoAim })),

  // ─── Character selection ───────────────────────────────────────────────────
  unlockedChars: ["mage", "rogue", "blacksmith", "paladin", "warrior"],
  unlockChar: (id) =>
    set((s) => ({
      unlockedChars: s.unlockedChars.includes(id)
        ? s.unlockedChars
        : [...s.unlockedChars, id],
    })),

  selectChar: (charId) => {
    const cfg = CHAR_CONFIGS[charId] ?? CHAR_CONFIGS.mage;
    const weapon = WEAPON_TYPES[cfg.weapon] ?? WEAPON_TYPES.staff;
    set((s) => ({
      player: {
        ...s.player,
        charId,
        weapon,
        hp: cfg.hp,
        maxHp: cfg.hp,
        atk: cfg.atk,
        paladinMode: charId === "paladin" ? "melee" : "melee",
      },
    }));
  },

  // Paladin weapon toggle (X key)
  togglePaladinMode: () => {
    set((s) => {
      if (s.player.charId !== "paladin") return {};
      const newMode = s.player.paladinMode === "melee" ? "ranged" : "melee";
      const weapon =
        newMode === "melee" ? WEAPON_TYPES.sword : WEAPON_TYPES.holybolt;
      return {
        player: { ...s.player, paladinMode: newMode, weapon },
      };
    });
  },

  // ─── Helpers ───────────────────────────────────────────────────────────────
  resetGame: () =>
    set({
      screen: "title",
      currentLevelIndex: 0,
      levelData: LEVELS[0],
      player: { ...initialPlayer },
      enemies: [],
      npcs: [],
      projectiles: [],
      particles: [],
    }),
}));
