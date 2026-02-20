import { CARD_TYPES, MAX_BOARD_SIZE } from '../data/constants';
import { EFFECT_TYPES, COMBO_BONUS } from '../data/effects';

/**
 * Score a card for AI decision making.
 * Higher score = AI wants to play it more.
 */
export function scoreCard(card, aiState, enemyState) {
  let score = 0;

  if (card.type === CARD_TYPES.MINION) {
    // Base value: ATK × 2 + DEF
    score = card.currentAttack * 2 + card.currentDefense;
  }

  // Evaluate effects
  if (card.effect) {
    const effects = Array.isArray(card.effect) ? card.effect : [card.effect];

    for (const effect of effects) {
      score += scoreEffect(effect, card, aiState, enemyState);
    }
  }

  // Situational bonuses
  score += situationalBonus(card, aiState, enemyState);

  // Mana efficiency bonus (prefer cards that use mana well)
  if (card.manaCost > 0) {
    score += (score / card.manaCost) * 0.5;
  }

  return score;
}

function scoreEffect(effect, card, aiState, enemyState) {
  let effectScore = 0;

  switch (effect.type) {
    case EFFECT_TYPES.DAMAGE:
      effectScore = effect.value * 2;
      // Extra value if enemy is low
      if (enemyState.hp <= effect.value) effectScore += 20; // lethal!
      break;

    case EFFECT_TYPES.HEAL:
      effectScore = effect.value * 1.5;
      // More valuable when low HP
      if (aiState.hp <= 10) effectScore += 5;
      if (aiState.hp <= 5) effectScore += 5;
      break;

    case EFFECT_TYPES.DRAW:
      effectScore = effect.value * 3;
      // Less valuable if hand is nearly full
      if (aiState.hand.length >= 6) effectScore -= 2;
      break;

    case EFFECT_TYPES.BUFF_ATTACK:
      effectScore = effect.value * 2 * Math.max(aiState.board.length, 1);
      break;

    case EFFECT_TYPES.BUFF_DEFENSE:
      effectScore = effect.value * 1.5;
      break;

    case EFFECT_TYPES.SHIELD:
      effectScore = effect.value * 1.5;
      break;

    case EFFECT_TYPES.LIFESTEAL:
      effectScore = 3;
      if (aiState.hp <= 15) effectScore += 3;
      break;

    case EFFECT_TYPES.AOE_DAMAGE:
      effectScore = effect.value * enemyState.board.length * 1.5;
      // Huge value against wide boards
      if (enemyState.board.length >= 3) effectScore += 8;
      break;

    case EFFECT_TYPES.SUMMON:
      effectScore = effect.value * 2;
      break;

    case EFFECT_TYPES.DESTROY:
      if (enemyState.board.length > 0) {
        // Value based on strongest enemy minion
        const maxEnemyATK = Math.max(...enemyState.board.map((m) => m.currentAttack), 0);
        effectScore = maxEnemyATK * 2 + 3;
      }
      break;

    case EFFECT_TYPES.SELF_DAMAGE:
      effectScore = -effect.value * 1.5;
      // Much worse if low HP
      if (aiState.hp <= effect.value + 5) effectScore -= 10;
      break;

    case EFFECT_TYPES.MANA_GAIN:
      effectScore = effect.value * 2;
      break;

    case EFFECT_TYPES.FREEZE:
      effectScore = 2;
      break;

    case EFFECT_TYPES.POISON:
      effectScore = effect.value * 1.5;
      break;

    case EFFECT_TYPES.BUFF_ALL_ATTACK:
      effectScore = effect.value * aiState.board.length * 2;
      break;

    case EFFECT_TYPES.BUFF_ALL_DEFENSE:
      effectScore = effect.value * aiState.board.length * 1.5;
      break;

    case EFFECT_TYPES.DAMAGE_PER_MINION:
      effectScore = effect.value * aiState.board.length * 1.5;
      break;

    case EFFECT_TYPES.HEAL_PER_MINION:
      effectScore = effect.value * aiState.board.length * 1.2;
      if (aiState.hp <= 15) effectScore *= 1.5;
      break;

    case EFFECT_TYPES.COPY_MINION:
      if (aiState.board.length > 0) {
        const avgATK = aiState.board.reduce((s, m) => s + m.currentAttack, 0) / aiState.board.length;
        effectScore = avgATK * 2 + 3;
      }
      break;

    case EFFECT_TYPES.STEAL_ATTACK:
      effectScore = effect.value * 2;
      break;

    case EFFECT_TYPES.DOUBLE_ATTACK:
      effectScore = 5;
      if (aiState.board.length > 0) {
        const maxATK = Math.max(...aiState.board.map((m) => m.currentAttack));
        effectScore += maxATK;
      }
      break;

    case EFFECT_TYPES.COMBO:
      // Combo value depends on bonus type and whether combo will activate
      if (effect.bonusType === COMBO_BONUS.EXTRA_DAMAGE) effectScore += effect.value * 1.5;
      else if (effect.bonusType === COMBO_BONUS.EXTRA_DRAW) effectScore += effect.value * 2;
      else if (effect.bonusType === COMBO_BONUS.EXTRA_STATS) effectScore += effect.value * 2;
      else if (effect.bonusType === COMBO_BONUS.EXTRA_HEAL) effectScore += effect.value;
      break;
  }

  return effectScore;
}

