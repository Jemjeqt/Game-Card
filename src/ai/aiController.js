import { CARD_TYPES, LOG_TYPES, DELAYS, PHASES } from '../data/constants';
import { TRIGGERS } from '../data/effects';
import useGameStore from '../stores/useGameStore';
import useOpponentStore from '../stores/useOpponentStore';
import usePlayerStore from '../stores/usePlayerStore';
import useUIStore from '../stores/useUIStore';
import { resolveEffects, resolveEndOfTurnEffects, applyBuffDefenseToMinion, incrementCardsPlayed } from '../engine/effectResolver';
import { resolveAttack, getAttackableMinions } from '../engine/combatResolver';
import { checkGameOver } from '../engine/gameRules';
import { selectCardsToPlay } from './aiStrategy';
import { createLogEntry } from '../utils/logger';
import { delay } from '../utils/delay';
import { emitCardPlayed, emitAbilityTriggered } from '../vfx/vfxEvents';

/**
 * Run the AI's entire turn (MAIN + ATTACK phases)
 */
export async function runAITurn() {
  const gameStore = useGameStore;

  gameStore.getState().setProcessing(true);

  // Wait a moment for the player to see the turn change
  await delay(DELAYS.AI_THINK);

  // === MAIN PHASE ===
  await aiMainPhase();

  // Check game over after playing cards
  if (checkGameOver()) return;

  await delay(DELAYS.AI_THINK);

  // === ATTACK PHASE ===
  gameStore.getState().setPhase(PHASES.ATTACK);
  await delay(DELAYS.PHASE_TRANSITION);

  await aiAttackPhase();

  // Check game over after attacks
  if (checkGameOver()) return;

  await delay(DELAYS.AI_ACTION);

  // === END TURN ===
  gameStore.getState().setPhase(PHASES.END_TURN);
  await delay(DELAYS.PHASE_TRANSITION);

  // Resolve end-of-turn effects for AI minions (e.g., Void Cultist)
  const addLog = (text) =>
    useUIStore.getState().addLogEntry(createLogEntry(text, LOG_TYPES.EFFECT));
  resolveEndOfTurnEffects({
    ownerStore: useOpponentStore,
    enemyStore: usePlayerStore,
    addLog,
  });

  // Check game over after end-of-turn effects
  if (checkGameOver()) return;

  // Switch to player's turn
  gameStore.getState().switchTurn();

  // Import needed here to avoid circular dependency at module level
  const { executeStartTurn } = await import('../engine/turnEngine');
  await executeStartTurn();
}

/**
 * AI Main Phase — play cards from hand
 */
async function aiMainPhase() {
  const aiState = useOpponentStore.getState();
  const enemyState = usePlayerStore.getState();
  const addLog = (text) =>
    useUIStore.getState().addLogEntry(createLogEntry(text, LOG_TYPES.EFFECT));

  // Determine which cards to play
  const cardsToPlay = selectCardsToPlay(
    aiState.hand,
    aiState.mana,
    aiState,
    enemyState
  );

  for (const card of cardsToPlay) {
    // Re-check state (mana may have changed from effects)
    const currentState = useOpponentStore.getState();
    if (currentState.mana < card.manaCost) continue;

    // Spend mana
    useOpponentStore.getState().spendMana(card.manaCost);

    // Remove from hand
    useOpponentStore.getState().removeFromHand(card.instanceId);

    // Log the play
    useUIStore.getState().addLogEntry(
      createLogEntry(
        `Enemy played ${card.name} (${card.manaCost} mana)`,
        LOG_TYPES.PLAY
      )
    );

    // Emit VFX event (event bus → VFXLayer)
    emitCardPlayed(card, 'opponent');

    // Track combo for AI
    incrementCardsPlayed();

    if (card.type === CARD_TYPES.MINION) {
      // Place on board
      useOpponentStore.getState().addToBoard(card);

      // Resolve on-play effects
      const minionResults = resolveEffects({
        card,
        trigger: TRIGGERS.ON_PLAY,
        ownerStore: useOpponentStore,
        enemyStore: usePlayerStore,
        addLog,
      });

      // Emit VFX for minion abilities
      if (!card.rarity || card.rarity !== 'legendary') {
        for (const r of minionResults) {
          if (r && r.type !== 'needsTarget') { emitAbilityTriggered(r, card, 'opponent'); }
        }
      }
    } else {
      // Spell — resolve effects directly
      const results = resolveEffects({
        card,
        trigger: TRIGGERS.ON_PLAY,
        ownerStore: useOpponentStore,
        enemyStore: usePlayerStore,
        addLog,
      });

      // Handle targeted spells (buff defense) — AI picks best target
      for (const result of results) {
        if (result && result.type === 'needsTarget' && result.effectType === 'buff_defense') {
          const board = useOpponentStore.getState().board;
          if (board.length > 0) {
            // AI picks the minion with highest attack to buff
            const bestTarget = [...board].sort(
              (a, b) => b.currentAttack - a.currentAttack
            )[0];
            applyBuffDefenseToMinion(
              useOpponentStore,
              bestTarget.instanceId,
              result.value,
              addLog
            );
          }
        }
      }

      // Emit VFX for spell results
      for (const r of results) {
        if (r && r.type !== 'needsTarget') { emitAbilityTriggered(r, card, 'opponent'); }
      }

      // Move spell to graveyard
      useOpponentStore.getState().addToGraveyard(card);
    }

    // Check game over after each card
    if (checkGameOver()) return;

    // Visual delay between plays
    await delay(DELAYS.AI_ACTION);
  }
}

/**
 * AI Attack Phase — attack with all eligible minions
 */
async function aiAttackPhase() {
  const board = useOpponentStore.getState().board;
  const attackers = getAttackableMinions(board);
  const addLog = (text) =>
    useUIStore.getState().addLogEntry(createLogEntry(text, LOG_TYPES.ATTACK));

  for (const minion of attackers) {
    // Re-check the minion still exists (may have been destroyed by effects)
    const currentBoard = useOpponentStore.getState().board;
    const currentMinion = currentBoard.find(
      (m) => m.instanceId === minion.instanceId
    );
    if (!currentMinion || currentMinion.exhausted) continue;

    const result = resolveAttack({
      minion: currentMinion,
      ownerStore: useOpponentStore,
      enemyStore: usePlayerStore,
      addLog,
    });

    if (result.success) {
      // Check game over after each attack
      if (checkGameOver()) return;
    }

    // Visual delay between attacks
    await delay(DELAYS.ATTACK);
  }
}
