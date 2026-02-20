// Effect types
export const EFFECT_TYPES = {
  DAMAGE: 'damage',
  HEAL: 'heal',
  DRAW: 'draw',
  BUFF_ATTACK: 'buff_attack',
  BUFF_DEFENSE: 'buff_defense',
  DEBUFF_ATTACK: 'debuff_attack',
  SHIELD: 'shield',
  LIFESTEAL: 'lifesteal',
  AOE_DAMAGE: 'aoe_damage',
  SUMMON: 'summon',
  DESTROY: 'destroy',
  MANA_GAIN: 'mana_gain',
  SELF_DAMAGE: 'self_damage',
  // New mechanics
  FREEZE: 'freeze',              // Target can't attack next turn
  POISON: 'poison',              // Take damage each turn
  BUFF_ALL_ATTACK: 'buff_all_attack', // +ATK to all friendly
  BUFF_ALL_DEFENSE: 'buff_all_defense', // +DEF to all friendly
  DAMAGE_PER_MINION: 'damage_per_minion', // Damage = value × minion count
  HEAL_PER_MINION: 'heal_per_minion',     // Heal = value × minion count
  COPY_MINION: 'copy_minion',     // Copy a random friendly minion
  STEAL_ATTACK: 'steal_attack',   // Steal ATK from enemy minion
  DOUBLE_ATTACK: 'double_attack', // Double a minion's attack
  COMBO: 'combo',                 // Extra effect if played a card this turn
};

// Combo bonus types (used inside COMBO effects)
export const COMBO_BONUS = {
  EXTRA_DAMAGE: 'extra_damage',
  EXTRA_DRAW: 'extra_draw',
  EXTRA_STATS: 'extra_stats',
  EXTRA_HEAL: 'extra_heal',
};

// Effect triggers
export const TRIGGERS = {
  ON_PLAY: 'onPlay',
  ON_ATTACK: 'onAttack',
  ON_DEATH: 'onDeath',
  START_OF_TURN: 'startOfTurn',
  END_OF_TURN: 'endOfTurn',
  PASSIVE: 'passive',
  ON_COMBO: 'onCombo', // Triggers when a card was already played this turn
};

// Effect targets
export const TARGETS = {
  ENEMY_HERO: 'enemyHero',
  SELF_HERO: 'selfHero',
  SELF: 'self',
  FRIENDLY_MINION: 'friendlyMinion',
  ENEMY_MINION: 'enemyMinion',
  ALL_ENEMY_MINIONS: 'allEnemyMinions',
  ALL_FRIENDLY_MINIONS: 'allFriendlyMinions',
  RANDOM_ENEMY_MINION: 'randomEnemyMinion',
};

// Helper to create effect objects
export function createEffect(type, value, target, trigger = TRIGGERS.ON_PLAY) {
  return { type, value, target, trigger };
}

// Helper to create combo effect (bonus effect that fires if a card was played this turn)
export function createComboEffect(bonusType, value, target) {
  return { type: EFFECT_TYPES.COMBO, value, target, trigger: TRIGGERS.ON_PLAY, bonusType };
}
