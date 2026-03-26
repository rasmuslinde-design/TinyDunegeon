import { create } from "zustand";
import { LEVELS } from "../constants/levels.js";
import {
  WEAPON_TYPES,
  ENEMY_SPRITES,
  CHAR_CONFIGS,
} from "../constants/sprites.js";
import { SOLID_TILE_SET } from "../constants/tiles.js";
import {
  fetchLeaderboard as apiFetchLeaderboard,
  postScore as apiPostScore,
} from "../services/leaderboardApi.js";

// Tiles that are walkable even though they look like doors (open door halves)
const OPEN_DOOR_TILES = new Set([33, 34, 35]); // DO, D2OL, D2OR

function getEnemyBase(type) {
  return ENEMY_SPRITES[type] ?? { hp: 20, dmg: 5, xp: 10, speed: 1000 };
}

// Level-up mechanics are disabled (kept simple for this project phase).

const initialPlayer = {
  x: 9,
  y: 7, // grid position
  px: 9,
  py: 7, // pixel-lerp position (same as grid * RENDERED_TILE)
  hp: 80,
  maxHp: 80,
  xp: 0,
  xpNext: 999999,
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

  // ─── Scoring / Leaderboard (HTTP integration) ───────────────────────────
  // Timer-based score: faster runs => higher score.
  // Kill score: each kill adds points.
  runStartMs: 0,
  runEndMs: 0,
  killCount: 0,
  killScore: 0,
  leaderboard: null,
  submittingScore: false,
  scoreError: null,

  startRun: () => {
    const now = Date.now();
    set({ runStartMs: now, runEndMs: 0, killCount: 0, killScore: 0 });
  },

  endRun: () => {
    const now = Date.now();
    set((s) => ({ runEndMs: s.runEndMs || now }));
  },

  addKillScore: (enemyType) => {
    // Simple points table (safe default). Tweak freely.
    const pointsByType = {
      slime: 10,
      bat: 12,
      spider: 16,
      skeleton: 20,
      zombie: 24,
      orc: 30,
      wizard: 35,
      troll: 45,
      demon: 80,
      dragon: 120,
      ghost_boss: 150,
    };
    const pts = pointsByType[enemyType] ?? 15;
    set((s) => ({
      killCount: s.killCount + 1,
      killScore: s.killScore + pts,
    }));
  },

  getFinalScore: () => {
    const { runStartMs, runEndMs, killScore } = get();
    if (!runStartMs) return 0;
    const end = runEndMs || Date.now();
    const elapsedMs = Math.max(1, end - runStartMs);
    const elapsedSec = elapsedMs / 1000;
    // Base decreases with time; add killScore.
    const timeBonus = Math.max(0, Math.floor(5000 - elapsedSec * 10));
    return timeBonus + killScore;
  },

  fetchLeaderboard: async (limit = 10) => {
    set({ scoreError: null });
    const data = await apiFetchLeaderboard(limit);
    if (!data) {
      set({ leaderboard: null });
      return null;
    }
    set({ leaderboard: data });
    return data;
  },

  submitScore: async ({ name, result }) => {
    const store = get();
    const score = store.getFinalScore();
    const payload = {
      name: String(name || "Anonymous").slice(0, 18),
      score,
      result: result || "unknown", // "gameover" | "win"
      kills: store.killCount,
      seconds: Math.round(
        ((store.runEndMs || Date.now()) - (store.runStartMs || Date.now())) /
          1000,
      ),
      levelReached: store.currentLevelIndex + 1,
      charId: store.player.charId,
      ts: Date.now(),
    };

    set({ submittingScore: true, scoreError: null });
    const ok = await apiPostScore(payload);
    set({ submittingScore: false, scoreError: ok ? null : "submit_failed" });
    if (ok) await get().fetchLeaderboard(10);
    return ok;
  },

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

    // ─── Level 2: Room 2 gravestone push puzzle ───────────────────────────
    // Tile 65 = gravestone (pushable). Tile 60 = marker (visual only; not solid).
    // Rule: when the player tries to walk into a gravestone, it slides one tile
    // in the same direction if the destination tile is not solid and not occupied.
    // After any push, check markers; if all 3 are covered, spawn the ghost boss.
    if (
      get().currentLevelIndex === 1 &&
      tile === 65 &&
      (dx !== 0 || dy !== 0)
    ) {
      const pushX = nx + dx;
      const pushY = ny + dy;
      const maxCols = levelData?.cols ?? 20;
      const maxRows = levelData?.rows ?? 15;
      if (pushX < 0 || pushY < 0 || pushX >= maxCols || pushY >= maxRows) {
        return;
      }

      const destTile = levelData.map[pushY]?.[pushX] ?? 14;
      const occupiedByEnemy = enemies.some(
        (e) => e.alive && e.x === pushX && e.y === pushY,
      );
      const occupiedByPlayer = player.x === pushX && player.y === pushY;

      // Can only push onto a non-solid destination and not onto entities.
      // Markers are just floor-underlays visually, so they must be passable.
      const destSolid = SOLID_TILE_SET.has(destTile);
      if (destSolid || occupiedByEnemy || occupiedByPlayer) return;

      // Apply push (we don't try to restore "marker" visual underneath; markers
      // are represented by the quest state and are checked by coordinates).
      const newMap = levelData.map.map((row, r) =>
        row.map((cell, c) => {
          if (r === ny && c === nx) return 48; // revert to sand floor
          if (r === pushY && c === pushX) return 65;
          return cell;
        }),
      );

      set((s) => ({ levelData: { ...s.levelData, map: newMap } }));

      // Evaluate puzzle completion + spawn boss if needed.
      get().checkRoom2GravestonePuzzle();
      return;
    }
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
      190,
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

    // Start run timer when entering the first playable level.
    // (Keeps existing flow intact; calling it multiple times is harmless.)
    if (index === 0 && get().runStartMs === 0) {
      get().startRun();
    }
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
  },

  setAttackTime: (t) =>
    set((s) => ({
      player: { ...s.player, attackTime: t, attacking: true, attackAnim: 200 },
    })),

  killEnemy: (id) => {
    const { enemies } = get();
    const target = enemies.find((e) => e.id === id);
    set((s) => ({
      enemies: s.enemies.map((e) => (e.id === id ? { ...e, alive: false } : e)),
    }));

    if (target?.type) {
      get().addKillScore(target.type);
    }

    // Special drops / flags
    if (target?.drops === "golden_crank") {
      get().grantGoldenCrank();
    }
    if (target?.isMimic) {
      set((s) => ({ quest: { ...s.quest, mimicDefeated: true } }));
    }

    if (target?.isGhostBoss) {
      set((s) => ({ quest: { ...s.quest, room2GhostDefeated: true } }));
      const { levelData, currentLevelIndex } = get();
      if (levelData && currentLevelIndex === 1) {
        // Open the single door (top tile) on Room 2's right exit.
        const newMap = levelData.map.map((row, r) =>
          row.map((cell, c) => {
            if (r === 14 && c === 36) return 33;
            return cell;
          }),
        );
        set((s) => ({ levelData: { ...s.levelData, map: newMap } }));
      }
    }
  },

  damagePlayer: (amount) => {
    set((s) => {
      const hp = s.player.hp - amount;
      if (hp <= 0) {
        // Freeze timer on death so score is stable.
        get().endRun();
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

    // Level 2: "The Desert's Thirst" puzzle state
    // React state requirement: tracked here in Zustand store (React state container)
    isWaterFlowing: false,
    basinsFilled: 0,
    goldenCrankFound: false,
    desertMechanismActivated: false,
    mimicDefeated: false,

    // Level 2: Room 2 gravestone push puzzle → ghost boss → unlock right door
    room2Markers: [
      { x: 30, y: 12 },
      { x: 32, y: 12 },
      { x: 31, y: 16 },
    ],
    room2BossSpawn: { x: 31, y: 14 },
    room2GhostSpawned: false,
    room2GhostDefeated: false,

    // Snapshot of mimic boss HP so ghost boss can match it.
    mimicBossHp: 120,
  },
  setQuest: (partial) => set((s) => ({ quest: { ...s.quest, ...partial } })),

  // ─── Level 2: helpers for water puzzle + mimic ────────────────────────────
  // Adds the Golden Crank to inventory (called when a special enemy dies).
  grantGoldenCrank: () => {
    const { quest } = get();
    if (quest.goldenCrankFound) return;
    set((s) => ({
      quest: { ...s.quest, goldenCrankFound: true },
      player: {
        ...s.player,
        inventory: [
          ...s.player.inventory,
          {
            id: `golden_crank_${Date.now()}`,
            type: "quest",
            name: "Golden Crank",
            key: "golden_crank",
          },
        ],
      },
    }));
  },

  // Activate the hidden mechanism in Level 2 Room 1.
  // Requirements:
  // - must possess Golden Crank
  // - toggles isWaterFlowing
  // - swaps tiles 19→20, 7→8, 31→32 in Room 1 bounds
  // - unlocks doors (46/47 → 34/35) once all 4 basins are filled
  activateDesertMechanism: () => {
    const { levelData, currentLevelIndex, player, quest } = get();
    if (!levelData || currentLevelIndex !== 1) return "wronglevel";
    if (quest.desertMechanismActivated) return "already";

    const hasCrank = player.inventory.some((i) => i.key === "golden_crank");
    if (!hasCrank) return "nocRank";

    const ROOM1 = { r1: 28, r2: 46, c1: 6, c2: 22 };
    const toUpdate = new Set([19, 7, 31]);
    const newMap = levelData.map.map((row, r) =>
      row.map((cell, c) => {
        const inRoom1 =
          r >= ROOM1.r1 && r <= ROOM1.r2 && c >= ROOM1.c1 && c <= ROOM1.c2;
        if (!inRoom1) return cell;
        if (!toUpdate.has(cell)) return cell;
        if (cell === 19) return 20;
        if (cell === 7) return 8;
        if (cell === 31) return 32;
        return cell;
      }),
    );

    // Count filled basins
    let filled = 0;
    for (let r = ROOM1.r1; r <= ROOM1.r2; r++) {
      for (let c = ROOM1.c1; c <= ROOM1.c2; c++) {
        if (newMap[r]?.[c] === 32) filled++;
      }
    }
    // Four basins total.
    const basinsFilled = Math.min(4, filled);

    // Unlock exits only if all four basins are filled.
    // - Room 1 north exit: single door at (28,17): 45 -> 33
    // - Room 1 east exit: double door at (40,22)-(40,23): 46/47 -> 34/35
    const unlockedMap =
      basinsFilled >= 4
        ? newMap.map((row, r) =>
            row.map((cell, c) => {
              // single door
              if (r === 28 && c === 17) return 33;
              // right-side exit: single door
              if (r === 40 && c === 22) return 33;
              return cell;
            }),
          )
        : newMap;

    set((s) => ({
      quest: {
        ...s.quest,
        isWaterFlowing: true,
        desertMechanismActivated: true,
        basinsFilled,
      },
      levelData: { ...s.levelData, map: unlockedMap },
    }));

    return basinsFilled >= 4 ? "unlocked" : "flowing";
  },

  // When interacting with the mimic chest (tile 92), it becomes a high-HP enemy.
  triggerMimicEncounter: () => {
    const { levelData, currentLevelIndex, quest, enemies } = get();
    if (!levelData || currentLevelIndex !== 1) return false;
    if (quest.mimicDefeated) return false;

    const x = 16;
    const y = 22;
    // Remove the chest tile so it doesn't look lootable.
    const newMap = levelData.map.map((row, r) =>
      row.map((cell, c) => (r === y && c === x ? 48 : cell)),
    );

    // Spawn a tough mimic enemy that attacks immediately.
    // Using an existing enemy sprite type; bump HP a lot.
    const base = getEnemyBase("slime");
    const mimicHp = Math.max(120, base.hp * 4);
    const mimic = {
      type: "slime",
      x,
      y,
      id: `mimic_${Date.now()}`,
      alive: true,
      hp: mimicHp,
      maxHp: mimicHp,
      facing: "down",
      aiTimer: 0,
      path: [],
      isMimic: true,
    };

    set((s) => ({
      levelData: { ...s.levelData, map: newMap },
      quest: { ...s.quest, mimicBossHp: mimicHp },
      enemies: [...s.enemies, mimic],
    }));
    return true;
  },

  // ─── Level 2: Room 2 gravestone puzzle / ghost boss ──────────────────────
  checkRoom2GravestonePuzzle: () => {
    const { levelData, currentLevelIndex, quest } = get();
    if (!levelData || currentLevelIndex !== 1) return false;
    if (quest.room2GhostSpawned || quest.room2GhostDefeated) return false;

    const markers = quest.room2Markers ?? [];
    if (!Array.isArray(markers) || markers.length !== 3) return false;

    // A marker is covered if a gravestone (65) sits on its coordinate.
    const covered = markers.filter(
      (m) => levelData.map[m.y]?.[m.x] === 65,
    ).length;
    if (covered < 3) return false;

    get().spawnRoom2GhostBoss();
    return true;
  },

  spawnRoom2GhostBoss: () => {
    const { levelData, currentLevelIndex, quest, enemies } = get();
    if (!levelData || currentLevelIndex !== 1) return false;
    if (quest.room2GhostSpawned || quest.room2GhostDefeated) return false;

    // Match mimic HP.
    const mimicHp = quest.mimicBossHp ?? 120;

    const spec = quest.room2BossSpawn ?? { x: 31, y: 14 };
    const newEnemy = {
      type: "ghost_boss",
      x: spec.x,
      y: spec.y,
      id: `ghost_${Date.now()}`,
      alive: true,
      hp: mimicHp,
      maxHp: mimicHp,
      facing: "down",
      aiTimer: 0,
      path: [],
      isGhostBoss: true,
    };

    set((s) => ({
      quest: { ...s.quest, room2GhostSpawned: true },
      enemies: [...s.enemies, newEnemy],
    }));
    return true;
  },

  // ─── Level transitions / special triggers ─────────────────────────────────
  // Level 1 secret passage: reveal an open single-door tile (index 21) left of
  // the secret-wall tiles, which becomes an interactable exit to Level 2.
  // Door is 2 tiles high to match the 2-high secret passage.
  revealSecretExitDoor: () => {
    const { levelData, currentLevelIndex } = get();
    if (!levelData || currentLevelIndex !== 0) return;

    // Secret wall coords are defined on the level data.
    const secret = levelData.secretWalls ?? [];
    if (!Array.isArray(secret) || secret.length === 0) return;

    const doorTile = 21; // user-defined: open single door
    const newMap = levelData.map.map((row, r) =>
      row.map((cell, c) => {
        const isLeftOfSecret = secret.some((s) => s.x - 1 === c && s.y === r);
        return isLeftOfSecret ? doorTile : cell;
      }),
    );

    set((s) => ({ levelData: { ...s.levelData, map: newMap } }));
  },

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

      runStartMs: 0,
      runEndMs: 0,
      killCount: 0,
      killScore: 0,
      leaderboard: null,
      submittingScore: false,
      scoreError: null,
    }),
}));
