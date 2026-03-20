// Main game world — renders tilemap, entities, HUD, runs game loops
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useGameStore } from "../../store/gameStore.js";
import { useInput } from "../../hooks/useInput.js";
import { tickAI } from "../../systems/ai.js";
import { tickProjectiles } from "../../systems/combat.js";
import { RENDERED_TILE } from "../../constants/tiles.js";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  LEVELS,
  AL,
  LV,
  SP,
  CH,
  SW,
} from "../../constants/levels.js";
import { play } from "../../systems/sound.js";

import Tilemap from "./Tilemap.jsx";
import Player from "./Player.jsx";
import Enemies from "./Enemies.jsx";
import NPCs from "./NPCs.jsx";
import { Projectiles, Particles } from "./Effects.jsx";
import HUD from "../hud/HUD.jsx";
import ControlsBar from "../hud/ControlsBar.jsx";
import Shop from "../ui/Shop.jsx";
import InteractionOverlay from "./InteractionOverlay.jsx";

// World pixel dimensions are based on the current level's grid size
function worldSize(levelData) {
  const cols = levelData?.cols ?? MAP_WIDTH;
  const rows = levelData?.rows ?? MAP_HEIGHT;
  return { w: cols * RENDERED_TILE, h: rows * RENDERED_TILE };
}

