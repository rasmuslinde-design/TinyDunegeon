import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { playerAttack } from '../systems/combat.js';
import { play } from '../systems/sound.js';

const MOVE_COOLDOWN = 160; // ms between grid steps

export function useInput(enabled) {
  const movePlayer  = useGameStore(s => s.movePlayer);
  const usePotion   = useGameStore(s => s.usePotion);
  const lastMove    = useRef(0);
  const held        = useRef({});

  useEffect(() => {
    if (!enabled) return;

    const onDown = (e) => {
      held.current[e.code] = true;

      // Attack
      if (e.code === 'Space' || e.code === 'KeyZ') {
        e.preventDefault();
        playerAttack();
        return;
      }
      // Use potion
      if (e.code === 'KeyQ') {
        usePotion();
        play('select');
        return;
      }
    };

    const onUp = (e) => {
      held.current[e.code] = false;
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
    };
  }, [enabled, movePlayer, usePotion]);

  // Movement poll loop (for held keys)
  useEffect(() => {
    if (!enabled) return;
    let raf;
    const loop = () => {
      const now = Date.now();
      if (now - lastMove.current >= MOVE_COOLDOWN) {
        const h = held.current;
        let dx = 0, dy = 0;
        if (h['KeyW'] || h['ArrowUp'])    dy = -1;
        if (h['KeyS'] || h['ArrowDown'])  dy =  1;
        if (h['KeyA'] || h['ArrowLeft'])  dx = -1;
        if (h['KeyD'] || h['ArrowRight']) dx =  1;
        if (dx !== 0 || dy !== 0) {
          // Normalize diagonal
          if (dx !== 0 && dy !== 0) dy = 0;
          movePlayer(dx, dy);
          play('move', 0.15);
          lastMove.current = now;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [enabled, movePlayer]);
}
