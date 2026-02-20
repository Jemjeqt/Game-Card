import useGameStore from '../stores/useGameStore';
import usePlayerStore from '../stores/usePlayerStore';
import useOpponentStore from '../stores/useOpponentStore';
import { MAX_BOARD_SIZE } from '../data/constants';

/**
 * Check if the game is over (either player HP <= 0)
 * Should be called after any HP modification
 */
export function checkGameOver() {
  const playerHp = usePlayerStore.getState().hp;
  const opponentHp = useOpponentStore.getState().hp;
  return useGameStore.getState().checkGameOver(playerHp, opponentHp);
}

/**
 * Check if a card can be played
 */
export function canPlayCard(card, playerStore) {
  const state = playerStore.getState();

  // Check mana
  if (state.mana < card.manaCost) return { canPlay: false, reason: 'Not enough mana' };

  // Check board space for minions
  if (card.type === 'minion' && state.board.length >= MAX_BOARD_SIZE) {
    return { canPlay: false, reason: 'Board is full' };
  }

  return { canPlay: true };
}

/**
 * Check if it's the player's turn and the correct phase
 */
export function canPlayerAct() {
  const { activePlayer, phase, isProcessing, gameStatus } = useGameStore.getState();
  if (gameStatus !== 'playing') return false;
  if (isProcessing) return false;
  if (activePlayer !== 'player') return false;
  return true;
}

/**
 * Check if a minion has summoning sickness
 */
export function hasSummoningSickness(minion) {
  return !minion.canAttack;
}
