import { PHASES, PLAYERS, PLAYER_STARTING_HAND, AI_STARTING_HAND, DELAYS } from '../data/constants';
import { TRIGGERS } from '../data/effects';
import useGameStore from '../stores/useGameStore';
import usePlayerStore from '../stores/usePlayerStore';
import useOpponentStore from '../stores/useOpponentStore';
import useUIStore from '../stores/useUIStore';
import useMultiplayerStore from '../stores/useMultiplayerStore';
import useQuestStore from '../stores/useQuestStore';
import useDraftStore from '../stores/useDraftStore';
import { resolveStartOfTurnEffects, resolveEndOfTurnEffects, resetCardsPlayedThisTurn } from './effectResolver';
import { checkGameOver } from './gameRules';
import { runAITurn } from '../ai/aiController';
import { createLogEntry } from '../utils/logger';
import { delay } from '../utils/delay';
import { LOG_TYPES } from '../data/constants';
import { emitAbilityTriggered } from '../vfx/vfxEvents';
import useRankedStore from '../stores/useRankedStore';
import { buildDraftDeck } from '../utils/deckBuilder';

// Multiplayer sync callback - set by multiplayerEngine
let _onMultiplayerSync = null;
export function setMultiplayerSyncCallback(fn) {
  _onMultiplayerSync = fn;
}
async function _syncIfMultiplayer(incrementTurn = false) {
  if (_onMultiplayerSync && useMultiplayerStore.getState().isMultiplayer) {
    await _onMultiplayerSync(incrementTurn);
  }
}

/**
 * Initialize a new game — setup decks and draw starting hands
 */
export async function initializeGame() {
  const gameStore = useGameStore.getState();
  const playerStore = usePlayerStore.getState();
  const opponentStore = useOpponentStore.getState();
  const uiStore = useUIStore.getState();
  const draftStore = useDraftStore.getState();
  const rankedStore = useRankedStore.getState();

  // Determine card pool tier for ranked mode
  const tierId = rankedStore.isRankedMode ? rankedStore.getTierInfo().tier.id : null;

  // Reset everything
  uiStore.resetUI();

  // Check if in draft mode — use drafted deck
  if (draftStore.isDraftMode && draftStore.draftComplete) {
    const draftedDeck = buildDraftDeck(draftStore.getDraftedDeck());
    playerStore.initDeckFromCards(draftedDeck, tierId);
  } else {
    playerStore.initDeck(tierId);
  }
  opponentStore.initDeck(tierId);

  // Track quest: games played
  useQuestStore.getState().checkDailyReset();
  useQuestStore.getState().trackEvent('games_played', 1);

  // Start the game
  gameStore.startGame();

  // Draw starting hands
  for (let i = 0; i < PLAYER_STARTING_HAND; i++) {
    playerStore.drawCard();
  }
  for (let i = 0; i < AI_STARTING_HAND; i++) {
    opponentStore.drawCard();
  }

  uiStore.addLogEntry(createLogEntry('⚔️ Battle begins!', LOG_TYPES.SYSTEM));
  uiStore.addLogEntry(createLogEntry('Draw your starting hand...', LOG_TYPES.SYSTEM));

  // Start player's first turn
  await executeStartTurn();
}

/**
 * Execute START_TURN phase
 */
export async function executeStartTurn() {
  const game = useGameStore.getState();
  const isPlayer = game.activePlayer === PLAYERS.PLAYER;
  const activeStore = isPlayer ? usePlayerStore : useOpponentStore;
  const enemyStore = isPlayer ? useOpponentStore : usePlayerStore;
  const ui = useUIStore.getState();

  useGameStore.getState().setProcessing(true);
  useGameStore.getState().setPhase(PHASES.START_TURN);

  // Show turn banner
  const turnText = isPlayer ? 'Your Turn' : 'Enemy Turn';
  ui.setTurnBanner(turnText);
  ui.addLogEntry(
    createLogEntry(
      `--- Turn ${game.turn}: ${isPlayer ? 'Your' : "Enemy's"} turn ---`,
      LOG_TYPES.SYSTEM
    )
  );

  await delay(DELAYS.TURN_BANNER);
  useUIStore.getState().clearTurnBanner();

  // Reset combo counter for new turn
  resetCardsPlayedThisTurn();

  // Add mana crystal
  activeStore.getState().addMaxMana();
  activeStore.getState().refreshMana();

  // Refresh minions (remove summoning sickness from existing minions)
  activeStore.getState().refreshMinions();

  // Resolve start-of-turn effects (e.g., Archmage Solara)
  const addLog = (text) =>
    useUIStore.getState().addLogEntry(createLogEntry(text, LOG_TYPES.EFFECT));

  const startResults = resolveStartOfTurnEffects({
    ownerStore: isPlayer ? usePlayerStore : useOpponentStore,
    enemyStore: isPlayer ? useOpponentStore : usePlayerStore,
    addLog,
  });

  // Emit VFX for start-of-turn effects
  for (const r of startResults) {
    if (r) { emitAbilityTriggered(r, null, isPlayer ? 'player' : 'opponent'); }
  }

  // Check game over after start-of-turn effects
  if (checkGameOver()) return;

  await delay(DELAYS.PHASE_TRANSITION);

  // Move to DRAW phase
  await executeDrawPhase();
}

