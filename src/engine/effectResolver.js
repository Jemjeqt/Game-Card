import { EFFECT_TYPES, TRIGGERS, TARGETS } from '../data/effects';
import { CARD_TYPES } from '../data/constants';

/**
 * Resolve effects for a card.
 * @param {object} params
 * @param {object} params.card - The card instance triggering the effect
 * @param {string} params.trigger - The trigger timing (onPlay, onAttack, etc.)
 * @param {object} params.ownerStore - The store of the card's owner (player or opponent)
 * @param {object} params.enemyStore - The store of the enemy
 * @param {function} params.addLog - Function to add a log entry
 * @returns {Array} Array of effect results for animation
 */
export function resolveEffects({ card, trigger, ownerStore, enemyStore, addLog }) {
  const results = [];

  if (!card.effect) return results;

  // Normalize to array (some cards have multiple effects)
  const effects = Array.isArray(card.effect) ? card.effect : [card.effect];

  for (const effect of effects) {
    if (effect.trigger !== trigger) continue;

    const result = resolveSingleEffect({
      effect,
      card,
      ownerStore,
      enemyStore,
      addLog,
    });

    if (result) results.push(result);
  }

  return results;
}

function resolveSingleEffect({ effect, card, ownerStore, enemyStore, addLog }) {
  switch (effect.type) {
    case EFFECT_TYPES.DAMAGE:
      return resolveDamage(effect, card, ownerStore, enemyStore, addLog);

    case EFFECT_TYPES.HEAL:
      return resolveHeal(effect, card, ownerStore, addLog);

    case EFFECT_TYPES.DRAW:
      return resolveDraw(effect, card, ownerStore, addLog);

    case EFFECT_TYPES.BUFF_ATTACK:
      return resolveBuffAttack(effect, card, ownerStore, addLog);

    case EFFECT_TYPES.BUFF_DEFENSE:
      return resolveBuffDefense(effect, card, ownerStore, addLog);

    case EFFECT_TYPES.SHIELD:
      return resolveShield(effect, card, ownerStore, addLog);

    case EFFECT_TYPES.LIFESTEAL:
      // Lifesteal is handled in combat resolution, not here
      return null;

    case EFFECT_TYPES.AOE_DAMAGE:
      return resolveAoeDamage(effect, card, enemyStore, addLog);

    case EFFECT_TYPES.SUMMON:
      return resolveSummon(effect, card, ownerStore, addLog);

    case EFFECT_TYPES.DESTROY:
      return resolveDestroy(effect, card, enemyStore, addLog);

    case EFFECT_TYPES.SELF_DAMAGE:
      return resolveSelfDamage(effect, card, ownerStore, addLog);

    default:
      return null;
  }
}

function resolveDamage(effect, card, ownerStore, enemyStore, addLog) {
  if (effect.target === TARGETS.ENEMY_HERO) {
    enemyStore.getState().takeDamage(effect.value);
    addLog(`${card.name} deals ${effect.value} damage to enemy hero!`);
    return { type: 'damage', target: 'enemyHero', value: effect.value };
  }
  return null;
}

function resolveHeal(effect, card, ownerStore, addLog) {
  if (effect.target === TARGETS.SELF_HERO) {
    ownerStore.getState().healHP(effect.value);
    addLog(`${card.name} heals hero for ${effect.value} HP`);
    return { type: 'heal', target: 'selfHero', value: effect.value };
  }
  return null;
}

function resolveDraw(effect, card, ownerStore, addLog) {
  const results = ownerStore.getState().drawCards(effect.value);
  addLog(`${card.name}: Draw ${effect.value} card(s)`);
  return { type: 'draw', value: effect.value, results };
}

function resolveBuffAttack(effect, card, ownerStore, addLog) {
  if (effect.target === TARGETS.ALL_FRIENDLY_MINIONS) {
    ownerStore.getState().buffAllMinionsAttack(effect.value);
    addLog(`${card.name} gives all friendly minions +${effect.value} Attack`);
    return { type: 'buff', target: 'allFriendly', value: effect.value };
  }
  return null;
}

