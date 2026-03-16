import { create } from 'zustand';
import { LEVELS }           from '../constants/levels.js';
import { WEAPON_TYPES }     from '../constants/sprites.js';
import { SOLID_TILE_SET }   from '../constants/tiles.js';

const XP_PER_LEVEL = (lvl) => lvl * 50;

const initialPlayer = {
  x: 9, y: 7,          // grid position
  px: 9, py: 7,        // pixel-lerp position (same as grid * RENDERED_TILE)
  hp: 100,
  maxHp: 100,
  xp: 0,
  xpNext: 50,
  level: 1,
  gold: 0,
  atk: 10,
  charId: 'knight',
  weapon: WEAPON_TYPES.sword,
  inventory: [],
  facing: 'down',       // up | down | left | right
  moving: false,
  attacking: false,
  attackAnim: 0,        // ms remaining
};

export const useGameStore = create((set, get) => ({
  // ─── Screens ───────────────────────────────────────────────────────────────
  screen: 'title',      // title | charselect | game | gameover | win
  setScreen: (s) => set({ screen: s }),

  // ─── Level ─────────────────────────────────────────────────────────────────
  currentLevelIndex: 0,
  levelData: LEVELS[0],

  // ─── Player ────────────────────────────────────────────────────────────────
  player: { ...initialPlayer },

  setPlayer: (partial) =>
    set((s) => ({ player: { ...s.player, ...partial } })),

  movePlayer: (dx, dy) => {
    const { player, levelData, enemies } = get();
    const nx = player.x + dx;
    const ny = player.y + dy;
    if (nx < 0 || ny < 0 || nx >= 20 || ny >= 15) return;

    const tile = levelData.map[ny][nx];
    if (SOLID_TILE_SET.has(tile)) return;

    // Occupied by enemy?
    const blocked = enemies.some(e => e.alive && e.x === nx && e.y === ny);
    if (blocked) return;

    const facing = dx === 1 ? 'right' : dx === -1 ? 'left' : dy === 1 ? 'down' : 'up';
    set((s) => ({
      player: { ...s.player, x: nx, y: ny, facing, moving: true },
    }));
    setTimeout(() => set((s) => ({ player: { ...s.player, moving: false } })), 150);
  },

  // ─── Enemies ───────────────────────────────────────────────────────────────
  enemies: [],

  initLevel: (index) => {
    const lvl = LEVELS[index];
    const es  = lvl.enemies.map((e, i) => ({
      ...e,
      id: `e${index}_${i}`,
      alive: true,
      hp: getEnemyBase(e.type).hp,
      maxHp: getEnemyBase(e.type).hp,
      facing: 'down',
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
        facing: 'down',
      },
    });
  },

  updateEnemy: (id, partial) =>
    set((s) => ({
      enemies: s.enemies.map(e => e.id === id ? { ...e, ...partial } : e),
    })),

  damageEnemy: (id, amount) =>
    set((s) => ({
      enemies: s.enemies.map(e =>
        e.id === id ? { ...e, hp: e.hp - amount } : e
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
    set((s) => ({ player: { ...s.player, attackTime: t, attacking: true, attackAnim: 200 } })),

  killEnemy: (id) => {
    set((s) => ({
      enemies: s.enemies.map(e => e.id === id ? { ...e, alive: false } : e),
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
          { id: Date.now(), type: 'levelup', x: s.player.x, y: s.player.y, life: 1500 },
        ],
      };
    }),

  damagePlayer: (amount) => {
    set((s) => {
      const hp = s.player.hp - amount;
      if (hp <= 0) {
        return { player: { ...s.player, hp: 0 }, screen: 'gameover' };
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
      if (item.type === 'weapon') {
        updates.weapon = WEAPON_TYPES[item.weaponId];
      } else if (item.type === 'potion') {
        updates.inventory = [
          ...s.player.inventory,
          { ...item, id: Date.now() },
        ];
      } else if (item.type === 'unlock') {
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
    const idx = player.inventory.findIndex(i => i.type === 'potion');
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
    set((s) => ({ projectiles: [...s.projectiles, { ...proj, id: Date.now() + Math.random() }] })),

  updateProjectile: (id, partial) =>
    set((s) => ({
      projectiles: s.projectiles.map(p => p.id === id ? { ...p, ...partial } : p),
    })),

  removeProjectile: (id) =>
    set((s) => ({ projectiles: s.projectiles.filter(p => p.id !== id) })),

  // ─── Particles ─────────────────────────────────────────────────────────────
  particles: [],

  spawnParticle: (p) =>
    set((s) => ({ particles: [...s.particles, { ...p, id: Date.now() + Math.random() }] })),

  removeParticle: (id) =>
    set((s) => ({ particles: s.particles.filter(p => p.id !== id) })),

  // ─── Combat settings ───────────────────────────────────────────────────────
  autoAim: true,
  toggleAutoAim: () => set((s) => ({ autoAim: !s.autoAim })),

  // ─── Character selection ───────────────────────────────────────────────────
  unlockedChars: ['knight'],
  unlockChar: (id) =>
    set((s) => ({
      unlockedChars: s.unlockedChars.includes(id)
        ? s.unlockedChars
        : [...s.unlockedChars, id],
    })),

  selectChar: (charId) =>
    set((s) => ({
      player: { ...s.player, charId },
    })),

  // ─── Helpers ───────────────────────────────────────────────────────────────
  resetGame: () =>
    set({
      screen: 'title',
      currentLevelIndex: 0,
      levelData: LEVELS[0],
      player: { ...initialPlayer },
      enemies: [],
      npcs: [],
      projectiles: [],
      particles: [],
    }),
}));

// Helper – not exported as store action
import { ENEMY_SPRITES } from '../constants/sprites.js';
function getEnemyBase(type) {
  return ENEMY_SPRITES[type] ?? { hp: 20, dmg: 5, xp: 10, speed: 1000 };
}
