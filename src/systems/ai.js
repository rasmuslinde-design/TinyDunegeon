import { ENEMY_SPRITES } from "../constants/sprites.js";
import { MAP_WIDTH, MAP_HEIGHT } from "../constants/levels.js";
import { SOLID_TILE_SET } from "../constants/tiles.js";
import { useGameStore } from "../store/gameStore.js";
import { play } from "./sound.js";

function isSolid(map, x, y, levelData) {
  const maxC = levelData?.cols ?? MAP_WIDTH;
  const maxR = levelData?.rows ?? MAP_HEIGHT;
  if (x < 0 || y < 0 || x >= maxC || y >= maxR) return true;
  return SOLID_TILE_SET.has(map[y]?.[x]);
}

function dist(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function sign(n) {
  return n === 0 ? 0 : n > 0 ? 1 : -1;
}

function stepToward(map, from, to, enemies, levelData) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const moves = [];
  if (Math.abs(dx) >= Math.abs(dy)) {
    moves.push({ x: sign(dx), y: 0 });
    moves.push({ x: 0, y: sign(dy) });
  } else {
    moves.push({ x: 0, y: sign(dy) });
    moves.push({ x: sign(dx), y: 0 });
  }
  moves.push({ x: sign(dy), y: sign(dx) });
  moves.push({ x: -sign(dy), y: -sign(dx) });

  for (const m of moves) {
    if (m.x === 0 && m.y === 0) continue;
    const nx = from.x + m.x;
    const ny = from.y + m.y;
    if (
      !isSolid(map, nx, ny, levelData) &&
      !enemies.some(
        (e) => e.alive && e.id !== from.id && e.x === nx && e.y === ny,
      )
    ) {
      return { x: nx, y: ny };
    }
  }
  return null;
}

function randomStep(map, from, enemies, levelData) {
  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  const shuffled = dirs.sort(() => Math.random() - 0.5);
  for (const d of shuffled) {
    const nx = from.x + d.x;
    const ny = from.y + d.y;
    if (
      !isSolid(map, nx, ny, levelData) &&
      !enemies.some(
        (e) => e.alive && e.id !== from.id && e.x === nx && e.y === ny,
      )
    ) {
      return { x: nx, y: ny };
    }
  }
  return null;
}

export function tickAI(now) {
  const store = useGameStore.getState();
  const {
    levelData,
    enemies,
    player,
    damagePlayer,
    killEnemy,
    updateEnemy,
    spawnProjectile,
  } = store;
  if (!levelData) return;

  enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    const base = ENEMY_SPRITES[enemy.type] ?? {
      speed: 1000,
      dmg: 5,
      behavior: "wander",
      hp: 20,
    };
    const elapsed = now - (enemy.aiTimer || 0);
    if (elapsed < base.speed) return;

    const d = dist(enemy, player);
    let newPos = null;

    switch (base.behavior) {
      case "wander":
        newPos =
          d <= 12
            ? stepToward(levelData.map, enemy, player, enemies, levelData)
            : randomStep(levelData.map, enemy, enemies, levelData);
        break;

      case "erratic": {
        const dirs = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 },
          { x: 1, y: 1 },
          { x: -1, y: -1 },
          { x: 1, y: -1 },
          { x: -1, y: 1 },
        ];
        const r = dirs[Math.floor(Math.random() * dirs.length)];
        const nx = enemy.x + r.x,
          ny = enemy.y + r.y;
        newPos =
          d <= 12
            ? stepToward(levelData.map, enemy, player, enemies, levelData)
            : !isSolid(levelData.map, nx, ny, levelData)
              ? { x: nx, y: ny }
              : null;
        break;
      }

      case "stalk":
        if (d <= 14)
          newPos = stepToward(levelData.map, enemy, player, enemies, levelData);
        break;

      case "patrol":
        newPos =
          d <= 12
            ? stepToward(levelData.map, enemy, player, enemies, levelData)
            : randomStep(levelData.map, enemy, enemies, levelData);
        break;

      case "charge":
        if (d <= 15)
          newPos = stepToward(levelData.map, enemy, player, enemies, levelData);
        break;

      case "ranged": {
        // Keep 3-5 tiles away, shoot projectiles
        if (d > 5)
          newPos = stepToward(levelData.map, enemy, player, enemies, levelData);
        else if (d < 3) {
          const flee = {
            x: enemy.x - sign(player.x - enemy.x),
            y: enemy.y - sign(player.y - enemy.y),
          };
          if (!isSolid(levelData.map, flee.x, flee.y, levelData)) newPos = flee;
        }
        // Shoot every 2 ticks when in range
        if (d <= 12 && Math.random() < 0.5) {
          spawnProjectile({
            x: enemy.x + 0.5,
            y: enemy.y + 0.5,
            dx: sign(player.x - enemy.x) || (Math.random() > 0.5 ? 1 : -1),
            dy: sign(player.y - enemy.y) || 0,
            color: "#a855f7",
            speed: 3,
            fromEnemy: true,
            dmg: base.dmg,
            life: 30,
          });
        }
        break;
      }

      case "guard":
        if (d <= 12)
          newPos = stepToward(levelData.map, enemy, player, enemies, levelData);
        break;

      case "boss": {
        newPos = stepToward(levelData.map, enemy, player, enemies, levelData);
        // Boss shoots in 4 directions periodically
        if (d <= 8 && Math.random() < 0.4) {
          [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
          ].forEach((dir) => {
            spawnProjectile({
              x: enemy.x + 0.5,
              y: enemy.y + 0.5,
              dx: dir.x,
              dy: dir.y,
              color: "#ef4444",
              speed: 4,
              fromEnemy: true,
              dmg: base.dmg * 0.6,
              life: 20,
            });
          });
        }
        break;
      }

      default:
        newPos = randomStep(levelData.map, enemy, enemies);
        break;
    }

    if (newPos) {
      updateEnemy(enemy.id, {
        x: newPos.x,
        y: newPos.y,
        aiTimer: now,
        facing:
          newPos.x > enemy.x
            ? "right"
            : newPos.x < enemy.x
              ? "left"
              : newPos.y > enemy.y
                ? "down"
                : "up",
      });

      // Melee contact damage
      if (newPos.x === player.x && newPos.y === player.y) {
        damagePlayer(base.dmg);
        play("hit", 0.5);
      }
    } else {
      updateEnemy(enemy.id, { aiTimer: now });
    }
  });
}
