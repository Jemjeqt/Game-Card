import { CARD_TYPES, RARITY } from './constants';
import { EFFECT_TYPES, TRIGGERS, TARGETS, COMBO_BONUS, createEffect, createComboEffect } from './effects';

// Card emoji icons as visual placeholders
const ICONS = {
  ember_sprite: '🧡',
  shadow_imp: '👿',
  arcane_spark: '🔆',
  healing_wisp: '✨',
  dark_ritualist: '📜',
  venom_fang: '🐍',
  mystic_shield: '🛡️',
  ironclad_knight: '⚔️',
  flame_warlock: '🧙',
  soul_leech: '🧛',
  fireball: '☄️',
  corpse_raiser: '💀',
  mindbreak: '🌀',
  blood_pact: '🩸',
  shadowstrike_assassin: '🗡️',
  elder_dragon: '🐉',
  abyssal_devourer: '👹',
  inferno_wave: '🌋',
  archmage_solara: '🌟',
  divine_protector: '👼',
  skeleton_token: '🦴',
  frost_mage: '❄️',
  plague_rat: '🐀',
  warcry_berserker: '🪓',
  spirit_walker: '👻',
  mirror_mage: '🪞',
  thunder_elemental: '⛈️',
  blood_knight: '💉',
  shadow_dancer: '💃',
  void_cultist: '🌑',
  cursed_blade: '🔪',
  chain_lightning: '🌩️',
  war_drums: '🥁',
  soul_exchange: '🔄',
  phoenix_egg: '🥚',
  phoenix_token: '🔥',
  doom_harbinger: '☠️',
  revenant_token: '💨',
  celestial_arbiter: '⭐',
  void_empress: '🌌',
  infernal_titan: '🔱',
  chrono_weaver: '⏳',
  shadow_sovereign: '👁️',
  mana_aegis: '🔮',
  abyss_monarch: '👑',
  world_ender: '💥',
  eternal_phoenix: '🦅',
  arcane_overlord: '🧿',
  soul_reaper: '🪦',
  genesis_wyrm: '🐲',
  oblivion_spell: '🌪️',
  divine_wrath: '⚡',
  void_devourer: '🕳️',
  bronze_phoenix: '🐣',
  tiny_arcane: '💫',
  silver_shield: '🔰',
  mini_reaper: '⚰️',
  mini_phoenix_token: '🐥',
};