export default function GameWorld() {
  const player = useGameStore((s) => s.player);
  const enemies = useGameStore((s) => s.enemies);
  const npcs = useGameStore((s) => s.npcs);
  const projectiles = useGameStore((s) => s.projectiles);
  const particles = useGameStore((s) => s.particles);
  const levelData = useGameStore((s) => s.levelData);
  const currentLevelIndex = useGameStore((s) => s.currentLevelIndex);
  const initLevel = useGameStore((s) => s.initLevel);
  const setScreen = useGameStore((s) => s.setScreen);
  const activeNpc = useGameStore((s) => s.activeNpc);
  const setActiveNpc = useGameStore((s) => s.setActiveNpc);
  const quest = useGameStore((s) => s.quest);
  const useAltar = useGameStore((s) => s.useAltar);
  const pullLever = useGameStore((s) => s.pullLever);
  const collectSymbol = useGameStore((s) => s.collectSymbol);
  const collectInvisPotion = useGameStore((s) => s.collectInvisPotion);
  const setQuest = useGameStore((s) => s.setQuest);
  const revealSecretExitDoor = useGameStore((s) => s.revealSecretExitDoor);
  const activateDesertMechanism = useGameStore(
    (s) => s.activateDesertMechanism,
  );
  const triggerMimicEncounter = useGameStore((s) => s.triggerMimicEncounter);

  const [shopOpen, setShopOpen] = useState(false);
  const [interaction, setInteraction] = useState(null); // { type, ... }
  const [, setTick] = useState(0); // forces re-render for cooldown bars
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const camRef = useRef({ x: 0, y: 0 });
  const lastCamTickRef = useRef({ x: 0, y: 0 });

  // Lightweight tick for UI (cooldowns). Camera follow uses RAF tick.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 160);
    return () => clearInterval(id);
  }, []);

  // Input (active when shop and overlay are closed)
  useInput(!shopOpen && !interaction);

  // Game loop
  useEffect(() => {
    const loop = (now) => {
      const dt = Math.min(now - lastRef.current, 100);
      lastRef.current = now;
      tickAI(now);
      tickProjectiles(dt);

      // Smooth camera follow (updates refs + triggers lightweight rerender)
      if (levelData) {
        const { w: WORLD_W, h: WORLD_H } = worldSize(levelData);
        const viewW = window.innerWidth;
        const viewH = window.innerHeight;
        const targetCamX = Math.max(
          0,
          Math.min(
            WORLD_W - viewW,
            player.x * RENDERED_TILE - viewW / 2 + RENDERED_TILE / 2,
          ),
        );
        const targetCamY = Math.max(
          0,
          Math.min(
            WORLD_H - viewH,
            player.y * RENDERED_TILE - viewH / 2 + RENDERED_TILE / 2,
          ),
        );
        const CAMERA_LERP = 0.15;
        camRef.current.x += (targetCamX - camRef.current.x) * CAMERA_LERP;
        camRef.current.y += (targetCamY - camRef.current.y) * CAMERA_LERP;

        // Force a re-render only when camera moved enough to matter visually.
        // This keeps smooth camera follow without pegging React at 60fps.
        const dx = Math.abs(camRef.current.x - lastCamTickRef.current.x);
        const dy = Math.abs(camRef.current.y - lastCamTickRef.current.y);
        if (dx + dy >= 0.5) {
          lastCamTickRef.current.x = camRef.current.x;
          lastCamTickRef.current.y = camRef.current.y;
          setTick((t) => t + 1);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [levelData, player.x, player.y]);

  // Interact key (E) — NPC shop + quest special tiles
  const handleInteract = useCallback(
    (e) => {
      if (e.code !== "KeyE") return;

      // Check adjacent tiles (player position + all 4 neighbours)
      const positions = [
        { x: player.x, y: player.y },
        { x: player.x + 1, y: player.y },
        { x: player.x - 1, y: player.y },
        { x: player.x, y: player.y + 1 },
        { x: player.x, y: player.y - 1 },
      ];

      for (const pos of positions) {
        const maxC = levelData?.cols ?? MAP_WIDTH;
        const maxR = levelData?.rows ?? MAP_HEIGHT;
        if (pos.x < 0 || pos.y < 0 || pos.x >= maxC || pos.y >= maxR) continue;
        const tile = levelData?.map[pos.y]?.[pos.x];

        if (tile === AL) {
          setInteraction({ type: "altar" });
          play("select");
          return;
        }
        if (tile === LV && !quest.leverPulled) {
          setInteraction({ type: "lever" });
          play("select");
          return;
        }
        if (tile === CH && quest.leverPulled && !quest.chestOpened) {
          setInteraction({ type: "chest", symbol: 1 });
          play("select");
          return;
        }
        // Level 1: secret wall (hidden passage) interaction only.
        // In later levels tile 40 may appear as regular wall styling, but it
        // must NOT trigger the hidden passage prompt/window.
        if (currentLevelIndex === 0 && tile === SW && !quest.secretWallFound) {
          setInteraction({ type: "secret_wall" });
          play("select");
          return;
        }

        // Level 2: Desert mechanism (hidden socket marker at Room 1 north wall)
        // Mechanism tile chosen in buildL2: tile 41 at (28,14)
        if (currentLevelIndex === 1 && tile === 41) {
          const result = activateDesertMechanism();
          if (result === "nocRank") {
            setInteraction({
              type: "message",
              title: "Hidden Mechanism",
              body: "A recessed socket... something like a crank could fit here.",
            });
          } else if (result === "already") {
            setInteraction({
              type: "message",
              title: "Hidden Mechanism",
              body: "Water is already flowing through the ancient pipes.",
            });
          } else if (result === "flowing") {
            setInteraction({
              type: "message",
              title: "The Desert's Thirst",
              body: "You turn the crank. Stone groans... then water begins to flow.",
            });
          } else if (result === "unlocked") {
            setInteraction({
              type: "message",
              title: "The Desert's Thirst",
              body: "The basins fill. Somewhere, a heavy lock clicks open.",
            });
          }
          play("select");
          return;
        }

        // Level 2: Mimic chest (tile 92) triggers a combat encounter
        if (currentLevelIndex === 1 && tile === 92) {
          triggerMimicEncounter();
          play("select");
          return;
        }

        // Level 1 → Level 2 exit door (user-defined open door tile index 21)
        if (currentLevelIndex === 0 && quest.secretWallFound && tile === 21) {
          play("select");
          initLevel(1);
          return;
        }
      }

      // NPC interaction
      const near = npcs.find(
        (n) => Math.abs(n.x - player.x) <= 1 && Math.abs(n.y - player.y) <= 1,
      );
      if (near) {
        if (near.id === "knight_spirit" || near.role === "knight_spirit") {
          setInteraction({ type: "knight_spirit", npc: near });
        } else if (near.dialog === "hint") {
          setInteraction({ type: "hint_npc", npc: near });
        } else {
          setActiveNpc(near);
          setShopOpen(true);
        }
        play("select");
      }
    },
    [
      npcs,
      player.x,
      player.y,
      levelData,
      quest,
      setActiveNpc,
      currentLevelIndex,
      initLevel,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleInteract);
    return () => window.removeEventListener("keydown", handleInteract);
  }, [handleInteract]);

  // Level transition — check if player is on stairs
  useEffect(() => {
    if (!levelData) return;
    const tile = levelData.map[player.y]?.[player.x];
    if (tile === 60) {
      // Stairs down — next level
      const next = currentLevelIndex + 1;
      if (next >= LEVELS.length) {
        setScreen("win");
      } else {
        play("select");
        initLevel(next);
      }
    } else if (tile === 61) {
      // Stairs up — previous level
      const prev = currentLevelIndex - 1;
      if (prev >= 0) {
        play("select");
        initLevel(prev);
      }
    }
  }, [player.x, player.y]);

  if (!levelData) return null;

  // Dynamic world size based on level grid dimensions
  const { w: WORLD_W, h: WORLD_H } = worldSize(levelData);
  const levelCols = levelData?.cols ?? MAP_WIDTH;
  const levelRows = levelData?.rows ?? MAP_HEIGHT;

  // Viewport = full screen
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  // Camera target: keep player centred, clamp so we never show outside world bounds
  const targetCamX = Math.max(
    0,
    Math.min(
      WORLD_W - viewW,
      player.x * RENDERED_TILE - viewW / 2 + RENDERED_TILE / 2,
    ),
  );
  const targetCamY = Math.max(
    0,
    Math.min(
      WORLD_H - viewH,
      player.y * RENDERED_TILE - viewH / 2 + RENDERED_TILE / 2,
    ),
  );

  // Smooth camera follow: lerp the camera position toward the target.
  // Kept in a ref to avoid rerendering the whole world at 60fps; we only
  // invalidate a lightweight tick state.
  const CAMERA_LERP = 0.15;
  const camX = camRef.current.x;
  const camY = camRef.current.y;

  useEffect(() => {
    // Snap camera on level change / first mount to avoid seeing outside map.
    camRef.current.x = targetCamX;
    camRef.current.y = targetCamY;
  }, [currentLevelIndex, targetCamX, targetCamY]);

  // ── [E] prompt: is player adjacent to any interactable tile? ──
  const adjacentPositions = [
    { x: player.x, y: player.y },
    { x: player.x + 1, y: player.y },
    { x: player.x - 1, y: player.y },
    { x: player.x, y: player.y + 1 },
    { x: player.x, y: player.y - 1 },
  ];
  // Note: SW (secret wall tile 40) should only be interactable in Level 1.
  // Later levels may reuse tile 40 as a plain wall variant.
  const interactableTiles = new Set([AL, LV, CH]);
  if (currentLevelIndex === 0) interactableTiles.add(SW);
  // Also treat user-defined open single doors (tile 21) as interactable
  interactableTiles.add(21);
  // Level 2: mechanism (41) + mimic chest (92)
  interactableTiles.add(41);
  interactableTiles.add(92);
  const nearInteractableTile = adjacentPositions.some((pos) => {
    const t = levelData.map[pos.y]?.[pos.x];
    if (t === LV && quest.leverPulled) return false;
    if (t === CH && (!quest.leverPulled || quest.chestOpened)) return false;
    if (t === SW && (currentLevelIndex !== 0 || quest.secretWallFound))
      return false;
    if (t === AL && quest.altarUsed) return false;
    return interactableTiles.has(t);
  });
  const nearNpc = npcs.some(
    (n) => Math.abs(n.x - player.x) <= 1 && Math.abs(n.y - player.y) <= 1,
  );
  const showEPrompt = nearInteractableTile || nearNpc;

  // ── "Värav nõuab verd!" — door blocked message ──
  const altarDoors = levelData.altarDoor; // now an array [{x,y},{x,y}]
  const nearAltarDoor =
    !quest.altarUsed &&
    Array.isArray(altarDoors) &&
    adjacentPositions.some((pos) =>
      altarDoors.some((d) => d.x === pos.x && d.y === pos.y),
    );

  // Screen-space position of player centre (for overlays)
  const playerScreenX = player.x * RENDERED_TILE - camX + RENDERED_TILE / 2;
  const playerScreenY = player.y * RENDERED_TILE - camY;

  // Attack cooldown bar (shown under player when in cooldown)
  const weapon = typeof player.weapon === "object" ? player.weapon : null;
  const atkCD = weapon?.cooldown ?? 400;
  const atkElapsed = performance.now() - (player.attackTime || 0);
  const atkReady = atkElapsed >= atkCD;
  const atkPct = Math.min(1, atkElapsed / atkCD);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: levelData.bgColor ?? "#0a0a0f",
        overflow: "hidden",
        fontFamily: "KenneyFutureNarrow, monospace",
      }}
    >
      {/* Viewport */}
      <div
        style={{
          position: "absolute",
          left: -camX,
          top: -camY,
          width: WORLD_W,
          height: WORLD_H,
        }}
      >
        {/* Tilemap */}
        <Tilemap levelData={levelData} />

        {/* NPCs */}
        <NPCs
          npcs={npcs}
          playerX={player.x}
          playerY={player.y}
          onInteract={(npc) => {
            setActiveNpc(npc);
            setShopOpen(true);
            play("select");
          }}
        />

        {/* Enemies */}
        <Enemies enemies={enemies} />

        {/* Player */}
        <Player player={player} />

        {/* Projectiles */}
        <Projectiles projectiles={projectiles} />

        {/* Particles */}
        <Particles particles={particles} />
      </div>

      {/* Level name banner */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 50,
        }}
      ></div>

      {/* HUD overlay */}
      <HUD />
      <ControlsBar />

      {/* [E] interact prompt — screen-space, above player */}
      {showEPrompt && (
        <div
          style={{
            position: "absolute",
            left: playerScreenX,
            top: playerScreenY - 32,
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.80)",
            border: "2px solid #fbbf24",
            color: "#fbbf24",
            fontSize: 16,
            fontWeight: "bold",
            fontFamily: "KenneyFutureNarrow, monospace",
            padding: "2px 10px",
            borderRadius: 4,
            pointerEvents: "none",
            zIndex: 200,
            letterSpacing: 1,
            animation: "ePromptBob 0.8s ease-in-out infinite alternate",
          }}
        >
          [E]
        </div>
      )}

      {/* Attack cooldown bar — tiny bar below player feet, only while cooling down */}
      {!atkReady && (
        <div
          style={{
            position: "absolute",
            left: playerScreenX - 20,
            top: playerScreenY + RENDERED_TILE + 2,
            width: 40,
            height: 5,
            background: "rgba(0,0,0,0.5)",
            borderRadius: 3,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 201,
          }}
        >
          <div
            style={{
              width: `${atkPct * 100}%`,
              height: "100%",
              background: "#fbbf24",
              borderRadius: 3,
            }}
          />
        </div>
      )}

      {/* "Värav nõuab verd!" — shown when double-door is blocked */}
      {nearAltarDoor && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 80,
            transform: "translateX(-50%)",
            background: "rgba(80,0,0,0.88)",
            border: "2px solid #ef4444",
            color: "#fca5a5",
            fontSize: 18,
            fontFamily: "KenneyFutureNarrow, monospace",
            padding: "10px 24px",
            borderRadius: 6,
            pointerEvents: "none",
            zIndex: 200,
            letterSpacing: 1,
            textAlign: "center",
          }}
        >
          🩸 Värav nõuab verd!
        </div>
      )}

      {/* Level indicator */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.35)",
          fontSize: 9,
          letterSpacing: 3,
          fontFamily: "KenneyFutureNarrow, monospace",
          pointerEvents: "none",
          zIndex: 101,
        }}
      >
        FLOOR {currentLevelIndex + 1} · {levelData.name?.toUpperCase()}
      </div>

      {/* Shop overlay */}
      {shopOpen && activeNpc && (
        <Shop
          npc={activeNpc}
          onClose={() => {
            setShopOpen(false);
            setActiveNpc(null);
          }}
        />
      )}

      {/* Quest interaction overlay */}
      {interaction && (
        <InteractionOverlay
          interaction={interaction}
          quest={quest}
          useAltar={useAltar}
          pullLever={pullLever}
          collectSymbol={collectSymbol}
          collectInvisPotion={collectInvisPotion}
          setQuest={setQuest}
          revealSecretExitDoor={revealSecretExitDoor}
          onClose={() => setInteraction(null)}
        />
      )}
    </div>
  );
}
