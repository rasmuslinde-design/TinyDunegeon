// Main game world — renders tilemap, entities, HUD, runs game loops
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { useInput } from '../../hooks/useInput.js';
import { tickAI } from '../../systems/ai.js';
import { tickProjectiles } from '../../systems/combat.js';
import { RENDERED_TILE } from '../../constants/tiles.js';
import { MAP_WIDTH, MAP_HEIGHT, LEVELS } from '../../constants/levels.js';
import { play } from '../../systems/sound.js';

import Tilemap       from './Tilemap.jsx';
import Player        from './Player.jsx';
import Enemies       from './Enemies.jsx';
import NPCs          from './NPCs.jsx';
import { Projectiles, Particles } from './Effects.jsx';
import HUD           from '../hud/HUD.jsx';
import ControlsBar   from '../hud/ControlsBar.jsx';
import Shop          from '../ui/Shop.jsx';

const WORLD_W = MAP_WIDTH  * RENDERED_TILE;  // 20 × 48 = 960
const WORLD_H = MAP_HEIGHT * RENDERED_TILE;  // 15 × 48 = 720

export default function GameWorld() {
  const player         = useGameStore(s => s.player);
  const enemies        = useGameStore(s => s.enemies);
  const npcs           = useGameStore(s => s.npcs);
  const projectiles    = useGameStore(s => s.projectiles);
  const particles      = useGameStore(s => s.particles);
  const levelData      = useGameStore(s => s.levelData);
  const currentLevelIndex = useGameStore(s => s.currentLevelIndex);
  const initLevel      = useGameStore(s => s.initLevel);
  const setScreen      = useGameStore(s => s.setScreen);
  const activeNpc      = useGameStore(s => s.activeNpc);
  const setActiveNpc   = useGameStore(s => s.setActiveNpc);

  const [shopOpen, setShopOpen] = useState(false);
  const rafRef = useRef(null);
  const lastRef = useRef(0);

  // Input (active when shop is closed)
  useInput(!shopOpen);

  // Game loop
  useEffect(() => {
    const loop = (now) => {
      const dt = Math.min(now - lastRef.current, 100);
      lastRef.current = now;
      tickAI(now);
      tickProjectiles(dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Interact key (E)
  const handleInteract = useCallback((e) => {
    if (e.code !== 'KeyE') return;
    const near = npcs.find(
      n => Math.abs(n.x - player.x) <= 1 && Math.abs(n.y - player.y) <= 1
    );
    if (near) {
      setActiveNpc(near);
      setShopOpen(true);
      play('select');
    }
  }, [npcs, player.x, player.y, setActiveNpc]);

  useEffect(() => {
    window.addEventListener('keydown', handleInteract);
    return () => window.removeEventListener('keydown', handleInteract);
  }, [handleInteract]);

  // Level transition — check if player is on stairs
  useEffect(() => {
    if (!levelData) return;
    const tile = levelData.map[player.y]?.[player.x];
    if (tile === 64) {
      // Stairs down — next level
      const next = currentLevelIndex + 1;
      if (next >= LEVELS.length) {
        setScreen('win');
      } else {
        play('select');
        initLevel(next);
      }
    } else if (tile === 65) {
      // Stairs up — previous level
      const prev = currentLevelIndex - 1;
      if (prev >= 0) {
        play('select');
        initLevel(prev);
      }
    }
  }, [player.x, player.y]);

  if (!levelData) return null;

  // Camera: centre on player, clamp to world bounds
  const viewW = Math.min(WORLD_W, window.innerWidth);
  const viewH = Math.min(WORLD_H, window.innerHeight);

  const camX = Math.max(0, Math.min(WORLD_W - viewW, player.x * RENDERED_TILE - viewW / 2 + RENDERED_TILE / 2));
  const camY = Math.max(0, Math.min(WORLD_H - viewH, player.y * RENDERED_TILE - viewH / 2 + RENDERED_TILE / 2));

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: levelData.bgColor ?? '#0a0a0f',
      overflow: 'hidden',
      fontFamily: 'KenneyFutureNarrow, monospace',
    }}>
      {/* Viewport */}
      <div style={{
        position: 'absolute',
        left: -camX, top: -camY,
        width: WORLD_W, height: WORLD_H,
      }}>
        {/* Tilemap */}
        <Tilemap levelData={levelData} />

        {/* NPCs */}
        <NPCs
          npcs={npcs}
          playerX={player.x}
          playerY={player.y}
          onInteract={(npc) => { setActiveNpc(npc); setShopOpen(true); play('select'); }}
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
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 50,
      }}>
      </div>

      {/* HUD overlay */}
      <HUD />
      <ControlsBar />

      {/* Level indicator */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.35)',
        fontSize: 9,
        letterSpacing: 3,
        fontFamily: 'KenneyFutureNarrow, monospace',
        pointerEvents: 'none',
        zIndex: 101,
      }}>
        FLOOR {currentLevelIndex + 1} · {levelData.name?.toUpperCase()}
      </div>

      {/* Shop overlay */}
      {shopOpen && activeNpc && (
        <Shop
          npc={activeNpc}
          onClose={() => { setShopOpen(false); setActiveNpc(null); }}
        />
      )}
    </div>
  );
}
