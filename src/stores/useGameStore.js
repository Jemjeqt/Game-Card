import { create } from 'zustand';
import { PHASES, GAME_STATUS, PLAYERS, AI_DIFFICULTY } from '../data/constants';

const useGameStore = create((set, get) => ({
  // State
  phase: PHASES.START_TURN,
  turn: 0,
  activePlayer: PLAYERS.PLAYER, // Player goes first
  gameStatus: GAME_STATUS.MENU,
  isProcessing: false,
  winner: null,
  aiDifficulty: AI_DIFFICULTY.NORMAL, // Current AI difficulty

  // Actions
  startGame: () => {
    set({
      phase: PHASES.START_TURN,
      turn: 1,
      activePlayer: PLAYERS.PLAYER,
      gameStatus: GAME_STATUS.PLAYING,
      isProcessing: false,
      winner: null,
    });
  },

  setAiDifficulty: (diff) => set({ aiDifficulty: diff }),

  setPhase: (phase) => set({ phase }),

  nextPhase: () => {
    const { phase } = get();
    const phaseOrder = [
      PHASES.START_TURN,
      PHASES.DRAW,
      PHASES.MAIN,
      PHASES.ATTACK,
      PHASES.END_TURN,
    ];
    const currentIndex = phaseOrder.indexOf(phase);
    if (currentIndex < phaseOrder.length - 1) {
      set({ phase: phaseOrder[currentIndex + 1] });
    }
  },

  switchTurn: () => {
    const { activePlayer, turn } = get();
    const newActive =
      activePlayer === PLAYERS.PLAYER ? PLAYERS.OPPONENT : PLAYERS.PLAYER;
    const newTurn = newActive === PLAYERS.PLAYER ? turn + 1 : turn;
    set({
      activePlayer: newActive,
      turn: newTurn,
      phase: PHASES.START_TURN,
    });
  },

  setProcessing: (val) => set({ isProcessing: val }),

  setGameStatus: (status) => set({ gameStatus: status }),

  setGameOver: (winner) => {
    set({
      gameStatus:
        winner === PLAYERS.PLAYER
          ? GAME_STATUS.PLAYER_WIN
          : GAME_STATUS.OPPONENT_WIN,
      winner,
      isProcessing: true,
    });
  },

  checkGameOver: (playerHp, opponentHp) => {
    if (playerHp <= 0) {
      get().setGameOver(PLAYERS.OPPONENT);
      return true;
    }
    if (opponentHp <= 0) {
      get().setGameOver(PLAYERS.PLAYER);
      return true;
    }
    return false;
  },

  returnToMenu: () => {
    set({
      phase: PHASES.START_TURN,
      turn: 0,
      activePlayer: PLAYERS.PLAYER,
      gameStatus: GAME_STATUS.MENU,
      isProcessing: false,
      winner: null,
      aiDifficulty: AI_DIFFICULTY.NORMAL,
    });
  },

  isPlayerTurn: () => get().activePlayer === PLAYERS.PLAYER,

  resetGame: () => {
    set({
      phase: PHASES.START_TURN,
      turn: 0,
      activePlayer: PLAYERS.PLAYER,
      gameStatus: GAME_STATUS.MENU,
      isProcessing: false,
      winner: null,
      aiDifficulty: AI_DIFFICULTY.NORMAL,
    });
  },
}));

export default useGameStore;
