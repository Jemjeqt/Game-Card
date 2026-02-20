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
};

// Effect triggers
export const TRIGGERS = {
  ON_PLAY: 'onPlay',
  ON_ATTACK: 'onAttack',
  ON_DEATH: 'onDeath',
  START_OF_TURN: 'startOfTurn',
  END_OF_TURN: 'endOfTurn',
  PASSIVE: 'passive',
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
