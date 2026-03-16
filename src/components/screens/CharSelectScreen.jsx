// Character Selection Screen
import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { PLAYER_LIST } from '../../constants/sprites.js';
import { TILE_SIZE, SCALE } from '../../constants/tiles.js';
import { play } from '../../systems/sound.js';

const TILEMAP_SRC = '/Tilemap/tilemap_packed.png';
const SHEET_COLS  = 12;

function CharCard({ sprite, selected, unlocked, onClick }) {
  const size   = TILE_SIZE * (SCALE + 1);
  const srcX   = sprite.col * TILE_SIZE;
  const srcY   = sprite.row * TILE_SIZE;
  const bgSize = SHEET_COLS * TILE_SIZE * (SCALE + 1);

  return (
    <div
      onClick={unlocked ? onClick : undefined}
      style={{
        width: 120,
        padding: '14px 10px',
        background: selected
          ? 'linear-gradient(145deg, rgba(168,85,247,0.25), rgba(100,50,200,0.3))'
          : unlocked
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(0,0,0,0.3)',
        border: `2px solid ${selected ? '#a855f7' : unlocked ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 8,
        textAlign: 'center',
        cursor: unlocked ? 'pointer' : 'default',
        opacity: unlocked ? 1 : 0.5,
        transition: 'all 0.2s',
        boxShadow: selected ? '0 0 20px rgba(168,85,247,0.4)' : 'none',
        fontFamily: 'KenneyFutureNarrow, monospace',
        userSelect: 'none',
        transform: selected ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      {/* Sprite */}
      <div style={{
        width: size, height: size,
        backgroundImage: `url(${TILEMAP_SRC})`,
        backgroundPosition: `-${srcX * (SCALE + 1)}px -${srcY * (SCALE + 1)}px`,
        backgroundSize: `${bgSize}px auto`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        margin: '0 auto 8px',
        filter: selected ? 'brightness(1.3)' : 'brightness(0.9)',
      }} />

      <div style={{ color: selected ? '#e9d5ff' : '#bbb', fontSize: 10, letterSpacing: 1 }}>
        {sprite.label.toUpperCase()}
      </div>
      <div style={{ color: '#777', fontSize: 8, marginTop: 3 }}>
        {sprite.description}
      </div>
      {!unlocked && (
        <div style={{
          marginTop: 6,
          color: '#fbbf24', fontSize: 8,
          background: 'rgba(251,191,36,0.1)',
          border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: 3, padding: '2px 4px',
        }}>
          🔒 LOCKED
        </div>
      )}
    </div>
  );
}

export default function CharSelectScreen() {
  const setScreen    = useGameStore(s => s.setScreen);
  const selectChar   = useGameStore(s => s.selectChar);
  const initLevel    = useGameStore(s => s.initLevel);
  const player       = useGameStore(s => s.player);
  const unlockedChars = useGameStore(s => s.unlockedChars);

  const [selected, setSelected] = useState(player.charId ?? 'knight');

  const handleSelect = (id) => {
    setSelected(id);
    play('click');
  };

  const handlePlay = () => {
    selectChar(selected);
    initLevel(0);
    play('select');
    setScreen('game');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 50% 40%, #150a2e 0%, #0a0a0f 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'KenneyFuture, monospace',
      userSelect: 'none',
    }}>
      <div style={{ color: '#a855f7', fontSize: 22, letterSpacing: 4, marginBottom: 6 }}>
        CHOOSE CHARACTER
      </div>
      <div style={{ color: '#555', fontSize: 9, letterSpacing: 3, marginBottom: 32 }}>
        UNLOCK MORE IN-GAME WITH GOLD
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
        {PLAYER_LIST.map(sprite => (
          <CharCard
            key={sprite.id}
            sprite={sprite}
            selected={selected === sprite.id}
            unlocked={unlockedChars.includes(sprite.id)}
            onClick={() => handleSelect(sprite.id)}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => { setScreen('title'); play('click'); }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#888',
            fontSize: 10, padding: '10px 24px', borderRadius: 5,
            cursor: 'pointer', fontFamily: 'KenneyFuture, monospace', letterSpacing: 2,
          }}
        >
          ← BACK
        </button>
        <button
          onClick={handlePlay}
          style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(100,50,200,0.45))',
            border: '2px solid #a855f7',
            color: '#e9d5ff',
            fontSize: 12, padding: '10px 36px', borderRadius: 5,
            cursor: 'pointer', fontFamily: 'KenneyFuture, monospace', letterSpacing: 3,
            boxShadow: '0 0 16px rgba(168,85,247,0.35)',
          }}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.04)'; play('click'); }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
        >
          ENTER DUNGEON →
        </button>
      </div>
    </div>
  );
}
