import { SOLID_TILE_SET, RENDERED_TILE, TILE_SIZE, SCALE } from '../constants/tiles.js';
import { WEAPON_TYPES } from '../constants/sprites.js';
import { MAP_WIDTH, MAP_HEIGHT } from '../constants/levels.js';
import { useGameStore } from '../store/gameStore.js';
import { play } from './sound.js';

function sign(n) { return n === 0 ? 0 : n > 0 ? 1 : -1; }

function isSolid(map, x, y) {
  if (x < 0 || y < 0 || x >= MAP_WIDTH || y >= MAP_HEIGHT) return true;
  return SOLID_TILE_SET.has(map[y]?.[x]);
}

// Returns true if there's a clear line of sight between two points on the map
function hasLOS(map, ax, ay, bx, by) {
  const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 2;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const mx = Math.round(ax + (bx - ax) * t);
    const my = Math.round(ay + (by - ay) * t);
    if (isSolid(map, mx, my)) return false;
  }
  return true;
}

export function playerAttack() {
  const store = useGameStore.getState();
  const { player, enemies, levelData, killEnemy, damageEnemy, spawnProjectile, spawnParticle, addXp } = store;
  if (!levelData) return;

  const now = performance.now();
  const weapon = WEAPON_TYPES[player.weapon] ?? WEAPON_TYPES.sword;
  if (now - (player.attackTime || 0) < weapon.cooldown) return;

  store.setAttackTime(now);

  if (weapon.type === 'melee') {
    // Hit all enemies within melee range (1-2 tiles, considering facing direction)
    const reach = weapon.range ?? 1;
    let hit = false;
    enemies.forEach(enemy => {
      if (!enemy.alive) return;
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const d = Math.abs(dx) + Math.abs(dy);
      if (d > reach) return;

      // Check facing alignment (melee is directional)
      const facingDx = player.facing === 'right' ? 1 : player.facing === 'left' ? -1 : 0;
      const facingDy = player.facing === 'down'  ? 1 : player.facing === 'up'   ? -1 : 0;

      const inFront = (facingDx !== 0 && sign(dx) === facingDx) ||
                      (facingDy !== 0 && sign(dy) === facingDy) ||
                      (facingDx === 0 && facingDy === 0); // no facing = hit all

      if (!inFront && reach === 1) return;

      const dmg = weapon.dmg + Math.floor(player.atk * 0.4);
      damageEnemy(enemy.id, dmg);
      play('attack', 0.6);
      hit = true;

      // Spark particles at enemy position
      for (let i = 0; i < 4; i++) {
        spawnParticle({
          x: enemy.x * RENDERED_TILE + RENDERED_TILE / 2,
          y: enemy.y * RENDERED_TILE + RENDERED_TILE / 2,
          vx: (Math.random() - 0.5) * 80,
          vy: (Math.random() - 0.5) * 80 - 20,
          life: 350,
          color: '#fbbf24',
          text: `-${dmg}`,
        });
      }

      if ((enemy.hp ?? 0) - dmg <= 0) {
        killEnemy(enemy.id);
        addXp(enemy.xp ?? 10);
      }
    });
    if (!hit) play('attack', 0.3);
  } else {
    // Magic/ranged — spawn projectile
    const fx = player.facing === 'right' ? 1 : player.facing === 'left' ? -1 : 0;
    const fy = player.facing === 'down'  ? 1 : player.facing === 'up'   ? -1 : (fx === 0 ? 1 : 0);

    spawnProjectile({
      x: player.x + 0.5,
      y: player.y + 0.5,
      dx: fx || 1,
      dy: fy,
      color: weapon.name === 'Staff' ? '#60a5fa' : '#f97316',
      speed: 5,
      fromEnemy: false,
      dmg: weapon.dmg + Math.floor(player.atk * 0.6),
      life: weapon.range ?? 6,
    });
    play('magic', 0.7);
  }
}

export function tickProjectiles(dt) {
  const store = useGameStore.getState();
  const { projectiles, player, enemies, levelData, killEnemy, damageEnemy,
          damagePlayer, removeProjectile, addXp, spawnParticle } = store;
  if (!levelData) return;

  const SPEED_SCALE = dt / 120; // normalize to ~120fps base

  projectiles.forEach(proj => {
    const steps = Math.ceil(proj.speed * SPEED_SCALE * 3);
    const sx = proj.dx * proj.speed * SPEED_SCALE / steps;
    const sy = proj.dy * proj.speed * SPEED_SCALE / steps;

    let px = proj.x;
    let py = proj.y;
    let hit = false;

    for (let i = 0; i < steps; i++) {
      px += sx;
      py += sy;

      // Wall collision (tile coords)
      const tx = Math.floor(px);
      const ty = Math.floor(py);
      if (isSolid(levelData.map, tx, ty)) {
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

      // Entity collision
      if (!proj.fromEnemy) {
        // Player projectile hitting enemies
        const target = enemies.find(e => e.alive && Math.abs(e.x + 0.5 - px) < 0.7 && Math.abs(e.y + 0.5 - py) < 0.7);
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
          play('hit', 0.5);
          hit = true;
          break;
        }
      } else {
        // Enemy projectile hitting player
        if (Math.abs(player.x + 0.5 - px) < 0.7 && Math.abs(player.y + 0.5 - py) < 0.7) {
          damagePlayer(Math.round(proj.dmg));
          removeProjectile(proj.id);
          play('hit', 0.4);
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
