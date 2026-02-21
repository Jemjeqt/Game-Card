import { db } from './config';
import { ref, update, onValue } from 'firebase/database';
import { PLAYERS, STARTING_HP, MAX_HP } from '../data/constants';
import usePlayerStore from '../stores/usePlayerStore';
import useOpponentStore from '../stores/useOpponentStore';
import useGameStore from '../stores/useGameStore';
import useUIStore from '../stores/useUIStore';
import useMultiplayerStore from '../stores/useMultiplayerStore';

let _isApplyingRemoteUpdate = false;
let _listener = null;
let _turnStartCallback = null;

// Simple turn tracking: was it my turn on the LAST listener callback?
// null = haven't received any callback yet
let _wasMyTurn = null;

// Write counter: increments each time we sync to Firebase, used to
// detect "my own echo" vs "opponent wrote something"
let _writeCounter = 0;

export function isApplyingRemoteUpdate() {
  return _isApplyingRemoteUpdate;
}

export function setTurnStartCallback(callback) {
  _turnStartCallback = callback;
}

// ========== FIREBASE ARRAY SAFETY ==========

function ensureArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') {
    const keys = Object.keys(val).sort((a, b) => Number(a) - Number(b));
    return keys.map((k) => val[k]);
  }
  return [];
}

/**
 * Firebase may convert card effect arrays to objects.
 * Restore them back to arrays where needed.
 */
function fixCardEffects(card) {
  if (!card) return card;
  if (card.effect && typeof card.effect === 'object' && !Array.isArray(card.effect)) {
    // Check if it's an object with numeric keys (was an array)
    const keys = Object.keys(card.effect);
    if (keys.length > 0 && keys.every((k) => !isNaN(k))) {
      card.effect = ensureArray(card.effect);
    }
  }
  return card;
}

// ========== SERIALIZATION ==========

function cleanUndefined(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned = Array.isArray(obj) ? [...obj] : { ...obj };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    } else if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
      cleaned[key] = cleanUndefined(cleaned[key]);
    }
  });
  return cleaned;
}

function serializeState(state) {
  return cleanUndefined({
    hp: state.hp ?? STARTING_HP,
    maxHp: state.maxHp ?? MAX_HP,
    mana: state.mana ?? 0,
    maxMana: state.maxMana ?? 0,
    fatigueDamage: state.fatigueDamage ?? 0,
    hand: (state.hand || []).map((c) => cleanUndefined({ ...c })),
    deck: (state.deck || []).map((c) => cleanUndefined({ ...c })),
    board: (state.board || []).map((c) =>
      cleanUndefined({
        ...c,
        canAttack: c.canAttack || false,
        exhausted: c.exhausted || false,
        shield: c.shield || 0,
      })
    ),
    graveyard: (state.graveyard || []).map((c) => cleanUndefined({ ...c })),
  });
}

// ========== SYNC TO FIREBASE ==========

export async function syncMultiplayerState(incrementTurn = false) {
  const mp = useMultiplayerStore.getState();
  if (!mp.isMultiplayer || !mp.roomCode || !db) return;

  const myRole = mp.role;
  const theirRole = myRole === 'host' ? 'guest' : 'host';

  const playerState = usePlayerStore.getState();
  const opponentState = useOpponentStore.getState();
  const gameState = useGameStore.getState();
  const uiState = useUIStore.getState();

  const fbActivePlayer =
    gameState.activePlayer === PLAYERS.PLAYER ? myRole : theirRole;

  let fbWinner = null;
  if (gameState.winner === PLAYERS.PLAYER) fbWinner = myRole;
  else if (gameState.winner === PLAYERS.OPPONENT) fbWinner = theirRole;

  _writeCounter++;

  const updates = {};
  updates[`rooms/${mp.roomCode}/${myRole}`] = serializeState(playerState);
  updates[`rooms/${mp.roomCode}/${theirRole}`] = serializeState(opponentState);
  updates[`rooms/${mp.roomCode}/meta`] = {
    turn: gameState.turn,
    activePlayer: fbActivePlayer,
    phase: gameState.phase,
    gameStatus: gameState.gameStatus,
    winner: fbWinner,
    lastWriter: myRole,
    lastWriteTime: Date.now(),
  };

  const logEntries = ensureArray(uiState.battleLog).slice(-60).map((entry) => ({
    id: entry.id,
    text: entry.text,
    type: entry.type,
  }));
  updates[`rooms/${mp.roomCode}/log`] = logEntries;

  try {
    console.log(`[MP] Syncing state: activePlayer=${fbActivePlayer}, phase=${gameState.phase}, incrementTurn=${incrementTurn}`);
    await update(ref(db), updates);
    console.log('[MP] Sync complete');
  } catch (err) {
    console.error('[MP] Failed to sync:', err);
  }
}

// ========== LISTEN FROM FIREBASE ==========

