import useUIStore from '../stores/useUIStore';
import { EFFECT_TYPES } from '../data/effects';
import { RARITY } from '../data/constants';

/**
 * Trigger a VFX based on a card being played.
 * Called from PlayerHand and AI when playing a card.
 */
export function triggerPlayVFX(card) {
  // Legendary cards get the dramatic entrance
  if (card.rarity === RARITY.LEGENDARY) {
    useUIStore.getState().triggerVFX({
      type: 'legendary_play',
      cardName: card.name,
      cardIcon: card.icon,
      isLegendary: true,
    });
    return;
  }

  // Spells get a generic spell cast VFX
  if (card.type === 'spell') {
    useUIStore.getState().triggerVFX({
      type: 'spell_cast',
      cardName: card.name,
      cardIcon: card.icon,
    });
  }
}

/**
 * Trigger a VFX based on an effect resolution result.
 * Called after resolveEffects returns results.
 */
export function triggerEffectVFX(result, card) {
  if (!result) return;

  const vfxMap = {
    damage: 'damage_hero',
    heal: 'heal',
    draw: 'draw',
    buff: 'buff',
    aoe: 'aoe_damage',
    summon: 'summon',
    destroy: 'destroy',
    selfDamage: 'self_damage',
    shield: 'shield',
    steal: 'steal',
  };

  // Map result type to VFX type
  let vfxType = null;

  if (result.type === 'damage' && result.target === 'enemyHero') {
    vfxType = 'damage_hero';
  } else if (result.type === 'damage' && result.target === 'allEnemyMinions') {
    vfxType = 'aoe_damage';
  } else if (result.type === 'aoe') {
    vfxType = 'aoe_damage';
  } else if (vfxMap[result.type]) {
    vfxType = vfxMap[result.type];
  }

  if (vfxType) {
    useUIStore.getState().triggerVFX({
      type: vfxType,
      cardName: card?.name || '',
      cardIcon: card?.icon || '',
    });
  }
}

/**
 * Map an EFFECT_TYPE to a VFX type string for direct use.
 */
export function getVFXForEffectType(effectType) {
  const map = {
    [EFFECT_TYPES.DAMAGE]: 'damage_hero',
    [EFFECT_TYPES.HEAL]: 'heal',
    [EFFECT_TYPES.DRAW]: 'draw',
    [EFFECT_TYPES.BUFF_ATTACK]: 'buff',
    [EFFECT_TYPES.BUFF_DEFENSE]: 'buff',
    [EFFECT_TYPES.SHIELD]: 'shield',
    [EFFECT_TYPES.AOE_DAMAGE]: 'aoe_damage',
    [EFFECT_TYPES.SUMMON]: 'summon',
    [EFFECT_TYPES.DESTROY]: 'destroy',
    [EFFECT_TYPES.SELF_DAMAGE]: 'self_damage',
    [EFFECT_TYPES.BUFF_ALL_ATTACK]: 'buff',
    [EFFECT_TYPES.BUFF_ALL_DEFENSE]: 'buff',
    [EFFECT_TYPES.STEAL_ATTACK]: 'steal',
    [EFFECT_TYPES.COPY_MINION]: 'summon',
    [EFFECT_TYPES.HEAL_PER_MINION]: 'heal',
    [EFFECT_TYPES.MANA_GAIN]: 'buff',
  };
  return map[effectType] || null;
}
