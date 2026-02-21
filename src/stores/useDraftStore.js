import { create } from 'zustand';
import { getAllCards } from '../data/cards';
import { RARITY, TIER_CONFIG } from '../data/constants';
import { shuffle } from '../utils/shuffle';

// ===== DRAFT MODE =====
// Pick 1 from 3 cards, N times → build a deck → battle AI
// Draft picks count matches tier deck size (default 15 for classic)

const DEFAULT_DRAFT_PICKS = 15;
const CARDS_PER_CHOICE = 3;

function generateDraftChoices(cardPool, pickedIds) {
  // Weight by rarity — higher rarity appears less often
  const rarityWeights = {
    [RARITY.COMMON]: 4,
    [RARITY.RARE]: 3,
    [RARITY.EPIC]: 2,
    [RARITY.LEGENDARY]: 1,
    [RARITY.MYTHIC]: 1,
    [RARITY.IMMORTAL]: 1,
  };

  // Create weighted pool
  const pool = [];
  for (const card of cardPool) {
    const weight = rarityWeights[card.rarity] || 2;
    for (let i = 0; i < weight; i++) {
      pool.push(card);
    }
  }

  // Pick 3 unique cards
  const choices = [];
  const usedIds = new Set();
  const shuffled = shuffle([...pool]);

  for (const card of shuffled) {
    if (choices.length >= CARDS_PER_CHOICE) break;
    if (usedIds.has(card.id)) continue;

    // Limit legendary/mythic/immortal: max 2 total in entire draft
    const highRarityCount = pickedIds.filter((id) => {
      const c = cardPool.find((a) => a.id === id);
      return c && (c.rarity === RARITY.LEGENDARY || c.rarity === RARITY.MYTHIC || c.rarity === RARITY.IMMORTAL);
    }).length;

    if ((card.rarity === RARITY.LEGENDARY || card.rarity === RARITY.MYTHIC || card.rarity === RARITY.IMMORTAL) && highRarityCount >= 2) continue;

    usedIds.add(card.id);
    choices.push(card);
  }

  // Fallback: if not enough unique cards, pick from remaining
  if (choices.length < CARDS_PER_CHOICE) {
    for (const card of shuffled) {
      if (choices.length >= CARDS_PER_CHOICE) break;
      if (!usedIds.has(card.id)) {
        usedIds.add(card.id);
        choices.push(card);
      }
    }
  }

  return choices;
}

// Build the card pool for draft based on tier config
function buildDraftPool(tierId) {
  let allCards = getAllCards();

  if (tierId && TIER_CONFIG[tierId]) {
    const config = TIER_CONFIG[tierId];
    allCards = allCards.filter((c) =>
      config.rarities.includes(c.rarity) &&
      c.manaCost >= config.manaRange[0] &&
      c.manaCost <= config.manaRange[1]
    );
  }

  return allCards;
}

const useDraftStore = create((set, get) => ({
  // Draft state
  isDraftMode: false,
  isDrafting: false,        // Currently in draft pick phase
  draftComplete: false,     // Draft is done, ready to battle

  currentPick: 0,           // 0 to draftPicks - 1
  draftPicks: DEFAULT_DRAFT_PICKS, // Total picks for this draft (tier-based)
  choices: [],              // Current 3 cards to choose from
  pickedCards: [],           // Card definitions that were picked
  pickedCardIds: [],         // Just the IDs for tracking
  draftPool: [],            // Filtered card pool for this draft

  // Start a new draft — optionally filtered by tier
  startDraft: (tierId = null) => {
    const cardPool = buildDraftPool(tierId);
    const choices = generateDraftChoices(cardPool, []);

    // Use tier's deck size as draft picks count, or default
    const draftPicks = (tierId && TIER_CONFIG[tierId])
      ? TIER_CONFIG[tierId].deckSize
      : DEFAULT_DRAFT_PICKS;

    set({
      isDraftMode: true,
      isDrafting: true,
      draftComplete: false,
      currentPick: 0,
      draftPicks,
      draftPool: cardPool,
      choices,
      pickedCards: [],
      pickedCardIds: [],
    });
  },

  // Pick a card from the current choices
  pickCard: (cardId) => {
    const { choices, pickedCards, pickedCardIds, currentPick, draftPicks, draftPool } = get();
    const card = choices.find((c) => c.id === cardId);
    if (!card) return;

    const newPickedCards = [...pickedCards, card];
    const newPickedIds = [...pickedCardIds, cardId];
    const nextPick = currentPick + 1;

    if (nextPick >= draftPicks) {
      // Draft is complete
      set({
        pickedCards: newPickedCards,
        pickedCardIds: newPickedIds,
        currentPick: nextPick,
        choices: [],
        isDrafting: false,
        draftComplete: true,
      });
    } else {
      // Generate next set of choices from filtered pool
      const newChoices = generateDraftChoices(draftPool, newPickedIds);

      set({
        pickedCards: newPickedCards,
        pickedCardIds: newPickedIds,
        currentPick: nextPick,
        choices: newChoices,
      });
    }
  },

  // Get the drafted deck (as card definitions for building)
  getDraftedDeck: () => {
    return get().pickedCards;
  },

  // Reset draft
  resetDraft: () => {
    set({
      isDraftMode: false,
      isDrafting: false,
      draftComplete: false,
      currentPick: 0,
      draftPicks: DEFAULT_DRAFT_PICKS,
      choices: [],
      pickedCards: [],
      pickedCardIds: [],
      draftPool: [],
    });
  },
}));

export { DEFAULT_DRAFT_PICKS, CARDS_PER_CHOICE };
export default useDraftStore;
