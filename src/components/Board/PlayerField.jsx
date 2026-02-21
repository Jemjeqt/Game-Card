import React, { useRef, useEffect, useState } from 'react';
import Card from '../Card/Card';
import usePlayerStore from '../../stores/usePlayerStore';
import useOpponentStore from '../../stores/useOpponentStore';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';
import { PHASES, PLAYERS, LOG_TYPES } from '../../data/constants';
import { TARGETS } from '../../data/effects';
import { resolveAttack } from '../../engine/combatResolver';
import { checkGameOver } from '../../engine/gameRules';
import { applyBuffDefenseToMinion } from '../../engine/effectResolver';
import { createLogEntry } from '../../utils/logger';
import useMultiplayerStore from '../../stores/useMultiplayerStore';
import { syncMultiplayerState } from '../../firebase/gameSync';

export default function PlayerField() {
  const board = usePlayerStore((s) => s.board);
  const phase = useGameStore((s) => s.phase);
  const activePlayer = useGameStore((s) => s.activePlayer);
  const isProcessing = useGameStore((s) => s.isProcessing);
  const targetingMode = useUIStore((s) => s.targetingMode);

  const isPlayerTurn = activePlayer === PLAYERS.PLAYER && !isProcessing;
  const isAttackPhase = phase === PHASES.ATTACK && isPlayerTurn;

  const handleMinionClick = (minion) => {
    // If in targeting mode (e.g., Mystic Shield), apply buff to clicked minion
    if (targetingMode && isPlayerTurn) {
      handleTargetSelection(minion);
      return;
    }

    // Attack phase — attack with this minion
    if (!isAttackPhase) return;
    if (minion.exhausted || !minion.canAttack) return;

    const addLog = (text) =>
      useUIStore.getState().addLogEntry(createLogEntry(text, LOG_TYPES.ATTACK));

    const result = resolveAttack({
      minion,
      ownerStore: usePlayerStore,
      enemyStore: useOpponentStore,
      addLog,
    });

    if (result.success) {
      const isOver = checkGameOver();
      // In multiplayer, sync after attack (especially if game over)
      if (useMultiplayerStore.getState().isMultiplayer) {
        syncMultiplayerState(false).catch(console.error);
      }
    }
  };

  const handleTargetSelection = (minion) => {
    const pendingSpell = window.__pendingSpell;
    if (!pendingSpell) {
      useUIStore.getState().cancelTargeting();
      return;
    }

    const addLog = (text) =>
      useUIStore.getState().addLogEntry(createLogEntry(text, LOG_TYPES.EFFECT));

    // Apply buff defense
    const effects = Array.isArray(pendingSpell.effect)
      ? pendingSpell.effect
      : [pendingSpell.effect];

    for (const effect of effects) {
      if (effect && effect.target === TARGETS.FRIENDLY_MINION) {
        applyBuffDefenseToMinion(
          usePlayerStore,
          minion.instanceId,
          effect.value,
          addLog
        );
      }
    }

    // Move spell to graveyard
    usePlayerStore.getState().addToGraveyard(pendingSpell);

    // Clear targeting
    window.__pendingSpell = null;
    useUIStore.getState().cancelTargeting();
  };

  const handleRightClick = (card) => {
    useUIStore.getState().setShowCardPreview(card);
  };

  // Track entering cards for entrance animation
  const prevIdsRef = useRef(new Set());
  const [enteringIds, setEnteringIds] = useState(new Set());

  useEffect(() => {
    const currentIds = new Set(board.map((m) => m.instanceId));
    const newIds = new Set();
    for (const id of currentIds) {
      if (!prevIdsRef.current.has(id)) newIds.add(id);
    }
    prevIdsRef.current = currentIds;

    if (newIds.size > 0) {
      setEnteringIds(newIds);
      // Clear entrance class after animation completes (250ms max)
      const timer = setTimeout(() => setEnteringIds(new Set()), 300);
      return () => clearTimeout(timer);
    }
  }, [board]);

  return (
    <div className="field field--player">
      {board.length === 0 ? (
        <span className="field__empty">No minions in play</span>
      ) : (
        board.map((minion) => (
          <Card
            key={minion.instanceId}
            card={minion}
            size="board"
            isExhausted={minion.exhausted || !minion.canAttack}
            canAttack={isAttackPhase && minion.canAttack && !minion.exhausted}
            isTargetable={targetingMode}
            isEntering={enteringIds.has(minion.instanceId)}
            onClick={handleMinionClick}
            onRightClick={handleRightClick}
          />
        ))
      )}
    </div>
  );
}
