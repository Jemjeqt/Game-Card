import { EFFECT_TYPES, TRIGGERS, TARGETS, COMBO_BONUS } from '../data/effects';
import { CARD_TYPES } from '../data/constants';
import { getCardById } from '../data/cards';
import { createCardInstance } from '../utils/deckBuilder';
import useQuestStore from '../stores/useQuestStore';

// Track cards played this turn (for combo detection)
let _cardsPlayedThisTurn = 0;

export function resetCardsPlayedThisTurn() {
  _cardsPlayedThisTurn = 0;
}

export function incrementCardsPlayed() {
  _cardsPlayedThisTurn++;
}

export function getCardsPlayedThisTurn() {
  return _cardsPlayedThisTurn;
}

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
      return null;

    case EFFECT_TYPES.AOE_DAMAGE:
      return resolveAoeDamage(effect, card, ownerStore, enemyStore, addLog);

    case EFFECT_TYPES.SUMMON:
      return resolveSummon(effect, card, ownerStore, addLog);

    case EFFECT_TYPES.DESTROY:
      return resolveDestroy(effect, card, ownerStore, enemyStore, addLog);

    case EFFECT_TYPES.SELF_DAMAGE:
      return resolveSelfDamage(effect, card, ownerStore, addLog);

    case EFFECT_TYPES.POISON:
      return resolveDamage(effect, card, ownerStore, enemyStore, addLog);

    case EFFECT_TYPES.HEAL_PER_MINION:
      return resolveHealPerMinion(effect, card, ownerStore, addLog);

    case EFFECT_TYPES.COPY_MINION:
      return resolveCopyMinion(effect, card, ownerStore, addLog);

    case EFFECT_TYPES.COMBO:
      return resolveCombo(effect, card, ownerStore, enemyStore, addLog);

    case EFFECT_TYPES.STEAL_ATTACK:
      return resolveStealAttack(effect, card, ownerStore, enemyStore, addLog);

    case EFFECT_TYPES.BUFF_ALL_ATTACK:
      return resolveBuffAllAttack(effect, card, ownerStore, addLog);

    case EFFECT_TYPES.MANA_GAIN:
      return resolveManaGain(effect, card, ownerStore, addLog);

    default:
      return null;
  }
}

function resolveDamage(effect, card, ownerStore, enemyStore, addLog) {
  if (effect.target === TARGETS.ENEMY_HERO) {
    enemyStore.getState().takeDamage(effect.value);
    addLog(`${card.name} deals ${effect.value} damage to enemy hero!`);
    // Track quest: damage dealt
    useQuestStore.getState().trackEvent('damage_dealt', effect.value);
    return { type: 'damage', target: 'enemyHero', value: effect.value };
  }
  return null;
}

