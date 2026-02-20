import { EFFECT_TYPES, TRIGGERS } from '../data/effects';

/**
 * Resolve a minion attacking the enemy hero (direct attack model)
 * @param {object} params
 * @param {object} params.minion - The attacking minion instance
 * @param {object} params.ownerStore - Store of the attacker
 * @param {object} params.enemyStore - Store of the defender (hero takes damage)
 * @param {function} params.addLog - Log function
 * @returns {object} Attack result with animation data
 */
export function resolveAttack({ minion, ownerStore, enemyStore, addLog }) {
  if (!minion.canAttack || minion.exhausted) {
    return { success: false, reason: 'Cannot attack' };
  }

  if (minion.currentAttack <= 0) {
    return { success: false, reason: 'No attack power' };
  }

  const damage = minion.currentAttack;

  // Deal damage to enemy hero
  enemyStore.getState().takeDamage(damage);
  addLog(`${minion.name} attacks for ${damage} damage!`);

  // Mark as exhausted
  ownerStore.getState().updateMinion(minion.instanceId, { exhausted: true });

  const result = {
    success: true,
    damage,
    minionName: minion.name,
    minionId: minion.instanceId,
    effects: [],
  };

  // Check for on-attack effects
  if (minion.effect) {
    const effects = Array.isArray(minion.effect) ? minion.effect : [minion.effect];

    for (const effect of effects) {
      if (effect.trigger === TRIGGERS.ON_ATTACK) {
        if (effect.type === EFFECT_TYPES.DAMAGE) {
          // Bonus damage (e.g., Venom Fang)
          enemyStore.getState().takeDamage(effect.value);
          addLog(`${minion.name}'s effect deals ${effect.value} bonus damage!`);
          result.effects.push({ type: 'bonusDamage', value: effect.value });
          result.damage += effect.value;
        }
      }

      // Lifesteal (passive keyword)
      if (effect.type === EFFECT_TYPES.LIFESTEAL) {
        ownerStore.getState().healHP(damage);
        addLog(`${minion.name} heals hero for ${damage} (Lifesteal)`);
        result.effects.push({ type: 'lifesteal', value: damage });
      }
    }
  }

  return result;
}

/**
 * Get all minions that can attack this turn
 */
export function getAttackableMinions(board) {
  return board.filter((m) => m.canAttack && !m.exhausted && m.currentAttack > 0);
}
