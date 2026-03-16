// HUD — Health bar, XP bar, Gold, Weapon, Inventory, Auto-aim toggle
import React from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { play } from '../../systems/sound.js';

function Bar({ value, max, color, bgColor = '#1a1a2e', label, icon }) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ color: '#aaa', fontSize: 9 }}>{icon} {label}</span>
        <span style={{ color: '#ddd', fontSize: 9 }}>{Math.floor(value)}/{max}</span>
      </div>
      <div style={{
        width: '100%', height: 10,
        background: bgColor,
        borderRadius: 5,
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 5,
          transition: 'width 0.3s ease',
          boxShadow: `0 0 6px ${color}`,
        }} />
      </div>
    </div>
  );
}

export default function HUD() {
  const player      = useGameStore(s => s.player);
  const autoAim     = useGameStore(s => s.autoAim);
  const toggleAutoAim = useGameStore(s => s.toggleAutoAim);
  const usePotion   = useGameStore(s => s.usePotion);
  const setScreen   = useGameStore(s => s.setScreen);

  const potions = player.inventory.filter(i => i.type === 'potion');

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '10px 14px',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
      pointerEvents: 'none',
      zIndex: 100,
      fontFamily: 'KenneyFutureNarrow, monospace',
    }}>

      {/* LEFT — Stats */}
      <div style={{ width: 160, pointerEvents: 'auto' }}>
        <div style={{ color: '#fbbf24', fontSize: 11, marginBottom: 6, letterSpacing: 1 }}>
          ★ LVL {player.level} — {player.charId.toUpperCase()}
        </div>
        <Bar value={player.hp}   max={player.maxHp}  color="#ef4444" label="HP"  icon="♥" />
        <Bar value={player.xp}   max={player.xpNext} color="#a855f7" label="XP"  icon="✦" bgColor="#0d0d1a" />
        <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
          <span style={{ color: '#fbbf24', fontSize: 10 }}>⚔ {player.weapon?.label}</span>
          <span style={{ color: '#fbbf24', fontSize: 10 }}>💰 {player.gold}</span>
        </div>
      </div>

      {/* CENTER — Level name */}
      <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: 2 }}>
          CURRENT LEVEL
        </div>
      </div>

      {/* RIGHT — Controls */}
      <div style={{ textAlign: 'right', pointerEvents: 'auto' }}>
        {/* Auto-aim toggle */}
        <button
          onClick={() => { toggleAutoAim(); play('click'); }}
          style={{
            background:   autoAim ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.1)',
            border:       `1px solid ${autoAim ? '#a855f7' : 'rgba(255,255,255,0.2)'}`,
            color:        autoAim ? '#a855f7' : '#888',
            borderRadius: 4,
            padding:      '3px 8px',
            fontSize:     9,
            cursor:       'pointer',
            fontFamily:   'KenneyFutureNarrow, monospace',
            marginBottom: 6,
            display:      'block',
            marginLeft:   'auto',
            letterSpacing: 1,
          }}
        >
          {autoAim ? '⊕ AUTO-AIM' : '⊗ MANUAL'}
        </button>

        {/* Potions */}
        <button
          onClick={() => { usePotion(); play('select'); }}
          disabled={potions.length === 0}
          style={{
            background:   potions.length > 0 ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
            border:       `1px solid ${potions.length > 0 ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
            color:        potions.length > 0 ? '#22c55e' : '#555',
            borderRadius: 4,
            padding:      '3px 8px',
            fontSize:     9,
            cursor:       potions.length > 0 ? 'pointer' : 'default',
            fontFamily:   'KenneyFutureNarrow, monospace',
            marginBottom: 6,
            display:      'block',
            marginLeft:   'auto',
            letterSpacing: 1,
          }}
        >
          [Q] POTION ×{potions.length}
        </button>

        {/* ATK stat */}
        <div style={{ color: '#f59e0b', fontSize: 9, letterSpacing: 1 }}>
          ⚔ ATK {player.atk + (player.weapon?.damage ?? 0)}
        </div>

        {/* Menu button */}
        <button
          onClick={() => { setScreen('title'); play('click'); }}
          style={{
            marginTop:    6,
            background:   'rgba(255,255,255,0.07)',
            border:       '1px solid rgba(255,255,255,0.15)',
            color:        '#888',
            borderRadius: 4,
            padding:      '3px 8px',
            fontSize:     8,
            cursor:       'pointer',
            fontFamily:   'KenneyFutureNarrow, monospace',
            display:      'block',
            marginLeft:   'auto',
            letterSpacing: 1,
          }}
        >
          MENU
        </button>
      </div>
    </div>
  );
}
