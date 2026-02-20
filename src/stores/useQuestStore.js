import { create } from 'zustand';

// ===== DAILY QUEST SYSTEM =====
// 3 quests per day, reset at midnight
// Quests track progress via game events

const QUEST_POOL = [
  {
    id: 'win_2',
    title: 'Penakluk',
    description: 'Menangkan 2 pertandingan',
    icon: '🏆',
    target: 2,
    type: 'wins',
    reward: 50, // ranked points bonus
  },
  {
    id: 'win_3',
    title: 'Dominasi',
    description: 'Menangkan 3 pertandingan',
    icon: '👑',
    target: 3,
    type: 'wins',
    reward: 75,
  },
  {
    id: 'play_minions_10',
    title: 'Panglima',
    description: 'Mainkan 10 minion',
    icon: '⚔️',
    target: 10,
    type: 'minions_played',
    reward: 40,
  },
  {
    id: 'play_spells_5',
    title: 'Penyihir',
    description: 'Mainkan 5 spell',
    icon: '✨',
    target: 5,
    type: 'spells_cast',
    reward: 40,
  },
  {
    id: 'deal_damage_50',
    title: 'Penghancur',
    description: 'Berikan 50 damage ke hero musuh',
    icon: '💥',
    target: 50,
    type: 'damage_dealt',
    reward: 45,
  },
  {
    id: 'trigger_deathrattle_3',
    title: 'Necromancer',
    description: 'Trigger 3 Deathrattle',
    icon: '💀',
    target: 3,
    type: 'deathrattles',
    reward: 60,
  },
  {
    id: 'play_combo_3',
    title: 'Kombo Master',
    description: 'Aktifkan 3 Combo',
    icon: '🔥',
    target: 3,
    type: 'combos',
    reward: 55,
  },
  {
    id: 'play_legendary_2',
    title: 'Sang Legenda',
    description: 'Mainkan 2 kartu Legendary',
    icon: '🌟',
    target: 2,
    type: 'legendaries_played',
    reward: 50,
  },
  {
    id: 'kill_minions_8',
    title: 'Pembantai',
    description: 'Bunuh 8 minion musuh',
    icon: '☠️',
    target: 8,
    type: 'minions_killed',
    reward: 45,
  },
  {
    id: 'heal_20',
    title: 'Penyembuh',
    description: 'Sembuhkan 20 HP total',
    icon: '💚',
    target: 20,
    type: 'healing_done',
    reward: 40,
  },
  {
    id: 'play_games_3',
    title: 'Petempur',
    description: 'Mainkan 3 pertandingan',
    icon: '🎮',
    target: 3,
    type: 'games_played',
    reward: 35,
  },
  {
    id: 'draft_win_1',
    title: 'Draft Champion',
    description: 'Menangkan 1 Draft Mode',
    icon: '📜',
    target: 1,
    type: 'draft_wins',
    reward: 65,
  },
];

const QUESTS_PER_DAY = 3;

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getStoredQuestData() {
  try {
    const data = localStorage.getItem('cardBattle_quests');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Failed to load quest data:', e);
  }
  return null;
}

function saveQuestData(state) {
  try {
    const data = {
      quests: state.quests,
      lastResetDate: state.lastResetDate,
      totalQuestsCompleted: state.totalQuestsCompleted,
      totalRewardsEarned: state.totalRewardsEarned,
    };
    localStorage.setItem('cardBattle_quests', JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save quest data:', e);
  }
}

function pickRandomQuests(count) {
  const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q) => ({
    ...q,
    progress: 0,
    completed: false,
    claimed: false,
  }));
}

const storedData = getStoredQuestData();
const today = getTodayKey();

// Check if quests need reset (new day)
let initialQuests;
let initialResetDate;
if (!storedData || storedData.lastResetDate !== today) {
  initialQuests = pickRandomQuests(QUESTS_PER_DAY);
  initialResetDate = today;
} else {
  initialQuests = storedData.quests;
  initialResetDate = storedData.lastResetDate;
}

const useQuestStore = create((set, get) => ({
  quests: initialQuests,
  lastResetDate: initialResetDate,
  totalQuestsCompleted: storedData?.totalQuestsCompleted ?? 0,
  totalRewardsEarned: storedData?.totalRewardsEarned ?? 0,

  // Show notification for completed quest
  questNotification: null,

  // Check if quests need daily reset
  checkDailyReset: () => {
    const today = getTodayKey();
    if (get().lastResetDate !== today) {
      const newQuests = pickRandomQuests(QUESTS_PER_DAY);
      set({ quests: newQuests, lastResetDate: today });
      saveQuestData(get());
    }
  },

  // Track a quest event (called from game engine)
  trackEvent: (eventType, amount = 1) => {
    const { quests } = get();
    let updated = false;

    const newQuests = quests.map((q) => {
      if (q.type === eventType && !q.completed) {
        const newProgress = Math.min(q.progress + amount, q.target);
        const completed = newProgress >= q.target;
        if (newProgress !== q.progress) updated = true;
        return { ...q, progress: newProgress, completed };
      }
      return q;
    });

    if (updated) {
      set({ quests: newQuests });
      saveQuestData(get());

      // Check if any quest just completed
      const justCompleted = newQuests.find(
        (q, i) => q.completed && !quests[i].completed
      );
      if (justCompleted) {
        set({ questNotification: justCompleted });
        // Auto-clear after 3s
        setTimeout(() => {
          set((s) => s.questNotification?.id === justCompleted.id ? { questNotification: null } : {});
        }, 3000);
      }
    }
  },

  // Claim reward for completed quest
  claimReward: (questId) => {
    const { quests } = get();
    const quest = quests.find((q) => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return 0;

    const newQuests = quests.map((q) =>
      q.id === questId ? { ...q, claimed: true } : q
    );

    set({
      quests: newQuests,
      totalQuestsCompleted: get().totalQuestsCompleted + 1,
      totalRewardsEarned: get().totalRewardsEarned + quest.reward,
    });
    saveQuestData(get());

    return quest.reward;
  },

  // Get count of unclaimed completed quests
  getUnclaimedCount: () => {
    return get().quests.filter((q) => q.completed && !q.claimed).length;
  },

  clearQuestNotification: () => set({ questNotification: null }),

  // Force refresh quests (debug)
  forceRefresh: () => {
    const newQuests = pickRandomQuests(QUESTS_PER_DAY);
    set({ quests: newQuests, lastResetDate: getTodayKey() });
    saveQuestData(get());
  },
}));

export { QUEST_POOL };
export default useQuestStore;
