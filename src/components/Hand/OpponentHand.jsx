import React from 'react';
import CardBack from '../Card/CardBack';
import useOpponentStore from '../../stores/useOpponentStore';

export default function OpponentHand() {
  const handCount = useOpponentStore((s) => s.hand.length);

  return (
    <div className="opponent-hand">
      {Array.from({ length: handCount }).map((_, i) => (
        <CardBack key={i} small />
      ))}
    </div>
  );
}