function resolveHeal(effect, card, ownerStore, addLog) {
  if (effect.target === TARGETS.SELF_HERO) {
    ownerStore.getState().healHP(effect.value);
    addLog(`${card.name} heals hero for ${effect.value} HP`);
    useQuestStore.getState().trackEvent('healing_done', effect.value);
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
  // Self buff (e.g., Warcry Berserker with perMinion)
  if (effect.target === TARGETS.SELF) {
    const board = ownerStore.getState().board;
    const minion = board.find((m) => m.instanceId === card.instanceId);
    if (minion) {
      // If specialEffect is perMinion, multiply by board count (excluding self)
      const multiplier = card.specialEffect === 'perMinion'
        ? Math.max(board.length - 1, 0)
        : 1;
      const totalBuff = effect.value * multiplier;
      if (totalBuff > 0) {
        ownerStore.getState().updateMinion(card.instanceId, {
          currentAttack: minion.currentAttack + totalBuff,
        });
        addLog(`${card.name} gains +${totalBuff} Attack!`);
      }
    }
    return { type: 'buff', target: 'self', value: effect.value };
  }
  return null;
}

function resolveBuffDefense(effect, card, ownerStore, addLog) {
  if (effect.target === TARGETS.FRIENDLY_MINION) {
    return { type: 'needsTarget', effectType: 'buff_defense', value: effect.value };
  }
  if (effect.target === TARGETS.ALL_FRIENDLY_MINIONS) {
    ownerStore.getState().buffAllMinionsDefense(effect.value);
    addLog(`${card.name} gives all friendly minions +${effect.value} Defense`);
    return { type: 'buff', target: 'allFriendlyDef', value: effect.value };
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

function resolveAoeDamage(effect, card, ownerStore, enemyStore, addLog) {
  const enemyBoard = [...enemyStore.getState().board];
  const deaths = [];
  const deadMinions = [];

  for (const minion of enemyBoard) {
    const result = enemyStore.getState().damageMinion(minion.instanceId, effect.value);
    if (result && result.died) {
      deaths.push(result.name);
      deadMinions.push(minion);
    }
  }

  addLog(`${card.name} deals ${effect.value} damage to all enemy minions!`);
  if (deaths.length > 0) {
    addLog(`Destroyed: ${deaths.join(', ')}`);
    useQuestStore.getState().trackEvent('minions_killed', deaths.length);
  }

  // Trigger deathrattle for each dead enemy minion
  for (const deadMinion of deadMinions) {
    resolveDeathEffects({
      card: deadMinion,
      ownerStore: enemyStore,
      enemyStore: ownerStore,
      addLog,
    });
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

function resolveDestroy(effect, card, ownerStore, enemyStore, addLog) {
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
  useQuestStore.getState().trackEvent('minions_killed', 1);

  // Trigger deathrattle of the destroyed minion
  resolveDeathEffects({
    card: target,
    ownerStore: enemyStore,
    enemyStore: ownerStore,
    addLog,
  });

  return { type: 'destroy', targetName: target.name };
}

function resolveSelfDamage(effect, card, ownerStore, addLog) {
  ownerStore.getState().takeDamage(effect.value);
  addLog(`${card.name} deals ${effect.value} damage to your hero!`);
  return { type: 'selfDamage', value: effect.value };
}

// === NEW EFFECT RESOLVERS ===

function resolveHealPerMinion(effect, card, ownerStore, addLog) {
  const board = ownerStore.getState().board;
  const healAmount = effect.value * board.length;
  if (healAmount > 0) {
    ownerStore.getState().healHP(healAmount);
    addLog(`${card.name} heals hero for ${healAmount} HP (${board.length} minions)`);
  } else {
    addLog(`${card.name}: No minions on board, no healing`);
  }
  return { type: 'heal', value: healAmount };
}

function resolveCopyMinion(effect, card, ownerStore, addLog) {
  const board = ownerStore.getState().board;
  // Pick a random minion that isn't the Mirror Mage itself
  const candidates = board.filter((m) => m.instanceId !== card.instanceId);
  if (candidates.length === 0) {
    addLog(`${card.name}: No minion to copy`);
    return null;
  }
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const cardDef = getCardById(target.cardId);
  if (cardDef) {
    const copy = createCardInstance(cardDef);
    copy.canAttack = false;
    copy.exhausted = false;
    ownerStore.getState().addToBoard(copy);
    addLog(`${card.name} creates a copy of ${target.name}!`);
    return { type: 'copy', targetName: target.name };
  }
  return null;
}

function resolveCombo(effect, card, ownerStore, enemyStore, addLog) {
  // Combo fires if at least 1 card was played this turn before this card
  if (_cardsPlayedThisTurn < 1) return null;

  addLog(`💥 COMBO activated for ${card.name}!`);
  // Track quest: combo activated
  useQuestStore.getState().trackEvent('combos', 1);

  switch (effect.bonusType) {
    case COMBO_BONUS.EXTRA_DAMAGE: {
      if (effect.target === TARGETS.ENEMY_HERO) {
        enemyStore.getState().takeDamage(effect.value);
        addLog(`Combo: ${effect.value} extra damage to enemy hero!`);
      } else if (effect.target === TARGETS.ALL_ENEMY_MINIONS) {
        const enemyBoard = [...enemyStore.getState().board];
        const deaths = [];
        const deadMinions = [];
        for (const minion of enemyBoard) {
          const result = enemyStore.getState().damageMinion(minion.instanceId, effect.value);
          if (result && result.died) {
            deaths.push(result.name);
            deadMinions.push(minion);
          }
        }
        addLog(`Combo: ${effect.value} damage to all enemy minions!`);
        if (deaths.length > 0) addLog(`Destroyed: ${deaths.join(', ')}`);
        // Trigger deathrattles for combo AoE kills
        for (const deadMinion of deadMinions) {
          resolveDeathEffects({ card: deadMinion, ownerStore: enemyStore, enemyStore: ownerStore, addLog });
        }
      }
      return { type: 'combo', bonusType: 'damage', value: effect.value };
    }
    case COMBO_BONUS.EXTRA_DRAW: {
      ownerStore.getState().drawCards(effect.value);
      addLog(`Combo: Draw ${effect.value} card(s)!`);
      return { type: 'combo', bonusType: 'draw', value: effect.value };
    }
    case COMBO_BONUS.EXTRA_STATS: {
      const board = ownerStore.getState().board;
      const minion = board.find((m) => m.instanceId === card.instanceId);
      if (minion) {
        ownerStore.getState().updateMinion(card.instanceId, {
          currentAttack: minion.currentAttack + effect.value,
          currentDefense: minion.currentDefense + effect.value,
        });
        addLog(`Combo: ${card.name} gains +${effect.value}/+${effect.value}!`);
      }
      return { type: 'combo', bonusType: 'stats', value: effect.value };
    }
    case COMBO_BONUS.EXTRA_HEAL: {
      ownerStore.getState().healHP(effect.value);
      addLog(`Combo: Heal hero for ${effect.value}!`);
      return { type: 'combo', bonusType: 'heal', value: effect.value };
    }
    default:
      return null;
  }
}

// === STEAL ATTACK (Void Empress) ===
function resolveStealAttack(effect, card, ownerStore, enemyStore, addLog) {
  const enemyBoard = enemyStore.getState().board;
  if (enemyBoard.length === 0) {
    addLog(`${card.name}: No enemy minions to steal from`);
    return null;
  }

  const randomIdx = Math.floor(Math.random() * enemyBoard.length);
  const target = enemyBoard[randomIdx];
  const stealAmount = Math.min(effect.value, target.currentAttack);

  if (stealAmount > 0) {
    // Reduce enemy minion attack
    enemyStore.getState().updateMinion(target.instanceId, {
      currentAttack: Math.max(0, target.currentAttack - stealAmount),
    });
    // Buff self
    const ownerBoard = ownerStore.getState().board;
    const self = ownerBoard.find((m) => m.instanceId === card.instanceId);
    if (self) {
      ownerStore.getState().updateMinion(card.instanceId, {
        currentAttack: self.currentAttack + stealAmount,
      });
    }
    addLog(`${card.name} steals ${stealAmount} ATK from ${target.name}!`);
  }
  return { type: 'stealAttack', value: stealAmount, targetName: target.name };
}

// === BUFF ALL ATTACK (Chrono Weaver) ===
function resolveBuffAllAttack(effect, card, ownerStore, addLog) {
  ownerStore.getState().buffAllMinionsAttack(effect.value);
  addLog(`${card.name} gives all friendly minions +${effect.value} Attack!`);
  return { type: 'buffAllAttack', value: effect.value };
}

// === MANA GAIN ===
function resolveManaGain(effect, card, ownerStore, addLog) {
  const state = ownerStore.getState();
  const newMana = Math.min(state.mana + effect.value, state.maxMana);
  ownerStore.setState({ mana: newMana });
  addLog(`${card.name} restores ${effect.value} mana!`);
  return { type: 'manaGain', value: effect.value };
}

/**
 * Resolve end-of-turn effects for all minions on a player's board
 */
export function resolveEndOfTurnEffects({ ownerStore, enemyStore, addLog }) {
  const board = ownerStore.getState().board;
  const results = [];

  for (const minion of board) {
    if (!minion.effect) continue;
    const effects = Array.isArray(minion.effect) ? minion.effect : [minion.effect];

    for (const effect of effects) {
      if (effect.trigger === TRIGGERS.END_OF_TURN) {
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

/**
 * Resolve deathrattle effects when a minion dies
 */
export function resolveDeathEffects({ card, ownerStore, enemyStore, addLog }) {
  if (!card.effect) return [];
  const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
  const results = [];

  for (const effect of effects) {
    if (effect.trigger === TRIGGERS.ON_DEATH) {
      // Track quest: deathrattle triggered
      useQuestStore.getState().trackEvent('deathrattles', 1);

      if (effect.type === EFFECT_TYPES.SUMMON) {
        // Check if the card specifies a special summon
        const summonId = card.summonId || 'skeleton_token';
        const tokenDef = getCardById(summonId);
        if (tokenDef) {
          for (let i = 0; i < effect.value; i++) {
            const token = createCardInstance(tokenDef);
            token.canAttack = false;
            token.exhausted = false;
            ownerStore.getState().addToBoard(token);
          }
          addLog(`${card.name}'s Deathrattle: Summon ${effect.value} ${tokenDef.name}!`);
          results.push({ type: 'deathrattle_summon', value: effect.value, summonName: tokenDef.name });
        }
      } else {
        const result = resolveSingleEffect({
          effect,
          card,
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
