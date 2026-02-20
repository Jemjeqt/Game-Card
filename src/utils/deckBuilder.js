import { getAllCards } from '../data/cards';
import { CARDS_PER_COPY, RARITY } from '../data/constants';
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

// Build a standard deck (2 copies of each card, but only 1 copy of Legendaries), shuffled
export function buildDeck() {
  const allCards = getAllCards();
  const deck = [];

  for (const cardDef of allCards) {
    // Legendaries: only 1 copy per deck
    const copies = cardDef.rarity === RARITY.LEGENDARY ? 1 : CARDS_PER_COPY;
    for (let i = 0; i < copies; i++) {
      deck.push(createCardInstance(cardDef));
    }
  }

  return shuffle(deck);
}

// Build a deck from draft picks (each card appears once)
export function buildDraftDeck(pickedCardDefs) {
  const deck = pickedCardDefs.map((cardDef) => createCardInstance(cardDef));
  return shuffle(deck);
}