/**
 * Execute DRAW phase
 */
export async function executeDrawPhase() {
  const game = useGameStore.getState();
  const isPlayer = game.activePlayer === PLAYERS.PLAYER;
  const activeStore = isPlayer ? usePlayerStore : useOpponentStore;
  const ui = useUIStore.getState();

  useGameStore.getState().setPhase(PHASES.DRAW);

  // Draw a card
  const result = activeStore.getState().drawCard();

  if (result.fatigue) {
    ui.addLogEntry(
      createLogEntry(
        `${isPlayer ? 'You' : 'Enemy'} takes ${result.fatigueDamage} fatigue damage!`,
        LOG_TYPES.DAMAGE
      )
    );
    if (checkGameOver()) return;
  } else if (result.burned) {
    ui.addLogEntry(
      createLogEntry(
        `${isPlayer ? 'Your' : "Enemy's"} hand is full! Card burned.`,
        LOG_TYPES.SYSTEM
      )
    );
  } else if (result.drawn) {
    ui.addLogEntry(
      createLogEntry(
        `${isPlayer ? 'You' : 'Enemy'} drew a card`,
        LOG_TYPES.DRAW
      )
    );
  }

  await delay(DELAYS.CARD_DRAW);

  // Move to MAIN phase
  useGameStore.getState().setPhase(PHASES.MAIN);
  useGameStore.getState().setProcessing(false);

  // If it's AI's turn, run the AI (but NOT in multiplayer)
  if (!isPlayer && !useMultiplayerStore.getState().isMultiplayer) {
    await runAITurn();
  }
}

/**
 * Player advances from MAIN to ATTACK phase
 */
export function advanceToAttackPhase() {
  useGameStore.getState().setPhase(PHASES.ATTACK);
  useUIStore.getState().clearSelection();
}

/**
 * Player ends their turn
 */
export async function endTurn() {
  useUIStore.getState().clearSelection();
  useGameStore.getState().setProcessing(true);
  useGameStore.getState().setPhase(PHASES.END_TURN);

  // Resolve end-of-turn effects (Void Cultist, etc.)
  const isPlayer = useGameStore.getState().activePlayer === PLAYERS.PLAYER;
  const addLogEnd = (text) =>
    useUIStore.getState().addLogEntry(createLogEntry(text, LOG_TYPES.EFFECT));
  const endResults = resolveEndOfTurnEffects({
    ownerStore: isPlayer ? usePlayerStore : useOpponentStore,
    enemyStore: isPlayer ? useOpponentStore : usePlayerStore,
    addLog: addLogEnd,
  });

  // Emit VFX for end-of-turn effects
  for (const r of endResults) {
    if (r) { emitAbilityTriggered(r, null, isPlayer ? 'player' : 'opponent'); break; }
  }

  if (checkGameOver()) return;

  await delay(DELAYS.PHASE_TRANSITION);

  // Switch turn locally
  useGameStore.getState().switchTurn();

  // In multiplayer: sync with incrementTurn=true to signal the other player
  if (useMultiplayerStore.getState().isMultiplayer) {
    console.log('[MP] endTurn: switchTurn done, syncing to Firebase...');
    await _syncIfMultiplayer(true);
    console.log('[MP] endTurn: sync complete, waiting for opponent');
    // Keep UI locked — opponent's client will handle their turn
    return;
  }

  // Single player: start next turn
  await executeStartTurn();
}
