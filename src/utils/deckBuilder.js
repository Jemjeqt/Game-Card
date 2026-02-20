import { getAllCards } from '../data/cards';
import { CARDS_PER_COPY } from '../data/constants';
import { shuffle } from './shuffle';
import { generateId } from './idGenerator';

// Create a card instance from a card definition
export function createCardInstance(cardDef) {
  return {
    instanceId: generateId(cardDef.id),
    cardId: cardDef.id,
    name: cardDef.name,
    manaCost: cardDef.manaCost,
    baseAttack: cardDef.attack,
    baseDefense: cardDef.defense,
    currentAttack: cardDef.attack,
    currentDefense: cardDef.defense,
    type: cardDef.type,
    rarity: cardDef.rarity,
    effect: cardDef.effect,
    description: cardDef.description,
    icon: cardDef.icon,
    keywords: [...(cardDef.keywords || [])],
    canAttack: false, // summoning sickness
    exhausted: false,
    shield: 0,
    buffs: [],
  };
}

// Build a 40-card deck (2 copies of each of the 20 cards), shuffled
export function buildDeck() {
  const allCards = getAllCards();
  const deck = [];

  for (const cardDef of allCards) {
    for (let i = 0; i < CARDS_PER_COPY; i++) {
      deck.push(createCardInstance(cardDef));
    }
  }

  return shuffle(deck);
}
