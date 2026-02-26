import React, { useRef, useEffect, useState } from 'react';
import Card from '../Card/Card';
import usePlayerStore from '../../stores/usePlayerStore';
import useOpponentStore from '../../stores/useOpponentStore';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';
import useQuestStore from '../../stores/useQuestStore';
import { PHASES, PLAYERS, LOG_TYPES, RARITY } from '../../data/constants';
import { TARGETS } from '../../data/effects';
import { resolveAttack } from '../../engine/combatResolver';
import { checkGameOver } from '../../engine/gameRules';
import { applyBuffDefenseToMinion, incrementCardsPlayed } from '../../engine/effectResolver';
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
    const pendingSpell = useUIStore.getState().pendingSpell;
    if (!pendingSpell) {
      useUIStore.getState().cancelTargeting();
      return;
    }

    const addLog = (text) =>
      useUIStore.getState().addLogEntry(createLogEntry(text, LOG_TYPES.EFFECT));

    // Now spend mana and remove from hand (deferred from PlayerHand)
    if (!usePlayerStore.getState().spendMana(pendingSpell.manaCost)) {
      useUIStore.getState().cancelTargeting();
      return;
    }
    usePlayerStore.getState().removeFromHand(pendingSpell.instanceId);

    // Track combo + quest
    incrementCardsPlayed();
    useQuestStore.getState().trackEvent('spells_cast', 1);
    if (pendingSpell.rarity === RARITY.LEGENDARY) {
      useQuestStore.getState().trackEvent('legendaries_played', 1);
    }

    // Log the play
    useUIStore.getState().addLogEntry(
      createLogEntry(
        `You played ${pendingSpell.name} (${pendingSpell.manaCost} mana)`,
        LOG_TYPES.PLAY
      )
    );

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
        <>
          {/* Primary row: always 5 slots; empty positions shown as ghost frames */}
          <div className="field__row">
            {Array.from({ length: 5 }, (_, i) => {
              const minion = board[i];
              if (!minion) {
                return <div key={`gs-${i}`} className="field__slot" />;
              }
              return (
                <div key={minion.instanceId} className="field__slot field__slot--filled">
                  <Card
                    card={minion}
                    size="board"
                    isExhausted={minion.exhausted || !minion.canAttack}
                    canAttack={isAttackPhase && minion.canAttack && !minion.exhausted}
                    isTargetable={targetingMode}
                    isEntering={enteringIds.has(minion.instanceId)}
                    onClick={handleMinionClick}
                    onRightClick={handleRightClick}
                  />
                </div>
              );
            })}
          </div>
          {/* Overflow row: cards 6–10 */}
          {board.length > 5 && (
            <div className="field__row field__row--overflow">
              {board.slice(5).map((minion) => (
                <div key={minion.instanceId} className="field__slot field__slot--filled">
                  <Card
                    card={minion}
                    size="board"
                    isExhausted={minion.exhausted || !minion.canAttack}
                    canAttack={isAttackPhase && minion.canAttack && !minion.exhausted}
                    isTargetable={targetingMode}
                    isEntering={enteringIds.has(minion.instanceId)}
                    onClick={handleMinionClick}
                    onRightClick={handleRightClick}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
