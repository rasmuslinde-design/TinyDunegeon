import React, { useMemo, useState } from "react";
import { useGameStore } from "../../store/gameStore.js";
import { LEVELS } from "../../constants/levels.js";
import { play } from "../../systems/sound.js";

// DEV ONLY: quick level jump overlay for testing.
// Safe to delete the whole file and the import in App.jsx.

export default function DevLevelSelect() {
  const screen = useGameStore((s) => s.screen);
  const setScreen = useGameStore((s) => s.setScreen);
  const initLevel = useGameStore((s) => s.initLevel);

  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => LEVELS.map((lvl, i) => ({ i, name: lvl.name ?? `Level ${i + 1}` })),
    [],
  );

  if (screen !== "game") return null;

  return (
    <div style={{ position: "fixed", top: 10, left: 10, zIndex: 999 }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(168,85,247,0.5)",
            color: "#e9d5ff",
            padding: "6px 10px",
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: "KenneyFutureNarrow, monospace",
            fontSize: 10,
            letterSpacing: 2,
          }}
        >
          DEV: LEVELS
        </button>
      ) : (
        <div
          style={{
            width: 220,
            background: "rgba(0,0,0,0.75)",
            border: "1px solid rgba(168,85,247,0.5)",
            borderRadius: 10,
            padding: 10,
            color: "#e9d5ff",
            fontFamily: "KenneyFutureNarrow, monospace",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: 2, opacity: 0.9 }}>
              DEV LEVEL JUMP
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#c4b5fd",
                cursor: "pointer",
                fontSize: 14,
                lineHeight: 1,
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map((it) => (
              <button
                key={it.i}
                onClick={() => {
                  play("select");
                  initLevel(it.i);
                  setScreen("game");
                  setOpen(false);
                }}
                style={{
                  textAlign: "left",
                  background: "rgba(168,85,247,0.14)",
                  border: "1px solid rgba(168,85,247,0.35)",
                  color: "#e9d5ff",
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 10,
                }}
              >
                {it.i + 1}. {it.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
