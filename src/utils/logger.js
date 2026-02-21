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
