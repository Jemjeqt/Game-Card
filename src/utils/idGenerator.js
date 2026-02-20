let counter = 0;

// Generate a unique instance ID for a card copy
export function generateId(cardId) {
  counter++;
  const rand = Math.random().toString(36).substring(2, 6);
  return `${cardId}_${counter}_${rand}`;
}

// Reset counter (for testing)
export function resetIdCounter() {
  counter = 0;
}
