import { create } from 'zustand';

const useMultiplayerStore = create((set) => ({
  isMultiplayer: false,
  role: null, // 'host' | 'guest'
  roomCode: null,
  uid: null,
  opponentConnected: false,
  error: null,
  isLoading: false,

  setMultiplayer: (data) => set(data),

  setError: (error) => set({ error, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({
      isMultiplayer: false,
      role: null,
      roomCode: null,
      uid: null,
      opponentConnected: false,
      error: null,
      isLoading: false,
    }),
}));

export default useMultiplayerStore;
