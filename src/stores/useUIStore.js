import { create } from 'zustand';
import { LOG_TYPES } from '../data/constants';

const useUIStore = create((set, get) => ({
  // State
  selectedCardId: null,
  hoveredCardId: null,
  battleLog: [],
  isAnimating: false,
  showCardPreview: null,
  turnBanner: null, // 'Your Turn' / 'Enemy Turn'
  damageNumbers: [], // { id, amount, x, y, isHeal }
  targetingMode: false, // for targeted spells like Mystic Shield
  targetingCardId: null,

  // Actions
  selectCard: (instanceId) =>
    set({ selectedCardId: instanceId }),

  clearSelection: () =>
    set({ selectedCardId: null, targetingMode: false, targetingCardId: null }),

  setHoveredCard: (instanceId) =>
    set({ hoveredCardId: instanceId }),

  clearHoveredCard: () =>
    set({ hoveredCardId: null }),

  addLogEntry: (entry) =>
    set((state) => ({
      battleLog: [...state.battleLog, entry],
    })),

  clearLog: () =>
    set({ battleLog: [] }),

  setAnimating: (val) =>
    set({ isAnimating: val }),

  setShowCardPreview: (card) =>
    set({ showCardPreview: card }),

  setTurnBanner: (text) =>
    set({ turnBanner: text }),

  clearTurnBanner: () =>
    set({ turnBanner: null }),

  addDamageNumber: (dmgEntry) =>
    set((state) => ({
      damageNumbers: [...state.damageNumbers, dmgEntry],
    })),

  removeDamageNumber: (id) =>
    set((state) => ({
      damageNumbers: state.damageNumbers.filter((d) => d.id !== id),
    })),

  setTargetingMode: (cardId) =>
    set({ targetingMode: true, targetingCardId: cardId }),

  cancelTargeting: () =>
    set({ targetingMode: false, targetingCardId: null }),

  // Reset
  resetUI: () =>
    set({
      selectedCardId: null,
      hoveredCardId: null,
      battleLog: [],
      isAnimating: false,
      showCardPreview: null,
      turnBanner: null,
      damageNumbers: [],
      targetingMode: false,
      targetingCardId: null,
    }),
}));

export default useUIStore;