export function startGameListener(roomCode, myRole) {
  if (!db) return;

  // Save callback before stopGameListener clears it
  const savedCallback = _turnStartCallback;
  stopGameListener();
  _turnStartCallback = savedCallback;

  // Reset tracking state
  _wasMyTurn = null;

  const roomRef = ref(db, `rooms/${roomCode}`);

  _listener = onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    if (!data || !data.meta) return;

    const theirRole = myRole === 'host' ? 'guest' : 'host';
    const isMyTurn = data.meta.activePlayer === myRole;
    const writerIsMe = data.meta.lastWriter === myRole;

    console.log(`[MP] Listener: activePlayer=${data.meta.activePlayer}, isMyTurn=${isMyTurn}, _wasMyTurn=${_wasMyTurn}, writerIsMe=${writerIsMe}, phase=${data.meta.phase}, gameStatus=${data.meta.gameStatus}`);

    // === GAME OVER CHECK — always apply if game is over ===
    const isGameOver = data.meta.gameStatus === 'player_win' || data.meta.gameStatus === 'opponent_win';
    if (isGameOver) {
      console.log('[MP] Game over detected from Firebase, applying final state');
      _isApplyingRemoteUpdate = true;
      try {
        if (data[theirRole]) loadStateIntoStore(useOpponentStore, data[theirRole]);
        if (data[myRole]) loadStateIntoStore(usePlayerStore, data[myRole]);

        let localWinner = null;
        if (data.meta.winner === myRole) localWinner = PLAYERS.PLAYER;
        else if (data.meta.winner) localWinner = PLAYERS.OPPONENT;

        useGameStore.setState({
          turn: data.meta.turn,
          phase: data.meta.phase,
          activePlayer: isMyTurn ? PLAYERS.PLAYER : PLAYERS.OPPONENT,
          gameStatus: data.meta.gameStatus,
          winner: localWinner,
          isProcessing: true,
        });

        const logData = ensureArray(data.log);
        if (logData.length > 0) {
          useUIStore.setState({ battleLog: logData });
        }
      } catch (err) {
        console.error('[MP] Error applying game over state:', err);
      } finally {
        _isApplyingRemoteUpdate = false;
      }
      _wasMyTurn = isMyTurn;
      return; // No need for turn start logic
    }

    // === DETERMINE WHAT TO DO ===

    // Case 1: My own write echoing back while it's still my turn → SKIP
    if (isMyTurn && writerIsMe && _wasMyTurn === true) {
      console.log('[MP] Skipping own echo');
      return;
    }

    // Case 2: Turn just switched to me (was NOT my turn, now IS)
    const turnSwitchedToMe = isMyTurn && _wasMyTurn === false;

    // Case 3: First callback ever (initial state load)
    const isFirstCallback = _wasMyTurn === null;

    // === APPLY REMOTE STATE ===
    // Apply when: opponent is playing (!isMyTurn), turn just switched to me, or first load for guest
    const shouldApplyState = !isMyTurn || turnSwitchedToMe || (isFirstCallback && !isMyTurn);

    if (shouldApplyState) {
      _isApplyingRemoteUpdate = true;
      try {
        if (data[theirRole]) {
          loadStateIntoStore(useOpponentStore, data[theirRole]);
        }
        if (data[myRole]) {
          loadStateIntoStore(usePlayerStore, data[myRole]);
        }

        const localActivePlayer = isMyTurn ? PLAYERS.PLAYER : PLAYERS.OPPONENT;
        let localWinner = null;
        if (data.meta.winner === myRole) localWinner = PLAYERS.PLAYER;
        else if (data.meta.winner) localWinner = PLAYERS.OPPONENT;

        useGameStore.setState({
          turn: data.meta.turn,
          phase: data.meta.phase,
          activePlayer: localActivePlayer,
          gameStatus: data.meta.gameStatus,
          winner: localWinner,
          isProcessing: !isMyTurn,
        });

        const logData = ensureArray(data.log);
        if (logData.length > 0) {
          useUIStore.setState({ battleLog: logData });
        }

        console.log(`[MP] Applied remote state. isMyTurn=${isMyTurn}`);
      } catch (err) {
        console.error('[MP] Error applying state:', err);
      } finally {
        _isApplyingRemoteUpdate = false;
      }
    }

    // Update tracking AFTER all logic
    _wasMyTurn = isMyTurn;

    // === TRIGGER TURN START ===
    if (turnSwitchedToMe && _turnStartCallback) {
      console.log('[MP] >>> Turn switched to me! Triggering executeStartTurn...');
      setTimeout(() => {
        _turnStartCallback().catch((err) =>
          console.error('[MP] Error starting turn:', err)
        );
      }, 300);
    }
  });
}

function loadStateIntoStore(store, data) {
  if (!data) return;
  store.setState({
    hp: data.hp ?? STARTING_HP,
    maxHp: data.maxHp ?? MAX_HP,
    mana: data.mana ?? 0,
    maxMana: data.maxMana ?? 0,
    fatigueDamage: data.fatigueDamage || 0,
    hand: ensureArray(data.hand).map(fixCardEffects),
    deck: ensureArray(data.deck).map(fixCardEffects),
    board: ensureArray(data.board).map(fixCardEffects),
    graveyard: ensureArray(data.graveyard).map(fixCardEffects),
  });
}

export function stopGameListener() {
  if (_listener) {
    _listener();
    _listener = null;
  }
  _wasMyTurn = null;
  _turnStartCallback = null;
}
