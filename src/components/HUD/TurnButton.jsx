import React from 'react';
import useGameStore from '../../stores/useGameStore';
import { PHASES, PLAYERS } from '../../data/constants';
import { advanceToAttackPhase, endTurn } from '../../engine/turnEngine';

export default function TurnButton() {
  const phase = useGameStore((s) => s.phase);
  const activePlayer = useGameStore((s) => s.activePlayer);
  const isProcessing = useGameStore((s) => s.isProcessing);
  const gameStatus = useGameStore((s) => s.gameStatus);

  const isPlayerTurn = activePlayer === PLAYERS.PLAYER;
  const isDisabled = !isPlayerTurn || isProcessing || gameStatus !== 'playing';

  let label = '';
  let variant = '';
  let handleClick = null;

  switch (phase) {
    case PHASES.MAIN:
      label = '⚔️ Attack';
      variant = 'turn-button--attack';
      handleClick = () => advanceToAttackPhase();
      break;
    case PHASES.ATTACK:
      label = '⏭️ End Turn';
      variant = 'turn-button--end';
      handleClick = () => endTurn();
      break;
    default:
      label = '⏳ Wait...';
      variant = '';
      handleClick = null;
  }

  return (
    <button
      className={`turn-button ${variant}`}
      disabled={isDisabled || !handleClick}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}
