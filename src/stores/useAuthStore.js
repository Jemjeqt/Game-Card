import { create } from 'zustand';
import {
  registerUser,
  loginUser,
  logoutUser,
  onAuthChange,
  getAuthErrorMessage,
} from '../firebase/authService';
import { getUserProfile, updateUserProfile } from '../firebase/userService';

// Lazy import to avoid circular deps — resolved at call time
function syncRankedFromProfile(profile) {
  if (!profile) return;
  // Dynamically import to avoid circular import issues at module load time
  import('./useRankedStore').then(({ default: useRankedStore }) => {
    const rankedSync = {
      points: profile.rankedPoints ?? 0,
      wins: profile.totalWins ?? 0,
      losses: profile.totalLosses ?? 0,
      totalGames: profile.totalGames ?? 0,
      winStreak: profile.winStreak ?? 0,
      bestWinStreak: profile.bestWinStreak ?? 0,
      highestPoints: profile.highestRankedPoints ?? profile.rankedPoints ?? 0,
      seasonGames: profile.totalGames ?? 0,
    };
    useRankedStore.setState(rankedSync);
    try { localStorage.setItem('cardBattle_ranked', JSON.stringify(rankedSync)); } catch (_) {}
  }).catch(() => {});
}

// ===== AUTH STORE =====
// Manages authentication state across the app

const useAuthStore = create((set, get) => ({
  // State
  user: null,           // Firebase Auth user object
  profile: null,        // Firestore user profile
  isLoading: true,      // Initial auth check loading
  isAuthenticating: false, // Login/register in progress
  error: null,

  // Initialize auth listener (call once on app mount)
  initAuth: () => {
    set({ isLoading: true });
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Don't hang — if Firestore fails, still let user in
        let profile = null;
        try {
          profile = await getUserProfile(firebaseUser.uid);
          // Sync email to Firestore if missing (legacy accounts)
          if (profile && !profile.email && firebaseUser.email) {
            await updateUserProfile(firebaseUser.uid, { email: firebaseUser.email }).catch(() => {});
            profile.email = firebaseUser.email;
          }
        } catch (err) {
          console.warn('Profile load failed (Firestore mungkin belum dibuat):', err.message);
        }
        syncRankedFromProfile(profile);
        set({ user: firebaseUser, profile, isLoading: false, error: null });
      } else {
        set({ user: null, profile: null, isLoading: false });
      }
    });
    return unsub;
  },

  // Register — email is optional (nickname-only registration supported)
  register: async (email, password, username) => {
    set({ isAuthenticating: true, error: null });
    try {
      const user = await registerUser(email || '', password, username);
      // Profile fetch may fail if Firestore isn't ready — that's OK
      let profile = null;
      try {
        profile = await getUserProfile(user.uid);
      } catch (profileErr) {
        console.warn('Profile fetch failed (Firestore may not be ready):', profileErr);
      }
      set({ user, profile, isAuthenticating: false, error: null });
      return true;
    } catch (err) {
      console.error('Register error:', err.code, err.message);
      const message = getAuthErrorMessage(err.code || err.message);
      set({ isAuthenticating: false, error: message });
      return false;
    }
  },

  // Login — accepts nickname or email
  login: async (identifier, password) => {
    set({ isAuthenticating: true, error: null });
    try {
      const user = await loginUser(identifier, password);
      console.log('Login success:', user.uid);
      const profile = await getUserProfile(user.uid);
      syncRankedFromProfile(profile);
      set({ user, profile, isAuthenticating: false, error: null });
      return true;
    } catch (err) {
      const message = getAuthErrorMessage(err.code);
      set({ isAuthenticating: false, error: message });
      return false;
    }
  },

  // Logout
  logout: async () => {
    try {
      await logoutUser();
      set({ user: null, profile: null, error: null });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  },

  // Refresh profile from Firestore
  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const profile = await getUserProfile(user.uid);
      set({ profile });
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Check if user is logged in
  isLoggedIn: () => !!get().user,
}));

export default useAuthStore;
