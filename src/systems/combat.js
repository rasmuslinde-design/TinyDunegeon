import {
  SOLID_TILE_SET,
  RENDERED_TILE,
  TILE_SIZE,
  SCALE,
} from "../constants/tiles.js";
import { WEAPON_TYPES } from "../constants/sprites.js";
import { MAP_WIDTH, MAP_HEIGHT } from "../constants/levels.js";
import { useGameStore } from "../store/gameStore.js";
import { play } from "./sound.js";

function sign(n) {
  return n === 0 ? 0 : n > 0 ? 1 : -1;
}

function isSolid(map, x, y, levelData) {
  const maxC = levelData?.cols ?? MAP_WIDTH;
  const maxR = levelData?.rows ?? MAP_HEIGHT;
  if (x < 0 || y < 0 || x >= maxC || y >= maxR) return true;
  return SOLID_TILE_SET.has(map[y]?.[x]);
}

// Returns true if there's a clear line of sight between two points on the map
function hasLOS(map, ax, ay, bx, by, levelData) {
  const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 2;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const mx = Math.round(ax + (bx - ax) * t);
    const my = Math.round(ay + (by - ay) * t);
    if (isSolid(map, mx, my, levelData)) return false;
  }
  return true;
}

// ── SPELL CAST (Z key) — 2s cooldown ─────────────────────────────────────────
export function castSpell() {
  const store = useGameStore.getState();
  const { player, spawnProjectile } = store;
  const SPELL_CD = player.spellCooldown ?? 2000;
  const now = performance.now();
  if (now - (player.spellTime || 0) < SPELL_CD) return;

  store.setPlayer({ spellTime: now, attacking: true, attackAnim: 200 });

  const spell = WEAPON_TYPES.spell;

  // Direction strictly along one axis — no diagonal
  let dx = 0,
    dy = 0;
  if (player.facing === "right") dx = 1;
  else if (player.facing === "left") dx = -1;
  else if (player.facing === "up") dy = -1;
  else dy = 1; // "down" or default

  spawnProjectile({
    x: player.x + 0.5 + dx * 0.5,
    y: player.y + 0.5 + dy * 0.5,
    dx,
    dy,
    color: spell.color ?? "#a78bfa",
    speed: (spell.speed ?? 7) * 0.7, // 30% slower
    fromEnemy: false,
    dmg: spell.dmg + Math.floor(player.atk * 0.5),
    life: spell.range ?? 8,
    isSpell: true,
  });
  play("magic", 0.8);
}

export function playerAttack() {
  const store = useGameStore.getState();
  const {
    player,
    enemies,
    levelData,
    killEnemy,
    damageEnemy,
    spawnProjectile,
    spawnParticle,
    addXp,
  } = store;
  if (!levelData) return;

  const now = performance.now();
  // player.weapon can be either a string id OR the full weapon object
  const weapon =
    typeof player.weapon === "string"
      ? (WEAPON_TYPES[player.weapon] ?? WEAPON_TYPES.sword)
      : (player.weapon ?? WEAPON_TYPES.sword);
  if (now - (player.attackTime || 0) < weapon.cooldown) return;

  store.setAttackTime(now);

  if (weapon.type === "melee") {
    const reach = weapon.range ?? 1;
    let hit = false;
    enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist > reach + 1) return; // too far

      // Must be roughly in the facing direction
      const facingDx =
        player.facing === "right" ? 1 : player.facing === "left" ? -1 : 0;
      const facingDy =
        player.facing === "down" ? 1 : player.facing === "up" ? -1 : 0;
      const inFront =
        (facingDx !== 0 && sign(dx) === facingDx && Math.abs(dy) <= 1) ||
        (facingDy !== 0 && sign(dy) === facingDy && Math.abs(dx) <= 1) ||
        (facingDx === 0 && facingDy === 0);
      if (!inFront) return;

      const dmg = weapon.dmg + Math.floor(player.atk * 0.4);
      damageEnemy(enemy.id, dmg);
      play("attack", 0.6);
      hit = true;

      for (let i = 0; i < 4; i++) {
        spawnParticle({
          x: enemy.x * RENDERED_TILE + RENDERED_TILE / 2,
          y: enemy.y * RENDERED_TILE + RENDERED_TILE / 2,
          vx: (Math.random() - 0.5) * 80,
          vy: (Math.random() - 0.5) * 80 - 20,
          life: 350,
          color: "#fbbf24",
          text: `-${dmg}`,
        });
      }
      if ((enemy.hp ?? 0) - dmg <= 0) {
        killEnemy(enemy.id);
        addXp(enemy.xp ?? 10);
      }
    });

    // Spawn a short slash projectile — visual only, no entity damage
    let sdx = 0,
      sdy = 0;
    if (player.facing === "right") sdx = 1;
    else if (player.facing === "left") sdx = -1;
    else if (player.facing === "up") sdy = -1;
    else sdy = 1;
    spawnProjectile({
      x: player.x + 0.5 + sdx * 0.6,
      y: player.y + 0.5 + sdy * 0.6,
      dx: sdx,
      dy: sdy,
      color: "#fbbf24",
      speed: 0,
      fromEnemy: false,
      dmg: 0,
      life: 1.5,
      visual: true,
      slash: true,
    });
    if (!hit) play("attack", 0.3);
  } else {
    // Magic/ranged weapon — straight axis shot
    let rdx = 0,
      rdy = 0;
    if (player.facing === "right") rdx = 1;
    else if (player.facing === "left") rdx = -1;
    else if (player.facing === "up") rdy = -1;
    else rdy = 1;

    spawnProjectile({
      x: player.x + 0.5 + rdx * 0.5,
      y: player.y + 0.5 + rdy * 0.5,
      dx: rdx,
      dy: rdy,
      color: weapon.color ?? "#f97316",
      speed: 5,
      fromEnemy: false,
      dmg: weapon.dmg + Math.floor(player.atk * 0.6),
      life: weapon.range ?? 6,
    });
    play("magic", 0.7);
  }
}

