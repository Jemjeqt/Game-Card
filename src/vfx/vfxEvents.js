/**
 * VFX Event types & convenience emitters.
 *
 * Game logic calls these helpers; the VFXLayer subscribes via eventBus.
 * No React, no Zustand — pure functions that push events onto the bus.
 */

import vfxBus from './eventBus';

// ── Event name constants ─────────────────────────────────────
export const VFX_EVENTS = {
  CARD_PLAYED:        'vfx:card_played',
  ABILITY_TRIGGERED:  'vfx:ability_triggered',
  DAMAGE_APPLIED:     'vfx:damage_applied',
  HEAL_APPLIED:       'vfx:heal_applied',
  MINION_DIED:        'vfx:minion_died',
  MINION_SUMMONED:    'vfx:minion_summoned',
  BUFF_APPLIED:       'vfx:buff_applied',
  SHIELD_APPLIED:     'vfx:shield_applied',
  DRAW_CARDS:         'vfx:draw_cards',
  STEAL_EFFECT:       'vfx:steal_effect',
  AOE_DAMAGE:         'vfx:aoe_damage',
  SPELL_CAST:         'vfx:spell_cast',
  SCREEN_SHAKE:       'vfx:screen_shake',
  SELF_DAMAGE:        'vfx:self_damage',
  POISON_TICK:        'vfx:poison_tick',
};

// ── Convenience emitters ─────────────────────────────────────

/**
 * Emit when any card is played onto the field.
 * @param {{ card: object, owner: 'player'|'opponent' }} payload
 */
export function emitCardPlayed(card, owner = 'player') {
  vfxBus.emit(VFX_EVENTS.CARD_PLAYED, {
    card,
    owner,
    rarity: card.rarity || 'common',
    cardType: card.type,
    icon: card.icon,
    name: card.name,
  });
}

/**
 * Emit when an ability/effect resolves.
 * @param {object} result  — the result object from effectResolver
 * @param {object|null} card — source card (may be null for turn effects)
 * @param {'player'|'opponent'} owner
 */
export function emitAbilityTriggered(result, card, owner = 'player') {
  if (!result) return;

  const rarity = card?.rarity || 'common';
  const icon = card?.icon || '';
  const name = card?.name || '';

  // Map result.type → specific VFX event
  switch (result.type) {
    case 'damage':
      if (result.target === 'allEnemyMinions') {
        vfxBus.emit(VFX_EVENTS.AOE_DAMAGE, { value: result.value, icon, name, rarity, owner });
      } else {
        vfxBus.emit(VFX_EVENTS.DAMAGE_APPLIED, {
          value: result.value,
          target: result.target,
          icon, name, rarity, owner,
        });
      }
      break;

    case 'aoe':
      vfxBus.emit(VFX_EVENTS.AOE_DAMAGE, { value: result.value, icon, name, rarity, owner });
      break;

    case 'heal':
      vfxBus.emit(VFX_EVENTS.HEAL_APPLIED, { value: result.value, icon, name, rarity, owner });
      break;

    case 'draw':
      vfxBus.emit(VFX_EVENTS.DRAW_CARDS, { value: result.value, icon, name, rarity, owner });
      break;

    case 'buff':
      vfxBus.emit(VFX_EVENTS.BUFF_APPLIED, {
        value: result.value,
        target: result.target,
        icon, name, rarity, owner,
      });
      break;

    case 'shield':
      vfxBus.emit(VFX_EVENTS.SHIELD_APPLIED, { value: result.value, icon, name, rarity, owner });
      break;

    case 'summon':
    case 'deathrattle_summon':
      vfxBus.emit(VFX_EVENTS.MINION_SUMMONED, { value: result.value, icon, name, rarity, owner });
      break;

    case 'destroy':
      vfxBus.emit(VFX_EVENTS.MINION_DIED, { icon, name, rarity, owner });
      break;

    case 'selfDamage':
      vfxBus.emit(VFX_EVENTS.SELF_DAMAGE, { value: result.value, icon, name, rarity, owner });
      break;

    case 'steal':
      vfxBus.emit(VFX_EVENTS.STEAL_EFFECT, { value: result.value, icon, name, rarity, owner });
      break;

    case 'mana':
      vfxBus.emit(VFX_EVENTS.BUFF_APPLIED, { value: result.value, icon, name, rarity, owner, subtype: 'mana' });
      break;

    default:
      // needsTarget, null, etc. — no VFX
      break;
  }
}
