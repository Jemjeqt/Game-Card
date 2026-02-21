import React, { useEffect, useRef, useState } from 'react';
import useUIStore from '../../stores/useUIStore';

export default function BattleLog() {
  const battleLog = useUIStore((s) => s.battleLog);
  const scrollRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const [minimized, setMinimized] = useState(isMobile);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current && !minimized) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [battleLog.length, minimized]);

  return (
    <div className={`battle-log ${minimized ? 'battle-log--minimized' : ''}`}>
      <div className="battle-log__header" onClick={() => setMinimized(!minimized)}>
        <span>⚔ Battle Log</span>
        <button className="battle-log__toggle" title={minimized ? 'Expand' : 'Minimize'}>
          {minimized ? '◀' : '▶'}
        </button>
      </div>
      {!minimized && (
        <div className="battle-log__entries" ref={scrollRef}>
          {battleLog.map((entry) => (
            <div
              key={entry.id}
              className={`battle-log__entry battle-log__entry--${entry.type}`}
            >
              {entry.text}
            </div>
          ))}
          {battleLog.length === 0 && (
            <div className="battle-log__entry battle-log__entry--system">
              Waiting for battle to begin...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
