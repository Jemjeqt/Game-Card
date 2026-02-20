import React from 'react';
import useGameStore from '../../stores/useGameStore';
import usePlayerStore from '../../stores/usePlayerStore';
import useOpponentStore from '../../stores/useOpponentStore';
import useUIStore from '../../stores/useUIStore';
import useMultiplayerStore from '../../stores/useMultiplayerStore';
import { PLAYERS } from '../../data/constants';
import { initializeGame } from '../../engine/turnEngine';
import { cleanupMultiplayer } from '../../engine/multiplayerEngine';

export default function GameOverScreen() {
  const winner = useGameStore((s) => s.winner);
  const returnToMenu = useGameStore((s) => s.returnToMenu);
  const resetPlayer = usePlayerStore((s) => s.resetPlayer);
  const resetOpponent = useOpponentStore((s) => s.resetPlayer);
  const resetUI = useUIStore((s) => s.resetUI);
  const isMultiplayer = useMultiplayerStore((s) => s.isMultiplayer);

  const playerWon = winner === PLAYERS.PLAYER;

  const handlePlayAgain = () => {
    resetPlayer();
    resetOpponent();
    resetUI();
    if (isMultiplayer) {
      cleanupMultiplayer();
      returnToMenu();
    } else {
      initializeGame();
    }
  };

  const handleMenu = () => {
    resetPlayer();
    resetOpponent();
    resetUI();
    if (isMultiplayer) {
      cleanupMultiplayer();
    }
    returnToMenu();
  };

  return (
    <div className="game-over">
      <div className="game-over__icon">{playerWon ? '🏆' : '💀'}</div>
      <h1
        className={`game-over__title ${
          playerWon ? 'game-over__title--win' : 'game-over__title--lose'
        }`}
      >
        {playerWon ? 'Victory!' : 'Defeat!'}
      </h1>
      <p className="game-over__subtitle">
        {playerWon
          ? 'You have vanquished your opponent!'
          : 'Your forces have been destroyed...'}
      </p>
      <div className="game-over__buttons">
        <button
          className="game-over__button game-over__button--primary"
          onClick={handlePlayAgain}
        >
          Play Again
        </button>
        <button
          className="game-over__button game-over__button--secondary"
          onClick={handleMenu}
        >
          Main Menu
        </button>
      </div>
    </div>
  );
}
