import React from 'react';
import Card from '../Card/Card';
import usePlayerStore from '../../stores/usePlayerStore';
import useOpponentStore from '../../stores/useOpponentStore';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';
import { PHASES, PLAYERS, CARD_TYPES, LOG_TYPES } from '../../data/constants';
import { EFFECT_TYPES, TRIGGERS, TARGETS } from '../../data/effects';
import { resolveEffects, applyBuffDefenseToMinion } from '../../engine/effectResolver';
import { checkGameOver } from '../../engine/gameRules';
import { createLogEntry } from '../../utils/logger';
import useMultiplayerStore from '../../stores/useMultiplayerStore';
import { syncMultiplayerState } from '../../firebase/gameSync';

export default function PlayerHand() {
  const hand = usePlayerStore((s) => s.hand);
  const mana = usePlayerStore((s) => s.mana);
  const board = usePlayerStore((s) => s.board);
  const phase = useGameStore((s) => s.phase);
  const activePlayer = useGameStore((s) => s.activePlayer);
  const isProcessing = useGameStore((s) => s.isProcessing);
  const selectedCardId = useUIStore((s) => s.selectedCardId);
  const targetingMode = useUIStore((s) => s.targetingMode);

  const isPlayerMainPhase =
    activePlayer === PLAYERS.PLAYER &&
    phase === PHASES.MAIN &&
    !isProcessing;

  const handleCardClick = (card) => {
    if (!isPlayerMainPhase) return;
    if (targetingMode) return;

    // Check if card is playable
    if (card.manaCost > mana) return;
    if (card.type === CARD_TYPES.MINION && board.length >= 5) return;

    if (selectedCardId === card.instanceId) {
      // Clicking selected card again = play it
      playCard(card);
    } else {
      // Select the card
      useUIStore.getState().selectCard(card.instanceId);
    }
  };

  const playCard = (card) => {
    const addLog = (text) =>
      useUIStore.getState().addLogEntry(createLogEntry(text, LOG_TYPES.EFFECT));

    // Spend mana
    if (!usePlayerStore.getState().spendMana(card.manaCost)) return;

    // Remove from hand
    usePlayerStore.getState().removeFromHand(card.instanceId);

    // Log
    useUIStore.getState().addLogEntry(
      createLogEntry(
        `You played ${card.name} (${card.manaCost} mana)`,
        LOG_TYPES.PLAY
      )
    );

    if (card.type === CARD_TYPES.MINION) {
      // Place on board
      usePlayerStore.getState().addToBoard(card);

      // Resolve on-play effects
      const results = resolveEffects({
        card,
        trigger: TRIGGERS.ON_PLAY,
        ownerStore: usePlayerStore,
        enemyStore: useOpponentStore,
        addLog,
      });

      // Handle targeted effects — for now, auto-select best target for simplicity
      // (can be enhanced later with targeting UI)
      for (const result of results) {
        if (result && result.type === 'needsTarget') {
          // For Mystic Shield on player's minion
          handleTargetedEffect(result, card);
        }
      }
    } else {
      // Spell — check if it needs targeting
      const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
      const needsTarget = effects.some(
        (e) => e && e.target === TARGETS.FRIENDLY_MINION
      );

      if (needsTarget && board.length > 0) {
        // Enter targeting mode
        useUIStore.getState().setTargetingMode(card.instanceId);
        // Store the card data for later resolution
        window.__pendingSpell = card;
        useUIStore.getState().clearSelection();
        return; // Don't resolve yet
      }

      // No targeting needed — resolve effects
      const results = resolveEffects({
        card,
        trigger: TRIGGERS.ON_PLAY,
        ownerStore: usePlayerStore,
        enemyStore: useOpponentStore,
        addLog,
      });

      // Move to graveyard
      usePlayerStore.getState().addToGraveyard(card);
    }

    useUIStore.getState().clearSelection();
    const isOver = checkGameOver();
    // In multiplayer, sync after playing a card (especially if game over from spell)
    if (isOver && useMultiplayerStore.getState().isMultiplayer) {
      syncMultiplayerState(false).catch(console.error);
    }
  };

  const handleTargetedEffect = (result, card) => {
    // Auto-select the strongest friendly minion for buff
    const playerBoard = usePlayerStore.getState().board;
    if (playerBoard.length > 0) {
      const bestTarget = [...playerBoard].sort(
        (a, b) => b.currentAttack - a.currentAttack
      )[0];
      const addLog = (text) =>
        useUIStore.getState().addLogEntry(createLogEntry(text, LOG_TYPES.EFFECT));
      applyBuffDefenseToMinion(
        usePlayerStore,
        bestTarget.instanceId,
        result.value,
        addLog
      );
    }
  };

  const handleRightClick = (card) => {
    useUIStore.getState().setShowCardPreview(card);
  };

  return (
    <div className="hand">
      <div className="hand__cards">
        {hand.map((card) => {
          const isPlayable =
            isPlayerMainPhase &&
            card.manaCost <= mana &&
            (card.type !== CARD_TYPES.MINION || board.length < 5);

          return (
            <div key={card.instanceId} className="hand__card-wrapper">
              <Card
                card={card}
                size="hand"
                isPlayable={isPlayable}
                isSelected={selectedCardId === card.instanceId}
                onClick={handleCardClick}
                onRightClick={handleRightClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

