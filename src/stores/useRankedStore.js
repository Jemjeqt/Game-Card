import { create } from 'zustand';

// ===== RANKED MODE SYSTEM =====
// Tier system: Bronze → Silver → Gold → Platinum → Diamond → Mythic
// Win: +25 points, Loss: -15 points
// Each tier has 3 divisions (III, II, I) except Mythic

const TIERS = [
  { id: 'bronze', name: 'Bronze', icon: '🥉', minPoints: 0 },
  { id: 'silver', name: 'Silver', icon: '🥈', minPoints: 300 },
  { id: 'gold', name: 'Gold', icon: '🥇', minPoints: 600 },
  { id: 'platinum', name: 'Platinum', icon: '💎', minPoints: 900 },
  { id: 'diamond', name: 'Diamond', icon: '💠', minPoints: 1200 },
  { id: 'mythic', name: 'Mythic', icon: '🏆', minPoints: 1500 },
];

const DIVISIONS = ['III', 'II', 'I'];
const POINTS_PER_DIVISION = 100;
const WIN_POINTS = 25;
const LOSS_POINTS = 15;

function getStoredRankedData() {
  try {
    const data = localStorage.getItem('cardBattle_ranked');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Failed to load ranked data:', e);
  }
  return null;
}

function saveRankedData(state) {
  try {
    const data = {
      points: state.points,
      wins: state.wins,
      losses: state.losses,
      totalGames: state.totalGames,
      winStreak: state.winStreak,
      bestWinStreak: state.bestWinStreak,
      highestPoints: state.highestPoints,
      seasonGames: state.seasonGames,
    };
    localStorage.setItem('cardBattle_ranked', JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save ranked data:', e);
  }
}

function calculateTierInfo(points) {
  // Find current tier
  let currentTier = TIERS[0];
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].minPoints) {
      currentTier = TIERS[i];
      break;
    }
  }

  // Mythic has no divisions
  if (currentTier.id === 'mythic') {
    return {
      tier: currentTier,
      division: null,
      pointsInTier: points - currentTier.minPoints,
      pointsToNext: null,
      progress: 1,
    };
  }

  // Calculate division within tier
  const pointsInTier = points - currentTier.minPoints;
  const divisionIndex = Math.min(Math.floor(pointsInTier / POINTS_PER_DIVISION), 2);
  const division = DIVISIONS[divisionIndex];
  const pointsInDivision = pointsInTier - divisionIndex * POINTS_PER_DIVISION;
  const progress = pointsInDivision / POINTS_PER_DIVISION;

  // Points to next division/tier
  const nextTierIndex = TIERS.indexOf(currentTier) + 1;
  let pointsToNext;
  if (divisionIndex < 2) {
    pointsToNext = POINTS_PER_DIVISION - pointsInDivision;
  } else if (nextTierIndex < TIERS.length) {
    pointsToNext = TIERS[nextTierIndex].minPoints - points;
  } else {
    pointsToNext = null;
  }

  return { tier: currentTier, division, pointsInTier, pointsToNext, progress };
}

const storedData = getStoredRankedData();

const useRankedStore = create((set, get) => ({
  // Ranked state
  isRankedMode: false,
  points: storedData?.points ?? 0,
  wins: storedData?.wins ?? 0,
  losses: storedData?.losses ?? 0,
  totalGames: storedData?.totalGames ?? 0,
  winStreak: storedData?.winStreak ?? 0,
  bestWinStreak: storedData?.bestWinStreak ?? 0,
  highestPoints: storedData?.highestPoints ?? 0,
  seasonGames: storedData?.seasonGames ?? 0,

  // Last match result (for display)
  lastMatchResult: null, // { won, pointsChange, newPoints, rankUp, rankDown }

  // Computed — get tier info
  getTierInfo: () => calculateTierInfo(get().points),

  // Set ranked mode on/off
  setRankedMode: (val) => set({ isRankedMode: val }),

  // Record a match result
  recordMatch: (won) => {
    const state = get();
    const pointsChange = won ? WIN_POINTS : -LOSS_POINTS;
    const newPoints = Math.max(0, state.points + pointsChange);
    const newWins = won ? state.wins + 1 : state.wins;
    const newLosses = won ? state.losses : state.losses + 1;
    const newWinStreak = won ? state.winStreak + 1 : 0;
    const newBestWinStreak = Math.max(state.bestWinStreak, newWinStreak);
    const newHighestPoints = Math.max(state.highestPoints, newPoints);

    // Check for rank up/down
    const oldTier = calculateTierInfo(state.points);
    const newTier = calculateTierInfo(newPoints);
    const rankUp = newTier.tier.id !== oldTier.tier.id && newPoints > state.points;
    const rankDown = newTier.tier.id !== oldTier.tier.id && newPoints < state.points;

    const newState = {
      points: newPoints,
      wins: newWins,
      losses: newLosses,
      totalGames: state.totalGames + 1,
      winStreak: newWinStreak,
      bestWinStreak: newBestWinStreak,
      highestPoints: newHighestPoints,
      seasonGames: state.seasonGames + 1,
      lastMatchResult: {
        won,
        pointsChange,
        newPoints,
        rankUp,
        rankDown,
        oldTier: oldTier.tier,
        newTier: newTier.tier,
        winStreak: newWinStreak,
      },
    };

    set(newState);
    saveRankedData({ ...state, ...newState });
  },

  // Clear last match result
  clearLastMatch: () => set({ lastMatchResult: null }),

  // Reset ranked data
  resetRanked: () => {
    const freshState = {
      points: 0,
      wins: 0,
      losses: 0,
      totalGames: 0,
      winStreak: 0,
      bestWinStreak: 0,
      highestPoints: 0,
      seasonGames: 0,
      lastMatchResult: null,
    };
    set(freshState);
    saveRankedData(freshState);
  },
}));

export { TIERS, DIVISIONS, WIN_POINTS, LOSS_POINTS };
export default useRankedStore;
