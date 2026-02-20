import { LOG_TYPES } from '../data/constants';

// Format a battle log entry
export function createLogEntry(text, type = LOG_TYPES.SYSTEM) {
  return {
    id: Date.now() + Math.random(),
    text,
    type,
    timestamp: Date.now(),
  };
}

// Format player name
export function playerName(isPlayer) {
  return isPlayer ? 'You' : 'Enemy';
}

// Common log messages
export const LogMessages = {
  playCard: (isPlayer, cardName, manaCost) =>
    createLogEntry(
      `${playerName(isPlayer)} played ${cardName} (${manaCost} mana)`,
      LOG_TYPES.PLAY
    ),
  attack: (isPlayer, cardName, damage) =>
    createLogEntry(
      `${playerName(isPlayer)}r ${cardName} attacks for ${damage}!`,
      LOG_TYPES.ATTACK
    ),
  takeDamage: (isPlayer, amount) =>
    createLogEntry(
      `${playerName(isPlayer)} takes ${amount} damage!`,
      LOG_TYPES.DAMAGE
    ),
  heal: (isPlayer, amount) =>
    createLogEntry(
      `${playerName(isPlayer)} heals for ${amount} HP`,
      LOG_TYPES.HEAL
    ),
  drawCard: (isPlayer) =>
    createLogEntry(
      `${playerName(isPlayer)} drew a card`,
      LOG_TYPES.DRAW
    ),
  cardBurned: (isPlayer) =>
    createLogEntry(
      `${playerName(isPlayer)}r hand is full! Card burned.`,
      LOG_TYPES.SYSTEM
    ),
  minionDied: (isPlayer, cardName) =>
    createLogEntry(
      `${playerName(isPlayer)}r ${cardName} was destroyed!`,
      LOG_TYPES.DEATH
    ),
  effectTriggered: (cardName, effectDesc) =>
    createLogEntry(
      `${cardName}: ${effectDesc}`,
      LOG_TYPES.EFFECT
    ),
  fatigue: (isPlayer, damage) =>
    createLogEntry(
      `${playerName(isPlayer)} takes ${damage} fatigue damage!`,
      LOG_TYPES.DAMAGE
    ),
  turnStart: (isPlayer, turnNum) =>
    createLogEntry(
      `--- Turn ${turnNum}: ${playerName(isPlayer)}r turn ---`,
      LOG_TYPES.SYSTEM
    ),
  gameOver: (playerWon) =>
    createLogEntry(
      playerWon ? '🏆 Victory! You won!' : '💀 Defeat! You lost!',
      LOG_TYPES.SYSTEM
    ),
};
