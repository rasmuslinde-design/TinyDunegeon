// Enemy renderer with health bars
import React from "react";
import { RENDERED_TILE } from "../../constants/tiles.js";
import { ENEMY_SPRITES } from "../../constants/sprites.js";
import Sprite from "./Sprite.jsx";

export default function Enemies({ enemies }) {
  return (
    <>
      {enemies.map((enemy) => {
        if (!enemy.alive) return null;
        const base = ENEMY_SPRITES[enemy.type];
        if (!base) return null;
        const px = enemy.x * RENDERED_TILE;
        const py = enemy.y * RENDERED_TILE;
        const flip = enemy.facing === "left";
        const hpPct = Math.max(0, enemy.hp / enemy.maxHp);

        return (
          <React.Fragment key={enemy.id}>
            {/* Shadow */}
            <div
              style={{
                position: "absolute",
                left: px + 8,
                top: py + RENDERED_TILE - 6,
                width: RENDERED_TILE - 16,
                height: 6,
                background: "rgba(0,0,0,0.35)",
                borderRadius: "50%",
              }}
            />

            <Sprite
              row={base.row}
              col={base.col}
              x={px}
              y={py}
              flip={flip}
              style={{
                filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.9))",
                zIndex: 8,
              }}
            />

            {/* HP bar */}
            <div
              style={{
                position: "absolute",
                left: px + 2,
                top: py - 8,
                width: RENDERED_TILE - 4,
                height: 4,
                background: "#1a1a1a",
                borderRadius: 2,
                zIndex: 12,
              }}
            >
              <div
                style={{
                  width: `${hpPct * 100}%`,
                  height: "100%",
                  background:
                    hpPct > 0.5
                      ? "#22c55e"
                      : hpPct > 0.25
                        ? "#f59e0b"
                        : "#ef4444",
                  borderRadius: 2,
                  transition: "width 0.2s",
                }}
              />
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}
