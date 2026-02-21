import React from 'react';
import Card from '../Card/Card';
import usePlayerStore from '../../stores/usePlayerStore';
import useOpponentStore from '../../stores/useOpponentStore';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';
import useQuestStore from '../../stores/useQuestStore';
import { PHASES, PLAYERS, CARD_TYPES, LOG_TYPES, MAX_BOARD_SIZE, RARITY } from '../../data/constants';
import { EFFECT_TYPES, TRIGGERS, TARGETS } from '../../data/effects';
import { resolveEffects, applyBuffDefenseToMinion, incrementCardsPlayed } from '../../engine/effectResolver';
import { checkGameOver } from '../../engine/gameRules';
import { createLogEntry } from '../../utils/logger';
import useMultiplayerStore from '../../stores/useMultiplayerStore';
import { syncMultiplayerState } from '../../firebase/gameSync';
import { emitCardPlayed, emitAbilityTriggered } from '../../vfx/vfxEvents';

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
    if (card.type === CARD_TYPES.MINION && board.length >= MAX_BOARD_SIZE) return;

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

    if (card.type !== CARD_TYPES.MINION) {
      // Spell — check if it needs targeting BEFORE spending mana
      const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
      const needsTarget = effects.some(
        (e) => e && e.target === TARGETS.FRIENDLY_MINION
      );

      if (needsTarget && board.length > 0) {
        // Enter targeting mode WITHOUT spending mana or removing card
        useUIStore.getState().setTargetingMode(card.instanceId);
        useUIStore.getState().setPendingSpell(card);
        useUIStore.getState().clearSelection();
        return; // Wait for target selection (PlayerField will finalize)
      }
    }

    // Spend mana
    if (!usePlayerStore.getState().spendMana(card.manaCost)) return;

    // Remove from hand
    usePlayerStore.getState().removeFromHand(card.instanceId);

    // Track for combo
    incrementCardsPlayed();

    // Track quest events
    if (card.type === CARD_TYPES.MINION) {
      useQuestStore.getState().trackEvent('minions_played', 1);
    } else {
      useQuestStore.getState().trackEvent('spells_cast', 1);
    }
    if (card.rarity === RARITY.LEGENDARY) {
      useQuestStore.getState().trackEvent('legendaries_played', 1);
    }

    // Log
    useUIStore.getState().addLogEntry(
      createLogEntry(
        `You played ${card.name} (${card.manaCost} mana)`,
        LOG_TYPES.PLAY
      )
    );

    // Emit VFX event (event bus → VFXLayer, no state mutation)
    emitCardPlayed(card, 'player');

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

      // Emit VFX for all meaningful effect results
      for (const r of results) {
        if (r && r.type !== 'needsTarget') {
          if (card.rarity !== 'legendary') {
            emitAbilityTriggered(r, card, 'player');
          }
        }
      }

      // Handle targeted effects — auto-select best target for simplicity
      for (const result of results) {
        if (result && result.type === 'needsTarget') {
          handleTargetedEffect(result, card);
        }
      }
    } else {
      // Non-targeted spell — resolve effects directly
      const results = resolveEffects({
        card,
        trigger: TRIGGERS.ON_PLAY,
        ownerStore: usePlayerStore,
        enemyStore: useOpponentStore,
        addLog,
      });

      // Emit VFX for all spell effect results
      if (card.rarity !== 'legendary') {
        for (const r of results) {
          if (r) { emitAbilityTriggered(r, card, 'player'); }
        }
      }

      // Move to graveyard
      usePlayerStore.getState().addToGraveyard(card);
    }

    useUIStore.getState().clearSelection();
    const isOver = checkGameOver();
    // In multiplayer, sync after playing a card
    if (useMultiplayerStore.getState().isMultiplayer) {
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
            (card.type !== CARD_TYPES.MINION || board.length < MAX_BOARD_SIZE);

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

