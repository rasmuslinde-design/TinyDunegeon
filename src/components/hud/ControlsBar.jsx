// Controls bar at the bottom of screen
import React from 'react';

const keys = [
  { key: 'WASD', desc: 'Move' },
  { key: 'SPACE / Z', desc: 'Attack' },
  { key: 'Q', desc: 'Potion' },
  { key: 'E', desc: 'Interact' },
];

export default function ControlsBar() {
  return (
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      display: 'flex',
      justifyContent: 'center',
      gap: 16,
      padding: '8px 14px',
      background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
      pointerEvents: 'none',
      zIndex: 100,
      fontFamily: 'KenneyFutureNarrow, monospace',
    }}>
      {keys.map(({ key, desc }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#ddd',
            borderRadius: 3,
            padding: '1px 5px',
            fontSize: 8,
            letterSpacing: 0.5,
          }}>
            {key}
          </span>
          <span style={{ color: '#666', fontSize: 8 }}>{desc}</span>
        </div>
      ))}
    </div>
  );
}
