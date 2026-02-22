import React, { useState, useEffect } from 'react';
import useGameStore from '../../stores/useGameStore';
import usePlayerStore from '../../stores/usePlayerStore';
import useOpponentStore from '../../stores/useOpponentStore';
import useUIStore from '../../stores/useUIStore';
import useMultiplayerStore from '../../stores/useMultiplayerStore';
import useRankedStore from '../../stores/useRankedStore';
import useQuestStore from '../../stores/useQuestStore';
import useDraftStore from '../../stores/useDraftStore';
import useAuthStore from '../../stores/useAuthStore';
import RankedResult from './RankedResult';
import { PLAYERS } from '../../data/constants';
import { initializeGame } from '../../engine/turnEngine';
import { cleanupMultiplayer } from '../../engine/multiplayerEngine';
import { recordGameResult, updateUserProfile } from '../../firebase/userService';

export default function GameOverScreen() {
  const winner = useGameStore((s) => s.winner);
  const returnToMenu = useGameStore((s) => s.returnToMenu);
  const resetPlayer = usePlayerStore((s) => s.resetPlayer);
  const resetOpponent = useOpponentStore((s) => s.resetPlayer);
  const resetUI = useUIStore((s) => s.resetUI);
  const isMultiplayer = useMultiplayerStore((s) => s.isMultiplayer);
  const isRankedMode = useRankedStore((s) => s.isRankedMode);
  const isDraftMode = useDraftStore((s) => s.isDraftMode);
  const lastMatchResult = useRankedStore((s) => s.lastMatchResult);

  const playerWon = winner === PLAYERS.PLAYER;
  const [hasRecorded, setHasRecorded] = useState(false);

  // Record match result for ranked/quests/profile
  useEffect(() => {
    if (winner && !hasRecorded) {
      setHasRecorded(true);

      // Track quests
      if (playerWon) {
        useQuestStore.getState().trackEvent('wins', 1);
        if (isDraftMode) {
          useQuestStore.getState().trackEvent('draft_wins', 1);
        }
      }

      // Record ranked match
      if (isRankedMode) {
        useRankedStore.getState().recordMatch(playerWon);
        // Persist rankedPoints to Firestore so it syncs across devices
        // Only save ranked-specific fields here; win/loss/streak are handled by recordGameResult
        const rankedUser = useAuthStore.getState().user;
        if (rankedUser) {
          const st = useRankedStore.getState();
          updateUserProfile(rankedUser.uid, {
            rankedPoints: st.points,
            highestRankedPoints: st.highestPoints,
          }).catch((err) => console.warn('Failed to sync ranked to Firestore:', err));
        }
      }

      // Record to Firestore (coins, EXP, win/loss)
      const user = useAuthStore.getState().user;
      if (user) {
        recordGameResult(user.uid, playerWon)
          .then(() => useAuthStore.getState().refreshProfile())
          .catch((err) => console.warn('Failed to record game result:', err));
      }
    }
  }, [winner, hasRecorded, playerWon, isRankedMode, isDraftMode]);

  const handlePlayAgain = () => {
    resetPlayer();
    resetOpponent();
    resetUI();
    useRankedStore.getState().clearLastMatch();
    if (isMultiplayer) {
      cleanupMultiplayer();
      returnToMenu();
    } else if (isDraftMode) {
      useDraftStore.getState().resetDraft();
      returnToMenu();
    } else {
      initializeGame();
    }
  };

  const handleMenu = () => {
    resetPlayer();
    resetOpponent();
    resetUI();
    useRankedStore.getState().clearLastMatch();
    if (isMultiplayer) {
      cleanupMultiplayer();
    }
    if (isDraftMode) {
      useDraftStore.getState().resetDraft();
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

      {/* Ranked result overlay */}
      {isRankedMode && lastMatchResult && (
        <RankedResult onContinue={() => useRankedStore.getState().clearLastMatch()} />
      )}

      {isDraftMode && (
        <div className="game-over__draft-label">📜 Draft Mode</div>
      )}

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
