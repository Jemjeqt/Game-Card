import React from 'react';
import Card from '../Card/Card';
import useOpponentStore from '../../stores/useOpponentStore';
import useUIStore from '../../stores/useUIStore';

export default function OpponentField() {
  const board = useOpponentStore((s) => s.board);

  const handleRightClick = (card) => {
    useUIStore.getState().setShowCardPreview(card);
  };

  return (
    <div className="field field--opponent">
      {board.length === 0 ? (
        <span className="field__empty">No enemy minions</span>
      ) : (
        board.map((minion) => (
          <Card
            key={minion.instanceId}
            card={minion}
            size="board"
            isExhausted={minion.exhausted}
            onRightClick={handleRightClick}
          />
        ))
      )}
    </div>
  );
}