function situationalBonus(card, aiState, enemyState) {
  let bonus = 0;

  // If board is empty, prefer minions to establish presence
  if (aiState.board.length === 0 && card.type === CARD_TYPES.MINION) {
    bonus += 3;
  }

  // If hand is nearly full, prefer playing cheap cards
  if (aiState.hand.length >= 6 && card.manaCost <= 2) {
    bonus += 2;
  }

  // Check for lethal: if total board ATK + this card's effects >= enemy HP
  const totalBoardATK = aiState.board
    .filter((m) => m.canAttack && !m.exhausted)
    .reduce((sum, m) => sum + m.currentAttack, 0);

  let potentialDamage = totalBoardATK;
  if (card.type === CARD_TYPES.MINION) {
    // New minion can't attack this turn (summoning sickness)
    // But still valuable for next turn
  }

  // Direct damage spells contribute to lethal
  if (card.effect) {
    const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
    for (const effect of effects) {
      if (effect.type === EFFECT_TYPES.DAMAGE && effect.target === 'enemyHero') {
        potentialDamage += effect.value;
      }
    }
  }

  if (potentialDamage >= enemyState.hp) {
    bonus += 15; // Go for lethal!
  }

  // Prefer AoE when enemy has many minions
  if (enemyState.board.length >= 3) {
    const effects = card.effect ? (Array.isArray(card.effect) ? card.effect : [card.effect]) : [];
    if (effects.some((e) => e.type === EFFECT_TYPES.AOE_DAMAGE)) {
      bonus += 5;
    }
  }

  return bonus;
}

/**
 * Select which cards the AI should play this turn.
 * Returns cards in play order (highest scored first).
 */
export function selectCardsToPlay(hand, mana, aiState, enemyState) {
  const playableCards = hand
    .filter((card) => card.manaCost <= mana)
    .map((card) => ({
      card,
      score: scoreCard(card, aiState, enemyState),
    }))
    .sort((a, b) => b.score - a.score);

  const toPlay = [];
  let remainingMana = mana;
  let boardSpace = MAX_BOARD_SIZE - aiState.board.length;

  for (const { card, score } of playableCards) {
    if (card.manaCost > remainingMana) continue;
    if (card.type === CARD_TYPES.MINION && boardSpace <= 0) continue;
    if (score < 0) continue; // Don't play negative-value cards

    toPlay.push(card);
    remainingMana -= card.manaCost;
    if (card.type === CARD_TYPES.MINION) boardSpace--;
  }

  return toPlay;
}