function resolveBuffDefense(effect, card, ownerStore, addLog) {
  // For targeted buffs (like Mystic Shield), the target minion instanceId
  // should be provided. For now, we'll handle it in the hook level.
  // This returns a marker that targeting is needed.
  if (effect.target === TARGETS.FRIENDLY_MINION) {
    return { type: 'needsTarget', effectType: 'buff_defense', value: effect.value };
  }
  return null;
}

function resolveShield(effect, card, ownerStore, addLog) {
  if (effect.target === TARGETS.SELF) {
    // Find this card on the board and give it shield
    const board = ownerStore.getState().board;
    const minion = board.find((m) => m.instanceId === card.instanceId);
    if (minion) {
      ownerStore.getState().updateMinion(card.instanceId, {
        shield: (minion.shield || 0) + effect.value,
      });
      addLog(`${card.name} gains a shield (absorbs ${effect.value} damage)`);
    }
    return { type: 'shield', value: effect.value };
  }
  return null;
}

function resolveAoeDamage(effect, card, enemyStore, addLog) {
  const enemyBoard = [...enemyStore.getState().board];
  const deaths = [];

  for (const minion of enemyBoard) {
    const result = enemyStore.getState().damageMinion(minion.instanceId, effect.value);
    if (result && result.died) {
      deaths.push(result.name);
    }
  }

  addLog(`${card.name} deals ${effect.value} damage to all enemy minions!`);
  if (deaths.length > 0) {
    addLog(`Destroyed: ${deaths.join(', ')}`);
  }

  return { type: 'aoe', value: effect.value, deaths };
}

function resolveSummon(effect, card, ownerStore, addLog) {
  for (let i = 0; i < effect.value; i++) {
    ownerStore.getState().summonSkeleton();
  }
  addLog(`${card.name} summons ${effect.value} Skeleton(s)!`);
  return { type: 'summon', value: effect.value };
}

function resolveDestroy(effect, card, enemyStore, addLog) {
  const enemyBoard = enemyStore.getState().board;
  if (enemyBoard.length === 0) {
    addLog(`${card.name}: No enemy minions to destroy`);
    return null;
  }

  // Random enemy minion
  const randomIndex = Math.floor(Math.random() * enemyBoard.length);
  const target = enemyBoard[randomIndex];
  enemyStore.getState().removeFromBoard(target.instanceId);
  addLog(`${card.name} destroys ${target.name}!`);
  return { type: 'destroy', targetName: target.name };
}

function resolveSelfDamage(effect, card, ownerStore, addLog) {
  ownerStore.getState().takeDamage(effect.value);
  addLog(`${card.name} deals ${effect.value} damage to your hero!`);
  return { type: 'selfDamage', value: effect.value };
}

/**
 * Apply buff defense to a specific friendly minion (for targeted spells like Mystic Shield)
 */
export function applyBuffDefenseToMinion(ownerStore, minionInstanceId, value, addLog) {
  const board = ownerStore.getState().board;
  const minion = board.find((m) => m.instanceId === minionInstanceId);
  if (!minion) return false;

  ownerStore.getState().updateMinion(minionInstanceId, {
    currentDefense: minion.currentDefense + value,
  });
  addLog(`${minion.name} gains +${value} Defense`);
  return true;
}

/**
 * Resolve start-of-turn effects for all minions on a player's board
 */
export function resolveStartOfTurnEffects({ ownerStore, enemyStore, addLog }) {
  const board = ownerStore.getState().board;
  const results = [];

  for (const minion of board) {
    if (!minion.effect) continue;
    const effects = Array.isArray(minion.effect) ? minion.effect : [minion.effect];

    for (const effect of effects) {
      if (effect.trigger === TRIGGERS.START_OF_TURN) {
        const result = resolveSingleEffect({
          effect,
          card: minion,
          ownerStore,
          enemyStore,
          addLog,
        });
        if (result) results.push(result);
      }
    }
  }

  return results;
}
