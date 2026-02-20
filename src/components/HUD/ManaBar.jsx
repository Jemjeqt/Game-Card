import React from 'react';

export default function ManaBar({ mana, maxMana }) {
  const crystals = [];
  for (let i = 0; i < maxMana; i++) {
    crystals.push(
      <div
        key={i}
        className={`mana-bar__crystal ${
          i < mana ? 'mana-bar__crystal--filled' : 'mana-bar__crystal--empty'
        }`}
      />
    );
  }

  return (
    <div className="mana-bar">
      <span style={{ fontSize: '16px' }}>💎</span>
      <div className="mana-bar__crystals">{crystals}</div>
      <span className="mana-bar__text">
        {mana}/{maxMana}
      </span>
    </div>
  );
}
