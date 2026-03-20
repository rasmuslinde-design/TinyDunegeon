// Player renderer with smooth lerp movement and attack animation
import React, { useEffect, useRef, useState } from "react";
import { RENDERED_TILE } from "../../constants/tiles.js";
import { PLAYER_SPRITES, PLAYER_LIST } from "../../constants/sprites.js";
import Sprite from "./Sprite.jsx";

const LERP_SPEED = 0.18;

export default function Player({ player }) {
  const [px, setPx] = useState(player.x * RENDERED_TILE);
  const [py, setPy] = useState(player.y * RENDERED_TILE);
  const targetX = useRef(player.x * RENDERED_TILE);
  const targetY = useRef(player.y * RENDERED_TILE);
  const rafRef = useRef(null);

  useEffect(() => {
    targetX.current = player.x * RENDERED_TILE;
    targetY.current = player.y * RENDERED_TILE;
  }, [player.x, player.y]);

  useEffect(() => {
    const animate = () => {
      setPx((prev) => {
        const diff = targetX.current - prev;
        return Math.abs(diff) < 0.5
          ? targetX.current
          : prev + diff * LERP_SPEED * 3;
      });
      setPy((prev) => {
        const diff = targetY.current - prev;
        return Math.abs(diff) < 0.5
          ? targetY.current
          : prev + diff * LERP_SPEED * 3;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const sprite = PLAYER_SPRITES[player.charId] ?? PLAYER_SPRITES.knight;
  const flip = player.facing === "left";

  // Attack animation: slight offset in facing direction
  let atkOffX = 0,
    atkOffY = 0;
  if (player.attacking) {
    const mag = 8;
    if (player.facing === "right") atkOffX = mag;
    if (player.facing === "left") atkOffX = -mag;
    if (player.facing === "down") atkOffY = mag;
    if (player.facing === "up") atkOffY = -mag;
  }

  return (
    <>
      {/* Shadow */}
      <div
        style={{
          position: "absolute",
          left: px + 8,
          top: py + RENDERED_TILE - 8,
          width: RENDERED_TILE - 16,
          height: 8,
          background: "rgba(0,0,0,0.4)",
          borderRadius: "50%",
          transition: "left 0.05s, top 0.05s",
        }}
      />

      <Sprite
        row={sprite.row}
        col={sprite.col}
        x={px + atkOffX}
        y={py + atkOffY}
        flip={flip}
        style={{
          transition: player.attacking ? "none" : undefined,
          filter: player.attacking
            ? "brightness(1.8) saturate(2)"
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.8))",
          zIndex: 10,
        }}
      />

      {/* Weapon swing arc */}
      {player.attacking && player.weapon?.type === "melee" && (
        <div
          style={{
            position: "absolute",
            left: px + atkOffX + 4,
            top: py + atkOffY + 4,
            width: RENDERED_TILE - 8,
            height: RENDERED_TILE - 8,
            border: "3px solid rgba(255,220,50,0.7)",
            borderRadius: "50%",
            animation: "swingArc 0.3s ease-out forwards",
            pointerEvents: "none",
            zIndex: 11,
          }}
        />
      )}
    </>
  );
}
