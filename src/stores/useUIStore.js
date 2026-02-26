import { create } from 'zustand';
import { LOG_TYPES } from '../data/constants';

const MAX_LOG_ENTRIES = 100;

const useUIStore = create((set, get) => ({
  // State
  selectedCardId: null,
  hoveredCardId: null,
  battleLog: [],
  battleLogMinimized: true,
  isAnimating: false,
  showCardPreview: null,
  turnBanner: null, // 'Your Turn' / 'Enemy Turn'
  damageNumbers: [], // { id, amount, x, y, isHeal }
  targetingMode: false, // for targeted spells like Mystic Shield
  targetingCardId: null,
  pendingSpell: null, // spell card awaiting target selection

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
      battleLog: [...state.battleLog, entry].slice(-MAX_LOG_ENTRIES),
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

  setBattleLogMinimized: (val) => set({ battleLogMinimized: val }),

  cancelTargeting: () =>
    set({ targetingMode: false, targetingCardId: null, pendingSpell: null }),

  setPendingSpell: (card) =>
    set({ pendingSpell: card }),

  clearPendingSpell: () =>
    set({ pendingSpell: null }),

  // Reset
  resetUI: () =>
    set({
      selectedCardId: null,
      hoveredCardId: null,
      battleLog: [],
      battleLogMinimized: true,
      isAnimating: false,
      showCardPreview: null,
      turnBanner: null,
      damageNumbers: [],
      targetingMode: false,
      targetingCardId: null,
      pendingSpell: null,
    }),
}));

export default useUIStore;
