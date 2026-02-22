import { create } from 'zustand';
import { getAllCards } from '../data/cards';
import { RARITY, TIER_CONFIG } from '../data/constants';
import { shuffle } from '../utils/shuffle';

// ===== DRAFT MODE =====
// Pick 1 from 3 cards, N times → build a deck → battle AI
// Draft picks count matches tier deck size (default 15 for classic)

const DEFAULT_DRAFT_PICKS = 15;
const CARDS_PER_CHOICE = 3;

// Compute which pick indices will have a guaranteed rarity card in choices.
// Interleaves rarity types evenly so they don't all cluster at the start.
// Example: Gold (33 picks, leg:3 myth:1) → picks 8, 16, 24 (leg), 28 (myth)
// Example: Mythic (38 picks, leg:5 myth:3) → L, M, L, M, L, M, L, L spread evenly
function buildGuaranteedSlots(draftGuaranteed, draftPicks) {
  if (!draftGuaranteed) return [];

  const legCount = draftGuaranteed[RARITY.LEGENDARY] || 0;
  const mythCount = draftGuaranteed[RARITY.MYTHIC] || 0;
  const immCount = draftGuaranteed[RARITY.IMMORTAL] || 0;
  const total = legCount + mythCount + immCount;
  if (total === 0) return [];

  // Interleave: distribute each rarity proportionally, then sort by pick index
  const slots = [];
  const addSlots = (rarity, count) => {
    for (let i = 0; i < count; i++) {
      // Space each rarity evenly within its own range, offset by rarity fraction
      slots.push({ pick: Math.round(((i + 1) / (count + 1)) * draftPicks), rarity });
    }
  };

  addSlots(RARITY.LEGENDARY, legCount);
  addSlots(RARITY.MYTHIC, mythCount);
  addSlots(RARITY.IMMORTAL, immCount);

  // Sort by pick index so they interleave naturally
  slots.sort((a, b) => a.pick - b.pick);

  // Resolve any duplicate pick indices by shifting them apart by 1
  for (let i = 1; i < slots.length; i++) {
    if (slots[i].pick <= slots[i - 1].pick) {
      slots[i].pick = slots[i - 1].pick + 1;
    }
  }

  return slots;
}

// Generate 3 choices for the current pick
// guaranteedRarity: if set, one of the 3 choices is forced to be that rarity
function generateDraftChoices(cardPool, pickedIds, legendaryLimit = 2, guaranteedRarity = null) {
  // Weight by rarity — higher rarity appears less often
  const rarityWeights = {
    [RARITY.COMMON]: 4,
    [RARITY.RARE]: 3,
    [RARITY.EPIC]: 2,
    [RARITY.LEGENDARY]: 1,
    [RARITY.MYTHIC]: 1,
    [RARITY.IMMORTAL]: 1,
  };

  const isHighRarityFn = (r) => r === RARITY.LEGENDARY || r === RARITY.MYTHIC || r === RARITY.IMMORTAL;

  // Exclude cards already picked — no duplicates across draft
  const pickedIdSet = new Set(pickedIds);
  const availablePool = cardPool.filter((c) => !pickedIdSet.has(c.id));

  // Count high rarity already picked
  const highRarityPicked = pickedIds.filter((id) => {
    const c = cardPool.find((a) => a.id === id);
    return c && isHighRarityFn(c.rarity);
  }).length;

  // Create weighted pool from available cards only
  const pool = [];
  for (const card of availablePool) {
    const weight = rarityWeights[card.rarity] || 2;
    for (let i = 0; i < weight; i++) {
      pool.push(card);
    }
  }

  const choices = [];
  const usedIds = new Set();
  const shuffled = shuffle([...pool]);

  // Guaranteed slot: force one card of the required rarity first
  if (guaranteedRarity && highRarityPicked < legendaryLimit) {
    const guaranteedPool = shuffle(availablePool.filter((c) => c.rarity === guaranteedRarity));
    if (guaranteedPool.length > 0) {
      const forced = guaranteedPool[0];
      usedIds.add(forced.id);
      choices.push(forced);
    }
  }

  // Fill remaining slots from weighted shuffled pool
  for (const card of shuffled) {
    if (choices.length >= CARDS_PER_CHOICE) break;
    if (usedIds.has(card.id)) continue;

    // Block high rarity if limit already reached from picks
    if (isHighRarityFn(card.rarity) && highRarityPicked >= legendaryLimit) continue;

    usedIds.add(card.id);
    choices.push(card);
  }

  // Fallback: if not enough unique cards, fill without restrictions
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
  legendaryLimit: 2,        // Max high rarity (legendary/mythic/immortal) allowed — from tier config
  guaranteedSlots: [],      // [{ pick, rarity }] — picks where a guaranteed rarity is forced
  choices: [],              // Current 3 cards to choose from
  pickedCards: [],           // Card definitions that were picked
  pickedCardIds: [],         // Just the IDs for tracking
  draftPool: [],            // Filtered card pool for this draft

  // Start a new draft — optionally filtered by tier
  startDraft: (tierId = null) => {
    const cardPool = buildDraftPool(tierId);
    const tierConfig = tierId && TIER_CONFIG[tierId];
    const legendaryLimit = tierConfig?.legendaryLimit ?? 2;
    const draftPicks = tierConfig ? tierConfig.deckSize : DEFAULT_DRAFT_PICKS;

    // Build guaranteed slots — pick indices where a rarity is forced in choices
    const guaranteedSlots = buildGuaranteedSlots(tierConfig?.draftGuaranteed ?? null, draftPicks);

    // Pick 0: check if it has a guaranteed rarity
    const firstGuaranteed = guaranteedSlots.find((s) => s.pick === 0)?.rarity ?? null;
    const choices = generateDraftChoices(cardPool, [], legendaryLimit, firstGuaranteed);

    set({
      isDraftMode: true,
      isDrafting: true,
      draftComplete: false,
      currentPick: 0,
      draftPicks,
      legendaryLimit,
      guaranteedSlots,
      draftPool: cardPool,
      choices,
      pickedCards: [],
      pickedCardIds: [],
    });
  },

  // Pick a card from the current choices
  pickCard: (cardId) => {
    const { choices, pickedCards, pickedCardIds, currentPick, draftPicks, draftPool, legendaryLimit, guaranteedSlots } = get();
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
      // Check if next pick has a guaranteed rarity slot
      const nextGuaranteed = guaranteedSlots.find((s) => s.pick === nextPick)?.rarity ?? null;
      const newChoices = generateDraftChoices(draftPool, newPickedIds, legendaryLimit, nextGuaranteed);

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
      legendaryLimit: 2,
      guaranteedSlots: [],
      choices: [],
      pickedCards: [],
      pickedCardIds: [],
      draftPool: [],
    });
  },
}));

export { DEFAULT_DRAFT_PICKS, CARDS_PER_CHOICE };
export default useDraftStore;
