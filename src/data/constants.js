// Game constants
export const STARTING_HP = 50;
export const MAX_HP = 50;
export const MAX_MANA = 10;
export const STARTING_MANA = 1;
export const MAX_HAND_SIZE = 7;
export const MAX_BOARD_SIZE = 5;
export const CARDS_PER_COPY = 2;
export const PLAYER_STARTING_HAND = 3;
export const AI_STARTING_HAND = 4; // AI goes second, gets 1 extra card

// Turn phases
export const PHASES = {
  START_TURN: 'START_TURN',
  DRAW: 'DRAW',
  MAIN: 'MAIN',
  ATTACK: 'ATTACK',
  END_TURN: 'END_TURN',
};

// Phase sequence
export const PHASE_ORDER = [
  PHASES.START_TURN,
  PHASES.DRAW,
  PHASES.MAIN,
  PHASES.ATTACK,
  PHASES.END_TURN,
];

// Game status
export const GAME_STATUS = {
  MENU: 'menu',
  LOBBY: 'lobby',
  PLAYING: 'playing',
  PLAYER_WIN: 'playerWin',
  OPPONENT_WIN: 'opponentWin',
};

// Active player
export const PLAYERS = {
  PLAYER: 'player',
  OPPONENT: 'opponent',
};

// Animation delays (ms)
export const DELAYS = {
  CARD_DRAW: 400,
  CARD_PLAY: 500,
  SPELL_CAST: 600,
  ATTACK: 500,
  DAMAGE: 300,
  AI_THINK: 800,
  AI_ACTION: 700,
  TURN_BANNER: 1500,
  PHASE_TRANSITION: 300,
};

// Card types
export const CARD_TYPES = {
  MINION: 'minion',
  SPELL: 'spell',
};

// Rarity
export const RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

// Log entry types
export const LOG_TYPES = {
  PLAY: 'play',
  ATTACK: 'attack',
  DAMAGE: 'damage',
  HEAL: 'heal',
  DRAW: 'draw',
  EFFECT: 'effect',
  SYSTEM: 'system',
  DEATH: 'death',
};
