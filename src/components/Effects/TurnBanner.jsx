import React from 'react';
import useUIStore from '../../stores/useUIStore';

export default function TurnBanner() {
  const turnBanner = useUIStore((s) => s.turnBanner);

  if (!turnBanner) return null;

  return (
    <div className="turn-banner">
      <div className="turn-banner__text">{turnBanner}</div>
    </div>
  );
}
