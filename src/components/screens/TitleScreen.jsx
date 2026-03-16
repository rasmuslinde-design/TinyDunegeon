// Title Screen
import React from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { play, preloadSounds } from '../../systems/sound.js';

export default function TitleScreen() {
  const setScreen = useGameStore(s => s.setScreen);
  const initLevel = useGameStore(s => s.initLevel);

  const handleStart = () => {
    preloadSounds();
    play('select');
    setScreen('charselect');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 50% 60%, #1a0a2e 0%, #0a0a0f 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'KenneyFuture, monospace',
      userSelect: 'none',
    }}>
      {/* Animated background tiles */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/Tilemap/tilemap_packed.png)',
        backgroundSize: '36px 36px',
        backgroundRepeat: 'repeat',
        opacity: 0.04,
        imageRendering: 'pixelated',
      }} />

      {/* Glow orb */}
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'pulse 3s ease-in-out infinite',
      }} />

      {/* Title */}
      <div style={{
        fontSize: 52,
        color: '#fff',
        textShadow: '0 0 30px rgba(168,85,247,0.8), 0 2px 8px rgba(0,0,0,0.8)',
        marginBottom: 4,
        letterSpacing: 4,
        animation: 'titleDrop 0.8s ease-out',
      }}>
        TINY
      </div>
      <div style={{
        fontSize: 38,
        color: '#a855f7',
        textShadow: '0 0 20px rgba(168,85,247,0.9)',
        marginBottom: 40,
        letterSpacing: 8,
        animation: 'titleDrop 0.8s ease-out 0.1s both',
      }}>
        DUNGEON
      </div>

      {/* Subtitle */}
      <div style={{
        color: '#666', fontSize: 10,
        letterSpacing: 4,
        marginBottom: 60,
        fontFamily: 'KenneyFutureNarrow, monospace',
      }}>
        A 2D DUNGEON CRAWLER
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(100,50,200,0.4))',
          border: '2px solid #a855f7',
          color: '#e9d5ff',
          fontSize: 14,
          padding: '14px 48px',
          borderRadius: 6,
          cursor: 'pointer',
          fontFamily: 'KenneyFuture, monospace',
          letterSpacing: 3,
          boxShadow: '0 0 20px rgba(168,85,247,0.4)',
          transition: 'all 0.2s',
          animation: 'fadeIn 1s ease-out 0.5s both',
        }}
        onMouseEnter={e => {
          e.target.style.background = 'linear-gradient(135deg, rgba(168,85,247,0.5), rgba(100,50,200,0.6))';
          e.target.style.transform = 'scale(1.05)';
          play('click');
        }}
        onMouseLeave={e => {
          e.target.style.background = 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(100,50,200,0.4))';
          e.target.style.transform = 'scale(1)';
        }}
      >
        NEW GAME
      </button>

      {/* Version */}
      <div style={{
        position: 'absolute', bottom: 16,
        color: '#333', fontSize: 8,
        fontFamily: 'KenneyFutureNarrow, monospace',
        letterSpacing: 2,
      }}>
        v1.0 · TINY DUNGEON
      </div>
    </div>
  );
}
