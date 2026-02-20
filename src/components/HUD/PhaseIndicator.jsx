import React from 'react';

export default function PhaseIndicator({ phase }) {
  const phaseLabels = {
    START_TURN: 'Start',
    DRAW: 'Draw',
    MAIN: 'Main Phase',
    ATTACK: 'Attack Phase',
    END_TURN: 'End Turn',
  };

  return (
    <div className="phase-indicator">{phaseLabels[phase] || phase}</div>
  );
}
