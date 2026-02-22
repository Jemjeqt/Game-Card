import { getAllCards } from '../data/cards';
import { CARDS_PER_COPY, RARITY, TIER_CONFIG } from '../data/constants';
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
    specialEffect: cardDef.specialEffect || null,
    summonId: cardDef.summonId || null,
    canAttack: false, // summoning sickness
    exhausted: false,
    shield: 0,
    buffs: [],
  };
}

// Check if a rarity should be limited to 1 copy per deck
function isSingleCopyRarity(rarity) {
  return rarity === RARITY.LEGENDARY || rarity === RARITY.MYTHIC || rarity === RARITY.IMMORTAL;
}

// Build a standard deck — uses tier config for ranked mode, all cards for classic
// tierId: optional — filter card pool by rank tier (ranked mode)
export function buildDeck(tierId = null) {
  let allCards = getAllCards();

  // Ranked mode: filter by tier config (rarity + mana range), build to deck size
  if (tierId && TIER_CONFIG[tierId]) {
    const config = TIER_CONFIG[tierId];
    const { rarities, manaRange, deckSize, guaranteed } = config;

    // Filter cards by allowed rarities AND mana cost range
    const filteredCards = allCards.filter((c) =>
      rarities.includes(c.rarity) &&
      c.manaCost >= manaRange[0] &&
      c.manaCost <= manaRange[1]
    );

    const deck = [];
    const usedCardIds = new Set();

    // Handle guaranteed card slots (e.g., { legendary: 2, mythic: 1 })
    if (guaranteed) {
      for (const [rarity, count] of Object.entries(guaranteed)) {
        const rarityCards = filteredCards.filter(
          (c) => c.rarity === rarity && !usedCardIds.has(c.id)
        );
        const picked = shuffle([...rarityCards]).slice(0, count);
        for (const card of picked) {
          deck.push(createCardInstance(card));
          usedCardIds.add(card.id);
        }
      }
    }

    // Build card pool from remaining cards (with proper copy counts)
    const remainingPool = [];
    for (const cardDef of filteredCards) {
      if (usedCardIds.has(cardDef.id)) continue;
      const copies = isSingleCopyRarity(cardDef.rarity) ? 1 : CARDS_PER_COPY;
      for (let i = 0; i < copies; i++) {
        remainingPool.push(cardDef);
      }
    }

    // Fill remaining deck slots randomly, respecting legendaryLimit
    const shuffledPool = shuffle([...remainingPool]);
    let legendaryCount = deck.filter((c) => isSingleCopyRarity(c.rarity)).length;
    const { legendaryLimit } = config;

    for (let i = 0; i < shuffledPool.length && deck.length < deckSize; i++) {
      const cardDef = shuffledPool[i];
      if (legendaryLimit !== undefined && isSingleCopyRarity(cardDef.rarity)) {
        if (legendaryCount >= legendaryLimit) continue;
        legendaryCount++;
      }
      deck.push(createCardInstance(cardDef));
    }

    return shuffle(deck);
  }

  // Classic mode (no tier) — all cards, full deck
  const deck = [];
  for (const cardDef of allCards) {
    const copies = isSingleCopyRarity(cardDef.rarity) ? 1 : CARDS_PER_COPY;
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
