// Version
export const GAME_VERSION = 'v0.4.0-beta';
export const GAME_VERSION_DATE = '2026-02-21';

// Game constants
export const STARTING_HP = 60;
export const MAX_HP = 60;
export const MAX_MANA = 10;
export const STARTING_MANA = 1;
export const MAX_HAND_SIZE = 9;
export const MAX_BOARD_SIZE = 10;
export const CARDS_PER_COPY = 2;
export const PLAYER_STARTING_HAND = 4;
export const AI_STARTING_HAND = 5; // AI goes second, gets 1 extra card

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
  DRAFT: 'draft',
  PLAYING: 'playing',
  PLAYER_WIN: 'playerWin',
  OPPONENT_WIN: 'opponentWin',
};

// Active player
export const PLAYERS = {
  PLAYER: 'player',
  OPPONENT: 'opponent',
};

// AI Difficulty levels (mapped to ranked tiers)
export const AI_DIFFICULTY = {
  EASY: 'easy',         // Bronze
  NORMAL: 'normal',     // Silver
  HARD: 'hard',         // Gold
  EXPERT: 'expert',     // Platinum
  MASTER: 'master',     // Diamond
  MYTHIC: 'mythic',     // Mythic
  IMMORTAL: 'immortal', // Immortal
};

// Difficulty config — controls AI intelligence
export const DIFFICULTY_CONFIG = {
  easy:     { scoreMultiplier: 0.6, mistakeChance: 0.35, skipChance: 0.15, label: 'Easy',     icon: '🟢' },
  normal:   { scoreMultiplier: 0.8, mistakeChance: 0.2,  skipChance: 0.08, label: 'Normal',   icon: '🟡' },
  hard:     { scoreMultiplier: 1.0, mistakeChance: 0.1,  skipChance: 0.03, label: 'Hard',     icon: '🟠' },
  expert:   { scoreMultiplier: 1.2, mistakeChance: 0.05, skipChance: 0.0,  label: 'Expert',   icon: '🔴' },
  master:   { scoreMultiplier: 1.4, mistakeChance: 0.02, skipChance: 0.0,  label: 'Master',   icon: '💀' },
  mythic:   { scoreMultiplier: 1.6, mistakeChance: 0.01, skipChance: 0.0,  label: 'Mythic',   icon: '👑' },
  immortal: { scoreMultiplier: 1.8, mistakeChance: 0.0,  skipChance: 0.0,  label: 'Immortal', icon: '🔱' },
};

// Map tier id → difficulty
export const TIER_DIFFICULTY = {
  bronze: AI_DIFFICULTY.EASY,
  silver: AI_DIFFICULTY.NORMAL,
  gold: AI_DIFFICULTY.HARD,
  platinum: AI_DIFFICULTY.EXPERT,
  diamond: AI_DIFFICULTY.MASTER,
  mythic: AI_DIFFICULTY.MYTHIC,
  immortal: AI_DIFFICULTY.IMMORTAL,
};

// RP gain/loss per tier — higher rank = less gain, more loss
export const TIER_RP = {
  bronze:   { win: 30, loss: 10 },
  silver:   { win: 25, loss: 15 },
  gold:     { win: 22, loss: 18 },
  platinum: { win: 20, loss: 20 },
  diamond:  { win: 18, loss: 22 },
  mythic:   { win: 15, loss: 25 },
  immortal: { win: 12, loss: 28 },
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
  MYTHIC: 'mythic',
  IMMORTAL: 'immortal',
};

// Full tier configuration — HP, mana cap, card pool, deck size, guaranteed cards
export const TIER_CONFIG = {
  bronze: {
    hp: 20,
    maxHp: 20,
    maxMana: 5,
    manaRange: [1, 3],
    rarities: [RARITY.COMMON, RARITY.RARE, RARITY.LEGENDARY],
    deckSize: 20,
    guaranteed: {},
  },
  silver: {
    hp: 25,
    maxHp: 25,
    maxMana: 6,
    manaRange: [1, 4],
    rarities: [RARITY.COMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY],
    deckSize: 20,
    guaranteed: {},
  },
  gold: {
    hp: 30,
    maxHp: 30,
    maxMana: 8,
    manaRange: [1, 5],
    rarities: [RARITY.COMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY],
    deckSize: 25,
    guaranteed: {},
  },
  platinum: {
    hp: 35,
    maxHp: 35,
    maxMana: 10,
    manaRange: [2, 6],
    rarities: [RARITY.COMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY],
    deckSize: 25,
    guaranteed: { legendary: 2 },
  },
  diamond: {
    hp: 40,
    maxHp: 40,
    maxMana: 12,
    manaRange: [2, 7],
    rarities: [RARITY.COMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY, RARITY.MYTHIC],
    deckSize: 30,
    guaranteed: { mythic: 1 },
  },
  mythic: {
    hp: 45,
    maxHp: 45,
    maxMana: 15,
    manaRange: [3, 10],
    rarities: [RARITY.COMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY, RARITY.MYTHIC, RARITY.IMMORTAL],
    deckSize: 30,
    guaranteed: { mythic: 1, immortal: 1 },
  },
  immortal: {
    hp: 45,
    maxHp: 45,
    maxMana: 15,
    manaRange: [3, 10],
    rarities: [RARITY.COMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY, RARITY.MYTHIC, RARITY.IMMORTAL],
    deckSize: 30,
    guaranteed: { mythic: 1, immortal: 1 },
  },
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
