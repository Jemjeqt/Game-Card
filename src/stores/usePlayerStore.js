import { create } from 'zustand';
import { STARTING_HP, MAX_HP, STARTING_MANA, MAX_MANA, MAX_HAND_SIZE, MAX_BOARD_SIZE } from '../data/constants';
import { buildDeck, createCardInstance } from '../utils/deckBuilder';
import { SKELETON_TOKEN } from '../data/cards';

function createPlayerSlice(set, get) {
  return {
    hp: STARTING_HP,
    maxHp: MAX_HP,
    mana: 0,
    maxMana: 0,
    hand: [],
    deck: [],
    board: [],
    graveyard: [],
    fatigueDamage: 0,

    // Initialize a fresh deck
    initDeck: () => {
      const deck = buildDeck();
      set({ deck, hand: [], board: [], graveyard: [], hp: STARTING_HP, mana: 0, maxMana: 0, fatigueDamage: 0 });
    },

    // Initialize deck from pre-built cards (for draft mode)
    initDeckFromCards: (deckCards) => {
      set({ deck: deckCards, hand: [], board: [], graveyard: [], hp: STARTING_HP, mana: 0, maxMana: 0, fatigueDamage: 0 });
    },

    // Draw card from deck to hand
    drawCard: () => {
      const { deck, hand } = get();

      if (deck.length === 0) {
        // Fatigue damage
        const fatigueDamage = get().fatigueDamage + 1;
        const newHp = get().hp - fatigueDamage;
        set({ fatigueDamage, hp: Math.max(newHp, 0) });
        return { fatigue: true, fatigueDamage };
      }

      const newDeck = [...deck];
      const drawnCard = newDeck.pop();

      if (hand.length >= MAX_HAND_SIZE) {
        // Hand full — burn the card
        set({ deck: newDeck, graveyard: [...get().graveyard, drawnCard] });
        return { burned: true, card: drawnCard };
      }

      set({ deck: newDeck, hand: [...hand, drawnCard] });
      return { drawn: true, card: drawnCard };
    },

    // Draw multiple cards
    drawCards: (count) => {
      const results = [];
      for (let i = 0; i < count; i++) {
        results.push(get().drawCard());
      }
      return results;
    },

    // Play a card from hand (remove from hand)
    removeFromHand: (instanceId) => {
      set((state) => ({
        hand: state.hand.filter((c) => c.instanceId !== instanceId),
      }));
    },

    // Add minion to board
    addToBoard: (cardInstance) => {
      const { board } = get();
      if (board.length >= MAX_BOARD_SIZE) return false;
      set({ board: [...board, { ...cardInstance, canAttack: false, exhausted: false }] });
      return true;
    },

    // Remove minion from board (died)
    removeFromBoard: (instanceId) => {
      const { board, graveyard } = get();
      const minion = board.find((c) => c.instanceId === instanceId);
      if (!minion) return;
      set({
        board: board.filter((c) => c.instanceId !== instanceId),
        graveyard: [...graveyard, minion],
      });
    },

    // Move card to graveyard (spells)
    addToGraveyard: (cardInstance) => {
      set((state) => ({
        graveyard: [...state.graveyard, cardInstance],
      }));
    },

    // Spend mana
    spendMana: (cost) => {
      const { mana } = get();
      if (mana < cost) return false;
      set({ mana: mana - cost });
      return true;
    },

    // Add max mana crystal (+1 per turn, cap 10)
    addMaxMana: () => {
      const { maxMana } = get();
      if (maxMana < MAX_MANA) {
        set({ maxMana: maxMana + 1 });
      }
    },

    // Refresh mana to max at start of turn
    refreshMana: () => {
      set((state) => ({ mana: state.maxMana }));
    },

    // Take damage
    takeDamage: (amount) => {
      if (amount <= 0) return;
      set((state) => ({
        hp: Math.max(state.hp - amount, 0),
      }));
    },

    // Heal HP
    healHP: (amount) => {
      if (amount <= 0) return;
      set((state) => ({
        hp: Math.min(state.hp + amount, state.maxHp),
      }));
    },

    // Update a minion on the board
    updateMinion: (instanceId, updates) => {
      set((state) => ({
        board: state.board.map((m) =>
          m.instanceId === instanceId ? { ...m, ...updates } : m
        ),
      }));
    },

    // Refresh all minions (start of turn — remove exhausted, enable attack)
    refreshMinions: () => {
      set((state) => ({
        board: state.board.map((m) => ({
          ...m,
          canAttack: true,
          exhausted: false,
        })),
      }));
    },

    // Summon a skeleton token
    summonSkeleton: () => {
      const { board } = get();
      if (board.length >= MAX_BOARD_SIZE) return false;
      const skeleton = createCardInstance(SKELETON_TOKEN);
      set({ board: [...board, { ...skeleton, canAttack: false, exhausted: false }] });
      return true;
    },

    // Buff all friendly minions' attack
    buffAllMinionsAttack: (amount) => {
      set((state) => ({
        board: state.board.map((m) => ({
          ...m,
          currentAttack: m.currentAttack + amount,
        })),
      }));
    },

    // Buff all friendly minions' defense
    buffAllMinionsDefense: (amount) => {
      set((state) => ({
        board: state.board.map((m) => ({
          ...m,
          currentDefense: m.currentDefense + amount,
        })),
      }));
    },

    // Apply damage to a specific minion
    damageMinion: (instanceId, amount) => {
      const { board } = get();
      const minion = board.find((m) => m.instanceId === instanceId);
      if (!minion) return null;

      // Shield absorbs damage first
      let remaining = amount;
      let newShield = minion.shield;
      if (newShield > 0) {
        const absorbed = Math.min(newShield, remaining);
        newShield -= absorbed;
        remaining -= absorbed;
      }

      const newDefense = minion.currentDefense - remaining;

      if (newDefense <= 0) {
        // Minion dies
        get().removeFromBoard(instanceId);
        return { died: true, name: minion.name };
      }

      get().updateMinion(instanceId, {
        currentDefense: newDefense,
        shield: newShield,
      });
      return { died: false, name: minion.name, remainingDefense: newDefense };
    },

    // Get board attack total
    getTotalBoardAttack: () => {
      return get().board.reduce((sum, m) => sum + m.currentAttack, 0);
    },

    // Reset entire player state
    resetPlayer: () => {
      set({
        hp: STARTING_HP,
        maxHp: MAX_HP,
        mana: 0,
        maxMana: 0,
        hand: [],
        deck: [],
        board: [],
        graveyard: [],
        fatigueDamage: 0,
      });
    },
  };
}

const usePlayerStore = create((set, get) => createPlayerSlice(set, get));
export default usePlayerStore;
