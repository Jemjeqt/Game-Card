import React from 'react';

export default function DeckCounter({ count }) {
  return (
    <div className="deck-counter">
      <span className="deck-counter__icon">📚</span>
      <span>{count}</span>
    </div>
  );
}