// ===== ALL 35 CARD DEFINITIONS =====
const CARD_DEFINITIONS = [
  // ===== LOW COST (1-2 Mana) =====
  {
    id: 'ember_sprite',
    name: 'Ember Sprite',
    manaCost: 1,
    attack: 1,
    defense: 2,
    type: CARD_TYPES.MINION,
    rarity: RARITY.COMMON,
    effect: null,
    description: 'A tiny but persistent flame spirit.',
    icon: ICONS.ember_sprite,
    keywords: [],
  },
  {
    id: 'shadow_imp',
    name: 'Shadow Imp',
    manaCost: 1,
    attack: 2,
    defense: 1,
    type: CARD_TYPES.MINION,
    rarity: RARITY.COMMON,
    effect: null,
    description: 'Quick and deadly, but fragile.',
    icon: ICONS.shadow_imp,
    keywords: [],
  },
  {
    id: 'arcane_spark',
    name: 'Arcane Spark',
    manaCost: 1,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.COMMON,
    effect: createEffect(EFFECT_TYPES.DAMAGE, 2, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
    description: 'Deal 2 damage to the enemy hero.',
    icon: ICONS.arcane_spark,
    keywords: [],
  },
  {
    id: 'healing_wisp',
    name: 'Healing Wisp',
    manaCost: 1,
    attack: 0,
    defense: 3,
    type: CARD_TYPES.MINION,
    rarity: RARITY.COMMON,
    effect: createEffect(EFFECT_TYPES.HEAL, 2, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    description: 'Battlecry: Restore 2 HP to your hero.',
    icon: ICONS.healing_wisp,
    keywords: [],
  },
  {
    id: 'dark_ritualist',
    name: 'Dark Ritualist',
    manaCost: 2,
    attack: 2,
    defense: 2,
    type: CARD_TYPES.MINION,
    rarity: RARITY.COMMON,
    effect: createEffect(EFFECT_TYPES.DRAW, 1, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    description: 'Battlecry: Draw 1 card.',
    icon: ICONS.dark_ritualist,
    keywords: [],
  },
  {
    id: 'venom_fang',
    name: 'Venom Fang',
    manaCost: 2,
    attack: 3,
    defense: 1,
    type: CARD_TYPES.MINION,
    rarity: RARITY.RARE,
    effect: createEffect(EFFECT_TYPES.DAMAGE, 1, TARGETS.ENEMY_HERO, TRIGGERS.ON_ATTACK),
    description: 'When this attacks, deal 1 extra damage to the enemy hero.',
    icon: ICONS.venom_fang,
    keywords: [],
  },
  {
    id: 'mystic_shield',
    name: 'Mystic Shield',
    manaCost: 2,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.COMMON,
    effect: createEffect(EFFECT_TYPES.BUFF_DEFENSE, 3, TARGETS.FRIENDLY_MINION, TRIGGERS.ON_PLAY),
    description: 'Give a friendly minion +3 Defense.',
    icon: ICONS.mystic_shield,
    keywords: [],
  },

  // ===== MID COST (3-4 Mana) =====
  {
    id: 'ironclad_knight',
    name: 'Ironclad Knight',
    manaCost: 3,
    attack: 2,
    defense: 5,
    type: CARD_TYPES.MINION,
    rarity: RARITY.COMMON,
    effect: createEffect(EFFECT_TYPES.SHIELD, 2, TARGETS.SELF, TRIGGERS.ON_PLAY),
    description: 'Battlecry: Gain a shield that absorbs 2 damage.',
    icon: ICONS.ironclad_knight,
    keywords: ['shield'],
  },
  {
    id: 'flame_warlock',
    name: 'Flame Warlock',
    manaCost: 3,
    attack: 4,
    defense: 3,
    type: CARD_TYPES.MINION,
    rarity: RARITY.RARE,
    effect: createEffect(EFFECT_TYPES.DAMAGE, 2, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
    description: 'Battlecry: Deal 2 damage to the enemy hero.',
    icon: ICONS.flame_warlock,
    keywords: [],
  },
  {
    id: 'soul_leech',
    name: 'Soul Leech',
    manaCost: 3,
    attack: 3,
    defense: 3,
    type: CARD_TYPES.MINION,
    rarity: RARITY.RARE,
    effect: createEffect(EFFECT_TYPES.LIFESTEAL, 0, TARGETS.SELF, TRIGGERS.PASSIVE),
    description: 'Lifesteal: Heal your hero for damage dealt.',
    icon: ICONS.soul_leech,
    keywords: ['lifesteal'],
  },
  {
    id: 'fireball',
    name: 'Fireball',
    manaCost: 3,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.COMMON,
    effect: createEffect(EFFECT_TYPES.DAMAGE, 4, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
    description: 'Deal 4 damage to the enemy hero.',
    icon: ICONS.fireball,
    keywords: [],
  },
  {
    id: 'corpse_raiser',
    name: 'Corpse Raiser',
    manaCost: 4,
    attack: 3,
    defense: 4,
    type: CARD_TYPES.MINION,
    rarity: RARITY.EPIC,
    effect: createEffect(EFFECT_TYPES.SUMMON, 1, TARGETS.SELF, TRIGGERS.ON_PLAY),
    description: 'Battlecry: Summon a 1/1 Skeleton.',
    icon: ICONS.corpse_raiser,
    keywords: [],
  },
  {
    id: 'mindbreak',
    name: 'Mindbreak',
    manaCost: 4,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.RARE,
    effect: createEffect(EFFECT_TYPES.AOE_DAMAGE, 2, TARGETS.ALL_ENEMY_MINIONS, TRIGGERS.ON_PLAY),
    description: 'Deal 2 damage to ALL enemy minions.',
    icon: ICONS.mindbreak,
    keywords: [],
  },
  {
    id: 'blood_pact',
    name: 'Blood Pact',
    manaCost: 2,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.RARE,
    effect: [
      createEffect(EFFECT_TYPES.SELF_DAMAGE, 2, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.DRAW, 2, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Deal 2 damage to your hero. Draw 2 cards.',
    icon: ICONS.blood_pact,
    keywords: [],
  },
  {
    id: 'shadowstrike_assassin',
    name: 'Shadowstrike Assassin',
    manaCost: 4,
    attack: 5,
    defense: 2,
    type: CARD_TYPES.MINION,
    rarity: RARITY.RARE,
    effect: createEffect(EFFECT_TYPES.DAMAGE, 1, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
    description: 'Battlecry: Deal 1 damage to the enemy hero.',
    icon: ICONS.shadowstrike_assassin,
    keywords: [],
  },

  // ===== HIGH COST (5-7 Mana) =====
  {
    id: 'elder_dragon',
    name: 'Elder Dragon',
    manaCost: 7,
    attack: 8,
    defense: 7,
    type: CARD_TYPES.MINION,
    rarity: RARITY.LEGENDARY,
    effect: createEffect(EFFECT_TYPES.DAMAGE, 3, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
    description: 'Battlecry: Deal 3 damage to the enemy hero.',
    icon: ICONS.elder_dragon,
    keywords: [],
  },
  {
    id: 'abyssal_devourer',
    name: 'Abyssal Devourer',
    manaCost: 6,
    attack: 5,
    defense: 6,
    type: CARD_TYPES.MINION,
    rarity: RARITY.EPIC,
    effect: createEffect(EFFECT_TYPES.DESTROY, 1, TARGETS.RANDOM_ENEMY_MINION, TRIGGERS.ON_PLAY),
    description: 'Battlecry: Destroy a random enemy minion.',
    icon: ICONS.abyssal_devourer,
    keywords: [],
  },
  {
    id: 'inferno_wave',
    name: 'Inferno Wave',
    manaCost: 5,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.EPIC,
    effect: [
      createEffect(EFFECT_TYPES.DAMAGE, 3, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.AOE_DAMAGE, 3, TARGETS.ALL_ENEMY_MINIONS, TRIGGERS.ON_PLAY),
    ],
    description: 'Deal 3 damage to the enemy hero and ALL enemy minions.',
    icon: ICONS.inferno_wave,
    keywords: [],
  },
  {
    id: 'archmage_solara',
    name: 'Archmage Solara',
    manaCost: 5,
    attack: 4,
    defense: 5,
    type: CARD_TYPES.MINION,
    rarity: RARITY.LEGENDARY,
    effect: createEffect(EFFECT_TYPES.DAMAGE, 2, TARGETS.ENEMY_HERO, TRIGGERS.START_OF_TURN),
    description: 'Start of Turn: Deal 2 damage to the enemy hero.',
    icon: ICONS.archmage_solara,
    keywords: [],
  },
  {
    id: 'divine_protector',
    name: 'Divine Protector',
    manaCost: 5,
    attack: 3,
    defense: 9,
    type: CARD_TYPES.MINION,
    rarity: RARITY.EPIC,
    effect: [
      createEffect(EFFECT_TYPES.HEAL, 5, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.BUFF_ATTACK, 1, TARGETS.ALL_FRIENDLY_MINIONS, TRIGGERS.ON_PLAY),
    ],
    description: 'Battlecry: Heal hero for 5. Give all friendly minions +1 Attack.',
    icon: ICONS.divine_protector,
    keywords: [],
  },

  // ===== NEW CARDS (21-35) =====

  // --- FROST MAGE (2 mana) — Combo: Freeze ---
  {
    id: 'frost_mage',
    name: 'Frost Mage',
    manaCost: 2,
    attack: 2,
    defense: 3,
    type: CARD_TYPES.MINION,
    rarity: RARITY.RARE,
    effect: [
      createEffect(EFFECT_TYPES.DAMAGE, 1, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
      createComboEffect(COMBO_BONUS.EXTRA_DAMAGE, 1, TARGETS.ENEMY_HERO),
    ],
    description: 'Battlecry: Deal 1 damage. Combo: Deal 1 extra damage.',
    icon: ICONS.frost_mage,
    keywords: ['combo'],
  },

  // --- PLAGUE RAT (1 mana) — Poison (damage per turn) ---
  {
    id: 'plague_rat',
    name: 'Plague Rat',
    manaCost: 1,
    attack: 1,
    defense: 1,
    type: CARD_TYPES.MINION,
    rarity: RARITY.COMMON,
    effect: createEffect(EFFECT_TYPES.POISON, 1, TARGETS.ENEMY_HERO, TRIGGERS.START_OF_TURN),
    description: 'Start of Turn: Deal 1 poison damage to enemy hero.',
    icon: ICONS.plague_rat,
    keywords: ['poison'],
  },

  // --- WARCRY BERSERKER (3 mana) — Gets stronger with more minions ---
  {
    id: 'warcry_berserker',
    name: 'Warcry Berserker',
    manaCost: 3,
    attack: 2,
    defense: 4,
    type: CARD_TYPES.MINION,
    rarity: RARITY.RARE,
    effect: createEffect(EFFECT_TYPES.BUFF_ATTACK, 1, TARGETS.SELF, TRIGGERS.ON_PLAY),
    description: 'Battlecry: Gain +1 ATK for each friendly minion on board.',
    icon: ICONS.warcry_berserker,
    keywords: ['warcry'],
    specialEffect: 'perMinion',
  },

  // --- SPIRIT WALKER (2 mana) — Heals per minion ---
  {
    id: 'spirit_walker',
    name: 'Spirit Walker',
    manaCost: 2,
    attack: 1,
    defense: 4,
    type: CARD_TYPES.MINION,
    rarity: RARITY.COMMON,
    effect: createEffect(EFFECT_TYPES.HEAL_PER_MINION, 1, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    description: 'Battlecry: Heal 1 HP per friendly minion on board.',
    icon: ICONS.spirit_walker,
    keywords: [],
  },

  // --- MIRROR MAGE (5 mana) — Copy a random friendly minion ---
  {
    id: 'mirror_mage',
    name: 'Mirror Mage',
    manaCost: 5,
    attack: 3,
    defense: 3,
    type: CARD_TYPES.MINION,
    rarity: RARITY.EPIC,
    effect: createEffect(EFFECT_TYPES.COPY_MINION, 1, TARGETS.SELF, TRIGGERS.ON_PLAY),
    description: 'Battlecry: Summon a copy of a random friendly minion.',
    icon: ICONS.mirror_mage,
    keywords: [],
  },

  // --- THUNDER ELEMENTAL (4 mana) — Combo: AoE damage ---
  {
    id: 'thunder_elemental',
    name: 'Thunder Elemental',
    manaCost: 4,
    attack: 3,
    defense: 5,
    type: CARD_TYPES.MINION,
    rarity: RARITY.RARE,
    effect: [
      createEffect(EFFECT_TYPES.DAMAGE, 2, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
      createComboEffect(COMBO_BONUS.EXTRA_DAMAGE, 2, TARGETS.ALL_ENEMY_MINIONS),
    ],
    description: 'Battlecry: Deal 2 damage. Combo: Deal 2 to all enemy minions.',
    icon: ICONS.thunder_elemental,
    keywords: ['combo'],
  },

  // --- BLOOD KNIGHT (4 mana) — Lifesteal + Combo draw ---
  {
    id: 'blood_knight',
    name: 'Blood Knight',
    manaCost: 4,
    attack: 4,
    defense: 3,
    type: CARD_TYPES.MINION,
    rarity: RARITY.EPIC,
    effect: [
      createEffect(EFFECT_TYPES.LIFESTEAL, 0, TARGETS.SELF, TRIGGERS.PASSIVE),
      createComboEffect(COMBO_BONUS.EXTRA_DRAW, 1, TARGETS.SELF_HERO),
    ],
    description: 'Lifesteal. Combo: Draw 1 card.',
    icon: ICONS.blood_knight,
    keywords: ['lifesteal', 'combo'],
  },

  // --- SHADOW DANCER (3 mana) — Combo: get +2/+2 ---
  {
    id: 'shadow_dancer',
    name: 'Shadow Dancer',
    manaCost: 3,
    attack: 2,
    defense: 2,
    type: CARD_TYPES.MINION,
    rarity: RARITY.RARE,
    effect: createComboEffect(COMBO_BONUS.EXTRA_STATS, 2, TARGETS.SELF),
    description: 'Combo: Gain +2/+2.',
    icon: ICONS.shadow_dancer,
    keywords: ['combo'],
  },

  // --- VOID CULTIST (3 mana) — End of Turn: deal 1 damage to ALL ---
  {
    id: 'void_cultist',
    name: 'Void Cultist',
    manaCost: 3,
    attack: 2,
    defense: 5,
    type: CARD_TYPES.MINION,
    rarity: RARITY.RARE,
    effect: createEffect(EFFECT_TYPES.DAMAGE, 1, TARGETS.ENEMY_HERO, TRIGGERS.END_OF_TURN),
    description: 'End of Turn: Deal 1 damage to enemy hero.',
    icon: ICONS.void_cultist,
    keywords: [],
  },

  // --- CURSED BLADE (2 mana, Spell) — Combo: Deal extra damage ---
  {
    id: 'cursed_blade',
    name: 'Cursed Blade',
    manaCost: 2,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.COMMON,
    effect: [
      createEffect(EFFECT_TYPES.DAMAGE, 2, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
      createComboEffect(COMBO_BONUS.EXTRA_DAMAGE, 2, TARGETS.ENEMY_HERO),
    ],
    description: 'Deal 2 damage. Combo: Deal 2 extra damage.',
    icon: ICONS.cursed_blade,
    keywords: ['combo'],
  },

  // --- CHAIN LIGHTNING (3 mana, Spell) — AoE + hero damage ---
  {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    manaCost: 3,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.RARE,
    effect: [
      createEffect(EFFECT_TYPES.AOE_DAMAGE, 1, TARGETS.ALL_ENEMY_MINIONS, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.DAMAGE, 2, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Deal 1 damage to all enemy minions and 2 to enemy hero.',
    icon: ICONS.chain_lightning,
    keywords: [],
  },

  // --- WAR DRUMS (4 mana, Spell) — Buff all friendly minions ---
  {
    id: 'war_drums',
    name: 'War Drums',
    manaCost: 4,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.EPIC,
    effect: [
      createEffect(EFFECT_TYPES.BUFF_ATTACK, 2, TARGETS.ALL_FRIENDLY_MINIONS, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.BUFF_DEFENSE, 1, TARGETS.ALL_FRIENDLY_MINIONS, TRIGGERS.ON_PLAY),
    ],
    description: 'Give all friendly minions +2 Attack and +1 Defense.',
    icon: ICONS.war_drums,
    keywords: [],
  },

  // --- SOUL EXCHANGE (5 mana, Spell) — Damage both heroes, draw ---
  {
    id: 'soul_exchange',
    name: 'Soul Exchange',
    manaCost: 5,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.EPIC,
    effect: [
      createEffect(EFFECT_TYPES.SELF_DAMAGE, 5, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.DAMAGE, 5, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.DRAW, 2, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Deal 5 damage to BOTH heroes. Draw 2 cards.',
    icon: ICONS.soul_exchange,
    keywords: [],
  },

  // --- PHOENIX EGG (2 mana) — On Death: Summon Phoenix ---
  {
    id: 'phoenix_egg',
    name: 'Phoenix Egg',
    manaCost: 2,
    attack: 0,
    defense: 3,
    type: CARD_TYPES.MINION,
    rarity: RARITY.EPIC,
    effect: createEffect(EFFECT_TYPES.SUMMON, 1, TARGETS.SELF, TRIGGERS.ON_DEATH),
    description: 'Deathrattle: Summon a 3/3 Phoenix.',
    icon: ICONS.phoenix_egg,
    keywords: ['deathrattle'],
    summonId: 'phoenix_token',
  },

  // --- DOOM HARBINGER (8 mana) — Massive: Destroy ALL enemy minions ---
  {
    id: 'doom_harbinger',
    name: 'Doom Harbinger',
    manaCost: 8,
    attack: 6,
    defense: 6,
    type: CARD_TYPES.MINION,
    rarity: RARITY.LEGENDARY,
    effect: createEffect(EFFECT_TYPES.AOE_DAMAGE, 5, TARGETS.ALL_ENEMY_MINIONS, TRIGGERS.ON_PLAY),
    description: 'Battlecry: Deal 5 damage to ALL enemy minions.',
    icon: ICONS.doom_harbinger,
    keywords: [],
  },

  // ===== v0.3.0 — 5 NEW LEGENDARY CARDS =====

  // --- CELESTIAL ARBITER (7 mana) — Battlecry: Deal damage equal to your mana crystals to all enemies ---
  {
    id: 'celestial_arbiter',
    name: 'Celestial Arbiter',
    manaCost: 7,
    attack: 4,
    defense: 8,
    type: CARD_TYPES.MINION,
    rarity: RARITY.LEGENDARY,
    effect: [
      createEffect(EFFECT_TYPES.AOE_DAMAGE, 3, TARGETS.ALL_ENEMY_MINIONS, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.DAMAGE, 3, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.HEAL, 5, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Battlecry: Deal 3 AoE + 3 to hero + Heal 5. The ultimate judge.',
    icon: ICONS.celestial_arbiter,
    keywords: ['legendary'],
  },

  // --- VOID EMPRESS (6 mana) — Passive Lifesteal + Start of Turn: steal 1 ATK from random enemy ---
  {
    id: 'void_empress',
    name: 'Void Empress',
    manaCost: 6,
    attack: 4,
    defense: 7,
    type: CARD_TYPES.MINION,
    rarity: RARITY.LEGENDARY,
    effect: [
      createEffect(EFFECT_TYPES.LIFESTEAL, 0, TARGETS.SELF, TRIGGERS.PASSIVE),
      createEffect(EFFECT_TYPES.STEAL_ATTACK, 1, TARGETS.RANDOM_ENEMY_MINION, TRIGGERS.START_OF_TURN),
      createEffect(EFFECT_TYPES.DRAW, 1, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Lifesteal. Start of Turn: Steal 1 ATK from enemy. Battlecry: Draw 1.',
    icon: ICONS.void_empress,
    keywords: ['lifesteal', 'legendary'],
  },

  // --- INFERNAL TITAN (9 mana) — Biggest body, Battlecry: deal 5 to hero + summon 2 skeletons ---
  {
    id: 'infernal_titan',
    name: 'Infernal Titan',
    manaCost: 9,
    attack: 8,
    defense: 10,
    type: CARD_TYPES.MINION,
    rarity: RARITY.LEGENDARY,
    effect: [
      createEffect(EFFECT_TYPES.DAMAGE, 4, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.SUMMON, 2, TARGETS.SELF, TRIGGERS.ON_PLAY),
    ],
    description: 'Battlecry: Deal 4 to enemy hero + Summon 2 Skeletons. Unstoppable force.',
    icon: ICONS.infernal_titan,
    keywords: ['legendary'],
  },

  // --- CHRONO WEAVER (5 mana) — Battlecry: Draw 3 + give all friendly minions double attack this turn ---
  {
    id: 'chrono_weaver',
    name: 'Chrono Weaver',
    manaCost: 6,
    attack: 3,
    defense: 4,
    type: CARD_TYPES.MINION,
    rarity: RARITY.LEGENDARY,
    effect: [
      createEffect(EFFECT_TYPES.DRAW, 1, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.BUFF_ALL_ATTACK, 1, TARGETS.ALL_FRIENDLY_MINIONS, TRIGGERS.ON_PLAY),
    ],
    description: 'Battlecry: Draw 1 card + All friendly minions gain +1 ATK. Time bender.',
    icon: ICONS.chrono_weaver,
    keywords: ['legendary'],
  },

  // --- SHADOW SOVEREIGN (8 mana) — Deathrattle: Destroy ALL minions + Deal 3 to enemy hero ---
  {
    id: 'shadow_sovereign',
    name: 'Shadow Sovereign',
    manaCost: 8,
    attack: 6,
    defense: 6,
    type: CARD_TYPES.MINION,
    rarity: RARITY.LEGENDARY,
    effect: [
      createEffect(EFFECT_TYPES.AOE_DAMAGE, 5, TARGETS.ALL_ENEMY_MINIONS, TRIGGERS.ON_DEATH),
      createEffect(EFFECT_TYPES.DAMAGE, 2, TARGETS.ENEMY_HERO, TRIGGERS.ON_DEATH),
    ],
    description: 'Deathrattle: Deal 5 to ALL enemy minions + Deal 2 to hero. Prince of shadows.',
    icon: ICONS.shadow_sovereign,
    keywords: ['deathrattle', 'legendary'],
  },

  // ===== v0.3.1 — BALANCE PATCH NEW CARDS =====

  // --- MANA AEGIS (3 mana, Spell) — Protective spell: buff all DEF + heal ---
  {
    id: 'mana_aegis',
    name: 'Mana Aegis',
    manaCost: 3,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.RARE,
    effect: [
      createEffect(EFFECT_TYPES.BUFF_DEFENSE, 2, TARGETS.ALL_FRIENDLY_MINIONS, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.HEAL, 3, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Give all friendly minions +2 Defense. Restore 3 HP to your hero.',
    icon: ICONS.mana_aegis,
    keywords: [],
  },

  // --- ABYSS MONARCH (8 mana) — Heavy AoE + self damage ---
  {
    id: 'abyss_monarch',
    name: 'Abyss Monarch',
    manaCost: 8,
    attack: 7,
    defense: 7,
    type: CARD_TYPES.MINION,
    rarity: RARITY.LEGENDARY,
    effect: [
      createEffect(EFFECT_TYPES.AOE_DAMAGE, 4, TARGETS.ALL_ENEMY_MINIONS, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.SELF_DAMAGE, 5, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Battlecry: Deal 4 damage to ALL enemy minions. Deal 5 damage to your hero.',
    icon: ICONS.abyss_monarch,
    keywords: ['legendary'],
  },

  // ===== v0.4.0 — 8 MYTHIC CARDS (Total: 50) =====

  // --- WORLD ENDER (10 mana) — Ultimate finisher ---
  {
    id: 'world_ender',
    name: 'World Ender',
    manaCost: 10,
    attack: 10,
    defense: 10,
    type: CARD_TYPES.MINION,
    rarity: RARITY.MYTHIC,
    effect: [
      createEffect(EFFECT_TYPES.AOE_DAMAGE, 5, TARGETS.ALL_ENEMY_MINIONS, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.DAMAGE, 5, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Battlecry: Deal 5 to ALL enemies and 5 to enemy hero. The end of all things.',
    icon: ICONS.world_ender,
    keywords: ['mythic'],
  },

  // --- ETERNAL PHOENIX (9 mana) — Immortal flame bird ---
  {
    id: 'eternal_phoenix',
    name: 'Eternal Phoenix',
    manaCost: 9,
    attack: 7,
    defense: 7,
    type: CARD_TYPES.MINION,
    rarity: RARITY.MYTHIC,
    effect: [
      createEffect(EFFECT_TYPES.AOE_DAMAGE, 3, TARGETS.ALL_ENEMY_MINIONS, TRIGGERS.ON_DEATH),
      createEffect(EFFECT_TYPES.HEAL, 10, TARGETS.SELF_HERO, TRIGGERS.ON_DEATH),
      createEffect(EFFECT_TYPES.DRAW, 2, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Battlecry: Draw 2. Deathrattle: Deal 3 AoE + Heal 10. Undying flame.',
    icon: ICONS.eternal_phoenix,
    keywords: ['deathrattle', 'mythic'],
  },

  // --- ARCANE OVERLORD (8 mana) — Spell power supreme ---
  {
    id: 'arcane_overlord',
    name: 'Arcane Overlord',
    manaCost: 8,
    attack: 5,
    defense: 9,
    type: CARD_TYPES.MINION,
    rarity: RARITY.MYTHIC,
    effect: [
      createEffect(EFFECT_TYPES.BUFF_ALL_ATTACK, 2, TARGETS.ALL_FRIENDLY_MINIONS, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.BUFF_ALL_DEFENSE, 2, TARGETS.ALL_FRIENDLY_MINIONS, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.DRAW, 1, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Battlecry: All friendly minions gain +2/+2. Draw 1. Supreme archmage.',
    icon: ICONS.arcane_overlord,
    keywords: ['mythic'],
  },

  // --- SOUL REAPER (7 mana) — Life drain master ---
  {
    id: 'soul_reaper',
    name: 'Soul Reaper',
    manaCost: 7,
    attack: 6,
    defense: 6,
    type: CARD_TYPES.MINION,
    rarity: RARITY.MYTHIC,
    effect: [
      createEffect(EFFECT_TYPES.LIFESTEAL, 0, TARGETS.SELF, TRIGGERS.PASSIVE),
      createEffect(EFFECT_TYPES.DAMAGE, 4, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.HEAL, 4, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Lifesteal. Battlecry: Deal 4 to enemy hero + Heal 4. Harvester of souls.',
    icon: ICONS.soul_reaper,
    keywords: ['lifesteal', 'mythic'],
  },

  // --- GENESIS WYRM (9 mana) — Dragon that summons army ---
  {
    id: 'genesis_wyrm',
    name: 'Genesis Wyrm',
    manaCost: 9,
    attack: 8,
    defense: 8,
    type: CARD_TYPES.MINION,
    rarity: RARITY.MYTHIC,
    effect: [
      createEffect(EFFECT_TYPES.SUMMON, 3, TARGETS.SELF, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.BUFF_ALL_ATTACK, 1, TARGETS.ALL_FRIENDLY_MINIONS, TRIGGERS.START_OF_TURN),
    ],
    description: 'Battlecry: Summon 3 Skeletons. Start of Turn: All friendly +1 ATK. Primordial dragon.',
    icon: ICONS.genesis_wyrm,
    keywords: ['mythic'],
  },

  // --- OBLIVION SPELL (7 mana) — Ultimate destruction spell ---
  {
    id: 'oblivion_spell',
    name: 'Oblivion',
    manaCost: 7,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.MYTHIC,
    effect: [
      createEffect(EFFECT_TYPES.AOE_DAMAGE, 6, TARGETS.ALL_ENEMY_MINIONS, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.DAMAGE, 4, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Deal 6 damage to ALL enemy minions and 4 to enemy hero. Total annihilation.',
    icon: ICONS.oblivion_spell,
    keywords: ['mythic'],
  },

  // --- DIVINE WRATH (6 mana) — Holy nuke spell ---
  {
    id: 'divine_wrath',
    name: 'Divine Wrath',
    manaCost: 6,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.MYTHIC,
    effect: [
      createEffect(EFFECT_TYPES.DAMAGE, 8, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.SELF_DAMAGE, 3, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Deal 8 damage to enemy hero. Deal 3 to your hero. Judgment from above.',
    icon: ICONS.divine_wrath,
    keywords: ['mythic'],
  },

  // --- VOID DEVOURER (10 mana) — Board wipe + stats ---
  {
    id: 'void_devourer',
    name: 'Void Devourer',
    manaCost: 10,
    attack: 9,
    defense: 9,
    type: CARD_TYPES.MINION,
    rarity: RARITY.MYTHIC,
    effect: [
      createEffect(EFFECT_TYPES.AOE_DAMAGE, 8, TARGETS.ALL_ENEMY_MINIONS, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.SELF_DAMAGE, 8, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Battlecry: Deal 8 to ALL enemy minions. Deal 8 to your hero. Consume everything.',
    icon: ICONS.void_devourer,
    keywords: ['mythic'],
  },

  // ===== v0.4.1 — 4 MINI LEGENDARY CARDS (Total: 54) =====
  // Mini Legendary = Legendary rarity but cost 3-4 mana, ringan effect, untuk Bronze/Silver

  // --- BRONZE PHOENIX (3 mana) — Deathrattle: summon 1/1 token ---
  {
    id: 'bronze_phoenix',
    name: 'Bronze Phoenix',
    manaCost: 3,
    attack: 2,
    defense: 2,
    type: CARD_TYPES.MINION,
    rarity: RARITY.LEGENDARY,
    effect: createEffect(EFFECT_TYPES.SUMMON, 1, TARGETS.SELF, TRIGGERS.ON_DEATH),
    description: 'Deathrattle: Summon a 1/1 Skeleton. A tiny legendary.',
    icon: ICONS.bronze_phoenix,
    keywords: ['deathrattle', 'mini-legendary'],
  },

  // --- TINY ARCANE (3 mana, Spell) — Deal 3 damage + Draw 1 ---
  {
    id: 'tiny_arcane',
    name: 'Tiny Arcane',
    manaCost: 3,
    attack: 0,
    defense: 0,
    type: CARD_TYPES.SPELL,
    rarity: RARITY.LEGENDARY,
    effect: [
      createEffect(EFFECT_TYPES.DAMAGE, 3, TARGETS.ENEMY_HERO, TRIGGERS.ON_PLAY),
      createEffect(EFFECT_TYPES.DRAW, 1, TARGETS.SELF_HERO, TRIGGERS.ON_PLAY),
    ],
    description: 'Deal 3 damage to enemy hero. Draw 1 card. Small but mighty.',
    icon: ICONS.tiny_arcane,
    keywords: ['mini-legendary'],
  },

  // --- SILVER SHIELD (4 mana) — Give +2 Defense to friendly minion ---
  {
    id: 'silver_shield',
    name: 'Silver Shield',
    manaCost: 4,
    attack: 1,
    defense: 4,
    type: CARD_TYPES.MINION,
    rarity: RARITY.LEGENDARY,
    effect: createEffect(EFFECT_TYPES.BUFF_DEFENSE, 2, TARGETS.FRIENDLY_MINION, TRIGGERS.ON_PLAY),
    description: 'Battlecry: Give a friendly minion +2 Defense. Sturdy protector.',
    icon: ICONS.silver_shield,
    keywords: ['mini-legendary'],
  },

  // --- MINI REAPER (3 mana) — Lifesteal ---
  {
    id: 'mini_reaper',
    name: 'Mini Reaper',
    manaCost: 3,
    attack: 2,
    defense: 2,
    type: CARD_TYPES.MINION,
    rarity: RARITY.LEGENDARY,
    effect: createEffect(EFFECT_TYPES.LIFESTEAL, 0, TARGETS.SELF, TRIGGERS.PASSIVE),
    description: 'Lifesteal. A small but hungry soul collector.',
    icon: ICONS.mini_reaper,
    keywords: ['lifesteal', 'mini-legendary'],
  },
];

// Skeleton token (not in main pool, summoned by Corpse Raiser)
export const SKELETON_TOKEN = {
  id: 'skeleton_token',
  name: 'Skeleton',
  manaCost: 0,
  attack: 1,
  defense: 1,
  type: CARD_TYPES.MINION,
  rarity: RARITY.COMMON,
  effect: null,
  description: 'A reanimated skeleton.',
  icon: ICONS.skeleton_token,
  keywords: ['token'],
};

// Phoenix token (summoned by Phoenix Egg deathrattle)
export const PHOENIX_TOKEN = {
  id: 'phoenix_token',
  name: 'Phoenix',
  manaCost: 0,
  attack: 3,
  defense: 3,
  type: CARD_TYPES.MINION,
  rarity: RARITY.RARE,
  effect: null,
  description: 'A reborn phoenix from the ashes.',
  icon: ICONS.phoenix_token,
  keywords: ['token'],
};

// Revenant token (summoned by Resurrection spell)
export const REVENANT_TOKEN = {
  id: 'revenant_token',
  name: 'Revenant',
  manaCost: 0,
  attack: 3,
  defense: 3,
  type: CARD_TYPES.MINION,
  rarity: RARITY.COMMON,
  effect: null,
  description: 'A spirit summoned from beyond.',
  icon: ICONS.revenant_token,
  keywords: ['token'],
};

// Get a card definition by its ID
export function getCardById(cardId) {
  if (cardId === 'skeleton_token') return SKELETON_TOKEN;
  if (cardId === 'phoenix_token') return PHOENIX_TOKEN;
  if (cardId === 'revenant_token') return REVENANT_TOKEN;
  return CARD_DEFINITIONS.find((c) => c.id === cardId) || null;
}

// Get all card definitions (for deck building)
export function getAllCards() {
  return [...CARD_DEFINITIONS];
}

export default CARD_DEFINITIONS;
