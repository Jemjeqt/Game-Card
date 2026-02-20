import React from 'react';

export default function HPBar({ hp, maxHp, isShaking = false }) {
  const percentage = Math.max(0, (hp / maxHp) * 100);
  const isLow = hp <= 10;

  return (
    <div className={`hp-bar ${isShaking ? 'hp-bar--damaged' : ''}`}>
      <span className="hp-bar__icon">❤️</span>
      <div className="hp-bar__bar">
        <div
          className={`hp-bar__fill ${isLow ? 'hp-bar__fill--low' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="hp-bar__text">
        {hp}/{maxHp}
      </span>
    </div>
  );
}