export function tickProjectiles(dt) {
  const store = useGameStore.getState();
  const {
    projectiles,
    player,
    enemies,
    levelData,
    killEnemy,
    damageEnemy,
    damagePlayer,
    removeProjectile,
    addXp,
    spawnParticle,
  } = store;
  if (!levelData) return;

  const SPEED_SCALE = dt / 120; // normalize to ~120fps base

  projectiles.forEach((proj) => {
    const steps = Math.ceil(proj.speed * SPEED_SCALE * 3);
    const sx = (proj.dx * proj.speed * SPEED_SCALE) / steps;
    const sy = (proj.dy * proj.speed * SPEED_SCALE) / steps;

    let px = proj.x;
    let py = proj.y;
    let hit = false;

    for (let i = 0; i < steps; i++) {
      px += sx;
      py += sy;

      // Wall collision (tile coords)
      const tx = Math.floor(px);
      const ty = Math.floor(py);
      if (isSolid(levelData.map, tx, ty, levelData)) {
        removeProjectile(proj.id);
        // Wall spark
        spawnParticle({
          x: px * RENDERED_TILE,
          y: py * RENDERED_TILE,
          vx: (Math.random() - 0.5) * 40,
          vy: -20,
          life: 200,
          color: proj.color,
          text: null,
        });
        hit = true;
        break;
      }

      // Entity collision (skip for visual-only slash projectiles)
      if (!proj.visual && !proj.fromEnemy) {
        // Player projectile hitting enemies
        const target = enemies.find(
          (e) =>
            e.alive &&
            Math.abs(e.x + 0.5 - px) < 0.7 &&
            Math.abs(e.y + 0.5 - py) < 0.7,
        );
        if (target) {
          const dmg = Math.round(proj.dmg);
          damageEnemy(target.id, dmg);
          spawnParticle({
            x: target.x * RENDERED_TILE + RENDERED_TILE / 2,
            y: target.y * RENDERED_TILE + RENDERED_TILE / 2,
            vx: (Math.random() - 0.5) * 60,
            vy: -40,
            life: 400,
            color: proj.color,
            text: `-${dmg}`,
          });
          if ((target.hp ?? 0) - dmg <= 0) {
            killEnemy(target.id);
            addXp(target.xp ?? 10);
          }
          removeProjectile(proj.id);
          play("hit", 0.5);
          hit = true;
          break;
        }
      } else if (!proj.visual && proj.fromEnemy) {
        // Enemy projectile hitting player
        if (
          Math.abs(player.x + 0.5 - px) < 0.7 &&
          Math.abs(player.y + 0.5 - py) < 0.7
        ) {
          damagePlayer(Math.round(proj.dmg));
          removeProjectile(proj.id);
          play("hit", 0.4);
          hit = true;
          break;
        }
      }
    }

    if (!hit) {
      // Update position; expire if life drained
      const newLife = proj.life - dt / 200;
      if (newLife <= 0) {
        removeProjectile(proj.id);
      } else {
        store.updateProjectile(proj.id, { x: px, y: py, life: newLife });
      }
    }
  });
}
