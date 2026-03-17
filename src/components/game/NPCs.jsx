// NPC renderer + interaction prompt
import React from "react";
import { RENDERED_TILE } from "../../constants/tiles.js";
import { NPC_SPRITES } from "../../constants/sprites.js";
import Sprite from "./Sprite.jsx";

export default function NPCs({ npcs, playerX, playerY, onInteract }) {
  return (
    <>
      {npcs.map((npc) => {
        const base = NPC_SPRITES[npc.type];
        if (!base) return null;
        const px = npc.x * RENDERED_TILE;
        const py = npc.y * RENDERED_TILE;
        const near =
          Math.abs(npc.x - playerX) <= 1 && Math.abs(npc.y - playerY) <= 1;

        return (
          <React.Fragment key={npc.id}>
            {/* Glow under NPC */}
            <div
              style={{
                position: "absolute",
                left: px - 4,
                top: py + RENDERED_TILE - 10,
                width: RENDERED_TILE + 8,
                height: 14,
                background:
                  "radial-gradient(ellipse, rgba(250,200,50,0.35) 0%, transparent 70%)",
                borderRadius: "50%",
              }}
            />

            <Sprite
              row={base.row}
              col={base.col}
              x={px}
              y={py}
              style={{
                filter: near
                  ? "brightness(1.4) drop-shadow(0 0 8px rgba(250,200,50,0.8))"
                  : "drop-shadow(0 2px 3px rgba(0,0,0,0.8))",
                zIndex: 9,
                cursor: near ? "pointer" : "default",
              }}
              onClick={near ? () => onInteract(npc) : undefined}
            />

            {/* Talk prompt */}
            {near && (
              <div
                style={{
                  position: "absolute",
                  left: px,
                  top: py - 22,
                  background: "rgba(0,0,0,0.85)",
                  color: "#fbbf24",
                  fontSize: 9,
                  fontFamily: "KenneyFutureNarrow, monospace",
                  padding: "2px 5px",
                  borderRadius: 3,
                  border: "1px solid #fbbf24",
                  whiteSpace: "nowrap",
                  zIndex: 20,
                  animation: "floatUp 0.4s ease-out",
                }}
              >
                [E] {base.label}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
