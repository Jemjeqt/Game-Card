import { create } from 'zustand';
import { getAllCards } from '../data/cards';
import { RARITY } from '../data/constants';

// ===== DRAFT MODE =====
// Pick 1 from 3 cards, 15 times → build a 15-card deck → battle AI

const DRAFT_PICKS = 15;
const CARDS_PER_CHOICE = 3;

function generateDraftChoices(allCards, pickedIds) {
  // Weight by rarity — legendaries appear less often
  const rarityWeights = {
    [RARITY.COMMON]: 4,
    [RARITY.RARE]: 3,
    [RARITY.EPIC]: 2,
    [RARITY.LEGENDARY]: 1,
  };

  // Create weighted pool
  const pool = [];
  for (const card of allCards) {
    const weight = rarityWeights[card.rarity] || 2;
    for (let i = 0; i < weight; i++) {
      pool.push(card);
    }
  }

  // Pick 3 unique cards
  const choices = [];
  const usedIds = new Set();
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  for (const card of shuffled) {
    if (choices.length >= CARDS_PER_CHOICE) break;
    if (usedIds.has(card.id)) continue;

    // Limit legendary picks: max 1 legendary in entire draft
    const legendaryCount = pickedIds.filter((id) => {
      const c = allCards.find((a) => a.id === id);
      return c && c.rarity === RARITY.LEGENDARY;
    }).length;

    if (card.rarity === RARITY.LEGENDARY && legendaryCount >= 1) continue;

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

const useDraftStore = create((set, get) => ({
  // Draft state
  isDraftMode: false,
  isDrafting: false,        // Currently in draft pick phase
  draftComplete: false,     // Draft is done, ready to battle

  currentPick: 0,           // 0 to DRAFT_PICKS - 1
  choices: [],              // Current 3 cards to choose from
  pickedCards: [],           // Card definitions that were picked
  pickedCardIds: [],         // Just the IDs for tracking

  // Start a new draft
  startDraft: () => {
    const allCards = getAllCards();
    const choices = generateDraftChoices(allCards, []);

    set({
      isDraftMode: true,
      isDrafting: true,
      draftComplete: false,
      currentPick: 0,
      choices,
      pickedCards: [],
      pickedCardIds: [],
    });
  },

  // Pick a card from the current choices
  pickCard: (cardId) => {
    const { choices, pickedCards, pickedCardIds, currentPick } = get();
    const card = choices.find((c) => c.id === cardId);
    if (!card) return;

    const newPickedCards = [...pickedCards, card];
    const newPickedIds = [...pickedCardIds, cardId];
    const nextPick = currentPick + 1;

    if (nextPick >= DRAFT_PICKS) {
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
      // Generate next set of choices
      const allCards = getAllCards();
      const newChoices = generateDraftChoices(allCards, newPickedIds);

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
      choices: [],
      pickedCards: [],
      pickedCardIds: [],
    });
  },
}));

export { DRAFT_PICKS, CARDS_PER_CHOICE };
export default useDraftStore;
