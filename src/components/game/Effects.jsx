// Projectiles and particle effects
import React, { useEffect } from 'react';
import { RENDERED_TILE } from '../../constants/tiles.js';
import { useGameStore } from '../../store/gameStore.js';

export function Projectiles({ projectiles }) {
  return (
    <>
      {projectiles.map(p => {
        const px = p.x * RENDERED_TILE + RENDERED_TILE / 2 - 6;
        const py = p.y * RENDERED_TILE + RENDERED_TILE / 2 - 6;
        const isEnemy = p.fromEnemy;
        return (
          <div key={p.id} style={{
            position: 'absolute',
            left: px, top: py,
            width: 12, height: 12,
            borderRadius: '50%',
            background: isEnemy ? 'radial-gradient(circle, #ff6b6b, #ff0000)' : `radial-gradient(circle, #fff, ${p.color})`,
            boxShadow: `0 0 8px 3px ${p.color}`,
            zIndex: 15,
            pointerEvents: 'none',
          }} />
        );
      })}
    </>
  );
}

export function Particles({ particles }) {
  const removeParticle = useGameStore(s => s.removeParticle);

  useEffect(() => {
    particles.forEach(p => {
      const timer = setTimeout(() => removeParticle(p.id), p.life);
      return () => clearTimeout(timer);
    });
  }, [particles, removeParticle]);

  return (
    <>
      {particles.map(p => {
        const px = p.x * RENDERED_TILE + RENDERED_TILE / 2;
        const py = p.y * RENDERED_TILE;

        if (p.type === 'hit') {
          return (
            <div key={p.id} style={{
              position: 'absolute',
              left: px - 10, top: py - 10,
              color: '#ff4444',
              fontSize: 11,
              fontFamily: 'KenneyFutureNarrow, monospace',
              fontWeight: 'bold',
              zIndex: 30,
              pointerEvents: 'none',
              animation: `floatDmg ${p.life}ms ease-out forwards`,
              textShadow: '0 1px 3px #000',
            }}>
              {p.text || '!'}
            </div>
          );
        }

        if (p.type === 'death') {
          return (
            <div key={p.id} style={{
              position: 'absolute',
              left: px - RENDERED_TILE / 2, top: py,
              width: RENDERED_TILE, height: RENDERED_TILE,
              background: 'radial-gradient(circle, rgba(255,50,50,0.8) 0%, transparent 70%)',
              borderRadius: '50%',
              zIndex: 20,
              pointerEvents: 'none',
              animation: `deathFlash ${p.life}ms ease-out forwards`,
            }} />
          );
        }

        if (p.type === 'levelup') {
          return (
            <div key={p.id} style={{
              position: 'absolute',
              left: px - 30, top: py - 16,
              color: '#ffd700',
              fontSize: 13,
              fontFamily: 'KenneyFuture, monospace',
              zIndex: 30,
              pointerEvents: 'none',
              animation: `levelUpPop ${p.life}ms ease-out forwards`,
              textShadow: '0 0 10px #ffd700, 0 1px 3px #000',
            }}>
              LEVEL UP!
            </div>
          );
        }

        return null;
      })}
    </>
  );
}
