import { initializeGame, executeStartTurn, setMultiplayerSyncCallback } from './turnEngine';
import {
  syncMultiplayerState,
  startGameListener,
  setTurnStartCallback,
  stopGameListener,
  isApplyingRemoteUpdate,
} from '../firebase/gameSync';
import { deleteRoom } from '../firebase/roomService';
import useMultiplayerStore from '../stores/useMultiplayerStore';
import usePlayerStore from '../stores/usePlayerStore';
import useOpponentStore from '../stores/useOpponentStore';
import useGameStore from '../stores/useGameStore';
import { PLAYERS } from '../data/constants';

let _unsubPlayerSync = null;
let _unsubOpponentSync = null;
let _unsubGameSync = null;

/**
 * Initialize a multiplayer game.
 * Host generates both decks, syncs to Firebase.
 * Guest waits for Firebase to deliver the initial state.
 */
export async function initializeMultiplayerGame() {
  const { role, roomCode } = useMultiplayerStore.getState();

  // Set the sync callback so endTurn() can sync to Firebase
  setMultiplayerSyncCallback((incrementTurn) => syncMultiplayerState(incrementTurn));

  // When turn switches to me, process START_TURN then sync
  setTurnStartCallback(async () => {
    await executeStartTurn();
    await syncMultiplayerState(false);
  });

  if (role === 'host') {
    // Host: initialize game first, then sync, then listen
    await initializeGame();
    await syncMultiplayerState(false);
    startAutoSync();
    startGameListener(roomCode, role);
  } else {
    // Guest: listen first (will load state from Firebase)
    startAutoSync();
    startGameListener(roomCode, role);
  }
}

/**
 * Auto-sync store changes to Firebase with debounce.
 * Only syncs when it's the local player's turn and the change is local.
 */
function startAutoSync() {
  let syncTimer = null;

  const scheduleSync = () => {
    // Don't sync if the change came from Firebase
    if (isApplyingRemoteUpdate()) return;

    const mp = useMultiplayerStore.getState();
    if (!mp.isMultiplayer) return;

    const game = useGameStore.getState();
    // Only sync when it's MY turn and not processing (endTurn / start-of-turn)
    if (game.activePlayer !== PLAYERS.PLAYER) return;
    if (game.isProcessing) return;

    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      // RE-CHECK all conditions at fire time — game state may have changed
      // during the 250ms debounce window (e.g., endTurn switched activePlayer)
      if (isApplyingRemoteUpdate()) return;
      const g = useGameStore.getState();
      if (g.activePlayer !== PLAYERS.PLAYER) return;
      if (g.isProcessing) return;
      syncMultiplayerState().catch(console.error);
    }, 250);
  };

  _unsubPlayerSync = usePlayerStore.subscribe(scheduleSync);
  _unsubOpponentSync = useOpponentStore.subscribe(scheduleSync);
  _unsubGameSync = useGameStore.subscribe(scheduleSync);
}

/**
 * Stop auto-sync subscriptions
 */
function stopAutoSync() {
  if (_unsubPlayerSync) {
    _unsubPlayerSync();
    _unsubPlayerSync = null;
  }
  if (_unsubOpponentSync) {
    _unsubOpponentSync();
    _unsubOpponentSync = null;
  }
  if (_unsubGameSync) {
    _unsubGameSync();
    _unsubGameSync = null;
  }
}

/**
 * Clean up all multiplayer resources
 */
export async function cleanupMultiplayer() {
  const { roomCode, role } = useMultiplayerStore.getState();

  stopAutoSync();
  stopGameListener();

  // Host deletes the room
  if (roomCode && role === 'host') {
    await deleteRoom(roomCode);
  }

  useMultiplayerStore.getState().reset();
}
