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
        <>
          {/* Primary row: always 5 slots */}
          <div className="field__row">
            {Array.from({ length: 5 }, (_, i) => {
              const minion = board[i];
              if (!minion) {
                return <div key={`gs-${i}`} className="field__slot" />;
              }
              return (
                <div key={minion.instanceId} className="field__slot field__slot--filled">
                  <Card
                    card={minion}
                    size="board"
                    isExhausted={minion.exhausted}
                    isEntering={enteringIds.has(minion.instanceId)}
                    onRightClick={handleRightClick}
                  />
                </div>
              );
            })}
          </div>
          {/* Overflow row: cards 6–10 */}
          {board.length > 5 && (
            <div className="field__row field__row--overflow">
              {board.slice(5).map((minion) => (
                <div key={minion.instanceId} className="field__slot field__slot--filled">
                  <Card
                    card={minion}
                    size="board"
                    isExhausted={minion.exhausted}
                    isEntering={enteringIds.has(minion.instanceId)}
                    onRightClick={handleRightClick}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
