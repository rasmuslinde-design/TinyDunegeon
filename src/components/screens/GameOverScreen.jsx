// Game Over Screen
import React from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { play } from '../../systems/sound.js';

export default function GameOverScreen() {
  const player    = useGameStore(s => s.player);
  const resetGame = useGameStore(s => s.resetGame);
  const setScreen = useGameStore(s => s.setScreen);
  const currentLevelIndex = useGameStore(s => s.currentLevelIndex);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 50% 40%, #2a0a0a 0%, #0a0a0f 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'KenneyFuture, monospace',
    }}>
      <div style={{
        fontSize: 48, color: '#ef4444',
        textShadow: '0 0 30px rgba(239,68,68,0.8)',
        letterSpacing: 4, marginBottom: 8,
        animation: 'titleDrop 0.6s ease-out',
      }}>
        YOU DIED
      </div>

      <div style={{ color: '#555', fontSize: 10, letterSpacing: 3, marginBottom: 40 }}>
        YOUR ADVENTURE ENDS HERE
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8, padding: '16px 28px',
        marginBottom: 36, textAlign: 'center',
        fontFamily: 'KenneyFutureNarrow, monospace',
      }}>
        <div style={{ color: '#aaa', fontSize: 9, marginBottom: 10, letterSpacing: 2 }}>FINAL STATS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
          {[
            ['Level Reached', player.level],
            ['Dungeon Floor',  currentLevelIndex + 1],
            ['XP Earned',      player.xp],
            ['Gold Collected', player.gold],
          ].map(([label, value]) => (
            <React.Fragment key={label}>
              <div style={{ color: '#555', fontSize: 9, textAlign: 'right' }}>{label}</div>
              <div style={{ color: '#ddd', fontSize: 9 }}>{value}</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => { resetGame(); play('select'); }}
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(180,30,30,0.35))',
            border: '2px solid #ef4444',
            color: '#fca5a5',
            fontSize: 11, padding: '10px 28px', borderRadius: 5,
            cursor: 'pointer', fontFamily: 'KenneyFuture, monospace', letterSpacing: 2,
          }}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.04)'; play('click'); }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}
