import React, { useRef, useEffect, useState } from 'react';
import Card from '../Card/Card';
import useOpponentStore from '../../stores/useOpponentStore';
import useUIStore from '../../stores/useUIStore';

export default function OpponentField() {
  const board = useOpponentStore((s) => s.board);

  const handleRightClick = (card) => {
    useUIStore.getState().setShowCardPreview(card);
  };

  // Track entering cards for entrance animation
  const prevIdsRef = useRef(new Set());
  const [enteringIds, setEnteringIds] = useState(new Set());

  useEffect(() => {
    const currentIds = new Set(board.map((m) => m.instanceId));
    const newIds = new Set();
    for (const id of currentIds) {
      if (!prevIdsRef.current.has(id)) newIds.add(id);
    }
    prevIdsRef.current = currentIds;

    if (newIds.size > 0) {
      setEnteringIds(newIds);
      const timer = setTimeout(() => setEnteringIds(new Set()), 300);
      return () => clearTimeout(timer);
    }
  }, [board]);

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
            isEntering={enteringIds.has(minion.instanceId)}
            onRightClick={handleRightClick}
          />
        ))
      )}
    </div>
  );
}
