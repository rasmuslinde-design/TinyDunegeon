// HUD — Health bar, XP bar, Gold, Weapon, Inventory, Quest tracker
import React from "react";
import { useGameStore } from "../../store/gameStore.js";
import { play } from "../../systems/sound.js";

function Bar({ value, max, color, bgColor = "#1a1a2e", label, icon }) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <div style={{ marginBottom: 6 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 2,
        }}
      >
        <span style={{ color: "#aaa", fontSize: 12 }}>
          {icon} {label}
        </span>
        <span style={{ color: "#ddd", fontSize: 12 }}>
          {Math.floor(value)}/{max}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 10,
          background: bgColor,
          borderRadius: 5,
          border: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 5,
            transition: "width 0.3s ease",
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

export default function HUD() {
  const player = useGameStore((s) => s.player);
  const autoAim = useGameStore((s) => s.autoAim);
  const toggleAutoAim = useGameStore((s) => s.toggleAutoAim);
  const usePotion = useGameStore((s) => s.usePotion);
  const setScreen = useGameStore((s) => s.setScreen);
  const currentLevelIndex = useGameStore((s) => s.currentLevelIndex);

  const potions = player.inventory.filter((i) => i.type === "potion");

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "12px 18px",
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 100,
        fontFamily: "KenneyFutureNarrow, monospace",
      }}
    >
      {/* LEFT */}
      <div style={{ width: 190, pointerEvents: "auto" }}>
        <div
          style={{
            color: "#fbbf24",
            fontSize: 14,
            marginBottom: 8,
            letterSpacing: 1,
          }}
        >
          ★ {player.charId.toUpperCase()}
        </div>

        <Bar
          value={player.hp}
          max={player.maxHp}
          color="#ef4444"
          label="HP"
          icon="♥"
        />

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 4,
            alignItems: "center",
          }}
        >
          <span style={{ color: "#fbbf24", fontSize: 13 }}>
            ⚔ {player.weapon?.label ?? player.weapon?.name ?? "Fists"}
          </span>
          <span style={{ color: "#fbbf24", fontSize: 13 }}>
            💰 {player.gold}
          </span>
        </div>
        {player.charId === "paladin" && (
          <div
            style={{
              marginTop: 4,
              color: "#fde68a",
              fontSize: 10,
              letterSpacing: 1,
            }}
          >
            [X] MODE: {player.paladinMode === "melee" ? "⚔ MELEE" : "✦ RANGED"}
          </div>
        )}
      </div>

      {/* CENTRE — (intentionally empty) */}
      <div style={{ textAlign: "center", pointerEvents: "none" }} />

      {/* RIGHT — Controls */}
      <div style={{ textAlign: "right", pointerEvents: "auto" }}>
        <button
          onClick={() => {
            toggleAutoAim();
            play("click");
          }}
          style={{
            background: autoAim
              ? "rgba(168,85,247,0.3)"
              : "rgba(255,255,255,0.1)",
            border: `1px solid ${autoAim ? "#a855f7" : "rgba(255,255,255,0.2)"}`,
            color: autoAim ? "#a855f7" : "#888",
            borderRadius: 4,
            padding: "4px 10px",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "KenneyFutureNarrow, monospace",
            marginBottom: 6,
            display: "block",
            marginLeft: "auto",
            letterSpacing: 1,
          }}
        >
          {autoAim ? "⊕ AUTO-AIM" : "⊗ MANUAL"}
        </button>

        <button
          onClick={() => {
            usePotion();
            play("select");
          }}
          disabled={potions.length === 0}
          style={{
            background:
              potions.length > 0
                ? "rgba(34,197,94,0.2)"
                : "rgba(255,255,255,0.05)",
            border: `1px solid ${potions.length > 0 ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
            color: potions.length > 0 ? "#22c55e" : "#555",
            borderRadius: 4,
            padding: "4px 10px",
            fontSize: 12,
            cursor: potions.length > 0 ? "pointer" : "default",
            fontFamily: "KenneyFutureNarrow, monospace",
            marginBottom: 6,
            display: "block",
            marginLeft: "auto",
            letterSpacing: 1,
          }}
        >
          [Q] POTION ×{potions.length}
        </button>

        <div style={{ color: "#f59e0b", fontSize: 13, letterSpacing: 1 }}>
          ⚔ ATK{" "}
          {player.atk + (player.weapon?.damage ?? player.weapon?.dmg ?? 0)}
        </div>

        <button
          onClick={() => {
            setScreen("title");
            play("click");
          }}
          style={{
            marginTop: 6,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#888",
            borderRadius: 4,
            padding: "4px 10px",
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "KenneyFutureNarrow, monospace",
            display: "block",
            marginLeft: "auto",
            letterSpacing: 1,
          }}
        >
          MENU
        </button>
      </div>
    </div>
  );
}
